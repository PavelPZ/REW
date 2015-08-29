module blended {
  blended.rootModule
    .controller('gotoHomeUrl', ($scope) => {
      $scope.gotoHomeUrl = () => Pager.gotoHomeUrl();
    })
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

  ;
}