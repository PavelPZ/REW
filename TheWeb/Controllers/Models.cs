using DesignNew;
using LMComLib;
using LMNetLib;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Text;
using System.Web;
using System.Web.Mvc;

namespace TheWeb {

  public class MvcViewPars : servConfig.MvcViewPars {

    public string getCacheKey() {
      return string.Format("{0}/{1}/{2}/{3}/{4}", type, skin, brand, lang, debug).ToLower();
    }

    public MvcViewPars(HttpContextBase ctx, string typeStr, string routePrefixStr, string startProcStr) : this(ctx, LowUtils.EnumParse<servConfig.MvcViewType>(typeStr), LowUtils.EnumParse<servConfig.StartProc>(startProcStr), LowUtils.EnumParse<servConfig.RoutePrefix>(routePrefixStr)) {
    }

    public MvcViewPars(HttpContextBase ctx, servConfig.MvcViewType type, servConfig.StartProc startProc, servConfig.RoutePrefix routePrefix) {
      string par;
      this.type = type; this.startProc = startProc; this.routePrefix = routePrefix;
      brand = Consts.allBrands.Contains(par = ctx.Request.QueryString["brand"]) ? LowUtils.EnumParse<servConfig.Brands>(par) : Cfg.cfg.mvcViewPars.brand;
      skin = Consts.allSkins.Contains(par = ctx.Request.QueryString["skin"]) ? LowUtils.EnumParse<servConfig.SkinIds>(par) : Cfg.cfg.mvcViewPars.skin;
      lang = Consts.allSwLangs.Contains(par = ctx.Request.QueryString["lang"]) ? LowUtils.EnumParse<Langs>(par) : Cfg.cfg.mvcViewPars.lang;
      debug = !string.IsNullOrEmpty(par = ctx.Request.QueryString["debug"]) ? par == "true" : Cfg.cfg.mvcViewPars.debug;
    }
    public servConfig.StartProc startProc;
    public servConfig.RoutePrefix routePrefix;
  }

  public class ModelLow {
    public ModelLow(HttpContextBase ctx, MvcViewPars pars) {
      var csss = FileSources.getUrls(FileSources.indexPartFilter(false, pars.type, pars.skin, pars.brand, pars.lang, !pars.debug));
      css = urlsToTags(csss, false);
      var jss = FileSources.getUrls(FileSources.indexPartFilter(true, pars.type, pars.skin, pars.brand, pars.lang, !pars.debug));
      //Trace.TraceInformation("JSS: " + jss.Join("; "));
      js = urlsToTags(jss, true);
      title = pars.brand == servConfig.Brands.skrivanek ? "Skřivánek" : "LANGMaster";
    }
    public string title;
    public string css;
    public string js;
    //*** PRIVATE
    static void cssTag(StringBuilder sb, string url) { sb.AppendFormat(@"  <link href='~{0}' rel='stylesheet' type='text/css' />", url); sb.AppendLine(); }
    static void jsTag(StringBuilder sb, string url) { sb.AppendFormat(@"  <script src='~{0}' type='text/javascript'></script>", url); sb.AppendLine(); }
    static string urlsToTags(IEnumerable<string> urls, bool isJs) {
      var tag = isJs ? (Action<StringBuilder, string>)jsTag : cssTag;
      StringBuilder sb = new StringBuilder();
      foreach (var url in urls) tag(sb, url);
      return sb.ToString();
    }
  }

  public class ModelCfg : ModelLow {

    public ModelCfg(HttpContextBase ctx, MvcViewPars pars) : base(ctx, pars) {

      var cfgObj = JsonConvert.DeserializeObject<servConfig.Root>(JsonConvert.SerializeObject(cfg));
      //cfgObj.server.app = pars.app;
      cfgObj.routePrefix = pars.routePrefix; cfgObj.startProc = pars.startProc;
      //cisteni informaci
      cfgObj.azure.connectionString = null;
      cfgObj.sendGrid = null;
      cfgObj.mvcViewPars = null;
      //vysledek
      cfg = "<script type='text/javascript'>var servCfg = " + JsonConvert.SerializeObject(cfgObj) + ";</script>";
    }
    public string cfg;

  }

  public class ModelWeb4 : ModelLow {
    public ModelWeb4(HttpContextBase ctx, MvcViewPars pars) : base(ctx, pars) {
      var cfgObj = new schools.config() {
        blobJS = Cfg.cfg.azure.blobJS, //URL s JS se cvicenimi
        blobMM = Cfg.cfg.azure.blobMM, //URL s obrazky, zvuky, videa, ...
        target = Targets.web,
        version = pars.debug ? schools.versions.debug : schools.versions.minified,
        dataBatchUrl = "/lm/lm_data/",
        lang = pars.lang,
        designId = pars.brand.ToString(),
        canSkipCourse = true,
        canResetCourse = true,
        canResetTest = true,
        canSkipTest = true,
        persistType = schools.persistTypes.persistNewEA,
      };
      cfg = string.Format("<script type='text/javascript'>\r\nvar cfg = {0};\r\n</script>\r\n", JsonConvert.SerializeObject(cfgObj));
    }
    public string htmls;
    public string cfg;
  }

}