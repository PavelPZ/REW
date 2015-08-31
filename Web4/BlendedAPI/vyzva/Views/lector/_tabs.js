var vyzva;
(function (vyzva) {
    blended.rootModule
        .directive('vyzva$lector$tabs', function () { return new lectorTabs(); });
    var lectorTabs = (function () {
        function lectorTabs() {
            var _this = this;
            this.link = function (scope, el) {
                _this.tabs = tabs || [
                    { idx: 0, stateName: vyzva.stateNames.lectorHome.name, shortTitle: 'Studenti' },
                    { idx: 1, stateName: vyzva.stateNames.lectorEval.name, shortTitle: 'Vyhodnocení testů' },
                ];
                _this.ts = (scope.ts());
                _this.actIdx = (scope.actIdx());
                scope.tabs = _this.tabs;
                scope.navigate = function (idx) { return _this.navigate(idx); };
            };
            this.templateUrl = vyzva.vyzvaRoot + 'views/lector/_tabs.html';
            this.scope = { ts: '&ts', actIdx: '&actIdx', longTitle: '&longTitle' };
        }
        lectorTabs.prototype.navigate = function (idx) {
            if (idx == this.actIdx)
                return;
            var tab = this.tabs[idx];
            this.ts.navigate({ stateName: tab.stateName, pars: this.ts.ctx });
        };
        return lectorTabs;
    })();
    vyzva.lectorTabs = lectorTabs;
    var tabs;
})(vyzva || (vyzva = {}));
