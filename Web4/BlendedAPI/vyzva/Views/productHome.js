var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var vyzva;
(function (vyzva) {
    //****************** VIEW
    var homeViewController = (function (_super) {
        __extends(homeViewController, _super);
        function homeViewController($scope, $state) {
            _super.call(this, $scope, $state);
            this.breadcrumb = vyzva.breadcrumbBase(this.myTask);
            this.breadcrumb[1].active = true;
            this.prt = this.myTask.getPretestItemModel();
        }
        return homeViewController;
    })(blended.taskViewController);
    vyzva.homeViewController = homeViewController;
    //export class homeGreenProxy extends blended.greenProxy {
    //  constructor(public dataNode: IBlendedCourseRepository, ctx: blended.learnContext) {
    //    super(dataNode, ctx);
    //  }
    //  getPersistData: () => IBlendedCourseUser;
    //  getChild(): blended.IStateUrl {
    //    var ud = this.getPersistData();
    //    if (!ud.pretest.done) { //pretest task neexistuje nebo neni dokoncen
    //      return new blended.pretestGreenProxy(this.dataNode.pretest, this.ctx).getChild();
    //    } else if (!ud.entryTest.done) { //entryTest task neexistuje nebo neni dokoncen
    //      return new blended.greenProxy(this.dataNode.entryTests[ud.pretest.targetLevel], this.ctx).getChild();
    //    } else if (!ud.lessons.done) { //level task neexistuje nebo neni dokoncen
    //      return new blended.greenProxy(this.dataNode.lessons[ud.pretest.targetLevel], this.ctx).getChild();
    //    } else {
    //      return null;
    //    }
    //  }
    //}
    //****************** TASK
    var homeTaskController = (function (_super) {
        __extends(homeTaskController, _super);
        function homeTaskController($scope, $state, $loadedProduct) {
            _super.call(this, $scope, $state, 'productUrl', $loadedProduct);
            //this.breadcrumb = breadcrumbBase(this); this.breadcrumb[1].active = true;
            //this.prt = this.getPretestItemModel();
        }
        homeTaskController.prototype.initPersistData = function (ud) {
            _super.prototype.initPersistData.call(this, ud);
            ud.startDate = Utils.nowToNum();
            ud.pretest = { url: this.dataNode.pretest.url };
        };
        //greenChild(): taskController {
        //  var ud = this.getPersistData();
        //  if (!ud.pretest.done) { //pretest task neexistuje nebo neni dokoncen
        //    this.child = new pretestTaskController(this.dataNode.pretest, this.ctx, this, completed);
        //  } else if (!ud.entryTest.done) { //entryTest task neexistuje nebo neni dokoncen
        //    this.child = new blended.moduleTask(this.dataNode.entryTests[ud.pretest.targetLevel], this.ctx, this, completed);
        //  } else if (!ud.lessons.done) { //level task neexistuje nebo neni dokoncen
        //    this.child = new blended.listTask(this.dataNode.lessons[ud.pretest.targetLevel], this.ctx, this, completed);
        //  } else {
        //    ud.done = true; this.child = null;
        //    completed();
        //  }
        //}
        homeTaskController.prototype.moveForward = function (ud) {
            var _this = this;
            var childUd = this.child.getPersistData();
            if (childUd.url == ud.pretest.url) {
                var pretUser = childUd;
                if (!pretUser.done)
                    return 'tasks.course.doGoAhead: !pretUser.done';
                this.setPersistData(function (dt) { dt.pretest.done = true; dt.pretest.targetLevel = pretUser.targetLevel; dt.entryTest = { url: _this.dataNode.entryTests[dt.pretest.targetLevel].url }; });
            }
            else if (childUd.url == ud.entryTest.url) {
                var entryTestUser = childUd;
                if (!entryTestUser.done)
                    return 'tasks.course.doGoAhead: !entryTestUser.done';
                this.setPersistData(function (dt) { dt.entryTest.done = true; dt.entryTest.score = entryTestUser.score; dt.lessons = { url: _this.dataNode.lessons[dt.pretest.targetLevel].url }; });
            }
            else if (childUd.url == ud.lessons.url) {
                var lessonsUser = childUd;
                if (!lessonsUser.done)
                    return 'tasks.course.doGoAhead: !lessonsUser.done';
                this.setPersistData(function (dt) { dt.done = dt.lessons.done = true; }); //lesson i self je hotovo;
            }
            else
                return 'tasks.course.doGoAhead: unknown child url - ' + childUd.url;
            return null;
        };
        //getName(): string { return stateNames.taskRoot; }
        //********** PRETEST item
        homeTaskController.prototype.getPretestItemModel = function () {
            var _this = this;
            var ud = this.getPersistData();
            return {
                run: function () {
                    debugger;
                    if (!_this.child || _this.child.dataNode != _this.dataNode.pretest)
                        throw '!this.child || this.child.dataNode.url != ud.pretest.url';
                },
                canRun: !ud.pretest || !ud.pretest.done,
                btnTitle: !ud.pretest ? 'Začněte spuštěním Rozřazovacího testu' : 'Dokončete Rozřazovací test',
                resultLevel: ud.pretest.done ? blended.levelIds[ud.pretest.targetLevel] : '',
                previewUrl: vyzva.stateNames.pretest.name,
            };
        };
        homeTaskController.$inject = ['$scope', '$state', '$loadedProduct'];
        return homeTaskController;
    })(blended.taskController);
    vyzva.homeTaskController = homeTaskController;
})(vyzva || (vyzva = {}));
//******* Home produktu
//export class productHomeController extends controller implements IToolbar, IToolbarEmpty {
//  constructor($scope: blended.IControllerScope, $state: angular.ui.IStateService, $rootTask: blendedCourseTask) {
//    super($scope, $state, $rootTask);
//    this.title = $rootTask.dataNode.title;
//    this.breadcrumb[1].active = true;
//    this.prt = $rootTask.getPretestItemModel();
//  }
//  //************ IHomePretest
//  prt: IHomePretest;
//}
