//********************************
// Web app maji v SiteMaps adresu <domena>/<aplikace>/lang/...
// Kazda domena musi mit pro Web app svoji sitemap
// Ostatni apps maji v SiteMaps adresu site/<aplikace>/lang/...
// Sitemap pro ostatni apps je spolecna pro vsechny domeny
// Web app muze mit stranky (APSX nebo LMP) specificke pro domenu i jazyk, vybere se vzdy nejkonkretnejsi stranka
// Ostatni apps musi mit stranky (pouze ASPX) v site/<aplikace>/lang/
//********************************
using System;
using System.Collections.Generic;
using System.Collections.Specialized;
using System.Text;
using System.Web;
using System.IO; 
using System.Web.UI;
using System.Web.Profile;
using System.Web.Caching;
using System.Threading;
using System.Globalization;
using System.Web.Hosting;

using LMComLib.Cms;
using LMNetLib;

namespace LMComLib {
  public class CacheNode {
    public CacheNode(SiteMapNode node) {
      Node = node;
      Info = new urlInfoLow(Node);
      if (Info.Type == SiteMapNodeType.no || Info.Type == SiteMapNodeType.folder) return;
      //string ext = Info.Ext == "lmp" ? "aspx" : Info.Ext;
      FileName = Info.getFileName();
    }
    public SiteMapNode Node;
    public urlInfoLow Info;
    public string FileName;
    public Template getTemplate() {
      return CacheItems.GetTemplate(Node);
    }
    public static bool isTemplate(SiteMapNode nd) {
      CacheNode cacheNd = CacheItems.GetNode(nd);
      if (cacheNd == null || cacheNd.Info==null) return false;
      return cacheNd.Info.Type == SiteMapNodeType.lmp;
    }
    public static bool isPage(SiteMapNode nd) {
      SiteMapNodeType tp = CacheItems.GetNode(nd).Info.Type;
      return tp == SiteMapNodeType.lmp || tp == SiteMapNodeType.aspx;
    }
  }
  public static class CacheItems {

    static string siteMapKey = Guid.NewGuid().ToString();

    public static CacheNode GetNode(SiteMapNode nd) {
      int dbId;
      if (!int.TryParse(nd["dbId"], out dbId)) return null;
      return GetNode(dbId);
    }

    public static CacheNode GetNodeNoNull(int id) {
      CacheNode res = GetNode(id);
      if (res == null) throw new Exception(string.Format("Cannot find node in SiteMap: dbId={0}",id));
      return res;
    }
    public static CacheNode GetNode(int id) {
      Cache cache = HttpContext.Current.Cache;
      Dictionary<int, CacheNode> dict = (Dictionary<int, CacheNode>)cache.Get(siteMapKey);
      if (dict == null)
        lock (typeof(CacheItems)) {
          dict = new Dictionary<int, CacheNode>();
          //Naplneni ze SiteMap
          foreach (SiteMapNode nd in LowUtils.allNodes(SiteMap.RootNode)) {
            int dbId;
            if (!int.TryParse(nd["dbId"], out dbId)) continue;
            if (dict.ContainsKey(dbId)) continue;
            dict.Add(dbId, new CacheNode(nd));
          }
          //Vlozeni do cache se zavislosti na vsech narodnich SiteMaps:
          List<string> allSiteMapsFiles = new List<string>();
          foreach (Domains dom in Enum.GetValues(typeof(Domains))) {
            string fn = HostingEnvironment.ApplicationPhysicalPath + dom.ToString() + @"\web\web.sitemap";
            if (File.Exists(fn)) allSiteMapsFiles.Add(fn);
          }
          cache.Insert(siteMapKey, dict, new CacheDependency(allSiteMapsFiles.ToArray()));
        }
      CacheNode res;
      return dict.TryGetValue(id, out res) ? res : null;
    }

    public static string RelUrl(int id) {
      urlInfo actUi = urlInfo.GetUrlInfo();
      string url = urlInfo.ChangeUrl(CacheItems.GetNode(id).Info, actUi.Site, null, actUi.Lang, null);
      return VirtualPathUtility.MakeRelative(actUi.RelativePath, url);
    }

    //public static Product GetProduct(SiteMapNode nd) {
    //  if (nd.Url.IndexOf(".lmp") < 0) throw new Exception("nd.Url.IndexOf(.lmp) < 0");
    //  if (nd["className"] != "LMComLib.Cms.Product") throw new Exception("nd[className] != LMComLib.Cms.Product");
    //  CacheNode item = new CacheNode(nd);
    //  Template res = Template.Load(item.FileName, nd["className"]);
    //  res.node = nd;
    //  res.Info = new urlInfoLow(nd);
    //  return (LMComLib.Cms.Product) res;
    //}

    public static Template GetTemplate(SiteMapNode nd) { return null; }
    //public static Template GetTemplate(SiteMapNode nd) {
    //  LibConfig.DesignTimeEq(false); //nesmi byt designtime
    //  if (nd.Url.IndexOf(".lmp") < 0) {
    //    string s = nd.Url;
    //    if (s.IndexOf(".jpg") > 0 || s.IndexOf(".bmp") > 0 || s.IndexOf(".png") > 0 || s.IndexOf(".gif") > 0) {
    //      Template img = new ImgTemplate();
    //      img.Info = new urlInfoLow(nd);
    //      return img;
    //    } else {
    //      return null;
    //    }
    //  }
    //  int dbId;
    //  if (!int.TryParse(nd["dbId"], out dbId)) return null;
    //  Cache cache = HttpContext.Current.Cache;
    //  string key = Thread.CurrentThread.CurrentUICulture.Name + nd.Url;
    //  Template res = (Template)cache.Get(key);
    //  if (res == null)
    //    lock (typeof(CacheItems)) {
    //      CacheNode item = CacheItems.GetNode(dbId);
    //      res = Template.Load(item.FileName, nd["className"]);
    //      res.node = nd;
    //      res.Info = new urlInfoLow(nd);
    //      cache.Insert(key, res, new CacheDependency(item.FileName));
    //    }
    //  return res;
    //}

    public static Template GetTemplate(int id) {
      return GetTemplate(GetNode(id).Node);
    }

    //public static CmsSiteMap GetSiteMap(Domains Site) {
    //  //LibConfig.DesignTimeEq(true); //musi byt designtine
    //  //Cache cache = HttpContext.Current.Cache;
    //  //string key = string.Format("sitemap_{0}", Site);
    //  //CmsSiteMap res = (CmsSiteMap)cache.Get(key);
    //  //if (res == null)
    //  //  lock (typeof(CacheItems)) {
    //  //    res = new CmsSiteMap(Site);
    //  //    res.cmsFile.Init();
    //  //    if (res.fillNodeIds())
    //  //      res.cmsFile.Save(); //SiteMap se mohla zmenit - doplneni DBId
    //  //    cache.Insert(key, res, new CacheDependency(res.fileName));
    //  //  }
    //  //return res;
    //  return null;
    //}

    //public static CmsSiteMap GetSiteMap(Domains Site, pageFilter filter, Template page) {
    //  LibConfig.DesignTimeEq(true); //musi byt designtine
    //  Cache cache = HttpContext.Current.Cache;
    //  string key = string.Format("sitemap_{0}", filter.getKey());
    //  CmsSiteMap res = (CmsSiteMap)cache.Get(key);
    //  if (res == null)
    //    lock (typeof(CacheItems)) {
    //      res = new CmsSiteMap(filter, page, GetSiteMap(Site), GetSiteMap(Domains.site));
    //      string siteKey = string.Format("sitemap_{0}", Site);
    //      string[] keys = filter.IncGlobal ? new string[] { siteKey, "sitemap_site" } : new string[] { siteKey };
    //      cache.Insert(key, res, new CacheDependency(null, keys));
    //    }
    //  return res;
    //}

    //public static Template GetTemplate(CmsSiteMapNode nd) {
    //  return null;
    //  //LibConfig.DesignTimeEq(true); //musi byt designtine
    //  //Cache cache = HttpContext.Current.Cache;
    //  //string key = string.Format("temp_{0}", nd.dbId);
    //  //Template res = (Template)cache.Get(key);
    //  //if (res == null)
    //  //  lock (typeof(CacheItems)) {
    //  //    string fn = nd.urlInfo.getFileName();
    //  //    res = nd.urlInfo.Type == SiteMapNodeType.img ? new ImgTemplate() : Template.Load(fn, nd.className);
    //  //    res.dbId = nd.dbId;
    //  //    res.cmsFile.Init();
    //  //    cache.Insert(key, res, new CacheDependency(fn));
    //  //  }
    //  //return res;
    //}

  }
}
