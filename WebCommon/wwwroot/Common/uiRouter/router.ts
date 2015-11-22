declare namespace router {
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
    window.addEventListener('hashchange', () => dispatch());
    dispatch();
  }

  //NAVIGATE
  export function getHash(src: IUrl<any>): string { return src.state.getHash(src.par); }
  export function navigate(src: IUrl<any>) { src.state.navigate(src.par); }
  export function goHome() { navigate(homeUrl); }
  export interface IUrl<T extends IPar> { state: Route<T>; par: T; }

  //pojmenovane globalne dostupne a typed router stavy
  export var routes: INamedRoutes = <any>{};
  export interface INamedRoutes { }; //rozsirovatelny interface s name router states

  //uiRouter config
  //export interface config { } //

  //predchudce vsech router state parametru
  export interface IPar { }
  //predchudce vsech router akci
  export type IAction<T extends IPar> = flux.IAction & T;
  export type IActionType = IAction<IPar>;

  //*** inicilizace 
  export function init(...roots: Array<RouteType>): void { //definice stavu
    roots.forEach(s => s.afterConstructor(null));
  }
  export function setHome<T extends IPar>(state: Route<T>, par: T) { homeUrl = { state: state, par: par } } //definice difotniho stavu

  //*** DISPATCH
  export function dispatch(hashStr?: string) {
    if (!config.cfg.data.flux || !config.cfg.data.flux.trigger) return;
    var url = toUrl(hashStr);
    if (!url) url = homeUrl;
    if (!url) throw 'Missing uiRouter.States.setDefault call';

    var act = url.state.createAction(url.par);
    config.cfg.data.flux.trigger(act);
  }

  //*** PARSES
  export function toUrl<T extends IPar>(par: IQuery | string): IUrl<T> {
    var q: IQuery;
    if (typeof par === 'string') q = toQuery(par); else q = par as IQuery;
    //angular uiRouter match
    var res: IUrl<T> = null;
    states.find((st: Route<T>) => {
      var par = st.parseHash(q) as T; if (!par) return false;
      res = { par: par, state: st };
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
  var states: Array<RouteType> = [];
  //var dir: { [name: string]: State<any>; } = {};
  var homeUrl: IUrl<any>;
  function add(st: RouteType) { states.push(st); /*dir[st.name] = st;*/ }

  //**** ROUTE
  export class Route<T extends IPar> {

    constructor(public name: string, public pattern: string, ...childs: Array<RouteType>) {
      if (childs) childs.forEach(ch => ch.afterConstructor(this));
    }

    getHash(par: T): string { return this.matcher.format(par); }
    navigate(par: T) { window.location.href = this.getHash(par); }

    finishStatePar(finishHash: (h: T) => void): Route<T> { this.finishHash = finishHash; return this; }

    parseHash(pre: IQuery): T {
      var res = this.matcher.exec<T>(pre.path, pre.query);
      if (res && this.finishHash) this.finishHash(res);
      return res;
    }
    createAction(par: T): flux.IAction {
      var res: flux.IAction = { moduleId: this.name, actionId: routerActionId };
      return Object.assign(res, par);
    }

    afterConstructor(parent: RouteType) {
      if (parent) {
        this.parent = parent;
        this.pattern = parent.pattern + this.pattern;
        this.name = parent.name + '.' + this.name;
      }
      this.matcher = new UrlMatcher(this.pattern);
      add(this);
    }
    private parent: RouteType;
    private matcher: UrlMatcher;
    finishHash: (h: T) => void;
    //onEnter: (from: RouteType) => void;
    //onLeave: (to: RouteType) => void;
    //needsAuth: boolean;
    //needsAuthProc: (par: T) => boolean;
  }
  export type RouteType = Route<IPar>;
  //export interface IStateEx<T extends IPar> {
  //  finishHash?: (h: T) => void;
  //  onEnter?: (from: RouteType) => void;
  //  onLeave?: (to: RouteType) => void;
  //  needsAuth?: boolean;
  //  needsAuthProc?: (par: T) => boolean;
  //}

  new $UrlMatcherFactory();

}


