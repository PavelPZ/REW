var anim;
(function (anim) {
    /*
    <div data-toggle="collapse" data-target="#menu1">Expand</div>
    <div id="menu1" class="lm-anim" data-role="collapsed">
    Text Text Text Text Text Text Text Text Text Text Text Text
    </div>
    
    .lm-menu { position:absolute; }
    <div data-toggle="menu" data-target="#m1">Expand m2</div>
    <div id="m1" class="lm-menu lm-anim" data-role="menu">
    Text Text Text Text Text Text Text Text Text Text Text Text
    </div>
    */
    //http://www.bennadel.com/blog/1864-Experimenting-With-jQuery-s-Queue-And-Dequeue-Methods.htm
    //http://jsfiddle.net/enf644/6bX28/2/
    var animInterval = 400;

    //rozbal collapsed
    function toggleShow(block) {
        show(block, true);
    }

    function show(block, isToogle) {
        stopAnim(); //ukonci vsechny animace
        $('[data-role=collapsed]:not(:hidden)').not(block).hide(animInterval); //zabal ostatni collapsed
        if (!block)
            return;
        if (isToogle)
            block.toggle(animInterval);
        else
            block.show(animInterval);
    }
    anim.show = show;

    function hideMenus(self) {
        $('[data-role=menu]').not(self).css({ 'opacity': 0, 'visibility': 'hidden' }); //zavri vsechna menu mimo self
    }
    anim.hideMenus = hideMenus;

    //otevri menu
    function showMenu(menu, ev) {
        stopAnim(); //ukonci vsechny animace
        hideMenus(menu);
        setTimeout(function () {
            menu.css({ 'visibility': 'visible', 'display': 'block', 'opacity': 0 }); //pro jistotu: inicializace menu
            menu.position({ my: "left+10 top+10", of: ev, collision: 'flipfit' }); //umisteni menu
            menu.animate({ "opacity": 1 }, animInterval); //animace opacity
        }, 1);
    }
    anim.showMenu = showMenu;

    //jakykoliv click
    $(document).on('click', function (ev) {
        var self = $(ev.target).closest('[data-role=menu]');
        hideMenus(self);
        setTimeout(function () {
            return self.css({ 'opacity': 0, 'visibility': 'hidden' });
        }, 1); //za chvili zavri i self
    });

    //rozbal collapse
    $(document).on('click', '[data-toggle=collapse], [data-toggle=collapse] *', function (ev) {
        toggleShow($($(ev.target).closest('[data-toggle=collapse]').attr('data-target'))); //animuj element, jehoz id je ulozen v data-target
        ev.stopPropagation();
        return false;
    });

    //objev menu
    function toggleMenu(ev) {
        return toggleMenuLow($.event.fix(ev));
    }
    anim.toggleMenu = toggleMenu;
    function toggleMenuLow(ev) {
        ev.stopPropagation();

        //ev.stopPropagation();
        showMenu($($(ev.target).closest('[data-toggle=menu]').attr('data-target')), ev); //animuj element s menu, jehoz id je ulozen v data-target
        return false;
    }
    anim.toggleMenuLow = toggleMenuLow;

    $(document).on('click', '[data-toggle=menu], [data-toggle=menu] *', toggleMenuLow);

    //uzavri menu
    $(document).on('keydown', '*', function (ev) {
        stopAnim();
        if (ev.keyCode != 27)
            return;
        hideMenus(null);
        return false;
    });

    anim.mousePos;

    //zapamatovani si pozice mysi
    $(document).bind('mousemove', function (ev) {
        return anim.mousePos = ev;
    });

    //inicializace (funguje pouze pro existujici elementy)
    $(function () {
        $('[data-role=collapsed]').hide();
        $('[data-role=menu]').css({ 'opacity': 0, 'visibility': 'hidden' });
    });

    //collapse all expandables
    function collapseExpanded() {
        $('[data-role=collapsed]:not(:hidden)').hide();
    }
    anim.collapseExpanded = collapseExpanded;

    //collapse all expandables slow
    function collapseExpandedSlow() {
        $('[data-role=collapsed]:not(:hidden)').hide(animInterval);
    }
    anim.collapseExpandedSlow = collapseExpandedSlow;

    //ukonci vsechny animace
    function stopAnim() {
        $('[data-role=collapsed], [data-role=menu]').finish();
    }
    anim.stopAnim = stopAnim;
})(anim || (anim = {}));

var Gui2;
(function (Gui2) {
    var skin = (function () {
        function skin() {
        }
        skin.prototype.bodyClass = function () {
            return '';
        };
        skin.prototype.getLoginHome = function (std) {
            var res = this.loginHome();
            return _.isEmpty(res) ? std : res;
        };
        skin.prototype.loginHome = function () {
            return null;
        };
        skin.instance = new skin();
        return skin;
    })();
    Gui2.skin = skin;

    var cancelTouch = function (ev, t) {
        if (ev != null) {
            ev.originalEvent = null;
            ev.preventDefault();
            ev.stopPropagation();
        }
        t.removeClass("lm-click");
    };

    $(document).delegate(".lm-clickable", "tapstart tapend mousedown mouseup", function (ev) {
        switch (ev.type) {
            case "tapstart":
            case "mousedown":
                var t = $(ev.currentTarget);
                if (t.is('.disabled'))
                    return;
                t.addClass("lm-click");
                setTimeout(function () {
                    return cancelTouch(ev, t);
                }, 800);
                return true;
                break;
            case "tapend":
            case "mouseup":
                cancelTouch(ev, $(ev.currentTarget));
                break;
        }
    });

    function textWidthStart(styleHolder) {
        if (!twEl) {
            twEl = $('<div></div>');
            twEl.css({ position: 'absolute', left: -1000, top: -1000, height: 'auto', width: 'auto', 'white-space': 'nowrap' });
            $('body').append(twEl);
        }
        _.each(twStyles, function (s) {
            return twEl.css(s, styleHolder.css(s));
        });
    }
    function textWidth(txt, styleHolder) {
        textWidthStart(styleHolder);
        twEl.html(txt);
        return twEl.width();
    }
    Gui2.textWidth = textWidth;
    function maxTextWidth(txts, styleHolder) {
        textWidthStart(styleHolder);
        var res = 0;
        _.each(txts, function (txt) {
            twEl.html(txt);
            res = Math.max(res, twEl.width());
        });
        return res;
    }
    Gui2.maxTextWidth = maxTextWidth;
    var twStyles = ['font-size', 'font-style', 'font-weight', 'font-family', 'line-height', 'text-transform', 'letter-spacing'];
    var twEl = null;
})(Gui2 || (Gui2 = {}));

var schools;
(function (schools) {
    schools.appId = "school";
})(schools || (schools = {}));
var Login;
(function (Login) {
    Login.appId = "login";
})(Login || (Login = {}));

var schoolAdmin;
(function (schoolAdmin) {
    schoolAdmin.appId = "schoolAdmin".toLowerCase();
})(schoolAdmin || (schoolAdmin = {}));

var Pager;
(function (Pager) {
    (function (ButtonType) {
        ButtonType[ButtonType["okCancel"] = 0] = "okCancel";
        ButtonType[ButtonType["ok"] = 1] = "ok";
        ButtonType[ButtonType["cancel"] = 2] = "cancel";
    })(Pager.ButtonType || (Pager.ButtonType = {}));
    var ButtonType = Pager.ButtonType;

    var ViewModelRoot = (function () {
        function ViewModelRoot() {
        }
        ViewModelRoot.prototype.pageChanged = function (oldPage, newPage) {
        };
        ViewModelRoot.prototype.loaded = function () {
        };
        return ViewModelRoot;
    })();
    Pager.ViewModelRoot = ViewModelRoot;

    var Page = (function () {
        function Page(appId, type, urlParts /*, public base: Page = null*/ ) {
            this.appId = appId;
            this.type = type;
            this.urlParts = urlParts;
        }
        Page.prototype.update = function (completed) {
            completed();
        };
        Page.prototype.leave = function () {
        };
        Page.prototype.htmlClearing = function () {
        };
        Page.prototype.getHash = function () {
            return [this.appId, this.type].concat(this.urlParts).join('@');
        };
        return Page;
    })();
    Pager.Page = Page;

    Pager.ignorePage = new Page(null, null, null);

    function registerAppLocator(appId, type, pageCreator) {
        if (!regApps[appId])
            regApps[appId] = {};
        regApps[appId][type] = pageCreator;
    }
    Pager.registerAppLocator = registerAppLocator;
    var regApps = {};

    function locatePageFromHash(hash, completed) {
        locatePageFromHashLow(hash, function (pg) {
            if (pg) {
                completed(pg);
                return;
            }
            if (!hash || hash.length < 2)
                locatePageFromHashLow(Pager.initHash, completed);
            else {
                window.location.hash = "";
                completed(null);
            }
        });
    }
    Pager.locatePageFromHash = locatePageFromHash;

    function locatePageFromHashLow(hash, completed) {
        if (hash != null && hash.indexOf("access_token=") >= 0) {
            OAuth.checkForToken(function (obj) {
                Pager.ajaxGet(1 /* restServices */, Login.CmdAdjustUser_Type, Login.CmdAdjustUser_Create(obj.providerid, obj.id, obj.email, obj.firstName, obj.lastName), function (res) {
                    LMStatus.logged(res.Cookie, false);
                });
            });
            completed(Pager.ignorePage);
            return;
        }
        if (hash && hash.charAt(0) == '#')
            hash = hash.substring(1);
        if (!hash || hash.length < 3) {
            completed(null);
            return;
        }

        //hash = hash.toLowerCase();
        var parts = hash.split("@");
        if (parts.length < 2) {
            completed(null);
            return;
        }
        var app = regApps[parts[0].toLowerCase()];
        if (!app) {
            completed(null);
            return;
        }
        var proc = app[parts[1].toLowerCase()];
        if (!proc) {
            completed(null);
            return;
        }
        proc(parts.length <= 2 ? null : parts.slice(2), completed);
    }

    Pager.ActPage;
    Pager.htmlOwner;

    $.views.helpers({
        ActPage: function () {
            return Pager.ActPage;
        },
        HomeUrl: function () {
            return Pager.initHash;
        }
    });

    function HomeUrl() {
        return "#";
    }
    Pager.HomeUrl = HomeUrl;

    function navigateToHash(hash) {
        location.hash = '#' + hash;
    }
    Pager.navigateToHash = navigateToHash;

    function closePanels() {
        anim.collapseExpanded();
    }
    Pager.closePanels = closePanels;

    function loadPage(page) {
        if (Pager.ActPage != page) {
            var oldPg = Pager.ActPage;
            Pager.ActPage = page;
            if (oldPg != null)
                oldPg.leave();
            Pager.rootVM.pageChanged(oldPg, Pager.ActPage);
        }
        reloadPage();
    }
    Pager.loadPage = loadPage;

    function beforeLoadPage(page) {
        if (Pager.ActPage == page)
            return;
        var oldPg = Pager.ActPage;
        Pager.ActPage = page;
        if (oldPg != null)
            oldPg.leave();
        Pager.rootVM.pageChanged(oldPg, Pager.ActPage);
    }
    Pager.beforeLoadPage = beforeLoadPage;

    function reloadPage(page) {
        if (typeof page === "undefined") { page = null; }
        if (!page)
            page = Pager.ActPage;
        if (!page)
            throw 'Missing page';
        Logger.trace("ModelBase.reload: url=", page.getHash() + ", template=" + ViewBase.viewLocator(page.type));

        //clearHtml(); 16.9.2014, optimalizace:
        clearNode();

        page.update(function () {
            renderHtml(page);
            callLoaded();
        });
    }
    Pager.reloadPage = reloadPage;

    function renderTemplate(val) {
        var root = $('#root');
        if (val == 'Dummy') {
            clearNode();
            root.html('');
        } else {
            root.html(JsRenderTemplateEngine.render(val, Pager.rootVM));
            ko.applyBindings(Pager.rootVM, $('#root')[0]);
        }
    }
    Pager.renderTemplate = renderTemplate;

    //Vymaz obsah stranky
    function clearHtml() {
        renderTemplate('Dummy');
    }
    Pager.clearHtml = clearHtml;

    function clearNode() {
        if (!Pager.htmlOwner)
            return;
        try  {
            ko.cleanNode($('#root')[0]);
        } catch (e) {
        }
        Pager.htmlOwner.htmlClearing();
        Pager.htmlOwner = null;
    }

    //vygeneruj HTML a navaz ho do stranky. Proved ko-binding
    function renderHtml(page) {
        if (typeof page === "undefined") { page = Pager.ActPage; }
        clearNode();
        renderTemplate(ViewBase.viewLocator(page.type));
        Pager.htmlOwner = page;
    }
    Pager.renderHtml = renderHtml;

    //stranka dokoncena => zavolej dokoncovaci akce
    function callLoaded() {
        setTimeout(function () {
            return Pager.rootVM.loaded();
        }, 1);
    }
    Pager.callLoaded = callLoaded;

    Pager.rootVM = new ViewModelRoot();
    Pager.initHash;
    Pager.afterLoginInit;
})(Pager || (Pager = {}));

$.whenall = function (arr) {
    return $.when.apply($, arr);
};
Array.prototype.pushArray = function (arr) {
    this.push.apply(this, arr);
};

$.views.settings({ onError: function () {
        debugger;
    }, _dbgMode: false });

$.whenAll = function (firstParam) {
    var args = arguments, sliceDeferred = [].slice, i = 0, length = args.length, count = length, rejected, deferred = length <= 1 && firstParam && jQuery.isFunction(firstParam.promise) ? firstParam : jQuery.Deferred();

    function resolveFunc(i, reject) {
        return function (value) {
            rejected = true;
            args[i] = arguments.length > 1 ? sliceDeferred.call(arguments, 0) : value;
            if (!(--count)) {
                // Strange bug in FF4:
                // Values changed onto the arguments object sometimes end up as undefined values
                // outside the $.when method. Cloning the object into a fresh array solves the issue
                var fn = rejected ? deferred.rejectWith : deferred.resolveWith;
                fn.call(deferred, deferred, sliceDeferred.call(args, 0));
            }
        };
    }

    if (length > 1) {
        for (; i < length; i++) {
            if (args[i] && jQuery.isFunction(args[i].promise)) {
                args[i].promise().then(resolveFunc(i, false), resolveFunc(i, true));
            } else {
                --count;
            }
        }
        if (!count) {
            deferred.resolveWith(deferred, args);
        }
    } else if (deferred !== firstParam) {
        deferred.resolveWith(deferred, length ? [firstParam] : []);
    }
    return deferred.promise();
};

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
        if (typeof def === "undefined") { def = ""; }
        return gCookie.getCookie(LowUtils.EnumToString(LMComLib.CookieIds, id), def);
    }
    Cook.read = read;
    function write(id, value, persist) {
        if (typeof persist === "undefined") { persist = false; }
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
    function ToString(ck) {
        return Utils.encrypt(ck);
    }
    LMStatus.ToString = ToString;
    function FromString(s) {
        return Utils.decrypt(s);
    }

    function getCookie() {
        if (!isLogged()) {
            try  {
                var cookStr = Cook.read(1 /* LMTicket */);
                if (cookStr != "") {
                    LMStatus.Cookie = FromString(cookStr);
                    if (LMStatus.Cookie.id <= 0)
                        LMStatus.Cookie = null;
                }
            } catch (msg) {
                return null;
            }
        }
        return LMStatus.Cookie;
    }
    LMStatus.getCookie = getCookie;
    function setCookie(cook, persistent) {
        if (typeof persistent === "undefined") { persistent = false; }
        if (cook == null)
            Cook.remove(1 /* LMTicket */);
        else
            Cook.write(1 /* LMTicket */, ToString(cook), persistent);
        //Cookie = cook;
    }
    LMStatus.setCookie = setCookie;

    function logged(cook, persistent) {
        if (typeof persistent === "undefined") { persistent = false; }
        setCookie(cook, persistent);
        adjustLoggin(LMStatus.gotoReturnUrl);
    }
    LMStatus.logged = logged;

    function loginUrl() {
        return "http://" + location.host + "/lmcom/Services/LMLive/LMLive.aspx?returnurl=" + encodeURIComponent(location.href);
    }
    LMStatus.loginUrl = loginUrl;

    function setReturnUrlAndGoto(newHash) {
        if (typeof newHash === "undefined") { newHash = null; }
        setReturnUrl();
        if (newHash == null)
            return;
        if (newHash.charAt(0) != "#")
            newHash = "#" + newHash;
        location.hash = newHash;
    }
    LMStatus.setReturnUrlAndGoto = setReturnUrlAndGoto;
    function setReturnUrl(newHash) {
        if (typeof newHash === "undefined") { newHash = null; }
        Cook.write(5 /* returnUrl */, newHash ? newHash : location.hash);
    }
    LMStatus.setReturnUrl = setReturnUrl;
    function clearReturnUrl() {
        Cook.remove(5 /* returnUrl */);
    }
    LMStatus.clearReturnUrl = clearReturnUrl;
    function isReturnUrl() {
        return !_.isEmpty(getReturnUrl());
    }
    LMStatus.isReturnUrl = isReturnUrl;
    function getReturnUrl() {
        var url = Cook.read(5 /* returnUrl */);
        if (_.isEmpty(url))
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
    function isLogged() {
        return !_.isEmpty(LMStatus.Cookie) && LMStatus.Cookie.id && LMStatus.Cookie.id > 0;
    }
    LMStatus.isLogged = isLogged;

    function loggedBodyClass() {
        var logged = isLogged();
        if (!logged) {
            $('body').removeClass("logged");
            setCookie(null);
        } else {
            $('body').addClass("logged");
        }
    }
    LMStatus.loggedBodyClass = loggedBodyClass;

    //zajisteni zalogovani
    function adjustLoggin(completed) {
        var cookEmpty = !isLogged();
        if (cookEmpty && LowUtils.getQueryParams('a1y') == 'b2c') {
            Login.login(true, "pzika@langmaster.cz", null, "p", function (cookie) {
                setCookie(cookie);
                window.location.href = window.location.href.replace('a1y=b2c', '');
            }, function (errId, errMsg) {
                debugger;
                throw 'Utils.adjustCookie: PZ Log Error';
            });
            return;
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
            fncExists: function (name) {
                return ($.views.helpers)[name];
            },
            'debugger': function (data) {
                debugger;
            },
            icon_chevron_right: function () {
                return Trados.isRtl ? 'fa-chevron-left' : 'fa-chevron-right';
            }
        });

    function Logout(obj, ev) {
        if (!isLogged())
            return;
        try  {
            if (!isLMComCookie()) {
                var a = ev.currentTarget;
                if (a.tagName.toLowerCase() != "a")
                    throw "OAuth.logoutEx";
                a.href = OAuth.logoutUrl(LMStatus.Cookie.Type);
                return true;
            } else {
                return false;
            }
        } finally {
            LMStatus.setCookie(null);
            location.reload();
        }
    }
    LMStatus.Logout = Logout;

    function friendlyName() {
        if (!isLogged())
            return "";
        return LMStatus.Cookie.Type == 11 /* LANGMasterNoEMail */ ? LMStatus.Cookie.Login : LMStatus.Cookie.EMail;
    }
    LMStatus.friendlyName = friendlyName;
    function isLMComCookie() {
        return !LMStatus.Cookie.Type || LMStatus.Cookie.Type == 0 || LMStatus.Cookie.Type == 11 /* LANGMasterNoEMail */ || LMStatus.Cookie.Type == 10 /* LANGMaster */;
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
                for (var _i = 0; _i < (arguments.length - 1); _i++) {
                    pars[_i] = arguments[_i + 1];
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
    Trados.actLangCode = "en-gb";
    Trados.actLangNetCode = "en-gb";
    Trados.isRtl = false;
    var rtlLangs = [18 /* ar_sa */];

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
    function locNormalize(s) {
        return s.replace(rxLocComment, '');
    }
    Trados.locNormalize = locNormalize;

    if ($.views)
        $.views.helpers({
            CSLocalize: function (s, d) {
                try  {
                    return CSLocalize(s, d);
                } catch (exp) {
                    throw exp;
                }
            },
            isRtl: function () {
                return Trados.isRtl;
            },
            cookie: function (name) {
                return gCookie.getCookie(name);
            }
        });
    CSLocalize = Localize;

    //Jsou dva pripady:
    // - jazyk je definovan tim, ze je primo v HTML strance spravny.JS soubor.
    // - nebo je jazyk definovan externe a spravny .JS soubor se naladuje dynamicky
    function adjustLoc(completed) {
        /************ zjisteni jazyka *****************/
        var loadScript;
        var lng;
        if (typeof tradosData != "undefined") {
            lng = tradosData["forceLang"]; //jazyk je urcen timto .JS souborem
            Logger.trace("Trados.adjustLoc", "JS included, lng=" + lng);
            loadScript = false;
        } else {
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
            lng = lng = Cook.read(0 /* lang */);

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
        Cook.write(0 /* lang */, lng);

        //use lang
        var newLng = LowUtils.EnumParse(LMComLib.Langs, lng.replace('-', '_'));
        var isOK = Trados.actLang == newLng;
        Trados.actLang = newLng;
        var doCompleted = function () {
            Trados.actLangStr = LowUtils.EnumToString(LMComLib.Langs, Trados.actLang);
            Trados.actLangCode = Trados.actLangStr.replace("_", "-");
            Trados.actLangNetCode = Trados.actLangCode.replace('sp-sp', 'es-es');
            _.each(Globalize.cultures, function (c) {
                Globalize.cultures[c.name.toLowerCase()] = c;
            }); //culture lowercase
            Globalize.culture(Trados.actLangNetCode);
            Trados.isRtl = _.indexOf(rtlLangs, Trados.actLang) >= 0;
            completed();
        };
        if (isOK || Trados.actLang == 3 /* en_gb */) {
            tradosData = {};
            doCompleted();
            return;
        }
        if (!loadScript) {
            doCompleted();
            return;
        }

        /************ naladovani .JS souboru *****************/
        var spHack = lng == "sp-sp" ? "es-es" : lng;
        $.when($.ajax({
            cache: true,
            dataType: "script",
            url: Pager.path(6 /* relPath */, Utils.string_format("jslib/scripts/cultures/globalize.culture.{0}.js", [spHack]))
        }), $.ajax({
            cache: true,
            dataType: "script",
            url: Pager.path(6 /* relPath */, Utils.string_format("schools/loc/tradosData.{0}.js", [spHack]))
        })).done(function () {
            return doCompleted();
        }).fail(function () {
            doCompleted(); /*noop, pouzije se difotni lokalizace, tj anglictina */
        });
    }
    Trados.adjustLoc = adjustLoc;

    //***************** Lokalizace dat
    //lokalizace JSON objektu
    function localizeObject(s, locPar, isRJson) {
        if (typeof isRJson === "undefined") { isRJson = false; }
        s = localizeJSON(s, locPar);
        var res = JSON.parse(s);
        return isRJson ? RJSON.unpack(res) : res;
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
            for (var _i = 0; _i < (arguments.length - 1); _i++) {
                gm[_i] = arguments[_i + 1];
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
            for (var _i = 0; _i < (arguments.length - 1); _i++) {
                gm[_i] = arguments[_i + 1];
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

var ViewBase;
(function (ViewBase) {
    function viewLocator(modelName) {
        modelIdToScriptIdInit();
        var res = modelIdToScriptId[modelName];
        if (!res)
            throw "ViewBase.ts ModelBase.viewLocator: Missing view " + modelName + " in Rewise\DefaultMobile.aspx.cs";
        return res;
    }
    ViewBase.viewLocator = viewLocator;

    function modelIdToScriptIdInit() {
        if (modelIdToScriptId != null)
            return;
        modelIdToScriptId = [];
        $('script[data-for]').each(function (idx, el) {
            var th = $(el);
            var fors = th.attr('data-for').toLowerCase().split(",");
            _.each(fors, function (f) {
                return modelIdToScriptId[f + "Model".toLowerCase()] = th.attr('id');
            });
        });
    }
    var modelIdToScriptId;

    ViewBase.init = function () {
        Logger.traceMsg('ViewBase.initBootStrapApp');
        $(window).hashchange(function () {
            Pager.locatePageFromHash(location.hash, function (page) {
                if (page == null || page == Pager.ignorePage)
                    return;
                Pager.loadPage(page);
            });
        });
        $(window).hashchange();
    };
})(ViewBase || (ViewBase = {}));

var Pager;
(function (Pager) {
    (function (pathType) {
        //root,
        pathType[pathType["eTestMe"] = 0] = "eTestMe";
        pathType[pathType["restServices"] = 1] = "restServices";
        pathType[pathType["loggerService"] = 2] = "loggerService";
        pathType[pathType["restServicesScorm"] = 3] = "restServicesScorm";
        pathType[pathType["eaScormServer"] = 4] = "eaScormServer";
        pathType[pathType["eaData"] = 5] = "eaData";
        pathType[pathType["relPath"] = 6] = "relPath";

        //schoolCourse, //lmcom/rew/schools/courses/
        pathType[pathType["cpv"] = 7] = "cpv";

        //
        pathType[pathType["grammar"] = 8] = "grammar";
        pathType[pathType["instructions"] = 9] = "instructions";
        pathType[pathType["sitemaps"] = 10] = "sitemaps";
        pathType[pathType["sitemapRoot"] = 11] = "sitemapRoot";
        pathType[pathType["moduleData"] = 12] = "moduleData";
        pathType[pathType["dictInfo"] = 13] = "dictInfo";
        pathType[pathType["course2rewiseMap"] = 14] = "course2rewiseMap";
        pathType[pathType["rewiseIndex"] = 15] = "rewiseIndex";
        pathType[pathType["rewiseLesson"] = 16] = "rewiseLesson";
        pathType[pathType["prod"] = 17] = "prod";
        pathType[pathType["data"] = 18] = "data";
    })(Pager.pathType || (Pager.pathType = {}));
    var pathType = Pager.pathType;

    //k http://www.langmaster.com/rew/Schools/NewEA.aspx... vrati http://www.langmaster.com/rew/
    var parts = location.pathname.toLowerCase().split('/');
    var schoolIdx = _.indexOf(parts, 'schools');

    ////var href = 'http(s)://server/_layouts/SharePointLearningKit/Frameset/Frameset.aspx'.toLowerCase();
    ////var idx = href.indexOf('/sharepointlearningkit/');
    ////href = href.substr(0, idx + 1) + 'SLMS/SLMSLoadLM.ashx';
    parts = parts.slice(0, schoolIdx >= 0 ? schoolIdx : parts.length - 2); //odrizni Schools/NewEA.aspx
    Pager.basicDir = location.protocol + '//' + location.host + parts.join('/');
    Pager.basicUrl = Pager.basicDir + '/';

    //export var cfg: ajaxConfig = { forceServiceUrl: null };
    function path(type, url, loc) {
        if (typeof url === "undefined") { url = ""; }
        if (typeof loc === "undefined") { loc = 0 /* no */; }
        var res = null;
        switch (type) {
            case 6 /* relPath */:
                return '../' + url;
                break;
            case 1 /* restServices */:
                return !cfg.forceServiceUrl ? Pager.basicUrl + 'service.ashx' : serviceUrl();
                break;
            case 2 /* loggerService */:
                return cfg.forceLoggerUrl ? cfg.forceLoggerUrl : path(1 /* restServices */);
                break;
            case 3 /* restServicesScorm */:
                return cfg.forceServiceUrl == null ? Pager.basicUrl + 'scormEx.ashx' : serviceUrl();
                break;

            case 0 /* eTestMe */:
                res = 'lmcom/eTestMe.com/Test.aspx';
                break;
            case 4 /* eaScormServer */:
                res = 'lmcom/services/rpc/ea/scormserver.aspx';
                break;
            case 5 /* eaData */:
                res = LMComLib.LangToEADir[loc.toString()] + "/";
                break;
            case 7 /* cpv */:
                res = "lmcom/eTestMe.com/site/" + Trados.actLangCode + '/ListeningAndPronunc.aspx#/AppPronunc/FactSoundView.xaml?IsFactOnly=true&';
                break;
            default:
                throw "NotImplemented";
        }
        return Pager.basicUrl + res + url;
    }
    Pager.path = path;

    function serviceUrl() {
        var cfgUrl = cfg.forceServiceUrl;
        switch (cfgUrl) {
            case 'edoceo':
                return location.protocol + '//' + location.host + '/' + location.pathname.split('/')[1] + '/courseresult/langmaster';
            case 'scomp-sharepoint':
                var href = location.href.toLowerCase();
                var idx = href.indexOf('/sharepointlearningkit/');
                href = href.substr(0, idx + 1);
                href += 'SLMS/SLMSLoadLM.ashx'.toLowerCase();

                //Query GUID
                var frame = window;
                var guid = null;
                var lkpar = 'LearnerAssignmentId'.toLowerCase();
                while (frame != null) {
                    guid = LowUtils.getQuery(LowUtils.parseQuery(frame.location.search), lkpar, null);
                    if (guid != null)
                        break;
                    frame = frame == frame.parent ? null : frame.parent;
                }
                if (guid != null)
                    href += '?AttemptIdGuid=' + guid;
                return href;
            case 'scomp-sharepoint-test':
                return "http://localhost/rew/scormexNet35.ashx";
            case 'moodle-pchelp':
                var href = scorm.apiUrl.replace('mod/scorm/player.php', 'filter/langmaster/service.php');
                return href;
            default:
                return cfgUrl;
        }
    }

    function replaceJSON(fn, replace) {
        return replace ? fn.replace('.json', '.js').replace('.rjson', '.js').replace('.lst', '.txt') : fn;
    }
    Pager.replaceJSON = replaceJSON;

    //export function filePath(type: pathType, id: string, loc: string = null): locPaths {
    //  var dir: string; var ext = "json"; var locExt = "json"; //var urlDict = null;
    //  switch (type) {
    //    case pathType.prod:
    //    //case pathType.data:
    //    //  id = "../" + pathType[type] + "/" + id.toLowerCase() + '.json';
    //    //  return { url: id, urlLoc: id.replace('.', '.' + loc + '.') };
    //    //case pathType.sitemaps: dir = "eacourses"; ext = "rjson"; break;
    //    //case pathType.sitemapRoot: dir = "eacourses"; id = "courses"; ext = "rjson"; break; //id se ignoruje
    //    //case pathType.sitemapRoot: dir = "eacourses"; id = "courses"; break; //id se ignoruje
    //    //case pathType.dictInfo: dir = "eacourses"; id = "dicts"; ext = "rjson"; break; //id se ignoruje
    //    //case pathType.grammar: dir = "eagrammar"; break;
    //    //case pathType.instructions: dir = "eadata"; id = "instructions"; break; //id se ignoruje
    //    //case pathType.moduleData: dir = "eadata"; /*urlDict = "lingDict_" + id;*/ break;
    //    //case pathType.course2rewiseMap: dir = "../rwbooks/runtime"; id = "crs2rwmap"; locExt = "rjson"; break; //id se ignoruje, pouze lokalizovana cast
    //    //case pathType.rewiseIndex: dir = "../rwbooks/runtime"; id = "index"; locExt = "rjson"; break; //id se ignoruje, pouze lokalizovana cast
    //    //case pathType.rewiseLesson: dir = "../rwbooks/runtime"; id = Utils.hashDir1(id, 0x3f) + "/" + id; locExt = "rjson"; break; //pouze lokalizovana cast, id je cislo lekce
    //      //case pathType.dictData: dir = "eadata"; locExt = "rjson";
    //      //pro English?E vezmi English? slovnik
    //      //id = id.replace(/(_english\d)e(_)/i, '$1$2');
    //      break;
    //  }
    //  //if (urlDict != null) urlDict = dir + "/" + loc + "/" + urlDict + ".json";
    //  return { url: dir + "/" + id.toLowerCase() + "." + ext, urlLoc: dir + "/" + loc + "/" + id.toLowerCase() + "." + locExt };
    //}
    ////Ajax z Silverlight, volani pres URL mechanismus (napr. pro edoceo v Schools\PersistScormEx.ts)
    //export function doSLAjax(isPost: boolean, url: string, type: string, data: string, callbackObj): void {
    //  doAjax(isPost, url, type, data, (res: string) => callbackObj.completed(res));
    //}
    ////Ajax z Silverlight, volani pres CMD mechanismus (napr. Schools\PersistNewEA.ts)
    //export function doSLAjaxCmd(isPost: boolean, url: string, type: string, data: string, callbackObj): void {
    //  doAjax(isPost, url, type, data, (str: any) => {
    //    if (str == null) { callbackObj.completed(null); return; }
    //    var res: LMComLib.RpcResponse = typeof str == 'string' ? (_.isEmpty(str) ? null : JSON.parse(str)) : str;
    //    if (res == null) return;
    //    if (res.error != 0)
    //      Logger.error('Ajax.doSLAjaxCmd', res.error.toString() + ": " + res.errorText + ", " + url, '');
    //    else
    //      callbackObj.completed(res.result);
    //  });
    //}
    //Ajax pres CMD mechanismus (napr. Schools\PersistNewEA.ts)
    function doAjaxCmd(isPost, url, type, data, completed) {
        doAjax(isPost, url, type, data, function (str) {
            if (str == null) {
                completed(null);
                return;
            }
            var res = typeof str == 'string' ? (_.isEmpty(str) ? null : JSON.parse(str)) : str;
            if (res == null) {
                completed(null);
                return;
            } else if (res.error != 0)
                Logger.error('Ajax.doSLAjaxCmd', res.error.toString() + ": " + res.errorText + ", " + url, '');
            else
                completed(res.result);
        });
    }
    Pager.doAjaxCmd = doAjaxCmd;

    //Univerzalni AJAX funkce pro POST x GET. crossdomain x bez
    function doAjax(isPost, url, type, data, completed /*, error: (id: number, msg: string) => void = null*/ ) {
        var isCrossDomain = Utils.isCrossDomain(url);

        //var isCrossDomain = true;
        url += url.indexOf('?') >= 0 ? "&" : '?';
        url += "timestamp=" + new Date().getTime().toString();
        if (type)
            url += '&type=' + type;
        if (url.charAt(0) == '/')
            url = '..' + url;
        if (isPost && isCrossDomain) {
            Utils.iFrameSubmit(url + '&LoggerLogId=' + Logger.logId() + "&LMComVersion=" + Utils.LMComVersion, data, completed);
        } else {
            if (!isPost && data)
                url += "&par=" + encodeURIComponent(data);
            $.ajax(url, {
                async: true,
                type: isPost ? 'POST' : 'GET',
                dataType: isCrossDomain ? 'jsonp' : 'text',
                data: isPost ? data : '',
                contentType: "text/plain; charset=UTF-8",
                headers: { "LoggerLogId": Logger.logId(), "LMComVersion": Utils.LMComVersion }
            }).done(function (res) {
                if (completed)
                    completed(res);
            }).fail(function () {
                debugger;
                Logger.error('Ajax.doAjax', url, '');
            });
        }
    }
    Pager.doAjax = doAjax;

    //Obsolete, POST (nema obecne callback - pro crossdomain)
    function ajaxPost(pthType, type, data, completed, error) {
        if (typeof completed === "undefined") { completed = null; }
        if (typeof error === "undefined") { error = null; }
        var url = Pager.path(pthType);
        doAjax(true, url, type, JSON.stringify(data), function (str) {
            if (!completed)
                return;
            var res = typeof str == 'string' ? (_.isEmpty(str) ? {} : JSON.parse(str)) : str;
            if (res.error && res.error != 0)
                if (res.error == 999)
                    Logger.error('ajaxPost', url + ": " + res.errorText + ", " + url, '');
                else {
                    if (error)
                        error(res.error, res.errorText);
                    else
                        Logger.error('ajaxPost', res.errorText, '');
                }
            else if (completed != null)
                completed(res.result);
        });
    }
    Pager.ajaxPost = ajaxPost;

    //Obsolete, GET
    function ajaxGet(pthType, type, objData, completed, error) {
        if (typeof error === "undefined") { error = null; }
        var url = Pager.path(pthType);
        doAjax(false, url, type, JSON.stringify(objData), function (str) {
            var res = typeof str == 'string' ? JSON.parse(str) : str;
            if (res.error && res.error != 0)
                if (res.error == 999)
                    Logger.error('ajaxGet', url + ": " + res.errorText + ", " + url, '');
                else {
                    if (error)
                        error(res.error, res.errorText);
                    else
                        Logger.error('ajaxGet', res.errorText, '');
                }
            else if (completed != null)
                completed(res.result);
        });
    }
    Pager.ajaxGet = ajaxGet;
})(Pager || (Pager = {}));


$.ajaxTransport("+*", function (options, originalOptions, jqXHR) {
    // Test for the conditions that mean we can/want to send/receive blobs or arraybuffers - we need XMLHttpRequest
    // level 2 (so feature-detect against window.FormData), feature detect against window.Blob or window.ArrayBuffer,
    // and then check to see if the dataType is blob/arraybuffer or the data itself is a Blob/ArrayBuffer
    if (window.FormData && ((options.dataType && (options.dataType == 'blob' || options.dataType == 'arraybuffer')) || (options.data && ((window.Blob && options.data instanceof Blob) || (window.ArrayBuffer && options.data instanceof ArrayBuffer))))) {
        return {
            /**
            * Return a transport capable of sending and/or receiving blobs - in this case, we instantiate
            * a new XMLHttpRequest and use it to actually perform the request, and funnel the result back
            * into the jquery complete callback (such as the success function, done blocks, etc.)
            *
            * @param headers
            * @param completeCallback
            */
            send: function (headers, completeCallback) {
                var xhr = new XMLHttpRequest(), url = options.url || window.location.href, type = options.type || 'GET', dataType = options.dataType || 'text', data = options.data || null, async = options.async || true;

                xhr.addEventListener('load', function () {
                    var res = {};

                    res[dataType] = xhr.response;
                    completeCallback(xhr.status, xhr.statusText, res, xhr.getAllResponseHeaders());
                });

                xhr.open(type, url, async);
                xhr.responseType = dataType;
                xhr.send(data);
            },
            abort: function () {
                jqXHR.abort();
            }
        };
    }
});

/// <reference path="../jsd/jquery.d.ts" />
/// <reference path="../jsd/knockout.d.ts" />
/// <reference path="../jsd/jsrender.d.ts" />
/// <reference path="../jsd/underscore.d.ts" />
/// <reference path="../js/Utils.ts" />
var validate;
(function (_validate) {
    (function (types) {
        types[types["empty"] = 0] = "empty";
        types[types["required"] = 1] = "required";
        types[types["email"] = 2] = "email";
        types[types["minlength"] = 3] = "minlength";
        types[types["rangelength"] = 4] = "rangelength";
        types[types["range"] = 5] = "range";
        types[types["rangeMin"] = 6] = "rangeMin";
        types[types["rangeMax"] = 7] = "rangeMax";
        types[types["depended"] = 8] = "depended";
    })(_validate.types || (_validate.types = {}));
    var types = _validate.types;

    var c_email = function () {
        return CSLocalize('27747c60f8a24429855917008c65521f', 'E-mail');
    };
    var c_password = function () {
        return CSLocalize('74a95445936f44558cd585dd8b3d7b29', 'Password');
    };
    var c_confirmPsw = function () {
        return CSLocalize('16636e21101c4ebf8a1bae8f358da7b5', 'Confirm password');
    };

    function email(prop, required) {
        prop.required = required;
        return validate.inputModel("email", c_email(), prop, 2 /* email */);
    }
    _validate.email = email;
    function minLen(prop, minLen, name, title) {
        prop.min = minLen;
        return validate.inputModel(name, title, prop, 3 /* minlength */);
    }
    _validate.minLen = minLen;
    function password(prop, minLen, name, title) {
        if (typeof name === "undefined") { name = "password"; }
        if (typeof title === "undefined") { title = null; }
        if (title == null)
            title = c_password();
        prop.min = minLen;
        return validate.inputModel(name, title, prop, 3 /* minlength */, 1 /* password */);
    }
    _validate.password = password;
    function confirmPsw(prop, on) {
        prop.on = on;
        return validate.inputModel("confirmPsw", c_confirmPsw(), prop, 8 /* depended */, 1 /* password */);
    }
    _validate.confirmPsw = confirmPsw;
    function Null() {
        return validate.inputModel(null, null, null, null, null);
    }
    _validate.Null = Null;
    function empty(prop, name, title) {
        return validate.inputModel(name, title, prop, 0 /* empty */);
    }
    _validate.empty = empty;

    (ko.extenders).lm = function (target, par) {
        if (target.type == 0 /* empty */) {
            target.validate = function () {
            };
            return target;
        }
        target.hasError = ko.observable();
        target.message = ko.observable();
        target.hasfocus = ko.observable();
        target.validOk = function () {
            if (!target.ok)
                return;
            focusStatus = 2; //force zobraz chybu
            validate();
            if (target.hasError())
                return;
            focusStatus = 0; //validace OK, uschovej chyby
            target.ok();
        };

        var msg = null;
        function validInt(value) {
            if (value == null || value.length <= 0)
                return NaN;
            if (!/^\d+$/.test(value))
                return NaN;
            return parseInt(value);
        }
        function validate(fake, force) {
            if (typeof fake === "undefined") { fake = null; }
            if (typeof force === "undefined") { force = false; }
            var value = $.trim(target());
            switch (target.type) {
                case 2 /* email */:
                    var empty = value.length == 0;
                    var valid = !(target.required && empty);
                    msg = valid ? null : _validate.messages.required();
                    if (valid && !empty) {
                        valid = /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))$/i.test(value);
                        msg = valid ? null : target.errorMessage || _validate.messages.email();
                    }
                    break;
                case 1 /* required */:
                    var valid = value.length > 0;
                    msg = valid ? null : target.errorMessage || _validate.messages.required();
                    break;
                case 3 /* minlength */:
                    var len = value.length;
                    var valid = len >= target.min;
                    msg = valid ? null : Utils.string_format(target.errorMessage || _validate.messages.minlength(), [target.min]);
                    break;
                case 4 /* rangelength */:
                    var len = value.length;
                    var valid = len >= target.min && len <= target.max;
                    msg = valid ? null : Utils.string_format(target.errorMessage || _validate.messages.rangelength(), [target.min, target.max]);
                    break;
                case 5 /* range */:
                    var val = validInt(value);
                    var valid = !isNaN(val) && val >= target.min && val <= target.max;
                    msg = valid ? null : Utils.string_format(target.errorMessage || _validate.messages.range(), [target.min, target.max]);
                    break;
                case 6 /* rangeMin */:
                    var val = validInt(value);
                    var valid = !isNaN(val) && val >= target.min;
                    msg = valid ? null : Utils.string_format(target.errorMessage || _validate.messages.min(), [target.min]);
                    break;
                case 7 /* rangeMax */:
                    var val = validInt(value);
                    var valid = !isNaN(val) && val <= target.max;
                    msg = valid ? null : Utils.string_format(target.errorMessage || _validate.messages.max(), [target.max]);
                    break;
                case 8 /* depended */:
                    var valid = ($.trim(target.on()) == value) && (value.length > 0);
                    msg = valid ? null : target.errorMessage || _validate.messages.equalTo();
                    break;
                default:
                    throw "notImplemented";
            }
            if (valid && target.customValidation) {
                msg = target.customValidation(value);
                valid = msg == null;
            }
            target.hasError(!valid);
            if (force || focusStatus == 2)
                target.message(msg);
        }
        validate();
        target.subscribe(validate);
        if (target.type == 8 /* depended */)
            target.on.subscribe(validate);
        var focusStatus = 0;
        target.hasfocus.subscribe(function (val) {
            if (val && focusStatus == 0)
                focusStatus = 1;
            else if (!val && focusStatus == 1)
                focusStatus = 2;
            if (focusStatus == 2)
                target.message(msg);
        });
        target.validate = function () {
            return validate(null, true);
        };
        target.resetFocusStatus = function () {
            return focusStatus = 0;
        };
        target.get = function () {
            var value = $.trim(target());
            switch (target.type) {
                case 2 /* email */:
                    return value.toLowerCase();
                case 5 /* range */:
                case 6 /* rangeMin */:
                case 7 /* rangeMax */:
                    return validInt(value);
                default:
                    return value;
            }
        };
        target.set = function (val) {
            target(val.toString());
        };
        return target;
    };

    

    

    ////JsRender vlastnosti
    //export interface InputBtnModel extends InputModel {
    //}
    function isValid(models) {
        return isPropsValid(_.map(models, function (m) {
            return m.prop;
        }));
        //var res = true;
        //_.each(models, (inp: validate.InputModel) => {
        //  if (!inp.prop) return;
        //  inp.prop.validate();
        //  res = res && (!inp.prop.hasError || !inp.prop.hasError());
        //});
        //return res;
    }
    _validate.isValid = isValid;

    function isPropsValid(props) {
        var res = true;
        _.each(props, function (prop) {
            prop.validate();
            res = res && (!prop.hasError || !prop.hasError());
        });

        //form OK: reset focusStatus
        if (res)
            _.each(props, function (prop) {
                if (prop.resetFocusStatus)
                    prop.resetFocusStatus();
            });
        return res;
    }
    _validate.isPropsValid = isPropsValid;

    (function (controlType) {
        controlType[controlType["text"] = 0] = "text";
        controlType[controlType["password"] = 1] = "password";
    })(_validate.controlType || (_validate.controlType = {}));
    var controlType = _validate.controlType;

    function create(type, finish) {
        if (typeof finish === "undefined") { finish = null; }
        var res = ko.observable();
        res.type = type;
        if (finish)
            finish(res);
        res.extend({ lm: null });
        return res;
    }
    _validate.create = create;

    function inputModel(name, title, prop, valType, type) {
        if (typeof type === "undefined") { type = 0 /* text */; }
        var res = { name: name, title: title, prop: prop, textType: null, btnTitle: null };
        if (prop == null)
            return res;
        switch (type) {
            case 0 /* text */:
                res.textType = "text";
                break;
            case 1 /* password */:
                res.textType = "password";
                break;
        }
        prop.type = valType;
        prop.extend({ lm: { x: true } });
        return res;
    }
    _validate.inputModel = inputModel;

    //export function inputBtnModel(name: string, title: string, btnTitle: string, prop: ValidObservable, valType: types, type: controlType = controlType.text): InputBtnModel {
    //  var res = <InputBtnModel> inputModel(name, title, prop, valType, type);
    //  res.btnTitle = btnTitle;
    //  return res;
    //}
    ko.bindingHandlers['visibility'] = {
        'update': function (element, valueAccessor) {
            var value = ko.utils.unwrapObservable(valueAccessor());
            var isCurrentlyVisible = element.style.visibility != "hidden";
            if (value && !isCurrentlyVisible)
                element.style.visibility = "";
            else if (!value && isCurrentlyVisible)
                element.style.visibility = "hidden";
        }
    };

    //nefunguje v MSIE 7
    //ko.bindingHandlers['placeholder'] = {
    //  'update': function (element: HTMLElement, valueAccessor) {
    //    var value = ko.utils.unwrapObservable(valueAccessor());
    //    $(element).attr("placeholder", value);
    //  }
    //};
    _validate.messages = {
        required: function () {
            return CSLocalize('8dd00c8210854c5eb8fb7bc017cfa21e', 'This field is required.');
        },
        email: function () {
            return CSLocalize('c913db0985a940c09d95ebfa7459a4be', 'Please enter a valid email address.');
        },
        equalTo: function () {
            return CSLocalize('9a47c9f99dce4e43859d7029e9ae6955', 'Please enter the same value again.');
        },
        remote: function () {
            return "Please fix this field.";
        },
        url: function () {
            return "Please enter a valid URL.";
        },
        date: function () {
            return "Please enter a valid date.";
        },
        dateISO: function () {
            return "Please enter a valid date (ISO).";
        },
        number: function () {
            return "Please enter a valid number.";
        },
        digits: function () {
            return "Please enter only digits.";
        },
        creditcard: function () {
            return "Please enter a valid credit card number.";
        },
        maxlength: function () {
            return "Please enter no more than {0} characters.";
        },
        minlength: function () {
            return CSLocalize('106ee5f0757b4829af9c71cc2c557093', 'Please enter at least 2 characters.');
        },
        rangelength: function () {
            return CSLocalize('915e1b2dbd2d44df89cdf4e9bbdee3df', 'Please enter a value between {0} and {1} characters long.');
        },
        range: function () {
            return "Please enter a value between {0} and {1}.";
        },
        max: function () {
            return "Please enter a value less than or equal to {0}.";
        },
        min: function () {
            return CSLocalize('f03951d4577b484ca04b639ad6d96514', 'Please enter a value greater than or equal to {0}.');
        }
    };
})(validate || (validate = {}));

var TreeView;
(function (TreeView) {
    

    function nodeToData(nd) {
        var res = {};
        for (var n in nd.data)
            res[n] = nd.data[n];
        res.Title = nd.title();
        res.isNew = nd.isNew;
        res.Items = _.map(nd.items(), function (it) {
            return nodeToData(it);
        });
        return res;
    }

    function path(self) {
        if (!self)
            return '... missing ...';
        var res = self.Title;
        while (self.parent != null) {
            self = self.parent;
            res = self.Title + ' / ' + res;
        }
        return res;
    }
    TreeView.path = path;

    function root(self) {
        while (self.parent)
            self = self.parent;
        return self;
    }
    TreeView.root = root;

    function adjustParents(self, parent) {
        if (!self)
            return;
        self.parent = parent;
        if (self.Items)
            _.each(self.Items, function (it) {
                return adjustParents(it, self);
            });
    }
    TreeView.adjustParents = adjustParents;

    function findNode(root, cond) {
        if (!root)
            return null;
        if (cond(root))
            return root;
        if (!root.Items)
            return null;
        for (var i = 0; i < root.Items.length; i++) {
            var res = findNode(root.Items[i], cond);
            if (res != null)
                return res;
        }
    }
    TreeView.findNode = findNode;

    var Model = (function () {
        function Model(data, isNew, isLocked, options) {
            this.options = options;
            this.refreshCutPaste = ko.observable(0);
            this.root = new Node(data, null, this, isNew, isLocked);
        }
        Model.prototype.getResult = function () {
            return nodeToData(this.root);
        };
        Model.prototype.getJSON = function () {
            return JSON.stringify(this.getResult());
        };

        Model.prototype.cutCopy = function (nd, isCut) {
            try  {
                if (this.cutCopied == nd && this.isCut == isCut) {
                    this.cutCopied = null;
                    nd.cutCopyFlag('');
                    return;
                }
                if (this.cutCopied != null)
                    this.cutCopied.cutCopyFlag('');
                if (nd)
                    nd.cutCopyFlag(isCut ? 'cut' : 'copy');
                this.cutCopied = nd;
                this.isCut = isCut;
            } finally {
                this.refreshCutPaste(this.refreshCutPaste() + 1); //zmena fake property -> prepocet CutPaste ikonek
            }
        };
        Model.prototype.paste = function (nd, isFirst) {
            var cutCopied = this.cutCopied;
            var isCut = this.isCut;
            cutCopied.cutCopyFlag('');
            if (isCut) {
                cutCopied.parent.items.remove(cutCopied);
                cutCopied.parent.adjustIcon();
            } else {
                var dt = nodeToData(cutCopied);
                cutCopied = new Node(dt, null, this, true, null);
            }
            if (isFirst) {
                nd.items.splice(0, 0, cutCopied);
                nd.adjustIcon();
                cutCopied.parent = nd;
            } else {
                nd.parent.items.splice(nd.parent.items.indexOf(nd) + 1, 0, cutCopied);
                nd.parent.adjustIcon();
                cutCopied.parent = nd.parent;
            }
            this.cutCopied = null;
            this.refreshCutPaste(this.refreshCutPaste() + 1); //zmena fake property -> prepocet CutPaste ikonek
        };

        Model.prototype.hover = function (nd, ishover) {
            if (ishover) {
                if (this.hovered == nd)
                    return;
                if (this.hovered)
                    this.hovered.hovered(false);
                this.hovered = nd;
                nd.hovered(true);
            } else {
                if (this.hovered == nd) {
                    this.hovered = null;
                    nd.hovered(false);
                }
            }
        };

        Model.prototype.edit = function (nd) {
            var self = this;
            if (this.edited == nd)
                return;
            if (this.edited) {
                var el = this.edited.editElement;
                el.text(this.edited.title());
            }
            if (nd) {
                var el = nd.editElement;
                var inputbox = "<input type='text' class='inputbox' value=\"" + nd.title() + "\">";
                el.html(inputbox);
                var input = el.find("input.inputbox");
                input.click(function () {
                    return false;
                }); //spolkni click
                input.focus(); //Immediately give the input box focus
                input.keydown(function (ev) {
                    if (ev.keyCode == 13) {
                        var value = input.val();
                        nd.title(value);
                        nd.title.valueHasMutated();
                        self.edited = null;
                    } else if (ev.keyCode == 27) {
                        el.html(nd.title());
                        self.edited = null;
                    }
                });
            }
            this.edited = nd;
        };
        return Model;
    })();
    TreeView.Model = Model;

    function hasIsLocked(nd) {
        return _.any(nd.items(), function (it) {
            return it.isLocked || hasIsLocked(it);
        });
    }

    var Node = (function () {
        function Node(data, parent, model, isNew, isLocked) {
            this.data = data;
            this.parent = parent;
            this.model = model;
            this.isNew = isNew;
            this.checked = ko.observable(false);
            this.hovered = ko.observable(false);
            this.expanded = ko.observable(true);
            this.selected = ko.observable(false);
            this.icon = ko.observable('');
            //*********** Checbox management
            this.explicitOnChecked = false;
            //*********** CopyPaste
            this.cutCopyFlag = ko.observable(null);
            //naplneni dat
            var self = this;
            this.isLocked = (isLocked ? isLocked(data) : false);
            self.title = ko.observable(data.Title);
            self.items = data.Items ? ko.observableArray(_.map(data.Items, function (it) {
                return new Node(it, self, model, isNew, isLocked);
            })) : ko.observableArray();

            //inicializace fieldu
            self.adjustIcon();

            //Checked
            self.checked.subscribe(self.onChecked, self);

            //Expand
            self.expanded.subscribe(function (isExp) {
                self.adjustIcon();
            });

            //Display Tools
            self.displayDelete = this.testDisplay(function () {
                return !self.isLocked && !!self.parent && !hasIsLocked(self);
            });
            self.displayEdit = ko.computed(function () {
                return true;
            });
            self.displayAddNext = this.testDisplay(function () {
                return !!self.parent;
            });
            self.displayAddFirst = ko.computed(function () {
                return true;
            });
            self.displayCut = this.testDisplay(function () {
                return !!self.parent;
            });
            self.displayCopy = ko.computed(function () {
                return true;
            });
            self.displayPasteFirst = this.testDisplay(function () {
                var cutCopied = self.model.cutCopied;
                var isCut = self.model.isCut;
                if (cutCopied == null)
                    return false;
                if (!isCut)
                    return true;
                var ptr = self;
                while (ptr != null) {
                    if (ptr == cutCopied)
                        return false;
                    ptr = ptr.parent;
                }
                return true;
            });
            self.displayPasteNext = this.testDisplay(function () {
                return !!self.parent && self.displayPasteFirst();
            });

            //prida metody jmene itsMeHover a itsMeEdit k modelu. Ty pak zajisti volani registerElement('Hover', el), coz je sance zaregistrovat nebo pouzit element.
            ko_bindingHandlers_itsMe_register(self, ['Hover', 'Edit']);
        }
        //*********** basic opers
        Node.prototype.hover = function (ishover) {
            this.model.hover(this, ishover);
        };
        Node.prototype.expandCollapse = function () {
            this.expanded(!this.expanded());
        };
        Node.prototype.testDisplay = function (cond) {
            var _this = this;
            return ko.computed(function () {
                if (!_this.model.options.editable)
                    return false;
                if (_this.model.refreshCutPaste() < 0)
                    return false;
                return cond();
            });
        };

        //inicializace dulezituch HTML tagu
        Node.prototype.registerElement = function (itsMeName, el) {
            var _this = this;
            switch (itsMeName) {
                case "Hover":
                    $(el).hover(function () {
                        return _this.hover(true);
                    }, function () {
                        return _this.hover(false);
                    });
                    break;
                case "Edit":
                    this.editElement = $(el);
                    break;
            }
        };

        //*********** Helper
        Node.prototype.hasChild = function () {
            return this.items().length > 0;
        };
        Node.prototype.adjustIcon = function () {
            this.icon(this.hasChild() ? (this.expanded() ? 'folder-open' : 'folder') : 'book');
        };
        Node.prototype.displayTools = function () {
            return this.model.options.editable && this.hovered() && this.model.edited != this;
        };

        Node.prototype.doEdit = function () {
            this.model.edit(this);
        };

        Node.prototype.doDelete = function () {
            this.parent.items.remove(this);
            this.parent.adjustIcon();
        };

        Node.prototype.doAddNext = function () {
            var nd = new Node({ Items: null, Title: 'New Item', isNew: undefined }, this.parent, this.model, true, null);
            this.parent.items.splice(this.parent.items.indexOf(this) + 1, 0, nd);
            this.parent.adjustIcon();
            nd.doEdit();
        };

        Node.prototype.doAddFirst = function () {
            var nd = new Node({ Items: null, Title: 'New Item', isNew: undefined }, this, this.model, true, null);
            this.items.splice(0, 0, nd);
            this.adjustIcon();
            nd.doEdit();
        };

        Node.prototype.onChecked = function (checked) {
            if (this.explicitOnChecked)
                return;

            //if (!!this.items) _.forEach(this.itemsLow(), i => i.checked(checked));
            //if (!!this.items) _.forEach(this.items(), i => i.checked(checked));
            _.forEach(this.items(), function (i) {
                return i.checked(checked);
            });
            if (this.parent)
                this.parent.onChildChecked();
        };
        Node.prototype.onChildChecked = function () {
            this.explicitOnChecked = true;
            this.checked(this.allChildrenChecked());
            this.explicitOnChecked = false;
            if (this.parent)
                this.parent.onChildChecked();
        };

        //allChildrenChecked(): boolean { return _.all(this.itemsLow(), i => i.checked()); }
        Node.prototype.allChildrenChecked = function () {
            return _.all(this.items(), function (i) {
                return i.checked();
            });
        };

        Node.prototype.doCut = function () {
            this.model.cutCopy(this, true);
        };

        Node.prototype.doCopy = function () {
            this.model.cutCopy(this, false);
        };

        Node.prototype.doPasteFirst = function () {
            this.model.paste(this, true);
        };

        Node.prototype.doPasteNext = function () {
            this.model.paste(this, false);
        };
        return Node;
    })();
    TreeView.Node = Node;
})(TreeView || (TreeView = {}));

/// <reference path="../jslib/js/GenLMComLib.ts" />
var Login;
(function (Login) {
    (function (CmdLmLoginError) {
        CmdLmLoginError[CmdLmLoginError["no"] = 0] = "no";
        CmdLmLoginError[CmdLmLoginError["userExist"] = 1] = "userExist";
        CmdLmLoginError[CmdLmLoginError["cannotFindUser"] = 2] = "cannotFindUser";
        CmdLmLoginError[CmdLmLoginError["passwordNotExists"] = 3] = "passwordNotExists";
    })(Login.CmdLmLoginError || (Login.CmdLmLoginError = {}));
    var CmdLmLoginError = Login.CmdLmLoginError;

    (function (CompRole) {
        CompRole[CompRole["Keys"] = 1] = "Keys";
        CompRole[CompRole["Products"] = 2] = "Products";
        CompRole[CompRole["Department"] = 4] = "Department";
        CompRole[CompRole["Results"] = 8] = "Results";
        CompRole[CompRole["Admin"] = 32768] = "Admin";
        CompRole[CompRole["All"] = 65535] = "All";
    })(Login.CompRole || (Login.CompRole = {}));
    var CompRole = Login.CompRole;

    (function (Role) {
        Role[Role["Admin"] = 1] = "Admin";
        Role[Role["Comps"] = 2] = "Comps";
        Role[Role["All"] = 255] = "All";
    })(Login.Role || (Login.Role = {}));
    var Role = Login.Role;

    (function (EnterLicenceResult) {
        EnterLicenceResult[EnterLicenceResult["ok"] = 0] = "ok";
        EnterLicenceResult[EnterLicenceResult["added"] = 1] = "added";
        EnterLicenceResult[EnterLicenceResult["used"] = 2] = "used";
        EnterLicenceResult[EnterLicenceResult["wrongId"] = 3] = "wrongId";
        EnterLicenceResult[EnterLicenceResult["wrongCounter"] = 4] = "wrongCounter";
    })(Login.EnterLicenceResult || (Login.EnterLicenceResult = {}));
    var EnterLicenceResult = Login.EnterLicenceResult;

    Login.CmdAdjustUser_Type = 'Login.CmdAdjustUser';
    function CmdAdjustUser_Create(provider, providerId, email, firstName, lastName) {
        return { provider: provider, providerId: providerId, email: email, firstName: firstName, lastName: lastName };
    }
    Login.CmdAdjustUser_Create = CmdAdjustUser_Create;

    Login.CmdAdjustScormUser_Type = 'Login.CmdAdjustScormUser';
    function CmdAdjustScormUser_Create(companyHost, login, firstName, lastName, isNotAttempted, productId) {
        return { companyHost: companyHost, login: login, firstName: firstName, lastName: lastName, isNotAttempted: isNotAttempted, productId: productId };
    }
    Login.CmdAdjustScormUser_Create = CmdAdjustScormUser_Create;

    Login.CmdConfirmRegistration_Type = 'Login.CmdConfirmRegistration';
    function CmdConfirmRegistration_Create(lmcomId) {
        return { lmcomId: lmcomId };
    }
    Login.CmdConfirmRegistration_Create = CmdConfirmRegistration_Create;

    Login.CmdChangePassword_Type = 'Login.CmdChangePassword';
    function CmdChangePassword_Create(oldPassword, newPassword, lmcomId) {
        return { oldPassword: oldPassword, newPassword: newPassword, lmcomId: lmcomId };
    }
    Login.CmdChangePassword_Create = CmdChangePassword_Create;

    Login.CmdLmLogin_Type = 'Login.CmdLmLogin';
    function CmdLmLogin_Create(login, email, password) {
        return { login: login, email: email, password: password };
    }
    Login.CmdLmLogin_Create = CmdLmLogin_Create;

    Login.CmdMyInit_Type = 'Login.CmdMyInit';
    function CmdMyInit_Create(userId) {
        return { userId: userId };
    }
    Login.CmdMyInit_Create = CmdMyInit_Create;

    Login.CmdSaveDepartment_Type = 'Login.CmdSaveDepartment';
    function CmdSaveDepartment_Create(userId, companyId, departmentId) {
        return { userId: userId, companyId: companyId, departmentId: departmentId };
    }
    Login.CmdSaveDepartment_Create = CmdSaveDepartment_Create;

    Login.CmdProfile_Type = 'Login.CmdProfile';
    function CmdProfile_Create(Cookie, lmcomId) {
        return { Cookie: Cookie, lmcomId: lmcomId };
    }
    Login.CmdProfile_Create = CmdProfile_Create;

    Login.CmdRegister_Type = 'Login.CmdRegister';
    function CmdRegister_Create(password, subSite, Cookie, lmcomId) {
        return { password: password, subSite: subSite, Cookie: Cookie, lmcomId: lmcomId };
    }
    Login.CmdRegister_Create = CmdRegister_Create;

    Login.CmdEnterLicKey_Type = 'Login.CmdEnterLicKey';
    function CmdEnterLicKey_Create(lmcomUserId, CompLicId, Counter) {
        return { lmcomUserId: lmcomUserId, CompLicId: CompLicId, Counter: Counter };
    }
    Login.CmdEnterLicKey_Create = CmdEnterLicKey_Create;
})(Login || (Login = {}));

var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var scorm;
(function (scorm) {
    var runtimeApi = (function () {
        function runtimeApi(api) {
            this.api = api;
        }
        runtimeApi.prototype.LMSInitialize = function (st) {
            Logger.trace_scorm("==> LMSInitialize");
            return this.api ? this.api.LMSInitialize(st) : "true";
        };
        runtimeApi.prototype.LMSGetValue = function (name) {
            Logger.trace_scorm("LMSGetValue " + name);
            return this.api ? this.api.LMSGetValue(name) : "";
        };
        runtimeApi.prototype.LMSSetValue = function (name, value) {
            Logger.trace_scorm("LMSSetValue " + name);
            if (this.api)
                this.api.LMSSetValue(name, value);
        };
        runtimeApi.prototype.LMSCommit = function (newStatus) {
            Logger.trace_scorm("LMSCommit");
            return this.api ? this.api.LMSCommit(newStatus) : "true";
        };
        runtimeApi.prototype.LMSGetDiagnostic = function (code) {
            Logger.trace_scorm("LMSGetDiagnostic");
            if (this.api)
                this.api.LMSGetDiagnostic(code);
        };
        runtimeApi.prototype.LMSGetErrorString = function (code) {
            Logger.trace_scorm("LMSGetErrorString");
            return this.api ? this.api.LMSGetErrorString(code) : "true";
        };
        runtimeApi.prototype.LMSGetLastError = function () {
            Logger.trace_scorm("LMSGetLastError");
            return this.api ? this.api.LMSGetLastError() : 0;
        };
        runtimeApi.prototype.LMSFinish = function (par) {
            if (this.api)
                Logger.trace_scorm("==> LMSFinish");
            this.api.LMSFinish(par);
        };
        return runtimeApi;
    })();
    scorm.runtimeApi = runtimeApi;

    var lmsDriver = (function () {
        function lmsDriver() {
        }
        lmsDriver.prototype.getPreviewMode = function () {
            return scorm.status == cStatusPassed || this.isPreviewWhenFailed() || scorm.status == cStatusCompleted || scorm.status == cStatusBrowsed || mode == cModeBrowse || mode == cModeReview;
        };
        lmsDriver.prototype.adjustFirstEnter = function () {
            var doCommit = false;
            if (scorm.status == cStatusNotAttempted || scorm.status == '') {
                doCommit = true;
                scorm.status = cStatusIncomplete;
                scorm.API.LMSSetValue(cStatus, scorm.status);
            }

            //v suspend data je ulozena identifikace Attempt Id (vyuziva se v persistScormEx.attemptId k identifikaci DB zaznamu)
            //Novy course Attempt pak tedy vyuziva nova data.
            var isNotAttempted = false;
            if (_.isEmpty(scorm.attemptId)) {
                scorm.attemptId = this.createAttemptIdQueryPar();
                isNotAttempted = true;
                doCommit = true;
                scorm.API.LMSSetValue(cSuspendData, scorm.attemptId);
            }
            if (doCommit)
                scorm.API.LMSCommit('');
            return isNotAttempted;
        };

        //virtuals
        lmsDriver.prototype.isPreviewWhenFailed = function () {
            return scorm.status == cStatusFailed;
        };
        lmsDriver.prototype.createAttemptIdQueryPar = function () {
            return 'attemptidstr=' + cfg.rootProductId + '|' + new Date().getTime().toString();
        };
        return lmsDriver;
    })();

    var edoceoDriver = (function (_super) {
        __extends(edoceoDriver, _super);
        function edoceoDriver() {
            _super.apply(this, arguments);
        }
        //virtuals
        edoceoDriver.prototype.isPreviewWhenFailed = function () {
            return false;
        };
        edoceoDriver.prototype.createAttemptIdQueryPar = function () {
            return 'attemptid=' + Utils.Hash(cfg.rootProductId);
        };
        return edoceoDriver;
    })(lmsDriver);

    //http://scorm.com/scorm-explained/scorm-resources/
    //http://php.langmaster.org/mod/scorm/view.php?id=4, pzika / pzika
    scorm.inPopup;
    scorm.apiWin = window;
    scorm.apiUrl;
    scorm.apiSignature;
    scorm.isMoodle;
    scorm.status;
    scorm.attemptId;
    scorm.API = new runtimeApi(null);

    //var sessionStart: Date;
    var mode;
    var finished = true;

    var driver;
    switch (cfg.scorm_driver) {
        case 2 /* edoceo */:
            driver = new edoceoDriver();
            break;
        case 0 /* no */:
            driver = new lmsDriver();
            break;
    }

    //export function initDummy() {
    //  //API = new dummyApi();
    //  apiWin = window;
    //}
    $(window).on('unload', function () {
        if (!scorm.API || finished)
            return;
        scorm.API.LMSCommit('');
        finish();
    });

    function init(completed) {
        if (!finished)
            return;
        finished = false;
        if (!scorm.API.api)
            findApi();

        Logger.trace_scorm("API OK: moodle=" + (scorm.isMoodle ? "true" : "false") + ", isPopup=" + (scorm.inPopup ? "true" : "false") + ", url=" + scorm.apiUrl);
        if (isError(scorm.API.LMSInitialize(''))) {
            scorm.API.LMSFinish('');
            if (!checkError(scorm.API.LMSInitialize('')))
                return false;
        }
        scorm.status = scorm.API.LMSGetValue(cStatus);
        var stName = scorm.API.LMSGetValue(cStudentName);
        var stId = scorm.API.LMSGetValue(cStudentId);
        var compHost = scorm.apiWin.location.host;
        mode = scorm.API.LMSGetValue(cMode);
        if (_.isEmpty(mode))
            mode = scorm.API.LMSGetValue(cLessMode);
        scorm.attemptId = scorm.API.LMSGetValue(cSuspendData);
        Logger.trace_scorm("Status=" + scorm.status + ", compHost=" + compHost + ", id=" + stId + ", firstName=" + stFirstName + ", lastName=" + stLastName + ", mode=" + mode + ', suspendData=' + scorm.attemptId);

        CourseMeta.previewMode = driver.getPreviewMode();
        if (CourseMeta.previewMode) {
            completed(compHost, stId, stFirstName, stLastName, false);
            return;
        }

        var isFirstEnter = driver.adjustFirstEnter();

        var parts = stName ? stName.split(",") : [""];
        var stLastName = parts[0];
        var stFirstName = parts.length > 1 ? parts[1] : "";

        if (completed)
            completed(compHost, stId, stFirstName, stLastName, isFirstEnter);
    }
    scorm.init = init;

    function reportProgress(timeSec, complScore) {
        if (finished || scorm.API == null || driver.getPreviewMode())
            return;

        //cmi.core.session_time pridava cas k cmi.core.total_time, => TotalTime = TotalTime + (LMTotalTime - TotalTime)
        var total = scorm.API.LMSGetValue(cTotalTime);
        if (!total)
            total = "00:00:00";
        var parts = total.split(":");
        if (parts.length != 3)
            parts = ["0", "0", "0"];
        var elapsedSec = parseInt(parts[0]) * 3600 + parseInt(parts[1]) * 60 + parseInt(parts[2]);

        if (elapsedSec < timeSec) {
            var time = secToScormTime(timeSec - elapsedSec);
            scorm.API.LMSSetValue(cSessionTime, time);
        }

        if (complScore != null) {
            //LMS neumi samo nastavovat passed x failed:
            var mastery = scorm.API.LMSGetValue(cMasteryScore);
            var sc = _.isEmpty(mastery) ? 75 : parseInt(mastery);
            scorm.status = complScore >= sc ? cStatusPassed : cStatusFailed;

            //LMS umi nastavovat passed x failed:
            //status = cStatusCompleted;
            CourseMeta.previewMode = driver.getPreviewMode();
            scorm.API.LMSSetValue(cStatus, scorm.status);
            scorm.API.LMSSetValue(cScoreRaw, complScore.toString());
            Logger.trace_scorm("progress: completed, score=" + complScore.toString());
        }
        Logger.trace_scorm("progress: elapsed=" + time);
        checkError(scorm.API.LMSCommit(''));

        if (CourseMeta.previewMode)
            finish();
        //if (cfg.scorm_AlowFinish) {
        //  checkError(API.LMSFinish(""));
        //  checkError(API.LMSInitialize(''));
        //}
    }
    scorm.reportProgress = reportProgress;

    function finish() {
        if (finished || scorm.API == null)
            return;
        checkError(scorm.API.LMSFinish(""));
        finished = true;
    }
    scorm.finish = finish;

    

    //export class dummyApi implements API {
    //  LMSInitialize(st: string): string { return "true"; }
    //  LMSGetValue(name: string): string { return ""; }
    //  LMSSetValue(name: string, value: string): void { }
    //  LMSCommit(newStatus: string): string { return "true"; }
    //  LMSGetDiagnostic(code) { }
    //  LMSGetErrorString(code): string { return "true"; }
    //  LMSGetLastError(): number { return 0; }
    //  LMSFinish(par) { }
    //}
    var SCORM_TRUE = "true";
    var SCORM_FALSE = "false";

    //http://www.scormcourse.com/scorm12_course/resources/coreLesson_Status.html
    //http://www.vsscorm.net/2009/07/24/step-22-progress-and-completion-cmi-core-lesson_status/
    //http://scorm.com/scorm-explained/technical-scorm/run-time/
    var cStatus = 'cmi.core.lesson_status';
    var cStatusNotAttempted = "not attempted";
    var cStatusIncomplete = "incomplete";
    var cStatusPassed = "passed";
    var cStatusFailed = "failed";
    var cStatusCompleted = "completed";
    var cStatusBrowsed = "browsed";

    var cSuspendData = 'cmi.suspend_data';

    var cLessMode = 'cmi.core.lesson_mode';
    var cMode = 'cmi.mode';
    var cModeBrowse = 'browse';
    var cModeReview = 'review';

    //http://www.scormcourse.com/scorm12_course/resources/coreStudent_Name.html
    var cStudentName = "cmi.core.student_name";

    //http://www.scormcourse.com/scorm12_course/resources/coreStudent_id.html
    var cStudentId = "cmi.core.student_id";

    //http://www.scormcourse.com/scorm12_course/resources/coreSession_Time.html
    var cSessionTime = "cmi.core.session_time";
    var cTotalTime = "cmi.core.total_time";

    //http://www.scormcourse.com/scorm12_course/resources/coreExit.html
    var cExit = "cmi.core.exit";

    //http://www.scormcourse.com/scorm_2004_beginner/Run%20Time/Optional%20Items%20Reference/CMI_STUDENT_DATA.htm
    var cMasteryScore = "cmi.student_data.mastery_score";

    //http://www.scormcourse.com/scorm12_course/resources/coreScoreRaw.html
    var cScoreRaw = "cmi.core.score.raw";

    function isError(res) {
        return !res || (res.toString() != SCORM_FALSE) ? false : true;
    }
    function checkError(res) {
        if (!isError(res))
            return true;
        var errorNumber = scorm.API.LMSGetLastError();
        var errorString = scorm.API.LMSGetErrorString(errorNumber);
        var diagnostic = scorm.API.LMSGetDiagnostic(errorNumber);
        var errorDescription = "Number: " + errorNumber + "\nDescription: " + errorString + "\nDiagnostic: " + diagnostic;
        Logger.trace_scorm("**** ERROR:  - Could not initialize communication with the LMS.\n\nYour results may not be recorded.\n\n" + errorDescription);
        return false;
    }

    function findApi() {
        findAPILow(window);
        if (scorm.API.api != null)
            return;
        var opener = findOpener(window);
        if ((opener == null) || (typeof (opener) == "undefined"))
            return;
        findAPILow(opener);
        scorm.inPopup = scorm.API.api != null;
    }
    ;

    function findAPILow(win) {
        var findAPITries = 0;
        while ((win.API == null || typeof (win.API) == 'undefined') && (win.parent != null) && (win.parent != win)) {
            findAPITries++;
            if (findAPITries > 7)
                return;
            win = win.parent;
        }
        if (typeof (win.API) == 'undefined')
            return;
        scorm.apiWin = win;
        scorm.apiUrl = scorm.apiWin.location.href.toLowerCase();
        scorm.apiSignature = (scorm.apiWin.location.hostname + scorm.apiWin.location.pathname).toLowerCase();
        scorm.isMoodle = scorm.apiUrl.indexOf(moodlePath) >= 0;
        scorm.API = new runtimeApi(win.API);
    }

    function findOpener(win) {
        var findAPITries = 0;
        while ((win.opener == null) && (win.parent != null) && (win.parent != win)) {
            findAPITries++;
            if (findAPITries > 7)
                return null;
            win = win.parent;
        }
        return win.opener;
    }

    var moodlePath = '/mod/scorm/player.php';

    function updateSessionTime(startDate, endDate, elapsed) {
        var sessSec = (endDate.getTime() - startDate.getTime()) / 1000;
        var parts = elapsed.split(':');
        var elapsedSec = parseInt(parts[0]) * 3600 + parseInt(parts[1]) * 60 + parseInt(parts[2]);
        var newSec = elapsedSec + sessSec;
        return secToScormTime(newSec);
    }

    function secToScormTime(ts) {
        var sec = (ts % 60);

        ts -= sec;
        var tmp = (ts % 3600);
        ts -= tmp; //# of seconds in the total # of hours

        // convert seconds to conform to CMITimespan type (e.g. SS.00)
        sec = Math.round(sec * 100) / 100;

        var strSec = new String(sec);
        var strWholeSec = strSec;
        var strFractionSec = "";

        if (strSec.indexOf(".") != -1) {
            strWholeSec = strSec.substring(0, strSec.indexOf("."));
            strFractionSec = strSec.substring(strSec.indexOf(".") + 1, strSec.length);
        }

        if (strWholeSec.length < 2) {
            strWholeSec = "0" + strWholeSec;
        }
        strSec = strWholeSec;

        if (strFractionSec.length) {
            strSec = strSec + "." + strFractionSec;
        }

        var hour, min;
        if ((ts % 3600) != 0)
            hour = 0;
        else
            hour = (ts / 3600);
        if ((tmp % 60) != 0)
            min = 0;
        else
            min = (tmp / 60);

        var h = hour.toString();
        if (h.length < 2)
            h = "0" + h;
        var m = min.toString();
        if (m.length < 2)
            m = "0" + m;

        var rtnVal = h + ":" + m + ":" + strSec;

        return rtnVal;
    }
})(scorm || (scorm = {}));

//xx/#DEBUG
var Logger;
(function (Logger) {
    function trace_scorm(msg) {
        Logger.trace("scorm", msg);
    }
    Logger.trace_scorm = trace_scorm;
})(Logger || (Logger = {}));
//xx/#ENDDEBUG
//var noopScorm = null;

/*! waitForImages jQuery Plugin - v1.4.2 - 2013-01-19
* https://github.com/alexanderdickson/waitForImages
* Copyright (c) 2013 Alex Dickson; Licensed MIT */

(function ($) {
  // Namespace all events.
  var eventNamespace = 'waitForImages';

  // CSS properties which contain references to images.
  $.waitForImages = {
    hasImageProperties: ['backgroundImage', 'listStyleImage', 'borderImage', 'borderCornerImage']
  };

  // Custom selector to find `img` elements that have a valid `src` attribute and have not already loaded.
  $.expr[':'].uncached = function (obj) {
    // Ensure we are dealing with an `img` element with a valid `src` attribute.
    if (!$(obj).is('img[src!=""]')) {
      return false;
    }

    // Firefox's `complete` property will always be `true` even if the image has not been downloaded.
    // Doing it this way works in Firefox.
    var img = new Image();
    img.src = obj.src;
    return !img.complete;
  };

  $.fn.waitForImages = function (finishedCallback, eachCallback, waitForAll) {

    var allImgsLength = 0;
    var allImgsLoaded = 0;

    // Handle options object.
    if ($.isPlainObject(arguments[0])) {
      waitForAll = arguments[0].waitForAll;
      eachCallback = arguments[0].each;
      // This must be last as arguments[0]
      // is aliased with finishedCallback.
      finishedCallback = arguments[0].finished;
    }

    // Handle missing callbacks.
    finishedCallback = finishedCallback || $.noop;
    eachCallback = eachCallback || $.noop;

    // Convert waitForAll to Boolean
    waitForAll = !!waitForAll;

    // Ensure callbacks are functions.
    if (!$.isFunction(finishedCallback) || !$.isFunction(eachCallback)) {
      throw new TypeError('An invalid callback was supplied.');
    }

    return this.each(function () {
      // Build a list of all imgs, dependent on what images will be considered.
      var obj = $(this);
      var allImgs = [];
      // CSS properties which may contain an image.
      var hasImgProperties = $.waitForImages.hasImageProperties || [];
      // To match `url()` references.
      // Spec: http://www.w3.org/TR/CSS2/syndata.html#value-def-uri
      var matchUrl = /url\(\s*(['"]?)(.*?)\1\s*\)/g;

      if (waitForAll) {

        // Get all elements (including the original), as any one of them could have a background image.
        obj.find('*').andSelf().each(function () {
          var element = $(this);

          // If an `img` element, add it. But keep iterating in case it has a background image too.
          if (element.is('img:uncached')) {
            allImgs.push({
              src: element.attr('src'),
              element: element[0]
            });
          }

          $.each(hasImgProperties, function (i, property) {
            var propertyValue = element.css(property);
            var match;

            // If it doesn't contain this property, skip.
            if (!propertyValue) {
              return true;
            }

            // Get all url() of this element.
            while (match = matchUrl.exec(propertyValue)) {
              allImgs.push({
                src: match[2],
                element: element[0]
              });
            }
          });
        });
      } else {
        // For images only, the task is simpler.
        obj.find('img:uncached')
            .each(function () {
              allImgs.push({
                src: this.src,
                element: this
              });
            });
      }

      allImgsLength = allImgs.length;
      allImgsLoaded = 0;

      // If no images found, don't bother.
      if (allImgsLength === 0) {
        finishedCallback.call(obj[0]);
      }

      $.each(allImgs, function (i, img) {

        var image = new Image();

        // Handle the image loading and error with the same callback.
        $(image).bind('load.' + eventNamespace + ' error.' + eventNamespace, function (event) {
          allImgsLoaded++;

          // If an error occurred with loading the image, set the third argument accordingly.
          eachCallback.call(img.element, allImgsLoaded, allImgsLength, event.type == 'load');

          if (allImgsLoaded == allImgsLength) {
            finishedCallback.call(obj[0]);
            return false;
          }

        });

        image.src = img.src;
      });
    });
  };
}(jQuery));



var schools;
(function (schools) {
    (function (persistTypes) {
        persistTypes[persistTypes["no"] = 0] = "no";
        persistTypes[persistTypes["persistNewEA"] = 1] = "persistNewEA";
        persistTypes[persistTypes["persistScormEx"] = 2] = "persistScormEx";
        persistTypes[persistTypes["persistScormLocal"] = 3] = "persistScormLocal";
        persistTypes[persistTypes["persistMemory"] = 4] = "persistMemory";
    })(schools.persistTypes || (schools.persistTypes = {}));
    var persistTypes = schools.persistTypes;

    (function (ExFormat) {
        ExFormat[ExFormat["ea"] = 0] = "ea";
        ExFormat[ExFormat["rew"] = 1] = "rew";
    })(schools.ExFormat || (schools.ExFormat = {}));
    var ExFormat = schools.ExFormat;

    (function (seeAlsoType) {
        seeAlsoType[seeAlsoType["grammar"] = 0] = "grammar";
        seeAlsoType[seeAlsoType["ex"] = 1] = "ex";
    })(schools.seeAlsoType || (schools.seeAlsoType = {}));
    var seeAlsoType = schools.seeAlsoType;

    (function (licenceResult) {
        licenceResult[licenceResult["ok"] = 0] = "ok";
        licenceResult[licenceResult["wrongDomain"] = 1] = "wrongDomain";
        licenceResult[licenceResult["demoExpired"] = 2] = "demoExpired";
        licenceResult[licenceResult["userMonthExpired"] = 3] = "userMonthExpired";
        licenceResult[licenceResult["JSCramblerError"] = 4] = "JSCramblerError";
    })(schools.licenceResult || (schools.licenceResult = {}));
    var licenceResult = schools.licenceResult;

    (function (versions) {
        versions[versions["no"] = 0] = "no";
        versions[versions["debug"] = 1] = "debug";
        versions[versions["not_minified"] = 2] = "not_minified";
        versions[versions["minified"] = 3] = "minified";
    })(schools.versions || (schools.versions = {}));
    var versions = schools.versions;

    (function (DictEntryType) {
        DictEntryType[DictEntryType["lingeaOld"] = 0] = "lingeaOld";
        DictEntryType[DictEntryType["rj"] = 1] = "rj";
        DictEntryType[DictEntryType["Wiktionary"] = 2] = "Wiktionary";
    })(schools.DictEntryType || (schools.DictEntryType = {}));
    var DictEntryType = schools.DictEntryType;

    (function (scormDriver) {
        scormDriver[scormDriver["no"] = 0] = "no";
        scormDriver[scormDriver["moodle"] = 1] = "moodle";
        scormDriver[scormDriver["edoceo"] = 2] = "edoceo";
    })(schools.scormDriver || (schools.scormDriver = {}));
    var scormDriver = schools.scormDriver;
})(schools || (schools = {}));

/// <reference path="../jslib/js/GenLMComLib.ts" />
/// <reference path="GenCourse.ts" />
/// <reference path="GenSchools.ts" />
/// <reference path="../courses/GenCourseModel.ts" />
var schools;
(function (schools) {
    

    

    //****************** informace o kurzech a testech
    (function (PretestMode) {
        PretestMode[PretestMode["first"] = 0] = "first";
        PretestMode[PretestMode["testHome"] = 1] = "testHome";
        PretestMode[PretestMode["testForm"] = 2] = "testForm";
        PretestMode[PretestMode["testTest"] = 3] = "testTest";
        PretestMode[PretestMode["testTestFinished"] = 4] = "testTestFinished";
        PretestMode[PretestMode["tested"] = 5] = "tested";
    })(schools.PretestMode || (schools.PretestMode = {}));
    var PretestMode = schools.PretestMode;
    ;

    
    ;
})(schools || (schools = {}));

var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var SndLow;
(function (SndLow) {
    function guiBlocker(isStart) {
        if (isStart) {
            if (guiBlockerTimer) {
                debugger;
                throw 'guiBlockerTimer';
            }
            guiBlockerTimer = setTimeout(function () {
                guiBlockerTimer = 0;
                guiBlockerLow(true);
            }, 300);
        } else {
            if (guiBlockerTimer) {
                clearTimeout(guiBlockerTimer);
                guiBlockerTimer = 0;
            }
            guiBlockerLow(false);
        }
    }
    SndLow.guiBlocker = guiBlocker;
    ;
    var guiBlockerTimer;
    function guiBlockerLow(isStart) {
        var bg = $('.block-gui');
        if (isStart)
            bg.removeClass('hide');
        else
            bg.addClass('hide');
    }
    ;

    //http://www.htmlgoodies.com/html5/client/how-to-embed-video-using-html5.html#fbid=XRsS9osNoHa
    function createDriver(isVideo, id, parentId, htmltagClass, forceDriver, completed) {
        if (allDrivers[id]) {
            completed(allDrivers[id]);
            return;
        }
        var $parent = _.isEmpty(parentId) ? null : $(parentId);
        var parent = $parent && $parent.length == 1 ? $parent[0] : null;
        var driverType = forceDriver ? forceDriver : selectDriver();
        switch (driverType) {
            case 2 /* HTML5 */:
                var driver = new MediaDriver_Html5(isVideo, id, parent, htmltagClass);
                allDrivers[id] = driver;
                completed(driver);
                break;
            case 1 /* SL */:
                new MediaDriver_SL(isVideo, id, parent, htmltagClass, function (driver) {
                    allDrivers[id] = driver;
                    completed(driver);
                });
                break;
        }
    }
    SndLow.createDriver = createDriver;
    var allDrivers = {};
    var playerType;
    SndLow.recordingType;
    var slInstalled;

    function htmlClearing(id) {
        guiBlocker(false);
        var dr = allDrivers[id];
        if (!dr)
            return;
        dr.htmlClearing();
        delete allDrivers[id];
    }
    SndLow.htmlClearing = htmlClearing;

    function Stop(actDriver) {
        if (typeof actDriver === "undefined") { actDriver = null; }
        Logger.trace_lmsnd('soundnew.ts: SndLow.stop');
        for (var id in allDrivers)
            if (allDrivers[id].handler && allDrivers[id] != actDriver) {
                allDrivers[id].stop();
                if (allDrivers[id].recHandler)
                    allDrivers[id].recHandler.recordEnd();
            }
    }
    SndLow.Stop = Stop;

    function selectDriver() {
        //return LMComLib.SoundPlayerType.HTML5; //DEBUG
        return playerType ? playerType : playerType = selectDriverLow();
    }
    SndLow.selectDriver = selectDriver;

    function selectDriverLow() {
        try  {
            Logger.trace_lmsnd('soundnew.ts: Player.selectDriver start');
            try  {
                if (html5_CanPlay(2 /* audio_mp3 */) && (html5_CanPlay(0 /* video_mp4 */) || html5_CanPlay(1 /* video_webm */))) {
                    if (!html5Recorder.audioCaptureDisabled()) {
                        SndLow.recordingType = 2 /* HTML5 */;
                        return 2 /* HTML5 */;
                    } else if (isSLInstalled()) {
                        SndLow.recordingType = 1 /* SL */;
                        return 1 /* SL */;
                    } else
                        return 2 /* HTML5 */;
                } else
                    return 1 /* SL */;
            } finally {
                if (!SndLow.recordingType && isSLInstalled())
                    SndLow.recordingType = 1 /* SL */;
            }
            Logger.trace_lmsnd('soundnew.ts: Player.selectDriver end');
        } catch (msg) {
            Logger.error_snd('Player.selectDriver', msg);
            debugger;
            throw msg;
        }
    }
    ;

    function isSLInstalled() {
        if (slInstalled === true)
            return true;
        else if (slInstalled === false)
            return false;
        else
            return slInstalled = Silverlight.isInstalled(slVersion);
    }
    SndLow.isSLInstalled = isSLInstalled;

    //http://modernizr.com
    (function (media) {
        media[media["video_mp4"] = 0] = "video_mp4";
        media[media["video_webm"] = 1] = "video_webm";
        media[media["audio_mp3"] = 2] = "audio_mp3";
    })(SndLow.media || (SndLow.media = {}));
    var media = SndLow.media;
    function html5_CanPlay(m) {
        if (canPlayRes[m] == 0) {
            var elem;
            switch (m) {
                case 2 /* audio_mp3 */:
                    canPlayRes[m] == -1;
                    elem = document.createElement('audio');
                    if (!elem.canPlayType)
                        break;
                    canPlayRes[m] = elem.canPlayType('audio/mpeg;').replace(/^no$/, '') == '' ? -1 : 1;
                    break;
                case 0 /* video_mp4 */:
                case 1 /* video_webm */:
                    canPlayRes[0 /* video_mp4 */] = canPlayRes[1 /* video_webm */] = -1;
                    elem = document.createElement('video');
                    if (!elem.canPlayType)
                        break;
                    canPlayRes[0 /* video_mp4 */] = elem.canPlayType('video/mp4; codecs="avc1.42E01E"').replace(/^no$/, '') == '' ? -1 : 1;
                    canPlayRes[1 /* video_webm */] = elem.canPlayType('video/webm; codecs="vp8, vorbis"').replace(/^no$/, '') == '' ? -1 : 1;
                    break;
                default: {
                    debugger;
                    throw "not implemented;";
                }
            }
            Logger.trace_lmsnd('soundnew.ts: Player.canPlay ' + media[m] + ': ' + canPlayRes[m].toString());
        }
        return canPlayRes[m] == 1;
    }
    SndLow.html5_CanPlay = html5_CanPlay;
    var canPlayRes = [0, 0, 0];

    function compareBrowserVersion(a, b) {
        return compVerRec(a.split("."), b.split("."));
    }
    function compVerRec(a, b) {
        if (a.length == 0)
            a = ['0'];
        if (b.length == 0)
            b = ['0'];
        if (a[0] != b[0] || (a.length == 1 && b.length == 1))
            return parseInt(a[0]) - parseInt(b[0]);
        return compVerRec(a.slice(1), b.slice(1));
    }

    SndLow.memorySource = "memory";

    var MediaDriver = (function () {
        function MediaDriver(isVideo, id, parent) {
            this.isVideo = isVideo;
            this.id = id;
            this.parent = parent;
            this.timerId = 0;
        }
        MediaDriver.prototype.htmlClearing = function () {
            try  {
                this.stop(); /*this.setTimer(null);*/ 
                if (!this.htmlElement)
                    return;
                this.htmlElement.remove();
                this.htmlElement = null;
            } catch (msg) {
            }
        };

        //begMsec<0 => pouze open. endMsec<0 => hraje se do konce
        MediaDriver.prototype.openPlay = function (url, begMsec, endMsec, onBlockGui) {
            if (typeof onBlockGui === "undefined") { onBlockGui = null; }
            SndLow.Stop(this);
            var th = this;
            th.onCanplaythrough = th.onPaused = th.timeupdate = null;
            if (th.actPlayer)
                th.actPlayer.reject();
            var def = th.actPlayer = $.Deferred();
            if (begMsec >= 0 && onBlockGui)
                onBlockGui(true); //zablokuj GUI (kdyz neni jen Open)
            th.onPaused = function () {
                if (th.onCanplaythrough)
                    return;
                th.onPaused = null;
                th.timeupdate = null;
                def.resolve();
            };
            th.timeupdate = function (msec) {
                if (endMsec > 0 && msec > endMsec)
                    th.handler.pause();
                else
                    def.notify(msec);
            };
            th.onCanplaythrough = function () {
                th.onCanplaythrough = null;
                if (onBlockGui)
                    onBlockGui(false);
                if (begMsec < 0)
                    def.resolve(); //pouze open
                else {
                    th.handler.currentTime = begMsec / 1000;
                    th.handler.play();
                }
            };
            th.openFile(url);
            return def.promise();
        };

        MediaDriver.prototype.doTimeupdate = function () {
            if (!this.timeupdate)
                return;
            try  {
                this.timeupdate(Math.round(this.handler.currentTime * 1000));
            } catch (msg) {
            }
        };
        MediaDriver.prototype.doPaused = function () {
            Logger.trace_lmsnd('soundnew.ts: MediaDriver.doPaused');
            if (!this.onPaused)
                return;
            try  {
                this.onPaused();
            } catch (msg) {
            }
        };
        MediaDriver.prototype.doCanplaythrough = function () {
            guiBlocker(false);
            Logger.trace_lmsnd('soundnew.ts: MediaDriver.doCanplaythrough');
            if (!this.onCanplaythrough)
                return;
            try  {
                this.onCanplaythrough();
            } catch (msg) {
            }
        };
        MediaDriver.prototype.doLoading = function (isStart) {
            Logger.trace_lmsnd('soundnew.ts: MediaDriver.doLoading');
            if (!this.loading)
                return;
            try  {
                this.loading(isStart);
            } catch (msg) {
            }
        };

        MediaDriver.prototype.openFile = function (url) {
            debugger;
            throw "not implemented";
        };

        MediaDriver.prototype.onError = function (err) {
            this.errorFlag = true;
            setTimeout(function () {
                this.errorFlag = false;
            }, 100); //nastav na chvili errorFlag, aby byla sance na ukonceni timeru.
            Logger.error_snd('Audio error', err); //LMSnd.options.onError("HTML5 Error code: " + err);
            try  {
                this.stop();
            } catch (e) {
            }
        };

        MediaDriver.prototype.stop = function () {
            Logger.trace_lmsnd('soundnew.ts: MediaDriver.stop start');
            try  {
                //if (this.actPlayer) { this.actPlayer.reject(); this.actPlayer = null; }
                this.handler.pause();
                Logger.trace_lmsnd('soundnew.ts: MediaDriver.stop end');
            } catch (msg) {
                Logger.error_snd('MediaDriver.stop', msg);
                debugger;
                throw msg;
            }
        };

        MediaDriver.prototype.play = function (url, msecPos, playProgress) {
            var th = this;
            this.openPlay(url, msecPos, -1).done(function () {
                if (playProgress)
                    playProgress(-1);
            }).progress(function (msec) {
                if (playProgress)
                    playProgress(msec + 50);
            });
        };
        return MediaDriver;
    })();
    SndLow.MediaDriver = MediaDriver;

    var MediaDriver_Html5 = (function (_super) {
        __extends(MediaDriver_Html5, _super);
        //http://www.w3schools.com/tags/ref_av_dom.asp
        //http://msdn.microsoft.com/en-us/library/ie/gg130960(v=vs.85).aspx
        //http://html5doctor.com/multimedia-troubleshooting/
        function MediaDriver_Html5(isVideo, id, parent, htmltagClass) {
            _super.call(this, isVideo, id, parent);
            try  {
                var th = this;
                Logger.trace_lmsnd('soundnew.ts: MediaDriver_Html5.init start');
                th.htmlElement = $(isVideo ? '<video class="cls-video embed-responsive-item' + (htmltagClass ? htmltagClass : '') + '"></video>' : '<audio class="cls-audio ' + (htmltagClass ? htmltagClass : '') + '"></audio>');
                th.html5Handler = (th.htmlElement[0]);
                th.handler = th.html5Handler;
                th.recHandler = new html5Recorder.RecHandler();
                var $par = parent ? $(parent) : $('body');
                if (isVideo) {
                    var parClasses = $par.attr('class').split(/\s+/);
                    _.each(parClasses, function (cls) {
                        if (cls.indexOf('video-') != 0)
                            return;
                        th.htmlElement.addClass(cls);
                    });
                }
                $par.prepend(th.htmlElement[0]);
                if (!th.html5Handler.load) {
                    debugger;
                    throw 'MediaDriver_Html5.init: cannot find load method of audio/video tag';
                }
                $(th.html5Handler).on('error', function () {
                    return th.onError(th.html5Handler.error.code.toString());
                }).on('canplaythrough', function () {
                    return th.doCanplaythrough();
                }).on('ended', function () {
                    return th.doPaused();
                }).on('pause', function () {
                    return th.doPaused();
                }).on('timeupdate', function () {
                    return th.doTimeupdate();
                });
                Logger.trace_lmsnd('soundnew.ts: HTML5.init end');
            } catch (msg) {
                Logger.error_snd('MediaDriver_Html5.init', msg);
                debugger;
                throw msg;
            }
        }
        MediaDriver_Html5.prototype.openFile = function (url) {
            var th = this;
            Logger.trace_lmsnd('soundnew.ts: MediaDriver_Html5.openFile start: url=' + url);
            if (url == SndLow.memorySource) {
                Logger.trace_lmsnd('soundnew.ts: MediaDriver_Html5.openFile: memory, url=' + html5Recorder.wavUrl);
                th.url = url;
                th.html5Handler.src = html5Recorder.wavUrl;
                th.html5Handler.play();
            } else {
                try  {
                    url = url.toLowerCase();
                    if (!th.url || th.url.indexOf(url) < 0) {
                        Logger.trace_lmsnd('soundnew.ts: MediaDriver_Html5.openFile jine URL');
                        $.ajax(url, { dataType: 'blob', processData: false }).done(function () {
                            th.html5Handler.src = th.url = url;
                            th.html5Handler.load();
                        }).fail(function () {
                            debugger;
                            Logger.error_snd('soundnew.ts: MediaDriver_Html5.openFile', 'ajax error: ' + url);
                        });
                    } else {
                        Logger.trace_lmsnd('soundnew.ts: MediaDriver_Html5.openFile stejne URL');
                        if (th.onCanplaythrough)
                            th.onCanplaythrough();
                    }
                } catch (msg) {
                    th.html5Handler.src = null;
                    Logger.error_snd('MediaDriver_Html5.openFile', msg);
                    debugger;
                    throw msg;
                }
            }
        };
        return MediaDriver_Html5;
    })(MediaDriver);
    SndLow.MediaDriver_Html5 = MediaDriver_Html5;

    var slWarning;

    //var slVersion = "5.0.61118.0";
    var slVersion = "5.1.20913.0";
    SndLow.slInstallUrl = 'http://www.microsoft.com/getsilverlight';
    var slXapUrl = '../schools/slextension.xap';

    //var slXapUrl = 'slextension.xap.png'; //HACHLE
    var slIsInstalled = 0;

    

    

    var MediaDriver_SL = (function (_super) {
        __extends(MediaDriver_SL, _super);
        function MediaDriver_SL(isVideo, id, parentEl, htmltagClass, completed) {
            var _this = this;
            _super.call(this, isVideo, id, parentEl);
            try  {
                Logger.trace_lmsnd('soundnew.ts: MediaDriver_SL.constructor: init start');

                //SL neni nainstalovan a v hlasce 'nainstalovat' klepl student na NE
                if (slIsInstalled == -1)
                    return;

                //Nevime, zdali je SL nainstalovan
                if (slIsInstalled == 0) {
                    if (!Silverlight.isInstalled(slVersion)) {
                        Logger.trace_lmsnd('soundnew.ts: MediaDriver_SL.constructor: not installed');
                        if (confirm('Microsoft Silverlight Installation required!'))
                            window.top.location.href = SndLow.slInstallUrl;
                        else {
                            slIsInstalled = -1;
                            alert('Without the Silvetlight installation some didactic features will be unavailable!');
                        }
                    } else
                        slIsInstalled = 1;
                }
                if (slIsInstalled != 1)
                    return;

                //SL je nainstalovan
                var self = this;
                var src = Silverlight.createObject(slXapUrl, null, id, { autoUpgrade: 'true', background: 'white', minRuntimeVersion: slVersion, alt: 'LANGMaster', enablehtmlaccess: 'true' }, {
                    onError: function (msg) {
                        return _this.onError(msg);
                    },
                    onLoad: function (sender) {
                        try  {
                            Logger.trace_lmsnd('soundnew.ts: MediaDriver_SL.constructor: onLoad start');
                            var video = sender.getHost().content.HTML5Like;

                            var slObj = $('#' + id);
                            self.handler = self.recHandler = self.slHandler = video;
                            self.isVideo = isVideo;
                            video.alowTitle = CSLocalize('f9726cae800748ef83e29f8d3c2cbb98', 'Alow microphone');
                            video.addEventListener("OnError", function (sender, ev) {
                                try  {
                                    self.onError(ev.Value);
                                } catch (exp) {
                                }
                            });
                            video.addEventListener("OnTrace", function (sender, ev) {
                                try  {
                                    Logger.trace_lmsnd(ev.Value);
                                } catch (exp) {
                                }
                            });
                            video.addEventListener("onCanplaythrough", function () {
                                return self.doCanplaythrough();
                            });
                            video.addEventListener("onPaused", function () {
                                return self.doPaused();
                            });
                            video.addEventListener("timeupdate", function () {
                                return self.doTimeupdate();
                            });
                            completed(self);
                            Logger.trace_lmsnd('soundnew.ts: MediaDriver_SL.constructor: onLoad end');
                        } catch (msg) {
                            Logger.error_snd('soundnew.ts: MediaDriver_SL.constructor: onLoad', msg);
                            debugger;
                            throw msg;
                        }
                    }
                }, "");
                src = src.replace('<object ', '<object class="cls-' + (isVideo ? 'video ' : 'audio ') + (htmltagClass ? htmltagClass : '') + '" ');
                var $parent = parentEl ? $(parentEl) : $('body');
                this.htmlElement = $(src);
                if (isVideo) {
                    var parClasses = $parent.attr('class').split(/\s+/);
                    _.each(parClasses, function (cls) {
                        if (cls.indexOf('video-') != 0)
                            return;
                        _this.htmlElement.addClass(cls);
                    });
                }
                $parent.prepend(this.htmlElement[0]);
                this.parent = $parent[0];

                Logger.trace_lmsnd('soundnew.ts: MediaDriver_SL.constructor: init end');
            } catch (msg) {
                Logger.error_snd('soundnew.ts: MediaDriver_SL.constructor: init', msg);
                debugger;
                throw msg;
            }
        }
        MediaDriver_SL.prototype.openFile = function (url) {
            Logger.trace_lmsnd('soundnew.ts: MediaDriver_SL.openFile start: url=' + url);
            this.url = url;
            this.slHandler.openFile(url);
        };
        return MediaDriver_SL;
    })(MediaDriver);
    SndLow.MediaDriver_SL = MediaDriver_SL;
})(SndLow || (SndLow = {}));

//******************* Player pro EA
var LMSnd;
(function (LMSnd) {
    //export var playFinishedFlag = 10000000.0;
    var Player = (function () {
        function Player() {
        }
        Player.init = function (_onStoped) {
            SndLow.createDriver(false, 'slplayer', '#sldivslplayer', 'cls-audio-unvisible', null, function (dr) {
                LMSnd.driver = dr;
                onStoped = _onStoped;
            });
        };

        Player.playFile = function (url, sec) {
            try  {
                Logger.trace_lmsnd('soundnew.ts: LMSnd.Player.playFile start');
                if (!onStoped) {
                    debugger;
                    throw '!onStoped';
                }
                url = url.toLowerCase().replace('.wma', '.mp3');
                Logger.trace_lmsnd('soundnew.ts: LMSnd.Player.playFile sec=' + sec.toString() + ', url=' + url);
                LMSnd.driver.play(url, sec * 1000, function (msec) {
                    if (msec < 0) {
                        onStoped();
                        Logger.trace_lmsnd('soundnew.ts: LMSnd.Player.playFile stoped');
                    } else {
                        Logger.trace_lmsnd('****** ' + msec.toString());
                        if (file)
                            file.onPlaying(msec);
                    }
                });
                Logger.trace_lmsnd('soundnew.ts: LMSnd.Player.playFile end');
            } catch (msg) {
                Logger.error_snd('soundnew.ts: LMSnd.Player.playFile', msg);
                debugger;
                throw msg;
            }
        };

        Player.play = function (_file, msec) {
            try  {
                Logger.trace_lmsnd('soundnew.ts: LMSnd.Player.play start');
                file = _file;
                var url = _file.getFileUrl().toLowerCase();
                Player.playFile(url, msec / 1000);
                Logger.trace_lmsnd('soundnew.ts: LMSnd.Player.play end');
            } catch (msg) {
                Logger.error_snd('soundnew.ts: LMSnd.Player.playFile', msg);
                debugger;
                throw msg;
            }
        };

        Player.stop = function () {
            if (!LMSnd.driver || !LMSnd.driver.handler)
                return;
            try  {
                LMSnd.driver.stop();
            } catch (err) {
            }
        };
        return Player;
    })();
    LMSnd.Player = Player;
    var onStoped;
    LMSnd.driver;
    var file = null;
})(LMSnd || (LMSnd = {}));

//xx/#DEBUG
var Logger;
(function (Logger) {
    function trace_lmsnd(msg) {
        Logger.trace("Sound", msg);
    }
    Logger.trace_lmsnd = trace_lmsnd;
    function error_snd(where, msg) {
        Logger.error("Sound", msg, where);
    }
    Logger.error_snd = error_snd;
    ;
})(Logger || (Logger = {}));
//xx/#ENDDEBUG
//var SoundNoop = null;

//http://www.html5rocks.com/en/tutorials/getusermedia/intro/
//http://typedarray.org/from-microphone-to-wav-with-getusermedia-and-web-audio/
//http://webaudiodemos.appspot.com/

var html5Recorder;
(function (html5Recorder) {
    html5Recorder.wavUrl = null;

    var audioCaptureTested = false;
    var audioContextError;

    //nodes a context, vznikle pri prvnim recording
    var audioContext = null;
    var copyToBufferNode;
    var microphoneNode;
    var audioNodesConnected = false;

    var recBuffers = [];

    var RecHandler = (function () {
        function RecHandler() {
            this.alowTitle = '';
        }
        RecHandler.prototype.recordStart = function () {
            startRecording();
        };
        RecHandler.prototype.recordEnd = function () {
            stopRecording(null);
        };
        RecHandler.prototype.isRecording = function () {
            return audioNodesConnected;
        };
        RecHandler.prototype.recordingExists = function () {
            return !!html5Recorder.wavUrl;
        };
        RecHandler.prototype.clearRecording = function () {
            clearRecording();
        };
        RecHandler.prototype.alowMicrophone = function () {
            return true;
        };
        return RecHandler;
    })();
    html5Recorder.RecHandler = RecHandler;

    function audioCaptureDisabled() {
        if (audioCaptureTested)
            return audioContextError;
        audioCaptureTested = true;

        var errors = [];
        var nav = navigator;
        navigator.getUserMedia = nav.getUserMedia || nav.webkitGetUserMedia || nav.mozGetUserMedia || nav.msGetUserMedia;
        if (!navigator.getUserMedia)
            errors.push("Browser does not support navigator.getUserMedia.");
        URL = window.URL || window.webkitURL;
        if (!URL)
            errors.push("Browser does not support window.URL.");
        if (URL && (!URL.revokeObjectURL || !URL.createObjectURL))
            errors.push("Browser does not support URL.revokeObjectURL or URL.createObjectURL.");
        AudioContext = window.webkitAudioContext || window.AudioContext;
        if (!AudioContext)
            errors.push("Browser does not support window.AudioContext.");
        var audioContextError = errors.join("\r\n");
        if (audioContextError == '')
            audioContextError = null;
        return audioContextError;
    }
    html5Recorder.audioCaptureDisabled = audioCaptureDisabled;

    function startRecording() {
        if (audioNodesConnected)
            return;
        if (audioCaptureDisabled()) {
            debugger;
            throw 'testAudioCapture() != null';
        }
        recBuffers = []; //vyprazdni buffers
        if (!audioContext) {
            var alowMicrophoneTimer = setTimeout(function () {
                alert('Allow the microphone, please (using the button rigth above the content of the page).');
                alowMicrophoneTimer = 0;
            }, 3000);
            navigator.getUserMedia({ audio: true, video: false }, function (stream) {
                if (alowMicrophoneTimer)
                    clearTimeout(alowMicrophoneTimer); //polen mikrofon => zrus upozorneni
                audioContext = new AudioContext();
                microphoneNode = audioContext.createMediaStreamSource(stream); //preved stream ze streamu na AudioNode
                copyToBufferNode = audioContext.createScriptProcessor(4096, 1, 1); //AudioNode na zaznamenani do bufferu
                copyToBufferNode.onaudioprocess = function (ev) {
                    return recBuffers.push(new Float32Array(ev.inputBuffer.getChannelData(0)));
                }; //vlastni recording - data do bufferu
                connectAudioNodes(true); //napojeni audio nodes
            }, $.noop);
        } else
            connectAudioNodes(true);
    }

    function connectAudioNodes(doConnect) {
        if (doConnect && !audioNodesConnected) {
            microphoneNode.connect(copyToBufferNode);
            copyToBufferNode.connect(audioContext.destination);
            audioNodesConnected = true;
        } else if (!doConnect && audioNodesConnected) {
            microphoneNode.disconnect();
            copyToBufferNode.disconnect();
            audioNodesConnected = false;
        }
    }

    function clearRecording() {
        if (html5Recorder.wavUrl) {
            URL.revokeObjectURL(html5Recorder.wavUrl);
            html5Recorder.wavUrl = null;
        }
    }

    function stopRecording(completed) {
        if (!audioNodesConnected)
            return;
        connectAudioNodes(false); //odvaz mikrofon z grafu
        if (recBuffers.length == 0) {
            debugger;
            throw 'recBuffers.length == 0';
        }

        //linearize recording
        var samples = mergeBuffers(recBuffers);
        recBuffers = [];
        Logger.trace_lmsnd('HTML5rec.stopRecording len=' + samples.length.toString());

        //preved do blob a url
        var dataview = encodeWAV(samples, 44100);
        var blob = new Blob([dataview], { type: "audio/wav" });
        html5Recorder.wavUrl = URL.createObjectURL(blob);
        Logger.trace_lmsnd('HTML5rec.stopRecording wavUrl=' + html5Recorder.wavUrl);
        if (completed)
            completed(html5Recorder.wavUrl);
    }

    function mergeBuffers(recBuffers) {
        var len = 0;
        _.each(recBuffers, function (b) {
            return len += b.length;
        }); //zjisti delku vysledku
        var result = new Float32Array(len);
        var offset = 0;
        _.each(recBuffers, function (b) {
            result.set(b, offset);
            offset += b.length;
        }); //zkopiruj bufery do jednoho
        return result;
    }

    function floatTo16BitPCM(view, offset, samples) {
        for (var i = 0; i < samples.length; i++, offset += 2) {
            var s = Math.max(-1, Math.min(1, samples[i]));
            view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
        }
    }

    function writeString(view, offset, str) {
        for (var i = 0; i < str.length; i++)
            view.setUint8(offset + i, str.charCodeAt(i));
    }

    function encodeWAV(samples, sampleRate) {
        var buffer = new ArrayBuffer(44 + samples.length * 2);
        var view = new DataView(buffer);

        writeString(view, 0, 'RIFF'); // RIFF identifier
        view.setUint32(4, 32 + samples.length * 2, true); // file length
        writeString(view, 8, 'WAVE'); // RIFF type
        writeString(view, 12, 'fmt '); // format chunk identifier
        view.setUint32(16, 16, true); // format chunk length
        view.setUint16(20, 1, true); // sample format (raw)
        view.setUint16(22, 1, true); // channel count, view.setUint16(22, 2, true) pro stereo
        view.setUint32(24, sampleRate, true); // sample rate
        view.setUint32(28, sampleRate * 2, true); // byte rate (sample rate * block align), view.setUint32(28, sampleRate * 4, true);  pro stereo
        view.setUint16(32, 2, true); //block align (channel count * bytes per sample), view.setUint16(32, 4, true) pro stereo
        view.setUint16(34, 16, true); // bits per sample
        writeString(view, 36, 'data'); // data chunk identifier
        view.setUint32(40, samples.length * 2, true); // data chunk length
        floatTo16BitPCM(view, 44, samples);

        return view;
    }
})(html5Recorder || (html5Recorder = {}));

//http://xregexp.com/plugins/, d:\Instalace\JavascriptUnicode\
var Unicode;
(function (Unicode) {
    var a = new RegExp("\\w{4}", "g");

    //unicode - properties.js
    var White_Space = "0009-000D0020008500A01680180E2000-200A20282029202F205F3000".replace(a, "\\u$&");
    var cWhite_Space = new RegExp("[" + White_Space + "\']");

    //unicode-base.js
    var Letter = "0041-005A0061-007A00AA00B500BA00C0-00D600D8-00F600F8-02C102C6-02D102E0-02E402EC02EE0370-037403760377037A-037D03860388-038A038C038E-03A103A3-03F503F7-0481048A-05270531-055605590561-058705D0-05EA05F0-05F20620-064A066E066F0671-06D306D506E506E606EE06EF06FA-06FC06FF07100712-072F074D-07A507B107CA-07EA07F407F507FA0800-0815081A082408280840-085808A008A2-08AC0904-0939093D09500958-09610971-09770979-097F0985-098C098F09900993-09A809AA-09B009B209B6-09B909BD09CE09DC09DD09DF-09E109F009F10A05-0A0A0A0F0A100A13-0A280A2A-0A300A320A330A350A360A380A390A59-0A5C0A5E0A72-0A740A85-0A8D0A8F-0A910A93-0AA80AAA-0AB00AB20AB30AB5-0AB90ABD0AD00AE00AE10B05-0B0C0B0F0B100B13-0B280B2A-0B300B320B330B35-0B390B3D0B5C0B5D0B5F-0B610B710B830B85-0B8A0B8E-0B900B92-0B950B990B9A0B9C0B9E0B9F0BA30BA40BA8-0BAA0BAE-0BB90BD00C05-0C0C0C0E-0C100C12-0C280C2A-0C330C35-0C390C3D0C580C590C600C610C85-0C8C0C8E-0C900C92-0CA80CAA-0CB30CB5-0CB90CBD0CDE0CE00CE10CF10CF20D05-0D0C0D0E-0D100D12-0D3A0D3D0D4E0D600D610D7A-0D7F0D85-0D960D9A-0DB10DB3-0DBB0DBD0DC0-0DC60E01-0E300E320E330E40-0E460E810E820E840E870E880E8A0E8D0E94-0E970E99-0E9F0EA1-0EA30EA50EA70EAA0EAB0EAD-0EB00EB20EB30EBD0EC0-0EC40EC60EDC-0EDF0F000F40-0F470F49-0F6C0F88-0F8C1000-102A103F1050-1055105A-105D106110651066106E-10701075-1081108E10A0-10C510C710CD10D0-10FA10FC-1248124A-124D1250-12561258125A-125D1260-1288128A-128D1290-12B012B2-12B512B8-12BE12C012C2-12C512C8-12D612D8-13101312-13151318-135A1380-138F13A0-13F41401-166C166F-167F1681-169A16A0-16EA1700-170C170E-17111720-17311740-17511760-176C176E-17701780-17B317D717DC1820-18771880-18A818AA18B0-18F51900-191C1950-196D1970-19741980-19AB19C1-19C71A00-1A161A20-1A541AA71B05-1B331B45-1B4B1B83-1BA01BAE1BAF1BBA-1BE51C00-1C231C4D-1C4F1C5A-1C7D1CE9-1CEC1CEE-1CF11CF51CF61D00-1DBF1E00-1F151F18-1F1D1F20-1F451F48-1F4D1F50-1F571F591F5B1F5D1F5F-1F7D1F80-1FB41FB6-1FBC1FBE1FC2-1FC41FC6-1FCC1FD0-1FD31FD6-1FDB1FE0-1FEC1FF2-1FF41FF6-1FFC2071207F2090-209C21022107210A-211321152119-211D212421262128212A-212D212F-2139213C-213F2145-2149214E218321842C00-2C2E2C30-2C5E2C60-2CE42CEB-2CEE2CF22CF32D00-2D252D272D2D2D30-2D672D6F2D80-2D962DA0-2DA62DA8-2DAE2DB0-2DB62DB8-2DBE2DC0-2DC62DC8-2DCE2DD0-2DD62DD8-2DDE2E2F300530063031-3035303B303C3041-3096309D-309F30A1-30FA30FC-30FF3105-312D3131-318E31A0-31BA31F0-31FF3400-4DB54E00-9FCCA000-A48CA4D0-A4FDA500-A60CA610-A61FA62AA62BA640-A66EA67F-A697A6A0-A6E5A717-A71FA722-A788A78B-A78EA790-A793A7A0-A7AAA7F8-A801A803-A805A807-A80AA80C-A822A840-A873A882-A8B3A8F2-A8F7A8FBA90A-A925A930-A946A960-A97CA984-A9B2A9CFAA00-AA28AA40-AA42AA44-AA4BAA60-AA76AA7AAA80-AAAFAAB1AAB5AAB6AAB9-AABDAAC0AAC2AADB-AADDAAE0-AAEAAAF2-AAF4AB01-AB06AB09-AB0EAB11-AB16AB20-AB26AB28-AB2EABC0-ABE2AC00-D7A3D7B0-D7C6D7CB-D7FBF900-FA6DFA70-FAD9FB00-FB06FB13-FB17FB1DFB1F-FB28FB2A-FB36FB38-FB3CFB3EFB40FB41FB43FB44FB46-FBB1FBD3-FD3DFD50-FD8FFD92-FDC7FDF0-FDFBFE70-FE74FE76-FEFCFF21-FF3AFF41-FF5AFF66-FFBEFFC2-FFC7FFCA-FFCFFFD2-FFD7FFDA-FFDC".replace(a, "\\u$&");
    var cLetter = new RegExp("[" + Letter + "\']");

    //unicode-categories.js
    var Number = "0030-003900B200B300B900BC-00BE0660-066906F0-06F907C0-07C90966-096F09E6-09EF09F4-09F90A66-0A6F0AE6-0AEF0B66-0B6F0B72-0B770BE6-0BF20C66-0C6F0C78-0C7E0CE6-0CEF0D66-0D750E50-0E590ED0-0ED90F20-0F331040-10491090-10991369-137C16EE-16F017E0-17E917F0-17F91810-18191946-194F19D0-19DA1A80-1A891A90-1A991B50-1B591BB0-1BB91C40-1C491C50-1C5920702074-20792080-20892150-21822185-21892460-249B24EA-24FF2776-27932CFD30073021-30293038-303A3192-31953220-32293248-324F3251-325F3280-328932B1-32BFA620-A629A6E6-A6EFA830-A835A8D0-A8D9A900-A909A9D0-A9D9AA50-AA59ABF0-ABF9FF10-FF19".replace(a, "\\u$&");
    var cNumber = new RegExp("[" + Number + "\']");

    function isLetter(ch) {
        return cLetter.test(ch);
    }
    Unicode.isLetter = isLetter;
    function isWhiteSpace(ch) {
        return cWhite_Space.test(ch);
    }
    Unicode.isWhiteSpace = isWhiteSpace;
    function isNumber(ch) {
        return cNumber.test(ch);
    }
    Unicode.isNumber = isNumber;
    function isLeterOrDigit(ch) {
        return isNumber(ch) || isLetter(ch);
    }
    Unicode.isLeterOrDigit = isLeterOrDigit;
})(Unicode || (Unicode = {}));

var Base32;
(function (Base32) {
    //https://github.com/agnoster/base32-js
    // This would be the place to edit if you want a different
    // Base32 implementation
    var alphabet = '0123456789abcdefghjkmnpqrtuvwxyz';
    var alias = { o: 0, i: 1, l: 1, s: 5 };

    /**
    * Build a lookup table and memoize it
    *
    * Return an object that maps a character to its
    * byte value.
    */
    var lookup = function () {
        var table = {};

        for (var i = 0; i < alphabet.length; i++) {
            table[alphabet[i]] = i;
        }

        for (var key in alias) {
            if (!alias.hasOwnProperty(key))
                continue;
            table[key] = table['' + alias[key]];
        }
        lookup = function () {
            return table;
        };
        return table;
    };

    /**
    * A streaming encoder
    *
    *     var encoder = new base32.Encoder()
    *     var output1 = encoder.update(input1)
    *     var output2 = encoder.update(input2)
    *     var lastoutput = encode.update(lastinput, true)
    */
    function Encoder() {
        var skip = 0;
        var bits = 0;

        this.output = '';

        // Read one byte of input
        // Should not really be used except by "update"
        this.readByte = function (bt) {
            // coerce the byte to an int
            //if (typeof byte == 'string') byte = byte.charCodeAt(0)
            if (skip < 0) {
                bits |= (bt >> (-skip));
            } else {
                bits = (bt << skip) & 248;
            }

            if (skip > 3) {
                // not enough data to produce a character, get us another one
                skip -= 8;
                return 1;
            }

            if (skip < 4) {
                // produce a character
                this.output += alphabet[bits >> 3];
                skip += 5;
            }

            return 0;
        };

        // Flush any remaining bits left in the stream
        this.finish = function (check) {
            var output = this.output + (skip < 0 ? alphabet[bits >> 3] : '') + (check ? '$' : '');
            this.output = '';
            return output;
        };
    }
    Base32.Encoder = Encoder;

    /**
    * Process additional input
    *
    * input: string of bytes to convert
    * flush: boolean, should we flush any trailing bits left
    *        in the stream
    * returns: a string of characters representing 'input' in base32
    */
    Encoder.prototype.update = function (input, flush) {
        for (var i = 0; i < input.length;) {
            i += this.readByte(input[i]);
        }

        // consume all output
        var output = this.output;
        this.output = '';
        if (flush) {
            output += this.finish();
        }
        return output;
    };

    // Functions analogously to Encoder
    function Decoder() {
        var skip = 0;
        var bt = 0;

        this.output = [];

        // Consume a character from the stream, store
        // the output in this.output. As before, better
        // to use update().
        this.readChar = function (chr) {
            //if (typeof char != 'string') {
            //if (typeof char == 'number') {
            //char = String.fromCharCode(char)
            //}
            //}
            chr = chr.toLowerCase();
            var val = lookup()[chr];
            if (typeof val == 'undefined') {
                throw Error('Could not find character "' + chr + '" in lookup table.');
            }
            val <<= 3;
            bt |= val >>> skip;
            skip += 5;
            if (skip >= 8) {
                // we have enough to preduce output
                this.output.push(bt);
                skip -= 8;
                if (skip > 0)
                    bt = (val << (5 - skip)) & 255;
                else
                    bt = 0;
            }
        };

        this.finish = function (check) {
            if (skip < 0)
                this.output.push(alphabet[bt >> 3]);
            //var output = this.output;
            //this.output = [];
            //return output;
        };
    }
    Base32.Decoder = Decoder;

    Decoder.prototype.update = function (input, flush) {
        for (var i = 0; i < input.length; i++) {
            this.readChar(input[i]);
        }
        this.finish();
        var output = this.output;
        this.output = [];
        return output;
    };

    /** Convenience functions
    *
    * These are the ones to use if you just have a string and
    * want to convert it without dealing with streams and whatnot.
    */
    // String of data goes in, Base32-encoded string comes out.
    function encode(input) {
        var encoder = new Encoder();
        var output = encoder.update(input, true);
        return output;
    }
    Base32.encode = encode;

    // Base32-encoded string goes in, decoded data comes out.
    function decode(input) {
        var decoder = new Decoder();
        var output = decoder.update(input, true);
        return output;
    }
    Base32.decode = decode;
})(Base32 || (Base32 = {}));

/// <reference path="../jsd/jquery.d.ts" />
/// <reference path="../jsd/knockout.d.ts" />
/// <reference path="../jsd/jsrender.d.ts" />
/// <reference path="../jsd/underscore.d.ts" />
/// <reference path="../js/Utils.ts" />
/// <reference path="../js/Base32.ts" />
var keys;
(function (keys) {
    function toString(key) {
        var b1 = Utils.longToByteArray(key.licId);
        var b2 = Utils.longToByteArray(key.counter);
        var b3 = [b2[0], b2[1], b2[2], b1[0], b1[1]];
        b3 = LowUtils.encrypt(b3);
        return Base32.encode(b3).toUpperCase();
    }
    keys.toString = toString;

    function fromString(str) {
        var b3 = Base32.decode(str);
        b3 = LowUtils.decrypt(b3);
        var b2 = [b3[0], b3[1], b3[2], 0, 0, 0, 0, 0];
        var b1 = [b3[3], b3[4], 0, 0, 0, 0, 0, 0];
        return { licId: Utils.byteArrayToLong(b1), counter: Utils.byteArrayToLong(b2) };
    }
    keys.fromString = fromString;
})(keys || (keys = {}));

var EA;
(function (EA) {
    //export function DataPath(): string {
    //  debugger;
    //  return cfg.EADataPath;
    //}
    function startAjax() {
        Sys.Application.dispose();
        Sys.Application.beginCreateComponents();
    }
    EA.startAjax = startAjax;
    function endAjax(completed) {
        setTimeout(function () {
            Sys.Application.endCreateComponents();
            Sys.Application._doInitialize();

            //finishImgSrc();
            if (completed)
                completed();
        }, 1);
    }
    EA.endAjax = endAjax;

    var oldToNewScoreProvider = (function () {
        function oldToNewScoreProvider(old) {
            this.old = old;
        }
        oldToNewScoreProvider.prototype.provideData = function (exData) {
            this.old.provideData(exData);
        };
        oldToNewScoreProvider.prototype.acceptData = function (done, exData) {
            this.old.acceptData(done ? 3 /* Evaluated */ : 1 /* Normal */, exData);
        };
        oldToNewScoreProvider.prototype.resetData = function (exData) {
            //var pg: CourseModel.PageUser = <any>{ Results: exData };
            this.old.resetData(exData);
        };
        oldToNewScoreProvider.prototype.getScore = function () {
            var nums = this.old.get_score();
            return nums == null || nums.length != 2 ? null : { s: nums[0], ms: nums[1], needsHumanEval: false };
        };
        return oldToNewScoreProvider;
    })();
    EA.oldToNewScoreProvider = oldToNewScoreProvider;
})(EA || (EA = {}));
//var xapPath = 'eaimgmp3/'; //cesta k XAP a SWF souborum, relativne k schools adresari.
//var xapPath = ''; //cesta k XAP a SWF souborum, relativne k schools adresari.
//var actLms = 3; //LMSType.LMCom
//function DictConnector_listenTalk(url, word) {
//  return serviceRoot(actLms.toString(), true) + '/site/' + Trados.actLangCode + '/ListeningAndPronunc.aspx#/AppPronunc/FactSoundView.xaml?IsFactOnly=true&FactUrl=' + encodeURIComponent(url) + '&FactTitle=' + encodeURIComponent(word);
//};
//function DictConnector_listenTalkSentence(pars) {
//  return serviceRoot(actLms.toString(), true) + '/site/' + Trados.actLangCode + '/ListeningAndPronunc.aspx#/AppPronunc/FactSoundView.xaml?IsFactOnly=true&FactUrl=' + encodeURIComponent(listenTalkBase(actLms.toString()) + '/' + pars.url) + '&sentBeg=' + pars.beg + '&sentEnd=' + pars.end + '&FactTitle=' + encodeURIComponent(pars.title);
//};

/*
SQL Server word breking and stemming
SELECT  *  FROM sys.dm_fts_parser ('FORMSOF( FREETEXT, "koněm")', 1029, 0, 1)
SELECT * FROM sys.dm_fts_parser (N'FORMSOF ( FREETEXT, "берлинский")', 1049, 0, 1)
select * from sys.fulltext_languages
*/
var DictConnector;
(function (DictConnector) {
    function initDict(add) {
        //if (cfg.dictType == schools.dictTypes.no) { actDictData = null; /*completed();*/ return; }
        //courseLang = LMComLib.LineToLang[line]; actLoc = loc; //dictType = d;
        //readDictInfo(completed);
        DictConnector.actDictData = add;
        if (initialized)
            return;
        initialized = true;

        //**************** events
        $(document).bind('keydown', function (ev) {
            if (DictConnector.actDictData == null)
                return;
            switch (ev.which) {
                case 67:
                case 81:
                    if (!ev.ctrlKey)
                        return;
                    if (ev.which == 67 && selectedText() != '')
                        break;
                    keyMousePos = anim.mousePos; //zapamatuj si aktualni pozici mysi
                    callDict();

                    break;
            }
        });

        //*********** popuo okno
        $(function () {
            if (!model) {
                model = new dictModel();
                dlg = JsRenderTemplateEngine.createGlobalTemplate('Dict', model);
                dlg.css('display', 'none');
                dlg.click(function (ev) {
                    ev.cancelBubble = true;
                    ev.stopPropagation();
                    return false;
                });
                dlgBody = dlg.find('.panel-content');
            }
            ko.applyBindings(model, dlg[0]);
        });
    }
    DictConnector.initDict = initDict;

    var initialized = false;

    var dictModel = (function () {
        function dictModel() {
            this.height = ko.observable(0);
            this.header = ko.observable("");
            this.body = ko.observable("");
            this.cpv = new schoolCpv.model(schools.tDictCpv, null);
        }
        return dictModel;
    })();

    var dlg;
    var dlgBody;
    var isCtrlDown = false;
    var keyMousePos;
    var model;
    DictConnector.actDictData;

    //var dicts: LMComLib.Dict[];
    function callDict() {
        if (DictConnector.actDictData == null)
            return;
        schoolCpv.hide(schools.tDictCpv);
        Logger.trace_dict('Dict: wordUnderCursorStart (top=' + keyMousePos.clientY.toString() + ",left=" + keyMousePos.clientX.toString());
        var hit_elem = $(document.elementFromPoint(keyMousePos.clientX, keyMousePos.clientY));

        Logger.trace_dict("top=" + hit_elem.offset().top.toString() + ",left=" + hit_elem.offset().left.toString() + ',html=' + hit_elem.html() + ',parent html=' + hit_elem.parent().html());

        //Logger.trace_dict('Dict: actDictId = ' + actDict.Code);
        var textNodes = [];
        var textNodesText = [];

        hit_elem.contents().filter(function () {
            return this.nodeType == 3;
        }).each(function (i) {
            textNodes.push($(this));
            textNodesText.push($(this).text());
        });
        if (textNodes.length <= 0)
            return;

        //proved word wrap
        var data = startSplitWords(textNodesText);
        Logger.trace_dict('Dict: wordWrap, 1.sent = ' + data[0].join(''));

        for (var i = 0; i < data.length; i++) {
            var toRepl = [];
            $.each(data[i], function (i, val) {
                //na IE8 se ztraci mezery
                //var el = $('<span class="w">' + val + '</span>')[0];
                var sp = document.createElement('span');
                var att = document.createAttribute("class");
                att.value = 'w';
                sp.setAttributeNode(att);
                sp.appendChild(document.createTextNode(val));
                var el = $(sp);
                toRepl.push(el);
            });
            textNodes[i].replaceWith(toRepl);
        }

        setTimeout(function () {
            var new_nodes = hit_elem.contents().filter('span.w');

            //get the exact word under cursor
            var el = document.elementFromPoint(keyMousePos.clientX, keyMousePos.clientY);
            var hit_word_elem = $(el);

            if (el == null || !hit_word_elem.hasClass("w")) {
                Logger.trace_dict("null or not w-class" + 'cursor top=' + keyMousePos.clientY.toString() + ",left=" + keyMousePos.clientX.toString());
                for (var i = 0; i < new_nodes.length; i++) {
                    var we = $(new_nodes[i]);
                    Logger.trace_dict("*** element top=" + we.offset().top.toString() + ",left=" + we.offset().left.toString() + ",width=" + we.width().toString() + ",height=" + we.height().toString() + ',html=' + we.html());
                }
                new_nodes.replaceWith(function () {
                    return $(this).contents();
                });
                return;
            }

            Logger.trace_dict('cursor top=' + keyMousePos.clientY.toString() + ",left=" + keyMousePos.clientX.toString() + "; element top=" + hit_word_elem.offset().top.toString() + ",left=" + hit_word_elem.offset().left.toString() + ",width=" + hit_word_elem.width().toString() + ",height=" + hit_word_elem.height().toString() + ',html=' + hit_word_elem.html());

            var actWord = hit_word_elem.text();
            Logger.trace_dict('Dict: ct_word=' + actWord);

            //return original content:
            new_nodes.replaceWith(function () {
                return $(this).contents();
            });

            //normalize word
            var splitWord = finishSplitWord(actWord, DictConnector.actDictData.crsLang);
            actWord = splitWord.word;

            if (actWord == null)
                return;

            var key = DictConnector.actDictData.Keys[actWord];
            var html;
            if (!key)
                html = "Cannot find " + splitWord.wordRaw;
            else {
                var res = [];
                parseLingeaDict(actWord, DictConnector.actDictData.Entries[key], DictConnector.actDictData.Tags, res);
                html = res.join(' ');
            }
            showWindow(splitWord.wordRaw, html);
        }, 1);
    }
    ;

    function parseLingeaDict(actWord, it, tags, res) {
        if (!it.tag) {
            if (it.text)
                res.push(it.text);
            return;
        }
        var tagStr = tags[it.tag];
        var tg = tagStr.split(' ')[0];
        if (tg == 'sound') {
            if (!cfg.dictNoSound) {
                var url = Pager.basicUrl + it.text;

                //res.push(Utils.string_format(soundMarkHtmlNew, ['../' + url, actWord.replace('\'', '\\\'')]));
                res.push(Utils.string_format(soundMarkHtmlNew, [url, actWord.replace('\'', '\\\'')]));
            }
        } else {
            res.push('<' + tagStr + '>');
            if (it.text)
                res.push(it.text);
            if (it.items)
                _.each(it.items, function (subIt) {
                    return parseLingeaDict(actWord, subIt, DictConnector.actDictData.Tags, res);
                });
            res.push('</' + tg + '>');
        }
    }
    function playFile(url) {
        setTimeout(function () {
            return LMSnd.Player.playFile(url, 0);
        }, 1);
    }
    DictConnector.playFile = playFile;

    var soundMarkHtmlNew = [
        '<span class="sound-repro-new fa fa-volume-off" onclick="DictConnector.playFile(\'{0}\', 0)"></span>',
        '<span class="sound-listen-talk-new fa fa-microphone" onclick="schoolCpv.show(schools.tDictCpv, \'{0}\', \'{1}\')"></span>'
    ].join('');

    function showWindow(word, html) {
        //vloz data do popup okna
        model.body(html);
        model.header(word);
        anim.showMenu(dlg, anim.mousePos);
    }
    ;

    var selectedText = function () {
        var t = '';
        if (window.getSelection)
            t = window.getSelection();
        else if (document.getSelection)
            t = document.getSelection();
        else if (document.selection)
            t = document.selection.createRange().text;
        return t;
    };

    var russianAccent = "\u0301";
    var wrongCyrilic = { 'á': "а" + russianAccent, 'a': "а", 'p': "р", 'e': "е", 'y': "у", 'c': "с", 'ë': "ё", 'ý': "у" + russianAccent, 'é': "е" + russianAccent, 'x': "х", 'ó': "о" + russianAccent, 'm': "м", 'o': "о" };
    function isWordChar(ch) {
        return Unicode.isLetter(ch) || ch == russianAccent || ch == '-';
    }
    ;
    function normalizeRussian(s) {
        var rep = [];
        for (var i = 0; i < s.length; i++) {
            var ch = s.charAt(i);
            var ok = wrongCyrilic[ch];
            rep.push(ok ? ok.charAt(0) : ch);
        }
        return rep.join('');
    }
    function startSplitWords(sentences) {
        var res = new Array(sentences.length);
        for (var i = 0; i < sentences.length; i++) {
            var sentRes = startSplitWord(sentences[i]);
            res[i] = sentRes;
        }
        return res;
    }

    //funkce musi odpovidat d:\LMCom\rew\NewLMComModel\Design\Dictionaries.cs, wordsForDesignTime
    function startSplitWord(sent) {
        if (_.isEmpty(sent))
            return [];
        var res = [];
        var word = [];
        var wordCharFound = false;
        for (var i = 0; i < sent.length; i++) {
            var ch = sent.charAt(i);
            var isWord = isWordChar(ch);
            if (isWord)
                wordCharFound = true;
            if (wordCharFound && word.length > 0 && !isWord) {
                res.push(word.join(''));
                word = [];
                wordCharFound = false;
            }
            word.push(ch);
        }
        if (word.length > 0)
            res.push(word.join(''));
        return res;
    }
    function finishSplitWord(word, crsLang) {
        if (_.isEmpty(word))
            return null;
        if (crsLang == 9 /* ru_ru */)
            word = normalizeRussian(word);
        var res = [];
        var resRaw = [];
        for (var i = 0; i < word.length; i++) {
            var ch = word.charAt(i);
            var isWord = isWordChar(ch);
            if (isWord) {
                resRaw.push(ch);
                if (ch != russianAccent)
                    res.push(ch);
            } else if (res.length > 0 && !isWord)
                break;
        }
        return res.length > 0 ? { word: res.join('').toLowerCase(), wordRaw: resRaw.join('') } : null;
    }

    function wordsForDesignTime(sent, crsLang, res) {
        if (_.isEmpty(sent))
            return null;
        sent = sent.toLowerCase();
        if (crsLang == 9 /* ru_ru */)
            sent = normalizeRussian(sent);
        var word = [];
        for (var i = 0; i <= sent.length; i++) {
            var ch = i < sent.length ? sent.charAt(i) : ' ';
            var isWord = isWordChar(ch);
            if (isWord)
                word.push(ch);
            else if (word.length > 0 && !isWord) {
                res.push(word.join(''));
                word = [];
            }
        }
    }
    DictConnector.wordsForDesignTime = wordsForDesignTime;
})(DictConnector || (DictConnector = {}));

//xx/#DEBUG
var Logger;
(function (Logger) {
    function trace_dict(msg) {
        Logger.trace("Dict", msg);
    }
    Logger.trace_dict = trace_dict;
})(Logger || (Logger = {}));
//xx/#ENDDEBUG
//var noop_dict = null;

/*
Copyright (c) 2012, Dmytro V. Dogadailo <entropyhacker@gmail.com>
RJSON is Recursive JSON.
RJSON converts any JSON data collection into more compact recursive
form. Compressed data is still JSON and can be parsed with `JSON.parse`. RJSON
can compress not only homogeneous collections, but any data sets with free
structure.
RJSON is stream single-pass compressor, it extracts data schemes from a
document, assign each schema unique number and use this number instead of
repeating same property names again and again.
Bellow you can see same document in both forms.
JSON:
{
"id": 7,
"tags": ["programming", "javascript"],
"users": [
{"first": "Homer", "last": "Simpson"},
{"first": "Hank", "last": "Hill"},
{"first": "Peter", "last": "Griffin"}
],
"books": [
{"title": "JavaScript", "author": "Flanagan", "year": 2006},
{"title": "Cascading Style Sheets", "author": "Meyer", "year": 2004}
]
}
RJSON:
{
"id": 7,
"tags": ["programming", "javascript"],
"users": [
{"first": "Homer", "last": "Simpson"},
[2, "Hank", "Hill", "Peter", "Griffin"]
],
"books": [
{"title": "JavaScript", "author": "Flanagan", "year": 2006},
[3, "Cascading Style Sheets", "Meyer", 2004]
]
}
RJSON allows to:
* reduce JSON data size and network traffic when gzip isn't available. For
example, in-browser 3D-modeling tools like [Mydeco
3D-planner](http://mydeco.com/3d-planner/) may process and send to server
megabytes of JSON-data;
* analyze large collections of JSON-data without
unpacking of whole dataset. RJSON-data is still JSON-data, so it can be
traversed and analyzed after parsing and fully unpacked only if a document meets
some conditions.
*/
var RJSON;
(function (RJSON) {
    var hasOwnProperty = Object.prototype.hasOwnProperty, toString = Object.prototype.toString, getKeys = Object.keys || _keys, isArray = Array.isArray || _isArray;

    /**
    * @param {*} Any valid for JSON javascript data.
    * @return {*} Packed javascript data, usually a dictionary.
    */
    function pack(data) {
        var schemas = {}, maxSchemaIndex = 0;

        function encodeArray(value) {
            var len = value.length, encoded = [];
            if (len === 0)
                return [];
            if (typeof value[0] === 'number') {
                encoded.push(0); // 0 is schema index for Array
            }
            for (var i = 0; i < len; i++) {
                var v = value[i], current = encode(v), last = encoded[encoded.length - 1];
                if (isEncodedObject(current) && isArray(last) && current[0] === last[0]) {
                    // current and previous object have same schema,
                    // so merge their values into one array
                    encoded[encoded.length - 1] = last.concat(current.slice(1));
                } else {
                    encoded.push(current);
                }
            }
            return encoded;
        }

        function encodeObject(value) {
            var schemaKeys = getKeys(value).sort();
            if (schemaKeys.length === 0) {
                return {};
            }
            var encoded, schema = schemaKeys.length + ':' + schemaKeys.join('|'), schemaIndex = schemas[schema];
            if (schemaIndex) {
                encoded = [schemaIndex];
                for (var i = 0, k; k = schemaKeys[i++];) {
                    encoded[i] = encode(value[k]);
                }
            } else {
                schemas[schema] = ++maxSchemaIndex;
                encoded = {};
                for (var i = 0, k; k = schemaKeys[i++];) {
                    encoded[k] = encode(value[k]);
                }
            }
            return encoded;
        }

        function encode(value) {
            if (typeof value !== 'object' || !value) {
                // non-objects or null return as is
                return value;
            } else if (isArray(value)) {
                return encodeArray(value);
            } else {
                return encodeObject(value);
            }
        }

        return encode(data);
    }
    RJSON.pack = pack;

    /**
    * @param {*} data Packed javascript data.
    * @return {*} Original data.
    */
    function unpack(data) {
        var schemas = {}, maxSchemaIndex = 0;

        function parseArray(value) {
            if (value.length === 0) {
                return [];
            } else if (value[0] === 0 || typeof value[0] !== 'number') {
                return decodeArray(value);
            } else {
                return decodeObject(value);
            }
        }

        function decodeArray(value) {
            var len = value.length, decoded = [];
            for (var i = (value[0] === 0 ? 1 : 0); i < len; i++) {
                var v = value[i], obj = decode(v);
                if (isEncodedObject(v) && isArray(obj)) {
                    // several objects was encoded into single array
                    decoded = decoded.concat(obj);
                } else {
                    decoded.push(obj);
                }
            }
            return decoded;
        }

        function decodeObject(value) {
            var schemaKeys = schemas[value[0]], schemaLen = schemaKeys.length, total = (value.length - 1) / schemaLen, decoded;
            if (total > 1) {
                decoded = []; // array of objects with same schema
                for (var i = 0; i < total; i++) {
                    var obj = {};
                    for (var j = 0, k; k = schemaKeys[j++];) {
                        obj[k] = decode(value[i * schemaLen + j]);
                    }
                    decoded.push(obj);
                }
            } else {
                decoded = {};
                for (var j = 0, k; k = schemaKeys[j++];) {
                    decoded[k] = decode(value[j]);
                }
            }
            return decoded;
        }

        function decodeNewObject(value) {
            var schemaKeys = getKeys(value).sort();
            if (schemaKeys.length === 0) {
                return {};
            }
            schemas[++maxSchemaIndex] = schemaKeys;
            var decoded = {};
            for (var i = 0, k; k = schemaKeys[i++];) {
                decoded[k] = decode(value[k]);
            }
            return decoded;
        }

        function decode(value) {
            if (typeof value !== 'object' || !value) {
                // non-objects or null return as is
                return value;
            } else if (isArray(value)) {
                return parseArray(value);
            } else {
                return decodeNewObject(value);
            }
        }

        return decode(data);
    }
    RJSON.unpack = unpack;

    /**
    * Object is encoded as array and object schema index is stored as
    * first item of the array. Valid schema index should be greater than 0,
    * because 0 is reserved for Array schema.
    * Several objects with same schema can be stored in the one array.
    * @param {*} value encoded value to check.
    * @return {boolean} true if value contains an encoded object or several
    * objects with same schema.
    */
    function isEncodedObject(value) {
        return isArray(value) && typeof value[0] === 'number' && value[0] !== 0;
    }

    function _keys(obj) {
        var keys = [], k;
        for (k in obj) {
            if (hasOwnProperty.call(obj, k)) {
                keys.push(k);
            }
        }
        return keys;
    }

    function _isArray(obj) {
        return toString.apply(obj) === '[object Array]';
    }
})(RJSON || (RJSON = {}));

var md5;
(function (md5) {
    /*
    * A JavaScript implementation of the RSA Data Security, Inc. MD5 Message
    * Digest Algorithm, as defined in RFC 1321.
    * Version 2.2 Copyright (C) Paul Johnston 1999 - 2009
    * Other contributors: Greg Holt, Andrew Kepert, Ydnar, Lostinet
    * Distributed under the BSD License
    * See http://pajhome.org.uk/crypt/md5 for more info.
    */
    /*
    * Configurable variables. You may need to tweak these to be compatible with
    * the server-side, but the defaults work in most cases.
    */
    var hexcase = 0;
    var b64pad = "";

    /*
    * Calculate the MD5 of a raw string
    */
    function Encode(s) {
        return binl2rstr(binl_md5(rstr2binl(s), s.length * 8));
    }
    md5.Encode = Encode;

    function rstr_md5(s) {
        return binl2rstr(binl_md5(rstr2binl(s), s.length * 8));
    }

    /*
    * Convert a raw string to an array of little-endian words
    * Characters >255 have their high-byte silently ignored.
    */
    function rstr2binl(input) {
        var output = Array(input.length >> 2);
        for (var i = 0; i < output.length; i++)
            output[i] = 0;
        for (var i = 0; i < input.length * 8; i += 8)
            output[i >> 5] |= (input.charCodeAt(i / 8) & 0xFF) << (i % 32);
        return output;
    }

    function str2rstr_utf8(input) {
        var output = "";
        var i = -1;
        var x, y;

        while (++i < input.length) {
            /* Decode utf-16 surrogate pairs */
            x = input.charCodeAt(i);
            y = i + 1 < input.length ? input.charCodeAt(i + 1) : 0;
            if (0xD800 <= x && x <= 0xDBFF && 0xDC00 <= y && y <= 0xDFFF) {
                x = 0x10000 + ((x & 0x03FF) << 10) + (y & 0x03FF);
                i++;
            }

            /* Encode output as utf-8 */
            if (x <= 0x7F)
                output += String.fromCharCode(x);
            else if (x <= 0x7FF)
                output += String.fromCharCode(0xC0 | ((x >>> 6) & 0x1F), 0x80 | (x & 0x3F));
            else if (x <= 0xFFFF)
                output += String.fromCharCode(0xE0 | ((x >>> 12) & 0x0F), 0x80 | ((x >>> 6) & 0x3F), 0x80 | (x & 0x3F));
            else if (x <= 0x1FFFFF)
                output += String.fromCharCode(0xF0 | ((x >>> 18) & 0x07), 0x80 | ((x >>> 12) & 0x3F), 0x80 | ((x >>> 6) & 0x3F), 0x80 | (x & 0x3F));
        }
        return output;
    }

    /*
    * Convert an array of little-endian words to a string
    */
    function binl2rstr(input) {
        var output = "";
        for (var i = 0; i < input.length * 32; i += 8)
            output += String.fromCharCode((input[i >> 5] >>> (i % 32)) & 0xFF);
        return output;
    }

    /*
    * Calculate the MD5 of an array of little-endian words, and a bit length.
    */
    function binl_md5(x, len) {
        /* append padding */
        x[len >> 5] |= 0x80 << ((len) % 32);
        x[(((len + 64) >>> 9) << 4) + 14] = len;

        var a = 1732584193;
        var b = -271733879;
        var c = -1732584194;
        var d = 271733878;

        for (var i = 0; i < x.length; i += 16) {
            var olda = a;
            var oldb = b;
            var oldc = c;
            var oldd = d;

            a = md5_ff(a, b, c, d, x[i + 0], 7, -680876936);
            d = md5_ff(d, a, b, c, x[i + 1], 12, -389564586);
            c = md5_ff(c, d, a, b, x[i + 2], 17, 606105819);
            b = md5_ff(b, c, d, a, x[i + 3], 22, -1044525330);
            a = md5_ff(a, b, c, d, x[i + 4], 7, -176418897);
            d = md5_ff(d, a, b, c, x[i + 5], 12, 1200080426);
            c = md5_ff(c, d, a, b, x[i + 6], 17, -1473231341);
            b = md5_ff(b, c, d, a, x[i + 7], 22, -45705983);
            a = md5_ff(a, b, c, d, x[i + 8], 7, 1770035416);
            d = md5_ff(d, a, b, c, x[i + 9], 12, -1958414417);
            c = md5_ff(c, d, a, b, x[i + 10], 17, -42063);
            b = md5_ff(b, c, d, a, x[i + 11], 22, -1990404162);
            a = md5_ff(a, b, c, d, x[i + 12], 7, 1804603682);
            d = md5_ff(d, a, b, c, x[i + 13], 12, -40341101);
            c = md5_ff(c, d, a, b, x[i + 14], 17, -1502002290);
            b = md5_ff(b, c, d, a, x[i + 15], 22, 1236535329);

            a = md5_gg(a, b, c, d, x[i + 1], 5, -165796510);
            d = md5_gg(d, a, b, c, x[i + 6], 9, -1069501632);
            c = md5_gg(c, d, a, b, x[i + 11], 14, 643717713);
            b = md5_gg(b, c, d, a, x[i + 0], 20, -373897302);
            a = md5_gg(a, b, c, d, x[i + 5], 5, -701558691);
            d = md5_gg(d, a, b, c, x[i + 10], 9, 38016083);
            c = md5_gg(c, d, a, b, x[i + 15], 14, -660478335);
            b = md5_gg(b, c, d, a, x[i + 4], 20, -405537848);
            a = md5_gg(a, b, c, d, x[i + 9], 5, 568446438);
            d = md5_gg(d, a, b, c, x[i + 14], 9, -1019803690);
            c = md5_gg(c, d, a, b, x[i + 3], 14, -187363961);
            b = md5_gg(b, c, d, a, x[i + 8], 20, 1163531501);
            a = md5_gg(a, b, c, d, x[i + 13], 5, -1444681467);
            d = md5_gg(d, a, b, c, x[i + 2], 9, -51403784);
            c = md5_gg(c, d, a, b, x[i + 7], 14, 1735328473);
            b = md5_gg(b, c, d, a, x[i + 12], 20, -1926607734);

            a = md5_hh(a, b, c, d, x[i + 5], 4, -378558);
            d = md5_hh(d, a, b, c, x[i + 8], 11, -2022574463);
            c = md5_hh(c, d, a, b, x[i + 11], 16, 1839030562);
            b = md5_hh(b, c, d, a, x[i + 14], 23, -35309556);
            a = md5_hh(a, b, c, d, x[i + 1], 4, -1530992060);
            d = md5_hh(d, a, b, c, x[i + 4], 11, 1272893353);
            c = md5_hh(c, d, a, b, x[i + 7], 16, -155497632);
            b = md5_hh(b, c, d, a, x[i + 10], 23, -1094730640);
            a = md5_hh(a, b, c, d, x[i + 13], 4, 681279174);
            d = md5_hh(d, a, b, c, x[i + 0], 11, -358537222);
            c = md5_hh(c, d, a, b, x[i + 3], 16, -722521979);
            b = md5_hh(b, c, d, a, x[i + 6], 23, 76029189);
            a = md5_hh(a, b, c, d, x[i + 9], 4, -640364487);
            d = md5_hh(d, a, b, c, x[i + 12], 11, -421815835);
            c = md5_hh(c, d, a, b, x[i + 15], 16, 530742520);
            b = md5_hh(b, c, d, a, x[i + 2], 23, -995338651);

            a = md5_ii(a, b, c, d, x[i + 0], 6, -198630844);
            d = md5_ii(d, a, b, c, x[i + 7], 10, 1126891415);
            c = md5_ii(c, d, a, b, x[i + 14], 15, -1416354905);
            b = md5_ii(b, c, d, a, x[i + 5], 21, -57434055);
            a = md5_ii(a, b, c, d, x[i + 12], 6, 1700485571);
            d = md5_ii(d, a, b, c, x[i + 3], 10, -1894986606);
            c = md5_ii(c, d, a, b, x[i + 10], 15, -1051523);
            b = md5_ii(b, c, d, a, x[i + 1], 21, -2054922799);
            a = md5_ii(a, b, c, d, x[i + 8], 6, 1873313359);
            d = md5_ii(d, a, b, c, x[i + 15], 10, -30611744);
            c = md5_ii(c, d, a, b, x[i + 6], 15, -1560198380);
            b = md5_ii(b, c, d, a, x[i + 13], 21, 1309151649);
            a = md5_ii(a, b, c, d, x[i + 4], 6, -145523070);
            d = md5_ii(d, a, b, c, x[i + 11], 10, -1120210379);
            c = md5_ii(c, d, a, b, x[i + 2], 15, 718787259);
            b = md5_ii(b, c, d, a, x[i + 9], 21, -343485551);

            a = safe_add(a, olda);
            b = safe_add(b, oldb);
            c = safe_add(c, oldc);
            d = safe_add(d, oldd);
        }
        return Array(a, b, c, d);
    }

    /*
    * These functions implement the four basic operations the algorithm uses.
    */
    function md5_cmn(q, a, b, x, s, t) {
        return safe_add(bit_rol(safe_add(safe_add(a, q), safe_add(x, t)), s), b);
    }
    function md5_ff(a, b, c, d, x, s, t) {
        return md5_cmn((b & c) | ((~b) & d), a, b, x, s, t);
    }
    function md5_gg(a, b, c, d, x, s, t) {
        return md5_cmn((b & d) | (c & (~d)), a, b, x, s, t);
    }
    function md5_hh(a, b, c, d, x, s, t) {
        return md5_cmn(b ^ c ^ d, a, b, x, s, t);
    }
    function md5_ii(a, b, c, d, x, s, t) {
        return md5_cmn(c ^ (b | (~d)), a, b, x, s, t);
    }

    /*
    * Add integers, wrapping at 2^32. This uses 16-bit operations internally
    * to work around bugs in some JS interpreters.
    */
    function safe_add(x, y) {
        var lsw = (x & 0xFFFF) + (y & 0xFFFF);
        var msw = (x >> 16) + (y >> 16) + (lsw >> 16);
        return (msw << 16) | (lsw & 0xFFFF);
    }

    /*
    * Bitwise rotate a 32-bit number to the left.
    */
    function bit_rol(num, cnt) {
        return (num << cnt) | (num >>> (32 - cnt));
    }
})(md5 || (md5 = {}));

//https://raw.github.com/bestiejs/punycode.js/master/punycode.js
var punycode;
(function (_punycode) {
    /**
    * The `punycode` object.
    * @name punycode
    * @type Object
    */
    var punycode, maxInt = 2147483647, base = 36, tMin = 1, tMax = 26, skew = 38, damp = 700, initialBias = 72, initialN = 128, delimiter = '-', regexPunycode = /^xn--/, regexNonASCII = /[^ -~]/, regexSeparators = /\x2E|\u3002|\uFF0E|\uFF61/g, errors = {
        'overflow': 'Overflow: input needs wider integers to process',
        'not-basic': 'Illegal input >= 0x80 (not a basic code point)',
        'invalid-input': 'Invalid input'
    }, baseMinusTMin = base - tMin, floor = Math.floor, stringFromCharCode = String.fromCharCode, key;

    /*--------------------------------------------------------------------------*/
    /**
    * A generic error utility function.
    * @private
    * @param {String} type The error type.
    * @returns {Error} Throws a `RangeError` with the applicable error message.
    */
    function error(type) {
        throw RangeError(errors[type]);
    }

    /**
    * A generic `Array#map` utility function.
    * @private
    * @param {Array} array The array to iterate over.
    * @param {Function} callback The function that gets called for every array
    * item.
    * @returns {Array} A new array of values returned by the callback function.
    */
    function map(array, fn) {
        var length = array.length;
        while (length--) {
            array[length] = fn(array[length]);
        }
        return array;
    }

    /**
    * A simple `Array#map`-like wrapper to work with domain name strings.
    * @private
    * @param {String} domain The domain name.
    * @param {Function} callback The function that gets called for every
    * character.
    * @returns {Array} A new string of characters returned by the callback
    * function.
    */
    function mapDomain(string, fn) {
        return map(string.split(regexSeparators), fn).join('.');
    }

    /**
    * Creates an array containing the numeric code points of each Unicode
    * character in the string. While JavaScript uses UCS-2 internally,
    * this function will convert a pair of surrogate halves (each of which
    * UCS-2 exposes as separate characters) into a single code point,
    * matching UTF-16.
    * @see `punycode.ucs2.encode`
    * @see <http://mathiasbynens.be/notes/javascript-encoding>
    * @memberOf punycode.ucs2
    * @name decode
    * @param {String} string The Unicode input string (UCS-2).
    * @returns {Array} The new array of code points.
    */
    function ucs2decode(string) {
        var output = [], counter = 0, length = string.length, value, extra;
        while (counter < length) {
            value = string.charCodeAt(counter++);
            if ((value & 0xF800) == 0xD800 && counter < length) {
                // high surrogate, and there is a next character
                extra = string.charCodeAt(counter++);
                if ((extra & 0xFC00) == 0xDC00) {
                    output.push(((value & 0x3FF) << 10) + (extra & 0x3FF) + 0x10000);
                } else {
                    output.push(value, extra);
                }
            } else {
                output.push(value);
            }
        }
        return output;
    }

    /**
    * Creates a string based on an array of numeric code points.
    * @see `punycode.ucs2.decode`
    * @memberOf punycode.ucs2
    * @name encode
    * @param {Array} codePoints The array of numeric code points.
    * @returns {String} The new Unicode string (UCS-2).
    */
    function ucs2encode(array) {
        return map(array, function (value) {
            var output = '';
            if (value > 0xFFFF) {
                value -= 0x10000;
                output += stringFromCharCode(value >>> 10 & 0x3FF | 0xD800);
                value = 0xDC00 | value & 0x3FF;
            }
            output += stringFromCharCode(value);
            return output;
        }).join('');
    }

    /**
    * Converts a basic code point into a digit/integer.
    * @see `digitToBasic()`
    * @private
    * @param {Number} codePoint The basic numeric code point value.
    * @returns {Number} The numeric value of a basic code point (for use in
    * representing integers) in the range `0` to `base - 1`, or `base` if
    * the code point does not represent a value.
    */
    function basicToDigit(codePoint) {
        if (codePoint - 48 < 10) {
            return codePoint - 22;
        }
        if (codePoint - 65 < 26) {
            return codePoint - 65;
        }
        if (codePoint - 97 < 26) {
            return codePoint - 97;
        }
        return base;
    }

    /**
    * Converts a digit/integer into a basic code point.
    * @see `basicToDigit()`
    * @private
    * @param {Number} digit The numeric value of a basic code point.
    * @returns {Number} The basic code point whose value (when used for
    * representing integers) is `digit`, which needs to be in the range
    * `0` to `base - 1`. If `flag` is non-zero, the uppercase form is
    * used; else, the lowercase form is used. The behavior is undefined
    * if `flag` is non-zero and `digit` has no uppercase form.
    */
    function digitToBasic(digit, flag) {
        //  0..25 map to ASCII a..z or A..Z
        // 26..35 map to ASCII 0..9
        var dig = digit < 26 ? 75 : 0;
        var flag = flag != 0 ? flag << 5 : 0;
        return digit + 22 + dig - flag;
    }

    /**
    * Bias adaptation function as per section 3.4 of RFC 3492.
    * http://tools.ietf.org/html/rfc3492#section-3.4
    * @private
    */
    function adapt(delta, numPoints, firstTime) {
        var k = 0;
        delta = firstTime ? floor(delta / damp) : delta >> 1;
        delta += floor(delta / numPoints);
        for (; delta > baseMinusTMin * tMax >> 1; k += base) {
            delta = floor(delta / baseMinusTMin);
        }
        return floor(k + (baseMinusTMin + 1) * delta / (delta + skew));
    }

    /**
    * Converts a Punycode string of ASCII-only symbols to a string of Unicode
    * symbols.
    * @memberOf punycode
    * @param {String} input The Punycode string of ASCII-only symbols.
    * @returns {String} The resulting string of Unicode symbols.
    */
    function decode(input) {
        // Don't use UCS-2
        var output = [], inputLength = input.length, out, i = 0, n = initialN, bias = initialBias, basic, j, index, oldi, w, k, digit, t, length, baseMinusT;

        // Handle the basic code points: let `basic` be the number of input code
        // points before the last delimiter, or `0` if there is none, then copy
        // the first basic code points to the output.
        basic = input.lastIndexOf(delimiter);
        if (basic < 0) {
            basic = 0;
        }

        for (j = 0; j < basic; ++j) {
            // if it's not a basic code point
            if (input.charCodeAt(j) >= 0x80) {
                error('not-basic');
            }
            output.push(input.charCodeAt(j));
        }

        for (index = basic > 0 ? basic + 1 : 0; index < inputLength;) {
            for (oldi = i, w = 1, k = base; ; k += base) {
                if (index >= inputLength) {
                    error('invalid-input');
                }

                digit = basicToDigit(input.charCodeAt(index++));

                if (digit >= base || digit > floor((maxInt - i) / w)) {
                    error('overflow');
                }

                i += digit * w;
                t = k <= bias ? tMin : (k >= bias + tMax ? tMax : k - bias);

                if (digit < t) {
                    break;
                }

                baseMinusT = base - t;
                if (w > floor(maxInt / baseMinusT)) {
                    error('overflow');
                }

                w *= baseMinusT;
            }

            out = output.length + 1;
            bias = adapt(i - oldi, out, oldi == 0);

            // `i` was supposed to wrap around from `out` to `0`,
            // incrementing `n` each time, so we'll fix that now:
            if (floor(i / out) > maxInt - n) {
                error('overflow');
            }

            n += floor(i / out);
            i %= out;

            // Insert `n` at position `i` of the output
            output.splice(i++, 0, n);
        }

        return ucs2encode(output);
    }
    _punycode.decode = decode;

    /**
    * Converts a string of Unicode symbols to a Punycode string of ASCII-only
    * symbols.
    * @memberOf punycode
    * @param {String} input The string of Unicode symbols.
    * @returns {String} The resulting Punycode string of ASCII-only symbols.
    */
    function encode(input) {
        var n, delta, handledCPCount, basicLength, bias, j, m, q, k, t, currentValue, output = [], inputLength, handledCPCountPlusOne, baseMinusT, qMinusT;

        // Convert the input in UCS-2 to Unicode
        input = ucs2decode(input);

        // Cache the length
        inputLength = input.length;

        // Initialize the state
        n = initialN;
        delta = 0;
        bias = initialBias;

        for (j = 0; j < inputLength; ++j) {
            currentValue = input[j];
            if (currentValue < 0x80) {
                output.push(stringFromCharCode(currentValue));
            }
        }

        handledCPCount = basicLength = output.length;

        // `handledCPCount` is the number of code points that have been handled;
        // `basicLength` is the number of basic code points.
        // Finish the basic string - if it is not empty - with a delimiter
        if (basicLength) {
            output.push(delimiter);
        }

        while (handledCPCount < inputLength) {
            for (m = maxInt, j = 0; j < inputLength; ++j) {
                currentValue = input[j];
                if (currentValue >= n && currentValue < m) {
                    m = currentValue;
                }
            }

            // Increase `delta` enough to advance the decoder's <n,i> state to <m,0>,
            // but guard against overflow
            handledCPCountPlusOne = handledCPCount + 1;
            if (m - n > floor((maxInt - delta) / handledCPCountPlusOne)) {
                error('overflow');
            }

            delta += (m - n) * handledCPCountPlusOne;
            n = m;

            for (j = 0; j < inputLength; ++j) {
                currentValue = input[j];

                if (currentValue < n && ++delta > maxInt) {
                    error('overflow');
                }

                if (currentValue == n) {
                    for (q = delta, k = base; ; k += base) {
                        t = k <= bias ? tMin : (k >= bias + tMax ? tMax : k - bias);
                        if (q < t) {
                            break;
                        }
                        qMinusT = q - t;
                        baseMinusT = base - t;
                        output.push(stringFromCharCode(digitToBasic(t + qMinusT % baseMinusT, 0)));
                        q = floor(qMinusT / baseMinusT);
                    }

                    output.push(stringFromCharCode(digitToBasic(q, 0)));
                    bias = adapt(delta, handledCPCountPlusOne, handledCPCount == basicLength);
                    delta = 0;
                    ++handledCPCount;
                }
            }

            ++delta;
            ++n;
        }
        return output.join('');
    }
    _punycode.encode = encode;

    /**
    * Converts a Punycode string representing a domain name to Unicode. Only the
    * Punycoded parts of the domain name will be converted, i.e. it doesn't
    * matter if you call it on a string that has already been converted to
    * Unicode.
    * @memberOf punycode
    * @param {String} domain The Punycode domain name to convert to Unicode.
    * @returns {String} The Unicode representation of the given Punycode
    * string.
    */
    function toUnicode(domain) {
        return mapDomain(domain, function (string) {
            return regexPunycode.test(string) ? decode(string.slice(4).toLowerCase()) : string;
        });
    }
    _punycode.toUnicode = toUnicode;

    /**
    * Converts a Unicode string representing a domain name to Punycode. Only the
    * non-ASCII parts of the domain name will be converted, i.e. it doesn't
    * matter if you call it with a domain that's already in ASCII.
    * @memberOf punycode
    * @param {String} domain The domain name to convert, as a Unicode string.
    * @returns {String} The Punycode representation of the given domain name.
    */
    function toASCII(domain) {
        return mapDomain(domain, function (string) {
            return regexNonASCII.test(string) ? 'xn--' + encode(string) : string;
        });
    }
    _punycode.toASCII = toASCII;
})(punycode || (punycode = {}));


//module prods {
//export var Items: schools.root[] = null; //info o vsech dostupnych produktech
//export var Crs2RwMap: Rew.Crs2RwMapItem[] = null; //prirazeni rewise lekci k lekcim kurzu, Crs2RwMap[<lesson jsonId>] = Rew.Crs2RwMapItem
//export var all: CourseMeta.data[] = null; //info o vsech dostupnych produktech
//export function init(completed: () => void): void {
//  CourseMeta.lib.adjustAllProductList(completed);
//  //return;
//  //var pth = Pager.filePath(Pager.pathType.sitemapRoot, null).url;
//  //var pthCrs2Rew = Pager.filePath(Pager.pathType.course2rewiseMap, null, Trados.actLangCode).urlLoc;
//  //schools.readAppData(pth, res => {
//  //  var obj = JSON.parse(res); Items = RJSON.unpack(obj);
//  //  completed();
//  //  /*if (cfg.target != LMComLib.Targets.web) { completed(); return; }
//  //  schools.readAppData(pthCrs2Rew, resCrs2Rew => {
//  //    obj = JSON.parse(resCrs2Rew); Crs2RwMap = RJSON.unpack(obj);
//  //    completed();
//  //  });*/
//  //});
//}
//export function get(productId: string): schools.root {
//  return _.find(Items, prod => prod.url == productId);
//}
//export function findProduct(productId: string): CourseMeta.data {
//  return _.find(CourseMeta.allProductList, prod => prod.url == productId);
//}
//export function rewLessonId(jsonId: string): number {
//  if (!Crs2RwMap) return 0;
//  var map: Rew.Crs2RwMapItem = Crs2RwMap[jsonId];
//  return map ? map.rwId : 0;
//}
////k lekci zadanou jsonId vrati staticka data rewise lekce
//export function getRewLesson(jsonId: string, completed: (l: Rew.LessonDataSrc) => void ): void {
//  if (!Crs2RwMap) { completed(null); return; }
//  var crs2Rew: Rew.Crs2RwMapItem = Crs2RwMap[jsonId];
//  if (!crs2Rew) { completed(null); return; }
//  var lng = crs2Rew.locRatioPromile > 100 ? Trados.actLangCode : "no";
//  var pth = Pager.filePath(Pager.pathType.rewiseLesson, crs2Rew.rwId.toString(), lng).urlLoc;
//  schools.readAppData(pth, rewLessStr => {
//    var obj = JSON.parse(rewLessStr); var res: Rew.LessonDataSrc = RJSON.unpack(obj);
//    completed(res);
//  });
//}
//export function lineTxt(productId: string): string {
//  return LowUtils.EnumToString(LMComLib.LineIds, CourseMeta.lib.findProduct(productId).line);
//}
//export function read(productId: string, completed: (crsTree: schools.root) => void) {
//  schools.readAppDataAndLoc(
//    //Pager.filePath(Pager.pathType.sitemaps, get(productId).fileName, Trados.actLangCode),
//    Pager.filePath(Pager.pathType.sitemaps, productId, Trados.actLangCode),
//    (d, l) => completed(Trados.localizeObject(d, JSON.parse(l), true)));
//}
//export function read2(productId: string, completed: (prod: CourseMeta.product) => void) {
//  CourseMeta.lib.adjustProduct(productId, () => completed(CourseMeta.actProduct));
//}
//export function readDict(completed: (dicts: LMComLib.Dict[]) => void ) {
//  var pth = Pager.filePath(Pager.pathType.dictInfo, null).url;
//  schools.readAppData(pth, res => {
//    var obj = JSON.parse(res);
//    completed(RJSON.unpack(obj));
//  });
//}
//$.views.helpers({
//  productLineTxt: CourseMeta.lib.productLineTxt,
//  productLineTxtLower: (productId) => CourseMeta.lib.productLineTxt(productId).toLowerCase(),
//});
//}

var schools;
(function (schools) {
    var TopBarModel = (function () {
        function TopBarModel(model) {
            this.model = model;
            this.title = ko.observable('');
            this.suplCtxtGrammar = ko.observable(false);
            this.suplGrammarIcon = ko.observable(true);
            this.exerciseEvaluated = ko.observable(false);
            this.score = ko.observable(null);
            var self = this;
            this.grammarClick = function () {
                return CourseMeta.gui.gotoData(CourseMeta.actGrammar);
            };
            if (this.needsLogin())
                LMStatus.setReturnUrl();
        }
        TopBarModel.prototype.is = function () {
            var _this = this;
            var typeNames = [];
            for (var _i = 0; _i < (arguments.length - 0); _i++) {
                typeNames[_i] = arguments[_i + 0];
            }
            return _.find(typeNames, function (t) {
                return t == _this.model.type;
            }) != null;
        };

        //title
        TopBarModel.prototype.isTitle = function () {
            return this.is(schools.tTest);
        };

        //logo
        TopBarModel.prototype.logoBig = function () {
            return !this.logoSmall() && !this.is(schools.tEx);
        };
        TopBarModel.prototype.logoSmall = function () {
            return this.is(schools.tCourseMeta, schools.tCoursePretest, schools.tGrammFolder, schools.tGrammPage, schools.tGrammContent, schools.tDictInfo, schools.tTest);
        };

        TopBarModel.prototype.greenArrow = function () {
            return !this.needsLogin() && this.is(schools.tCourseMeta, schools.tCoursePretest, schools.tEx);
        };

        TopBarModel.prototype.phoneMore = function () {
            return !this.needsLogin() && this.is(schools.tMy) ? "#collapse-logout" : null;
        };

        //login x logout x profile
        TopBarModel.prototype.logoutAndProfile = function () {
            return this.isWeb() && !this.needsLogin() && this.is(schools.tMy);
        };
        TopBarModel.prototype.needsLogin = function () {
            return this.isWeb() && !LMStatus.isLogged();
        };
        TopBarModel.prototype.loginUrl = function () {
            return !this.needsLogin() ? null : "#" + Login.getHash(Login.pageLogin);
        };
        TopBarModel.prototype.isWeb = function () {
            return cfg.target == 0 /* web */;
        };

        //supplements
        TopBarModel.prototype.hasSupl = function () {
            return true;
        };

        //suplGrammarLink(): boolean { return !this.needsLogin() && this.is(tCourseMeta, tCourse, tLess, tMod, tEx) && schools.data.crsStatic2.grammar != null; } //pro ne-phone: staticka podminka na nekontextovou gramatika
        TopBarModel.prototype.suplGrammarLink = function () {
            return !this.needsLogin() && this.is(schools.tCourseMeta, schools.tEx) && CourseMeta.actGrammar != null;
        };
        TopBarModel.prototype.suplDict = function () {
            return !this.needsLogin() && this.is(schools.tEx, schools.tGrammPage) && DictConnector.actDictData != null; /*cfg.dictType!=schools.dictTypes.no;*/ 
        };
        TopBarModel.prototype.suplEval = function () {
            return !this.needsLogin() && this.is(schools.tEx);
        };
        TopBarModel.prototype.resetClick = function () {
            CourseMeta.actEx.reset();
        };
        TopBarModel.prototype.dictClick = function () {
            LMStatus.setReturnUrlAndGoto(schools.createDictIntroUrl());
        };

        TopBarModel.prototype.suplInstr = function () {
            return !this.needsLogin() && this.is(schools.tEx);
        };
        TopBarModel.prototype.suplVocabulary = function () {
            return false;
            //if (!cfg.vocabulary || !this.is(tLess, tMod, tEx)) return false;
            //var lesJson = this.model.myLessonjsonId(); if (lesJson == null) return false;
            //var id = prods.rewLessonId(lesJson); if (id == 0) return false;
            //return true;
        };
        TopBarModel.prototype.vocabularyClick = function () {
            alert("vocabularyClick");
        };

        TopBarModel.prototype.suplBreadcrumb = function () {
            return !this.needsLogin() && this.is(schools.tEx);
        };

        //navrat do kurzu pro supplements
        TopBarModel.prototype.backToCourse = function () {
            return this.is(schools.tDictInfo, schools.tGrammFolder, schools.tGrammPage, schools.tGrammContent, (typeof schoolAdmin == 'undefined' ? '' : schoolAdmin.schoolUserResultsTypeName)) && LMStatus.isReturnUrl();
        };
        TopBarModel.prototype.backToCourseClick = function () {
            LMStatus.gotoReturnUrl();
        };
        return TopBarModel;
    })();
    schools.TopBarModel = TopBarModel;
})(schools || (schools = {}));

var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var schools;
(function (schools) {
    schools.tMy = "schoolMyModel".toLowerCase();
    schools.tCourseMeta = "schoolCourseMetaModel".toLowerCase();
    schools.tCoursePretest = "schoolCoursePretestModel".toLowerCase();
    schools.tExCpv = "cpv_exercise";
    schools.tDictCpv = "cpv_dict";
    schools.tMediaCpv = "cpv_media";
    schools.tEx = "schoolExModel".toLowerCase();
    schools.tGrammFolder = "schoolGrammModel".toLowerCase();
    schools.tGrammPage = "schoolGrammPageModel".toLowerCase();
    schools.tGrammContent = "schoolGrammContentModel".toLowerCase();
    schools.tDictInfo = "schoolDictInfoModel".toLowerCase();
    schools.tTest = "schoolTestModel".toLowerCase();

    function getHash(type, companyId, productUrl, url) {
        return [schools.appId, type, companyId.toString(), productUrl, url].join('@');
    }
    schools.getHash = getHash;

    function InitModel(compl) {
        Logger.traceMsg('Model.InitModel');

        var completed = function () {
            Logger.traceMsg('Model.InitModel completed');
            boot.minInit();

            //$('body').addClass(Trados.actLangCode);
            //if (cfg.designId) $('body').addClass("design-" + cfg.designId);
            //if (Trados.isRtl) $('body').addClass("rtl-able");
            compl();
        };

        var initHash = function (hash) {
            Pager.initHash = _.isEmpty(cfg.hash) ? hash : cfg.hash;
        };
        switch (cfg.target) {
            case 4 /* author */:
                CourseMeta.persist = persistMemory.persistCourse;

                //var search = LowUtils.parseQuery(location.search);
                //CourseMeta.forceEval = search != null && search["forceeval"] == "true";
                Trados.adjustLoc(function () {
                    var cook = LMComLib.LMCookieJS_Create(scormCompanyId, null, "id", null, 4 /* Moodle */, "id", "firstName", "lastName", null);
                    LMStatus.setCookie(cook, false);
                    LMStatus.Cookie = cook;
                    initHash(getHash(schools.tCourseMeta, scormCompanyId, cfg.rootProductId, null));
                    completed();
                });
                break;
            case 2 /* scorm */:
                switch (cfg.persistType) {
                    case 2 /* persistScormEx */:
                        CourseMeta.persist = persistScormEx.persistCourse;
                        Trados.adjustLoc(function () {
                            scorm.init(function (compHost, id, firstName, lastName, isFirstEnter) {
                                var cook = LMComLib.LMCookieJS_Create(scormCompanyId, null, id, null, 4 /* Moodle */, id, firstName, lastName, null);
                                LMStatus.setCookie(cook, false);
                                LMStatus.Cookie = cook;
                                initHash(getHash(schools.tCourseMeta, scormCompanyId, cfg.rootProductId, null));
                                CourseMeta.lib.adjustAllProductList(function () {
                                    if (cfg.licenceConfig && cfg.licenceConfig.isDynamic)
                                        boot.loadCourseJS(completed);
                                    else
                                        completed();
                                });
                            });
                        });
                        break;
                    case 4 /* persistMemory */:
                        CourseMeta.persist = persistMemory.persistCourse;
                        Trados.adjustLoc(function () {
                            //scorm.initDummy();
                            var cook = LMComLib.LMCookieJS_Create(scormCompanyId, null, "id", null, 4 /* Moodle */, "id", "firstName", "lastName", null);
                            LMStatus.setCookie(cook, false);
                            LMStatus.Cookie = cook;
                            initHash(getHash(schools.tCourseMeta, scormCompanyId, cfg.rootProductId, null));
                            CourseMeta.lib.adjustAllProductList(completed);
                        });
                        break;
                    default:
                        CourseMeta.persist = persistNewEA.persistCourse;
                        Trados.adjustLoc(function () {
                            scorm.init(function (compHost, id, firstName, lastName, isFirstEnter) {
                                Pager.ajaxGet(1 /* restServices */, Login.CmdAdjustScormUser_Type, Login.CmdAdjustScormUser_Create(compHost, id, firstName, lastName, isFirstEnter, cfg.rootProductId), function (res) {
                                    LMStatus.setCookie(res.Cookie, false);
                                    LMStatus.Cookie = res.Cookie;
                                    setTimeout(LMStatus.loggedBodyClass, 1);
                                    initHash(getHash(schools.tCourseMeta, res.companyId, cfg.rootProductId, null));
                                    CourseMeta.lib.adjustAllProductList(completed);
                                });
                            });
                        });
                        break;
                }
                break;

            case 0 /* web */:
                switch (cfg.persistType) {
                    case 2 /* persistScormEx */:
                        CourseMeta.persist = persistScormEx.persistCourse;
                        Trados.adjustLoc(function () {
                            initHash(getHash(schools.tCourseMeta, scormCompanyId, cfg.rootProductId, null));
                            LMStatus.adjustLoggin(function () {
                                return CourseMeta.lib.adjustAllProductList(completed);
                            });
                        });
                        break;
                    case 4 /* persistMemory */:
                        LMStatus.Cookie = offlineCookie;
                        CourseMeta.persist = persistMemory.persistCourse;
                        Trados.adjustLoc(function () {
                            initHash(getHash(schools.tCourseMeta, scormCompanyId, cfg.rootProductId, null));
                            LMStatus.adjustLoggin(function () {
                                return CourseMeta.lib.adjustAllProductList(completed);
                            });
                        });
                        break;
                    default:
                        CourseMeta.persist = persistNewEA.persistCourse;
                        Trados.adjustLoc(function () {
                            initHash(Gui2.skin.instance.getLoginHome(Login.getHash(Login.pageLogin)));
                            Pager.afterLoginInit = function (completed) {
                                Logger.traceMsg('Model.InitModel afterLoginInit');
                                Pager.initHash = getHash(schools.tMy, -1, null, null);
                                if (cfg.licenceConfig && cfg.licenceConfig.isDynamic)
                                    boot.loadCourseJS(completed);
                                else
                                    completed();
                            };
                            LMStatus.adjustLoggin(function () {
                                return CourseMeta.lib.adjustAllProductList(completed);
                            });
                        });
                        break;
                }
                break;
            default:
                throw "not implemented";
        }
    }
    schools.InitModel = InitModel;
    var scormCompanyId = 0x4FFFFFFF - 1;

    function LMComUserId() {
        return !LMStatus.isLogged() ? -1 : LMStatus.Cookie.id;
    }
    schools.LMComUserId = LMComUserId;

    function homeTitle() {
        return CSLocalize('5c4e78c9f3884816a78d1d4d9fe1f458', 'My Online Courses and Tests');
    }
    schools.homeTitle = homeTitle;

    var RootModel = (function (_super) {
        __extends(RootModel, _super);
        function RootModel() {
            _super.apply(this, arguments);
        }
        RootModel.prototype.pageChanged = function (oldPg, newPg) {
            if (oldPg == null || newPg == null)
                return;
            var crsTypes = [schools.tEx, schools.tTest, schools.tMy, schools.tCourseMeta];
            if (_.any(crsTypes, function (t) {
                return newPg.type == t;
            }))
                LMStatus.clearReturnUrl(); //navrat do kurzu, posledni kurz Url
            if (_.any(crsTypes, function (t) {
                return oldPg.type == t;
            }))
                LMStatus.setReturnUrl(oldPg.getHash()); //skok z kurzu, zapamatuj si posledni kurz Url
        };
        RootModel.prototype.loaded = function () {
            CourseMeta.lib.finishHtmlDOM(); //uprav anchory (click event z href)
            $(window).trigger("resize"); //nektere komponenty, napr. progress bar, potrebuji pri resize inicializovat
        };
        return RootModel;
    })(Pager.ViewModelRoot);
    schools.RootModel = RootModel;

    Pager.rootVM = new RootModel();

    var Model = (function (_super) {
        __extends(Model, _super);
        function Model(typeName, urlParts /*companyId: number, productUrl: string, url: string*/ ) {
            _super.call(this, schools.appId, typeName, urlParts);
            CourseMeta.actCompanyId = this.copmanyId = urlParts && urlParts.length >= 1 ? parseInt(urlParts[0]) : -1;
            this.productUrl = urlParts && urlParts.length >= 2 ? urlParts[1] : null;
            this.url = urlParts && urlParts.length >= 3 ? urlParts[2] : null;
            DictConnector.actDictData = null;
            this.tb = new schools.TopBarModel(this);
        }
        Model.prototype.hasBreadcrumb = function () {
            return false;
        };

        Model.prototype.update = function (completed) {
            SndLow.Stop();
            if (!LMStatus.isLogged()) {
                completed();
                return;
            }
            this.doUpdate(completed);
        };
        Model.prototype.doUpdate = function (completed) {
            completed();
        };

        Model.prototype.hasLogin = function () {
            return cfg.target == 0 /* web */;
        };
        Model.prototype.title = function () {
            return homeTitle();
        };
        Model.prototype.iconId = function () {
            return '';
        };
        Model.prototype.breadcrumbs = function () {
            return [];
        };
        return Model;
    })(Pager.Page);
    schools.Model = Model;

    var offlineCompanyId = 0x4FFFFFFF;
    var offlineCookie = { id: 0x4FFFFFFF, EMail: null, Login: "localUser", LoginEMail: null, Type: 0, TypeId: null, FirstName: null, LastName: null, Company: null };

    function createGrammUrl(type, url) {
        return getHash(type, CourseMeta.actCompanyId, CourseMeta.actProduct.url, url);
    }
    schools.createGrammUrl = createGrammUrl;
    function createDictIntroUrl() {
        return getHash(schools.tDictInfo, 0, '', '');
    }
    schools.createDictIntroUrl = createDictIntroUrl;
    function createHomeUrlStd() {
        return false ? getHash(schools.tCourseMeta, CourseMeta.actCompanyId, CourseMeta.actProduct.url, "") : getHash(schools.tMy, -1, null, null);
    }
    schools.createHomeUrlStd = createHomeUrlStd;
})(schools || (schools = {}));

///#DEBUG
function fake() {
    CSLocalize('0cf19a3b455d40828295252fb0a321b7', 'Assessment test for Beginners');
    CSLocalize('1d2a3c242b284bca9259b776852b0b9a', 'Assessment test for Advanced');
    CSLocalize('1eb1c7d6e2184db88ce765cdc2ab2efa', 'Assessment test for Advanced');
    CSLocalize('22562c9261a844319eeb5b604bfded79', 'chapters');
    CSLocalize('2d31eeae1c5d483db53452f07d20e0d9', 'Your answers are not all correct. Do you really want to evaluate the exercise?');
    CSLocalize('2ee8666492594108b4ac42d5900f1e2e', 'Congratulations! You have completed the questionnaire. We recommend you do the');
    CSLocalize('2fb0c828db9141ca9dcf0890e3256a51', 'Do you really want to remove this chapter from the learning process?');
    CSLocalize('2fdca34d83c342c6bdf8f99ed718f8be', 'Assessment test for Pre-intermediate');
    CSLocalize('324ea9db901844619d3d1de5d05293fd', 'Assessment test for Beginners');
    CSLocalize('344390c563454f23baea0758357cd6bf', 'Congratulations! You have completed the questionnaire. We recommend you do the');
    CSLocalize('3b2515a8ef6540feb9aa61ba57223ce5', 'Assessment test for Pre-intermediate');
    CSLocalize('3b473d38d79342a18501f9401b734eb6', 'Congratulations! You have completed the chapter.');
    CSLocalize('3de6029a9178476b8bb5b620a31cc546', 'Assessment test for Beginners');
    CSLocalize('43073e32fb5c4ee08d247e501c45a3df', 'Congratulations! You have completed the entrance test.');
    CSLocalize('4b7b50da82224dac90931a97fa8b4bd2', 'The test is not completed, do you really wish to interrupt it? Note: Your results will be saved anyway.');
    CSLocalize('4e20b0cbab9f42508ee43c7f236eb061', 'Congratulations! You have completed the questionnaire. We recommend you do the');
    CSLocalize('58507bbcbd8144caa48d2742ae906200', 'Finished:');
    CSLocalize('5ac28df92076478d93e8913ea2c2b6b9', 'Assessment test for Beginners');
    CSLocalize('6c18d525496449aea1095bc4d51a3071', 'The test is not completed, do you really wish to interrupt it? Note: Your results will be saved anyway.');
    CSLocalize('6ca45688007e4d2cbb6337be6121c148', 'Score');
    CSLocalize('71661be93a204b0398c4628f52611b46', 'done');
    CSLocalize('781a102bcc5041c583e7481d9b24a3d3', 'Assessment test for Beginners');
    CSLocalize('7e1cd46186014c21b971f869981dfff4', 'Do you really want to set the starting point of your study to the chapter');
    CSLocalize('825d0d1d7d014d84a8c00f767bd18f69', 'Congratulations! You have completed the chapter.');
    CSLocalize('863ecfa04f0d438ba29f4d9f570bd523', 'Score:');
    CSLocalize('8d9a5fde99a44f0d8e0012c43b9e2a98', 'Assessment test for Advanced');
    CSLocalize('8e457cd200f44e67bb943f27c20a3b8f', 'Score');
    CSLocalize('90e3f558723446fe9e70f5acfb8eb502', 'The test is not completed, do you really wish to interrupt it? Note: Your results will be saved anyway.');
    CSLocalize('9ce505e50f954a72a64921f397eb1a1e', 'Congratulations! You have completed the questionnaire. We recommend you do the');
    CSLocalize('a988706addc34fb9b23bb8ccde488bec', 'For a better assessment of your language knowledge you will get');
    CSLocalize('b6652a077fb0401faebb8c283e4b8117', 'Congratulations! You have completed the questionnaire. We recommend you do the');
    CSLocalize('b933199b227a4239b27e4ba75a4a2035', 'The test is not completed, do you really wish to interrupt it? Note: Your results will be saved anyway.');
    CSLocalize('c97bd8fbd7434033adb520be906efb6e', 'Assessment test for Advanced');
    CSLocalize('cf1af1547fdf4219b0a5d5f20dc3422f', 'Congratulations! You have completed the chapter. Click on the \'Continue\' button to continue.');
    CSLocalize('d831ae9ba2bc418382d361c2c29a3763', 'Do you really want to return this chapter to the learning process?');
    CSLocalize('e3e1407956114f62b924b8911f1deeb7', 'This chapter is not completed, do you really wish to interrupt your study? Note: Your results will be saved anyway.');
    CSLocalize('e931e33b05af468e93c874190465fa52', 'Do you really want to restore this chapter to the initial (uncompleted) state, so that you can go through it again? By restoring you will lose the results of all exercises from this chapter.');
    CSLocalize('f45743416d034fe6a67f7c8d44ed859f', 'Assessment test for Advanced');
    CSLocalize('f5f06b394fea4d4aa850b2d4e5a05470', 'The test is not completed, do you really wish to interrupt it? Note: Your results will be saved anyway.');
}

///#ENDDEBUG
var fakeLoc = null;

var schools;
(function (schools) {
    //export var readFiles: (urls: string[], completed: (data: string[]) => void) => void;
    //export var readAppDataAndLoc: (urls: Pager.locPaths, completed: (data, loc: string) => void) => void;
    //export var readAppData: (urls: string, completed: (data: string) => void) => void;
    ////nacte soubor z q:\LMCom\rew\Web4\Schools\EAData\ i s lokalizaci
    ////export var readStaticModuleData: (urls: Pager.locPaths, completed: (res, locRes: string) => void ) => void;
    //export var resetModules: (LMComUserId: number, companyId: number, productId: string, modJsonIds: string[], completed: () => void) => void;
    ////nacte strucne vysledky vsech modulu kurzu
    //export var readCrsResults: (isStart: boolean, lmcomUserId: number, companyId: number, productId: string, completed: (res: ModUser[]) => void) => void;
    ////nacte podrobne vysledky modulu
    //export var readModuleResult: (lmcomUserId: number, companyId: number, productId: string, moduleJsonId: string, completed: (data: ModUser) => void) => void;
    ////zapise podrobne vysledky modulu
    //export var writeModuleResult: (lmcomUserId: number, companyId: number, productId: string, moduleJsonId: string, data: ModUser, dataShort: ModUser, completed: () => void) => void;
    ////metainformace o kurzu v puvodni lm.com DB. V nove verzi musi byt nahrazeny by metaCourse
    //export var readCrsInfo: (lmcomUserId: number, companyId: number, productId: string, completed: (res: CourseInfo) => void) => void;
    //export var setMetaCourse: (lmcomUserId: number, companyId: number, productId: string, value: metaCourse, completed: () => void) => void;
    //export var getMetaCourse: (lmcomUserId: number, companyId: number, productId: string, completed: (res: metaCourse) => void) => void;
    ////export var createTest: (testFileName: string, lmcomUserId: number, companyId: number, productId: string, completed: (testId: number) => void) => void;
    ////export var readTestResults: (isStart: boolean, testIds: number[], completed: (testResults: schools.SchoolCmdTestInfoItem[]) => void) => void;
    function resetModulesLocal(modJsonIds) {
        ////uvolni data aktualniho modulu
        //schools.data.modId = null; schools.data.exStatic = null; schools.data.modUser = null;
        ////vymaz moduly na klientovi
        //_.each(modJsonIds, (key: string) => delete schools.data.crsUser[key]);
    }
    schools.resetModulesLocal = resetModulesLocal;

    function addTimespan(url, replace) {
        return replace ? url + "?timestamp=" + new Date().getTime() : url;
    }
})(schools || (schools = {}));

var persistLocal;
(function (persistLocal) {
    persistLocal.persistCourse = {
        loadShortUserData: function (userId, companyId, prodUrl, completed) {
        },
        loadUserData: function (userId, companyId, prodUrl, modUrl, completed) {
        },
        saveUserData: function (userId, companyId, prodUrl, data, completed) {
        },
        readFiles: function (urls, completed) {
            return void {};
        },
        resetExs: function (userId, companyId, prodUrl, urls, completed) {
        },
        createArchive: function (userId, companyId, productId, completed) {
        },
        testResults: function (userId, companyId, productId, completed) {
        }
    };

    //export function Init(target: LMComLib.Targets, completed: () => void ): void {
    //  schools.resetModules = resetModules;
    //  schools.readCrsResults = readCrsResults;
    //  schools.readModuleResult = readModuleResult;
    //  schools.writeModuleResult = writeModuleResult;
    //  schools.setMetaCourse = setMetaCourse;
    //  schools.getMetaCourse = getMetaCourse;
    //  //schools.createTest = createTest;
    //  //schools.readTestResults = readTestResults;
    //  schools.readCrsInfo = schools.libReadCrsInfo;
    //  switch (target) {
    //    case LMComLib.Targets.download:
    //    //case LMComLib.Targets.sl:
    //      //persistDownload.Init(target == LMComLib.Targets.sl, completed);
    //      persistDownload.Init(false, completed);
    //      break;
    //    case LMComLib.Targets.phoneGap:
    //      persistPhonegap.Init(completed);
    //      break;
    //    default: throw "not implemented";
    //  }
    //}
    persistLocal.readFile;
    persistLocal.writeFile;
    persistLocal.deleteFile;

    var modCache = [];

    var fCrsResults = "crs_result.txt";
    var fMetaCourse = "meta_course.txt";
    function fModule(modId) {
        return "mod_" + modId + ".txt";
    }

    function resetModules(lmcomUserId, companyId, crsId, modJsonIds, completed) {
        schools.resetModulesLocal(modJsonIds);

        var defs = _.map(modJsonIds, function (mi) {
            var modId = mi;
            var cId = crsId;
            var dfd = $.Deferred();
            persistLocal.deleteFile(cId, fModule(modId), dfd.resolve);
            return dfd.promise();
        });
        $.when(defs).then(function () {
            _.each(modJsonIds, function (modId) {
                return delete modCache[modId];
            });
            writeCrsResults(crsId, completed);
        }, function () {
            return alert("fail");
        });
    }

    function readCrsResults(isStart, lmcomUserId, companyId, crsId, completed) {
        persistLocal.readFile(crsId, fCrsResults, function (res) {
            return completed(modCache = (res == null ? [] : JSON.parse(res)));
        });
    }

    function readModuleResult(lmcomUserId, companyId, crsId, moduleJsonId, completed) {
        persistLocal.readFile(crsId, fModule(moduleJsonId), function (str) {
            return completed(str == null ? null : JSON.parse(str));
        });
    }

    function writeModuleResult(lmcomUserId, companyId, crsId, moduleJsonId, data, dataShort, completed) {
        persistLocal.writeFile(crsId, fModule(moduleJsonId), JSON.stringify(data), function () {
            modCache[moduleJsonId] = dataShort;
            writeCrsResults(crsId, completed);
        });
    }

    //function setMetaCourse(lmcomUserId: number, companyId: number, crsId: string, value: schools.metaCourse, completed: () => void) {
    //  writeFile(crsId, fMetaCourse, JSON.stringify(value), completed);
    //}
    //function getMetaCourse(lmcomUserId: number, companyId: number, crsId: string, completed: (res: schools.metaCourse) => void) {
    //  readFile(crsId, fMetaCourse, res => completed(res == null ? null : JSON.parse(res)));
    //}
    function writeCrsResults(crsId, completed) {
        persistLocal.writeFile(crsId, fCrsResults, JSON.stringify(modCache), completed);
    }
})(persistLocal || (persistLocal = {}));

var persistNewEA;
(function (persistNewEA) {
    persistNewEA.persistCourse = {
        loadShortUserData: function (userId, companyId, prodUrl, completed) {
            Pager.ajaxGet(1 /* restServices */, scorm.Cmd_readCrsResults_Type, scorm.Cmd_readCrsResults_Create(userId, companyId, prodUrl, null), function (res) {
                Logger.trace_persistNewEA("loadShortUserData: " + res.join(" ### "));
                var obj = {};
                _.each(res, function (kv) {
                    return obj[kv[0]] = JSON.parse(kv[1]);
                });
                completed(obj);
            });
        },
        loadUserData: function (userId, companyId, prodUrl, modUrl, completed) {
            Pager.ajaxGet(1 /* restServices */, scorm.Cmd_readModuleResults_Type, scorm.Cmd_readModuleResults_Create(modUrl, userId, companyId, prodUrl, null), function (res) {
                Logger.trace_persistNewEA("loadUserData " + modUrl + ": " + res);
                completed(_.isEmpty(res) ? {} : JSON.parse(res));
            });
        },
        saveUserData: function (userId, companyId, prodUrl, data, completed) {
            Pager.ajaxPost(1 /* restServices */, scorm.Cmd_saveUserData_Type, scorm.Cmd_saveUserData_Create(data, userId, companyId, prodUrl, null), function () {
                Logger.trace_persistNewEA("saveUserData");
                completed();
            });
        },
        readFiles: function (urls, completed) {
            if (!urls || urls.length == 0)
                completed([]);
            var data = [];
            var len = urls.length;
            var ajaxDone;
            ajaxDone = function (idx, fail) {
                return function (res) {
                    data[idx] = fail ? null : (res == null ? "" : res);
                    len--;
                    if (len == 0)
                        completed(data);
                };
            };
            for (var i = 0; i < urls.length; i++)
                $.ajax({ url: urls[i].charAt(0) == '/' ? '..' + urls[i] : urls[i], dataType: "text", headers: { "LoggerLogId": Logger.logId(), "LMComVersion": Utils.LMComVersion } }).done(ajaxDone(i, false)).fail(ajaxDone(i, true)); //i a false je znamo v dobe inicializace Ajax, nikoliv az v dobe navratu z ajax
        },
        resetExs: function (userId, companyId, prodUrl, urls, completed) {
            Pager.ajaxPost(1 /* restServices */, scorm.Cmd_resetModules_Type, scorm.Cmd_resetModules_Create(urls, userId, companyId, prodUrl, null), function (res) {
                Logger.trace_persistNewEA("resetExs: " + res);
                completed();
            });
        },
        createArchive: function (userId, companyId, productId, completed) {
            Pager.ajaxGet(1 /* restServices */, scorm.Cmd_createArchive_Type, scorm.Cmd_createArchive_Create(LMStatus.Cookie.id, companyId, productId, null), function (res) {
                return completed(res);
            });
        },
        testResults: function (userId, companyId, productId, completed) {
            Pager.ajaxGet(1 /* restServices */, scorm.Cmd_testResults_Type, scorm.Cmd_testResults_Create(LMStatus.Cookie.id, companyId, productId, null), function (res) {
                return completed(_.map(res, function (r) {
                    return JSON.parse(r);
                }));
            });
        }
    };
})(persistNewEA || (persistNewEA = {}));

//xx/#DEBUG
var Logger;
(function (Logger) {
    function trace_persistNewEA(msg) {
        Logger.trace("persistNewEA", msg);
    }
    Logger.trace_persistNewEA = trace_persistNewEA;
})(Logger || (Logger = {}));
//xx/#ENDDEBUG
//var scorm_dict = null;

var persistDownload;
(function (persistDownload) {
    var delphiApi;

    var debugVersion = true;

    var debugDelphiApi = (function () {
        function debugDelphiApi() {
        }
        debugDelphiApi.prototype.init = function (appDir, userDir) {
            oldApi.init(appDir, userDir);
        };
        debugDelphiApi.prototype.readAppFile = function (url) {
            Logger.trace_persistDownload("readAppFile: " + url);
            var res = oldApi.readAppFile(url);
            Logger.trace_persistDownload("readAppFile: OK");
            return res;
        };
        debugDelphiApi.prototype.readFile = function (crsId, url) {
            Logger.trace_persistDownload("readFile: " + url);
            var res = oldApi.readFile(crsId, url);
            Logger.trace_persistDownload("readFile: OK");
            return res;
        };
        debugDelphiApi.prototype.writeFile = function (crsId, url, data) {
            Logger.trace_persistDownload("writeFile: " + url);
            oldApi.writeFile(crsId, url, data);
            Logger.trace_persistDownload("writeFile: OK");
        };
        debugDelphiApi.prototype.deleteFile = function (crsId, url) {
            Logger.trace_persistDownload("deleteFile: " + url);
            oldApi.deleteFile(crsId, url);
            Logger.trace_persistDownload("deleteFile: OK");
        };
        debugDelphiApi.prototype.log = function (msg) {
            throw "not implemented";
        };
        return debugDelphiApi;
    })();

    //export function Init(isSl:boolean, completed: () => void ): void {
    //  delphiApi = (isSl ? slApi : window.external);
    //  if (!isSl) Logger.delphiLog = <any>(window.external);
    //  if (isSl) slApi.init("q:\\temp\\LANGMaster.com\\english_0_1\\cs_cz\\data\\schools\\", "q:\\temp\\DebugDownload\\");
    //  if (!delphiApi || typeof delphiApi.readAppFile == 'undefined') { alert("missing window.external.readAppFile"); return; }
    //  schools.readAppDataAndLoc = readAppDataAndLoc;
    //  schools.readAppData = readAppData;
    //  persistLocal.readFile = readFile;
    //  persistLocal.writeFile = writeFile;
    //  persistLocal.deleteFile = deleteFile;
    //  if (debugVersion) {
    //    oldApi = delphiApi;
    //    delphiApi = new debugDelphiApi();
    //  }
    //  completed();
    //}
    var oldApi;

    function readAppDataAndLoc(urls, completed) {
        completed(delphiApi.readAppFile(urls.url), delphiApi.readAppFile(urls.urlLoc)); //, urls.urlDict == null ? null : delphiApi.readAppFile(urls.urlDict)
    }

    function readAppData(url, completed) {
        completed(delphiApi.readAppFile(url));
    }

    function readFile(crsId, url, completed) {
        var res = delphiApi.readFile(crsId, url);
        completed(res == "" ? null : res);
    }
    function writeFile(crsId, url, data, completed) {
        delphiApi.writeFile(crsId, url, data);
        completed();
    }
    function deleteFile(crsId, url, completed) {
        delphiApi.deleteFile(crsId, url);
        completed();
    }
})(persistDownload || (persistDownload = {}));

//xx/#DEBUG
var Logger;
(function (Logger) {
    function trace_persistDownload(msg) {
        Logger.trace("persistDownload", msg);
    }
    Logger.trace_persistDownload = trace_persistDownload;
})(Logger || (Logger = {}));
//xx/#ENDDEBUG
//var fake_download = null;


var persistScormEx;
(function (persistScormEx) {
    persistScormEx.persistCourse = {
        loadShortUserData: function (userId, companyId, prodUrl, completed) {
            var reqUrl = url(Utils.string_format("type=get_key1str_data2&userid={0}&{1}&key1int={2}", [LMStatus.scormUserId(), scorm.attemptId, tab_modules]));
            Logger.trace_persistScorm("persistScormEx.loadShortUserDatas start: " + reqUrl);
            Pager.doAjax(false, reqUrl, null, null, function (res) {
                var arrRes = {};
                if (res && res.length > 0) {
                    var parts = res.split(delim);
                    var i = 0;
                    while (i < parts.length - 1) {
                        var unp = Utils.unpackStr(parts[i + 1]);
                        Logger.trace_persistScorm("readCrsResults " + parts[i] + ': ' + unp);
                        arrRes[parts[i]] = JSON.parse(unp);
                        i += 2;
                    }
                }
                Logger.trace_persistScorm("persistScormEx.loadShortUserDatas end");
                completed(arrRes);
            });
        },
        loadUserData: function (userId, companyId, prodUrl, modUrl, completed) {
            Logger.trace_persistScorm("persistScormEx.loadUserData start");
            getDataLow("get_data1", modUrl, true, null, false, tab_modules, true, 0, false, function (res) {
                if (res && res.indexOf(delim) >= 0)
                    res = res.split(delim)[0];
                var unp = Utils.unpackStr(res);
                Logger.trace_persistScorm("persistScormEx.loadUserData end: " + unp);
                completed(JSON.parse(unp));
            });
        },
        saveUserData: function (userId, companyId, prodUrl, data, completed) {
            Logger.trace_persistScorm("persistScormEx.saveUserData start");
            _.each(data, function (dt) {
                return Logger.trace_persistScorm(dt[0] + "=" + dt[1] + "; " + dt[2]);
            });
            var exs = _.map(data, function (dt) {
                var id = dt[0];
                var dfd = $.Deferred();
                setDataLow(dt[0], null, tab_modules, 0, encodeData(dt[2], dt[1]), dfd.resolve);
                return dfd.promise();
            });
            $.when(exs).then(function () {
                Logger.trace_persistScorm("persistScormEx.saveUserData end");
                completed();
            }).fail(function () {
                debugger;
                throw 'persistScormEx.saveUserData';
            });
        },
        readFiles: persistNewEA.persistCourse.readFiles,
        resetExs: function (userId, companyId, prodUrl, urls, completed) {
            var data = urls.join(delim);
            var reqUrl = url(Utils.string_format("type=del_all_key1str&userid={0}&{1}&key1int={2}", [LMStatus.scormUserId(), scorm.attemptId, tab_modules]));
            Logger.trace_persistScorm("resetModules: " + reqUrl + ", data=" + data);
            Pager.doAjax(true, reqUrl, null, data, function (res) {
                return completed();
            });
        },
        createArchive: function (userId, companyId, productId, completed) {
        },
        testResults: function (userId, companyId, productId, completed) {
        }
    };

    var delim = ";";
    var tab_modules = 1;
    var tab_metadata = 2;

    function encodeData(data1, data2) {
        return (data1 ? Utils.packStr(data1) : '') + delim + (data2 ? Utils.packStr(data2) : '');
    }

    function setDataLow(key1str, key2str, key1int, key2int, data, completed) {
        var reqUrl = url(Utils.string_format("type=set_data&userid={0}&{1}&key1str={2}&key2str={3}&key1int={4}&key2int={5}&date={6}", [LMStatus.scormUserId(), scorm.attemptId, key1str, key2str, key1int, key2int, Utils.nowToInt()]));

        //Debug.trace_persistScorm("setData: " + reqUrl + ", data=" + data);
        Pager.doAjax(true, reqUrl, null, data, function (res) {
            return completed();
        });
    }

    function getDataLow(getDataType, key1str, isKey1str, key2str, isKey2str, key1int, iskey1int, key2int, iskey2int, completed) {
        var query = Utils.string_format("type={0}&userid={1}&{2}", [getDataType, LMStatus.scormUserId(), scorm.attemptId]);
        if (isKey1str)
            query += "&key1str=" + (key1str ? key1str : '');
        if (isKey2str)
            query += "&key2str=" + (key2str ? key2str : '');
        if (iskey1int)
            query += "&key1int=" + key1int.toString();
        if (iskey2int)
            query += "&key2int=" + key2int.toString();
        var reqUrl = url(query);

        //Debug.trace_persistScorm("getData: " + reqUrl);
        Pager.doAjax(false, reqUrl, null, null, function (res) {
            //Debug.trace_persistScorm("getData result: " + res);
            completed(res);
        });
    }

    function url(query) {
        var res = Pager.path(3 /* restServicesScorm */);
        res += res.indexOf('?') >= 0 ? '&' : '?';
        return res + query;
    }
})(persistScormEx || (persistScormEx = {}));

//xx/#DEBUG
var Logger;
(function (Logger) {
    function trace_persistScorm(msg) {
        Logger.trace("persistScorm", msg);
    }
    Logger.trace_persistScorm = trace_persistScorm;
})(Logger || (Logger = {}));
//xx/#ENDDEBUG
//var persistScorm = null;

var persistMemory;
(function (persistMemory) {
    persistMemory.persistCourse = {
        loadShortUserData: function (userId, companyId, prodUrl, completed) {
            var prodDb = memDb[prodUrl];
            if (!prodDb) {
                completed(null);
                return;
            }
            var data = {};
            for (var p in prodDb)
                data[p] = JSON.parse(prodDb[p].shortdata);
            completed(data);
        },
        loadUserData: function (userId, companyId, prodUrl, modUrl, completed) {
            var prodDb = memDb[prodUrl];
            if (!prodDb) {
                completed(null);
                return;
            }
            var m = prodDb[modUrl];
            completed(m ? JSON.parse(m.data) : null);
        },
        saveUserData: function (userId, companyId, prodUrl, data, completed) {
            var prodDb = memDb[prodUrl];
            if (!prodDb) {
                prodDb = {};
                memDb[prodUrl] = prodDb;
            }
            _.each(data, function (dt) {
                return prodDb[dt[0]] = { id: dt[0], data: dt[2], shortdata: dt[1] };
            });
            completed();
        },
        resetExs: function (userId, companyId, prodUrl, urls, completed) {
            delete memDb[prodUrl];
            completed();
        },
        readFiles: persistNewEA.persistCourse.readFiles,
        createArchive: function (userId, companyId, productId, completed) {
        },
        testResults: function (userId, companyId, productId, completed) {
        }
    };

    function reset() {
        memDb = {};
    }
    persistMemory.reset = reset;

    var memDb = {};
})(persistMemory || (persistMemory = {}));

//xx/#DEBUG
var Logger;
(function (Logger) {
    function trace_persistScormLocal(msg) {
        Logger.trace("persistScormLocal", msg);
    }
    Logger.trace_persistScormLocal = trace_persistScormLocal;
})(Logger || (Logger = {}));
//xx/#ENDDEBUG
//var persistScormL = null;

var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
//POUZIVA se pro zobrazeni chyby v JSCrambler ochrane, viz boot.ts,  export function Error(): void { Pager.loadPage(new splash.licenceError());  }
var splash;
(function (splash) {
    var Page = (function (_super) {
        __extends(Page, _super);
        function Page() {
            _super.call(this, null, null, null);
            this.bodyTmpl = 'Dummy';
        }
        Page.prototype.template = function () {
            return 'splashRoot';
        };
        return Page;
    })(Pager.Page);
    splash.Page = Page;

    splash.error;
    var licenceError = (function (_super) {
        __extends(licenceError, _super);
        function licenceError() {
            _super.call(this);
            this.bodyTmpl = 'licenceError';
            this.data = splash.error;
            this.isUserMonthExpired = splash.error.result == 3 /* userMonthExpired */;
            switch (splash.error.result) {
                case 2 /* demoExpired */:
                    this.text = "Trial period expired at " + Utils.intToDateStr(splash.error.DemoExpired);
                    break;
                case 3 /* userMonthExpired */:
                    this.text = "Number of licences exceeded";
                    break;
                default:
                    this.text = "other";
                    break;
            }
        }
        return licenceError;
    })(Page);
    splash.licenceError = licenceError;

    $.views.helpers({
        licenceRespUser: function (usr) {
            return usr.Id.split('-')[1] + ' ' + usr.Name + ' ' + (_.isEmpty(usr.rootCourse) ? '' : CourseMeta.lib.findProduct(usr.rootCourse).title);
        },
        licenceRespBuy: function (buy) {
            return Utils.intToDateStr(buy.Created) + ": " + buy.UserMonths + " licences";
        }
    });
})(splash || (splash = {}));

var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var CourseMeta;
(function (_CourseMeta) {
    function navBar() {
        return cfg.themeDefauleNavbar ? 'default' : 'inverse';
    }
    _CourseMeta.navBar = navBar;

    //export var navBar = 'default';
    //Dynamicke properties stranky, menene i pri vyhodnoceni cviceni
    _CourseMeta.greenTitle = ko.observable();
    _CourseMeta.greenIcon = ko.observable();
    _CourseMeta.greenCss = ko.observable();
    _CourseMeta.greenDisabled = ko.observable();
    _CourseMeta.greenClick;
    _CourseMeta.greenArrowDict;
    _CourseMeta.foundGreenEx;

    function doGreenClick() {
        CourseMeta.lib.keepGreen = _CourseMeta.greenCss() == 'success';
        _CourseMeta.greenClick();
    }
    _CourseMeta.doGreenClick = doGreenClick;

    function btnClick(url) {
        var nd = _.isEmpty(url) ? _CourseMeta.actCourseRoot : (_CourseMeta.actProduct.getNode(url));
        if (nd.isSkiped)
            return;
        Pager.navigateToHash(nd.href());
    }
    _CourseMeta.btnClick = btnClick;

    function gotoData(url) {
        //skok na hash nebo sitemap url, kvuli breadcrumb v testMe result apod.
        Pager.navigateToHash(_.isEmpty(url) ? '' : (url.split('@').length > 1 ? url : _CourseMeta.actProduct.getNode(url).href()));
        return false;
    }
    _CourseMeta.gotoData = gotoData;

    (function (gui) {
        function alert(type, isConfirm) {
            if (isConfirm)
                return confirm(CSLocalize('d348b1d49cc9424a8c1c3a840ad9d4dd', 'Your answers are not all correct. Do you really want to evaluate the exercise?'));
            else
                window.alert('alert');
        }
        gui.alert = alert;
        function gotoData(node) {
            if (!node)
                node = _CourseMeta.actCourseRoot;
            Pager.navigateToHash(node.href());
        }
        gui.gotoData = gotoData;
        function onReload() {
            Pager.reloadPage();
        }
        gui.onReload = onReload;

        gui.exerciseHtml;
        gui.exerciseCls;
        function init() {
            gui.exerciseHtml = $.noop;
            gui.exerciseCls = $.noop;
        }
        gui.init = init;
    })(_CourseMeta.gui || (_CourseMeta.gui = {}));
    var gui = _CourseMeta.gui;
    gui.init();

    //sluzby, ktere CourseMeta poskytuje persistent layer
    _CourseMeta.persist = null;

    var MetaModel = (function (_super) {
        __extends(MetaModel, _super);
        function MetaModel() {
            _super.apply(this, arguments);
        }
        MetaModel.prototype.title = function () {
            return _CourseMeta.actNode.title;
        };
        MetaModel.prototype.iconId = function () {
            return _CourseMeta.actNode.iconId();
        };
        MetaModel.prototype.breadcrumbs = function () {
            if (this.br)
                return this.br;
            var res = [];
            var self = _CourseMeta.actNode;
            while (true) {
                res.push(self);
                if (self == _CourseMeta.actCourseRoot || self == _CourseMeta.actGrammar)
                    break;
                self = self.parent;
            }
            if (!_CourseMeta.isType(_CourseMeta.actNode, 65536 /* grammar */) && cfg.target == 0 /* web */)
                res.push({ title: schools.homeTitle(), iconId: function () {
                        return 'home';
                    }, url: '' });
            if (res.length == 1)
                return this.br = [];
            res.reverse();
            return this.br = res;
        };
        MetaModel.prototype.hasBreadcrumb = function () {
            return _CourseMeta.actNode != _CourseMeta.actGrammar && this.breadcrumbs().length > 1;
        };
        MetaModel.prototype.doUpdate = function (completed) {
            _CourseMeta.lib.onChangeUrl(this.productUrl, this.url, function (ex) {
                return _CourseMeta.lib.doRefresh(completed);
            });
        };
        return MetaModel;
    })(schools.Model);
    _CourseMeta.MetaModel = MetaModel;

    var ModelPretest = (function (_super) {
        __extends(ModelPretest, _super);
        function ModelPretest(urlParts) {
            _super.call(this, schools.tCoursePretest, urlParts);
            this.bodyTmpl = "TCoursePretestBody";
        }
        ModelPretest.prototype.title = function () {
            return 'Pretest';
        };
        ModelPretest.prototype.iconId = function () {
            return 'puzzle-piece';
        };

        ModelPretest.prototype.doUpdate = function (completed) {
            //var u: schools.Url = <any>this.url;
            _CourseMeta.lib.onChangeUrl(this.productUrl, this.url, function (ex) {
                return _CourseMeta.lib.doRefresh(function () {
                    if (!_CourseMeta.isType(_CourseMeta.actNode, 64 /* taskPretest */))
                        throw '!isType(actNode, runtimeType.taskPretest)';
                    var pretest = _CourseMeta.actNode;
                    var init = pretest.initModel();
                    _CourseMeta.lib.fillArrowInfo(init.info);
                    _CourseMeta.lib.adjustEx(init.grEx, function () {
                        return _CourseMeta.lib.displayEx(init.grEx, null, null);
                    });
                });
            });
        };
        return ModelPretest;
    })(MetaModel);
    _CourseMeta.ModelPretest = ModelPretest;

    var Model = (function (_super) {
        __extends(Model, _super);
        function Model(urlParts) {
            _super.call(this, schools.tCourseMeta, urlParts);
            this.bodyTmpl = "TCourseMeta_Folder";
        }
        return Model;
    })(MetaModel);
    _CourseMeta.Model = Model;

    $.views.helpers({
        makeTuples: function (buttons) {
            var res = [];
            var isLeft = true;
            _.each(buttons, function (b) {
                if (isLeft)
                    res.push({ left: b, right: null });
                else {
                    var t = res[res.length - 1];
                    t.right = b;
                }
                isLeft = !isLeft;
            });
            return res;
        },
        CourseMeta: CourseMeta,
        Utils: Utils
    });

    $(window).bind("resize", function () {
        $(".cbtn").each(function () {
            var btn = $(this);
            var url = btn.data("node-url");
            if (!url)
                return;
            var nd = (_CourseMeta.actProduct.getNode(url));
            if (!nd)
                return;
            var w = btn.outerWidth(true);
            var sum = nd.exCount;
            var skiped = nd.isSkiped ? w : w * nd.skipedCount / sum;
            var completed = nd.isSkiped ? 0 : w * (nd.complNotPassiveCnt + nd.complPassiveCnt) / sum;
            btn.find('.c1').css('width', Math.round(skiped).toString() + 'px');
            btn.find('.c2').css('left', Math.round(skiped).toString() + 'px').css('width', Math.round(completed).toString() + 'px');
            btn.find('.c3').css('left', Math.round(skiped + completed).toString() + 'px');
        });
    });

    function saveAndReload() {
        _CourseMeta.lib.saveProduct(function () {
            _CourseMeta.actNode = null;
            Pager.reloadPage(_CourseMeta.actExModel);
        });
    }
    _CourseMeta.saveAndReload = saveAndReload;

    //vypocet odvozenych udaju
    function refreshExerciseBar(dt) {
        if (dt.done) {
            _CourseMeta.actExModel.tb.exerciseEvaluated(true);
            _CourseMeta.actExModel.tb.score(_CourseMeta.actEx.page.isPassive ? null : dt.score.toString() + "%");
        } else
            _CourseMeta.actExModel.tb.exerciseEvaluated(false);
    }
    _CourseMeta.refreshExerciseBar = refreshExerciseBar;

    //stav zelene sipky
    var greenArrowInfo = (function () {
        function greenArrowInfo(title, disable, css, iconId, greenClick) {
            this.title = title;
            this.disable = disable;
            this.css = css;
            this.iconId = iconId;
            this.greenClick = greenClick;
        }
        return greenArrowInfo;
    })();
    _CourseMeta.greenArrowInfo = greenArrowInfo;

    //vsechny mozne alerty
    (function (alerts) {
        alerts[alerts["exTooManyErrors"] = 0] = "exTooManyErrors";
    })(_CourseMeta.alerts || (_CourseMeta.alerts = {}));
    var alerts = _CourseMeta.alerts;

    //seznam vsech dostupnych button akci
    (function (nodeAction) {
        nodeAction[nodeAction["no"] = 0] = "no";
        nodeAction[nodeAction["browse"] = 1] = "browse";
        nodeAction[nodeAction["skip"] = 2] = "skip";
        nodeAction[nodeAction["run"] = 3] = "run";

        //archive = 3,
        nodeAction[nodeAction["unskip"] = 4] = "unskip";

        //nop = 5,
        //pro kurz
        nodeAction[nodeAction["reset"] = 5] = "reset";

        //pro test
        nodeAction[nodeAction["runTestAgain"] = 6] = "runTestAgain";
        nodeAction[nodeAction["cancelTestSkip"] = 7] = "cancelTestSkip";
    })(_CourseMeta.nodeAction || (_CourseMeta.nodeAction = {}));
    var nodeAction = _CourseMeta.nodeAction;

    function onNodeAction(url, type) {
        var nd = _CourseMeta.actProduct.getNode(url);
        nd.onAction(type);
    }
    _CourseMeta.onNodeAction = onNodeAction;

    //popis akce nad buttonem
    var NodeAction = (function () {
        function NodeAction(type, node) {
            this.type = type;
            this.node = node;
        }
        NodeAction.prototype.info = function () {
            return _CourseMeta.allActions[this.type];
        };
        NodeAction.createActions = function (node) {
            var actions = [];
            for (var _i = 0; _i < (arguments.length - 1); _i++) {
                actions[_i] = arguments[_i + 1];
            }
            return _.map(_.filter(actions, function (a) {
                return a != 0 /* no */;
            }), function (act) {
                return new NodeAction(act, node);
            });
        };
        return NodeAction;
    })();
    _CourseMeta.NodeAction = NodeAction;

    

    _CourseMeta.allActions = {};
    _CourseMeta.allActions[1 /* browse */] = { icon: 'folder-open', title: function () {
            return CSLocalize('af026337fdf44d3287ade389c8d925f9', 'Browse');
        } };
    _CourseMeta.allActions[2 /* skip */] = { icon: 'times-circle', title: function () {
            return CSLocalize('2c9b18c8e2a8449b891a3639691e1999', 'Skip');
        } };
    _CourseMeta.allActions[3 /* run */] = { icon: 'play', title: function () {
            return CSLocalize('ba8042332a3c4520bc758e9bc851ae2b', 'Run');
        } };
    _CourseMeta.allActions[4 /* unskip */] = { icon: 'plus-circle', title: function () {
            return CSLocalize('7f9d15221d9f471f934a944b1a949dca', 'Undo Skip');
        } };
    _CourseMeta.allActions[5 /* reset */] = { icon: 'refresh', title: function () {
            return CSLocalize('27f1cba5240643fc9d0993cb6b5931b7', 'Reset');
        } };
    _CourseMeta.allActions[6 /* runTestAgain */] = { icon: 'refresh', title: function () {
            return CSLocalize('9f77df2b307e48ad91291b0907fcbf4a', 'Run a new test');
        } };
    _CourseMeta.allActions[7 /* cancelTestSkip */] = { icon: 'plus-circle', title: function () {
            return CSLocalize('f48f9615e3374fd2b6e1c377d1b8b0d3', 'Cancel and skip the test');
        } };

    Pager.registerAppLocator(schools.appId, schools.tCourseMeta, function (urlParts, completed) {
        return completed(new Model(urlParts));
    });
    Pager.registerAppLocator(schools.appId, schools.tCoursePretest, function (urlParts, completed) {
        return completed(new ModelPretest(urlParts));
    });
})(CourseMeta || (CourseMeta = {}));