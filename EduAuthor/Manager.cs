using System;
using System.Data;
using System.Collections.Specialized;
using System.Collections.Generic;
using System.Resources;
using System.Configuration;
using System.Web;
using System.Xml;
using System.Web.Security;
using System.Web.UI;
using System.Web.UI.WebControls;
using System.Web.UI.WebControls.WebParts;
using System.Web.UI.HtmlControls;
using System.Text;
using System.IO;
using System.Xml.Xsl;
using System.Web.Hosting;

using LMNetLib;
using LMComLib;
using LMScormLibDOM;

namespace LMScormLib
{
  public enum SiteMapViewModes
  {
    normal,
    status,
    statusTable,
    keywords,
    template,
  }
  public static class Manager
  {
    public static design_time GetTemplateDesignTime(template_Type templ)
    {
      lm_scorm root;
      return GetTemplateDesignTime(templ, out root);
    }

    public static design_time GetTemplateDesignTime(template_Type templ, out lm_scorm root)
    {
      root = null;
      //if (templ.ToString().IndexOf("passive") == 0) return null;
      string fn = string.Format("~/Framework/Templates/{0}.htm.aspx.lmdata", templ);
      root = LMDataReader.ReadVirtual(fn);
      return root.DesignTime;
      //if (!(root.Items[0] is design_time)) return null;
      //return (design_time)root.Items[0];
    }

    static void dumpError(string url, TextWriter report, string title, object value, System.Collections.IEnumerable valids)
    {
      report.Write("<b>"); report.Write(title); report.Write(" error in "); report.Write(url); report.Write(": </b><br/>");
      if (value == null) return;
      report.Write("value: "); report.Write(value.ToString()); report.Write("<br/>");
      report.Write("valid values: ");
      foreach (object obj in valids)
      {
        report.Write("{");
        report.Write(obj.ToString());
        report.Write("}, ");
      }
      report.Write("<br/>");
    }

    public static void CheckInstructions(SiteMapNode node, TextWriter report)
    {
      try
      {
        if (node.Url.IndexOf(".wma.") >= 0 || node.Url.EndsWith(".aspx")) return;
        lm_scorm root = LMDataReader.Read(node);
        if (root.template == template_Type.unknown)
        {
          //dumpError(node.Url, report, "Unknown template", null, null);
        }
        else if (root.HasInstruction)
        {
          design_time dsgn = GetTemplateDesignTime(root.template);
          if (dsgn != null)
          {
            if (root.PageInfo.ProdInfo == null)
              throw new Exception("Unknown project in web.config");
            if (root.title == null || (!root.extra_title && !dsgn.TitleOK(root)))
              dumpError(node.Url, report, "Title", root.title, dsgn.AllTitles(root.PageInfo.ProdInfo.Lang));
            foreach (techInstr_Type instr in new techInstr_Type[] { root.instr, root.instr2, root.instr3 })
              if (instr != techInstr_Type.no && !dsgn.instrs.ContainsKey(instr))
                dumpError(node.Url, report, "Instr", instr, dsgn.instrs.Keys);
          }
        }
      }
      catch (Exception e)
      {
        dumpError(node.Url, report, "Cannot read page (" + e.Message + ")", null, null);
      }
      if (node.HasChildNodes)
        foreach (SiteMapNode nd in node.ChildNodes)
          CheckInstructions(nd, report);
    }
    public static void CheckInstructions(List<SiteMapNode> nodes, TextWriter report)
    {
      foreach (SiteMapNode nd in nodes)
        CheckInstructions(nd, report);
    }
    public static void Image_NeedResize(SiteMapNode node, TextWriter report)
    {
      lm_scorm root = LMDataReader.Read(node);
      foreach (img img in LMScormObj.GetAll(root, delegate(object obj) { return obj is img; }))
      {
        imgProps props = imgProps.getImgProps(img);
        if (!props.needsResize) continue;
        report.Write("<b>"); report.Write(HttpContext.Current.Server.MapPath( img.absoluteUrl)); report.Write("</b><br/>");
        if (img.width != 0)
        {
          report.Write("width="); report.Write(props.width); report.Write(", requestedWidth="); report.Write(img.width);
        }
        else if (img.height != 0)
        {
          report.Write("height="); report.Write(props.height); report.Write(", requestedheight="); report.Write(img.height);
        }
        report.Write("<br/>");
      }
      if (node.HasChildNodes)
        foreach (SiteMapNode nd in node.ChildNodes)
          Image_NeedResize(nd, report);
    }
    public static void Image_NeedResize(List<SiteMapNode> nodes, TextWriter report)
    {
      foreach (SiteMapNode nd in nodes)
        CheckInstructions(nd, report);
    }
    static string fileName(string url)
    {
      //return HttpContext.Current.Server.MapPath(VirtualPathUtility.ToAbsolute(url));
      return EaUrlInfoLib.MapPath(url);
    }
    static void appendAttr(XmlDocument doc, SiteMapNode node, string name, string value)
    {
      string val = node == null ? value : node[value];
      if (string.IsNullOrEmpty(val)) return;
      XmlAttribute attr = doc.CreateAttribute(name);
      attr.Value = val;
      doc.DocumentElement.Attributes.Append(attr);
    }
    //const string lmScormStart = @"<lm:lm_scorm xmlns:lm=""lm"" xmlns=""htmlPassivePage""";
    //const string designEnd = "</lm:designTime>";
    public static MemoryStream GenFromSiteMap(SiteMapNode node, out string fn)
    {
      fn = null;
      string temp = node["template"];
      if (string.IsNullOrEmpty(temp)) temp = "unknown";
      fn = fileName(node.Url);
      pageInfo pi;
      lm_scorm.infoFromFileName(fn, out pi);
      //ProjectInfo project = CourseMan.Config.ProjectFromFileName(fn);
      lm_scorm template = null;
      string templateFn = null;
      bool fakeTemplate = false; //neexistuje Template file
      if (pi.CrsInfo != null)
      {
        templateFn = fileName(string.Format("~/Framework/Templates/{0}~{1}.htm.aspx.lmdata", temp, pi.CrsInfo.Id.ToString()));
        if (File.Exists(templateFn))
          template = LMDataReader.ReadLMData(templateFn);
      }
      if (template == null)
      {
        templateFn = fileName(string.Format("~/Framework/Templates/{0}.htm.aspx.lmdata", temp));
        if (!File.Exists(templateFn)) {
          fakeTemplate = true;
          templateFn = fileName("~/Framework/Templates/unknown.htm.aspx.lmdata");
        }
        template = LMDataReader.ReadLMData(templateFn);
      }
      design_time dsgn = (design_time)template.DesignTime;
      if (dsgn == null) dsgn = new design_time();
      if (dsgn.target_extension == design_timeTarget_extension.lmdata) fn += ".aspx.lmdata";
      if (File.Exists(fn)) return null;
      XmlDocument doc = new XmlDocument();
      doc.Load(templateFn);
      //lm namespace
      XmlNamespaceManager nsmgr = new XmlNamespaceManager(doc.NameTable);
      nsmgr.AddNamespace("lm", "lm");
      //odstraneni design_time
      XmlNode nd = doc.SelectSingleNode("//lm:design_time", nsmgr);
      if (nd != null) nd.ParentNode.RemoveChild(nd);
      //template
      appendAttr(doc, null, "template", fakeTemplate ? "unknown" : node["template"]); //kdyz neexistuje template file, chape se jako unknown
      //attrs
      appendAttr(doc, node, "title", "instruction");
      appendAttr(doc, node, "instr", "instr");
      appendAttr(doc, node, "instr2", "instr2");
      appendAttr(doc, node, "instr3", "instr3");
      //XXXXXX
      MemoryStream ms = new MemoryStream(Encoding.UTF8.GetBytes(doc.OuterXml));
      pageInfo PageInfo;
      lm_scorm.infoFromFileName(fn, out PageInfo);
      //if (PageInfo.ProdInfo != null && PageInfo.ProdInfo.IsOldToNew) //HACK
      //  resultMs = OldToNewMan.FinishOldToNew(resultMs, PageInfo);
      //return
      ms.Seek(0, SeekOrigin.Begin);
      return ms;
      //return doc.OuterXml;
    }
    public static void GenFromSiteMap(List<SiteMapNode> nodes, TextWriter report)
    {
      foreach (SiteMapNode nd in nodes)
        GenFromSiteMap(nd, report);
    }
    public static void GenFromSiteMap(SiteMapNode node, TextWriter report)
    {
      string fn;
      MemoryStream ms = GenFromSiteMap(node, out fn);
      if (ms != null)
      {
        LowUtils.AdjustFileDir(fn);
        StringUtils.StreamToFile(ms, fn);
      }
      report.Write("<b>");
      report.Write(node.Url);
      if (ms != null)
        report.WriteLine("</b> successfully generated<br/>");
      else
        report.WriteLine("</b> **** ERROR (missing template attribute or file already exists)<br/>");
      if (node.HasChildNodes)
        foreach (SiteMapNode nd in node.ChildNodes)
          GenFromSiteMap(nd, report);
    }
    static void RefreshTitleResource(string file, TextWriter report)
    {
      XmlDocument doc = new XmlDocument();
      file = HttpContext.Current.Server.MapPath(VirtualPathUtility.ToAbsolute(file));
      doc.Load(file);
      XmlNodeList nodes = doc.SelectNodes("//*");
      string filename = Path.GetFileName(file) + ".resx";
      filename = string.Concat(HttpRuntime.AppDomainAppPath, @"App_GlobalResources\", filename);
      LowUtils.AdjustFileDir(filename);
      int resId = 0;
      using (ResXResourceWriter wr = new ResXResourceWriter(filename))
        foreach (XmlNode nd in nodes)
        {
          XmlAttribute titleAttr = (XmlAttribute)nd.Attributes.GetNamedItem("title");
          if (titleAttr == null || string.IsNullOrEmpty(titleAttr.Value)) continue;
          string id = string.Format("id_{0}", resId++);
          XmlAttribute attr = (XmlAttribute)nd.Attributes.GetNamedItem("resourceKey");
          if (attr == null)
          {
            attr = doc.CreateAttribute("resourceKey");
            nd.Attributes.Append(attr);
          }
          attr.Value = id;
          wr.AddResource(id, titleAttr.Value);
        }
      report.Write("<b>");
      report.Write(filename);
      report.WriteLine("</b> successfully generated<br/>");
      doc.Save(file);
    }
    public static void RefreshTitleResource(string[] files, TextWriter report)
    {
      foreach (string file in files)
        RefreshTitleResource(file, report);
    }
    public static void RefreshLMDataResource(List<SiteMapNode> nodes, TextWriter report)
    {
      foreach (SiteMapNode nd in nodes)
        RefreshLMDataResource(nd, report);
    }
    /*static bool isChinesse(char ch)
    {
      return Convert.ToInt32(ch) > 10000;
    }
    static char? isChinesse(string txt)
    {
      foreach (char ch in txt)
        if (isChinesse(ch)) return ch;
      return null;
    }
    static void ChineseIgn(string fn, TextWriter report)
    {
      string ext = Path.GetExtension(fn);
      //if (ext != ".htm" && ext != ".old") return;
      if (ext != ".htm") return;
      if (!File.Exists(fn) && !File.Exists(fn += ".aspx.old")) return;
      report.WriteLine(fn); report.WriteLine("<br/>");
      XmlDocument doc = new XmlDocument();
      doc.Load(fn);
      bool repl = false;
      XmlNodeList texts = doc.SelectNodes("//text()");
      char? ch;
      foreach (XmlText txt in texts)
      {
        if ((ch = isChinesse(txt.Value))!=null && txt.Value.IndexOf("$ign;") < 0)
        {
          report.WriteLine(txt.Value); report.WriteLine("="); report.WriteLine(ch); report.WriteLine(":"); report.WriteLine(Convert.ToInt32(ch)); report.WriteLine("<br/>");
          repl = true;
          txt.Value = "$ign;" + txt.Value;
        }
      }
      //if (repl)
        //doc.Save(fn);
    }
    static bool makePiniynCorrect(XmlText txt, StringBuilder sb)
    {
      sb.Length = 0;
      sb.Append(txt.Value);
      sb.Replace('，', ',');
      if (txt.Value == sb.ToString()) return false;
      txt.Value = sb.ToString();
      return true;
    }
    static void addChineseIgn (string fn, TextWriter report)
    {
      string ext = Path.GetExtension(fn);
      if (ext != ".htm") return;
      if (!File.Exists(fn) && !File.Exists(fn += ".aspx.old")) return;
      report.WriteLine(fn); report.WriteLine("<br/>");
      XmlDocument doc = new XmlDocument();
      doc.Load(fn);
      XmlNamespaceManager nsmgr = new XmlNamespaceManager(doc.NameTable);
      nsmgr.AddNamespace("lm", "lm");
      nsmgr.AddNamespace("html", "htmlPassivePage");
      bool repl = false;
      XmlNodeList texts = doc.SelectNodes("//html:piniyn/text()", nsmgr);
      StringBuilder sb = new StringBuilder();
      foreach (XmlText txt in texts)
        if (makePiniynCorrect(txt, sb)) repl = true;
      if (repl)
        doc.Save(fn);
    }
    public static void ChineseIgn(SiteMapNode node, TextWriter report)
    {
      string fn = HttpContext.Current.Server.MapPath(VirtualPathUtility.ToAbsolute(node.Url));
      ChineseIgn (fn,report);
      if (!node.HasChildNodes) return;
      foreach (SiteMapNode nd in node.ChildNodes)
        ChineseIgn(nd, report);
    }
    public static void ChineseIgn(List<SiteMapNode> nodes, TextWriter report)
    {
      foreach (SiteMapNode nd in nodes)
        ChineseIgn(nd, report);
    }*/
    public static void RefreshLMDataResource(SiteMapNode node, TextWriter report)
    {
      if (VirtualPathUtility.GetExtension(node.Url) == ".htm")
      {
        lm_scorm root = LMDataReader.Read(node);
        if (LocalizeLMData.LMData2ResX(root,
          delegate(List<string> keys, List<string> values)
          {
            return LocalizeLMData.createResx(fileName(node.Url), keys, values);
          }))
        {
          report.Write("<b>");
          report.Write(node.Url);
          report.WriteLine("</b> successfully exported<br/>");
        }
      }
      else if (node.Url.EndsWith(".wma.aspx"))
      {
        string fn = fileName(node.Url).Replace("aspx", "lmap");
        Markers markers = LMScormLib.MarkersLib.ReadFileMap(fn);
        if (LocalizeLMData.LMap2ResX(markers,
          delegate(List<string> keys, List<string> values)
          {
            return LocalizeLMData.createResx(fn, keys, values);
          }))
        {
          report.Write("<b>");
          report.Write(node.Url);
          report.WriteLine("</b> successfully exported<br/>");
        }
      }
      if (node.HasChildNodes)
        foreach (SiteMapNode nd in node.ChildNodes)
          RefreshLMDataResource(nd, report);
    }
    public static void AspxFromLmdata(SiteMapNode node, TextWriter report)
    {
    }
    public static void AspxFromLmdata(List<SiteMapNode> nodes, TextWriter report)
    {
      foreach (SiteMapNode nd in nodes)
        AspxFromLmdata(nd, report);
    }
    public static void XsltTransform(List<SiteMapNode> nodes, TextWriter report)
    {
      foreach (SiteMapNode nd in nodes)
        XsltTransform(nd, report);
    }
    //public static string basicPath = @"q:\LMNet2\WebApps\EduAuthorNew\"; 
    public class XsltTransformPar
    {
      static public XsltTransformPar getXsltTransformPar(bool isManager)
      {
        string name = isManager ? "Manager" : "Transform";
        lock (typeof(XsltTransformPar))
        {
          //string fn =  basicPath + string.Format(@"Framework\Schemas\{0}.xsl", id);
          string fn = HttpContext.Current.Server.MapPath(string.Format(@"~/Framework/Schemas/{0}.xsl", name));
          XsltTransformPar res = (XsltTransformPar)CourseMan.fromCache(fn);
          if (res != null) return res;
          if (!File.Exists(fn))
            throw new Exception(string.Format("XSLT transformation in file {0} not found", fn));
          res = new XsltTransformPar();
          res.actTrans = new XslCompiledTransform();
          string s = StringUtils.FileToString(fn);
          using (XmlReader rdr = XmlReader.Create(new StringReader(s)))
            res.actTrans.Load(rdr);
          CourseMan.toCache(res, fn);
          return res;
        }
      }
      public XslCompiledTransform actTrans;
    }

    public static XslCompiledTransform loadXSLT (string fn)
    {
      XslCompiledTransform res = new XslCompiledTransform();
      XsltSettings set = new XsltSettings();
      XmlUrlResolver resolver = new XmlUrlResolver();
      set.EnableDocumentFunction = true;
      res.Load(fn, set, resolver);
      //dbInfo.Load(fn);
      return res;
    }

    public static void XsltTransform(SiteMapNode node, TextWriter report)
    {
      if (node == SiteMap.RootNode)
        foreach (string f in templates)
          XsltTransform(HostingEnvironment.ApplicationPhysicalPath + f);
      string fn = HttpContext.Current.Server.MapPath(VirtualPathUtility.ToAbsolute(node.Url));
      if (XsltTransform(fn))
        report.WriteLine(node.Url); report.WriteLine("<br/>");
      if (!node.HasChildNodes) return;
      foreach (SiteMapNode nd in node.ChildNodes)
        XsltTransform(nd, report);
    }

    public static bool XsltTransform(string fn)
    {
      string ext = Path.GetExtension(fn);
      if (ext != ".htm" && ext != ".lmdata" /*lmdata_*/) return false;
      if (!File.Exists(fn) && !File.Exists(fn += ".aspx.lmdata")) return false;
      using (XmlReader rdr = XmlReader.Create(new StringReader(StringUtils.FileToString(fn))))
      using (XmlTextWriter wr = new XmlTextWriter(fn, Encoding.UTF8))
        XsltTransformPar.getXsltTransformPar(true).actTrans.Transform(rdr, wr);
      return true;
    }

    public class listPar
    {
      internal listPar(string listType)
      {
        string fn = string.Format("~/Framework/Schemas/{0}.xsl", listType);
        fn = HttpContext.Current.Server.MapPath(VirtualPathUtility.ToAbsolute(fn));
        if (!File.Exists(fn))
          throw new Exception(string.Format("XSLT transformation in file {0} not found ({1})", fn, listType));
        //trans = new XslCompiledTransform();
        //trans.Load(fn);
        trans = loadXSLT(fn);
        writer = new StringWriter(buf);
      }
      internal bool writeFile(SiteMapNode node, string fn)
      {
        if (!File.Exists(fn)) return false;
        writer.WriteLine("<b>"); writer.WriteLine(node.Url); writer.WriteLine("</b><br/>");
        //trans.Transform(fn, XsltExtension.addExtension(fn, HttpRuntime.AppDomainAppPath), writer); //HACK
        writer.WriteLine("<br/>");
        return true;
      }
      internal void report(TextWriter report)
      {
        buf.Replace("$trans;", null);
        buf.Replace("$del;", null);
        //buf.Replace("$ign;", null);
        buf.Replace("(", null);
        buf.Replace(")", null);
        report.Write(buf.ToString());
      }
      internal XslCompiledTransform trans;
      //internal XslCompiledTransform transHtml;
      internal StringBuilder buf = new StringBuilder();
      StringWriter writer;
    }
    public static void ListText(SiteMapNode node, TextWriter report, string listType, listPar par)
    {
      bool root = par == null;
      if (root)
        par = new listPar(listType);
      string fn = HttpContext.Current.Server.MapPath(VirtualPathUtility.ToAbsolute(node.Url));
      if (!par.writeFile(node, fn))
        par.writeFile(node, fn + ".aspx.lmdata");
      if (node.HasChildNodes)
        foreach (SiteMapNode nd in node.ChildNodes)
          ListText(nd, report, listType, par);
      if (root)
        par.report(report);
    }
    public static void ListText(List<SiteMapNode> nodes, TextWriter report, string listType, listPar par)
    {
      bool root = par == null;
      if (root)
        par = new listPar(listType);
      foreach (SiteMapNode nd in nodes)
        ListText(nd, report, listType, par);
      if (root)
        par.report(report);
    }
    static string[] wmaCrit = new string[] { "WMA" };
    static string[] viewCriterium(SiteMapNode node, SiteMapViewModes mode)
    {
      if (node.Url.IndexOf(".wma.") >= 0) return wmaCrit;
      lm_scorm root = LMDataReader.Read(node);
      switch (mode)
      {
        case SiteMapViewModes.template: return new string[] { root.template.ToString() };
        case SiteMapViewModes.status:
        case SiteMapViewModes.statusTable:
          return new string[] { root.status.ToString() };
        case SiteMapViewModes.keywords: return root.keywords == null ? null : root.keywords.Split(' ');
        default: return null;
      }
    }
    public class fakeProvider : SiteMapProvider
    {
      public override SiteMapNode FindSiteMapNode(string rawUrl)
      {
        return null;
      }
      public override SiteMapNodeCollection GetChildNodes(SiteMapNode node)
      {
        return null;
      }
      public override SiteMapNode GetParentNode(SiteMapNode node)
      {
        return null;
      }
      protected override SiteMapNode GetRootNodeCore()
      {
        return null;
      }

    }
    static string[] defaultCrit = new string[] { "null" };
    public static List<SiteMapNode> sortSiteMapView(SiteMapNode node, SiteMapViewModes mode, string value)
    {
      List<SiteMapNode> res = new List<SiteMapNode>();
      foreach (SiteMapNode nd in LowUtils.allNodes(node))
      {
        string[] crits = viewCriterium(nd, mode);
        if (crits == null) crits = defaultCrit;
        foreach (string crit in crits)
          if (crit == value) { res.Add(nd); continue; }
      }
      return res;
    }
    public static Dictionary<string, List<SiteMapNode>> sortSiteMapView(SiteMapNode node, SiteMapViewModes mode)
    {
      Dictionary<string, List<SiteMapNode>> dict = new Dictionary<string, List<SiteMapNode>>();
      foreach (SiteMapNode nd in LowUtils.allNodes(node))
      {
        string[] crits = viewCriterium(nd, mode);
        if (crits == null) crits = defaultCrit;
        List<SiteMapNode> list;
        foreach (string crit in crits)
        {
          string myCrit = string.IsNullOrEmpty(crit) ? "null" : crit;
          if (!dict.TryGetValue(myCrit, out list))
          {
            list = new List<SiteMapNode>();
            dict.Add(myCrit, list);
          }
          list.Add(nd);
        }
      }
      return dict;
    }
    public static SiteMapNode CreateSiteMapView(SiteMapNode node, SiteMapViewModes mode)
    {
      Dictionary<string, List<SiteMapNode>> dict = sortSiteMapView(node, mode);
      fakeProvider prov = new fakeProvider();
      SiteMapNode res = new SiteMapNode(prov, node.Key);
      res.ChildNodes = new SiteMapNodeCollection();
      res.Url = node.Url; res.Title = node.Title;
      foreach (KeyValuePair<string, List<SiteMapNode>> de in dict)
      {
        SiteMapNode nd = new SiteMapNode(prov, de.Key); nd.Url = res.Url; nd.Title = de.Key;
        res.ChildNodes.Add(nd);
        nd.ChildNodes = new SiteMapNodeCollection();
        foreach (SiteMapNode subNd in de.Value)
        {
          if (subNd.HasChildNodes) continue;
          SiteMapNode newNd = subNd.Clone(false);
          nd.ChildNodes.Add(newNd);
        }
      }
      return res;
    }
    public static void countLangExercises(TextWriter report)
    {
      //XslCompiledTransform trans = new XslCompiledTransform();
      //trans.Load(@"Q:\lmnet2\WebApps\EduAuthor\Framework\Schemas\CountEE.xsl");
      XslCompiledTransform trans = loadXSLT(@"Q:\lmnet2\WebApps\EduAuthor\Framework\Schemas\CountEE.xsl");
      StringBuilder sb = new StringBuilder();
      XmlWriter wr = XmlWriter.Create(sb);
      wr.WriteStartElement("root");
      foreach (string fn in langExercises)
      {
        wr.WriteStartElement("title");
        wr.WriteAttributeString("title", fn);
        wr.WriteStartAttribute("count");
        trans.Transform(@"Q:\lmnet2\WebApps\Author\App_Data\Books\" + fn, wr);
        wr.WriteEndAttribute();
        wr.WriteEndElement();
      }
      wr.WriteEndElement();
      wr.Flush();
      report.Write(HttpUtility.HtmlEncode(sb.ToString()));
    }
    static string[] templates = new string[] {
@"Framework\Templates\AnswersDragging_Eval.htm.aspx.lmdata_",
@"Framework\Templates\AnswersFillin_Eval.htm.aspx.lmdata_",
@"Framework\Templates\Classification.htm.aspx.lmdata_",
@"Framework\Templates\DialogueDragging.htm.aspx.lmdata_",
@"Framework\Templates\DialogueFillin.htm.aspx.lmdata_",
@"Framework\Templates\DialoguePinyinDragging.htm.aspx.lmdata_",
@"Framework\Templates\DialoguePinyinFillin.htm.aspx.lmdata_",
@"Framework\Templates\Dictation.htm.aspx.lmdata_",
@"Framework\Templates\DictationPinyin.htm.aspx.lmdata_",
@"Framework\Templates\MultipleChoice.htm.aspx.lmdata_",
@"Framework\Templates\MultipleChoice_Eval.htm.aspx.lmdata_",
@"Framework\Templates\newWordsA.htm.aspx.lmdata_",
@"Framework\Templates\NewWordsF.htm.aspx.lmdata_",
@"Framework\Templates\pairing.htm.aspx.lmdata_",
@"Framework\Templates\pairingTrans.htm.aspx.lmdata_",
@"Framework\Templates\pinyinPractice.htm.aspx.lmdata_",
@"Framework\Templates\readandListenDialogue.htm.aspx.lmdata_",
@"Framework\Templates\ReadandListenDialogueA.htm.aspx.lmdata_",
@"Framework\Templates\ReadAndListenText.htm.aspx.lmdata_",
@"Framework\Templates\ReadandListenTextA.htm.aspx.lmdata_",
@"Framework\Templates\sentenceSequencing.htm.aspx.lmdata_",
@"Framework\Templates\SingleChoice.htm.aspx.lmdata_",
@"Framework\Templates\SingleChoice_Eval.htm.aspx.lmdata_",
@"Framework\Templates\Sound_MultipleChoice.htm.aspx.lmdata_",
@"Framework\Templates\Sound_MultipleChoice_Eval.htm.aspx.lmdata_",
@"Framework\Templates\sound_Pairing.htm.aspx.lmdata_",
@"Framework\Templates\Sound_SentenceSequencing.htm.aspx.lmdata_",
@"Framework\Templates\Sound_SingleChoice.htm.aspx.lmdata_",
@"Framework\Templates\sound_SingleChoice_Eval.htm.aspx.lmdata_",
@"Framework\Templates\Sound_TextDragging.htm.aspx.lmdata_",
@"Framework\Templates\Sound_TextFillin.htm.aspx.lmdata_",
@"Framework\Templates\sound_TrueFalse.htm.aspx.lmdata_",
@"Framework\Templates\SoundAnswersFillin_Eval.htm.aspx.lmdata_",
@"Framework\Templates\SoundedText_Pairing.htm.aspx.lmdata_",
@"Framework\Templates\soundPairing.htm.aspx.lmdata_",
@"Framework\Templates\SoundSingleChoice_Eval.htm.aspx.lmdata_",
@"Framework\Templates\TableDragging.htm.aspx.lmdata_",
@"Framework\Templates\tableFillin.htm.aspx.lmdata_",
@"Framework\Templates\Text_TextDragging.htm.aspx.lmdata_",
@"Framework\Templates\Text_TextFillin.htm.aspx.lmdata_",
@"Framework\Templates\TextDragging.htm.aspx.lmdata_",
@"Framework\Templates\TextDragging_Eval.htm.aspx.lmdata_",
@"Framework\Templates\TextFillin.htm.aspx.lmdata_",
@"Framework\Templates\TextFillin_Eval.htm.aspx.lmdata_",
@"Framework\Templates\TextPinyinDragging.htm.aspx.lmdata_",
@"Framework\Templates\TextPinyinFillin_Eval.htm.aspx.lmdata_",
@"Framework\Templates\Unknown.htm.aspx.lmdata_",
@"Framework\Templates\WordPinyinSequencing_Eval.htm.aspx.lmdata_",
@"Framework\Templates\WordSequencing.htm.aspx.lmdata_",
@"Framework\Templates\wordSequencing_Eval.htm.aspx.lmdata_",
@"Framework\Instructions\Instructions.lmdata"
  };

    static string[] langExercises = new string[] {
@"HueberBienMirado.xml",
@"HueberEnglish1.xml",
@"HueberEnglish2.xml",
@"HueberEnglish3.xml",
@"HueberEnglish4.xml",
@"HueberEnglishBasicCourse.xml",
@"HueberFrench1.xml",
@"HueberFrench2.xml",
@"HueberFrench3.xml",
@"HueberItalian1.xml",
@"HueberItalian2.xml",
@"HueberItalian3.xml",
@"HueberMirada.xml",
@"HueberMirada3.xml",
@"HueberTangram.xml",
@"HueberTangram2.xml",
@"HueberTangram3.xml"};
  }
}
