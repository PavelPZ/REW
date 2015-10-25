using System;
using System.Text;
using System.Linq;
using System.Configuration;

namespace WebCode {

  public partial class index : System.Web.UI.Page {
    protected void Page_Init(object sender, EventArgs e) {
      if (isCached()) {
        Response.StatusCode = 304;
        Response.SuppressContent = true;
        Response.End();
      } else {
        Response.Cache.SetLastModified(appLoadTime);
      }

      cfg = new Packager.Config() {
        target = LMComLib.Targets.web,
        version = isDebug ? schools.versions.debug : schools.versions.minified,
        dataBatchUrl = "/lm/lm_data_new/",
        lang = LMComLib.urlInfo.langStrToLang(Request["lang"]),
        canSkipCourse = true,
        canResetCourse = true,
        canResetTest = true,
        canSkipTest = true,
        persistType = schools.persistTypes.persistNewEA,
      };
      pageTitle = cfg.designId == "skrivanek" ? "Skřivánek" : "LANGMaster";
    }

    static DateTime appLoadTime = DateTime.Now;
    static bool isDebug = ConfigurationManager.AppSettings["cfg-isDebug"] == "true";

    protected Packager.Config cfg;
    protected string pageTitle;
    protected string scripts() {
      StringBuilder sb = new StringBuilder();
      foreach (var s in DesignNew.Deploy.allJS(cfg.version != schools.versions.debug, cfg.langStr)) script(sb, s);
      return sb.ToString();
    }
    protected string csss() {
      StringBuilder sb = new StringBuilder();
      var cssList = cfg.version != schools.versions.debug ? DesignNew.Deploy.cssMins : DesignNew.Deploy.css;
      foreach (var s in cssList) css(sb, s);
      return sb.ToString();
    }
    static void script(StringBuilder sb, string url) { sb.AppendFormat(@"  <script src='../{0}' type='text/javascript'></script>", url); sb.AppendLine(); }
    static void css(StringBuilder sb, string url) { sb.AppendFormat(@"  <link href='../{0}' rel='stylesheet' type='text/css' />", url); sb.AppendLine(); }

    bool isCached() {
      if (isDebug) return false;
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