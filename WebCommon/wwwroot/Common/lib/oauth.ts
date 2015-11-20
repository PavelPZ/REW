namespace oauth {

  const authrequestCookieName = 'authrequestCookieName';

  //funkce volana pri vstupu do stranky
  //do stranky se vstupuje ve dvou kontextech: pri startu loginu a po navratu z OAuth providera
  function loginPageEnter() {
    try {
      let authResponse = getAuthResponse();
      //neni navrat z Provider.authrequest => start loginu. V hash je zakodovan IInputPar
      if (!authResponse) { 
        var inputParStr = window.location.hash; window.location.hash = '';
        if (inputParStr && inputParStr.length > 1 && inputParStr[0] == '#') inputParStr = inputParStr.substr(1);
        let inputPar = utils.urlParseQuery<IInputPar>(inputParStr);
        if (!inputPar || !inputPar.client_id || !inputPar.providerId) {
          //DEBUG: simulace volani stranky
          inputPar = { client_id: '765138080284696'/*id pro http://localhost:56264, pavel.zika@langmaster.com, edurom1*/, returnUrl: null, providerId: providerTypes.facebook };
          //non DEBUG: throw '!inputPar || !inputPar.client_id || !inputPar.providerId: ' + inputParStr;
        }
        let provider = getProvider(inputPar.providerId);
        provider.authrequest(inputPar);
        return;
      }
      //Navrat z auth response. V cookie je IAuthRequestCookie
      let authReqCook: IAuthRequestCookie = JSON.parse(cookies.get(authrequestCookieName) as string || 'null');
      cookies.remove(authrequestCookieName);
      if (authReqCook.state != authResponse.state) throw 'authReqCook.state != authResponse.state';
      let provider = getProvider(authReqCook.providerId);
      getProfileFromProvider(provider, authResponse.access_token, res => {
        if (res.error) throw 'res.error';
        if (authReqCook.returnUrl) loginReturn(authReqCook.returnUrl, res);
        else writeError(JSON.stringify(res, null, 2));
      });
    } catch (msg) {
      writeError(msg);
    }
  }

  class Provider {
    constructor(
      public providerId: providerTypes,
      public authorizationUrl: string, //url pro autorizaci
      public ajaxUrl: string, //url pro ziskani profile informaci
      public logoutUrl: string, //url pro ziskani profile informaci
      //public ajaxUrlJsonp: string, //url pro ziskani profile informaci pomoci jsonp
      public scopes: string //povol ziskani emailu apod.
    ) {
    }
    parseProfile(obj: any): IOutputPar { throw 'not implemented'; } //vytazeni profile informaci z ajaxUrl

    authrequest(inputPar: IInputPar) {
      console.log("authrequest start: " + JSON.stringify(inputPar));

      //cookie content
      var cookie: IAuthRequestCookie = { providerId: inputPar.providerId, state: new Date().getTime().toString(), returnUrl: inputPar.returnUrl };
      cookies.set(authrequestCookieName, JSON.stringify(cookie));

      //request par
      var request: IAuthRequest = {
        response_type: "token",
        state: cookie.state,
        redirect_uri: window.location.href,
        client_id: inputPar.client_id,
        scope: this.scopes
      };

      var authurl = utils.urlStringify(this.authorizationUrl, request);
      window.location.href = authurl;

      console.log("authrequest url: " + authurl);
    };
  }

  interface IAuthRequestCookie {
    state: string;
    providerId: providerTypes;
    returnUrl: string;
  }

  //autorizacni request
  interface IAuthRequest {
    response_type: string; //konstanta "token"
    state: string; //jednoznacny string, pro kontrolu s response.state
    redirect_uri: string; //url pro navrat z authorizationUrl
    client_id: string; //id me aplikace
    scope: string; //co chci z profilu
  };
  interface IAuthResponse {
    access_token: string; //vysledny token
    expires_in: string; //udaje o expiraci, nevyuzivam
    state: string; //state pro kontrolu
  }

  //https://developers.google.com/accounts/docs/OAuth2UserAgent
  //https://developers.google.com/identity/protocols/OAuth2UserAgent
  //https://code.google.com/apis/console/#project:475616334704:access, langmaster.com@gmail.com / asdfghjkl123_
  //GET request 
  //https://accounts.google.com/o/oauth2/auth?response_type=token&
  //  state=afefb17d-fbdc-438f-bfaa-e512bc8d0c4e&
  //  redirect_uri=http%3A%2F%2Flocalhost%2FWeb4%2FSchools%2FNewEA.aspx%3Flang%3Dcs-cz&
  //  client_id=&
  //  scope=https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fuserinfo.email%20https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fuserinfo.profile
  class GoogleProvider extends Provider {
    constructor(providerId: providerTypes) {
      super(providerId, 'https://accounts.google.com/o/oauth2/auth', 'https://www.googleapis.com/oauth2/v1/userinfo', 'http://accounts.google.com/Logout',
        'https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile');
    }
    parseProfile(obj: any): IOutputPar { //vytazeni profile informaci z ajaxUrl
      var res: IOutputPar = { id: obj.id, email: obj.email, firstName: obj.given_name, lastName: obj.family_name }; return res;
    }
  }

  //https://developers.facebook.com/docs/reference/dialogs/oauth/ pavel.zika@langmaster.com, edurom1
  class FacebookProvider extends Provider {
    constructor(providerId: providerTypes) {
      super(providerId, 'https://www.facebook.com/dialog/oauth', 'https://graph.facebook.com/me', 'https://www.facebook.com', 'email');
    }
    parseProfile(obj: any): IOutputPar { //vytazeni profile informaci z ajaxUrl
      var res: IOutputPar = { id: obj.id, email: obj.email, firstName: obj.first_name, lastName: obj.last_name ? obj.last_name : obj.name }; return res;
    }
  }

  //http://msdn.microsoft.com/en-us/library/live/hh826532.aspx
  //https://manage.dev.live.com/Applications/Index, pjanecek@langmaster.cz / cz.langmaster
  class MicrosoftProvider extends Provider {
    constructor(providerId: providerTypes) {
      super(providerId, 'https://login.live.com/oauth20_authorize.srf', 'https://apis.live.net/v5.0/me', 'https://login.live.com/', 'wl.signin wl.basic wl.emails');
    }
    parseProfile(obj: any): IOutputPar { //vytazeni profile informaci z ajaxUrl
      var res: IOutputPar = { id: obj.id, email: '' /*TODO _.compact(_.values(obj.emails))[0]*/, firstName: obj.first_name, lastName: obj.last_name }; return res;
    }
  }

  function getAuthResponse(): IAuthResponse {
    //check and normalize hash
    var h = window.location.hash; window.location.hash = '';
    if (!h) return null;
    while (h.indexOf('#') >= 0) h = h.substring(h.indexOf('#') + 1);
    if (h.indexOf('/') >= 0) h = h.substring(1);
    if (h.indexOf("access_token=") === -1) return null;
    return utils.urlParseQuery<IAuthResponse>(h);
  }

  function getProfileFromProvider(provider: Provider, accessToken: string, completed: (par: IOutputPar) => void) {
    var data = provider.providerId == providerTypes.facebook ? { access_token: accessToken, fields: 'email,first_name,last_name' } : { access_token: accessToken };
    var url = utils.urlStringify(provider.ajaxUrl, data);
    ajax.ajaxLow(url, null, null,
      res => {
        var resJson = JSON.parse(res.responseText);
        var profile = provider.parseProfile(resJson);
        completed(profile);
      },
      (err: ajax.IAjaxError) => {
        let res: IOutputPar = <any>{};
        res.error = JSON.stringify(err);
        completed(res);
      }
    ); 
  }

  function getProvider(providerId: providerTypes): Provider {
    switch (providerId) {
      case providerTypes.google: return new GoogleProvider(providerId);
      case providerTypes.microsoft: return new MicrosoftProvider(providerId);
      case providerTypes.facebook: return new FacebookProvider(providerId);
      default: throw 'not implemented';
    }
  }

  function writeError(msg: string) { setTimeout(() => document.getElementById('error-place').innerHTML = msg, 1); }

  //loginPageEnter();
}