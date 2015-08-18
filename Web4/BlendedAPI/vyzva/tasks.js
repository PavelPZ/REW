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
    var courseTask = (function (_super) {
        __extends(courseTask, _super);
        function courseTask() {
            _super.apply(this, arguments);
        }
        courseTask.prototype.createStatus = function (ud) {
            _super.prototype.createStatus.call(this, ud);
            ud.periodStart = 0; //todo Now
        };
        courseTask.prototype.createChild = function (ud, completed) {
            if (!ud.pretest || !ud.pretest.done) {
                if (!ud.pretest)
                    ud = this.setUserData(function (data) { return data.pretest = { taskId: newGuid() }; });
                this.child = new pretestTask(this.repository.pretest, ud.pretest.taskId, completed);
            }
            else if (!ud.entryTest || !ud.entryTest.done) {
                if (!ud.entryTest)
                    ud = this.setUserData(function (data) { return data.entryTest = { taskId: newGuid() }; });
                this.child = new testTask(this.repository.entryTests[ud.pretest.targetLevel], ud.entryTest.taskId, completed);
            }
            else if (!ud.lessons || !ud.lessons.done) {
                if (!ud.lessons)
                    ud = this.setUserData(function (data) { return data.lessons = { taskId: newGuid() }; });
                new listTask(this.repository.lessons[ud.pretest.targetLevel], ud.lessons.taskId, completed);
            }
            else {
                ud.done = true;
                this.child = null;
                completed();
            }
        };
        courseTask.prototype.moveForward = function (ud) {
            switch (this.child.repository.taskType) {
                case 'vyzva.pretest':
                    var pretUser = (this.child).getUserData();
                    if (!pretUser.done)
                        return 'tasks.course.doGoAhead: !pretUser.done';
                    this.setUserData(function (dt) { dt.pretest.done = true; dt.pretest.targetLevel = pretUser.targetLevel; dt.entryTest = { taskId: newGuid() }; });
                    break;
                case 'vyzva.entryTest':
                    var entryTestUser = (this.child).getUserData();
                    if (!entryTestUser.done)
                        return 'tasks.course.doGoAhead: !entryTestUser.done';
                    this.setUserData(function (dt) { dt.entryTest.done = true; dt.entryTest.score = entryTestUser.score; dt.lessons = { taskId: newGuid() }; });
                    break;
                case 'vyzva.lessons':
                    var lessonsUser = (this.child).getUserData();
                    if (!lessonsUser.done)
                        return 'tasks.course.doGoAhead: !lessonsUser.done';
                    this.setUserData(function (dt) { dt.done = true; dt.lessons.done = true; });
                    break;
                default:
                    return 'tasks.course.doGoAhead: unknown taskType - ' + this.child.repository.taskType;
            }
            return null;
        };
        return courseTask;
    })(task);
    vyzva.courseTask = courseTask;
    var pretestTask = (function (_super) {
        __extends(pretestTask, _super);
        function pretestTask() {
            _super.apply(this, arguments);
        }
        pretestTask.prototype.createStatus = function (data) {
            _super.prototype.createStatus.call(this, data);
            data.parts = [{ level: levelIds.A2, taskId: newGuid() }];
        };
        pretestTask.prototype.moveForward = function (ud) {
            var childTest = (this.child);
            var testUser = childTest.getUserData();
            if (!testUser.done)
                return 'tasks.pretestTask.doGoAhead: !testUser.done';
            var myUserData = this.setUserData(function (dt) {
                var last = dt.parts[dt.parts.length - 1];
                if (last.taskId != childTest.taskId)
                    return 'tasks.pretestTask.doGoAhead: last.taskId != childTest.taskId';
                last.done = true;
                last.score = testUser.score;
            });
            return null;
        };
        pretestTask.prototype.createChild = function (myUserData, completed) {
            var last = myUserData.parts[myUserData.parts.length - 1];
            if (last.done) {
                var actRepo = this.repository.levels[last.level];
                if (last.level == levelIds.A1)
                    this.finishPretest(myUserData, levelIds.A1, completed);
                else if (last.level == levelIds.A2) {
                    if (last.score >= actRepo.minScore && last.score < actRepo.maxScore)
                        this.finishPretest(myUserData, levelIds.A2, completed);
                    else if (last.score < actRepo.minScore)
                        this.newTestItem(myUserData, levelIds.A1, completed);
                    else
                        this.newTestItem(myUserData, levelIds.B1, completed);
                }
                else if (last.level == levelIds.B1) {
                    if (last.score >= actRepo.minScore && last.score < actRepo.maxScore)
                        this.finishPretest(myUserData, levelIds.B1, completed);
                    else if (last.score < actRepo.minScore)
                        this.finishPretest(myUserData, levelIds.A2, completed);
                    else
                        this.newTestItem(myUserData, levelIds.B2, completed);
                }
                else if (last.level == levelIds.B2) {
                    if (last.score < actRepo.minScore)
                        this.finishPretest(myUserData, levelIds.B1, completed);
                    else
                        this.finishPretest(myUserData, levelIds.B2, completed);
                }
            }
            else {
                this.child = new testTask(this.repository.levels[last.level], last.taskId, completed);
            }
        };
        pretestTask.prototype.newTestItem = function (myUserData, lev, completed) {
            myUserData.parts.push({ level: lev, taskId: newGuid() });
            var last = myUserData.parts[myUserData.parts.length - 1];
            this.child = new testTask(this.repository.levels[last.level], last.taskId, completed);
        };
        pretestTask.prototype.finishPretest = function (myUserData, lev, completed) {
            myUserData.done = true;
            myUserData.targetLevel = lev;
            this.child = null;
            completed();
        };
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
        listTask.prototype.moveForward = function (ud) { throw 'notimplemented'; };
        listTask.prototype.createChild = function (ud) { throw 'notimplemented'; };
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
        function testTask() {
            _super.apply(this, arguments);
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
