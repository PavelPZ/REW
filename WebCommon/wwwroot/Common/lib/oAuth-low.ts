namespace oauth {

  export const enum oAuthProviders {
    no,
    google,
    facebook,
    microsoft,
  }

  //*** predani vysledku oAUTH pres cookie
  const authCookieName = 'auth-cookie';
  export function fromCookie(par: IAuthCookie) {
    par.email = par.firstName = par.lastName = null;
    let ck = utils.fromCookie<IAuthCookie>(authCookieName);
    if (!ck) return;
    par.email = ck.email; par.firstName = ck.firstName; par.lastName = ck.lastName;
  }
  const secondsPerDay = 60 * 60 * 24; //pocet vterin za den
  export function toCookie(par: IAuthCookie, preserveDays: number = -1) {
    var cook: IAuthCookie = par ? { email: par.email, firstName: par.firstName, lastName: par.lastName } : null;
    utils.toCookie(authCookieName, cook, preserveDays * secondsPerDay);
  }

  //obsah cookie: vstupni informace pro login
  export interface IInputPar {
    providerId: servConfig.oAuthProviders;
    client_id: string;
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

  const authReturnUrlCookie = 'auth-return-url';
  export function saveLoginSourcePage(hash: string) { //URL stranky, ktera vyzaduje AUTH
    if (hash) cookies.set(authReturnUrlCookie, hash); else cookies.remove(authReturnUrlCookie);
  }
  export function useLoginSourcePage(): string {
    return cookies.get(authReturnUrlCookie) as string; 
  }
  export function removeLoginSourcePage() {
    cookies.remove(authReturnUrlCookie);
  }

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

  export function fromCookie<T>(cookName: string): T {
    var c = cookies.get(cookName) as string; if (isEmpty(c)) return null;
    try { return JSON.parse(c); } catch (msg) { return null; }
  }

  export function toCookie(cookName: string, obj: any, expireSec: number = -1): void {
    if (isEmpty(obj)) cookies.remove(cookName);
    try { cookies.set(cookName, JSON.stringify(obj), expireSec); } catch (msg) { cookies.remove(cookName) }
  }

  export function isString(obj): boolean { return typeof obj === 'string'; }
  export function isEmpty(obj): boolean {
    if (!obj) return true;
    if (isString(obj) && obj == '') return true;
    return false;
  }
}