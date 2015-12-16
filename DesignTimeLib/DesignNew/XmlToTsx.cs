using System.Xml.Linq;
using System.Linq;
using LMNetLib;
using System.Collections.Generic;
using LMComLib;
using System.IO;
using System.Text;
using System.Text.RegularExpressions;
using System.Xml;
using System.Web;

namespace xmlToTsx {
  public static class convert {

    public static string toTsx(XElement xml) {
      var body = xml.Element("body");
      if (body == null) body = xml;
      else {
        CourseModel.tag.normalizeXml(xml, blankCode);
        var temp = xml.Element("head"); if (temp != null) temp = temp.Element("title");
        if (temp != null) body.Add(new XAttribute("title", temp.Value));
      }
      foreach (var el in body.DescendantsAndSelf()) {
        var tagName = LowUtils.toCammelCase(el.Name.LocalName);
        var isTag = tags.Contains(tagName);
        if (isTag) el.Name = CSharpToTypeScriptCourse.typeName(tagName);
        //uprava atributu
        foreach (var attr in el.Attributes().ToArray()) {
          var oldName = attr.Name.LocalName;
          //all
          switch (oldName) {
            case "class": renameAttr(attr, "className"); break;
            case "colspan": wrapExpression(renameAttr(attr, "colSpan")); break;
            case "rowspan": wrapExpression(renameAttr(attr, "rowSpan")); break;
            case "maxlength": wrapExpression(renameAttr(attr, "maxLength")); break;
          }
          //course components only
          if (!isTag) continue;
          if (oldName == "order") attr.Remove();
          var newName = LowUtils.toCammelCase(oldName);
          var fullName = tagName + "." + newName;
          var newAttr = newName != oldName ? renameAttr(attr, newName) : attr;
          if (numProps.Contains(newName) || numProps.Contains(fullName)) wrapExpression(newAttr);
          if (boolProps.Contains(newName) || boolProps.Contains(fullName)) wrapExpression(newAttr);
          string enumType;
          if (enumProps.TryGetValue(newName, out enumType) || enumProps.TryGetValue(fullName, out enumType))
            wrapExpression(newAttr, "CourseModel." + enumType + "." + LowUtils.toCammelCase(newAttr.Value));
        }
      }
      //cdata
      List<string> cdatas = new List<string>();
      foreach (var cd in body.DescendantNodes().OfType<XCData>().ToArray()) {
        cdatas.Add(cd.Value);
        cd.Parent.Add(new XAttribute("cdata", "~{" + (cdatas.Count - 1).ToString() + "}~"));
        cd.Remove();
      }
      //lokalizace textu a instrTitle
      foreach (var el in body.DescendantNodes().OfType<XText>()) el.Value = localizeForTsx(el.Value, true);
      var instrTitle = body.Attribute("instrTitle");
      if (instrTitle != null) instrTitle.Value = localizeForTsx(instrTitle.Value, false);
      //vyhod XML namespace
      foreach (var attr in body.Attributes().Where(a => a.IsNamespaceDeclaration || a.Name.LocalName == "noNamespaceSchemaLocation").ToArray()) attr.Remove();
      //xml to string
      StringBuilder sb = new StringBuilder();
      var wr = XmlWriter.Create(sb, new XmlWriterSettings { OmitXmlDeclaration = true, Encoding = Encoding.UTF8, Indent = true });//, NewLineHandling = NewLineHandling.Replace, NewLineChars = "\n" });
      body.Save(wr); wr.Flush();
      //nahrada atributu vyrazem }
      sb.Replace("\"@{", "{").Replace("}@\"", "}");
      //cdata z atributu do ES6 `` stringu
      var res = sb.ToString(); sb = null;
      foreach (var m in regExItem.Parse(res, cdataRx)) {
        if (sb == null) sb = new StringBuilder();
        if (!m.IsMatch) { sb.Append(m.Value); continue; }
        var cd = cdatas[int.Parse(m.Value.Substring(3, m.Value.Length - 6))];
        sb.Append("{`"); sb.Append(cd.Replace("\\", "\\\\")); sb.Append("`}");
      }
      return sb == null ? res : sb.ToString();
    }
    const string blankCode = "~blank~";
    static Regex cdataRx = new Regex("\"~\\{\\d+\\}~\"");
    static XAttribute renameAttr(XAttribute attr, string newName) {
      var res = new XAttribute(newName, attr.Value);
      attr.Parent.Add(res);
      attr.Remove();
      return res;
    }
    static HashSet<string> numProps = new HashSet<string>(new string[] { "width", "scoreWeight", "limitRecommend", "limitMin", "limitMax", "numberOfRows", "begPos", "endPos", "numberOfPhrases", "phraseIdx" });
    static HashSet<string> boolProps = new HashSet<string>(new string[] { "isPassive", "scoreAsRatio", "gapFillLike", "caseSensitive",
      "readOnly", "skipEvaluation", "leftRandom", "recordInDialog", "singleAttempt", "isStriped", "hidden", "passive", "correct", "random", "isOldToNew",
      "radioButton.correctValue","radioButton.initValue","checkItem.correctValue","checkBox.correctValue"
    });
    static Dictionary<string, string> enumProps = new Dictionary<string, string> {
      {"textType","CheckItemTexts" },{"checkItem.initValue","threeStateBool" },{"checkBox.initValue","threeStateBool" },{"leftWidth","pairingLeftWidth" },{"dialogSize","modalSize" },{"icon","listIcon" },
      { "color","colors" },{"actorId","IconIds" },{"textId","CheckItemTexts" },
      { "macroTable.inlineType","inlineControlTypes" },{ "macroList.inlineType","inlineControlTypes" },{ "inlineTag.inlineType","inlineElementTypes" },{"smartElement.inlineType","smartElementTypes" },
      {"offering.mode","offeringDropDownMode" },{"smartOffering.mode","smartOfferingMode" },
    };
    static HashSet<string> tags = new HashSet<string>(CourseModel.getAll.allTypes.Select(t => t.Name));

    public static void toTsx(string srcDir, string destDir) {
      foreach (var fn in Directory.EnumerateFiles(srcDir, "*.xml", SearchOption.AllDirectories).Select(f => f.ToLower()).Where(f => !f.EndsWith(@"\meta.xml"))) {
        var s = toTsx(XElement.Load(fn));
        var relPath = fn.Substring(srcDir.Length); var destPath = destDir + relPath;
        LowUtils.AdjustFileDir(destPath);
        File.WriteAllText(Path.ChangeExtension(destPath, ".tsx"), s);
      }
    }
    //mj. nahradi '{' v textu by {'{'} 
    static string localizeForTsx(string text, bool plainText) {
      StringBuilder sb = null;
      foreach (var m in regExItem.Parse(text, CourseMeta.locLib.localizePartsRegex)) {
        if (sb == null) sb = new StringBuilder();
        if (!m.IsMatch) { sb.Append(replaceBrackets(m.Value).Replace(blankCode, "{' '}")); continue; }
        var parts = m.Value.Substring(2, m.Value.Length - 4).Split('|');
        var txt = string.Format("{{$loc('{0}','{1}')}}", parts[0], HttpUtility.JavaScriptStringEncode(parts[1]));
        sb.Append(plainText ? txt : "@" + txt + "@");
      }
      return sb == null ? text : sb.ToString();
    }
    static string replaceBrackets(string s) { return s.Split('{').Select(r => r.Replace("}", "{'}'}")).Join("{'{'}"); }

    static void wrapExpression(XAttribute attr, string expr = null) { attr.Value = "@{" + (expr != null ? expr : attr.Value) + "}@"; }


  }
}