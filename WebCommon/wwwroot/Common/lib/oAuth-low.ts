namespace oauth {

  export const enum oAuthProviders {
    no,
    google,
    facebook,
    microsoft,
  }

  const authCookieName = 'auth-cookie-name';
  export function fromCookie(par: IAuthCookie) {
    par.email = par.firstName = par.lastName = null;
    let cook:string = cookies.get(authCookieName) as string; 
    if (!cook || cook == '') return;
    try {
      let ck: IAuthCookie = JSON.parse(cook);
      par.email = ck.email; par.firstName = ck.firstName; par.lastName = ck.lastName;
    } catch (msg) {}
  }
  export function toCookie(par: IAuthCookie, preserveDays: number) {
    if (!par) { cookies.remove(authCookieName); return; }
    const secondsPerDay = 60 * 60 * 24; //pocet vterin za den
    var cook: IAuthCookie = { email: par.email, firstName: par.firstName, lastName: par.lastName };
    cookies.set(authCookieName, JSON.stringify(cook), preserveDays ? secondsPerDay * preserveDays : -1);
  }

  export function loginNavigate(loginHtmlUrl: string, par: IInputPar): string {
    return loginHtmlUrl + '#' + utils.urlStringifyQuery(par);
  }

  export function loginReturn(returnUrl: string, par: IOutputPar) {
    let parStr = encodeURIComponent(JSON.stringify(par));
    //var parts = returnUrl.split(outuptParPlace); if (parts.length != 2) throw 'parts.length != 2';
    //var url = parts[0] + parStr + parts[1];
    let url = returnUrl + parStr;
    location.href = url;
  }

  //obsah cookie: vstupni informace pro login
  export interface IInputPar {
    providerId: servConfig.oAuthProviders;
    client_id: string;
    returnUrl: string; //v URL je na miste vysledneho encodeURIComponent(JSON.stringify(outputPar)) retezec '#$#$#'
  }
  
  export interface IAuthCookie {
    email: string;
    firstName?: string;
    lastName?: string;
  }
  //obsah cookie: vystupni informace pro login
  export interface IOutputPar extends IAuthCookie{
    error?: string; //login se nepodaril
    id: string; //id uzivatele u providera
  }
  //export const outuptParPlace = '#$#$#';

}

namespace utils {
  export function urlStringify(url: string, query: Object): string {
    var q = urlStringifyQuery(query); if (!q) return url;
    url += url.indexOf("?") === -1 ? '?' : '&';
    return url + q;
  }
  export function urlParseQuery<T>(query: string): T {
    if (!query || query.length == 0) return null;
    var res: T = <T>{}; if (!query) return res;
    var parts = query.split('&');
    for (var i = 0; i < parts.length; i++) {
      var kv = parts[i].split('='); if (kv.length != 2) continue;
      kv[0] = kv[0].trim(); kv[1] = decodeURIComponent(kv[1]).trim();
      res[kv[0]] = kv[1];
    }
    return res;
  }
  export function urlStringifyQuery(query: Object): string {
    var res = '';
    for (var k in query) {
      res += (res == '' ? '' : '&') + encodeURIComponent(k) + '=' + encodeURIComponent(query[k]);
    }
    return res;
  }

}