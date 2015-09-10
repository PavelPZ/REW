module vyzva {
  export class managerSchool extends blended.controller {
    constructor($scope: ng.IScope | blended.IStateService, $state: angular.ui.IStateService, intranetInfo: intranet.alocatedKeyRoot) {
      super($scope, $state);
      this.company = intranetInfo ? intranetInfo.companyData : null;
      this.breadcrumb = breadcrumbBase(this, true);
      this.breadcrumb.push({ title: this.title = 'Správa Studijních skupin a Učitelů', active: true });
      if (this.company) { this.wizzardStep = 2; return; }
      this.wizzardStep = 0;
      this.adjustWizzardButtons();
    }
    static $inject = ['$scope', '$state', '$intranetInfo'];

    //*************************************************************
    //                     CREATE SCHOOL
    //*************************************************************

    wizzardStep: number;
    nextTitle: string;
    groupNameCounter = 1;
    groups: Array<intranet.IStudyGroup> = [];

    addItem(line: LMComLib.LineIds, isPattern3: boolean) {
      var item: intranet.IStudyGroup = {
        groupId: managerSchool.groupIdCounter++,
        title: isPattern3 ? blended.lineIdToText(line) + ' pro učitele' : 'Pokročilí' + (this.groupNameCounter++).toString() + ' - 3.A (2015/2016)',
        line: line,
        num: isPattern3 ? 1 : 20,
        isPattern3: isPattern3
      };
      this.groups.splice(0, 0, item);
    } static groupIdCounter = 1;

    removeItem(idx: number) {
      this.groups.splice(idx, 1);
    }
    wizzardClick(isBack: boolean) {
      if (!isBack)
        switch (this.wizzardStep) {
          case 0: this.wizzardStep = 1; break;
          case 1:
            var req = intranet.lmAdminCreateLicenceKeys_request(this.groups);
            proxies.vyzva57services.lmAdminCreateLicenceKeys(this.ctx.companyid, req, resp => {
              this.company = intranet.lmAdminCreateLicenceKeys_reponse(this.groups, resp);
              /*pred zalozenim company nema sanci mit manager vice klicu. Ten jeden pridej mezi klice spravce*/
              var actualManagerKey = this.ctx.lickeys.split('#')[0];
              var cook = LMStatus.Cookie;
              this.company.managerKeys.push({ keyStr: actualManagerKey, email: cook.EMail, firstName: cook.FirstName, lastName: cook.LastName, lmcomId: cook.id });
              proxies.vyzva57services.lmAdminCreateCompany(this.ctx.companyid, JSON.stringify(this.company), () => {
                this.wizzardStep = 2;
                this.$scope.$apply();
              });
            });
            break;
        }
      else
        switch (this.wizzardStep) {
          case 1: this.wizzardStep = 0; break;
        }
      this.adjustWizzardButtons();
    }

    adjustWizzardButtons() {
      switch (this.wizzardStep) {
        case 0: this.nextTitle = 'Potvrzení údajů'; break;
        case 1: this.nextTitle = 'Údaje v pořádku'; break;
      }
    }

    lineToFlagClass(id) {
      switch (id) {
        case LMComLib.LineIds.English: return "flag-small-english";
        case LMComLib.LineIds.German: return "flag-small-german";
        case LMComLib.LineIds.French: return "flag-small-french";
        default: return "???";
      }
    }

    disabled(line: LMComLib.LineIds) { return _.any(this.groups, g => g.line == line && g.isPattern3); }

    debugDeletCompany() {
      proxies.vyzva57services.writeCompanyData(this.ctx.companyid, null, $.noop);
    }

    //*************************************************************
    //                     CREATED
    //*************************************************************

    company: intranet.ICompanyData;

  }

  blended.rootModule
    .filter('vyzva$managerschool$sablonaid', () => {
      return (id: boolean) => id ? "Učitelé (č.3)" : "Studenti (č.4)"
    })
    .directive('vyzva$managerschool$usekey', () => {
      return {
        scope: { item: '&item' },
        templateUrl: 'vyzva$managerschool$usekey.html'
      }
    })
    .directive('vyzva$managerchool$usekeys', () => {
      return {
        scope: { items: '&items', for: '&for'},
        templateUrl: 'vyzva$managerchool$usekeys.html'
      }
    })
  ;

}


//class managerSchool_usedKey {
//  constructor($scope) {
//    debugger;
//  }
//}



