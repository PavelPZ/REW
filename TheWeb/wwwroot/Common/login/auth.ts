namespace flux {
  export interface IAppState { auth?: auth.IUser; }
}

namespace config {
  export interface IData { auth?: auth.IConfig; }
  cfg.data.auth = {
    stateCreated: compl => {
      var auth = flux.getState().auth = { ids: [], email: null, providerId:0 };
      oauth.authFromCookie(auth);
      compl();
    },
    lmLoginPreserveDays: 365 * 2 //pocet dni, po ktere se pamatuje LM login (po zaskrtnuti Pamatuj si)
  };
}

namespace auth {

  //************** DEKLARACE

  //globlni AUTH config
  export interface IConfig extends config.IInitProcConfig { lmLoginPreserveDays: number; }

  //rozsirovatelny interface s profile informacemi
  export interface IProfile {
  }

  export interface IUser extends flux.ISmartState, oauth.IAuthCookie {
    profile?: IProfile; //dalsi profile informace
  }

  //************** CODE

  export function isLogged(): boolean { return !!flux.getState().auth.email; }

  //zkontroluje authentifikaci. Kdyz neni auth, provede prihlaseni. Po dokonceni prihlaseni se vrati na location.href.
  //volana pri route changed.
  export function loginRedirectWhenNeeded(): boolean {
    if (isLogged()) return false;
    oauth.saveLoginSourcePage(location.href); //URL pro navrat z uspesneho OAUTH
    router.gotoRoute(login.namedRoute.home);
    return true;
  }
  oauth.saveLoginSourcePage(null); //nova browser session => vyhod uschovanou URL s login source page

  export function getOAuthLink(loginHtmlUrl: string, par: oauth.IInputPar): string { //link na oAuth stranku providera
    var retUrl = oauth.useLoginSourcePage();
    //URL pro navrat z uspesneho OAUTH je prazdna => dej home page
    if (utils.isEmpty(retUrl)) oauth.saveLoginSourcePage(router.fullPath(router.getHomeHash()));
    return loginHtmlUrl + '#' + utils.urlStringifyQuery(par);
  }

}