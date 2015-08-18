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
    function applyMixins(derivedCtor, baseCtors) {
        baseCtors.forEach(function (baseCtor) {
            Object.getOwnPropertyNames(baseCtor.prototype).forEach(function (name) {
                if (name !== 'constructor') {
                    derivedCtor.prototype[name] = baseCtor.prototype[name];
                }
            });
        });
    }
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
        function task() {
            _super.apply(this, arguments);
        }
        task.prototype.init = function () {
            return null;
        };
        //posun zelenou sipkou
        task.prototype.goAhead = function (ctx) { throw 'notimplemented'; };
        return task;
    })(persistNodeImpl);
    vyzva.task = task;
    var courseTask = (function (_super) {
        __extends(courseTask, _super);
        function courseTask(repository, taskId) {
            _super.call(this, repository, taskId);
            var userData = this.getUserData();
            if (!userData)
                userData = this.setUserData(function (data) {
                    //data.url = repository.u
                    data.taskId = newGuid();
                    data.periodStart = 0; //todo Now
                });
        }
        courseTask.prototype.goAhead = function (ctx) {
            var _this = this;
            var def = ctx.$q.defer();
            if (this.child) {
                this.child.goAhead(ctx).then(function (childOK) {
                    if (childOK) {
                        def.resolve(true);
                        return;
                    } //posun dopredu resi child task
                    //child task neumi posun dopredu vyresit => vyres sam
                    switch (_this.child.repository.taskType) {
                        case 'vyzva.pretest':
                            var pretUser = (_this.child).getUserData();
                            if (!pretUser.done)
                                def.reject('tasks.course.doGoAhead: !pretUser.done');
                            var myUserData = _this.setUserData(function (dt) { dt.pretest.done = true; dt.pretest.targetLevel = pretUser.targetLevel; dt.entryTest = { taskId: newGuid() }; });
                            var entryTestRepo = _this.repository.entryTests[pretUser.targetLevel];
                            new testTask(entryTestRepo, myUserData.entryTest.taskId).init().then(function (task) {
                                _this.child = task;
                                def.resolve(true);
                            });
                            break;
                        case 'vyzva.entryTest':
                            var entryTestUser = (_this.child).getUserData();
                            if (!entryTestUser.done)
                                def.reject('tasks.course.doGoAhead: !entryTestUser.done');
                            var myUserData = _this.setUserData(function (dt) { dt.entryTest.done = true; dt.entryTest.score = entryTestUser.score; dt.lessons = { taskId: newGuid() }; });
                            var lessonsRepo = _this.repository.lessons[pretUser.targetLevel];
                            new listTask(lessonsRepo, myUserData.lessons.taskId).init().then(function (task) {
                                _this.child = task;
                                def.resolve(true);
                            });
                            break;
                        case 'vyzva.lessons':
                            var lessonsUser = (_this.child).getUserData();
                            if (!lessonsUser.done)
                                def.reject('tasks.course.doGoAhead: !lessonsUser.done');
                            var myUserData = _this.setUserData(function (dt) { dt.done = true; dt.lessons.done = true; });
                            _this.child = null;
                            def.resolve(false);
                            break;
                        default:
                            def.reject('tasks.course.doGoAhead: unknown taskType - ' + _this.child.repository.taskType);
                            break;
                    }
                });
            }
            else {
                var ud = this.getUserData();
                if (ud.done)
                    def.resolve(false);
                if (!ud.pretest || !ud.pretest.done) {
                    if (!ud.pretest)
                        ud = this.setUserData(function (data) { return data.pretest = { taskId: newGuid() }; });
                    new pretestTask(this.repository.pretest, ud.pretest.taskId).init().then(function (task) { return def.resolve(true); });
                }
                else if (!ud.entryTest || !ud.entryTest.done) {
                    if (!ud.entryTest)
                        ud = this.setUserData(function (data) { return data.entryTest = { taskId: newGuid() }; });
                    new testTask(this.repository.entryTests[ud.pretest.targetLevel], ud.entryTest.taskId).init().then(function (task) { return def.resolve(true); });
                }
                else if (!ud.lessons || !ud.lessons.done) {
                    if (!ud.lessons)
                        ud = this.setUserData(function (data) { return data.lessons = { taskId: newGuid() }; });
                    new listTask(this.repository.lessons[ud.pretest.targetLevel], ud.lessons.taskId).init().then(function (task) { return def.resolve(true); });
                }
            }
            return def.promise;
        };
        return courseTask;
    })(task);
    vyzva.courseTask = courseTask;
    var pretestTask = (function (_super) {
        __extends(pretestTask, _super);
        function pretestTask(repository, taskId) {
            _super.call(this, repository, taskId);
        }
        pretestTask.prototype.goAhead = function (ctx) {
            var _this = this;
            var def = ctx.$q.defer();
            if (this.child) {
                this.child.goAhead(ctx).then(function (childOK) {
                    if (childOK) {
                        def.resolve(true);
                        return;
                    } //posun dopredu resi child task
                    var childTest = (_this.child);
                    var testUser = childTest.getUserData();
                    if (!testUser.done)
                        def.reject('tasks.pretestTask.doGoAhead: !testUser.done');
                    var myUserData = _this.setUserData(function (dt) {
                        var last = dt.parts[dt.parts.length - 1];
                        if (last.taskId != childTest.taskId)
                            def.reject('tasks.pretestTask.doGoAhead: last.taskId != childTest.taskId');
                        last.done = true;
                        last.score = testUser.score;
                    });
                    _this.getNextTestItem(def, myUserData);
                });
            }
            else {
                this.getNextTestItem(def, this.setUserData($.noop));
            }
            return def.promise;
        };
        pretestTask.prototype.getNextTestItem = function (def, myUserData) {
            var last = myUserData.parts[myUserData.parts.length - 1];
            if (last.done) {
                var actRepo = this.repository.levels[last.level];
                if (last.level == levelIds.A1)
                    this.finishPretest(def, myUserData, levelIds.A1);
                else if (last.level == levelIds.A2) {
                    if (last.score >= actRepo.minScore && last.score < actRepo.maxScore)
                        this.finishPretest(def, myUserData, levelIds.A2);
                    else if (last.score < actRepo.minScore)
                        this.newTestItem(def, myUserData, levelIds.A1);
                    else
                        this.newTestItem(def, myUserData, levelIds.B1);
                }
                else if (last.level == levelIds.B1) {
                    if (last.score >= actRepo.minScore && last.score < actRepo.maxScore)
                        this.finishPretest(def, myUserData, levelIds.B1);
                    else if (last.score < actRepo.minScore)
                        this.finishPretest(def, myUserData, levelIds.A2);
                    else
                        this.newTestItem(def, myUserData, levelIds.B2);
                }
                else if (last.level == levelIds.B2) {
                    if (last.score < actRepo.minScore)
                        this.finishPretest(def, myUserData, levelIds.B1);
                    else
                        this.finishPretest(def, myUserData, levelIds.B2);
                }
            }
            else {
                new testTask(this.repository.levels[last.level], last.taskId).init().then(function (task) { return def.resolve(true); });
            }
        };
        pretestTask.prototype.newTestItem = function (def, myUserData, lev) {
            myUserData.parts.push({ level: lev, taskId: newGuid() });
            var last = myUserData.parts[myUserData.parts.length - 1];
            new testTask(this.repository.levels[last.level], last.taskId).init().then(function (task) { return def.resolve(true); });
        };
        pretestTask.prototype.finishPretest = function (def, myUserData, lev) {
            myUserData.done = true;
            myUserData.targetLevel = levelIds.A2;
            def.resolve(false);
        };
        return pretestTask;
    })(task);
    vyzva.pretestTask = pretestTask;
    var listTask = (function (_super) {
        __extends(listTask, _super);
        function listTask(repository, taskId) {
            _super.call(this, repository, taskId);
        }
        listTask.prototype.goAhead = function (ctx) {
            var _this = this;
            var def = ctx.$q.defer();
            if (this.child) {
                this.child.goAhead(ctx).then(function (childOK) {
                    if (childOK) {
                        def.resolve(true);
                        return;
                    } //posun dopredu resi child task
                    var childTask = (_this.child);
                    var childUser = childTask.getUserData();
                    if (!childUser.done)
                        def.reject('tasks.listTask.doGoAhead: !childUser.done');
                    var myUserData = _this.setUserData(function (dt) {
                        var last = dt.items[dt.items.length - 1];
                        if (last.taskId != childTask.taskId)
                            def.reject('tasks.listTask.doGoAhead: last.taskId != childTest.taskId');
                        last.done = true;
                        last.score = childUser.score;
                    });
                    //this.getNextTestItem(def, myUserData);
                });
            }
            else {
            }
            return def.promise;
        };
        return listTask;
    })(task);
    vyzva.listTask = listTask;
    var testTask = (function (_super) {
        __extends(testTask, _super);
        function testTask(repository, taskId) {
            _super.call(this, repository, taskId);
        }
        return testTask;
    })(task);
    vyzva.testTask = testTask;
    var exTask = (function (_super) {
        __extends(exTask, _super);
        function exTask(repository, taskId) {
            _super.call(this, repository, taskId);
        }
        return exTask;
    })(persistNodeImpl);
    vyzva.exTask = exTask;
})(vyzva || (vyzva = {}));
