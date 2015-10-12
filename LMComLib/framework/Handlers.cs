////********************************
//// Web app maji v SiteMaps adresu <domena>/<aplikace>/lang/...
//// Kazda domena musi mit pro Web app svoji sitemap
//// Ostatni apps maji v SiteMaps adresu site/<aplikace>/lang/...
//// Sitemap pro ostatni apps je spolecna pro vsechny domeny
//// Web app muze mit stranky (APSX nebo LMP) specificke pro domenu i jazyk, vybere se vzdy nejkonkretnejsi stranka
//// Ostatni apps musi mit stranky (pouze ASPX) v site/<aplikace>/lang/
////********************************
//using System;
//using System.Collections.Generic;
//using System.Collections.Specialized; 
//using System.Text;
//using System.Web;
//using System.Web.SessionState;
//using System.IO;
//using System.Web.UI;
//using System.Web.Profile;
//using System.Web.Caching;
//using System.Threading;
//using System.Globalization;
//using System.Web.Hosting;
//using System.Diagnostics;

//using LMComLib.Cms;
//using LMNetLib;

//namespace LMComLib {

//  /*public class LMHttpHandlerFactory : System.Web.UI.PageHandlerFactory
//  {
//    public override IHttpHandler GetHandler(HttpContext context, String requestType, String url, String pathTranslated)
//    {
//      //IHttpHandler res = base.GetHandler(context, requestType, url, pathTranslated);
//      //return res;
//      LMPage res = new LMComLib.LMPage();
//      res.Controls.Add(new LiteralControl("Ahoj"));
//      return res;
//    }
//    public override void ReleaseHandler(IHttpHandler handler)
//    {
//      base.ReleaseHandler(handler);
//    }

//  }*/

//  public class LmModule : IHttpModule {

//    public static bool initialized = false;

//    public void Init(HttpApplication app) {
//      app.BeginRequest += new EventHandler(Application_BeginRequest);
//      app.EndRequest += new EventHandler(Application_EndRequest);
//      app.AuthenticateRequest += new EventHandler(Application_AuthenticateRequest);
//      //app.PreSendRequestHeaders += new EventHandler();
//      app.PostRequestHandlerExecute += new EventHandler(Application_PreSendRequestHeaders); 
//    }

//    public void Dispose() {
//      //Template.DisposeTypes();
//    }

//    void Application_BeginRequest(object sender, EventArgs e) {
//      HttpContext ctx = ((HttpApplication)sender).Context;
//      //Aby se dal pouzit Cookie v IFrame
//      ctx.Response.AddHeader("p3p", "CP=\"IDC DSP COR ADM DEVi TAIi PSA PSD IVAi IVDi CONi HIS OUR IND CNT\"");
//      //AppData.AppDataLib.processCrawler(ctx);
//      if (skipSave(ctx.Request)) return;
//      urlInfo ui = new urlInfo(ctx.Request);
//      switch (ui.Type) {
//        case SiteMapNodeType.img:
//          break;
//        default:
//          if (ui.RewriteUrl != null)
//            ctx.RewritePath(ui.RewriteUrl, true);
//          break;
//      }
//    }

//    void Application_EndRequest(object sender, EventArgs e) {
//      //Seznam.SeznamLogger.reqEnd();
//    }

//    static string[] skipSaveUrls = new string[] { "redirect.aspx","/services/", "download/lang/pages/default.aspx", "download/lang/pages/upgrade.aspx" };

//    bool skipSave(HttpRequest req) {
//      string url = req.Url.AbsolutePath.ToLower();
//      string ext = VirtualPathUtility.GetExtension(url);
//      if (ext != ".aspx" && ext != ".htm" && ext != ".lmp") return true;
//      foreach (string skip in skipSaveUrls)
//        if (url.IndexOf(skip) >= 0) return true;
//      return false;
//    }

//    static bool needsLogin(urlInfo ui) {
//      if (HttpContext.Current.Request.IsAuthenticated) return false;
//      return ui.Security == SecurityDir.Secured;
//    }

//    static Int64 isAutorizedQuery(HttpRequest req, urlInfo ui) {
//      string q = req["securityId"];
//      if (string.IsNullOrEmpty(q)) return 0;
//      Int64 userId; string url;
//      if (!LMStatus.decodeAutorisedUser(q, out userId, out url)) return 0;
//      if (ui.AbsolutePath.ToLower().IndexOf (url)<0) return 0;
//      return userId;
//    }

//    //nalezeni country dle IP adresy
//    public delegate string FindCountryEvent(string ip);
//    public static FindCountryEvent FindCountry;
//    //Redirekt kvuli jazyku a counry
//    public delegate void WrongCountryLangEvent(HttpContext ctx, LMCookie cook, urlInfo ui);
//    public static WrongCountryLangEvent WrongCountryLang;

//    public void Application_AuthenticateRequest(object sender, EventArgs e) {
//      HttpContext ctx = HttpContext.Current;
//      //AppData.AppDataLib.returnImg(ctx);
//      VirtualImg.returnImg(ctx);
//      if (skipSave(ctx.Request)) return;
//      //Autorizace
//      urlInfo ui = urlInfo.GetUrlInfo();
//      Int64 userId = ui.isErrorPage ? 0 : isAutorizedQuery(ctx.Request, ui);
//      bool doLogin;
//      if (userId!=0) {
//        LMStatus.loginProfile(userId);
//        doLogin = false;
//      } else {
//        LMCookie cook = LMStatus.Cookie;
//        LMStatus.autenticate(cook);
//        if (FindCountry != null && cook.Country == null) cook.Country = FindCountry(ctx.Request.UserHostAddress).ToLower();
//        if (WrongCountryLang != null) WrongCountryLang(ctx, cook, ui);
//        doLogin = needsLogin(ui);
//      }
//      if (!doLogin) {
//        if (ui.Node != null && ui.isLMP)
//          //Read template
//          ui.CmsTemplate = CacheItems.GetTemplate(ui.Node);
//        return;
//      }
//      //Redirect na Login page
//      ctx.Response.Redirect(loginUrl(ui));
//    }

//    public static string loginUrl() {
//      return loginUrl(urlInfo.GetUrlInfo());
//    }

//    static string loginUrl(urlInfo ui) {
//      string loginUrl = urlInfo.GetUrl(LMApps.commerce, "pages/Login.aspx");
//      string url = ui.AbsoluteUri.Replace("/home.lmp", "/").Replace("/home.aspx", "/");
//      return loginUrl + "?ReturnUrl=" + HttpContext.Current.Server.UrlEncode(url);
//      /*urlInfo ui = urlInfo.GetUrlInfo();
//      string loginUrl = SiteInfos.getSiteInfo().Security.LoginUrl;
//      loginUrl = loginUrl.Replace("###lang###", ui.Lang).Replace("###site###", ui.Site);
//      string url = ui.AbsoluteUri.Replace("/home.lmp", "/").Replace("/home.aspx", "/");
//      return loginUrl + "?ReturnUrl=" + HttpContext.Current.Server.UrlEncode(url);*/
//    }

//    public void Application_PreSendRequestHeaders(object sender, EventArgs e) {
//      if (!(sender is HttpApplication)) return;
//      HttpContext ctx = ((HttpApplication)sender).Context;
//      if (skipSave(ctx.Request)) return;
//      LMStatus.saveProfileAndCookie(ctx);
//    }
//  }

//  public sealed class CmsPathProvider : VirtualPathProvider { 

//    public class HtmlVirtualFile : VirtualFile {

//      public HtmlVirtualFile(string virtualPath) : base(virtualPath) { }

//      public override Stream Open() {
//        lock (typeof(HtmlVirtualFile)) {
//          Template obj = urlInfo.GetUrlInfo().CmsTemplate;
//          byte[] mem;
//          string pgAspx = obj.PageAspx();
//          if (pgAspx == null) pgAspx =
//  @"<%@ Page Language=""C#"" Title=""LANGMaster"" %>
//<asp:Label runat=""server""/>
//Ahoj
//";
//          mem = Encoding.UTF8.GetBytes(pgAspx);
//          MemoryStream ms = new MemoryStream();
//          ms.WriteByte(239); ms.WriteByte(187); ms.WriteByte(191); //UTF8 signature
//          ms.Write(mem, 0, mem.Length);
//          ms.Seek(0, SeekOrigin.Begin);
//          return ms;
//        }
//      }
//    }

//    public static void AppInitialize() {
//      CmsPathProvider myVpp = new CmsPathProvider();
//      myVpp.InitializeLifetimeService();
//      HostingEnvironment.RegisterVirtualPathProvider(myVpp);
//    }

//    bool isVirtual(string virtualPath) {
//      urlInfo ui = urlInfo.GetUrlInfo();
//      if (ui==null || string.Compare(ui.RewriteUrl, virtualPath) != 0) return false;
//      return urlInfo.GetUrlInfo().CmsTemplate != null;
//    }

//    public override VirtualFile GetFile(string virtualPath) {
//      if (isVirtual(virtualPath))
//        return new HtmlVirtualFile(virtualPath);
//      return Previous.GetFile(virtualPath);
//    }
//    public override bool FileExists(string virtualPath) {
//      if (isVirtual(virtualPath))
//        return true;
//      return Previous.FileExists(virtualPath);
//    }
//    public override bool DirectoryExists(string virtualDir) {
//      return Previous.DirectoryExists(virtualDir);
//    }
//    public override VirtualDirectory GetDirectory(string virtualDir) {
//      return Previous.GetDirectory(virtualDir);
//    }

//    public override CacheDependency GetCacheDependency(string virtualPath, System.Collections.IEnumerable virtualPathDependencies, DateTime utcStart) {

//      if (Machines.doCache)
//        return null;  //cachovat
      
//      if (!isVirtual(virtualPath))
//        return base.GetCacheDependency(virtualPath, virtualPathDependencies, utcStart);
//      string fn = urlInfo.GetUrlInfo().getFileName();
//      List<string> deps = new List<string>();
//      if (virtualPathDependencies != null)
//        foreach (string s in virtualPathDependencies)
//          if (s != virtualPath) deps.Add(s);
//      return new CacheDependency(new string[] { fn }, deps.ToArray(), utcStart);
//    }
//  }

//  public sealed class SeznamPathProvider : VirtualPathProvider {

//    public class HtmlVirtualFile : VirtualFile {
//      string virtualPath;
//      public HtmlVirtualFile(string virtualPath) : base(virtualPath) { 
//        this.virtualPath = virtualPath; 
//      }

//      public override Stream Open() {
//        lock (typeof(HtmlVirtualFile)) {
//          return new FileStream(@"Q:\LMCom\LMCom\sz\Web\Lang\Pages\Home.aspx", FileMode.Open, FileAccess.Read);
//        }
//      }
//    }

//    public static void AppInitialize() {
//      SeznamPathProvider myVpp = new SeznamPathProvider();
//      myVpp.InitializeLifetimeService();
//      HostingEnvironment.RegisterVirtualPathProvider(myVpp);
//    }

//    bool isVirtual(string virtualPath) {
//      return VirtualPathUtility.GetExtension(virtualPath)==".aspx";
//    }

//    public override VirtualFile GetFile(string virtualPath) {
//      if (isVirtual(virtualPath))
//        return new HtmlVirtualFile(virtualPath);
//      return Previous.GetFile(virtualPath);
//    }
//    public override bool FileExists(string virtualPath) {
//      if (isVirtual(virtualPath))
//        return true;
//      return Previous.FileExists(virtualPath);
//    }
//    public override bool DirectoryExists(string virtualDir) {
//      return Previous.DirectoryExists(virtualDir);
//    }
//    public override VirtualDirectory GetDirectory(string virtualDir) {
//      return Previous.GetDirectory(virtualDir);
//    }

//    public override CacheDependency GetCacheDependency(string virtualPath, System.Collections.IEnumerable virtualPathDependencies, DateTime utcStart) {

//      if (Machines.doCache)
//        return null;  //cachovat

//      if (!isVirtual(virtualPath))
//        return base.GetCacheDependency(virtualPath, virtualPathDependencies, utcStart);
//      string fn = urlInfo.GetUrlInfo().getFileName();
//      List<string> deps = new List<string>();
//      if (virtualPathDependencies != null)
//        foreach (string s in virtualPathDependencies)
//          if (s != virtualPath) deps.Add(s);
//      return new CacheDependency(new string[] { fn }, deps.ToArray(), utcStart);
//    }
//  }

//}
