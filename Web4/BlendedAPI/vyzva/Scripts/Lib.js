var vyzva;
(function (vyzva) {
    //export enum pageTitlePlace {
    //  header, page, none
    //}
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
    function breadcrumbBase(ctrl, homeOnly) {
        var res = [{ title: 'Moje Online jazykové kurzy a testy', url: '#' + Pager.getHomeUrl() }];
        if (!homeOnly)
            res.push({ title: ctrl.productParent.dataNode.title, url: ctrl.href({ stateName: vyzva.stateNames.home.name, pars: ctrl.ctx }), active: false });
        return res;
    }
    vyzva.breadcrumbBase = breadcrumbBase;
    var globalApi = (function () {
        function globalApi($scope, $state, ctx) {
            this.$scope = $scope;
            this.$state = $state;
            this.ctx = ctx;
        }
        globalApi.prototype.navigateWebHome = function () { Pager.gotoHomeUrl(); };
        globalApi.prototype.navigateReturnUrl = function () { location.href = this.ctx.returnurl; };
        globalApi.prototype.navigate = function (stateName, pars) {
            var _this = this;
            setTimeout(function () { return _this.$state.go(stateName, pars); }, 1);
        };
        return globalApi;
    })();
    vyzva.globalApi = globalApi;
    blended.globalApi = globalApi;
})(vyzva || (vyzva = {}));
