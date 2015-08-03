//http://blog.techcle.com/2010/03/20/simple-oauth-integration-for-twitter-in-asp-net-mvc/
//http://ben.onfabrik.com/posts/oauth-providers
using System;
using System.Collections.Generic;
using System.Collections.Specialized;
using System.IO;
using System.Net;
using System.Web;
using System.Web.Script.Serialization;
//using DotNetOpenAuth.OpenId.Extensions.AttributeExchange;
//using DotNetOpenAuth.OpenId.Extensions.SimpleRegistration;
//using DotNetOpenAuth.OpenId.RelyingParty;
using LMComLib;
using LMNetLib;
using DotNetOpenAuth.OpenId.RelyingParty;
using DotNetOpenAuth.OpenId.Extensions.AttributeExchange;
using DotNetOpenAuth.OpenId.Extensions.SimpleRegistration;

namespace LMWeb {

  public static class LibSmall {

    public class LoginResult {
      public OtherType Type;
      public string Id;
      public string EMail;
      public string FirstName;
      public string LastName;
      public string ReturnUrl;
    }

    const string sessionType = "loginType";
    const string sessionReturnUrl = "returnUrl";

    public static void onLoaded(HttpContext ctx, string fbAppId, string fbSecretKey, Action<LoginResult> completed) {
      var str = ctx.Session[sessionType] as string;
      if (string.IsNullOrEmpty(str)) return;
      string returnUrl = ctx.Request[sessionReturnUrl];
      OtherType type = LowUtils.EnumParse<OtherType>(str);
      switch (type) {
        case OtherType.Facebook:
          string code = ctx.Request["code"];
          if (string.IsNullOrEmpty(code)) return;
          try {
            ctx.Session[sessionType] = null;
            //url pro zjisteni token
            string url = new UriBuilder(ctx.Request.Url) { Query = "" }.Uri.AbsoluteUri;
            //string url = ctx.Request.Url.AbsoluteUri.Split('?')[0];
            string tokenUrl = string.Format("https://graph.facebook.com/oauth/access_token?client_id={0}&redirect_uri={1}&client_secret={2}&code={3}",
              HttpUtility.UrlEncode(fbAppId), HttpUtility.UrlEncode(url + "?returnUrl=" + returnUrl), HttpUtility.UrlEncode(fbSecretKey), HttpUtility.UrlEncode(code));
            //get token data
            string tokenData = getData(tokenUrl);
            //parse and save token data
            NameValueCollection query = HttpUtility.ParseQueryString(tokenData);
            string token = query["access_token"];
            //url pro zjisteni informace o uzivateli
            string meUrl = string.Format("https://graph.facebook.com/me?access_token={0}", HttpUtility.UrlEncode(token));
            //info o uzivateli do public property
            string userData = getData(meUrl);
            JavaScriptSerializer ser = new JavaScriptSerializer();
            Dictionary<string, object> data = (Dictionary<string, object>)ser.Deserialize(userData, typeof(Dictionary<string, object>));
            object email, first, last, id;
            data.TryGetValue("id", out id); data.TryGetValue("email", out email); data.TryGetValue("first_name", out first); data.TryGetValue("last_name", out last);
            completed(new LoginResult() {
              ReturnUrl = returnUrl,//ctx.Session[sessionReturnUrl] as string,
              EMail = email.ToString(),
              FirstName = first.ToString(),
              LastName = last.ToString(),
              Id = id.ToString(),
              Type = type,
            });
          } catch (Exception exp) {
            if (exp == null) return;
          }
          break;
        case OtherType.Google:
        case OtherType.Yahoo:
        case OtherType.MyOpenId:
          OpenIdRelyingParty rp = new OpenIdRelyingParty();
          var r = rp.GetResponse();
          if (r == null) return;
          ctx.Session[sessionType] = null;
          switch (r.Status) {
            case AuthenticationStatus.Authenticated:
              FetchResponse fetchResponse = r.GetExtension<FetchResponse>();
              completed(new LoginResult() {
                ReturnUrl = returnUrl,//ctx.Session[sessionReturnUrl] as string,
                EMail = fetchResponse.GetAttributeValue(WellKnownAttributes.Contact.Email),
                FirstName = fetchResponse.GetAttributeValue(WellKnownAttributes.Name.First),
                LastName = fetchResponse.GetAttributeValue(WellKnownAttributes.Name.Last) ?? fetchResponse.GetAttributeValue(WellKnownAttributes.Name.FullName),
                Id = r.ClaimedIdentifier.ToString(),
                Type = type,
              });
              break;
            case AuthenticationStatus.Canceled:
              throw new Exception("AuthenticationStatus.Canceled");
              //lblAlertMsg.Text = "Cancelled.";
              break;
            case AuthenticationStatus.Failed:
              throw new Exception("AuthenticationStatus.Failed");
              //lblAlertMsg.Text = "Login Failed.";
              break;
          }
          break;
      }
    }

    public static void onLoginClick(HttpContext ctx, OtherType type, string fbAppId, string returnUrl) {
      ctx.Session[sessionType] = type.ToString();
      var actUri = new UriBuilder(ctx.Request.Url) { Query = "" };
      string loginWithReturnUrl = actUri.Uri.AbsoluteUri + "?" + sessionReturnUrl + "=" + HttpUtility.UrlEncode(returnUrl);
      //ctx.Session[sessionReturnUrl] = returnUrl;
      if (type == OtherType.Facebook) {
        ctx.Response.Redirect(string.Format(
          "https://www.facebook.com/dialog/oauth?client_id={0}&redirect_uri={1}&scope=email", 
          HttpUtility.UrlEncode(fbAppId), 
          //HttpUtility.UrlEncode(actUri.Uri.AbsoluteUri)));
          HttpUtility.UrlEncode(loginWithReturnUrl)));
      } else {
        string discoveryUri;
        switch (type) {
          case OtherType.Google: discoveryUri = "https://www.google.com/accounts/o8/id"; break;
          case OtherType.MyOpenId: discoveryUri = "http://www.myopenid.com/"; break;
          case OtherType.Yahoo: discoveryUri = "https://me.yahoo.com/"; break;
          default: throw new NotImplementedException();
        }
        OpenIdRelyingParty openid = new OpenIdRelyingParty();
        var uri = new Uri(loginWithReturnUrl);
        var req = openid.CreateRequest(discoveryUri, uri, uri);
        //var req = openid.CreateRequest(discoveryUri, actUri.Uri, actUri.Uri);
        var ax = new FetchRequest();
        ax.Attributes.Add(new AttributeRequest(WellKnownAttributes.Contact.Email, true));
        ax.Attributes.Add(new AttributeRequest(WellKnownAttributes.Name.First, true));
        ax.Attributes.Add(new AttributeRequest(WellKnownAttributes.Name.Last, true));
        ax.Attributes.Add(new AttributeRequest(WellKnownAttributes.Name.FullName, true));
        req.AddExtension(ax);
        req.AddExtension(new ClaimsRequest() { Email = DemandLevel.Request, FullName = DemandLevel.Request });
        req.RedirectToProvider();
      }
    }

    /*static void gotoReturnUrl(HttpContext ctx) {
      string retUrl = ctx.Session[sessionReturnUrl] as string;
      ctx.Session[sessionReturnUrl] = null;
      if (!string.IsNullOrEmpty(retUrl)) ctx.Response.Redirect(retUrl);
    }*/

    static string getData(string url) {
      HttpWebRequest req = (HttpWebRequest)WebRequest.Create(url);
      HttpWebResponse resp = (HttpWebResponse)req.GetResponse();
      using (Stream str = resp.GetResponseStream())
      using (StreamReader rdr = new StreamReader(str))
        return rdr.ReadToEnd();
    }
  }
 
}