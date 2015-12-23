using LMComLib;
using LMNetLib;
//using Microsoft.AnalysisServices;
//using Microsoft.AnalysisServices.AdomdClient;
using System.Linq;
using System.Collections.Generic;
using System.Data.Linq;
using System.Text.RegularExpressions;
using System.Xml.Linq;
using System;
using System.IO;
using System.Text;
using System.Threading.Tasks;
using System.Xml.Serialization;
using System.Xml;
using CourseModel;
using CourseMeta;

namespace CubesDeployment {

  //A. zmena NewLMComStat SSAS projektu
  //  1. build NewLMComStat SSAS projekt
  //  2. vytvor d:\LMCom\rew\LMDatabaseExtension\NewLMComStat.xmla (NewData.SSAS.refreshSASSBuildBatchToCubesDeployment()).
  //  3. kompile CubesDeployment.csproj (ktery si da do resources NewLMComStat.xmla)
  //  4. deploy CubesDeployment to SQL Server machine and there run "CubesDeployment.exe buildCompanyCubes"

  //B. zmena LMDatabaseExtension.csproj
  //  1. deploy CubesDeployment to SQL Server machine and there run "CubesDeployment.exe includeClrExtensionToDB"

  //C. zmena struktury produktu (NewLMComModel.ProductDefine)
  //  1. refresh d:\LMCom\rew\LMDatabaseExtension\Toc.tt
  //  2. dale viz "B. zmena LMDatabaseExtension.csproj"


  class Program {

    static void Main(string[] args) {

      //File.WriteAllText(@"d:\temp\build.json", Packager.RewApp.jsDeployData());
      //return;
      //CourseMeta.Lib.init(new LoggerMemory(true), @"d:\lmcom\", false);
      //return;

      Machines._basicPath = @"d:\lmcom\";
      var ignExts = new HashSet<string> { ".webm", ".mp4", ".mp3" };
      if (args != null && args.Length == 1 && (args[0].StartsWith("-8") || args[0].StartsWith("-9"))) {
        var isZip = args[0].StartsWith("-9");
        string bi = args[0].Substring(2);
        LoggerMemory lg10 = new LoggerMemory(true);
        try {
          Machines.appData = @"d:\LMCom\rew\Web4\App_Data\";
          CourseMeta.Lib.init(lg10, @"d:\lmcom\", false);
          if (!lg10.hasError) {
            //var meta = CourseMeta.WebDataBatch.Load(@"d:\LMCom\rew\Downloads\Common\batches\webs\" + bi + ".xml");
            var meta = CourseMeta.WebDataBatch.Load(@"d:\LMCom\rew\Web4\Deploy\batchs\data-" + bi + ".xml");
            //meta.locs = null; //vsechny lokalizace
            var files = meta.getWebBatchFiles(lg10, true);
            if (isZip) {
              //var zfn = @"c:\temp\build.zip";
              var zfn = string.Format(@"d:\LMCom\ReleaseDeploy\packs\{0}.zip", bi); if (File.Exists(zfn)) File.Delete(zfn);
              CourseMeta.buildLib.zipVirtualFiles(zfn, files, lg10, f => !ignExts.Contains(Path.GetExtension(f.srcPath)), File.Exists(zfn));
            } else
              CourseMeta.buildLib.writeVirtualFiles(files);
          }
        } catch (Exception exp) {
          lg10.ErrorLine("Exception", LowUtils.ExceptionToString(exp));
        }
        saveLog(lg10, bi, false);
        return;
      }

      //var pars = new CommonMark.styleParams("gap-fill(id a=b;c=d;e=f) asd|asdf|asd");
      //return;
      //azure.lib.testAll();
      //return;

      //⋘
      //  ⊏bold+underline≻⊏italic≻
      //    ≪gap\-fill O\\}\\{K≫≺italic⊐ ⊂styles⊃≺bold+underline⊐
      //  ⋘
      //  ⋙
      //⋙

      //excelReport.tests.testGlobalAdmin(@"d:\temp\tests.xlsx", 1);
      //excelReport.evaluatorsReport.testGlobalAdmin(@"d:\temp\evaluators.xlsx", 1);
      //return;


      //var metas = Directory.GetFiles(@"d:\LMCom\rew\Web4\lm", "meta.xml", SearchOption.AllDirectories).Concat(Directory.GetFiles(@"d:\LMCom\rew\Web4\skrivanek", "meta.xml", SearchOption.AllDirectories)).ToArray();
      //foreach (var fn in metas) {
      //  XElement root = XElement.Load(fn); if (root.Name.LocalName != "taskTestSkill") continue;
      //  if (root.Attribute("skill").Value != "UseEnglish") continue;
      //  root.SetAttributeValue("skill", "UseLanguage");
      //  root.Save(fn);
      //  //root = null;
      //}
      //return;

      //var metas = Directory.GetFiles(@"d:\LMCom\rew\Web4\lm", "meta.xml", SearchOption.AllDirectories).Concat(Directory.GetFiles(@"d:\LMCom\rew\Web4\skrivanek", "meta.xml", SearchOption.AllDirectories)).ToArray();
      //foreach (var fn in metas) {
      //  XElement root = XElement.Load(fn); if (root.Name.LocalName!="taskTestSkill") continue;
      //  if (root.Elements().Count() != 1) continue;
      //  var dyn = root.Elements().First(); if (dyn.Name.LocalName!="dynamicModuleData") continue;
      //  var grps = dyn.Elements("testTaskGroup").ToArray(); if (grps.Length != dyn.Elements().Count()) continue;
      //  var selfUrl = CourseMeta.testEx.urlFromFileName(fn);
      //  foreach (var grp in grps) {
      //    var grpUrl = grp.Element("ptr").Element("urls").Element("string").Value.ToLower();
      //    if (grpUrl.IndexOf(selfUrl) != 0) throw new Exception();
      //    var grpMetaFn = CourseMeta.testEx.fileNameFromUrl(grpUrl); if (!File.Exists(grpMetaFn)) throw new Exception();
      //    grp.RemoveNodes();
      //    grp.Save(grpMetaFn);
      //  }
      //  root.RemoveNodes();
      //  root.SetAttributeValue("type", root.Attribute("type").Value + " dynamicModuleData");
      //  root.Save(fn);
      //}
      //return;
      //CourseMeta.lib.init(new LoggerFile(@"d:\temp\sitemap.error"), @"d:\lmcom\");
      //return;

      //SchemaDefinition.ModifyXsd.genSchema();
      //return;

      //Machines._basicPath = @"d:\lmcom\";
      //changeXml(null); //@"d:\LMCom\rew\Web4\grafia\opendoor\de\od1_administrativ\lesson1\module4");
      //return;
      //CourseMeta.lib.init(new LoggerDummy(), @"d:\lmcom\", true);
      //return;

      //Action<string, Func<CourseModel.jsClassMeta, bool>> dump = (fn, cond) => {
      //  var csCtrlGrp = CourseModel.lib.courseModelJsonMLMeta.types.Values.Where(t => (t.st & CourseModel.tgSt.obsolete)==0).GroupBy(t => cond(t));
      //  new XElement("root",
      //    new XElement("true", csCtrlGrp.First(g => g.Key).OrderBy(t => t.tagName).Select(t => new XElement(t.tagName, new XAttribute("st", t.st.ToString()), t.xsdChildElements == null ? null : new XAttribute("xsdChildElements", t.xsdChildElements)))),
      //    new XElement("false", csCtrlGrp.First(g => !g.Key).OrderBy(t => t.tagName).Select(t => new XElement(t.tagName, new XAttribute("st", t.st.ToString()), t.xsdChildElements == null ? null : new XAttribute("xsdChildElements", t.xsdChildElements))))
      //  ).Save(@"d:\temp\" + fn + ".xml");
      //};
      //dump("csCtrl", t => (t.st & tgSt.csControl) != 0);
      //dump("xsdIgnore", t => (t.st & (tgSt.xsdIgnore | tgSt.obsolete)) != 0);
      //dump("jsCtrl", t => (t.st & tgSt.jsCtrl) != 0);
      //dump("docIgnore", t => (t.st & tgSt.docIgnore) != 0);
      //dump("xsdHtmlEl", t => (t.st & tgSt.xsdHtmlEl) != 0);
      //dump("xsd", t => (t.st & (tgSt.xsdHtmlEl | tgSt.xsdIgnore | tgSt.xsdString_ | tgSt.xsdNoMixed)) == 0 && t.xsdChildElements == null);

      //new XElement("root",
      //  CourseModel.lib.courseModelJsonMLMeta.types.Values.Where(t => (t.st & CourseModel.tgSt.obsolete) != 0).Select(t => new XElement(t.tagName, new XAttribute("st", t.st.ToString())))).
      //  Save(@"d:\temp\obsolete.xml");
      //return;



      ////var res2 = CourseMeta.sitemap.readFromFilesystem(@"D:\LMCom\rew\Web4\lm\examples\meta.xml");
      //CourseMeta.lib.init(new LoggerDummy(), @"d:\lmcom\");
      //var res2 = CourseMeta.testEx.readPageFromFile(@"D:\LMCom\rew\Web4\lm\examples\New\testGlobalAdmin.xml", null);
      ////CourseMeta.lib.init(new LoggerDummy(), @"d:\lmcom\", true);
      //return;


      //xref.lib.init();
      //return;

      //OldToNew.StatLib.dump(false);
      //OldToNew.StatLib.dump(true);
      //OldToNew.FileGroupGenerator.generator();
      //return;

      //ClearScript.lib.JsReflection(Machines._basicPath + @"rew\Web4\Courses\GenCourseModel.ts", Machines._basicPath + @"rew\SchemaDefinition\map");
      //return;

      //XmlUtils.ObjectToFile(@"d:\LMCom\rew\SchemaDefinition\tagsMeta.xml", CourseModel.doc.export(@"d:\lmcom\rew\schemadefinition\schemadefinition.xml", null));
      ////CourseModel.doc.export(null, @"d:\LMCom\rew\Web4\lm\examples").toFile(@"d:\LMCom\rew\SchemaDefinition\tagsMeta.xml");

      //File.WriteAllText(@"d:\temp\xrefs.json", doc.lib.generateXrefJson("/lm/examples/"));

      //var arr = XmlUtils.FileToObject<CourseModel.docTagsMeta>(@"d:\LMCom\rew\SchemaDefinition\tagsMeta.xml");
      //XmlUtils.ObjectToFile(@"d:\LMCom\rew\SchemaDefinition\tagsMeta.xml", arr);

      //var xrefs = CourseModel.doc.generateXref(@"d:\LMCom\rew\Web4\lm\examples", CourseModel.docTagsMeta.parse(File.ReadAllText(@"d:\LMCom\rew\SchemaDefinition\tagsMeta.xml"))).ToArray();
      //XmlUtils.ObjectToFile(@"d:\temp\xrefs.xml", xrefs);

      //return;

      //var ss = File.ReadAllText(@"d:\LMCom\rew\Web4\Temp\XMLFile2.xml");
      //XmlSerializer serializer = new XmlSerializer(typeof(CourseModel.div));
      //serializer.UnknownNode += (s, a) => {
      //  if (a == null) return;
      //};

      //using (var reader = new XmlTextReader(ss, XmlNodeType.Element, null) {
      //}) {
      //  //using (StringReader rdr = new StringReader(ss))
      //  //using (XmlReader reader = XmlReader.Create(rdr, new XmlReaderSettings() { IgnoreWhitespace = false, ConformanceLevel = ConformanceLevel.Document })) {
      //  var o = serializer.Deserialize(reader);
      //  using (StringWriter writer = new StringWriter()) {
      //    using (XmlWriter wr = XmlWriter.Create(writer, new XmlWriterSettings() { }))
      //      new XmlSerializer(o.GetType()).Serialize(wr, o);
      //    var str1 = writer.ToString();
      //    str1 = null;
      //  }
      //}



      //return;


      //CourseMeta.lib.prepareForRussianTrans();
      //return;
      var path = Path.GetDirectoryName(System.Reflection.Assembly.GetExecutingAssembly().Location) + @"\temp\";
      string serverId;
      LowUtils.AdjustDir(path);
      var errorFn = path + "error.log";
      if (File.Exists(errorFn)) File.Delete(errorFn);
      string webBatchId = "unknown"; string zipFn = "";

      try {
        if (args.Length == 0) {
          //0. compile LMDbExtension
          Console.WriteLine("Enter 1 (refreshSASSDeploymentBatchFile)");
          //1.1. recompile CubesDeployment
          //A. remote server
          //1.2. copy all to LMV1
          //1.3. run batches locally on LMV1
          //B. local server
          Console.WriteLine("Enter 2 (includeClrExtensionToDB)");
          Console.WriteLine("Enter 3 (buildCompanyCubes)");
          Console.WriteLine("Enter 4 (includeClrExtensionToDB & buildCompanyCubes)");
          Console.WriteLine("Enter 5 (extract XML from old EA)");
          Console.WriteLine("Enter 6 (trados OPER 1)");
          Console.WriteLine("Enter 7 (build all products)");
          Console.WriteLine("Enter 8 (build Web x Scorm)");
          Console.WriteLine("Enter 9 (dump LMDatabaseExtension data)");
          var ch = Console.ReadKey().KeyChar; char s = ' ';
          switch (ch) {
            case '1':
            case '2':
            case '3':
            case '4':
            case '9':
              Console.WriteLine("");
              Console.WriteLine("Enter 1 (NewLMCom pz-w8virtual)");
              Console.WriteLine("Enter 2 (NewLMCom lm-virtual-1)");
              Console.WriteLine("Enter 3 (NewLMComServices lm-virtual-1)");
              Console.WriteLine("Enter 4 (NewLMCom dedi8439)");
              Console.WriteLine("Enter 5 (NewLMCom virtualdeploy)");
              s = Console.ReadKey().KeyChar;
              break;
          }
          switch (s) {
            case '1': serverId = "pz-w8virtual"; break;
            case '2': serverId = "lm-virtual-1"; break;
            case '3': serverId = "lm-virtual-1_run"; break;
            case '4': serverId = "dedi8439"; break;
            case '5': serverId = "w2008server"; break;
            case ' ': serverId = null; break;
            default: throw new Exception("Wrong char");
          }
          Console.WriteLine("");
          Console.WriteLine("... processing ...");
          switch (ch) {
            //case '1':
            //  NewData.SSAS.refreshSASSDeploymentBatchFile();
            //  break;
            //case '2':
            //  NewData.SSAS.includeClrExtensionToDB(serverId);
            //  break;
            //case '3':
            //  NewData.SSAS.buildCompanyCubes(serverId);
            //  break;
            //case '4':
            //  NewData.SSAS.includeClrExtensionToDB(serverId);
            //  NewData.SSAS.buildCompanyCubes(serverId);
            //  break;
            case '5':
              LoggerMemory log1 = new LoggerMemory(true);
              //TradosLib.recomputeLookupHash(0); TradosLib.recomputeSentHash(0); return;

              //CourseMeta.lib.init(log1, @"d:\lmcom\");
              //CourseMeta.lib.dataFromEA(CourseMeta.lib.publishers.find("/lm/oldea/english1/"), false);
              //CourseMeta.lib.dataFromEA(CourseMeta.lib.publishers.find("/lm/oldea/english4/l21/a/hueex3_l21_a04"), false, log1);

              //CourseMeta.lib.dataFromEA(CourseMeta.lib.publishers.find("lm/oldea/russian1/lesson1/ChapterA/novyeslova1"));
              //CourseMeta.lib.dataFromEA(CourseMeta.lib.publishers.find("/lm/oldea/english1/l01/a/hueex0_l01_a07"));
              //return;
              //CourseMeta.lib.init(log1, @"d:\lmcom\", false);
              //CourseMeta.lib.init(log1, @"d:\lmcom\", false);

              //CourseMeta.lib.dataFromEA(CourseMeta.lib.publishers.find("/lm/oldea/english1/"), false);
              //CourseMeta.lib.dataFromEA(CourseMeta.lib.publishers.find("/lm/oldea/english/grammar/"), false);


              //CourseMeta.lib.dataFromEA(CourseMeta.lib.publishers.find("data/instr/std"), false);
              //CourseMeta.lib.dataFromEA(CourseMeta.lib.publishers.find("lm/oldea/russian3/lesson3/ChapterA/slova2"));
              //CourseMeta.lib.dataFromEA(CourseMeta.lib.publishers.find("lm/oldea/russian2"));
              //CourseMeta.lib.dataFromEA(CourseMeta.lib.publishers.find("lm/oldea/russian3"));

              //Instructions.run(); 
              //aktualizace cviceni a instrukci z old EA
              //CourseMeta.Lib.init(log1, @"d:\lmcom\", false); Instructions.run();
              //Instructions.run(); CourseMeta.Lib.dataFromEA(CourseMeta.Lib.publishers, CourseMeta.oldeaDataType.lmdata, log1);

              saveLog(log1, "FromOldEA");

              break;
            case '6':
              LoggerMemory log = new LoggerMemory(true);

              //CourseMeta.lib.init(log, @"d:\lmcom\", false);
              //CourseMeta.data.tradosOper1(new CourseMeta.data[] { CourseMeta.lib.publishers.find("/data/instr/new/"), CourseMeta.lib.publishers.find("/data/instr/std/") }, log);
              //Operace 2
              //TradosLib.tradosOper2_forLang(LocPageGroup.newEA, Langs.cs_cz, true);
              //CourseMeta.lib.publishers.find("/skrivanek/").tradosOper1(log);
              //Parallel.ForEach(CommonLib.bigLocalizations.Where(l => l != Langs.en_gb).Select(l => l == Langs.sp_sp ? Langs.es_es : l), lng => {
              //  TradosLib.AdjustTrans(LocPageGroup.newEA, lng, true);
              //});


              //rustina
              //var pages = CourseMeta.data.tradosOper1Pages(CourseMeta.lib.publishers.finds("lm/oldea/russian1","lm/oldea/russian2","lm/oldea/russian3"), log, true).ToArray();
              //TradosLib.oper1NewTradosPages(pages, true);

              //debug
              //CourseMeta.lib.publishers.find("lm/oldea/french2/grammar/sec06/g11").tradosOper1(log);

              try {
                //vse
                CourseMeta.Lib.init(log, @"d:\lmcom\", false);

                //CourseMeta.data.tradosOper1(new CourseMeta.data[] { CourseMeta.Lib.publishers.find("/skrivanek/questionnaire/") }, log);

                //var pages = CourseMeta.data.tradosOper1Pages(CourseMeta.lib.publishers.finds("lm/oldea/russian1","lm/oldea/russian2","lm/oldea/russian3"), log, true).ToArray();
                //TradosLib.oper1NewTradosPages(pages, true);

                //Oper1
                CourseMeta.Lib.publishers.tradosOper1(log);

                //Oper2 na data a instrukce
                Parallel.ForEach(CommonLib.bigLocalizations.Where(l => l != Langs.en_gb).Select(l => l == Langs.sp_sp ? Langs.es_es : l), lng => {
                  TradosLib.tradosOper2_forLang(LocPageGroup.newEA, lng, true);
                });

                //Oper5 na kod, aktualizace d:\LMCom\rew\Web4\Schools\Loc\ z TradosDB
                //foreach (var lng in CommonLib.bigLocalizations.Where(l => l != Langs.en_gb).Select(l => l == Langs.sp_sp ? Langs.es_es : l))
                //  TradosLib.GenerateResx(LocPageGroup.rew_school, lng);
              } catch (Exception exp) {
                log.ErrorLine("Exception", LowUtils.ExceptionToString(exp));
              }

              saveLog(log, "Trados");
              break;
            case '7':
              LoggerMemory logger = new LoggerMemory(true);
              CourseMeta.Lib.init(logger, @"d:\lmcom\", false);
              Machines.appData = @"d:\LMCom\rew\Web4\App_Data\";

              //CourseMeta.buildLib.writeVirtualFiles(CourseMeta.WebBatch.Load(@"D:\LMCom\rew\Downloads\Common\batches\webs\LM_debug.xml").getWebBatchFiles());

              //CourseMeta.buildLib.zipVirtualFiles(@"d:\temp\pom.zip", CourseMeta.WebBatch.Load(@"d:\LMCom\rew\Downloads\Common\batches\webs\LM_debug.xml").getWebBatchFiles());
              //buildLow("web", "LM_Software", true);
              //buildLow("rweb", "LM_Software", false);
              //Packager.RewApp.genWeb("LM_Software");
              //CourseMeta.buildLib.writeVirtualFiles(CourseMeta.WebBatch.Load(@"d:\LMCom\rew\Downloads\Common\batches\webs\LM_debug.xml").getWebBatchFiles());

              //CourseMeta.buildLib.writeVirtualFiles(CourseMeta.buildLib.refreshFiles("/lm/examples/controls_sound/", CommonLib.bigLocalizations, CourseMeta.dictTypes.L, false));
              //CourseMeta.buildLib.writeVirtualFiles(CourseMeta.buildLib.refreshFiles("data/instr/std", CommonLib.bigLocalizations, CourseMeta.dictTypes.no, false));
              //CourseMeta.buildLib.writeVirtualFiles(CourseMeta.buildLib.refreshFiles("lm/examples/Controls", CommonLib.bigLocalizations, CourseMeta.dictTypes.no, false));

              //CourseMeta.lib.forceRewriteSitempas = true; CourseMeta.buildLib.writeVirtualFiles(CourseMeta.WebBatch.Load(@"d:\lmcom\rew\downloads\common\batches\webs\lm_data_new.xml").getWebBatchFiles());
              //CourseMeta.buildLib.writeVirtualFiles(CourseMeta.WebBatch.Load(@"d:\LMCom\rew\Downloads\Common\batches\webs\lm_debug.xml").getWebBatchFiles());


              //var files = CourseMeta.WebBatch.Load(@"d:\LMCom\rew\Downloads\Common\batches\webs\" + webBatchId + ".xml").getWebBatchFiles().ToArray();
              //if (files != null) return;

              /***** LM FE5 web ***
              //CourseMeta.buildLib.writeVirtualFiles(CourseMeta.WebBatch.Load(@"d:\LMCom\rew\Downloads\Common\batches\webs\LM_debug.xml").getWebBatchFiles(logger));

              /***** ALAN ZIP ****/
                //webBatchId = "alan_data";
                //string zipFn = Machines.basicPath + @"ReleaseDeploy\packs\" + webBatchId + ".zip"; var tempZip = @"c:\temp\build.zip";
                //CourseMeta.buildLib.zipVirtualFiles(tempZip, CourseMeta.WebBatch.Load(@"d:\LMCom\rew\Downloads\Common\batches\webs\" + webBatchId + ".xml").getWebBatchFiles(logger), logger);
                //if (File.Exists(zipFn)) File.Delete(zipFn); File.Move(tempZip, zipFn);

                /***** GRAFIA ZIP ****/
                //webBatchId = "grafia_data";
                //string zipFn = Machines.basicPath + @"ReleaseDeploy\packs\" + webBatchId + ".zip"; var tempZip = @"c:\temp\build.zip";
                //if (File.Exists(tempZip)) File.Delete(tempZip); if (File.Exists(zipFn)) File.Delete(zipFn);
                //var ignExts = new HashSet<string> { ".webm", ".mp4" };
                //CourseMeta.buildLib.zipVirtualFiles(
                //  tempZip,
                //  CourseMeta.WebBatch.Load(@"d:\LMCom\rew\Downloads\Common\batches\webs\" + webBatchId + ".xml").getWebBatchFiles(logger),
                //  logger,
                //  f => !ignExts.Contains(Path.GetExtension(f.srcPath)));
                //File.Move(tempZip, zipFn);

                /***** refresh LM web *****/
                CourseMeta.Lib.init(logger, @"d:\lmcom\", true);
              CourseMeta.buildLib.writeVirtualFiles(CourseMeta.WebDataBatch.Load(@"d:\LMCom\rew\Downloads\Common\batches\webs\LM_Data_New.xml").getWebBatchFiles(logger));
              break;
            case '8':
              LoggerMemory lg3 = new LoggerMemory(true);
              try {
                Machines.appData = @"d:\LMCom\rew\Web4\App_Data\";
                CourseMeta.Lib.init(lg3, @"d:\lmcom\", false);
                if (!lg3.hasError) {

                  string tempZip;

                  /***** VS.NET AUTHOR - d:\LMCom\rew\Web4\Author\ExFormData.htm ****/
                  //string html;
                  //html = Author.vsNetServer.getHtmlFromScratch(new Author.vsNetServer.serverContext("/lm/author/demo/", lg3), "[%#baseTagUrl#%]", null, lg3, scriptData => {
                  //  //html = Author.vsNetServer.getHtmlFromScratch(new Author.vsNetServer.serverContext("/lm/author/demo/", lg3), "http://testGlobalAdmin.langmaster.com/alpha/Schools/", null, lg3, scriptData => {
                  //  foreach (var fn in Directory.GetFiles(@"d:\LMCom\rew\Web4\lm\author\shell\").Select(f => f.ToLower()).Where(f => f.EndsWith(".xml") && !f.EndsWith("\\meta.xml"))) {
                  //    scriptData.AppendFormat("<script type=\"text/xml\" data-id=\"{0}\">", CourseMeta.data.urlFromFileName(fn));
                  //    var root = XElement.Load(fn); root.Element("body").SetAttributeValue("id", Path.GetFileNameWithoutExtension(fn));
                  //    scriptData.Append(root.ToString());
                  //    scriptData.Append("</script>");
                  //  }
                  //});
                  //File.WriteAllText(@"d:\LMCom\rew\Web4\Author\ExFormData.htm", "<!-- saved from url=(0014)about:internet -->\r\n" + html, Encoding.UTF8);

                  //html = Author.vsNetServer.getHtmlFromScratch(new Author.vsNetServer.serverContext("/lm/author/empty/", lg3), "[%#baseTagUrl#%]", null, lg3, scriptData => {
                  //  scriptData.Clear(); scriptData.Append("[%#scriptData#%]");
                  //});
                  //File.WriteAllText(@"d:\LMCom\rew\Web4\Author\ModTemplate.htm", "<!-- saved from url=(0014)about:internet -->\r\n" + html, Encoding.UTF8);

                  //html = Author.vsNetServer.getHtmlFromScratch(new Author.fileContext("/lm/author/empty/empty"), "[%#baseTagUrl#%]", "[%#hash#%]", lg3, scriptData => {
                  //  scriptData.Clear(); scriptData.Append("[%#scriptData#%]");
                  //});
                  //File.WriteAllText(@"d:\LMCom\rew\Web4\Author\ExTemplate.htm", "<!-- saved from url=(0014)about:internet -->\r\n" + html, Encoding.UTF8);

                  /***** LM FE5 web (=> .js files, ktere se prenesou na FE5) ****/
                  //CourseMeta.buildLib.writeVirtualFiles(CourseMeta.WebDataBatch.Load(@"d:\LMCom\rew\Downloads\Common\batches\webs\LM_Data_New.xml").getWebBatchFiles(lg3));

                  //*************** Alan
                  //webBatchId = "alan_Software";
                  //Packager.RewApp.BUILD(webBatchId, Targets.web, lg3, new Packager.BatchLow {
                  //  actBatchVersion = Packager.batchVersion.release,
                  //  //version = schools.versions.debug,
                  //  version = schools.versions.minified,
                  //  persistType = schools.persistTypes.persistNewEA,
                  //  testGroup_debug = false,
                  //});
                  //zipFn = Machines.basicPath + @"ReleaseDeploy\packs\" + webBatchId + ".zip"; if (File.Exists(zipFn)) File.Delete(zipFn);
                  //File.Move(Machines.basicPath + @"rew\Downloads\webs\" + webBatchId + ".zip", zipFn);
                  //webBatchId = "alan_data-globals";
                  //zipFn = Machines.basicPath + @"ReleaseDeploy\packs\" + webBatchId + ".zip"; tempZip = @"c:\temp\build.zip";
                  //if (File.Exists(tempZip)) File.Delete(tempZip); if (File.Exists(zipFn)) File.Delete(zipFn);
                  //CourseMeta.buildLib.zipVirtualFiles(
                  //  tempZip,
                  //  CourseMeta.WebDataBatch.Load(@"d:\LMCom\rew\Downloads\Common\batches\webs\" + webBatchId + ".xml").
                  //  getWebBatchFiles(lg3, true), lg3, f => !ignExts.Contains(Path.GetExtension(f.srcPath)));
                  //File.Move(tempZip, zipFn);

                  //*************** Blended
                  webBatchId = "sw-blended";
                  Packager.RewApp.BUILD(webBatchId, Targets.web, lg3, new Packager.BatchLow {
                    actBatchVersion = Packager.batchVersion.release,
                    version = schools.versions.debug,
                    //version = schools.versions.minified,
                    persistType = schools.persistTypes.persistNewEA,
                    testGroup_debug = false,
                  });
                  zipFn = Machines.basicPath + @"ReleaseDeploy\packs\" + webBatchId + ".zip"; if (File.Exists(zipFn)) File.Delete(zipFn);
                  File.Move(Machines.basicPath + @"rew\Downloads\webs\" + webBatchId + ".zip", zipFn);

                  //*************** Skrivanek
                  //webBatchId = "skrivanek_software";
                  //Packager.RewApp.BUILD(webBatchId, Targets.web, lg3, new Packager.BatchLow {
                  //  actBatchVersion = Packager.batchVersion.release,
                  //  version = schools.versions.debug,
                  //  //version = schools.versions.minified,
                  //  persistType = schools.persistTypes.persistNewEA,
                  //  testGroup_debug = false,
                  //});
                  //zipFn = Machines.basicPath + @"ReleaseDeploy\packs\" + webBatchId + ".zip"; if (File.Exists(zipFn)) File.Delete(zipFn);
                  //File.Move(Machines.basicPath + @"rew\Downloads\webs\" + webBatchId + ".zip", zipFn);

                  //*************** FE3
                  //webBatchId = "LM_Software";
                  //Packager.RewApp.BUILD(webBatchId, Targets.web, lg3, new Packager.BatchLow {
                  //  actBatchVersion = Packager.batchVersion.release,
                  //  version = schools.versions.debug,
                  //  //version = schools.versions.minified,
                  //  persistType = schools.persistTypes.persistNewEA,
                  //  testGroup_debug = false,
                  //});
                  //zipFn = Machines.basicPath + @"ReleaseDeploy\packs\" + webBatchId + ".zip"; if (File.Exists(zipFn)) File.Delete(zipFn);
                  //File.Move(Machines.basicPath + @"rew\Downloads\webs\" + webBatchId + ".zip", zipFn);

                  //*************** chinhTestVN
                  //webBatchId = "chinhTestvn_software";
                  //Packager.RewApp.BUILD(webBatchId, Targets.web, lg3, new Packager.BatchLow {
                  //  actBatchVersion = Packager.batchVersion.release,
                  //  version = schools.versions.debug,
                  //  //version = schools.versions.minified,
                  //  persistType = schools.persistTypes.persistNewEA,
                  //  testGroup_debug = false,
                  //});
                  //zipFn = Machines.basicPath + @"ReleaseDeploy\packs\" + webBatchId + ".zip"; if (File.Exists(zipFn)) File.Delete(zipFn);
                  //File.Move(Machines.basicPath + @"rew\Downloads\webs\" + webBatchId + ".zip", zipFn);

                  //*************** Grafia
                  //webBatchId = "grafia_software";
                  //Packager.RewApp.BUILD(webBatchId, Targets.web, lg3, new Packager.BatchLow {
                  //  actBatchVersion = Packager.batchVersion.release,
                  //  //version = schools.versions.debug,
                  //  version = schools.versions.minified,
                  //  persistType = schools.persistTypes.persistNewEA
                  //});
                  //var zipFn = Machines.basicPath + @"ReleaseDeploy\packs\" + webBatchId + ".zip"; if (File.Exists(zipFn)) File.Delete(zipFn);
                  //File.Move(Machines.basicPath + @"rew\Downloads\webs\" + webBatchId + ".zip", zipFn);
                  //webBatchId = "grafia_data";
                  //zipFn = Machines.basicPath + @"ReleaseDeploy\packs\" + webBatchId + ".zip"; var tempZip = @"c:\temp\build.zip";
                  //if (File.Exists(tempZip)) File.Delete(tempZip); if (File.Exists(zipFn)) File.Delete(zipFn);
                  //var ignExts = new HashSet<string> { ".webm", ".mp4", "*.mp3"  };
                  //CourseMeta.buildLib.zipVirtualFiles(
                  //  tempZip,
                  //  CourseMeta.WebDataBatch.Load(@"d:\LMCom\rew\Downloads\Common\batches\webs\" + webBatchId + ".xml").
                  //  getWebBatchFiles(lg3), lg3, f => !ignExts.Contains(Path.GetExtension(f.srcPath)));
                  //File.Move(tempZip, zipFn);

                  //*************** ALAN licence report
                  //var alanDB = new AlanDB.AlanDBDataContext();
                  //var lics = alanDB.UserLicences.Select(u => new {
                  //  u.CourseUser.CompanyUser.User.compId,
                  //  u.Created,
                  //  u.LicenceId,
                  //  u.Counter,
                  //  u.CompanyLicence.Days,
                  //  u.CompanyLicence.ProductId
                  //}).ToArray();
                  //new XElement("root", new XAttribute("connectionString", alanDB.Connection.ConnectionString), lics.OrderBy(l => l.Created).Select(l => new XElement("lic",
                  //  new XAttribute("email", l.LicenceId.ToString() + "." + l.Counter.ToString()),
                  //  new XAttribute("created", l.Created.ToShortDateString() + " " + l.Created.ToShortTimeString()),
                  //  new XAttribute("compId", l.compId),
                  //  new XAttribute("days", l.Days.ToString()),
                  //  new XAttribute("product", l.ProductId)
                  //))).Save(@"d:\temp\alan.xml");

                  //*************** Trask
                  //Packager.RewApp.BUILD("trask", Targets.scorm, lg3, new Packager.BatchLow {
                  //  //scorm_driver = schools.scormDriver.edoceo, actBatchVersion = Packager.batchVersion.release, version = schools.versions.minified, persistType = schools.persistTypes.persistScormEx
                  //  scorm_driver = schools.scormDriver.no,
                  //  actBatchVersion = Packager.batchVersion.fe5,
                  //  version = schools.versions.debug,
                  //  persistType = schools.persistTypes.persistScormEx
                  //});
                  //Packager.RewApp.BUILD("trask", Targets.scorm, lg3, new Packager.BatchLow {
                  //  scorm_driver = schools.scormDriver.edoceo, actBatchVersion = Packager.batchVersion.release, version = schools.versions.minified,
                  //  //scorm_driver = schools.scormDriver.no, actBatchVersion = Packager.batchVersion.fe5, version = schools.versions.debug,
                  //  persistType = schools.persistTypes.persistScormEx
                  //});

                  //*************** Testovaci SCORM
                  //Packager.RewApp.BUILD("testscorm", Targets.scorm, lg3, new Packager.BatchLow {
                  //  //scorm_driver = schools.scormDriver.edoceo, actBatchVersion = Packager.batchVersion.release,
                  //  scorm_driver = schools.scormDriver.no,
                  //  actBatchVersion = Packager.batchVersion.fe5,
                  //  version = schools.versions.debug,
                  //  //version = schools.versions.minified,
                  //  persistType = schools.persistTypes.persistScormEx
                  //});

                  //*************** LM_Software
                  //Packager.RewApp.BUILD("lm_software", Targets.web, lg3, new Packager.BatchLow {
                  //  actBatchVersion = Packager.batchVersion.fe5,
                  //  //version = schools.versions.debug,
                  //  version = schools.versions.minified,
                  //  persistType = schools.persistTypes.persistNewEA
                  //});
                }
              } catch (Exception exp) {
                lg3.ErrorLine("Exception", LowUtils.ExceptionToString(exp));
              }

              saveLog(lg3, webBatchId);
              break;
            case '9':
              Console.WriteLine("Enter companyId and press Enter");
              var compIdStr = Console.ReadLine(); var compId = int.Parse(compIdStr);
              List<string> queries = new List<string>();
              try {
                //Admin.Test.dump(compId, (o, id) => {
                //  try {
                //    XmlUtils.ObjectToFile(path + id + "_" + compIdStr + ".xml", o);
                //  } catch (Exception exp) {
                //    throw new Exception(id, exp);
                //  }
                //}, NewData.SSAS.getConnectionString(serverId), lib);
              } finally {
                File.WriteAllLines(path + "queries.txt", queries);
              }
              break;
          }
          return;
        }
        serverId = args.Length < 2 ? null : args[1].ToLower();
        //switch (args[0]) {
        //  case "buildCompanyCubes":
        //    NewData.SSAS.buildCompanyCubes(serverId);
        //    break;
        //  case "includeClrExtensionToDB":
        //    NewData.SSAS.includeClrExtensionToDB(serverId);
        //    break;
        //}
      } catch (Exception exp) {
        File.WriteAllText(errorFn, LowUtils.ExceptionToString(exp));
      }
    }

    private static void delUser(long lmcomUserId) {
      var db = NewData.Lib.CreateContext();
      db.UserLicences.RemoveRange(db.UserLicences.Where(l => l.CourseUser.CompanyUser.UserId == lmcomUserId));
      db.SaveChanges();
      db.CourseUsers.Remove(db.CourseUsers.First(cu => cu.CompanyUser.UserId == lmcomUserId));
      db.SaveChanges();
      db.CompanyUsers.RemoveRange(db.CompanyUsers.Where(cu => cu.UserId == lmcomUserId));
      db.SaveChanges();
      db.Users.Remove(db.Users.First(cu => cu.Id == lmcomUserId));
      db.SaveChanges();
    }

    //static void buildLow(string oper, string email, bool isRelease) {
    //  //var parts = opId.ToLower().Split(':'); var email = parts[1];
    //  var batchFn = string.Format(Machines.basicPath + @"rew\Downloads\Common\batches\{0}{1}.xml", oper == "scorm" ? null : @"webs\", email);
    //  XElement root = null; string oldVer = null;
    //  try {
    //    if (isRelease && oper != "rscorm" && oper != "rweb") {
    //      root = XElement.Load(batchFn);
    //      if (root.Element("batchVersions") != null) {
    //        if (!root.Element("batchVersions").Elements().Any(e => e.AttributeValue("version") == "release")) throw new Exception(oper + ":" + email);
    //        oldVer = root.Element("actBatchVersion").Value;
    //        if (oldVer == "release")
    //          oldVer = null;
    //        else {
    //          root.Element("actBatchVersion").Value = "release";
    //          root.Save(batchFn);
    //        }
    //      }
    //    }
    //    switch (oper) {
    //      case "scorm":
    //        Packager.RewApp.genScorms(email);
    //        break;
    //      //case "websw":
    //      //  Packager.RewApp.genWeb(email);
    //      //  break;
    //      case "web":
    //        Packager.RewApp.genWeb(email);
    //        break;
    //      case "rscorm":
    //        ReleaseDeploy.lib.Deploy(Targets.scorm, email);
    //        break;
    //      case "rweb":
    //        ReleaseDeploy.lib.Deploy(Targets.web, email);
    //        break;
    //      default:
    //        throw new Exception(oper);
    //    }
    //  } finally {
    //    if (oldVer != null) { root.Element("actBatchVersion").Value = oldVer; root.Save(batchFn); }
    //  }
    //}

    static string replaceTagName(string nm) {
      switch (nm) {
        case "UL": return "list";
        default: return LowUtils.fromCammelCase(nm);
      }
    }

    static void renameAttr(XElement par, string old, string nw) {
      var at = par.Attribute(old); if (at == null) return;
      par.SetAttributeValue(nw, at.Value);
      at.Remove();
    }


    static void changeXml2File(string fn, ref XElement root) {
      try {
        //nastrihany zvuk
        var txt = root.Descendants("media-text").FirstOrDefault(mt => mt.AttributeValue("url", "").StartsWith(".self."));
        if (txt != null) {
          txt.Name = "cut-text"; if (fn.IndexOf(@"\grafia\") > 0) txt.SetAttributeValue("media-url", "@std-4"); txt.SetAttributeValue("url", null);
          foreach (var s in txt.Elements()) s.Name = "sent";
          root = txt; return;
        }
        txt = root.Descendants("media-dialog").FirstOrDefault(mt => mt.AttributeValue("url", "").StartsWith(".self."));
        if (txt != null) {
          txt.Name = "cut-dialog"; if (fn.IndexOf(@"\grafia\") > 0) txt.SetAttributeValue("media-url", "@std-4"); txt.SetAttributeValue("url", null);
          foreach (var s in txt.Elements()) { s.Name = "replica"; if (s.Attribute("name") != null) { s.SetAttributeValue("actor", s.Attribute("name").Value); s.SetAttributeValue("name", null); } } foreach (var s in txt.Descendants("snd-sent")) s.Name = "sent";
          root = txt; return;
        }
        //media-dialog, media-text
        foreach (var m in root.Descendants().Where(m => m.Name.LocalName == "media-dialog" || m.Name.LocalName == "media-text").ToArray()) {
          var attr = m.Attribute("sequence"); if (attr != null) { m.Add(new XAttribute("subset", attr.Value)); attr.Remove(); }
        }
        //url pro grafia je cut-url
        if (fn.IndexOf(@"\grafia\") >= 0)
          foreach (var m in root.Descendants("macro-video")) renameAttr(m, "url", "cut-url");
        if (fn.IndexOf(@"\skrivanek\") >= 0) {
          foreach (var a in root.Descendants("macro-speaking").ToArray()) a.ReplaceWith(new XElement("speaking", "jakekoliv html"));
          foreach (var a in root.Descendants("macro-writing").ToArray()) a.ReplaceWith(new XElement("writing"), "jakekoliv html");
        }
        foreach (var a in root.Descendants().SelectMany(el => el.Attributes("url"))) {
          if (a.Value.EndsWith(".mp3")) renameAttr(a.Parent, "url", "media-url");
        }
        //width par
        root.DescendantsAndSelf().SelectMany(el => el.Attributes("width")).Remove();
        //word-selection.correct-value
        root.Descendants("word-selection").SelectMany(el => el.Attributes("correct-value")).Remove();
        //single-choice smart-tag
        foreach (var el in root.Descendants("single-choice").SelectMany(s => s.Elements("smart-tag")).ToArray())
          el.ReplaceWith(new XElement("radio-button", el.DescendantNodes(), el.AttributeValue("correct") == "true" ? new XAttribute("correct-value", "true") : null));
        //remove single-choice.correct-value
        root.Descendants("single-choice").SelectMany(s => s.Attributes("correct-value")).Remove();
        //rename eval-group-email za eval-btn-email
        foreach (var attr in root.DescendantsAndSelf().SelectMany(s => s.Attributes("eval-group-id")).ToArray()) {
          attr.Parent.Add(new XAttribute("eval-btn-id", attr.Value));
          attr.Remove();
        }
        //script nahrad cdata
        foreach (var el in root.Descendants("script").ToArray()) el.ReplaceWith(new XCData(el.Value));
        //body sitemapIgnore
        root.Elements("body").Attributes("sitemapIgnore").Remove();
        //paring-item.right
        foreach (var el in root.Descendants("pairing-item")) {
          var r = el.Elements().FirstOrDefault(n => n.AttributeValue("parent-prop") == "right"); if (r == null) continue;
          el.SetAttributeValue("right", r.Value);
          r.Remove();
        }
        foreach (var parProp in root.Descendants().Select(e => e.Attribute("parent-prop")).Where(a => a != null).ToArray()) {
          var tag = parProp.Parent; tag.Attributes().Remove();
          var owner = tag.Parent;
          switch (owner.Name.LocalName) {
            case "panel":
              if (tag.Name.LocalName == "node") {
                tag.Name = "header-prop";
                tag.Remove();
                owner.AddFirst(tag);
              } else {
                tag.Remove();
                owner.AddFirst(new XElement("header-prop", tag));
              }
              break;
            default:
              throw new NotImplementedException();
          }
        }

        //rename tags
        foreach (var el in root.DescendantsAndSelf().Where(t => renameTags.ContainsKey(t.Name.LocalName)))
          el.Name = renameTags[el.Name.LocalName];
      } finally {
        CourseModel.tag.adjustXsdReference(root);
      }
    }
    static Dictionary<string, string> renameTags = new Dictionary<string, string>() { 
      { "drag-source", "offering" }, 
      { "possibilities", "offering" },
      { "drag-target", "drop-down" },
      { "eval-group-btn", "eval-btn" },
      { "media-dialog", "media-text" },
    };

    static string[] changeDirs = new string[] {
@"d:\LMCom\rew\Web4\lm\author",
@"d:\LMCom\rew\Web4\lm\etestme",
@"d:\LMCom\rew\Web4\lm\docExamples",
@"d:\LMCom\rew\Web4\lm\examples",
@"d:\LMCom\rew\Web4\lm\russian4",
@"d:\LMCom\rew\Web4\grafia",
@"d:\LMCom\rew\Web4\skrivanek",
    };

    //    static string[] changeDirs = new string[] {
    //@"\\192.168.0.14\q\rew\alpha\rew\Web4\lm\author",
    //@"\\192.168.0.14\q\rew\alpha\rew\Web4\lm\etestme",
    //@"\\192.168.0.14\q\rew\alpha\rew\Web4\lm\docExamples",
    //@"\\192.168.0.14\q\rew\alpha\rew\Web4\lm\examples",
    //@"\\192.168.0.14\q\rew\alpha\rew\Web4\lm\russian4",
    //@"\\192.168.0.14\q\rew\alpha\rew\Web4\grafia",
    //@"\\192.168.0.14\q\rew\alpha\rew\Web4\skrivanek",
    //    };

    //static HashSet<string> icons = new HashSet<string>();
    static bool changeXml3File(string fn, ref XElement root) {
      var save = false;
      foreach (var ic in root.Descendants().Where(d => d.Name.LocalName == "list" || d.Name.LocalName == "macro-icon-list").SelectMany(el => el.Attributes("icon"))) {
        save = true;
        var val = ic.Value;
        switch (val) {
          case "circle-arrow-right": val = "arrow-right"; break;
          case "lower-letter": val = "letter"; break;
          case "x-letter": val = "letter"; break;
        }
        ic.Value = LowUtils.toCammelCase(val);
      }
      return save;
    }

    static void changeXml(string path = null) {
      foreach (var fn in Directory.EnumerateFiles(@"\\192.168.0.14\q\rew\alpha\rew\Web4\skrivanek", "meta.xml", SearchOption.AllDirectories).Select(f => f.ToLower())) {
        var root = XElement.Load(fn); bool save = false;
        var parts = fn.Split('\\');
        switch (parts.Length) {
          case 12:
            var lv = parts[10].ToUpper(); var tit = root.Attribute("title").Value;
            root.SetAttributeValue("title", tit.Substring(0, tit.Length - 2) + lv);
            save = true;
            break;
          case 13:
            var lev = parts[10].ToUpper();
            root.SetAttributeValue("title", lev);
            save = true;
            break;
        }
        //while (true) {
        //  var parent = root.Descendants("items").FirstOrDefault();
        //  if (parent == null) break; else save = true;
        //  var par = parent.Parent; parent.Remove();
        //  par.Add(parent.Elements());
        //}
        if (save) root.Save(fn);
      }
      return;
      List<string> result = new List<string>();
      //icons.Clear();
      if (path != null && path.EndsWith(".xml")) {
        var root = XElement.Load(path);
        changeXml3File(path, ref root);
        root.Save(path);
      } else {
        var dirs = path != null ? XExtension.Create(path) : changeDirs;
        foreach (var fn in dirs.SelectMany(dir => Directory.EnumerateFiles(dir, "*.xml", SearchOption.AllDirectories)).Select(f => f.ToLower()).Where(f => !f.EndsWith(@"\meta.xml"))) {
          try {
            var outFn = fn;
            var root = XElement.Load(fn);
            if (changeXml3File(fn, ref root)) root.Save(outFn);
          } catch (Exception exp) {
            result.Add(fn + ": ERROR " + LowUtils.ExceptionToString(exp));
            continue;
          }
        };
      }
      //File.WriteAllLines(@"d:\temp\icons.txt", icons);
      File.WriteAllLines(@"d:\temp\result.txt", result);
    }

    static void saveLog(LoggerMemory lg3, string name, bool waitMsg = true) {
      var fn = string.Format(@"d:\LMCom\rew\Web4\Data\buildLogs\{0}.log", name);
      if (File.Exists(fn)) File.Delete(fn);
      if (lg3.hasError) {
        File.WriteAllText(fn, lg3.Log());
        Console.WriteLine("*** Error in " + fn);
      } else {
        Console.WriteLine("Build OK");
      }
      if (waitMsg) {
        Console.WriteLine("Press any key to continue");
        Console.ReadKey();
      }
    }

  }

}
