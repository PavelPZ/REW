module blended {

  //********************* INTERFACES 
  //long persistent informace o cviceni
  export interface IExLong { [exId: string]: CourseModel.Result; }

  export interface IInstructionData { title: string; body: string; }

  export enum exDoneStatus { no, passive, active }

  export interface IExShort extends IPersistNodeUser { //course dato pro test
    done: boolean;
    ms: number;
    s: number;
    elapsed: number; //straveny cas ve vterinach
    beg: number; //datum zacatku, ve dnech
    end: number; //datum konce (ve dnech), na datum se prevede pomoci intToDate(end * 1000000)
    sumPlay?: number; //prehrany nas zvuk (sec)
    sumRecord?: number; //nahrany zvuk  (sec)
    sumPlayRecord?: number; //prehrano nahravek (sec)
    //pouze pro agregovana data (pro modul, pretest, kurz):
    score?: number; //-1 nebo pomer s/ms
    count?: number; //pocet zahrnutych cviceni
    dones?: number; //pocet hotovych cviceni
    finished?: number; //procento hotovych cviceni
  }

  export interface IEvaluateResult {
    confirmWrongScore?: ng.IPromise<boolean>;
    showResult?: boolean;
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
    //parent: moduleTaskController;

    //showResultAfterEval: boolean; //nepersistentni stavova promenna - je zobrazen vysledek po vyhodnoceni. V nasledujicim moveForward

    constructor($scope: ng.IScope | blended.IStateService, $state: angular.ui.IStateService, $loadedEx: cacheExercise, $loadedLongData: IExLong) {
      super($scope, $state);
      this.exParent = this;
      if (this.isFakeCreate) return;

      var modIdx = _.indexOf(this.moduleParent.exercises, this.dataNode);
      this.exService = new exerciseService($loadedEx, $loadedLongData, this, modIdx);//, () => this.confirmWrongScoreDialog());
      this.modService = new moduleService(this.moduleParent.dataNode, this.exService, this.moduleParent.state.moduleType, this);

      $scope['exService'] = this.exService;
      $scope['modService'] = this.modService;

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
    confirmWrongScoreDialog: () => ng.IPromise<any>;

    constructor(exercise: cacheExercise, long: IExLong, controller: exerciseTaskViewController, modIdx: number) { //, confirmWrongScoreDialog: () => ng.IPromise<any>) {
      this.exercise = exercise; this.modIdx = modIdx; this.confirmWrongScoreDialog = () => controller.confirmWrongScoreDialog();
      this.ctx = controller.ctx; this.product = controller.productParent.dataNode;
      //this.exerciseIsTest = controller.state.exerciseIsTest; this.moduleUser = controller.parent.user.short;
      this.exerciseIsTest = controller.moduleParent.state.moduleType != blended.moduleServiceType.lesson;
      this.moduleUser = controller.moduleParent.user.short;
      this.user = getPersistWrapper<IExShort>(exercise.dataNode, this.ctx.taskid, () => { var res: IExShort = $.extend({}, shortDefault); res.ms = exercise.dataNode.ms; return res; });
      if (!long) { long = {}; this.user.modified = true; }
      this.user.long = long
      this.startTime = Utils.nowToNum();
      //greenArrowRoot
      this.greenArrowRoot = controller.pretestParent ? controller.pretestParent : controller.moduleParent;
      //this.refresh();
    }

    score(): number {
      return blended.scorePercent(this.user.short);
    }

    onDisplay(el: ng.IAugmentedJQuery, completed: (pg: Course.Page) => void) {

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
              //test cviceni nesmi byt (pro nedokonceny test) videt ve vyhodnocenem stavu. Do vyhodnoceneho stav se vrati dalsim klikem na zelenou sipku.
              this.user.short.done = false;
            }
            pg.acceptData(this.user.short.done, exImpl.result);
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

      if (!this.user.short.done) this.page.provideData(); //prevzeti poslednich dat z kontrolek cviceni
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
      if (this.user.short.done) { return { showResult: false }; }
      this.user.modified = true;
      var short = this.user.short;

      //pasivni stranka
      if (this.page.isPassivePage()) {
        this.page.processReadOnlyEtc(true, true);
        short.done = true;
        return { showResult: false };
      }

      //aktivni stranka
      this.page.provideData(); //prevzeti vysledku z kontrolek
      var score = this.page.getScore(); //vypocet score
      if (!score) { debugger; short.done = true; return null; }

      var afterConfirmScore = () => {
        this.page.processReadOnlyEtc(true, true); //readonly a skipable controls
        if (!isTest) this.page.acceptData(true);

        short.done = true;
        if (this.exercise.dataNode.ms != score.ms) { debugger; def.reject("this.maxScore != score.ms"); return null; }
        short.s = score.s;
        //short.score = blended.scorePercent(short);
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
