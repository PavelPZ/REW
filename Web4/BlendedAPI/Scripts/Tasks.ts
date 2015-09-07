module blended {

  //vyjimecne parent tasks
  export interface ITaskContext {
    productParent: homeTaskController;
    pretestParent: pretestTaskController;
    moduleParent: moduleTaskController;
    exParent: exerciseTaskViewController;
    lectorParent: vyzva.lectorController;
  }
  export var taskContextAs = {
    product: 'productParent',
    pretest: 'pretestParent',
    module: 'moduleParent',
    ex: 'exParent',
    lector: 'lectorParent',
  };
  export function extendTaskContext($scope, task: controller) {
    for (var p in taskContextAs) {
      var propName = taskContextAs[p]; var value = $scope[propName];
      if (value) task[propName] = $scope[propName];
    }
  }

  export class controller implements ITaskContext {
    ctx: learnContext;
    state: state;
    $state: angular.ui.IStateService;
    //parent: controller;
    isWrongUrl: boolean;
    $scope: IControllerScope;

    isFakeCreate: boolean; //vytvoreni pri moveForward (nikoliv pres URL adresu) - kvuli vypoctu nasledujici stranky pro zelenou sipky 

    //ITaskContext
    productParent: homeTaskController;
    pretestParent: pretestTaskController;
    moduleParent: moduleTaskController;
    exParent: exerciseTaskViewController;
    lectorParent: vyzva.lectorController;

    //pro (neabstraktni) view controllery
    title: string;
    breadcrumb: Array<breadcrumbItem>;

    constructor($scope: ng.IScope | IStateService, $state?: angular.ui.IStateService) {
      var stateService = this.getStateService($scope);
      if (stateService) {
        this.isFakeCreate = true;
        this.ctx = stateService.params; finishContext(this.ctx);
        //this.parent = stateService.parent;
        this.state = stateService.current;
        extendTaskContext(stateService.parent, this);
        return;
      }
      this.$scope = <IControllerScope>$scope;
      this.$state = $state;
      extendTaskContext(this.$scope, this);
      this.ctx = <learnContext><any>$state.params; finishContext(this.ctx);
      //this.ctx.$state = $state;
      this.$scope['ts'] = this;
      var st = $state.current;
      var constr = this.constructor;
      while (st) {
        if (st.controller == constr) {
          this.state = <state>st;
          break;
        }
        st = st.parent;
      }
      this.$scope.state = this.state;
      //this.parent = this.$scope.$parent['ts'];
    }
    static $inject = ['$scope', '$state'];
    getStateService($scope: ng.IScope | IStateService): IStateService { return !!$scope['current'] ? <IStateService>$scope : null; }

    href(url: IStateUrl): string {
      return this.$state.href(url.stateName, url.pars);
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

    navigateWebHome() { Pager.gotoHomeUrl(); }
    navigateReturnUrl() { location.href = this.ctx.returnurl; }
    getProductHomeUrl(): IStateUrl { return { stateName: prodStates.home.name, pars: this.ctx };}
    navigateProductHome() { this.navigate(this.getProductHomeUrl()); }

    wrongUrlRedirect(url: IStateUrl) {
      if (!url) return;
      this.isWrongUrl = true;
      setTimeout(this.navigate(url), 1);
    }
  }
  export interface IControllerScope extends ng.IScope { ts: controller; state: state; api: () => Object; /*globalni api*/ } //$scope pro vsechny controllers

  //******* TASK VIEW - predchudce vsech controllers, co maji vizualni podobu (html stranku)
  export class taskViewController extends controller {
    constructor($scope: ng.IScope | blended.IStateService, $state?: angular.ui.IStateService) {
      super($scope, $state);
      this.myTask = this.isFakeCreate ? (<blended.IStateService>$scope).parent : (<ng.IScope>$scope).$parent['ts'];
      this.title = this.myTask.dataNode.title;
    }
    myTask: taskController;
  }


  export enum moveForwardResult {
    toParent /*neumi se posunout dopredu, musi se volat moveForward parenta*/,
    selfAdjustChild /*posunuto dopredu, nutno spocitat goCurrent a skocit na jiny task*/,
    selfInnner /*posun osetren v ramci zmeny stavu aktualniho tasku (bez nutnosti navigace na jiny task)*/
  }

  //typ pro konstruktor tasku
  export interface taskControllerType { new (state: IStateService, resolves?: Array<any>); }

  //******* TASK (predchudce vse abstraktnich controllers (mimo cviceni), reprezentujicich TASK). Task umi obslouzit zelenou sipku apod.
  export class taskController extends controller {

    //********************** FIELDS
    //child: taskController; //child TASK v hiearchii STATES
    dataNode: CourseMeta.data; //sitemap produkt node
    user: IPersistNodeItem<IPersistNodeUser>; //user persistence, odpovidajici taskId
    //parent: taskController;
    //isProductHome: boolean;

    //********************* 
    constructor($scope: ng.IScope | blended.IStateService, $state?: angular.ui.IStateService) {
      super($scope, $state);
      //constructor(state: IStateService, resolves?: Array<any>) {
      //    super(state);

      if (!this.state.dataNodeUrlParName) return;

      //provaz parent - child
      //if (this.parent) this.parent.child = this;
      //var parentTask = this.parent = (<ng.IScope>$scope).$parent['ts']; if (parentTask) parentTask.child = this;

      //dataNode
      if (this.productParent) { //null je pouze pro home, user se vytvori v home konstructoru
        this.dataNode = this.productParent.dataNode.nodeDir[this.ctx[this.state.dataNodeUrlParName]];
        this.user = getPersistWrapper<IPersistNodeUser>(this.dataNode, this.ctx.taskid);
      }
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
    moveForward(sender: exerciseTaskViewController): moveForwardResult { throw 'notimplemented'; }

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

    navigateAhead(sender: exerciseTaskViewController) {
      this.navigate(this.goAhead(sender));
    }

    goAhead(sender: exerciseTaskViewController): IStateUrl {
      var task: taskController = sender;
      while (true) {
        switch (task.moveForward(sender)) {
          case moveForwardResult.selfInnner: return null;
          case moveForwardResult.toParent:
            if (task == task.exParent) { task = task.moduleParent; continue; }
            if (task == task.moduleParent && task.pretestParent) { task = task.pretestParent; continue; }
            return this.getProductHomeUrl(); //{ stateName: prodStates.home.name, pars: this.ctx }
          case moveForwardResult.selfAdjustChild: return task.goCurrent();
        }
      }
      

      //seznam od childs k this
      //var taskList: Array<taskController> = [];
      //var act = this; while (act) {
      //  if (!act.taskControllerSignature) break;
      //  taskList.push(act);
      //  act = act.child;
      //}
      ////najdi prvni task, co se umi posunout dopredu: jdi od spodu nahoru
      //for (var i = taskList.length - 1; i >= 0; i--) {
      //  var act = taskList[i];
      //  switch (act.moveForward()) {
      //    case moveForwardResult.selfInnner: return null;
      //    case moveForwardResult.toParent: break;
      //    case moveForwardResult.selfAdjustChild: return act.goCurrent();
      //  }
      //}
      ////ani jeden z parentu move nevyresil => jdi na home produktu
      //return { stateName: prodStates.home.name, pars: this.ctx }
    }

    log(msg: string) {
      console.log('%%% ' + Utils.getObjectClassName(this) + ": " + msg + ' (' + this.dataNode.url + ')');
    }

  }

  //****************** PRODUCT HOME
  export class homeTaskController extends taskController { //task pro pruchod testem
    constructor($scope: ng.IScope | blended.IStateService, $state: angular.ui.IStateService, product: IProductEx) {
      super($scope, $state);
      this.dataNode = product;
    }
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

  export function pretestScore(dataNode: IPretestRepository, user: IPretestUser, taskId:string): IExShort {
    if (!user || !user.done) return null;
    var users = _.map(user.history, l => agregateShortFromNodes(dataNode.Items[l], taskId));
    return agregateShorts(users);
  }

  export class pretestTaskController extends taskController { //task pro pruchod testem

    dataNode: IPretestRepository;
    user: IPersistNodeItem<IPretestUser>;
    //inCongratulation: boolean; //priznak, ze modul byl prave preveden do stavu DONE a ukazuje se congratulation dialog

    constructor($scope: ng.IScope | blended.IStateService, $state?: angular.ui.IStateService) {
      super($scope, $state);
      this.pretestParent = this;
      //sance prerusit navigaci
      if (this.isFakeCreate) return;
      this.user = getPersistWrapper<IPretestUser>(this.dataNode, this.ctx.taskid, () => {
        return { actLevel: levelIds.A2, history: [levelIds.A2], targetLevel: -1, done: false };
      });
      this.wrongUrlRedirect(this.checkCommingUrl());
    }

    checkCommingUrl() {
      var ud = this.user.short;
      if (!ud) return this.getProductHomeUrl(); //{ stateName: prodStates.home.name, pars: this.ctx }; //pretest jeste nezacal => goto product home
      if (ud.done) return null; //done pretest: vse je povoleno
      var dataNode = <IPretestRepository>this.dataNode;
      var actModule = dataNode.Items[ud.actLevel];
      var actEx = this.productParent.dataNode.nodeDir[this.ctx.Url];
      if (actModule.url != actEx.parent.url) { //cviceni neni v aktalnim modulu
        var pars = cloneAndModifyContext(this.ctx, c => c.moduleurl = encodeUrl(actModule.url));
        return this.getProductHomeUrl(); //{ stateName: prodStates.home.name, pars: pars }; //v URL je adresa jineho nez aktivniho modulu (asi pomoci back) => jdi na prvni cviceni aktualniho modulu
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
        //createMode: createControllerModes.adjustChild
      };
      return new moduleTaskController(state);
    }

    moveForward(sender: exerciseTaskViewController): moveForwardResult {
      //if (this.inCongratulation) { delete this.inCongratulation; return moveForwardResult.toParent; }
      var ud = this.user.short;
      var actTestItem = sender.moduleParent; // <exerciseTaskViewController>(this.child);
      var actRepo = this.actRepo(ud.actLevel);
      if (actTestItem.dataNode != actRepo) throw 'actTestItem.dataNode != actRepo';
      var childSummary = agregateShortFromNodes(actTestItem.dataNode, this.ctx.taskid);
      if (!childSummary.done) throw '!childUser.done';
      var score = scorePercent(childSummary);

      if (actRepo.level == levelIds.A1) {
        return this.finishPretest(sender, ud, levelIds.A1);
      } else if (actRepo.level == levelIds.A2) {
        if (score >= actRepo.min && score < actRepo.max) return this.finishPretest(sender, ud, levelIds.A2);
        else if (score < actRepo.min) return this.newTestItem(ud, levelIds.A1);
        else return this.newTestItem(ud, levelIds.B1);
      } else if (actRepo.level == levelIds.B1) {
        if (score >= actRepo.min && score < actRepo.max) return this.finishPretest(sender, ud, levelIds.B1);
        else if (score < actRepo.min) return this.finishPretest(sender, ud, levelIds.A2);
        else return this.newTestItem(ud, levelIds.B2);
      } else if (actRepo.level == levelIds.B2) {
        if (score < actRepo.min) return this.finishPretest(sender, ud, levelIds.B1);
        else return this.finishPretest(sender, ud, levelIds.B2);
      }
      throw 'not implemented';
    }

    newTestItem(ud: IPretestUser, lev: levelIds): moveForwardResult {
      this.user.modified = true;
      ud.actLevel = lev;
      ud.history.push(lev);
      return moveForwardResult.selfAdjustChild;
    }
    finishPretest(sender: exerciseTaskViewController, ud: IPretestUser, lev: levelIds): moveForwardResult {
      this.user.modified = true;
      ud.done = true; ud.targetLevel = lev; delete ud.actLevel;
      sender.congratulationDialog().then(
        () => this.navigateProductHome(),
        () => this.navigateProductHome()
        );
      //this.inCongratulation = true;
      return moveForwardResult.selfInnner;
    }
    actRepo(lev: levelIds): IPretestItemRepository { return _.find(this.dataNode.Items, l => l.level == lev); }

  }

}
