using LMComLib;
using LMNetLib;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;
using System.Xml.Linq;

namespace web4.Schools.Design {
  public partial class Default : System.Web.UI.Page {

    string grErr = null; string exErr = null;

    protected void MergeLogBtn_Click(object sender, EventArgs e) {
      var fn = MergeLogId.Text;
      if (string.IsNullOrEmpty(fn)) return;
      if (!File.Exists(fn)) throw new Exception(string.Format("{0} not exists", fn));
      var name = Path.GetFileNameWithoutExtension(Path.GetFileNameWithoutExtension(fn));
      var dir = Path.GetDirectoryName(fn);
      var serv = string.Format(@"{0}\{1}.log", dir, name);
      var client = string.Format(@"{0}\{1}.js.log", dir, name);
      var result = string.Format(@"{0}\{1}.merged.log", dir, name);
      mergeLogs(serv, client, result);
    }

    private void mergeLogs(string serv, string client, string result) {
      //server parsing
      var servTxt = File.ReadAllText(serv);
      var servMts = servLogMask.Matches(servTxt).OfType<Match>().ToArray();
      Dictionary<string, string[]> servData = new Dictionary<string, string[]>();
      for (int i = 0; i < servMts.Length; i++) { 
        var startPos = servMts[i].Groups["cont"].Index;
        var endPos = i == servMts.Length - 1 ? servTxt.Length - 1 : servMts[i + 1].Index;
        var id = servMts[i].Groups["id"].Value;
        servData.Add(id, servTxt.Substring(startPos, endPos - startPos).Split(new string[] {"\r\n"}, StringSplitOptions.RemoveEmptyEntries).Where(l => l!="#>").ToArray());
      }
      //client parsing
      var clLines = File.ReadAllLines(client);
      var merged = new List<string>();
      foreach (var clLine in clLines) {
        merged.Add(clLine);
        var m = clLineMask.Match(clLine);
        if (m.Success) {
          string[] sls;
          var id = m.Groups["id"].Value;
          if (!servData.TryGetValue(id, out sls)) continue;
          foreach (var sl in sls) merged.Add("     >" + sl);
        }
      }
      File.WriteAllLines(result, merged);
    }
    static Regex servLogMask = new Regex(@"<#(?<id>\d{13,}) (?<cont>.*?)#>", RegexOptions.Singleline);
    static Regex clLineMask = new Regex(@"^<#(?<id>\d{13,}) ");

    protected void Page_Load(object sender, EventArgs e) { 
      //MergeLogId.Text = @"d:\LMCom\rew\Web4\App_Data\logs\1429869580947.log";
      //MergeLogBtn_Click(null, null);
      //CourseMeta.lib.init(new LoggerDummy());

      //var prods = ProductsDefine.lib.prods.clone(); ProductsDefine.product.expand(prods, ProductsDefine.lib.publishers); XmlUtils.ObjectToFile(@"d:\temp\productsExpanded.xml", prods);

      //var prods = ProductsDefine.lib.prods.items.OfType<ProductsDefine.product>().Select(p => new ProductsDefine.buildProduct(p, new Langs[] { Langs.en_gb, Langs.cs_cz }, dictTypes.L)).ToArray();


      //var loc = new ProductsDefine.moduleCache(ProductsDefine.lib.publishers.find("data/lm/oldea/data/english1/l01/a"),CommonLib.bigLocalizations);
      //var loc = ProductsDefine.moduleCaches.adjustCache(ProductsDefine.lib.publishers,CommonLib.bigLocalizations).ToArray();

      //DictLib.standardLingea.createDict(ProductsDefine.lib.publishers.find("lm/oldea/data/english1/l01/a"), Langs.cs_cz, loc);

      //File.WriteAllLines(@"d:\temp\words.txt",ProductsDefine.lib.publishers.find("lm/oldea/data/english1/l01/a").dictWords());

      //foreach (var mod in ProductsDefine.lib.publishers.scan().OfType<ProductsDefine.mod>().Where(m => !m.isOldEA)) {
      //  CourseModel.MacroLib.toNewModuleFormat(mod);
      //}

      //Dictionary<string, HashSet<string>> attrs = new Dictionary<string, HashSet<string>>();
      //foreach (var testEx in ProductsDefine.lib.publishers.find("lm/oldea/data").scan().OfType<ProductsDefine.testEx>()) {
      //  XElement root = XElement.Load(Machines.publPath + testEx.url.Replace('/','\\') + ".htm.xml");
      //  foreach (var t in root.DescendantsAndSelf()) {
      //    HashSet<string> attr;
      //    if (!attrs.TryGetValue(t.Name.LocalName, out attr)) attrs.Add(t.Name.LocalName, attr = new HashSet<string>());
      //    foreach (var a in t.Attributes()) attr.Add(a.Name.LocalName);
      //  }
      //}
      //File.WriteAllLines(@"d:\temp\tags.txt", attrs.OrderBy(kv => kv.Key).Select(kv => kv.Key + ": " + kv.Value.DefaultIfEmpty().Aggregate((r,i) => r + "," + i)));

      //ProductsDefine.lib.publishers.cacheModuleBuilds();

      List<string> log = new List<string>();
      //ProductsDefine.lib.publishers.tradosOper1(log);
      //ProductsDefine.lib.publishers.find("lm/oldea/data/english1/l01/a").toLocalize(log);

      //if (!IsPostBack) {
      //  WebDeploy.DataSource = Directory.EnumerateFiles(@"d:\LMCom\rew\Downloads\Common\batches\webs", "*.xml", SearchOption.TopDirectoryOnly).Select(f => Path.GetFileNameWithoutExtension(f)); WebDeploy.DataBind();
      //  ScormDeploy.DataSource = Directory.EnumerateFiles(@"d:\LMCom\rew\Downloads\Common\batches", "*.xml", SearchOption.TopDirectoryOnly).Select(f => Path.GetFileNameWithoutExtension(f)); ScormDeploy.DataBind();
      //}

      //LMComLib.NewEATradosLib.doHackEx = () => new ConfigNewEA() { courseId = CourseIds.no };
      //TradosLib.LocalizeXml(@"q:\LMNet2\WebApps\EduAuthorNew\english1\l02\c\hueex0_l02_c06.htm.aspx.lmdata", Langs.cs_cz).Save(@"d:\temp\testEx.xml");
      //var batch = Request["BatchIncludes"];
      //if (!string.IsNullOrEmpty(batch))
      //  Packager.RewApp.BatchIncludes(string.Format(Machines.basicPath + @"rew\Downloads\Common\batches\{0}.xml", batch));
      var batch = Request["adjustJSCrambler"];
      if (!string.IsNullOrEmpty(batch))
        Packager.RewApp.jsCramblerAdjust(string.Format(Machines.basicPath + @"rew\Downloads\Common\batches\{0}.xml", batch));
      var minify = Request["minify"];
      if (!string.IsNullOrEmpty(minify)) {
        var targ = LowUtils.EnumParse<Targets>(minify);
        doMinify(targ);
      }
      //var compileTS = Request["compileTypeScript"];
      //if (compileTS == "true") compileTypeScript(null, null);
      //var homePg = Request["homePages"];
      //if (homePg == "true") homePages(null, null);
      if (Request["tidyXmlToPage"] == "true") {
        string tidy;
        using (var str = Request.InputStream) using (var rdr = new StreamReader(str)) tidy = rdr.ReadToEnd();
        var pageXml = CourseModel.Lib.TidyXmlToPage(XElement.Parse(tidy));
        Response.Clear();
        Response.ContentType = "text/plain";
        Response.Write(pageXml.ToString());
        Response.Flush();
        Response.End();
      }
      //var build = Request["BuildProduct"];
      //if (build != null) {
      //  build = build.ToLower();
      //  switch (build) {
      //    //case "russian4": this.BuildRussian4(null, null); break;
      //    default:
      //      var res2 = Exercise.BuildProductNew(build, false);
      //      if (res2 != null) error(res2);
      //      break;
      //    //this.BuildGrafia(null, null); break;
      //  }
      //}
    }

    void check() {
      if (!string.IsNullOrEmpty(grErr) || !string.IsNullOrEmpty(exErr)) {
        Response.Write("Grammar<br/>" + (grErr == null ? "OK" : grErr.Replace("\r\n", "<br/>")) + "<br/>Exercise<br/>" + (exErr == null ? "OK" : exErr.Replace("\r\n", "<br/>")));
        Response.End();
      }
    }

    protected void DecodeSign(object sender, EventArgs e) {
      File.WriteAllBytes(@"d:\temp\signature.zip", LowUtils.Decrypt(File.ReadAllBytes(@"d:\temp\signature.sign")));
    }

    //protected void GrammarClick(object sender, EventArgs e) {
    //  grErr = Grammar.run();
    //  check();
    //}

    protected void ExercisesClick(object sender, EventArgs e) {
      //exErr = Exercise.debugRun("spanish1","l01/home.htm");
      //exErr = Exercise.run();
      //check();
    }

    protected void DataFromEAClick(object sender, EventArgs e) {
      //exErr = Exercise.allDataFromEA();
      //check();
    }

    //protected void newDataForDict(object sender, EventArgs e) {
    //  exErr = Exercise.newDataForDict();
    //  check();
    //}

    //protected void InstructionsClick(object sender, EventArgs e) {
    //  Instructions.run();
    //}

    protected void CoursesClick(object sender, EventArgs e) {
      //CoursesSitemap.run();
    }

    protected void primaryImport(object sender, EventArgs e) {
      RwBooksDesign.primaryImport();
    }

    protected void mergeLocalizations(object sender, EventArgs e) {
      RwBooksDesign.mergeLocalizations();
    }

    protected void CSharpToTypeScript(object sender, EventArgs e) {
      Handlers.CSharpToTypescript.genAll();
      //LMComLib.CSharpToTypeScript.GenerateFromInfos(
      //  new LMComLib.Common(), new Login.Register(), new Admin.Register(),
      //  new Rew.LMComLibRegister(), new Rew.Register(), new Rew.RwRegister(),
      //  new schools.CourseRegister(), new schools.Register(), new schools.LMComLibRegister(),
      //  new scorm.Register(), new testMe.Register(),
      //  new CourseModel.Register(),
      //  new CourseMeta.Register()
      //);
    }
    protected void AllGenClick(object sender, EventArgs e) {
      //CoursesSitemap.run();
      //Instructions.run();
      //var exErr1 = Exercise.allDataFromEA();
      //var exErr2 = Exercise.run();
      //var exErr3 = Grammar.run();
      //File.WriteAllText(@"d:\temp\BuildAll.log", "**** Exercise.allDataFromEA\r\n" + exErr1 + "\r\n\r\n**** Exercise.run\r\n" + exErr2 + "\r\n\r\n***** Grammar.run\r\n" + exErr3);
    }

    protected void doMinify(Targets target) {
      try { Packager.RewApp.minify(false, target); } catch (Exception exp) { error(exp); }
    }
    protected void Minify(object sender, EventArgs e) {
      Packager.RewApp.minify(false, Targets.web, Targets.scorm);
    }
    protected void DebugMinify(object sender, EventArgs e) {
      Packager.RewApp.minify(true, Targets.web, Targets.scorm);
    }

    //protected void compileTypeScript(object sender, EventArgs e) {
    //  try { Packager.RewApp.compileTypeScript(); } catch (Exception exp) { error(exp); }
    //}

    protected void BuildNew(object sender, EventArgs e) {
      //var res2 = Exercise.BuildProductNew(((LinkButton)sender).ID.Substring("Build".Length), false);
      //if (res2 != null) error(res2);
    }

    void error(Exception exp) {
      error(LowUtils.ExceptionToString(exp, true, true));
    }

    void error(string err) {
      //throw exp;
      Response.Clear();
      Response.Write(err);
      Response.StatusCode = 201;
      Response.Flush();
      Response.End();
    }
    //protected void homePages(object sender, EventArgs e) {
    //  try { Packager.RewApp.webHomePages(); } catch (Exception exp) { error(exp); }
    //}


    protected void ExportJson(object sender, EventArgs e) {
      RwBooksDesign.ExportJson();
    }


    protected void ListSoundFiles(object sender, EventArgs e) {
      RwSound.ListSoundFiles();
    }

    protected void CreateDirectory(object sender, EventArgs e) {
      RwSound.CreateDirectory();
    }

    protected void MergeSounds(object sender, EventArgs e) {
      RwSound.MergeSounds();
    }

    //protected void CaptureLingea(object sender, EventArgs e) {
    //  //CourseDictionary.CaptureLingea(Langs.cs_cz);
    //  CourseDictionary.CaptureLingeaAll();
    //}

    //protected void LingeaToModules(object sender, EventArgs e) {
    //  CourseDictionary.LingeaToModulesAll();
    //}

    //protected void LingeaToGrafiaModules(object sender, EventArgs e) {
    //  CourseDictionary.LingeaOldToGrafiaModules();
    //}
    //protected void AnalyzeAndNormalizeLingea(object sender, EventArgs e) {
    //  CourseDictionary.AnalyzeAndNormalizeLingea();
    //}

    //protected void BatchIncludes(object sender, EventArgs e) {
    //  Packager.RewApp.BatchIncludes(@"d:\LMCom\rew\Downloads\Common\batches\grafia.xml");
    //  //Packager.RewApp.BatchIncludes(@"q:\LMCom\rew\Downloads\Common\batches\vsz.xml");
    //}

    //protected void CreateMaps(object sender, EventArgs e) {
    //  eTestMe.CreateMaps();
    //}

    protected void RefreshTrados(object sender, EventArgs e) {
      //CoursesSitemap.RefreshTrados();
    }

    protected void dumpData(object sender, EventArgs e) {
      //using (var fs = File.OpenWrite(@"d:\temp\dump.xslt"))
      //  NewData.Dump.dumpExcel(NewData.Dump.dumpRows(NewData.Dump.Web()), fs);
      using (var fs = File.OpenWrite(@"d:\temp\dump.xslt"))
        NewData.Dump.dumpExcel(NewData.Dump.dumpRows(NewData.Dump.LANGMasterScorm()), fs);
    }

    static Dictionary<string, string> templates = new Dictionary<string, string>() { 
      {"allBuild","websw:Software;web:services;websw:scormexnet35services;scorm:Czu;scorm:English_A1_Lesson3_cs_cz;scorm:MoodlePChelp;scorm:SComp;websw:Edusoft_Software;web:EduSoft_Data;"},
      {"allDeploy","rweb:Software;rweb:Services;rweb:ScormExNet35Services;rscorm:Czu;rscorm:English_A1_Lesson3_cs_cz;rscorm:MoodlePChelp;rscorm:SComp;rweb:Edusoft_Software;rweb:Edusoft_Data"},
      {"software", "websw:Software;websw:services;websw:scormexnet35services"}
    };

    //protected void Build(object sender, CommandEventArgs e) {
    //  string cmd = (string)e.CommandArgument;
    //  bool isRelease = e.CommandName == "release";
    //  var opIds = cmd.Split(new char[]{';'}, StringSplitOptions.RemoveEmptyEntries).ToList();
    //  for (int i = opIds.Count - 1; i >= 0; i--) 
    //    if (opIds[i].StartsWith("@")) { var nm = opIds[i]; opIds.RemoveAt(i); opIds.InsertRange(i, templates[nm.Substring(1)].Split(new char[] { ';' }, StringSplitOptions.RemoveEmptyEntries)); }
    //  foreach (string opId in opIds) buildLow(opId.Split(':')[0], opId.Split(':')[1], isRelease);
    //}
    //void buildLow(string oper, string email, bool isRelease) {
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

    //protected void DeployBtn_Click(object sender, EventArgs e) {
    //  foreach (var email in WebDeploy.Items.Cast<ListItem>().Where(l => l.Selected).Select(l => l.Value)) {
    //    buildLow("web", email, true);
    //    buildLow("rweb", email, false);
    //  }
    //  foreach (var email in ScormDeploy.Items.Cast<ListItem>().Where(l => l.Selected).Select(l => l.Value)) {
    //    buildLow("scorm", email, true);
    //    buildLow("rscorm", email, false);
    //  }
    //  Packager.RewApp.runBatch(@"d:\LMCom\ReleaseDeploy\copyFE3.cmd");
    //}

    //protected void ScormDeployBtn_Click(object sender, EventArgs e) {
    //  foreach (var email in ScormDeploy.Items.Cast<ListItem>().Where(l => l.Selected).Select(l => l.Value)) {
    //    buildLow("scorm", email, true);
    //    buildLow("rscorm", email, false);
    //  }
    //}

    //protected void BuildScorm(object sender, CommandEventArgs e) {
    //  var ids = ((string)e.CommandArgument).Split(';');
    //  foreach (string email in ids) Packager.RewApp.genScorms(email);
    //}

    //protected void ReleaseDeployClick(object sender, CommandEventArgs e) {
    //  var ids = ((string)e.CommandArgument).Split(';');
    //  foreach (string email in ids)
    //    ReleaseDeploy.lib.Deploy(LowUtils.EnumParse<Targets>(e.CommandName), email);
    //}

    //protected void BuildWeb(object sender, CommandEventArgs e) {
    //  var ids = ((string)e.CommandArgument).Split(';');
    //  foreach (string email in ids) {
    //    switch (email.ToLower()) {
    //case "software":
    //  Packager.RewApp.genWebSoftware(email);
    //  Packager.RewApp.genWebs("services");
    //  Packager.RewApp.genWebSoftware("scormexnet35services");
    //  break;
    //case "edusoft_software":
    //  Packager.RewApp.genWebSoftware(email);
    //  break;
    //default:
    //  Packager.RewApp.genWebs(email);
    //  break;
    //    }
    //  }
    //}
  }
}