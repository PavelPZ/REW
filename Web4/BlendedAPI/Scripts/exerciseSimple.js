var blended;
(function (blended) {
    //export var loadExSimple = ['$stateParams', ($stateParams: blended.learnContext) => {
    //  blended.finishContext($stateParams);
    //  return blended.loader.adjustExSimple($stateParams);
    //}];
    //********************* SHOW EXERCISES DIRECTIVE
    var showExerciseModelSimple = (function () {
        function showExerciseModelSimple() {
            this.restrict = 'EA';
            this.link = function (scope, el, attrs) {
                var exService = scope.exService();
                scope.$on('onStateChangeSuccess', function (ev) { return exService.onDestroy(el); });
                exService.onDisplay(el, $.noop);
            };
            this.scope = { exService: '&exService' };
        }
        return showExerciseModelSimple;
    })();
    blended.showExerciseModelSimple = showExerciseModelSimple;
    blended.rootModule
        .directive('showExerciseSimple', function () { return new showExerciseModelSimple(); });
    var exerciseServiceSimple = (function () {
        function exerciseServiceSimple(pageJsonML, loc, userLongData) {
            this.pageJsonML = pageJsonML;
            this.loc = loc;
            this.userLongData = userLongData;
        }
        exerciseServiceSimple.prototype.onDisplay = function (el, completed) {
            var _this = this;
            var pg = this.page = CourseMeta.extractEx(this.pageJsonML);
            Course.localize(pg, function (s) { return CourseMeta.localizeString(pg.url, s, _this.loc); });
            if (!this.userLongData)
                this.userLongData = {};
            this.dataNode = { page: pg, result: this.userLongData };
            pg.finishCreatePage(this.dataNode);
            pg.callInitProcs(Course.initPhase.beforeRender, function () {
                var html = JsRenderTemplateEngine.render("c_gen", pg);
                CourseMeta.actExPageControl = pg; //na chvili: knockout pro cviceni binduje CourseMeta.actExPageControl
                ko.cleanNode(el[0]);
                el.html('');
                el.html(html);
                ko.applyBindings({}, el[0]);
                pg.callInitProcs(Course.initPhase.afterRender, function () {
                    pg.callInitProcs(Course.initPhase.afterRender2, function () {
                        completed(pg);
                    });
                });
            });
        };
        exerciseServiceSimple.prototype.onDestroy = function (el) {
            if (this.page.sndPage)
                this.page.sndPage.htmlClearing();
            if (this.page.sndPage)
                this.page.sndPage.leave();
            ko.cleanNode(el[0]);
            el.html('');
            delete (this.dataNode).result;
        };
        return exerciseServiceSimple;
    })();
    blended.exerciseServiceSimple = exerciseServiceSimple;
})(blended || (blended = {}));
