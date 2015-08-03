using System;
using System.Collections.Generic;
using System.Text;
using System.Web;
using System.Data.Linq;
using System.Data.Linq.Mapping;
using System.Linq;
using LMComData2;

namespace LMComLib {

  public abstract class LMComDataProvider {
    static LMComDataProvider() {
      increments[uiMain] = 100;
      increments[uiUserId] = 100;
      increments[uiLicenceIds] = 100;
      initValues[uiOrderId] = 11500;
      initValues[uiFakeOrderIds] = fakeOrderIdStart;
    }

    public const int fakeOrderIdStart = 2000000000;
    /// <summary>
    /// Identifikace generatoru UniqueIds
    /// </summary>
    public const int uiMain = 0;
    public const int uiIntranetBatch = 1;
    public const int uiPayPalReportKc = 2;
    public const int uiUserId = 3;
    public const int uiOrderId = 4;
    public const int uiLicenceIds = 5;
    public const int uiFakeOrderIds = 6;
    public const byte regLicenceIdLine = 1; //rada idu pro tabulku licenci
    public static Dictionary<int, Int64> maxIds = new Dictionary<int, long>();
    public static Dictionary<int, Int64> lastIds = new Dictionary<int, long>();
    public static Dictionary<int, int> increments = new Dictionary<int, int>();
    public static Dictionary<int, Int64> initValues = new Dictionary<int, Int64>();
    /*static Int64[] maxIds = new Int64[] { -1, -1, -1, -1, -1 };
    static Int64[] lastIds = new Int64[] { 0, 0, 0, 0, 0};
    static int[] increments = new int[] { 100, 1, 1, 100, 1};
    public static int[] initValues = new int[] { 0, 0, 0, 0, 11500 };*/

    public static LMComDataProvider Instance = new localProvider();
    public abstract Int64 otherIdToId(OtherType type, string id);
    protected abstract string readProfileLow(Int64 id);
    protected abstract string readProfileLow(string userName, string psw);
    protected abstract string readProfileLow(OtherType type, string id);
    protected abstract string readProfileLow(OtherType type, string id, string email);
    protected abstract bool writeProfileLow(bool isInsert, string data, ProfileDataCriteria crit);
    public abstract Int64 getUniqueId(int idId, int increment);
    public abstract string getPassword(string email);

    protected static ProfileData fromString(string s) {
      if (string.IsNullOrEmpty(s)) return null;
      ProfileData res = ProfileData.setAsString(s);
      res.oldAsString = s;
      return res;
    }

    public static void removeDuplicetedEMails(string email, Int64 selfId) {
      var db = Machines.getContext();
      var dupls = db.Users.Where(u => u.Id > 0 && u.EMail == email && u.Id != selfId).ToArray();
      foreach (var user in dupls)
        if (!user.EMail.StartsWith("fake@")) user.EMail = user.Id + "|" + user.EMail;
      db.SubmitChanges();
    }

    public static ProfileData readOtherProfile(OtherType type, string id) {
      return fromString(Instance.readProfileLow(type, id));
    }

    public static ProfileData readOtherProfile(OtherType type, string id, string email) {

      return fromString(Instance.readProfileLow(type, id, email));
    }

    public static ProfileData readProfile(string email, string psw) {
      return fromString(Instance.readProfileLow(email.ToLower(), psw));
    }

    public static IQueryable<User> rew_readProfileQuery(string email, string login, string psw) {
      var q = Machines.getContext(false).Users.Where(u => u.Roles != null);
      if (psw != null) q = q.Where(u => u.Password == psw);
      if (login == null) {
        email = email.ToLower(); q = q.Where(u => u.EMail == email);
      } else {
        login = login.ToLower(); q = q.Where(u => u.Login == login);
      }
      return q;
    }

    public static Int64 rew_readProfileId(string email, string login, string psw) {
      Int64 res = rew_readProfileQuery(email, login, psw).Select(u => u.Id).FirstOrDefault();
      return res <= 0 ? -1 : res;
    }

    public static ProfileData rew_readProfile(string email, string login, string psw) {
      string res = rew_readProfileQuery(email, login, psw).Select(u => u.Data).FirstOrDefault();
      return res == null ? null : fromString(res);
    }

    public static Int64 readProfileId(string email, string psw) {
      Int64 res = Machines.getContext(false).Users.Where(usr => usr.EMail == email.ToLower() && (psw == null || usr.Password == psw) && usr.Roles != null).Select(usr => usr.Id).FirstOrDefault();
      return res <= 0 ? -1 : res;
    }
    public static Int64 readProfileIdLogin(string login, string psw) {
      Int64 res = Machines.getContext(false).Users.Where(usr => usr.Login == login.ToLower() && (psw == null || usr.Password == psw) && usr.Roles != null).Select(usr => usr.Id).FirstOrDefault();
      return res <= 0 ? -1 : res;
    }
    public static ProfileData readProfileEx(Int64 id, bool readAnonymous) {
      if (Machines.isBuildEACache_BuildCD_Crawler) {
        ProfileData res = new ProfileData();
        res.Created = DateTime.UtcNow;
        //res.Version = 1;
        res.Id = -Math.Abs(id);
        return res;
      }
      if (!readAnonymous && id < 0) throw new Exception();
      return fromString(Instance.readProfileLow(id));
    }
    public static ProfileData readProfile(Int64 id) {
      return readProfileEx(id, false);
    }
    public static ProfileData createProfileStart(Domains site) {
      ProfileData res = new ProfileData();
      res.Created = DateTime.UtcNow;
      res.Site = site;
      //res.Version = 1;
      if (Machines.isBuildEACache_BuildCD_Crawler) {
        res.Id = 12345;
      } else {
        res.Id = getUniqueId(LMComDataProvider.uiUserId);
        res.Referer = HttpContext.Current.Request.UrlReferrer == null ? null : HttpContext.Current.Request.UrlReferrer.AbsolutePath;
      }
      return res;
    }
    public static ProfileData createProfile(Domains site) {
      ProfileData res = createProfileStart(site);
      WriteProfile(res);
      return res;
    }

    static string c_ProfileKey = Guid.NewGuid().ToString();

    public static ProfileData checkProfileInCache(HttpContext ctx, Int64 userId) {
      ProfileData prof = getProfileFromCache(ctx); if (prof == null) return null;
      if (prof.Id != (Int64)userId) { setProfileToCache(null); return null; }
      return prof;
    }

    public static ProfileData getProfileFromCache(HttpContext ctx) {
      if (ctx == null) return null;
      ProfileData res = null;
      ProfileData sessRes = (ProfileData)HttpContext.Current.Items[c_ProfileKey];
      if (HttpContext.Current.Session != null) {
        //HttpContext.Current.Items[c_ProfileKey] = null;
        res = (ProfileData)HttpContext.Current.Session[c_ProfileKey];
        if ((res == null && sessRes != null) /*|| (res != null && sessRes != null && res.Id!=sessRes.Id)*/) {
          HttpContext.Current.Session[c_ProfileKey] = sessRes;
          res = sessRes;
        }
      } else
        res = sessRes;
      return res;
    }

    public static ProfileData getProfileFromCache(Int64 id) {
      ProfileData res = getProfileFromCache(HttpContext.Current);
      if (res != null && res.Id == id) return res;
      if (id < 0) {
        res = new ProfileData(); res.Id = id; res.Created = DateTime.UtcNow;
      } else
        res = readProfile(id);
      setProfileToCache(res);
      return res;
    }

    public static void setProfileToCache(ProfileData data) {
      if (data == null) {
        HttpContext.Current.Items.Remove(c_ProfileKey);
        if (HttpContext.Current.Session != null) HttpContext.Current.Items.Remove(c_ProfileKey);
        return;
      }
      if (HttpContext.Current.Session == null)
        HttpContext.Current.Items[c_ProfileKey] = data;
      else
        HttpContext.Current.Session[c_ProfileKey] = data;
    }

    /// <summary>
    /// Zkontroluje, zdali se profil zmenil. Kdyz ano, ulozi jej
    /// </summary>
    public static void WriteProfile() {
      WriteProfile(LMStatus.Profile);
    }
    public static void WriteProfileEx(ProfileData data, bool saveAnonymous) {
      if (Machines.isBuildEACache_BuildCD_Crawler) return;
      if (data == null) throw new Exception();
      if (!saveAnonymous && data.Id < 0) return;
      string s = data.getAsString();
      bool isInsert = data.oldAsString == null;
      if (!isInsert && s == data.oldAsString) return;
      /*{
        if (s == data.oldAsString) return;
        //data.Version = data.Version + 1;
        //s = data.getAsString(); //nova serializace kvuli zvyseni verze
      }*/
      try {
        Instance.writeProfileLow(isInsert, s, new ProfileDataCriteria(data));
      } catch (Exception exp) {
        if (exp == null) return;
        try { if (isInsert) Instance.writeProfileLow(false, s, new ProfileDataCriteria(data)); } catch { }
      }
      data.oldAsString = s;
    }
    /// <summary>
    /// Zkontroluje, zdali se profil zmenil. Kdyz ano, ulozi jej
    /// </summary>
    public static void WriteProfile(ProfileData data) {
      WriteProfileEx(data, false);
    }

    public static int getUniqueId() {
      return (int)getUniqueId(uiMain);
    }

    public static int getRegLicenceId(Langs lang, int courseId) {
      //public static int getRegLicenceId(Domains site, int courseId) {
      //return getRegLicenceId(site, courseId, null);
      return getRegLicenceId(lang, courseId, null);
    }

    //public static int getRegLicenceId(Domains site, int courseId, int? increment) {
    public static int getRegLicenceId(Langs lang, int courseId, int? increment) {
      int idId = regLicenceIdLine << 24; //prvni byte je rada idu
      idId = idId | ((int)lang << 16); //druhy byte je site
      //idId = idId | ((int)site << 16); //druhy byte je site
      idId = idId | (courseId & 0x0000ffff); //posledni 2 bytes je CourseId
      return (int)getUniqueId(idId, increment);
    }

    public static Int64 getUniqueId(int idId, int? increment) {
      lock (typeof(LMComDataProvider)) {
        if (increment == null) {
          if (!increments.ContainsKey(idId)) increments.Add(idId, 1);
          increment = increments[idId];
        }
        if (!lastIds.ContainsKey(idId)) lastIds.Add(idId, 0);
        if (!maxIds.ContainsKey(idId)) maxIds.Add(idId, -1);
        if (lastIds[idId] < maxIds[idId]) {
          lastIds[idId] += 1;
          //Logging.Trace(System.Diagnostics.TraceLevel.Info, TraceCategory.All, "getUniqueId 1: idId=" + idId.ToString() + ", result=" + lastIds[idId].ToString());
          return lastIds[idId];
        }
        lastIds[idId] = Instance.getUniqueId(idId, (int)increment);
        maxIds[idId] = lastIds[idId] + (int)increment - 1;
        //Logging.Trace(System.Diagnostics.TraceLevel.Info, TraceCategory.All, "getUniqueId 2: idId=" + idId.ToString() + ", result=" + lastIds[idId].ToString());
        return lastIds[idId];
      }
    }
    public static Int64 getUniqueId(int idId) {
      return getUniqueId(idId, null);
    }
  }

  public class localProvider : LMComDataProvider {

    public static ProfileData readProfileLow(LMComData2.LMComDataContext db, Int64 id, out LMComData2.User user) {
      user = db.Users.Where(u => u.Id == id).FirstOrDefault();
      if (user == null) return null;
      return fromString(user.Data);
    }

    public static void updateProfileLow(LMComData2.User user, ProfileData profile) {
      writeProfileLow(user, profile.getAsString(), new ProfileDataCriteria(profile));
    }

    static string readProfileLow_(Int64 id) {
      return (from usr in Machines.getContext().Users where usr.Id == id select usr.Data).FirstOrDefault<string>();
    }

    protected override string readProfileLow(Int64 id) {
      return readProfileLow_(id);
    }

    static void writeProfileLow(User usr, string data, ProfileDataCriteria crit) {
      usr.Id = crit.Id;
      usr.EMail = crit.Email == null ? null : crit.Email.ToLower();
      usr.Password = crit.Password;
      usr.Created = crit.Created;
      usr.LastRequest = usr.Created;
      if (usr.Created < minValue) usr.Created = minValue;
      usr.ActivationMailSent = crit.ActivationMailSent;
      usr.Roles = crit.Roles;
      usr.Version = 0; // crit.Version;
      usr.Title = crit.Title;
      usr.Type = (short)crit.Type;
      usr.Fulltext = crit.Fulltext;
      usr.Male = crit.Male;
      usr.Data = data;
      usr.FirstName = crit.FirstName;
      usr.LastName = crit.LastName;
      usr.Icq = crit.ICQ;
      usr.Login = crit.Login;
      if (crit.OtherType != OtherType.no) {
        usr.OtherType = (short)crit.OtherType;
        usr.OtherId = crit.OtherId;
      }
      usr.Site = (short)crit.Site;
      usr.IpAddress = crit.IpAddress;
    }

    static DateTime minValue = new DateTime(1900, 1, 1);
    protected override bool writeProfileLow(bool isInsert, string data, ProfileDataCriteria crit) {
      if (Machines.isBuildEACache_BuildCD_Crawler) return true;
      LMComDataContext db = Machines.getContext();
      User usr;
      //new DebugEvent(isInsert.ToString() + "," + crit.Id.ToString() + "," + crit.Email, 1).Raise();
      if (isInsert) {
        usr = new User();
        db.Users.InsertOnSubmit(usr);
      } else
        usr = db.Users.First<User>(u => u.Id == crit.Id);
      writeProfileLow(usr, data, crit);
      if (usr.EMail == null && usr.Login==null) {
        new ErrorEvent(System.Diagnostics.TraceLevel.Error, TraceCategory.All, "writeProfileLow: email==null, userId=" + usr.Id.ToString()).Raise();
        return false;
      }
      db.SubmitChanges();
      //usr.Save();
      return true;
    }
    protected override string readProfileLow(string userName, string psw) {
      return (from usr in Machines.getContext(false).Users
              where usr.EMail == userName.ToLower() && (psw == null || usr.Password == psw) && usr.Roles != null
              select usr.Data).FirstOrDefault<string>();
    }

    public override Int64 otherIdToId(OtherType type, string id) {
      return (from usr in Machines.getContext(false).Users
              where usr.OtherType == (short)type && usr.OtherId == id
              select usr.Id).SingleOrDefault<Int64>();
    }

    protected override string readProfileLow(OtherType otherType, string otherId, string email) {
      var db = Machines.getContext(false);
      var res = db.Users.Where(usr => usr.OtherType == (short)otherType && usr.OtherId == otherId).Select(usr => usr.Data).FirstOrDefault();
      if (res != null) return res;
      return db.Users.Where(usr => usr.EMail == email && usr.Roles != null && usr.Id > 0).Select(usr => usr.Data).FirstOrDefault();
    }

    protected override string readProfileLow(OtherType otherType, string otherId) {
      var db = Machines.getContext(false);
      return db.Users.Where(usr => usr.OtherType == (short)otherType && usr.OtherId == otherId).Select(usr => usr.Data).FirstOrDefault();
    }

    public override Int64 getUniqueId(int idId, int increment) {
      LMComDataContext db = Machines.getContext(); if (db == null) return 0;
      UniqueId idRec = db.UniqueIds.FirstOrDefault<UniqueId>(ui => ui.Id == idId);
      if (idRec == null) {
        idRec = new UniqueId();
        db.UniqueIds.InsertOnSubmit(idRec);
        idRec.Id = idId;
        Int64 initId;
        idRec.Data = initValues.TryGetValue(idId, out initId) ? initId : 1;
      }
      Int64 res = idRec.Data + 1;
      idRec.Data = idRec.Data + increment;
      db.SubmitChanges();
      return res;

    }
    public override string getPassword(string email) {
      //LMComDataContext db = Machines.getContext();
      return (from usr in Machines.getContext().Users
              where usr.EMail == email.ToLower() && usr.Roles != null
              select usr.Password).FirstOrDefault<string>();
    }
  }
}
