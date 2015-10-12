
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using LMNetLib;
using System.Xml.Linq;
using System.Web;
using System.Collections.Specialized;
using System.IO;
//using LMComLib.Cms;
using LMComLib;
using System.Xml.Serialization;
using System.Threading;

namespace LMComLib {

  public enum ET_SiteMapId {
    old,
    lingea,
    talknow,
    talknowaudio,
    talknowlpc,
    talknowrewise,
    poslechy,
    onlineCourses,
  }

  public static class ET_Lib {

    public static ET_SiteMapId[] AllSiteMapIds = new ET_SiteMapId[] { ET_SiteMapId.talknow, ET_SiteMapId.lingea, ET_SiteMapId.talknowaudio };

    [Flags]
    public enum SitemapNodeType {
      lmp = 0x1,
      lmp_nodict = 0x2,
      product = 0x4,
      download = 0x8,
    }

    [Flags]
    public enum DictType {
      no = 1, //neni slovnik
      StudyDict = 2,
      MidDict = 4,
      Dict = 8,
      studyMid = StudyDict | MidDict,
    }

    public enum CourseInfoTitles {
      title,
      keStazeni,
      withDictTitle,
      titleOrDictTitle,
      //withDictKeStazeni,
    }

    //informace o jednom slovniku nebo kurzu
    public struct CourseInfo : IEqualityComparer<CourseInfo> {
      //jednoznacny klic
      public CourseIds CrsId; public Langs Loc; public bool IsCurrrent;
      //konec jednoznacneho klice
      public ET_SiteMapId CourseType;
      //Slovnik pro pripad ET kurzu
      public CourseIds MyDict { get { return (CourseIds)(myDict == null ? myDict = getMyDict(IsCurrrent) : myDict); } } CourseIds? myDict;
      public CourseIds getMyDict(bool isCurrent) {
        if (CourseType != ET_SiteMapId.talknow) return CourseIds.no;
        else return CurrentSmallDictForCourse(CrsId, Loc, isCurrent);
      }
      public bool WithDict { get { return MyDict != CourseIds.no; } }

      //nazev
      public string locale(CourseInfoTitles type, bool isUrl, Langs lng) {
        ET_Localize.MaskTypes title;
        ET_Localize.MaskTypes keStazeni;
        switch (CourseType) {
          case ET_SiteMapId.talknow: title = ET_Localize.MaskTypes.Kurz; keStazeni = ET_Localize.MaskTypes.KeStazeniKurz; break;
          case ET_SiteMapId.lingea: if (getDictType(CrsId) == DictType.StudyDict) {
              title = ET_Localize.MaskTypes.StudijniSlovnik; keStazeni = ET_Localize.MaskTypes.KeStazeniStudijniSlovnik;
            } else {
              title = ET_Localize.MaskTypes.Slovnik; keStazeni = ET_Localize.MaskTypes.KeStazeniSlovnik;
            }
            break;
          case ET_SiteMapId.talknowaudio: title = ET_Localize.MaskTypes.AudioKurz; keStazeni = ET_Localize.MaskTypes.KeStazeniAudioKurz; break;
          default: throw new NotImplementedException();
        }
        switch (type) {
          case CourseInfoTitles.title: return localeLow(title, isUrl, lng);
          case CourseInfoTitles.keStazeni: return localeLow(keStazeni, isUrl, lng);
          case CourseInfoTitles.withDictTitle: return localeLow(ET_Localize.MaskTypes.KurzSlovnik, isUrl, lng);
          case CourseInfoTitles.titleOrDictTitle: return localeLow(WithDict ? ET_Localize.MaskTypes.KurzSlovnik : title, isUrl, lng);
          default: throw new NotImplementedException();
        }
      }

      //cesky nazev
      public string czLocale(CourseInfoTitles type, bool isUrl) {
        return locale(type, isUrl, Langs.cs_cz);
      }

      public string SitemapUrl(SitemapNodeType type) {
        string mask;
        switch (type) {
          case SitemapNodeType.lmp: mask = "~/com/web/lang/pages/product-info/{0}/{1}.lmp"; break;
          case SitemapNodeType.lmp_nodict: mask = "~/com/web/lang/pages/product-info/{0}/{1}-no-dict.lmp"; break;
          case SitemapNodeType.product: mask = "~/site-com/web/lang/pages/products/{0}/{1}.aspx"; break;
          case SitemapNodeType.download: mask = "~/site-com/web/lang/pages/downloads/{0}/{2}.aspx"; break;
          default: throw new Exception();
        }
        return string.Format(mask, CourseType, czLocale(CourseInfoTitles.title, true), czLocale(CourseInfoTitles.keStazeni, true));
      }

      public string FilePath(SitemapNodeType type) {
        string mask;
        switch (type) {
          case SitemapNodeType.lmp: mask = Machines.basicPath + @"rew\LMCom\com\Web\lang\pages\product-info\{0}\{1}.lmp"; break;
          case SitemapNodeType.lmp_nodict: mask = Machines.basicPath + @"rew\LMCom\com\Web\lang\pages\product-info\{0}\{1}-no-dict.lmp"; break;
          case SitemapNodeType.product: mask = Machines.basicPath + @"rew\LMCom\site\web\lang\pages\products\{0}\{1}.aspx"; break;
          case SitemapNodeType.download: mask = Machines.basicPath + @"rew\LMCom\site\web\lang\pages\downloads\{0}\{2}.aspx"; break;
          default: throw new NotImplementedException();
        }
        return string.Format(mask, CourseType, czLocale(CourseInfoTitles.title, true), czLocale(CourseInfoTitles.keStazeni, true));
      }

      //locale helper
      string localeLow(ET_Localize.MaskTypes type, bool isUrl, Langs lng) { return myLocales.First(l => l.isUrl == isUrl && l.type == type).Title(lng); }
      //string czLocaleLow(ET_Localize.MaskTypes type, bool isUrl) { return myLocales.First(l => l.isUrl == isUrl && l.type == type).Title(Langs.cs_cz); }
      ET_Localize.toLoc[] myLocales { get { return locales == null ? locales = ET_Localize.LocalizedItemsTab[courseId_for_locale()] : locales; } } ET_Localize.toLoc[] locales;
      CourseIds courseId_for_locale() {
        switch (CourseType) {
          case ET_SiteMapId.talknowaudio: return LowUtils.EnumParse<CourseIds>(CrsId.ToString().Replace("TN_Audio_", "TN_"));
          case ET_SiteMapId.talknow:
          case ET_SiteMapId.lingea: return CrsId;
          default: throw new NotImplementedException();
        }
      }

      //Download class
      public Down.DownloadClass Cls {
        get {
          switch (CourseType) {
            case ET_SiteMapId.talknow: return Down.DownloadClass.EuroTalk;
            case ET_SiteMapId.lingea: return Down.DownloadClass.EasyLex;
            case ET_SiteMapId.talknowaudio: return Down.DownloadClass.EuroTalkAudio;
            case ET_SiteMapId.talknowlpc:
            case ET_SiteMapId.talknowrewise: return Down.DownloadClass.RewiseCpv;
            default: throw new NotImplementedException();
          }
        }
      }

      public LineIds Line { get { return CommonLib.CourseIdToLineId(CrsId); } }

      bool IEqualityComparer<CourseInfo>.Equals(CourseInfo x, CourseInfo y) { return x.Loc == y.Loc && x.CrsId == y.CrsId && x.IsCurrrent == y.IsCurrrent; }
      int IEqualityComparer<CourseInfo>.GetHashCode(CourseInfo obj) { return obj.Loc.GetHashCode() ^ obj.CrsId.GetHashCode() ^ obj.IsCurrrent.GetHashCode(); }

    }

    public static Dictionary<CourseIds, CourseInfo> AllCourseIdLow {
      get {
        if (allCourseIdLow == null) {
          allCourseIdLow = new Dictionary<CourseIds, CourseInfo>();
          foreach (CourseInfo ci in allCourses(false).GroupBy(c => c.CrsId).Select(g => g.First())) allCourseIdLow.Add(ci.CrsId, ci);
        }
        return allCourseIdLow;
      }
    } static Dictionary<CourseIds, CourseInfo> allCourseIdLow;

    public static int LineSize(LineIds line, Langs loc) {
      if (CommonLib.LineIdToLang(line) == loc) return 0;
      if (!CommonLib.allETLines.Contains(line)) return 0;
      if (CommonLib.allLines.Contains(line) && CommonLib.bigLocalizations.Contains(loc)) return 3;
      //MODIFY LANGS return CommonLib.LingeaLocalizationLangs.Contains(loc) && CommonLib.CurrentLangsLingea.Contains(CommonLib.LineIdToLang(line)) ? 2 : 1; 
      return CommonLib.CurrentLangsLingeaLoc.Contains(loc) && CommonLib.CurrentLangsLingeaCrs.Contains(CommonLib.LineIdToLang(line)) ? 2 : 1;
    }

    //prevod slovnikove jazykove zkratky na Langs. Napr. en => en_gb, ptbr => pt_br
    public static Langs SmallLangToLang(string smallLang) {
      if (smallLangToLang == null) {
        smallLangToLang = new Dictionary<string, Langs>();
        foreach (Langs lng in LowUtils.EnumGetValues<Langs>()) {
          if (lng == Langs.en_nz || lng == Langs.en_us || lng == Langs.fr_ca || lng == Langs.es_mx || lng == Langs.zh_hk) continue;
          smallLangToLang.Add(LangToSmallLang(lng), lng);
        }
      }
      return smallLangToLang[smallLang.ToLower()];
    } static Dictionary<string, Langs> smallLangToLang;

    //helper funkce: k jazyku vrati zkratku, pouzito u oznacovani slovniku, opak SmallLangToLang
    public static string LangToSmallLang(Langs lng) {
      switch (lng) {
        case Langs.en_nz: throw new Exception();
        case Langs.pt_br: return "ptbr";
        default: return lng.ToString().Split(new char[] { '_' }, 2)[0];
      }
    }

    //vsechny current studijni slovniky
    public static IEnumerable<CourseIds> CurrentSmallDicts { get { return currentSmallDicts == null ? currentSmallDicts = AllSmallDictConsts(true, null) : currentSmallDicts; } } static IEnumerable<CourseIds> currentSmallDicts;
    public static Dictionary<CourseIds, bool> CurrentSmallDictsTab { get { return currentSmallDictsTab == null ? (currentSmallDictsTab = CurrentSmallDicts.ToDictionary(c => c, c => true)) : currentSmallDictsTab; } } static Dictionary<CourseIds, bool> currentSmallDictsTab;

    //vsechny studijni slovniky
    public static IEnumerable<CourseIds> SmallDicts { get { return smallDicts == null ? smallDicts = AllSmallDictConsts(false, null) : smallDicts; } } static IEnumerable<CourseIds> smallDicts;
    public static Dictionary<CourseIds, bool> SmallDictsTab { get { return smallDictsTab == null ? (smallDictsTab = SmallDicts.ToDictionary(c => c, c => true)) : smallDictsTab; } } static Dictionary<CourseIds, bool> smallDictsTab;

    //vsechny current middle slovniky
    public static IEnumerable<CourseIds> CurrentMiddleDicts { get { return currentMiddleDicts == null ? (currentMiddleDicts = AllMiddleDictConsts(true, null)) : currentMiddleDicts; } } static IEnumerable<CourseIds> currentMiddleDicts;

    //vsechny middle slovniky
    public static IEnumerable<CourseIds> MiddleDicts { get { return middleDicts == null ? middleDicts = AllMiddleDictConsts(false, null) : middleDicts; } } static IEnumerable<CourseIds> middleDicts;

    //vsechny studijni slovniky (current nebo i planovane)
    public static IEnumerable<CourseIds> AllSmallDictConsts(bool isCurrent, TextWriter log) {
      logHeader(log, "Missing SmallDictConsts Consts");
      //MODIFY LANGS return allDictConsts(log, DictType.StudyDict, isCurrent ? CommonLib.CurrentLangsLingea : CommonLib.FullLangsLingea, isCurrent ? CommonLib.LingeaLocalizationLangs : CommonLib.FullLangsLingea);
      return allDictConsts(log, DictType.StudyDict, isCurrent ? CommonLib.CurrentLangsLingeaCrs : CommonLib.FullLangsLingea, isCurrent ? CommonLib.CurrentLangsLingeaLoc : CommonLib.FullLangsLingea);
    }

    //vsechny middle slovniky (current nebo i planovane)
    public static IEnumerable<CourseIds> AllMiddleDictConsts(bool isCurrent, TextWriter log) {
      logHeader(log, "Missing MiddleDictConsts Consts");
      return allDictConsts(log, DictType.MidDict, isCurrent ? CommonLib.CurrentMiddleLangsLingea : CommonLib.FullMiddleLangsLingea, isCurrent ? CommonLib.CurrentMiddleLangsLingea : CommonLib.FullMiddleLangsLingea);
    }

    //vsechny big slovniky
    public static IEnumerable<CourseIds> AllBigDictConsts() {
      return LowUtils.EnumGetValues<CourseIds>().Where(c => getDictType(c) == DictType.Dict);
    }

    public static Langs getDict_toLang(CourseIds crsId, DictType mode) {
      if (mode == DictType.no) return Langs.no;
      string postfix = crsId.ToString().Substring(mode.ToString().Length);
      string[] parts = postfix.Split(new char[] { '_' }, 2);
      return SmallLangToLang(parts[1]);
    }

    //Vrati LineId a Lang ke slovniku
    public static CourseInfo getDictInfo(CourseIds crsId, bool isCurrent) {
      DictType mode = getDictType(crsId);
      if (mode == DictType.no) throw new InvalidDataException();
      if (crsId == CourseIds.DictEn) return new CourseInfo() { CrsId = crsId, Loc = Langs.en_gb, CourseType = ET_SiteMapId.lingea, IsCurrrent = isCurrent };
      return new CourseInfo() { CrsId = crsId, CourseType = ET_SiteMapId.lingea, IsCurrrent = isCurrent, Loc = getDict_toLang(crsId, mode) };
    }

    //Vrati typ slovniku nebo info, ze se nejedna o slovnik
    public static DictType getDictType(CourseIds crsId) {
      string ci = crsId.ToString(); int l = ci.Length;
      if (ci.Substring(0, Math.Min(4, l)) == "Dict") return DictType.Dict;
      else if (ci.Substring(0, Math.Min(9, l)) == "StudyDict") return DictType.StudyDict;
      else if (ci.Substring(0, Math.Min(7, l)) == "MidDict") return DictType.MidDict;
      else return DictType.no;
      //return ci.StartsWith("Dict") ? DictType.Dict : (ci.StartsWith("StudyDict") ? DictType.StudyDict : (ci.StartsWith("MidDict") ? DictType.MidDict : DictType.no));
    }

    //vrati slovnik typu type, ktery patri vyucovanemu kurzu v lineId a lokalizaci locLang
    public static CourseIds DictForLine(LineIds lineId, Langs loclang, ET_Lib.DictType type) { return DictForLang(CommonLib.LineIdToLang(lineId), loclang, type); }

    //vrati slovnik typu type, ktery patri vyucovanemu kurzu v loc_CourseId a lokalizaci locLang
    public static CourseIds DictForCourse(CourseIds crsId, Langs loclang, ET_Lib.DictType type) { return DictForLang(CommonLib.CourseIdToLang(crsId), loclang, type); }

    //vrati slovnik typu type, ktery patri vyucovanemu kurzu v loc_CourseId a lokalizaci locLang
    public static CourseIds CurrentSmallDictForCourse(CourseIds crsId, Langs loclang, bool isCurrent) {
      if (loclang == Langs.en_nz) return CourseIds.no;
      var allDicts = isCurrent ? CurrentSmallDictsTab : SmallDictsTab;
      CourseIds res = DictForCourse(crsId, loclang, DictType.StudyDict);
      return allDicts.ContainsKey(res) ? res : CourseIds.no;
    }

    public static void logHeader(TextWriter log, string name) {
      if (log == null) return;
      log.WriteLine();
      log.WriteLine("***************************");
      log.WriteLine("   " + name);
      log.WriteLine("***************************");
    }

    internal class SiteMapInfo {
      public ET_SiteMapId Id;
      public string Path() { return string.Format(Machines.basicPath + @"rew\LMCom\com\Web\{0}.sitemap", Id); }
    }

    internal static SiteMapInfo[] SiteMapInfos = LowUtils.EnumGetValues<ET_SiteMapId>().Where(si => AllSiteMapIds.Contains(si)).Select(si => new SiteMapInfo() { Id = si }).ToArray();

    public static IEnumerable<CourseIds> allDictConsts(TextWriter log, DictType dictId, Langs[] fromBase, Langs[] toBase) {
      var enums = fromBase.SelectMany(from => toBase.Where(to => to != from).Select(to => new { from, to })).Select(ft => dictId.ToString() + LangToSmallLang(ft.from) + "_" + LangToSmallLang(ft.to)).ToArray();
      foreach (var en in enums) {
        CourseIds res;
        try { res = LowUtils.EnumParse<CourseIds>(en); } catch { if (log != null) log.WriteLine(en); res = CourseIds.no; }
        if (res != CourseIds.no) yield return res;
      }
    }

    static XmlSiteMapProvider SiteMapRoot {
      get {
        if (siteMapRoot == null) {
          siteMapRoot = new XmlSiteMapProvider();
          NameValueCollection providerAttributes = new NameValueCollection(1);
          providerAttributes.Add("siteMapFile", "~/com/Web/com.sitemap");
          siteMapRoot.Initialize("testProvider", providerAttributes);
          siteMapRoot.BuildSiteMap();
        }
        return siteMapRoot;
      }

    } static XmlSiteMapProvider siteMapRoot;

    static CourseIds DictForLang(Langs srcLang, Langs loclang, ET_Lib.DictType type) {
      try {
        return LowUtils.EnumParse<CourseIds>(string.Format("{0}{1}_{2}", type, LangToSmallLang(srcLang), LangToSmallLang(loclang)));
      } catch {
        return CourseIds.no;
      }
    }

    public static IEnumerable<CourseInfo> allCourses(bool isCurrent) {
      var res = Enumerable.Empty<CourseInfo>();
      foreach (ET_SiteMapId type in AllSiteMapIds) res = res.Concat(allCourses(type, isCurrent));
      return res;
    }

    public static IEnumerable<CourseInfo> allCourses(ET_SiteMapId crsType, bool isCurrent) {
      //MODIFY LANGS var locLangs = isCurrent ? CommonLib.LingeaLocalizationLangs : CommonLib.FullLangsLingea;
      var locLangs = isCurrent ? CommonLib.smallLocalizations : CommonLib.FullLangsLingea;
      switch (crsType) {
        case ET_SiteMapId.lingea:
          var dicts = isCurrent ? CurrentSmallDicts.Concat(CurrentMiddleDicts) : SmallDicts.Concat(MiddleDicts);
          return dicts.Select(d => getDictInfo(d, isCurrent));
        default:
          var crss = crsType == ET_SiteMapId.talknow ? CommonLib.allETCourses : (crsType == ET_SiteMapId.talknowaudio ? CommonLib.allETAudio : (crsType == ET_SiteMapId.talknowlpc ? CommonLib.allETCPV : CommonLib.allETRewise));
          var universal = crsType != ET_SiteMapId.talknow ? Enumerable.Empty<CourseInfo>() : CommonLib.allETCourses.Select(crs => new CourseInfo() { CourseType = ET_SiteMapId.talknow, CrsId = crs, Loc = Langs.en_nz, IsCurrrent = isCurrent });
          return crss.SelectMany(
            crs => locLangs.Where(l => CommonLib.CourseIdToLang(crs) != l).Select(l => new CourseInfo() {
              CourseType = crsType,
              CrsId = crs,
              Loc = l,
              IsCurrrent = isCurrent
            })
          ).Concat(universal);
      }
    }
  }

  public static class ET_Generator {

    static string uniqueIdsFn = Machines.basicPath + @"rew\LMCom\App_Data\EuroTalkLoc\UniqueIds.XML";

    public static void UniqueIds() {
      int sitemapCnt;
      string uniqIdFn = Machines.basicPath + @"rew\LMComAdmin\App_Data\UniqueId.txt";
      using (StreamReader rdr = new StreamReader(uniqIdFn)) sitemapCnt = int.Parse(rdr.ReadLine());
      string fn = Machines.basicPath + @"rew\LMCom\App_Data\EuroTalkLoc\dbIds.XML";
      XElement root = File.Exists(uniqueIdsFn) ? XElement.Load(fn) : new XElement("root");
      foreach (var grp in ET_Lib.allCourses(false).GroupBy(ci => ci.CrsId)) {
        ET_Lib.CourseInfo first = grp.First();
        if (!root.Elements(first.CrsId.ToString()).Any())
          root.Add(new XElement(first.CrsId.ToString(), new XAttribute("dbId", sitemapCnt++.ToString())));
        if (first.CourseType == ET_SiteMapId.talknow && first.WithDict) {
          if (!root.Elements(first.CrsId.ToString() + "_with_dict").Any())
            root.Add(new XElement(first.CrsId.ToString() + "_with_dict", new XAttribute("dbId", sitemapCnt++.ToString())));
        }
      }
      root.Save(uniqueIdsFn);
      using (StreamWriter wr = new StreamWriter(uniqIdFn)) wr.Write(sitemapCnt);
    }

    static string getUniqueId(CourseIds crsId, bool withDict) {
      if (uniqueIds == null) uniqueIds = XElement.Load(uniqueIdsFn);
      return uniqueIds.Elements(crsId + (withDict ? "_with_dict" : null)).First().Attribute("dbId").Value;
    } static XElement uniqueIds;

    public delegate Currency GetProductPriceEvent(ET_Lib.CourseInfo crsInfo);
    public static GetProductPriceEvent OnGetProductPrice;

    //public static void Lmp(TextWriter log) {
    //  ET_Lib.logHeader(log, "DownloadFileGenerator.lmp");
    //  //foreach (var grp in ET_Lib.allCourses(false).GroupBy(ci => ci.CrsId)) {
    //  foreach (var grp in ET_Lib.allCourses(true).GroupBy(ci => ci.CrsId)) {
    //    ET_Lib.CourseInfo first = grp.First();
    //    Product prod = new Product();
    //    prod.LicenceList = new ProductLicence[] {
    //      new ProductLicence() {
    //        CourseId = first.CrsId,
    //        Licence = ProductLicenceType.download,
    //        LicPrice = OnGetProductPrice!=null ? OnGetProductPrice(first) : new Currency() {
    //          Typ = CurrencyType.eur,
    //          WithVat = true,
    //          Amount = 29
    //        }
    //      }
    //    };
    //    prod.Line = CommonLib.CourseIdToLineId(first.CrsId);
    //    prod.ET_SiteMapId = first.CourseType;
    //    prod.HideOnLmcom = false;
    //    string fn;
    //    if (first.CourseType == ET_SiteMapId.talknow) {
    //      prod.Icons = ProductIcons.Download | ProductIcons.Course1 | ProductIcons.Dict3000;
    //      bool hasDict = grp.Any(crs => crs.WithDict);
    //      if (hasDict) {
    //        prod.WithDict = true;
    //        prod.LocalizedTo = grp.Where(ci => ci.WithDict && ci.Loc != Langs.en_nz).Select(ci => ci.Loc).ToArray();
    //        prod.ProductRoyalities = new ProductRoyality[] {
    //          new ProductRoyality() {RoyalityTableItemId = "Lingea_50", Percent = 15.0, Type = ProductLicenceType.download},
    //          new ProductRoyality() {RoyalityTableItemId = "EuroTalk_50", Percent = 85.0, Type = ProductLicenceType.download}
    //        };
    //        LowUtils.AdjustFileDir(fn = first.FilePath(ET_Lib.SitemapNodeType.lmp));
    //        prod.CommerceId = int.Parse(getUniqueId(first.CrsId, prod.WithDict ?? false));
    //        Cms.PageTemplate.Save(prod, fn);
    //        prod.LocalizedTo = grp.Where(ci => !ci.WithDict && ci.Loc != Langs.en_nz).Select(ci => ci.Loc).Concat(new Langs[] { Langs.en_nz }).ToArray(); //;
    //        prod.WithDict = false;
    //        prod.ProductRoyalities = new ProductRoyality[] { new ProductRoyality() { RoyalityTableItemId = "EuroTalk_50", Percent = 100.0, Type = ProductLicenceType.download } };
    //        LowUtils.AdjustFileDir(fn = first.FilePath(ET_Lib.SitemapNodeType.lmp_nodict));
    //        prod.CommerceId = int.Parse(getUniqueId(first.CrsId, prod.WithDict ?? false));
    //        prod.Icons &= ~ProductIcons.Dict3000;
    //        Cms.PageTemplate.Save(prod, fn);
    //      } else {
    //        prod.LocalizedTo = grp.Select(ci => ci.Loc).ToArray();
    //        prod.WithDict = false;
    //        prod.ProductRoyalities = new ProductRoyality[] { new ProductRoyality() { RoyalityTableItemId = "EuroTalk_50", Percent = 100.0, Type = ProductLicenceType.download } };
    //        LowUtils.AdjustFileDir(fn = first.FilePath(ET_Lib.SitemapNodeType.lmp_nodict));
    //        prod.CommerceId = int.Parse(getUniqueId(first.CrsId, prod.WithDict ?? false));
    //        prod.Icons &= ~ProductIcons.Dict3000;
    //        Cms.PageTemplate.Save(prod, fn);
    //      }
    //    } else {
    //      prod.LocalizedTo = grp.Select(ci => ci.Loc).ToArray();
    //      LowUtils.AdjustFileDir(fn = first.FilePath(ET_Lib.SitemapNodeType.lmp));
    //      switch (first.CourseType) {
    //        case ET_SiteMapId.lingea:
    //          prod.Icons = ProductIcons.Download | (ET_Lib.getDictType(first.CrsId) == ET_Lib.DictType.StudyDict ? ProductIcons.Dict3000 : ProductIcons.Dict15000);
    //          prod.ProductRoyalities = new ProductRoyality[] { new ProductRoyality() { RoyalityTableItemId = "Lingea_50", Percent = 100.0, Type = ProductLicenceType.download } };
    //          break;
    //        case ET_SiteMapId.talknowaudio:
    //          prod.Icons = ProductIcons.Download | ProductIcons.Mp31;
    //          prod.ProductRoyalities = new ProductRoyality[] { new ProductRoyality() { RoyalityTableItemId = "EuroTalk_25", Percent = 100.0, Type = ProductLicenceType.download } };
    //          break;
    //        default:
    //          throw new NotImplementedException();
    //      }
    //      prod.CommerceId = int.Parse(getUniqueId(first.CrsId, prod.WithDict ?? false));
    //      Cms.PageTemplate.Save(prod, fn);
    //    }
    //  }
    //}


    public static void Aspx(TextWriter log) {
      foreach (var grp in ET_Lib.allCourses(false).GroupBy(ci => ci.CrsId)) {
        ET_Lib.CourseInfo first = grp.First();
        string fn = first.FilePath(ET_Lib.SitemapNodeType.product); LowUtils.AdjustFileDir(fn);
        StringUtils.StringToFile(string.Format(product, first.CourseType), fn);
        //fn = first.FilePath(ET_Lib.SitemapNodeType.download); LowUtils.AdjustFileDir(fn);
        //StringUtils.StringToFile(string.Format(download, first.CourseType), fn);
      }
    }
    const string product =
@"<%@ Page Language=""C#"" Theme=""site"" MasterPageFile=""~/site/web/lang/pages/HomeControls/Product.master"" Inherits=""site.ComProductPage""%>
<asp:Content ContentPlaceHolderID=""HelpContent"" Runat=""Server""/>";
    /*
    const string download =
@"<%@ Page Language=""C#"" MasterPageFile=""~/site/Download.master"" Theme=""site"" Inherits=""site.DownloadPage"" %>
<%@ Register Src=""~/site/web/Controls/Downloads/{0}.ascx"" TagName=""{0}"" TagPrefix=""lm"" %>
<asp:Content ContentPlaceHolderID=""HelpContent"" runat=""server""><lm:{0} runat=""server"" /></asp:Content>";
    */
    public static IEnumerable<ET_Lib.CourseInfo> DownloadXml() {
      return ET_Lib.allCourses(false).GroupBy(c => c.CrsId).Select(g => g.First());
      //http://localhost/lmcom/Services/Downloads/Generator.aspx?include=lingea_current
      //http://localhost/lmcom/Services/Downloads/Generator.aspx?include=talknow_current
      //?site=com&lang=fr_fr&courseid=StudyDicten_fr
    }

    public static void SiteMaps() {
      XElement fix = XElement.Load(Machines.basicPath + @"rew\LMCom\com\Web\com_gen_fix.xml");
      LineIds[] fixLines = fix.Elements().Select(e => e.Name.LocalName).Select(s => LowUtils.EnumParse<LineIds>(s)).ToArray();
      var allCrs = allSitemapsNode(true).ToArray();
      getSiteMapLmp(allCrs);
      getSiteMapProductDownload(ET_Lib.SitemapNodeType.product, allCrs);
      //getSiteMapProductDownload(ET_Lib.SitemapNodeType.download, allCrs);
      var grp = allCrs.GroupBy(cd => cd.course.Line);
      XElement root = new XElement(sitemap + "siteMap", new XAttribute("enableLocalization", "true"),
        new XElement(sitemap + "siteMapNode",
          grp.Select(g => getSiteMapLine(g.Key,
            (fixLines.Contains(g.Key) ? fix.Element(sitemap + g.Key.ToString()).Elements() : Enumerable.Empty<XElement>()).Concat(g.SelectMany(c =>
              new XElement[] { c.product, c.download }.
              Concat(c.lmp))
            )
          ))
        )
      );
      root.Save(Machines.basicPath + @"rew\LMCom\com\Web\com_gen.sitemap");
      /*foreach (ET_Lib.SiteMapInfo sm in ET_Lib.SiteMapInfos) {
        XElement lmp, product, dowload;
        XElement root = new XElement(sitemap + "siteMap", new XAttribute("enableLocalization", "true"),
          new XElement(sitemap + "siteMapNode",
            lmp = new XElement(sitemap + "siteMapNode", new XAttribute("url", sm.Id.ToString() + ".lmp")),
            product = new XElement(sitemap + "siteMapNode", new XAttribute("url", sm.Id.ToString() + ".product")),
            dowload = new XElement(sitemap + "siteMapNode", new XAttribute("url", sm.Id.ToString() + ".dowload"))
        ));
        var allCrs = allSitemapsNode(sm.Id, true).ToArray();
        getSiteMapLmp(allCrs);
        getSiteMapProductDownload(ET_Lib.SitemapNodeType.product, allCrs);
        getSiteMapProductDownload(ET_Lib.SitemapNodeType.download, allCrs);
        root.Save(sm.Path() + ".new");
      }*/
    } static XNamespace sitemap = "http://schemas.microsoft.com/AspNet/SiteMap-File-1.0";

    public enum siteNodeType { lmp, product, download }
    public class crsDict { public ET_Lib.CourseInfo course; public bool widtDict; public List<XElement> lmp = new List<XElement>(); public XElement product; public XElement download; }

    public static IEnumerable<crsDict> allSitemapsNode(ET_SiteMapId smId, bool current) {
      return ET_Lib.allCourses(smId, current).GroupBy(crs => crs.CrsId).Select(g => new crsDict() { course = g.First(), widtDict = g.Any(c => c.getMyDict(false) != CourseIds.no) });
    }

    public static IEnumerable<crsDict> allSitemapsNode(bool current) {
      //return ET_Lib.allCourses(current).GroupBy(crs => crs.CrsId).Where(c => c.Key == CourseIds.TN_Arabic || c.Key == CourseIds.TN_Arabic_Classical || c.Key == CourseIds.TN_Arabic_Modern_Standard).Select(g => new crsDict() { course = g.First(), widtDict = g.Any(c => c.getMyDict(current) != CourseIds.no) });
      return ET_Lib.allCourses(current).GroupBy(crs => crs.CrsId).Select(g => new crsDict() { course = g.First(), widtDict = g.Any(c => c.getMyDict(current) != CourseIds.no) });
    }

    static XElement getSiteMapLine(LineIds line, IEnumerable<XElement> childs) {
      string url = ET_Localize.lineIdString(line, true);
      return new XElement(sitemap + "siteMapNode",
        new XAttribute("url", string.Format("~/site-com/web/lang/pages/{0}.aspx", url)),
        new XAttribute("resourceKey", string.Format("pages_{0}", url)),
        new XAttribute("title", ET_Localize.lineIdString(line, false)),
        new XAttribute("description", url),
        childs);
    }

    static void getSiteMapProductDownload(ET_Lib.SitemapNodeType type, crsDict[] items) {
      string dir = type == ET_Lib.SitemapNodeType.download ? "downloads" : "products";
      ET_Lib.CourseInfoTitles tit = type == ET_Lib.SitemapNodeType.download ? ET_Lib.CourseInfoTitles.keStazeni : ET_Lib.CourseInfoTitles.title;
      foreach (crsDict crs in items) {
        string titStr = crs.course.czLocale(tit, true);
        XElement res = new XElement(sitemap + "siteMapNode",
          new XAttribute("url", crs.course.SitemapUrl(type)),
          new XAttribute("resourceKey", string.Format("pages_{2}_{0}_{1}", crs.course.CourseType, titStr, dir)),
          new XAttribute("description", titStr)
          );
        if (type == ET_Lib.SitemapNodeType.download) crs.download = res; else crs.product = res;
      }
    }

    /*static XNamespace LmCms = "LmCms";
    static string productId(ET_Lib.CourseInfo crs, bool withDict) {
      return XElement.Load(crs.FilePath(withDict ? ET_Lib.SitemapNodeType.lmp : ET_Lib.SitemapNodeType.lmp_nodict)).Descendants(LmCms + "ProductId_for_Sitemap").First().Value;
    }*/

    static void getSiteMapLmp(crsDict[] items) {
      foreach (crsDict crs in items) {
        if (crs.course.CourseType == ET_SiteMapId.talknow) {
          string resKey = crs.course.czLocale(ET_Lib.CourseInfoTitles.title, true);
          crs.lmp.Add(new XElement(sitemap + "siteMapNode",
            new XAttribute("url", crs.course.SitemapUrl(ET_Lib.SitemapNodeType.lmp_nodict)),
            new XAttribute("resourceKey", string.Format("pages_product-info_{0}_{1}-no-dict", crs.course.CourseType, resKey)),
            new XAttribute("title", crs.course.czLocale(ET_Lib.CourseInfoTitles.title, false)),
            new XAttribute("dbId", getUniqueId(crs.course.CrsId, false)),
            new XAttribute("className", "LMComLib.Cms.Product")
            ));
          if (crs.widtDict) {
            crs.lmp.Add(new XElement(sitemap + "siteMapNode",
              new XAttribute("url", crs.course.SitemapUrl(ET_Lib.SitemapNodeType.lmp)),
              new XAttribute("resourceKey", string.Format("pages_product-info_{0}_{1}", crs.course.CourseType, resKey)),
              new XAttribute("title", crs.course.czLocale(ET_Lib.CourseInfoTitles.withDictTitle, false)),
              new XAttribute("dbId", getUniqueId(crs.course.CrsId, true)),
              new XAttribute("className", "LMComLib.Cms.Product")
              ));
          }
        } else {
          crs.lmp.Add(new XElement(sitemap + "siteMapNode",
            new XAttribute("url", crs.course.SitemapUrl(ET_Lib.SitemapNodeType.lmp)),
            new XAttribute("resourceKey", string.Format("pages_product-info_{0}_{1}", crs.course.CourseType, crs.course.czLocale(ET_Lib.CourseInfoTitles.title, true))),
            new XAttribute("title", crs.course.czLocale(ET_Lib.CourseInfoTitles.title, false)),
            new XAttribute("dbId", getUniqueId(crs.course.CrsId, false)),
            new XAttribute("className", "LMComLib.Cms.Product")
            ));
        }
      }
    }

    public static void Dump() {
      XElement root = new XElement("root",
        ET_Lib.allCourses(true).Select(
          crs => new XElement(crs.CrsId.ToString(),
            new XAttribute("Type", crs.CourseType.ToString()),
            new XAttribute("Loc", crs.Loc.ToString()),
            new XAttribute("DictType", ET_Lib.getDictType(crs.CrsId)),
            new XAttribute("MyDict", crs.MyDict.ToString())
          )
        )
      );
      root.Save(@"c:\temp\allCourses.xml");
    }

    public static void ScriptBatchs() {
      var batchs = new[] {
        new {
          name="lingea_current", 
          values = ET_Lib.allCourses(ET_SiteMapId.lingea, true)},
        new {
          name="talknow_current", 
          values = ET_Lib.allCourses(ET_SiteMapId.talknow, true)},
        new {
          name="talknowAudio_current", 
          values = ET_Lib.allCourses(ET_SiteMapId.talknowaudio, true)},
      };
      foreach (var batch in batchs) {
        using (StreamWriter wr = new StreamWriter(Machines.basicPath + @"rew\LMCom\Services\Downloads\" + batch.name + ".batch")) {
          foreach (ET_Lib.CourseInfo crs in batch.values)
            wr.WriteLine(Domains.com.ToString() + ";" + crs.Loc.ToString() + ";" + crs.CrsId.ToString());
        }
        using (StreamWriter wr2 = new StreamWriter(Machines.basicPath + @"rew\LMCom\Services\Downloads\" + batch.name + ".cmd")) {
          foreach (ET_Lib.CourseInfo crs in batch.values)
            wr2.WriteLine(string.Format(@"call q:\lmcom\Downloads\com\{0}\{1}\NewBuild_All.cmd", crs.Loc.ToString().Replace('_', '-'), crs.CrsId));
        }
      }
    }

    public static void LineNames_Click() {
      XElement root = new XElement(html + "html",
        new XElement(html + "head"),
        new XElement(html + "body",
          new XElement(html + "LineNames",
            CommonLib.allCPVLines.Select(l => new XElement(l.ToString(), new XAttribute("force_trans", "true"), ET_Localize.LineTitle(l, Langs.en_gb)))
          )
        )
      );
      root.Save(Machines.basicPath + @"rew\RW2\Client\AppCommon\LineNames.lmdata");
      foreach (Langs lang in CommonLib.smallLocalizations) {
        if (lang == Langs.en_gb) continue;
        root = new XElement(html + "html",
          new XElement(html + "head"),
          new XElement(html + "body",
            new XElement(html + "LineNames",
              CommonLib.allCPVLines.Select(l => new XElement(l.ToString(), new XAttribute("force_trans", "true"), ET_Localize.LineTitle(l, lang)))
            )
          )
        );
        Langs nl = lang == Langs.sp_sp ? Langs.es_es : lang;
        root.Save(Machines.basicPath + @"rew\RW2\Client\AppCommon\app_localresources\LineNames." + nl.ToString().Replace('_', '-') + ".lmdata");
      }

    } static XNamespace html = "htmlPassivePage";

    public static void EAlinesxml() {
      XElement root = new XElement("root");
      foreach (Langs lng in CommonLib.bigLocalizations) {
        if (lng == Langs.cs_cz) continue;
        urlInfo.setCulture(lng.ToString());
        foreach (LineUrl lu in lineUrls) {
          SiteMapNode nd = SiteMap.Provider.FindSiteMapNode(lu.Url);
          root.Add(new XElement("item",
            new XAttribute("site", "com"),
            new XAttribute("line", lu.Line.ToString()),
            new XAttribute("lang", lng.ToString()),
            new XAttribute("title", nd.Title),
            new XAttribute("url", urlInfo.GetUrl(nd, SubDomains.no, lng)) //TODO SUBSITE
          ));
        }
      }
      root.Save(@"Q:\LMNet2\WebApps\eduauthornew\app_data\lines.gen.xml");
    }
    public struct LineUrl { public LineIds Line; public string Url; }
    static LineUrl[] lineUrls = new LineUrl[] {
      new LineUrl() {Line = LineIds.no, Url="~/site-com/web/lang/Pages/online-jazykova-skola-zdarma.aspx"},
      new LineUrl() {Line = LineIds.English, Url="~/site-com/web/lang/Pages/kurz-anglictiny-zdarma.aspx"},
      new LineUrl() {Line = LineIds.Spanish, Url="~/site-com/web/lang/Pages/kurz-spanelstiny-zdarma.aspx"},
      new LineUrl() {Line = LineIds.French, Url="~/site-com/web/lang/Pages/kurz-francouzstiny-zdarma.aspx"},
      new LineUrl() {Line = LineIds.Italian, Url="~/site-com/web/lang/Pages/kurz-italstiny-zdarma.aspx"},
      new LineUrl() {Line = LineIds.German, Url="~/site-com/web/lang/Pages/kurz-nemciny-zdarma.aspx"},
    };

    public static void DownloadExeUrls() {
      using (StreamWriter wr = new StreamWriter(@"c:\temp\downloadLink.htm", false, Encoding.UTF8)) {
        wr.WriteLine(d_HtmlStart);
        foreach (var loc in ET_Lib.allCourses(true).GroupBy(crs => new { crs.Loc, crs.Line }).GroupBy(g => g.Key.Loc).OrderBy(g => lngOrder(g.Key)).ThenBy(g => CommonLib.LangToLineId(g.Key).ToString())) {
          wr.WriteLine(loc.Key == Langs.en_nz || CommonLib.bigLocalizations.Contains(loc.Key) ? "<div>" : @"<div style=""color:LightGray"">");
          wr.WriteLine(string.Format("<h2>{0} localization</h2>", loc.Key == Langs.en_nz ? "Multilanguage Version" : CommonLib.LangToLineId(loc.Key).ToString()));
          wr.WriteLine(@"<blockquote>");
          foreach (var line in loc.OrderBy(l => l.Key.Line.ToString())) {
            wr.WriteLine("<blockquote>");
            wr.WriteLine(string.Format("<h3>Learning {0}</h3>", line.Key.Line));
            foreach (var crs in line) {
              string title = crs.locale(ET_Lib.CourseInfoTitles.titleOrDictTitle, false, loc.Key == Langs.en_nz ? Langs.en_gb : loc.Key);
              wr.WriteLine(string.Format(@"<a href=""http://download.langmaster.cz/eurotalk/{0}/Setup_{1}.exe"">{2}</a>", line.Key.Loc.ToString().Replace('_', '-'), crs.CrsId, title));
            }
            wr.WriteLine("</blockquote>");
          }
          wr.WriteLine("</blockquote>");
          wr.WriteLine("</div>");
        }
        wr.WriteLine(d_HtmlEnd);
      }
    }
    static int lngOrder(Langs lng) { return lng == Langs.en_nz || CommonLib.bigLocalizations.Contains(lng) ? 0 : 1; }
    const string d_HtmlStart =
@"
<html xmlns=""http://www.w3.org/1999/xhtml"">
<head>
  <meta http-equiv=""Content-Type"" content=""text/html; charset=utf-8"">
  <title>New LANGMaster Downloads</title>
</head>
<body>
  <h1>
    New LANGMaster Downloads</h1>
";
    const string d_HtmlEnd =
    @"
</body>
</html>
";

    public static void TradosXmlHelper() {
      //MODIFY LANGS var allLoc = CommonLib.LingeaLocalizationLangs.Concat(new Langs[] { Langs.zh_cn });
      var allLoc = CommonLib.smallLocalizations.Concat(new Langs[] { Langs.zh_cn });
      XElement root = XElement.Load(Machines.basicPath + @"rew\LMCom\App_Data\Trados.xml");
      XElement help = root.Descendants("Group").Single(el => el.Value == "Help").Parent;
      XElement include = help.Element("Include");
      XElement includeEx = help.Element("IncludeEx");
      //include do includeEx
      foreach (XElement el in include.Elements().ToArray()) {
        el.Remove();
        includeEx.Add(new XElement("LocIncludeEx", new XElement("FileName", el.Value), new XElement("Langs")));
      }
      //adjust includeEx
      foreach (XElement el in includeEx.Elements()) {
        string fn = el.Element("FileName").Value; XElement lng = el.Element("Langs");
        if (fn.IndexOf(EnCzPrefix) == 0) { setLangs(lng, new Langs[] { Langs.cs_cz, Langs.en_gb }); continue; }
        //MODIFY LANGS if (allLang.Contains(fn)) { setLangs(lng, CommonLib.LingeaLocalizationLangs); continue; }
        if (allLang.Contains(fn)) { setLangs(lng, CommonLib.smallLocalizations); continue; }
        setLangs(lng, CommonLib.bigLocalizations);
      }
      root.Save(Machines.basicPath + @"rew\LMCom\App_Data\Trados_New.xml");
    }
    static string[] allLang = new string[] {
        @"\com\web\com.sitemap",
        @"\com\Web\talknow.sitemap",
        @"\com\Web\talknowaudio.sitemap",
        @"\com\Web\talknowrewise.sitemap",
        @"\com\Web\talknowlpc.sitemap",
        @"\com\Web\Lingea.sitemap"    };
    const string EnCzPrefix = @"\site\web\lang\pages\help\downloads\rewise\";
    static void setLangs(XElement lng, IEnumerable<Langs> langs) { lng.Value = langs.Select(l => l.ToString()).Aggregate((r, i) => r + "," + i); }

  }

  public class ET_Localize { //Static trida. Jelikoz vsak obsahuje enums, ktere se serializuji, nesmi byt oznacena static

    //vsechny druhy lokalizovanych retezcu
    public enum MaskTypes {
      no,
      Kurz,
      KeStazeniKurz,
      KurzSlovnik,
      KeStazeniKurzSlovnik,
      AudioKurz,
      KeStazeniAudioKurz,
      StudijniSlovnik,
      KeStazeniStudijniSlovnik,
      Slovnik,
      KeStazeniSlovnik,
      VyukoveMaterialy,
      ListeningPronuncation,
      //masky pro home jazyka
      Titulek_ver1,
      Titulek_ver2,
      Titulek_ver3,
      Titulek_Welcome_ver1,
      Titulek_Welcome_ver2,
      Titulek_Welcome_ver3,
      Titulek_Listen_Talk,
      Titulek_REWISE,
      Titulek_Products_ver1,
      Titulek_Products_ver23, 
      Descr_StudyDict,
      Descr_MidDict,
      Descr_Course,
      Descr_CourseDict,
      Descr_Audio,
      Countries,
      Countries2,
      AlternativeProductLink_com,
      AlternativeProductLink_partner,
      //companies masks
      comp_AboutCourse,
      comp_Title,
      comp_TitleLong,
      comp_DownloadTitle,
      comp_Perex,
      comp_WhatPage,
      comp_Sezn_LM_LMS,
      comp_Sezn_LMS,
      //comp_Free_Title,
      //comp_Free_Link,
      comp_Buy_Title,
      comp_Buy_Link_SelfPro,
      comp_Buy_Link_BlendPro,
      comp_Slovnik,
      comp_Slovnik_From,
      comp_Slovnik_To,
      comp_ELandTitle,
      comp_ELandTitleLong,
      comp_ELandPerex,
      comp_ELandWhatPage,
      comp_eTestMeTitleSmall,
      comp_eTestMeTitleBig,
      /*
      comp_course_Beginners,
      comp_course_FalseBeginners,
      comp_course_PreIntermediate,
      comp_course_Intermediate,
      comp_course_UpperIntermediate,
      comp_course_Advanced,
      */
      /*comp_Buy_Link_SelfBasic,
      comp_Buy_Link_BlendBasic,*/
    }

    //Ohyby k nazvu kurzu: jedna polozka z Q:\lmcom\LMCom\App_Data\EuroTalkLoc\cs_cz.xml
    public struct TitleData {
      public TitleData(XElement el) {
        CourseId = LowUtils.EnumParse<CourseIds>(el.Name.LocalName);
        Title = elementValue(el, "title");
        DictFrom = elementValue(el, "dictFrom");
        DictTo = elementValue(el, "dictTo");
        Title_2p = elementValue(el, "title_2p");
        AdjWords = elementValue(el, "adjWords");
        AdjPhrases = elementValue(el, "adjPhrases");
        AdjPron_1p = elementValue(el, "adjPron_1p");
        AdjPron_2p = elementValue(el, "adjPron_2p");
        Countries = elementValue(el, "countries");
        Countries2 = elementValue(el, "countries2");
      }
      static string elementValue(XElement root, string name) {
        XElement res = root.Element(name);
        return res == null ? "XXX" : res.Value;
      }
      public CourseIds CourseId;
      public string Title;
      public string DictFrom;
      public string DictTo;

      public string Title_2p;
      public string AdjWords;
      public string AdjPhrases;
      public string AdjPron_1p;
      public string AdjPron_2p;
      public string Countries;
      public string Countries2;
    }

    //Jedna maska
    public class Mask {
      public MaskTypes Type;
      public string Value;
    }

    //Maska pro kazdy druh lokalizovaneho retezce, do ktere se formatuji stringy z TitleData. V CVS napr. q:\lmcom\LMCom\App_Data\EuroTalkLoc\en_gb_Mask.xml
    public class Masks {
      public Mask[] Items;
      public static Masks getDefault() {
        return new Masks() {
          Items = new Mask[] {
            new Mask() {Type = MaskTypes.Kurz, Value = "{0} pro začátečníky"},
            new Mask() {Type = MaskTypes.KeStazeniKurz, Value = "Ke stažení {0} pro začátečníky"},
            new Mask() {Type = MaskTypes.KurzSlovnik, Value = "{0} pro začátečníky + slovník"},
            new Mask() {Type = MaskTypes.KeStazeniKurzSlovnik, Value = "Ke stažení {0} pro začátečníky + slovník"},
            new Mask() {Type = MaskTypes.AudioKurz, Value = "{0} pro začátečníky – audiokurz"},
            new Mask() {Type = MaskTypes.KeStazeniAudioKurz, Value = "Ke stažení {0} pro začátečníky – audiokurz"},
            new Mask() {Type = MaskTypes.StudijniSlovnik, Value = "{1}-{5} studijní slovník"},
            new Mask() {Type = MaskTypes.KeStazeniStudijniSlovnik, Value = "Ke stažení {1}-{5} studijní slovník"},
            new Mask() {Type = MaskTypes.Slovnik, Value = "{1}-{5} slovník"},
            new Mask() {Type = MaskTypes.KeStazeniSlovnik, Value = "Ke stažení {1}-{5} slovník"},
            new Mask() {Type = MaskTypes.VyukoveMaterialy, Value = "{0} - kurzy, slovníky a další jazykové doplňky"},
            new Mask() {Type = MaskTypes.ListeningPronuncation, Value = "{0} - poslech a výslovnost"},
          }
        };
      }
    }

    public struct toLoc {

      //Klic jednoho lokalizovaneho retezce
      public CourseIds crsId; public MaskTypes type; public bool isUrl;

      //Pomocne udaje
      public CourseIds loc_CourseId; public CourseIds dictLoc_CourseId;

      public string Title(Langs lng) { return getCourse_string(lng, locData.getData(lng)); }

      public static IEnumerable<toLoc> create(CourseIds crsId, ET_Lib.DictType dictId, params MaskTypes[] types) {
        foreach (MaskTypes tp in types) {
          CourseIds cid = dictId == ET_Lib.DictType.no ? crsId : langToETCourseId(CommonLib.CourseIdToLang(crsId));
          CourseIds dl = dictId == ET_Lib.DictType.no ? CourseIds.no : langToETCourseId(ET_Lib.getDict_toLang(crsId, dictId));
          yield return new toLoc() { crsId = crsId, loc_CourseId = cid, isUrl = false, type = tp, dictLoc_CourseId = dl };
          yield return new toLoc() { crsId = crsId, loc_CourseId = cid, isUrl = true, type = tp, dictLoc_CourseId = dl };
        }
      }

      static string titleToUrl(string title, bool isCzSource) {
        StringBuilder buf = new StringBuilder();
        buf.Length = 0; bool isBlank = false;
        foreach (char ch in title) {
          if (char.IsLetterOrDigit(ch)) {
            if (isBlank) isBlank = false;
            buf.Append(ch);
          } else {
            if (isBlank) continue;
            isBlank = true;
            buf.Append('-');
          }
        }
        if (isCzSource)
          for (int i = 0; i < buf.Length; i++) buf[i] = LowUtils.removeDiakritic(buf[i]);
        return HttpUtility.UrlEncode(buf.ToString().ToLowerInvariant());
      } 

      string getCourse_string(Langs lng, locData data) {
        TitleData first = data.data[loc_CourseId];
        TitleData second = dictLoc_CourseId == CourseIds.no ? first : data.data[dictLoc_CourseId];
        string res = getCourseTitle(type, data.masks, first, second);
        return isUrl ? titleToUrl(res, lng == Langs.cs_cz) : res;
      }

      public static string getCompDictTitle(Langs locLang, MaskTypes type, Langs lngFrom, Langs lngTo) {
        //locData loc = locData.getData(locLang);
        //Mask mask = loc.masks.Items.First(m => m.Type == MaskTypes.comp_Slovnik);
        //TitleData dataFrom = loc.data[langToETCourseId(lngFrom)];
        //TitleData dataTo = loc.data[langToETCourseId(lngTo)];
        //return string.Format(mask.Value, dataFrom.DictFrom, dataFrom.DictTo);
        locData loc = locData.getData(locLang);
        return getCourseTitle(type, loc.masks, loc.data[langToETCourseId(lngTo)], loc.data[langToETCourseId(lngFrom)]);
      }

      public static string getCourseTitle(MaskTypes type, Masks masks, TitleData data, TitleData dictData) {
        string val = null;
        try {
          val = masks.Items.First(m => m.Type == type).Value;
          return string.Format(val, data.Title, data.DictFrom, data.DictTo, dictData.Title, dictData.DictFrom, dictData.DictTo,
            data.Title_2p, data.AdjWords, data.AdjPhrases, data.AdjPron_1p, data.AdjPron_2p, data.Countries, data.Countries2);
        } catch (Exception exp) {
          throw new Exception(string.Format("type={0}, value={1}, data.CourseId={2}", type, val, data.CourseId), exp);
        }
      }

      public static CourseIds langToETCourseId(Langs lng) { return LowUtils.EnumParse<CourseIds>("TN_" + CommonLib.LangToLineId(lng).ToString()); }
      public static CourseIds lineIdToETCourseId(LineIds line) { return LowUtils.EnumParse<CourseIds>("TN_" + line.ToString()); }
    }

    //Masky a ohyby k jedne lokalizaci: q:\lmcom\LMCom\App_Data\EuroTalkLoc\en_gb_Mask.xml a q:\lmcom\LMCom\App_Data\EuroTalkLoc\en_gb.xml
    public class locData {

      public Langs lang; //jazyk lokalizace

      /// <summary>
      /// pro lang: masky z napr. q:\lmcom\LMCom\App_Data\EuroTalkLoc\en_gb_Mask.xml
      /// </summary>
      public Masks masks;

      /// <summary>
      /// pro lang: pro kazdy ET kurz jeho ohyby (=parametry masky) z q:\lmcom\LMCom\App_Data\EuroTalkLoc\en_gb.xml
      /// </summary>
      public Dictionary<CourseIds, TitleData> data;

      public static locData getData(Langs lng) {
        return readData(lng);
        /*if (lng == Langs.cs_cz) return cs == null ? cs = readData(lng) : cs;
        else if (lng == Langs.en_gb) return eng == null ? eng = readData(lng) : eng;
        else return readData(lng);*/
      }

      static locData readData(Langs lng) {
        locData res;
        if (allLocData.TryGetValue(lng, out res)) return res;
        res = new locData() {
          data = new Dictionary<CourseIds, TitleData>(),
          //charMap = new Dictionary<char, string>(),
          masks = XmlUtils.FileToObject<Masks>(basicPath + lng.ToString() + "_Mask.xml")
        };
        allLocData.Add(lng, res);
        foreach (TitleData dt in XElement.Load(basicPath + lng.ToString() + ".xml").Elements().Select(el => new TitleData(el))) res.data.Add(dt.CourseId, dt);
        return res;
      }
      //static locData eng; static locData cs;
    }

    static Dictionary<Langs, locData> allLocData = new Dictionary<Langs, locData>();

    static string basicPath = Machines.basicPath + @"rew\LMCom\App_Data\EuroTalkLoc\";

    //static Langs[] czech_english_langs = new Langs[] { Langs.uk_ua, Langs.pl_pl };

    static string[] blankRow = new string[] { "", "", "" };

    public static void editStart(Langs lng) {
      Langs[] langs;
      //if (czech_english_langs.Contains(lng)) langs = new Langs[] { Langs.cs_cz, lng, Langs.en_gb };
      //else langs = new Langs[] { Langs.en_gb, lng };
      langs = new Langs[] { Langs.cs_cz, lng, Langs.en_gb };
      var data = langs.
        Select(l => locData.getData(l).data).
        Select(dt => dt.Select(kv => new {
          courseId = kv.Key,
          data = new string[] { kv.Value.Title, kv.Value.DictFrom, kv.Value.DictTo, kv.Value.Title_2p, kv.Value.AdjWords, kv.Value.AdjPhrases, kv.Value.AdjPron_1p, kv.Value.AdjPron_2p, kv.Value.Countries, kv.Value.Countries2 }
        }).ToArray()
        ).ToArray();
      var rows = CommonLib.allETCourses.Select(c =>
        new string[] { c.ToString() }.
        Concat(data[0].First(r => r.courseId == c).data).
        Concat(data[1].First(r => r.courseId == c).data).
        Concat(data.Length >= 3 ? data[2].First(r => r.courseId == c).data : blankRow));
      using (FileStream fs = new FileStream(basicPath + langs.Skip(1).First().ToString() + "_Excel.xml", FileMode.Create))
        ExcelExport.linqToExcel(rows, fs);
    }

    public static void editEnd(Langs lang) {
      var res = ExcelExport.excelToObjects(XElement.Load(basicPath + lang.ToString() + "_Excel.xml")).Select(row => row.ToArray()).ToArray();
      tableToLocalizeSource(res, lang, 11);
    }

    public static void ExportToTrados(Langs src, Langs lng) {
      XElement root = new XElement("lookup",
        LocalizedItems.Select(li => new XElement("item",
          new XElement(src.ToString(), new XCData(li.Title(src))),
          new XElement(lng.ToString(), new XElement("text", new XCData(li.Title(lng))))
        ))
      );
      root.Save(basicPath + lng.ToString() + "_Trados.xml");
    }

    public static void GenerateMasks() {
      foreach (Langs lng in CommonLib.FullLangsLingea)
        XmlUtils.ObjectToFile(basicPath + lng.ToString() + "_Mask.xml", Masks.getDefault());
    }

    public static toLoc[] LocalizedItems { get { return localizedItems == null ? localizedItems = localizedItemsLow() : localizedItems; } } static toLoc[] localizedItems;
    public static Dictionary<CourseIds, toLoc[]> LocalizedItemsTab { get { if (localizedItemsTab == null) { localizedItemsTab = new Dictionary<CourseIds, toLoc[]>(); foreach (var grp in LocalizedItems.GroupBy(l => l.crsId)) localizedItemsTab.Add(grp.Key, grp.ToArray()); } return localizedItemsTab; } } static Dictionary<CourseIds, toLoc[]> localizedItemsTab;

    //Nazev line, napr. afghanstina
    public static string LineTitle(LineIds line, Langs lng) {
      return locData.getData(lng).data[toLoc.lineIdToETCourseId(line)].Title;
    }

    //maska
    public static string MaskValue(Langs lng, MaskTypes mask) {
      try {
        return locData.getData(lng).masks.Items.First(m => m.Type == mask).Value;
      }
      catch (Exception exp) {
        throw new Exception(string.Format("Missing mask error: lang={0}, mask={1}", lng, mask));
      }
    }

    public static string MaskValue(LineIds line, Langs lng, MaskTypes mask) {
      toLoc[] locs = LocalizedItemsTab[toLoc.lineIdToETCourseId(line)];
      locData data = locData.getData(lng);
      TitleData pars = data.data[toLoc.lineIdToETCourseId(line)];
      TitleData dictPars = data.data[toLoc.langToETCourseId(lng)];
      return ET_Localize.toLoc.getCourseTitle(mask, data.masks, pars, dictPars);
    }

    //evidence vseho k lokalizaci
    static toLoc[] localizedItemsLow() {
      IEnumerable<toLoc> res = Enumerable.Empty<toLoc>();
      foreach (CourseIds crsId in CommonLib.allETCourses)
        res = res.Concat(toLoc.create(crsId, ET_Lib.DictType.no, 
          MaskTypes.Kurz, MaskTypes.KeStazeniKurz, MaskTypes.KurzSlovnik, MaskTypes.KeStazeniKurzSlovnik, MaskTypes.AudioKurz, MaskTypes.KeStazeniAudioKurz
          //MaskTypes.Titulek_slovnik, MaskTypes.Titulek_bez_slovniku, MaskTypes.Titulek_Welcome, MaskTypes.Titulek_Listen_Talk, MaskTypes.Titulek_REWISE, MaskTypes.Titulek_Products
      ));
      foreach (CourseIds crsId in ET_Lib.allDictConsts(null, ET_Lib.DictType.StudyDict, CommonLib.FullLangsLingea, CommonLib.FullLangsLingea))
        res = res.Concat(toLoc.create(crsId, ET_Lib.DictType.StudyDict, MaskTypes.StudijniSlovnik, MaskTypes.KeStazeniStudijniSlovnik));
      foreach (CourseIds crsId in ET_Lib.allDictConsts(null, ET_Lib.DictType.MidDict, CommonLib.FullMiddleLangsLingea, CommonLib.FullMiddleLangsLingea))
        res = res.Concat(toLoc.create(crsId, ET_Lib.DictType.MidDict, MaskTypes.Slovnik, MaskTypes.KeStazeniSlovnik));
      foreach (var grp in CommonLib.allUniqueETCourses.GroupBy(c => CommonLib.CourseIdToLineId(c))) {
        if (grp.Count() != 1) throw new Exception(grp.First().ToString());
        res = res.Concat(toLoc.create(grp.First(), ET_Lib.DictType.no, MaskTypes.VyukoveMaterialy, MaskTypes.ListeningPronuncation));
      }
      return res.ToArray();
    }

    public static string lineIdString(LineIds line, bool isUrl) {
      Langs lng = CommonLib.LineIdToLang(line);
      var it = LocalizedItems.First(li => CommonLib.CourseIdToLang(li.crsId) == lng && li.isUrl == isUrl && li.type == MaskTypes.VyukoveMaterialy);
      string res = it.Title(Langs.cs_cz);
      return res;
    }

    public static string lineIdToUrl(LineIds line) {
      return lineIdString(line, true);
    }

    //z rozlezene editacni excel tabulky (kde jsou ostra data od sloupce begCol) pripravi primari XML
    static void tableToLocalizeSource(string[][] tab, Langs lng, int begCol) {
      XElement root = new XElement(lng.ToString());
      string val;
      foreach (string[] row in tab) {
        CourseIds crs = LowUtils.EnumParse<CourseIds>(row[0]);
        XElement c;
        val = row.Length > begCol ? row[begCol].Trim() : null;
        root.Add(c = new XElement(crs.ToString(),
          new XElement("title", string.IsNullOrEmpty(val) ? "XXX" : val)
        ));
        if (CommonLib.extraETCourses.Contains(crs)) continue;
        Langs crsLng = CommonLib.CourseIdToLang(crs);
        if (CommonLib.FullLangsLingea.Contains(crsLng)) {
          val = row.Length > begCol + 1 ? row[begCol + 1].Trim() : null; c.Add(new XElement("dictFrom", string.IsNullOrEmpty(val) ? "XXX" : val));
          val = row.Length > begCol + 2 ? row[begCol + 2].Trim() : null; c.Add(new XElement("dictTo", string.IsNullOrEmpty(val) ? "XXX" : val));
        }
        val = row.Length > begCol + 3 ? row[begCol + 3].Trim() : null; c.Add(new XElement("title_2p", string.IsNullOrEmpty(val) ? "XXX" : val));
        val = row.Length > begCol + 4 ? row[begCol + 4].Trim() : null; c.Add(new XElement("adjWords", string.IsNullOrEmpty(val) ? "XXX" : val));
        val = row.Length > begCol + 5 ? row[begCol + 5].Trim() : null; c.Add(new XElement("adjPhrases", string.IsNullOrEmpty(val) ? "XXX" : val));
        val = row.Length > begCol + 6 ? row[begCol + 6].Trim() : null; c.Add(new XElement("adjPron_1p", string.IsNullOrEmpty(val) ? "XXX" : val));
        val = row.Length > begCol + 7 ? row[begCol + 7].Trim() : null; c.Add(new XElement("adjPron_2p", string.IsNullOrEmpty(val) ? "XXX" : val));
        val = row.Length > begCol + 8 ? row[begCol + 8].Trim() : null; c.Add(new XElement("countries", string.IsNullOrEmpty(val) ? "XXX" : val));
        val = row.Length > begCol + 9 ? row[begCol + 9].Trim() : null; c.Add(new XElement("countries2", string.IsNullOrEmpty(val) ? "XXX" : val));
      }
      root.Save(basicPath + lng.ToString() + ".xml");
    }

  }

}



namespace Down {
  public enum DownloadClass {
    none,
    ElementsLike, //Stare jazyky: root i prvek
    ElementsDictSound, //Slovniky ke starym jazykum: pouze prvek
    EA, //EA tituly: Generuj pouze HTML pro registraci, nikoliv davky. Pouze root, nemaji prvky.
    EngAct, //English in action
    Millenium, //Millenium
    Toefl, //Toefl
    EngCambridge, //YDP Cambridge, prvni instalacni download
    EngCambridgeSlave, //YDP Cambridge, dalsi 2 downloady
    EngBusiness,
    EngTeenTalk,
    Gopas,
    EasyLex,
    EuroTalk,
    EuroTalkAudio,
    RewiseCpv,
  }

}
