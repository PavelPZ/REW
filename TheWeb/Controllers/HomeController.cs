using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Web.Routing;

namespace TheWeb {

  [ETagFilter]
  public class HomeController : Controller {
    public HomeController(): base() {
    }
    public ActionResult Empty() {
      return View("Schools");
      //return Cfg.cfg.defaultPars.app == servConfig.Apps.web
      //  ? View("Schools")
      //  : View("Common", null);
    }
    public ActionResult CommonTest(string appPart) {
      return View("CommonTest");
    }
    public ActionResult Common() {
      return View("Common");
    }
    public ActionResult OAuth() {
      return View("OAuth");
    }
    public ActionResult Schools() {
      return View("Schools");
    }
    public ActionResult AppFile() {
      return View("Error");
    }
  }

  public class ETagFilter : ActionFilterAttribute {
    public override void OnResultExecuting(ResultExecutingContext filterContext) {
    }
    public override void OnResultExecuted(ResultExecutedContext filterContext) {
    }
  }

  public class AppFileController : Controller {
    public ActionResult File(string path) {
      return null;
    }
  }

  public class AppFileConstraint : IRouteConstraint {
    public bool Match(HttpContextBase httpContext, Route route, string parameterName, RouteValueDictionary values, RouteDirection routeDirection) {
      return httpContext.Request.Url.AbsolutePath.IndexOf("~") >= 0;
    }
  }
}