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
        function homeViewController(state) {
            _super.call(this, state);
            this.breadcrumb = vyzva.breadcrumbBase(this.ctx);
            this.breadcrumb[1].active = true;
            this.prt = this.myTask.getPretestItemModel();
        }
        return homeViewController;
    })(blended.taskViewController);
    vyzva.homeViewController = homeViewController;
    //****************** TASK
    var homeTaskController = (function (_super) {
        __extends(homeTaskController, _super);
        function homeTaskController() {
            _super.apply(this, arguments);
        }
        homeTaskController.prototype.initPersistData = function (ud) {
            _super.prototype.initPersistData.call(this, ud);
            ud.startDate = Utils.nowToNum();
            //ud.pretest = { url: this.dataNode.pretest.url }
        };
        homeTaskController.prototype.moveForward = function (ud) {
            var childUd = this.child.getPersistData();
            if (this.child.dataNode.url == this.dataNode.pretest.url) {
            }
            else {
                var pretestUd = blended.getPersistData(this.dataNode.pretest, this.ctx.taskid);
                if (this.child.dataNode.url == this.dataNode.entryTests[pretestUd.targetLevel].url) {
                }
                else if (this.child.dataNode.url == this.dataNode.lessons[pretestUd.targetLevel].url) {
                }
                else
                    throw 'tasks.course.doGoAhead: unknown child url - ' + this.child.dataNode.url;
            }
        };
        //getName(): string { return stateNames.taskRoot; }
        //********** PRETEST item
        homeTaskController.prototype.getPretestItemModel = function () {
            var _this = this;
            var prUd = blended.getPersistData(this.dataNode.pretest, this.ctx.taskid);
            return {
                run: function () {
                    _this.child = new blended.pretestTaskController({
                        params: blended.cloneAndModifyContext(_this.ctx, function (d) { return d.pretesturl = blended.encodeUrl(_this.dataNode.pretest.url); }),
                        current: vyzva.stateNames.pretestTask,
                        parent: _this,
                        createForCheckUrl: blended.createControllerCtx.adjustChild
                    });
                    var url = _this.child.goCurrent();
                    _this.navigate(url);
                },
                canRun: !prUd || !prUd.done,
                btnTitle: !prUd ? 'Začněte spuštěním Rozřazovacího testu' : 'Dokončete Rozřazovací test',
                resultLevel: prUd && prUd.done ? blended.levelIds[prUd.targetLevel] : '',
                previewUrl: vyzva.stateNames.pretest.name,
            };
        };
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
//export interface IHomeStateData extends blended.IStateData{
//  dataNode: IBlendedCourseRepository;
//}
//export class homeState extends blended.state {
//  initPersistData(data: IHomeStateData, ud: IBlendedCourseUser) {
//    super.initPersistData(data, ud);
//    ud.startDate = Utils.nowToNum();
//    ud.pretest = { url: data.dataNode.pretest.url }
//  }
//  getPersistData: (data: IHomeStateData) => IBlendedCourseUser;
//  setPersistData: (data: IHomeStateData, modify: (data: IBlendedCourseUser) => void) => IBlendedCourseUser;
//  getPretestItemModel(data: IHomeStateData): IHomePretest {
//    var ud = this.getPersistData(data);
//    return {
//      run: () => {
//        debugger;
//      },
//      canRun: !ud.pretest || !ud.pretest.done,
//      btnTitle: !ud.pretest ? 'Začněte spuštěním Rozřazovacího testu' : 'Dokončete Rozřazovací test',
//      resultLevel: ud.pretest.done ? blended.levelIds[ud.pretest.targetLevel] : '',
//      previewUrl: stateNames.pretest.name,
//    };
//  }
//}
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
