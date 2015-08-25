namespace vyzva {

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

  //****************** VIEW
  export class homeViewController extends blended.taskViewController {
    constructor(state: blended.IStateService) {
      super(state);
      this.breadcrumb = breadcrumbBase(this.myTask); this.breadcrumb[1].active = true;
      this.prt = this.myTask.getPretestItemModel();
    }
    myTask: homeTaskController;

    //************ IHomePretest
    prt: IHomePretest;
  }

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

  //****************** TASK
  export class homeTaskController extends blended.taskController {
    constructor(state: blended.IStateService) {
      super(state);
      
      //this.breadcrumb = breadcrumbBase(this); this.breadcrumb[1].active = true;
      //this.prt = this.getPretestItemModel();
    }
    static $inject = ['$scope', '$state'];

    //************* TASK
    getPersistData: () => IBlendedCourseUser;
    setPersistData: (modify: (data: IBlendedCourseUser) => void) => IBlendedCourseUser;
    dataNode: IBlendedCourseRepository;

    initPersistData(ud: IBlendedCourseUser) {
      super.initPersistData(ud);
      ud.startDate = Utils.nowToNum();
      ud.pretest = { url: this.dataNode.pretest.url }
    }

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

    moveForward(ud: IBlendedCourseUser): string {
      var childUd = this.child.getPersistData();
      if (childUd.url == ud.pretest.url) {
        var pretUser = <blended.IPretestUser>childUd; if (!pretUser.done) return 'tasks.course.doGoAhead: !pretUser.done';
        this.setPersistData(dt => { dt.pretest.done = true; dt.pretest.targetLevel = pretUser.targetLevel; dt.entryTest = { url: this.dataNode.entryTests[dt.pretest.targetLevel].url } });
      } else if (childUd.url == ud.entryTest.url) {
        var entryTestUser = <blended.IModuleUser>childUd; if (!entryTestUser.done) return 'tasks.course.doGoAhead: !entryTestUser.done';
        this.setPersistData(dt => { dt.entryTest.done = true; dt.entryTest.score = entryTestUser.score; dt.lessons = { url: this.dataNode.lessons[dt.pretest.targetLevel].url } });
      } else if (childUd.url == ud.lessons.url) {
        var lessonsUser = childUd; if (!lessonsUser.done) return 'tasks.course.doGoAhead: !lessonsUser.done';
        this.setPersistData(dt => { dt.done = dt.lessons.done = true; }) //lesson i self je hotovo;
      } else
        return 'tasks.course.doGoAhead: unknown child url - ' + childUd.url;
      return null;
    }

    //getName(): string { return stateNames.taskRoot; }

    //********** PRETEST item
    getPretestItemModel(): IHomePretest {
      var ud = this.getPersistData();
      return {
        run: () => {
          debugger;
          if (!this.child || this.child.dataNode != this.dataNode.pretest) throw '!this.child || this.child.dataNode.url != ud.pretest.url';
        },
        canRun: !ud.pretest || !ud.pretest.done,
        btnTitle: !ud.pretest ? 'Začněte spuštěním Rozřazovacího testu' : 'Dokončete Rozřazovací test',
        resultLevel: ud.pretest.done ? blended.levelIds[ud.pretest.targetLevel] : '',
        previewUrl: stateNames.pretest.name,
      };
    }
  }

  export interface IBlendedCourseRepository extends blended.IProductEx {
    pretest: blended.IPretestRepository; //pretest
    entryTests: Array<CourseMeta.data>; //vstupni check-testy (entryTests[0]..A1, ..)
    lessons: Array<CourseMeta.data>; //jednotlive tydenni tasky. Jeden tydenni task je seznam z kurziku nebo testu
  }

  export interface IPretestProxyUser extends blended.IPersistNodeUser {
    targetLevel?: blended.levelIds;
  }
  export interface IBlendedCourseUser extends blended.IPersistNodeUser { //user dato pro ICourseRepository
    startDate: number; //datum zacatku prvni etapy
    //child task infos
    pretest: IPretestProxyUser;
    entryTest: blended.IPersistNodeUser;
    lessons: blended.IPersistNodeUser;
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


