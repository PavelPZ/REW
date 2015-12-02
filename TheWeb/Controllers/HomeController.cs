using DesignNew;
using System;
using System.IO;
using System.Web;
using System.Web.Mvc;
using System.Web.Routing;

namespace TheWeb {

  //************** INDEX PAGES

  [IndexFilter]
  public class HomeController : Controller {
    public HomeController() : base() {
    }
    public ActionResult Empty() {
      var app = Cfg.cfg.defaultPars.app == servConfig.Apps.web ? servConfig.Apps.web : servConfig.Apps.web4;
      var view = Cfg.cfg.defaultPars.app == servConfig.Apps.web ? "Common" : "Schools";
      return View(view, rememberApp(new HomeViewPars(HttpContext, app)));
    }
    public ActionResult CommonTest(string appPart) {
      return View("CommonTest", new ModelCommonTest(HttpContext, rememberApp(new HomeViewPars(HttpContext, servConfig.Apps.web) { appPart = appPart })));
    }
    public ActionResult Common() {
      return View("Common");
    }
    public ActionResult OAuth() {
      return View("OAuth", new ModelOAuth(HttpContext, rememberApp(new HomeViewPars(HttpContext, servConfig.Apps.oauth))));
    }
    public ActionResult Schools() {
      return View("Schools", new ModelWeb4(HttpContext, rememberApp(new HomeViewPars(HttpContext, servConfig.Apps.web4))));
    }
    HomeViewPars rememberApp(HomeViewPars par) { HttpContext.Items["par"] = par; return par; }
    public static HomeViewPars getRememberedApp(HttpContextBase ctx) { return (HomeViewPars)ctx.Items["par"]; }

  }

  public class FilterStream : MemoryStream {
    public FilterStream(Stream stream, string cacheKey, HttpContextBase context) { this.stream = stream; this.cacheKey = cacheKey; this.context = context; }
    public FilterStream(Stream stream, byte[] cachedData) { this.stream = stream; this.cachedData = cachedData; }
    Stream stream; byte[] cachedData; string cacheKey; HttpContextBase context;
    public override void Flush() {
      base.Flush();
      if (cachedData != null) { //vem z cache
        stream.Write(cachedData, 0, cachedData.Length);
      } else { //dej do cache a write
        var data = ToArray();
        var sf = swFile.addToCache(cacheKey, ".html", data);
        context.Response.AddHeader("Etag", sf.eTag);
        stream.Write(data, 0, data.Length);
      }
      stream.Flush();
    }
  }

  public class IndexFilter : ActionFilterAttribute {
    public override void OnResultExecuting(ResultExecutingContext context) {
      base.OnResultExecuting(context);
      if (Cfg.cfg.defaultPars.swFromFileSystem) return;
      var par = HomeController.getRememberedApp(context.HttpContext);
      var cacheKey = par.getCacheKey();
      byte[] cachedData; Stream newFilter;
      switch (Cache.makeResponseFromCache(cacheKey, context.HttpContext, out cachedData)) {
        case Cache.makeResponseFromCacheResult.no:
          newFilter = new FilterStream(context.HttpContext.Response.Filter, cacheKey, context.HttpContext);
          context.HttpContext.Response.Filter = newFilter;
          break;
        case Cache.makeResponseFromCacheResult.notModified:
          context.Cancel = true;
          break;
        case Cache.makeResponseFromCacheResult.writeCached:
          newFilter = new FilterStream(context.HttpContext.Response.Filter, cachedData);
          context.HttpContext.Response.Filter = newFilter;
          context.Cancel = true;
          break;
      }
    }

  }

  //************** FILES

  public class GetFileModule : IHttpModule {
    void IHttpModule.Init(HttpApplication context) {
      context.BeginRequest += (app, a) => {
        var ctx = ((HttpApplication)app).Context;
        var cacheKey = itemUrl(ctx.Request.Url.AbsolutePath); if (cacheKey == null) return;
        if (Cfg.cfg.defaultPars.swFromFileSystem) {
          ctx.Response.WriteFile(FileSources.pathFromUrl(cacheKey));
          ctx.Response.Flush(); ctx.Response.End();
        } else {
          byte[] cachedData;
          var ctxBase = new System.Web.HttpContextWrapper(ctx);
          switch (Cache.makeResponseFromCache(cacheKey, ctxBase, out cachedData)) {
            case Cache.makeResponseFromCacheResult.writeCached:
              ctx.Response.OutputStream.Write(cachedData, 0, cachedData.Length);
              ctx.Response.Flush(); ctx.Response.End();
              break;
            case Cache.makeResponseFromCacheResult.notModified:
              ctx.Response.Flush(); ctx.Response.End();
              break;
            default:
              throw new Exception("GetFileModule.BeginRequest: missing file in cache " + ctx.Request.Url.AbsolutePath);
          }
        }
      };
    }
    void IHttpModule.Dispose() {
    }
    static string itemUrl(string url) { var parts = url.Split('~'); return parts.Length == 2 ? parts[1] : null; }

  }
}