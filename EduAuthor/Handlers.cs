/*
Build EA internet cache
- Server nesmi byt v key="Machines.LMCom"
- Build config je ConfigOnlineCourse

1. v Q:\LMNet2\WebApps\eduauthornew\app_code\Handlers.cs, LMCom_BeginRequest se vola ConfigLow.OnBeginRequest
2. v ConfigLow.OnBeginRequest se inicializuje EA config a vklada se do HttpContext.Current.Items[c_configKey]. Config je dostupny pres ConfigLow.actConfig().
3. je-li Machines.isLMCom (key="Machines.LMCom" v web.config), pak se vzdy pripravuje ConfigCourse config (v ConfigLow.createLMComConfig)
4. Machines.isLMCom se natvrdo prenastavi na true (a zaroven se nastavi ConfigCourse.IsDeployment), pokud:
- neni Machines.isLMCom
- config z headeru (vysledek EADeploment wget) nebo z DeploymentConfig.oldNew je typu ConfigOnlineCourse
- vedlejsi efekt: jelikoz Machines.isLMCom je staticka promenna, predchozi podminka zmeni globalni vlastnosti aplikace.
- zmena Machines.isLMCom na zaklade ConfigOnlineCourse se pamatuje v ConfigOnlineCourse.IsDeployment pro rizeni generace a cachovani

EA Cachovani do q:\LMNet2\WebApps\EduAuthorNew\app_data\Cache\
1. deje se v Q:\lmcom\lmcomlib\lib\DiskCache.cs
2. musi byt Machines.isLMCom a nesmi byt Machines.doEaCache (key="Machines.NoCache" v web.config)
3. take nesmi byt ConfigOnlineCourse.IsDeployment, to se pak necachuje
4. pri ConfigOnlineCourse.IsDeployment se neprovadi substituce runtime informaci a ve strance zustava [#LMScormLib.LMScormClientScript.runtimeUserInfo#] (stejne, jako tomu je v souboru v cache)

 */
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Security.Permissions;
using System.Text;
using System.Threading;
using System.Web;
using System.Web.Caching;
using System.Web.Hosting;
using System.Web.UI;
using System.Web.UI.WebControls;
using System.Xml.Linq;
using LMComLib;
using LMNetLib;
using LMScormLibDOM;

namespace LMScormLib {

  public class LMDataControl : UserControl {
    [PersistenceMode(PersistenceMode.InnerProperty)]
    public Xml XmlData {
      get { return null; }
      set { data = value.Document.OuterXml; }
    }
    public lm_scorm GetData(string lang) {
      XElement root = XElement.Parse(data);
      string fn = Server.MapPath(Request.Url.AbsolutePath);
      foreach (XAttribute attr in root.Descendants().Where(el => el.Name.Namespace == TradosLib.lm).Select(el => el.Attribute("title")).Where(a => a != null && a.Parent.Attribute("id") != null))
        attr.Value = CSLocalize.localize(TradosLib.LMDataControlResId(fn, attr), LocPageGroup.EA_Code, attr.Value);
      lm_scorm dt = LMDataReader.ReadFromFileEx(fn, true, delegate() {
        return new MemoryStream(Encoding.UTF8.GetBytes(root.ToString()));
      });
      return dt;
    }
    string data;
    public Dictionary<string, lm_scorm> Data = new Dictionary<string, lm_scorm>();
    protected override void CreateChildControls() {
      Ctrl.ExpandChildControls(Page, this, GetData(Thread.CurrentThread.CurrentUICulture.Name));
    }
    protected override void OnInit(EventArgs e) {
      EnsureChildControls();
      base.OnInit(e);
    }
  }

  public class BlankPage : Page {
  }

  public class NoScriptPage : Page {
  }

  public class FakePage : Page {
    public lm_scorm Data;
    public virtual Control getChildPlace() {
      return LowUtils.FindControlEx(LowUtils.FindControlEx(this, "LessonContent"), "Childs");
    }
    protected override void CreateChildControls() {
      Data = lm_scorm.getActRoot();
      Ctrl.ExpandChildControls(this, this, Data);
    }

    protected override void OnInit(EventArgs e) {
      EnsureChildControls();
      base.OnInit(e);
    }
  }

  [AspNetHostingPermission(SecurityAction.Demand, Level = AspNetHostingPermissionLevel.Medium)]
  [AspNetHostingPermission(SecurityAction.InheritanceDemand, Level = AspNetHostingPermissionLevel.High)]
  public sealed class HtmlVirtualPathProvider : VirtualPathProvider {

    public class HtmlVirtualFile : VirtualFile {
      public HtmlVirtualFile(string virtualPath) : base(virtualPath) { }

      const string fakepage =
@"<%@ Page Language=""C#"" Title=""LANGMaster"" Inherits=""LMScormLib.FakePage"" MasterPageFile=""{0}.master"" %>
  <asp:Content contentplaceholderid=""LessonContent"" runat=""Server"">
    <asp:PlaceHolder ID=""Childs"" runat=""server"" />
</asp:Content>
";
      const string blankPage =
@"<%@ Page Language=""C#"" Title=""LANGMaster"" Inherits=""LMScormLib.BlankPage"" MasterPageFile=""{0}.master"" %>
";
      const string noScriptPage =
@"<%@ Page Language=""C#"" Title=""LANGMaster"" Inherits=""LMScormLib.NoScriptPage"" MasterPageFile=""{0}.master"" %>
<%@ OutputCache Location=""None"" %>
";


      public override Stream Open() {
        lock (typeof(HtmlVirtualFile)) {
          byte[] mem;
          SiteMapNode nd = LMDataReader.getActNode();
          //Kvuli UpdatePanelu pro REWISE: update stranka ma .ASPX extenzi
          /*Uri uri = HttpContext.Current.Request.Url;
          nd = SiteMap.Provider.FindSiteMapNode(uri.AbsolutePath.Replace(".aspx", null));
          if (nd == null)
            nd = SiteMap.CurrentNode;
          string queryObj = uri.Query;
          if (queryObj.IndexOf("_TSM_HiddenField_=") > 0)
            nd = SiteMap.Provider.FindSiteMapNode(uri.AbsolutePath.Replace(".aspx",null));
          else 
            nd = SiteMap.CurrentNode;*/
          //Gramatika?
          SiteMapNode subNd = nd;
          string temp = null;
          while (subNd != null) {
            if (subNd["specialNode"] == "bookRoot") {
              temp = "bookPage"; break;
            }
            subNd = subNd.ParentNode;
          }
          if (temp == null) temp = nd == null ? null : nd["template"];
          string pgAspx = fakepage;
          string master = "~/Framework/Page";
          if (temp == "lmsModule") master = "~/Framework/lms/LmsModule";
          else if (temp == "lmsTop") master = "~/Framework/lms/LmsTop";
          else if (temp == "lmsResult") master = "~/Framework/lms/LmsResult";
          else if (temp == "lmsHome") master = "~/Framework/lms/LmsHome";
          else if (temp == "lmsCourseLangHome") master = "~/Framework/Controls/Course/LangHome";
          else if (temp == "lmsCourseVyspaHome") master = "~/Vyspa1/VyspaHome";
          else if (temp == "lmsCourseHome") master = "~/Framework/Controls/Course/CourseHome";
          else if (temp == "lmsCourseLangCDHome") master = "~/Framework/Controls/Course/LangCDHome";
          else if (temp == "lmsLangHomeNew") master = "~/Framework/Controls/Course/LangHomeNew";
          else if (temp == "lmsCourseRun") master = "~/Framework/Controls/Course/Run";
          else if (temp == "lmsCourseMP3") master = "~/Framework/Controls/Course/MP3";
          else if (temp == "lmsCourseContent") master = "~/Framework/Controls/Course/Content";
          else if (temp == "lmsCourseSetStart") master = "~/Framework/Controls/Course/SetStart";
          else if (temp == "lmsCourseResult") master = "~/Framework/Controls/Course/Result";
          else if (temp == "lmsCourseInstall") master = "~/Framework/Controls/Course/Install";
          else if (temp == "lmsCourseUpdate") master = "~/Framework/Controls/Course/Update";
          else if (temp == "lmsCourseRegister") master = "~/Framework/Controls/Course/Register";
          else if (temp == "bookPage") master = "~/Framework/Controls/Course/bookPage";
          else if (temp == "lmsLicenceAgree") {
            master = "~/Framework/Controls/Course/LicenceAgree";
            pgAspx = noScriptPage;
          } else if (temp == "RwLangHome") {
            master = "~/Rewise/LangHome";
            pgAspx = blankPage;
          } else if (temp == "RwCourseHome") {
            master = "~/Rewise/CourseHome";
            pgAspx = blankPage;
          } else if (temp == "RwLesson") {
            master = "~/Rewise/LessonHome";
            pgAspx = blankPage;
          }
          //else if (temp == "lmsResult") master = string.IsNullOrEmpty(nd.ParentNode["isTestOf"]) ? "lms/LmsResult" : "lms/LmsResultTest";
          //else if (temp == "lmsHome") master = string.IsNullOrEmpty(nd.ParentNode["isTestOf"]) ? "lms/LmsHome" : "lms/LmsHomeTest";
          //else if (nd != null && nd.HasChildNodes && temp == "passive_Home") master = "Lesson";
          mem = Encoding.UTF8.GetBytes(string.Format(pgAspx, master));
          MemoryStream ms = new MemoryStream();
          ms.WriteByte(239); ms.WriteByte(187); ms.WriteByte(191); //UTF8 signature
          ms.Write(mem, 0, mem.Length);
          ms.Seek(0, SeekOrigin.Begin);
          return ms;
        }
      }

    }

    public static void AppInitialize() {
      HtmlVirtualPathProvider myVpp = new HtmlVirtualPathProvider();
      myVpp.InitializeLifetimeService();
      HostingEnvironment.RegisterVirtualPathProvider(myVpp);
    }

    bool isHtmlFile(string virtualPath) {
      //EaUrlInfo ui = EaUrlInfo.Instance;
      //return ui != null && ui.type == pageType.course;
      //string fileName = HttpContext.Current.Server.MapPath(virtualPath);
      string fileName = EaUrlInfoLib.MapPath(virtualPath);
      if (File.Exists(fileName) || fileName.IndexOf("404") > 0) return false;
      if (HttpContext.Current != null) HttpContext.Current.Trace.Write("isHtmlFile: " + fileName);
      return VirtualPathUtility.GetExtension(virtualPath) == ".aspx";
    }

    public override VirtualFile GetFile(string virtualPath) {
      if (isHtmlFile(virtualPath))
        return new HtmlVirtualFile(virtualPath);
      return Previous.GetFile(virtualPath);
    }
    public override bool FileExists(string virtualPath) {
      if (isHtmlFile(virtualPath))
        return true;
      return Previous.FileExists(virtualPath);
    }
    public override bool DirectoryExists(string virtualDir) {
      return Previous.DirectoryExists(virtualDir);
    }
    public override VirtualDirectory GetDirectory(string virtualDir) {
      return Previous.GetDirectory(virtualDir);
    }
    public override CacheDependency GetCacheDependency(string virtualPath, System.Collections.IEnumerable virtualPathDependencies, DateTime utcStart) {
      if (Machines.doEaCache(null))
        return null;  //cachovat

      if (!isHtmlFile(virtualPath))
        return base.GetCacheDependency(virtualPath, virtualPathDependencies, utcStart);

      //string fileName = HttpContext.Current.Server.MapPath(virtualPath);
      string fileName = EaUrlInfoLib.MapPath(virtualPath);
      string fn = File.Exists(fileName + ".lmdata") ? fileName + ".lmdata" : fileName.Remove(fileName.Length - 5);

      List<string> deps = new List<string>();
      if (virtualPathDependencies != null)
        foreach (string s in virtualPathDependencies)
          if (string.Compare(s, virtualPath, true) != 0) deps.Add(s);

      if (!File.Exists(fn))
        return new CacheDependency(null, deps.ToArray(), utcStart);
      else
        return new CacheDependency(new string[] { fn }, deps.ToArray(), utcStart);

    }
  }

  //Typ stranky
  public enum pageType {
    no, //ostatni stranky
    courseAspx, //existujici ASPX kurzu
    course, //virtualni ASPX stranka kurzu (vytvari se z .LMDATA souboru)
  }
  //typ redirectu
  public enum RedirectType {
    no,
    Rewrite,
    Redirect,
    Execute,
    WriteFile,
  }

  public class EaUrlInfo {

    public static EaUrlInfo HackEaUrlInfo(string url) {
      EaUrlInfo res = new EaUrlInfo();
      res.oldUrl = null; // ("~/" + url + ".htm").ToLowerInvariant();
      res.CourseNode = null; // SiteMap.Provider.FindSiteMapNode(res2.oldUrl);
      //string fn = HostingEnvironment.MapPath(res2.oldUrl);
      HttpContext.Current.Items[c_EaUrlInfo] = res;
      //string fn = @"q:\LMNet2\WebApps\EduAuthorNew\" + url.Replace('/', '\\') + ".htm";
      res.fileName = HostingEnvironment.MapPath("~/" + url + ".htm");
      //throw new Exception(fn);
      if (!htmFilter.Any(f => url.IndexOf(f) >= 0)) res.fileName += ".aspx.lmdata";
      //res2.root = LMDataReader.ReadFromFile(@"q:\LMNet2\WebApps\EduAuthorNew\" + url.Replace('/', '\\') + ".htm.aspx.old");
      res.root = LMDataReader.ReadFromFile(res.fileName);
      res.root.SiteNode = SiteMap.Provider.FindSiteMapNode("~/" + url + ".htm");
      res.type = pageType.course;
      return res;
    } EaUrlInfo() { }
    static string[] htmFilter = new string[] { "/kub/", "/grammar/", "/funlang/", "/grammatika/", "vkrateredejstvujuscevovulkana2" };

    public EaUrlInfo(string url, string query) {
      oldUrl = url.ToLowerInvariant();
      string rawUrl = oldUrl.Replace(".aspx", null);
      string ext = VirtualPathUtility.GetExtension(url);
      //try { CourseNode = SiteMap.Provider.FindSiteMapNode(rawUrl); } catch { CourseNode = null; }
      CourseNode = SiteMap.Provider.FindSiteMapNode(rawUrl);
      string fn = HostingEnvironment.MapPath(url);
      clientCache = true;
      if (CourseNode != null) { //Course stranka ze sitemap
        redirectType = RedirectType.Rewrite;
        RewriteUrl = rawUrl + ".aspx";
        if (ext != ".aspx") fn = fn + ".aspx";
        type = File.Exists(fn) ? pageType.courseAspx : pageType.course; //budto explicitni ASPX nebo LMDATA
        //type = pageType.course; //HACK
        clientCache = false;
      } else if (ext != ".aspx") { //Libovolna non stranka
        if (File.Exists(fn)) {//Non ASPX a file existuje
          redirectType = RedirectType.WriteFile;
          RewriteUrl = fn;
        } else {
          string filePart = Path.GetFileName(fn).ToLowerInvariant();
          if (filePart == "imsmanifest.xml") {
            redirectType = RedirectType.Execute;
            RewriteUrl = "~/Framework/Lms/ImsManifest.aspx" + query;
            clientCache = false;
          } else if (File.Exists(fn + ".aspx")) { //Non ASPX a existuje  s ASPX extenzi
            redirectType = RedirectType.Rewrite;
            RewriteUrl = url + ".aspx";
          }
        }
      }
      HttpContext.Current.Items[c_EaUrlInfo] = this;
    }
    public static EaUrlInfo Instance {
      get {
        return (EaUrlInfo)HttpContext.Current.Items[c_EaUrlInfo];
      }
    }
    public static EaUrlInfo getInstance(HttpContext ctx) {
      return (EaUrlInfo)ctx.Items[c_EaUrlInfo];
    }
    static string c_EaUrlInfo = Guid.NewGuid().ToString();

    public lm_scorm root;
    public pageType type;
    public RedirectType redirectType;
    public string RewriteUrl;
    public string oldUrl;
    public string fileName;
    public SiteMapNode CourseNode;
    public bool clientCache;
  }

  public class HTTPModule : IHttpModule {

    // Classes that inherit IHttpModule 
    // must implement the Init and Dispose methods. 
    public void Init(HttpApplication app) {
      //Machines._basicPath = @"d:\lmcom\";//rew\";
      NewEATradosLib.doHack = Hack;
      NewEATradosLib.doHackEx = HackEx;
      CourseMan.Init();
      //HtmlVirtualPathProvider.AppInitialize();
      if (HostingEnvironment.MapPath("~/").ToLower() == @"q:\LMNet2\WebApps\EduAuthorNew\".ToLower()) HtmlVirtualPathProvider.AppInitialize();
      app.BeginRequest += new EventHandler(Application_BeginRequest);
      app.PreRequestHandlerExecute += new EventHandler(Application_PreRequestHandlerExecute);
      app.Error += new EventHandler(Application_Error);
      //if (Machines.isLMCom) {
      app.AuthenticateRequest += new EventHandler(LMCom_AuthenticateRequest);
      //app.PostRequestHandlerExecute += new EventHandler(LMCom_PostRequestHandlerExecute);
      app.BeginRequest += new EventHandler(LMCom_BeginRequest);
      app.PostRequestHandlerExecute += new EventHandler(LMCom_PostRequestHandlerExecute);
      //}
    }
    public void Dispose() {
    }
    public static bool Hack() {
      return HackEx() != null;
    }
    public static ConfigNewEA HackEx() {
      return ConfigLow.actConfig(false) as ConfigNewEA;
    }
    //static lm_scorm fake_root = new lm_scorm();
    //static ProjectInfo fake_project = new ProjectInfo();
    void Application_BeginRequest(object sender, EventArgs e) {
      HttpApplication app = (HttpApplication)sender;
      string query;
      ConfigNewEA cfg = null;

      if ((query = app.Request["ExerciseUrl"]) != null) {
        cfg = new LMComLib.ConfigNewEA() {
          ExerciseUrl = query,
          CourseLang = LowUtils.EnumParse<Langs>(app.Request["CourseLang"]),
          Lang = "en-gb",
          courseId = LowUtils.EnumParse<CourseIds>(app.Request["courseId"]),
          isGrammar = app.Request["isGrammar"] == "true"
        };
      }
      //else if ((queryObj = app.Request["ExerciseUrl"]) != null) {
      //  cfg = new ConfigNewEA() { ExerciseUrl = queryObj, Lang = "de-de", CourseLang = Langs.en_gb };
      //}
      if (cfg != null) {
        urlInfo.setCulture(cfg.Lang);
        cfg.LMS = LMSType.LMCom;
        cfg.DebugMode = false;
        cfg.IsExternalDict = true;
        cfg.IsExternalGrammar = true;
        cfg.IsListenTalk = true;
        var oldToNew = app.Request["oldeaDataType"];
        CourseMeta.oldeaDataType dt = string.IsNullOrEmpty(oldToNew) ? CourseMeta.oldeaDataType.lmdata : LowUtils.EnumParse<CourseMeta.oldeaDataType>(oldToNew);
        //XXX1
        LMComLib.TradosLib.oldToNewTransform = null;
        LMComLib.TradosLib.readLMDataFile = null;
        var fn = OldToNew.exFile.urlToFile("/" + cfg.ExerciseUrl, CourseMeta.oldeaDataType.lmdata);
        if (File.Exists(fn)) {
          var fileEx = new OldToNew.exFile(fn);
          var newExist = fileEx.getMeta().isByHand();
          switch (dt) {
            case CourseMeta.oldeaDataType.lmdata: 
              break;
            case CourseMeta.oldeaDataType.lmdataNew:
              if (newExist) {
                app.Response.ClearContent();
                app.Response.WriteFile(fileEx.fileName(CourseMeta.oldeaDataType.lmdataNew));
                app.Response.End();
              } else {
                LMComLib.TradosLib.oldToNewTransform = root => {
                  OldToNew.handler.oldToNewTransform(root, fileEx);
                  app.Response.ClearContent();
                  app.Response.Write(root.ToString());
                  app.Response.End();
                };
              }
              break;
            case CourseMeta.oldeaDataType.xmlNew:
              if (newExist) {
                LMScormLibDOM.oldToNewSound.transformedXml = File.ReadAllText(fileEx.fileName(CourseMeta.oldeaDataType.lmdataNew), Encoding.UTF8);
                LMComLib.TradosLib.readLMDataFile = () => LMScormLibDOM.oldToNewSound.transformedXml;
              } else
                LMComLib.TradosLib.oldToNewTransform = root => OldToNew.handler.oldToNewTransform(root, fileEx);
              break;
          }
        }
        //LMComLib.TradosLib.oldToNewTransform = dt == CourseMeta.oldeaDataType.lmdata ? (Action<XElement>)null : root => {
        //  OldToNew.handler.oldToNewTransform(root, fileEx);
        //  if (dt == CourseMeta.oldeaDataType.lmdataNew) {
        //    app.Response.ClearContent();
        //    app.Response.Write(root.ToString());
        //    app.Response.End();
        //  }
        //};
        //cfg.oldToNewTransform = dt == CourseMeta.oldeaDataType.lmdata ? null : (Func<string, string>)(fn => OldToNew.handler.onReadNewEAFile(dt, fn));
        cfg.SoundPlayer = SoundPlayerType.HTML5;
        //Lang = "cs-cz",
        //CourseLang = Langs.en_gb,
        //ExerciseUrl = null
        HttpContext.Current.Items[ConfigLow.c_configKey] = cfg;
        EaUrlInfo.HackEaUrlInfo(cfg.ExerciseUrl);
        return;
      }
      //AppData.AppDataLib.processCrawler(((HttpApplication)sender).Context);
      //AppData.AppDataLib.returnImg(((HttpApplication)sender).Context);
      try {
        if (Machines.isCrawlerEx(app.Context)) {
          app.Context.Response.Write("<h1>Online výuka jazyku ZDARMA</h1>");
          app.Context.Response.Write(@"
<p>Váš internet browser byl rozpoznán jako Crawler se jménem <b>" + app.Context.Request.UserAgent + @"</b>, což bezpečnostní pravidla aplikace neumožňují.</p>
<p>Pošlete nám prosím na adresu support@langmaster.cz jméno crawlera (označené tučně), chybu okamžitě odstraníme. </p>
<p>Děkujeme za pochopení</p> <p>váš LANGMaster team.</p>");
          app.Context.Response.Flush();
          app.Context.Response.End();
        }
        EaUrlInfo eaInfo = new EaUrlInfo(app.Request.Url.AbsolutePath, app.Request.Url.Query);
        if (!Machines.isLMCom) urlInfo.normalizeCulture();
        Logging.Trace(TraceLevel.Verbose, TraceCategory.All, "Handlers.cs/Application_BeginRequest url={0}", eaInfo.oldUrl);
        //LocalizeLMData.adjustThreadCulture();
        app.Context.Trace.Write("Application_BeginRequest: " + eaInfo.oldUrl);
        switch (eaInfo.redirectType) {
          case RedirectType.Rewrite:
            app.Context.RewritePath(eaInfo.RewriteUrl, false);
            doCache(app.Context.Response.Cache, eaInfo.clientCache);
            break;
          case RedirectType.Redirect:
            app.Context.Response.Redirect(eaInfo.RewriteUrl, false);
            break;
          case RedirectType.Execute:
            //app.Server.Execute(eaInfo.RewriteUrl, false);
            app.Context.RewritePath(eaInfo.RewriteUrl, false);
            //doCache(app.Context.Response.Cache, eaInfo.clientCache);
            break;
          case RedirectType.WriteFile:
            app.Context.Response.Clear();
            app.Context.Response.WriteFile(eaInfo.RewriteUrl);
            doCache(app.Context.Response.Cache, eaInfo.clientCache);
            app.Context.Response.End();
            break;
        }
      } catch (System.Threading.ThreadAbortException exp) {
        throw;
      } catch (Exception exp) {
        Logging.Trace(TraceLevel.Error, TraceCategory.All, "Handlers.cs/Application_BeginRequest error={0}", exp.Message);
        throw;
      }
    }

    void LMCom_BeginRequest(object sender, EventArgs e) {

      if (Hack()) return;

      ConfigLow.OnBeginRequest(((HttpApplication)sender).Request);
      if (EaUrlInfo.Instance.type == pageType.no) { urlInfo.setCulture(null); return; }
      if (!Machines.isLMCom) {
        ConfigLow res = ConfigLow.actConfig(); if (res != null) urlInfo.setCulture(res.LangId);
      } else {
        urlInfo ui = urlInfo.GetUrlInfo();
        if (ui != null) ui.setCulture();
      }
    }

    void LMCom_AuthenticateRequest(object sender, EventArgs e) {
      if (!Machines.isLMCom) return;
      if (EaUrlInfo.Instance.type == pageType.no) return;
      LMStatus.autenticate(null);
    }

    void Application_PreRequestHandlerExecute(object sender, EventArgs e) {
      if (EaUrlInfo.Instance.type == pageType.no) return;
      HttpContext ctx = ((HttpApplication)sender).Context;
      if (!(ctx.Handler is Page)) return;
      Page pg = (Page)ctx.Handler;
      pg.Init += new EventHandler(LMScormClientScript.onPageInit); //inicializace scriptu
      pg.Load += new EventHandler(pageLoad); //generace a databinding kontrolek
      pg.PreRenderComplete += new EventHandler(LMScormClientScript.onPreRenderComplete); //generace scriptu
    }

    void LMCom_PostRequestHandlerExecute(object sender, EventArgs e) {
      if (!Machines.isLMCom) return;
      if (!(sender is HttpApplication)) return;
      HttpContext ctx = ((HttpApplication)sender).Context;
      if (Machines.isBuildEACacheEx(ctx)) return;
      EaUrlInfo ea = EaUrlInfo.getInstance(ctx); if (ea == null) return;
      LMStatus.saveProfileAndCookie(ctx);
    }

    //void pageLoadComplete(object sender, EventArgs e) {
    //!!!SoundPage.onLoadComplete(sender, e); //priprava sound scriptu
    //ControlHelper.onLoadComplete(sender, e); //provazani Eval grup
    //}
    string addLangAspxToUrl(string absoluteUrl) {
      return string.Concat(absoluteUrl, ".", Thread.CurrentThread.CurrentUICulture.Name, ".aspx");
    }
    public static string removeLangFromUrl(string absoluteUrl) {
      return absoluteUrl.Remove(absoluteUrl.Length - 10, 6);
    }

    void Application_Error(object sender, EventArgs e) {
      HttpContext ctx = ((HttpApplication)sender).Context;
      Exception ex = ctx.Server.GetLastError().GetBaseException();
      Logging.Trace(TraceLevel.Error, TraceCategory.All, "Handlers.cs/Application_Error" +
        "\r\nMESSAGE: " + ex.Message +
        "\r\nSOURCE: " + ex.Source +
        "\r\nTARGETSITE: " + ex.TargetSite +
        "\r\nSTACKTRACE: " + ex.StackTrace);
    }

    static void doCache(HttpCachePolicy cache, bool onClient) {
      if (Machines.doCache) {
        cache.SetCacheability(onClient ? HttpCacheability.Private : HttpCacheability.NoCache);
        cache.SetExpires(DateTime.UtcNow.AddDays(1));
      } else
        cache.SetCacheability(HttpCacheability.NoCache);
    }

    void pageLoad(object sender, EventArgs e) {
      Page pg = (Page)sender;
      pg.DataBind();
    }

  }
}
