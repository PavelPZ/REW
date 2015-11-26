using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Web.Routing;

namespace TheWeb {
  public class RouteConfig {
    public static void RegisterRoutes(RouteCollection routes) {
      routes.LowercaseUrls = true;
      routes.IgnoreRoute("{resource}.axd/{*pathInfo}");

      routes.MapRoute(
          name: "AppFile",
          url: "{*path}",
          defaults: new { controller = "AppFile", action = "File", path = "" },
          constraints: new { path = new AppFileConstraint() }
      );
      routes.MapRoute(
          name: "CommonTest",
          url: "web/{appPart}",
          defaults: new { controller = "Home", action = "CommonTest", appPart = "" }
      );
      routes.MapRoute(
          name: "Common",
          url: "web",
          defaults: new { controller = "Home", action = "Common" }
      );
      routes.MapRoute(
          name: "OAuth",
          url: "oauth",
          defaults: new { controller = "Home", action = "OAuth" }
      );
      routes.MapRoute(
          name: "Schools",
          url: "web4",
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
