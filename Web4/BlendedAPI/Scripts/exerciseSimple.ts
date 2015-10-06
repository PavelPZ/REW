module blended {


  //export var loadExSimple = ['$stateParams', ($stateParams: blended.learnContext) => {
  //  blended.finishContext($stateParams);
  //  return blended.loader.adjustExSimple($stateParams);
  //}];

  //********************* SHOW EXERCISES DIRECTIVE
  export class showExerciseModelSimple {
    restrict = 'EA';
    link: (scope, el: ng.IAugmentedJQuery, attrs: ng.IAttributes) => void = (scope, el, attrs) => {
      var exService: exerciseServiceSimple = scope.exService()
      scope.$on('onStateChangeSuccess', ev => exService.onDestroy(el));
      exService.onDisplay(el, $.noop);
    };
    scope = { exService: '&exService' }
  }
  rootModule
    .directive('showExerciseSimple', () => new showExerciseModelSimple())
  ;

  export class exerciseServiceSimple {

    page: Course.Page;
    dataNode: { page: Course.Page; result: any; };

    constructor(public pageJsonML: Array<any>, public loc: { [id: string]: any; }, public userLongData: any) { }

    onDisplay(el: ng.IAugmentedJQuery, completed: (pg: Course.Page) => void) {
      var pg = this.page = CourseMeta.extractEx(this.pageJsonML);
      Course.localize(pg, s => CourseMeta.localizeString(pg.url, s, this.loc));

      if (!this.userLongData) this.userLongData = {};
      this.dataNode = { page: pg, result: this.userLongData };

      pg.finishCreatePage(<any>this.dataNode);

      pg.callInitProcs(Course.initPhase.beforeRender, () => {
        var html = JsRenderTemplateEngine.render("c_gen", pg);
        CourseMeta.actExPageControl = pg; //na chvili: knockout pro cviceni binduje CourseMeta.actExPageControl
        ko.cleanNode(el[0]);
        el.html('');
        el.html(html);
        ko.applyBindings({}, el[0]);
        pg.callInitProcs(Course.initPhase.afterRender, () => {
          pg.callInitProcs(Course.initPhase.afterRender2, () => {
            completed(pg);
          });
        });
      });

    }

    onDestroy(el: ng.IAugmentedJQuery) {
      if (this.page.sndPage) this.page.sndPage.htmlClearing();
      if (this.page.sndPage) this.page.sndPage.leave();
      ko.cleanNode(el[0]);
      el.html('');
      delete (<CourseMeta.exImpl>(this.dataNode)).result;
    }
  }

}
