var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var blended;
(function (blended) {
    blended.loadEx = ['$stateParams', function ($stateParams) {
            blended.finishContext($stateParams);
            return blended.loader.adjustEx($stateParams);
        }];
    blended.loadLongData = ['$stateParams', function (ctx) {
            blended.finishContext(ctx);
            var def = ctx.$q.defer();
            proxies.vyzva57services.getLongData(ctx.companyid, ctx.userDataId(), ctx.productUrl, ctx.taskid, ctx.Url, function (long) {
                var res = JSON.parse(long);
                def.resolve(res);
            });
            return def.promise;
        }];
    var showExerciseModel = (function () {
        function showExerciseModel($stateParams) {
            this.$stateParams = $stateParams;
            this.link = function (scope, el, attrs) {
                var exService = scope.exService();
                scope.$on('$destroy', function (ev) { return exService.onDestroy(el); });
                exService.onDisplay(el, $.noop);
            };
            this.scope = { exService: '&exService' };
        }
        return showExerciseModel;
    })();
    blended.showExerciseModel = showExerciseModel;
    blended.rootModule
        .directive('showExercise', ['$stateParams', function ($stateParams) { return new showExerciseModel($stateParams); }]);
    function scorePercent(sc) { return sc.ms == 0 ? -1 : Math.round(sc.s / sc.ms * 100); }
    blended.scorePercent = scorePercent;
    function scoreText(sc) { var pr = scorePercent(sc); return pr < 0 ? '' : pr.toString() + '%'; }
    blended.scoreText = scoreText;
    function agregateShorts(shorts) {
        var res = $.extend({}, shortDefault);
        res.done = true;
        _.each(shorts, function (short) {
            if (!short) {
                res.done = false;
                return;
            }
            var done = short.done;
            res.done = res.done && done;
            res.count += short.count || 1;
            if (done) {
                res.ms += short.ms || 0;
                res.s += short.s || 0;
            }
            //elapsed, beg a end
            res.beg = setDate(res.beg, short.beg, true);
            res.end = setDate(res.end, short.end, false);
            res.elapsed += short.elapsed || 0;
        });
        return res;
    }
    blended.agregateShorts = agregateShorts;
    function agregateShortFromNodes(node, taskId, moduleAlowFinishWhenUndone /*do vyhodnoceni zahrn i nehotova cviceni*/) {
        var res = $.extend({}, shortDefault);
        res.done = true;
        _.each(node.Items, function (nd) {
            if (!blended.isEx(nd))
                return;
            res.count++;
            var us = blended.getPersistWrapper(nd, taskId);
            var done = us && us.short.done;
            res.done = res.done && done;
            if (nd.ms) {
                if (done) {
                    res.ms += nd.ms;
                    res.s += us.short.s;
                }
                else if (moduleAlowFinishWhenUndone) {
                    res.ms += nd.ms;
                }
            }
            if (us) {
                res.beg = setDate(res.beg, us.short.beg, true);
                res.end = setDate(res.end, us.short.end, false);
                res.elapsed += us.short.elapsed;
                res.sumPlay += us.short.sumPlay;
                res.sumPlayRecord += us.short.sumPlayRecord;
                res.sumRecord += us.short.sumRecord;
            }
        });
        return res;
    }
    blended.agregateShortFromNodes = agregateShortFromNodes;
    var shortDefault = { elapsed: 0, beg: Utils.nowToNum(), end: Utils.nowToNum(), done: false, ms: 0, s: 0, count: 0, sumPlay: 0, sumPlayRecord: 0, sumRecord: 0 };
    function setDate(dt1, dt2, min) { if (!dt1)
        return dt2; if (!dt2)
        return dt1; if (min)
        return dt2 > dt1 ? dt1 : dt2;
    else
        return dt2 < dt1 ? dt1 : dt2; }
    (function (exDoneStatus) {
        exDoneStatus[exDoneStatus["no"] = 0] = "no";
        exDoneStatus[exDoneStatus["passive"] = 1] = "passive";
        exDoneStatus[exDoneStatus["active"] = 2] = "active";
    })(blended.exDoneStatus || (blended.exDoneStatus = {}));
    var exDoneStatus = blended.exDoneStatus;
    var exerciseService = (function () {
        function exerciseService(exercise, long, controller) {
            this.exercise = exercise;
            this.ctx = controller.ctx;
            this.product = controller.productParent.dataNode;
            //this.exerciseIsTest = controller.state.exerciseIsTest; this.moduleUser = controller.parent.user.short;
            this.exerciseIsTest = controller.moduleParent.state.moduleType != blended.moduleServiceType.lesson;
            this.moduleUser = controller.moduleParent.user.short;
            this.user = blended.getPersistWrapper(exercise.dataNode, this.ctx.taskid, function () { var res = $.extend({}, shortDefault); res.ms = exercise.dataNode.ms; return res; });
            if (!long) {
                long = {};
                this.user.modified = true;
            }
            this.user.long = long;
            this.startTime = Utils.nowToNum();
            this.modIdx = _.indexOf(controller.moduleParent.exercises, controller.dataNode);
            //greenArrowRoot
            this.greenArrowRoot = controller.pretestParent ? controller.pretestParent : controller.moduleParent;
            //this.greenArrowRoot = controller;
            //while (!this.greenArrowRoot.state.isGreenArrowRoot) this.greenArrowRoot = this.greenArrowRoot.parent;
            this.refresh();
        }
        exerciseService.prototype.refresh = function () {
            this.doneStatus = this.user && this.user.short && this.user.short.done ? (this.user.short.ms ? exDoneStatus.active : exDoneStatus.passive) : exDoneStatus.no;
            this.score = this.doneStatus == exDoneStatus.active ? this.user.short.s / this.user.short.ms * 100 : -1;
        };
        exerciseService.prototype.onDisplay = function (el, completed) {
            //el.addClass('contentHidden');
            var _this = this;
            var pg = this.page = CourseMeta.extractEx(this.exercise.pageJsonML);
            Course.localize(pg, function (s) { return CourseMeta.localizeString(pg.url, s, _this.exercise.mod.loc); });
            var isGramm = CourseMeta.isType(this.exercise.dataNode, CourseMeta.runtimeType.grammar);
            if (!isGramm) {
                if (pg.evalPage)
                    this.exercise.dataNode.ms = pg.evalPage.maxScore;
            }
            //instrukce
            var instrs = this.product.instructions;
            var instrBody = _.map(pg.instrs, function (instrUrl) { return instrs[instrUrl]; });
            this.instructionData = { title: pg.instrTitle, body: instrBody.join('') };
            var exImpl = (this.exercise.dataNode);
            exImpl.page = pg;
            exImpl.result = this.user.long;
            pg.finishCreatePage((this.exercise.dataNode));
            pg.callInitProcs(Course.initPhase.beforeRender, function () {
                var html = JsRenderTemplateEngine.render("c_gen", pg);
                CourseMeta.actExPageControl = pg; //knockout pro cviceni binduje CourseMeta.actExPageControl
                ko.cleanNode(el[0]);
                el.html('');
                el.html(html);
                ko.applyBindings({}, el[0]);
                pg.callInitProcs(Course.initPhase.afterRender, function () {
                    pg.callInitProcs(Course.initPhase.afterRender2, function () {
                        if (_this.exerciseIsTest && _this.user.short.done && !_this.moduleUser.done) {
                            _this.user.short.done = false; //test cviceni nesmi byt (pro nedokonceny test) videt vyhodnocene
                        }
                        pg.acceptData(_this.user.short.done, exImpl.result);
                        //el.removeClass('contentHidden');
                        completed(pg);
                    });
                });
            });
        };
        exerciseService.prototype.onDestroy = function (el) {
            //elapsed
            var now = Utils.nowToNum();
            var delta = Math.min(maxDelta, Math.round(now - this.startTime));
            var short = this.user.short;
            if (!short.elapsed)
                short.elapsed = 0;
            short.elapsed += delta;
            short.end = Utils.nowToNum();
            this.user.modified = true;
            if (!this.user.short.done) {
                if (this.exerciseIsTest) {
                    //el.addClass('contentHidden');
                    this.evaluate(true);
                }
                else
                    this.page.provideData(); //prevzeti poslednich dat z kontrolek cviceni
            }
            //this.product.saveProduct(this.ctx, () => { //ulozeni vysledku do DB
            //uklid
            if (this.page.sndPage)
                this.page.sndPage.htmlClearing();
            if (this.page.sndPage)
                this.page.sndPage.leave();
            ko.cleanNode(el[0]);
            el.html('');
            delete (this.exercise.dataNode).result;
            delete this.user.long;
            //});
        };
        exerciseService.prototype.evaluate = function (isTest, exerciseShowWarningPercent) {
            if (this.user.short.done)
                return false;
            this.user.modified = true;
            var short = this.user.short;
            //pasivni stranka
            if (this.page.isPassivePage()) {
                this.page.processReadOnlyEtc(true, true); //readonly a skipable controls
                short.done = true;
                this.refresh();
                return true;
            }
            if (typeof (exerciseShowWarningPercent) == 'undefined')
                exerciseShowWarningPercent = 75;
            //aktivni stranka
            this.page.provideData();
            var score = this.page.getScore();
            if (!score) {
                debugger;
                throw "!score";
                short.done = true;
                return true;
            }
            var exerciseOK = isTest ? true : (score == null || score.ms == 0 || (score.s / score.ms * 100) >= exerciseShowWarningPercent);
            //if (!exerciseOK /*&& !gui.alert(alerts.exTooManyErrors, true)*/) return false; //je hodne chyb a uzivatel chce cviceni znova
            this.page.processReadOnlyEtc(true, true); //readonly a skipable controls
            if (!isTest)
                this.page.acceptData(true);
            short.done = true;
            if (this.exercise.dataNode.ms != score.ms) {
                debugger;
                throw "this.maxScore != score.ms";
            }
            short.s = score.s;
            this.refresh();
            return true;
        };
        return exerciseService;
    })();
    blended.exerciseService = exerciseService;
    (function (evaluateResult) {
        evaluateResult[evaluateResult["wrongScore"] = 0] = "wrongScore";
        evaluateResult[evaluateResult["passiveEvaluated"] = 1] = "passiveEvaluated";
        evaluateResult[evaluateResult["activeEvaluated"] = 2] = "activeEvaluated";
        evaluateResult[evaluateResult["other"] = 3] = "other";
    })(blended.evaluateResult || (blended.evaluateResult = {}));
    var evaluateResult = blended.evaluateResult;
    var maxDelta = 10 * 60; //10 minut
    //***************** EXERCISE controller
    var exerciseTaskViewController = (function (_super) {
        __extends(exerciseTaskViewController, _super);
        function exerciseTaskViewController($scope, $state, $loadedEx, $loadedLongData) {
            _super.call(this, $scope, $state);
            //constructor(state: IStateService, resolves: Array<any>) {
            //  super(state);
            this.exParent = this;
            if (this.isFakeCreate)
                return;
            this.exService = new exerciseService($loadedEx, $loadedLongData, this);
            this.modService = new blended.moduleService(this.moduleParent.dataNode, this.exService, this.moduleParent.state.moduleType, this);
            $scope['exService'] = this.exService;
            $scope['modService'] = this.modService;
            this.user = this.exService.user;
            this.title = this.dataNode.title;
            this.moduleParent.onExerciseLoaded(this.exService.modIdx); //zmena actChildIdx v persistentnich datech modulu
        }
        //osetreni zelene sipky
        exerciseTaskViewController.prototype.moveForward = function (sender) {
            if (this.justEvaluated) {
                delete this.justEvaluated;
                return blended.moveForwardResult.toParent;
            }
            this.justEvaluated = this.exService.evaluate(this.moduleParent.state.moduleType != blended.moduleServiceType.lesson, this.state.exerciseShowWarningPercent);
            return this.justEvaluated && (this.moduleParent.state.moduleType == blended.moduleServiceType.lesson) ? blended.moveForwardResult.selfInnner : blended.moveForwardResult.toParent;
        };
        //provede reset cviceni, napr. v panelu s instrukci
        exerciseTaskViewController.prototype.resetExercise = function () { alert('reset'); };
        exerciseTaskViewController.prototype.greenClick = function (sender) {
            this.exService.greenArrowRoot.navigateAhead(this);
        };
        exerciseTaskViewController.$inject = ['$scope', '$state', '$loadedEx', '$loadedLongData'];
        return exerciseTaskViewController;
    })(blended.taskController);
    blended.exerciseTaskViewController = exerciseTaskViewController;
})(blended || (blended = {}));
