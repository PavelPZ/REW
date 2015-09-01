var vyzva;
(function (vyzva) {
    blended.rootModule
        .directive('vyzva$home$pretest', function () { return new homePretest(); });
    var homePretest = (function () {
        function homePretest() {
            this.link = function (scope, el) {
                //scope = { ts: '&ts' }; dole znamena, ze v parametr TS direktivy ae chape jako readonly odkaz na homeTaskController
                var ts = (scope.ts());
                var prUd = blended.getPersistData(ts.dataNode.pretest, ts.ctx.taskid);
                scope.run = function () {
                    ts.child = new blended.pretestTaskController({
                        params: blended.cloneAndModifyContext(ts.ctx, function (d) { return d.pretesturl = blended.encodeUrl(ts.dataNode.pretest.url); }),
                        current: vyzva.stateNames.pretestTask,
                        parent: ts,
                        createMode: blended.createControllerModes.adjustChild
                    });
                    var url = ts.child.goCurrent();
                    ts.navigate(url);
                };
                scope.canRun = !prUd || !prUd.done;
                scope.btnTitle = !prUd ? 'Začněte spuštěním Rozřazovacího testu' : 'Dokončete Rozřazovací test';
                scope.targetLevel = prUd ? prUd.targetLevel : -1;
                scope.previewUrl = vyzva.stateNames.pretest.name;
            };
            this.templateUrl = blended.baseUrlRelToRoot + '/blendedapi/vyzva/views/home/pretestItem.html';
            this.scope = { ts: '&ts', api: '&api' };
        }
        return homePretest;
    })();
    vyzva.homePretest = homePretest;
})(vyzva || (vyzva = {}));
