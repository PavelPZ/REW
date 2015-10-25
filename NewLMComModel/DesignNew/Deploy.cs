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

    //******************* generace D:\LMCom\rew\Web4\Deploy\Minify.xml
    //public static void generateMSBuildMinify() {
    //  XElement template = XElement.Load(@"D:\LMCom\rew\Web4\Deploy\MinifyTemplate.xml");
    //  var Target = template.Descendants(schema + "Target").First();
    //  var ItemGroup = Target.Element(schema + "ItemGroup");
    //  int cnt = 0;
    //  generatePart2(Target, ItemGroup, ref cnt, externals, "externals");
    //  generatePart2(Target, ItemGroup, ref cnt, web, "web");
    //  foreach (var lang in validLangStrs) generatePart2(Target, ItemGroup, ref cnt, loc, lang);
    //  var CssFiles = ItemGroup.Element(schema + "CssFiles");
    //  CssFiles.Add(new XAttribute("Include", css.Select(c => "../" + c).Aggregate((r, i) => r + "; " + i)));
    //  template.Save(@"D:\LMCom\rew\Web4\Deploy\Minify.xml");
    //}

    //static void generatePart2(XElement target, XElement itemGroup, ref int cnt, string[][] externals, string name) {
    //  cnt++;
    //  var tagName = "JavaScriptFiles" + cnt.ToString();

    //  var Include = externals.SelectMany(e => e).Select(s => "../" + string.Format(s, name)).Aggregate((r, i) => r + "; " + i);
    //  itemGroup.Add(new XElement(schema + tagName, new XAttribute("Include", Include)));

    //  target.Add(new XElement(schema + "JavaScriptCompressorTask",
    //    new XAttribute("DeleteSourceFiles", "false"),
    //    new XAttribute("SourceFiles", string.Format("@({0})", tagName)),
    //    new XAttribute("OutputFile", string.Format("{0}.min.js", name))
    //  ));
    //}

    //static XNamespace schema = "http://schemas.microsoft.com/developer/MsBuild/2003";

    //public static string jsDeployData() {
    //  Dictionary<string, string[]> json = new Dictionary<string, string[]>();
    //  json["jsOtherBrowsers"] = new string[] { "jslib/scripts/jquery.js" };

    //  json["jsBasic"] = new string[] { "jslib/scripts/underscore.js", "jslib/scripts/angular.js", "jslib/scripts/angular-route.js", "jslib/scripts/angular-animate.js", "jslib/scripts/angular-cookies.js", "jslib/scripts/angular-ui-router.js", "jslib/scripts/ui-bootstrap-tpls.js" };
    //  json["jsExternal"] = jsExternal;
    //  json["jsGround"] = jsGround;

    //  json["jsModel"] = jsModel;

    //  json["jsScorm"] = jsScorm;
    //  json["jsLogin"] = jsLogin;
    //  json["jsAdmin"] = jsAdmin;

    //  json["jsSchoolStart"] = jsSchoolStart;
    //  json["jsSchoolEnd"] = jsSchoolEnd;

    //  json["jsCourse"] = jsCourse;
    //  json["jsBlended"] = jsBlended;

    //  json["jsLoc"] = new string[] { "schools/loc/tradosdata.en-gb.js", "jslib/scripts/cultures/globalize.culture.en-gb.js" };

    //  return Newtonsoft.Json.JsonConvert.SerializeObject(json);
    //}


  }

}
