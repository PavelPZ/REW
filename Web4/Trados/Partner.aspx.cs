using System;
using System.Collections.Generic;
using System.Configuration;
using System.Linq;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;

namespace web4.Trados {
  public partial class Partner : System.Web.UI.Page {
    protected void OKBtn_Click(object sender, EventArgs e) {
      string partner = ConfigurationManager.AppSettings["Trados.Code." + CodeTxt.Text];
      if (string.IsNullOrEmpty(partner)) return;
      Response.Cookies.Add(new HttpCookie("PartnerCode", partner));
      Response.Redirect("Partner_Search.aspx");
    }
  }
}