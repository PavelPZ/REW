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
            var pretestItem;
            var fromNode = function (node, idx) {
                var res = {
                    node: node,
                    user: null,
                    homeTask: _this.parent,
                    idx: idx,
                    lessonType: idx == 0 ? IHomeLessonType.pretest : (node.url.indexOf('/test') > 0 ? IHomeLessonType.test : IHomeLessonType.lesson),
                };
                if (idx == 0) { }
                else { }
                res.status = !res.user ? IHomeLessonStatus.no : ((res.user).done ? IHomeLessonStatus.done : IHomeLessonStatus.entered);
                return res;
            };
            this.learnPlan = [pretestItem = fromNode(this.parent.dataNode.pretest, 0)];
            var pretestUser = (pretestItem.user);
            if (pretestUser && pretestUser.done) {
                this.pretestLevels = pretestUser.history;
                pretestItem.status = IHomeLessonStatus.done;
                this.pretestLevel = pretestUser.targetLevel;
                this.learnPlan.push(fromNode(this.parent.dataNode.entryTests[this.pretestLevel], 1));
                this.learnPlan.pushArray(_.map(this.parent.dataNode.lessons[this.pretestLevel], function (nd, idx) { return fromNode(nd, idx + 2); }));
            }
            //prvni nehotovy node je aktivni
            _.find(this.learnPlan, function (pl) {
                if (pl.status == IHomeLessonStatus.done)
                    return false;
                pl.active = true;
                return true;
            });
        }
        homeViewController.prototype.navigateLesson = function (lesson) {
            var _this = this;
            var service = {
                params: lesson.lessonType == IHomeLessonType.pretest ?
                    blended.cloneAndModifyContext(this.ctx, function (d) { return d.pretesturl = blended.encodeUrl(_this.parent.dataNode.pretest.url); }) :
                    blended.cloneAndModifyContext(this.ctx, function (d) { return d.moduleurl = blended.encodeUrl(lesson.node.url); }),
                current: lesson.lessonType == IHomeLessonType.pretest ?
                    vyzva.stateNames.pretestTask :
                    (lesson.lessonType == IHomeLessonType.test ? vyzva.stateNames.moduleTestTask : vyzva.stateNames.moduleLessonTask),
                parent: this.parent,
                createMode: blended.createControllerModes.adjustChild
            };
            this.parent.child = lesson.lessonType == IHomeLessonType.pretest ?
                new blended.pretestTaskController(service) :
                new vyzva.moduleTaskController(service);
            var url = this.parent.child.goCurrent();
            this.navigate(url);
        };
        ;
        homeViewController.prototype.navigatePretestLevel = function (lev) {
            var _this = this;
            var service = {
                params: blended.cloneAndModifyContext(this.ctx, function (d) { var mod = _this.parent.dataNode.pretest.Items[lev]; d.moduleurl = blended.encodeUrl(mod.url); }),
                current: vyzva.stateNames.pretestPreview,
                parent: this.parent,
                createMode: blended.createControllerModes.adjustChild
            };
            this.parent.child = new vyzva.moduleTaskController(service);
            var url = this.parent.child.goCurrent();
            this.navigate(url);
        };
        homeViewController.prototype.gotoLector = function (groupId) {
            this.navigate({ stateName: vyzva.stateNames.lectorHome.name, pars: { groupid: groupId } });
        };
        homeViewController.prototype.debugClearProduct = function () {
            proxies.vyzva57services.debugClearProduct(this.ctx.companyid, this.ctx.onbehalfof || this.ctx.loginid, this.ctx.productUrl, function () { return location.reload(); });
        };
        return homeViewController;
    })(blended.taskViewController);
    vyzva.homeViewController = homeViewController;
    (function (IHomeLessonStatus) {
        IHomeLessonStatus[IHomeLessonStatus["no"] = 0] = "no";
        IHomeLessonStatus[IHomeLessonStatus["entered"] = 1] = "entered";
        IHomeLessonStatus[IHomeLessonStatus["done"] = 2] = "done";
    })(vyzva.IHomeLessonStatus || (vyzva.IHomeLessonStatus = {}));
    var IHomeLessonStatus = vyzva.IHomeLessonStatus;
    (function (IHomeLessonType) {
        IHomeLessonType[IHomeLessonType["pretest"] = 0] = "pretest";
        IHomeLessonType[IHomeLessonType["lesson"] = 1] = "lesson";
        IHomeLessonType[IHomeLessonType["test"] = 2] = "test";
    })(vyzva.IHomeLessonType || (vyzva.IHomeLessonType = {}));
    var IHomeLessonType = vyzva.IHomeLessonType;
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
    blended.rootModule
        .filter('vyzva$home$nodeclass', function () {
        return function (lesson) {
            if (lesson.active)
                return "list-group-item-success";
            switch (lesson.status) {
                case IHomeLessonStatus.done: return "list-group-item-info";
                default: return "";
            }
        };
    })
        .filter('vyzva$home$iconclass', function () {
        return function (lesson) {
            if (lesson.active)
                return "fa-hand-o-right";
            switch (lesson.status) {
                case IHomeLessonStatus.done: return "fa-check";
                default: return "";
            }
        };
    });
})(vyzva || (vyzva = {}));
