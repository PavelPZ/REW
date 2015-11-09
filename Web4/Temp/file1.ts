/*
 *  Copyright 2014 Gary Green.
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *  http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

class LightRouter {
  constructor(public routes: Array<Route<any>>) {
  }
  static repl = '([\\w-]+)';
  namedParam = {
    match: new RegExp('{(' + LightRouter.repl + ')}', 'g'),
    replace: LightRouter.repl
  };
  /**
   * Context to call matched routes under
   * @type {mixed}
   */
  context = this;

  /**
   * Gets the url to test the routes against
   * @return self
   */
  getUrl(hash?: string): string {
    return hash ? hash : decodeURI(window.location.hash.substring(1));
  }

  /**
   * Attempt to match a one-time route and callback
   *
   * @param  {string} path
   * @param  {closure|string} callback
   * @return {mixed}
   */
  match(path, hash?:string): IRouteResult {
    var route = new Route<any>(path, this);
    var pars = route.test(this.getUrl(hash)); if (!pars) return null;
    return { route: route, pars: pars };
  }

  /**
   * Run the router
   * @return Route|undefined
   */
  run(hash?:string): IRouteResult {
    var url = this.getUrl(hash); var res: IRouteResult = null;
    this.routes.find(r => {
      var pars = r.test(url); if (!pars) return false;
      res = { route: r, pars: pars };
      return true;
    });
    return res;
  }
}

interface IRouteResult {
  route: Route<any>;
  pars: any;
}

/**
 * Route object
 * @param {string} path
 * @param {string} closure
 * @param {LightRouter} router  Instance of the light router the route belongs to.
 */
class Route<T> {

  constructor(public path: string, public router: LightRouter) {
    var pth = this.path.replace(/\//g, '\\/');
    pth = pth.replace(this.router.namedParam.match, this.router.namedParam.replace);
    this.regex = new RegExp('^' + pth + '$');
  }
  regex: RegExp;

  /**
   * Get the matching param keys
   * @return object  Object keyed with param name (or index) with the value.
   */
  params(values: RegExpMatchArray): {} {
    var obj = {}, name, params = values, i, t = 0, path = this.path;
    if (typeof path === 'string') {
      t = 1;
      params = path.match(this.router.namedParam.match);
    }
    for (i in params) {
      name = t ? params[i].replace(this.router.namedParam.match, '$1') : i;
      obj[name] = values[i];
    }
    return obj;
  }

  /**
   * Test the route to see if it matches
   * @param  {string} url Url to match against
   * @return {boolean}
   */
  test(url: string): T {
    var matches: RegExpMatchArray = url.match(this.regex);
    if (!matches) return null;
    var values: RegExpMatchArray = matches.slice(1);
    return <T>(this.params(values));
  }
}

