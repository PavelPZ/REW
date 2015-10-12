using System;
using System.Data;
using System.Collections;
using System.Collections.Generic;
using System.Configuration;
using System.IO;
using System.Text;
using System.Web;
using System.Web.Security;
using System.Web.UI;
using System.Web.UI.WebControls;
using System.Web.UI.WebControls.WebParts;
using System.Web.UI.HtmlControls;
using System.Xml;
using System.Xml.Serialization;
using System.Reflection;
using System.Xml.Schema;

using LMNetLib;

namespace LMComLib.Cms {

  //public enum NodeRelation {
  //  siblingBefore,
  //  siblingAfter,
  //  childFirst,
  //  childLast
  //}

  //public delegate bool CmsSiteMapFilterEvent(CmsSiteMapNode nd, Template page);

  //public class CmsSiteMap : ICmsSerialize {
  //  public string fileName;
  //  public Domains site;
  //  public CmsSiteMapNode root = null;
  //  Dictionary<int, CmsSiteMapNode> nodeIds = new Dictionary<int, CmsSiteMapNode>();
  //  static XmlWriterSettings wrSett;
  //  static CmsSiteMap() {
  //    wrSett = new XmlWriterSettings();
  //    wrSett.Indent = true;
  //  }
  //  //public CmsFile cmsFile;

  //  public CmsSiteMap(pageFilter filter, Template page, CmsSiteMap actSite, CmsSiteMap commonSite) { }
  //  //: this(new CmsSiteMapFilterEvent(filter.nodeOK), filter.IncGlobal, page, actSite, commonSite) { }

  //  public CmsSiteMap(CmsSiteMapFilterEvent filter, bool bothMaps, Template page, CmsSiteMap actSite, CmsSiteMap commonSite) { }
  //  //  if (bothMaps) {
  //  //    CmsSiteMapNode res1 = fillSiteMap(filter, page, actSite);
  //  //    CmsSiteMapNode res2 = fillSiteMap(filter, page, commonSite);
  //  //    if (res1 == null && res2 == null) return;
  //  //    if (res1 != null && res2 == null) { root = res1; return; }
  //  //    if (res2 != null && res1 == null) { root = res2; return; }
  //  //    root = new CmsSiteMapNode();
  //  //    root.Add(res1); root.Add(res2);
  //  //  } else
  //  //    root = fillSiteMap(filter, page, actSite);
  //  //}

  //  //CmsSiteMapNode fillSiteMap(CmsSiteMapFilterEvent filter, Template page, CmsSiteMap site) { }
  //  //  if (site == null || site.root == null) return null;
  //  //  List<int> validNodes = new List<int>();
  //  //  foreach (CmsSiteMapNode nd in site.nodeIds.Values)
  //  //    if (filter(nd, page)) validNodes.Add(nd.dbId);
  //  //  if (validNodes.Count == 0) return null;
  //  //  int i = 0;
  //  //  while (i < validNodes.Count) {
  //  //    CmsSiteMapNode nd = site.nodeIds[validNodes[i]];
  //  //    while (nd.Parent != null) {
  //  //      nd = nd.Parent;
  //  //      validNodes.Add(nd.dbId);
  //  //    }
  //  //    i++;
  //  //  }
  //  //  Dictionary<int, bool> res = new Dictionary<int, bool>();
  //  //  foreach (int id in validNodes) res[id] = true;
  //  //  //SubTree z validnich nodes
  //  //  return site.root.filteredCopy(res, this);
  //  //}
  //  public CmsSiteMap(Domains dom) { }
  //  //  cmsFile = new CmsFile(this);
  //  //  site = dom;
  //  //  this.fileName = Template.SiteFileName(dom, "web.sitemap");
  //  //  using (XmlReader rdr = XmlReader.Create(fileName)) {
  //  //    rdr.ReadStartElement("siteMap");
  //  //    Stack<CmsSiteMapNode> stack = new Stack<CmsSiteMapNode>();
  //  //    while (rdr.Read()) {
  //  //      if (rdr.IsStartElement()) {
  //  //        bool isEmpty = rdr.IsEmptyElement;
  //  //        CmsSiteMapNode nd = new CmsSiteMapNode(this, rdr);
  //  //        if (root == null) root = nd;
  //  //        if (stack.Count > 0) nd.setParent(stack.Peek());
  //  //        if (!isEmpty) stack.Push(nd);
  //  //      } else if (rdr.NodeType == XmlNodeType.EndElement) {
  //  //        if (stack.Count > 0)
  //  //          stack.Pop();
  //  //      }
  //  //    }
  //  //  }
  //  //}

  //  public bool fillNodeIds() { 
  //    bool res = false;
  //    foreach (CmsSiteMapNode nd in AllNodes(root)) {  
  //      if (nd.dbId == 0) {
  //        nd.dbId = Template.UniqueId();
  //        res = true;
  //      }
  //      nodeIds.Add(nd.dbId, nd);
  //    }
  //    return res;
  //  }

  //  public byte[] SerializeToUtf8String() {
  //    MemoryStream ms = new MemoryStream();
  //    using (XmlWriter wr = XmlWriter.Create(ms, wrSett)) {
  //      wr.WriteStartElement("siteMap", "http://schemas.microsoft.com/AspNet/SiteMap-File-1.0");
  //      if (root != null) root.Write(wr);
  //      wr.WriteEndElement();
  //      wr.Flush();
  //      return ms.ToArray();
  //    }
  //  }
  //  public string GetFileName() {
  //    return fileName;
  //  }

  //  public CmsSiteMapNode FindNode(int id) {
  //    CmsSiteMapNode res;
  //    return nodeIds.TryGetValue(id, out res) ? res : null;
  //  }
  //  public CmsSiteMapNode FindNode(string url) {
  //    url = url.ToLower();
  //    foreach (CmsSiteMapNode nd in nodeIds.Values)
  //      if (nd.urlInfo != null && nd.urlInfo.Url().ToLower() == url)
  //        return nd;
  //    return null;
  //  }
  //  public CmsSiteMapNode GetNode(int id) {
  //    CmsSiteMapNode res;
  //    if (!nodeIds.TryGetValue(id, out res))
  //      throw new Exception(string.Format("CmsSiteMap.GetNode: node {0} does not exist", id));
  //    return res;
  //  }
  //  public static IEnumerable<CmsSiteMapNode> AllNodes(CmsSiteMapNode node) {
  //    yield return node;
  //    foreach (CmsSiteMapNode nd in node)
  //      foreach (CmsSiteMapNode subNd in AllNodes(nd))
  //        yield return subNd;
  //  }
  //  public void MoveNode(CmsSiteMapNode moveNode, CmsSiteMapNode relNode, NodeRelation place) {
  //    //Test: moveNode nesmi byt v parent chainu relNode
  //    /*CmsSiteMapNode pomNd = relNode;
  //    while (pomNd != null)
  //    {
  //      if (pomNd == moveNode) throw new Exception(string.Format("Cannot move {0} node to {1} node", moveNode.dbId, relNode.dbId));
  //      pomNd = pomNd.Parent;
  //    }*/
  //    moveNode.Parent.Remove(moveNode);
  //    nodeIds.Remove(moveNode.dbId);
  //    InsertNode(relNode, moveNode, place);
  //  }
  //  public void DeleteNode(CmsSiteMapNode node) {
  //    if (node.Count > 0) throw new Exception("Cannot delete node with child nodes");
  //    node.Parent.Remove(node);
  //    nodeIds.Remove(node.dbId);
  //  }
  //  public void InsertNode(CmsSiteMapNode relNode, CmsSiteMapNode node, NodeRelation place) {
  //    nodeIds.Add(node.dbId, node);
  //    if (place == NodeRelation.childFirst) { relNode.Insert(0, node); node.Parent = relNode; } else if (place == NodeRelation.childLast) { relNode.Add(node); node.Parent = relNode; } else {
  //      int idx = relNode.Parent.IndexOf(relNode);
  //      node.Parent = relNode.Parent;
  //      relNode.Parent.Insert(place == NodeRelation.siblingBefore ? idx : idx + 1, node);
  //    }
  //    node.SiteMap = this;
  //  }

  //}

  public class CmsSiteMapNode : List<CmsSiteMapNode> {
    //public CmsSiteMap SiteMap;
    public CmsSiteMapNode() : base() { }
    //public static CmsSiteMapNode newPage(SecurityDir security, string name, string className, CmsSiteMapNode relNode, NodeRelation placeRelation) {
    //  CmsSiteMapNode res = new CmsSiteMapNode();
    //  string url = "~/" + relNode.SiteMap.site.ToString() + "/web/lang/" + security.ToString() + "/" + name + ".lmp";
    //  res.urlInfo = new urlInfoLow(url);
    //  res.dbId = Template.UniqueId(); res.title = "dummy title";
    //  res.className = className;
    //  relNode.SiteMap.InsertNode(relNode, res, placeRelation);
    //  return res;
    //}
    //public static CmsSiteMapNode newFolder(string folderTitle, CmsSiteMapNode relNode, NodeRelation placeRelation) {
    //  CmsSiteMapNode res = new CmsSiteMapNode();
    //  res.dbId = Template.UniqueId();
    //  res.urlInfo = new urlInfoLow("folder/" + res.dbId.ToString());
    //  res.title = folderTitle;
    //  relNode.SiteMap.InsertNode(relNode, res, placeRelation); 
    //  return res;
    //}
    //public static CmsSiteMapNode newImg(SecurityDir security, string imgName, CmsSiteMapNode relNode, NodeRelation placeRelation) {
    //  CmsSiteMapNode res = new CmsSiteMapNode();
    //  string url = "~/" + relNode.SiteMap.site.ToString() + "/web/lang/" + security.ToString() + "/" + imgName;
    //  res.urlInfo = new urlInfoLow(url); 
    //  res.dbId = Template.UniqueId();
    //  relNode.SiteMap.InsertNode(relNode, res, placeRelation);
    //  return res;
    //}
    //public CmsSiteMapNode(CmsSiteMap siteMap, XmlReader rdr) {
    //  SiteMap = siteMap;
    //  while (rdr.MoveToNextAttribute())
    //    switch (rdr.Name) {
    //      case "title": title = rdr.ReadContentAsString(); break;
    //      case "url": url = rdr.ReadContentAsString(); break;
    //      case "dbId": dbId = rdr.ReadContentAsInt(); break;
    //      case "className": className = rdr.ReadContentAsString(); break;
    //      case "category": category = (UniversalCategory)Enum.Parse(typeof(UniversalCategory), rdr.ReadContentAsString(), true); break;
    //    }
    //}
    //public CmsSiteMapNode filteredCopy(Dictionary<int, bool> nodeIds, CmsSiteMap map) {
    //  CmsSiteMapNode res = new CmsSiteMapNode();
    //  res.SiteMap = map;
    //  res.dbId = dbId;
    //  res.title = title;
    //  res.urlInfo = urlInfo;
    //  res.url = url;
    //  res.className = className;
    //  foreach (CmsSiteMapNode nd in this) {
    //    if (!nodeIds.ContainsKey(nd.dbId)) continue;
    //    CmsSiteMapNode subNd = (CmsSiteMapNode)nd.filteredCopy(nodeIds, map);
    //    res.Add(subNd);
    //    subNd.Parent = res;
    //  }
    //  return res;
    //}
    //public void setParent(object par) {
    //  Parent = (CmsSiteMapNode)par;
    //  Parent.Add(this);
    //}
    public void Write(XmlWriter wr) {
      wr.WriteStartElement("siteMapNode");
      wr.WriteAttributeString("url", url);
      //if (title != null && (urlInfo == null || urlInfo.Type != SiteMapNodeType.lmp)) wr.WriteAttributeString("title", title);
      if (title != null) wr.WriteAttributeString("title", title);
      if (dbId != 0) wr.WriteAttributeString("dbId", dbId.ToString());
      if (className != null) wr.WriteAttributeString("className", className);
      if (category != null) wr.WriteAttributeString("category", ((UniversalCategory)category).ToString());
      foreach (CmsSiteMapNode subNd in this)
        subNd.Write(wr);
      wr.WriteEndElement();
    }
    public CmsSiteMapNode Parent;
    public int dbId;
    public string title;
    public string className;
    UniversalCategory? category;
    //Odvozene z URL:
    public urlInfoLow urlInfo;

    string _url;
    public string url {
      get {
        return null; // urlInfo == null ? _url : urlInfo.Url(SiteMap.site, dbId);
      }
      set { _url = value; urlInfo = new urlInfoLow(value); }
    }

    public bool isPointer() {
      return false; // urlInfo != null && urlInfo.SiteId == Domains.site && SiteMap.site != Domains.site;
    }
    public bool isInParentChain(CmsSiteMapNode nd) {
      while (nd != null) {
        if (nd == this) return true;
        nd = nd.Parent;
      }
      return false;
    }
  }
}

/*public CmsSiteMapNode(SecurityDir security, string name, string className, CmsSiteMapNode relNode, NodeRelation placeRelation)
{
  string url = "~/" + relNode.SiteMap.site.ToString() + "/web/lang/" + security.ToString() + "/" + name + ".lmp";
  urlInfo = new urlInfoLow(url);
  dbId = Template.UniqueId(); title = "dummy title";
  this.className = className;
  relNode.SiteMap.InsertNode(relNode, this, placeRelation);
}
public CmsSiteMapNode(CmsSiteMapNode commonNode, CmsSiteMapNode relNode, NodeRelation placeRelation)
{
  urlInfo = new urlInfoLow(commonNode.urlInfo);
  dbId = Template.UniqueId(); title = commonNode.title; //descr = commonNode.descr; 
  className = commonNode.className;
  relNode.SiteMap.InsertNode(relNode, this, placeRelation);
}*/
/// <summary>
/// Folder
/// </summary>
/*
public CmsSiteMapNode(SecurityDir security, string imgName, CmsSiteMapNode relNode, NodeRelation placeRelation)
{
  string url = "~/" + relNode.SiteMap.site.ToString() + "/web/lang/" + security.ToString() + "/" + imgName;
  urlInfo = new urlInfoLow(url);
  dbId = Template.UniqueId();
  relNode.SiteMap.InsertNode(relNode, this, placeRelation);
}*/
/// <summary>
/// Folder
/// </summary>
/*public CmsSiteMapNode(string folderTitle, CmsSiteMapNode relNode, NodeRelation placeRelation)
{
  urlInfo = new urlInfoLow("folder");
  title = folderTitle;
  dbId = Template.UniqueId();
  relNode.SiteMap.InsertNode(relNode, this, placeRelation);
}*/
