var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
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
        }
        lessonTest.prototype.congratulationDialog = function () {
            var ok = this.modService.agregUser.ms ? Math.round(this.modService.agregUser.s / this.modService.agregUser.ms * 100) > 65 : false;
            if (ok) {
                this.tbCongratulation = 'Gratulujeme k dokončení testu! Pokud test obsahuje mluvený projev, byl zaslán vašemu Učiteli k vyhodnocení.';
            }
            else {
                this.tbCongratulationTitle = 'Test nesplněn';
                this.tbCongratulation = 'Skóre, dosažené v testu, je menší než 65%. O dalším pokračování v kurzu musí rozhodnout váš učitel';
            }
            return _super.prototype.congratulationDialog.call(this);
        };
        return lessonTest;
    })(exerciseViewLow);
    vyzva.lessonTest = lessonTest;
    var vyzva$exercise$keyboardkey = (function () {
        function vyzva$exercise$keyboardkey() {
            this.scope = { key: '@key' };
            this.link = function (scope, el, attrs) {
                el.on('mousedown', function () {
                    var $focused = $(':focus');
                    if ($focused[0].tagName.toLowerCase() != 'input')
                        return;
                    insertAtCaret($focused[0], scope.key);
                    return false;
                });
            };
        }
        return vyzva$exercise$keyboardkey;
    })();
    vyzva.vyzva$exercise$keyboardkey = vyzva$exercise$keyboardkey;
    function insertAtCaret(element, text) {
        if (document.selection) {
            element.focus();
            var sel = document.selection.createRange();
            sel.text = text;
            element.focus();
        }
        else if (element.selectionStart || element.selectionStart === 0) {
            var startPos = element.selectionStart;
            var endPos = element.selectionEnd;
            var scrollTop = element.scrollTop;
            element.value = element.value.substring(0, startPos) + text + element.value.substring(endPos, element.value.length);
            element.focus();
            element.selectionStart = startPos + text.length;
            element.selectionEnd = startPos + text.length;
            element.scrollTop = scrollTop;
        }
        else {
            element.value += text;
            element.focus();
        }
    }
    blended.rootModule
        .directive('vyzva$exercise$keyboardkey', function () { return new vyzva$exercise$keyboardkey(); });
})(vyzva || (vyzva = {}));
