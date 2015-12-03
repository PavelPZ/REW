using System.Web.Mvc;
using System.Web.Routing;

namespace TheWeb {
  public class RouteConfig {
    public static void RegisterRoutes(RouteCollection routes) {
      routes.LowercaseUrls = true;

      //routes.MapRoute(
      //    name: "AppFile",
      //    url: "{*path}",
      //    defaults: new { controller = "AppFile", action = "File", path = "" },
      //    constraints: new { path = new AppFileConstraint() }
      //);
      routes.MapRoute(
          name: "CommonTest",
          url: Cfg.appPrefixes[servConfig.Apps.web] + "/{appPart}/{*path}",
          defaults: new { controller = "Home", action = "CommonTest", appPart = "" }
      );
      routes.MapRoute(
          name: "Common",
          url: Cfg.appPrefixes[servConfig.Apps.web],
          defaults: new { controller = "Home", action = "Common" }
      );
      routes.MapRoute(
          name: "OAuth",
          url: Cfg.appPrefixes[servConfig.Apps.oauth],
          defaults: new { controller = "Home", action = "OAuth" }
      );
      routes.MapRoute(
          name: "Schools",
          url: Cfg.appPrefixes[servConfig.Apps.web4],
          defaults: new { controller = "Home", action = "Schools" }
      );
      routes.MapRoute(
          name: "Empty",
          url: "",
          defaults: new { controller = "Home", action = "Empty" }
      );
    }
  }
}
