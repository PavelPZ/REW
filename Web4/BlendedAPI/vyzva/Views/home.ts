namespace vyzva {

  export enum homeLessonStates { no, entered, done }
  export enum rightButtonTypes { no, run, preview }
  export enum leftMarkTypes { no, active, pretestLevel, progress, waitForEvaluation }

  
  //****************** VIEW
  export class homeLesson extends blended.moduleServiceLow {
    idx: number;
    active: boolean;
    status: homeLessonStates;
    rightButtonType: rightButtonTypes;
    leftMarkType: leftMarkTypes;
  }

  export class homeViewController extends blended.taskViewController {

    myTask: homeTaskController;
    pretestLevel: number;
    lessons: Array<homeLesson>; //seznam modulu vyuky
    pretestLevels: Array<blended.levelIds>; //levels info pro hotovy pretest

    agregCourseUser: blended.IExShort; //kompletni vysledky studia celeho kurzu
    score: number;

    constructor($scope: ng.IScope | blended.IStateService, $state?: angular.ui.IStateService) {
      super($scope, $state);
      this.breadcrumb = breadcrumbBase(this); this.breadcrumb[1].active = true;
      var pretestItem: homeLesson;
      var pretestUser: blended.IPretestUser;
      var firstNotDoneCheckTestIdx: number; //index prvnio nehotoveho kontrolniho testu
      var mustWaitForEvaluation = false;

      var fromNode = (node: CourseMeta.data, idx: number): homeLesson => {
        var res = new homeLesson(
          node,
          idx == 0 ? blended.moduleServiceType.pretest : (node.url.indexOf('/test') > 0 ? blended.moduleServiceType.test : blended.moduleServiceType.lesson),
          this, true);
        res.idx = idx;
        var nodeUser = blended.getPersistData<blended.IPersistNodeUser>(node, this.ctx.taskid);
        if (idx == 0) {
          res.agregUser = blended.pretestScore(<blended.IPretestRepository>(node), <blended.IPretestUser>nodeUser, this.ctx.taskid);
          pretestUser = res.agregUser = $.extend(res.agregUser, nodeUser);
          if (_.isNumber(pretestUser.targetLevel) && pretestUser.targetLevel >= 0) pretestUser.flag = CourseModel.CourseDataFlag.done;
        } else {
          res.agregUser = blended.agregateShortFromNodes(res.node, this.ctx.taskid, false); //vysledek modulu ze cviceni
          res.agregUser = $.extend(res.agregUser, nodeUser);
        }
        res.status = !res.agregUser ? homeLessonStates.no : (blended.persistUserIsDone(res.agregUser) ? homeLessonStates.done : homeLessonStates.entered);

        //rightButtonType management: vsechny nehotove testy a lekce dej RUN 
        if (res.lessonType != blended.moduleServiceType.pretest)
          res.rightButtonType = res.status == homeLessonStates.done ? rightButtonTypes.preview : rightButtonTypes.run;

        //Pro tests:
        //ikona "ceka se na vyhodnoceni": done && pcCannotEvaluate && !nodeUser.lectorControlTestOK
        //nejde pokracovat dal: existuje test s: done && !nodeUser.lectorControlTestOK && score< 65
        //firstNotDoneCheckTestIdx: prvni test s !done nebo 'nejde pokracovat dal' test
        if (res.lessonType == blended.moduleServiceType.test) {
          if (res.status == homeLessonStates.done) {
            var pcCannotEvaluate = nodeUser && !!(nodeUser.flag & CourseModel.CourseDataFlag.pcCannotEvaluate);
            var lectorControlTestOK = nodeUser && (<blended.IModuleUser>nodeUser).lectorControlTestOK;
            var denyNextLessons = !lectorControlTestOK && res.agregUser.score < 65; //nejde pokracovat, skore je mensi nez 65 a lektor jeste nerozohodl
            res.leftMarkType = denyNextLessons || (pcCannotEvaluate && !lectorControlTestOK) ? leftMarkTypes.waitForEvaluation : leftMarkTypes.progress;
            if (denyNextLessons) {
              mustWaitForEvaluation = true;
              if (!firstNotDoneCheckTestIdx) firstNotDoneCheckTestIdx = idx;
            }
          } else {
            if (!firstNotDoneCheckTestIdx) firstNotDoneCheckTestIdx = idx; //add: prvni test s !done nebo 'nejde pokracovat dal' test
          }
        } else if (res.status == homeLessonStates.done) {
          if (res.lessonType == blended.moduleServiceType.pretest) res.leftMarkType = leftMarkTypes.pretestLevel;
          else res.leftMarkType = leftMarkTypes.progress;
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
      //pokud se neceka na vyhodnoceni tak prvni nehotovy node je aktivni
      if (!mustWaitForEvaluation)
        _.find(this.lessons, pl => {
          if (pl.status == homeLessonStates.done) return false;
          pl.active = true; pl.leftMarkType = leftMarkTypes.active; return true;
        });
      //skore za cely kurz
      var users = _.map(this.lessons, l=> l.agregUser);
      this.agregCourseUser = blended.agregateShorts(users);
      //this.score = blended.scorePercent(this.user);
    }

    navigateTestHw() {
      var pars = blended.cloneAndModifyContext(this.ctx, ctx => {
        ctx.url = blended.encodeUrl('/lm/blcourse/' + LMComLib.LineIds[this.productParent.dataNode.line].toLowerCase() + '/hwtest/hwtest');
        ctx.returnurl = location.hash;
      });
      this.navigate({ stateName: stateNames.testhw.name, pars: pars });
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

    //debugClearProduct() {
    //  proxies.vyzva57services.debugClearProduct(this.ctx.companyid, this.ctx.userDataId(), this.ctx.productUrl, () => location.reload());
    //}

  }

  //****************** TASK
  export class homeTaskController extends blended.homeTaskController {

    dataNode: IBlendedCourseRepository;

    lectorGroups: Array<intranet.IStudyGroup>; //skupiny, spravovane lektorem
    showLectorPart: boolean; //jsem lektor
    showStudentPart: boolean; //jsem student nebo vizitor

    constructor($scope: ng.IScope | blended.IStateService, $state: angular.ui.IStateService, product: IBlendedCourseRepository, public intranetInfo: intranet.alocatedKeyRoot) {
      super($scope, $state, product);
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
      //debugger;
      this.showStudentPart = studentGroups.length > 0 /*jsem primo student*/ || !!this.ctx.onbehalfof /**/;
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
