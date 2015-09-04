module test {
  export var rootModule = angular.module('testApp', [/*'ngLocale', 'ngResource',*/ 'ui.router', 'ngAnimate', 'ui.bootstrap']);
  rootModule.config(['$stateProvider', ($stateProvider: angular.ui.IStateProvider) => {
    $stateProvider
      .state({
        name: 'test',
        url: '/test',
        //templateUrl: 'test.html',
        template: '<ui-view/>',
        controller: ctrl1, controllerAs: 'ctrl1as',
        resolve: {
          $ctrl1Resolve: () => '$ctrl1Resolve',
        }
      })
      .state({
        name: 'test.home',
        url: '/home',
        templateUrl: 'test.html',
        controller: ctrl2, controllerAs: 'ctrl2as',
        resolve: {
          $ctrl2Resolve: () => '$ctrl2Resolve',
        }
      })
    ;
  }]);

  export class ctrl1 {
    constructor($scope, public $ctrl1Resolve) {
      $scope.scopeProp1 = 'scopeProp1';
      $scope.scopeClick1 = () => alert('scopeClick1');
      this.prop1 = 'ctrl1.prop1';
    }
    prop1: string;
    clickAs1() { alert('ctrl1.clickAs1'); }
  }


  export class ctrl2 {
    constructor($scope, public $ctrl1Resolve, public $ctrl2Resolve) {
      $scope.scopeProp2 = 'scopeProp2';
      $scope.scopeClick2 = () => alert('scopeClick2');
      this.prop2 = 'ctrl2.prop2';
      this.ctrl1as = $scope.ctrl1as;
    }
    prop2: string;
    ctrl1as: ctrl1;
    clickAs2() { alert('ctrl2.clickAs2'); }
  }

  //rootModule.controller('ctrl1', $scope => new ctrl1($scope));
  //rootModule.controller('ctrl2', $scope => $scope.prop2 = 'ctrl2');
  //rootModule.controller('ctrl3', function () { this.prop3 = 'ctrl3'; });
  //rootModule.controller('ctrl4', () => new ctrl4());

  //export class ctrl4 {
  //  constructor() {
  //    this.prop4 = 'ctrl4';
  //  }
  //  prop4: string;
  //}

}