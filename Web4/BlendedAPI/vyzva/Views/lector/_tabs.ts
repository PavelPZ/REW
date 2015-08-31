namespace vyzva {
  blended.rootModule
    .directive('vyzva$lector$tabs', () => new lectorTabs())
  ;

  export class lectorTabs{
    link = (scope, el: ng.IAugmentedJQuery) => {
      this.tabs = getLectorTabs();
      this.ts = <blended.controller>(scope.ts());
      this.actIdx = <number>(scope.actIdx());
      scope.tabs = this.tabs;
      scope.navigate = idx => this.navigate(idx);
    };
    templateUrl = vyzvaRoot + 'views/lector/_tabs.html';
    scope = { ts: '&ts', actIdx: '&actIdx', longTitle: '&longTitle' };
    ts: blended.controller;
    actIdx: number;
    tabs: Array<ITabModel>;
    navigate(idx: number) {
      if (idx == this.actIdx) return;
      var tab = this.tabs[idx];
      this.ts.navigate({ stateName: tab.stateName, pars: this.ts.ctx });
    }
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
      { idx: 0, stateName: stateNames.lectorHome.name, shortTitle: 'Studenti' },
      { idx: 1, stateName: stateNames.lectorEval.name, shortTitle: 'Vyhodnocení testů' }
    ];
  }

}