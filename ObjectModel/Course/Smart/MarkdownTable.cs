//using CommonMark.Formatters;
//using CommonMark.Syntax;
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

  public class tablePlugin : plugin {

    public tablePlugin(styleParams pars, context context) : base(pars, context) { }

    //skupina radek, oddelenych ---- nebo ====
    public class rowsBlock {

      public bool isHeader; //priznak ze skupina konci by ====
      public cellStyle rowStyle;
      public int index; //absolutni pozice v trimed zdrojovem souboru
      public List<string> lines = new List<string>(); //obsah bloku

      public static IEnumerable<rowsBlock> parseRowBlocks(int bodyIndex, IEnumerable<string> lines, context context) { //vytvoreni rowsBlocks
        rowsBlock act = null; string style = null; int pos = bodyIndex;
        foreach (var line in lines) {
          try {
            //rowBlock nesmi zacinat prazdnymi radky
            if (act == null && line == null) continue;
            var delim = getDelim(line, out style);
            if (delim == null) { //obycejna line
              if (act == null) act = new rowsBlock() { index = pos };
              act.lines.Add(line);
            } else if (act == null) //nalezen delim ale zatim neni zadna neprazdna line
              continue;
            else { //rowBlock delimiter
              act.isHeader = delim == true; //header delimiter ma pouze prvni row block
              act.rowStyle = cellStyle.create(style); style = null;
              yield return act;
              act = null;
            }
          } finally { pos += line.Length + 1; }
        }
        if (act != null) yield return act;
      }
      static bool? getDelim(string line, out string style) { //radek je === (true), --- (false) nebo null (else)
        style = null;
        if (line == null) return null;
        var match = rowEndMask.Match(line);
        if (!match.Success) return null;
        style = match.get("style");
        return match.get("header") != null;
      }
      static Regex rowEndMask = new Regex(@"^\s*(?:(?<row>-{3,})|(?<header>={3,}))(?<style>.*)$");

      public IEnumerable<row> emitRows(List<string> map, context context) { //z rowBlock vytvori radky tabulky
        for (var i = 0; i < lines.Count; i++) {
          if (string.IsNullOrEmpty(lines[i])) continue;
          var isSimple = lines[i].Contains("|");
          if (isSimple) {
            var simpleCells = lines[i].Replace("-|",null).Split('|'); //\| je jiz davno escaped
            yield return new row(simpleCells, map, i == lines.Count - 1 ? rowStyle : null, context);
          } else {
            var txt = LowUtils.join(lines.Skip(i), "\n");
            yield return new row(txt, map, rowStyle, context);
            break;
          }
        }
      }
      //static Regex cellDelimMask = new Regex(@"(?<![\\])\|"); // | ale nikoliv \|
    }

    public enum rowType { no, nameValue, value, multiValue }

    //jedna row tabulky
    public class row {

      public row(string[] cells, List<string> map, cellStyle rowStyle, context context) { //row z |-delimited cells
        bool mapWasEmpty = map.Count == 0; style = rowStyle;
        foreach (var cell in cells) {
          var match = tableCellMask.Match(cell);
          rowType actCellType; string name = null; string value = null; cellStyle cStyle = null;
          if (!match.Success) {
            actCellType = rowType.value;
            LMCStyle st;
            name = expandAndExtractStyle(context, cell, out st);
            if (st != null) cStyle = cellStyle.create(st.value); 
          } else {
            name = match.get("name"); value = match.get("value").Trim(); cStyle = cellStyle.create(match.get("styleCode"), context.codes);
            actCellType = rowType.nameValue;
          }
          if (typ == rowType.no) { //prvni cell
            typ = actCellType;
            if (typ == rowType.nameValue) namedCells = new Dictionary<string, cell>(); else valueCells = new List<cell>();
          } else if (typ != actCellType) { //typ dalsiho cellu je odlisny od typu prvniho
            isWrong = true; break;
          }
          //zarad cell 
          if (cStyle != null) cStyle.useCls = true;
          if (cStyle != null && cStyle.flags == null && cStyle.cls == "-") continue;
          if (typ == rowType.nameValue) namedCells[name] = new cell { txt = value, style = cStyle }; else valueCells.Add(new cell { txt = name, style = cStyle });
          if (typ == rowType.nameValue && mapWasEmpty) map.Add(name);
        }
      } static Regex tableCellMask = new Regex(@"^\s*@(?<name>[\w-]+)(?:(?<styleCode>.{2})≡+)?:(?<value>.*)$", RegexOptions.Singleline); // @<name><styleCode>========:<value>

      public row(string expandedStr, List<string> map, cellStyle rowStyle, context context) { //multiline row
        style = rowStyle;
        namedCells = new Dictionary<string, cell>(); typ = rowType.multiValue; bool mapWasEmpty = map.Count == 0; var i = 0;
        while (i < expandedStr.Length) {
          var ch = expandedStr[i]; var nextChar = i == expandedStr.Length - 1 ? ' ' : expandedStr[i + 1];
          if (ch >= LMCode.s1First && ch <= LMCode.s1Last && nextChar >= LMCode.s2First && nextChar <= LMCode.s2Last) {
            var code = context.codes[LMCode.decode(ch, nextChar)] as plugin;
            i += code.length;
            if (code == null || !code.name.StartsWith("@")) throw new Exception("code == null || !code.name.StartsWith(@)");
            var nm = code.name.Substring(1);
            if (mapWasEmpty) map.Add(nm);
            namedCells[nm] = new cell { multiResult = code.result, index = code.innerIndex, style = cellStyle.create(code.pars, true) };
          } else i++;
        }
      }

      static string expandAndExtractStyle(context context, string expandedStr, out LMCStyle style) {
        style = null;
        //replace placeholders
        StringBuilder sb = new StringBuilder(); var i = 0;
        while (i < expandedStr.Length) {
          var ch = expandedStr[i]; var nextChar = i == expandedStr.Length - 1 ? ' ' : expandedStr[i + 1];
          if (ch >= LMCode.s1First && ch <= LMCode.s1Last && nextChar >= LMCode.s2First && nextChar <= LMCode.s2Last) {
            var code = context.codes[LMCode.decode(ch, nextChar)];
            i += code.length;
            if (code is LMCStyle) 
              style = (LMCStyle)code;
            else
              code.generate(sb, context);
          } else {
            sb.Append(ch);
            i++;
          }
        }
        return sb.ToString();
      }

      public Dictionary<string, cell> namedCells; //pojmenovane cells
      public List<cell> valueCells; //cells, zadane poradim
      public rowType typ;
      public bool isWrong;
      public cellStyle style;
    }

    public class cell {
      public string txt;
      public XElement multiResult;
      public cellStyle style;
      public int index; //pozice v trimed souboru
    }

    protected override XElement expandPlugin(string sourceStr, context context) {
      var tableStyle = cellStyle.create(pars);
      var lines = sourceStr.Split('\n');
      //prvni radek jsou parametry tabulky
      //trace dalsich radku
      var blocks = rowsBlock.parseRowBlocks(innerIndex /*pozice za prvni radkou*/, lines, context).ToArray(); if (blocks.Length == 0) return null;
      //emituj table rows
      var headerIdx = blocks.IndexOf(b => b.isHeader);
      List<string> map = new List<string>();
      var headerRows = blocks.Take(headerIdx + 1).SelectMany(rb => rb.emitRows(map, context)).Where(r => !r.isWrong).ToArray();
      var bodyRows = blocks.Skip(headerIdx + 1).SelectMany(rb => rb.emitRows(map, context)).Where(r => !r.isWrong).ToArray();
      //vybuduj thead, tbody a vrat table
      var res = new XElement("table", addRowBlock(headerRows, true, map, tableStyle, context), addRowBlock(bodyRows, false, map, tableStyle, context));
      if (tableStyle != null) {
        tableStyle.cls = "table " + tableStyle.cls;
        tableStyle.applyToElement(res);
      } else
        res.Add(new XAttribute("class", "table"));
      return new XElement("node", res);
    }

    //z rows vybuduje buto thead nebo tbody
    static XElement addRowBlock(row[] rows, bool isHeader, List<string> map, cellStyle tableStyle, context context) {
      if (rows.Length == 0) return null;
      var rb = new XElement(isHeader ? "thead" : "tbody");
      foreach (var row in rows) {
        var trow = new XElement("tr"); rb.Add(trow);
        if (row.style != null) row.style.applyToElement(trow);
        if (row.typ == rowType.nameValue || row.typ == rowType.multiValue) {
          foreach (var colName in map) {
            cell cl;
            row.namedCells.TryGetValue(colName, out cl);
            addCell(row.typ, cl, trow, isHeader, context, tableStyle,
              tableStyle == null || tableStyle.columnStyles == null ? null : tableStyle.columnStyles.get(colName, null),
              row.style);
          }
        } else if (row.typ == rowType.value) {
          int columnIdx = 0;
          foreach (var val in row.valueCells) {
            string colName = map == null || columnIdx >= map.Count ? (columnIdx + 1).ToString() : map[columnIdx];
            addCell(row.typ, val, trow, isHeader, context, tableStyle, 
              tableStyle == null || tableStyle.columnStyles == null ? null : tableStyle.columnStyles.get(colName, null),
              row.style);
            columnIdx++;
          }
        }
      }
      return rb;
    }
    //prida cell do row
    static void addCell(rowType typ, cell val, XElement trow, bool isHeader, context context, params cellStyle[] sts) {
      XElement cell; string tg = isHeader ? "th" : "td";
      if (typ!=rowType.multiValue || val==null) {
        cell = XElement.Parse("<" + tg + ">" + (val!=null ? LMCode.unEscape(val.txt) : "&#160;")+ "</" + tg + ">");
      } else {
        context.shiftPoss(val.multiResult, val.index);
        cell = new XElement(tg, LMHelper.trimChilds(val.multiResult.Nodes()));
      }
      new cellStyle(sts.Concat(val != null ? XExtension.Create(val.style) : Enumerable.Empty<cellStyle>())).applyToCell(cell);
      trow.Add(cell);
    }
    
  }

  public class cellStyle {
    public cellStyle(IEnumerable<cellStyle> sts) {
      flags = new char[] { ' ', ' ', ' ', ' ' };
      foreach (var st in sts) {
        if (st == null) continue;
        if (st.flags != null) for (var i = 0; i < 4; i++) if (st.flags[i] != ' ') flags[i] = st.flags[i];
      }
      cls = LMCSpan.decodeStyles(sts.Where(s => s!=null && s.useCls).Select(s => s.cls));
    }
    cellStyle(string val1, string val2, bool useCls = false) {
      if (val1 != null && val2 != null) { flags = fromString(val1); cls = val2; } else if (val1 != null) { flags = fromString(val1); if (flags == null) cls = val1; }
      //if (cls != null) cls = cls.Replace('+', ' ');
      this.useCls = useCls;
    }
    public static cellStyle create(styleParams par, bool useCls = false) {
      if (par == null) return null;
      string val1 = par.ids.Length > 0 ? par.ids[0] : null; string val2 = par.ids.Length > 1 ? par.ids[1] : null;
      Dictionary<string, cellStyle> columnStyles = par.attrs.ToDictionary(kv => kv.Key.Substring(1), kv => cellStyle.create(kv.Value, true));
      return val1 == null && val2 == null && columnStyles.Count == 0 ? null : new cellStyle(val1, val2) { columnStyles = columnStyles, useCls = useCls };
    }
    public static cellStyle create(string codeId, List<LMCode> codes) {
      LMCStyle st = LMCode.getCodeFromId(codeId, codes) as LMCStyle; if (st == null) return null;
      return create(st.value);
    }
    public static cellStyle create(string blankDelimited, bool useCls = false) {
      if (blankDelimited == null) return null;
      var parts = blankDelimited.Split(new char[] { ' ' }, StringSplitOptions.RemoveEmptyEntries);
      return new cellStyle(parts.Length > 0 ? parts[0] : null, parts.Length > 1 ? parts[1] : null, useCls);
    }
    //<td align="left|right|center|justify|char"> 
    //<td style="vertical-align:bottom">
    public void applyToCell(XElement cell) {
      if (cls != null) cell.SetAttributeValue("class", cls);
      if (flags[rowSpan] != ' ') cell.SetAttributeValue("colspan", flags[rowSpan]);
      if (flags[colSpan] != ' ') cell.SetAttributeValue("rowspan", flags[colSpan]);
      string st = null;
      if (flags[vertical] != ' ') st = "vertical-align:" + align[flags[vertical]];
      if (flags[horizont] != ' ') st += ";text-align:" + align[flags[horizont]];
      if (st != null) cell.SetAttributeValue("style", st);
    }
    public void applyToElement(XElement cell) {
      if (!string.IsNullOrEmpty(cls)) cell.SetAttributeValue("class", LMCSpan.decodeStyle(cls));
    }
    public string cls; //"-" => priznak fake empty cell
    public char[] flags;
    public Dictionary<string, cellStyle> columnStyles;
    public bool useCls; //pri merge (public cellStyle(IEnumerable<cellStyle> sts)) pouzit cls

    static char[] fromString(string str) {
      if (str == "") return null;
      char[] res = new char[] { ' ', ' ', ' ', ' ' };
      if (char.IsDigit(str[0])) { res[rowSpan] = str[0]; str = str.Substring(1); }
      if (str.Length > 1 && char.IsDigit(str[str.Length - 1])) { res[colSpan] = str[str.Length - 1]; str = str.Substring(0, str.Length - 1); }
      foreach (var ch in str) { var idx = charMap.get(ch, -1); if (idx < 0 || res[idx] != ' ') return null; res[idx] = ch; }
      return res;
    }
    const int rowSpan = 0; const int colSpan = 1; const int horizont = 2; const int vertical = 3;
    static Dictionary<char, int> charMap = new Dictionary<char, int>() { { 'l', horizont }, { 'r', horizont }, { 'c', horizont }, { 't', vertical }, { 'b', vertical }, { 'm', vertical } };
    static Dictionary<char, string> align = new Dictionary<char, string>() { { 'l', "left" }, { 'r', "right" }, { 'c', "center" }, { 't', "top" }, { 'b', "bottom" }, { 'm', "middle" } };
  }

}
