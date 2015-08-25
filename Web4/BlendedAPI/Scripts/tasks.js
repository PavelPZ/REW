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
            blended.finishContext(this.ctx);
            $.extend(this, state.current.data);
            this.myState = state.current;
            this.parent = state.parent;
            //if (state.createForCheckUrl == createControllerCtx.navigate) { //sance zkontrolovat spravnost URL adresy
            //  _.each(this.taskList(), t => {
            //    if (!t.checkCommingUrl) return;
            //    var url = t.checkCommingUrl(); if (!url) return;
            //  });
            //}
        }
        controller.prototype.href = function (url) {
            return this.ctx.$state.href(url.stateName, url.pars);
        };
        controller.prototype.navigate = function (url) {
            var hash = this.href(url);
            setTimeout(function () { return window.location.hash = hash; }, 1);
        };
        //test na validnost URL - sance presmerovat system jinam
        //checkCommingUrl: () => IStateUrl;
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
    //******* TASK VIEW
    var taskViewController = (function (_super) {
        __extends(taskViewController, _super);
        function taskViewController(state) {
            _super.call(this, state);
            this.ctx = state.params;
            blended.finishContext(this.ctx);
            $.extend(this, state.current.data);
            if (!this.ctx.$state)
                this.ctx.$state = this.parent.ctx.$state;
            this.title = this.parent.dataNode.title;
        }
        taskViewController.prototype.gotoHomeUrl = function () { Pager.gotoHomeUrl(); };
        return taskViewController;
    })(controller);
    blended.taskViewController = taskViewController;
    //******* TASK 
    var taskController = (function (_super) {
        __extends(taskController, _super);
        //********************* 
        function taskController(state) {
            var _this = this;
            _super.call(this, state);
            this.getPersistData = function () { return blended.getPersistData(_this.dataNode, _this.ctx.taskid); };
            this.setPersistData = function (modify) { return blended.setPersistData(_this.dataNode, _this.ctx.taskid, modify); };
            //var it = this.dataNode.userData ? this.dataNode.userData[this.ctx.taskid] : null;
            //if (!it) {
            //  it = { data: <any>{}, modified: true };
            //  if (!this.dataNode.userData) this.dataNode.userData = {};
            //  this.dataNode.userData[this.ctx.taskid] = it;
            //} else
            //  it.modified = true;
            //modify(it.data);
            //return it.data;
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
            this.ctx.product = blended.loader.productCache.fromCache(this.ctx);
            if (!this.ctx.product)
                return;
            var paretScope = this.parent = state.parent;
            if (paretScope) {
                paretScope.child = this;
                if (!this.ctx.$state)
                    this.ctx.$state = state.parent.ctx.$state;
            }
            this.dataNode = this.ctx.product.nodeDir[this.ctx[state.current.dataNodeUrlParName]];
            if (!this.dataNode)
                throw '!this.dataNode';
            //var wrongRedirect = this.checkCommingUrl();
            //if (wrongRedirect) {
            //  this.isWrongUrl = true;
            //  this.navigate(wrongRedirect);
            //  return;
            //}
            if (state.createForCheckUrl != blended.createControllerCtx.checkForUrl)
                this.doInitPersistData();
        }
        //********************** Virtualni procs
        //inicialni naplneni user dat  (pri jejich prvnim vytvoreni)
        taskController.prototype.initPersistData = function (ud) { ud.done = false; }; //ud.url = this.dataNode.url; }
        //dodelej task list do green stavu
        taskController.prototype.adjustChild = function () { };
        //posun stavu dal
        taskController.prototype.moveForward = function (ud) { throw 'notimplemented'; };
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
            var ud = this.getPersistData();
            if (ud.done)
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
            if (ud.done)
                return null;
            return this.goCurrent();
        };
        taskController.prototype.log = function (msg) {
            console.log('%%% ' + Utils.getObjectClassName(this) + ": " + msg + ' (' + this.dataNode.url + ')');
        };
        return taskController;
    })(controller);
    blended.taskController = taskController;
    var pretestTaskController = (function (_super) {
        __extends(pretestTaskController, _super);
        function pretestTaskController(state) {
            _super.call(this, state);
            //sance prerusit navigaci
            this.wrongUrlRedirect(this.checkCommingUrl());
        }
        pretestTaskController.prototype.checkCommingUrl = function () {
            var ud = this.getPersistData();
            if (!ud)
                return { stateName: blended.prodStates.home.name, pars: this.ctx }; //pretest jeste nezacal => goto product home
            if (ud.done)
                return null; //done pretest: vse je povoleno
            var dataNode = this.dataNode;
            var actModule = dataNode.Items[ud.actLevel];
            var actEx = this.ctx.product.nodeDir[this.ctx.Url];
            if (actModule.url != actEx.parent.url) {
                var pars = blended.cloneAndModifyContext(this.ctx, function (c) { return c.moduleurl = blended.encodeUrl(actModule.url); });
                return { stateName: blended.prodStates.home.name, pars: pars }; //v URL je adresa jineho nez aktivniho modulu (asi pomoci back) => jdi na prvni cviceni aktualniho modulu
            }
            return null;
        };
        pretestTaskController.prototype.initPersistData = function (ud) {
            if (ud.urls)
                return;
            _super.prototype.initPersistData.call(this, ud);
            ud.actLevel = blended.levelIds.A2;
            ud.urls = [this.actRepo(blended.levelIds.A2).url];
        };
        pretestTaskController.prototype.adjustChild = function () {
            if (this.child)
                return;
            var ud = this.getPersistData();
            if (ud.done)
                return;
            var actModule = this.actRepo(ud.actLevel);
            if (!actModule)
                throw '!actModule';
            var state = {
                params: blended.cloneAndModifyContext(this.ctx, function (d) { return d.moduleurl = blended.encodeUrl(actModule.url); }),
                parent: this,
                current: blended.prodStates.pretestModule,
                createForCheckUrl: blended.createControllerCtx.adjustChild
            };
            this.child = new moduleTaskController(state);
        };
        pretestTaskController.prototype.moveForward = function (ud) {
            var actTestItem = (this.child);
            var actRepo = this.actRepo(ud.actLevel);
            var childUser = actTestItem.getPersistData();
            if (!childUser.done || actTestItem.dataNode.url != actRepo.url)
                throw '!childUser.done || actTestItem.dataNode.parent.url != actRepo.url';
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
        function moduleTaskController() {
            _super.apply(this, arguments);
        }
        moduleTaskController.prototype.adjustChild = function () {
            var _this = this;
            if (this.child)
                return;
            var ud = this.getPersistData();
            if (ud.done)
                return;
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
                createForCheckUrl: blended.createControllerCtx.adjustChild
            };
            this.child = new vyzva.pretestExercise(state);
        };
        moduleTaskController.prototype.initPersistData = function (ud) {
            _super.prototype.initPersistData.call(this, ud);
            ud.actChildIdx = 0;
        };
        moduleTaskController.prototype.moveForward = function (ud) {
            var _this = this;
            var ud = this.getPersistData();
            if (this.alowCycleExercise) {
                this.setPersistData(function (d) { if (d.actChildIdx == _this.dataNode.Items.length - 1)
                    d.actChildIdx = 0;
                else
                    d.actChildIdx++; });
            }
            if (_.all(this.dataNode.Items, function (it) { var itUd = blended.getPersistData(it, _this.ctx.taskid); return (itUd && itUd.done); }))
                this.setPersistData(function (d) { return d.done = true; });
            this.child = null;
        };
        return moduleTaskController;
    })(taskController);
    blended.moduleTaskController = moduleTaskController;
})(blended || (blended = {}));
//export class controllerLow {
//  constructor($scope: IControllerLowScope, public $state: angular.ui.IStateService) {
//    this.ctx = <learnContext><any>($state.params);
//    finishContext(this.ctx);
//    $.extend(this, $state.current.data);
//    $scope.ts = this;
//  }
//  ctx: learnContext;
//}
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
//    //return node ? new greenProxy(node, this.ctx) /*TODO: null;
//  }
//}
//export class pretestState extends state {
//  constructor(st: angular.ui.IState, public exerciseState: state) {
//    super(st);
//  }
//getPersistData: (data: IPretestStateData) => IPretestUser;
//setPersistData: (data: IPretestStateData, modify: (data: IPretestUser) => void) => IPretestUser;
//modifyTargetState(data: IPretestStateData): IStateUrl {
//  var ud = this.getPersistData(data);
//  //if (!ud) return { stateName: prodStates.home.name, pars: data.man.ctx }; //pretest jeste nezacal => goto home
//  if (ud && ud.done) return null; //done pretest: vse je povoleno
//  var dataNode = <IPretestRepository>data.dataNode;
//  if (!ud) ud = this.setPersistData(data, d => {
//    d.url = dataNode.url;
//    d.actLevel = levelIds.A2;
//    d.urls = [this.actRepo(data, levelIds.A2).url];
//  });
//  var actModule = dataNode.Items[ud.actLevel];
//  if (actModule.url != data.man.ctx.moduleUrl) {
//    var pars = cloneAndModifyContext(data.man.ctx, c => {
//      c.moduleurl = enocdeUrl(actModule.url);
//      c.url = enocdeUrl(actModule.Items[0].url);
//    });
//    return { stateName: this.exerciseState.name, pars: pars }; //v URL je adresa jineho nez aktivniho modulu (asi pomoci back) => jdi na prvni cviceni aktualniho modulu
//  }
//  return null;
//}
//initPersistData(data: IPretestStateData, ud: IPretestUser) {
//  super.initPersistData(data, ud);
//  ud.actLevel = levelIds.A2;
//  ud.urls = [this.actRepo(data, levelIds.A2).url];
//}
//actRepo(data: IPretestStateData, lev: levelIds): IPretestItemRepository { return _.find(data.dataNode.Items, l => l.level == lev); }
//}
//export interface IPretestStateData extends blended.IStateData {
//  dataNode: IPretestRepository;
//}
