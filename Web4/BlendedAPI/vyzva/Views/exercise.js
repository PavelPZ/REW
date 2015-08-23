var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var vyzva;
(function (vyzva) {
    //export class exerciseController extends controller implements IToolbar, IToolbarModule {
    //  constructor($scope: blended.IControllerScope, $state: angular.ui.IStateService, $rootTask: blendedCourseTask) {
    //    super($scope, $state, $rootTask);
    //  }
    //  tbTitle = 'Spustit lekci';
    //  tbClick() { alert('click exercise'); }
    //  tbSkipClick() { alert('skip exercise'); }
    //  tbFinishClick() { alert('finish exercise'); }
    //}
    var exerciseTaskController = (function (_super) {
        __extends(exerciseTaskController, _super);
        function exerciseTaskController() {
            _super.apply(this, arguments);
        }
        return exerciseTaskController;
    })(blended.exerciseTaskController);
    vyzva.exerciseTaskController = exerciseTaskController;
})(vyzva || (vyzva = {}));
