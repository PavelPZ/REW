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
            var _this = this;
            _super.call(this, state);
            this.breadcrumb = vyzva.breadcrumbBase(this);
            this.breadcrumb[1].active = true;
            var prUd = blended.getPersistData(this.parent.dataNode.pretest, this.ctx.taskid);
            this.learnPlan = [];
            var someActive = false;
            if (!prUd || !prUd.done)
                this.pretestStatus = IHomeNodeStatus.active;
            else {
                this.pretestStatus = IHomeNodeStatus.done;
                this.pretestLevel = prUd.targetLevel;
                this.learnPlan.push(this.fromNode(this.parent.dataNode.entryTests[prUd.targetLevel], 2));
                this.learnPlan.pushArray(_.map(this.parent.dataNode.lessons[prUd.targetLevel], function (nd, idx) { return _this.fromNode(nd, idx + 3); }));
            }
            _.each(this.learnPlan, function (pl) {
                if (blended.moduleIsDone(pl.node, _this.ctx.taskid))
                    pl.status = IHomeNodeStatus.done;
                else if (!someActive) {
                    someActive = true;
                    pl.status = IHomeNodeStatus.active;
                }
            });
        }
        homeViewController.prototype.fromNode = function (node, idx) { return { node: node, user: blended.getPersistData(node, this.ctx.taskid), task: this.parent, idx: idx }; };
        homeViewController.prototype.gotoLector = function (groupId) {
            this.navigate({ stateName: vyzva.stateNames.lectorHome.name, pars: { groupid: groupId } });
        };
        return homeViewController;
    })(blended.taskViewController);
    vyzva.homeViewController = homeViewController;
    (function (IHomeNodeStatus) {
        IHomeNodeStatus[IHomeNodeStatus["no"] = 0] = "no";
        IHomeNodeStatus[IHomeNodeStatus["done"] = 1] = "done";
        IHomeNodeStatus[IHomeNodeStatus["active"] = 2] = "active";
    })(vyzva.IHomeNodeStatus || (vyzva.IHomeNodeStatus = {}));
    var IHomeNodeStatus = vyzva.IHomeNodeStatus;
    blended.rootModule
        .filter('vyzva$home$nodeclass', function () {
        return function (id) {
            switch (id) {
                case IHomeNodeStatus.done: return "list-group-item-info";
                case IHomeNodeStatus.active: return "list-group-item-success";
                default: return "Angličtina";
            }
        };
    })
        .directive('vyzva$home$nodemarks', function () {
        return {
            scope: { status: '&status', index: '&index', api: '&api' },
            templateUrl: 'vyzva$home$nodemarks.html'
        };
    });
    //****************** TASK
    var homeTaskController = (function (_super) {
        __extends(homeTaskController, _super);
        function homeTaskController(state, resolves) {
            _super.call(this, state, resolves);
            this.user = blended.getPersistWrapper(this.dataNode, this.ctx.taskid, function () { return { startDate: Utils.nowToNum() }; });
            //Intranet
            this.companyData = (resolves[1]);
            if (!this.companyData)
                return;
            var alocatedKeyInfos = this.companyData.alocatedKeyInfos;
            this.lectorGroups = _.map(_.filter(alocatedKeyInfos, function (inf) { return inf.isLector; }), function (inf) { return inf.group; });
            var studentGroups = _.map(_.filter(alocatedKeyInfos, function (inf) { return inf.isLector || inf.isVisitor; }), function (inf) { return inf.group; });
            //this.studentGroup = studentGroups.length > 0 ? studentGroups[0] : null;
            this.isLector = !this.ctx.onbehalfof && this.lectorGroups.length > 0;
            this.isStudent = studentGroups.length > 0;
        }
        return homeTaskController;
    })(blended.homeTaskController);
    vyzva.homeTaskController = homeTaskController;
})(vyzva || (vyzva = {}));
