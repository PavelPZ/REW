using CommonMark;//.Formatters;
using CommonMark;//.Syntax;
//using cm = CommonMark;
using LMComLib;
using LMNetLib;
using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Security;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using System.Xml.Linq;

/*
 * 
*/
namespace CommonMark {

  /* na indentovane mardown bloky se musi aplikovat left-trim, aby se Markdown algoritmus nezblnnul.
   * pro kazdy radek se vytvori lineInfo objekt, ktery ke kazde trimed pozici urci posun vzhledem k puvodnimu zdroji (trimLengthSum)
   */
  public class lineInfo {
    public int trimmedPos; //zacatek line po trimAndLineInfo
    public int trimLengthSum; //celkovy pocet vymazanych mezer pro tento radek v procesu trimAndLineInfo
    //public string line;
    public static int getLinePos(lineInfo[] lineInfos, int modifiedPos) {
      var idx = lineInfos.IndexOf(inf => modifiedPos < inf.trimmedPos);
      var line = lineInfos[idx - 1];
      //return line.modifiedPos + line.shiftSum;
      return modifiedPos + line.trimLengthSum;
    }
  }

  /* stavove informace pro zpracovani jednoho scriptu 
   */
  public class context {
    public lineInfo[] lineInfos; //prepocet trimmed => puvodni pozice
    public List<LMCode> codes = new List<LMCode>(); // obsahy vsech {} zavorek, ktere se nahradi fake znaky
    public Stack<plugin> defaultElementHolder = new Stack<plugin>(); 
    public string defaultElement() { return defaultElementHolder.Count == 0 ? null : defaultElementHolder.Peek().defaultElement(); } //default inline element, napr. gap-fill apod.
    public int counter; //pomocny counter pro ruzne ucely
    //vymeni trimmed pozice v root za zdrojove pozice
    public void shiftPoss(XElement root, int blockInnerIndex) {
      foreach (var poss in root.DescendantsAndSelf().Select(el => new { lmo = el.Attribute("lmo"), lmc = el.Attribute("lmc") }).Where(oc => oc.lmc != null && oc.lmo != null)) {
        var lmc = lineInfo.getLinePos(lineInfos, int.Parse(poss.lmc.Value) + blockInnerIndex);
        var lmo = lineInfo.getLinePos(lineInfos, int.Parse(poss.lmo.Value) + blockInnerIndex);
        var newAttr = new XAttribute("srcpos", string.Format("{0}-{1}", lmo, lmc));
        poss.lmc.Parent.Add(newAttr); poss.lmc.Remove(); poss.lmo.Remove();
      }
    }
  }

  public static class LMHelper {

    static LMHelper() {
      settings = CommonMarkSettings.Default.Clone();
      settings.TrackSourcePosition = true;
      settings.OutputFormat = OutputFormat.Html;
      settings.OutputDelegate = (doc, output, sett) => new LMFormater(output, sett).WriteDocument(doc);
    } static CommonMarkSettings settings;

    public static XAttribute filePos<T>(T b, T e) { return new XAttribute("srcpos", b.ToString() + "-" + e.ToString()); }

    //provede trim bloku a pripravi lineinfos (kvuli prepocitani trimmed pozic na skutecne pozice)
    public static IEnumerable<lineInfo> trimAndLineInfo(string src, StringBuilder sb) {
      string mstr; Stack<string> trimLen = new Stack<string>(); trimLen.Push(""); int modifiedPos = 0; int actTrim; int trimSum = 0;
      foreach (var line in LMCode.escape(src).Split('\n')) {
        var match = preprocessBlock.Match(line);
        if ((mstr = match.get("blockStart")) != null) {
          var start = line.Substring(0, match.Index);
          if (start.Trim() != string.Empty) { /*error*/ throw new Exception(); }
          trimLen.Push(new string(' ', start.Length));
          actTrim = start.Length;
        } else if ((mstr = match.get("blockEnd")) != null) {
          actTrim = trimLen.Peek().Length;
          if (!line.StartsWith(trimLen.Pop())) { /*error*/ throw new Exception(); }
        } else {
          if (line.Trim() == string.Empty) {
            actTrim = line.Length;
          } else {
            actTrim = trimLen.Peek().Length;
            if (!line.StartsWith(trimLen.Peek())) { /*error*/ throw new Exception(); }
          }
        }
        var modifLine = line.Substring(actTrim);
        sb.Append(line.Substring(actTrim)); sb.Append('\n');
        trimSum += actTrim;
        yield return new lineInfo { trimmedPos = modifiedPos, trimLengthSum = trimSum }; //, line = line };
        modifiedPos += modifLine.Length + 1;
      }
      yield return new lineInfo { trimmedPos = modifiedPos + 1, trimLengthSum = trimSum };
    }
    static Regex preprocessBlock = new Regex(@"{#(?<blockStart>[\w-@]*)|(?<blockEnd>[\w-@]*)#}", RegexOptions.Singleline);

    //zpracovani {} zavorek
    public static XElement process(string src, context context) {
      //child blocks
      StringBuilder sb = new StringBuilder();
      Stack<LMCode> brackets = new Stack<LMCode>(); Stack<plugin> blocks = new Stack<plugin>(); plugin root; blocks.Push(root = new plugin(null, context) { name = "block" });
      string mstr;
      foreach (var ri in regExItemPos.Parse(src, processBracketsMask)) {
        if (!ri.IsMatch) { sb.Append(src.Substring(ri.index, ri.length)); continue; }
        if ((mstr = ri.match.get("span")) != null) {
          brackets.Push(LMCode.replaceSpan(sb, context, mstr, -1, ri.match.Index, ri.match.Length));
        } else if ((mstr = ri.match.get("spanEnd")) != null) {
          if (brackets.Count == 0) { /*error*/ throw new Exception(); }
          var startSpan = brackets.Pop() as LMCSpan; if (startSpan == null) { /*error*/ throw new Exception(); }
          LMCode.replaceSpan(sb, context, null, startSpan.openIdx, ri.match.Index, ri.match.Length);
          startSpan.openIdx = -1;
        } else if ((mstr = ri.match.get("blockStart")) != null) {
          mstr = mstr.ToLower();
          LMCode.replaceBlock(sb, ri.match.Length);
          plugin plug;
          var par = ri.match.get("blockPar");
          var pars = new styleParams().fillParams(par);
          switch (mstr) {
            case "table": plug = new tablePlugin(pars, context); break;
            case "panel": plug = new panel(pars, context); break;
            case "pairing": plug = new pairing(pars, context); break;
            case "offering": plug = new offering(pars, context); break;
            case "alert": plug = new alert(pars, context); break;
            default: plug = new plugin(pars, context); break;
          }
          plug.name = mstr; plug.index = ri.match.Index; plug.length = ri.match.Length;
          if (plug.defaultElement() != null) context.defaultElementHolder.Push(plug);
          brackets.Push(plug);
          var parent = blocks.Peek();
          blocks.Push(plug);
        } else if ((mstr = ri.match.get("blockEnd")) != null) {
          LMCode.replaceBlock(sb, ri.match.Length);
          if (brackets.Count == 0) { /*error*/ throw new Exception(); }
          var startBlock = brackets.Pop() as plugin; if (startBlock == null || (!string.IsNullOrEmpty(mstr) && string.Compare(startBlock.name, mstr, true) != 0)) { /*error*/ throw new Exception(); }
          if (blocks.Pop() != startBlock) { /*assert*/ throw new Exception(); }
          startBlock.finish(sb, ri.match.Index, ri.match.Length, context, false);
          if (context.defaultElementHolder.Count > 0 && context.defaultElementHolder.Peek() == startBlock) context.defaultElementHolder.Pop();
        } else if ((mstr = ri.match.get("inline")) != null) {
          LMCode.replaceInline(sb, context, mstr, ri.match.Index, ri.match.Length);
        } else if ((mstr = ri.match.get("style")) != null) {
          LMCode.replaceStyle(sb, context, mstr, ri.match.Index, ri.match.Length);
        }
      }
      //root blok
      root.finish(sb, src.Length, 0, context, true);
      return root.result;
    }
    const string spanMask = @"{\*(?<span>([\w+-:|]*|\*|))\s|(?<spanEnd>\*)}";
    const string blockMask = @"{#(?<blockStart>[\w-@]*)(?<blockPar>[^\n]*\n?)|(?<blockEnd>[\w-@]*)#}";
    const string inlineMask = @"{\+(?<inline>.*?)}";
    const string styleMask = @"{\!(?<style>.*?)}";
    const string otherMask = @"{.*?}";
    static Regex processBracketsMask = new Regex(spanMask + "|" + blockMask + "|" + inlineMask + "|" + styleMask + "|" + otherMask, RegexOptions.Multiline);

    //LANGMaster string to XElement converter
    public static XElement Convert(string src) {
      src = "\n" + src.Replace("\r\n", "\n").Replace("\r", "\n"); //normalizace crlf
      StringBuilder sb = new StringBuilder();
      var lineInfos = LMHelper.trimAndLineInfo(src, sb).ToArray();
      var trimedSrc = sb.ToString();
      var xml = LMHelper.process(trimedSrc, new context { lineInfos = lineInfos });
      return xml;
    }
    //Markdown string to string converter
    public static string ConvertLow(string s) {
      using (var rdr = new StringReader(s)) using (var wr = new StringWriter()) {
        CommonMarkConverter.Convert(rdr, wr, settings);
        var res = wr.ToString();
        return res;
      }
    }

    //LANGMaster string fragment to xml fragment converter
    public static IEnumerable<XNode> parseString(string sourceStr, int sourceStringPos /*trim pozice sourceStr stringu*/, bool xmlChildTrim /*odstrani nadbytecny paragraf a prazdne texty*/, context context) {
      string expandedStr = LMHelper.ConvertLow(sourceStr);
      var xml = plugin.includeChildsAndPos(context, expandedStr);
      LMHelper.shiftPoss(xml, sourceStringPos, context);
      return xmlChildTrim ? LMHelper.trimChilds(xml.Nodes()) : xml.Nodes();
    }

    //optimalizace: pokud je root JEN paragraph nebo paragraf obaleny prazdnymi XText.Value.Trim(), vrati childs tohoto paragraphu
    public static IEnumerable<XNode> trimChilds(IEnumerable<XNode> nodes) {
      var canTrim = true; XElement par = null; List<XNode> waiting = new List<XNode>();
      foreach (var nd in nodes) {
        if (canTrim) {
          //prazdny text dovolen vzdy
          var t = nd as XText;
          if (t != null && string.IsNullOrEmpty(t.Value.Trim())) { waiting.Add(nd); continue; }
          //dovolen prvni paragraph
          var p = nd as XElement; if (p != null && p.Name.LocalName != "p") p = null;
          if (p != null && par == null) { par = p; waiting.Add(p); continue; }
          //konec canTrim => vrat waiting
          canTrim = false;
          foreach (var n in waiting) yield return n;
          yield return nd;
          continue;
        }
        yield return nd;
      }
      if (par != null && canTrim) foreach (var nd in par.Nodes()) yield return nd; //par je jediny uzel => vrat jeho childs
    }

    //aktualizuje pozice v XML vyhledem k zacatku obsahu bloku (blockInnerIndex)
    public static void shiftPoss(XElement root, int blockInnerIndex, context context) {
      foreach (var poss in root.DescendantsAndSelf().Select(el => new { lmo = el.Attribute("lmo"), lmc = el.Attribute("lmc") }).Where(oc => oc.lmc != null && oc.lmo != null)) {
        var lmc = lineInfo.getLinePos(context.lineInfos, int.Parse(poss.lmc.Value) + blockInnerIndex);
        var lmo = lineInfo.getLinePos(context.lineInfos, int.Parse(poss.lmo.Value) + blockInnerIndex);
        var newAttr = new XAttribute("srcpos", string.Format("{0}-{1}", lmo, lmc));
        poss.lmc.Parent.Add(newAttr); poss.lmc.Remove(); poss.lmo.Remove();
      }
    }
  }

  //predchudce {} bloku textu
  public class LMCode {
    public string value;
    public int index;
    public int length;
    public virtual void generate(StringBuilder sb, context context) { generateXml(context).InnerXml(sb); }
    public virtual IEnumerable<XNode> generateXml(context context) { throw new NotImplementedException(); }

    //******************* nahrada bloku fake kody
    public static void replaceBlock(StringBuilder sb, int length) {
      for (var i = 0; i < length; i++) sb.Append(fill);
    }
    public static LMCode replaceStyle(StringBuilder sb, context context, string value, int index, int length) {
      var res = new LMCStyle { value = value, index = index, length = length };
      context.codes.Add(res);
      encode(sb, context.codes.Count - 1, length - 2);
      return res;
    }
    public static LMCode replaceSpan(StringBuilder sb, context context, string openValue, int openIdx, int index, int length) {
      var res = new LMCSpan { value = openIdx < 0 ? openValue : null, openIdx = openIdx < 0 ? context.codes.Count : openIdx, index = index, length = length };
      context.codes.Add(res);
      encode(sb, context.codes.Count - 1, length - 2);
      return res;
    }
    public static LMCode replaceInline(StringBuilder sb, context context, string value, int index, int length) {
      var res = new LMCInline { value = value, index = index, length = length };
      context.codes.Add(res);
      encode(sb, context.codes.Count - 1, length - 2);
      return res;
    }
    static void encode(StringBuilder sb, int idx, int length) {
      sb.Append(firstCode(idx));
      sb.Append(secondCode(idx));
      for (var i = 0; i < length; i++) sb.Append(fill);
    }
    public static int decode(char ch1, char ch2) {
      var res = Convert.ToInt32(ch1) - s1 + ((Convert.ToInt32(ch2) - s2) << 9);
      return res;
    }
    public static LMCode getCodeFromId(string ids, List<LMCode> codes) {
      if (ids == null || ids.Length < 2) return null;
      return codes[decode(ids[0], ids[1])];
    }
    public static char firstCode(int idx) { return Convert.ToChar(s1 + (idx & lowerMask)); }
    public static char secondCode(int idx) { return Convert.ToChar(s2 + (idx >> 9)); }
    const UInt16 s1 = 0x1400;
    public const char s1First = '\x1400';
    public const char s1Last = '\x15FF';
    const UInt16 s2 = 0x4E00;
    const UInt16 s2Max = 0x9FCC;
    public const char s2First = '\x4E00';
    public const char s2Last = '\x9FCC';
    const int lowerMask = 0x000001ff;
    public const char fill = '≡';
    const char escapeFlag = '\x167F';
    const char escapeChar = '\\';

    public static string escape(string s) {
      StringBuilder res = new StringBuilder(); bool encodeNext = false;
      foreach (var ch in s) {
        if (encodeNext) {
          encodeNext = false;
          if (ch == '\n') { res.Append(escapeChar); res.Append(ch); continue; }
          res.Append(LMCode.escapeFlag);
          int idx = Convert.ToInt32(ch); if (idx > s2Max - s2) throw new Exception();
          res.Append(Convert.ToChar(s2 + idx));
          continue;
        }
        if (ch != escapeChar) { res.Append(ch); continue; }
        encodeNext = true;
      }
      return res.ToString();
    }
    public static string unEscape(string s) {
      StringBuilder res = new StringBuilder(); bool encodeNext = false;
      foreach (var ch in s) {
        if (encodeNext) {
          encodeNext = false;
          int idx = Convert.ToInt32(ch);
          res.Append(Convert.ToChar(idx - s2));
          continue;
        }
        if (ch != LMCode.escapeFlag) { res.Append(ch); continue; }
        encodeNext = true;
      }
      return res.ToString();
    }
    /*
    http://unicode-table.com/en/
    CJK Unified Ideographs
    4E00—9FCC 
    pocet 20940

    Unified Canadian Aboriginal Syllabics
    1400—167F
    639 
    */
  }

  //{* *} 
  public class LMCSpan : LMCode {
    public int openIdx;
    public override void generate(StringBuilder sb, context context) {
      var isOpen = openIdx < 0; var val = isOpen ? value : context.codes[openIdx].value;
      if (val == "") val = "style-emphasis"; else if (val == "*") val = "style-strong";
      if (isOpen) {
        sb.Append("<span class=\""); sb.Append(decodeStyle(val)); sb.Append("\">");
      } else
        sb.Append("</span>");
    }
    public static string decodeStyle(string style) {
      return decodeStyles(XExtension.Create(style));
    }
    public static string decodeStyles(IEnumerable<string> styles) {
      Dictionary<st, string> res = LowUtils.EnumGetValues<st>().ToDictionary(t => t, t => "");
      string other = ""; string label = "";
      foreach (var parts in styles.Where(s => !string.IsNullOrEmpty(s)).SelectMany(s => parseLow(s))) {
        var partStyles = parts.Length == 1 ? null : parts[1].Split('+');
        switch (parts[0]) {
          case "label":
            label = " label " + (partStyles == null ? "label-default" : "label-" + partStyles[0]);
            break;
          case "style":
            foreach (var s in partStyles) {
              var val = toType.get(s, null);
              if (val == null) other += " style-" + s; else res[(st)val] = "style-" + s;
            }
            break;
          default: other += ' ' + parts[0]; break;
        }
      }
      var clss = LowUtils.EnumGetValues<st>().Select(t => res.get(t, null)).Where(s => s != null && s.Trim() != string.Empty).DefaultIfEmpty().Aggregate((r, i) => r + ' ' + i) + other + label;
      clss = clss.Trim();
      return string.IsNullOrEmpty(clss) ? null : clss;
    }

    //napr. pro {+icon:...} nebo {#alert xxx icon=...
    public static string parseMultiCSS(string css) {
      return LMCSpan.parseLow(css).Select(part => {
        return part.Length == 1 ? part[0] : LMCSpan.parsePart(part[0], part[1].Split('+'));
      }).Aggregate((r, i) => r + ' ' + i);
    }

    static IEnumerable<string[]> parseLow(string style) { //parse style:xx+yy|icon:play+3x
      return style.Split('|').Where(ss => !string.IsNullOrEmpty(ss)).Select(ss => ss.Split(new char[] { ':' }, 2));
    }
    static string parsePart(string prefix, string[] styleItems) { //icon:play+3x => fa fa-play fa-3x
      if (prefix == "icon") prefix = "fa";
      var res = styleItems.Select(s => string.Format(" {0}-{1}", prefix, s)).Aggregate((r, i) => r + ' ' + i);
      if (prefix == "fa") res = "fa " + res;
      return res;
    }

    public enum st { size, color, bg, style, decoration, weight, other }
    public static Dictionary<string, st?> toType = new Dictionary<string, st?>() { 
      {"s2", st.size},{"s1", st.size},{"1", st.size},{"0", st.size},{"2", st.size},{"3", st.size},{"4", st.size},
      {"default", st.color},{"muted", st.color},{"primary", st.color},{"success", st.color},{"info", st.color},{"warning", st.color},{"danger", st.color},
      {"defaultb", st.bg},{"primaryb", st.bg},{"successb", st.bg},{"infob", st.bg},{"warningb", st.bg},{"dangerb", st.bg},
      {"emphasis", st.style},{"noemphasis", st.style},
      {"strong", st.weight},{"nostrong", st.weight},
      {"nodecoration", st.decoration},{"underline", st.decoration}, {"strikeout", st.decoration},
    };
  }

  //{! } 
  public class LMCStyle : LMCode {
    public override IEnumerable<XNode> generateXml(context context) { yield return XElement.Parse(string.Format("<lmcstyle data=\"{0}\"/>", SecurityElement.Escape(value))); }
  }

  //{+ } 
  public class LMCInline : LMCode {
    public CourseModel.smartElementTypes inline;
    public override IEnumerable<XNode> generateXml(context context) {
      if (value.StartsWith("icon:")) {
        yield return getIconElement(value);
      } else {
        var res = CourseModel.smartElementLow.generate(value, context);
        res.SetAttributeValue("lmo", index.ToString()); res.SetAttributeValue("lmc", (index + length).ToString());
        context.shiftPoss(res, 0);
        yield return res;
      }
    }
    public static XElement getIconElement(string value) {
      var cls = LMCSpan.parseMultiCSS(value);
      return XElement.Parse("<i class=\"" + cls + "\"></i>");
    }
  }

  //{# #} 
  public class plugin : LMCode {
    public plugin(styleParams pars, context context) { this.pars = pars; }
    public string name;
    public styleParams pars;
    public int innerIndex; //inner pozice
    public XElement result; //expandovany plugin
    public string defaultElement() { return pars == null ? null : pars.attrs.get("use-element", null); }

    public override IEnumerable<XNode> generateXml(context context) {
      context.shiftPoss(result, innerIndex);
      return result.Nodes();
    }

    public void finish(StringBuilder sb, int endIndex, int endLength, context context, bool isRoot) {
      innerIndex = index + length;
      //source string
      string sourceStr = sb.ToString(innerIndex, endIndex - innerIndex); //vnitrek bloku, bez {#block ...\n nblock#}
      length = endIndex + endLength - index; //delka bloku (vcetne zavorek)
      //expanze pluginu
      result = expandPlugin(sourceStr, context);
      if (!isRoot) { //nahrada textu pluginu
        sb[index] = LMCode.firstCode(context.codes.Count);
        sb[index + 1] = LMCode.secondCode(context.codes.Count);
        context.codes.Add(this);
        for (var i = index + 2; i < index + length; i++) sb[i] = LMCode.fill;
      } else //pro root plugin - prepocitani pozic
        context.shiftPoss(result, 0);
    }

    public static XElement includeChildsAndPos(context context, string expandedStr) {
      List<IEnumerable<XNode>> childs = new List<IEnumerable<XNode>>(); //potrebne childs
      //replace placeholders
      StringBuilder sb = new StringBuilder(); var i = 0;
      while (i < expandedStr.Length) {
        var ch = expandedStr[i]; var nextChar = i == expandedStr.Length - 1 ? ' ' : expandedStr[i + 1];
        if (ch >= LMCode.s1First && ch <= LMCode.s1Last && nextChar >= LMCode.s2First && nextChar <= LMCode.s2Last) {
          var code = context.codes[LMCode.decode(ch, nextChar)];
          i += code.length;
          var span = code as LMCSpan;
          if (span == null) {
            //propojeni parent xml <-> child XML
            var xml = code.generateXml(context);
            if (xml != null) {
              sb.Append(string.Format("<place id=\"{0}\"/>", childs.Count));
              childs.Add(xml);
            }
          } else {
            span.generate(sb, context);
          }
        } else {
          sb.Append(ch);
          i++;
        }
      }
      //nahrad <place> tag by childs
      var res = XElement.Parse("<root>" + LMCode.unEscape(sb.ToString()) + "</root>", LoadOptions.PreserveWhitespace);
      foreach (var el in res.Descendants("place").ToArray()) el.ReplaceWith(childs[int.Parse(el.AttributeValue("id"))]);
      return res;
    }

    protected virtual XElement expandPlugin(string sourceStr, context context) {
      string expandedStr = LMHelper.ConvertLow(sourceStr);
      return includeChildsAndPos(context, expandedStr);
    }

  }

  public class LMFormater : CommonMark.Formatters.HtmlFormatter {
    public LMFormater(TextWriter target, CommonMarkSettings settings) : base(target, settings) { }
  }

  /* 
   * new styleParams(value): gap-fill(id id p=v; p=v) val|val
   * new styleParams().fillParams(value): id id p=v; p=v
   */
  public class styleParams {
    public string tag;
    public string[] ids;
    public string id { get { return ids == null || ids.Length == 0 ? null : ids[0]; } }
    public Dictionary<string, string> attrs;
    public List<string> values;
    public string valStr;
    public styleParams() { }
    public styleParams(string input) {
      var match = paramsMask.Match(input); if (!match.Success) return;
      tag = match.get("tag"); var par = match.get("pars"); valStr = match.get("values");
      fillParams(par);
      values = valStr == null ? new List<string>() : valStr.Split('|').Select(v => LMCode.unEscape(v)).ToList();
    }
    public styleParams fillParams(string par) {
      attrs = new Dictionary<string, string>();
      if (par == null) return this;
      var kvs = par.TrimEnd('\n').Split(';').Select(kv => kv.Split('=')).ToArray();
      var ids = kvs[0][0].Split(new char[] { ' ' }, StringSplitOptions.RemoveEmptyEntries);
      if (kvs.Length>1 || kvs[0].Length > 1) {
        this.ids = ids.Take(ids.Length - 1).ToArray(); kvs[0][0] = ids[ids.Length - 1];
        foreach (var kv in kvs) attrs[kv[0].Trim()] = LMCode.unEscape(kv[1]);
      } else this.ids = ids;
      return this;
    }
    static Regex paramsMask = new Regex( //<tag>(<pars>) <values>
      string.Format(@"(?<tag>({0}))?(\((?<pars>.*?)\))?\s*(?<values>.*)?", LowUtils.EnumGetValues<CourseModel.smartElementTypes>().Skip(1).Select(en => LowUtils.fromCammelCase(en.ToString())).Aggregate((r, i) => r + "|" + i)), RegexOptions.ExplicitCapture);
  }

}
