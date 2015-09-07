var test;
(function (test) {
    var modalTest = (function () {
        function modalTest($scope, $modal) {
            this.$scope = $scope;
            this.$modal = $modal;
            $scope.modalTest = this;
        }
        modalTest.prototype.action = function () {
            this.open().then(function (ok) { return alert(ok ? 'ok' : 'cancel'); }, function () { return alert('cancel'); });
        };
        modalTest.prototype.open = function () {
            var instance = this.$modal.open({
                templateUrl: 'modaldialog.html',
            });
            return instance.result;
        };
        return modalTest;
    })();
    test.modalTest = modalTest;
    var modalWindow = (function () {
        function modalWindow($scope, $modalInstance) {
            this.$scope = $scope;
            this.$modalInstance = $modalInstance;
            //debugger;
            $scope.ok = function () { return $modalInstance.close(); };
            $scope.cancel = function () { return $modalInstance.dismiss(); };
        }
        return modalWindow;
    })();
    test.modalWindow = modalWindow;
    test.rootModule = angular.module('testApp', ['ui.router', 'ngAnimate', 'ui.bootstrap']);
    var st1, st2;
    test.rootModule.config(['$stateProvider', function ($stateProvider) {
            $stateProvider
                .state({
                name: 'modal',
                url: '/modal',
                //templateUrl: 'test.html',
                templateUrl: 'modaltest.html',
                controller: modalTest,
            })
                .state(st1 = {
                name: 'test',
                url: '/test',
                //templateUrl: 'test.html',
                template: '<ui-view/>',
                controller: ctrl1, controllerAs: 'ctrl1as',
                resolve: {
                    $ctrl1Resolve: function () { return '$ctrl1Resolve'; },
                }
            })
                .state(st2 = {
                name: 'test.home',
                url: '/home',
                templateUrl: 'test.html',
                //template: '<ui-view/>',
                controller: ctrl2, controllerAs: 'ctrl2as',
                resolve: {
                    $ctrl2Resolve: function () { return '$ctrl2Resolve'; },
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
            });
        }]);
    var ctrl1 = (function () {
        function ctrl1($scope, $state, $ctrl1Resolve) {
            this.$ctrl1Resolve = $ctrl1Resolve;
            $scope.scopeProp1 = 'scopeProp1';
            $scope.scopeClick1 = function () { return alert('scopeClick1'); };
            this.prop1 = 'ctrl1.prop1';
            var st = $state.current;
            var constr = this.constructor;
            while (st) {
                if (st.controller == constr) {
                    debugger;
                    break;
                }
                st = st.parent;
            }
        }
        ctrl1.prototype.clickAs1 = function () { alert('ctrl1.clickAs1'); };
        return ctrl1;
    })();
    test.ctrl1 = ctrl1;
    var ctrl2 = (function () {
        function ctrl2($scope, $state, $ctrl1Resolve, $ctrl2Resolve) {
            this.$ctrl1Resolve = $ctrl1Resolve;
            this.$ctrl2Resolve = $ctrl2Resolve;
            $scope.scopeProp2 = 'scopeProp2';
            $scope.scopeClick2 = function () { return alert('scopeClick2'); };
            this.prop2 = 'ctrl2.prop2';
            this.ctrl1as = $scope.ctrl1as;
            var st = $state.current;
            var constr = this.constructor;
            while (st) {
                if (st.controller == constr) {
                    debugger;
                    break;
                }
                st = st.parent;
            }
        }
        ctrl2.prototype.clickAs2 = function () { alert('ctrl2.clickAs2'); };
        return ctrl2;
    })();
    test.ctrl2 = ctrl2;
    var ctrl3 = (function () {
        function ctrl3($scope, $state) {
        }
        return ctrl3;
    })();
    test.ctrl3 = ctrl3;
    var ctrl4 = (function () {
        function ctrl4($scope, $state) {
        }
        return ctrl4;
    })();
    test.ctrl4 = ctrl4;
})(test || (test = {}));
