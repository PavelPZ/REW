namespace vyzva {

  export enum homeLessonStates { no, entered, done }
  export enum rightButtonTypes { no, run, preview }
  export enum leftMarkTypes { no, active, pretestLevel, progress, waitForEvaluation }

  
  //****************** VIEW
  export class homeLesson extends blended.moduleServiceLow {
    idx: number;
    active: boolean;
    status: homeLessonStates;
    //cannotRun: boolean; //ucitel nemuze prohlidnout nehotovy test
    rightButtonType: rightButtonTypes;
    leftMarkType: leftMarkTypes;
  }

  export class homeViewController extends blended.taskViewController {

    myTask: homeTaskController;
    pretestLevel: number;
    lessons: Array<homeLesson>; //seznam modulu vyuky
    pretestLevels: Array<blended.levelIds>; //levels info pro hotovy pretest

    user: blended.IExShort; //kompletni vysledky studia
    score: number;

    constructor($scope: ng.IScope | blended.IStateService, $state?: angular.ui.IStateService) {
      super($scope, $state);
      this.breadcrumb = breadcrumbBase(this); this.breadcrumb[1].active = true;
      var pretestItem: homeLesson;
      var pretestUser: blended.IPretestUser;
      var firstNotDoneCheckTestIdx: number; //index prvnio nehotoveho kontrolniho testu

      var fromNode = (node: CourseMeta.data, idx: number): homeLesson => {
        var res = new homeLesson(
          node,
          idx == 0 ? blended.moduleServiceType.pretest : (node.url.indexOf('/test') > 0 ? blended.moduleServiceType.test : blended.moduleServiceType.lesson),
          this, true);
        res.idx = idx;
        var nodeUser = blended.getPersistData<blended.IPersistNodeUser>(node, this.ctx.taskid);
        if (idx == 0) {
          res.user = blended.pretestScore(<blended.IPretestRepository>(node), <blended.IPretestUser>nodeUser, this.ctx.taskid);
          pretestUser = res.user = $.extend(res.user, nodeUser);
          //pretestUser = $.extend(res.user, nodeUser);
        } else {
          res.user = blended.agregateShortFromNodes(res.node, this.ctx.taskid, false);
        }
        res.status = !res.user ? homeLessonStates.no : (blended.persistUserIsDone(res.user) ? homeLessonStates.done : homeLessonStates.entered);
        //lesson nejde spustit
        //res.cannotRun = this.ctx.onbehalfof && res.lessonType != blended.moduleServiceType.lesson && res.status != homeLessonStates.done;
        //rightButtonType management: vsechny nehotove dej RUN a ev. nastav index prvniho nehotoveho check testu
        if (res.lessonType != blended.moduleServiceType.pretest)
          res.rightButtonType = res.status == homeLessonStates.done ? rightButtonTypes.preview : rightButtonTypes.run;
        if (!firstNotDoneCheckTestIdx && res.lessonType == blended.moduleServiceType.test && res.status != homeLessonStates.done) firstNotDoneCheckTestIdx = idx;
        //left mark
        if (blended.persistUserIsDone(res.user)) {
          res.leftMarkType = res.lessonType == blended.moduleServiceType.pretest ? leftMarkTypes.pretestLevel : (res.user.waitForEvaluation ? leftMarkTypes.waitForEvaluation : leftMarkTypes.progress);
        }
        return res;
      }

      this.lessons = [pretestItem = fromNode(this.myTask.dataNode.pretest, 0)];

      if (pretestUser && blended.persistUserIsDone(pretestUser)) {
        this.pretestLevels = pretestUser.history;
        this.pretestLevel = pretestUser.targetLevel;
        this.lessons.push(fromNode(this.myTask.dataNode.entryTests[this.pretestLevel], 1));
        this.lessons.pushArray(_.map(this.myTask.dataNode.lessons[this.pretestLevel], (nd, idx) => fromNode(nd, idx + 2)));
      }
      //rightButtonType management: vsechna cviceni za firstNotDoneCheckTestIdx dej rightButtonTypes=no
      for (var i = firstNotDoneCheckTestIdx + 1; i < this.lessons.length; i++) this.lessons[i].rightButtonType = rightButtonTypes.no;
      //prvni nehotovy node je aktivni
      _.find(this.lessons, pl => {
        if (pl.status == homeLessonStates.done) return false;
        pl.active = true; pl.leftMarkType = leftMarkTypes.active; return true;
      });
      //skore za cely kurz
      //var users = _.map(_.filter(this.lessons, l => /*l.status == homeLessonStates.done &&*/ l.lessonType != blended.moduleServiceType.pretest), l=> l.user);
      var users = _.map(this.lessons, l=> l.user);
      this.user = blended.agregateShorts(users);
      //this.score = blended.scorePercent(this.user);
    }

    navigateLesson(lesson: homeLesson) {
      //if (lesson.cannotRun) return;
      var service: blended.IStateService = {
        params: lesson.lessonType == blended.moduleServiceType.pretest ?
          blended.cloneAndModifyContext(this.ctx, d => d.pretesturl = blended.encodeUrl(this.myTask.dataNode.pretest.url)) :
          blended.cloneAndModifyContext(this.ctx, d => d.moduleurl = blended.encodeUrl(lesson.node.url)),
        current: lesson.lessonType == blended.moduleServiceType.pretest ?
          stateNames.pretestTask :
          (lesson.lessonType == blended.moduleServiceType.test ? stateNames.moduleTestTask : stateNames.moduleLessonTask),
        parent: this.myTask,
        //createMode: blended.createControllerModes.adjustChild
      };


      var nextTask = lesson.lessonType == blended.moduleServiceType.pretest ?
        new blended.pretestTaskController(service) :
        new moduleTaskController(service);
      var url = nextTask.goCurrent();
      this.navigate(url);

      //this.myTask.child = lesson.lessonType == blended.moduleServiceType.pretest ?
      //  new blended.pretestTaskController(service) :
      //  new moduleTaskController(service);
      //var url = this.myTask.child.goCurrent();

    };

    navigatePretestLevel(lev: blended.levelIds) {
      var service: blended.IStateService = {
        params: blended.cloneAndModifyContext(this.ctx, d => { var mod = this.myTask.dataNode.pretest.Items[lev]; d.moduleurl = blended.encodeUrl(mod.url); }),
        current: stateNames.pretestPreview,
        //current: blended.prodStates.pretestModule,
        parent: this.myTask,
        //createMode: blended.createControllerModes.adjustChild
      }
      var nextTask = new moduleTaskController(service);
      var url = nextTask.goCurrent();
      this.navigate(url);
      //this.myTask.child = new moduleTaskController(service);
      //var url = this.myTask.child.goCurrent();
    }

    gotoLector(groupId: number) {
      this.navigate({ stateName: stateNames.lectorHome.name, pars: <any>{ groupid: groupId } });
    }

    debugClearProduct() {
      proxies.vyzva57services.debugClearProduct(this.ctx.companyid, this.ctx.userDataId(), this.ctx.productUrl, () => location.reload());
    }

  }

  //****************** TASK
  export class homeTaskController extends blended.homeTaskController {

    dataNode: IBlendedCourseRepository;

    lectorGroups: Array<intranet.IStudyGroup>; //skupiny, spravovane lektorem
    showLectorPart: boolean; //jsem lektor
    showStudentPart: boolean; //jsem student nebo vizitor

    constructor($scope: ng.IScope | blended.IStateService, $state: angular.ui.IStateService, product: IBlendedCourseRepository, public intranetInfo: intranet.alocatedKeyRoot) {
      super($scope, $state, product);
      //constructor(state: blended.IStateService, resolves: Array<any>) {
      //  super(state, resolves);
      this.productParent = this;
      this.user = blended.getPersistWrapper<IBlendedCourseUser>(this.dataNode, this.ctx.taskid, () => { return { startDate: Utils.nowToNum(), flag: CourseModel.CourseDataFlag.blProductHome }; });
      //Intranet
      //this.intranetInfo = intranetInfo;
      if (!this.intranetInfo) return;
      var alocatedKeyInfos = this.intranetInfo.alocatedKeyInfos;
      this.lectorGroups = _.uniq(_.map(_.filter(alocatedKeyInfos, inf => inf.isLector), inf => inf.group), it => it.groupId);
      var studentGroups = _.map(_.filter(alocatedKeyInfos, inf => inf.isStudent || inf.isVisitor), inf => inf.group);
      //this.studentGroup = studentGroups.length > 0 ? studentGroups[0] : null;
      this.showLectorPart = !this.ctx.onbehalfof && this.lectorGroups.length > 0;
      this.showStudentPart = studentGroups.length > 0;
    }
    static $inject = ['$scope', '$state', '$loadedProduct', '$intranetInfo'];

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
      return (lesson: homeLesson) => {
        if (lesson.active && lesson.lessonType != blended.moduleServiceType.pretest) return "list-group-item-success-primary";
        else if (lesson.status == homeLessonStates.done || (lesson.active && lesson.lessonType == blended.moduleServiceType.pretest)) return "list-group-item-success";
      }
    })
    .directive('vyzva$common$summary', () => {
      return {
        scope: { user: '&user' },
        templateUrl: 'vyzva$common$summary.html'
      }
    })  
  ;

}
