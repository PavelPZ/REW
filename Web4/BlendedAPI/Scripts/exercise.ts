module blended {

  export interface IExShort extends IPersistNodeUser { //course dato pro test
    done: boolean;
    ms: number;
    s: number;
    elapsed: number; //straveny cas ve vterinach
    beg: number; //datum zacatku, ve dnech
    end: number; //datum konce (ve dnech), na datum se prevede pomoci intToDate(end * 1000000)
    count?: number; //pro agregaci: pocet zahrnutych cviceni
    sumPlay?: number; //prehrany nas zvuk (sec)
    sumRecord?: number; //nahrany zvuk  (sec)
    sumPlayRecord?: number; //prehrano nahravek (sec)
  }

  export var loadEx = ['$stateParams', ($stateParams: blended.learnContext) => {
    blended.finishContext($stateParams);
    return blended.loader.adjustEx($stateParams);
  }];

  export var loadLongData = ['$stateParams', (ctx: blended.learnContext) => {
    blended.finishContext(ctx);
    var def = ctx.$q.defer<IExLong>();
    proxies.vyzva57services.getLongData(ctx.companyid, ctx.userDataId(), ctx.productUrl, ctx.taskid, ctx.Url, long => {
      var res = JSON.parse(long);
      def.resolve(res);
    });
    return def.promise;
  }];

  export class showExerciseModel {
    constructor(public $stateParams: blended.learnContext) { }
    link: (scope, el: ng.IAugmentedJQuery, attrs: ng.IAttributes) => void = (scope, el, attrs) => {
      var exService: exerciseService = scope.exService()
      scope.$on('$destroy', (ev) => exService.onDestroy(el));
      exService.onDisplay(el, $.noop);
    };
    scope = { exService: '&exService' }
  }
  rootModule
    .directive('showExercise', ['$stateParams', ($stateParams: blended.learnContext) => new showExerciseModel($stateParams)])
  ;

  export function scorePercent(sc: IExShort) { return sc.ms == 0 ? -1 : Math.round(sc.s / sc.ms * 100); }
  export function scoreText(sc: IExShort) { var pr = scorePercent(sc); return pr < 0 ? '' : pr.toString() + '%'; }

  export function agregateShorts(shorts: Array<IExShort>): IExShort {
    var res: IExShort = $.extend({}, shortDefault);
    res.done = true;
    _.each(shorts, short => {
      if (!short) { res.done = false; return; }
      var done = short.done;
      res.done = res.done && done;
      res.count += short.count || 1;
      if (done) { //zapocitej hotove cviceni
        res.ms += short.ms || 0; res.s += short.s || 0;
      }
      //elapsed, beg a end
      res.beg = setDate(res.beg, short.beg, true); res.end = setDate(res.end, short.end, false);
      res.elapsed += short.elapsed || 0;
    });
    return res;
  }
  export function agregateShortFromNodes(node: CourseMeta.data, taskId: string, moduleAlowFinishWhenUndone: boolean): IExShort {
    var res: IExShort = $.extend({}, shortDefault);
    res.done = true;
    _.each(node.Items, nd => {
      if (!isEx(nd)) return;
      res.count++;
      var us = getPersistWrapper<IExShort>(nd, taskId);
      var done = us && us.short.done;
      res.done = res.done && done;
      if (nd.ms) { //aktivni cviceni (se skore)
        if (done) { //hotove cviceni, zapocitej vzdy
          res.ms += nd.ms; res.s += us.short.s;
        } else if (moduleAlowFinishWhenUndone) { //nehotove cviceni, zapocitej pouze kdyz je moduleAlowFinishWhenUndone (napr. pro test)
          res.ms += nd.ms;
        }
      }
      if (us) { //elapsed, beg a end zapocitej vzdy
        res.beg = setDate(res.beg, us.short.beg, true); res.end = setDate(res.end, us.short.end, false);
        res.elapsed += us.short.elapsed;
        res.sumPlay += us.short.sumPlay; res.sumPlayRecord += us.short.sumPlayRecord; res.sumRecord += us.short.sumRecord;
      }
    })
    return res;
  }
  var shortDefault: IExShort = { elapsed: 0, beg: Utils.nowToNum(), end: Utils.nowToNum(), done: false, ms: 0, s: 0, count: 0, sumPlay: 0, sumPlayRecord: 0, sumRecord: 0 };
  function setDate(dt1: number, dt2: number, min: boolean): number { if (!dt1) return dt2; if (!dt2) return dt1; if (min) return dt2 > dt1 ? dt1 : dt2; else return dt2 < dt1 ? dt1 : dt2; }

  //long persistent informace o cviceni
  export interface IExLong { [exId: string]: CourseModel.Result; }

  export interface IInstructionData { title: string; body: string; }

  export enum exDoneStatus { no, passive, active }

  export class exerciseService {

    page: Course.Page;
    user: IPersistNodeItem<IExShort>;
    startTime: number; //datum vstupu do stranky
    instructionData: IInstructionData;
    exercise: cacheExercise;
    ctx: learnContext;
    product: IProductEx;
    exerciseIsTest: boolean;
    moduleUser: IModuleUser; //short data modulu
    greenArrowRoot: taskController; //manager zelene sipky
    modIdx: number; //index cviceni v modulu
    //model
    doneStatus: exDoneStatus;
    score: number;


    constructor(exercise: cacheExercise, long: IExLong, controller: exerciseTaskViewController) {
      this.exercise = exercise;
      this.ctx = controller.ctx; this.product = controller.taskRoot().dataNode,
      this.exerciseIsTest = controller.state.exerciseIsTest; this.moduleUser = controller.parent.user.short;
      this.user = getPersistWrapper<IExShort>(exercise.dataNode, this.ctx.taskid, () => { var res: IExShort = $.extend({}, shortDefault); res.ms = exercise.dataNode.ms; return res; });
      if (!long) { long = {}; this.user.modified = true; }
      this.user.long = long
      this.startTime = Utils.nowToNum();
      this.modIdx = _.indexOf(controller.parent.exercises, controller.dataNode);
      //greenArrowRoot
      this.greenArrowRoot = controller; while (!this.greenArrowRoot.state.isGreenArrowRoot) this.greenArrowRoot = this.greenArrowRoot.parent;
      this.refresh();
    }

    refresh() {
      this.doneStatus = this.user && this.user.short && this.user.short.done ? (this.user.short.ms ? exDoneStatus.active : exDoneStatus.passive) : exDoneStatus.no;
      this.score = this.doneStatus == exDoneStatus.active ? this.user.short.s / this.user.short.ms * 100 : -1;
    }

    onDisplay(el: ng.IAugmentedJQuery, completed: (pg: Course.Page) => void) {
      //el.addClass('contentHidden');

      var pg = this.page = CourseMeta.extractEx(this.exercise.pageJsonML);
      Course.localize(pg, s => CourseMeta.localizeString(pg.url, s, this.exercise.mod.loc));
      var isGramm = CourseMeta.isType(this.exercise.dataNode, CourseMeta.runtimeType.grammar);
      if (!isGramm) {
        if (pg.evalPage) this.exercise.dataNode.ms = pg.evalPage.maxScore;
      }

      //instrukce
      var instrs = this.product.instructions;
      var instrBody = _.map(pg.instrs, instrUrl => instrs[instrUrl]);
      this.instructionData = { title: pg.instrTitle, body: instrBody.join('') };

      var exImpl = <CourseMeta.exImpl>(this.exercise.dataNode);
      exImpl.page = pg; exImpl.result = this.user.long;

      pg.finishCreatePage(<CourseMeta.exImpl>(this.exercise.dataNode));

      pg.callInitProcs(Course.initPhase.beforeRender, () => { //inicializace kontrolek, 1
        var html = JsRenderTemplateEngine.render("c_gen", pg);
        CourseMeta.actExPageControl = pg; //knockout pro cviceni binduje CourseMeta.actExPageControl
        ko.cleanNode(el[0]);
        el.html('');
        el.html(html);
        ko.applyBindings({}, el[0]);
        pg.callInitProcs(Course.initPhase.afterRender, () => {//inicializace kontrolek, 2
          pg.callInitProcs(Course.initPhase.afterRender2, () => {
            if (this.exerciseIsTest && this.user.short.done && !this.moduleUser.done) {
              this.user.short.done = false; //test cviceni nesmi byt (pro nedokonceny test) videt vyhodnocene
            }
            pg.acceptData(this.user.short.done, exImpl.result);
            //el.removeClass('contentHidden');
            completed(pg);
          });
        });
      });
    }

    onDestroy(el: ng.IAugmentedJQuery) {
      //elapsed
      var now = Utils.nowToNum();
      var delta = Math.min(maxDelta, Math.round(now - this.startTime));
      var short = this.user.short;
      if (!short.elapsed) short.elapsed = 0;
      short.elapsed += delta;
      short.end = Utils.nowToNum();
      this.user.modified = true;

      if (!this.user.short.done) {
        if (this.exerciseIsTest) {
          //el.addClass('contentHidden');
          this.evaluate(true);
        } else
          this.page.provideData(); //prevzeti poslednich dat z kontrolek cviceni
      }
      //this.product.saveProduct(this.ctx, () => { //ulozeni vysledku do DB
      //uklid
      if (this.page.sndPage) this.page.sndPage.htmlClearing();
      if (this.page.sndPage) this.page.sndPage.leave();
      ko.cleanNode(el[0]);
      el.html('');
      delete (<CourseMeta.exImpl>(this.exercise.dataNode)).result;
      delete this.user.long;
      //});
    }

    evaluate(isTest: boolean, exerciseShowWarningPercent?: number): boolean {
      if (this.user.short.done) return false;
      this.user.modified = true;
      var short = this.user.short;

      //pasivni stranka
      if (this.page.isPassivePage()) {
        this.page.processReadOnlyEtc(true, true); //readonly a skipable controls
        short.done = true;
        this.refresh();
        return true;
      }

      if (typeof (exerciseShowWarningPercent) == 'undefined') exerciseShowWarningPercent = 75;
      //aktivni stranka
      this.page.provideData();
      var score = this.page.getScore();
      if (!score) { debugger; throw "!score"; short.done = true; return true; }

      var exerciseOK = isTest ? true : (score == null || score.ms == 0 || (score.s / score.ms * 100) >= exerciseShowWarningPercent);
      //if (!exerciseOK /*&& !gui.alert(alerts.exTooManyErrors, true)*/) return false; //je hodne chyb a uzivatel chce cviceni znova
      this.page.processReadOnlyEtc(true, true); //readonly a skipable controls
      if (!isTest) this.page.acceptData(true);

      short.done = true;
      if (this.exercise.dataNode.ms != score.ms) { debugger; throw "this.maxScore != score.ms"; }
      short.s = score.s;
      this.refresh();
      return true;
    }
  }
  export enum evaluateResult {
    wrongScore, //uzivatel chce cviceni delat znova kvuli spatnemu skore
    passiveEvaluated, //vyhodnoceno pasivni cviceni
    activeEvaluated, //vyhodnoceno aktivni cviceni
    other, //cokoliv jineho
  }
  var maxDelta = 10 * 60; //10 minut

  //***************** EXERCISE controller

  export class exerciseTaskViewController extends taskController { //task pro pruchod lekcemi

    exService: exerciseService;
    modService: moduleService;

    title: string;
    breadcrumb: Array<breadcrumbItem>;
    parent: moduleTaskController;

    justEvaluated: boolean; //nepersistentni stavova promenna, ridici zobrazeni cviceni po vyhodnoceni

    constructor(state: IStateService, resolves: Array<any>) {
      super(state);
      if (state.createMode != createControllerModes.navigate) return;

      this.exService = new exerciseService(<cacheExercise>(resolves[0]), <blended.IExLong>(resolves[1]), this);
      this.modService = new moduleService(this.parent.dataNode, this.exService, this.parent.state.moduleType, this);

      state.$scope['exService'] = this.exService;
      state.$scope['modService'] = this.modService;

      this.user = this.exService.user;

      this.title = this.dataNode.title;
      this.parent.onExerciseLoaded(this.exService.modIdx); //zmena actChildIdx v persistentnich datech modulu

    }

    //osetreni zelene sipky
    moveForward(): moveForwardResult {
      if (this.justEvaluated) { delete this.justEvaluated; return moveForwardResult.toParent; }
      this.justEvaluated = this.exService.evaluate(this.state.exerciseIsTest, this.state.exerciseShowWarningPercent);
      return this.justEvaluated && !this.state.exerciseIsTest ? moveForwardResult.selfInnner : moveForwardResult.toParent;
    }
    //provede reset cviceni, napr. v panelu s instrukci
    resetExercise() { alert('reset'); }

    greenClick() {
      this.exService.greenArrowRoot.navigateAhead();
    }

  }

}
