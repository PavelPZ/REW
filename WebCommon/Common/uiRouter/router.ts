declare namespace uiRouter {
  class UrlMatcher {
    constructor(pattern: string);
    exec<T extends uiRouter.IStatePar>(url: string, query?: common.TDirectory<string>): T;
    exec(url: string, query?: common.TDirectory<string>): uiRouter.IStatePar;
    format(params: uiRouter.IStatePar): string;
  }
  class $UrlMatcherFactory {
  }
}

namespace common {
  export interface IGlobalCtx {
    uiRouter: {
    };
  }
}


namespace uiRouter {

  //navazan routeru na hash change notifikaci
  export function listenHashChange() {
    window.addEventListener('hashchange', () => dispatch());
    dispatch();
  }

  //NAVIGATE
  export interface IHashSource<T> { state: State<T>; par: IStatePar; }
  export function getHashStr(src: IHashSource<any>): string { return src.state.getHashStr(src.par); }
  export function navigate(src: IHashSource<any>) { src.state.navigate(src.par); }

  //pojmenovane stavy aplikace
  export var namedState: INamedState = <any>{};
  export interface INamedState { };

  //uiRouter config
  export interface config {

  }

  //predchudce vsech router state parametru
  export interface IStatePar { }

  //*** inicailizace 
  export function init(...roots: Array<State<any>>): void {
    roots.forEach(s => s.createFinish(null));
  }
  export function setDefault<T extends IStatePar>(state: State<T>, par: T) { defaultSource = { state: state, par: par } }

  //*** parses
  export function parseHashStr<T>(hashStr?: string): IHashSource<T> { return parseHash<T>(preParseHashStr(hashStr)); }
  export function parseHash<T>(pre: IPreParseHashStrResult): IHashSource<T> {
    //angular uiRouter match
    var res: IHashSource<T> = null;
    states.find(st => {
      var hash = st.stringToHash(pre.path, pre.query); if (!hash) return false;
      res = { par: hash, state: st };
      return true;
    });
    return res;
  }
  export function preParseHashStr(hashStr?: string): IPreParseHashStrResult {
    //normalizacu hash: zacina '/', neobsahuje '#'
    if (!hashStr) hashStr = window.location.hash;
    if (hashStr && hashStr.length > 0 && hashStr[0] == '#') hashStr = hashStr.substr(1);
    if (!hashStr || hashStr.length < 1) hashStr = '/';
    if (hashStr[0] != '/') hashStr = hashStr = '/' + hashStr;
    //oddeleni a parse query stringu
    var parts = hashStr.split('?'); var path = parts[0];
    var query: common.TDirectory<string> = {};
    if (parts[1]) parts[1].split('&').forEach(p => {
      var nv = p.split('=');
      query[nv[0]] = nv[1];
    });
    return { path: parts[0], query: query }
  }
  export interface IPreParseHashStrResult { path: string; query: common.TDirectory<string>; }

  export function dispatch(hashStr?: string) {
    if (!common.globalContext.ctx.flux || !common.globalContext.ctx.flux.trigger) return;
    var res = parseHashStr(hashStr);
    if (!res) res = defaultSource;
    if (!res) throw 'Missing uiRouter.States.setDefault call';
    var act = res.state.createAction(res.par);
    common.globalContext.ctx.flux.trigger(act);
  }

  //**** locals
  var states: Array<State<any>> = [];
  var dir: { [name: string]: State<any>; } = {};
  var defaultSource: IHashSource<any>;
  function add(st: State<any>) { states.push(st); this.dir[st.name] = st; }

  //**** STATE
  export class State<T extends IStatePar> {

    constructor(public name: string, public pattern: string, ...childs: Array<State<any>>) {
      if (childs) childs.forEach(ch => ch.createFinish(this));
    }

    getHashStr(hash: T): string { return this.matcher.format(hash); }
    navigate(par: T) { window.location.href = this.getHashStr(par); }

    setFinishHashAction(finishHash: (h: T) => void): State<T> { this.finishHash = finishHash; return this; }
    private finishHash: (h: T) => void;

    stringToHash(path: string, query: common.TDirectory<string>): T {
      var res = this.matcher.exec<T>(path, query);
      if (this.finishHash) this.finishHash(res);
      return res;
    }
    createAction(hash: T): flux.IAction { return Object.assign({ type: this.name }, hash); }

    createFinish(parent: State<any>) {
      this.parent = parent;
      if (parent) {
        this.pattern = parent.pattern + this.pattern;
        this.name = parent.name + '.' + this.name;
      }
      this.matcher = new UrlMatcher(this.pattern);
      add(this);
    }
    private matcher: UrlMatcher;
    private parent: State<any>;
  }

  new $UrlMatcherFactory();

}


