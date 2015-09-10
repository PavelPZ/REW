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

  }

}