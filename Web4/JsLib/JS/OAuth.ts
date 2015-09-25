
//Facebook: https://www.facebook.com/dialog/oauth ### https://graph.facebook.com/me
//    https://developers.facebook.com/docs/reference/dialogs/oauth/ ### comma delimited scope: email ostatni automaticky
//Google: https://accounts.google.com/o/oauth2/auth ### https://www.googleapis.com/oauth2/v1/userinfo 
//    https://developers.google.com/accounts/docs/OAuth2Login ### space delimited scope: https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile
//Microsoft: https://login.live.com/oauth20_authorize.srf ### ??? mozna vrati automaticky ??? 
//    http://msdn.microsoft.com/en-us/library/live/hh826532.aspx ### space delimited scope: wl.signin wl.basic wl.email
//LinkedIn: https://api.linkedin.com/uas/oauth/requestToken ### http://api.linkedin.com/v1/people/~:(id,first-name,last-name,email-address)  viz http://developer.linkedin.com/documents/field-selectors
//    https://developer.linkedin.com/documents/authentication ### space delimited scope: r_basicprofile r_emailaddress (r_contactinfo)
//Yandex: https://oauth.yandex.com/authorize ### http://api-fotki.yandex.ru/api/me/ (viz http://api.yandex.com/oauth/doc/dg/reference/accessing-protected-resource.xml)
//    http://api.yandex.com/oauth/doc/dg/tasks/register-client.xml, http://api.yandex.com/oauth/doc/dg/yandex-oauth-dg.pdf, http://api.yandex.com/oauth/doc/dg/reference/obtain-access-token.xml
//Yahoo: neumi
//if ((<any>window).XDomainRequest) {
//  (<any>jQuery).ajaxTransport('+', function (s) { 
//    if (s.crossDomain && s.async) {
//      if (s.timeout) {
//        s.xdrTimeout = s.timeout;
//        delete s.timeout;
//      }
//      var xdr;
//      return {
//        send: function (_, complete) {
//          function callback(status, statusText, responses=null, responseHeaders=null) {
//            xdr.onload = xdr.onerror = xdr.ontimeout = jQuery.noop;
//            xdr = undefined;
//            complete(status, statusText, responses, responseHeaders);
//          }
//          xdr = new XDomainRequest();
//          xdr.onload = function () {
//            callback(200, "OK", { text: xdr.responseText }, "Content-Type: " + xdr.contentType);
//          };
//          xdr.onerror = function () {
//            callback(404, "Not Found");
//          };
//          xdr.onprogress = jQuery.noop;
//          xdr.ontimeout = function () {
//            callback(0, "timeout");
//          };
//          xdr.timeout = s.xdrTimeout || Number.MAX_VALUE;
//          xdr.open(s.type, s.url);
//          xdr.send((s.hasContent && s.data) || null);
//        },
//        abort: function () {
//          if (xdr) {
//            xdr.onerror = jQuery.noop;
//            xdr.abort();
//          }
//        }
//      };
//    }
//  });
//}

//declare var OAuthDefaultClient: 

module OAuth {

  var client_type: string;

  switch (location.host.toLowerCase()) {
    case "www.langmaster.com":
      client_type = location.protocol == "http:" ? "www_lm" : "s_www_lm";
      break;
    case "test.langmaster.com":
      client_type = location.protocol == "http:" ? "test_lm" : "s_test_lm"; break;
    case "www.eduland.vn":
      client_type = location.protocol == "http:" ? "eduland" : "s_eduland"; break;
    case "langmaster.jjlearning.com.mx":
      client_type = location.protocol == "http:" ? "alan" : "s_alan"; break;
    case "www.onlinetesty.skrivanek.cz":
    case "onlinetesty.skrivanek.cz":
      client_type = location.protocol == "http:" ? "skrivanek" : "s_skrivanek"; break;
    //case "localhost": client_type = "localhost"; break;

    default:
      client_type = location.protocol == "http:" ? 'default' : 'hdefault'; break; //app keys musi byt ulozeny v OAuthDefaultClient (v JsLib\JS\lmconsoleinit.js)
  }

  //obsah cookie pro redirekt na provider a zpet
  interface sessionState {
    state: string;
    providerid: LMComLib.OtherType;
  }

  //provider info
  export interface provider {
    providerid: LMComLib.OtherType;
    client_id: client; //ziskany z provider spravce
    authorizationUrl: string; //url pro autorizaci
    ajaxUrl: string; //url pro ziskani profile informaci
    ajaxUrlJsonp: string; //url pro ziskani profile informaci pomoci jsonp
    logoutUrl: string;
    scopes: string; //povol ziskani emailu apod.
    parseProfile: (obj: Object, providerid: LMComLib.OtherType) => profile; //vytazeni profile informaci z ajaxUrl
  }
  export interface client {
    www_lm: string;
    test_lm: string;
  }


  //autorizacni request
  interface request {
    response_type: string; //konstanta "token"
    state: string; //jednoznacny strink, pro kontrolu s response.state
    redirect_uri: string; //url pro navrat z authorizationUrl
    client_id: string; //id me aplikace
    scope: string; //co chci z profilu
  };

  //autorizacni response
  interface response {
    access_token: string; //vysledny token
    expires_in: string; //udaje o expiraci, nevyuzivam
    state: string; //state pro kontrolu
  }

  //info z profilu
  export interface profile {
    providerid: LMComLib.OtherType;
    id: string; //id uzivatele u providera
    email: string;
    firstName: string;
    lastName: string;
  }

  var cfg: provider[] = [];
  function addCfg(
    providerid: LMComLib.OtherType,
    client_id: client,
    authorizationUrl: string,
    ajaxUrl: string,
    scopes: string,
    logoutUrl: string,
    ajaxUrlJsonp: string,
    parseProfile: (obj: Object, providerid: LMComLib.OtherType) => profile,
    isCode: boolean = false,
    client_secret: string = null) {
      var c: provider = {
        providerid: providerid, client_id: client_id, authorizationUrl: authorizationUrl, ajaxUrl: ajaxUrl, scopes: scopes,
        parseProfile: parseProfile, isCode: isCode, client_secret: client_secret, logoutUrl: logoutUrl, ajaxUrlJsonp: ajaxUrlJsonp
      };
    cfg[c.providerid.toString()] = c;
  }


  /********************* FACEBOOK *****************************/
  //https://developers.facebook.com/docs/reference/dialogs/oauth/ 
  //pavel.zika@langmaster.com / edurom
  addCfg(LMComLib.OtherType.Facebook,
    {
      www_lm: '217099001634050',
      test_lm: '202002813170094',
      s_www_lm: '600606046618350',
      s_test_lm: '615996988429168',
      eduland: '491123084355646',
      s_eduland: '491123084355646',
      alan: '266038006937055',
      s_alan: '266038006937055',
      skrivanek: '849519431765938',
      s_skrivanek: '849519431765938',
    },
  //{ www_lm: "600606046618350", test_lm: "600606046618350" },

  //logout http://forums.asp.net/t/1768815.aspx/1
    "https://www.facebook.com/dialog/oauth", "https://graph.facebook.com/me", "email", "https://www.facebook.com", null,
    (obj: any, providerid: LMComLib.OtherType) => { var res: profile = { id: obj.id, email: obj.email, firstName: obj.first_name, lastName: obj.last_name ? obj.last_name : obj.name, providerid: providerid }; return res; });


  /********************* GOOGLE *****************************/
  //https://developers.google.com/accounts/docs/OAuth2UserAgent
  //https://code.google.com/apis/console/#project:475616334704:access, langmaster.com@gmail.com / asdfghjkl123_
  addCfg(LMComLib.OtherType.Google,
    {
      www_lm: '475616334704.apps.googleusercontent.com',
      test_lm: '475616334704-7caok7nqami8aio7aircs52rd1qag254.apps.googleusercontent.com',
      s_www_lm: '475616334704.apps.googleusercontent.com',
      s_test_lm: '475616334704-7caok7nqami8aio7aircs52rd1qag254.apps.googleusercontent.com',
      eduland: '475616334704-g6b9to8r245jh1mrf1k233b99lttv1ed.apps.googleusercontent.com',
      s_eduland: '475616334704-g6b9to8r245jh1mrf1k233b99lttv1ed.apps.googleusercontent.com',
      alan: '475616334704-0le99lu79aomar2rnaa1upp3ajop361g.apps.googleusercontent.com',
      s_alan: '475616334704-0le99lu79aomar2rnaa1upp3ajop361g.apps.googleusercontent.com',
      skrivanek: '475616334704-4f78jgp3s5hqum8tnb9b37lpp93vkogv.apps.googleusercontent.com',
      s_skrivanek: '475616334704-4f78jgp3s5hqum8tnb9b37lpp93vkogv.apps.googleusercontent.com',

    },
  //https://github.com/valenting/ffos-google-contact-importer/blob/master/index.html
    "https://accounts.google.com/o/oauth2/auth", "https://www.googleapis.com/oauth2/v1/userinfo", "https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile", "http://accounts.google.com/Logout", "https://www.googleapis.com/oauth2/v1/tokeninfo",
    //"https://accounts.google.com/o/oauth2/auth", "https://www.googleapis.com/oauth2/v1/userinfo", "https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile", "http://google.com/",
    (obj: any, providerid: LMComLib.OtherType) => {
      //debugger;
      //var res: profile = { id: obj.id, email: obj.email, firstName: obj.given_name, lastName: obj.family_name, providerid: providerid }; return res;
      var res: profile = { id: wrongMSIE ? obj.user_id : obj.id, email: obj.email, firstName: obj.given_name, lastName: obj.family_name, providerid: providerid }; return res;
    });

  /********************* MICROSOFT *****************************/
  //http://msdn.microsoft.com/en-us/library/live/hh826532.aspx
  //https://manage.dev.live.com/Applications/Index, pjanecek@langmaster.cz / cz.langmaster
  addCfg(LMComLib.OtherType.Microsoft,
    {
      www_lm: '00000000400DF001',
      test_lm: '00000000440EEFCD',
      s_www_lm: '00000000400DF001',
      s_test_lm: '00000000440EEFCD',
      eduland: '000000004011E10D',
      s_eduland: '000000004011E10D',
      alan: '000000004412613C',
      s_alan: '000000004412613C',
      skrivanek: '0000000048135E31',
      s_skrivanek: '0000000048135E31',
    },
    "https://login.live.com/oauth20_authorize.srf",
  //"https://apis.live.net/v5.0/me", 
    "https://apis.live.net/v5.0/me",
    "wl.signin wl.basic wl.emails", "https://login.live.com/",
    null, //"https://apis.live.net/v5.0/me?method=GET&interface_method=undefined&pretty=false&return_ssl_resources=false&x_http_live_library=Web%2Fie10_5.3&suppress_redirects=true",
    (obj: any, providerid: LMComLib.OtherType) => { var res: profile = { id: obj.id, email: _.compact(_.values(obj.emails))[0], firstName: obj.first_name, lastName: obj.last_name, providerid: providerid }; return res; });

  /********************* LM *****************************/
  addCfg(LMComLib.OtherType.LANGMaster, null, null, null, null, null, null, null);
  addCfg(LMComLib.OtherType.LANGMasterNoEMail, null, null, null, null, null, null, null);

  if (OAuthDefaultClient) {
    for (var p in OAuthDefaultClient) {
      var clients = OAuthDefaultClient[p];
      for (var pp in clients) {
        cfg[p].client_id[pp] = clients[pp];
      }
    }
  }

  //https://developer.linkedin.com/documents/authentication
  //addCfg(LMComLib.OtherType.LinkedIn, "bbeqjmfcikpm", "https://www.linkedin.com/uas/oauth2/authorization", "http://api.linkedin.com/v1/people/~:(id,first-name,last-name,email-address)", "r_basicprofile,r_emailaddress",
  //  (obj: any) => { var res: profile = { id: obj.id, email: obj.email, firstName: obj.first_name, lastName: obj.last_name }; return res; },
  //  true, "uh6OBJA1uY5reZgh");

  export var validProviders = _.pluck(_.values(cfg), "providerid");

  export function logoutUrl(type: LMComLib.OtherType): string { return cfg[type].logoutUrl }


  //Start externi authorizace, do cookie dej sessionState
  export function authrequest(providerid: LMComLib.OtherType) {

    var co: provider = cfg[providerid.toString()];

    Logger.trace_oauth("authrequest, config: " + JSON.stringify(co));

    //cookie content
    var sessState: sessionState = { providerid: providerid, state: Utils.guid() }

    //remove hash
    var ru = window.location.href, idx = window.location.href.indexOf("#");
    if (idx >= 0) ru = ru.substring(0, idx);

    var request: request = {
      response_type: "token",
      state: sessState.state,
      redirect_uri: ru,
      client_id: co.client_id[client_type],
      scope: co.scopes
    };

    var authurl = Utils.encodeURL(co.authorizationUrl, request);

    Logger.trace_oauth("authrequest, request: " + JSON.stringify(request));

    Cook.write(LMComLib.CookieIds.oauth, JSON.stringify(sessState), false);

    window.location.href = authurl;

  };

  export function checkForToken(completed: (profile: profile) => void): void {
    checkfortoken((provider: provider, token: string, isError: boolean, error: string) => {
      if (isError) completed(null);
      OAuth.getData(provider, token, completed);
    });
  }

  function parseQueryString(qs: string): Object {
    var e,
      a = /\+/g,  // Regex for replacing addition symbol with a space
      r = /([^&;=]+)=?([^&;]*)/g,
      d = function (s) { return decodeURIComponent(s.replace(a, " ")); },
      q = qs,
      urlParams = {};
    while (e = r.exec(q)) urlParams[d(e[1])] = d(e[2]);
    return urlParams;
  }


  //Navrat z externi authorizace, vyuzij sessionState z cookie
  /*
   * Check if the hash contains an access token. 
   * And if it do, extract the state
   */
  export function checkfortoken(callback: (provider: provider, token: string, isError: boolean, error: string) => void): void {
    //cookie info
    var ck = Cook.read(LMComLib.CookieIds.oauth, null);
    Logger.trace_oauth("checkfortoken, cookie: " + ck);
    Cook.remove(LMComLib.CookieIds.oauth);
    if (ck == null || ck == "") { callback(null, null, true, "missing session cookie"); return; }
    var sessState: sessionState = JSON.parse(ck);
    var provider: provider = cfg[sessState.providerid.toString()];

    //check and normalize hash
    var h = window.location.hash;
    Logger.trace_oauth("checkfortoken, hash: " + h);
    if (h == null) { callback(null, null, true, "missing hash"); return; }
    while (h.indexOf('#') >= 0) h = h.substring(h.indexOf('#') + 1);
    if (h.indexOf('/') >= 0) h = h.substring(1);
    if (h.indexOf("access_token") === -1) { callback(null, null, true, "missing access token"); return; }

    //parse hash
    var atoken: response = <response>parseQueryString(h);

    //check State
    if (atoken.state && atoken.state != sessState.state) { callback(null, null, true, "wrong state"); return; }

    Logger.trace_oauth("checkfortoken, token: " + atoken.access_token);

    //return access token
    callback(provider, atoken.access_token, false, null);
  }

  var wrongMSIE = $.browser.msie && parseInt($.browser.version, 10) <= 9; //neumi CORS, musi byt JSONP

  export function getData(provider: provider, token: string, completed: (profile: profile) => void) {
    Logger.trace_oauth("getData, token: " + token);

    var url = wrongMSIE ? provider.ajaxUrlJsonp : provider.ajaxUrl;
    if (url == null) url = provider.ajaxUrl;

    $.support.cors = true;
    $.ajax({
      type: "GET",
      crossDomain: true,
      url: url,
      //dataType: 'json',
      dataType: wrongMSIE ? 'jsonp' : 'json',
      success: (data: any) => {
        Logger.trace_oauth("getData, token" + JSON.stringify(data));
        completed(provider.parseProfile(data, provider.providerid));
      },
      data: provider.providerid == LMComLib.OtherType.Facebook ? { access_token: token, fields: 'email,first_name,last_name' } : { access_token: token },
      error: function (jqXHR, textStatus, errorThrown) {
        Logger.trace_oauth('*** error: ' + textStatus + ", " + errorThrown + ', ' + url);
        if (jqXHR.status === 401) Logger.trace_oauth("Token expired. About to delete this token");
      }
    });
  }
}

//xx/#DEBUG
module Logger {
  export function trace_oauth(msg: string): void {
    Logger.trace("OAuth", msg);
  }
}
//xx/#ENDDEBUG
//var noop = null;
