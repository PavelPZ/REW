var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var blended;
(function (blended) {
    //export interface IPersistNodeImpl {
    //  userData: { [taskId: string]: IPersistNodeItem; } //dato pro jednotlive variatny
    //}
    //***************** metadata, popisujici metakurz
    (function (levelIds) {
        levelIds[levelIds["A1"] = 0] = "A1";
        levelIds[levelIds["A2"] = 1] = "A2";
        levelIds[levelIds["B1"] = 2] = "B1";
        levelIds[levelIds["B2"] = 3] = "B2";
    })(blended.levelIds || (blended.levelIds = {}));
    var levelIds = blended.levelIds;
    //************ TASKS
    var task = (function () {
        function task(repository, taskId, completed) {
            var _this = this;
            this.repository = repository;
            this.taskId = taskId;
            this.getPersistData = function () {
                if (!_this.userData)
                    return null;
                var it = _this.userData[_this.taskId];
                return it ? it.data : null;
            };
            this.setPersistData = function (modify) {
                var it = _this.userData ? _this.userData[_this.taskId] : null;
                if (!it) {
                    it = { data: {}, modified: true };
                    if (!_this.userData)
                        _this.userData = {};
                    _this.userData[_this.taskId] = it;
                }
                else
                    it.modified = true;
                modify(it.data);
                return it.data;
            };
            var ud = this.getPersistData();
            if (!ud)
                ud = this.setPersistData(function (ud) {
                    _this.log('createStatus');
                    _this.initPersistData(ud);
                });
            this.log('createChild');
            this.createChild(ud, function () { return completed(_this); });
        }
        //posun zelenou sipkou
        task.prototype.goAhead = function (ctx) {
            var _this = this;
            var def = ctx.$q.defer();
            try {
                var ud = this.getPersistData();
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
                        //this.child = null;
                        _this.log('doMoveForward, child finished');
                        _this.doMoveForward(def, ud); //... ne, posun delam ja
                    });
                }
                else {
                    this.doMoveForward(def, ud); //neni child, udelej posun sam
                    this.log('doMoveForward');
                }
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
            this.createChild(ud, function () { return def.resolve(!ud.done); });
        };
        task.prototype.addToHistory = function (child, ud) {
            if (!ud.history)
                ud.history = [];
            var hist = { date: Utils.nowToNum(), url: child.repository.url, taskId: child.taskId };
            if (_.find(ud.history, function (h) { return h.url == hist.url && h.taskId == hist.taskId; }))
                return;
            ud.history.push(hist);
        };
        task.prototype.log = function (msg) {
            console.log('%%% ' + Utils.getObjectClassName(this) + ": " + msg + ' (' + this.repository.url + ')');
        };
        //********************** Virtualni procs
        //sance na asynchroni inicializaci self (nacteni dat pomoci ajaxu apod.)
        //init(ud: IPersistNodeUser, completed: () => void) { completed(); }
        //inicialni naplneni statusu (pri jeho prvnim vytvoreni)
        task.prototype.initPersistData = function (ud) {
            ud.url = this.repository.url;
            //ud.taskId = newGuid();
        };
        //posun stavu dal
        task.prototype.moveForward = function (ud) { throw 'notimplemented'; };
        //vytvoreni child status na zaklade aktualniho stavu
        task.prototype.createChild = function (ud, completed) { completed(); };
        return task;
    })();
    blended.task = task;
    var blendedCourseTask = (function (_super) {
        __extends(blendedCourseTask, _super);
        //cely produkt ma jedno globalni TASKID (ctx.taskid). Nastavuje se pri spusteni produktu (v MY.ts) na hodnotu 'def'.
        function blendedCourseTask(product, ctx, completed) {
            _super.call(this, blendedCourseTask.repositoryFromProduct(product), ctx.taskid, completed);
            this.product = product;
            this.ctx = ctx;
        }
        blendedCourseTask.repositoryFromProduct = function (prod) {
            var clonedLessons = _.map(_.range(0, 4), function (idx) { return (_.clone(prod.Items[idx].Items)); }); //pro kazdou level kopie napr. </lm/blcourse/english/a1/>.Items
            var firstPretests = _.map(clonedLessons, function (l) { return l.splice(0, 1)[0]; }); //z kopie vyndej prvni prvek (entry test) a dej jej do firstPretests;
            var res = {
                pretest: (prod.find('/lm/blcourse/' + LMComLib.LineIds[prod.line].toLowerCase() + '/pretests/')),
                entryTests: firstPretests,
                lessons: clonedLessons,
                Items: null, title: prod.title, url: prod.url
            };
            _.each((res.pretest.Items), function (it) {
                if (it.other)
                    $.extend(it, JSON.parse(it.other));
            });
            if (prod.other)
                prod.other = $.extend(prod, JSON.parse(prod.other));
            return res;
        };
        blendedCourseTask.prototype.initPersistData = function (ud) {
            _super.prototype.initPersistData.call(this, ud);
            ud.startDate = Utils.nowToNum();
            ud.pretest = { url: this.repository.pretest.url };
        };
        blendedCourseTask.prototype.createChild = function (ud, completed) {
            if (!ud.pretest.done) {
                this.child = new pretestTask(this.repository.pretest, this.taskId, completed);
            }
            else if (!ud.entryTest.done) {
                this.child = new testTask(this.repository.entryTests[ud.pretest.targetLevel], this.taskId, completed);
            }
            else if (!ud.lessons.done) {
                this.child = new listTask(this.repository.lessons[ud.pretest.targetLevel], this.taskId, completed);
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
                this.setPersistData(function (dt) { dt.pretest.done = true; dt.pretest.targetLevel = pretUser.targetLevel; dt.entryTest = { url: _this.repository.entryTests[dt.pretest.targetLevel].url }; });
            }
            else if (childUd.url == ud.entryTest.url) {
                var entryTestUser = childUd;
                if (!entryTestUser.done)
                    return 'tasks.course.doGoAhead: !entryTestUser.done';
                this.setPersistData(function (dt) { dt.entryTest.done = true; dt.entryTest.score = entryTestUser.score; dt.lessons = { url: _this.repository.lessons[dt.pretest.targetLevel].url }; });
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
        return blendedCourseTask;
    })(task);
    blended.blendedCourseTask = blendedCourseTask;
    var pretestTask = (function (_super) {
        __extends(pretestTask, _super);
        function pretestTask() {
            _super.apply(this, arguments);
        }
        pretestTask.prototype.initPersistData = function (ud) {
            _super.prototype.initPersistData.call(this, ud);
            ud.actLevel = levelIds.A2;
            ud.urls = [];
            ud.urls.push(this.actRepo(levelIds.A2).url);
        };
        pretestTask.prototype.moveForward = function (ud) {
            var childTest = (this.child);
            var actRepo = this.actRepo(ud.actLevel);
            var childUser = childTest.getPersistData();
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
            var act = _.find(this.repository.Items, function (l) { return l.level == ud.actLevel; });
            if (!act)
                throw '!act';
            this.child = new testTask(act, this.taskId, completed);
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
        pretestTask.prototype.actRepo = function (lev) { return _.find(this.repository.Items, function (l) { return l.level == lev; }); };
        return pretestTask;
    })(task);
    blended.pretestTask = pretestTask;
    var listTask = (function (_super) {
        __extends(listTask, _super);
        function listTask() {
            _super.apply(this, arguments);
        }
        listTask.prototype.initPersistData = function (ud) {
            _super.prototype.initPersistData.call(this, ud);
        };
        listTask.prototype.moveForward = function (ud) { ud.done = true; return null; };
        listTask.prototype.createChild = function (ud, completed) { completed(); };
        return listTask;
    })(task);
    blended.listTask = listTask;
    var testTask = (function (_super) {
        __extends(testTask, _super);
        function testTask() {
            _super.apply(this, arguments);
        }
        testTask.prototype.initPersistData = function (ud) {
            _super.prototype.initPersistData.call(this, ud);
        };
        testTask.prototype.moveForward = function (ud) { ud.done = true; return null; };
        testTask.prototype.createChild = function (ud, completed) { completed(); };
        return testTask;
    })(task);
    blended.testTask = testTask;
    var moduleTask = (function (_super) {
        __extends(moduleTask, _super);
        function moduleTask() {
            _super.apply(this, arguments);
        }
        moduleTask.prototype.initPersistData = function (ud) {
            _super.prototype.initPersistData.call(this, ud);
        };
        moduleTask.prototype.moveForward = function (ud) { ud.done = true; return null; };
        moduleTask.prototype.createChild = function (ud, completed) { completed(); };
        return moduleTask;
    })(task);
    blended.moduleTask = moduleTask;
    var exTask = (function (_super) {
        __extends(exTask, _super);
        function exTask() {
            _super.apply(this, arguments);
        }
        exTask.prototype.initPersistData = function (ud) {
            _super.prototype.initPersistData.call(this, ud);
        };
        exTask.prototype.moveForward = function (ud) { ud.done = true; return null; };
        exTask.prototype.createChild = function (ud, completed) { completed(); };
        return exTask;
    })(task);
    blended.exTask = exTask;
})(blended || (blended = {}));
