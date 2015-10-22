using System;
using System.Text;

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
        //version = schools.versions.debug,
        version = schools.versions.minified,
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

    protected Packager.Config cfg;
    protected string pageTitle;
    protected string scripts() {
      StringBuilder sb = new StringBuilder();
      if (cfg.version == schools.versions.debug) {
        sb.AppendLine("<script src='../jslib/scripts/jquery.js' type='text/javascript'></script>");
        foreach (var s in DesignNew.Deploy.allJS(cfg.langStr)) {
          sb.AppendFormat(@"  <script src='../{0}' type='text/javascript'></script>", s);
          sb.AppendLine();
        }
      } else {
        sb.AppendLine("  <script src='../jslib/scripts/jquery.min.js' type='text/javascript'></script>");
        sb.AppendLine("  <script src='../deploy/externals.min.js' type='text/javascript'></script>");
        sb.AppendLine("  <script src='../deploy/web.min.js' type='text/javascript'></script>");
        sb.AppendLine("  <script src='../deploy/" + cfg.langStr + ".min.js' type='text/javascript'></script>");
      }
      return sb.ToString();
    }

    bool isCached() { 
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