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
    function agregateShorts(shorts) {
        var res = $.extend({}, shortDefault);
        res.done = true;
        _.each(shorts, function (short) {
            if (!short)
                return;
            var done = short.done;
            res.done = res.done && done;
            res.count += short.count;
            if (done) {
                res.ms += short.ms;
                res.s += short.s;
            }
            //elapsed, beg a end
            res.beg = setDate(res.beg, short.beg, true);
            res.end = setDate(res.end, short.end, false);
            res.elapsed += short.elapsed;
        });
        return res;
    }
    blended.agregateShorts = agregateShorts;
    function agregateShortFromNodes(node, taskId, moduleAlowFinishWhenUndone) {
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
            }
        });
        return res;
    }
    blended.agregateShortFromNodes = agregateShortFromNodes;
    var shortDefault = { elapsed: 0, beg: Utils.nowToNum(), end: Utils.nowToNum(), done: false, ms: 0, s: 0, count: 0 };
    function setDate(dt1, dt2, min) { if (!dt1)
        return dt2; if (!dt2)
        return dt1; if (min)
        return dt2 > dt1 ? dt1 : dt2;
    else
        return dt2 < dt1 ? dt1 : dt2; }
    var exerciseService = (function () {
        function exerciseService(exercise, long, controller) {
            this.exercise = exercise;
            this.ctx = controller.ctx;
            this.product = controller.taskRoot().dataNode,
                this.exerciseIsTest = controller.state.exerciseIsTest;
            this.moduleUser = controller.parent.user.short;
            this.user = blended.getPersistWrapper(exercise.dataNode, this.ctx.taskid, function () { return $.extend({}, shortDefault); });
            if (!long) {
                long = {};
                this.user.modified = true;
            }
            this.user.long = long;
            this.startTime = Utils.nowToNum();
            this.modIdx = _.indexOf(controller.parent.exercises, controller.dataNode);
            //greenArrowRoot
            this.greenArrowRoot = controller;
            while (!this.greenArrowRoot.state.isGreenArrowRoot)
                this.greenArrowRoot = this.greenArrowRoot.parent;
            //module services
            this.mod = new blended.moduleService(controller.dataNode, this.ctx, this, controller);
        }
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
            short.end = Utils.dayToInt(new Date());
            //pasivni stranka
            if (this.page.isPassivePage()) {
                this.page.processReadOnlyEtc(true, true); //readonly a skipable controls
                short.done = true;
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
    var exerciseTaskViewController = (function (_super) {
        __extends(exerciseTaskViewController, _super);
        function exerciseTaskViewController(state, resolves) {
            _super.call(this, state);
            if (state.createMode != blended.createControllerModes.navigate)
                return;
            this.exService = new exerciseService((resolves[0]), (resolves[1]), this);
            state.$scope['exService'] = this.exService;
            state.$scope['modService'] = this.exService.mod;
            this.user = this.exService.user;
            this.title = this.dataNode.title;
            //this.modIdx = _.indexOf(this.parent.exercises, this.dataNode);
            this.parent.onExerciseLoaded(this.exService.modIdx); //zmena actChildIdx v persistentnich datech modulu
            //this.modItems = _.map(this.parent.exercises, (node, idx) => {
            //  return { user: blended.getPersistData<IExShort>(node, this.ctx.taskid), idx: idx, title: node.title, active: idx == this.modIdx };
            //});
        }
        //osetreni zelene sipky
        exerciseTaskViewController.prototype.moveForward = function () {
            if (this.justEvaluated) {
                delete this.justEvaluated;
                return blended.moveForwardResult.toParent;
            }
            this.justEvaluated = this.exService.evaluate(this.state.exerciseIsTest, this.state.exerciseShowWarningPercent);
            return this.justEvaluated && !this.state.exerciseIsTest ? blended.moveForwardResult.selfInnner : blended.moveForwardResult.toParent;
        };
        //provede reset cviceni, napr. v panelu s instrukci
        exerciseTaskViewController.prototype.resetExercise = function () { alert('reset'); };
        exerciseTaskViewController.prototype.greenClick = function () {
            this.exService.greenArrowRoot.navigateAhead();
        };
        return exerciseTaskViewController;
    })(blended.taskController);
    blended.exerciseTaskViewController = exerciseTaskViewController;
})(blended || (blended = {}));
