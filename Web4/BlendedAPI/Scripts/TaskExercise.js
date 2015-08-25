var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var blended;
(function (blended) {
    var exerciseTaskViewController = (function (_super) {
        __extends(exerciseTaskViewController, _super);
        function exerciseTaskViewController(state) {
            _super.call(this, state);
            this.title = this.dataNode.title;
        }
        exerciseTaskViewController.prototype.gotoHomeUrl = function () { Pager.gotoHomeUrl(); };
        exerciseTaskViewController.prototype.initPersistData = function (ud) {
            _super.prototype.initPersistData.call(this, ud);
        };
        exerciseTaskViewController.prototype.moveForward = function (ud) {
            ud.done = true;
        };
        return exerciseTaskViewController;
    })(blended.taskController);
    blended.exerciseTaskViewController = exerciseTaskViewController;
})(blended || (blended = {}));
