using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.IO;
using System.Web;
using System.Xml.Serialization;

using LMNetLib;

namespace LMComLib {

  public class ImgInfo {
    public ImgInfo() { }
    public ImgInfo(string fn) {
      Ext = Path.GetExtension(fn);
      Data = StringUtils.FileToBytes(fn);
    }
    public byte[] Data;
    public string Ext;
    [XmlIgnore]
    public int Id;
    public string Url() { return "dbimgnew.aspx?id=" + Id.ToString(); }
  }

  public static class VirtualImg {

    public static List<ImgInfo> Infos = new List<ImgInfo>();

    /// <summary>
    /// !!! musi predchazet lock (typeof(VirtualImg))
    /// </summary>
    public static void registerImg(ImgInfo img) {
      if (img == null) return;
      img.Id = Infos.Count; Infos.Add(img);
    }

    public static void returnImg(HttpContext ctx) {
      if (ctx == null || ctx.Request.Url.AbsolutePath.IndexOf("/dbimgnew.aspx") < 0) return;
      int id = int.Parse(ctx.Request["id"]);
      ImgInfo img;
      lock (typeof(VirtualImg)) {
        img = Infos[id];
      }
      returnImg(ctx.Response, img);
    }

    static void returnImg(HttpResponse resp, ImgInfo img) {
      resp.Clear();
      resp.ClearHeaders();
      resp.ClearContent();
      resp.ContentType = "image/" + img.Ext;
      //resp.BufferOutput = false;
      resp.Cache.SetCacheability(HttpCacheability.Public);
      resp.Cache.SetLastModified(DateTime.UtcNow);
      resp.Cache.SetExpires(DateTime.UtcNow.AddMonths(1));
      resp.Cache.SetValidUntilExpires(true);
      resp.BinaryWrite(img.Data);
      resp.Flush();
      resp.End();
    }
  }

}
