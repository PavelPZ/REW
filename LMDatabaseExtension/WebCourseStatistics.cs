using System;
using System.Data;
using System.Data.SqlClient;
using System.Globalization;
using System.Data.SqlTypes;
using System.Linq;
using Microsoft.SqlServer.Server;
using System.Collections;
using System.Collections.Generic;
using System.IO;
using Admin;
using System.Xml.Linq;
using System.Xml.Serialization;

namespace Admin {

  public static class Test {
    public struct NameProc { public string name; public Func<object> proc; }

    public static void dump(int companyId, Action<object,string> saveData, string cs, List<string> queries) {
      var handler = new StoredProcedures(companyId, cs);
      handler.queries = queries;
      queries.Add("*** lmsql_CompanyDepartment");
      saveData(handler._lmsql_CompanyDepartment(), "lmsql_CompanyDepartment");
      queries.Add("*** lmsql_CompanyDepartmentCrsUser");
      saveData(handler._lmsql_CompanyDepartmentCrsUser(), "lmsql_CompanyDepartmentCrsUser");
      queries.Add("*** lmsql_CourseUser");
      saveData(handler._lmsql_CourseUser(), "lmsql_CourseUser");
      queries.Add("*** lmsql_Modules");
      saveData(handler._lmsql_Modules(), "lmsql_Modules");
      queries.Add("*** lmsql_MonthInfo");
      saveData(handler._lmsql_MonthInfo(), "lmsql_MonthInfo");
      queries.Add("*** lmsql_ScoreIntervals");
      saveData(handler._lmsql_ScoreIntervals(), "lmsql_ScoreIntervals");
      queries.Add("*** lmsql_SecIntervals");
      saveData(handler._lmsql_SecIntervals(), "lmsql_SecIntervals");
      queries.Add("*** lmsql_Time");
      saveData(handler._lmsql_Time(), "lmsql_Time");
      saveData(StoredProcedures.TocFlat.fromResources().Cast<StoredProcedures.TocFlat>().ToArray(), "lmsql_TocFlat");
      queries.Add("*** lmsql_YearInfo");
      saveData(handler._lmsql_YearInfo(), "lmsql_YearInfo");
    }

  }

  public enum IntType { score, sec, time }

  public partial class Interval {
    //pracovni field, slouzi k prenosu Id z napr. lmsql_ScoreIntervals do lmsql_Intervals_FillRow
    public int id;
    public IntType type;
    [XmlIgnore]
    public Interval[] items;
    public string getTitle() {
      if (!string.IsNullOrEmpty(Title)) return Title;
      var idx = Array.IndexOf(items, this);
      switch (type) {
        case IntType.score:
          var max = idx == 0 ? 100 : items[idx - 1].From;
          var min = items[idx].From + 1;
          if (max == min) return min.ToString() + '%';
          return min.ToString() + " - " + max.ToString() + '%';
        case IntType.sec:
          if (idx == 0) return toStringValue() + " -";
          return toStringValue() + " - " + items[idx - 1].toStringValue();
        case IntType.time:
          return localizePeriod(items[idx].From, idx == items.Length - 1 ? -1 : items[idx + 1].From, CultureInfo.GetCultureInfo("en-gb"), false);
        default:
          throw new NotImplementedException();
      }
    }

    string toStringValue() {
      switch (type) {
        case IntType.sec:
          TimeSpan ts = new TimeSpan(0, 0, From);
          return ts.ToString();
        case IntType.time:
          return null;
        default:
          throw new NotImplementedException();
      }
    }

  }

  public partial class Intervals {

    public static int ScoreId(Interval[] ints, int? score) {
      if (score == null) return ints.Length - 1;
      int s = (int)score;
      for (int i = 0; i < ints.Length; i++) if (s > ints[i].From) return i;
      return 0;
    }

    public static int SecId(Interval[] secInt, int sec) {
      for (int i = 0; i < secInt.Length; i++) if (sec >= secInt[i].From) return i;
      return 0;
    }
  }

}

public partial class StoredProcedures {

  public StoredProcedures(int companyId, string connString = null) { this.companyId = companyId; this.connString = connString ?? "context connection=true"; }

  int companyId;
  string connString;
  public List<string> queries;

  public class TimeInterval {
    public int monthCode; //napr. 1401, 1412 apod.
    public Interval period;
    public static IEnumerable<TimeInterval> getTimeIntervals(StoredProcedures proc) {
      var periods = proc.getInterval(IntType.time, () => Intervals.TimeDefault(), cfg => cfg.Periods);
      var min = periods.First().From; var max = periods.Last().From;
      foreach (var r in Enumerable.Range(0, 50/*let*/).SelectMany(y => Enumerable.Range(0, 12).Select(m => Admin.Interval.MonthCode(m + 1, y + 2013))).Where(mc => mc >= min && mc <= max)) {
        yield return new TimeInterval() {
          period = periods.Last(p => r >= p.From),
          monthCode = r,
        };
      }
    }
    //static public int YearCode(int Year) { return (Year - 2000) * 100; }
  }

  public static void lmsql_Intervals_FillRow(object obj, out short Id, out string Title) {
    Interval src = obj as Interval;
    Id = (short)src.id; Title = src.getTitle();
  }
  Interval[] getInterval(IntType type, Func<Intervals> defValue, Func<Admin.IntervalsConfig, Intervals> cfgValue) {
    Interval[] res;
    using (SqlConnection conn = new SqlConnection(connString)) {
      conn.Open();
      using (var rdr = getReader(sql_company_IntervalsConfig, companyId, conn)) {
        var row = rdr.Cast<IDataRecord>().First();
        if (row.IsDBNull(0)) res = defValue().Items;
        else res = cfgValue(IntervalsConfig.fromString(rdr.GetString(0))).Items;
      }
    }
    for (int i = 0; i <= res.Length - 1; i++) { res[i].id = i; res[i].type = type; res[i].items = res; }
    return res;
  }
  //static T StringToObject<T>(string s) where T : class {
  //  if (String.IsNullOrEmpty(s)) return null;
  //  try {
  //    using (StringReader reader = new StringReader(s))
  //      return (T)new XmlSerializer(typeof(T)).Deserialize(reader);
  //  } catch (Exception exp) {
  //    throw new Exception(exp.Message + "   " + s, exp);
  //  }
  //}

  //******* SCORE per month and year ******************************************************************
  public IEnumerable _lmsql_ScoreIntervals() {
    return getInterval(IntType.score, () => Intervals.ScoreDefault(), cfg => cfg.Scores);
  }
  [SqlFunction(DataAccess = DataAccessKind.Read, FillRowMethodName = "lmsql_Intervals_FillRow",
     TableDefinition = "Score_Id smallint, Title nvarchar(MAX)")]
  public static IEnumerable lmsql_ScoreIntervals(int companyId) {
    return new StoredProcedures(companyId)._lmsql_ScoreIntervals();
  }

  //******* SEConds ******************************************************************
  public IEnumerable _lmsql_SecIntervals() {
    return getInterval(IntType.sec, () => Intervals.SecDefault(), cfg => cfg.Secs);
  }
  [SqlFunction(DataAccess = DataAccessKind.Read, FillRowMethodName = "lmsql_Intervals_FillRow",
     TableDefinition = "Sec_Id smallint, Title nvarchar(MAX)")]
  public static IEnumerable lmsql_SecIntervals(int companyId) {
    return new StoredProcedures(companyId)._lmsql_SecIntervals();
  }

  //created by d:\LMCom\rew\Web4\Schools\Design\QueryBuilder.aspx.cs
  const string sql_users = "SELECT [Db2].Id,[Db2].EMail,[Db2].FirstName,[Db2].LastName FROM  [dbo].[CompanyUsers] AS [Db1] INNER JOIN [dbo].[Users] AS [Db2] ON [Db1].[UserId] = [Db2].[Id] WHERE ({0} = [Db1].[CompanyId]) AND ([Db1].[DepartmentId] IS NOT NULL)";
  const string sql_company_IntervalsConfig = "SELECT IntervalsConfig FROM Companies WHERE Id={0}";
  const string sql_companyUsers = "SELECT [Db1].Id, [Db1].UserId, [Db1].DepartmentId FROM [dbo].[CompanyUsers] AS [Db1] WHERE ({0} = [Db1].[CompanyId]) AND ([Db1].[DepartmentId] IS NOT NULL)";
  const string sql_courseUsers = "SELECT [Db2].Id, [Db2].UserId, [Db2].ProductId FROM  [dbo].[CompanyUsers] AS [Db1] INNER JOIN [dbo].[CourseUsers] AS [Db2] ON [Db1].[Id] = [Db2].[UserId] WHERE ({0} = [Db1].[CompanyId]) AND ([Db1].[DepartmentId] IS NOT NULL)";
  const string sql_courseDatas = "SELECT [Db3].[Id] AS [Id1], [Db3].[CourseUserId] AS [CourseUserId], [Db3].[ShortData] AS [ShortData], [Db3].[Key] AS [Key], [Db1].[Id] AS [Id] FROM   [dbo].[CompanyUsers] AS [Db1] INNER JOIN [dbo].[CourseUsers] AS [Db2] ON [Db1].[Id] = [Db2].[UserId] INNER JOIN [dbo].[CourseDatas] AS [Db3] ON ([Db2].[Id] = [Db3].[CourseUserId]) AND ([Db3].[ShortData] IS NOT NULL) WHERE ({0} = [Db1].[CompanyId]) AND ([Db1].[DepartmentId] IS NOT NULL)";

  //******* COURSE USER ******************************************************************
  public class CourseUser { public int CourseUser_Id; public long User_Id; public string ProductId; public string FirstName; public string LastName; public string EMail; public int CompanyUser_Id; public long DepartmentId; }
  public class CompanyUser { public int CompanyUser_Id; public long User_Id/*pomocna promenna*/; public int? DepartmentId; }
  public class User { public long User_Id; public string EMail; public string FirstName; public string LastName; }

  [SqlFunction(DataAccess = DataAccessKind.Read, FillRowMethodName = "lmsql_CourseUser_FillRow",
     TableDefinition = "CourseUser_Id int, CompanyUser_Id int, User_Id bigint, DepartmentId bigint, FirstName nvarchar(MAX), LastName nvarchar(MAX), EMail nvarchar(MAX)")]
  public static IEnumerable lmsql_CourseUser(int companyId) {
    return new StoredProcedures(companyId)._lmsql_CourseUser();
  }

  public List<CourseUser> _lmsql_CourseUser() {
    using (SqlConnection conn = new SqlConnection(connString)) {
      conn.Open();
      CourseUser[] courseUser; Dictionary<int, CompanyUser> companyUser; Dictionary<long, User> user;
      using (var rdr = getReader(sql_courseUsers, companyId, conn))
        courseUser = rdr.Cast<IDataRecord>().Select(row => new CourseUser() { CourseUser_Id = row.GetInt32(0), CompanyUser_Id = row.GetInt32(1), ProductId = row.GetString(2) }).ToArray();
      using (var rdr = getReader(sql_companyUsers, companyId, conn))
        companyUser = rdr.Cast<IDataRecord>().Select(row => new CompanyUser() { CompanyUser_Id = row.GetInt32(0), User_Id = row.GetInt64(1), DepartmentId = row.IsDBNull(2) ? (int?)null : row.GetInt32(2) }).ToDictionary(cu => cu.CompanyUser_Id, cu => cu);
      using (var rdr = getReader(sql_users, companyId, conn))
        user = rdr.Cast<IDataRecord>().Select(row => new User() { User_Id = row.GetInt64(0), EMail = row.GetString(1), FirstName = row.GetString(2), LastName = row.GetString(3) }).ToDictionary(u => u.User_Id, u => u);
      List<CourseUser> res = new List<CourseUser>();
      foreach (var cu in courseUser) {
        CompanyUser compu = companyUser[cu.CompanyUser_Id];
        User u = user[compu.User_Id];
        cu.User_Id = u.User_Id; cu.EMail = u.EMail; cu.FirstName = u.FirstName; cu.LastName = u.LastName; cu.DepartmentId = (int)compu.DepartmentId;
        res.Add(cu);
      };
      return res;
    }
  }

  public static void lmsql_CourseUser_FillRow(object obj, out SqlInt32 CourseUser_Id, out SqlInt32 CompanyUser_Id, out SqlInt64 User_Id, out SqlInt64 DepartmentId, out SqlString FirstName, out SqlString LastName, out SqlString EMail) {
    CourseUser src = obj as CourseUser;
    CourseUser_Id = src.CourseUser_Id; CompanyUser_Id = src.CompanyUser_Id; User_Id = src.User_Id; DepartmentId = src.DepartmentId; EMail = src.EMail; FirstName = src.FirstName; LastName = src.LastName;
  }

  SqlDataReader getReader(string query, int companyId, SqlConnection conn) {
    var q = string.Format(query, companyId);
    if (queries!=null) queries.Add(q);
    return new SqlCommand(q, conn).ExecuteReader(); 
  }

  // COMMON
  //http://www.codeproject.com/Articles/33052/Visual-Representation-of-SQL-Joins
  List<Module> readCourseData() {
    List<Module> res = new List<Module>();
    using (SqlConnection conn = new SqlConnection(connString)) {
      conn.Open();
      var toc = TocFlat.fromResources().ToDictionary(t => t.ProdAndUrl, t => t);
      CourseData[] courseData; Dictionary<int, CourseUser> courseUser;
      using (var rdr = getReader(sql_courseDatas, companyId, conn))
        courseData = rdr.Cast<IDataRecord>().Select(row => new CourseData() { ModId = row.GetInt64(0), CourseUser_Id = row.GetInt32(1), ShortData = row.GetString(2), Key = row.GetString(3) }).ToArray();
      using (var rdr = getReader(sql_courseUsers, companyId, conn))
        courseUser = rdr.Cast<IDataRecord>().Select(row => new CourseUser() { CourseUser_Id = row.GetInt32(0), CompanyUser_Id = row.GetInt32(1), ProductId = row.GetString(2) }).ToDictionary(cu => cu.CourseUser_Id, cu => cu);
      if (queries != null)
        queries.Add(string.Format("readCourseData: courseData.count={0}, courseUser.count={1}", courseData.Count(), courseUser.Count()));
      foreach (var cd in courseData) {
        var parts = cd.ShortData.Trim(new char[] { '{', '}' }).Split(',').Select(s => s.Split(':')).ToDictionary(p => p[0].Trim(new char[] { '"', ' ' }), p => p[1]);
        if (queries != null)
          queries.Add(parts.Select(p => p.Key + "=" + p.Value).Aggregate((r,i) => r + "," + i));
        if (parts["st"] != "3") continue; //not evaluated
        CourseUser cu = courseUser[cd.CourseUser_Id];
        var endDate = IntToDate(Int64.Parse(parts["et"])).Date;
        var Score = ToPercent(int.Parse(parts["ms"]), int.Parse(parts["s"]));
        var Month = endDate.Month;
        var Year = endDate.Year;
        var prodUrl = TocFlat.getProdAndUrl(cu.ProductId, cd.Key);
        if (queries != null) queries.Add(prodUrl);
        var tocItem = toc[prodUrl];
        res.Add(new Module() {
          CourseUser_Id = cd.CourseUser_Id,
          CompanyUser_Id = cu.CompanyUser_Id,
          ModId = cd.ModId,
          ModTitle = tocItem.LessTitle + " | " + tocItem.ModTitle,
          LevId = tocItem.LevId,
          LevTitle = tocItem.CrsTitle + " | " + tocItem.LevTitle,
          //ProductId = cu.ProductId,
          ProdAndUrl = prodUrl,
          Score = Score,
          Sec = (short)(int.Parse(parts["t"]) / 1000),
          MonthCode = Admin.Interval.MonthCode(Month, Year),
          //YearCode = TimeInterval.YearCode(Year),
        });
      };
      return res;
    }
  }

  //******* MONTH INFO ******************************************************************
  public class MonthInfo { public int Uniq_Id; public long User_Id; public int ScoreId; public int SecId; public int MonthCode; }

  public IEnumerable _lmsql_MonthInfo() {
    var modules = readCourseData();
    var crsUsers = _lmsql_CourseUser().GroupBy(u => u.CompanyUser_Id).ToDictionary(g => (long)g.Key, g => g.ToArray());
    List<MonthInfo> res = new List<MonthInfo>();
    int scoreId; int secId; int id = 0;
    foreach (var compUser in modules.GroupBy(m => crsUsers[m.CompanyUser_Id].First().User_Id)) {
      foreach (var g in compUser.GroupBy(u => u.MonthCode)) {
        var mods = g.ToArray();
        adjustIntervalId(mods,
          getInterval(IntType.score, () => Intervals.ScoreDefault(), cfg => cfg.Scores),
          getInterval(IntType.sec, () => Intervals.SecDefault(), cfg => cfg.Secs),
          out scoreId, out secId);
        res.Add(new MonthInfo() { Uniq_Id = id++, User_Id = compUser.Key, ScoreId = scoreId, SecId = secId, MonthCode = g.Key });
      }
    }
    return res;
  }

  [SqlFunction(DataAccess = DataAccessKind.Read, FillRowMethodName = "lmsql_MonthInfo_FillRow",
     TableDefinition = "Uniq_Id int, User_Id bigint, ScoreId smallint, SecId smallint, MonthCode smallint, MonthStr nvarchar(MAX)")]
  public static IEnumerable lmsql_MonthInfo(int companyId) {
    return new StoredProcedures(companyId)._lmsql_MonthInfo();
  }

  public static void lmsql_MonthInfo_FillRow(object obj, out SqlInt32 Uniq_Id, out SqlInt64 User_Id, out SqlInt16 ScoreId, out SqlInt16 SecId, out SqlInt16 MonthCode, out SqlString MonthStr) {
    MonthInfo src = obj as MonthInfo;
    Uniq_Id = src.Uniq_Id; User_Id = src.User_Id; ScoreId = (short)src.ScoreId; SecId = (short)src.SecId; MonthCode = (short)src.MonthCode;
    int m, y;
    Admin.Interval.FromMonthCode(src.MonthCode, out m, out y); var cult = CultureInfo.GetCultureInfo("en-gb");
    MonthStr = new DateTime(y, m, 1).ToString(cult.DateTimeFormat.YearMonthPattern, cult);
  }

  //******* YEAR INFO ******************************************************************
  public class PeriodInfo { public int Uniq_Id; public long User_Id; public int ScoreId; public int SecId; public int PeriodCode; public string PeriodStr; }

  public IEnumerable _lmsql_YearInfo() {
    var modules = readCourseData();
    var crsUsers = _lmsql_CourseUser().GroupBy(u => u.CompanyUser_Id).ToDictionary(g => (long)g.Key, g => g.ToArray());
    var periods = getInterval(IntType.time, () => Intervals.TimeDefault(), cfg => cfg.Periods);
    Func<Module, Interval> modPeriod = m => periods.Last(p => m.MonthCode >= p.From);
    List<PeriodInfo> res = new List<PeriodInfo>();
    int scoreId; int secId; int id = 0;
    foreach (var usr in modules.GroupBy(m => crsUsers[m.CompanyUser_Id].First().User_Id)) {
      foreach (var g in usr.GroupBy(u => modPeriod(u).id)) {
        var mods = g.ToArray();
        adjustIntervalId(mods,
          getInterval(IntType.score, () => Intervals.ScoreDefault(), cfg => cfg.Scores),
          getInterval(IntType.sec, () => Intervals.SecDefault(), cfg => cfg.Secs),
          //Intervals.ScoreDefault().Items, 
          //Intervals.SecDefault().Items, 
          out scoreId, out secId);
        res.Add(new PeriodInfo() { Uniq_Id = id++, User_Id = usr.Key, ScoreId = scoreId, SecId = secId, PeriodCode = g.Key, PeriodStr = modPeriod(g.First()).getTitle() });
      }
    }
    return res;
  }
  [SqlFunction(DataAccess = DataAccessKind.Read, FillRowMethodName = "lmsql_YearInfo_FillRow",
     TableDefinition = "Uniq_Id int, User_Id bigint, ScoreId smallint, SecId smallint, PerionCode smallint, PeriodStr nvarchar(MAX)")]
  public static IEnumerable lmsql_YearInfo(int companyId) {
    return new StoredProcedures(companyId)._lmsql_YearInfo();
  }

  public static void lmsql_YearInfo_FillRow(object obj, out SqlInt32 Uniq_Id, out SqlInt64 User_Id, out SqlInt16 ScoreId, out SqlInt16 SecId, out SqlInt16 PeriodCode, out SqlString PeriodStr) {
    PeriodInfo src = obj as PeriodInfo;
    Uniq_Id = src.Uniq_Id; User_Id = src.User_Id; ScoreId = (short)src.ScoreId; SecId = (short)src.SecId;
    PeriodCode = (short)src.PeriodCode; PeriodStr = src.PeriodStr;
  }

  //******* MODULE ******************************************************************
  public class CourseData { public Int64 ModId; public int CourseUser_Id; public string ShortData; public string Key; }

  public class Module {
    public Int64 ModId;
    public string ModTitle;
    public int LevId;
    public string LevTitle;
    public int CourseUser_Id;
    public int CompanyUser_Id;
    //zatrideni do struktury produktu
    //public int ProductId;
    public string ProdAndUrl; //napr. 118/english1_xl01_sa_shome_dhtm
    //sledovane info o vyuce
    public int? Score; //skore modulu, -1 => nevyhodnotitelny
    public int Sec; //cas straveny v modulu, ve vterinach
    public int MonthCode; //14001..26012, YearId-2000 * 100 + MonthId
    //public int PeriodCode; //poradove cislo v ciselniku Period (getInterval(companyId, IntType.time, () => Intervals.TimeDefault(), cfg => cfg.Periods);)
  }

  public IEnumerable _lmsql_Modules() { return readCourseData(); }
  [SqlFunction(DataAccess = DataAccessKind.Read, FillRowMethodName = "lmsql_Modules_FillRow",
     TableDefinition = "CourseUser_Id int, DataId bigint, ProdAndUrl nvarchar(MAX), Score smallint, Sec smallint, MonthCode smallint")]
  public static IEnumerable lmsql_Modules(int companyId) {
    return new StoredProcedures(companyId)._lmsql_Modules();
  }

  static void adjustIntervalId(Module[] mods, Interval[] scoreInt, Interval[] secInt, out int scoreId, out int secId) {
    double sc = 0; int scnt = 0; int sec = 0;
    foreach (var m in mods) { sec += m.Sec; if (m.Score == null) continue; scnt++; sc += (int)m.Score; }
    scoreId = Intervals.ScoreId(scoreInt, scnt == 0 ? (int?)null : (int)((double)sc / scnt));
    secId = Intervals.SecId(secInt, sec);
  }

  public static void lmsql_Modules_FillRow(object obj, out SqlInt32 CourseUser_Id, out SqlInt64 DataId, out SqlString ProdAndUrl, out SqlInt16 Score, out SqlInt16 Sec, out SqlInt16 MonthCode) {
    Module src = obj as Module;
    DataId = src.ModId; CourseUser_Id = src.CourseUser_Id; ProdAndUrl = src.ProdAndUrl;
    Score = src.Score == null ? SqlInt16.Null : (Int16)src.Score; Sec = (short)src.Sec; MonthCode = (short)src.MonthCode;
  }

  static DateTime IntToDate(Int64 val) { return new DateTime(1970, 1, 1).AddMilliseconds(val); }
  static int? ToPercent(int ms, int s) { return ms == 0 ? (int?)null : (int)(100.0 * s / ms); }
  static long depId(int companyId, int? id) { return id == null ? 0 : (long)companyId * 1000000000 + (int)id; }
  static short month(DateTime dt) { return (short)((dt.Year - 1970) * 12 + dt.Month); }

  //******* TIME ******************************************************************

  public class Time { public short MonthCode; public short Month; public string Month_en_gb; public short PeriodCode; public string PeriodStr; }

  public IEnumerable _lmsql_Time() {
    return TimeInterval.getTimeIntervals(this).Select(src => {
      int m, y;
      Admin.Interval.FromMonthCode(src.monthCode, out m, out y);
      return new Time() {
        Month = (short)m,
        PeriodStr = src.period.getTitle(),
        MonthCode = (short)src.monthCode,
        PeriodCode = (short)src.period.id,
        Month_en_gb = CultureInfo.CreateSpecificCulture("en-gb").DateTimeFormat.GetMonthName(m),
      };
    }).ToArray();
  }


  [SqlFunction(DataAccess = DataAccessKind.Read, FillRowMethodName = "lmsql_Time_FillRow",
     TableDefinition = "MonthCode smallint, Month smallint, Month_en_gb nvarchar(MAX), PeriodCode smallint, PeriodStr nvarchar(MAX)")]
  public static IEnumerable lmsql_Time(int companyId) {
    return new StoredProcedures(companyId)._lmsql_Time();
  }

  public static void lmsql_Time_FillRow(object obj, out SqlInt16 MonthCode, out SqlInt16 Month, out SqlString Month_en_gb, out SqlInt16 PeriodCode, out SqlString PeriodStr) {
    Time src = obj as Time;
    Month = src.Month; PeriodStr = src.PeriodStr; MonthCode = src.MonthCode; PeriodCode = src.PeriodCode; Month_en_gb = src.Month_en_gb;
  }

  //******* TOC ******************************************************************

  [SqlFunction(DataAccess = DataAccessKind.Read, FillRowMethodName = "lmsql_TocFlat_FillRow",
    TableDefinition = "ProdAndUrl nvarchar(MAX), ModTitle nvarchar(MAX), LessId int, LessTitle nvarchar(MAX), LevId int, LevTitle nvarchar(MAX), CrsId int, CrsTitle nvarchar(MAX)")]
  public static IEnumerable lmsql_TocFlat(int companyId) {
    return TocFlat.fromResources();
  }

  public static void lmsql_TocFlat_FillRow(object obj, out SqlString ProdAndUrl, out SqlString ModTitle, out SqlInt32 LessId, out SqlString LessTitle, out SqlInt32 LevId, out SqlString LevTitle, out SqlInt32 CrsId, out SqlString CrsTitle) {
    TocFlat src = obj as TocFlat;
    ProdAndUrl = src.ProdAndUrl; ModTitle = src.ModTitle; LessId = src.LessId; LessTitle = src.LessTitle; LevId = src.LevId; LevTitle = src.LevTitle; CrsId = src.CrsId; CrsTitle = src.CrsTitle;
  }

  public IEnumerable _lmsql_CompanyDepartmentCrsUser() {
    var deps = doFlat();
    var crsUsers = _lmsql_CourseUser().GroupBy(u => u.DepartmentId).ToDictionary(g => (long)g.Key, g => g.ToArray());
    var dump = "; departments = " + crsUsers.Select(g => g.Key.ToString()).Distinct().DefaultIfEmpty().Aggregate((r, i) => r + "," + i);

    var modules = readCourseData().GroupBy(cd => cd.CourseUser_Id).ToDictionary(g => (long)g.Key, g => g.ToArray());
    dump += "; courseUserIds = " + modules.Select(g => g.Key.ToString()).Distinct().DefaultIfEmpty().Aggregate((r, i) => r + "," + i);

    List<DepartmentFlat> res = new List<DepartmentFlat>();
    foreach (var dep in deps) {
      CourseUser[] crsUser;
      long oldId = dep.Items[DepartmentFlat.maxDeep - 1].Id;
      if (!crsUsers.TryGetValue(dep.Items[DepartmentFlat.maxDeep - 1].Id, out crsUser)) continue;
      dump += "; DepartmentId=" + dep.Items[DepartmentFlat.maxDeep - 1].Id.ToString();
      foreach (var user_courses in crsUser.GroupBy(u => u.User_Id)) {
        var u = user_courses.First();
        dump += "; u.User_Id=" + u.User_Id;
        foreach (var user_course in user_courses) {
          dump += "; user_course.CourseUser_Id=" + user_course.CourseUser_Id;
          Module[] user_course_modules;
          if (!modules.TryGetValue(user_course.CourseUser_Id, out user_course_modules)) continue;
          foreach (var lev in user_course_modules.GroupBy(m => m.LevId)) {
            //dump += "; Mod=" + mod.ProdAndUrl;
            foreach (var mod in lev)
              res.Add(Clone(dep, oldId, u.User_Id, u.FirstName + " " + u.LastName + " (" + u.EMail + ")", lev.Key * 100000 + user_course.CourseUser_Id, lev.First().LevTitle, mod.ModId, mod.ModTitle));
          }
        }
      }
    }
    //throw new Exception(dump);
    return res;
  }



  //******* COURSE USER DEPARTMENT ******************************************************************
  [SqlFunction(DataAccess = DataAccessKind.Read, FillRowMethodName = "lmsql_CompanyDepartment_FillRow",
  TableDefinition = "Id_0 bigint, Title_0 nvarchar(MAX), Id_1 int, Title_1 nvarchar(MAX), Id_2 int, Title_2 nvarchar(MAX), Id_3 int, Title_3 nvarchar(MAX), Id_4 int, Title_4 nvarchar(MAX), Id_5 int, Title_5 nvarchar(MAX), Id_6 int, Title_6 nvarchar(MAX)")]
  public static IEnumerable lmsql_CompanyDepartmentCrsUser(int companyId) {
    return new StoredProcedures(companyId)._lmsql_CompanyDepartmentCrsUser();
  }

  static DepartmentFlat Clone(DepartmentFlat src, long oldId, long userId, string userTitle, int levId, string levTitle, long modId, string modTitle) {
    var its = new List<DepItem>();
    var st = 0;
    foreach (var it in src.Items) {
      switch (st) {
        case 0: its.Add(new DepItem() { Id = -it.Id, Title = it.Title }); if (it.Id == oldId) st = 1; break;
        //case 1: its.Add(new DepItem() { Id = -it.Id, Title = it.Title }); st = 2; 
        case 1: its.Add(new DepItem() { Id = userId, Title = userTitle }); st = 2; break;
        case 2: its.Add(new DepItem() { Id = levId, Title = levTitle }); st = 3; break;
        case 3: its.Add(new DepItem() { Id = modId, Title = modTitle }); st = 4; break;
        case 4: its.Add(new DepItem() { Id = modId, Title = null }); break;
      }
    }
    return new DepartmentFlat() { Items = its.ToArray() };
  }

  //******* DEPARTMENT ******************************************************************
  //Flat tree z Department Node
  public struct DepItem {
    public long Id;
    public string Title;
  }
  public partial class DepartmentFlat {
    public DepItem[] Items = new DepItem[maxDeep];
    public const int maxDeep = 7;
    public void setLevel(int level, int id, string title) { Items[level].Id = id; Items[level].Title = title; }

    public static List<DepartmentFlat> doFlat(IEnumerable<CompanyDepartment> departments) {
      List<DepartmentFlat> result = new List<DepartmentFlat>();
      foreach (var grp in departments.GroupBy(d => d.CompanyId)) {
        var tree = dbToTree(grp.ToArray());
        var path = new Department[DepartmentFlat.maxDeep];
        ForEach(tree, 0, path, (pth, lev) => {
          DepartmentFlat res = new DepartmentFlat();
          for (int i = 0; i <= lev; i++) res.setLevel(i, pth[i].Id, pth[i].Title);
          var fakeId = pth[lev].Id;
          for (int i = lev + 1; i < DepartmentFlat.maxDeep; i++) res.setLevel(i, fakeId, null);
          result.Add(res);
        });
      }
      return result;
    }
    static void ForEach(Department self, int level, Department[] parents, Action<Department[], int> act) {
      Department[] newParents = (Department[])parents.Clone();
      newParents[level] = self;
      act(newParents, level);
      if (self.Items != null)
        foreach (var ch in self.Items) ForEach(ch, level + 1, newParents, act);
    }
    static Department dbToTree(CompanyDepartment[] allDb, CompanyDepartment actDb = null) {
      if (allDb == null || allDb.Length == 0) return null;
      if (actDb == null) actDb = allDb.First(d => d.ParentId == null);
      return new Department() {
        Id = actDb.Id,
        Title = actDb.Title,
        Items = allDb.Where(d => d.ParentId == actDb.Id).Select(d => dbToTree(allDb, d)).ToArray()
      };
    }
  }

  List<DepartmentFlat> doFlat() {
    using (SqlConnection conn = new SqlConnection(connString)) {
      conn.Open();
      SqlCommand cmd = new SqlCommand("SELECT * FROM CompanyDepartments WHERE CompanyId=" + companyId.ToString(), conn);
      using (var rdr = cmd.ExecuteReader())
        return DepartmentFlat.doFlat(rdr.Cast<IDataRecord>().Select(row => new CompanyDepartment() {
          Id = row.GetInt32(0),
          Title = row.GetString(1),
          CompanyId = row.GetInt32(2),
          ParentId = row.IsDBNull(3) ? (int?)null : row.GetInt32(3),
        }));
    }
  }

  //Tree node z CompanyDepartment
  public class Department {
    public int Id;
    public string Title;
    public Department[] Items;
    public bool isNew;
    public CompanyDepartment db;
  }

  //Prvek CompanyDepartments database
  public class CompanyDepartment {
    public int Id;
    public string Title;
    public int CompanyId;
    public int? ParentId;
  }

  [SqlProcedure]
  public static void lmsql_Debug() {
    SqlPipe p = SqlContext.Pipe;
    p.Send("Hallo lmsql_Debug");
  }

  public IEnumerable _lmsql_CompanyDepartment() {
    return doFlat();
  }
  //http://msdn.microsoft.com/en-us/library/microsoft.sqlserver.server.sqldatarecord.aspx
  //http://msdn.microsoft.com/en-us/library/ms131103(v=sql.90).aspx
  [SqlFunction(DataAccess = DataAccessKind.Read, FillRowMethodName = "lmsql_CompanyDepartment_FillRow",
    TableDefinition = "Id_0 bigint, Title_0 nvarchar(MAX), Id_1 int, Title_1 nvarchar(MAX), Id_2 int, Title_2 nvarchar(MAX), Id_3 int, Title_3 nvarchar(MAX), Id_4 int, Title_4 nvarchar(MAX), Id_5 int, Title_5 nvarchar(MAX), Id_6 int, Title_6 nvarchar(MAX)")]
  public static IEnumerable lmsql_CompanyDepartment(int companyId) {
    return new StoredProcedures(companyId)._lmsql_CompanyDepartment();
  }

  public static void lmsql_CompanyDepartment_FillRow(object obj, out SqlInt64 Id_0, out SqlString Title_0, out SqlInt32 Id_1, out SqlString Title_1, out SqlInt32 Id_2, out SqlString Title_2, out SqlInt32 Id_3, out SqlString Title_3, out SqlInt32 Id_4, out SqlString Title_4, out SqlInt32 Id_5, out SqlString Title_5, out SqlInt32 Id_6, out SqlString Title_6) {
    var items = (obj as DepartmentFlat).Items;
    Id_0 = items[6].Id; Title_0 = items[6].Title;
    Id_1 = (int)items[5].Id; Title_1 = items[5].Title;
    Id_2 = (int)items[4].Id; Title_2 = items[4].Title;
    Id_3 = (int)items[3].Id; Title_3 = items[3].Title;
    Id_4 = (int)items[2].Id; Title_4 = items[2].Title;
    Id_5 = (int)items[1].Id; Title_5 = items[1].Title;
    Id_6 = (int)items[0].Id; Title_6 = items[0].Title;
  }

}
