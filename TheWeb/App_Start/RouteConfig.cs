using LMNetLib;
using System;
using System.Collections.Generic;
using System.Web;
using System.Linq;
using System.Web.Mvc;
using System.Web.Routing;

namespace TheWeb {
  public class RouteConfig {
    public static void RegisterRoutes(RouteCollection routes) {
      routes.LowercaseUrls = true;

      routes.MapRoute(
          name: "OAuth",
          url: servConfig.StartProc.oauthStartProc.ToString(),
          defaults: new { controller = "Home", action = "OAuth" }
      );

      servConfig.RoutePrefix actRoutePrefix;
      routes.MapRoute(
          name: "Web-other",
          url: Cfg.routePrefix(actRoutePrefix = servConfig.RoutePrefix.some_other) + "{*path}",
          defaults: new { controller = "Home", action = "Web", routePrefix = actRoutePrefix, startProc = servConfig.StartProc.no }
          //constraints: new { startProc = new StartProcConstraint() }
      );
      routes.MapRoute(
          name: "Web",
          url: Cfg.routePrefix(servConfig.RoutePrefix.no) + "{startProc}/{*path}",
          defaults: new { controller = "Home", action = "Web", routePrefix = servConfig.RoutePrefix.no },
          constraints: new { startProc = new StartProcConstraint() }
      );

      routes.MapRoute(
          name: "Web4",
          url: Cfg.routePrefix(servConfig.RoutePrefix.web4),
          defaults: new { controller = "Home", action = "Web4" }
      );
      routes.MapRoute(
          name: "Web-empty",
          url: "",
          defaults: new { controller = "Home", action = "Web", routePrefix = servConfig.RoutePrefix.no, startProc = servConfig.StartProc.testingTest.ToString() }
      );
      routes.MapRoute(
          name: "error",
          url: "{*path}",
          defaults: new { controller = "Home", action = "Error" }
      );
    }
  }

  public class StartProcConstraint : IRouteConstraint {
    bool IRouteConstraint.Match(HttpContextBase httpContext, Route route, string parameterName, RouteValueDictionary values, RouteDirection routeDirection) {
      if (!values.ContainsKey(parameterName)) return false;
      var par = (string)values[parameterName]; if (string.IsNullOrEmpty(par)) return false;
      return validStartProcs.Contains(par.ToLower());
    }
    HashSet<string> validStartProcs = new HashSet<string>(LowUtils.EnumGetValues<servConfig.StartProc>().Select(v => v.ToString().ToLower()));
  }
}


//routes.MapRoute(
//    name: "AppFile",
//    url: "{*path}",
//    defaults: new { controller = "AppFile", action = "File", path = "" },
//    constraints: new { path = new AppFileConstraint() }
//);