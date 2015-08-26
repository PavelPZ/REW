var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var blended;
(function (blended) {
    blended.showExerciseDirective2 = ['$stateParams', function ($stateParams) { return new showExerciseModel($stateParams); }];
    var showExerciseModel = (function () {
        function showExerciseModel($stateParams) {
            var _this = this;
            this.$stateParams = $stateParams;
            this.link = function (scope, el, attrs) {
                scope.$on('$destroy', function () {
                    if (_this.page.sndPage)
                        _this.page.sndPage.htmlClearing();
                    if (_this.page.sndPage)
                        _this.page.sndPage.leave();
                    ko.cleanNode(el[0]);
                    el.html('');
                });
                blended.loader.adjustEx(_this.$stateParams).then(function (exserv) {
                    _this.page = exserv.page;
                    ko.cleanNode(el[0]);
                    el.html('');
                    CourseMeta.lib.blendedDisplayEx(_this.page, function (html) {
                        el.html(html);
                        ko.applyBindings({}, el[0]);
                    });
                });
            };
        }
        return showExerciseModel;
    })();
    blended.showExerciseModel = showExerciseModel;
    var exItemProxy = (function () {
        function exItemProxy() {
        }
        return exItemProxy;
    })();
    blended.exItemProxy = exItemProxy;
    //***************** $scope.ex, je v cache
    var exerciseService = (function () {
        function exerciseService(ctx /*ctx v dobe vlozeni do cache*/, mod, dataNode, page, userLong) {
            this.mod = mod;
            this.dataNode = dataNode;
            this.page = page;
            this.userLong = userLong;
            this.taskId = ctx.taskid;
            if (!userLong)
                userLong = {};
        }
        exerciseService.prototype.display = function (el, attrs) { };
        exerciseService.prototype.destroy = function (el) { };
        exerciseService.prototype.getPersistData = function () { return blended.getPersistData(this.dataNode, this.taskId); };
        exerciseService.prototype.setPersistData = function (modify) { return blended.setPersistData(this.dataNode, this.taskId, modify); };
        exerciseService.prototype.evaluate = function () { };
        return exerciseService;
    })();
    blended.exerciseService = exerciseService;
    var exerciseTaskViewController = (function (_super) {
        __extends(exerciseTaskViewController, _super);
        function exerciseTaskViewController(state, $loadedEx) {
            var _this = this;
            _super.call(this, state);
            this.$loadedEx = $loadedEx;
            if (state.$scope)
                (state.$scope).ex = $loadedEx;
            this.title = this.dataNode.title;
            this.modItems = _.map(this.parent.dataNode.Items, function (node, idx) {
                return { user: blended.getPersistData(node, _this.ctx.taskid), modIdx: idx, title: node.title };
            });
            this.modIdx = _.indexOf(this.parent.dataNode.Items, this.dataNode);
        }
        exerciseTaskViewController.prototype.initPersistData = function (ud) {
            _super.prototype.initPersistData.call(this, ud);
        };
        exerciseTaskViewController.prototype.moveForward = function (ud) {
            ud.done = true;
        };
        return exerciseTaskViewController;
    })(blended.taskController);
    blended.exerciseTaskViewController = exerciseTaskViewController;
})(blended || (blended = {}));
//export var showExerciseDirective2_ = ['$stateParams', ($stateParams: blended.learnContext) => {
//  var model = new showExerciseModel($stateParams);
//  return { link: model.link };
//  return {
//    link: (scope: ng.IScope, el: ng.IAugmentedJQuery, attrs: ng.IAttributes) => {
//      scope.$on('$destroy', () => {
//        ko.cleanNode(el[0]);
//        el.html('');
//      });
//      var page: Course.Page = blended.loader.productCache.fromCache($stateParams).moduleCache.fromCache($stateParams.moduleUrl).cacheOfPages.fromCache($stateParams.Url);
//      ko.cleanNode(el[0].parentElement);
//      el.html('');
//      CourseMeta.lib.blendedDisplayEx(page, html => {
//        el.html(html);
//        ko.applyBindings({}, el[0].parentElement);
//      });
//    }
//  };
//}]; 
