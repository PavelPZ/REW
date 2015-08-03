using System;
using System.Data;
using System.Linq;
using System.Configuration;
using System.Collections.Generic;
using System.Web;
using System.Web.Security;
using System.Web.UI;
using System.Web.UI.WebControls;
using System.Web.UI.WebControls.WebParts;
using System.Web.UI.HtmlControls;
using System.Reflection;
using System.Web.Hosting;
using System.Xml;
using System.Text;
using System.Xml.Serialization;
using System.IO;

namespace LMScormLibDOM {

  public class HideTextMan {
    public const string soundHideMarkIdStart = "hidetext_";
  }

  public class childProperties : List<childProperties.childProperty> {
    public class childProperty {
      public childProperty(LMScormObj obj, string code) {
        owner = obj;
        int idx1 = code.IndexOf('-');
        int idx2 = code.IndexOf(':');
        if (idx1 < 0 || idx2 < 0)
          throw new Exception();
        filter = code.Substring(0, idx1);
        name = code.Substring(idx1 + 1, idx2 - idx1 - 1);
        value = code.Substring(idx2 + 1);
        if (value == "@this") value = obj.varName;
      }
      public childProperty(LMScormObj owner, string filter, string name, string value) {
        this.owner = owner; this.filter = filter; this.name = name; this.value = value;
      }
      public string filter;
      public string name;
      public string value;
      public LMScormObj owner;
    }

    public new void Add(childProperty item) {
      //Sance predzpracovat properties, ktere nepatri objektu ale grupam
      switch (item.filter) {
        case "eval_group":
          item.owner.Root.addEvalGroupType(item.value, (eval_Type)Enum.Parse(typeof(eval_Type), item.name));
          break;
        case "group_eq_width":
          item.owner.Root.addEqWidthGroupWidth(item.value, int.Parse(item.name));
          break;
        default: base.Add(item); ; break;
      }
    }

    bool addAttrs(lm_scorm root, LMScormObj obj) {
      PropertyInfo prop = obj.GetType().GetProperty("child_attrs");
      int oldCount = Count;
      if (prop != null) {
        string val = (string)prop.GetValue(obj, null);
        if (!string.IsNullOrEmpty(val)) {
          string[] parts = val.Split(new char[] { ';', ' ' }, StringSplitOptions.RemoveEmptyEntries);
          if (parts.Length <= 0) return false;
          foreach (string s in parts)
            try { Add(new childProperty(obj, s)); } catch { throw new Exception(string.Format("Error in childAttrs attribute, value={0} {1}.", s, obj.ErrorId)); }
        }
      }
      obj.addChildProperties(this);
      return Count > oldCount;
    }
    void removeAttrs(LMScormObj obj) {
      for (int i = Count - 1; i >= 0; i--)
        if (this[i].owner == obj)
          RemoveAt(i);
    }
    void applyAttrs(lm_scorm root, LMScormObj obj) {
      foreach (childProperty pr in this) {
        /*if (pr.filter == "eval_group")
        {
          root.addEvalGroupType(pr.value, (eval_Type) Enum.Parse(typeof(eval_Type), pr.id));
          continue;
        }*/
        if (pr.filter != "all" && string.Compare(pr.filter, obj.GetType().Name) != 0
          && (pr.filter != "sound_sentence" || obj.GetType() != typeof(sound_sentences))/*hack: sentences se rozpada na sentence az v afterload*/) continue;
        PropertyInfo prop = obj.GetType().GetProperty(pr.name);
        if (prop == null) continue;
        if (prop.PropertyType == typeof(string)) {
          if (prop.GetValue(obj, null) == null) prop.SetValue(obj, pr.value, null);
        } else if (prop.PropertyType == typeof(int)) {
          if (((int)prop.GetValue(obj, null)) != 0) prop.SetValue(obj, int.Parse(pr.value), null);
        } else if (prop.PropertyType == typeof(sound_sentencesFile)) {
          prop.SetValue(obj, Enum.Parse(typeof(sound_sentencesFile), pr.value), null);
        } else if (prop.PropertyType == typeof(sentenceStyle_Type)) {
          if (((sentenceStyle_Type)prop.GetValue(obj, null)) == sentenceStyle_Type.no) prop.SetValue(obj, Enum.Parse(typeof(sentenceStyle_Type), pr.value), null);
        } else if (prop.PropertyType == typeof(check_itemType)) {
          if (((check_itemType)prop.GetValue(obj, null)) == check_itemType.no) prop.SetValue(obj, Enum.Parse(typeof(check_itemType), pr.value), null);
        } else if (prop.PropertyType == typeof(check_itemLayout)) {
          prop.SetValue(obj, Enum.Parse(typeof(check_itemLayout), pr.value), null);
        } else if (prop.PropertyType == typeof(check_itemInit_value)) {
          if (((check_itemInit_value)prop.GetValue(obj, null)) == check_itemInit_value.no) prop.SetValue(obj, Enum.Parse(typeof(check_itemInit_value), pr.value), null);
        } else if (prop.PropertyType == typeof(gapFillEval_Mode)) {
          if (((gapFillEval_Mode)prop.GetValue(obj, null)) == gapFillEval_Mode.no) prop.SetValue(obj, Enum.Parse(typeof(gapFillEval_Mode), pr.value), null);
        } else if (prop.PropertyType == typeof(gap_fillHeight)) {
          if (((gap_fillHeight)prop.GetValue(obj, null)) == gap_fillHeight.no) prop.SetValue(obj, Enum.Parse(typeof(gap_fillHeight), pr.value), null);
        } else if (prop.PropertyType == typeof(bool)) {
          prop.SetValue(obj, bool.Parse(pr.value), null);
        } else
          throw new Exception(string.Format("Missing code here for {0} property type", prop.PropertyType.Name));
      }
    }
    public void Process(lm_scorm root, LMScormObj obj) {
      applyAttrs(root, obj);
      bool hasAttr = addAttrs(root, obj);
      foreach (LMScormObj subObj in obj.GetChilds())
        Process(root, subObj);
      if (hasAttr) removeAttrs(obj);
    }
  }

  public enum LMGroupType {
    eval,
    hideText,
    sound,
    gapFillEqWidth,
    last
  }

  public class LMGroup : List<object> {
    public LMGroup(string id, LMGroupType type) {
      Id = id; Type = type;
    }
    public LMGroupType Type;
    public string Id;
    public LMGroup Owner;
    public static LMGroup create(string id, LMGroupType type) {
      switch (type) {
        case LMGroupType.eval: return new LMGroupEval(id, type);
        case LMGroupType.sound: return new LMGroupSound(id, type);
        case LMGroupType.hideText: return new LMGroupHideText(id, type);
        default: return new LMGroup(id, type);
      }
    }
  }

  public class LMGroupEval : LMGroup {
    public LMGroupEval(string id, LMGroupType type) : base(id, type) { }
    public eval_Type EvalType;
  }

  public class LMGroupHideText : LMGroup {
    public LMGroupHideText(string id, LMGroupType type) : base(id, type) { }
    public hide_text_mark mark;
  }

  public class LMGroupSound : LMGroup {
    public LMGroupSound(string id, LMGroupType type) : base(id, type) { }
    public SoundLow sound;
    public sound_mark mark;
    public string varName; //pro interval
    public LMScormLib.Markers markers; //pro interval
    public void adjustIntervals(lm_scorm root) {
      List<LMGroupSound> intervals = new List<LMGroupSound>();
      LMScormLib.Markers lastMark = null;
      int lastIdx = -1;
      LMGroupSound lastInterval = null;
      foreach (sound_sentence sent in this.OfType<sound_sentence>()) {
        if (lastInterval == null || lastMark != sent.FileMarkers || lastIdx + 1 != sent.markIdx) {
          lastInterval = new LMGroupSound(null, LMGroupType.sound); intervals.Add(lastInterval);
          lastInterval.Owner = this;
          lastInterval.sound = sound; lastInterval.mark = mark;
          lastInterval.markers = sent.FileMarkers;
          lastMark = sent.FileMarkers;
          lastInterval.varName = LMScormObj.adjustVarName(root.getUniqueId());
        }
        lastInterval.Add(sent);
        lastIdx = sent.markIdx;
        sent.GroupSound = lastInterval;
      }
      Clear();
      foreach (LMGroupSound grp in intervals) Add(grp);
    }
  }

  public class LMGroupRoots {
    public const string rootGroupId = "root";

    public LMGroup[] Roots = new LMGroup[(int)LMGroupType.last];

    public static bool isPassive(lm_scorm root) {
      if (root == null || root.Groups == null) return true;
      if (root.SiteNode != null && (root.SiteNode["forcePassive"] == "true")) return true;
      LMGroupEval evalRoot = (LMGroupEval)root.Groups.Roots[(int)LMGroupType.eval];
      if (evalRoot == null) return true;
      foreach (LMScormObj obj in allEvalScormObj(evalRoot))
        if (obj.GetType() != typeof(LMScormObj)) return false;
      return true;
    }

    static IEnumerable<LMScormObj> allEvalScormObj(LMGroupEval grp) {
      foreach (object obj in grp)
        if (obj is LMScormObj) yield return (LMScormObj)obj;
        else
          foreach (LMScormObj scorm in allEvalScormObj((LMGroupEval)obj))
            yield return scorm;
    }

    IEnumerable<object> allGroups(LMGroup root) {
      if (root == null) yield break;
      yield return root;
      foreach (object grp in root)
        if (grp is LMGroup)
          foreach (object subGrp in allGroups((LMGroup)grp))
            yield return subGrp;
    }

    public LMGroup findGroup(LMGroupType type, string id) {
      foreach (object grp in allGroups(Roots[(int)type]))
        if (grp is LMGroup && ((LMGroup)grp).Id == id) return (LMGroup)grp;
      return null;
    }

    public LMGroupRoots(lm_scorm root) {
      root.Groups = this;
      List<LMGroup> grps = new List<LMGroup>();
      foreach (LMScormObj obj in LMScormObj.GetAll(root)) {
        if (obj == null) continue;
        if (obj is eval_mark) {
          eval_mark em = (eval_mark)obj;
          if (string.IsNullOrEmpty(em.group))
            em.group = rootGroupId;
          em.group = adjustId(em.group, obj, root);
          em.GroupEval = (LMGroupEval)adjustGrp(obj, root, grps, em.group, LMGroupType.eval);
          if (!string.IsNullOrEmpty(em.group_owner)) {
            LMGroupEval ev = (LMGroupEval)adjustGrp(obj, root, grps, em.group_owner, LMGroupType.eval);
            if (ev.IndexOf(em.GroupEval) < 0) {
              em.GroupEval.Owner = ev;
              ev.Add(em.GroupEval);
            }
          }
          //em.GroupEval.EvalType = em.eval_type;
        } else if (obj is LMLiteral) {
          LMLiteral em = (LMLiteral)obj;
          if (string.IsNullOrEmpty(em.group_hide_text))
            continue;
          em.group_hide_text = adjustId(em.group_hide_text, obj, root);
          LMGroup ev = adjustGrp(obj, root, grps, em.group_hide_text, LMGroupType.hideText);
        } else if (obj is hide_text_mark) {
          hide_text_mark em = (hide_text_mark)obj;
          if (string.IsNullOrEmpty(em.group))
            throw new Exception(string.Format("hide_text_mark: missing group attribute {0}", em.ErrorId));
          em.group = adjustId(em.group, obj, root);
          em.GroupHideText = (LMGroupHideText)adjustGrp(obj, root, grps, em.group, LMGroupType.hideText);
          em.GroupHideText.mark = em;
          if (!string.IsNullOrEmpty(em.group_owner)) {
            em.group_owner = adjustId(em.group_owner, obj, root);
            LMGroup ev = adjustGrp(obj, root, grps, em.group_owner, LMGroupType.hideText);
            if (ev.IndexOf(em.GroupHideText) < 0) {
              em.GroupHideText.Owner = ev;
              ev.Add(em.GroupHideText);
            }
          }
        } else if (obj is gap_fill) {
          gap_fill em = (gap_fill)obj;
          LMGroupEval grp;
          if (string.IsNullOrEmpty(em.group_eval)) em.group_eval = rootGroupId;
          if (!string.IsNullOrEmpty(em.group_set)) {
            em.group_set = adjustId(em.group_set, obj, root);
            grp = (LMGroupEval)adjustGrp(obj, root, grps, em.group_set, LMGroupType.eval);
            grp.EvalType = eval_Type.GapFillSet;
            grp.Add(obj);
            LMGroupEval ev = (LMGroupEval)adjustGrp(obj, root, grps, em.group_eval, LMGroupType.eval);
            if (ev.IndexOf(grp) < 0) {
              if (grp.Owner != null)
                throw new Exception(string.Format("All group_set ({0}) attribute value has to be in single group_eval attribute value.", em.group_set));
              grp.Owner = ev;
              ev.Add(grp);
            }
          } else {
            em.group_eval = adjustId(em.group_eval, obj, root);
            grp = (LMGroupEval)adjustGrp(obj, root, grps, em.group_eval, LMGroupType.eval);
            grp.Add(obj);
          }
          if (!string.IsNullOrEmpty(em.group_eq_width)) {
            em.group_eq_width = adjustId(em.group_eq_width, obj, root);
            LMGroup g = adjustGrp(obj, root, grps, em.group_eq_width, LMGroupType.gapFillEqWidth);
            g.Add(obj);
          }
        } else if (obj is sound_mark) {
          sound_mark em = (sound_mark)obj;
          if (string.IsNullOrEmpty(em.group))
            throw new Exception(string.Format("sound_mark: missing group attribute {0}", em.ErrorId));
          em.group = adjustId(em.group, obj, root);
          em.GroupSound = (LMGroupSound)adjustGrp(obj, root, grps, em.group, LMGroupType.sound);
          if (em.GroupSound.mark != null)
            throw new Exception(string.Format("sound_mark: only single sound_mark for sound ir sound_dialog ({0})", em.ErrorId));
          em.GroupSound.mark = em;
        } else if (obj is SoundLow) {
          SoundLow em = (SoundLow)obj;
          LMGroupSound sg = (LMGroupSound)adjustGrp(obj, root, grps, em.varName, LMGroupType.sound);
          sg.sound = em; em.GroupSound = sg;
        } else if (obj is sound_sentence) {
          sound_sentence em = (sound_sentence)obj;
          if (string.IsNullOrEmpty(em.group_sound))
            throw new Exception(string.Format("sound_sentence: missing group_sound attribute {0}", em.ErrorId));
          em.group_sound = adjustId(em.group_sound, obj, root);
          em.GroupSound = (LMGroupSound)adjustGrp(obj, root, grps, em.group_sound, LMGroupType.sound);
          em.GroupSound.Add(em);
          if (em.hasHiddenText()) {
            if (string.IsNullOrEmpty(em.group_hide_text)) em.group_hide_text = rootGroupId;
            em.group_hide_text = adjustId(em.group_hide_text, obj, root);
            em.GroupHideText = (LMGroupHideText)adjustGrp(obj, root, grps, em.group_hide_text, LMGroupType.hideText);
            em.GroupHideText.Add(obj);
          }
        } else if (obj is sound_sentences) {
          sound_sentences em = (sound_sentences)obj;
          if (string.IsNullOrEmpty(em.group_sound))
            throw new Exception(string.Format("sound_sentences: missing group_sound attribute {0}", em.ErrorId));
          em.group_sound = adjustId(em.group_sound, obj, root);
          em.GroupSound = (LMGroupSound)adjustGrp(obj, root, grps, em.group_sound, LMGroupType.sound);
          em.GroupSound.Add(em);
          if (em.hasHiddenText()) {
            if (string.IsNullOrEmpty(em.group_hide_text)) em.group_hide_text = rootGroupId;
            em.group_hide_text = adjustId(em.group_hide_text, obj, root);
            em.GroupHideText = (LMGroupHideText)adjustGrp(obj, root, grps, em.group_hide_text, LMGroupType.hideText);
            em.GroupHideText.Add(obj);
          }
        } else {
          PropertyInfo prop = obj.GetType().GetProperty("group_eval");
          if (prop == null) continue;
          string s = (string)prop.GetValue(obj, null);
          if (s == "null") continue;
          s = adjustId(s, obj, root);
          if (string.IsNullOrEmpty(s)) s = rootGroupId;
          LMGroupEval grp = (LMGroupEval)adjustGrp(obj, root, grps, s, LMGroupType.eval);
          grp.Add(obj);
          //AND evaluace pro radio
          if (obj is check_item && ((check_item)obj).type == check_itemType.radioButton)
            ((LMGroupEval)grp).EvalType = eval_Type.And;
          FieldInfo fld = obj.GetType().GetField("GroupEval");
          if (fld != null)
            fld.SetValue(obj, grp);
        }
      }
      //navazani grup do rootu:
      foreach (LMGroup grp in grps) {
        //if (grp.Count == 0)
        //throw new Exception(string.Format("Empty group: compId={0}, Type={1}", grp.compId, grp.Type));
        if (grp.Owner != null || grp.Id == rootGroupId) continue;
        if (Roots[(int)grp.Type] == null)
          Roots[(int)grp.Type] = LMGroup.create(rootGroupId, grp.Type);
        //Roots[(int)grp.Type] = grp.Type == LMGroupType.eval ? new LMGroupEval(rootGroupId, grp.Type) : new LMGroup(rootGroupId, grp.Type);
        Roots[(int)grp.Type].Add(grp);
        grp.Owner = Roots[(int)grp.Type];
      }
    }

    public void GroupAtlasScript() {
      EvalGroupAtlasScript(null, null);
      SoundLow.SoundGroupScript((LMGroupSound)Roots[(int)LMGroupType.sound]);
    }

    void EvalGroupAtlasScript(LMGroupEval grp, StringBuilder buf) {
      if (grp == null) grp = (LMGroupEval)Roots[(int)LMGroupType.eval];
      if (grp == null) return;
      if (buf == null) buf = new StringBuilder();
      buf.Length = 0;
      bool isExample = true; //neni-li alespon jeden prvek example, vrat false
      if (grp.Count > 0) {
        foreach (object obj in grp) {
          if (obj is gap_fill) {
            if (!((gap_fill)obj).example) isExample = false;
          } else if (obj is check_item) {
            if (!((check_item)obj).example) isExample = false;
          } else
            isExample = false;
          string id = obj is LMScormObj ? ((LMScormObj)obj).ajaxFindName : ((LMGroupEval)obj).Id;
          if (buf.Length > 0) buf.Append(','); else buf.Append("#a");
          buf.Append("'");
          buf.Append(id);
          buf.Append("'");
        }
      }
      LMScormLib.AjaxPairs pairs = buf.Length == 0 ? new LMScormLib.AjaxPairs("id", grp.Id) : new LMScormLib.AjaxPairs("id", grp.Id, "scoreProviders", buf.ToString());
      if (grp.EvalType == eval_Type.And) pairs.addPar("evalType", grp.EvalType.ToString());
      if (isExample) pairs.addPar("example", "true");
      LMScormLib.LMScormClientScript.RegisterAjaxScript(
        grp.EvalType == eval_Type.GapFillSet ? "S4N.GapFillSet" : "S4N.EvalGroup",
        pairs, null, null, null);
      foreach (object obj in grp) {
        if (!(obj is LMGroupEval)) continue;
        EvalGroupAtlasScript((LMGroupEval)obj, buf);
      }
    }
    static LMGroup findGrp(List<LMGroup> list, string id, LMGroupType type) {
      id = id.ToLower();
      foreach (LMGroup grp in list)
        if (grp.Id == id && grp.Type == type) return grp;
      return null;
    }
    static string adjustId(string id, LMScormObj self, lm_scorm root) {
      //if (string.IsNullOrEmpty(email)) email = rootGroupId;
      if (string.IsNullOrEmpty(id) || id[0] != '@') return id;
      if (id == "@this") return self.varName;
      LMScormObj obj = (LMScormObj)root.FindObj(id.Substring(1));
      if (obj == null)
        throw new Exception(string.Format("Cannot find object {0}, referenced from group id", id));
      return obj.varName;
    }
    LMGroup adjustGrp(LMScormObj self, lm_scorm root, List<LMGroup> list, string id, LMGroupType type) {
      id = string.IsNullOrEmpty(id) ? rootGroupId : adjustId(id, self, root);
      id = id.ToLower();
      LMGroup res = findGrp(list, id, type);
      if (res != null) return res;
      res = LMGroup.create(id, type);
      list.Add(res);
      if (id == rootGroupId)
        Roots[(int)type] = res;
      if (res is LMGroupEval && root.evalGroupTypes != null)
        root.evalGroupTypes.TryGetValue(res.Id, out ((LMGroupEval)res).EvalType);
      return res;
    }
    public void Finish(lm_scorm root) {
      //osetreni group_eq_width
      LMGroup eqWidthGrp = Roots[(int)LMGroupType.gapFillEqWidth];
      if (eqWidthGrp != null)
        foreach (LMGroup grp in eqWidthGrp) {
          int maxWidth = 0;
          //sirka grupy nastavena pomoci group_eq_width-10:@this
          if (root.eqWidthGroupWidth == null || !root.eqWidthGroupWidth.TryGetValue(grp.Id, out maxWidth))
            //zjisteni maximalni sirky z jednotlivych gap_fills
            foreach (gap_fill gf in grp)
              maxWidth = Math.Max(maxWidth, gf.maxChars());
          //nastaveni gapfillum
          foreach (gap_fill gf in grp)
            gf.width = maxWidth.ToString() + "em";
        }
      //vlozeni intervalu mezi group_sound a sound_sentence
      LMGroupSound sndGrp = (LMGroupSound)Roots[(int)LMGroupType.sound];
      if (sndGrp != null)
        foreach (LMGroupSound snd in sndGrp)
          snd.adjustIntervals(root);
      //adjustEvalRoot
      LMGroupEval eval = (LMGroupEval)Roots[(int)LMGroupType.eval];
      if (eval == null) {
        eval = (LMGroupEval)LMGroup.create(LMGroupRoots.rootGroupId, LMGroupType.eval);
        Roots[(int)LMGroupType.eval] = eval;
      } else {

      }
    }

  }

  public enum LocalizeType {
    string2string,
    items2string,
    items2items
  }

  [AttributeUsage(AttributeTargets.Field, AllowMultiple = false, Inherited = true)]
  public class LocalizedProperty : System.Attribute {
    public LocalizeType Type = LocalizeType.string2string;
    public bool canMiss;
  }

  public class LMScormObj {

    public static int fakeUniqueId = 30000;

    public static LMScormObj Empty = new LMScormObj();

    public virtual void addChildProperties(childProperties props) {
    }

    public virtual void finishTree(lm_scorm root) {
    }

    public virtual void finishTreeBeforeLocalize(lm_scorm root) {
      PropertyInfo prop = GetType().GetProperty("title_html");
      if (prop == null) return;
      string val = (string)prop.GetValue(this, null);
      if (string.IsNullOrEmpty(val)) return;
      object obj = root.FindObj(val);
      if (!(obj is html))
        throw new Exception(string.Format(
          "'titleHtml' attribue of {0} must points to Html object.", ErrorId));
      htmlTitleObj = (html)obj;
      //vyvazani htmlTitleObj z puvodni hiearchie
      prop = htmlTitleObj.Owner.GetType().GetProperty("Items");
      if (prop == null) return;
      object[] items = (object[])prop.GetValue(htmlTitleObj.Owner, null);
      int idx = Array.IndexOf<object>(items, htmlTitleObj);
      if (idx >= 0) {
        object[] newItems = new object[items.Length - 1];
        Array.Copy(items, 0, newItems, 0, idx);
        Array.Copy(items, idx + 1, newItems, idx, items.Length - idx - 1);
        prop.SetValue(htmlTitleObj.Owner, newItems, null);
      }
    }

    public delegate bool ObjCondition(object obj);
    [XmlIgnore]
    public LMScormObj Owner;
    [XmlIgnore]
    public lm_scorm Root {
      get {
        lm_scorm res = (lm_scorm)GetOwner(delegate(object obj) { return obj is lm_scorm; });
        if (res == null)
          res = lm_scorm.getActRoot();
        return res;
      }
    }

    protected html htmlTitleObj;
    [LocalizedProperty(canMiss = true), XmlIgnore]
    public LMLiteral localtitle;
    public virtual string Title {
      get { return LMLiteral.getText(localtitle) + (htmlTitleObj == null ? null : htmlTitleObj.HtmlText); }
    }

    public LMScormObj GetOwner(ObjCondition cond) {
      if (cond(this)) return this;
      if (Owner == null) return null;
      return Owner.GetOwner(cond);
    }
    public virtual IEnumerable<object> GetChilds() {
      if (htmlTitleObj != null) yield return htmlTitleObj;
      PropertyInfo prop = GetType().GetProperty("Items");
      if (prop == null) yield break;
      IEnumerable<object> items = (IEnumerable<object>)prop.GetValue(this, null);
      if (items == null) yield break;
      foreach (object obj in items)
        yield return obj;
    }
    public virtual IEnumerable<object> ExpandChildControlsChilds() {
      foreach (object obj in GetChilds())
        if (obj != htmlTitleObj) yield return obj;
    }
    [XmlIgnore]
    public virtual string Id {
      get {
        PropertyInfo prop = GetType().GetProperty("id");
        if (prop == null) return null;
        return (string)prop.GetValue(this, null);
      }
    }
    [XmlIgnore]
    internal int? uniqueId;
    [XmlIgnore]
    public virtual int UniqueId {
      get {
        if (uniqueId != null) return (int)uniqueId;
        PropertyInfo prop = GetType().GetProperty("ui");
        if (prop == null)
          return (int)(uniqueId = Root.getUniqueId());
        uniqueId = (int)prop.GetValue(this, null);
        return uniqueId == 0 ? (int)(uniqueId = Root.getUniqueId()) : (int)uniqueId;
      }
      set { uniqueId = value; }
    }
    public virtual string ErrorId { get { return string.Format("(ui={0})", UniqueId); } }
    public virtual void AfterLoad() {
    }
    [XmlIgnore]
    public string varNameLow;
    [XmlIgnore]
    public virtual string varName {
      get {
        if (varNameLow != null) return varNameLow;
        string id = Id;
        //return string.Format("s4nv_{0}", email);
        return string.IsNullOrEmpty(id) ? adjustVarName(UniqueId) : adjustVarName(id.ToLower());
      }
    }
    public static string adjustVarName(object obj) {
      if (obj is int) return "l" + obj.ToString();
      if (!(obj is string)) throw new Exception();
      string s = (string)obj;
      if (string.IsNullOrEmpty(s)) throw new Exception();
      if (char.IsDigit(s[0])) return "l" + s; else return s;
    }
    public virtual string behaviorName() {
      return null;
    }
    [XmlIgnore]
    public virtual string ajaxFindName {
      get {
        string bn = behaviorName();
        return bn == null ? varName : varName + "$" + bn;
      }
    }
    [XmlIgnore]
    public virtual string controlName {
      get { return string.Format("s4n_{0}", UniqueId); }
    }
    public virtual object FindObj(string id) {
      foreach (object child in GetAll(this))
        if (getId(child) == id) return child;
      return null;
    }
    public static IEnumerable<object> GetAll(object obj) {
      yield return obj;
      if (!(obj is LMScormObj)) yield break;
      IEnumerable<object> iter = ((LMScormObj)obj).GetChilds();
      if (iter == null) yield break;
      foreach (object child in iter)
        foreach (object ch in GetAll(child)) yield return ch;
    }
    public static IEnumerable<object> GetAll(object obj, ObjCondition cond) {
      if (cond(obj)) yield return obj;
      if (!(obj is LMScormObj)) yield break;
      IEnumerable<object> iter = ((LMScormObj)obj).GetChilds();
      if (iter == null) yield break;
      foreach (object child in iter)
        foreach (object ch in GetAll(child, cond)) yield return ch;
    }

    public static string getId(object obj) {
      if (obj is LMScormObj) return ((LMScormObj)obj).Id;
      PropertyInfo prop = obj.GetType().GetProperty("id");
      if (prop == null) return null;
      return (string)prop.GetValue(obj, null);
    }

    public static void OnAfterLoad(object obj) {
      callAfterLoad(obj);
    }

    static void callAfterLoad(object obj) {
      if (!(obj is LMScormObj)) return;
      IEnumerable<object> iter = ((LMScormObj)obj).GetChilds();
      if (iter != null)
        foreach (object child in iter)
          callAfterLoad(child);
      ((LMScormObj)obj).AfterLoad();
    }

    public static void adjustOwners(object obj) {
      if (!(obj is LMScormObj)) return;
      IEnumerable<object> iter = ((LMScormObj)obj).GetChilds();
      if (iter == null) return;
      foreach (object child in iter) {
        if (!(child is LMScormObj)) continue;
        ((LMScormObj)child).Owner = (LMScormObj)obj;
        adjustOwners(child);
      }
    }

    public static void finishTree(lm_scorm root, LMScormObj obj) {
      obj.finishTree(root);
      IEnumerable<object> iter = ((LMScormObj)obj).GetChilds();
      foreach (LMScormObj child in iter)
        finishTree(root, child);
    }

    public static void finishTreeBeforeLocalize(lm_scorm root, LMScormObj obj) {
      obj.finishTreeBeforeLocalize(root);
      IEnumerable<object> iter = ((LMScormObj)obj).GetChilds();
      foreach (LMScormObj child in iter)
        finishTreeBeforeLocalize(root, child);
    }

    int uniqueIdCounter = 1;
    public int getUniqueId() {
      return uniqueIdCounter++;
    }

  }

}
