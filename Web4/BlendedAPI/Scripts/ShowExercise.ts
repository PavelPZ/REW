module blended {

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

  rootModule
    .directive('showExercise', ['$stateParams', ($stateParams: blended.learnContext) => new showExerciseModel($stateParams)])
  ;
  //export var showExerciseDirective2 = ['$stateParams', ($stateParams: blended.learnContext) => new showExerciseModel($stateParams)];

  export class showExerciseModel {
    constructor(public $stateParams: blended.learnContext) { }
    link: (scope: ng.IScope, el: ng.IAugmentedJQuery, attrs: ng.IAttributes) => void = (scope, el, attrs) => {

      scope.$on('$destroy', (ev) => this.exerciseService.destroy(el));

      //nalezni exerciseService
      var sc = scope;
      while (sc && !sc['exerciseService']) sc = sc.$parent;
      if (!sc) return;
      this.exerciseService = <exerciseService>(sc['exerciseService']);
      this.exerciseService.display(el, $.noop);
    };
    exerciseService: exerciseService;
  }

  export function scorePercent(sc: IExShort) { return sc.ms == 0 ? -1 : Math.round(sc.s / sc.ms * 100); }

  export function agregateChildShortInfos(node: CourseMeta.data, taskId: string, moduleAlowFinishWhenUndone:boolean): IExShort {
    var res: IExShort = $.extend({}, shortDefault);
    res.done = true;
    _.each(node.Items, nd => {
      var us = getPersistWrapper<IExShort>(nd, taskId);
      var done = us && us.short.done;
      res.done = res.done && done;
      if (nd.ms) { //aktivni cviceni (se skore)
        if (done) { //hotove cviceni, zapocitej vzdy
          res.ms += nd.ms; res.s += us.short.s;
        } else if (moduleAlowFinishWhenUndone) { //nehotove cviceni, zapocitej pouze kdyz je includeUndone (napr. pro test)
          res.ms += nd.ms;
        }
      }
      if (us) { //elapsed, beg a end zapocitej vzdy
        res.beg = setDate(res.beg, us.short.beg, true); res.end = setDate(res.end, us.short.end, false);
        res.elapsed += us.short.elapsed;
      }
    })
    return res;
  }
  var shortDefault: IExShort = { elapsed: 0, beg: Utils.nowToNum(), end: Utils.nowToNum(), done: false, ms: 0, s: 0 };
  function setDate(dt1: number, dt2: number, min: boolean): number { if (!dt1) return dt2; if (!dt2) return dt1; if (min) return dt2 > dt1 ? dt1 : dt2; else return dt2 < dt1 ? dt1 : dt2; }

  //long persistent informace o cviceni
  export interface IExLong { [exId: string]: CourseModel.Result; }

  export interface IPageTask {
    isTest: boolean;
    page: Course.Page;
    startTime: number; //datum vstupu do stranky
    user: IPersistNodeItem<IExShort>;
  }

  export class exerciseService {

    page: Course.Page;
    user: IPersistNodeItem<IExShort>;
    startTime: number; //datum vstupu do stranky
    instructionData: IInstructionData;

    constructor(public exercise: cacheExercise, long: IExLong, public ctx: learnContext, public product: IProductEx, public exerciseIsTest: boolean) {
      this.user = getPersistWrapper<IExShort>(exercise.dataNode, ctx.taskid, () => $.extend({}, shortDefault));
      if (!long) {
        long = {}; this.user.modified = true;
      }
      this.user.long = long
      this.startTime = Utils.nowToNum();

    }

    display(el: ng.IAugmentedJQuery, completed: (pg: Course.Page) => void) {
      el.addClass('contentHidden');

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
            if (this.exerciseIsTest && this.user.short.done) this.user.short.done = false; //test cviceni nesmi byt videt vyhodnocene
            pg.acceptData(this.user.short.done, exImpl.result);
            el.removeClass('contentHidden');
            completed(pg);
          });
        });
      });
    }

    destroy(el: ng.IAugmentedJQuery) {
      if (!this.user.short.done) {
        if (this.exerciseIsTest) {
          el.addClass('contentHidden');
          this.evaluate(true);
        } else
          this.page.provideData(); //prevzeti poslednich dat z kontrolek cviceni
      }
      this.product.saveProduct(this.ctx, () => { //ulozeni vysledku do DB
        //uklid
        if (this.page.sndPage) this.page.sndPage.htmlClearing();
        if (this.page.sndPage) this.page.sndPage.leave();
        ko.cleanNode(el[0]);
        el.html('');
        delete (<CourseMeta.exImpl>(this.exercise.dataNode)).result;
        delete this.user.long;
      });
    }

    evaluate(isTest: boolean, exerciseShowWarningPercent?: number): boolean {
      if (this.user.short.done) return false;
      this.user.modified = true;
      var now = Utils.nowToNum();
      var short = this.user.short;
      var delta = Math.min(maxDelta, Math.round(now - this.startTime));
      if (!short.elapsed) short.elapsed = 0;
      short.elapsed += delta;
      short.end = Utils.dayToInt(new Date());

      //pasivni stranka
      if (this.page.isPassivePage()) {
        this.page.processReadOnlyEtc(true, true); //readonly a skipable controls
        short.done = true;
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
      return true;
    }
  }
  var maxDelta = 10 * 60; //10 minut

  //***************** EXERCISE $scope.ts, vznika pri kazdem cviceni 
  export interface IExShort extends IPersistNodeUser { //course dato pro test
    done: boolean;
    ms: number;
    s: number;
    elapsed: number; //straveny cas ve vterinach
    beg: number; //datum zacatku, ve dnech
    end: number; //datum konce (ve dnech), na datum se prevede pomoci intToDate(end * 1000000)
  }

  //export interface IExerciseStateData {
  //  isTest: boolean; //test nebo cviceni
  //}

  export class exItemProxy {
    title: string; //titulek
    user: IExShort; //short data
    idx: number; //index v modulu
    active: boolean; //item pro aktivni cviceni
  }

  export class exerciseTaskViewController extends taskController { //task pro pruchod lekcemi

    exService: exerciseService;

    title: string;
    modItems: Array<exItemProxy>; //info o vsech cvicenich modulu
    modIdx: number; //self index v modulu
    breadcrumb: Array<breadcrumbItem>;

    justEvaluated: boolean; //nepersistentni stavova promenna, ridici zobrazeni cviceni po vyhodnoceni

    constructor(state: IStateService, resolves: Array<any>) {
      super(state);
      if (state.createMode != createControllerModes.navigate) return;

      this.exService = new exerciseService(<cacheExercise>(resolves[0]), <blended.IExLong>(resolves[1]), this.ctx, this.taskRoot().dataNode, this.state.exerciseIsTest);
      state.$scope['exerciseService'] = this.exService;

      this.user = this.exService.user;

      this.title = this.dataNode.title;
      this.modIdx = _.indexOf(this.parent.dataNode.Items, this.dataNode);
      this.modItems = _.map(this.parent.dataNode.Items, (node, idx) => {
        return { user: blended.getPersistData<IExShort>(node, this.ctx.taskid), idx: idx, title: node.title, active: idx == this.modIdx };
      });

    }

    //osetreni zelene sipky
    moveForward(): moveForwardResult {
      if (this.justEvaluated) { delete this.justEvaluated; return moveForwardResult.toParent; }
      this.justEvaluated = this.exService.evaluate(this.state.exerciseIsTest, this.state.exerciseShowWarningPercent);
      return this.justEvaluated && !this.state.exerciseIsTest ? moveForwardResult.selfInnner : moveForwardResult.toParent;
    }
    //provede reset cviceni, napr. v panelu s instrukci
    resetExercise() { alert('reset'); } 
    //skok na jine cviceni, napr. v module map panelu 
    selectExercise(idx: number) {
      if (idx == this.modIdx) return;
      var exNode = this.dataNode.parent.Items[idx];
      var ctx = cloneAndModifyContext(this.ctx, c => c.url = encodeUrl(exNode.url));
      this.navigate({ stateName: this.state.name, pars: ctx });
    }

    //wrapper kolem selectOtherExercise, aby sla funkce vlozit jako atribut do direktivy, napr:
    //V nadrazenem html: <div selectexercise="::ts.selectOtherExerciseWrapper()">
    //V direktiv kodu: scope = { selectExercise:'&selectexercise' };
    //V direktiv html: ng-click="selectExercise()(it.idx)
    selectExerciseWrapper() { var self = this; return idx => self.selectExercise(idx); }
    resetExerciseWrapper() { var self = this; return () => self.resetExercise(); }
  }

  export interface IInstructionData { title: string; body: string; }
}
