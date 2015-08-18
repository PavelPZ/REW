module vyzva {

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
    items: Array<IRepository>;
    taskType: string; //typ tasku
  }

  export interface IPersistNodeUser { //user dato pro task obecne
    url: string;
    taskId: string;
    done?: boolean;
    score?: number;
  }

  export class persistNodeImpl {

    constructor(public repository: IRepository, public taskId: string) { }

    userData: { [taskId: string]: IPersistNodeItem; } //dato pro jednotlive variatny
    getUserData: () => IPersistNodeUser = () => {
      if (!this.userData) return null;
      var it = this.userData[this.taskId];
      return it ? it.data : null;
    }
    setUserData: (modify: (data: IPersistNodeUser) => void) => IPersistNodeUser = modify => {
      var it = this.userData ? this.userData[this.taskId] : null;
      if (!it) {
        it = { data: { taskId: '', url: '' }, modified: true };
        if (!this.userData) this.userData = {};
        this.userData[this.taskId] = it;
      } else
        it.modified = true;
      modify(it.data);
      return it.data;
    }
  }

  function newGuid(): string { return ''; }

  //***************** metadata, popisujici metakurz
  export enum levelIds {
    A1 = 0, A2 = 1, B1 = 2, B2 = 3,
  }

  //************ tasks
  export class task extends persistNodeImpl {
    constructor(repository: IRepository, taskId: string, completed: () => void) {
      super(repository, taskId);
      var ud = this.getUserData();
      if (!ud) ud = this.setUserData(this.createStatus);
      this.init(ud, () => this.createChild(ud, completed));
    }

    child: task;
    //posun zelenou sipkou
    goAhead(ctx: IContext): ng.IPromise<boolean> {
      var def = ctx.$q.defer();
      try {
        var ud = this.getUserData();
        if (ud.done) { def.resolve(false); return; }
        if (this.child) { //vyresi posun child?...
          this.child.goAhead(ctx).then(childOK => {
            if (childOK) { def.resolve(true); return; } //... ano, posun udelal child
            this.child = null;
            this.doMoveForward(def, ud); //... ne, posun delam ja
          });
        } else
          this.doMoveForward(def, ud); //neni child, udelej posun sam
      } finally { return def.promise }
    }

    doMoveForward(def: ng.IDeferred<boolean>, ud: IPersistNodeUser) {
      var error = this.moveForward(ud); //posun stav dopredu
      if (error) { def.reject(error); return; } //error? => reject
      def.resolve(!ud.done);
    }

    //********************** Virtualni procs

    //sance na asynchroni inicializaci self (nacteni dat pomoci ajaxu apod.)
    init(ud: IPersistNodeUser, completed: () => void) { completed(); }
    //inicialni naplneni statusu (pri jeho prvnim vytvoreni)
    createStatus(ud: IPersistNodeUser) {
      ud.url = this.repository.url;
      ud.taskId = newGuid();
    }
    //posun stavu dal
    moveForward(ud: IPersistNodeUser): string { throw 'notimplemented'; }
    //vytvoreni child status na zaklade aktualniho stavu
    createChild(ud: IPersistNodeUser, completed: () => void) { completed(); }
  }
  //applyMixins(task, [persistNodeImpl]);

  //****************** COURSE
  export interface IBlendedCourseRepository extends IRepository {
    line: LMComLib.LineIds; //kurz (English, German, French)
    pretest: IPretestRepository; //pretest
    entryTests: Array<IRepository>; //vstupni check-testy (entryTests[0]..A1, ..)
    lessons: Array<IRepository>; //jednotlive tydenni tasky. Jeden tydenni task je seznam z kurziku nebo testu
  }

  export interface ICoursePretestUser extends IPersistNodeUser {
    targetLevel?: levelIds;
  }
  export interface IBlendedCourseUser extends IPersistNodeUser { //user dato pro ICourseRepository
    periodStart: number; //datum zacatku prvni etapy
    //child task infos
    pretest: ICoursePretestUser;
    entryTest: IPersistNodeUser; 
    lessons: IPersistNodeUser; 
  }

  export class blendedCourseTask extends task {

    getUserData: () => IBlendedCourseUser;
    setUserData: (modify: (data: IBlendedCourseUser) => void) => IBlendedCourseUser;
    repository: IBlendedCourseRepository;

    createStatus(ud: IBlendedCourseUser) {
      super.createStatus(ud);
      ud.periodStart = 0; //todo Now
      ud.pretest = { url: this.repository.pretest.url, taskId: ud.taskId }
    }

    createChild(ud: IBlendedCourseUser, completed: () => void) {
      if (!ud.pretest.done) { //pretest task neexistuje nebo neni dokoncen
        this.child = new pretestTask(this.repository.pretest, ud.pretest.taskId, completed);
      } else if (!ud.entryTest.done) { //entryTest task neexistuje nebo neni dokoncen
        this.child = new testTask(this.repository.entryTests[ud.pretest.targetLevel], ud.entryTest.taskId, completed);
      } else if (!ud.lessons.done) { //level task neexistuje nebo neni dokoncen
        this.child = new listTask(this.repository.lessons[ud.pretest.targetLevel], ud.lessons.taskId, completed);
      } else {
        ud.done = true; this.child = null;
        completed();
      }
    }

    moveForward(ud: IBlendedCourseUser): string {
      var childUserData = this.child.getUserData();
      if (childUserData.taskId == ud.pretest.taskId) {
        var pretUser = <IPretestUser>childUserData; if (!pretUser.done) return 'tasks.course.doGoAhead: !pretUser.done';
        this.setUserData(dt => { dt.pretest.done = true; dt.pretest.targetLevel = pretUser.targetLevel; dt.entryTest = { url: this.repository.entryTests[ud.pretest.targetLevel].url, taskId: ud.taskId } });
      } else if (childUserData.taskId == ud.entryTest.taskId) {
        var entryTestUser = <ITestUser>childUserData; if (!entryTestUser.done) return 'tasks.course.doGoAhead: !entryTestUser.done';
        this.setUserData(dt => { dt.entryTest.done = true; dt.entryTest.score = entryTestUser.score; dt.lessons = { url: this.repository.lessons[ud.pretest.targetLevel].url, taskId: ud.taskId } });
      } else if (childUserData.taskId == ud.lessons.taskId) {
        var lessonsUser = childUserData; if (!lessonsUser.done) return 'tasks.course.doGoAhead: !lessonsUser.done';
        this.setUserData(dt => { dt.done = true; dt.lessons.done = true; });
      } else
        return 'tasks.course.doGoAhead: unknown taskId - ' + childUserData.taskId;
      return null;
    }

  }

  //****************** PRETEST
  export interface IPretestRepository extends IRepository {
    levels: Array<IPretestItemRepository>; //levels, napr. levels[level.A1]
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

    getUserData: () => IPretestUser;
    setUserData: (modify: (data: IPretestUser) => void) => IPretestUser;
    repository: IPretestRepository;

    createStatus(ud: IPretestUser) {
      super.createStatus(ud);
      ud.urls = [];
      ud.actLevel = levelIds.A2;
      ud.urls.push(this.actRepo(levelIds.A2).url);
    }

    moveForward(ud: IPretestUser): string {
      var childTest = <testTask>(this.child);
      var actRepo = this.actRepo(ud.actLevel);
      var childUser = childTest.getUserData(); if (!childUser.done || childUser.url != actRepo.url) return 'tasks.pretestTask.doGoAhead: !testUser.done || testUser.url != actRepo.url';

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
      var act: IPretestItemRepository = _.find(this.repository.levels, l => l.level == ud.actLevel);
      if (!act) throw '!act';
      this.child = new testTask(act, ud.taskId, completed);
    }

    newTestItem(ud: IPretestUser, lev: levelIds) {
      ud.actLevel = lev; 
      ud.urls.push(this.actRepo(lev).url);
    }
    finishPretest(ud: IPretestUser, lev: levelIds) {
      ud.done = true; ud.targetLevel = lev; this.child = null;
    }
    actRepo(lev: levelIds): IPretestItemRepository { return _.find(this.repository.levels, l => l.level == lev); }

  }

  //****************** LEVEL LESSONS
  export interface IListUser extends IPersistNodeUser { //course dato pro IListRepository
    items: Array<{ taskId: string; done?: boolean; score?: number; }>;
  }

  export class listTask extends task { //task pro nepodmineny pruchod seznamem tasku

    repository: IRepository;
    getUserData: () => IListUser;
    setUserData: (modify: (data: IListUser) => void) => IListUser;

    createStatus(ud: IListUser) {
      super.createStatus(ud);
    }
    moveForward(ud: IListUser): string { ud.done = true; return null; }
    createChild(ud: IListUser, completed: () => void) { completed(); }
  }

  //****************** linearni TEST
  export interface ITestUser extends IPersistNodeUser { //course dato pro test
  }

  export class testTask extends task { //task pro pruchod lekcemi (repository je seznam cviceni)

    getUserData: () => ITestUser;
    setUserData: (modify: (data: ITestUser) => void) => ITestUser;

    createStatus(ud: ITestUser) {
      super.createStatus(ud);
    }
    moveForward(ud: ITestUser): string { ud.done = true; return null; }
    createChild(ud: ITestUser, completed: () => void) { completed(); }

  }

  //****************** linearni KURZ
  export interface IModuleUser extends IPersistNodeUser { //course dato pro test (repository je seznam cviceni)
  }

  export class moduleTask extends task { //task pro pruchod lekcemi

    getUserData: () => IModuleUser;
    setUserData: (modify: (data: IModuleUser) => void) => IModuleUser;

    createStatus(ud: IModuleUser) {
      super.createStatus(ud);
    }
    moveForward(ud: IModuleUser): string { ud.done = true; return null; }
    createChild(ud: IModuleUser, completed: () => void) { completed(); }

  }

  //****************** EXERCISE
  export interface IExUser extends IPersistNodeUser { //course dato pro test
  }

  export class exTask extends task { //task pro pruchod lekcemi
    getUserData: () => IExUser;
    setUserData: (modify: (data: ITestUser) => void) => ITestUser;

    createStatus(ud: IExUser) {
      super.createStatus(ud);
    }
    moveForward(ud: IExUser): string { ud.done = true; return null; }
    createChild(ud: IExUser, completed: () => void) { completed(); }
  }

}