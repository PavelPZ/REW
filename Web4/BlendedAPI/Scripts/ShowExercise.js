var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var blended;
(function (blended) {
    blended.showExerciseDirective2 = ['$stateParams', function ($stateParams) { return new showExerciseModel($stateParams); }];
    var showExerciseModel = (function () {
        function showExerciseModel($stateParams) {
            var _this = this;
            this.$stateParams = $stateParams;
            this.link = function (scope, el, attrs) {
                scope.$on('$destroy', function () {
                    if (_this.page.sndPage)
                        _this.page.sndPage.htmlClearing();
                    if (_this.page.sndPage)
                        _this.page.sndPage.leave();
                    ko.cleanNode(el[0]);
                    el.html('');
                });
                blended.loader.adjustEx(_this.$stateParams).then(function (exserv) {
                    _this.page = exserv.page;
                    ko.cleanNode(el[0]);
                    el.html('');
                    CourseMeta.lib.blendedDisplayEx(_this.page, function (html) {
                        el.html(html);
                        ko.applyBindings({}, el[0]);
                    });
                });
            };
        }
        return showExerciseModel;
    })();
    blended.showExerciseModel = showExerciseModel;
    var exItemProxy = (function () {
        function exItemProxy() {
        }
        return exItemProxy;
    })();
    blended.exItemProxy = exItemProxy;
    function scorePercent(sc) { return sc.ms == 0 ? -1 : Math.round(sc.s / sc.ms * 100); }
    blended.scorePercent = scorePercent;
    function agregateChildShortInfos(node, taskId) {
        var res = $.extend({}, shortDefault);
        res.done = true;
        _.each(node.Items, function (nd) {
            var us = blended.getPersistWrapper(nd, taskId);
            res.done = res.done && (us ? us.short.done : false);
            if (nd.ms) {
                res.ms += nd.ms;
                res.s += us ? us.short.s : 0;
            }
            if (us) {
                res.beg = setDate(res.beg, us.short.beg, true);
                res.end = setDate(res.end, us.short.end, false);
                res.elapsed += us.short.elapsed;
            }
        });
        return res;
    }
    blended.agregateChildShortInfos = agregateChildShortInfos;
    var shortDefault = { elapsed: 0, beg: Utils.nowToNum(), end: Utils.nowToNum(), done: false, ms: 0, s: 0 };
    function setDate(dt1, dt2, min) { if (!dt1)
        return dt2; if (!dt2)
        return dt1; if (min)
        return dt2 > dt1 ? dt1 : dt2;
    else
        return dt2 < dt1 ? dt1 : dt2; }
    //***************** $scope.ex, je v cache
    var exerciseService = (function () {
        function exerciseService(ctx /*ctx v dobe vlozeni do cache*/, mod, dataNode, page, userLong) {
            this.mod = mod;
            this.dataNode = dataNode;
            this.page = page;
            this.userLong = userLong;
            this.taskId = ctx.taskid;
            if (!userLong)
                userLong = {};
            this.user = blended.getPersistWrapper(dataNode, this.taskId, function () { return $.extend({}, shortDefault); });
            this.user.long = userLong;
        }
        exerciseService.prototype.display = function (el, attrs) { };
        exerciseService.prototype.destroy = function (el) { };
        exerciseService.prototype.evaluate = function (task) {
            var now = Utils.nowToNum();
            var short = this.user.short;
            var delta = Math.min(maxDelta, Math.round(now - task.startTime));
            if (!short.elapsed)
                short.elapsed = 0;
            short.elapsed += delta;
            short.end = Utils.dayToInt(new Date());
            //pasivni stranka
            if (this.page.isPassivePage()) {
                this.page.processReadOnlyEtc(true, true); //readonly a skipable controls
                short.done = true;
                return true;
            }
            debugger;
            //aktivni stranka
            this.page.provideData(this.user.long);
            var score = this.page.getScore();
            if (!score) {
                debugger;
                throw "!score";
                short.done = true;
                return true;
            }
            var exerciseOK = task.isTest ? true : (score == null || score.ms == 0 || (score.s / score.ms * 100) >= 75);
            //if (!exerciseOK && !gui.alert(alerts.exTooManyErrors, true)) { this.userPending = false; return false; }//je hodne chyb a uzivatel chce cviceni znova
            this.page.processReadOnlyEtc(true, true); //readonly a skipable controls
            if (!task.isTest)
                this.page.acceptData(true, this.user.long);
            short.done = true;
            if (this.dataNode.ms != score.ms) {
                debugger;
                throw "this.maxScore != score.ms";
            }
            short.s = score.s;
            return true;
        };
        return exerciseService;
    })();
    blended.exerciseService = exerciseService;
    var maxDelta = 10 * 60; //10 minut
    var exerciseTaskViewController = (function (_super) {
        __extends(exerciseTaskViewController, _super);
        function exerciseTaskViewController(state, resolves) {
            var _this = this;
            _super.call(this, state);
            if (state.createMode != blended.createControllerModes.navigate)
                return;
            this.service = (resolves[0]); //data cviceni
            this.user = this.service.user;
            if (state.$scope)
                (state.$scope).ex = this.service; //navazani services do scope
            this.startTime = Utils.nowToNum();
            this.title = this.dataNode.title;
            this.modItems = _.map(this.parent.dataNode.Items, function (node, idx) {
                return { user: blended.getPersistData(node, _this.ctx.taskid), modIdx: idx, title: node.title };
            });
            this.modIdx = _.indexOf(this.parent.dataNode.Items, this.dataNode);
        }
        exerciseTaskViewController.prototype.isDone = function () { return this.user.short.done; };
        exerciseTaskViewController.prototype.moveForward = function (ud) {
            this.service.evaluate(this);
        };
        return exerciseTaskViewController;
    })(blended.taskController);
    blended.exerciseTaskViewController = exerciseTaskViewController;
})(blended || (blended = {}));
