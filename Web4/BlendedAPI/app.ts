module blended {

  export class Module {
    app: ng.IModule;

    constructor(name: string, modules: Array<string>) {
      var self = this;
      this.app = angular.module(name, modules);
    }
  }

  //export function isAngularHash(hash: string): boolean { //hack
  //  if (hash && Utils.startsWith(hash, '/ajs/')) { return true; }
  //  return false;
  //}
  //export function _isAngularHash(hash: string): boolean { //hack
  //  if (hash && Utils.startsWith(hash, '/ajs/')) { $('#angularjs-root').show(); return true; }
  //  $('#angularjs-root').hide();
  //  return false;
  //}

  export var root = new Module('appRoot', ['ngResource', 'ui.router']);

  root.app.run(() => boot.OldApplicationStart()); //volani StartProc pro inicializaci stare aplikace

  export class OldController { //naladuje stranku dle zaregistrovane /old/... route

    static $inject = ['$scope', '$state'];

    constructor($scope: ng.IScope, $state: angular.ui.IStateService) {
      //prevezmi paramnetry
      var urlParts: Array<string> = [];
      for (var p = 0; p < 6; p++) {
        var parName = 'p' + p.toString();
        urlParts.push($state.params[parName]);
      }
      //procedura pro vytvoreni stareho modelu
      var createProc = $state.current.data['createModel'];
      //vytvor page model a naladuj stranku
      $scope.$on('$viewContentLoaded', function () {
        Pager.loadPage(createProc(urlParts));
      });
    };

  }

  root.app.config(['$stateProvider', '$urlRouterProvider', '$locationProvider', '$urlMatcherFactoryProvider', (
    $stateProvider: angular.ui.IStateProvider,
    $urlRouterProvider: angular.route.IRouteProvider,
    $location: ng.ILocationProvider,
    $urlMatcherFactoryProvider: angular.ui.IUrlMatcherFactory
    ) => {

    $urlMatcherFactoryProvider.caseInsensitive(true); //http://stackoverflow.com/questions/25994308/how-to-config-angular-ui-router-to-not-use-strict-url-matching-mode
    $urlRouterProvider.otherwise('/old/school/schoolmymodel');

    //stavy pro starou verzi
    var params: createStatePars = {
      $stateProvider: $stateProvider,
      $urlRouterProvider: $urlRouterProvider,
      $urlMatcherFactoryProvider: $urlMatcherFactoryProvider,
      $location: $location,
    };
    _.each(oldLocators, createLoc => createLoc(params)); //vytvoreni states na zaklade registrovanych page models (pomoci registerOldLocator)

    _.each(debugAllRoutes, r => Logger.trace("Pager", 'Define:' + r));

    //stavy pro novou verzi
    $stateProvider
      .state({
        name: 'ajs',
        url: '/ajs',
        abstract: true,
        controller: () => { alert('view'); },
        template: "<div data-ui-view></div>",
      })
      .state({
        name: 'ajs.vyzvaproduct',
        controller: () => { },
        url: "/vyzvaproduct/:producturl",
        templateUrl: "../blendedapi/views/vyzvaproduct.html"
      })
    ;
  }]);


  //dokumentace pro dostupne services
  export function servicesDocumentation() {
    //https://docs.angularjs.org/api/ng/function/angular.injector
    //http://stackoverflow.com/questions/17497006/use-http-inside-custom-provider-in-app-config-angular-js
    //https://docs.angularjs.org/api/ng/service/$sce
    var initInjector = angular.injector(['ng']);
    var $http = initInjector.get<ng.IHttpService>('$http');
    var $q = initInjector.get<ng.IQService>('$q');
    var srv = initInjector.get('$filter');
    srv = initInjector.get('$timeout');
    srv = initInjector.get('$log');
    srv = initInjector.get('$rootScope');
    //srv = initInjector.get('$location'); nefunguje
    srv = initInjector.get('$parse');
    //srv = initInjector.get('$rootElement'); nefunguje
  }
  


}
