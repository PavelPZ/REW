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
using System.Web.Hosting;

using LMNetLib;

namespace LMComLib.Cms
{

  public enum NodeActions
  {
    AppendImg,
    AppendFolder,
    AppendPage,
    InsertImg,
    InsertFolder,
    InsertPage,
    Delete,
    MoveAbove,
    MoveBelow,
    MoveOver,
  }


  /// <summary>
  /// Designtime objekt, ulozeny v session promenne uzivatele, ktery edituje prislusny site
  /// </summary>
  public static class CmsEditContext
  {
    public static Domains Site
    {
      get
      {
        Domains? site = (Domains)HttpContext.Current.Session["site"]; 
        return site == null ? Domains.cz : (Domains)site;
      }
    }
    public static CmsSiteMap getSiteMap()
    {
      return CacheItems.GetSiteMap(Site);
    }
    public static CmsSiteMap getSiteMap(pageFilter filter, Template page)
    {
      return CacheItems.GetSiteMap(Site, filter, page);
    }
    public static CmsSiteMap commonSiteMap()
    {
      return CacheItems.GetSiteMap(Domains.site);
    }
    public static Template getPage(int id)
    {
      Template res = getPage(CacheItems.GetSiteMap(Site).FindNode(id));
      if (res == null && Site != Domains.site)
        res = getPage(CacheItems.GetSiteMap(Domains.site).GetNode(id));
      return res;
    }
    public static Template getPage(CmsSiteMapNode nd)
    {
      if (nd == null) return null;
      return CacheItems.GetTemplate(nd);
    }
    public static void Save(Template page)
    {
      if (page != null && !page.cmsNode.isPointer()) page.cmsFile.Save();
      getSiteMap().cmsFile.Save();
    }
    public static int createPage(SecurityDir security, string name, string className, byte[] imgData, int placeNodeId, NodeRelation placeRelation)
    {
      CmsSiteMap siteMap = getSiteMap();
      CmsSiteMapNode relNode = siteMap.GetNode(placeNodeId);
      CmsSiteMapNode nd = className != null
        ? CmsSiteMapNode.newPage(security, name, className, relNode, placeRelation)
        : CmsSiteMapNode.newImg(security, name, relNode, placeRelation);
      try {
        string fn = nd.urlInfo.getFileName();
        if (File.Exists(fn)) {
          throw new Exception(string.Format("CmsLib.CreateNewTemplate: File {0} already exists.", fn));
        }
        Template res;
        if (className != null) {
          res = (Template)Template.findTemplateType(className).GetConstructor(Type.EmptyTypes).Invoke(null);
          Template.Save(res, fn);
        } else {
          res = new ImgTemplate();
          Template.Save(imgData, fn);
        }
        siteMap.cmsFile.Save(); //ulozim SiteMap
        return nd.dbId;
      } catch {
        siteMap.DeleteNode(nd);
        throw;
      }
    }

    public static int createPage(SecurityDir security, string name, string className, int placeNodeId, NodeRelation placeRelation)
    {
      return createPage(security, name, className, null, placeNodeId, placeRelation);
    }
    public static int createImg(string name, byte[] imgData, int placeNodeId, NodeRelation placeRelation)
    {
      return createPage(SecurityDir.Pages, name, null, imgData, placeNodeId, placeRelation);
    }

    public static void move(int id, int placeNodeId, NodeRelation placeRelation)
    {
      CmsSiteMap siteMap = getSiteMap();
      CmsSiteMapNode nd = siteMap.GetNode(id);
      CmsSiteMapNode relNode = siteMap.GetNode(placeNodeId);
      siteMap.MoveNode(nd, relNode, placeRelation);
      siteMap.cmsFile.Save(); //ulozim SiteMap
    }

    public static void delete(int id)
    {
      CmsSiteMap siteMap = getSiteMap();
      CmsSiteMapNode nd = siteMap.GetNode(id);
      siteMap.DeleteNode(nd);
      if ((nd.urlInfo.Type == SiteMapNodeType.lmp || nd.urlInfo.Type == SiteMapNodeType.img) && (nd.urlInfo.SiteId != Domains.site || nd.SiteMap.site == Domains.site))
        File.Delete(nd.urlInfo.getFileName());
      siteMap.cmsFile.Save(); //ulozim SiteMap
    }

    public static int createFolder(string title, int placeNodeId, NodeRelation placeRelation)
    {
      CmsSiteMap siteMap = getSiteMap();
      CmsSiteMapNode nd = CmsSiteMapNode.newFolder(title, siteMap.GetNode(placeNodeId), placeRelation);
      siteMap.cmsFile.Save(); //ulozim SiteMap
      return nd.dbId;
    }

    public static bool actionsValid(NodeActions action, int actNode, int? moveTarget)
    {
      CmsSiteMap siteMap = getSiteMap();
      CmsSiteMapNode nd = siteMap.FindNode(actNode);
      bool isRoot = actNode == siteMap.root.dbId;
      CmsSiteMapNode moveTargetNode = moveTarget == null ? null : siteMap.FindNode((int)moveTarget);
      switch (action)
      {
        case NodeActions.AppendImg:
          if (nd.urlInfo.Type == SiteMapNodeType.img) return false;
          return true;
        case NodeActions.AppendFolder:
          if (nd.urlInfo.Type == SiteMapNodeType.img) return false;
          return true;
        case NodeActions.AppendPage:
          if (nd.urlInfo.Type == SiteMapNodeType.img) return false;
          return true;
        case NodeActions.InsertImg:
          if (isRoot || nd.Parent.urlInfo.Type == SiteMapNodeType.img) return false;
          return true;
        case NodeActions.InsertFolder:
          if (isRoot || nd.Parent.urlInfo.Type == SiteMapNodeType.img) return false;
          return true;
        case NodeActions.InsertPage:
          if (isRoot || nd.Parent.urlInfo.Type == SiteMapNodeType.img) return false;
          return true;
        case NodeActions.Delete:
          if (isRoot || nd.Count>0) return false;
          return true;
        case NodeActions.MoveOver:
          if (isRoot || moveTargetNode == null || moveTargetNode.urlInfo.Type == SiteMapNodeType.img) return false;
          //if (moveTargetNode.isInParentChain(nd)) return false;
          if (nd.isInParentChain(moveTargetNode)) return false;
          return true;
        case NodeActions.MoveAbove:
        case NodeActions.MoveBelow:
          if (isRoot || moveTargetNode == null || (int)moveTarget == siteMap.root.dbId || moveTargetNode.Parent.urlInfo.Type == SiteMapNodeType.img) return false;
          //if (moveTargetNode.Parent.isInParentChain(nd)) return false;
			 //if (nd.Parent.isInParentChain(moveTargetNode)) return false;
			 //otec presouvaneho uzlu muze byt v retezci otcu ciloveho uzlu (napr. dva uzly se stejnym otcovskym uzlem)
          if (nd.isInParentChain(moveTargetNode)) return false;
          return true;
      } 
      return false;
    }

  }

  public interface ICmsSerialize
  {
    byte[] SerializeToUtf8String();
    string GetFileName();
  }

  /// <summary>
  /// Pro designTime: Objekt, pripojeny k .LMP nebo .SITEMAP in memory souboru: hlida zmenu souboru a to, 
  /// zdali soubor mezitim nekdo nezmenil.
  /// </summary>
  public class CmsFile
  {
    ICmsSerialize content;
    byte[] status;
    string oldFileName;
    public CmsFile(ICmsSerialize content)
    {
      this.content = content;
    }
    public void Save()
    {
      //TODO: check new file DateTime against old file DateTime
      string newFn = content.GetFileName();
      bool contentEq = true;
      byte[] newStatus = content.SerializeToUtf8String();
      if (newStatus != null) {
        string newSt = Encoding.UTF8.GetString(newStatus);
        string oldSt = Encoding.UTF8.GetString(status);
        contentEq = LowUtils.CompareByteArrays(newStatus, status);
      } else if (status != null)
        throw new Exception();
      if (newFn == oldFileName && contentEq) return;
      LowUtils.AdjustFileDir(newFn);
      if (contentEq)
        File.Move(oldFileName, newFn);
      else
      {
        File.Delete(oldFileName);
        using (FileStream fs = new FileStream(newFn, FileMode.Create))
          fs.Write(newStatus, 0, newStatus.Length);
      }
      status = newStatus;
      oldFileName = newFn;
    }
    public void Init()
    {
      status = content.SerializeToUtf8String();
      oldFileName = content.GetFileName();
      //TODO: set file DateTime
    }
  }

}