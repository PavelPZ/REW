<%@ Page Language="C#" MasterPageFile="~/BS.Master" %>

<script runat="server">
  static string[] models = new string[] { 
    "~/Login/Login", "~/Login/LMLogin", "~/Login/Register", "~/Login/ChangePassword", 
    "~/Login/ForgotPassword", "~/Login/Profile", "~/Login/ConfirmRegistration", "~/Login/EMails", "~/JsLib/Controls/Common/OkCancel",
  };
  string courseTree;

  protected void Page_Load(object sender, EventArgs e) {
    foreach (var ctrl in models.SelectMany(m => scriptControls(m))) ScriptsPlace.Controls.Add(ctrl);
  }
  IEnumerable<Control> scriptControls(string name) {
    yield return Page.LoadControl(string.Format(c_ScriptCtrl, name));
  }
  const string c_ScriptCtrl = "{0}.ascx";
</script>

<asp:Content ID="Content1" ContentPlaceHolderID="Head" runat="server">
  <%=System.Web.Optimization.Styles.Render("~/cssLogin") %>
  <%=System.Web.Optimization.Scripts.Render("~/jsLogin") %>
</asp:Content>
<asp:Content ID="Content2" ContentPlaceHolderID="Content" runat="server">

  <div id="root" data-bind="template: rootTemplate"></div>

  <vm:JsRenderScript ID="dummy" runat="server" Name="Dummy" IsRoot="true">
  </vm:JsRenderScript>
  <asp:PlaceHolder runat="server" ID="ScriptsPlace" />
  <%--<p>
    <a href="javascript:login();">LOGIN</a>
  </p>--%>
  <script type="text/javascript">
    //ViewBase.addLoaded(function () {
    //  $('input, textarea').placeholder();
    //});

    //function login() {
    //  OAuth.authrequest(LMComLib.OtherType.Microsoft);
    //}
    //jso_configure({
    //  "facebook": {
    //    client_id: "125816694160413",
    //    redirect_uri: "http://localhost/lmcom/rew/Login/Default.aspx#register",
    //    authorization: "https://www.facebook.com/dialog/oauth",
    //    //Evidence OAuth 2.0 provideru: Awiki: http://en.wikipedia.org/wiki/OAuth#OAuth_2.0

    //    //Facebook: https://www.facebook.com/dialog/oauth ### https://graph.facebook.com/me
    //    //    https://developers.facebook.com/docs/reference/dialogs/oauth/ ### comma delimited scope: email ostatni automaticky
    //    //Google: https://accounts.google.com/o/oauth2/auth ### https://www.googleapis.com/oauth2/v1/userinfo 
    //    //    https://developers.google.com/accounts/docs/OAuth2Login ### space delimited scope: https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile
    //    //Microsoft: https://login.live.com/oauth20_authorize.srf ### ??? mozna vrati automaticky ??? 
    //    //    http://msdn.microsoft.com/en-us/library/live/hh826532.aspx ### space delimited scope: wl.signin wl.basic wl.email
    //    //LinkedIn: https://api.linkedin.com/uas/oauth/requestToken ### http://api.linkedin.com/v1/people/~:(id,first-name,last-name,email-address)  viz http://developer.linkedin.com/documents/field-selectors
    //    //    https://developer.linkedin.com/documents/authentication ### space delimited scope: r_basicprofile r_emailaddress (r_contactinfo)
    //    //Yandex: https://oauth.yandex.com/authorize ### http://api-fotki.yandex.ru/api/me/ (viz http://api.yandex.com/oauth/doc/dg/reference/accessing-protected-resource.xml)
    //    //    http://api.yandex.com/oauth/doc/dg/tasks/register-client.xml, http://api.yandex.com/oauth/doc/dg/yandex-oauth-dg.pdf, http://api.yandex.com/oauth/doc/dg/reference/obtain-access-token.xml
    //    //Yahoo: neumi
    //    presenttoken: "qs"
    //  }
    //}, { debug: true });

    Pager.initUrl = Login.initUrl();
    Login.InitModel(
      { logins: [LMComLib.OtherType.LANGMasterNoEMail, LMComLib.OtherType.Facebook, LMComLib.OtherType.Google, LMComLib.OtherType.Microsoft, LMComLib.OtherType.LANGMaster] },
      function () { ViewBase.initBootStrapApp(); }
    );
  </script>
</asp:Content>
