module angular.ui {
  export interface IState {
    childs?: Array<blended.state>;
    dataNodeUrlParName?: string;
  }

}

module blended {

  export function createStateData<T>(data: T): T { return data; }

  export enum createControllerCtx {
    adjustChild,
    checkForUrl,
    navigate
  }

  export interface IStateService {
    current: state;
    params: learnContext;
    parent: taskController;
    createForCheckUrl: createControllerCtx;
    $scope?: IControllerScope;
    isWrongUrl?: boolean;
  }

  //aktualni data ke stavu: user data z persistence a CourseMeta.data z URL parametru
  //export interface IStateData {
  //  dataNode: CourseMeta.data;
  //  man: stateManager;
  //  state: state;
  //}

  export interface IStateUrl {
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
            $scope.ts = <any>{ isWrongUrl: true, parent: parent }; return;
          }
          //neni isWrongUrl, pokracuj
          var params = <learnContext><any>($state.params);
          params.$state = $state;
          var ss: IStateService = { current: self, params: params, parent: parent, createForCheckUrl: createControllerCtx.navigate, $scope: $scope };
          var task = <controller>(new this.oldController(ss, resolves));
          $scope.ts = task;
        });
        st.controller = <any>services;
        //st.controller = <any>['$scope', '$state', ($scope: ITaskControllerScope, $state: angular.ui.IStateService) => {
        //  var params = <learnContext><any>($state.params);
        //  params.$state = $state;
        //  var ss: IStateService = { current: self, params: params, parent: (<ITaskControllerScope>($scope.$parent)).ts, createForCheckUrl: createControllerCtx.navigate };
        //  var task = new this.oldController(ss);
        //  $scope.ts = task;
        //}];
      }
      $.extend(this, st);
    }
    childs: Array<state>;
    parent: state;
    name: string;
    dataNodeUrlParName: string;
    data: {};
    resolve: {};
    oldController: any;
    
    //******* Inicializace: linearizace state tree na definict states
    initFromStateTree(provider: ng.ui.IStateProvider, root?: state) {
      provider.state(this);
      _.each(this.childs, ch => {
        ch.parent = this;
        ch.name = this.name + '.' + ch.name;
        ch.initFromStateTree(provider, root);
      });
    }

    //sance osetrit nekonsistentni URL (kterou by se prislo do nekonsistentniho stavu)
    //static onRouteChangeStart(e: angular.IAngularEvent, toState: blended.state, toParams: learnContext, $location: angular.ILocationService, $state: angular.ui.IStateService) {
    //  //v parents neni prodStates.homeTask (jedna se o stav mimo spravu managera, napr. na home webu)
    //  var st = toState;
    //  while (st && st != prodStates.homeTask) st = st.parent;
    //  if (!st) return;

    //  //neni produkt - laduje se na home:
    //  var prod = loader.productCache.fromCache(toParams);
    //  //var stateMan = new stateManager(toState, toParams);
    //  if (!prod) { //jeste neni naladovan produkt, jdi na home, kde se naladuje.
    //    if (toState == prodStates.home) return; //jsem na home => return (home se musi naladovat vzdy, neni z ni redirekc)
    //    //neni naladovan produkt a neni home page => goto home page
    //    e.preventDefault();
    //    var hash = $state.href(prodStates.home.name, toParams);
    //    setTimeout(() => window.location.hash = hash, 1);
    //    return;
    //  }

    //  //vse je OK, zjisti konsistenci stavu
    //  var st = toState;
    //  while (st) {
    //    if (st.dataNodeUrlParName) {
    //      var ss: IStateService = { current: st, params: toParams, parent: null, createForCheckUrl: createControllerCtx.checkForUrl };
    //      var task: taskController = new st.oldController(ss);
    //      var url = task.checkCommingUrl();
    //      if (url) {
    //        e.preventDefault();
    //        var hash = $state.href(url.stateName, url.pars);
    //        setTimeout(() => window.location.hash = hash, 1);
    //        return;
    //      }
    //    }
    //    st = st.parent;
    //  }
    //}
    //******* state man persistence
    //getPersistData: (data: IStateData) => IPersistNodeUser = (data) => {
    //  return getPersistData(data.dataNode, data.man.ctx.taskid);
    //}
    //setPersistData: (data: IStateData, modify: (data: IPersistNodeUser) => void) => IPersistNodeUser = (data, modify) => {
    //  var it = data.dataNode.userData ? data.dataNode.userData[data.man.ctx.taskid] : null;
    //  if (!it) {
    //    it = { data: <any>{}, modified: true };
    //    if (!data.dataNode.userData) data.dataNode.userData = {};
    //    data.dataNode.userData[data.man.ctx.taskid] = it;
    //  } else
    //    it.modified = true;
    //  modify(it.data);
    //  return it.data;
    //}

    ////runtime: sance v $stateChangeStart modifikovat URL
    //modifyTargetState(data: IStateData): IStateUrl { return null; }

    ////jdi na aktualni stranku
    //greenState(data: IStateData): IStateUrl { return null; }

    ////inicializace persistentnich dat
    //initPersistData(data: IStateData, ud: IPersistNodeUser) {
    //  ud.url = data.dataNode.url;
    //}

    //doInitPersistData(data: IStateData) {
    //  var st = data.state;
    //  var ud = st.getPersistData(data);
    //  if (!ud) ud = st.setPersistData(data, ud => { //prvni vstup do tasku
    //    this.log(data, 'initPersistData');
    //    st.initPersistData(data, ud);
    //  });
    //}

    //log(data: IStateData, msg: string) {
    //  console.log('%%% ' + Utils.getObjectClassName(this) + ": " + msg + ' (' + data.dataNode.url + ')');
    //}
  }

  //export class stateManager {

  //  product: IProductEx;
  //  dir: { [stateName: string]: taskController; } = {};
  //  //list: Array<IStateData> = [];

  //  constructor(state: blended.state, public ctx: learnContext) {
  //    //product
  //    this.product = loader.productCache.fromCache(ctx);
  //    if (!this.product) return; //do stavu se prislo asi zadanim URL nebo pomoci Refresh => jdi na product home
  //    //zjisti states info
  //    var st = state;
  //    while (true) {
  //      if (st.dataNodeUrlParName) {
  //        var url = ctx[st.dataNodeUrlParName];
  //        var dataNode = this.product.nodeDir[url];
  //        //TODO
  //        var inf = new taskController(null); //: IStateData = { dataNode: dataNode, man: this, state: st };
  //        this.dir[st.name] = inf;
  //        //this.list.push(inf);
  //      }
  //      if (st == prodStates.homeTask) break;
  //      st = st.parent;
  //    }
  //  }

    
  //}
}