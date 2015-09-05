var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var blended;
(function (blended) {
    (function (exItemBackground) {
        exItemBackground[exItemBackground["no"] = 0] = "no";
        exItemBackground[exItemBackground["warning"] = 1] = "warning";
        exItemBackground[exItemBackground["success"] = 2] = "success";
    })(blended.exItemBackground || (blended.exItemBackground = {}));
    var exItemBackground = blended.exItemBackground;
    (function (exItemContent) {
        exItemContent[exItemContent["no"] = 0] = "no";
        exItemContent[exItemContent["check"] = 1] = "check";
        exItemContent[exItemContent["folderOpen"] = 2] = "folderOpen";
        exItemContent[exItemContent["folder"] = 3] = "folder";
        exItemContent[exItemContent["progressBar"] = 4] = "progressBar";
    })(blended.exItemContent || (blended.exItemContent = {}));
    var exItemContent = blended.exItemContent;
    var moduleService = (function () {
        function moduleService(node, actEx, type, controller) {
            this.node = node;
            this.actEx = actEx;
            this.controller = controller;
            this.type = type;
            this.onbehalfof = controller.ctx.onbehalfof > 0;
            this.refresh();
            this.exShowPanel = this.user.done || this.type != blended.moduleServiceType.pretest;
        }
        moduleService.prototype.resetExercise = function () { alert('reset'); };
        moduleService.prototype.refresh = function () {
            var _this = this;
            this.exercises = _.map(_.filter(this.node.Items, function (it) { return isEx(it); }), function (node, idx) {
                return {
                    user: blended.getPersistData(node, _this.controller.ctx.taskid),
                    idx: idx,
                    node: node,
                    active: idx == _this.actEx.modIdx
                };
            });
            this.user = blended.agregateShorts(_.map(this.exercises, function (e) { return e.user; }));
            this.moduleDone = this.user && this.user.done;
            this.exNoclickable = this.type == blended.moduleServiceType.test && !this.moduleDone;
            _.each(this.exercises, function (ex) {
                //active item: stejny pro vsechny pripady
                if (ex.active) {
                    ex.content = exItemContent.folderOpen;
                    ex.background = exItemBackground.warning;
                    return;
                }
                //nehotovy test
                if (_this.type == blended.moduleServiceType.test && !_this.moduleDone) {
                    ex.content = ex.user ? exItemContent.check : exItemContent.folder;
                    return;
                }
                //vse ostatni: nehotova lekce, hotovy test i pretest
                if (!ex.user || !ex.user.done)
                    ex.content = exItemContent.folder;
                else if (ex.user.ms) {
                    ex.content = exItemContent.progressBar;
                    ex.percent = blended.scorePercent(ex.user);
                    ex.background = exItemBackground.success;
                }
                else {
                    ex.background = exItemBackground.success;
                    ex.content = exItemContent.check;
                }
            });
            this.score = blended.scorePercent(this.user);
        };
        //skok na jine cviceni, napr. v module map panelu 
        moduleService.prototype.navigateExercise = function (idx) {
            if (idx == this.actEx.modIdx)
                return;
            var exNode = this.exercises[idx].node;
            var ctx = blended.cloneAndModifyContext(this.controller.ctx, function (c) { return c.url = blended.encodeUrl(exNode.url); });
            this.controller.navigate({ stateName: this.controller.state.name, pars: ctx });
        };
        return moduleService;
    })();
    blended.moduleService = moduleService;
    function moduleIsDone(nd, taskId) {
        return !_.find(nd.Items, function (it) { var itUd = blended.getPersistData(it, taskId); return (!itUd || !itUd.done); });
    }
    blended.moduleIsDone = moduleIsDone;
    function isEx(nd) { return CourseMeta.isType(nd, CourseMeta.runtimeType.ex); }
    blended.isEx = isEx;
    var moduleTaskController = (function (_super) {
        __extends(moduleTaskController, _super);
        function moduleTaskController($scope, $state) {
            _super.call(this, $scope, $state);
            //constructor(state: IStateService) {
            //  super(state);
            this.moduleParent = this;
            this.user = blended.getPersistWrapper(this.dataNode, this.ctx.taskid, function () { return { done: false, actChildIdx: 0 }; });
            this.exercises = _.filter(this.dataNode.Items, function (it) { return isEx(it); });
        }
        moduleTaskController.prototype.onExerciseLoaded = function (idx) {
            var ud = this.user.short;
            if (ud.done) {
                ud.actChildIdx = idx;
                this.user.modified = true;
            }
        };
        moduleTaskController.prototype.adjustChild = function () {
            var _this = this;
            var ud = this.user.short;
            var exNode = ud.done ? this.exercises[ud.actChildIdx] : _.find(this.exercises, function (it) { var itUd = blended.getPersistData(it, _this.ctx.taskid); return (!itUd || !itUd.done); });
            if (!exNode) {
                debugger;
                ud.done = true;
                this.user.modified = true;
            }
            var moduleExerciseState = _.find(this.state.childs, function (ch) { return !ch.noModuleExercise; });
            var state = {
                params: blended.cloneAndModifyContext(this.ctx, function (d) { return d.url = blended.encodeUrl(exNode.url); }),
                parent: this,
                current: moduleExerciseState,
                createMode: blended.createControllerModes.adjustChild
            };
            //return new moduleExerciseState.oldController(state, null);
            return new moduleExerciseState.controller(state, null);
        };
        moduleTaskController.prototype.moveForward = function (sender) {
            var _this = this;
            if (this.congratulation) {
                delete this.congratulation;
                return blended.moveForwardResult.toParent;
            }
            var ud = this.user.short;
            if (ud.done) {
                ud.actChildIdx = ud.actChildIdx == this.exercises.length - 1 ? 0 : ud.actChildIdx + 1;
                this.user.modified = true;
                return blended.moveForwardResult.selfAdjustChild;
            }
            else {
                var exNode = _.find(this.exercises, function (it) { var itUd = blended.getPersistData(it, _this.ctx.taskid); return (!itUd || !itUd.done); });
                if (!ud.done && !exNode) {
                    ud.done = true;
                    this.user.modified = true;
                    return blended.moveForwardResult.toParent;
                }
                return blended.moveForwardResult.selfAdjustChild;
            }
        };
        return moduleTaskController;
    })(blended.taskController);
    blended.moduleTaskController = moduleTaskController;
    blended.rootModule
        .filter('vyzva$exmodule$percentheight', function () { return function (per, maxHeight) { return { height: ((100 - per) * maxHeight / 100).toString() + 'px' }; }; })
        .filter('vyzva$exmodule$percentwidth', function () { return function (per, maxWidth) { return { width: ((100 - per) * maxWidth / 100).toString() + 'px' }; }; })
        .filter('vyzva$exmodule$sec', function () { return function (sec) { return sec ? Utils.formatDateTime(sec) : null; }; })
        .filter('vyzva$exmodule$time', function () { return function (sec) { return sec ? Utils.formatTimeSpan(sec) : null; }; })
        .filter('vyzva$exmodule$score', function () { return function (short) { return blended.scoreText(short); }; })
        .directive('vyzva$exmodule$emptytest', function () {
        return {
            scope: { label: '@label', value: '@value', nobr: '@nobr' },
            template: '<span ng-if="value">{{label}}: <b>{{value}}</b></span><br ng-if="!nobr"/>'
        };
    })
        .directive('vyzva$exmodule$scoreprogress', function () {
        return {
            scope: { value: '@value' },
            template: '<div class="score-bar"><div class="score-text">{{value}}%</div><div class="progress-red" ng-style="value | vyzva$exmodule$percentwidth : 50"></div></div>'
        };
    });
})(blended || (blended = {}));
