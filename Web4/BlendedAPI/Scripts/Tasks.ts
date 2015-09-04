module blended {

  export class controller {
    ctx: learnContext;
    state: state;
    parent: controller;
    isWrongUrl: boolean;
    $scope: IControllerScope;

    title: string;
    breadcrumb: Array<breadcrumbItem>;

    constructor(stateService: IStateService) {
      this.ctx = stateService.params;
      this.$scope = stateService.$scope;
      this.state = stateService.current;
      if (this.$scope) this.$scope.state = this.state;
      this.parent = stateService.parent;
    }
    href(url: IStateUrl): string {
      return this.ctx.$state.href(url.stateName, url.pars);
    }

    navigate(url: IStateUrl) {
      if (!url) return;
      var hash = this.href(url);
      setTimeout(() => window.location.hash = hash, 1);
    }
    navigateWrapper(): (stateName: string) => void { //kvui moznosti dat jako parametr diraktivy
      var self = this;
      return stateName => self.navigate({ stateName: stateName, pars: self.ctx });
    }


    taskList(): Array<taskController> {
      var t: taskController = this.taskRoot();
      var res: Array<taskController> = [];
      while (t) { res.push(t); t = t.child; }
      return res;
    }
    taskRoot<T extends homeTaskController>(): T {
      var t = this;
      while (t.state.name != prodStates.homeTask.name) t = t.parent;
      return <T>t;
    }

    wrongUrlRedirect(url: IStateUrl) {
      if (!url) return;
      this.isWrongUrl = true;
      setTimeout(this.navigate(url), 1);
    }
  }
  export interface IControllerScope extends ng.IScope { ts: controller; state: state; api: () => Object; /*globalni api*/ } //$scope pro vsechny controllers

  //******* TASK VIEW - predchudce vsech controllers, co maji vizualni podobu (html stranku)
  export class taskViewController extends controller {
    constructor(state: IStateService) {
      super(state);
      this.title = this.parent.dataNode.title;
    }
    parent: taskController;
  }


  export enum moveForwardResult {
    toParent /*neumi se posunout dopredu, musi se volat moveForward parenta*/,
    selfAdjustChild /*posunuto dopredu, nutno spocitat goCurrent a skocit na jiny task*/,
    selfInnner /*posun osetren v ramci zmeny stavu aktualniho tasku (bez nutnosti navigace na jiny task)*/
  }

  export interface taskControllerType {
    new (state: IStateService, resolves?: Array<any>);
  }
  //******* TASK (predchudce vse abstraktnich controllers (mimo cviceni), reprezentujicich TASK). Task umi obslouzit zelenou sipku apod.
  export class taskController extends controller {

    //********************** FIELDS
    child: taskController; //child TASK v hiearchii STATES
    dataNode: CourseMeta.data; //sitemap produkt node
    user: IPersistNodeItem<IPersistNodeUser>; //user persistence, odpovidajici taskId
    parent: taskController;
    isProductHome: boolean;

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

    //********************** GREEN MANAGEMENT
    // Zelena sipka je prirazena nejakemu ACT_TASK (Pretest nebo Lesson ve VYZVA aplikaci apod.)
    // Zelena sipka neni videt, musi se skocit do tasku pomoci ACT_TASK.goCurrent
    // Pak je videt a pri kliku na sipku se vola ACT_TASK.goAhead 
    // Vrati-li ACT_TASK.goAhead null, skoci se na home produktu

    // **** goCurrent
    // PARENT na zaklade USER dat svych childu urcuje, ktery z nich je narade (pomoci funkce PARENT.adjustChild)
    // skace se na posledni child, co vrati adjustChild() null

    //Fake dodelavka TASKLIST (pridanim taskuu s 'createMode=createControllerModes.adjustChild') tak, aby posledni v rade byl task, na ktery se skace.
    //Sance parent tasku prenest zodpovednost na child.
    //Klicove je do childUrl tasku doplnit spravny task.ctx, aby v goCurrent fungovalo 'return { stateName: t.state.name, pars: t.ctx }'
    adjustChild(): taskController { return null; }

    //posun stavu dal
    moveForward(): moveForwardResult { throw 'notimplemented'; }

    //priznak pro 'if (t.taskControllerSignature)' test, ze tento objekt je task.
    taskControllerSignature() { }

    //nevirtualni funkce: dobuduje TASKLIST umele vytvorenymi tasks (pomoci adjust Child) a vrati URL posledniho child v TASKLIST.
    goCurrent(): IStateUrl {
      var t = this;
      while (t) {
        var newt = t.adjustChild();
        if (!newt) return { stateName: t.state.name, pars: t.ctx };
        t = newt;
      }
    }

    navigateAhead() {
      this.navigate(this.goAhead());
    }

    goAhead(): IStateUrl {
      //seznam od childs k this
      var taskList: Array<taskController> = [];
      var act = this; while (act) {
        if (!act.taskControllerSignature) break;
        taskList.push(act);
        act = act.child;
      }
      //najdi prvni task, co se umi posunout dopredu
      for (var i = taskList.length - 1; i >= 0; i--) {
        var act = taskList[i];
        switch (act.moveForward()) {
          case moveForwardResult.selfInnner: return null;
          case moveForwardResult.toParent: break;
          case moveForwardResult.selfAdjustChild: return act.goCurrent();
        }
      }
      //ani jeden z parentu move nevyresil => jdi na home produktu
      return { stateName: prodStates.home.name, pars: this.ctx }
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
    min: number; 
    // pro A2: nad toto skore se spousti B1
    // pro B1: nad toto skore se spousti B2
    max: number;
    level: levelIds;
  }

  export interface IPretestUser extends IPersistNodeUser { //course dato pro IPretestRepository
    done: boolean;
    history: Array<levelIds>;
    actLevel: levelIds; //aktualne probirany pretest
    targetLevel: levelIds; //vysledek pretestu pro done=true
  }


  export class pretestTaskController extends taskController { //task pro pruchod testem

    constructor(state: IStateService) {
      super(state);
      //sance prerusit navigaci
      this.user = getPersistWrapper<IPretestUser>(this.dataNode, this.ctx.taskid, () => {
        return { actLevel: levelIds.A2, history: [levelIds.A2], targetLevel: -1, done: false };
      });
      if (state.createMode != createControllerModes.navigate) return;
      this.wrongUrlRedirect(this.checkCommingUrl());
    }

    dataNode: IPretestRepository;
    user: IPersistNodeItem<IPretestUser>;

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

    adjustChild(): taskController {
      var ud = this.user.short;
      if (ud.done) return null;
      var actModule = this.actRepo(ud.actLevel); if (!actModule) throw '!actModule';
      var state: IStateService = {
        params: cloneAndModifyContext(this.ctx, d => d.moduleurl = encodeUrl(actModule.url)),
        parent: this,
        current: prodStates.pretestModule,
        createMode: createControllerModes.adjustChild
      };
      return new moduleTaskController(state);
    }

    moveForward(): moveForwardResult {
      var ud = this.user.short;
      var actTestItem = <exerciseTaskViewController>(this.child);
      var actRepo = this.actRepo(ud.actLevel);
      if (actTestItem.dataNode != actRepo) throw 'actTestItem.dataNode != actRepo';
      var childSummary = agregateShortFromNodes(this.child.dataNode, this.ctx.taskid, actTestItem.state.moduleAlowFinishWhenUndone /*do vyhodnoceni zahrn i nehotova cviceni*/);
      if (!childSummary.done) throw '!childUser.done';
      var score = scorePercent(childSummary);

      if (actRepo.level == levelIds.A1) {
        return this.finishPretest(ud, levelIds.A1);
      } else if (actRepo.level == levelIds.A2) {
        if (score >= actRepo.min && score < actRepo.max) return this.finishPretest(ud, levelIds.A2);
        else if (score < actRepo.min) return this.newTestItem(ud, levelIds.A1);
        else return this.newTestItem(ud, levelIds.B1);
      } else if (actRepo.level == levelIds.B1) {
        if (score >= actRepo.min && score < actRepo.max) return this.finishPretest(ud, levelIds.B1);
        else if (score < actRepo.min) return this.finishPretest(ud, levelIds.A2);
        else return this.newTestItem(ud, levelIds.B2);
      } else if (actRepo.level == levelIds.B2) {
        if (score < actRepo.min) return this.finishPretest(ud, levelIds.B1);
        else return this.finishPretest(ud, levelIds.B2);
      }
      throw 'not implemented';
    }

    newTestItem(ud: IPretestUser, lev: levelIds): moveForwardResult {
      this.user.modified = true;
      ud.actLevel = lev;
      ud.history.push(lev);
      return moveForwardResult.selfAdjustChild;
    }
    finishPretest(ud: IPretestUser, lev: levelIds): moveForwardResult {
      this.user.modified = true;
      ud.done = true; ud.targetLevel = lev; delete ud.actLevel;
      return moveForwardResult.toParent;
    }
    actRepo(lev: levelIds): IPretestItemRepository { return _.find(this.dataNode.Items, l => l.level == lev); }

  }

  //****************** linearni kurz nebo test

  export interface IModuleUser extends IPersistNodeUser { //course dato pro test
    actChildIdx: number;
    //na TRUE nastaveno pri nasilnem ukonceni testu tlacitkem FINISH test 
    //(protoze kdyz nejsou vyhodnocena vsechna cviceni, tak by se nepoznalo, zdali je modul ukoncen nebo ne)
    //neni jeste implementovano
    done: boolean;
  }

  export function moduleIsDone(nd: CourseMeta.data, taskId: string): boolean {
    return !_.find(nd.Items, it => { var itUd = blended.getPersistData<IExShort>(it, taskId); return (!itUd || !itUd.done); });
  }

  export function isEx(nd: CourseMeta.data) { return CourseMeta.isType(nd, CourseMeta.runtimeType.ex); }

  export class moduleTaskController extends taskController { //task pro pruchod lekcemi (repository je seznam cviceni)

    user: IPersistNodeItem<IModuleUser>;
    exercises: Array<CourseMeta.data>;
    congratulation: boolean; //priznak, ze modul byl prave preveden do stavu DONE a ukazuje se congratulation dialog

    constructor(state: IStateService) {
      super(state);
      this.user = getPersistWrapper<IModuleUser>(this.dataNode, this.ctx.taskid, () => { return { done: false, actChildIdx: 0 }; });
      this.exercises = _.filter(this.dataNode.Items, it => isEx(it));
    }

    onExerciseLoaded(idx: number) {
      var ud = this.user.short;
      if (ud.done) { ud.actChildIdx = idx; this.user.modified = true; }
    }

    adjustChild(): taskController {
      var ud = this.user.short;
      var exNode = ud.done ? this.exercises[ud.actChildIdx] : _.find(this.exercises, it => { var itUd = blended.getPersistData<IExShort>(it, this.ctx.taskid); return (!itUd || !itUd.done); });
      if (!exNode) { debugger; ud.done = true; this.user.modified = true; }

      var moduleExerciseState = _.find(this.state.childs, ch => !ch.noModuleExercise);
      var state: IStateService = {
        params: cloneAndModifyContext(this.ctx, d => d.url = encodeUrl(exNode.url)),
        parent: this,
        current: moduleExerciseState,
        createMode: createControllerModes.adjustChild
      };
      return new moduleExerciseState.oldController(state, null);
    }

    moveForward(): moveForwardResult {
      if (this.congratulation) { delete this.congratulation; return moveForwardResult.toParent; }
      var ud = this.user.short;
      if (ud.done) {
        ud.actChildIdx = ud.actChildIdx == this.exercises.length - 1 ? 0 : ud.actChildIdx + 1;
        this.user.modified = true;
        return moveForwardResult.selfAdjustChild;
      } else {
        var exNode = _.find(this.exercises, it => { var itUd = blended.getPersistData<IExShort>(it, this.ctx.taskid); return (!itUd || !itUd.done); });
        if (!ud.done && !exNode) { //cerstve hotovo
          ud.done = true; this.user.modified = true;
          return moveForwardResult.toParent;
          //this.congratulation = true; return moveForwardResult.selfInnner;
        }
        return moveForwardResult.selfAdjustChild;
      }
    }

  }

}
