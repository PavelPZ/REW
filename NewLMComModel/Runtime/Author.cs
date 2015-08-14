﻿using CourseMeta;
using CourseModel;
using LMComLib;
using LMNetLib;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Xml.Linq;
using System.Xml.Serialization;

namespace Author {
  using Admin;
  using System.IO.Compression;

  public enum authorModes {
    no,
    displayEx, //pro VSAuthor: zobrazi jedno cviceni zadane URL
    displayMod, //pro VSAuthor: zobrazi kapitolu zadane URL
    //oldEA, //pro VSAuthor: zobrazi jedno cviceni z oldEA
    xref, //pro VSAuthor: zobrazi xref k jenomu adresari zadaneho URL
    doc, //zobrazi dokumentaci
    compileEx, //vrati JSON k XML
  }

  public class Server {

    static Server() {

      /* CmdXrefData */
      Handlers.CmdService.registerCommand<CmdXrefData, CmdXrefDataResult>(par => {
        return new RpcResponse(XrefContext.getXrefData(par));
      });

      /* CmdXrefData */
      Handlers.CmdService.registerCommand<CmdDeployProject, CmdDeployProjectResult>(par => {
        return new RpcResponse(DeployProject(par));
      });
    }

    //d:\LMCom\rew\SolutionToolbar\Forms\DeployForm.cs, DeployBtn_Click
    static CmdDeployProjectResult DeployProject(CmdDeployProject par) {
      var db = NewData.Lib.CreateContext(); var res = new CmdDeployProjectResult();
      string productRoot, zipFn;
      switch (par.action) {
        case DeployProjectAction.deployStart:
          //adjust company v DB
          NewData.Company comp;
          if (!par.isCompany) {
            var user = db.Users.First(u => u.Id == par.id);
            comp = user.MyPublisher != null ? user.MyPublisher : NewData.AdminServ.createCompany(db, string.Format("{0} {1} ({2})", user.FirstName, user.LastName, user.EMail), user, true);
          } else {
            comp = db.Companies.First(c => c.Id == par.id);
          }
          NewData.Lib.SaveChanges(db);
          res.companyId = comp.Id;
          //priprav productRoot
          productRoot = urlFromDesignUrl(comp.Id, par.url);
          zipFn = Path.ChangeExtension(ex.fileNameFromUrl(productRoot + "deploy"), ".zip");
          LowUtils.AdjustFileDir(zipFn);
          break;
        case DeployProjectAction.deployEnd:
        case DeployProjectAction.remove:
          string regProductsFn, prodUrl; List<string> regs;
          //remove
          if (par.action == DeployProjectAction.remove) {
            if (!par.isCompany) {
              var user = db.Users.First(u => u.Id == par.id);
              comp = user.MyPublisher;
            } else {
              comp = db.Companies.First(c => c.Id == par.id);
            }
            if (comp == null) return res;
            par.id = comp.Id;
          }

          //common
          productRoot = urlFromDesignUrl(par.id, par.url); // /publ/0/5/folder_1/course_1/
          zipFn = Path.ChangeExtension(ex.fileNameFromUrl(productRoot + "deploy"), ".zip"); //d:\lmcom\rew\web4\publ\0\5\folder_1\course_1\deploy.zip
          prodUrl = urlFromDesignUrl(par.id, Author.Server.prodUrlFromCourseUrl(par.url)).ToLower(); // /publ/0/5/folder_1/course_1/_prod
          regProductsFn = Path.ChangeExtension(ex.fileNameFromUrl(urlFromDesignUrl(par.id, null)), ".txt"); //d:\lmcom\rew\web4\publ\0\5\meta.txt
          regs = File.Exists(regProductsFn) ? File.ReadAllLines(regProductsFn).ToList() : new List<string>();
          //delete JS a gzip from dirs
          if (regs.IndexOf(prodUrl) >= 0) { regs.Remove(prodUrl); File.WriteAllLines(regProductsFn, regs); }
          foreach (var js in Directory.GetFiles(Path.GetDirectoryName(zipFn), "*.*", SearchOption.AllDirectories)) if (delExts.Contains(Path.GetExtension(js))) File.Delete(js);

          //deployEnd
          if (par.action == DeployProjectAction.deployEnd) {
            //unzip
            using (var str = File.OpenRead(zipFn))
            using (ZipArchive zip = new ZipArchive(str, ZipArchiveMode.Read)) {
              var publisherPath = urlFromDesignUrl(par.id, null).Replace('/', '\\'); // \publ\0\5\
              foreach (var f in zip.Entries.OfType<ZipArchiveEntry>())
                using (var fStr = f.Open()) {
                  var fn = f.FullName.Substring(f.FullName.IndexOf('\\') + 1);
                  fn = Machines.rootDir + publisherPath + fn;
                  var path = Path.GetDirectoryName(fn);
                  if (!Directory.Exists(path)) Directory.CreateDirectory(path);
                  using (var outStr = File.Create(fn)) fStr.CopyTo(outStr);
                }
            }
            File.Delete(zipFn);
            //zaregistruj produkt
            if (regs.IndexOf(prodUrl) == -1) { regs.Add(prodUrl); File.WriteAllLines(regProductsFn, regs); }
            //ticket
            var ticketFn = Machines.rootPath + @"App_Data\tickets\" + par.ticket.name;
            LowUtils.AdjustFileDir(ticketFn);
            XmlUtils.ObjectToFile(Machines.rootPath + @"App_Data\tickets\" + par.ticket.name, par.ticket);
          }

          //common - refresh publisher siteroot.js
          var sitemapUrl = urlFromDesignUrl(par.id, null); // /publ/0/5/
          var files = regs.Select(r => ex.fileNameFromUrl(r));
          var prods = new products { url = sitemapUrl, Items = files.Where(fn => File.Exists(fn)).Select(fn => data.readObject<product>(fn)).ToArray() };
          File.WriteAllText(Path.ChangeExtension(ex.fileNameFromUrl(sitemapUrl + "siteroot"), ".js"), CourseMeta.Lib.serializeObjectToJS(prods), Encoding.UTF8);
          break;
      }
      return res;
    }

    public static product[] getCompanyProducts(int companyId) {
      var regProductsFn = Path.ChangeExtension(ex.fileNameFromUrl(urlFromDesignUrl(companyId, null)), ".txt"); if (!File.Exists(regProductsFn)) return null;
      var regs = File.ReadAllLines(regProductsFn).ToArray(); if (regs.Length == 0) return null;
      return regs.Select(r => ex.fileNameFromUrl(r)).Where(fn => File.Exists(fn)).Select(fn => data.readObject<product>(fn)).ToArray(); ;
    }

    public static string prodUrlFromCourseUrl(string designUrl) {
      return designUrl + "_prod";
      //var parts = designUrl.Split('/').ToList(); parts.Insert(2, "prods");
      //return LowUtils.join(parts, "/");
    }
    public static string urlFromDesignUrl(Int64 companyId, string designUrl) {
      var mod = companyId % publisherSubpathModulo;
      var group = (int)((companyId - mod) / publisherSubpathModulo);
      return string.Format("/publ/{0}/{1}{2}", group, mod, designUrl == null ? "/" : designUrl.Substring(LowUtils.nthIndexesOf(designUrl, '/', 2)));
    }
    const int publisherSubpathModulo = 500;
    static HashSet<string> delExts = new HashSet<string>() { ".js", ".gzip", ".xml" };
  }

}

namespace Admin {
  public enum CmdXrefDataOpers {
    nodeTypes, typeProps, typePropValues, typeLinks, typePropLinks, typePropValueLinks,
    nodeProps, propValues, propLinks, propValueLinks,
    refreshXref,
    checkAll,
  }
  public class CmdXrefData {
    public CmdXrefDataOpers oper;
    public string type;
    public string prop;
    public string value;
    public int nodeId;
    public int maxLinks;
    public string urlContext; //null pro globalni xref, URL pro subdir browse
  }

  public class CmdXrefDataResult {
    public string[] names;
    public xrefLink[] links;
    public string error;
  }

  public class xrefLink {
    public string title;
    public string url;
  }

  //vs.net author deployment
  public enum DeployProjectAction {
    deployStart,
    deployEnd,
    remove,
  }

  public class CmdDeployProject {
    public DeployProjectAction action;
    public bool isCompany; //pro action=deployStart: company deploy nebo individual deploy
    public bool isRemove; //odstraneni produktu
    public Int64 id; //pro isStart: companyId nebo companyUserId (jinak vracena companyId)
    public string url; //relativni url produktu (relativne k publisher root)
    public Login.CmdLoginTicket ticket; //ticket pro zalogovani
  }
  public class CmdDeployProjectResult {
    public int companyId; //hlavne pro isCompany=false; int s user individual company email
  }
}

namespace Author {

  using Admin;
  using System.Threading;
  using System.Threading.Tasks;
  using System.Xml;

  public class xrefPageObj { //of docXrefType
    [XmlAttribute]
    public string url;
    [XmlAttribute]
    public string title;
    [XmlAttribute]
    public int[] sitemapParents; //obsahuje CourseMeta.data.uniq

    [XmlElementAttribute(typeof(xrefTypeObj))]
    public xrefTypeObj[] types;

    public static xrefPageObj fromXml(string url, XElement root, Dictionary<string, docProp> propDir, sitemap smap) {
      xrefPageObj res = new xrefPageObj { url = url };
      data sm; if (smap.TryGetValue(url, out sm)) res.sitemapParents = sm.parents(false).Select(p => p.uniqId).ToArray();
      var tit = root.Descendants("title").FirstOrDefault(); res.title = tit == null ? null : tit.Value;
      res.types = root.DescendantsAndSelf().Where(el => !ignTags.Contains(el.Name.LocalName)).Select(el => xrefTypeObj.fromXml(res, el, propDir)).ToArray();
      if (res.types.Length == 0) res.types = null;
      return res;
    }
    static string[] ignTags = new string[] { "html", "head", "title" };
  }

  public class xrefTypeObj { // of docXrefProp
    [XmlAttribute]
    public string type; //typ, definujici property
    [XmlIgnore, Newtonsoft.Json.JsonIgnore, JsonGenOnly]
    public xrefPageObj page;
    [XmlElementAttribute(typeof(xrefPropObj))]
    public xrefPropObj[] props;
    public static xrefTypeObj fromXml(xrefPageObj page, XElement root, Dictionary<string, docProp> propDir) {
      xrefTypeObj res = new xrefTypeObj { type = LowUtils.toCammelCase(root.Name.LocalName), page = page };
      res.props = root.Attributes().SelectMany(attr => xrefPropObj.fromXml(res, attr)).Where(xp => fillOrigin(xp, propDir)).ToArray();
      if (res.props.Length == 0) res.props = null;
      return res;
    }
    static bool fillOrigin(xrefPropObj xr, Dictionary<string, docProp> propDir) {
      //if (xr.prop == "parentProp") return false; docProp dp; if (propDir.TryGetValue(xr.type.type + "." + xr.prop, out dp)) { xr.originType = dp.ownerType; return true; } else return false;
      docProp dp; if (propDir.TryGetValue(xr.type.type + "." + xr.prop, out dp)) xr.originType = dp.ownerType;
      return true;
    }
  }

  public class xrefPropObj {
    [XmlAttribute]
    public string prop; //property
    [XmlAttribute]
    public string value; //jeji hodnota pro isValued
    [XmlAttribute]
    public string originType; //matersky typ, napr. pro gapFill.correctValue => edit
    [XmlIgnore, Newtonsoft.Json.JsonIgnore, JsonGenOnly]
    public xrefTypeObj type;
    public static IEnumerable<xrefPropObj> fromXml(xrefTypeObj type, XAttribute root) {
      var vals = root.Name.LocalName == "class" || root.Name.LocalName == "instrs" ? root.Value.Split(new char[] { ' ' }, StringSplitOptions.RemoveEmptyEntries) : XExtension.Create(root.Value);
      return vals.Select(v => new xrefPropObj { prop = LowUtils.toCammelCase(root.Name.LocalName), value = v, type = type });
    }
  }

  public class XrefContext {

    public static CmdXrefDataResult getXrefData(CmdXrefData par) {
      var url = string.IsNullOrEmpty(par.urlContext) ? "" : par.urlContext.ToLower();
      bool doRefresh = par.oper == CmdXrefDataOpers.refreshXref;
      XrefContext actCtx;
      string error = null;
      if (doRefresh || !allUrlContexts.TryGetValue(url, out actCtx)) {
        actCtx = new XrefContext();
        LoggerMemory err = new LoggerMemory(true);
        actCtx.adjustXrefData(url == "" ? null : url, doRefresh, err);
        error = err.Log().Replace("\r\n", "<br/>");
        allUrlContexts[url] = actCtx;
      }
      //lib.init();
      switch (par.oper) {
        case CmdXrefDataOpers.nodeTypes: return new CmdXrefDataResult { error = error, names = actCtx.nodeTypes(par.nodeId).ToArray() };
        case CmdXrefDataOpers.typeProps: return new CmdXrefDataResult { error = error, names = actCtx.typeProps(par.type, par.nodeId).ToArray() };
        case CmdXrefDataOpers.typePropValues: return new CmdXrefDataResult { error = error, names = actCtx.typePropValues(par.type, par.prop, par.nodeId).ToArray() };
        case CmdXrefDataOpers.typeLinks: return new CmdXrefDataResult { error = error, links = actCtx.typeLinks(par.type, par.nodeId, par.maxLinks).ToArray() };
        case CmdXrefDataOpers.typePropLinks: return new CmdXrefDataResult { error = error, links = actCtx.typePropLinks(par.type, par.prop, par.nodeId, par.maxLinks).ToArray() };
        case CmdXrefDataOpers.typePropValueLinks: return new CmdXrefDataResult { error = error, links = actCtx.typePropValueLinks(par.type, par.prop, par.value, par.nodeId, par.maxLinks).ToArray() };
        case CmdXrefDataOpers.nodeProps: return new CmdXrefDataResult { error = error, names = actCtx.nodeProps(par.nodeId).ToArray() };
        case CmdXrefDataOpers.propValues: return new CmdXrefDataResult { error = error, names = actCtx.propValues(par.prop, par.nodeId).ToArray() };
        case CmdXrefDataOpers.propLinks: return new CmdXrefDataResult { error = error, links = actCtx.propLinks(par.prop, par.nodeId, par.maxLinks).ToArray() };
        case CmdXrefDataOpers.propValueLinks: return new CmdXrefDataResult { error = error, links = actCtx.propValueLinks(par.prop, par.value, par.nodeId, par.maxLinks).ToArray() };
        case CmdXrefDataOpers.refreshXref: return new CmdXrefDataResult { error = error };
        case CmdXrefDataOpers.checkAll: return new CmdXrefDataResult { error = checkAllError() };
        default: throw new NotImplementedException();
      }
    }

    public static void allToRename() {
      var resName = @"d:\LMCom\rew\Web4\renamed\allxml.txt";
      var allFiles = validDirs.SelectMany(d => Directory.EnumerateFiles(Machines.rootDir + d.Replace('/', '\\'), "*.xml", SearchOption.AllDirectories)).Select(f => f.ToLower()).Where(f => !f.EndsWith("meta.xml")).Concat(File.ReadAllLines(@"d:\LMCom\rew\OldToNewData\fileGroups\allXmlNew.txt")).ToArray();
      File.WriteAllLines(resName, allFiles);
      return;
      LoggerMemory log = new LoggerMemory(true);
      CourseMeta.Lib.init(log, Machines.basicPath ?? @"d:\lmcom\", false);
      var exs = validDirs.SelectMany(d => CourseMeta.Lib.publishers.find(d).scan().Where(dt => (dt.type & (runtimeType.ex | runtimeType.error | runtimeType.mediaCutFile)) != 0)).ToArray();
      using (var fs = File.Open(resName, FileMode.Create)) using (var wr = new StreamWriter(fs)) {
        foreach (var ex in exs) {
          var fn = Machines.rootDir + ex.url.Replace('/', '\\') + ".xml";
          wr.WriteLine(fn);
        }
        //d:\LMCom\rew\EduAuthor\OldToNew\OldToNew_Transform.cs, line 226
        foreach (var fn in File.ReadAllLines(@"d:\LMCom\rew\OldToNewData\fileGroups\allXmlNew.txt")) wr.WriteLine(fn);
      }
    }

    public static string checkAllError() {
      LoggerMemory log = new LoggerMemory(true);
      CourseMeta.Lib.init(log, Machines.basicPath ?? @"d:\lmcom\", true); //RENAME
      var exs = validDirs.SelectMany(d => CourseMeta.Lib.publishers.find(d).scan().Where(dt => (dt.type & (runtimeType.ex | runtimeType.error | runtimeType.mediaCutFile)) != 0)).ToArray();
      Parallel.ForEach(exs, ex => ex.readTag(log));
      //foreach (var ex in exs) ex.readTag(log);
      var error = log.Log();
      return string.IsNullOrEmpty(error) ? ">>>>>>>>>>>>>>> ALL OK :-)" : error;
    }
    static string[] validDirs = new string[] { //RENAME
      "/grafia/",
      "/skrivanek/",
      "/data/instr/",
      "/lm/etestme/",
      "/lm/russian4/",
      "/lm/oldea/",
      "/lm/author/",
      "/lm/docexamples/",
      "/lm/pjexamples/",
      "/lm/examples/",
      //"/lm/examples/controls_sound/media/",
    };

    static Dictionary<string, XrefContext> allUrlContexts = new Dictionary<string, XrefContext>();

    void adjustXrefData(string srcUrl, bool refresh, LoggerMemory sb) {
      var url = srcUrl;
      if (url != null) {
        if (url.StartsWith("/")) url = url.Substring(1);
        if (url.EndsWith("/")) url = url.Substring(0, url.Length - 1);
      }
      this.url = url;
      this.xrefFn = Machines.rootPath + (url == null ? null : url.Replace('/', '\\') + "\\") + "meta.xref";
      if (refresh || !File.Exists(this.xrefFn)) {
        var sm = url == null ? CourseMeta.Lib.publishers : new sitemap(srcUrl, new LoggerMemory());
        xrefs = null;
        var xref = generateXref(XmlUtils.FileToObject<docTagsMeta>(Machines.rootPath + @"Author\tagsMeta.xml"), sm, sb).ToArray();
        XmlUtils.ObjectToFile(xrefFn, xref);
      }

      if (xrefs != null) return;
      xrefs = XmlUtils.FileToObject<xrefPageObj[]>(xrefFn);
      //var count = xrefs.SelectMany(p => p.types == null ? Enumerable.Empty<typeObj>() : p.types).SelectMany(t => t.props==null ? Enumerable.Empty<propObj>() : t.props).Count();
      foreach (var p in xrefs) foreach (var t in p.types) { t.page = p; if (t.props != null) foreach (var pr in t.props) pr.type = t; } //parent ptrs
      Func<IEnumerable<xrefPageObj>, xrefPageObj[]> uniqPages = pages => pages.GroupBy(p => p.url).Select(pg => pg.First()).ToArray(); //seznam jednoznacnych stranek
      //types
      typeToPages = xrefs.SelectMany(p => p.types).GroupBy(t => t.type).ToDictionary(
        g => g.Key,
        g => uniqPages(g.Select(t => t.page)));
      //props
      var props = xrefs.SelectMany(p => p.types).SelectMany(t => t.props == null ? Enumerable.Empty<xrefPropObj>() : t.props);
      typePropToPages = props.GroupBy(pr => pr.type.type).ToDictionary(
        g => g.Key,
        g => g.GroupBy(pr => pr.prop).ToDictionary(
          pg => pg.Key,
          pg => uniqPages(g.Select(t => t.type.page))));
      foreach (var tpName in typeToPages.Keys) if (!typePropToPages.ContainsKey(tpName)) typePropToPages.Add(tpName, new Dictionary<string, xrefPageObj[]>());
      typePropValToPages = props.GroupBy(pr => pr.type.type).ToDictionary(
        g => g.Key,
        g => g.GroupBy(pr => pr.prop).ToDictionary(
          pg => pg.Key,
          pg => pg.GroupBy(pr => pr.value).ToDictionary(
            pgv => pgv.Key,
            pgv => uniqPages(pgv.Select(t => t.type.page)))));
      propToPages = props.GroupBy(pr => pr.prop).ToDictionary(
        g => g.Key,
        g => uniqPages(g.Select(t => t.type.page)));
      propValToPages = props.GroupBy(pr => pr.prop).ToDictionary(
        g => g.Key,
        g => g.GroupBy(pr => pr.value).ToDictionary(
          pgv => pgv.Key,
          pgv => uniqPages(pgv.Select(t => t.type.page))));
    }

    IEnumerable<string> nodeTypes(int nodeId) {
      return nodeId < 0 ? typeToPages.Keys : typeToPages.Where(kv => kv.Value.Any(p => p.sitemapParents != null && p.sitemapParents.Contains(nodeId))).Select(kv => kv.Key);
    }
    IEnumerable<string> nodeProps(int nodeId) {
      return nodeId < 0 ? propToPages.Keys : propToPages.Where(kv => kv.Value.Any(p => p.sitemapParents != null && p.sitemapParents.Contains(nodeId))).Select(kv => kv.Key);
    }
    IEnumerable<string> typeProps(string type, int nodeId) {
      return nodeId < 0 ? typePropToPages[type].Keys : typePropToPages[type].Where(kv => kv.Value.Any(p => p.sitemapParents != null && p.sitemapParents.Contains(nodeId))).Select(kv => kv.Key);
    }
    IEnumerable<string> typePropValues(string type, string prop, int nodeId) {
      return nodeId < 0 ? typePropValToPages[type][prop].Keys : typePropValToPages[type][prop].Where(kv => kv.Value.Any(p => p.sitemapParents != null && p.sitemapParents.Contains(nodeId))).Select(kv => kv.Key);
    }
    IEnumerable<xrefLink> typeLinks(string type, int nodeId, int maxLinks) {
      return (nodeId < 0 ? typeToPages[type] : typeToPages[type].Where(p => p.sitemapParents != null && p.sitemapParents.Contains(nodeId))).Take(maxLinks).Select(l => new xrefLink { title = l.title, url = l.url });
    }
    IEnumerable<xrefLink> typePropLinks(string type, string prop, int nodeId, int maxLinks) {
      return (nodeId < 0 ? typePropToPages[type][prop] : typePropToPages[type][prop].Where(p => p.sitemapParents != null && p.sitemapParents.Contains(nodeId))).Take(maxLinks).Select(l => new xrefLink { title = l.title, url = l.url });
    }
    IEnumerable<xrefLink> typePropValueLinks(string type, string prop, string value, int nodeId, int maxLinks) {
      return (nodeId < 0 ? typePropValToPages[type][prop][value] : typePropValToPages[type][prop][value].Where(p => p.sitemapParents != null && p.sitemapParents.Contains(nodeId))).Take(maxLinks).Select(l => new xrefLink { title = l.title, url = l.url });
    }
    IEnumerable<string> propValues(string prop, int nodeId) {
      return nodeId < 0 ? propValToPages[prop].Keys : propValToPages[prop].Where(kv => kv.Value.Any(p => p.sitemapParents != null && p.sitemapParents.Contains(nodeId))).Select(kv => kv.Key);
    }
    IEnumerable<xrefLink> propLinks(string prop, int nodeId, int maxLinks) {
      return (nodeId < 0 ? propToPages[prop] : propToPages[prop].Where(p => p.sitemapParents != null && p.sitemapParents.Contains(nodeId))).Take(maxLinks).Select(l => new xrefLink { title = l.title, url = l.url });
    }
    IEnumerable<xrefLink> propValueLinks(string prop, string value, int nodeId, int maxLinks) {
      return (nodeId < 0 ? propValToPages[prop][value] : propValToPages[prop][value].Where(p => p.sitemapParents != null && p.sitemapParents.Contains(nodeId))).Take(maxLinks).Select(l => new xrefLink { title = l.title, url = l.url });
    }

    xrefPageObj[] xrefs;
    Dictionary<string, xrefPageObj[]> typeToPages;
    Dictionary<string, Dictionary<string, xrefPageObj[]>> typePropToPages;
    Dictionary<string, Dictionary<string, Dictionary<string, xrefPageObj[]>>> typePropValToPages;
    Dictionary<string, xrefPageObj[]> propToPages;
    Dictionary<string, Dictionary<string, xrefPageObj[]>> propValToPages;
    string xrefFn;
    string url;
    //static string xrefFn = Machines.basicPath + @"rew\Web4\author\xref.xml";


    //public void generateXref() {

    //  //generace xrefs
    //  var xref = generateXref(XmlUtils.FileToObject<docTagsMeta>(Machines.rootPath + @"Author\tagsMeta.xml"), CourseMeta.lib.publishers).ToArray();
    //  XmlUtils.ObjectToFile(xrefFn, xref);

    //  //sitemap (bez cviceni) to jsonML 
    //  StringBuilder sb = new StringBuilder();
    //  var sm = XElement.Load(CourseMeta.lib.siteFn); sm.Descendants("testEx").Remove();
    //  CourseModel.tag.xmlToJsonsLowMeta(sm, sb);
    //  File.WriteAllText(Machines.rootPath + @"author\xrefSitemap.js", sb.ToString());

    //}

    public static void adjustXrefSitemap(LoggerMemory sb) {
      var smFile = Machines.rootPath + @"author\xrefSitemap.js";
      if (!File.Exists(smFile)) {
        CourseMeta.Lib.init(sb, @"d:\lmcom\");
        StringBuilder buff = new StringBuilder();
        var sm = XElement.Load(CourseMeta.Lib.siteFn); sm.Descendants("ex").Remove();
        CourseModel.tag.xmlToJsonsLowMeta(sm, buff);
        File.WriteAllText(smFile, buff.ToString());
      }
    }

    IEnumerable<xrefPageObj> generateXref(docTagsMeta meta, sitemap smap, LoggerMemory sb) {
      var typeDir = meta.types.ToDictionary(t => t.name, t => t); //type => docType 
      //vsechny property vsech objektu => materska property (napr. gapFill.correctValue => edit.correctValue prop)
      var propsDir = meta.props.SelectMany(prop => typeDir[prop.ownerType].descendantsAndSelf.Select(typeId => new { typeId, prop })).ToDictionary(tp => tp.typeId + "." + tp.prop.name, tp => tp.prop);
      //return allExs().
      //  Select(fn => new { fn, url = fn.Substring(Machines.rootDir.Length).Replace(".xml", null).Replace('\\', '/') }).
      //  Select(fn => pageObj.fromXml(fn.url, loadAndValidate(fn.fn), propsDir, smap));
      return smap.scan().Where(n => n is ex || n.type == runtimeType.mediaCutFile).Select(ex => xrefPageObj.fromXml(ex.url, CourseModel.tag.loadExerciseXml(ex.fileName(), sb), propsDir, smap));
    }
    static string[] allDirs = new string[] { "lm", "grafia", "skrivanek" };

    //XElement loadAndValidate(string fn) {
    //  try {
    //    return CourseModel.tag.loadElement(fn, null, true);
    //  } catch (Exception exp) {
    //    return new XElement("html", new XElement("head", new XElement("title", "")), new XElement("body", new XElement("error", new XAttribute("msg", exp.Message))));
    //  }
    //}

    //IEnumerable<string> allExs() {
    //  var dirs = url == null ? allDirs : XExtension.Create(url);
    //  return dirs.SelectMany(d => Directory.EnumerateFiles(Machines.rootPath + d.Replace('/', '\\'), "*.xml", SearchOption.AllDirectories).Select(f => f.ToLower()).
    //    Where(f => !f.EndsWith("\\meta.xml") && f.IndexOf(@"\oldea\oldtonew\") == -1));
    //}

  }
}