var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var vyzva;
(function (vyzva) {
    (function (homeLessonStates) {
        homeLessonStates[homeLessonStates["no"] = 0] = "no";
        homeLessonStates[homeLessonStates["entered"] = 1] = "entered";
        homeLessonStates[homeLessonStates["done"] = 2] = "done";
    })(vyzva.homeLessonStates || (vyzva.homeLessonStates = {}));
    var homeLessonStates = vyzva.homeLessonStates;
    (function (homeLessonTypes) {
        homeLessonTypes[homeLessonTypes["pretest"] = 0] = "pretest";
        homeLessonTypes[homeLessonTypes["lesson"] = 1] = "lesson";
        homeLessonTypes[homeLessonTypes["test"] = 2] = "test";
    })(vyzva.homeLessonTypes || (vyzva.homeLessonTypes = {}));
    var homeLessonTypes = vyzva.homeLessonTypes;
    (function (rightButtonTypes) {
        rightButtonTypes[rightButtonTypes["no"] = 0] = "no";
        rightButtonTypes[rightButtonTypes["run"] = 1] = "run";
        rightButtonTypes[rightButtonTypes["preview"] = 2] = "preview";
    })(vyzva.rightButtonTypes || (vyzva.rightButtonTypes = {}));
    var rightButtonTypes = vyzva.rightButtonTypes;
    //****************** VIEW
    var homeViewController = (function (_super) {
        __extends(homeViewController, _super);
        function homeViewController($scope, $state) {
            var _this = this;
            _super.call(this, $scope, $state);
            //constructor(state: blended.IStateService) {
            //super(state);
            this.breadcrumb = vyzva.breadcrumbBase(this);
            this.breadcrumb[1].active = true;
            var pretestItem;
            var pretestUser;
            var firstNotDoneCheckTestIdx; //index prvnio nehotoveho kontrolniho testu
            var fromNode = function (node, idx) {
                var res = {
                    node: node,
                    user: null,
                    homeTask: _this.myTask,
                    idx: idx,
                    lessonType: idx == 0 ? homeLessonTypes.pretest : (node.url.indexOf('/test') > 0 ? homeLessonTypes.test : homeLessonTypes.lesson),
                };
                var nodeUser = blended.getPersistData(_this.myTask.dataNode.pretest, _this.ctx.taskid);
                if (idx == 0) {
                    pretestUser = nodeUser;
                    res.user = { done: pretestUser ? pretestUser.done : false };
                }
                else
                    res.user = nodeUser ? blended.agregateShortFromNodes(res.node, _this.ctx.taskid, false) : null;
                res.status = !res.user ? homeLessonStates.no : (res.user.done ? homeLessonStates.done : homeLessonStates.entered);
                //rightButtonType management: vsechny nehotove dej RUN a ev. nastav index prvniho nehotoveho check testu
                if (res.lessonType != homeLessonTypes.pretest)
                    res.rightButtonType = res.status == homeLessonStates.done ? rightButtonTypes.preview : rightButtonTypes.run;
                if (!firstNotDoneCheckTestIdx && res.lessonType == homeLessonTypes.test && res.status != homeLessonStates.done)
                    firstNotDoneCheckTestIdx = idx;
                return res;
            };
            this.learnPlan = [pretestItem = fromNode(this.myTask.dataNode.pretest, 0)];
            if (pretestUser && pretestUser.done) {
                this.pretestLevels = pretestUser.history;
                this.pretestLevel = pretestUser.targetLevel;
                this.learnPlan.push(fromNode(this.myTask.dataNode.entryTests[this.pretestLevel], 1));
                this.learnPlan.pushArray(_.map(this.myTask.dataNode.lessons[this.pretestLevel], function (nd, idx) { return fromNode(nd, idx + 2); }));
            }
            //rightButtonType management: vsechna cviceni za firstNotDoneCheckTestIdx dej rightButtonTypes=no
            for (var i = firstNotDoneCheckTestIdx + 1; i < this.learnPlan.length; i++)
                this.learnPlan[i].rightButtonType = rightButtonTypes.no;
            //prvni nehotovy node je aktivni
            _.find(this.learnPlan, function (pl) {
                if (pl.status == homeLessonStates.done)
                    return false;
                pl.active = true;
                return true;
            });
        }
        homeViewController.prototype.navigateLesson = function (lesson) {
            var _this = this;
            var service = {
                params: lesson.lessonType == homeLessonTypes.pretest ?
                    blended.cloneAndModifyContext(this.ctx, function (d) { return d.pretesturl = blended.encodeUrl(_this.myTask.dataNode.pretest.url); }) :
                    blended.cloneAndModifyContext(this.ctx, function (d) { return d.moduleurl = blended.encodeUrl(lesson.node.url); }),
                current: lesson.lessonType == homeLessonTypes.pretest ?
                    vyzva.stateNames.pretestTask :
                    (lesson.lessonType == homeLessonTypes.test ? vyzva.stateNames.moduleTestTask : vyzva.stateNames.moduleLessonTask),
                parent: this.myTask,
            };
            var nextTask = lesson.lessonType == homeLessonTypes.pretest ?
                new blended.pretestTaskController(service) :
                new vyzva.moduleTaskController(service);
            var url = nextTask.goCurrent();
            this.navigate(url);
            //this.myTask.child = lesson.lessonType == homeLessonTypes.pretest ?
            //  new blended.pretestTaskController(service) :
            //  new moduleTaskController(service);
            //var url = this.myTask.child.goCurrent();
        };
        ;
        homeViewController.prototype.navigatePretestLevel = function (lev) {
            var _this = this;
            var service = {
                params: blended.cloneAndModifyContext(this.ctx, function (d) { var mod = _this.myTask.dataNode.pretest.Items[lev]; d.moduleurl = blended.encodeUrl(mod.url); }),
                current: vyzva.stateNames.pretestPreview,
                parent: this.myTask,
            };
            var nextTask = new vyzva.moduleTaskController(service);
            var url = nextTask.goCurrent();
            this.navigate(url);
            //this.myTask.child = new moduleTaskController(service);
            //var url = this.myTask.child.goCurrent();
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
    //****************** TASK
    var homeTaskController = (function (_super) {
        __extends(homeTaskController, _super);
        function homeTaskController($scope, $state, product, intranetInfo) {
            _super.call(this, $scope, $state, product);
            //constructor(state: blended.IStateService, resolves: Array<any>) {
            //  super(state, resolves);
            this.productParent = this;
            this.user = blended.getPersistWrapper(this.dataNode, this.ctx.taskid, function () { return { startDate: Utils.nowToNum() }; });
            //Intranet
            this.companyData = intranetInfo;
            if (!this.companyData)
                return;
            var alocatedKeyInfos = this.companyData.alocatedKeyInfos;
            this.lectorGroups = _.map(_.filter(alocatedKeyInfos, function (inf) { return inf.isLector; }), function (inf) { return inf.group; });
            var studentGroups = _.map(_.filter(alocatedKeyInfos, function (inf) { return inf.isLector || inf.isVisitor; }), function (inf) { return inf.group; });
            //this.studentGroup = studentGroups.length > 0 ? studentGroups[0] : null;
            this.isLector = !this.ctx.onbehalfof && this.lectorGroups.length > 0;
            this.isStudent = studentGroups.length > 0;
        }
        homeTaskController.$inject = ['$scope', '$state', '$loadedProduct', '$intranetInfo'];
        return homeTaskController;
    })(blended.homeTaskController);
    vyzva.homeTaskController = homeTaskController;
    blended.rootModule
        .filter('vyzva$home$nodeclass', function () {
        return function (lesson) {
            if (lesson.active && lesson.lessonType != homeLessonTypes.pretest)
                return "list-group-item-success-primary";
            else if (lesson.status == homeLessonStates.done || (lesson.active && lesson.lessonType == homeLessonTypes.pretest))
                return "list-group-item-success";
        };
    })
        .filter('vyzva$home$doneicon', function () {
        return function (lesson) {
            if (lesson.active)
                return "fa-hand-o-right";
            switch (lesson.status) {
                case homeLessonStates.done: return "fa-check";
                default: return "";
            }
        };
    });
})(vyzva || (vyzva = {}));
