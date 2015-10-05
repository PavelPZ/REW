var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var testMe;
(function (testMe) {
    var Skills = (function () {
        function Skills() {
        }
        Skills.no = "no";
        Skills.UseLanguage = "UseLanguage";
        Skills.Reading = "Reading";
        Skills.Listening = "Listening";
        Skills.Speaking = "Speaking";
        Skills.Writing = "Writing";
        return Skills;
    })();
    testMe.Skills = Skills;
    testMe.tEx = "testExModel".toLowerCase();
    testMe.tResults = "testResultsModel".toLowerCase();
    testMe.tResult = "testResultModel".toLowerCase();
    var greenGreen = 0;
    var greenDone = 1;
    var notifier = (function () {
        function notifier() {
            this.progressBar = ko.observable(0);
            this.remaindSeconds = 0;
            this.active = ko.observable(false);
            this.progressText = ko.observable('');
            this.skillText = ko.observable('');
        }
        return notifier;
    })();
    testMe.notifier = notifier;
    testMe.notify = new notifier();
    function testTitle(test) { return !test ? '' : (!test.isDemoTest ? test.title : CSLocalize('20c1ce9cee3d4c02b9e9cb4a76fdb2f4', 'Demo test')); }
    var Model = (function (_super) {
        __extends(Model, _super);
        function Model(urlParts) {
            _super.call(this, testMe.tEx, urlParts);
            this.isPretest = false; //zobraz pretest stranku
            this.isHome = true; //zobraz home stranku
            this.makeInterruptionInEx = false; //ve cviceni vypln interruption
            this.isResult = false; //priznak cviceni v result stavu. Nastane pouze kdyz se naviguje na stranku testu s hotovym testem
            this.greenStatus = greenGreen; //stav zelene sipky, jedna z hodnot greenGreen, ...
            //exItems: Array<IExItem>; //navigace nad cvicenimi
            this.modStarts = {};
            this.actIdx = 0; //index aktualniho cviceni aktualniho modulu
            this.skipAdjustExModule = false;
            this.startTime = 0; //cas spusteni testu
            this.instrTitle = ko.observable("");
            this.instrBody = ko.observable("");
            //progressBar = ko.observable(0);
            //progressText = ko.observable('');
            this.notLowTime = ko.observable(true);
            this.testDisabled = ko.observable(false);
            this.needsRecording = ko.observable(false);
            this.needsPlaying = ko.observable(false);
            this.isDemoTest = ko.observable(true);
            this.testTitle = ko.observable('');
            this.hasDemotest = ko.observable(false);
            this.appId = testMe.appId;
        }
        Model.prototype.leave = function () {
            testMe.alowTestCreate_Url = null;
            //saveProduct($.noop);
        };
        Model.prototype.loaded = function () {
            var _this = this;
            if (!this.actTest || this.actTest.needs == CourseMeta.testNeeds.no)
                return;
            if (this.isHome) {
                var id = this.needsRecording() ? 'testForRecording' : 'testForPlaying';
                CourseMeta.processInlineControls(id.toLowerCase(), $.noop);
            }
            else
                SndLow.getGlobalMedia().adjustGlobalDriver(this.needsRecording(), function (dr, disabled) { return _this.testDisabled(disabled); });
        };
        Model.prototype.demoTestClick = function () {
            if (!this.actTest || !this.actTest.demoTestUrl)
                return;
            persistMemory.reset();
            var hash = testMe.createUrlPersist(testMe.tEx, CourseMeta.actCompanyId, this.actTest.demoTestUrl, schools.memoryPersistId);
            testMe.alowTestCreate_Url = this.actTest.demoTestUrl;
            window.location.hash = hash;
        };
        //  if (!this.actTest || this.actTest.needs == CourseMeta.testNeeds.no) return false;
        //  return this.actTest.needs == CourseMeta.testNeeds.recording;
        //}
        Model.prototype.doUpdate = function (completed) {
            var _this = this;
            var th = this;
            //CourseMeta.lib.adjustInstr(() => //nacteni a lokalizace insrukci
            CourseMeta.lib.adjustProduct(th.productUrl, th.persistence, function (justLoaded) {
                //*** multi test
                var multiTest = _this.multiTest();
                if (multiTest) {
                    if (!multiTest.level) {
                        th.isPretest = true;
                        th.isHome = false;
                        th.greenTitle = CSLocalize('cabaf1ac6e8e4e219201e43b28852705', 'Finish Self-evaluation form');
                        var questEx = _this.multiQuestionnaire();
                        CourseMeta.lib.adjustEx(questEx, function () { return CourseMeta.lib.displayEx(questEx, null, function (actEx) {
                            Logger.trace_course('testMe questEx: doUpdate end');
                        }); });
                        return;
                    }
                    else
                        th.actTest = _this.multiActTest();
                }
                else
                    //*** normalni test
                    th.actTest = CourseMeta.actCourseRoot;
                _this.needsRecording(_this.actTest.needs == CourseMeta.testNeeds.recording);
                _this.needsPlaying(_this.actTest.needs == CourseMeta.testNeeds.playing);
                _this.isDemoTest(!_this.actTest || _this.actTest.isDemoTest);
                _this.testTitle(testTitle(_this.actTest));
                _this.hasDemotest(_this.actTest && !!_this.actTest.demoTestUrl); //nastavuje se v ObjectModel\Model\CourseMeta.cs if (res2.line == LineIds.English), NewLMComModel\Design\CourseProducts.cs lang != CourseIds.English ? "needs=recording" : 
                //osetreni home
                if (th.isHome) {
                    th.greenTitle = CSLocalize('130c662ad53e4f5589557fdd620e47a5', 'Run test');
                    th.makeInterruptionInEx = !!th.actTest.interrupts;
                    if (!th.actTest.isDemoTest && testMe.alowTestCreate_Url != th.productUrl) {
                        location.href = '#';
                        return;
                    }
                    th.actTest.expandDynamicAll(); //expanze dynamickych modulu
                    th.findActModule(); //najdi aktualni modul
                    if (th.actModule == null) {
                        location.hash = createResultUrl();
                        return;
                    } //neni aktualni modul (tj. hotovo) => jdi na vysledek 
                }
                th.createSkillsModel();
                if (th.isHome) {
                    completed();
                    return;
                }
                if (!th.actTest.interrupts) {
                    th.actTest.interrupts = [];
                    th.actTest.started = Utils.dateToNum(new Date());
                    th.actTest.userPending = true;
                }
                if (th.makeInterruptionInEx) {
                    var beg = th.actTest.lastDate();
                    if (!beg)
                        beg = th.actTest.started;
                    th.actTest.interrupts.push({ beg: beg, end: Utils.nowToNum(), ip: Login.myData.IP });
                    th.makeInterruptionInEx = false;
                    th.actTest.userPending = true;
                }
                if (th.actModule.done) {
                    th.greenTitle = CSLocalize('4baea1f87da040baa7431720c340eac2', 'Finish');
                    th.greenIcon = 'fast-forward';
                }
                else {
                    th.greenTitle = CSLocalize('ae062730194a47a58d7e8b4b04a0e299', 'Continue');
                    th.greenIcon = 'play';
                }
                var actEx = th.getActEx();
                //un-done, aby se cviceni neukazovalo vyhodnocene
                _this.exWasDone = actEx.done;
                actEx.done = false;
                //display ex
                saveProduct(function () {
                    return CourseMeta.lib.adjustEx(actEx, function () { return CourseMeta.lib.displayEx(actEx, null, function (actEx) {
                        Logger.trace_course('testMe: doUpdate end');
                        th.instrTitle(actEx.page.instrTitle);
                        th.instrBody(_.map(actEx.page.instrs, function (s) { var res = CourseMeta.instructions[s.toLowerCase()]; return res ? res : (_.isEmpty(s) ? "" : "Missing [" + s + "] instruction"); }).join());
                        th.startTimer(); //adjustace mereni casu
                        //completed(); completed je osetreno v displayEx. Pri completed by knockout hlasil vicenasobny binding.
                    }); });
                });
            });
        };
        Model.prototype.multiTest = function () { return CourseMeta.isType(CourseMeta.actCourseRoot, CourseMeta.runtimeType.multiTest) ? CourseMeta.actCourseRoot : null; };
        Model.prototype.multiQuestionnaire = function () { return (_.find(this.multiTest().Items, function (it) { return CourseMeta.isType(it, CourseMeta.runtimeType.multiQuestionnaire); }).Items[0]); };
        Model.prototype.multiActTest = function () {
            var mt = this.multiTest();
            var end = '/' + mt.level + '/';
            return (_.find(mt.Items, function (dt) { return Utils.endsWith(dt.url, end); }));
        };
        Model.prototype.htmlClearing = function () {
            testMe.notify.active(false);
            if (CourseMeta.actExPageControl && CourseMeta.actExPageControl.sndPage)
                CourseMeta.actExPageControl.sndPage.htmlClearing();
            this.clearTimer();
        };
        Model.prototype.startTimer = function () {
            var _this = this;
            var th = this;
            if (th.timer)
                return;
            th.startTime = Utils.nowToNum();
            var saveCounter = 0;
            testMe.notify.active(true);
            th.timer = setInterval(function () {
                if (!th.actModule || !th.actTest || savingProduct)
                    return;
                //inicializace casovych informaci modulu
                var initElapsed = th.actModule.elapsed;
                if (!initElapsed)
                    initElapsed = 0; //udaj z databaze
                var startElapsed = th.modStarts[th.actModule.url];
                if (!startElapsed)
                    th.modStarts[th.actModule.url] = startElapsed = Utils.nowToNum() - initElapsed; //udaj pri startu modulu
                //vypocet
                var newElapsed = Utils.nowToNum() - startElapsed; //novy elapsed
                var maxElapsed = (cfg.testGroup_debug ? 2 : th.actModule.minutes) * 60;
                var done = newElapsed >= maxElapsed;
                if (done)
                    newElapsed = maxElapsed;
                th.actModule.elapsed = newElapsed;
                th.actModule.end = Utils.nowToNum();
                th.actModule.userPending = true;
                if (done) {
                    th.clearTimer();
                    testMe.notify.progressBar(0);
                    testMe.notify.remaindSeconds = 0;
                    testMe.notify.progressText(CSLocalize('fc80a4f55fcd438c88417436eb8a20ea', 'Time limit for this section has expired!'));
                    console.log('testme: before Time limit expired');
                    anim.alert().show(CSLocalize('d3e3441ec93045d0afd3e9ff25049570', 'Time limit for this section has expired.'), function (ok) {
                        console.log('testme: after Time limit expired');
                        _this.eval(false);
                        th.finishModule();
                    }, function () { return anim.alert().isCancelVisible(false); });
                }
                else {
                    var percent = 100 - 100 * newElapsed / maxElapsed;
                    th.notLowTime(percent > 15);
                    testMe.notify.remaindSeconds = maxElapsed - newElapsed;
                    testMe.notify.progressBar(percent);
                    testMe.notify.progressText(Utils.formatTimeSpan(maxElapsed - newElapsed));
                    if (saveCounter > 20) {
                        saveProduct($.noop);
                        saveCounter = 0;
                    }
                    else
                        saveCounter++;
                }
            }, 500);
            //}, 500);
        };
        Model.prototype.eval = function (markDone) {
            var ex = this.getActEx();
            if (!ex || !ex.evaluator)
                return;
            ex.testEvaluate();
            delete ex.beg;
            ex.done = markDone || this.exWasDone;
            //if (!ex.testDone && markDone) ex.testDone = true;
            //soucet elapsed vsech cviceni testu
            var exElapsed = 0;
            _.each(this.actTest.Items, function (m) { return _.each(m.Items, function (ex) { if (ex.elapsed)
                exElapsed += ex.elapsed; }); });
            //soucet elapsed vsech modulu
            var modElapsed = 0;
            _.each(this.actTest.Items, function (t) { return modElapsed += t.elapsed; });
            //uprav elapsed aktualniho cviceni
            if (modElapsed > exElapsed)
                ex.elapsed += Math.floor(modElapsed - exElapsed);
            //aktualizuj moduly a test
            CourseMeta.actCourseRoot.refreshNumbers();
        };
        Model.prototype.finishModule = function () {
            var _this = this;
            Logger.trace_course('testMe: finishModule start');
            this.clearTimer();
            //_.each(this.actModule.Items, (ex: CourseMeta.exImpl) => { if (!ex.done) { ex.s = 0; ex.done = true; ex.userPending = true; } });
            _.each(this.actModule.Items, function (ex) { if (ex.done)
                return; ex.done = true; ex.userPending = true; });
            CourseMeta.actCourseRoot.refreshNumbers();
            this.actModule.end = Utils.nowToNum();
            this.actModule.userPending = true;
            this.findActModule();
            if (this.actModule == null) {
                this.actTest.ms = 0;
                _.each(this.actTest.Items, function (it) { return _this.actTest.ms += it.ms; });
                saveProduct(function () {
                    return CourseMeta.lib.actPersistence().createArchive(LMStatus.Cookie.id, CourseMeta.actCompanyId, CourseMeta.actProduct.url, function (archiveId) {
                        //aktualni produkt je na serveru prejmenovan, prejmenuj i na klientovi
                        CourseMeta.actProduct.url += '|' + archiveId.toString();
                        _this.productUrl = CourseMeta.actProduct.url;
                        _this.actTest.createEmptyResult(archiveId); //vytvor test result
                        _this.actTest.adjustResult(); //vytvor test result
                        saveProduct(function () {
                            Login.adjustMyData(true, function () {
                                Logger.trace_course('testMe: finishModule, test end');
                                window.location.hash = createResultUrl(); //jdi na result stranku
                            });
                        });
                    });
                });
            }
            else {
                saveProduct(function () {
                    Logger.trace_course('testMe: finishModule end');
                    Pager.reloadPage();
                });
            }
        };
        Model.prototype.findActModule = function () {
            var th = this;
            CourseMeta.actCourseRoot.refreshNumbers();
            //if (!th.actModule) {
            th.actModule = (_.find(th.actTest.Items, function (it) { return !it.done; }));
            if (!th.actModule) {
                th.actTest.done = true;
                return;
            }
            if (!th.actModule.beg)
                th.actModule.beg = Utils.nowToNum();
            th.actIdx = 0;
        };
        Model.prototype.doGreenClick = function () {
            var _this = this;
            if (this.testDisabled())
                return;
            if (this.isHome) {
                this.isHome = false;
                Pager.reloadPage();
            }
            else if (this.isPretest) {
                var multiEx = this.multiQuestionnaire();
                //var selected: { [grpId: string]: string; } = {};
                var levToScore = { 'a1': 1, 'a2': 2, 'b1': 3, 'b2': 4, 'c1': 5, 'c2': 6 };
                var numToLev = ['a1', 'a2', 'b1', 'b2', 'c1', 'c2'];
                var levComplBoundary = [6, 10, 14, 18, 22, 24];
                var levStdBoundary = [3, 5, 7, 9, 11, 12];
                var score = 0;
                var isAll = true;
                var singleSels = multiEx.page.evalPage.Items[0].Items;
                _.each(singleSels, function (grp) {
                    var ctrl = (_.find(grp.evalControls, function (r) { return r.selected(); }));
                    //selected[grp.id.substr(6)] = ctrl ? ctrl.id.substr(ctrl.id.length-2) : null;
                    if (!ctrl)
                        isAll = false;
                    else
                        score += levToScore[ctrl.id.substr(ctrl.id.length - 2)];
                });
                if (!isAll) {
                    anim.alert().show(CSLocalize('5ae8d0cbcd5e44b68843f2010ec215b7', 'Fill in all parts of the self-evaluation form'), $.noop, function () { return anim.alert().isCancelVisible(false); });
                    return;
                }
                var boundaries = singleSels.length == 4 ? levComplBoundary : levStdBoundary; //aktualni hranice pro skore
                var multiTest = this.multiTest();
                for (var i = 0; i < boundaries.length; i++)
                    if (score <= boundaries[i]) {
                        multiTest.level = numToLev[i];
                        break;
                    }
                anim.alert().show(CSLocalize('8f8d748c9209489b8710fa30b10905d3', 'The following test will be started now') + ':<p class="text-info"><b>' + this.multiActTest().title + '</b></p>', function () {
                    multiTest.userPending = true;
                    _this.isPretest = false;
                    _this.isHome = true;
                    Pager.blockGui(true);
                    saveProduct(Pager.reloadPage);
                }, function () { return anim.alert().isCancelVisible(false); });
            }
            else if (this.isResult) {
                debugger;
                throw 'this.isResult';
            }
            else {
                if (!this.actModule)
                    throw '!this.actModule';
                this.eval(true); //vyhodnot cviceni
                if (this.actModule.done) {
                    anim.alert().show(this.finishText(), function (ok) {
                        console.log('testme: in finish');
                        if (ok === true) {
                            Pager.blockGui(true);
                            setTimeout(function () { return _this.finishModule(); }, 1);
                        }
                        else if (ok === false) {
                            _this.greenStatus = greenDone; //jeste kontroluj cviceni
                            Pager.blockGui(true);
                            _this.actIdx++;
                            if (_this.actIdx >= _this.actModule.Items.length)
                                _this.actIdx = 0; //dalsi cviceni
                            saveProduct(Pager.reloadPage);
                        }
                    });
                }
                else {
                    Pager.blockGui(true);
                    this.actIdx++;
                    if (this.actIdx >= this.actModule.Items.length)
                        this.actIdx = 0; //dalsi cviceni
                    saveProduct(Pager.reloadPage);
                }
            }
        };
        //actModuleDone(): boolean { return this.actModule && _.all(this.actModule.Items, (e: CourseMeta.exImpl) => e.done); }
        Model.prototype.doSkipClick = function () {
            Pager.blockGui(true);
            this.eval(false);
            this.actIdx++;
            if (this.actIdx >= this.actModule.Items.length)
                this.actIdx = 0; //dalsi cviceni
            saveProduct(Pager.reloadPage);
        };
        Model.prototype.doExClick = function (newIdx) {
            Pager.blockGui(true);
            this.eval(false);
            this.actIdx = newIdx;
            saveProduct(Pager.reloadPage);
        };
        Model.prototype.doFinishClick = function () {
            var _this = this;
            this.eval(false); //vyhodnot cviceni
            console.log('testme: before force finish');
            anim.alert().show(this.finishText(), function (ok) {
                console.log('testme: in force finish');
                if (!ok)
                    return;
                console.log('testme: in force finish ok');
                Pager.blockGui(true);
                setTimeout(function () { return _this.finishModule(); }, 1);
            });
            //if (!confirm(this.finishText())) return;
            //Pager.blockGui(true);
            //setTimeout(() => this.finishModule(), 1);
        };
        Model.prototype.finishText = function () { return '<p class="text-info"><b>' + CSLocalize('883fd55fbeb14d3a9461ffc130bfb6fa', 'Finishing of the section') + '</b></p>' + CSLocalize('8705c1b208864ed1aba65ab1697bb816', 'Do you really want to finish this section?') + '<br/>' + CSLocalize('92e75ac9aeb44296878c7bcff2ecc030', 'After that you will not be allowed to check and correct your answers.'); };
        Model.skillText = function (skill) {
            switch (skill) {
                case testMe.Skills.UseLanguage: return CSLocalize('eaddb5e3f7be4215abc0174d0e5b25e8', 'Grammar and  Vocabulary');
                case testMe.Skills.Reading: return CSLocalize('74cebd49d27c458cb7393fdc3efa5131', 'Reading');
                case testMe.Skills.Speaking: return CSLocalize('55989a271c5e490d8323792e5be89ac6', 'Speaking');
                case testMe.Skills.Listening: return CSLocalize('701d44c0f6e648b4ba6c20a98d3a2a8e', 'Listening');
                case testMe.Skills.Writing: return CSLocalize('8e2f5a7271a6408884371e33fd5ed593', 'Writing');
                default: return skill;
            }
        };
        Model.prototype.createSkillsModel = function () {
            var _this = this;
            if (this.isResult) {
                debugger;
                throw 'this.isResult';
            }
            var res = [];
            res.push({ title: CSLocalize('02bea28a09a847cca2488a6791e87e2a', 'Introduction'), active: this.isHome ? 'active' : '' });
            _.each((this.actTest.Items), function (it) { return res.push({ title: Model.skillText(it.skill), active: !_this.isHome && _this.actModule == it ? 'active' : '' }); });
            res.push({ title: CSLocalize('ba059f7aff4a4a2f965ffb17656b0e60', 'Results'), active: '' });
            //res.push({ title: 'Vysledky', active: this.isResult ? 'active' : '' });
            this.skills = res;
            var act = _.find(res, function (r) { return r.active != ''; });
            testMe.notify.skillText(/*this.skillSmall =*/ act.title);
            this.skillSmallStatus = act == res[0] ? 0 : (act == res[res.length - 1] ? 2 : 1);
        };
        Model.prototype.clearTimer = function () { if (!this.timer)
            return; clearInterval(this.timer); this.timer = null; };
        Model.prototype.getActEx = function () { return this.actModule && this.actModule.Items[this.actIdx] ? (this.actModule.Items[this.actIdx]) : null; };
        return Model;
    })(schools.Model);
    testMe.Model = Model;
    var SkillItemLabel = (function () {
        function SkillItemLabel() {
        }
        return SkillItemLabel;
    })();
    testMe.SkillItemLabel = SkillItemLabel; //model pro prehled skills v navbaru
    function saveProduct(completed) {
        savingProduct = true;
        CourseMeta.lib.saveProduct(function () { savingProduct = false; completed(); });
    }
    var savingProduct;
    //Bezpecne save produktu: pokud je nejake jine save rozbehnute, pozdrzi se az do dobehnuti posledniho.
    //http://jsfiddle.net/L5nud/111/
    function saveProduct_(completed) {
        Logger.trace_course('saveProduct: testMe start');
        promise = promise.then(saveProductLow(function () { Logger.trace_course('saveProduct: testMe end'); completed(); })); //zarad dalsi pozadavek na konec nedokoncenych pozadavku
    }
    function saveProductLow(completed) {
        var deferred = $.Deferred();
        CourseMeta.lib.saveProduct(deferred.resolve);
        return function () { return deferred.promise().then(completed); };
    }
    var promise = $.when($.noop);
    var multiTestImpl = (function (_super) {
        __extends(multiTestImpl, _super);
        function multiTestImpl() {
            _super.apply(this, arguments);
        }
        //persistence
        multiTestImpl.prototype.setUserData = function (data) {
            if (!data) {
                data = { level: null };
                this.userPending = true;
            }
            this.level = data.level;
        };
        multiTestImpl.prototype.getUserData = function (setData) {
            var dt = { level: this.level };
            setData(JSON.stringify(dt), null, CourseModel.CourseDataFlag.multiTestImpl, null);
        };
        return multiTestImpl;
    })(CourseMeta.courseNode);
    testMe.multiTestImpl = multiTestImpl;
    var testImpl = (function (_super) {
        __extends(testImpl, _super);
        function testImpl() {
            _super.call(this);
            this.ip = Login.myData.IP;
            this.interrupts = null;
        }
        testImpl.prototype.doReset = function () {
            _.each(this.Items, function (it) { return it.doReset(); });
            this.interrupts = null;
            this.ip = Login.myData.IP;
            this.done = false;
        };
        testImpl.prototype.lastDate = function () { var max = 0; _.each(this.Items, function (it) { return max = Math.max(max, it.end); }); return max; };
        testImpl.prototype.createEmptyResult = function (id) {
            this.result = {
                domain: Pager.basicDir.substr(Pager.basicDir.lastIndexOf('//') + 2),
                id: id,
                firstName: LMStatus.Cookie.FirstName,
                lastName: LMStatus.Cookie.LastName,
                eMail: LMStatus.Cookie.EMail ? LMStatus.Cookie.EMail : LMStatus.Cookie.LoginEMail,
                title: testTitle(this),
                ip: this.ip,
                interrupts: this.interrupts,
                skills: _.map(this.Items, function (sk) {
                    //posledi 3 polozku se aktualizuji az v adjustResult (adjustResult se vola jednouna konci testu a opakovan pri humanEval)
                    var res = { title: sk.title, skill: sk.skill, elapsed: sk.elapsed, finished: sk.end, started: sk.beg, ms: sk.ms, s: 0, flag: 0, scoreWeight: 0 };
                    return res;
                }),
                company: _.find(Login.myData.Companies, function (c) { return c.Id == CourseMeta.actCompanyId; }).Title,
                score: 0,
                flag: 0,
                //score: 0,
                productUrl: CourseMeta.actProduct.url,
                lmcomId: schools.LMComUserId(),
                companyId: CourseMeta.actCompanyId,
                level: this.level
            };
        };
        testImpl.prototype.adjustResult = function () {
            var _this = this;
            //aktualni flag a skore (protoze adjustResult se vola jek na konci testu tak i po human eval testu)
            this.result.flag = 0;
            _.each(this.Items, function (sk) {
                var skResult = _.find(_this.result.skills, function (s) { return s.skill == sk.skill; });
                skResult.flag = sk.flag;
                skResult.s = sk.s;
                skResult.scoreWeight = sk.scoreWeight;
                _this.result.flag |= sk.flag;
            });
            //score weights
            var wsum = 0, wcnt = 0;
            _.each(this.result.skills, function (sk) { if (!sk.scoreWeight)
                return; wsum += sk.scoreWeight; wcnt++; });
            if (wsum > 100) {
                debugger;
                throw 'wsum > 100';
            }
            var wempty = (100 - wsum) / (this.Items.length - wcnt); //pocet procent pro undefined scoreWeight
            //dosad weights, aby jejich soucet byl 100
            var wintSum = 0;
            _.each(this.result.skills, function (sk) { return wintSum += sk.scoreWeight = Math.round(sk.scoreWeight ? sk.scoreWeight : wempty); });
            if (wintSum > 100 || wintSum < 98) {
                debugger;
                throw 'wintSum > 100 || wintSum < 98';
            } // neco je spatne
            if (wintSum < 100)
                this.result.skills[0].scoreWeight += 100 - wintSum;
            if (!Course.needsHumanEval(this.result.flag)) {
                //vazeny prumer
                var ssum = 0;
                _.each(this.result.skills, function (sk) { return ssum += Course.scorePercent(sk) * sk.scoreWeight; });
                this.result.score = Math.round(ssum / 100);
            }
            this.userPending = true;
        };
        //persistence
        testImpl.prototype.setUserData = function (data) {
            if (!data) {
                data = { interrupts: null, ip: Login.myData.IP, started: Utils.dateToNum(new Date()) };
                this.userPending = true;
            }
            this.started = data.started;
            this.ip = data.ip;
            this.interrupts = data.interrupts;
        };
        testImpl.prototype.getUserData = function (setData) {
            var dt = { interrupts: this.interrupts, ip: Login.myData.IP, started: this.started };
            setData(JSON.stringify(dt), null, this.flag | CourseModel.CourseDataFlag.testImpl, null);
            if (this.result)
                setData(null, JSON.stringify(this.result), this.flag | CourseModel.CourseDataFlag.testImpl_result, testImpl.resultKey);
        };
        testImpl.prototype.expandDynamicAll = function () {
            var res = false;
            CourseMeta.scan(this, function (nd) {
                if (!CourseMeta.isType(nd, CourseMeta.runtimeType.taskTestSkill))
                    return;
                if (nd.expandDynamic())
                    res = true;
                //prevzeti informaci z dynamicModuleData
                //var dynData: CourseMeta.dynamicModuleData = <CourseMeta.dynamicModuleData><any>(nd.oldItems[0]);
                //nd.minutes = dynData.minutes ? dynData.minutes : 0; nd.skill = dynData.skill ? dynData.skill : 0; nd.scoreWeight = dynData.scoreWeight ? dynData.scoreWeight : 0;
            });
            return res;
        };
        testImpl.resultKey = 'result';
        return testImpl;
    })(CourseMeta.courseNode);
    testMe.testImpl = testImpl;
    var testSkillImpl = (function (_super) {
        __extends(testSkillImpl, _super);
        function testSkillImpl() {
            _super.call(this);
            this.beg = this.end = this.elapsed = 0;
        }
        testSkillImpl.prototype.refreshNumbers = function (exCountOnly) {
            if (exCountOnly === void 0) { exCountOnly = false; }
            var th = this;
            th.exCount = th.Items.length;
            th.s = th.flag = 0;
            th.done = true;
            _.each(th.Items, function (it) { it.refreshNumbers(); it.complNotPassiveCnt = 1; if (!it.s)
                it.s = 0; th.s += it.s; th.done = th.done && it.done; th.flag = Course.agregateFlag(th.flag, it.flag); });
            th.complPassiveCnt = 0;
            th.complNotPassiveCnt = th.Items.length;
        };
        testSkillImpl.prototype.setUserData = function (data) {
            _super.prototype.setUserData.call(this, data.modUrls);
            this.beg = data.started;
            this.end = data.finished;
            this.elapsed = data.elapsed;
        };
        testSkillImpl.prototype.getUserData = function (setData) {
            var data = { modUrls: _.map(this.Items, function (it) { return it.url; }), started: this.beg, finished: this.end, elapsed: this.elapsed };
            setData(JSON.stringify(data), null, this.flag | CourseModel.CourseDataFlag.testSkillImpl, null);
        };
        return testSkillImpl;
    })(CourseMeta.modImpl);
    testMe.testSkillImpl = testSkillImpl;
    function createUrlPersist(type, companyId, productUrl, persistence) {
        return oldPrefix + [testMe.appId, type, companyId.toString(), encodeUrlHash(productUrl), persistence].join(hashDelim);
    }
    testMe.createUrlPersist = createUrlPersist;
    function createUrlCompl(type, companyId, productUrl) {
        return createUrlPersist(type, companyId, encodeUrlHash(productUrl), CourseMeta.actProductPersistence);
    }
    testMe.createUrlCompl = createUrlCompl;
    function createResultUrl(companyId, productUrl) {
        if (companyId === void 0) { companyId = 0; }
        if (productUrl === void 0) { productUrl = null; }
        return createUrlCompl(testMe.tResult, companyId ? companyId : CourseMeta.actCompanyId, productUrl ? productUrl : CourseMeta.actProduct.url);
        //return [appId, type ? type : tEx, companyId ? companyId : CourseMeta.actCompanyId, productUrl ? productUrl : CourseMeta.actProduct.url].join(hashDelim);
    }
    testMe.createResultUrl = createResultUrl;
    //Pager.registerAppLocator(appId, tEx, (urlParts, completed) => completed(new Model(urlParts)));
    blended.oldLocators.push(function ($stateProvider) { return blended.registerOldLocator($stateProvider, testMe.tEx, testMe.appId, testMe.tEx, 3, function (urlParts) { return new Model(urlParts); }); });
})(testMe || (testMe = {}));
