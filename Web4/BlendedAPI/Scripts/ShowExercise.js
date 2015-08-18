var blended;
(function (blended) {
    function showExerciseDirective() {
        return {
            link: function (scope, el, attrs) {
                scope.$on('$destroy', function () {
                    alert('destroy');
                });
                //setTimeout(() => el.html(attrs['exUrl']), 1);
                el.html(attrs['exUrl']);
            },
        };
    }
    blended.showExerciseDirective = showExerciseDirective;
    ;
})(blended || (blended = {}));
