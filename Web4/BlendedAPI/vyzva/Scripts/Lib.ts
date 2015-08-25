module vyzva {

  export function finishHomeDataNode(prod: IBlendedCourseRepository) {
    if (prod.pretest) return;
    var clonedLessons = _.map(_.range(0, 4), idx => <any>(_.clone(prod.Items[idx].Items))); //pro kazdou level kopie napr. </lm/blcourse/english/a1/>.Items
    var firstEntryTests = _.map(clonedLessons, l => l.splice(0, 1)[0]); //z kopie vyndej prvni prvek (entry test) a dej jej do firstPretests;
    prod.pretest = <any>(prod.find('/lm/blcourse/' + LMComLib.LineIds[prod.line].toLowerCase() + '/pretests/'));
    prod.entryTests = firstEntryTests;
    prod.lessons = clonedLessons;
    //_.each(<any>(prod.pretest.Items), (it: CourseMeta.data) => {
    //  if (it.other) $.extend(it, JSON.parse(it.other));
    //});
  }

  export function breadcrumbBase(ctx: blended.learnContext): Array<breadcrumbItem> {
    return [
      { title: 'Moje Online jazykové kurzy a testy', url: '#' + Pager.getHomeUrl() },
      { title: ctx.product.title, url: ctx.$state.href(stateNames.home.name, ctx), active: false }
    ];
  }


  //******* predchudce vsech stranek. 
  //export class controller extends blended.controller {
  //  static $inject = ['$scope', '$state', '$rootTask'];
  //  constructor($scope: blended.IControllerScope, $state: angular.ui.IStateService, public $rootTask?: blendedCourseTask) {
  //    super($scope, $state);
  //    this.breadcrumb = [
  //      { title: 'Moje Online jazykové kurzy a testy', url: '#' + Pager.getHomeUrl() },
  //      { title: this.$rootTask.dataNode.title, url: this.href(stateNames.productHome), active: false }
  //    ];
  //  }
  //  title: string;
  //  breadcrumb: Array<breadcrumbItem>;
  //  gotoHomeUrl() { Pager.gotoHomeUrl(); }
  //}


}