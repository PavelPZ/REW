using LMComLib;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data.OleDb;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Net;
using System.Reflection;
using System.Text;
using System.Threading;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;

namespace web4.Schools {
  public partial class DictLingea : System.Web.UI.Page {
    protected Packager.Config cfg;

    protected void Page_Load(object sender, EventArgs ev) {
      cfg = new Packager.Config {
        lang = Langs.en_gb,
        target = LMComLib.Targets.web,
        version = schools.versions.debug,
        startProcName = "dictLingea.init",
        //ForceSoundPlayer = SoundPlayerType.HTML5,
        licenceConfig = new schools.licenceConfig() { serviceUrl = "statistics fake" }
      };
    }

  }
}