using LMComLib;
using LMNetLib;
using System;
using System.Collections.Generic;
using System.Collections;
using System.IO;
using System.Linq;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading;
using System.Web;
using System.Threading.Tasks;
using System.Diagnostics;
using Newtonsoft.Json;
using System.Xml.Serialization;
using Yahoo.Yui.Compressor;
using EcmaScript.NET;

namespace Packager {

  public enum versions {
    debug,
    not_minified,
    minified,
  }

  public class ConfigLow : schools.config {
    public versions version; //debug mod
    public Langs? lang; //jazyk lokalizace
    //public string isTest; //"true" nebo "false" - kurz s testem (pouze English) nebo ne

    //*** download
    public int expiresDays; //pocet dni expirace downloadu
    public int arm; //1..run armadilo
    public int install; //1..po vzbudovani setupu instaluj

    //*** odvozene
    public int targetId { get { return (int)target; } set { } }
    public string langStr { get { return lang == null ? null : ((Langs)lang).ToString().Replace('_', '-'); } set { } }
    public bool callInit { get { return target != Targets.sl; } set { } } //ma se do inicializacniho JS generovat volani Init

    //*** funkce
    public schools.config copyTo(schools.config cfg) {
      base.copyTo(cfg);
      if (!(cfg is ConfigLow)) return cfg;
      ConfigLow cl = cfg as ConfigLow;
      cl.version = version;
      cl.lang = lang;
      cl.expiresDays = expiresDays;
      cl.arm = arm;
      cl.install = install;
      //cfg.isTest = isTest;
      return cfg;
    }
  }

  public class Config : ConfigLow {
    //public Config() { }
    //public Config(ProductsDefine.productDescrLow prod, Targets target, versions version, Langs? lang = null, schools.dictTypes dictType = schools.dictTypes.lingWeb) {
    //  this.prod = prod; this.target = target; this.version = version; this.lang = lang; this.dictType = dictType;
    //}
    //*** products
    [XmlIgnore]
    public ProductsDefine.productDescrLow prod { get { return _prod == null ? _prod = RewApp.findProduct(_productId) : _prod; } set { _prod = value; } } ProductsDefine.productDescrLow _prod;
    public int courseId { get { return _productId == null && _prod == null ? -1 : prod.courseId; } set { } }
    public string productId { get { return _productId == null && _prod == null ? null : (_productId == null ? _prod.productId() : _productId); } set { _productId = value; } } string _productId;
    public Langs[] WebLangs;
  }

  public class Batch : ConfigLow {
    public string[] productIds;
    public Config[] Items {
      get {
        return productIds.
          Select(pid => RewApp.findProduct(pid)).
          Select(prod => this.copyTo(new Config() { prod = prod }/*, isTest = prod.isTest ? "true" : "false" }*/)).
          Cast<Config>().
          ToArray();
      }
      set { }
    }
  }

  public static class RewApp {

    public static string HomePage(Config cfg) {
      cfg.callInit = cfg.target != Targets.sl;
      string bodyClass = "";
      if (cfg.noCpv) bodyClass += " hide-cpv";
      return MainPage.run(
        cfg,
        () => MainPage.Head("schools", MainPage.headStyle.css, cssNewEA(cfg)) +
          MainPage.cssTmplIE7Start + MainPage.Head("schools", MainPage.headStyle.cssie7, cssIE7(cfg)) + MainPage.cssTmplIE7End +
          MainPage.Head("schools", MainPage.headStyle.js, jsNewEA(cfg)) +
          langInclude(cfg),
        () => null,
        () => MainPage.htmls(htmlNewEA(cfg)),
        () => jsInit(cfg),
        bodyClass
      );
    }

    public static ProductsDefine.productDescrLow findProduct(string prodId) {
      return prodId == null ? null : ProductsDefine.Lib.products.First(p => string.Compare(p.productId(), prodId, true) == 0);
    }

    static IEnumerable<Consts.file> langFiles(Config cfg) { //Include JS souboru do manifestu, scorm zipu apod.
      yield return new Consts.file("schools/loc/tradosdata.{#lang}.js");
      yield return new Consts.file("jslib/scripts/cultures/globalize.culture.{#lang}.js");
    }

    static string langInclude(ConfigLow cfg) { //Include lang JS souboru do home stranky
      if (cfg.target == Targets.web) {
        return cfg.lang == null ? null : string.Format(cLangFiles, cfg.langStr);
      }
      return string.Format(cLangFiles, "{#lang}");
    }
    const string cLangFiles = @"
  <script src='loc/tradosdata.{0}.js'></script>
  <script src='../jslib/scripts/cultures/globalize.culture.{0}.js'></script>
";

    //Common files: CSS, JS, CSS bitmaps
    static IEnumerable<Consts.file> commonFiles(ConfigLow cfg) {
      return cssNewEA(cfg).Concat(jsNewEA(cfg)).Concat(cssBitmaps(cfg)).SelectMany(s => s).Select(fn => new Consts.file(fn));
    }

    //Product dependent files
    public static IEnumerable<Consts.file> productFiles(Config cfg) {
      //q:\LMCom\rew\Web4\Schools\EA* files, lokalizace je zakodovana v {{#lang}}
      foreach (var fn in eaCoursesFiles(cfg)) yield return fn;
      //multimedia z d:\LMCom\rew\Web4\RwCourses\* files
      foreach (var fn in mediaFiles(cfg)) yield return fn;
      //q:\LMCom\rew\Web4\Schools\EAImgMp3\ files
      foreach (var fn in eaFiles(cfg)) yield return fn;
      //lokalizovane JS soubory
      foreach (var fn in langFiles(cfg)) yield return fn;
      //prehravace, naleznou se diky var xapPath = 'eaimgmp3/'; v Q:\LMCom\rew\web4\JsLib\EA\EAExtension.ts
      yield return new Consts.file("Schools/SLExtension.xap");
      if (cfg.prod != null && cfg.prod.isTest) {
        yield return new Consts.file("Schools/client.xap");
        foreach (var fn in eaTestFiles(cfg)) yield return fn;
      }
      yield return new Consts.file("Schools/player.swf");
    }

    public static void ScormZipList(string files, Stream str) {
      using (ZipStream zip = new ZipStream(str, false)) {
        foreach (var f in files.Split(new string[] { "\r\n" }, StringSplitOptions.RemoveEmptyEntries)) {
          string[] parts = f.Split(new string[] { ">>" }, StringSplitOptions.RemoveEmptyEntries);
          if (parts.Length != 2) continue;
          zip.AddFileToZip(parts[0], parts[1].ToLowerInvariant());
        }
      }
    }

    public static void BatchIncludes(string batchFn) {
      Batch batch = XmlUtils.FileToObject<Batch>(batchFn);
      XmlUtils.ObjectToFile(Machines.basicPath + @"rew\Downloads\Temp\batch.xml", batch);
      langProductInfos();
      switch (batch.target) {
        case Targets.scorm:
          //spolecne SW files
          Consts.scormManifestFiles(commonFiles(batch), issDestPath + "scormGlobalFiles.iss");
          Consts.scormZipFiles(commonFiles(batch), issDestPath + "scormZipGlobalFiles.iss");
          foreach (var cfg in batch.Items) ScormProduct(cfg);
          break;
        case Targets.download:
          //spolecne SW files
          Consts.saveISSFile(commonFiles(batch), issDestPath + "globalFiles.iss");
          foreach (var cfg in batch.Items) DownloadProduct(cfg);
          break;
        default:
          throw new NotImplementedException();
      }
      //if (!startBatch) return;
      //ProcessStartInfo startInfo = new ProcessStartInfo();
      //startInfo.FileName = @"powershell.exe";
      //startInfo.Arguments = @"& 'q:\LMCom\rew\Downloads\Common\IIS\runBatch.ps1'";
      //Process process = new Process();
      //process.StartInfo = startInfo;
      //process.Start();
    }

    static void ScormProduct(Config cfg) {
      File.WriteAllText(Machines.basicPath + @"rew\Downloads\Common\IIS\indexTemplate-scorm.htm", HomePage(cfg));
      var prodPathPrefix = issDestPath + "products\\" + cfg.prod.productId();
      Consts.scormManifestFiles(productFiles(cfg), prodPathPrefix + "_scorm_files.iss");
      Consts.scormZipFiles(productFiles(cfg), prodPathPrefix + "_scormZip_files.iss");
    }

    static void DownloadProduct(Config cfg) {
      File.WriteAllText(Machines.basicPath + @"rew\Downloads\Common\IIS\indexTemplate-download.htm", HomePage(cfg));
      var prodPathPrefix = issDestPath + "products\\" + cfg.prod.productId();
      Consts.saveISSFile(productFiles(cfg), prodPathPrefix + "_files.iss");
    }

    public static void ScormISSIncludes(Config cfg) {
      langProductInfos();
      ISSInclude(cfg);
      ScormManifestInclude(cfg);
    }

    static void ScormManifestInclude(Config cfg) {
      Consts.scormManifestFiles(commonFiles(cfg), issDestPath + "scormGlobalFiles.iss");
      Consts.scormZipFiles(commonFiles(cfg), issDestPath + "scormZipGlobalFiles.iss");
      //produkt specific files (vcetne home)
      foreach (var prod in ProductsDefine.Lib.products) {
        cfg.prod = prod;
        ScormProduct(cfg);
      }
    }

    static void ISSInclude(Config cfg) {
      //spolecne SW files
      Consts.saveISSFile(commonFiles(cfg), issDestPath + "globalFiles.iss");
      //produkt specific files (vcetne home)
      foreach (var prod in ProductsDefine.Lib.products) {
        cfg.prod = prod;
        DownloadProduct(cfg);
      }
    }
    static string issDestPath = Machines.basicPath + @"rew\Downloads\Common\IIS\";

    static void run(params string[] lines) {
      // Get the full file path
      //string strFilePath = @"d:\LMCom\rew\Downloads\Common\IIS\runTypescript.cmd";

      // Start the process
      using (var proc = System.Diagnostics.Process.Start(
        new System.Diagnostics.ProcessStartInfo("cmd.exe") {
          UseShellExecute = false,
          RedirectStandardOutput = true,
          RedirectStandardInput = true,
          RedirectStandardError = true,
          WorkingDirectory = @"c:\temp\"
        }
      ))
      using (var sIn = proc.StandardInput)
      using (var sOut = proc.StandardOutput)
      using (var sErr = proc.StandardError) {
        foreach (var line in lines) sIn.WriteLine(line);
        sIn.WriteLine("echo DONE");
        sIn.WriteLine("EXIT");
        var err = sErr.ReadToEnd().Trim();
        if (!string.IsNullOrEmpty(err)) throw new Exception(err);
      }
    }

    public static void compileTypeScript() {
      ScanDir sd = new ScanDir();
      sd.BasicPath = basicPath;
      sd.DirsToResult = false;
      sd.FileMask = @"(?i:\.ts)$";
      var cmd = @"""C:\Program Files\Microsoft SDKs\TypeScript\tsc.exe"" --comments --target ES5 " + typescriptDirs.SelectMany(d => typeScriptFiles(d)).Select(f => "\"" + f + "\"").Aggregate((r, i) => r + " " + i);
      run(cmd);
    }
    static IEnumerable<string> typeScriptFiles(string dir) {
      ScanDir sd = new ScanDir();
      sd.BasicPath = basicPath + dir;
      sd.DirsToResult = false;
      sd.FileMask = @"(?i:\.ts)$";
      return sd.FileName(FileNameMode.FullPath);
    }
    static string[] typescriptDirs = new string[] { "Courses", "JsLib", "Login", "Rewise", "Schools" };

    public static void minify(Targets target) {
      StringBuilder err = new StringBuilder();
      var cfg = new Packager.ConfigLow() { target = target };
      jsMinify(cfg, jsMinifiedEx[target][0], err,
        Consts.jsExternal);
      jsMinify(cfg, jsMinifiedEx[target][1], err,
        Consts.jsModel,
        cfg.target == Targets.web ? Consts.jsLogin : null,
        cfg.target == Targets.web ? Consts.jsAdmin : null,
        cfg.target == Targets.scorm ? Consts.jsScorm : null,
        Consts.jsCourse,
        Consts.jsSchool);
      jsMinify(cfg, jsMinifiedEx[target][2], err,
        Consts.jsEA);
      cssMinify(cfg, cssMinifiedEx[target][0],
        Consts.cssBootstrap);
      cssMinify(cfg, cssMinifiedEx[target][1],
        Consts.cssFontAwesome);
      cssMinify(cfg, cssMinifiedEx[target][2],
        Consts.cssEA);
      cssMinify(cfg, cssMinifiedEx[target][3],
        Consts.cssJsLib,
        cfg.target == Targets.web ? Consts.cssLogin : null,
        cfg.target == Targets.web ? Consts.cssAdmin : null,
        Consts.cssCourse,
        Consts.cssSchool);
      cssMinify(cfg, cssMinifiedIE7,
        Consts.cssBootstrapIE7);
      if (err.Length > 0) throw new Exception(err.ToString());
    }
    public static Dictionary<Targets, string[]> jsMinifiedEx = new Dictionary<Targets, string[]>() {
      {Targets.web, new string[] { 
        "schools/_external",
        "schools/_rew_web",
        "schools/_ea"
      }},
      {Targets.scorm, new string[] { 
        "schools/_external",
        "schools/_rew_scorm",
        "schools/_ea"
      }},
      {Targets.download, new string[] { 
        "schools/_external",
        "schools/_rew_download",
        "schools/_ea"
      }}
    };
    //public static string[] jsMinified = new string[] {
    //  "schools/_external",
    //  "schools/_rew",
    //  "schools/_ea"
    //};
    public static Dictionary<Targets, string[]> cssMinifiedEx = new Dictionary<Targets, string[]>() {
      {Targets.web, new string[] { 
        "bs3/css/_bootstrap",
        "font-awesome/css/_font-awesome",
        "jslib/ea/_ea",
        "jslib/css/_rew_web"
      }},
      {Targets.scorm, new string[] { 
        "bs3/css/_bootstrap",
        "font-awesome/css/_font-awesome",
        "jslib/ea/_ea",
        "jslib/css/_rew_scorm"
      }},
      {Targets.download, new string[] { 
        "bs3/css/_bootstrap",
        "font-awesome/css/_font-awesome",
        "jslib/ea/_ea",
        "jslib/css/_rew_download"
      }}
    };

    //public static string[] cssMinified = new string[] {
    //  "BS3/css/_Bootstrap",
    //  "font-awesome/css/_font-awesome",
    //  "jslib/ea/_ea",
    //  "jslib/css/_rew"
    //};
    public const string cssMinifiedIE7 = "font-awesome/css/_font-awesome-ie7";
    static string basicPath = Machines.basicPath + @"rew\web4\";

    static void jsMinify(ConfigLow cfg, string resultFn, StringBuilder err, params string[][] groups) {
      StringBuilder sb = new StringBuilder();
      foreach (var fn in groups.Where(g => g != null).SelectMany(g => g)) sb.AppendLine(File.ReadAllText(basicPath + fn));
      writeFile(basicPath + resultFn + ".js", sb.ToString());
      var comp = new JavaScriptCompressor() { ErrorReporter = new JSErrorReporter(resultFn, err) }.Compress(sb.ToString());
      writeFile(basicPath + resultFn + ".min.js", comp);
    }
    static void cssMinify(ConfigLow cfg, string resultFn, params string[][] groups) {
      StringBuilder sb = new StringBuilder();
      foreach (var fn in groups.Where(g => g != null).SelectMany(g => g)) sb.AppendLine(File.ReadAllText(basicPath + fn));
      writeFile(basicPath + resultFn + ".css", sb.ToString());
      var comp = new CssCompressor().Compress(sb.ToString());
      writeFile(basicPath + resultFn + ".min.css", comp);
    }

    public class JSErrorReporter : ErrorReporter {
      public JSErrorReporter(string fn, StringBuilder err) { this.err = err; this.fn = fn; }
      StringBuilder err;
      string fn;

      public void Error(string message, string sourceName, int line, string lineSource, int lineOffset) {
        err.AppendFormat("{0} in {1}: lineNum={2}, lineTxt={3}, offset={4}", message, sourceName, line, lineSource, lineOffset);
        err.AppendLine("<br/>");
      }
      public EcmaScriptRuntimeException RuntimeError(string message, string sourceName, int line, string lineSource, int lineOffset) {
        err.AppendFormat("{0} in {1}: lineNum={2}, lineTxt={3}, offset={4}", message, sourceName, line, lineSource, lineOffset);
        err.AppendLine("<br/>");
        return new EcmaScriptRuntimeException("*** Error in " + fn, sourceName, line, lineSource, lineOffset);
      }
      public void Warning(string message, string sourceName, int line, string lineSource, int lineOffset) {
      }
    }

    static void writeFile(string fn, string cont) {
      fn = fn.Replace('/', '\\'); cont = cont.TrimEnd();
      if (File.Exists(fn) && File.ReadAllText(fn).TrimEnd() == cont) return;
      File.WriteAllText(fn, cont);
    }

    static IEnumerable<IEnumerable<string>> jsNewEA(ConfigLow cfg) {
      switch (cfg.version) {
        case versions.debug:
          yield return Consts.jsExternal;
          yield return Consts.jsModel;
          if (cfg.target == Targets.web) yield return Consts.jsLogin;
          if (cfg.target == Targets.web) yield return Consts.jsAdmin;
          if (cfg.target == Targets.scorm) yield return Consts.jsScorm;
          yield return Consts.jsCourse;
          yield return Consts.jsSchool;
          yield return Consts.jsEA;
          break;
        case versions.minified:
        case versions.not_minified:
          yield return jsMinifiedEx[cfg.target].Select(m => m + (cfg.version == versions.minified ? ".min" : null) + ".js");
          break;
      }
    }

    static IEnumerable<IEnumerable<string>> cssIE7(ConfigLow cfg) {
      switch (cfg.version) {
        case versions.debug:
          yield return Consts.cssBootstrapIE7;
          break;
        case versions.minified:
        case versions.not_minified:
          yield return new string[] { cssMinifiedIE7 + (cfg.version == versions.minified ? ".min" : null) + ".css" };
          break;
      }
    }

    static IEnumerable<IEnumerable<string>> cssNewEA(ConfigLow cfg) {
      switch (cfg.version) {
        case versions.debug:
          yield return Consts.cssBootstrap;
          yield return Consts.cssFontAwesome;
          yield return Consts.cssEA;
          yield return Consts.cssJsLib;
          if (cfg.target == Targets.web) yield return Consts.cssLogin;
          if (cfg.target == Targets.web) yield return Consts.cssAdmin;
          yield return Consts.cssCourse;
          yield return Consts.cssSchool;
          break;
        case versions.minified:
        case versions.not_minified:
          yield return cssMinifiedEx[cfg.target].Select(m => m + (cfg.version == versions.minified ? ".min" : null) + ".css");
          break;
      }
    }

    static IEnumerable<IEnumerable<string>> htmlNewEA(ConfigLow cfg) {
      yield return Consts.htmlJsLib;
      if (cfg.target == Targets.web) yield return Consts.htmlLogin;
      if (cfg.target == Targets.web) yield return Consts.htmlAdmin;
      yield return Consts.htmlCourse;
      yield return Consts.htmlSchool;
    }


    //Files z q:\LMCom\rew\Web4\JsLib\EA\img\, q:\LMCom\rew\Web4\JsLib\css\img\, Schools\EAImgMp3\framework\controls\symbols, 
    static IEnumerable<IEnumerable<string>> cssBitmaps(ConfigLow cfg) {
      yield return new string[] { @"JsLib\EA\img", @"JsLib\css\img", @"Schools\EAImgMp3\framework\controls\symbols", /*@"BS3\fonts\",*/ @"font-awesome\font\" }.
        Select(pth => Directory.CreateDirectory(basicPath + pth)).
        SelectMany(d => d.EnumerateFiles().Select(f => f.DirectoryName.Substring(basicPath.Length) + "\\" + f.Name));
    }

    //ridi se obsahem d:\LMCom\rew\Downloads\Common\batches\webs\
    public static void webHomePages() {
      ScanDir sd = new ScanDir();
      sd.BasicPath = Machines.basicPath + @"rew\Downloads\Common\batches\webs";
      sd.FileMask = @"(?i:\.xml)$";
      foreach (var f in sd.FileName(FileNameMode.FullPath)) {
        var cfg = XmlUtils.FileToObject<Config>(f);
        var project = Path.GetFileNameWithoutExtension(f);
        foreach (var lv in cfg.WebLangs.SelectMany(l => webVersions.Select(v => new { l, v }))) {
          cfg.target = LMComLib.Targets.web; cfg.version = lv.v; cfg.lang = lv.l;
          var home = HomePage(cfg);
          File.WriteAllText(basicPath + string.Format(@"schools/index_{0}{1}{2}.html", string.IsNullOrEmpty(project) ? null : project + "_", lv.l, lv.v == versions.minified ? null : "_debug"), home);
        }
      }
    }
    static versions[] webVersions = new versions[] { versions.minified, versions.not_minified };

    //Javascript pro inicializaci
    static string jsInit(Config ccfg) {
      schools.config cfg = new schools.config();
      ccfg.copyTo(cfg);
      cfg.rootCourse = ccfg.target != Targets.web ? int.MaxValue - 1 : (ccfg.prod == null ? -1 : ccfg.prod.courseId);
      cfg.EADataPath = ccfg.EADataPath != null ? ccfg.EADataPath : "eaimgmp3/";

      string cfgStr = JsonConvert.SerializeObject(cfg);
      //if (ccfg.prod == null && ccfg.target != Targets.web) {
      if (ccfg.target != Targets.web) {
        string t = int.MaxValue.ToString(); string c = (int.MaxValue - 1).ToString();
        cfgStr = cfgStr.Replace(t, "{#target}").Replace(c, "{#courseId}");
      }
      return "    function jsInit() { schoolInit.init_school_master(" + cfgStr + "); }" + (ccfg.callInit ? "\r\n    jsInit();" : null);
    }

    //files from q:\LMNet2\WebApps\EduAuthorNew\, ziskane parsovanim modulu z q:\LMCom\rew\Web4\Schools\EAData\
    static IEnumerable<Consts.file> eaFiles(Config cfg) {
      return ProductsDefine.Lib.allModules(cfg.prod).
        SelectMany(m => imagesMp3(File.ReadAllText(basicPath + @"Schools\EAData\" + m + ".json"))).
        Select(f => f.ToLower()).
        Distinct().
        Select(file => new Consts.file("Schools/EAImgMp3/" + file));
    }

    static IEnumerable<string> imagesMp3(string mod) {
      foreach (var s in imageReg.Matches(mod).Cast<Match>().Select(m => m.Value.Substring(7, m.Value.Length - 8))) yield return s;
      foreach (var s in wmaReg.Matches(mod).Cast<Match>().Select(m => m.Value.Substring(11, m.Value.Length - 16))) {
        yield return s.Replace("', 'globalId':'", "/") + ".mp3";
      }
    }
    static Regex imageReg = new Regex("easrc=\".*?\"");
    static Regex wmaReg = new Regex(@"'spaceId':'.*?', 'globalId':'.*?wma'");

    //test soubory z d:\LMCom\rew\Web4\RwTests\
    static IEnumerable<Consts.file> eaTestFiles(Config cfg) {
      return cfg.prod.productParts().
        Where(p => !string.IsNullOrEmpty(p.testFileName())).
        SelectMany(p => Directory.CreateDirectory(basicPath + @"RwTests\" + p.testFileName()).EnumerateFiles("*.*", SearchOption.AllDirectories)).
        Select(f => f.DirectoryName.Substring(basicPath.Length) + "\\" + f.Name).
        Select(f => new Consts.file(f));
    }

    static IEnumerable<Consts.file> mediaFiles(Config cfg) {
      ProductsDefine.productDescrNew prod = cfg.prod as ProductsDefine.productDescrNew;
      if (prod == null) yield break;
      ScanDir sd = new ScanDir();
      sd.BasicPath = basicPath + @"RwCourses\" + prod.dataPath.Replace('/', '\\');
      sd.DirsToResult = false;
      sd.FileMask = @"(?i:\.(wmv|png|mp3|jpg|json))$";
      foreach (var f in sd.FileName(FileNameMode.FullPath)) yield return new Consts.file(f.Substring(basicPath.Length));
    }
    
    //soubory z q:\LMCom\rew\Web4\Schools\EACourses\ a q:\LMCom\rew\Web4\Schools\EAData\
    static IEnumerable<Consts.file> eaCoursesFiles(Config cfg) {
      string lngTxt = cfg.lang == null ? "{#lang}" : cfg.lang.ToString().Replace('_', '-');
      yield return new Consts.file("Schools/EACourses/courses.rjson");
      yield return new Consts.file("Schools/EACourses/dicts.rjson");
      yield return new Consts.file(string.Format("Schools/EACourses/{0}.rjson", cfg.prod.productId()));
      yield return new Consts.file(string.Format("Schools/EACourses/{1}/{0}.json", cfg.prod.productId(), lngTxt));
      foreach (var s in cfg.prod.grammarLevels()) {
        yield return new Consts.file(string.Format("Schools/EAGrammar/{0}_{1}.json", cfg.prod.course, s));
        yield return new Consts.file(string.Format("Schools/EAGrammar/{2}/{0}_{1}.json", cfg.prod.course, s, lngTxt));
      }
      yield return new Consts.file("Schools/EAData/instructions.json");
      yield return new Consts.file(string.Format("Schools/EAData/{0}/instructions.json", lngTxt));
      foreach (var s in ProductsDefine.Lib.allModules(cfg.prod)) {
        yield return new Consts.file(string.Format("Schools/EAData/{0}.json", s));
        yield return new Consts.file(string.Format("Schools/EAData/{1}/{0}.json", s, lngTxt));
        if (cfg.dictType == schools.dictTypes.lingOffline)
          yield return new Consts.file(string.Format("Schools/EAData/{1}/lingDict_{0}.rjson", s, lngTxt));
      }
    }

    //http://www.shareware-discount.com/2012/07/softwarepassport-professional-v9-win32-25-discount-coupon-codes.html
    //Generace obsahu q:\LMCom\rew\Downloads\Common\IIS\ + 
    // langs
    // products
    static void langProductInfos() {
      foreach (var lng in CommonLib.bigLocalizations) {
        File.WriteAllText(
          string.Format(Machines.basicPath + @"rew\Downloads\Common\IIS\langs\{0}.iss", lng.ToString().Replace('_', '-')),
          string.Format("#define public innoSetupLocFile \"{0}\"", Consts.isl(lng)));
      }
      foreach (var prod in ProductsDefine.Lib.products) {
        File.WriteAllText(
          string.Format(Machines.basicPath + @"rew\Downloads\Common\IIS\products\{0}.iss", prod.productId()),
          string.Format(
  @"
#define public line ""{0}""
#define public productTitle ""{1}""
#define public productNum ""{2}""
#define public dictId ""{3}""
",
            CommonLib.CourseIdToLineId(prod.course), prod.title, prod.courseId, CommonLib.CourseIdToLang(prod.course).ToString().Replace('_', '-')
        ));
      }
    }


  }

  public static class MainPage {

    public static string run(Config cfg, Func<string> inHead, Func<string> bodyStart, Func<string> jsRender, Func<string> jsInit, string bodyClass) {
      return
@"
<!DOCTYPE html>
<!--[if lt IE 8]>  
<html class='no-media ie7'> 
<![endif]-->
<!--[if IE 8]>
<html class='no-ie7 no-media ie8'>
<![endif]-->
<!--[if IE 9]>
<html class='ie ie9'> 
<![endif]-->
<!--[if (gt IE 9)|!(IE)]><!-->
<html class='no-ie7 no-ie8'>
<!--<![endif]-->

<head runat='server'>
  <meta http-equiv='X-UA-Compatible' content='IE=Edge' />
  <meta http-equiv='Content-Type' content='text/html; charset=utf-8'>
  <meta name='viewport' content='width=device-width'/>
  <title>LANGMaster</title>
" +
  inHead()
  +
@"
<!-- head.htm -->
</head>
<body
"
  + (string.IsNullOrEmpty(bodyClass) ? null : " class='" + bodyClass + "'")
  + ">"
  +
  bodyStart()
  +
@"
  <div id='root' data-bind='template:rootTemplate'></div>
  <script id='dummy' type='text/x-jsrender' data-for='Dummy'>
    {{for ~ActPage()}}{{/for}}
  </script>
"
  +
  jsRender()
  +
@"
  <script type='text/javascript'>
"
 +
 jsInit()
 +
@"    
  </script>
</body>
</html>
"
;
    }
    public enum headStyle { css, js, cssie7 }
    public static string Head(string rootRel, headStyle style, IEnumerable<IEnumerable<string>> files) {
      StringBuilder sb = new StringBuilder();
      foreach (var f in Consts.getFiles(Consts.pathType.relUrl, rootRel, files)) sb.AppendFormat(style != headStyle.js ? cssTmpl : jsTmpl, f);
      return sb.ToString();
    }

    //public static string html(string id) {
    //  return File.ReadAllText(Consts.basicPath + id.Replace('/', '\\')).Split(new string[] { "###" }, StringSplitOptions.None)[1];
    //}

    public static string htmls(IEnumerable<IEnumerable<string>> sources) {
      var fragments = parseHtmls(Consts.getFiles(Consts.pathType.fileName, null, sources));
      StringBuilder sb = new StringBuilder();
      foreach (var tp in fragments) {
        if (tp.Item1.StartsWith("!")) {
          var s = tp.Item1.Substring(1);
          sb.AppendLine(string.Format(htmlPageTmpl, s.Split(',')[0], s, tp.Item2));
        } else
          sb.AppendLine(string.Format(htmlTmpl, tp.Item1, tp.Item2));
      }
      return sb.ToString();
    }

    const string cssTmpl = "  <link href='{0}' rel='stylesheet'/>\r\n";
    public const string cssTmplIE7Start = @"  
<!--[if IE 7]>
";
    public const string cssTmplIE7End = @"  
<![endif]-->
";

    const string jsTmpl = "  <script src='{0}'></script>\r\n";
    const string htmlPageTmpl =
@"<script id='{0}' type='text/x-jsrender' data-for='{1}'>
  {{{{for ~ActPage()}}}}
  {2}
  {{{{/for}}}}
</script>
";
    const string htmlTmpl = "<script id='{0}' type='text/x-jsrender'>{1}</script>";
    const string basicUrl = "http://www.langmaster.com/lmcom/rew/";

    static Regex removeAspComment = new Regex(@"<%--.*?--%>", RegexOptions.Singleline);

    static IEnumerable<Tuple<string, string>> parseHtmls(IEnumerable<string> files) {
      return files.SelectMany(f => toTupples(File.ReadAllText(f).Split(new string[] { "###" }, StringSplitOptions.None)));
    }
    static IEnumerable<Tuple<string, string>> toTupples(IEnumerable<string> data) {
      if (data == null) yield break;
      bool isFirst = true; string first = null;
      foreach (var s in data) {
        if (isFirst) { first = s.Trim().ToLower(); isFirst = false; continue; }
        yield return Tuple.Create(first, removeAspComment.Replace(s, ""));
        isFirst = true;
      }
      if (!isFirst) yield return Tuple.Create(first, (string)null);
    }

  }

  public static class Consts {

    public static string basicPath = Machines.basicPath + @"rew\web4\";

    public class file {
      public file(string fn, string srcPath = null) {
        fn = fn.Replace('/', '\\');
        var idx = fn.LastIndexOf('\\');
        name = idx < 0 ? fn : fn.Substring(idx + 1);
        destDir = idx < 0 ? null : fn.Substring(0, idx);
        this.srcPath = srcPath == null ? basicPath + destDir + "\\" + name : srcPath;
      }
      public string srcPath; //napr. q:\LMCom\rew\Downloads\Common\IIS
      public string destDir; //napr. schools
      public string name; //napr. Index.html
    }

    public static void saveISSFile(IEnumerable<Consts.file> files, string issFileName) {
      StringBuilder sb = new StringBuilder();
      foreach (var f in files) sb.AppendLine(Consts.ISSFile(f));
      File.WriteAllText(issFileName, sb.ToString());
    }

    static string ISSFile(Consts.file file) {
      return string.Format(@"source: {0}; DestDir: {{app}}\{{#path}}data\{2}; DestName:{1}; Flags: ignoreversion; ", file.srcPath, file.name, file.destDir);
    }

    public static void scormManifestFiles(IEnumerable<Consts.file> files, string issFileName) {
      StringBuilder sb = new StringBuilder();
      foreach (var f in files) sb.AppendLine(Consts.scormManifestFile(f));
      File.WriteAllText(issFileName, sb.ToString());
    }

    static string scormManifestFile(Consts.file file) {
      return string.Format(@"<file href=""{0}"" />", (file.destDir + "/" + file.name).ToLowerInvariant().Replace('\\', '/'));
    }

    public static void scormZipFiles(IEnumerable<Consts.file> files, string issFileName) {
      StringBuilder sb = new StringBuilder();
      foreach (var f in files) sb.AppendLine(Consts.scormZipFile(f));
      File.WriteAllText(issFileName, sb.ToString());
    }

    static string scormZipFile(Consts.file file) {
      return string.Format("{0}>>{1}", file.srcPath, file.destDir + "\\" + file.name).ToLowerInvariant();
    }

    public enum pathType {
      relUrl,
      fileName,
    }

    public static IEnumerable<string> getFiles(pathType type, string urlDir, IEnumerable<IEnumerable<string>> sources) {
      foreach (var f in sources.SelectMany(s => s)) {
        switch (type) {
          case pathType.relUrl: yield return VirtualPathUtility.MakeRelative("~/" + urlDir + "/x.htm", "~/" + f); break;
          case pathType.fileName: yield return basicPath + f.Replace('/', '\\'); break;
        }
      }
    }

    public static string isl(Langs lng) {
      switch (lng) {
        case Langs.ar_sa: return @"Languages\Arabic.isl";
        case Langs.bg_bg: return @"Languages\Bulgarian.isl";
        case Langs.ca_es: return @"Languages\Catalan.isl";
        case Langs.cs_cz: return @"Languages\Czech.isl";
        case Langs.da_dk: return @"Languages\Danish.isl";
        case Langs.de_de: return @"Languages\German.isl";
        case Langs.el_gr: return @"Languages\Greek.isl";
        case Langs.en_gb: return @"default.isl";
        case Langs.es_es: return @"Languages\Spanish.isl";
        case Langs.fi_fi: return @"Languages\Finnish.isl";
        case Langs.fr_fr: return @"Languages\French.isl";
        case Langs.he_il: return @"Languages\Hebrew.isl";
        case Langs.hr_hr: return @"Languages\Croatian.isl";
        case Langs.hu_hu: return @"Languages\Hungarian.isl";
        case Langs.it_it: return @"Languages\Italian.isl";
        case Langs.ja_jp: return @"Languages\Japanese.isl";
        case Langs.ko_kr: return @"Languages\Korean.isl";
        case Langs.lv_lv: return @"Languages\Latvian.isl";
        case Langs.nb_no: return @"Languages\Norwegian.isl";
        case Langs.nl_nl: return @"Languages\Dutch.isl";
        case Langs.pl_pl: return @"Languages\Polish.isl";
        case Langs.pt_br: return @"Languages\BrazilianPortuguese.isl";
        case Langs.pt_pt: return @"Languages\Portuguese.isl";
        case Langs.ro_ro: return @"Languages\Romanian.isl";
        case Langs.ru_ru: return @"Languages\Russian.isl";
        case Langs.sk_sk: return @"Languages\Slovak.isl";
        case Langs.sl_si: return @"Languages\Slovenian.isl";
        case Langs.sp_sp: return @"Languages\Spanish.isl";
        case Langs.sv_se: return @"Languages\Swedish.isl";
        case Langs.th_th: return @"Languages\Thai.isl";
        case Langs.tr_tr: return @"Languages\Turkish.isl";
        case Langs.uk_ua: return @"Languages\Ukrainian.isl";
        case Langs.vi_vn: return @"Languages\Vietnamese.isl";
        case Langs.zh_cn: return @"Languages\ChineseSimp.isl";
        case Langs.lt_lt: return @"Languages\Lithuanian.isl";

        default: throw new Exception("~/Services/Downloads/Generators/Setup_CommonCode.ascx: missing code here");
      }
    }
    /************** COMMON ************************/
    public static string[] jsExternal = new string[] {
      "jslib/scripts/jquery.js",
      "jslib/scripts/jquery-migrate.js",
      "JsLib/Scripts/ui/jquery.ui.core.js",
      "JsLib/Scripts/ui/jquery.ui.widget.js",
      "JsLib/Scripts/ui/jquery.ui.mouse.js",
      "JsLib/Scripts/ui/jquery.ui.position.js",
      "JsLib/Scripts/ui/jquery.ui.slider.js",
      "jslib/scripts/globalize.js",
      "jslib/scripts/jquery.ba-hashchange.js",
      "jslib/scripts/json2.js",
      "jslib/scripts/jsRender.js",
      "jslib/scripts/knockout.js",
      "jslib/scripts/knockout-delegatedEvents.js",
      "jslib/scripts/underscore.js",
      "jslib/js/external/KnockOut_JsRender.js",
      //"bs3/js/Bootstrap.js",
      "jslib/js/external/ClosureLib.js",
      "jslib/js/external/ClosureLibLow.js",
      "jslib/js/GenLMComLib.js",
      "jslib/js/gui.js",
      //"JsLib/Controls/Common/PopupDlg.js",
      //"jslib/scripts/PrintStackTrace.js"
    };

    public static string[] jsModel = new string[] {
      "jslib/js/ModelBase.js",
      "jslib/js/Utils.js",
      "jslib/js/ViewBase.js",
      "jslib/js/Ajax.js",
      "jslib/js/Validate.js"
    };

    public static string[] cssBootstrap = new string[] {
      "BS3/css/Bootstrap.css",
      //"BS3/css/glyphicons.css",
      "JsLib/Scripts/ui/jquery.ui.theme.css",
      "JsLib/Scripts/ui/jquery.ui.slider.css", 
    };

    public static string[] cssFontAwesome = new string[] {
      "font-awesome/css/font-awesome.css"
    };

    public static string[] cssBootstrapIE7 = new string[] {
      "font-awesome/css/font-awesome-ie7.css"
    };

    public static string[] cssJsLib = new string[] {
      "jslib/css/common.css",
      "jslib/css/buttons.css"
    };

    public static string[] htmlJsLib = new string[] {
      "JsLib/Controls/Common/Breadcrumb.html",
      "JsLib/Controls/Common/Input.html",
      "JsLib/Controls/Common/MenuItem.html",
      "JsLib/Controls/Common/OkCancel.html",
      "JsLib/Controls/Common/TwoColumn.html",
      "JsLib/Controls/CrsItem/CrsItem.html",
      //"JsLib/Controls/Common/PopupDlg.html",
    };
    public static string[] htmlLogin = new string[] {
      "Login/ConfirmRegistration.html",
      "Login/EMails.html",
      "Login/ForgotPassword.html",
      "Login/ChangePassword.html",
      "Login/LMLogin.html",
      "Login/Login.html",
      "Login/Profile.html",
      "Login/Register.html",
    };


    /************** EA ************************/
    public static string[] jsEA = new string[] {
      "jslib/ea/ea.js",
    };

    public static string[] cssEA = new string[] {
      "jslib/ea/ea.css",
    };

    /************** LOGIN ************************/
    public static string[] jsLogin = new string[] {
      "jslib/js/OAuth.js",
      "jslib/js/EMailer.js",
      "login/GenLogin.js",
      "login/Model.js",
      "login/Login.js",
      "login/LMLogin.js",
      "login/Register.js",
      "login/ChangePassword.js",
      "login/ForgotPassword.js",
      "login/Profile.js",
      "login/ConfirmRegistration.js"
    };

    public static string[] cssLogin = new string[] {
      "jslib/css/login.css"
    };

    /************** COURSE ************************/
    public static string[] jsCourse = new string[] {
      "courses/GenCourseModel.js",
      "courses/Course.js",
      "courses/SndModel.js",
      "courses/GapFill.js",
      "courses/Pairing.js",
      "courses/SingleChoice.js",
      "courses/Media.js",
      "courses/CheckItem.js",
      "courses/Drag.js",
    };

    public static string[] htmlCourse = new string[] {
      "courses/course.html",
      "courses/GapFill.html",
      "courses/Pairing.html",
      "courses/SingleChoice.html",
      "courses/Media.html",
      "courses/CheckItem.html",
      "courses/Drag.html",
      "courses/Macro.html",
    };

    public static string[] cssCourse = new string[] {
      "jslib/css/course.css",
    };


    /************** SCHOOL ************************/
    public static string[] jsAdmin = new string[] {
      "admin/GenAdmin.js",
      "admin/admin.js",
      "admin/KeyGen.js",
      "admin/Products.js",
      "admin/CompAdmins.js",
    };

    public static string[] jsScorm = new string[] {
      "login/GenLogin.js",
      "jslib/js/scorm.js",
    };


    public static string[] cssAdmin = new string[] {
      "jslib/css/admin.css",
    };

    public static string[] htmlAdmin = new string[] {
      "Admin/AdminBS.html",
      "Admin/CompAdminsBS.html",
      "Admin/EMails.html",
      "Admin/KeyGenBS.html",
      "Admin/ProductsBS.html",
    };


    /************** REWISE ************************/
    public static string[] jsRewise = new string[] {
      "jslib/js/external/RJSON.js",
      "Rewise/GenLMComLib.js",
      "Rewise/GenRw.js",
      "Rewise/GenRew.js",
      "Rewise/Model.js",
      "Rewise/Book.js",
      "Rewise/BookView.js",
      "Rewise/Fact.js",
      "Rewise/Home.js",
      "Rewise/HomeMobile.ascx.js",
      "Rewise/HomeView.js",
      "Rewise/JsRenderEx.js",
      "Rewise/Lesson.js",
      "Rewise/LessonView.js",
      "Rewise/RwPersist.js",
      "Rewise/RwPersistFake.js",
      "Rewise/SelectLang.js",
      "Rewise/Vocab.js",
      "Rewise/VocabView.js"
    };

    public static string[] cssRewise = new string[] {
      "jslib/css/flag-mid.css",
      "jslib/css/flag-small.css"
    };
    public static string[] htmlRewise = new string[] {
      "Rewise/BookMobile.html",
      "Rewise/FactMobile.html",
      "Rewise/HomeBS.html",
      "Rewise/HomeMobile.html",
      "Rewise/LessonMobile.html",
      "Rewise/SelectLangBS.html",
      "Rewise/SelectLangMobile.html",
      "Rewise/VocabBS.html",
      "Rewise/VocabMobile.html",
    };

    /************** SCHOOL ************************/
    public static string[] jsSchool = new string[] {
      "jslib/scripts/waitforimages.js",
      "schools/gencourse.js",
      "schools/genschools.js",
      "schools/interfaces.js",
      "jslib/js/sound/SLExtension.js",
      "jslib/js/sound/sound.js",
      "jslib/js/unicode.js",
      "jslib/js/base32.js",
      "jslib/js/keys.js",
      "jslib/ea/eaextension.js",
      "jslib/controls/crsitem/crsitem.js",
      "jslib/controls/dict/dict.js",
      "jslib/js/external/rjson.js",
      "jslib/js/external/md5.js",
      "jslib/js/external/punycode.js",
      "schools/lib.js",
      "schools/products.js",
      "schools/topBar.js",
      "schools/model.js",
      "schools/persist.js",
      "schools/persistlocal.js",
      "schools/persistnewea.js",
      "schools/persistdownload.js",
      "schools/persistphonegap.js",
      "schools/persistscormex.js",
      "schools/persistscormlocal.js",
      "schools/my.js",
      "schools/home.js",
      "schools/course.js",
      "schools/lesson.js",
      "schools/module.js",
      "schools/exercise.js",
      "schools/init.js",
      "schools/genscorm.js",
      "schools/greeninfo.js",
      "schools/cpv.js",
      "schools/gramm.js",
      "schools/test.js",
    };

    public static string[] jsDesign = new string[] {
      "schools/design/design.js"
    };

    public static string[] cssSchool = new string[] {
      "jslib/css/flag-mid.css",
      "jslib/css/flag-small.css",
      "jslib/css/crsitem.css",
      "jslib/css/schools.css",
      "jslib/css/dict.css"
    };

    public static string[] htmlSchool = new string[] {
      "Schools/CourseBS.html",
      "Schools/ExerciseBS.html",
      "Schools/GreenInfoBS.html",
      "Schools/TopBar.html",
      "Schools/HomeBS.html",
      "Schools/LessonBS.html",
      "Schools/ModuleBS.html",
      "Schools/MyBS.html",
      "Schools/CpvBS.html",
      "Schools/GrammBS.html",
      "Schools/Test.html",
      "JsLib/Controls/Dict/Dict.html",
    };
  }

  //static void aspNet_run_exe(string path, string pars) {
  //  Process proc = new Process();
  //  proc.StartInfo.WorkingDirectory = Machines.basicPath + @"rew\Downloads\Common\IIS";
  //  proc.StartInfo.FileName = path;
  //  proc.StartInfo.Arguments = pars;
  //  proc.StartInfo.WindowStyle = ProcessWindowStyle.Hidden;
  //  proc.Start();
  //  proc.WaitForExit();
  //}
}

