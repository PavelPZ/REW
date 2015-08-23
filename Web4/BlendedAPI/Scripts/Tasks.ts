module blended {

  //export class controllerLow {
  //  constructor($scope: IControllerLowScope, public $state: angular.ui.IStateService) {
  //    this.ctx = <learnContext><any>($state.params);
  //    finishContext(this.ctx);
  //    $.extend(this, $state.current.data);
  //    $scope.ts = this;
  //  }
  //  ctx: learnContext;
  //}
  export interface IControllerLowScope extends ng.IScope { ts: taskViewController; }
  export interface ITaskControllerScope extends ng.IScope { ts: taskController; }

  //******* TASK VIEW
  export class taskViewController {
    constructor(state: IStateService) {
      this.ctx = state.params;
      finishContext(this.ctx);
      $.extend(this, state.current.data);
      this.myTask = state.parent;
      this.title = this.myTask.dataNode.title;
    }
    ctx: learnContext;
    title: string;
    breadcrumb: Array<breadcrumbItem>;
    gotoHomeUrl() { Pager.gotoHomeUrl(); }
    myTask: taskController;
  }

  //******* GREEN PROXY 
  //export class greenProxy {
  //  constructor(public dataNode: CourseMeta.data, public ctx: learnContext) { }
  //  getChild(): IStateUrl { throw 'notimplemented'; }
  //  getPersistData: () => IPersistNodeUser = () => {
  //    return getPersistData(this.dataNode, this.ctx.taskid);
  //  }
  //}

  //******* TASK 
  export class taskController {

    //********************** FIELDS
    child: taskController;
    parent: taskController;
    dataNode: CourseMeta.data;
    product: IProductEx;
    ctx: learnContext;

    //********************** Virtualni procs
    //inicialni naplneni user dat  (pri jejich prvnim vytvoreni)
    initPersistData(ud: IPersistNodeUser) {
      ud.url = this.dataNode.url;
    }
    //posun stavu dal
    moveForward(ud: IPersistNodeUser): string { throw 'notimplemented'; }
    //getName(): string { return ''; }
    modifyTargetState(): IStateUrl { return null; }

    //********************** 
    constructor(state: IStateService) {
      if (!state.current.dataNodeUrlParName) return;

      this.ctx = state.params;
      finishContext(this.ctx);

      this.product = loader.productCache.fromCache(this.ctx);
      if (!this.product) return;

      var paretScope = this.parent = state.parent;
      if (paretScope) paretScope.child = this;

      this.dataNode = this.product.nodeDir[this.ctx[state.current.dataNodeUrlParName]];

      if (state.canModifyUserData) this.doInitPersistData();
      //this.log('createChild');
      //this.createChild(ud);
    }
    //static $inject = ['$scope', '$state'];

    getPersistData: () => IPersistNodeUser = () => {
      return getPersistData(this.dataNode, this.ctx.taskid);
    }
    setPersistData: (modify: (data: IPersistNodeUser) => void) => IPersistNodeUser = modify => {
      var it = this.dataNode.userData ? this.dataNode.userData[this.ctx.taskid] : null;
      if (!it) {
        it = { data: <any>{}, modified: true };
        if (!this.dataNode.userData) this.dataNode.userData = {};
        this.dataNode.userData[this.ctx.taskid] = it;
      } else
        it.modified = true;
      modify(it.data);
      return it.data;
    }

    log(msg: string) {
      console.log('%%% ' + Utils.getObjectClassName(this) + ": " + msg + ' (' + this.dataNode.url + ')');
    }

    doInitPersistData: () => IPersistNodeUser = () => {
      var ud = this.getPersistData();
      if (!ud) ud = this.setPersistData(ud => { //prvni vstup do tasku
        this.log('initPersistData');
        this.initPersistData(ud);
      });
      return ud;
    }

    //posun zelenou sipkou
    //goAhead(): boolean {
    //  var ud = this.getPersistData();
    //  if (ud.done) return false
    //  if (this.child) { //vyresi posun child?...
    //    if (this.child.goAhead()) { //... ano, posun udelal child
    //      this.addToHistory(this.child, ud);
    //      return true;
    //    }
    //    this.log('doMoveForward, child finished'); //... ne musim jej udelat sam
    //  } else {
    //    this.log('doMoveForward');
    //  }
    //  var error = this.moveForward(ud); //posun stav dopredu
    //  if (error) throw error;
    //  this.createChild(ud);
    //  return !ud.done;
    //}

    addToHistory(child: taskController, ud: IPersistNodeUser) {
      if (!ud.history) ud.history = [];
      var hist: IPersistHistoryItem = { date: Utils.nowToNum(), url: child.dataNode.url, taskId: child.ctx.taskid };
      if (_.find(ud.history, h => h.url == hist.url && h.taskId == hist.taskId)) return;
      ud.history.push(hist);
    }

    href(state: string, params?: {}): string {
      //return this.ctx.$state.href(state, params);
      return '';
    }

  }

  //****************** PRETEST
  export interface IPretestRepository extends CourseMeta.data {
    Items: Array<IPretestItemRepository>; //levels, napr. levels[level.A1]
  }

  export interface IPretestItemRepository extends CourseMeta.data {
    //pro A2: pod toto skore ma uroven A1
    //pro B1: pod toto skore ma uroven A2
    //pro B2: pod toto skore ma uroven B1
    minScore: number; 
    // pro A2: nad toto skore se spousti B1
    // pro B1: nad toto skore se spousti B2
    maxScore: number;
    level: levelIds;
  }

  export interface IPretestUser extends IPersistNodeUser { //course dato pro IPretestRepository
    urls: Array<string>;
    actLevel: levelIds; //aktualne probirany pretest
    targetLevel: levelIds; //vysledek pretestu pro done=true
  }

  //export class pretestGreenProxy extends greenProxy {
  //  constructor(public dataNode: IPretestRepository, ctx: learnContext) {
  //    super(dataNode, ctx);
  //  }
  //  getPersistData: () => IPretestUser;
  //  getChild(): IStateUrl {
  //    var ud = this.getPersistData(); if (ud.done) return null;
  //    var act: IPretestItemRepository = _.find(this.dataNode.Items, l => l.level == ud.actLevel); if (!act) throw '!act';
  //    return new pretestItemGreenProxy(act, this.ctx).getChild();
  //  }
  //}

  //export class pretestItemGreenProxy extends greenProxy {
  //  constructor(public dataNode: IPretestItemRepository, ctx: learnContext) {
  //    super(dataNode, ctx);
  //  }
  //  getPersistData: () => IModuleUser;
  //  getChild(): IStateUrl {
  //    var ud = this.getPersistData(); if (ud.done) return null;
  //    var node = _.find(this.dataNode.Items, it => {
  //      var nodeUd = blended.getPersistData(it, '*** TODO');
  //      return nodeUd != null && !nodeUd.done;
  //    });
  //    //return node ? new greenProxy(node, this.ctx) /*TODO*/: null;
  //  }
  //}

  export class pretestState extends state {
    constructor(st: angular.ui.IState, public exerciseState: state) {
      super(st);
    }

    //getPersistData: (data: IPretestStateData) => IPretestUser;
    //setPersistData: (data: IPretestStateData, modify: (data: IPretestUser) => void) => IPretestUser;

    //modifyTargetState(data: IPretestStateData): IStateUrl {
    //  var ud = this.getPersistData(data);
    //  //if (!ud) return { stateName: prodStates.home.name, pars: data.man.ctx }; //pretest jeste nezacal => goto home
    //  if (ud && ud.done) return null; //done pretest: vse je povoleno
    //  var dataNode = <IPretestRepository>data.dataNode;
    //  if (!ud) ud = this.setPersistData(data, d => {
    //    d.url = dataNode.url;
    //    d.actLevel = levelIds.A2;
    //    d.urls = [this.actRepo(data, levelIds.A2).url];
    //  });
    //  var actModule = dataNode.Items[ud.actLevel];
    //  if (actModule.url != data.man.ctx.moduleUrl) {
    //    var pars = cloneAndModifyContext(data.man.ctx, c => {
    //      c.moduleurl = enocdeUrl(actModule.url);
    //      c.url = enocdeUrl(actModule.Items[0].url);
    //    });
    //    return { stateName: this.exerciseState.name, pars: pars }; //v URL je adresa jineho nez aktivniho modulu (asi pomoci back) => jdi na prvni cviceni aktualniho modulu
    //  }
    //  return null;
    //}

    //initPersistData(data: IPretestStateData, ud: IPretestUser) {
    //  super.initPersistData(data, ud);
    //  ud.actLevel = levelIds.A2;
    //  ud.urls = [this.actRepo(data, levelIds.A2).url];
    //}

    //actRepo(data: IPretestStateData, lev: levelIds): IPretestItemRepository { return _.find(data.dataNode.Items, l => l.level == lev); }

  }

  //export interface IPretestStateData extends blended.IStateData {
  //  dataNode: IPretestRepository;
  //}

  export class pretestTaskController extends taskController { //task pro pruchod testem

    getPersistData: () => IPretestUser;
    setPersistData: (modify: (data: IPretestUser) => void) => IPretestUser;
    doInitPersistData: () => IPretestUser;
    dataNode: IPretestRepository;

    initPersistData(ud: IPretestUser) {
      super.initPersistData(ud);
      ud.actLevel = levelIds.A2;
      ud.urls = [this.actRepo(levelIds.A2).url];
    }

    modifyTargetState(): IStateUrl {
      var ud = this.getPersistData();
      //if (!ud) return { stateName: prodStates.home.name, pars: data.man.ctx }; //pretest jeste nezacal => goto home
      if (ud && ud.done) return null; //done pretest: vse je povoleno
      var dataNode = <IPretestRepository>this.dataNode;
      ud = this.doInitPersistData();
      var actModule = dataNode.Items[ud.actLevel];
      if (actModule.url != this.ctx.moduleUrl) {
        var pars = cloneAndModifyContext(this.ctx, c => {
          c.moduleurl = enocdeUrl(actModule.url);
          c.url = enocdeUrl(actModule.Items[0].url);
        });
        return { stateName: blended.prodStates.pretestExercise.name, pars: pars }; //v URL je adresa jineho nez aktivniho modulu (asi pomoci back) => jdi na prvni cviceni aktualniho modulu
      }
      return null;
    }

    moveForward(ud: IPretestUser): string {
      var actTestItem = <moduleTaskController>(this.child);
      var actRepo = this.actRepo(ud.actLevel);
      var childUser = actTestItem.getPersistData(); if (!childUser.done || actTestItem.dataNode.url != actRepo.url) return 'tasks.pretestTask.doGoAhead: !testUser.done || testUser.url != actRepo.url';

      if (actRepo.level == levelIds.A1) {
        this.finishPretest(ud, levelIds.A1);
      } else if (actRepo.level == levelIds.A2) {
        if (childUser.score >= actRepo.minScore && childUser.score < actRepo.maxScore) this.finishPretest(ud, levelIds.A2);
        else if (childUser.score < actRepo.minScore) this.newTestItem(ud, levelIds.A1);
        else this.newTestItem(ud, levelIds.B1);
      } else if (actRepo.level == levelIds.B1) {
        if (childUser.score >= actRepo.minScore && childUser.score < actRepo.maxScore) this.finishPretest(ud, levelIds.B1);
        else if (childUser.score < actRepo.minScore) this.finishPretest(ud, levelIds.A2);
        else this.newTestItem(ud, levelIds.B2);
      } else if (actRepo.level == levelIds.B2) {
        if (childUser.score < actRepo.minScore) this.finishPretest(ud, levelIds.B1);
        else this.finishPretest(ud, levelIds.B2);
      }
      return null;
    }

    createChild(ud: IPretestUser) {
      var act: IPretestItemRepository = _.find(this.dataNode.Items, l => l.level == ud.actLevel);
      if (!act) throw '!act';
      //????? TODO this.child = new moduleTask(act, this.ctx);
    }

    newTestItem(ud: IPretestUser, lev: levelIds) {
      ud.actLevel = lev;
      ud.urls.push(this.actRepo(lev).url);
    }
    finishPretest(ud: IPretestUser, lev: levelIds) {
      ud.done = true; ud.targetLevel = lev; this.child = null;
    }
    actRepo(lev: levelIds): IPretestItemRepository { return _.find(this.dataNode.Items, l => l.level == lev); }

    //getName(): string { return vyzva.stateNames.taskPretest; }
  }

  //****************** linearni kurz nebo test
  export interface IModuleUser extends IPersistNodeUser { //course dato pro test
  }

  export interface IModuleUrlPars { //URL parametry
    tasktype: string; //identifikace tasku, v ramci ktereho je modul spusten. Pro Vyzva projekt je to lesson, pretest
    moduleurl: string; //url node s modulem
    mode: string; //course, test, preview
  }

  export class moduleTaskController extends taskController { //task pro pruchod lekcemi (repository je seznam cviceni)

    getPersistData: () => IModuleUser;
    setPersistData: (modify: (data: IModuleUser) => void) => IModuleUser;

    initPersistData(ud: IModuleUser) {
      super.initPersistData(ud);
    }
    moveForward(ud: IModuleUser): string { ud.done = true; return null; }
    createChild(ud: IModuleUser) { }

  }

  export interface IExUser extends IPersistNodeUser { //course dato pro test
  }

  export interface IExerciseUrlPars extends IModuleUrlPars { //URL parametry
    url: string; //url node se cvicenim
  }


  export class exerciseTaskController extends taskController { //task pro pruchod lekcemi
    getPersistData: () => IExUser;
    setPersistData: (modify: (data: IModuleUser) => void) => IModuleUser;

    initPersistData(ud: IExUser) {
      super.initPersistData(ud);
    }
    moveForward(ud: IExUser): string { ud.done = true; return null; }
    createChild(ud: IExUser) { }
  }
}