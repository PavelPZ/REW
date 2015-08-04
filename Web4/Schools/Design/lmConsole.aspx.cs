using System;
using System.Collections.Generic;
using System.IO;
using System.IO.Compression;
using System.Linq;
using System.Net;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;
using lmc = lmConsole;

namespace web4.Schools.Design {
  public partial class lmConsole : System.Web.UI.Page {
    protected void Page_Load(object sender, EventArgs e) {

    }

    protected void DownloadAllBtn_Click(object sender, EventArgs e) {
      lmc.lib.downloadAndProcessLogs();
    }

    protected void SimulateErrorBtn_Click(object sender, EventArgs e) {
      throw new Exception("Simulate Error Btn Click");
    }
  }
}