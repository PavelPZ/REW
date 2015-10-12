using System;
using System.Data;
using System.Configuration;
using System.Web;
using System.Web.Security;
using System.Web.UI;
using System.Web.UI.WebControls;
using System.Web.UI.WebControls.WebParts;
using System.Web.UI.HtmlControls;
using System.Collections.Generic;

using LMNetLib;
using LMComLib;
using System.Text;
using System.IO;
using System.Xml.Linq;

namespace LibDownload {

  public class verFile {
    public verFile(int ver, string fn) {
      version = ver; fileName = fn;
    }
    public int version;
    public string fileName;
  }

  public class downloadRes {
    public verFile winDown;
    public verFile winUpd;
    public verFile winBest;
    public verFile winFirstDown;
    public verFile Mac;
  }

  /// <summary>
  /// Summary description for WebDownloads
  /// </summary>
  public class DownloadLib {
    static Dictionary<string, verFile> updates = new Dictionary<string, verFile>();
    static Dictionary<string, verFile> firstWinVer = new Dictionary<string, verFile>();
    static Dictionary<string, verFile> downloadsWin = new Dictionary<string, verFile>();
    static Dictionary<string, verFile> downloadsMac = new Dictionary<string, verFile>();
    public static List<string> downloadIds = null;

    static void init(string id, string subMask, Dictionary<string, verFile> res) {
      ScanDir sd = new ScanDir();
      sd.BasicPath = System.Configuration.ConfigurationManager.AppSettings["download_dataPath"];
      sd.FileMask = string.Format(subMask);
      string mask = id + '\\' + subMask.ToLower();
      List<string[]> ver = new List<string[]>();
      for (int i = 0; i < sd.Count; i++) {
        string fn = sd.FileName(FileNameMode.RelPath, i).ToLower();
        if (fn.IndexOf(mask) < 0) continue;
        ver.Add(fn.Split(new char[] { '\\' }, 2)); //oddeleni verze a adresare
      }
      ver.Sort(delegate(string[] p1, string[] p2) {
        return int.Parse(p2[0]) - int.Parse(p1[0]);
      });
      if (ver.Count > 0) {
        res.Add(id, new verFile(int.Parse(ver[0][0]), sd.BasicPath + ver[0][0] + @"\" + ver[0][1]));
        if (res == downloadsWin) {
          int lastIdx = ver.Count - 1;
          firstWinVer.Add(id, new verFile(int.Parse(ver[lastIdx][0]), sd.BasicPath + ver[lastIdx][0] + @"\" + ver[lastIdx][1]));
        }
      }
    }

    public static void adjustDownloadIds(bool refresh) {
      lock (typeof(DownloadLib)) {
        if (refresh) {
          downloadIds = null;
          updates.Clear();
          firstWinVer.Clear();
          downloadsWin.Clear();
          downloadsMac.Clear();
        }
        if (downloadIds != null) return;
        downloadIds = new List<string>();
        ScanDir sd = new ScanDir();
        sd.BasicPath = System.Configuration.ConfigurationManager.AppSettings["download_dataPath"];
        sd.DirsToResult = true;
        sd.FilesToResult = false;
        for (int i = 0; i < sd.Count; i++) {
          string fn = sd.FileName(FileNameMode.RelPath, i).ToLower();
          string[] parts = fn.ToLower().Split(new char[] { '\\' }, 4);
          if (parts.Length < 4) continue;
          string res = parts[1] + '\\' + parts[2];
          if (downloadIds.IndexOf(res) < 0) downloadIds.Add(res);
        }
        downloadIds.Sort();
      }
    }

    public static downloadRes findDownloads(string id) {
      downloadRes res = new downloadRes();
      lock (typeof(DownloadLib)) {
        if (!downloadsWin.TryGetValue(id, out res.winDown)) {
          init(id, "update.exe", updates);
          init(id, "download.exe", downloadsWin);
          init(id, "cdrom.zip", downloadsMac);
          if (!downloadsWin.TryGetValue(id, out res.winDown))
            return null;
          //throw new Exception(string.Format("Cannot find download for {0} windows product", id));
        }
      }
      if (updates.TryGetValue(id, out res.winUpd)) res.winBest = res.winUpd.version >= res.winDown.version ? res.winUpd : res.winDown;
      else res.winBest = res.winDown;
      if (!firstWinVer.TryGetValue(id, out res.winFirstDown))
        throw new Exception(string.Format("Cannot find download for {0} fitst win product", id));
      if (!downloadsMac.TryGetValue(id, out res.Mac))
        throw new Exception(string.Format("Cannot find download for {0} MAC product", id));
      return res;
    }

    public static downloadRes findDownloads(Domains site, HttpRequest req) {
      string id = string.Format(@"{0}\{1}.{2}", (CourseIds)Enum.Parse(typeof(CourseIds), req["product"], true), site, req["lang"]);
      return findDownloads(id.ToLower());
    }

  }

  public static class DownloadModify {

    public const string DownloadModifyComment = "/*5E18EB2FF7464E78BF48136A5DE97A9C*/"; 
    public const string DownloadModifyData = "'www.langmaster.com'                             ;";
    public const string DownloadModifySignature = DownloadModifyComment + DownloadModifyData;

    public class buf { public byte[] data; public int len; }

    public static void BatchModify(string fn) {
      XElement script = XElement.Load(fn);
      foreach (XElement el in script.Elements()) {
        Console.WriteLine("Start: " + el.Element("src").Value);
        try {
          using (Stream src = File.OpenRead(el.Element("src").Value))
          using (Stream dest = File.Create(el.Element("dest").Value)) {
            SubDomains subSite = LowUtils.EnumParse<SubDomains>(el.Element("subSite").Value);
            Modify(src, src.Length, null, buf => dest.Write(buf.data, 0, buf.len), subSite);
          }
        } catch (Exception exp){
          Console.WriteLine("Error: " + exp.Message);
        }
        Console.WriteLine("End: " + el.Element("dest").Value);
      }
    }

    public static void Modify(Stream fs, long len, Func<bool> isContinue, Action<buf> write, SubDomains subSite) {
      bool modified = false; buf buf1 = null; buf buf2 = null;
      foreach (buf b in readBufs(fs, len, isContinue)) {
        //actBufIndex++;
        if (modified /*|| actBufIndex < modifiedBufIndex*/) { write(b); continue; } //budto jiz nahrazeno nebo se jeste nejedna o drive nalezeny buffer
        //modifiedBufIndex = -1; //modifiedBufIndex jiz neni potreba
        if (buf1 == null) buf1 = b; //prvni buffer, pouze nacti
        else { //dalsi buffery
          buf2 = b;
          modified = modify(buf1, buf2, subSite); //pokus o modifikaci
          write(buf1); buf1 = null; //zapis porvniho bufferu
          if (modified) { //modifikovano?
            //modifiedBufCount[url] = actBufIndex - 1; //zapamatuj si index modifikovaneho bufferu
            write(buf2); //zapis i druhy buffer
          } else
            buf1 = buf2; //nemodifikovano, pokracuj v cteni
        }
      }
      if (buf1 != null) { //ukonceno cteni, posledni buffer nezapsan
        if (buf2 == null) { //soubor je tvoren pouze jednum bufferem, nutno jej modifikovat
          modified = modify(buf1, null, subSite);
          //modifiedBufCount[url] = 0;
        }
        write(buf1); //zapis
      }
    }

    //static Dictionary<string, int> modifiedBufCount = new Dictionary<string, int>(); //pro kazdou setup.exe URL: zapamatuj si index buferu se zmenou

    const int bufLen = 10000; //pocet bytes, ktere se postupne nacitaji
    static int signLen = DownloadModifySignature.Length - 1; //delka nahrazovane casti
    //buf buffer1, buffer2; //dva bufery (vetsi o delku nahrazovane casti)
    static byte[] sign = Encoding.UTF8.GetBytes(DownloadModifyComment); //hledany retezec (/*GUID*/ signature)
    const string endDomain = "'                  "; //cast modifikovaneho retezce za novou domenou

    static bool modify(buf b1, buf b2, SubDomains subSite) { //modifikace buf1 a zacatku buf2
      bool res = false;
      //if (b2 != null) Array.Copy(b2.data, 0, b1.data, bufLen, signLen); //na konec b1 dej zacatek b2
      //int idx = IndexOfBytes(b1.data, sign, 0, b1.data.Length);
      //if (res = idx >= 0) { //nahrada
      //  byte[] newDomain = Encoding.UTF8.GetBytes(SubDomain.subDomainToHost(subSite) + endDomain); //nova data
      //  Array.Copy(newDomain, 0, b1.data, idx + sign.Length + 1/*preskoc guid a prvni apostrof*/, newDomain.Length); //copy za apostrof do b1
      //}
      //if (b2 != null) if (res) Array.Copy(b1.data, bufLen, b2.data, 0, signLen); //zmenena data do b2
      return res;
    }

    static int IndexOfBytes(byte[] array, byte[] pattern, int startIndex, int count) { //byte array IndexOf
      if (array == null || array.Length == 0 || pattern == null || pattern.Length == 0 || count == 0) return -1;
      int i = startIndex; int fidx = 0; int lastFidx = 0;
      int endIndex = count > 0 ? Math.Min(startIndex + count, array.Length) : array.Length;
      while (i < endIndex) {
        lastFidx = fidx;
        fidx = (array[i] == pattern[fidx]) ? ++fidx : 0;
        if (fidx == pattern.Length) return i - fidx + 1;
        if (lastFidx > 0 && fidx == 0) { i = i - lastFidx; lastFidx = 0; }
        i++;
      }
      return -1;
    }

    static IEnumerable<buf> readBufs(Stream fs, long len, Func<bool> isContinue) { //postupne nacitani buferu, v pameti jsou vzdy dva
      buf buffer1 = new buf() { data = new Byte[bufLen + signLen], len = 0 }; buf buffer2 = new buf() { data = new Byte[bufLen + signLen], len = 0 }; //dva bufery (vetsi o delku nahrazovane casti)
      long dataToRead = len; bool actFirst = true;
      while (dataToRead > 0) {
        if (isContinue == null || isContinue()) { // e.g. verify that the client is connected.
          buf buf = actFirst ? buffer1 : buffer2; actFirst = !actFirst;
          buf.len = fs.Read(buf.data, 0, bufLen); // Read the data in buffer.
          dataToRead = dataToRead - buf.len;
          yield return buf;
        } else {
          yield break; //prevent infinite loop if user disconnects
        }

      }
    }

  }

}
