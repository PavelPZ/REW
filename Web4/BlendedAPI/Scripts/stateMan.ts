module angular.ui {
  export interface IState {
    childs?: Array<blended.state>;
    //DATA parametry
    dataNodeUrlParName?: string;
    ommitTitle?: boolean; //neukazuje se titulek
    ommitBreadCrumb?: boolean; //neukazuje se titulek
    moduleAlowCycleExercise?: boolean; //pro modul: dovol pomoci zelene sipky cyklovani cviceni
    exerciseShowWarningPercent?: number; //exerciseIsTest=false => procenta, kdy se ukaze varovani
    exerciseIsTest?: boolean; //pro cviceni: neukazovat vzhodnoceny stav
  }

}

module blended {

  export function createStateData<T>(data: T): T { return data; }

  export enum createControllerModes {
    adjustChild, //dake controller vytvoreny pro ziskani aktualni URL
    navigate //controller, vytvoreny by ui-route
  }

  //parametr CONTROLLER konstructoru
  export interface IStateService {
    current: state; //ui-route state
    params: learnContext; //query parametters
    parent: taskController; //parent $scope.ts
    createMode: createControllerModes; 
    $scope?: IControllerScope; //$scope
    isWrongUrl?: boolean; //priznak nevalidni URL. Preskakuje se vytvareni dalsic CONTROLLERs
  }

  export interface IStateUrl { //parametr pro navigaci pomoci state services
    stateName: string;
    pars?: learnContext;
  }

  //zaregistrovany stav (v app.ts)
  export class state implements angular.ui.IState {
    constructor(st: angular.ui.IState) {
      this.oldController = <any>(st.controller); var self = this;
      if (this.oldController) {
        var services: Array<any> = ['$scope', '$state'];
        if (st.resolve) for (var p in st.resolve) services.push(p);
        services.push(($scope: IControllerScope, $state: angular.ui.IStateService, ...resolves: Array<Object>) => {
          var parent: taskController = (<any>($scope.$parent)).ts;
          //kontrola jestli nektery z parentu nenastavil isWrongUrl. Pokud ano, vrat fake controller
          if (parent && parent.isWrongUrl) {
            parent.isWrongUrl = false;
            $scope.ts = <any>{ isWrongUrl: true, parent: parent }; return;
          }
          //neni isWrongUrl, pokracuj
          var params = <learnContext><any>($state.params);
          params.$state = $state;
          var ss: IStateService = { current: self, params: params, parent: parent, createMode: createControllerModes.navigate, $scope: $scope };
          var task = <controller>(new this.oldController(ss, resolves));
          $scope.ts = task;
        });
        st.controller = <any>services;
      }
      $.extend(this, st);
    }
    childs: Array<state>; //child states
    parent: state; //parent state
    name: string; //jmeno
    dataNodeUrlParName: string; //jmeno atributu v learnContext. learnContext[dataNodeUrlParName] urcuje URL v produkt sitemap
    data: {}; //dalsi parametry state
    resolve: {}; //asynchronni parametry state
    oldController: any; //puvodni controller (ktery je nahrazen a pouzit zprostredkovane vyse)

    //ui-route state.data
    exerciseIsTest: boolean;
    exerciseShowWarningPercent: number;
    
    //******* Inicializace: linearizace state tree na definict states
    initFromStateTree(provider: ng.ui.IStateProvider, root?: state) {
      provider.state(this);
      _.each(this.childs, ch => {
        ch.parent = this;
        ch.name = this.name + '.' + ch.name;
        ch.initFromStateTree(provider, root);
      });
    }
  }
}