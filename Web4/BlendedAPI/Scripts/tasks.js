var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var blended;
(function (blended) {
    //******* TASK VIEW
    var taskViewController = (function () {
        function taskViewController(state) {
            this.ctx = state.params;
            blended.finishContext(this.ctx);
            $.extend(this, state.current.data);
            this.myTask = state.parent;
            this.title = this.myTask.dataNode.title;
        }
        taskViewController.prototype.gotoHomeUrl = function () { Pager.gotoHomeUrl(); };
        return taskViewController;
    })();
    blended.taskViewController = taskViewController;
    //******* GREEN PROXY 
    //export class greenProxy {
    //  constructor(public dataNode: CourseMeta.data, public ctx: learnContext) { }
    //  getChild(): IStateUrl { throw 'notimplemented'; }
    //  getPersistData: () => IPersistNodeUser = () => {
    //    return getPersistData(this.dataNode, this.ctx.taskid);
    //  }
    //}
    //******* TASK 
    var taskController = (function () {
        //********************** 
        function taskController(state) {
            var _this = this;
            //static $inject = ['$scope', '$state'];
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
            this.doInitPersistData = function () {
                var ud = _this.getPersistData();
                if (!ud)
                    ud = _this.setPersistData(function (ud) {
                        _this.log('initPersistData');
                        _this.initPersistData(ud);
                    });
                return ud;
            };
            if (!state.current.dataNodeUrlParName)
                return;
            this.ctx = state.params;
            blended.finishContext(this.ctx);
            this.product = blended.loader.productCache.fromCache(this.ctx);
            if (!this.product)
                return;
            var paretScope = this.parent = state.parent;
            if (paretScope)
                paretScope.child = this;
            this.dataNode = this.product.nodeDir[this.ctx[state.current.dataNodeUrlParName]];
            if (state.canModifyUserData)
                this.doInitPersistData();
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
        //getName(): string { return ''; }
        taskController.prototype.modifyTargetState = function () { return null; };
        taskController.prototype.log = function (msg) {
            console.log('%%% ' + Utils.getObjectClassName(this) + ": " + msg + ' (' + this.dataNode.url + ')');
        };
        //posun zelenou sipkou
        //goAhead(): boolean {
        //  var ud = this.getPersistData();
        //  if (ud.done) return false
        //  if (this.child) { //vyresi posun child?...
        //    if (this.child.goAhead()) { //... ano, posun udelal child
        //      this.addToHistory(this.child, ud);
        //      return true;
        //    }
        //    this.log('doMoveForward, child finished'); //... ne musim jej udelat sam
        //  } else {
        //    this.log('doMoveForward');
        //  }
        //  var error = this.moveForward(ud); //posun stav dopredu
        //  if (error) throw error;
        //  this.createChild(ud);
        //  return !ud.done;
        //}
        taskController.prototype.addToHistory = function (child, ud) {
            if (!ud.history)
                ud.history = [];
            var hist = { date: Utils.nowToNum(), url: child.dataNode.url, taskId: child.ctx.taskid };
            if (_.find(ud.history, function (h) { return h.url == hist.url && h.taskId == hist.taskId; }))
                return;
            ud.history.push(hist);
        };
        taskController.prototype.href = function (state, params) {
            //return this.ctx.$state.href(state, params);
            return '';
        };
        return taskController;
    })();
    blended.taskController = taskController;
    //export class pretestGreenProxy extends greenProxy {
    //  constructor(public dataNode: IPretestRepository, ctx: learnContext) {
    //    super(dataNode, ctx);
    //  }
    //  getPersistData: () => IPretestUser;
    //  getChild(): IStateUrl {
    //    var ud = this.getPersistData(); if (ud.done) return null;
    //    var act: IPretestItemRepository = _.find(this.dataNode.Items, l => l.level == ud.actLevel); if (!act) throw '!act';
    //    return new pretestItemGreenProxy(act, this.ctx).getChild();
    //  }
    //}
    //export class pretestItemGreenProxy extends greenProxy {
    //  constructor(public dataNode: IPretestItemRepository, ctx: learnContext) {
    //    super(dataNode, ctx);
    //  }
    //  getPersistData: () => IModuleUser;
    //  getChild(): IStateUrl {
    //    var ud = this.getPersistData(); if (ud.done) return null;
    //    var node = _.find(this.dataNode.Items, it => {
    //      var nodeUd = blended.getPersistData(it, '*** TODO');
    //      return nodeUd != null && !nodeUd.done;
    //    });
    //    //return node ? new greenProxy(node, this.ctx) /*TODO*/: null;
    //  }
    //}
    var pretestState = (function (_super) {
        __extends(pretestState, _super);
        function pretestState(st, exerciseState) {
            _super.call(this, st);
            this.exerciseState = exerciseState;
        }
        return pretestState;
    })(blended.state);
    blended.pretestState = pretestState;
    //export interface IPretestStateData extends blended.IStateData {
    //  dataNode: IPretestRepository;
    //}
    var pretestTaskController = (function (_super) {
        __extends(pretestTaskController, _super);
        function pretestTaskController() {
            _super.apply(this, arguments);
        }
        pretestTaskController.prototype.initPersistData = function (ud) {
            _super.prototype.initPersistData.call(this, ud);
            ud.actLevel = blended.levelIds.A2;
            ud.urls = [this.actRepo(blended.levelIds.A2).url];
        };
        pretestTaskController.prototype.modifyTargetState = function () {
            var ud = this.getPersistData();
            //if (!ud) return { stateName: prodStates.home.name, pars: data.man.ctx }; //pretest jeste nezacal => goto home
            if (ud && ud.done)
                return null; //done pretest: vse je povoleno
            var dataNode = this.dataNode;
            ud = this.doInitPersistData();
            var actModule = dataNode.Items[ud.actLevel];
            if (actModule.url != this.ctx.moduleUrl) {
                var pars = blended.cloneAndModifyContext(this.ctx, function (c) {
                    c.moduleurl = blended.enocdeUrl(actModule.url);
                    c.url = blended.enocdeUrl(actModule.Items[0].url);
                });
                return { stateName: blended.prodStates.pretestExercise.name, pars: pars }; //v URL je adresa jineho nez aktivniho modulu (asi pomoci back) => jdi na prvni cviceni aktualniho modulu
            }
            return null;
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
