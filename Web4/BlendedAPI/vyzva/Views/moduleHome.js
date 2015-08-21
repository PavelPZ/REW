var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var vyzva;
(function (vyzva) {
    var moduleHomeController = (function (_super) {
        __extends(moduleHomeController, _super);
        function moduleHomeController($scope, $state, $rootTask) {
            _super.call(this, $scope, $state, $rootTask);
            this.tbTitle = 'Spustit lekci';
        }
        moduleHomeController.prototype.tbClick = function () { alert('click lesson'); };
        return moduleHomeController;
    })(vyzva.controller);
    vyzva.moduleHomeController = moduleHomeController;
    var moduleViewController = (function (_super) {
        __extends(moduleViewController, _super);
        function moduleViewController($scope, $state) {
            _super.call(this, $scope, $state);
            this.breadcrumb = vyzva.breadcrumbBase(this.myControler);
            this.breadcrumb.push({ title: this.title, url: null, active: true });
        }
        return moduleViewController;
    })(blended.taskViewController);
    vyzva.moduleViewController = moduleViewController;
    var moduleTaskController = (function (_super) {
        __extends(moduleTaskController, _super);
        function moduleTaskController($scope, $state) {
            _super.call(this, $scope, $state, 'moduleUrl');
        }
        return moduleTaskController;
    })(blended.pretestTaskController);
    vyzva.moduleTaskController = moduleTaskController;
})(vyzva || (vyzva = {}));
