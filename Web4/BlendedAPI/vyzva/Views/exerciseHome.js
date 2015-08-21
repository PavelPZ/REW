var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var vyzva;
(function (vyzva) {
    var exerciseController = (function (_super) {
        __extends(exerciseController, _super);
        function exerciseController($scope, $state, $rootTask) {
            _super.call(this, $scope, $state, $rootTask);
            this.tbTitle = 'Spustit lekci';
        }
        exerciseController.prototype.tbClick = function () { alert('click exercise'); };
        exerciseController.prototype.tbSkipClick = function () { alert('skip exercise'); };
        exerciseController.prototype.tbFinishClick = function () { alert('finish exercise'); };
        return exerciseController;
    })(vyzva.controller);
    vyzva.exerciseController = exerciseController;
    var exerciseTaskController = (function (_super) {
        __extends(exerciseTaskController, _super);
        function exerciseTaskController() {
            _super.apply(this, arguments);
        }
        return exerciseTaskController;
    })(blended.exerciseTaskController);
    vyzva.exerciseTaskController = exerciseTaskController;
})(vyzva || (vyzva = {}));
