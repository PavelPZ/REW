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
var hashDelim = '/';
var oldPrefix = '/pg/old/';
var encMask = new RegExp('/', 'g');
var decMask = new RegExp('@', 'g');
function encodeUrlHash(url) { return url ? url.replace(encMask, '@') : ''; }
function decodeUrlHash(url) { return url ? url.replace(decMask, '/') : null; }
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
        Page.prototype.getHash = function () { return [this.appId, this.type].concat(this.urlParts).join(hashDelim); }; //my hash
        return Page;
    })();
    Pager.Page = Page;
    function registerAppLocator(appId, type, pageCreator) {
        if (!regApps[appId])
            regApps[appId] = {};
        regApps[appId][type] = pageCreator;
    }
    Pager.registerAppLocator = registerAppLocator;
    var regApps = {};
    function locatePageFromHash(hash, completed) {
        alert('locatePageFromHash cannot be called');
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
        alert('locatePageFromHash cannot be called');
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
        //if (blended.isAngularHash(hash)) { completed(angularPage); return; }
        if (!hash || hash.length < 3) {
            completed(null);
            return;
        }
        //hash = hash.toLowerCase();
        var parts = hash.split(hashDelim);
        if (parts[0] == 'old' || parts[1] == 'old') {
            var removeNum = parts[0] == 'old' ? 1 : 2;
            parts.splice(0, removeNum);
        }
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
    Pager.ignorePage = new Page(null, null, null);
    Pager.angularPage = new Page(null, null, null);
    $.views.helpers({
        ActPage: function () { return Pager.ActPage; },
        Pager: Pager,
    });
    //export function HomeUrl(): string { return "#"; }
    function gotoHomeUrl() {
        navigateToHash(LMStatus.isLogged() ? Pager.initHash() : Login.loginUrl());
    }
    Pager.gotoHomeUrl = gotoHomeUrl;
    function navigateToHash(hash) {
        if (!hash)
            hash = '';
        if (hash.length > 0 && hash.charAt(0) != '#')
            hash = '#' + hash;
        Logger.trace('Pager', 'navigateToHash: ' + hash);
        location.hash = hash;
    }
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
        if (page == Pager.angularPage) {
            renderTemplate('Dummy');
            return;
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
