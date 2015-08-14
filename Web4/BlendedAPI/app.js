var blended;
(function (blended) {
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
    blended.Module = Module;
    function _isAngularHash(hash) {
        if (hash && Utils.startsWith(hash, '/ajs/')) {
            return true;
        }
        return false;
    }
    blended._isAngularHash = _isAngularHash;
    function isAngularHash(hash) {
        if (hash && Utils.startsWith(hash, '/ajs/')) {
            $('#angularjs-root').show();
            return true;
        }
        $('#angularjs-root').hide();
        return false;
    }
    blended.isAngularHash = isAngularHash;
    blended.root = new Module('appRoot', ['ngResource', 'ui.router']);
    blended.rootState;
    blended.root.app.config(['$stateProvider', '$urlRouterProvider', '$locationProvider', function ($stateProvider, $urlRouterProvider, $location) {
            $stateProvider
                .state({
                name: 'old',
                url: '/old',
                template: "<!--old-->",
            })
                .state({
                name: 'ajs',
                url: '/ajs',
                abstract: true,
                controller: function () { },
                template: "<div data-ui-view></div>",
            })
                .state({
                name: 'ajs.vyzvaproduct',
                controller: function () { },
                url: "/vyzvaproduct/:producturl",
                templateUrl: "../blendedapi/views/vyzvaproduct.html"
            });
        }]);
    blended.root.app.factory('exportService', ['$http', function (http) { return new exportService(http); }]);
    var exportService = (function () {
        function exportService($http) {
            this.$http = $http;
        }
        exportService.prototype.getData = function (url, cache) { return this.$http.get(url, { cache: cache ? true : false }); };
        return exportService;
    })();
    blended.exportService = exportService;
    var RootController = (function () {
        function RootController($scope, $state) {
            blended.rootState = $state;
        }
        RootController.$inject = ['$scope', '$state'];
        return RootController;
    })();
    blended.RootController = RootController;
})(blended || (blended = {}));
