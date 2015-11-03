using LMComLib;
using LMNetLib;
using Microsoft.WindowsAzure.Storage;
using Microsoft.WindowsAzure.Storage.Blob;
using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.IO;
using System.IO.Compression;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;
using System.Xml.Serialization;

namespace DesignNew {

  //********************************
  //d:\LMCom\rew\Web4\Deploy\envelopes.xml se seznamem souboru
  public class buildEnvelopes {

    public buildEnvelope[] items { get { return dir.Values.ToArray(); } set { dir = value.ToDictionary(v => v.url); } }
    [XmlIgnore]
    public Dictionary<string, buildEnvelope> dir;
    static string fn = Machines.rootPath + @"Deploy\envelopes.xml";
    static HashSet<string> allLocs = new HashSet<string>(CommonLib.smallLocalizations.Select(l => l.ToString()));

    public static buildEnvelopes adjust() {
      var res = File.Exists(fn) ? XmlUtils.FileToObject<buildEnvelopes>(fn) : new buildEnvelopes { dir = new Dictionary<string, buildEnvelope>() };
      return res;
    }
    public void save() { XmlUtils.ObjectToFile(fn, this); }

    public void adjustEnvelope(string buildId, string url, byte[] data = null) {
      var fn = Machines.rootDir + url.Replace('/', '\\');
      url = url.ToLower();
      buildEnvelope env;
      lock (dir) {
        if (!dir.TryGetValue(url, out env)) dir.Add(url, env = new buildEnvelope() { buildIdLst = new List<string>(), lastWriteTime = DateTime.MinValue, url = url });
      }
      if (env.buildIdLst.IndexOf(buildId) < 0) env.buildIdLst.Add(buildId);
      if (data != null) { //JS files a ostatni soubory v data
        using (var md5 = MD5.Create()) {
          var etag = Convert.ToBase64String(md5.ComputeHash(data));
          if (env.etag != etag) {
            env.etag = etag;
            File.WriteAllBytes(fn, data);
          }
          //lang
          var parts = url.Split('.');
          if (parts[parts.Length - 1] == "js" && allLocs.Contains(parts[parts.Length - 2]))
            env.lang = LowUtils.EnumParse<Langs>(parts[parts.Length - 2]);
        }
      } else { //MM files
        var lastWriteTime = File.GetLastWriteTimeUtc(fn);
        if (lastWriteTime > env.lastWriteTime) { //mm soubor je novejsi => spocitej etag
          using (var md5 = MD5.Create())
          using (var str = File.OpenRead(fn)) {
            env.etag = Convert.ToBase64String(md5.ComputeHash(str));
            env.lastWriteTime = lastWriteTime;
          }
        }
      }
    }

    public dirItemsDelta synchronize(readMapResult dest) {
      var res = new dirItemsDelta();
      HashSet<string> srcDone = new HashSet<string>();
      for (int i = dest.dest.items.Count - 1; i >= 0; i--) { //delete, update:
        dirItem destItem = dest.dest.items[i]; buildEnvelope srcItem;
        if (dir.TryGetValue(destItem.url, out srcItem)) {
          srcDone.Add(destItem.url);
          if (srcItem.etag == destItem.etag) continue;
          res.update.Add(destItem); destItem.etag = srcItem.etag;
        } else {
          res.delete.Add(destItem);
          dest.dest.items.RemoveAt(i);
        }
      }
      foreach (var srcItem in dir.Values) { //insert:
        if (srcDone.Contains(srcItem.url)) continue;
        dirItem destItem = new dirItem { url = srcItem.url, etag = srcItem.etag };
        res.insert.Add(destItem); dest.dest.items.Add(destItem);
      }
      if (res.empty()) return null;
      var mapData = XmlUtils.ObjectToBytes(dest.dest);
      dirItem mapItem = new dirItem { url = "map.map", etag = "", data = mapData };
      if (dest.justCreated) res.insert.Add(mapItem); else res.update.Add(mapItem);
      return res;
    }
  }

  public class buildEnvelope { //pro JS soubory i MM soubory obsahuje etag a info, ktereho buildu je soubor soucasti
    [XmlAttribute]
    public string etag;
    [XmlAttribute]
    public string url;
    [XmlAttribute, DefaultValue(0)]
    public long modified { get { return lastWriteTime == DateTime.MinValue ? 0 : lastWriteTime.Ticks; } set { lastWriteTime = new DateTime(value); } }
    [XmlAttribute]
    public string buildIds { get { return buildIdLst.Aggregate((r, i) => r + "," + i); } set { buildIdLst = value.Split(',').ToList(); } }
    [XmlAttribute, DefaultValue(Langs.no)]
    public Langs lang;

    [XmlIgnore]
    public DateTime lastWriteTime; //pro mm soubory: datum souboru ve filesystemu, kvuli zjisteni jeho zmeny a novemu spocitani etagu
    [XmlIgnore]
    public List<string> buildIdLst;

  }

  //****************************** SYNCHRONIZE dirs library
  public static class SynchronizeDirs {
    public static void synchronize(string container, IDriver driver) {
      var src = buildEnvelopes.adjust();
      //var all = allPZFiles().ToArray();
      //var items = dirItems.srcFromFilesystem(@"d:\LMCom\rew\Web4", all);
      //var dest = driver.readMap(container);
      //var delta = items.synchronize(dest); if (delta == null) return;
      //driver.update(container, delta);
    }
    //public static IEnumerable<string> allPZFiles() {
    //  string[] paths = new string[] { @"d:\LMCom\rew\Web4\lm", @"d:\LMCom\rew\Web4\grafia", @"d:\LMCom\rew\Web4\edusoft", @"d:\LMCom\rew\Web4\skrivanek", @"d:\LMCom\rew\Web4\data\instr" };
    //  return paths.AsParallel().SelectMany(d => Directory.EnumerateFiles(d, "*.js", SearchOption.AllDirectories).Concat(Directory.EnumerateFiles(d, "*.mm", SearchOption.AllDirectories)));
    //}
  }

  //public struct sdPath { //napr. pro lm/etestme/english/a2/Reading/Reading/10.xml nebo lm/prods_lm_blcourse_english.js
  //  public string container; //napr. lm_etestme_english nebo blank
  //  public string blob; //napr. a2/Reading/Reading/10.xml nebo lm/prods_lm_blcourse_english.js
  //  //**** PATH utils
  //  public string toPath() { return container + "|" + blob; }
  //  //public static sdPath computePath(string url) {
  //  //  int cnt = 0; int idx = 0;
  //  //  for (int i = 0; i < url.Length; i++) {
  //  //    if (url[i] != '/') continue;
  //  //    cnt++; if (cnt < 3) continue;
  //  //    idx = i; break;
  //  //  }
  //  //  if (idx > 0) return new sdPath { container = url.Substring(0, idx).Replace('/', '_'), blob = url.Substring(idx + 1) };
  //  //  else return new sdPath { container = "blank", blob = url };
  //  //}
  //  public static sdPath pathParts(string path) { var parts = path.Split('|'); return new sdPath { container = parts[0], blob = parts[1] }; }
  //}

  public class dirItem {
    [XmlAttribute]
    public string etag;
    [XmlAttribute]
    public string url;
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
      Parallel.ForEach(delta.delete, it => File.Delete(fileName(it.url)));
      Parallel.ForEach(delta.update.Concat(delta.insert), it => {
        var fn = fileName(it.url); Directory.CreateDirectory(Path.GetDirectoryName(fn));
        if (it.data != null) File.WriteAllBytes(fn, it.data); else File.Copy(Machines.rootDir + it.url.Replace('/', '\\'), fn, true);
      });
    }
    string fileName(string url) { return basicPath + "\\" + url.Replace('/', '\\'); }
  }
  public struct readMapResult { public dirItems dest; public bool justCreated; }

  public class dirItems {
    //public static dirItems srcFromFilesystem(string srcPath, IEnumerable<string> files) {
    //  var res = new dirItems();
    //  res.items =
    //  files.Select(f => f.ToLower()).AsParallel().Select(f => {
    //    var isMM = Path.GetExtension(f) == ".mm";
    //    var fn = isMM ? f.Substring(0, f.Length - 3) : f;
    //    var name = fn.Substring(srcPath.Length + 1);
    //    name = name.Replace('\\', '/');
    //    var di = new dirItem(); di.url = name;
    //    using (MD5 md5 = MD5.Create()) di.etag = isMM ? File.ReadAllText(f) : Convert.ToBase64String(md5.ComputeHash(File.ReadAllBytes(f)));
    //    di.fileName = fn;
    //    return di;
    //  }).ToList();
    //  return res;
    //}

    //public dirItemsDelta synchronize(readMapResult dest) {
    //  var res = new dirItemsDelta();
    //  var srcDir = items.ToDictionary(it => it.url); HashSet<string> srcDone = new HashSet<string>();
    //  for (int i = dest.dest.items.Count - 1; i >= 0; i--) { //delete, update:
    //    dirItem destItem = dest.dest.items[i]; dirItem srcItem;
    //    if (srcDir.TryGetValue(destItem.url, out srcItem)) {
    //      srcDone.Add(destItem.url);
    //      if (srcItem.etag == destItem.etag) continue;
    //      res.update.Add(destItem); destItem.etag = srcItem.etag; destItem.data = srcItem.data; destItem.fileName = srcItem.fileName;
    //    } else {
    //      res.delete.Add(destItem);
    //      dest.dest.items.RemoveAt(i);
    //    }
    //  }
    //  foreach (var srcItem in items) { //insert:
    //    if (srcDone.Contains(srcItem.url)) continue;
    //    dirItem destItem = new dirItem { url = srcItem.url, etag = srcItem.etag, data = srcItem.data, fileName = srcItem.fileName };
    //    res.insert.Add(destItem); dest.dest.items.Add(destItem);
    //  }
    //  if (res.empty()) return null;
    //  var mapData = XmlUtils.ObjectToBytes(dest.dest);
    //  dirItem mapItem = new dirItem { url = "map.map", etag = "", data = mapData };
    //  if (dest.justCreated) res.insert.Add(mapItem); else res.update.Add(mapItem);
    //  return res;
    //}
    public List<dirItem> items = new List<dirItem>();
  }

}
