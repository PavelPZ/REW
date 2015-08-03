using System;
using System.Data;
using System.Collections.Generic;
using System.Configuration;
using System.Linq;
using System.Web;
using System.Web.Security;
using System.Web.UI;
using System.Web.UI.HtmlControls;
using System.Web.UI.WebControls;
using System.Web.UI.WebControls.WebParts;
using System.Xml.Serialization;

using LMComLib;
using LMNetLib;

//udrzba Exercises a Modules fieldu:
//Spustit http://localhost/data/framework/RefreshLangContent.aspx
//Zkopirovat c:\temp\LangContent.xml do http://localhost/LMCom/App_Data/LangContent.xml a http://localhost/data/app_data/LangContent.xml
namespace LMComLib.Lang {
  public class TitleStat {
    internal int value;
    internal int nameId;
    public string Name {
      get {
        switch (nameId) {
          case 0: return CSLocalize.localize("5dfbdc9947664350b47c1fae7bc1f930", LocPageGroup.LMComLib, "(*kurz obsahuje 199 *)hodin zábavné výuky") + " ";
          case 1: return CSLocalize.localize("de8e89b51bd648409eae37689964d717", LocPageGroup.LMComLib, "(*kurz obsahuje 199 *)kapitol");
          case 2: return CSLocalize.localize("433fa06b4dff4123b209479b72a52307", LocPageGroup.LMComLib, "(*kurz obsahuje 199 *)interaktivních cvičení");
          case 3: return CSLocalize.localize("bb2388167a404335944c495eb3237c8c", LocPageGroup.LMComLib, "(*kurz obsahuje 199 *)slovíček a frází");
          case 4: return CSLocalize.localize("e55dba34fa4f49b6a7474fa86db400c1", LocPageGroup.LMComLib, "(*kurz obsahuje 199 *)obrázků a fotografií");
          case 5: return CSLocalize.localize("9144144e56a443db827f816c08d5f17f", LocPageGroup.LMComLib, "(*kurz obsahuje 199 *)minut zvuku");
          case 6: return CSLocalize.localize("58e640ce22724980b748a043f68c3f2a", LocPageGroup.LMComLib, "(*kurz obsahuje 199 *)zvukových sekvencí");
          default: return @"Missing code in Q:\LMCom\lmcomlib\Lib\LangContent.cs, Lang.Title.Name";
        }
      }
    }
    public string Value {
      get { return value.ToString("N0"); }
    }
  }
  public class Title {
    public CourseIds Id;
    public string Name;
    public int Hours;
    public int Execises;
    public int Modules;
    [XmlIgnore]
    public int Words;
    public int Pictures;
    public int SoundMinutes;
    public int SoundSentences;
    public string LevelsShort;
    public string LevelsLong;
    public string[] RwFileIds;
    [XmlIgnore]
    internal List<TitleStat> Stat = new List<TitleStat>();
    public IEnumerable<TitleStat> noHoursStat() {
      for (int i = 1; i < Stat.Count; i++)
        //DEBUG: vratit po doplneni databaze rewise
        if (Stat[i].nameId != 3)
          yield return Stat[i];
    }
    public IEnumerable<TitleStat> getStat() {
      for (int i = 0; i < Stat.Count; i++)
        //DEBUG: vratit po doplneni databaze rewise
        if (Stat[i].nameId != 3)
          yield return Stat[i];
    }
    /*public IEnumerable<TitleStat> noHoursNoRewiseStat() {
      for (int i = 1; i < Stat.Count; i++)
        //DEBUG: vratit po doplneni databaze rewise
        if (st.Name != "slovíček a frází")
          yield return Stat[i];
    }*/
    public IEnumerable<TitleStat> dumpStat() {
      foreach (TitleStat st in Stat)
        //DEBUG: vratit po doplneni databaze rewise
        if (st.nameId != 3)
          yield return st;
      if (Stat.Count % 2 > 0) yield return null;
    }
    void addStat(int nameId, int value) {
      TitleStat st = new TitleStat();
      st.nameId = nameId; st.value = value;
      Stat.Add(st);
    }
    public void Finish(bool isAll) {
      //Doplneni rewise words z databaze
      if (!isAll) {
        Words = 0;
        //RwJsBooks books = RwJsBooks.Stat[Id];
        //Words += books.BooksAmount(RwFileIds);
      }
      addStat(0, Hours);
      addStat(1, Modules);
      addStat(2, Execises);
      addStat(3, Words);
      addStat(4, Pictures);
      addStat(5, SoundMinutes);
      addStat(6, SoundSentences);


    }
  }
  public class Titles {

    public List<Title> Courses = new List<Title>();

    static Titles() {
      Instance = getTitles();
      foreach (Title crs in Instance.Courses)
        crs.Finish(false);
      AllStat.Finish(true);
      foreach (Title t in Instance.Courses)
        for (int i = 0; i < AllStat.Stat.Count; i++)
          AllStat.Stat[i].value += t.Stat[i].value;
    }
    public static Titles getTitles() {
      //string fn = HttpRuntime.AppDomainAppPath + "app_data/LangContent.xml";
      string fn = Machines.basicPath + @"rew\LMCom\App_Data\LangContent.xml";
      return (Titles)XmlUtils.FileToObject(fn, typeof(Titles));
    }
    public static Title FindTitle(CourseIds id) {
      Title res = GetTitle(id); if (res != null) return res;
      throw new Exception();
    }
    public static Title GetTitle(CourseIds id) {
      foreach (Title tit in Instance.Courses)
        if (tit.Id == id) return tit;
      return null;
    }
    public static Title AllStat = new Title();
    public static Titles Instance;
    public static IEnumerable<Title> dumpTitles() {
      yield return AllStat;
      foreach (Title tit in Instance.Courses) yield return tit;
    }
    public static int dumpStatNum() {
      int num = AllStat.Stat.Count;
      if (num % 2 > 0) num += 1;
      return num;
    }
  }
}
