var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var vyzva;
(function (vyzva) {
    var moduleTaskController = (function (_super) {
        __extends(moduleTaskController, _super);
        function moduleTaskController() {
            _super.apply(this, arguments);
        }
        return moduleTaskController;
    })(blended.moduleTaskController);
    vyzva.moduleTaskController = moduleTaskController;
    var exerciseViewLow = (function (_super) {
        __extends(exerciseViewLow, _super);
        function exerciseViewLow($scope, $state, $loadedEx, $loadedLongData, $modal) {
            _super.call(this, $scope, $state, $loadedEx, $loadedLongData);
            this.$modal = $modal;
        }
        exerciseViewLow.prototype.tbClick = function () { this.greenClick(); };
        exerciseViewLow.prototype.tbNavigateProductHome = function () { this.navigateProductHome(); }; //this.navigate({ stateName: stateNames.home.name, pars: this.ctx }) }
        exerciseViewLow.prototype.confirmWrongScoreDialog = function () {
            return this.$modal.open({
                templateUrl: 'vyzva$exercise$wrongscore.html',
            }).result;
        };
        exerciseViewLow.prototype.congratulationDialog = function () {
            return this.$modal.open({
                templateUrl: 'vyzva$exercise$congratulation.html',
                scope: this.$scope,
            }).result;
        };
        exerciseViewLow.$inject = ['$scope', '$state', '$loadedEx', '$loadedLongData', '$modal'];
        return exerciseViewLow;
    })(blended.exerciseTaskViewController);
    vyzva.exerciseViewLow = exerciseViewLow;
    var pretestExercise = (function (_super) {
        __extends(pretestExercise, _super);
        function pretestExercise($scope, $state, $loadedEx, $loadedLongData, $modal) {
            _super.call(this, $scope, $state, $loadedEx, $loadedLongData, $modal);
            if (this.isFakeCreate)
                return;
            this.breadcrumb = vyzva.breadcrumbBase(this);
            this.breadcrumb.push({ title: 'Rozřazovací test', url: null, active: true });
            this.tbTitle = 'Pokračovat v Rozřazovacím testu';
            this.tbDoneTitle = 'Rozřazovací test dokončen';
            this.tbCongratulation = 'Gratulujeme k dokončení Rozřazovacího testu!';
        }
        return pretestExercise;
    })(exerciseViewLow);
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
            this.tbCongratulation = 'Gratulujeme k dokončení lekce!';
        }
        return lessonExercise;
    })(exerciseViewLow);
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
            this.tbCongratulation = 'Gratulujeme k dokončení testu! Vzhledem k tomu, že test obsahuje mluvený projev, byl zaslán vašemu Učiteli k vyhodnocení.';
        }
        return lessonTest;
    })(exerciseViewLow);
    vyzva.lessonTest = lessonTest;
})(vyzva || (vyzva = {}));
