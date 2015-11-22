namespace flux {
  export interface IAppState { auth?: auth.IUser; }
}

namespace config {
  export interface IData { auth?: config.IInitProcConfig; }
  cfg.data.auth = {
    stateCreated: () => flux.getState().auth = { ids: [] }
  };
}

namespace auth {

  export interface IProfile { //rozsirovatelny interface s profile informacemi
  }
  export interface IUser extends flux.ISmartState {
    email?: string;
    firstName?: string;
    lastName?: string;
    profile?: IProfile; //dalsi profile informace
  }
  export function isLogged(): boolean { return !!flux.getState().auth.email; }
  export function onLogged(email: string, firstName: string, lastName: string) {
    var user = flux.getState().auth;
    user.email = email; user.firstName = firstName; user.lastName = lastName;
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
    onLogged(res.email, res.firstName, res.lastName);
    setTimeout(() => location.hash = parts[1], 1);
    return true;
  }
  
 
}