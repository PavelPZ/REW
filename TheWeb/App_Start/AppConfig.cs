using System.Configuration;
using System.Web;

namespace TheWeb {
  public static class AppConfig {
    public static void Init(HttpApplication app) {
      //global config
      var basicPath = app.Context.Server.MapPath("~/");    
      Cfg.init(basicPath + @"\wwwroot\servConfig.js");
      Cfg.cfg.server.basicPath = basicPath;
      Cfg.cfg.server.web4Path = ConfigurationManager.AppSettings["filesources.web4"];
      //FileSourcer
      DesignNew.FileSources.init(Cfg.cfg.server.web4Path, Cfg.cfg.server.basicPath);
    }
  }
}
