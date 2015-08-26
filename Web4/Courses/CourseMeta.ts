module CourseModel {
  export function find(dt: tag, cond: (dt: tag) => boolean = null): tag {
    if (cond(dt)) return dt; if (!dt.Items) return null;
    var res: tag = null;
    return _.find(dt.Items, it => (res = find(it, cond)) != null) ? res : null;
  }

}

module CourseMeta {

  export function finishedAndLocked(): boolean { return actCourseRoot.done && previewMode; }
  export var previewMode: boolean;

  export class dataImpl implements data, schools.ILink {
    //static
    title: string;
    line: LMComLib.LineIds;
    type: runtimeType;
    Items: Array<dataImpl>;
    url: string;
    name: string;
    ms: number;
    //specializovane blended AngularJS fields (nepouzivaji se, je kvuli prekladu)
    other: string;
    userData: { [taskId: string]: blended.IPersistNodeItem<any>; } //dato pro jednotlive variatny
    //getPersistData: (taskId: string) => blended.IPersistNodeUser;
    //setPersistData: (taskId: string, modify: (data: blended.IPersistNodeUser) => void) => void;
    //myProduct: IProductEx;
    //static, plneno v finishStaticTree
    parent: dataImpl;
    exCount: number; //pocet cviceni
    uniqId: number;
    //funkce a akce
    localize(locProc: (s: string) => string): void { this.title = locProc(this.title); }
    each<T extends dataImpl>(action: (it: T) => void) { if (this.Items) _.each(this.Items,(it: T) => action(it)); }
    find<TRes extends dataImpl, TCond extends dataImpl>(cond: (it: TCond) => boolean): TRes { return <TRes>(_.find(this.Items,(it: TCond) => cond(it))); }
    findParent<TRes extends dataImpl>(cond: (it: data) => boolean): TRes {
      var c = this;
      while (c != null) { if (cond(c)) return <TRes>c; c = c.parent; }
      return null;
    }
    hrefCompl(companyId: number, productUrl: string, persistence: string): string {
      var tp: string;
      if (isType(this, runtimeType.grammar)) tp = isType(this, runtimeType.ex) ? schools.tGrammPage : schools.tGrammFolder;
      else if (isType(this, runtimeType.taskPretest)) tp = schools.tCoursePretest;
      else tp = isType(this, runtimeType.ex) ? schools.tEx : schools.tCourseMeta;
      return schools.getHash(tp, companyId, productUrl, persistence, this.url);
    }
    href(): string {
      return this.hrefCompl(CourseMeta.actCompanyId, encodeUrlHash(CourseMeta.actProduct.url), CourseMeta.actProductPersistence);
    }

    iconId(): string {
      if (this == actCourseRoot) return "book";
      else if (isType(this, runtimeType.ex)) return isType(this, runtimeType.grammar) ? "file-o" : "edit";
      else return "folder-open";
    }

  }
  Utils.applyMixins(dataImpl, []);

  export class productImpl extends dataImpl {

    allNodes: { [url: string]: dataImpl; }; //vsechny nodes produktu

    getNode<T extends dataImpl>(url: string): T { return <T>(this.allNodes[url]); }

    unloadActProduct(): void {
      if (actEx) actEx.onUnloadEx();
      if (actModule) actModule.onUnloadMod();
      actNode = null; actProduct = null; actGrammar = null; actCourseRoot = null; actModule = null; actEx = null;
    }

  }

  export class grammarRoot extends dataImpl {
  }

  //vsechny uzlu kurzu (mimo vlastniho kurzu)
  export class courseNode extends dataImpl implements CourseModel.Score {
    done: boolean; //persistentni pro cviceni
    isSkiped: boolean;
    beg: number; //datum zacatku
    end: number; //datum konce, na datum se prevede pomoci intToDate(end * 1000000)
    complPassiveCnt: number; //pocet aktivnich vyhodnocenych cviceni
    complNotPassiveCnt: number; //pocet pasivnich vyhodnocenych cviceni
    skipedCount: number; //pocet preskocenych cviceni
    s: number; //soucet score aktivnich vyhodnocenych cviceni
    flag: CourseModel.CourseDataFlag;
    elapsed: number; //straveny cas ve vterinach
    //********** GUI
    getScoreInit(): number {
      return (this.getScoreValue = this.complNotPassiveCnt == 0 || !this.ms ? -1 : Math.round(this.s / this.ms * 100));
    } getScoreValue: number;
    progress() { return this.exCount - this.skipedCount == 0 ? 0 : Math.round(100 * (this.complNotPassiveCnt + this.complPassiveCnt - this.skipedCount) / (this.exCount - this.skipedCount)); }
    statusText(): string {
      var pr = this.progress();
      return (pr > 0 ? CSLocalize('f124b261dbf9482d9c92e0c1b029f98a', 'Progress') + ' ' + pr.toString() + '%, ' : '') + this.statusStr();
    }
    statusStr(): string {
      if (this.isSkiped) return CSLocalize('d96c8f11b16d4c9aa91ac8d8142267fa', 'skipped');
      return this.done ?
        CSLocalize('01fbc5f8a77c4e2491a9ed3ede74e966', 'completed') :
        (greenArrowDict[this.url] ? CSLocalize('1fe40e2548924e519e9b226d4ced7bce', 'run') : CSLocalize('b7ed3c7fc67640ceb98417153f731d63', 'browse'));
    }
    labelCls(): string { return greenArrowDict[this.url] ? 'warning' : 'default'; }
    btnIconId(): string { return greenArrowDict[this.url] ? 'play' : null; }
    iconId(): string { return 'folder-open'; }

    contentCss(): string { var res = ''; if (_.isEmpty(this.btnIconId())) res += 'btn-icon-hidden'; if (this.isSkiped) res += ' disabled'; return res; }
    //disabledCss(): string { return this.isSkiped ? 'disabled' : ''; }

    notRunnableMsg(): string { return null; }
    showProgress(): boolean { return this.complNotPassiveCnt > 0; }
    //menu(): schoolHome.menuItem[] { return []; }
    //btnColor(): string { return }

    btnClick() { CourseMeta.gui.gotoData(this); }

    getSkiped(): boolean { //je preskocen
      var skiped = this.getSkipedTable(false); if (!skiped) return false;
      var nd: dataImpl = this;
      if (!skiped.allSkiped) return false;
      while (nd != null) { if (skiped.allSkiped[this.url]) return true; nd = nd.parent; }
      return false;
    }
    setSkiped(value: boolean, withSave: boolean): void { //preskoc
      if (value == this.isSkiped) return;
      var skiped = this.getSkipedTable(true); if (!skiped) return;
      scan(this,(d: courseNode) => { delete skiped.allSkiped[d.url]; d.isSkiped = false; });
      if (value) skiped.allSkiped[this.url] = true;
      if (withSave) lib.saveProduct(gui.onReload);
    }

    getSkipedTable(willModify: boolean): skipAbleRoot {
      var skRoot = this.findParent<skipAbleRoot>(it => isType(it, runtimeType.skipAbleRoot));
      if (!skRoot) return null; //throw 'missin skiped root';
      if (willModify) { if (!skRoot.allSkiped) skRoot.allSkiped = {}; skRoot.userPending = true; }
      return skRoot;
    }

    refreshNumbers(exCountOnly: boolean = false) { courseNode.doRefreshNumbers(this, exCountOnly); }

    static doRefreshNumbers(th: courseNode, exCountOnly: boolean = false): void { //aktualizuj stav - vypocti ze svych predchudcu
      th.complPassiveCnt = th.complNotPassiveCnt = th.s = th.beg = th.end = th.elapsed = th.skipedCount = th.exCount = th.flag = 0; th.done = th.isSkiped = false;
      var isTest = lib.isTest(actProduct);
      if (!isTest) th.ms = 0;

      //skiped => done
      if (th.getSkiped()) {
        th.exCount = 0;
        th.each<courseNode>(it=> { it.refreshNumbers(true); th.exCount += it.exCount; });
        th.skipedCount = th.exCount; th.isSkiped = true; return;
      }

      //agregate childs
      _.each(th.Items,(it: courseNode) => {
        it.refreshNumbers(exCountOnly); //refresh childs
        th.exCount += it.exCount;
        if (exCountOnly) return;
        th.skipedCount += it.skipedCount; if (it.getSkiped()) return;
        th.complPassiveCnt += it.complPassiveCnt; th.complNotPassiveCnt += it.complNotPassiveCnt;
        th.elapsed += it.elapsed;
        //if (it.ms >= 0) th.ms += it.ms; //zaporne score => nevyhodnotitelne
        if (!it.s) it.s = 0;
        //29.4.2015, osetreni starych cviceni. Pro nadrazene uzly jsou spravne tehdy, kdyz je score vetsi nez 0.75%
        if (CourseMeta.isType(it, runtimeType.ex)) {
          if (it.complNotPassiveCnt == 1) { //aktivni cviceni
            //var e = <exImpl>it;
            //if (e.isOldEa)
            //  th.s += e.isOldEaPassive ? 0 : (e.ms && e.s / e.ms > 0.75 ? 1 : 0);
            //else
            th.s += it.s;
            if (!isTest) th.ms += it.ms;
          }
        } else {
          th.s += it.s;
          if (!isTest) th.ms += it.ms;
        }
        th.flag |= it.flag;
        th.beg = setDate(th.beg, it.beg, true); th.end = setDate(th.end, it.end, false);
      });
      if (exCountOnly) return;
      if (th.skipedCount > 0 && th.skipedCount == th.exCount) { th.isSkiped = true; return; } //all child skiped => return
      if (th.complNotPassiveCnt + th.complPassiveCnt + th.skipedCount == th.exCount) th.done = true;
      //if (th.complNotPassiveCnt == 0 && th.complPassiveCnt > 0) th.score = -1;
      //else if (th.complNotPassiveCnt > 0) th.score = Math.round(th.score / th.complNotPassiveCnt);
    }

    availableActions(): NodeAction[] {
      if (this.isSkiped) return NodeAction.createActions(this, nodeAction.unskip);
      return this.done ?
        NodeAction.createActions(this, nodeAction.browse, this.complNotPassiveCnt + this.complPassiveCnt > 0 ? nodeAction.reset : nodeAction.no, nodeAction.skip) :
        NodeAction.createActions(this, greenArrowDict[this.url] ? nodeAction.run : nodeAction.browse, this.complNotPassiveCnt + this.complPassiveCnt > 0 ? nodeAction.reset : nodeAction.no, nodeAction.skip);
    }

    //dostupne akce nad node 
    onAction(type: nodeAction): void {
      switch (type) {
        case nodeAction.browse:
        case nodeAction.run: gui.gotoData(this); break;
        case nodeAction.skip: this.setSkiped(true, true); break;
        case nodeAction.unskip: this.setSkiped(false, true); break;
        case nodeAction.reset:
          //majdi all a resetable urls
          var resetableUrls = []; var allUrls = [];
          scan(this,(it: any) => { allUrls.push(it.url); if (!it.doReset) return; if (it.doReset()) resetableUrls.push(it.url); });
          //vlastni reset funkce
          var resetProc = () => lib.actPersistence().resetExs(schools.LMComUserId(), actCompanyId, actProduct.url, resetableUrls, gui.onReload);
          //vyrad je ze skiped a volej resetProc
          var skiped = this.getSkipedTable(false);
          if (skiped.allSkiped) {
            var changed = false; _.each(allUrls, u => { delete skiped.allSkiped[u]; changed = true; });
            if (changed) { skiped.userPending = true; lib.saveProduct(resetProc); } else resetProc();
          } else
            resetProc();
          break;
        case nodeAction.runTestAgain:
          break;
        case nodeAction.cancelTestSkip:
          break;
      }
    }

    //aplikuj x vrat user data
    userPending: boolean; //priznak zmeny uzivatelskych dat
    setUserData(data: Object): void { }
    getUserData(setData: (short: string, long: string, flag: CourseModel.CourseDataFlag, key: string) => void): void { }

    expandDynamic(completed: () => void) { if (completed) completed(); }

  }

  export class skipAbleRoot extends courseNode {
    allSkiped: { [name: string]: boolean }; //pro test nevyuzito
    setUserData(data: Object): void {
      this.allSkiped = <any>data; if (!this.allSkiped) this.allSkiped = {};
    }
    getUserData(setData: (short: string, long: string, flag: CourseModel.CourseDataFlag, key: string) => void): void {
      setData(JSON.stringify(this.allSkiped), null, CourseModel.CourseDataFlag.skipAbleRoot, null);
    }
    doReset(): boolean { if (!this.allSkiped) return false; delete this.allSkiped; return true; }
  }

  export class multiTaskImpl extends courseNode {
    iconId(): string { return 'th'; }
  }

  export class modImpl extends courseNode {
    dict: schools.Dict;
    iconId(): string { return 'book'; }
    loc: { [id: string]: any };
    oldItems: Array<dataImpl>;
    setUserData(data: Object): void {
      this.adjustSitemap(<Array<string>> data);
    }
    adjustSitemap(urls: string[]) {
      this.oldItems = this.Items;
      var exDir: { [id: string]: exImpl; } = {};
      scan(this,(e: exImpl) => { if (!isType(e, runtimeType.ex)) return; exDir[e.url] = e; });
      this.Items = _.map(urls, url => { var e = exDir[url]; e.parent = this; actProduct.allNodes[e.url] = e; return e; });
      this.ms = 0;
      this.each<exImpl>(e => {
        //if (e.isOldEa)
        //  //this.ms += e.isOldEaPassive ? 0 : 1;
        //  throw 'oldEA exercise cannot be in test'; //pz 30.4.2015
        //else
          this.ms += e.ms;
        e.testMode = CSLocalize('b8601c3b0385401b912f5f104b8d728e', 'Test');
      });
    }
    getUserData(setData: (short: string, long: string, flag: CourseModel.CourseDataFlag, key: string) => void): void {
      setData(JSON.stringify(_.map(this.Items, it => it.url)), null, CourseModel.CourseDataFlag.modImpl, null);
    }
    onUnloadMod() { this.dict = null; this.loc = null; }

    doReset(): boolean { if (!this.oldItems) return false; this.Items = this.oldItems; delete this.oldItems; return true; }

    expandDynamic(): boolean {
      if (this.Items == null) return false;
      var taskGroups = _.filter(this.Items, it => isType(it, runtimeType.testTaskGroup));
      if (taskGroups.length != this.Items.length) return false;
      //var dynData = this.getDynamic(); if (!dynData) return false;
      var urls = _.flatten(_.map(<any>taskGroups,(grp: testTaskGroup) => _.sample(_.map(grp.Items, e => e.url), cfg.testGroup_debug ? 1 : grp.take)));
      this.adjustSitemap(urls);
      this.userPending = true;
      return true;
    }

    refreshNumbers(exCountOnly: boolean = false) {
      var th = this;
      var dynData = th.getDynamic();
      if (dynData) {
        th.complPassiveCnt = th.complNotPassiveCnt = th.s = th.beg = th.end = th.elapsed = th.skipedCount = th.exCount = 0; th.done = th.isSkiped = false;
        //_.each(dynData.groups, g => th.exCount += cfg.testGroup_debug ? 1 : g.take);
        _.each(dynData.Items,(g: testTaskGroup) => th.exCount += cfg.testGroup_debug ? 1 : g.take);
        if (th.getSkiped()) {
          th.isSkiped = true;
          th.skipedCount = th.exCount;
        }
      } else
        courseNode.doRefreshNumbers(th, exCountOnly);
    }

    getDynamic(): dynamicModuleData {
      var dynData: dynamicModuleData = <any>(this.Items ? this.Items[0] : null);
      return dynData && isType(dynData, runtimeType.dynamicModuleData) ? dynData : null;
    }

  }

  function setDate(dt1: number, dt2: number, min: boolean): number {
    if (!dt1) return dt2; if (!dt2) return dt1;
    if (min) return dt2 > dt1 ? dt1 : dt2;
    else return dt2 < dt1 ? dt1 : dt2;
  }

  export class exImpl extends courseNode implements IExUser, ex {
    testMode: string; //titulek a zaroven priznak Testu (testMode!=null). Dynamicke testy maji vzdy Test. 
    //inPlacePage: CourseModel.body;
    page: Course.Page; // CourseModel.body; //staticka data stranky
    evaluator: IScoreProvider; //evaluator: budto stranka (nove EA) nebo evalRoot (stare EA)
    startTime: number; //datum vstupu do stranky
    flag: CourseModel.CourseDataFlag = 0;
    result: { [exId: string]: CourseModel.Result; }; //data jednotlivych kontrolek
    designForceEval: boolean;
    //isOldEa: boolean;
    //isOldEaPassive: boolean;
    //ms: number;
    iconId(): string {
      if ((this.parent.type & (runtimeType.taskTestInCourse | runtimeType.taskTestSkill | runtimeType.taskPretestTask)) != 0) return 'puzzle-piece';
      if (this.findParent(it => isType(it, runtimeType.grammar))) return 'file-o';
      return 'edit';
    }

    doReset(): boolean {
      var th = this;
      if (!th.result && !th.done) return false;
      delete th.done; delete th.s; delete th.beg; delete th.end; delete th.elapsed;
      th.onUnloadEx();
      return true;
    }

    refreshNumbers(exCountOnly: boolean = false) { //pred refresh musi byt vyplnena data z IExUser (vcetne vysledku cviceni)
      var th = this;
      if (exCountOnly) { th.exCount = 1; return; }
      th.complPassiveCnt = th.complNotPassiveCnt = th.skipedCount = 0; th.exCount = 1; th.isSkiped = false; if (!th.elapsed) th.elapsed = 0;
      if (th.getSkiped()) { th.skipedCount = 1; th.isSkiped = true; return; } //skiped => done
      if (th.done)
        if (!th.ms) th.complPassiveCnt = 1; else th.complNotPassiveCnt = 1;
    }
    onUnloadEx() { delete this.page; delete this.result; delete this.evaluator; }
    setUserData(user: IExUser): void {
      exImpl.asignResult(user, this);
    }
    getUserData(setData: (short: string, long: string, flag: CourseModel.CourseDataFlag, key: string) => void): void {
      var res: IExUser = <any>{};
      exImpl.asignResult(this, res);
      if (this.done) res.flag |= CourseModel.CourseDataFlag.done;
      if (this.complPassiveCnt == 1) res.flag |= CourseModel.CourseDataFlag.passive;
      var flag = CourseModel.CourseDataFlag.ex;
      if (this.parent && isType(this.parent, CourseMeta.runtimeType.taskTestSkill)) flag |= CourseModel.CourseDataFlag.testEx;
      setData(JSON.stringify(res), JSON.stringify(this.result), res.flag | flag, null);
    }

    onSetPage(page: Course.Page, result: { [exId: string]: CourseModel.Result; }) {
      this.page = page; if (!result) result = {}; this.result = result;
      if (page.evalPage && !page.isOldEa) this.ms = page.evalPage.maxScore; //
      //if (page.evalPage) this.ms = page.isOldEa && !page.oldEaIsPassive ? 1 : page.evalPage.maxScore;
      //if (!page.isOldEa) page.isPassive = !CourseModel.find(page, data => data._tg && CourseModel.hasStatus(data, CourseModel.tgSt.isEval)); //pasivni cviceni nema zadne kontrolky
    }
    setStartTime() {
      this.startTime = new Date().getTime(); if (!this.beg) this.beg = Utils.dayToInt(new Date());
    }

    static asignResult(from: IExUser, to: IExUser): void { to.beg = from.beg; to.elapsed = from.elapsed; to.end = from.end; to.ms = from.ms; to.s = from.s; to.done = from.done; to.flag = from.flag; }

    findGreenEx(): findGreenExResult {
      var th = this;
      if (th.isSkiped) return null;
      var selfIdx = _.indexOf(th.parent.Items, this);
      var parentCount = 0; th.parent.each<courseNode>(nd => { if (nd.isSkiped || !isType(nd, runtimeType.ex)) return; parentCount++; });
      var notSkipIdx = 0; th.parent.find<courseNode, courseNode>(nd => { if (!nd.isSkiped) notSkipIdx++; return nd == th; });
      var idxFrom = ' (' + notSkipIdx.toString() + '/' + parentCount.toString() + ')';
      var res: findGreenExResult = { grEx: this, info: new greenArrowInfo(CSLocalize('4f40988151d646308e50bf2225211081', 'Continue'), false, 'success', 'hand-o-right',() => gui.gotoData(this)) };

      if (!th.page) return res; //pripad, kdy je cviceni na rade ale jsem na jine strance, tudiz jeste neni naladovano};

      var lastInMod: boolean; var nextEx = null;

      //dalsi cviceni stejneho parenta
      for (var i = selfIdx + 1; i < this.parent.Items.length; i++) {
        var it = <exImpl>(this.parent.Items[i]);
        if (isType(it, runtimeType.ex) && !it.isSkiped) { nextEx = it; break; }
      }
      lastInMod = nextEx == null;

      //jdi na dalsi node
      var nd = lastInMod && !th.testMode ? th.parent : nextEx; //nd je null pro posledni polozku testu
      //var gotoData = () => gui.gotoData(nd);

      if (actNode != this) { //nejsem na cviceni
        res.info.title = CSLocalize('9a48bff2169240759d9e5b1c87618c1b', 'Continue');
        res.info.greenClick = () => gui.gotoData(th);
      } else if (!th.testMode && !th.page.isPassivePage() && !th.done) { //aktivni cviceni, nikoliv vsak test
        res.info.title = actNode == this ? CSLocalize('0b129b06c25b49908cd4576008025495', 'Evaluate') + idxFrom : CSLocalize('89024e890690456aaaf0251de3225fd6', 'Continue');
        res.info.greenClick = () => { //vyhodnot uzel bez doRefresh roundtrip
          if (this.evaluate()) {
            lib.saveProduct(() => {
              actCourseRoot.refreshNumbers();
              //if (cfg.target == LMComLib.Targets.scorm) {
              //  scorm.reportProgress(actCourseRoot.elapsed, actCourseRoot.done ? (actCourseRoot.complNotPassiveCnt == 0 ? 100 : Math.round(actCourseRoot.score / actCourseRoot.complNotPassiveCnt)) : null);
              //}
              var inf = th.findGreenEx().info; inf.css = greenCss(); lib.fillArrowInfo(inf); refreshExerciseBar(th);
            });
          }
        };
      } else { //pasivni cviceni nebo test cviceni
        res.info.title = (th.testMode ? th.testMode : (lastInMod ? CSLocalize('d874aa91bc914690ad75fe97a707e196', 'Completed') : CSLocalize('ba88aabeae6d4d59b235c927472c6440', 'Next'))) + idxFrom;
        if (!th.testMode && lastInMod) res.info.iconId = 'th-list';
        res.info.greenClick = () => {
          if (!th.done) {
            if (this.evaluate()) {
              //if (cfg.target == LMComLib.Targets.scorm) {
              //  actCourseRoot.refreshNumbers();
              //  scorm.reportProgress(actCourseRoot.elapsed, actCourseRoot.done ? (actCourseRoot.complNotPassiveCnt == 0 ? 100 : Math.round(actCourseRoot.score / actCourseRoot.complNotPassiveCnt)) : null);
              //}
              lib.saveProduct(() => gui.gotoData(nd));
            }
          } else {
            //human eval pro kurzy, zatim se asi nepouziva, pouzije se jen 'gui.gotoData(nd)'
            var humanEval = Course.humanEvalControlImpl.useEvalForms(th);
            if (humanEval === undefined) //no human eval
              gui.gotoData(nd)
            else if (humanEval == true) //human eval, ok
              lib.saveProduct(() => gui.gotoData(nd));
            else //human eval, wrong validation
              return;
          }
        };
      }
      return res;
    }

    evaluate(): boolean {
      //aktualizace casu na konci cviceni
      var now = new Date().getTime();
      var delta = Math.min(exImpl.maxDelta, Math.round((now - this.startTime) / 1000));
      if (!this.elapsed) this.elapsed = 0;
      this.elapsed += delta;
      this.end = Utils.dayToInt(new Date());
      this.userPending = true;
      
      //pasivni
      if (this.page.isPassivePage()) {
        this.page.processReadOnlyEtc(true, true); //readonly a skipable controls
        this.done = true;
        return true;
      }
      //zjisteni score
      this.evaluator.provideData(this.result);
      var score = this.evaluator.getScore();
      if (!score) { debugger; throw "!score"; /*this.page.isPassive = true;*/ this.done = true; return true; }
      //cviceni je mozne vyhodnotit
      var exerciseOK = this.testMode ? true : (score == null || score.ms == 0 || (score.s / score.ms * 100) >= 75);
      if (!exerciseOK && !gui.alert(alerts.exTooManyErrors, true)) { this.userPending = false; return false; }//je hodne chyb a uzivatel chce cviceni znova
      this.page.processReadOnlyEtc(true, true); //readonly a skipable controls
      if (!this.testMode) this.evaluator.acceptData(true, this.result);
      this.done = true;
      if (this.page.isOldEa) this.ms = score.ms; else if (this.ms != score.ms) { debugger; throw "this.maxScore != score.ms"; }
      this.s = score.s;
      this.flag = score.flag;
      return true;
    }

    testEvaluate() {
      this.evaluator.provideData(this.result);
      this.userPending = true;
      var score = this.evaluator.getScore();
      this.done = true;
      if (this.ms != score.ms) { debugger; throw "this.maxScore != score.ms"; }
      this.s = score.s;
      this.flag = score.flag;
    }

    static maxDelta = 10 * 60; //10 minut

    reset(): void {
      if (!this.done) return;
      this.done = false;
      if (!this.page.isPassivePage()) this.evaluator.resetData(this.result);
      this.userPending = true;
      saveAndReload();
    }
  }

  export class grammEx extends exImpl {
    idx: number;
    prev: grammEx;
    next: grammEx;
  }

  export class courseImpl extends courseNode {
  }

  export class courseTestImpl extends modImpl {
  }

  export enum taskPretestStatus {
    questionaries = 0,
    firstTest = 1,
    lastTest = 2,
    done = 3,
  }
  export interface taskPretestResult {
    pretestStatus: taskPretestStatus;
    firstTestIdx: number;
    lastTestIdx: number;
  }

  export interface findGreenExResult {
    grEx: exImpl;
    info: greenArrowInfo;
  }

  export class pretestTaskImpl extends modImpl {
  }

  export class pretestImpl extends courseNode {
    //odovozena data
    questionnaire: exImpl;
    result: exImpl;
    pretests: Array<pretestTaskImpl>;
    //result
    pretestStatus: taskPretestStatus;
    firstTestIdx: number;
    lastTestIdx: number;

    iconId() { return 'puzzle-piece'; }
    showProgress(): boolean { return false; }

    doReset(): boolean { var th = this; if (!th.pretestStatus) return false; delete th.pretestStatus; delete th.firstTestIdx; delete th.lastTestIdx; delete th.questionnaire; return true; }

    initFields() {
      if (this.questionnaire) return;
      if (!this.pretestStatus) this.pretestStatus = taskPretestStatus.questionaries;
      this.questionnaire = findDeep<exImpl, dataImpl>(this, it => it.name == 'questionnaire');
      this.result = findDeep<exImpl, dataImpl>(this, it => it.name == 'result');
      this.pretests = [];
      this.each<pretestTaskImpl>(it => { if (isType(it, runtimeType.taskPretestTask)) this.pretests.push(it); });
    }

    findGreenEx(): findGreenExResult {
      var th = this;
      return th.pretestStatus == taskPretestStatus.done ? null : { grEx: <any>this, info: new greenArrowInfo('Pretest', false, 'success', 'hand-o-right',() => gui.gotoData(this)) };
    }

    pretestContinue(): void {
      var th = this;
      if (actEx != th.actPretestEx()) throw 'actEx != th.actPretestEx()';
      th.initFields(); var nextEx: exImpl;
      switch (th.pretestStatus) {
        case taskPretestStatus.questionaries:
          actEx.evaluate(); actCourseRoot.refreshNumbers();
          //zpracuj dotaznik
          //TODO
          th.firstTestIdx = 0; th.pretestStatus = taskPretestStatus.firstTest; th.userPending = true;
          nextEx = lib.findGreenExLow(th.pretests[th.firstTestIdx]);
          break;
        case taskPretestStatus.firstTest:
          actEx.evaluate(); actCourseRoot.refreshNumbers();
          nextEx = lib.findGreenExLow(th.pretests[th.firstTestIdx]);
          if (!nextEx) {
            //zpracuj prvni pretest
            //TODO
            th.lastTestIdx = 1; th.pretestStatus = taskPretestStatus.lastTest; th.userPending = true;
            nextEx = lib.findGreenExLow(th.pretests[th.lastTestIdx]);
          }
          break;
        case taskPretestStatus.lastTest:
          actEx.evaluate(); actCourseRoot.refreshNumbers();
          nextEx = lib.findGreenExLow(th.pretests[th.lastTestIdx]);
          if (!nextEx) {
            //zpracuj druhy pretest
            //TODO
            th.pretestStatus = taskPretestStatus.done; th.userPending = true;
            nextEx = th.result;
          }
          break;
        case taskPretestStatus.done:
          break;
      }
      lib.saveProduct(() => {
        if (nextEx)
          lib.adjustEx(nextEx,() =>
            lib.displayEx(nextEx, ex => Pager.clearHtml(), null));
        else
          gui.gotoData(null);
      });
    }

    actPretestEx(): exImpl {
      var th = this; th.initFields();
      switch (th.pretestStatus) {
        case taskPretestStatus.questionaries: return th.questionnaire;
        case taskPretestStatus.firstTest: return lib.findGreenExLow(th.pretests[th.firstTestIdx]);
        case taskPretestStatus.lastTest: return lib.findGreenExLow(th.pretests[th.lastTestIdx]);
        default: return th.result;
      }
    }

    initModel(): findGreenExResult {
      var th = this; var ex = th.actPretestEx();
      var res = { grEx: ex, info: null };
      if (actCourseRoot.done) res.info = lib.info_courseFinished();
      else if (ex == th.result) res.info = lib.info_continue();
      else res.info = new greenArrowInfo('Pretest', false, 'success', 'hand-o-right',() => th.pretestContinue());
      return res;
    }

    refreshNumbers(exCountOnly: boolean = false) { //do items nasimuluje aktualni pretest parts
      var th = this;
      th.initFields();
      var tempItems = th.Items;
      th.Items = [];
      th.Items.push(th.questionnaire);
      if (th.pretestStatus > taskPretestStatus.questionaries) th.Items.push(th.pretests[th.firstTestIdx]);
      if (th.pretestStatus > taskPretestStatus.firstTest) th.Items.push(th.pretests[th.lastTestIdx]);
      courseNode.doRefreshNumbers(th, exCountOnly);
      th.Items = tempItems;
    }

    setUserData(user: taskPretestResult): void {
      pretestImpl.asignResult(user, this);
    }
    getUserData(setData: (short: string, long: string, flag: CourseModel.CourseDataFlag, key: string) => void): void {
      var res: taskPretestResult = <any>{};
      pretestImpl.asignResult(this, res);
      setData(JSON.stringify(res), null, CourseModel.CourseDataFlag.pretestImp, null);
    }
    static asignResult(from: taskPretestResult, to: taskPretestResult): void { to.pretestStatus = from.pretestStatus; to.firstTestIdx = from.firstTestIdx; to.lastTestIdx = from.lastTestIdx; }

  }

} 