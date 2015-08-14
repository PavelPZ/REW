using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Web;

namespace web4.Temp {
  /// <summary>
  /// Summary description for ScormZip
  /// </summary>
  public class ScormZip : IHttpHandler {

    public void ProcessRequest(HttpContext context) {
      using (var str = context.Request.InputStream)
      using (var rdr = new StreamReader(str)) {
        string req = rdr.ReadToEnd();
        context.Response.Clear();
        context.Response.ContentType = "application/octet-stream";
        Packager.RewApp.ScormZipFromList(req, context.Response.OutputStream);
        context.Response.Flush();
        context.Response.End();
      }
    }

    public bool IsReusable { get { return true; } }
  }
}