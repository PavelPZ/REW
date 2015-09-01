var vyzva;
(function (vyzva) {
    blended.rootModule
        .directive('vyzva$home$item', function () { return new homeLesson(); });
    var homeLesson = (function () {
        function homeLesson() {
            this.templateUrl = blended.baseUrlRelToRoot + '/blendedapi/vyzva/views/home/lesson.html';
            this.scope = { ts: '&ts', api: "&api" };
        }
        return homeLesson;
    })();
    vyzva.homeLesson = homeLesson;
})(vyzva || (vyzva = {}));
