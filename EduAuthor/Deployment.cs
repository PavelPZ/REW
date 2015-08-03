using System;
using System.Data;
using System.Configuration;
using System.Collections.Generic;
using System.Web;
using System.IO;
using System.Web.Security;
using System.Web.UI;
using System.Web.UI.WebControls;
using System.Web.UI.WebControls.WebParts;
using System.Web.UI.HtmlControls;

using LMComLib;
using LMNetLib;
using LMScormLibDOM;

public struct courseNodes {
  public SiteMapNode cdHome;
  public SiteMapNode home;
  public SiteMapNode result;
  public SiteMapNode test;
  public SiteMapNode content;
  public SiteMapNode setStart;
  public SiteMapNode run;
  public SiteMapNode support;
  public SiteMapNode firstModule;
  public SiteMapNode install;
  public SiteMapNode update;
  public SiteMapNode register;
  public CourseIds crsId;
  public List<SiteMapNode> Materials;
  public IEnumerable<SiteMapNode> allNodes() {
    foreach (SiteMapNode nd in new SiteMapNode[] { cdHome, home, result, test, content, setStart, run, install, update, register /*support,*/})
      if (nd != null) yield return nd;
    if (Materials != null)
      foreach (SiteMapNode nd in Materials)
        yield return nd;
  }
}
/// <summary>
/// Summary description for Deployment
/// </summary>
public static class Deployment {
  //public static Config defaultConfig;

  /// <summary>
  /// Aktualni config objekt pro LMCOm, vytvoreny z urlInfo.GetInfo()
  /// </summary>
  //static ConfigCourse lmComActConfig;

  public static ConfigLow actConfig(object dymmy) {
    ConfigLow res = ConfigLow.actConfig();
    if (res != null) return res;
    throw new Exception("Deployment.actConfig");
  }

  public static SiteInfo getSiteInfo() {
    return SiteInfos.getSiteInfo(Domain());
  }

  /*public static string RPC_url(string fncName) {
    return RPC_url(Domain(), fncName);
  }*/

  public static Domains Domain() {
    ConfigLow act = actConfig(null);
    return act is ConfigCourseLow ? ((ConfigCourseLow)act).Domain : Domains.cz;
  }


  //public static ConfigLow actConfig(Type tp) {
    //return actConfig(tp, true);
    //return ConfigLow.actConfig(delegate() { return onGetConfig(tp); });
  //}

  static string[] servers = new string[] { "scorm", "rewise" };

  public static LMScormLib.AjaxPairs getServerAjaxPars() {
    Domains site = Domain();
    Dictionary<string, string> allServers = new Dictionary<string, string>();
    foreach (string serv in servers) {
      string url = Machines.isBuildEACache_BuildCD_Crawler ? SiteInfos.getDefaultAuthority(site, SiteInfos.c_rpcServerId, serv) : SiteInfos.RPC_url(site, serv);
      if (url != null) allServers.Add(serv, url);
    }
    if (allServers.Count < 0) return null;
    LMScormLib.AjaxPairs pars = new LMScormLib.AjaxPairs(null);
    foreach (KeyValuePair<string, string> nv in allServers)
      pars.addPar(nv.Key, nv.Value ?? "");
    return pars;
  }

  static CourseIds removeExt(CourseIds id, string ext) {
    if (!id.ToString().EndsWith(ext)) return id;
    return (CourseIds) Enum.Parse(typeof(CourseIds), id.ToString().Replace(ext, null));
  }

  static void courseNode(CourseIds crsId, out SiteMapNode nd, string name, bool force) {
    crsId = removeExt(crsId, "Berlitz");
    nd = null;
    if (crsId == CourseIds.no) return;
    string url;
    if (crsId == CourseIds.ZSAj && name == "Home")
      url = "~/zsroot/AJCDHome.htm";
    else if (crsId == CourseIds.ZSNj && name == "Home")
      url = "~/zsroot/NJCDHome.htm";
    else if (crsId == CourseIds.UctoAll && name == "Home")
      url = "~/UctoAll/CDHome.htm";
    else if (crsId == CourseIds.Ucto1 && name == "Home")
      url = "~/Ucto1/Home.htm";
    else if (crsId == CourseIds.Ucto2 && name == "Home")
      url = "~/Ucto2/Home.htm";
    else if (crsId == CourseIds.Ucto3 && name == "Home")
      url = "~/Ucto3/Home.htm";
    else
      url = string.Format("~/{0}/{1}.htm", crsId.ToString().Replace('_', '-'), name);
    nd = SiteMap.Provider.FindSiteMapNode(url);
    if (force && nd == null)
      throw new Exception(string.Format("Deployment.courseNodes: missing CourseNode ({0})", url));
  }

  public static void courseNodes(CourseIds crsId, out courseNodes nodes, bool needAllNodes) {
    nodes.crsId = crsId; nodes.Materials = null;
    needAllNodes = false;//PZ 20.3.08
    courseNode(crsId, out nodes.support, "Support", needAllNodes);
    courseNode(crsId, out nodes.content, "Content", needAllNodes);
    courseNode(crsId, out nodes.home, "Home", true);
    courseNode(crsId, out nodes.result, "Result", needAllNodes);
    courseNode(crsId, out nodes.run, "Run", needAllNodes);
    courseNode(crsId, out nodes.cdHome, "CDHome", needAllNodes);
    courseNode(crsId, out nodes.setStart, "SetStart", false);
    courseNode(crsId, out nodes.install, "Install", needAllNodes);
    courseNode(crsId, out nodes.update, "Update", needAllNodes);
    courseNode(crsId, out nodes.register, "Register", false);
    nodes.test = null;
    if (nodes.support != null)
      foreach (SiteMapNode nd in nodes.support.ChildNodes)
        switch (nd["specialNode"]) {
          case "test":
            if (nodes.test != null) throw new Exception("Deployment.courseNodes: duplicated test node");
            nodes.test = nd;
            break;
          case "otherMaterial":
            if (nodes.Materials == null) nodes.Materials = new List<SiteMapNode>();
            nodes.Materials.Add(nd);
            break;
        }
    nodes.firstModule = null;
    if (nodes.home != null)
      foreach (SiteMapNode nd in nodes.home.ChildNodes) {
        if (nd["specialNode"] == "support") continue;
        SiteMapNode subNd = nd;
        while (nodes.firstModule == null) {
          if (subNd["template"] == "lmsModule") nodes.firstModule = subNd;
          else if (subNd.HasChildNodes) subNd = subNd.ChildNodes[0];
          else break;
        }
        //PZ 2.10.08 - Rewise nema firstModule
        //if (nodes.firstModule == null) throw new Exception("");
        break;
      }
  }

  /*public static CourseIds isTestOf(SiteMapNode testNode)
  {
    string s = testNode["isTestOf"];
    if (string.IsNullOrEmpty(s)) return CourseIds.no;
    return (CourseIds) Enum.Parse(typeof(CourseIds), s);
  }*/
}
