var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var blended;
(function (blended) {
    (function (exDoneStatus) {
        exDoneStatus[exDoneStatus["no"] = 0] = "no";
        exDoneStatus[exDoneStatus["passive"] = 1] = "passive";
        exDoneStatus[exDoneStatus["active"] = 2] = "active";
    })(blended.exDoneStatus || (blended.exDoneStatus = {}));
    var exDoneStatus = blended.exDoneStatus;
    //********************* RESOLVES
    blended.loadEx = ['$stateParams', function ($stateParams) {
            blended.finishContext($stateParams);
            return blended.loader.adjustEx($stateParams);
        }];
    blended.loadLongData = ['$stateParams', function (ctx) {
            blended.finishContext(ctx);
            var def = ctx.$q.defer();
            try {
                proxies.vyzva57services.getLongData(ctx.companyid, ctx.userDataId(), ctx.productUrl, ctx.taskid, ctx.Url, function (long) {
                    var res = JSON.parse(long);
                    def.resolve(res);
                });
            }
            finally {
                return def.promise;
            }
        }];
    //***************** EXERCISE controller
    var exerciseTaskViewController = (function (_super) {
        __extends(exerciseTaskViewController, _super);
        function exerciseTaskViewController($scope /*union types*/, $state, $loadedEx, $loadedLongData) {
            _super.call(this, $scope, $state);
            this.exParent = this;
            if (this.isFakeCreate)
                return;
            var modIdx = _.indexOf(this.moduleParent.exercises, this.dataNode);
            this.exService = new exerciseService($loadedEx, $loadedLongData, this, modIdx); //, () => this.confirmWrongScoreDialog());
            this.modService = new blended.moduleService(this.moduleParent.dataNode, this.exService, this.moduleParent.state.moduleType, this);
            this.exService.modService = this.modService;
            var sc = $scope;
            sc.exService = this.exService;
            sc.modService = this.modService;
            this.user = this.exService.user;
            this.title = this.dataNode.title;
            this.moduleParent.onExerciseLoaded(modIdx); //zmena actChildIdx v persistentnich datech modulu
        }
        exerciseTaskViewController.prototype.confirmWrongScoreDialog = function () {
            var def = this.ctx.$q.defer();
            setTimeout(function () {
                if (confirm('Špatné skore, pokračovat?'))
                    def.resolve();
                else
                    def.reject();
            }, 1000);
            return def.promise;
        };
        exerciseTaskViewController.prototype.congratulationDialog = function () {
            var def = this.ctx.$q.defer();
            setTimeout(function () {
                alert('Gratulace');
                def.resolve();
                ;
            }, 1000);
            return def.promise;
        };
        //osetreni zelene sipky
        exerciseTaskViewController.prototype.moveForward = function (sender) {
            var _this = this;
            var res = this.exService.evaluate(this.moduleParent.state.moduleType != blended.moduleServiceType.lesson, this.state.exerciseShowWarningPercent);
            if (!res.confirmWrongScore) {
                return res.showResult ? blended.moveForwardResult.selfInnner : blended.moveForwardResult.toParent;
            }
            res.confirmWrongScore.then(function (okScore) {
                if (!okScore)
                    return;
                _this.$scope.$apply();
            });
            return blended.moveForwardResult.selfInnner;
        };
        //provede reset cviceni, napr. v panelu s instrukci
        exerciseTaskViewController.prototype.resetExercise = function () { alert('reset'); };
        exerciseTaskViewController.prototype.greenClick = function () {
            this.exService.greenArrowRoot.navigateAhead(this);
        };
        exerciseTaskViewController.$inject = ['$scope', '$state', '$loadedEx', '$loadedLongData'];
        return exerciseTaskViewController;
    })(blended.taskController);
    blended.exerciseTaskViewController = exerciseTaskViewController;
    //********************* SHOW EXERCISES DIRECTIVE
    var showExerciseModel = (function () {
        function showExerciseModel($stateParams) {
            this.$stateParams = $stateParams;
            this.link = function (scope, el, attrs) {
                var exService = scope.exService();
                //scope.$on('$destroy', ev => exService.onDestroy(el));
                scope.$on('onStateChangeSuccess', function (ev) { return exService.onDestroy(el); });
                exService.onDisplay(el, $.noop);
            };
            this.scope = { exService: '&exService' };
        }
        return showExerciseModel;
    })();
    blended.showExerciseModel = showExerciseModel;
    blended.rootModule
        .directive('showExercise', ['$stateParams', function ($stateParams) { return new showExerciseModel($stateParams); }]);
    //********************* EXERCISE SERVICE
    var exerciseService = (function () {
        function exerciseService(exercise, long, controller, modIdx) {
            this.exercise = exercise;
            this.long = long;
            this.controller = controller;
            this.modIdx = modIdx;
            //this.exercise = exercise; this.modIdx = modIdx;
            this.confirmWrongScoreDialog = function () { return controller.confirmWrongScoreDialog(); };
            this.ctx = controller.ctx;
            this.product = controller.productParent.dataNode;
        }
        exerciseService.prototype.resetPretest = function (newLevel) {
            var _this = this;
            proxies.vyzva57services.deleteProduct(this.ctx.companyid, this.ctx.userDataId(), this.ctx.productUrl, this.ctx.taskid, function () {
                _.each(_this.product.nodeList, function (it) { return blended.clearPersistData(it, _this.ctx.taskid); });
                if (newLevel >= 0) {
                    var course = _this.product;
                    //pretest a prvni pretest item se oznaci DONE. Pak se ukazuje lektorovi moznost opet zmenit pomoci A1 pretest item level
                    blended.setPersistData(course.pretest, _this.ctx.taskid, function (d) { d.history = [0]; d.targetLevel = newLevel; d.lectorSetTarget = true; d.flag = CourseModel.CourseDataFlag.blPretest | CourseModel.CourseDataFlag.done; });
                    blended.setPersistData(course.pretest.Items[0], _this.ctx.taskid, function (d) { d.flag = CourseModel.CourseDataFlag.blPretestItem | CourseModel.CourseDataFlag.done; d.actChildIdx = 0; });
                }
                _this.product.saveProduct(_this.controller.ctx, function () { return _this.controller.navigate({ stateName: blended.prodStates.home.name, pars: _this.ctx }); });
            });
        };
        exerciseService.prototype.confirmLesson = function (alow) {
            var _this = this;
            if (alow) {
                this.saveLectorEvaluation();
                blended.setPersistData(this.modService.node, this.ctx.taskid, function (modUser) { return modUser.lectorControlTestOK = true; });
            }
            else {
                blended.clearPersistData(this.modService.node, this.ctx.taskid);
                _.each(this.modService.node.Items, function (it) {
                    if (!blended.isEx(it))
                        return;
                    blended.clearPersistData(it, _this.ctx.taskid);
                });
            }
            this.product.saveProduct(this.controller.ctx, function () { return _this.controller.navigate({ stateName: blended.prodStates.home.name, pars: _this.ctx }); });
        };
        //ICoursePageCallback
        exerciseService.prototype.onRecorder = function (page, msecs) { if (page != this.page)
            debugger; this.user.modified = true; if (!this.user.short.sRec)
            this.user.short.sRec = 0; this.user.short.sRec += Math.round(msecs / 1000); };
        exerciseService.prototype.onPlayRecorder = function (page, msecs) { this.user.modified = true; if (!this.user.short.sPRec)
            this.user.short.sPRec = 0; this.user.short.sPRec += Math.round(msecs / 1000); };
        exerciseService.prototype.onPlayed = function (page, msecs) { this.user.modified = true; if (!this.user.short.sPlay)
            this.user.short.sPlay = 0; this.user.short.sPlay += Math.round(msecs / 1000); };
        exerciseService.prototype.saveLectorEvaluation = function () {
            var _this = this;
            var humanEvals = _.map($('.human-form:visible').toArray(), function (f) {
                var id = f.id.substr(5);
                return { ctrl: (_this.page.tags[f.id.substr(5)]), edit: $('#human-ed-' + id) };
            });
            _.each(humanEvals, function (ev) {
                _this.user.modified = true;
                var val = parseInt(ev.edit.val());
                if (!val)
                    val = 0;
                if (val > 100)
                    val = 100;
                ev.ctrl.result.hPercent = val / 100 * ev.ctrl.scoreWeight;
                ev.ctrl.result.flag &= ~CourseModel.CourseDataFlag.needsEval;
                ev.ctrl.setScore();
            });
            var score = this.page.getScore();
            this.user.short.s = score.s;
            this.user.short.flag = Course.setAgregateFlag(this.user.short.flag, score.flag);
        };
        exerciseService.prototype.score = function () {
            return blended.scorePercent(this.user.short);
        };
        exerciseService.prototype.onDisplay = function (el, completed) {
            var _this = this;
            this.exType = this.modService.lessonType;
            this.isTest = this.exType != blended.moduleServiceType.lesson;
            this.user = blended.getPersistWrapper(this.exercise.dataNode, this.ctx.taskid, function () {
                var res = $.extend({}, blended.shortDefault);
                res.ms = _this.exercise.dataNode.ms;
                res.flag = CourseModel.CourseDataFlag.ex;
                if (_this.controller.pretestParent)
                    res.flag |= CourseModel.CourseDataFlag.blPretestEx;
                else if (_this.isTest)
                    res.flag |= CourseModel.CourseDataFlag.testEx;
                return res;
            });
            if (!this.long) {
                this.long = {};
                this.user.modified = true;
            }
            this.user.long = this.long;
            this.startTime = Utils.nowToNum();
            //greenArrowRoot
            this.greenArrowRoot = this.controller.pretestParent ? this.controller.pretestParent : this.controller.moduleParent;
            this.lectorMode = !!this.ctx.onbehalfof && this.modService.moduleDone;
            this.lectorCanEvaluateRecording = this.lectorMode && !!(this.user.short.flag & CourseModel.CourseDataFlag.pcCannotEvaluate);
            var pg = this.page = CourseMeta.extractEx(this.exercise.pageJsonML);
            if (this.lectorMode)
                this.page.humanEvalMode = true;
            this.recorder = this;
            pg.blendedExtension = this; //navazani rozsireni na Page
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
                        if (_this.isTest && blended.persistUserIsDone(_this.user.short) && !_this.modService.moduleDone && !_this.lectorMode) {
                            //test cviceni nesmi byt (pro nedokonceny test) videt ve vyhodnocenem stavu. Do vyhodnoceneho stav se vrati dalsim klikem na zelenou sipku.
                            blended.persistUserIsDone(_this.user.short, false);
                        }
                        pg.acceptData(blended.persistUserIsDone(_this.user.short), exImpl.result);
                        completed(pg);
                    });
                });
            });
        };
        exerciseService.prototype.onDestroy = function (el) {
            //elapsed
            var now = Utils.nowToNum();
            var delta = Math.min(maxDelta, Math.round(now - this.startTime));
            if (this.user.short) {
                var short = this.user.short;
                if (!short.elapsed)
                    short.elapsed = 0;
                short.elapsed += delta;
                short.end = Utils.nowToNum();
                this.user.modified = true;
                if (!blended.persistUserIsDone(this.user.short))
                    this.page.provideData(); //prevzeti poslednich dat z kontrolek cviceni
            }
            //uklid
            if (this.page.sndPage)
                this.page.sndPage.htmlClearing();
            if (this.page.sndPage)
                this.page.sndPage.leave();
            ko.cleanNode(el[0]);
            el.html('');
            delete (this.exercise.dataNode).result;
        };
        //vrati budto promise v IEvaluateResult.confirmWrongScore (= aktivni pod 75% = cekani na wrongScore confirmation dialog) 
        // nebo IEvaluateResult.showResult (ukazat vysledek vyhodnoceni: pro aktivni nad 75% cviceni ano, pro pasivni a test ne)
        exerciseService.prototype.evaluate = function (isTest, exerciseShowWarningPercent) {
            var _this = this;
            if (exerciseShowWarningPercent === void 0) { exerciseShowWarningPercent = 75; }
            if (blended.persistUserIsDone(this.user.short)) {
                return { showResult: false };
            }
            this.user.modified = true;
            var short = this.user.short;
            //pasivni stranka
            if (this.page.isPassivePage()) {
                this.page.processReadOnlyEtc(true, true);
                blended.persistUserIsDone(short, true);
                return { showResult: false };
            }
            //aktivni stranka
            this.page.provideData(); //prevzeti vysledku z kontrolek
            var score = this.page.getScore(); //vypocet score
            if (!score) {
                debugger;
                blended.persistUserIsDone(short, true);
                return null;
            }
            var afterConfirmScore = function () {
                _this.page.processReadOnlyEtc(true, true); //readonly a skipable controls
                if (!isTest)
                    _this.page.acceptData(true);
                _this.user.modified = true;
                blended.persistUserIsDone(short, true);
                if (_this.exercise.dataNode.ms != score.ms) {
                    debugger;
                    def.reject("this.maxScore != score.ms");
                    return null;
                }
                short.s = score.s;
                short.flag = Course.setAgregateFlag(short.flag, score.flag);
                //short.flag |= score.flag;
            };
            var exerciseOK = isTest || !this.confirmWrongScoreDialog ? true : (score == null || score.ms == 0 || (score.s / score.ms * 100) >= exerciseShowWarningPercent);
            if (!exerciseOK) {
                var def = this.ctx.$q.defer();
                try {
                    this.confirmWrongScoreDialog().then(function () {
                        afterConfirmScore();
                        def.resolve(true);
                    }, function () {
                        def.resolve(false);
                    });
                }
                finally {
                    return { confirmWrongScore: def.promise };
                }
            }
            else {
                afterConfirmScore();
                return { showResult: !isTest };
            }
        };
        return exerciseService;
    })();
    blended.exerciseService = exerciseService;
    var maxDelta = 10 * 60; //10 minut
})(blended || (blended = {}));
