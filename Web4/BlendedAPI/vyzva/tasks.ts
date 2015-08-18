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

  function applyMixins(derivedCtor: any, baseCtors: any[]) {
    baseCtors.forEach(baseCtor => {
      Object.getOwnPropertyNames(baseCtor.prototype).forEach(name => {
        if (name !== 'constructor') {
          derivedCtor.prototype[name] = baseCtor.prototype[name];
        }
      });
    });
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
  export interface ICourseRepository extends IRepository {
    line: LMComLib.LineIds; //kurz (English, German, French)
    pretest: IPretestRepository; //identifikace pretestu
    entryTests: Array<IListRepository>; //vstupni check-testy
    lessons: Array<IListRepository>; //levels, napr. levels[level.A1]
  }

  export interface ICourseUser extends IPersistNodeUser { //user dato pro ICourseRepository
    periodStart: number; //datum zacatku prvni etapy
    //child task infos
    pretest: { taskId: string; done?: boolean; targetLevel?: levelIds; };
    entryTest: { taskId: string; done?: boolean; score?: number; };
    lessons: { taskId: string; done?: boolean; };
  }

  export class courseTask extends task {

    getUserData: () => ICourseUser;
    setUserData: (modify: (data: ICourseUser) => void) => ICourseUser;
    repository: ICourseRepository;

    createStatus(ud: ICourseUser) {
      super.createStatus(ud);
      ud.periodStart = 0; //todo Now
    }

    createChild(ud: ICourseUser, completed: () => void) {
      if (!ud.pretest || !ud.pretest.done) { //pretest task neexistuje nebo neni dokoncen
        if (!ud.pretest) ud = this.setUserData(data => data.pretest = { taskId: newGuid() });
        this.child = new pretestTask(this.repository.pretest, ud.pretest.taskId, completed);
      } else if (!ud.entryTest || !ud.entryTest.done) { //entryTest task neexistuje nebo neni dokoncen
        if (!ud.entryTest) ud = this.setUserData(data => data.entryTest = { taskId: newGuid() });
        this.child = new testTask(this.repository.entryTests[ud.pretest.targetLevel], ud.entryTest.taskId, completed);
      } else if (!ud.lessons || !ud.lessons.done) { //level task neexistuje nebo neni dokoncen
        if (!ud.lessons) ud = this.setUserData(data => data.lessons = { taskId: newGuid() });
        new listTask(this.repository.lessons[ud.pretest.targetLevel], ud.lessons.taskId, completed);
      } else {
        ud.done = true; this.child = null;
        completed();
      }
    }

    moveForward(ud: ICourseUser): string {
      switch (this.child.repository.taskType) {
        case 'vyzva.pretest': //pretest ukoncen
          var pretUser = (<pretestTask>(this.child)).getUserData(); if (!pretUser.done) return 'tasks.course.doGoAhead: !pretUser.done';
          this.setUserData(dt => { dt.pretest.done = true; dt.pretest.targetLevel = pretUser.targetLevel; dt.entryTest = { taskId: newGuid() } });
          break;
        case 'vyzva.entryTest':
          var entryTestUser = (<testTask>(this.child)).getUserData(); if (!entryTestUser.done) return 'tasks.course.doGoAhead: !entryTestUser.done';
          this.setUserData(dt => { dt.entryTest.done = true; dt.entryTest.score = entryTestUser.score; dt.lessons = { taskId: newGuid() } });
          break;
        case 'vyzva.lessons':
          var lessonsUser = (<listTask>(this.child)).getUserData(); if (!lessonsUser.done) return 'tasks.course.doGoAhead: !lessonsUser.done';
          this.setUserData(dt => { dt.done = true; dt.lessons.done = true; });
          break;
        default:
          return 'tasks.course.doGoAhead: unknown taskType - ' + this.child.repository.taskType;
      }
      return null;
    }

  }

  //****************** PRETEST
  export interface IPretestRepository extends IRepository {
    levels: Array<IPretestItemRepository>; //levels, napr. levels[level.A1]
  }

  export interface IPretestItemRepository extends ITestRepository {
    //pro A2: pod toto skore ma uroven A1
    //pro B1: pod toto skore ma uroven A2
    //pro B2: pod toto skore ma uroven B1
    minScore: number; 
    // pro A2: nad toto skore se spousti B1
    // pro B1: nad toto skore se spousti B2
    maxScore: number;
  }

  export interface IPretestUser extends IPersistNodeUser { //course dato pro IPretestRepository
    parts: Array<{ level: levelIds; taskId: string; done?: boolean; score?: number; }>;
    targetLevel: levelIds; //vysledek pretestu pro done=true
  }

  export class pretestTask extends task { //task pro pruchod testem

    getUserData: () => IPretestUser;
    setUserData: (modify: (data: IPretestUser) => void) => IPretestUser;
    repository: IPretestRepository;

    createStatus(data: IPretestUser) {
      super.createStatus(data);
      data.parts = [{ level: levelIds.A2, taskId: newGuid() }];
    }

    moveForward(ud: IPretestUser): string {
      var childTest = <testTask>(this.child);
      var testUser = childTest.getUserData(); if (!testUser.done) return 'tasks.pretestTask.doGoAhead: !testUser.done';
      var myUserData = this.setUserData(dt => {
        var last = dt.parts[dt.parts.length - 1]; if (last.taskId != childTest.taskId) return 'tasks.pretestTask.doGoAhead: last.taskId != childTest.taskId';
        last.done = true; last.score = testUser.score;
      });
      return null;
    }

    createChild(myUserData: IPretestUser, completed: () => void) {
      var last = myUserData.parts[myUserData.parts.length - 1];
      if (last.done) { //ukonceny pretest item
        var actRepo = this.repository.levels[last.level];
        if (last.level == levelIds.A1)
          this.finishPretest(myUserData, levelIds.A1, completed);
        else if (last.level == levelIds.A2) {
          if (last.score >= actRepo.minScore && last.score < actRepo.maxScore) this.finishPretest(myUserData, levelIds.A2, completed);
          else if (last.score < actRepo.minScore) this.newTestItem(myUserData, levelIds.A1, completed);
          else this.newTestItem(myUserData, levelIds.B1, completed);
        } else if (last.level == levelIds.B1) {
          if (last.score >= actRepo.minScore && last.score < actRepo.maxScore) this.finishPretest(myUserData, levelIds.B1, completed);
          else if (last.score < actRepo.minScore) this.finishPretest(myUserData, levelIds.A2, completed);
          else this.newTestItem(myUserData, levelIds.B2, completed);
        } else if (last.level == levelIds.B2) {
          if (last.score < actRepo.minScore) this.finishPretest(myUserData, levelIds.B1, completed);
          else this.finishPretest(myUserData, levelIds.B2, completed);
        }
      } else { //rozpracovany pretest item
        this.child = new testTask(this.repository.levels[last.level], last.taskId, completed);
      }
    }

    newTestItem(myUserData: IPretestUser, lev: levelIds, completed: () => void) {
      myUserData.parts.push({ level: lev, taskId: newGuid() });
      var last = myUserData.parts[myUserData.parts.length - 1];
      this.child = new testTask(this.repository.levels[last.level], last.taskId, completed);
    }
    finishPretest(myUserData: IPretestUser, lev: levelIds, completed: () => void) {
      myUserData.done = true; myUserData.targetLevel = lev; this.child = null;
      completed();
    }

  }

  //****************** LEVEL LESSONS
  export interface IListRepository extends IRepository {
    items: Array<IRepository>; //tydny vyuky
  }

  export interface IListUser extends IPersistNodeUser { //course dato pro IListRepository
    items: Array<{ taskId: string; done?: boolean; score?: number; }>;
  }

  export class listTask extends task { //task pro nepodmineny pruchod seznamem tasku

    repository: IListRepository;
    getUserData: () => IListUser;
    setUserData: (modify: (data: IListUser) => void) => IListUser;

    createStatus(ud: IPretestUser) {
      super.createStatus(ud);
    }

    moveForward(ud: IListUser): string { throw 'notimplemented'; }
    createChild(ud: IListUser) { throw 'notimplemented'; }

    goAhead(ctx: IContext): ng.IPromise<boolean> {
      var def = ctx.$q.defer();
      if (this.child) {
        this.child.goAhead(ctx).then(childOK => {
          if (childOK) { def.resolve(true); return; } //posun dopredu resi child task
          var childTask = <task>(this.child);
          var childUser = childTask.getUserData(); if (!childUser.done) def.reject('tasks.listTask.doGoAhead: !childUser.done');
          var myUserData = this.setUserData(dt => {
            var last = dt.items[dt.items.length - 1]; if (last.taskId != childTask.taskId) def.reject('tasks.listTask.doGoAhead: last.taskId != childTest.taskId');
            last.done = true; last.score = childUser.score;
          });
          //this.getNextTestItem(def, myUserData);
        });
      } else {
        //this.getNextTestItem(def, this.setUserData($.noop));
      }
      return def.promise;
    }

  }

  //****************** TEST
  export interface ITestRepository extends IRepository {
  }

  export interface ITestUser extends IPersistNodeUser { //course dato pro test
  }

  export class testTask extends task { //task pro pruchod lekcemi

    repository: ITestRepository;
    getUserData: () => ITestUser;
    setUserData: (modify: (data: ITestUser) => void) => ITestUser;
  }

  //****************** EXERCISE
  export interface IExUser extends IPersistNodeUser { //course dato pro test
  }

  export class exTask extends persistNodeImpl { //task pro pruchod lekcemi
    constructor(repository: ITestRepository, taskId: string) { super(repository, taskId); }

    getUserData: () => IExUser;
    setUserData: (modify: (data: IExUser) => void) => IExUser;
  }

}