namespace vyzva {

  
  //****************** VIEW
  export class homeViewController extends blended.taskViewController {
    constructor(state: blended.IStateService) {
      super(state);
      this.breadcrumb = breadcrumbBase(this.ctx); this.breadcrumb[1].active = true;
      this.prt = this.myTask.getPretestItemModel();
    }
    myTask: homeTaskController;

    //************ IHomePretest
    prt: IHomePretest;
  }

  //****************** TASK
  export class homeTaskController extends blended.taskController {

    //************* TASK
    getPersistData: () => IBlendedCourseUser;
    setPersistData: (modify: (data: IBlendedCourseUser) => void) => IBlendedCourseUser;
    dataNode: IBlendedCourseRepository;

    initPersistData(ud: IBlendedCourseUser) {
      super.initPersistData(ud);
      ud.startDate = Utils.nowToNum();
      //ud.pretest = { url: this.dataNode.pretest.url }
    }

    moveForward(ud: IBlendedCourseUser) {
      var childUd = this.child.getPersistData();
      if (this.child.dataNode.url == this.dataNode.pretest.url) {
        //var pretUser = <blended.IPretestUser>childUd; if (!pretUser.done) throw 'tasks.course.doGoAhead: !pretUser.done';
        //this.setPersistData(dt => {
          //dt.pretest.done = true; dt.pretest.targetLevel = pretUser.targetLevel;
          //dt.entryTest = { url: this.dataNode.entryTests[dt.pretest.targetLevel].url };
          //dt.lessons = { url: this.dataNode.lessons[dt.pretest.targetLevel].url };
        //});
      } else {
        var pretestUd = blended.getPersistData<blended.IPretestUser>(this.dataNode.pretest, this.ctx.taskid);
        if (this.child.dataNode.url == this.dataNode.entryTests[pretestUd.targetLevel].url) {
          //var entryTestUser = <blended.IModuleUser>childUd; if (!entryTestUser.done) throw 'tasks.course.doGoAhead: !entryTestUser.done';
          //this.setPersistData(dt => { dt.entryTest.done = true; dt.entryTest.score = entryTestUser.score; });
        } else if (this.child.dataNode.url == this.dataNode.lessons[pretestUd.targetLevel].url) {
          //var lessonsUser = childUd; if (!lessonsUser.done) throw 'tasks.course.doGoAhead: !lessonsUser.done';
          //this.setPersistData(dt => { dt.done = dt.lessons.done = true; }) //lesson i self je hotovo;
        } else
          throw 'tasks.course.doGoAhead: unknown child url - ' + this.child.dataNode.url;
      }
    }

    //getName(): string { return stateNames.taskRoot; }

    //********** PRETEST item
    getPretestItemModel(): IHomePretest {
      var prUd = blended.getPersistData<blended.IPretestUser>(this.dataNode.pretest, this.ctx.taskid);
      return {
        run: () => {
          this.child = new blended.pretestTaskController({
            params: blended.cloneAndModifyContext(this.ctx, d => d.pretesturl = blended.encodeUrl(this.dataNode.pretest.url)),
            current: stateNames.pretestTask,
            parent: this,
            createForCheckUrl: blended.createControllerCtx.adjustChild
          });
          var url = this.child.goCurrent();
          this.navigate(url);
        },
        canRun: !prUd || !prUd.done,
        btnTitle: !prUd ? 'Začněte spuštěním Rozřazovacího testu' : 'Dokončete Rozřazovací test',
        resultLevel: prUd && prUd.done ? blended.levelIds[prUd.targetLevel] : '',
        previewUrl: stateNames.pretest.name,
      };
    }
  }

  export interface IBlendedCourseRepository extends blended.IProductEx {
    pretest: blended.IPretestRepository; //pretest
    entryTests: Array<CourseMeta.data>; //vstupni check-testy (entryTests[0]..A1, ..)
    lessons: Array<CourseMeta.data>; //jednotlive tydenni tasky. Jeden tydenni task je seznam z kurziku nebo testu
  }

  //export interface IPretestProxyUser {
  //  done?: boolean;
  //  targetLevel?: blended.levelIds;
  //}
  export interface IBlendedCourseUser extends blended.IPersistNodeUser { //user dato pro ICourseRepository
    startDate: number; //datum zacatku prvni etapy
    //child task infos
    //pretest: IPretestProxyUser;
    //entryTest: {};
    //lessons: blended.IPersistNodeUser;
  }

}
  //******* Home produktu
  //export class productHomeController extends controller implements IToolbar, IToolbarEmpty {
  //  constructor($scope: blended.IControllerScope, $state: angular.ui.IStateService, $rootTask: blendedCourseTask) {
  //    super($scope, $state, $rootTask);
  //    this.title = $rootTask.dataNode.title;
  //    this.breadcrumb[1].active = true;

  //    this.prt = $rootTask.getPretestItemModel();
  //  }
  //  //************ IHomePretest
  //  prt: IHomePretest;
  //}


//export interface IHomeStateData extends blended.IStateData{
  //  dataNode: IBlendedCourseRepository;
  //}

  //export class homeState extends blended.state {
  //  initPersistData(data: IHomeStateData, ud: IBlendedCourseUser) {
  //    super.initPersistData(data, ud);
  //    ud.startDate = Utils.nowToNum();
  //    ud.pretest = { url: data.dataNode.pretest.url }
  //  }

  //  getPersistData: (data: IHomeStateData) => IBlendedCourseUser;
  //  setPersistData: (data: IHomeStateData, modify: (data: IBlendedCourseUser) => void) => IBlendedCourseUser;

  //  getPretestItemModel(data: IHomeStateData): IHomePretest {
  //    var ud = this.getPersistData(data);
  //    return {
  //      run: () => {
  //        debugger;
  //      },
  //      canRun: !ud.pretest || !ud.pretest.done,
  //      btnTitle: !ud.pretest ? 'Začněte spuštěním Rozřazovacího testu' : 'Dokončete Rozřazovací test',
  //      resultLevel: ud.pretest.done ? blended.levelIds[ud.pretest.targetLevel] : '',
  //      previewUrl: stateNames.pretest.name,
  //    };
  //  }
  //}

  //export class homeGreenProxy extends blended.greenProxy {
  //  constructor(public dataNode: IBlendedCourseRepository, ctx: blended.learnContext) {
  //    super(dataNode, ctx);
  //  }
  //  getPersistData: () => IBlendedCourseUser;
  //  getChild(): blended.IStateUrl {
  //    var ud = this.getPersistData();
  //    if (!ud.pretest.done) { //pretest task neexistuje nebo neni dokoncen
  //      return new blended.pretestGreenProxy(this.dataNode.pretest, this.ctx).getChild();
  //    } else if (!ud.entryTest.done) { //entryTest task neexistuje nebo neni dokoncen
  //      return new blended.greenProxy(this.dataNode.entryTests[ud.pretest.targetLevel], this.ctx).getChild();
  //    } else if (!ud.lessons.done) { //level task neexistuje nebo neni dokoncen
  //      return new blended.greenProxy(this.dataNode.lessons[ud.pretest.targetLevel], this.ctx).getChild();
  //    } else {
  //      return null;
  //    }
  //  }
  //}

    //greenChild(): taskController {
    //  var ud = this.getPersistData();
    //  if (!ud.pretest.done) { //pretest task neexistuje nebo neni dokoncen
    //    this.child = new pretestTaskController(this.dataNode.pretest, this.ctx, this, completed);
    //  } else if (!ud.entryTest.done) { //entryTest task neexistuje nebo neni dokoncen
    //    this.child = new blended.moduleTask(this.dataNode.entryTests[ud.pretest.targetLevel], this.ctx, this, completed);
    //  } else if (!ud.lessons.done) { //level task neexistuje nebo neni dokoncen
    //    this.child = new blended.listTask(this.dataNode.lessons[ud.pretest.targetLevel], this.ctx, this, completed);
    //  } else {
    //    ud.done = true; this.child = null;
    //    completed();
    //  }
    //}

