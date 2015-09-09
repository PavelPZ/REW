namespace vyzva {

  export class lectorController extends blended.controller {
    constructor($scope: ng.IScope | blended.IStateService, $state: angular.ui.IStateService) {
      super($scope, $state);
      var lectorGroups = this.productParent.lectorGroups;
      var gid = parseInt(this.ctx.groupid);
      this.lectorGroup = _.find(lectorGroups, grp => grp.groupId == gid);
    }
    lectorGroup: intranet.IStudyGroup; //aktualni skupina
    productParent: homeTaskController;
  }

  export class lectorViewBase extends blended.controller {
    constructor($scope: ng.IScope | blended.IStateService, $state: angular.ui.IStateService) {
      super($scope, $state);
      this.title = 'Studijní skupina ' + this.lectorParent.lectorGroup.title;
      this.breadcrumb = this.breadcrumbBase(); this.breadcrumb[this.breadcrumb.length - 1].active = true;
    }
    breadcrumbBase(): Array<blended.breadcrumbItem> {
      var res = vyzva.breadcrumbBase(this);
      res.push({ title: this.title, url: this.href({ stateName: stateNames.lectorHome.name, pars: this.ctx }) });
      return res;
    }
    //myTask: lectorController;
    tabIdx: number;
  }

  //***************************** LECTOR HOME

  export interface lectorViewItem {
    key: intranet.IAlocatedKey;
  }

  export class lectorViewController extends lectorViewBase {
    constructor($scope: ng.IScope | blended.IStateService, $state: angular.ui.IStateService) {
      super($scope, $state);
      this.breadcrumb[this.breadcrumb.length - 1].active = true;
      this.tabIdx = 0;
      this.students = _.map(this.lectorParent.lectorGroup.studentKeys, k => { return { key: k } });
    }
    students: Array<lectorViewItem>;
    gotoStudentResult(student: lectorViewItem) {
      var ctx = blended.cloneAndModifyContext(this.ctx, c => {
        c.onbehalfof = student.key.lmcomId;
        c.returnurl = this.href({ stateName: stateNames.lectorHome.name, pars: this.ctx })
      });
      this.navigate({ stateName: stateNames.home.name, pars: ctx });
    }
  }

  blended.rootModule
    .directive('vyzva$lector$user', () => {
      return {
        scope: { student: '&student', ts: '&ts' },
        templateUrl: 'vyzva$lector$user.html'
      }
    })
    .directive('vyzva$lector$users', () => {
      return {
        scope: { students: '&students', ts: '&ts' },
        templateUrl: 'vyzva$lector$users.html'
      }
    })
  ;


}