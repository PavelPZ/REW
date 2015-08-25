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

  export interface IExLong { }


  //***************** $scope.ex, je v cache
  export class exerciseService {

    modIdx: number; //index v modulu

    constructor(ctx: learnContext /*ctx v dobe vlozeni do cache*/, public mod: cachedModule, public dataNode: CourseMeta.data, public page: Course.Page, public userLong: IExLong) {
      this.modIdx = _.indexOf(mod.dataNode.Items, dataNode);
    }
    display(el: ng.IAugmentedJQuery, attrs: ng.IAttributes) { }
    destroy(el: ng.IAugmentedJQuery) { }

    //getPersistData(): IExShort { return getPersistData<IExShort>(this.dataNode, this.ctx.taskid); }
    //setPersistData(modify: (data: IExShort) => void): IExShort { return setPersistData<IExShort>(this.dataNode, this.ctx.taskid, modify); }
  }

  //***************** EXERCISE $scope.ts, vznika pri kazdem cviceni 
  export interface IExShort extends IPersistNodeUser { //course dato pro test
  }
  export interface IExerciseStateData {
    isTest: boolean;
  }

  export class exerciseTaskViewController extends taskController { //task pro pruchod lekcemi

    title: string;
    modItems: Array<exItemProxy>; //info o vsech cvicenich modulu
    modIdx: number; //index v modulu
    breadcrumb: Array<breadcrumbItem>;
    gotoHomeUrl() { Pager.gotoHomeUrl(); }

    constructor(state: IStateService, public $loadedEx: exerciseService) {
      super(state);
      //state.params. = loader.adjustEx(this.ctx).then()
      this.title = this.dataNode.title;
      if (!this.parent) return;
      this.modItems = _.map(this.parent.dataNode.Items, (node, idx) => {
        return { user: blended.getPersistData<IExShort>(node, this.ctx.taskid), modIdx: idx, title: node.title };
      });
      this.modIdx = _.indexOf(this.parent.dataNode.Items, this.dataNode);
    }

    getPersistData: () => IExShort;
    setPersistData: (modify: (data: IModuleUser) => void) => IModuleUser;

    initPersistData(ud: IExShort) {
      super.initPersistData(ud);
    }
    moveForward(ud: IExShort) {
      ud.done = true;
    }
  }


  //var frameId = 0; //citac frames kvuli events namespace

  //function onIFrameResize(frm: JQuery) { //zmena velikosti frame pri resize hlavniho okna
  //  frm.height($(window).height() - frm.offset().top - 10);
  //}

}

  //export var showExerciseDirective2_ = ['$stateParams', ($stateParams: blended.learnContext) => {
  //  var model = new showExerciseModel($stateParams);
  //  return { link: model.link };
  //  return {
  //    link: (scope: ng.IScope, el: ng.IAugmentedJQuery, attrs: ng.IAttributes) => {
  //      scope.$on('$destroy', () => {
  //        ko.cleanNode(el[0]);
  //        el.html('');
  //      });
  //      var page: Course.Page = blended.loader.productCache.fromCache($stateParams).moduleCache.fromCache($stateParams.moduleUrl).cacheOfPages.fromCache($stateParams.Url);
  //      ko.cleanNode(el[0].parentElement);
  //      el.html('');
  //      CourseMeta.lib.blendedDisplayEx(page, html => {
  //        el.html(html);
  //        ko.applyBindings({}, el[0].parentElement);
  //      });
  //    }
  //  };
  //}];