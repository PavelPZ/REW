var vyzva;
(function (vyzva) {
    function finishHomeDataNode(prod) {
        if (prod.pretest)
            return;
        var urlRoot = '/lm/blcourse/' + LMComLib.LineIds[prod.line].toLowerCase() + '/';
        var levels = _.map(['a1', 'a2', 'b1', 'b2'], function (lev) { return prod.find(urlRoot + lev + '/'); });
        var clonedLessons = _.map(levels, function (lev) { return (_.clone(lev.Items)); }); //pro kazdou level kopie napr. </lm/blcourse/english/a1/>.Items
        var firstEntryTests = _.map(clonedLessons, function (l) { return l.splice(0, 1)[0]; }); //z kopie vyndej prvni prvek (entry test) a dej jej do firstPretests;
        prod.pretest = (prod.find(urlRoot + 'pretests/'));
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
    //services, spolecne pro Vyzva aplikaci. Jsou dostupne v scope.appService
    var appService = (function () {
        function appService(controller) {
            this.controller = controller;
            this.home = (controller.productParent);
        }
        appService.prototype.schoolUserInfo = function (lmcomId) {
            return this.home.intranetInfo.userInfo(lmcomId || this.controller.ctx.userDataId());
        };
        return appService;
    })();
    vyzva.appService = appService;
    //musi souhlasit s D:\LMCom\REW\Web4\BlendedAPI\vyzva\Server\ExcelReport.cs
    (function (reportType) {
        reportType[reportType["managerKeys"] = 0] = "managerKeys";
        reportType[reportType["lectorKeys"] = 1] = "lectorKeys";
        reportType[reportType["managerStudy"] = 2] = "managerStudy";
        reportType[reportType["lectorStudy"] = 3] = "lectorStudy";
        reportType[reportType["finalReport"] = 4] = "finalReport";
    })(vyzva.reportType || (vyzva.reportType = {}));
    var reportType = vyzva.reportType;
    function downloadExcelReport(par) {
        var url = Pager.basicUrl + 'vyzva57services/reports' + "?" + $.param({ reportpar: JSON.stringify(par) });
        blended.downloadExcelFile(url.toLowerCase());
    }
    vyzva.downloadExcelReport = downloadExcelReport;
})(vyzva || (vyzva = {}));
