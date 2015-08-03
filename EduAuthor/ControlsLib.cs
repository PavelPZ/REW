/*
Handlers.cs.Open: vrati APSX string - pro cviceni FakePage, se spravnou MasterPage
    FakePage.CreateChildControls
        lm_scorm.getActRoot
            ControlsLib.cs.ReadThrowSiteMap
                Read
                    ReadLow
                        ReadFromFile: viz dale
        ctrl.ExpandChildControl
	          ctrl.dataToControl
                osetreni literalu nebo 
		            ctrl.classToPath - prepocet dat na kontrolku a zavolani page.LoadControl, dosazeni dat do kontrolky
            
ControlsLib.cs.ReadFromFile
	ReadFromFileEx
		TradosLib.cs.LocalizeXml_ModifyXml: XML nacteni .old, lokalizace, word split, navraceni streamu
		XSLT validace
		ReadFromStream: linealizace pure HTML tagu do Literalu (CopyNode), vraci lm_scorm
		...
		finishTreeBeforeLocalize
		...
		LocalizeLMData.Localize - pouziva se?
		...
		finishTree
		...
		OnAfterLoad

20,drag.css .dsItem span {margin-right: 1em}
19: vety navic
18: word ordering - javascript chyba

*/
using System;
using System.Data;
using System.Linq;
using System.Configuration;
using System.Web;
using System.Collections.Generic;
using System.Collections.Specialized;
using System.IO;
using System.Text;
using System.Web.Security;
using System.Web.UI;
using System.Web.UI.WebControls;
using System.Web.UI.WebControls.WebParts;
using System.Web.UI.HtmlControls;
using System.Xml;
using System.Xml.Xsl;
using System.Xml.Schema;
using System.Xml.Serialization;
using System.Web.Hosting;
using System.Reflection;

using LMNetLib;
using LMScormLibDOM;
using System.Xml.Linq;

namespace LMScormLib {

  public static class ControlHelper {
    public static string[] dels = new string[] { "$del;", "&del;" };

    public static bool hasDels(string txt) {
      foreach (string s in dels)
        if (txt.IndexOf(s) >= 0) return true;
      return false;
    }

    public static string[] splitDels(string txt) {
      return txt.Split(dels, StringSplitOptions.RemoveEmptyEntries);
    }

    /*public static string stringToJavaArray(string str)
    {
      string[] parts = ControlHelper.splitDels(str);
      return parts.Length > 1 ? LowUtils.StringsToJavaArray(parts, true) : str;
    }*/

  }

  public class LMLiteralControl : UserControl {
  }

  public class Ctrl : UserControl {
    static Dictionary<string, string> classToPath = new Dictionary<string, string>();
    static Ctrl() {
      classToPath.Add(typeof(layout_cell).Name, "layout/layout_cell.ascx");
      classToPath.Add(typeof(layout_row).Name, "layout/layout_row.ascx");
      classToPath.Add(typeof(layout_table).Name, "layout/layout_table.ascx");
      classToPath.Add(typeof(gap_fill).Name, "gapfill/gap_fill.ascx");
      classToPath.Add(typeof(eval_mark).Name, "marks/eval_mark.ascx");
      classToPath.Add(typeof(hide_text_mark).Name, "marks/hide_text_mark.ascx");
      classToPath.Add(typeof(gap_fill_source).Name, "gapfill/gap_fill_source.ascx");
      classToPath.Add(typeof(sound_dialog).Name, "sound/dialog.ascx");
      classToPath.Add(typeof(sound).Name, "sound/sound.ascx");
      classToPath.Add(typeof(sound_sentence).Name, "sound/sentence.ascx");
      classToPath.Add(typeof(sound_dialogRole).Name, "sound/role.ascx");
      classToPath.Add(typeof(sound_mark).Name, "sound/mark.ascx");
      classToPath.Add(typeof(check_item).Name, "selections/check_item.ascx");
      classToPath.Add(typeof(selection_item).Name, "selections/selection_item.ascx");
      classToPath.Add(typeof(selection).Name, "selections/selection.ascx");
      classToPath.Add(typeof(word_ordering).Name, "orderings/word_ordering.ascx");
      classToPath.Add(typeof(OrderItem).Name, "orderings/OrderItem.ascx");
      classToPath.Add(typeof(pairingItem).Name, "orderings/PairingItem.ascx");
      classToPath.Add(typeof(sentence_ordering).Name, "orderings/sentence_ordering.ascx");
      classToPath.Add(typeof(pairing).Name, "orderings/pairing.ascx");
      //classToPath.Add(typeof(classification).Name, "gapfill/classification.ascx");
      //classToPath.Add(typeof(classificationItem).Name, "gapfill/classificationItem.ascx");
      classToPath.Add(typeof(box).Name, "other/box.ascx");
      classToPath.Add(typeof(col).Name, "table/html_col.ascx");
      classToPath.Add(typeof(tr).Name, "table/html_tr.ascx");
      classToPath.Add(typeof(td).Name, "table/html_td.ascx");
      classToPath.Add(typeof(table).Name, "table/html_table.ascx");
      classToPath.Add(typeof(head).Name, "other/head.ascx");
      classToPath.Add(typeof(two_column).Name, "other/twocolumn.ascx");
      classToPath.Add(typeof(two_column_left).Name, "other/twocolumn_left.ascx");
      classToPath.Add(typeof(two_column_right).Name, "other/twocolumn_right.ascx");
      classToPath.Add(typeof(page_instructions).Name, "page/instructions.ascx");
      classToPath.Add(typeof(page_instruction).Name, "page/instruction.ascx");
      classToPath.Add(typeof(cross_word).Name, "GapFill/cross_word.ascx");
      classToPath.Add(typeof(cross_line).Name, "GapFill/cross_line.ascx");
      classToPath.Add(typeof(cross_cell).Name, "GapFill/cross_cell.ascx");
      classToPath.Add(typeof(memory_box).Name, "other/memory_box.ascx");
      classToPath.Add(typeof(hide_control).Name, "other/hide_control.ascx");
      classToPath.Add(typeof(flash).Name, "other/flash.ascx");
      classToPath.Add(typeof(silverlight).Name, "other/silverlight.ascx");
      classToPath.Add(typeof(video).Name, "other/video.ascx");
    }
    public LMScormObj Data;
    public static void setFields(object obj, params object[] pars) {
      Type tp = obj.GetType();
      for (int i = 1; i < pars.Length; i += 2)
        tp.GetField((string)pars[i - 1]).SetValue(obj, pars[i]);
    }
    public virtual Control getChildPlace() {
      return null;
    }
    public static void tableClassesEnum(StringBuilder sb, string prefix, string value) {
      sb.Append(" "); sb.Append(prefix); int idx = sb.Length; sb.Append(value); sb[idx] = char.ToUpper(sb[idx]);
    }
    public static valign_type cellVAlign(LMScormLibDOM.td cell, LMScormLibDOM.tr row, LMScormLibDOM.table tb) {
      if (cell.valign != valign_type.no) return cell.valign;
      if (row != null && row.valign != valign_type.no) return row.valign;
      if (cell.myCol != null && cell.myCol.valign != valign_type.no) return cell.myCol.valign;
      if (tb != null && tb.valign != valign_type.no) return tb.valign;
      return valign_type.top;
    }
    public static align_type cellAlign(LMScormLibDOM.td cell, LMScormLibDOM.tr row, LMScormLibDOM.table tb) {
      if (cell.align != align_type.no) return cell.align;
      if (row != null && row.align != align_type.no) return row.align;
      if (cell.myCol != null && cell.myCol.align != align_type.no) return cell.myCol.align;
      if (tb != null && tb.align != align_type.no) return tb.align;
      return align_type.center;
    }
    public static StringBuilder tableClasses(StringBuilder sb, valign_type valign, align_type align, bool hlite, bool example, bool small, colPadding padding) {
      if (sb == null) sb = new StringBuilder();
      if (valign != valign_type.no) tableClassesEnum(sb, "tbValign", valign.ToString());
      if (align != align_type.no) tableClassesEnum(sb, "tbAlign", align.ToString());
      if (hlite) sb.Append(" hilite");
      if (small) sb.Append(" small");
      if (example) sb.Append(" example");
      if (padding != colPadding.no) tableClassesEnum(sb, "tbPadding", padding.ToString());
      return sb;
    }
    public override void RenderControl(HtmlTextWriter writer) {
      if (!Visible) return;
      //writer.Write(string.Format("<!-- START of {0}, email={1}, ui={2} -->", RowType.GetType().Name, RowType.compId, RowType.UniqueId));
      control ctrlData = Data is control ? (control)Data : null;
      string tagName = ctrlData == null || string.IsNullOrEmpty(ctrlData.tag_name) ? null : ctrlData.tag_name;
      if (tagName != null) writer.RenderBeginTag(tagName);
      base.RenderControl(writer);
      if (tagName != null) writer.RenderEndTag();
      //writer.Write(string.Format("<!-- END of {0}, email={1}, ui={2} -->", RowType.GetType().Name, RowType.compId, RowType.UniqueId));
    }
    protected override void CreateChildControls() {
      base.CreateChildControls();
      ExpandChildControls(Page, this, Data);
    }
    public static void ExpandChildControls(Page pg, Control parent, LMScormObj parentData) {
      if (parentData == null) return;
      Control childPlace = null;
      if (parent is FakePage)
        childPlace = ((FakePage)parent).getChildPlace();
      else if (parent is Ctrl)
        childPlace = ((Ctrl)parent).getChildPlace();
      else if (parent is LMDataControl)
        childPlace = parent;
      if (childPlace == null)
        childPlace = LowUtils.FindControlEx(parent, "Childs");
      if (childPlace == null) childPlace = parent;
      doExpandChildControls(pg, childPlace, parentData);
    }
    public static void doExpandChildControls(Page pg, Control childPlace, LMScormObj parentData) {
      foreach (LMScormObj obj in parentData.ExpandChildControlsChilds())
        ExpandChildControl(pg, childPlace, obj);
    }
    public static void ExpandChildControl(Page pg, Control childPlace, LMScormObj obj) {
      if (obj is gap_fill_source)
        childPlace = LowUtils.FindControlEx(pg, "AlwaysVisiblePanel");
      Control ctrl = dataToControl(pg, obj);
      childPlace.Controls.Add(ctrl);
      if (ctrl is Ctrl) ((Ctrl)ctrl).EnsureChildControls();
    }
    public static Control dataToControl(Page pg, LMScormObj data) {
      if (data is LMLiteral)
        return new LiteralControl(((LMLiteral)data).Text);
      else if (data is html)
        return new LiteralControl(((html)data).localItems.Text);
      else {
        string url = null; Ctrl ctrl = null;
        if (classToPath.TryGetValue(data.GetType().Name, out url)) {
          if (HTTPModule.Hack()) {
            switch (url) {
              case "sound/sentence.ascx": url = "sound/sentencenew.ascx"; break;
              case "sound/role.ascx": url = "sound/rolenew.ascx"; break;
              case "sound/dialog.ascx": url = "sound/dialognew.ascx"; break;
              case "sound/mark.ascx": url = "sound/marknew.ascx"; break;
            }
          }
          var fn = HttpContext.Current.Server.MapPath(("~/Framework/Controls/" + url).Replace("//","/"));
          url = (HttpRuntime.AppDomainAppVirtualPath + "/Framework/Controls/" + url).Replace("//","/");
          ctrl = (Ctrl)pg.LoadControl(url);
        } else
          ctrl = new Ctrl();
        ctrl.Data = data;
        return ctrl;
      }
    }
    public string id {
      get { return Data.varName; }
    }
    public static void doRegister(TemplateControl ctrl, string js, string css, params string[] bmps) {
      int idx = ctrl.AppRelativeVirtualPath.LastIndexOf('/');
      string basicPath = ctrl.AppRelativeVirtualPath.Substring(0, idx + 1).ToLowerInvariant();
      if (js != null)
        LMScormClientScript.Register(js, basicPath + js.ToLowerInvariant(), ClientScriptPlace.Script);
      if (css != null)
        LMScormClientScript.Register(css, "~/framework/controls/css/" + css, ClientScriptPlace.StyleSheet);
      if (bmps != null) {
        string myUrl = HttpContext.Current.Request.Url.AbsolutePath.ToLowerInvariant();
        foreach (string bmp in bmps) {
          string[] parts = bmp.Split('=');
          string url = parts.Length == 2 ? parts[1] : bmp;
          string name = "~/framework/controls/css/img/" + url.ToLowerInvariant();
          url = VirtualPathUtility.MakeRelative(myUrl, name);
          LMScormClientScript.Register(name, url, ClientScriptPlace.WGetUrl);
          if (parts.Length == 2)
            LMScormClientScript.Register(bmp, string.Format("var {0}='{1}';", parts[0], url), ClientScriptPlace.relUrlConst);
        }
      }
    }
    protected void registerCSS(params string[] css) {
      foreach (string c in css)
        LMScormClientScript.Register(c, "~/Framework/Controls/css/" + c, ClientScriptPlace.StyleSheet);
    }
    protected void register(string js, string css, params string[] bmps) {
      doRegister(this, js, css, bmps);
    }
  }

  internal class LMDataReaderPar {
    internal string Error;
    internal void ValidationCallBack(object sender, ValidationEventArgs args) {
      if (args.Severity == XmlSeverityType.Warning)
        Error += "Warning: Matching schema not found.  No validation occurred." + args.Message;
      else
        Error += "Validation error: " + args.Message;
    }
  }
  public static class LMDataReader {

    static Dictionary<string, bool> ignoreUniqueId = new Dictionary<string, bool>();
    static XmlSchemaSet schemas = new XmlSchemaSet();

    internal class needsNumberingInfo : Dictionary<string, bool> {
      internal bool needsNumbering;
      internal void addAttribute(string attr) {
        if (needsNumbering) return;
        if (attr == null || ContainsKey(attr)) needsNumbering = true;
        else Add(attr, true);
      }
    }
    internal class numberingInfo : List<XmlNode> {
      Dictionary<string, bool> ids = new Dictionary<string, bool>();
      internal void addNode(XmlNode node, bool forceRefresh) {
        if (forceRefresh) Add(node);
        else {
          XmlAttribute attr = (XmlAttribute)node.Attributes.GetNamedItem("ui");
          if (attr == null || ids.ContainsKey(attr.Value)) Add(node);
          else ids.Add(attr.Value, true);
        }
      }
      internal void renumber(XmlDocument doc, ref int cnt) {
        foreach (XmlNode nd in this) {
          XmlAttribute attr = (XmlAttribute)nd.Attributes.GetNamedItem("ui");
          if (attr == null) { attr = doc.CreateAttribute("ui"); nd.Attributes.Append(attr); }
          attr.Value = (cnt++).ToString();
        }
      }
    }
    static LMDataReader() {
      if (!LMScormLib.HTTPModule.Hack()) {
        schemas.Add("lm", HostingEnvironment.ApplicationPhysicalPath + @"Framework\Schemas\LMSchema.xsd");
        schemas.Add("htmlPassivePage", HostingEnvironment.ApplicationPhysicalPath + @"Framework\Schemas\htmlPassivePage.xsd");
        ignoreUniqueId.Add("lm:Files", true);
        ignoreUniqueId.Add("lm:Roles", true);
        ignoreUniqueId.Add("lm:Sounds", true);
        ignoreUniqueId.Add("lm:Items", true);
        ignoreUniqueId.Add("lm:File", true);
      }
    }

    static void AdjustUnqueIds(lm_scorm root) {
      foreach (LMScormObj obj in LMScormObj.GetAll(root))
        if (obj.uniqueId == null)
          obj.UniqueId = root.getUniqueId();
    }
    public static void AdjustUnqueIds(string fn) {
      string uniqueFile = HostingEnvironment.ApplicationPhysicalPath + "UniqueIds.txt";
      bool forceRefresh = File.Exists(HostingEnvironment.ApplicationPhysicalPath + "RefreshUniqueIds.txt");
      XmlDocument doc = new XmlDocument();
      XmlNamespaceManager nsmgr = new XmlNamespaceManager(doc.NameTable);
      nsmgr.AddNamespace("lm", "lm");
      doc.Load(fn);
      XmlNodeList nodes = doc.SelectNodes("//*");
      numberingInfo needId = new numberingInfo();
      foreach (XmlNode nd in nodes)
        if (!ignoreUniqueId.ContainsKey(nd.Name) && nd.NamespaceURI == "lm")
          needId.addNode(nd, forceRefresh);
      if (needId.Count <= 0) return;
      int lastId = File.Exists(uniqueFile) ? int.Parse(StringUtils.FileToString(uniqueFile)) : 1;
      needId.renumber(doc, ref lastId);
      StringUtils.StringToFile(lastId.ToString(), uniqueFile);
      doc.Save(fn);
    }

    public class XsltLib {
      public XsltLib(string fn) {
        url = VirtualPathUtility.ToAbsolute("~/" + lm_scorm.urlFromFileName(fn));
      }
      string url;
      public string ModifyHRef(string href) {
        try {
          return LMComLib.NewEATradosLib.Hack() ? href : VirtualPathUtility.MakeRelative(url, VirtualPathUtility.ToAbsolute(href));
        }
        catch {
          return href;
        }
      }
    }

    static MemoryStream validateAndTransformStream(Stream str, string fn) {
      //data do pameti
      MemoryStream memStr;
      if (str is MemoryStream)
        memStr = (MemoryStream)str;
      else {
        byte[] buf = new byte[str.Length];
        str.Read(buf, 0, buf.Length);
        memStr = new MemoryStream(buf, false);
      }

      //validace
      if (false && !LMScormLib.HTTPModule.Hack() && !CourseMan.Config.IgnoreValidation) {
        XmlReaderSettings settings = new XmlReaderSettings();
        LMDataReaderPar par = null;
        settings.ValidationType = ValidationType.Schema;
        settings.ValidationFlags |= XmlSchemaValidationFlags.ProcessInlineSchema;
        settings.ValidationFlags |= XmlSchemaValidationFlags.ReportValidationWarnings;
        par = new LMDataReaderPar();
        settings.ValidationEventHandler += new ValidationEventHandler(par.ValidationCallBack);
        settings.Schemas.Add(schemas);
        memStr.Seek(0, SeekOrigin.Begin);
        using (XmlReader rdr = XmlReader.Create(memStr, settings))
          while (rdr.Read()) ; // do nothing
        if (par != null && !string.IsNullOrEmpty(par.Error))
          throw new Exception(string.Format("XML Scheme error: {0}", par.Error));
      }

      /*
      memStr.Seek(0, SeekOrigin.Begin);
      byte[] mmem = memStr.ToArray();
      string ss = Encoding.UTF8.GetString(mmem);
      memStr.Seek(0, SeekOrigin.Begin);
      */

      //transformace
      memStr.Seek(0, SeekOrigin.Begin);
      MemoryStream res = new MemoryStream();

      XsltArgumentList xslArg = new XsltArgumentList();
      // Create our custom extension object.
      XsltLib lib = new XsltLib(fn);
      xslArg.AddExtensionObject("urn:myXsltLib", lib);

      Manager.XsltTransformPar.getXsltTransformPar(false).actTrans.Transform(XmlReader.Create(memStr), xslArg, res);

      //res2.Seek(0, SeekOrigin.Begin);
      byte[] mem = res.ToArray();
      string s = Encoding.UTF8.GetString(mem);

      res.Seek(0, SeekOrigin.Begin);
      return res;
    }

    static lm_scorm ReadFromStream(Stream str, needsNumberingInfo needsNumbering) {
      StringBuilder buf = new StringBuilder();
      using (MemoryStream ms = new MemoryStream())
      using (XmlTextWriter wr = new XmlTextWriter(ms, Encoding.UTF8))
      using (XmlReader rdr = XmlReader.Create(str)) {
        wr.Formatting = Formatting.Indented;
        while (rdr.Read())
          CopyNode(rdr, wr, buf, needsNumbering);
        wr.Flush();
        /**
        resultMs.Seek(0, SeekOrigin.Begin);
        byte[] arr = resultMs.ToArray();
        string s = Encoding.UTF8.GetString(arr);
        **/
        ms.Seek(0, SeekOrigin.Begin);
        lm_scorm obj = null;
        XmlSerializer serializer = new XmlSerializer(typeof(lm_scorm));
        try {
          obj = (lm_scorm)serializer.Deserialize(ms);
        }
        catch {
          ms.Seek(0, SeekOrigin.Begin); byte[] mem = new byte[ms.Length];
          ms.Read(mem, 0, (int)ms.Length);
          using (FileStream fs = new FileStream(@"c:\temp\pom.xml", FileMode.Create))
            fs.Write(mem, 0, (int)ms.Length);
          throw;
        }
        return obj;
      }
    }

    public delegate Stream getDataEvent();

    public static lm_scorm ReadFromFileEx(string fn, bool number, getDataEvent onGetData) {
      //string debugStr = null;
      lock (typeof(LMDataReader)) {
        lm_scorm res = null;
        using (Stream beforeXslt = onGetData())
        using (MemoryStream str = validateAndTransformStream(beforeXslt, fn)) {
          /*
          str.Seek(0, SeekOrigin.Begin);
          byte[] mem = str.ToArray();
          string s = Encoding.UTF8.GetString(mem);
          str.Seek(0, SeekOrigin.Begin);
          */
          res = ReadFromStream(str, null);
          lm_scorm.setActRoot(res);
          //musi byt pred OnAfterLoad, jinak napr. RichHtmlLow.GetItems vraci null
          lm_scorm.infoFromFileName(fn, out res.PageInfo);
          LMScormObj.adjustOwners(res); //finishTreeBeforeLocalize vyzaduje adjustOwners
          LMScormObj.finishTreeBeforeLocalize(res, res);
          //try { debugStr = XmlUtils.ObjectToString(res); } catch { }
          LMScormObj.adjustOwners(res); //Localize vyzaduje adjustOwners
          LocalizeLMData.Localize(res);
          LMScormObj.finishTree(res, res);
          LMScormObj.adjustOwners(res); //Po FinishTree musi byt take adjustOwners
          AdjustUnqueIds(res);
          //Probublani attributes
          new childProperties().Process(res, res);
          //Vybudovani Group trees
          new LMGroupRoots(res);
          //dokonceni
          LMScormObj.OnAfterLoad(res);
          //dokonceni grup (napr. osetreni group_eq_width)
          res.Groups.Finish(res);
          //var s = ObjectDumper.ObjectDumperExtensions.DumpToString<lm_scorm>(res2, "root");
          //DEBUG
          //if (fn.ToLower().IndexOf("localize.htm")>=0)
          //ExpandHtml.LMData2ResX((LMScorm)dbInfo, fn);
          return res;
        }
      }
    }

    //static string ToSoap(Object objToSoap) {
    //  System.Runtime.Serialization.IFormatter formatter;
    //  using (var fileStream = new MemoryStream()) {
    //    formatter = new System.Runtime.Serialization.Formatters.Soap.SoapFormatter();
    //    formatter.Serialize(fileStream, objToSoap);
    //    return Encoding.UTF8.GetString(fileStream.ToArray());
    //  }
    //}

    static string siteMapBufId = Guid.NewGuid().ToString();
    public static lm_scorm ReadFromSiteNode(SiteMapNode nd) {
      lm_scorm root = (lm_scorm)HttpContext.Current.Items[siteMapBufId + nd.Url];
      if (root != null) return root;
      string fn;
      MemoryStream ms = Manager.GenFromSiteMap(nd, out fn);
      root = ReadFromFileEx(fn, true, delegate() {
        return ms;
      });
      HttpContext.Current.Items[siteMapBufId + nd.Url] = root;
      //string templ = nd["template"];
      //if (templ != null) root.template = (template_Type)Enum.Parse(typeof(template_Type), templ);
      //root.title = nd["instruction"];
      root.status = status_Type.start;
      return root;
    }

    public static lm_scorm ReadVirtual(string url) {
      //fn = HttpContext.Current.Server.MapPath(VirtualPathUtility.ToAbsolute(url)).ToLower();
      url = LMComLib.EaUrlInfoLib.MapPath(url).ToLowerInvariant();
      return ReadFromFile(url);
    }

    /*static IEnumerable<XNode> dict_words(string txt) {
      int act = 0;
      Func<char> doRead = () => act >= txt.Length ? (char)0 : txt[act++];
      StringBuilder buf = new StringBuilder();
      bool first = true; bool hasLetter = false;
      //14,18,19,20
      char ch = doRead();
      while ((int)ch > 0) {
        if (first) {
          while ((int)ch > 0 && !(Char.IsLetter((char)ch))) { buf.Append(ch); ch = doRead(); }
          first = false;
        }
        while ((int)ch > 0 && (Char.IsLetter((char)ch))) { hasLetter = true; buf.Append(ch); ch = doRead(); }
        while ((int)ch > 0 && !(Char.IsLetter((char)ch))) { buf.Append(ch); ch = doRead(); }
        if (hasLetter) yield return new XElement(LMComLib.TradosLib.html + "span", new XAttribute("w", "y"), buf.ToString());
        else yield return new XText(buf.ToString());
        buf.Length = 0; hasLetter = false;
      }
    }*/

    /*const string dictSpanStart = "~~b~~";
    const string dictSpanEnd = "~~e~~";

    static string dict_words_txt(string txt, StringBuilder sb, StringBuilder dbInfo) {
      sb.Length = 0; dbInfo.Length = 0;
      int status = 0; int act = 0; bool hasLetter = false;
      Func<char> doRead = () => act >= txt.Length ? (char)0 : txt[act++];
      Action flush = () => {
        if (hasLetter) { dbInfo.Append(dictSpanStart); dbInfo.Append(sb.ToString()); dbInfo.Append(dictSpanEnd); } else dbInfo.Append(sb.ToString());
        sb.Length = 0; hasLetter = false;
      };
      char ch = doRead();
      while ((int)ch > 0) {
        sb.Append(ch);
        switch (status) {
          case 0: //nepismena
            if (ch == '$') status = 30;
            else if (Char.IsLetter((char)ch)) status = 1;
            break;
          case 1: //pismena
            if (Char.IsLetter((char)ch)) hasLetter = true; else status = 2;
            break;
          case 2: //nepismena
            if (ch == '$') status = 32;
            else if (Char.IsLetter((char)ch)) {
              act--; sb.Remove(sb.Length - 1, 1); //jdi o znak zpet + undo posledniho sb.Append(ch)
              status = 1;
              flush();
            }
            break;
          case 30: //$xxx;
            if (ch == ';') status = 0;
            break;
          case 32: //$xxx;
            if (ch == ';') status = 2;
            break;
        }
        ch = doRead();
      }
      flush();
      return dbInfo.ToString();
    }*/

    //napr. virtualFn=d:\LMCom\rew\EduAuthorNew\english1\l01\a\hueex0_l01_a07.htm.aspx.old, physicalFn=d:\LMCom\rew\EduAuthorNew\english1\l01\a\hueex0_l01_a07.oldNew
    public static lm_scorm ReadFromFile(string virtualFn) {
      lock (typeof(LMDataReader)) {
        virtualFn = virtualFn.ToLowerInvariant();
        //PZ 20.10.08 - kvůli překladům je vyhozeno cachování
        //lm_scorm dbInfo = (lm_scorm)CourseMan.fromCache(fn); if (dbInfo != null) return dbInfo;
        lm_scorm res = null;
        res = ReadFromFileEx(virtualFn, true, delegate() {
          //if (LMComLib.Machines.isBuildEACache)
          //return new FileStream(fn, FileMode.Open, FileAccess.Read, FileShare.Read);
          //else
          //Kvuli DictConnector.js
          //return LMComLib.TradosLib.LocalizeXml(fn); //bez modifikace pro slovnik
          StringBuilder sb = new StringBuilder(); StringBuilder resSb = new StringBuilder();
          return LMComLib.TradosLib.LocalizeXml_ModifyXml(virtualFn, el => {
            /*if (parent != null) foreach (XText t in parent.DescendantNodes().Where(nd => nd is XText && "cross_word#make_word#sound_sentences".IndexOf(nd.Parent.Name.LocalName) < 0).ToArray()) {
                t.AddAfterSelf(dict_words(t.Value));
                t.Remove();
              };*/
            //if (parent != null) foreach (XText t in parent.DescendantNodes().Where(nd => nd is XText && "cross_word#make_word".IndexOf(nd.Parent.Name.LocalName) < 0)) t.Value = dict_words_txt(t.Value, sb, resSb);
          });
        });
        if (res.status == status_Type.start)
          res.status = status_Type.empty;
        //PZ 20.10.08 - kvůli překladům je vyhozeno cachování
        //CourseMan.toCache(dbInfo, fn);
        return res;
      }
    }

    static lm_scorm ReadLow(string fn, SiteMapNode nd) {
      string ext = Path.GetExtension(fn);
      if (ext == ".htm") {
        if (File.Exists(fn) || File.Exists(fn += ".aspx.lmdata"))
          return ReadFromFile(fn);
        else if (nd != null)
          return ReadFromSiteNode(nd);
      } else if (File.Exists(fn))
        return ReadFromFile(fn);
      throw new Exception(string.Format("Cannot find nor LMDATA or HTM file ({0})", fn));
    }

    public static lm_scorm ReadLMData(string fn) {
      return ReadFromFile(fn);
    }

    public static lm_scorm ReadUrl(string url) {
      //return ReadLow(HttpContext.Current.Server.MapPath(VirtualPathUtility.ToAbsolute(url)), null);
      return ReadLow(LMComLib.EaUrlInfoLib.MapPath(url), null);
    }

    public static lm_scorm Read(SiteMapNode nd) {
      //string fn = HttpContext.Current.Server.MapPath(VirtualPathUtility.ToAbsolute(nd.Url));
      string fn = LMComLib.EaUrlInfoLib.MapPath(nd.Url);
      lm_scorm res = ReadLow(fn, nd);
      res.SiteNode = nd;
      return res;
    }

    public static SiteMapNode getActNode() {
      return getActNode(HttpContext.Current.Request.Url.AbsolutePath);
    }

    public static SiteMapNode getActNode(string url) {
      SiteMapNode res = SiteMap.Provider.FindSiteMapNode(url);
      if (res == null) res = SiteMap.Provider.FindSiteMapNode(url.Replace(".aspx", null));
      return res;
    }

    public static lm_scorm ReadThrowSiteMap(string url) {
      SiteMapNode nd = getActNode(url); // SiteMap.Provider.FindSiteMapNode(url);
      //if (nd == null) nd = getActNode(url + ".htm"); //HACK
      return nd == null ? ReadUrl(url) : Read(nd);
    }

    static string replaceCharElements(StringBuilder buf) {
      string s = buf.ToString();
      buf.Length = 0;
      int status = 0;
      int undoIdx = 0;
      foreach (char ch in s) {
        buf.Append(ch);
        switch (status) {
          case 0:
            if (ch == '$') { undoIdx = buf.Length - 1; status = 1; }
            break;
          case 1:
            if (char.IsLetter(ch)/* || ch == '#'*/) continue;
            if (ch == ';') {
              string cont = buf.ToString(undoIdx, buf.Length - undoIdx);
              if (cont == "$ign;") buf.Length = undoIdx;
              else buf[undoIdx] = '&';
            }
            status = 0;
            break;
        }
      }
      return buf.ToString();
    }

    static void flushBuf(XmlWriter writer, StringBuilder buf) {
      if (buf.Length <= 0) return;
      writer.WriteStartElement("lm", "LMLiteral", null);
      buf.Replace("\r\n", " ");
      buf.Replace("        ", " "); buf.Replace("     ", " "); buf.Replace("   ", " "); buf.Replace("  ", " ");
      writer.WriteAttributeString("text", replaceCharElements(buf));
      writer.WriteEndElement();
      buf.Length = 0;
    }
    static void CopyNode(XmlReader reader, XmlWriter writer, StringBuilder buf, needsNumberingInfo needsNumbering) {
      if (reader.Name == "place_holder")
        return;
      switch (reader.NodeType) {
        case XmlNodeType.Element:
          if (reader.Prefix == "" || reader.Prefix == "html") {
            buf.Append("<");
            buf.Append(reader.Name);
            var isEMptyElement = reader.IsEmptyElement; var name = reader.Name;
            if (reader.MoveToFirstAttribute())
              do {
                string nm = reader.Name;
                if (nm == "xmlns")
                  continue;
                buf.Append(" "); buf.Append(nm); buf.Append("=\""); buf.Append(reader.Value); buf.Append("\"");
              }
              while (reader.MoveToNextAttribute());
            //Oprava 25.10.2014
            buf.Append(">");
            if (isEMptyElement) { buf.Append("</"); buf.Append(name); buf.Append(">"); }
          } else {
            flushBuf(writer, buf);
            writer.WriteStartElement(reader.Prefix, reader.LocalName, reader.NamespaceURI);
            writer.WriteAttributes(reader, true);
            if (needsNumbering != null) needsNumbering.addAttribute(reader.GetAttribute("ui"));
            if (reader.IsEmptyElement)
              writer.WriteEndElement();
          }
          break;
        case XmlNodeType.CDATA:
        case XmlNodeType.Text:
          //buf.Append(reader.Value.Replace(dictSpanStart, "<span w=\"y\">").Replace(dictSpanEnd, "</span>"));
          buf.Append(HttpUtility.HtmlEncode (reader.Value));
          break;
        case XmlNodeType.Whitespace:
          //if (buf.Length > 0) 
          //buf.Append (' ');
          break;
        case XmlNodeType.SignificantWhitespace:
          //if (buf.Length > 0) 
          buf.Append(' ');
          break;
        case XmlNodeType.EntityReference:
          writer.WriteEntityRef(reader.Name);
          break;
        case XmlNodeType.XmlDeclaration:
        case XmlNodeType.ProcessingInstruction:
          writer.WriteProcessingInstruction(reader.Name, reader.Value);
          break;
        case XmlNodeType.DocumentType:
          writer.WriteDocType(reader.Name, reader.GetAttribute("PUBLIC"), reader.GetAttribute("SYSTEM"), reader.Value);
          break;
        case XmlNodeType.Comment:
          break;
        case XmlNodeType.EndElement:
          if (reader.Prefix == "") {
            buf.Append("</");
            buf.Append(reader.Name);
            buf.Append(">");
          } else {
            flushBuf(writer, buf);
            writer.WriteFullEndElement();
          }
          break;
      }
    }
  }
}
