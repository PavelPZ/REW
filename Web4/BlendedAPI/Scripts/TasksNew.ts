module blended {

  export class controllerLow {
    constructor($scope: IControllerLowScope, public $state: angular.ui.IStateService) {
      this.ctx = <learnContext><any>($state.params);
      finishContext(this.ctx);
      $.extend(this, $state.current.data);
      $scope.ts = this;
    }
    ctx: learnContext;
  }
  export interface IControllerLowScope extends ng.IScope { ts: controllerLow; }
  export interface ITaskControllerScope extends IControllerLowScope { ts: taskController; }

  export class taskViewController extends controllerLow {
    constructor($scope: IControllerLowScope, $state: angular.ui.IStateService) {
      super($scope, $state);
      this.myControler = (<ITaskControllerScope>$scope.$parent).ts;
      this.title = this.myControler.dataNode.title;
    }
    title: string;
    breadcrumb: Array<breadcrumbItem>;
    gotoHomeUrl() { Pager.gotoHomeUrl(); }
    myControler: taskController;
  }

  export class taskController extends controllerLow {

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
    //vytvoreni child status na zaklade aktualniho stavu
    createChild(ud: IPersistNodeUser) { throw 'notimplemented'; }
    getName(): string { return ''; }


    //********************** 
    constructor($scope: ITaskControllerScope, public $state: angular.ui.IStateService, dataNodeUrlParName:string, $loadedProduct?: blended.IProductEx) {
      super($scope, $state);
      //this.ctx = <learnContext><any>($state.params);
      //finishContext(this.ctx);
      //$.extend(this, $state.current.data);
      //$scope.ts = this;
      //provazani scopes
      var paretScope = <ITaskControllerScope>$scope.$parent;
      if (paretScope && paretScope.ts && paretScope.ts.product) {
        this.parent = paretScope.ts; this.product = paretScope.ts.product;
        this.parent.child = this;
      } else
        this.product = $loadedProduct;

      this.dataNode = this.product.nodeDir[this.ctx[dataNodeUrlParName]];
      //this.title = this.dataNode.title;

      //inicializace persistence
      var ud = this.getPersistData();
      if (!ud) ud = this.setPersistData(ud => {
        this.log('createStatus');
        this.initPersistData(ud);
      });
      //this.log('createChild');
      //this.createChild(ud);
    }
    static $inject = ['$scope', '$state'];

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

    //posun zelenou sipkou
    goAhead(): boolean {
      var ud = this.getPersistData();
      if (ud.done) return false
      if (this.child) { //vyresi posun child?...
        if (this.child.goAhead()) { //... ano, posun udelal child
          this.addToHistory(this.child, ud);
          return true;
        }
        this.log('doMoveForward, child finished'); //... ne musim jej udelat sam
      } else {
        this.log('doMoveForward');
      }
      var error = this.moveForward(ud); //posun stav dopredu
      if (error) throw error;
      this.createChild(ud);
      return !ud.done;
    }

    addToHistory(child: taskController, ud: IPersistNodeUser) {
      if (!ud.history) ud.history = [];
      var hist: IPersistHistoryItem = { date: Utils.nowToNum(), url: child.dataNode.url, taskId: child.ctx.taskid };
      if (_.find(ud.history, h => h.url == hist.url && h.taskId == hist.taskId)) return;
      ud.history.push(hist);
    }

    href(state: string, params?: {}): string {
      return this.$state.href(state, params);
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
    actLevel: levelIds;
    targetLevel: levelIds; //vysledek pretestu pro done=true
  }

  export class pretestTaskController extends taskController { //task pro pruchod testem

    getPersistData: () => IPretestUser;
    setPersistData: (modify: (data: IPretestUser) => void) => IPretestUser;
    dataNode: IPretestRepository;

    initPersistData(ud: IPretestUser) {
      super.initPersistData(ud);
      ud.actLevel = levelIds.A2;
      ud.urls = [];
      ud.urls.push(this.actRepo(levelIds.A2).url);
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

    getName(): string { return vyzva.stateNames.taskPretest; }
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
    createChild(ud: IModuleUser) {  }

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
    createChild(ud: IExUser) {  }
  }
}