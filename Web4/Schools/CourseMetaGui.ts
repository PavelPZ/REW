module CourseMeta {

  export function navBar(): string { return cfg.themeDefauleNavbar ? 'default' : 'inverse'; }
  //export var navBar = 'default';

  //Dynamicke properties stranky, menene i pri vyhodnoceni cviceni
  export var greenTitle = ko.observable<string>(); //titulek buttonu
  export var greenIcon = ko.observable<string>(); //ikona buttonu
  export var greenCss = ko.observable<string>(); //barva buttonu
  export var greenDisabled = ko.observable<boolean>(); //vse hotovo => disabled
  export var greenClick: () => void;
  export var greenArrowDict: { [url: string]: boolean };
  export var foundGreenEx: exImpl; //aktualni zelene cviceni

  export function doGreenClick() { CourseMeta.lib.keepGreen = greenCss() == 'success'; greenClick(); return false; } //pres klik na sipku se drzi zelena barva sipky

  export function btnClick(url: string) { //klik na button
    var nd: courseNode = _.isEmpty(url) ? actCourseRoot : <courseNode>(actProduct.getNode(url));
    if (nd.isSkiped) return;
    Pager.navigateToHash(nd.href())
  }

  export function gotoData(url: string) {
    //skok na hash nebo sitemap url, kvuli breadcrumb v testMe result apod.
    Pager.navigateToHash(_.isEmpty(url) ? '' : (url.split('@').length > 1 ? /*hash*/url : /*sitemap Url*/actProduct.getNode(url).href()));
    return false;
  }

  export module gui {
    export function alert(type: alerts, isConfirm: boolean) { //alert x confirm
      if (isConfirm) return confirm(CSLocalize('d348b1d49cc9424a8c1c3a840ad9d4dd', 'Your answers are not all correct. Do you really want to evaluate the exercise?'));
      else window.alert('alert');
    }
    export function gotoData(node: dataImpl) { //skok na jiny node
      if (!node) node = actCourseRoot;
      Pager.navigateToHash(node.href());
    }
    export function onReload() { //reload stranky na te same URL adrese
      Pager.reloadPage();
    }

    export var exerciseHtml: () => string;
    export var exerciseCls: () => string;
    export function init() { exerciseHtml = $.noop; exerciseCls = $.noop; }
  }
  gui.init();

  //sluzby, ktere CourseMeta poskytuje persistent layer
  export var persist: IPersistence = null; //persistNewEA.persistCourse;

  export class MetaModel extends schools.Model {
    title() { return actNode.title; }
    iconId(): string { return actNode.iconId(); }
    breadcrumbs(): schools.ILink[] {
      if (this.br) return this.br;
      var res: Array<schools.ILink> = [];
      var self: dataImpl = actNode;
      while (true) { res.push(self); if (self == actCourseRoot || self == actGrammar) break; self = self.parent; }
      if (!isType(actNode, runtimeType.grammar) && cfg.target == LMComLib.Targets.web) res.push({ title: schools.homeTitle(), iconId: () => 'home', url: '' });
      if (res.length == 1) return this.br = [];
      res.reverse();
      return this.br = res;
    } br: schools.ILink[];
    hasBreadcrumb() { return actNode != actGrammar && this.breadcrumbs().length > 1; }
    normalDisplay() { return cfg.displayMode == schools.displayModes.normal; }
    previewExDisplay() { return cfg.displayMode == schools.displayModes.previewEx; }
    doUpdate(completed: () => void): void {
      lib.onChangeUrl(this.productUrl, this.persistence, this.url, ex =>
        lib.doRefresh(completed));
    }
    //loaded() { CourseMeta.lib.adjustAnchors(); } kde se vola?
  }

  export class ModelPretest extends MetaModel {
    constructor(urlParts: string[]) { super(schools.tCoursePretest, urlParts); }
    title() { return 'Pretest'; }
    iconId(): string { return 'puzzle-piece'; }
    bodyTmpl = "TCoursePretestBody";
    doUpdate(completed: () => void): void {
      //var u: schools.Url = <any>this.url;
      lib.onChangeUrl(this.productUrl, this.persistence, this.url, ex =>
        lib.doRefresh(() => {
          if (!isType(actNode, runtimeType.taskPretest)) throw '!isType(actNode, runtimeType.taskPretest)';
          var pretest = (<pretestImpl>actNode);
          var init = pretest.initModel();
          lib.fillArrowInfo(init.info);
          lib.adjustEx(init.grEx, () =>
            lib.displayEx(init.grEx, null, null));
        }));
    }
  }

  export class Model extends MetaModel {
    constructor(urlParts: string[]) {
      super(schools.tCourseMeta, urlParts);
    }
    bodyTmpl = "TCourseMeta_Folder";
  }

  export interface tupple { left: Object; right: Object; }

  $.views.helpers({
    makeTuples: function (buttons: Array<Object>): Array<tupple> {
      var res: Array<tupple> = []; var isLeft = true;
      _.each(buttons, b => {
        if (isLeft) res.push({ left: b, right: null });
        else { var t = res[res.length - 1]; t.right = b; }
        isLeft = !isLeft;
      });
      return res;
    },
    CourseMeta: CourseMeta,
    Utils: Utils,
    cfg: cfg,
    SndLow: SndLow,
  });


  $(window).bind("resize", () => {
    $(".cbtn").each(function () {
      var btn = $(this);
      var url = btn.data("node-url"); if (!url) return;
      var nd: courseNode = <courseNode>(actProduct.getNode(url)); if (!nd) return;
      var w = btn.outerWidth(true); var sum = nd.exCount;
      var skiped = nd.isSkiped ? w : w * nd.skipedCount / sum;
      var completed = nd.isSkiped ? 0 : w * (nd.complNotPassiveCnt + nd.complPassiveCnt) / sum;
      btn.find('.c1').css('width', Math.round(skiped).toString() + 'px');
      btn.find('.c2').css('left', Math.round(skiped).toString() + 'px').css('width', Math.round(completed).toString() + 'px');
      btn.find('.c3').css('left', Math.round(skiped + completed).toString() + 'px');
    });
  });

  export function saveAndReload() { lib.saveProduct(() => { actNode = null; Pager.reloadPage(actExModel); }); }

  //vypocet odvozenych udaju
  export function refreshExerciseBar(dt: exImpl): void {
    actExModel.tb.exercisePassive(actEx.page.isPassivePage());
    if (dt.done) {
      actExModel.tb.exerciseEvaluated(true);
      actExModel.tb.score(actEx.page.isPassivePage() ? null : Math.round(100 * dt.s / dt.ms).toString() + "%");
    } else
      actExModel.tb.exerciseEvaluated(false);
  }

  //stav zelene sipky
  export class greenArrowInfo {
    constructor(public title: string, public disable: boolean, public css: string, public iconId: string, public greenClick: () => void) { }
  }

  //vsechny mozne alerty
  export enum alerts { exTooManyErrors }

  //seznam vsech dostupnych button akci 
  export enum nodeAction {
    no,
    browse,
    skip,
    run,
    //archive = 3,
    unskip,
    //nop = 5,
    //pro kurz
    reset,
    //pro test
    runTestAgain,
    cancelTestSkip,
  }

  export function onNodeAction(url: string, type: nodeAction): void { //proved akci na node
    var nd = actProduct.getNode<courseNode>(url);
    nd.onAction(type);
  }

  //popis akce nad buttonem
  export class NodeAction {
    constructor(public type: nodeAction, public node: courseNode) { }
    info(): IActionInfo { return allActions[this.type]; }
    static createActions(node: courseNode, ...actions: nodeAction[]): NodeAction[] {
      return _.map(_.filter(actions, a => a != nodeAction.no), act => new NodeAction(act, node));
    }
  }

  //staticka globalni informace o akci
  export interface IActionInfo {
    icon: string;
    title: () => string;
  }

  export var allActions: { [id: number]: IActionInfo } = {};
  allActions[nodeAction.browse] = { icon: 'folder-open', title: () => CSLocalize('af026337fdf44d3287ade389c8d925f9', 'Browse') };
  allActions[nodeAction.skip] = { icon: 'times-circle', title: () => CSLocalize('2c9b18c8e2a8449b891a3639691e1999', 'Skip') };
  allActions[nodeAction.run] = { icon: 'play', title: () => CSLocalize('ba8042332a3c4520bc758e9bc851ae2b', 'Run') };
  allActions[nodeAction.unskip] = { icon: 'plus-circle', title: () => CSLocalize('7f9d15221d9f471f934a944b1a949dca', 'Undo Skip') };
  allActions[nodeAction.reset] = { icon: 'refresh', title: () => CSLocalize('27f1cba5240643fc9d0993cb6b5931b7', 'Reset') };
  allActions[nodeAction.runTestAgain] = { icon: 'refresh', title: () => CSLocalize('9f77df2b307e48ad91291b0907fcbf4a', 'Run a new test') };
  allActions[nodeAction.cancelTestSkip] = { icon: 'plus-circle', title: () => CSLocalize('f48f9615e3374fd2b6e1c377d1b8b0d3', 'Cancel and skip the test') };

  Pager.registerAppLocator(schools.appId, schools.tCourseMeta, (urlParts, completed) => completed(new Model(urlParts)));
  Pager.registerAppLocator(schools.appId, schools.tCoursePretest, (urlParts, completed) => completed(new ModelPretest(urlParts)));

  //Pager.registerAppLocator(
  //  schools.tCourseMeta,
  //  (url: schools.Url, completed) => { completed(new Model(url.companyId, url.productUrl, url.url)); });
  //Pager.registerAppLocator(
  //  schools.tCoursePretest,
  //  (url: schools.Url, completed) => { completed(new ModelPretest(url.companyId, url.productUrl, url.url)); });

}

