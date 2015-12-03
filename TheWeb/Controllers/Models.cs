using DesignNew;
using LMComLib;
using LMNetLib;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Text;
using System.Web;
using System.Web.Mvc;

namespace TheWeb {
  public class HomeViewPars : servConfig.ViewPars {

    public string getCacheKey() {
      return string.Format("{0}/{1}/{2}/{3}/{4}/{5}", app, skin, brand, lang, debug, appPart).ToLower();
    }

    public HomeViewPars(HttpContextBase ctx, servConfig.Apps app) {
      string par;
      this.app = app;
      brand = Consts.allBrands.Contains(par = ctx.Request.QueryString["brand"]) ? LowUtils.EnumParse<servConfig.Brands>(par) : Cfg.cfg.defaultPars.brand;
      skin = Consts.allSkins.Contains(par = ctx.Request.QueryString["skin"]) ? LowUtils.EnumParse<servConfig.SkinIds>(par) : Cfg.cfg.defaultPars.skin;
      lang = Consts.allSwLangs.Contains(par = ctx.Request.QueryString["lang"]) ? LowUtils.EnumParse<Langs>(par) : Cfg.cfg.defaultPars.lang;
      debug = !string.IsNullOrEmpty(par = ctx.Request.QueryString["debug"]) ? par == "true" : Cfg.cfg.defaultPars.debug;
    }
  }

  public class ModelLow {
    public ModelLow(HttpContextBase ctx, HomeViewPars pars) {
      var csss = FileSources.getUrls(FileSources.indexPartFilter(false, pars.app, pars.skin, pars.brand, pars.lang, !pars.debug));
      css = urlsToTags(csss, false);
      var jss = FileSources.getUrls(FileSources.indexPartFilter(true, pars.app, pars.skin, pars.brand, pars.lang, !pars.debug));
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

  public abstract class ModelCommonCfg : ModelLow {

    public static Dictionary<servConfig.Apps, string> appPrefixes = new Dictionary<servConfig.Apps, string> { { servConfig.Apps.oauth, "oauth" }, { servConfig.Apps.web, "web" }, { servConfig.Apps.web4, "web4" } };

    public ModelCommonCfg(HttpContextBase ctx, HomeViewPars pars) : base(ctx, pars) {
      var req = HttpContext.Current.Request;
      UrlHelper url = new UrlHelper(req.RequestContext);
      var loginUrl = url.Action("OAuth", "Home", null, req.Url.Scheme, req.Url.Host);
      //var loginUrl = Microsoft.AspNet.Http.Extensions.UriHelper.Encode(rq.Scheme, rq.Host, rq.PathBase, new PathString("/" + HomeController.oAuthMask));
      cfg = "<script type='text/javascript'>var servCfg = " + Cfg.toJS(pars.app, loginUrl) + ";</script>";
    }
    public string cfg;
  }

  public class ModelOAuth : ModelCommonCfg {
    public ModelOAuth(HttpContextBase ctx, HomeViewPars pars) : base(ctx, pars) { }
  }

  public class ModelCommonTest : ModelCommonCfg {
    public ModelCommonTest(HttpContextBase ctx, HomeViewPars pars) : base(ctx, pars) {
      startJS = "<script type='text/javascript' src='~/common/" + pars.appPart + "/test.js'></script>";
    }
    public string startJS;
  }

  public class ModelWeb4 : ModelLow {
    public ModelWeb4(HttpContextBase ctx, HomeViewPars pars) : base(ctx, pars) {
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