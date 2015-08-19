module blended {

  export interface IContext {
    $q: ng.IQService;
  }

  export interface IPersistNodeItem { //persistentni udaj pro jednu variantu (jeden taskId). Kazde cviceni apod. se muze spustit vicekrat, aniz by se preposovaly jeho user data.
    data: IPersistNodeUser;
    modified: boolean;
  }

  export interface IRepository {
    url: string; //key tasku v user DB
    title: string;
    Items: Array<IRepository>;
  }

  export interface IPersistNodeUser { //user dato pro task obecne
    url: string;
    history?: Array<IPersistHistoryItem>;
    done?: boolean;
    score?: number;
  }
  export interface IPersistHistoryItem { date: number, url: string; taskId: string; }

  //export interface IPersistNodeImpl {
  //  userData: { [taskId: string]: IPersistNodeItem; } //dato pro jednotlive variatny
  //}

  //***************** metadata, popisujici metakurz
  export enum levelIds {
    A1 = 0, A2 = 1, B1 = 2, B2 = 3,
  }

  //************ TASKS
  export class task {

    child: task;
    userData: { [taskId: string]: IPersistNodeItem; } //dato pro jednotlive variatny

    constructor(public repository: IRepository, public taskId: string, completed: (t: task) => void) {
      var ud = this.getPersistData();
      if (!ud) ud = this.setPersistData(ud => {
        this.log('createStatus');
        this.initPersistData(ud);
      });
      this.log('createChild');
      this.createChild(ud, () => completed(this));
    }

    getPersistData: () => IPersistNodeUser = () => {
      if (!this.userData) return null;
      var it = this.userData[this.taskId];
      return it ? it.data : null;
    }
    setPersistData: (modify: (data: IPersistNodeUser) => void) => IPersistNodeUser = modify => {
      var it = this.userData ? this.userData[this.taskId] : null;
      if (!it) {
        it = { data: <any>{}, modified: true };
        if (!this.userData) this.userData = {};
        this.userData[this.taskId] = it;
      } else
        it.modified = true;
      modify(it.data);
      return it.data;
    }

    //posun zelenou sipkou
    goAhead(ctx: IContext): ng.IPromise<boolean> {
      var def = ctx.$q.defer();
      try {
        var ud = this.getPersistData();
        if (ud.done) { def.resolve(false); return; }
        if (this.child) { //vyresi posun child?...
          this.child.goAhead(ctx).then(childOK => {
            if (childOK) { this.addToHistory(this.child, ud); def.resolve(true); return; } //... ano, posun udelal child
            //this.child = null;
            this.log('doMoveForward, child finished');
            this.doMoveForward(def, ud); //... ne, posun delam ja
          });
        } else {
          this.doMoveForward(def, ud); //neni child, udelej posun sam
          this.log('doMoveForward');
        }
      } finally { return def.promise }
    }

    doMoveForward(def: ng.IDeferred<boolean>, ud: IPersistNodeUser) {
      var error = this.moveForward(ud); //posun stav dopredu
      if (error) { def.reject(error); return; } //error? => reject
      this.createChild(ud, () => def.resolve(!ud.done));
    }

    addToHistory(child: task, ud: IPersistNodeUser) {
      if (!ud.history) ud.history = [];
      var hist: IPersistHistoryItem = { date: Utils.nowToNum(), url: child.repository.url, taskId: child.taskId };
      if (_.find(ud.history, h => h.url == hist.url && h.taskId == hist.taskId)) return;
      ud.history.push(hist);
    }

    log(msg: string) {
      console.log('%%% ' + Utils.getObjectClassName(this) + ": " + msg + ' (' + this.repository.url + ')');
    }

    //********************** Virtualni procs

    //sance na asynchroni inicializaci self (nacteni dat pomoci ajaxu apod.)
    //init(ud: IPersistNodeUser, completed: () => void) { completed(); }
    //inicialni naplneni statusu (pri jeho prvnim vytvoreni)
    initPersistData(ud: IPersistNodeUser) {
      ud.url = this.repository.url;
      //ud.taskId = newGuid();
    }
    //posun stavu dal
    moveForward(ud: IPersistNodeUser): string { throw 'notimplemented'; }
    //vytvoreni child status na zaklade aktualniho stavu
    createChild(ud: IPersistNodeUser, completed: () => void) { completed(); }
  }
  //applyMixins(task, [persistNodeImpl]);



  //****************** COURSE
  export interface IBlendedCourseRepository extends IRepository {
    pretest: IPretestRepository; //pretest
    entryTests: Array<IRepository>; //vstupni check-testy (entryTests[0]..A1, ..)
    lessons: Array<IRepository>; //jednotlive tydenni tasky. Jeden tydenni task je seznam z kurziku nebo testu
  }

  export interface ICoursePretestUser extends IPersistNodeUser {
    targetLevel?: levelIds;
  }
  export interface IBlendedCourseUser extends IPersistNodeUser { //user dato pro ICourseRepository
    startDate: number; //datum zacatku prvni etapy
    //child task infos
    pretest: ICoursePretestUser;
    entryTest: IPersistNodeUser;
    lessons: IPersistNodeUser;
  }

  export class blendedCourseTask extends task {

    //cely produkt ma jedno globalni TASKID (ctx.taskid). Nastavuje se pri spusteni produktu (v MY.ts) na hodnotu 'def'.
    constructor(public product: CourseMeta.IProductEx, public ctx: blended.learnContext, completed: (t: blendedCourseTask) => void) {
      super(blendedCourseTask.repositoryFromProduct(product), ctx.taskid, completed);
    }
    static repositoryFromProduct(prod: CourseMeta.IProductEx): IBlendedCourseRepository {
      var clonedLessons = _.map(_.range(0, 4), idx => <any>(_.clone(prod.Items[idx].Items))); //pro kazdou level kopie napr. </lm/blcourse/english/a1/>.Items
      var firstPretests = _.map(clonedLessons, l => l.splice(0, 1)[0]); //z kopie vyndej prvni prvek (entry test) a dej jej do firstPretests;
      var res: IBlendedCourseRepository = {
        pretest: <any>(prod.find('/lm/blcourse/' + LMComLib.LineIds[prod.line].toLowerCase() + '/pretests/')),
        entryTests: firstPretests,
        lessons: clonedLessons,
        Items: null, title: prod.title, url: prod.url
      };
      _.each(<any>(res.pretest.Items), (it: CourseMeta.data) => {
        if (it.other) $.extend(it, JSON.parse(it.other));
      });
      if (prod.other) prod.other = $.extend(prod, JSON.parse(prod.other));
      return res;
    }

    getPersistData: () => IBlendedCourseUser;
    setPersistData: (modify: (data: IBlendedCourseUser) => void) => IBlendedCourseUser;
    repository: IBlendedCourseRepository;

    initPersistData(ud: IBlendedCourseUser) {
      super.initPersistData(ud);
      ud.startDate = Utils.nowToNum();
      ud.pretest = { url: this.repository.pretest.url }
    }

    createChild(ud: IBlendedCourseUser, completed: () => void) {
      if (!ud.pretest.done) { //pretest task neexistuje nebo neni dokoncen
        this.child = new pretestTask(this.repository.pretest, this.taskId, completed);
      } else if (!ud.entryTest.done) { //entryTest task neexistuje nebo neni dokoncen
        this.child = new testTask(this.repository.entryTests[ud.pretest.targetLevel], this.taskId, completed);
      } else if (!ud.lessons.done) { //level task neexistuje nebo neni dokoncen
        this.child = new listTask(this.repository.lessons[ud.pretest.targetLevel], this.taskId, completed);
      } else {
        ud.done = true; this.child = null;
        completed();
      }
    }

    moveForward(ud: IBlendedCourseUser): string {
      var childUd = this.child.getPersistData();
      if (childUd.url == ud.pretest.url) {
        var pretUser = <IPretestUser>childUd; if (!pretUser.done) return 'tasks.course.doGoAhead: !pretUser.done';
        this.setPersistData(dt => { dt.pretest.done = true; dt.pretest.targetLevel = pretUser.targetLevel; dt.entryTest = { url: this.repository.entryTests[dt.pretest.targetLevel].url } });
      } else if (childUd.url == ud.entryTest.url) {
        var entryTestUser = <ITestUser>childUd; if (!entryTestUser.done) return 'tasks.course.doGoAhead: !entryTestUser.done';
        this.setPersistData(dt => { dt.entryTest.done = true; dt.entryTest.score = entryTestUser.score; dt.lessons = { url: this.repository.lessons[dt.pretest.targetLevel].url } });
      } else if (childUd.url == ud.lessons.url) {
        var lessonsUser = childUd; if (!lessonsUser.done) return 'tasks.course.doGoAhead: !lessonsUser.done';
        this.setPersistData(dt => { dt.done = true; dt.lessons.done = true; });
      } else
        return 'tasks.course.doGoAhead: unknown child url - ' + childUd.url;
      return null;
    }

  }

  //****************** PRETEST
  export interface IPretestRepository extends IRepository {
    Items: Array<IPretestItemRepository>; //levels, napr. levels[level.A1]
  }

  export interface IPretestItemRepository extends IRepository {
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

  export class pretestTask extends task { //task pro pruchod testem

    getPersistData: () => IPretestUser;
    setPersistData: (modify: (data: IPretestUser) => void) => IPretestUser;
    repository: IPretestRepository;

    initPersistData(ud: IPretestUser) {
      super.initPersistData(ud);
      ud.actLevel = levelIds.A2;
      ud.urls = [];
      ud.urls.push(this.actRepo(levelIds.A2).url);
    }

    moveForward(ud: IPretestUser): string {
      var childTest = <testTask>(this.child);
      var actRepo = this.actRepo(ud.actLevel);
      var childUser = childTest.getPersistData(); if (!childUser.done || childUser.url != actRepo.url) return 'tasks.pretestTask.doGoAhead: !testUser.done || testUser.url != actRepo.url';

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

    createChild(ud: IPretestUser, completed: () => void) {
      var act: IPretestItemRepository = _.find(this.repository.Items, l => l.level == ud.actLevel);
      if (!act) throw '!act';
      this.child = new testTask(act, this.taskId, completed);
    }

    newTestItem(ud: IPretestUser, lev: levelIds) {
      ud.actLevel = lev;
      ud.urls.push(this.actRepo(lev).url);
    }
    finishPretest(ud: IPretestUser, lev: levelIds) {
      ud.done = true; ud.targetLevel = lev; this.child = null;
    }
    actRepo(lev: levelIds): IPretestItemRepository { return _.find(this.repository.Items, l => l.level == lev); }

  }

  //****************** LEVEL LESSONS
  export interface IListUser extends IPersistNodeUser { //course dato pro IListRepository
    items: Array<{ taskId: string; done?: boolean; score?: number; }>;
  }

  export class listTask extends task { //task pro nepodmineny pruchod seznamem tasku

    repository: IRepository;
    getPersistData: () => IListUser;
    setPersistData: (modify: (data: IListUser) => void) => IListUser;

    initPersistData(ud: IListUser) {
      super.initPersistData(ud);
    }
    moveForward(ud: IListUser): string { ud.done = true; return null; }
    createChild(ud: IListUser, completed: () => void) { completed(); }
  }

  //****************** linearni TEST
  export interface ITestUser extends IPersistNodeUser { //course dato pro test
  }

  export class testTask extends task { //task pro pruchod lekcemi (repository je seznam cviceni)

    getPersistData: () => ITestUser;
    setPersistData: (modify: (data: ITestUser) => void) => ITestUser;

    initPersistData(ud: ITestUser) {
      super.initPersistData(ud);
    }
    moveForward(ud: ITestUser): string { ud.done = true; return null; }
    createChild(ud: ITestUser, completed: () => void) { completed(); }

  }

  //****************** linearni KURZ
  export interface IModuleUser extends IPersistNodeUser { //course dato pro test (repository je seznam cviceni)
  }

  export class moduleTask extends task { //task pro pruchod lekcemi

    getPersistData: () => IModuleUser;
    setPersistData: (modify: (data: IModuleUser) => void) => IModuleUser;

    initPersistData(ud: IModuleUser) {
      super.initPersistData(ud);
    }
    moveForward(ud: IModuleUser): string { ud.done = true; return null; }
    createChild(ud: IModuleUser, completed: () => void) { completed(); }

  }

  //****************** EXERCISE
  export interface IExUser extends IPersistNodeUser { //course dato pro test
  }

  export class exTask extends task { //task pro pruchod lekcemi
    getPersistData: () => IExUser;
    setPersistData: (modify: (data: ITestUser) => void) => ITestUser;

    initPersistData(ud: IExUser) {
      super.initPersistData(ud);
    }
    moveForward(ud: IExUser): string { ud.done = true; return null; }
    createChild(ud: IExUser, completed: () => void) { completed(); }
  }

}