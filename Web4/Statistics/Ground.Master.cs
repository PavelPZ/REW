using LMComLib;
using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Threading;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;

namespace Statistics {
  public partial class Ground : System.Web.UI.MasterPage {
    protected void Page_Init(object sender, EventArgs e) {
      locBack = CSLocalize.localize(null, LocPageGroup.EA_Code, "Back");

      Packager.Config cfg;
      if (Machines.machine == "pz-w8virtual" || Machines.machine == "lm-frontend-5")
        cfg = new Packager.Config() {
          target = LMComLib.Targets.web,
          version = schools.versions.debug,
          lang = Langs.cs_cz,
        };
      else {
        Packager.ConfigLow cfgLow = ReleaseDeploy.Lib.signatureLow().cfg;
        cfg = new Packager.Config();
        cfgLow.copyTo(cfg);
      }
      cfg.startProcName = "no";
      headContent.Controls.Add(new LiteralControl(Packager.RewApp.headContent(true, cfg)));
    }

    protected string locBack;

  }
}