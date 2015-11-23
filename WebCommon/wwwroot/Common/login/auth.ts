namespace flux {
  export interface IAppState { auth?: auth.IUser; }
}

namespace config {
  export interface IData { auth?: auth.IConfig; }
  cfg.data.auth = {
    stateCreated: compl => {
      var auth = flux.getState().auth = { ids: [], email: null };
      oauth.fromCookie(auth);
      compl();
    },
    cookiePreserveDays: 365 * 2 //difotne 2 roky
  };
}

namespace auth {

  //zkontroluje authentifikaci. Kdyz neni auth, provede prihlaseni. Po dokonceni prihlaseni se vrati na returnHash.
  //volana pri route changed.
  export function loginRedirectWhenNeeded(): boolean {
    if (isLogged()) return false;
    oauth.saveLoginSourcePage(location.href); //URL pro navrat z uspesneho OAUTH
    router.goto(login.namedRoute.home);
    return true;
  }
  oauth.saveLoginSourcePage(null); //nova browser session => vyhod uschovanou oAuth login source page

  export function loginNavigate(loginHtmlUrl: string, par: oauth.IInputPar): string {
    var retUrl = oauth.useLoginSourcePage();
    //URL pro navrat z uspesneho OAUTH je prazdna: dej home page
    if (utils.isEmpty(retUrl)) oauth.saveLoginSourcePage(router.fullPath(router.getHomeHash())); 
    return loginHtmlUrl + '#' + utils.urlStringifyQuery(par);
  }

  //globlni AUTH config
  export interface IConfig extends config.IInitProcConfig { cookiePreserveDays: number; }

  //rozsirovatelny interface s profile informacemi
  export interface IProfile {
  }

  export interface IUser extends flux.ISmartState, oauth.IAuthCookie {
    profile?: IProfile; //dalsi profile informace
  }
  export function isLogged(): boolean { return !!flux.getState().auth.email; }

  export function onLogged(cook: oauth.IAuthCookie, preserved: boolean) {
    var user = flux.getState().auth;
    user.email = cook.email; user.firstName = cook.firstName; user.lastName = cook.lastName;
    oauth.toCookie(cook, preserved ? config.cfg.data.auth.cookiePreserveDays : 0);
    flux.onStateChanged(user);
  }

  //******** skok a navrat z oAuth
  //const oAuthUrlSign = '@e$o^1!!';
  //export function fixOAuthReturnUrl(): string { //url, na kterou skoci oAuth po uspesne autorizaci
  //  var parts = location.href.split('#');
  //  var res = parts[0] + '#' + encodeURIComponent(oAuthUrlSign);
  //  return res;
  //}

  //export function returnedFromOAuth(hash: string): boolean { //zpracovani URL z fixOAuthReturnUrl, vcetne redirekt na URL z oAuth.saveLoginSourcePage
  //  if (utils.isEmpty(hash)) return false;
  //  hash = decodeURIComponent(hash);
  //  if (hash.startsWith('#')) hash = hash.substr(1);
  //  if (!hash.startsWith(oAuthUrlSign)) return null;
  //  debugger;
  //  console.log('>oAuth return');
  //  var cook = oauth.useLoginSourcePage();
  //  var url = router.toUrl(cook);
  //  if (!url) url = router.homeUrl;
  //  setTimeout(() => router.gotoUrl(url), 1);
  //  return true;
  //}


}