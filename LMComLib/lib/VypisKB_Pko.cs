using System;
using System.Collections.Generic;
using System.Text;
using System.IO;
using System.Globalization;

using LMNetLib;

namespace LMComLib.Pko {

  public static class Reader {
    public static void SkipNum(int len, string src, ref int idx) {
      idx += len;
    }
    public static void SkipDate(string src, ref int idx) {
      idx += 8;
    }
    public static void SkipCurrency(int len, string src, ref int idx) {
      idx += len + 3;
    }
    public static void SkipText(int len, string src, ref int idx) {
      idx += len;
    }
    public static int ReadNum(int len, string src, ref int idx) {
      string val = src.Substring(idx, len);
      SkipNum(len, src, ref idx);
      return int.Parse(val);
    }
    public static DateTime ReadDate(string src, ref int idx) {
      string val = src.Substring(idx, 8);
      SkipDate(src, ref idx);
      DateTime res;
      if (!DateTime.TryParseExact(val, "ddMMyyyy", CultureInfo.InvariantCulture, System.Globalization.DateTimeStyles.None, out res))
        throw new Exception();
      return res;
    }
    public static double ReadCurrency(int len, string src, ref int idx) {
      string val = src.Substring(idx, len + 2);
      idx += len + 2;
      val = val.Insert(len, ".");
      double res;
      if (!double.TryParse(val, NumberStyles.Float, CultureInfo.InvariantCulture, out res))
        throw new Exception();
      string sign = ReadText(1, src, ref idx);
      if (sign == "-") res = res * (-1);
      return res;
    }
    public static string ReadText(int len, string src, ref int idx) {
      string val = src.Substring(idx, len);
      SkipText(len, src, ref idx);
      return val;
    }
  }


  public class Line {
    public static List<Line> CreateLines(string[] lines) {
      List<Line> res = new List<Line>();
      foreach (string s in lines) {
        if (string.IsNullOrEmpty(s)) continue;
        int idx = 0;
        Reader.SkipNum(3, s, ref idx);
        int id = Reader.ReadNum(3, s, ref idx);
        Line ln = new Line();
        ln.Id = id;
        ln.Src = s;
        ln.Idx = idx;
        res.Add(ln);
      }
      return res;
    }
    public int Id;
    public string Src;
    public int Idx;
  }

  public class DateItem : List<Item> {
    public DateTime Date;
    public DateItem(string src, int idx) {
      Date = Reader.ReadDate(src, ref idx);
    }
  }

  public class Item {
    //public int Id;
    public double Amount;
    public double Provision;
    public double All;
    public string VarSymb;
    public Item(string src, int idx) {
      Reader.SkipText(8, src, ref idx);
      Reader.SkipText(9, src, ref idx);
      Reader.SkipText(10, src, ref idx);
      Reader.SkipText(10, src, ref idx);
      Reader.SkipText(8, src, ref idx);
      VarSymb = Reader.ReadText(19, src, ref idx).Trim();
      Reader.SkipText(2, src, ref idx);
      Reader.SkipText(15, src, ref idx);
      Amount = Reader.ReadCurrency(15, src, ref idx);
      Provision = Reader.ReadCurrency(15, src, ref idx);
      All = Reader.ReadCurrency(15, src, ref idx);
    }
  }

  public static class VypisKB {

    const string csvmask = ";;;;{0};{1};;{2};;{3};;;;;";

    public static byte[] Transform(string pko) {
      string[] lns = pko.Split(new string[] { "\r\n" }, StringSplitOptions.RemoveEmptyEntries);
      List<Line> lines = Line.CreateLines(lns);
      List<DateItem> dates = new List<DateItem>();
      DateItem actDt = null;
      int cisloVypisu = 0;
      string globalVarSymb = null;
      double sum = 0;
      foreach (Line ln in lines) {
        switch (ln.Id) {
          case 6:
            actDt = new DateItem(ln.Src, ln.Idx);
            dates.Add(actDt);
            break;
          case 4:
            if (actDt == null) throw new Exception();
            actDt.Add(new Item(ln.Src, ln.Idx));
            break;
          case 2:
            cisloVypisu = Reader.ReadNum(5, ln.Src, ref ln.Idx);
            Reader.SkipText(16, ln.Src, ref ln.Idx);
            Reader.SkipText(4, ln.Src, ref ln.Idx);
            Reader.SkipText(3, ln.Src, ref ln.Idx);
            globalVarSymb = Reader.ReadText(10, ln.Src, ref ln.Idx);
            break;
          case 10:
            Reader.SkipCurrency(15, ln.Src, ref ln.Idx);
            Reader.SkipCurrency(15, ln.Src, ref ln.Idx);
            sum = Reader.ReadCurrency(15, ln.Src, ref ln.Idx);
            break;
        }
      }
      using (MemoryStream ms = new MemoryStream()) {
        using (StreamWriter wr = new StreamWriter(ms, Encoding.ASCII)) {
          string castka;
          string date = null;
          NumberFormatInfo fi = new NumberFormatInfo();
          fi.NumberDecimalSeparator = ",";
          fi.NumberDecimalDigits = 2;
          foreach (DateItem dt in dates)
            foreach (Item it in dt) {
              castka = it.Amount.ToString("F", fi); //castka (<0 -debet, >0 kredit, 0,00)
              date = dt.Date.ToString("dd.MM.yy"); //datum (dd.mm.yy)
              string tit = string.Format("platba kartou z {0}: {1}", date, it.VarSymb);
              wr.WriteLine(string.Format(csvmask, castka, it.VarSymb, date, tit));
              castka = it.Provision.ToString("F", fi);
              wr.WriteLine(string.Format(csvmask, castka, "PROVIZEBANKY", date, "Provize banky k " + tit));
            }
          sum = sum * (-1);
          castka = sum.ToString("F", fi);
          wr.WriteLine(string.Format(csvmask, castka, globalVarSymb, date, "Celkovy soucet vypisu"));
        }
        return ms.ToArray();
      }
    }

    /*
    public static void Transform(string src, string dest) {
      string file = StringUtils.FileToString(src, Encoding.GetEncoding(1250));
      string[] lns = file.Split(new string[] { "\r\n" }, StringSplitOptions.RemoveEmptyEntries);
      List<Line> lines = Line.CreateLines(lns);
      List<DateItem> dates = new List<DateItem>();
      DateItem actDt = null;
      int cisloVypisu = 0;
      string globalVarSymb = null;
      double sum = 0;
      foreach (Line ln in lines) {
        switch (ln.Id) {
          case 6:
            actDt = new DateItem(ln.Src, ln.Idx);
            dates.Add(actDt);
            break;
          case 4:
            if (actDt == null) throw new Exception();
            actDt.Add(new Item(ln.Src, ln.Idx));
            break;
          case 2:
            cisloVypisu = Reader.ReadNum(5, ln.Src, ref ln.Idx);
            Reader.SkipText(16, ln.Src, ref ln.Idx);
            Reader.SkipText(4, ln.Src, ref ln.Idx);
            Reader.SkipText(3, ln.Src, ref ln.Idx);
            globalVarSymb = Reader.ReadText(10, ln.Src, ref ln.Idx);
            break;
          case 10:
            Reader.SkipCurrency(15, ln.Src, ref ln.Idx);
            Reader.SkipCurrency(15, ln.Src, ref ln.Idx);
            sum = Reader.ReadCurrency(15, ln.Src, ref ln.Idx);
            break;
        }
      }
      using (StreamWriter wr = new StreamWriter(dest, false, Encoding.ASCII)) {
        string castka;
        string date = null;
        NumberFormatInfo fi = new NumberFormatInfo();
        fi.NumberDecimalSeparator = ",";
        fi.NumberDecimalDigits = 2;
        foreach (DateItem dt in dates)
          foreach (Item it in dt) {
            castka = it.Amount.ToString("F", fi); //castka (<0 -debet, >0 kredit, 0,00)
            date = dt.Date.ToString("dd.MM.yy"); //datum (dd.mm.yy)
            string tit = string.Format("platba kartou z {0}: {1}", date, it.VarSymb);
            wr.WriteLine(string.Format(csvmask, castka, it.VarSymb, date, tit));
            castka = it.Provision.ToString("F", fi);
            wr.WriteLine(string.Format(csvmask, castka, "PROVIZEBANKY", date, "Provize banky k " + tit));
          }
        sum = sum * (-1);
        castka = sum.ToString("F", fi);
        wr.WriteLine(string.Format(csvmask, castka, globalVarSymb, date, "Celkovy soucet vypisu"));
      }
    }
     */
  }
}
