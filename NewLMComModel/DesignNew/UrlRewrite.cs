using System;
using System.Collections.Generic;
using System.IO;
using System.IO.Compression;
using System.Linq;
using System.Net;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;
using System.Web;
using System.Web.Hosting;

namespace WebCode {

  public class UrlRewrite : IHttpModule {


    void IHttpModule.Init(HttpApplication context) {
      sfFile.init();
      context.BeginRequest += (s, a) => {
        HttpApplication app = (HttpApplication)s;
        var pth = relPath(app.Request.Url.LocalPath);
        string eTag = app.Request.Headers["If-None-Match"];
        //**** index file
        if (pth.StartsWith("schools/index-")) {
          app.Server.Transfer("~/schools/index.aspx?lang=cs-cz");
        }
        //**** software file
        sfFile sf;
        if (sfFile.sfFiles.TryGetValue(pth, out sf)) {
          app.Response.AppendHeader("Etag", sf.eTag);
          app.Response.ContentType = DesignNew.Deploy.contentTypes[sf.ext];
          if (sf.eTag == eTag) {
            app.Response.ClearContent();
            app.Response.StatusCode = (int)HttpStatusCode.NotModified;
            //app.Response.StatusDescription = "Not Modified";
            app.Response.AddHeader("Content-Length", "0");
            app.Response.SuppressContent = true;
          } else {
            string acceptEncoding = app.Request.Headers["Accept-Encoding"];
            app.Response.StatusCode = (int)HttpStatusCode.OK;
            if (!string.IsNullOrEmpty(acceptEncoding) && acceptEncoding.Contains("gzip") && sf.gzipData != null) {
              app.Response.AppendHeader("Content-Encoding", "gzip");
              app.Response.OutputStream.Write(sf.gzipData, 0, sf.gzipData.Length);
            } else {
              app.Response.OutputStream.Write(sf.data, 0, sf.data.Length);
            }
          }
          app.Response.End();
        }
      };
    }

    void IHttpModule.Dispose() {
    }

    string relPath(string localPath) { return localPath.Substring(HostingEnvironment.ApplicationVirtualPath.Length + 1).ToLower(); }

    public class sfFile {

      public sfFile(string nm) { name = nm; ext = Path.GetExtension(name); }
      public void setData(byte[] d, MD5 md5) {
        data = d;
        var shb = new System.Runtime.Remoting.Metadata.W3cXsd2001.SoapHexBinary(md5.ComputeHash(d));
        eTag = shb.ToString();
      }

      public string name;
      public string ext;
      public string eTag;
      public byte[] data;
      public byte[] gzipData;

      public static Dictionary<string, sfFile> sfFiles = new Dictionary<string, sfFile>();
      public static void init() {
        var zipFn = HostingEnvironment.MapPath("~/app_data/swfiles.zip");
        var mStr = new MemoryStream();
        using (MD5 md5 = MD5.Create())
        using (var zipStr = File.OpenRead(zipFn))
        using (ZipArchive zip = new ZipArchive(zipStr, ZipArchiveMode.Read)) {
          foreach (var f in zip.Entries)
            using (var fStr = f.Open()) {
              mStr.SetLength(0);
              fStr.CopyTo(mStr);
              string name = f.FullName.Replace('\\','/'); bool isGZip = false;
              if (name.EndsWith(".gzip")) {
                name = name.Substring(0, name.Length - 5);
                isGZip = true;
              }
              sfFile actFile;
              if (!sfFiles.TryGetValue(name, out actFile)) sfFiles.Add(name, actFile = new sfFile(name));
              if (isGZip) actFile.gzipData = mStr.ToArray(); else actFile.setData(mStr.ToArray(), md5);
            }
        }
      }
    }

  }
}
