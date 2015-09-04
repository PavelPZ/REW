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
    .controller('collapsable', $scope => $scope.isCollapsed = true)
    .filter("rawhtml", ['$sce', $sce => htmlCode => $sce.trustAsHtml(htmlCode)])
  ;
}