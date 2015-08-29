module vyzva {

  export function finishHomeDataNode(prod: IBlendedCourseRepository) {
    if (prod.pretest) return;
    var clonedLessons = _.map(_.range(0, 4), idx => <any>(_.clone(prod.Items[idx].Items))); //pro kazdou level kopie napr. </lm/blcourse/english/a1/>.Items
    var firstEntryTests = _.map(clonedLessons, l => l.splice(0, 1)[0]); //z kopie vyndej prvni prvek (entry test) a dej jej do firstPretests;
    prod.pretest = <any>(prod.find('/lm/blcourse/' + LMComLib.LineIds[prod.line].toLowerCase() + '/pretests/'));
    prod.entryTests = firstEntryTests;
    prod.lessons = clonedLessons;
    //_.each(<any>(prod.pretest.Items), (it: CourseMeta.data) => {
    //  if (it.other) $.extend(it, JSON.parse(it.other));
    //});
  }

  export function breadcrumbBase(ctrl: blended.controller, homeOnly?:boolean): Array<blended.breadcrumbItem> {
    var res = [ { title: 'Moje Online jazykové kurzy a testy', url: '#' + Pager.getHomeUrl() } ];
    if (!homeOnly) res.push({ title: ctrl.taskRoot().dataNode.title, url: ctrl.href({ stateName: stateNames.home.name, pars: ctrl.ctx }), active: false });
    return res;
  }

}