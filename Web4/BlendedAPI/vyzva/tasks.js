var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var vyzva;
(function (vyzva) {
    var persistNodeImpl = (function () {
        function persistNodeImpl(repository, taskId) {
            var _this = this;
            this.repository = repository;
            this.taskId = taskId;
            this.getUserData = function () {
                if (!_this.userData)
                    return null;
                var it = _this.userData[_this.taskId];
                return it ? it.data : null;
            };
            this.setUserData = function (modify) {
                var it = _this.userData ? _this.userData[_this.taskId] : null;
                if (!it) {
                    it = { data: { taskId: '', url: '' }, modified: true };
                    if (!_this.userData)
                        _this.userData = {};
                    _this.userData[_this.taskId] = it;
                }
                else
                    it.modified = true;
                modify(it.data);
                return it.data;
            };
        }
        return persistNodeImpl;
    })();
    vyzva.persistNodeImpl = persistNodeImpl;
    function newGuid() { return ''; }
    //***************** metadata, popisujici metakurz
    (function (levelIds) {
        levelIds[levelIds["A1"] = 0] = "A1";
        levelIds[levelIds["A2"] = 1] = "A2";
        levelIds[levelIds["B1"] = 2] = "B1";
        levelIds[levelIds["B2"] = 3] = "B2";
    })(vyzva.levelIds || (vyzva.levelIds = {}));
    var levelIds = vyzva.levelIds;
    //************ tasks
    var task = (function (_super) {
        __extends(task, _super);
        function task(repository, taskId, completed) {
            var _this = this;
            _super.call(this, repository, taskId);
            var ud = this.getUserData();
            if (!ud)
                ud = this.setUserData(this.createStatus);
            this.init(ud, function () { return _this.createChild(ud, completed); });
        }
        //posun zelenou sipkou
        task.prototype.goAhead = function (ctx) {
            var _this = this;
            var def = ctx.$q.defer();
            try {
                var ud = this.getUserData();
                if (ud.done) {
                    def.resolve(false);
                    return;
                }
                if (this.child) {
                    this.child.goAhead(ctx).then(function (childOK) {
                        if (childOK) {
                            _this.addToHistory(_this.child, ud);
                            def.resolve(true);
                            return;
                        } //... ano, posun udelal child
                        _this.child = null;
                        _this.doMoveForward(def, ud); //... ne, posun delam ja
                    });
                }
                else
                    this.doMoveForward(def, ud); //neni child, udelej posun sam
            }
            finally {
                return def.promise;
            }
        };
        task.prototype.doMoveForward = function (def, ud) {
            var error = this.moveForward(ud); //posun stav dopredu
            if (error) {
                def.reject(error);
                return;
            } //error? => reject
            def.resolve(!ud.done);
        };
        task.prototype.addToHistory = function (child, ud) {
            if (!ud.history)
                ud.history = [];
            var hist = { date: 0, url: child.repository.url, taskId: child.getUserData().taskId };
            if (_.find(ud.history, function (h) { return h.url == hist.url && h.taskId == hist.taskId; }))
                return;
            ud.history.push(hist);
        };
        //********************** Virtualni procs
        //sance na asynchroni inicializaci self (nacteni dat pomoci ajaxu apod.)
        task.prototype.init = function (ud, completed) { completed(); };
        //inicialni naplneni statusu (pri jeho prvnim vytvoreni)
        task.prototype.createStatus = function (ud) {
            ud.url = this.repository.url;
            ud.taskId = newGuid();
        };
        //posun stavu dal
        task.prototype.moveForward = function (ud) { throw 'notimplemented'; };
        //vytvoreni child status na zaklade aktualniho stavu
        task.prototype.createChild = function (ud, completed) { completed(); };
        return task;
    })(persistNodeImpl);
    vyzva.task = task;
    var blendedCourseTask = (function (_super) {
        __extends(blendedCourseTask, _super);
        function blendedCourseTask() {
            _super.apply(this, arguments);
        }
        blendedCourseTask.prototype.createStatus = function (ud) {
            _super.prototype.createStatus.call(this, ud);
            ud.periodStart = 0; //todo Now
            ud.pretest = { url: this.repository.pretest.url, taskId: ud.taskId };
        };
        blendedCourseTask.prototype.createChild = function (ud, completed) {
            if (!ud.pretest.done) {
                this.child = new pretestTask(this.repository.pretest, ud.pretest.taskId, completed);
            }
            else if (!ud.entryTest.done) {
                this.child = new testTask(this.repository.entryTests[ud.pretest.targetLevel], ud.entryTest.taskId, completed);
            }
            else if (!ud.lessons.done) {
                this.child = new listTask(this.repository.lessons[ud.pretest.targetLevel], ud.lessons.taskId, completed);
            }
            else {
                ud.done = true;
                this.child = null;
                completed();
            }
        };
        blendedCourseTask.prototype.moveForward = function (ud) {
            var _this = this;
            var childUserData = this.child.getUserData();
            if (childUserData.taskId == ud.pretest.taskId) {
                var pretUser = childUserData;
                if (!pretUser.done)
                    return 'tasks.course.doGoAhead: !pretUser.done';
                this.setUserData(function (dt) { dt.pretest.done = true; dt.pretest.targetLevel = pretUser.targetLevel; dt.entryTest = { url: _this.repository.entryTests[ud.pretest.targetLevel].url, taskId: ud.taskId }; });
            }
            else if (childUserData.taskId == ud.entryTest.taskId) {
                var entryTestUser = childUserData;
                if (!entryTestUser.done)
                    return 'tasks.course.doGoAhead: !entryTestUser.done';
                this.setUserData(function (dt) { dt.entryTest.done = true; dt.entryTest.score = entryTestUser.score; dt.lessons = { url: _this.repository.lessons[ud.pretest.targetLevel].url, taskId: ud.taskId }; });
            }
            else if (childUserData.taskId == ud.lessons.taskId) {
                var lessonsUser = childUserData;
                if (!lessonsUser.done)
                    return 'tasks.course.doGoAhead: !lessonsUser.done';
                this.setUserData(function (dt) { dt.done = true; dt.lessons.done = true; });
            }
            else
                return 'tasks.course.doGoAhead: unknown taskId - ' + childUserData.taskId;
            return null;
        };
        return blendedCourseTask;
    })(task);
    vyzva.blendedCourseTask = blendedCourseTask;
    var pretestTask = (function (_super) {
        __extends(pretestTask, _super);
        function pretestTask() {
            _super.apply(this, arguments);
        }
        pretestTask.prototype.createStatus = function (ud) {
            _super.prototype.createStatus.call(this, ud);
            ud.actLevel = levelIds.A2;
            ud.urls = [];
            ud.urls.push(this.actRepo(levelIds.A2).url);
        };
        pretestTask.prototype.moveForward = function (ud) {
            var childTest = (this.child);
            var actRepo = this.actRepo(ud.actLevel);
            var childUser = childTest.getUserData();
            if (!childUser.done || childUser.url != actRepo.url)
                return 'tasks.pretestTask.doGoAhead: !testUser.done || testUser.url != actRepo.url';
            if (actRepo.level == levelIds.A1) {
                this.finishPretest(ud, levelIds.A1);
            }
            else if (actRepo.level == levelIds.A2) {
                if (childUser.score >= actRepo.minScore && childUser.score < actRepo.maxScore)
                    this.finishPretest(ud, levelIds.A2);
                else if (childUser.score < actRepo.minScore)
                    this.newTestItem(ud, levelIds.A1);
                else
                    this.newTestItem(ud, levelIds.B1);
            }
            else if (actRepo.level == levelIds.B1) {
                if (childUser.score >= actRepo.minScore && childUser.score < actRepo.maxScore)
                    this.finishPretest(ud, levelIds.B1);
                else if (childUser.score < actRepo.minScore)
                    this.finishPretest(ud, levelIds.A2);
                else
                    this.newTestItem(ud, levelIds.B2);
            }
            else if (actRepo.level == levelIds.B2) {
                if (childUser.score < actRepo.minScore)
                    this.finishPretest(ud, levelIds.B1);
                else
                    this.finishPretest(ud, levelIds.B2);
            }
            return null;
        };
        pretestTask.prototype.createChild = function (ud, completed) {
            var act = _.find(this.repository.levels, function (l) { return l.level == ud.actLevel; });
            if (!act)
                throw '!act';
            this.child = new testTask(act, ud.taskId, completed);
        };
        pretestTask.prototype.newTestItem = function (ud, lev) {
            ud.actLevel = lev;
            ud.urls.push(this.actRepo(lev).url);
        };
        pretestTask.prototype.finishPretest = function (ud, lev) {
            ud.done = true;
            ud.targetLevel = lev;
            this.child = null;
        };
        pretestTask.prototype.actRepo = function (lev) { return _.find(this.repository.levels, function (l) { return l.level == lev; }); };
        return pretestTask;
    })(task);
    vyzva.pretestTask = pretestTask;
    var listTask = (function (_super) {
        __extends(listTask, _super);
        function listTask() {
            _super.apply(this, arguments);
        }
        listTask.prototype.createStatus = function (ud) {
            _super.prototype.createStatus.call(this, ud);
        };
        listTask.prototype.moveForward = function (ud) { ud.done = true; return null; };
        listTask.prototype.createChild = function (ud, completed) { completed(); };
        return listTask;
    })(task);
    vyzva.listTask = listTask;
    var testTask = (function (_super) {
        __extends(testTask, _super);
        function testTask() {
            _super.apply(this, arguments);
        }
        testTask.prototype.createStatus = function (ud) {
            _super.prototype.createStatus.call(this, ud);
        };
        testTask.prototype.moveForward = function (ud) { ud.done = true; return null; };
        testTask.prototype.createChild = function (ud, completed) { completed(); };
        return testTask;
    })(task);
    vyzva.testTask = testTask;
    var moduleTask = (function (_super) {
        __extends(moduleTask, _super);
        function moduleTask() {
            _super.apply(this, arguments);
        }
        moduleTask.prototype.createStatus = function (ud) {
            _super.prototype.createStatus.call(this, ud);
        };
        moduleTask.prototype.moveForward = function (ud) { ud.done = true; return null; };
        moduleTask.prototype.createChild = function (ud, completed) { completed(); };
        return moduleTask;
    })(task);
    vyzva.moduleTask = moduleTask;
    var exTask = (function (_super) {
        __extends(exTask, _super);
        function exTask() {
            _super.apply(this, arguments);
        }
        exTask.prototype.createStatus = function (ud) {
            _super.prototype.createStatus.call(this, ud);
        };
        exTask.prototype.moveForward = function (ud) { ud.done = true; return null; };
        exTask.prototype.createChild = function (ud, completed) { completed(); };
        return exTask;
    })(task);
    vyzva.exTask = exTask;
})(vyzva || (vyzva = {}));
