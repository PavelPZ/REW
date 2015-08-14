var anim;
(function (anim) {
    function onModalShow(modal) {
        if (actModal) {
            console.log('anim: onModalShow, hide old');
            if (_alertInfo)
                _alertInfo.okClick = undefined;
            actModal.modal('hide');
            actModal = null;
        }
        actModal = modal;
    }
    anim.onModalShow = onModalShow;
    function onModalHide(modal) {
        if (!modal || !modal.data('bs.modal').isShown)
            return;
        if (modal != actModal) {
            debugger;
            throw 'modal!=actModal';
        }
        actModal = null;
    }
    anim.onModalHide = onModalHide;
    var actModal;
    //template v d:\LMCom\rew\Web4\JsLib\JS\Bowser.html
    var alertInfo = (function () {
        function alertInfo() {
            var _this = this;
            this.text = ko.observable('');
            this.caption = ko.observable('');
            this.isCancelVisible = ko.observable(true);
            this.okClick = false;
            this.lmconsoleClick = $.noop;
            Pager.renderTemplateEx('lm-alert-place', 'lm-alert-template', this);
            this.mod = $('#lm-alert-place #modal-alert');
            Pager.renderTemplateEx('lm-console-place', 'lmconsole-dialog', this);
            this.lmconsoleDialog = $('#lm-console-place #modal-lmconsole-dialog');
            Pager.renderTemplateEx('lm-docdlg-place', 'doc-dialog', this);
            this.lmdocDialog = $('#lm-docdlg-place #modal-doc-dialog');
            this.mod.on('hide.bs.modal', function () {
                console.log('anim: alert hide');
                if (_this.completed)
                    _this.completed(_this.okClick);
                _this.completed = null;
                onModalHide(_this.mod);
            }).on('show.bs.modal', function () {
                console.log('anim: alert show');
                onModalShow(_this.mod);
            });
        }
        alertInfo.prototype.show = function (title, completed, finishParams) {
            if (finishParams === void 0) { finishParams = null; }
            if (actModal) {
                this.okClick = undefined;
                actModal.modal('hide');
                actModal = null;
            }
            this.okClick = false;
            this.text(title);
            this.completed = completed;
            this.isCancelVisible(true);
            this.caption('');
            if (finishParams)
                finishParams();
            this.mod.modal('show');
        };
        alertInfo.prototype.click = function () {
            console.log('anim: alert ok click');
            this.okClick = true;
            this.mod.modal('hide');
        };
        alertInfo.prototype.lmconsoleShow = function (onOK) {
            var _this = this;
            var ok = onOK;
            this.lmconsoleClick = function () { return ok(_this.lmconsoleDialog, function () { return _this.lmconsoleDialog.modal('hide'); }); };
            this.lmconsoleDialog.modal('show');
        };
        alertInfo.prototype.lmcdocDlgShow = function (data) {
            var txt = this.lmdocDialog.find('#modal-doc-text');
            txt.val(data);
            setTimeout(function () { return (txt[0]).select(); }, 1);
            //var txt = this.lmdocDialog.find('#modal-doc-pre');
            //txt.text(data);
            //setTimeout(() => selectText(txt[0]), 1);
            this.lmdocDialog.modal('show');
        };
        return alertInfo;
    })();
    anim.alertInfo = alertInfo;
    function alert() {
        if (!_alertInfo)
            _alertInfo = new alertInfo();
        return _alertInfo;
    }
    anim.alert = alert;
    var _alertInfo;
    function selectText(text) {
        var doc = document;
        if (window.getSelection) {
            var selection = window.getSelection();
            var range2 = doc.createRange();
            range2.selectNodeContents(text);
            selection.removeAllRanges();
            selection.addRange(range2);
        }
        else if ((doc).body.createTextRange) {
            var range = (doc).body.createTextRange();
            range.moveToElementText(text);
            range.select();
        }
    }
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
            return; //neni co rozbalovat
        //if (isToogle) block.toggle(animInterval); else block.show(animInterval);
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
        var self = $(ev.target).closest('[data-role=menu]'); //self neprazdne => je klik do menu
        hideMenus(self);
        setTimeout(function () { return self.css({ 'opacity': 0, 'visibility': 'hidden' }); }, 1); //za chvili zavri i self
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
    anim.mousePos; //v mousemove zapamatovana pozice
    //zapamatovani si pozice mysi
    $(document).bind('mousemove', function (ev) { return anim.mousePos = ev; });
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
        skin.prototype.bodyClass = function () { return ''; };
        skin.prototype.getSkinHome = function (std) {
            if (LMStatus.isLogged())
                return schools.getHash(schools.tMy, -1, null, null, null);
            var res = this.getHome();
            return _.isEmpty(res) ? std : res;
        };
        skin.prototype.getHome = function () { return null; };
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
        //console.log(ev.type);
        switch (ev.type) {
            case "tapstart":
            case "mousedown":
                var t = $(ev.currentTarget);
                if (t.is('.disabled'))
                    return;
                t.addClass("lm-click");
                setTimeout(function () { return cancelTouch(ev, t); }, 800);
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
        _.each(twStyles, function (s) { return twEl.css(s, styleHolder.css(s)); });
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
var testMe;
(function (testMe) {
    testMe.appId = "test";
})(testMe || (testMe = {}));
var Login;
(function (Login) {
    Login.appId = "login";
})(Login || (Login = {}));
var schoolAdmin;
(function (schoolAdmin) {
    schoolAdmin.appId = "schoolAdmin".toLowerCase();
})(schoolAdmin || (schoolAdmin = {}));
var xref;
(function (xref) {
    xref.appId = "xref";
})(xref || (xref = {}));
var doc;
(function (doc) {
    doc.appId = "doc";
})(doc || (doc = {}));
var vsNet;
(function (vsNet) {
    vsNet.appId = "vsNet".toLowerCase();
})(vsNet || (vsNet = {}));
var grafia;
(function (grafia) {
    grafia.appId = "grafia";
})(grafia || (grafia = {}));
var skrivanek;
(function (skrivanek) {
    skrivanek.appId = "skrivanek";
})(skrivanek || (skrivanek = {}));
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
        ViewModelRoot.prototype.pageChanged = function (oldPage, newPage) { }; //pozadavek na novou stranku
        ViewModelRoot.prototype.loaded = function () { }; //nova stranka naladovana a nabindovana
        return ViewModelRoot;
    })();
    Pager.ViewModelRoot = ViewModelRoot;
    var Page = (function () {
        function Page(appId, type, urlParts /*, public base: Page = null*/) {
            this.appId = appId;
            this.type = type;
            this.urlParts = urlParts;
        }
        Page.prototype.update = function (completed) { completed(); }; //vybudovani stranky
        Page.prototype.loaded = function () { }; //naladovani HTML stranky
        Page.prototype.leave = function () { }; //pred opustenim stranky
        Page.prototype.htmlClearing = function () { }; //pred zrusenim HTML se strankou
        Page.prototype.getHash = function () { return [this.appId, this.type].concat(this.urlParts).join('@'); }; //my hash
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
                locatePageFromHashLow(Pager.initHash(), completed);
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
                Pager.ajaxGet(Pager.pathType.restServices, Login.CmdAdjustUser_Type, Login.CmdAdjustUser_Create(obj.providerid, obj.id, obj.email, obj.firstName, obj.lastName), function (res) {
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
        ActPage: function () { return Pager.ActPage; },
    });
    //export function HomeUrl(): string { return "#"; }
    function navigateToHash(hash) { location.hash = '#' + hash; }
    Pager.navigateToHash = navigateToHash;
    function closePanels() { anim.collapseExpanded(); }
    Pager.closePanels = closePanels;
    //export function orceLoadPage(page: Pager.Page) {
    //  if (page == null) locatePageFromHash('', loadPageLow); else loadPageLow(page);
    //}
    function loadPageHash(hash) {
        locatePageFromHash(hash, function (pg) { return loadPage(pg); });
    }
    Pager.loadPageHash = loadPageHash;
    function loadPage(page) {
        if (page == null || page == Pager.ignorePage)
            return;
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
        if (page === void 0) { page = null; }
        if (!page)
            page = Pager.ActPage;
        if (!page)
            throw 'Missing page';
        Logger.trace("ModelBase.reload: url=", page.getHash() + ", template=" + ViewBase.viewLocator(page.type));
        blockGui(true);
        //clearHtml(); 16.9.2014, optimalizace:
        clearNode();
        page.update(function () { renderHtml(page); callLoaded(); page.loaded(); });
    }
    Pager.reloadPage = reloadPage;
    //stranka dokoncena => zavolej dokoncovaci akce
    function callLoaded() {
        setTimeout(function () {
            Pager.rootVM.loaded();
            blockGui(false);
        }, 1);
    }
    Pager.callLoaded = callLoaded;
    function blockGui(isBlock) {
        var el = $('#block-gui-element');
        //if (blockGuiTimer != 0) { clearTimeout(blockGuiTimer); blockGuiTimer = 0; }
        if (isBlock) {
            el.show();
        }
        else {
            el.hide();
        }
    }
    Pager.blockGui = blockGui; //var blockGuiTimer = 0;
    function renderTemplateEx(tagId, templateId, bindingObject) {
        var root = $('#' + tagId);
        var oldObj = root.data('binding-obj');
        if (oldObj) {
            if (oldObj.dispose)
                oldObj.dispose();
            root.data('binding-obj', null);
            ko.cleanNode(root[0]);
            root.html('');
        }
        if (templateId != 'Dummy') {
            var html = JsRenderTemplateEngine.render(templateId, bindingObject);
            root.html(html);
            ko.applyBindings(bindingObject, root[0]);
            root.data('binding-obj', bindingObject);
        }
    }
    Pager.renderTemplateEx = renderTemplateEx;
    function renderTemplate(templateId) {
        var root = $('#root');
        if (templateId == 'Dummy') {
            ko.cleanNode(root[0]);
            clearNode();
            root.html('');
        }
        else {
            root.html(JsRenderTemplateEngine.render(templateId, Pager.rootVM));
            ko.applyBindings(Pager.rootVM, root[0]);
        }
    }
    Pager.renderTemplate = renderTemplate;
    //Vymaz obsah stranky
    function clearHtml() { renderTemplate('Dummy'); }
    Pager.clearHtml = clearHtml;
    function clearNode() { try {
        ko.cleanNode($('#root')[0]);
    }
    catch (e) { } if (!Pager.htmlOwner)
        return; Pager.htmlOwner.htmlClearing(); Pager.htmlOwner = null; }
    //vygeneruj HTML a navaz ho do stranky. Proved ko-binding
    function renderHtml(page) {
        if (page === void 0) { page = Pager.ActPage; }
        clearNode();
        renderTemplate(ViewBase.viewLocator(page.type));
        Pager.htmlOwner = page;
    }
    Pager.renderHtml = renderHtml;
    function renderHtmlEx(isStart, style, page) {
        if (style === void 0) { style = null; }
        if (page === void 0) { page = Pager.ActPage; }
        var root = $('#root');
        if (isStart) {
            if (bowser.agent.msie && bowser.agent.version > 8)
                root.addClass('contentHidden');
            //dynamicke pridani x odstraneni lokalnich page stylu
            var hd = $('head');
            //http://stackoverflow.com/questions/3182840/removing-or-replacing-a-stylesheet-a-link-with-javascript-jquery
            var cs = hd.find('#current-style');
            if (cs.length > 0) {
                cs.prop('disabled', true);
                cs.remove();
            }
            if (!_.isEmpty(style)) {
                var st = document.createElement('style');
                st.id = 'current-style';
                st.type = 'text/css';
                if (st.styleSheet)
                    st.styleSheet.cssText = style;
                else
                    st.appendChild(document.createTextNode(style));
                hd.append(st);
            }
        }
        if (isStart)
            renderHtml(page);
        if (!isStart)
            root.waitForImages(function () { return root.removeClass("contentHidden"); }, $.noop, false);
    }
    Pager.renderHtmlEx = renderHtmlEx;
    Pager.rootVM = new ViewModelRoot();
    Pager.initHash; //inicialni hash URL
    Pager.afterLoginInit; //sance po zalogovani naladovat zakodovane javascripty
})(Pager || (Pager = {}));

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
        $.when($.ajax({
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
            _.each(fors, function (f) { return modelIdToScriptId[f + "Model".toLowerCase()] = th.attr('id'); });
        });
    }
    var modelIdToScriptId;
    ViewBase.init = function () {
        Logger.traceMsg('ViewBase.initBootStrapApp');
        $(window).hashchange(function () { return Pager.loadPageHash(location.hash); });
        //Pager.locatePageFromHash(location.hash, (page: Pager.Page) => {
        //  if (page == null || page == Pager.ignorePage) return;
        //  Pager.loadPage(page);
        //});
        //});
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
    //base tag musi byt absolutni URL, neboli je k nicemu
    //var bases = document.getElementsByTagName('base');
    //export var basicDir: string;
    //export var basicUrl: string;
    //if (bases && bases.length == 1) {
    //  var parts = bases[0].href.toLowerCase().split('/');
    //  var schoolIdx = _.indexOf(parts, 'schools');
    //  parts = parts.slice(0, schoolIdx >= 0 ? schoolIdx : parts.length - 2); //odrizni Schools
    //  basicDir = parts.join('/');
    //  basicUrl = basicDir + '/';
    //  //basicDir = basicUrl.substr(0, basicUrl.length - 1);
    //} else {
    //k http://www.langmaster.com/rew/Schools/NewEA.aspx... vrati http://www.langmaster.com/rew/
    var parts = location.pathname.toLowerCase().split('/');
    var schoolIdx = _.indexOf(parts, 'schools');
    ////var href = 'http(s)://server/_layouts/SharePointLearningKit/Frameset/Frameset.aspx'.toLowerCase();
    ////var idx = href.indexOf('/sharepointlearningkit/');
    ////href = href.substr(0, idx + 1) + 'SLMS/SLMSLoadLM.ashx';
    parts = parts.slice(0, schoolIdx >= 0 ? schoolIdx : parts.length - 2); //odrizni Schools/NewEA.aspx
    Pager.basicDir = location.protocol + '//' + location.host + parts.join('/');
    Pager.basicUrl = Pager.basicDir + '/';
    //}
    //export var cfg: ajaxConfig = { forceServiceUrl: null };
    function path(type, url, loc) {
        if (url === void 0) { url = ""; }
        if (loc === void 0) { loc = LMComLib.Langs.no; }
        var res = null;
        switch (type) {
            //case pathType.root: res = '../'; break;
            case pathType.relPath:
                return '../' + url;
                break;
            case pathType.restServices:
                return !cfg.forceServiceUrl ? Pager.basicUrl + 'service.ashx' : serviceUrl();
                break;
            case pathType.loggerService:
                return cfg.forceLoggerUrl ? cfg.forceLoggerUrl : path(pathType.restServices);
                break;
            case pathType.restServicesScorm:
                return cfg.forceServiceUrl == null ? Pager.basicUrl + 'scormEx.ashx' : serviceUrl();
                break;
            /*********** OBSOLETE **************/
            case pathType.eTestMe:
                res = 'lmcom/eTestMe.com/Test.aspx';
                break;
            case pathType.eaScormServer:
                res = 'lmcom/services/rpc/ea/scormserver.aspx';
                break;
            case pathType.eaData:
                res = LMComLib.LangToEADir[loc.toString()] + "/";
                break;
            case pathType.cpv:
                res = "lmcom/eTestMe.com/site/" + Trados.actLangCode + '/ListeningAndPronunc.aspx#/AppPronunc/FactSoundView.xaml?IsFactOnly=true&';
                break;
            default: throw "NotImplemented";
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
    function doAjaxCmd(isPost, url, type, data, completed, error) {
        if (error === void 0) { error = null; }
        doAjax(isPost, url, type, data, function (str) {
            if (str == null) {
                completed(null);
                return;
            }
            var res = typeof str == 'string' ? (_.isEmpty(str) ? null : JSON.parse(str)) : str;
            if (res == null) {
                completed(null);
                return;
            }
            else if (res.error != 0) {
                Logger.error('Ajax.doSLAjaxCmd', res.error.toString() + ": " + res.errorText + ", " + url, '');
                if (error)
                    error(res.error, res.errorText);
            }
            else
                completed(res.result);
        });
    }
    Pager.doAjaxCmd = doAjaxCmd;
    function ajax_download(url, data, type, input_name) {
        if (input_name === void 0) { input_name = "par"; }
        var $iframe, iframe_doc, iframe_html;
        if (($iframe = $('#download_iframe')).length === 0) {
            $iframe = $("<iframe id='download_iframe'" +
                " style='display: none' src='about:blank'></iframe>").appendTo("body");
        }
        url += url.indexOf('?') >= 0 ? "&" : '?';
        url += "timestamp=" + new Date().getTime().toString();
        if (type)
            url += '&type=' + type;
        if (url.charAt(0) == '/')
            url = '..' + url;
        iframe_doc = $iframe[0].contentWindow || $iframe[0].contentDocument;
        if (iframe_doc.document) {
            iframe_doc = iframe_doc.document;
        }
        iframe_html = "<html><head></head><body><form method='POST' action='" +
            url + "'>" +
            "<input type=hidden name='" + input_name + "' value='" +
            JSON.stringify(data) + "'/></form>" +
            "</body></html>";
        iframe_doc.open();
        iframe_doc.write(iframe_html);
        $(iframe_doc).find('form').submit();
    }
    Pager.ajax_download = ajax_download;
    //Univerzalni AJAX funkce pro POST x GET. crossdomain x bez
    function doAjax(isPost, url, type, data, completed /*, error: (id: number, msg: string) => void = null*/) {
        var isCrossDomain = Utils.isCrossDomain(url);
        //var isCrossDomain = true;
        var timestamp = new Date().getTime().toString();
        url += url.indexOf('?') >= 0 ? "&" : '?';
        url += "timestamp=" + timestamp;
        if (type)
            url += '&type=' + type;
        if (url.charAt(0) == '/')
            url = '..' + url;
        if (isPost && isCrossDomain) {
            Utils.iFrameSubmit(url + '&LoggerLogId=' + Logger.logId() + "&LMComVersion=" + Utils.LMComVersion, data, completed);
        }
        else {
            if (!isPost && data)
                url += "&par=" + encodeURIComponent(data);
            Logger.trace('<#' + timestamp + ' doAjax', 'url=' + url + (isPost ? ', data=' + data : ''));
            $.ajax(url, {
                async: true,
                type: isPost ? 'POST' : 'GET',
                dataType: isCrossDomain ? 'jsonp' : 'text',
                data: isPost ? data : '',
                contentType: "text/plain; charset=UTF-8",
                headers: { "LoggerLogId": Logger.logId(), "LMComVersion": Utils.LMComVersion }
            }).
                done(function (res) { if (completed)
                completed(res); }).
                fail(function () { debugger; Logger.error('Ajax.doAjax', url, ''); });
        }
    }
    Pager.doAjax = doAjax;
    //Obsolete, POST (nema obecne callback - pro crossdomain) 
    function ajaxPost(pthType, type, data, completed, error) {
        if (completed === void 0) { completed = null; }
        if (error === void 0) { error = null; }
        var url = Pager.path(pthType);
        doAjax(true, url, type, JSON.stringify(data), function (str) {
            if (!completed)
                return;
            var res = typeof str == 'string' ? (_.isEmpty(str) ? {} : JSON.parse(str)) : str;
            //if (res.error && res.error != 0)
            //  if (res.error == 999) Logger.error('ajaxPost', url + ": " + res.errorText + ", " + url, '');
            //  else {
            //    if (error) error(res.error, res.errorText); else Logger.error('ajaxPost', res.errorText, '');
            //  }
            //else if (completed != null) completed(res.result);
            if (res.error && res.error != 0)
                switch (res.error) {
                    case 999:
                        Logger.error('ajaxGet', url + ": " + res.errorText + ", " + url, '');
                        break;
                    case 998:
                        Logger.error('Warning: User logged under other account', url + ": " + res.errorText, '');
                        LMStatus.LogoutLow();
                        break;
                    default:
                        if (error)
                            error(res.error, res.errorText);
                        else
                            Logger.error('ajaxGet', res.errorText, '');
                        break;
                }
            else if (completed != null)
                completed(res.result);
        });
    }
    Pager.ajaxPost = ajaxPost;
    //export function ajaxGetEx<T>(pthType: Pager.pathType, type: string, objData: T, completed: (res: any) => void, error: (id: number, msg: string) => void = null): void {
    //  var url = Pager.path(pthType);
    //  doAjax(false, url, type, JSON.stringify(objData),
    //    (str: any) => {
    //      var res: LMComLib.RpcResponse = typeof str == 'string' ? JSON.parse(str) : str;
    //      if (res.error && res.error != 0)
    //        switch (res.error) {
    //          case 999:
    //            Logger.error('ajaxGet', url + ": " + res.errorText + ", " + url, '');
    //            break;
    //          case 998:
    //            break;
    //          default:
    //            if (error) error(res.error, res.errorText); else Logger.error('ajaxGet', res.errorText, '');
    //            break;
    //        }
    //      else if (completed != null) completed(res.result);
    //    });
    //}
    //Obsolete, GET
    function ajaxGet(pthType, type, objData, completed, error) {
        if (error === void 0) { error = null; }
        var url = Pager.path(pthType);
        doAjax(false, url, type, JSON.stringify(objData), function (str) {
            var res = typeof str == 'string' ? JSON.parse(str) : str;
            if (res.error && res.error != 0)
                switch (res.error) {
                    case 999:
                        Logger.error('ajaxGet', url + ": " + res.errorText + ", " + url, '');
                        break;
                    case 998:
                        Logger.error('Warning: User logged under other account', url + ": " + res.errorText, '');
                        LMStatus.LogoutLow();
                        break;
                    default:
                        if (error)
                            error(res.error, res.errorText);
                        else
                            Logger.error('ajaxGet', res.errorText, '');
                        break;
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
    if (window.FormData && ((options.dataType && (options.dataType == 'blob' || options.dataType == 'arraybuffer'))
        || (options.data && ((window.Blob && options.data instanceof Blob)
            || (window.ArrayBuffer && options.data instanceof ArrayBuffer))))) {
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
(function (validate_1) {
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
        types[types["regEx"] = 9] = "regEx";
    })(validate_1.types || (validate_1.types = {}));
    var types = validate_1.types;
    var c_email = function () { return CSLocalize('27747c60f8a24429855917008c65521f', 'E-mail'); };
    var c_password = function () { return CSLocalize('74a95445936f44558cd585dd8b3d7b29', 'Password'); };
    var c_confirmPsw = function () { return CSLocalize('16636e21101c4ebf8a1bae8f358da7b5', 'Confirm password'); };
    function email(prop, required) {
        prop.required = required;
        return validate.inputModel("email", c_email(), prop, validate.types.email);
    }
    validate_1.email = email;
    function regex(prop, mask, name, title) {
        prop.mask = mask;
        return validate.inputModel(name, title, prop, validate.types.regEx);
    }
    validate_1.regex = regex;
    function minLen(prop, minLen, name, title) {
        prop.min = minLen;
        return validate.inputModel(name, title, prop, validate.types.minlength);
    }
    validate_1.minLen = minLen;
    function password(prop, minLen, name, title) {
        if (name === void 0) { name = "password"; }
        if (title === void 0) { title = null; }
        if (title == null)
            title = c_password();
        prop.min = minLen;
        return validate.inputModel(name, title, prop, validate.types.minlength, validate.controlType.password);
    }
    validate_1.password = password;
    function confirmPsw(prop, on) {
        prop.on = on;
        return validate.inputModel("confirmPsw", c_confirmPsw(), prop, validate.types.depended, validate.controlType.password);
    }
    validate_1.confirmPsw = confirmPsw;
    function Null() {
        return validate.inputModel(null, null, null, null, null);
    }
    validate_1.Null = Null;
    function empty(prop, name, title) {
        return validate.inputModel(name, title, prop, validate.types.empty);
    }
    validate_1.empty = empty;
    (ko.extenders).lm = function (target, par) {
        if (target.type == types.empty) {
            target.validate = function () { };
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
            if (fake === void 0) { fake = null; }
            if (force === void 0) { force = false; }
            var value = $.trim(target());
            switch (target.type) {
                case types.regEx:
                    var valid = target.mask.test(value);
                    msg = valid ? null : target.errorMessage || validate_1.messages.required();
                    break;
                case types.email:
                    var empty = value.length == 0;
                    var valid = !(target.required && empty);
                    msg = valid ? null : validate_1.messages.required();
                    if (valid && !empty) {
                        valid = /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))$/i.test(value);
                        msg = valid ? null : target.errorMessage || validate_1.messages.email();
                    }
                    break;
                case types.required:
                    var valid = value.length > 0;
                    msg = valid ? null : target.errorMessage || validate_1.messages.required();
                    break;
                case types.minlength:
                    var len = value.length;
                    var valid = len >= target.min;
                    msg = valid ? null : Utils.string_format(target.errorMessage || validate_1.messages.minlength(), [target.min]);
                    break;
                case types.rangelength:
                    var len = value.length;
                    var valid = len >= target.min && len <= target.max;
                    msg = valid ? null : Utils.string_format(target.errorMessage || validate_1.messages.rangelength(), [target.min, target.max]);
                    break;
                case types.range:
                    var val = validInt(value);
                    var valid = !isNaN(val) && val >= target.min && val <= target.max;
                    msg = valid ? null : Utils.string_format(target.errorMessage || validate_1.messages.range(), [target.min, target.max]);
                    break;
                case types.rangeMin:
                    var val = validInt(value);
                    var valid = !isNaN(val) && val >= target.min;
                    msg = valid ? null : Utils.string_format(target.errorMessage || validate_1.messages.min(), [target.min]);
                    break;
                case types.rangeMax:
                    var val = validInt(value);
                    var valid = !isNaN(val) && val <= target.max;
                    msg = valid ? null : Utils.string_format(target.errorMessage || validate_1.messages.max(), [target.max]);
                    break;
                case types.depended:
                    var valid = ($.trim(target.on()) == value) && (value.length > 0);
                    msg = valid ? null : target.errorMessage || validate_1.messages.equalTo();
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
        if (target.type == types.depended)
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
        target.validate = function () { return validate(null, true); };
        target.resetFocusStatus = function () { return focusStatus = 0; };
        target.get = function () {
            var value = $.trim(target());
            switch (target.type) {
                case types.email:
                    return value.toLowerCase();
                case types.range:
                case types.rangeMin:
                case types.rangeMax:
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
        return isPropsValid(_.map(models, function (m) { return m.prop; }));
        //var res = true;
        //_.each(models, (inp: validate.InputModel) => {
        //  if (!inp.prop) return;
        //  inp.prop.validate();
        //  res = res && (!inp.prop.hasError || !inp.prop.hasError());
        //});
        //return res;
    }
    validate_1.isValid = isValid;
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
    validate_1.isPropsValid = isPropsValid;
    (function (controlType) {
        controlType[controlType["text"] = 0] = "text";
        controlType[controlType["password"] = 1] = "password";
    })(validate_1.controlType || (validate_1.controlType = {}));
    var controlType = validate_1.controlType;
    function create(type, finish) {
        if (finish === void 0) { finish = null; }
        var res = ko.observable();
        res.type = type;
        if (finish)
            finish(res);
        res.extend({ lm: null });
        return res;
    }
    validate_1.create = create;
    function inputModel(name, title, prop, valType, type) {
        if (type === void 0) { type = controlType.text; }
        var res = { name: name, title: title, prop: prop, textType: null, btnTitle: null };
        if (prop == null)
            return res;
        switch (type) {
            case controlType.text:
                res.textType = "text";
                break;
            case controlType.password:
                res.textType = "password";
                break;
        }
        prop.type = valType;
        prop.extend({ lm: { x: true } });
        return res;
    }
    validate_1.inputModel = inputModel;
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
    validate_1.messages = {
        required: function () { return CSLocalize('8dd00c8210854c5eb8fb7bc017cfa21e', 'This field is required.'); },
        email: function () { return CSLocalize('c913db0985a940c09d95ebfa7459a4be', 'Please enter a valid email address.'); },
        equalTo: function () { return CSLocalize('9a47c9f99dce4e43859d7029e9ae6955', 'Please enter the same value again.'); },
        remote: function () { return "Please fix this field."; },
        url: function () { return "Please enter a valid URL."; },
        date: function () { return "Please enter a valid date."; },
        dateISO: function () { return "Please enter a valid date (ISO)."; },
        number: function () { return "Please enter a valid number."; },
        digits: function () { return "Please enter only digits."; },
        creditcard: function () { return "Please enter a valid credit card number."; },
        maxlength: function () { return "Please enter no more than {0} characters."; },
        minlength: function () { return CSLocalize('106ee5f0757b4829af9c71cc2c557093', 'Please enter at least 3 characters.'); },
        rangelength: function () { return CSLocalize('915e1b2dbd2d44df89cdf4e9bbdee3df', 'Please enter a value between {0} and {1} characters long.'); },
        range: function () { return "Please enter a value between {0} and {1}."; },
        max: function () { return "Please enter a value less than or equal to {0}."; },
        min: function () { return CSLocalize('f03951d4577b484ca04b639ad6d96514', 'Please enter a value greater than or equal to {0}.'); }
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
        res.Items = _.map(nd.items(), function (it) { return nodeToData(it); });
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
            _.each(self.Items, function (it) { return adjustParents(it, self); });
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
            this.refreshCutPaste = ko.observable(0); //fake observable pro vynuceni aktualizace nekterych computed observables
            this.root = new Node(data, null, this, isNew, isLocked);
        }
        Model.prototype.getResult = function () {
            return nodeToData(this.root);
        };
        Model.prototype.getJSON = function () {
            return JSON.stringify(this.getResult());
        };
        Model.prototype.cutCopy = function (nd, isCut) {
            try {
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
            }
            finally {
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
            }
            else {
                var dt = nodeToData(cutCopied);
                cutCopied = new Node(dt, null, this, true, null);
            }
            if (isFirst) {
                nd.items.splice(0, 0, cutCopied);
                nd.adjustIcon();
                cutCopied.parent = nd;
            }
            else {
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
            }
            else {
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
                var inputbox = "<input type='text' class='inputbox' value=\"" + nd.title() + "\">"; //Insert the HTML into the div 
                el.html(inputbox);
                var input = el.find("input.inputbox");
                input.click(function () { return false; }); //spolkni click
                input.focus(); //Immediately give the input box focus
                input.keydown(function (ev) {
                    if (ev.keyCode == 13) {
                        var value = input.val();
                        nd.title(value);
                        nd.title.valueHasMutated();
                        self.edited = null;
                    }
                    else if (ev.keyCode == 27) {
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
        return _.any(nd.items(), function (it) { return it.isLocked || hasIsLocked(it); });
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
            self.items = data.Items ? ko.observableArray(_.map(data.Items, function (it) { return new Node(it, self, model, isNew, isLocked); })) : ko.observableArray();
            //inicializace fieldu
            self.adjustIcon();
            //Checked
            self.checked.subscribe(self.onChecked, self);
            //Expand
            self.expanded.subscribe(function (isExp) { self.adjustIcon(); });
            //Display Tools
            self.displayDelete = this.testDisplay(function () { return !self.isLocked && !!self.parent && !hasIsLocked(self); });
            self.displayEdit = ko.computed(function () { return true; });
            self.displayAddNext = this.testDisplay(function () { return !!self.parent; });
            self.displayAddFirst = ko.computed(function () { return true; });
            self.displayCut = this.testDisplay(function () { return !!self.parent; });
            self.displayCopy = ko.computed(function () { return true; });
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
            self.displayPasteNext = this.testDisplay(function () { return !!self.parent && self.displayPasteFirst(); });
            //prida metody jmene itsMeHover a itsMeEdit k modelu. Ty pak zajisti volani registerElement('Hover', el), coz je sance zaregistrovat nebo pouzit element.
            ko_bindingHandlers_itsMe_register(self, ['Hover', 'Edit']);
        }
        //*********** basic opers
        Node.prototype.hover = function (ishover) { this.model.hover(this, ishover); };
        Node.prototype.expandCollapse = function () { this.expanded(!this.expanded()); };
        Node.prototype.testDisplay = function (cond) {
            var _this = this;
            return ko.computed(function () {
                if (!_this.model.options.editable)
                    return false; //netestuje se pro not editable mode
                if (_this.model.refreshCutPaste() < 0)
                    return false; //sideefekt / prepocitani computed observable
                return cond();
            });
        };
        //inicializace dulezituch HTML tagu
        Node.prototype.registerElement = function (itsMeName, el) {
            var _this = this;
            switch (itsMeName) {
                case "Hover":
                    $(el).hover(function () { return _this.hover(true); }, function () { return _this.hover(false); });
                    break;
                case "Edit":
                    this.editElement = $(el);
                    break;
            }
        };
        //*********** Helper
        Node.prototype.hasChild = function () { return this.items().length > 0; };
        Node.prototype.adjustIcon = function () { this.icon(this.hasChild() ? (this.expanded() ? 'folder-open' : 'folder') : 'book'); };
        Node.prototype.displayTools = function () { return this.model.options.editable && this.hovered() && this.model.edited != this; };
        Node.prototype.doEdit = function () { this.model.edit(this); };
        Node.prototype.doDelete = function () { this.parent.items.remove(this); this.parent.adjustIcon(); };
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
            _.forEach(this.items(), function (i) { return i.checked(checked); });
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
        Node.prototype.allChildrenChecked = function () { return _.all(this.items(), function (i) { return i.checked(); }); };
        Node.prototype.doCut = function () { this.model.cutCopy(this, true); };
        Node.prototype.doCopy = function () { this.model.cutCopy(this, false); };
        Node.prototype.doPasteFirst = function () { this.model.paste(this, true); };
        Node.prototype.doPasteNext = function () { this.model.paste(this, false); };
        return Node;
    })();
    TreeView.Node = Node;
})(TreeView || (TreeView = {}));

//Facebook: https://www.facebook.com/dialog/oauth ### https://graph.facebook.com/me
//    https://developers.facebook.com/docs/reference/dialogs/oauth/ ### comma delimited scope: email ostatni automaticky
//Google: https://accounts.google.com/o/oauth2/auth ### https://www.googleapis.com/oauth2/v1/userinfo 
//    https://developers.google.com/accounts/docs/OAuth2Login ### space delimited scope: https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile
//Microsoft: https://login.live.com/oauth20_authorize.srf ### ??? mozna vrati automaticky ??? 
//    http://msdn.microsoft.com/en-us/library/live/hh826532.aspx ### space delimited scope: wl.signin wl.basic wl.email
//LinkedIn: https://api.linkedin.com/uas/oauth/requestToken ### http://api.linkedin.com/v1/people/~:(id,first-name,last-name,email-address)  viz http://developer.linkedin.com/documents/field-selectors
//    https://developer.linkedin.com/documents/authentication ### space delimited scope: r_basicprofile r_emailaddress (r_contactinfo)
//Yandex: https://oauth.yandex.com/authorize ### http://api-fotki.yandex.ru/api/me/ (viz http://api.yandex.com/oauth/doc/dg/reference/accessing-protected-resource.xml)
//    http://api.yandex.com/oauth/doc/dg/tasks/register-client.xml, http://api.yandex.com/oauth/doc/dg/yandex-oauth-dg.pdf, http://api.yandex.com/oauth/doc/dg/reference/obtain-access-token.xml
//Yahoo: neumi
//if ((<any>window).XDomainRequest) {
//  (<any>jQuery).ajaxTransport('+', function (s) { 
//    if (s.crossDomain && s.async) {
//      if (s.timeout) {
//        s.xdrTimeout = s.timeout;
//        delete s.timeout;
//      }
//      var xdr;
//      return {
//        send: function (_, complete) {
//          function callback(status, statusText, responses=null, responseHeaders=null) {
//            xdr.onload = xdr.onerror = xdr.ontimeout = jQuery.noop;
//            xdr = undefined;
//            complete(status, statusText, responses, responseHeaders);
//          }
//          xdr = new XDomainRequest();
//          xdr.onload = function () {
//            callback(200, "OK", { text: xdr.responseText }, "Content-Type: " + xdr.contentType);
//          };
//          xdr.onerror = function () {
//            callback(404, "Not Found");
//          };
//          xdr.onprogress = jQuery.noop;
//          xdr.ontimeout = function () {
//            callback(0, "timeout");
//          };
//          xdr.timeout = s.xdrTimeout || Number.MAX_VALUE;
//          xdr.open(s.type, s.url);
//          xdr.send((s.hasContent && s.data) || null);
//        },
//        abort: function () {
//          if (xdr) {
//            xdr.onerror = jQuery.noop;
//            xdr.abort();
//          }
//        }
//      };
//    }
//  });
//}
var OAuth;
(function (OAuth) {
    var client_type;
    switch (location.host.toLowerCase()) {
        case "www.langmaster.com":
            client_type = location.protocol == "http:" ? "www_lm" : "s_www_lm";
            break;
        case "test.langmaster.com":
            client_type = location.protocol == "http:" ? "test_lm" : "s_test_lm";
            break;
        case "www.eduland.vn":
            client_type = location.protocol == "http:" ? "eduland" : "s_eduland";
            break;
        case "langmaster.jjlearning.com.mx":
            client_type = location.protocol == "http:" ? "alan" : "s_alan";
            break;
        case "www.onlinetesty.skrivanek.cz":
        case "onlinetesty.skrivanek.cz":
            client_type = location.protocol == "http:" ? "skrivanek" : "s_skrivanek";
            break;
        //case "localhost": client_type = "localhost"; break;
        default:
            client_type = null;
            break;
    }
    ;
    var cfg = [];
    function addCfg(providerid, client_id, authorizationUrl, ajaxUrl, scopes, logoutUrl, ajaxUrlJsonp, parseProfile, isCode, client_secret) {
        if (isCode === void 0) { isCode = false; }
        if (client_secret === void 0) { client_secret = null; }
        var c = { providerid: providerid, client_id: client_id, authorizationUrl: authorizationUrl, ajaxUrl: ajaxUrl, scopes: scopes, parseProfile: parseProfile, isCode: isCode, client_secret: client_secret, logoutUrl: logoutUrl, ajaxUrlJsonp: ajaxUrlJsonp };
        cfg[c.providerid.toString()] = c;
    }
    /********************* FACEBOOK *****************************/
    //https://developers.facebook.com/docs/reference/dialogs/oauth/ 
    //pavel.zika@langmaster.com / edurom
    addCfg(LMComLib.OtherType.Facebook, {
        www_lm: '217099001634050',
        test_lm: '202002813170094',
        s_www_lm: '600606046618350',
        s_test_lm: '615996988429168',
        eduland: '491123084355646',
        s_eduland: '491123084355646',
        alan: '266038006937055',
        s_alan: '266038006937055',
        skrivanek: '849519431765938',
        s_skrivanek: '849519431765938',
    }, 
    //{ www_lm: "600606046618350", test_lm: "600606046618350" },
    //logout http://forums.asp.net/t/1768815.aspx/1
    "https://www.facebook.com/dialog/oauth", "https://graph.facebook.com/me", "email", "https://www.facebook.com", null, function (obj, providerid) { var res = { id: obj.id, email: obj.email, firstName: obj.first_name, lastName: obj.last_name, providerid: providerid }; return res; });
    /********************* GOOGLE *****************************/
    //https://developers.google.com/accounts/docs/OAuth2UserAgent
    //https://code.google.com/apis/console/#project:475616334704:access, langmaster.com@gmail.com / asdfghjkl123_
    addCfg(LMComLib.OtherType.Google, {
        www_lm: '475616334704.apps.googleusercontent.com',
        test_lm: '475616334704-7caok7nqami8aio7aircs52rd1qag254.apps.googleusercontent.com',
        s_www_lm: '475616334704.apps.googleusercontent.com',
        s_test_lm: '475616334704-7caok7nqami8aio7aircs52rd1qag254.apps.googleusercontent.com',
        eduland: '475616334704-g6b9to8r245jh1mrf1k233b99lttv1ed.apps.googleusercontent.com',
        s_eduland: '475616334704-g6b9to8r245jh1mrf1k233b99lttv1ed.apps.googleusercontent.com',
        alan: '475616334704-0le99lu79aomar2rnaa1upp3ajop361g.apps.googleusercontent.com',
        s_alan: '475616334704-0le99lu79aomar2rnaa1upp3ajop361g.apps.googleusercontent.com',
        skrivanek: '475616334704-4f78jgp3s5hqum8tnb9b37lpp93vkogv.apps.googleusercontent.com',
        s_skrivanek: '475616334704-4f78jgp3s5hqum8tnb9b37lpp93vkogv.apps.googleusercontent.com',
    }, 
    //https://github.com/valenting/ffos-google-contact-importer/blob/master/index.html
    "https://accounts.google.com/o/oauth2/auth", "https://www.googleapis.com/oauth2/v1/userinfo", "https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile", "http://accounts.google.com/Logout", "https://www.googleapis.com/oauth2/v1/tokeninfo", 
    //"https://accounts.google.com/o/oauth2/auth", "https://www.googleapis.com/oauth2/v1/userinfo", "https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile", "http://google.com/",
    //"https://accounts.google.com/o/oauth2/auth", "https://www.googleapis.com/oauth2/v1/userinfo", "https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile", "http://google.com/",
    function (obj, providerid) {
        //debugger;
        //var res: profile = { id: obj.id, email: obj.email, firstName: obj.given_name, lastName: obj.family_name, providerid: providerid }; return res;
        var res = { id: wrongMSIE ? obj.user_id : obj.id, email: obj.email, firstName: obj.given_name, lastName: obj.family_name, providerid: providerid };
        return res;
    });
    /********************* MICROSOFT *****************************/
    //http://msdn.microsoft.com/en-us/library/live/hh826532.aspx
    //https://manage.dev.live.com/Applications/Index, pjanecek@langmaster.cz / cz.langmaster
    addCfg(LMComLib.OtherType.Microsoft, {
        www_lm: '00000000400DF001',
        test_lm: '00000000440EEFCD',
        s_www_lm: '00000000400DF001',
        s_test_lm: '00000000440EEFCD',
        eduland: '000000004011E10D',
        s_eduland: '000000004011E10D',
        alan: '000000004412613C',
        s_alan: '000000004412613C',
        skrivanek: '0000000048135E31',
        s_skrivanek: '0000000048135E31',
    }, "https://login.live.com/oauth20_authorize.srf", 
    //"https://apis.live.net/v5.0/me", 
    "https://apis.live.net/v5.0/me", "wl.signin wl.basic wl.emails", "https://login.live.com/", null, function (obj, providerid) { var res = { id: obj.id, email: _.compact(_.values(obj.emails))[0], firstName: obj.first_name, lastName: obj.last_name, providerid: providerid }; return res; });
    /********************* LM *****************************/
    addCfg(LMComLib.OtherType.LANGMaster, null, null, null, null, null, null, null);
    addCfg(LMComLib.OtherType.LANGMasterNoEMail, null, null, null, null, null, null, null);
    //https://developer.linkedin.com/documents/authentication
    //addCfg(LMComLib.OtherType.LinkedIn, "bbeqjmfcikpm", "https://www.linkedin.com/uas/oauth2/authorization", "http://api.linkedin.com/v1/people/~:(id,first-name,last-name,email-address)", "r_basicprofile,r_emailaddress",
    //  (obj: any) => { var res: profile = { id: obj.id, email: obj.email, firstName: obj.first_name, lastName: obj.last_name }; return res; },
    //  true, "uh6OBJA1uY5reZgh");
    OAuth.validProviders = _.pluck(_.values(cfg), "providerid");
    function logoutUrl(type) { return cfg[type].logoutUrl; }
    OAuth.logoutUrl = logoutUrl;
    //Start externi authorizace, do cookie dej sessionState
    function authrequest(providerid) {
        var co = cfg[providerid.toString()];
        Logger.trace_oauth("authrequest, config: " + JSON.stringify(co));
        //cookie content
        var sessState = { providerid: providerid, state: Utils.guid() };
        //remove hash
        var ru = window.location.href, idx = window.location.href.indexOf("#");
        if (idx >= 0)
            ru = ru.substring(0, idx);
        var request = {
            response_type: "token",
            state: sessState.state,
            redirect_uri: ru,
            client_id: co.client_id[client_type],
            scope: co.scopes
        };
        var authurl = Utils.encodeURL(co.authorizationUrl, request);
        Logger.trace_oauth("authrequest, request: " + JSON.stringify(request));
        Cook.write(LMComLib.CookieIds.oauth, JSON.stringify(sessState), false);
        window.location.href = authurl;
    }
    OAuth.authrequest = authrequest;
    ;
    function checkForToken(completed) {
        checkfortoken(function (provider, token, isError, error) {
            if (isError)
                completed(null);
            OAuth.getData(provider, token, completed);
        });
    }
    OAuth.checkForToken = checkForToken;
    function parseQueryString(qs) {
        var e, a = /\+/g, r = /([^&;=]+)=?([^&;]*)/g, d = function (s) { return decodeURIComponent(s.replace(a, " ")); }, q = qs, urlParams = {};
        while (e = r.exec(q))
            urlParams[d(e[1])] = d(e[2]);
        return urlParams;
    }
    //Navrat z externi authorizace, vyuzij sessionState z cookie
    /*
     * Check if the hash contains an access token.
     * And if it do, extract the state
     */
    function checkfortoken(callback) {
        //cookie info
        var ck = Cook.read(LMComLib.CookieIds.oauth, null);
        Logger.trace_oauth("checkfortoken, cookie: " + ck);
        Cook.remove(LMComLib.CookieIds.oauth);
        if (ck == null || ck == "") {
            callback(null, null, true, "missing session cookie");
            return;
        }
        var sessState = JSON.parse(ck);
        var provider = cfg[sessState.providerid.toString()];
        //check and normalize hash
        var h = window.location.hash;
        Logger.trace_oauth("checkfortoken, hash: " + h);
        if (h == null) {
            callback(null, null, true, "missing hash");
            return;
        }
        while (h.indexOf('#') >= 0)
            h = h.substring(h.indexOf('#') + 1);
        if (h.indexOf("access_token") === -1) {
            callback(null, null, true, "missing access token");
            return;
        }
        //parse hash
        var atoken = parseQueryString(h);
        //check State
        if (atoken.state && atoken.state != sessState.state) {
            callback(null, null, true, "wrong state");
            return;
        }
        Logger.trace_oauth("checkfortoken, token: " + atoken.access_token);
        //return access token
        callback(provider, atoken.access_token, false, null);
    }
    OAuth.checkfortoken = checkfortoken;
    var wrongMSIE = $.browser.msie && parseInt($.browser.version, 10) <= 9; //neumi CORS, musi byt JSONP
    function getData(provider, token, completed) {
        Logger.trace_oauth("getData, token: " + token);
        var url = wrongMSIE ? provider.ajaxUrlJsonp : provider.ajaxUrl;
        if (url == null)
            url = provider.ajaxUrl;
        $.support.cors = true;
        $.ajax({
            type: "GET",
            crossDomain: true,
            url: url,
            //dataType: 'json',
            dataType: wrongMSIE ? 'jsonp' : 'json',
            success: function (data) { Logger.trace_oauth("getData, token" + JSON.stringify(data)); completed(provider.parseProfile(data, provider.providerid)); },
            data: { access_token: token },
            error: function (jqXHR, textStatus, errorThrown) {
                Logger.trace_oauth('*** error: ' + textStatus + ", " + errorThrown);
                if (jqXHR.status === 401)
                    Logger.trace_oauth("Token expired. About to delete this token");
            }
        });
    }
    OAuth.getData = getData;
})(OAuth || (OAuth = {}));
//xx/#DEBUG
var Logger;
(function (Logger) {
    function trace_oauth(msg) {
        Logger.trace("OAuth", msg);
    }
    Logger.trace_oauth = trace_oauth;
})(Logger || (Logger = {}));
//xx/#ENDDEBUG
//var noop = null;

var EMailer;
(function (EMailer) {
    var defaultDesign = (function () {
        function defaultDesign() {
            this.domain = 'LANGMaster.com';
            this.from = "support@langmaster.com";
        }
        defaultDesign.prototype.wishSuccess = function () { return CSLocalize('06eb87db06e14cf2bad2607093c2bfe7', 'We wish you success with LANGMaster educational products.'); };
        defaultDesign.prototype.LMTeam = function () { return CSLocalize('f217bebab2ad4bfaa456264c9d0ab51d', 'LANGMaster team'); };
        defaultDesign.prototype.contact = function () { return 'LANGMaster, Branicka 107, 147 00 Praha 4, Czech Republic, <a href="mailto:info@langmaster.cz">info@langmaster.cz</a>, <a href="http://www.langmaster.com">www.langmaster.com</a>.'; };
        defaultDesign.prototype.rights = function () { return '© 2011 LANGMaster.All rights reserved.'; };
        return defaultDesign;
    })();
    EMailer.defaultDesign = defaultDesign;
    EMailer.actEmailDesign = new defaultDesign();
    EMailer.from = "support@langmaster.com";
    function sendEMail(cmd, completed, error) {
        if (error === void 0) { error = null; }
        try {
            if (!cmd.From)
                cmd.From = EMailer.actEmailDesign.from;
            cmd['skin'] = EMailer.actEmailDesign;
            //var cmd = LMComLib.CmdEMail_Create(Utils.Empty(em.from) ? from : em.from, em.to, em.cc, em.subject, tmpl.render(em), em.isForgotPassword);
            cmd.Html = JsRenderTemplateEngine.render("TEmail", cmd);
            if (cmd.Html.indexOf("Error") == 0)
                throw "Render error";
            Pager.doAjaxCmd(true, Pager.path(Pager.pathType.restServices), LMComLib.CmdEMail_Type, JSON.stringify(cmd), completed, error);
        }
        catch (err) {
            if (error != null)
                error(999, "Send email error: + err");
        }
    }
    EMailer.sendEMail = sendEMail;
})(EMailer || (EMailer = {}));

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
    (function (CmdReportType) {
        CmdReportType[CmdReportType["evaluators"] = 0] = "evaluators";
        CmdReportType[CmdReportType["test"] = 1] = "test";
    })(Login.CmdReportType || (Login.CmdReportType = {}));
    var CmdReportType = Login.CmdReportType;
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
    function CmdConfirmRegistration_Create(lmcomId, sessionId) {
        return { lmcomId: lmcomId, sessionId: sessionId };
    }
    Login.CmdConfirmRegistration_Create = CmdConfirmRegistration_Create;
    Login.CmdChangePassword_Type = 'Login.CmdChangePassword';
    function CmdChangePassword_Create(oldPassword, newPassword, lmcomId, sessionId) {
        return { oldPassword: oldPassword, newPassword: newPassword, lmcomId: lmcomId, sessionId: sessionId };
    }
    Login.CmdChangePassword_Create = CmdChangePassword_Create;
    Login.CmdLmLogin_Type = 'Login.CmdLmLogin';
    function CmdLmLogin_Create(login, email, password, otherData, ticket) {
        return { login: login, email: email, password: password, otherData: otherData, ticket: ticket };
    }
    Login.CmdLmLogin_Create = CmdLmLogin_Create;
    Login.CmdMyInit_Type = 'Login.CmdMyInit';
    function CmdMyInit_Create(lmcomId, sessionId) {
        return { lmcomId: lmcomId, sessionId: sessionId };
    }
    Login.CmdMyInit_Create = CmdMyInit_Create;
    Login.CmdSaveDepartment_Type = 'Login.CmdSaveDepartment';
    function CmdSaveDepartment_Create(userId, companyId, departmentId) {
        return { userId: userId, companyId: companyId, departmentId: departmentId };
    }
    Login.CmdSaveDepartment_Create = CmdSaveDepartment_Create;
    Login.CmdProfile_Type = 'Login.CmdProfile';
    function CmdProfile_Create(Cookie, lmcomId, sessionId) {
        return { Cookie: Cookie, lmcomId: lmcomId, sessionId: sessionId };
    }
    Login.CmdProfile_Create = CmdProfile_Create;
    Login.CmdRegister_Type = 'Login.CmdRegister';
    function CmdRegister_Create(password, subSite, Cookie, lmcomId, sessionId) {
        return { password: password, subSite: subSite, Cookie: Cookie, lmcomId: lmcomId, sessionId: sessionId };
    }
    Login.CmdRegister_Create = CmdRegister_Create;
    Login.CmdEnterLicKey_Type = 'Login.CmdEnterLicKey';
    function CmdEnterLicKey_Create(CompLicId, Counter, lmcomId, sessionId) {
        return { CompLicId: CompLicId, Counter: Counter, lmcomId: lmcomId, sessionId: sessionId };
    }
    Login.CmdEnterLicKey_Create = CmdEnterLicKey_Create;
    Login.CmdHumanEvalManagerLangs_Type = 'Login.CmdHumanEvalManagerLangs';
    function CmdHumanEvalManagerLangs_Create(lmcomId, companyId) {
        return { lmcomId: lmcomId, companyId: companyId };
    }
    Login.CmdHumanEvalManagerLangs_Create = CmdHumanEvalManagerLangs_Create;
    Login.CmdHumanEvalManagerEvsGet_Type = 'Login.CmdHumanEvalManagerEvsGet';
    function CmdHumanEvalManagerEvsGet_Create(lmcomId, companyId) {
        return { lmcomId: lmcomId, companyId: companyId };
    }
    Login.CmdHumanEvalManagerEvsGet_Create = CmdHumanEvalManagerEvsGet_Create;
    Login.CmdHumanEvalManagerEvsSave_Type = 'Login.CmdHumanEvalManagerEvsSave';
    function CmdHumanEvalManagerEvsSave_Create(companyUserId, companyId, email, evalInfos) {
        return { companyUserId: companyUserId, companyId: companyId, email: email, evalInfos: evalInfos };
    }
    Login.CmdHumanEvalManagerEvsSave_Create = CmdHumanEvalManagerEvsSave_Create;
    Login.CmdHumanEvalManagerGet_Type = 'Login.CmdHumanEvalManagerGet';
    function CmdHumanEvalManagerGet_Create(lmcomId, courseLang, companyId) {
        return { lmcomId: lmcomId, courseLang: courseLang, companyId: companyId };
    }
    Login.CmdHumanEvalManagerGet_Create = CmdHumanEvalManagerGet_Create;
    Login.CmdHumanEvalManagerSet_Type = 'Login.CmdHumanEvalManagerSet';
    function CmdHumanEvalManagerSet_Create(evaluators) {
        return { evaluators: evaluators };
    }
    Login.CmdHumanEvalManagerSet_Create = CmdHumanEvalManagerSet_Create;
    Login.CmdHumanEvalGet_Type = 'Login.CmdHumanEvalGet';
    function CmdHumanEvalGet_Create(lmcomId, companyId) {
        return { lmcomId: lmcomId, companyId: companyId };
    }
    Login.CmdHumanEvalGet_Create = CmdHumanEvalGet_Create;
    Login.CmdHumanEvalTest_Type = 'Login.CmdHumanEvalTest';
    function CmdHumanEvalTest_Create(companyUserId, courseUserId) {
        return { companyUserId: companyUserId, courseUserId: courseUserId };
    }
    Login.CmdHumanEvalTest_Create = CmdHumanEvalTest_Create;
    Login.CmdReport_Type = 'Login.CmdReport';
    function CmdReport_Create(self, companyId, type) {
        return { self: self, companyId: companyId, type: type };
    }
    Login.CmdReport_Create = CmdReport_Create;
    Login.CmdPaymentReport_Type = 'Login.CmdPaymentReport';
    function CmdPaymentReport_Create(cfg, self, companyId, type) {
        return { cfg: cfg, self: self, companyId: companyId, type: type };
    }
    Login.CmdPaymentReport_Create = CmdPaymentReport_Create;
})(Login || (Login = {}));

var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Login;
(function (Login) {
    Login.cfg;
    function getHash(type) {
        return [Login.appId, type].join('@');
    }
    Login.getHash = getHash;
    Login.myData; //info o mojich firmach, produktech a rolich
    //pro Admin.html
    function isSystemAdmin() { return ((Login.myData.Roles & Login.Role.Admin) != 0) || ((Login.myData.Roles & Login.Role.Comps) != 0); }
    Login.isSystemAdmin = isSystemAdmin; //PZ
    function isRoleComps() { return (Login.myData.Roles & Login.Role.Comps) != 0; }
    Login.isRoleComps = isRoleComps; //ZZ, RJ, PJ, ktere PZ urci 
    function companyExists() { return _.any(Login.myData.Companies, function (c) { return (c.RoleEx.Role == LMComLib.CompRole.Admin) || ((c.RoleEx.Role & ~LMComLib.CompRole.Admin) != 0) || (c.Courses != null && c.Courses.length > 0); }); }
    Login.companyExists = companyExists;
    //export function isCompAdmin() { return _.any(myData.Companies, (c: Login.MyCompany) => (c.Roles & ~Login.CompRole.Admin) != 0); } //Chinh povoli nejakou company roli (products nebo key)
    //export function isCompStudent() { return _.any(myData.Companies, (c: Login.MyCompany) => (c.Courses != null && c.Courses.length > 0)); } //existuje nejaky prirazeny kurz
    LMStatus.onLogged = function (completed) {
        if (!LMStatus.isLogged()) {
            completed();
            return;
        }
        if (Pager.afterLoginInit)
            Pager.afterLoginInit(function () { return adjustMyData(false, completed); });
        else
            adjustMyData(false, completed);
    };
    function adjustMyData(force, completed) {
        if (!force && Login.myData != null && Login.myData.UserId == LMStatus.Cookie.id) {
            completed();
            return;
        }
        //info o firmach, produktech a rolich
        Pager.ajaxGet(Pager.pathType.restServices, Login.CmdMyInit_Type, LMStatus.createCmd(function (r) { return r.lmcomId = LMStatus.Cookie.id; }), 
        //Login.CmdMyInit_Create(LMStatus.Cookie.id),
        //Login.CmdMyInit_Create(LMStatus.Cookie.id),
        function (res) {
            Login.myData = res;
            if (CourseMeta.allProductList)
                finishMyData(); //pri spusteni se nejdrive nacitaji Mydata a pak teprve produkty. Proto se finishMyData vola i v adjustAllProductList 
            completed();
        });
    }
    Login.adjustMyData = adjustMyData;
    //export function createArchive(companyId: number, productId: string, completed: (archiveId:number) => void) {
    //  //info o firmach, produktech a rolich
    //  Pager.ajaxGet(
    //    Pager.pathType.restServices,
    //    scorm.Cmd_createArchive_Type,
    //    scorm.Cmd_createArchive_Create(LMStatus.Cookie.id, companyId, productId, null),
    //    (res: number) => completed(res));
    //}
    function finishMyData() {
        if (!Login.myData || Login.myData.finished)
            return;
        Login.myData.finished = true;
        var res = Login.myData;
        //pridej produkty, vytvorene (vlastnene) by company
        _.each(Login.myData.Companies, function (comp) {
            if (comp.PublisherOwnerUserId != 0) {
                if (comp.PublisherOwnerUserId != Login.myData.UserId)
                    return;
                comp.RoleEx.Role = LMComLib.CompRole.Keys | LMComLib.CompRole.Products | LMComLib.CompRole.Publisher;
            }
            else {
                if ((comp.RoleEx.Role && LMComLib.CompRole.Publisher) == 0)
                    return;
            }
            _.each(comp.companyProducts, function (p) { return comp.Courses.push({
                Expired: -1,
                Archives: null,
                isAuthoredCourse: true,
                LicCount: 1,
                ProductId: p.url
            }); });
        });
        //agreguj archivy testu a dosad isTest
        _.each(res.Companies, function (myComp) {
            var courses = [];
            //jedna grupa - vsechny zaznamy o jednom produktu (eTestMe archiv) a to budto isAuthoredCourse nebo ne
            var prodGroups = _.groupBy(myComp.Courses, function (myCrs) { return (myCrs.isAuthoredCourse ? '+' : '-') + '|' + myCrs.ProductId.split('|')[0]; });
            for (var prodcode in prodGroups) {
                var prodGroup = prodGroups[prodcode];
                var prodId = prodcode.split('|')[1];
                var isAuthoredCourse = prodcode.charAt(0) == '+';
                var isTest = CourseMeta.lib.isTest(CourseMeta.lib.findProduct(prodId));
                var crs;
                if (!isTest) {
                    if (prodGroup.length > 1) {
                        debugger; /*kdyz se published test pouzije a publisher nasledne stejnout URL pouzije pro kurz => chyba. throw 'Text expected';*/
                    }
                    crs = prodGroup[0];
                    crs.isAuthoredCourse = isAuthoredCourse;
                }
                else {
                    var crs = {
                        Expired: 0,
                        ProductId: prodId,
                        Archives: [],
                        LicCount: 0,
                        isAuthoredCourse: isAuthoredCourse,
                    };
                    _.each(prodGroup, function (it) {
                        var parts = it.ProductId.split('|'); //productId je url|archiveId
                        switch (parts.length) {
                            case 1:
                                crs.LicCount = it.LicCount;
                                break; //rozpracovany test (neni archiv)
                            case 2:
                                crs.Archives.push(parseInt(parts[1]));
                                break; //archiv
                            default: {
                                debugger;
                                throw 'error';
                            }
                        }
                    });
                }
                courses.push(crs);
            }
            myComp.Courses = courses;
        });
    }
    Login.finishMyData = finishMyData;
    Login.c_firstName = function () { return CSLocalize('620972c027ab41a28bcb0306b233b0ce', 'First Name'); };
    Login.c_lastName = function () { return CSLocalize('03500780ce2c476a9719c9e8e3202465', 'Last Name'); };
    Login.c_oldPassword = function () { return CSLocalize('275229db239c41f0a7d3038e0072323f', 'Old password'); };
    Login.c_newPassword = function () { return CSLocalize('e0bc9a352e364c40b87d261f44697515', 'New password'); };
    //export class Url extends Pager.Url {
    //  constructor(type: string) { super(appId, type); }
    //  //static fromString(hash: string): Pager.Url {
    //  //  return _.isEmpty(hash) ? initUrl() : new Url(hash);
    //  //}
    //  toString(): string { return appId + "@" + (this.locator == pageLogin ? "" : this.locator); }
    //}
    function Dump() {
        var res = {};
        res.login = function () {
            //window.location.href = LMStatus.newLoginUrl(false);
        };
        res.login_https = function () {
            //window.location.href = LMStatus.newLoginUrl(true);
        };
        //res.logout = LMStatus.logout;
        var cook = LMStatus.getCookie();
        var logged = cook != null && cook.id > 0;
        res.isLogin = !logged;
        if (!logged) {
            res.Error = "Not logged";
            return res;
        }
        res.Id = "<b>Id:</b> " + cook.id;
        res.EMail = "<b>EMail:</b> " + cook.EMail;
        res.Type = "<b>Type:</b> " + LowUtils.EnumToString(LMComLib.OtherType, cook.Type);
        res.TypeId = "<b>TypeId:</b> " + cook.TypeId;
        res.FirstName = "<b>FirstName:</b> " + cook.FirstName;
        res.LastName = "<b>LastName:</b> " + cook.LastName;
        return res;
    }
    Login.Dump = Dump;
    function InitModel(_cfg, completed) {
        Login.cfg = _cfg;
        completed();
    }
    Login.InitModel = InitModel;
    Login.pageLogin = "loginModel".toLowerCase();
    Login.pageLmLogin = "lmLoginModel".toLowerCase();
    Login.pageLmLoginNoEMail = "lmLoginNoEMailModel".toLowerCase();
    Login.pageRegister = "registerModel".toLowerCase();
    Login.pageRegisterNoEMail = "registerNoEMailModel".toLowerCase();
    Login.pageChangePassword = "changePasswordModel".toLowerCase();
    Login.pageForgotPassword = "forgotPasswordModel".toLowerCase();
    Login.pageProfile = "profileModel".toLowerCase();
    Login.pageConfirmRegistration = "ConfirmRegistrationModel".toLowerCase();
    //export interface IPageDict { type: string; create: (type: string) => loginMode; }
    //};
    var loginMode = (function (_super) {
        __extends(loginMode, _super);
        function loginMode(type) {
            _super.call(this, Login.appId, type, null);
            this.error = ko.observable(null);
            this.success = ko.observable(null);
            //this.url = new Url(type.toLowerCase());
            this.errorText = ko.computed(function () {
                var err = this.error();
                if (!err || err == "")
                    return null;
                return "<b>Error:</b> " + err;
            }, this);
        }
        loginMode.prototype.update = function (completed) {
            completed();
        };
        loginMode.prototype.ok = function () {
            if (!validate.isValid(this.viewModel))
                return;
            this.doOK();
        };
        loginMode.prototype.doOK = function () { };
        return loginMode;
    })(Pager.Page);
    Login.loginMode = loginMode;
    //Init Url
    //export var initUrl = () => new Url(pageLogin);
    //export var initHash = getHash(pageLogin);
    if ($.views)
        $.views.helpers({
            loginUrl: function (par) { return "#" + getHash(_.isEmpty(par) ? Login.pageLogin : par); },
        });
    function newProfileUrl() {
        LMStatus.setReturnUrlAndGoto(getHash(Login.pageProfile));
    }
    Login.newProfileUrl = newProfileUrl;
    Login.pageDict = {};
    Login.pageDict[Login.pageLogin] = function (urlParts, completed) { return completed(new Login.LoginModel(Login.pageLogin)); };
    Login.pageDict[Login.pageLmLogin] = function (urlParts, completed) { return completed(new Login.LMLoginModel(Login.pageLmLogin, true)); };
    Login.pageDict[Login.pageLmLoginNoEMail] = function (urlParts, completed) { return completed(new Login.LMLoginModel(Login.pageLmLoginNoEMail, false)); };
    Login.pageDict[Login.pageRegister] = function (urlParts, completed) { return completed(new Login.RegisterModel(Login.pageRegister, true)); };
    Login.pageDict[Login.pageRegisterNoEMail] = function (urlParts, completed) { return completed(new Login.RegisterModel(Login.pageRegisterNoEMail, false)); };
    Login.pageDict[Login.pageConfirmRegistration] = function (urlParts, completed) { return completed(new Login.ConfirmRegistrationModel(Login.pageConfirmRegistration)); };
    Login.pageDict[Login.pageChangePassword] = function (urlParts, completed) { return completed(new Login.ChangePassworModel(Login.pageChangePassword)); };
    Login.pageDict[Login.pageForgotPassword] = function (urlParts, completed) { return completed(new Login.ForgotPasswordModel(Login.pageForgotPassword)); };
    Login.pageDict[Login.pageProfile] = function (urlParts, completed) { return completed(new Login.ProfileModel(Login.pageProfile)); };
    //Registrace lokatoru
    for (var p in Login.pageDict)
        Pager.registerAppLocator(Login.appId, p, Login.pageDict[p]);
})(Login || (Login = {}));

var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Login;
(function (Login) {
    var LoginModel = (function (_super) {
        __extends(LoginModel, _super);
        function LoginModel() {
            _super.apply(this, arguments);
            this.button = Pager.ButtonType.cancel;
        }
        LoginModel.prototype.update = function (completed) {
            this.viewModel = _.map(Login.cfg.logins, function (pr) { return (createProvider(pr)); });
            //kontrola lowercase pro google etc login
            var path = location.href.split('?')[0].split('#')[0];
            if (Utils.endsWith(path, '.html') && path != path.toLowerCase()) {
                location.href = location.href.toLowerCase();
                location.href = path.toLowerCase() + location.hash;
                return;
            }
            completed();
        };
        LoginModel.prototype.call_provider = function (sender, par) {
            if (par == LMComLib.OtherType.LANGMaster)
                Pager.navigateToHash(Login.getHash(Login.pageLmLogin));
            else if (par == LMComLib.OtherType.LANGMasterNoEMail)
                Pager.navigateToHash(Login.getHash(Login.pageLmLoginNoEMail));
            else
                OAuth.authrequest(par);
        };
        LoginModel.prototype.cancel = function () {
            LMStatus.gotoReturnUrl();
        };
        return LoginModel;
    })(Login.loginMode);
    Login.LoginModel = LoginModel;
    function createProvider(id) {
        //return { id: id, name: LowUtils.EnumToString(LMComLib.OtherType, id).toLowerCase() };
        return { id: id, name: LowUtils.EnumToString(LMComLib.OtherType, id).toLowerCase() };
    }
})(Login || (Login = {}));

var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Login;
(function (Login) {
    var LMLoginModel = (function (_super) {
        __extends(LMLoginModel, _super);
        function LMLoginModel(type, isEMail) {
            _super.call(this, type);
            this.isEMail = isEMail;
            this.login = ko.observable("");
            this.email = ko.observable("");
            this.password = ko.observable("");
            this.viewModel = [isEMail ? validate.email(this.email, true) : validate.minLen(this.login, 3, "login", "Login"), validate.password(this.password, 1)];
        }
        LMLoginModel.prototype.gotoRegister = function () { Pager.navigateToHash(Login.getHash(this.isEMail ? Login.pageRegister : Login.pageRegisterNoEMail)); };
        LMLoginModel.prototype.doOK = function () {
            var _this = this;
            this.error(null);
            login(this.isEMail, this.email(), this.login(), this.password(), null, function (cookie) { return LMStatus.logged(cookie, false); }, function (errId, errMsg) {
                switch (errId) {
                    case Login.CmdLmLoginError.cannotFindUser:
                        _this.error(CSLocalize('f14d4f45b2184ec2b114ae702e34b8d0', 'Wrong password or login name was not found in the database.'));
                        break;
                    default:
                        Logger.error('LMLogin.LMLoginModel.doOK', '', errMsg);
                        _this.error(errMsg);
                        break;
                }
            });
        };
        LMLoginModel.prototype.cancel = function () { Pager.navigateToHash(Login.getHash(Login.pageLogin)); };
        return LMLoginModel;
    })(Login.loginMode);
    Login.LMLoginModel = LMLoginModel;
    function login(isEMail, email, login, password, ticket, completed, onError) {
        password = _.isEmpty(password) ? null : Utils.encryptStr(password);
        Pager.ajaxGet(Pager.pathType.restServices, Login.CmdLmLogin_Type, Login.CmdLmLogin_Create(isEMail ? null : login, isEMail ? email : null, password, null, ticket), function (res) { return completed(res.Cookie); }, onError);
    }
    Login.login = login;
})(Login || (Login = {}));

var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Login;
(function (Login) {
    var RegisterModel = (function (_super) {
        __extends(RegisterModel, _super);
        function RegisterModel(type, isEMail) {
            _super.call(this, type);
            this.isEMail = isEMail;
            this.email = ko.observable("");
            this.login = ko.observable("");
            this.loginEmail = ko.observable("");
            this.password = ko.observable("");
            this.firstName = ko.observable("");
            this.lastName = ko.observable("");
            this.confirmPsw = ko.observable("");
            this.viewModel = isEMail ? [
                validate.email(this.email, true),
                validate.password(this.password, 1),
                validate.confirmPsw(this.confirmPsw, this.password),
                validate.empty(this.firstName, "firstName", Login.c_firstName()),
                validate.minLen(this.lastName, 3, "lastName", Login.c_lastName())
            ] : [
                validate.minLen(this.login, 3, "login", "Login"),
                validate.password(this.password, 1),
                validate.confirmPsw(this.confirmPsw, this.password),
                validate.empty(this.firstName, "firstName", Login.c_firstName()),
                validate.minLen(this.lastName, 3, "lastName", Login.c_lastName()),
                validate.email(this.loginEmail, false),
            ];
            this.viewModel.push();
        }
        RegisterModel.prototype.doOK = function () {
            var _this = this;
            this.error(null);
            this.success(null);
            var cook = LMComLib.LMCookieJS_Create(0, 0, this.isEMail ? this.email() : null, this.isEMail ? null : this.login(), this.isEMail ? null : this.loginEmail(), this.isEMail ? LMComLib.OtherType.LANGMaster : LMComLib.OtherType.LANGMasterNoEMail, null, this.firstName(), this.lastName(), '', 0, 0, null);
            Pager.ajaxGet(Pager.pathType.restServices, Login.CmdRegister_Type, LMStatus.createCmd(function (r) { r.password = Utils.encryptStr(_this.password()); r.Cookie = cook, r.subSite = LMComLib.SubDomains.com; }), 
            //CmdRegister_Create(Utils.encryptStr(this.password()), LMComLib.SubDomains.com, cook, 0),
            //CmdRegister_Create(Utils.encryptStr(this.password()), LMComLib.SubDomains.com, cook, 0),
            function (res) {
                if (_this.isEMail) {
                    var key = LowUtils.EncryptString(Utils.longToByteArray(res));
                    var url = location.href.split('#')[0];
                    url += url.indexOf('?') < 0 ? "?" : "&";
                    url += "key=" + key + "#" + Login.getHash(Login.pageConfirmRegistration);
                    var email = {
                        From: null,
                        To: _this.email(),
                        Cc: null,
                        Subject: CSLocalize('d809fff52b9f4f5391ab889a0a1afe80', 'Creating of an account - confirmation'),
                        emailId: "TEmailConfirmation",
                        //url: Pager.path(Pager.pathType.login, "?key=" + key + "#" + new Url(pageConfirmRegistration).toString()),// "http://www.langmaster.com/lmcom/rew/Login/default.aspx#confirmRegistrationModel",
                        isForgotPassword: false,
                        Html: null,
                        isAtt: false,
                        attFile: null,
                        attContent: null,
                        attContentType: null,
                        url: url,
                        name: _this.email(),
                        password: _this.password(),
                    };
                    EMailer.sendEMail(email, function () {
                        _this.success(CSLocalize('dd97d1b2919d451cbb43ee63091a147c', 'A confirmation e-mail has been sent to your e-mail address.'));
                        Login.testConfirmUrl = url;
                    }, function (errId, errMsg) { return alert(errMsg); });
                }
                else {
                    cook.id = res;
                    LMStatus.logged(cook, false);
                }
            }, function (errId, errMsg) {
                switch (errId) {
                    case Login.CmdLmLoginError.userExist:
                        _this.error(CSLocalize('d60caf13057c46c2ba63f5cd361271e5', 'User name already exists'));
                        break;
                    default:
                        Logger.error('Register.RegisterModel.doOK', '', errMsg);
                        _this.error(errMsg);
                        break;
                }
            });
        };
        RegisterModel.prototype.cancel = function () { Pager.navigateToHash(Login.getHash(Login.pageLmLogin)); };
        return RegisterModel;
    })(Login.loginMode);
    Login.RegisterModel = RegisterModel;
    Login.testConfirmUrl; //URL pro testovani
})(Login || (Login = {}));

/// <reference path="../JsLib/jsd/jquery.d.ts" />
/// <reference path="../JsLib/jsd/knockout.d.ts" />
/// <reference path="../JsLib/jsd/jsrender.d.ts" />
/// <reference path="../JsLib/js/ModelBase.ts" />
/// <reference path="../JsLib/js/OAuth.ts" />
/// <reference path="../JsLib/js/Validate.ts" />
/// <reference path="Model.ts" />
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Login;
(function (Login) {
    var ChangePassworModel = (function (_super) {
        __extends(ChangePassworModel, _super);
        function ChangePassworModel(type) {
            _super.call(this, type);
            this.oldPassword = ko.observable("");
            this.password = ko.observable("");
            this.confirmPsw = ko.observable("");
            this.button = ko.observable(Pager.ButtonType.okCancel);
            this.viewModel = [
                validate.password(this.oldPassword, 1, "oldPassword", Login.c_oldPassword()),
                validate.password(this.password, 1, "password", Login.c_newPassword()),
                validate.confirmPsw(this.confirmPsw, this.password)];
        }
        ChangePassworModel.prototype.update = function (completed) {
            completed();
        };
        ChangePassworModel.prototype.doOK = function () {
            var _this = this;
            if (this.button() == Pager.ButtonType.ok)
                this.cancel();
            else {
                LMStatus.getCookie();
                Pager.ajaxGet(Pager.pathType.restServices, Login.CmdChangePassword_Type, LMStatus.createCmd(function (r) { r.oldPassword = _this.oldPassword(); r.newPassword = _this.password(); r.lmcomId = LMStatus.Cookie.id; }), 
                //CmdChangePassword_Create(this.oldPassword(), this.password(), LMStatus.Cookie.id),
                //CmdChangePassword_Create(this.oldPassword(), this.password(), LMStatus.Cookie.id),
                function () {
                    _this.success(CSLocalize('4ec7f9623a684f708844bce43ad51d26', 'Password changed successfully'));
                    _this.button(Pager.ButtonType.ok);
                }, function (errId, errMsg) {
                    switch (errId) {
                        case Login.CmdLmLoginError.passwordNotExists:
                            _this.error(CSLocalize('150a40688a494a72a11b26081b46e515', 'The e-mail address was not found in the database.'));
                            break;
                        default:
                            Logger.error('ChangePasswor.ChangePassworModel.doOK', '', errMsg);
                            _this.error(errMsg);
                            break;
                    }
                });
            }
        };
        ChangePassworModel.prototype.cancel = function () { location.href = "#" + Login.pageProfile; };
        return ChangePassworModel;
    })(Login.loginMode);
    Login.ChangePassworModel = ChangePassworModel;
})(Login || (Login = {}));

/// <reference path="../JsLib/jsd/jquery.d.ts" />
/// <reference path="../JsLib/jsd/knockout.d.ts" />
/// <reference path="../JsLib/jsd/jsrender.d.ts" />
/// <reference path="../JsLib/js/ModelBase.ts" />
/// <reference path="../JsLib/js/OAuth.ts" />
/// <reference path="../JsLib/js/Validate.ts" />
/// <reference path="Model.ts" />
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Login;
(function (Login) {
    var ForgotPasswordModel = (function (_super) {
        __extends(ForgotPasswordModel, _super);
        function ForgotPasswordModel() {
            _super.apply(this, arguments);
            this.email = ko.observable("");
        }
        ForgotPasswordModel.prototype.update = function (completed) {
            this.viewModel = [validate.email(this.email, true)];
            completed();
        };
        ForgotPasswordModel.prototype.doOK = function () {
            var _this = this;
            var email = {
                From: null,
                To: this.email(),
                Cc: null,
                Subject: CSLocalize('3c2e4788779446b5ac07319284964624', 'Sending of the forgotten password'),
                emailId: "TEmailForgotPassword",
                name: this.email(),
                isForgotPassword: true,
                Html: null,
                isAtt: false,
                attFile: null,
                attContent: null,
                attContentType: null,
            };
            EMailer.sendEMail(email, function () {
                _this.success(CSLocalize('5ccd166083844fd49a180596afdfb330', 'The password has been sent to your e-mail address.'));
            }, function (errId, errMsg) {
                switch (errId) {
                    case Login.CmdLmLoginError.cannotFindUser:
                        _this.error("The e-mail address was not found in the database.");
                        break;
                    default:
                        break;
                        alert(errMsg);
                }
            });
        };
        ForgotPasswordModel.prototype.cancel = function () { Pager.navigateToHash(Login.getHash(Login.pageLmLogin)); };
        return ForgotPasswordModel;
    })(Login.loginMode);
    Login.ForgotPasswordModel = ForgotPasswordModel;
})(Login || (Login = {}));

/// <reference path="../JsLib/jsd/jquery.d.ts" />
/// <reference path="../JsLib/jsd/knockout.d.ts" />
/// <reference path="../JsLib/jsd/jsrender.d.ts" />
/// <reference path="../JsLib/js/ModelBase.ts" />
/// <reference path="../JsLib/js/OAuth.ts" />
/// <reference path="../JsLib/js/Validate.ts" />
/// <reference path="Model.ts" />
/// <reference path="Register.ts" />
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Login;
(function (Login) {
    var ProfileModel = (function (_super) {
        __extends(ProfileModel, _super);
        function ProfileModel(type) {
            _super.call(this, type);
            this.email = ko.observable(null);
            this.firstName = ko.observable("");
            this.lastName = ko.observable("");
            this.button = ko.observable(Pager.ButtonType.okCancel);
            LMStatus.getCookie();
            if (LMStatus.isLMComCookie()) {
                this.viewModel = [
                    validate.empty(this.firstName, "firstName", Login.c_firstName()),
                    validate.minLen(this.lastName, 3, "lastName", Login.c_lastName()),
                ];
                this.firstName(LMStatus.Cookie.FirstName);
                this.lastName(LMStatus.Cookie.LastName);
                if (LMStatus.Cookie.Type == LMComLib.OtherType.LANGMasterNoEMail) {
                    this.viewModel.push(validate.email(this.email, false));
                    this.email(LMStatus.Cookie.LoginEMail);
                }
            }
            else
                this.viewModel = [];
        }
        ProfileModel.prototype.update = function (completed) {
            completed();
        };
        ProfileModel.prototype.doOK = function () {
            var _this = this;
            if (this.button() == Pager.ButtonType.ok)
                this.cancel();
            else {
                LMStatus.getCookie();
                LMStatus.Cookie.FirstName = this.firstName();
                LMStatus.Cookie.LastName = this.lastName();
                LMStatus.Cookie.LoginEMail = this.email();
                LMStatus.setCookie(LMStatus.Cookie);
                Pager.ajaxGet(Pager.pathType.restServices, Login.CmdProfile_Type, LMStatus.createCmd(function (r) { r.Cookie = LMStatus.Cookie, r.lmcomId = LMStatus.Cookie.id; }), 
                //CmdProfile_Create(LMStatus.Cookie, LMStatus.Cookie.id),
                //CmdProfile_Create(LMStatus.Cookie, LMStatus.Cookie.id),
                function () {
                    _this.success(CSLocalize('e56e6bad75e54dea9191cab418eda74d', 'Success'));
                    _this.button(Pager.ButtonType.ok);
                }, function () { return _this.error(CSLocalize('bb6463807fdf453191f0315f034f01e0', 'Wrong old password')); });
            }
        };
        ProfileModel.prototype.cancel = function () {
            //throw "My.schoolMy.Model.licKeyOK";
            LMStatus.gotoReturnUrl();
        };
        return ProfileModel;
    })(Login.loginMode);
    Login.ProfileModel = ProfileModel;
})(Login || (Login = {}));

/// <reference path="../JsLib/jsd/jquery.d.ts" />
/// <reference path="../JsLib/jsd/knockout.d.ts" />
/// <reference path="../JsLib/jsd/jsrender.d.ts" />
/// <reference path="../JsLib/js/ModelBase.ts" />
/// <reference path="../JsLib/js/OAuth.ts" />
/// <reference path="../JsLib/js/Validate.ts" />
/// <reference path="Model.ts" />
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Login;
(function (Login) {
    var ConfirmRegistrationModel = (function (_super) {
        __extends(ConfirmRegistrationModel, _super);
        function ConfirmRegistrationModel() {
            _super.apply(this, arguments);
        }
        ConfirmRegistrationModel.prototype.update = function (completed) {
            var _this = this;
            var key = LowUtils.parseQuery(location.search)["key"];
            try {
                if (Utils.Empty(key))
                    throw "Missing Key query par";
                var userId = Utils.byteArrayToLong(LowUtils.DecryptString(key));
                if (Utils.Empty(userId) || userId <= 0)
                    throw "Wrong User id format";
                Pager.ajaxGet(Pager.pathType.restServices, Login.CmdConfirmRegistration_Type, LMStatus.createCmd(function (r) { r.lmcomId = userId; }), 
                //CmdConfirmRegistration_Create(userId),
                //CmdConfirmRegistration_Create(userId),
                function () {
                    _this.success(CSLocalize('b28146649ad7498cb4109b6b1276fcef', 'Account') + ' ' + CSLocalize('c0b339ea24054072999d990c2e7b8db9', 'was activated.'));
                    completed();
                }, function (errId, errMsg) {
                    _this.error(CSLocalize('0262a5d780784acd842bc31bd2800579', 'The e-mail address was not found in the database.') + ' ' + errMsg);
                    completed();
                });
            }
            catch (err) {
                this.error(CSLocalize('0cc1324eadf741c4b25f04ad1c8b1917', 'Wrong confirmation page url:') + ' ' + err);
                completed();
                return;
            }
        };
        return ConfirmRegistrationModel;
    })(Login.loginMode);
    Login.ConfirmRegistrationModel = ConfirmRegistrationModel;
})(Login || (Login = {}));

var lmConsole;
(function (lmConsole) {
    function sendStart(el) {
        $(el).data('btn-down', Utils.nowToInt().toString());
    }
    lmConsole.sendStart = sendStart;
    function sendEnd(el) {
        var bd = $(el).data('btn-down');
        if (!bd)
            return;
        var btnDownTime = parseInt(bd);
        if (Utils.nowToInt() - btnDownTime < 2000)
            return;
        send();
    }
    lmConsole.sendEnd = sendEnd;
    function send() {
        if (typeof Pager == 'undefined') {
            $('body').html('<h2>Log</h2>' + getLogData('').replace(/\r\n/g, '<br/>'));
        }
        else {
            var sendId = new Date().getTime().toString();
            var res = sendLogLogDataLow();
            if (res.msg == null) {
                alert('Nothing to send');
                return;
            }
            anim.alert().lmconsoleShow(function (dlg, completed) {
                var st = {
                    nowStr: new Date().toUTCString(),
                    now: Utils.nowToNum(),
                    email: LMStatus.Cookie ? LMStatus.Cookie.EMail : '',
                    replEmail: dlg.find('#repl-email').val(),
                    problem: dlg.find('#problem').val(),
                    action: dlg.find('#action').val(),
                    other: dlg.find('#other').val(),
                    date: '',
                    hasError: false,
                };
                var data = '****************************************************************\r\n'
                    + JSON.stringify(st) + '\r\n'
                    + '****************************************************************\r\n'
                    + res.msg
                    + '#<' + sendId + ' log end\r\n';
                var url = Pager.basicUrl + 'mp3Uploader.ashx?phase=lmconsole&fileUrl=/app_data/logs/' + lmConsole.signature + '.js.log' + '&timestamp=' + sendId;
                sendAjax(url, data, function (success) {
                    if (success)
                        alert('Logging sent successfully!');
                    else
                        $('body').html('<h2>Send content of this page to support@langmaster.com</h2>' + data.replace(/\r\n/g, '<br/>'));
                    delFiles(res.files);
                    completed();
                });
            });
        }
    }
    function sendAjax(url, data, completed) {
        $.ajax({
            url: url,
            type: 'POST',
            data: data,
            contentType: 'text/plain',
            dataType: 'text',
        }).done(function () { return completed(true); }).fail(function () { return completed(false); });
    }
    function getLogData(status) {
        if (!lmConsole.active)
            return;
        var res = sendLogLogDataLow();
        delFiles(res.files);
        return res.msg;
    }
    function sendLogLogDataLow() {
        var res = { files: getLogFiles(), msg: null };
        if (res.files.length == 0)
            return res;
        var data = _.map(res.files, function (idx) { return localStorage.getItem(name(idx)); });
        res.msg = data.join('');
        return res;
        //sendCallback(msg, doDel => { if (!doDel) return; _.each(idxs, idx => localStorage.removeItem(name(idx))); refreshNames(); });
    }
    function delFiles(idxs) {
        _.each(idxs, function (idx) { return localStorage.removeItem(name(idx)); });
        refreshNames();
    }
    lmConsole.active = false;
    lmConsole.signature = null;
    var names = [];
    var lastName = 0;
    var fileLenLimit = 1000;
    var fileCountLimit = 1000;
    console['log'] = log;
    function signComputer() {
        lmConsole.signature = localStorage.getItem('log/signature');
        if (lmConsole.signature == null) {
            lmConsole.signature = new Date().getTime().toString();
            localStorage.setItem('log/signature', lmConsole.signature);
        }
    }
    function createCookie(name, value, days) {
        if (days) {
            var date = new Date();
            date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
            var expires = "; expires=" + date.toUTCString();
        }
        else
            var expires = "";
        document.cookie = name + "=" + value + expires + "; path=/";
    }
    var cookieId = 'LoggerLogId'.toLowerCase();
    createCookie(cookieId, '', -1);
    function init() {
        if (lmConsole.active)
            return;
        if (!(lmConsole.active = storageExists()))
            return;
        signComputer();
        createCookie(cookieId, lmConsole.signature, 1);
        refreshNames();
    }
    function logError(msg) {
        init();
        log(msg);
    }
    function log(msg) {
        console.info(msg);
        if (!lmConsole.active)
            return;
        var actName = name(lastName);
        var val = (localStorage.getItem(actName));
        if (val && val.length > fileLenLimit) {
            if (names.length > fileCountLimit) {
                localStorage.removeItem(name(names[0]));
                names = names.slice(1);
            }
            lastName++;
            actName = name(lastName);
            names.push(lastName);
            val = null;
        }
        val = val ? val + msg : msg;
        localStorage.setItem(actName, val + '\r\n');
    }
    function refreshNames() {
        names = getLogFiles();
        lastName = names.length == 0 ? 0 : _.max(names) + 1;
    }
    function getLogFiles() {
        var res = [];
        for (var i = 0; i < localStorage.length; i++) {
            var key = localStorage.key(i);
            var mtch = /^log\/(\d+)$/gi.exec(key);
            if (mtch == null)
                continue;
            res.push(parseInt(mtch[1]));
        }
        res = _.sortBy(res);
        return res;
    }
    function name(idx) { return 'log/' + idx.toString(); }
    function storageExists() {
        var test = 'test';
        try {
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        }
        catch (e) {
            return false;
        }
    }
    function test() {
        for (var i = 0; i < 20; i++)
            console.log(i.toString() + " xxxxxxx");
    }
    lmConsole.test = test;
    if (!isLogging) {
        isLogging = location.hash && location.hash == '#log';
        if (isLogging)
            location.hash == '';
    }
    if (isLogging)
        init();
    //localStorage.clear();
    $(window).on('error', function (ev) {
        var orig = ev.originalEvent;
        var msg = orig && orig.filename ? orig.filename + '.' + orig.lineno + '.' + orig.message : '';
        logError('*** ERROR (window.onerror): ' + msg);
    });
    $(window).bind('hashchange', function () {
        if (!isLogging) {
            isLogging = location.hash && location.hash == '#log';
            if (isLogging) {
                location.hash == '';
                init();
            }
        }
    });
})(lmConsole || (lmConsole = {}));

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
    (function (displayModes) {
        displayModes[displayModes["normal"] = 0] = "normal";
        displayModes[displayModes["previewEx"] = 1] = "previewEx";
    })(schools.displayModes || (schools.displayModes = {}));
    var displayModes = schools.displayModes;
})(schools || (schools = {}));

var proxies;
(function (proxies) {
    function invoke(url, type, queryPars, body, completed) {
        var ajaxOption = { type: type, contentType: "application/json" };
        ajaxOption.url = Pager.basicUrl + url;
        if (queryPars != null)
            ajaxOption.url += "?" + $.param(queryPars);
        if (body)
            ajaxOption.data = body;
        $.ajax(ajaxOption).done(function (data) { return completed(data); }).fail(function () { debugger; Logger.error('proxies.ajax', url, ''); });
    }
    var admincompany = (function () {
        function admincompany() {
        }
        admincompany.getCompanyUserRoles = function (compid, completed) {
            invoke('admincompany/getcompanyuserroles', 'get', { compid: compid }, null, completed);
        };
        admincompany.setCompanyUserRoles = function (compid, email, role, completed) {
            invoke('admincompany/setcompanyuserroles', 'get', { compid: compid, email: email, role: role }, null, completed);
        };
        admincompany.setHumanEvaluator = function (compid, email, lines, completed) {
            invoke('admincompany/sethumanevaluator', 'post', { compid: compid, email: email }, JSON.stringify(lines), completed);
        };
        return admincompany;
    })();
    proxies.admincompany = admincompany;
    ;
    var adminglobal = (function () {
        function adminglobal() {
        }
        adminglobal.createSystemAdmin = function (systemadminemail, isadd, completed) {
            invoke('adminglobal/createsystemadmin', 'get', { systemadminemail: systemadminemail, isadd: isadd }, null, completed);
        };
        adminglobal.getSystemAdmins = function (completed) {
            invoke('adminglobal/getsystemadmins', 'get', null, null, completed);
        };
        adminglobal.createNewCompany = function (compid, email, isadd, completed) {
            invoke('adminglobal/createnewcompany', 'get', { compid: compid, email: email, isadd: isadd }, null, completed);
        };
        adminglobal.getCompaniesAndTheirAdmins = function (completed) {
            invoke('adminglobal/getcompaniesandtheiradmins', 'get', null, null, completed);
        };
        return adminglobal;
    })();
    proxies.adminglobal = adminglobal;
    ;
    var adminlicence = (function () {
        function adminlicence() {
        }
        adminlicence.createNewProduct = function (compid, prodid, istest, days, isadd, completed) {
            invoke('adminlicence/createnewproduct', 'get', { compid: compid, prodid: prodid, istest: istest, days: days, isadd: isadd }, null, completed);
        };
        adminlicence.getAllProductsLicInfo = function (compid, completed) {
            invoke('adminlicence/getallproductslicinfo', 'get', { compid: compid }, null, completed);
        };
        adminlicence.generateLicenceKeys = function (compid, prodid, days, numofkeys, completed) {
            invoke('adminlicence/generatelicencekeys', 'get', { compid: compid, prodid: prodid, days: days, numofkeys: numofkeys }, null, completed);
        };
        adminlicence.enterLicenceKey = function (email, comphash, licid, keyid, completed) {
            invoke('adminlicence/enterlicencekey', 'get', { email: email, comphash: comphash, licid: licid, keyid: keyid }, null, completed);
        };
        adminlicence.getHomePageData = function (email, completed) {
            invoke('adminlicence/gethomepagedata', 'get', { email: email }, null, completed);
        };
        return adminlicence;
    })();
    proxies.adminlicence = adminlicence;
    ;
    var course = (function () {
        function course() {
        }
        course.deleteDataKeys = function (email, compid, productid, testkeyid, keys, completed) {
            invoke('course/deletedatakeys', 'post', { email: email, compid: compid, productid: productid, testkeyid: testkeyid }, JSON.stringify(keys), completed);
        };
        course.getShortProductDatas = function (email, compid, productid, testkeyid, completed) {
            invoke('course/getshortproductdatas', 'get', { email: email, compid: compid, productid: productid, testkeyid: testkeyid }, null, completed);
        };
        course.getLongData = function (email, compid, productid, testkeyid, key, completed) {
            invoke('course/getlongdata', 'get', { email: email, compid: compid, productid: productid, testkeyid: testkeyid, key: key }, null, completed);
        };
        course.saveData = function (email, compid, productid, testkeyid, line, datas, completed) {
            invoke('course/savedata', 'post', { email: email, compid: compid, productid: productid, testkeyid: testkeyid, line: line }, JSON.stringify(datas), completed);
        };
        return course;
    })();
    proxies.course = course;
    ;
    var dbcompany = (function () {
        function dbcompany() {
        }
        dbcompany.doRead_user = function (compid, completed) {
            invoke('dbcompany/doread/user', 'get', { compid: compid }, null, completed);
        };
        dbcompany.doRead_meta = function (compid, completed) {
            invoke('dbcompany/doread/meta', 'get', { compid: compid }, null, completed);
        };
        dbcompany.doRead_licence = function (compid, completed) {
            invoke('dbcompany/doread/licence', 'get', { compid: compid }, null, completed);
        };
        dbcompany.doRead_department = function (compid, completed) {
            invoke('dbcompany/doread/department', 'get', { compid: compid }, null, completed);
        };
        dbcompany.doRead_departmentUsage = function (compid, completed) {
            invoke('dbcompany/doread/departmentusage', 'get', { compid: compid }, null, completed);
        };
        return dbcompany;
    })();
    proxies.dbcompany = dbcompany;
    ;
    var dbuser = (function () {
        function dbuser() {
        }
        dbuser.doRead_data = function (email, completed) {
            invoke('dbuser/doread/data', 'get', { email: email }, null, completed);
        };
        dbuser.doRead_companies = function (email, completed) {
            invoke('dbuser/doread/companies', 'get', { email: email }, null, completed);
        };
        return dbuser;
    })();
    proxies.dbuser = dbuser;
    ;
    var hmaneval = (function () {
        function hmaneval() {
        }
        hmaneval.linesToEval = function (compid, completed) {
            invoke('humaneval/getlines', 'get', { compid: compid }, null, completed);
        };
        hmaneval.getTestsToAssign = function (compid, line, completed) {
            invoke('humaneval/getteststoassign', 'get', { compid: compid, line: line }, null, completed);
        };
        hmaneval.setTestsToAssign = function (compid, line, newtodo, completed) {
            invoke('humaneval/setteststoassign', 'post', { compid: compid, line: line }, JSON.stringify(newtodo), completed);
        };
        hmaneval.getEvaluatorTests = function (compid, evalemail, completed) {
            invoke('humaneval/getevaluatortests', 'get', { compid: compid, evalemail: evalemail }, null, completed);
        };
        hmaneval.getExerciseFromTest = function (email, compid, line, productid, testkeyid, completed) {
            invoke('humaneval/getexercisefromtest', 'get', { email: email, compid: compid, line: line, productid: productid, testkeyid: testkeyid }, null, completed);
        };
        return hmaneval;
    })();
    proxies.hmaneval = hmaneval;
    ;
    var login = (function () {
        function login() {
        }
        login.CreateLmUserStart = function (password, cook, completed) {
            invoke('login/createlmuserstart', 'post', { password: password }, JSON.stringify(cook), completed);
        };
        login.OnOtherLogin = function (othertype, otherid, email, firstname, lastname, completed) {
            invoke('login/onotherlogin', 'get', { othertype: othertype, otherid: otherid, email: email, firstname: firstname, lastname: lastname }, null, completed);
        };
        login.CreateLmUserEnd = function (email, completed) {
            invoke('login/createlmuserend', 'get', { email: email }, null, completed);
        };
        login.ChangePassword = function (email, oldpsw, newpsw, completed) {
            invoke('login/changepassword', 'get', { email: email, oldpsw: oldpsw, newpsw: newpsw }, null, completed);
        };
        login.GetPassword = function (email, completed) {
            invoke('login/getpassword', 'get', { email: email }, null, completed);
        };
        login.OnLMLogin = function (email, password, completed) {
            invoke('login/onlmlogin', 'get', { email: email, password: password }, null, completed);
        };
        login.SaveProfile = function (cook, completed) {
            invoke('login/saveprofile', 'post', null, JSON.stringify(cook), completed);
        };
        return login;
    })();
    proxies.login = login;
    ;
    var test = (function () {
        function test() {
        }
        test.testDeleteAll = function (completed) {
            invoke('test/testdeleteall', 'get', null, null, completed);
        };
        return test;
    })();
    proxies.test = test;
    ;
    var testme = (function () {
        function testme() {
        }
        testme.toEvalLangs = function (compid, completed) {
            invoke('testme/toevallangs', 'post', { compid: compid }, null, completed);
        };
        return testme;
    })();
    proxies.testme = testme;
    ;
})(proxies || (proxies = {}));


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
        PretestMode[PretestMode["tested"] = 5] = "tested"; //test dobehl, je nastaven zacatek kurzu
    })(schools.PretestMode || (schools.PretestMode = {}));
    var PretestMode = schools.PretestMode;
    ;
    ;
})(schools || (schools = {}));

var mp3WorkerLib;
(function (mp3WorkerLib) {
    mp3WorkerLib.isOldBrowser = typeof ArrayBuffer == 'undefined' || typeof Worker == 'undefined';
    function getWorkerRecordStartPar(par) {
        return {
            actHtml5SampleRate: par.actHtml5SampleRate,
            toDisc: par.toDisc,
            toDiscFileUrl: par.toDiscFileUrl,
        };
    }
    mp3WorkerLib.getWorkerRecordStartPar = getWorkerRecordStartPar;
    function postMessage(worker, msg) {
        if (mp3WorkerLib.isOldBrowser)
            mp3Worker.onMessageLow(msg);
        else {
            if (!worker) {
                mp3WorkerLib.log('postMessage, !worker');
                return;
            }
            worker.postMessage(msg);
        }
    }
    function postInitSLMessage(worker, data) {
        cnt++;
        mp3WorkerLib.log('postInitSLMessage ' + cnt.toString() + ': ' + (data.firstData ? data.firstData.length : 0));
        postMessage(worker, { cmd: 'sl_init', data: data, id: cnt, loggerId: Logger.logId() });
    }
    mp3WorkerLib.postInitSLMessage = postInitSLMessage;
    function postEncodeSLMessage(worker, data) {
        cnt++;
        mp3WorkerLib.log('postEncodeSLMessage ' + cnt.toString() + ': ' + data.length);
        postMessage(worker, { cmd: 'sl_encode', data: data, id: cnt, loggerId: Logger.logId() });
    }
    mp3WorkerLib.postEncodeSLMessage = postEncodeSLMessage;
    function postFinishSLMessage(worker) {
        cnt++;
        mp3WorkerLib.log('postFinishSLMessage ' + cnt.toString());
        postMessage(worker, { cmd: 'sl_finish', data: null, id: cnt, loggerId: Logger.logId() });
    }
    mp3WorkerLib.postFinishSLMessage = postFinishSLMessage;
    function postInitHTML5Message(worker, data) {
        cnt++;
        mp3WorkerLib.log('postInitHTML5Message ' + cnt.toString() + ': ' + (data.firstData ? data.firstData.length : 0));
        postMessage(worker, { cmd: 'html5_init', data: data, id: cnt, loggerId: Logger.logId() });
    }
    mp3WorkerLib.postInitHTML5Message = postInitHTML5Message;
    function postEncodeHTML5Message(worker, data) {
        cnt++;
        mp3WorkerLib.log('postEncodeHTML5Message ' + cnt.toString() + ': ' + data.length);
        postMessage(worker, { cmd: 'html5_encode', data: data, id: cnt, loggerId: Logger.logId() });
    }
    mp3WorkerLib.postEncodeHTML5Message = postEncodeHTML5Message;
    function postFinishHTML5Message(worker) {
        cnt++;
        mp3WorkerLib.log('postFinishHTML5Message ' + cnt.toString());
        postMessage(worker, { cmd: 'html5_finish', data: null, id: cnt, loggerId: Logger.logId() });
    }
    mp3WorkerLib.postFinishHTML5Message = postFinishHTML5Message;
    var cnt = 0;
    (function (mode) {
        mode[mode["no"] = -1] = "no";
        mode[mode["STEREO"] = 0] = "STEREO";
        mode[mode["JOINT_STEREO"] = 1] = "JOINT_STEREO";
        mode[mode["MONO"] = 3] = "MONO";
    })(mp3WorkerLib.mode || (mp3WorkerLib.mode = {}));
    var mode = mp3WorkerLib.mode;
    (function (vbr_mode) {
        vbr_mode[vbr_mode["vbr_off"] = 0] = "vbr_off";
        vbr_mode[vbr_mode["vbr_rh"] = 2] = "vbr_rh";
        vbr_mode[vbr_mode["vbr_abr"] = 3] = "vbr_abr";
        vbr_mode[vbr_mode["vbr_mtrh"] = 4] = "vbr_mtrh";
    })(mp3WorkerLib.vbr_mode || (mp3WorkerLib.vbr_mode = {}));
    var vbr_mode = mp3WorkerLib.vbr_mode;
    function log(msg) {
        console.info(msg);
    }
    mp3WorkerLib.log = log;
})(mp3WorkerLib || (mp3WorkerLib = {}));
var mp3Worker;
(function (mp3Worker) {
    mp3Worker.worker;
    var cfg;
    var toUploadChunks;
    var toUploadChunksLen;
    var isFirstUpload;
    function slAjax(base64, phase, loggerId) {
        var xmlDoc = XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject("Microsoft.XMLHTTP");
        var url = cfg.pagerBasicUrl + 'mp3Uploader.ashx?fileUrl=' + cfg.recordStartPar.toDiscFileUrl + '&phase=' + phase + (loggerId ? '&LoggerLogId=' + loggerId : '');
        //if (phase == 'sl_finish')
        //  url += '&SamplesPerSecond=' + cfg.in_samplerate.toString() + '&BitsPerSample=16&Channels=1';
        xmlDoc.open('POST', url, false);
        xmlDoc.setRequestHeader("Content-type", 'text/plain');
        xmlDoc.onerror = function (ev) { return console.log('slAjax error: message=' + ev.message); };
        mp3WorkerLib.log('slAjax, base64.length=' + base64.length);
        xmlDoc.send(base64);
    }
    function uploadChunks(raw, isEnd) {
        if (raw) {
            toUploadChunks.push(raw);
            toUploadChunksLen += raw.length;
        }
        if (!isEnd && toUploadChunksLen < 50000)
            return;
        var phase = isFirstUpload ? (isEnd ? 'html_init_finish' : 'html_init') : (isEnd ? 'html_finish' : 'html_encode');
        isFirstUpload = false;
        var toUploadData = new Uint16Array(toUploadChunksLen);
        var pos = 0;
        for (var i = 0; i < toUploadChunks.length; i++) {
            var act = toUploadChunks[i];
            toUploadData.set(act, pos);
            pos += act.length;
        }
        var xmlDoc = XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject("Microsoft.XMLHTTP");
        var url = cfg.pagerBasicUrl + 'mp3Uploader.ashx?fileUrl=' + cfg.recordStartPar.toDiscFileUrl + '&phase=' + phase;
        //if (phase == 'html_init_finish' || phase == 'html_finish')
        //  url += '&SamplesPerSecond=' + cfg.in_samplerate.toString() + '&BitsPerSample=16&Channels=1';
        xmlDoc.open('POST', url, false);
        xmlDoc.setRequestHeader("Content-type", 'text/plain');
        xmlDoc.onerror = function (ev) { return console.log('slAjax error: message=' + ev.message); };
        mp3WorkerLib.log('uploadChunks ajax ' + toUploadData.length.toString());
        xmlDoc.send(toUploadData.buffer);
        toUploadChunks = [];
        toUploadChunksLen = 0;
    }
    function onMessage(ev) {
        onMessageLow(ev.data);
    }
    mp3Worker.onMessage = onMessage;
    function onMessageLow(msg) {
        switch (msg.cmd) {
            case 'sl_init':
                cfg = msg.data;
                var strData = (cfg.firstData);
                mp3WorkerLib.log('worker sl_init, samples=' + strData.length.toString());
                slAjax(strData, 'sl_init', msg.loggerId);
                break;
            case 'sl_encode':
                var strData = (msg.data);
                mp3WorkerLib.log('worker sl_encode, samples=' + strData.length.toString());
                slAjax(strData, 'sl_encode', msg.loggerId);
                break;
            case 'sl_finish':
                mp3WorkerLib.log('worker sl_finish, url=' + cfg.recordStartPar.toDiscFileUrl);
                slAjax('', 'sl_finish', msg.loggerId);
                var res = { cmd: 'end', data: null, id: 0, loggerId: msg.loggerId };
                mp3Worker.worker.postMessage(res);
                break;
            case 'html5_init':
                //debugger;
                cfg = msg.data;
                toUploadChunks = [];
                toUploadChunksLen = 0;
                isFirstUpload = true;
                mp3WorkerLib.log('worker html5_init');
                uploadChunks(cfg.firstData, false);
                break;
            case 'html5_encode':
                var channel = msg.data;
                mp3WorkerLib.log('worker html5_encode, samples=' + channel.length.toString());
                uploadChunks(channel, false);
                break;
            case 'html5_finish':
                mp3WorkerLib.log('worker html5_finish, url=' + cfg.recordStartPar.toDiscFileUrl);
                uploadChunks(null, true);
                var res = { cmd: 'end', data: null, id: 0, loggerId: msg.loggerId };
                mp3Worker.worker.postMessage(res);
                break;
            //case 'gzip_init':
            //  cfg = <mp3WorkerLib.config>msg.data;
            //  toUploadChunks = []; toUploadChunksLen = 0; finishDiscCompleted = null; isFirstUpload = true;
            //  gzip = new pako.Deflate({ level: 9, gzip: true });
            //  gzip.onData = buf => {
            //    uploadChunks({ data: buf, id: 0 });
            //  };
            //  gzip.onEnd = ok => {
            //    finishDiscCompleted = () => {
            //      var res: mp3WorkerLib.message = { cmd: 'end', data: null, id: 0 };
            //      worker.postMessage(res);
            //    };
            //    uploadChunks(null);
            //  };
            //  mp3WorkerLib.log('gzip_init, samples=' + cfg.firstData.length.toString());
            //  gzip.push(new Uint8Array(cfg.firstData.buffer), false);
            //  break;
            //case 'gzip_encode':
            //  var channel = <Int16Array>msg.data;
            //  mp3WorkerLib.log('gzip_encode, samples=' + channel.length.toString());
            //  gzip.push(new Uint8Array(channel.buffer), false);
            //  break;
            //case 'gzip_finish':
            //  mp3WorkerLib.log('gzip_finish');
            //  gzip.push(new Uint8Array([]), true);
            //  break;
            //case 'init_ieee_float':
            //case 'init':
            //  cfg = <mp3WorkerLib.config>msg.data;
            //  mp3codec = Lame.init();
            //  Lame.set_in_samplerate(mp3codec, cfg.in_samplerate);
            //  Lame.set_num_channels(mp3codec, 1);
            //  Lame.set_mode(mp3codec, mp3WorkerLib.mode.MONO);
            //  if (cfg.isAbr) {
            //    if (cfg.VBR_mean_bitrate_kbps < 8) cfg.VBR_mean_bitrate_kbps = 8; else if (cfg.VBR_mean_bitrate_kbps > 320) cfg.VBR_mean_bitrate_kbps = 320;
            //    Lame.set_VBR(mp3codec, mp3WorkerLib.vbr_mode.vbr_mtrh);
            //    Lame.set_VBR_mean_bitrate_kbps(mp3codec, cfg.VBR_mean_bitrate_kbps);
            //  } else {
            //    if (cfg.VBR_quality < 0) cfg.VBR_quality = 0; else if (cfg.VBR_quality > 9) cfg.VBR_quality = 9;
            //    Lame.set_VBR(mp3codec, mp3WorkerLib.vbr_mode.vbr_mtrh);
            //    Lame.set_VBR_quality(mp3codec, cfg.VBR_quality);
            //  }
            //  Lame.init_params(mp3codec);
            //  mp3WorkerLib.log('Lame.init_params: in_samplerate=' + cfg.in_samplerate.toString());
            //  var mp3data: Lame.encodedMp3Buf;
            //  if (ev.data.cmd == 'init_ieee_float') {
            //    mp3data = Lame.do_encode_buffer_ieee_float(mp3codec, cfg.firstData_ieee_float.left, cfg.firstData_ieee_float.right);
            //    mp3WorkerLib.log('Lame.do_encode_buffer_ieee_float ' + msg.id.toString() + ', bytes=' + mp3data.data.length.toString());
            //  } else {
            //    mp3data = Lame.do_encode_buffer(mp3codec, cfg.firstData);
            //    mp3WorkerLib.log('Lame.do_encode_buffer ' + msg.id.toString() + ', bytes=' + mp3data.data.length.toString());
            //  }
            //  if (cfg.recordStartPar.toDisc) {
            //    toUploadChunks = []; toUploadChunksLen = 0; finishDiscCompleted = null; isFirstUpload = true;
            //    //debugger;
            //    uploadChunks({ data: mp3data.data, id: msg.id });
            //  } else {
            //    var res: mp3WorkerLib.message = { cmd: 'data', data: mp3data.data, id: msg.id };
            //    worker.postMessage(res);
            //  }
            //  break;
            //case 'encode_ieee_float':
            //  var channels = <mp3WorkerLib.channels>msg.data;
            //  var mp3data = Lame.do_encode_buffer_ieee_float(mp3codec, channels.left, channels.right);
            //  mp3WorkerLib.log('Lame.do_encode_buffer_ieee_float ' + msg.id.toString() + ', bytes=' + mp3data.data.length.toString());
            //  if (cfg.recordStartPar.toDisc) {
            //    uploadChunks({ data: mp3data.data, id: msg.id });
            //  } else {
            //    var res: mp3WorkerLib.message = { cmd: 'data', data: mp3data.data, id: msg.id };
            //    worker.postMessage(res);
            //  }
            //  break;
            //case 'encode':
            //  var channel = <Int16Array>msg.data;
            //  var mp3data = Lame.do_encode_buffer(mp3codec, channel);
            //  mp3WorkerLib.log('Lame.do_encode_buffer ' + msg.id.toString() + ', bytes=' + mp3data.data.length.toString());
            //  if (cfg.recordStartPar.toDisc) {
            //    uploadChunks({ data: mp3data.data, id: msg.id });
            //  } else {
            //    var res: mp3WorkerLib.message = { cmd: 'data', data: mp3data.data, id: msg.id };
            //    worker.postMessage(res);
            //  }
            //  break;
            //case 'finish':
            //  var mp3data = Lame.encode_flush(mp3codec);
            //  mp3WorkerLib.log('Lame.encode_flush ' + msg.id.toString());
            //  Lame.close(mp3codec);
            //  mp3WorkerLib.log('Lame.close');
            //  mp3codec = null;
            //  if (cfg.recordStartPar.toDisc) {
            //    finishDiscCompleted = () => {
            //      var res: mp3WorkerLib.message = { cmd: 'end', data: null, id: msg.id };
            //      console.log('finishDiscCompleted: ' + typeof worker);
            //      worker.postMessage(res);
            //    };
            //    uploadChunks({ data: mp3data.data, id: msg.id });
            //  } else {
            //    var res: mp3WorkerLib.message = { cmd: 'end', data: mp3data.data, id: msg.id };
            //    worker.postMessage(res);
            //  }
            //  break;
            default:
                debugger;
                break;
        }
    }
    mp3Worker.onMessageLow = onMessageLow;
})(mp3Worker || (mp3Worker = {}));

var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var SndLow;
(function (SndLow) {
    var globalMedia = (function () {
        function globalMedia() {
            //slInstalled = false;
            this.slInstalled = Silverlight.isInstalled(slVersion);
            this.needInstall = ko.observable(false);
            _globalMedia = this;
            try {
                console.log('soundnew.ts: Player.selectDriver start');
                //init result
                playerType = LMComLib.SoundPlayerType.no;
                SndLow.recordingType = LMComLib.SoundPlayerType.no;
                //get static info
                var isHtmlAudioVideo = html5_CanPlay(media.audio_mp3) && (html5_CanPlay(media.video_mp4) || html5_CanPlay(media.video_webm));
                var isHtmlCapture = html5Recorder.checkHTML5AudioCapture() && html5_CanPlay(media.audio_wave);
                //compute audio a recording type
                if (isHtmlCapture && isHtmlAudioVideo) {
                    playerType = SndLow.recordingType = LMComLib.SoundPlayerType.HTML5;
                }
                else if (this.slInstalled) {
                    playerType = SndLow.recordingType = LMComLib.SoundPlayerType.SL;
                }
                else if (isHtmlAudioVideo) {
                    playerType = LMComLib.SoundPlayerType.HTML5;
                    SndLow.recordingType = LMComLib.SoundPlayerType.SL;
                    this.renderSLInstallHTML = true;
                }
                else {
                    playerType = SndLow.recordingType = LMComLib.SoundPlayerType.SL;
                    this.renderSLInstallHTML = true;
                }
                if (this.renderSLInstallHTML)
                    Pager.renderTemplateEx('global-media', 'install_sl', this);
                console.log('soundnew.ts: Player.selectDriver end');
            }
            catch (msg) {
                console.log('Error: Player.selectDriver', msg);
                debugger;
                throw msg;
            }
        }
        globalMedia.prototype.adjustGlobalDriver = function (isRecorder, completed) {
            var _this = this;
            var doCompleted = function (dr) {
                var disbl = dr == _dummyDriver;
                _this.needInstall(disbl);
                completed(dr, disbl);
            };
            //hotovo
            if (!isRecorder && SndLow.globalAudioPlayer) {
                doCompleted(SndLow.globalAudioPlayer);
                return;
            }
            if (isRecorder && SndLow.globaRecorder) {
                doCompleted(SndLow.globaRecorder);
                return;
            }
            if (!isRecorder) {
                SndLow.createDriver(false, 'slplayer', null, 'cls-audio-unvisible', false, function (dr) {
                    SndLow.globalAudioPlayer = dr;
                    if (dr.type == SndLow.recordingType)
                        SndLow.globaRecorder = dr;
                    doCompleted(dr);
                });
            }
            else {
                if (SndLow.globalAudioPlayer)
                    SndLow.globalAudioPlayer.htmlClearing();
                SndLow.createDriver(false, 'slplayer', null, 'cls-audio-unvisible', true, function (dr) {
                    SndLow.globaRecorder = SndLow.globalAudioPlayer = dr;
                    doCompleted(dr);
                });
            }
        };
        return globalMedia;
    })();
    SndLow.globalMedia = globalMedia;
    function getGlobalMedia() { if (!_globalMedia)
        new globalMedia(); return _globalMedia; }
    SndLow.getGlobalMedia = getGlobalMedia;
    var _globalMedia;
    SndLow.globalAudioPlayer;
    SndLow.globaRecorder;
    function dummyDriver() {
        if (!_dummyDriver)
            _dummyDriver = new MediaDriver(false, null, null);
        return _dummyDriver;
    }
    SndLow.dummyDriver = dummyDriver;
    var _dummyDriver;
    function needInstallFalse() {
        if (!_globalMedia)
            return;
        _globalMedia.needInstall(false);
    }
    SndLow.needInstallFalse = needInstallFalse;
    //export var globalAudioPlayer: MediaDriver;
    //export var globaRecorder: MediaDriver;
    //export function adjustGlobalDriver(isRecorder: boolean, completed: (driver: MediaDriver) => void) {
    //  //hotovo
    //  if (!isRecorder && globalAudioPlayer) { completed(globalAudioPlayer); return; }
    //  if (isRecorder && globaRecorder) { completed(globaRecorder); return; }
    //  //
    //  selectDriver();
    //  if (!isRecorder) {
    //    SndLow.createDriver(false, 'slplayer', null, 'cls-audio-unvisible', false, dr => {
    //      globalAudioPlayer = dr;
    //      if (dr.type == recordingType) globaRecorder = dr;
    //      completed(dr);
    //    });
    //  } else {
    //    SndLow.createDriver(false, 'slplayer', null, 'cls-audio-unvisible', true, dr => {
    //      globaRecorder = globalAudioPlayer = dr;
    //      completed(dr);
    //    });
    //  }
    //}
    function guiBlocker(isStart) {
        if (isStart) {
            if (guiBlockerTimer) {
                debugger;
                throw 'guiBlockerTimer';
            }
            guiBlockerTimer = setTimeout(function () { guiBlockerTimer = 0; guiBlockerLow(true); }, 300);
        }
        else {
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
        if (bg.length == 0)
            return;
        if (isStart)
            bg.removeClass('hide');
        else
            bg.addClass('hide');
    }
    ;
    //http://www.htmlgoodies.com/html5/client/how-to-embed-video-using-html5.html#fbid=XRsS9osNoHa
    function createDriver(isVideo, id, parentId, htmltagClass, isRecording, completed) {
        //selectDriver();
        if (allDrivers[id]) {
            completed(allDrivers[id]);
            return;
        }
        var gm = getGlobalMedia();
        var $parent = _.isEmpty(parentId) ? null : $(parentId);
        var parent = $parent && $parent.length == 1 ? $parent[0] : null;
        var driverType = isRecording ? SndLow.recordingType : (cfg.forceDriver ? cfg.forceDriver : playerType);
        switch (driverType) {
            case LMComLib.SoundPlayerType.HTML5:
                allDrivers[id] = new MediaDriver_Html5(isVideo, id, parent, htmltagClass);
                completed(allDrivers[id]);
                break;
            case LMComLib.SoundPlayerType.SL:
                if (!gm.slInstalled) {
                    //gm.needInstall(true);
                    completed(dummyDriver());
                }
                else {
                    allDrivers[id] = new MediaDriver_SL(isVideo, id, parent, htmltagClass, function (driver) { return completed(driver); });
                    break;
                }
        }
    }
    SndLow.createDriver = createDriver;
    var allDrivers = {}; //evidence vsech driveru.
    var playerType; //v selectDriver(): staticky zjisteny SoundPlayerType
    SndLow.recordingType;
    //var slInstalled: boolean; //staticky SLInstalled test
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
        if (actDriver === void 0) { actDriver = null; }
        Logger.trace_lmsnd('soundnew.ts: SndLow.stop');
        for (var id in allDrivers)
            if (allDrivers[id].handler && allDrivers[id] != actDriver) {
                allDrivers[id].stop();
                if (allDrivers[id].recHandler)
                    allDrivers[id].recordEnd(false);
            }
    }
    SndLow.Stop = Stop;
    (function (media) {
        media[media["video_mp4"] = 1] = "video_mp4";
        media[media["video_webm"] = 2] = "video_webm";
        media[media["audio_mp3"] = 4] = "audio_mp3";
        media[media["audio_wave"] = 8] = "audio_wave";
    })(SndLow.media || (SndLow.media = {}));
    var media = SndLow.media;
    var canPlayRes = -1;
    function html5_CanPlay(m) {
        if (canPlayRes == -1) {
            canPlayRes = 0;
            var elem = document.createElement('audio');
            if (elem.canPlayType) {
                if (elem.canPlayType('audio/mpeg;').replace(/^no$/, '') != '')
                    canPlayRes |= media.audio_mp3;
                if (elem.canPlayType('audio/wav').replace(/^no$/, '') != '')
                    canPlayRes |= media.audio_wave;
            }
            elem = document.createElement('video');
            if (elem.canPlayType) {
                if (elem.canPlayType('video/mp4; codecs="avc1.42E01E"').replace(/^no$/, '') != '')
                    canPlayRes |= media.video_mp4;
                if (elem.canPlayType('video/webm; codecs="vp8, vorbis"').replace(/^no$/, '') != '')
                    canPlayRes |= media.video_webm;
            }
        }
        return (canPlayRes & m) != 0;
    }
    SndLow.html5_CanPlay = html5_CanPlay;
    function compareBrowserVersion(a, b) { return compVerRec(a.split("."), b.split(".")); }
    function compVerRec(a, b) {
        if (a.length == 0)
            a = ['0'];
        if (b.length == 0)
            b = ['0'];
        if (a[0] != b[0] || (a.length == 1 && b.length == 1))
            return parseInt(a[0]) - parseInt(b[0]);
        return compVerRec(a.slice(1), b.slice(1));
    }
    //zvuk v pameti (pro html5 i SL)
    var recordedSound = (function () {
        function recordedSound(driver, data) {
            this.driver = driver;
            if (typeof data === 'string') {
                this.url = data;
            }
            else {
                this.isMemory = true;
                this.url = driver.createObjectURL(data);
            }
        }
        recordedSound.prototype.close = function () { if (this.isMemory)
            this.driver.revokeObjectURL(this.url); };
        return recordedSound;
    })();
    SndLow.recordedSound = recordedSound;
    var MediaDriver = (function () {
        //alowTitle(): string { return ''; }
        function MediaDriver(isVideo, id, parent) {
            this.isVideo = isVideo;
            this.id = id;
            this.parent = parent;
            this.timerId = 0;
        }
        //Playing
        MediaDriver.prototype.openFile = function (url) { debugger; };
        //Recording
        MediaDriver.prototype.recordStart = function (par) { debugger; };
        MediaDriver.prototype.recordEnd = function (finishAudioFile) { debugger; };
        MediaDriver.prototype.createObjectURL = function (data) { debugger; return null; };
        MediaDriver.prototype.revokeObjectURL = function (url) { debugger; };
        MediaDriver.prototype.htmlClearing = function () { try {
            this.stop(); /*this.setTimer(null);*/
            delete allDrivers[this.id];
            if (!this.htmlElement)
                return;
            this.htmlElement.remove();
            this.htmlElement = null;
        }
        catch (msg) { } };
        //begMsec<0 => pouze open. endMsec<0 => hraje se do konce
        MediaDriver.prototype.openPlay = function (url, begMsec, endMsec /*, onBlockGui: (isStart: boolean) => void = null*/) {
            SndLow.Stop(this);
            var th = this;
            th.onCanplaythrough = th.onPaused = th.timeupdate = null;
            if (th.actPlayer)
                th.actPlayer.reject();
            var def = th.actPlayer = $.Deferred();
            th.onPaused = function () { if (th.onCanplaythrough)
                return; th.onPaused = null; th.timeupdate = null; def.resolve(); };
            th.timeupdate = function (msec) {
                if (endMsec > 0 && msec > endMsec)
                    th.handler.pause();
                else
                    def.notify(msec);
            };
            th.onCanplaythrough = function () {
                th.onCanplaythrough = null;
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
        MediaDriver.prototype.doTimeupdate = function () { if (!this.timeupdate)
            return; try {
            this.timeupdate(Math.round(this.handler.currentTime * 1000));
        }
        catch (msg) { } };
        MediaDriver.prototype.doPaused = function () { Logger.trace_lmsnd('soundnew.ts: MediaDriver.doPaused'); if (!this.onPaused)
            return; try {
            this.onPaused();
        }
        catch (msg) { } };
        MediaDriver.prototype.doCanplaythrough = function () { guiBlocker(false); Logger.trace_lmsnd('soundnew.ts: MediaDriver.doCanplaythrough'); if (!this.onCanplaythrough)
            return; try {
            this.onCanplaythrough();
        }
        catch (msg) { } };
        MediaDriver.prototype.doLoading = function (isStart) { Logger.trace_lmsnd('soundnew.ts: MediaDriver.doLoading'); if (!this.loading)
            return; try {
            this.loading(isStart);
        }
        catch (msg) { } };
        MediaDriver.prototype.onError = function (err) {
            this.errorFlag = true;
            setTimeout(function () { this.errorFlag = false; }, 100); //nastav na chvili errorFlag, aby byla sance na ukonceni timeru.
            Logger.error_snd('Audio error', err); //LMSnd.options.onError("HTML5 Error code: " + err);
            try {
                this.stop();
            }
            catch (e) { }
        };
        MediaDriver.prototype.stop = function () {
            Logger.trace_lmsnd('soundnew.ts: MediaDriver.stop start');
            try {
                //if (this.actPlayer) { this.actPlayer.reject(); this.actPlayer = null; }
                if (this.handler)
                    this.handler.pause();
                this.recordingChanged(false);
                Logger.trace_lmsnd('soundnew.ts: MediaDriver.stop end');
            }
            catch (msg) {
                Logger.error_snd('MediaDriver.stop', msg);
                debugger;
                throw msg;
            }
        };
        MediaDriver.prototype.doRecordingCompleted = function () {
            Logger.trace_lmsnd('soundnew.ts: doRecordingCompleted beg');
            delete this.recordWorker;
            if (!this.recordStartPar || !this.recordStartPar.toMemoryCompleted)
                return;
            this.recordStartPar.toMemoryCompleted(this.recordStartPar.toMemoryCompletedData);
            delete this.recordStartPar;
            Logger.trace_lmsnd('soundnew.ts: doRecordingCompleted end');
        };
        MediaDriver.prototype.recordingChanged = function (isRec) {
            if (!this.recordStartPar || !this.recordStartPar.isRecording)
                return;
            this.recordStartPar.isRecording(isRec);
            //if (!isRec) { this.recordStartPar.isRecording = null; this.recordStartPar.miliseconds = null; }
        };
        MediaDriver.prototype.play = function (url, msecPos, playProgress) {
            var th = this;
            this.openPlay(url, msecPos, -1).
                done(function () { if (playProgress)
                playProgress(-1); }).
                progress(function (msec) { if (playProgress)
                playProgress(msec + 50); });
        };
        return MediaDriver;
    })();
    SndLow.MediaDriver = MediaDriver;
    function createMP3Worker(driver) {
        var par = driver.recordStartPar;
        if (mp3WorkerLib.isOldBrowser) {
            return mp3Worker.worker = {
                postMessage: function (msg) {
                    switch (msg.cmd) {
                        case 'end':
                            Logger.trace_lmsnd('createMP3Worker end');
                            Pager.blockGui(false);
                            driver.doRecordingCompleted();
                            break;
                    }
                }
            };
        }
        else {
            var workerJs = 'wavWorker';
            var worker = new Worker('../jslib/js/sound/' + workerJs + '.js');
            var res = [];
            worker.onmessage = function (ev) {
                switch (ev.data.cmd) {
                    case 'data':
                    case 'end':
                        if (par.toDisc) {
                            if (ev.data.cmd == 'end') {
                                worker.terminate();
                                worker = null;
                                Logger.trace_lmsnd('createMP3Worker end');
                                Pager.blockGui(false);
                                driver.doRecordingCompleted();
                            }
                        }
                        else {
                            var data = ev.data.data;
                            mp3WorkerLib.log('push ' + ev.data.cmd + ' ' + ev.data.id + ': ' + data.byteLength.toString());
                            res.push(data);
                            if (ev.data.cmd == 'end') {
                                worker.terminate();
                                worker = null;
                                Logger.trace_lmsnd('createMP3Worker end');
                                //concatenate chunks to one array
                                var len = 0;
                                _.each(res, function (r) { return len += r.length; });
                                var mp3 = new Uint8Array(len);
                                var pos = 0;
                                _.each(res, function (r) { mp3.set(r, pos); pos += r.length; });
                                Pager.blockGui(false);
                                par.toMemoryCompletedData = mp3.buffer;
                                driver.doRecordingCompleted();
                            }
                        }
                        break;
                }
            };
            return worker;
        }
    }
    SndLow.createMP3Worker = createMP3Worker;
    //http://code.tutsplus.com/tutorials/html5-audio-and-video-what-you-must-know--net-15545
    //https://developer.mozilla.org/en-US/Apps/Build/Audio_and_video_delivery/buffering_seeking_time_ranges
    var MediaDriver_Html5 = (function (_super) {
        __extends(MediaDriver_Html5, _super);
        function MediaDriver_Html5(isVideo, id, parent, htmltagClass) {
            _super.call(this, isVideo, id, parent);
            this.type = LMComLib.SoundPlayerType.HTML5;
            try {
                var th = this;
                Logger.trace_lmsnd('soundnew.ts: MediaDriver_Html5.init start');
                th.htmlElement = $(isVideo ? '<video id="driver-' + id + '" class="cls-video embed-responsive-item' + (htmltagClass ? htmltagClass : '') + '"></video>' : '<audio id="driver-' + id + '" class="cls-audio ' + (htmltagClass ? htmltagClass : '') + '"></audio>');
                th.html5Handler = (th.htmlElement[0]);
                th.handler = th.html5Handler;
                th.recHandler = new html5Recorder.RecHandler();
                var $par = parent ? $(parent) : $('body');
                if (isVideo) {
                    var parClasses = $par.attr('class').split(/\s+/);
                    _.each(parClasses, function (cls) { if (cls.indexOf('video-') != 0)
                        return; th.htmlElement.addClass(cls); });
                }
                $par.prepend(th.htmlElement[0]);
                if (!th.html5Handler.load) {
                    debugger;
                    throw 'MediaDriver_Html5.init: cannot find load method of audio/video tag';
                } //kontrola audio objektu
                $(th.html5Handler).
                    on('error', function () { return th.onError(th.html5Handler.error.code.toString()); }).
                    on('loadeddata', function () { return th.doCanplaythrough(); }).
                    on('ended', function () { return th.doPaused(); }).
                    on('pause', function () { return th.doPaused(); }).
                    on('timeupdate', function () { return th.doTimeupdate(); });
                Logger.trace_lmsnd('soundnew.ts: HTML5.init end');
            }
            catch (msg) {
                Logger.error_snd('MediaDriver_Html5.init', msg);
                debugger;
                throw msg;
            }
        }
        MediaDriver_Html5.prototype.recordStart = function (par) {
            var _this = this;
            this.recordStartPar = par;
            this.recordedMilisecs = 0;
            if (!par.toDisc)
                this.memorySound = [];
            if (par.toDisc) {
                this.recordWorkerInitialized = false;
                this.recordWorker = createMP3Worker(this);
            }
            var cfg = null;
            html5Recorder.startRecording(function (ev) {
                var sampleRate = 8000;
                if (!_this.recordWorkerInitialized && par.recordStarting)
                    par.recordStarting();
                if (!cfg)
                    cfg = WavePCM.getConfig(ev.inputBuffer.sampleRate, html5Recorder.bufferLength, sampleRate);
                var floatBuf = new Float32Array(ev.inputBuffer.getChannelData(0));
                var buf = WavePCM.toPCM(cfg, floatBuf);
                if (par.toDisc) {
                    if (!_this.recordWorkerInitialized) {
                        _this.recordWorkerInitialized = true;
                        _this.recordingChanged(true);
                        var hdr = new Uint16Array(3);
                        hdr[0] = sampleRate;
                        hdr[1] = 16;
                        hdr[2] = 1;
                        mp3WorkerLib.postInitHTML5Message(_this.recordWorker, {
                            recordStartPar: mp3WorkerLib.getWorkerRecordStartPar(_this.recordStartPar),
                            pagerBasicUrl: Pager.basicUrl, firstData: hdr //, in_samplerate: sampleRate, isAbr: null, VBR_mean_bitrate_kbps: null, firstData: hdr, firstData_ieee_float: null, VBR_quality: 0
                        });
                        mp3WorkerLib.postEncodeHTML5Message(_this.recordWorker, buf);
                    }
                    else {
                        mp3WorkerLib.postEncodeHTML5Message(_this.recordWorker, buf);
                    }
                }
                else {
                    _this.recordStartPar.actHtml5SampleRate = ev.inputBuffer.sampleRate;
                    _this.memorySound.push(floatBuf);
                }
                _this.recordedMilisecs += floatBuf.length / ev.inputBuffer.sampleRate * 1000;
                if (_this.recordStartPar.miliseconds) {
                    _this.recordStartPar.miliseconds(_this.recordedMilisecs); //this.recordedMilisecs / ev.inputBuffer.sampleRate * 1000);
                }
            });
        };
        MediaDriver_Html5.prototype.recordEnd = function (finishAudioFile) {
            this.recordingChanged(false);
            html5Recorder.stopRecording();
            if (!this.recordStartPar || !finishAudioFile)
                return;
            if (this.recordStartPar.toDisc) {
                Pager.blockGui(true);
                mp3WorkerLib.postFinishHTML5Message(this.recordWorker);
            }
            else {
                var view = html5Recorder.encodeWAV(this.memorySound, this.recordStartPar.actHtml5SampleRate);
                this.recordStartPar.toMemoryCompletedData = view.buffer;
                this.doRecordingCompleted();
            }
            //this.recordWorker = null; this.recordStartPar = null; this.memorySound = null;
        };
        MediaDriver_Html5.prototype.createObjectURL = function (data) {
            var blob = new Blob([new DataView(data)], { type: "audio/wav" });
            return URL.createObjectURL(blob);
        };
        MediaDriver_Html5.prototype.revokeObjectURL = function (url) { URL.revokeObjectURL(url); };
        MediaDriver_Html5.prototype.isRecording = function () { return html5Recorder.audioNodesConnected; };
        MediaDriver_Html5.prototype.formatCommandline = function (url) {
            var th = this;
            if (typeof url === 'string') {
                var s = url.toLowerCase();
                th.url = url;
            }
            else
                delete th.url;
        };
        MediaDriver_Html5.prototype.openFile = function (url) {
            var th = this;
            if (!url) {
                th.url = '';
                return;
            }
            Logger.trace_lmsnd('soundnew.ts: MediaDriver_Html5.openFile start: url=' + url);
            try {
                var urlLow = url.toLowerCase();
                if (!th.url || th.url.indexOf(urlLow) < 0) {
                    Logger.trace_lmsnd('soundnew.ts: MediaDriver_Html5.openFile jine URL');
                    th.html5Handler.src = url;
                    th.url = urlLow;
                    th.html5Handler.load();
                }
                else {
                    Logger.trace_lmsnd('soundnew.ts: MediaDriver_Html5.openFile stejne URL');
                    if (th.onCanplaythrough)
                        th.onCanplaythrough();
                }
            }
            catch (msg) {
                th.html5Handler.src = null;
                Logger.error_snd('MediaDriver_Html5.openFile', msg);
                debugger;
                throw msg;
            }
        };
        return MediaDriver_Html5;
    })(MediaDriver);
    SndLow.MediaDriver_Html5 = MediaDriver_Html5;
    //export interface IPCMEventArgument {
    //  Value: string;
    //  BitsPerSample: number; SamplesPerSecond: number;
    //}
    var slWarning;
    //var slVersion = "5.0.61118.0";
    var slVersion = "5.1.20913.0";
    SndLow.slInstallUrl = 'http://www.microsoft.com/getsilverlight';
    var MediaDriver_SL = (function (_super) {
        __extends(MediaDriver_SL, _super);
        function MediaDriver_SL(isVideo, id, parentEl, htmltagClass, completed) {
            var _this = this;
            _super.call(this, isVideo, id, parentEl);
            this.type = LMComLib.SoundPlayerType.SL;
            try {
                Logger.trace_lmsnd('soundnew.ts: MediaDriver_SL.constructor: init start');
                var self = this;
                var src = Silverlight.createObject(Pager.basicUrl + 'schools/slextension.xap', null, 'driver-' + id, 
                //var src = Silverlight.createObject(cfg.baseTagUrl ? cfg.baseTagUrl + '/schools/slextension.xap' : '../schools/slextension.xap', null, 'driver-' + id,
                //var src = Silverlight.createObject('slextension.xap', null, 'driver-' + id,
                { autoUpgrade: 'true', background: 'white', minRuntimeVersion: slVersion, alt: 'LANGMaster', enablehtmlaccess: 'true' }, {
                    onError: function (msg) { return _this.onError(msg); },
                    onLoad: function (sender) {
                        try {
                            Logger.trace_lmsnd('soundnew.ts: MediaDriver_SL.constructor: onLoad start');
                            var video = sender.getHost().content.HTML5Like;
                            var slObj = $('#' + id);
                            self.handler = self.recHandler = self.slHandler = video;
                            self.isVideo = isVideo;
                            video.alowTitle = CSLocalize('f9726cae800748ef83e29f8d3c2cbb98', 'Alow microphone');
                            video.addEventListener("onCanplaythrough", function () { return self.doCanplaythrough(); });
                            video.addEventListener("onPaused", function () { return self.doPaused(); });
                            video.addEventListener("timeupdate", function () { return self.doTimeupdate(); });
                            video.addEventListener("OnPCMData", function (sender, ev) { try {
                                self.slOnPCMData(ev.Value);
                            }
                            catch (exp) {
                                exp = null;
                            } });
                            video.addEventListener("OnRecordedMilisecs", function (sender, ev) {
                                try {
                                    if (self.recordStartPar.miliseconds)
                                        _this.recordStartPar.miliseconds(ev.Value);
                                }
                                catch (exp) { }
                            });
                            completed(self);
                            Logger.trace_lmsnd('soundnew.ts: MediaDriver_SL.constructor: onLoad end');
                        }
                        catch (msg) {
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
                    _.each(parClasses, function (cls) { if (cls.indexOf('video-') != 0)
                        return; _this.htmlElement.addClass(cls); });
                }
                $parent.prepend(this.htmlElement[0]);
                this.parent = $parent[0];
                Logger.trace_lmsnd('soundnew.ts: MediaDriver_SL.constructor: init end');
            }
            catch (msg) {
                Logger.error_snd('soundnew.ts: MediaDriver_SL.constructor: init', msg);
                debugger;
                throw msg;
            }
        }
        MediaDriver_SL.prototype.isRecording = function () { return this.slHandler.isRecording(); };
        MediaDriver_SL.prototype.recordStart = function (par) {
            var _this = this;
            this.recordStartPar = par;
            this.recordedMilisecs = 0;
            this.recordWorkerInitialized = false;
            this.recordAlowMicrophone(function () {
                _this.slHandler.recordStart(par);
                if (!_this.recordWorkerInitialized && _this.recordStartPar.recordStarting)
                    _this.recordStartPar.recordStarting();
                _this.recordingChanged(true);
                if (par.toDisc) {
                    _this.recordWorker = createMP3Worker(_this);
                }
            });
        };
        MediaDriver_SL.prototype.recordAlowMicrophone = function (completed) {
            var _this = this;
            if (!this.slHandler.alowMicrophone()) {
                this.htmlElement.css('top', '0px');
                this.htmlElement.css('position', 'inherit');
                $(window).scrollTop(0);
                var testMicrophoneTimer = setInterval(function () {
                    if (!_this.slHandler.alowMicrophone())
                        return;
                    clearInterval(testMicrophoneTimer);
                    _this.htmlElement.css('top', '-50px');
                    _this.htmlElement.css('position', 'absolute');
                    completed();
                }, 100);
            }
            else
                completed();
        };
        MediaDriver_SL.prototype.recordEnd = function (finishAudioFile) {
            this.recordingChanged(false);
            this.slHandler.recordEnd();
            Logger.trace_lmsnd('MediaDriver_SL: after this.slHandler.recordEnd()');
            if (!finishAudioFile)
                return;
            if (this.recordStartPar.toDisc) {
                Pager.blockGui(true);
                mp3WorkerLib.postFinishSLMessage(this.recordWorker);
            }
            else {
                this.doRecordingCompleted();
            }
        };
        MediaDriver_SL.prototype.createObjectURL = function (data) { return this.slHandler.createObjectURL(); };
        MediaDriver_SL.prototype.revokeObjectURL = function (url) { this.slHandler.revokeObjectURL(url); };
        MediaDriver_SL.prototype.slOnPCMData = function (rawBase64) {
            if (!this.recordStartPar)
                return; //asi jiz volano recordEnd, dalsi PCM buffery jsou ignorovany
            if (!this.recordWorkerInitialized) {
                this.recordWorkerInitialized = true;
                mp3WorkerLib.postInitSLMessage(this.recordWorker, {
                    recordStartPar: mp3WorkerLib.getWorkerRecordStartPar(this.recordStartPar),
                    pagerBasicUrl: Pager.basicUrl, firstData: rawBase64,
                });
            }
            else {
                mp3WorkerLib.postEncodeSLMessage(this.recordWorker, rawBase64);
            }
            //this.recordedMilisecs += 1000 * ev.Value.length / (ev.BitsPerSample / 8) / ev.SamplesPerSecond;
            //if (this.recordStartPar.miliseconds) {
            //  this.recordStartPar.miliseconds(this.recordedMilisecs); //this.recordedMilisecs / ev.SamplesPerSecond * 1000);
            //}
        };
        MediaDriver_SL.prototype.openFile = function (urlOrBuffer) {
            Logger.trace_lmsnd('soundnew.ts: MediaDriver_SL.openFile start: url=' + urlOrBuffer);
            this.url = urlOrBuffer;
            this.slHandler.openFile(urlOrBuffer);
        };
        return MediaDriver_SL;
    })(MediaDriver);
    SndLow.MediaDriver_SL = MediaDriver_SL;
})(SndLow || (SndLow = {}));
//******************* Player pro EA
var LMSnd;
(function (LMSnd) {
    var Player = (function () {
        function Player() {
        }
        Player.init = function (_onStoped) {
            SndLow.getGlobalMedia().adjustGlobalDriver(false, function (dr, disabled) {
                onStoped = _onStoped;
            });
        };
        Player.playFile = function (url, sec) {
            try {
                Logger.trace_lmsnd('soundnew.ts: LMSnd.Player.playFile start');
                if (!onStoped) {
                    debugger;
                    throw '!onStoped';
                }
                url = url.toLowerCase().replace('.wma', '.mp3');
                Logger.trace_lmsnd('soundnew.ts: LMSnd.Player.playFile sec=' + sec.toString() + ', url=' + url);
                SndLow.globalAudioPlayer.play(url, sec * 1000, function (msec) {
                    if (msec < 0) {
                        onStoped();
                        Logger.trace_lmsnd('soundnew.ts: LMSnd.Player.playFile stoped');
                    }
                    else {
                        Logger.trace_lmsnd('****** ' + msec.toString());
                        if (file)
                            file.onPlaying(msec);
                    }
                });
                Logger.trace_lmsnd('soundnew.ts: LMSnd.Player.playFile end');
            }
            catch (msg) {
                Logger.error_snd('soundnew.ts: LMSnd.Player.playFile', msg);
                debugger;
                throw msg;
            }
        };
        Player.play = function (_file, msec) {
            try {
                Logger.trace_lmsnd('soundnew.ts: LMSnd.Player.play start');
                file = _file;
                var url = _file.getFileUrl().toLowerCase();
                Player.playFile(url, msec / 1000);
                Logger.trace_lmsnd('soundnew.ts: LMSnd.Player.play end');
            }
            catch (msg) {
                Logger.error_snd('soundnew.ts: LMSnd.Player.playFile', msg);
                debugger;
                throw msg;
            }
        };
        Player.stop = function () {
            if (!SndLow.globalAudioPlayer || !SndLow.globalAudioPlayer.handler)
                return;
            try {
                SndLow.globalAudioPlayer.stop();
            }
            catch (err) { }
        };
        return Player;
    })();
    LMSnd.Player = Player;
    var onStoped;
    //export var driver: SndLow.MediaDriver;
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
    //export var bufferLength = 4096;
    html5Recorder.bufferLength = 16384;
    html5Recorder.wavUrl = null; //URL pro prime prehrani nahraneho zvuku
    var audioCaptureTested = false; //priznak otestovani, zdali prohlizec umi HTML5 Audio capture 
    var audioContextError; //vysledek testu. NULL => ok
    //nodes a context, vznikle pri prvnim recording
    var audioContext = null;
    var copyToBufferNode;
    var microphoneNode;
    html5Recorder.audioNodesConnected = false;
    var recBuffers = []; //buffer s nahranumi WAV samples
    var RecHandler = (function () {
        function RecHandler() {
        }
        RecHandler.prototype.recordEnd = function () { stopRecording(); };
        RecHandler.prototype.isRecording = function () { return html5Recorder.audioNodesConnected; };
        return RecHandler;
    })();
    html5Recorder.RecHandler = RecHandler;
    function checkHTML5AudioCapture() {
        if (audioCaptureTested)
            return audioContextError == null;
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
        AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext)
            errors.push("Browser does not support window.AudioContext.");
        var audioContextError = errors.join("\r\n");
        if (audioContextError == '')
            audioContextError = null;
        return audioContextError == null;
    }
    html5Recorder.checkHTML5AudioCapture = checkHTML5AudioCapture;
    function startRecording(onProcess) {
        if (html5Recorder.audioNodesConnected)
            return; //jiz ze nahrava
        if (!checkHTML5AudioCapture()) {
            debugger;
            throw '!checkHTML5AudioCapture';
        } //nemelo by nastat, checkHTML5AudioCapture() musi projit pri testu na HTML5 nahravani
        recBuffers = []; //vyprazdni buffers
        if (!audioContext) {
            //BT 2247
            //var alowMicrophoneTimer: number;
            //if (!bowser.agent.firefox)
            //  alowMicrophoneTimer = setTimeout(() => { alert('Allow the microphone, please!\r\n(using the button rigth above the content of the page)'); alowMicrophoneTimer = 0; }, 3000);
            navigator.getUserMedia({ audio: true, video: false }, function (stream) {
                //BT 2247 if (alowMicrophoneTimer) clearTimeout(alowMicrophoneTimer); //mikrofon povolen => zrus upozorneni
                audioContext = new AudioContext();
                microphoneNode = audioContext.createMediaStreamSource(stream);
                copyToBufferNode = audioContext.createScriptProcessor(html5Recorder.bufferLength, 1, 1); //AudioNode na zaznamenani do bufferu
                connectAudioNodes(function (ev) { if (html5Recorder.audioNodesConnected)
                    onProcess(ev); }); //napojeni audio nodes
            }, function (err) { return alert('navigator.getUserMedia: ' + err.message); });
        }
        else {
            connectAudioNodes(function (ev) { if (html5Recorder.audioNodesConnected)
                onProcess(ev); });
        }
    }
    html5Recorder.startRecording = startRecording;
    function connectAudioNodes(onProcess) {
        if (onProcess === void 0) { onProcess = null; }
        if (!!onProcess && !html5Recorder.audioNodesConnected) {
            copyToBufferNode.onaudioprocess = onProcess;
            microphoneNode.connect(copyToBufferNode);
            copyToBufferNode.connect(audioContext.destination);
            html5Recorder.audioNodesConnected = true;
            Logger.trace_lmsnd('connectAudioNodes, audioNodesConnected = true');
        }
        else if (!onProcess && html5Recorder.audioNodesConnected) {
            microphoneNode.disconnect();
            copyToBufferNode.disconnect();
            html5Recorder.audioNodesConnected = false;
            Logger.trace_lmsnd('connectAudioNodes, audioNodesConnected = false');
        }
    }
    function clearRecording() { if (html5Recorder.wavUrl) {
        URL.revokeObjectURL(html5Recorder.wavUrl);
        html5Recorder.wavUrl = null;
    } }
    function stopRecording() {
        if (!html5Recorder.audioNodesConnected)
            return;
        connectAudioNodes(null); //odvaz mikrofon z grafu
        //if (recBuffers.length == 0) { debugger; throw 'recBuffers.length == 0'; }
        ////linearize recording
        //var samples = mergeBuffers(recBuffers); recBuffers = [];
        //Logger.trace_lmsnd('HTML5rec.stopRecording len=' + samples.length.toString());
        ////preved do blob a url
        //var dataview = encodeWAV(samples, 44100);
        //var blob = new Blob([dataview], { type: "audio/wav" });
        //wavUrl = URL.createObjectURL(blob);
        //Logger.trace_lmsnd('HTML5rec.stopRecording wavUrl=' + wavUrl);
        //if (completed) completed(wavUrl);
    }
    html5Recorder.stopRecording = stopRecording;
    function mergeBuffers(recBuffers) {
        var len = 0;
        _.each(recBuffers, function (b) { return len += b.length; }); //zjisti delku vysledku
        var result = new Float32Array(len); //alokuj pamet
        var offset = 0;
        _.each(recBuffers, function (b) { result.set(b, offset); offset += b.length; }); //zkopiruj bufery do jednoho
        return result;
    }
    function encodeWAV(recBuffers, sampleRate) {
        var floats = mergeBuffers(recBuffers);
        var buffer = new ArrayBuffer(44 + floats.length * 2);
        var view = new DataView(buffer);
        writeString(view, 0, 'RIFF'); // RIFF identifier 
        view.setUint32(4, 32 + floats.length * 2, true); // file length
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
        view.setUint32(40, floats.length * 2, true); // data chunk length
        floatTo16BitPCM(view, 44, floats);
        return view;
    }
    html5Recorder.encodeWAV = encodeWAV;
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
})(html5Recorder || (html5Recorder = {}));

var WavePCM;
(function (WavePCM) {
    function toPCM(cfg, buffer) {
        return bitReduce(cfg, resampleAndInterleave(cfg, buffer));
    }
    WavePCM.toPCM = toPCM;
    function getConfig(inputSampleRate, bufferLength, outputSampleRate) {
        var resampledBufferLength = Math.round(bufferLength * outputSampleRate / inputSampleRate);
        return {
            inputSampleRate: inputSampleRate,
            bufferLength: bufferLength,
            outputBytesPerSample: 2,
            outputSampleRate: outputSampleRate,
            resampleRatio: (bufferLength - 1) / (resampledBufferLength - 1),
            resampledBufferLength: resampledBufferLength,
            bufResampleAndInterleave: new Float32Array(resampledBufferLength),
            bufBitReduce: new Uint8Array(resampledBufferLength * 2),
        };
    }
    WavePCM.getConfig = getConfig;
    function bitReduce(cfg, floatData) {
        var outputData = cfg.bufBitReduce; //new Uint8Array(floatData.length * cfg.outputBytesPerSample);
        var outputIndex = 0;
        for (var i = 0; i < floatData.length; i++) {
            var sample = floatData[i];
            if (sample > 1)
                sample = 1;
            else if (sample < -1)
                sample = -1;
            switch (cfg.outputBytesPerSample) {
                case 4:
                    sample = sample * 2147483648;
                    outputData[outputIndex++] = sample;
                    outputData[outputIndex++] = sample >> 8;
                    outputData[outputIndex++] = sample >> 16;
                    outputData[outputIndex++] = sample >> 24;
                    break;
                case 3:
                    sample = sample * 8388608;
                    outputData[outputIndex++] = sample;
                    outputData[outputIndex++] = sample >> 8;
                    outputData[outputIndex++] = sample >> 16;
                    break;
                case 2:
                    sample = sample * 32768;
                    outputData[outputIndex++] = sample;
                    outputData[outputIndex++] = sample >> 8;
                    break;
                case 1:
                    outputData[outputIndex++] = (sample + 1) * 128;
                    break;
                default:
                    throw "Only 8, 16, 24 and 32 bits per sample are supported";
            }
        }
        return new Uint16Array(outputData.buffer);
    }
    function resampleAndInterleave(cfg, buffer) {
        if (cfg.outputSampleRate === cfg.inputSampleRate)
            return buffer;
        var outputData = cfg.bufResampleAndInterleave; //.new Float32Array(cfg.resampledBufferLength);
        outputData[cfg.resampledBufferLength - 1] = buffer[cfg.bufferLength - 1];
        for (var i = 0; i < cfg.resampledBufferLength - 1; i++) {
            var ir = i * cfg.resampleRatio;
            var op = Math.floor(ir);
            var channelData = buffer;
            outputData[i] = channelData[op] + (channelData[op + 1] - channelData[op]) * (ir - op);
        }
        return outputData;
    }
})(WavePCM || (WavePCM = {}));

//http://xregexp.com/plugins/, d:\Instalace\JavascriptUnicode\
var Unicode;
(function (Unicode) {
    var a = new RegExp("\\w{4}", "g");
    //unicode - properties.js
    var White_Space = "0009-000D0020008500A01680180E2000-200A20282029202F205F3000".replace(a, "\\u$&");
    var cWhite_Space = new RegExp("[" + White_Space + "\']");
    //unicode-base.js
    var Letter = "0041-005A0061-007A00AA00B500BA00C0-00D600D8-00F600F8-02C102C6-02D102E0-02E402EC02EE0370-037403760377037A-037D03860388-038A038C038E-03A103A3-03F503F7-0481048A-05270531-055605590561-058705D0-05EA05F0-05F20620-064A066E066F0671-06D306D506E506E606EE06EF06FA-06FC06FF07100712-072F074D-07A507B107CA-07EA07F407F507FA0800-0815081A082408280840-085808A008A2-08AC0904-0939093D09500958-09610971-09770979-097F0985-098C098F09900993-09A809AA-09B009B209B6-09B909BD09CE09DC09DD09DF-09E109F009F10A05-0A0A0A0F0A100A13-0A280A2A-0A300A320A330A350A360A380A390A59-0A5C0A5E0A72-0A740A85-0A8D0A8F-0A910A93-0AA80AAA-0AB00AB20AB30AB5-0AB90ABD0AD00AE00AE10B05-0B0C0B0F0B100B13-0B280B2A-0B300B320B330B35-0B390B3D0B5C0B5D0B5F-0B610B710B830B85-0B8A0B8E-0B900B92-0B950B990B9A0B9C0B9E0B9F0BA30BA40BA8-0BAA0BAE-0BB90BD00C05-0C0C0C0E-0C100C12-0C280C2A-0C330C35-0C390C3D0C580C590C600C610C85-0C8C0C8E-0C900C92-0CA80CAA-0CB30CB5-0CB90CBD0CDE0CE00CE10CF10CF20D05-0D0C0D0E-0D100D12-0D3A0D3D0D4E0D600D610D7A-0D7F0D85-0D960D9A-0DB10DB3-0DBB0DBD0DC0-0DC60E01-0E300E320E330E40-0E460E810E820E840E870E880E8A0E8D0E94-0E970E99-0E9F0EA1-0EA30EA50EA70EAA0EAB0EAD-0EB00EB20EB30EBD0EC0-0EC40EC60EDC-0EDF0F000F40-0F470F49-0F6C0F88-0F8C1000-102A103F1050-1055105A-105D106110651066106E-10701075-1081108E10A0-10C510C710CD10D0-10FA10FC-1248124A-124D1250-12561258125A-125D1260-1288128A-128D1290-12B012B2-12B512B8-12BE12C012C2-12C512C8-12D612D8-13101312-13151318-135A1380-138F13A0-13F41401-166C166F-167F1681-169A16A0-16EA1700-170C170E-17111720-17311740-17511760-176C176E-17701780-17B317D717DC1820-18771880-18A818AA18B0-18F51900-191C1950-196D1970-19741980-19AB19C1-19C71A00-1A161A20-1A541AA71B05-1B331B45-1B4B1B83-1BA01BAE1BAF1BBA-1BE51C00-1C231C4D-1C4F1C5A-1C7D1CE9-1CEC1CEE-1CF11CF51CF61D00-1DBF1E00-1F151F18-1F1D1F20-1F451F48-1F4D1F50-1F571F591F5B1F5D1F5F-1F7D1F80-1FB41FB6-1FBC1FBE1FC2-1FC41FC6-1FCC1FD0-1FD31FD6-1FDB1FE0-1FEC1FF2-1FF41FF6-1FFC2071207F2090-209C21022107210A-211321152119-211D212421262128212A-212D212F-2139213C-213F2145-2149214E218321842C00-2C2E2C30-2C5E2C60-2CE42CEB-2CEE2CF22CF32D00-2D252D272D2D2D30-2D672D6F2D80-2D962DA0-2DA62DA8-2DAE2DB0-2DB62DB8-2DBE2DC0-2DC62DC8-2DCE2DD0-2DD62DD8-2DDE2E2F300530063031-3035303B303C3041-3096309D-309F30A1-30FA30FC-30FF3105-312D3131-318E31A0-31BA31F0-31FF3400-4DB54E00-9FCCA000-A48CA4D0-A4FDA500-A60CA610-A61FA62AA62BA640-A66EA67F-A697A6A0-A6E5A717-A71FA722-A788A78B-A78EA790-A793A7A0-A7AAA7F8-A801A803-A805A807-A80AA80C-A822A840-A873A882-A8B3A8F2-A8F7A8FBA90A-A925A930-A946A960-A97CA984-A9B2A9CFAA00-AA28AA40-AA42AA44-AA4BAA60-AA76AA7AAA80-AAAFAAB1AAB5AAB6AAB9-AABDAAC0AAC2AADB-AADDAAE0-AAEAAAF2-AAF4AB01-AB06AB09-AB0EAB11-AB16AB20-AB26AB28-AB2EABC0-ABE2AC00-D7A3D7B0-D7C6D7CB-D7FBF900-FA6DFA70-FAD9FB00-FB06FB13-FB17FB1DFB1F-FB28FB2A-FB36FB38-FB3CFB3EFB40FB41FB43FB44FB46-FBB1FBD3-FD3DFD50-FD8FFD92-FDC7FDF0-FDFBFE70-FE74FE76-FEFCFF21-FF3AFF41-FF5AFF66-FFBEFFC2-FFC7FFCA-FFCFFFD2-FFD7FFDA-FFDC".replace(a, "\\u$&");
    var cLetter = new RegExp("[" + Letter + "]");
    //unicode-categories.js
    var Number = "0030-003900B200B300B900BC-00BE0660-066906F0-06F907C0-07C90966-096F09E6-09EF09F4-09F90A66-0A6F0AE6-0AEF0B66-0B6F0B72-0B770BE6-0BF20C66-0C6F0C78-0C7E0CE6-0CEF0D66-0D750E50-0E590ED0-0ED90F20-0F331040-10491090-10991369-137C16EE-16F017E0-17E917F0-17F91810-18191946-194F19D0-19DA1A80-1A891A90-1A991B50-1B591BB0-1BB91C40-1C491C50-1C5920702074-20792080-20892150-21822185-21892460-249B24EA-24FF2776-27932CFD30073021-30293038-303A3192-31953220-32293248-324F3251-325F3280-328932B1-32BFA620-A629A6E6-A6EFA830-A835A8D0-A8D9A900-A909A9D0-A9D9AA50-AA59ABF0-ABF9FF10-FF19".replace(a, "\\u$&");
    var cNumber = new RegExp("[" + Number + "]");
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
        // Invert 'alphabet'
        for (var i = 0; i < alphabet.length; i++) {
            table[alphabet[i]] = i;
        }
        // Splice in 'alias'
        for (var key in alias) {
            if (!alias.hasOwnProperty(key))
                continue;
            table[key] = table['' + alias[key]];
        }
        lookup = function () { return table; };
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
        var skip = 0; // how many bits we will skip from the first byte
        var bits = 0; // 5 high bits, carry from one byte to the next
        this.output = '';
        // Read one byte of input
        // Should not really be used except by "update"
        this.readByte = function (bt) {
            // coerce the byte to an int
            //if (typeof byte == 'string') byte = byte.charCodeAt(0)
            if (skip < 0) {
                bits |= (bt >> (-skip));
            }
            else {
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
        var skip = 0; // how many bits we have from the previous character
        var bt = 0; // current byte we're producing
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
                // character does not exist in our lookup table
                //return // skip silently. An alternative would be:
                throw Error('Could not find character "' + chr + '" in lookup table.');
            }
            val <<= 3; // move to the high bits
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
            this.old.acceptData(done ? LMComLib.ExerciseStatus.Evaluated : LMComLib.ExerciseStatus.Normal, exData);
        };
        oldToNewScoreProvider.prototype.resetData = function (exData) {
            //var pg: CourseModel.PageUser = <any>{ Results: exData };
            this.old.resetData(exData);
        };
        oldToNewScoreProvider.prototype.getScore = function () {
            var nums = this.old.get_score();
            return nums == null || nums.length != 2 ? null : { s: nums[0], ms: nums[1], flag: 0 };
            //var nums = this.old.get_score(); return nums == null || nums.length != 2 ? null : { s: nums[0] == nums[1] ? 1 : 0, ms: 1, flag: 0 };
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
                case 67: //C           
                case 81:
                    if (!ev.ctrlKey)
                        return;
                    if (ev.which == 67 && selectedText() != '')
                        break;
                    keyMousePos = anim.mousePos; //zapamatuj si aktualni pozici mysi
                    callDict();
                    //readDictInfo(() => setTimeout(callDict, 1));
                    break;
            }
        });
        //*********** popuo okno
        $(function () {
            if (!model) {
                model = new dictModel();
                dlg = JsRenderTemplateEngine.createGlobalTemplate('Dict', model);
                dlg.css('display', 'none');
                dlg.click(function (ev) { ev.cancelBubble = true; ev.stopPropagation(); return false; });
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
    var dlg; //modalni popup
    var dlgBody; //obsah
    var isCtrlDown = false; /*ctrl key je stisknut*/
    var keyMousePos; /*souradnice mysi, zkopirovane v key-down z current_ev*/
    var model; //model
    DictConnector.actDictData; //data Lingea slovniku pro modul, inicializovano v gramatice a modulu
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
        }).each(function (i) { textNodes.push($(this)); textNodesText.push($(this).text()); });
        if (textNodes.length <= 0)
            return;
        //proved word wrap 
        var data = startSplitWords(textNodesText);
        Logger.trace_dict('Dict: wordWrap, 1.sent = ' + data[0].join(''));
        //nahrad slova word-spany
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
                new_nodes.replaceWith(function () { return $(this).contents(); });
                return;
            }
            Logger.trace_dict('cursor top=' + keyMousePos.clientY.toString() + ",left=" + keyMousePos.clientX.toString() +
                "; element top=" + hit_word_elem.offset().top.toString() + ",left=" + hit_word_elem.offset().left.toString() + ",width=" + hit_word_elem.width().toString() + ",height=" + hit_word_elem.height().toString() + ',html=' + hit_word_elem.html());
            var actWord = hit_word_elem.text();
            Logger.trace_dict('Dict: ct_word=' + actWord);
            //return original content:
            new_nodes.replaceWith(function () { return $(this).contents(); });
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
        }
        else {
            res.push('<' + tagStr + '>');
            if (it.text)
                res.push(it.text);
            if (it.items)
                _.each(it.items, function (subIt) { return parseLingeaDict(actWord, subIt, DictConnector.actDictData.Tags, res); });
            res.push('</' + tg + '>');
        }
    }
    function playFile(url) { setTimeout(function () { return LMSnd.Player.playFile(url, 0); }, 1); }
    DictConnector.playFile = playFile;
    var soundMarkHtmlNew = [
        '<span class="sound-repro-new fa fa-volume-off" onclick="DictConnector.playFile(\'{0}\', 0)"></span>',
        '<span class="sound-listen-talk-new fa fa-microphone" onclick="schoolCpv.show(schools.tDictCpv, \'{0}\', \'{1}\')"></span>',
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
        return Unicode.isLetter(ch) || ch == russianAccent || ch == '-' || ch == "'"; // || ch == "'" || ch == "’" || ch == russianAccent;
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
    DictConnector.startSplitWord = startSplitWord;
    function finishSplitWord(word, crsLang) {
        if (_.isEmpty(word))
            return null;
        if (crsLang == LMComLib.Langs.ru_ru)
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
            }
            else if (res.length > 0 && !isWord)
                break;
        }
        return res.length > 0 ? { word: res.join('').toLowerCase(), wordRaw: resRaw.join('') } : null;
    }
    function wordsForDesignTime(sent, crsLang, res) {
        if (_.isEmpty(sent))
            return null;
        sent = sent.toLowerCase();
        if (crsLang == LMComLib.Langs.ru_ru)
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
                if (isEncodedObject(current) &&
                    isArray(last) && current[0] === last[0]) {
                    // current and previous object have same schema,
                    // so merge their values into one array
                    encoded[encoded.length - 1] =
                        last.concat(current.slice(1));
                }
                else {
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
            }
            else {
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
            }
            else if (isArray(value)) {
                return encodeArray(value);
            }
            else {
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
            }
            else if (value[0] === 0 || typeof value[0] !== 'number') {
                return decodeArray(value);
            }
            else {
                return decodeObject(value);
            }
        }
        function decodeArray(value) {
            var len = value.length, decoded = []; // decode array of something
            for (var i = (value[0] === 0 ? 1 : 0); i < len; i++) {
                var v = value[i], obj = decode(v);
                if (isEncodedObject(v) && isArray(obj)) {
                    // several objects was encoded into single array
                    decoded = decoded.concat(obj);
                }
                else {
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
            }
            else {
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
            }
            else if (isArray(value)) {
                return parseArray(value);
            }
            else {
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
            this.suplCtxtGrammar = ko.observable(false); //meni cviceni: phone - dynamicka podminka na kontextovou gramatiku
            this.suplGrammarIcon = ko.observable(true); //meni cviceni: phone - dynamicka podminka na nekontextovou gramatiku
            this.exerciseEvaluated = ko.observable(false); //cviceni je vyhodnocenu
            this.exercisePassive = ko.observable(true); //cviceni je pasivni
            this.score = ko.observable(null); //score vyhodnoceneho cviceni
            var self = this;
            this.grammarClick = function () { return CourseMeta.gui.gotoData(CourseMeta.actGrammar); };
            if (this.needsLogin())
                LMStatus.setReturnUrl();
        }
        TopBarModel.prototype.is = function () {
            var _this = this;
            var typeNames = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                typeNames[_i - 0] = arguments[_i];
            }
            return _.find(typeNames, function (t) { return t == _this.model.type; }) != null;
        };
        //title
        TopBarModel.prototype.isTitle = function () { return this.is(schools.tTest); };
        //logo
        TopBarModel.prototype.logoBig = function () { return !this.logoSmall() && !this.is(schools.tEx); }; //this.is(tMy); }
        TopBarModel.prototype.logoSmall = function () { return this.is(schools.tCourseMeta, schools.tCoursePretest, schools.tGrammFolder, schools.tGrammPage, schools.tGrammContent, schools.tDictInfo, schools.tTest); };
        TopBarModel.prototype.greenArrow = function () { return !this.needsLogin() && this.is(schools.tCourseMeta, schools.tCoursePretest, schools.tEx); };
        TopBarModel.prototype.phoneMore = function () { return !this.needsLogin() && this.is(schools.tMy /*, tHome*/) ? "#collapse-logout" : null; }; //pokud je phone, id DIVu s more informaci, #collapse-more nebo #collapse-more-ex
        //login x logout x profile
        TopBarModel.prototype.logoutAndProfile = function () { return this.isWeb() && !this.needsLogin() && this.is(schools.tMy /*, /*, tHome*/); };
        TopBarModel.prototype.needsLogin = function () { return this.isWeb() && !LMStatus.isLogged(); };
        TopBarModel.prototype.loginUrl = function () {
            if (!this.needsLogin())
                return null;
            if (cfg.logins && cfg.logins.length == 1)
                switch (cfg.logins[0]) {
                    case LMComLib.OtherType.LANGMaster: return "#" + Login.getHash(Login.pageLmLogin);
                    case LMComLib.OtherType.LANGMasterNoEMail: return "#" + Login.getHash(Login.pageLmLoginNoEMail);
                    default: return "#" + Login.getHash(Login.pageLogin);
                }
            else
                return "#" + Login.getHash(Login.pageLogin);
        };
        TopBarModel.prototype.isWeb = function () { return cfg.target == LMComLib.Targets.web; };
        //supplements
        TopBarModel.prototype.hasSupl = function () { return true; };
        //suplGrammarLink(): boolean { return !this.needsLogin() && this.is(tCourseMeta, tCourse, tLess, tMod, tEx) && schools.data.crsStatic2.grammar != null; } //pro ne-phone: staticka podminka na nekontextovou gramatika
        TopBarModel.prototype.suplGrammarLink = function () { return !this.needsLogin() && this.is(schools.tCourseMeta, schools.tEx) && CourseMeta.actGrammar != null; }; //pro ne-phone: staticka podminka na nekontextovou gramatika
        TopBarModel.prototype.suplDict = function () { return !this.needsLogin() && this.is(schools.tEx, schools.tGrammPage) && DictConnector.actDictData != null; /*cfg.dictType!=schools.dictTypes.no;*/ }; //pomocna stranka s vysvetlenim slovniku
        TopBarModel.prototype.suplEval = function () { return !this.needsLogin() && this.is(schools.tEx); }; //informace o vyhodnocenem cviceni
        TopBarModel.prototype.resetClick = function () { CourseMeta.actEx.reset(); return false; }; //??(<schoolEx.Model>(Pager.ActPage)).reset(); }
        TopBarModel.prototype.dictClick = function () { LMStatus.setReturnUrlAndGoto(schools.createDictIntroUrl()); };
        TopBarModel.prototype.suplInstr = function () { return !this.needsLogin() && this.is(schools.tEx); };
        TopBarModel.prototype.suplVocabulary = function () {
            return false;
            //if (!cfg.vocabulary || !this.is(tLess, tMod, tEx)) return false;
            //var lesJson = this.model.myLessonjsonId(); if (lesJson == null) return false;
            //var id = prods.rewLessonId(lesJson); if (id == 0) return false;
            //return true;
        };
        TopBarModel.prototype.vocabularyClick = function () { alert("vocabularyClick"); };
        TopBarModel.prototype.suplBreadcrumb = function () { return !this.needsLogin() && this.is(schools.tEx); };
        //navrat do kurzu pro supplements
        TopBarModel.prototype.backToCourse = function () { return this.is(schools.tDictInfo, schools.tGrammFolder, schools.tGrammPage, schools.tGrammContent, (typeof schoolAdmin == 'undefined' ? '' : schoolAdmin.schoolUserResultsTypeName)) && LMStatus.isReturnUrl(); };
        TopBarModel.prototype.backToCourseClick = function () { LMStatus.gotoReturnUrl(); }; //Pager.navigateTo(getReturnUrl()); }
        return TopBarModel;
    })();
    schools.TopBarModel = TopBarModel;
})(schools || (schools = {}));

var __extends = (this && this.__extends) || function (d, b) {
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
    schools.memoryPersistId = 'memory';
    function getHash(type, companyId, productUrl, persistence, url) {
        return [schools.appId, type, companyId.toString(), productUrl, persistence, url].join('@');
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
        //query string as lowercase
        var params = LowUtils.parseQuery(location.search);
        if (!params)
            params = {};
        var pn;
        for (pn in params) {
            var lp = pn.toLowerCase();
            if (pn == lp)
                continue;
            params[lp] = params[pn];
            delete params[pn];
        }
        //prevezmi parametry z query stringu
        var qr = params['persistType'.toLowerCase()];
        if (qr)
            cfg.persistType = schools.persistTypes[qr];
        qr = params['displayMode'.toLowerCase()];
        if (qr)
            cfg.displayMode = schools.displayModes[qr];
        var initHash = function (hash) { Pager.initHash = function () { return _.isEmpty(cfg.hash) ? hash : cfg.hash; }; };
        switch (cfg.target) {
            case LMComLib.Targets.author:
                CourseMeta.persist = persistMemory.persistCourse;
                //var search = LowUtils.parseQuery(location.search);
                //CourseMeta.forceEval = search != null && search["forceeval"] == "true";
                Trados.adjustLoc(function () {
                    var cook = LMComLib.LMCookieJS_Create(scormCompanyId, 0, null, "id", null, LMComLib.OtherType.Moodle, "id", "firstName", "lastName", '', 0, 0, null);
                    LMStatus.setCookie(cook, false);
                    LMStatus.Cookie = cook;
                    initHash(getHash(schools.tCourseMeta, scormCompanyId, cfg.rootProductId, null, null));
                    completed();
                });
                break;
            case LMComLib.Targets.scorm:
                switch (cfg.persistType) {
                    case schools.persistTypes.persistScormEx:
                        CourseMeta.persist = persistScormEx.persistCourse;
                        Trados.adjustLoc(function () {
                            scorm.init(function (compHost, id, firstName, lastName, isFirstEnter) {
                                var cook = LMComLib.LMCookieJS_Create(scormCompanyId, 0, null, id, null, LMComLib.OtherType.Moodle, id, firstName, lastName, '', 0, 0, null);
                                LMStatus.setCookie(cook, false);
                                LMStatus.Cookie = cook;
                                initHash(getHash(schools.tCourseMeta, scormCompanyId, cfg.rootProductId, null, null));
                                CourseMeta.lib.adjustAllProductList(function () {
                                    if (cfg.licenceConfig && cfg.licenceConfig.isDynamic)
                                        boot.loadCourseJS(completed);
                                    else
                                        completed();
                                });
                            });
                        });
                        break;
                    case schools.persistTypes.persistMemory:
                        CourseMeta.persist = persistMemory.persistCourse;
                        Trados.adjustLoc(function () {
                            //scorm.initDummy();
                            var cook = LMComLib.LMCookieJS_Create(scormCompanyId, 0, null, "id", null, LMComLib.OtherType.Moodle, "id", "firstName", "lastName", '', 0, 0, null);
                            LMStatus.setCookie(cook, false);
                            LMStatus.Cookie = cook;
                            initHash(getHash(schools.tCourseMeta, scormCompanyId, cfg.rootProductId, null, null));
                            CourseMeta.lib.adjustAllProductList(completed); //nacteni infos o vsech produktech
                        });
                        break;
                    default:
                        CourseMeta.persist = persistNewEA.persistCourse;
                        Trados.adjustLoc(function () {
                            scorm.init(function (compHost, id, firstName, lastName, isFirstEnter) {
                                Pager.ajaxGet(Pager.pathType.restServices, Login.CmdAdjustScormUser_Type, Login.CmdAdjustScormUser_Create(compHost, id, firstName, lastName, isFirstEnter, cfg.rootProductId), function (res) {
                                    LMStatus.setCookie(res.Cookie, false);
                                    LMStatus.Cookie = res.Cookie;
                                    setTimeout(LMStatus.loggedBodyClass, 1);
                                    initHash(getHash(schools.tCourseMeta, res.companyId, cfg.rootProductId, null, null));
                                    CourseMeta.lib.adjustAllProductList(completed); //nacteni infos o vsech produktech
                                });
                            });
                        });
                        break;
                }
                break;
            //case LMComLib.Targets.phoneGap:
            //case LMComLib.Targets.download:
            //case LMComLib.Targets.sl:
            //  setTimeout(LMStatus.loggedBodyClass, 1);
            //  //LMStatus.loggedBodyClass();
            //  LMStatus.Cookie = offlineCookie;
            //  persistLocal.Init(cfg.target, () => {
            //    Trados.adjustLoc(() => {
            //      Pager.initUrl = new Url(tHome, offlineCompanyId, cfg.rootCourse, null);
            //      prods.init(completed)//nacteni infos o vsech produktech
            //    });
            //  });
            //  break;
            case LMComLib.Targets.web:
                switch (cfg.persistType) {
                    case schools.persistTypes.persistScormEx:
                        CourseMeta.persist = persistScormEx.persistCourse;
                        Trados.adjustLoc(function () {
                            initHash(getHash(schools.tCourseMeta, scormCompanyId, cfg.rootProductId, null, null));
                            LMStatus.adjustLoggin(function () { return CourseMeta.lib.adjustAllProductList(completed); });
                        });
                        break;
                    case schools.persistTypes.persistMemory:
                        LMStatus.Cookie = offlineCookie;
                        CourseMeta.persist = persistMemory.persistCourse;
                        Pager.initHash = function () { return cfg.hash ? cfg.hash : Gui2.skin.instance.getSkinHome(Login.getHash(Login.pageLogin)); };
                        Trados.adjustLoc(function () {
                            CourseMeta.lib.adjustAllProductList(completed);
                            //initHash(getHash(tCourseMeta, scormCompanyId, cfg.rootProductId, null));
                            //LMStatus.adjustLoggin(() => CourseMeta.lib.adjustAllProductList(completed));
                        });
                        break;
                    default:
                        CourseMeta.persist = persistNewEA.persistCourse;
                        Pager.initHash = function () { return cfg.hash ? cfg.hash : Gui2.skin.instance.getSkinHome(Login.getHash(Login.pageLogin)); };
                        Trados.adjustLoc(function () {
                            //initHash(Gui2.skin.instance.getLoginHome(Login.getHash(Login.pageLogin)));
                            Pager.afterLoginInit = function (completed) {
                                Logger.traceMsg('Model.InitModel afterLoginInit');
                                //Pager.initHash = getHash(tMy, -1, null, null);
                                if (cfg.licenceConfig && cfg.licenceConfig.isDynamic)
                                    boot.loadCourseJS(completed);
                                else
                                    completed();
                            };
                            LMStatus.adjustLoggin(function () { return CourseMeta.lib.adjustAllProductList(completed); });
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
    function LMComUserId() { return !LMStatus.isLogged() ? -1 : LMStatus.Cookie.id; }
    schools.LMComUserId = LMComUserId;
    function homeTitle() { return CSLocalize('5c4e78c9f3884816a78d1d4d9fe1f458', 'My Online Courses and Tests'); }
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
            if (_.any(crsTypes, function (t) { return newPg.type == t; }))
                LMStatus.clearReturnUrl(); //navrat do kurzu, posledni kurz Url
            if (_.any(crsTypes, function (t) { return oldPg.type == t; }))
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
        function Model(typeName, urlParts /*companyId: number, productUrl: string, url: string*/) {
            _super.call(this, schools.appId, typeName, urlParts);
            CourseMeta.actCompanyId = this.copmanyId = urlParts && urlParts.length >= 1 ? parseInt(urlParts[0]) : -1;
            this.productUrl = urlParts && urlParts.length >= 2 ? urlParts[1] : null;
            this.persistence = urlParts && urlParts.length >= 3 ? urlParts[2] : null;
            this.url = urlParts && urlParts.length >= 4 ? urlParts[3] : null;
            DictConnector.actDictData = null;
            this.tb = new schools.TopBarModel(this);
        }
        Model.prototype.hasBreadcrumb = function () { return false; };
        Model.prototype.normalDisplay = function () { return true; };
        Model.prototype.previewExDisplay = function () { return false; };
        Model.prototype.update = function (completed) {
            SndLow.Stop();
            SndLow.needInstallFalse();
            if (!LMStatus.isLogged()) {
                completed();
                return;
            }
            this.doUpdate(completed);
        };
        Model.prototype.doUpdate = function (completed) { completed(); };
        Model.prototype.hasLogin = function () { return cfg.target == LMComLib.Targets.web; };
        Model.prototype.title = function () { return homeTitle(); };
        Model.prototype.iconId = function () { return ''; };
        Model.prototype.breadcrumbs = function () { return []; };
        return Model;
    })(Pager.Page);
    schools.Model = Model;
    var offlineCompanyId = 0x4FFFFFFF;
    var offlineCookie = { id: 0x4FFFFFFF, EMail: null, Login: "localUser", LoginEMail: null, Type: 0, TypeId: null, FirstName: null, LastName: null, OtherData: null, Company: null, created: 0, Roles: null, VerifyStatus: 0 };
    function createGrammUrl(type, url) { return getHash(type, CourseMeta.actCompanyId, CourseMeta.actProduct.url, CourseMeta.actProductPersistence, url); }
    schools.createGrammUrl = createGrammUrl;
    function createDictIntroUrl() { return getHash(schools.tDictInfo, 0, '', null, null); }
    schools.createDictIntroUrl = createDictIntroUrl;
    //export function createHomeUrlStd(): string { return false ? getHash(tCourseMeta, CourseMeta.actCompanyId, CourseMeta.actProduct.url, "") : getHash(tMy, -1, null, null); }
    function createHomeUrlStd() { return getHash(schools.tMy, -1, null, null, null); }
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
        readFiles: function (urls, completed) { return void {}; },
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
    function fModule(modId) { return "mod_" + modId + ".txt"; }
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
            _.each(modJsonIds, function (modId) { return delete modCache[modId]; });
            writeCrsResults(crsId, completed);
        }, function () { return alert("fail"); });
    }
    function readCrsResults(isStart, lmcomUserId, companyId, crsId, completed) {
        persistLocal.readFile(crsId, fCrsResults, function (res) { return completed(modCache = (res == null ? [] : JSON.parse(res))); });
    }
    function readModuleResult(lmcomUserId, companyId, crsId, moduleJsonId, completed) {
        persistLocal.readFile(crsId, fModule(moduleJsonId), function (str) { return completed(str == null ? null : JSON.parse(str)); });
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
    function createCmd(lmcomId, companyId, productId, finish) {
        if (finish === void 0) { finish = null; }
        var res = LMStatus.createCmd(function (r) { r.companyId = companyId; r.productId = productId; r.scormId = null; r.date = Utils.nowToInt(); });
        if (finish)
            finish(res);
        if (lmcomId)
            res.lmcomId = lmcomId;
        return res;
    }
    persistNewEA.createCmd = createCmd;
    persistNewEA.persistCourse = {
        loadShortUserData: function (userId, companyId, prodUrl, completed) {
            Pager.ajaxGet(Pager.pathType.restServices, scorm.Cmd_readCrsResults_Type, createCmd(userId, companyId, prodUrl), 
            //scorm.Cmd_readCrsResults_Create(companyId, prodUrl, null, userId, 0),
            //scorm.Cmd_readCrsResults_Create(companyId, prodUrl, null, userId, 0),
            function (res) {
                Logger.trace_persistNewEA("loadShortUserData: " + res.join(" ### "));
                var obj = {};
                _.each(res, function (kv) { return obj[kv[0]] = JSON.parse(kv[1]); });
                completed(obj);
            });
        },
        loadUserData: function (userId, companyId, prodUrl, modUrl, completed) {
            Pager.ajaxGet(Pager.pathType.restServices, scorm.Cmd_readModuleResults_Type, createCmd(userId, companyId, prodUrl, function (r) { r.key = modUrl; }), 
            //scorm.Cmd_readModuleResults_Create(modUrl, userId, companyId, prodUrl, null),
            //scorm.Cmd_readModuleResults_Create(modUrl, userId, companyId, prodUrl, null),
            function (res) {
                Logger.trace_persistNewEA("loadUserData resp: " + modUrl + ": " + res);
                completed(_.isEmpty(res) ? {} : JSON.parse(res));
            });
        },
        saveUserData: function (userId, companyId, prodUrl, data, completed) {
            Pager.ajaxPost(Pager.pathType.restServices, scorm.Cmd_saveUserData_Type, createCmd(userId, companyId, prodUrl, function (r) { r.data = data; }), 
            //scorm.Cmd_saveUserData_Create(data, userId, companyId, prodUrl, null),
            //scorm.Cmd_saveUserData_Create(data, userId, companyId, prodUrl, null),
            function () {
                Logger.trace_persistNewEA("saveUserData");
                completed();
            });
        },
        readFiles: function (urls, completed) {
            if (!urls || urls.length == 0)
                completed([]);
            var data = [];
            var len = urls.length;
            var ajaxDone; //funkce, vracejici funkci
            ajaxDone = function (idx, fail) { return function (res) {
                data[idx] = fail ? null : (res == null ? "" : res);
                len--;
                if (len == 0)
                    completed(data);
            }; };
            for (var i = 0; i < urls.length; i++)
                $.ajax({ url: urls[i].charAt(0) == '/' ? '..' + urls[i] : urls[i], dataType: "text", headers: { "LoggerLogId": Logger.logId(), "LMComVersion": Utils.LMComVersion } }).
                    done(ajaxDone(i, false)).fail(ajaxDone(i, true)); //i a false je znamo v dobe inicializace Ajax, nikoliv az v dobe navratu z ajax
        },
        resetExs: function (userId, companyId, prodUrl, urls, completed) {
            Pager.ajaxPost(Pager.pathType.restServices, scorm.Cmd_resetModules_Type, createCmd(userId, companyId, prodUrl, function (r) { r.modIds = urls; }), 
            //scorm.Cmd_resetModules_Create(urls, userId, companyId, prodUrl, null),
            //scorm.Cmd_resetModules_Create(urls, userId, companyId, prodUrl, null),
            function (res) {
                Logger.trace_persistNewEA("resetExs: " + res);
                completed();
            });
        },
        createArchive: function (userId, companyId, prodUrl, completed) {
            Pager.ajaxGet(Pager.pathType.restServices, scorm.Cmd_createArchive_Type, createCmd(userId, companyId, prodUrl), 
            //scorm.Cmd_createArchive_Create(LMStatus.Cookie.id, companyId, productId, null),
            //scorm.Cmd_createArchive_Create(LMStatus.Cookie.id, companyId, productId, null),
            function (res) { return completed(res); });
        },
        testResults: function (userId, companyId, prodUrl, completed) {
            Pager.ajaxGet(Pager.pathType.restServices, scorm.Cmd_testResults_Type, createCmd(userId, companyId, prodUrl), 
            //scorm.Cmd_testResults_Create(LMStatus.Cookie.id, companyId, productId, null),
            //scorm.Cmd_testResults_Create(LMStatus.Cookie.id, companyId, productId, null),
            function (res) { return completed(_.map(res, function (r) { return JSON.parse(r); })); });
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
            _.each(data, function (dt) { return Logger.trace_persistScorm(dt[0] + "=" + dt[1] + "; " + dt[2]); });
            var exs = _.map(data, function (dt) {
                var id = dt[0];
                var dfd = $.Deferred();
                setDataLow(dt[0], null, tab_modules, 0, encodeData(dt[2], dt[1]), dfd.resolve);
                return dfd.promise();
            });
            $.when(exs).then(function () { Logger.trace_persistScorm("persistScormEx.saveUserData end"); completed(); }).fail(function () { debugger; throw 'persistScormEx.saveUserData'; });
        },
        readFiles: persistNewEA.persistCourse.readFiles,
        resetExs: function (userId, companyId, prodUrl, urls, completed) {
            var data = urls.join(delim);
            var reqUrl = url(Utils.string_format("type=del_all_key1str&userid={0}&{1}&key1int={2}", [LMStatus.scormUserId(), scorm.attemptId, tab_modules]));
            Logger.trace_persistScorm("resetModules: " + reqUrl + ", data=" + data);
            Pager.doAjax(true, reqUrl, null, data, function (res) { return completed(); });
        },
        createArchive: function (userId, companyId, productId, completed) {
        },
        testResults: function (userId, companyId, productId, completed) {
        }
    };
    var delim = ";";
    var tab_modules = 1;
    var tab_metadata = 2;
    function encodeData(data1, data2) { return (data1 ? Utils.packStr(data1) : '') + delim + (data2 ? Utils.packStr(data2) : ''); }
    function setDataLow(key1str, key2str, key1int, key2int, data, completed) {
        var reqUrl = url(Utils.string_format("type=set_data&userid={0}&{1}&key1str={2}&key2str={3}&key1int={4}&key2int={5}&date={6}", [LMStatus.scormUserId(), scorm.attemptId, key1str, key2str, key1int, key2int, Utils.nowToInt()]));
        //Debug.trace_persistScorm("setData: " + reqUrl + ", data=" + data);
        Pager.doAjax(true, reqUrl, null, data, function (res) { return completed(); });
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
        var res = Pager.path(Pager.pathType.restServicesScorm);
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
            completed(m && m.data ? JSON.parse(m.data) : null);
        },
        saveUserData: function (userId, companyId, prodUrl, data, completed) {
            var prodDb = memDb[prodUrl];
            if (!prodDb) {
                prodDb = {};
                memDb[prodUrl] = prodDb;
            }
            _.each(data, function (dt) { return prodDb[dt[0]] = { id: dt[0], data: dt[2], shortdata: dt[1] }; });
            completed();
        },
        resetExs: function (userId, companyId, prodUrl, urls, completed) {
            delete memDb[prodUrl];
            completed();
        },
        readFiles: persistNewEA.persistCourse.readFiles,
        createArchive: function (userId, companyId, productId, completed) {
            completed(archiveId++);
            //var id = archiveId++;
            //var oldProd = memDb[productId]; delete memDb[productId];
            //productId = productId + '|' + id.toString();
            //memDb[productId] = oldProd;
            //completed(id);
        },
        testResults: function (userId, companyId, productId, completed) {
            persistMemory.persistCourse.loadUserData(userId, companyId, productId, 'result', completed);
            //var results: Array<testMe.result> = [];
            //for (var p in memDb) {
            //  var key: string = p;
            //  if (productId.indexOf(key) != 0) continue;
            //  persistCourse.loadUserData(userId, companyId, key, 'result', res => { if (!res) return; results.push(res); });  
            //  completed(results);
            //}
        }
    };
    var archiveId = 0;
    function reset() { memDb = {}; }
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

var __extends = (this && this.__extends) || function (d, b) {
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
        Page.prototype.template = function () { return 'splashRoot'; };
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
            this.isUserMonthExpired = splash.error.result == schools.licenceResult.userMonthExpired;
            switch (splash.error.result) {
                case schools.licenceResult.demoExpired:
                    this.text = "Trial period expired at " + Utils.intToDateStr(splash.error.DemoExpired);
                    break;
                case schools.licenceResult.userMonthExpired:
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
        },
    });
})(splash || (splash = {}));

var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var CourseMeta;
(function (CourseMeta) {
    function navBar() { return cfg.themeDefauleNavbar ? 'default' : 'inverse'; }
    CourseMeta.navBar = navBar;
    //export var navBar = 'default';
    //Dynamicke properties stranky, menene i pri vyhodnoceni cviceni
    CourseMeta.greenTitle = ko.observable(); //titulek buttonu
    CourseMeta.greenIcon = ko.observable(); //ikona buttonu
    CourseMeta.greenCss = ko.observable(); //barva buttonu
    CourseMeta.greenDisabled = ko.observable(); //vse hotovo => disabled
    CourseMeta.greenClick;
    CourseMeta.greenArrowDict;
    CourseMeta.foundGreenEx; //aktualni zelene cviceni
    function doGreenClick() { CourseMeta.lib.keepGreen = CourseMeta.greenCss() == 'success'; CourseMeta.greenClick(); return false; }
    CourseMeta.doGreenClick = doGreenClick; //pres klik na sipku se drzi zelena barva sipky
    function btnClick(url) {
        var nd = _.isEmpty(url) ? CourseMeta.actCourseRoot : (CourseMeta.actProduct.getNode(url));
        if (nd.isSkiped)
            return;
        Pager.navigateToHash(nd.href());
    }
    CourseMeta.btnClick = btnClick;
    function gotoData(url) {
        //skok na hash nebo sitemap url, kvuli breadcrumb v testMe result apod.
        Pager.navigateToHash(_.isEmpty(url) ? '' : (url.split('@').length > 1 ? url : CourseMeta.actProduct.getNode(url).href()));
        return false;
    }
    CourseMeta.gotoData = gotoData;
    var gui;
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
                node = CourseMeta.actCourseRoot;
            Pager.navigateToHash(node.href());
        }
        gui.gotoData = gotoData;
        function onReload() {
            Pager.reloadPage();
        }
        gui.onReload = onReload;
        gui.exerciseHtml;
        gui.exerciseCls;
        function init() { gui.exerciseHtml = $.noop; gui.exerciseCls = $.noop; }
        gui.init = init;
    })(gui = CourseMeta.gui || (CourseMeta.gui = {}));
    gui.init();
    //sluzby, ktere CourseMeta poskytuje persistent layer
    CourseMeta.persist = null; //persistNewEA.persistCourse;
    var MetaModel = (function (_super) {
        __extends(MetaModel, _super);
        function MetaModel() {
            _super.apply(this, arguments);
        }
        MetaModel.prototype.title = function () { return CourseMeta.actNode.title; };
        MetaModel.prototype.iconId = function () { return CourseMeta.actNode.iconId(); };
        MetaModel.prototype.breadcrumbs = function () {
            if (this.br)
                return this.br;
            var res = [];
            var self = CourseMeta.actNode;
            while (true) {
                res.push(self);
                if (self == CourseMeta.actCourseRoot || self == CourseMeta.actGrammar)
                    break;
                self = self.parent;
            }
            if (!CourseMeta.isType(CourseMeta.actNode, CourseMeta.runtimeType.grammar) && cfg.target == LMComLib.Targets.web)
                res.push({ title: schools.homeTitle(), iconId: function () { return 'home'; }, url: '' });
            if (res.length == 1)
                return this.br = [];
            res.reverse();
            return this.br = res;
        };
        MetaModel.prototype.hasBreadcrumb = function () { return CourseMeta.actNode != CourseMeta.actGrammar && this.breadcrumbs().length > 1; };
        MetaModel.prototype.normalDisplay = function () { return cfg.displayMode == schools.displayModes.normal; };
        MetaModel.prototype.previewExDisplay = function () { return cfg.displayMode == schools.displayModes.previewEx; };
        MetaModel.prototype.doUpdate = function (completed) {
            CourseMeta.lib.onChangeUrl(this.productUrl, this.persistence, this.url, function (ex) {
                return CourseMeta.lib.doRefresh(completed);
            });
        };
        return MetaModel;
    })(schools.Model);
    CourseMeta.MetaModel = MetaModel;
    var ModelPretest = (function (_super) {
        __extends(ModelPretest, _super);
        function ModelPretest(urlParts) {
            _super.call(this, schools.tCoursePretest, urlParts);
            this.bodyTmpl = "TCoursePretestBody";
        }
        ModelPretest.prototype.title = function () { return 'Pretest'; };
        ModelPretest.prototype.iconId = function () { return 'puzzle-piece'; };
        ModelPretest.prototype.doUpdate = function (completed) {
            //var u: schools.Url = <any>this.url;
            CourseMeta.lib.onChangeUrl(this.productUrl, this.persistence, this.url, function (ex) {
                return CourseMeta.lib.doRefresh(function () {
                    if (!CourseMeta.isType(CourseMeta.actNode, CourseMeta.runtimeType.taskPretest))
                        throw '!isType(actNode, runtimeType.taskPretest)';
                    var pretest = CourseMeta.actNode;
                    var init = pretest.initModel();
                    CourseMeta.lib.fillArrowInfo(init.info);
                    CourseMeta.lib.adjustEx(init.grEx, function () {
                        return CourseMeta.lib.displayEx(init.grEx, null, null);
                    });
                });
            });
        };
        return ModelPretest;
    })(MetaModel);
    CourseMeta.ModelPretest = ModelPretest;
    var Model = (function (_super) {
        __extends(Model, _super);
        function Model(urlParts) {
            _super.call(this, schools.tCourseMeta, urlParts);
            this.bodyTmpl = "TCourseMeta_Folder";
        }
        return Model;
    })(MetaModel);
    CourseMeta.Model = Model;
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
        Utils: Utils,
        cfg: cfg,
        SndLow: SndLow,
    });
    $(window).bind("resize", function () {
        $(".cbtn").each(function () {
            var btn = $(this);
            var url = btn.data("node-url");
            if (!url)
                return;
            var nd = (CourseMeta.actProduct.getNode(url));
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
    function saveAndReload() { CourseMeta.lib.saveProduct(function () { CourseMeta.actNode = null; Pager.reloadPage(CourseMeta.actExModel); }); }
    CourseMeta.saveAndReload = saveAndReload;
    //vypocet odvozenych udaju
    function refreshExerciseBar(dt) {
        CourseMeta.actExModel.tb.exercisePassive(CourseMeta.actEx.page.isPassivePage());
        if (dt.done) {
            CourseMeta.actExModel.tb.exerciseEvaluated(true);
            CourseMeta.actExModel.tb.score(CourseMeta.actEx.page.isPassivePage() ? null : Math.round(100 * dt.s / dt.ms).toString() + "%");
        }
        else
            CourseMeta.actExModel.tb.exerciseEvaluated(false);
    }
    CourseMeta.refreshExerciseBar = refreshExerciseBar;
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
    CourseMeta.greenArrowInfo = greenArrowInfo;
    //vsechny mozne alerty
    (function (alerts) {
        alerts[alerts["exTooManyErrors"] = 0] = "exTooManyErrors";
    })(CourseMeta.alerts || (CourseMeta.alerts = {}));
    var alerts = CourseMeta.alerts;
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
    })(CourseMeta.nodeAction || (CourseMeta.nodeAction = {}));
    var nodeAction = CourseMeta.nodeAction;
    function onNodeAction(url, type) {
        var nd = CourseMeta.actProduct.getNode(url);
        nd.onAction(type);
    }
    CourseMeta.onNodeAction = onNodeAction;
    //popis akce nad buttonem
    var NodeAction = (function () {
        function NodeAction(type, node) {
            this.type = type;
            this.node = node;
        }
        NodeAction.prototype.info = function () { return CourseMeta.allActions[this.type]; };
        NodeAction.createActions = function (node) {
            var actions = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                actions[_i - 1] = arguments[_i];
            }
            return _.map(_.filter(actions, function (a) { return a != nodeAction.no; }), function (act) { return new NodeAction(act, node); });
        };
        return NodeAction;
    })();
    CourseMeta.NodeAction = NodeAction;
    CourseMeta.allActions = {};
    CourseMeta.allActions[nodeAction.browse] = { icon: 'folder-open', title: function () { return CSLocalize('af026337fdf44d3287ade389c8d925f9', 'Browse'); } };
    CourseMeta.allActions[nodeAction.skip] = { icon: 'times-circle', title: function () { return CSLocalize('2c9b18c8e2a8449b891a3639691e1999', 'Skip'); } };
    CourseMeta.allActions[nodeAction.run] = { icon: 'play', title: function () { return CSLocalize('ba8042332a3c4520bc758e9bc851ae2b', 'Run'); } };
    CourseMeta.allActions[nodeAction.unskip] = { icon: 'plus-circle', title: function () { return CSLocalize('7f9d15221d9f471f934a944b1a949dca', 'Undo Skip'); } };
    CourseMeta.allActions[nodeAction.reset] = { icon: 'refresh', title: function () { return CSLocalize('27f1cba5240643fc9d0993cb6b5931b7', 'Reset'); } };
    CourseMeta.allActions[nodeAction.runTestAgain] = { icon: 'refresh', title: function () { return CSLocalize('9f77df2b307e48ad91291b0907fcbf4a', 'Run a new test'); } };
    CourseMeta.allActions[nodeAction.cancelTestSkip] = { icon: 'plus-circle', title: function () { return CSLocalize('f48f9615e3374fd2b6e1c377d1b8b0d3', 'Cancel and skip the test'); } };
    Pager.registerAppLocator(schools.appId, schools.tCourseMeta, function (urlParts, completed) { return completed(new Model(urlParts)); });
    Pager.registerAppLocator(schools.appId, schools.tCoursePretest, function (urlParts, completed) { return completed(new ModelPretest(urlParts)); });
})(CourseMeta || (CourseMeta = {}));

/// <reference path="../login/GenLogin.ts" />
var Admin;
(function (Admin) {
    (function (DictEntryCmdType) {
        DictEntryCmdType[DictEntryCmdType["loadDict"] = 0] = "loadDict";
        DictEntryCmdType[DictEntryCmdType["saveEntry"] = 1] = "saveEntry";
        DictEntryCmdType[DictEntryCmdType["statistics"] = 2] = "statistics";
    })(Admin.DictEntryCmdType || (Admin.DictEntryCmdType = {}));
    var DictEntryCmdType = Admin.DictEntryCmdType;
    (function (CmdXrefDataOpers) {
        CmdXrefDataOpers[CmdXrefDataOpers["nodeTypes"] = 0] = "nodeTypes";
        CmdXrefDataOpers[CmdXrefDataOpers["typeProps"] = 1] = "typeProps";
        CmdXrefDataOpers[CmdXrefDataOpers["typePropValues"] = 2] = "typePropValues";
        CmdXrefDataOpers[CmdXrefDataOpers["typeLinks"] = 3] = "typeLinks";
        CmdXrefDataOpers[CmdXrefDataOpers["typePropLinks"] = 4] = "typePropLinks";
        CmdXrefDataOpers[CmdXrefDataOpers["typePropValueLinks"] = 5] = "typePropValueLinks";
        CmdXrefDataOpers[CmdXrefDataOpers["nodeProps"] = 6] = "nodeProps";
        CmdXrefDataOpers[CmdXrefDataOpers["propValues"] = 7] = "propValues";
        CmdXrefDataOpers[CmdXrefDataOpers["propLinks"] = 8] = "propLinks";
        CmdXrefDataOpers[CmdXrefDataOpers["propValueLinks"] = 9] = "propValueLinks";
        CmdXrefDataOpers[CmdXrefDataOpers["refreshXref"] = 10] = "refreshXref";
        CmdXrefDataOpers[CmdXrefDataOpers["checkAll"] = 11] = "checkAll";
    })(Admin.CmdXrefDataOpers || (Admin.CmdXrefDataOpers = {}));
    var CmdXrefDataOpers = Admin.CmdXrefDataOpers;
    Admin.CmdAlocKeys_Type = 'Admin.CmdAlocKeys';
    function CmdAlocKeys_Create(LicenceId, Num) {
        return { LicenceId: LicenceId, Num: Num };
    }
    Admin.CmdAlocKeys_Create = CmdAlocKeys_Create;
    Admin.CmdGetProducts_Type = 'Admin.CmdGetProducts';
    function CmdGetProducts_Create(CompanyId, incUsedKeys) {
        return { CompanyId: CompanyId, incUsedKeys: incUsedKeys };
    }
    Admin.CmdGetProducts_Create = CmdGetProducts_Create;
    Admin.CmdGetDepartment_Type = 'Admin.CmdGetDepartment';
    function CmdGetDepartment_Create(CompanyId) {
        return { CompanyId: CompanyId };
    }
    Admin.CmdGetDepartment_Create = CmdGetDepartment_Create;
    Admin.CmdSetDepartment_Type = 'Admin.CmdSetDepartment';
    function CmdSetDepartment_Create(CompanyId, Departments, IntervalsConfig) {
        return { CompanyId: CompanyId, Departments: Departments, IntervalsConfig: IntervalsConfig };
    }
    Admin.CmdSetDepartment_Create = CmdSetDepartment_Create;
    Admin.CmdGetUsers_Type = 'Admin.CmdGetUsers';
    function CmdGetUsers_Create(IncUsers, IncComps, CompIds) {
        return { IncUsers: IncUsers, IncComps: IncComps, CompIds: CompIds };
    }
    Admin.CmdGetUsers_Create = CmdGetUsers_Create;
    Admin.CmdGetUsersResult_Type = 'Admin.CmdGetUsersResult';
    function CmdGetUsersResult_Create(Users, Comps, CompUsers) {
        return { Users: Users, Comps: Comps, CompUsers: CompUsers };
    }
    Admin.CmdGetUsersResult_Create = CmdGetUsersResult_Create;
    Admin.CmdSetProducts_Type = 'Admin.CmdSetProducts';
    function CmdSetProducts_Create(CompanyId, Products) {
        return { CompanyId: CompanyId, Products: Products };
    }
    Admin.CmdSetProducts_Create = CmdSetProducts_Create;
    Admin.CmdSetUsers_Type = 'Admin.CmdSetUsers';
    function CmdSetUsers_Create(Users, OldComps, Comps, CompUsers) {
        return { Users: Users, OldComps: OldComps, Comps: Comps, CompUsers: CompUsers };
    }
    Admin.CmdSetUsers_Create = CmdSetUsers_Create;
    Admin.CmdDsgnReadFile_Type = 'Admin.CmdDsgnReadFile';
    function CmdDsgnReadFile_Create(FileName) {
        return { FileName: FileName };
    }
    Admin.CmdDsgnReadFile_Create = CmdDsgnReadFile_Create;
    Admin.CmdDsgnReadFiles_Type = 'Admin.CmdDsgnReadFiles';
    function CmdDsgnReadFiles_Create(FileNames) {
        return { FileNames: FileNames };
    }
    Admin.CmdDsgnReadFiles_Create = CmdDsgnReadFiles_Create;
    Admin.CmdDsgnWriteDictWords_Type = 'Admin.CmdDsgnWriteDictWords';
    function CmdDsgnWriteDictWords_Create(FileName, Data) {
        return { FileName: FileName, Data: Data };
    }
    Admin.CmdDsgnWriteDictWords_Create = CmdDsgnWriteDictWords_Create;
    Admin.CmdGetPublProjects_Type = 'Admin.CmdGetPublProjects';
    function CmdGetPublProjects_Create(PublisherId) {
        return { PublisherId: PublisherId };
    }
    Admin.CmdGetPublProjects_Create = CmdGetPublProjects_Create;
    Admin.CmdCreatePublProject_Type = 'Admin.CmdCreatePublProject';
    function CmdCreatePublProject_Create(Line, PublisherId, ProjectId, User, Password, Title, TestItems) {
        return { Line: Line, PublisherId: PublisherId, ProjectId: ProjectId, User: User, Password: Password, Title: Title, TestItems: TestItems };
    }
    Admin.CmdCreatePublProject_Create = CmdCreatePublProject_Create;
    Admin.CmdPublChangePassword_Type = 'Admin.CmdPublChangePassword';
    function CmdPublChangePassword_Create(PublisherId, ProjectId, User, Title, Password) {
        return { PublisherId: PublisherId, ProjectId: ProjectId, User: User, Title: Title, Password: Password };
    }
    Admin.CmdPublChangePassword_Create = CmdPublChangePassword_Create;
    Admin.CmdPublBuild_Type = 'Admin.CmdPublBuild';
    function CmdPublBuild_Create(PublisherId, ProjectId) {
        return { PublisherId: PublisherId, ProjectId: ProjectId };
    }
    Admin.CmdPublBuild_Create = CmdPublBuild_Create;
    Admin.DictEntryCmd_Type = 'Admin.DictEntryCmd';
    function DictEntryCmd_Create(type, crsLang, natLang, entryId, soundMaster, html, okCrs, okCrsMaybe, todoCount, allCount) {
        return { type: type, crsLang: crsLang, natLang: natLang, entryId: entryId, soundMaster: soundMaster, html: html, okCrs: okCrs, okCrsMaybe: okCrsMaybe, todoCount: todoCount, allCount: allCount };
    }
    Admin.DictEntryCmd_Create = DictEntryCmd_Create;
    Admin.CmdXrefData_Type = 'Admin.CmdXrefData';
    function CmdXrefData_Create(oper, type, prop, value, nodeId, maxLinks, urlContext) {
        return { oper: oper, type: type, prop: prop, value: value, nodeId: nodeId, maxLinks: maxLinks, urlContext: urlContext };
    }
    Admin.CmdXrefData_Create = CmdXrefData_Create;
})(Admin || (Admin = {}));

/// <reference path="../JsLib/jsd/jquery.d.ts" />
/// <reference path="../JsLib/jsd/knockout.d.ts" />
/// <reference path="../JsLib/jsd/jsrender.d.ts" />
/// <reference path="../JsLib/jsd/underscore.d.ts" />
/// <reference path="../JsLib/js/ModelBase.ts" />
/// <reference path="../JsLib/js/GenLMComLib.ts" />
/// <reference path="../JsLib/ea/EAExtension.ts" />
/// <reference path="GenAdmin.ts" />
/// <reference path="../JsLib/js/Validate.ts" />
/// <reference path="../login/GenLogin.ts" />
/// <reference path="../login/Model.ts" />
/// <reference path="KeyGen.ts" />
/// <reference path="Products.ts" />
/// <reference path="CompAdmins.ts" />
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var schoolAdmin;
(function (schoolAdmin) {
    schoolAdmin.roleTranslation = [];
    schoolAdmin.roleTranslation[LMComLib.CompRole.Department] = function () { return CSLocalize('a815ebcae6bb419db07ce3c645be19fd', 'Departments'); };
    schoolAdmin.roleTranslation[LMComLib.CompRole.Keys] = function () { return CSLocalize('4b5fde74d58f4e018ddc17ea7355b5a5', 'Keys'); };
    schoolAdmin.roleTranslation[LMComLib.CompRole.Products] = function () { return CSLocalize('ec533f48bf76461c9c517852cb53f41a', 'Products'); };
    schoolAdmin.roleTranslation[LMComLib.CompRole.Results] = function () { return CSLocalize('be895a5caef442c189deb82bf0497e8f', 'Results'); };
    schoolAdmin.roleTranslation[LMComLib.CompRole.Publisher] = function () { return CSLocalize('5302653a14e441b994c1044ad2e10b1d', 'Publisher'); };
    schoolAdmin.roleTranslation[LMComLib.CompRole.HumanEvalManager] = function () { return CSLocalize('f97ac29fced34a8d81c3760b1e7a9a4f', 'Evaluation Manager'); };
    var TopBarModel = (function () {
        function TopBarModel(model) {
            this.model = model;
            this.logoBig = returnTrue;
            this.isTitle = returnFalse;
            this.logoSmall = returnFalse;
            this.greenArrow = returnFalse;
            this.hasSupl = returnFalse;
            this.backToCourse = returnFalse;
            this.needsLogin = returnFalse;
            this.phoneMore = returnFalse;
            this.logoutAndProfile = returnFalse;
        }
        return TopBarModel;
    })();
    schoolAdmin.TopBarModel = TopBarModel;
    function returnFalse() { return false; }
    schoolAdmin.returnFalse = returnFalse;
    function returnTrue() { return true; }
    schoolAdmin.returnTrue = returnTrue;
    function getHash(type, companyId) { return [schoolAdmin.appId, type, companyId.toString()].join('@'); }
    schoolAdmin.getHash = getHash;
    schoolAdmin.adminTypeName = "schoolAdminModel".toLowerCase(); //System administrator, dovoluje pridat dalsi system administrators a dalsi firmy
    schoolAdmin.keyGenTypeName = "schoolKeyGenModel".toLowerCase();
    schoolAdmin.productsTypeName = "schoolProductsModel".toLowerCase();
    schoolAdmin.humanEvalTypeName = "schoolHumanEvalModel".toLowerCase();
    schoolAdmin.humanEvalExTypeName = "schoolHumanEvalExModel".toLowerCase();
    schoolAdmin.humanEvalManagerLangsTypeName = "schoolHumanEvalManagerLangsModel".toLowerCase();
    schoolAdmin.humanEvalManagerTypeName = "schoolHumanEvalManagerModel".toLowerCase();
    schoolAdmin.humanEvalManagerExTypeName = "schoolHumanEvalManagerExModel".toLowerCase();
    schoolAdmin.humanEvalManagerEvsTypeName = "schoolHumanEvalManagerEvsModel".toLowerCase();
    schoolAdmin.humanEvalManagerTypeName = "schoolHumanEvalManagerModel".toLowerCase();
    schoolAdmin.compAdminsTypeName = "schoolCompAdminsModel".toLowerCase();
    schoolAdmin.editDepartmentTypeName = "schoolDepartmentModel".toLowerCase();
    schoolAdmin.schoolUserResultsTypeName = "schoolUserResultsModel".toLowerCase();
    var CompModel = (function (_super) {
        __extends(CompModel, _super);
        function CompModel(type, urlParts) {
            var _this = this;
            _super.call(this, schools.appId, type, urlParts);
            this.CompanyId = CourseMeta.actCompanyId = parseInt(urlParts[0]);
            this.tb = new TopBarModel(this);
            if (!LMStatus.getCookie())
                return;
            var c = _.find(Login.myData.Companies, function (c) { return c.Id == _this.CompanyId; });
            LMStatus.Cookie.Company = c ? { Courses: c.Courses, DepSelected: c.DepSelected, Id: c.Id, RoleEx: c.RoleEx, Title: c.Title } : null;
            LMStatus.setCookie(LMStatus.Cookie);
            //this.url = new CompIdUrl(type, CompanyId);
        }
        CompModel.prototype.title = function () {
            var _this = this;
            return _.find(Login.myData.Companies, function (comp) { return comp.Id == _this.CompanyId; }).Title;
        };
        return CompModel;
    })(Pager.Page);
    schoolAdmin.CompModel = CompModel;
    var AdminModel = (function (_super) {
        __extends(AdminModel, _super);
        function AdminModel() {
            var _this = this;
            _super.call(this, schoolAdmin.appId, schoolAdmin.adminTypeName, null);
            // COMP ADMIN
            this.comp_Admin = ko.observableArray(); //of CompanyAdmins
            var self = this;
            //this.url = new Url(adminTypeName);
            this.tb = new TopBarModel(this);
            // ROLE ADMIN
            this.admin_EMail = validate.create(validate.types.email, function (prop) {
                prop.required = true;
                prop.customValidation = function (email) { return _.any(_this.role_Admin, function (it) { return it.data.EMail == email; }) ? CSLocalize('bb4c401401ad413fbbf55c4906fb87ed', 'User with this email already added') : null; };
            });
            this.admin_add = function () {
                if (!validate.isPropsValid([_this.admin_EMail]))
                    return;
                var nu = new UserItem(_this, { EMail: _this.admin_EMail.get(), LMComId: 0, Deleted: false });
                _this.role_Admin.push(nu);
                _this.admin_EMail(null);
                _this.refreshRoleAdminHtml();
            };
            this.admin_del = function (act) {
                if (act.data.LMComId == 0) {
                    self.role_Admin = _.without(self.role_Admin, act);
                    _this.refreshRoleAdminHtml();
                }
                else
                    act.Deleted(!act.Deleted());
            };
            // ROLE COMPS
            this.comps_Name = validate.create(validate.types.minlength, function (prop) {
                prop.min = 3;
                prop.customValidation = function (name) { return _.any(_this.role_Comps, function (it) { return it.data.Title.toLowerCase() == name.toLowerCase(); }) ? CSLocalize('98b0616339a54314a3b865f7d76b99d8', 'Company with this title already added') : null; };
            });
            this.comps_EMail = validate.create(validate.types.email, function (prop) { prop.required = true; });
            this.company_add = function () {
                if (!validate.isPropsValid([_this.comps_EMail, _this.comps_Name]))
                    return;
                var nu = new CompanyItem({
                    EMail: _this.comps_EMail.get(), Title: _this.comps_Name.get(), UserId: 0, Id: 0, Deleted: false,
                }, _this);
                _this.role_Comps.push(nu);
                _this.comps_EMail(null);
                _this.comps_Name(null);
                _this.refreshCompHtml();
            };
            this.company_del = function (act) {
                if (act.data.Id == 0) {
                    self.role_Comps = _.without(self.role_Comps, act);
                    _this.refreshCompHtml();
                }
                else
                    act.Deleted(true);
            };
            this.company_undel = function (act) { act.edited(false); act.Deleted(false); };
            this.company_edit = function (act) { act.email(act.data.EMail); act.name(act.data.Title); /*act.publisherId(act.data.PublisherId);*/ act.edited(true); };
            this.company_editCancel = function (act) { act.edited(false); };
            this.company_editOk = function (act) { if (!validate.isPropsValid([act.email, act.name /*, act.publisherId*/]))
                return; act.data.EMail = act.email(); act.data.Title = act.name(); /*act.data.PublisherId = act.publisherId();*/ act.edited(false); };
        }
        AdminModel.prototype.title = function () { return CSLocalize('b2b7224389dd4118816f50890aececa4', 'Administrator Console'); };
        AdminModel.prototype.refreshRoleAdminHtml = function () {
            Pager.renderTemplateEx('schoolAdminRolePlace', 'schoolAdminRole', this);
        };
        AdminModel.prototype.refreshCompHtml = function () {
            Pager.renderTemplateEx('schoolAdminCompPlace', 'schoolAdminCompPlace', this);
        };
        // UPDATE
        AdminModel.prototype.update = function (completed) {
            var _this = this;
            Pager.ajaxPost(Pager.pathType.restServices, Admin.CmdGetUsers_Type, AdminDataCmd_from_MyData(Login.myData), function (res) {
                _this.role_Admin = _.map(res.Users, function (act) { return new UserItem(_this, act); });
                _this.oldComps = JSON.parse(JSON.stringify(res.Comps)); //kopie
                _this.role_Comps = _.map(res.Comps, function (act) { return new CompanyItem(act, _this); });
                _this.comp_Admin(_.map(_.pairs(_.groupBy(res.CompUsers, "CompanyId")), function (nv) { return new CompanyAdmins(nv[0], nv[1]); }));
                setTimeout(function () {
                    _this.refreshRoleAdminHtml();
                    _this.refreshCompHtml();
                }, 1);
                completed();
            });
        };
        // OK x CANCEL
        AdminModel.prototype.ok = function () {
            Pager.ajaxPost(Pager.pathType.restServices, Admin.CmdSetUsers_Type, Admin.CmdSetUsers_Create(_.map(this.role_Admin, function (it) { return it.data; }), this.oldComps, _.map(this.role_Comps, function (it) { return it.data; }), _.map(_.flatten(_.map(this.comp_Admin(), function (it) { return it.Items(); }), true), function (it) { return it.data; })), function () {
                Login.adjustMyData(true, function () { return LMStatus.gotoReturnUrl(); });
            });
        };
        AdminModel.prototype.cancel = function () { LMStatus.gotoReturnUrl(); };
        return AdminModel;
    })(Pager.Page);
    schoolAdmin.AdminModel = AdminModel;
    // ROLE ADMIN
    var UserItem = (function () {
        function UserItem(owner, data) {
            this.owner = owner;
            this.data = data;
            this.Deleted = ko.observable(false);
            this.Deleted.subscribe(function (val) { return data.Deleted = val; });
        }
        return UserItem;
    })();
    // ROLE COMPS
    var CompanyItem = (function () {
        function CompanyItem(data, owner) {
            this.data = data;
            this.owner = owner;
            this.Deleted = ko.observable(false);
            this.edited = ko.observable(false);
            this.Deleted.subscribe(function (val) { return data.Deleted = val; });
            this.email = validate.create(validate.types.email, function (prop) { prop.required = true; prop(data.EMail); });
            this.name = validate.create(validate.types.minlength, function (prop) { prop.min = 3; prop(data.Title); });
        }
        return CompanyItem;
    })();
    // COMP ADMIN
    var CompanyAdmins = (function () {
        function CompanyAdmins(Id, items) {
            var _this = this;
            this.Id = Id;
            this.Items = ko.observableArray(); //of CompanyAdminItem
            var self = this;
            this.Title = _.find(Login.myData.Companies, function (comp) { return comp.Id == Id; }).Title;
            this.Items(_.map(items, function (it) { return new CompanyAdminItem(it); }));
            this.compAdmin_del = function (act) { if (act.data.UserId == 0)
                self.Items.remove(act);
            else
                act.Deleted(!act.Deleted()); };
            this.newEMail = validate.create(validate.types.email, function (prop) {
                prop.required = true;
                prop.customValidation = function (email) { return _.any(_this.Items(), function (it) { return it.data.EMail == email; }) ? CSLocalize('af6fb39c97c042fb8d06e0ca1645846d', 'User with this email already added') : null; };
            });
            this.newEMail_Add = function () {
                if (!validate.isPropsValid([_this.newEMail]))
                    return;
                var nu = new CompanyAdminItem({
                    UserId: 0,
                    Deleted: false,
                    EMail: self.newEMail(),
                    CompanyId: Id,
                    Role: { Role: 0, HumanEvalatorInfos: null }
                });
                _this.Items.push(nu);
                _this.newEMail(null);
            };
        }
        return CompanyAdmins;
    })();
    var CompanyAdminItem = (function () {
        function CompanyAdminItem(data) {
            this.data = data;
            this.Deleted = ko.observable(false);
            this.Deleted.subscribe(function (val) { return data.Deleted = val; });
            this.options = [new CompanyAdminOption(this.data, LMComLib.CompRole.Keys), new CompanyAdminOption(this.data, LMComLib.CompRole.Products)];
        }
        return CompanyAdminItem;
    })();
    var CompanyAdminOption = (function () {
        function CompanyAdminOption(data, role) {
            this.data = data;
            this.checked = ko.observable(false);
            this.checked((data.Role.Role & role) != 0);
            this.checked.subscribe(function (r) { return data.Role.Role = r ? data.Role.Role | role : data.Role.Role & ~role; });
            this.title = LowUtils.EnumToString(LMComLib.CompRole, role);
        }
        return CompanyAdminOption;
    })();
    //export class Url extends Pager.Url {
    //  constructor(type: string) { super(appId, type); }
    //  finish() { }
    //  static fromString(hash: string): Pager.Url {
    //    var parts = hash.split("@");
    //    return parts.length == 1 ? new Url(hash) : new CompIdUrl(parts[0], parseInt(parts[1]));
    //  }
    //  //toString(): string { return super.toString(appId, [this.locator == adminTypeName ? "" : this.locator]); }
    //}
    //export class CompIdUrl extends Pager.Url {
    //  constructor(type: string, public CompanyId: number) { super(appId, type, CompanyId.toString()); }
    //  finish() { this.CompanyId = parseInt(this.url); }
    //}
    //Login.MyData jsou dalsi data o uzivateli mimo Cookie. Nacitaji se v LMStatus.adjustCookie => Login.Model. Obsahuji globalni a firemni Role uzivatele. 
    function AdminDataCmd_from_MyData(myData) {
        return Admin.CmdGetUsers_Create((myData.Roles & Login.Role.Admin) != 0, (myData.Roles & Login.Role.Comps) != 0, _.map(_.filter(myData.Companies, function (c) { return (c.RoleEx.Role & LMComLib.CompRole.Admin) != 0; }), function (c) { return c.Id; }));
    }
    schoolAdmin.AdminDataCmd_from_MyData = AdminDataCmd_from_MyData;
    //Pager.registerAppLocator(adminTypeName, (url: Url, completed: (pg: Pager.Page) => void) => completed(new AdminModel()));
    Pager.registerAppLocator(schoolAdmin.appId, schoolAdmin.adminTypeName, function (urlParts, completed) { return completed(new AdminModel()); });
})(schoolAdmin || (schoolAdmin = {}));

/// <reference path="../JsLib/jsd/jquery.d.ts" />
/// <reference path="../JsLib/jsd/knockout.d.ts" />
/// <reference path="../JsLib/jsd/jsrender.d.ts" />
/// <reference path="../JsLib/jsd/underscore.d.ts" />
/// <reference path="../JsLib/js/ModelBase.ts" />
/// <reference path="../JsLib/js/GenLMComLib.ts" />
/// <reference path="../JsLib/ea/EAExtension.ts" />
/// <reference path="GenAdmin.ts" />
/// <reference path="../JsLib/js/Validate.ts" />
/// <reference path="../JsLib/js/Keys.ts" />
/// <reference path="../login/GenLogin.ts" />
/// <reference path="../login/Model.ts" />
/// <reference path="../schools/products.ts" /> 
/// <reference path="admin.ts" />
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var schoolAdmin;
(function (schoolAdmin) {
    var KeyGenModel = (function (_super) {
        __extends(KeyGenModel, _super);
        function KeyGenModel(urlParts) {
            var _this = this;
            _super.call(this, schoolAdmin.keyGenTypeName, urlParts);
            this.products = [];
            this.selProd = ko.observable();
            this.button = Pager.ButtonType.cancel;
            this.genOK = ko.observable(false);
            this.num = validate.create(validate.types.rangeMin, function (prop) { prop.min = 1; });
            this.selProd.subscribe(function () { _this.num(""); _this.genOK(false); });
            this.num.subscribe(function () { _this.genOK(false); });
        }
        // UPDATE
        KeyGenModel.prototype.update = function (completed) {
            var _this = this;
            Pager.ajaxGet(Pager.pathType.restServices, Admin.CmdGetProducts_Type, Admin.CmdGetProducts_Create(this.CompanyId, true), function (allRes) {
                var res = [];
                _.each(allRes, function (pr) {
                    var prod = CourseMeta.lib.findProduct(pr.ProductId);
                    if (!prod)
                        return;
                    res.push(pr);
                    pr['title'] = CourseMeta.lib.keyTitle(prod, pr.Days);
                });
                for (var i = 0; i < res.length; i += 2) {
                    var l = res[i], r = res[i + 1];
                    _this.products.push([
                        Utils.createLayoutCell(6, "TProdCard", l),
                        Utils.createLayoutCell(6, "TProdCard", r ? r : null)
                    ]);
                }
                completed();
            });
        };
        KeyGenModel.prototype.generate = function () {
            var _this = this;
            if (!validate.isPropsValid([this.num]))
                return;
            var num = this.num.get();
            var licId = parseInt(this.selProd()); //Admin.Product.Id
            //zjisti product title
            var prod = null;
            _.find(this.products, function (row) { return _.find(row, function (cell) {
                prod = (cell.data);
                if (prod.Id == licId)
                    return true;
            }) != null; });
            var title = prod['title']; //(<any>prod).my.title + " / days: " + prod.Days.toString();
            Pager.ajaxGet(Pager.pathType.restServices, Admin.CmdAlocKeys_Type, Admin.CmdAlocKeys_Create(licId, num), function (first) {
                var keyList = [];
                for (var i = 0; i < num; i++) {
                    var k = { licId: licId, counter: first + i };
                    keyList.push(keys.toString(k));
                }
                var email = {
                    To: LMStatus.Cookie.EMail,
                    Cc: null,
                    Subject: CSLocalize('c270a7643d5b4fba8569342961ee108c', 'License keys'),
                    emailId: "TAdminEmailKeys",
                    productName: title,
                    isForgotPassword: false,
                    From: null,
                    Html: null,
                    isAtt: true,
                    attFile: "keys.txt",
                    attContent: keyList.join("\r\n"),
                    attContentType: "text/plain",
                };
                EMailer.sendEMail(email, function () { return _this.genOK(true); }, function (errId, errMsg) { return alert(errMsg); });
            });
        };
        KeyGenModel.prototype.cancel = function () { LMStatus.gotoReturnUrl(); };
        KeyGenModel.prototype.ok = function () { LMStatus.gotoReturnUrl(); };
        KeyGenModel.prototype.lineTxt = function (prod) {
            return CourseMeta.lib.productLineTxt(prod.ProductId).toLowerCase(); //??? bylo prod.Id ???
        };
        return KeyGenModel;
    })(schoolAdmin.CompModel);
    schoolAdmin.KeyGenModel = KeyGenModel;
    Pager.registerAppLocator(schoolAdmin.appId, schoolAdmin.keyGenTypeName, function (urlParts, completed) { return completed(new KeyGenModel(urlParts)); });
})(schoolAdmin || (schoolAdmin = {}));

var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var schoolAdmin;
(function (schoolAdmin) {
    var Products = (function (_super) {
        __extends(Products, _super);
        function Products(urlParts) {
            var _this = this;
            _super.call(this, schoolAdmin.productsTypeName, urlParts);
            this.selectMode = ko.observable(0); //0..unknown, 1..test, 2..kurz
            var self = this;
            this.product = validate.create(validate.types.required);
            this.product.subscribe(function (pr) {
                if (!pr) {
                    self.selectMode(0);
                    return;
                }
                self.selectMode(CourseMeta.lib.isTest(CourseMeta.lib.findProduct(pr)) ? 1 : 2);
            });
            this.days = daysProp(this.product, this);
            this.days(0);
            this.add = function () {
                if (!validate.isPropsValid([_this.product, _this.days]))
                    return;
                var prodId = _this.product.get();
                var days = CourseMeta.lib.isTest(CourseMeta.lib.findProduct(prodId)) ? 0 : _this.days();
                var nu = new Product({ Id: 0, LastCounter: 0, Days: days, ProductId: prodId, Deleted: false, UsedKeys: 0 }, _this);
                _this.products.push(nu);
                _this.product(undefined);
                _this.days(0);
                _this.refreshHtml();
            };
            this.del = function (act) { if (act.data.Id == 0) {
                self.products = _.without(self.products, act);
                _this.refreshHtml();
            }
            else
                act.Deleted(true); };
            this.undel = function (act) { act.Deleted(false); };
        }
        Products.prototype.refreshHtml = function () {
            Pager.renderTemplateEx('schoolProductsProductPlace', 'schoolProductsProduct', this);
        };
        // UPDATE
        Products.prototype.update = function (completed) {
            var _this = this;
            Pager.ajaxPost(Pager.pathType.restServices, Admin.CmdGetProducts_Type, Admin.CmdGetProducts_Create(this.CompanyId, false), function (res) {
                var admProds = [];
                _.each(res, function (pr) {
                    if (CourseMeta.lib.findProduct(pr.ProductId) != null)
                        admProds.push(new Product(pr, _this));
                });
                _this.products = admProds;
                setTimeout(function () { return _this.refreshHtml(); }, 1);
                //this.products(_.map(res, (act: Admin.Product) => new Product(act, this)));
                completed();
            });
        };
        Products.prototype.ok = function () {
            var prods = _.map(this.products, function (p) { return p.data; });
            Pager.ajaxPost(Pager.pathType.restServices, Admin.CmdSetProducts_Type, Admin.CmdSetProducts_Create(this.CompanyId, prods), function () { return LMStatus.gotoReturnUrl(); });
        };
        Products.prototype.cancel = function () { LMStatus.gotoReturnUrl(); };
        //allProducts() { return prods.Items; }
        Products.prototype.allProducts = function () {
            var _this = this;
            var comp = _.find(Login.myData.Companies, function (c) { return c.Id == _this.CompanyId; });
            var res = comp.companyProducts && comp.companyProducts.length > 0 ? comp.companyProducts.slice() : [];
            if (comp.PublisherOwnerUserId == 0)
                res.pushArray(CourseMeta.allProductList);
            return res;
        };
        return Products;
    })(schoolAdmin.CompModel);
    schoolAdmin.Products = Products;
    var Product = (function () {
        function Product(data, owner) {
            this.data = data;
            this.owner = owner;
            this.Deleted = ko.observable(false);
            this.Deleted.subscribe(function (val) { return data.Deleted = val; });
            var prod = CourseMeta.lib.findProduct(data.ProductId);
            //this.product = validate.create(validate.types.required); this.product(data.ProductId);
            this.days = CourseMeta.lib.keyTitle(prod, data.Days);
            this.title = prod.title;
            this.lineTxt = CourseMeta.lib.productLineTxt(data.ProductId).toLowerCase();
            //this.EditVisible(!CourseMeta.isType(CourseMeta.lib.findProduct(data.ProductId), CourseMeta.runtimeType.test));
        }
        return Product;
    })();
    schoolAdmin.Product = Product;
    function daysProp(product, owner) {
        return validate.create(validate.types.rangeMin, function (prop) {
            prop.min = 0;
            prop.customValidation = function (days) { return validateProduct(product, days, owner.products); };
        });
    }
    function validateProduct(product, days, allProds) {
        var prod = CourseMeta.lib.findProduct(product());
        var d = parseInt(days);
        var isTest = CourseMeta.lib.isTest(prod);
        if (!isTest && d < 1)
            return validate.messages.required();
        var error = _.any(allProds, function (p) { return p.data.ProductId == prod.url && (isTest || p.data.Days == d); }) ? CSLocalize('8139bf0c5fed4b92ba7ce97a50034aa6', 'The same product with the same license validity already exists!') : null;
        product.message(error ? error : '');
        return error ? ' ' : null;
    }
    Pager.registerAppLocator(schoolAdmin.appId, schoolAdmin.productsTypeName, function (urlParts, completed) { return completed(new Products(urlParts)); });
})(schoolAdmin || (schoolAdmin = {}));

var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var schoolAdmin;
(function (schoolAdmin) {
    //*************************************************************
    //  home stranka hodnotitele - vyber testu k evaluaci
    //*************************************************************
    var HumanEval = (function (_super) {
        __extends(HumanEval, _super);
        function HumanEval(urlParts) {
            _super.call(this, schoolAdmin.humanEvalTypeName, urlParts);
        }
        // UPDATE
        HumanEval.prototype.update = function (completed) {
            var _this = this;
            Pager.ajaxGet(Pager.pathType.restServices, Login.CmdHumanEvalGet_Type, Login.CmdHumanEvalGet_Create(LMStatus.Cookie.id, this.CompanyId), function (res) {
                _this.data = res;
                _this.items = _.sortBy(_.map(res.todo, function (td) { return new HumanEvalCrs(td, _this); }), function (it) { return it.assigned; });
                completed();
            });
        };
        HumanEval.prototype.close = function () {
            location.hash = schools.createHomeUrlStd();
        };
        return HumanEval;
    })(schoolAdmin.CompModel);
    schoolAdmin.HumanEval = HumanEval;
    var HumanEvalCrs = (function () {
        function HumanEvalCrs(data, owner) {
            this.data = data;
            this.owner = owner;
            this.title = CourseMeta.lib.findProduct(data.productId.split('|')[0]).title;
            this.assigned = Globalize.format(Utils.numToDate(data.assigned), 'd');
        }
        HumanEvalCrs.prototype.click = function () {
            location.hash = schoolAdmin.getHash(schoolAdmin.humanEvalExTypeName, this.owner.CompanyId) + '@' + this.owner.data.companyUserId.toString() + '@' + this.data.courseUserId.toString() + '@' + this.data.productId;
        };
        return HumanEvalCrs;
    })();
    schoolAdmin.HumanEvalCrs = HumanEvalCrs;
    //*************************************************************
    //  cviceni jednoho testu k evaluaci
    //*************************************************************
    var HumanEvalEx = (function (_super) {
        __extends(HumanEvalEx, _super);
        function HumanEvalEx(urlParts) {
            _super.call(this, schoolAdmin.humanEvalExTypeName, urlParts);
            this.greenTitle = ko.observable(CSLocalize('be62382f71e84e96a1837a8a5c565f66', 'Next'));
            this.companyUserId = parseInt(urlParts[1]);
            this.courseUserId = parseInt(urlParts[2]);
            this.productId = urlParts[3];
            this.productTitle = CourseMeta.lib.findProduct(this.productId.split('|')[0]).title;
        }
        HumanEvalEx.prototype.update = function (completed) {
            var _this = this;
            if (this.items)
                this.initEx(completed);
            else
                this.init(function () { return _this.initEx(completed); });
        };
        // UPDATE
        HumanEvalEx.prototype.init = function (completed) {
            var _this = this;
            Pager.ajaxGet(Pager.pathType.restServices, Login.CmdHumanEvalTest_Type, Login.CmdHumanEvalTest_Create(this.companyUserId, this.courseUserId), function (res) {
                _this.testUser_lmcomId = res.testUser_lmcomId;
                CourseMeta.lib.adjustProduct(_this.productId, null, function (justLoaded) {
                    _this.items = [];
                    _.each(res.urls, function (r) {
                        var ex = (CourseMeta.actProduct.getNode(r)); //if (ex.s == 0 || (ex.flag & CourseModel.CourseDataFlag.needsEval) == 0) return;
                        _this.items.push(new humanEx(ex));
                    });
                    _this.actIdx = 0;
                    completed();
                }, _this.testUser_lmcomId);
            });
        };
        HumanEvalEx.prototype.initEx = function (completed) {
            if (this.items.length == 0) {
                this.greenTitle(CSLocalize('8817520256884045b0e94bcb005f02d0', 'Finish'));
                completed();
                return;
            }
            this.greenTitle(this.isFinished() ? CSLocalize('9c834aec8bd94de284855521356f2fbd', 'Finish') : CSLocalize('232eaf4801724f4e9dc69ce12091c26d', 'Next'));
            var actEx = this.items[this.actIdx].ex;
            CourseMeta.lib.adjustEx(actEx, function () {
                actEx.page.humanEvalMode = true;
                CourseMeta.lib.displayEx(actEx, null, null);
            }, this.testUser_lmcomId);
        };
        HumanEvalEx.prototype.finishEx = function (completed) {
            var _this = this;
            if (this.items.length == 0) {
                completed(false);
                return;
            }
            var actEx = this.items[this.actIdx];
            if (Course.humanEvalControlImpl.useEvalForms(actEx.ex) != true) {
                completed(false);
                return;
            } //validator error => exit
            Pager.blockGui(true);
            actEx.done(true);
            //donut save Skills, Testu a Test.result
            var skill = actEx.ex.parent;
            skill.userPending = true;
            var test = skill.parent;
            test.userPending = true;
            //procedura pro modifikaci test.result (zmeni flag a skore jak skills tak testu)
            var processTestResult = function () {
                test.adjustResult();
                CourseMeta.lib.saveProduct(function () { completed(true); Pager.blockGui(false); }, _this.testUser_lmcomId);
            };
            //volej processTestResult (ev. nejdrive nacti test.result z DB)
            if (!test.result)
                CourseMeta.lib.actPersistence().loadUserData(this.testUser_lmcomId, CourseMeta.actCompanyId, CourseMeta.actProduct.url, testMe.testImpl.resultKey, function (data) { test.result = data; processTestResult(); });
            else
                processTestResult();
        };
        HumanEvalEx.prototype.doExClick = function (idx) {
            var _this = this;
            if (this.items.length == 0)
                return;
            this.finishEx(function (ok) { if (!ok)
                return; _this.actIdx = idx; Pager.reloadPage(); });
        };
        HumanEvalEx.prototype.nextClick = function () {
            var _this = this;
            if (this.isFinished()) {
                location.hash = schoolAdmin.getHash(schoolAdmin.humanEvalTypeName, this.CompanyId);
                return;
            }
            this.finishEx(function (ok) { if (!ok)
                return; _this.actIdx++; if (_this.actIdx >= _this.items.length)
                _this.actIdx = 0; Pager.reloadPage(); });
        };
        //close() {
        //  this.finishEx(() => location.hash = schoolAdmin.getHash(schoolAdmin.humanEvalTypeName, this.CompanyId));
        //}
        HumanEvalEx.prototype.isFinished = function () {
            return this.items.length == 0 || _.all(this.items, function (it) { return !Course.needsHumanEval(it.ex.flag); });
        };
        return HumanEvalEx;
    })(schoolAdmin.CompModel);
    schoolAdmin.HumanEvalEx = HumanEvalEx;
    var humanEx = (function () {
        function humanEx(ex) {
            this.ex = ex;
            this.done = ko.observable(false);
        } //this.needsEval((ex.flag & CourseModel.CourseDataFlag.needsEval) != 0); }
        return humanEx;
    })();
    schoolAdmin.humanEx = humanEx;
    Pager.registerAppLocator(schoolAdmin.appId, schoolAdmin.humanEvalTypeName, function (urlParts, completed) { return completed(new HumanEval(urlParts)); });
    Pager.registerAppLocator(schoolAdmin.appId, schoolAdmin.humanEvalExTypeName, function (urlParts, completed) { return completed(new HumanEvalEx(urlParts)); });
})(schoolAdmin || (schoolAdmin = {}));

var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var schoolAdmin;
(function (schoolAdmin) {
    //prechudce seznamu s Line
    var evaluatorLangLow = (function () {
        function evaluatorLangLow(lang) {
            this.lang = lang;
            this.title = locLangs[lang]();
            this.langTitle = LMComLib.LineIds[lang].toLowerCase();
        }
        return evaluatorLangLow;
    })();
    schoolAdmin.evaluatorLangLow = evaluatorLangLow;
    //*************************************************************
    //  home stranka Assign testu hodnotitelum
    //  obsahuje zeznam jazyku testu
    //*************************************************************
    var HumanEvalManagerLangs = (function (_super) {
        __extends(HumanEvalManagerLangs, _super);
        function HumanEvalManagerLangs(urlParts) {
            _super.call(this, schoolAdmin.humanEvalManagerLangsTypeName, urlParts);
        }
        // UPDATE
        HumanEvalManagerLangs.prototype.update = function (completed) {
            var _this = this;
            Pager.ajaxGet(Pager.pathType.restServices, Login.CmdHumanEvalManagerLangs_Type, Login.CmdHumanEvalManagerLangs_Create(LMStatus.Cookie.id, this.CompanyId), function (res) {
                _this.langs = _.map(res.lines, function (l) { return new evaluatorLangCount(l.line, l.count); });
                completed();
            });
        };
        HumanEvalManagerLangs.prototype.click = function (idx) {
            location.hash = schoolAdmin.getHash(schoolAdmin.humanEvalManagerTypeName, this.CompanyId) + '@' + this.langs[idx].lang.toString();
        };
        HumanEvalManagerLangs.prototype.close = function () {
            location.hash = schools.createHomeUrlStd();
        };
        return HumanEvalManagerLangs;
    })(schoolAdmin.CompModel);
    schoolAdmin.HumanEvalManagerLangs = HumanEvalManagerLangs;
    var evaluatorLangCount = (function (_super) {
        __extends(evaluatorLangCount, _super);
        function evaluatorLangCount(lang, count) {
            _super.call(this, lang);
            this.lang = lang;
            this.count = count;
        }
        return evaluatorLangCount;
    })(evaluatorLangLow);
    schoolAdmin.evaluatorLangCount = evaluatorLangCount;
    //*************************************************************
    //  Assign testu (vybraneho jazyka) hodnotitelum
    //*************************************************************
    var HumanEvalManager = (function (_super) {
        __extends(HumanEvalManager, _super);
        function HumanEvalManager(urlParts) {
            _super.call(this, schoolAdmin.humanEvalManagerTypeName, urlParts);
            this.oldRemoved = ko.observable(0);
            this.news = ko.observable(0);
            this.actLine = parseInt(urlParts[1]);
        }
        // UPDATE
        HumanEvalManager.prototype.update = function (completed) {
            var _this = this;
            Pager.ajaxGet(Pager.pathType.restServices, Login.CmdHumanEvalManagerGet_Type, Login.CmdHumanEvalManagerGet_Create(LMStatus.Cookie.id, this.actLine, this.CompanyId), function (allRes) {
                _this.data = allRes;
                //DEBUG
                //allRes.evaluators[0].toDo.pushArray([{ assigned: 1, courseUserId: 31, productId: '' }, { assigned: 1, courseUserId: 32, productId: '' }]);
                //allRes.evaluators.push({ email: 'xxx', name: '', companyUserId: 0, toDo: [] });
                //allRes.toEvaluate.pushArray([{ assigned: 1, courseUserId: 33, productId: '' }, { assigned: 1, courseUserId: 34, productId: '' }]);
                var idx = 0;
                _this.olds = 0;
                _this.all = 0;
                _this.evaluators = _.map(allRes.evaluators, function (ev) { _this.olds += ev.toDo.length; return new evaluatorImpl(_this, idx++, ev); });
                _this.all = _this.olds + allRes.toEvaluate.length;
                completed();
            });
        };
        HumanEvalManager.prototype.loaded = function () {
            this.form = $('#human-form');
            this.form.validate();
            _.each(this.evaluators, function (e) { return e.loaded(); });
            this.refreshNumbers();
        };
        HumanEvalManager.prototype.validate = function (act, val) {
            if (val.trim() == '')
                return null;
            var numVal = parseInt(val);
            //vsechny allForce (mimo act) jsou neprazdne => min = max = all
            if (_.all(this.evaluators, function (e) { return e == act || !_.isEmpty(e.allForce()); })) {
                return numVal == act.all() ? null : { min: act.all(), max: act.all() };
            }
            //spocti max. povolenou hodnotu
            var usedNews = 0; //pouzite not assigned (news)
            _.each(this.evaluators, function (e) {
                if (e == act || _.isEmpty(e.allForce()))
                    return;
                usedNews += parseInt(e.allForce()) - e.olds;
            });
            var res = { min: 0, max: this.data.toEvaluate.length - usedNews + act.toDo.length };
            return numVal >= res.min && numVal <= res.max ? null : res;
        };
        HumanEvalManager.prototype.refreshNumbers = function () {
            //allChange: hodnota news (kladny) nebo oldRemoved (zaporny)
            var allChange = 0;
            var autoAssign = [];
            _.each(this.evaluators, function (e) {
                if (_.isEmpty(e.allForce())) {
                    autoAssign.push(e);
                    return;
                }
                var allForce = parseInt(e.allForce());
                e.all(allForce);
                var change = allForce - e.olds;
                allChange += change;
                if (change > 0) {
                    e.news(change);
                    e.oldRemoved(0);
                }
                else {
                    e.news(0);
                    e.oldRemoved(-change);
                }
            });
            var toDo = this.all - this.olds - allChange;
            if (autoAssign.length != 0) {
                //rozdel zbyle studenty
                var delta = Math.round(toDo / autoAssign.length);
                _.each(autoAssign, function (e) {
                    var act = delta < toDo ? delta : toDo;
                    e.news(act);
                    e.oldRemoved(0);
                    toDo -= act;
                    e.all(act + e.olds);
                });
                if (toDo > 0) {
                    var rest = autoAssign[autoAssign.length - 1];
                    rest.news(rest.news() + toDo);
                }
            }
            //soucty
            var oldRemovedSum = 0, newsSum = 0;
            _.each(this.evaluators, function (e) { oldRemovedSum += e.oldRemoved(); newsSum += e.news(); });
            this.oldRemoved(oldRemovedSum);
            this.news(newsSum);
        };
        HumanEvalManager.prototype.ok = function () {
            var _this = this;
            //priprav si vysledek
            var res = _.map(this.evaluators, function (e) { var r = { companyUserId: e.data.companyUserId, courseUserIds: [], dsgn_impl: e, dsgn_done: false }; return r; });
            var toAsign = _.map(this.data.toEvaluate, function (e) { return e.courseUserId; });
            //1. pruchod: obohat toAsign o odstranene studenty (oldRemoved>0)
            _.each(res, function (r) {
                var remNum = r.dsgn_impl.oldRemoved();
                if (remNum <= 0)
                    return;
                var data = r.dsgn_impl.data; //old asigned
                toAsign.pushArray(_.map(data.toDo.slice(data.toDo.length - remNum), function (v) { return v.courseUserId; })); //remove end of old asigned
                r.courseUserIds = _.map(data.toDo.slice(0, data.toDo.length - remNum), function (v) { return v.courseUserId; }); //use start of old asigned
                if (r.dsgn_impl.news() > 0) {
                    debugger;
                    throw 'r.dsgn_impl.news() > 0';
                }
                r.dsgn_done = true;
            });
            //2. pruchod: rozdel nove a odstranene studenty, odstran dsgn props
            var firstIdx = 0;
            _.each(res, function (r) {
                var toAdd = r.dsgn_impl.news();
                if (!r.dsgn_done) {
                    r.courseUserIds.pushArray(_.map(r.dsgn_impl.data.toDo, function (a) { return a.courseUserId; })); //old
                    r.courseUserIds.pushArray(toAsign.slice(firstIdx, firstIdx + toAdd)); //new
                    firstIdx += toAdd;
                }
                delete r.dsgn_done;
                delete r.dsgn_impl;
            });
            Pager.ajaxGet(Pager.pathType.restServices, Login.CmdHumanEvalManagerSet_Type, Login.CmdHumanEvalManagerSet_Create(res), function () { return _this.cancel(); });
        };
        HumanEvalManager.prototype.cancel = function () { location.hash = schoolAdmin.getHash(schoolAdmin.humanEvalManagerLangsTypeName, this.CompanyId); };
        return HumanEvalManager;
    })(schoolAdmin.CompModel);
    schoolAdmin.HumanEvalManager = HumanEvalManager;
    //model pro jednoho evaluatora
    var evaluatorImpl = (function () {
        function evaluatorImpl(owner, index, data) {
            var _this = this;
            this.owner = owner;
            this.index = index;
            this.data = data;
            this.valid = true;
            this.oldRemoved = ko.observable(0); //removed stare (...removed)
            this.news = ko.observable(0); //nove (...new assigned)
            //INPUT v ...all
            this.allForce = ko.observable(null); //validovana hodnota, nastavena managerem
            this.all = ko.observable(0); //label v ...all. Pro neprazdny allForce se rovna allForce
            jQuery.extend(this, data);
            this.olds = data.toDo.length;
            this.allForce.subscribe(function (val) { return _this.owner.refreshNumbers(); });
            this.attemptAllForce = ko.computed({
                read: this.allForce,
                write: function (val) {
                    var validRes = _this.owner.validate(_this, val);
                    var vtor = _this.owner.form.validate();
                    _this.valid = validRes == null;
                    if (_this.valid) {
                        _this.allForce(val);
                        vtor.removeError(_this.input[0]);
                    }
                    else
                        vtor.addError({ element: _this.input[0], message: $.validator.messages.range(validRes.min.toString(), validRes.max.toString()) + ' ' + CSLocalize('495ccadce4d34bdc920bd1898aa0fed7', 'or let the field empty.') });
                },
                owner: this
            });
        }
        evaluatorImpl.prototype.loaded = function () {
            var _this = this;
            this.input = $('#new-input-' + this.index.toString());
            this.input.blur(function (ev) { if (!_this.valid)
                _this.input.focus(); });
        };
        return evaluatorImpl;
    })();
    schoolAdmin.evaluatorImpl = evaluatorImpl;
    //*************************************************************
    //  sprava evaluatoru - pridani, nastaveni lines, mazani
    //*************************************************************
    var HumanEvalManagerEvs = (function (_super) {
        __extends(HumanEvalManagerEvs, _super);
        function HumanEvalManagerEvs(urlParts) {
            _super.call(this, schoolAdmin.humanEvalManagerEvsTypeName, urlParts);
        }
        // UPDATE
        HumanEvalManagerEvs.prototype.update = function (completed) {
            var _this = this;
            Pager.ajaxGet(Pager.pathType.restServices, Login.CmdHumanEvalManagerEvsGet_Type, Login.CmdHumanEvalManagerEvsGet_Create(LMStatus.Cookie.id, this.CompanyId), function (res) {
                _this.evaluators = _.sortBy(_.map(res, function (it) { return new evaluator(it); }), function (e) { return e.data.email; });
                _this.modalDlg = new evaluatorModalDlg(_this);
                completed();
            });
        };
        HumanEvalManagerEvs.prototype.loaded = function () {
            this.modalDlg.loaded();
        };
        HumanEvalManagerEvs.prototype.edit = function (id) {
            this.modalDlg.show(id);
        };
        HumanEvalManagerEvs.prototype.del = function (id) {
            var _this = this;
            anim.alert().show(CSLocalize('4724072775e1467eb90aaaa4cd7a5068', 'Do you really want to remove this Evaluator from the system?'), function (ok) {
                if (!ok)
                    return;
                Pager.ajaxGet(Pager.pathType.restServices, Login.CmdHumanEvalManagerEvsSave_Type, Login.CmdHumanEvalManagerEvsSave_Create(-id, _this.CompanyId, null, null), function (res) { return Pager.reloadPage(); });
            });
        };
        HumanEvalManagerEvs.prototype.add = function () {
            this.modalDlg.show(0);
        };
        HumanEvalManagerEvs.prototype.close = function () {
            location.hash = schools.createHomeUrlStd();
        };
        HumanEvalManagerEvs.prototype.refresh = function (completed) {
        };
        HumanEvalManagerEvs.prototype.downloadReport = function () {
            Pager.ajax_download(Pager.path(Pager.pathType.restServices), Login.CmdReport_Create(schools.LMComUserId(), CourseMeta.actCompanyId, Login.CmdReportType.evaluators), Login.CmdReport_Type);
        };
        return HumanEvalManagerEvs;
    })(schoolAdmin.CompModel);
    schoolAdmin.HumanEvalManagerEvs = HumanEvalManagerEvs;
    //model pro jednoho evaluator
    var evaluator = (function () {
        function evaluator(data) {
            this.data = data;
            this.langs = _.map(data.evalInfos, function (l) { return new evaluatorLangLow(l.lang); });
        }
        return evaluator;
    })();
    schoolAdmin.evaluator = evaluator;
    jQuery.validator.addMethod("humanUnique", function (val, element, params) {
        var model = params.model;
        val = val.trim().toLowerCase();
        return _.all(model.owner.evaluators, function (e) { return e.data.email != val; });
    }, function (params, element) {
        return CSLocalize('44461a0351fc4224845dd09794b580f0', 'email address already exists');
    });
    var evaluatorModalDlg = (function () {
        function evaluatorModalDlg(owner) {
            this.owner = owner;
            this.email = ko.observable('');
            this.isEdit = ko.observable(false);
            this.langs = _.map(avalLangs, function (l) { return new evaluatorLang(l); });
        }
        evaluatorModalDlg.prototype.loaded = function () {
            this.myCtrl = $('#evaluator-modal-dlg');
            this.form = this.myCtrl.find('form');
            this.validator = this.form.validate({
                onsubmit: false,
                rules: {
                    'human-email-input': {
                        required: true,
                        email: true,
                        humanUnique: {
                            model: this
                        }
                    }
                }
            });
            this.emailCtrl = this.form.find('#human-email-input');
            this.langsCtrl = this.form.find('#human-langs');
            this.langsCtrl[0]['type'] = '';
        };
        evaluatorModalDlg.prototype.show = function (id, completed) {
            this.isEdit(id > 0);
            this.actEvaluator = id == 0 ? null : _.find(this.owner.evaluators, function (ev) { return ev.data.companyUserId == id; });
            this.email(this.actEvaluator ? this.actEvaluator.data.email : '');
            var actLangs = this.actEvaluator ? _.map(this.actEvaluator.langs, function (l) { return l.lang; }) : [];
            _.each(this.langs, function (l) { return l.checked(_.contains(actLangs, l.lang)); });
            this.validator.removeError(this.langsCtrl[0]);
            this.validator.removeError(this.emailCtrl[0]);
            this.myCtrl.modal('show');
        };
        evaluatorModalDlg.prototype.ok = function () {
            var _this = this;
            if (!this.actEvaluator && !this.form.valid())
                return;
            var par = Login.CmdHumanEvalManagerEvsSave_Create(0, this.owner.CompanyId, null, null);
            if (this.actEvaluator)
                par.companyUserId = this.actEvaluator.data.companyUserId;
            else
                par.email = this.email();
            if (!this.langsValid()) {
                this.validator.addError({ element: this.langsCtrl[0], message: CSLocalize('dea496b88f524c4ab10895368de79d0f', 'At least one language must be selected') });
                return;
            }
            this.validator.removeError(this.langsCtrl[0]);
            par.evalInfos = _.map(_.filter(this.langs, function (l) { return l.checked(); }), function (l) { return { lang: l.lang }; });
            Pager.ajaxGet(Pager.pathType.restServices, Login.CmdHumanEvalManagerEvsSave_Type, par, function (res) {
                if (!res) {
                    _this.validator.addError({ element: _this.emailCtrl[0], message: CSLocalize('be46325868c844ca8c6f1d433437ffd3', 'Person with this email address is not registered in the system') });
                    return;
                }
                _this.myCtrl.modal('hide');
                Pager.reloadPage();
            });
        };
        evaluatorModalDlg.prototype.langsValid = function () { return _.any(this.langs, function (l) { return l.checked(); }); };
        return evaluatorModalDlg;
    })();
    schoolAdmin.evaluatorModalDlg = evaluatorModalDlg;
    //jedna line jednoho evaluatora
    var evaluatorLang = (function (_super) {
        __extends(evaluatorLang, _super);
        function evaluatorLang() {
            _super.apply(this, arguments);
            this.checked = ko.observable(false);
        }
        return evaluatorLang;
    })(evaluatorLangLow);
    schoolAdmin.evaluatorLang = evaluatorLang;
    var avalLangs = [LMComLib.LineIds.English, LMComLib.LineIds.German, LMComLib.LineIds.Spanish, LMComLib.LineIds.French, LMComLib.LineIds.Italian, LMComLib.LineIds.Russian];
    var locLangs = {};
    locLangs[LMComLib.LineIds.English] = function () { return CSLocalize('469d05c7cef5487fb29048505902a1a8', 'English'); };
    locLangs[LMComLib.LineIds.German] = function () { return CSLocalize('94606ae1ef72415f848daeb779f0f259', 'German'); };
    locLangs[LMComLib.LineIds.Italian] = function () { return CSLocalize('66ea06373abb486dbb0dd8598b895dc6', 'Italian'); };
    locLangs[LMComLib.LineIds.Spanish] = function () { return CSLocalize('a82c4ec950354576ab605a5191ce8988', 'Spanish'); };
    locLangs[LMComLib.LineIds.French] = function () { return CSLocalize('d694058048d242459d329a9b19a15f66', 'French'); };
    locLangs[LMComLib.LineIds.Russian] = function () { return CSLocalize('ad2f4d121a3d4518a035ea7949473dc4', 'Russian'); };
    //*************************************************************
    //  TODO: rozsirena varianta assign formulare: vstupni data jsou v excelu, do formulare se provadi PASTE identifikaci testu
    //*************************************************************
    var HumanEvalManagerEx = (function (_super) {
        __extends(HumanEvalManagerEx, _super);
        function HumanEvalManagerEx(urlParts) {
            _super.call(this, schoolAdmin.humanEvalManagerExTypeName, urlParts);
        }
        // UPDATE
        HumanEvalManagerEx.prototype.update = function (completed) {
            completed();
        };
        return HumanEvalManagerEx;
    })(schoolAdmin.CompModel);
    schoolAdmin.HumanEvalManagerEx = HumanEvalManagerEx;
    Pager.registerAppLocator(schoolAdmin.appId, schoolAdmin.humanEvalManagerLangsTypeName, function (urlParts, completed) { return completed(new HumanEvalManagerLangs(urlParts)); });
    Pager.registerAppLocator(schoolAdmin.appId, schoolAdmin.humanEvalManagerTypeName, function (urlParts, completed) { return completed(new HumanEvalManager(urlParts)); });
    Pager.registerAppLocator(schoolAdmin.appId, schoolAdmin.humanEvalManagerEvsTypeName, function (urlParts, completed) { return completed(new HumanEvalManagerEvs(urlParts)); });
    Pager.registerAppLocator(schoolAdmin.appId, schoolAdmin.humanEvalManagerExTypeName, function (urlParts, completed) { return completed(new HumanEvalManagerEx(urlParts)); });
})(schoolAdmin || (schoolAdmin = {}));

/// <reference path="../JsLib/jsd/jquery.d.ts" />
/// <reference path="../JsLib/jsd/knockout.d.ts" />
/// <reference path="../JsLib/jsd/jsrender.d.ts" />
/// <reference path="../JsLib/jsd/underscore.d.ts" />
/// <reference path="../JsLib/js/ModelBase.ts" />
/// <reference path="../JsLib/js/GenLMComLib.ts" />
/// <reference path="../JsLib/ea/EAExtension.ts" />
/// <reference path="GenAdmin.ts" />
/// <reference path="../JsLib/js/Validate.ts" />
/// <reference path="../login/GenLogin.ts" />
/// <reference path="../login/Model.ts" />
/// <reference path="admin.ts" />
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var schoolAdmin;
(function (schoolAdmin) {
    var CompAdmins = (function (_super) {
        __extends(CompAdmins, _super);
        function CompAdmins(urlParts) {
            _super.call(this, schoolAdmin.compAdminsTypeName, urlParts);
        }
        // UPDATE
        CompAdmins.prototype.update = function (completed) {
            var _this = this;
            Pager.ajaxPost(Pager.pathType.restServices, Admin.CmdGetUsers_Type, Admin.CmdGetUsers_Create(false, false, [this.CompanyId]), function (res) {
                _this.comp_Admin = _.map(_.pairs(_.groupBy(res.CompUsers, "CompanyId")), function (nv) { return new CompanyAdmins(_this, nv[0], nv[1]); });
                setTimeout(function () { return _this.refreshHtml(); }, 1);
                completed();
            });
        };
        // OK x CANCEL
        CompAdmins.prototype.ok = function () {
            Pager.ajaxPost(Pager.pathType.restServices, Admin.CmdSetUsers_Type, Admin.CmdSetUsers_Create(null, null, null, _.map(_.flatten(_.map(this.comp_Admin, function (it) { return it.Items; }), true), function (it) { return it.data; })), function () { return Login.adjustMyData(true, function () { return LMStatus.gotoReturnUrl(); }); });
        };
        CompAdmins.prototype.cancel = function () { LMStatus.gotoReturnUrl(); };
        CompAdmins.prototype.refreshHtml = function () {
            Pager.renderTemplateEx('schoolCompAdminsItemsPlace', 'schoolCompAdminsItems', this);
        };
        return CompAdmins;
    })(schoolAdmin.CompModel);
    schoolAdmin.CompAdmins = CompAdmins;
    // COMP ADMIN
    var CompanyAdmins = (function () {
        function CompanyAdmins(owner, Id, items) {
            var _this = this;
            this.owner = owner;
            this.Id = Id;
            var self = this;
            //this.Title = _.find(Login.myData.Companies, (comp: Login.MyCompany) => comp.Id == Id).Title;
            this.Items = _.map(items, function (it) { return new CompanyAdminItem(it); });
            //this.compAdmin_del = (act: CompanyAdminItem) => { if (act.data.UserId == 0) self.Items.remove(act); else act.Deleted(!act.Deleted()); }
            this.compAdmin_del = function (act) { if (act.data.UserId == 0) {
                self.Items = _.without(self.Items, act);
                self.owner.refreshHtml();
            }
            else
                act.Deleted(!act.Deleted()); };
            this.newEMail = validate.create(validate.types.email, function (prop) {
                prop.required = true;
                prop.customValidation = function (email) { return _.any(_this.Items, function (it) { return it.data.EMail == email; }) ? CSLocalize('bd38a1ebc3f041779ffd7a5bcf34dfe8', 'User with this email already added') : null; };
            });
            this.newEMail_Add = function () {
                if (!validate.isPropsValid([_this.newEMail]))
                    return;
                var nu = new CompanyAdminItem({
                    UserId: 0,
                    Deleted: false,
                    EMail: self.newEMail(),
                    CompanyId: Id,
                    Role: { Role: 0, HumanEvalatorInfos: null }
                });
                _this.Items.push(nu);
                self.owner.refreshHtml();
                _this.newEMail(null);
            };
        }
        return CompanyAdmins;
    })();
    var CompanyAdminItem = (function () {
        function CompanyAdminItem(data) {
            this.data = data;
            this.Deleted = ko.observable(false);
            this.Deleted.subscribe(function (val) { return data.Deleted = val; });
            this.options = [
                new CompanyAdminOption(this.data, LMComLib.CompRole.Keys),
                new CompanyAdminOption(this.data, LMComLib.CompRole.Products),
                new CompanyAdminOption(this.data, LMComLib.CompRole.Department),
                new CompanyAdminOption(this.data, LMComLib.CompRole.Results),
                new CompanyAdminOption(this.data, LMComLib.CompRole.Publisher),
                new CompanyAdminOption(this.data, LMComLib.CompRole.HumanEvalManager),
            ];
        }
        return CompanyAdminItem;
    })();
    var CompanyAdminOption = (function () {
        function CompanyAdminOption(data, role) {
            this.data = data;
            this.checked = ko.observable(false);
            this.checked((data.Role.Role & role) != 0);
            this.checked.subscribe(function (r) { return data.Role.Role = r ? data.Role.Role | role : data.Role.Role & ~role; });
            this.title = schoolAdmin.roleTranslation[role]();
        }
        return CompanyAdminOption;
    })();
    Pager.registerAppLocator(schoolAdmin.appId, schoolAdmin.compAdminsTypeName, function (urlParts, completed) { return completed(new CompAdmins(urlParts)); });
})(schoolAdmin || (schoolAdmin = {}));

var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var schoolAdmin;
(function (schoolAdmin) {
    var UserResults = (function (_super) {
        __extends(UserResults, _super);
        function UserResults(urlParts) {
            _super.call(this, schoolAdmin.schoolUserResultsTypeName, urlParts);
        }
        UserResults.prototype.update = function (completed) {
            completed();
        };
        UserResults.prototype.downloadTestReport = function () {
            Pager.ajax_download(Pager.path(Pager.pathType.restServices), Login.CmdReport_Create(schools.LMComUserId(), CourseMeta.actCompanyId, Login.CmdReportType.test), Login.CmdReport_Type);
        };
        return UserResults;
    })(schoolAdmin.CompModel);
    schoolAdmin.UserResults = UserResults;
    Pager.registerAppLocator(schoolAdmin.appId, schoolAdmin.schoolUserResultsTypeName, function (urlParts, completed) { return completed(new UserResults(urlParts)); });
})(schoolAdmin || (schoolAdmin = {}));

var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var schoolAdmin;
(function (schoolAdmin) {
    var Departments = (function (_super) {
        __extends(Departments, _super);
        function Departments(urlParts) {
            _super.call(this, schoolAdmin.editDepartmentTypeName, urlParts);
            this.th = ko.observable('Dummy');
            this.listModels = [
                { model: null, template: ko.observable('Dummy'), id: 'study_periods', title: CSLocalize('5c160f5326584d0e9edcf9e293e76f32', 'Study Periods') },
                { model: null, template: ko.observable('Dummy'), id: 'time intervals', title: CSLocalize('84566284da7f4cdab2d27e86bc5e58a8', 'Time Intervals') },
                { model: null, template: ko.observable('Dummy'), id: 'score_ntervals', title: CSLocalize('4166679903f548f88f67ef4f7fa4eb0c', 'Score Intervals') }
            ];
            var self = this;
        }
        Departments.prototype.update = function (completed) {
            var _this = this;
            Pager.ajaxGet(Pager.pathType.restServices, Admin.CmdGetDepartment_Type, Admin.CmdGetDepartment_Create(this.CompanyId), function (res) {
                var isNew = res.Departments == null;
                _this.treeModel = new TreeView.Model(isNew ? { Id: 0, Title: _this.title(), Items: null, isNew: true } : res.Departments, isNew, function (nd) { return _.any(res.UsedIds, function (id) { return id == nd.Id; }); }, { withCheckbox: false, editable: true, onLinkClick: null });
                if (res.IntervalsConfig == null)
                    res.IntervalsConfig = { Periods: { Items: null }, Secs: { Items: null }, Scores: { Items: null } };
                _this.th('depTreeTemplate');
                new listModel(res.IntervalsConfig.Periods.Items, _this.listModels[0], new periodDr());
                new listModel(res.IntervalsConfig.Secs.Items, _this.listModels[1], new secDr());
                new listModel(res.IntervalsConfig.Scores.Items, _this.listModels[2], new scoreDr());
                _.each(_this.listModels, function (m) { return m.template('depListTemplate'); });
                completed();
            });
        };
        Departments.prototype.ok = function () {
            var tree = this.treeModel.getResult();
            var intervals = { Periods: this.listModels[0].model.dataFromModel(), Secs: this.listModels[1].model.dataFromModel(), Scores: this.listModels[2].model.dataFromModel() };
            Pager.ajaxPost(Pager.pathType.restServices, Admin.CmdSetDepartment_Type, Admin.CmdSetDepartment_Create(this.CompanyId, tree, intervals));
            LMStatus.gotoReturnUrl();
        };
        Departments.prototype.cancel = function () { LMStatus.gotoReturnUrl(); };
        return Departments;
    })(schoolAdmin.CompModel);
    schoolAdmin.Departments = Departments;
    var listModel = (function () {
        function listModel(data, meta, driver) {
            var _this = this;
            this.meta = meta;
            this.driver = driver;
            this.newItem = ko.observable();
            var cnt = 0;
            this.items = ko.observableArray(_.map(data, function (d) { return new listItem(_this, d, _this, cnt++); }));
            meta.model = this;
        }
        listModel.prototype.dataFromModel = function () { var cnt = 0; return { Items: _.map(this.items(), function (li) { return { IntervalId: cnt++, From: li.value.valueNum(), Title: li.title.title() }; }) }; };
        listModel.prototype.valueIsOK = function (s, actItem) {
            var res = { isOK: false, val: this.driver.toNumber(s) };
            res.isOK = res.val != cError;
            if (!res.isOK)
                return res;
            res.isOK = !_.find(this.items(), function (it) { return it != actItem && (it.value).valueNum() == res.val; });
            return res;
        };
        listModel.prototype.sort = function () {
            if (this.driver.isDesc())
                this.items.sort(function (a, b) { return b.value.valueNum() - a.value.valueNum(); });
            else
                this.items.sort(function (a, b) { return a.value.valueNum() - b.value.valueNum(); }); //reorder
        };
        listModel.prototype.onEnterEscClick = function (data, par) {
            var self = data.model;
            try {
                if (par.keyCode !== 27) {
                    var res = self.valueIsOK(self.newItem(), null);
                    if (!res.isOK)
                        return;
                    self.items.push(new listItem(self, { From: res.val, Title: null }, self, self.items.length));
                    self.sort();
                }
            }
            finally {
                self.newItem('');
                self.newItem.valueHasMutated();
            }
        };
        return listModel;
    })();
    schoolAdmin.listModel = listModel;
    var listItem = (function () {
        function listItem(owner, data, listModel, id) {
            this.owner = owner;
            this.data = data;
            this.listModel = listModel;
            this.id = id;
            var self = this;
            this.value = new listCellValue(this, true, this.data.From);
            this.title = new listCellTitle(this, false, this.data.Title);
            this.descr = ko.computed({
                read: function () {
                    var items = self.owner.items();
                    var idx = items.indexOf(self);
                    return self.owner.driver.customDescr(items, idx);
                },
                deferEvaluation: true,
            });
        }
        listItem.prototype.doDelete = function () {
            if (this.owner.items().length <= 1)
                return;
            this.descr.dispose();
            this.owner.items.remove(this);
        };
        return listItem;
    })();
    schoolAdmin.listItem = listItem;
    var listCell = (function () {
        function listCell(listItem, isValue) {
            this.listItem = listItem;
            this.isValue = isValue;
            this.editing = ko.observable(false);
            this.id = listItem.listModel.meta.id + '_' + (isValue ? 'val' : 'title') + '_' + listItem.id;
        }
        listCell.prototype.doEdit = function () { this.editing(true); };
        listCell.prototype.onEnterEscape = function (data, ev) {
            if (ev.keyCode === 27)
                $(ev.target).val(data.title()); /*undo*/
            data.editing(false);
        };
        return listCell;
    })();
    schoolAdmin.listCell = listCell;
    //http://www.jefclaes.be/2013/05/validating-composite-models-with.html 
    //https://github.com/Knockout-Contrib/Knockout-Validation/wiki
    var listCellValue = (function (_super) {
        __extends(listCellValue, _super);
        function listCellValue(list, isLeft, valueNum) {
            _super.call(this, list, isLeft);
            this.valueNum = ko.observable();
            var self = this;
            self.valueNum(valueNum);
            var model = self.listItem.owner;
            this.title = ko.computed({
                read: function () { return model.driver.toString(self.valueNum()); },
                write: function (s) {
                    var res = model.valueIsOK(s, self.listItem);
                    if (!res.isOK)
                        self.title.notifySubscribers(model.driver.toString(self.valueNum())); //error => undo
                    else {
                        self.valueNum(res.val);
                        model.sort();
                    }
                },
            });
        }
        return listCellValue;
    })(listCell);
    schoolAdmin.listCellValue = listCellValue;
    var listCellTitle = (function (_super) {
        __extends(listCellTitle, _super);
        function listCellTitle(list, isLeft, value) {
            _super.call(this, list, isLeft);
            this.title = ko.observable('');
            this.title(value ? value : '');
        }
        return listCellTitle;
    })(listCell);
    schoolAdmin.listCellTitle = listCellTitle;
    var cError = -1000;
    var periodDr = (function () {
        function periodDr() {
        }
        periodDr.prototype.toNumber = function (s) {
            try {
                var ny = s.split('-');
                if (ny.length != 2)
                    throw 'e';
                return checkInterval(ny[0], 1, 12) + (checkInterval(ny[1], 2013, 2050) - 2000) * 100;
            }
            catch (e) {
                return cError;
            }
        };
        periodDr.prototype.toString = function (s) {
            var m = Utils.modulo(s, 100);
            return m.z.toString() + '-' + (m.m + 2000).toString();
        };
        periodDr.prototype.isDesc = function () { return false; };
        periodDr.prototype.customDescr = function (items, idx) {
            var dr = this;
            var act = Utils.modulo(items[idx].value.valueNum(), 100);
            var actStr = Globalize.format(new Date(act.m + 2000, act.z - 1, 1), 'Y', Trados.actLangNetCode);
            if (idx == items.length - 1)
                return actStr + ' -';
            var next = Utils.modulo(items[idx + 1].value.valueNum(), 100);
            next.z -= 1;
            if (next.z == 0) {
                next.m -= 1;
                next.z = 12;
            }
            if (act.z == next.z && act.m == next.m)
                return actStr;
            var nextStr = Globalize.format(new Date(next.m + 2000, next.z - 1, 1), 'Y', Trados.actLangNetCode);
            if (next.m == act.m && next.z == 12 && act.z == 1)
                return (next.m + 2000).toString();
            if (next.m == act.m)
                return Globalize.culture(Trados.actLangNetCode).calendars.standard.months.names[act.z - 1] + ' - ' + nextStr;
            return actStr + ' - ' + nextStr;
        };
        return periodDr;
    })();
    schoolAdmin.periodDr = periodDr;
    function checkInterval(val, min, max) {
        var v = parseInt(val.trim());
        if (isNaN(v) || v > max || v < min)
            throw 'err';
        return v;
    }
    var secDr = (function () {
        function secDr() {
        }
        secDr.prototype.toNumber = function (s) {
            try {
                var parts = s.split(/[\.\:]/);
                var res = 0;
                var len = parts.length;
                if (len > 4 || len < 3)
                    throw 'e';
                if (len == 4)
                    res += checkInterval(parts[len - 4], 0, 100) * 86400;
                res += checkInterval(parts[len - 3], 0, 23) * 3600;
                res += checkInterval(parts[len - 2], 0, 59) * 60;
                res += checkInterval(parts[len - 1], 0, 59);
                return res;
            }
            catch (e) {
                return cError;
            }
        };
        secDr.prototype.toString = function (s) {
            var res = "";
            var m = Utils.modulo(s, 86400);
            s = m.z;
            if (m.m > 0)
                res += m.m.toString() + ".";
            m = Utils.modulo(s, 3600);
            s = m.z;
            res += (m.m > 9 ? m.m.toString() : '0' + m.m.toString()) + ':';
            m = Utils.modulo(s, 60);
            s = m.z;
            res += (m.m > 9 ? m.m.toString() : '0' + m.m.toString()) + ':';
            res += s > 9 ? s.toString() : '0' + s.toString();
            return res;
        };
        secDr.prototype.isDesc = function () { return true; };
        secDr.prototype.customDescr = function (items, idx) {
            var dr = this;
            if (idx == 0)
                return dr.toString(items[idx].value.valueNum()) + ' -';
            return dr.toString(items[idx].value.valueNum()) + ' - ' + dr.toString(items[idx - 1].value.valueNum());
        };
        return secDr;
    })();
    schoolAdmin.secDr = secDr;
    var scoreDr = (function () {
        function scoreDr() {
        }
        scoreDr.prototype.toNumber = function (s) {
            try {
                return checkInterval(s, 0, 100) - 1;
            }
            catch (e) {
                return cError;
            }
        };
        scoreDr.prototype.toString = function (s) { return (s + 1).toString(); };
        scoreDr.prototype.isDesc = function () { return true; };
        scoreDr.prototype.customDescr = function (items, idx) {
            var dr = this;
            var max = idx == 0 ? 100 : items[idx - 1].value.valueNum();
            var min = items[idx].value.valueNum() + 1;
            if (max == min)
                return min.toString() + '%';
            return min.toString() + ' - ' + max.toString() + '%';
        };
        return scoreDr;
    })();
    schoolAdmin.scoreDr = scoreDr;
    Pager.registerAppLocator(schoolAdmin.appId, schoolAdmin.editDepartmentTypeName, function (urlParts, completed) { return completed(new Departments(urlParts)); });
})(schoolAdmin || (schoolAdmin = {}));