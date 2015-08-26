var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var vyzva;
(function (vyzva) {
    //****************** VIEW
    var homeViewController = (function (_super) {
        __extends(homeViewController, _super);
        function homeViewController(state) {
            _super.call(this, state);
            this.breadcrumb = vyzva.breadcrumbBase(this);
            this.breadcrumb[1].active = true;
            this.prt = this.parent.getPretestItemModel();
        }
        return homeViewController;
    })(blended.taskViewController);
    vyzva.homeViewController = homeViewController;
    //****************** TASK
    var homeTaskController = (function (_super) {
        __extends(homeTaskController, _super);
        function homeTaskController(state, resolves) {
            _super.call(this, state, resolves);
            this.user = blended.getPersistWrapper(this.dataNode, this.ctx.taskid, function () { return { startDate: Utils.nowToNum() }; });
        }
        //********** PRETEST item
        homeTaskController.prototype.getPretestItemModel = function () {
            var _this = this;
            var prUd = blended.getPersistData(this.dataNode.pretest, this.ctx.taskid);
            return {
                run: function () {
                    _this.child = new blended.pretestTaskController({
                        params: blended.cloneAndModifyContext(_this.ctx, function (d) { return d.pretesturl = blended.encodeUrl(_this.dataNode.pretest.url); }),
                        current: vyzva.stateNames.pretestTask,
                        parent: _this,
                        createMode: blended.createControllerModes.adjustChild
                    });
                    var url = _this.child.goCurrent();
                    _this.navigate(url);
                },
                canRun: !prUd || !prUd.done,
                btnTitle: !prUd ? 'Začněte spuštěním Rozřazovacího testu' : 'Dokončete Rozřazovací test',
                resultLevel: prUd && prUd.done ? blended.levelIds[prUd.targetLevel] : '',
                previewUrl: vyzva.stateNames.pretest.name,
            };
        };
        return homeTaskController;
    })(blended.homeTaskController);
    vyzva.homeTaskController = homeTaskController;
})(vyzva || (vyzva = {}));
