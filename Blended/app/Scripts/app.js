var test;
(function (test) {
    function encodeUrl(url) { return url.replace(/\//g, '@'); }
    test.encodeUrl = encodeUrl;
    var Module = (function () {
        function Module(name, modules) {
            var self = this;
            this.app = angular.module(name, modules);
            this.app.run(function ($rootScope) {
                self.$scope = $rootScope;
                //$rootScope.$on('$stateChangeStart', (event, toState, toParams, fromState, fromParams) => { 
                //  debugger;
                //})
            });
        }
        Module.prototype.addController = function (name, controller) { this.app.controller(name, controller); };
        return Module;
    })();
    test.Module = Module;
    test.root = new test.Module('appRoot', ['ngResource', 'ui.router']);
    test.root.app.config(['$stateProvider', '$urlRouterProvider', '$locationProvider', function ($stateProvider, $urlRouterProvider, $location) {
            //$location.hashPrefix('!'); pro SEO
            test.defineStates($stateProvider, $urlRouterProvider);
        }]);
    test.root.app.factory('exportService', ['$http', function (http) { return new exportService(http); }]);
    test.root.app.directive('iframedirective', test.iframeDirective);
    var exportService = (function () {
        function exportService($http) {
            this.$http = $http;
        }
        exportService.prototype.getData = function (url, cache) { return this.$http.get(url, { cache: cache ? true : false }); };
        return exportService;
    })();
    test.exportService = exportService;
})(test || (test = {}));
//# sourceMappingURL=app.js.map