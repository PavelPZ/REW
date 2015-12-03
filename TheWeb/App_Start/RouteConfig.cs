using System.Web.Mvc;
using System.Web.Routing;

namespace TheWeb {
  public class RouteConfig {
    public static void RegisterRoutes(RouteCollection routes) {
      routes.LowercaseUrls = true;

      servConfig.RoutePrefix actRoutePrefix;
      routes.MapRoute(
          name: "Web",
          url: Cfg.routePrefix(actRoutePrefix = servConfig.RoutePrefix.no) + "{startProc}/{*path}",
          defaults: new { controller = "Home", action = "Web", routePrefix = actRoutePrefix, startProc = servConfig.StartProc.testingTest.ToString() }
      );
      routes.MapRoute(
          name: "Web-other",
          url: Cfg.routePrefix(actRoutePrefix = servConfig.RoutePrefix.some_other) + "{startProc}/{*path}",
          defaults: new { controller = "Home", action = "Web", routePrefix = actRoutePrefix, startProc = servConfig.StartProc.testingTest.ToString() }
      );
      routes.MapRoute(
          name: "OAuth",
          url: Cfg.routePrefix(servConfig.RoutePrefix.no),
          defaults: new { controller = "Home", action = "OAuth" }
      );
      routes.MapRoute(
          name: "Web4",
          url: Cfg.routePrefix(servConfig.RoutePrefix.web4),
          defaults: new { controller = "Home", action = "Web4" }
      );
      routes.MapRoute(
          name: "Empty",
          url: "",
          defaults: new { controller = "Home", action = "Empty" }
      );
    }
  }
}
