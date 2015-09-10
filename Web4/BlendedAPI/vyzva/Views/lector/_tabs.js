var vyzva;
(function (vyzva) {
    blended.rootModule
        .directive('vyzva$lector$tabs', function () { return new lectorTabs(); });
    var lectorTabs = (function () {
        function lectorTabs() {
            this.link = function (scope, el) {
                scope.tabs = getLectorTabs();
                scope.navigate = function (idx) {
                    var actIdx = (scope.actIdx());
                    if (idx == actIdx)
                        return;
                    var doNavigate = (scope.doNavigate());
                    var tab = getLectorTabs()[idx];
                    doNavigate(tab.stateName);
                };
            };
            this.templateUrl = 'vyzva$lector$tabs.html';
            this.scope = { doNavigate: '&doNavigate', actIdx: '&actIdx', longTitle: '&longTitle' };
        }
        return lectorTabs;
    })();
    vyzva.lectorTabs = lectorTabs;
    var tabs;
    function getLectorTabs() {
        return tabs || [
            { idx: 0, stateName: vyzva.stateNames.lectorHome.name, shortTitle: 'Seznam studentů' },
            { idx: 1, stateName: vyzva.stateNames.lectorEval.name, shortTitle: 'Vyhodnocení testů' }
        ];
    }
    vyzva.getLectorTabs = getLectorTabs;
})(vyzva || (vyzva = {}));
