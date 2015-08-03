using HtmlAgilityPack;
using LMNetLib;
using LMScormLibDOM;
using System;
using System.Collections;
using System.Collections.Generic;
using System.Drawing;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Reflection;
using System.Resources;
using System.Text;
using System.Threading;
using System.Web;

namespace LMScormLib {
  public class imgProps {
    public const string imgHtmlMask = @"<img {0} width=""{1}"" height=""{2}"" align=""{3}"" class=""{4}"" alt="""" {5} />";
    public const string imgHtmlMaskWidth = @"<img {0} width=""{1}"" align=""{2}"" class=""{3}"" alt="""" {4} />";
    public const string imgHtmlMaskHeight = @"<img {0} height=""{1}"" align=""{2}"" class=""{3}"" alt="""" {4} />";
    public const string imgHtmlMaskNoWH = @"<img {0} align=""{1}"" class=""{2}"" alt="""" {3} />";
    
    static public imgProps getImgProps(img img) {
      //string fn = HttpContext.Current.Server.MapPath(img.absoluteUrl);
      string fn = LMComLib.EaUrlInfoLib.MapPath(img.absoluteUrl);
      lock (typeof(imgProps)) {
        imgProps res = (imgProps)CourseMan.fromCache(fn);
        if (res != null) {
          //aby fungovalo resize v design time
          res.myImg.width = img.width;
          res.myImg.height = img.height;
          //if (dbInfo.myImg.width != img.width || dbInfo.myImg.height != img.height)
          //throw new Exception(string.Format("File {0}, referenced in {1} and {2}, has multiple width or height.", fn, img.ErrorId, dbInfo.myImg.ErrorId));
          return res;
        }
        res = new imgProps(img, fn);
        if (res.width > 0)
          CourseMan.toCache(res, fn);
        return res;
      }
    }
    imgProps(img img, string fn) {
      myImg = img; width = 0; height = 0;
      string appPath = img.absoluteUrl;
      if (!File.Exists(fn)) {
        if (CourseMan.Config.IgnoreWmaBmpFileExist) return;
        throw new Exception(string.Format("File {0}, referenced in {1}, does not exist.", fn, img.ErrorId));
      }
      System.Drawing.Bitmap bmp = new Bitmap(fn);
      width = bmp.Width;
      height = bmp.Height;
    }
    public img myImg;
    public int width;
    public int height;
    public bool needsResize {
      get {
        if (myImg.width != 0 && myImg.width != width) return true;
        if (myImg.height != 0 && myImg.height != height) return true;
        return false;
      }
    }
    public string toHtml(string absolutePath) {
      string rel, absSrc;
      if (LMScormLib.HTTPModule.Hack()) {
        rel = null;
        absSrc = myImg.absoluteUrl;
        var idx = absSrc.Substring(1).IndexOf("/");
        absSrc = absSrc.Substring(idx + 2); //napr. english1/img/coursebook/lesson01/page08/s8_2.gif
        absSrc = "src=\"" + absSrc + "\"";
      } else {
        rel = "src=\"" + VirtualPathUtility.MakeRelative(absolutePath, myImg.absoluteUrl) + "\""; ;
        absSrc = null;
      }
      if (myImg.width != 0 && myImg.height != 0)
        return string.Format(imgHtmlMask, rel, width, height, myImg.align, myImg.classname, absSrc);
      if (myImg.width != 0)
        return string.Format(imgHtmlMaskWidth, rel, myImg.width, myImg.align, myImg.classname, absSrc);
      if (myImg.height != 0)
        return string.Format(imgHtmlMaskHeight, rel, myImg.height, myImg.align, myImg.classname, absSrc);
      return string.Format(imgHtmlMaskNoWH, rel, myImg.align, myImg.classname, absSrc);
    }
  }
  /// <summary>Rozsireni LMLiteral o lokalizovatelnost</summary>
  public class LocalizeExtension {
    public Dictionary<string, string> datas; //data pro kazdy jazyk
    public string data; //data pro difotni jazyk nebo neni co lokalizovat
    public Dictionary<string, imgProps> paths; // ~/.. cesty, v datech se nahradi relativni cestou
    public List<img> images;
    string text() {
      return text(Thread.CurrentThread.CurrentUICulture.Name);
    }
    public string text(string lang) {
      string txt;
      if (datas == null || !datas.TryGetValue(lang.ToLower(), out txt))
        txt = data;
      if (paths != null && paths.Count > 0)
        return LowUtils.FormatEx(txt, delegate(string id) {
          imgProps res;
          return paths.TryGetValue(id, out res) ? res.toHtml(HttpContext.Current.Request.Url.AbsolutePath) : null;
        }, new StringBuilder());
      else
        return txt;
    }
    public string Text {
      get { return text(); }
    }
  }

  /// <summary>
  /// Spravce vsech jazykovych resx k jednomu LMData. Take pomaha vytvaret lokalizovatelny LMLiteral
  /// </summary>
  public class ResxFilesManager {
    const string defaultLang = "default";
    Dictionary<string, string> defaultResX;

    Dictionary<string, Dictionary<string, string>> files = new Dictionary<string, Dictionary<string, string>>(); //pro kazdy jazyk: key-value z ResX souboru
    public Dictionary<string, StringBuilder> buffs = new Dictionary<string, StringBuilder>();
    Dictionary<string, imgProps> pathsBuf = new Dictionary<string, imgProps>();
    public bool hasTransObject;
    List<img> images = new List<img>();

    Dictionary<string, string> readResX(string fn) {
      Dictionary<string, string> res = new Dictionary<string, string>();
      using (ResXResourceReader rdr = new ResXResourceReader(fn))
        foreach (DictionaryEntry de in rdr)
          res.Add((string)de.Key, (string)de.Value);
      return res;
    }
    public ResxFilesManager(string fileName) {
      string fn = Path.GetFileName(fileName);
      string dir = Path.GetDirectoryName(fileName);
      string fileMask = dir + @"\App_LocalResources";
      int idx = fn.IndexOf(".htm");
      if (idx >= 0) fn = fn.Substring(0, idx + 4);
      if (Directory.Exists(fileMask)) {
        fileMask += @"\" + fn;
        foreach (string resxFn in Directory.GetFiles(dir + @"\App_LocalResources", Path.GetFileName(fileMask) + "*.resx")) {
          string lang = resxFn.Substring(fileMask.Length + 1);
          if (lang.Length <= 4) continue; //
          lang = lang.Length > 4 ? lang.Substring(0, lang.Length - 5) : defaultLang;
          lang = lang.ToLower();
          files.Add(lang, readResX(resxFn));
          buffs.Add(lang, new StringBuilder());
        }
      }
      if (!files.TryGetValue(defaultLang, out defaultResX)) {
        defaultResX = new Dictionary<string, string>();
        files.Add(defaultLang, defaultResX);
        buffs.Add(defaultLang, new StringBuilder());
      }
    }
    public bool isEmpty() {
      return buffs.Count == 0;
    }
    public void Clear() {
      foreach (KeyValuePair<string, StringBuilder> kp in buffs)
        kp.Value.Length = 0;
      hasTransObject = false;
      pathsBuf.Clear();
      images.Clear();
    }
    public LMLiteral propertyTolocalizedLiteral(LocalizeLMData.TranslateInfo info, string defaultValue) {
      Clear();
      //append(info.Obj.UniqueId, info.Field.Name.Substring(LocalizeLMData.localizePrefix.Length), defaultValue);
      append(info.Obj.varName, info.Field.Name.Substring(LocalizeLMData.localizePrefix.Length), defaultValue);
      return toLocalizedLiteral();
    }
    public LMLiteral toLocalizedLiteral() {
      LMLiteral res = new LMLiteral();
      LocalizeExtension ext = new LocalizeExtension();
      if (pathsBuf.Count > 0) {
        ext.paths = new Dictionary<string, imgProps>(pathsBuf);
        ext.images = new List<img>(images);
      }
      ext.data = buffs[defaultLang].ToString();
      if (hasTransObject) {
        ext.datas = new Dictionary<string, string>();
        foreach (KeyValuePair<string, StringBuilder> kp in buffs)
          if (kp.Key != defaultLang)
            ext.datas.Add(kp.Key, kp.Value.ToString());
      }
      res.Extension = ext;
      return res;
    }
    public static string resxId(string ui, string fieldName) {
      return string.Format("T{0}{1}", ui, fieldName);
    }
    public void append(string ui, string fieldName, string defaultValue) {
      appendKey(resxId(ui, fieldName), defaultValue);
    }
    public void appendKey(string key, string defaultValue) {
      hasTransObject = true;
      foreach (KeyValuePair<string, StringBuilder> kp in buffs) {
        Dictionary<string, string> rdr = files[kp.Key];
        string val;
        if (!rdr.TryGetValue(key, out val) && !defaultResX.TryGetValue(key, out val))
          val = defaultValue;
        kp.Value.Append(val);
      }
    }
    public void append(string val) {
      foreach (KeyValuePair<string, StringBuilder> kp in buffs)
        kp.Value.Append(val);
    }
    public void append(img img) {
      images.Add(img);
      string id = resxId(img.varName, null);
      pathsBuf.Add(id, imgProps.getImgProps(img));
      foreach (KeyValuePair<string, StringBuilder> kp in buffs)
        kp.Value.Append(string.Concat("[#", id, "#]"));
    }
  }

  public static class LocalizeLMData {
    public const string localizePrefix = "local";
    const string localizeStringPrefix = "$trans;";
    static StringBuilder buf = new StringBuilder();
    static Dictionary<string, bool> inlineTags = new Dictionary<string, bool>();
    const string tags = "A ABBR ACRONYM B BASEFONT BDO BIG CITE CODE DFN EM FONT I IMG INPUT KBD LABEL Q S SAMP SELECT SMALL SPAN STRIKE STRONG SUB SUP TEXTAREA TT U VAR";
    static LocalizeLMData() {
      foreach (string tag in tags.ToLower().Split(' '))
        inlineTags.Add(tag, true);
    }

    static string localizeKey = Guid.NewGuid().ToString();
    public static void adjustThreadCulture() {
      if (HttpContext.Current == null || HttpContext.Current.Items.Contains(localizeKey)) return;
      HttpContext.Current.Items.Add(localizeKey, true);
      CultureInfo cult = Thread.CurrentThread.CurrentUICulture;
      //Neutral culture
      string lng = cult.Name == "" ? "en" : (cult.IsNeutralCulture ? cult.Name : cult.Parent.Name);
      //Prevod Neutral -> specific:
      switch (lng) {
        case "en": lng = "en-GB"; break;
        case "de": lng = "de-DE"; break;
        default: lng = CultureInfo.CreateSpecificCulture(lng).Name; break;
      }
      if (cult.Name != lng) {
        Thread.CurrentThread.CurrentCulture = new CultureInfo(lng);
        Thread.CurrentThread.CurrentUICulture = Thread.CurrentThread.CurrentCulture;
      }
    }
    static LMLiteral createLiteral(string txt) {
      LMLiteral res = new LMLiteral();
      res.text = txt;
      return res;
    }
    static bool tryTransText(trans tr, out string txt) {
      txt = null;
      if (tr.Items == null || tr.Items.Length != 1 || !(tr.Items[0] is LMLiteral)) return false;
      LMLiteral lit = (LMLiteral)tr.Items[0];
      if (string.IsNullOrEmpty(lit.text)) return false;
      txt = lit.text;
      return true;
    }
    /// <summary>
    /// Prevod nelokalizovaneho seznamu LMLiteral, Img, Trans a LMScormObj objektu na lokalizovane LMLiterals
    /// </summary>
    static IEnumerable<LMScormObj> localizeObjectList(object[] objs, StringBuilder buf, ResxFilesManager resx) {
      resx.Clear();
      if (objs == null || objs.Length == 0) yield break;
      foreach (LMScormObj item in objs) {
        if (item is LMLiteral)
          resx.append(((LMLiteral)item).text);
        else if (item is img)
          resx.append((img)item);
        else if (item is trans) {
          string txt;
          if (tryTransText((trans)item, out txt))
            resx.append(item.varName, null, txt);
        } else {
          if (!resx.isEmpty()) {
            yield return resx.toLocalizedLiteral();
            resx.Clear();
          }
          yield return item;
        }
      }
      if (!resx.isEmpty())
        yield return resx.toLocalizedLiteral();
    }

    /// <summary>
    /// lokalizace objektu (LMData souboru)
    /// </summary>
    public static void Localize(lm_scorm root) {
      if (HttpContext.Current == null) return;
      adjustThreadCulture();
      StringBuilder buf = new StringBuilder();
      ResxFilesManager resx = new ResxFilesManager(root.PageInfo.FileName);
      if (resx == null) return;
      object[] objs;
      foreach (TranslateInfo info in toTranslate(root, new TranslateInfo()))
        switch (info.Typ) {
          case LocalizeType.string2string:
            //Lokalizovatelna String property, vysledkem lokalizace je lokalizovatelny LMLiteral
            string valStr = (string)info.Value;
            if (string.IsNullOrEmpty(valStr)) break;
            if (!valStr.StartsWith(localizeStringPrefix))
              info.setValue(createLiteral(valStr));
            else
              info.setValue(resx.propertyTolocalizedLiteral(info, valStr.Substring(localizeStringPrefix.Length)));
            break;
          case LocalizeType.items2string:
            //HTML: vysledkem lokalizace je jeden lokalizovatelny LMLiteral
            objs = (object[])info.Value;
            if (objs.Length == 0) break;
            if (objs.Length == 1 && objs[0] is LMLiteral)
              info.setValue(objs[0]);
            else {
              bool first = true;
              foreach (object res in localizeObjectList(objs, buf, resx)) {
                if (!first || !(res is LMLiteral)) throw new Exception();
                first = true;
                info.setValue(res);
              }
            }
            break;
          case LocalizeType.items2items:
            //HTML a LMScormObj: vysledkem lokalizace je seznam lokalizovatelnych LMLiteral a LMScormObj
            objs = (object[])info.Value;
            if (objs.Length == 0) break;
            bool noLocalize = true;
            foreach (LMScormObj item in objs)
              if (item is trans || item is img) {
                noLocalize = false; break;
              }
            if (noLocalize)
              info.setValue(objs);
            else {
              List<LMScormObj> items = new List<LMScormObj>();
              foreach (LMScormObj res in localizeObjectList(objs, buf, resx))
                items.Add(res);
              LMScormObj[] resObjs = new LMScormObj[items.Count];
              items.CopyTo(resObjs);
              info.setValue(resObjs);
            }
            break;
        }
    }

    /// <summary>
    /// jedna lokalizovatelna property jednoho objektu
    /// </summary>
    public class TranslateInfo {
      public void Fill(LocalizeType typ, LMScormObj obj, FieldInfo field, object value) {
        Value = value; Typ = typ; Obj = obj; Field = field;
      }
      public LocalizeType Typ;
      public LMScormObj Obj;
      public FieldInfo Field;
      public object Value;
      public void setValue(object val) {
        Field.SetValue(Obj, val);
      }
    }

    /// <summary>
    /// Pro jeden LMData objekt (soubor) vraci seznam properties k lokalizaci
    /// </summary>
    static IEnumerable<TranslateInfo> toTranslate(lm_scorm root, TranslateInfo buf) {
      foreach (LMScormObj obj in LMScormObj.GetAll(root)) {
        foreach (FieldInfo fi in obj.GetType().GetFields()) {
          object[] attrs = fi.GetCustomAttributes(typeof(LMScormLibDOM.LocalizedProperty), true);
          if (attrs == null || attrs.Length == 0) continue;
          LocalizedProperty attr = (LocalizedProperty)attrs[0];
          if (!fi.Name.StartsWith(localizePrefix)) throw new Exception();
          string nm = fi.Name.Substring(localizePrefix.Length);
          PropertyInfo prop = obj.GetType().GetProperty(nm);
          if (prop == null)
            if (attr.canMiss) continue; else throw new Exception();
          object val = prop.GetValue(obj, null);
          if (val == null) continue;
          buf.Fill(attr.Type, obj, fi, val);
          yield return buf;
        }
      }
    }

    public static bool LMap2ResX(Markers markers, processStringsEvent onProcessString) {
      string txt = null; Dictionary<string, object> props = new Dictionary<string, object>();
      List<string> keys = new List<string>();
      List<string> values = new List<string>();
      for (int i = 0; i < markers.Count; i++) {
        Marker mark = markers[i];
        props.Clear();
        Marker.decodeText(mark.RawTitle, ref txt, ref props);
        if (props.Count == 0) continue;
        foreach (KeyValuePair<string, object> kv in props) {
          if (kv.Key[0] != 't') continue;
          keys.Add(string.Format("{0}_{1}", kv.Key, i));
          values.Add((string)kv.Value);
        }
      }
      return onProcessString(keys, values);
      //return createResx(fileName, keys, values);
    }

    public delegate bool processStringsEvent(List<string> keys, List<string> values);

    public static bool createResx(string fileName, List<string> keys, List<string> values) {
      string fn = Path.GetFileName(fileName);
      string dir = Path.GetDirectoryName(fileName);
      fileName = dir + @"\App_LocalResources\" + fn + ".resx";
      if (keys.Count <= 0) { if (File.Exists(fileName)) File.Delete(fileName); return false; }
      LowUtils.AdjustFileDir(fileName);
      using (ResXResourceWriter wr = new ResXResourceWriter(fileName))
        for (int i = 0; i < keys.Count; i++)
          wr.AddResource(keys[i], values[i]);
      return true;
    }

    /*public static bool dumpResx(TextWriter wr, List<string> keys, List<string> values)
    {
      if (keys.Count <= 0) return false;
      for (int i = 0; i < keys.Count; i++)
        wr.AddResource(keys[i], values[i]);
      return true;
    }*/
    /// <summary>
    /// Vytvoreni ResX z LMData.
    /// </summary>
    public static bool LMData2ResX(lm_scorm root, processStringsEvent onProcessString) {
      List<string> keys = new List<string>();
      List<string> values = new List<string>();
      TranslateInfo buf = new TranslateInfo();
      foreach (TranslateInfo info in toTranslate(root, buf))
        switch (info.Typ) {
          case LocalizeType.string2string:
            string valStr = (string)info.Value;
            if (string.IsNullOrEmpty(valStr) || !valStr.StartsWith(localizeStringPrefix)) continue;
            keys.Add(ResxFilesManager.resxId(info.Obj.varName, info.Field.Name.Substring(localizePrefix.Length)));
            //string.Format("Ui{0}_{1}", info.Obj.UniqueId, info.Field.Name.Substring(localizePrefix.Length)));
            values.Add(valStr.Substring(localizeStringPrefix.Length));
            break;
          case LocalizeType.items2string:
          case LocalizeType.items2items:
            object[] objs = (object[])info.Value;
            foreach (LMScormObj item in objs)
              if (item is trans) {
                string txt;
                if (!tryTransText((trans)item, out txt)) continue;
                keys.Add(ResxFilesManager.resxId(item.varName, null));
                values.Add(txt);
              }
            break;
        }
      return onProcessString(keys, values);
      //return createResx(fileName, keys, values);
    }

    public static void HTMLtoXML(string fn) {
      //string s = replaceCharElements(StringUtils.FileToString(fn));
      HtmlDocument htmlDoc = new HtmlDocument();
      htmlDoc.Load(fn);
      var errors = htmlDoc.ParseErrors;
      if (errors.Count() > 0) {
        string err = "";
        foreach (HtmlParseError e in errors) {
          if (e.Reason.IndexOf("</option>") >= 0) continue;
          err = err + "; " + string.Format("Line {0}, Position {1}, Code {2}, {3}", e.Line, e.LinePosition, e.Code, e.Reason);
        }
        if (err != "") throw new Exception("HtmlDocument " + err);
      }
      HtmlNodeCollection col = htmlDoc.DocumentNode.ChildNodes;
      for (int i = col.Count - 1; i >= 0; i--)
        if (col[i].NodeType != HtmlNodeType.Element)
          htmlDoc.DocumentNode.RemoveChild(col[i]);
      htmlDoc.OptionOutputAsXml = true;
      htmlDoc.OptionReadEncoding = false;
      htmlDoc.OptionDefaultStreamEncoding = Encoding.UTF8;
      //htmlDoc.OptionWriteXmlProcessingInstruction = false;
      htmlDoc.Save(fn);
    }
  }
}
