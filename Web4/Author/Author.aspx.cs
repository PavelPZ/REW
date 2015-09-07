using LMComLib;
using LMNetLib;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;
using System.Xml.Linq;

namespace Author {

  public partial class AuthorForm : System.Web.UI.Page {
    protected void Page_Load(object sender, EventArgs e) {

      //SchemaDefinition.ModifyXsd.modify();
      //defaults:
      var mode = Request["mode"];
      if (string.IsNullOrEmpty(mode)) {
        if (!IsPostBack) {
          htmlPlace.Visible = true; contentPlace.Visible = false;
          var cook = Request.Cookies.Get("author");
          if (cook != null) urlTxt.Text = cook.Value;
        }
        return;
      }
      var target = LMComLib.Targets.web;
      schools.persistTypes persistType = schools.persistTypes.persistNewEA;
      string startProcName = null;
      string rootProductId = null;
      bool forceEval = false;
      bool humanEvalMode = false;
      string hash = null;
      var reqStr = new StreamReader(Request.InputStream);
      string serverScript = reqStr.ReadToEnd();
      string errorText = null;
      var log = new LoggerMemory(true) { isVsNet = true };
      var url = Request["url"].ToLower(); var rootDir = Request["rootDir"] ?? "".ToLower();
      switch (LowUtils.EnumParse<authorModes>(mode)) {
        case authorModes.displayEx:
          target = LMComLib.Targets.author;
          persistType = schools.persistTypes.persistMemory;
          forceEval = (Request["forceEval"] ?? "").ToLower() == "true";
          humanEvalMode = (Request["humanEvalMode"] ?? "").ToLower() == "true";
          hash = "#" + XExtension.Create("vsNet".ToLower(), "vsNetExModel".ToLower(), url).Aggregate((r, i) => r + "@" + i);
          //old to new
          CourseMeta.oldeaDataType oldEaType = LowUtils.EnumParse<CourseMeta.oldeaDataType>(Request["oldEaType"] ?? CourseMeta.oldeaDataType.xml.ToString());
          if (oldEaType != CourseMeta.oldeaDataType.xml) serverScript = OldToNew.exFile.getServerScript(url, oldEaType, log);
          //no server script
          if (string.IsNullOrEmpty(serverScript)) {
            serverScript = CourseMeta.buildLib.getServerScript(vsNetServer.buildExFiles(url, log)).ToString();
            errorText = log.hasError ? log.Log() : null;
          } // xml se strankou
          else {
            //preved XML se strankou => server script
            serverScript = CourseMeta.buildLib.getServerScript(vsNetServer.buildExFiles(new MemoryStream(Encoding.UTF8.GetBytes(serverScript)), url, log)).ToString();
            errorText = log.hasError ? log.Log() : null;
          }
          if (errorText != null) { Response.Clear(); Response.Write(errorText.Replace("\r", "<br/>")); Response.End(); }
          break;
        case authorModes.displayMod:
          target = LMComLib.Targets.author;
          persistType = schools.persistTypes.persistMemory;
          forceEval = (Request["forceEval"] ?? "").ToLower() == "true";
          humanEvalMode = (Request["humanEvalMode"] ?? "").ToLower() == "true";

          if (string.IsNullOrEmpty(serverScript)) {
            if (!string.IsNullOrEmpty(rootDir)) {
              Machines._dataDir = Machines.dataDir;
              Machines._rootDir = rootDir;
            }
            serverScript = CourseMeta.buildLib.getServerScript(vsNetServer.getModuleFiles(new vsNetServer.serverContext(url, log), null, log)).ToString();
            rootProductId = Author.vsNetServer.vsNetProductId;
            errorText = log.hasError ? log.Log() : null;
          } else {
            if (serverScript.StartsWith("###")) { errorText = serverScript.Substring(3); serverScript = null; }
            rootProductId = Request["rootProductId"];
          }
          if (errorText != null) { Response.Clear(); Response.Write(errorText.Replace("\r", "<br/>")); Response.End(); }

          //var fn2 = Machines.rootDir + url.Replace('/', '\\') + "meta.xml";
          //var log2 = new LoggerMemory(true);
          //if (string.IsNullOrEmpty(sourceXml)) sourceXml = CourseMeta.buildLib.getServerScript(CourseMeta.vsNetServer.buildModFiles(url, out rootProductId, log2));
          //if (log2.hasError) { Response.Clear(); Response.Write(log2.Log().Replace("\r", "<br/>")); Response.End(); }
          break;
        case authorModes.xref:
          startProcName = "xref.Start";
          hash = "#" + XExtension.Create("xref".ToLower(), "xrefbrowsemodel".ToLower()).Aggregate((r, i) => r + "@" + i);
          Author.XrefContext.adjustXrefSitemap(new LoggerMemory(true));

          if (string.IsNullOrEmpty(serverScript)) serverScript =
            CourseMeta.buildLib.getServerScript("/author/xrefsitemap.js", File.ReadAllText(Machines.rootPath + @"Author\xrefSitemap.js")) +
            CourseMeta.buildLib.getServerScript("/author/doc.js", CourseModel.doc.mapWithDoc());
          break;
        case authorModes.doc:
          if (string.IsNullOrEmpty(serverScript)) serverScript = CourseMeta.buildLib.getServerScript("/author/doc.js", CourseModel.doc.mapWithDoc());
          hash = "#" + XExtension.Create("doc".ToLower(), "doctypesModel".ToLower()/*, "/author/doc"*/).Aggregate((r, i) => r + "@" + i);
          startProcName = "doc.Start";
          break;
        case authorModes.compileEx:
          var url4 = Request["url"].ToLower();
          Response.ClearContent();
          //var fn3 = Machines.rootDir + url4.Replace('/', '\\') + ".xml";
          var log5 = new LoggerMemory(true);
          Response.Write(CourseMeta.buildLib.getResponseScript(vsNetServer.buildExFiles(url4, log5)));
          if (log5.hasError) { Response.Clear(); Response.Write(log5.Log().Replace("\r", "<br/>")); Response.End(); }
          Response.End();
          break;
      }
      var pageContent = Packager.RewApp.HomePage(new Packager.Config() {
        target = target,
        version = schools.versions.debug,
        startProcName = startProcName,
        lang = LMComLib.Langs.en_gb,
        persistType = persistType,
        rootProductId = rootProductId,
        hash = hash,
        forceEval = forceEval,
        humanEvalMode = humanEvalMode,
      }, serverScript);
      contentPlace.Controls.Add(new LiteralControl(pageContent));
    }

    protected void checkAll_Click(object sender, EventArgs e) {
      writeTxt(Author.XrefContext.checkAllError());
    }

    protected void allToRename(object sender, EventArgs e) {
      Author.XrefContext.allToRename();
    }
    protected void dumpXml_Click(object sender, EventArgs e) {
      string url = normalizeUrl(urlTxt.Text);
      if (url.EndsWith("/") || url.EndsWith("\\")) return;

      var logger = new LoggerMemory(true) { saveDumpXml = true };
      var page = CourseMeta.ex.readPage(url.Trim(), logger);

      if (logger.hasError) logger.dumpXml.AddFirst(new XCData(logger.Log()));

      Response.Clear();
      Response.ContentType = "text/xml";
      Response.Charset = "utf-8";
      Response.Write(logger.dumpXml.ToString());
      Response.Flush();
      Response.End();
    }

    void writeTxt(string txt) {
      Response.Clear();
      Response.ContentType = "text/plain";
      Response.Charset = "utf-8";
      Response.Write(txt);
      Response.Flush();
      Response.End();
    }

    string normalizeUrl(string url) {
      url = url.Replace('\\', '/').ToLower();
      var parts = url.Split(new string[] { "rew/web4" }, StringSplitOptions.RemoveEmptyEntries);
      if (parts.Length == 2) url = parts[1];
      else {
        parts = url.Split(new string[] { "/rew/eduauthornew/" }, StringSplitOptions.RemoveEmptyEntries);
        if (parts.Length == 2) url = "/lm/oldea/" + parts[1];
      }
      url = url.Replace("/meta.xml", "/").Replace(".xml", null).Replace(".htm.aspx.lmdata", null);
      Response.Cookies.Add(new HttpCookie("author", url) { Expires = new DateTime(2020, 1, 1) });
      return url;
    }

    protected void oldEA_Click(object sender, EventArgs e) {
      string url = normalizeUrl(urlTxt.Text);
      LoggerMemory log = new LoggerMemory(true);
      CourseMeta.Lib.dataFromEA(url, log);
      if (log.hasError) { writeTxt(log.Log()); return; }

      if (url.EndsWith("/"))
        Response.Redirect("author.aspx?forceEval=true&mode=displayMod&url=" + url);
      else
        Response.Redirect("author.aspx?forceEval=true&mode=displayEx&url=" + url);
    }

    protected void urlOK_Click(object sender, EventArgs e) {
      string url = normalizeUrl(urlTxt.Text);
      if (url.EndsWith("/") || url.EndsWith("\\"))
        Response.Redirect("author.aspx?forceEval=true&mode=displayMod&url=" + url);
      else
        Response.Redirect("author.aspx?forceEval=true&mode=displayEx&url=" + url);
    }
  }
}