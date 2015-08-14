module test {

  export interface IPageScope extends ng.IScope {
    model: PageController;
    state: angular.ui.IState;
    params: Object; //query route parametry
  }

  //page data, definovana v state definition (sitemap.ts) 
  export interface IPageData {
    title: string;
    tabName: string;
    topBarInclude: string; //topbar template
  }

  export class PageController {

    static $inject = ['$scope', '$state'];

    constructor($scope: IPageScope, $state: angular.ui.IStateService) { 
      $scope.model = this;
      $scope.state = $state.current;
      $scope.params = $state.params;
      if (!test.root.$scope) return;
      test.root.$scope.topBarInclude = 'app/views/topbar.html';
      var data = <IPageData>($state.current.data);
      if (!data) return;
      if (!data.tabName) data.tabName = $state.current.name;
      if (data.topBarInclude) test.root.$scope.topBarInclude = data.topBarInclude;
      if (data.title) test.root.$scope.pageTitle = data.title;
      //inicializace globalnich statovych hodnot
      test.root.$scope.tabName = data.tabName;
      $scope.$on('$locationChangeStart', () => test.root.$scope.backUrl = window.location.hash);
    };

  }


}