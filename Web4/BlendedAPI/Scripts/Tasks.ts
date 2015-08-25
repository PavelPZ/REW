module blended {

  export class controller  {
    ctx: learnContext;
    myState: state;
    parent: taskController;
    isWrongUrl: boolean;

    constructor(state: IStateService) {
      this.ctx = state.params;
      finishContext(this.ctx);
      $.extend(this, state.current.data);
      this.myState = state.current;
      this.parent = state.parent;
      //if (state.createForCheckUrl == createControllerCtx.navigate) { //sance zkontrolovat spravnost URL adresy
      //  _.each(this.taskList(), t => {
      //    if (!t.checkCommingUrl) return;
      //    var url = t.checkCommingUrl(); if (!url) return;

      //  });
      //}
    }
    href(url: IStateUrl): string {
      return this.ctx.$state.href(url.stateName, url.pars);
    }

    navigate(url: IStateUrl) {
      var hash = this.href(url);
      setTimeout(() => window.location.hash = hash, 1);
    }

    //test na validnost URL - sance presmerovat system jinam
    //checkCommingUrl: () => IStateUrl;

    taskList(): Array<taskController> {
      var t = this.taskRoot();
      var res: Array<taskController> = [];
      while (t) { res.push(t); t = t.child; }
      return res;
    }
    taskRoot(): taskController {
      var t = this;
      while (t.myState.name != prodStates.homeTask.name) t = t.parent;
      return <taskController>t;
    }

    wrongUrlRedirect(url: IStateUrl) {
      if (!url) return;
      this.isWrongUrl = true;
      setTimeout(this.navigate(url), 1);
    }

  }

  //export interface IViewControllerScope extends ng.IScope { ts: taskViewController; }
  export interface IControllerScope extends ng.IScope { ts: controller; }

  //******* TASK VIEW
  export class taskViewController extends controller {
    constructor(state: IStateService) {
      super(state);
      this.ctx = state.params;
      finishContext(this.ctx);
      $.extend(this, state.current.data);
      if (!this.ctx.$state) this.ctx.$state = this.parent.ctx.$state;
      this.title = this.parent.dataNode.title;
    }
    ctx: learnContext;
    title: string;
    breadcrumb: Array<breadcrumbItem>;
    gotoHomeUrl() { Pager.gotoHomeUrl(); }
  }

  //******* TASK 
  export class taskController extends controller {

    //********************** FIELDS
    child: taskController;
    dataNode: CourseMeta.data;
    product: IProductEx;

    //********************** Virtualni procs
    //inicialni naplneni user dat  (pri jejich prvnim vytvoreni)
    initPersistData(ud: IPersistNodeUser) { ud.done = false; } //ud.url = this.dataNode.url; }
    //dodelej task list do green stavu
    adjustChild() { }
    //posun stavu dal
    moveForward(ud: IPersistNodeUser) { throw 'notimplemented'; }

    //********************* 
    constructor(state: IStateService) {
      super(state);

      if (!state.current.dataNodeUrlParName) return;

      this.ctx.product = loader.productCache.fromCache(this.ctx);
      if (!this.ctx.product) return;

      var paretScope = this.parent = state.parent;
      if (paretScope) {
        paretScope.child = this; if (!this.ctx.$state) this.ctx.$state = state.parent.ctx.$state;
      }

      this.dataNode = this.ctx.product.nodeDir[this.ctx[state.current.dataNodeUrlParName]];
      if (!this.dataNode) throw '!this.dataNode';

      //var wrongRedirect = this.checkCommingUrl();
      //if (wrongRedirect) {
      //  this.isWrongUrl = true;
      //  this.navigate(wrongRedirect);
      //  return;
      //}

      if (state.createForCheckUrl != createControllerCtx.checkForUrl) this.doInitPersistData();
    }

    getPersistData: () => IPersistNodeUser = () => { return getPersistData<IPersistNodeUser>(this.dataNode, this.ctx.taskid); }
    setPersistData: (modify: (data: IPersistNodeUser) => void) => IPersistNodeUser = modify => { return setPersistData<IPersistNodeUser>(this.dataNode, this.ctx.taskid, modify); }
      //var it = this.dataNode.userData ? this.dataNode.userData[this.ctx.taskid] : null;
      //if (!it) {
      //  it = { data: <any>{}, modified: true };
      //  if (!this.dataNode.userData) this.dataNode.userData = {};
      //  this.dataNode.userData[this.ctx.taskid] = it;
      //} else
      //  it.modified = true;
      //modify(it.data);
      //return it.data;

    doInitPersistData: () => IPersistNodeUser = () => {
      var ud = this.getPersistData();
      if (!ud) ud = this.setPersistData(ud => { //prvni vstup do tasku
        this.log('initPersistData');
        this.initPersistData(ud);
      });
      return ud;
    }

    goCurrent(): IStateUrl {
      var t = this;
      while (t) {
        t.adjustChild();
        if (!t.child) return { stateName: t.myState.name, pars: t.ctx };
        t = t.child;
      }
    }

    //posun zelenou sipkou. Child Musi byt adjusted (goCurrent -> goAhead -> goAhead...)
    goAhead(): IStateUrl {
      var ud = this.getPersistData();
      if (ud.done) return null
      if (this.child) { //vyresi posun child?...
        var childUrl = this.child.goAhead();
        if (childUrl) return childUrl;  //... ano, posun udelal child
        this.log('doMoveForward, child finished'); //... ne musim jej udelat sam
      } else {
        this.log('doMoveForward');
      }
      this.moveForward(ud); //posun stav dopredu
      if (ud.done) return null;
      return this.goCurrent();
    }

    log(msg: string) {
      console.log('%%% ' + Utils.getObjectClassName(this) + ": " + msg + ' (' + this.dataNode.url + ')');
    }

    //addToHistory(child: taskController, ud: IPersistNodeUser) {
    //  if (!ud.history) ud.history = [];
    //  var hist: IPersistHistoryItem = { date: Utils.nowToNum(), url: child.dataNode.url, taskId: child.ctx.taskid };
    //  if (_.find(ud.history, h => h.url == hist.url && h.taskId == hist.taskId)) return;
    //  ud.history.push(hist);
    //}

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


  export class pretestTaskController extends taskController { //task pro pruchod testem

    constructor(state: IStateService) {
      super(state);
      //sance prerusit navigaci
      this.wrongUrlRedirect(this.checkCommingUrl());
    }

    getPersistData: () => IPretestUser;
    setPersistData: (modify: (data: IPretestUser) => void) => IPretestUser;
    doInitPersistData: () => IPretestUser;
    dataNode: IPretestRepository;

    checkCommingUrl () {
      var ud = this.getPersistData();
      if (!ud) return { stateName: prodStates.home.name, pars: this.ctx }; //pretest jeste nezacal => goto product home
      if (ud.done) return null; //done pretest: vse je povoleno
      var dataNode = <IPretestRepository>this.dataNode;
      var actModule = dataNode.Items[ud.actLevel];
      var actEx = this.ctx.product.nodeDir[this.ctx.Url];
      if (actModule.url != actEx.parent.url) { //cviceni neni v aktalnim modulu
        var pars = cloneAndModifyContext(this.ctx, c => c.moduleurl = encodeUrl(actModule.url));
        return { stateName: prodStates.home.name, pars: pars }; //v URL je adresa jineho nez aktivniho modulu (asi pomoci back) => jdi na prvni cviceni aktualniho modulu
      }
      return null;
    }

    initPersistData(ud: IPretestUser) {
      if (ud.urls) return;
      super.initPersistData(ud);
      ud.actLevel = levelIds.A2;
      ud.urls = [this.actRepo(levelIds.A2).url];
    }

    adjustChild() {
      if (this.child) return;
      var ud = this.getPersistData();
      if (ud.done) return;
      var actModule = this.actRepo(ud.actLevel); if (!actModule) throw '!actModule';
      var state: IStateService = {
        params: cloneAndModifyContext(this.ctx, d => d.moduleurl = encodeUrl(actModule.url)),
        parent: this,
        current: prodStates.pretestModule,
        createForCheckUrl: createControllerCtx.adjustChild
      };
      this.child = new moduleTaskController(state);
    }

    moveForward(ud: IPretestUser) {
      var actTestItem = <exerciseTaskViewController>(this.child);
      var actRepo = this.actRepo(ud.actLevel);
      var childUser = actTestItem.getPersistData(); if (!childUser.done || actTestItem.dataNode.url != actRepo.url) throw '!childUser.done || actTestItem.dataNode.parent.url != actRepo.url';

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
    }

    newTestItem(ud: IPretestUser, lev: levelIds) {
      this.child = null;
      ud.actLevel = lev;
      ud.urls.push(this.actRepo(lev).url);
    }
    finishPretest(ud: IPretestUser, lev: levelIds) {
      this.child = null;
      ud.done = true; ud.targetLevel = lev; delete ud.actLevel;
    }
    actRepo(lev: levelIds): IPretestItemRepository { return _.find(this.dataNode.Items, l => l.level == lev); }

    //getName(): string { return vyzva.stateNames.taskPretest; }
  }

  //****************** linearni kurz nebo test
  export interface IModuleStateData {
    alowCycleExercise: boolean; //dovol pomoci zelene sipky cyklovani cviceni
  }

  export interface IModuleUser extends IPersistNodeUser { //course dato pro test
    actChildIdx: number;
  }

  export class moduleTaskController extends taskController implements IModuleStateData { //task pro pruchod lekcemi (repository je seznam cviceni)

    alowCycleExercise: boolean; //dovol pomoci zelene sipky cyklovani cviceni

    getPersistData: () => IModuleUser;
    setPersistData: (modify: (data: IModuleUser) => void) => IModuleUser;

    adjustChild() {
      if (this.child) return;
      var ud = this.getPersistData();
      if (ud.done) return;
      var exNode: CourseMeta.data;
      if (!this.alowCycleExercise) {
        exNode = _.find(this.dataNode.Items, it => { var itUd = blended.getPersistData<IExShort>(it, this.ctx.taskid); return (!itUd || !itUd.done); });
      } else {
        exNode = this.dataNode.Items[ud.actChildIdx];
      }
      if (!exNode) return;
      var state: IStateService = {
        params: cloneAndModifyContext(this.ctx, d => d.url = encodeUrl(exNode.url)),
        parent: this,
        current: prodStates.pretestExercise,
        createForCheckUrl: createControllerCtx.adjustChild
      };
      this.child = new vyzva.pretestExercise(state);
    }

    initPersistData(ud: IModuleUser) {
      super.initPersistData(ud);
      ud.actChildIdx = 0;
    }
    moveForward(ud: IModuleUser) {
      var ud = this.getPersistData();
      if (this.alowCycleExercise) {
        this.setPersistData(d => { if (d.actChildIdx == this.dataNode.Items.length - 1) d.actChildIdx = 0; else d.actChildIdx++; });
      }
      if (_.all(this.dataNode.Items, it => { var itUd = blended.getPersistData<IExShort>(it, this.ctx.taskid); return (itUd && itUd.done); }))
        this.setPersistData(d => d.done = true);
      this.child = null;
    }

  }

}

  //export class controllerLow {
  //  constructor($scope: IControllerLowScope, public $state: angular.ui.IStateService) {
  //    this.ctx = <learnContext><any>($state.params);
  //    finishContext(this.ctx);
  //    $.extend(this, $state.current.data);
  //    $scope.ts = this;
  //  }
  //  ctx: learnContext;
  //}

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
  //    //return node ? new greenProxy(node, this.ctx) /*TODO: null;
  //  }
  //}

  //export class pretestState extends state {
  //  constructor(st: angular.ui.IState, public exerciseState: state) {
  //    super(st);
  //  }

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

  //}

  //export interface IPretestStateData extends blended.IStateData {
  //  dataNode: IPretestRepository;
  //}
