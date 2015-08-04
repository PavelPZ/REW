using DevExpress.Web.ASPxCallbackPanel;
using LMComLib;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;

namespace Statistics {
  public partial class StatDefault : System.Web.UI.Page {

    public StatDefault()
      : base() {
      HttpContext.Current.Items["StatDefault"] = this;
    }

    protected string locBack;

    public static StatDefault instance { get { return (StatDefault)HttpContext.Current.Items["StatDefault"]; } }

    protected override void InitializeCulture() { Statistics.StatLib.InitializeCulture(Context); }

    protected void Page_Init(object sender, EventArgs e) {
      wrongCompany = StatLib.cookieCompany() == null;
      if (wrongCompany) { contentPlace.Visible = false; return; }

      locBack = CSLocalize.localize("1563ac3543784d55b7d06e04fc480dd6", LocPageGroup.rew_school, "Back");

    }
    public bool wrongCompany = true;

    protected void Page_Load(object sender, EventArgs e) {
      if (wrongCompany || !IsCallback) return;
      var callbackId = Request["__CALLBACKID"].Split('$').Last();
      if (registeredPartAction.ContainsKey(callbackId)) { //novy callback
        Context.Session.Remove("clientPars");
        var par = Request["__CALLBACKPARAM"].Split(new char[] { ':' }, 2)[1];
        if (string.IsNullOrEmpty(par)) return;
        Context.Session["clientPars"] = Newtonsoft.Json.JsonConvert.DeserializeObject<Dictionary<string, Dictionary<string, string>>>(par);
        refreshPart();
      } else //
        refreshPart();
    }

    public Dictionary<string, Action<Dictionary<string, string>>> registeredPartAction = new Dictionary<string, Action<Dictionary<string, string>>>();

    //public void onCallback(string pars) {
    //  //Context.Session["clientPars"] = pars;
    //  //refreshPart();
    //}

    //public Dictionary<string, Dictionary<string, string>> clientPars() {
    //  Dictionary<string, Dictionary<string, string>> res2 = (Dictionary<string, Dictionary<string, string>>)HttpContext.Current.Items["clientPars"]; if (res2 != null) return res2;
    //  var par = (string)Context.Session["clientPars"]; if (string.IsNullOrEmpty(par)) return null;
    //  HttpContext.Current.Items["clientPars"] = res2 = Newtonsoft.Json.JsonConvert.DeserializeObject<Dictionary<string, Dictionary<string, string>>>(par);
    //  return res2;
    //}

    void refreshPart() {
      var pars = (Dictionary<string, Dictionary<string, string>>)Context.Session["clientPars"];
      //clientPars();
      if (pars == null) return;
      foreach (var par in pars)
        if (par.Value["visible"] == "True") {
          registeredPartAction[par.Key](par.Value);
          break;
        }
    }

  }

}