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
        function pretestExercise($scope, $state, $loadedEx, $loadedLongData, $modal) {
            _super.call(this, $scope, $state, $loadedEx, $loadedLongData, $modal);
            if (this.isFakeCreate)
                return;
            this.breadcrumb = vyzva.breadcrumbBase(this);
            this.breadcrumb.push({ title: 'Rozřazovací test', url: null, active: true });
            this.tbTitle = 'Pokračovat v testu';
            this.tbDoneTitle = 'Test dokončen';
        }
        pretestExercise.prototype.tbClick = function () { this.greenClick(); };
        pretestExercise.prototype.tbNavigateProductHome = function () { this.navigate({ stateName: vyzva.stateNames.home.name, pars: this.ctx }); };
        return pretestExercise;
    })(blended.exerciseTaskViewController);
    vyzva.pretestExercise = pretestExercise;
    var lessonExercise = (function (_super) {
        __extends(lessonExercise, _super);
        function lessonExercise($scope, $state, $loadedEx, $loadedLongData, $modal) {
            _super.call(this, $scope, $state, $loadedEx, $loadedLongData, $modal);
            if (this.isFakeCreate)
                return;
            this.breadcrumb = vyzva.breadcrumbBase(this);
            this.breadcrumb.push({ title: this.title, url: null, active: true });
            this.tbTitle = 'Pokračovat v lekci';
            this.tbDoneTitle = 'Lekce dokončena';
        }
        lessonExercise.prototype.tbClick = function () { this.greenClick(); };
        lessonExercise.prototype.tbNavigateProductHome = function () { this.navigate({ stateName: vyzva.stateNames.home.name, pars: this.ctx }); };
        return lessonExercise;
    })(blended.exerciseTaskViewController);
    vyzva.lessonExercise = lessonExercise;
    var lessonTest = (function (_super) {
        __extends(lessonTest, _super);
        function lessonTest($scope, $state, $loadedEx, $loadedLongData, $modal) {
            _super.call(this, $scope, $state, $loadedEx, $loadedLongData, $modal);
            if (this.isFakeCreate)
                return;
            this.breadcrumb = vyzva.breadcrumbBase(this);
            this.breadcrumb.push({ title: this.title, url: null, active: true });
            this.tbTitle = 'Pokračovat v testu';
            this.tbDoneTitle = 'Test dokončen';
        }
        lessonTest.prototype.tbClick = function () { this.greenClick(); };
        lessonTest.prototype.tbNavigateProductHome = function () { this.navigate({ stateName: vyzva.stateNames.home.name, pars: this.ctx }); };
        return lessonTest;
    })(blended.exerciseTaskViewController);
    vyzva.lessonTest = lessonTest;
})(vyzva || (vyzva = {}));
