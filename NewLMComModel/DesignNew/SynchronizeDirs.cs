using LMNetLib;
using Microsoft.WindowsAzure.Storage;
using Microsoft.WindowsAzure.Storage.Blob;
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
    public static void synchronize(string container, IDriver driver) {
      var all = allPZFiles().ToArray();
      var items = dirItems.srcFromFilesystem(@"d:\LMCom\rew\Web4", all);
      var dest = driver.readMap(container);
      var delta = items.synchronize(dest); if (delta == null) return;
      driver.update(container, delta);
    }
    public static IEnumerable<string> allPZFiles() {
      string[] paths = new string[] { @"d:\LMCom\rew\Web4\lm", @"d:\LMCom\rew\Web4\grafia", @"d:\LMCom\rew\Web4\edusoft", @"d:\LMCom\rew\Web4\skrivanek", @"d:\LMCom\rew\Web4\data\instr" };
      return paths.AsParallel().SelectMany(d => Directory.EnumerateFiles(d, "*.js", SearchOption.AllDirectories).Concat(Directory.EnumerateFiles(d, "*.mm", SearchOption.AllDirectories)));
    }
  }

  public struct sdPath { //napr. pro lm/etestme/english/a2/Reading/Reading/10.xml nebo lm/prods_lm_blcourse_english.js
    public string container; //napr. lm_etestme_english nebo blank
    public string blob; //napr. a2/Reading/Reading/10.xml nebo lm/prods_lm_blcourse_english.js
    //**** PATH utils
    public string toPath() { return container + "|" + blob; }
    //public static sdPath computePath(string url) {
    //  int cnt = 0; int idx = 0;
    //  for (int i = 0; i < url.Length; i++) {
    //    if (url[i] != '/') continue;
    //    cnt++; if (cnt < 3) continue;
    //    idx = i; break;
    //  }
    //  if (idx > 0) return new sdPath { container = url.Substring(0, idx).Replace('/', '_'), blob = url.Substring(idx + 1) };
    //  else return new sdPath { container = "blank", blob = url };
    //}
    public static sdPath pathParts(string path) { var parts = path.Split('|'); return new sdPath { container = parts[0], blob = parts[1] }; }
  }

  public class dirItem {
    public string path; //napr. lm_etestme_english|a2/Reading/Reading/10.xml nebo blank|lm/prods_lm_blcourse_english.js
    public string eTag; //Base64 z MD5
    [XmlIgnore]
    public byte[] data; //data pro insert nebo update
    [XmlIgnore]
    public string fileName; //soubor s daty pro insert nebo update
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

  public class azureDriver : IDriver {
    CloudBlobClient blobClient;
    public azureDriver(string accountName, string accountKey) {
      var connStr = string.Format("DefaultEndpointsProtocol=https;AccountName={0};AccountKey={0}", accountName, accountKey);
      CloudStorageAccount storageAccount = CloudStorageAccount.Parse(connStr);
      blobClient = storageAccount.CreateCloudBlobClient();
    }
    public readMapResult readMap(string containerName) {
      CloudBlobContainer container = blobClient.GetContainerReference(containerName);
      container.CreateIfNotExists();
      container.SetPermissions(new BlobContainerPermissions { PublicAccess = BlobContainerPublicAccessType.Blob });
      CloudBlockBlob blockBlob = container.GetBlockBlobReference("map.map");
      using (var fileStream = System.IO.File.OpenRead(@"path\myfile")) {
        blockBlob.UploadFromStream(fileStream);
      }
      return new readMapResult();
    }
    public void update(string container, dirItemsDelta delta) {
    }
  }

  public class fileSystemDriver : IDriver {
    public fileSystemDriver(string basicPath, string container) { this.basicPath = basicPath + "\\" + container; }
    string basicPath;
    public readMapResult readMap(string container) {
      var path = fileName("map.map");
      return File.Exists(path) ? 
        new readMapResult { dest = XmlUtils.FileToObject<dirItems>(path), justCreated = false } : 
        new readMapResult { dest = new dirItems(), justCreated = true };
    }
    public void update(string container, dirItemsDelta delta) {
      if (delta.empty()) return;
      Parallel.ForEach(delta.delete, it => File.Delete(fileName(it.path)));
      Parallel.ForEach(delta.update.Concat(delta.insert), it => {
        var fn = fileName(it.path); Directory.CreateDirectory(Path.GetDirectoryName(fn));
        if (it.data != null) File.WriteAllBytes(fn, it.data); else File.Copy(it.fileName, fn, true);
      });
      //}
    }
    string fileName(string url) { return basicPath + "\\" + url.Replace('/', '\\'); }
  }
  public struct readMapResult { public dirItems dest; public bool justCreated; }

  public class dirItems {
    public static dirItems srcFromFilesystem(string srcPath, IEnumerable<string> files) {
      var res = new dirItems();
      res.items =
      files.Select(f => f.ToLower()).AsParallel().Select(f => {
        var isMM = Path.GetExtension(f) == ".mm";
        var fn = isMM ? f.Substring(0, f.Length - 3) : f;
        var name = fn.Substring(srcPath.Length + 1);
        name = name.Replace('\\', '/');
        var di = new dirItem(); di.path = name;
        using (MD5 md5 = MD5.Create()) di.eTag = isMM ? File.ReadAllText(f) : Convert.ToBase64String(md5.ComputeHash(File.ReadAllBytes(f)));
        di.fileName = fn;
        return di;
      }).ToList();
      return res;
    }

    public dirItemsDelta synchronize(readMapResult dest) {
      var res = new dirItemsDelta();
      var srcDir = items.ToDictionary(it => it.path); HashSet<string> srcDone = new HashSet<string>();
      for (int i = dest.dest.items.Count - 1; i >= 0; i--) { //delete, update:
        dirItem destItem = dest.dest.items[i]; dirItem srcItem;
        if (srcDir.TryGetValue(destItem.path, out srcItem)) {
          srcDone.Add(destItem.path);
          if (srcItem.eTag == destItem.eTag) continue;
          res.update.Add(destItem); destItem.eTag = srcItem.eTag; destItem.data = srcItem.data; destItem.fileName = srcItem.fileName;
        } else {
          res.delete.Add(destItem);
          dest.dest.items.RemoveAt(i);
        }
      }
      foreach (var srcItem in items) { //insert:
        if (srcDone.Contains(srcItem.path)) continue;
        dirItem destItem = new dirItem { path = srcItem.path, eTag = srcItem.eTag, data = srcItem.data, fileName = srcItem.fileName };
        res.insert.Add(destItem); dest.dest.items.Add(destItem);
      }
      if (res.empty()) return null;
      var mapData = XmlUtils.ObjectToBytes(dest.dest);
      dirItem mapItem = new dirItem { path = "map.map", eTag = "", data = mapData };
      if (dest.justCreated) res.insert.Add(mapItem); else res.update.Add(mapItem);
      return res;
    }
    public List<dirItem> items = new List<dirItem>();
  }

}
