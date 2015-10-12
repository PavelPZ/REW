using System;
using System.Collections.Generic;
using System.Text;
using System.Web;
using System.Reflection;
using System.Xml.Serialization;
using System.Linq;
using System.Xml.Linq;

using LMNetLib;
using System.Configuration;
using System.IO;

namespace LMComLib {


  public class EALib {

    public static string EABasicPath = @"q:\LMNet2\WebApps\EduAuthorNew\";

    static public IEnumerable<string> EANewExercises(string fn /*q:\LMCom\LMCom\App_Data\Statistic_CourseStructure.xml*/) {
      return XElement.Load(fn).Descendants("module").
        Select(m => new { path = m.AttributeValue("spaceId") + "/" + m.AttributeValue("globalId").Replace("home.htm", null), exs = m.AttributeValue("childs").Split(',') }).
        SelectMany(d => d.exs.Select(e => e.ToLower()).Where(e => e.IndexOf("homehome") < 0 && e.IndexOf("reshome") < 0 && e.IndexOf("hometop") < 0).Select(e => d.path + e.Replace(".htm", null)));
    }

    static XElement lines;
    public static void lmComPages(urlInfo ui, LineIds line, out string url, out string title) {
      loadLines();
      try {
        XElement root = lines.Elements().
          Where(el => el.Attribute("site").Value == ui.Site && el.Attribute("lang").Value == ui.LangId.ToString() && el.Attribute("line").Value == line.ToString()).First();
        url = root.Attribute("url").Value;
        title = root.Attribute("title").Value;
      }
      catch {
        url = "about:blank";
        title = "fake";
      }
    }

    public static string lmComPages(string courseId, Langs lang, out string title) {
      loadLines();
      XElement root = lines.Elements().
        Where(el => el.Attribute("site").Value == "com" && el.Attribute("lang").Value == lang.ToString() && el.Attribute("line").Value == courseId.ToString()).FirstOrDefault();
      title = root.Attribute("title").Value;
      return root.Attribute("url").Value;
    }

    public static string myELandPage(Langs lang, out string title) {
      loadLines();
      XElement root = lines.Elements().
        Where(el => el.Attribute("site").Value == "com" && el.Attribute("lang").Value == lang.ToString() && el.Attribute("line").Value == "myELand").FirstOrDefault();
      title = root.Attribute("title").Value;
      return root.Attribute("url").Value;
    }


    static void loadLines() {
      if (lines == null)
        lock (typeof(EALib))
          if (lines == null)
            lines = XElement.Load(@"q:\LMNet2\WebApps\EduAuthorNew\app_data\lines.xml");
    }

    public static CourseIds DefaultCourseId(LineIds line) {
      switch (line) {
        case LineIds.English: return CourseIds.English;
        case LineIds.French: return CourseIds.French;
        case LineIds.German: return CourseIds.German;
        case LineIds.Chinese: return CourseIds.Chinese;
        case LineIds.Italian: return CourseIds.Italian;
        case LineIds.Russian: return CourseIds.Russian;
        case LineIds.Spanish: return CourseIds.Spanish;
        default: throw new Exception();
      }
    }

  }

  public class CourseInfo {
    //public ProductInfo Owner;
    public LineIds Line; //obor kurzu
    public CourseIds Id;
    public string[] Spaces;
  }

  /// <summary>
  /// Informace o titulu, ktere ziskava EADeployment aplikace z ~/Framework/ImsTitleModules.aspx?SpaceId= stranky
  /// </summary>
  public class TitleInfo {
    public string SpaceId;
    public string Title;
    public string Error;
    public ModuleInfo[] Modules;
  }
  /// <summary>
  /// Informace o modulu pro EADeployment aplikaci (cast TitleInfo)
  /// </summary>
  public class ModuleInfo {
    public string GlobalId;
    public string Title;
    public ParentInfo[] Parents;
  }
  /// <summary>
  /// Parent chain item modulu
  /// </summary>
  public class ParentInfo {
    public string GlobalId;
    public string Title;
  }

  public class ConfigNewEA : ConfigLow {
    public string ExerciseUrl; //format english1/l01/a/hueex0_l01_a01
    public new Langs CourseLang; //jazyk kurzu, pro English je to en_gb
    public CourseIds courseId; //kurz
    public bool isGrammar;
  }
  /// <summary>
  /// Config EADeployment aplikace. 
  /// Config je dostupny behem zpracovani requestu pomoci ConfigModule.actConfig (null, typeof(ConfigModule)
  /// </summary>
  public class ConfigLow {
    public ConfigLow() : base() { }
    public ConfigLow(ConfigLow parent) {
      Lang = parent.Lang;
      LMS = parent.LMS;
      DebugMode = parent.DebugMode;
      SoundPlayer = parent.SoundPlayer;
      Parent = parent;
    }
    protected static CourseIds?[] cIds = new CourseIds?[] { CourseIds.English, CourseIds.German, CourseIds.French, CourseIds.Italian, CourseIds.Spanish, CourseIds.Russian };
    /// <summary>Jazyk lokalizace </summary>
    public string Lang;
    public Langs LangId {
      get {
        return (Langs)Enum.Parse(typeof(Langs), Lang.Replace('-', '_'), true);
      }
    }
    /// <summary>Typ LMS modulu nebo urceni kurzu</summary>
    public LMSType LMS;
    /// <summary>Debug verze (JavaScript, ...)</summary>
    public bool DebugMode;
    public SoundPlayerType SoundPlayer;

    public bool? IsExternalGrammar;
    public bool IsExternalDict;
    public bool IsListenTalk;
    //XXX1
    //public Func<string,string> readNewFileIfExist; //
    public bool newFileExisted; //
    public virtual Langs CourseLang() { return Langs.no; }

    [XmlIgnore]
    public ConfigLow Parent;
    [XmlIgnore]
    public Config Owner;
    [XmlIgnore]
    public string Name;

    public ConfigLow Root {
      get {
        ConfigLow res = this;
        while (res.Parent != null) res = res.Parent;
        return res;
      }
    }

    public static void OnBeginRequest(HttpRequest req) {
      ConfigLow cfg;
      string hdr = HttpContext.Current.Request.Headers["Deploy-Config"];
      //Config:
      if (!string.IsNullOrEmpty(hdr)) {//run z EADeployment.exe (nastavuje Deploy-Config header)
        cfg = XmlUtils.StringToObject<Config>(Encoding.UTF8.GetString(Convert.FromBase64String(hdr))).Steps[0];
        if (!(cfg is ConfigOnlineCourse)) Machines.setIsLMCom(false);
      } else //... else run z browseru
        if (Machines.machine == "newbuild" || Machines.isPZComp()) //pro newbuild a PZ comp z DeploymentConfig.xml
          cfg = defaultConfig == null && File.Exists(HttpContext.Current.Server.MapPath("~/DeploymentConfig.xml")) ? defaultConfig = XmlUtils.FileToObject<Config>(HttpContext.Current.Server.MapPath("~/DeploymentConfig.xml")).Steps[0] : defaultConfig;
        else //... else server se natvrdo prepne do lm.com modu (pomoci Machines.setIsLMCom() nize).
          cfg = new ConfigOnlineCourse() { NotIsLMComCacheDeployment = true };
      //pro ConfigOnlineCourse konfig prepni do lm.com rezimu
      if (cfg is ConfigOnlineCourse) {
        Machines.setIsLMCom(true); cfg = ConfigLow.createLMComConfig((ConfigOnlineCourse)cfg, req);
      }
      //uloz
      HttpContext.Current.Items[c_configKey] = cfg;
    }

    public static ConfigLow actConfig(bool isException = true) {
      ConfigLow cfg = HttpContext.Current == null ? null : HttpContext.Current.Items[c_configKey] as ConfigLow;
      if (isException && cfg == null) throw new Exception();
      return cfg;
    } static ConfigLow defaultConfig;

    public static bool isLMComCacheDeployment() { ConfigCourse cc = actConfig() as ConfigCourse; return cc != null && cc.IsLMComCacheDeployment; }


    static ConfigLow createLMComConfig(ConfigOnlineCourse cfg, HttpRequest req) {
      urlInfo ui = new urlInfo(req);
      if (cfg != null && cfg.Lang != null && cfg.LangId != Langs.no) ui.LangId = cfg.LangId;
      ConfigCourse lmComActConfig = new ConfigCourse();
      lmComActConfig.Domain = ui.SiteId;
      lmComActConfig.IsLMComCacheDeployment = cfg != null && !cfg.NotIsLMComCacheDeployment;
      lmComActConfig.Lang = ui.Lang;
      lmComActConfig.LMS = LMSType.LMCom;
      lmComActConfig.ProductId = ui.EACourse;
      lmComActConfig.DebugMode = Machines.eaIsLMComDebugMode();
      lmComActConfig.IsListenTalk = true;
      lmComActConfig.SoundPlayer = ConfigurationManager.AppSettings["Sound"] == "HTML5" ? SoundPlayerType.HTML5 : SoundPlayerType.SL;
      lmComActConfig.ForceNotSandBox = cfg == null ? false : cfg.ForceNotSandBox;
      return lmComActConfig;
    } public static string c_configKey = Guid.NewGuid().ToString();

    public string toHeader() {
      Config cfg = new Config();
      cfg.Steps = new ConfigLow[] { this };
      return "Deploy-Config:" + Convert.ToBase64String(Encoding.UTF8.GetBytes(XmlUtils.ObjectToString(cfg)));
    }
    public virtual string fileName(string ext) {
      throw new Exception("Missing override");
    }
  }

  public class ConfigUrl : ConfigLow {
    public string Url;
    public string LogId;
  }

  /// <summary>
  /// Config pro jeden modul
  /// </summary>
  public class ConfigModule : ConfigLow {
    public ConfigModule() : base() { }
    public ConfigModule(ConfigLow parent, ModuleInfo modInfo)
      : base(parent) {
      Info = modInfo;
      SpaceId = ((ConfigTitle)parent).SpaceId;
      GlobalId = modInfo.GlobalId;
    }
    public override Langs CourseLang() {
      CourseIds? crsId = cIds.FirstOrDefault(c => SpaceId.ToLower().StartsWith(c.ToString().ToLowerInvariant())); if (crsId == null) return Langs.no;
      return CommonLib.CourseIdToLang((CourseIds)crsId);
    }
    /// <summary>SpaceId modulu</summary>
    public string SpaceId;
    /// <summary>GloalId modulu</summary>
    public string GlobalId;
    public bool ForMoodleCourse;
    //public bool? IsExternalGrammar;
    //public bool IsExternalDict;
    //public bool IsListenTalk;

    [XmlIgnore]
    public ModuleInfo Info;
    /// <summary>
    /// cesta pro ulozeni souboru s modulem
    /// </summary>
    /// <param name="ext">extenze</param>
    /// <returns></returns>
    public override string fileName(string ext) {
      //if (string.IsNullOrEmpty(DestPath))
      return string.Format(@"{0}\{1}\{2}{3}", Lang, SpaceId, GlobalId, ext == null ? ".zip" : ext);
      //else
      //return string.Format(@"{0}\{1}\{2}{3}", DestPath, SpaceId, GlobalId, ext == null ? ".zip" : ext);
    }

  }

  public class ConfigCourseLow : ConfigLow {
    public ConfigCourseLow() { }
    public ConfigCourseLow(Domains domain, string lang, CourseIds crs, LMSType lms) {
      Domain = domain;
      Lang = lang;
      ProductId = crs;
      LMS = lms;
    }

    public Domains Domain;
    public CourseIds ProductId;
    //ProductInfo prodInfo;
    //[XmlIgnore]
    //public ProductInfo ProdInfo {
    //  get {
    //    if (prodInfo != null) return prodInfo;
    //    foreach (ProductInfo prod in ProductInfos.Instance.Items)
    //      if (prod.Id == ProductId) { prodInfo = prod; return prodInfo; }
    //    //throw new Exception (ProductInfos.Instance.Items.Select(pr => pr.Id.ToString()).Aggregate((r,i) => r + ", " + i));
    //    //throw new Exception("Cannot find ProdInfo: " + ProductId.ToString() + "(ProductInfos.Instance.Items.Length=" + ProductInfos.Instance.Items.Length + ")");
    //    throw new Exception("Cannot find ProdInfo: " + ProductId.ToString());
    //  }
    //}
    public override string fileName(string ext) {
      return string.Format(@"{0}\{1}\{2}{3}", LMS, Lang, ProductId, ext == null ? ".zip" : ext);
    }

    public override Langs CourseLang() {
      return CommonLib.CourseIdToLang(ProductId);
    }
  }


  /// <summary>
  /// Kurz
  /// </summary>
  public class ConfigCourse : ConfigCourseLow {
    public const string armadillo_Prefix = "36148A2_";

    public ConfigCourse() { }
    public ConfigCourse(Domains domain, string lang, CourseIds crs)
      : base(domain, lang, crs, LMSType.NewEE) {
    }

    public string MACName = "LANGMaster";
    public bool Protected = true;
    public int SubProductId = -1;
    public bool MakeUpdate = true;
    public override string fileName(string ext) {
      return "";
      /*if (string.IsNullOrEmpty(DestPath))
        return string.Format(@"{0}\{1}\{2}{3}", LMS, Lang, ProductId, ext == null ? ".zip" : ext);
      else
        return string.Format(@"{0}\{1}{2}", DestPath, ProductId, ext == null ? ".zip" : ext);*/
    }
    //pro EA lm.com deployment je false: misto 
    public bool IsLMComCacheDeployment;
    public bool ForceNotSandBox;
  }

  public class ConfigMoodleCourse : ConfigCourseLow {
    public ConfigMoodleCourse() { }
    public ConfigMoodleCourse(Domains domain, string lang, CourseIds crs, LMSType lms)
      : base(domain, lang, crs, lms) {
    }
    public string TreeFragmentPath;
    [XmlIgnore]
    public MoodleCourseItem Tree;
    [XmlIgnore]
    public List<ConfigModule> Modules = new List<ConfigModule>();
    public void finish() {
    }
  }

  public class ConfigOnlineCourse : ConfigCourseLow {
    public ConfigOnlineCourse() : this(Domains.no, null, CourseIds.no, LMSType.no) { }
    public ConfigOnlineCourse(Domains domain, string lang, CourseIds crs, LMSType lms)
      : base(domain, lang, crs, lms) {
      IsExternalDict = true; IsExternalGrammar = true; IsListenTalk = true;
    }
    //v Q:\LMNet2\WebApps\eduauthornew\DeploymentConfig.xml se nastavi na true, kdyz chci testovat EA v lm.com mode na domene eduAuthorNew
    public bool NotIsLMComCacheDeployment;
    public bool ForceNotSandBox;
  }

  /// <summary>
  /// LMS Kurz
  /// </summary>
  public class ConfigLmsCourse : ConfigCourseLow {
    public ConfigLmsCourse() { }
    public ConfigLmsCourse(Domains domain, string lang, CourseIds crs, LMSType lms)
      : base(domain, lang, crs, lms) {
    }
    public bool? SmallOnly;
    //public bool? IsExternalGrammar;
    //public bool IsExternalDict;
    //public bool IsListenTalk;

    [XmlIgnore]
    public bool firstModule = true;
    [XmlIgnore]
    public List<ConfigTitle> Titles = new List<ConfigTitle>();
    //public void finish() {
    //  foreach (CourseInfo crs in ProdInfo.Courses)
    //    foreach (string sp in crs.Spaces)
    //      Titles.Add(new ConfigTitle(this, sp) { IsExternalGrammar = IsExternalGrammar, IsExternalDict = IsExternalDict, IsListenTalk = IsListenTalk });
    //}
  }
  /// <summary>
  /// Titul jako seznam modulu, pro MOODLE, LMS
  /// </summary>
  public class ConfigTitle : ConfigLow {
    public ConfigTitle() : base() { }
    public ConfigTitle(ConfigLow parent, string spaceId)
      : base(parent) {
      SpaceId = spaceId;
    }
    public string SpaceId;
    //public bool? IsExternalGrammar;
    //public bool IsExternalDict;
    //public bool IsListenTalk;
    [XmlIgnore]
    public List<ConfigModule> Modules = new List<ConfigModule>();
    [XmlIgnore]
    public TitleInfo titleInfo;
    public void finish(TitleInfo tit) {
      if (tit == null) return;
      foreach (ModuleInfo mod in tit.Modules)
        Modules.Add(new ConfigModule(this, mod) { IsExternalGrammar = IsExternalGrammar, IsExternalDict = IsExternalDict, IsListenTalk = IsListenTalk });
    }
    public string dirName() {
      return string.Format(@"{0}\{1}", Lang, SpaceId);
    }
    public override Langs CourseLang() {
      CourseIds? crsId = cIds.FirstOrDefault(c => SpaceId.ToLower().StartsWith(c.ToString().ToLowerInvariant())); if (crsId == null) return Langs.no;
      return CommonLib.CourseIdToLang((CourseIds)crsId);
    }
  }

  /// <summary>
  /// Seznam vice titulu pro MOODLE, LMS
  /// </summary>
  public class ConfigTitles : ConfigLow {
    public string[] SpaceIds;
    [XmlIgnore]
    public List<ConfigTitle> Titles = new List<ConfigTitle>();
    public void finish() {
      if (SpaceIds == null) return;
      foreach (string si in SpaceIds)
        Titles.Add(new ConfigTitle(this, si));
    }
  }


  public class Config {
    public Domains[] Sites;
    public CourseIds[] Products;
    public string[] Langs;
    public LMSType[] Lms;
    public void Finish(SiteInfos sites) {
      if (Steps != null) return;
      foreach (SiteInfo si in sites.Items) {
        if (Sites != null && Array.IndexOf<Domains>(Sites, si.Id) < 0) continue;
        if (si.Langs != null) foreach (string lang in si.Langs) {
            if (Langs != null && Array.IndexOf<string>(Langs, lang) < 0) continue;
            if (si.Products != null) foreach (CourseIds crs in si.Products) {
                if (Products != null && Array.IndexOf<CourseIds>(Products, crs) < 0) continue;
                if (si.Lms != null) foreach (LMSType lms in si.Lms) {
                    if (Lms != null && Array.IndexOf<LMSType>(Lms, lms) < 0) continue;
                    ConfigLow cfg = null;
                    switch (lms) {
                      case LMSType.NewEE: cfg = new ConfigCourse(si.Id, lang, crs); break;
                      case LMSType.Moodle: cfg = new ConfigLmsCourse(si.Id, lang, crs, lms); break;
                      default: continue;
                    }
                    if (Steps == null) Steps = new ConfigLow[1]; else Array.Resize<ConfigLow>(ref Steps, Steps.Length + 1);
                    Steps[Steps.Length - 1] = cfg;
                  }
              }
          }
      }
    }
    [XmlArrayItem(typeof(ConfigModule))]
    [XmlArrayItem(typeof(ConfigTitle))]
    [XmlArrayItem(typeof(ConfigTitles))]
    [XmlArrayItem(typeof(ConfigCourse))]
    [XmlArrayItem(typeof(ConfigLmsCourse))]
    [XmlArrayItem(typeof(ConfigLow))]
    [XmlArrayItem(typeof(ConfigOnlineCourse))]
    [XmlArrayItem(typeof(ConfigUrl))]
    public ConfigLow[] Steps;
    //public string LogFile;
    //[XmlIgnore]
    //public string Name;
  }

}
