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
      value = Noesis.Lib.JSON2RJSON(Value);
      File.WriteAllText(destFn, value);
    }
    using (Stream msOut = File.OpenWrite(destFn + ".gzip")) {
      using (GZipStream gzip = new GZipStream(msOut, CompressionMode.Compress))
      using (StreamWriter wrg = new StreamWriter(gzip))
        wrg.Write(value);
    }
  }


  public static void writeFiles(string dir, string fn, Dictionary<Langs, string> files, bool incRJson = false) {
    foreach (var kv in files) {
      writeFile(dir, fn, kv.Key, kv.Value, kv.Key == Langs.no ? incRJson : false);
      //string destFn = dir + (kv.Key == Langs.no ? null : kv.Key.ToString().Replace('_', '-') + "\\") + fn;
      //LowUtils.AdjustFileDir(destFn);
      //File.WriteAllText(destFn, kv.Value);
      //string value = kv.Value;
      //if (incRJson && kv.Key == Langs.no) {
      //  destFn = destFn.Replace(".json", ".rjson");
      //  value = Noesis.Lib.JSON2RJSON(kv.Value);
      //  File.WriteAllText(destFn, value);
      //}
      //using (Stream msOut = File.OpenWrite(destFn + ".gzip")) {
      //  using (GZipStream gzip = new GZipStream(msOut, CompressionMode.Compress))
      //  using (StreamWriter wrg = new StreamWriter(gzip))
      //    wrg.Write(value);
      //}
    }
  }

}

public static class Instructions {

  public static void run() {
    var ctx = new NewEATradosCtx();
    MemoryStream str = new MemoryStream();
    NewEATradosLib.pageGroupStart(ctx);
    NewEATradosLib.pageStart(ctx, CourseIds.no, "instructions", "framework/instructions/instructions.lmdata");
    NewEATradosLib.doHack = () => true;
    NewEATradosLib.doHackEx = () => new ConfigNewEA() { courseId = CourseIds.English };
    TradosLib.LocalizeXmlLow(@"q:\LMNet2\WebApps\EduAuthorNew\framework\instructions\Instructions.lmdata", Langs.en_gb, str, true);
    string instr = Encoding.UTF8.GetString(str.ToArray());
    var body = XElement.Parse(instr);
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
    EADeployLib.writeFiles(Machines.basicPath + @"rew\Web4\Schools\EAData\", "instructions.json", tradosRes); //vypis zdroje i JSON prekladu
  }
  static XNamespace lm = "lm";
}

public static class Exercise {

  public static string BuildProductNew(string prodId) {
    try {
      ProductsDefine.productDescrNew prod = (ProductsDefine.productDescrNew)ProductsDefine.Lib.findProduct(prodId);
      prod.refreshLessons();
      //JSON data cviceni
      var res = run(prod.Modules(), true);
      if (res.IndexOf("******* ERROR: ") >= 0) return res.Replace("\r", "\r\n<br/>");
      //JSON nastrihani zvuku
      ScanDir sd = new ScanDir();
      var bp = Machines.basicPath + @"rew\Web4\RwCourses\" + prod.dataPath;
      sd.BasicPath = Machines.basicPath + @"rew\Web4\RwCourses\" + prod.dataPath;
      sd.FileMask = @"(?i:\.(lst))$";
      foreach (var fn in sd.FileName(FileNameMode.FullPath)) {
        CourseModel.SndFile sf = XmlUtils.FileToObject<CourseModel.SndFile>(fn);
        string sfStr = CourseModel.Lib.ObjectToJson(sf);
        File.WriteAllText(Path.ChangeExtension(fn, ".json"), sfStr);
      }
      //sitemap
      CoursesSitemap.courseSitemapWithLoc(prod, false);
      return null;
    } catch (Exception exp) {
      return LowUtils.ExceptionToString(exp, true, true);
    }
  }


  public static string BuildRussian4() {
    try {
      try {
        ProductsDefine.Lib.init(true); //refresh sitemap
      } catch (Exception exp) {
        return exp.Message;
      }
      var res = run(EAModules(ProductsDefine.Lib.root).Where(m => m.crsId == CourseIds.Russian), true);
      if (res.IndexOf("******* ERROR: ") >= 0) return res.Replace("\r", "\r\n<br/>");
      //sitemap
      foreach (var prod in ProductsDefine.Lib.products.Where(p => p.course == CourseIds.Russian)) CoursesSitemap.courseSitemapWithLoc(prod, false);
      return null;
    } catch (Exception exp) {
      return LowUtils.ExceptionToString(exp, true, true);
    }
  }

  public static string run(IEnumerable<ProductsDefine.modInfo> mods, bool newFormatOnly = false) {
    //var logFn = @"q:\temp\EANewDeploy.log";
    using (var wr = new StringWriter()) {
      Parallel.ForEach(mods, new ParallelOptions() { MaxDegreeOfParallelism = 6 }, mod => {
        StringBuilder sb = new StringBuilder();
        //using (StringWriter wr = new StringWriter(err)) {
        var ctx = new NewEATradosCtx(); string lastExId = null;
        try {
          sb.Length = 0;
          NewEATradosLib.pageGroupStart(ctx);
          foreach (var ex in mod.exs) {
            lastExId = ex.Id;
            StringBuilder err = new StringBuilder();
            schools.exStatic meta = new exStatic() { title = ex.Title };
            try {
              string res;
              if (ex.NewDataFormat) {
                meta.url = ex.Id;
                meta.format = ExFormat.rew;
                res = CourseModel.Lib.Json(err, Machines.basicPath + @"rew\Web4\RwCourses\" + meta.url.Replace('/', '\\') + ".xml");
              } else if (!newFormatOnly) {
                meta.url = ex.Id.Split('/').Last();
                meta.format = ExFormat.ea;
                NewEATradosLib.pageStart(ctx, mod.crsId, meta.url, ex.Id + ".htm");
                var cfg = new LMComLib.ConfigNewEA() {
                  ExerciseUrl = ex.Id,
                  CourseLang = urlToSrcLang(ex.Id),
                  Lang = mod.crsId == CourseIds.EnglishE ? "en-gb" : "en-gb",
                  courseId = mod.crsId
                };
                res = LowUtils.DownloadStr(string.Format("http://www.langmaster.com/comcz/framework/deployment/EANew-DeployGenerator.aspx?NewEACfg={0}", HttpUtility.UrlEncode(LowUtils.JSONEncode(cfg))));
              } else
                continue;
              sb.Append(JsonConvert.SerializeObject(meta)); sb.Append("$$$"); sb.Append(res); sb.Append("$$$");
            } finally {
              if (err.Length > 0) lock (typeof(Exercise)) {
                  wr.WriteLine(">>>> " + ex.Id); wr.WriteLine(err.ToString());
                }
            }
          }
          if (!newFormatOnly || sb.Length > 0) {
            var tradosRes = NewEATradosLib.pageGroupEnd(ctx); //JSON prelozenych retezcu
            tradosRes[Langs.no] = sb.ToString(); //fake - pridej zdroj
            EADeployLib.writeFiles(Machines.basicPath + @"rew\Web4\Schools\EAData\", mod.jsonId + ".json", tradosRes); //vypis zdroje i JSON prekladu
          }
        } catch (Exception exp) {
          lock (typeof(Exercise)) { wr.WriteLine("******* ERROR:  " + mod.path + "/" + lastExId + ": " + exp.Message); }
        }
      });
      return wr.ToString();
    }
  }
  public static string run() {
    return run(EAModules(ProductsDefine.Lib.root));
  }

  public static IEnumerable<ProductsDefine.modInfo> EAModules(XElement root) {
    return ProductsDefine.Lib.ModulesLow(
      root.Descendants("module"),
      m => LowUtils.EnumParse<CourseIds>(m.Parents(false).First(e => e.Name.LocalName == "course").AttributeValue("id")));
    //Select(m => new {
    //  crsId = LowUtils.EnumParse<CourseIds>(m.Parents(false).First(e => e.Name.LocalName == "course").AttributeValue("id")), 
    //  spaceId = m.AttributeValue("spaceId"), globalId = m.AttributeValue("globalId"), 
    //  childs = m.Elements().Select(e => new { title = e.AttributeValue("title"), url = e.AttributeValue("url") })
    //}).
    //Select(m => new modInfo() {
    //  jsonId = LowUtils.JSONToId(m.spaceId, m.globalId),
    //  path = m.spaceId + "/" + m.globalId,
    //  crsId = m.crsId,//LowUtils.EnumParse<CourseIds>(m.crs.AttributeValue("id")),
    //  exs = m.childs.
    //    Select(s => new IdTitle() {
    //      NewDataFormat = s.url.StartsWith("*"),
    //      Id = s.url.StartsWith("*") ? (m.spaceId + "/" + m.globalId + "/" + s.url.Substring(1)).ToLowerInvariant() : m.spaceId + "/" + m.globalId.Replace("home.htm", null) + s.url,
    //      Title = s.title
    //    }).
    //    ToArray()
    //});
  }
  //static IEnumerable<ProductsDefine.modInfo> ModulesLow(IEnumerable<XElement> modEls, Func<XElement, CourseIds> getCourseId) {
  //  return modEls.
  //    Select(m => new {
  //      crsId = getCourseId(m),//LowUtils.EnumParse<CourseIds>(m.Parents(false).First(e => e.Name.LocalName == "course").AttributeValue("id")),
  //      spaceId = m.AttributeValue("spaceId"), globalId = m.AttributeValue("globalId"),
  //      childs = m.Elements().Select(e => new { title = e.AttributeValue("title"), url = e.AttributeValue("url") })
  //    }).
  //    Select(m => new ProductsDefine.modInfo() {
  //      jsonId = LowUtils.JSONToId(m.spaceId, m.globalId),
  //      path = m.spaceId + "/" + m.globalId,
  //      crsId = m.crsId,//LowUtils.EnumParse<CourseIds>(m.crs.AttributeValue("id")),
  //      exs = m.childs.
  //        Select(s => new ProductsDefine.IdTitle() {
  //          NewDataFormat = s.url.StartsWith("*"),
  //          Id = s.url.StartsWith("*") ? (m.spaceId + "/" + m.globalId + "/" + s.url.Substring(1)).ToLowerInvariant() : m.spaceId + "/" + m.globalId.Replace("home.htm", null) + s.url,
  //          Title = s.title
  //        }).
  //        ToArray()
  //    });
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
  public static string run() {
    XElement root = XElement.Load(Machines.lmcomData + @"Statistic_Grammar.xml");
    StringBuilder sb = new StringBuilder();
    var ctx = new NewEATradosCtx();
    var logFn = @"q:\temp\EANewDeployGrammar.log";
    //******************* stranky gramatiky dle Course a druhe urovne grammar Sitemap (levels-grammar, levels-ku&b)
    using (var wr = new StreamWriter(logFn))
      foreach (var crsRoot in root.Elements("folder")) {
        var crsId = LowUtils.EnumParse<CourseIds>(crsRoot.AttributeValue("id"));
        if (!ProductsDefine.Lib.allCourses.Contains(crsId)) continue;
        //if (crsId != CourseIds.EnglishE) continue;
        foreach (var lvRoots in crsRoot.Elements("folder").Select((el, idx) => new { el, idx }).GroupBy(ei => getGramLev(crsId, ei.idx))) {
          var levRoots = lvRoots.Select(i => i.el); //muze byt vice uzlu, napr. gramtika a Kub
          sb.Length = 0;
          //***************** Grammar pages generation
          //vsechny stranky
          var leafs = levRoots. //listy tree
            Descendants("folder").
            Where(e => !e.Elements("folder").Any()). //podminka - pouze leafs
            Select(e => new { title = e.AttributeValue("title"), id = e.AttributeValue("spaceId") + "/" + e.AttributeValue("globalId"), node = e }).
            ToArray();
          NewEATradosLib.pageGroupStart(ctx);
          //capture stranky s gramatikou
          foreach (var pg in leafs) {
            var pgInfo = NewEATradosLib.pageStart(ctx, crsId, pg.id, pg.id);
            //predvypln pgInfo o lokalizaci titulku
            var title = pg.node.AttributeValue("title");
            if (title.StartsWith("{{"))
              pgInfo.loc = NewEATradosLib.AllLocs.ToDictionary(
                l => l, l => new Dictionary<string, string> { { title.Substring(2, title.Length - 4), pg.node.Element(l.ToString()).Value } }
              );
            //capture stranky
            var cfg = new LMComLib.ConfigNewEA() {
              isGrammar = true,
              ExerciseUrl = pg.id.Replace(".htm", null),
              CourseLang = CommonLib.CourseIdToLang(crsId),
              Lang = crsId == CourseIds.EnglishE ? "en-gb" : "en-gb",
              courseId = crsId
            };
            try {
              var page = LowUtils.DownloadStr(string.Format("http://www.langmaster.com/comcz/framework/deployment/EANew-DeployGenerator.aspx?NewEACfg={0}", HttpUtility.UrlEncode(LowUtils.JSONEncode(cfg))));
              page = brNormalize.Replace(scriptOut.Replace(page, ""), "<br/>");
              schools.exStatic meta = new exStatic() { title = pg.title, url = pg.id };
              sb.Append(JsonConvert.SerializeObject(meta)); sb.Append("$$$"); sb.Append(page); sb.Append("$$$");
              //sb.Append(pg.id); sb.Append("$$$"); sb.Append(pg.title); sb.Append("$$$"); sb.Append(page); sb.Append("$$$");
            } catch (Exception exp) {
              wr.WriteLine(pg.id + ": " + exp.Message);
            }
            //break;
          }

          // **************** Output all 
          //pro vsechny stranky (vlozene pomoci NewEATradosLib.pageStart) najdi vsechny jazykove .RESX a zjisti z nich lokalizaci.
          var tradosRes = NewEATradosLib.pageGroupEnd(ctx); //JSON prelozenych retezcu
          tradosRes[Langs.no] = sb.ToString(); //pridej source

          EADeployLib.writeFiles(Machines.basicPath + @"rew\Web4\Schools\EAGrammar\", fileName(crsId, lvRoots.Key) + ".json", tradosRes); //vypis zdroje i JSON prekladu
        }
        //break;
      }
    return File.ReadAllText(logFn);
  }

  //Sitemap gramatiky s lokalizaci
  //Pouzito v Products.export (= generace sitemap pro kurz)
  public static Dictionary<Langs, string> getGrammar(ProductsDefine.productDescrLow prod, out schools.grammarNode gramm) {
    int[] gramLevs = prod.grammarLevels().ToArray();
    gramm = null;
    if (gramLevs.Length == 0)
      return prod.locs().ToDictionary(l => l, l => "{}");
    CourseIds crsId = prod.course;
    XElement root = XElement.Load(Machines.lmcomData + @"Statistic_Grammar.xml");
    var crsNode = root.Elements("folder").FirstOrDefault(nd => LowUtils.EnumParse<CourseIds>(nd.AttributeValue("id")) == crsId);
    if (crsNode == null)
      return prod.locs().ToDictionary(l => l, l => "{}");
    //******************* grammar sitemap for crsId a lmLevels
    int gramLev = -1;
    gramm = new schools.grammarNode() {
      title = crsNode.AttributeValue("title"),
      courseId = crsId,
      items = crsNode.Elements("folder").
        Where((e, idx) => gramLevs.Contains(gramLev = getGramLev(crsId, idx))).
        Select(e => new schools.grammarNode() {
          title = e.AttributeValue("title"),
          jsonId = fileName(crsId, gramLev), //napr. english_0
          LMLevel = gramLev,
          items = grItems(e.Elements("folder")).ToArray()
        }).ToArray()
    };
    if (gramm != null && gramm.items.Length == 1) { gramm = (schools.grammarNode)gramm.items[0]; gramm.courseId = crsId; }

    //******************* sitemap localization for crsId a lmLevels
    var rootToLoc = new XElement("folder", new XAttribute("title", crsNode.AttributeValue("title")), crsNode.Elements().Where(el => el.Name.LocalName != "folder"));
    var s1 = new XElement[] { crsNode };
    var s2 = crsNode.Elements("folder").Where((e, idx) => gramLevs.Contains(getGramLev(crsId, idx)));
    var s3 = s2.SelectMany(n => n.Descendants("folder"));

    var siteLocs = prod.locs().
      Select(l => new {
        lang = l,
        locs = JsonConvert.SerializeObject(
          s1.Concat(s2).Concat(s3).
            Select(n => n.Elements(l.ToString()).SingleOrDefault()).
            Where(n => n != null).
            Select(n => new { id = n.Parent.AttributeValue("title"), title = n.Value }).
            Where(it => it.id.StartsWith("{{")).
            ToArray().
            ToDictionary(it => it.id.Substring(2, it.id.Length - 4), it => it.title),
          Newtonsoft.Json.Formatting.Indented, EADeployLib.jsonSet
        )
      }).
      ToDictionary(l => l.lang, l => l.locs);

    return siteLocs;
  }

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

  static IEnumerable<schools.grammarNode> grItems(IEnumerable<XElement> root) {
    foreach (var el in root) {
      var childs = el.Elements("folder").ToArray();
      if (childs.Length > 0) {
        schools.grammarNode fld = new schools.grammarNode() { title = el.AttributeValue("title") };
        fld.items = grItems(childs).ToArray();
        yield return fld;
      } else {
        schools.grammarNode lf = new schools.grammarNode() { title = el.AttributeValue("title"), jsonId = el.AttributeValue("spaceId") + "/" + el.AttributeValue("globalId") };
        yield return lf;
      }
    }
  }
  //
  static Regex scriptOut = new Regex(@"<script.*?</" + "script>", RegexOptions.Singleline);
  static Regex brNormalize = new Regex(@"<br>", RegexOptions.Singleline);

  static string fileName(CourseIds crs, int lmLevel) { return (crs.ToString() + "_" + lmLevel.ToString()).ToLower(); }

}

public static class CoursesSitemap {

  public static void RefreshTrados() {
    ScanDir sd = new ScanDir();
    var bp = Machines.basicPath + @"rew\Web4";
    sd.BasicPath = bp;
    sd.FileMask = @"(?i:\.(ts|html))$";
    sd.FileMask = @"(?i:\.(ts))$";
    sd.DirsToResult = false;
    using (var str = File.OpenWrite(@"c:\temp\trados.txt"))
    using (var wr = new StreamWriter(str))
      foreach (var fn in sd.FileName(FileNameMode.FullPath)) {
        if (File.ReadAllText(fn).IndexOf("CSLocalize") >= 0) {
          wr.WriteLine(string.Format("<string>{0}</string>", fn.Substring(bp.Length)));
        }
      }
  }

  public static void run() {
    foreach (var prod in ProductsDefine.Lib.products) courseSitemapWithLoc(prod, false);
    var all = ProductsDefine.Lib.products.Select(p => courseSitemapWithLoc(p, true)).ToArray();
    save(all, Machines.basicPath + @"rew\Web4\Schools\EACourses\courses"); //seznam vsech produktu
    save(XmlUtils.FileToObject<DictInfo>(Machines.basicPath + @"rew\Web4\RwDicts\DictInfos.xml").Dicts, Machines.basicPath + @"rew\Web4\Schools\EACourses\dicts"); //info o slovnicich
    //info o vsech kurzech a jejich lokalizacich pro downloady
    //XElement prodInfo = new XElement("products", ProductsDefine.products.Select(prod => new XElement("product",
    //  new XElement("id", prod.productId()),
    //  new XElement("courseId", prod.courseId.ToString()),
    //  new XElement("size", 0),//prod.takePart)> 2 ? 10 : prod.takePart),
    //  new XElement("line", CommonLib.CourseIdToLineId(prod.course).ToString().ToLower()),
    //  new XElement("isTest", prod.testFileName(0)!=null ? "true" : "false"),
    //  new XElement("langs", prod.locs().Select(l => new XElement("lang", l.ToString().Replace('_', '-'))))
    //)));
    //prodInfo.Save(Machines.basicPath + @"rew\Downloads\Common\IIS\productsDescr.xml");
  }

  /**************** 
   * 1. generace JSON se strukturou produktu (=metakurzu). Vstupem je Q:\LMCom\rew\web4\Schools\Courses\courses.xml, vystupem jsou Q:\LMCom\rew\web4\Schools\Courses\*.rjson  
   * 2. generace Q:LMCom\rew\Web4\Schools\Courses\dicts.rjson z q:\LMCom\rew\Web4\RwDicts\DictInfos.xml 
   */

  static JsonSerializerSettings jsonSet = new JsonSerializerSettings { DefaultValueHandling = DefaultValueHandling.Ignore };

  static void save(object obj, string fn) {
    LowUtils.AdjustFileDir(fn);
    var json = JsonConvert.SerializeObject(obj, Newtonsoft.Json.Formatting.Indented, jsonSet);
    StringUtils.StringToFile(Noesis.Lib.JSON2RJSON(json), fn + ".rjson");
    StringUtils.StringToFile(json, fn + ".json");
  }

  //sitemap kurzu s lokalizaci. Pro headerOnly => pouze jeden root node (pro pouziti v seznau produktu v q:\LMCom\rew\Web4\Schools\EACourses\courses.json )
  public static root courseSitemapWithLoc(ProductsDefine.productDescrLow prod, bool headerOnly) {
    ProductsDefine.courseDescr cfg = null;
    Func<ProductsDefine.courseDescr, ProductsDefine.courseDescr> fake = c => { cfg = c; return c; };
    // ROOT node
    var res = new root() {
      courseId = prod.courseId,
      line = CommonLib.CourseIdToLineId(prod.course),
      title = prod.title,
      fileName = prod.productId(),
    };
    if (prod.hasPretest()) res.pretestCrsId = prod.course;
    //Add course tree and grammar (including localization) to sitemap 
    if (!headerOnly) {
      res.courses = createCourses(prod).ToArray(); //sitemap tree
      //grammar s lokalizaci
      schools.grammarNode gram;
      var trados = Grammar.getGrammar(prod, out gram);
      //Pouziti grammar v course sitemap
      res.grammar = gram;
      trados.Add(Langs.no, JsonConvert.SerializeObject(res, Newtonsoft.Json.Formatting.Indented, EADeployLib.jsonSet));
      //write
      EADeployLib.writeFiles(Machines.basicPath + @"rew\Web4\Schools\EACourses\", res.fileName + ".json", trados, true); //vypis zdroje i JSON prekladu
      XmlUtils.ObjectToFile(Machines.basicPath + @"rew\Web4\Schools\EACourses\" + res.fileName + ".xml", res); //pro info jeste do XML
    }

    return res;
  }

  static void lessonsModules(IEnumerable<XElement> nodes, List<string> modules, List<string> lessons) {
    if (lessons != null)
      foreach (var jsonId in nodes.Select(l => l.AttributeValue("spaceId") + "/" + l.AttributeValue("globalId"))) lessons.Add(jsonId);
    if (modules != null)
      foreach (var jsonId in nodes.SelectMany(l => l.Elements().Select(m => LowUtils.JSONToId(m.AttributeValue("spaceId"), m.AttributeValue("globalId"))))) modules.Add(jsonId);
  }
  static lesson[] createLessons(IEnumerable<XElement> nodes) {
    return nodes.Select(l => new lesson() {
      title = l.AttributeValue("title"),
      jsonId = LowUtils.JSONToId(l.AttributeValue("spaceId"), l.AttributeValue("globalId")),
      modules = l.Elements().Select(m => new mod() {
        title = m.AttributeValue("title"),
        jsonId = LowUtils.JSONToId(m.AttributeValue("spaceId"), m.AttributeValue("globalId")),
        exCount = m.Elements().Count() //.AttributeValue("childs").Split(',').Count()
      }).ToArray()
    }).ToArray();
  }

  static IEnumerable<course> createCourses(ProductsDefine.productDescrLow prod, List<string> modules = null, List<string> lessons = null) {
    var cnt = 0;
    foreach (var pd in prod.productParts()) {
      yield return new course() {
        lessons = createLessons(pd.getLessons()),
        jsonId = (cnt++).ToString(),
        title = pd.title,
        level = pd.partLevelName(),
        testFileName = pd.testFileName(),
        //LMLevel = pd.partIdx / 2,
      };
    }

  }

  //static string[] ignores = new string[] { "reshome.htm", "hometop.htm", "homehome.htm" };
}

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