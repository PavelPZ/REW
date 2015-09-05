namespace vyzva {

  export class lectorEvalController extends lectorViewBase { 
    constructor($scope: ng.IScope | blended.IStateService, $state?: angular.ui.IStateService) {
      super($scope, $state);
      this.tabIdx = 1;
      this.breadcrumb = this.breadcrumbBase();
      this.breadcrumb.push({ title: getLectorTabs()[this.tabIdx].shortTitle, active: true });
    }
  }

}