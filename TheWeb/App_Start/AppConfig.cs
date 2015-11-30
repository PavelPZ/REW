using LMNetLib;
using System;
using System.Configuration;
using System.Diagnostics;
using System.Web;

namespace TheWeb {
  public static class AppConfig {
    public static void Init(HttpApplication app) {
      LowUtils.TraceErrorCall("TheWeb.AppConfig.Init", () => {
        //global config
        var webId = Environment.GetEnvironmentVariable("LMAPP_WEBSITE_ID") ?? System.Environment.GetEnvironmentVariable("LMAPP_WEBSITE_ID", EnvironmentVariableTarget.Machine);
        var basicPath = app.Context.Server.MapPath("");
        Cfg.init(basicPath, webId);
        //FileSourcer
        DesignNew.FileSources.init(Cfg.cfg.server.web4Path, Cfg.cfg.server.basicPath);
        //Cache
        if (!Cfg.cfg.defaultPars.swFromFileSystem) Cache.init();
        //Azure
        AzureLib.Factory.init(Cfg.cfg.azure.connectionString);
        //Auth
        LoginServices.authController.init();
      });
    }
  }
}
