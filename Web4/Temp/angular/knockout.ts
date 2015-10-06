module knockout {

  export var rootModule = angular.module('knockoutApp', []);// [/*'ngLocale', 'ngResource',*/ 'ui.router', 'ngAnimate', 'ui.bootstrap']);
  export var rootScope: angular.IRootScopeService;
  export var compile: ng.ICompileService;
  rootModule.run(['$rootScope', '$compile', ($rootScope: angular.IRootScopeService, $compile: ng.ICompileService) => {
    rootScope = $rootScope; compile = $compile;
  }]);

  ko.bindingHandlers['angularjs'] = {
    init: function (element: HTMLElement, valueAccessor, allBindings, viewModel, bindingContext) {
      var ctx = bindingContext.$data;
      var value = valueAccessor ? valueAccessor() : 'none';

      //var initInjector = angular.injector(['ng']);
      //var $compile = initInjector.get<ng.ICompileService>('$compile');

      //var el = angular.element('<h3 ng-click="title = title + \'x\'">bindingContext={{title}}, value={{value}}</h3>');
      var el = angular.element('<div ng-controller="xxxx">{{name}}</div>');
      $(element).append(el);

      var compiled = compile(el);
      var scope = rootScope.$new(); // false, rootScope);
      $.extend(scope, { title: ctx.title, value: value });
      compiled(scope);
      scope.$apply();
    },
  };

  $(() => ko.applyBindings({ title: 'ko model' }, $('#knockout-root')[0]));

  class controller {
    constructor($scope) {
      $scope.name = 'i am controller';
    }
  }

  rootModule.controller('xxxx', controller);
}