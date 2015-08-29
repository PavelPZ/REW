var vyzva;
(function (vyzva) {
    blended.rootModule
        .directive('vyzva$home$item', function () { return new homeLesson(); });
    var homeLesson = (function () {
        function homeLesson() {
            this.link = function (scope, el) {
                var ts = (scope.ts());
                $.extend(scope, ts);
            };
            this.templateUrl = blended.baseUrlRelToRoot + '/blendedapi/vyzva/views/home/lesson.html';
            this.scope = { ts: '&ts' };
        }
        return homeLesson;
    })();
    vyzva.homeLesson = homeLesson;
})(vyzva || (vyzva = {}));
