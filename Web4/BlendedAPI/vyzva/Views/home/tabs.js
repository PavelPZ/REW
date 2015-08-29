var vyzva;
(function (vyzva) {
    blended.rootModule
        .directive('vyzva$home$tabs', function () { return new vyzva.homeLector(); });
    var homeTabs = (function () {
        function homeTabs() {
            this.link = function (scope) {
                var ts = (scope.ts());
            };
            this.templateUrl = blended.baseUrlRelToRoot + '/blendedapi/vyzva/views/home/tabs.html';
            this.scope = { ts: '&ts' };
        }
        return homeTabs;
    })();
    vyzva.homeTabs = homeTabs;
})(vyzva || (vyzva = {}));
