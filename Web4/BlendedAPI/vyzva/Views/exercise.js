var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var vyzva;
(function (vyzva) {
    var pretestExercise = (function (_super) {
        __extends(pretestExercise, _super);
        function pretestExercise(state, resolves) {
            _super.call(this, state, resolves);
            if (state.createMode != blended.createControllerModes.navigate)
                return;
            this.breadcrumb = vyzva.breadcrumbBase(this);
            this.breadcrumb.push({ title: 'Rozřazovací test', url: null, active: true });
            this.tbTitle = 'Pokračovat';
        }
        pretestExercise.prototype.tbClick = function () {
            this.greenClick();
            //var pretest = _.find(this.taskList(), t => t.state.name == stateNames.pretestTask.name);
            //if (pretest == null) throw 'pretest==null';
            //pretest.navigateAhead();
        };
        return pretestExercise;
    })(blended.exerciseTaskViewController);
    vyzva.pretestExercise = pretestExercise;
    var lessonExercise = (function (_super) {
        __extends(lessonExercise, _super);
        function lessonExercise(state, resolves) {
            _super.call(this, state, resolves);
            if (state.createMode != blended.createControllerModes.navigate)
                return;
            this.breadcrumb = vyzva.breadcrumbBase(this);
            this.breadcrumb.push({ title: this.title, url: null, active: true });
            this.tbTitle = 'Pokračovat';
        }
        lessonExercise.prototype.tbClick = function () {
            this.greenClick();
        };
        return lessonExercise;
    })(blended.exerciseTaskViewController);
    vyzva.lessonExercise = lessonExercise;
    var lessonTest = (function (_super) {
        __extends(lessonTest, _super);
        function lessonTest(state, resolves) {
            _super.call(this, state, resolves);
            if (state.createMode != blended.createControllerModes.navigate)
                return;
            this.breadcrumb = vyzva.breadcrumbBase(this);
            this.breadcrumb.push({ title: this.title, url: null, active: true });
            this.tbTitle = 'Pokračovat';
        }
        lessonTest.prototype.tbClick = function () { this.greenClick(); };
        return lessonTest;
    })(blended.exerciseTaskViewController);
    vyzva.lessonTest = lessonTest;
})(vyzva || (vyzva = {}));
