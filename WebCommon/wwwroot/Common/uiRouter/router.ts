
declare namespace uiRouter {
  class UrlMatcher {
    constructor(pattern: string);
    exec<T extends router.IPar>(url: string, query?: utils.TDirectory<string>): T;
    exec(url: string, query?: utils.TDirectory<string>): router.IPar;
    format(params: router.IPar): string;
  }
  class $UrlMatcherFactory { }
}

namespace config {
  export interface IData {
    uiRouter?: {
    };
  }
}

namespace router {

  export var routerActionId = 'router-action'; //actionId pro router action 
  //navazan routeru na HASH change notifikaci
  export function listenHashChange() {
    window.addEventListener('hashchange', () => {
      console.log(">hashchange fired: " + window.location.href);
      onHashChange();
    });
    onHashChange();
  }

  //NAVIGATE
  export function getHashUrl<T extends IPar>(src: IUrl<T>): string { return '#' + src.route.getHash(src.par); }
  export function getHash<T extends IPar>(route: RouteType, par?: T): string { return getHashUrl({ route: route, par: par }); }
  export function gotoUrl<T extends IPar>(src: IUrl<T>, ev?: React.SyntheticEvent) { if (ev) ev.preventDefault(); src.route.navigate(src.par); }
  export function goto<T extends IPar>(route: RouteType, par?: T, ev?: React.SyntheticEvent) { gotoUrl({ route: route, par: par }, ev); }

  //export function _getHashUrl(src: IUrl<any>): string { return '#' + src.route.getHash(src.par); }
  //export function _getHash(route: RouteType, par?: IPar): string { return getHashUrl({ route: route, par: par }); }
  //export function _gotoUrl(src: IUrl<any>, ev?: React.SyntheticEvent) { if (ev) ev.preventDefault(); src.route.navigate(src.par); }
  //export function _goto(route: RouteType, par?: IPar, ev?: React.SyntheticEvent) { gotoUrl({ route: route, par: par }, ev); }

  export function goHome(ev?: React.SyntheticEvent) { gotoUrl(homeUrl, ev); }
  export function getHomeHash(): string { return getHashUrl(homeUrl); }

  export function fullPath(hash: string): string { return location.href.split('#')[0] + hash; }

  //URL stringify
  const urlStrDelim = '~|~';
  export function urlStringify(url: IUrlType): string {
    return url.route.globalId() + urlStrDelim + (url.par ? JSON.stringify(url.par) : '');
  }
  export function urlParse(urlStr: string): IUrlType {
    var parts = urlStr.split(urlStrDelim);
    var par: IPar = utils.isEmpty(parts[1]) ? null : JSON.parse(parts[1]);
    return { route: routeDir[parts[0]], par: par };
  }


  //pojmenovane globalne dostupne a typed router stavy
  export var named: INamedRoutes = <any>{};
  export interface INamedRoutes { }; //rozsirovatelny interface s name router states

  //objektova reprezentace HASH casti URL
  export interface IUrl<T extends IPar> { route: Route<T>; par: T; }
  export type IUrlType = IUrl<IPar>;
  //predchudce vsech router state parametru
  export interface IPar { }
  //predchudce vsech router akci
  export interface IAction<T extends IPar> extends flux.IAction { par: T; }
  export type IActionType = IAction<IPar>;

  //*** inicilizace 
  export function init(...roots: Array<RouteType>): void { //definice stavu
    roots.forEach(s => s.afterConstructor(null));
  }
  export function setHome<T extends IPar>(state: Route<T>, par: T) { homeUrl = { route: state, par: par } } //definice difotniho stavu

  //3 moznosti navratu:
  //- potreba AUTH => nevola se COMPL callback
  //- jedna se o router action => compl(true)
  //- nejedna se o router action => compl(false)
  export function tryDispatchRoute(action: IActionType, compl: (routerProcessed:boolean) => void): void {
    var stName = action.moduleId + '/' + action.actionId;
    var rt = routeDir[stName]; if (!rt) { compl(false); return; }
    //route action => kontrola na authentifikaci a dispatch akce
    onDispatchRouteAction(rt, action, needsAuth => {
      if (needsAuth) return;
      //dokonci dispatch
      if (!rt.dispatch) throw 'Missing toute dispatch ' + rt.globalId();
      rt.dispatch((action as IActionType).par, () => compl(true));
    })
  }

  //*** onHashChange
  function onHashChange(hashStr?: string) {
    //hack pro navrat z oAuth loginu
    //if (auth.returnedFromOAuth(window.location.hash)) return;
    //trigger
    var url = toUrl(hashStr);
    if (!url) url = homeUrl;
    if (!url) return; //throw 'Missing uiRouter.States.setDefault call';
    var act = url.route.createAction(url.par);
    flux.trigger(act);
  }

  //*** PARSES
  export function toUrl<T extends IPar>(par: IQuery | string): IUrl<T> {
    var q: IQuery;
    if (!par) par = '';
    if (typeof par === 'string') q = toQuery(par); else q = par as IQuery;
    //angular uiRouter match
    var res: IUrl<T> = null;
    routes.find((st: Route<T>) => {
      var par = st.parseHash(q) as T; if (!par) return false;
      res = { route: st, par: par };
      return true;
    });
    return res;
  }
  export function toQuery(hashStr?: string): IQuery {
    //normalizacu par: zacina '/', neobsahuje '#'
    if (!hashStr) hashStr = window.location.hash;
    if (hashStr && hashStr.length > 0 && hashStr[0] == '#') hashStr = hashStr.substr(1);
    if (!hashStr || hashStr.length < 1) hashStr = '/';
    if (hashStr[0] != '/') hashStr = hashStr = '/' + hashStr;
    //oddeleni a parse query stringu
    var parts = hashStr.split('?'); var path = parts[0];
    var query: utils.TDirectory<string> = {};
    if (parts[1]) parts[1].split('&').forEach(p => {
      var nv = p.split('=');
      query[nv[0]] = nv[1];
    });
    return { path: parts[0], query: query }
  }
  export interface IQuery { path: string; query: utils.TDirectory<string>; }

  //**** locals
  var routes: Array<RouteType> = [];
  var routeDir: { [name: string]: RouteType; } = {};
  //var dir: { [name: string]: State<any>; } = {};
  export var homeUrl: IUrlType;

  //**** route CHANGING
  function onDispatchRouteAction(route: RouteType, action: IActionType, compl: (needsAuth:boolean) => void) {
    //test na authentifikaci
    if (route.needsAuth) {
      if (auth.loginRedirectWhenNeeded()) { compl(true); return; } //proveden redirect na prihlaseni (s navratem na HASH)
    }
    //route names, do kterych se vstupuje
    var r = route; var newr: Array<string> = []; do { newr.push(r.globalId()); r = r.parent; } while (r != null);
    actRoutes = newr;
    //zjisti seznam novych a starych routes
    var add: Array<string> = []; var del: Array<string> = [];
    for (var n of newr) if (actRoutes.indexOf(n)<0) add.push(n);
    for (var o of actRoutes) if (newr.indexOf(o)<0) del.push(o);
    //leaved routes
    if (del.length > 0) { del.sort(); del.reverse(); del.forEach(d => routeDir[d].onLeave()); }
    //entered routes
    if (newr.length > 0) {
      newr.sort(); 
      var callbacks = newr.map(n => new Promise((resolve, reject) => routeDir[n].onEnter(() => resolve())));
      Promise.all(callbacks).then(() => compl(false));
    } else compl(false);
  }
  var actRoutes: Array<string> = []; //names aktualnich routes, slouzi k notifikaci systemu o zmene route


  //**** ROUTE
  export class Route<T extends IPar> implements IConstruct<T> {

    constructor(public moduleId: string, public actionId: string, public pattern: string, otherPar: IConstruct<T> = null, ...childs: Array<RouteType>) {
      if (otherPar) Object.assign(this, otherPar);
      if (childs) childs.forEach(ch => ch.afterConstructor(this));
    }

    getHash(par?: T): string { return this.matcher.format(par || {}); }
    navigate(par?: T) {
      var hash = this.getHash(par);
      loger.log('>set hash: ' + hash);
      window.location.hash = hash
    }
    globalId(): string { return this.moduleId + '/' + this.actionId; }

    parseHash(pre: IQuery): T {
      var res = this.matcher.exec<T>(pre.path, pre.query);
      if (res && this.finishRoutePar) this.finishRoutePar(res);
      return res;
    }
    createAction(par: T): IAction<T> {
      return { moduleId: this.moduleId, actionId: this.actionId, par: par };
    }

    afterConstructor(parent: RouteType) {
      if (parent) {
        this.parent = parent;
        this.pattern = parent.pattern + this.pattern;
        this.actionId = parent.actionId + '.' + this.actionId;
        if (this.needsAuth === undefined) this.needsAuth = parent.needsAuth;
      }
      this.matcher = new uiRouter.UrlMatcher(this.pattern);
      //self registrace
      var nm = this.globalId();
      if (routeDir[nm]) throw `Route ${nm} already exists`;
      routeDir[nm] = this; routes.push(this);
    }
    parent: RouteType;
    private matcher: uiRouter.UrlMatcher;
    dispatch: (par: T, compl: utils.TCallback) => void; //sance osetrit dispatch mez Dispatch modulu

    onLeave() { console.log('>routeLeave: ' + this.globalId()); if (this.onLeaveProc) this.onLeaveProc(); } //notifikace o opusteni route
    onEnter(compl: utils.TCallback) { console.log('>routeEnter: ' + this.globalId()); if (this.onEnterProc) this.onEnterProc(compl); else compl(); } //notifikace o vstupu do route

    //IConstruct
    needsAuth: boolean;
    finishRoutePar: (h: T) => void;
    onLeaveProc: utils.TCallback;
    onEnterProc: utils.TAsync<void>;
  }
  export class RouteType extends Route<IPar> { }

  export interface IConstruct<T extends IPar> {
    needsAuth?: boolean;
    finishRoutePar?: (h: T) => void;
    onLeaveProc?: utils.TCallback;
    onEnterProc?: utils.TAsync<void>;
  }

  new uiRouter.$UrlMatcherFactory();

}


