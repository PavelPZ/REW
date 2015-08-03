//using CommonMark.Formatters;
//using CommonMark.Syntax;
using CourseModel;
using LMComLib;
using LMNetLib;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using System.Xml.Linq;

namespace CommonMark {

  public class panel : plugin {

    public panel(styleParams pars, context context) : base(pars, context) { }

    protected override XElement expandPlugin(string sourceStr, context context) {
      var panelType = this.pars.id == null || !panelTypeMask.IsMatch(this.pars.id) ? "default" : this.pars.id.ToLower();
      List<XNode[]> parts = new List<XNode[]>();
      foreach (var ri in regExItemPos.Parse(sourceStr, rowEndMask)) {
        if (ri.IsMatch) {
          if (parts.Count == 0) parts.Add(null); //sourceStr zacina oddelovacim ---- radkem
        } else {
          var nodes = LMHelper.parseString(sourceStr.Substring(ri.index, ri.length), innerIndex + ri.index, true, context).ToArray();
          parts.Add(nodes.Length == 0 ? null : nodes);
        }
      }
      var panelXml = new XElement("div", new XAttribute("class", "panel panel-" + panelType),
        parts.Count <= 0 || parts[0] == null ? null : new XElement("div", new XAttribute("class", "panel-heading"), parts[0]),
        parts.Count <= 1 || parts[1] == null ? null : new XElement("div", new XAttribute("class", "panel-body"), parts[1]),
        parts.Count <= 2 || parts[2] == null ? null : new XElement("div", new XAttribute("class", "panel-footer"), parts[2])
      );
      return new XElement("node", panelXml);
    }
    static Regex rowEndMask = new Regex(@"^\s*-{3,}\s*$", RegexOptions.Multiline);
    static Regex panelTypeMask = new Regex(@"^(primary|success|info|warning|danger)$", RegexOptions.Multiline | RegexOptions.IgnoreCase);
  }

  public class alert : plugin {

    public alert(styleParams pars, context context) : base(pars, context) { }

    protected override XElement expandPlugin(string sourceStr, context context) {
      var alertType = pars.id == null || !alertTypeMask.IsMatch(this.pars.id) ? "default" : this.pars.id.ToLower();
      var icon = pars.attrs.get("icon", null);
      object nodes = LMHelper.parseString(sourceStr, innerIndex, true, context);
      if (icon != null) {
        var ic = LMCInline.getIconElement("icon:" + icon);
        var attr = ic.Attribute("class"); attr.Value += " pull-left";
        nodes = XExtension.Create(ic, new XElement("div", new XAttribute("class","margin-l3"), nodes));
      } 
      return new XElement("node", new XElement("div", new XAttribute("class", "alert alert-" + alertType), nodes));
    }
    static Regex alertTypeMask = new Regex(@"^(default|success|info|warning|danger)$", RegexOptions.Multiline | RegexOptions.IgnoreCase);
  }


  public class pairing : plugin {

    public pairing(styleParams pars, context context) : base(pars, context) { }

    protected override XElement expandPlugin(string sourceStr, context context) {
      XNode[] lastLeft = null; List<pair> pairs = new List<pair>();
      foreach (var ri in regExItemPos.Parse(sourceStr, pairEndMask)) {
        if (ri.IsMatch) {
          pairs.Add(new pair { left = lastLeft, right = sourceStr.Substring(ri.index+2, ri.length-2) });
        } else {
          lastLeft = LMHelper.parseString(sourceStr.Substring(ri.index, ri.length), innerIndex + ri.index, true, context).ToArray();
        }
      }
      var res = smartElementLow.generate("pairing", pars);
      res.Add(pairs.Select(p => new XElement("pairing-item", new XAttribute("right", p.right), p.left)));
      return new XElement("node", res);
    }
    static Regex pairEndMask = new Regex(@"\|\|.+$", RegexOptions.Multiline);
    public class pair { public XNode[] left; public string right; }
  }

  public class offering : plugin {

    string id;
    smartOfferingMode mode;
    string words;

    public offering(styleParams pars, context context): base(pars, context) {
      smartElementTypes inlineType;
      id = "off-" + context.counter++.ToString();
      mode = pars.ids.Length<1 ? smartOfferingMode.gapFill : LowUtils.EnumParse<smartOfferingMode>(LowUtils.toCammelCase(pars.ids[0]), smartOfferingMode.gapFill);
      words = pars.ids.Length < 2 ? null : pars.ids[1];
      switch (mode) {
        case smartOfferingMode.gapFillPassive:
        case smartOfferingMode.gapFill: inlineType = smartElementTypes.gapFill; break;
        default: inlineType = smartElementTypes.dropDown; break;
      }
      pars.attrs["use-element"] = LowUtils.fromCammelCase(inlineType.ToString());
    }

    protected override XElement expandPlugin(string sourceStr, context context) {
      LoggerMemory wr = new LoggerMemory();
      var xml = base.expandPlugin(sourceStr, context);
      var offs = xml.Descendants("offering").ToArray();
      if (offs.Length > 1) { wr.ErrorLine("pg.url", "Only one offering allowed: " + id); return null; }
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
      off.SetAttributeValue("drop-down-mode", offMode.ToString());
      off.SetAttributeValue("id", id);
      if (!string.IsNullOrEmpty(words) && mode != smartOfferingMode.dropDownDiscard) off.SetAttributeValue("words", words);
      foreach (var ed in xml.Descendants().Where(e => e.Name.LocalName == "gap-fill" || e.Name.LocalName == "drop-down")) {
        ed.Add(new XAttribute("offering-id", id));
      }
      return xml;
    }
  }

}
