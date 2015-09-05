module test {
  export var rootModule = angular.module('testApp', [/*'ngLocale', 'ngResource',*/ 'ui.router', 'ngAnimate', 'ui.bootstrap']);
  var st1, st2;
  rootModule.config(['$stateProvider', ($stateProvider: angular.ui.IStateProvider) => {
    $stateProvider
      .state(st1 = {
        name: 'test',
        url: '/test',
        //templateUrl: 'test.html',
        template: '<ui-view/>',
        controller: ctrl1, controllerAs: 'ctrl1as',
        resolve: {
          $ctrl1Resolve: () => '$ctrl1Resolve',
        }
      })
      .state(st2 = {
        name: 'test.home',
        url: '/home',
        templateUrl: 'test.html',
        //template: '<ui-view/>',
        controller: ctrl2, controllerAs: 'ctrl2as',
        resolve: {
          $ctrl2Resolve: () => '$ctrl2Resolve',
        },
        parent: st1
      })
      .state({
        name: 'test.home.page',
        url: '/page',
        template: '<ui-view/>',
        controller: ctrl3, controllerAs: 'ctrl3as',
      })
      .state({
        name: 'test.home.page.home',
        url: '/home',
        controller: ctrl4, controllerAs: 'ctrl4as',
        templateUrl: 'test2.html',
      })
    ;
  }]);

  export class ctrl1 {
    constructor($scope, $state: angular.ui.IStateService, public $ctrl1Resolve) {
      $scope.scopeProp1 = 'scopeProp1';
      $scope.scopeClick1 = () => alert('scopeClick1');
      this.prop1 = 'ctrl1.prop1';
      var st = $state.current;
      var constr = this.constructor;
      while (st) {
        if (st.controller == constr) {
          debugger; break;
        }
        st = st.parent;
      }
    }
    prop1: string;
    clickAs1() { alert('ctrl1.clickAs1'); }
  }


  export class ctrl2 {
    constructor($scope, $state: angular.ui.IStateService, public $ctrl1Resolve, public $ctrl2Resolve) {
      $scope.scopeProp2 = 'scopeProp2';
      $scope.scopeClick2 = () => alert('scopeClick2');
      this.prop2 = 'ctrl2.prop2';
      this.ctrl1as = $scope.ctrl1as;
      var st = $state.current;
      var constr = this.constructor;
      while (st) {
        if (st.controller == constr) {
          debugger; break;
        }
        st = st.parent;
      }
    }
    prop2: string;
    ctrl1as: ctrl1;
    clickAs2() { alert('ctrl2.clickAs2'); }
  }

  export class ctrl3 {
    constructor($scope, $state: angular.ui.IStateService) {
    }
  }

  export class ctrl4 {
    constructor($scope, $state: angular.ui.IStateService) {
    }
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