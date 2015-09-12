using CourseMeta;
using LMComLib;
using LMNetLib;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace blendedMeta {
  public static class MetaInfo {

    static MetaInfo() {
      string path = HttpContext.Current.Server.MapPath("~/data/actproductsexpanded.xml");
      var prodExpanded = XmlUtils.FileToObject<products>(path); prodExpanded.finishRead();
      products = prodExpanded.Items.OfType<CourseMeta.product>().Where(p => p.url.StartsWith("/lm/prods_lm_blcourse_")).Select(it => new product(it)).ToArray();
    }

    public static Dictionary<string, ex> exercises = new Dictionary<string, ex>();
    public static Dictionary<string, productHolder> modAndPretests = new Dictionary<string, productHolder>(); //module nebo pretest
    static product[] products;

    static uProduct adjustProduct(uProducts uproducts, product prod, long lmcomId) {
      var lp = new lineUser(prod.line, lmcomId); uProduct uprod;
      if (!uproducts.uproducts.TryGetValue(lp, out uprod)) uproducts.uproducts.Add(lp, uprod = new uProduct() { product = prod, lmcomId = lmcomId });
      return uprod;
    }

    public static void addDummyUsers(uProducts uproducts, lineUser lineUser) {
      adjustProduct(uproducts, products.First(p => p.line == lineUser.line), lineUser.lmcomId);
    }

    public static void addModule(uProducts uproducts, userBase umodule) {
      var modPretest = modAndPretests[umodule.url];
      var uprod = adjustProduct(uproducts, modPretest.product, umodule.lmcomId);
      //Pretest
      if (modPretest is pretest) { if (uprod.upretest == null) uprod.upretest = new uPretest() { pretest = modPretest as pretest }; return; }
      var mod = (module)modPretest;
      //start test
      if (mod is startTest) { if (uprod.ustartTest != null) return; uprod.ustartTest = new uModule(mod); uprod.ustartTest.copyFrom(umodule); return; }
      //part
      uPart upart = uprod.uparts[mod.part.number];
      if (upart == null) uprod.uparts[mod.part.number] = upart = new uPart() { part = mod.part };
      //test
      if (mod is test) { if (upart.utest != null) return; upart.utest = new uModule(mod); upart.utest.copyFrom(umodule); return; }
      //other: musi byt lekce
      var lesson = (lesson)mod;
      uModule uless = upart.ulessons[lesson.idx];
      if (uless != null) return;  upart.ulessons[lesson.idx] = uless = new uModule(lesson); uless.copyFrom(umodule);
    }

    public static void addEx(uProducts uproducts, userEx uex) {
      ex ex = exercises[uex.url];
      var uprod = adjustProduct(uproducts, ex.product, uex.lmcomId);

      if (ex.pretest != null) {
        if (uprod.upretest == null) uprod.upretest = new uPretest() { pretest = ex.pretest };
        uprod.upretest.addEx(uex);
        return;
      }
      if (ex.startTest != null) {
        if (uprod.ustartTest == null) uprod.ustartTest = new uModule(ex.startTest);
        uprod.ustartTest.addEx(uex);
        return;
      }
      uPart upart = uprod.uparts[ex.part.number];
      if (upart == null) uprod.uparts[ex.part.number] = upart = new uPart() { part = ex.part };
      if (ex.test != null) {
        if (upart.utest == null) upart.utest = new uModule(ex.test);
        upart.utest.addEx(uex);
        return;
      }
      uModule uless = upart.ulessons[ex.lesson.idx];
      if (uless == null) upart.ulessons[ex.lesson.idx] = uless = new uModule(ex.lesson);
      uless.addEx(uex);
    }
  }

  public struct lineUser { public lineUser(LineIds line, long lmcomId) { this.line = line; this.lmcomId = lmcomId; } public LineIds line; public long lmcomId; }

  public class lineUserEqualityComparer : IEqualityComparer<lineUser> {
    public int GetHashCode(lineUser lu) { return LowUtils.computeHashCode(lu.line, lu.lmcomId); }
    public bool Equals(lineUser lu1, lineUser lu2) { return lu1.line == lu2.line && lu1.lmcomId == lu2.lmcomId; }
  }

  //*************************** 
  //  user informace o vsech produktech vsech uzivatelu, zjistenych z CourseData tabulky. Kazdu yzivatel ma max. jeden produkt na kurz.
  //*************************** 
  public class uProducts {
    public Dictionary<lineUser, uProduct> uproducts = new Dictionary<lineUser, uProduct>(new lineUserEqualityComparer());
  }

  public class uProduct : userBase {
    public uPretest upretest;
    public uModule ustartTest;
    public uPart[] uparts = new uPart[4];
    //---
    public product product;

    public string etapId() {
      if (upretest == null) return "1. není rozřazovací test";
      if (ustartTest == null || !ustartTest.done()) return "2. rozřazovací test hotov";
      var actPart = uparts.LastOrDefault(p => p != null && p.done());
      if (actPart == null) return "3. vstupní test hotov";
      return actPart.part.number == 3 ? "7. kurz hotov" : string.Format("{0}. hotova část {1}", actPart.part.number + 4, Convert.ToChar(Convert.ToInt16('A') + actPart.part.number));
    }
  }

  public class uPretest : uModule {
    public uPretest() : base(null) { }
    public int targetLevel;
    public new bool done() {
      return (flag & CourseModel.CourseDataFlag.done) != 0;
    }
    //---
    public pretest pretest;
  }

  public class uPart : userBase {
    public uModule[] ulessons = new uModule[3];
    public uModule utest;
    public part part;
    public bool done() {
      if (utest == null || !utest.done()) return false;
      foreach (var ul in ulessons) {
        if (ul == null || !ul.done()) return false;
      }
      return true;
    }
  }

  public class uModule : userBaseEx {
    public uModule(module module) { this.module = module; }
    public void addEx(userEx ex) { }
    public bool done() {
      return (flag & CourseModel.CourseDataFlag.done) != 0;
    }
    //---
    public module module;
  }

  //*********** ancestors
  public class persistBase {
    public string url;
    public string productUrl;
    public long lmcomId;
  }

  public class userBase : persistBase {
    public int ms;
    public int s;
    public CourseModel.CourseDataFlag flag;
    public int elapsed; //straveny cas ve vterinach
    public int beg; //datum zacatku, ve dnech
    public int end; //datum konce (ve dnech), na datum se prevede pomoci intToDate(end * 1000000)
                    //Other
    public int sPlay; //prehrany nas zvuk (sec)
    public int sRec; //nahrany zvuk  (sec)
    public int sPRec; //prehrano nahravek (sec)
    public void copyFrom(userBase from) {
      ms = from.ms; s = from.s; flag = from.flag; elapsed = from.elapsed; beg = from.beg; end = from.end; sPlay = from.sPlay; sRec = from.sRec; sPRec = from.sPRec;
    }
  }

  public class userEx : userBase {
  }

  public class userBaseEx : userBase {
    public int count;
  }

  //*************************** 
  //  staticka struktura vsech blended PRODUKTU
  //*************************** 

  public class productHolder {
    public productHolder(CourseMeta.data data, product product) { this.product = product; this.data = data; }
    public product product;
    public CourseMeta.data data;
  }
  public class partLevelHolder : productHolder {
    public partLevelHolder(CourseMeta.data data, product product, level level, part part) : base(data, product) {
      this.level = level; this.part = part;
    }
    public level level;
    public part part;
  }

  public class product : productHolder {
    public product(CourseMeta.product data) : base(data, null) {
      line = data.line; product = this;
      pretest = new pretest(data.Items.Skip(4).First(), this);
      int cnt = 0;
      levels = data.Items.Take(4).Select(d => new level(d, this, cnt++)).ToArray();
    }
    void parseUrl(string url) {
    }
    public LMComLib.LineIds line;
    public pretest pretest;
    public level[] levels; //0..3, odpovidajici A1,,B2
  }
  public class pretest : productHolder {
    public pretest(CourseMeta.data data, product product) : base(data, product) {
      MetaInfo.modAndPretests.Add(data.url, this);
      int cnt = 0;
      pretestItems = data.Items.Select(d => new pretestItem(d, product, this, cnt++)).ToArray();
    }
    public pretestItem[] pretestItems; //A1..B2 casti pretestu
  }
  public class level : productHolder {
    public level(CourseMeta.data data, product product, int lev) : base(data, product) {
      this.lev = lev;
      startTest = new startTest(data.Items.First(), product, this);
      parts = Enumerable.Range(0, 4).Select(idx => new { idx, items = data.Items.Skip(idx * 4 + 1).Take(4) }).Select(idxItems => new part(idxItems.items.ToArray(), product, this, idxItems.idx)).ToArray();
    }
    public int lev; //identifikace level, 0,1,2,3
    public startTest startTest;
    public part[] parts; //etapy vyuky
  }
  public class part : productHolder { //jedna etapa vyuky
    public part(CourseMeta.data[] datas, product product, level level, int number) : base(null, product) {
      this.number = number;
      int cnt = 0;
      lessons = datas.Take(3).Select(data => new lesson(data, product, level, this, cnt++)).ToArray();
      test = new test(datas.Skip(3).First(), product, level, this);
    }
    public int number; //cislo etapy, 0,1,2,3
    public lesson[] lessons; //3 lekce 
    public test test; //test
  }
  public class module : partLevelHolder {
    public module(CourseMeta.data data, product product, level level = null, part part = null) : base(data, product, level, part) {
      MetaInfo.modAndPretests.Add(data.url, this);
      exs = data.Items.Select(it => new ex(it, product, level, part, this)).ToArray();
    }
    public ex[] exs;
  }
  public class lesson : module {
    public lesson(data data, product product, level level, part part, int idx) : base(data, product, level, part) {
      this.idx = idx;
    }
    public int idx; //cslo lekce, 0,1,2

  }
  public class test : module {
    public test(data data, product product, level level, part part) : base(data, product, level, part) { }
  }
  public class startTest : module {
    public startTest(CourseMeta.data data, product product, level level) : base(data, product, level) { }
  }
  public class pretestItem : module {
    public pretestItem(CourseMeta.data data, product product, pretest pretest, int lev) : base(data, product) {
      this.pretest = pretest; this.lev = lev;
    }
    public pretest pretest;
    public int lev;
  }
  public class ex : partLevelHolder {
    public ex(data data, product product, level level, part part, module module) : base(data, product, level, part) {
      MetaInfo.exercises.Add(data.url, this);
      this.module = module;
      pretestItem = module as pretestItem; if (pretestItem != null) pretest = pretestItem.pretest;
      lesson = module as lesson;
      startTest = module as startTest;
      test = module as test;
    }
    //--
    public module module;
    public pretestItem pretestItem;
    public lesson lesson;
    public startTest startTest;
    public test test;
    public pretest pretest;

  }

}