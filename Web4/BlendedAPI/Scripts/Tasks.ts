module blended {

  export interface IPersistNodeItem { //persistentni udaj pro jednu variantu (jeden taskId). Kazde cviceni apod. se muze spustit vicekrat, aniz by se prepisovaly jeho user data.
    data: IPersistNodeUser;
    modified: boolean;
  }

  export interface IPersistNodeUser { //user dato pro task obecne
    url: string;
    history?: Array<IPersistHistoryItem>;
    done?: boolean;
    score?: number;
  }
  export interface IPersistHistoryItem { date: number, url: string; taskId: string; }

  export interface IPersistNodeImpl {
    userData: { [taskId: string]: IPersistNodeItem; } //dato pro jednotlive variatny
  }

  export function getPersistData(dataNode: CourseMeta.data, taskid:string):IPersistNodeUser {
    if (!dataNode.userData) return null;
    var it = dataNode.userData[taskid];
    return it ? it.data : null;
  }


  //***************** metadata, popisujici metakurz
  export enum levelIds {
    A1 = 0, A2 = 1, B1 = 2, B2 = 3,
  }

  export class task {

    child: task;

    constructor(public dataNode: CourseMeta.data, public ctx: learnContext, public parent: task, completed: (t: task) => void) {
      var ud = this.getPersistData();
      if (!ud) ud = this.setPersistData(ud => {
        this.log('createStatus');
        this.initPersistData(ud);
      });
      this.log('createChild');
      this.createChild(ud, () => completed(this));
    }

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

    //posun zelenou sipkou
    goAhead(): ng.IPromise<boolean> {
      var def = this.ctx.$q.defer();
      try {
        var ud = this.getPersistData();
        if (ud.done) { def.resolve(false); return; }
        if (this.child) { //vyresi posun child?...
          this.child.goAhead().then(childOK => {
            if (childOK) { this.addToHistory(this.child, ud); def.resolve(true); return; } //... ano, posun udelal child
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
      var hist: IPersistHistoryItem = { date: Utils.nowToNum(), url: child.dataNode.url, taskId: child.ctx.taskid };
      if (_.find(ud.history, h => h.url == hist.url && h.taskId == hist.taskId)) return;
      ud.history.push(hist);
    }

    log(msg: string) {
      console.log('%%% ' + Utils.getObjectClassName(this) + ": " + msg + ' (' + this.dataNode.url + ')');
    }

    //********************** Virtualni procs
    //inicialni naplneni user dat  (pri jejich prvnim vytvoreni)
    initPersistData(ud: IPersistNodeUser) {
      ud.url = this.dataNode.url;
    }
    //posun stavu dal
    moveForward(ud: IPersistNodeUser): string { throw 'notimplemented'; }
    //vytvoreni child status na zaklade aktualniho stavu
    createChild(ud: IPersistNodeUser, completed: () => void) { completed(); }
    getName(): string { return ''; }
  }
  

  
  //****************** PRETEST
  export class pretestTask extends task { //task pro pruchod testem

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
      var actTestItem = <moduleTask>(this.child);
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

    createChild(ud: IPretestUser, completed: () => void) {
      var act: IPretestItemRepository = _.find(this.dataNode.Items, l => l.level == ud.actLevel);
      if (!act) throw '!act';
      this.child = new moduleTask(act, this.ctx, this, completed);
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

  //****************** LEVEL LESSONS
  export interface IListUser extends IPersistNodeUser {
    lastUrl: string;
  }

  export class listTask extends task { //task pro nepodmineny pruchod seznamem tasku

    dataNode: CourseMeta.data;
    getPersistData: () => IListUser;
    setPersistData: (modify: (data: IListUser) => void) => IListUser;

    initPersistData(ud: IListUser) {
      super.initPersistData(ud);
    }
    moveForward(ud: IListUser): string { ud.done = true; return null; }
    createChild(ud: IListUser, completed: () => void) { completed(); }
  }

  //****************** linearni kurz nebo test
  export class moduleTask extends task { //task pro pruchod lekcemi (repository je seznam cviceni)

    getPersistData: () => IModuleUser;
    setPersistData: (modify: (data: IModuleUser) => void) => IModuleUser;

    initPersistData(ud: IModuleUser) {
      super.initPersistData(ud);
    }
    moveForward(ud: IModuleUser): string { ud.done = true; return null; }
    createChild(ud: IModuleUser, completed: () => void) { completed(); }

  }

  //****************** EXERCISE

  export class exTask extends task { //task pro pruchod lekcemi
    getPersistData: () => IExUser;
    setPersistData: (modify: (data: IModuleUser) => void) => IModuleUser;

    initPersistData(ud: IExUser) {
      super.initPersistData(ud);
    }
    moveForward(ud: IExUser): string { ud.done = true; return null; }
    createChild(ud: IExUser, completed: () => void) { completed(); }
  }

}