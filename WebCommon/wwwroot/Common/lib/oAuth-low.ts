namespace oauth {

  export enum providerTypes {
    no,
    google,
    facebook,
    microsoft,
  }

  export function loginNavigate(loginHtmlUrl: string, par: IInputPar) {
    var url = loginHtmlUrl + '#' + utils.urlStringifyQuery(par);
    location.href = url;
  }

  export function loginReturn(returnUrl: string, par: IOutputPar) {
    var parStr = encodeURIComponent(JSON.stringify(par));
    var parts = returnUrl.split(outuptParPlace); if (parts.length != 2) throw 'parts.length != 2';
    var url = parts[0] + parStr + parts[1];
    location.href = url;
  }

  //obsah cookie: vstupni informace pro login
  export interface IInputPar {
    providerId: providerTypes;
    client_id: string;
    returnUrl: string; //v URL je na miste vysledneho encodeURIComponent(JSON.stringify(outputPar)) retezec '#$#$#'
  }
  
  //obsah cookie: vystupni informace pro login
  export interface IOutputPar {
    error?: string; //login se nepodaril
    id: string; //id uzivatele u providera
    email: string;
    firstName: string;
    lastName: string;
  }
  export const outuptParPlace = '#$#$#';

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
      res += (res=='' ? '' : '&') + encodeURIComponent(k) + '=' + encodeURIComponent(query[k]);
    }
    return res;
  }

}