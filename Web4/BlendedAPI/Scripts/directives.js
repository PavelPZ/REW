var blended;
(function (blended) {
    function lineIdToText(id) {
        switch (id) {
            case LMComLib.LineIds.English: return "Angličtina";
            case LMComLib.LineIds.German: return "Němčina";
            case LMComLib.LineIds.French: return "Francouzština";
            default: return "???";
        }
    }
    blended.lineIdToText = lineIdToText;
    ;
    blended.rootModule
        .filter('lineIdsText', function () { return function (id) { return lineIdToText(id); }; })
        .filter('lineIdsFlag', function () {
        return function (id) {
            switch (id) {
                case LMComLib.LineIds.English: return "flag-small-english";
                case LMComLib.LineIds.German: return "flag-small-german";
                case LMComLib.LineIds.French: return "flag-small-french";
                default: return "???";
            }
        };
    })
        .filter('levelText', function () { return function (id) { return ['A1', 'A2', 'B1', 'B2'][id]; }; })
        .filter("rawhtml", ['$sce', function ($sce) { return function (htmlCode) { return $sce.trustAsHtml(htmlCode); }; }])
        .directive('lmEnterKey', ['$document', function ($document) {
            return {
                link: function (scope, element, attrs) {
                    var enterWatcher = function (event) {
                        if (event.which === 13) {
                            scope.lmEnterKey();
                            scope.$apply();
                            event.preventDefault();
                            $document.unbind("keydown keypress", enterWatcher);
                        }
                    };
                    $document.bind("keydown keypress", enterWatcher);
                },
                scope: {
                    lmEnterKey: "&"
                },
            };
        }])
        .directive('collapsablemanager', function () { return new collapseMan(); });
    var collapseMan = (function () {
        function collapseMan() {
            this.link = function (scope, el, attrs) {
                var id = attrs['collapsablemanager'];
                var th = {
                    isCollapsed: true,
                    collapseToogle: function () {
                        var act = (scope[id]);
                        if (act.isCollapsed)
                            _.each(collapseMan.allCollapsable, function (man, id) { return man.isCollapsed = true; });
                        act.isCollapsed = !act.isCollapsed;
                    },
                };
                scope[id] = collapseMan.allCollapsable[id] = th;
                scope.$on('$destroy', function () { return delete collapseMan.allCollapsable[id]; });
            };
        }
        collapseMan.allCollapsable = {};
        return collapseMan;
    })();
    blended.collapseMan = collapseMan;
})(blended || (blended = {}));
