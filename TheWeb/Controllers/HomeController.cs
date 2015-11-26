using DesignNew;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Text;
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
    public FilterStream(Stream stream, string fileName) { this.stream = stream; this.fileName = fileName; }
    Stream stream; byte[] cachedData; string cacheKey; HttpContextBase context; string fileName;
    public override void Flush() {
      base.Flush();
      if (cachedData != null) { //vem z cache
        stream.Write(cachedData, 0, cachedData.Length);
      } else if (fileName != null) { //vem z filesystemu
        using (var fs = System.IO.File.OpenRead(FileSources.pathFromUrl(cacheKey))) fs.CopyTo(stream);
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
  public class AppFileController : Controller {
    [CacheFilter]
    public ActionResult File(string path) {
      return View("File");
    }
  }

  public class CacheFilter : ActionFilterAttribute {
    public override void OnResultExecuting(ResultExecutingContext context) {
      var cacheKey = itemUrl(context.HttpContext.Request.Url.AbsolutePath);
      Stream newFilter;
      if (Cfg.cfg.defaultPars.swFromFileSystem) {
        newFilter = new FilterStream(context.HttpContext.Response.Filter, FileSources.pathFromUrl(cacheKey));
        context.HttpContext.Response.Filter = newFilter;
        context.Cancel = true;
      } else {
        byte[] cachedData;
        switch (Cache.makeResponseFromCache(cacheKey, context.HttpContext, out cachedData)) {
          case Cache.makeResponseFromCacheResult.writeCached:
            newFilter = new FilterStream(context.HttpContext.Response.Filter, cachedData);
            context.HttpContext.Response.Filter = newFilter;
            context.Cancel = true;
            break;
        }
      }
    }
    static string itemUrl(string url) { return url.Split('~')[1]; }
  }

  public class AppFileConstraint : IRouteConstraint {
    public bool Match(HttpContextBase httpContext, Route route, string parameterName, RouteValueDictionary values, RouteDirection routeDirection) {
      return httpContext.Request.Url.AbsolutePath.IndexOf("~") >= 0;
    }
  }
}