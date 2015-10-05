var blended;
(function (blended) {
    var Module = (function () {
        function Module() {
            var self = this;
            this.app = blended.rootModule;
        }
        Module.prototype.href = function (stateName, params, options) {
            return this.$oldActState.href(stateName, params);
        };
        return Module;
    })();
    blended.Module = Module;
    var OldController = (function () {
        function OldController($scope, $state) {
            blended.root.$oldActState = $state;
            //prevezmi parametry
            var urlParts = [];
            for (var p = 0; p < 6; p++) {
                var parName = 'p' + p.toString();
                var val = $state.params[parName];
                if (val === undefined)
                    break;
                urlParts.push($state.params[parName]);
            }
            //procedura pro vytvoreni stareho modelu
            var createProc = $state.current.data['createModel'];
            //vytvor page model a naladuj stranku
            $scope.$on('$viewContentLoaded', function () {
                Pager.loadPage(createProc(urlParts));
            });
        }
        ;
        OldController.$inject = ['$scope', '$state'];
        return OldController;
    })();
    blended.OldController = OldController;
    blended.prodStates = {};
    blended.root = new Module();
    blended.rootModule
        .directive('lmInclude', function () {
        return {
            restrict: 'A',
            templateUrl: function (ele, attrs) { return attrs.lmInclude; },
        };
    })
        .run(vyzva.initVyzvaApp)
        .run(['$rootScope', '$location', '$templateCache', '$compile', function ($rootScope, $location, $templateCache, $compile) {
            blended.rootScope = $rootScope;
            blended.templateCache = $templateCache;
            blended.compile = $compile;
            $rootScope.$on('$locationChangeStart', function (event, newUrl, oldUrl, newState, oldState) {
                if (Pager.angularJS_OAuthLogin(location.hash, function () { return Pager.gotoHomeUrl(); }))
                    event.preventDefault();
            });
        }]);
    function checkOldApplicationStart() {
        if (checkOldApplicationStarted)
            return;
        checkOldApplicationStarted = true;
        return angular.injector(['ng']).invoke(['$q', function ($q) {
                var deferred = $q.defer();
                boot.bootStart(function () { return deferred.resolve(); });
                return deferred.promise;
            }]);
    }
    blended.checkOldApplicationStart = checkOldApplicationStart;
    var checkOldApplicationStarted = false;
    blended.root.app.config(['$stateProvider', '$urlRouterProvider', '$locationProvider', '$urlMatcherFactoryProvider', function (//'$provide', (
            $stateProvider, $urlRouterProvider, $location, $urlMatcherFactoryProvider, $provide) {
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
                .state({
                name: 'pg',
                url: '/pg',
                abstract: true,
                template: "<div data-ui-view></div>",
                resolve: {
                    checkOldApplicationStart: checkOldApplicationStart //ceka se na dokonceni inicalizace nasi technologie
                }
            })
                .state({
                name: 'pg.old',
                url: '/old',
                abstract: true,
                template: "<div data-ui-view></div>",
            });
            //stavy pro starou verzi
            var params = {
                $stateProvider: $stateProvider,
                $urlRouterProvider: $urlRouterProvider,
                $urlMatcherFactoryProvider: $urlMatcherFactoryProvider,
                $location: $location,
                app: blended.root.app
            };
            _.each(blended.oldLocators, function (createLoc) { return createLoc(params); }); //vytvoreni states na zaklade registrovanych page models (pomoci registerOldLocator)
            //stavy pro novou verzi
            vyzva.initVyzvaStates(params);
            //log vsech validnich routes
            //_.each(debugAllRoutes, r => Logger.trace("Pager", 'Define:' + r));
        }]);
    //dokumentace pro dostupne services
    function servicesDocumentation() {
        //https://docs.angularjs.org/api/ng/function/angular.injector
        //http://stackoverflow.com/questions/17497006/use-http-inside-custom-provider-in-app-config-angular-js
        //https://docs.angularjs.org/api/ng/service/$sce
        var initInjector = angular.injector(['ng']);
        var $http = initInjector.get('$http');
        var $q = initInjector.get('$q');
        var srv = initInjector.get('$filter');
        srv = initInjector.get('$timeout');
        srv = initInjector.get('$log');
        srv = initInjector.get('$rootScope');
        //srv = initInjector.get('$location'); nefunguje
        srv = initInjector.get('$parse');
        //srv = initInjector.get('$rootElement'); nefunguje
    }
    blended.servicesDocumentation = servicesDocumentation;
})(blended || (blended = {}));
