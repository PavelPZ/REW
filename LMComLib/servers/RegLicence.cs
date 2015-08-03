using System;
using System.Collections.Generic;
using System.Data.Linq;
using System.Data.Linq.Mapping;
using System.Linq;
using System.IO;
using System.Text;
using System.Web;
using System.Web.SessionState;
using LMComData2;
using LMComLib.Cms;
using LMNetLib;

namespace LMComLib {

  /// <summary>
  /// Knihovna pro spravu licenci
  /// </summary>
  public static class RegLicenceServer {


    public static string errorText(AcceptLicenceResult err) {
      return EnumDescrAttribute.getDescr(typeof(AcceptLicenceResult), (int)err);
    }

    /// <summary>
    /// pocet dni pro trial
    /// </summary>
    public const int trialDays = 31;

    //public static string generateLicenceKey(Domains site, CourseIds crs) {
    public static string generateLicenceKey(Langs lang, CourseIds crs) {
      return generateLicenceKey(lang, crs, 1, ProductLicenceType.download, null).First().AsString;
      //return generateLicenceKey(site, crs, 1, ProductLicenceType.download, null).First().AsString;
    }
    //public static string generateLicenceKey(Domains site, string crsId) {
    public static string generateLicenceKey(Langs lang, string crsId) {
      //return generateLicenceKey (site, LowUtils.EnumParse<CourseIds>(crsId));
      return generateLicenceKey(lang, LowUtils.EnumParse<CourseIds>(crsId));
    }
    public static IEnumerable<RegLicenceObj> generateLicenceKey(Langs lang, CourseIds crsId, int num /*pocek klicu*/,
    //public static IEnumerable<RegLicenceObj> generateLicenceKey(Domains site, CourseIds crsId, int num /*pocek klicu*/,
      ProductLicenceType licence, Currency? externalPrice /*cena pro multiPrice nebo pocet mesicu pro fixStartDate*/) {
      RegLicenceScena scena; int? months = null; int? multiCount = null; UInt16? multiPrice = null;
      switch (licence) {
        case ProductLicenceType.box: throw new Exception();
        case ProductLicenceType.download: scena = RegLicenceScena.full; break;
        case ProductLicenceType.month3: scena = RegLicenceScena.date; months = 3; break;
        /*
        case ProductLicenceType.month6: scena = RegLicenceScena.date; months = 6; break;
        case ProductLicenceType.month12: scena = RegLicenceScena.date; months = 12; break;
        case ProductLicenceType.multi5Full: scena = RegLicenceScena.multiFull; multiCount = 5; break;
        case ProductLicenceType.multi10Full: scena = RegLicenceScena.multiFull; multiCount = 10; break;
        case ProductLicenceType.multi20Full: scena = RegLicenceScena.multiFull; multiCount = 20; break;
        case ProductLicenceType.multi50Full: scena = RegLicenceScena.multiFull; multiCount = 50; break;
        case ProductLicenceType.multi5Month12: scena = RegLicenceScena.multiDate; months = 12; multiCount = 5; break;
        case ProductLicenceType.multi10Month12: scena = RegLicenceScena.multiDate; months = 12; multiCount = 10; break;
        case ProductLicenceType.multi20Month12: scena = RegLicenceScena.multiDate; months = 12; multiCount = 20; break;
        */
        case ProductLicenceType.multi50Month12: scena = RegLicenceScena.multiDate; months = 12; multiCount = 50; break;
        case ProductLicenceType.multiPrice: scena = RegLicenceScena.multiPrice; multiPrice = Convert.ToUInt16(((Currency)externalPrice).Amount); break;
        case ProductLicenceType.fixStartDate: scena = RegLicenceScena.fixStartDate; multiPrice = Convert.ToUInt16(((Currency)externalPrice).Amount); break;
        default: throw new Exception();
      }
      //foreach (RegLicenceObj obj in generateLicenceKey(site, (short)crsId, num, scena, months, multiCount, multiPrice))
      foreach (RegLicenceObj obj in generateLicenceKey(lang, (short)crsId, num, scena, months, multiCount, multiPrice))
        yield return obj;
    }

    //public static IEnumerable<RegLicenceObj> generateLicenceKey (Domains site, short courseId, int num, RegLicenceScena scena, int? months, int? multiCount, UInt16? multiPrice) {
    public static IEnumerable<RegLicenceObj> generateLicenceKey (Langs lang, short courseId, int num, RegLicenceScena scena, int? months, int? multiCount, UInt16? multiPrice) {
      RegLicenceObj obj = new RegLicenceObj();
      for (int i = 0; i < num; i++) {
        //obj.Serie = LMComDataProvider.getRegLicenceId(site, courseId, num + 1);
        obj.Serie = LMComDataProvider.getRegLicenceId(lang, courseId, num + 1);
        obj.Product = courseId;
        //obj.Domain = site;
        obj.Lang = lang;
        obj.Scena = scena;
        obj.Months = months == null ? 0 : (int)months;
        obj.MultiCount = multiCount == null ? 0 : (int)multiCount;
        obj.MultiPrice = multiPrice == null ? (UInt16)0 : (UInt16)multiPrice;
        yield return obj;
      }
    }
    /// <summary>
    /// Dle obchodniho typu licence pripravi fyzicky licencni klic
    /// </summary>
    public static void generateLicenceKey(onKeyCreatedEvent onCreated, Langs lang, CourseIds crsId, int num /*pocek klicu*/,
    //public static void generateLicenceKey(onKeyCreatedEvent onCreated, Domains site, CourseIds crsId, int num /*pocek klicu*/,
      ProductLicenceType licence, Currency? externalPrice /*cena pro multiPrice nebo pocet mesicu pro fixStartDate*/) {
      //foreach (RegLicenceObj obj in generateLicenceKey(site, crsId, num, licence, externalPrice))
        foreach (RegLicenceObj obj in generateLicenceKey(lang, crsId, num, licence, externalPrice))
        onCreated(obj);
    }
    public delegate void onKeyCreatedEvent(RegLicenceObj key);
    /// <summary>
    /// generator licencnich klicu
    /// </summary>
    //public static void generateLicenceKey(onKeyCreatedEvent onCreated, Domains site, short courseId, int num, RegLicenceScena scena, int? months, int? multiCount, UInt16? multiPrice) {
    public static void generateLicenceKey(onKeyCreatedEvent onCreated, Langs lang, short courseId, int num, RegLicenceScena scena, int? months, int? multiCount, UInt16? multiPrice) {
      //foreach (RegLicenceObj obj in generateLicenceKey(site, courseId, num, scena, months, multiCount, multiPrice))
      foreach (RegLicenceObj obj in generateLicenceKey(lang, courseId, num, scena, months, multiCount, multiPrice))
        onCreated(obj);
    }

    /// <summary>
    /// Helper funkce: zajisti existenci LicenceOffline pro serii, produkt a site.
    /// </summary>
    static LicenceOffline adjustOffline(RegLicenceObj licObj, LMComDataContext ctx) {
      LicenceOffline res =
        (from lic in ctx.LicenceOfflines
         //where lic.Serie == licObj.Serie && lic.Site == (short)licObj.Domain && lic.CourseId == (short)licObj.Product
         where lic.Serie == licObj.Serie && lic.Site == (short)licObj.Lang && lic.CourseId == (short)licObj.Product
         select lic).FirstOrDefault<LicenceOffline>();
      if (res != null) return res;
      res = new LicenceOffline();
      res.Created = DateTime.UtcNow.ToUniversalTime();
      res.Serie = licObj.Serie;
      //res.Site = (short)licObj.Domain;
      res.Site = (short)licObj.Lang;
      res.CourseId = licObj.Product;
      res.UserCount = licObj.Scena == RegLicenceScena.multiDate || licObj.Scena == RegLicenceScena.multiFull ? (short)licObj.MultiCount : (short)1;
      res.Data = "";
      ctx.LicenceOfflines.InsertOnSubmit(res);
      return res;
    }

    static void logOfflinelicence(LMComDataContext ctx, RegOfflineType type, AcceptLicenceResult result, LicenceOffline licData, string hwKey, string data) {
      LicOfflineLog offLog = new LicOfflineLog();
      ctx.LicOfflineLogs.InsertOnSubmit(offLog);
      offLog.LicenceOffline = licData;
      offLog.HwKey = hwKey;
      offLog.Result = (short)result;
      offLog.Type = (short)type;
      if (type == RegOfflineType.auto)
        offLog.Data = ArmadilloCodeGen.getHwLog(data);
      else
        offLog.Data = data;
      offLog.UtcTime = DateTime.UtcNow;
      offLog.MachineName = System.Environment.MachineName;
    }

    /// <summary>
    /// Zkontroluje, zdali je licence pro download platna
    /// </summary>
    public static AcceptLicenceResult acceptDownloadLicence(Langs lang, CourseIds crsId, string licStr, out RegLicenceObj newLic) {
    //public static AcceptLicenceResult acceptDownloadLicence(Domains site, CourseIds crsId, string licStr, out RegLicenceObj newLic) {
      newLic = null;
      if (string.IsNullOrEmpty(licStr)) return AcceptLicenceResult.formatError;
      AcceptLicenceResult res = RegLicenceObj.AsStringCheck(licStr, lang, out newLic);
      //AcceptLicenceResult res = RegLicenceObj.AsStringCheck(licStr, site, out newLic);
      if (res!=AcceptLicenceResult.ok) return res;
      if ((short)crsId != newLic.Product) return AcceptLicenceResult.wrongCourseId;
      LMComDataContext db = Machines.getContext();
      LicenceOffline licData = adjustOffline(newLic, db);
      RegOfflineHistory hist = RegOfflineHistory.fromString(licData.Data);
      if (hist.Count >= 3) {
        logOfflinelicence(db, RegOfflineType.MP3Download, AcceptLicenceResult.toManyOfflineUsers, licData, "MP3", null);
        db.SubmitChanges();
        return AcceptLicenceResult.toManyOfflineUsers;
      }
      hist.addHw("MP3");
      licData.Data = hist.toString();
      licData.HistoryLen = (short)hist.Count;
      logOfflinelicence(db, RegOfflineType.MP3Download, AcceptLicenceResult.ok, licData, "MP3", null);
      db.SubmitChanges();
      return AcceptLicenceResult.ok;
    }
    
    //zablokuje klic
    public static bool blockOfflineLicenceKey(string licStr) {
      RegLicenceObj licObj = new RegLicenceObj();
      licObj.AsString = licStr;
      LMComDataContext db = Machines.getContext();
      LicenceOffline licData = adjustOffline(licObj, db);
      licData.MaxCount = 0;
      db.SubmitChanges();
      return licData.HistoryLen == 0;
    }

    /// <summary>
    /// generace aktivacnich klicu pro Offline HW a licencni klic
    /// </summary>
    public static AcceptLicenceResult acceptOfflineLicence(string regKey, out string actKey, RegOfflineType logType, string logInfo) {
      regKey = regKey.Trim().Replace("-", null);
      RegLicenceObj licObj; string hwKey;
      try {
        actKey = ArmadilloCodeGen.getActKey(regKey, out licObj, out hwKey);
      } catch {
        actKey = null;
        return AcceptLicenceResult.formatError;
      }
      LMComDataContext db = Machines.getContext();
      LicenceOffline licData = adjustOffline(licObj, db);
      RegOfflineHistory hist = RegOfflineHistory.fromString(licData.Data);  
      //Hw jiz existuje, hotovo
      if (hist.findHw(hwKey) != null) return AcceptLicenceResult.ok;
      //Kontrola pripustneho poctu uzivatelu
      int maxUsers;
      if (licData.MaxCount != null)
        maxUsers = (int)licData.MaxCount;
      else {
        double multiFactor;
        if (licData.UserCount == 1)
          multiFactor = 3.0;
        else if (licData.UserCount < 5)
          multiFactor = 2.0;
        else if (licData.UserCount < 20)
          multiFactor = 1.5;
        else
          multiFactor = 1.2;
        maxUsers = (int)(multiFactor * licData.UserCount);
      }
      //pocet HW klicu vycerpan
      if (hist.Count >= maxUsers) {
        logOfflinelicence(db, logType, AcceptLicenceResult.toManyOfflineUsers, licData, hwKey, logInfo);
        db.SubmitChanges();
        return AcceptLicenceResult.toManyOfflineUsers;
      }
      //Zalozeni noveho Hw:
      hist.addHw(hwKey);
      licData.Data = hist.toString();
      licData.HistoryLen = (short)hist.Count;
      logOfflinelicence(db, logType, AcceptLicenceResult.ok, licData, hwKey, logInfo);
      db.SubmitChanges();
      return AcceptLicenceResult.ok;
    }

  }

  public class RegOfflineHistoryItem {
    public DateTime Created;
    public string Hw;
  }
  public class RegOfflineHistory : List<RegOfflineHistoryItem> {
    public static RegOfflineHistory fromString(string xml) {
      if (string.IsNullOrEmpty(xml)) return new RegOfflineHistory();
      return (RegOfflineHistory)XmlUtils.StringToObject(xml, typeof(RegOfflineHistory));
    }
    public string toString() {
      return XmlUtils.ObjectToString(this);
    }
    public RegOfflineHistoryItem findHw(string hw) {
      hw = hw.ToLower();
      foreach (RegOfflineHistoryItem it in this)
        if (it.Hw == hw) return it;
      return null;
    }
    public void addHw(string hw) {
      RegOfflineHistoryItem item = new RegOfflineHistoryItem();
      item.Created = DateTime.UtcNow.ToUniversalTime();
      item.Hw = hw.ToLower();
      Add(item);
    }
  }

}
