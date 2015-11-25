using System;
using System.Collections.Generic;
using System.IO;
using System.IO.Compression;
using System.Security.Cryptography;

namespace WebCode {

  public static class Handler {
  }


  public class UrlRewrite { //: IHttpModule {


      //void IHttpModule.Init(HttpApplication context) {

      //  swFile.extractSwFilesToCache(); //soubory z d:\LMCom\rew\WebCode\App_Data\swfiles.zip do cache

      //  context.BeginRequest += (s, a) => {
      //    HttpApplication app = (HttpApplication)s;
      //    var pth = relPath(app.Request.Url.LocalPath);
      //    if (pth == null) { app.Response.Redirect("~/schools/index.html"); return; }
      //    //**** software file (z swfiles.zip nebo schools/index-*.html) z cache
      //    swFile sf;
      //    lock (swFile.swFiles) swFile.swFiles.TryGetValue(pth, out sf);
      //    if (sf != null) { makeResponseFromCache(sf, app); return; } //request z cache => return

      //    //**** prvni pristup k index file ASPX - nastav MemoryStream do filteru tak, aby se v context.UpdateRequestCache dala vygenerovana stranka dat do cache
      //    if (pth == "schools/index.aspx") {
      //      var oldFilter = app.Response.Filter; //http://romsteady.blogspot.cz/2008/12/workaround-aspnet-response-filter-is.html
      //      app.Response.Filter = new MemoryStream();
      //      oldFilter.Dispose();
      //      return;
      //    }

      //    //**** prvni pristup k index file HTML => proved rewrite
      //    if (pth.StartsWith("schools/index")) {
      //      //https://forums.iis.net/t/1146511.aspx
      //      NameValueCollection headers = new NameValueCollection(app.Request.Headers);
      //      headers["Orig-url"] = pth;
      //      var parts = pth.Split('.')[0].Split('-'); string lang = null; string isDebug = null; string designId = null;
      //      switch (parts.Length) {
      //        case 1: break;
      //        case 2: lang = parts[1]; break;
      //        case 3: lang = parts[1] + "-" + parts[2]; break;
      //        case 4: lang = parts[1] + "-" + parts[2]; isDebug = parts[3]; break;
      //        case 5: lang = parts[1] + "-" + parts[2]; isDebug = parts[3]; designId = parts[4]; break;
      //        default: throw new Exception(pth);
      //      }
      //      app.Server.TransferRequest("~/schools/index.aspx" +
      //        (lang == null ? null : "?lang=" + lang) +
      //        (isDebug == null ? null : "&isDebug=" + isDebug) +
      //        (designId == null ? null : "&designId=" + designId),
      //        false, "GET", headers);
      //    }

      //  };

      //  context.UpdateRequestCache += (s, a) => {
      //    HttpApplication app = (HttpApplication)s;
      //    var pth = relPath(app.Request.Url.LocalPath);
      //    if (pth != "schools/index.aspx") return;
      //    //zpracovani index.aspx
      //    MemoryStream filter = (MemoryStream)app.Response.Filter; //vygenerovana index-*.html stranka
      //    string oldPth = app.Request.Headers["Orig-url"]; //a jeji puvodni URL
      //    var sf = swFile.addToCache(oldPth, ".html", filter.ToArray()); //vlozeni index-*.html do cache
      //    makeResponseFromCache(sf, app); //naplneni response
      //  };
      //}

      //void makeResponseFromCache(swFile sf, HttpApplication app) {
      //  string eTag = app.Request.Headers["If-None-Match"];
      //  app.Response.AppendHeader("Etag", sf.eTag);
      //  app.Response.ContentType = DesignNew.Consts.contentTypes[sf.ext];
      //  if (sf.eTag == eTag) { //souhlasi eTag => not modified
      //    app.Response.ClearContent();
      //    app.Response.StatusCode = (int)HttpStatusCode.NotModified;
      //    app.Response.AddHeader("Content-Length", "0");
      //    app.Response.SuppressContent = true;
      //  } else { //nova stranka (a ev. jeji gzip verze)
      //    string acceptEncoding = app.Request.Headers["Accept-Encoding"];
      //    app.Response.StatusCode = (int)HttpStatusCode.OK;
      //    if (!string.IsNullOrEmpty(acceptEncoding) && acceptEncoding.Contains("gzip") && sf.gzipData != null) {
      //      app.Response.AppendHeader("Content-Encoding", "gzip");
      //      app.Response.OutputStream.Write(sf.gzipData, 0, sf.gzipData.Length);
      //    } else {
      //      app.Response.OutputStream.Write(sf.data, 0, sf.data.Length);
      //    }
      //  }
      //  app.Response.End();
      //}

      //void IHttpModule.Dispose() { }

      //string relPath(string localPath) {
      //  var toRemove = HostingEnvironment.ApplicationVirtualPath.Length + (HostingEnvironment.ApplicationVirtualPath == "/" ? 0 : 1);
      //  return toRemove >= localPath.Length ? null : localPath.Substring(toRemove).ToLower();
      //}



    }

  }
