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
        .directive('collapsablemanager', ['$cookies', function (cookies) { return new collapseMan(cookies); }])
        .directive('directive$toc', ['$anchorScroll', function ($anchorScroll) { return new directive$toc($anchorScroll); }]);
    var directive$toc = (function () {
        function directive$toc($anchorScroll) {
            this.link = function (scope, el, attrs) {
                scope.tocScrollTo = function (id) { return alert(id); };
            };
        }
        return directive$toc;
    })();
    blended.directive$toc = directive$toc;
    var collapseMan = (function () {
        function collapseMan(cookies) {
            this.link = function (scope, el, attrs) {
                var id = attrs['collapsablemanager'];
                var collapsed = true;
                if (id.charAt(0) == '+') {
                    id = id.substr(1);
                    collapsed = false;
                }
                if (id.indexOf('help') >= 0) {
                    collapsed = cookies.get('lmcoll_' + id) == 'collapsed';
                }
                var th = {
                    isCollapsed: collapsed,
                    collapseToogle: function () {
                        var act = (scope[id]);
                        if (act.isCollapsed)
                            _.each(collapseMan.allCollapsable, function (man, id) { return man.isCollapsed = true; });
                        act.isCollapsed = !act.isCollapsed;
                        var now = new Date();
                        var exp = new Date(now.getFullYear(), now.getMonth() + 6, now.getDate());
                        cookies.put('lmcoll_' + id, act.isCollapsed ? 'collapsed' : 'expanded', { 'expires': exp });
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
