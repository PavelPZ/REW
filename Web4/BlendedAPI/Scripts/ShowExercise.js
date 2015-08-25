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
    var exerciseServiceProxy = (function () {
        function exerciseServiceProxy() {
        }
        return exerciseServiceProxy;
    })();
    blended.exerciseServiceProxy = exerciseServiceProxy;
    var exerciseService = (function () {
        function exerciseService(ctx /*ctx v dobe vlozeni do cache*/, mod, dataNode, page, userLong) {
            this.ctx = ctx;
            this.mod = mod;
            this.dataNode = dataNode;
            this.page = page;
            this.userLong = userLong;
            this.idxInMod = _.indexOf(mod.dataNode.Items, dataNode);
            this.userShort = this.userShort;
            if (!this.userShort)
                this.userShort = this.setPersistData(function (d) { });
        }
        exerciseService.prototype.display = function (el, attrs) { };
        exerciseService.prototype.destroy = function (el) { };
        exerciseService.prototype.getPersistData = function () { return blended.getPersistData(this.dataNode, this.ctx.taskid); };
        exerciseService.prototype.setPersistData = function (modify) { return blended.setPersistData(this.dataNode, this.ctx.taskid, modify); };
        return exerciseService;
    })();
    blended.exerciseService = exerciseService;
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
