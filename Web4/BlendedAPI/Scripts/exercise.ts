module blended {

  //********************* INTERFACES 

  export interface ICoursePageExtension { //blended rozsireni COURSE kontrolek
    isTest: boolean;
    lectorMode: boolean;
    recorder: ICpeRecorder;
  }
  //*** Audio Capture Callback
  export interface ICpeRecorder { //callback service z Media.ts
    onRecorder(page: Course.Page, msecs: number);
    onPlayRecorder(page: Course.Page, msecs: number);
    onPlayed(page: Course.Page, msecs: number);
  }

  export interface IExLong { [exId: string]: CourseModel.Result; } //long persistent informace o cviceni

  export interface IInstructionData { title: string; body: string; }

  export enum exDoneStatus { no, passive, active }

  export interface IExShort extends IPersistNodeUser { //course dato pro test
    //CourseModel.Score
    ms: number;
    s: number;
    //CourseMeta.IExUser, ten ma navic done
    elapsed: number; //straveny cas ve vterinach
    beg: number; //datum zacatku, ve dnech
    end: number; //datum konce (ve dnech), na datum se prevede pomoci intToDate(end * 1000000)
    //Other
    sPlay?: number; //prehrany nas zvuk (sec)
    sRec?: number; //nahrany zvuk  (sec)
    sPRec?: number; //prehrano nahravek (sec)
  }

  export interface IExShortAgreg extends IExShort {
    score?: number; //-1 nebo pomer s/ms
    count?: number; //pocet zahrnutych cviceni
    dones?: number; //pocet hotovych cviceni
    finished?: number; //procento hotovych cviceni
    waitForEvaluation?: boolean; //cviceni ceka na vyhodnoceni
    lectorControlTestOK?: boolean; //lektor oznacil kontrolni test jako hotovy
  }

  export interface IEvaluateResult {
    confirmWrongScore?: ng.IPromise<boolean>;
    showResult?: boolean;
  }

  export interface IExerciseScope extends ng.IScope {
    exService: exerciseService;
    modService: moduleService;
  }

  //********************* RESOLVES
  export var loadEx = ['$stateParams', ($stateParams: blended.learnContext) => {
    blended.finishContext($stateParams);
    return blended.loader.adjustEx($stateParams);
  }];

  export var loadLongData = ['$stateParams', (ctx: blended.learnContext) => {
    blended.finishContext(ctx);
    var def = ctx.$q.defer<IExLong>();
    try {
      proxies.vyzva57services.getLongData(ctx.companyid, ctx.userDataId(), ctx.productUrl, ctx.taskid, ctx.Url, long => {
        var res = JSON.parse(long);
        def.resolve(res);
      });
    } finally { return def.promise; }
  }];

  //***************** EXERCISE controller
  export class exerciseTaskViewController extends taskController { //task pro pruchod lekcemi

    exService: exerciseService;
    modService: moduleService;

    title: string;
    breadcrumb: Array<breadcrumbItem>;

    constructor($scope: IExerciseScope | blended.IStateService/*union types*/, $state: angular.ui.IStateService, $loadedEx: cacheExercise, $loadedLongData: IExLong) {
      super($scope, $state);
      this.exParent = this;
      if (this.isFakeCreate) return;

      var modIdx = _.indexOf(this.moduleParent.exercises, this.dataNode);
      this.exService = new exerciseService($loadedEx, $loadedLongData, this, modIdx);//, () => this.confirmWrongScoreDialog());
      this.modService = new moduleService(this.moduleParent.dataNode, this.exService, this.moduleParent.state.moduleType, this);
      this.exService.modService = this.modService;

      var sc = <IExerciseScope>$scope;
      sc.exService = this.exService;
      sc.modService = this.modService;

      this.user = this.exService.user;

      this.title = this.dataNode.title;
      this.moduleParent.onExerciseLoaded(modIdx); //zmena actChildIdx v persistentnich datech modulu

    }
    static $inject = ['$scope', '$state', '$loadedEx', '$loadedLongData'];

    confirmWrongScoreDialog(): ng.IPromise<any> {
      var def = this.ctx.$q.defer<boolean>();
      setTimeout(() => {
        if (confirm('Špatné skore, pokračovat?')) def.resolve(); else def.reject();
      }, 1000);
      return def.promise;
    }

    congratulationDialog(): ng.IPromise<any> {
      var def = this.ctx.$q.defer<boolean>();
      setTimeout(() => {
        alert('Gratulace');
        def.resolve();;
      }, 1000);
      return def.promise;
    }


    //osetreni zelene sipky
    moveForward(sender: exerciseTaskViewController): moveForwardResult {
      var res = this.exService.evaluate(this.moduleParent.state.moduleType != blended.moduleServiceType.lesson, this.state.exerciseShowWarningPercent);
      if (!res.confirmWrongScore) { //neni potreba wrongScore confirmation dialog
        return res.showResult ? moveForwardResult.selfInnner : moveForwardResult.toParent;
      }

      res.confirmWrongScore.then(okScore => {
        if (!okScore) return;
        this.$scope.$apply();
      });
      return moveForwardResult.selfInnner;
    }
    //provede reset cviceni, napr. v panelu s instrukci
    resetExercise() { alert('reset'); }

    greenClick() {
      this.exService.greenArrowRoot.navigateAhead(this);
    }
  }

  //********************* SHOW EXERCISES DIRECTIVE
  export class showExerciseModel {
    constructor(public $stateParams: blended.learnContext) { }
    link: (scope, el: ng.IAugmentedJQuery, attrs: ng.IAttributes) => void = (scope, el, attrs) => {
      var exService: exerciseService = scope.exService()
      //scope.$on('$destroy', ev => exService.onDestroy(el));
      scope.$on('onStateChangeSuccess', ev => exService.onDestroy(el));
      exService.onDisplay(el, $.noop);
    };
    scope = { exService: '&exService' }
  }
  rootModule
    .directive('showExercise', ['$stateParams', ($stateParams: blended.learnContext) => new showExerciseModel($stateParams)])
  ;
  
  //********************* EXERCISE SERVICE
  export class exerciseService implements ICoursePageExtension, ICpeRecorder {

    page: Course.Page;
    user: IPersistNodeItem<IExShort>;
    startTime: number; //datum vstupu do stranky
    instructionData: IInstructionData;
    //exercise: cacheExercise;
    modService: moduleService;
    ctx: learnContext;
    product: IProductEx;
    isTest: boolean; //priznak chovani vnitrku cviceni jako test
    greenArrowRoot: taskController; //manager zelene sipky
    //modul
    //modIdx: number; //index cviceni v modulu
    exType: moduleServiceType; //lekce, test, pretest
    //lector
    lectorMode: boolean; //onbehalfof a hotová celá kapitola (kurz, test nebo lekce)
    lectorCanEvaluateRecording: boolean; //aktivní cvičení a pcCannotEvaluate in flag

    //confirm dialog
    confirmWrongScoreDialog: () => ng.IPromise<any>;

    constructor(public exercise: cacheExercise, public long: IExLong, public controller: exerciseTaskViewController, public modIdx: number) {
      //this.exercise = exercise; this.modIdx = modIdx;
      this.confirmWrongScoreDialog = () => controller.confirmWrongScoreDialog();
      this.ctx = controller.ctx; this.product = controller.productParent.dataNode;
    }

    resetPretest(newLevel: number) { //newLevel<0 => udelej pretest znova
      proxies.vyzva57services.deleteProduct(this.ctx.companyid, this.ctx.userDataId(), this.ctx.productUrl, this.ctx.taskid, () => {
        _.each(this.product.nodeList, it => clearPersistData(it, this.ctx.taskid));
        if (newLevel >= 0) {
          var course = <vyzva.IBlendedCourseRepository>this.product;
          //pretest a prvni pretest item se oznaci DONE. Pak se ukazuje lektorovi moznost opet zmenit pomoci A1 pretest item level
          setPersistData<IPretestUser>(course.pretest, this.ctx.taskid, d=> { d.history = [0]; d.targetLevel = newLevel; d.lectorSetTarget = true; d.flag = CourseModel.CourseDataFlag.blPretest | CourseModel.CourseDataFlag.done });
          setPersistData<IModuleUser>(course.pretest.Items[0], this.ctx.taskid, d=> { d.flag = CourseModel.CourseDataFlag.blPretestItem | CourseModel.CourseDataFlag.done; d.actChildIdx = 0; });
        }
        this.product.saveProduct(this.controller.ctx, () => this.controller.navigate({ stateName: prodStates.home.name, pars: this.ctx }));
      });
    }

    confirmLesson(alow: boolean) { //newLevel<0 => udelej pretest znova
      if (alow) {
        this.saveLectorEvaluation();
        setPersistData<IModuleUser>(this.modService.node, this.ctx.taskid, modUser => modUser.lectorControlTestOK = true);
      } else {
        clearPersistData(this.modService.node, this.ctx.taskid);
        _.each(this.modService.node.Items, it => {
          if (!isEx(it)) return;
          clearPersistData(it, this.ctx.taskid);
        });
      }
      this.product.saveProduct(this.controller.ctx, () => this.controller.navigate({ stateName: prodStates.home.name, pars: this.ctx }));
    }

    //ICoursePageCallback
    onRecorder(page: Course.Page, msecs: number) { if (page != this.page) debugger; this.user.modified = true; if (!this.user.short.sRec) this.user.short.sRec = 0; this.user.short.sRec += Math.round(msecs / 1000); }
    onPlayRecorder(page: Course.Page, msecs: number) { this.user.modified = true; if (!this.user.short.sPRec) this.user.short.sPRec = 0; this.user.short.sPRec += Math.round(msecs / 1000); }
    onPlayed(page: Course.Page, msecs: number) { this.user.modified = true; if (!this.user.short.sPlay) this.user.short.sPlay = 0; this.user.short.sPlay += Math.round(msecs / 1000); }
    recorder: ICpeRecorder;

    saveLectorEvaluation() {
      var humanEvals = _.map<HTMLElement, { ctrl: Course.humanEvalControlImpl; edit: JQuery; }>($('.human-form:visible').toArray(), f => {
        var id = f.id.substr(5);
        return { ctrl: <Course.humanEvalControlImpl>(this.page.tags[f.id.substr(5)]), edit: $('#human-ed-' + id) };
      });
      _.each(humanEvals, ev => {
        this.user.modified = true;
        var val = parseInt(ev.edit.val()); if (!val) val = 0; if (val > 100) val = 100;
        ev.ctrl.result.hPercent = val / 100 * ev.ctrl.scoreWeight;
        ev.ctrl.result.flag &= ~CourseModel.CourseDataFlag.needsEval;
        ev.ctrl.setScore();
      })
      var score = this.page.getScore();
      this.user.short.s = score.s;
      this.user.short.flag = Course.setAgregateFlag(this.user.short.flag, score.flag);
    }

    score(): number {
      return blended.scorePercent(this.user.short);
    }

    onDisplay(el: ng.IAugmentedJQuery, completed: (pg: Course.Page) => void) {
      this.exType = this.modService.lessonType;
      this.isTest = this.exType != blended.moduleServiceType.lesson;
      this.user = getPersistWrapper<IExShort>(this.exercise.dataNode, this.ctx.taskid, () => {
        var res: IExShort = $.extend({}, shortDefault);
        res.ms = this.exercise.dataNode.ms;
        res.flag = CourseModel.CourseDataFlag.ex;
        if (this.controller.pretestParent) res.flag |= CourseModel.CourseDataFlag.blPretestEx;
        else if (this.isTest) res.flag |= CourseModel.CourseDataFlag.testEx;
        return res;
      });
      if (!this.long) { this.long = {}; this.user.modified = true; }
      this.user.long = this.long
      this.startTime = Utils.nowToNum();
      //greenArrowRoot
      this.greenArrowRoot = this.controller.pretestParent ? this.controller.pretestParent : this.controller.moduleParent;
      this.lectorMode = !!this.ctx.onbehalfof && this.modService.moduleDone;
      this.lectorCanEvaluateRecording = this.lectorMode && !!(this.user.short.flag & CourseModel.CourseDataFlag.pcCannotEvaluate);

      var pg = this.page = CourseMeta.extractEx(this.exercise.pageJsonML);
      if (this.lectorMode) this.page.humanEvalMode = true;
      this.recorder = this; pg.blendedExtension = this; //navazani rozsireni na Page
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
            if (this.isTest && persistUserIsDone(this.user.short) && !this.modService.moduleDone && !this.lectorMode) {
              //test cviceni nesmi byt (pro nedokonceny test) videt ve vyhodnocenem stavu. Do vyhodnoceneho stav se vrati dalsim klikem na zelenou sipku.
              persistUserIsDone(this.user.short, false);
            }
            pg.acceptData(persistUserIsDone(this.user.short), exImpl.result);
            completed(pg);
          });
        });
      });
    }

    onDestroy(el: ng.IAugmentedJQuery) {
      //elapsed
      var now = Utils.nowToNum();
      var delta = Math.min(maxDelta, Math.round(now - this.startTime));
      if (this.user.short) { //muze nastat pri RESET lekce  
        var short = this.user.short;
        if (!short.elapsed) short.elapsed = 0;
        short.elapsed += delta;
        short.end = Utils.nowToNum();
        this.user.modified = true;
        if (!persistUserIsDone(this.user.short)) this.page.provideData(); //prevzeti poslednich dat z kontrolek cviceni
      }
      //uklid
      if (this.page.sndPage) this.page.sndPage.htmlClearing();
      if (this.page.sndPage) this.page.sndPage.leave();
      ko.cleanNode(el[0]);
      el.html('');
      delete (<CourseMeta.exImpl>(this.exercise.dataNode)).result;
    }

    //vrati budto promise v IEvaluateResult.confirmWrongScore (= aktivni pod 75% = cekani na wrongScore confirmation dialog) 
    // nebo IEvaluateResult.showResult (ukazat vysledek vyhodnoceni: pro aktivni nad 75% cviceni ano, pro pasivni a test ne)
    evaluate(isTest: boolean, exerciseShowWarningPercent: number = 75): IEvaluateResult {
      if (persistUserIsDone(this.user.short)) { return { showResult: false }; }
      this.user.modified = true;
      var short = this.user.short;

      //pasivni stranka
      if (this.page.isPassivePage()) {
        this.page.processReadOnlyEtc(true, true);
        persistUserIsDone(short, true);
        return { showResult: false };
      }

      //aktivni stranka
      this.page.provideData(); //prevzeti vysledku z kontrolek
      var score = this.page.getScore(); //vypocet score
      if (!score) { debugger; persistUserIsDone(short, true); return null; }

      var afterConfirmScore = () => {
        this.page.processReadOnlyEtc(true, true); //readonly a skipable controls
        if (!isTest) this.page.acceptData(true);

        this.user.modified = true;
        persistUserIsDone(short, true);
        if (this.exercise.dataNode.ms != score.ms) { debugger; def.reject("this.maxScore != score.ms"); return null; }
        short.s = score.s;
        short.flag = Course.setAgregateFlag(short.flag, score.flag);
        //short.flag |= score.flag;
      };

      var exerciseOK = isTest || !this.confirmWrongScoreDialog ? true : (score == null || score.ms == 0 || (score.s / score.ms * 100) >= exerciseShowWarningPercent);
      if (!exerciseOK) { //ukazat wrongResult confirmation dialog
        var def = this.ctx.$q.defer<boolean>();
        try {
          this.confirmWrongScoreDialog().then(
            () => {
              afterConfirmScore();
              def.resolve(true);
            },
            () => {
              def.resolve(false);
            });
        } finally {
          return { confirmWrongScore: def.promise };
        }
      } else {
        afterConfirmScore();
        return { showResult: !isTest };
      }
    }
  }
  var maxDelta = 10 * 60; //10 minut

}
