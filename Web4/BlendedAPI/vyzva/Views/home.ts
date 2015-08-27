namespace vyzva {

  
  //****************** VIEW
  export class homeViewController extends blended.taskViewController {
    constructor(state: blended.IStateService) {
      super(state);
      this.breadcrumb = breadcrumbBase(this); this.breadcrumb[1].active = true;
      this.prt = this.parent.getPretestItemModel();
    }
    parent: homeTaskController;

    //************ IHomePretest
    prt: IHomePretest;
  }

  //****************** TASK
  export class homeTaskController extends blended.homeTaskController {

    constructor(state: blended.IStateService, resolves: Array<any>) {
      super(state, resolves);
      //if (resolves[0].loader == 'schoolmanager') {
      //  this.wrongUrlRedirect({ stateName: stateNames.shoolManager.name }); return;
      //} else if (resolves[0].loader == 'langmastermanager') {
      //  this.wrongUrlRedirect({ stateName: stateNames.langmasterManager.name }); return;
      //}
      this.user = blended.getPersistWrapper<IBlendedCourseUser>(this.dataNode, this.ctx.taskid, () => { return { startDate: Utils.nowToNum() }; });
    }

    dataNode: IBlendedCourseRepository;

    //********** PRETEST item
    getPretestItemModel(): IHomePretest {
      var prUd = blended.getPersistData<blended.IPretestUser>(this.dataNode.pretest, this.ctx.taskid);
      return {
        run: () => {
          this.child = new blended.pretestTaskController({
            params: blended.cloneAndModifyContext(this.ctx, d => d.pretesturl = blended.encodeUrl(this.dataNode.pretest.url)),
            current: stateNames.pretestTask,
            parent: this,
            createMode: blended.createControllerModes.adjustChild
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

  export interface IBlendedCourseUser extends blended.IPersistNodeUser { //user dato pro ICourseRepository
    startDate: number; //datum zacatku prvni etapy
  }

}
