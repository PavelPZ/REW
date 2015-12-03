namespace flux {
  export interface IAppState { auth?: auth.IUser; }
}

namespace router {
  export interface INamedRoutes {
    oauth: { index: router.Route<auth.IOAuthPar>; }
  };
  named.oauth = {} as any;
}


namespace config {
  export interface IData { auth?: auth.IConfig; }
  cfg.data.auth = {
    initAppState: compl => {
      var auth = flux.getState().auth = { ids: [], email: null, providerId:0 };
      oauth.authFromCookie(auth);
      compl();
    },
    lmLoginPreserveDays: 365 * 2 //pocet dni, po ktere se pamatuje LM login (po zaskrtnuti Pamatuj si)
  };
}

namespace auth {

  var moduleId = 'oauth';
  router.init(
    router.named.oauth.index = new router.Route<auth.IOAuthPar>(moduleId, 'default', config.appPrefix(servConfig.Apps.oauth))
  );
  export interface IOAuthPar extends router.IPar{
    providerId: servConfig.oAuthProviders;
    client_id: string;
  }


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
  export function loginRedirectWhenNeeded(): router.IUrlType {
    if (isLogged()) return null;
    oauth.saveLoginSourcePage(location.href); //URL pro navrat z uspesneho OAUTH
    return login.homeUrl();
  }
  oauth.saveLoginSourcePage(null); //nova browser session => vyhod uschovanou URL s login source page

  //export function getOAuthLink(loginHtmlUrl: string, par: oauth.IInputPar): string { //link na oAuth stranku providera
  //  var retUrl = oauth.useLoginSourcePage();
  //  //URL pro navrat z uspesneho OAUTH je prazdna => dej home page
  //  if (utils.isEmpty(retUrl)) oauth.saveLoginSourcePage(router.fullPath(router.getHomeHash()));
  //  return loginHtmlUrl + '#' + utils.urlStringifyQuery(par);
  //}

  //function getOAuthLink(providerId: servConfig.oAuthProviders): string {
  //  var par = servCfg.oAuth.items[providerId];
  //  var res = auth.getOAuthLink(servCfg.oAuth.loginUrl, { client_id: par.clientId, providerId: providerId });
  //  return res;
  //}

  export function gotoAuth(providerId: servConfig.oAuthProviders, ev?: React.SyntheticEvent) {
    ev.preventDefault();

    //URL pro navrat z uspesneho OAUTH je prazdna => dej home page
    var retUrl = oauth.useLoginSourcePage();
    if (utils.isEmpty(retUrl)) oauth.saveLoginSourcePage(router.getHomeUrl());

    if (providerId == servConfig.oAuthProviders.lm) {
      router.navigRoute(router.named.login.login);
      return;
    }

    //oAuth url
    var providerPar = servCfg.oAuth.items[providerId];
    //var par: oauth.IInputPar = { client_id: providerPar.clientId, providerId: providerId };
    var par: IOAuthPar = { providerId: providerId, client_id:'' };

    //var res = config.loginUrl() + '#' + utils.urlStringifyQuery(par);
    flux.doExternalNavigate(router.named.oauth.index, ev, par);
    //location.href = res;
  }


}