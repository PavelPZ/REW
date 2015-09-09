var knockout;
(function (knockout) {
    knockout.rootModule = angular.module('knockoutApp', []); // [/*'ngLocale', 'ngResource',*/ 'ui.router', 'ngAnimate', 'ui.bootstrap']);
    knockout.rootScope;
    knockout.compile;
    knockout.rootModule.run(['$rootScope', '$compile', function ($rootScope, $compile) {
            knockout.rootScope = $rootScope;
            knockout.compile = $compile;
        }]);
    ko.bindingHandlers['angularjs'] = {
        init: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
            var ctx = bindingContext.$data;
            var value = valueAccessor ? valueAccessor() : 'none';
            //var initInjector = angular.injector(['ng']);
            //var $compile = initInjector.get<ng.ICompileService>('$compile');
            //var el = angular.element('<h3 ng-click="title = title + \'x\'">bindingContext={{title}}, value={{value}}</h3>');
            var el = angular.element('<div ng-controller="xxxx">{{name}}</div>');
            $(element).append(el);
            var compiled = knockout.compile(el);
            var scope = knockout.rootScope.$new(); // false, rootScope);
            $.extend(scope, { title: ctx.title, value: value });
            compiled(scope);
            scope.$apply();
        },
    };
    $(function () { return ko.applyBindings({ title: 'ko model' }, $('#knockout-root')[0]); });
    var controller = (function () {
        function controller($scope) {
            $scope.name = 'i am controller';
        }
        return controller;
    })();
    knockout.rootModule.controller('xxxx', controller);
})(knockout || (knockout = {}));
