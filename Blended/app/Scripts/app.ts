declare var config: test.IConfig;

module test {

  export function encodeUrl(url: string): string { return url.replace(/\//g, '@');  }

  export interface IConfig { //config v app/config.js
    runExMask: { [lang: string]: string; };
  }

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

  export interface IRootScope extends ng.IScope {
    pageTitle: string;
    tabName: string;
    topBarInclude: string; //topbar template
    bodyScrollHidden:boolean;
    backUrl: string;
  }

  export var root = new test.Module('appRoot', ['ngResource', 'ui.router']);

  root.app.config(['$stateProvider', '$urlRouterProvider', '$locationProvider', ($stateProvider: angular.ui.IStateProvider, $urlRouterProvider: angular.route.IRouteProvider, $location) => {
    //$location.hashPrefix('!'); pro SEO
    defineStates($stateProvider, $urlRouterProvider);
  }]);

  root.app.factory('exportService', ['$http', (http: ng.IHttpService) => new exportService(http)]);

  root.app.directive('iframedirective', iframeDirective);

  export class exportService {
    public getData<T>(url: string, cache?: boolean): ng.IPromise<T> { return this.$http.get(url, { cache: cache ? true : false }); }
    constructor(public $http: ng.IHttpService) { }
  }

  //root.app.config(['$routeProvider', defineRoute]);
}
