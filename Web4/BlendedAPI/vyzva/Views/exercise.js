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
            this.breadcrumb.push({ title: this.title, url: null, active: true });
            this.tbTitle = 'Pokračovat';
            this.pageUrls = this.ctx.productUrl + '|' + this.ctx.moduleUrl + '|' + this.ctx.Url;
        }
        pretestExercise.prototype.tbClick = function () {
            var pretest = _.find(this.taskList(), function (t) { return t.state.name == vyzva.stateNames.pretestTask.name; });
            if (pretest == null)
                throw 'pretest==null';
            var url = pretest.goAhead();
            if (url == null)
                url = { stateName: vyzva.stateNames.home.name, pars: this.ctx };
            this.navigate(url);
        };
        return pretestExercise;
    })(blended.exerciseTaskViewController);
    vyzva.pretestExercise = pretestExercise;
    var lessonExercise = (function (_super) {
        __extends(lessonExercise, _super);
        function lessonExercise() {
            _super.apply(this, arguments);
        }
        return lessonExercise;
    })(blended.exerciseTaskViewController);
    vyzva.lessonExercise = lessonExercise;
})(vyzva || (vyzva = {}));
