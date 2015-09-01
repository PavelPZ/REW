var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var blended;
(function (blended) {
    var controller = (function () {
        function controller(stateService) {
            this.ctx = stateService.params;
            this.$scope = stateService.$scope;
            this.state = stateService.current;
            if (this.$scope)
                this.$scope.state = this.state;
            this.parent = stateService.parent;
        }
        controller.prototype.href = function (url) {
            return this.ctx.$state.href(url.stateName, url.pars);
        };
        controller.prototype.navigate = function (url) {
            if (!url)
                return;
            var hash = this.href(url);
            setTimeout(function () { return window.location.hash = hash; }, 1);
        };
        controller.prototype.navigateWrapper = function () {
            var self = this;
            return function (stateName) { return self.navigate({ stateName: stateName, pars: self.ctx }); };
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
            while (t.state.name != blended.prodStates.homeTask.name)
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
        return taskViewController;
    })(controller);
    blended.taskViewController = taskViewController;
    (function (moveForwardResult) {
        moveForwardResult[moveForwardResult["toParent"] = 0] = "toParent"; /*neumi se posunout dopredu, musi se volat moveForward parenta*/
        moveForwardResult[moveForwardResult["selfAdjustChild"] = 1] = "selfAdjustChild"; /*posunuto dopredu, nutno spocitat goCurrent a skocit na jiny task*/
        moveForwardResult[moveForwardResult["selfInnner"] = 2] = "selfInnner"; /*posun osetren v ramci zmeny stavu aktualniho tasku (bez nutnosti navigace na jiny task)*/
    })(blended.moveForwardResult || (blended.moveForwardResult = {}));
    var moveForwardResult = blended.moveForwardResult;
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
        //********************** GREEN MANAGEMENT
        // Zelena sipka je prirazena nejakemu ACT_TASK (Pretest nebo Lesson ve VYZVA aplikaci apod.)
        // Zelena sipka neni videt, musi se skocit do tasku pomoci ACT_TASK.goCurrent
        // Pak je videt a pri kliku na sipku se vola ACT_TASK.goAhead 
        // Vrati-li ACT_TASK.goAhead null, skoci se na home produktu
        // **** goCurrent
        // PARENT na zaklade USER dat svych childu urcuje, ktery z nich je narade (pomoci funkce PARENT.adjustChild)
        // skace se na posledni child, co vrati adjustChild() null
        //Fake dodelavka TASKLIST (pridanim taskuu s 'createMode=createControllerModes.adjustChild') tak, aby posledni v rade byl task, na ktery se skace.
        //Sance parent tasku prenest zodpovednost na child.
        //Klicove je do childUrl tasku doplnit spravny task.ctx, aby v goCurrent fungovalo 'return { stateName: t.state.name, pars: t.ctx }'
        taskController.prototype.adjustChild = function () { return null; };
        //posun stavu dal
        taskController.prototype.moveForward = function () { throw 'notimplemented'; };
        //priznak pro 'if (t.taskControllerSignature)' test, ze tento objekt je task.
        taskController.prototype.taskControllerSignature = function () { };
        //nevirtualni funkce: dobuduje TASKLIST umele vytvorenymi tasks (pomoci adjust Child) a vrati URL posledniho child v TASKLIST.
        taskController.prototype.goCurrent = function () {
            var t = this;
            while (t) {
                var newt = t.adjustChild();
                if (!newt)
                    return { stateName: t.state.name, pars: t.ctx };
                t = newt;
            }
        };
        taskController.prototype.navigateAhead = function () {
            this.navigate(this.goAhead());
        };
        taskController.prototype.goAhead = function () {
            //seznam od childs k this
            var taskList = [];
            var act = this;
            while (act) {
                if (!act.taskControllerSignature)
                    break;
                taskList.push(act);
                act = act.child;
            }
            //najdi prvni task, co se umi posunout dopredu
            for (var i = taskList.length - 1; i >= 0; i--) {
                var act = taskList[i];
                switch (act.moveForward()) {
                    case moveForwardResult.selfInnner: return null;
                    case moveForwardResult.toParent: break;
                    case moveForwardResult.selfAdjustChild: return act.goCurrent();
                }
            }
            //ani jeden z parentu move nevyresil => jdi na home produktu
            return { stateName: blended.prodStates.home.name, pars: this.ctx };
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
            var ud = this.user.short;
            if (ud.done)
                return null;
            var actModule = this.actRepo(ud.actLevel);
            if (!actModule)
                throw '!actModule';
            var state = {
                params: blended.cloneAndModifyContext(this.ctx, function (d) { return d.moduleurl = blended.encodeUrl(actModule.url); }),
                parent: this,
                current: blended.prodStates.pretestModule,
                createMode: blended.createControllerModes.adjustChild
            };
            return new moduleTaskController(state);
        };
        pretestTaskController.prototype.moveForward = function () {
            var ud = this.user.short;
            var actTestItem = (this.child);
            var actRepo = this.actRepo(ud.actLevel);
            if (actTestItem.dataNode != actRepo)
                throw 'actTestItem.dataNode != actRepo';
            var childSummary = blended.agregateChildShortInfos(this.child.dataNode, this.ctx.taskid, actTestItem.state.moduleAlowFinishWhenUndone /*do vyhodnoceni zahrn i nehotova cviceni*/);
            if (!childSummary.done)
                throw '!childUser.done';
            var score = blended.scorePercent(childSummary);
            if (actRepo.level == blended.levelIds.A1) {
                return this.finishPretest(ud, blended.levelIds.A1);
            }
            else if (actRepo.level == blended.levelIds.A2) {
                if (score >= actRepo.min && score < actRepo.max)
                    return this.finishPretest(ud, blended.levelIds.A2);
                else if (score < actRepo.min)
                    return this.newTestItem(ud, blended.levelIds.A1);
                else
                    return this.newTestItem(ud, blended.levelIds.B1);
            }
            else if (actRepo.level == blended.levelIds.B1) {
                if (score >= actRepo.min && score < actRepo.max)
                    return this.finishPretest(ud, blended.levelIds.B1);
                else if (score < actRepo.min)
                    return this.finishPretest(ud, blended.levelIds.A2);
                else
                    return this.newTestItem(ud, blended.levelIds.B2);
            }
            else if (actRepo.level == blended.levelIds.B2) {
                if (score < actRepo.min)
                    return this.finishPretest(ud, blended.levelIds.B1);
                else
                    return this.finishPretest(ud, blended.levelIds.B2);
            }
            throw 'not implemented';
        };
        pretestTaskController.prototype.newTestItem = function (ud, lev) {
            this.user.modified = true;
            ud.actLevel = lev;
            ud.urls.push(this.actRepo(lev).url);
            return moveForwardResult.selfAdjustChild;
        };
        pretestTaskController.prototype.finishPretest = function (ud, lev) {
            this.user.modified = true;
            ud.done = true;
            ud.targetLevel = lev;
            delete ud.actLevel;
            return moveForwardResult.toParent;
        };
        pretestTaskController.prototype.actRepo = function (lev) { return _.find(this.dataNode.Items, function (l) { return l.level == lev; }); };
        return pretestTaskController;
    })(taskController);
    blended.pretestTaskController = pretestTaskController;
    function moduleIsDone(nd, taskId) {
        return !_.find(nd.Items, function (it) { var itUd = blended.getPersistData(it, taskId); return (!itUd || !itUd.done); });
    }
    blended.moduleIsDone = moduleIsDone;
    var moduleTaskController = (function (_super) {
        __extends(moduleTaskController, _super);
        function moduleTaskController(state) {
            _super.call(this, state);
            this.user = blended.getPersistWrapper(this.dataNode, this.ctx.taskid, function () { return { done: false, actChildIdx: 0 }; });
        }
        moduleTaskController.prototype.adjustChild = function () {
            var _this = this;
            var ud = this.user.short;
            var exNode;
            if (!this.state.moduleAlowCycleExercise) {
                exNode = _.find(this.dataNode.Items, function (it) { var itUd = blended.getPersistData(it, _this.ctx.taskid); return (!itUd || !itUd.done); });
            }
            else {
                exNode = this.dataNode.Items[ud.actChildIdx];
            }
            if (!exNode)
                throw 'something wrong';
            var state = {
                params: blended.cloneAndModifyContext(this.ctx, function (d) { return d.url = blended.encodeUrl(exNode.url); }),
                parent: this,
                current: blended.prodStates.pretestExercise,
                createMode: blended.createControllerModes.adjustChild
            };
            return new vyzva.pretestExercise(state, null);
        };
        moduleTaskController.prototype.moveForward = function () {
            var _this = this;
            var ud = this.user.short;
            if (ud.done)
                return moveForwardResult.toParent; //modul explicitne ukoncen (napr. tlacitkem Finish u testu).
            if (this.state.moduleAlowCycleExercise) {
                ud.actChildIdx == this.dataNode.Items.length - 1 ? 0 : ud.actChildIdx + 1;
                this.user.modified = true;
                return moveForwardResult.selfAdjustChild;
            }
            else {
                var exNode = _.find(this.dataNode.Items, function (it) { var itUd = blended.getPersistData(it, _this.ctx.taskid); return (!itUd || !itUd.done); });
                return exNode ? moveForwardResult.selfAdjustChild : moveForwardResult.toParent;
            }
        };
        return moduleTaskController;
    })(taskController);
    blended.moduleTaskController = moduleTaskController;
})(blended || (blended = {}));
