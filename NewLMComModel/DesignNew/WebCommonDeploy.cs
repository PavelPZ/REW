using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.IO;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

namespace DesignNew {
  public static class WebCommonDeploy {
    public static void zipSWFiles(string rootPath, string rootConfig, string zipFile) {
      
    }


    public class deplyConfig {
      public string[] regExs; //regular expression filter na soubory v self adresari
      public string[] includes; //pridej soubory
      public string[] excludes; //uber soubory
    }

    static IEnumerable<string> getFiles(string rootPath, string configPath) {
      var cfg = Newtonsoft.Json.JsonConvert.DeserializeObject<deplyConfig>(configPath);
      var dir = Path.GetDirectoryName(configPath);
      Func<string, string> fullPath = fn => (fn.StartsWith("/") ? rootPath + fn : dir + "/" + fn).Replace('/','\\').ToLower();
      List<string> res = new List<string>();
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
          if (inc.EndsWith(".json")) res.AddRange(getFiles(rootPath, dir + "\\" + inc));
          else res.Add(fullPath(inc));
        }
      var l1 = cfg.excludes == null ? res : res.Except(cfg.excludes.Select(f => fullPath(f)));

      return l1.Distinct();
    }
  }
}
