module blended {

  export var loadEx = ['$stateParams', ($stateParams: blended.learnContext) => {
    blended.finishContext($stateParams);
    return blended.loader.adjustEx($stateParams);
  }];

  export var loadLongData = ['$stateParams', (ctx: blended.learnContext) => {
    blended.finishContext(ctx);
    var def = ctx.$q.defer<IExLong>();
    proxies.vyzva57services.getLongData(ctx.companyid, ctx.userdataid, ctx.productUrl, ctx.taskid, ctx.Url, long => {
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

  export class exItemProxy {
    title: string; //titulek
    user: IExShort; //short data
    modIdx: number; //index v modulu
  }

  export function scorePercent(sc: IExShort) { return sc.ms == 0 ? -1 : Math.round(sc.s / sc.ms * 100); }

  export function agregateChildShortInfos(node: CourseMeta.data, taskId: string): IExShort {
    var res: IExShort = $.extend({}, shortDefault);
    res.done = true;
    _.each(node.Items, nd => {
      var us = getPersistWrapper<IExShort>(nd, taskId);
      res.done = res.done && (us ? us.short.done : false);
      if (nd.ms) { //skore
        res.ms += nd.ms; res.s += us ? us.short.s : 0;
      }
      if (us) {
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

    constructor(public exercise: cacheExercise, long: IExLong, public statusData: IExerciseStateData, public ctx: learnContext, public product: IProductEx) {
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
            pg.acceptData(exImpl.done, exImpl.result);
            el.removeClass('contentHidden');
            completed(pg);
          });
        });
      });
    }

    destroy(el: ng.IAugmentedJQuery) {
      if (this.page.sndPage) this.page.sndPage.htmlClearing();
      if (this.page.sndPage) this.page.sndPage.leave();
      ko.cleanNode(el[0]);
      el.html('');

      this.product.saveProduct(this.ctx, () => { });
      delete (<CourseMeta.exImpl>(this.exercise.dataNode)).result;
      delete this.user.long;
    }

    evaluate(): boolean {
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

      //aktivni stranka
      this.page.provideData();
      var score = this.page.getScore();
      if (!score) { debugger; throw "!score"; short.done = true; return true; }

      var exerciseOK = this.statusData.isTest ? true : (score == null || score.ms == 0 || (score.s / score.ms * 100) >= 75);
      //if (!exerciseOK && !gui.alert(alerts.exTooManyErrors, true)) { this.userPending = false; return false; }//je hodne chyb a uzivatel chce cviceni znova
      this.page.processReadOnlyEtc(true, true); //readonly a skipable controls
      if (!this.statusData.isTest) this.page.acceptData(true);

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

  export interface IExerciseStateData {
    isTest: boolean; //test nebo cviceni
  }

  export class exerciseTaskViewController extends taskController { //task pro pruchod lekcemi

    exService: exerciseService;

    title: string;
    modItems: Array<exItemProxy>; //info o vsech cvicenich modulu
    modIdx: number; //self index v modulu
    breadcrumb: Array<breadcrumbItem>;

    isDone(): boolean { return this.exService.user.short.done; }

    constructor(state: IStateService, resolves: Array<any>) {
      super(state);
      if (state.createMode != createControllerModes.navigate) return;

      this.exService = new exerciseService(<cacheExercise>(resolves[0]), <blended.IExLong>(resolves[1]), { isTest: this.state.exerciseIsTest }, this.ctx, this.taskRoot().dataNode);
      state.$scope['exerciseService'] = this.exService;

      this.user = this.exService.user;

      this.title = this.dataNode.title;
      this.modItems = _.map(this.parent.dataNode.Items, (node, idx) => {
        return { user: blended.getPersistData<IExShort>(node, this.ctx.taskid), modIdx: idx, title: node.title };
      });
      this.modIdx = _.indexOf(this.parent.dataNode.Items, this.dataNode);
    }

    moveForward(ud: IExShort) {
      this.exService.evaluate();
    }
  }
}
