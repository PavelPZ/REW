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

namespace ProductsDefine {

  public class IdTitle {
    public bool NewDataFormat;
    public string Id;
    public string Title;
  }

  public class modInfo {
    public string jsonId;
    public string path;
    public CourseIds crsId;
    public IdTitle[] exs;
  }

  public static class Lib {

    //public static CourseIds[] allCourse = new CourseIds[] { CourseIds.English, CourseIds.EnglishE, CourseIds.German, CourseIds.Spanish, CourseIds.French, CourseIds.Italian, CourseIds.Russian };
    //public static string[] allCourses = allCourseIds.Select(c => c.ToString()).Concat(new string[] {
    //  "Grafia"
    //}).Select(c => c.ToLower()).ToArray();
    public static CourseIds[] allCourses = new CourseIds[] { CourseIds.English, CourseIds.EnglishE, CourseIds.German, CourseIds.Spanish, CourseIds.French, CourseIds.Italian, CourseIds.Russian };

    public static void init(bool reinit = false) {
      if (!reinit && _root != null && _products!=null) return;
      _root = XElement.Load(Machines.lmcomData + @"Statistic_CourseStructureEx.xml");
      var allCoursesStr = allCourses.ToDictionary(c => c.ToString().ToLower(), c => true);
      foreach (var el in _root.Elements().Where(e => !allCoursesStr.ContainsKey(e.AttributeValue("id").ToLower()))) el.Remove(); //filter na allCourses

      var rub2 = createSitemap("russian4");
      rub2.Add(new XAttribute("order", "3"));
      _root.Descendants("course").First(c => c.AttributeValue("spaceId") == "russian").Add(rub2);

      _root.Save(Machines.basicPath + @"rew\Downloads\temp\sitemap.xml");

      _products = allCourses.SelectMany(id => Def.generateProducts(id)).
        Concat(Def.generateVSZProducts()).
        Concat(Def.generateGrafiaProducts()).
        Concat(Def.generateExamplesProducts()).
        Concat(Def.generatePretestProducts()).
        ToArray();
      var dupls = _products.GroupBy(p => p.productId().ToLower()).Where(g => g.Count() > 1).ToArray();
      if (dupls.Length > 0) throw new Exception(@"Duplicate productId() in Q:\LMCom\rew\web4\Schools\Design\ProductsDefine.cs, static ProductsDefine()");
    }

    public static IEnumerable<modInfo> ModulesLow(IEnumerable<XElement> modEls, Func<XElement, CourseIds> getCourseId) {
      return modEls.
        Select(m => new {
          crsId = getCourseId(m),//LowUtils.EnumParse<CourseIds>(m.Parents(false).First(e => e.Name.LocalName == "course").AttributeValue("id")),
          spaceId = m.AttributeValue("spaceId"), globalId = m.AttributeValue("globalId"),
          childs = m.Elements().Select(e => new { title = e.AttributeValue("title"), url = e.AttributeValue("url") })
        }).
        Select(m => new modInfo() {
          jsonId = LowUtils.JSONToId(m.spaceId, m.globalId),
          path = m.spaceId + "/" + m.globalId,
          crsId = m.crsId,//LowUtils.EnumParse<CourseIds>(m.crs.AttributeValue("id")),
          exs = m.childs.
            Select(s => new IdTitle() {
              NewDataFormat = s.url.StartsWith("*"),
              Id = s.url.StartsWith("*") ? (m.spaceId + "/" + m.globalId + "/" + s.url.Substring(1)).ToLowerInvariant() : m.spaceId + "/" + m.globalId.Replace("home.htm", null) + s.url,
              Title = s.title
            }).
            ToArray()
        });
    }

    //Definice produktu v kodu
    public static productDescrLow[] products { get { init(); return _products; } } static productDescrLow[] _products;
    public static XElement root { get { init(); return _root; } } static XElement _root;

    public static productDescrLow findProduct(string productId) {
      productId = productId.ToLower();
      return products.First(p => p.productId() == productId);
    }

    public static XElement createSitemap(string supBath) {
      supBath = supBath.ToLowerInvariant();
      string pth = Machines.basicPath + @"rew\Web4\RwCourses\" + supBath.Replace('/','\\');
      XElement root = safeLoad(pth + @"\meta.xml");
      root.Add(new XAttribute("spaceId", supBath), new XAttribute("globalId", ""));
      foreach (var dirPth in Directory.EnumerateDirectories(pth).Select(d => d.ToLowerInvariant())) {
        string dir = Path.GetFileName(dirPth);
        var les = safeLoad(dirPth + @"\meta.xml");
        les.Add(new XAttribute("spaceId", supBath), new XAttribute("globalId", dir));
        root.Add(les);
        foreach (var modPth in Directory.EnumerateDirectories(dirPth).Select(d => d.ToLowerInvariant())) {
          string modDir = Path.GetFileName(modPth);
          var mod = safeLoad(modPth + @"\meta.xml");
          mod.Add(new XAttribute("spaceId", supBath), new XAttribute("globalId", dir + "/" + modDir));
          les.Add(mod);
          foreach (var pageFn in Directory.EnumerateFiles(modPth).Select(d => d.ToLowerInvariant()).Where(fn => fn.IndexOf("meta.xml") < 0)) {
            var pg = safeLoad(pageFn);
            mod.Add(new XElement("page", new XAttribute("title", pg.Element("info").Attribute("title").Value), new XAttribute("url", Path.GetFileNameWithoutExtension(pageFn))));
          }
        }
      }
      foreach (var attr in root.Descendants().SelectMany(e => e.Attributes("url"))) attr.Value = "*" + attr.Value;
      return root;
    }

    static XElement safeLoad(string fn) {
      try { return XElement.Load(fn); } catch (Exception exp) { throw new Exception("\r\n\r\n**********\r\n\r\n********** Error in " + fn + ": " + exp.Message + "\r\n\r\n********** "); }
    }

    //vrati jsonId vsechn modulu produktu, napr. {english1_xl01_sa_shome_dhtm, ...}
    public static IEnumerable<string> allModules(productDescrLow prod) {
      return prod.productParts().SelectMany(pd => pd.getLessons().SelectMany(l => l.Elements().Select(m => LowUtils.JSONToId(m.AttributeValue("spaceId"), m.AttributeValue("globalId")))));
    }

  }

  //pomocne dato, identifikujici jednu cast produktu
  public abstract class productPartLow {
    public productDescrLow prod;
    public abstract IEnumerable<XElement> getLessons();
    public string title; //titulek, odpovidajici root, obohaceny o napr. "part 1"
    public virtual string partLevelName() { return null; }
    public virtual string testFileName() { return null; }
  }

  public abstract class productDescrLow {
    public int courseId; //jednoznacna identifikace produktu
    public string title; //titulek
    public CourseIds course; //identifikace kurzu (kvuli vlajeckam apod.)
    public bool isTest; //priznak produktu s testem
    public virtual bool hasPretest() { return false; }
    public XElement[] allLevels() {
      return _allLevels == null ? _allLevels = Lib.root.
        Descendants().
        First(el => el.AttributeValue("spaceId") == course.ToString().ToLower() && el.AttributeValue("globalId") == "home.htm").
        Elements().
        ToArray() : _allLevels;
    } XElement[] _allLevels;

    public virtual IEnumerable<int> grammarLevels() { return Enumerable.Empty<int>(); }
    public abstract string productId();
    public abstract IEnumerable<productPartLow> productParts();
    public abstract IEnumerable<Langs> locs();
  }

  public class productPartNew : productPartLow {
    public override string partLevelName() { return _partLevelName; }
    public override IEnumerable<XElement> getLessons() { return _lessons; }
    public string _partLevelName;
    public XElement[] _lessons;
    //dynamicke kvuli refresh pri buildu
    public Func<XElement[]> refreshLessons { set { _refreshLessons = value; _lessons = value(); } } public Func<XElement[]> _refreshLessons;
  }

  public class productDescrNew : productDescrLow {
    public override string productId() { return _productId; }
    public override IEnumerable<productPartLow> productParts() { return _productParts; }
    public override IEnumerable<Langs> locs() { return _locs; }
    public productPartNew[] _productParts;
    public string _productId;
    public string dataPath;
    public Langs[] _locs;
    public IEnumerable<ProductsDefine.modInfo> Modules() {
      return Lib.ModulesLow(_productParts.SelectMany(p => p._lessons).SelectMany(l => l.Descendants("module")), m => course);
    }
    public void refreshLessons() {
      foreach (var p in _productParts) p._lessons = p._refreshLessons();
    }

  }

  public class productPartEx : productPartLow {
    //public override IEnumerable<XElement> getLessons() {
    //  //return modifySiteMap != null ? modifySiteMap(getLessonsLow()) : getLessonsLow();
    //  return getLessonsLow();
    //}
    public override IEnumerable<XElement> getLessons() {
      foreach (var lev in levs) {
        var levEl = prod.allLevels()[lev.levIdx];
        var q = levEl.Elements().Skip(lev.skip);
        if (lev.take > 0) q = q.Take(lev.take);
        foreach (var les in q) yield return les;
      }
    }
    public productLessInterval[] levs;
    //public Func<IEnumerable<XElement>, IEnumerable<XElement>> modifySiteMap;
  }

  public class productLessInterval {
    public int levIdx;
    public int skip;
    public int take;
  }

  public class productDescrEx : productDescrLow {
    public override IEnumerable<int> grammarLevels() { return _grammarLevels == null ? base.grammarLevels() : _grammarLevels; }
    public override string productId() { return _productId; }
    public override IEnumerable<productPartLow> productParts() { return _productParts; }
    public override IEnumerable<Langs> locs() { return _locs; }
    public int[] _grammarLevels;
    public string _productId;
    public productPartLow[] _productParts;
    public productPartLow[] setProductParts { set { _productParts = value; foreach (var p in value) p.prod = this; } }
    public Langs[] _locs;
  }

  //popis produktu = metakurzu
  public class productDescr : productDescrLow {
    public int skipPart; //zacatek kurzu
    public int takePart; //pocet casti kurzu
    //public courseDescr[] items; //popis kurzu

    public override IEnumerable<int> grammarLevels() { //urovne kurzu
      switch (course) {
        case CourseIds.Russian: return Enumerable.Range(skipPart, takePart);
      }
      int start = skipPart / 2;
      int end = (skipPart + takePart - 1) / 2;
      return Enumerable.Range(start, end - start + 1);
    }
    public override string productId() {
      var res = course.ToString();
      if (isTest) res += "_test";
      res += "_" + skipPart.ToString();
      res += "_" + takePart.ToString();
      return res;
    }

    public override IEnumerable<productPartLow> productParts() {
      for (int i = skipPart; i < skipPart + takePart; i++) {
        productPart res = new productPart() { root = allLevels()[i / 2], partIdx = i, prod = this };
        var sp = partSplitIdx(i); string tit;
        if (sp < 0) {
          if (course == CourseIds.Russian) res = new productPart() { root = allLevels()[i], partIdx = i, prod = this };
          res.lessons = res.root.Elements(); tit = null;
        } else if ((i & 1) == 0) {
          res.lessons = res.root.Elements().Take(sp); tit = Def.part1[course];
        } else {
          res.lessons = res.root.Elements().Skip(sp); tit = Def.part2[course];
        }
        res.title = res.root.AttributeValue("title") + " " + tit;
        yield return res;
      }
    }

    int levelsNum() { //pocet vsech urovni kurzu
      return course == CourseIds.English || course == CourseIds.EnglishE ? 5 : (course == CourseIds.Russian ? 4 : 3);
    }
    public override bool hasPretest() { //vsechny casti => ma pretest
      //DEBUG: return levelsNum() * 2 == takePart;
      return false;
    }
    public override IEnumerable<Langs> locs() { //dostupne lokalizace
      switch (course) {
        case CourseIds.EnglishE: yield return Langs.en_gb; break;
        case CourseIds.English: foreach (var lng in CommonLib.bigLocalizations.Where(l => l != CommonLib.CourseIdToLang(course))) yield return lng; break;
        case CourseIds.Russian: yield return Langs.cs_cz; yield return Langs.sk_sk; break;
        default: foreach (var lng in CommonLib.bigLocalizations.Where(l => l != CommonLib.CourseIdToLang(course) && l != Langs.vi_vn && l != Langs.zh_cn)) yield return lng; break;
      }
    }
    public int partSplitIdx(int part) {
      switch (course) {
        case CourseIds.English:
        case CourseIds.EnglishE:
          switch ((int)(part / 2)) {
            case 0: return 8;
            case 1: return 8;
            case 2: return 8;
            case 3: return 8;
            case 4: return 9;
            default: throw new Exception();
          }
        case CourseIds.German:
          switch ((int)(part / 2)) {
            case 0: return 6;
            case 1: return 6;
            case 2: return -1;
            default: throw new Exception();
          }
        case CourseIds.Spanish:
          switch ((int)(part / 2)) {
            case 0: return 9;
            case 1: return 7;
            case 2: return 4;
            default: throw new Exception();
          }
        case CourseIds.French:
          switch ((int)(part / 2)) {
            case 0: return 7;
            case 1: return 6;
            case 2: return 4;
            default: throw new Exception();
          }
        case CourseIds.Italian:
          switch ((int)(part / 2)) {
            case 0: return 5;
            case 1: return 5;
            case 2: return 5;
            default: throw new Exception();
          }
        case CourseIds.Russian:
          return -1;
        default: throw new Exception();
      }
    }
  }

  //popis jednoho kurzu produktu
  public class courseDescr {
    [DefaultValue(0)]
    public int id;
    //public string testFileName; //pro kurzy s testem: identifikace testu
    public string level; //textovy popis levelu, napr. A1-A2
  }

  //pomocne dato, identifikujici jednu cast produktu
  public class productPart : productPartLow {
    public IEnumerable<XElement> lessons; //zeznam lekci z root
    public int partIdx; //index casti (pro anglictinu cislo 0..9)
    public XElement root; //napr. <level order="0" title="Beginner" spaceId="english1" globalId="home.htm"> node z Q:\LMCom\LMCOM\App_Data\Statistic_CourseStructureEx.xml

    public override IEnumerable<XElement> getLessons() { return lessons; }

    public override string testFileName() {
      if (!((productDescr)prod).isTest) return null;
      switch (prod.course) {
        case CourseIds.English: return string.Format("ElementTests/elements{0}", partIdx + 1);
        default: throw new Exception();
      }
    }

    public override string partLevelName() {
      switch (prod.course) {
        case CourseIds.EnglishE:
        case CourseIds.English:
          switch (partIdx) {
            case 0: return "A1";
            case 1: return "A1";
            case 2: return "A1-A2";
            case 3: return "A1-A2";
            case 4: return "A2";
            case 5: return "A2-B1";
            case 6: return "A2-B1";
            case 7: return "B1";
            case 8: return "B1-B2";
            case 9: return "B1-B2";
            default: throw new Exception();
          }
        case CourseIds.German:
          switch (partIdx) {
            case 0: return "A1";
            case 1: return "A1-A2";
            case 2: return "A2";
            case 3: return "A2-B1";
            case 4: return "B1-B2";
            default: throw new Exception();
          }
        case CourseIds.Spanish:
          switch (partIdx) {
            case 0: return "A1";
            case 1: return "A1-A2";
            case 2: return "A2";
            case 3: return "A2-B1";
            case 4: return "B1";
            case 5: return "B1-B2";
            default: throw new Exception();
          }
        case CourseIds.French:
          switch (partIdx) {
            case 0: return "A1";
            case 1: return "A1-A2";
            case 2: return "A2";
            case 3: return "A2-B1";
            case 4: return "B1";
            case 5: return "B1-B2";
            default: throw new Exception();
          }
        case CourseIds.Italian:
          switch (partIdx) {
            case 0: return "A1";
            case 1: return "A1-A2";
            case 2: return "A2";
            case 3: return "A2-B1";
            case 4: return "B1";
            case 5: return "B1-B2";
            default: throw new Exception();
          }
        case CourseIds.Russian:
          switch (partIdx) {
            case 0: return "A1";
            case 1: return "A2";
            case 2: return "A2-B1";
            case 3: return "B1-B2";
            default: throw new Exception();
          }
        default: throw new Exception();
      }
    }
  }

}