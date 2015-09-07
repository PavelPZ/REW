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
        //parent: moduleTaskController;
        //showResultAfterEval: boolean; //nepersistentni stavova promenna - je zobrazen vysledek po vyhodnoceni. V nasledujicim moveForward
        function exerciseTaskViewController($scope, $state, $loadedEx, $loadedLongData) {
            _super.call(this, $scope, $state);
            this.exParent = this;
            if (this.isFakeCreate)
                return;
            var modIdx = _.indexOf(this.moduleParent.exercises, this.dataNode);
            this.exService = new exerciseService($loadedEx, $loadedLongData, this, modIdx); //, () => this.confirmWrongScoreDialog());
            this.modService = new blended.moduleService(this.moduleParent.dataNode, this.exService, this.moduleParent.state.moduleType, this);
            $scope['exService'] = this.exService;
            $scope['modService'] = this.modService;
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
            //if (this.showResultAfterEval) { delete this.showResultAfterEval; return moveForwardResult.toParent; }
            var res = this.exService.evaluate(this.moduleParent.state.moduleType != blended.moduleServiceType.lesson, this.state.exerciseShowWarningPercent);
            if (!res.confirmWrongScore) {
                //this.showResultAfterEval = res.showResult; //
                return res.showResult ? blended.moveForwardResult.selfInnner : blended.moveForwardResult.toParent;
            }
            res.confirmWrongScore.then(function (okScore) {
                if (!okScore)
                    return;
                //this.showResultAfterEval = true;
                _this.$scope.$apply();
                //this.greenClick();
            });
            return blended.moveForwardResult.selfInnner;
            //return this.justEvaluated && this.moduleParent.state.moduleType == blended.moduleServiceType.lesson ? moveForwardResult.selfInnner : moveForwardResult.toParent;
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
            this.modIdx = modIdx;
            this.confirmWrongScoreDialog = function () { return controller.confirmWrongScoreDialog(); };
            this.ctx = controller.ctx;
            this.product = controller.productParent.dataNode;
            //this.exerciseIsTest = controller.state.exerciseIsTest; this.moduleUser = controller.parent.user.short;
            this.exerciseIsTest = controller.moduleParent.state.moduleType != blended.moduleServiceType.lesson;
            this.moduleUser = controller.moduleParent.user.short;
            this.user = blended.getPersistWrapper(exercise.dataNode, this.ctx.taskid, function () { var res = $.extend({}, blended.shortDefault); res.ms = exercise.dataNode.ms; return res; });
            if (!long) {
                long = {};
                this.user.modified = true;
            }
            this.user.long = long;
            this.startTime = Utils.nowToNum();
            //greenArrowRoot
            this.greenArrowRoot = controller.pretestParent ? controller.pretestParent : controller.moduleParent;
            //this.refresh();
        }
        exerciseService.prototype.score = function () {
            return blended.scorePercent(this.user.short);
        };
        exerciseService.prototype.onDisplay = function (el, completed) {
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
                            //test cviceni nesmi byt (pro nedokonceny test) videt ve vyhodnocenem stavu. Do vyhodnoceneho stav se vrati dalsim klikem na zelenou sipku.
                            _this.user.short.done = false;
                        }
                        pg.acceptData(_this.user.short.done, exImpl.result);
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
            if (!this.user.short.done)
                this.page.provideData(); //prevzeti poslednich dat z kontrolek cviceni
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
            if (this.user.short.done) {
                return { showResult: false };
            }
            this.user.modified = true;
            var short = this.user.short;
            //pasivni stranka
            if (this.page.isPassivePage()) {
                this.page.processReadOnlyEtc(true, true);
                short.done = true;
                return { showResult: false };
            }
            //aktivni stranka
            this.page.provideData(); //prevzeti vysledku z kontrolek
            var score = this.page.getScore(); //vypocet score
            if (!score) {
                debugger;
                short.done = true;
                return null;
            }
            var afterConfirmScore = function () {
                _this.page.processReadOnlyEtc(true, true); //readonly a skipable controls
                if (!isTest)
                    _this.page.acceptData(true);
                short.done = true;
                if (_this.exercise.dataNode.ms != score.ms) {
                    debugger;
                    def.reject("this.maxScore != score.ms");
                    return null;
                }
                short.s = score.s;
                //short.score = blended.scorePercent(short);
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
