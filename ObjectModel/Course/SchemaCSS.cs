//http://www.modeltext.com/

using LMComLib;
using LMNetLib;
using ModelText.ModelCssData;
using ModelText.ModelCssInterfaces.Data;
using ModelText.ModelCssInterfaces.Dom;
using Newtonsoft.Json;
using System;
using System.Collections;
using System.Collections.Generic;
using System.ComponentModel;
using System.Configuration;
using System.IO;
using System.Linq;
using System.Reflection;
using System.Text;
using System.Text.RegularExpressions;
using System.Web;
using System.Xml;
using System.Xml.Linq;
using System.Xml.Serialization;

namespace CourseModel {

  public class DomElement : IDomElement {

    public DomElement(XElement el) {
      name = el.Name.LocalName;
      cls = el.AttributeValue("class");
      id = el.AttributeValue("id");
      if (name != typeof(body).Name) parent = new DomElement(el.Parent);
      uniqueId = cnt++.ToString();
      this.el = el;
    }
    DomElement parent;
    XElement el;
    string cls;
    string name;
    string id;
    string uniqueId;
    static int cnt = 0;

    string IDomElement.getAttribute(string name) {
      switch (name) {
        case "class": return cls;
        case "style": return null;
        case "id": return id;
        default: return el.AttributeValue(name);
      }
    }
    IDomElement IDomElement.parent { get { return parent; } }
    IDomElement IDomElement.previousSibling { get { throw new NotImplementedException(); } }
    string IDomElement.tagName { get { return name; } }
    string IDomElement.toString() { return uniqueId; }
  }


  public static class CSS {

    public static void applyCSS(ref body pg, CourseMeta.ex ex) {
      //all styles (LM and CSS) from tags
      foreach (var tg in pg.scan()) {
        var hasSheet = !string.IsNullOrEmpty(tg.styleSheet);
        if (hasSheet) pg.bodyStyle += "" + CSS.prefixTagId(tg.id, tg.styleSheet);
        tg.styleSheet = null;
      }
      //all styles (LM and CSS) from parents
      CourseMeta.data p = ex; StringBuilder sb = new StringBuilder(pg.bodyStyle);
      while (p != null) { if (!string.IsNullOrEmpty(p.styleSheet)) sb.Insert(0, p.styleSheet.Trim() + " "); p = p.parent; }
      sb.Insert(0, CourseMeta.ex.stdStyle);
      pg.bodyStyle = sb.ToString();

      //separate LM a CSS styles
      rules lmCss = separateLM_CSS_styles(pg);
      if (lmCss == null) return;

      //apply LM styles to XML
      XElement root = pg.ToElement();
      var bodyTags = root.Element("body").DescendantsAndSelf();
      foreach (var ctrl in bodyTags.Where(c => Lib.courseModelJsonMLMeta.allCSControls.Contains(c.Name.LocalName))) {
        var html = new DomElement(ctrl); var typeMeta = Lib.courseModelJsonMLMeta.types[ctrl.Name.LocalName];
        var attrsSpecs = new Dictionary<string, specificity>(); //nejlepsi hodnoty pro kazdou property
        for (var i = lmCss.lmRules.Count - 1; i >= 0; i--) { //jednotilve rule
          var spec = lmCss.lmRules[i].data.matchesSelectors(html, null); if (spec == null) continue;
          foreach (var prop in lmCss.lmRules[i].props.Where(pr => typeMeta.allProps.ContainsKey(pr.name))) { //jednotlive rule properties
            specificity sp;
            if (!attrsSpecs.TryGetValue(prop.name, out sp) || sp.I_am_worse(spec, prop.important))
              attrsSpecs[prop.name] = new specificity(spec, prop.important, prop.value); //nova nebo lepsi value
          }
        }
        //dosad values do XML
        foreach (var kv in attrsSpecs) { var at = ctrl.Attribute(kv.Key); if (at != null) continue; ctrl.Add(new XAttribute(kv.Key, kv.Value.value)); }
      }

      //zpracuj cssTagIds properties
      //foreach (var attr in bodyTags.SelectMany(el => el.Attributes()).Where(a => Lib.courseModelJsonMLMeta.allCssTagIds.Contains(a.Parent.Name.LocalName + "." + a.Name.LocalName))) {
      //  attr.Value = cssTagRx.Replace(attr.Value, m => {
      //    var ruleTxt = m.Groups["selector"].Value + " {}";
      //    var rule = CssDataFactory.parseStylesheet(ruleTxt).getRulesets(CssDataFactory.defaultMedium).First();
      //    return bodyTags.Where(el => rule.matchesSelectors(new DomElement(el), null) != null).Select(el => "#" + el.AttributeValue("id")).Where(id => id != "#").Aggregate((r, i) => r + "|" + i);
      //  });
      //}

      //body from XML
      pg = tag.FromElement<body>(root);
    }
    static Regex cssTagRx = new Regex(@"#\((?<selector>.*?)\)", RegexOptions.Singleline);

    //pro jednu property: matched hodnota z specificity (vzdy se pamatuje nejspecifistejsi hodnota pro kazdou matched property)
    public class specificity {
      public specificity(ICssSpecificityData spec, bool important, string value) { this.spec = spec; this.important = important; this.value = value; }
      public bool I_am_worse(ICssSpecificityData spec, bool important) {
        if (!this.important && important) return true;
        if (this.important && !important) return false;
        return this.spec.CompareTo(spec) < 0;
      }
      public ICssSpecificityData spec;
      public bool important;
      public string value;
    }

    //obohat tag.styleSheet selektory a tag ID
    public static string prefixTagId(string id, string sheet) {
      StringBuilder sb = new StringBuilder();
      var obj = parseCSS(sheet);
      foreach (var rule in obj) {
        //sb.Append(rule.src.Selectors.Select(s => "#" + id + (s.SimpleSelectors.ToString() == "self" ? null : " " + s.ToString())).Aggregate((r, i) => r + ", " + i));
        sb.Append(rule.src.Selectors.Select(s => replaceSelf(s, id)).Aggregate((r, i) => r + ", " + i));
        sb.Append(" {");
        foreach (var prop in rule.props) prop.ToBuilder(sb);
        sb.Append("} ");
      }
      return sb.ToString();
    }
    static string replaceSelf(BoneSoft.CSS.Selector sel, string id) {
      var isSelf = false;
      for (var i = 0; i < sel.SimpleSelectors.Count; i++) {
        if (sel.SimpleSelectors[i].ElementName != "self") continue;
        isSelf = true;
        sel.SimpleSelectors[i] = new BoneSoft.CSS.SimpleSelector { ID = id };
      }
      if (!isSelf) sel.SimpleSelectors.Insert(0, new BoneSoft.CSS.SimpleSelector { ID = id });
      return sel.ToString();
    }

    //z sheet style roztridi LM styles (a zpracuje je do rules) a zbytek (normalni CSS styly)
    static rules separateLM_CSS_styles(body pg) {
      if (string.IsNullOrEmpty(pg.bodyStyle)) return null;
      rules res = null;
      StringBuilder htmlCss = new StringBuilder("\r\n");
      StringBuilder htmlCssComment = new StringBuilder();
      StringBuilder lmCss = new StringBuilder(); //pouze selektor a prazdna {}
      //*** simple CSS parser:
      var obj = parseCSS(pg.bodyStyle);
      foreach (var rule in obj) {
        bool isAnyHtml = false; List<ruleProp> lmProps = null;
        foreach (var prop in rule.props) {
          var whichProp = Lib.courseModelJsonMLMeta.isLMProp(prop.name);
          var isLm = whichProp != false; var isHtml = whichProp != true;
          if (isLm) {
            if (res == null) res = new rules { lmRules = new List<rule>() };
            if (lmProps == null) {
              res.lmRules.Add(new rule { selector = rule.selector, props = lmProps = new List<ruleProp>() });
              lmCss.AppendLine(rule.selector + " {}");
              htmlCssComment.AppendLine(rule.selector + " {");
            }
            lmProps.Add(prop);
            htmlCssComment.Append("  "); prop.ToBuilder(htmlCssComment);
          }
          if (isHtml) {
            if (!isAnyHtml) { htmlCss.AppendLine(rule.htmlSelector + " {"); isAnyHtml = true; }
            htmlCss.Append("  "); prop.ToBuilder(htmlCss);
          }
        }
        if (isAnyHtml) htmlCss.AppendLine("}"); if (lmProps != null) htmlCssComment.AppendLine("}");
      }
      pg.bodyStyle = htmlCss.ToString() + "/*\r\n" + htmlCssComment.ToString() + "*/\r\n";

      //*** ModelText parsing
      if (res != null) res.finish(lmCss.ToString()); //merge simple CSS rules o ICssRulesetData

      return res;
    }

    ////nahrada element selectoru by class
    //static string transformSelectorsForHtml(BoneSoft.CSS.RuleSet src) {
    //  foreach (var sel in src.Selectors) {
    //    foreach (var ss in sel.SimpleSelectors) {
    //      if (string.IsNullOrEmpty(ss.ElementName)) continue;
    //    }
    //  }
    //}

    public class rule {
      public BoneSoft.CSS.RuleSet src;
      public string selector; //selectors
      public string htmlSelector; //selectors s nahrazenymi LM tagy (napr gap-fill) by class (napr. cli-gapfill)
      //public string[] selectors;
      public string propsStr;
      public List<ruleProp> props;
      public ICssRulesetData data;
    }
    public class ruleProp {
      public BoneSoft.CSS.Declaration src;
      public string name;
      public string value;
      public bool important;
      public void ToBuilder(StringBuilder sb) { sb.Append(name); sb.Append(": "); sb.Append(value); if (important) sb.Append(" !important"); sb.Append(";"); }
    }

    public class rules {
      public List<rule> lmRules;
      public bool finish(string lmCss) {
        var rules = CssDataFactory.parseStylesheet(lmCss).getRulesets(CssDataFactory.defaultMedium).ToArray();
        if (rules.Length == 0 && lmRules.Count == 0) return false;
        if (rules.Length != lmRules.Count) throw new Exception("rules.Length != res.lmRules.Count");
        for (var i = 0; i < rules.Length; i++) lmRules[i].data = rules[i];
        return true;
      }
    }

    //simple CSS parsing
    public static rule[] parseCSS(string sheet) {
      BoneSoft.CSS.CSSParser parser = new BoneSoft.CSS.CSSParser();
      parser.ParseText(sheet);
      var css = parser.CSSDocument.ToString();
      return parser.CSSDocument.RuleSets.Select(rs => new rule {
        src = rs,
        selector = rs.Selectors.Select(s => s.ToString()).Aggregate((r, i) => r + ", " + i),
        htmlSelector = rs.Selectors.Select(s => selToHtmlVariant(s)).Aggregate((r, i) => r + ", " + i),
        props = rs.Declarations.Select(d => new ruleProp { src = d, name = d.Name, important = d.Important, value = d.Expression.ToString() }).ToList(),
      }).ToArray();
    }
    static string selToHtmlVariant(BoneSoft.CSS.Selector sel) {
      var modified = sel.SimpleSelectors.Where(ss => Lib.courseModelJsonMLMeta.allCSControls.Contains(ss.ElementName)).Select(ss => new { ss, orig = ss.ElementName }).ToArray();
      foreach (var ss in modified) {
        ss.ss.Class = "oli-" + LowUtils.toCammelCase(ss.orig).ToLower(); ss.ss.ElementName = null; 
      }
      try { return sel.ToString(); } finally {
        foreach (var ss in modified) {
          ss.ss.Class = null; ss.ss.ElementName = ss.orig; 
        }
      }
    }

  }
}





