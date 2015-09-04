namespace vyzva {

  export interface IHomeLesson {
    node: CourseMeta.data;
    user: blended.IExShort; 
    homeTask?: homeTaskController;
    idx: number;
    active?: boolean;
    lessonType: homeLessonTypes;
    status?: homeLessonStates;

    rightButtonType?: rightButtonTypes;
  }
  export enum homeLessonStates { no, entered, done }
  export enum homeLessonTypes { pretest, lesson, test }
  export enum rightButtonTypes { no, run, preview }

  
  //****************** VIEW
  export class homeViewController extends blended.taskViewController {

    parent: homeTaskController;
    pretestLevel: number;
    learnPlan: Array<IHomeLesson>; //seznam modulu vyuky
    pretestLevels: Array<blended.levelIds>; //levels info pro hotovy pretest

    user: blended.IExShort; //kompletni vysledky studia

    constructor(state: blended.IStateService) {
      super(state);
      this.breadcrumb = breadcrumbBase(this); this.breadcrumb[1].active = true;
      var pretestItem: IHomeLesson;
      var pretestUser: blended.IPretestUser;
      var firstNotDoneCheckTestIdx: number; //index prvnio nehotoveho kontrolniho testu

      var fromNode = (node: CourseMeta.data, idx: number): IHomeLesson => {
        var res: IHomeLesson = {
          node: node,
          user: null,
          homeTask: this.parent,
          idx: idx,
          lessonType: idx == 0 ? homeLessonTypes.pretest : (node.url.indexOf('/test') > 0 ? homeLessonTypes.test : homeLessonTypes.lesson),
        };
        var nodeUser = blended.getPersistData<blended.IPersistNodeUser>(this.parent.dataNode.pretest, this.ctx.taskid);
        if (idx == 0) {
          pretestUser = <blended.IPretestUser>nodeUser;
          res.user = <any>{ done: pretestUser ? pretestUser.done : false };
        } else
          res.user = nodeUser ? blended.agregateShortFromNodes(res.node, this.ctx.taskid, false) : null;
        res.status = !res.user ? homeLessonStates.no : (res.user.done ? homeLessonStates.done : homeLessonStates.entered);
        //rightButtonType management: vsechny nehotove dej RUN a ev. nastav index prvniho nehotoveho check testu
        if (res.lessonType != homeLessonTypes.pretest)
          res.rightButtonType = res.status == homeLessonStates.done ? rightButtonTypes.preview : rightButtonTypes.run;
        if (!firstNotDoneCheckTestIdx && res.lessonType == homeLessonTypes.test && res.status != homeLessonStates.done) firstNotDoneCheckTestIdx = idx;
        return res;
      }

      this.learnPlan = [pretestItem = fromNode(this.parent.dataNode.pretest, 0)];

      if (pretestUser && pretestUser.done) {
        this.pretestLevels = pretestUser.history;
        this.pretestLevel = pretestUser.targetLevel;
        this.learnPlan.push(fromNode(this.parent.dataNode.entryTests[this.pretestLevel], 1));
        this.learnPlan.pushArray(_.map(this.parent.dataNode.lessons[this.pretestLevel], (nd, idx) => fromNode(nd, idx + 2)));
      }
      //rightButtonType management: vsechna cviceni za firstNotDoneCheckTestIdx dej rightButtonTypes=no
      for (var i = firstNotDoneCheckTestIdx + 1; i < this.learnPlan.length; i++) this.learnPlan[i].rightButtonType = rightButtonTypes.no;
      //prvni nehotovy node je aktivni
      _.find(this.learnPlan, pl => {
        if (pl.status == homeLessonStates.done) return false;
        pl.active = true; return true;
      });

    }

    navigateLesson(lesson: IHomeLesson) {
      var service: blended.IStateService = {
        params: lesson.lessonType == homeLessonTypes.pretest ?
          blended.cloneAndModifyContext(this.ctx, d => d.pretesturl = blended.encodeUrl(this.parent.dataNode.pretest.url)) :
          blended.cloneAndModifyContext(this.ctx, d => d.moduleurl = blended.encodeUrl(lesson.node.url)),
        current: lesson.lessonType == homeLessonTypes.pretest ?
          stateNames.pretestTask :
          (lesson.lessonType == homeLessonTypes.test ? stateNames.moduleTestTask : stateNames.moduleLessonTask),
        parent: this.parent,
        createMode: blended.createControllerModes.adjustChild
      };

      this.parent.child = lesson.lessonType == homeLessonTypes.pretest ?
        new blended.pretestTaskController(service) :
        new moduleTaskController(service);

      var url = this.parent.child.goCurrent();
      this.navigate(url);
    };

    navigatePretestLevel(lev: blended.levelIds) {
      var service: blended.IStateService = {
        params: blended.cloneAndModifyContext(this.ctx, d => { var mod = this.parent.dataNode.pretest.Items[lev]; d.moduleurl = blended.encodeUrl(mod.url); }),
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
        if (lesson.active && lesson.lessonType != homeLessonTypes.pretest) return "list-group-item-success-primary";
        else if (lesson.status == homeLessonStates.done || (lesson.active && lesson.lessonType == homeLessonTypes.pretest)) return "list-group-item-success";
      }
    })
    .filter('vyzva$home$doneicon', () => {
      return (lesson: IHomeLesson) => {
        if (lesson.active) return "fa-hand-o-right";
        switch (lesson.status) {
          case homeLessonStates.done: return "fa-check";
          default: return "";
        }
      };
    })
  ;

}
