using LMComLib;
using System;
using System.Web.Http;

namespace WebCode {

  public class WebApiApplication : System.Web.HttpApplication {

    public static class WebApiConfig {
      public static void Register(HttpConfiguration config) {
        config.MapHttpAttributeRoutes();
        config.Routes.MapHttpRoute(
            name: "DefaultApi",
            routeTemplate: "api/{controller}/{id}",
            defaults: new { id = RouteParameter.Optional }
        );
      }
    }

    protected void Application_Start(object sender, EventArgs e) {
      Machines._rootDir = @"d:\LMCom\rew\Web4";
      //System.Diagnostics.Debugger.Break();
      GlobalConfiguration.Configure(WebApiConfig.Register);
      NewData.Lib.lmcomSeed();
    }

    protected void Session_Start(object sender, EventArgs e) {

    }

    protected void Application_BeginRequest(object sender, EventArgs e) {
    }

    protected void Application_AuthenticateRequest(object sender, EventArgs e) {

    }

    protected void Application_Error(object sender, EventArgs e) {
      Exception exc = Server.GetLastError();
      //vylouceni url=http://blended.langmaster.cz/vyzva57services/reports chyby pro blended
      if (exc.Message.IndexOf("Server cannot set status after HTTP headers have been sent.") >= 0) return;
      LMComLib.Logger.Error(exc);
    }

    protected void Session_End(object sender, EventArgs e) {

    }

    protected void Application_End(object sender, EventArgs e) {

    }
  }
}