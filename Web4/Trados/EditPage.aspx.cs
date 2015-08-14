using LMComLib;
using System;

namespace web4.Trados {
  public partial class EditPage : System.Web.UI.Page {
    protected void Page_Load(object sender, EventArgs e) {
      Machines.checkAdminIP(Context);
    }
  }
}