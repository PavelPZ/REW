using LMComLib;
using LMNetLib;
using Microsoft.Build.Framework;
using Microsoft.Build.Utilities;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using Yahoo.Yui.Compressor;

namespace DesignNew {

  public class deployToAzure : Task {
    public override bool Execute() {
      Log.LogMessage(">>> deployToAzure START");
      var msg = SynchronizeDirs.synchronize(
        isJS,
        new azureDriver(accountName, accountKey, container),
        buildIds.Split(',').Select(bi => LowUtils.EnumParse<BuildIds>(bi)),
        langs.Split(',').Select(bi => LowUtils.EnumParse<Langs>(bi))
      );
      Log.LogMessage(msg);
      Log.LogMessage(">>> deployToAzure END");
      return true;
    }
    [Required]
    public bool isJS { get; set; } //true pro JS soubory, other pro multimedia soubory 
    [Required]
    public string accountName { get; set; } //napr. "lmdata"
    [Required]
    public string accountKey { get; set; } //napr. "Hx//uWeo6vDSA2BHbBJP7HZviSSE6D8qZhGV7f4G778yPcfGOiBODF6o7Cg6029JiqnpMm1U8KrlD3+hycYiEw=="
    [Required]
    public string langs { get; set; } //napr. "cs_cz,en_gb"
    [Required]
    public string buildIds { get; set; } //napr. "blended"
    [Required]
    public string container { get; set; } //napr. "js-v001" nebo "mm-v001"
  }

  //HTML cast index.html do d:\LMCom\rew\WebCode\App_Data\html*.txt
  public class htmlFiles : Task {
    public override bool Execute() {
      Log.LogMessage(">>> htmlFiles START");
      Log.LogMessage(htmlFile);
      foreach (var designId in LowUtils.EnumGetValues<DesignIds>()) {
        var res = Packager.MainPage.htmls(Packager.RewApp.htmlNewEA(true, designId == DesignIds.no ? null : designId.ToString()));
        File.WriteAllText(string.Format(htmlFile, designId), res);
      }
      Log.LogMessage(">>> htmlFiles END");
      return true;
    }
    [Required]
    public string htmlFile { get; set; }
  }

  //SW files do d:\LMCom\rew\WebCode\App_Data\swfiles.zip
  public class zipSWFiles : Task {
    public override bool Execute() {
      Log.LogMessage(">>> zipSWFiles START");
      Log.LogMessage(basicPath + " > " + zipFile);
      Deploy.zipSWFiles(basicPath, zipFile);
      Log.LogMessage(">>> zipSWFiles END");
      return true;
    }
    [Required]
    public string basicPath { get; set; }
    [Required]
    public string zipFile { get; set; }
  }

  //minify JS a CSS
  public class minify : Task {
    public override bool Execute() {
      Log.LogMessage(">>> minify START");
      generate(Deploy.externals.SelectMany(f => f), "externals", true, null);
      generate(Deploy.web.SelectMany(f => f), "web", true, null);
      foreach (var lng in Deploy.validLangStrs) {
        generate(Deploy.loc.SelectMany(f => f), lng, true, lng);
      }
      generate(Deploy.css, null, false, null);
      Log.LogMessage(">>> minify END");
      return true;
    }
    void generate(IEnumerable<string> files, string name, bool isJs, string lng) {
      StringBuilder sb = new StringBuilder();
      Compressor compr = isJs ? (Compressor)new JavaScriptCompressor() : new CssCompressor();
      foreach (var fn in files.Select(f => basicPath + string.Format(f, lng).Replace('/', '\\'))) {
        //Log.LogMessage(fn);
        var res = compr.Compress(File.ReadAllText(fn, Encoding.UTF8));
        sb.Append(res);
      }
      var minFn = isJs ? basicPath + @"deploy\" + name + ".min.js" : basicPath + @"jslib\css\lm.min.css";
      Log.LogMessage("> " + minFn);
      File.WriteAllText(minFn, sb.ToString());
    }
    [Required]
    public string basicPath { get; set; }
  }



}
