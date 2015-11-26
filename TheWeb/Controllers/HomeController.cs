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

    //protected override void OnResultExecuting(ResultExecutingContext context) {
    //  var par = HomeController.getRememberedApp(HttpContext);
    //  var cacheKey = par.getCacheKey();
    //  if (Cache.makeResponseFromCache(cacheKey, HttpContext)) { context.Cancel = true; return; };
    //  responseStream = HttpContext.Response.Filter;
    //  HttpContext.Response.Filter = new MemoryStream();
    //}
    //protected override void OnResultExecuted(ResultExecutedContext context) {
    //  var par = HomeController.getRememberedApp(HttpContext);
    //  var cacheKey = par.getCacheKey();
    //  var myStream = (MemoryStream)HttpContext.Response.Filter;
    //  var data = myStream.ToArray();
    //  var sf = swFile.addToCache(cacheKey, ".html", data);
    //  HttpContext.Response.Headers["Etag"] = sf.eTag;
    //  myStream.CopyTo(responseStream);
    //}
    //Stream responseStream;

  }

  public class FilterStream : MemoryStream {
    public FilterStream(Stream stream, string cacheKey, HttpContextBase context) { this.stream = stream; this.cacheKey = cacheKey; this.context = context; }
    public FilterStream(Stream stream, byte[] cachedData) { this.stream = stream; this.cachedData = cachedData; }
    Stream stream; byte[] cachedData; string cacheKey; HttpContextBase context;
    public override void Flush() {
      base.Flush();
      if (cachedData == null) {//dej do cache a write
        var data = ToArray();
        var sf = swFile.addToCache(cacheKey, ".html", data);
        context.Response.AddHeader("Etag", sf.eTag);
        stream.Write(data, 0, data.Length);
      } else {//vem z cache
        stream.Write(cachedData, 0, cachedData.Length);
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
          return;
      }
    }

  }

  //************** FILES
  public class AppFileController : Controller {
    //[CacheFilter]
    public ActionResult File(string path) {
      return null;
    }
    protected override void OnResultExecuting(ResultExecutingContext context) {
      var cacheKey = itemUrl(context.HttpContext.Request.Url.AbsolutePath);
      if (Cfg.cfg.defaultPars.swFromFileSystem) {
        using (var fs = System.IO.File.OpenRead(FileSources.pathFromUrl(cacheKey))) fs.CopyTo(HttpContext.Response.OutputStream);
        context.Cancel = true;
      } else {
        //if (Cache.makeResponseFromCache(cacheKey, HttpContext)) { context.Cancel = true; return; };
      }
    }
    static string itemUrl(string url) { return url.Split('~')[1]; }
  }

  //public class CacheFilter : ActionFilterAttribute {
  //  public override void OnResultExecuting(ResultExecutingContext filterContext) {
  //    filterContext.HttpContext.Response.Write("<h1>OK</H1>");
  //    filterContext.Cancel = true;
  //  }
  //  public override void OnResultExecuted(ResultExecutedContext filterContext) {
  //  }
  //}

  public class AppFileConstraint : IRouteConstraint {
    public bool Match(HttpContextBase httpContext, Route route, string parameterName, RouteValueDictionary values, RouteDirection routeDirection) {
      return httpContext.Request.Url.AbsolutePath.IndexOf("~") >= 0;
    }
  }
}