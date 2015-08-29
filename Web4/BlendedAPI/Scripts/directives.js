var blended;
(function (blended) {
    blended.rootModule
        .controller('gotoHomeUrl', function ($scope) {
        $scope.gotoHomeUrl = function () { return Pager.gotoHomeUrl(); };
    })
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
        .filter('levelText', function () { return function (id) { return ['A1', 'A2', 'B1', 'B2'][id]; }; });
})(blended || (blended = {}));
