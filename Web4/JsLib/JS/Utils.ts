
interface JQuery {
  waitForImages(finishedCallback: any, eachCallback?, waitForAll?);
  position(options: Object);
  //http://benalman.com/projects/jquery-hashchange-plugin/
  hashchange(fnc: () => void): void;
  hashchange();
}
interface JQueryStatic {
  whenall<T>(promises: JQueryPromise<T>[]): JQueryPromise<T>;
  //whenAll<T>(promises: JQueryPromise<T>[]): JQueryPromise<T>;
}

$.whenall = arr => $.when.apply($, arr);

$.views.settings({ onError: () => { debugger; }, _dbgMode: false });

//$.whenAll = firstParam => {
//  var //args = arguments,
//    sliceDeferred = [].slice,
//    i = 0,
//    length = args.length,
//    count = length,
//    rejected,
//    deferred = length <= 1 && firstParam && jQuery.isFunction(firstParam.promise)
//    ? firstParam
//    : jQuery.Deferred();

//  function resolveFunc(i, reject) {
//    return function (value) {
//      rejected = true;
//      args[i] = arguments.length > 1 ? sliceDeferred.call(arguments, 0) : value;
//      if (!(--count)) {
//        // Strange bug in FF4:
//        // Values changed onto the arguments object sometimes end up as undefined values
//        // outside the $.when method. Cloning the object into a fresh array solves the issue
//        var fn = rejected ? deferred.rejectWith : deferred.resolveWith;
//        fn.call(deferred, deferred, sliceDeferred.call(args, 0));
//      }
//    };
//  }

//  if (length > 1) {
//    for (; i < length; i++) {
//      if (args[i] && jQuery.isFunction(args[i].promise)) {
//        args[i].promise().then(resolveFunc(i, false), resolveFunc(i, true));
//      } else {
//        --count;
//      }
//    }
//    if (!count) {
//      deferred.resolveWith(deferred, args);
//    }
//  } else if (deferred !== firstParam) {
//    deferred.resolveWith(deferred, length ? [firstParam] : []);
//  }
//  return deferred.promise();
//};

module colors {
  export var Default = "default";
  export var Disabled = "disabled";
  export var Primary = "primary";
  export var Success = "success";
  export var Info = "info";
  export var Warning = "warning";
  export var Danger = "danger";
}


module Cook {
  var allSubDomains: Array<string> = ['www'];
  //var c_Lang = "lang"; //cookie ve formatu en-gb
  //var c_Logout = "logout"; //cookie pro logout
  //var c_LMTicket = "LMTicket";
  //export enum Ids {
  //  lang,
  //  //logout, 
  //  LMTicket,
  //  schools_info, //pro schools aplikaci, objekt s napr return url
  //  lms_licence, //pro 
  //  //includeData
  //}
  export function read(id: LMComLib.CookieIds, def: string = ""): string {
    return gCookie.getCookie(LowUtils.EnumToString(LMComLib.CookieIds, id), def);
  }
  export function write(id: LMComLib.CookieIds, value: string, persist: boolean = false): void {
    var name = LowUtils.EnumToString(LMComLib.CookieIds, id);
    //_.each(allSubDomains, s => gCookie.setCookie(name, '', -1, undefined, s + '.' + LowUtils.cookieDomain()));
    gCookie.setCookie(name, value, persist ? 100000000 : undefined, "/", LowUtils.cookieDomain());
  }
  export function remove(id: LMComLib.CookieIds): void {
    gCookie.remove(LowUtils.EnumToString(LMComLib.CookieIds, id), "/", LowUtils.cookieDomain());
  }
}

module LMStatus {

  export var sessionId = new Date().getTime();

  export function createCmd<T extends LMComLib.Cmd>(finish: (par: T) => void): T {
    var res = <T>{ lmcomId: Cookie ? Cookie.id : 0, sessionId: sessionId };
    finish(res);
    return res;
  }

  export interface LMCookie extends LMComLib.LMCookieJS {
  }

  export function ToString(ck: LMComLib.LMCookieJS): string {
    return Utils.encrypt(ck);
  }
  function FromString(s: string): LMCookie {
    return <LMCookie>Utils.decrypt(s);
  }

  export function getCookie(): LMCookie {
    if (!isLogged()) {
      try {
        var cookStr = Cook.read(LMComLib.CookieIds.LMTicket);
        if (cookStr != "") {
          Cookie = FromString(cookStr);
          if (Cookie.id <= 0) Cookie = null;
        }
      } catch (msg) {
        return null;
      }
    }
    return Cookie;
  }
  export function setCookie(cook: LMComLib.LMCookieJS, persistent: boolean = false): void {
    if (cook == null) Cook.remove(LMComLib.CookieIds.LMTicket);
    else Cook.write(LMComLib.CookieIds.LMTicket, ToString(cook), persistent);
    //Cookie = cook;
  }

  export function logged(cook: LMComLib.LMCookieJS, persistent: boolean = false) {
    setCookie(cook, persistent);
    adjustLoggin(LMStatus.gotoReturnUrl);
  }

  export function loginUrl(): string {
    return "http://" + location.host + "/lmcom/Services/LMLive/LMLive.aspx?returnurl=" + encodeURIComponent(location.href);
  }

  export function setReturnUrlAndGoto(newHash: string = null): void {
    setReturnUrl();
    if (newHash == null) return;
    Pager.navigateToHash(newHash);
    //if (newHash.charAt(0) != "#") newHash = "#" + newHash;
    //location.hash = newHash;
  }
  export function setReturnUrl(newHash: string= null): void {
    Cook.write(LMComLib.CookieIds.returnUrl, newHash ? newHash : location.hash);
  }
  export function clearReturnUrl(): void {
    Cook.remove(LMComLib.CookieIds.returnUrl);
  }
  export function isReturnUrl(): boolean {
    return !_.isEmpty(getReturnUrl());
  }
  export function getReturnUrl(): string {
    var url = Cook.read(LMComLib.CookieIds.returnUrl); if (_.isEmpty(url) || url == '#') return null;
    if (url.charAt(0) == "#") url = url.substr(1);
    return oldPrefix + url;
  }
  export function gotoReturnUrl(): void {
    var url = getReturnUrl();
    if (_.isEmpty(url)) Pager.gotoHomeUrl();
    else Pager.navigateToHash(url);
  }

  export var Cookie: LMStatus.LMCookie = null;

  export function scormUserId(): string {
    return Cookie.TypeId ? Cookie.TypeId : Cookie.id.toString();
  }
  export function isLogged(): boolean { return !_.isEmpty(Cookie) && Cookie.id && Cookie.id > 0; }

  export function loggedBodyClass() {
    var logged = isLogged();
    if (!logged) {
      $('body').removeClass("logged");
      setCookie(null);
    } else {
      $('body').addClass("logged")
    }
  }

  //zajisteni zalogovani
  export function adjustLoggin(completed: () => void): void {
    var cookEmpty = !isLogged(); //Cookie == null;
    if (cookEmpty) {
      var ticket = LowUtils.getQueryParams('ticket'); var a1y = LowUtils.getQueryParams('a1y');
      if (!_.isEmpty(ticket)) { //sance se nasilne nalogovat z ticketu
        Login.login(true, null, null, null, ticket,
          cookie => {
            setCookie(cookie);
            window.location.href = window.location.href.replace('ticket=' + ticket, '');
          },
          (errId, errMsg) => { debugger; throw 'Utils.adjustCookie: PZ Log Error'; }
          );
        return;
      } else if (a1y){
        var em, psw: string;
        switch (a1y) {
          case 'b2c': em = "pzika@langmaster.cz"; psw = "p"; break; //sance se nasilne nalogovat jako PZ
          case 'ws7': em = "zzikova@langmaster.cz"; psw = "zz"; break; //zz
          case '73q': em = "rjeliga@langmaster.cz"; psw = "rj"; break; //rj
          case 'pw6': em = "pjanecek@langmaster.cz"; psw = "pj"; break; //pj
          case 'g3n': em = "zikovakaca@seznam.cz"; psw = "kz"; break; //kz
          case 'ws7': em = "zzikova@langmaster.cz"; psw = "zz"; break; //zz
          default: return;
        }
        Login.login(true, em, null, psw, null,
          cookie => {
            setCookie(cookie);
            window.location.href = window.location.href.replace(/a1y=\w{3}/, '');
          },
          (errId, errMsg) => { debugger; throw 'Utils.adjustCookie: PZ Log Error'; }
          );
        return;
      }
    }
    getCookie();
    loggedBodyClass();
    if (cookEmpty) onLogged(completed); else completed();
  }
  export var onLogged: (completed: () => void) => void = null;

  if ($.views) $.views.helpers({
    Cookie: getCookie,
    userName: friendlyName,
    isLMComCookie: isLMComCookie,
    fncExists: (name: string) => <any>($.views.helpers)[name],
    'debugger': (data: any) => { debugger; },
    icon_chevron_right: () => Trados.isRtl ? 'fa-chevron-left' : 'fa-chevron-right',
  });

  export function LogoutLow() {
    //binec, setCookie nastavi pouze browser cookie a ponecha LMStatus.Cookie
    LMStatus.setCookie(null); LMStatus.Cookie = null;
    Pager.gotoHomeUrl();
  }

  export function Logout(obj, ev: JQueryEventObject) {
    if (!isLogged()) return;
    try {
      if (!isLMComCookie()) {
        var a = <HTMLAnchorElement>ev.currentTarget;
        if (a.tagName.toLowerCase() != CourseModel.ta) throw "OAuth.logoutEx";
        a.href = OAuth.logoutUrl(Cookie.Type);
        return true;
      } else {
        return false;
      }
    } finally {
      LogoutLow();
    }
  }

  export function friendlyName(): string {
    if (!isLogged()) return "";
    return LMStatus.Cookie.Type == LMComLib.OtherType.LANGMasterNoEMail ? Cookie.Login : Cookie.EMail;
  }
  export function isLMComCookie(): boolean {
    return !Cookie.Type || Cookie.Type == 0 || Cookie.Type == LMComLib.OtherType.LANGMasterNoEMail || Cookie.Type == LMComLib.OtherType.LANGMaster;
  }

}

module JsRenderHelpers {
  if ($.views) $.views.helpers({

    nextToLast: function () {
      return this.index === this.parent.data.length - 2;
    },

    notLast: function () {
      return this.index !== this.parent.data.length - 1;
    },
    tuppleRightEnd: function () {
      return this.index === this.parent.data.length - 1 || this.index % 2 === 1;
    },
    tuppleDelimiter: function () {
      return this.index % 2 === 1 && this.index !== this.parent.data.length - 1;
    },
    tuppleLeft: function () {
      return this.index % 2 === 0;
    },
    tuppleRight: function () {
      return this.index % 2 === 1;
    },
    boolConverter: function (par, trueVal, falseVal) {
      if (typeof par == "function") par = par();
      return Utils.Empty(par) ? (falseVal ? falseVal : '') : (trueVal ? trueVal : '');
    },
    numConverter: function (par, ...pars: any[]) {
      if (typeof par == "function") par = par();
      var idx = Utils.Empty(par) ? 0 : <number>par;
      if (idx >= pars.length) throw "numConverter";
      return pars[idx];
    }
  });

}

/****************** Localization *************************/
//var tradosData: string[] = typeof (tradosData) == undefined ? [] : tradosData;

declare var tradosData: {};
var CSLocalize: (id: string, def: string) => string = null;

module Trados {

  //***************** Lokalizace SW
  var rxLocComment = new RegExp("\\(\\*.*?\\*\\)", "g");
  export var actLang: LMComLib.Langs = 0;
  export var actLangStr: string = "en_gb";
  export var actLangCode: string = "en-gb"; //napr. sp-sp
  export var actLangNetCode: string = "en-gb"; //napr. es-es
  export var isRtl = false;
  var rtlLangs: Array<LMComLib.Langs> = [LMComLib.Langs.ar_sa];

  //export function isRtl():boolean { return _.any(rtlLangs, l => l == actLang);}
  //export function initLang(lng: LMComLib.Langs): void {
  //  forceLang = lng == LMComLib.Langs.no ? null : LowUtils.EnumToString(LMComLib.Langs, lng).replace("_", "-");
  //}
  //var forceLang: string;
  var alertCalled = false;
  function Localize(id: string, def: string): string {
    if (typeof tradosData == "undefined") {
      if (!alertCalled) {
        debugger;
        alert("Trados.Localize: missing tradosData");
      }
      alertCalled = true;
      return locNormalize(def);
    }
    if (id == null) return locNormalize(def);
    var res = tradosData[id];
    if (typeof (res) == 'undefined' || res == "###TRANS TODO###") return locNormalize(def);
    return res;
  };
  export function locNormalize(s: string): string { return s.replace(rxLocComment, ''); }

  if ($.views) $.views.helpers({
    CSLocalize: (s, d) => {
      try { return CSLocalize(s, d); } catch (exp) { throw exp; }
    },
    isRtl: () => isRtl,
    cookie: (name: string) => gCookie.getCookie(name),
  });
  CSLocalize = Localize;

  //Jsou dva pripady: 
  // - jazyk je definovan tim, ze je primo v HTML strance spravny.JS soubor.
  // - nebo je jazyk definovan externe a spravny .JS soubor se naladuje dynamicky
  export function adjustLoc(completed: () => void): void {
    /************ zjisteni jazyka *****************/
    var loadScript: boolean; var lng: string; //var fromCookie = "";
    if (typeof tradosData != "undefined") { //.JS jiz included
      lng = tradosData["forceLang"]; //jazyk je urcen timto .JS souborem
      Logger.trace("Trados.adjustLoc", "JS included, lng=" + lng);
      loadScript = false;
    } else { //.JS neincluded, nastav loadScript
      Logger.trace("Trados.adjustLoc", "JS not included");
      lng = null; //forceLang;
      loadScript = true;
    }
    if (_.isEmpty(lng)) { //jazyk z #lang= Hash stringu
      var hash = LowUtils.parseQuery(location.hash);
      if (hash != null && hash["lang"]) { lng = hash["lang"]; location.hash = ""; }
    }
    if (_.isEmpty(lng)) { //jazyk z query stringu
      var search = LowUtils.parseQuery(location.search);
      if (search != null && search["lang"]) { lng = search["lang"]; }
    }
    //Jazyk z cookie:
    //if (loadScript && Utils.Empty(lng)) fromCookie = lng = Cook.read(LMComLib.CookieIds.lang);
    if (_.isEmpty(lng)) lng = lng = Cook.read(LMComLib.CookieIds.lang);
    //jazyk neznamy => default
    if (_.isEmpty(lng) || lng == "no") lng = "en-gb"; //jazyk neznamy => default
    lng = lng.replace('es-es', 'sp-sp');
    Logger.trace("Trados.adjustLoc", "lng=" + lng);

    /************ pouziti zjisteneho jazyka *****************/
    //save to cookie:
    lng = lng.toLowerCase(); //fromCookie = fromCookie.toLowerCase();
    //if (loadScript && fromCookie != lng) Cook.write(LMComLib.CookieIds.lang, lng);
    //if (fromCookie != lng)
    Cook.write(LMComLib.CookieIds.lang, lng);
    //use lang
    var newLng = LowUtils.EnumParse(LMComLib.Langs, lng.replace('-', '_'));
    var isOK = actLang == newLng;
    actLang = newLng;
    var doCompleted: () => void = () => {
      actLangStr = LowUtils.EnumToString(LMComLib.Langs, actLang); actLangCode = actLangStr.replace("_", "-");
      actLangNetCode = actLangCode.replace('sp-sp', 'es-es');
      _.each<GlobalizeCulture>(Globalize.cultures, c => { Globalize.cultures[c.name.toLowerCase()] = c; }); //culture lowercase
      Globalize.culture(actLangNetCode);
      isRtl = _.indexOf(rtlLangs, actLang) >= 0;
      completed();
    };
    if (isOK || actLang == LMComLib.Langs.en_gb) { tradosData = {}; doCompleted(); return; } //anglictina se neladuje
    if (!loadScript) { doCompleted(); return; } //scorm nebo local: jiz naladovano

    /************ naladovani .JS souboru *****************/
    var spHack = lng == "sp-sp" ? "es-es" : lng;
    $.when( //ladovani
      $.ajax({
        cache: true,
        dataType: "script",
        url: Pager.path(Pager.pathType.relPath, Utils.string_format("jslib/scripts/cultures/globalize.culture.{0}.js", [spHack]))
      }),
      $.ajax({
        cache: true,
        dataType: "script",
        url: Pager.path(Pager.pathType.relPath, Utils.string_format("schools/loc/tradosData.{0}.js", [spHack]))
      })
      ).done(() => doCompleted())
      .fail(() => {
        doCompleted();/*noop, pouzije se difotni lokalizace, tj anglictina */
      });
  }


  //***************** Lokalizace dat

  //lokalizace JSON objektu
  export function localizeObject(s: string, locPar: string[], isRJson: boolean = false): any {
    s = localizeJSON(s, locPar);
    var res = JSON.parse(s);
    return isRJson ? RJSON.unpack(res) : res; //ev. RJSON
  }

  //export function xlocalizeObjectEx(s: string, locPar: (s: string) => string): any { 
  //  s = replEx(s, v => "Trados.loc(" + v + ")");
  //  loc = locPar;
  //  locReplace = repl;
  //  var toEval = "(Trados.locRes = " + s + ");";
  //  eval(toEval);
  //  return locRes;
  //}

  //pomocne udaje
  //var locTable: string[];
  //var locReplace: (s: string) => string;
  //export var locRes;
  //export var loc : (s: string) => string; //hodnota property JSON objetku je dosazena pomoci Trados.loc funkce


  //low level nahrada {{}} zavorek pro umisteni do html
  export function localize(data: string, loc: string[]): string { //nahradi {{xxx}} z JS objektu by value
    //if (!loc) return data;
    var isJson = data.charAt(0) == "{";
    return data.replace(locEx, (match, ...gm) => {
      var group_match = gm[0];
      var data: string = loc ? loc[group_match] : null;
      if (data && (isJson || group_match == 'Ahtmltitle')) { data = JSON.stringify(data); data = data.substr(1, data.length - 2); }
      return data ? data.toString() : "*** " + group_match + " ***";
    });
  } var locEx = /{{(.*?)}}/g;

  //low level nahrada {{}} zavorek pro umisteni do JSON stringu
  export function localizeJSON(data: string, loc: string[]): string { //nahradi {{xxx}} z JS objektu {xxx:value}
    if (!loc) return data;
    return data.replace(locEx, (match, ...gm) => {
      var group_match = gm[0];
      var data = JSON.stringify(loc[group_match]);
      if (data) data = data.substr(1, data.length - 2);
      return data ? data.toString() : "*** " + group_match + " ***";
    });
  }

  //function replEx(data: string, repl: (s:string)=>string): string { //nahradi {{xxx}} z JS objektu {xxx:value}
  //  return data.replace(locEx, (match, group_match) => repl(group_match));
  //}
  //function repl(data: string): string { //nahradi {{xxx}} z JS objektu {xxx:value}
  //  return localize(data, locTable)
  //}

}

if (typeof ko != 'undefined') {
  ko.bindingHandlers["width"] = {
    init: function (element: HTMLElement, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
      valueAccessor($(element).width());
    },
    update: function (element: HTMLElement, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
      $(element).width(ko.utils.unwrapObservable<number>(valueAccessor()));
    }
  };

  ko.bindingHandlers["height"] = {
    init: function (element: HTMLElement, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
      valueAccessor($(element).height());
    },
    update: function (element: HTMLElement, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
      $(element).height(ko.utils.unwrapObservable<number>(valueAccessor()));
    }
  };
}

ko.bindingHandlers['test'] = {
  init: function (element: HTMLElement, valueAccessor, allBindings, viewModel, bindingContext) {
    var nm = ko.unwrap(valueAccessor());
    _.each($(element).parents().toArray(), (el: HTMLElement) => {
      var n = el.getAttribute("data-bind");
      if (n) { var t = testRegEx.exec(n); if (t) nm = t[1] + '.' + nm; }
    });
    element.setAttribute('name', nm);
  }
};
var testRegEx: RegExp = /.*test:'(.*?)'/g;

