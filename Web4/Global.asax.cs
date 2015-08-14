using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Security;
using System.Web.SessionState;
using System.Web.Http;
using System.Web.Http.Dispatcher;
using System.Reflection;

namespace web4 {

  public class Global : System.Web.HttpApplication {

    protected void Application_Start(object sender, EventArgs e) {
      //https://gist.github.com/HenrikFrystykNielsen/2907767
      //System.Diagnostics.Debugger.Break();
      //GlobalConfiguration.Configuration.Services.Replace(typeof(IAssembliesResolver), new ProductsApp.Controllers.CustomAssemblyResolver());
      System.Web.Http.GlobalConfiguration.Configure(config => config.MapHttpAttributeRoutes());//config.RegisterProxyRoutes();
    }

    protected void Session_Start(object sender, EventArgs e) {

    }

    protected void Application_BeginRequest(object sender, EventArgs e) {
    }

    protected void Application_AuthenticateRequest(object sender, EventArgs e) {

    }

    protected void Application_Error(object sender, EventArgs e) {
      Exception exc = Server.GetLastError();
      LMComLib.Logger.Error(exc);
      Server.Transfer("HttpErrorPage.aspx");
    }

    protected void Session_End(object sender, EventArgs e) {

    }

    protected void Application_End(object sender, EventArgs e) {

    }
  }
}