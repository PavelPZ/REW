//http://primates.ximian.com/~jackson/memcached-module.cs
using System;
using System.IO;
using System.Web;
using System.Text;
using System.Web.UI;
using System.Globalization;
using System.Collections.Generic;
using System.Reflection;
using System.Configuration;

using LMNetLib;

namespace LMComLib {

  public class DiskCacheModule : IHttpModule {

    public DiskCacheModule() {
    }

    public void Init(HttpApplication app) {
      app.ResolveRequestCache += new EventHandler(OnResolveRequestCache);
      app.UpdateRequestCache += new EventHandler(OnUpdateRequestCache);
    }

    public void Dispose() {
    }

    static string fileName(string fileId) {
      return HttpRuntime.AppDomainAppPath + @"App_Data\Cache" + fileId.Replace('/', '\\');
    }

    static byte[] loadData(HttpContext ctx, string fn) {
      string data = StringUtils.FileToString(fn);
      data = expandData(ctx, data);
      return Encoding.UTF8.GetBytes(data);
    }

    static bool cachedFileExists(HttpApplication app) {
      lock (typeof(DiskCacheModule)) {
        HttpContext ctx = app.Context;
        string fn = fileName(app.Request.FilePath);
        if (!File.Exists(fn)) return false;
        try {
          app.Response.ClearContent();
          app.Response.BinaryWrite(loadData(ctx, fn));
          app.CompleteRequest();
          return true;
        } catch {
          return false;
        }
      }
    }

    static void storeData(HttpApplication app, byte[] data) {
      lock (typeof(DiskCacheModule)) {
        string fn = fileName(app.Request.FilePath);
        try {
          LowUtils.AdjustFileDir(fn);
          StringUtils.BytesToFile(data, fn);
        } catch (Exception exp) {
          //PZDEBUG if (Machines.isEaLMComBuildEx(app.Context))
            throw new Exception("DiskCacheModule storeData file=" + fn, exp);
        }
      }
    }

    static string context_stream_filter_key = Guid.NewGuid().ToString();

    static string[] urlParts = null;
    static bool ignoreCache(string fn) {
      lock (typeof(DiskCacheModule))
        if (urlParts==null) urlParts = ConfigurationManager.AppSettings["Cache.IgnorePaths"].Split(',');
      foreach (string part in urlParts)
        if (fn.IndexOf(part) >= 0) return true;
      return false;
      //return fn.IndexOf("/rewise-") >= 0 || fn.IndexOf("/licenceagree.htm") >= 0;
    }

    public void OnResolveRequestCache(object o, EventArgs args) {
      HttpApplication app = (HttpApplication)o;
      if (!Machines.doEaCache(app.Context)) return;
      if (ignoreCache(app.Request.FilePath)) return;

      if (!cachedFileExists(app) && !ConfigLow.isLMComCacheDeployment()) {
        CachingFilter filter = new CachingFilter(app.Response.Filter);
        app.Response.Filter = filter;
        app.Context.Items.Add(context_stream_filter_key, filter);
        return;
      }
    }

    public void OnUpdateRequestCache(object o, EventArgs args) {
      HttpApplication app = (HttpApplication)o;
      HttpContext context = app.Context;
      if (!Machines.doEaCache(context)) return;

      // Don't want to cache bad stuff
      if (app.Response.StatusCode != 200) return;
      CachingFilter cf = (CachingFilter)app.Context.Items[context_stream_filter_key];
      if (cf == null) return;
      app.Context.Items.Remove(context_stream_filter_key);
      storeData(app, cf.GetData());
    }

    static Dictionary<string, MethodInfo> callbacks = new Dictionary<string, MethodInfo>();
    static string callCallback(HttpContext context, string methodName) {
      MethodInfo mi;
      lock (callbacks) {
        if (!callbacks.TryGetValue(methodName, out mi)) {
          int idx = methodName.LastIndexOf('.');
          string typeName = methodName.Substring(0, idx);
          string methodId = methodName.Substring(idx+1);
          Assembly[] ass = AppDomain.CurrentDomain.GetAssemblies();
          Type tp = null;
          for (int i = ass.Length - 1; i >= 0; i-- ) {
            tp = ass[i].GetType(typeName); if (tp != null) break;
          }
          if (tp == null) throw new Exception("Cannot find type: " + typeName);
          mi = tp.GetMethod(methodId);
          if (mi == null) throw new Exception("Cannot find method: " + methodName);
          callbacks[methodName] = mi;
        }
      }
      return (string)mi.Invoke(null, new object[] { context });
    }

    public static void onSubstitution(HttpContext context, string methodName) {
      string res = context.Response.Filter is CachingFilter || ConfigLow.isLMComCacheDeployment() ? "[#" + methodName + "#]" : callCallback(context, methodName);
      context.Response.Write(res);
    }

    internal static string expandData(HttpContext context, string data) {
      return LowUtils.FormatEx(data, delegate(string name) {
        return callCallback(context, name);
      });
    }

  }

  /// Keeping this stream as basic as the HttpResponseStream,
  /// so that it does not get abused
  public class CachingFilter : Stream {
    private MemoryStream memory_stream;
    private Stream original_stream;

    public CachingFilter(Stream original_stream) {
      memory_stream = new MemoryStream();
      this.original_stream = original_stream;
    }

    public override bool CanRead {
      get { return false; }
    }

    public override bool CanSeek {
      get { return false; }
    }

    public override bool CanWrite {
      get { return true; }
    }

    public override long Length {
      get { return original_stream.Length; }
    }

    public override long Position {
      get { return original_stream.Position; }
      set { throw new InvalidOperationException(); }
    }

    public override void Flush() {
      string res = Encoding.UTF8.GetString(memory_stream.GetBuffer());
      res = DiskCacheModule.expandData(HttpContext.Current, res);
      byte[] buf = Encoding.UTF8.GetBytes(res);
      original_stream.Write(buf, 0, buf.Length);
      original_stream.Flush();
    }

    public override long Seek(long offset, SeekOrigin origin) {
      throw new InvalidOperationException();
    }

    public override void SetLength(long value) {
      throw new InvalidOperationException();
    }

    public override int Read(byte[] buffer, int offset, int count) {
      throw new InvalidOperationException();
    }

    public byte[] GetData() {
      return memory_stream.ToArray();
    }

    public override void Write(byte[] buffer, int offset, int count) {
      //23/3/2012 - expandData presunuta do Flush
      memory_stream.Write(buffer, offset, count);
      //string res = Encoding.UTF8.GetString(buffer);
      //res = DiskCacheModule.expandData(HttpContext.Current, res);
      //buffer = Encoding.UTF8.GetBytes(res);
      //original_stream.Write(buffer, 0, buffer.Length);
    }

  }
}



