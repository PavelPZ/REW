using LMComLib;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Xml.Linq;
using System.IO;
using System.Text.RegularExpressions;
using System.Text;
using LMNetLib;
using Newtonsoft.Json;
using System.Configuration;
using System.Threading.Tasks;

namespace OldToNew {

  public class exFile {
    public exFile(string fn) {
      url = fn.Substring(basicpath.Length).ToLower().Replace(".htm.aspx.lmdata", null).Replace('\\', '/');
    }
    public string url;
    public string newUrl { get { return newUrlPrefix + url; } }
    public string viewUrl(CourseMeta.oldeaDataType type) {
      switch (type) {
        case CourseMeta.oldeaDataType.no: return "about:blank";
        case CourseMeta.oldeaDataType.webOld: return string.Format("http://www.langmaster.cz/comcz{0}.htm", url);
        default: return string.Format("{0}Schools/NewEA.aspx?lang=cs-cz&a1y={1}&oldEaType={4}&url={5}#school@schoolexmodel@1@{2}@@/lm/oldea{3}", urlAuthor, loginHack(actWorker()), urlToProductName(url), url, type, newUrl);
      }
    }
    public static bool isLmData(string fn) { return fn.ToLower().EndsWith(".htm.aspx.lmdata"); }

    //************ url aritmetika
    public static string urlAuthor = ConfigurationManager.AppSettings["BasicUrl"];

    public static workers actWorker() {
      switch (Machines.machine) {
        case Machines.pz_comp: return workers.pz;
        case Machines.pj_comp: return workers.pj;
        case Machines.kz_comp: return workers.kz;
        case Machines.rj_comp:
        case "rj-w7-virtual": return workers.rj;
        case Machines.zz_comp:
        case "sharedvirtual": return workers.zz;
        default: throw new Exception("Unknown computer: " + Machines.machine);
      }
    }

    static string loginHack(workers w) {
      switch (w) {
        case workers.pz: return "b2c";
        case workers.zz: return "ws7";
        case workers.rj: return "73q";
        case workers.pj: return "pw6";
        case workers.kz: return "g3n";
        default: throw new NotImplementedException();
      }
    }

    string urlToProductName(string url) {
      var m = rxUrlToProd.Match(url.ToLower());
      var prod = m.Groups["lang"].Value + m.Groups["ext"].Value;
      int uidx;
      switch (prod) {
        case "english":
        case "englishe": uidx = 10; break;
        case "german": uidx = 5; break;
        case "russian": uidx = 3; break;
        default: uidx = 6; break;
      }
      return string.Format("/lm/{0}_0_{1}/", prod, uidx);
    }
    static Regex rxUrlToProd = new Regex(@"^/(?<lang>[a-z]+)\d(?<ext>e?)/.*");


    //************ ruzne formy file: lmdata, xml, old, transformavene, ...
    public object getFileContentLow(CourseMeta.oldeaDataType type, LoggerMemory logger) { //vrati string => xml string, @string => filename, XElement => xml
      //var logger = new LoggerMemory(false);
      switch (type) {
        case CourseMeta.oldeaDataType.lmdata: return "@" + fileName();
        case CourseMeta.oldeaDataType.lmdataNew:
          if (getMeta().isByHand()) {
            var fn = fileName(CourseMeta.oldeaDataType.lmdataNew);
            return File.Exists(fn) ? "@" + fn : null;
          } else {
            var res = CourseMeta.Lib.dataFromEAStr(newUrl, CourseMeta.oldeaDataType.lmdataNew, logger, removeOldEAPart);
            //XElement root = XElement.Load(fileName(), LoadOptions.PreserveWhitespace);
            //controlProp.adjust_child_attrs_all(root, null);
            //var trs = getTransforms();
            //if (trs != null) foreach (var tr in trs) trans.form(tr, root);
            return res;
          }
        case CourseMeta.oldeaDataType.xml: return CourseMeta.Lib.dataFromEAStr(newUrl, CourseMeta.oldeaDataType.lmdata, logger);
        case CourseMeta.oldeaDataType.xmlNew: return CourseMeta.Lib.dataFromEAStr(newUrl, CourseMeta.oldeaDataType.xmlNew, logger, removeOldEAPart);
        default: throw new NotImplementedException();
      }
    }
    public XElement getFileContentXml(CourseMeta.oldeaDataType type, LoggerMemory logger) {
      var obj = getFileContentLow(type, logger); if (obj == null) return null;
      if (obj is XElement) return (XElement)obj;
      var str = getFileContentString(type, logger);
      if (Convert.ToInt32(str[0]) == 65279) str = str.Substring(1);
      return str == null ? null : XElement.Parse(str);
    }
    public string getFileContentString(CourseMeta.oldeaDataType type, LoggerMemory logger) {
      var obj = getFileContentLow(type, logger); if (obj == null) return null;
      if (obj is XElement) return ((XElement)obj).ToString();
      var str = (string)obj; if (str.Length < 1) return null;
      return str[0] == '@' ? File.ReadAllText(str.Substring(1), Encoding.UTF8) : str;
    }
    public transforms[] getTransforms() { var grp = getGroup(); return grp == null || grp.transformIds == null || grp.transformIds.Length == 0 ? null : grp.transformIds; }
    public fileGroup getGroup() { return fileGroup.fileGroups.FirstOrDefault(g => g.urls.Contains(url)); }

    public bool toogleCheck() {
      var isChecked = getMeta().isChecked();
      if (isChecked) {
        //var newXmlFn = fileName(CourseMeta.oldeaDataType.xmlNew);
        //File.Delete(newXmlFn);
        if (!getMeta().isByHand()) {
          var newFn = fileName(CourseMeta.oldeaDataType.lmdataNew);
          File.Delete(newFn);
        }
        workerOper(exFile.actWorker(), wOper.checkDelete);
        return false;
      } else {
        if (!getMeta().isByHand()) makeNewLmdata();
        //new xml
        //LoggerMemory log = new LoggerMemory(false);
        //var newXmlFn = fileName(CourseMeta.oldeaDataType.xmlNew);
        //var newXml = getFileContentXml(CourseMeta.oldeaDataType.xmlNew, log);
        //newXml.Save(newXmlFn);
        workerOper(exFile.actWorker(), wOper.check);
        return true;
      }
    }

    public void toogleByHand() {
      var fn = fileName(); var newFn = fileName(CourseMeta.oldeaDataType.lmdataNew);
      var isHand = getMeta().isByHand();
      if (isHand != File.Exists(newFn)) throw new Exception();
      if (isHand) {
        File.Delete(newFn);
        workerOper(exFile.actWorker(), wOper.byHandDelete);
      } else {
        makeNewLmdata();
        workerOper(exFile.actWorker(), wOper.byHand);
      }
    }

    void makeNewLmdata() {
      LoggerMemory log = new LoggerMemory(false);
      //transformed do new lmdata
      var transformed = getFileContentXml(CourseMeta.oldeaDataType.lmdataNew, log);
      var newFn = fileName(CourseMeta.oldeaDataType.lmdataNew);
      transformed.Element(html + "head").Elements(html + "script").Remove();
      transformed.Save(newFn);
    }


    public IEnumerable<CourseMeta.oldeaDataType> alowedView() {
      yield return CourseMeta.oldeaDataType.xml;
      yield return CourseMeta.oldeaDataType.xmlNew;
      yield return CourseMeta.oldeaDataType.webOld;
    }

    public static string getServerScript(string url, CourseMeta.oldeaDataType dataType, LoggerMemory logger) {
      url = url.ToLower(); if (!url.StartsWith(newUrlPrefix)) return null;
      url = url.Substring(newUrlPrefix.Length);
      exFile fileEx;
      if (!OldToNew.fileGroup.getAllFiles().TryGetValue(url, out fileEx)) return null;
      return fileEx.getFileContentString(dataType, logger);
    }

    public static void getAllServerScript(LoggerMemory logger, Action<exFile,string> saveXmlNew) {
      foreach (var fileEx in fileGroup.getAllFiles().Values) {
        var fn = fileEx.fileName(CourseMeta.oldeaDataType.xmlNew).Replace(@"\oldea\", @"\oldea-new\");
        if (File.Exists(fn)) continue;
        var xml = fileEx.getFileContentString(CourseMeta.oldeaDataType.xmlNew, logger); if (xml == null) continue;
        LowUtils.AdjustFileDir(fn);
        File.WriteAllText(fn, xml);
      }
    }


    //********** meta informace (obsah <script type="text/meta" tagu v .lmdata souboru)
    public void workerOper(workers w, wOper oper) {
      var lmd = XElement.Load(fileName());
      //adjust script a lmdataMeta
      var script = lmd.Element(html + "head").Elements(html + "script").Where(s => s.AttributeValue("type") == "text/meta").FirstOrDefault();
      lmdataMeta mt = null;
      if (script == null) lmd.Element(html + "head").Add(script = new XElement(html + "script", new XAttribute("type", "text/meta")));
      else mt = LMJson.Decode<lmdataMeta>(script.Value);
      if (mt == null) mt = new lmdataMeta();
      if (mt.history == null) mt.history = new List<lmdataMeta.item>();
      //add to history
      DateTime dt = DateTime.Now;
      mt.history.Add(new lmdataMeta.item { date = LowUtils.dateToNum(dt), oper = oper, worker = w, fileGroup = _actFileGroup });
      //save history
      script.Value = LMJson.Encode(mt, true);
      lmd.Save(fileName());
      refreshMeta(lmd);
    }

    public lmdataMeta getMeta(XElement root = null) {
      if (_meta == null) {
        if (root == null) root = XElement.Load(fileName());
        var script = root.Element(html + "head").Elements(html + "script").Where(s => s.AttributeValue("type") == "text/meta").FirstOrDefault();
        _meta = script == null ? new lmdataMeta() : JsonConvert.DeserializeObject<lmdataMeta>(script.Value);
      }
      return _meta;
    } lmdataMeta _meta;

    public void refreshMeta(XElement root = null) {
      _meta = null;
      if (root != null) _meta = getMeta(root);
    }

    void removeOldEAPart(XElement root) {
      root.Element("body").Attributes().Where(a => a.Name.LocalName == "old-ea-is-passive" || a.Name.LocalName == "is-old-ea").Remove();
      root.Descendants("script").Remove();
    }
    //****** obsah lmdata: xml, eval kontrolky, jmena eval kontrolek
    void statInit() {
      if (_statContent != null) return;
      var fn = fileName();
      _statContent = File.Exists(fn) ? XElement.Load(fn) : null;
      if (_statContent == null) return;
      controlProp.adjust_child_attrs_all(_statContent, null);
      statChildAttrs = new List<xref>();
      _statChildAttrExpanded = XElement.Load(fn); controlProp.adjust_child_attrs_all(_statChildAttrExpanded, statChildAttrs);
      foreach (var xr in statChildAttrs) xr.file = url;
      _statControls = StatLib.allControls(this.statContent, false).Where(c => c.Name.LocalName != "table" || c.AttributeValue("start_with") == "evalControl").ToArray(); //table je dulezita pouze s eval statControls
      _statNames = this.statControls.Select(c => c.Name.LocalName).Distinct().ToArray();
    }
    public XElement statContent { get { statInit(); return _statContent; } } XElement _statContent;
    public XElement statChildAttrExpanded { get { statInit(); return _statChildAttrExpanded; } } XElement _statChildAttrExpanded;
    public XElement[] statControls { get { statInit(); return _statControls; } } XElement[] _statControls;
    public List<xref> statChildAttrs;
    public string[] statNames { get { statInit(); return _statNames; } } string[] _statNames;

    //File path etc
    public string tempFileName(CourseMeta.oldeaDataType type) { return url.Substring(1).Replace('/', '-') + "." + type.ToString() + ".xml"; }
    public string fileName(CourseMeta.oldeaDataType type = CourseMeta.oldeaDataType.lmdata) { return urlToFile(url, type); }
    public static string fileToUrl(string fn) {
      return fn.ToLower().Split(new string[] { "\\eduauthornew\\" }, 2, StringSplitOptions.RemoveEmptyEntries)[1].Replace(".htm.aspx.lmdata", null).Replace('\\', '/');
    }
    public static string urlToFile(string url, CourseMeta.oldeaDataType type) {
      var fnUrl = url.Replace('/', '\\'); var prefixFn = newUrlPrefix.Replace('/', '\\');
      switch (type) {
        case CourseMeta.oldeaDataType.lmdata: return basicpath + fnUrl + ".htm.aspx.lmdata";
        case CourseMeta.oldeaDataType.lmdataNew: return basicpath + fnUrl + ".new.xml";
        case CourseMeta.oldeaDataType.xml: return Machines.rootDir + prefixFn + fnUrl + ".xml";
        case CourseMeta.oldeaDataType.xmlNew: return Machines.rootDir + prefixFn + fnUrl + ".new.xml";
        default: throw new NotImplementedException();
      }
    }
    public static string basicpath = Machines.basicPath + @"rew\EduAuthorNew".ToLower();
    public static string dataBasicPath = Machines.basicPath + @"rew\OldToNewData\".ToLower();
    public static string fileGroupPath = dataBasicPath + @"fileGroups\".ToLower();
    public const string newUrlPrefix = "/lm/oldea";
    public static XNamespace lm = "lm";
    public static XNamespace html = "htmlPassivePage";

    public static string actFileGroup {
      get { return _actFileGroup; }
      set {
        var val = value.ToLower().Split(new string[] { @"oldtonewdata\filegroups\" }, StringSplitOptions.RemoveEmptyEntries);
        if (val.Length != 2) { _actFileGroup = null; return; }
        //if (!val.StartsWith(fileGroupPath)) { _actFileGroup = null; return; }
        _actFileGroup = removeStartMask.Replace(val[1].Split('.')[0], "");
      }
    } static string _actFileGroup; static Regex removeStartMask = new Regex(@"^\d\d-");

  }

  //***** metadata s historii
  public enum workers { pz, zz, pj, rj, kz }
  public enum wOper { no, check, checkDelete, byHand, byHandDelete }; //, handCheck }

  public class lmdataMeta {
    public class item {
      public workers worker;
      public int date; //datum operace
      [JsonIgnore]
      public excelReport.dataHelper repDate { get { return _repDate ?? (_repDate = new excelReport.dataHelper(0, date, 0)); } } excelReport.dataHelper _repDate;
      public string fileGroup;
      public wOper oper;
      public string title {
        get {
          var dt = LowUtils.numToDate(date);
          return string.Format("{0} - {1} - {2}", worker, oper, dt.ToShortDateString() + " " + dt.ToShortTimeString());
        }
        set { }
      }
    }
    public class repInfo {

    }
    public List<item> history;

    public bool isChecked() {
      if (history == null) return false;
      return history.Last().oper == wOper.check;
    }
    public bool isByHand() {
      if (history == null) return false;
      return history.Reverse<item>().Select(h => h.oper).FirstOrDefault(h => h == wOper.byHand || h == wOper.byHandDelete) == wOper.byHand;
    }
    public string repFileGroup() { if (history == null) return null; return history.Select(h => h.fileGroup).Where(fg => fg != null).FirstOrDefault(); }
    public string repStatus() { var ch = isChecked(); return isByHand() ? (ch ? "CHECKED BY HAND" : "BY HAND") : (ch ? "CHECKED" : "-"); }
    public item repChecked(bool forByHand) { if (history == null) return null; if (history.Last().oper != wOper.check || (isByHand() != forByHand)) return null; return history.Last(); }
    public item repByHand() { if (history == null) return null; var res = history.Reverse<item>().FirstOrDefault(h => h.oper == wOper.byHand || h.oper == wOper.byHandDelete); return res == null ? null : (res.oper == wOper.byHand ? res : null); }
  }


  //property kontrolky a knihovna na child_attrs
  public class controlProp {

    public controlProp(string name, string prop) { this.name = name; this.prop = prop; }
    public string name; //jmeno kontrolky
    public string prop; //jmeno property

    //validni controls.prop jsou v D:\LMCom\rew\OldToNewData\props.txt, udelej z nich lookup tabulku
    static controlProp() {
      var fn = Machines.basicPath + @"rew\OldToNewData\props.txt";
      var ctrlProps = !File.Exists(fn) ? Enumerable.Empty<controlProp>() : File.ReadAllLines(fn).Select(l => l.Split('.')).Where(p => p[1] != "child_attrs").Select(p => new controlProp(p[0], p[1]));
      props = (Lookup<string, controlProp>)ctrlProps.ToLookup(cp => cp.name);
    }
    public static Lookup<string, controlProp> props; //tabulka kontrolka => jeji properties

    public static void adjust_child_attrs_all(XElement root, List<xref> statUssage) { //probubla child atributy do kontrolky a (statUssage!=null) zaeviduje jejich pouziti
      foreach (var el in StatLib.allControls(root, false)) adjust_child_attrs(el, statUssage);
      //lm table hack (BT 2118)
      foreach (var ctrl in root.Descendants().Where(el => StatLib._controlsName.Contains(el.Name.LocalName) && el.Parent.Name.LocalName == "table").ToArray()) {
        var c = new XElement(exFile.lm + "control");
        ctrl.ReplaceWith(c);
        c.Add(ctrl);
      }
      //var cnt = 0;
      //foreach (var trans in root.Descendants(exFile.html + "trans").Where(t => !t.Descendants().Any()).ToArray()) {
      //  trans.ReplaceWith("{{t" + (cnt++).ToString() + "|" + trans.InnerXml().Replace('\r', ' ').Replace('\n', ' ').Replace(" xmlns=\"htmlPassivePage\"", null) + "}}");
      //}
    }

    public static void adjust_child_attrs(XElement el, List<xref> statUssage) {
      Dictionary<string, string> propValues = getControlPropValues(el); //hodnoty (validnich) control properties
      foreach (var parent in el.Parents(false)) useParentChildAttr(parent, el.Name.LocalName, propValues, statUssage);
      foreach (var kv in propValues) el.SetAttributeValue(kv.Key, kv.Value);
    }
    //k kontrolce vrati hodnoty (validnich) properties
    public static Dictionary<string, string> getControlPropValues(XElement el) {
      var res = new Dictionary<string, string>();
      var my = props[el.Name.LocalName];
      foreach (var p in my) {
        var a = el.Attribute(p.prop); if (a == null) continue;
        res[p.prop] = a.Value;
      }
      return res;
    }
    static void useParentChildAttr(XElement parent, string myTagName, Dictionary<string, string> myPropsValues, List<xref> statUssage) {
      var ch = parent.Attribute("child_attrs"); if (ch == null) return;
      foreach (var cha in ch.Value.Split(new char[] { ';', ' ' }, StringSplitOptions.RemoveEmptyEntries).Select(t => t.Trim().Split(new char[] { '-', ':' })).Where(t => t[0] == myTagName || t[0] == "all")) {
        if (myPropsValues.ContainsKey(cha[1])) continue;
        myPropsValues.Add(cha[1], cha[2] == "@this" ? adjustIdAttr(parent) : cha[2]);
        if (statUssage != null) {
          statUssage.Add(new xref {
            tag = myTagName,
            propValue = cha[0] + "." + (cha[2] == "@this" ? cha[1] + ".this" : cha[1]),
            prop = "child_attrs",
          });
        }
      }
    }
    static string adjustIdAttr(XElement el) { //zajisti existenci id atributu, kvuli @this child_attrs
      var a = el.Attribute("id"); if (a != null) return a.Value;
      var res = "v" + (cnt++).ToString();
      el.SetAttributeValue("id", res);
      return res;
    }
    static int cnt = 0;
  }

  public static class handler {
    //XXX1
    public static void oldToNewTransform(XElement root, exFile fileEx) {
      controlProp.adjust_child_attrs_all(root, null);
      var trs = fileEx.getTransforms();
      if (trs != null) foreach (var tr in trs) trans.form(tr, root);
      LMScormLibDOM.oldToNewSound.transformedXml = root.ToString();
    }
    //public static string onReadNewEAFile(CourseMeta.oldeaDataType dt, string fn) {
    //  if (!exFile.isLmData(fn)) return File.ReadAllText(fn, Encoding.UTF8);
    //  var f = new exFile(fn);
    //  LoggerMemory log = new LoggerMemory(false);
    //  return log.hasError ? log.LogHtml() : LMScormLibDOM.oldToNewSound.transformedXml = f.getFileContentString(dt, log);
    //}
  }


}
namespace LMScormLibDOM {
  //do sound_sentence.oldToNewXml a sound_dialogRole.oldToNewXml da XML ke generaci do newXml
  public static class oldToNewSound {
    public static void run(LMGroupSound root) {
      if (!LMScormLib.HTTPModule.Hack()) return;
      int oldIdIdx = 1;
      foreach (LMGroupSound snd in root) {
        if (snd.sound.ignoreSound() != sound_dialogIgnore_sound.no) continue;
        var sentsAll = sentFromGroup(snd).ToArray();
        var sents = sentsAll.Where(s => s.self != null).ToArray();
        //kontroly
        if (sents.Select(s => s.url).Distinct().Count() != 1) throw new Exception("OLD NEW DATA ERROR: by hand operation needed for sound: two files per sound group exists");
        var isDialog = sents[0].replica != null;
        if (!sents.All(s => (s.replica != null) == isDialog)) throw new Exception("OLD NEW DATA ERROR: by hand operation needed for sound: mix of replica and not replica sentences");
        //doplneni XML do replik nebo do sentences
        XElement cutXml = null; XElement lastMediaText = null; int sentOrder_subset = 0;
        if (isDialog) {
          var repls = sents.GroupBy(s => s.replica).ToArray();
          foreach (var repl in repls) {
            var actMediaTextId = "on_" + (oldIdIdx++).ToString();
            //sound mark
            if (snd.mark != null && lastMediaText == null)
              snd.mark.oldToNewXml = new XElement("media-big-mark", new XAttribute("share-media-id", actMediaTextId));
            repl.Key.oldToNewXml = new XElement("media-text", new XAttribute("id", actMediaTextId), new XAttribute("subset", sentOrder_subset.ToString()),
              new XAttribute("is-old-to-new", "true"), repl.First().self.layout == sentenceStyle_Type.hidden ? new XAttribute("hidden", "true") : null);
            sentOrder_subset++;
            if (lastMediaText != null)
              lastMediaText.Add(new XAttribute("continue-media-id", actMediaTextId));
            lastMediaText = repl.Key.oldToNewXml;
            if (cutXml == null)
              repl.Key.oldToNewXml.Add(cutXml = new XElement("cut-dialog", new XAttribute("media-url", repl.First().url)));
            cutXml.Add(new XElement("replica", repl.Select(r => r.sentXml), repl.Key.role_text == null ? null : new XAttribute("actor-name", repl.Key.role_text), repl.Key.role_icon == sound_dialogRoleRole_icon.no ? null : new XAttribute("actor-id", repl.Key.role_icon.ToString().ToLower())));
          }
        } else {
          foreach (var sent in sents.Where(s => s.self != null)) {
            var actMediaTextId = "on_" + (oldIdIdx++).ToString();
            //sound mark
            if (snd.mark != null && lastMediaText == null)
              snd.mark.oldToNewXml = new XElement("media-big-mark", new XAttribute("share-media-id", actMediaTextId));
            sent.self.oldToNewXml = new XElement("media-text", new XAttribute("id", actMediaTextId), new XAttribute("subset", sent.sentOrder.ToString()),
              new XAttribute("is-old-to-new", "true"), sent.self.layout == sentenceStyle_Type.hidden ? new XAttribute("hidden", "true") : null);
            if (lastMediaText != null)
              lastMediaText.Add(new XAttribute("continue-media-id", actMediaTextId));
            lastMediaText = sent.self.oldToNewXml;
            if (cutXml == null)
              sent.self.oldToNewXml.Add(cutXml = new XElement("cut-text", new XAttribute("media-url", sent.url), sentsAll.Select(s => s.sentXml)));
          }
        }
      }
    }

    public static IEnumerable<sent> sentFromGroup(LMGroupSound snd) {
      //transformovana lmdata - zjisti lmdata XML s sentences
      Dictionary<string, XElement> sentsXml;
      if (transformedXml != null) {
        var xml = XElement.Parse(transformedXml);
        xml.Descendants().Select(el => el.Name = el.Name.LocalName).ToArray(); //odstran namespace
        sentsXml = xml.Descendants("sound_sentence").ToDictionary(s => s.AttributeValue("id"), s => s);
      } else
        sentsXml = new Dictionary<string, XElement>();
      //transformedXml = null;
      bool? isDialog = null; int sentOrder = 0;
      foreach (var interval in snd.Cast<LMGroupSound>()) {
        if (isDialog == true) throw new Exception("OLD NEW DATA ERROR: by hand operation needed for sound: more than 2 intervals in dialog");
        var oldEndPos = -1;
        string sid, gid, u; sent lastSent = null;
        interval.markers.getObjId(out sid, out gid, out u);
        yield return new sent() { url = "/" + u, sentOrder = sentOrder++, self = null, sentXml = new XElement("phrase", new XAttribute("beg-pos", "0"), new XAttribute("end-pos", "0")) };
        foreach (sound_sentence sent in interval) {
          LMScormLib.Marker mark = interval.markers[sent.markIdx];
          var res = new sent() { url = "/" + u, sentOrder = sentOrder++, self = sent };
          XElement xml = null;
          if (!string.IsNullOrEmpty(sent.id) && sentsXml.TryGetValue(sent.id, out xml)) {
            var desc = xml.DescendantNodes().ToArray();
            if (desc.Length == 0) xml = null;
            else if (desc.Length == 1 && desc[0] is XText && string.IsNullOrEmpty(((XText)desc[0]).Value.Trim(new char[] { '\r', '\n', '\t', ' ' }))) xml = null;
            if (xml != null) { //http://bt.langmaster.cz/com/edit_bug.aspx?id=2139: Obrázek uvnitř lm:sound_sentence má chybnou url aritmetiku
              foreach (var src in xml.Descendants("img").SelectMany(n => n.Attributes("src"))) {
                if (src.Value.StartsWith("~")) src.Value = src.Value.Substring(2).ToLower();
              }
            }
          }
          //dialog?
          res.replica = sent.myReplica();
          if (isDialog == null) isDialog = res.replica != null; else if (isDialog != (res.replica != null)) throw new Exception("OLD NEW DATA ERROR: by hand operation needed for sound: isDialog != (myRole!=null)");
          //ignoreSound
          //res.ignoreSound = getIgnoreSound(sent);
          //if (ignoreSound == null) ignoreSound = res.ignoreSound; else if (ignoreSound != res.ignoreSound) throw new Exception("ignoreSound != res.ignoreSound");
          var oldb = (int)(mark.Beg / 10000);
          if (lastSent != null) {
            oldb = (int)((oldEndPos + oldb) / 2);
            lastSent.sentXml.SetAttributeValue("end-pos", oldb.ToString());
          }
          oldEndPos = (int)(mark.End / 10000);
          res.sentXml = new XElement("phrase", new XAttribute("beg-pos", oldb.ToString()), new XAttribute("end-pos", oldEndPos.ToString()), xml == null ? (Object)mark.Title : xml.Nodes());
          lastSent = res;
          yield return res;
        }
      }
    } public static string transformedXml;
    public static sound_dialogRole myReplica(this sound_sentence sent) {
      LMScormObj ctrl = sent;
      while (ctrl != null) {
        if (ctrl is sound_dialogRole) return (sound_dialogRole)ctrl;
        ctrl = ctrl.Owner;
      }
      return null;
    }
    public class sent {
      public sound_sentence self;
      public XElement sentXml;
      public sound_dialogRole replica;
      public sound_dialogIgnore_sound ignoreSound;
      public int sentOrder;
      public string url;
    }
  }

}