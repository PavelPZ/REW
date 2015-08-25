var vyzva;
(function (vyzva) {
    function finishHomeDataNode(prod) {
        if (prod.pretest)
            return;
        var clonedLessons = _.map(_.range(0, 4), function (idx) { return (_.clone(prod.Items[idx].Items)); }); //pro kazdou level kopie napr. </lm/blcourse/english/a1/>.Items
        var firstEntryTests = _.map(clonedLessons, function (l) { return l.splice(0, 1)[0]; }); //z kopie vyndej prvni prvek (entry test) a dej jej do firstPretests;
        prod.pretest = (prod.find('/lm/blcourse/' + LMComLib.LineIds[prod.line].toLowerCase() + '/pretests/'));
        prod.entryTests = firstEntryTests;
        prod.lessons = clonedLessons;
        //_.each(<any>(prod.pretest.Items), (it: CourseMeta.data) => {
        //  if (it.other) $.extend(it, JSON.parse(it.other));
        //});
    }
    vyzva.finishHomeDataNode = finishHomeDataNode;
    function breadcrumbBase(task) {
        return [
            { title: 'Moje Online jazykové kurzy a testy', url: '#' + Pager.getHomeUrl() },
            { title: task.product.title, url: task.href(vyzva.stateNames.home.name), active: false }
        ];
    }
    vyzva.breadcrumbBase = breadcrumbBase;
})(vyzva || (vyzva = {}));
