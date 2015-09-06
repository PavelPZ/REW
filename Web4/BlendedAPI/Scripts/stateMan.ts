module angular.ui {
  export interface IState {
    childs?: Array<blended.state>;
    //DATA parametry
    dataNodeUrlParName?: string;
    //ommitBreadCrumb?: boolean; //neukazuje se titulek
    //moduleAlowCycleExercise?: boolean; //pro modul: dovol pomoci zelene sipky cyklovani cviceni
    //moduleAlowFinishWhenUndone?:boolean; //pro modul: dovol jej oznacit jako DONE pomoci FINISH tlacitka i kdyz nejsou vsechna cviceni hotova. Zatim nenaprogramovano.
    exerciseShowWarningPercent?: number; //exerciseIsTest=false => procenta, kdy se ukaze varovani
    //exerciseIsTest?: boolean; //pro cviceni: neukazovat vzhodnoceny stav
    //exerciseOmitModuleMap?: boolean; //neukazuje moduleMap
    //isGreenArrowRoot?: boolean; //task, co se stara o posun zelenou sipkou (cviceni hleda v parentech tento task, na ktery vola goAhead)
    noModuleExercise?: boolean; //state-module.childs, ktery je cvicenim modulu. Toto state-exercise.controller se pouzije pri vytvoreni URL cviceni v adjustChild

    moduleType?: blended.moduleServiceType;
  }

}

module blended {

  export enum moduleServiceType { pretest, lesson, test }

  export function createStateData<T>(data: T): T { return data; }

  //export enum createControllerModes {
  //  adjustChild, //dake controller vytvoreny pro ziskani aktualni URL
  //  navigate //controller, vytvoreny by ui-route
  //}

  //parametr CONTROLLER konstructoru
  export interface IStateService {
    current: state; //ui-route state
    params: learnContext; //query parametters
    parent: taskController; //parent $scope.ts
    //createMode: createControllerModes; 
    //$scope?: IControllerScope; //$scope
    //isWrongUrl?: boolean; //priznak nevalidni URL. Preskakuje se vytvareni dalsic CONTROLLERs
  }

  export interface IStateUrl { //parametr pro navigaci pomoci state services
    stateName: string;
    pars?: learnContext;
  }

  //export var globalApi: {
  //  new ($scope: IControllerScope, $state: angular.ui.IStateService, ctx: learnContext): Object;
  //};

  //export var globalApi: Function;

  //zaregistrovany stav (v app.ts)
  export class state implements angular.ui.IState {

    childs: Array<state>; //child states
    parent: state; //parent state
    name: string; //jmeno
    dataNodeUrlParName: string; //jmeno atributu v learnContext. learnContext[dataNodeUrlParName] urcuje URL v produkt sitemap
    data: {}; //dalsi parametry state
    resolve: {}; //asynchronni parametry state
    //oldController: taskControllerType; //puvodni controller (ktery je nahrazen a pouzit zprostredkovane vyse)
    controller: taskControllerType; //puvodni controller (ktery je nahrazen a pouzit zprostredkovane vyse)
    //controller: taskControllerType;

    //ui-route state.data
    //exerciseIsTest: boolean;
    exerciseShowWarningPercent: number;
    //moduleAlowCycleExercise: boolean;
    //moduleAlowFinishWhenUndone: boolean; //existuje tlacitko FINISH. Zatim nenaprogramovano.
    //isGreenArrowRoot: boolean;
    noModuleExercise: boolean;
    moduleType: blended.moduleServiceType;
    
    constructor(st: angular.ui.IState) {
      //this.oldController = <any>(st.controller); var self = this;
      //if (this.oldController) {
      //  var services: Array<any> = ['$scope', '$state' ];
      //  if (st.resolve) for (var p in st.resolve) services.push(p);
      //  services.push(($scope: IControllerScope, $state: angular.ui.IStateService, ...resolves: Array<Object>) => {
      //    var parent: taskController = (<any>($scope.$parent)).ts;
      //    //kontrola jestli nektery z parentu nenastavil isWrongUrl. Pokud ano, vrat fake controller
      //    if (parent && parent.isWrongUrl) {
      //      parent.isWrongUrl = false;
      //      $scope.ts = <any>{ isWrongUrl: true, parent: parent }; return;
      //    }
      //    //neni isWrongUrl, pokracuj
      //    var params = <learnContext><any>($state.params);
      //    finishContext(params);
      //    params.$state = $state;
      //    var ss: IStateService = { current: self, params: params, parent: parent, createMode: createControllerModes.navigate, $scope: $scope };
      //    var task = <controller>(new this.oldController(ss, resolves));
      //    $scope.ts = task;
      //    if (globalApi) {
      //      var api = new globalApi($scope, $state, params);
      //      $scope.api = () => api;
      //    }
      //  });
      //  st.controller = <any>services;
      //}
      $.extend(this, st);
    }
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