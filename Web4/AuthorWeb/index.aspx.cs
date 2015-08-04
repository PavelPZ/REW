using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;

namespace web4.AuthorWeb {
  public partial class index : System.Web.UI.Page {
    protected void Page_Load(object sender, EventArgs e) {
      StringBuilder sb = new StringBuilder();
      foreach (var fn in Packager.Consts.jsAuthorWebMin) sb.AppendLine(string.Format("<script type=\"text/javascript\" src=\"../{0}\"></script>", fn));
      jsPlace.Controls.Add(new LiteralControl(sb.ToString()));
    }
  }
}