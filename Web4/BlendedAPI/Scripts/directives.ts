module blended {
  blended.rootModule
    .filter('lineIdsText', () => {
      return (id: LMComLib.LineIds) => {
        switch (id) {
          case LMComLib.LineIds.English: return "Angličtina";
          case LMComLib.LineIds.German: return "Němčina";
          case LMComLib.LineIds.French: return "Francouzština";
          default: return "???";
        }
      };
    })
    .filter('lineIdsFlag', () => {
      return (id: LMComLib.LineIds) => {
        switch (id) {
          case LMComLib.LineIds.English: return "flag-small-english";
          case LMComLib.LineIds.German: return "flag-small-german";
          case LMComLib.LineIds.French: return "flag-small-french";
          default: return "???";
        }
      };
    })
    .filter('levelText', () => (id: number) => ['A1', 'A2', 'B1', 'B2'][id])
    .controller('collapsable', function () { this.isCollapsed = true; })
    .filter("rawhtml", ['$sce', $sce => htmlCode => $sce.trustAsHtml(htmlCode)])
    .directive('lmEnterKey', function ($document) {
      return {
        link: function (scope:any, element, attrs) {
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
      }
    })
  ;
}