module CourseModel {

  export interface tag {
    _tg: string;
    _owner: Course.tagImpl;
  }

  export interface a {
    href: string;
  }

  export interface jsonMLMeta {
    classDir: { [id: string]: { new (data: tag): Course.tagImpl; }; };
  }

  export function registerClassToInterface(meta: jsonMLMeta, tg: string, cls: { new (data: tag): Course.tagImpl; }) {
    if (!meta.classDir) meta.classDir = {};
    meta.classDir[tg] = cls;
  }

  export var tspan = "span";
  export var tp = "p";
  export var ta = "a";
  export var tbr = "br";
  export var tdiv = "div";
  export var thr = "hr";

  export interface body {
    title: string;
    instrs: Array<string>;
    seeAlso: Array<seeAlsoLink>
    bodyStyle: string;
    propertyTags: Array<Course.tagImpl>;
  }

  export function hasStatus(tg: tag, st: tgSt): boolean {
    var tp = meta.types[tg._tg];
    return !tp ? false : (tp.st & st) == st;
  }

  export function hasStatusLow(status: tgSt, st: tgSt): boolean {
    return (status & st) == st;
  }

  export interface jsClassMetaEx {
    meta: jsClassMeta;
    name: string;
  }

  export interface jsPropMetaEx {
    meta: jsPropMeta;
    name: string;
  }
  function metaObjRootTag(metaObj: jsonMLMeta = null): string {
    return metaObj.rootTagName;
  }
  export function ancestorsAndSelf(type: string, metaObj: jsonMLMeta = null): string[] {
    var ancs = ancestorsAndSelfObj(type, metaObj);
    return !ancs ? null : _.map(ancestorsAndSelfObj(type, metaObj), m => m.name);
  }
  export function isDescendantOf(self: string, ancestor: string): boolean {
    return _.any(ancestorsAndSelfObj(self), a => a.name == ancestor);
  }
  export function ancestorsAndSelfObj(type: string, metaObj: jsonMLMeta = null): jsClassMetaEx[] {
    if (!metaObj) metaObj = meta;
    var res: jsClassMetaEx[] = [];
    var obj = metaObj.types[type]; if (!obj) return null;
    var name = type;
    while (true) { res.push({ meta: obj, name: name }); if (name == metaObjRootTag(metaObj)) break; name = obj.anc; obj = metaObj.types[name]; }
    return res;
  }
  export function descendants(type: string, metaObj: jsonMLMeta = null): string[] {
    if (!metaObj) metaObj = meta;
    var res: string[] = [];
    for (var p in metaObj.types) {
      if (p == metaObjRootTag(metaObj)) continue; //ttag neni anc niceho
      var anc = p;
      while (true) { //cyklus pres ancestory ''p'
        anc = metaObj.types[anc].anc;
        if (anc == type) { res.push(p); break; } //'type' je mezi nacestory 'p'
        if (anc == metaObjRootTag(metaObj)) break;
      }
    }
    while (true) { res.unshift(type); type = metaObj.types[type].anc; if (type == metaObjRootTag(metaObj)) break; }
    return res;
  }

  export function getPropInfo(type: string, propName: string, metaObj: jsonMLMeta = null): jsPropMeta {
    var res: jsPropMeta = null;
    _.find(ancestorsAndSelfObj(type, metaObj), m => { res = m.meta.props ? m.meta.props[propName] : null; return !!res; });
    return res;
  }

  export function getPropInfos(type: string, metaObj: jsonMLMeta = null): Array<jsPropMetaEx> {
    var res: Array<jsPropMetaEx> = [];
    _.each(ancestorsAndSelfObj(type, metaObj).reverse(), m => {
      if (!m.meta.props) return;
      for (var p in m.meta.props) res.push({ name: p, meta: m.meta.props[p] });
    });
    return res;
  }

}
//module CourseModel {

//  export class itemObj implements ItemObj {
//    Item: tag;
//  }

//  export class tag implements Tag {
//    constructor() {
//      this.tagInfo = tagInfos[this.Type];
//    }
//    //Tag
//    Type: string;
//    Classes: string;
//    id: string;
//    Width: string;
//    style: string;
//    specItems: Array<tag>;
//    Items: Array<tag>;
//    Item: itemObj;
//    //other
//    parent: tag;
//    myPage: page;
//    localize(locProc: (s: string) => string): void { }
//    tagInfo: TagStatic;
//  }

//  export class text extends tag implements Text {
//    Title: string;
//    localize(locProc: (s: string) => string): void {
//      super.localize(locProc);
//      this.Title = locProc(this.Title);
//    }
//  }

//  export class control extends tag implements Result {
//    //constructor(public data: CourseModel.Tag, public myPage: Page) {
//    //  this.tagInfo = CourseModel.tagInfos[data.Type];
//    //  (<any>data).control = this;
//    //  if (data.Item && data.Item.Item) {
//    //    data.specItems = _.clone(data.Items);
//    //    data.Items.unshift(data.Item.Item);
//    //    data.Item = <any>(data.Item.Item); //hack, dereference
//    //  } else
//    //    data.specItems = data.Items;
//    //}
//    tagInfo: CourseModel.TagStatic;
//    parent: control; // parent control
//    childs: Array<control> = []; //child controls (nikoliv tags, pouze controls)
//    result: CourseModel.Result; //pointer na vysledek kontrolky
//    status(): LMComLib.ExerciseStatus { return this.myPage.st; }

//    createResult(forceEval: boolean = false): CourseModel.Result { throw "not overwrited"; } //inicializace objektu s vysledkem kontrolky
//    provideData(data: CourseModel.Result): void { throw "not overwrited"; } //predani dat z kontrolky do persistence
//    acceptData(exSt: LMComLib.ExerciseStatus, userData: CourseModel.Result): void { } //zmena stavu kontrolky na zaklade persistentnich dat
//    score(): CourseModel.Score { var c = this.isCorrect(); return { ms: 1, s: c ? 1 : 0, needsHumanEval: false }; } //spocti score kontrolky
//    isCorrect(): boolean { throw "not overwrited"; } //pro 0 x 1 score
//    finishLoading: (completed: () => void) => void; //dokonceni kontrolky
//    finish(): void { }

//    selfElement() { return Course.idToElement(this.id); }

//    getItem(id: string): control { return this.myPage.getItem(id); }

//    //style(): string {
//    getStyle(): string {
//      var res = this.widthStyle();
//      if (res != null) return " style='" + res + "'";
//    }

//    widthStyle() { return Course.getWidthStyle(this.Width); }

//    forDescendants(action: (ctrl: control) => void) {
//      _.each(this.childs, c => { action(c); c.forDescendants(action); });
//    }
//  }

//  export class page extends control implements Page, PageUser {
//    //Page
//    //info: schools.page; //obsolete
//    url: string;
//    order: number;
//    title: string;
//    instrTitle: string;
//    instrs: Array<string>;
//    seeAlso: Array<schools.seeAlsoLink>;
//    externals: Array<string>;
//    courseSeeAlsoStr: string;
//    CrsId: LMComLib.CourseIds;
//    isPassive: boolean;
//    isOldEA: boolean;
//    //sitemapIgnore: boolean;
//    //PageUser
//    i: number;
//    s: Score;
//    st: LMComLib.ExerciseStatus;
//    bt: number;
//    et: number;
//    t: number;
//    Results: any;
//    //other
//    controls: { [id: string]: control; };
//    localize(locProc: (s: string) => string): void {
//      super.localize(locProc);
//      this.title = locProc(this.title);
//    }


//    items: Array<control> = [];
//    getItem(id: string): control { return _.find(this.items, (c: control) => c.id == id); }
//    normalStatus = ko.observable<boolean>(false);
//    //sound: pageSound; TODO

//    finishPageLoading(completed: () => void) {
//      var compl = () => {
//        //this.sound = new pageSound(this); TODO
//        this.isPassive = _.all(this.items, (it: control) => CourseModel.tagInfos[it.Type].noEval); //pasivni cviceni nema zadne kontrolky
//        completed();
//      };
//      if (typeof $.ajax == 'undefined') { //bez JQuery
//        _.each(this.items, ctrl => ctrl.finishLoading(() => { }));
//        compl(); return;
//      }
//      var promises = _.compact(_.map(this.items, ctrl => {
//        var defered = $.Deferred();
//        ctrl.finishLoading(defered.resolve);
//        return defered.promise();
//      }));
//      $.whenall(promises).done(compl);
//    }

//    /*** IScoreProvider ***/
//    provideData(exData: { [ctrlId: string]: Object; }): void { _.each(this.items, (ctrl: control) => { if (ctrl.tagInfo.noEval) return; ctrl.provideData(exData[ctrl.id]); }); }
//    acceptData(exSt: LMComLib.ExerciseStatus, exData: { [ctrlId: string]: Object; }): void {
//      _.each(this.items, (ctrl: control) => { ctrl.acceptData(exSt, exData[ctrl.id]); });
//      this.normalStatus(exSt == LMComLib.ExerciseStatus.Normal);
//    }
//    resetData(exData: { [ctrlId: string]: Object; }): void {
//      _.each(this.items, (ctrl: control) => { if (ctrl.tagInfo.noEval) return; ctrl.result = exData[ctrl.id] = ctrl.createResult(); });
//      this.acceptData(LMComLib.ExerciseStatus.Normal, exData);
//    }
//    get_score(): number[] { throw "not implemented"; } //implementuje stary EA. V Exercise.ts se meni na getScore
//    getScoreLow(): CourseModel.Score {
//      var res: CourseModel.Score = { ms: 0, s: 0, needsHumanEval: false };
//      _.each(this.items, (ctrl: control) => {
//        if (ctrl.tagInfo.noEval) return;
//        var sc = ctrl.score();
//        res.ms += sc.ms; res.s += sc.s; res.needsHumanEval = res.needsHumanEval || sc.needsHumanEval;
//      });
//      return res;
//    }
//    getScore: () => CourseModel.Score;
//    status(): LMComLib.ExerciseStatus { return this.st; }

//    //Helper
//    find(id: string): control { return _.find(this.items, it => it.id == id); }
//    filter(cond: (c: control) => boolean): control[] { return _.filter(this.items, it => cond(it)); }
//  }

//  export class checkItem extends control implements CheckItem, CheckItemResult {
//    //CheckItem
//    CorrectValue: boolean;
//    //CheckItemResult
//    TextId: CheckItemTexts;
//    Value: boolean;
//  }

//  export class pairing extends control implements Pairing, PairingResult {
//    Value: Array<number>;
//  }

//  export class singleChoiceLow extends control implements SingleChoiceLow, SingleChoiceResult {
//    CorrectValue: number;
//    Data: Array<string>;
//    Value: number;
//  }

//  export class singleChoice extends singleChoiceLow {
//  }

//  export class wordSelection extends singleChoiceLow {
//    Words: string;
//  }


//  export function scan(dt: Tag, action: (dt: Tag) => void, cond: (dt: Tag) => boolean = null): void {
//    if (dt.Items) _.each(dt.Items, it => scan(it, action, cond));
//    if (!cond || cond(dt)) action(dt);
//  }

//  export function find(dt: Tag, cond: (dt: Tag) => boolean = null): Tag {
//    if (cond(dt)) return dt; if (!dt.Items) return null;
//    var res: Tag = null;
//    return _.find(dt.Items, it => (res = find(it, cond)) != null) ? res : null;
//  }

//  export function finishAndLocalize(pgLow: Page, locProc: (s: string) => string): void {
//    var pg = <page>pgLow;
//    pg.controls = {};
//    scan(pg, (dt: tag) => {
//      if (dt.Items) _.each(dt.Items, (it: tag) => { it.parent = dt; it.myPage = pg; });
//      switch (dt.Type) {
//        case tPage: Utils.extend(dt, page); break;
//        case tText: Utils.extend(dt, text); break;
//        case tGapFill: Utils.extend(dt, tag); break;
//        case tPairing: Utils.extend(dt, pairing); break;
//        case tSingleChoice: Utils.extend(dt, singleChoice); break;
//        case tWordSelection: Utils.extend(dt, wordSelection); break;
//        case tCheckItem: Utils.extend(dt, tag); break;
//        case tPossibilities: Utils.extend(dt, tag); break;
//        case tDragSource: Utils.extend(dt, tag); break;
//        case tDragTarget: Utils.extend(dt, tag); break;
//        case tPassiveDialog: Utils.extend(dt, tag); break;
//        case tMediaDialog: Utils.extend(dt, tag); break;
//        case tMediaText: Utils.extend(dt, tag); break;
//        case tMediaBigMark: Utils.extend(dt, tag); break;
//        case tMediaBar: Utils.extend(dt, tag); break;
//        case tMediaTitle: Utils.extend(dt, tag); break;
//        case tMediaVideo: Utils.extend(dt, tag); break;
//        case tMediaReplica: Utils.extend(dt, tag); break;
//        case tSndSent: Utils.extend(dt, tag); break;
//        case tSndReplica: Utils.extend(dt, tag); break;
//        default: Utils.extend(dt, tag); break;
//      };
//      if (dt.id) pg.controls[dt.id] = <any>dt;
//      dt.localize(locProc);
//    });
//  }

//  //**** normalize GapFill string
//  export function normalize(value: string): string {
//    if (value == null || value == '') return value;
//    value = value.toLowerCase();
//    var st = 0; var res = "";
//    for (var i = 0; i < value.length; i++) {
//      var ch = value.charAt(i);
//      switch (st) {
//        case 0: if (!Unicode.isLeterOrDigit(ch)) continue; res += ch; st = 1; break; //pocatecni whitespaces
//        case 1: if (!Unicode.isLeterOrDigit(ch)) { st = 2; continue; } res += ch; break; //neni whitestapce
//        case 2: if (!Unicode.isLeterOrDigit(ch)) continue; res += " "; res += ch; st = 1; break; //dalsi whitespaces
//      }
//    }
//    return res;
//  }
//} 