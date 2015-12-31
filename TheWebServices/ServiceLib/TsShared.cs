using LMComLib;
using LMNetLib;
using Newtonsoft.Json;
using System.Linq;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;

namespace servConfig {
  public class Root {
    public string lmapp_website_id;
    public RoutePrefix routePrefix;
    public StartProc startProc;
    public Server server;
    public Azure azure;
    public MvcViewPars mvcViewPars;
    public oAuthConfig oAuth;
    public SendGrid sendGrid;
    public Testing testing;
  }
  public class Azure {
    public string connectionString;
    public string blobJS;
    public string blobMM;
    public ftpAcount swDeployAccount;
    public string azureRootUrl; //prave ladena azure site, pro Design time
  }

  public class ftpAcount {
    public string url;
    public string userName;
    public string password;
  }

  public class SendGrid {
    public string userName;
    public string password;
  }

  public class Testing {
    public string testUserEMail;
  }

  public class Server {
    public string basicPath;
    public string web4Path;
    public string rootUrl;
    //public Apps app;
    //public string[] appPrefixes;
  }

  public enum Brands { lm, skrivanek, grafia, edusoft }
  public enum SkinIds { bs, mdl }
  public enum MvcViewType { no, web4, web, oauth }
  //RoutePrefix a StartProc by se mely vylucovat
  public enum RoutePrefix { no, web, web4, some_other }
  public enum StartProc { no, empty, fluxTest, layoutTest, loginTest, validationTest, testingTest, oauthStartProc, courseTest }

  public class MvcViewPars {
    public MvcViewType type;
    //public string appPart;
    public Langs lang;
    public Brands brand;
    public SkinIds skin;
    public bool debug;
    public bool swFromFileSystem; //SW soubory se berou z filesystemu. Jinak ze swFiles.zip
  }

  public enum oAuthProviders { no = 0, google = 1, facebook = 2, microsoft = 3, lm = 4 }
  public class oAuthConfig {
    public emailer.mail lmLoginEmailSender;
    //public string loginUrl; //plna URL k oAuth login strance
    public oAuthItem[] items; //musi byt pevne poradi, napr. items[2] je facebook
  }
  public class oAuthItem {
    public string clientId;
  }
}

namespace emailer {
  public class emailMsg {
    public mail from;
    public mail[] to;
    [Nullable]
    public mail[] cc;
    [Nullable]
    public mail[] bcc;
    public string subject;
    public string body;
    [Nullable]
    public string plainBody;
    [Nullable]
    public att[] attachments;
  }
  public class mail {
    public string email;
    [Nullable]
    public string title;
  }
  public class att {
    public string fileName;
    public string body;
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

  public static string routePrefix(servConfig.RoutePrefix prefix) {
    return prefix == servConfig.RoutePrefix.no ? "" : prefix.ToString().Replace('_','/') + "/";
  }
}
