using DesignNew;
using LMNetLib;
using System;
using System.Diagnostics;
using System.IO;
using System.Net;
using System.Threading.Tasks;
using System.Web;

namespace TheWeb {
  public static class Cache {
    public static void init() {
      try {
        var path = Cfg.cfg.server.basicPath + @"\swfiles.zip";
        Trace.TraceInformation("WebApp.Cache.init: " + path);
        swFile.extractSwFilesToCache(path); //soubory z swfiles.zip do cache
      } catch (Exception exp) {
        Trace.TraceError(LowUtils.ExceptionToString(exp));
      }
    }
    public enum makeResponseFromCacheResult {
      no,
      notModified,
      writeCached
    }
    public static makeResponseFromCacheResult makeResponseFromCache(string cacheKey, HttpContextBase ctx, out byte[] data) {
      //tast na pritomnost v cache
      data = null;
      if (string.IsNullOrEmpty(cacheKey)) return makeResponseFromCacheResult.no;
      swFile sf;
      lock (swFile.swFiles) {
        swFile.swFiles.TryGetValue(cacheKey.ToLower(), out sf);
        if (sf == null) return makeResponseFromCacheResult.no;
      }

      //ano => vrat z cache
      string eTag = ctx.Request.Headers["If-None-Match"];
      ctx.Response.Headers["Etag"] = sf.eTag;
      ctx.Response.ContentType = Consts.contentTypes[sf.ext];
      if (sf.eTag == eTag) { //souhlasi eTag => not modified
        ctx.Response.ClearContent();
        ctx.Response.StatusCode = (int)HttpStatusCode.NotModified;
        ctx.Response.AddHeader("Content-Length", "0");
        ctx.Response.SuppressContent = true;
        return makeResponseFromCacheResult.notModified;
      } else { //nova stranka (a ev. jeji gzip verze)
        string acceptEncoding = ctx.Request.Headers["Accept-Encoding"];
        ctx.Response.StatusCode = (int)HttpStatusCode.OK;
        if (!string.IsNullOrEmpty(acceptEncoding) && acceptEncoding.Contains("gzip") && sf.gzipData != null) {
          ctx.Response.Headers["Content-Encoding"] = "gzip";
          data = sf.gzipData;
        } else {
          data = sf.data;
        }
        return makeResponseFromCacheResult.writeCached;
      }
    }

    ////cache ostatnich souboruu
    //public static async Task onOtherCache(RouteContext context) {
    //  var url = itemUrl(context.HttpContext.Request.Path.Value);
    //  await makeResponseFromCache(url, context);
    //}
    ////ostatni soubory z filesystemu
    //public static async Task onOtherFile(RouteContext context) {
    //  var url = itemUrl(context.HttpContext.Request.Path.Value);
    //  using (var fs = File.OpenRead(FileSources.pathFromUrl(url))) await fs.CopyToAsync(context.HttpContext.Response.Body);
    //  context.IsHandled = true;
    //}
    static string itemUrl(string url) { return url.Split('~')[1]; }
  }
}