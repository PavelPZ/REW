namespace vyzva {
  blended.rootModule
    .directive('vyzva$lector$tabs', () => new lectorTabs())
  ;

  export class lectorTabs{
    link = (scope, el: ng.IAugmentedJQuery) => {
      scope.tabs = getLectorTabs();
      scope.navigate = (idx: number) => {
        var actIdx = <number>(scope.actIdx());
        if (idx == actIdx) return;
        var doNavigate = <any>(scope.doNavigate());
        var tab = getLectorTabs()[idx];
        doNavigate(tab.stateName);
      }
    };
    templateUrl = vyzvaRoot + 'views/lector/_tabs.html';
    scope = { doNavigate: '&doNavigate', actIdx: '&actIdx', longTitle: '&longTitle' };
  }

  export interface ITabModel {
    idx: number;
    stateName: string;
    shortTitle: string;
    longTitle?: string;
  }

  var tabs: Array<ITabModel>;
  export function getLectorTabs(): Array<ITabModel> {
    return tabs || [
      { idx: 0, stateName: stateNames.lectorHome.name, shortTitle: 'Seznam studentů' },
      { idx: 1, stateName: stateNames.lectorEval.name, shortTitle: 'Vyhodnocení testů' }
    ];
  }

}