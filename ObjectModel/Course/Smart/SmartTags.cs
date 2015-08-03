using LMComLib;
using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Linq;
using System.Xml.Serialization;
using System.Text;
using System.Threading.Tasks;
using System.Xml;
using System.Xml.Linq;
using System.IO;
using LMNetLib;
using Newtonsoft.Json;
using System.Text.RegularExpressions;

namespace CourseModel {

  public partial class smartPairing {
    public override IEnumerable<tag> Generate(body pg, LoggerMemory wr) {
      if (string.IsNullOrEmpty(cdata)) yield break;
      //vytvor pary
      cdata = cdata.Replace("\r\n", "\n").Replace('\r', '\n');
      var lines = cdata.Split(new string[] { "||" }, StringSplitOptions.RemoveEmptyEntries).Select(l => l.Trim()).ToArray();
      List<NameValueString> pairs = new List<NameValueString>();
      pairs.Add(new NameValueString(lines[0], null));
      for (int i = 1; i < lines.Length - 1; i++) {
        var idx = lines[i].LastIndexOf('\n');
        pairs.Last().Value = lines[i].Substring(0, idx);
        pairs.Add(new NameValueString(lines[i].Substring(idx), null));
      }
      pairs.Last().Value = lines.Last();
      //levou stranu paru tvori markdown => expanduj do XML
      XElement res = new XElement("pairing", random ? new XAttribute("random", "true") : null, string.IsNullOrEmpty(id) ? null : new XAttribute("id", id), leftWidth == pairingLeftWidth.normal ? null : new XAttribute("left-width", leftWidth.ToString()));
      foreach (var pair in pairs) {
        var xml = markdownToXml(pair.Name, smartElementTypes.no, pg, wr);
        var item = new XElement("pairing-item", new XAttribute("right", pair.Value), xml.Nodes());
        res.Add(item);
      }
      yield return tag.FromElementNoCopy(res);
    }
  }

  public partial class smartOffering {
    public override IEnumerable<tag> Generate(body pg, LoggerMemory wr) {
      smartElementTypes inlineType;
      switch (mode) {
        case smartOfferingMode.gapFillPassive:
        case smartOfferingMode.gapFill: inlineType = smartElementTypes.gapFill; break;
        default: inlineType = smartElementTypes.dropDown; break;
      }
      return markdownToTags(inlineType, pg, wr, xml => {
        var offs = xml.Descendants("offering").ToArray();
        if (offs.Length > 1) { wr.ErrorLine(pg.url, "Only one offering allowed: " + id); return; }
        XElement off;
        if (offs.Length == 1) off = offs[0];
        else xml.AddFirst(off = new XElement("offering"));
        offeringDropDownMode offMode;
        switch (mode) {
          case smartOfferingMode.gapFillPassive: offMode = offeringDropDownMode.gapFillIgnore; break;
          case smartOfferingMode.gapFill: offMode = offeringDropDownMode.dropDownDiscard; break;
          case smartOfferingMode.dropDownDiscard: offMode = offeringDropDownMode.dropDownDiscard; break;
          case smartOfferingMode.dropDownKeep: offMode = offeringDropDownMode.dropDownKeep; break;
          default: throw new NotImplementedException();
        }
        off.Add(new XAttribute("drop-down-mode", offMode.ToString()), new XAttribute("id", id), string.IsNullOrEmpty(words) ? null : new XAttribute("words", words));
        foreach (var ed in xml.Descendants().Where(e => e.Name.LocalName == "gap-fill" || e.Name.LocalName == "drop-down")) {
          ed.Add(new XAttribute("offering-id", id));
        }
      });
    }
  }

  public partial class smartElement {

    public override IEnumerable<tag> Generate(body pg, LoggerMemory wr) {
      return markdownToTags(inlineType, pg, wr);
    }

  }

  //http://daringfireball.net/projects/markdown/syntax, http://www.toptensoftware.com/markdowndeep/ 
  public partial class smartElementLow {
    static smartElementLow() {
    }

    protected IEnumerable<tag> markdownToTags(smartElementTypes defaultInlineType, body pg, LoggerMemory wr, Action<XElement> finishXml = null) {
      var node = markdownToXml(cdata, defaultInlineType, pg, wr); if (node == null) yield break;
      node.Add(string.IsNullOrEmpty(styleSheet) ? null : new XAttribute("style-sheet", styleSheet));
      if (finishXml != null) finishXml(node);
      yield return tag.FromElementNoCopy(node);
    }

    protected static XElement markdownToXml(string cdata, smartElementTypes defaultInlineType, body pg, LoggerMemory wr) {
      if (string.IsNullOrEmpty(cdata)) return null;
      return CommonMark.LMHelper.Convert(cdata); //markdown expanze
      //XML expanze {} zavorek do XML s tagy
      //foreach (var txt in xml.DescendantNodes().OfType<XText>().ToArray()) expandInlines(txt, defaultInlineType, pg, wr);
      //return new XElement("node", xml.Elements());
    }

    //static string spanElements(string txt) {
    //} 
    //static string[] spanMaskItems = new string[] { 
    //  "size-h1", "size-h2", "size-h3", "size-h4", "size-h5", "size-h6", "size-small",
    //  "size-lg", "size-2x", "size-3x", "size-4x", "size-5x", 
    //  "label-primary", "label-default", "label-success", "label-info", "label-warning", "label-danger", 
    //  "text-muted", "text-primary", "text-success", "text-info", "text-warning", "text-danger", 
    //  "mark", "del", "u", 
    //  "pad-left-1", "pad-left-2", "pad-left-3", "pad-left-4", 
    //  "pad-right-1", "pad-right-2", "pad-right-3", "pad-right-4",
    //};
    //static Regex spanMask = new Regex(@"\{(?<cls>.*?)\*(?<block>.*?)\*\}", RegexOptions.Multiline);
    //static string[] iconStyleItems = new string[] { 
    //  "lg", "2x", "3x", "4x", "5x", 
    //  "fw", "border", "spin", "pulse", "pull-left",
    //};

    //static string[] blockStyleItems = new string[] { 
    //  "bg-primary", "bg-success", "bg-info", "bg-warning", "bg-danger", 
    //  "marg-top-1", "marg-top-2", "marg-top-3", "marg-top-4",
    //  "marg-bot-1", "marg-bot-2", "marg-bot-3", "marg-bot-4",
    //};

    //static string escapeInlineControlContent(string str) {
    //  StringBuilder sb = new StringBuilder();
    //  foreach (var ri in regExItem.Parse(str, regExtractInlineControls))
    //    if (!ri.IsMatch) sb.Append(ri.Value); else markdownEscape(ri.Value, sb);
    //  return sb.ToString();
    //} static Regex regExtractInlineControls = new Regex(@"{.*?}", RegexOptions.Singleline); //parse stringu na {} avorky

    //static IEnumerable<XNode> expandInlines(string txt, smartElementTypes defaultInlineType, body pg, LoggerMemory wr) {
    //  if (string.IsNullOrEmpty(txt)) yield break;
    //  var parts = regExItem.Parse(txt, CommonMark.LMHelper.inlineControlMask).ToArray();
    //  if (parts.Length == 0 || (parts.Length == 1 && !parts[0].IsMatch)) yield break;
    //  string capt;
    //  foreach (var ri in parts) {
    //    if (!ri.IsMatch) { yield return new XText(ri.Value); continue; }
    //    var typ = defaultInlineType;
    //    var tpStr = ri.match.get("tagId");
    //    if (!string.IsNullOrEmpty(tpStr))
    //      try { typ = LowUtils.EnumParse<smartElementTypes>(LowUtils.toCammelCase(tpStr)); } catch { wr.ErrorLine(pg.url, " Wrong Inline control type, use eg. {+gap-fill ...}"); continue; }
    //    if (typ == smartElementTypes.no) { wr.ErrorLine(pg.url, " Missing Inline control type, use eg. {+gap-fill ...}"); continue; }
    //    string body = string.IsNullOrEmpty(capt = ri.match.get("body")) ? null : capt;
    //    body = CommonMark.LMHelper.unEscape.Replace(body, m => m.Value.Substring(1));
    //    switch (typ) {
    //      case smartElementTypes.gapFill: yield return smartGapFillDropDown(body, true); break;
    //      case smartElementTypes.dropDown: yield return smartGapFillDropDown(body, false); break;
    //      case smartElementTypes.offering: yield return new XElement("offering"); break;
    //      case smartElementTypes.img: yield return new XElement("img", new XAttribute("src", body.Trim())); break;
    //      case smartElementTypes.wordSelection: yield return new XElement("word-selection", new XAttribute("words", body)); break;
    //      default: throw new NotImplementedException();
    //    }
    //  }
    //}  //parse stringu na {+gap-fill params} nebo {params}, ale ne {! } zavorky - to reseno by (?!\!)

    static void expandInlines(XText txt, smartElementTypes defaultInlineType, body pg, LoggerMemory wr) {
      throw new NotImplementedException();
      //var nodes = expandInlines(txt.Value, defaultInlineType, pg, wr).ToArray();
      //if (nodes.Length == 0) return;
      //txt.ReplaceWith(nodes);
    }

    static XElement smartGapFillDropDown(string body, bool isGapFill) {
      var parts = body.Split('|').Select(s => s.Trim()).ToList(); string initVal = null;
      if (isGapFill && parts[0].StartsWith("+")) {
        initVal = parts[0].Substring(1); parts.RemoveAt(0);
      }
      return new XElement(isGapFill ? "gap-fill" : "drop-down", initVal == null ? null : new XAttribute("init-value", initVal), new XAttribute("correct-value", parts.Aggregate((r, i) => r + "|" + i)));
    }

    public static XElement generate(string type, CommonMark.styleParams pars) {
      tag tg;
      switch (type) {
        case "gap-fill":
        case "drop-down":
          var isGapFill = type == "gap-fill";
          gapFill gf = isGapFill ? new gapFill() : null; dropDown dd = isGapFill ? null : new dropDown();
          edit ed = isGapFill ? (edit)gf : dd; tg = ed;
          ed.caseSensitive = pars.attrs.get("case-sensitive", null) == "true";
          ed.evalButtonId = pars.attrs.get("eval-btn-id", null);
          ed.evalGroup = pars.attrs.get("eval-group", null);
          ed.id = pars.id;
          ed.offeringId = pars.attrs.get("offering-id", null);
          ed.scoreWeight = int.Parse(pars.attrs.get("score-weight", "0"));
          ed.widthGroup = pars.attrs.get("smart-width", null);
          ed.width = int.Parse(pars.attrs.get("width", "0"));
          if (isGapFill) {
            gf.readOnly = pars.attrs.get("read-only", null) == "true";
            gf.skipEvaluation = pars.attrs.get("skip-evaluation", null) == "true";
            var idx = pars.values.FindIndex(p => p.Length > 0 && p[0] == '+'); if (idx >= 0) { gf.initValue = pars.values[idx].Substring(1); pars.values.RemoveAt(idx); }
            idx = pars.values.FindIndex(p => p.Length > 0 && p[0] == '`'); if (idx >= 0) { gf.hint = pars.values[idx].Substring(1); pars.values.RemoveAt(idx); }
          }
          ed.correctValue = pars.values.DefaultIfEmpty().Aggregate((r, i) => r + "|" + i);
          break;
        case "offering":
          offering of = new offering {
            id = pars.id,
            hidden = pars.attrs.get("case-sensitive", null) == "true",
            words = pars.valStr,
          };
          tg = of;
          break;
        case "img":
          img im = new img {
            id = pars.id,
            src = pars.valStr,
          };
          tg = im;
          break;
        case "word-selection":
          wordSelection ws = new wordSelection {
            evalButtonId = pars.attrs.get("eval-btn-id", null),
            evalGroup = pars.attrs.get("eval-group", null),
            id = pars.id,
            scoreWeight = int.Parse(pars.attrs.get("score-weight", "0")),
            words = pars.valStr,
          };
          tg = ws;
          break;
        case "pairing":
          pairing pr = new pairing {
            evalButtonId = pars.attrs.get("eval-btn-id", null),
            evalGroup = pars.attrs.get("eval-group", null),
            id = pars.id,
            scoreWeight = int.Parse(pars.attrs.get("score-weight", "0")),
            leftWidth = LowUtils.EnumParse<pairingLeftWidth>(pars.attrs.get("left-width", null).ToLower(), pairingLeftWidth.normal),
            leftRandom = pars.attrs.get("random", null) == "true",
          };
          tg = pr;
          break;
        default:
          throw new NotImplementedException();
      }
      return XmlUtils.toXml(tg);
    }

    public static XElement generate(string value, CommonMark.context context) {
      var pars = new CommonMark.styleParams(value);
      var type = pars.tag == null ? context.defaultElement() : pars.tag;
      return generate(type, pars);
    }
    public static XElement generate(string value, smartElementTypes defaultType = smartElementTypes.no) {
      var pars = new CommonMark.styleParams(value);
      var type = pars.tag == null ? LowUtils.fromCammelCase(defaultType.ToString()) : pars.tag;
      return generate(type, pars);
    }
  }
}
