var test;
(function (test) {
    test.rootModule = angular.module('testApp', ['ui.router', 'ngAnimate', 'ui.bootstrap']);
    test.rootModule.config(['$stateProvider', function ($stateProvider) {
            $stateProvider
                .state({
                name: 'test',
                url: '/test',
                //templateUrl: 'test.html',
                template: '<ui-view/>',
                controller: ctrl1, controllerAs: 'ctrl1as',
                resolve: {
                    $ctrl1Resolve: function () { return '$ctrl1Resolve'; },
                }
            })
                .state({
                name: 'test.home',
                url: '/home',
                //templateUrl: 'test.html',
                template: '<ui-view/>',
                controller: ctrl2, controllerAs: 'ctrl2as',
                resolve: {
                    $ctrl2Resolve: function () { return '$ctrl2Resolve'; },
                }
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
            });
        }]);
    var ctrl1 = (function () {
        function ctrl1($scope, $ctrl1Resolve) {
            this.$ctrl1Resolve = $ctrl1Resolve;
            $scope.scopeProp1 = 'scopeProp1';
            $scope.scopeClick1 = function () { return alert('scopeClick1'); };
            this.prop1 = 'ctrl1.prop1';
        }
        ctrl1.prototype.clickAs1 = function () { alert('ctrl1.clickAs1'); };
        return ctrl1;
    })();
    test.ctrl1 = ctrl1;
    var ctrl2 = (function () {
        function ctrl2($scope, $ctrl1Resolve, $ctrl2Resolve) {
            this.$ctrl1Resolve = $ctrl1Resolve;
            this.$ctrl2Resolve = $ctrl2Resolve;
            $scope.scopeProp2 = 'scopeProp2';
            $scope.scopeClick2 = function () { return alert('scopeClick2'); };
            this.prop2 = 'ctrl2.prop2';
            this.ctrl1as = $scope.ctrl1as;
        }
        ctrl2.prototype.clickAs2 = function () { alert('ctrl2.clickAs2'); };
        return ctrl2;
    })();
    test.ctrl2 = ctrl2;
    var ctrl3 = (function () {
        function ctrl3($scope) {
        }
        return ctrl3;
    })();
    test.ctrl3 = ctrl3;
    var ctrl4 = (function () {
        function ctrl4($scope) {
            debugger;
        }
        return ctrl4;
    })();
    test.ctrl4 = ctrl4;
})(test || (test = {}));
