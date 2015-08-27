var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var blended;
(function (blended) {
    var controller = (function () {
        function controller(state) {
            this.ctx = state.params;
            this.$scope = state.$scope;
            blended.finishContext(this.ctx);
            $.extend(this, state.current.data);
            this.myState = state.current;
            this.parent = state.parent;
        }
        controller.prototype.href = function (url) {
            return this.ctx.$state.href(url.stateName, url.pars);
        };
        controller.prototype.navigate = function (url) {
            var hash = this.href(url);
            setTimeout(function () { return window.location.hash = hash; }, 1);
        };
        controller.prototype.taskList = function () {
            var t = this.taskRoot();
            var res = [];
            while (t) {
                res.push(t);
                t = t.child;
            }
            return res;
        };
        controller.prototype.taskRoot = function () {
            var t = this;
            while (t.myState.name != blended.prodStates.homeTask.name)
                t = t.parent;
            return t;
        };
        controller.prototype.wrongUrlRedirect = function (url) {
            if (!url)
                return;
            this.isWrongUrl = true;
            setTimeout(this.navigate(url), 1);
        };
        return controller;
    })();
    blended.controller = controller;
    //******* TASK VIEW - predchudce vsech controllers, co maji vizualni podobu (html stranku)
    var taskViewController = (function (_super) {
        __extends(taskViewController, _super);
        function taskViewController(state) {
            _super.call(this, state);
            this.title = this.parent.dataNode.title;
        }
        taskViewController.prototype.gotoHomeUrl = function () { Pager.gotoHomeUrl(); };
        return taskViewController;
    })(controller);
    blended.taskViewController = taskViewController;
    //******* TASK (predchudce vse abstraktnich controllers (mimo cviceni), reprezentujicich TASK). Task umi obslouzit zelenou sipku apod.
    var taskController = (function (_super) {
        __extends(taskController, _super);
        //********************* 
        function taskController(state, resolves) {
            _super.call(this, state);
            if (!state.current.dataNodeUrlParName)
                return;
            //provaz parent - child
            var paretScope = this.parent = state.parent;
            if (paretScope)
                paretScope.child = this;
            //dataNode
            var taskoot = this.taskRoot();
            if (taskoot == this) {
                this.dataNode = (resolves[0]);
            }
            else {
                this.dataNode = this.taskRoot().dataNode.nodeDir[this.ctx[state.current.dataNodeUrlParName]];
            }
            if (!this.dataNode)
                throw '!this.dataNode';
            //user data
            this.user = blended.getPersistWrapper(this.dataNode, this.ctx.taskid);
        }
        //********************** Virtualni procs
        //dodelej task list do green stavu
        taskController.prototype.adjustChild = function () { };
        //posun stavu dal
        taskController.prototype.moveForward = function (ud) { throw 'notimplemented'; };
        //done priznak
        taskController.prototype.isDone = function () { throw 'notimplemented'; };
        taskController.prototype.goCurrent = function () {
            var t = this;
            while (t) {
                t.adjustChild();
                if (!t.child)
                    return { stateName: t.myState.name, pars: t.ctx };
                t = t.child;
            }
        };
        //posun zelenou sipkou. Child Musi byt adjusted (goCurrent -> goAhead -> goAhead...)
        taskController.prototype.goAhead = function () {
            var ud = this.user.short;
            if (this.isDone())
                return null;
            if (this.child) {
                var childUrl = this.child.goAhead();
                if (childUrl)
                    return childUrl; //... ano, posun udelal child
                this.log('doMoveForward, child finished'); //... ne musim jej udelat sam
            }
            else {
                this.log('doMoveForward');
            }
            this.moveForward(ud); //posun stav dopredu
            if (this.isDone())
                return null;
            return this.goCurrent();
        };
        taskController.prototype.log = function (msg) {
            console.log('%%% ' + Utils.getObjectClassName(this) + ": " + msg + ' (' + this.dataNode.url + ')');
        };
        return taskController;
    })(controller);
    blended.taskController = taskController;
    //****************** PRODUCT HOME
    var homeTaskController = (function (_super) {
        __extends(homeTaskController, _super);
        function homeTaskController() {
            _super.apply(this, arguments);
        }
        return homeTaskController;
    })(taskController);
    blended.homeTaskController = homeTaskController;
    var pretestTaskController = (function (_super) {
        __extends(pretestTaskController, _super);
        function pretestTaskController(state) {
            var _this = this;
            _super.call(this, state);
            //sance prerusit navigaci
            this.user = blended.getPersistWrapper(this.dataNode, this.ctx.taskid, function () {
                return { actLevel: blended.levelIds.A2, urls: [_this.actRepo(blended.levelIds.A2).url], targetLevel: -1, done: false };
            });
            if (state.createMode != blended.createControllerModes.navigate)
                return;
            this.wrongUrlRedirect(this.checkCommingUrl());
        }
        pretestTaskController.prototype.isDone = function () { return this.user.short.done; };
        pretestTaskController.prototype.checkCommingUrl = function () {
            var ud = this.user.short;
            if (!ud)
                return { stateName: blended.prodStates.home.name, pars: this.ctx }; //pretest jeste nezacal => goto product home
            if (ud.done)
                return null; //done pretest: vse je povoleno
            var dataNode = this.dataNode;
            var actModule = dataNode.Items[ud.actLevel];
            var actEx = this.taskRoot().dataNode.nodeDir[this.ctx.Url];
            if (actModule.url != actEx.parent.url) {
                var pars = blended.cloneAndModifyContext(this.ctx, function (c) { return c.moduleurl = blended.encodeUrl(actModule.url); });
                return { stateName: blended.prodStates.home.name, pars: pars }; //v URL je adresa jineho nez aktivniho modulu (asi pomoci back) => jdi na prvni cviceni aktualniho modulu
            }
            return null;
        };
        pretestTaskController.prototype.adjustChild = function () {
            if (this.child)
                return;
            var ud = this.user.short;
            if (ud.done)
                return;
            var actModule = this.actRepo(ud.actLevel);
            if (!actModule)
                throw '!actModule';
            var state = {
                params: blended.cloneAndModifyContext(this.ctx, function (d) { return d.moduleurl = blended.encodeUrl(actModule.url); }),
                parent: this,
                current: blended.prodStates.pretestModule,
                createMode: blended.createControllerModes.adjustChild
            };
            this.child = new moduleTaskController(state);
        };
        pretestTaskController.prototype.moveForward = function (ud) {
            var actTestItem = (this.child);
            var actRepo = this.actRepo(ud.actLevel);
            var childSummary = blended.agregateChildShortInfos(this.child.dataNode, this.ctx.taskid);
            if (!childSummary.done || actTestItem.dataNode.url != actRepo.url)
                throw '!childUser.done || actTestItem.dataNode.parent.url != actRepo.url';
            var score = blended.scorePercent(childSummary);
            if (actRepo.level == blended.levelIds.A1) {
                this.finishPretest(ud, blended.levelIds.A1);
            }
            else if (actRepo.level == blended.levelIds.A2) {
                if (score >= actRepo.minScore && score < actRepo.maxScore)
                    this.finishPretest(ud, blended.levelIds.A2);
                else if (score < actRepo.minScore)
                    this.newTestItem(ud, blended.levelIds.A1);
                else
                    this.newTestItem(ud, blended.levelIds.B1);
            }
            else if (actRepo.level == blended.levelIds.B1) {
                if (score >= actRepo.minScore && score < actRepo.maxScore)
                    this.finishPretest(ud, blended.levelIds.B1);
                else if (score < actRepo.minScore)
                    this.finishPretest(ud, blended.levelIds.A2);
                else
                    this.newTestItem(ud, blended.levelIds.B2);
            }
            else if (actRepo.level == blended.levelIds.B2) {
                if (score < actRepo.minScore)
                    this.finishPretest(ud, blended.levelIds.B1);
                else
                    this.finishPretest(ud, blended.levelIds.B2);
            }
        };
        pretestTaskController.prototype.newTestItem = function (ud, lev) {
            this.child = null;
            ud.actLevel = lev;
            ud.urls.push(this.actRepo(lev).url);
        };
        pretestTaskController.prototype.finishPretest = function (ud, lev) {
            this.child = null;
            ud.done = true;
            ud.targetLevel = lev;
            delete ud.actLevel;
        };
        pretestTaskController.prototype.actRepo = function (lev) { return _.find(this.dataNode.Items, function (l) { return l.level == lev; }); };
        return pretestTaskController;
    })(taskController);
    blended.pretestTaskController = pretestTaskController;
    var moduleTaskController = (function (_super) {
        __extends(moduleTaskController, _super);
        function moduleTaskController(state) {
            _super.call(this, state);
            this.user = blended.getPersistWrapper(this.dataNode, this.ctx.taskid, function () { return { done: false, actChildIdx: 0 }; });
        }
        moduleTaskController.prototype.isDone = function () {
            var _this = this;
            return !_.find(this.dataNode.Items, function (it) { var itUd = blended.getPersistData(it, _this.ctx.taskid); return (!itUd || !itUd.done); });
        };
        moduleTaskController.prototype.adjustChild = function () {
            var _this = this;
            if (this.child)
                return;
            var ud = this.user.short;
            var exNode;
            if (!this.alowCycleExercise) {
                exNode = _.find(this.dataNode.Items, function (it) { var itUd = blended.getPersistData(it, _this.ctx.taskid); return (!itUd || !itUd.done); });
            }
            else {
                exNode = this.dataNode.Items[ud.actChildIdx];
            }
            if (!exNode)
                return;
            var state = {
                params: blended.cloneAndModifyContext(this.ctx, function (d) { return d.url = blended.encodeUrl(exNode.url); }),
                parent: this,
                current: blended.prodStates.pretestExercise,
                createMode: blended.createControllerModes.adjustChild
            };
            this.child = new vyzva.pretestExercise(state, null);
        };
        moduleTaskController.prototype.moveForward = function (ud) {
            var ud = this.user.short;
            if (this.alowCycleExercise) {
                ud.actChildIdx = ud.actChildIdx == this.dataNode.Items.length - 1 ? 0 : ud.actChildIdx + 1;
                this.user.modified = true;
            }
            this.child = null;
        };
        return moduleTaskController;
    })(taskController);
    blended.moduleTaskController = moduleTaskController;
})(blended || (blended = {}));
