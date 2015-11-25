using LMComLib;
using System;
using System.Web.Hosting;
using System.Web.Http;

namespace web4 {

  public class Global : System.Web.HttpApplication {

    public static class WebApiConfig {
      public static void Register(HttpConfiguration config) {
        //CORS TODO
        //config.EnableCors(new EnableCorsAttribute("*", "*", "*")); //http://www.asp.net/web-api/overview/security/enabling-cross-origin-requests-in-web-api
        config.MapHttpAttributeRoutes();
        config.Routes.MapHttpRoute(
            name: "DefaultApi",
            routeTemplate: "api/{controller}/{id}",
            defaults: new { id = RouteParameter.Optional }
        );
      }
    }

    protected void Application_Start(object sender, EventArgs e) {
      NewData.MachinesLow.rootDir = Machines._rootDir = HostingEnvironment.MapPath("~");
      //https://gist.github.com/HenrikFrystykNielsen/2907767
      //System.Diagnostics.Debugger.Break();
      //GlobalConfiguration.Configuration.Services.Replace(typeof(IAssembliesResolver), new ProductsApp.Controllers.CustomAssemblyResolver());
      //GlobalConfiguration.Configure(config => config.MapHttpAttributeRoutes());//config.RegisterProxyRoutes();

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
      //Server.Transfer("HttpErrorPage.aspx");
    }

    protected void Session_End(object sender, EventArgs e) {

    }

    protected void Application_End(object sender, EventArgs e) {

    }
  }
}