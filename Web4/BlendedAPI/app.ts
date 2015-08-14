module blended {

  export class Module {
    app: ng.IModule;
    $scope: IRootScope;

    constructor(name: string, modules: Array<string>) {
      var self = this;
      this.app = angular.module(name, modules);
      this.app.run(($rootScope: IRootScope) => {
        self.$scope = $rootScope;
        //$rootScope.$on('$stateChangeStart', (event, toState, toParams, fromState, fromParams) => { 
        //  debugger;
        //})
      });
    }

    addController(name: string, controller: Function) { this.app.controller(name, controller); }
  }

  export function isAngularHash(hash: string): boolean { //hack
    if (hash && Utils.startsWith(hash, '/ajs/')) { $('#angularjs-root').show(); return true; }
    $('#angularjs-root').hide();
    return false;
  }

  export interface IRootScope extends ng.IScope {
  }

  export var root = new Module('appRoot', ['ngResource', 'ui.router']);
  export var rootState: angular.ui.IStateService;

  root.app.config(['$stateProvider', '$urlRouterProvider', '$locationProvider', ($stateProvider: angular.ui.IStateProvider, $urlRouterProvider: angular.route.IRouteProvider, $location) => {
    $stateProvider
      .state({
        name: 'ajs',
        url: '/ajs',
        abstract:true,
        controller: () => { alert('ajs'); },
        template: "<div data-ui-view></div>",
      })
      .state({
        name: 'ajs.vyzvaproduct',
        controller: () => { alert('ajs.vyzvaproduct');},
        url: "/vyzvaproduct/:producturl",
        templateUrl: "../blendedapi/views/vyzvaproduct.html"
      })
    ;
  }]);

  root.app.factory('exportService', ['$http', (http: ng.IHttpService) => new exportService(http)]);

  export class exportService {
    public getData<T>(url: string, cache?: boolean): ng.IPromise<T> { return this.$http.get(url, { cache: cache ? true : false }); }
    constructor(public $http: ng.IHttpService) { }
  }

  export class RootController {

    static $inject = ['$scope', '$state'];

    constructor($scope: ng.IScope, $state: angular.ui.IStateService) {
      rootState = $state;
    }
  }


}
