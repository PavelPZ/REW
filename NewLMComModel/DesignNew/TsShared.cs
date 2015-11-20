using Newtonsoft.Json;
using System.IO;

namespace servConfig {
  public class Root {
    public Azure azure;
    public ViewPars defaultPars;
  }
  public class Azure {
    public string connectionString;
    public string blobJS;
    public string blobMM;
  }

  public enum Brands { lm, skrivanek, grafia, edusoft }
  public enum SkinIds { bs, mdl }
  public enum Apps { web4, web }

  public class ViewPars {
    public Apps app;
    public LMComLib.Langs lang;
    public Brands brand;
    public SkinIds skin;
    public bool debug;
    public bool swFromFileSystem; //SW soubory se berou z filesystemu. Jinak ze swFiles.zip
  }

}

//**************** CONFIG
public static class Cfg {
  public static servConfig.Root cfg;
  public static void init(string fn) {
    if (cfg != null) return;
    var js = File.ReadAllText(fn);
    var idx1 = js.IndexOf('{'); var idx2 = js.LastIndexOf(';');
    js = js.Substring(idx1, idx2 - idx1);
    cfg = JsonConvert.DeserializeObject<servConfig.Root>(js);
  }
  public static string toJS() {
    var copy = JsonConvert.DeserializeObject<servConfig.Root>(JsonConvert.SerializeObject(cfg));
    copy.azure.connectionString = null;
    return JsonConvert.SerializeObject(copy);
  }
}
