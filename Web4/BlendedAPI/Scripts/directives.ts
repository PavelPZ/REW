module blended {
  export function lineIdToText(id: LMComLib.LineIds) {
    switch (id) {
      case LMComLib.LineIds.English: return "Angličtina";
      case LMComLib.LineIds.German: return "Němčina";
      case LMComLib.LineIds.French: return "Francouzština";
      default: return "???";
    }
  };
  blended.rootModule
    .filter('lineIdsText', () => (id: LMComLib.LineIds) => lineIdToText(id))
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
  //.controller('collapsable', function () { this.isCollapsed = true; })
    .filter("rawhtml", ['$sce', $sce => htmlCode => $sce.trustAsHtml(htmlCode)])
    .directive('lmEnterKey', ['$document', $document => {
      return {
        link: function (scope: any, element, attrs) {
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
    }])
    .directive('collapsablemanager', () => new collapseMan())
  ;


  export class collapseMan {
    link: (scope, el: ng.IAugmentedJQuery, attrs: ng.IAttributes) => void = (scope, el, attrs) => {
      var id = attrs['collapsablemanager'];
      var th: ICollapseMan = {
        isCollapsed: true,
        collapseToogle: () => {
          var act = <ICollapseMan>(scope[id]);
          if (act.isCollapsed) _.each(collapseMan.allCollapsable, (man, id) => man.isCollapsed = true);
          act.isCollapsed = !act.isCollapsed;
        },
      }; 
      scope[id] = collapseMan.allCollapsable[id] = th;
      scope.$on('$destroy', () => delete collapseMan.allCollapsable[id]);
    };
    static allCollapsable: { [id: string]: ICollapseMan; } = {};
  }
  interface ICollapseMan {
    isCollapsed: boolean;
    collapseToogle();
  }
}