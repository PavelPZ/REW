using System;
using System.Linq;
using LMComLib;
using LMNetLib;
using System.Collections.Generic;
using System.IO;
using System.Text;
using System.Xml.Linq;
using System.Text.RegularExpressions;
using System.Web;
using System.IO.Compression;
using Newtonsoft.Json;
using System.Xml;
using System.ComponentModel;
using schools;
using System.Threading.Tasks;
using Course;

public static class EADeployLib {

  public static JsonSerializerSettings jsonSet = new JsonSerializerSettings { DefaultValueHandling = DefaultValueHandling.Ignore, NullValueHandling = NullValueHandling.Ignore };

  public static string readFile(string dir, string fn, Langs Key) {
    string destFn = dir + (Key == Langs.no ? null : Key.ToString().Replace('_', '-') + "\\") + fn;
    return File.ReadAllText(destFn);
  }

  public static void writeFile(string dir, string fn, Langs Key, string Value, bool incRJson = false) {
    string destFn = dir + (Key == Langs.no ? null : Key.ToString().Replace('_', '-') + "\\") + fn;
    LowUtils.AdjustFileDir(destFn);
    File.WriteAllText(destFn, Value);
    string value = Value;
    if (incRJson) {
      destFn = destFn.Replace(".json", ".rjson");
      value = ClearScript.Lib.JSON2RJSON(Value);
      File.WriteAllText(destFn, value);
    }
    //using (Stream msOut = File.OpenWrite(destFn + ".gzip")) {
    //  using (GZipStream gzip = new GZipStream(msOut, CompressionMode.Compress))
    //  using (StreamWriter wrg = new StreamWriter(gzip))
    //    wrg.Write(value);
    //}
  }


  public static void writeFiles(string dir, string fn, Dictionary<Langs, string> files, bool incRJson = false) {
    foreach (var kv in files) {
      writeFile(dir, fn, kv.Key, kv.Value, kv.Key == Langs.no ? incRJson : false);
    }
  }

}

public static class Instructions {

  public static void run2() {
    var ctx = new NewEATradosCtx();
    MemoryStream str = new MemoryStream();
    NewEATradosLib.pageGroupStart(ctx);
    NewEATradosLib.pageStart(ctx, CourseIds.no, "instructions", "framework/instructions/instructions.lmdata");
    NewEATradosLib.doHack = () => true;
    NewEATradosLib.doHackEx = () => new ConfigNewEA() { courseId = CourseIds.English };
    TradosLib.LocalizeXmlLow(@"d:\LMCom\rew\EduAuthorNew\framework\instructions\Instructions.lmdata", Langs.en_gb, str, true);
    string instr = Encoding.UTF8.GetString(str.ToArray());
    var body = XElement.Parse(instr);
    var wrongs = body.Descendants(lm + "page_instruction").Select(el => el.AttributeValue("type")).GroupBy(s => s).Where(g => g.Count() > 1).ToArray();
    foreach (var nd in body.DescendantNodes().Where(n => n.NodeType == XmlNodeType.Comment).ToArray()) nd.Remove();
    var instrs = JsonConvert.SerializeObject(
      body.
        Descendants(lm + "page_instruction").
        Select(el => new { type = el.AttributeValue("type"), value = LowUtils.InnerXml(el).Replace(" xmlns=\"htmlPassivePage\"", null) }).
        ToDictionary(i => i.type.ToLowerInvariant(), i => i.value),
      Newtonsoft.Json.Formatting.Indented, EADeployLib.jsonSet);
    NewEATradosLib.doHack = null;
    var tradosRes = NewEATradosLib.pageGroupEnd(ctx, true); //JSON prelozenych retezcu
    tradosRes.Add(Langs.no, instrs);
    EADeployLib.writeFiles(Machines.rootPath + @"Schools\EAData\", "instructions.json", tradosRes); //vypis zdroje i JSON prekladu
  }

  public static void run() {
    var ctx = new NewEATradosCtx();
    MemoryStream str = new MemoryStream();
    NewEATradosLib.pageGroupStart(ctx);
    NewEATradosLib.pageStart(ctx, CourseIds.no, "instructions", "framework/instructions/instructions.lmdata");
    NewEATradosLib.doHack = () => true;
    NewEATradosLib.doHackEx = () => new ConfigNewEA() { courseId = CourseIds.English };
    TradosLib.LocalizeXmlLow(@"d:\LMCom\rew\EduAuthorNew\framework\instructions\Instructions.lmdata", Langs.en_gb, str, true);
    NewEATradosLib.doHack = null;
    //locs
    string locFn = @"d:\LMCom\rew\Web4\Data\instr\instr.loc";
    var tradosRes = NewEATradosLib.pageGroupEnd(ctx, true); //JSON prelozenych retezcu
    var transs = tradosRes.ToDictionary(kv => kv.Key, kv => JsonConvert.DeserializeObject<Dictionary<string, string>>(kv.Value));
    var enTrans = transs[Langs.en_gb]; var notLoc = new List<string>();
    var locs = new XElement("root", transs.Select(t => new XElement(t.Key.ToString(), t.Value.Select(kv => new XElement("trans", new XAttribute("lang", kv.Key.ToString()), kv.Value)))));
    locs.Save(locFn);

    string instr = Encoding.UTF8.GetString(str.ToArray());
    var body = XElement.Parse(instr);
    //page_instruction nahrad divem
    foreach (var el in body.Descendants(lm + "page_instruction").ToArray()) {
      el.Name = "div";
      el.Add(new XAttribute("id", el.AttributeValue("type")));
      el.Attribute("type").Remove();
    }
    //zmena html namespace
    foreach (var el in body.Descendants().Where(nd => nd.Name.Namespace == html).ToArray()) el.Name = el.Name.LocalName;
    //odstran comments
    foreach (var nd in body.DescendantNodes().Where(n => n.NodeType == XmlNodeType.Comment).ToArray()) nd.Remove();
    //pages
    body = body.Descendants("body").First(); body.Name = "div";
    var div = CourseModel.tag.FromElement<CourseModel.htmlTag>(body);
    CourseModel.body pg = new CourseModel.body {
      url = "/data/instr/std/",
      Items = div.Items
    };
    foreach (var tag in pg.scan()) tag.modifyTexts(text => CourseMeta.locLib.initOldEALocalizeText(text, enTrans, key => notLoc.Add(pg.url + "/" + key + ": " + text)));
    foreach (var item in pg.Items) {
      var p = new CourseModel.body { Items =item.Items, title="" };
      var pXml = p.ToElement();
      var pFn = @"d:\LMCom\rew\Web4\Data\instr\std\" + item.id.ToLower() + ".xml";
      CourseModel.tag.saveExXml(pFn, pXml);
    }
    var pageXml = pg.ToElement();
    var fn = @"d:\LMCom\rew\Web4\Data\instr\std\ex.xml";
    CourseModel.tag.saveExXml(fn, pageXml);
    //pageXml.Save(fn, SaveOptions.DisableFormatting);
    //save locs
    //tradosRes.Add(Langs.no, instrs);
    //EADeployLib.writeFiles(Machines.basicPath + @"rew\Web4\Schools\EAData\", "instructions.json", tradosRes); //vypis zdroje i JSON prekladu
  }
  static XNamespace lm = "lm";
  static XNamespace html = "htmlPassivePage";
}

public static class Exercise {

  //public static string BuildProductNew2(string prodId, bool exportExFromMetadata) {
  //  try {
  //    CourseMeta.productDescrNew prod = (CourseMeta.productDescrNew)CourseMeta.lib.findProduct(prodId);
  //    if (exportExFromMetadata)
  //      foreach (var mod in prod.Modules()) {
  //        string dir = CourseModel.lib.moduleDir(mod);
  //        var meta = CourseModel.lib.readModule(dir);
  //        CourseModel.MacroLib.exFilesFromMetaXml(dir, meta);
  //      }
  //    prod.refreshLessonsEx();
  //    CoursesSitemap.courseSitemapWithLoc(prod, false);
  //    //JSON data cviceni
  //    var mods = prod.Modules().ToArray();
  //    foreach (var mod in mods) buildModuleNew2(mod);
  //    //Errors
  //    StringBuilder sb = new StringBuilder();
  //    foreach (var testEx in mods.SelectMany(m => m.exs).Where(e => !string.IsNullOrEmpty(e.buildError))) {
  //      sb.AppendFormat("**** Error in exercise {0}: {1}\r\n<br/>", testEx.compId, testEx.buildError);
  //    }
  //    return sb.Length > 0 ? sb.ToString() : null;
  //  } catch (Exception exp) {
  //    return LowUtils.ExceptionToString(exp, true, true);
  //  }
  //}

  //public static string BuildProductNew(string prodId, bool exportExFromMetadata) {
  //  try {
  //    CourseMeta.productDescrNew prod = (CourseMeta.productDescrNew)CourseMeta.lib.findProduct(prodId);
  //    if (exportExFromMetadata)
  //      foreach (var mod in prod.Modules()) {
  //        string dir = CourseModel.lib.moduleDir(mod);
  //        var meta = CourseModel.lib.readModule(dir);
  //        CourseModel.MacroLib.exFilesFromMetaXml(dir, meta);
  //      }
  //    prod.refreshLessonsEx();
  //    CoursesSitemap.courseSitemapWithLoc(prod, false);
  //    //JSON data cviceni
  //    var mods = prod.Modules().ToArray();
  //    foreach (var mod in mods) buildModuleNew(mod/*, false*/);
  //    ////JSON nastrihani zvuku
  //    //ScanDir sd = new ScanDir();
  //    ////var bp = Machines.basicPath + @"rew\Web4\RwCourses\" + prod.dataPath;
  //    //sd.BasicPath = Machines.rwDataSourcePath + @"rew\Web4\RwCourses\" + prod.dataPath;
  //    //sd.FileMask = @"(?i:\.(lst))$";
  //    //foreach (var fn in sd.FileName(FileNameMode.FullPath)) {
  //    //  CourseModel.SndDialog sf = XmlUtils.FileToObject<CourseModel.SndDialog>(fn);
  //    //  string sfStr = CourseModel.lib.ObjectToJson(sf);
  //    //  File.WriteAllText(Path.ChangeExtension(fn, ".json"), sfStr);
  //    //}
  //    //Errors
  //    StringBuilder sb = new StringBuilder();
  //    foreach (var testEx in mods.SelectMany(m => m.exs).Where(e => !string.IsNullOrEmpty(e.buildError))) {
  //      sb.AppendFormat("**** Error in exercise {0}: {1}\r\n<br/>", testEx.compId, testEx.buildError);
  //    }
  //    return sb.Length > 0 ? sb.ToString() : null;
  //  } catch (Exception exp) {
  //    return LowUtils.ExceptionToString(exp, true, true);
  //  }
  //}

  //public static void buildModuleNew2(CourseMeta.modInfo mod) {
  //  List<CourseModel.Page> pages = new List<CourseModel.Page>(); List<string> newEaLstFiles = new List<string>();
  //  foreach (var testEx in mod.exs) {
  //    StringBuilder err = new StringBuilder();
  //    var pg = CourseModel.lib.BuildExerciseToObj(testEx, ref newEaLstFiles, err);
  //    pg.url = testEx.compId;
  //    pages.Add(pg);
  //  }
  //  var dataLoc = new Dictionary<Langs, string>() { { Langs.no, CourseModel.lib.ObjectToJson(pages) } };
  //  foreach (Langs lng in mod.prod.locs()) dataLoc[lng] = "{}";
  //}

  //public static void buildModuleNew(CourseMeta.modInfo mod) {
  //  StringBuilder sb = new StringBuilder(); List<string> newEaLstFiles = new List<string>();
  //  foreach (var testEx in mod.exs) {
  //    StringBuilder err = new StringBuilder();
  //    schools.exStatic info = new exStatic() { title = testEx.Title, url = testEx.compId, format = ExFormat.rew };
  //    string res2 = CourseModel.lib.BuildExerciseNew(testEx, ref newEaLstFiles, err);
  //    testEx.buildError = err.ToString();
  //    sb.Append(JsonConvert.SerializeObject(info)); sb.Append("$$$"); sb.Append(res2); sb.Append("$$$");
  //  }
  //  if (sb.Length == 0) return;
  //  var dataLoc = new Dictionary<Langs, string>() { { Langs.no, sb.ToString() } };
  //  foreach (Langs lng in mod.prod.locs()) dataLoc[lng] = "{}";

  //  //design time lokalizace do cestiny: pro ea\english1\l01\a\hueex0_l01_a03 pouzije pro obsah souboru Schools\EAData\cs-cz\ea_senglish1_xl01_sa.json soubor Schools\EAData\cs-cz\english1_xl01_sa_shome_dhtm.json
  //  var parts = mod.path.Split('/');
  //  var spaceId = parts[1];
  //  parts = parts.Skip(2).ToArray();
  //  var locFn = Machines.basicPath + @"rew\Web4\Schools\EAData\cs-cz\" + LowUtils.JSONToId(spaceId, parts.Aggregate((r, i) => r + "/" + i) + "/home.htm") + ".json";
  //  var lmauthor_czloc = File.Exists(locFn) ? File.ReadAllText(locFn) : null;
  //  if (lmauthor_czloc != null) dataLoc[Langs.cs_cz] = lmauthor_czloc;

  //  EADeployLib.writeFiles(Machines.basicPath + @"rew\Web4\Schools\EAData\", mod.jsonId + ".json", dataLoc); //vypis zdroje i JSON prekladu
  //  //prenos multimedii z zdroje do web aplikace
  //  string destDir = (Machines.basicPath + @"rew\Web4\Schools\EAImgMp3\").ToLower();
  //  string srcDir = (Machines.rootPath).ToLower();
  //  Action<string, string> lstToJson = (srcFn, destFn) => {
  //    var tag = CourseModel.lib.ReadTag<CourseModel.Tag>(srcFn);
  //    string tagStr = CourseModel.lib.ObjectToJson(tag);
  //    File.WriteAllText(Path.ChangeExtension(destFn, ".json"), tagStr);
  //  };
  //  //Pozn: .lst file = nastrihani zvuku
  //  foreach (var srcFn in LowUtils.scanDir(CourseModel.lib.moduleDir(mod), multimediaFilter)) {
  //    string destFn = srcFn.Replace(srcDir, destDir).Replace(mod.pathOrderNum.Replace('/', '\\'), mod.path.Replace('/', '\\'));
  //    string destFnDir = Path.GetDirectoryName(destFn);
  //    if (!File.Exists(destFnDir)) Directory.CreateDirectory(destFnDir);
  //    if (File.Exists(destFn)) File.SetAttributes(destFn, FileAttributes.Normal);
  //    if (Path.GetExtension(srcFn) == ".lst")
  //      lstToJson(srcFn, destFn);
  //    else
  //      File.Copy(srcFn, destFn, true);
  //  }
  //  //NewEA lst files - primarne lezi v rew\Web4\Schools\EAImgMp3\
  //  if (newEaLstFiles != null) foreach (string src in newEaLstFiles.Select(f => f.ToLower()).Distinct()) {
  //      var fn = Machines.basicPath + @"rew\Web4" + src.Replace('/', '\\').Replace(".mp3", ".");
  //      lstToJson(fn + "lst", fn + "json");
  //    }
  //}
  //static Regex multimediaFilter = new Regex(@"(.mp3|.png|.jpg|.gif|.lst)$");

  //public static void dataFromEA(CourseMeta.modInfo mod, StringWriter errorLog = null) {
  //  string lastExId = null;
  //  try {
  //    foreach (var testEx in mod.exs) {
  //      lastExId = testEx.compId;
  //      //var cfg = new LMComLib.ConfigNewEA() {
  //      //  ExerciseUrl = testEx.compId, //napr. spanish1/l01/a/humex1_l01_a01
  //      //  CourseLang = urlToSrcLang(testEx.compId),
  //      //  Lang = "en-gb",
  //      //  courseId = mod.crsId
  //      //};
  //      //string url = string.Format("http://testGlobalAdmin.langmaster.com/comcz/framework/deployment/EANew-DeployGenerator.aspx?NewEACfg={0}", HttpUtility.UrlEncode(LowUtils.JSONEncode(cfg)));
  //      string url = string.Format("http://localhost/eduauthornew/framework/deployment/EANew-DeployGenerator.aspx?ExerciseUrl={0}&CourseLang={1}&courseId={2}", 
  //        HttpUtility.UrlEncode(testEx.compId), 
  //        urlToSrcLang(testEx.compId), 
  //        mod.crsId);
  //      string res2 = LowUtils.DownloadStr(url);
  //      string fn = Machines.oldEaLinePath + testEx.compId.Replace('/', '\\') + ".txt";
  //      LowUtils.AdjustFileDir(fn);
  //      File.WriteAllText(fn, res2);
  //      //lokalizace pro prevod z EA do newEA
  //      string srcFn = Machines.basicPath + @"rew\EduAuthorNew\" + testEx.compId.Replace('/', '\\') + ".htm.aspx.lmdata";
  //      if (File.Exists(srcFn)) {
  //        string destFn = Machines.oldEaLinePath + testEx.compId.Replace('/', '\\') + ".loc";
  //        var locFn = TradosLib.LocalizeXml(srcFn, Langs.cs_cz);
  //        locFn.Save(destFn);
  //      }
  //    }
  //  } catch (Exception exp) {
  //    if (errorLog != null)
  //      lock (typeof(Exercise)) errorLog.WriteLine("******* ERROR:  " + mod.pathOrderNum + "/" + lastExId + ": " + exp.Message);
  //    else
  //      throw;
  //  }
  //}

  ////Pro nove moduly musi byt kvuli seealso linkum aktualni prod.refreshLessons();
  //public static void buildModuleOldNewMix(CourseMeta.modInfo mod, bool newFormatOnly = false /*kvuli buildu Russian produktu: builduje z rustiny jen novy format, tj. Russian4*/, StringWriter errorLog = null) {
  //  StringBuilder sb = new StringBuilder();
  //  var ctx = new NewEATradosCtx(); string lastExId = null; List<string> newEaLstFiles = null;
  //  try {
  //    sb.Length = 0;
  //    NewEATradosLib.pageGroupStart(ctx);
  //    foreach (var sitemapData in mod.exs) {
  //      lastExId = sitemapData.compId;
  //      StringBuilder err = new StringBuilder();
  //      schools.exStatic meta = new exStatic() { title = sitemapData.Title };
  //      try {
  //        string res2;
  //        if (sitemapData.NewDataFormat) {
  //          meta.url = sitemapData.compId;
  //          meta.format = ExFormat.rew;
  //          res2 = CourseModel.lib.BuildExerciseNew(sitemapData/*, false*/, ref newEaLstFiles, err);
  //          sitemapData.buildError = err.ToString();
  //        } else if (!newFormatOnly) {
  //          meta.url = sitemapData.compId.Split('/').Last();
  //          meta.format = ExFormat.ea;
  //          NewEATradosLib.pageStart(ctx, mod.crsId, meta.url, sitemapData.compId + ".htm");
  //          if (CourseModel.lib.replaceOldEADragDropExs && sitemapData.OldEADragDropExs_IdOrderNum != null) { //nahrada D&D cviceni novou verzi
  //            var on = sitemapData.IdOrderNum;
  //            sitemapData.IdOrderNum = sitemapData.OldEADragDropExs_IdOrderNum;
  //            meta.format = ExFormat.rew;
  //            res2 = CourseModel.lib.BuildExerciseNew(sitemapData/*, false*/, ref newEaLstFiles, err);
  //            sitemapData.IdOrderNum = on;
  //          } else {
  //            string fn = Machines.oldEaLinePath + sitemapData.compId.Replace('/', '\\') + ".txt";
  //            res2 = File.ReadAllText(fn);
  //          }
  //        } else
  //          continue;
  //        sb.Append(JsonConvert.SerializeObject(meta)); sb.Append("$$$"); sb.Append(res2); sb.Append("$$$");
  //      } finally {
  //        if (err.Length > 0 && errorLog != null) lock (typeof(Exercise)) errorLog.Write(">>>> " + sitemapData.compId + ": " + err.ToString());
  //      }
  //    }
  //    if (!newFormatOnly || sb.Length > 0) {
  //      var tradosRes = NewEATradosLib.pageGroupEnd(ctx); //JSON prelozenych retezcu
  //      tradosRes[Langs.no] = sb.ToString(); //fake - pridej zdroj
  //      EADeployLib.writeFiles(Machines.basicPath + @"rew\Web4\Schools\EAData\", mod.jsonId + ".json", tradosRes); //vypis zdroje i JSON prekladu
  //    }
  //  } catch (Exception exp) {
  //    if (errorLog != null)
  //      lock (typeof(Exercise)) errorLog.WriteLine("******* ERROR:  " + mod.pathOrderNum + "/" + lastExId + ": " + exp.Message);
  //    else
  //      throw;
  //  }
  //}

  //public static string debugRun(string spaceId, string globalId) {
  //  return Exercise.run(Exercise.EAModules(ProductsDefine.lib.root.Descendants("lesson").Where(l => l.AttributeValue("spaceId") == spaceId && l.AttributeValue("globalId") == globalId).First()));
  //}

  //public static string run(IEnumerable<CourseMeta.modInfo> mods, bool newFormatOnly = false) {
  //  using (var rdrr = new StringWriter()) {
  //    Parallel.ForEach(mods, new ParallelOptions() { MaxDegreeOfParallelism = 1 }, mod => buildModuleOldNewMix(mod, newFormatOnly, rdrr));
  //    return rdrr.ToString();
  //  }
  //}

  //public static string run() {
  //  return run(oldEAModules());
  //}

  //public static string allDataFromEA() {
  //  using (var rdrr = new StringWriter()) {
  //    LMComLib.NewEATradosLib.doHackEx = () => new ConfigNewEA();
  //    Parallel.ForEach(oldEAModules(), new ParallelOptions() { MaxDegreeOfParallelism = 50 }, mod => dataFromEA(mod, rdrr));
  //    return rdrr.ToString();
  //  }
  //}

  public static string newDataForDict() {
    throw new NotImplementedException();
    //string jscript = ClearScript.lib.getScript(
    //  @"JsLib\Scripts\underscore.js",
    //  @"JsLib\Scripts\jsRender.js",
    //  "@if (typeof $ == 'undefined') { var $ = jsviews; }",
    //  @"courses\GenCourseModel.js",
    //  @"courses\Course.js",
    //  @"courses\SndModel.js",
    //  @"courses\GapFill.js",
    //  @"courses\Pairing.js",
    //  @"courses\SingleChoice.js",
    //  @"courses\Media.js",
    //  @"courses\CheckItem.js",
    //  @"courses\Drag.js",
    //  @"courses\DesignDictSource.js",
    //  "@outputJson = DesignDictSource.compileNewExercise(inputJson);"
    //);
    //var htmlDict = Packager.MainPage.htmlsDict(new string[][] { Packager.Consts.htmlCourse });
    //var data = new Dictionary<string, object> { { "templates", htmlDict }, { "page", null } };

    //data["page"] = JsonConvert.DeserializeObject<Dictionary<string, object>>(File.ReadAllText(@"D:\temp\testGlobalAdmin.json"));
    //var dataStr = JsonConvert.SerializeObject(data, Newtonsoft.Json.Formatting.Indented);
    //return ClearScript.lib.callJavascriptLow(dataStr, jscript);
  }

  //public static IEnumerable<CourseMeta.modInfo> oldEAModules() {
  //  foreach (var crs in CourseMeta.lib.oldCourse.items.Cast<CourseMeta.multiTask>()) {
  //    foreach (var mod in CourseModel.lib.ModulesLow(
  //      crs.items.SelectMany(lv => lv.items).SelectMany(less => less.items.Cast<CourseMeta.mod>()).Where(m => m.items.OfType<CourseMeta.testEx>().Any(testEx => testEx.isOldEA)),
  //      null, m => LowUtils.EnumParse<CourseIds>(crs.spaceId))) yield return mod;
  //  }
  //}
  //ProductsDefine.lib.oldCourses()
  //public static IEnumerable<ProductsDefine.modInfo> EAModules(XElement root) {
  //  return CourseModel.lib.ModulesLow(
  //    root.Descendants("module"),
  //    null,
  //    m => LowUtils.EnumParse<CourseIds>(m.Parents(false).First(e => e.Name.LocalName == "course").AttributeValue("email")));
  //}

  static Langs urlToSrcLang(string url) {
    if (url.StartsWith("english")) return Langs.en_gb;
    if (url.StartsWith("englishe")) return Langs.en_gb;
    if (url.StartsWith("german")) return Langs.de_de;
    if (url.StartsWith("french")) return Langs.fr_fr;
    if (url.StartsWith("italian")) return Langs.it_it;
    if (url.StartsWith("russian")) return Langs.ru_ru;
    if (url.StartsWith("spanish")) return Langs.sp_sp;
    if (url.StartsWith("euroenglish")) return Langs.en_gb;
    throw new Exception(url);
  }
}

public static class Grammar {

  //Lokalizovane stranky gramatiky, seskupene dle CourseId a LMLevel (= napr. 0,1,2,3,4 pro English)
  //public static string run() {
  //  XElement root = XElement.Load(Machines.statisticDir + @"Statistic_Grammar.xml");
  //  StringBuilder sb = new StringBuilder();
  //  var ctx = new NewEATradosCtx();
  //  var logFn = @"q:\temp\EANewDeployGrammar.log";
  //  //******************* stranky gramatiky dle Course a druhe urovne grammar Sitemap (levels-grammar, levels-ku&b)
  //  using (var rdrr = new StreamWriter(logFn))
  //    foreach (var crsRoot in root.Elements("folder")) {
  //      var crsId = LowUtils.EnumParse<CourseIds>(crsRoot.AttributeValue("email"));
  //      if (!CourseMeta.lib.allCourses.Contains(crsId)) continue;
  //      //if (crsId != CourseIds.EnglishE) continue;
  //      foreach (var lvRoots in crsRoot.Elements("folder").Select((el, idx) => new { el, idx }).GroupBy(ei => getGramLev(crsId, ei.idx))) {
  //        var levRoots = lvRoots.Select(i => i.el); //muze byt vice uzlu, napr. gramtika a Kub
  //        sb.Length = 0;
  //        //***************** Grammar pages generation
  //        //vsechny stranky
  //        var leafs = levRoots. //listy tree
  //          Descendants("folder").
  //          Where(e => !e.Elements("folder").Any()). //podminka - pouze leafs
  //          Select(e => new { title = e.AttributeValue("title"), email = e.AttributeValue("spaceId") + "/" + e.AttributeValue("globalId"), node = e }).
  //          ToArray();
  //        NewEATradosLib.pageGroupStart(ctx);
  //        //capture stranky s gramatikou
  //        foreach (var pg in leafs) {
  //          var pgInfo = NewEATradosLib.pageStart(ctx, crsId, pg.email, pg.email);
  //          //predvypln pgInfo propName lokalizaci titulku
  //          var title = pg.node.AttributeValue("title");
  //          if (title.StartsWith("{{"))
  //            pgInfo.loc = NewEATradosLib.AllLocs.ToDictionary(
  //              l => l, l => new Dictionary<string, string> { { title.Substring(2, title.Length - 4), pg.node.Element(l.ToString()) == null ? pg.node.Element(Langs.en_gb.ToString()).Value : pg.node.Element(l.ToString()).Value } }
  //            );
  //          //capture stranky
  //          //var cfg = new LMComLib.ConfigNewEA() {
  //          //  isGrammar = true,
  //          //  ExerciseUrl = pg.email.Replace(".htm", null),
  //          //  CourseLang = CommonLib.CourseIdToLang(crsId),
  //          //  Lang = crsId == CourseIds.EnglishE ? "en-gb" : "en-gb",
  //          //  courseId = crsId
  //          //};
  //          try {
  //            //var page = LowUtils.DownloadStr(string.Format("http://testGlobalAdmin.langmaster.com/comcz/framework/deployment/EANew-DeployGenerator.aspx?NewEACfg={0}", HttpUtility.UrlEncode(LowUtils.JSONEncode(cfg))));
  //            string page = LowUtils.DownloadStr(string.Format("http://localhost/eduauthornew/framework/deployment/EANew-DeployGenerator.aspx?ExerciseUrl={0}&CourseLang={1}&courseId={2}&isGrammar=true",
  //              HttpUtility.UrlEncode(pg.email.Replace(".htm", null)), CommonLib.CourseIdToLang(crsId), crsId));
  //            page = brNormalize.Replace(scriptOut.Replace(page, ""), "<br/>");
  //            schools.exStatic meta = new exStatic() { title = pg.title, url = pg.email };
  //            sb.Append(JsonConvert.SerializeObject(meta)); sb.Append("$$$"); sb.Append(page); sb.Append("$$$");
  //            //sb.Append(pg.email); sb.Append("$$$"); sb.Append(pg.title); sb.Append("$$$"); sb.Append(page); sb.Append("$$$");
  //          } catch (Exception exp) {
  //            rdrr.WriteLine(pg.email + ": " + exp.Message);
  //          }
  //          //break;
  //        }

  //        // **************** Output all 
  //        //pro vsechny stranky (vlozene pomoci NewEATradosLib.pageStart) najdi vsechny jazykove .RESX a zjisti z nich lokalizaci.
  //        var tradosRes = NewEATradosLib.pageGroupEnd(ctx); //JSON prelozenych retezcu
  //        tradosRes[Langs.no] = sb.ToString(); //pridej source

  //        EADeployLib.writeFiles(Machines.basicPath + @"rew\Web4\Schools\EAGrammar\", fileName(crsId, lvRoots.Key) + ".json", tradosRes); //vypis zdroje i JSON prekladu
  //      }
  //      //break;
  //    }
  //  return File.ReadAllText(logFn);
  //}

  //Sitemap gramatiky s lokalizaci
  //Pouzito v Products.export (= generace sitemap pro kurz)
  //public static Dictionary<Langs, string> getGrammar(CourseMeta.productDescrLow prod, out schools.grammarNode gramm) {
  //  int[] gramLevs = prod.grammarLevels().ToArray();
  //  gramm = null;
  //  if (gramLevs.Length == 0)
  //    return CommonLib.bigLocalizations./*prod.locs().*/ToDictionary(l => l, l => "{}");
  //  CourseIds crsId = prod.course;
  //  XElement root = XElement.Load(Machines.statisticDir + @"Statistic_Grammar.xml");
  //  var crsNode = root.Elements("folder").FirstOrDefault(nd => LowUtils.EnumParse<CourseIds>(nd.AttributeValue("email")) == crsId);
  //  if (crsNode == null)
  //    return prod.locs().ToDictionary(l => l, l => "{}");
  //  foreach (var t in crsNode.DescendantNodes().OfType<XText>().Where(t => t.Value == "###TRANS TODO###")) {
  //    t.Value = t.Parent.Parent.Element("en_gb").Nodes().OfType<XText>().First().Value;
  //  }
  //  //******************* grammar sitemap for crsId a lmLevels
  //  int gramLev = -1;
  //  gramm = new schools.grammarNode() {
  //    title = crsNode.AttributeValue("title"),
  //    courseId = crsId,
  //    items = crsNode.Elements("folder").
  //      Where((e, idx) => gramLevs.Contains(gramLev = getGramLev(crsId, idx))).
  //      Select(e => new schools.grammarNode() {
  //        title = e.AttributeValue("title"),
  //        url = fileName(crsId, gramLev), //napr. english_0
  //        LMLevel = gramLev,
  //        items = grItems(e.Elements("folder")).ToArray()
  //      }).ToArray()
  //  };
  //  if (gramm != null && gramm.items.Length == 1) { gramm = (schools.grammarNode)gramm.items[0]; gramm.courseId = crsId; }

  //  //******************* sitemap localization for crsId a lmLevels
  //  var rootToLoc = new XElement("folder", new XAttribute("title", crsNode.AttributeValue("title")), crsNode.Elements().Where(el => el.Name.LocalName != "folder"));
  //  var s1 = new XElement[] { crsNode };
  //  var s2 = crsNode.Elements("folder").Where((e, idx) => gramLevs.Contains(getGramLev(crsId, idx)));
  //  var s3 = s2.SelectMany(n => n.Descendants("folder"));

  //  var siteLocs = CommonLib.bigLocalizations. // prod.locs().
  //    Select(l => new {
  //      lang = l,
  //      locs = JsonConvert.SerializeObject(
  //        s1.Concat(s2).Concat(s3).
  //          Select(n => n.Elements(l.ToString()).SingleOrDefault()).
  //          Where(n => n != null).
  //          Select(n => new { email = n.Parent.AttributeValue("title"), title = n.Value }).
  //          Where(it => it.email.StartsWith("{{")).
  //          ToArray().
  //          ToDictionary(it => it.email.Substring(2, it.email.Length - 4), it => it.title),
  //        Newtonsoft.Json.Formatting.Indented, EADeployLib.jsonSet
  //      )
  //    }).
  //    ToDictionary(l => l.lang, l => l.locs);

  //  return siteLocs;
  //}

  //public class schools.grammarNode : schools.grammarNode {
  //  public schools.grammarNode() { }
  //  public schools.grammarNode(string tit) {
  //    //title = tit.StartsWith("{{") ? EADeployLib.evalLoc(tit) : tit;
  //    title = tit;
  //  }
  //}

  static int getGramLev(CourseIds crsId, int gramNodeIdx /*index uzlu v Q:\LMCom\LMCOM\App_Data\Statistic_Grammar.xml*/) {
    int levs = crsId == CourseIds.English || crsId == CourseIds.EnglishE ? 5 : 3;
    if (gramNodeIdx < levs) return gramNodeIdx; //0, 1, 2 resp. 0, 1, 2, 3, 4 index je gramatika
    return gramNodeIdx - levs;// pro anglictinu a nemcinu: index vetsi nez 3, resp. 5 je Functional language
  }

  //const string dataPath = Machines.basicPath + @"rew\Web4\Schools\EAData\";
  //const string grammarPath = Machines.basicPath + @"rew\Web4\Schools\EAGrammar\";

  //static IEnumerable<schools.grammarNode> grItems(IEnumerable<XElement> root) {
  //  foreach (var el in root) {
  //    var childs = el.Elements("folder").ToArray();
  //    if (childs.Length > 0) {
  //      schools.grammarNode fld = new schools.grammarNode() { title = el.AttributeValue("title") };
  //      fld.items = grItems(childs).ToArray();
  //      yield return fld;
  //    } else {
  //      schools.grammarNode lf = new schools.grammarNode() { title = el.AttributeValue("title"), url = el.AttributeValue("spaceId") + "/" + el.AttributeValue("globalId") };
  //      yield return lf;
  //    }
  //  }
  //}
  //
  static Regex scriptOut = new Regex(@"<script.*?</" + "script>", RegexOptions.Singleline);
  static Regex brNormalize = new Regex(@"<br>", RegexOptions.Singleline);

  static string fileName(CourseIds crs, int lmLevel) { return (crs.ToString() + "_" + lmLevel.ToString()).ToLower(); }

}

//public static class CoursesSitemap {

//  public static void RefreshTrados() {
//    ScanDir sd = new ScanDir();
//    var bp = Machines.basicPath + @"rew\Web4";
//    sd.BasicPath = bp;
//    sd.FileMask = @"(?i:\.(ts|html))$";
//    //sd.FileMask = @"(?i:\.(ts))$";
//    sd.DirsToResult = false;
//    using (var rdrr = File.CreateText(@"c:\temp\trados.txt"))
//      foreach (var fn in sd.FileName(FileNameMode.FullPath).Select(f => f.ToLower())) {
//        if (fn.IndexOf(@"Schools\index_".ToLower()) < 0 && fn.IndexOf(@"\JsLib\JS\Utils.ts".ToLower()) < 0 && File.ReadAllText(fn).IndexOf("CSLocalize") >= 0) {
//          rdrr.WriteLine(string.Format("<string>{0}</string>", fn.Substring(bp.Length)));
//        }
//      }
//  }

//  public static void run() {
//    foreach (var prod in CourseMeta.lib.products) courseSitemapWithLoc(prod, false);
//    var all = CourseMeta.lib.products.Select(p => courseSitemapWithLoc(p, true)).ToArray();
//    save(all, Machines.basicPath + @"rew\Web4\Schools\EACourses\courses"); //seznam vsech produktu
//    save(DictInfo.Instance.Dicts /*XmlUtils.FileToObject<DictInfo>(Machines.basicPath + @"rew\Web4\RwDicts\DictInfos.xml").Dicts*/, Machines.basicPath + @"rew\Web4\Schools\EACourses\dicts"); //info propName slovnicich
//    //info propName vsech kurzech a jejich lokalizacich pro downloady
//    //XElement prodInfo = new XElement("products", ProductsDefine.products.Select(prod => new XElement("product",
//    //  new XElement("email", prod.productId()),
//    //  new XElement("courseId", prod.courseId.ToString()),
//    //  new XElement("size", 0),//prod.takePart)> 2 ? 10 : prod.takePart),
//    //  new XElement("line", CommonLib.CourseIdToLineId(prod.course).ToString().ToLower()),
//    //  new XElement("isTest", prod.testFileName(0)!=null ? "true" : "false"),
//    //  new XElement("langs", prod.locs().Select(l => new XElement("lang", l.ToString().Replace('_', '-'))))
//    //)));
//    //prodInfo.Save(Machines.basicPath + @"rew\Downloads\Common\IIS\productsDescr.xml");
//  }

//  /**************** 
//   * 1. generace JSON se strukturou produktu (=metakurzu). Vstupem je Q:\LMCom\rew\web4\Schools\Courses\courses.xml, vystupem jsou Q:\LMCom\rew\web4\Schools\Courses\*.rjson  
//   * 2. generace Q:LMCom\rew\Web4\Schools\Courses\dicts.rjson z q:\LMCom\rew\Web4\RwDicts\DictInfos.xml 
//   */

//  static JsonSerializerSettings jsonSet = new JsonSerializerSettings { DefaultValueHandling = DefaultValueHandling.Ignore };

//  public static string json(object cell) {
//    return JsonConvert.SerializeObject(cell, Newtonsoft.Json.Formatting.Indented, jsonSet);
//  }
//  public static string rjson(object cell) {
//    var json = JsonConvert.SerializeObject(cell, Newtonsoft.Json.Formatting.Indented, jsonSet);
//    return ClearScript.lib.JSON2RJSON(json);
//  }

//  static void save(object cell, string fn) {
//    LowUtils.AdjustFileDir(fn);
//    var json = JsonConvert.SerializeObject(cell, Newtonsoft.Json.Formatting.Indented, jsonSet);
//    StringUtils.StringToFile(ClearScript.lib.JSON2RJSON(json), fn + ".rjson");
//    StringUtils.StringToFile(json, fn + ".json");
//    XmlUtils.ObjectToFile(fn + ".xml", cell);
//  }

//  //sitemap kurzu s lokalizaci. Pro headerOnly => pouze jeden root node (pro pouziti v seznau produktu v q:\LMCom\rew\Web4\Schools\EACourses\courses.json )
//  //public static root courseSitemapWithLoc(CourseMeta.productDescrLow prod, bool headerOnly) {
//  //  CourseMeta.courseDescr cfg = null;
//  //  Func<CourseMeta.courseDescr, CourseMeta.courseDescr> fake = c => { cfg = c; return c; };
//  //  // ROOT node
//  //  var res2 = new root() {
//  //    url = prod.ProductId,
//  //    line = CommonLib.CourseIdToLineId(prod.course),
//  //    title = prod.title,
//  //    fileName = prod.productId(),
//  //  };
//  //  if (prod.hasPretest()) res2.pretestCrsId = prod.course;
//  //  //Add course tree and grammar (including localization) to sitemap 
//  //  if (!headerOnly) {
//  //    res2.courses = prod.createCourses().ToArray(); //sitemap tree
//  //    //grammar s lokalizaci
//  //    schools.grammarNode gram;
//  //    var trados = Grammar.getGrammar(prod, out gram);
//  //    //Pouziti grammar v course sitemap
//  //    res2.grammar = gram;
//  //    trados.Add(Langs.no, JsonConvert.SerializeObject(res2, Newtonsoft.Json.Formatting.Indented, EADeployLib.jsonSet));
//  //    //write
//  //    EADeployLib.writeFiles(Machines.basicPath + @"rew\Web4\Schools\EACourses\", res2.fileName + ".json", trados, true); //vypis zdroje i JSON prekladu
//  //    XmlUtils.ObjectToFile(Machines.basicPath + @"rew\Web4\Schools\EACourses\" + res2.fileName + ".xml", res2); //pro info jeste do XML
//  //  }

//  //  return res2;
//  //}

//  //static void lessonsModules(IEnumerable<XElement> nodes, List<string> modules, List<string> lessons) {
//  //  if (lessons != null)
//  //    foreach (var jsonId in nodes.Select(l => l.AttributeValue("spaceId") + "/" + l.AttributeValue("globalId"))) lessons.Add(jsonId);
//  //  if (modules != null)
//  //    foreach (var jsonId in nodes.SelectMany(l => l.Elements().Select(m => LowUtils.JSONToId(m.AttributeValue("spaceId"), m.AttributeValue("globalId"))))) modules.Add(jsonId);
//  //}
//  //static lesson[] createLessons(IEnumerable<XElement> nodes) {
//  //  return nodes.Select(l => new lesson() {
//  //    title = l.AttributeValue("title"),
//  //    jsonId = LowUtils.JSONToId(l.AttributeValue("spaceId"), l.AttributeValue("globalId")),
//  //    modules = l.Elements().Select(m => new mod() {
//  //      title = m.AttributeValue("title"),
//  //      jsonId = LowUtils.JSONToId(m.AttributeValue("spaceId"), m.AttributeValue("globalId")),
//  //      exCount = m.Elements().Count()
//  //    }).ToArray()
//  //  }).ToArray();
//  //}

//  //static IEnumerable<course> createCourses(ProductsDefine.productDescrLow prod, List<string> modules = null, List<string> lessons = null) {
//  //  var cnt = 0;
//  //  foreach (var pd in prod.productParts()) {
//  //    yield return new course() {
//  //      lessons = createLessons(pd.getLessons()),
//  //      jsonId = (cnt++).ToString(),
//  //      title = pd.title,
//  //      level = pd.partLevelName(),
//  //      testFileName = pd.testFileName(),
//  //      //LMLevel = pd.partIdx / 2,
//  //    };
//  //  }

//  //}

//  //static string[] ignores = new string[] { "reshome.htm", "hometop.htm", "homehome.htm" };
//}

public static class eTestMe {

  static string englishBasicPath = Machines.basicPath + @"rew\Web4\RwTests\English";
  static string elementsBasicPath = Machines.basicPath + @"rew\Web4\RwTests\ElementTests";

  public static void CreateMaps() {
    CreateEnglishMap(LineIds.English, englishBasicPath);
    CreateElementMap("elements1", "English Test, Beginners, part 1", elementsBasicPath, LineIds.English);
    CreateElementMap("elements2", "English Test, Beginners, part 2", elementsBasicPath, LineIds.English);
    CreateElementMap("elements3", "English Test, False Beginners, part 1", elementsBasicPath, LineIds.English);
    CreateElementMap("elements4", "English Test, False Beginners, part 2", elementsBasicPath, LineIds.English);
    CreateElementMap("elements5", "English Test, Pre-Intermediate, part 1", elementsBasicPath, LineIds.English);
    CreateElementMap("elements6", "English Test, Pre-Intermediate, part 2", elementsBasicPath, LineIds.English);
    CreateElementMap("elements7", "English Test, Intermediate, part 1", elementsBasicPath, LineIds.English);
    CreateElementMap("elements8", "English Test, Intermediate, part 2", elementsBasicPath, LineIds.English);
    CreateElementMap("elements9", "English Test, Upper Intermediate, part 1", elementsBasicPath, LineIds.English);
    CreateElementMap("elements10", "English Test, Upper Intermediate, part 2", elementsBasicPath, LineIds.English);

  }

  static void CreateElementMap(string id, string title, string basicPath, LineIds line) {
    basicPath = basicPath + "\\" + id;
    DBQuestionPool res = new DBQuestionPool() {
      Title = title,
      Id = id,
      BasicPath = basicPath,
      Line = line,
      Modules = Directory.EnumerateDirectories(basicPath).Select(d => new dbSkill(Path.GetFileName(d))).Select(s => new DBQuestionPool.Module() {
        Skill = s.skill,
        AlowedTimeMinutes = 10,
        Groups = Directory.EnumerateDirectories(basicPath + "\\" + s.dir).Select(d => new dbGroup(Path.GetFileName(d))).OrderBy(g => g.order).Select(g => new DBQuestionPool.Group() {
          Order = g.order,
          SelectNum = 1,
          Pointers = Directory.EnumerateFiles(basicPath + "\\" + s.dir + "\\" + g.dir).Select(f => f.Substring(basicPath.Length + 1).Replace('\\', '/')).ToArray()
        }).ToArray()
      }).ToArray()
    };
    XmlUtils.ObjectToFile(basicPath + "\\map.xml", res);
  }

  public class dbSkill {
    public dbSkill(string dir) {
      this.dir = dir;
      skill = LowUtils.EnumParse<Skills>(dir);
    }
    public Skills skill;
    public string dir;
  }
  public class dbGroup {
    public dbGroup(string dir) {
      this.dir = dir;
      order = int.Parse(dir.Split(' ')[0]);
    }
    public int order;
    public string dir;
  }

  static void CreateEnglishMap(LineIds line, string basicPath) {
    ScanDir sd = new ScanDir(); sd.BasicPath = basicPath; sd.FileMask = @"(?i:\.xml)$";
    QuestionPool res = new QuestionPool() { Line = line };
    res.Pointers = sd.FileName(FileNameMode.RelPath).Select(fn => fn.ToLower()).Where(fn => !fn.StartsWith("map")).Select(fn => createPointer(basicPath, fn)).Where(p => p != null).ToArray();
    XmlUtils.ObjectToFile(basicPath + "\\map.xml", res);
  }

  static TestPointer createPointer(string basicPath, string relFn) {
    string[] parts = relFn.Split('.'); if (parts[0].EndsWith("a")) return null;
    parts = relFn.Split(new char[] { '\\' }, 3);
    Skills skill = LowUtils.EnumParse<Skills>(parts[1]);
    TestPointer res = new TestPointer() { Level = LowUtils.EnumParse<Levels>(parts[0]), Skill = skill, SkillPath = parts[2].Replace('\\', '/') };
    if (skill == Skills.Reading || skill == Skills.Listening) {
      relFn = relFn.Replace(".xml", "a.xml");
      parts = relFn.Split(new char[] { '\\' }, 3);
      res.SubPointer = new TestPointer() { Level = res.Level, Skill = res.Skill, SkillPath = parts[2] };
    }
    return res;
  }
}