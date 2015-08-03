using LMComLib;
using LMNetLib;
using System;
using System.Collections;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Xml;
using System.Xml.Linq;

namespace OldToNew {

  //****** generace adresaru d:\LMCom\rew\OldToNewData\data\ d:\LMCom\rew\OldToNewData\data_all\

  public static class StatLib {

    public static IEnumerable<XElement> allControls(XElement root, bool all) { return root.Descendants().Where(e => isAllControls(e, all)); }

    public static void dump(bool all) {
      LowUtils.AdjustDir(dataBasicPath(all) + @"tagMix\");
      OldToNew.StatLib.tagMix(all);
      if (!all) {
        LowUtils.AdjustDir(dataBasicPath(false) + @"attributes\");
        OldToNew.StatLib.attributes(false);
        LowUtils.AdjustDir(dataBasicPath(false) + @"childAttributes\");
        OldToNew.StatLib.childAttributes();
        LowUtils.AdjustDir(dataBasicPath(false) + @"contains\");
        OldToNew.StatLib.contains();
      }
    }

    //****************** consts

    //kontrolky, sledovane v OldToNewData\data\
    static string[] evalControls = new string[] { "check_item", "classification", "gap_fill", "gap_fill_source", "pairing", "selection", "sentence_ordering", "word_ordering", "item", "cross_word", "eval_mark", "table", "make_word" };
    public static string[] soundControls = new string[] { "sound_sentences", "sound_sentence", "sound_mark", "sound_dialog", "sound", "role", "hide_control" };
    //navic kontrolky do OldToNewData\data_all\
    static string[] layoutControls = new string[] { "box", "control", "img", "layout_cell", "layout_row", "layout_table", "row", /*"table",*/ "tr", "td" };

    //public static string[] actionControls = new string[] { "hide_control" };
    //public static string[] otherControls = new string[] { "head", "html", "page_instruction", }; //make_word
    //??//make_word

    public static HashSet<string> _evalControlsName = new HashSet<string>(evalControls);
    public static HashSet<string> _controlsName = new HashSet<string>(evalControls.Concat(soundControls));
    static HashSet<string> _allControlsName = new HashSet<string>(_controlsName.Concat(layoutControls));
    static HashSet<string> _controlsNames(bool all) { return all ? _allControlsName : _controlsName; }

    static bool isAllControls(XElement e, bool all) { return e.Name.NamespaceName == "lm" && _controlsNames(all).Contains(e.Name.LocalName) && (all || e.Name.LocalName != "table" || e.AttributeValue("start_with") == "evalControl" /*|| e.AttributeValue("eval_row") != null || e.AttributeValue("is_eval_group") != null*/); }

    //sledovane properties
    static string[] enumProps = new string[] { 
      "gap_fill.eval_mode", "gap_fill.example", "gap_fill.inline", 
      "check_item.layout", "check_item.type", "check_item.example", 
      "eval_mark.inline", "eval_mark.visible",
      "gap_fill_source.type", "gap_fill_source.case_sensitive",
      "selection.type", "selection.eval_control",
      "sound.layout", "sound.ignore_sound", 
      "sound_dialog.ignore_sound", 
      "sound_sentence.layout", 
      "sound_sentences.layout", 
      "role.role_icon", 
      "sound_mark.inline",
      "cross_word.col_header", "cross_word.row_header", 
      "head.layout", 
      "box.type",  
      "img.symbol", "layout_cell.align", "layout_cell.flow", "layout_cell.valign", "layout_cell.padding", "row.example", "row.hlite",
      "layout_row.flow", "layout_table.flow", "row.align", "row.padding", "row.valign", "table.align", "table.flow", "table.grid", "table.padding", "table.start_with", "table.valign", 
      "td.align", "td.padding", "td.valign", "tr.align", "table.border", "table.col_header", "table.hlite", "table.row_header", "table.small", "td.hlite","tr.hlite",
    };
    static string[] enumPropsNoValue = new string[] { 
      "gap_fill.group_set", "gap_fill.drag_source", "gap_fill.group_eq_width", "gap_fill.group_eval", "gap_fill.init_value", "gap_fill.width", 
      "check_item.group_eval", "check_item.init_value", 
      "eval_mark.group", 
      "sound.file", 
      "sound_dialog.actor_width", "sound_dialog.width", "sound_dialog.file", 
      "sound_mark.group",
      "sound_sentence.group_sound", "sound_sentence.file", "sound_sentence.sentences", 
      "sound_sentences.group_sound", "sound_sentences.file", "sound_sentences.sentences", 
      "word_ordering.group_eval",
      "classification.group", 
      "pairing.id",
      "make_word.id",
      "hide_control.id",
      "sentence_ordering.id",
    };
    static HashSet<string> enumPropsHash = new HashSet<string>(enumProps);
    static HashSet<string> enumPropsNoValueHash = new HashSet<string>(enumPropsNoValue);

    //***************** DUMP
    
    static void childAttributes() {
      List<xref> ctx = new List<xref>();
      foreach (var f in readFiles(null)) ctx.AddRange(f.statChildAttrs);
      File.WriteAllLines(dataBasicPath(false) + @"childAttributes_num.txt", ctx.GroupBy(c => c, xrefComp.propsVal).OrderByDescending(g => g.Count()).Select(g => firstUpper(g.Key.tag, true) + "." + firstUpper(g.Key.prop, true) + "--" + g.Key.propValue + " (" + g.Count().ToString() + ")"));
      File.WriteAllLines(dataBasicPath(false) + @"childAttributes.txt", ctx.GroupBy(c => c, xrefComp.propsVal).OrderBy(t => t.Key, xrefComp.propsVal).Select(g => firstUpper(g.Key.tag, true) + "." + firstUpper(g.Key.prop, true) + "--" + g.Key.propValue + " (" + g.Count().ToString() + ")"));
      foreach (var g in ctx.GroupBy(c => c, xrefComp.propsVal)) { 
        var items = g.Select(t => t.file).Distinct().ToArray();
        File.WriteAllLines(dataBasicPath(false) + @"childAttributes\" /*+ items.Length.ToString("D4") + " "*/ + firstUpper(g.Key.tag, true) + "." + firstUpper(g.Key.prop, true) + "--" + g.Key.propValue + ".txt", items);
      }
    }

    static void attributes(bool all, string txtWithFileNames = null, string fileNamesSubdir = null) {
      List<xref> ctx = new List<xref>();
      foreach (var f in readFiles(txtWithFileNames)) {
        XElement root = f.statChildAttrExpanded;
        foreach (var el in OldToNew.StatLib.allControls(root, all)) {
          var props = controlProp.getControlPropValues(el);
          foreach (var attr in props) {
            var attrId = el.Name.LocalName + "." + attr.Key;
            if (!enumPropsHash.Contains(attrId) && !enumPropsNoValueHash.Contains(attrId)) continue;
            ctx.Add(new xref { file = f.url, tag = el.Name.LocalName, prop = attr.Key, propValue = enumPropsHash.Contains(attrId) ? attr.Value : "any" });
          }
        }
      }
      File.WriteAllLines(dataBasicPath(all) + fileNamesSubdir + @"attributes_num.txt", ctx.GroupBy(c => c, xrefComp.propsVal).OrderByDescending(g => g.Count()).Select(g => firstUpper(g.Key.tag, true) + "." + firstUpper(g.Key.prop, true) + "--" + g.Key.propValue + " (" + g.Count().ToString() + ")"));
      File.WriteAllLines(dataBasicPath(all) + fileNamesSubdir + @"attributes.txt", ctx.GroupBy(c => c, xrefComp.propsVal).OrderBy(t => t.Key, xrefComp.propsVal).Select(g => firstUpper(g.Key.tag, true) + "." + firstUpper(g.Key.prop, true) + "--" + g.Key.propValue + " (" + g.Count().ToString() + ")"));
      foreach (var g in ctx.GroupBy(c => c, xrefComp.propsVal)) {
        var items = g.Select(t => t.file).Distinct().ToArray();
        File.WriteAllLines(dataBasicPath(all) + fileNamesSubdir + @"attributes\" /*+ items.Length.ToString("D4") + " "*/ + firstUpper(g.Key.tag, true) + "." + firstUpper(g.Key.prop, true) + "--" + g.Key.propValue + ".txt", items);
      }
    }

    static void contains() {
      List<strFn> ctx = new List<strFn>();
      foreach (var f in readFiles(null)) {
        XElement root = f.statChildAttrExpanded;
        foreach (var el in allControls(root, false)) {
          ctx.Add(new strFn {
            fn = f.url,
            str = getName(el) +
              (!el.Nodes().Any() ? null : "=(" + dumpChildNode(el, false).Where(n => n != null).Distinct().OrderBy(t => t).DefaultIfEmpty().Aggregate((r, i) => r + ", " + i) + ")")
          });
        }
      }
      var groups = ctx.GroupBy(s => s.str).Select(g => new { g.Key, files = g.Select(f => f.fn).ToArray() }).ToArray();
      var lst = groups.Select(g => new { g.Key, count = g.files.Length }).OrderByDescending(g => g.count).Select(g => g.Key + " (" + g.count.ToString() + ")");
      File.WriteAllLines(dataBasicPath(false) + @"contains.txt", lst);
      File.WriteAllLines(dataBasicPath(false) + @"contextByTag.txt", lst.OrderBy(s => s));
      foreach (var g in groups/*.Where(t => t.files.Length > 10)*/) File.WriteAllLines(dataBasicPath(false) + @"contains\" + g.Key + ".txt", g.files.Distinct());
    }

    static void tagMix(bool all) {
      List<xref> res = new List<xref>();
      foreach (var f in readFiles(null)) {
        XElement root = f.statContent; string url = f.url;
        foreach (var el in allControls(root, all)) {
          if (el.HasAttributes) {
            var props = controlProp.getControlPropValues(el);
            foreach (var attr in props) {
              var attrId = el.Name.LocalName + "." + attr.Key;
              if (!enumPropsHash.Contains(attrId)) continue;
              res.Add(new xref {
                file = url,
                prop = attr.Key,
                tag = el.Name.LocalName,
                propValue = attr.Value,
              });
            }
          }
          res.Add(new xref { file = url, tag = el.Name.LocalName });
        }
      }
      //statControls, props and enum prop values
      var propXref = res.GroupBy(xr => xr, xrefComp.propsVal).Select(g => new { key = firstUpper(g.Key.tag, true) + "." + firstUpper(g.Key.prop, true) + (g.Key.propValue == null ? null : "--" + g.Key.propValue), files = g.Select(f => f.file).Distinct().ToArray() });
      XElement xml = new XElement("root", propXref.OrderByDescending(px => px.files.Length).Select(px => new XElement(px.key, new XAttribute("count", px.files.Length.ToString()), new XCData("\r\n" + px.files.Take(10).Aggregate((r, i) => r + "\r\n" + i) + "\r\n"))));
      xml.Save(dataBasicPath(all) + @"propEnumValue.xml");
      File.WriteAllLines(dataBasicPath(all) + @"propEnumValue.txt", propXref.Select(px => px.key + " (" + px.files.Length.ToString() + ")").OrderBy(s => s));
      File.WriteAllLines(dataBasicPath(all) + @"propEnumValue_num.txt", propXref.OrderByDescending(px => px.files.Length).Select(px => px.key + " (" + px.files.Length.ToString() + ")"));

      //eval statControls groups
      Func<string, bool> containsCond = s => false;
      var ctrls = res.GroupBy(r => r.file).
        Select(f => new { f, grp = f.Select(x => x.tag).Where(t => _controlsNames(all).Contains(t)).Distinct().OrderBy(t => t).DefaultIfEmpty().Select(t => firstUpper(t, true)).Aggregate((r, i) => r + " " + i) }).
        GroupBy(fg => fg.grp).
        Select(g => new { g.Key, files = g.Select(t => t.f.Key).ToArray() }).
        OrderByDescending(g => g.files.Length);
      File.WriteAllLines(dataBasicPath(all) + @"evalSoundMixins.txt", ctrls.Select(g => g.Key + " (" + g.files.Length.ToString() + ")").OrderBy(s => s));
      File.WriteAllLines(dataBasicPath(all) + @"evalSoundMixins_num.txt", ctrls.OrderByDescending(g => g.files.Length).Select(g => g.Key + " (" + g.files.Length.ToString() + ")"));
      foreach (var grp in ctrls) {
        var mixDir = @"tagMix\" + /*grp.files.Length.ToString("D4") + " " +*/ grp.Key;
        var fn = dataBasicPath(all) + mixDir + ".txt";
        File.WriteAllLines(fn, grp.files);
        if (grp.files.Length < 20) continue;
        LowUtils.AdjustDir(dataBasicPath(all) + mixDir + @"\attributes\");
        OldToNew.StatLib.attributes(all, fn, mixDir + "\\");
      }
      File.WriteAllText(dataBasicPath(all) + @"count.txt", res.GroupBy(r => r.file).Count().ToString());
    }

    //****************** helper
    static string dataBasicPath(bool all) { return (exFile.dataBasicPath + (all ? @"data_all\" : @"data\")).ToLower(); }

    static IEnumerable<exFile> readFiles(string txtWithFileNames) {
      var allFiles = fileGroup.getAllFiles();
      if (txtWithFileNames == null) foreach (var kv in allFiles) yield return kv.Value;
      else foreach (var f in File.ReadAllLines(txtWithFileNames)) yield return allFiles[f];
    }

    static string getName(XNode el) { return el.NodeType == XmlNodeType.Text ? "^" : (el.NodeType == XmlNodeType.Element ? firstUpper(((XElement)el).Name.LocalName, ((XElement)el).Name.NamespaceName == "lm") : null); }
    public class strFn { public string str; public string fn; }

    static IEnumerable<string> dumpChildNode(XElement el, bool all) {
      foreach (var nd in el.Nodes()) yield return getName(nd);
      foreach (var e in allControls(el, all)) yield return getName(e);
    }
    static string firstUpper(string str, bool isUp) {
      if (!isUp || str == null || str.Length == 0) return str;
      var chs = str.ToCharArray(); chs[0] = char.ToUpper(chs[0]);
      for (var i = 0; i < str.Length - 2; i++)
        if (chs[i] == '_') chs[i + 1] = char.ToUpper(chs[i + 1]);
      return new string(chs.Where(ch => ch != '_').ToArray());
    }
  }

  public class xref {
    public string tag;
    public string prop;
    public string propValue;
    public string file;
  }
  public class xrefComp : IEqualityComparer<xref>, IComparer<xref> {
    public static xrefComp all = new xrefComp {
      actEquals = (x, y) => x.tag == y.tag && x.prop == y.prop && x.propValue == y.propValue && x.file == y.file,
      actGetHashCode = x => LowUtils.computeHashCode(x.file, x.prop, x.propValue, x.tag),
      actCompare = (x, y) => LowUtils.computeCompare<xref>(x, y, d => d.file, d => d.prop, d => d.propValue, d => d.tag)
    };

    public static xrefComp props = new xrefComp {
      actEquals = (x, y) => x.tag == y.tag && x.prop == y.prop,
      actGetHashCode = x => LowUtils.computeHashCode(x.prop, x.tag),
      actCompare = (x, y) => LowUtils.computeCompare<xref>(x, y, d => d.tag, d => d.prop)
    };

    public static xrefComp propsVal = new xrefComp {
      actEquals = (x, y) => x.tag == y.tag && x.prop == y.prop && x.propValue == y.propValue,
      actGetHashCode = x => LowUtils.computeHashCode(x.prop, x.tag, x.propValue),
      actCompare = (x, y) => LowUtils.computeCompare<xref>(x, y, d => d.tag, d => d.prop, d => d.propValue)
    };

    public static xrefComp tags = new xrefComp {
      actEquals = (x, y) => x.tag == y.tag,
      actGetHashCode = x => LowUtils.computeHashCode(x.tag),
      actCompare = (x, y) => LowUtils.computeCompare<xref>(x, y, d => d.tag)
    };

    Func<xref, xref, bool> actEquals; Func<xref, int> actGetHashCode; Func<xref, xref, int> actCompare;
    bool IEqualityComparer<xref>.Equals(xref x, xref y) { return actEquals(x, y); }
    int IEqualityComparer<xref>.GetHashCode(xref obj) { return actGetHashCode(obj); }
    int IComparer<xref>.Compare(xref x, xref y) { return actCompare(x, y); }
  }
}
