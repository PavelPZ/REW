namespace flux {
  export interface IAppState { auth?: auth.IUser; }
}

namespace config {
  export interface IData { auth?: auth.IConfig; }
  cfg.data.auth = {
    stateCreated: compl => {
      var auth = flux.getState().auth = { ids: [], email: null };
      oauth.authFromCookie(auth);
      compl();
    },
    lmLoginPreserveDays: 365 * 2 //difotne 2 roky
  };
}

namespace auth {
  debugger;
  //zkontroluje authentifikaci. Kdyz neni auth, provede prihlaseni. Po dokonceni prihlaseni se vrati na returnHash.
  //volana pri route changed.
  export function loginRedirectWhenNeeded(): boolean {
    if (isLogged()) return false;
    oauth.saveLoginSourcePage(location.href); //URL pro navrat z uspesneho OAUTH
    router.goto(login.namedRoute.home);
    return true;
  }
  oauth.saveLoginSourcePage(null); //nova browser session => vyhod uschovanou oAuth login source page

  export function getOAuthLink(loginHtmlUrl: string, par: oauth.IInputPar): string { //link na oAuth stranku providera
    var retUrl = oauth.useLoginSourcePage();
    //URL pro navrat z uspesneho OAUTH je prazdna: dej home page
    if (utils.isEmpty(retUrl)) oauth.saveLoginSourcePage(router.fullPath(router.getHomeHash())); 
    return loginHtmlUrl + '#' + utils.urlStringifyQuery(par);
  }

  //globlni AUTH config
  export interface IConfig extends config.IInitProcConfig { lmLoginPreserveDays: number; }

  //rozsirovatelny interface s profile informacemi
  export interface IProfile {
  }

  export interface IUser extends flux.ISmartState, oauth.IAuthCookie {
    profile?: IProfile; //dalsi profile informace
  }
  export function isLogged(): boolean { return !!flux.getState().auth.email; }

}