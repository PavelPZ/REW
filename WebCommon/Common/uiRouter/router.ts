declare namespace uiRouter {
  class UrlMatcher {
    constructor(pattern: string);
    exec<T extends uiRouter.IStatePar>(url: string, query?: utils.TDirectory<string>): T;
    exec(url: string, query?: utils.TDirectory<string>): uiRouter.IStatePar;
    format(params: uiRouter.IStatePar): string;
  }
  class $UrlMatcherFactory {
  }
}

namespace config {
  export interface IData {
    uiRouter: {
    };
  }
}


namespace uiRouter {

  //navazan routeru na HASH change notifikaci
  export function listenHashChange() {
    window.addEventListener('hashchange', () => dispatch());
    dispatch();
  }

  //NAVIGATE
  export function getHashStr(src: IHashSource<any>): string { return src.state.getHashStr(src.par); }
  export function navigate(src: IHashSource<any>) { src.state.navigate(src.par); }
  export interface IHashSource<T> { state: State<T>; par: IStatePar; }

  //pojmenovane globalne dostupne a typed router stavy
  export var namedState: INamedState = <any>{};
  export interface INamedState { };

  //uiRouter config
  export interface config {

  }

  //predchudce vsech router state parametru
  export interface IStatePar { }

  //*** inicilizace 
  export function init(...roots: Array<State<any>>): void { //definice stavu
    roots.forEach(s => s.afterConstructor(null));
  }
  export function setDefault<T extends IStatePar>(state: State<T>, par: T) { defaultSource = { state: state, par: par } } //definice difotniho stavu

  //*** DISPATCH
  export function dispatch(hashStr?: string) {
    if (!config.cfg.data.flux || !config.cfg.data.flux.trigger) return;
    var res = parseHashStr(hashStr);
    if (!res) res = defaultSource;
    if (!res) throw 'Missing uiRouter.States.setDefault call';
    var act = res.state.createAction(res.par);
    config.cfg.data.flux.trigger(act);
  }

  //*** PARSES
  export function parseHashStr<T>(hashStr?: string): IHashSource<T> { return parseHash<T>(preParseHashStr(hashStr)); }
  export function parseHash<T>(pre: IPreParseHashStrResult): IHashSource<T> {
    //angular uiRouter match
    var res: IHashSource<T> = null;
    states.find(st => {
      var par = st.parseHash(pre); if (!par) return false;
      res = { par: par, state: st };
      return true;
    });
    return res;
  }
  export function preParseHashStr(hashStr?: string): IPreParseHashStrResult {
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
  export interface IPreParseHashStrResult { path: string; query: utils.TDirectory<string>; }

  //**** locals
  var states: Array<State<any>> = [];
  var dir: { [name: string]: State<any>; } = {};
  var defaultSource: IHashSource<any>;
  function add(st: State<any>) { states.push(st); dir[st.name] = st; }

  //**** STATE
  export class State<T extends IStatePar> {

    constructor(public name: string, public pattern: string, ...childs: Array<State<any>>) {
      if (childs) childs.forEach(ch => ch.afterConstructor(this));
    }

    getHashStr(par: T): string { return this.matcher.format(par); }
    navigate(par: T) { window.location.href = this.getHashStr(par); }

    setFinishHashAction(finishHash: (h: T) => void): State<T> { this.finishHash = finishHash; return this; }

    parseHash(pre: IPreParseHashStrResult): T {
      var res = this.matcher.exec<T>(pre.path, pre.query);
      if (res && this.finishHash) this.finishHash(res);
      return res;
    }
    createAction(par: T): flux.IAction { return Object.assign({ type: this.name }, par); }

    afterConstructor(parent: State<any>) {
      if (parent) {
        this.pattern = parent.pattern + this.pattern;
        this.name = parent.name + '.' + this.name;
      }
      this.matcher = new UrlMatcher(this.pattern);
      add(this);
    }
    private matcher: UrlMatcher;
    private finishHash: (h: T) => void;
  }

  new $UrlMatcherFactory();

}


