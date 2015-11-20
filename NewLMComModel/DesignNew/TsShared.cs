using Newtonsoft.Json;
using System.IO;

namespace servConfig {
  public class Root {
    public Azure azure;
  }
  public class Azure {
    public string connectionString;
    public string blobJS;
    public string blobMM;
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
