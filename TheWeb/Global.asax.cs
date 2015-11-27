using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Http;
using System.Web.Mvc;
using System.Web.Routing;

namespace TheWeb {
  public class MvcApplication : System.Web.HttpApplication {
    protected void Application_Start() {
      AppConfig.Init(this);
      GlobalConfiguration.Configure(WebApiConfig.Register);
      RouteConfig.RegisterRoutes(RouteTable.Routes);
    }
  }
}
