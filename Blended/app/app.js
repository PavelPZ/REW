var test;
(function (test) {
    var Module = (function () {
        function Module(name, modules) {
            var self = this;
            this.app = angular.module(name, modules);
            this.app.run(function ($rootScope) {
                self.$scope = $rootScope;
                //$rootScope.model = this;
            });
        }
        Module.prototype.addController = function (name, controller) { this.app.controller(name, controller); };
        return Module;
    })();
    test.Module = Module;
    test.root = new test.Module('appRoot', ['ngRoute', 'ngResource' /*, 'ui.bootstrap'*/]);
    test.root.app.config(["$routeProvider", test.defineRoute]);
})(test || (test = {}));
//# sourceMappingURL=app.js.map