module vyzva {
  export class managerSchool extends blended.controller {
    constructor(state: blended.IStateService, resolves: Array<any>) {
      super(state);
      //this.taskRoot<homeTaskController>().companyData;
      var intranetInfo = <intranet.IAlocatedKeyRoot>resolves[0];
      this.company = intranetInfo ? intranetInfo.companyData : null;
      this.breadcrumb = breadcrumbBase(this, true);
      this.breadcrumb.push({ title: this.title = 'Studijní skupiny a licenční klíče', active: true });
      if (this.company) { this.wizzardStep = 2; return; }
      this.wizzardStep = 0;
      this.adjustWizzardButtons();
    }

    //*************************************************************
    //                     CREATE SCHOOL
    //*************************************************************

    wizzardStep: number;
    nextTitle: string;
    groupNameCounter = 0;
    groups: Array<intranet.IStudyGroup> = [];

    addItem(line: LMComLib.LineIds, isPattern3: boolean) {
      this.groups.push({ groupId: managerSchool.groupIdCounter++, title: 'Skupina ' + (this.groupNameCounter++).toString(), line: line, num: isPattern3 ? 1 : 20, isPattern3: isPattern3 });
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
        case 0: this.nextTitle = 'Další'; break;
        case 1: this.nextTitle = 'Založ školu'; break;
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
      return (id: boolean) => id ? "Šablona č.3" : "Šablona č.4"
    })
    .directive('vyzva$managerschool$usekey', () => {
      return {
        scope: { item: '&item', },
        templateUrl: 'vyzva$managerschool$usekey.html'
      }
    })
    .directive('vyzva$managerchool$usekeys', () => {
      return {
        scope: { items: '&items', },
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



