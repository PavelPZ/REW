using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;

namespace WebCode {
  public partial class index : System.Web.UI.Page {
    protected void Page_Load(object sender, EventArgs e) {
      cfg = new Packager.Config() {
        target = LMComLib.Targets.web,
        version = schools.versions.debug,
        //version = schools.versions.minified,
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
        sb.AppendLine("  <script src='../deploy/"+ cfg.langStr  + ".min.js' type='text/javascript'></script>");
      }
      return sb.ToString();
    }
  }

}