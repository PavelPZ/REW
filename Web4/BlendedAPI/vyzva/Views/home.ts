namespace vyzva {

  
  //****************** VIEW
  export class homeViewController extends blended.taskViewController {

    parent: homeTaskController;
    pretestLevel: number;
    learnPlan: Array<IHomeLesson>; //seznam modulu vyuky
    pretestLevels: Array<blended.levelIds>; //levels info pro hotovy pretest

    constructor(state: blended.IStateService) {
      super(state);
      this.breadcrumb = breadcrumbBase(this); this.breadcrumb[1].active = true;
      var pretestItem: IHomeLesson;
      var pretestUser: blended.IPretestUser;

      var fromNode = (node: CourseMeta.data, idx: number): IHomeLesson => {
        var res: IHomeLesson = {
          node: node,
          user: null,
          homeTask: this.parent,
          idx: idx,
          lessonType: idx == 0 ? IHomeLessonType.pretest : (node.url.indexOf('/test') > 0 ? IHomeLessonType.test : IHomeLessonType.lesson),
        };
        var nodeUser = blended.getPersistData<blended.IPersistNodeUser>(this.parent.dataNode.pretest, this.ctx.taskid);
        if (idx == 0) {
          pretestUser = <blended.IPretestUser>nodeUser;
          res.user = <any>{ done: pretestUser ? pretestUser.done : false};
        } else
          res.user = nodeUser ? blended.agregateShortFromNodes(res.node, this.ctx.taskid, false) : null;
        res.status = !res.user ? IHomeLessonStatus.no : (res.user.done ? IHomeLessonStatus.done : IHomeLessonStatus.entered);
        return res;
      }

      this.learnPlan = [pretestItem = fromNode(this.parent.dataNode.pretest, 0)];

      if (pretestUser && pretestUser.done) {
        this.pretestLevels = pretestUser.history;
        this.pretestLevel = pretestUser.targetLevel;
        this.learnPlan.push(fromNode(this.parent.dataNode.entryTests[this.pretestLevel], 1));
        this.learnPlan.pushArray(_.map(this.parent.dataNode.lessons[this.pretestLevel], (nd, idx) => fromNode(nd, idx + 2)));
      }
      //prvni nehotovy node je aktivni
      _.find(this.learnPlan, pl => {
        if (pl.status == IHomeLessonStatus.done) return false;
        pl.active = true; return true;
      });
    }

    navigateLesson(lesson: IHomeLesson) {
      var service: blended.IStateService = {
        params: lesson.lessonType == IHomeLessonType.pretest ?
          blended.cloneAndModifyContext(this.ctx, d => d.pretesturl = blended.encodeUrl(this.parent.dataNode.pretest.url)) :
          blended.cloneAndModifyContext(this.ctx, d => d.moduleurl = blended.encodeUrl(lesson.node.url)),
        current: lesson.lessonType == IHomeLessonType.pretest ?
          stateNames.pretestTask :
          (lesson.lessonType == IHomeLessonType.test ? stateNames.moduleTestTask : stateNames.moduleLessonTask),
        parent: this.parent,
        createMode: blended.createControllerModes.adjustChild
      };

      this.parent.child = lesson.lessonType == IHomeLessonType.pretest ?
        new blended.pretestTaskController(service) :
        new moduleTaskController(service);

      var url = this.parent.child.goCurrent();
      this.navigate(url);
    };

    navigatePretestLevel(lev: blended.levelIds) {
      var service: blended.IStateService = {
        params: blended.cloneAndModifyContext(this.ctx, d => { var mod = this.parent.dataNode.pretest.Items[lev];  d.moduleurl = blended.encodeUrl(mod.url); }),
        current: stateNames.pretestPreview,
        parent: this.parent,
        createMode: blended.createControllerModes.adjustChild
      }
      this.parent.child = new moduleTaskController(service);

      var url = this.parent.child.goCurrent();
      this.navigate(url);
    }

    gotoLector(groupId: number) {
      this.navigate({ stateName: stateNames.lectorHome.name, pars: <any>{ groupid: groupId } });
    }

    debugClearProduct() {
      proxies.vyzva57services.debugClearProduct(this.ctx.companyid, this.ctx.onbehalfof || this.ctx.loginid, this.ctx.productUrl, () => location.reload());
    }

  }

  export interface IHomeLesson {
    node: CourseMeta.data;
    user: blended.IExShort; //blended.IPersistNodeUser;
    homeTask?: homeTaskController;
    idx: number;
    active?: boolean;
    lessonType: IHomeLessonType;
    status?: IHomeLessonStatus;
  }
  export enum IHomeLessonStatus { no, entered, done }
  export enum IHomeLessonType { pretest, lesson, test }

  //****************** TASK
  export class homeTaskController extends blended.homeTaskController {

    constructor(state: blended.IStateService, resolves: Array<any>) {
      super(state, resolves);
      this.user = blended.getPersistWrapper<IBlendedCourseUser>(this.dataNode, this.ctx.taskid, () => { return { startDate: Utils.nowToNum() }; });
      //Intranet
      this.companyData = <intranet.IAlocatedKeyRoot>(resolves[1]);
      if (!this.companyData) return;
      var alocatedKeyInfos = this.companyData.alocatedKeyInfos;
      this.lectorGroups = _.map(_.filter(alocatedKeyInfos, inf => inf.isLector), inf => inf.group);
      var studentGroups = _.map(_.filter(alocatedKeyInfos, inf => inf.isLector || inf.isVisitor), inf => inf.group);
      //this.studentGroup = studentGroups.length > 0 ? studentGroups[0] : null;
      this.isLector = !this.ctx.onbehalfof && this.lectorGroups.length > 0;
      this.isStudent = studentGroups.length > 0;
    }

    dataNode: IBlendedCourseRepository;

    //intranet
    companyData: intranet.IAlocatedKeyRoot;
    lectorGroups: Array<intranet.IStudyGroup>; //skupiny, spravovane lektorem
    isLector: boolean; //jsem lektor
    isStudent: boolean; //jsem student nebo vizitor
  }

  export interface IBlendedCourseRepository extends blended.IProductEx {
    pretest: blended.IPretestRepository; //pretest
    entryTests: Array<CourseMeta.data>; //vstupni check-testy (entryTests[0]..A1, ..)
    lessons: Array<Array<CourseMeta.data>>; //jednotlive tydenni tasky. Jeden tydenni task je seznam z kurziku nebo testu
  }

  export interface IBlendedCourseUser extends blended.IPersistNodeUser { //user dato pro ICourseRepository
    startDate: number; //datum zacatku prvni etapy
  }

  blended.rootModule
    .filter('vyzva$home$nodeclass', () => {
      return (lesson: IHomeLesson) => {
        if (lesson.active) return "list-group-item-success";
        switch (lesson.status) {
          case IHomeLessonStatus.done: return "list-group-item-info";
          default: return "";
        }
      };
    })
    .filter('vyzva$home$iconclass', () => {
      return (lesson: IHomeLesson) => {
        if (lesson.active) return "fa-hand-o-right";
        switch (lesson.status) {
          case IHomeLessonStatus.done: return "fa-check";
          default: return "";
        }
      };
    })
  ;

}
