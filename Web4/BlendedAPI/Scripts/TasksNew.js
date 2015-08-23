var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var blended;
(function (blended) {
    var controllerLow = (function () {
        function controllerLow($scope, $state) {
            this.$state = $state;
            this.ctx = ($state.params);
            blended.finishContext(this.ctx);
            $.extend(this, $state.current.data);
            $scope.ts = this;
        }
        return controllerLow;
    })();
    blended.controllerLow = controllerLow;
    //******* TASK VIEW
    var taskViewController = (function (_super) {
        __extends(taskViewController, _super);
        function taskViewController($scope, $state) {
            _super.call(this, $scope, $state);
            this.myTask = $scope.$parent.ts;
            this.myTask.myView = this;
            this.title = this.myTask.dataNode.title;
        }
        taskViewController.prototype.gotoHomeUrl = function () { Pager.gotoHomeUrl(); };
        return taskViewController;
    })(controllerLow);
    blended.taskViewController = taskViewController;
    //******* TASK 
    var taskController = (function (_super) {
        __extends(taskController, _super);
        //********************** 
        function taskController($scope, $state, dataNodeUrlParName, $loadedProduct) {
            var _this = this;
            _super.call(this, $scope, $state);
            this.$state = $state;
            this.getPersistData = function () {
                return blended.getPersistData(_this.dataNode, _this.ctx.taskid);
            };
            this.setPersistData = function (modify) {
                var it = _this.dataNode.userData ? _this.dataNode.userData[_this.ctx.taskid] : null;
                if (!it) {
                    it = { data: {}, modified: true };
                    if (!_this.dataNode.userData)
                        _this.dataNode.userData = {};
                    _this.dataNode.userData[_this.ctx.taskid] = it;
                }
                else
                    it.modified = true;
                modify(it.data);
                return it.data;
            };
            var paretScope = $scope.$parent;
            if (paretScope && paretScope.ts && paretScope.ts.product) {
                this.parent = paretScope.ts;
                this.product = paretScope.ts.product;
                this.parent.child = this;
            }
            else if ($loadedProduct)
                this.product = $loadedProduct;
            else
                throw 'something wrong';
            this.dataNode = this.product.nodeDir[this.ctx[dataNodeUrlParName]];
            //inicializace persistence
            var ud = this.getPersistData();
            if (!ud)
                ud = this.setPersistData(function (ud) {
                    _this.log('initPersistData');
                    _this.initPersistData(ud);
                });
            //this.log('createChild');
            //this.createChild(ud);
        }
        //********************** Virtualni procs
        //inicialni naplneni user dat  (pri jejich prvnim vytvoreni)
        taskController.prototype.initPersistData = function (ud) {
            ud.url = this.dataNode.url;
        };
        //posun stavu dal
        taskController.prototype.moveForward = function (ud) { throw 'notimplemented'; };
        //vytvoreni child status na zaklade aktualniho stavu
        taskController.prototype.createChild = function (ud) { throw 'notimplemented'; };
        taskController.prototype.getName = function () { return ''; };
        taskController.prototype.log = function (msg) {
            console.log('%%% ' + Utils.getObjectClassName(this) + ": " + msg + ' (' + this.dataNode.url + ')');
        };
        //posun zelenou sipkou
        taskController.prototype.goAhead = function () {
            var ud = this.getPersistData();
            if (ud.done)
                return false;
            if (this.child) {
                if (this.child.goAhead()) {
                    this.addToHistory(this.child, ud);
                    return true;
                }
                this.log('doMoveForward, child finished'); //... ne musim jej udelat sam
            }
            else {
                this.log('doMoveForward');
            }
            var error = this.moveForward(ud); //posun stav dopredu
            if (error)
                throw error;
            this.createChild(ud);
            return !ud.done;
        };
        taskController.prototype.addToHistory = function (child, ud) {
            if (!ud.history)
                ud.history = [];
            var hist = { date: Utils.nowToNum(), url: child.dataNode.url, taskId: child.ctx.taskid };
            if (_.find(ud.history, function (h) { return h.url == hist.url && h.taskId == hist.taskId; }))
                return;
            ud.history.push(hist);
        };
        taskController.prototype.href = function (state, params) {
            return this.$state.href(state, params);
        };
        taskController.$inject = ['$scope', '$state'];
        return taskController;
    })(controllerLow);
    blended.taskController = taskController;
    var pretestTaskController = (function (_super) {
        __extends(pretestTaskController, _super);
        function pretestTaskController() {
            _super.apply(this, arguments);
        }
        pretestTaskController.prototype.initPersistData = function (ud) {
            _super.prototype.initPersistData.call(this, ud);
            ud.actLevel = blended.levelIds.A2;
            ud.urls = [];
            ud.urls.push(this.actRepo(blended.levelIds.A2).url);
        };
        pretestTaskController.prototype.moveForward = function (ud) {
            var actTestItem = (this.child);
            var actRepo = this.actRepo(ud.actLevel);
            var childUser = actTestItem.getPersistData();
            if (!childUser.done || actTestItem.dataNode.url != actRepo.url)
                return 'tasks.pretestTask.doGoAhead: !testUser.done || testUser.url != actRepo.url';
            if (actRepo.level == blended.levelIds.A1) {
                this.finishPretest(ud, blended.levelIds.A1);
            }
            else if (actRepo.level == blended.levelIds.A2) {
                if (childUser.score >= actRepo.minScore && childUser.score < actRepo.maxScore)
                    this.finishPretest(ud, blended.levelIds.A2);
                else if (childUser.score < actRepo.minScore)
                    this.newTestItem(ud, blended.levelIds.A1);
                else
                    this.newTestItem(ud, blended.levelIds.B1);
            }
            else if (actRepo.level == blended.levelIds.B1) {
                if (childUser.score >= actRepo.minScore && childUser.score < actRepo.maxScore)
                    this.finishPretest(ud, blended.levelIds.B1);
                else if (childUser.score < actRepo.minScore)
                    this.finishPretest(ud, blended.levelIds.A2);
                else
                    this.newTestItem(ud, blended.levelIds.B2);
            }
            else if (actRepo.level == blended.levelIds.B2) {
                if (childUser.score < actRepo.minScore)
                    this.finishPretest(ud, blended.levelIds.B1);
                else
                    this.finishPretest(ud, blended.levelIds.B2);
            }
            return null;
        };
        pretestTaskController.prototype.createChild = function (ud) {
            var act = _.find(this.dataNode.Items, function (l) { return l.level == ud.actLevel; });
            if (!act)
                throw '!act';
            //????? TODO this.child = new moduleTask(act, this.ctx);
        };
        pretestTaskController.prototype.newTestItem = function (ud, lev) {
            ud.actLevel = lev;
            ud.urls.push(this.actRepo(lev).url);
        };
        pretestTaskController.prototype.finishPretest = function (ud, lev) {
            ud.done = true;
            ud.targetLevel = lev;
            this.child = null;
        };
        pretestTaskController.prototype.actRepo = function (lev) { return _.find(this.dataNode.Items, function (l) { return l.level == lev; }); };
        pretestTaskController.prototype.getName = function () { return vyzva.stateNames.taskPretest; };
        return pretestTaskController;
    })(taskController);
    blended.pretestTaskController = pretestTaskController;
    var moduleTaskController = (function (_super) {
        __extends(moduleTaskController, _super);
        function moduleTaskController() {
            _super.apply(this, arguments);
        }
        moduleTaskController.prototype.initPersistData = function (ud) {
            _super.prototype.initPersistData.call(this, ud);
        };
        moduleTaskController.prototype.moveForward = function (ud) { ud.done = true; return null; };
        moduleTaskController.prototype.createChild = function (ud) { };
        return moduleTaskController;
    })(taskController);
    blended.moduleTaskController = moduleTaskController;
    var exerciseTaskController = (function (_super) {
        __extends(exerciseTaskController, _super);
        function exerciseTaskController() {
            _super.apply(this, arguments);
        }
        exerciseTaskController.prototype.initPersistData = function (ud) {
            _super.prototype.initPersistData.call(this, ud);
        };
        exerciseTaskController.prototype.moveForward = function (ud) { ud.done = true; return null; };
        exerciseTaskController.prototype.createChild = function (ud) { };
        return exerciseTaskController;
    })(taskController);
    blended.exerciseTaskController = exerciseTaskController;
})(blended || (blended = {}));
