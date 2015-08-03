using System;
using System.Data;
using System.Configuration;
using System.Collections.Generic;
using System.Collections;
using System.Web;
using System.Web.Caching;
using System.IO;
using System.Xml;
using System.Text;
using System.Web.Security;
using System.Web.UI;
using System.Web.UI.WebControls;
using System.Web.UI.WebControls.WebParts;
using System.Web.UI.HtmlControls;
using System.Web.Hosting;

using LMNetLib;
using LMScormLibDOM;

namespace LMScormLib {
  public enum SoundFilePathEnum {
    Markers,
    Url,
    JavaScriptUrl,
  }
  /// <summary>Jedna zvukova znacka v mape zvukoveho souboru.</summary>
  public class Marker {
    public string Name; //identifikace, musi byt S<poradove cislo, pocinaje nulou>
    public string RawTitle; //puvodni Titulek s vlastnostmi
    public string Title; //Titulek bez vlastnoti
    public long Beg; //zacatek vety (casove jednotky jsou ve stovkach nanosekund)
    public long Middle; //prostredek vety
    public long End; //konec vety
    public Markers Owner;
    public Dictionary<string, object> Props; //vlastnosti, zapsane ve formatu {key=value}
    public int Idx;
    public bool NoSound {
      get { return Owner.NoSound; }
    }
    public void setTitle(string tit, ResxFilesManager resx) {
      RawTitle = tit;
      decodeText(tit, ref Title, ref Props, resx, Idx);
    }
    static void addDecodeText(string key, string value, ref Dictionary<string, object> Props, ResxFilesManager resx, int idx) {
      if (Props == null) Props = new Dictionary<string, object>();
      if (resx != null && key[0] == 't') {
        resx.Clear();
        resx.appendKey(string.Format("{0}_{1}", key, idx), value);
        Props.Add(key, resx.toLocalizedLiteral());
      } else
        Props.Add(key, value);
    }
    public static void decodeText(string text, ref string ListenText, ref Dictionary<string, object> Props) {
      decodeText(text, ref ListenText, ref Props, null, -1);
    }
    static void decodeText(string text, ref string ListenText, ref Dictionary<string, object> Props, ResxFilesManager resx, int idx) {
      int start = 0;
      bool first = true;
      while (true) {
        start = text.IndexOf('{', start);
        if (start < 0) {
          if (first) ListenText = text;
          break;
        }
        if (first) ListenText = text.Substring(0, start).Trim();
        first = false;
        int end = text.IndexOf('}', start);
        if (end < 0) throw new Exception();
        int eq = text.IndexOf('=', start);
        if (eq < 0 || eq > end) throw new Exception();
        string key = text.Substring(start + 1, eq - start - 1);
        if (string.IsNullOrEmpty(key)) throw new Exception();
        string value = text.Substring(eq + 1, end - eq - 1);
        addDecodeText(key, value, ref Props, resx, idx);
        start = end + 1;
      }
      //return text.Replace("{", @"<span class=""chinesePinyin"">(").Replace("}", ")</span>");
    }

  }

  /// <summary>Mapa zvukoveho souboru.</summary>
  public class Markers : List<Marker> {
    public Markers(string fileName) {
      FileName = fileName;
    }
    public void getObjId(out string spaceId, out string globalId, out string url) {
      string id = FileName.Substring(HttpRuntime.AppDomainAppPath.Length);
      string[] parts = id.Split(new char[] { '\\' }, 2);
      if (parts.Length == 1) {
        spaceId = ""; globalId = parts[0].Replace('\\', '/').Replace(".lmap", null);
      } else {
        spaceId = parts[0]; globalId = parts[1].Replace('\\', '/').Replace(".lmap", null);
      }
      url = ("lm/oldea/" + spaceId + "/" + globalId.Replace(".wma",".mp3")).ToLower();
    }
    //public string AppUrl() {
    //  string email = FileName.Substring(HttpRuntime.AppDomainAppPath.Length);
    //  return lib.RelativeUrl("~/" + email.Replace('\\', '/').Replace(".lmap", null));
    //}
    public bool NoSound; //bez zvuku
    public string FileName; //jmeno puvodniho souboru
    /// <summary>Validace: vsechny znacky jdou po sobe a maji spravne jmeno formatu S0,S1,...</summary>
    public void Validate() {
      if (NoSound) return;
      long maxBegPos = long.MinValue;
      for (int i = 0; i < Count; i++) {
        Marker mk = this[i];
        if (mk.Name != "S" + i.ToString())
          throw new Exception(string.Format("Wrong marker name {0}. It has to be {1}.", mk.Name, "S" + i.ToString()));
        if (mk.Beg < maxBegPos)
          throw new Exception(string.Format("Markers not in increasing BegPos order ({1});", mk.Name));
        maxBegPos = mk.Beg;
      }
    }
  }

  /// <summary>Knihovna pro zvukove mapy. Prevadi z stareho formatu (obalky, epa:tcrsmmstreamenvelope)
  /// do MediaPlayer scriptu (WMBasicEdit, Markers, Scripts),
  /// nacita MediaPlayer script do Markers objektu.</summary>
  public static class MarkersLib {
    /// <summary>Prevod MediaPlayer scriptu do Markers objektu.</summary>
    static Markers FileMap(string fileName) {
      XmlDocument doc = new XmlDocument();
      if (!File.Exists(fileName))
        throw new Exception(string.Format("Cannot find Sound File Map {0}", fileName));
      doc.Load(fileName);
      Markers res = new Markers(fileName);
      XmlNode pomNd;
      ResxFilesManager resx = new ResxFilesManager(fileName);
      XmlNodeList nodes = doc.SelectNodes(@"//Script[@Type=""LMEVENT""]");
      res.NoSound = nodes.Count == 0;
      if (res.NoSound) {
        nodes = doc.SelectNodes(@"//Script[@Type=""LMCAPTION""]");
        foreach (XmlNode nd in nodes) {
          Marker sm = new Marker();
          sm.Idx = res.Count;
          sm.Owner = res;
          res.Add(sm);
          sm.setTitle(nd.Attributes.GetNamedItem("Command").Value, resx);
        }
      } else
        foreach (XmlNode nd in nodes) {
          Marker sm = new Marker();
          sm.Idx = res.Count;
          sm.Owner = res;
          res.Add(sm);
          sm.Middle = long.Parse(nd.Attributes.GetNamedItem("Time").Value);
          sm.Name = nd.Attributes.GetNamedItem("Command").Value;
          pomNd = doc.SelectSingleNode(string.Format(@"//Script[@Type=""LMCAPTION"" and @Time={0}]", sm.Middle));
          sm.setTitle(pomNd.Attributes.GetNamedItem("Command").Value, resx);
          pomNd = doc.SelectSingleNode(string.Format(@"//Marker[@Name=""_{0}""]", sm.Name));
          sm.Beg = long.Parse(pomNd.Attributes.GetNamedItem("Time").Value);
          pomNd = doc.SelectSingleNode(string.Format(@"//Marker[@Name=""{0}_""]", sm.Name));
          sm.End = long.Parse(pomNd.Attributes.GetNamedItem("Time").Value);
        }
      return res;
    }
    public static Markers ReadFileMap(string fn) {
      lock (typeof(MarkersLib)) {
        Markers res = (Markers)CourseMan.fromCache(fn); if (res != null) return res;
        res = FileMap(fn);
        CourseMan.toCache(res, fn);
        return res;
      }
    }

    public static Markers ReadFileMapUrl(string url, bool checkWmaExist) {
      string fn = HostingEnvironment.MapPath(VirtualPathUtility.ToAbsolute(url));
      if (VirtualPathUtility.GetExtension(url) == ".xml") {
        fn += ".lmap";
        if (!File.Exists(fn))
          throw new Exception(string.Format("File {0} does not exist! (referenced from sound.file? or sound_dialog.file? atribute)", fn));
        return ReadFileMap(fn);
      }
      //if (!File.Exists(fn)) {
      //  if (checkWmaExist)
      //    throw new Exception(string.Format("File {0} does not exist! (referenced from sound.file? or sound_dialog.file? atribute)", fn));
      //  return null;
      //}
      if (!HTTPModule.Hack() && !File.Exists(fn.Replace(".wma", ".mp3")) && !File.Exists(fn))
        throw new Exception(fn);
      try {
        return ReadFileMap(fn + ".lmap");
      } catch (Exception exp) {
        throw new Exception(fn + ".lmap", exp);
      }
      /*if (checkWmaExist && !File.Exists(fn))
        throw new Exception(string.Format("File {0} does not exist! (referenced from sound.file? or sound_dialog.file? atribute)", fn));
      return ReadFileMap( fn + ".lmap");*/
    }

    /*public static string GetPath(SoundFilePathEnum type, string src)
    {
      if (src == string.Empty) return string.Empty;
      switch (type)
      {
        case SoundFilePathEnum.Markers:
          return HostingEnvironment.MapPath(src) + ".lmap";
        case SoundFilePathEnum.Url:
          switch (CourseMan.Config.SoundProtocol)
          {
            case SoundProtocolEnum.Http:
              return UrlManager.Authority + src;
            case SoundProtocolEnum.Local:
              return "file:///" + HostingEnvironment.MapPath(src);
            case SoundProtocolEnum.Mms:
              return "";
          }
          return "";
        case SoundFilePathEnum.JavaScriptUrl:
          return GetPath(SoundFilePathEnum.Url, src).Replace(@"\", @"\\");
      }
      return "";
    }*/
  }
}
