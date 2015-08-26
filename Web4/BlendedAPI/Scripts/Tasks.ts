module blended {

  export class controller {
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
    }
    href(url: IStateUrl): string {
      return this.ctx.$state.href(url.stateName, url.pars);
    }

    navigate(url: IStateUrl) {
      var hash = this.href(url);
      setTimeout(() => window.location.hash = hash, 1);
    }

    taskList(): Array<taskController> {
      var t: taskController = this.taskRoot();
      var res: Array<taskController> = [];
      while (t) { res.push(t); t = t.child; }
      return res;
    }
    taskRoot(): homeTaskController {
      var t = this;
      while (t.myState.name != prodStates.homeTask.name) t = t.parent;
      return <homeTaskController>t;
    }

    wrongUrlRedirect(url: IStateUrl) {
      if (!url) return;
      this.isWrongUrl = true;
      setTimeout(this.navigate(url), 1);
    }
  }
  export interface IControllerScope extends ng.IScope { ts: controller; } //$scope pro vsechny controllers

  //******* TASK VIEW - predchudce vsech controllers, co maji vizualni podobu (html stranku)
  export class taskViewController extends controller {
    constructor(state: IStateService) {
      super(state);
      this.title = this.parent.dataNode.title;
    }
    title: string;
    breadcrumb: Array<breadcrumbItem>;
    gotoHomeUrl() { Pager.gotoHomeUrl(); }
  }

  //******* TASK (predchudce vse abstraktnich controllers (mimo cviceni), reprezentujicich TASK). Task umi obslouzit zelenou sipku apod.
  export class taskController extends controller {

    //********************** FIELDS
    child: taskController; //child TASK v hiearchii STATES
    dataNode: CourseMeta.data; //sitemap produkt node
    user: IPersistNodeItem<IPersistNodeUser>; //user persistence, odpovidajici taskId

    //********************** Virtualni procs
    //dodelej task list do green stavu
    adjustChild() { }
    //posun stavu dal
    moveForward(ud: IPersistNodeUser) { throw 'notimplemented'; }
    //done priznak
    isDone():boolean { throw 'notimplemented'; }

    //********************* 
    constructor(state: IStateService, resolves?: Array<any>) {
      super(state);

      if (!state.current.dataNodeUrlParName) return;

      //provaz parent - child
      var paretScope = this.parent = state.parent; if (paretScope) paretScope.child = this;

      //dataNode
      var taskoot = this.taskRoot();
      if (taskoot == this) {
        this.dataNode = <blended.IProductEx>(resolves[0]);
      } else {
        this.dataNode = this.taskRoot().dataNode.nodeDir[this.ctx[state.current.dataNodeUrlParName]];
      }
      if (!this.dataNode) throw '!this.dataNode';

      //user data
      this.user = getPersistWrapper<IPersistNodeUser>(this.dataNode, this.ctx.taskid);
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
      var ud = this.user.short;
      if (this.isDone()) return null
      if (this.child) { //vyresi posun child?...
        var childUrl = this.child.goAhead();
        if (childUrl) return childUrl;  //... ano, posun udelal child
        this.log('doMoveForward, child finished'); //... ne musim jej udelat sam
      } else {
        this.log('doMoveForward');
      }
      this.moveForward(ud); //posun stav dopredu
      if (this.isDone()) return null;
      return this.goCurrent();
    }

    log(msg: string) {
      console.log('%%% ' + Utils.getObjectClassName(this) + ": " + msg + ' (' + this.dataNode.url + ')');
    }

  }

  //****************** PRODUCT HOME
  export class homeTaskController extends taskController { //task pro pruchod testem
    dataNode: IProductEx;
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
    done: boolean;
    urls: Array<string>;
    actLevel: levelIds; //aktualne probirany pretest
    targetLevel: levelIds; //vysledek pretestu pro done=true
  }


  export class pretestTaskController extends taskController { //task pro pruchod testem

    constructor(state: IStateService) {
      super(state);
      //sance prerusit navigaci
      this.user = getPersistWrapper<IPretestUser>(this.dataNode, this.ctx.taskid, () => {
        return { actLevel: levelIds.A2, urls: [this.actRepo(levelIds.A2).url], targetLevel: -1, done: false };
      });
      if (state.createMode != createControllerModes.navigate) return;
      this.wrongUrlRedirect(this.checkCommingUrl());
    }

    dataNode: IPretestRepository;
    user: IPersistNodeItem<IPretestUser>;

    isDone(): boolean { return this.user.short.done; }

    checkCommingUrl() {
      var ud = this.user.short;
      if (!ud) return { stateName: prodStates.home.name, pars: this.ctx }; //pretest jeste nezacal => goto product home
      if (ud.done) return null; //done pretest: vse je povoleno
      var dataNode = <IPretestRepository>this.dataNode;
      var actModule = dataNode.Items[ud.actLevel];
      var actEx = this.taskRoot().dataNode.nodeDir[this.ctx.Url];
      if (actModule.url != actEx.parent.url) { //cviceni neni v aktalnim modulu
        var pars = cloneAndModifyContext(this.ctx, c => c.moduleurl = encodeUrl(actModule.url));
        return { stateName: prodStates.home.name, pars: pars }; //v URL je adresa jineho nez aktivniho modulu (asi pomoci back) => jdi na prvni cviceni aktualniho modulu
      }
      return null;
    }

    adjustChild() {
      if (this.child) return;
      var ud = this.user.short;
      if (ud.done) return;
      var actModule = this.actRepo(ud.actLevel); if (!actModule) throw '!actModule';
      var state: IStateService = {
        params: cloneAndModifyContext(this.ctx, d => d.moduleurl = encodeUrl(actModule.url)),
        parent: this,
        current: prodStates.pretestModule,
        createMode: createControllerModes.adjustChild
      };
      this.child = new moduleTaskController(state);
    }

    moveForward(ud: IPretestUser) {
      var actTestItem = <exerciseTaskViewController>(this.child);
      var actRepo = this.actRepo(ud.actLevel);
      var childSummary = agregateChildShortInfos(this.child.dataNode, this.ctx.taskid);
      if (!childSummary.done || actTestItem.dataNode.url != actRepo.url) throw '!childUser.done || actTestItem.dataNode.parent.url != actRepo.url';
      var score = scorePercent(childSummary);

      if (actRepo.level == levelIds.A1) {
        this.finishPretest(ud, levelIds.A1);
      } else if (actRepo.level == levelIds.A2) {
        if (score >= actRepo.minScore && score < actRepo.maxScore) this.finishPretest(ud, levelIds.A2);
        else if (score < actRepo.minScore) this.newTestItem(ud, levelIds.A1);
        else this.newTestItem(ud, levelIds.B1);
      } else if (actRepo.level == levelIds.B1) {
        if (score >= actRepo.minScore && score < actRepo.maxScore) this.finishPretest(ud, levelIds.B1);
        else if (score < actRepo.minScore) this.finishPretest(ud, levelIds.A2);
        else this.newTestItem(ud, levelIds.B2);
      } else if (actRepo.level == levelIds.B2) {
        if (score < actRepo.minScore) this.finishPretest(ud, levelIds.B1);
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

  }

  //****************** linearni kurz nebo test
  export interface IModuleStateData {
    alowCycleExercise: boolean; //dovol pomoci zelene sipky cyklovani cviceni
  }

  export interface IModuleUser extends IPersistNodeUser { //course dato pro test
    actChildIdx: number;
  }

  export class moduleTaskController extends taskController implements IModuleStateData { //task pro pruchod lekcemi (repository je seznam cviceni)

    user: IPersistNodeItem<IModuleUser>;
    //IModuleStateData
    alowCycleExercise: boolean; //dovol pomoci zelene sipky cyklovani cviceni


    constructor(state: IStateService) {
      super(state);
      this.user = getPersistWrapper<IModuleUser>(this.dataNode, this.ctx.taskid, () => { return { done: false, actChildIdx: 0 }; });
    }

    isDone(): boolean { return !_.find(this.dataNode.Items, it => { var itUd = blended.getPersistData<IExShort>(it, this.ctx.taskid); return (!itUd || !itUd.done); }); }

    adjustChild() {
      if (this.child) return;
      var ud = this.user.short;
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
        createMode: createControllerModes.adjustChild
      };
      this.child = new vyzva.pretestExercise(state,null);
    }

    moveForward(ud: IModuleUser) {
      var ud = this.user.short;
      if (this.alowCycleExercise) {
        ud.actChildIdx = ud.actChildIdx == this.dataNode.Items.length - 1 ? 0 : ud.actChildIdx + 1;
        this.user.modified = true;
      }
      this.child = null;
    }

  }

}
