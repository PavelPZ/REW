var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var vyzva;
(function (vyzva) {
    //******* Home produktu
    var productHomeController = (function (_super) {
        __extends(productHomeController, _super);
        function productHomeController($scope, $state, $rootTask) {
            _super.call(this, $scope, $state, $rootTask);
            this.title = $rootTask.dataNode.title;
            this.breadcrumb[1].active = true;
            this.prt = $rootTask.getPretestItemModel();
        }
        return productHomeController;
    })(vyzva.controller);
    vyzva.productHomeController = productHomeController;
    function finishProdukt(prod) {
        if (prod.pretest)
            return;
        var clonedLessons = _.map(_.range(0, 4), function (idx) { return (_.clone(prod.Items[idx].Items)); }); //pro kazdou level kopie napr. </lm/blcourse/english/a1/>.Items
        var firstPretests = _.map(clonedLessons, function (l) { return l.splice(0, 1)[0]; }); //z kopie vyndej prvni prvek (entry test) a dej jej do firstPretests;
        prod.pretest = (prod.find('/lm/blcourse/' + LMComLib.LineIds[prod.line].toLowerCase() + '/pretests/'));
        prod.entryTests = firstPretests;
        prod.lessons = clonedLessons;
        //_.each(<any>(prod.pretest.Items), (it: CourseMeta.data) => {
        //  if (it.other) $.extend(it, JSON.parse(it.other));
        //});
    }
    vyzva.finishProdukt = finishProdukt;
    function breadcrumbBase(task) {
        return [
            { title: 'Moje Online jazykové kurzy a testy', url: '#' + Pager.getHomeUrl() },
            { title: task.product.title, url: task.href(vyzva.stateNames.productHome), active: false }
        ];
    }
    vyzva.breadcrumbBase = breadcrumbBase;
    var homeViewController = (function (_super) {
        __extends(homeViewController, _super);
        function homeViewController($scope, $state) {
            _super.call(this, $scope, $state);
            this.breadcrumb = breadcrumbBase(this.myControler);
            this.breadcrumb[1].active = true;
        }
        return homeViewController;
    })(blended.taskViewController);
    vyzva.homeViewController = homeViewController;
    var homeTaskController = (function (_super) {
        __extends(homeTaskController, _super);
        function homeTaskController($scope, $state, $loadedProduct) {
            _super.call(this, $scope, $state, 'productUrl', $loadedProduct);
            //this.breadcrumb = breadcrumbBase(this); this.breadcrumb[1].active = true;
            this.prt = this.getPretestItemModel();
        }
        homeTaskController.prototype.initPersistData = function (ud) {
            _super.prototype.initPersistData.call(this, ud);
            ud.startDate = Utils.nowToNum();
            ud.pretest = { url: this.dataNode.pretest.url };
        };
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
        homeTaskController.prototype.getName = function () { return vyzva.stateNames.taskRoot; };
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
                previewUrl: vyzva.stateNames.pretestHome,
            };
        };
        homeTaskController.$inject = ['$scope', '$state', '$loadedProduct'];
        return homeTaskController;
    })(blended.taskController);
    vyzva.homeTaskController = homeTaskController;
})(vyzva || (vyzva = {}));
