using System;
using System.Data;
using System.Configuration;
using System.Collections.Generic;
using System.Web;
using System.Text;
using System.Web.Security;
using System.Web.UI;
using System.Web.UI.WebControls;
using System.Web.UI.WebControls.WebParts;
using System.Web.UI.HtmlControls;
using System.Reflection;
using System.Web.Hosting;
using System.Xml.Serialization;
using System.IO;
using System.Linq;
using System.Xml.Linq;
using System.Threading;

using LMComLib;
using LMScormLib;
using LMNetLib;

namespace LMScormLibDOM {

  public class ExpressionQuery : LMScormObj {
    public ExpressionQuery(object obj, string query) {
      Obj = obj; Query = query;
    }
    public object Obj;
    public string Query;
  }

  public struct pageInfo {
    public string FileName;
    public string SpaceId;
    public string GlobalId;
    public ProductInfo ProdInfo;
    public CourseInfo CrsInfo;
    //public LMScormLib.ProjectInfo Project;
  }

  public partial class lm_scorm : LMScormObj {

    [LocalizedProperty(Type = LocalizeType.items2items), XmlIgnore]
    public object[] localItems;
    public override IEnumerable<object> GetChilds() {
      if (htmlTitleObj != null) yield return htmlTitleObj;
      object[] its = localItems == null ? Items : localItems;
      if (its == null) yield break;
      foreach (object obj in its)
        yield return obj;
    }

    //static string actRootKey = Guid.NewGuid().ToString();

    [XmlIgnore]
    public pageInfo PageInfo; // FileName;
    [XmlIgnore]
    public SiteMapNode SiteNode;
    [XmlIgnore]
    public page_instructions techInstr;

    [XmlIgnore]
    public LMGroupRoots Groups;
    [XmlIgnore]
    public Dictionary<string, eval_Type> evalGroupTypes;
    [XmlIgnore]
    public Dictionary<string, int> eqWidthGroupWidth;

    public void addEvalGroupType(string grpId, eval_Type type) {
      if (evalGroupTypes == null) evalGroupTypes = new Dictionary<string, eval_Type>();
      evalGroupTypes[grpId] = type;
    }

    public void addEqWidthGroupWidth(string grpId, int width) {
      if (eqWidthGroupWidth == null) eqWidthGroupWidth = new Dictionary<string, int>();
      eqWidthGroupWidth[grpId] = width;
    }

    public static void setActRoot(lm_scorm root) {
      EaUrlInfo.Instance.root = root;
      //HttpContext.Current.Items[actRootKey] = root;
    }
    public static lm_scorm getActRoot() {
      EaUrlInfo info = EaUrlInfo.Instance;
      if (info.root != null) return info.root;
      if (info.type != pageType.course) {
        info.root = new lm_scorm();
        lm_scorm.initFromUrl(info.oldUrl, out info.root.PageInfo);
      } else {
        info.root = LMDataReader.ReadThrowSiteMap(info.oldUrl);
      }
      info.root.SiteNode = info.CourseNode;
      return info.root;
    }

    public static ProductInfo getActProduct() {
      return getActRoot().PageInfo.ProdInfo;
    }
    public static CourseInfo getActCourse() {
      return getActRoot().PageInfo.CrsInfo;
    }
    public static string getActCourseId() {
      return getActCourse().Id.ToString().Replace('_', '-').Replace("Berlitz", null);
    }
    public override void finishTree(lm_scorm root) {
      base.finishTree(root);
      foreach (design_time dsgn in LMScormObj.GetAll(this, delegate(object o) { return o is design_time; })) {
        DesignTime = dsgn; break;
      }
    }
    public design_time DesignTime;

    public static string pageTitle(lm_scorm root, SiteMapNode nd) {
      if (root != null && root.SiteNode != null) nd = root.SiteNode;
      if (nd != null && !string.IsNullOrEmpty(nd.Title)) return nd.Title;
      if (root != null) return string.Format("[{0}].[{1}]", root.PageInfo.SpaceId, root.PageInfo.GlobalId);
      return "System Page";
    }

    public page CtrlPage {
      get {
        foreach (LMScormObj obj in Items)
          if (obj is page) return (page)obj;
        return null;
      }
    }

    public bool HasInstruction {
      get {
        foreach (techInstr_Type ins in new techInstr_Type[] { instr, instr2, instr3 })
          if (ins != techInstr_Type.no) return true;
        return false;
      }
    }

    public override object FindObj(string id) {
      if (id == "*")
        return Items.Length == 1 ? Items[0] : null;
      else
        return base.FindObj(id);
    }

    public static void decodeAbsoluteUrl(string url, out string spaceId, out string globalId) {
      url = url.Substring(HttpRuntime.AppDomainAppVirtualPath.Length + 1);
      string[] parts = url.Split(new char[] { '/' }, 2);
      spaceId = null; globalId = null;
      if (parts.Length == 1) {
        spaceId = null;
        globalId = parts[0].ToLowerInvariant();
      } else if (parts.Length == 2) {
        spaceId = parts[0].ToLowerInvariant();
        globalId = parts[1].ToLowerInvariant();
      }
    }

    public static string JSONToId(SiteMapNode nd) {
      if (nd == null) return "";
      string url = VirtualPathUtility.ToAppRelative(nd.Url);
      string[] parts = url.Split(new char[] { '/' }, 3);
      return LowUtils.JSONToId(parts[1], parts[2]);
    }


    public static void initFromUrl(string url, out pageInfo info) {
      info.FileName = url;
      decodeAbsoluteUrl(url, out info.SpaceId, out info.GlobalId);
      info.ProdInfo = ProductInfos.GetProduct(info.SpaceId);
      info.CrsInfo = ProductInfos.GetCourse(info.SpaceId);
    }

    public static string urlFromFileName(string fileName) {
      string url = HttpRuntime.AppDomainAppPath;
      url = fileName.Substring(url.Length, fileName.Length - url.Length);
      return url.Replace('\\', '/');
    }

    public static void infoFromFileName(string fileName, out pageInfo info) {
      info.SpaceId = null; info.GlobalId = null; info.ProdInfo = null; info.CrsInfo = null; info.FileName = fileName;
      string url = HttpRuntime.AppDomainAppPath;
      url = fileName.Substring(url.Length, fileName.Length - url.Length);
      url = url.Replace('\\', '/');
      int pos = url.IndexOf('.');
      pos = url.IndexOf('.', pos + 1);
      if (pos >= 0) url = url.Substring(0, pos);
      string[] parts = url.Split(new char[] { '/' }, 2);
      if (parts.Length == 1) {
        info.SpaceId = null;
        info.GlobalId = parts[0].ToLowerInvariant();
      } else if (parts.Length == 2) {
        info.SpaceId = parts[0].ToLowerInvariant();
        info.GlobalId = parts[1].ToLowerInvariant();
      } else return;
      info.ProdInfo = ProductInfos.GetProduct(info.SpaceId);
      info.CrsInfo = ProductInfos.GetCourse(info.SpaceId);
      //LMScormLib.CourseMan.Config.SpaceToProject.TryGetValue(info.SpaceId, out info.Project);
    }
    public override void AfterLoad() {
      base.AfterLoad();
      if (!LMScormLib.HTTPModule.Hack()) addTechInstr(instr, instr2, instr3);
      //Finalizace template
      if (PageInfo.SpaceId == "framework" && PageInfo.GlobalId.ToLowerInvariant().StartsWith("templates/") && File.Exists(PageInfo.FileName)) {
        string[] parts = PageInfo.GlobalId.ToLowerInvariant().Split(new char[] { '/', '.', '~' });
        template = (template_Type)Enum.Parse(typeof(template_Type), parts[1], true);
      }
    }
    public const string instructionFile = @"q:\LMNet2\WebApps\EduAuthorNew\framework\instructions\Instructions.lmdata";
    static Dictionary<Langs, Dictionary<techInstr_Type, page_instruction>> allInstrs;
    void addTechInstr(params techInstr_Type[] instrs) {
      if (HttpContext.Current == null || !instrs.Any (i => i!=techInstr_Type.no)) return;
      if (allInstrs == null)
        lock (this.GetType())
          if (allInstrs == null) {
            allInstrs = new Dictionary<Langs, Dictionary<techInstr_Type, page_instruction>>();
            foreach (Langs lng in CommonLib.smallLocalizations) {
              lm_scorm root = LMDataReader.ReadFromFileEx(instructionFile, true, delegate() {
                return TradosLib.LocalizeXmlLow(instructionFile, lng);
              });
              page pg = null;
              foreach (LMScormObj obj in root.Items)
                if (obj is page) {
                  pg = (page)obj;
                  break;
                }
              Dictionary<techInstr_Type, page_instruction> allInstr = new Dictionary<techInstr_Type, page_instruction>();
              foreach (LMScormObj instr in pg.Items) {
                if (!(instr is page_instruction)) continue;
                allInstr.Add(((page_instruction)instr).type, (page_instruction)instr);
              }
              allInstrs.Add (lng, allInstr);
            }
          }
      Langs actLang = (Langs)Enum.Parse(typeof(Langs), Thread.CurrentThread.CurrentUICulture.Name.Replace('-', '_'), true);
      if (actLang == Langs.es_es) actLang = Langs.sp_sp;
      Dictionary<techInstr_Type, page_instruction> data = allInstrs[actLang];
      foreach (techInstr_Type tp in instrs) {
        if (tp == techInstr_Type.no) continue;
        if (techInstr == null) techInstr = new page_instructions();
        techInstr.Instrs.Add(data[tp]);
      }
    }
  }

  public partial class html_items : LMScormObj {
  }

  public partial class html : LMScormObj {
    [LocalizedProperty(Type = LocalizeType.items2string), XmlIgnore]
    public LMLiteral localItems;
    public string HtmlText {
      get { return LMLiteral.getText(localItems); }
    }
  }

  public partial class selection_item : LMScormObj {
    public selection_item(check_item item) {
      this.item = item;
    }
    check_item item;
    public check_item Item {
      get { return item; }
      set { item = value; }
    }
    public override IEnumerable<object> GetChilds() {
      if (item != null)
        yield return item;
    }
  }

  public partial class selection : LMScormObj {
    [XmlIgnore]
    public LMGroupEval GroupEval;
    [XmlIgnore]
    public selection_item[] _items;

    public override void addChildProperties(childProperties props) {
      props.Add(new childProperties.childProperty(this, "check_item", "group_eval", varName));
      if (type == check_itemType.no) type = check_itemType.checkBox;
      props.Add(new childProperties.childProperty(this, "check_item", "type", type.ToString()));
      if (type == check_itemType.radioButton)
        props.Add(new childProperties.childProperty(this, "eval_group", eval_Type.And.ToString(), varName));
    }
    public override IEnumerable<object> GetChilds() {
      if (htmlTitleObj != null) yield return htmlTitleObj;
      if (_items == null) {
        if (Items == null) yield break;
        foreach (object obj in Items) yield return obj;
        yield break;
      }
      foreach (object obj in _items) yield return obj;
    }

    public override void finishTree(lm_scorm root) {
      base.finishTree(root);
      if (Items == null || Items.Length == 0) return;
      if (type == check_itemType.no) type = check_itemType.checkBox;
      int cnt = 0;
      _items = new selection_item[Items.Length];
      for (int i = 0; i < _items.Length; i++) {
        check_item chi = Items[i];
        _items[i] = new selection_item(chi);
        chi.type = type;
        if (type == check_itemType.radioButton && chi.correct) cnt++;
      }
      if (type == check_itemType.radioButton && cnt != 1)
        throw new Exception(string.Format("Just one selection.check_item with correct=true allowed {0}", ErrorId));
    }
  }

  public partial class check_item : LMScormObj {
    [LocalizedProperty(Type = LocalizeType.items2string), XmlIgnore]
    public LMLiteral localItems;
    public override string Title {
      get { return base.Title + LMLiteral.getText(localItems); }
    }
    [XmlIgnore]
    public LMGroupEval GroupEval;
    public override void AfterLoad() {
      base.AfterLoad();
      if (type == check_itemType.no) type = check_itemType.checkBox;
      if (init_value == check_itemInit_value.no) init_value = check_itemInit_value.Unchecked;
    }
  }

  public partial class page_instruction : LMScormObj {
    [LocalizedProperty(Type = LocalizeType.items2items), XmlIgnore]
    public object[] localItems;
    public override IEnumerable<object> GetChilds() {
      object[] its = localItems == null ? Items : localItems;
      if (its != null)
        foreach (object obj in its)
          yield return obj;
    }
  }

  public partial class page_instructions : LMScormObj {
    public List<page_instruction> Instrs = new List<page_instruction>();
    public override IEnumerable<object> GetChilds() {
      foreach (page_instruction instr in Instrs)
        yield return instr;
    }

  }

  public partial class gap_fill : LMScormObj {
    [XmlIgnore]
    public bool isFake; //pro Classification: fake gap_fill, pridany kvuli spolecne delce
    [LocalizedProperty, XmlIgnore]
    public LMLiteral localcorrect;
    [LocalizedProperty, XmlIgnore]
    public LMLiteral localinit_value;
    [LocalizedProperty, XmlIgnore]
    public LMLiteral localdrag_source;
    [XmlIgnore]
    public bool crossWordMember;
    [XmlIgnore]
    public gap_fill_source drag_target;
    public int maxChars() {
      string[] parts = LMScormLib.ControlHelper.splitDels(LMLiteral.getText(localcorrect));
      int max = 0;
      if (parts.Length > 0) {
        foreach (string s in parts)
          max = Math.Max(max, LMScormLib.CharWidth.emWidth(s));
      }
      max = Math.Max(max, LMScormLib.CharWidth.emWidth(LMLiteral.getText(localinit_value)));
      return max + 1;
    }
    public override void finishTreeBeforeLocalize(lm_scorm root) {
      if (correct != null) correct = LMScormLib.OtherLib.NormalizeString(correct.Trim());
      if (init_value != null) init_value = LMScormLib.OtherLib.NormalizeString(init_value.Trim());
    }
    public override void AfterLoad() {
      base.AfterLoad();
      crossWordMember = Owner is cross_cell;
    }
  }
  public partial class gap_fill_source : LMScormObj {
    [XmlIgnore]
    public List<gap_fill> gapFills;
    public override void addChildProperties(childProperties props) {
      if (this.type != gap_fill_sourceType.Text)
        props.Add(new childProperties.childProperty(Root, "gap_fill", "group_eq_width", varName));
      if (case_sensitive)
        props.Add(new childProperties.childProperty(Root, "gap_fill", "eval_mode", "caseSensitive"));
    }

    public string getText(gap_fill gf) {
      return LMLiteral.getText(gf.localdrag_source == null ? gf.localcorrect : gf.localdrag_source).Replace(" ", "&nbsp;");
    }

    public override void AfterLoad() {
      base.AfterLoad();
      IEnumerable<object> gfs = LMScormObj.GetAll(Root, delegate(object o) { return o is gap_fill; });
      if (type != gap_fill_sourceType.Text)
        foreach (gap_fill gf in gfs) { gf.drag_target = this; gf.localdrag_source = null; }
      //if (type == gap_fill_sourceType.Text) return;
      gapFills = new List<gap_fill>();
      Dictionary<string, bool> values = (this.type == gap_fill_sourceType.DragAll) ? null : new Dictionary<string, bool>();
      foreach (gap_fill gf in gfs) {
        if (gf.example) continue;
        string val = null;
        if (gf.localdrag_source == null) {
          val = LMLiteral.getText(gf.localcorrect);
          if (string.IsNullOrEmpty(val)) continue;
          if (!case_sensitive) val = val.ToLower();
          string[] parts = LMScormLib.ControlHelper.splitDels(val);
          if (parts.Length > 1) throw new Exception(string.Format("Drag target GapFill must have only single correct value {0}", gf.ErrorId));
        } else
          val = LMLiteral.getText(gf.localdrag_source);
        if (values != null && values.ContainsKey(val)) continue;
        gapFills.Add(gf);
        if (values != null) values.Add(val, true);
      }
      //2x projdi cely seznam a vymen j-ty a random-ty prvek
      Random r = new Random();
      for (int i = 0; i < 2; i++)
        for (int j = 0; j < gapFills.Count; j++) {
          int idx = r.Next(gapFills.Count);
          if (j == idx) continue;
          gap_fill buf = gapFills[idx]; gapFills[idx] = gapFills[j]; gapFills[j] = buf;
        }
    }
    public string gapFillArray() {
      StringBuilder sb = new StringBuilder();
      foreach (gap_fill gf in gapFills) {
        sb.Append("$get('"); sb.Append(dragItemId(gf)); sb.Append("'),");
      }
      if (sb.Length > 0) sb.Length = sb.Length - 1;
      return sb.ToString();
    }
    public string dragItemId(gap_fill gf) {
      return varName + "_" + gf.varName;
    }
  }

  public abstract class RichHtmlLow : LMScormObj {
    public virtual object[] GetItems() {
      return null;
    }
    public override IEnumerable<object> GetChilds() {
      if (GetItems() != null)
        foreach (object obj in GetItems())
          yield return obj;
    }

  }

  public class Ordering : LMScormObj {
    /*public override string behaviorName()
    {
      return "ordering";
    }*/
    [XmlIgnore]
    public LMGroupEval GroupEval;
    [XmlIgnore]
    public OrderItem[] OrderItems;
    [XmlIgnore]
    public string DisplayIndexes;
    public override IEnumerable<object> GetChilds() {
      if (OrderItems == null) {
        if (this is word_ordering) {
          word_ordering so = (word_ordering)this;
          foreach (object h in so.Items) yield return h;
        } else if (this is sentence_ordering) {
          sentence_ordering so = (sentence_ordering)this;
          foreach (object h in so.Items) yield return h;
        } else if (this is pairing) {
          pairing pa = (pairing)this;
          foreach (object h in pa.Items) yield return h;
        }
      } else
        foreach (object obj in OrderItems)
          yield return obj;
    }
    static Random randomObj = new Random();
    protected void fillDisplayIndexes() {
      if (HttpContext.Current == null) return;
      int cnt = OrderItems.Length;
      int[] res = new int[cnt];
      for (int i = 0; i < res.Length; i++)
        res[i] = i;
      //prochazej cely seznam, dokud jsou vsechny prvky prehazeny
      if (res.Length > 1)
        while (true) {
          for (int j = 0; j < res.Length; j++) {
            int idx = randomObj.Next(cnt);
            if (j == idx) continue;
            int buf = res[idx]; res[idx] = res[j]; res[j] = buf;
          }
          int inPlaceCnt = 0;
          for (int j = 0; j < res.Length; j++)
            if (res[j] == j) inPlaceCnt++;
          //if (inPlaceCnt <= 1) break;
          //PZ Bug 226, 1.9.07 - zadny prvek nesmi byt na svem miste
          if (inPlaceCnt == 0) break;
        }
      for (int i = 0; i < res.Length; i++) {
        if (DisplayIndexes != null) DisplayIndexes += ",";
        DisplayIndexes += res[i].ToString();
      }
    }

    static char[] del = new char[] { '\n', '\r' };
    protected void doFinishTree(LMLiteral localItems) {
      string txt = LMLiteral.getText(localItems);// html.HtmlText;
      string[] parts = txt.Split(del, StringSplitOptions.RemoveEmptyEntries);
      List<OrderItem> strs = new List<OrderItem>();
      for (int i = 0; i < parts.Length; i++) {
        string s = parts[i].Trim(' ');
        if (string.IsNullOrEmpty(s)) continue;
        strs.Add(new OrderItem(i, this, s));
      }
      OrderItems = new OrderItem[strs.Count];
      strs.CopyTo(OrderItems);
      fillDisplayIndexes();
    }

  }

  public partial class word_ordering : Ordering {
    [LocalizedProperty(Type = LocalizeType.items2string), XmlIgnore]
    public LMLiteral localItems;

    public override void finishTree(lm_scorm root) {
      base.finishTree(root);
      doFinishTree(localItems);
    }

  }

  public partial class sentence_ordering : Ordering {
    [LocalizedProperty(Type = LocalizeType.items2string), XmlIgnore]
    public LMLiteral localItems;

    public override void finishTree(lm_scorm root) {
      base.finishTree(root);
      doFinishTree(localItems);
    }
  }

  public class OrderItem : LMScormObj {
    /*public override string behaviorName()
    {
      return "orderItem";
    }*/
    public OrderItem() : base() { }
    public OrderItem(int correct, LMScormObj owner, string orderText) {
      this.correct = correct;
      this.orderText = orderText;
      this.Owner = owner;
    }
    string orderText;
    public virtual string OrdedText {
      get { return orderText; }
    }
    [XmlIgnore]
    public override int UniqueId {
      get { return base.UniqueId; }
      set { uniqueId = value; }
    }
    private int correct;
    [XmlIgnore]
    public int Correct {
      get { return correct; }
      set { correct = value; }
    }
  }

  public partial class pairingItem : OrderItem {
    public LMScormObj LeftPart {
      get { return (LMScormObj)Item; }
    }
    public override string OrdedText {
      get { return html.HtmlText; }
    }

    public override IEnumerable<object> GetChilds() {
      if (html != null) yield return html;
      if (Item != null) yield return Item;
    }
    public override IEnumerable<object> ExpandChildControlsChilds() {
      if (Item != null) yield return Item;
    }
  }


  public partial class pairing : Ordering {
    public override void AfterLoad() {
      base.AfterLoad();
      OrderItems = new OrderItem[Items.Length];
      for (int i = 0; i < Items.Length; i++) {
        OrderItems[i] = Items[i];
        OrderItems[i].Correct = i;
      }
      fillDisplayIndexes();
    }
  }

  public partial class list_data : LMScormObj {
  }

  /*public partial class gap_fill_set : RichHtmlLow
  {
    //Lokalizace je pred AfterLoad, takze nedojde k navyseni poctu gapfillu v Classification.AfterLoad
    //[LocalizedProperty(Type = LocalizeType.items2items), XmlIgnore]
    //public object[] localItems;
    public override object[] GetItems()
    {
      //return localItems == null ? Items : localItems;
      return Items;
    }
  }*/

  /*public class classificationItem : LMScormObj
  {
    public classificationItem(gap_fill item, LMScormObj owner)
      : base()
    {
      this.item = item; this.Owner = owner; item.Owner = this;
    }
    public gap_fill item;
    public override IEnumerable<object> GetChilds()
    {
      yield return item;
    }
  }*/

  public partial class classification : LMScormObj {
    table table;

    public override IEnumerable<object> GetChilds() {
      //if (newItems != null)
      //foreach (classificationItem o in newItems) yield return o;
      if (htmlTitleObj != null) yield return htmlTitleObj;
      if (table != null)
        yield return table;
      else
        foreach (gap_fill gf in Items) yield return gf;
    }

    public override void addChildProperties(childProperties props) {
      props.Add(new childProperties.childProperty(this, "gap_fill", "group_set", varName));
      props.Add(new childProperties.childProperty(this, "gap_fill", "height", gap_fillHeight.doubleLine.ToString()));
      props.Add(new childProperties.childProperty(this, "gap_fill", "inline", "false"));
    }

    public override void finishTree(lm_scorm root) {
      base.finishTree(root);
      //maximalni delka classifications se stejnou group
      int max = 0;
      foreach (classification cl in LMScormObj.GetAll(root, delegate(object obj) { return (obj is classification) && ((classification)obj).group == group; }))
        max = Math.Max(cl.Items.Length, max);
      //prenes GapFills
      LMScormObj[] newGf = new LMScormObj[max + 1];
      for (int i = 0; i < Items.Length; i++)
        newGf[i + 1] = Items[i];
      for (int i = Items.Length; i < max; i++) {
        gap_fill gf = new gap_fill();
        gf.isFake = true;
        gf.id = id + i.ToString();
        newGf[i + 1] = gf;
      }
      //prvni radek tabulky:
      if (htmlTitleObj != null) newGf[0] = htmlTitleObj;
      else {
        html ht = new html();
        newGf[0] = ht;
        ht.localItems = localtitle;
      }
      table = new table();
      table.Items = newGf;
      table.border = true;
      table.col_header = true;
      table.grid = tableGrid.thin;
      table.finishTreeBeforeLocalize(root);
    }

  }

  public partial class design_time : LMScormObj {
    [XmlIgnore]
    public List<LMLiteral> titles;
    [XmlIgnore]
    public Dictionary<techInstr_Type, bool> instrs;
    public override IEnumerable<object> GetChilds() {
      if (Item != null)
        yield return Item;
    }
    public bool TitleOK(lm_scorm root) {
      foreach (string tit in AllTitles(root.PageInfo.ProdInfo.Lang))
        if (root.title == "$trans;" + tit) return true;
      return false;
    }
    public System.Collections.IEnumerable AllTitles(string lang) {
      foreach (LMLiteral lit in titles)
        if (lit.Extension != null) yield return lit.Extension.text(lang);
    }
    public override void AfterLoad() {
      base.AfterLoad();
      titles = new List<LMLiteral>();
      foreach (LMLiteral tit in new LMLiteral[] { localtitle, localtitle2, localtitle3, localtitle4, localtitle5, localtitle6, localtitle7, localtitle8, localtitle9, localtitle10 })
        if (tit != null && !string.IsNullOrEmpty(tit.Text))
          titles.Add(tit);
      instrs = new Dictionary<techInstr_Type, bool>();
      foreach (techInstr_Type ins in new techInstr_Type[] { instr, instr2, instr3, instr4, instr5 })
        if (ins != techInstr_Type.no) instrs.Add(ins, true);
    }
    [LocalizedProperty, XmlIgnore]
    public LMLiteral localtitle2;
    [LocalizedProperty, XmlIgnore]
    public LMLiteral localtitle3;
    [LocalizedProperty, XmlIgnore]
    public LMLiteral localtitle4;
    [LocalizedProperty, XmlIgnore]
    public LMLiteral localtitle5;
    [LocalizedProperty, XmlIgnore]
    public LMLiteral localtitle6;
    [LocalizedProperty, XmlIgnore]
    public LMLiteral localtitle7;
    [LocalizedProperty, XmlIgnore]
    public LMLiteral localtitle8;
    [LocalizedProperty, XmlIgnore]
    public LMLiteral localtitle9;
    [LocalizedProperty, XmlIgnore]
    public LMLiteral localtitle10;
  }

  public class cross_line : LMScormObj {
    public cross_cell[] cells;
    public cross_line(cross_word cw, List<string> data, ref int count) {
      cells = new cross_cell[data.Count];
      for (int i = 0; i < data.Count; i++)
        cells[i] = new cross_cell(cw, data[i], ref count);
    }
    public override IEnumerable<object> GetChilds() {
      if (cells == null) yield break;
      foreach (cross_cell cell in cells)
        yield return cell;
    }
  }
  public enum cross_cell_Type {
    empty, //prazdny cell
    header, //oznaceni sloupclu nebo radku
    normal, //normalni cell
    answer, //navic tajenka
  }
  public enum cross_cell_Delimiter {
    no, //zadny
    right, //velvo
    bottom, //dole
    both, //vlevo i dole
  }
  public class cross_cell : LMScormObj {
    public LMGroupEval GroupEval;
    cross_word crossWord;
    public cross_cell_Type type;
    public cross_cell_Delimiter delimiter;
    public string value = null;
    public string group_eval {
      get { return (type == cross_cell_Type.answer || type == cross_cell_Type.normal ? null : "null"); }
    }
    public cross_cell(cross_word cw, string data, ref int count) {
      data = HttpUtility.HtmlDecode(data);
      crossWord = cw;
      if (data == "-") { type = cross_cell_Type.empty; return; }
      if (data.IndexOf('@') >= 0) {
        type = cross_cell_Type.header;
        data = data.Trim(new char[] { '@' });
        value = data;
        //if (data.Length == 1) value = data[0];
        return;
      }
      type = data.IndexOf('*') >= 0 ? cross_cell_Type.answer : cross_cell_Type.normal;
      if (data.IndexOf('_') >= 0)
        delimiter = data.IndexOf('|') >= 0 ? cross_cell_Delimiter.both : cross_cell_Delimiter.bottom;
      else
        delimiter = data.IndexOf('|') >= 0 ? cross_cell_Delimiter.right : cross_cell_Delimiter.no;
      data = data.Trim(new char[] { '*', '_', '|', '@' });
      if (data.Length != 1) throw new Exception();
      value = data;
      count++;
      this.varNameLow = string.Format("{0}{1}", cw.varName, count);
    }
  }
  public partial class cross_word : LMScormObj {
    [XmlIgnore]
    public cross_line[] Lines;
    [XmlIgnore]
    public LMGroupEval GroupEval;
    string header(crossWordHeader_Type type, int i, out string value) {
      value = null;
      if (type == crossWordHeader_Type.no) return null;
      if (type == crossWordHeader_Type.number) value = "@" + (i + 1).ToString();
      else {
        char ch = Convert.ToChar(Convert.ToInt32('A') + i);
        value = "@" + Convert.ToString(ch);
      }
      return value;
    }
    public override void finishTreeBeforeLocalize(lm_scorm root) {
      base.finishTree(root);
      LMLiteral lit = (LMLiteral)Item;
      if (lit == null || string.IsNullOrEmpty(lit.text)) return;
      //matice tvorici krizovku
      string txt = lit.text.Replace('\r', ' ');
      string[] lines = txt.Split(new string[] { "\n" }, StringSplitOptions.RemoveEmptyEntries);
      List<List<string>> data = new List<List<string>>();
      int max = 0; string headerStr; int count = 0;
      for (int i = 0; i < lines.Length; i++) {
        string str = lines[i].Trim(); if (string.IsNullOrEmpty(str)) continue;
        List<string> line = new List<string>();
        string[] cells = str.Split(new char[] { ' ' }, StringSplitOptions.RemoveEmptyEntries);
        line.AddRange(cells);
        if (header(row_header, i, out headerStr) != null) line.Insert(0, headerStr);
        data.Add(line);
        max = Math.Max(max, line.Count);
      }
      //doplneni radku na stejnou delku
      for (int i = 0; i < data.Count; i++)
        if (data[i].Count < max)
          for (int j = data[i].Count; j < max; j++)
            data[i].Add("-");
      //col_Header?
      if (col_header != crossWordHeader_Type.no) {
        List<string> line = new List<string>();
        if (row_header != crossWordHeader_Type.no) line.Add("@");
        for (int i = 0; i < (row_header != crossWordHeader_Type.no ? max - 1 : max); i++)
          line.Add(header(col_header, i, out headerStr));
        data.Insert(0, line);
      }
      //vyplneni 
      Lines = new cross_line[data.Count];
      for (int i = 0; i < data.Count; i++)
        Lines[i] = new cross_line(this, data[i], ref count);
    }
    public override IEnumerable<object> GetChilds() {
      if (Lines == null) {
        if (Item != null)
          yield return Item;
      } else {
        foreach (cross_line line in Lines)
          yield return line;
      }
    }
  }

  public partial class make_word : LMScormObj {
    table table;

    public override IEnumerable<object> GetChilds() {
      if (table != null)
        yield return table;
      else
        yield return Item;
    }

    public override void addChildProperties(childProperties props) {
      props.Add(new childProperties.childProperty(this, "check_item", "type", "checkBox"));
      props.Add(new childProperties.childProperty(this, "check_item", "group_eval", varName));
      props.Add(new childProperties.childProperty(this, "check_item", "layout", "selectWord"));
    }

    check_item createCheckItem(string s, int i) {
      check_item res = new check_item();
      res.correct = s.IndexOf('+') > 0;
      if (res.correct) s = s.Trim('+');
      //if (s.Length != 1) throw new Exception(string.Format("Only single letter in cell alowed {0}", ErrorId));
      res.title = string.Format("&nbsp;{0}&nbsp;", s);
      res.varNameLow = varName + i.ToString();
      return res;
    }

    public override void finishTreeBeforeLocalize(lm_scorm root) {
      base.finishTree(root);
      LMLiteral lit = (LMLiteral)Item;
      if (lit == null || string.IsNullOrEmpty(lit.text)) return;
      //matice tvorici krizovku
      string txt = lit.text.Replace('\r', ' ').Trim();
      string[] lines = txt.Split(new string[] { "\n" }, StringSplitOptions.RemoveEmptyEntries);
      table = new table();
      table.Items = new object[lines.Length];
      for (int i = 0; i < lines.Length; i++) table.Items[i] = new row();
      int max = 0; int count = 0;
      for (int i = 0; i < lines.Length; i++) {
        string str = lines[i].Trim();
        if (string.IsNullOrEmpty(str)) throw new Exception(string.Format("Empty row not allowed {0}", ErrorId));
        string[] cells = str.Split(new char[] { ' ' }, StringSplitOptions.RemoveEmptyEntries);
        if (max == 0) max = cells.Length;
        else if (max != cells.Length) throw new Exception(string.Format("All rows have to have the same number of cells {0}", ErrorId));
        row rw = (row)table.Items[i];
        rw.Items = new object[max];
        for (int j = 0; j < max; j++)
          rw.Items[j] = createCheckItem(cells[j], count++);
      }
      table.border = true;
      table.grid = tableGrid.thin;
      table.flow = flow_type.left;
      table.finishTreeBeforeLocalize(root);
      //table.padding = colPadding.right;
    }

  }

  public partial class flash : LMScormObj {
  }

  public partial class silverlight : LMScormObj {
  }

  public partial class video : LMScormObj {
  }

}
