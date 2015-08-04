using System;
using System.IO;
using System.Linq;
using System.Xml.Linq;

namespace web4 {
  public static class NormalizeProjectFile {
    static XNamespace xmlns = "http://schemas.microsoft.com/developer/msbuild/2003";
    static string[] validExts = new string[] { "html|js|ts", "css|less", "css|css|less", "js|ts", "js|js|ts" };
    public static void Run() {
      XElement root = XElement.Load(@"d:\LMCom\rew\Web4\Web4.csproj");
      var includes = root.Descendants().
        Where(el => el.Name.LocalName == "TypeScriptCompile" || el.Name.LocalName == "Content").
        SelectMany(el => el.Attributes("Include")).
        GroupBy(a => a.Value.Split('.')[0]).
        Where(g => g.Count() > 1).
        ToArray();

      var includesNew = includes.Select(g => new {
        g.Key,
        exts = g.Select(i => i.Value.Split('.').Last().ToLower()).OrderBy(i => i).Aggregate((r, i) => r + "|" + i),
        names = g.Select(i => i.Value.Substring(g.Key.Length)).OrderBy(i => i).Aggregate((r, i) => r + "|" + i),
        items = g
      }).
        Where(g => validExts.Contains(g.exts)).
        ToArray();

      //remove JS|TS|HTML extensions
      foreach (var el in includesNew.SelectMany(g => g.items.Select(el => el.Parent))) el.Remove();

      // add new contents
      var contentPlace = root.Descendants(xmlns + "Content").First().Parent;
      foreach (var grp in includesNew) {
        bool isTs = grp.exts.IndexOf("ts") >= 0;
        foreach (var cnt in grp.items) {
          if (cnt.Value.IndexOf(".min.") >= 0) continue;
          var ext = cnt.Value.Split('.').Last();
          var el = cnt.Parent; el.RemoveNodes();
          contentPlace.Add(el);
          if ((isTs && ext == "ts") || (!isTs && ext == "less")) continue;
          el.Add(new XElement(xmlns + "DependentUpon", Path.GetFileNameWithoutExtension(grp.Key) + "." + (isTs ? "ts" : "less")));
        }
      }
      root.Save(@"d:\LMCom\rew\Web4\Web4.csproj.normalized");
    }
  }
}