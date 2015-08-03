using System;
using System.Linq;
using System.Data;
using System.Configuration;
using System.Collections.Generic;
using System.Xml;
using System.Xml.Serialization;
using System.IO;
using System.Reflection;
using System.Web;
using System.Web.Security;
using System.Web.UI;
using System.Web.UI.WebControls;
using System.Web.UI.WebControls.WebParts;
using System.Web.UI.HtmlControls;
using System.Web.Hosting;

using LMNetLib;
using LMScormLibDOM;
using System.Xml.Linq;
using System.Collections.Specialized;
using LMComLib;

namespace LMScormLib {
  /*public enum ProjectId
  {
    unknown,
    CHN,
    RUS,
    OLD,
    LNG,
  }

  public class ProjectInfo
  {
    public ProjectId compId;
    public string Spaces;
    public bool IsOldToNew;
    public string Lang = "en-GB";
  }*/

  public static class CourseMan {
    /// <summary>Debug priznak: pri true se ignoruji compile-time kontroly</summary>
    public static bool IgnoreCompileData = true;
    /// <summary>Generace ResX souboru pro LMDATA</summary>
    //public static bool IgnoreLMData2ResX = true;
    public static void Init() {
      //Config = (CourseCfg)ConfigurationManager.GetSection("CourseCfg");
      //Config.Finish();
      Config = new CourseCfg();
      Config.IgnoreValidation = false;
      Config.Log = true;
      //Config.IgnoreWmaBmpFileExist = false;
      Config.IgnoreWmaBmpFileExist = true;
    }
    public static CourseCfg Config;

    internal static void toCache(object obj, string fn) {
      if (HttpContext.Current == null) return;
      HttpContext.Current.Cache.Insert(fn.ToLower(), obj, new System.Web.Caching.CacheDependency(fn));
    }
    internal static object fromCache(string fn) {
      return HttpContext.Current == null ? null : HttpContext.Current.Cache[fn.ToLower()];
    }
  }
  public enum SoundProtocolEnum {
    Http,
    Mms,
    Local,
  }
  /// <summary>Config LMS generace</summary>
  public class CourseCfg {
    public bool Log;
    public bool IgnoreValidation;
    public bool IgnoreWmaBmpFileExist;
    //public string SpaceId;
    //public TxCfgSpaceLine Line;
    //public int RunInfoId; //SpaceInstanceId,SpaceInfoId,TitleInfoId,ExtraSpaceMemberId;
    //public string PlanGlobalId;
    //public bool Debug;
    //public SoundProtocolEnum SoundProtocol;
    //public bool ForEE;
    //public 
    //ProjectInfo[] Projects;
    //Project management
    /*internal void Finish()
    {
      if (Projects == null) return;
      foreach (ProjectInfo pr in Projects)
      {
        foreach (string space in pr.Spaces.Split(','))
          if (!SpaceToProject.ContainsKey(space.ToLower()))
            SpaceToProject.Add(space.ToLower(), pr);
        if (!IdToInfo.ContainsKey(pr.compId))
          IdToInfo.Add(pr.compId, pr);
      }
    }*/
    //[XmlIgnore]
    //public 
    //Dictionary<string, ProjectInfo> SpaceToProject = new Dictionary<string, ProjectInfo>();
    //[XmlIgnore]
    //public 
    //Dictionary<ProjectId, ProjectInfo> IdToInfo = new Dictionary<ProjectId, ProjectInfo>();
    //public 
    /*ProjectInfo ProjectFromFileName(string fileName)
    {
      pageInfo pi;
      lm_scorm.infoFromFileName(fileName, out pi);
      return pi.Project;
    }*/
  }

  public static class Lib {

    static Lib() {
      if (SeeAlsoLinks == null) lock (typeof(Lib)) if (SeeAlsoLinks == null) {
            SeeAlsoLinks = new NameValueCollection();
            SeeAlsoLinksRoot = XElement.Load(HttpContext.Current.Server.MapPath(@"~/app_data/SeeAlsoLinks.xml"));
            foreach (XElement el in SeeAlsoLinksRoot.Element("grammar").Elements())
              SeeAlsoLinks.Add("~/" + el.AttributeValue("FromUrl"), "~/" + el.AttributeValue("ToUrl"));
          }
    }

    public static IEnumerable<CourseModel.seeAlsoLink> seeAlsoLinks(SiteMapNode from, bool forEA = false) {
      string url = VirtualPathUtility.ToAppRelative(from.Url).ToLower();
      string[] links = SeeAlsoLinks.GetValues(url);
      if (links == null) yield break;
      foreach (var nd in links.Select(s => SiteMap.Provider.FindSiteMapNode(s))) yield return new CourseModel.seeAlsoLink { url = url = forEA ? forEAUrl(nd.Url) : nd.Url, title = nd.Title };
      //return links == null ? Enumerable.Empty<schools.seeAlsoLink>() : links.Select(s => SiteMap.Provider.FindSiteMapNode(s)).Select(n => new schools.seeAlsoLink() { url = forEA ? forEAUrl(n.Url) : n.Url, title = n.Title });
    }
    static string forEAUrl(string url) { var parts = url.Split(new char[] { '/' }, 3); return "lm/oldea/" + parts[2].ToLower().Replace(".htm",null); }
    public static NameValueCollection SeeAlsoLinks;
    public static XElement SeeAlsoLinksRoot;

    /*public static TxPlan SiteMapToPlan()
    {
      TxPlan dbInfo = new TxPlan();
      dbInfo.Line = CourseMan.Config.Line;
      dbInfo.Title = SiteMap.RootNode.Title;
      dbInfo.MyTitle = dbInfo.Title;
      dbInfo.HomeUrl = EpaUrl(SiteMap.RootNode.Url, "epa://{0}/{1}");
      dbInfo.LmsMaterials = null;
      SiteMapToPlan(SiteMap.RootNode, dbInfo);
      return dbInfo;
    }
    static void SiteMapToPlan(SiteMapNode siteNode, TxPlanNode planNode)
    {
      if (!siteNode.HasChildNodes) return;
      foreach (SiteMapNode siteNd in siteNode.ChildNodes)
      {
        TxPlanNode planNd = new TxPlanNode();
        planNd.Title = siteNd.Title;
        planNd.NodeId = EpaUrl(siteNd.Url, "ee~{0}~{1}");
        planNode.Items.Add(planNd);
        SiteMapToPlan(siteNd, planNd);
      }
    }*/

    public static string RemoveAspx(string url) {
      int idx = url.LastIndexOf('/');
      string[] parts = (idx >= 0 ? url.Substring(idx + 1) : url).Split('.');
      if (parts.Length != 3 || parts[2].ToLower() != "aspx") return url;
      string res = url.Substring(0, url.Length - 5);
      if (VirtualPathUtility.GetExtension(res) == ".wma") return url;
      return res;
    }

    public static bool MultimediaMap(string url, out string newUrl) {
      newUrl = null;
      string[] parts = url.ToLower().Split('.');
      if (parts.Length == 3 && parts[2] == "aspx" && (parts[1] == "wma" || parts[1] == "wmv")) {
        newUrl = VirtualPathUtility.ToAbsolute("~/Framework/MediaMap.aspx") + "?url=" + HttpUtility.UrlEncode(parts[0] + "." + parts[1]);
        return true;
      }
      return false;
    }

    public static bool AddAspx(string url, out string newUrl) {
      newUrl = null;
      string ext = VirtualPathUtility.GetExtension(url);
      if (ext == ".aspx") return false;
      string fn = HostingEnvironment.MapPath(url);
      if (File.Exists(fn + ".aspx")) {
        newUrl = url + ".aspx";
        return true;
      }
      return false;
    }

    public static string RelativeUrl(string src) {
      return VirtualPathUtility.MakeRelative(HttpContext.Current.Request.Url.AbsolutePath, src).ToLower();
    }

    public static string EpaGlobalId(string virtualPath) {
      return VirtualPathUtility.ToAppRelative(virtualPath).Substring(2);
    }

    static bool appendNode(XmlDocument doc, string selectParent, string child) {
      XmlNamespaceManager nsmgr = new XmlNamespaceManager(doc.NameTable);
      nsmgr.AddNamespace("epa", "www.epaonline.com/epaclasses");
      XmlDocumentFragment frg = doc.CreateDocumentFragment();
      XmlNode parentNd = doc.SelectSingleNode(selectParent, nsmgr);
      if (parentNd == null) return false;
      frg.InnerXml = @"<x xmlns:epa=""www.epaonline.com/epaclasses"" >" + child + "</x>";
      parentNd.AppendChild(frg.ChildNodes[0].ChildNodes[0]);
      return true;
    }
    /*
     * public static string EpaUrl(string virtualPath, string mask)
    {
      return string.Format(mask, CourseMan.Config.SpaceId, RemoveAspx(EpaGlobalId(virtualPath)));
    }

    public static void ModifyRunInfo(XmlDocument doc)
    {
      XmlNamespaceManager nsmgr = new XmlNamespaceManager(doc.NameTable);
      nsmgr.AddNamespace("epa", "www.epaonline.com/epaclasses");
      int c_SpaceInstanceId = CourseMan.Config.RunInfoId;
      int c_SpaceInfoId = CourseMan.Config.RunInfoId + 1;
      int c_TitleInfoId = CourseMan.Config.RunInfoId + 2;
      int c_ExtraMemberId = CourseMan.Config.RunInfoId + 3;
      int c_InternetMediumId = CourseMan.Config.RunInfoId + 4;
      //odstraneni predchozich hodnot
      foreach (int i in new int[] { c_InternetMediumId, c_SpaceInfoId, c_TitleInfoId, c_ExtraMemberId, c_SpaceInstanceId })
      {
        XmlNode nd = doc.SelectSingleNode(string.Format("//*[@compId={0}]", i));
        if (nd != null) nd.ParentNode.RemoveChild(nd);
      }
      //dosazeni novych hodnot
      if (!appendNode(doc,
        @"//epa:tepacollection[@epa:propname=""Media""]",
        string.Format(
         @"<epa:trtlmedium compId=""{1}"" Name=""SCORM"" MediumType=""mt_Internet"" Path=""{2}{3}/"" MediumClass=""mc_Main"">
            <epa:trtlspaceinstance compId=""{0}"" Driver=""sd_HTML"" />
          </epa:trtlmedium>",
        c_SpaceInstanceId, c_InternetMediumId, UrlManager.Authority, HttpRuntime.AppDomainAppVirtualPath)))
        return;
      if (!appendNode(doc,
        @"//epa:tepacollection[@epa:propname=""Spaces""]",
        string.Format(
         @"<epa:trtlspaceinfo Name=""{0}"" Path=""{1}"" SpaceClass=""sc_ExAdditional"" 
             Line=""sl_{2}"" Instances=""{3}"" Titles=""{4}"" ProductIdsText=""998"" RowType=""HomeUrl={5}"" compId=""{6}""/>",
         CourseMan.Config.SpaceId, null , CourseMan.Config.Line, c_SpaceInstanceId, c_TitleInfoId,
         lib.EpaUrl(SiteMap.RootNode.Url, "epa://{0}/{1}"), c_SpaceInfoId)))
        return;
      if (!appendNode(doc,
        @"//epa:tepacollection[@epa:propname=""Extra_LearningPlan""]",
        string.Format(@"<epa:tcfgextraspacemember compId=""{0}"" Name=""{1}"" GlobalId=""{2}"" MemberType=""mb_LearningPlan"" 
         RowType=""Default=yes"" Line=""sl_{3}""/>",
         c_ExtraMemberId, CourseMan.Config.SpaceId, CourseMan.Config.PlanGlobalId, CourseMan.Config.Line)))
        return;
      if (!appendNode(doc,
        @"//epa:tepacollection[@epa:propname=""Titles""]",
        string.Format(@"<epa:trtltitleinfo compId=""{0}"" Name=""{1}"" Line=""sl_{2}"" Descr=""{3}"" RowType=""HomeUrl={4},TitleClass=Learning
         ,DefaultPlan={5},HasLogon=N,NoSr=true""/>",
          c_TitleInfoId, CourseMan.Config.SpaceId, CourseMan.Config.Line, SiteMap.RootNode.Title,
          lib.EpaUrl(SiteMap.RootNode.Url, "epa://{0}/{1}"),
          lib.EpaUrl("~/" + CourseMan.Config.PlanGlobalId, "[{0}].[{1}]"))))
        return;
    }*/
  }
}
