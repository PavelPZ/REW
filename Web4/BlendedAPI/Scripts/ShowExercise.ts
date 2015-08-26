module blended {

  export var showExerciseDirective2 = ['$stateParams', ($stateParams: blended.learnContext) => new showExerciseModel($stateParams)];

  export class showExerciseModel {
    constructor(public $stateParams: blended.learnContext) { }
    link: (scope: ng.IScope, el: ng.IAugmentedJQuery, attrs: ng.IAttributes) => void = (scope, el, attrs) => {
      scope.$on('$destroy', () => {
        if (this.page.sndPage) this.page.sndPage.htmlClearing();
        if (this.page.sndPage) this.page.sndPage.leave();
        ko.cleanNode(el[0]);
        el.html('');
      });
      blended.loader.adjustEx(this.$stateParams).then(exserv => {
        this.page = exserv.page;
        ko.cleanNode(el[0]);
        el.html('');
        CourseMeta.lib.blendedDisplayEx(this.page, html => {
          el.html(html);
          ko.applyBindings({}, el[0]);
        });
      });
    };
    page: Course.Page;
  }

  export class exItemProxy {
    title: string; //titulek
    user: IExShort; //short data
    modIdx: number; //index v modulu
  }

  export function scorePercent(sc: IExShort) { return sc.ms == 0 ? -1 : Math.round(sc.s / sc.ms * 100); }

  export function exSummaryNode(node: CourseMeta.data, taskId: string): IExShort {
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


  export interface IExLong { [exId: string]: CourseModel.Result; }


  //***************** $scope.ex, je v cache
  export class exerciseService {

    taskId: string;
    user: IPersistNodeItem<IExShort>;
    constructor(ctx: learnContext /*ctx v dobe vlozeni do cache*/, public mod: cachedModule, public dataNode: CourseMeta.data, public page: Course.Page, public userLong: IExLong) {
      this.taskId = ctx.taskid; if (!userLong) userLong = {};
      this.user = getPersistWrapper<IExShort>(dataNode, this.taskId, () => $.extend({}, shortDefault));
      this.user.long = userLong;
    }
    display(el: ng.IAugmentedJQuery, attrs: ng.IAttributes) { }
    destroy(el: ng.IAugmentedJQuery) { }

    evaluate() { }
  }

  //***************** EXERCISE $scope.ts, vznika pri kazdem cviceni 
  export interface IExShort extends IPersistNodeUser { //course dato pro test
    done: boolean;
    ms: number;
    s: number;
    elapsed: number;
    beg: number; //datum zacatku
    end: number; //datum konce, na datum se prevede pomoci intToDate(end * 1000000)
  }

  export interface IExerciseStateData {
    isTest: boolean;
  }

  export interface IExerciseScope extends IControllerScope {
    ex: exerciseService;
  }

  export class exerciseTaskViewController extends taskController { //task pro pruchod lekcemi

    user: IPersistNodeItem<IExShort>;
    title: string;
    modItems: Array<exItemProxy>; //info o vsech cvicenich modulu
    modIdx: number; //self index v modulu
    breadcrumb: Array<breadcrumbItem>;
    //gotoHomeUrl() { Pager.gotoHomeUrl(); }
    startTime: number; //datum vstupu do stranky
    service: exerciseService;

    isDone(): boolean { return this.user.short.done; }

    constructor(state: IStateService, resolves: Array<any>) {
      super(state);
      if (state.createMode != createControllerModes.navigate) return;
      this.service = <exerciseService>(resolves[0])
      this.user = this.service.user;
      if (state.$scope) (<IExerciseScope>(state.$scope)).ex = this.service;
      this.title = this.dataNode.title;
      this.modItems = _.map(this.parent.dataNode.Items, (node, idx) => {
        return { user: blended.getPersistData<IExShort>(node, this.ctx.taskid), modIdx: idx, title: node.title };
      });
      this.modIdx = _.indexOf(this.parent.dataNode.Items, this.dataNode);
    }

    moveForward(ud: IExShort) {
      ud.done = true;
    }
  }
}
