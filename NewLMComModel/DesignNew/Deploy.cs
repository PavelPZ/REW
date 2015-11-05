using LMComLib;
using Packager;
using System.Collections.Generic;
using System.IO;
using System.IO.Compression;
using System.Linq;
using System.Xml.Linq;
using Microsoft.Build.Framework;
using Microsoft.Build.Utilities;
using Yahoo.Yui.Compressor;
using System.Text;

namespace DesignNew {

  //******************* MS BUILD TASKS

  //HTML files do d:\LMCom\rew\WebCode\App_Data\htmlfiles.txt
  public class htmlFiles : Task {
    public override bool Execute() {
      Log.LogMessage(">>> htmlFiles START");
      Log.LogMessage(htmlFile);
      var res = Packager.MainPage.htmls(Packager.RewApp.htmlNewEA(true, designId));
      File.WriteAllText(htmlFile, res);
      Log.LogMessage(">>> htmlFiles END");
      return true;
    }
    public string designId { get; set; }
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
      foreach (var fn in files.Select(f => basicPath + string.Format(f,lng).Replace('/', '\\'))) {
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



  public static partial class Deploy {

    //******************* soubory pro SW deployment
    public static IEnumerable<string> allSWFiles(string basicPath) {
      var JSs = validDesignIds.SelectMany(skin => validLangStrs.SelectMany(lang => new bool[] { true, false }.Select(bol => new { skin, lang, bol }))).SelectMany(slb => allJS(slb.bol, slb.lang, slb.skin));
      var CSSs = validDesignIds.SelectMany(skin => new bool[] { true, false }.Select(bol => new { skin, bol })).SelectMany(slb => allCSS(slb.bol, slb.skin));
      var other = File.ReadAllLines(basicPath + @"Deploy\otherServer.txt").Concat(File.ReadAllLines(basicPath + @"Deploy\otherClient.txt"));
      return JSs.Concat(CSSs).Concat(other).Where(s => !string.IsNullOrEmpty(s)).Select(s => s.ToLower()).Distinct().OrderBy(s => s);
    }
    public static void zipSWFiles(string basicPath, string zipFile) {
      if (File.Exists(zipFile)) File.Delete(zipFile);
      using (var zipStr = File.OpenWrite(zipFile))
      using (ZipArchive zip = new ZipArchive(zipStr, ZipArchiveMode.Create)) {
        foreach (var fn in allSWFiles(basicPath).Select(f => f.Replace('/', '\\'))) {
          ZipArchiveEntry entry = zip.CreateEntry(fn);
          var inpFn = basicPath + fn;
          using (var inpStr = File.OpenRead(inpFn))
          using (var str = entry.Open()) inpStr.CopyTo(str);
          if (gzipExtensions.Contains(Path.GetExtension(inpFn))) {
            entry = zip.CreateEntry(fn + ".gzip", CompressionLevel.NoCompression);
            using (var inpStr = File.OpenRead(inpFn)) {
              if (inpStr.Length < 100) continue;
              using (var str = entry.Open())
              using (var gzipStr = new GZipStream(str, CompressionMode.Compress))
                inpStr.CopyTo(gzipStr);
            }
          }
        }
      }
    }

    //******************* soubory pro generaci index.html
    //seznam JS a CSS souboru (pro debug a minify mode)
    public static IEnumerable<string> allJS(bool isMin, string lang, string designId) {
      var jss = isMin ? jsMins.Select(s => string.Format(s, lang)) : externals.SelectMany(s => s).Concat(web.SelectMany(s => s)).Concat(loc.SelectMany(s => s).Select(s => string.Format(s, lang)));
      IEnumerable<string> skin = Enumerable.Empty<string>();
      if (!string.IsNullOrEmpty(designId)) { string[] sk; if (jsSkins.TryGetValue(designId, out sk)) skin = sk; }
      return jquery(isMin).Concat(jss).Concat(skin);
    }

    public static IEnumerable<string> allCSS(bool isMin, string designId) {
      var cssList = isMin ? cssMins : css;
      IEnumerable<string> skin = Enumerable.Empty<string>();
      if (!string.IsNullOrEmpty(designId)) { string[] sk; if (cssSkins.TryGetValue(designId, out sk)) skin = sk; }
      return cssList.Concat(skin);
    }

  }

}
