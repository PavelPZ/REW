module vyzva {
  //******* predchudce vsech stranek. 
  export class controller extends blended.controller {
    static $inject = ['$scope', '$state', '$rootTask'];
    constructor($scope: blended.IControllerScope, $state: angular.ui.IStateService, public $rootTask?: blendedCourseTask) {
      super($scope, $state);
      this.breadcrumb = [
        { title: 'Moje Online jazykové kurzy a testy', url: '#' + Pager.getHomeUrl() },
        { title: this.$rootTask.dataNode.title, url: this.href(stateNames.productHome), active: false }
      ];
    }
    title: string;
    breadcrumb: Array<breadcrumbItem>;
    gotoHomeUrl() { Pager.gotoHomeUrl(); }
  }


}