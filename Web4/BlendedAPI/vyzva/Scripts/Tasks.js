var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var vyzva;
(function (vyzva) {
    (function (greenStatus) {
        greenStatus[greenStatus["green"] = 0] = "green";
        greenStatus[greenStatus["disabled"] = 1] = "disabled";
        greenStatus[greenStatus["blue"] = 2] = "blue";
    })(vyzva.greenStatus || (vyzva.greenStatus = {}));
    var greenStatus = vyzva.greenStatus;
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
                this.child = new blended.pretestTask(this.dataNode.pretest, this.ctx, this, completed);
            }
            else if (!ud.entryTest.done) {
                this.child = new blended.testTask(this.dataNode.entryTests[ud.pretest.targetLevel], this.ctx, this, completed);
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
        blendedCourseTask.prototype.greenBtnStatus = function () { var ud = this.getPersistData(); return ud && ud.lessons && ud.lessons.done ? greenStatus.disabled : greenStatus.green; };
        blendedCourseTask.prototype.greenBtnHash = function () {
            var _this = this;
            var ud = this.getPersistData();
            if (!ud || !ud.pretest || !ud.pretest.done)
                return this.ctx.$state.href(vyzva.stateNames.pretestHome);
            if (!ud.entryTest || !ud.entryTest.done)
                return this.ctx.$state.href(vyzva.stateNames.taskCheckTest, { url: this.dataNode.entryTests[ud.pretest.targetLevel].url });
            var actLessons = this.dataNode.lessons[ud.pretest.targetLevel].Items;
            var less = _.find(actLessons, function (l) {
                var lud = blended.getPersistData(less, _this.ctx.taskid);
                return !lud || !lud.done;
            });
            if (!less)
                return this.ctx.$state.href(vyzva.stateNames.pretestHome);
            var statusId = less.url.indexOf('/lesson') < 0 ? vyzva.stateNames.taskCheckTest : vyzva.stateNames.taskLesson;
            return this.ctx.$state.href(statusId, { url: less.url });
        };
        return blendedCourseTask;
    })(blended.task);
    vyzva.blendedCourseTask = blendedCourseTask;
    //****************** PRETEST 
    var pretestTask = (function (_super) {
        __extends(pretestTask, _super);
        function pretestTask() {
            _super.apply(this, arguments);
        }
        return pretestTask;
    })(blended.pretestTask);
    vyzva.pretestTask = pretestTask;
})(vyzva || (vyzva = {}));
