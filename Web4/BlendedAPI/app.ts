module blended {

  export class Module {
    app: ng.IModule;
    $oldActState: angular.ui.IStateService;

    constructor() {
      var self = this;
      this.app = rootModule;
    }

    href(stateName: string, params?: Object, options?: angular.ui.IHrefOptions): string {
      return this.$oldActState.href(stateName, params)
    }

  }

  export class OldController { //naladuje stranku dle zaregistrovane /old/... route 

    static $inject = ['$scope', '$state'];

    constructor($scope: ng.IScope, $state: angular.ui.IStateService) {
      root.$oldActState = $state;
      //prevezmi parametry
      var urlParts: Array<string> = [];
      for (var p = 0; p < 6; p++) {
        var parName = 'p' + p.toString();
        var val = $state.params[parName];
        if (val === undefined) break;
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

  export interface IProductStates {
    home?: blended.state;
    homeTask?: blended.state;
    pretestExercise?: blended.state;
    pretestModule?: blended.state;
  }
  export var prodStates: IProductStates = {};

  export var root = new Module();
  export var rootScope: angular.IRootScopeService;
  export var templateCache: ng.ITemplateCacheService;
  export var compile: ng.ICompileService;

  rootModule
    .directive('lmInclude', () => {
      return {
        restrict: 'A',
        templateUrl: (ele, attrs) => attrs.lmInclude,
      };
    })
    .run(vyzva.initVyzvaApp)
    .run(['$rootScope', '$location', '$templateCache', '$compile', ($rootScope: angular.IRootScopeService, $location: angular.ILocationService, $templateCache: ng.ITemplateCacheService, $compile: ng.ICompileService) => {
      rootScope = $rootScope; templateCache = $templateCache; compile = $compile;
      $rootScope.$on('$locationChangeStart', (event: angular.IAngularEvent, newUrl: string, oldUrl: string, newState, oldState) => {
        if (Pager.angularJS_OAuthLogin(location.hash, () => Pager.gotoHomeUrl())) event.preventDefault()
      });
      $rootScope.$on('$stateChangeStart', () => waitStart(true));
      $rootScope.$on('$stateChangeSuccess', () => setTimeout(() => waitEnd(), 1));
    }])
  ;

  export function waitStart(force?: boolean) {
    if (force) waitCounter = 0;
    if (waitCounter == 0) {
      Pager.blockGui(true);
    } waitCounter++;
  }
  export function waitEnd(force?: boolean) {
    if (force) waitCounter = 0; else waitCounter--;
    if (waitCounter != 0) return;
    Pager.blockGui(false);
  }
  var waitCounter = 0;

  export function checkOldApplicationStart() { //boot nasi technologie
    if (checkOldApplicationStarted) return; checkOldApplicationStarted = true;
    return angular.injector(['ng']).invoke(['$q', ($q: ng.IQService) => {
      var deferred = $q.defer();
      boot.bootStart(() => deferred.resolve());
      return deferred.promise;
    }]);
  } var checkOldApplicationStarted = false;


  root.app.config(['$stateProvider', '$urlRouterProvider', '$locationProvider', '$urlMatcherFactoryProvider', ( //'$provide', (
    $stateProvider: angular.ui.IStateProvider,
    $urlRouterProvider: angular.route.IRouteProvider,
    $location: ng.ILocationProvider,
    $urlMatcherFactoryProvider: angular.ui.IUrlMatcherFactory,
    $provide
  ) => {
    //routerLogging($provide);
    $urlMatcherFactoryProvider.caseInsensitive(true); //http://stackoverflow.com/questions/25994308/how-to-config-angular-ui-router-to-not-use-strict-url-matching-mode
    //Nefunguje pak browser historie
    //$urlMatcherFactoryProvider.type("urlType", { //http://stackoverflow.com/questions/27849260/angular-ui-sref-encode-parameter
    //  encode: (val: string) => val ? (val[0]=='/' ? val.replace(/\//g, '@') : val) : val,
    //  decode: (val: string) => val ? val.replace(/@/g, '/') : val,
    //  is: item => _.isString(item) && item[0] == '/',
    //  //equal: (v1: string, v2: string) => false,
    //});

    $urlRouterProvider.otherwise('/pg/old/school/schoolmymodel');

    $stateProvider
      .state({ //state root
        name: 'pg',
        url: '/pg',
        abstract: true,
        template: "<div data-ui-view></div>",
        resolve: {
          checkOldApplicationStart: checkOldApplicationStart //ceka se na dokonceni inicalizace nasi technologie
        }
      })
      .state({ //old state root
        name: 'pg.old',
        url: '/old',
        abstract: true,
        template: "<div data-ui-view></div>",
      })
    ;

    //stavy pro starou verzi
    var params: createStatePars = {
      $stateProvider: $stateProvider,
      $urlRouterProvider: $urlRouterProvider,
      $urlMatcherFactoryProvider: $urlMatcherFactoryProvider,
      $location: $location,
      app: root.app
    };
    _.each(oldLocators, createLoc => createLoc(params)); //vytvoreni states na zaklade registrovanych page models (pomoci registerOldLocator)

    //stavy pro novou verzi
    vyzva.initVyzvaStates(params);

    //log vsech validnich routes
    //_.each(debugAllRoutes, r => Logger.trace("Pager", 'Define:' + r));
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
