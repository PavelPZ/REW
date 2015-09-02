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
    blended.rootModule
        .directive('showExercise', ['$stateParams', function ($stateParams) { return new showExerciseModel($stateParams); }]);
    //export var showExerciseDirective2 = ['$stateParams', ($stateParams: blended.learnContext) => new showExerciseModel($stateParams)];
    var showExerciseModel = (function () {
        function showExerciseModel($stateParams) {
            var _this = this;
            this.$stateParams = $stateParams;
            this.link = function (scope, el, attrs) {
                scope.$on('$destroy', function (ev) { return _this.exerciseService.destroy(el); });
                //nalezni exerciseService
                var sc = scope;
                while (sc && !sc['exerciseService'])
                    sc = sc.$parent;
                if (!sc)
                    return;
                _this.exerciseService = (sc['exerciseService']);
                _this.exerciseService.display(el, $.noop);
            };
        }
        return showExerciseModel;
    })();
    blended.showExerciseModel = showExerciseModel;
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
    var shortDefault = { elapsed: 0, beg: Utils.nowToNum(), end: Utils.nowToNum(), done: false, ms: 0, s: 0 };
    function setDate(dt1, dt2, min) { if (!dt1)
        return dt2; if (!dt2)
        return dt1; if (min)
        return dt2 > dt1 ? dt1 : dt2;
    else
        return dt2 < dt1 ? dt1 : dt2; }
    var exerciseService = (function () {
        function exerciseService(exercise, long, ctx, product, exerciseIsTest, moduleUser) {
            this.exercise = exercise;
            this.ctx = ctx;
            this.product = product;
            this.exerciseIsTest = exerciseIsTest;
            this.moduleUser = moduleUser;
            this.user = blended.getPersistWrapper(exercise.dataNode, ctx.taskid, function () { return $.extend({}, shortDefault); });
            if (!long) {
                long = {};
                this.user.modified = true;
            }
            this.user.long = long;
            this.startTime = Utils.nowToNum();
        }
        exerciseService.prototype.display = function (el, completed) {
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
        exerciseService.prototype.destroy = function (el) {
            var _this = this;
            if (!this.user.short.done) {
                if (this.exerciseIsTest) {
                    //el.addClass('contentHidden');
                    this.evaluate(true);
                }
                else
                    this.page.provideData(); //prevzeti poslednich dat z kontrolek cviceni
            }
            this.product.saveProduct(this.ctx, function () {
                //uklid
                if (_this.page.sndPage)
                    _this.page.sndPage.htmlClearing();
                if (_this.page.sndPage)
                    _this.page.sndPage.leave();
                ko.cleanNode(el[0]);
                el.html('');
                delete (_this.exercise.dataNode).result;
                delete _this.user.long;
            });
        };
        exerciseService.prototype.evaluate = function (isTest, exerciseShowWarningPercent) {
            if (this.user.short.done)
                return false;
            this.user.modified = true;
            var now = Utils.nowToNum();
            var short = this.user.short;
            var delta = Math.min(maxDelta, Math.round(now - this.startTime));
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
    var maxDelta = 10 * 60; //10 minut
    var exerciseTaskViewController = (function (_super) {
        __extends(exerciseTaskViewController, _super);
        function exerciseTaskViewController(state, resolves) {
            var _this = this;
            _super.call(this, state);
            if (state.createMode != blended.createControllerModes.navigate)
                return;
            this.exService = new exerciseService((resolves[0]), (resolves[1]), this.ctx, this.taskRoot().dataNode, this.state.exerciseIsTest, this.parent.user.short);
            state.$scope['exerciseService'] = this.exService;
            this.user = this.exService.user;
            this.title = this.dataNode.title;
            this.modIdx = _.indexOf(this.parent.exercises, this.dataNode);
            this.parent.onExerciseLoaded(this.modIdx);
            this.modItems = _.map(this.parent.exercises, function (node, idx) {
                return { user: blended.getPersistData(node, _this.ctx.taskid), idx: idx, title: node.title, active: idx == _this.modIdx };
            });
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
        //skok na jine cviceni, napr. v module map panelu 
        exerciseTaskViewController.prototype.selectExercise = function (idx) {
            if (idx == this.modIdx)
                return;
            var exNode = this.parent.exercises[idx];
            var ctx = blended.cloneAndModifyContext(this.ctx, function (c) { return c.url = blended.encodeUrl(exNode.url); });
            this.navigate({ stateName: this.state.name, pars: ctx });
        };
        exerciseTaskViewController.prototype.greenClick = function () {
            var st = this;
            while (!st.state.isGreenArrowRoot)
                st = st.parent;
            st.navigateAhead();
        };
        //wrapper kolem selectOtherExercise, aby sla funkce vlozit jako atribut do direktivy, napr:
        //V nadrazenem html: <div selectexercise="::ts.selectOtherExerciseWrapper()">
        //V direktiv kodu: scope = { selectExercise:'&selectexercise' };
        //V direktiv html: ng-click="selectExercise()(it.idx)
        exerciseTaskViewController.prototype.selectExerciseWrapper = function () { var self = this; return function (idx) { return self.selectExercise(idx); }; };
        exerciseTaskViewController.prototype.resetExerciseWrapper = function () { var self = this; return function () { return self.resetExercise(); }; };
        return exerciseTaskViewController;
    })(blended.taskController);
    blended.exerciseTaskViewController = exerciseTaskViewController;
})(blended || (blended = {}));
