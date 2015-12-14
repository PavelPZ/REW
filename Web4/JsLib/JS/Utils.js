$.whenall = function (arr) { return $.when.apply($, arr); };
$.views.settings({ onError: function () { debugger; }, _dbgMode: false });
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
var colors;
(function (colors) {
    colors.Default = "default";
    colors.Disabled = "disabled";
    colors.Primary = "primary";
    colors.Success = "success";
    colors.Info = "info";
    colors.Warning = "warning";
    colors.Danger = "danger";
})(colors || (colors = {}));
var Cook;
(function (Cook) {
    var allSubDomains = ['www'];
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
    function read(id, def) {
        if (def === void 0) { def = ""; }
        return gCookie.getCookie(LowUtils.EnumToString(LMComLib.CookieIds, id), def);
    }
    Cook.read = read;
    function write(id, value, persist) {
        if (persist === void 0) { persist = false; }
        var name = LowUtils.EnumToString(LMComLib.CookieIds, id);
        //_.each(allSubDomains, s => gCookie.setCookie(name, '', -1, undefined, s + '.' + LowUtils.cookieDomain()));
        gCookie.setCookie(name, value, persist ? 100000000 : undefined, "/", LowUtils.cookieDomain());
    }
    Cook.write = write;
    function remove(id) {
        gCookie.remove(LowUtils.EnumToString(LMComLib.CookieIds, id), "/", LowUtils.cookieDomain());
    }
    Cook.remove = remove;
})(Cook || (Cook = {}));
var LMStatus;
(function (LMStatus) {
    LMStatus.sessionId = new Date().getTime();
    function createCmd(finish) {
        var res = { lmcomId: LMStatus.Cookie ? LMStatus.Cookie.id : 0, sessionId: LMStatus.sessionId };
        finish(res);
        return res;
    }
    LMStatus.createCmd = createCmd;
    function ToString(ck) {
        return Utils.encrypt(ck);
    }
    LMStatus.ToString = ToString;
    function FromString(s) {
        return Utils.decrypt(s);
    }
    function getCookie() {
        if (!isLogged()) {
            try {
                var cookStr = Cook.read(LMComLib.CookieIds.LMTicket);
                if (cookStr != "") {
                    LMStatus.Cookie = FromString(cookStr);
                    if (LMStatus.Cookie.id <= 0)
                        LMStatus.Cookie = null;
                }
            }
            catch (msg) {
                return null;
            }
        }
        return LMStatus.Cookie;
    }
    LMStatus.getCookie = getCookie;
    function setCookie(cook, persistent) {
        if (persistent === void 0) { persistent = false; }
        if (cook == null)
            Cook.remove(LMComLib.CookieIds.LMTicket);
        else
            Cook.write(LMComLib.CookieIds.LMTicket, ToString(cook), persistent);
        //Cookie = cook;
    }
    LMStatus.setCookie = setCookie;
    function logged(cook, persistent) {
        if (persistent === void 0) { persistent = false; }
        setCookie(cook, persistent);
        adjustLoggin(LMStatus.gotoReturnUrl);
    }
    LMStatus.logged = logged;
    function loginUrl() {
        return "http://" + location.host + "/lmcom/Services/LMLive/LMLive.aspx?returnurl=" + encodeURIComponent(location.href);
    }
    LMStatus.loginUrl = loginUrl;
    function setReturnUrlAndGoto(newHash) {
        if (newHash === void 0) { newHash = null; }
        setReturnUrl();
        if (newHash == null)
            return;
        if (newHash.charAt(0) != "#")
            newHash = "#" + newHash;
        location.hash = newHash;
    }
    LMStatus.setReturnUrlAndGoto = setReturnUrlAndGoto;
    function setReturnUrl(newHash) {
        if (newHash === void 0) { newHash = null; }
        Cook.write(LMComLib.CookieIds.returnUrl, newHash ? newHash : location.hash);
    }
    LMStatus.setReturnUrl = setReturnUrl;
    function clearReturnUrl() {
        Cook.remove(LMComLib.CookieIds.returnUrl);
    }
    LMStatus.clearReturnUrl = clearReturnUrl;
    function isReturnUrl() {
        return !_.isEmpty(getReturnUrl());
    }
    LMStatus.isReturnUrl = isReturnUrl;
    function getReturnUrl() {
        var url = Cook.read(LMComLib.CookieIds.returnUrl);
        if (_.isEmpty(url) || url == '#')
            return null;
        if (url.charAt(0) != "#")
            url = "#" + url;
        return url;
    }
    LMStatus.getReturnUrl = getReturnUrl;
    function gotoReturnUrl() {
        var url = getReturnUrl();
        if (_.isEmpty(url))
            url = schools.createHomeUrlStd();
        location.hash = url;
    }
    LMStatus.gotoReturnUrl = gotoReturnUrl;
    LMStatus.Cookie = null;
    function scormUserId() {
        return LMStatus.Cookie.TypeId ? LMStatus.Cookie.TypeId : LMStatus.Cookie.id.toString();
    }
    LMStatus.scormUserId = scormUserId;
    function isLogged() { return !_.isEmpty(LMStatus.Cookie) && LMStatus.Cookie.id && LMStatus.Cookie.id > 0; }
    LMStatus.isLogged = isLogged;
    function loggedBodyClass() {
        var logged = isLogged();
        if (!logged) {
            $('body').removeClass("logged");
            setCookie(null);
        }
        else {
            $('body').addClass("logged");
        }
    }
    LMStatus.loggedBodyClass = loggedBodyClass;
    //zajisteni zalogovani
    function adjustLoggin(completed) {
        var cookEmpty = !isLogged(); //Cookie == null;
        if (cookEmpty) {
            var ticket = LowUtils.getQueryParams('ticket');
            var a1y = LowUtils.getQueryParams('a1y');
            if (!_.isEmpty(ticket)) {
                Login.login(true, null, null, null, ticket, function (cookie) {
                    setCookie(cookie);
                    window.location.href = window.location.href.replace('ticket=' + ticket, '');
                }, function (errId, errMsg) { debugger; throw 'Utils.adjustCookie: PZ Log Error'; });
                return;
            }
            else if (a1y) {
                var em, psw;
                switch (a1y) {
                    case 'b2c':
                        em = "pzika@langmaster.cz";
                        psw = "p";
                        break; //sance se nasilne nalogovat jako PZ
                    case 'ws7':
                        em = "zzikova@langmaster.cz";
                        psw = "zz";
                        break; //zz
                    case '73q':
                        em = "rjeliga@langmaster.cz";
                        psw = "rj";
                        break; //rj
                    case 'pw6':
                        em = "pjanecek@langmaster.cz";
                        psw = "pj";
                        break; //pj
                    case 'g3n':
                        em = "zikovakaca@seznam.cz";
                        psw = "kz";
                        break; //kz
                    case 'ws7':
                        em = "zzikova@langmaster.cz";
                        psw = "zz";
                        break; //zz
                    default: return;
                }
                Login.login(true, em, null, psw, null, function (cookie) {
                    setCookie(cookie);
                    window.location.href = window.location.href.replace(/a1y=\w{3}/, '');
                }, function (errId, errMsg) { debugger; throw 'Utils.adjustCookie: PZ Log Error'; });
                return;
            }
        }
        getCookie();
        loggedBodyClass();
        if (cookEmpty)
            LMStatus.onLogged(completed);
        else
            completed();
    }
    LMStatus.adjustLoggin = adjustLoggin;
    LMStatus.onLogged = null;
    if ($.views)
        $.views.helpers({
            Cookie: getCookie,
            userName: friendlyName,
            isLMComCookie: isLMComCookie,
            fncExists: function (name) { return ($.views.helpers)[name]; },
            'debugger': function (data) { debugger; },
            icon_chevron_right: function () { return Trados.isRtl ? 'fa-chevron-left' : 'fa-chevron-right'; },
        });
    function LogoutLow() {
        //binec, setCookie nastavi pouze browser cookie a ponecha LMStatus.Cookie
        LMStatus.setCookie(null);
        LMStatus.Cookie = null;
        Pager.loadPageHash(null);
    }
    LMStatus.LogoutLow = LogoutLow;
    function Logout(obj, ev) {
        if (!isLogged())
            return;
        try {
            if (!isLMComCookie()) {
                var a = ev.currentTarget;
                if (a.tagName.toLowerCase() != CourseModel.ta)
                    throw "OAuth.logoutEx";
                a.href = OAuth.logoutUrl(LMStatus.Cookie.Type);
                return true;
            }
            else {
                return false;
            }
        }
        finally {
            LogoutLow();
        }
    }
    LMStatus.Logout = Logout;
    function friendlyName() {
        if (!isLogged())
            return "";
        return LMStatus.Cookie.Type == LMComLib.OtherType.LANGMasterNoEMail ? LMStatus.Cookie.Login : LMStatus.Cookie.EMail;
    }
    LMStatus.friendlyName = friendlyName;
    function isLMComCookie() {
        return !LMStatus.Cookie.Type || LMStatus.Cookie.Type == 0 || LMStatus.Cookie.Type == LMComLib.OtherType.LANGMasterNoEMail || LMStatus.Cookie.Type == LMComLib.OtherType.LANGMaster;
    }
    LMStatus.isLMComCookie = isLMComCookie;
})(LMStatus || (LMStatus = {}));
var JsRenderHelpers;
(function (JsRenderHelpers) {
    if ($.views)
        $.views.helpers({
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
                if (typeof par == "function")
                    par = par();
                return Utils.Empty(par) ? (falseVal ? falseVal : '') : (trueVal ? trueVal : '');
            },
            numConverter: function (par) {
                var pars = [];
                for (var _i = 1; _i < arguments.length; _i++) {
                    pars[_i - 1] = arguments[_i];
                }
                if (typeof par == "function")
                    par = par();
                var idx = Utils.Empty(par) ? 0 : par;
                if (idx >= pars.length)
                    throw "numConverter";
                return pars[idx];
            }
        });
})(JsRenderHelpers || (JsRenderHelpers = {}));
var CSLocalize = null;
var Trados;
(function (Trados) {
    //***************** Lokalizace SW
    var rxLocComment = new RegExp("\\(\\*.*?\\*\\)", "g");
    Trados.actLang = 0;
    Trados.actLangStr = "en_gb";
    Trados.actLangCode = "en-gb"; //napr. sp-sp
    Trados.actLangNetCode = "en-gb"; //napr. es-es
    Trados.isRtl = false;
    var rtlLangs = [LMComLib.Langs.ar_sa];
    //export function isRtl():boolean { return _.any(rtlLangs, l => l == actLang);}
    //export function initLang(lng: LMComLib.Langs): void {
    //  forceLang = lng == LMComLib.Langs.no ? null : LowUtils.EnumToString(LMComLib.Langs, lng).replace("_", "-");
    //}
    //var forceLang: string;
    var alertCalled = false;
    function Localize(id, def) {
        if (typeof tradosData == "undefined") {
            if (!alertCalled) {
                debugger;
                alert("Trados.Localize: missing tradosData");
            }
            alertCalled = true;
            return locNormalize(def);
        }
        if (id == null)
            return locNormalize(def);
        var res = tradosData[id];
        if (typeof (res) == 'undefined' || res == "###TRANS TODO###")
            return locNormalize(def);
        return res;
    }
    ;
    function locNormalize(s) { return s.replace(rxLocComment, ''); }
    Trados.locNormalize = locNormalize;
    if ($.views)
        $.views.helpers({
            CSLocalize: function (s, d) {
                try {
                    return CSLocalize(s, d);
                }
                catch (exp) {
                    throw exp;
                }
            },
            isRtl: function () { return Trados.isRtl; },
            cookie: function (name) { return gCookie.getCookie(name); },
        });
    CSLocalize = Localize;
    //Jsou dva pripady: 
    // - jazyk je definovan tim, ze je primo v HTML strance spravny.JS soubor.
    // - nebo je jazyk definovan externe a spravny .JS soubor se naladuje dynamicky
    function adjustLoc(completed) {
        /************ zjisteni jazyka *****************/
        var loadScript;
        var lng; //var fromCookie = "";
        if (typeof tradosData != "undefined") {
            lng = tradosData["forceLang"]; //jazyk je urcen timto .JS souborem
            Logger.trace("Trados.adjustLoc", "JS included, lng=" + lng);
            loadScript = false;
        }
        else {
            Logger.trace("Trados.adjustLoc", "JS not included");
            lng = null; //forceLang;
            loadScript = true;
        }
        if (_.isEmpty(lng)) {
            var hash = LowUtils.parseQuery(location.hash);
            if (hash != null && hash["lang"]) {
                lng = hash["lang"];
                location.hash = "";
            }
        }
        if (_.isEmpty(lng)) {
            var search = LowUtils.parseQuery(location.search);
            if (search != null && search["lang"]) {
                lng = search["lang"];
            }
        }
        //Jazyk z cookie:
        //if (loadScript && Utils.Empty(lng)) fromCookie = lng = Cook.read(LMComLib.CookieIds.lang);
        if (_.isEmpty(lng))
            lng = lng = Cook.read(LMComLib.CookieIds.lang);
        //jazyk neznamy => default
        if (_.isEmpty(lng) || lng == "no")
            lng = "en-gb"; //jazyk neznamy => default
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
        var isOK = Trados.actLang == newLng;
        Trados.actLang = newLng;
        var doCompleted = function () {
            Trados.actLangStr = LowUtils.EnumToString(LMComLib.Langs, Trados.actLang);
            Trados.actLangCode = Trados.actLangStr.replace("_", "-");
            Trados.actLangNetCode = Trados.actLangCode.replace('sp-sp', 'es-es');
            _.each(Globalize.cultures, function (c) { Globalize.cultures[c.name.toLowerCase()] = c; }); //culture lowercase
            Globalize.culture(Trados.actLangNetCode);
            Trados.isRtl = _.indexOf(rtlLangs, Trados.actLang) >= 0;
            completed();
        };
        if (isOK || Trados.actLang == LMComLib.Langs.en_gb) {
            tradosData = {};
            doCompleted();
            return;
        } //anglictina se neladuje
        if (!loadScript) {
            doCompleted();
            return;
        } //scorm nebo local: jiz naladovano
        /************ naladovani .JS souboru *****************/
        var spHack = lng == "sp-sp" ? "es-es" : lng;
        $.when(//ladovani
        $.ajax({
            cache: true,
            dataType: "script",
            url: Pager.path(Pager.pathType.relPath, Utils.string_format("jslib/scripts/cultures/globalize.culture.{0}.js", [spHack]))
        }), $.ajax({
            cache: true,
            dataType: "script",
            url: Pager.path(Pager.pathType.relPath, Utils.string_format("schools/loc/tradosData.{0}.js", [spHack]))
        })).done(function () { return doCompleted(); })
            .fail(function () {
            doCompleted(); /*noop, pouzije se difotni lokalizace, tj anglictina */
        });
    }
    Trados.adjustLoc = adjustLoc;
    //***************** Lokalizace dat
    //lokalizace JSON objektu
    function localizeObject(s, locPar, isRJson) {
        if (isRJson === void 0) { isRJson = false; }
        s = localizeJSON(s, locPar);
        var res = JSON.parse(s);
        return isRJson ? RJSON.unpack(res) : res; //ev. RJSON
    }
    Trados.localizeObject = localizeObject;
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
    function localize(data, loc) {
        //if (!loc) return data;
        var isJson = data.charAt(0) == "{";
        return data.replace(locEx, function (match) {
            var gm = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                gm[_i - 1] = arguments[_i];
            }
            var group_match = gm[0];
            var data = loc ? loc[group_match] : null;
            if (data && (isJson || group_match == 'Ahtmltitle')) {
                data = JSON.stringify(data);
                data = data.substr(1, data.length - 2);
            }
            return data ? data.toString() : "*** " + group_match + " ***";
        });
    }
    Trados.localize = localize;
    var locEx = /{{(.*?)}}/g;
    //low level nahrada {{}} zavorek pro umisteni do JSON stringu
    function localizeJSON(data, loc) {
        if (!loc)
            return data;
        return data.replace(locEx, function (match) {
            var gm = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                gm[_i - 1] = arguments[_i];
            }
            var group_match = gm[0];
            var data = JSON.stringify(loc[group_match]);
            if (data)
                data = data.substr(1, data.length - 2);
            return data ? data.toString() : "*** " + group_match + " ***";
        });
    }
    Trados.localizeJSON = localizeJSON;
})(Trados || (Trados = {}));
if (typeof ko != 'undefined') {
    ko.bindingHandlers["width"] = {
        init: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
            valueAccessor($(element).width());
        },
        update: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
            $(element).width(ko.utils.unwrapObservable(valueAccessor()));
        }
    };
    ko.bindingHandlers["height"] = {
        init: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
            valueAccessor($(element).height());
        },
        update: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
            $(element).height(ko.utils.unwrapObservable(valueAccessor()));
        }
    };
}
ko.bindingHandlers['test'] = {
    init: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
        var nm = ko.unwrap(valueAccessor());
        _.each($(element).parents().toArray(), function (el) {
            var n = el.getAttribute("data-bind");
            if (n) {
                var t = testRegEx.exec(n);
                if (t)
                    nm = t[1] + '.' + nm;
            }
        });
        element.setAttribute('name', nm);
    }
};
var testRegEx = /.*test:'(.*?)'/g;
