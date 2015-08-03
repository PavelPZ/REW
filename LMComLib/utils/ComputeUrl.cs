using System;
using System.Collections;
using System.IO;
using System.Collections.Specialized;
using System.Configuration;
using System.Xml.Serialization;
using System.Web;
using System.Web.Hosting;

namespace LMNetLib
{


  public class UrlManager
  {
    const int maxBufLen = 64000;
    public static void ReturnDownload(HttpResponse resp, Stream str, string fileName)
    {
      resp.Clear();
      resp.AddHeader("Content-Disposition",
        string.Format("attachment; filename={0}", fileName));
      // add the header that specifies the file size, so that the browser can show the download progress
      resp.AddHeader("Content-Length", str.Length.ToString());
      // specify that the response is a stream that cannot be read by the client and must be downloaded
      resp.ContentType = "application/octet-stream";
      str.Seek(0, SeekOrigin.Begin);
      int bufLen = (int)(str.Length < maxBufLen ? str.Length : maxBufLen);
      byte[] buf = new byte[bufLen];
      while (str.Position < str.Length)
      {
        int len = str.Read(buf, 0, bufLen);
        resp.OutputStream.Write(buf, 0, len);
        resp.Flush();
      }
      // stop the execution of this page
      resp.End();
    }
    public static void ReturnDownload(HttpResponse resp, byte[] data, string fileName)
    {
      resp.Clear();
      resp.AddHeader("Content-Disposition",
        string.Format("attachment; filename={0}", fileName));
      // add the header that specifies the file size, so that the browser can show the download progress
      resp.AddHeader("Content-Length", data.Length.ToString());
      // specify that the response is a stream that cannot be read by the client and must be downloaded
      resp.ContentType = "application/octet-stream";
      resp.OutputStream.Write(data, 0, data.Length);
      // stop the execution of this page
      resp.End();
    }
  }

}
