using LMNetLib;
using System;
using System.Collections.Generic;
using System.IO;
using System.IO.Compression;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;
using System.Xml.Serialization;

namespace DesignNew {

  public static class SynchronizeDirs {
    public static void synchronize(string zipFn, IDriver driver) {
      foreach (var items in dirItems.srcFromZip(zipFn)) {
        var dest = driver.readMap(items.container);
        var delta = items.synchronize(dest); if (delta == null) continue;
        driver.update(dest.dest.container, delta);
      }
    }
  }

  public struct sdPath { //napr. pro lm/etestme/english/a2/Reading/Reading/10.xml nebo lm/prods_lm_blcourse_english.js
    public string container; //napr. lm_etestme_english nebo blank
    public string blob; //napr. a2/Reading/Reading/10.xml nebo lm/prods_lm_blcourse_english.js
    //**** PATH utils
    public string toPath() { return container + "|" + blob; }
    public static sdPath computePath(string url) {
      int cnt = 0; int idx = 0;
      for (int i = 0; i < url.Length; i++) {
        if (url[i] != '/') continue;
        cnt++; if (cnt < 3) continue;
        idx = i; break;
      }
      if (idx > 0) return new sdPath { container = url.Substring(0, idx).Replace('/', '_'), blob = url.Substring(idx + 1) };
      else return new sdPath { container = "blank", blob = url };
    }
    public static sdPath pathParts(string path) { var parts = path.Split('|'); return new sdPath { container = parts[0], blob = parts[1] }; }
  }

  public class dirItem {
    public string path; //napr. lm_etestme_english|a2/Reading/Reading/10.xml nebo blank|lm/prods_lm_blcourse_english.js
    public string eTag; //Base64 z MD5
    [XmlIgnore]
    public byte[] data; //data pro insert nebo update
  }
  public class dirItemsDelta {
    public List<dirItem> update = new List<dirItem>();
    public List<dirItem> insert = new List<dirItem>();
    public List<dirItem> delete = new List<dirItem>();
    public bool empty() { return update.Count + insert.Count + delete.Count == 0; }
  }

  public interface IDriver {
    readMapResult readMap(string container);
    void update(string container, dirItemsDelta delta);
  }

  public class fileSystemDriver : IDriver {
    public fileSystemDriver(string basicPath) { this.basicPath = basicPath; }
    string basicPath;
    public readMapResult readMap(string container) {
      var path = fileName(container, "map.map");
      return File.Exists(path) ? new readMapResult { dest = XmlUtils.FileToObject<dirItems>(path), justCreated = false } : new readMapResult { dest = new dirItems { container = container }, justCreated = true };
    }
    public void update(string container, dirItemsDelta delta) {
      if (delta.empty()) return;
      foreach (var it in delta.delete) File.Delete(fileName(it.path));
      foreach (var it in delta.update.Concat(delta.insert)) {
        var fn = fileName(it.path); Directory.CreateDirectory(Path.GetDirectoryName(fn));
        File.WriteAllBytes(fn, it.data);
      }
    }
    string fileName(string container, string url) { return basicPath + "\\" + container + "\\" + url; }
    string fileName(string path) { var pth = sdPath.pathParts(path); return basicPath + "\\" + pth.container + "\\" + pth.blob; }
  }
  public struct readMapResult { public dirItems dest; public bool justCreated; }

  public class dirItems {
    public static List<dirItems> srcFromZip(string zipFn) {
      List<dirItems> res = new List<dirItems>();
      var mStr = new MemoryStream();
      using (MD5 md5 = MD5.Create())
      using (var zipStr = File.OpenRead(zipFn))
      using (ZipArchive zip = new ZipArchive(zipStr, ZipArchiveMode.Read)) {
        foreach (var f in zip.Entries) {
          if (Path.GetExtension(f.FullName) == ".gzip") continue;
          using (var fStr = f.Open()) {
            mStr.SetLength(0); fStr.CopyTo(mStr);
            sdPath path = sdPath.computePath(f.FullName.Replace('\\', '/'));
            var contItems = res.FirstOrDefault(c => c.container == path.container);
            if (contItems == null) res.Add(contItems = new dirItems { container = path.container });
            contItems.add(path, mStr.ToArray(), md5);
          }
        }
      }
      return res;
    }
    public void add(sdPath path, byte[] data, MD5 md5) {
      var di = new dirItem(); di.path = path.toPath(); di.eTag = Convert.ToBase64String(md5.ComputeHash(data)); di.data = data;
      items.Add(di);
    }
    public dirItemsDelta synchronize(readMapResult dest) {
      var res = new dirItemsDelta();
      var srcDir = items.ToDictionary(it => it.path); HashSet<string> srcDone = new HashSet<string>();
      for (int i = dest.dest.items.Count - 1; i >= 0; i--) { //delete, update:
        dirItem destItem = dest.dest.items[i]; dirItem srcItem;
        if (srcDir.TryGetValue(destItem.path, out srcItem)) {
          srcDone.Add(destItem.path);
          if (srcItem.eTag == destItem.eTag) continue;
          res.update.Add(destItem); destItem.eTag = srcItem.eTag; destItem.data = srcItem.data;
        } else {
          res.delete.Add(destItem);
          dest.dest.items.RemoveAt(i);
        }
      }
      foreach (var srcItem in items) { //insert:
        if (srcDone.Contains(srcItem.path)) continue;
        dirItem destItem = new dirItem { path = srcItem.path, eTag = srcItem.eTag, data = srcItem.data };
        res.insert.Add(destItem); dest.dest.items.Add(destItem);
      }
      if (res.empty()) return null;
      var mapData = XmlUtils.ObjectToBytes(dest.dest);
      dirItem mapItem = new dirItem { path = container + @"|map.map", eTag = "", data = mapData };
      if (dest.justCreated) res.insert.Add(mapItem); else res.update.Add(mapItem);
      return res;
    }
    public string container;
    public List<dirItem> items = new List<dirItem>();
  }

}
