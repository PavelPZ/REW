module vyzva {
  export class managerLangmaster extends blended.controller {
    constructor($scope: ng.IScope | blended.IStateService, $state: angular.ui.IStateService, public intranetInfo: intranet.alocatedKeyRoot) {
      super($scope, $state);
    }
    //************************* NEW
    schoolTitle: string; //vstupni dato: titulek skoly
    key: string; //vystupni dato 1: ostry klic pro spravce skoly
    sablona4 = 1;
    sablona3 = 0;
    sum4(): string { return this.priceToString(this.sablona4 * 18490); }
    sum3(): string { return this.priceToString(this.sablona3 * 3499); }
    sum(): string { return this.priceToString(this.sablona4 * 18490 + this.sablona3 * 3499); }
    sum4NoDPH(): string { return this.priceToString(this.sablona4 * 15281); }
    sum3NoDPH(): string { return this.priceToString(this.sablona3 * 2892); }
    sumNoDPH(): string { return this.priceToString(this.sablona4 * 15281 + this.sablona3 * 2892); }
    priceToString(price: number): string {
      var s = price.toString(); return s.substr(0, s.length - 3) + ' ' + s.substr(s.length - 3);
    }
    url(): string {
      var host = location.href.split('/')[2];
      return 'http://' + host + (host == 'localhost' ? '/Web4/Schools/NewEA.aspx?lang=cs-cz' : '/schools/index_cs_cz.html');
    }
    encodetitle(): string { return this.url() + '#/vyzvademo?companytitle=' + encodeURIComponent(this.schoolTitle); }
    vyzvaProvoz(): string { return this.url() + '#/vyzvaprovoz?companytitle=' + encodeURIComponent('"' + this.schoolTitle + '"'); }
    exportLectorInfoToXml() {
      blended.downloadExcelFile(Pager.basicUrl + 'vyzva57services/lmlectorexportinfotoxml');
      //downloadExcelReport({ type: reportType.managerStudy, companyId: this.ctx.companyid });
      // invoke('vyzva57services/lmlectorexportinfotoxml', 'get', null, null, completed);
      //proxies.vyzva57services.lmLectorExportInfoToXml($.noop);
    }
    //encodetitle(): string { return 'http://' + location.href.split('/')[2] + '/schools/index_cs_cz.html#/vyzvademo?companytitle=' + encodeURIComponent(this.schoolTitle); }
    //encodetitle(): string { return 'http://localhost/Web4/Schools/NewEA.aspx?lang=cs-cz#/vyzvademo?companytitle=' + encodeURIComponent(this.schoolTitle); }
    //vyzvaProvoz(): string { return 'http://' + location.href.split('/')[2] + '/schools/index_cs_cz.html#/vyzvaprovoz?companytitle=' + encodeURIComponent('"' + this.schoolTitle + '"'); }
    //vyzvaProvoz(): string { return 'http://localhost/Web4/Schools/NewEA.aspx?lang=cs-cz#/vyzvaprovoz?companytitle=' + encodeURIComponent('"' + this.schoolTitle + '"'); }
    gotoLicKey() {
      this.navigate({ stateName: 'vyzvademo', pars: <any>{ key: this.licKeyForGoto } });
    }
    licKeyForGoto: string;

    //************************* OLD
    uniqueId: string; //vstupni dato2: rozliseni emailu pro seznam demouctu
    allUsers: IDemoItem[] = []; //vystupni dato 2: seznam demouctu 
    //ostry klic pro spravce skoly
    createEmptySchool() {
      proxies.vyzva57services.createEmptyCompany(this.schoolTitle, emptyResult => {
        this.key = keys.toString({ licId: emptyResult.licId, counter: emptyResult.licCounter });
        this.$scope.$apply();
      });
    }
    //seznam demouctu 
    //createSchool() {
    //  proxies.vyzva57services.createDemoCompanyStart(this.schoolTitle, this.uniqueId, newDataResult => { //zalozeni company a vsech licencni v NewData
    //    managerSchool.createCompany(newDataResult.companyId, managerLangmaster.groups, null, newComp => { //simulace zalozeni studijnich skupin managerem
    //      proxies.vyzva57services.loadCompanyData(newDataResult.fromCompanyId, str => { //nacteni vzorove company

    //        //funkce na doplneni klicu vytvorenych na serveru (createDemoCompanyStart) do nove company
    //        var fillCompUserData = (id: string, role: string, key: IDemoItem) => {
    //          var userData = _.find(newDataResult.users, u => Utils.startsWith(u.email, id + '.')); if (!userData) return;
    //          key.keyStr = keys.toString({ licId: userData.licId, counter: userData.licCounter });
    //          key.firstName = userData.firstName; key.lastName = userData.lastName; key.email = userData.email; key.lmcomId = userData.lmcomId;
    //          key.role = role;
    //          return key;
    //        };
    //        //4 pouziti studenti v new Company
    //        var newUsers: IDemoItem[] = [null, null, null, null];

    //        var allUsers: intranet.IAlocatedKey[] = [];
    //        //dopln klice a osobnich udaju do new company
    //        this.allUsers.push(fillCompUserData('spravce', 'Správce', <IDemoItem>newComp.managerKeys[0]));
    //        this.allUsers.push(fillCompUserData('ucitel1', 'Učitele, možnost 1', <IDemoItem>newComp.studyGroups[0].lectorKeys[0]));
    //        this.allUsers.push(fillCompUserData('ucitel2', 'Učitele, možnost 2', <IDemoItem>newComp.studyGroups[1].lectorKeys[0]));
    //        this.allUsers.push(fillCompUserData('student1', 'Studenta, možnost 1', newUsers[0] = <IDemoItem>newComp.studyGroups[0].studentKeys[0]));
    //        this.allUsers.push(fillCompUserData('student2', 'Studenta, možnost 2', newUsers[1] = <IDemoItem>newComp.studyGroups[0].studentKeys[1]));
    //        this.allUsers.push(fillCompUserData('student3', 'Studenta, možnost 3', newUsers[2] = <IDemoItem>newComp.studyGroups[1].studentKeys[0]));
    //        this.allUsers.push(fillCompUserData('student4', 'Studenta, možnost 4', newUsers[3] = <IDemoItem>newComp.studyGroups[1].studentKeys[1]));
    //        this.$scope.$apply();

    //        //najdi 4 pouzite studenty v zdrojove company
    //        var srcComp = <intranet.ICompanyData>(JSON.parse(str));
    //        var srcUsers = _.filter(srcComp.studyGroups[0].studentKeys.slice(0).pushArray(srcComp.studyGroups[1].studentKeys.slice(0)), k => k.lmcomId > 0);

    //        //sparovani zdrojovych a novych lmcomid kvuli kopii CourseData
    //        var srcToNewLMComIds = _.map(_.zip(srcUsers, newUsers), arr => {
    //          var srcKey: intranet.IAlocatedKey = arr[0]; if (!srcKey) return null;
    //          var newKey: intranet.IAlocatedKey = arr[1];
    //          return { fromLmcomId: srcKey.lmcomId, toLmLmcomId: newKey.lmcomId };
    //        });
    //        srcToNewLMComIds = _.filter(srcToNewLMComIds, ids => !!ids);

    //        //save nove company
    //        proxies.vyzva57services.writeCompanyData(newDataResult.companyId, JSON.stringify(newComp), () => {
    //          proxies.vyzva57services.createDemoCompanyEnd({
    //            fromCompanyId: newDataResult.fromCompanyId,
    //            toCompanyId: newDataResult.companyId,
    //            users: srcToNewLMComIds,
    //          }, () => {
    //          });
    //        });

    //      });
    //    });
    //  });
    //}

    //static ids = [ "spravce", "ucitel1", "ucitel2", "student1", "student2", "student3", "student4" ];
    //static srcCompanyId = 1;
    static groups: Array<intranet.IStudyGroup> = [
      {
        "groupId": 2,
        "title": "Třída 3.A",
        "line": LMComLib.LineIds.English,
        "num": "20",
        "isPattern3": false
      },
      {
        "groupId": 1,
        "title": "Třída 2.B",
        "line": LMComLib.LineIds.English,
        "num": "20",
        "isPattern3": false
      }
    ];
  }
  interface IDemoItem extends intranet.IAlocatedKey {
    role: string;
  }

}
