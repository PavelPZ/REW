using LMComLib;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Xml.Linq;
using System.IO;
using System.Text.RegularExpressions;
using System.Text;
using LMScormLibDOM;

namespace OldToNew {

  public enum transforms {
    selection,
    dropdown,
    gap_fill,
    pairing,
    sound,
    eval_mark,
    table,
    passive_dialog,
    classification,
    wordOrdering,
    sentenceOrdering,
    checkItem,
  }

  public static class trans {

    public static string form(string fn) {
      var url = exFile.fileToUrl(fn);
      var fg = fileGroup.fileGroups.FirstOrDefault(g => g.urls.Contains(url));
      if (fg == null) return null;
      XElement root = XElement.Load(fn, LoadOptions.PreserveWhitespace);
      foreach (var tr in fg.transformIds) form(tr, root);
      return root.ToString(SaveOptions.DisableFormatting);
    }

    public static void form(transforms tr, XElement xml) {
      switch (tr) {
        case transforms.gap_fill: fileGroup.transform_simple_gap_fill(xml); break;
        case transforms.eval_mark: fileGroup.transform_eval_mark(xml); break;
        case transforms.sound: fileGroup.transform_sound(xml); break;
        case transforms.pairing: fileGroup.transform_pairing(xml); break;
        case transforms.dropdown: fileGroup.transform_dropdown(xml); break;
        case transforms.selection: fileGroup.transform_selection(xml); break;
        case transforms.table: fileGroup.transform_table(xml); break;
        case transforms.classification: fileGroup.transform_classification(xml); break;
        case transforms.wordOrdering: fileGroup.transform_word_ordering(xml); break;
        case transforms.sentenceOrdering: fileGroup.transform_sentence_ordering(xml); break;
        case transforms.checkItem: fileGroup.transform_check_item(xml); break;
        default: throw new NotImplementedException();
      }
    }
  }

  //skupina lmdata souboru, vybrana podle "filter" kriterii (kolik jakych tagu obsahuji, jake atributy apod)
  public partial class fileGroup {
    static fileGroup() {
      for (var i = 0; i < fileGroups.Length; i++) fileGroups[i].id = (i + 1).ToString("D2") + "-" + fileGroups[i].id;
    }

    public static Dictionary<string, exFile> getAllFiles() {
      if (_allFiles == null) _allFiles = lmdataDirs.SelectMany(d => Directory.EnumerateFiles(exFile.basicpath + "\\" + d, "*.htm.aspx.lmdata", SearchOption.AllDirectories).Select(f => new exFile(f))).ToDictionary(f => f.url, f => f);
      return _allFiles;
    } static Dictionary<string, exFile> _allFiles;
    static string[] lmdataDirs = new string[] {
      "english1", "english1e", "english2", "english2e", "english3", "english3e", "english4", "english4e", "english5", "english5e",
      "french1", "french2", "french3",
      "german1", "german2", "german3",
      "italian1", "italian2", "italian3",
      "russian1", "russian2", "russian3",
      "spanish1", "spanish2", "spanish3"};

    public static void refreshAllFiles() { _allFiles = null; }

    public string descr; //popis
    public Func<exFile, bool> filter; //filter pro zatrideni do groups

    public string id;
    public transforms[] transformIds;
    public int priority;
    public HashSet<string> urls {
      get {
        if (_urls == null) {
          var fns = File.ReadAllLines(Machines.basicPath + @"rew\OldToNewData\fileGroups\" + id + ".txt").Where(l => !string.IsNullOrEmpty(l) && !l.StartsWith("*")).Select(f => f.Replace('\\', '/').ToLower());
          _urls = new HashSet<string>(fns);
        }
        return _urls;
      }
    } HashSet<string> _urls;

    public static fileGroup[] fileGroups = new fileGroup[] { 
        new fileGroup{id = "passive", filter = passive, descr = @"
  Pasivni cviceni"},
        new fileGroup{id = "gap_fill-eval_mark", filter = simpleGapFill, transformIds = new transforms[]{transforms.table, transforms.gap_fill, transforms.eval_mark}, descr = @"
  Cviceni pouze s gap_fill NEBO eval_mark
  - pouze atributy child_attrs, correct, eval_mode, group_eq_width, group_set, id, inline
"},
        new fileGroup{id = "sound-only", filter = soundOnly, transformIds = new transforms[]{transforms.table, transforms.sound}, descr = @"
  Cviceni pouze s sound controls (sound_sentences, sound_sentence, sound_mark, sound_dialog, sound, role)
  - sound.layout je pouze normal
  - sentence layout pouze text nebo hidden
"},
        new fileGroup{id = "sound-only_gap_fill-eval_mark", filter = sound_gap_fill, transformIds = new transforms[]{transforms.table, transforms.sound, transforms.gap_fill, transforms.eval_mark}, descr = @"
  sound NEBO gap_fill-eval_mark
"},
        new fileGroup{id = "simple-pairing", filter = simple_pairing, transformIds = new transforms[]{transforms.table, transforms.pairing}, descr = @"
  POUZE pairing
"},
        new fileGroup{id = "other-pairing", filter = other_pairing, transformIds = new transforms[]{transforms.table, transforms.gap_fill, transforms.sound, transforms.pairing, transforms.eval_mark}, descr = @"
  pairing  NEBO gap_fill-eval_mark NEBO sound
"},
        new fileGroup{id = "simple-gap_fill_source", filter = root => simple_gap_fill_source(root), transformIds = new transforms[]{transforms.table, transforms.dropdown, transforms.gap_fill, transforms.eval_mark}, descr = @"
  POUZE gap_fill_source a gap_fill
"},
        new fileGroup{id = "other-drag-gap_fill_source", filter = root => other_gap_fill_source(root), transformIds = new transforms[]{transforms.table, transforms.dropdown, transforms.gap_fill, transforms.sound, transforms.pairing, transforms.eval_mark}, descr = @"
  gap_fill_source NEBO sound NEBO pairing NEBO gap_fill-eval_mark
"},
        new fileGroup{id = "selection-radio-title", filter = root => selection(root, true, true), transformIds = new transforms[]{transforms.table, transforms.selection, transforms.dropdown, transforms.gap_fill, transforms.sound, transforms.pairing, transforms.eval_mark}, descr = @"
  selection s type=radioButton a s neprazdnym title attributem
  NEBO gap_fill_source NEBO gap_fill-eval_mark NEBO sound NEBO pairing
"},
        new fileGroup{id = "selection-radio", filter = root => selection(root, false, true), transformIds = new transforms[]{transforms.table, transforms.selection, transforms.dropdown, transforms.gap_fill, transforms.sound, transforms.pairing, transforms.eval_mark}, descr = @"
  selection s type=radioButton NEBO gap_fill_source NEBO gap_fill-eval_mark NEBO sound NEBO pairing
"},
        new fileGroup{id = "gapfill-example-init", filter = exampleGapFill, transformIds = new transforms[]{transforms.table, transforms.selection, transforms.dropdown, transforms.gap_fill, transforms.sound, transforms.pairing, transforms.eval_mark}, descr = @"
  vsechny gap-fill NEBO selection s type=radioButton NEBO gap_fill_source NEBO sound NEBO pairing
"},
        new fileGroup{id = "classification", filter = classification, transformIds = new transforms[]{transforms.table, transforms.selection, transforms.dropdown, transforms.gap_fill, transforms.sound, transforms.pairing, transforms.classification, transforms.eval_mark}, descr = @"
  classification
"},
        new fileGroup{id = "wordordering", filter = wordOrdering, transformIds = new transforms[]{transforms.table, transforms.selection, transforms.dropdown, transforms.gap_fill, transforms.sound, transforms.pairing, transforms.classification, transforms.wordOrdering, transforms.eval_mark}, descr = @"
  word-ordering
"},
        new fileGroup{id = "sentenceordering", filter = sentenceOrdering, transformIds = new transforms[]{transforms.table, transforms.selection, transforms.dropdown, transforms.gap_fill, transforms.sound, transforms.pairing, transforms.classification, transforms.wordOrdering, transforms.sentenceOrdering, transforms.eval_mark}, descr = @"
  sentence-ordering
"},
        new fileGroup{id = "selection-checkbox", filter = root => selection(root, false, false) || selection(root, true, false), transformIds = new transforms[]{transforms.table, transforms.selection, transforms.dropdown, transforms.gap_fill, transforms.sound, transforms.pairing, transforms.eval_mark}, descr = @"
  selection s type=checkBox
"},
        new fileGroup{id = "checkItem", filter = checkItem, transformIds = new transforms[]{transforms.table, transforms.selection, transforms.dropdown, transforms.gap_fill, transforms.sound, transforms.pairing, transforms.classification, transforms.wordOrdering, transforms.sentenceOrdering, transforms.checkItem, transforms.eval_mark}, descr = @"
  check-item
"},
        new fileGroup{id = "the-rest", filter = x => true, transformIds = new transforms[]{transforms.table, transforms.selection, transforms.dropdown, transforms.gap_fill, transforms.sound, transforms.pairing, transforms.classification, transforms.wordOrdering, transforms.sentenceOrdering, transforms.checkItem, transforms.eval_mark}, descr = @"
  zbytek
"},
        new fileGroup{id = "todo", filter = other, descr = @"
  Ostatni cviceni
"},
    };

    static string[] tg_table = new string[] { "table" };
    //static string[] tg_table = new string[0];
    static string[] tg_gapFill_evalMark = new string[] { "gap_fill", "eval_mark" };
    static string[] tg_sound = StatLib.soundControls.Except(XExtension.Create("hide_control")).ToArray();
    static HashSet<string> tg_soundSet = new HashSet<string>(tg_sound);
    static string[] tg_pairing = new string[] { "pairing", "item", "html" }; //lm: (nikoliv html:) kontrolky
    static string[] tg_gapFillSource = new string[] { "gap_fill_source", "gap_fill" };
    static string[] tg_selection = new string[] { "selection", "check_item" };
    static string[] tg_classification = new string[] { "classification" };
    static string[] tg_wordOrdering = new string[] { "word_ordering" };
    static string[] tg_sentenceOrdering = new string[] { "sentence_ordering" };

    static bool simpleGapFill(exFile root) {
      return
        !root.statNames.Except(tg_gapFill_evalMark).Any() &&
        simpleGapFill_(root, gapFillSets.simple);
    }
    static bool soundOnly(exFile root) {
      return
        !root.statNames.Except(tg_sound).Any() &&
        sound_(root);
    }
    static bool sound_gap_fill(exFile root) {
      return
        !root.statNames.Except(tg_gapFill_evalMark.Concat(tg_sound).Concat(tg_table)).Any() &&
        gapFillCondition(root, gapFillSets.simple) &&
        soundCondition(root);
    }
    static bool simple_pairing(exFile root) {
      return
        !root.statNames.Except(tg_pairing).Any() &&
        simple_pairing_(root, tg_simplePairItem);
    }
    static bool other_pairing(exFile root) {
      return
        !root.statNames.Except(tg_gapFill_evalMark.Concat(tg_sound).Concat(tg_pairing).Concat(tg_table)).Any() &&
        gapFillCondition(root, gapFillSets.simple) &&
        soundCondition(root) &&
        pairingCondition(root);
    }
    static bool simple_gap_fill_source(exFile root) {
      return
        !root.statNames.Except(tg_gapFillSource).Any() &&
        simpleGapFill_(root, gapFillSets.dragSource);
    }
    static bool other_gap_fill_source(exFile root) {
      return
        !root.statNames.Except(tg_gapFillSource.Concat(tg_sound).Concat(tg_pairing).Concat(tg_table)).Any() &&
        gapFillCondition(root, gapFillSets.noInit) &&
        soundCondition(root) &&
        pairingCondition(root);
    }
    static bool selection(exFile root, bool testWithTitle, bool? isRadio) {
      return
        !root.statNames.Except(tg_selection.Concat(tg_gapFillSource).Concat(tg_gapFill_evalMark).Concat(tg_sound).Concat(tg_pairing).Concat(tg_table)).Any() &&
        (selection_(root, testWithTitle, isRadio)) &&
        gapFillCondition(root, gapFillSets.noInit) &&
        soundCondition(root) &&
        pairingCondition(root);
    }
    static bool exampleGapFill(exFile root) {
      return
        !root.statNames.Except(tg_selection.Concat(tg_gapFillSource).Concat(tg_gapFill_evalMark).Concat(tg_sound).Concat(tg_pairing).Concat(tg_table)).Any() &&
        gapFillCondition(root, gapFillSets.all) &&
        soundCondition(root) &&
        pairingCondition(root) &&
        selectionCondition(root);
    }
    static bool classification(exFile root) {
      return
        !root.statNames.Except(tg_selection.Concat(tg_gapFillSource).Concat(tg_gapFill_evalMark).Concat(tg_sound).Concat(tg_pairing).Concat(tg_table).Concat(tg_classification)).Any() &&
        gapFillCondition(root, gapFillSets.all) &&
        soundCondition(root) &&
        pairingCondition(root) &&
        selectionCondition(root);
      //classificationCondition(root);
    }

    static bool wordOrdering(exFile root) {
      return
        !root.statNames.Except(tg_selection.Concat(tg_gapFillSource).Concat(tg_gapFill_evalMark).Concat(tg_sound).Concat(tg_pairing).Concat(tg_table).Concat(tg_classification).Concat(tg_wordOrdering)).Any() &&
        gapFillCondition(root, gapFillSets.all) &&
        soundCondition(root) &&
        pairingCondition(root) &&
        selectionCondition(root);
      //classificationCondition(root) &&
      //wordOrderingCondition(root);
    }

    static bool sentenceOrdering(exFile root) {
      return
        !root.statNames.Except(tg_selection.Concat(tg_gapFillSource).Concat(tg_gapFill_evalMark).Concat(tg_sound).Concat(tg_pairing).Concat(tg_table).Concat(tg_classification).Concat(tg_wordOrdering).Concat(tg_sentenceOrdering)).Any() &&
        gapFillCondition(root, gapFillSets.all) &&
        soundCondition(root) &&
        pairingCondition(root) &&
        selectionCondition(root); // &&
      //classificationCondition(root) &&
      //wordOrderingCondition(root) &&
      //sentenceOrderingCondition(root);
    }

    static bool checkItem(exFile root) {
      return
        !root.statNames.Except(tg_selection.Concat(tg_gapFillSource).Concat(tg_gapFill_evalMark).Concat(tg_sound).Concat(tg_pairing).Concat(tg_table).Concat(tg_classification).Concat(tg_wordOrdering).Concat(tg_sentenceOrdering)).Any() &&
        gapFillCondition(root, gapFillSets.all) &&
        soundCondition(root) &&
        pairingCondition(root);
      //selectionCondition(root) &&
      //classificationCondition(root) &&
      //wordOrderingCondition(root) &&
      //checkItemCondition(root);
    }

    public static void generator() {
      foreach (var fn in Directory.EnumerateFiles(Machines.basicPath + @"rew\OldToNewData\fileGroups", "*.txt")) File.Delete(fn);
      var all = getAllFiles().Values.ToArray();
      File.WriteAllLines(@"d:\LMCom\rew\OldToNewData\fileGroups\allXmlNew.txt", all.Select(e => e.fileName(CourseMeta.oldeaDataType.lmdataNew)));
      var allCnt = all.Length;
      HashSet<string> done = new HashSet<string>(); HashSet<exFile> doneFiles = new HashSet<exFile>(); HashSet<exFile> todoFiles = new HashSet<exFile>();
      using (var doc = File.Create(@"d:\LMCom\rew\OldToNewData\fileGroups\documentation.txt"))
      using (var wr = new StreamWriter(doc)) {
        wr.WriteLine("******************************************");
        wr.WriteLine("celkem " + allCnt.ToString());
        wr.WriteLine();
        wr.WriteLine();

        foreach (var fileGroup in fileGroups) {
          var actCnt = 0;
          List<string> res = new List<string>();
          foreach (var f in all.Where(t => !done.Contains(t.url))) {
            if (!fileGroup.filter(f)) continue;
            res.Add(f.url);
            done.Add(f.url);
            (fileGroup.id.EndsWith("todo") ? todoFiles : doneFiles).Add(f);
            actCnt++;
          }
          File.WriteAllLines(Machines.basicPath + @"rew\OldToNewData\fileGroups\" + fileGroup.id + ".txt", res);
          //wr.WriteLine("******************************************");
          wr.WriteLine("*** " + fileGroup.id + string.Format(", {0} / {1}", actCnt, allCnt));
          allCnt -= actCnt;
          wr.WriteLine(fileGroup.descr);
          wr.WriteLine();
        }
        //add hoc seznamy
        File.WriteAllLines(Machines.basicPath + @"rew\OldToNewData\fileGroups\problem_BT_2159.txt", doneFiles.Where(d => problem_BT_2159(d)).Select(d => d.url));
        File.WriteAllLines(Machines.basicPath + @"rew\OldToNewData\fileGroups\problem_BT_2158.txt", doneFiles.Where(d => problem_BT_2158(d)).Select(d => d.url));
        File.WriteAllLines(Machines.basicPath + @"rew\OldToNewData\fileGroups\problem_BT_2172.txt", doneFiles.Where(d => problem_BT_2172(d)).Select(d => d.url));
        File.WriteAllLines(Machines.basicPath + @"rew\OldToNewData\fileGroups\problem_BT_2167.txt", doneFiles.Where(d => problem_BT_2167(d)).Select(d => d.url));
        File.WriteAllLines(Machines.basicPath + @"rew\OldToNewData\fileGroups\problem_BT_2166.txt", doneFiles.Where(d => problem_BT_2166(d)).Select(d => d.url));
        File.WriteAllLines(Machines.basicPath + @"rew\OldToNewData\fileGroups\problem_BT_2176.txt", doneFiles.Where(d => problem_BT_2176(d)).Select(d => d.url));
        File.WriteAllLines(Machines.basicPath + @"rew\OldToNewData\fileGroups\problem_BT_2207.txt", doneFiles.Where(d => problem_BT_2207(d)).Select(d => d.url));
        //File.WriteAllLines(Machines.basicPath + @"rew\OldToNewData\fileGroups\todoFilter.txt", todoFiles.Where(d => todoFilter(d)).Select(d => d.url));
      }
    }

    static bool passive(exFile root) { return root.statNames.Length == 0; }
    static bool other(exFile root) { return true; }

    static bool problem_BT_2166(exFile root) {
      var drags = root.statControls.Where(e => e.Name.LocalName == "gap_fill_source");
      if (!drags.Any()) return false;
      var gapFills = root.statControls.Where(e => e.Name.LocalName == "gap_fill").Where(g => !string.IsNullOrEmpty(g.AttributeValue("group_set")));
      if (!gapFills.Any()) return false;
      return true;
    }
    static bool problem_BT_2167(exFile root) {
      var drags = root.statControls.Where(e => e.Name.LocalName == "gap_fill_source").Where(g => g.AttributeValue("type") == "Drag" || g.AttributeValue("type") == "DragAll");
      if (!drags.Any()) return false;
      var gapFills = root.statControls.Where(e => e.Name.LocalName == "gap_fill").Where(g => g.AttributeValue("correct").Any(ch => char.IsUpper(ch)) && g.AttributeValue("eval_mode") != "caseSensitive");
      if (!gapFills.Any()) return false;
      return true;
    }
    static bool problem_BT_2172(exFile root) {
      var gapFills = root.statControls.Where(e => e.Name.LocalName == "gap_fill").Where(g => g.AttributeValue("width") != null);
      return gapFills.Any();
    }
    static bool problem_BT_2158(exFile root) {
      var drags = root.statControls.Where(e => e.Name.LocalName == "gap_fill_source").ToArray(); if (drags.Length != 1) return false;
      if (drags[0].AttributeValue("type") != "DragAll") return false;
      var gapFills = root.statControls.Where(e => e.Name.LocalName == "gap_fill").SelectMany(g => g.Attributes("correct")).Select(a => a.Value).GroupBy(v => v);
      return gapFills.Any(g => g.Count() > 1);
    }
    static bool problem_BT_2176(exFile root) {
      var tables = root.statContent.Descendants(exFile.lm + "table").Where(t => t.AttributeValue("start_with") == "evalControl");
      //var tables = root.statContent.Descendants(exFile.lm + "table").Where(t => t.AttributeValue("start_with") == "evalControl");
      //tables = tables.Where(t => t.AttributeValue("start_with") == "evalControl" && !t.Elements().All(e => e.Name.LocalName == "row") && !t.Elements().All(e => e.Name.LocalName == "control"));
      //tables = tables.Where(t => t.AttributeValue("start_with") == "evalControl" && t.Elements().All(e => e.Name.LocalName == "control"));
      //var tables = tables.Where(t => t.AttributeValue("start_with") == "evalControl" && t.Descendants().Select(d => d.Name.LocalName).Any(n => StatLib._evalControlsName.Contains(n) && n != "gap_fill" && n != "eval_mark"));
      return tables.Any();
    }
    static bool problem_BT_2159(exFile root) {
      var gapFills = root.statControls.Where(e => e.Name.LocalName == "gap_fill").Where(g => g.AttributeValue("correct") == ""/*&& g.AttributeValue("width") != null*/);
      return gapFills.Any();
    }

    static bool problem_BT_2207(exFile root) {
      var soundAll = root.statControls.Where(e => tg_sound.Contains(e.Name.LocalName));
      if (!soundAll.Any()) return false;
      var ignoreSoundAttrs = root.statControls.SelectMany(sound => sound.Attributes("ignore_sound"));
      return ignoreSoundAttrs.Any(a => a.Value == "map");
    }

    static bool todoFilter(exFile root) {
      var sound = root.statControls.Where(e => (e.Name.LocalName == "sound" || e.Name.LocalName == "sound_dialog") && e.AttributeValue("ignore_sound") != "no");
      var checkBox = root.statControls.Where(e => e.Name.LocalName == "selection" && e.AttributeValue("type") != "radioButton");
      return sound.Any() || checkBox.Any();
    }
    [Flags]
    public enum gapFillSets {
      simple,
      initExample,
      dragSource,
      noInit = simple | dragSource,
      all = simple | initExample | dragSource,
    }


    static IEnumerable<XElement> tableCondition(XElement xml) {
      return xml.Descendants(exFile.lm + "table").Where(t =>
        t.AttributeValue("start_with") == "evalControl" &&
        (t.Elements().All(e => e.Name.LocalName == "row") || t.Elements().All(e => e.Name.LocalName == "control")) &&
        t.Descendants().Select(d => d.Name.LocalName).All(n => !StatLib._evalControlsName.Contains(n) || n == "gap_fill"));
    }
    //table transform
    public static void transform_table(XElement xml) {
      int groupCnt = 0;
      foreach (var t in xml.Descendants(exFile.lm + "table").Where(t =>
        t.AttributeValue("start_with") == "evalControl" &&
        (t.Elements().All(e => e.Name.LocalName == "row") || t.Elements().All(e => e.Name.LocalName == "control")) &&
        t.Descendants().Select(d => d.Name.LocalName).All(n => !StatLib._evalControlsName.Contains(n) || n == "gap_fill"))) {
        var isRow = t.Elements().First().Name.LocalName == "row";
        if (isRow) {
          if (t.Elements().Any(e => !e.Descendants(exFile.lm + "gap_fill").Any())) continue;
          foreach (var row in t.Elements().ToArray()) {
            var gapFills = row.Descendants(exFile.lm + "gap_fill").ToArray();
            if (gapFills.Length == 0) throw new Exception("transform_table, row, gapFills.Length == 0");
            var gid = "g" + groupCnt++.ToString();
            foreach (var gp in gapFills) gp.SetAttributeValue("group_eval", gid);
            row.AddFirst(new XElement(exFile.lm + "eval_mark", new XAttribute("group", "@" + gid)));
          }
        } else {
          if (t.Elements().Any(e => !e.Descendants(exFile.lm + "gap_fill").Any())) continue;
          foreach (var cell in t.Elements().ToArray()) {
            var gapFills = cell.Descendants(exFile.lm + "gap_fill").ToArray();
            if (gapFills.Length == 0) throw new Exception("transform_table, cell, gapFills.Length == 0");
            var gid = "g" + groupCnt++.ToString();
            foreach (var gp in gapFills) gp.SetAttributeValue("group_eval", gid);
            var row = new XElement(exFile.lm + "row", new XElement(exFile.lm + "eval_mark", new XAttribute("group", "@" + gid)));
            cell.ReplaceWith(row);
            row.Add(cell);
          }
        }
      }
    }

    //*********************** simpleGapFill
    static bool simpleGapFill_(exFile root, gapFillSets set) {
      var gapFills = root.statControls.Where(e => e.Name.LocalName == "gap_fill").ToArray();
      if (gapFills.Length == 0) return false;
      var atts = gapFills.SelectMany(gapFill => gapFill.Attributes()).Select(a => a.Name.LocalName).Distinct().ToArray();
      return (atts.All(at => {
        //if (at == "group_eval" /*|| at == "width"*/) return false;
        if ((set & gapFillSets.dragSource) == 0 && at == "drag_source") return false;
        if ((set & gapFillSets.initExample) == 0 && (at == "init_value" || at == "example" || at == "width" || at == "group_eval")) return false;
        return true;
      }));
    }
    static bool gapFillCondition(exFile root, gapFillSets set) {
      if (!root.statNames.Contains("gap_fill")) return true; //neobsahuje zadny gapfill, pak je OK
      //obsahuje gapfill:
      return simpleGapFill_(root, set); //kontrola gafill atributu
    }
    //static HashSet<string> attrs_simpleGapFill = new HashSet<string>(new string[] { "child_attrs", "correct", /*drag_source, */ "eval_mode", /*"example",*/ "group_eq_width", /*"group_eval",*/ "group_set", "id", /*"init_value",*/ "inline" /*, "width"*/ });
    //static HashSet<string> attrs_dragSourceGapFill = new HashSet<string>(new string[] { "child_attrs", "correct", "drag_source",  "eval_mode", /*"example",*/ "group_eq_width", /*"group_eval",*/ "group_set", "id", /*"init_value",*/ "inline"/*, "width"*/ });
    //static HashSet<string> attrs_initExampleGapFill = new HashSet<string>(new string[] { "child_attrs", "correct", "drag_source", "eval_mode", "example", "group_eq_width", /*"group_eval",*/ "group_set", "id", "init_value", "inline", "width" });

    public static void transform_simple_gap_fill(XElement xml) {
      transform_gps(xml, null, null, 0);
    }
    static void transform_gps(XElement xml, string dragId, List<string> offering, int mode /*0..gapfil, 1..aktivni grid, 2..pasivni grid*/) {
      foreach (var gp in xml.Descendants(exFile.lm + "gap_fill").ToArray()) {
        gp.AddBeforeSelf(new XComment(gp.ToString()));
        var aCorrect = gp.Attribute("correct");
        var aDrag_source = gp.Attribute("drag_source");
        if (mode == 2) {
          if (aDrag_source != null) offering.Add(aDrag_source.Value);
          else if (aCorrect != null) offering.Add(aCorrect.Value);
        }
        var aEval_mode = gp.Attribute("eval_mode");
        var aGroupEqWidth = gp.Attribute("group_eq_width");
        var groupEval = gp.AttributeValue("group_eval");
        if (!string.IsNullOrEmpty(groupEval)) {
          if (!xml.Descendants().Any(el => el.Name.LocalName == "eval_mark" && (el.AttributeValue("id") == groupEval || el.AttributeValue("group") == "@" + groupEval || el.AttributeValue("group") == groupEval))) groupEval = null;
        } else groupEval = null;
        var aGroupSet = gp.Attribute("group_set");
        var aId = gp.Attribute("id");
        var aInitValue = gp.AttributeValue("init_value");
        var aExample = gp.AttributeValue("example");
        int aWidth = -1; var w = (gp.AttributeValue("width") ?? "").Trim();
        if (!string.IsNullOrEmpty(w)) {
          var match = gpWidthMask.Match(w); string val;
          if ((val = match.get("px")) != null) aWidth = int.Parse(val);
          else if ((val = match.get("em")) != null) aWidth = 14 * int.Parse(val);
        }
        XAttribute examleAttr = null;
        if (aExample == "true" || aExample == "1") {
          examleAttr = !string.IsNullOrEmpty(aInitValue) ? new XAttribute("read-only", "true") : new XAttribute("skip-evaluation", "true");
        }
        XElement newTag = new XElement(exFile.html + (mode != 1 || examleAttr != null ? "gap-fill" : "drop-down"),
          aCorrect == null || aCorrect.Value == null ? null : new XAttribute("correct-value", aCorrect.Value.Replace("$del;", "|")),
          aId == null ? null : new XAttribute("id", aId.Value),
          aEval_mode != null && aEval_mode.Value == "caseSensitive" ? new XAttribute("case-sensitive", "true") : null,
          aGroupEqWidth == null ? null : new XAttribute("width-group", aGroupEqWidth.Value),
          groupEval == null ? null : new XAttribute("eval-button-id", groupEval),
          string.IsNullOrEmpty(aInitValue) ? null : new XAttribute("init-value", aInitValue),
          aGroupSet == null || examleAttr != null ? null : new XAttribute("eval-group", aGroupSet.Value + "-exchangeable"),
          //aWidth >= 0 && aGroupEqWidth == null ? new XAttribute("smart-width", "gpw_" + aWidth.ToString()) : null,
          aWidth >= 0 ? new XAttribute("width", aWidth.ToString()) : null,
          mode != 1 || examleAttr != null ? null : new XAttribute("offering-id", dragId)
          );
        if (gp.Parent.Name.LocalName == "row" || gp.Parent.Name.LocalName == "table") gp.AddBeforeSelf(new XElement(exFile.lm + "control", newTag));
        else gp.AddBeforeSelf(newTag);
        if (examleAttr != null) newTag.Add(examleAttr);
        gp.Remove();
      }
    } static Regex gpWidthMask = new Regex(@"^((?<em>\d+)(em|))|((?<px>\d+)(px|pt))$");

    public static void transform_eval_mark(XElement xml) {
      foreach (var gp in xml.Descendants(exFile.lm + "eval_mark").ToArray()) {
        gp.AddBeforeSelf(new XComment(gp.ToString()));
        var group = gp.AttributeValue("group");
        var id = gp.AttributeValue("id");
        XElement res;
        gp.AddBeforeSelf(res = new XElement(exFile.html + "eval-button",
          group == null && id == null ? null : new XAttribute("id", group != null ? group.Replace("@", null) : id)
          ));
        gp.Remove();
      }
    }


    //*********************** soundOnly

    static bool sound_(exFile root) {
      var soundAll = root.statControls.Where(e => tg_sound.Contains(e.Name.LocalName));
      if (!soundAll.Any()) return false;
      //not normal sound.layout
      var soundAttrs = root.statControls.Where(e => e.Name.LocalName == "sound").SelectMany(sound => sound.Attributes("layout"));
      if (soundAttrs.Any(a => a.Value != "normal")) return false;
      //not ignore sound: 
      //BT_2207
      //var ignoreSoundAttrs = root.statControls.SelectMany(sound => sound.Attributes("ignore_sound"));
      //if (ignoreSoundAttrs.Any(a => a.Value != "no")) return false;
      //sentences, sentence.layout
      var sentAttrs = root.statControls.Where(e => e.Name.LocalName == "sound_sentences" || e.Name.LocalName == "sound_sentence").SelectMany(sent => sent.Attributes("layout"));
      if (sentAttrs.Any(a => a.Value != "text" && a.Value != "hidden")) return false;
      return true;
    }

    static bool soundCondition(exFile root) {
      if (root.statNames.All(t => !tg_soundSet.Contains(t))) return true; //neobsahuje zadny sound, pak je OK
      return sound_(root);
    }

    public static void transform_sound(XElement xml) {
      //pasivni dialogy
      var passiveDlgs = xml.Descendants().Where(e => e.Name.LocalName == "sound_dialog" && e.AttributeValue("ignore_sound") == "map").ToArray();
      foreach (var dlg in passiveDlgs) {
        dlg.AddBeforeSelf(new XComment(dlg.ToString()));
        dlg.AddBeforeSelf(
          new XElement("media-text", new XAttribute("passive", "true"), new XElement("cut-dialog",
            dlg.Elements().Select(el => new XElement("replica",
              el.AttributeValue("role_text") != null ? new XAttribute("actor-name", el.AttributeValue("role_text")) : null,
              el.AttributeValue("role_icon") != null ? new XAttribute("actor-id", el.AttributeValue("role_icon").ToLower()) : null,
              new XElement("phrase", el.Nodes())))))
        );
        dlg.Remove();
      }
      //pojmenuj sentences, aby sla v oldToNewSound knihovne nize parovat sentence s puvodnim XML
      var sentIdCnt = 0;
      foreach (var sent in xml.Descendants(exFile.lm + "sound_sentence")) {
        if (sent.Attribute("id") == null) sent.SetAttributeValue("id", "o2n_" + (sentIdCnt++).ToString());
      }
    }

    //*********************** pairing
    static bool simple_pairing_(exFile root, string[] itemTags) {
      if (!root.statNames.Contains("pairing")) return false;
      var pairItems = root.statControls.Where(e => e.Name.LocalName == "pairing").ToArray();
      pairItems = pairItems.Elements().ToArray();
      if (pairItems.Any(p => p.Name.LocalName != "item")) throw new Exception();
      if (pairItems.Any(p => p.Nodes().Count() != 2 || p.Elements().Count() != 2)) throw new Exception();
      if (pairItems.Any(p => p.Elements().Select(e => e.Name.LocalName).Except(new string[] { "html", "sound_mark" }).Any())) throw new Exception();
      //pokud tag, tak jako jediny element
      foreach (var pi in pairItems.SelectMany(pi => pi.Elements())) {
        bool isFirst = pi == pi.Parent.Elements().First();
        if (isFirst && pi.Name.LocalName == "sound_mark") continue;
        if (pi.Name.LocalName != "html") throw new Exception();
        if (!pi.Elements().Any()) continue;
        var htmlTags = pi.Elements().Select(e => e.Name.LocalName).ToArray();
        if (!isFirst && htmlTags.Length > 1) return false; // throw new Exception();
        if (itemTags != null && htmlTags.Except(itemTags).Any()) return false;
      }
      return true;
      //if (pairItems.SelectMany(p => p.Descendants()).Any(d => d.Name.LocalName != "html" && d.Name.LocalName != "trans")) return true;
      //return false;
    }
    static string[] tg_simplePairItem = new string[] { "trans", "html" }; //tagy, povolene v item

    static bool pairingCondition(exFile root) {
      if (!root.statNames.Contains("pairing")) return true; //neobsahuje zadny pairing, pak je OK
      return simple_pairing_(root, null);
    }

    public static void transform_pairing(XElement xml) {
      Func<bool, XElement, object> getItemContent = (left, el) => {
        if (el.Name.LocalName == "sound_mark") if (left) return el; else throw new Exception("Send URL to PZ");
        if (el.Elements(exFile.html + "trans").Count() == 1) return el.Elements().First().Value;
        if (!el.Elements().Any()) return el.Value.Trim('\r', '\n', ' ');
        if (!left) throw new Exception("Send URL to PZ");
        return el.Nodes();
      };
      foreach (var pairing in xml.Descendants(exFile.lm + "pairing").ToArray()) {
        pairing.AddBeforeSelf(new XComment(pairing.ToString()));
        pairing.AddBeforeSelf(new XElement(exFile.html + "pairing", new XAttribute("left-random", "false"), pairing.Elements().Select(item =>
          new XElement(exFile.html + "pairing-item",
            new XAttribute("right", getItemContent(false, item.Elements().Skip(1).First())),
            getItemContent(true, item.Elements().First())
            ))));
        pairing.Remove();
      }
    }

    //**************** gap_fill_source

    public static void transform_dropdown(XElement xml) {
      var dragSrc = xml.Descendants(exFile.lm + "gap_fill_source").FirstOrDefault(); if (dragSrc == null) return;
      dragSrc.AddBeforeSelf(new XComment(dragSrc.ToString()));
      var aDragId = dragSrc.Attribute("id");
      var aType = dragSrc.AttributeValue("type");
      if (aType == "Drag" || aType == "DragAll") {
        dragSrc.AddBeforeSelf(new XElement(exFile.html + "offering",
          aDragId == null ? null : new XAttribute("id", aDragId.Value),
          new XAttribute("mode", aType == "Drag" ? "drop-down-keep" : "drop-down-discard")
        ));
        transform_gps(xml, aDragId == null ? "" : aDragId.Value, null, 1);
      } else {
        List<string> src = new List<string>();
        transform_gps(xml, aDragId == null ? "" : aDragId.Value, src, 2);
        src = src.Select(s => s.Replace("$del;", "|")).Distinct().ToList();

        //BT 2147: problem hodnot seznamu, co se lisi pouze velikost pismen: vyber lowercase variantu
        var repls = src.Distinct().GroupBy(l => l.ToLower()).Where(g => g.Count() > 1).SelectMany(g => g.Select(v => new { g.Key, Val = v })).ToDictionary(kv => kv.Val, kv => kv.Key);
        if (repls.Count > 0) {
          for (var i = 0; i < src.Count; i++) if (repls.ContainsKey(src[i])) src[i] = repls[src[i]];
          src = src.Distinct().ToList();
        }

        var words = src.DefaultIfEmpty().Aggregate((r, i) => r + "|" + i);
        dragSrc.AddBeforeSelf(new XElement(exFile.html + "offering",
          aDragId == null ? null : new XAttribute("id", aDragId.Value),
          new XAttribute("mode", "gap-fill-ignore"),
          new XAttribute("words", words)
        ));
      }
      dragSrc.Remove();
    }

    //**************** selection-radioButton
    static bool selection_(exFile root, bool testWithTitle, bool? isRadio) {
      Func<string, bool> test = type => {
        if (isRadio == null) return true; //radioButton nebo checkBox
        if (isRadio == true) return type == "radioButton"; //radioButton
        return type != "radioButton"; //checkBox
      };
      var gfSrc = root.statControls.Where(e => e.Name.LocalName == "selection" && test(e.AttributeValue("type"))).ToArray();
      if (gfSrc.Length == 0) return false;
      if (testWithTitle && gfSrc.Any(s => string.IsNullOrEmpty(s.AttributeValue("title")))) return false;
      var chits = root.statControls.Where(e => e.Name.LocalName == "check_item").ToArray();
      if (chits.Length == 0 || chits.Any(c => c.Parent.Name.LocalName != "selection")) return false;
      return true;
    }
    static bool selectionCondition(exFile root) {
      if (!root.statNames.Intersect(tg_selection).Any()) return true; //neni selection, pak OK
      return selection_(root, false, true);
    }

    public static void transform_selection(XElement xml) {
      var sels = xml.Descendants(exFile.lm + "selection").ToArray();
      //html titles se daji pred selection, BT 2149
      var htmlTits = sels.SelectMany(s => s.Attributes("title_html")).ToArray();
      Dictionary<string, XElement> htmlTitles = null;
      if (htmlTits.Length > 0) {
        htmlTitles = xml.Descendants().Select(el => new { el, id = el.AttributeValue("id") }).Where(a => a.id != null).ToDictionary(a => a.id, a => a.el);
      }
      XAttribute attrBuf;
      foreach (var sel in sels) {
        bool isRadio = sel.AttributeValue("type") == "radioButton";
        if (isRadio) {
          string title = sel.AttributeValue("title");
          string htmlTitle = sel.AttributeValue("title_html");
          sel.AddBeforeSelf(new XComment(sel.ToString()));
          XElement newSel;
          sel.AddBeforeSelf(
            new XElement(exFile.lm + "control",
            //  string.IsNullOrEmpty(title) ? null : new XElement(exFile.html + "header-prop", new XElement(exFile.html + "h4", title)),
              string.IsNullOrEmpty(title) ? null : new XElement(exFile.html + "h4", title),
              newSel = new XElement(exFile.html + "single-choice",
                (attrBuf = sel.Attribute("id")) == null ? null : new XAttribute("id", attrBuf.Value),
                sel.Elements().Select(cb =>
                  new XElement(exFile.html + "radio-button",
                    (attrBuf = cb.Attribute("id")) == null ? null : new XAttribute("id", attrBuf.Value),
                    cb.AttributeValue("title"),
                    cb.AttributeValue("init_value") == "Checked" ? new XAttribute("init-value", "true") : null,
                    (attrBuf = cb.Attribute("correct")) == null ? null : new XAttribute("correct-value", attrBuf.Value)
                )))));
          if (htmlTitle != null) {
            htmlTitles[htmlTitle].Remove();
            newSel.AddBeforeSelf(htmlTitles[htmlTitle]);
          }

          var isEx = sel.Elements().Any(cb => new string[] { "true", "1" }.Contains(cb.AttributeValue("example")));
          var isInit = sel.Elements().Any(cb => cb.AttributeValue("init_value") == "Checked");
          if (isEx) {
            newSel.Add(isInit ? new XAttribute("read-only", "true") : new XAttribute("skip-evaluation", "true"));
          }
        } else {
          string title = sel.AttributeValue("title");
          string htmlTitle = sel.AttributeValue("title_html");
          sel.AddBeforeSelf(new XComment(sel.ToString()));
          var id = sel.AttributeValue("id");
          //XElement newSel;
          sel.AddBeforeSelf(
            new XElement(exFile.lm + "control",
              string.IsNullOrEmpty(title) ? null : new XElement(exFile.html + "h4", title),
              htmlTitle == null ? null : htmlTitles[htmlTitle],
                sel.Elements().Select(cb =>
                  new XElement(exFile.html + "check-item",
                    new XAttribute("text-type", "no"),
                    (attrBuf = cb.Attribute("id")) == null ? null : new XAttribute("id", attrBuf.Value),
                    cb.AttributeValue("title"),
                    cb.AttributeValue("eval_group") == "And" && !string.IsNullOrEmpty(id) ? new XAttribute("eval-group", "and-" + id) : null,
                    cb.AttributeValue("init_value") == "Checked" ? new XAttribute("init-value", "True") : null,
                    (attrBuf = cb.Attribute("correct")) == null ? null : new XAttribute("correct-value", attrBuf.Value)
                ))));
          if (htmlTitle != null) htmlTitles[htmlTitle].Remove();

        }
        sel.Remove();
      }
      //if (htmlTitles != null) htmlTitles.Values.Remove();
    }

    //***************** CLASIFICATION

    public static void transform_classification(XElement xml) {
      var cls = xml.Descendants(exFile.lm + "classification").ToArray(); if (cls.Length == 0) return;
      var fakeCnt = 0;
      //html titles se daji pred selection, BT 2149
      var htmlTits = cls.SelectMany(s => s.Attributes("title_html")).ToArray();
      Dictionary<string, XElement> htmlTitles = null;
      if (htmlTits.Length > 0) {
        htmlTitles = xml.Descendants().Select(el => new { el, id = el.AttributeValue("id") }).Where(a => a.id != null).ToDictionary(a => a.id, a => a.el);
      }
      //max pocet prvku
      var rows = cls.Select(c => c.Elements().Count()).Max();
      //comments
      foreach (var cl in cls) cl.AddBeforeSelf(new XComment(cl.ToString()));

      Func<XElement, IEnumerable<XElement>> modifyEds = (cl) => {
        var res = new List<XElement>(cl.Elements());
        var offId = res[0].AttributeValue("offering-id");
        for (int i = res.Count; i < rows; i++) {
          res.Add(new XElement(res[0].Name.LocalName, new XAttribute("correct-value", CourseModel.edit.fakeEdit + (fakeCnt++).ToString()), offId == null ? null : new XAttribute("offering-id", offId)));
        }
        foreach (var ed in res) {
          if (ed.AttributeValue("offering-id") == "") ed.Attribute("offering-id").Remove();
          ed.SetAttributeValue("eval-group", cl.AttributeValue("id") + "-exchangeable");
          ed.SetAttributeValue("width-group", "sw-group");
        }
        return res.Select(e => new XElement("tr", new XElement("td", e)));
      };

      Func<XElement, object> getTitle = cl => {
        var t = cl.AttributeValue("title"); if (t != null) return t;
        t = cl.AttributeValue("title_html"); if (t != null) { var res = htmlTitles[t]; res.Remove(); return res; }
        return null;
      };

      //nahrada za tabulku, uprava childs
      foreach (var cl in cls) {
        cl.AddBeforeSelf(new XElement(exFile.lm + "control", new XElement("table", new XAttribute("class", "table"), new XElement("thead", new XElement("tr", new XAttribute("class", "info"), new XElement("td", getTitle(cl)))),
          new XElement("tbody", modifyEds(cl))
          )));
      }

      //remove
      foreach (var cl in cls) cl.Remove(); //cl.AddBeforeSelf(cl.Elements());
    }

    //***************** WORD ORDERING
    public static void transform_word_ordering(XElement xml) {
      var its = xml.Descendants(exFile.lm + "word_ordering").ToArray(); if (its.Length == 0) return;
      foreach (var it in its) {
        it.AddBeforeSelf(new XComment(it.ToString()));
        var text = it.Nodes().OfType<XText>().Select(t => t.Value).Aggregate((r, i) => r + i);
        var lines = text.Split(new char[] { '\r', '\n' }, StringSplitOptions.RemoveEmptyEntries).Select(s => s.Trim()).Where(s => !string.IsNullOrEmpty(s)).ToArray();
        var id = it.AttributeValue("id");
        var groupEval = it.AttributeValue("group_eval");
        if (!string.IsNullOrEmpty(groupEval)) {
          if (!xml.Descendants().Any(el => el.Name.LocalName == "eval_mark" && (el.AttributeValue("id") == groupEval || el.AttributeValue("group") == "@" + groupEval || el.AttributeValue("group") == groupEval))) groupEval = null;
        } else groupEval = null;
        it.AddBeforeSelf(new XElement("word-ordering",
          groupEval == null ? null : new XAttribute("eval-button-id", groupEval),
          id == null ? null : new XAttribute("id", id),
          new XAttribute("correct-order", lines.Aggregate((r, i) => r + "|" + i))
        ), new XElement("br"));
        it.Remove();
      }
    }

    //***************** SENTENCE ORDERING
    public static void transform_sentence_ordering(XElement xml) {
      var its = xml.Descendants(exFile.lm + "sentence_ordering").ToArray(); if (its.Length == 0) return;
      foreach (var it in its) {
        it.AddBeforeSelf(new XComment(it.ToString()));
        var text = it.Nodes().OfType<XText>().Select(t => t.Value).Aggregate((r, i) => r + i);
        var lines = text.Split(new char[] { '\r', '\n' }, StringSplitOptions.RemoveEmptyEntries).Select(s => s.Trim()).Where(s => !string.IsNullOrEmpty(s)).ToArray();
        var id = it.AttributeValue("id");
        var groupEval = it.AttributeValue("group_eval");
        if (!string.IsNullOrEmpty(groupEval)) {
          if (!xml.Descendants().Any(el => el.Name.LocalName == "eval_mark" && (el.AttributeValue("id") == groupEval || el.AttributeValue("group") == "@" + groupEval || el.AttributeValue("group") == groupEval))) groupEval = null;
        } else groupEval = null;
        it.AddBeforeSelf(new XElement("sentence-ordering",
          groupEval == null ? null : new XAttribute("eval-button-id", groupEval),
          id == null ? null : new XAttribute("id", id),
          lines.Select(l => new XElement("sentence-ordering-item", l))
        ), new XElement("br"));
        it.Remove();
      }
    }

    //***************** CHECK ITEM
    public static void transform_check_item(XElement xml) {
      var chits = xml.Descendants(exFile.lm + "check_item").ToArray(); if (chits.Length == 0) return;
      if (chits.Any(chit => chit.Parent.Name.LocalName == "selection")) throw new Exception("chits.Any(chit => chit.Parent.Name.LocalName == selection)");
      var htmlTits = chits.SelectMany(s => s.Attributes("title_html")).ToArray();
      Dictionary<string, XElement> htmlTitles = null;
      if (htmlTits.Length > 0) {
        htmlTitles = xml.Descendants().Select(el => new { el, id = el.AttributeValue("id") }).Where(a => a.id != null).ToDictionary(a => a.id, a => a.el);
      }
      string title = null; string title_html = null;
      Func<XElement, object> getTitle = cl => {
        if (title != null) return title;
        if (title_html != null) { var res = htmlTitles[title_html]; res.Remove(); return res; }
        return null;
      };
      foreach (var chit in chits) {
        chit.AddBeforeSelf(new XComment(chit.ToString()));
        var type = chit.AttributeValue("type"); if (string.IsNullOrEmpty(type)) type = "checkBox";
        var layout = chit.AttributeValue("layout");
        title = chit.AttributeValue("title"); title_html = chit.AttributeValue("title_html");
        var correct = chit.AttributeValue("correct");
        var isExample = chit.AttributeValue("example") == "true"; var group_eval = chit.AttributeValue("group_eval");
        var evalGroupAnd = chit.AttributeValue("eval_group") == "And";
        var init_value_checked = chit.AttributeValue("init_value") == "Checked";
        var parentId = chit.Parent.AttributeValue("id");
        var id = chit.AttributeValue("id");
        var evalBtnId = chit.AttributeValue("group_eval");
        if (!string.IsNullOrEmpty(evalBtnId)) {
          if (!xml.Descendants().Any(el => el.Name.LocalName == "eval_mark" && (el.AttributeValue("id") == evalBtnId || el.AttributeValue("group") == "@" + evalBtnId || el.AttributeValue("group") == evalBtnId))) evalBtnId = null;
        } else evalBtnId = null;
        XElement res = new XElement("check-item",
          string.IsNullOrEmpty(id) ? null : new XAttribute("id", id),
          evalBtnId == null ? null : new XAttribute("eval-button-id", evalBtnId)
        );
        if (type == "checkBox" && layout != "selectWord") {
          res.Add(
            string.IsNullOrEmpty(correct) ? null : new XAttribute("correct-value", correct),
            isExample && !init_value_checked ? new XAttribute("skip-evaluation", "true") : null,
            isExample && init_value_checked ? new XAttribute("read-only", "true") : null,
            init_value_checked ? new XAttribute("init-value", "True") : null
          );
          if (string.IsNullOrEmpty(title) && string.IsNullOrEmpty(title_html)) { //Bug:2225
            res.Name = "check-box";
            res.Add(
              string.IsNullOrEmpty(parentId) ? null : new XAttribute("eval-group", "and-" + parentId),
              new XAttribute("text-type", "no")
            );
          } else { //Bug:2227
            res.Add(
              string.IsNullOrEmpty(group_eval) ? null : new XAttribute("eval-group", "and-" + group_eval),
              new XAttribute("text-type", "no"),
              getTitle(chit)
            );
          }
        } else if (type == "radioButton" && layout != "selectWord") { //Bug:2226
          res.Name = "radio-button";
          res.Add(
            string.IsNullOrEmpty(correct) ? null : new XAttribute("correct-value", correct),
            string.IsNullOrEmpty(group_eval) ? null : new XAttribute("eval-group", "and-" + group_eval),
            isExample && !init_value_checked ? new XAttribute("skip-evaluation", "true") : null,
            isExample && init_value_checked ? new XAttribute("read-only", "true") : null,
            init_value_checked ? new XAttribute("init-value", "true") : null,
            getTitle(chit)
          );
        } else if (type == "checkBox" && layout == "selectWord") { //Bug:2214
          res.Name = "word-multi-selection";
          res.Add(
            !evalGroupAnd ? null : new XAttribute("eval-group", "and-" + parentId),
            new XAttribute("words", (correct == "true" ? "#" : null) + title)
          );
        } else if (type == "radioButton" && layout == "selectWord") { //Bug:2224
          res.Name = "word-selection";
          res.Add(
            string.IsNullOrEmpty(group_eval) ? null : new XAttribute("eval-group", "and-" + group_eval),
            new XAttribute("words", (correct == "true" ? "#" : null) + title)
          );
        } else
          throw new Exception("transform_check_item: na PZ, unknown attributtes");
        if (chit.Parent.Name.LocalName == "row") res = new XElement(exFile.lm + "control", res);
        chit.AddBeforeSelf(res);
        chit.Remove();
      }
    }
  }

}

