var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var vyzva;
(function (vyzva) {
    var blendedCourseTask = (function (_super) {
        __extends(blendedCourseTask, _super);
        function blendedCourseTask() {
            _super.apply(this, arguments);
        }
        blendedCourseTask.prototype.initPersistData = function (ud) {
            _super.prototype.initPersistData.call(this, ud);
            ud.startDate = Utils.nowToNum();
            ud.pretest = { url: this.dataNode.pretest.url };
        };
        blendedCourseTask.prototype.createChild = function (ud, completed) {
            if (!ud.pretest.done) {
                this.child = new pretestTask(this.dataNode.pretest, this.ctx, this, completed);
            }
            else if (!ud.entryTest.done) {
                this.child = new blended.moduleTask(this.dataNode.entryTests[ud.pretest.targetLevel], this.ctx, this, completed);
            }
            else if (!ud.lessons.done) {
                this.child = new blended.listTask(this.dataNode.lessons[ud.pretest.targetLevel], this.ctx, this, completed);
            }
            else {
                ud.done = true;
                this.child = null;
                completed();
            }
        };
        blendedCourseTask.prototype.moveForward = function (ud) {
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
                this.setPersistData(function (dt) { dt.done = true; dt.lessons.done = true; });
            }
            else
                return 'tasks.course.doGoAhead: unknown child url - ' + childUd.url;
            return null;
        };
        blendedCourseTask.prototype.getName = function () { return vyzva.stateNames.taskRoot; };
        //********** PRETEST item
        blendedCourseTask.prototype.getPretestItemModel = function () {
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
        return blendedCourseTask;
    })(blended.task);
    vyzva.blendedCourseTask = blendedCourseTask;
    var pretestTask = (function (_super) {
        __extends(pretestTask, _super);
        function pretestTask() {
            _super.apply(this, arguments);
        }
        pretestTask.prototype.runHash = function () {
            var ud = this.getPersistData();
            return null;
        };
        return pretestTask;
    })(blended.pretestTask);
    vyzva.pretestTask = pretestTask;
})(vyzva || (vyzva = {}));
