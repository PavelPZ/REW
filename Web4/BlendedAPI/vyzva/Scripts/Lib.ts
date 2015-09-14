module vyzva {

  export function finishHomeDataNode(prod: IBlendedCourseRepository) {
    if (prod.pretest) return;
    var urlRoot = '/lm/blcourse/' + LMComLib.LineIds[prod.line].toLowerCase() + '/';
    var levels = _.map(['a1', 'a2', 'b1', 'b2'], lev => prod.find(urlRoot + lev + '/'));
    var clonedLessons = _.map(levels, lev => <any>(_.clone(lev.Items))); //pro kazdou level kopie napr. </lm/blcourse/english/a1/>.Items
    var firstEntryTests = _.map(clonedLessons, l => l.splice(0, 1)[0]); //z kopie vyndej prvni prvek (entry test) a dej jej do firstPretests;
    prod.pretest = <any>(prod.find(urlRoot + 'pretests/'));
    prod.entryTests = firstEntryTests;
    prod.lessons = clonedLessons;
  }

  export function breadcrumbBase(ctrl: blended.controller, homeOnly?: boolean): Array<blended.breadcrumbItem> {
    var res = [{ title: 'Moje Online jazykové kurzy a testy', url: '#' + Pager.getHomeUrl() }];
    if (!homeOnly) res.push({ title: ctrl.productParent.dataNode.title, url: ctrl.href(ctrl.getProductHomeUrl()/*{ stateName: stateNames.home.name, pars: ctrl.ctx }*/), active: false });
    return res;
  }

  //services, spolecne pro Vyzva aplikaci. Jsou dostupne v scope.appService
  export class appService {
    constructor(public controller: blended.controller) {
      this.home = <homeTaskController>(controller.productParent);
    }
    home: homeTaskController;

    schoolUserInfo(lmcomId: number): vyzva.intranet.IAlocatedKey {
      return this.home.intranetInfo.userInfo(lmcomId || this.controller.ctx.userDataId());
    }

    isLangmasterUser(): boolean {
      return _.indexOf(['pzika@langmaster.cz', 'rjeliga@langmaster.cz', 'zzikova@langmaster.cz','pjanecek@langmaster.cz'], LMStatus.Cookie.EMail) >= 0;
    }
  }

  //********** REPORTS

  //musi souhlasit s D:\LMCom\REW\Web4\BlendedAPI\vyzva\Server\ExcelReport.cs
  export enum reportType { managerKeys, lectorKeys, managerStudy, lectorStudy, finalReport }
  export interface requestPar {
    type: reportType;
    companyId: number;
    managerIncludeStudents?: boolean;
    //isStudyAll?: boolean;
    groupId?: number;
  }

  export function downloadExcelReport(par: requestPar) {
    var url = Pager.basicUrl + 'vyzva57services/reports' + "?" + $.param({ reportpar: JSON.stringify(par) });
    blended.downloadExcelFile(url.toLowerCase());
  }

  //********** FOOTER COPYRIGHT

  export class vyzva$common$whenproblem implements ng.IDirective {
    constructor($modal: angular.ui.bootstrap.IModalService) {
      this.link = (scope: IVyzva$common$whenproblemScope, el: JQuery, attrs) => {
        scope.copyrNavigateFaq = () => scope.ts.navigate({ stateName: stateNames.faq.name, pars: <any>{ returnurl: location.hash } });
        var modalInstance: angular.ui.bootstrap.IModalServiceInstance;
        scope.copyrShowWriteUs = () => {
          modalInstance = $modal.open({
            templateUrl: 'vyzva$common$writeus.html',
            scope: scope
          });
        };
        scope.copyrShowWriteUsOK = () => {

          //odvod user info
          var homeCtrl = <homeTaskController>((<blended.taskController>scope.ts).productParent);
          var info: intranet.alocatedKeyRoot = homeCtrl && homeCtrl.intranetInfo ? homeCtrl.intranetInfo : scope.ts['intranetInfo']; //intranetInfo drzi budto taskControl.productParent nebo managerSchool
          var userInfo = info ? info.userInfo(scope.ts.ctx.loginid) : null; //dej info o zalogovanem uzivateli

          var req: IWriteUs = {
            stateName: scope.ts.state.name, stateParsJson: JSON.stringify(scope.ts.$state.params), text: scope.copyrWriteUsText,
            userJson: JSON.stringify(userInfo), userEmail: userInfo.email, userFirstName: userInfo.firstName, userLastName: userInfo.lastName
          };
          proxies.vyzva57services.writeUs(JSON.stringify(req), $.noop);
          modalInstance.close();
        };
      };
    }
    link;
    templateUrl = 'vyzva$common$whenproblem.html';
  }
  interface IVyzva$common$whenproblemScope extends ng.IScope {
    ts: blended.controller;
    copyrNavigateFaq: () => void;
    copyrShowWriteUs: () => void;
    copyrShowWriteUsOK: () => void;
    copyrWriteUsText: string;
  }
  //D:\LMCom\REW\Web4\BlendedAPI\vyzva\Server\Vyzva57Services.cs
  interface IWriteUs {
    stateName: string;
    stateParsJson: string;
    userJson: string; //
    userEmail: string;
    userFirstName: string;
    userLastName: string;
    text: string;
  }

  blended.rootModule
    .directive('vyzva$common$whenproblem', ['$modal', $modal => new vyzva$common$whenproblem($modal)])
  ;
}