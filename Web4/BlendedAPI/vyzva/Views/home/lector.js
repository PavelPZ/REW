var vyzva;
(function (vyzva) {
    blended.rootModule
        .directive('vyzva$home$lectors', function () { return new homeLector(); });
    var homeLector = (function () {
        function homeLector() {
            this.link = function (scope) {
                var ts = (scope.ts());
            };
            this.templateUrl = blended.baseUrlRelToRoot + '/blendedapi/vyzva/views/home/lector.html';
            this.scope = { ts: '&ts' };
        }
        return homeLector;
    })();
    vyzva.homeLector = homeLector;
})(vyzva || (vyzva = {}));
