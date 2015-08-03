using LMNetLib;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Net;
using System.Runtime.Serialization.Json;
using System.Text;
using System.Web;
using System.Web.Script.Serialization;

namespace LMComLib {

  public static class JSON {

    public static string codeJSON(params string[] parts) {
      StringBuilder sb = new StringBuilder(); sb.Append('{');
      for (int i=0; i<parts.Length; i+=2) {
        sb.Append(parts[i]); sb.Append(":"); sb.Append(parts[i + 1]); sb.Append(",");
      }
      if (sb.Length > 1) sb.Length = sb.Length - 1;
      sb.Append('}');
      return sb.ToString();
    }

    public static string toJavaString(string s) {
      return s == null ? "" : s.Replace("\\", "\\\\").Replace("'", "\\'");
    }

    public static string ObjectToJSON(object obj) {
      if (obj == null) return null;
      JavaScriptSerializer serializer = new JavaScriptSerializer();
      return serializer.Serialize(obj);
    }

    public static T JSONToObject<T>(string str) where T:class {
      if (string.IsNullOrEmpty(str)) return null;
      JavaScriptSerializer serializer = new JavaScriptSerializer();
      return serializer.Deserialize<T>(str);
    }

    public static JSONRPC_MethodResult JSONRPC_requestLow1(string url, string methodName, Dictionary<string, object> pars) {
      string body = ObjectToJSON(new JSONRPC_MethodCall(methodName, pars));
      Logging.Trace(TraceLevel.Info, TraceCategory.JSONRpc, "JSONRPC_requestLow1, request url={0}, body={1}", url, body);
      //Web request
      HttpWebRequest req = WebRequest.Create(url) as HttpWebRequest;
      req.Method = "POST";
      req.ContentType = "application/x-www-form-urlencoded";
      byte[] bodyBytes = Encoding.UTF8.GetBytes(body);
      req.ContentLength = bodyBytes.Length;
      using (Stream bodyStr = req.GetRequestStream())
        bodyStr.Write(bodyBytes, 0, bodyBytes.Length);
      //req.Headers.Add(string.Format("Accept-Language:{0}", cfg.Lang));
      //req.Headers.Add(cfg.toHeader());
      using (HttpWebResponse resp = req.GetResponse() as HttpWebResponse) {
        Stream s = resp.GetResponseStream();

        string response;
        using (StreamReader rdr = new StreamReader(s, Encoding.UTF8))
          response = rdr.ReadToEnd();
        Logging.Trace(TraceLevel.Info, TraceCategory.JSONRpc, "JSONRPC_requestLow1, response={0}", response);
        //JSON to object
        return (JSONRPC_MethodResult)JSONToObject<JSONRPC_MethodResult>(response);
      }
    }

    public static object JSONRPC_requestLow2(JSONRPC_MethodResult res) {
      //Error?
      if (res.error != 0)
        throw new JSONRPCException(res.error, res.errorText);
      //OK
      return res.result;
    }

    public static object JSONRPC_request(string url, string methodName, Dictionary<string, object> pars) {
      return JSONRPC_requestLow2(JSONRPC_requestLow1(url, methodName, pars));
    }

    public static object JSONRPC_request(Domains site, string methodName, Dictionary<string, object> pars) {
      string url = SiteInfos.RPC_url(site, methodName);
      return JSONRPC_request(url, methodName, pars);
    }

    public static void onJSONRPCRequest(HttpContext ctx, JSONRPCRequestEvent onRequest) {
      string errorName = "unknown";
      JSONRPC_MethodResult result = new JSONRPC_MethodResult();
      string resStr = null;
      string reqTxt = null;
      try {
        Stream str = ctx.Request.InputStream;
        if (str.Length == 0) return; //throw new Exception("Blank JSON request!");
        byte[] data = new byte[str.Length];
        str.Read(data, 0, (int)str.Length);
        reqTxt = Encoding.UTF8.GetString(data);
        Logging.Trace(TraceLevel.Info, TraceCategory.JSONRpc, "onJSONRPCRequest request={0}", reqTxt);
        JSONRPC_MethodCall method = (JSONRPC_MethodCall)JSONToObject<JSONRPC_MethodCall>(reqTxt);
        errorName = method.name;
        result.result = onRequest(ctx, method.name, new JSONRPC_NameValues(method.pars));
      } catch (Exception exp) {
        result.error = exp is JSONRPCException ? ((JSONRPCException)exp).code : -101;
        result.errorText = string.Format("*** Error in JSON Request processing: name={0}, error={1}, regTxt={2}, trace={3}", errorName, exp.Message, reqTxt, LowUtils.ExceptionToString(exp,true));
        Logging.Trace(TraceLevel.Error, TraceCategory.JSONRpc, "onJSONRPCRequest 1" + result.errorText);
      }
      try {
        resStr = ObjectToJSON(result);
      } catch (Exception exp) {
        resStr = string.Format("OtherLib.ObjectToJSON", exp.Message);
        Logging.Trace(TraceLevel.Error, TraceCategory.JSONRpc, "onJSONRPCRequest 2, Error=" + exp.Message);
      }
      ctx.Response.Clear();
      Logging.Trace(TraceLevel.Info, TraceCategory.JSONRpc, "onJSONRPCRequest response={0}", resStr);
      ctx.Response.Write(resStr);
      ctx.Response.Flush();
      ctx.Response.End();
    }
  }

  public delegate object JSONRPCRequestEvent(HttpContext ctx, string name, JSONRPC_NameValues pars);

  /// <summary>
  /// Umisteni PageStatus kontrolky
  /// </summary>
  public enum PageStatusPlace {
    Home, //Radek na module home
    Result, //Radek na vysledkove strance
    Evaluated, //Nahore na strance, po vyhodnoceni
    Navig, //Nad teplomerem
    //Navig_Bottom, //Teplomer
  }

  /// <summary>
  /// Priznak typu stranky
  /// </summary>
  public enum PageStatusType {
    Exercise, //stranka se cvicenim
    Home, //home
    Result, //vysledkova stranka
  }

  //****************** JSON OBJECTS *************************

  //JSON RPC
  public class JSONRPCException : Exception {
    public JSONRPCException(int code, string text)
      : base(string.Format("Error {0}: {1}", code, text)) {
      this.code = code;
    }
    public int code;
  }
  /// <summary>
  /// Vstup:
  /// {name:'jmeno_funkce'; pars:[{name:'int_par';value:1},{name:'bool_par';value:true},{name:'string_par';value:'value'}]}
  /// Vystup:
  /// {error:100;errorText:'text';result:[{{name:'int_par';value:1},{name:'bool_par';value:true},{name:'string_par';value:'value'}}]}
  /// </summary>
  public class JSONRPC_MethodCall {
    public JSONRPC_MethodCall()
      : base() {
    }
    public JSONRPC_MethodCall(string name, Dictionary<string, object> pars)
      : base() {
      this.name = name;
      this.pars = pars;
    }

    public string name;
    public Dictionary<string, object> pars;
  }

  public class JSONRPC_MethodResult {
    public int error;
    public string errorText;
    //public JSONRPC_NameValue[] result;
    public object result;
  }

  //vyhrazena jmena pro pars: error, errorText (v pripade chyby)
  public class JSONRPC_NameValues {
    public Dictionary<string, object> Pars;
    public static Dictionary<string, object> createDict(params object[] pars) {
      Dictionary<string, object> res = new Dictionary<string, object>();
      for (int i = 1; i < pars.Length; i += 2)
        res.Add((string)pars[i - 1], pars[i]);
      return res;
    }
    public static Dictionary<string, object> createDictString(Dictionary<string, string> pars) {
      Dictionary<string, object> res = new Dictionary<string, object>();
      foreach (KeyValuePair<string, string> kv in pars)
        res.Add(kv.Key, kv.Value);
      return res;
    }
    public JSONRPC_NameValues(Dictionary<string, object> pars) {
      Pars = pars;
    }
    /*public JSONRPC_NameValues(object[] pars)
    {
      Pars = new Dictionary<string, object>();
      foreach (Dictionary<string, object> obj in (object[])pars)
        Pars.Add((string)obj["name"], obj["value"]);
    }*/
    object checkPar(string name) {
      object res;
      if (!Pars.TryGetValue(name, out res))
        throw new Exception(string.Format("RPC procedure par <{0}> does not exist", name));
      return res;
    }
    public Int64 asInt(string name) {
      object par = checkPar(name);
      if (par == null) return 0;
      try { return Convert.ToInt64(par); } catch { throw new Exception(string.Format("RPC procedure par {0}={1} is not int", name, par)); }
    }
    public bool asBool(string name) {
      object par = checkPar(name);
      if (par == null) return false;
      try { return Convert.ToBoolean(par); } catch { throw new Exception(string.Format("RPC procedure par {0}={1} is not bool", name, par)); }
    }
    public string asString(string name) {
      object par = checkPar(name);
      if (par == null) return null;
      try { return Convert.ToString(par); } catch { throw new Exception(string.Format("RPC procedure par {0}={1} is not string", name, par)); }
    }
    public double asDouble(string name) {
      object par = checkPar(name);
      if (par == null) return 0;
      try { return Convert.ToDouble(par); } catch { throw new Exception(string.Format("RPC procedure par {0}={1} is not double", name, par)); }
    }
    public Dictionary<string, object> asObject(string name) {
      object par = checkPar(name);
      if (par == null) return null;
      try { return (Dictionary<string, object>)par; } catch { throw new Exception(string.Format("RPC procedure par {0} is not Dictionary<string,object>", name)); }
    }
  }

  /*public class JSONRPC_NameValue
  {
    public JSONRPC_NameValue()
      : base()
    {
    }
    public JSONRPC_NameValue(string name, object value)
      : this()
    {
      this.name = name;
      this.value = value;
    }
    public static JSONRPC_NameValue[] resultValue(object value)
    {
      return new JSONRPC_NameValue[] { new JSONRPC_NameValue("result", value) }; 
    }
    public string name;
    public object value;
  }*/

}
