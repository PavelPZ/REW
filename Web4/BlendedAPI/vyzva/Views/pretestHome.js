var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var vyzva;
(function (vyzva) {
    var pretestViewController = (function (_super) {
        __extends(pretestViewController, _super);
        function pretestViewController($scope, $state) {
            _super.call(this, $scope, $state);
            this.breadcrumb = vyzva.breadcrumbBase(this.myTask);
            this.breadcrumb.push({ title: this.title, url: null, active: true });
        }
        return pretestViewController;
    })(blended.taskViewController);
    vyzva.pretestViewController = pretestViewController;
    var pretestTaskController = (function (_super) {
        __extends(pretestTaskController, _super);
        function pretestTaskController($scope, $state) {
            _super.call(this, $scope, $state, 'pretestUrl');
        }
        return pretestTaskController;
    })(blended.pretestTaskController);
    vyzva.pretestTaskController = pretestTaskController;
})(vyzva || (vyzva = {}));