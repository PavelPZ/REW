/// <reference path="GenCourseModel.ts" />
/// <reference path="GapFill.ts" />
/// <reference path="Pairing.ts" />
/// <reference path="SingleChoice.ts" />
/// <reference path="CheckItem.ts" />
/// <reference path="Media.ts" />

/***** nemazat reference, nejde pak prelozit *****/
module Course {

  export enum initPhase { beforeRender, afterRender, afterRender2 };
  export enum initPhaseType { no, sync, async };
  export function scorePercent(sc: CourseModel.Score) { return sc.ms == 0 ? -1 : Math.round(sc.s / sc.ms * 100); }
  export function needsHumanEval(flag: CourseModel.CourseDataFlag) { return (flag & CourseModel.CourseDataFlag.needsEval) != 0; }

  export var dummyTag: CourseModel.tag = { _tg: CourseModel.tspan, 'class': null, id: null, Items: null, _owner: null, srcpos: '' };

  //function getEvalData(ev: control) { return <evalControlImpl>ev; }

  export class tagImpl implements CourseModel.tag {
    id: string;
    //styleSheet: string;
    Items: Array<CourseModel.tag>;
    class: Array<string>;
    _tg: string;
    srcpos: string;
    //---
    _owner: tagImpl;
    _myPage: Course.Page;
    constructor(data?: CourseModel.tag) { //volana pri jsonML parse
      if (data) for (var p in data) if (data.hasOwnProperty(p)) this[p] = data[p];
    }
    jsonMLParsed() { //volana na konci jsonML parse self
      this._myPage = <Course.Page>(_.find(this.parents(true), t => t._tg == CourseModel.tbody));
    }

    pageCreated() { } //volana po nacteni user dat, vytvoreni page apod.

    parents(incSelf: boolean): Array<tagImpl> { var res: Array<tagImpl> = []; var t = incSelf ? this : this._owner; while (t) { res.push(t); t = t._owner; } return res; }

    isEval() { return CourseModel.hasStatus(this, CourseModel.tgSt.isEval); }
    isCtrl() { return CourseModel.hasStatus(this, CourseModel.tgSt.jsCtrl); }
    isMedia() { return _.any(CourseModel.ancestorsAndSelf(this._tg), anc => anc == CourseModel.tmediaTag); }

    initProc(phase: initPhase, getTypeOnly: boolean, completed: () => void): initPhaseType { return initPhaseType.no; }

    getItem(id: string): tagImpl { return this._myPage.tags[id]; }

    srcPosition() { return _.isEmpty(this.srcpos) ? '' : ' srcpos="' + this.srcpos + '"'; }
  }

  export class imgImpl extends tagImpl implements CourseModel.img {
    jsonMLParsed() {
      super.jsonMLParsed();
      if (_.isEmpty(this.src)) return;
      this.src = Utils.fullUrl(this.src) ? this.src : (cfg.baseTagUrl ? cfg.baseTagUrl : Pager.basicDir) + Utils.combineUrl(this._myPage.url, this.src);
    }
    src: string;
  }

  export class aImpl extends tagImpl implements CourseModel.a {
    href: string;
    jsonMLParsed() {
      super.jsonMLParsed();
      if (!this.href) return;
      this.href = this.href.toLowerCase();
      if (/* /w/w/w... */this.href.match(/^(\/?\w)+$/)) {
        this['-href'] = this.href; this.href = '#';
      }
    }
  }

  $(document).on('click', 'a[-href]', ev => {
    var href = $(ev.target).attr('-href'); if (_.isEmpty(href)) return;
    alert('TODO: ' + href);
    //gotoHref(null, href);
  })

  export class evalControlImpl extends tagImpl implements CourseModel.evalControl {

    constructor(data: CourseModel.tag) { //vytvoreni v jsonML
      super(data);
      if (!this.id) this.id = "_id_" + (evalControlImpl.idCnt++).toString();
    }

    jsonMLParsed() {
      super.jsonMLParsed();
      if (!this.scoreWeight) {
        if (this._tg != CourseModel.tpairingItem && this._tg != CourseModel.tpairing)
          this.scoreWeight = 100;
      }
    }

    evalGroup: string;
    evalButtonId: string;
    scoreWeight: number;

    static idCnt = 0;

    done = ko.observable(false); //priznak kontrolky ve stavu Done
    myEvalBtn: evalBtn; //muj eval group button
    //myEvalGroup: evalGroupImpl; //muj eval group
    //tagInfo: CourseModel.TagStatic;
    //parent: control; // parent control
    //childs: Array<control> = []; //child controls (nikoliv tags, pouze controls)
    result: CourseModel.Result; //pointer na vysledek kontrolky
    pageDone(): boolean { return this._myPage.result.done; }
    //getTagProps(): Array<CourseModel.tag> { //tagy, ulozene v property
    //  var res: Array<CourseModel.tag> = [];
    //  _.each(CourseModel.getPropInfos(this.tg), prop => {
    //    //if (!CourseModel.hasStatusLow(prop.meta.st, CourseModel.tgSt.inItems)) return;
    //    if (_.isEmpty(prop.meta.childPropTypes)) return;
    //    var val = this[Utils.toCammelCase(prop.name)]; if (!val) return;
    //    if (CourseModel.hasStatusLow(prop.meta.st, CourseModel.tgSt.isArray)) res.pushArray(val); else res.push(val);
    //  });
    //  return res;
    //}
    isReadOnly(): boolean { return false; }
    isSkipEvaluation(): boolean { return false; }


    createResult(forceEval: boolean): CourseModel.Result { throw "not overwrited"; } //inicializace objektu s vysledkem kontrolky
    provideData(): void { throw "not overwrited"; } //predani dat z kontrolky do persistence
    acceptData(done: boolean): void { this.done(done || (this.myEvalBtn && this.myEvalBtn.doneResult)); } //zmena stavu kontrolky na zaklade persistentnich dat
    resetData(allData: { [ctrlId: string]: Object; }): void { this.result = allData[this.id] = this.doCreateResult(false); this.acceptData(false); }
    //**** jedna z nasledujicich 2 metod musi byt v kontrolce prepsana. Pouziva se 1. result (zjisteny pomoci provideData z HTML), 2. source (xml) data 
    setScore(): void { var c = this.isCorrect(); this.result.ms = this.scoreWeight; this.result.s = c ? this.scoreWeight : 0; }
    isCorrect(): boolean { throw "not overwrited"; } 

    //getResultScore(): CourseModel.Score { return { ms: this.result.ms, s: this.result.s }; }
    doProvideData(): void { this.provideData(); this.setScore(); }
    doCreateResult(forceEval: boolean): CourseModel.Result { this.result = this.createResult(forceEval); this.setScore(); return this.result; }

    selfElement() { return idToElement(this.id); }

    pageCreated() {
      if (!this.id) throw 'eval control mush have id';
      var pgRes = this._myPage.result;
      if (!pgRes.result) { pgRes.result = {}; this._myPage.result.userPending = true; }
      var ress = pgRes.result;
      if (pgRes.designForceEval || !ress[this.id]) { ress[this.id] = this.doCreateResult(pgRes.designForceEval); this._myPage.result.userPending = true; }
    }
  }

  export class humanEvalControlImpl extends evalControlImpl {
    result: CourseModel.HumanEvalResult; //pointer na vysledek kontrolky
    form: JQuery; //humanEval form
    human = ko.observable('');
    humanLevel = ko.observable('');
    humanHelpTxt = ko.observable('');

    isHumanEvalMode() { return cfg.humanEvalMode || this._myPage.humanEvalMode; }

    adjustEvalForm() {
      if (!this.isHumanEvalMode()) return;
      this.form = $('#form-' + this.id);
      var par = { onsubmit: false, rules: {} };
      par.rules['human-ed-' + this.id] = { required: true, range: [0, this.scoreWeight], number: true };
      this.form.validate(par);
    }

    acTestLevel(): string {
      var ex: CourseMeta.exImpl; var test: testMe.testImpl;
      if (!this._myPage || !(ex = this._myPage.result) || !ex.parent || !(test = <any>ex.parent.parent)) return null;
      if (!CourseMeta.isType(test, CourseMeta.runtimeType.test)) return null;
      return test.level;
    }

    static useEvalForms(ex: CourseMeta.exImpl): boolean {
      if (!cfg.humanEvalMode && !ex.page.humanEvalMode) return undefined;
      //var toEvals: Array<{ hc: humanEvalControlImpl; visible: boolean; }> = [];
      var toEvals: Array<humanEvalControlImpl> = [];
      for (var p in ex.page.tags) {
        var hc: humanEvalControlImpl = <humanEvalControlImpl>(ex.page.tags[p]);
        if (CourseModel.isDescendantOf(hc._tg, CourseModel.thumanEval))
          //toEvals.push({ hc: hc, visible: hc.form.css('display') != 'none' });
          if (hc.form.css('display') != 'none') toEvals.push(hc);
      }
      //if (!_.all(toEvals, f => !f.visible || f.hc.form.valid())) return false;
      if (!_.all(toEvals, f => f.form.valid())) return false;
      _.each(toEvals, ev => {
        ev.result.hPercent = parseInt(ev.human());
        ev.result.hEmail = LMStatus.Cookie.EMail;
        ev.result.hLmcomId = LMStatus.Cookie.id;
        ev.result.hDate = Utils.nowToNum();
        ev.result.flag = ev.result.flag & ~CourseModel.CourseDataFlag.needsEval;
        ev.setScore();
      });
      ex.userPending = true;
      var score = ex.evaluator.getScore();
      ex.s = score.s;
      ex.flag = score.flag;
      CourseMeta.actCourseRoot.refreshNumbers();
      return true;
    }
  }

  export function idToElement(id: string): JQuery { return $('#' + id).first(); }

  //Spolecny (old EA i New) interface na score providera
  export interface IScoreProvider { //S4N.IScoreProvider
    provideData(exData: { [ctrlId: string]: Object; }): void; //Prenos dat z cviceni do PageUser
    acceptData(exSt: LMComLib.ExerciseStatus, exData: { [ctrlId: string]: Object; }): void; //Prenos dat z PageUser do cviceni
    resetData(exData: { [ctrlId: string]: Object; }): void; //Reset cviceni
    get_score(): number[]; //indexy jsou S4N_ScorePart
    getScore: () => CourseModel.Score; //spocti score celeho cviceni
  }

  export function finishCreatePage(exImpl: CourseMeta.exImpl): Page { var page = exImpl.page; page.finishCreatePage(exImpl); return page; }

  export class Page extends tagImpl implements CourseModel.body, CourseMeta.IScoreProvider {

    sndPage: sndPageImpl; //CourseModel._sndPage;
    evalPage: evalPageImpl; //CourseModel._evalPage;
    url: string;
    order: number;
    instrTitle: string;
    externals: string;
    seeAlsoLinks: string;
    //isPassive: boolean;
    isOldEa: boolean;
    oldEaIsPassive: boolean;
    instrBody: string;
    seeAlsoStr: string;
    //blended angular: 
    //userData: Object; //uzivatelova long data stranky (short data jsou v produkut u kazdeho node)
    myNode: CourseMeta.data; //my node v produktu
    myModule: blended.cachedModule; //muj slovnik a lokalizace
    //---
    title: string;
    instrs: Array<string>;
    seeAlso: Array<CourseModel.seeAlsoLink>
    bodyStyle: string;
    propertyTags: Array<tagImpl>;

    humanEvalMode: boolean; //priznak zobrazeni stranky pro human eval

    isPassivePage(): boolean { return this.isOldEa ? this.oldEaIsPassive : !this.evalPage || this.evalPage.maxScore == 0; }

    result: CourseMeta.exImpl; //CourseMeta.IExUser;

    items: Array<tagImpl>; //all page controls
    tags: { [id: string]: tagImpl; } = {} //all named tags

    finishCreatePage(userData: CourseMeta.exImpl) {
      //finishCreatePage(userData: CourseMeta.IExUser) {
      super.pageCreated();
      this.result = userData;

      //nalezni vsechny controls
      var res = []; scan(this, res); _.each(this.propertyTags, t => scan(t, res));
      this.items = _.filter(res,(t: tagImpl) => t.isCtrl && t.isCtrl());
      this.sndPage.allMediaTags = _.filter(res,(t: tagImpl) => t.isMedia && t.isMedia());
      _.each(res,(t: tagImpl) => { if (t.id) this.tags[t.id] = t; })

      //dokonci vytvoreni kontrolek
      _.each(res, c => { if (c.pageCreated) c.pageCreated(); });
    }

    callInitProcs(phase: initPhase, completed: () => void) {
      //synchronni init akce
      _.each(_.filter(this.items, ctrl => ctrl.initProc(phase, true, null) == initPhaseType.sync), ctrl => ctrl.initProc(phase, false, null));
      //asynchronni init akce
      var promises = _.compact(_.map(_.filter(this.items, ctrl => ctrl.initProc(phase, true, null) == initPhaseType.async), ctrl => {
        var defered = $.Deferred();
        ctrl.initProc(phase, false, defered.resolve);
        return defered.promise();
      }));
      $.whenall(promises).done(() => {
        if (phase == initPhase.afterRender2) edit.adjustSmartWidths(this);
        completed();
      });
    }


    //blendedProvideData(allData: { [ctrlId: string]: CourseModel.Result; }): void { this.result.result = allData; this.provideData(null); }
    //blendedAcceptData(done: boolean, allData: { [ctrlId: string]: CourseModel.Result; }): void { this.result.result = allData; this.acceptData(done, null); }
    //blendedGetScore(): CourseModel.Score { return this.evalPage.getScore(); }// getORScore(this.evalItems); }

    /*** IScoreProvider ***/
    provideData(allData?: { [ctrlId: string]: Object; }): void {
      //_.each(this.evalItems, ctrl => ctrl.provideData(allData[ctrl.id]));
      this.evalPage.provideData();
    }
    acceptData(done: boolean, allData?: { [ctrlId: string]: Object; }): void {
      this.evalPage.acceptData(done);
      //readonly a skip-eval kontrolky
      this.processReadOnlyEtc(done, false);
    }
    resetData(allData?: { [ctrlId: string]: Object; }): void {
      this.evalPage.resetData();
    }
    getScore(): CourseModel.Score { return this.evalPage.getScore(); }// getORScore(this.evalItems); }

    processReadOnlyEtc(done: boolean, provideData: boolean): void {
      _.each(_.filter(this.items, it => it.isEval()),(ev: evalControlImpl) => {
        if (!ev.isReadOnly() && !ev.isSkipEvaluation()) return;
        if (provideData && ev.isSkipEvaluation()) ev.provideData();
        ev.acceptData(ev.isReadOnly() || done);
      });
    }
    //Helper
  }

  function finishTag(data: CourseModel.tag) {
    switch (data._tg) {
      //case CourseModel.ta: var a = <CourseModel.a>data; if (a.href) a.href = a.href.toLowerCase(); break;
      case CourseModel.tp: var p = <CourseModel.htmlTag>data; p._tg = CourseModel.tdiv;
        if (!p['class']) p['class'] = []; else if (_.any(p['class'], c => c.indexOf('oli-par') == 0)) break;
        p['class'].push('oli-par'); break; //knockout error, viz http://stackoverflow.com/questions/18869466/knockout-bug-cannot-match-comment-end
    }
  };

  class tag_helper {
    c_unescape(data: string): string {
      //if (data.indexOf('<') > 0 || data.indexOf('>') > 0)
      //  return data.replace('<', '&lt;').replace('>', '&gt;').replace('&', '&amp;')
      //else
      return data;
    }
    c_isCtrl(data: tagImpl): boolean {
      if (_.isString(data)) return false;
      return data.isCtrl && data.isCtrl();
    }
    c_tagstart(data: CourseModel.tag): string {
      try {
        if (data._tg == CourseModel.tnode) return '';
        var sb = [];
        finishTag(data);
        sb.push("<" + data._tg);
        for (var p in data) {
          if (p == 'Items' || (<string>p).charAt(0) == '_') continue;
          //Muze atribut zacinat velkym pismenem? Dej exception.
          var firstCh = p.charAt(0); if (firstCh != firstCh.toLowerCase()) throw 'something wrong';//continue;
          var val = data[p];
          if (_.isFunction(val)) continue;
          sb.push(' ' + p + '="' + (p == 'class' ? val.join(' ') : val) + '"');
        }
        sb.push(openCloseTags[data._tg] ? "/>" : ">");
        return sb.join('');
      } catch (msg) {
        debugger;
        throw msg;
      }
    }
    cT(data: CourseModel.tag) {
      try {
        if (_.isString(data)) return JsRenderTemplateEngine.tmpl('c_textnew');
        //var st = CourseModel.meta.types[data.tg].st; 
        var tmpl: string;
        if (CourseModel.hasStatus(data, CourseModel.tgSt.jsCtrl)) tmpl = "c_" + Utils.toCammelCase(data._tg);
        //else if (CourseModel.hasStatus(data, CourseModel.tgSt.jsNo)) tmpl = 'c_genitems';
        else tmpl = 'c_tag';
        return JsRenderTemplateEngine.tmpl(tmpl);
      } catch (msg) {
        debugger;
        throw msg;
      }
    }
    classes(data: CourseModel.tag) {
      var clss = "oli-" + Utils.toCammelCase(data._tg);
      //_.each(CourseModel.ancestorsAndSelf(data.tg).reverse(), (t: string) => clss += "c-" + Utils.toCammelCase(t) + " ");
      clss += data['class'] ? " " + data['class'].join(' ') : "";
      return clss.toLowerCase();
    }
    c_tagend(data: CourseModel.tag) {
      if (data._tg == CourseModel.tnode) return '';
      return openCloseTags[data._tg] ? '' : "</" + data._tg + ">";
    }

  }
  var openCloseTags: { [tg: string]: boolean; } = {};
  _.each([CourseModel.thr, CourseModel.tbr, CourseModel.timg], t => openCloseTags[t] = true);

  //export function scan(dt: CourseModel.tag, action: (dt: CourseModel.tag) => void, cond: (dt: CourseModel.tag) => boolean = null): void {
  //  if (dt.Items) _.each(dt.Items, it => scan(it, action, cond));
  //  if (!cond || cond(dt)) action(dt);
  //}

  export function scan(dt: CourseModel.tag, res: Array<CourseModel.tag>): void {
    res.push(dt); _.each(dt.Items, it => scan(it, res));
  }

  export function scanEx(dt: CourseModel.tag, action: (parent: CourseModel.tag, idx: number) => void): void {
    if (!dt.Items) return;
    for (var i = 0; i < dt.Items.length; i++) {
      scanEx(dt.Items[i], action);
      action(dt, i);
    }
  }

  export function localize(pg: CourseModel.body, locProc: (s: string) => string): void {
    pg.title = locProc(pg.title);
    pg.instrTitle = locProc(pg.instrTitle);
    scanEx(pg,(parent, idx) => {
      if (!parent.Items) return;
      var item = parent.Items[idx];
      //localize string
      if (_.isString(item)) { parent.Items[idx] = <any>(locProc(<any>item)); return; }
      //localize pairing-item.right
      var pairItem = <CourseModel.pairingItem>(item); if (pairItem._tg != CourseModel.tpairingItem) return;
      if (pairItem.right) pairItem.right = locProc(pairItem.right);
    });
  }

  export function getCourseAbsoluteUrl(rootUrl: string, url: string): string {
    var parts = rootUrl.toLowerCase().split('/');
    parts[parts.length - 1] = url.toLowerCase();
    return Pager.basicUrl + "rwcourses/" + parts.join('/');
  }


  $.views.helpers(new tag_helper());

  export class writing extends evalControlImpl {
  }
  export class speaking extends evalControlImpl {
  }

  //var gf_normTable: { [charCode: number]: string; };
  //function normalizeChars(s: string) {
  //  if (_.isEmpty(s)) return s;
  //  if (gf_normTable == null) {
  //    gf_normTable = [];
  //    for (var i = 1; i < gf_nt.length; i += 2)
  //      gf_normTable[parseInt(gf_nt[i - 1])] = gf_nt[i];
  //  }
  //  for (var i = 0; i < s.length; i++) {
  //    var nw = gf_normTable[s.charCodeAt(i)];
  //    if (typeof (nw) != 'undefined') s = s.substring(0, i) + nw + s.substring(i + 1);
  //  }
  //  return s;
  //};

  function relevantChars(ch: string): boolean {
    var nw = CourseModel.gaffFill_normTable[ch.charCodeAt(0)]; if (nw) ch = nw;
    return Unicode.isLetter(ch) || Unicode.isNumber(ch);
  }

  //**** normalize GapFill string
  //algoritmus musi byt stejny s d:\LMCom\rew\ObjectModel\Model\CourseSchemaDOM.cs, public static string normalize(
  export function normalize(value: string, caseSensitive: boolean = false): string {
    if (_.isEmpty(value)) return value;

    if (!caseSensitive) value = value.toLowerCase();

    var chars = value.split(''); var res: Array<string> = [];

    var st = 0; //0..zacatek, 1..no space, 2..space 
    var charsNum = 0; var otherNum = 0;
    for (var i = 0; i < chars.length; i++) {
      var ch = chars[i];
      switch (st) {
        //case 0: if (!relevantChars(ch)) continue; st = 1; res.push(ch); break; //mezery na zacatku
        //case 1: if (relevantChars(ch)) { res.push(ch); continue; } st = 2; break; //nemezery 
        //case 2: if (!relevantChars(ch)) continue; st = 1; res.push(' '); res.push(ch); break; //mezery uprostred
        case 0: if (!relevantChars(ch)) { otherNum++; continue; } st = 1; charsNum++; res.push(ch); break; //mezery na zacatku
        case 1: if (relevantChars(ch)) { charsNum++; res.push(ch); continue; } otherNum++; st = 2; break; //nemezery 
        case 2: if (!relevantChars(ch)) { otherNum++; continue; } st = 1; res.push(' '); res.push(ch); break; //mezery uprostred
      }
    }
    if (charsNum <= 2 && otherNum >= charsNum) return value;
    return res.join('');
  }

  export class evalBtn extends evalControlImpl implements CourseModel.evalButton {

    scoreAsRatio: boolean;
    result: CourseModel.evalBtnResult;

    createResult(forceEval: boolean): CourseModel.evalBtnResult { return { ms: 0, s: 0, tg: this._tg, flag: 0, Value: false }; }
    provideData(): void { //predani dat z kontrolky do persistence
      if (this.pageDone()) return;
      if (!this.result) this.result = this.createResult(false);
      this.result.Value = this.doneResult;
    }
    acceptData(pageDone: boolean): void {//zmena stavu kontrolky na zaklade persistentnich dat
      this.doneResult = this.result && this.result.Value;
      if (pageDone) this.st('disabled');
      else this.st(this.doneResult ? 'evaluated' : 'no');
    }
    setScore(): void { this.result.ms = 0; this.result.s = 0; }
    st = ko.observable<string>('');
    doneResult: boolean;
    click: () => void = () => {
      if (this.pageDone()) return;
      this.doneResult = !this.doneResult;
      var btn = this._myPage.evalPage.findBtn(this); if (!btn) return; //BT 2176
      var score = btn.click(this.doneResult);
      if (this.doneResult) this.scoreText(this.scoreAsRatio ? score.s.toString() + '/' + score.ms.toString() : Math.round(100 * score.s / score.ms).toString() + '%');
      //var allData = this.myPage.result.result;
      //var myCtrls = _.filter(this.myPage.evalItems, c => (<evalControlImpl>c).evalBtnId == this.id);
      //_.each(myCtrls, ctrl => { //vsechny kontrolku z self eval grupy
      //  if (!this.doneResult) { //cilovy stav je Normal => reset
      //    ctrl.resetData(allData); // allData[ctrl.data.id] = ctrl.createResult(); ctrl.acceptData(false, ctrl.result);
      //  } else { //cilovy stav je doneResult => prevezmi data a zobraz vyhodnocenou kontrolku
      //    ctrl.provideData(ctrl.result);
      //    ctrl.acceptData(true, ctrl.result);
      //  }
      //});
      //if (this.doneResult) {
      //  var sc = getORScore(myCtrls);
      //  this.scoreText(Math.round(100 * sc.s / sc.ms).toString() + '%');
      //}
      this.st(this.doneResult ? 'evaluated' : 'no');
    };
    scoreText = ko.observable<string>();
  }

  export interface IExtension {
    getTemplateId(): string;
    jsonMLParsed: (self: extensionImpl) => void;
    provideData: (self: extensionImpl) => void;
    acceptData: (self: extensionImpl, pageDone: boolean) => void;
    setScore: (self: extensionImpl) => void;
    pageCreated: (self: extensionImpl) => void;
    createResult: (self: extensionImpl, forceEval: boolean) => CourseModel.extensionResult;
    initProc: (phase: initPhase, getTypeOnly: boolean, completed: () => void) => initPhaseType;
  }

  export class extensionImpl extends evalControlImpl implements CourseModel.extension {

    data: string;
    cdata: string;
    result: CourseModel.extensionResult;
    myExtension: IExtension;

    jsonMLParsed() {
      super.jsonMLParsed();
      switch (this.data) {
        case 'chinh-speaking': this.myExtension = new chinhSpeaking(this); break;
        case 'doc-reference': this.myExtension = new docreference.ext(this); break;
        default: throw this.data;
      }
      if (this.myExtension && this.myExtension.jsonMLParsed) this.myExtension.jsonMLParsed(this);
    }
    createResult(forceEval: boolean): CourseModel.extensionResult { return this.myExtension && this.myExtension.createResult ? this.myExtension.createResult(this, forceEval) : { ms: 0, s: 0, tg: this._tg, flag: 0, Value: null }; }
    provideData(): void { //predani dat z kontrolky do persistence
      if (this.myExtension && this.myExtension.provideData) this.myExtension.provideData(this);
    }
    acceptData(pageDone: boolean): void {//zmena stavu kontrolky na zaklade persistentnich dat
      if (this.myExtension && this.myExtension.acceptData) this.myExtension.acceptData(this, pageDone);
    }
    setScore(): void { if (this.myExtension && this.myExtension.setScore) this.myExtension.setScore(this); else { this.result.ms = 0; this.result.s = 0; }; }
    pageCreated() { if (this.myExtension && this.myExtension.pageCreated) this.myExtension.pageCreated(this); else super.pageCreated(); }
    initProc(phase: initPhase, getTypeOnly: boolean, completed: () => void): initPhaseType {
      if (this.myExtension && this.myExtension.initProc) return this.myExtension.initProc(phase, getTypeOnly, completed);
      else return initPhaseType.no;
    }
  }

  CourseModel.registerClassToInterface(CourseModel.meta, CourseModel.ta, aImpl);
  CourseModel.registerClassToInterface(CourseModel.meta, CourseModel.timg, imgImpl);
  CourseModel.registerClassToInterface(CourseModel.meta, CourseModel.tbody, Page);
  CourseModel.registerClassToInterface(CourseModel.meta, CourseModel.tevalButton, evalBtn);
  CourseModel.registerClassToInterface(CourseModel.meta, CourseModel.textension, extensionImpl);

}

//xx/#DEBUG
module Logger {
  export function trace_course(msg: string): void {
    Logger.trace("Course", msg);
  }
  export function error_course(where, msg) {
    Logger.error("Sound", msg, where);
  };
}
//xx/#ENDDEBUG
//var SoundNoop = null;

