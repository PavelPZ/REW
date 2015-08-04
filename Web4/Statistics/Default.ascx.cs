using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Threading;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;

namespace Statistics {

  public partial class Default : System.Web.UI.UserControl {

    //public string getLangStr() { return (string)Context.Items["langStr"]; }

    //public static void InitializeCulture(HttpContext ctx) {
    //  var l = LMComLib.urlInfo.langStrToLang(ctx.Request["lang"]); 
    //  var langStr = l.ToString().Replace('_', '-');
    //  Thread.CurrentThread.CurrentUICulture = Thread.CurrentThread.CurrentCulture = CultureInfo.CreateSpecificCulture(langStr);
    //  ctx.Items["langStr"] = langStr;
    //}

    //protected void Page_Load(object sender, EventArgs ev) {
    //  var cook = LMComLib.LMStatus.Cookie;
    //  var wrongRole = cook.Company == null || (cook.Company.RoleEx.Role & LMComLib.CompRole.Results) == 0;
    //  var viewStr = Request["view"];
    //  if (wrongRole || string.IsNullOrEmpty(viewStr)) {
    //    contentDiv.Visible = false;
    //    return;
    //  }
    //}
  }
}