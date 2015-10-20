using LMComLib;
using LMNetLib;
using Newtonsoft.Json;
using System;
using System.Configuration;
using System.Data.Common;
using System.Data.Entity;
using System.Data.Entity.Validation;
using System.Data.SqlClient;
using System.IO;
using System.IO.Compression;
using System.Linq;
using System.Reflection;
using System.Text;
using System.Text.RegularExpressions;
using System.Web;
using System.Web.Hosting;
using System.Web.Script.Serialization;
using System.Xml.Linq;

namespace LMComLib {

  public class CmdEMail {
    public string From;
    public string To;
    public string Cc;
    public string Subject;
    public string Html;
    public bool isForgotPassword;
    public bool isAtt;
    public string attFile;
    public string attContent;
    public string attContentType;
    public string emailId;
  }

  public static class LMZipArchive {
    public static void addFileToZip(ZipArchive zip, Action<Stream> copyTo, string destFn, DateTime? date = null) {
      ZipArchiveEntry readMeEntry = zip.CreateEntry(destFn);
      readMeEntry.LastWriteTime = date ?? DateTime.UtcNow;
      using (var str = readMeEntry.Open())
        copyTo(str);
    }
    public static void addFileToZip(ZipArchive zip, Stream data, string destFn, DateTime? date = null) {
      addFileToZip(zip, str => data.CopyTo(str), destFn, date);
    }
    public static void addFileToZip(ZipArchive zip, string fn, string destFn, DateTime? date = null) {
      using (var fs = File.OpenRead(fn))
        addFileToZip(zip, fs, destFn, date ?? File.GetLastWriteTime(fn));
    }
    public static void addFileToZip(ZipArchive zip, byte[] data, string destFn, DateTime? date = null) {
      addFileToZip(zip, str => str.Write(data, 0, data.Length), destFn, date);
    }
  }

  public static class Logger {

    static Logger() {
      Handlers.CmdService.registerCommand<scorm.Cmd_Logger, bool>(par => {
        SendLog(par);
        return new RpcResponse();
      });
    }

    public static void Error(string msg) {
      LogLow(LogLowId(true), "ERROR " + msg, true);
    }
    public static void Error(Exception exp) {
      Error(LowUtils.ExceptionToString(exp, true));
    }

    public static void LogLow(Func<string> getMsg, bool force = false) {
      LogLow(LogLowId(force), getMsg());
    }

    public static void Log(string msg, bool force = false) {
      LogLow(LogLowId(force), msg);
    }
    public static void Log(string mask, params object[] pars) {
      Log(string.Format(mask, pars));
    }
    public static void SendLog(scorm.Cmd_Logger logCmd) {
      var fn = Machines.appData + string.Format(@"logs\{0}.log", logCmd.id);
      if (File.Exists(fn)) {
        logCmd.data += "\r\n\r\n************* SERVER LOG:\r\n\r\n" + File.ReadAllText(fn);
        File.Delete(fn);
      }
      Emailer.SendEMail(ConfigurationManager.AppSettings["Logger.emails"] ?? @"support@langmaster.com", "logger@langmaster.com", "Message from logger", "See attachment", new Emailer.Attachment("LogFile", Encoding.UTF8.GetBytes(logCmd.data), "text/plain"));
      //SendLog(logCmd);
    }
    public static void SendLog(HttpContext context) {
      var logData = RewRpcLib.getPostData(context);
      var logCmd = new JavaScriptSerializer().Deserialize<scorm.Cmd_Logger>(logData);
      SendLog(logCmd);
    }

    //public static bool isDebug(HttpContext ctx) {
    //  return ctx.Request.UrlReferrer!=null && string.Compare(ConfigurationManager.AppSettings["JSCramblerDebug"], ctx.Request.UrlReferrer.Host + ctx.Request.UrlReferrer.LocalPath, true) == 0; 
    //}
    public static bool isDebug(HttpContext ctx) {
      var debug = ConfigurationManager.AppSettings["JSCramblerDebug"];
      if (string.IsNullOrEmpty(debug)) return false;
      if (ctx.Request.UrlReferrer == null) return true;
      return ctx.Request.UrlReferrer != null && (string.Compare(debug, ctx.Request.UrlReferrer.Host + ctx.Request.UrlReferrer.LocalPath, true) == 0 || ctx.Request.UrlReferrer.LocalPath.ToLower().IndexOf("statistics.aspx") > 0);
    }


    public static string LogLowId(bool force = false) {
      var ctx = HttpContext.Current; if (ctx == null) return null;
      string logIdStr;
      try {
        logIdStr = ctx.Request.Headers["LoggerLogId"];
        if (string.IsNullOrEmpty(logIdStr)) logIdStr = ctx.Request["LoggerLogId"];
        if (string.IsNullOrEmpty(logIdStr) && isDebug(ctx)) force = true;
      } catch { logIdStr = null; }
      if (string.IsNullOrEmpty(logIdStr) && force) {
        try { logIdStr = ctx.Request.UrlReferrer==null ? null : ctx.Request.UrlReferrer.Host; } catch { }
      }
      if (string.IsNullOrEmpty(logIdStr)) return null;
      return logIdStr;
    }

    static void LogLow(string logIdStr, string msg, bool forceHeader = false) {
      if (logIdStr == null) return;
      else lock (typeof(Logger)) {
          var fn = Machines.appData + string.Format(@"logs\{0}.log", logIdStr);
          LowUtils.AdjustFileDir(fn);
          using (StreamWriter wr = new StreamWriter(fn, true)) {
            if (forceHeader || !File.Exists(fn)) {
              StringBuilder sb = new StringBuilder();
              if (forceHeader) {
                sb.AppendLine("\r\n");
                sb.AppendLine("=================================================");
                sb.AppendLine("=================================================");
              }
              try {
                var req = HttpContext.Current.Request;
                sb.Append("START, url="); sb.AppendLine(req.Url.AbsoluteUri);
                if (req.UrlReferrer != null) { sb.Append("referer="); sb.AppendLine(req.UrlReferrer.AbsoluteUri); }
                sb.Append("agent="); sb.AppendLine(req.UserAgent);
                var cook = LMCookie.DeserializeJSCookie(); if (cook != null) { sb.Append("cookie="); sb.AppendLine(JsonConvert.SerializeObject(cook)); }
                sb.AppendLine(null);
              } catch { }

              //msg = sb.ToString() + msg;
              wr.WriteLine(">>>" + DateTime.UtcNow.ToString() + ": " + sb.ToString());
            }
            //wr.WriteLine(">>>" + DateTime.UtcNow.ToString() + ": " + msg);
            wr.WriteLine(msg);
          }
        }
    }

  }

}

namespace NewModel {
  public static class Lib {

    public static void downloadResponse(byte[] data, string contentType, string fileName) {
      var resp = HttpContext.Current.Response;
      resp.Clear();
      resp.ContentType = contentType;
      resp.AddHeader("Content-Disposition", "attachment; filename="+ fileName);
      resp.AddHeader("Content-Length", data.Length.ToString());
      using (var str = resp.OutputStream)
        str.Write(data, 0, data.Length);
      resp.Flush();
      resp.End();
    }

    public static void OnAppStart(HttpApplication app) {
      //StartWatchConfig(app);
      //z schools\eacourses\*.xml udelej schools\eacourses\courses.json
      //var all = Directory.EnumerateFiles(appRootDir, "*.xml").Where(f => f.IndexOf("courses.xml") + f.IndexOf("dicts.xml") < 0).Select(fn => XmlUtils.FileToObject<schools.root>(fn)).ToArray();
      //products = all.Select(r => r.url).ToArray();
      //foreach (var c in all) { c.courses = null; c.grammar = null; }
      //File.WriteAllText(appRootDir + @"\courses.json", CoursesSitemap.json(all));
    }
    public static string[] products;
    static string appRootDir = HostingEnvironment.MapPath("~/Schools/EACourses");

    static void StartWatchConfig(HttpApplication app) {
      FileSystemWatcher ConfigWatcher = new FileSystemWatcher(appRootDir, "*.xml");
      ConfigWatcher.Changed += (s, a) => System.Web.HttpRuntime.UnloadAppDomain();
      app.Application.Add("ConfigWatcher", ConfigWatcher);
      ConfigWatcher.EnableRaisingEvents = true;
    }

    //public static Packager.WebBatch config {
    //  get {
    //    if (_config == null) {
    //      var fn = HostingEnvironment.MapPath("~/config.bin");
    //      _config = File.Exists(fn) ? XmlUtils.BytesToObject<Packager.WebBatch>(LowUtils.Decrypt(File.ReadAllBytes(fn))) : new Packager.WebBatch();
    //    }
    //    return _config;
    //  }
    //} static Packager.WebBatch _config;

  }
}

namespace NewData {

  //http://msdn.microsoft.com/en-us/data/ee712907
  //http://visualstudiogallery.msdn.microsoft.com/72a60b14-1581-4b9b-89f2-846072eff19d

  //public static class SSAS {

  //  public static void includeClrExtensionToDB(string servId) {
  //    string fn; string sql;
  //    using (var rdr = getInfo("WebCourseStatistics.sql", out fn)) sql = rdr.ReadToEnd();
  //    if (string.IsNullOrEmpty(sql)) return;
  //    var cb = getConnectionStringInfo(servId);
  //    sql = string.Format(sql, cb.UserID, servId == "lm-virtual-1_run" ? "NewLMComServices" : "NewLMCom", BitConverter.ToString(File.ReadAllBytes(fn)).Replace("-", ""));
  //    //File.WriteAllText(@"d:\temp\pom.sql", sql);
  //    Microsoft.SqlServer.Management.Common.ServerConnection connection = new Microsoft.SqlServer.Management.Common.ServerConnection(cb.DataSource, cb.UserID, cb.Password);
  //    Microsoft.SqlServer.Management.Smo.Server serv = new Microsoft.SqlServer.Management.Smo.Server(connection);
  //    serv.ConnectionContext.ExecuteNonQuery(sql);
  //    serv.ConnectionContext.ExecuteNonQuery("go");
  //  }

  //  public static void refreshSASSDeploymentBatchFile() {
  //    var selfDir = Path.GetDirectoryName(Assembly.GetExecutingAssembly().Location);
  //    var xmlaFn = selfDir.ToLower().Replace(@"\bin\debug", null) + "\\NewLMComStat.xmla";
  //    OtherCore.LaunchProcess(
  //      @"c:\Program Files (x86)\Microsoft SQL Server\110\Tools\Binn\ManagementStudio\Microsoft.AnalysisServices.Deployment.exe",
  //      @"D:\LMCom\rew\NewLMComStat\bin\NewLMComStat.asdatabase /s:d:\temp\pom.log /o:" + xmlaFn, true);
  //    //d:\LMCom\rew\LMDatabaseExtension\NewLMComStat.xmla
  //  }

  //  public static void buildCompanyCubes(string servId) {
  //    string fn; string xmlaStr;
  //    using (var rdr = getInfo("NewLMComStat.xmla", out fn)) xmlaStr = rdr.ReadToEnd();
  //    if (string.IsNullOrEmpty(xmlaStr)) return;
  //    var db = new NewData.Container(getConnectionString(servId));
  //    var comps = db.Companies.Where(c => c.CompanyUsers.SelectMany(cu => cu.CourseUsers).SelectMany(crsu => crsu.CourseDatas.Where(cd => cd.ShortData != null)).Any()).Select(c => c.Id).ToArray();
  //    var cb = getConnectionStringInfo(servId);
  //    foreach (int companyId in comps) {
  //      XElement batch = XElement.Parse(xmlaStr);
  //      //user/password
  //      var provider = ConfigurationManager.AppSettings[Machines.machine + ".SSAS.Provider"];
  //      var conn = batch.Descendants(batchNS + "ConnectionString").Single();
  //      conn.Value = string.Format("Provider={4};Data Source={0};Initial Catalog={1};User ID={2};Password={3};Connect Timeout=300;",
  //        cb.DataSource, cb.InitialCatalog, cb.UserID, cb.Password, provider ?? "SQLNCLI11.1");
  //      //conn.Value.Replace("Password=;User ID=;", string.Format("User ID={0};Password={1};Connect Timeout=300;", cb.UserID, cb.Password));
  //      //Adjust lib
  //      string compIdStr = companyId.ToString();
  //      var dbName = string.Format("{0}_{1}", cb.InitialCatalog, compIdStr);
  //      foreach (var attr in batch.Descendants(xsNS + "element").Where(e => e.Attributes().Any(a => a.Name == mspropNS + "TableType" && a.Value == "View")).Select(el => el.Attribute(mspropNS + "QueryDefinition")))
  //        attr.Value = regCompanyId.Replace(attr.Value, "(" + compIdStr + ")");
  //      //DBName
  //      foreach (var txt in batch.DescendantNodes().OfType<XText>().Where(nd => nd != null && nd.Value == "NewLMComStat").ToArray()) txt.Value = dbName;

  //      var xmlaCmd = batch.ToString();

  //      //*********** DEPLOY XMLA
  //      //http://msdn.microsoft.com/en-us/magazine/cc135979.aspx
  //      //using (new Impersonator(
  //      //  ConfigurationManager.AppSettings[Machines.machine + ".SSAS.email"],
  //      //  ConfigurationManager.AppSettings[Machines.machine + ".SSAS.Domain"],
  //      //  ConfigurationManager.AppSettings[Machines.machine + ".SSAS.Password"])) {
  //      //  using (Microsoft.AnalysisServices.Server server = new Microsoft.AnalysisServices.Server()) {
  //      //    server.Connect(@"RowType Source=" + ConfigurationManager.AppSettings[Machines.machine + ".SSAS.Server"] + ";Provider=msolap");
  //      //    if (server.Databases.ContainsName(dbName)) server.Databases.GetByName(dbName).Drop();
  //      //    Microsoft.AnalysisServices.XmlaResultCollection res2; string err;
  //      //    //File.WriteAllText(@"d:\temp\pom.xmla", xmlaCmd);
  //      //    res2 = server.Execute(xmlaCmd);
  //      //    err = res2.Cast<Microsoft.AnalysisServices.XmlaResult>().SelectMany(r => r.Messages.Cast<Microsoft.AnalysisServices.XmlaMessage>()).Select(m => m.Description).DefaultIfEmpty().Aggregate((r, i) => r + "\r\n" + i);
  //      //    if (err != null) throw new Exception(err);
  //      //  }
  //      //}
  //    }
  //  }
  //  static XNamespace batchNS = "http://schemas.microsoft.com/analysisservices/2003/engine";
  //  static XNamespace xsNS = "http://www.w3.org/2001/XMLSchema";
  //  static XNamespace mspropNS = "urn:schemas-microsoft-com:xml-msprop";
  //  static Regex regCompanyId = new Regex(@"\(\d+\)");

  //  static StreamReader getInfo(string resPath, out string fn) {
  //    fn = null;
  //    var ass = Assembly.GetEntryAssembly();
  //    fn = AppDomain.CurrentDomain.BaseDirectory + "LMDatabaseExtension.dll"; // HttpContext.Current.Server.MapPath("~/bin/LMDatabaseExtension.dll");
  //    return new StreamReader(ass.GetManifestResourceStream(ass.GetName().Name + "." + resPath));
  //  }

  //  public static string getConnectionString(string serverId) {
  //    return ConfigurationManager.ConnectionStrings[serverId == "" ? "container" : "container_" + serverId].ConnectionString;
  //  }
  //  public static SqlConnectionStringBuilder getConnectionStringInfo(string serverId) {
  //    return new SqlConnectionStringBuilder(getConnectionString(serverId));
  //  }
  //}

  public partial class Container {

    public Container() : base(cs(), true) { }
    public Container(string connStr) : base(new SqlConnection(connStr), true) { }

    static DbConnection cs() {
      var conn = connStr();
      if (conn.ProviderName == "System.Data.SqlClient") return new SqlConnection(conn.ConnectionString);
      //if (conn.ProviderName.StartsWith("System.Data.SqlServerCe")) return new SqlCeConnection(conn.ConnectionString);
      throw new Exception(@"d:\LMCom\rew\NewLMComModel\Runtime\Lib.cs.Container.cs: unknown ProviderName - " + conn.ProviderName);
    }
    public static ConnectionStringSettings connStr() {
      string connName = Machines.isFE5() ? "Container_FE5" : "Container";
      var res = ConfigurationManager.ConnectionStrings[connName] ?? ConfigurationManager.ConnectionStrings["Container"];
      if (res == null) res = new ConnectionStringSettings {
        ConnectionString = @"Data Source=localhost\SQLEXPRESS;Initial Catalog=NewLMCom;Integrated Security=False;User ID=lmcomdatatest;Password=lmcomdatatest;",
        ProviderName = "System.Data.SqlClient"
      }; // throw new Exception("Cannot find connection string: " + connName);
      return res;
    }

  }

  public static class Lib {

    public static void SaveChanges(Container db) {
      try {
        db.SaveChanges();
      } catch (DbEntityValidationException dbEx) {
        StringBuilder sb = new StringBuilder();
        foreach (var validationErrors in dbEx.EntityValidationErrors) {
          foreach (var validationError in validationErrors.ValidationErrors) {
            sb.AppendFormat("Property: {0} Error: {1}", validationError.PropertyName, validationError.ErrorMessage);
            sb.AppendLine();
          }
        }
        throw new Exception(sb.ToString(), dbEx);
      }
    }

    public static Container CreateContext() {
      init();
      return new Container();
    }
    public const int publicCommpanyId = 1;

    static void init() {
      if (initialized) return;
      initialized = true;
      Logger.Log(@"Lib.NewData.Container init: Start");
      Database.SetInitializer<Container>(new NewData.Migrations.initializer());
      using (var context = new Container()) context.Database.Initialize(false);
      Logger.Log(@"Lib.NewData.Container init: End");
    } static bool initialized;

    public static bool adjustCourseUser(Container db, Int64 lmcomUserId, int companyId, string productId, out CourseUser crsUser, out CompanyUser compUser) {
      DateTime startDate = DateTime.UtcNow; crsUser = null;

      //adjust CompanyUser
      compUser = db.CompanyUsers.FirstOrDefault(u => u.CompanyId == companyId && u.UserId == lmcomUserId);
      if (compUser == null) {
        var allDeps = db.CompanyDepartments.Where(d => d.CompanyId == companyId).Select(cd => cd.Id).ToArray();
        db.CompanyUsers.Add(compUser = new CompanyUser() {
          UserId = lmcomUserId,
          CompanyId = companyId,
          Created = DateTime.UtcNow,
          DepartmentId = allDeps.Length==1 ? (int?) allDeps[0] : null,
        });
      } else
        crsUser = compUser.CourseUsers.FirstOrDefault(cu => cu.ProductId == productId);

      //adjust CourseUser
      if (crsUser == null) {
        db.CourseUsers.Add(crsUser = new CourseUser() {
          CompanyUser = compUser,
          Created = DateTime.UtcNow,
          ProductId = productId,
        });
        return false;
      }
      return true;
    }
  }
}

