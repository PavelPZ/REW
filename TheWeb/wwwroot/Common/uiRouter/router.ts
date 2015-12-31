var loginRedirectWhenNeeded: () => router.IUrlType; // = () => auth.loginRedirectWhenNeeded;

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
      loger.log("history popstate: " + JSON.stringify(hist));
      flux.trigger(hist, null, true);
    });
  }

  //NAVIGATE
  export function navigUrl<T extends IPar>(src: IUrl<T>, ev?: React.SyntheticEvent) { src.route.navig(src.par, ev); }
  export function navigRoute<T extends IPar>(route: RouteType, ev?: React.SyntheticEvent, par?: T, replace?: boolean) { navigUrl({ route: route, par: par, replace: replace }, ev); }
  export function navigHome(ev?: React.SyntheticEvent) { navigUrl(homeUrl, ev); }

  //vyjimecne pouzivane, obecne se musi pouzivat NAVIG nebo IHistory
  export function getRouteUrl<T extends IPar>(src: IUrl<T>, routePrefix: servConfig.RoutePrefix, startProc: servConfig.StartProc): string { return src.route.getPath(src.par, routePrefix, startProc); }
  //export function getUrl<T extends IPar>(route: RouteType, par?: T, replace?: boolean): string { return getRouteUrl({ route: route, par: par, replace: replace }); }
  export function getHomeUrl(): string { return getRouteUrl(homeUrl, servCfg.routePrefix, servCfg.startProc); }
  export function getInternalUrl<T extends IPar>(route: RouteType, par?: T): string { return getRouteUrl({ route: route, par: par }, servCfg.routePrefix, servCfg.startProc); }

  //pojmenovane globalne dostupne a typed router stavy
  export var named: INamedRoutes = <any>{};
  export interface INamedRoutes { }; //rozsirovatelny interface s name router states

  //objektova reprezentace URL
  export interface IUrl<T extends IPar> { route: Route<T>; par?: T; replace?: boolean; }
  export type IUrlType = IUrl<IPar>;
  //predchudce vsech router state parametru
  export interface IPar { }
  //predchudce vsech router akci
  export interface IHistory<T extends IPar> extends flux.IAction { par: T; replace: boolean; }
  export type IHistoryType = IHistory<IPar>;

  //***** HISTORY
  export function url2History(url: IUrlType): IHistoryType { return { moduleId: url.route.moduleId, actionId: url.route.actionId, par: url.par, replace: url.replace } }
  export function history2Url(hist: IHistoryType): IUrlType { var route = routeDir[hist.moduleId + '/' + hist.actionId]; return route ? { route: route, par: hist.par, replace: hist.replace } : null; }

  //*** inicilizace 
  export function activate<T extends IPar>(state: Route<T>, par?: T, ...roots: Array<RouteType>): void {
    if (!roots) roots = [state];
    roots.forEach(s => s.activate());
    homeUrl = { route: state, par: par ? par : {} };
  } //aktivuj routes
  //export function setHome<T extends IPar>(state: Route<T>, par: T) { homeUrl = { route: state, par: par } } //definice difotniho stavu

  //3 moznosti navratu:
  //- potreba AUTH => nevola se COMPL callback
  //- jedna se o router action => compl(true)
  //- nejedna se o router action => compl(false)
  export function tryDispatchRoute(action: IHistoryType, inHistoryPopState:boolean, compl: (routeProcessed: boolean) => void): void {
    var inUrl = history2Url(action); if (!inUrl) { compl(false); return; }
    onDispatchRouteAction(inUrl, outUrl => {
      if (!inHistoryPopState) {
        var path = outUrl.route.getPath(outUrl.par, servCfg.routePrefix, servCfg.startProc); var hist = url2History(outUrl)
        if (outUrl.replace) history.replaceState(hist, null, path); else history.pushState(hist, null, path);
        loger.log(`history pushState: replace=${hist.replace ? "true" : "false"}, hist=${JSON.stringify(hist)}`);
      }
      //dokonci dispatch
      if (!outUrl.route.dispatch) loger.doThrow('Missing route dispatch ' + outUrl.route.globalId());
      outUrl.route.dispatch(outUrl.par, () => compl(true));
    })
  }

  function onDispatchRouteAction(inUrl: IUrlType, compl: (outUrl: IUrlType) => void) {
    //test na authentifikaci => vymen ev. aktualni URL za login URL
    if (inUrl.route.needsAuth) {
      var loginRoute = loginRedirectWhenNeeded ? loginRedirectWhenNeeded() : null;
      if (loginRoute != null) {
        inUrl = { route: loginRoute.route, par: loginRoute.par, replace: true };
        loger.log('router.onDispatchRouteAction: auth redirect to loginRoute');
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
  //export function toUrl<T extends IPar>(par?: IQuery | string): IUrl<T> {
  export function toUrl<T extends IPar>(par?: string): IUrl<T> {
    if (!par) par = '';
    var q = toQuery(par);
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
    if (!path || path.length < 1) path = '/';
    if (path[0] != '/') path = '/' + path;
    var appPrefix = config.routePrefix();
    if (path.length >= appPrefix.length) {
      if (!path.toLowerCase().startsWith(appPrefix)) loger.doThrow(`router.toQuery: path=${path}m appPrefix=${appPrefix}`);
      path = path.substr(appPrefix.length);
    }
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

    //public appId: servConfig.Apps, 
    constructor(public moduleId: string, public actionId: string, public pattern: string, public parent?: RouteType, otherPar?: IConstruct<T>, createChilds?: (parent: RouteType) => Array<RouteType>) {//, ...childs: Array<RouteType>) {
      if (otherPar) Object.assign(this, otherPar);
      if (createChilds) this.childs = createChilds(this); //childs.forEach(ch => ch.addChildTo(this));
      if (parent) {
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

    getPath(par: T, routePrefix: servConfig.RoutePrefix, startProc: servConfig.StartProc): string {
      return (servCfg.server.rootUrl + config.routePrefix(routePrefix, startProc)).toLowerCase() + this.matcher.format(par || {});
    }

    navig(par?: T, ev?: React.SyntheticEvent, replace?: boolean, compl?: utils.TCallback) {
      if (ev) ev.preventDefault();
      var hist = url2History({ route: this, par: par, replace: replace }); 
      flux.trigger(hist, compl);
    }

    globalId(): string { return this.moduleId + '/' + this.actionId; }

    parseRoute(pre: IQuery): T {
      if (this.isAbstract || !this.isActive) return null;
      var res = this.matcher.exec<T>(pre.path, pre.query);
      if (res && this.finishRoutePar) this.finishRoutePar(res);
      return res;
    }

    activate() {
      this.isActive = true;
      if (this.childs) this.childs.forEach(ch => ch.activate());
    }
    //addChildTo(parent: RouteType) {
      //if (parent) {
      //  this.parent = parent;
      //  this.pattern = parent.pattern + this.pattern;
      //  this.actionId = parent.actionId + '.' + this.actionId;
      //  if (this.needsAuth === undefined) this.needsAuth = parent.needsAuth;
      //}
      //this.matcher = new uiRouter.UrlMatcher(this.pattern);
      ////self registrace
      //var nm = this.globalId();
      //if (routeDir[nm]) loger.doThrow(`Route ${nm} already exists`);
      //routeDir[nm] = this; routes.push(this);
    //}
    private matcher: uiRouter.UrlMatcher;

    dispatch: (par: T, compl: utils.TCallback) => void; //sance osetrit dispatch mez Dispatch modulu

    onLeave() { loger.log('routeLeave: ' + this.globalId()); if (this.onLeaveProc) this.onLeaveProc(); } //notifikace o opusteni route
    onEnter(compl: utils.TCallback) { loger.log('routeEnter: ' + this.globalId()); if (this.onEnterProc) this.onEnterProc(compl); else compl(); } //notifikace o vstupu do route

    childs: Array<RouteType>; //child routes
    isActive: boolean; //route je aktivni => matchuje se v parse route mechanismu
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
    dispatch?: (par: T, compl: utils.TCallback) => void; //sance osetrit ROUTE dispatch bez Dispatch modulu
  }
  export type IConstructType = IConstruct<IPar>;

  new uiRouter.$UrlMatcherFactory();

}


