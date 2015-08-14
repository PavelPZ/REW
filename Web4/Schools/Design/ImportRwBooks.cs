//http://www.computerhope.com/robocopy.htm
//robocopy s:\LMCom\SoundSources\ q:\LMCom\rew\SoundSources\ *.mp3 *.wav /s -XD src2 

using System;
using System.Collections.Generic;
//using System.Data.Entity.Infrastructure;
using System.IO;
using System.IO.Compression;
using System.Linq;
using System.Text;
using Course;
using LMComLib;
using LMNetLib;
using Design;
using System.Xml.Linq;
using System.Threading.Tasks;
using System.Xml.Serialization;
using Newtonsoft.Json;
using System.Globalization;
using System.Security.Cryptography;
using System.Text.RegularExpressions;
using LMMedia;
using Newtonsoft.Json.Linq;
using System.ComponentModel;
using schools;

public class RwBooksMeta {
  public class link {
    [XmlAttribute]
    public string jsonId;
    [XmlAttribute]
    public int lesId;
  }
  [XmlAttribute]
  public string Name;
  [XmlAttribute]
  public short Id;
  [XmlAttribute]
  public LineIds LineId;
  public link[] courseLinks; //id lekci LM kurzu
}

public class RwBooksLoc {
  public short Id;
  public Langs Lang;
  public RwFactLoc[] Locs;
  public string AdminEMail;
  public string Trans;
  public string TransPerex;
}

public class RwFactLoc {
  public static RwFactLoc Create(int id, string src, string trans) { return new RwFactLoc() { Id = id, Trans = trans == null ? "?" : null, Src = src }; }
  public int Id;
  public string Src;
  public string Trans;
  public bool isEmpty() { return isEmpty(Trans); }
  static public bool isEmpty(string trans) { return string.IsNullOrEmpty(trans) || trans == "?"; }
}

//0000 knihy, 00.0000 lekce, 2.000.00.0000 fakty
//100 lekci na knihu, 2.000 faktu na lekci, max 10.000 knih
public static class RwIdManager {
  public static int getLessId(short bookId, short lessCnt) { return lessCnt * 10000 + bookId; }
  public static int getFactId(int lessId, short factCnt) { return factCnt * 1000000 + lessId; }
  public static short bookIdFromLessId(int lessId) { return (short)(lessId % 10000); }
  public static short bookIdFromFactId(int factId) { return (short)(factId / 1000000); }
  public static short lessIdFromFactId(int factId) { return (short)((factId / 10000) % 100); }
  public static bool isLessonId(Int64 id) { return id < 1000000 && id > 10000; }
  public static bool isBookId(Int64 id) { return id < 10000; }
  public static bool isFactId(Int64 id) { return id > 1000000; }

  public static string hashDir1(string name, byte mask = 0x7F) {
    var md5 = MD5.Create();
    return LowUtils.ByteToString(md5.ComputeHash(Encoding.UTF8.GetBytes(name)).Select(b => (byte)(b & mask)).Aggregate((r, i) => (byte)(r ^ i)));
  }
  public static string hashDir2(string name, byte mask = 0x7F) {
    var md5 = MD5.Create();
    byte[] single = md5.ComputeHash(Encoding.UTF8.GetBytes(name));
    return LowUtils.ByteToString(single.Take(8).Select(b => (byte)(b & mask)).Aggregate((r, i) => (byte)(r ^ i))) + "\\" + LowUtils.ByteToString(single.Skip(8).Select(b => (byte)(b & mask)).Aggregate((r, i) => (byte)(r ^ i)));
  }

}

public static class RwSound {

  public static void ListSoundFiles() {
    File.WriteAllLines(ss + "\\fileList.txt", Directory.EnumerateFiles(ss, "*", SearchOption.AllDirectories).Where(f => exts.IsMatch(f)).Select(f => f.Substring(ss.Length + 1)));
  } static string ss = Machines.basicPath + @"rew\SoundSources"; static Regex exts = new Regex(@"\.(wav|mp3)$");


  public static void CreateDirectory() {
    var root = File.ReadAllLines(ss + "\\fileList.txt").
      Where(f => f.EndsWith(".mp3")).
      Select(f => parseFile(f)).
      GroupBy(p => p.lng).
      Select(g => new lng() {
        lang = g.Key,
        items = g.
          GroupBy(i => i.w).
          Select(wg => new inf() {
            w = wg.Key,
            srcIds = wg.Select(wgi => wgi.srcId).ToArray()
          }).
          ToArray()
      });
    XmlUtils.ObjectToFile(ss + "\\words.xml", root.ToArray());
  }

  static hlp parseFile(string f) {
    string[] parts = f.Split('\\');
    f = parts.Last().Split('.')[0];
    return new hlp() { lng = LowUtils.EnumParse<Langs>(parts[0]), srcId = (SoundSrcId)(Convert.ToByte(parts[1].Last()) - Convert.ToByte('0')), w = Paths.DecodeFileNameToWord(f) };
  }
  public struct hlp {
    public Langs lng;
    public string w;
    public SoundSrcId srcId;
  }
  public struct inf {
    [XmlAttribute]
    public string w;
    [XmlAttribute]
    public SoundSrcId[] srcIds;
  }
  public struct lng {
    [XmlAttribute]
    public Langs lang;
    public inf[] items;
  }

  public static void MergeSounds() {
    var soundDict = SoundDict;
    Rewise.Book[] books = RwBooksDesign.getBooks().ToArray();
    StringBuilder sb = new StringBuilder();
    var rwWords = books.
      SelectMany(b => b.lessons().
        SelectMany(l => l.SrcFacts.
          SelectMany(f => GetSoundKeys(f.getSide(Langs.no).Text, sb)).
            Select(s => new {
              l = CommonLib.LineIdToLang(b.LineId),
              w = s,
              b = b.Title,
              les = l.Title,
            }))).
      ToArray();
    File.WriteAllLines(ss + @"\\missingSound.txt", rwWords.
      Where(rw => !soundDict[rw.l].ContainsKey(rw.w)).
      OrderBy(rw => rw.l).
      Select(rw => rw.b + "." + rw.les + "." + rw.l.ToString() + ": " + rw.w));
    //File.WriteAllLines(ss + @"\\missingSound.txt", rwWords.Where(rw => rw.l == Langs.ru_ru && rw.w.Contains(' ')).
    //  Where(rw => !soundDict[rw.l].ContainsKey(rw.w)).
    //  Select(rw => rw.w + "\t" + rw.w.Replace(" ", null)));
  }

  //public static SoundSrcId[][] getSoundSrc(string factText, Langs loc, StringBuilder sb) {
  //  var sd = soundDict[loc];
  //  return GetSound(factText, sb).Select (ft => getSoundSrc(sd, ft.Key)).ToArray();
  //}
  static SoundSrcId[] getSoundSrc(Dictionary<string, SoundSrcId[]> sd, string w) { SoundSrcId[] res; return sd.TryGetValue(w, out res) ? res : null; }

  static Dictionary<Langs, Dictionary<string, SoundSrcId[]>> SoundDict {
    get { return soundDict != null ? soundDict : soundDict = XmlUtils.FileToObject<RwSound.lng[]>(ss + "\\words.xml").ToDictionary(l => l.lang, l => l.items.ToDictionary(i => i.w, i => i.srcIds)); }
    set { soundDict = value; }
  } static Dictionary<Langs, Dictionary<string, SoundSrcId[]>> soundDict;


  //public struct KeyText { public string Key; public string Text; }

  public static char russianAccent = '\x301'; //rusky prizvuk, Convert.ToInt32(ch)==769 
  //public static char russianOSmall = '\x43E';
  //public static char russianOBig = '\x41E';
  //static Regex rxBracket = new Regex(@"\{.*?\}", RegexOptions.Singleline); //slozene zavorky, další varianta, stanou se kulatou zavorku. Pro zvuk se obsah maze.
  //static Regex rxComment = new Regex(@"\(.*?\)", RegexOptions.Singleline); //kulate zavorky, komentář. Pro zvuk se obsah maze.
  //static Regex rxOption = new Regex(@"\[.*?\]", RegexOptions.Singleline); //hranate zavorky, option, stanou se mezerou. Pro zvuk se obsah maze.
  //static Regex rxRussianAccent = new Regex(russianAccent, RegexOptions.Singleline); //rusky prizvuk

  static Regex rxSoundAll = new Regex(@"\[.*?\]|\(.*?\)|\{.*?\}|" + russianAccent, RegexOptions.Singleline);

  //static Regex rxSound = new Regex(@"\{%.*?%\}", RegexOptions.Singleline); //sound zavorky, asi poznamka pro mluvicho, maze se pro zvuk i zobrazeni.
  static Regex rxDoubleSpaces = new Regex(@"\s\s+", RegexOptions.Singleline); //zdvojene mezery, crlf a tab se nahradi mezerou

  static IEnumerable<string> GetSoundKeys(string srcText, StringBuilder sb) {
    if (string.IsNullOrEmpty(srcText)) yield break;
    foreach (string s in srcText.Split(';')) {
      //Snd
      //string snd = rxBracket.Replace(rxComment.Replace(rxOption.Replace(rxRussianAccent.Replace(s,""), ""), ""), "").ToLower();
      string snd = rxSoundAll.Replace(s, "").ToLower();
      sb.Length = 0; bool inBlank = false;
      foreach (char ch in snd)
        if (char.IsWhiteSpace(ch)) {
          if (!inBlank) sb.Append(ch);
          inBlank = true;
        } else if (char.IsLetterOrDigit(ch) || ch == '?' || ch == '\'') {
          sb.Append(ch);
          inBlank = false;
        } else if (inBlank) { //oddelovac, mezera jiz OK
        } else { //oddelovac, mezera jeste neni
          sb.Append(' ');
          inBlank = true;
        }
      yield return sb.ToString().Trim();
    }
  }

  static IEnumerable<string> GetSoundText(string srcText) {
    if (string.IsNullOrEmpty(srcText)) return Enumerable.Empty<string>();
    return srcText.Split(';').Select(txt => rxDoubleSpaces.Replace(txt, " ").Trim());
  }

  public static Rew.FactSound[] getFactText(string srcText, Langs loc, StringBuilder sb) {
    if (loc == Langs.no) return null;
    var sd = SoundDict[loc];
    return GetSoundKeys(srcText, sb).Zip(GetSoundText(srcText), (key, value) => sndInfo(key, value, getSoundSrc(sd, key))).ToArray();
  }

  static Rew.FactSound sndInfo(string key, string value, SoundSrcId[] srcIds) {
    if (srcIds == null) return new Rew.FactSound() { Text = value };
    return new Rew.FactSound() { Text = value, SndSrcs = srcIds };
  }

  public static Rew.FactSrc createFact(Rewise.SrcFact f, Langs srcLang, Langs loc, StringBuilder sb) {
    return new Rew.FactSrc() { DbId = f.Id, Type = f.Type, Question = getFactText(f.getAnswer(Langs.no), srcLang, sb), Answer = getFactText(f.getAnswer(loc), loc, sb) };
  }

}

public static class CourseDictionary {

  public static Langs[] crsLangs = new Langs[] { Langs.ru_ru, Langs.en_gb, Langs.de_de, Langs.fr_fr, Langs.sp_sp, Langs.it_it };
  public static Langs[] nativeLangs = new Langs[] { Langs.cs_cz, Langs.vi_vn };

  static Dictionary<char, string> wrongCyrilic = new Dictionary<char, string>() { { 'á', "а\x301" }, { 'a', "а" }, { 'p', "р" }, { 'e', "е" }, { 'y', "у" }, { 'c', "с" }, { 'ë', "ё" }, { 'ý', "у\x301" }, { 'é', "е\x301" }, { 'x', "х" }, { 'ó', "о\x301" }, { 'm', "м" }, { 'o', "о" }, };

  public static string normalizeRussian(string s) {
    string rep;
    return s.Select(ch => wrongCyrilic.TryGetValue(ch, out rep) ? rep : ch.ToString()).Aggregate((r, i) => r + i);
  }

  static Dictionary<Langs, wordInf[]> courseWords {
    get {
      if (_courseWords == null) {
        JArray words = JArray.Parse(File.ReadAllText(Machines.basicPath + @"rew\Web4\RwDicts\CourseWords.json"));
        var wordInfos = words.Cast<JObject>().SelectMany(obj => ((JArray)obj["exs"]).Cast<JObject>().SelectMany(o => ((JArray)o["words"]).Select(w => new wordInf() {
          bookLang = (Langs)(int)obj["lang"],
          exId = (string)o["url"],
          word = w.ToString()
        })));
        _courseWords = wordInfos.GroupBy(w => w.bookLang).ToDictionary(g => g.Key, g => g.ToArray());
      }
      return _courseWords;
    }
  } static Dictionary<Langs, wordInf[]> _courseWords;

  static Dictionary<Langs, Dictionary<Langs, Dictionary<string, string>>> lingeaKeys {
    get {
      if (_lingeaKeys == null) {
        _lingeaKeys = new Dictionary<Langs, Dictionary<Langs, Dictionary<string, string>>>();
        foreach (var natLng in nativeLangs) {
          var nat = new Dictionary<Langs, Dictionary<string, string>>();
          _lingeaKeys.Add(natLng, nat);
          foreach (var lng in crsLangs) {
            var dictFn = Machines.basicPath + @"rew\Web4\RwDicts\lingea_" + natLng.ToString() + "_" + lng.ToString() + ".xml";
            if (!File.Exists(dictFn)) continue;
            XElement root = XElement.Load(dictFn);
            nat.Add(
              lng,
              root.Elements().SelectMany(e => e.AttributeValue("vals").Split('#').Select(v => new { key = e.AttributeValue("key"), val = v })).ToDictionary(kv => kv.val, kv => kv.key)
            );
          }
        }
      }
      return _lingeaKeys;
    }
  } static Dictionary<Langs, Dictionary<Langs, Dictionary<string, string>>> _lingeaKeys;

  static Dictionary<Langs, Dictionary<Langs, Dictionary<string, XElement>>> lingeaWords {
    get {
      if (_lingeaWords == null) {
        _lingeaWords = new Dictionary<Langs, Dictionary<Langs, Dictionary<string, XElement>>>();
        foreach (var natLng in nativeLangs) {
          Dictionary<Langs, Dictionary<string, XElement>> nat = new Dictionary<Langs, Dictionary<string, XElement>>();
          _lingeaWords.Add(natLng, nat);
          foreach (var lng in crsLangs) {
            var dictFn = Machines.basicPath + @"rew\Web4\RwDicts\lingea_" + natLng.ToString() + "_" + lng.ToString() + ".xml";
            if (!File.Exists(dictFn)) continue;
            XElement root = XElement.Load(dictFn);
            nat.Add(
              lng,
              root.Elements().ToDictionary(el => el.AttributeValue("key"), el => el)
            );
          }
        }
      }
      return _lingeaWords;
    }
  } static Dictionary<Langs, Dictionary<Langs, Dictionary<string, XElement>>> _lingeaWords;

  static void captureLingea(Langs courseLang, Langs nativeLang, string dictCode) {
    if (!crsLangs.Contains(courseLang)) return;
    _lingeaWords = null; _lingeaKeys = null;
    //Capture
    XElement langRoot = new XElement("root", new XAttribute("lang", courseLang.ToString()));
    var words = courseWords[courseLang].Select(w => (courseLang == Langs.ru_ru ? normalizeRussian(w.word) : w.word)).Distinct().GroupBy(w => w.ToLower()).ToDictionary(g => g.Key, g => g.Aggregate((r, i) => r + "#" + i));
    foreach (var word in words) {
      var res = NewData.Schools.getDictWord(dictCode, word.Key);
      var entrXml = new XElement("w", new XAttribute("key", word), new XAttribute("vals", word.Value));
      langRoot.Add(entrXml);
      if (string.IsNullOrEmpty(res)) { entrXml.Add("???"); continue; }
      try {
        entrXml.Add(XElement.Parse(res));
      }
      catch { entrXml.Add("?xml?"); } 
    }
    //odstran duplicity
    var doubles = langRoot.Elements().Where(e => e.Elements().Count() == 1).Select(e => new { e, val = e.Elements().First().ToString() }).GroupBy(v => v.val).Where(g => g.Count() > 1).ToArray();
    foreach (var d in doubles) {
      var f = d.First();
      f.e.Attribute("vals").Value = d.Select(e => e.e.AttributeValue("vals")).Aggregate((r, i) => r + "#" + i);
      foreach (var e in d.Skip(1)) e.e.Remove();
    }
    //save
    langRoot.Save(Machines.basicPath + @"rew\Web4\RwDicts\lingea_" + nativeLang.ToString() + "_" + courseLang.ToString() + ".xml");
    //kontrola
    //var lWords = lingeaWords[nativeLang][courseLang];
    //var lKeys = lingeaKeys[nativeLang][courseLang];
    //Func<string, XElement> findEntry = w => {
    //  w = courseLang == Langs.ru_ru ? normalizeRussian(w) : w;
    //  string v; if (!lKeys.TryGetValue(w, out v)) return null;
    //  XElement res;
    //  return lWords.TryGetValue(v, out res) ? res : null;
    //};
    //var wrong = courseWords[courseLang].Select(w => w.word).Where(w => findEntry(w) == null).Aggregate((r, i) => r + "\r\n" + i);
    //if (wrong != "") File.WriteAllText(Machines.basicPath + @"rew\Web4\RwDicts\lingeaError_" + nativeLang.ToString() + "_" + courseLang.ToString() + ".txt", wrong);
  }

  public static void CaptureLingeaAll() {
    foreach (var el in XElement.Load(Machines.basicPath + @"rew\Web4\RwDicts\DictInfos.xml").Element("Dicts").Elements()) {
      captureLingea(LowUtils.EnumParse<Langs>(el.ElementValue("From")), LowUtils.EnumParse<Langs>(el.ElementValue("To")), el.ElementValue("Code"));
    }
  }

  //public static void CaptureLingea(Langs nativeLang) {
  //  //Lingea dict codes
  //  XElement dictInfo = XElement.Load(Machines.basicPath + @"rew\Web4\RwDicts\DictInfos.xml").Element("Dicts");
  //  var codes = crsLangs.
  //    Select(l => new {
  //      bookLang = l,
  //      code = dictInfo.Elements().First(el => el.ElementValue("From") == l.ToString() && el.ElementValue("To") == nativeLang.ToString()).ElementValue("Code")
  //    }).ToArray();
  //  foreach (var code in codes)
  //    captureLingea(code.bookLang, nativeLang, code.code);
  //}

  static IEnumerable<DictItem> encodeLingeaEntry(XElement root, Dictionary<string, short> tags) {
    foreach (var nd in root.Nodes()) {
      if (nd.NodeType == System.Xml.XmlNodeType.Text) yield return new DictItem() { text = ((XText)nd).Value };
      else {
        XElement el = (XElement)nd;
        string cls = el.AttributeValue("class")??"null";
        short clsId = tags[cls];
        if (el.Name.LocalName == "span") clsId = (short)-clsId;
        if (el.Nodes().Count() == 1 && el.Nodes().First().NodeType == System.Xml.XmlNodeType.Text)
          yield return new DictItem() { tag = clsId, text = ((XText)el.Nodes().First()).Value };
        else
          yield return new DictItem() { tag = clsId, items = encodeLingeaEntry(el, tags).ToArray() };
      }
    }
  }

  public static void LingeaToModulesAll() {
    foreach (var lng in CourseDictionary.nativeLangs) LingeaToModules(lng);
  }
  static void LingeaToModules(Langs nativeLang) {
    foreach (var lng in crsLangs) {
      if (!lingeaWords.ContainsKey(nativeLang) || !lingeaWords[nativeLang].ContainsKey(lng)) continue;
      var lWords = lingeaWords[nativeLang][lng];
      var lKeys = lingeaKeys[nativeLang][lng];
      var exWords = courseWords[lng].GroupBy(w => w.exId).ToDictionary(g => g.Key, g => g.Select(w => lng == Langs.ru_ru ? normalizeRussian(w.word) : w.word).Distinct());
      XElement el = null; string v = null; IEnumerable<string> exWs = null;
      foreach (var mod in Exercise.EAModules(ProductsDefine.Lib.root).Where(m => m.crsId == CommonLib.LangToCourseId(lng))) {
        var modWords = mod.exs.
          Select(ex => ex.Id.Substring(ex.Id.LastIndexOf("/") + 1)).
          Where(exId => exWords.TryGetValue(exId, out exWs)).
          SelectMany(exId => exWs).
          Distinct().
          ToArray();
        var dict = new Dict();
        var keys = modWords.Where(w => lKeys.TryGetValue(w, out v)).Select(w => v).Distinct().ToArray();
        var keyEl = keys.Where(k => lWords.TryGetValue(k, out el) && el.HasElements).Select(k => new { k, el });
        short cnt = 1;
        var tagToInt = keyEl.SelectMany(ke => ke.el.Descendants().Select(d => d.AttributeValue("class") ?? "null")).Distinct().ToDictionary(a => a, a => cnt++);
        dict.Tags = tagToInt.ToDictionary(kv => kv.Value.ToString(), kv => kv.Key);
        dict.Entries = keyEl.ToDictionary(k => k.k, k => encodeLingeaEntry(k.el.Elements().Single(), tagToInt).ToArray());
        var allKeys = dict.Entries.Keys.ToDictionary(k => k, k => true);
        dict.Keys = modWords.Where(w => lKeys.TryGetValue(w, out v) && allKeys.ContainsKey(v)).ToDictionary(w => w, w => v);
        EADeployLib.writeFile(Machines.basicPath + @"rew\Web4\Schools\EAData\", "lingDict_" + mod.jsonId + ".json", nativeLang, JsonConvert.SerializeObject(dict, Newtonsoft.Json.Formatting.Indented, EADeployLib.jsonSet), true);
      }
    }
  }
  /*
  public static void AssignNumbers(Langs lng = Langs.no) {
    var wordInfos = lng == Langs.no ? courseWords.SelectMany(cv => cv.Value) : courseWords[lng];
    int cnt = 0;
    var db = new web4.Schools.Design.Vocabularies.vocabulariesEntities();
    Dictionary<string, Langs> notFound = new Dictionary<string, Langs>();
    Parallel.ForEach<wordInf, web4.Schools.Design.Vocabularies.vocabulariesEntities>(wordInfos, () => new web4.Schools.Design.Vocabularies.vocabulariesEntities(), (w, opt, idx, d) => {
      var normW = w.bookLang == Langs.ru_ru ? normalizeRussian(w.word) : w.word;
      var res = d.ExecuteStoreQuery<assignResult>(string.Format("select * from [Dict] where FREETEXT ({0}, @p0)", w.bookLang), normW).ToArray();
      lock (typeof(CourseDictionary)) {
        if (res.Length == 0)
          notFound[normW.ToLower()] = w.bookLang;
        cnt++;
      }
      return d;
    }, ldb => { });
    var el = new XElement("root", notFound.GroupBy(kv => kv.Value).Select(g => new XElement(g.Key.ToString(), g.Select(gr => gr.Key).OrderBy(w => w).Aggregate((r, i) => r + "; " + i))));
    el.Save(Machines.basicPath + @"rew\web4\Schools\Design\Vocabularies\dictNotFound.xml");
  }
  public static void WordsToDB() {
    var db = new web4.Schools.Design.Vocabularies.vocabulariesEntities();
    db.ExecuteStoreCommand("delete from dict");
    var books = RwBooksDesign.getBooks().ToArray();
    int cnt = 0;
    int[] courseBooks = new int[] { 62, 63, 64, 65, 66, 77, 78, 79, 81, 82, 89, 90, 91, 94, 95, 96, 97, 98, 99 };
    foreach (var w in books.Where(b => courseBooks.Contains(b.Id)).SelectMany(b => b.lessons().SelectMany(l => l.SrcFacts.Select(f => new { book = b, less = l, fact = f, side = f.findSide(Langs.no), cs = f.findSide(Langs.cs_cz) })))) {
      var word = new web4.Schools.Design.Vocabularies.Dict() { FactId = w.fact.Id, LessId = w.less.jsonId };
      db.Dict.AddObject(word);
      switch (CommonLib.LineIdToLang(w.book.LineId)) {
        case Langs.en_gb: word.en_gb = w.side.Text; break;
        case Langs.de_de: word.de_de = w.side.Text; break;
        case Langs.ru_ru: word.ru_ru = w.side.Text; break;
        case Langs.fr_fr: word.fr_fr = w.side.Text; break;
        case Langs.it_it: word.it_it = w.side.Text; break;
        case Langs.sp_sp: word.sp_sp = w.side.Text; break;
        default: break;
      }
      if (w.cs != null) word.cs_cz = w.cs.Text;
      cnt++;
      if (cnt < 1000) continue;
      db.SaveChanges(); db = new web4.Schools.Design.Vocabularies.vocabulariesEntities(); cnt = 0;
    }
  }
  public class assignResult {
    public string cs_cz { get; set; }
    public string en_gb { get; set; }
    public string de_de { get; set; }
    public string it_it { get; set; }
    public string fr_fr { get; set; }
    public string sp_sp { get; set; }
    public string ru_ru { get; set; }
    public int FactId { get; set; }
    public string LessId { get; set; }
  }
*/
  public class wordInf {
    public Langs bookLang;
    public string exId;
    public string word;
  }
}

public static class RwBooksDesign {

  static bool createMeta(Rewise.Book bk, ref RwBooksMeta res) {
    var less = bk.lessons().Where(l => !string.IsNullOrEmpty(l.jsonId)).Select(l => new RwBooksMeta.link() { jsonId = l.jsonId, lesId = l.Id }).ToArray();
    if (less.Length == 0) less = null;
    bool isCreated = res == null;
    if (isCreated) res = new RwBooksMeta();
    res.Id = bk.Id;
    res.Name = bk.Name;
    res.courseLinks = less;
    res.LineId = bk.LineId;
    return isCreated;
  }

  //naimportuje a upravi puvodni data z q:\lmcom\Rw\Rewise\App_Data\rewise\.
  public static void primaryImport() {

    Dictionary<string, RwBooksMeta> bookIds = File.Exists(metaPath) ? RWMeta.ToDictionary(bm => bm.Name, bm => bm) : new Dictionary<string, RwBooksMeta>();
    short lastId = bookIds.Values.Select(v => v.Id).DefaultIfEmpty().Max();
    XElement courses = XElement.Load(Machines.lmcomData + @"Statistic_CourseStructure.xml"); //pro provazani slovnicku s LM kurzy
    List<RwFactLoc> loc = new List<RwFactLoc>();
    //List<string> crsLevels = new List<string>(); //pro kontrolu
    foreach (Rewise.Book bk in BooksLib.Books(LineIds.no)) {
      short lessCnt = 1; loc.Clear();
      bk.Name = Path.GetFileNameWithoutExtension(bk.OrigFileName).ToLower();
      string levelId = bkNameToLevelId(bk.Name);
      XElement level = levelId == null ? null : courses.Descendants("level").FirstOrDefault(el => el.AttributeValue("spaceId") == levelId);
      bk.IsDefault = true;
      Langs srcLang = CommonLib.LineIdToLang(bk.LineId);

      //metadata
      RwBooksMeta meta;
      //Book.Id
      if (bookIds.TryGetValue(bk.Name, out meta)) bk.Id = meta.Id; else { lastId++; bk.Id = lastId; }

      foreach (var l in bk.lessons()) {
        short factCnt = 1;
        l.Id = RwIdManager.getLessId(bk.Id, lessCnt++);
        loc.Add(RwFactLoc.Create(l.Id, l.Title, null));
        //nalezeni jsonId kurzu
        if (level != null) {
          var ln = level.Elements().SingleOrDefault(el => el.AttributeValue("title").ToLower() == l.Title.ToLower());
          if (ln == null) { } //crsLevels.Add(levelId + ":" + l.Title);
          else l.jsonId = LowUtils.JSONToId(ln.AttributeValue("spaceId"), ln.AttributeValue("globalId"));
        }
        foreach (var f in l.SrcFacts) {
          f.Id = RwIdManager.getFactId(l.Id, factCnt++);
          foreach (var s in f.Answer) {
            s.Text = rxCommentSoundBracket.Replace(s.Text.Trim(), "");
            if (s.Lang == Langs.no && srcLang == Langs.ru_ru || s.Lang == Langs.ru_ru) s.Text = CourseDictionary.normalizeRussian(s.Text); //nahrada o ruskym o
          }
          f.Type = f.IsPhrase ? FactTypes.phrase : FactTypes.word;
          loc.Add(RwFactLoc.Create(f.Id, f.getAnswer(Langs.no), null));
        }
      }

      //aktualizuj metainformaci 
      if (createMeta(bk, ref meta)) bookIds.Add(bk.Name, meta); //nova metainformace => pridej do kolekce

      XmlUtils.ObjectToFile(textsPath + bk.Name + ".xml", bk);
      var lfn = destPath + @"Texts\" + bk.Name + @"\no.xml";
      LowUtils.AdjustFileDir(lfn);
      XmlUtils.ObjectToFile(lfn, new RwBooksLoc() { Id = bk.Id, Locs = loc.ToArray(), Lang = Langs.no, AdminEMail = "?", Trans = "?", TransPerex = "?" });
    }
    //var notLess = crsLevels.Aggregate((r, i) => r + "; " + i); //seznam rewise lekci, co se nenasly v kurzu
    RWMeta = bookIds.Values.ToArray();
  }
  static Regex rxCommentSoundBracket = new Regex(@"\{%.*?%\}", RegexOptions.Singleline); //asi poznamky pro mluvciho
  static RwBooksMeta[] RWMeta { get { return rwMeta == null ? rwMeta = XmlUtils.FileToObject<RwBooksMeta[]>(metaPath) : rwMeta; } set { rwMeta = value; XmlUtils.ObjectToFile(metaPath, value); } } static RwBooksMeta[] rwMeta;
  static string destPath = Machines.basicPath + @"rew\Web4\RwBooks\";
  static string textsPath = destPath + @"Texts\";
  static string metaPath = destPath + "BookMeta.xml";
  static string courseRewise = Machines.basicPath + @"rew\Web4\Schools\EARewise\";
  static string rewFileName(Langs lng, string fn) { return string.Format(Machines.basicPath + @"rew\Web4\RwBooks\Runtime\{0}\{1}", lng.ToString().Replace('_', '-'), fn); }
  const double locRatio = 0.7; //pomer, od ktereho se povazuje kniha za lokalizovanou

  //odvozeni space id pro course level z jmena rewise slovnicku
  static string bkNameToLevelId(string name) {
    var bk = name.Substring(0, name.Length - 1); string lev; int numInc = 0;
    switch (bk) {
      case "hue": lev = "english"; numInc = 1; break; //anglictina cislovana od 0
      case "hum": lev = "spanish"; break;
      case "huf": lev = "french"; break;
      case "hui": lev = "italian"; break;
      case "hut": lev = "german"; break;
      case "russian": lev = "russian"; break;
      default: return null;
    }
    return lev + (int.Parse(name.Substring(name.Length - 1)) + numInc).ToString();
  }

  static string lessDir(int lessId) {
    return RwIdManager.hashDir1(lessId.ToString(), 0x3f);//RwIdManager.bookIdFromLessId(lessId).ToString();
  }

  public static IEnumerable<Rewise.Book> getBooks() {
    return RWMeta.Select(b => XmlUtils.FileToObject<Rewise.Book>(textsPath + b.Name + ".xml"));
  }
  public static void ExportJson() {

    var books = getBooks().ToArray();
    StringBuilder sb = new StringBuilder();
    //new Dictionary<string, Crs2RwMapItem>();

    //Not localized lessons
    foreach (var b in books) {
      foreach (var les in b.lessons()) {
        Rew.LessonDataSrc res = new Rew.LessonDataSrc() {
          DbId = les.Id,
          Facts = les.SrcFacts.Select(f => RwSound.createFact(f, CommonLib.LineIdToLang(b.LineId), Langs.no, sb)).ToArray()
        };
        writeFile(res, rewFileName(Langs.no, string.Format("{0}\\{1}", lessDir(les.Id), les.Id)), false);
      }
    }

    Parallel.ForEach(new Langs[] { Langs.cs_cz } /*CommonLib.rewiseLangs*/, loc => {

      //Rewise index
      var locSrc = new Rew.LocSrc() {
        Loc = loc,
        Lines = books.GroupBy(b => b.LineId).Select(lineGrp => new Rew.LineSrc() {
          Line = lineGrp.Key,
          Groups = lineGrp.GroupBy(g => g.Group).OrderBy(g => g.First().Order).Select(groupGrp => new Rew.BookGroupSrc() {
            Id = groupGrp.Select(g => g.Id).First(),
            Title = groupGrp.Key,
            Licence = (Rw.CreativeCommonLic)groupGrp.First().Licence,
            AdminEMail = groupGrp.Select(g => g.AdminEMail).FirstOrDefault(em => !string.IsNullOrEmpty(em)),
            //Company = groupGrp.Select(g => g.).FirstOrDefault(em => !string.IsNullOrEmpty(em)),
            Books = groupGrp.OrderBy(bk => bk.Order).Select(bk => new Rew.BookSrc() {
              DbId = bk.Id,
              Title = bk.getLocTitle(loc),
              Perex = bk.getLocPerex(loc),
              LocAdminEMail = bk.getLocAminEMail(loc),
              //Name = bk.book.Project.FileName + "/" + bk.book.FileName,
              Lessons = bk.lessons().Select(l => new Rew.LessonSrc() {
                DbId = l.Id,
                Title = l.getLocTitle(loc),
                Words = l.SrcFacts.Where(f => f.Type == FactTypes.word).Count(),
                Phrases = l.SrcFacts.Where(f => f.Type == FactTypes.phrase).Count(),
                LocCount = l.SrcFacts.Where(f => f.getSide(loc) != null).Count(),
                RewiseSrcFacts = l.SrcFacts,
              }).ToArray()
            }).ToArray()
          }).ToArray()
        }).ToArray()
      };
      //course to rewise map
      Dictionary<string, Rew.Crs2RwMapItem> crs2RwMap = RWMeta.Where(ln => ln.courseLinks != null).SelectMany(ln => ln.courseLinks).ToDictionary(cl => cl.jsonId, cl => new Rew.Crs2RwMapItem() {
        rwId = cl.lesId,
        locRatioPromile = 0,
      });

      //Counts, uvnitr cyklu se vytvori lesson soubory
      foreach (var ln in locSrc.Lines) {
        Langs srcLang = CommonLib.LineIdToLang(ln.Line);
        foreach (var grp in ln.Groups) {
          foreach (var bk in grp.Books) {
            bk.Words = bk.Lessons.Sum(l => l.Words);
            bk.Phrases = bk.Lessons.Sum(l => l.Phrases);
            bk.LocCount = bk.Lessons.Sum(l => l.LocCount);
            //rewise lesson
            foreach (var les in bk.Lessons) {
              if (les.LocCount <= 0) continue; //lekce neni lokalizovana
              //dopln info o lokalizaci do crs2Rw Map.
              var crw = crs2RwMap.Values.FirstOrDefault(cm => cm.rwId == les.DbId); if (crw != null) crw.locRatioPromile = (int)(les.LocCount * 1000 / (les.Phrases + les.Words));
              //lekce
              Rew.LessonDataSrc res = new Rew.LessonDataSrc() {
                DbId = les.DbId,
                Facts = ((Rewise.SrcFact[])les.RewiseSrcFacts).Select(f => RwSound.createFact(f, srcLang, loc, sb)).ToArray()
              };
              writeFile(res, rewFileName(loc, string.Format("{0}\\{1}", lessDir(les.DbId), les.DbId)), false);
            }
          }
          grp.Words = grp.Books.Sum(l => l.Words);
          grp.Phrases = grp.Books.Sum(l => l.Phrases);
          grp.LocCount = grp.Books.Sum(l => l.LocCount);
        }
        ln.Words = ln.Groups.Sum(l => l.Words);
        ln.Phrases = ln.Groups.Sum(l => l.Phrases);
        ln.LocCount = ln.Groups.Sum(l => l.LocCount);
      }
      writeFile(locSrc, rewFileName(loc, "index"), true);
      writeFile(crs2RwMap, rewFileName(loc, "crs2RwMap"), true);

    });

  }

  public static void mergeLocalizations() {
    var locs = RWMeta.
      Where(m => Directory.Exists(textsPath + m.Name)).
      SelectMany(m => Directory.GetFiles(textsPath + m.Name)).
      Where(f => Path.GetFileName(f).Contains("-")).
      Select(f => XmlUtils.FileToObject<RwBooksLoc>(f)).
      GroupBy(l => RWMeta.First(m => m.Id == l.Id).Name).
      ToArray();
    foreach (var lg in locs) {
      var fn = textsPath + lg.Key + ".xml";
      var bk = XmlUtils.FileToObject<Rewise.Book>(fn);
      var changed = false;
      foreach (var loc in lg) mergeLoc(bk, loc, ref changed);
      if (changed) XmlUtils.ObjectToFile(fn, bk);
    }
  }

  static void mergeLoc(Rewise.Book bk, RwBooksLoc loc, ref bool changed) {
    if (!RwFactLoc.isEmpty(loc.Trans) || !RwFactLoc.isEmpty(loc.TransPerex) || !RwFactLoc.isEmpty(loc.AdminEMail)) {
      Rewise.LocaleBook lb = bk.adjustLoc(loc.Lang);
      if (lb.Text != loc.Trans) { changed = true; lb.Text = loc.Trans; }
      if (lb.Perex != loc.TransPerex) { changed = true; lb.Perex = loc.TransPerex; }
      if (lb.AdminEMail != loc.AdminEMail) { changed = true; lb.AdminEMail = loc.AdminEMail; }
    }
    foreach (var l in loc.Locs.Where(l => !l.isEmpty())) {
      if (RwIdManager.isFactId(l.Id)) {
        var side = bk.findFact(l.Id).adjustSide(loc.Lang); if (side.Text != l.Trans) { changed = true; side.Text = l.Trans; }
      } else if (RwIdManager.isLessonId(l.Id)) {
        var lc = bk.findLess((int)l.Id).adjustLoc(loc.Lang); if (lc.Text != l.Trans) { changed = true; lc.Text = l.Trans; }
      }
    }
  }

  public static void writeFile(Object obj, string fnNoExt, bool isIndex) {
    LowUtils.AdjustFileDir(fnNoExt);
    string json = JsonConvert.SerializeObject(obj, isIndex ? Newtonsoft.Json.Formatting.Indented : Newtonsoft.Json.Formatting.None);
    if (isIndex) File.WriteAllText(fnNoExt + ".json", json);
    json = Noesis.Lib.JSON2RJSON(json);
    //string crc = ZipStream.Crc(Encoding.UTF8.GetBytes(json)).ToString();
    File.WriteAllText(fnNoExt + ".rjson", json);
    //if (isIndex) File.WriteAllText(fnNoExt + ".rjson.crc", crc);
    using (Stream msOut = File.OpenWrite(fnNoExt + ".rjson.gzip")) {
      using (GZipStream gzip = new GZipStream(msOut, CompressionMode.Compress))
      using (StreamWriter wrg = new StreamWriter(gzip))
        wrg.Write(json);
    }
    //return crc;
  }
}
