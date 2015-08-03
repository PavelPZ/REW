using System;
using System.Collections.Generic;
using System.Collections.Specialized;
using System.IO;
using System.Net;
using System.Web;
using System.Web.Script.Serialization;
using System.Web.UI;
using System.Web.UI.WebControls;
//using DotNetOpenAuth.OpenId;
//using DotNetOpenAuth.OpenId.RelyingParty;
//using DotNetOpenAuth.OpenId.Extensions.SimpleRegistration;
using System.Web.Security;
//using DotNetOpenAuth.OpenId.Extensions.AttributeExchange;
using System.Configuration;
using LMComLib;
using LMNetLib;
using DotNetOpenAuth.OpenId.RelyingParty;
using DotNetOpenAuth.OpenId.Extensions.AttributeExchange;
using DotNetOpenAuth.OpenId.Extensions.SimpleRegistration;

namespace LMWeb {

  public static class Lib {
    //public const string returnUrlCookieName = "returnUrl";
    //public const string lang_cookId = "lang";
    //public const string subsite_cookId = "subsite";

    public static void Login(HttpContext ctx) {
      //ctx.Response.RedirectLocation = urlInfo.comBasicPath() + string.Format("Services/LMLive/LMLive.aspx?lang={0}&returnurl={1}&subsite={2}", ui.Lang, HttpUtility.UrlEncode(ui.AbsoluteUri), ui.SubSite.ToString());
      ctx.Response.RedirectLocation = LoginUrl(ctx);
      ctx.Response.StatusCode = 302;
      ctx.Response.End();
    }
    public static string LoginUrl(HttpContext ctx) {
      urlInfo ui = urlInfo.GetUrlInfo();
      //ctx.Response.RedirectLocation = urlInfo.comBasicPath() + string.Format("Services/LMLive/LMLive.aspx?lang={0}&returnurl={1}&subsite={2}", ui.Lang, HttpUtility.UrlEncode(ui.AbsoluteUri), ui.SubSite.ToString());
      return urlInfo.comBasicPath() + string.Format("Services/LMLive/LMLive.aspx?returnurl={0}", HttpUtility.UrlEncode(ui.AbsoluteUri));
    }
  }

  public abstract class LMOpenIdButton : OpenIdButton {

    protected override void OnFailed(IAuthenticationResponse response) {
      base.OnFailed(response);
      if (Fail != null) Fail();
    }

    protected override bool OnLoggingIn(IAuthenticationRequest request) {
      var fetch = new FetchRequest();
      fetch.Attributes.AddRequired(WellKnownAttributes.Contact.Email);
      fetch.Attributes.AddRequired(WellKnownAttributes.Name.First);
      fetch.Attributes.AddRequired(WellKnownAttributes.Name.Last);
      request.AddExtension(fetch);
      request.AddExtension(new ClaimsRequest() { Email = DemandLevel.Request, FullName = DemandLevel.Request });
      RealmUrl = "http://" + smallAuthority(Page.Request.Url.Host);
      return base.OnLoggingIn(request);
    }

    protected override void OnLoggedIn(IAuthenticationResponse response) {
      base.OnLoggedIn(response);
      FetchResponse fetch = response.GetExtension<FetchResponse>();
      ClaimsResponse sr = response.GetUntrustedExtension<ClaimsResponse>();
      if (Logged != null) {
        if (fetch == null) {
          if (sr == null) Logged(type, response.ClaimedIdentifier, null, null, null);
          else Logged(type, response.ClaimedIdentifier, sr.Email, null, sr.FullName);
        } else
          Logged(type,
            response.ClaimedIdentifier,
            fetch.GetAttributeValue(WellKnownAttributes.Contact.Email),
            fetch.GetAttributeValue(WellKnownAttributes.Name.First),
            fetch.GetAttributeValue(WellKnownAttributes.Name.Last)
            );
      }
      string url = FacebookButton.ConvertRelativeUrlToAbsoluteUrl(Page, Page.AppRelativeVirtualPath);
      Page.Response.RedirectLocation = url;
    }

    public delegate void LoggedEvent(OtherType provider, string id, string email, string firstName, string lastName);

    public event LoggedEvent Logged;
    public event Action Fail;

    protected OtherType type;

    static string smallAuthority(string authority) {
      if (authority.IndexOf('.') >= 0 && !char.IsDigit(authority[0])) {
        string[] parts = authority.Split('.');
        if (parts.Length > 2) return parts[parts.Length - 2] + "." + parts[parts.Length - 1];
      }
      return authority;
    }

  }

  public class GoogleButton : LMOpenIdButton { public GoogleButton() { Identifier = "https://www.google.com/accounts/o8/id"; type = OtherType.Google; } }
  public class YahooButton : LMOpenIdButton { public YahooButton() { Identifier = "https://me.yahoo.com/"; type = OtherType.Yahoo; } }
  public class MyOpenIdButton : LMOpenIdButton { public MyOpenIdButton() { Identifier = "http://www.myopenid.com/"; type = OtherType.MyOpenId; } }

  public class FacebookButton : ImageButton {

    public FacebookButton()
      : base() {
      urlInfo ui = urlInfo.GetUrlInfo();
      if (ui == null) return;
    }

    static string code;

    protected override void OnInit(EventArgs e) {
      processAuthCode(Page, getAppInfo("appId"), getAppInfo("appSekretKey"), Logged, Fail, ref code);
    }

    string getAppInfo(string key) {
      string subSite = LMCookie.read(CookieIds.subsite);// Page.Request[LMWeb.Lib.subsite_cookId];
      return ConfigurationManager.AppSettings["Auth.Facebook." + key + "." + subSite];
    }

    protected override void OnClick(ImageClickEventArgs e) {
      base.OnClick(e);
      loginStart(Page, getAppInfo("appId"));
    }

    public event LMOpenIdButton.LoggedEvent Logged;
    public event Action Fail;

    //http://stackoverflow.com/questions/2764436/facebook-oauth-logout, z nejakeho duvodu nefunguje
    public static void Logout(HttpResponse resp, string appKey, string returnUrl) {
      if (code == null) return;
      string url = string.Format("http://www.facebook.com/logout.php?api_key={0}&session_key={1}&confirm=1&next={2}", appKey, HttpUtility.UrlEncode(code), HttpUtility.UrlEncode(returnUrl));
      code = null;
      resp.Redirect(url);
    }

    static void loginStart(Page pg, string appId) {
      //self Absolute Url
      string url = ConvertRelativeUrlToAbsoluteUrl(pg, pg.AppRelativeVirtualPath);
      //"ask for FB code". V url nesmi byt query string, jinak error v code asking
      pg.Response.Redirect(string.Format("https://www.facebook.com/dialog/oauth?client_id={0}&redirect_uri={1}&scope=email", HttpUtility.UrlEncode(appId), HttpUtility.UrlEncode(url)));
    }

    static void processAuthCode(Page pg, string appId, string appSekretKey, LMOpenIdButton.LoggedEvent onLogged, Action fail, ref string logoutCode) {
      //navrat z "ask for FB code"
      string code = pg.Request["code"];
      if (string.IsNullOrEmpty(code)) return;
      try {
        logoutCode = code;
        //url pro zjisteni token
        string url = ConvertRelativeUrlToAbsoluteUrl(pg, pg.AppRelativeVirtualPath);
        string tokenUrl = string.Format("https://graph.facebook.com/oauth/access_token?client_id={0}&redirect_uri={1}&client_secret={2}&code={3}",
          HttpUtility.UrlEncode(appId), HttpUtility.UrlEncode(url), HttpUtility.UrlEncode(appSekretKey), HttpUtility.UrlEncode(code));
        //get token data
        string tokenData = getData(tokenUrl);
        //parse and save token data
        NameValueCollection query = HttpUtility.ParseQueryString(tokenData);
        //res.Token = query["access_token"]; res.TokenExpired = int.Parse(query["expires"]);
        string token = query["access_token"];
        //url pro zjisteni informace o uzivateli
        string meUrl = string.Format("https://graph.facebook.com/me?access_token={0}", HttpUtility.UrlEncode(token));
        //info o uzivateli do public property
        string userData = getData(meUrl);
        JavaScriptSerializer ser = new JavaScriptSerializer();
        Dictionary<string, object> data = (Dictionary<string, object>)ser.Deserialize(userData, typeof(Dictionary<string, object>));
        if (onLogged != null) {
          object email, first, last, id;
          data.TryGetValue("id", out id); data.TryGetValue("email", out email); data.TryGetValue("first_name", out first); data.TryGetValue("last_name", out last);
          onLogged(OtherType.Facebook, id as string, email as string, first as string, last as string);
        }
      } catch {
        if (fail != null) fail();
      }
    }

    static string getData(string url) {
      HttpWebRequest req = (HttpWebRequest)WebRequest.Create(url);
      HttpWebResponse resp = (HttpWebResponse)req.GetResponse();
      using (Stream str = resp.GetResponseStream())
      using (StreamReader rdr = new StreamReader(str))
        return rdr.ReadToEnd();
    }

    public static string ConvertRelativeUrlToAbsoluteUrl(Page pg, string relativeUrl) {
      if (pg.Request.IsSecureConnection)
        return string.Format("https://{0}{1}", pg.Request.Url.Authority, pg.ResolveUrl(relativeUrl));
      else
        return string.Format("http://{0}{1}", pg.Request.Url.Authority, pg.ResolveUrl(relativeUrl));
    }
  }
}