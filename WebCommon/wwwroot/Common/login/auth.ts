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
  export function authRedirected(returnHash: string): boolean {
    if (isLogged()) return false;
    return false;
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
  export function login() {
  }
  export function logout() {
  }

  const oAuthUrlDelim = '^$*@"~`'; const oAuthUrlSign = '@e$o^1!!';
  export function encodeOAuthReturnUrl(): string {
    var parts = location.href.split('#');
    var hash = [oAuthUrlSign, location.hash, ''].join(oAuthUrlDelim);
    console.log(`>auth.encodeOAuthInput: hash=${hash}, url=${parts[0]}`);
    var res = parts[0] + '#' + encodeURIComponent(hash);
    return res;
  }

  export function returnedFromOAuth(hash: string): boolean {
    if (utils.isEmpty(hash)) return false;
    hash = decodeURIComponent(hash);
    if (hash.startsWith('#')) hash = hash.substr(1);
    if (!hash.startsWith(oAuthUrlSign)) return null;
    console.log('>oAuth result: ' + hash);
    var parts = hash.split(oAuthUrlDelim);
    if (parts.length != 3) return false;
    var res: oauth.IOutputPar = JSON.parse(parts[2]);
    //onLogged(res.email, res.firstName, res.lastName);
    setTimeout(() => location.hash = parts[1], 1);
    return true;
  }


}