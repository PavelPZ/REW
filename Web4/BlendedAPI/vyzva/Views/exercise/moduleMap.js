var vyzva;
(function (vyzva) {
    blended.rootModule
        .directive('vyzva$exercise$modulemap', function () { return new exerciseModuleMap(); });
    var exerciseModuleMap = (function () {
        function exerciseModuleMap() {
            this.templateUrl = vyzva.vyzvaRoot + 'views/exercise/modulemap.html';
            this.scope = { items: '&items', selectExercise: '&selectExercise' };
        }
        return exerciseModuleMap;
    })();
    vyzva.exerciseModuleMap = exerciseModuleMap;
})(vyzva || (vyzva = {}));
