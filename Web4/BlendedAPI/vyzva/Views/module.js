var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var vyzva;
(function (vyzva) {
    //export class moduleHomeController extends controller implements IToolbar, IToolbarRun {
    //  constructor($scope: blended.IControllerScope, $state: angular.ui.IStateService, $rootTask: blendedCourseTask) {
    //    super($scope, $state, $rootTask);
    //  }
    //  tbTitle = 'Spustit lekci';
    //  tbClick() { alert('click lesson'); }
    //}
    var moduleViewController = (function (_super) {
        __extends(moduleViewController, _super);
        function moduleViewController(state) {
            _super.call(this, state);
            this.breadcrumb = vyzva.breadcrumbBase(this.myTask);
            this.breadcrumb.push({ title: this.title, url: null, active: true });
        }
        return moduleViewController;
    })(blended.taskViewController);
    vyzva.moduleViewController = moduleViewController;
    var moduleTaskController = (function (_super) {
        __extends(moduleTaskController, _super);
        function moduleTaskController(state) {
            _super.call(this, state);
        }
        return moduleTaskController;
    })(blended.pretestTaskController);
    vyzva.moduleTaskController = moduleTaskController;
})(vyzva || (vyzva = {}));
