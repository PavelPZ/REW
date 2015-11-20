using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNet.Mvc;
using Microsoft.AspNet.Http;
using DesignNew;
using LMComLib;
using LMNetLib;
using Microsoft.Framework.OptionsModel;
using System.Text;
using Newtonsoft.Json;
using System.Net;
using Microsoft.AspNet.Routing;
using System.IO;
using WebCode;

// For more information on enabling MVC for empty projects, visit http://go.microsoft.com/fwlink/?LinkID=397860

namespace WebApp {

  public class HomeController : Controller {

    public HomeController(IOptions<AppSettings> appSettings) : base() {
      var opt = appSettings.Value;
    }

    [Route("web4")]
    public IActionResult Schools() {
      return View("IndexWeb4", new HomeModelWeb4(getPars(HttpContext, Consts.Apps.web4)));
    }
    [Route("common")]
    public IActionResult Common() {
      return View("Index", new HomeModel(getPars(HttpContext, Consts.Apps.common)));
    }

    public static HomeViewPars getPars(HttpContext ctx, Consts.Apps app) {
      string par;
      return new HomeViewPars {
        app = app,
        brand = Consts.allBrands.Contains(par = ctx.Request.Query["brand"]) ? LowUtils.EnumParse<Consts.Brands>(par) : Consts.Brands.lm,
        skin = Consts.allSkins.Contains(par = ctx.Request.Query["skin"]) ? LowUtils.EnumParse<Consts.SkinIds>(par) : Consts.SkinIds.bs,
        lang = Consts.allSwLangs.Contains(par = ctx.Request.Query["lang"]) ? LowUtils.EnumParse<Langs>(par) : Langs.cs_cz,
        debug = ctx.Request.Query["debug"] == "true",
      };
    }
  }

  public static class Cache {
    static Cache() {
      WebCode.UrlRewrite.swFile.extractSwFilesToCache(); //soubory z d:\LMCom\rew\WebCode\App_Data\swfiles.zip do cache
    }
    static async makeResponseFromCache(string cacheKey, RouteContext routeCtx) {
      UrlRewrite.swFile sf;
      lock (UrlRewrite.swFile.swFiles) UrlRewrite.swFile.swFiles.TryGetValue(cacheKey, out sf);
      routeCtx.IsHandled = sf != null; if (!routeCtx.IsHandled) return;
      System.Threading.Tasks.Task

      var ctx = routeCtx.HttpContext;
      string eTag = ctx.Request.Headers["If-None-Match"];
      ctx.Response.Headers["Etag"] = sf.eTag;
      ctx.Response.ContentType = Consts.contentTypes[sf.ext];
      if (sf.eTag == eTag) { //souhlasi eTag => not modified
        ctx.Response.StatusCode = (int)HttpStatusCode.NotModified;
        ctx.Response.ContentLength = 0;
      } else { //nova stranka (a ev. jeji gzip verze)
        string acceptEncoding = ctx.Request.Headers["Accept-Encoding"];
        ctx.Response.StatusCode = (int)HttpStatusCode.OK;
        if (!string.IsNullOrEmpty(acceptEncoding) && acceptEncoding.Contains("gzip") && sf.gzipData != null) {
          ctx.Response.Headers["Content-Encoding"] = "gzip";
          ctx.Response.Body.WriteAsync(sf.gzipData, 0, sf.gzipData.Length);
        } else {
          ctx.Response.Body.WriteAsync(sf.data, 0, sf.data.Length);
        }
      }
    }
    public static async void onIndexRoute(RouteContext context) {
      var app = LowUtils.EnumParse<Consts.Apps>(context.HttpContext.Request.Path.Value);
      var cacheKey = HomeController.getPars(context.HttpContext, app).getCacheKey();
      await makeResponseFromCache(cacheKey, context);
    }
    public static async void onOtherRoute(RouteContext context) {
      var cacheKey = context.HttpContext.Request.Path.Value.ToLower();
      await makeResponseFromCache(cacheKey, context);
    }
    public static async Task Middleware(HttpContext ctx, Func<Task> next) {
      var appStr = ctx.Request.Path.Value.ToLower();
      if (!Consts.allApps.Contains(appStr)) { await next(); return; }
      var app = LowUtils.EnumParse<Consts.Apps>(appStr);
      var pars = HomeController.getPars(ctx, app);
      using (var memStr = new MemoryStream()) {
        var bodyStr = ctx.Response.Body;
        ctx.Response.Body = memStr;
        await next();
        //dej vygenerovanou stranku do cache
        UrlRewrite.swFile.addToCache(pars.getCacheKey(), memStr.ToArray());
        //form response
        memStr.Seek(0, SeekOrigin.Begin);
        await memStr.CopyToAsync(bodyStr);
      }
    }
  }

  public class HomeViewPars {
    public Consts.Apps app;
    public Langs lang = Langs.en_gb;
    public Consts.Brands brand;
    public Consts.SkinIds skin;
    public bool debug;

    public string getCacheKey() {
      return string.Format("{0}/{1}/{2}/{3}/{4}", app, skin, brand, lang, debug).ToLower();
    }
  }

  public class HomeModel {
    public HomeModel(HomeViewPars pars) {
      var csss = FileSources.getUrls(FileSources.indexPartFilter(false, pars.app, pars.skin, pars.brand, pars.lang, !pars.debug));
      css = urlsToTags(csss, false);
      var jss = FileSources.getUrls(FileSources.indexPartFilter(true, pars.app, pars.skin, pars.brand, pars.lang, !pars.debug));
      js = urlsToTags(jss, true);
      title = pars.brand == Consts.Brands.skrivanek ? "Skřivánek" : "LANGMaster";
    }
    public string title;
    public string css;
    public string js;
    //*** PRIVATE
    static void cssTag(StringBuilder sb, string url) { sb.AppendFormat(@"  <link href='..{0}' rel='stylesheet' type='text/css' />", url); sb.AppendLine(); }
    static void jsTag(StringBuilder sb, string url) { sb.AppendFormat(@"  <script src='..{0}' type='text/javascript'></script>", url); sb.AppendLine(); }
    static string urlsToTags(IEnumerable<string> urls, bool isJs) {
      var tag = isJs ? (Action<StringBuilder, string>)jsTag : cssTag;
      StringBuilder sb = new StringBuilder();
      foreach (var url in urls) tag(sb, url);
      return sb.ToString();
    }
  }

  public class HomeModelWeb4 : HomeModel {
    public HomeModelWeb4(HomeViewPars pars) : base(pars) {
      var cfgObj = new schools.config() {
        //blobJS = ConfigurationManager.AppSettings["cfg-blobJS"], //URL s JS se cvicenimi
        //blobMM = ConfigurationManager.AppSettings["cfg-blobMM"], //URL s obrazky, zvuky, videa, ...
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
