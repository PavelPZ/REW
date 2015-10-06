module schools { export var appId = "school"; }
module testMe { export var appId = "test"; }
module Login { export var appId = "login"; }
module schoolAdmin { export var appId = "schoolAdmin".toLowerCase(); }
module xref { export var appId = "xref"; }
module doc { export var appId = "doc"; }
module vsNet { export var appId = "vsNet".toLowerCase(); }
module grafia { export var appId = "grafia"; }
module skrivanek { export var appId = "skrivanek"; }

var hashDelim = '/';
var oldPrefix = '/pg/old/';
var encMask = new RegExp('/', 'g');
var decMask = new RegExp('@', 'g');
function encodeUrlHash(url: string): string { return url ? url.replace(encMask, '@') : ''; }
function decodeUrlHash(url: string): string { return url ? url.replace(decMask, '/') : null; }

module Pager {

  export enum ButtonType {
    okCancel = 0,
    ok = 1,
    cancel = 2,
  }

  export class ViewModelRoot {
    pageChanged(oldPage: Pager.Page, newPage: Pager.Page) { } //pozadavek na novou stranku
    loaded() { } //nova stranka naladovana a nabindovana
  }

  export class Page {
    constructor(public appId: string, public type: string, public urlParts: string[]/*, public base: Page = null*/) { /*this.sessId = sessionId;*/ }
    update(completed: () => void): void { completed(); } //vybudovani stranky
    loaded(): void { } //naladovani HTML stranky
    leave() { } //pred opustenim stranky
    htmlClearing() { } //pred zrusenim HTML se strankou
    getHash(): string { return [this.appId, this.type].concat(this.urlParts).join(hashDelim); } //my hash
  }

  export function registerAppLocator(appId: string, type: string, pageCreator: (urlParts: string[], completed: (pg: Page) => void) => void): void {
    if (!regApps[appId]) regApps[appId] = {};
    regApps[appId][type] = pageCreator;
  } var regApps: { [appId: string]: { [type: string]: (urlParts: string[], completed: (pg: Page) => void) => void; } } = {};

  export function locatePageFromHash(hash: string, completed: (pg: Page) => void): void {
    //if (!cfg.noAngularjsApp) { alert('locatePageFromHash cannot be called'); return; }
    alert('locatePageFromHash cannot be called'); return;
    locatePageFromHashLow(hash, pg => {
      if (pg) { completed(pg); return; }
      if (!hash || hash.length < 2) locatePageFromHashLow(initHash(), completed);
      else { window.location.hash = ""; completed(null); }
    });
  }

  //reakce na callback z OAuth2 login
  export function angularJS_OAuthLogin(hash: string, completed: () => void): boolean {
    if (hash != null && hash.indexOf("access_token=") >= 0) { //navrat z externiho loginu
      OAuth.checkForToken((obj: OAuth.profile) => {
        if (!obj.email) {
          alert('Povolte prosím poskytnutí vašeho emailu!');
          LMStatus.LogoutLow();
          return false;
        }
        Pager.ajaxGet( //dle externiho ID zjisti LM Id (a ev. zaloz usera)  
          Pager.pathType.restServices,
          Login.CmdAdjustUser_Type,
          Login.CmdAdjustUser_Create(obj.providerid, obj.id, obj.email, obj.firstName, obj.lastName),
          (res: Login.CmdProfile) => { //dej usera do cookie a proved redirekt
            LMStatus.logged(res.Cookie, false);
            blended.checkOldApplicationStart();
          });
      });
      return true;
    }
    return false;
  }

  function locatePageFromHashLow(hash: string, completed: (pg: Page) => void): void {
    //if (!cfg.noAngularjsApp) { alert('locatePageFromHash cannot be called'); return; }
    alert('locatePageFromHash cannot be called'); return;
    if (hash != null && hash.indexOf("access_token=") >= 0) { //navrat z externiho loginu
      OAuth.checkForToken((obj: OAuth.profile) => {
        Pager.ajaxGet( //dle externiho ID zjisti LM Id (a ev. zaloz usera)
          Pager.pathType.restServices,
          Login.CmdAdjustUser_Type,
          Login.CmdAdjustUser_Create(obj.providerid, obj.id, obj.email, obj.firstName, obj.lastName),
          (res: Login.CmdProfile) => { //dej usera do cookie a proved redirekt
            LMStatus.logged(res.Cookie, false);
          });
      });
      completed(Pager.ignorePage); return;
    }
    if (hash && hash.charAt(0) == '#') hash = hash.substring(1);
    //if (blended.isAngularHash(hash)) { completed(angularPage); return; }
    if (!hash || hash.length < 3) { completed(null); return; }
    //hash = hash.toLowerCase();
    var parts = hash.split(hashDelim);
    if (parts[0] == 'old' || parts[1] == 'old') {
      var removeNum = parts[0] == 'old' ? 1 : 2;
      parts.splice(0, removeNum);
    }
    if (parts.length < 2) { completed(null); return; }
    var app = regApps[parts[0].toLowerCase()]; if (!app) { completed(null); return; }
    var proc = app[parts[1].toLowerCase()]; if (!proc) { completed(null); return; }
    proc(parts.length <= 2 ? null : parts.slice(2), completed);
  }

  export var ActPage: Page;
  export var htmlOwner: Page;
  export var ignorePage: Page = new Page(null, null, null);
  export var angularPage: Page = new Page(null, null, null);

  $.views.helpers({
    ActPage: () => Pager.ActPage,
    Pager: Pager,
    //HomeUrl: () => initHash, //initUrl.toString(),
  });

  //export function HomeUrl(): string { return "#"; }

  export function getHomeUrl() { return LMStatus.isLogged() ? Pager.initHash() : Login.loginUrl(); }
  export function gotoHomeUrl() { navigateToHash(getHomeUrl()); }

  export function navigateToHash(hash: string) {
    if (!hash) hash = '';
    if (hash.length > 0 && hash.charAt(0) != '#') hash = '#' + hash;
    Logger.trace('Pager', 'navigateToHash: ' + hash);
    location.hash = hash;
  }

  export function closePanels() { anim.collapseExpanded(); }

  //export function orceLoadPage(page: Pager.Page) {
  //  if (page == null) locatePageFromHash('', loadPageLow); else loadPageLow(page);
  //}

  export function loadPageHash(hash: string) {
    debugger;
    locatePageFromHash(hash, pg => loadPage(pg));
  }

  export function loadPage(page: Pager.Page) {
    if (page == null || page == Pager.ignorePage) return;
    if (ActPage != page) {
      var oldPg = ActPage;
      ActPage = page;
      if (oldPg != null) oldPg.leave();
      rootVM.pageChanged(oldPg, ActPage);
    }
    if (page == angularPage) { renderTemplate('Dummy'); return; }
    reloadPage();
  }

  export function beforeLoadPage(page: Pager.Page) {
    if (ActPage == page) return;
    var oldPg = ActPage;
    ActPage = page;
    if (oldPg != null) oldPg.leave();
    rootVM.pageChanged(oldPg, ActPage);
  }

  export function reloadPage(page: Pager.Page = null): void {
    if (!page) page = ActPage; if (!page) throw 'Missing page';
    Logger.trace("ModelBase.reload: url=", page.getHash() + ", template=" + ViewBase.viewLocator(page.type));

    blockGui(true);

    //clearHtml(); 16.9.2014, optimalizace:
    clearNode();

    page.update(() => { renderHtml(page); callLoaded(); page.loaded(); });
  }
  //stranka dokoncena => zavolej dokoncovaci akce
  export function callLoaded() {
    setTimeout(() => {
      rootVM.loaded();
      blockGui(false);
    }, 1);
  }

  export function blockGui(isBlock: boolean) {
    var el = $('#block-gui-element');
    //if (blockGuiTimer != 0) { clearTimeout(blockGuiTimer); blockGuiTimer = 0; }
    if (isBlock) {
      el.show();
    } else {
      el.hide();
    }
  } //var blockGuiTimer = 0;

  export function renderTemplateEx(tagId: string, templateId: string, bindingObject: Object) {
    var root = $('#' + tagId);
    var oldObj = root.data('binding-obj');
    if (oldObj) {
      if (oldObj.dispose) oldObj.dispose();
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

  export function renderTemplate(templateId: string) {
    var root = $('#root');
    if (templateId == 'Dummy') {
      ko.cleanNode(root[0]);
      clearNode(); root.html('');
    } else {
      root.html(JsRenderTemplateEngine.render(templateId, rootVM));
      ko.applyBindings(rootVM, root[0]);
    }
  }

  //Vymaz obsah stranky
  export function clearHtml() { renderTemplate('Dummy'); }

  function clearNode() { try { ko.cleanNode($('#root')[0]); } catch (e) { } if (!htmlOwner) return; htmlOwner.htmlClearing(); htmlOwner = null; }

  //vygeneruj HTML a navaz ho do stranky. Proved ko-binding
  export function renderHtml(page: Pager.Page = Pager.ActPage) {
    clearNode();
    renderTemplate(ViewBase.viewLocator(page.type));
    htmlOwner = page;
  }

  export function renderHtmlEx(isStart: boolean, style: string = null, page: Pager.Page = Pager.ActPage) {
    var root = $('#root');
    if (isStart) {
      if (bowser.agent.msie && bowser.agent.version > 8) root.addClass('contentHidden');
      //dynamicke pridani x odstraneni lokalnich page stylu
      var hd = $('head');
      //http://stackoverflow.com/questions/3182840/removing-or-replacing-a-stylesheet-a-link-with-javascript-jquery
      var cs = hd.find('#current-style');
      if (cs.length > 0) { cs.prop('disabled', true); cs.remove(); }
      if (!_.isEmpty(style)) {
        var st: any = document.createElement('style');
        st.id = 'current-style';
        st.type = 'text/css';
        if (st.styleSheet) st.styleSheet.cssText = style; else st.appendChild(document.createTextNode(style));
        hd.append(st);
      }
    }
    if (isStart) renderHtml(page);
    if (!isStart) root.waitForImages(() => root.removeClass("contentHidden"), $.noop, false);
  }


  export var rootVM = new ViewModelRoot();
  export var initHash: () => string; //inicialni hash URL
  export var afterLoginInit: (completed: () => void) => void; //sance po zalogovani naladovat zakodovane javascripty

}
