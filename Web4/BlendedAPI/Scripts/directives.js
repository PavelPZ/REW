var blended;
(function (blended) {
    blended.rootModule
        .filter('lineIdsText', function () {
        return function (id) {
            switch (id) {
                case LMComLib.LineIds.English: return "Angličtina";
                case LMComLib.LineIds.German: return "Němčina";
                case LMComLib.LineIds.French: return "Francouzština";
                default: return "???";
            }
        };
    })
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
        .controller('collapsable', function () { this.isCollapsed = true; })
        .filter("rawhtml", ['$sce', function ($sce) { return function (htmlCode) { return $sce.trustAsHtml(htmlCode); }; }]);
})(blended || (blended = {}));
