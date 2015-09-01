namespace vyzva {

  
  //****************** VIEW
  export class homeViewController extends blended.taskViewController {

    parent: homeTaskController;
    pretestStatus: IHomeNodeStatus;
    pretestLevel: number;
    learnPlan: Array<ILearnPlanLesson>; //seznam modulu vyuky

    constructor(state: blended.IStateService) {
      super(state);
      this.breadcrumb = breadcrumbBase(this); this.breadcrumb[1].active = true;
      var prUd = blended.getPersistData<blended.IPretestUser>(this.parent.dataNode.pretest, this.ctx.taskid);
      this.learnPlan = [];
      var someActive = false;
      if (!prUd || !prUd.done)
        this.pretestStatus = IHomeNodeStatus.active;
      else {
        this.pretestStatus = IHomeNodeStatus.done;
        this.pretestLevel = prUd.targetLevel;
        this.learnPlan.push(this.fromNode(this.parent.dataNode.entryTests[prUd.targetLevel], 2));
        this.learnPlan.pushArray(_.map(this.parent.dataNode.lessons[prUd.targetLevel], (nd, idx) => this.fromNode(nd, idx + 3)));
      }
      _.each(this.learnPlan, pl => {
        if (blended.moduleIsDone(pl.node, this.ctx.taskid)) pl.status = IHomeNodeStatus.done;
        else if (!someActive) { someActive = true; pl.status = IHomeNodeStatus.active; }
      });
    }
    fromNode(node: CourseMeta.data, idx: number): ILearnPlanLesson { return { node: node, user: blended.getPersistData<blended.IPersistNodeUser>(node, this.ctx.taskid), task: this.parent, idx: idx }; }

    gotoLector(groupId: number) {
      this.navigate({ stateName: stateNames.lectorHome.name, pars: <any>{ groupid: groupId } });
    }

  }

  export interface ILearnPlanLesson {
    node: CourseMeta.data;
    user: blended.IPersistNodeUser;
    task: homeTaskController;
    idx: number;
    status?: IHomeNodeStatus;
  }
  export enum IHomeNodeStatus { no, done, active }

  blended.rootModule
    .filter('vyzva$home$nodeclass', () => {
      return (id: IHomeNodeStatus) => {
        switch (id) {
          case IHomeNodeStatus.done: return "list-group-item-info";
          case IHomeNodeStatus.active: return "list-group-item-success";
          default: return "Angličtina";
        }
      };
    })
    .directive('vyzva$home$nodemarks', () => {
      return {
        scope: { status: '&status', index: '&index', api: '&api' },
        templateUrl: 'vyzva$home$nodemarks.html'
      }
    })
  ;

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
    //studentGroup: intranet.IStudyGroup; //skupina, ke ktere nalezim
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

}
