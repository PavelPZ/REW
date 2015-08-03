using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Web;
using System.Web.Script.Serialization;
using NewDataNet35;

namespace LMComLibNet35 {

  public static class Logger {
    public static Action<string, string> onLog = null;
    public static void Log(string msg) {
      if (onLog != null) onLog("ScormEx35", msg);
    }
    public static void Log(string mask, params object[] pars) {
      Log(string.Format(mask, pars));
    }
    public static void SendLog(HttpContext context) {
      var logData = RewRpcLib.getPostData(context);
      var logCmd = new JavaScriptSerializer().Deserialize<scorm.Cmd_Logger>(logData);
      Log("\r\n\r\n\r\n*************** ServerLog:\r\n\r\n" + logCmd.data);
    }
    public static string LogLowId() {
      return "NewDataNet35";
    }
    public static void LogLow(Func<string> getMsg) {
      Log(getMsg());
    }

    public static void Error(Exception exp) { }
    public static void Error(string msg) { Log(msg); }

  }

  public static class Lib {
    public static string connectionString = null;
    public static Container CreateContext() {
      return new Container(connectionString);
    }
    public static string Test() {
      try {
        NewDataNet35.Container db = LMComLibNet35.Lib.CreateContext();
        db.ExecuteCommand("select Id from LANGMasterScorms");
        return "Connection OK";
      } catch (Exception exp) {
        return LowUtils.ExceptionToString(exp, true);
      }
    }
  }
  public static class XExtension {
    public static IEnumerable<T> Return<T>(params T[] pars) {
      return pars;
    }
    public static IEnumerable<T> Create<T>(params T[] pars) {
      foreach (T p in pars) yield return p;
    }
  }
  //public static class XmlUtils {
  //  static public string ObjectToString(object xmlObject) { throw new NotImplementedException(); }
  //  static public object StringToObject(string s, Type type) { throw new NotImplementedException(); }
  //}
  public static class JsonConvert {
    public static string SerializeObject(object value) {
      return new JavaScriptSerializer().Serialize(value);
    }
  }
  public static class LowUtils {
    public static string ExceptionToString(Exception exp, bool incTitle) {
      string lf = "\r\n</br>";
      string res = null;
      while (true) {
        if (exp == null) return res;
        if (incTitle) res += exp.Message; res += lf;
        incTitle = true;
        res += (exp.StackTrace ?? "").Replace("\r", lf); res += lf;
        exp = exp.InnerException;
      }
    }
    public static T EnumParse<T>(string str) {
      return (T)Enum.Parse(typeof(T), str, true);
    }

    public static IEnumerable<T> EnumGetValues<T>() {
      return Enum.GetValues(typeof(T)).Cast<T>();
    }

  }

  namespace scorm {

    public class Cmd {
      public Int64 lmcomId; //ID uzivatele pro LM persistenci 
      public int companyId;
      public int productId;
      public string scormId; //scorm ID uzivatele pro SCORM persistenci
      public Int64 date; //datum vzniku cmd
    }

    public class Cmd_Logger : Cmd {
      public string data;
    }
  }

}