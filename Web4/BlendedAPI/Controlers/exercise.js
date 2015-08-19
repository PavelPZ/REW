var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var blended;
(function (blended) {
    var exerciseController = (function (_super) {
        __extends(exerciseController, _super);
        function exerciseController($scope, $state) {
            _super.call(this, $scope, $state);
        }
        return exerciseController;
    })(blended.controller);
    blended.exerciseController = exerciseController;
})(blended || (blended = {}));
