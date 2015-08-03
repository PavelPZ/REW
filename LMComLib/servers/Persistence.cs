using System;
using System.Collections.Generic;
using System.Data.Linq;
using System.Data.Linq.Mapping;
using System.Data.SqlClient;
using System.Linq;
using System.Text;
using System.Web;
using System.Web.Caching;
using System.Transactions;

using LMComData2;
using CookComputing.XmlRpc;
using LMNetLib;

namespace LMComLib {

  public static class Persistence {


    //pocet osob na strance pro strankovani
    //public const int pageSize = 10;

    //pomocna trida pro mezivysledek v setModuleData
    public class UserDataPair {
      public UserDataPair(CourseUser user, CourseData data) {
        User = user; Data = data;
      }
      public CourseUser User;
      public CourseData Data;
    }

    //LM Scorm 
    public static bool setModuleData(HttpContext ctx, Domains site, CourseIds courseId, Int64 userId, string key, string data, string shortData) {
      //PZ 19.9.08: osetreni deadlock pro SQL server
      try {
        return setModuleDataLow(ctx, site, courseId, userId, key, data, shortData);
      } catch (Exception exp) {
        try {
          new ErrorEvent(System.Diagnostics.TraceLevel.Error, TraceCategory.All, "PZ Ladeni: setModuleData 2: " + exp.Message).Raise();
          bool res = setModuleDataLow(ctx, site, courseId, userId, key, data, shortData);
          return res;
        } catch (Exception exp2) {
          new ErrorEvent(System.Diagnostics.TraceLevel.Error, TraceCategory.All, "PZ Ladeni: setModuleData 3 : " + exp2.Message).Raise();
          using (var txn = new TransactionScope(TransactionScopeOption.Required, new TransactionOptions { IsolationLevel = IsolationLevel.ReadUncommitted })) {
            bool res2 = setModuleDataLow(ctx, site, courseId, userId, key, data, shortData);
            txn.Complete();
            return res2;
          }
        }
      }
    }

    static bool setModuleDataLow(HttpContext ctx, Domains site, CourseIds courseId, Int64 userId, string key, string data, string shortData) {
      LMComDataContext db = Machines.getContext();
      CourseUser CrsUser = db.CourseUsers.FirstOrDefault(usr => usr.UserId == userId && usr.CourseId == (short)courseId /*&& usr.Site == (short)site*/);
      CourseData Data = CrsUser == null ? null : CrsUser.CourseDatas.FirstOrDefault(cd => cd.Key == key);
      if (data == null) {
        if (Data != null) db.CourseDatas.DeleteOnSubmit(Data); //smazani existujicich dat
      } else {
        if (CrsUser == null) { //zalozeni usera
          CrsUser = new CourseUser();
          db.CourseUsers.InsertOnSubmit(CrsUser);
          CrsUser.UserId = userId; CrsUser.CourseId = (short)courseId; //CrsUser.Site = (short)site;
          CrsUser.LastRequest = DateTime.UtcNow;
          CrsUser.SessionsNum = 1;
          CrsUser.SessionsNumDate = CrsUser.LastRequest;
        }
        if (Data == null) { //zalozeni dat
          Data = new CourseData();
          db.CourseDatas.InsertOnSubmit(Data);
          Data.CourseUser = CrsUser; Data.Key = key;
        }
        Data.Data = data; Data.ShortData = shortData; //aktualizace dat
      }
      db.SubmitChanges(); //submit
      return true;
    }

    //LM Scorm 
    public static bool setData(HttpContext ctx, Domains site, CourseIds courseId, Int64 userId, string key, string data) {
      return setModuleData(ctx, site, courseId, userId, key, data, null);
    }

    //LM Scorm 
    public static string getData(HttpContext ctx, Domains site, CourseIds courseId, Int64 userId, string key) {
      try {
        using (var txn = new TransactionScope(TransactionScopeOption.Required, new TransactionOptions { IsolationLevel = IsolationLevel.ReadUncommitted })) {
          LMComDataContext db = Machines.getContext();
          try {
            return (from data in db.CourseDatas
                    where data.Key == key /*&& data.CourseUser.Site == (short)site*/ && data.CourseUser.CourseId == (short)courseId && data.CourseUser.UserId == userId
                    select data.Data).SingleOrDefault();
          } catch {
            List<LMComData2.CourseData> crs =
              (from data in db.CourseDatas
               where data.Key == key /*&& data.CourseUser.Site == (short)site*/ && data.CourseUser.CourseId == (short)courseId && data.CourseUser.UserId == userId
               select data).ToList();
            LMComData2.CourseData res = crs[0]; crs.RemoveAt(0);
            db.CourseDatas.DeleteAllOnSubmit(crs);
            db.SubmitChanges();
            txn.Complete();
            return res.Data;
          }
        }
      } catch (Exception exp) {
        throw new Exception("getData", exp);
      }
    }

    public static bool resetCourseData(HttpContext ctx, Int64 userId, IEnumerable<string> modIds) {
      LMComDataContext db = Machines.getContext();
      var ids = modIds.ToArray();
      foreach (var it in LowUtils.intervals(ids.Length, 20)) {
        var itIds = ids.Skip(it.skip).Take(it.take).ToArray();
        db.CourseDatas.DeleteAllOnSubmit(db.CourseDatas.Where(cd => cd.CourseUser.UserId == userId && itIds.Contains(cd.Key)));
      }
      db.SubmitChanges();
      return true;
    }

    //LM Scorm 
    public static string getCourseData(HttpContext ctx, Domains site, CourseIds courseId, Int64 userId) {
      try {
        using (var txn = new TransactionScope(TransactionScopeOption.Required, new TransactionOptions { IsolationLevel = IsolationLevel.ReadUncommitted })) {
          LMComDataContext db = Machines.getContext();
          var items =
            from data in db.CourseDatas
            where /*data.CourseUser.Site == (short)site &&*/ data.CourseUser.CourseId == (short)courseId && data.CourseUser.UserId == userId && data.ShortData != null
            select new { data.Key, data.ShortData };
          StringBuilder sb = null;
          foreach (var item in items) {
            if (sb == null) sb = new StringBuilder();
            sb.AppendFormat("\"{0}\":{1},", item.Key, item.ShortData);
          }
          if (sb != null) sb.Length = sb.Length - 1;
          return "{" + (sb == null ? null : sb.ToString()) + "}";
        }
      } catch (Exception exp) {
        throw new Exception("getCourseData", exp);
      }
    }

    public static TimeSpan c_RefreshLastRequestInterval = new TimeSpan(0, 5, 0); //interval zapisu do posledniho requestu do Requests tabulky
    static TimeSpan c_DaysNumInterval = new TimeSpan(6, 0, 0); //interval, po kterem ze zvetsuje SessionNum
    static TimeSpan c_CookieInterval = new TimeSpan(12, 0, 0); //pro jistotu, kdyby bylo cookie persistentni (MAC?)

    //Aktualizace CourseUser.LastRequest: zapis datum posledniho requestu
    public static void setLastRequest(HttpContext ctx, LMCookie cook, CourseIds crs) {
      if (cook.id <= 0) return;
      LMComDataContext db = Machines.getContext();
      try {
        int res = db.ExecuteCommand("UPDATE Users SET LastRequest = {0} WHERE Id={1}", DateTime.UtcNow, cook.id/*, (short)crs, (short)site*/);
        if (res > 0 && crs != CourseIds.no) {
          DateTime now = DateTime.UtcNow;
          LMComData2.CourseUser crsUser = db.CourseUsers.Where(cu => cu.CourseId == (short)crs && cu.UserId == cook.id).FirstOrDefault();
          if (crsUser == null) {
            crsUser = new CourseUser();
            db.CourseUsers.InsertOnSubmit(crsUser);
            crsUser.UserId = cook.id;
            crsUser.CourseId = (short)crs;
            crsUser.SessionsNum = 1;
            crsUser.SessionsNumDate = now;
          } else {
            TimeSpan interval = now - crsUser.SessionsNumDate;
            //posledni zapis pred 6 hodinami, pouze jedenkrat za existenci cookie nebo po 12 hodinach.
            if (interval > c_DaysNumInterval && (cook.SessionNum == 0 || interval > c_CookieInterval)) {
              crsUser.SessionsNum = crsUser.SessionsNum + 1;
              crsUser.SessionsNumDate = now;
            }
          }
          crsUser.LastRequest = now;
          db.SubmitChanges();
          cook.CourseUserId = crsUser.Id;
          cook.SessionNum = crsUser.SessionsNum;
        }
      } catch (Exception exp) {
        string s = exp.Message;
      }
    }
  }
}
