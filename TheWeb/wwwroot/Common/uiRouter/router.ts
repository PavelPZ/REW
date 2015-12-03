const loginRedirectWhenNeeded = () => auth.loginRedirectWhenNeeded;
const trigger = () => flux.trigger;

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
  export function listenUrlChange() {
    window.addEventListener('popstate', e => {
      var hist: IHistoryType = e.state;
      var url = history2Url(hist);
      loger.log("listenUrlChange fired: " + window.location.href);
      //var act = url.route.createAction(url.par);
      trigger()(hist, utils.Noop);
      //tryDispatchRoute(act, utils.Noop);
    });
  }

  //NAVIGATE
  export function navigUrl<T extends IPar>(src: IUrl<T>, ev?: React.SyntheticEvent) { src.route.navig(src.par, ev); }
  export function navigRoute<T extends IPar>(route: RouteType, ev?: React.SyntheticEvent, par?: T) { navigUrl({ route: route, par: par }, ev); }
  export function navigHome(ev?: React.SyntheticEvent) { navigUrl(homeUrl, ev); }

  //vyjimecne pouzivane, obecne se musi pouzivat NAVIG nebo IHistory
  export function getRouteUrl<T extends IPar>(src: IUrl<T>): string { return src.route.getPath(src.par); }
  export function getUrl<T extends IPar>(route: RouteType, par?: T): string { return getRouteUrl({ route: route, par: par }); }
  export function getHomeUrl(): string { return getRouteUrl(homeUrl); }

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

  //***** HISTORY
  export type IHistory<T> = IAction<T>;
  //export interface IHistory<T extends IPar> { moduleId: string; actionId: string; par: T; }
  export type IHistoryType = IActionType;
  export function url2History(url: IUrlType): IHistoryType { return { moduleId: url.route.moduleId, actionId: url.route.actionId, par: url.par } }
  export function history2Url(hist: IHistoryType): IUrlType { var route = routeDir[hist.moduleId + '/' + hist.actionId]; return route ? { route: route , par: hist.par } : null; }

  //*** inicilizace 
  export function init(...roots: Array<RouteType>): void { //definice stavu
    roots.forEach(s => s.afterConstructor(null));
  }
  export function setHome<T extends IPar>(state: Route<T>, par: T) { homeUrl = { route: state, par: par } } //definice difotniho stavu

  //3 moznosti navratu:
  //- potreba AUTH => nevola se COMPL callback
  //- jedna se o router action => compl(true)
  //- nejedna se o router action => compl(false)
  export function tryDispatchRoute(action: IActionType, compl: (routeProcessed: boolean) => void): void {
    var inUrl = history2Url(action); if (!inUrl) { compl(false); return; }
    //var stName = action.moduleId + '/' + action.actionId;
    //var rt = routeDir[stName]; if (!rt) { compl(false); return; }
    ////route action => kontrola na authentifikaci a dispatch akce
    //var inUrl: IUrlType = { route: rt, par: (action as IActionType).par };
    onDispatchRouteAction(inUrl, outUrl => {
      //dokonci dispatch
      if (!outUrl.route.dispatch) loger.doThrow('Missing route dispatch ' + outUrl.route.globalId());
      outUrl.route.dispatch(outUrl.par, () => compl(true));
    })
  }

  function onDispatchRouteAction(inUrl: IUrlType, compl: (outUrl: IUrlType) => void) {
    //test na authentifikaci => vymen ev. aktualni URL za login URL
    if (inUrl.route.needsAuth) {
      var loginRoute = loginRedirectWhenNeeded()();
      if (loginRoute != null) {
        var hist = url2History(loginRoute);
        history.replaceState(hist, null, loginRoute.route.getPath(loginRoute.par));
        inUrl = loginRoute;
        loger.log('router.onDispatchRouteAction: auth redirect to ' + JSON.stringify(hist));
      }
    }
    //route names, do kterych se vstupuje
    var r = inUrl.route; var newr: Array<string> = []; do { newr.push(r.globalId()); r = r.parent; } while (r != null);
    //zjisti seznam novych a starych routes
    var add: Array<string> = []; var del: Array<string> = [];
    for (var n of newr) if (actRoutes.indexOf(n) < 0) add.push(n);
    for (var o of actRoutes) if (newr.indexOf(o) < 0) del.push(o);
    actRoutes = newr;
    //leaved routes
    if (del.length > 0) { del.sort(); del.reverse(); del.forEach(d => routeDir[d].onLeave()); }
    //entered routes
    if (add.length > 0) {
      add.sort();
      var callbacks = add.map(n => new Promise((resolve, reject) => routeDir[n].onEnter(() => resolve())));
      Promise.all(callbacks).then(() => compl(inUrl));
    } else compl(inUrl);
  }

  //*** onHashChange
  export function onInitRoute(compl: utils.TCallback) {
    //trigger
    var url = toUrl();
    if (!url) url = homeUrl;
    if (!url) return;
    url.route.navig(url.par, null, true, compl);
  }

  //*** PARSES
  export function toUrl<T extends IPar>(par?: IQuery | string): IUrl<T> {
    var q: IQuery;
    if (!par) par = '';
    if (typeof par === 'string') q = toQuery(par); else q = par as IQuery;
    //angular uiRouter match
    var res: IUrl<T> = null;
    routes.find((st: Route<T>) => {
      var par = st.parseRoute(q) as T; if (!par) return false;
      res = { route: st, par: par };
      return true;
    });
    return res;
  }
  export function toQuery(path?: string): IQuery {
    //normalizacu par: zacina '/', neobsahuje '#'
    if (!path) path = location.pathname;
    //if (path && path.length > 0 && path[0] == '#') path = path.substr(1);
    if (!path || path.length < 1) path = '/';
    if (path[0] != '/') path = path = '/' + path;
    //oddeleni a parse query stringu
    var parts = path.split('?'); var path = parts[0];
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
  var actRoutes: Array<string> = []; //names aktualnich routes, slouzi k notifikaci systemu o zmene route


  //**** ROUTE
  export class Route<T extends IPar> implements IConstruct<T> {

    constructor(public moduleId: string, public actionId: string, public pattern: string, otherPar: IConstruct<T> = null, ...childs: Array<RouteType>) {
      if (otherPar) Object.assign(this, otherPar);
      if (childs) childs.forEach(ch => ch.afterConstructor(this));
    }

    getPath(par?: T): string { return servCfg.server.rootUrl + this.matcher.format(par || {}); }

    navig(par?: T, ev?: React.SyntheticEvent, replace?: boolean, compl?: utils.TCallback) {
      if (ev) ev.preventDefault();
      var hist = url2History({ route: this, par: par });
      if (replace) history.replaceState(hist, null, this.getPath(par)); else history.pushState(hist, null, this.getPath(par));
      //var act = this.createAction(par);
      trigger()(hist, compl);
    }

    globalId(): string { return this.moduleId + '/' + this.actionId; }

    parseRoute(pre: IQuery): T {
      if (this.isAbstract) return null;
      var res = this.matcher.exec<T>(pre.path, pre.query);
      if (res && this.finishRoutePar) this.finishRoutePar(res);
      return res;
    }
    //createAction(par: T): IAction<T> {
    //  return { moduleId: this.moduleId, actionId: this.actionId, par: par };
    //}

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
      if (routeDir[nm]) loger.doThrow(`Route ${nm} already exists`);
      routeDir[nm] = this; routes.push(this);
    }
    parent: RouteType;
    private matcher: uiRouter.UrlMatcher;
    dispatch: (par: T, compl: utils.TCallback) => void; //sance osetrit dispatch mez Dispatch modulu

    onLeave() { loger.log('routeLeave: ' + this.globalId()); if (this.onLeaveProc) this.onLeaveProc(); } //notifikace o opusteni route
    onEnter(compl: utils.TCallback) { loger.log('routeEnter: ' + this.globalId()); if (this.onEnterProc) this.onEnterProc(compl); else compl(); } //notifikace o vstupu do route

    //IConstruct
    needsAuth: boolean;
    isAbstract: boolean;
    finishRoutePar: (h: T) => void;
    onLeaveProc: utils.TCallback;
    onEnterProc: utils.TAsync;
  }
  export class RouteType extends Route<IPar> { }

  export interface IConstruct<T extends IPar> {
    needsAuth?: boolean;
    isAbstract?: boolean;
    finishRoutePar?: (h: T) => void;
    onLeaveProc?: utils.TCallback;
    onEnterProc?: utils.TAsync;
  }

  new uiRouter.$UrlMatcherFactory();

}


