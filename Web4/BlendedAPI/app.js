var blended;
(function (blended) {
    var Module = (function () {
        function Module(name, modules) {
            var self = this;
            this.app = angular.module(name, modules);
        }
        Module.prototype.href = function (stateName, params, options) {
            return this.$actState.href(stateName, params);
        };
        Module.prototype.go = function (stateName, params, options) {
            return this.$actState.href(stateName, params);
        };
        return Module;
    })();
    blended.Module = Module;
    var OldController = (function () {
        function OldController($scope, $state) {
            blended.root.$actState = $state;
            //prevezmi parametry
            var urlParts = [];
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
        }
        ;
        OldController.$inject = ['$scope', '$state'];
        return OldController;
    })();
    blended.OldController = OldController;
    blended.root = new Module('appRoot', ['ngResource', 'ui.router']);
    blended.root.app.config(['$stateProvider', '$urlRouterProvider', '$locationProvider', '$urlMatcherFactoryProvider', function ($stateProvider, $urlRouterProvider, $location, $urlMatcherFactoryProvider) {
            $urlMatcherFactoryProvider.caseInsensitive(true); //http://stackoverflow.com/questions/25994308/how-to-config-angular-ui-router-to-not-use-strict-url-matching-mode
            $urlRouterProvider.otherwise('/pg/old/school/schoolmymodel');
            function checkOldApplicationStart() {
                return angular.injector(['ng']).invoke(['$q', function ($q) {
                        var deferred = $q.defer();
                        boot.bootStart(function () { return deferred.resolve(); });
                        return deferred.promise;
                    }]);
            }
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
            };
            _.each(blended.oldLocators, function (createLoc) { return createLoc(params); }); //vytvoreni states na zaklade registrovanych page models (pomoci registerOldLocator)
            _.each(blended.debugAllRoutes, function (r) { return Logger.trace("Pager", 'Define:' + r); });
            //stavy pro novou verzi
            $stateProvider
                .state({
                name: 'pg.ajs',
                url: '/ajs',
                abstract: true,
                controller: function () { Pager.clearHtml(); },
                template: "<div data-ui-view></div>",
            })
                .state({
                name: blended.ajs_vyzvaproduct,
                controller: function () { },
                url: "/vyzvaproduct/:producturl",
                templateUrl: "../blendedapi/views/vyzvaproduct.html"
            });
        }]);
    blended.ajs_vyzvaproduct = 'pg.ajs.vyzvaproduct';
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
