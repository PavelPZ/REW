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
    (function (rightButtonTypes) {
        rightButtonTypes[rightButtonTypes["no"] = 0] = "no";
        rightButtonTypes[rightButtonTypes["run"] = 1] = "run";
        rightButtonTypes[rightButtonTypes["preview"] = 2] = "preview";
    })(vyzva.rightButtonTypes || (vyzva.rightButtonTypes = {}));
    var rightButtonTypes = vyzva.rightButtonTypes;
    (function (leftMarkTypes) {
        leftMarkTypes[leftMarkTypes["no"] = 0] = "no";
        leftMarkTypes[leftMarkTypes["active"] = 1] = "active";
        leftMarkTypes[leftMarkTypes["pretestLevel"] = 2] = "pretestLevel";
        leftMarkTypes[leftMarkTypes["progress"] = 3] = "progress";
        leftMarkTypes[leftMarkTypes["waitForEvaluation"] = 4] = "waitForEvaluation";
    })(vyzva.leftMarkTypes || (vyzva.leftMarkTypes = {}));
    var leftMarkTypes = vyzva.leftMarkTypes;
    //****************** VIEW
    var homeLesson = (function (_super) {
        __extends(homeLesson, _super);
        function homeLesson() {
            _super.apply(this, arguments);
        }
        return homeLesson;
    })(blended.moduleServiceLow);
    vyzva.homeLesson = homeLesson;
    var homeViewController = (function (_super) {
        __extends(homeViewController, _super);
        function homeViewController($scope, $state) {
            var _this = this;
            _super.call(this, $scope, $state);
            this.breadcrumb = vyzva.breadcrumbBase(this);
            this.breadcrumb[1].active = true;
            var pretestItem;
            var pretestUser;
            var firstNotDoneCheckTestIdx; //index prvnio nehotoveho kontrolniho testu
            var fromNode = function (node, idx) {
                var res = new homeLesson(node, idx == 0 ? blended.moduleServiceType.pretest : (node.url.indexOf('/test') > 0 ? blended.moduleServiceType.test : blended.moduleServiceType.lesson), _this, true);
                res.idx = idx;
                var nodeUser = blended.getPersistData(node, _this.ctx.taskid);
                if (idx == 0) {
                    res.user = blended.pretestScore((node), nodeUser, _this.ctx.taskid);
                    pretestUser = res.user = $.extend(res.user, nodeUser);
                }
                else {
                    res.user = blended.agregateShortFromNodes(res.node, _this.ctx.taskid, false);
                }
                res.status = !res.user ? homeLessonStates.no : (res.user.done ? homeLessonStates.done : homeLessonStates.entered);
                //lesson nejde spustit
                //res.cannotRun = this.ctx.onbehalfof && res.lessonType != blended.moduleServiceType.lesson && res.status != homeLessonStates.done;
                //rightButtonType management: vsechny nehotove dej RUN a ev. nastav index prvniho nehotoveho check testu
                if (res.lessonType != blended.moduleServiceType.pretest)
                    res.rightButtonType = res.status == homeLessonStates.done ? rightButtonTypes.preview : rightButtonTypes.run;
                if (!firstNotDoneCheckTestIdx && res.lessonType == blended.moduleServiceType.test && res.status != homeLessonStates.done)
                    firstNotDoneCheckTestIdx = idx;
                //left mark
                if (res.user && res.user.done) {
                    res.leftMarkType = res.lessonType == blended.moduleServiceType.pretest ? leftMarkTypes.pretestLevel : (res.user.waitForEvaluation ? leftMarkTypes.waitForEvaluation : leftMarkTypes.progress);
                }
                return res;
            };
            this.lessons = [pretestItem = fromNode(this.myTask.dataNode.pretest, 0)];
            if (pretestUser && pretestUser.done) {
                this.pretestLevels = pretestUser.history;
                this.pretestLevel = pretestUser.targetLevel;
                this.lessons.push(fromNode(this.myTask.dataNode.entryTests[this.pretestLevel], 1));
                this.lessons.pushArray(_.map(this.myTask.dataNode.lessons[this.pretestLevel], function (nd, idx) { return fromNode(nd, idx + 2); }));
            }
            //rightButtonType management: vsechna cviceni za firstNotDoneCheckTestIdx dej rightButtonTypes=no
            for (var i = firstNotDoneCheckTestIdx + 1; i < this.lessons.length; i++)
                this.lessons[i].rightButtonType = rightButtonTypes.no;
            //prvni nehotovy node je aktivni
            _.find(this.lessons, function (pl) {
                if (pl.status == homeLessonStates.done)
                    return false;
                pl.active = true;
                pl.leftMarkType = leftMarkTypes.active;
                return true;
            });
            //skore za cely kurz
            //var users = _.map(_.filter(this.lessons, l => /*l.status == homeLessonStates.done &&*/ l.lessonType != blended.moduleServiceType.pretest), l=> l.user);
            var users = _.map(this.lessons, function (l) { return l.user; });
            this.user = blended.agregateShorts(users);
            //this.score = blended.scorePercent(this.user);
        }
        homeViewController.prototype.navigateLesson = function (lesson) {
            var _this = this;
            //if (lesson.cannotRun) return;
            var service = {
                params: lesson.lessonType == blended.moduleServiceType.pretest ?
                    blended.cloneAndModifyContext(this.ctx, function (d) { return d.pretesturl = blended.encodeUrl(_this.myTask.dataNode.pretest.url); }) :
                    blended.cloneAndModifyContext(this.ctx, function (d) { return d.moduleurl = blended.encodeUrl(lesson.node.url); }),
                current: lesson.lessonType == blended.moduleServiceType.pretest ?
                    vyzva.stateNames.pretestTask :
                    (lesson.lessonType == blended.moduleServiceType.test ? vyzva.stateNames.moduleTestTask : vyzva.stateNames.moduleLessonTask),
                parent: this.myTask,
            };
            var nextTask = lesson.lessonType == blended.moduleServiceType.pretest ?
                new blended.pretestTaskController(service) :
                new vyzva.moduleTaskController(service);
            var url = nextTask.goCurrent();
            this.navigate(url);
            //this.myTask.child = lesson.lessonType == blended.moduleServiceType.pretest ?
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
                //current: blended.prodStates.pretestModule,
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
            proxies.vyzva57services.debugClearProduct(this.ctx.companyid, this.ctx.userDataId(), this.ctx.productUrl, function () { return location.reload(); });
        };
        return homeViewController;
    })(blended.taskViewController);
    vyzva.homeViewController = homeViewController;
    //****************** TASK
    var homeTaskController = (function (_super) {
        __extends(homeTaskController, _super);
        function homeTaskController($scope, $state, product, intranetInfo) {
            _super.call(this, $scope, $state, product);
            this.intranetInfo = intranetInfo;
            //constructor(state: blended.IStateService, resolves: Array<any>) {
            //  super(state, resolves);
            this.productParent = this;
            this.user = blended.getPersistWrapper(this.dataNode, this.ctx.taskid, function () { return { startDate: Utils.nowToNum() }; });
            //Intranet
            //this.intranetInfo = intranetInfo;
            if (!this.intranetInfo)
                return;
            var alocatedKeyInfos = this.intranetInfo.alocatedKeyInfos;
            this.lectorGroups = _.map(_.filter(alocatedKeyInfos, function (inf) { return inf.isLector; }), function (inf) { return inf.group; });
            var studentGroups = _.map(_.filter(alocatedKeyInfos, function (inf) { return inf.isStudent || inf.isVisitor; }), function (inf) { return inf.group; });
            //this.studentGroup = studentGroups.length > 0 ? studentGroups[0] : null;
            this.showLectorPart = !this.ctx.onbehalfof && this.lectorGroups.length > 0;
            this.showStudentPart = studentGroups.length > 0;
        }
        homeTaskController.$inject = ['$scope', '$state', '$loadedProduct', '$intranetInfo'];
        return homeTaskController;
    })(blended.homeTaskController);
    vyzva.homeTaskController = homeTaskController;
    blended.rootModule
        .filter('vyzva$home$nodeclass', function () {
        return function (lesson) {
            if (lesson.active && lesson.lessonType != blended.moduleServiceType.pretest)
                return "list-group-item-success-primary";
            else if (lesson.status == homeLessonStates.done || (lesson.active && lesson.lessonType == blended.moduleServiceType.pretest))
                return "list-group-item-success";
        };
    })
        .directive('vyzva$common$summary', function () {
        return {
            scope: { user: '&user' },
            templateUrl: 'vyzva$common$summary.html'
        };
    });
})(vyzva || (vyzva = {}));
