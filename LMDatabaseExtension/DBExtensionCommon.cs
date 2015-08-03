using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Text.RegularExpressions;
using System.Xml.Linq;

public partial class StoredProcedures {

  //Nutno synchronizovat s d:\LMCom\rew\NewLMComModel\Design\ProductsDefineObj.cs, po zmene je nutne aktualizovat d:\LMCom\rew\LMDatabaseExtension\Toc.tt
  public class TocFlat {
    public string ProdAndUrl; //napr. 118/english1_xl01_sa_shome_dhtm
    public string ModTitle;
    public int LessId;
    public string LessTitle;
    public int LevId;
    public string LevTitle;
    public int CrsId;
    public string ProductId; //@PRODID
    public string CrsTitle;
    public TocFlat fromStream(BinaryReader wr) {
      ProdAndUrl = wr.ReadString(); ModTitle = wr.ReadString(); LessId = wr.ReadInt32(); LessTitle = wr.ReadString(); LevId = wr.ReadInt32(); LevTitle = wr.ReadString(); CrsId = wr.ReadInt32(); CrsTitle = wr.ReadString(); ProductId = wr.ReadString();
      return this;
    }
    public void toStream(BinaryWriter wr) {
      wr.Write(ProdAndUrl); wr.Write(ModTitle); wr.Write(LessId); wr.Write(LessTitle); wr.Write(LevId); wr.Write(LevTitle); wr.Write(CrsId); wr.Write(CrsTitle); wr.Write(ProductId);
    }
    public static IEnumerable<TocFlat> fromResources() {
      var ass = typeof(TocFlat).Assembly;
      using (var str = ass.GetManifestResourceStream(ass.GetName().Name + ".Toc.bin"))
      using (BinaryReader rdr = new BinaryReader(str))
        while (str.Position < str.Length)
          yield return new TocFlat().fromStream(rdr);
    }
    public static string getProdAndUrl(string prodId, string modUrl) { return prodId + "|" + modUrl; }
  }

}

namespace Admin {
  public partial class Interval {
    public int From;
    public string Title;
    public static string localizePeriod(int from, int to, CultureInfo cult, bool isRuntime = true) {
      try {
        int m, y;
        FromMonthCode(from, out m, out y);
        var actStr = new DateTime(y, m, 1).ToString("Y", cult);
        var actCode = from.ToString(); string nextCode = "";
        Func<string> getCode = () => isRuntime ? null : " (" + actCode + "," + nextCode + ")";
        if (to < 0) return actStr + " -" + getCode();
        int nm, ny;
        FromMonthCode(to, out nm, out ny);
        nextCode = to.ToString();
        nm -= 1;
        if (nm == 0) { ny -= 1; nm = 12; }
        if (m == nm && y == ny) return actStr + getCode();
        var nextStr = new DateTime(ny, nm, 1).ToString("Y", cult);
        if (y == ny && nm == 12 && m == 1) return y.ToString() + getCode();
        if (y == ny) return cult.DateTimeFormat.GetMonthName(m) + " - " + nextStr + getCode();
        return actStr + " - " + nextStr + getCode();
      } catch {
        return string.Format("*** Error in DBExtensionCommon.cs.localizePeriod: from={0}, to={1}", from, to);
      }
    }
    public static string localizePeriod(string title, CultureInfo cult) {
      Regex parsePeriod = new Regex(@".*\(((?<from>[123]\d[01]\d),(?<to>[123]\d[01]\d)|(?<from>[123]\d[01]\d),)|,(?<to>[123]\d[01]\d)\).*", RegexOptions.Singleline);
      var match = parsePeriod.Match(title);
      if (!match.Success) return title;
      var from = match.Groups["from"].Value;
      var to = match.Groups["to"].Value;
      return localizePeriod(int.Parse(from), to=="" ? -1 : int.Parse(to), cult);
    }
    
    static public int MonthCode(int Month, int Year) { return (Year - 2000) * 100 + Month; }
    static public void FromMonthCode(int code, out int month, out int year) { month = code % 100; year = (code - month) / 100 + 2000; }

    public XElement toXml() {
      return new XElement("Item", new XElement("Title", Title), new XElement("From", From.ToString()));
    }
    public static Interval fromXml(XElement xml) {
      return new Interval() {
        Title = ElementValue(xml,"Title",null),
        From = int.Parse(ElementValue(xml,"From","0")),
      };
    }
    static string ElementValue(XElement els, XName name, string defaultValue) {
      XElement el = els.Element(name);
      return el == null ? defaultValue : el.Value;
    }

  }
  public partial class Intervals {
    public Interval[] Items;

    static public int MonthCode(int Month, int Year) { return (Year - 2000) * 100 + Month; }

    public static Intervals TimeDefault() {
      var res = new Intervals {
        Items = Enumerable.Range(0, 12).Select(y => new Interval() {
          From = MonthCode(1, 2013 + y),
        }).ToArray()
      };
      return res;
    }
    public static Intervals ScoreDefault() {
      var res = new Intervals {
        Items = new Interval[] { 
          new Interval() {From=99},//, Title="100%"},
          new Interval() {From=97},//, Title="98-99%"},
          new Interval() {From=94},//, Title="95-97%"},
          new Interval() {From=89},//, Title="90-94%"},
          new Interval() {From=82},//, Title="83-89%"},
          new Interval() {From=70},//, Title="71-82%"},
          new Interval() {From=56},//, Title="57-70%"},
          new Interval() {From=35},//, Title="36-56%"},
          new Interval() {From=-1},//, Title="0-35%"},
        }
      };
      return res;
    }

    public static Intervals SecDefault() {
      string[] secYearDefault = new string[] { "4.00:00:00", "2.20:00:00", "2.00:00:00", "1.10:00:00", "1.00:00:00", "17:00:0", "12:00:00", "08:30:00", "06:00:00", "04:00:00", "03:00:00", "02:00:00", "01:30:00", "01:00:00", "00:45:00", "00:30:00", "00:20:00", "00:15:00", "00:10:00", "00:00:00" };
      var res = new Intervals() {
        Items = secYearDefault.Select((s, idx) => new Interval() { From = (int)TimeSpan.Parse(s).TotalSeconds /*, Title = s + " - " + (idx == 0 ? "" : secYearDefault[idx - 1])*/ }).ToArray()
      };
      //for (int i = 0; i < res2.Items.Length; i++) res2.Items[i].IntervalId = i;
      return res;
    }
    public XElement toXml(XElement root) {
      if (Items!=null && Items.Length>0) root.Add(new XElement("Items", Items.Select(it => it.toXml())));
      return root;
    }
    public static Intervals fromXml(XElement xml) {
      var items = xml == null ? null : xml.Element("Items");
      return items == null ? null : new Intervals() {
        Items = !xml.HasElements ? null : items.Elements().Select(el => Interval.fromXml(el)).ToArray()
      };
    }
  }
  public class IntervalsConfig {
    public Intervals Secs;
    public Intervals Scores;
    public Intervals Periods;
    public XElement toXml() {
      checkEmpty(true);
      return new XElement("root", 
        Secs==null ? null : Secs.toXml(new XElement("Secs")),
        Scores == null ? null : Scores.toXml(new XElement("Scores")),
        Periods == null ? null : Periods.toXml(new XElement("Periods")));
    }
    public string toString() { return toXml().ToString(); }
    public static IntervalsConfig fromXml(XElement xml) {
      return new IntervalsConfig() {
        Secs = Intervals.fromXml(xml.Element("Secs")),
        Scores = Intervals.fromXml(xml.Element("Scores")),
        Periods = Intervals.fromXml(xml.Element("Periods")),
      };
    }
    public static IntervalsConfig fromString(string str) {
      return fromXml(XElement.Parse(str)).checkEmpty(false);
    }
    IntervalsConfig checkEmpty(bool isSave) {
      if (Scores == null || Scores.Items == null || Scores.Items.Length < 2) Scores = isSave ? new Intervals() : Admin.Intervals.ScoreDefault();
      if (Secs == null || Secs.Items == null || Secs.Items.Length < 2) Secs = isSave ? new Intervals() : Admin.Intervals.SecDefault();
      if (Periods == null || Periods.Items == null || Periods.Items.Length < 2) Periods = isSave ? new Intervals() : Admin.Intervals.TimeDefault();
      return this;
    }
  }

}