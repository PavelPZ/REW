var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var blended;
(function (blended) {
    blended.taskContextAs = {
        product: 'productParent',
        pretest: 'pretestParent',
        module: 'moduleParent',
        ex: 'exParent',
        lector: 'lectorParent',
    };
    function extendTaskContext($scope, task) {
        for (var p in blended.taskContextAs) {
            var propName = blended.taskContextAs[p];
            var value = $scope[propName];
            if (value)
                task[propName] = $scope[propName];
        }
    }
    blended.extendTaskContext = extendTaskContext;
    var controller = (function () {
        function controller($scope, $state) {
            var stateService = this.getStateService($scope);
            if (stateService) {
                this.isFakeCreate = true;
                this.ctx = stateService.params;
                blended.finishContext(this.ctx);
                //this.parent = stateService.parent;
                this.state = stateService.current;
                extendTaskContext(stateService.parent, this);
                return;
            }
            this.$scope = $scope;
            this.$state = $state;
            extendTaskContext(this.$scope, this);
            this.ctx = $state.params;
            blended.finishContext(this.ctx);
            //this.ctx.$state = $state;
            this.$scope['ts'] = this;
            var st = $state.current;
            var constr = this.constructor;
            while (st) {
                if (st.controller == constr) {
                    this.state = st;
                    break;
                }
                st = st.parent;
            }
            this.$scope.state = this.state;
            //this.parent = this.$scope.$parent['ts'];
        }
        controller.prototype.getStateService = function ($scope) { return !!$scope['current'] ? $scope : null; };
        controller.prototype.href = function (url) {
            return this.$state.href(url.stateName, url.pars);
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
        controller.prototype.navigateWebHome = function () { Pager.gotoHomeUrl(); };
        controller.prototype.navigateReturnUrl = function () { location.href = this.ctx.returnurl; };
        controller.prototype.getProductHomeUrl = function () { return { stateName: blended.prodStates.home.name, pars: this.ctx }; };
        controller.prototype.navigateProductHome = function () { this.navigate(this.getProductHomeUrl()); };
        controller.prototype.wrongUrlRedirect = function (url) {
            if (!url)
                return;
            this.isWrongUrl = true;
            setTimeout(this.navigate(url), 1);
        };
        controller.$inject = ['$scope', '$state'];
        return controller;
    })();
    blended.controller = controller;
    //******* TASK VIEW - predchudce vsech controllers, co maji vizualni podobu (html stranku)
    var taskViewController = (function (_super) {
        __extends(taskViewController, _super);
        function taskViewController($scope, $state) {
            _super.call(this, $scope, $state);
            this.myTask = this.isFakeCreate ? $scope.parent : $scope.$parent['ts'];
            this.title = this.myTask.dataNode.title;
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
        //parent: taskController;
        //isProductHome: boolean;
        //********************* 
        function taskController($scope, $state) {
            _super.call(this, $scope, $state);
            //constructor(state: IStateService, resolves?: Array<any>) {
            //    super(state);
            if (!this.state.dataNodeUrlParName)
                return;
            //provaz parent - child
            //if (this.parent) this.parent.child = this;
            //var parentTask = this.parent = (<ng.IScope>$scope).$parent['ts']; if (parentTask) parentTask.child = this;
            //dataNode
            if (this.productParent) {
                this.dataNode = this.productParent.dataNode.nodeDir[this.ctx[this.state.dataNodeUrlParName]];
                this.user = blended.getPersistWrapper(this.dataNode, this.ctx.taskid);
            }
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
        taskController.prototype.moveForward = function (sender) { throw 'notimplemented'; };
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
        taskController.prototype.navigateAhead = function (sender) {
            this.navigate(this.goAhead(sender));
        };
        taskController.prototype.goAhead = function (sender) {
            var task = sender;
            while (true) {
                switch (task.moveForward(sender)) {
                    case moveForwardResult.selfInnner: return null;
                    case moveForwardResult.toParent:
                        if (task == task.exParent) {
                            task = task.moduleParent;
                            continue;
                        }
                        if (task == task.moduleParent && task.pretestParent) {
                            task = task.pretestParent;
                            continue;
                        }
                        return this.getProductHomeUrl(); //{ stateName: prodStates.home.name, pars: this.ctx }
                    case moveForwardResult.selfAdjustChild: return task.goCurrent();
                }
            }
            //seznam od childs k this
            //var taskList: Array<taskController> = [];
            //var act = this; while (act) {
            //  if (!act.taskControllerSignature) break;
            //  taskList.push(act);
            //  act = act.child;
            //}
            ////najdi prvni task, co se umi posunout dopredu: jdi od spodu nahoru
            //for (var i = taskList.length - 1; i >= 0; i--) {
            //  var act = taskList[i];
            //  switch (act.moveForward()) {
            //    case moveForwardResult.selfInnner: return null;
            //    case moveForwardResult.toParent: break;
            //    case moveForwardResult.selfAdjustChild: return act.goCurrent();
            //  }
            //}
            ////ani jeden z parentu move nevyresil => jdi na home produktu
            //return { stateName: prodStates.home.name, pars: this.ctx }
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
        function homeTaskController($scope, $state, product) {
            _super.call(this, $scope, $state);
            this.dataNode = product;
        }
        return homeTaskController;
    })(taskController);
    blended.homeTaskController = homeTaskController;
    function pretestScore(dataNode, user, taskId) {
        if (!user || !user.done)
            return null;
        var users = _.map(user.history, function (l) { return blended.agregateShortFromNodes(dataNode.Items[l], taskId); });
        return blended.agregateShorts(users);
    }
    blended.pretestScore = pretestScore;
    var pretestTaskController = (function (_super) {
        __extends(pretestTaskController, _super);
        //inCongratulation: boolean; //priznak, ze modul byl prave preveden do stavu DONE a ukazuje se congratulation dialog
        function pretestTaskController($scope, $state) {
            _super.call(this, $scope, $state);
            this.pretestParent = this;
            //sance prerusit navigaci
            this.user = blended.getPersistWrapper(this.dataNode, this.ctx.taskid, function () {
                return { actLevel: blended.levelIds.A2, history: [blended.levelIds.A2], targetLevel: -1, done: false };
            });
            if (this.isFakeCreate)
                return;
            this.wrongUrlRedirect(this.checkCommingUrl());
        }
        pretestTaskController.prototype.checkCommingUrl = function () {
            var ud = this.user.short;
            if (!ud)
                return this.getProductHomeUrl(); //{ stateName: prodStates.home.name, pars: this.ctx }; //pretest jeste nezacal => goto product home
            if (ud.done)
                return null; //done pretest: vse je povoleno
            var dataNode = this.dataNode;
            var actModule = dataNode.Items[ud.actLevel];
            var actEx = this.productParent.dataNode.nodeDir[this.ctx.Url];
            if (actModule.url != actEx.parent.url) {
                var pars = blended.cloneAndModifyContext(this.ctx, function (c) { return c.moduleurl = blended.encodeUrl(actModule.url); });
                return this.getProductHomeUrl(); //{ stateName: prodStates.home.name, pars: pars }; //v URL je adresa jineho nez aktivniho modulu (asi pomoci back) => jdi na prvni cviceni aktualniho modulu
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
            };
            return new blended.moduleTaskController(state);
        };
        pretestTaskController.prototype.moveForward = function (sender) {
            //if (this.inCongratulation) { delete this.inCongratulation; return moveForwardResult.toParent; }
            var ud = this.user.short;
            var actTestItem = sender.moduleParent; // <exerciseTaskViewController>(this.child);
            var actRepo = this.actRepo(ud.actLevel);
            if (actTestItem.dataNode != actRepo)
                throw 'actTestItem.dataNode != actRepo';
            var childSummary = blended.agregateShortFromNodes(actTestItem.dataNode, this.ctx.taskid);
            if (!childSummary.done)
                throw '!childUser.done';
            var score = blended.scorePercent(childSummary);
            if (actRepo.level == blended.levelIds.A1) {
                return this.finishPretest(sender, ud, blended.levelIds.A1);
            }
            else if (actRepo.level == blended.levelIds.A2) {
                if (score >= actRepo.min && score < actRepo.max)
                    return this.finishPretest(sender, ud, blended.levelIds.A2);
                else if (score < actRepo.min)
                    return this.newTestItem(ud, blended.levelIds.A1);
                else
                    return this.newTestItem(ud, blended.levelIds.B1);
            }
            else if (actRepo.level == blended.levelIds.B1) {
                if (score >= actRepo.min && score < actRepo.max)
                    return this.finishPretest(sender, ud, blended.levelIds.B1);
                else if (score < actRepo.min)
                    return this.finishPretest(sender, ud, blended.levelIds.A2);
                else
                    return this.newTestItem(ud, blended.levelIds.B2);
            }
            else if (actRepo.level == blended.levelIds.B2) {
                if (score < actRepo.min)
                    return this.finishPretest(sender, ud, blended.levelIds.B1);
                else
                    return this.finishPretest(sender, ud, blended.levelIds.B2);
            }
            throw 'not implemented';
        };
        pretestTaskController.prototype.newTestItem = function (ud, lev) {
            this.user.modified = true;
            ud.actLevel = lev;
            ud.history.push(lev);
            return moveForwardResult.selfAdjustChild;
        };
        pretestTaskController.prototype.finishPretest = function (sender, ud, lev) {
            var _this = this;
            this.user.modified = true;
            ud.done = true;
            ud.targetLevel = lev;
            delete ud.actLevel;
            sender.congratulationDialog().then(function () { return _this.navigateProductHome(); }, function () { return _this.navigateProductHome(); });
            //this.inCongratulation = true;
            return moveForwardResult.selfInnner;
        };
        pretestTaskController.prototype.actRepo = function (lev) { return _.find(this.dataNode.Items, function (l) { return l.level == lev; }); };
        return pretestTaskController;
    })(taskController);
    blended.pretestTaskController = pretestTaskController;
})(blended || (blended = {}));
