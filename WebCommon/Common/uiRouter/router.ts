declare namespace angular {
  class UrlMatcher {
    constructor(pattern: string);
    exec(url: string, query?: {}): {};
    format(params: {}): string;
  }
  class $UrlMatcherFactory {
  }
}

namespace angular {

  export interface IRouterAction extends common.IDispatchAction {
    isRoute: boolean;
  }

  export class States {
    add(name, pattern, par?: any): States {
      var st = new State(name, pattern, par);
      this.states.push(st);
      this.dir[st.name] = st;
      return this;
    }
    dispatch(hash?: string): IRouterAction {
      if (!hash) hash = window.location.hash;
      if (!hash || hash.length < 1) hash = '#';
      if (hash[0] == '#') hash = hash.substr(1);
      var parts = hash.split('?'); var path = parts[0];
      var query = {};
      if (parts[1]) parts[1].split('&').forEach(p => {
        var nv = p.split('=');
        query[nv[0]] = nv[1];
      });
      var res: IRouterAction = null;
      this.states.find(st => {
        var match = st.matcher.exec(path, query); if (!match) return false;
        res = { type: st.name, payload: match, isRoute: true };
        return true;
      });
      return res;
    }
    states: Array<State> = [];
    dir: { [name: string]: State; } = {};
  }
  export class State {
    constructor(public name: string, pattern: string, public par: any) {
      this.matcher = new UrlMatcher(pattern);
    }
    matcher: UrlMatcher;
  }

  export function testRouter() {
    //*** UrlMatcher test
    var urlMatcher = new UrlMatcher('/user/:id/name/:name?opt1&opt2');
    var pars = urlMatcher.exec('/useR/123/Name/alex', { opt1: 'xxx', opt2: 'yyy' });
    var url = urlMatcher.format(pars);
    //*** States test
    states
      .add('login.select', '/login.select')
      .add('login.login', '/login.login')
      .add('x', '/user/:id/name/:name?opt1&opt2')
    ;
    var d1 = states.dispatch('/login.select');
    var d2 = states.dispatch('/useR/123/Name/alex?opt1=xxx&opt2=yyy');
    var d3 = states.dispatch('/login.login');
  }
  new $UrlMatcherFactory();

  export var states: States = new States();

  window.addEventListener('hashchange', () => states.dispatch());
}


