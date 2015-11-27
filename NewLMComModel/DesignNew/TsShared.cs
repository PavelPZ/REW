using LMNetLib;
using Newtonsoft.Json;
using System.Diagnostics;
using System.IO;

namespace servConfig {
  public class Root {
    public string lmapp_website_id;
    public Server server;
    public Azure azure;
    public ViewPars defaultPars;
    public oAuthConfig oAuth;
  }
  public class Azure {
    public string connectionString;
    public string blobJS;
    public string blobMM;
    public ftpAcount swDeployAccount;
    public string rootUrl;
    public string azureRootUrl; //prave ladena azure site, pro Design time
  }

  public class ftpAcount {
    public string url; public string userName; public string password;
  }


  public class Server {
    public string basicPath;
    public string web4Path;
  }

  public enum Brands { lm, skrivanek, grafia, edusoft }
  public enum SkinIds { bs, mdl }
  public enum Apps { web4, web, oauth }

  public class ViewPars {
    public Apps app;
    public string appPart;
    public LMComLib.Langs lang;
    public Brands brand;
    public SkinIds skin;
    public bool debug;
    public bool swFromFileSystem; //SW soubory se berou z filesystemu. Jinak ze swFiles.zip
  }

  public enum oAuthProviders { no = 0, google = 1, facebook = 2, microsoft = 3, }
  public class oAuthConfig {
    public string loginUrl; //plna URL k oAuth login strance
    public oAuthItem[] items; //musi byt pevne poradi, napr. items[2] je facebook
  }
  public class oAuthItem {
    public string clientId;
  }



}

//**************** CONFIG
public static class Cfg {
  public static servConfig.Root cfg;
  public static void init(string basicPath, string webId) {
    LowUtils.TraceErrorCall("Cfg.Init", () => {
      var fn = basicPath + @"\wwwroot\" + webId + "-config.js";
      var js = File.ReadAllText(fn);
      var idx1 = js.IndexOf('{'); var idx2 = js.LastIndexOf(';');
      js = js.Substring(idx1, idx2 - idx1);
      cfg = JsonConvert.DeserializeObject<servConfig.Root>(js);
      cfg.server.basicPath = basicPath;
      Cfg.cfg.lmapp_website_id = webId;
      Trace.TraceInformation("Cfg.Init, config=" + Newtonsoft.Json.JsonConvert.SerializeObject(cfg));
    });
  }
  public static string toJS(string loginUrl) {
    var copy = JsonConvert.DeserializeObject<servConfig.Root>(JsonConvert.SerializeObject(cfg));
    copy.oAuth.loginUrl = loginUrl;
    copy.azure.connectionString = null;
    return JsonConvert.SerializeObject(copy);
  }
}
