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
    }
    vyzva.finishHomeDataNode = finishHomeDataNode;
    function breadcrumbBase(ctrl, homeOnly) {
        var res = [{ title: 'Moje Online jazykové kurzy a testy', url: '#' + Pager.getHomeUrl() }];
        if (!homeOnly)
            res.push({ title: ctrl.productParent.dataNode.title, url: ctrl.href(ctrl.getProductHomeUrl() /*{ stateName: stateNames.home.name, pars: ctrl.ctx }*/), active: false });
        return res;
    }
    vyzva.breadcrumbBase = breadcrumbBase;
})(vyzva || (vyzva = {}));
