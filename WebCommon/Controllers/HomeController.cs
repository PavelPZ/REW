using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNet.Mvc;
using Microsoft.AspNet.Http;
using DesignNew;
using LMComLib;
using LMNetLib;
using Microsoft.Extensions.OptionsModel;
using System.Text;
using Newtonsoft.Json;
using System.Net;
using Microsoft.AspNet.Routing;
using System.IO;
using WebCode;

// For more information on enabling MVC for empty projects, visit http://go.microsoft.com/fwlink/?LinkID=397860

namespace WebApp {

  public class HomeController : Controller {

    public const string webTestMask = "web/{appPart}";
    public const string web4Mask = "web4";
    public const string oAuthMask = "oauth";

    public HomeController(IOptions<AppSettings> appSettings) : base() {
      var opt = appSettings.Value;
    }

    [Route(web4Mask)]
    public IActionResult Schools() {
      //var hlp = Microsoft.AspNet.Http.Extensions.UriHelper.GetDisplayUrl(HttpContext.Request);
      //var rq = HttpContext.Request; 
      //var url = Microsoft.AspNet.Http.Extensions.UriHelper.Encode(rq.Scheme, rq.Host, rq.PathBase, rq.Path, rq.QueryString);
      return View("Web4Index", new ModelWeb4(HttpContext, new HomeViewPars(HttpContext, servConfig.Apps.web4)));
    }
    [Route(webTestMask)]
    public IActionResult CommonTest(string appPart) {
      return View("WebTest", new ModelCommonTest(HttpContext, new HomeViewPars(HttpContext, servConfig.Apps.web) { appPart = appPart}));
    }
    [Route(oAuthMask)]
    public IActionResult OAuth() {
      return View("oAuth", new ModelOAuth(HttpContext, new HomeViewPars(HttpContext, servConfig.Apps.oauth)));
    }
    [Route("web")]
    public IActionResult Common() {
      return View("WebIndex");
    }
    [Route("")]
    public IActionResult Empty() {
      return Cfg.cfg.defaultPars.app == servConfig.Apps.web
        ? View("WebIndex")
        : View("Web4Index", new ModelWeb4(HttpContext, new HomeViewPars(HttpContext, servConfig.Apps.web4)));
    }

  }

  public static class Cache {
    static Cache() {
      UrlRewrite.swFile.extractSwFilesToCache(); //soubory z d:\LMCom\rew\WebCode\App_Data\swfiles.zip do cache
    }
    static async Task makeResponseFromCache(string cacheKey, RouteContext routeCtx) {
      //tast na pritomnost v cache
      if (string.IsNullOrEmpty(cacheKey)) { await Task.CompletedTask; return; }
      UrlRewrite.swFile sf;
      lock (UrlRewrite.swFile.swFiles) UrlRewrite.swFile.swFiles.TryGetValue(cacheKey.ToLower(), out sf);
      if (sf == null) { await Task.CompletedTask; return; }

      //ano => vrat z cache
      routeCtx.IsHandled = true;
      var ctx = routeCtx.HttpContext;
      string eTag = ctx.Request.Headers["If-None-Match"];
      ctx.Response.Headers["Etag"] = sf.eTag;
      ctx.Response.ContentType = Consts.contentTypes[sf.ext];
      if (sf.eTag == eTag) { //souhlasi eTag => not modified
        ctx.Response.StatusCode = (int)HttpStatusCode.NotModified;
        ctx.Response.ContentLength = 0;
        await Task.CompletedTask;
      } else { //nova stranka (a ev. jeji gzip verze)
        string acceptEncoding = ctx.Request.Headers["Accept-Encoding"];
        ctx.Response.StatusCode = (int)HttpStatusCode.OK;
        if (!string.IsNullOrEmpty(acceptEncoding) && acceptEncoding.Contains("gzip") && sf.gzipData != null) {
          ctx.Response.Headers["Content-Encoding"] = "gzip";
          await ctx.Response.Body.WriteAsync(sf.gzipData, 0, sf.gzipData.Length);
        } else {
          await ctx.Response.Body.WriteAsync(sf.data, 0, sf.data.Length);
        }
      }
    }

    //cached INDEX soubory
    public static async Task onIndexCache(RouteContext context, servConfig.Apps app) {
      var cacheKey = new HomeViewPars(context.HttpContext, app).getCacheKey();
      await makeResponseFromCache(cacheKey, context);
    }
    //cache ostatnich souboruu
    public static async Task onOtherCache(RouteContext context) {
      var url = itemUrl(context.HttpContext.Request.Path.Value);
      await makeResponseFromCache(url, context);
    }
    //ostatni soubory z filesystemu
    public static async Task onOtherFile(RouteContext context) {
      var url = itemUrl(context.HttpContext.Request.Path.Value);
      using (var fs = File.OpenRead(FileSources.pathFromUrl(url))) await fs.CopyToAsync(context.HttpContext.Response.Body);
      context.IsHandled = true;
    }
    static string itemUrl(string url) { return url.Split('~')[1]; }
    //INDEX soubor neni v cache => dej ho tam
    public static async Task Middleware(HttpContext ctx, Func<Task> next) {
      //INDEX stranka?
      if (!ctx.Request.Path.HasValue) { await next(); return; }
      var appStr = ctx.Request.Path.Value.ToLower();
      if (!string.IsNullOrEmpty(appStr) && appStr.Length > 1) appStr = appStr.Substring(1).Split('/')[0];
      if (!Consts.allApps.Contains(appStr)) { await next(); return; }
      //ano => index do cache
      var app = LowUtils.EnumParse<servConfig.Apps>(appStr);
      var pars = new HomeViewPars(ctx, app);
      using (var memStr = new MemoryStream()) {
        var bodyStr = ctx.Response.Body;
        ctx.Response.Body = memStr;
        await next();
        //dej vygenerovanou stranku do cache
        var sf = UrlRewrite.swFile.addToCache(pars.getCacheKey(), ".html", memStr.ToArray());
        ctx.Response.Headers["Etag"] = sf.eTag;
        //form response
        memStr.Seek(0, SeekOrigin.Begin);
        await memStr.CopyToAsync(bodyStr);
      }
    }
  }

  public class HomeViewPars : servConfig.ViewPars {

    public string getCacheKey() {
      return string.Format("{0}/{1}/{2}/{3}/{4}/{5}", app, skin, brand, lang, debug, appPart).ToLower();
    }

    public HomeViewPars(HttpContext ctx, servConfig.Apps app) {
      string par;
      this.app = app;
      brand = Consts.allBrands.Contains(par = ctx.Request.Query["brand"]) ? LowUtils.EnumParse<servConfig.Brands>(par) : Cfg.cfg.defaultPars.brand;
      skin = Consts.allSkins.Contains(par = ctx.Request.Query["skin"]) ? LowUtils.EnumParse<servConfig.SkinIds>(par) : Cfg.cfg.defaultPars.skin;
      lang = Consts.allSwLangs.Contains(par = ctx.Request.Query["lang"]) ? LowUtils.EnumParse<Langs>(par) : Cfg.cfg.defaultPars.lang;
      debug = !string.IsNullOrEmpty(par = ctx.Request.Query["debug"]) ? par == "true" : Cfg.cfg.defaultPars.debug;
    }
  }

  public class ModelLow {
    public ModelLow(HttpContext ctx, HomeViewPars pars) {
      var csss = FileSources.getUrls(FileSources.indexPartFilter(false, pars.app, pars.skin, pars.brand, pars.lang, !pars.debug));
      css = urlsToTags(csss, false);
      var jss = FileSources.getUrls(FileSources.indexPartFilter(true, pars.app, pars.skin, pars.brand, pars.lang, !pars.debug));
      js = urlsToTags(jss, true);
      title = pars.brand == servConfig.Brands.skrivanek ? "Skřivánek" : "LANGMaster";
    }
    public string title;
    public string css;
    public string js;
    //*** PRIVATE
    static void cssTag(StringBuilder sb, string url) { sb.AppendFormat(@"  <link href='~{0}' rel='stylesheet' type='text/css' />", url); sb.AppendLine(); }
    static void jsTag(StringBuilder sb, string url) { sb.AppendFormat(@"  <script src='~{0}' type='text/javascript'></script>", url); sb.AppendLine(); }
    static string urlsToTags(IEnumerable<string> urls, bool isJs) {
      var tag = isJs ? (Action<StringBuilder, string>)jsTag : cssTag;
      StringBuilder sb = new StringBuilder();
      foreach (var url in urls) tag(sb, url);
      return sb.ToString();
    }
  }

  public abstract class ModelCommonCfg : ModelLow {
    public ModelCommonCfg(HttpContext ctx, HomeViewPars pars) : base(ctx, pars) {
      var rq = ctx.Request;
      var loginUrl = Microsoft.AspNet.Http.Extensions.UriHelper.Encode(rq.Scheme, rq.Host, rq.PathBase, new PathString("/" + HomeController.oAuthMask));
      cfg = "<script type='text/javascript'>var servCfg = " + Cfg.toJS(loginUrl) + ";</script>";
    }
    public string cfg;
  }

  public class ModelOAuth : ModelCommonCfg {
    public ModelOAuth(HttpContext ctx, HomeViewPars pars) : base(ctx, pars) { }
  }

  public class ModelCommonTest : ModelCommonCfg {
    public ModelCommonTest(HttpContext ctx, HomeViewPars pars) : base(ctx, pars) {
      startJS = "<script type='text/javascript' src='~/common/" + pars.appPart + "/test.js'></script>";
    }
    public string startJS;
  }

  public class ModelWeb4 : ModelLow {
    public ModelWeb4(HttpContext ctx, HomeViewPars pars) : base(ctx, pars) {
      var cfgObj = new schools.config() {
        blobJS = Cfg.cfg.azure.blobJS, //URL s JS se cvicenimi
        blobMM = Cfg.cfg.azure.blobMM, //URL s obrazky, zvuky, videa, ...
        target = Targets.web,
        version = pars.debug ? schools.versions.debug : schools.versions.minified,
        dataBatchUrl = "/lm/lm_data/",
        lang = pars.lang,
        designId = pars.brand.ToString(),
        canSkipCourse = true,
        canResetCourse = true,
        canResetTest = true,
        canSkipTest = true,
        persistType = schools.persistTypes.persistNewEA,
      };
      cfg = string.Format("<script type='text/javascript'>\r\nvar cfg = {0};\r\n</script>\r\n", JsonConvert.SerializeObject(cfgObj));
    }
    public string htmls;
    public string cfg;
  }

}
