using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.IO;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

namespace DesignNew {

  public class HomeView {
    public string title;
    public string csss() { return null; }
    public string jss() { return null; }
  }

  public static class WebCommonDeploy {

    public static HomeView getViewModel(string name) { return new HomeView(); }

    public static void zipSWFiles(string rootPath, string rootConfig, string zipFile) {

    }

    public class deplyConfig {
      public string[] regExs; //regular expression filter na soubory v self adresari
      public string[] includes; //pridej soubory
    }

    static IEnumerable<string> getFiles(string rootPath, string configPath) {
      var cfg = Newtonsoft.Json.JsonConvert.DeserializeObject<deplyConfig>(configPath);
      var dir = Path.GetDirectoryName(configPath);
      Func<string, string> fullPath = fn => (fn.StartsWith("/") ? rootPath + fn : dir + "/" + fn).Replace('/', '\\').ToLower();
      HashSet<string> res = new HashSet<string>();
      //** regExs
      if (cfg.regExs != null) {
        var files = Directory.GetFiles(dir, "*.*", SearchOption.AllDirectories);
        foreach (var regEx in cfg.regExs) {
          var rx = new Regex(regEx, RegexOptions.IgnoreCase);
          foreach (var fn in files) if (rx.IsMatch(fn)) res.Add(fullPath(fn));
        }
      }
      //** includes x excludes
      if (cfg.includes != null)
        foreach (var inc in cfg.includes) {
          if (inc.EndsWith(".json")) res.UnionWith(getFiles(rootPath, dir + "\\" + inc));
          else if (inc.StartsWith("!")) res.Remove(fullPath(inc));
          else res.Add(fullPath(inc));
        }

      return res.Distinct();
    }
  }
}
