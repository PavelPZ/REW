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

  export class exerciseServiceProxy {
    user: IExShort;
    idxInMod: number;
  }

  export interface IExLong { }

  export class exerciseService {

    idxInMod: number;
    userShort: IExShort;

    constructor(public ctx: learnContext /*ctx v dobe vlozeni do cache*/, public mod: cachedModule, public dataNode: CourseMeta.data, public page: Course.Page, public userLong: IExLong) {
      this.idxInMod = _.indexOf(mod.dataNode.Items, dataNode);
      this.userShort = this.userShort; if (!this.userShort) this.userShort = this.setPersistData(d => { /*TODO init*/ });
    }
    display(el: ng.IAugmentedJQuery, attrs: ng.IAttributes) { }
    destroy(el: ng.IAugmentedJQuery) { }

    getPersistData(): IExShort { return getPersistData<IExShort>(this.dataNode, this.ctx.taskid); }
    setPersistData(modify: (data: IExShort) => void): IExShort { return setPersistData<IExShort>(this.dataNode, this.ctx.taskid, modify); }

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