﻿using System;
using System.Text;
using System.Linq;
using System.Configuration;
using System.IO;
using LMComLib;
using DesignNew;
using LMNetLib;
using Newtonsoft.Json;

namespace WebCode {

  public partial class index : System.Web.UI.Page {
    protected void Page_Init(object sender, EventArgs e) {
      string designId = Request["designId"] ?? ConfigurationManager.AppSettings["cfg-designId"];
      bool isDebug = (Request["isDebug"] ?? ConfigurationManager.AppSettings["cfg-isDebug"]) == "true";
      var lang = Request["lang"] ?? "en_gb";
      cfg = new schools.config() {
        blobJS = ConfigurationManager.AppSettings["cfg-blobJS"], //URL s JS se cvicenimi
        blobMM = ConfigurationManager.AppSettings["cfg-blobMM"], //URL s obrazky, zvuky, videa, ...
        target = Targets.web,
        version = isDebug ? schools.versions.debug : schools.versions.minified,
        dataBatchUrl = "/lm/lm_data/",
        lang = urlInfo.langStrToLang(lang),
        designId = Consts.allBrands.Contains(designId) ? designId : null,
        canSkipCourse = true,
        canResetCourse = true,
        canResetTest = true,
        canSkipTest = true,
        persistType = schools.persistTypes.persistNewEA,
      };
      pageTitle = cfg.designId == "skrivanek" ? "Skřivánek" : "LANGMaster";
    }

    static DateTime appLoadTime = DateTime.Now;

    protected schools.config cfg;
    protected string pageTitle;
    protected string scripts() {
      StringBuilder sb = new StringBuilder();
      var langStr = cfg.lang == Langs.no ? null : cfg.lang.ToString().Replace('_', '-');
      //foreach (var s in DesignNew.Deploy.allJS(cfg.version != schools.versions.debug, langStr, cfg.designId)) script(sb, s);
      return sb.ToString();
    }
    protected string csss() {
      StringBuilder sb = new StringBuilder();
      //foreach (var s in DesignNew.Deploy.allCSS(cfg.version != schools.versions.debug, cfg.designId)) css(sb, s);
      return sb.ToString();
    }
    protected string htmls() {
      servConfig.Brands dsgnId = LowUtils.EnumParse<servConfig.Brands>(cfg.designId ?? "lm");
      return File.ReadAllText(Machines.rootPath + "app_data\\htmls\\html" + dsgnId.ToString() + ".txt");
    }
    static void script(StringBuilder sb, string url) { sb.AppendFormat(@"  <script src='../{0}' type='text/javascript'></script>", url); sb.AppendLine(); }
    static void css(StringBuilder sb, string url) { sb.AppendFormat(@"  <link href='../{0}' rel='stylesheet' type='text/css' />", url); sb.AppendLine(); }

    protected string writeCfg() { return string.Format("<script type='text/javascript'>\r\nvar cfg = {0};\r\n</script>\r\n", JsonConvert.SerializeObject(cfg)); }

    bool isCached() {
      if (cfg.version!=schools.versions.minified) return false;
      string header = Request.Headers["If-Modified-Since"]; //udaje, nastavene vyse v Response.Cache.SetLastModified(appLoadTime);
      if (header != null) {
        DateTime clientLastModified;
        if (DateTime.TryParse(header, out clientLastModified))
          return clientLastModified > appLoadTime.AddSeconds(-1); //musi se vyhladit nepresnost porovnani datumu
      }
      return false;
    }
  }

}