var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
// <reference path="../jslib/jsd/knockout.d.ts" />
var schoolMy;
(function (schoolMy) {
    var errWrongFormat = function () { return CSLocalize('52e17a9a1f654e1893f5cb9131cc1762', 'Incorrect format of the License key. Please, check if you entered it correctly.'); };
    var errUsed = function () { return CSLocalize('28df461f6e2c47f7a8cde96ed974be9e', 'License key used by another user'); };
    var errAdded = function () { return CSLocalize('7a824dbe23b34680b5149663ac66ed24', 'License key already entered'); };
    var errOK = function () { return CSLocalize('6e8be0cf1d8e411cb0876ae1aea57c4c', 'License key accepted'); };
    var Model = (function (_super) {
        __extends(Model, _super);
        function Model() {
            var _this = this;
            _super.call(this, schools.tMy, null);
            this.licKey = validate.create(validate.types.rangelength, function (prop) {
                prop.min = 8;
                prop.max = 8;
            });
            this.licKeyOK = function () {
                _this.licKey.message('');
                if (!validate.isPropsValid([_this.licKey]))
                    return;
                var k;
                try {
                    k = keys.fromString(_this.licKey());
                }
                catch (err) {
                    _this.licKey.message(errWrongFormat());
                    return;
                }
                Pager.ajaxGet(Pager.pathType.restServices, Login.CmdEnterLicKey_Type, LMStatus.createCmd(function (r) { r.CompLicId = k.licId; r.Counter = k.counter; }), 
                //Login.CmdEnterLicKey_Create(LMStatus.Cookie.id, k.licId, k.counter),
                //Login.CmdEnterLicKey_Create(LMStatus.Cookie.id, k.licId, k.counter),
                function (res) {
                    switch (res.res) {
                        case Login.EnterLicenceResult.ok:
                            //this.licKey.message(errOK());
                            _this.licKey("");
                            Login.adjustMyData(true, function () { return Pager.reloadPage(_this); });
                            anim.collapseExpanded();
                            //Pager.closePanels();
                            return;
                        case Login.EnterLicenceResult.added:
                            _this.licKey.message(errAdded());
                            return;
                        case Login.EnterLicenceResult.used:
                            _this.licKey.message(errUsed());
                            return;
                        case Login.EnterLicenceResult.wrongCounter:
                        case Login.EnterLicenceResult.wrongId:
                            _this.licKey.message(errWrongFormat());
                            return;
                    }
                });
            };
        }
        Model.prototype.doUpdate = function (completed) {
            var _this = this;
            this.systemAdmin = Login.isSystemAdmin() ? function () { return LMStatus.setReturnUrlAndGoto("schoolAdmin@schoolAdminModel"); } : null;
            //var hasCompany = /*this.systemAdmin != null || Login.companyExists();
            if (Login.companyExists()) {
                this.companies = _.map(Login.myData.Companies, function (c) {
                    TreeView.adjustParents(c.DepTree.Departments);
                    var comp = {
                        title: c.Title, items: [], courses: null, data: c,
                        department: ko.observable(c.PublisherOwnerUserId != 0 ? null : TreeView.findNode(c.DepTree.Departments, function (d) { return d.Id == c.DepSelected; })),
                        treeViewModel: null
                    };
                    if (c.DepTree.Departments)
                        comp.treeViewModel = new TreeView.Model(c.DepTree.Departments, false, null, {
                            withCheckbox: false,
                            editable: false,
                            onLinkClick: function (nd) {
                                Pager.ajaxGet(Pager.pathType.restServices, Login.CmdSaveDepartment_Type, Login.CmdSaveDepartment_Create(LMStatus.Cookie.id, c.Id, (nd.data).Id), function (res) {
                                    comp.department((nd.data));
                                    anim.collapseExpanded();
                                });
                            }
                        });
                    var it;
                    if ((c.RoleEx.Role & LMComLib.CompRole.Admin) != 0)
                        comp.items.push(it = {
                            id: 'manage_admin',
                            title: CSLocalize('7dbd71d1e623446e884febbd07c72f9f', 'Manage administrators and their roles'),
                            gotoItem: function () { return location.hash = schoolAdmin.getHash(schoolAdmin.compAdminsTypeName, c.Id); }
                        });
                    if ((c.RoleEx.Role & LMComLib.CompRole.Products) != 0)
                        comp.items.push(it = {
                            id: 'manage_products',
                            title: CSLocalize('fd0acec43f7d487ba635b4a55343b23a', 'Manage products'),
                            gotoItem: function () { return location.hash = schoolAdmin.getHash(schoolAdmin.productsTypeName, c.Id); }
                        });
                    if ((c.RoleEx.Role & LMComLib.CompRole.Keys) != 0)
                        comp.items.push(it = {
                            id: 'gen_keys',
                            title: CSLocalize('643da9a0b02b4e209e26e20ca620f54c', 'Generate license keys'),
                            gotoItem: function () { return location.hash = schoolAdmin.getHash(schoolAdmin.keyGenTypeName, c.Id); }
                        });
                    if ((c.RoleEx.Role & LMComLib.CompRole.Department) != 0)
                        comp.items.push(it = {
                            id: 'edit_criteria',
                            title: CSLocalize('9231de5764184fd7a75389aa2ecfdad5', 'Edit Department structure and criteria for tracking study results'),
                            gotoItem: function () { return location.hash = schoolAdmin.getHash(schoolAdmin.editDepartmentTypeName, c.Id); }
                        });
                    if ((c.RoleEx.Role & LMComLib.CompRole.Results) != 0)
                        comp.items.push(it = {
                            id: 'view_students_results',
                            title: CSLocalize('2fb8a691d86e4f4181dba3f48708a363', 'View Student results'),
                            gotoItem: function () { return location.hash = schoolAdmin.getHash(schoolAdmin.schoolUserResultsTypeName, c.Id); }
                        });
                    if ((c.RoleEx.Role & LMComLib.CompRole.HumanEvalator) != 0)
                        comp.items.push(it = {
                            id: 'human_eval',
                            title: CSLocalize('f8fce20059f24b5e82b52bd41fef4bd4', 'Evaluate Speaking and Writing skills'),
                            gotoItem: function () { return location.hash = schoolAdmin.getHash(schoolAdmin.humanEvalTypeName, c.Id); }
                        });
                    if ((c.RoleEx.Role & LMComLib.CompRole.HumanEvalManager) != 0)
                        comp.items.push(it = {
                            id: 'human_eval_manager',
                            title: CSLocalize('e72a70b3d05244759ea5469440921ff2', 'Assign Tests to Evaluators'),
                            gotoItem: function () { return location.hash = schoolAdmin.getHash(schoolAdmin.humanEvalManagerLangsTypeName, c.Id); }
                        });
                    //if ((c.RoleEx.Role & LMComLib.CompRole.HumanEvalManager) != 0) comp.items.push(it = {
                    //  id: 'human_eval_manager',
                    //  title: CSLocalize('6e852a7128f54a27b9fb667b03b48a6e', 'Advanced assign to evaluators'),
                    //  gotoItem: () => location.hash = schoolAdmin.getHash(schoolAdmin.humanEvalManagerExTypeName, c.Id)
                    //});
                    if ((c.RoleEx.Role & LMComLib.CompRole.HumanEvalManager) != 0)
                        comp.items.push(it = {
                            id: 'human_evaluators',
                            title: CSLocalize('bce009c57f4b418c9ff42e30c7998479', 'Configure Evaluators'),
                            gotoItem: function () { return location.hash = schoolAdmin.getHash(schoolAdmin.humanEvalManagerEvsTypeName, c.Id); }
                        });
                    comp.courses = [];
                    //kurzy, k nimz mam licenci
                    _.each(c.Courses, function (crs) {
                        if (crs.isAuthoredCourse && (c.RoleEx.Role & LMComLib.CompRole.Publisher) == 0)
                            return;
                        var pr = CourseMeta.lib.findProduct(crs.ProductId);
                        if (pr == null)
                            return;
                        comp.courses.push(_this.courseLinkFromProduct(pr, comp, crs));
                    });
                    comp.courses = _.sortBy(comp.courses, function (c) { return !c.data.isAuthoredCourse; });
                    return comp;
                });
                this.companies = _.sortBy(this.companies, function (c) { return c.data.PublisherOwnerUserId == 0; });
            }
            completed();
        };
        Model.prototype.courseLinkFromProduct = function (pr, comp, crs) {
            var persistence = crs.isAuthoredCourse ? schools.memoryPersistId : null;
            return {
                //isPublIndiv: crs==null,
                expired: crs.Expired <= 0 ? new Date() : Utils.intToDate(crs.Expired),
                line: pr.line, title: pr.title, prodId: pr.url, isTest: CourseMeta.lib.isTest(pr),
                data: crs,
                myCompany: comp,
                gotoUrl: function (dt) {
                    if (dt.isTest && dt.data.LicCount == 0)
                        return;
                    if (comp.data.PublisherOwnerUserId == 0 && dt.myCompany.data.DepTree && dt.myCompany.data.DepTree.Departments && !dt.myCompany.department()) {
                        alert(CSLocalize('a85c8a527bb44bda9a7ee0721707d2ef', 'Choose company department (by clicking on [Change] link above)'));
                        return;
                    }
                    var hash = dt.isTest ? testMe.createUrlPersist(testMe.tEx, comp.data.Id, pr.url, persistence) : new CourseMeta.dataImpl().hrefCompl(comp.data.Id, pr.url, persistence);
                    if (dt.isTest)
                        testMe.alowTestCreate_Url = pr.url;
                    window.location.hash = hash;
                },
                gotoArchive: function (dt) {
                    window.location.hash = testMe.createUrlPersist(testMe.tResults, comp.data.Id, pr.url, persistence);
                }
            };
        };
        Model.prototype.licKeyMsg = function () {
            switch (cfg.designId) {
                case 'skrivanek': return 'Pro získání klíče zašlete email s informací o požadovaném jazyce na <a href="mailto:onlinetesty@skrivanek.cz">onlinetesty@skrivanek.cz</a>.';
                default: return null;
            }
        };
        return Model;
    })(schools.Model);
    schoolMy.Model = Model;
    Pager.registerAppLocator(schools.appId, schools.tMy, function (urlParts, completed) { return completed(new schoolMy.Model()); });
})(schoolMy || (schoolMy = {}));

/// <reference path="../courses/Course.ts" />
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var CourseMeta;
(function (CourseMeta) {
    CourseMeta.instructions = null;
    //export function hasCtxGramm(): bool { return actEx.page.seeAlso && actEx.page.seeAlso.length > 0; }
    var ModelEx = (function (_super) {
        __extends(ModelEx, _super);
        function ModelEx(urlParts) {
            _super.call(this, schools.tEx, urlParts);
            this.instrTitle = ko.observable("");
            this.instrBody = ko.observable("");
            this.seeAlsoTemplateSmall = ko.observable("Dummy");
            this.seeAlsoTemplate = ko.observable("Dummy");
            CourseMeta.actExModel = this;
        }
        //seeAlsoClick(idx: number) { gui.gotoData(this.seeAlso[idx]); }
        ModelEx.prototype.leave = function () {
            if (CourseMeta.actEx && CourseMeta.actEx.page && CourseMeta.actEx.page.sndPage)
                CourseMeta.actEx.page.sndPage.leave();
        };
        ModelEx.prototype.doUpdate = function (completed) {
            var _this = this;
            var th = this; //var u: schools.Url = <any>this.url;
            //lib.adjustInstr(() => //nacteni a lokalizace Schools\EAData\instructions.json
            CourseMeta.lib.onChangeUrl(th.productUrl, this.persistence, th.url, function (ex) {
                return CourseMeta.lib.doRefresh(function () {
                    return CourseMeta.lib.displayEx(ex, function (loadedEx) {
                        _this.cpv = new schoolCpv.model(schools.tExCpv, null);
                        DictConnector.initDict(CourseMeta.actModule.dict);
                    }, function (loadedEx) {
                        th.instrTitle(CourseMeta.actEx.page.instrTitle);
                        th.instrBody(_.map(CourseMeta.actEx.page.instrs, function (s) { var res = CourseMeta.instructions[s.toLowerCase()]; return res ? res : (_.isEmpty(s) ? "" : "Missing [" + s + "] instruction"); }).join());
                        if (CourseMeta.actEx.page.seeAlso)
                            th.seeAlso = _.filter(_.map(CourseMeta.actEx.page.seeAlso, function (lnk) { return CourseMeta.actProduct.getNode(lnk.url); }), function (n) { return !!n; });
                        if (th.seeAlso && th.seeAlso.length == 0)
                            th.seeAlso = null;
                        if (th.seeAlso) {
                            th.seeAlsoTemplateSmall("TSeeAlsoTemplateSmall");
                            th.seeAlsoTemplate("TSeeAlsoTemplate");
                        }
                        th.tb.suplCtxtGrammar(th.seeAlso != null);
                        th.tb.suplGrammarIcon(th.seeAlso == null);
                        CourseMeta.refreshExerciseBar(loadedEx);
                    });
                });
            });
        };
        ModelEx.prototype.htmlClearing = function () {
            if (this.cpv)
                this.cpv.htmlClearing();
            if (CourseMeta.actExPageControl && CourseMeta.actExPageControl.sndPage)
                CourseMeta.actExPageControl.sndPage.htmlClearing();
        };
        return ModelEx;
    })(CourseMeta.MetaModel);
    CourseMeta.ModelEx = ModelEx;
    Pager.registerAppLocator(schools.appId, schools.tEx, function (urlParts, completed) { return completed(new ModelEx(urlParts)); });
})(CourseMeta || (CourseMeta = {}));
//xx/#DEBUG
var Logger;
(function (Logger) {
    function trace_exrc(msg) {
        Logger.trace("Exercise", msg);
    }
    Logger.trace_exrc = trace_exrc;
})(Logger || (Logger = {}));
//xx/#ENDDEBUG
//var exrc_dict = null;

var scorm;
(function (scorm) {
    scorm.Cmd_Logger_Type = 'scorm.Cmd_Logger';
    function Cmd_Logger_Create(id, data, companyId, productId, scormId, lmcomId, sessionId) {
        return { id: id, data: data, companyId: companyId, productId: productId, scormId: scormId, date: Utils.nowToInt(), lmcomId: lmcomId, sessionId: sessionId };
    }
    scorm.Cmd_Logger_Create = Cmd_Logger_Create;
    scorm.Cmd_resetModules_Type = 'scorm.Cmd_resetModules';
    function Cmd_resetModules_Create(modIds, companyId, productId, scormId, lmcomId, sessionId) {
        return { modIds: modIds, companyId: companyId, productId: productId, scormId: scormId, date: Utils.nowToInt(), lmcomId: lmcomId, sessionId: sessionId };
    }
    scorm.Cmd_resetModules_Create = Cmd_resetModules_Create;
    scorm.Cmd_readCrsResults_Type = 'scorm.Cmd_readCrsResults';
    function Cmd_readCrsResults_Create(companyId, productId, scormId, lmcomId, sessionId) {
        return { companyId: companyId, productId: productId, scormId: scormId, date: Utils.nowToInt(), lmcomId: lmcomId, sessionId: sessionId };
    }
    scorm.Cmd_readCrsResults_Create = Cmd_readCrsResults_Create;
    scorm.Cmd_readModuleResults_Type = 'scorm.Cmd_readModuleResults';
    function Cmd_readModuleResults_Create(key, companyId, productId, scormId, lmcomId, sessionId) {
        return { key: key, companyId: companyId, productId: productId, scormId: scormId, date: Utils.nowToInt(), lmcomId: lmcomId, sessionId: sessionId };
    }
    scorm.Cmd_readModuleResults_Create = Cmd_readModuleResults_Create;
    scorm.Cmd_saveUserData_Type = 'scorm.Cmd_saveUserData';
    function Cmd_saveUserData_Create(data, companyId, productId, scormId, lmcomId, sessionId) {
        return { data: data, companyId: companyId, productId: productId, scormId: scormId, date: Utils.nowToInt(), lmcomId: lmcomId, sessionId: sessionId };
    }
    scorm.Cmd_saveUserData_Create = Cmd_saveUserData_Create;
    scorm.Cmd_createArchive_Type = 'scorm.Cmd_createArchive';
    function Cmd_createArchive_Create(companyId, productId, scormId, lmcomId, sessionId) {
        return { companyId: companyId, productId: productId, scormId: scormId, date: Utils.nowToInt(), lmcomId: lmcomId, sessionId: sessionId };
    }
    scorm.Cmd_createArchive_Create = Cmd_createArchive_Create;
    scorm.Cmd_testResults_Type = 'scorm.Cmd_testResults';
    function Cmd_testResults_Create(companyId, productId, scormId, lmcomId, sessionId) {
        return { companyId: companyId, productId: productId, scormId: scormId, date: Utils.nowToInt(), lmcomId: lmcomId, sessionId: sessionId };
    }
    scorm.Cmd_testResults_Create = Cmd_testResults_Create;
    scorm.Cmd_testCert_Type = 'scorm.Cmd_testCert';
    function Cmd_testCert_Create(loc, companyId, productId, scormId, lmcomId, sessionId) {
        return { loc: loc, companyId: companyId, productId: productId, scormId: scormId, date: Utils.nowToInt(), lmcomId: lmcomId, sessionId: sessionId };
    }
    scorm.Cmd_testCert_Create = Cmd_testCert_Create;
})(scorm || (scorm = {}));

var schoolCpv;
(function (schoolCpv) {
    //https://typescript.codeplex.com/workitem/1065 
    //d:\ProgramFiles\Common7\IDE\VWDExpressExtensions\TypeScript\
    var allCpvs = [];
    (function (PlayStatus) {
        PlayStatus[PlayStatus["initializing"] = 0] = "initializing";
        PlayStatus[PlayStatus["toPlay"] = 1] = "toPlay";
        PlayStatus[PlayStatus["playFile"] = 2] = "playFile";
        PlayStatus[PlayStatus["toRecord"] = 3] = "toRecord";
        PlayStatus[PlayStatus["recording"] = 4] = "recording";
        PlayStatus[PlayStatus["toPlayMemory"] = 5] = "toPlayMemory";
        PlayStatus[PlayStatus["playMemory"] = 6] = "playMemory";
    })(schoolCpv.PlayStatus || (schoolCpv.PlayStatus = {}));
    var PlayStatus = schoolCpv.PlayStatus;
    var model = (function () {
        function model(id, xap) {
            var _this = this;
            this.id = id;
            this.xap = xap;
            this.play = new btn("play");
            this.record = new btn("record");
            this.replay = new btn("replay");
            //installSlUrl(): string { return SndLow.slInstallUrl; }
            this.allDisabled = false; //je potreba instalace SL => buttony jsou disabled
            //showAlowMicrophoneBtn = ko.observable<boolean>(false);
            //needInstall = ko.observable<boolean>(true);
            //slvisible = ko.observable<boolean>(false);
            this.title = ko.observable('');
            this.destroy = function () {
                if (_this.driver) {
                    _this.driver.stop();
                    if (_this.driver.recHandler)
                        _this.driver.recordEnd(false);
                }
                if (_this.timerId != 0)
                    clearTimeout(_this.timerId);
                _this.timerId = 0;
            };
            this.timerId = 0;
            var self = this;
            allCpvs[id] = this;
            this.play.owner = this.record.owner = this.replay.owner = this;
            //this.destroy = () => {
            //  if (self.driver) {
            //    self.driver.stop();
            //    if (self.driver.recHandler) self.driver.recHandler.recordEnd();
            //  }
            //  if (self.timerId != 0) clearTimeout(self.timerId); self.timerId = 0;
            //}
        }
        model.prototype.setRecorderSound = function (recorderSound) {
            if (this.recorderSound)
                this.recorderSound.close();
            this.recorderSound = recorderSound;
        };
        model.prototype.init = function (completed) {
            var _this = this;
            if (this.driver) {
                completed();
                return;
            }
            SndLow.getGlobalMedia().adjustGlobalDriver(true, function (dr, disabled) {
                _this.driver = dr;
                _this.allDisabled = disabled;
                completed();
            });
        };
        model.prototype.htmlClearing = function () {
            this.setRecorderSound(null);
            SndLow.htmlClearing(this.id);
        };
        model.prototype.setBtn = function (btn, disabled, active, playing) {
            btn.disabled(disabled);
            btn.active(active);
            btn.playing(playing);
        };
        model.prototype.setButtonsStatus = function () {
            this.setBtn(this.play, this.allDisabled || this.playStatus == PlayStatus.recording, this.playStatus == PlayStatus.toPlay || this.playStatus == PlayStatus.playFile, this.playStatus == PlayStatus.playFile);
            this.setBtn(this.record, this.allDisabled, this.playStatus == PlayStatus.toRecord || this.playStatus == PlayStatus.recording, this.playStatus == PlayStatus.recording);
            //this.setBtn(this.replay, !this.driver || !this.driver.recHandler.recordingExists(), this.playStatus == PlayStatus.toPlayMemory/* || this.playStatus == PlayStatus.playMemory*/, this.playStatus == PlayStatus.playMemory);
            this.setBtn(this.replay, this.allDisabled || this.playStatus == PlayStatus.recording || !this.driver || !this.recorderSound, this.playStatus == PlayStatus.toPlayMemory || this.playStatus == PlayStatus.playMemory, this.playStatus == PlayStatus.playMemory);
        };
        model.prototype.hide = function (s, ev) {
            this.setRecorderSound(null);
            this.destroy();
            anim.collapseExpandedSlow();
            //this.slvisible(false);
            if (ev) {
                ev.cancelBubble = true;
                ev.stopPropagation();
            }
            return false;
        };
        model.prototype.playSound = function (isUrl) {
            var self = this;
            self.driver.url = null;
            self.driver.play(isUrl ? self.url : self.recorderSound.url, isUrl ? self.begPos * 1000 : 0, null);
        };
        model.prototype.show = function (url, title, begPos, endPos) {
            var _this = this;
            //this.stopStatus = { play: false, record: false, replay: false };
            this.playStatus = PlayStatus.initializing;
            this.url = url.toLowerCase(); /*this.computeUrl(url);*/
            this.title(title);
            this.begPos = begPos ? begPos / 1000 : 0;
            this.endPos = endPos ? endPos / 1000 : 1000000;
            var self = this;
            //Inicializace SL
            this.init(function () {
                self.playStatus = PlayStatus.toPlay;
                //self.slvisible(true);
                anim.show($('#' + self.id));
                //if (self.driver) self.driver.recHandler.clearRecording();
            });
            //Timer
            this.timerId = setInterval(function () {
                if (self.driver && self.driver.recHandler) {
                    //if (!self.driver.recHandler.alowMicrophone()) {//neni dovolen mikrofon
                    //  self.showAlowMicrophoneBtn(true); return;
                    //}
                    //self.showAlowMicrophoneBtn(false);
                    //stavy, nastavene klikem na button
                    if (!self.driver.handler.paused)
                        if (self.isRecordedSound())
                            self.playStatus = PlayStatus.playMemory;
                        else
                            self.playStatus = PlayStatus.playFile;
                    else if (self.driver.recHandler.isRecording())
                        self.playStatus = PlayStatus.recording;
                    //kontrola, zdali jeste bezi prehravani
                    switch (self.playStatus) {
                        case PlayStatus.playFile:
                            if (self.driver.handler.paused)
                                self.playStatus = PlayStatus.toRecord; //prestalo se prehravat vzor
                            else if (!self.isRecordedSound() && self.endPos && self.endPos <= self.driver.handler.currentTime)
                                self.driver.stop(); //dosazeno konce prehrani vzoru
                            break;
                        case PlayStatus.recording:
                            if (!self.driver.recHandler.isRecording())
                                self.playStatus = PlayStatus.toPlayMemory; //prestalo se nahravat
                            break;
                        case PlayStatus.playMemory:
                            if (self.driver.handler.paused)
                                self.playStatus = PlayStatus.toPlay; //prestalo se prehravat nahravka studenta
                            break;
                    }
                }
                //aktualizace stavu butonu
                _this.setButtonsStatus();
            }, 50);
        };
        model.prototype.isRecordedSound = function () {
            //return !this.driver.url || Utils.startsWith(this.driver.url, 'blob');
            return this.recorderSound && this.driver.url.toLowerCase() == this.recorderSound.url.toLowerCase();
        };
        return model;
    })();
    schoolCpv.model = model;
    function show(id, url, title, begPos, endPos) {
        allCpvs[id].show(url, title, begPos, endPos);
    }
    schoolCpv.show = show;
    function hide(id) {
        allCpvs[id].hide();
    }
    schoolCpv.hide = hide;
    var btn = (function () {
        function btn(id) {
            var _this = this;
            this.id = id;
            this.active = ko.observable(false);
            this.playing = ko.observable(false);
            this.disabled = ko.observable(false);
            this.iconClass = ko.computed(function () {
                var cls = "";
                switch (_this.id) {
                    case "replay":
                    case "play":
                        cls = _this.playing() ? "stop" : "play";
                        break;
                    case "record":
                        cls = _this.playing() ? "stop" : "circle";
                        break;
                }
                return "fa-" + cls;
            });
        }
        btn.prototype.text = function () {
            switch (this.id) {
                case "play": return CSLocalize('4bbab8260cf44783ade8f733a142866d', 'Listen to the original');
                case "record": return CSLocalize('e409b368170645e58cfd835473cb9561', 'Record');
                case "replay": return CSLocalize('0590834dbf264906ae88c717f81170cf', 'Check your recording');
            }
        };
        btn.prototype.click = function (s, ev) {
            var _this = this;
            if (this.disabled())
                return;
            //rec.alowTitle = CSLocalize('7da1fdbb748447bb83e9bbe135e543cc', 'Allow microphone');
            switch (this.id) {
                case "play":
                case "replay":
                    if (this.playing())
                        this.owner.driver.stop();
                    else
                        this.owner.playSound(this.id == "play");
                    break;
                case "record":
                    if (this.playing())
                        setTimeout(function () { return _this.owner.driver.recordEnd(true); }, 500);
                    else
                        this.owner.driver.recordStart({
                            toDisc: false,
                            toDiscFileUrl: null,
                            toMemoryCompleted: function (mp3Data) { return _this.owner.setRecorderSound(new SndLow.recordedSound(_this.owner.driver, mp3Data)); },
                            actHtml5SampleRate: 0,
                            isRecording: null,
                            miliseconds: null,
                            recordStarting: null,
                            toMemoryCompletedData: null,
                        });
                    break;
            }
            ev.cancelBubble = true;
            ev.stopPropagation();
            return false;
        };
        return btn;
    })();
    schoolCpv.btn = btn;
})(schoolCpv || (schoolCpv = {}));
var Pager;
(function (Pager) {
    //klik na mikrofon ve cviceni
    function callCPV(ev, url, title, begPos, endPos) {
        schoolCpv.show(schools.tExCpv, url, title, begPos, endPos);
    }
    Pager.callCPV = callCPV;
})(Pager || (Pager = {}));

var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var CourseMeta;
(function (CourseMeta) {
    var DictInfoModel = (function (_super) {
        __extends(DictInfoModel, _super);
        function DictInfoModel(urlParts) {
            _super.call(this, schools.tDictInfo, urlParts);
            this.bodyTmpl = "TSchoolDictInfoBody";
        }
        DictInfoModel.prototype.doUpdate = function (completed) { completed(); };
        DictInfoModel.prototype.title = function () { return CSLocalize('0f6df5cdf72342198616971c1c7c8419', 'Bilingual Dictionary'); };
        return DictInfoModel;
    })(schools.Model);
    CourseMeta.DictInfoModel = DictInfoModel;
    var GrModel = (function (_super) {
        __extends(GrModel, _super);
        function GrModel() {
            _super.apply(this, arguments);
            this.prevNextVisible = true;
        }
        GrModel.prototype.grammContentClick = function () { Pager.navigateToHash(schools.createGrammUrl(schools.tGrammContent, "")); };
        return GrModel;
    })(CourseMeta.MetaModel);
    CourseMeta.GrModel = GrModel;
    var GrFolder = (function (_super) {
        __extends(GrFolder, _super);
        function GrFolder(urlParts) {
            _super.call(this, schools.tGrammFolder, urlParts);
            this.ignorePrevNext = true;
            this.bodyTmpl = "TGramm_Folder";
        }
        GrFolder.prototype.idxFrom = function () { return CSLocalize('fe6997da0e5e407288cda87e156820a0', 'Content'); };
        return GrFolder;
    })(GrModel);
    CourseMeta.GrFolder = GrFolder;
    var GrContent = (function (_super) {
        __extends(GrContent, _super);
        function GrContent(urlParts) {
            _super.call(this, schools.tGrammContent, urlParts);
            this.prevNextVisible = false;
            this.bodyTmpl = "TSchoolGrammContentBody";
        }
        GrContent.prototype.breadcrumbs = function () { return []; };
        GrContent.prototype.title = function () { return CourseMeta.actGrammar.title + ", " + CSLocalize('49dd8f327c6f484aaff1c9412690b970', 'content'); };
        return GrContent;
    })(GrModel);
    CourseMeta.GrContent = GrContent;
    var GrPage = (function (_super) {
        __extends(GrPage, _super);
        function GrPage(urlParts) {
            _super.call(this, schools.tGrammPage, urlParts);
            this.bodyTmpl = "TSchoolGrammBody";
        }
        GrPage.prototype.doUpdate = function (completed) {
            CourseMeta.lib.onChangeUrl(this.productUrl, this.persistence, this.url, function (loadedEx) {
                return CourseMeta.lib.doRefresh(function () {
                    return CourseMeta.lib.displayEx(loadedEx, null, function (loadedEx) { return DictConnector.initDict(CourseMeta.actGrammarModule.dict); });
                });
            });
        };
        //Prev x Next pro gramatiku
        GrPage.prototype.hasPrev = function () { return !!CourseMeta.actGrammarEx.prev; };
        GrPage.prototype.hasNext = function () { return !!CourseMeta.actGrammarEx.next; };
        GrPage.prototype.prevClick = function () { CourseMeta.gui.gotoData(CourseMeta.actGrammarEx.prev); };
        GrPage.prototype.nextClick = function () { CourseMeta.gui.gotoData(CourseMeta.actGrammarEx.next); };
        GrPage.prototype.idxFrom = function () { return (CourseMeta.actGrammarEx.idx + 1).toString() + "/" + CourseMeta.actGrammarExCount.toString() + ": " + CSLocalize('5592859748ca440d97b0e2bcdd1ff22b', 'content'); };
        GrPage.prototype.exerciseHtml = function () { return JsRenderTemplateEngine.render("c_gen", CourseMeta.actGrammarEx.page); };
        return GrPage;
    })(GrModel);
    CourseMeta.GrPage = GrPage;
    Pager.registerAppLocator(schools.appId, schools.tDictInfo, function (urlParts, completed) { return completed(new DictInfoModel(urlParts)); });
    Pager.registerAppLocator(schools.appId, schools.tGrammFolder, function (urlParts, completed) { return completed(new GrFolder(urlParts)); });
    Pager.registerAppLocator(schools.appId, schools.tGrammPage, function (urlParts, completed) { return completed(new GrPage(urlParts)); });
    Pager.registerAppLocator(schools.appId, schools.tGrammContent, function (urlParts, completed) { return completed(new GrContent(urlParts)); });
})(CourseMeta || (CourseMeta = {}));

/// <reference path="../jslib/js/GenLMComLib.ts" />
/// <reference path="../schools/GenSchools.ts" />
var CourseModel;
(function (CourseModel) {
    (function (IconIds) {
        IconIds[IconIds["no"] = 0] = "no";
        IconIds[IconIds["a"] = 1] = "a";
        IconIds[IconIds["b"] = 2] = "b";
        IconIds[IconIds["c"] = 3] = "c";
        IconIds[IconIds["d"] = 4] = "d";
        IconIds[IconIds["e"] = 5] = "e";
        IconIds[IconIds["f"] = 6] = "f";
    })(CourseModel.IconIds || (CourseModel.IconIds = {}));
    var IconIds = CourseModel.IconIds;
    (function (CheckItemTexts) {
        CheckItemTexts[CheckItemTexts["yesNo"] = 0] = "yesNo";
        CheckItemTexts[CheckItemTexts["trueFalse"] = 1] = "trueFalse";
        CheckItemTexts[CheckItemTexts["no"] = 2] = "no";
    })(CourseModel.CheckItemTexts || (CourseModel.CheckItemTexts = {}));
    var CheckItemTexts = CourseModel.CheckItemTexts;
    (function (inlineControlTypes) {
        inlineControlTypes[inlineControlTypes["no"] = 0] = "no";
        inlineControlTypes[inlineControlTypes["GapFill"] = 1] = "GapFill";
        inlineControlTypes[inlineControlTypes["GapFill_Correction"] = 2] = "GapFill_Correction";
        inlineControlTypes[inlineControlTypes["WordSelection"] = 3] = "WordSelection";
        inlineControlTypes[inlineControlTypes["DragTarget"] = 4] = "DragTarget";
        inlineControlTypes[inlineControlTypes["img"] = 5] = "img";
        inlineControlTypes[inlineControlTypes["TtsSound"] = 6] = "TtsSound";
    })(CourseModel.inlineControlTypes || (CourseModel.inlineControlTypes = {}));
    var inlineControlTypes = CourseModel.inlineControlTypes;
    (function (JSStatus) {
        JSStatus[JSStatus["no"] = 0] = "no";
        JSStatus[JSStatus["genericHtml"] = 1] = "genericHtml";
        JSStatus[JSStatus["ctrl"] = 2] = "ctrl";
    })(CourseModel.JSStatus || (CourseModel.JSStatus = {}));
    var JSStatus = CourseModel.JSStatus;
    (function (CourseDataFlag) {
        CourseDataFlag[CourseDataFlag["needsEval"] = 1] = "needsEval";
        CourseDataFlag[CourseDataFlag["pcCannotEvaluate"] = 2] = "pcCannotEvaluate";
        CourseDataFlag[CourseDataFlag["hasExternalAttachments"] = 4] = "hasExternalAttachments";
        CourseDataFlag[CourseDataFlag["done"] = 8] = "done";
        CourseDataFlag[CourseDataFlag["passive"] = 16] = "passive";
        CourseDataFlag[CourseDataFlag["testImpl_result"] = 32] = "testImpl_result";
        CourseDataFlag[CourseDataFlag["testImpl"] = 64] = "testImpl";
        CourseDataFlag[CourseDataFlag["testSkillImpl"] = 128] = "testSkillImpl";
        CourseDataFlag[CourseDataFlag["ex"] = 256] = "ex";
        CourseDataFlag[CourseDataFlag["skipAbleRoot"] = 512] = "skipAbleRoot";
        CourseDataFlag[CourseDataFlag["modImpl"] = 1024] = "modImpl";
        CourseDataFlag[CourseDataFlag["pretestImp"] = 2048] = "pretestImp";
        CourseDataFlag[CourseDataFlag["multiTestImpl"] = 4096] = "multiTestImpl";
        CourseDataFlag[CourseDataFlag["testEx"] = 8192] = "testEx";
        CourseDataFlag[CourseDataFlag["all"] = 16127] = "all";
    })(CourseModel.CourseDataFlag || (CourseModel.CourseDataFlag = {}));
    var CourseDataFlag = CourseModel.CourseDataFlag;
    (function (modalSize) {
        modalSize[modalSize["normal"] = 0] = "normal";
        modalSize[modalSize["small"] = 1] = "small";
        modalSize[modalSize["large"] = 2] = "large";
    })(CourseModel.modalSize || (CourseModel.modalSize = {}));
    var modalSize = CourseModel.modalSize;
    (function (tgSt) {
        tgSt[tgSt["jsCtrl"] = 1] = "jsCtrl";
        tgSt[tgSt["cdata"] = 2] = "cdata";
        tgSt[tgSt["csControl"] = 4] = "csControl";
        tgSt[tgSt["isEval"] = 8] = "isEval";
        tgSt[tgSt["isArray"] = 32] = "isArray";
        tgSt[tgSt["noJSONQuote"] = 64] = "noJSONQuote";
        tgSt[tgSt["docIgnore"] = 128] = "docIgnore";
        tgSt[tgSt["xsdIgnore"] = 256] = "xsdIgnore";
        tgSt[tgSt["xmlIgnore"] = 512] = "xmlIgnore";
        tgSt[tgSt["jsonIgnore"] = 1024] = "jsonIgnore";
        tgSt[tgSt["obsolete"] = 2048] = "obsolete";
        tgSt[tgSt["xsdHtmlEl"] = 4096] = "xsdHtmlEl";
        tgSt[tgSt["xsdNoMixed"] = 8192] = "xsdNoMixed";
        tgSt[tgSt["xsdString"] = 16384] = "xsdString";
        tgSt[tgSt["xsdNoGlobal"] = 32768] = "xsdNoGlobal";
        tgSt[tgSt["xsdIgnoreTagAttrs"] = 65536] = "xsdIgnoreTagAttrs";
        tgSt[tgSt["xsdMixed"] = 131072] = "xsdMixed";
        tgSt[tgSt["xsdRequiredAttr"] = 262144] = "xsdRequiredAttr";
        tgSt[tgSt["metaJS_browse"] = 524288] = "metaJS_browse";
    })(CourseModel.tgSt || (CourseModel.tgSt = {}));
    var tgSt = CourseModel.tgSt;
    (function (offeringDropDownMode) {
        offeringDropDownMode[offeringDropDownMode["dropDownDiscard"] = 0] = "dropDownDiscard";
        offeringDropDownMode[offeringDropDownMode["dropDownKeep"] = 1] = "dropDownKeep";
        offeringDropDownMode[offeringDropDownMode["gapFillIgnore"] = 2] = "gapFillIgnore";
    })(CourseModel.offeringDropDownMode || (CourseModel.offeringDropDownMode = {}));
    var offeringDropDownMode = CourseModel.offeringDropDownMode;
    (function (smartOfferingMode) {
        smartOfferingMode[smartOfferingMode["gapFill"] = 0] = "gapFill";
        smartOfferingMode[smartOfferingMode["dropDownDiscard"] = 1] = "dropDownDiscard";
        smartOfferingMode[smartOfferingMode["dropDownKeep"] = 2] = "dropDownKeep";
        smartOfferingMode[smartOfferingMode["gapFillPassive"] = 3] = "gapFillPassive";
    })(CourseModel.smartOfferingMode || (CourseModel.smartOfferingMode = {}));
    var smartOfferingMode = CourseModel.smartOfferingMode;
    (function (inlineElementTypes) {
        inlineElementTypes[inlineElementTypes["no"] = 0] = "no";
        inlineElementTypes[inlineElementTypes["gapFill"] = 1] = "gapFill";
        inlineElementTypes[inlineElementTypes["gapFillCorrection"] = 2] = "gapFillCorrection";
        inlineElementTypes[inlineElementTypes["wordSelection"] = 3] = "wordSelection";
        inlineElementTypes[inlineElementTypes["dropDown"] = 4] = "dropDown";
        inlineElementTypes[inlineElementTypes["img"] = 5] = "img";
        inlineElementTypes[inlineElementTypes["ttsSound"] = 6] = "ttsSound";
    })(CourseModel.inlineElementTypes || (CourseModel.inlineElementTypes = {}));
    var inlineElementTypes = CourseModel.inlineElementTypes;
    (function (smartElementTypes) {
        smartElementTypes[smartElementTypes["no"] = 0] = "no";
        smartElementTypes[smartElementTypes["gapFill"] = 1] = "gapFill";
        smartElementTypes[smartElementTypes["dropDown"] = 2] = "dropDown";
        smartElementTypes[smartElementTypes["offering"] = 3] = "offering";
        smartElementTypes[smartElementTypes["img"] = 4] = "img";
        smartElementTypes[smartElementTypes["wordSelection"] = 5] = "wordSelection";
    })(CourseModel.smartElementTypes || (CourseModel.smartElementTypes = {}));
    var smartElementTypes = CourseModel.smartElementTypes;
    (function (colors) {
        colors[colors["black"] = 0] = "black";
        colors[colors["white"] = 1] = "white";
        colors[colors["primary"] = 2] = "primary";
        colors[colors["success"] = 3] = "success";
        colors[colors["info"] = 4] = "info";
        colors[colors["warning"] = 5] = "warning";
        colors[colors["danger"] = 6] = "danger";
    })(CourseModel.colors || (CourseModel.colors = {}));
    var colors = CourseModel.colors;
    (function (listIcon) {
        listIcon[listIcon["number"] = 0] = "number";
        listIcon[listIcon["letter"] = 1] = "letter";
        listIcon[listIcon["upperLetter"] = 2] = "upperLetter";
        listIcon[listIcon["angleDoubleRight"] = 3] = "angleDoubleRight";
        listIcon[listIcon["angleRight"] = 4] = "angleRight";
        listIcon[listIcon["arrowCircleORight"] = 5] = "arrowCircleORight";
        listIcon[listIcon["arrowCircleRight"] = 6] = "arrowCircleRight";
        listIcon[listIcon["arrowRight"] = 7] = "arrowRight";
        listIcon[listIcon["caretRight"] = 8] = "caretRight";
        listIcon[listIcon["caretSquareORight"] = 9] = "caretSquareORight";
        listIcon[listIcon["chevronCircleRight"] = 10] = "chevronCircleRight";
        listIcon[listIcon["chevronRight"] = 11] = "chevronRight";
        listIcon[listIcon["handORight"] = 12] = "handORight";
        listIcon[listIcon["longArrowRight"] = 13] = "longArrowRight";
        listIcon[listIcon["play"] = 14] = "play";
        listIcon[listIcon["playCircle"] = 15] = "playCircle";
        listIcon[listIcon["playCircleO"] = 16] = "playCircleO";
        listIcon[listIcon["circleONotch"] = 17] = "circleONotch";
        listIcon[listIcon["cog"] = 18] = "cog";
        listIcon[listIcon["refresh"] = 19] = "refresh";
        listIcon[listIcon["spinner"] = 20] = "spinner";
        listIcon[listIcon["squareO"] = 21] = "squareO";
        listIcon[listIcon["bullseye"] = 22] = "bullseye";
        listIcon[listIcon["asterisk"] = 23] = "asterisk";
        listIcon[listIcon["circle"] = 24] = "circle";
        listIcon[listIcon["circleO"] = 25] = "circleO";
        listIcon[listIcon["circleThin"] = 26] = "circleThin";
        listIcon[listIcon["dotCircleO"] = 27] = "dotCircleO";
    })(CourseModel.listIcon || (CourseModel.listIcon = {}));
    var listIcon = CourseModel.listIcon;
    (function (pairingLeftWidth) {
        pairingLeftWidth[pairingLeftWidth["normal"] = 0] = "normal";
        pairingLeftWidth[pairingLeftWidth["small"] = 1] = "small";
        pairingLeftWidth[pairingLeftWidth["xsmall"] = 2] = "xsmall";
        pairingLeftWidth[pairingLeftWidth["large"] = 3] = "large";
    })(CourseModel.pairingLeftWidth || (CourseModel.pairingLeftWidth = {}));
    var pairingLeftWidth = CourseModel.pairingLeftWidth;
    (function (threeStateBool) {
        threeStateBool[threeStateBool["no"] = 0] = "no";
        threeStateBool[threeStateBool["true"] = 1] = "true";
        threeStateBool[threeStateBool["false"] = 2] = "false";
    })(CourseModel.threeStateBool || (CourseModel.threeStateBool = {}));
    var threeStateBool = CourseModel.threeStateBool;
    CourseModel.meta = { "rootTagName": "tag", "types": { "smart-pairing": { "st": 6, "anc": "smart-element-low", "props": { "random": { "st": 64 }, "left-width": { "enumType": CourseModel.pairingLeftWidth } } }, "smart-offering": { "st": 6, "anc": "smart-element-low", "props": { "words": {}, "mode": { "enumType": CourseModel.smartOfferingMode } } }, "smart-element": { "st": 6, "anc": "smart-element-low", "props": { "inline-type": { "enumType": CourseModel.smartElementTypes } } }, "smart-element-low": { "anc": "macro-template", "props": {} }, "macro-article": { "st": 6, "anc": "macro-template", "props": {} }, "macro-vocabulary": { "st": 6, "anc": "macro-template", "props": {} }, "macro-video": { "st": 6, "anc": "macro-template", "props": { "cut-url": {}, "media-url": {}, "display-style": {} } }, "macro-true-false": { "st": 6, "anc": "macro-template", "props": { "text-id": { "enumType": CourseModel.CheckItemTexts } } }, "macro-single-choices": { "st": 6, "anc": "macro-template", "props": {} }, "macro-list-word-ordering": { "st": 6, "anc": "macro-template", "props": {} }, "macro-pairing": { "st": 6, "anc": "macro-template", "props": {} }, "macro-table": { "st": 6, "anc": "macro-template", "props": { "inline-type": { "enumType": CourseModel.inlineControlTypes } } }, "macro-list": { "st": 6, "anc": "macro-template", "props": { "inline-type": { "enumType": CourseModel.inlineControlTypes } } }, "macro-icon-list": { "st": 6, "anc": "macro-template", "props": { "delim": {}, "is-striped": { "st": 64 }, "icon": { "enumType": CourseModel.listIcon }, "color": { "enumType": CourseModel.colors } } }, "tag": { "st": 384, "props": { "id": { "st": 524288 }, "style-sheet": { "st": 1024 }, "srcpos": { "st": 384 }, "items": { "st": 640 }, "temporary-macro-item": { "st": 1600 }, "class": { "st": 160 }, "class-setter": { "st": 1664 } } }, "smart-tag": { "st": 2180, "anc": "tag", "props": { "correct": { "st": 64 }, "default-inline-type": { "st": 128, "enumType": CourseModel.inlineControlTypes }, "smart-text": { "st": 1536 } } }, "node": { "st": 4228, "anc": "tag", "props": {} }, "text": { "st": 384, "anc": "tag", "props": { "title": {} } }, "error": { "st": 16512, "anc": "tag", "props": { "msg": {} } }, "header-prop": { "st": 36992, "anc": "tag", "props": {} }, "eval-control": { "st": 392, "anc": "tag", "props": { "eval-group": { "st": 524288 }, "score-weight": { "st": 524352 }, "eval-button-id": { "st": 524288 } } }, "body": { "st": 131333, "anc": "tag", "props": { "snd-page": { "st": 640, "childPropTypes": "_snd-page" }, "eval-page": { "st": 640, "childPropTypes": "_eval-page" }, "url": { "st": 384 }, "order": { "st": 64 }, "instr-title": {}, "externals": { "st": 128 }, "see-also-links": {}, "old-ea-is-passive": { "st": 192 }, "is-old-ea": { "st": 192 }, "see-also": { "st": 1664 }, "title": { "st": 1536 }, "body-style": { "st": 1536 }, "instr-body": {}, "see-also-str": { "st": 128 }, "instrs": { "st": 1536 } } }, "eval-button": { "st": 13, "anc": "eval-control", "props": { "score-as-ratio": { "st": 64 } } }, "check-low": { "st": 8, "anc": "eval-control", "props": { "correct-value": { "st": 64 }, "text-type": { "enumType": CourseModel.CheckItemTexts }, "init-value": { "enumType": CourseModel.threeStateBool }, "read-only": { "st": 64 }, "skip-evaluation": { "st": 64 } } }, "check-box": { "st": 13, "anc": "check-low", "props": {} }, "check-item": { "st": 4109, "anc": "check-low", "props": {} }, "offering": { "st": 5, "anc": "tag", "props": { "words": {}, "mode": { "st": 524288, "enumType": CourseModel.offeringDropDownMode }, "hidden": { "st": 524352 } } }, "radio-button": { "st": 4109, "anc": "eval-control", "props": { "correct-value": { "st": 64 }, "init-value": { "st": 64 }, "read-only": { "st": 64 }, "skip-evaluation": { "st": 64 } } }, "single-choice": { "st": 4, "xsdChildElements": "c0_:['radio-button']", "anc": "tag", "props": { "read-only": { "st": 64 }, "skip-evaluation": { "st": 64 }, "score-weight": { "st": 64 }, "eval-button-id": {} } }, "word-selection": { "st": 13, "anc": "eval-control", "props": { "words": {} } }, "word-multi-selection": { "st": 13, "anc": "eval-control", "props": { "words": {} } }, "word-ordering": { "st": 13, "anc": "eval-control", "props": { "correct-order": {} } }, "sentence-ordering": { "st": 13, "xsdChildElements": "c0_:['sentence-ordering-item']", "anc": "eval-control", "props": {} }, "sentence-ordering-item": { "st": 4101, "anc": "tag", "props": {} }, "edit": { "st": 392, "anc": "eval-control", "props": { "correct-value": {}, "width-group": { "st": 524288 }, "width": { "st": 524352 }, "offering-id": { "st": 524288 }, "case-sensitive": { "st": 524352 } } }, "gap-fill": { "st": 13, "anc": "edit", "props": { "hint": { "st": 524288 }, "init-value": {}, "read-only": { "st": 524352 }, "skip-evaluation": { "st": 524352 } } }, "drop-down": { "st": 13, "anc": "edit", "props": { "gap-fill-like": { "st": 524736 } } }, "pairing": { "st": 13, "xsdChildElements": "c0_:['pairing-item']", "anc": "eval-control", "props": { "left-random": { "st": 64 }, "left-width": { "enumType": CourseModel.pairingLeftWidth } } }, "pairing-item": { "st": 4101, "anc": "tag", "props": { "right": {} } }, "human-eval": { "st": 392, "anc": "eval-control", "props": {} }, "writing": { "st": 4109, "anc": "human-eval", "props": { "limit-recommend": { "st": 64 }, "limit-min": { "st": 64 }, "limit-max": { "st": 64 }, "number-of-rows": { "st": 64 } } }, "recording": { "st": 4109, "anc": "human-eval", "props": { "limit-recommend": { "st": 64 }, "limit-min": { "st": 64 }, "limit-max": { "st": 64 }, "record-in-dialog": { "st": 64 }, "dialog-header-id": {}, "dialog-size": { "enumType": CourseModel.modalSize }, "single-attempt": { "st": 64 } } }, "macro": { "st": 384, "anc": "tag", "props": {} }, "list": { "st": 4, "xsdChildElements": "c0_:['li']", "anc": "macro", "props": { "delim": {}, "is-striped": { "st": 64 }, "icon": { "enumType": CourseModel.listIcon }, "color": { "enumType": CourseModel.colors } } }, "list-group": { "st": 12293, "anc": "macro", "props": { "is-striped": { "st": 64 } } }, "two-column": { "st": 4101, "anc": "macro", "props": {} }, "panel": { "st": 131077, "xsdChildElements": "s:[{c01: ['header-prop']},{c0_: ['@flowContent']}]", "anc": "macro", "props": { "header": { "st": 640, "childPropTypes": "header-prop" } } }, "_eval-page": { "st": 384, "anc": "tag", "props": { "max-score": { "st": 64 }, "radio-groups-obj": { "st": 1536 }, "radio-groups": {} } }, "_eval-btn": { "st": 384, "anc": "tag", "props": { "btn-id": {} } }, "_eval-group": { "st": 384, "anc": "tag", "props": { "is-and": { "st": 64 }, "is-exchangeable": { "st": 64 }, "eval-control-ids": { "st": 32 }, "max-score": { "st": 1600 } } }, "_snd-page": { "st": 385, "anc": "tag", "props": {} }, "_snd-file-group": { "st": 385, "anc": "url-tag", "props": {} }, "_snd-group": { "st": 385, "anc": "tag", "props": { "intervals": { "st": 1536 }, "sf": { "st": 1536 }, "is-passive": { "st": 1600 } } }, "_snd-interval": { "st": 384, "anc": "tag", "props": {} }, "_snd-sent": { "st": 384, "anc": "tag", "props": { "idx": { "st": 64 }, "beg-pos": { "st": 64 }, "end-pos": { "st": 64 }, "text": {}, "actor": {} } }, "media-text": { "st": 5, "xsdChildElements": "c01: ['include-text','include-dialog','cut-text','cut-dialog']", "anc": "media-tag", "props": { "continue-media-id": { "st": 1024 }, "passive": { "st": 64 }, "is-old-to-new": { "st": 192 }, "hidden": { "st": 64 } } }, "_media-replica": { "st": 389, "anc": "tag", "props": { "icon-id": { "enumType": CourseModel.IconIds }, "dlg-left": { "st": 64 }, "actor": {} } }, "_media-sent": { "st": 131461, "anc": "tag", "props": { "idx": { "st": 64 } } }, "include": { "st": 384, "anc": "tag", "props": { "cut-url": { "st": 262144 } } }, "include-text": { "st": 98304, "xsdChildElements": "c0_:['phrase-replace']", "anc": "include", "props": {} }, "include-dialog": { "st": 98304, "xsdChildElements": "c0_:['phrase-replace']", "anc": "include", "props": {} }, "phrase-replace": { "st": 102400, "anc": "tag", "props": { "phrase-idx": { "st": 64 }, "replica-phrase-idx": {} } }, "_snd-file": { "st": 384, "anc": "url-tag", "props": { "file": { "st": 640, "childPropTypes": "include-text|include-dialog" }, "temp-replicas": { "st": 1536 } } }, "cut-dialog": { "st": 98308, "xsdChildElements": "s:[{c01:['include-text']},{c0_:['replica']}]", "anc": "_snd-file", "props": {} }, "cut-text": { "st": 98308, "xsdChildElements": "c01:[{c01:['include-dialog']},{c0_:['phrase']}]", "anc": "_snd-file", "props": {} }, "phrase": { "st": 102405, "anc": "tag", "props": { "beg-pos": { "st": 64 }, "end-pos": { "st": 64 }, "idx": { "st": 1600 }, "text": { "st": 1536 }, "actor": { "st": 1536 } } }, "replica": { "st": 98309, "xsdChildElements": "c0_:['phrase']", "anc": "tag", "props": { "actor-id": { "enumType": CourseModel.IconIds }, "actor-name": {}, "number-of-phrases": { "st": 64 } } }, "url-tag": { "anc": "tag", "props": { "media-url": { "st": 1024 }, "any-url": { "st": 1536 }, "is-video": { "st": 1600 } } }, "media-tag": { "st": 384, "anc": "url-tag", "props": { "cut-url": { "st": 1024 }, "subset": { "st": 1024 }, "share-media-id": { "st": 1024 }, "_sent-group-id": { "st": 384 }, "file": { "st": 1664, "childPropTypes": "cut-dialog|cut-text|include-text|include-dialog" } } }, "media-big-mark": { "st": 5, "xsdChildElements": "c01: ['include-text','include-dialog','cut-text','cut-dialog']", "anc": "media-tag", "props": {} }, "media-player": { "st": 5, "xsdChildElements": "c01: ['include-text','include-dialog','cut-text','cut-dialog']", "anc": "media-tag", "props": {} }, "media-video": { "st": 5, "xsdChildElements": "c01: ['include-text','include-dialog','cut-text','cut-dialog']", "anc": "media-tag", "props": {} }, "tts-sound": { "st": 133, "anc": "media-tag", "props": { "text": {} } }, "macro-template": { "st": 384, "anc": "macro", "props": { "name": {}, "cdata": {} } }, "inline-tag": { "st": 16388, "anc": "macro-template", "props": { "inline-type": { "enumType": CourseModel.inlineElementTypes } } }, "html-tag": { "st": 384, "anc": "tag", "props": { "tag-name": {}, "attrs": { "st": 384 } } }, "script": { "st": 386, "anc": "tag", "props": { "cdata": {} } }, "img": { "st": 384, "anc": "tag", "props": { "src": {} } }, "extension": { "st": 143, "anc": "eval-control", "props": { "data": {}, "cdata": {} } }, "doc-example": { "st": 133, "xsdChildElements": "s:[{c01: ['header-prop']},{c01: ['doc-descr']},{c0_: ['@flowContent']}]", "anc": "tag", "props": { "todo": { "st": 64 }, "code-listing": {}, "code-post-listing": {}, "header": { "st": 512, "childPropTypes": "header-prop" }, "descr": { "st": 512, "childPropTypes": "doc-descr" }, "eval-btn": { "st": 512, "childPropTypes": "eval-btn" } } }, "drag-target": { "st": 8, "anc": "edit", "props": {} }, "doc-named": { "st": 384, "anc": "tag", "props": { "name": {}, "summary": {}, "cdata": {} } }, "doc-type": { "st": 386, "anc": "doc-named", "props": { "is-html": { "st": 64 }, "is-ign": { "st": 64 }, "descendants-and-self": { "st": 32 }, "my-props": { "st": 32 }, "xref": {} } }, "doc-enum": { "st": 386, "anc": "doc-named", "props": { "xref": {}, "enums": { "st": 544, "childPropTypes": "doc-enum-item" } } }, "doc-enum-item": { "st": 386, "anc": "doc-named", "props": { "xref": {} } }, "doc-prop": { "st": 386, "anc": "doc-named", "props": { "owner-type": {}, "data-type": {}, "xref": {}, "is-html": { "st": 64 } } }, "doc-descr": { "st": 36992, "anc": "tag", "props": {} }, "doc-tags-meta": { "st": 384, "anc": "tag", "props": { "types": { "st": 544, "childPropTypes": "doc-type" }, "props": { "st": 544, "childPropTypes": "doc-prop" }, "enums": { "st": 544, "childPropTypes": "doc-enum" } } } } };
    CourseModel.tsmartPairing = 'smart-pairing';
    CourseModel.tsmartOffering = 'smart-offering';
    CourseModel.tsmartElement = 'smart-element';
    CourseModel.tsmartElementLow = 'smart-element-low';
    CourseModel.tmacroArticle = 'macro-article';
    CourseModel.tmacroVocabulary = 'macro-vocabulary';
    CourseModel.tmacroVideo = 'macro-video';
    CourseModel.tmacroTrueFalse = 'macro-true-false';
    CourseModel.tmacroSingleChoices = 'macro-single-choices';
    CourseModel.tmacroListWordOrdering = 'macro-list-word-ordering';
    CourseModel.tmacroPairing = 'macro-pairing';
    CourseModel.tmacroTable = 'macro-table';
    CourseModel.tmacroList = 'macro-list';
    CourseModel.tmacroIconList = 'macro-icon-list';
    CourseModel.ttag = 'tag';
    CourseModel.tsmartTag = 'smart-tag';
    CourseModel.tnode = 'node';
    CourseModel.ttext = 'text';
    CourseModel.terror = 'error';
    CourseModel.theaderProp = 'header-prop';
    CourseModel.tevalControl = 'eval-control';
    CourseModel.tbody = 'body';
    CourseModel.tevalButton = 'eval-button';
    CourseModel.tcheckLow = 'check-low';
    CourseModel.tcheckBox = 'check-box';
    CourseModel.tcheckItem = 'check-item';
    CourseModel.toffering = 'offering';
    CourseModel.tradioButton = 'radio-button';
    CourseModel.tsingleChoice = 'single-choice';
    CourseModel.twordSelection = 'word-selection';
    CourseModel.twordMultiSelection = 'word-multi-selection';
    CourseModel.twordOrdering = 'word-ordering';
    CourseModel.tsentenceOrdering = 'sentence-ordering';
    CourseModel.tsentenceOrderingItem = 'sentence-ordering-item';
    CourseModel.tedit = 'edit';
    CourseModel.tgapFill = 'gap-fill';
    CourseModel.tdropDown = 'drop-down';
    CourseModel.tpairing = 'pairing';
    CourseModel.tpairingItem = 'pairing-item';
    CourseModel.thumanEval = 'human-eval';
    CourseModel.twriting = 'writing';
    CourseModel.trecording = 'recording';
    CourseModel.tmacro = 'macro';
    CourseModel.tlist = 'list';
    CourseModel.tlistGroup = 'list-group';
    CourseModel.ttwoColumn = 'two-column';
    CourseModel.tpanel = 'panel';
    CourseModel.t_evalPage = '_eval-page';
    CourseModel.t_evalBtn = '_eval-btn';
    CourseModel.t_evalGroup = '_eval-group';
    CourseModel.t_sndPage = '_snd-page';
    CourseModel.t_sndFileGroup = '_snd-file-group';
    CourseModel.t_sndGroup = '_snd-group';
    CourseModel.t_sndInterval = '_snd-interval';
    CourseModel.t_sndSent = '_snd-sent';
    CourseModel.tmediaText = 'media-text';
    CourseModel.t_mediaReplica = '_media-replica';
    CourseModel.t_mediaSent = '_media-sent';
    CourseModel.tinclude = 'include';
    CourseModel.tincludeText = 'include-text';
    CourseModel.tincludeDialog = 'include-dialog';
    CourseModel.tphraseReplace = 'phrase-replace';
    CourseModel.t_sndFile = '_snd-file';
    CourseModel.tcutDialog = 'cut-dialog';
    CourseModel.tcutText = 'cut-text';
    CourseModel.tphrase = 'phrase';
    CourseModel.treplica = 'replica';
    CourseModel.turlTag = 'url-tag';
    CourseModel.tmediaTag = 'media-tag';
    CourseModel.tmediaBigMark = 'media-big-mark';
    CourseModel.tmediaPlayer = 'media-player';
    CourseModel.tmediaVideo = 'media-video';
    CourseModel.tttsSound = 'tts-sound';
    CourseModel.tmacroTemplate = 'macro-template';
    CourseModel.tinlineTag = 'inline-tag';
    CourseModel.thtmlTag = 'html-tag';
    CourseModel.tscript = 'script';
    CourseModel.timg = 'img';
    CourseModel.textension = 'extension';
    CourseModel.tdocExample = 'doc-example';
    CourseModel.tdragTarget = 'drag-target';
    CourseModel.tdocNamed = 'doc-named';
    CourseModel.tdocType = 'doc-type';
    CourseModel.tdocEnum = 'doc-enum';
    CourseModel.tdocEnumItem = 'doc-enum-item';
    CourseModel.tdocProp = 'doc-prop';
    CourseModel.tdocDescr = 'doc-descr';
    CourseModel.tdocTagsMeta = 'doc-tags-meta';
    CourseModel.gaffFill_normTable = {
        1040: 'A', 1072: 'a', 1042: 'B', 1074: 'b', 1045: 'E', 1077: 'e', 1050: 'K', 1082: 'k', 1052: 'M', 1084: 'm', 1053: 'H', 1085: 'h', 1054: 'O', 1086: 'o', 1056: 'P', 1088: 'p', 1057: 'C', 1089: 'c', 1058: 'T', 1090: 't', 1059: 'Y', 1091: 'y', 1061: 'X', 1093: 'x', 1105: '?', 161: '!', 160: ' ', 191: '?', 241: '?', 39: '?', 96: '?', 180: '?', 733: '"', 8216: '?', 8219: '?', 8220: '"', 8221: '"', 8222: '"', 8242: '?', 8243: '"'
    };
})(CourseModel || (CourseModel = {}));

var testMe;
(function (testMe) {
    (function (Status) {
        Status[Status["no"] = 0] = "no";
        Status[Status["Started"] = 1] = "Started";
        Status[Status["Interrupted"] = 2] = "Interrupted";
        Status[Status["SendedToEvaluation"] = 3] = "SendedToEvaluation";
        Status[Status["EvalAssigned"] = 4] = "EvalAssigned";
        Status[Status["Evaluated"] = 5] = "Evaluated";
    })(testMe.Status || (testMe.Status = {}));
    var Status = testMe.Status;
})(testMe || (testMe = {}));

var CourseMeta;
(function (CourseMeta) {
    (function (runtimeType) {
        runtimeType[runtimeType["no"] = 0] = "no";
        runtimeType[runtimeType["courseNode"] = 1] = "courseNode";
        runtimeType[runtimeType["multiTask"] = 2] = "multiTask";
        runtimeType[runtimeType["product"] = 4] = "product";
        runtimeType[runtimeType["test"] = 8] = "test";
        runtimeType[runtimeType["grammarRoot"] = 16] = "grammarRoot";
        runtimeType[runtimeType["taskCourse"] = 32] = "taskCourse";
        runtimeType[runtimeType["taskPretest"] = 64] = "taskPretest";
        runtimeType[runtimeType["taskPretestTask"] = 128] = "taskPretestTask";
        runtimeType[runtimeType["taskTestInCourse"] = 256] = "taskTestInCourse";
        runtimeType[runtimeType["taskTestSkill"] = 512] = "taskTestSkill";
        runtimeType[runtimeType["ex"] = 1024] = "ex";
        runtimeType[runtimeType["dynamicModuleData"] = 2048] = "dynamicModuleData";
        runtimeType[runtimeType["project"] = 4096] = "project";
        runtimeType[runtimeType["mod"] = 8192] = "mod";
        runtimeType[runtimeType["dynamicTestModule"] = 16384] = "dynamicTestModule";
        runtimeType[runtimeType["skipAbleRoot"] = 32768] = "skipAbleRoot";
        runtimeType[runtimeType["grammar"] = 65536] = "grammar";
        runtimeType[runtimeType["instrs"] = 131072] = "instrs";
        runtimeType[runtimeType["noDict"] = 262144] = "noDict";
        runtimeType[runtimeType["publisher"] = 524288] = "publisher";
        runtimeType[runtimeType["sitemap"] = 1048576] = "sitemap";
        runtimeType[runtimeType["products"] = 2097152] = "products";
        runtimeType[runtimeType["mediaCutFile"] = 4194304] = "mediaCutFile";
        runtimeType[runtimeType["mediaDir"] = 8388608] = "mediaDir";
        runtimeType[runtimeType["error"] = 16777216] = "error";
        runtimeType[runtimeType["testTaskGroup"] = 33554432] = "testTaskGroup";
        runtimeType[runtimeType["multiTest"] = 67108864] = "multiTest";
        runtimeType[runtimeType["multiQuestionnaire"] = 134217728] = "multiQuestionnaire";
        runtimeType[runtimeType["testDemo"] = 268435456] = "testDemo";
    })(CourseMeta.runtimeType || (CourseMeta.runtimeType = {}));
    var runtimeType = CourseMeta.runtimeType;
    (function (childMode) {
        childMode[childMode["child"] = 0] = "child";
        childMode[childMode["self"] = 1] = "self";
        childMode[childMode["selfChild"] = 2] = "selfChild";
        childMode[childMode["childsWithParent"] = 3] = "childsWithParent";
        childMode[childMode["childsWithParentIfMulti"] = 4] = "childsWithParentIfMulti";
        childMode[childMode["skrivanek_multiTest_std"] = 5] = "skrivanek_multiTest_std";
        childMode[childMode["skrivanek_multiTest_compl"] = 6] = "skrivanek_multiTest_compl";
    })(CourseMeta.childMode || (CourseMeta.childMode = {}));
    var childMode = CourseMeta.childMode;
    (function (dictTypes) {
        dictTypes[dictTypes["unknown"] = 0] = "unknown";
        dictTypes[dictTypes["no"] = 1] = "no";
        dictTypes[dictTypes["L"] = 2] = "L";
    })(CourseMeta.dictTypes || (CourseMeta.dictTypes = {}));
    var dictTypes = CourseMeta.dictTypes;
    (function (testNeeds) {
        testNeeds[testNeeds["no"] = 0] = "no";
        testNeeds[testNeeds["playing"] = 1] = "playing";
        testNeeds[testNeeds["recording"] = 2] = "recording";
    })(CourseMeta.testNeeds || (CourseMeta.testNeeds = {}));
    var testNeeds = CourseMeta.testNeeds;
    CourseMeta.meta = { "rootTagName": "data", "types": { "data": { "props": { "title": {}, "order": { "st": 1088 }, "url": {}, "line": { "enumType": LMComLib.LineIds }, "allLocs": { "st": 1024 }, "type": { "enumType": CourseMeta.runtimeType }, "styleSheet": { "st": 1024 }, "name": {}, "ms": { "st": 64 }, "parent": { "st": 512 }, "uniqId": { "st": 64 }, "Items": {}, "dataItems": { "st": 1536 }, "spaceId": { "st": 1536 }, "globalId": { "st": 1536 }, "style": { "st": 1536 }, "pathParts": { "st": 1024 } } }, "sitemap": { "anc": "data", "props": {} }, "publisher": { "anc": "data", "props": { "vsNetData": { "st": 1024 }, "publisherRoot": { "st": 1024 } } }, "project": { "anc": "data", "props": { "ftpPassword": {}, "FtpUser": {}, "FtpPassword": { "st": 512 } } }, "ptr": { "anc": "data", "props": { "takeChilds": { "enumType": CourseMeta.childMode }, "skip": { "st": 64 }, "take": { "st": 64 }, "urls": {}, "isGramm": { "st": 64 }, "modify": {} } }, "products": { "anc": "data", "props": {} }, "product": { "anc": "data", "props": { "defaultDictType": { "enumType": CourseMeta.dictTypes }, "defaultLocs": {} } }, "taskTestInCourse": { "anc": "data", "props": {} }, "test": { "anc": "data", "props": { "demoTestUrl": {}, "level": {}, "needs": { "enumType": CourseMeta.testNeeds }, "isDemoTest": { "st": 64 } } }, "mod": { "anc": "data", "props": {} }, "taskCourse": { "anc": "data", "props": {} }, "multiTask": { "anc": "data", "props": {} }, "taskTestSkill": { "anc": "data", "props": { "skill": {}, "minutes": { "st": 64 }, "scoreWeight": { "st": 64 } } }, "dynamicModuleData": { "anc": "data", "props": { "groups": {} } }, "testTaskGroup": { "anc": "data", "props": { "urls": {}, "take": { "st": 64 }, "designTitle": {} } }, "ex": { "anc": "data", "props": { "isOldEa": { "st": 1088 }, "isOldEaPassive": { "st": 1088 }, "instrs": { "st": 1024 } } } } };
    CourseMeta.tdata = 'data';
    CourseMeta.tsitemap = 'sitemap';
    CourseMeta.tpublisher = 'publisher';
    CourseMeta.tproject = 'project';
    CourseMeta.tptr = 'ptr';
    CourseMeta.tproducts = 'products';
    CourseMeta.tproduct = 'product';
    CourseMeta.ttaskTestInCourse = 'taskTestInCourse';
    CourseMeta.ttest = 'test';
    CourseMeta.tmod = 'mod';
    CourseMeta.ttaskCourse = 'taskCourse';
    CourseMeta.tmultiTask = 'multiTask';
    CourseMeta.ttaskTestSkill = 'taskTestSkill';
    CourseMeta.tdynamicModuleData = 'dynamicModuleData';
    CourseMeta.ttestTaskGroup = 'testTaskGroup';
    CourseMeta.tex = 'ex';
})(CourseMeta || (CourseMeta = {}));

var CourseModel;
(function (CourseModel) {
    function registerClassToInterface(meta, tg, cls) {
        if (!meta.classDir)
            meta.classDir = {};
        meta.classDir[tg] = cls;
    }
    CourseModel.registerClassToInterface = registerClassToInterface;
    CourseModel.tspan = "span";
    CourseModel.tp = "p";
    CourseModel.ta = "a";
    CourseModel.tbr = "br";
    CourseModel.tdiv = "div";
    CourseModel.thr = "hr";
    function hasStatus(tg, st) {
        var tp = CourseModel.meta.types[tg._tg];
        return !tp ? false : (tp.st & st) == st;
    }
    CourseModel.hasStatus = hasStatus;
    function hasStatusLow(status, st) {
        return (status & st) == st;
    }
    CourseModel.hasStatusLow = hasStatusLow;
    function metaObjRootTag(metaObj) {
        if (metaObj === void 0) { metaObj = null; }
        return metaObj.rootTagName;
    }
    function ancestorsAndSelf(type, metaObj) {
        if (metaObj === void 0) { metaObj = null; }
        var ancs = ancestorsAndSelfObj(type, metaObj);
        return !ancs ? null : _.map(ancestorsAndSelfObj(type, metaObj), function (m) { return m.name; });
    }
    CourseModel.ancestorsAndSelf = ancestorsAndSelf;
    function isDescendantOf(self, ancestor) {
        return _.any(ancestorsAndSelfObj(self), function (a) { return a.name == ancestor; });
    }
    CourseModel.isDescendantOf = isDescendantOf;
    function ancestorsAndSelfObj(type, metaObj) {
        if (metaObj === void 0) { metaObj = null; }
        if (!metaObj)
            metaObj = CourseModel.meta;
        var res = [];
        var obj = metaObj.types[type];
        if (!obj)
            return null;
        var name = type;
        while (true) {
            res.push({ meta: obj, name: name });
            if (name == metaObjRootTag(metaObj))
                break;
            name = obj.anc;
            obj = metaObj.types[name];
        }
        return res;
    }
    CourseModel.ancestorsAndSelfObj = ancestorsAndSelfObj;
    function descendants(type, metaObj) {
        if (metaObj === void 0) { metaObj = null; }
        if (!metaObj)
            metaObj = CourseModel.meta;
        var res = [];
        for (var p in metaObj.types) {
            if (p == metaObjRootTag(metaObj))
                continue; //ttag neni anc niceho
            var anc = p;
            while (true) {
                anc = metaObj.types[anc].anc;
                if (anc == type) {
                    res.push(p);
                    break;
                } //'type' je mezi nacestory 'p'
                if (anc == metaObjRootTag(metaObj))
                    break;
            }
        }
        while (true) {
            res.unshift(type);
            type = metaObj.types[type].anc;
            if (type == metaObjRootTag(metaObj))
                break;
        }
        return res;
    }
    CourseModel.descendants = descendants;
    function getPropInfo(type, propName, metaObj) {
        if (metaObj === void 0) { metaObj = null; }
        var res = null;
        _.find(ancestorsAndSelfObj(type, metaObj), function (m) { res = m.meta.props ? m.meta.props[propName] : null; return !!res; });
        return res;
    }
    CourseModel.getPropInfo = getPropInfo;
    function getPropInfos(type, metaObj) {
        if (metaObj === void 0) { metaObj = null; }
        var res = [];
        _.each(ancestorsAndSelfObj(type, metaObj).reverse(), function (m) {
            if (!m.meta.props)
                return;
            for (var p in m.meta.props)
                res.push({ name: p, meta: m.meta.props[p] });
        });
        return res;
    }
    CourseModel.getPropInfos = getPropInfos;
})(CourseModel || (CourseModel = {}));
//module CourseModel {
//  export class itemObj implements ItemObj {
//    Item: tag;
//  }
//  export class tag implements Tag {
//    constructor() {
//      this.tagInfo = tagInfos[this.Type];
//    }
//    //Tag
//    Type: string;
//    Classes: string;
//    id: string;
//    Width: string;
//    style: string;
//    specItems: Array<tag>;
//    Items: Array<tag>;
//    Item: itemObj;
//    //other
//    parent: tag;
//    myPage: page;
//    localize(locProc: (s: string) => string): void { }
//    tagInfo: TagStatic;
//  }
//  export class text extends tag implements Text {
//    Title: string;
//    localize(locProc: (s: string) => string): void {
//      super.localize(locProc);
//      this.Title = locProc(this.Title);
//    }
//  }
//  export class control extends tag implements Result {
//    //constructor(public data: CourseModel.Tag, public myPage: Page) {
//    //  this.tagInfo = CourseModel.tagInfos[data.Type];
//    //  (<any>data).control = this;
//    //  if (data.Item && data.Item.Item) {
//    //    data.specItems = _.clone(data.Items);
//    //    data.Items.unshift(data.Item.Item);
//    //    data.Item = <any>(data.Item.Item); //hack, dereference
//    //  } else
//    //    data.specItems = data.Items;
//    //}
//    tagInfo: CourseModel.TagStatic;
//    parent: control; // parent control
//    childs: Array<control> = []; //child controls (nikoliv tags, pouze controls)
//    result: CourseModel.Result; //pointer na vysledek kontrolky
//    status(): LMComLib.ExerciseStatus { return this.myPage.st; }
//    createResult(forceEval: boolean = false): CourseModel.Result { throw "not overwrited"; } //inicializace objektu s vysledkem kontrolky
//    provideData(data: CourseModel.Result): void { throw "not overwrited"; } //predani dat z kontrolky do persistence
//    acceptData(exSt: LMComLib.ExerciseStatus, userData: CourseModel.Result): void { } //zmena stavu kontrolky na zaklade persistentnich dat
//    score(): CourseModel.Score { var c = this.isCorrect(); return { ms: 1, s: c ? 1 : 0, needsHumanEval: false }; } //spocti score kontrolky
//    isCorrect(): boolean { throw "not overwrited"; } //pro 0 x 1 score
//    finishLoading: (completed: () => void) => void; //dokonceni kontrolky
//    finish(): void { }
//    selfElement() { return Course.idToElement(this.id); }
//    getItem(id: string): control { return this.myPage.getItem(id); }
//    //style(): string {
//    getStyle(): string {
//      var res = this.widthStyle();
//      if (res != null) return " style='" + res + "'";
//    }
//    widthStyle() { return Course.getWidthStyle(this.Width); }
//    forDescendants(action: (ctrl: control) => void) {
//      _.each(this.childs, c => { action(c); c.forDescendants(action); });
//    }
//  }
//  export class page extends control implements Page, PageUser {
//    //Page
//    //info: schools.page; //obsolete
//    url: string;
//    order: number;
//    title: string;
//    instrTitle: string;
//    instrs: Array<string>;
//    seeAlso: Array<schools.seeAlsoLink>;
//    externals: Array<string>;
//    courseSeeAlsoStr: string;
//    CrsId: LMComLib.CourseIds;
//    isPassive: boolean;
//    isOldEA: boolean;
//    //sitemapIgnore: boolean;
//    //PageUser
//    i: number;
//    s: Score;
//    st: LMComLib.ExerciseStatus;
//    bt: number;
//    et: number;
//    t: number;
//    Results: any;
//    //other
//    controls: { [id: string]: control; };
//    localize(locProc: (s: string) => string): void {
//      super.localize(locProc);
//      this.title = locProc(this.title);
//    }
//    items: Array<control> = [];
//    getItem(id: string): control { return _.find(this.items, (c: control) => c.id == id); }
//    normalStatus = ko.observable<boolean>(false);
//    //sound: pageSound; TODO
//    finishPageLoading(completed: () => void) {
//      var compl = () => {
//        //this.sound = new pageSound(this); TODO
//        this.isPassive = _.all(this.items, (it: control) => CourseModel.tagInfos[it.Type].noEval); //pasivni cviceni nema zadne kontrolky
//        completed();
//      };
//      if (typeof $.ajax == 'undefined') { //bez JQuery
//        _.each(this.items, ctrl => ctrl.finishLoading(() => { }));
//        compl(); return;
//      }
//      var promises = _.compact(_.map(this.items, ctrl => {
//        var defered = $.Deferred();
//        ctrl.finishLoading(defered.resolve);
//        return defered.promise();
//      }));
//      $.whenall(promises).done(compl);
//    }
//    /*** IScoreProvider ***/
//    provideData(exData: { [ctrlId: string]: Object; }): void { _.each(this.items, (ctrl: control) => { if (ctrl.tagInfo.noEval) return; ctrl.provideData(exData[ctrl.id]); }); }
//    acceptData(exSt: LMComLib.ExerciseStatus, exData: { [ctrlId: string]: Object; }): void {
//      _.each(this.items, (ctrl: control) => { ctrl.acceptData(exSt, exData[ctrl.id]); });
//      this.normalStatus(exSt == LMComLib.ExerciseStatus.Normal);
//    }
//    resetData(exData: { [ctrlId: string]: Object; }): void {
//      _.each(this.items, (ctrl: control) => { if (ctrl.tagInfo.noEval) return; ctrl.result = exData[ctrl.id] = ctrl.createResult(); });
//      this.acceptData(LMComLib.ExerciseStatus.Normal, exData);
//    }
//    get_score(): number[] { throw "not implemented"; } //implementuje stary EA. V Exercise.ts se meni na getScore
//    getScoreLow(): CourseModel.Score {
//      var res: CourseModel.Score = { ms: 0, s: 0, needsHumanEval: false };
//      _.each(this.items, (ctrl: control) => {
//        if (ctrl.tagInfo.noEval) return;
//        var sc = ctrl.score();
//        res.ms += sc.ms; res.s += sc.s; res.needsHumanEval = res.needsHumanEval || sc.needsHumanEval;
//      });
//      return res;
//    }
//    getScore: () => CourseModel.Score;
//    status(): LMComLib.ExerciseStatus { return this.st; }
//    //Helper
//    find(id: string): control { return _.find(this.items, it => it.id == id); }
//    filter(cond: (c: control) => boolean): control[] { return _.filter(this.items, it => cond(it)); }
//  }
//  export class checkItem extends control implements CheckItem, CheckItemResult {
//    //CheckItem
//    CorrectValue: boolean;
//    //CheckItemResult
//    TextId: CheckItemTexts;
//    Value: boolean;
//  }
//  export class pairing extends control implements Pairing, PairingResult {
//    Value: Array<number>;
//  }
//  export class singleChoiceLow extends control implements SingleChoiceLow, SingleChoiceResult {
//    CorrectValue: number;
//    Data: Array<string>;
//    Value: number;
//  }
//  export class singleChoice extends singleChoiceLow {
//  }
//  export class wordSelection extends singleChoiceLow {
//    Words: string;
//  }
//  export function scan(dt: Tag, action: (dt: Tag) => void, cond: (dt: Tag) => boolean = null): void {
//    if (dt.Items) _.each(dt.Items, it => scan(it, action, cond));
//    if (!cond || cond(dt)) action(dt);
//  }
//  export function find(dt: Tag, cond: (dt: Tag) => boolean = null): Tag {
//    if (cond(dt)) return dt; if (!dt.Items) return null;
//    var res: Tag = null;
//    return _.find(dt.Items, it => (res = find(it, cond)) != null) ? res : null;
//  }
//  export function finishAndLocalize(pgLow: Page, locProc: (s: string) => string): void {
//    var pg = <page>pgLow;
//    pg.controls = {};
//    scan(pg, (dt: tag) => {
//      if (dt.Items) _.each(dt.Items, (it: tag) => { it.parent = dt; it.myPage = pg; });
//      switch (dt.Type) {
//        case tPage: Utils.extend(dt, page); break;
//        case tText: Utils.extend(dt, text); break;
//        case tGapFill: Utils.extend(dt, tag); break;
//        case tPairing: Utils.extend(dt, pairing); break;
//        case tSingleChoice: Utils.extend(dt, singleChoice); break;
//        case tWordSelection: Utils.extend(dt, wordSelection); break;
//        case tCheckItem: Utils.extend(dt, tag); break;
//        case tPossibilities: Utils.extend(dt, tag); break;
//        case tDragSource: Utils.extend(dt, tag); break;
//        case tDragTarget: Utils.extend(dt, tag); break;
//        case tPassiveDialog: Utils.extend(dt, tag); break;
//        case tMediaDialog: Utils.extend(dt, tag); break;
//        case tMediaText: Utils.extend(dt, tag); break;
//        case tMediaBigMark: Utils.extend(dt, tag); break;
//        case tMediaBar: Utils.extend(dt, tag); break;
//        case tMediaTitle: Utils.extend(dt, tag); break;
//        case tMediaVideo: Utils.extend(dt, tag); break;
//        case tMediaReplica: Utils.extend(dt, tag); break;
//        case tSndSent: Utils.extend(dt, tag); break;
//        case tSndReplica: Utils.extend(dt, tag); break;
//        default: Utils.extend(dt, tag); break;
//      };
//      if (dt.id) pg.controls[dt.id] = <any>dt;
//      dt.localize(locProc);
//    });
//  }
//  //**** normalize GapFill string
//  export function normalize(value: string): string {
//    if (value == null || value == '') return value;
//    value = value.toLowerCase();
//    var st = 0; var res = "";
//    for (var i = 0; i < value.length; i++) {
//      var ch = value.charAt(i);
//      switch (st) {
//        case 0: if (!Unicode.isLeterOrDigit(ch)) continue; res += ch; st = 1; break; //pocatecni whitespaces
//        case 1: if (!Unicode.isLeterOrDigit(ch)) { st = 2; continue; } res += ch; break; //neni whitestapce
//        case 2: if (!Unicode.isLeterOrDigit(ch)) continue; res += " "; res += ch; st = 1; break; //dalsi whitespaces
//      }
//    }
//    return res;
//  }
//}  

/// <reference path="GenCourseModel.ts" />
/// <reference path="GapFill.ts" />
/// <reference path="Pairing.ts" />
/// <reference path="SingleChoice.ts" />
/// <reference path="CheckItem.ts" />
/// <reference path="Media.ts" />
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
/***** nemazat reference, nejde pak prelozit *****/
var Course;
(function (Course) {
    (function (initPhase) {
        initPhase[initPhase["beforeRender"] = 0] = "beforeRender";
        initPhase[initPhase["afterRender"] = 1] = "afterRender";
        initPhase[initPhase["afterRender2"] = 2] = "afterRender2";
    })(Course.initPhase || (Course.initPhase = {}));
    var initPhase = Course.initPhase;
    ;
    (function (initPhaseType) {
        initPhaseType[initPhaseType["no"] = 0] = "no";
        initPhaseType[initPhaseType["sync"] = 1] = "sync";
        initPhaseType[initPhaseType["async"] = 2] = "async";
    })(Course.initPhaseType || (Course.initPhaseType = {}));
    var initPhaseType = Course.initPhaseType;
    ;
    function scorePercent(sc) { return sc.ms == 0 ? -1 : Math.round(sc.s / sc.ms * 100); }
    Course.scorePercent = scorePercent;
    function needsHumanEval(flag) { return (flag & CourseModel.CourseDataFlag.needsEval) != 0; }
    Course.needsHumanEval = needsHumanEval;
    Course.dummyTag = { _tg: CourseModel.tspan, 'class': null, id: null, Items: null, _owner: null, srcpos: '' };
    //function getEvalData(ev: control) { return <evalControlImpl>ev; }
    var tagImpl = (function () {
        function tagImpl(data) {
            if (data)
                for (var p in data)
                    if (data.hasOwnProperty(p))
                        this[p] = data[p];
        }
        tagImpl.prototype.jsonMLParsed = function () {
            this._myPage = (_.find(this.parents(true), function (t) { return t._tg == CourseModel.tbody; }));
        };
        tagImpl.prototype.pageCreated = function () { }; //volana po nacteni user dat, vytvoreni page apod.
        tagImpl.prototype.parents = function (incSelf) { var res = []; var t = incSelf ? this : this._owner; while (t) {
            res.push(t);
            t = t._owner;
        } return res; };
        tagImpl.prototype.isEval = function () { return CourseModel.hasStatus(this, CourseModel.tgSt.isEval); };
        tagImpl.prototype.isCtrl = function () { return CourseModel.hasStatus(this, CourseModel.tgSt.jsCtrl); };
        tagImpl.prototype.isMedia = function () { return _.any(CourseModel.ancestorsAndSelf(this._tg), function (anc) { return anc == CourseModel.tmediaTag; }); };
        tagImpl.prototype.initProc = function (phase, getTypeOnly, completed) { return initPhaseType.no; };
        tagImpl.prototype.getItem = function (id) { return this._myPage.tags[id]; };
        tagImpl.prototype.srcPosition = function () { return _.isEmpty(this.srcpos) ? '' : ' srcpos="' + this.srcpos + '"'; };
        return tagImpl;
    })();
    Course.tagImpl = tagImpl;
    var imgImpl = (function (_super) {
        __extends(imgImpl, _super);
        function imgImpl() {
            _super.apply(this, arguments);
        }
        imgImpl.prototype.jsonMLParsed = function () {
            _super.prototype.jsonMLParsed.call(this);
            if (_.isEmpty(this.src))
                return;
            this.src = Utils.fullUrl(this.src) ? this.src : (cfg.baseTagUrl ? cfg.baseTagUrl : Pager.basicDir) + Utils.combineUrl(this._myPage.url, this.src);
        };
        return imgImpl;
    })(tagImpl);
    Course.imgImpl = imgImpl;
    var aImpl = (function (_super) {
        __extends(aImpl, _super);
        function aImpl() {
            _super.apply(this, arguments);
        }
        aImpl.prototype.jsonMLParsed = function () {
            _super.prototype.jsonMLParsed.call(this);
            if (!this.href)
                return;
            this.href = this.href.toLowerCase();
            if (this.href.match(/^(\/?\w)+$/)) {
                this['-href'] = this.href;
                this.href = '#';
            }
        };
        return aImpl;
    })(tagImpl);
    Course.aImpl = aImpl;
    $(document).on('click', 'a[-href]', function (ev) {
        var href = $(ev.target).attr('-href');
        if (_.isEmpty(href))
            return;
        alert('TODO: ' + href);
        //gotoHref(null, href);
    });
    var evalControlImpl = (function (_super) {
        __extends(evalControlImpl, _super);
        function evalControlImpl(data) {
            _super.call(this, data);
            this.done = ko.observable(false); //priznak kontrolky ve stavu Done
            if (!this.id)
                this.id = "_id_" + (evalControlImpl.idCnt++).toString();
        }
        evalControlImpl.prototype.jsonMLParsed = function () {
            _super.prototype.jsonMLParsed.call(this);
            if (!this.scoreWeight) {
                if (this._tg != CourseModel.tpairingItem && this._tg != CourseModel.tpairing)
                    this.scoreWeight = 100;
            }
        };
        evalControlImpl.prototype.pageDone = function () { return this._myPage.result.done; };
        //getTagProps(): Array<CourseModel.tag> { //tagy, ulozene v property
        //  var res: Array<CourseModel.tag> = [];
        //  _.each(CourseModel.getPropInfos(this.tg), prop => {
        //    //if (!CourseModel.hasStatusLow(prop.meta.st, CourseModel.tgSt.inItems)) return;
        //    if (_.isEmpty(prop.meta.childPropTypes)) return;
        //    var val = this[Utils.toCammelCase(prop.name)]; if (!val) return;
        //    if (CourseModel.hasStatusLow(prop.meta.st, CourseModel.tgSt.isArray)) res.pushArray(val); else res.push(val);
        //  });
        //  return res;
        //}
        evalControlImpl.prototype.isReadOnly = function () { return false; };
        evalControlImpl.prototype.isSkipEvaluation = function () { return false; };
        evalControlImpl.prototype.createResult = function (forceEval) { throw "not overwrited"; }; //inicializace objektu s vysledkem kontrolky
        evalControlImpl.prototype.provideData = function () { throw "not overwrited"; }; //predani dat z kontrolky do persistence
        evalControlImpl.prototype.acceptData = function (done) { this.done(done || (this.myEvalBtn && this.myEvalBtn.doneResult)); }; //zmena stavu kontrolky na zaklade persistentnich dat
        evalControlImpl.prototype.resetData = function (allData) { this.result = allData[this.id] = this.doCreateResult(false); this.acceptData(false); };
        //**** jedna z nasledujicich 2 metod musi byt v kontrolce prepsana. Pouziva se 1. result (zjisteny pomoci provideData z HTML), 2. source (xml) data 
        evalControlImpl.prototype.setScore = function () { var c = this.isCorrect(); this.result.ms = this.scoreWeight; this.result.s = c ? this.scoreWeight : 0; };
        evalControlImpl.prototype.isCorrect = function () { throw "not overwrited"; };
        //getResultScore(): CourseModel.Score { return { ms: this.result.ms, s: this.result.s }; }
        evalControlImpl.prototype.doProvideData = function () { this.provideData(); this.setScore(); };
        evalControlImpl.prototype.doCreateResult = function (forceEval) { this.result = this.createResult(forceEval); this.setScore(); return this.result; };
        evalControlImpl.prototype.selfElement = function () { return idToElement(this.id); };
        evalControlImpl.prototype.pageCreated = function () {
            if (!this.id)
                throw 'eval control mush have id';
            var pgRes = this._myPage.result;
            if (!pgRes.result) {
                pgRes.result = {};
                this._myPage.result.userPending = true;
            }
            var ress = pgRes.result;
            if (pgRes.designForceEval || !ress[this.id]) {
                ress[this.id] = this.doCreateResult(pgRes.designForceEval);
                this._myPage.result.userPending = true;
            }
        };
        evalControlImpl.idCnt = 0;
        return evalControlImpl;
    })(tagImpl);
    Course.evalControlImpl = evalControlImpl;
    var humanEvalControlImpl = (function (_super) {
        __extends(humanEvalControlImpl, _super);
        function humanEvalControlImpl() {
            _super.apply(this, arguments);
            this.human = ko.observable('');
            this.humanLevel = ko.observable('');
            this.humanHelpTxt = ko.observable('');
        }
        humanEvalControlImpl.prototype.isHumanEvalMode = function () { return cfg.humanEvalMode || this._myPage.humanEvalMode; };
        humanEvalControlImpl.prototype.adjustEvalForm = function () {
            if (!this.isHumanEvalMode())
                return;
            this.form = $('#form-' + this.id);
            var par = { onsubmit: false, rules: {} };
            par.rules['human-ed-' + this.id] = { required: true, range: [0, this.scoreWeight], number: true };
            this.form.validate(par);
        };
        humanEvalControlImpl.prototype.acTestLevel = function () {
            var ex;
            var test;
            if (!this._myPage || !(ex = this._myPage.result) || !ex.parent || !(test = ex.parent.parent))
                return null;
            if (!CourseMeta.isType(test, CourseMeta.runtimeType.test))
                return null;
            return test.level;
        };
        humanEvalControlImpl.useEvalForms = function (ex) {
            if (!cfg.humanEvalMode && !ex.page.humanEvalMode)
                return undefined;
            //var toEvals: Array<{ hc: humanEvalControlImpl; visible: boolean; }> = [];
            var toEvals = [];
            for (var p in ex.page.tags) {
                var hc = (ex.page.tags[p]);
                if (CourseModel.isDescendantOf(hc._tg, CourseModel.thumanEval))
                    //toEvals.push({ hc: hc, visible: hc.form.css('display') != 'none' });
                    if (hc.form.css('display') != 'none')
                        toEvals.push(hc);
            }
            //if (!_.all(toEvals, f => !f.visible || f.hc.form.valid())) return false;
            if (!_.all(toEvals, function (f) { return f.form.valid(); }))
                return false;
            _.each(toEvals, function (ev) {
                ev.result.hPercent = parseInt(ev.human());
                ev.result.hEmail = LMStatus.Cookie.EMail;
                ev.result.hLmcomId = LMStatus.Cookie.id;
                ev.result.hDate = Utils.nowToNum();
                ev.result.flag = ev.result.flag & ~CourseModel.CourseDataFlag.needsEval;
                ev.setScore();
            });
            ex.userPending = true;
            var score = ex.evaluator.getScore();
            ex.s = score.s;
            ex.flag = score.flag;
            CourseMeta.actCourseRoot.refreshNumbers();
            return true;
        };
        return humanEvalControlImpl;
    })(evalControlImpl);
    Course.humanEvalControlImpl = humanEvalControlImpl;
    function idToElement(id) { return $('#' + id).first(); }
    Course.idToElement = idToElement;
    function finishCreatePage(ex) { var res = ex.page; res.finishCreatePage(ex); return res; }
    Course.finishCreatePage = finishCreatePage;
    var Page = (function (_super) {
        __extends(Page, _super);
        function Page() {
            _super.apply(this, arguments);
            this.tags = {}; //all named tags
        }
        Page.prototype.isPassivePage = function () { return this.isOldEa ? this.oldEaIsPassive : !this.evalPage || this.evalPage.maxScore == 0; };
        Page.prototype.finishCreatePage = function (userData) {
            var _this = this;
            //finishCreatePage(userData: CourseMeta.IExUser) {
            _super.prototype.pageCreated.call(this);
            this.result = userData;
            //nalezni vsechny controls
            var res = [];
            scan(this, res);
            _.each(this.propertyTags, function (t) { return scan(t, res); });
            this.items = _.filter(res, function (t) { return t.isCtrl && t.isCtrl(); });
            this.sndPage.allMediaTags = _.filter(res, function (t) { return t.isMedia && t.isMedia(); });
            _.each(res, function (t) { if (t.id)
                _this.tags[t.id] = t; });
            //dokonci vytvoreni kontrolek
            _.each(res, function (c) { if (c.pageCreated)
                c.pageCreated(); });
        };
        Page.prototype.callInitProcs = function (phase, completed) {
            var _this = this;
            //synchronni init akce
            _.each(_.filter(this.items, function (ctrl) { return ctrl.initProc(phase, true, null) == initPhaseType.sync; }), function (ctrl) { return ctrl.initProc(phase, false, null); });
            //asynchronni init akce
            var promises = _.compact(_.map(_.filter(this.items, function (ctrl) { return ctrl.initProc(phase, true, null) == initPhaseType.async; }), function (ctrl) {
                var defered = $.Deferred();
                ctrl.initProc(phase, false, defered.resolve);
                return defered.promise();
            }));
            $.whenall(promises).done(function () {
                if (phase == initPhase.afterRender2)
                    Course.edit.adjustSmartWidths(_this);
                completed();
            });
        };
        /*** IScoreProvider ***/
        Page.prototype.provideData = function (allData) {
            //_.each(this.evalItems, ctrl => ctrl.provideData(allData[ctrl.id]));
            this.evalPage.provideData();
        };
        Page.prototype.acceptData = function (done, allData) {
            this.evalPage.acceptData(done);
            //readonly a skip-eval kontrolky
            this.processReadOnlyEtc(done, false);
        };
        Page.prototype.resetData = function (allData) {
            this.evalPage.resetData();
        };
        Page.prototype.getScore = function () { return this.evalPage.getScore(); }; // getORScore(this.evalItems); }
        Page.prototype.processReadOnlyEtc = function (done, provideData) {
            _.each(_.filter(this.items, function (it) { return it.isEval(); }), function (ev) {
                if (!ev.isReadOnly() && !ev.isSkipEvaluation())
                    return;
                if (provideData && ev.isSkipEvaluation())
                    ev.provideData();
                ev.acceptData(ev.isReadOnly() || done);
            });
        };
        return Page;
    })(tagImpl);
    Course.Page = Page;
    function finishTag(data) {
        switch (data._tg) {
            //case CourseModel.ta: var a = <CourseModel.a>data; if (a.href) a.href = a.href.toLowerCase(); break;
            case CourseModel.tp:
                var p = data;
                p._tg = CourseModel.tdiv;
                if (!p['class'])
                    p['class'] = [];
                else if (_.any(p['class'], function (c) { return c.indexOf('oli-par') == 0; }))
                    break;
                p['class'].push('oli-par');
                break; //knockout error, viz http://stackoverflow.com/questions/18869466/knockout-bug-cannot-match-comment-end
        }
    }
    ;
    var tag_helper = (function () {
        function tag_helper() {
        }
        tag_helper.prototype.c_unescape = function (data) {
            //if (data.indexOf('<') > 0 || data.indexOf('>') > 0)
            //  return data.replace('<', '&lt;').replace('>', '&gt;').replace('&', '&amp;')
            //else
            return data;
        };
        tag_helper.prototype.c_isCtrl = function (data) {
            if (_.isString(data))
                return false;
            return data.isCtrl && data.isCtrl();
        };
        tag_helper.prototype.c_tagstart = function (data) {
            try {
                if (data._tg == CourseModel.tnode)
                    return '';
                var sb = [];
                finishTag(data);
                sb.push("<" + data._tg);
                for (var p in data) {
                    if (p == 'Items' || p.charAt(0) == '_')
                        continue;
                    //Muze atribut zacinat velkym pismenem? Dej exception.
                    var firstCh = p.charAt(0);
                    if (firstCh != firstCh.toLowerCase())
                        throw 'something wrong'; //continue;
                    var val = data[p];
                    if (_.isFunction(val))
                        continue;
                    sb.push(' ' + p + '="' + (p == 'class' ? val.join(' ') : val) + '"');
                }
                sb.push(openCloseTags[data._tg] ? "/>" : ">");
                return sb.join('');
            }
            catch (msg) {
                debugger;
                throw msg;
            }
        };
        tag_helper.prototype.cT = function (data) {
            try {
                if (_.isString(data))
                    return JsRenderTemplateEngine.tmpl('c_textnew');
                //var st = CourseModel.meta.types[data.tg].st; 
                var tmpl;
                if (CourseModel.hasStatus(data, CourseModel.tgSt.jsCtrl))
                    tmpl = "c_" + Utils.toCammelCase(data._tg);
                else
                    tmpl = 'c_tag';
                return JsRenderTemplateEngine.tmpl(tmpl);
            }
            catch (msg) {
                debugger;
                throw msg;
            }
        };
        tag_helper.prototype.classes = function (data) {
            var clss = "oli-" + Utils.toCammelCase(data._tg);
            //_.each(CourseModel.ancestorsAndSelf(data.tg).reverse(), (t: string) => clss += "c-" + Utils.toCammelCase(t) + " ");
            clss += data['class'] ? " " + data['class'].join(' ') : "";
            return clss.toLowerCase();
        };
        tag_helper.prototype.c_tagend = function (data) {
            if (data._tg == CourseModel.tnode)
                return '';
            return openCloseTags[data._tg] ? '' : "</" + data._tg + ">";
        };
        return tag_helper;
    })();
    var openCloseTags = {};
    _.each([CourseModel.thr, CourseModel.tbr, CourseModel.timg], function (t) { return openCloseTags[t] = true; });
    //export function scan(dt: CourseModel.tag, action: (dt: CourseModel.tag) => void, cond: (dt: CourseModel.tag) => boolean = null): void {
    //  if (dt.Items) _.each(dt.Items, it => scan(it, action, cond));
    //  if (!cond || cond(dt)) action(dt);
    //}
    function scan(dt, res) {
        res.push(dt);
        _.each(dt.Items, function (it) { return scan(it, res); });
    }
    Course.scan = scan;
    function scanEx(dt, action) {
        if (!dt.Items)
            return;
        for (var i = 0; i < dt.Items.length; i++) {
            scanEx(dt.Items[i], action);
            action(dt, i);
        }
    }
    Course.scanEx = scanEx;
    function localize(pg, locProc) {
        pg.title = locProc(pg.title);
        pg.instrTitle = locProc(pg.instrTitle);
        scanEx(pg, function (parent, idx) {
            if (!parent.Items)
                return;
            var item = parent.Items[idx];
            //localize string
            if (_.isString(item)) {
                parent.Items[idx] = (locProc(item));
                return;
            }
            //localize pairing-item.right
            var pairItem = (item);
            if (pairItem._tg != CourseModel.tpairingItem)
                return;
            if (pairItem.right)
                pairItem.right = locProc(pairItem.right);
        });
    }
    Course.localize = localize;
    function getCourseAbsoluteUrl(rootUrl, url) {
        var parts = rootUrl.toLowerCase().split('/');
        parts[parts.length - 1] = url.toLowerCase();
        return Pager.basicUrl + "rwcourses/" + parts.join('/');
    }
    Course.getCourseAbsoluteUrl = getCourseAbsoluteUrl;
    $.views.helpers(new tag_helper());
    var writing = (function (_super) {
        __extends(writing, _super);
        function writing() {
            _super.apply(this, arguments);
        }
        return writing;
    })(evalControlImpl);
    Course.writing = writing;
    var speaking = (function (_super) {
        __extends(speaking, _super);
        function speaking() {
            _super.apply(this, arguments);
        }
        return speaking;
    })(evalControlImpl);
    Course.speaking = speaking;
    //var gf_normTable: { [charCode: number]: string; };
    //function normalizeChars(s: string) {
    //  if (_.isEmpty(s)) return s;
    //  if (gf_normTable == null) {
    //    gf_normTable = [];
    //    for (var i = 1; i < gf_nt.length; i += 2)
    //      gf_normTable[parseInt(gf_nt[i - 1])] = gf_nt[i];
    //  }
    //  for (var i = 0; i < s.length; i++) {
    //    var nw = gf_normTable[s.charCodeAt(i)];
    //    if (typeof (nw) != 'undefined') s = s.substring(0, i) + nw + s.substring(i + 1);
    //  }
    //  return s;
    //};
    function relevantChars(ch) {
        var nw = CourseModel.gaffFill_normTable[ch.charCodeAt(0)];
        if (nw)
            ch = nw;
        return Unicode.isLetter(ch) || Unicode.isNumber(ch);
    }
    //**** normalize GapFill string
    //algoritmus musi byt stejny s d:\LMCom\rew\ObjectModel\Model\CourseSchemaDOM.cs, public static string normalize(
    function normalize(value, caseSensitive) {
        if (caseSensitive === void 0) { caseSensitive = false; }
        if (_.isEmpty(value))
            return value;
        if (!caseSensitive)
            value = value.toLowerCase();
        var chars = value.split('');
        var res = [];
        var st = 0; //0..zacatek, 1..no space, 2..space 
        var charsNum = 0;
        var otherNum = 0;
        for (var i = 0; i < chars.length; i++) {
            var ch = chars[i];
            switch (st) {
                //case 0: if (!relevantChars(ch)) continue; st = 1; res.push(ch); break; //mezery na zacatku
                //case 1: if (relevantChars(ch)) { res.push(ch); continue; } st = 2; break; //nemezery 
                //case 2: if (!relevantChars(ch)) continue; st = 1; res.push(' '); res.push(ch); break; //mezery uprostred
                case 0:
                    if (!relevantChars(ch)) {
                        otherNum++;
                        continue;
                    }
                    st = 1;
                    charsNum++;
                    res.push(ch);
                    break; //mezery na zacatku
                case 1:
                    if (relevantChars(ch)) {
                        charsNum++;
                        res.push(ch);
                        continue;
                    }
                    otherNum++;
                    st = 2;
                    break; //nemezery 
                case 2:
                    if (!relevantChars(ch)) {
                        otherNum++;
                        continue;
                    }
                    st = 1;
                    res.push(' ');
                    res.push(ch);
                    break; //mezery uprostred
            }
        }
        if (charsNum <= 2 && otherNum >= charsNum)
            return value;
        return res.join('');
    }
    Course.normalize = normalize;
    var evalBtn = (function (_super) {
        __extends(evalBtn, _super);
        function evalBtn() {
            var _this = this;
            _super.apply(this, arguments);
            this.st = ko.observable('');
            this.click = function () {
                if (_this.pageDone())
                    return;
                _this.doneResult = !_this.doneResult;
                var btn = _this._myPage.evalPage.findBtn(_this);
                if (!btn)
                    return; //BT 2176
                var score = btn.click(_this.doneResult);
                if (_this.doneResult)
                    _this.scoreText(_this.scoreAsRatio ? score.s.toString() + '/' + score.ms.toString() : Math.round(100 * score.s / score.ms).toString() + '%');
                //var allData = this.myPage.result.result;
                //var myCtrls = _.filter(this.myPage.evalItems, c => (<evalControlImpl>c).evalBtnId == this.id);
                //_.each(myCtrls, ctrl => { //vsechny kontrolku z self eval grupy
                //  if (!this.doneResult) { //cilovy stav je Normal => reset
                //    ctrl.resetData(allData); // allData[ctrl.data.id] = ctrl.createResult(); ctrl.acceptData(false, ctrl.result);
                //  } else { //cilovy stav je doneResult => prevezmi data a zobraz vyhodnocenou kontrolku
                //    ctrl.provideData(ctrl.result);
                //    ctrl.acceptData(true, ctrl.result);
                //  }
                //});
                //if (this.doneResult) {
                //  var sc = getORScore(myCtrls);
                //  this.scoreText(Math.round(100 * sc.s / sc.ms).toString() + '%');
                //}
                _this.st(_this.doneResult ? 'evaluated' : 'no');
            };
            this.scoreText = ko.observable();
        }
        evalBtn.prototype.createResult = function (forceEval) { return { ms: 0, s: 0, tg: this._tg, flag: 0, Value: false }; };
        evalBtn.prototype.provideData = function () {
            if (this.pageDone())
                return;
            if (!this.result)
                this.result = this.createResult(false);
            this.result.Value = this.doneResult;
        };
        evalBtn.prototype.acceptData = function (pageDone) {
            this.doneResult = this.result && this.result.Value;
            if (pageDone)
                this.st('disabled');
            else
                this.st(this.doneResult ? 'evaluated' : 'no');
        };
        evalBtn.prototype.setScore = function () { this.result.ms = 0; this.result.s = 0; };
        return evalBtn;
    })(evalControlImpl);
    Course.evalBtn = evalBtn;
    var extensionImpl = (function (_super) {
        __extends(extensionImpl, _super);
        function extensionImpl() {
            _super.apply(this, arguments);
        }
        extensionImpl.prototype.jsonMLParsed = function () {
            _super.prototype.jsonMLParsed.call(this);
            switch (this.data) {
                case 'chinh-speaking':
                    this.myExtension = new Course.chinhSpeaking(this);
                    break;
                case 'doc-reference':
                    this.myExtension = new docreference.ext(this);
                    break;
                default: throw this.data;
            }
            if (this.myExtension && this.myExtension.jsonMLParsed)
                this.myExtension.jsonMLParsed(this);
        };
        extensionImpl.prototype.createResult = function (forceEval) { return this.myExtension && this.myExtension.createResult ? this.myExtension.createResult(this, forceEval) : { ms: 0, s: 0, tg: this._tg, flag: 0, Value: null }; };
        extensionImpl.prototype.provideData = function () {
            if (this.myExtension && this.myExtension.provideData)
                this.myExtension.provideData(this);
        };
        extensionImpl.prototype.acceptData = function (pageDone) {
            if (this.myExtension && this.myExtension.acceptData)
                this.myExtension.acceptData(this, pageDone);
        };
        extensionImpl.prototype.setScore = function () { if (this.myExtension && this.myExtension.setScore)
            this.myExtension.setScore(this);
        else {
            this.result.ms = 0;
            this.result.s = 0;
        } ; };
        extensionImpl.prototype.pageCreated = function () { if (this.myExtension && this.myExtension.pageCreated)
            this.myExtension.pageCreated(this);
        else
            _super.prototype.pageCreated.call(this); };
        extensionImpl.prototype.initProc = function (phase, getTypeOnly, completed) {
            if (this.myExtension && this.myExtension.initProc)
                return this.myExtension.initProc(phase, getTypeOnly, completed);
            else
                return initPhaseType.no;
        };
        return extensionImpl;
    })(evalControlImpl);
    Course.extensionImpl = extensionImpl;
    CourseModel.registerClassToInterface(CourseModel.meta, CourseModel.ta, aImpl);
    CourseModel.registerClassToInterface(CourseModel.meta, CourseModel.timg, imgImpl);
    CourseModel.registerClassToInterface(CourseModel.meta, CourseModel.tbody, Page);
    CourseModel.registerClassToInterface(CourseModel.meta, CourseModel.tevalButton, evalBtn);
    CourseModel.registerClassToInterface(CourseModel.meta, CourseModel.textension, extensionImpl);
})(Course || (Course = {}));
//xx/#DEBUG
var Logger;
(function (Logger) {
    function trace_course(msg) {
        Logger.trace("Course", msg);
    }
    Logger.trace_course = trace_course;
    function error_course(where, msg) {
        Logger.error("Sound", msg, where);
    }
    Logger.error_course = error_course;
    ;
})(Logger || (Logger = {}));
//xx/#ENDDEBUG
//var SoundNoop = null;

function gotoHref(event, url) {
    if (_.isEmpty(url))
        url = $(event.currentTarget).attr('href');
    url = Utils.combineUrl(CourseMeta.actNode.url, url);
    CourseMeta.gotoData(url);
    return false;
}
var CourseMeta;
(function (CourseMeta) {
    CourseMeta.allProductList; //hlavicky (metadata) vsech produktu
    CourseMeta.actProduct; //aktualni produkt
    CourseMeta.actProductPersistence; //persistence pro aktualni produkt VSNET
    CourseMeta.actProductLmcomId; //uzivatel aktualniho produktu
    CourseMeta.actNode; //aktualni node
    CourseMeta.actCompanyId;
    CourseMeta.actExPageControl; //aktualni model stranky se cvicenim
    CourseMeta.actInstr; //aktualni instrukce
    //export var forceEval: boolean;
    //Kurz
    CourseMeta.actModule; //aktualni modul
    CourseMeta.actCourseRoot; //course nebo test
    CourseMeta.actIsPublIndiv; //course nebo test bezi v 
    CourseMeta.actEx;
    CourseMeta.actExModel;
    //gramatika
    CourseMeta.actGrammar;
    CourseMeta.actGrammarEx;
    CourseMeta.actGrammarModule;
    CourseMeta.actGrammarExCount;
    //inline contrtols
    var oliReplace = 'olireplace';
    function processInlineControls(scriptId, completed) {
        if (!scriptId) {
            _.each($(oliReplace), function (el) { return $(el).remove(); });
            completed();
            return;
        }
        var txt = $('#' + scriptId).html();
        if (!txt) {
            debugger;
            throw scriptId;
        }
        //nacti page
        var root = JSON.parse(txt);
        var pg = CourseMeta.extractEx(root);
        var ex = new CourseMeta.exImpl();
        ex.onSetPage(pg, {});
        var pgCtrl = Course.finishCreatePage(ex);
        //replace <oli-replace> elements with controls 
        _.each($(oliReplace), function (el) {
            var ctrl = pg.tags[el.id];
            if (!ctrl) {
                $(el).remove();
                return;
            }
            var html = JsRenderTemplateEngine.render('c_gen', ctrl);
            var $html = $('<div>' + html + '</div>');
            $(el).replaceWith($html);
            ko.applyBindings(ctrl, $html[0]);
        });
        //init controls
        pg.callInitProcs(Course.initPhase.beforeRender, function () {
            pg.callInitProcs(Course.initPhase.afterRender, function () {
                pg.callInitProcs(Course.initPhase.afterRender2, function () {
                    ex.evaluator = pg;
                    ex.evaluator.acceptData(ex.done, ex.result);
                    if (completed)
                        completed();
                });
            });
        });
    }
    CourseMeta.processInlineControls = processInlineControls;
    $(function () { return document.createElement(oliReplace); });
    //jsonML decoding
    function jsonML_to_Tag(jml, metaObj, owner, propertyTags) {
        if (owner === void 0) { owner = null; }
        if (propertyTags === void 0) { propertyTags = null; }
        _.isArray = function (val) { return val instanceof Array; };
        if (!_.isArray(jml) || jml.length < 1 || !_.isString(jml[0]))
            throw 'invalid JsonML';
        var tagName = jml[0];
        var classMeta = metaObj.types[tagName];
        if (jml.length == 1)
            return createClass(metaObj, tagName, { _tg: tagName, _owner: owner });
        var startIdx = 1;
        var elem = null;
        if (jml.length > 1 && !_.isArray(jml[1]) && !_.isString(jml[1])) {
            startIdx = 2;
            elem = {};
            var jmlObj = jml[1];
            for (var p in jmlObj) {
                if (p == 'cdata' && classMeta.st & CourseModel.tgSt.cdata) {
                    elem.Items = [jmlObj[p]];
                    continue;
                } //cdata jako text
                var oldVal = jmlObj[p];
                var propStatus = CourseModel.getPropInfo(tagName, p, metaObj);
                var val;
                if (!propStatus) {
                    val = p == 'class' ? oldVal.split(' ') : oldVal;
                } //obycejna property
                else if (propStatus.enumType) {
                    if (_.isString(oldVal)) {
                        var s = oldVal;
                        var parts = s.split(' ');
                        val = 0;
                        _.each(parts, function (p) {
                            p = Utils.toCammelCase(p);
                            return val |= propStatus.enumType[p];
                        });
                    }
                    else
                        val = oldVal;
                }
                else if (propStatus.st & CourseModel.tgSt.isArray) {
                    if (!_.isString(oldVal))
                        throw 'something wrong'; //continue;
                    val = oldVal.split(' ');
                }
                else
                    val = oldVal; //else
                var propName = p != 'data-bind' ? Utils.toCammelCase(p) : p;
                elem[propName] = val;
            }
            elem._tg = tagName;
        }
        else
            elem = { _tg: tagName };
        //class create
        elem._owner = owner;
        elem = createClass(metaObj, tagName, elem);
        var childTypeToProp = {};
        if (classMeta)
            for (var p in classMeta.props) {
                var pr = classMeta.props[p];
                if (_.isEmpty(pr.childPropTypes))
                    continue;
                _.each(pr.childPropTypes.split('|'), function (tp) { return childTypeToProp[tp] = { name: p, prop: pr }; });
            }
        for (var i = startIdx; i < jml.length; i++) {
            if (!elem.Items)
                elem.Items = [];
            if (_.isString(jml[i])) {
                elem.Items.push(jml[i]);
                continue;
            } //string
            var childObj = (jsonML_to_Tag(jml[i], metaObj, elem, propertyTags)); //rekurze
            if (childObj.jsonMLParsed)
                childObj.jsonMLParsed();
            var childProp = childTypeToProp[childObj._tg];
            if (!childProp) {
                elem.Items.push(childObj);
                continue;
            } //ne => sub-tag v items
            var childName = Utils.toCammelCase(childProp.name);
            if ((childProp.prop.st & CourseModel.tgSt.isArray) == 0)
                elem[childName] = childObj;
            else if (!elem[childName])
                elem[childName] = [childObj];
            else
                elem[childName].push(childObj); //array property => dosad nebo obohat array
            //evidence tagu v property
            if (propertyTags)
                propertyTags.push(childObj);
        }
        if (elem.Items && elem.Items.length == 0)
            delete elem.Items;
        return elem;
    }
    CourseMeta.jsonML_to_Tag = jsonML_to_Tag;
    ;
    function createClass(meta, tg, def) {
        var cls = meta.classDir ? meta.classDir[tg] : null;
        if (!cls)
            return def;
        var res = new cls(def);
        return res;
    }
    function xmlEscape(str, res) {
        for (var i = 0; i < str.length; ++i) {
            var c = str[i];
            var code = c.charCodeAt(0);
            var s = reventities[c];
            if (s) {
                res.push("&" + s + ";");
            }
            else if (code >= 128) {
                res.push("&#" + code + ";");
            }
            else {
                res.push(c);
            }
        }
    }
    var reventities = (function () {
        var result = {};
        for (var key in entities)
            if (entities.hasOwnProperty(key))
                result[entities[key]] = key;
        return result;
    })();
    var entities = {
        "quot": '"',
        "amp": '&',
        "apos": "'",
        "lt": '<',
        "gt": '>'
    };
    function finishLoadedProduct(prod) {
        CourseMeta.actProduct = prod;
        prod.allNodes = {};
        extend(prod, CourseMeta.productImpl);
        CourseMeta.actCourseRoot = (prod.Items[0]); //kurz nebo test
        CourseMeta.actGrammar = prod.find(function (dt) { return isType(dt, CourseMeta.runtimeType.grammarRoot); }); //a jeho eventuelni gramatika
        //grammar
        if (CourseMeta.actGrammar) {
            var lastNode = null;
            CourseMeta.actGrammarExCount = 0;
            scan(CourseMeta.actGrammar, function (it) {
                extend(it, CourseMeta.dataImpl, CourseMeta.runtimeType.no);
                prod.allNodes[it.url] = it;
                it.type |= CourseMeta.runtimeType.grammar;
                it.each(function (t) { return t.parent = it; });
                if (isType(it, CourseMeta.runtimeType.ex)) {
                    extend(it, CourseMeta.grammEx, CourseMeta.runtimeType.ex);
                    var ge = it;
                    ge.idx = CourseMeta.actGrammarExCount++;
                    if (lastNode) {
                        lastNode.next = ge;
                        ge.prev = lastNode;
                    }
                    lastNode = ge;
                }
                if (isType(it, CourseMeta.runtimeType.mod))
                    extend(it, CourseMeta.modImpl, CourseMeta.runtimeType.mod);
            });
            extend(CourseMeta.actGrammar, CourseMeta.grammarRoot, CourseMeta.runtimeType.grammarRoot);
        }
        var uniqId = 0;
        //prvni pruchod
        scan(CourseMeta.actCourseRoot, function (it) {
            it.uniqId = uniqId++;
            prod.allNodes[it.url] = it;
            extend(it, CourseMeta.courseNode, CourseMeta.runtimeType.courseNode);
            it.each(function (t) { return t.parent = it; });
            if (isType(it, CourseMeta.runtimeType.ex) && cfg.forceEval)
                it.designForceEval = true; //pro design time - ukaz se vyhodnoceny na 100%
        });
        //druhy pruchod
        scan(CourseMeta.actCourseRoot, function (it) {
            if (isType(it, CourseMeta.runtimeType.ex))
                extend(it, CourseMeta.exImpl);
            else if (isType(it, CourseMeta.runtimeType.multiTask))
                extend(it, CourseMeta.multiTaskImpl);
            else if (isType(it, CourseMeta.runtimeType.product))
                extend(it, CourseMeta.productImpl);
            else if (isType(it, CourseMeta.runtimeType.taskCourse))
                extend(it, CourseMeta.courseImpl);
            else if (isType(it, CourseMeta.runtimeType.test))
                extend(it, testMe.testImpl);
            else if (isType(it, CourseMeta.runtimeType.multiTest))
                extend(it, testMe.multiTestImpl);
            else if (isType(it, CourseMeta.runtimeType.taskTestInCourse)) {
                it.type |= CourseMeta.runtimeType.dynamicTestModule;
                extend(it, CourseMeta.courseTestImpl, CourseMeta.runtimeType.mod);
            }
            else if (isType(it, CourseMeta.runtimeType.taskPretest))
                extend(it, CourseMeta.pretestImpl);
            else if (isType(it, CourseMeta.runtimeType.taskTestSkill)) {
                it.type |= CourseMeta.runtimeType.dynamicTestModule;
                extend(it, testMe.testSkillImpl, CourseMeta.runtimeType.mod);
            }
            else if (isType(it, CourseMeta.runtimeType.taskPretestTask)) {
                extend(it, CourseMeta.pretestTaskImpl, CourseMeta.runtimeType.mod);
                it.each(function (e) { return e.testMode = CSLocalize('3859695377c4444abce16f7af9f5d2ec', 'Pretest'); });
            }
            else if (isType(it, CourseMeta.runtimeType.mod))
                extend(it, CourseMeta.modImpl);
            //else if (isType(it, runtimeType.questionnaire)) extend(it, ex, runtimeType.ex);
        });
        //actCourseRoot: prepsani set x getUser
        if (!isType(CourseMeta.actCourseRoot, CourseMeta.runtimeType.test) && !isType(CourseMeta.actCourseRoot, CourseMeta.runtimeType.multiTest))
            extend(CourseMeta.actCourseRoot, CourseMeta.skipAbleRoot, CourseMeta.runtimeType.skipAbleRoot);
    }
    var lib;
    (function (lib) {
        //reakce na zmenu URL. Nacte se modul, cviceni a user data ke cviceni
        function onChangeUrl(prodUrl, persistence, nodeUrl, completed) {
            CourseMeta.foundGreenEx = null;
            if (_.isEmpty(prodUrl)) {
                completed(null);
                return;
            }
            adjustProduct(prodUrl, persistence, function () {
                if (CourseMeta.actNode && CourseMeta.actNode.url == nodeUrl) {
                    completed(isType(CourseMeta.actNode, CourseMeta.runtimeType.ex) ? CourseMeta.actNode : null);
                    return;
                } //zadna zmena aktualniho node
                var oldEx = CourseMeta.actEx;
                var oldMod = CourseMeta.actModule;
                var oldNode = CourseMeta.actNode;
                var oldGrammarEx = CourseMeta.actGrammarEx;
                var oldGrammarModule = CourseMeta.actGrammarModule;
                var doCompleted = function (loadedEx) {
                    if (CourseMeta.actEx && oldEx && CourseMeta.actEx != oldEx)
                        oldEx.onUnloadEx();
                    if (CourseMeta.actModule && oldMod && CourseMeta.actModule != oldMod)
                        oldMod.onUnloadMod();
                    if (CourseMeta.actGrammarEx && oldGrammarEx && CourseMeta.actGrammarEx != oldGrammarEx)
                        oldGrammarEx.onUnloadEx();
                    if (CourseMeta.actGrammarModule && oldGrammarModule && CourseMeta.actGrammarModule != oldGrammarModule)
                        oldGrammarModule.onUnloadMod();
                    completed(loadedEx);
                };
                CourseMeta.actNode = null;
                if (!_.isEmpty(nodeUrl))
                    CourseMeta.actNode = CourseMeta.actProduct.getNode(nodeUrl);
                if (!CourseMeta.actNode)
                    CourseMeta.actNode = CourseMeta.actCourseRoot; //novy actNode
                if (!CourseMeta.actNode) {
                    doCompleted(null);
                    return;
                } //zadny node
                if (isType(CourseMeta.actNode, CourseMeta.runtimeType.ex))
                    adjustEx(CourseMeta.actNode, doCompleted);
                else if (isType(CourseMeta.actNode, CourseMeta.runtimeType.mod))
                    adjustMod(CourseMeta.actNode, function (mod) { return doCompleted(null); });
                else
                    doCompleted(null);
            });
        }
        lib.onChangeUrl = onChangeUrl;
        function doRefresh(completed) {
            var compl = function () { if (completed)
                completed(); };
            if (isType(CourseMeta.actNode, CourseMeta.runtimeType.grammar)) {
                compl();
                return;
            }
            CourseMeta.greenArrowDict = {};
            //spocitej nodes udaje
            CourseMeta.actCourseRoot.refreshNumbers();
            //hotovo
            if (CourseMeta.actCourseRoot.done) {
                if (!treatBlueEx())
                    fillArrowInfo(info_courseFinished());
                compl();
                return;
            }
            if (CourseMeta.actCourseRoot.isSkiped) {
                fillArrowInfo(info_courseFinished());
                compl();
                return;
            }
            //najdi aktualni uzel
            findGreenExGlobal(CourseMeta.actCourseRoot, function (findRes) {
                CourseMeta.foundGreenEx = null;
                if (!findRes) {
                    compl();
                    return;
                }
                CourseMeta.foundGreenEx = findRes.grEx;
                //nezelene cviceni
                if (findRes.grEx != CourseMeta.actNode && treatBlueEx()) {
                    compl();
                    return;
                }
                //spocti green parent chain
                var nd = findRes.grEx;
                while (true) {
                    CourseMeta.greenArrowDict[nd.url] = true;
                    if (nd == CourseMeta.actCourseRoot)
                        break;
                    nd = (nd.parent);
                } //parent chain zeleneho cviceni
                //actNode neni v green parent chain => modra sipka
                if (!CourseMeta.greenArrowDict[CourseMeta.actNode.url]) {
                    fillArrowInfo(info_continue());
                    compl();
                    return;
                }
                //jiny task multitasku - prejdi pres home
                if (changeTaskInMultitask(CourseMeta.actNode, findRes.grEx))
                    findRes.info = new CourseMeta.greenArrowInfo(CSLocalize('e64fb875261a4c5e849a9952ecc4ae63', 'Continue'), false, 'success', 'hand-o-right', function () { return CourseMeta.gui.gotoData(null); });
                //muze nastat?
                if (!findRes.info)
                    return;
                fillArrowInfo(findRes.info);
                compl();
            });
        }
        lib.doRefresh = doRefresh;
        //globalni funkce na nalezeni aktualniho (zeleneho) cviceni
        function findGreenExGlobal(nd, completed) {
            var findRes;
            var toExpand;
            findDeepNotSkiped(nd, function (n) {
                if (n.done || n.findParent(function (t) { return t.done; }) != null)
                    return false; //hleda se pouze v nehotovych a non skiped uzlech
                var md = n;
                if (md.getDynamic && md.getDynamic()) {
                    toExpand = n;
                    return true;
                } //uzel je potrena nejdrive expandovat => konec find
                var an = n;
                if (an.findGreenEx && !!(findRes = an.findGreenEx())) {
                    return true; //uzel ma vlastni findGreenEx a ten vrati zelene cviceni
                }
                return false; //pokracuj dal
            });
            if (findRes) {
                completed(findRes);
                return;
            } //nalezeno cviceni
            if (toExpand) {
                toExpand.expandDynamic(); /*kdy se pouziva???*/
                lib.saveProduct(function () { return findGreenExGlobal(toExpand, completed); });
                return;
            } //nalezen uzel k expanzi => rekurze
            completed(null); //nenalezeno nic
        }
        function findProduct(productId) {
            var res = _.find(CourseMeta.allProductList, function (prod) { return prod.url == productId; });
            if (!res) {
                _.find(Login.myData.Companies, function (c) {
                    res = _.find(c.companyProducts, function (p) { return p.url == productId; });
                    return !!res;
                });
            }
            return res;
        }
        lib.findProduct = findProduct;
        function isTest(prod) {
            return prod && CourseMeta.isType(prod, CourseMeta.runtimeType.test);
        }
        lib.isTest = isTest;
        function keyTitle(prod, Days) {
            return prod.title + ' / ' + (CourseMeta.lib.isTest(prod) ? 'test' : 'days: ' + Days.toString());
        }
        lib.keyTitle = keyTitle;
        function productLineTxt(productId) {
            return LowUtils.EnumToString(LMComLib.LineIds, findProduct(productId).line);
        }
        lib.productLineTxt = productLineTxt;
        //zajisti existenci produktu
        function adjustProduct(prodUrl, persistence, completed, lmcomUserId) {
            if (lmcomUserId === void 0) { lmcomUserId = 0; }
            if (!lmcomUserId)
                lmcomUserId = schools.LMComUserId();
            if (CourseMeta.actProduct && CourseMeta.actProduct.url == prodUrl && CourseMeta.actProductLmcomId == lmcomUserId && CourseMeta.actProductPersistence == persistence) {
                completed(false);
                return;
            }
            if (CourseMeta.actProduct)
                CourseMeta.actProduct.unloadActProduct();
            loadLocalizedProductAndInstrs(prodUrl, function (prod) {
                CourseMeta.actProductPersistence = persistence;
                actPersistence().loadShortUserData(lmcomUserId, CourseMeta.actCompanyId, prodUrl, function (data) {
                    CourseMeta.actProductLmcomId = lmcomUserId;
                    if (data)
                        for (var p in data)
                            try {
                                CourseMeta.actProduct.getNode(p).setUserData(data[p]);
                            }
                            catch (msg) { } //dato nemusi existovat v pripade zmeny struktury kurzu
                    completed(true);
                });
            });
        }
        lib.adjustProduct = adjustProduct;
        //zajisti existenci modulu (= lokalizace a slovnik)
        function adjustMod(nd, completed) {
            var actm = nd.findParent(function (n) { return isType(n, CourseMeta.runtimeType.mod); });
            if (actm == null) {
                completed(null);
                return;
            }
            var isGramm = isType(actm, CourseMeta.runtimeType.grammar);
            if ((isGramm && actm == CourseMeta.actGrammarModule) || (!isGramm && actm == CourseMeta.actModule)) {
                completed(actm);
                return;
            } //zadna zmena modulu
            if (isGramm)
                CourseMeta.actGrammarModule = actm;
            else
                CourseMeta.actModule = actm;
            load(urlStripLast(actm.url) + '.' + Trados.actLangStr, function (locDict) {
                if (!locDict)
                    locDict = { loc: {}, dict: null };
                actm.loc = locDict.loc;
                actm.dict = locDict.dict ? RJSON.unpack(locDict.dict) : null;
                actm.expandDynamic(); /*kdy se pouziva???*/
                lib.saveProduct(function () { return completed(actm); });
            });
        }
        lib.adjustMod = adjustMod;
        //zajisti existenci cviceni (= modul)
        function adjustEx(ex, completed, lmcomUserId) {
            if (lmcomUserId === void 0) { lmcomUserId = 0; }
            adjustMod(ex, function (mod) {
                if (mod == null)
                    throw 'Missing module for exercise';
                var isGramm = isType(ex, CourseMeta.runtimeType.grammar);
                if (isGramm)
                    CourseMeta.actGrammarEx = ex;
                else
                    CourseMeta.actEx = ex;
                if (ex.page) {
                    completed(ex);
                    return;
                }
                load(ex.url, function (pgJsonML) {
                    var pg = extractEx(pgJsonML);
                    Course.localize(pg, function (s) { return localizeString(pg.url, s, (isGramm ? CourseMeta.actGrammarModule : CourseMeta.actModule).loc); });
                    if (isGramm) {
                        ex.onSetPage(pg, null);
                        completed(ex);
                    }
                    else
                        actPersistence().loadUserData(lmcomUserId == 0 ? schools.LMComUserId() : lmcomUserId, CourseMeta.actCompanyId, CourseMeta.actProduct.url, ex.url, function (exData) {
                            if (!exData)
                                exData = {};
                            ex.onSetPage(pg, exData);
                            completed(ex);
                        });
                });
            });
        }
        lib.adjustEx = adjustEx;
        //zajisti existenci adresare vsech produktu
        function adjustAllProductList(completed) {
            if (CourseMeta.allProductList) {
                completed();
                return;
            }
            load(urlStripLast(cfg.dataBatchUrl ? cfg.dataBatchUrl : '/siteroot/'), function (obj) { CourseMeta.allProductList = obj.Items; if (Login.finishMyData)
                Login.finishMyData(); completed(); });
        }
        lib.adjustAllProductList = adjustAllProductList;
        //zajisteni existence instrukci
        //export function adjustInstr(completed: () => void) {
        //  completed(); return;
        //  //if (instructions /*&& rootGrammar != null*/) { completed(); return; }
        //  //var pgUrl = '../data/instr/std/ex.js'; var locUrl = '../data/instr/std.' + Trados.actLangStr + '.js';
        //  //loadFiles([pgUrl, locUrl], ress => {
        //  //  instructions = {};
        //  //  if (!ress[0]) { completed(); return; }
        //  //  var pg = extractEx(<Array<any>>(jsonParse(ress[0]))); if (pg == null) throw 'missing instr' + pgUrl;
        //  //  pg.Items = _.filter(pg.Items, it => !_.isString(it));
        //  //  var loc: locDict = <locDict>jsonParse(ress[1]);
        //  //  Course.localize(pg, s => localizeString(pg.url, s, loc ? loc.loc : null));
        //  //  _.each(pg.Items, it => instructions[it.id.toLowerCase()] = JsRenderTemplateEngine.render("c_gen", it));
        //  //  completed();
        //  //});
        //}
        function finishHtmlDOM() {
            //Uprav content
            var cnt = $('.content-place');
            //anchory
            _.each(cnt.find("a"), function (a) {
                var href = $(a).attr('href');
                if (_.isEmpty(href))
                    return;
                if (href.match(/^(\/?\w)+$/)) {
                    $(a).attr('href', '#');
                    a.onclick = function (ev) { return gotoHref(ev, href); };
                }
            });
            //images
            //_.each(cnt.find("img"), (img: HTMLImageElement) => {
            //  var src = $(img).attr('src'); if (_.isEmpty(src)) return;
            //  src = Utils.fullUrl(src) ? src : Pager.basicDir + Utils.combineUrl(CourseMeta.actNode ? CourseMeta.actNode.url : null, src);
            //  $(img).attr('src', src);
            //});
            //help
            //doc.finishHtmlDOM();
        }
        lib.finishHtmlDOM = finishHtmlDOM;
        function info_continue() { return new CourseMeta.greenArrowInfo(CSLocalize('2882c6a2ef6343089ae90c898cac63f6', 'Continue'), false, "info", "reply", function () { return CourseMeta.gui.gotoData(null); }); }
        lib.info_continue = info_continue;
        function info_courseFinished() { return new CourseMeta.greenArrowInfo(CSLocalize('e06a4208d7c84c8ba97c1a700f00046c', 'Course completed!'), CourseMeta.actNode == CourseMeta.actCourseRoot, "info", "thumbs-up", CourseMeta.actNode == CourseMeta.actCourseRoot ? $.noop : function () { return CourseMeta.gui.gotoData(null); }); }
        lib.info_courseFinished = info_courseFinished;
        //vykresleni naladovaneho cviceni
        function displayEx(loadedEx, beforeUpdate, afterUpdate) {
            //TODO EVAL
            var pgCtrl = CourseMeta.actExPageControl = Course.finishCreatePage(loadedEx);
            CourseMeta.gui.exerciseHtml = function () { return JsRenderTemplateEngine.render("c_gen", loadedEx.page); };
            CourseMeta.gui.exerciseCls = function () { return loadedEx.page.isOldEa ? "ea" : "new-ea"; };
            pgCtrl.callInitProcs(Course.initPhase.beforeRender, function () {
                //if (!pgCtrl.isOldEa) pgCtrl.isPassive = _.all(pgCtrl.items, it => !it.isEval()); //pasivni cviceni ma vsechna isEval=false
                //pgCtrl.sound = new Course.pageSound(pgCtrl);
                if (beforeUpdate)
                    beforeUpdate(loadedEx);
                oldEAInitialization = null;
                Pager.renderHtmlEx(true, loadedEx.page.bodyStyle); //HTML rendering (kod, provedeny normalne za onUpdate)
                pgCtrl.callInitProcs(Course.initPhase.afterRender, function () {
                    if (!oldEAInitialization)
                        oldEAInitialization = function (completed) { return completed(); };
                    oldEAInitialization(function () {
                        pgCtrl.callInitProcs(Course.initPhase.afterRender2, function () {
                            loadedEx.evaluator = loadedEx.page.isOldEa ? new EA.oldToNewScoreProvider($evalRoot()) : pgCtrl;
                            loadedEx.evaluator.acceptData(loadedEx.done, loadedEx.result);
                            loadedEx.setStartTime();
                            //*** design mode => dosad do cviceni spravne hodnoty a vyhodnot jej
                            if (loadedEx.designForceEval) {
                                loadedEx.evaluator.acceptData(true, loadedEx.result);
                                if (loadedEx.evaluate()) {
                                    lib.saveProduct(function () {
                                        if (CourseMeta.actCourseRoot) {
                                            CourseMeta.actCourseRoot.refreshNumbers();
                                            var inf = loadedEx.findGreenEx().info;
                                            inf.css = CourseMeta.greenCss();
                                            lib.fillArrowInfo(inf);
                                            CourseMeta.refreshExerciseBar(loadedEx);
                                        }
                                    });
                                }
                                loadedEx.designForceEval = false;
                            }
                            if (afterUpdate)
                                afterUpdate(loadedEx);
                            //vse OK => display content
                            Pager.renderHtmlEx(false);
                            Pager.callLoaded();
                        });
                    });
                });
            });
        }
        lib.displayEx = displayEx;
        function actPersistence() { return CourseMeta.actProductPersistence == schools.memoryPersistId ? persistMemory.persistCourse : CourseMeta.persist; }
        lib.actPersistence = actPersistence;
        //save user dat
        function saveProduct(completed, lmcomUserId) {
            if (lmcomUserId === void 0) { lmcomUserId = 0; }
            if (!CourseMeta.actProduct) {
                completed();
                return;
            }
            var res = [];
            //var persistObj = actCourseRoot.
            scan(CourseMeta.actCourseRoot, function (dt) { if (!dt.userPending)
                return; dt.getUserData(function (shrt, lng, flag, key) { return res.push([key ? key : dt.url, shrt, lng, flag ? flag.toString() : '0']); }); dt.userPending = false; });
            if (res.length > 0) {
                Logger.trace_course('saveProduct lib, items=' + _.map(res, function (r) { return r[0]; }).join('; '));
                actPersistence().saveUserData(!lmcomUserId ? schools.LMComUserId() : lmcomUserId, CourseMeta.actCompanyId, CourseMeta.actProduct.url, res, function () {
                    if (cfg.target == LMComLib.Targets.scorm) {
                        CourseMeta.actCourseRoot.refreshNumbers();
                        scorm.reportProgress(CourseMeta.actCourseRoot.elapsed, CourseMeta.actCourseRoot.done ? (CourseMeta.actCourseRoot.complNotPassiveCnt == 0 || CourseMeta.actCourseRoot.ms == 0 ? 100 : Math.round(CourseMeta.actCourseRoot.s / CourseMeta.actCourseRoot.ms /*/ actCourseRoot.complNotPassiveCnt*/)) : null);
                    }
                    completed();
                });
            }
            else
                completed(); //prazdny res, NOOP
        }
        lib.saveProduct = saveProduct;
        //osetreni nezeleneho cviceni
        function treatBlueEx() {
            if (!CourseMeta.actNode || !isType(CourseMeta.actNode, CourseMeta.runtimeType.ex))
                return false;
            var findRes = CourseMeta.actNode.findGreenEx();
            findRes.info.css = 'info';
            fillArrowInfo(findRes.info);
            return true;
        }
        //zmena tasku v multitasku (=> skok pres home)
        function changeTaskInMultitask(nd1, nd2) {
            if (!isType(CourseMeta.actCourseRoot, CourseMeta.runtimeType.multiTask))
                return false;
            var p1 = nd1.findParent(function (nd) { return _.any(CourseMeta.actCourseRoot.Items, function (it) { return it == nd; }); });
            var p2 = nd2.findParent(function (nd) { return _.any(CourseMeta.actCourseRoot.Items, function (it) { return it == nd; }); });
            return p1 && p2 && p1 != p2;
        }
        //nalezne prvni neprobrane cviceni
        function findGreenExLow(nd) { return findDeepNotSkiped(nd, function (n) { return isType(n, CourseMeta.runtimeType.ex) && !n.done; }); }
        lib.findGreenExLow = findGreenExLow;
        //informace pro zelenou sipku
        function fillInfo(title, disable, css, iconId, _greenClick) {
            CourseMeta.greenTitle(title);
            CourseMeta.greenIcon(Trados.isRtl && iconId == "hand-o-left" ? "hand-o-right" : iconId);
            CourseMeta.greenCss(!CourseMeta.actCourseRoot.done && lib.keepGreen ? 'success' : css);
            CourseMeta.greenDisabled(disable);
            CourseMeta.greenClick = _greenClick;
            lib.keepGreen = false;
        }
        lib.fillInfo = fillInfo;
        lib.keepGreen;
        function fillArrowInfo(info) { fillInfo(info.title, info.disable, info.css, info.iconId, info.greenClick); }
        lib.fillArrowInfo = fillArrowInfo;
    })(lib = CourseMeta.lib || (CourseMeta.lib = {}));
    var jsExt = '.js';
    var testModuleExercises = '@test_module_exercises';
    function setDate(dt1, dt2, min) {
        if (dt1 == 0)
            return dt2;
        if (dt2 == 0)
            return dt1;
        if (min)
            return dt2 > dt1 ? dt1 : dt2;
        else
            return dt2 < dt1 ? dt1 : dt2;
    }
    function addUserData(key, shrt, lng, data) { data.push([key, shrt, lng]); }
    CourseMeta.addUserData = addUserData;
    function isType(dt, tp) { return (dt.type & tp) == tp; }
    CourseMeta.isType = isType;
    function scan(dt, action, cond) {
        if (cond === void 0) { cond = null; }
        if (dt.Items)
            _.each(dt.Items, function (it) { return scan(it, action, cond); });
        if (!cond || cond(dt))
            action(dt);
    }
    CourseMeta.scan = scan;
    function scanParentFirst(dt, action, cond) {
        if (cond === void 0) { cond = null; }
        if (!cond || cond(dt))
            action(dt);
        if (dt.Items)
            _.each(dt.Items, function (it) { return scanParentFirst(it, action, cond); });
    }
    CourseMeta.scanParentFirst = scanParentFirst;
    function scanOfType(dt, type, action) {
        scan(dt, function (d) { return action(d); }, function (d) { return d.type == type; });
    }
    CourseMeta.scanOfType = scanOfType;
    function findDeep(dt, cond) {
        if (cond === void 0) { cond = null; }
        if (cond(dt))
            return dt;
        if (!dt.Items)
            return null;
        var res = null;
        return _.find(dt.Items, function (it) { return (res = findDeep(it, cond)) != null; }) ? res : null;
    }
    CourseMeta.findDeep = findDeep;
    function findDeepNotSkiped(dt, cond) {
        if (cond === void 0) { cond = null; }
        if (dt.isSkiped)
            return null;
        if (cond(dt))
            return dt;
        if (!dt.Items)
            return null;
        var res = null;
        return _.find(dt.Items, function (it) { return (res = findDeepNotSkiped(it, cond)) != null; }) ? res : null;
    }
    CourseMeta.findDeepNotSkiped = findDeepNotSkiped;
    function extend(d, t, tp) {
        if (tp === void 0) { tp = 0; }
        extendLow(d, t);
        d.type = d.type | tp;
    }
    function extendLow(d, t) { t = t.prototype; for (var p in t)
        d[p] = t[p]; d.constructor(); }
    CourseMeta.extendLow = extendLow;
    function localizeString(keyPrefix, data, loc) {
        if (_.isEmpty(data) || data.indexOf('{{') < 0)
            return data;
        if (!loc)
            loc = {};
        return data.replace(locEx, function (match) {
            var gm = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                gm[_i - 1] = arguments[_i];
            }
            var idVal = gm[0].split('|');
            var val = idVal.length < 2 ? null : idVal[1];
            var parts = keyPrefix ? keyPrefix.split('/') : [];
            parts.push(idVal[0]);
            var idx = 0;
            var res = '';
            var l = loc;
            while (idx < parts.length) {
                l = l[parts[idx]];
                if (!l) {
                    res = val;
                    break;
                }
                if (idx == parts.length - 1) {
                    res = l;
                    break;
                }
                idx++;
            }
            return Trados.locNormalize(res);
        });
    }
    CourseMeta.localizeString = localizeString;
    var locEx = /{{(.*?)}}/g;
    function extractEx(pgJsonML) {
        var tagsInProperties = [];
        var html = jsonML_to_Tag(pgJsonML, CourseModel.meta, null, tagsInProperties);
        var pg = html.Items[1];
        var head = html.Items[0];
        var headItems = head && head.Items ? head.Items : null;
        var tit;
        var bodyStyle;
        if (headItems) {
            var tit = _.find(headItems, function (it) { return it._tg == 'title'; });
            var bodyStyle = _.find(headItems, function (it) { return it._tg == 'style'; });
        }
        pg.title = tit && tit.Items && _.isString(tit.Items[0]) ? tit.Items[0] : '';
        pg.bodyStyle = bodyStyle && bodyStyle.Items && _.isString(bodyStyle.Items[0]) ? bodyStyle.Items[0] : '';
        pg.bodyStyle = pg.bodyStyle.replace(/\/\*.*\*\//, '');
        pg._tg = CourseModel.tbody; //hack. body ma jinak Type=body 
        if (!_.isEmpty(pg.seeAlsoStr)) {
            pg.seeAlso = _.map(pg.seeAlsoStr.split('#'), function (sa) {
                var parts = sa.split('|');
                var res = { url: parts[0], title: parts[1], type: 0 };
                return res;
            });
        }
        if (!_.isEmpty(pg.instrBody))
            pg.instrs = pg.instrBody.split('|');
        pg.propertyTags = tagsInProperties;
        return pg;
    }
    CourseMeta.extractEx = extractEx;
    //persist.readFiles muze byt nahrazeno JS soubory, ulozenymi  primo v HTML strance v <script type="text/inpagefiles" data-id="url"> scriptu.
    //json soubory jsou ulozeny ve strance jako <script type="text/inpagefiles" data-id="url">. Pouziva se pro Author, v d:\LMCom\rew\NewLMComModel\Design\CourseMeta.cs, getServerScript 
    function loadFiles(urls, completed) {
        if (!inPageFiles) {
            inPageFiles = {};
            $('script[type="text/inpagefiles"]').each(function (idx, el) {
                var sc = $(el);
                inPageFiles[sc.attr('data-id').toLowerCase()] = sc.html().replace(/^\s*/, '');
                //inPageAny = true; //existuje-li jediny type="text/inpagefiles", pak se vsechny JS berou z inPageFiles
            });
        }
        //priorita - nacti soubor z script[type="text/inpagefiles"]
        var values = _.map(urls, function (url) { return inPageFiles[url.substr(2).toLowerCase()]; }); //url zacina ../
        var fromScript = _.zip(urls, values);
        //nenactene ze scriptu => nacti z webu
        var webUrls = _.map(_.filter(fromScript, function (uv) { return !uv[1]; }), function (uv) { return uv[0]; }); //nenactene ze scriptu
        if (webUrls.length > 0) {
            CourseMeta.persist.readFiles(webUrls, function (webValues) {
                //merge fromScript a fromWeb
                var fromWeb = _.zip(webUrls, webValues);
                var fromWebIdx = 0;
                _.each(fromScript, function (kv) {
                    if (kv[1])
                        return;
                    kv[1] = fromWeb[fromWebIdx][1];
                    fromWebIdx++;
                });
                //vrat values z merged
                completed(_.map(fromScript, function (kv) { return kv[1]; }));
            });
        }
        else
            completed(values); //vse nactene ze scriptu
    }
    CourseMeta.loadFiles = loadFiles;
    var inPageFiles; //var inPageAny = false;
    function loadResponseScript(serverAndUrl, completed) {
        $.ajax(serverAndUrl, {
            async: true,
            type: 'GET',
            dataType: 'text',
            contentType: "text/plain; charset=UTF-8"
        }).done(function (txt) {
            var parts = txt.split('%#%#[[[]]]');
            for (var i = 0; i < parts.length; i += 2)
                inPageFiles[parts[i]] = parts[i + 1];
            completed(true);
        }).fail(function () {
            debugger;
            completed(false);
        });
    }
    CourseMeta.loadResponseScript = loadResponseScript;
    function load(href, completed) {
        loadFiles(['..' + href + jsExt], function (ress) { return completed(jsonParse(ress[0])); });
    }
    CourseMeta.load = load;
    function urlStripLast(url) {
        url = url.split('|')[0]; //odstran z productUrl cast |<archiveId>
        return url.charAt(url.length - 1) == '/' ? url.substr(0, url.length - 1) : url;
    }
    function loadLocalizedProductAndInstrs(url, completed) {
        var href = urlStripLast(url);
        href = '..' + (href[0] == '/' ? '' : '/') + href;
        loadFiles([href + jsExt, href + '.' + Trados.actLangStr + jsExt, href + '_instrs.js'], function (ress) {
            //sitemap
            var prod = (jsonParse(ress[0]));
            if (!prod)
                throw 'error loading ' + href;
            finishLoadedProduct(prod);
            prod.url = url;
            //a jeji lokalizace
            var loc = jsonParse(ress[1]);
            if (!loc)
                loc = {};
            scan(prod, function (it) { if (it.localize)
                it.localize(function (s) { return localizeString(it.url, s, loc); }); });
            //instrukce
            var instrs = jsonParse(ress[2]);
            CourseMeta.instructions = {};
            if (instrs)
                for (var p in instrs)
                    finishInstr(p, instrs[p], loc);
            completed(prod);
        });
    }
    function finishInstr(url, jsonML, loc) {
        var pg = extractEx((jsonML));
        if (pg == null) {
            debugger;
            throw 'missing instr';
        }
        pg.Items = _.filter(pg.Items, function (it) { return !_.isString(it); });
        Course.localize(pg, function (s) { return localizeString(pg.url, s, loc); });
        Course.scanEx(pg, function (tg) { if (!_.isString(tg))
            delete tg.id; }); //instrukce nemohou mit tag.id, protoze se ID tlucou s ID ze cviceni
        CourseMeta.instructions[url] = JsRenderTemplateEngine.render("c_genitems", pg);
    }
    CourseMeta.finishInstr = finishInstr;
    function jsonParse(str) {
        if (!str || str.length < 1)
            return null;
        var isRjson = str.substr(0, 1) == rjsonSign;
        if (isRjson)
            str = str.substr(1);
        var obj = JSON.parse(str);
        if (isRjson)
            obj = RJSON.unpack(obj);
        return obj;
    }
    CourseMeta.jsonParse = jsonParse;
    //function loadDataAndLoc(href: string, completed: (mod, loc) => void) {
    //  href = '..' + (href[0] == '/' ? '' : '/') + href;
    //  loadFiles([href + jsExt, href + '.' + Trados.actLangStr + jsExt], ress => {
    //    var pages = jsonParse(ress[0]); if (!pages) throw 'error loading ' + href;
    //    var locDict = jsonParse(ress[1]);
    //    completed(pages, locDict);
    //  });
    //}
    var rjsonSign = "@";
    $.views.helpers({
        productLineTxt: lib.productLineTxt,
        productLineTxtLower: function (productId) { return lib.productLineTxt(productId).toLowerCase(); },
    });
})(CourseMeta || (CourseMeta = {}));
//module help {
//  export function click() {
//    //return false;
//  }
//  export function finishHtmlDOM() {
//    //_.each($('.ctx-help'), el => {
//    //  var hlp = $('<div class="help-btn fa"></div>');
//    //  $(el).prepend(hlp[0]);
//    //  hlp.click(() => help.click());
//    //});
//  }
//} 

var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var CourseModel;
(function (CourseModel) {
    function find(dt, cond) {
        if (cond === void 0) { cond = null; }
        if (cond(dt))
            return dt;
        if (!dt.Items)
            return null;
        var res = null;
        return _.find(dt.Items, function (it) { return (res = find(it, cond)) != null; }) ? res : null;
    }
    CourseModel.find = find;
})(CourseModel || (CourseModel = {}));
var CourseMeta;
(function (CourseMeta) {
    function finishedAndLocked() { return CourseMeta.actCourseRoot.done && CourseMeta.previewMode; }
    CourseMeta.finishedAndLocked = finishedAndLocked;
    CourseMeta.previewMode;
    var dataImpl = (function () {
        function dataImpl() {
        }
        //funkce a akce
        dataImpl.prototype.localize = function (locProc) { this.title = locProc(this.title); };
        dataImpl.prototype.each = function (action) { if (this.Items)
            _.each(this.Items, function (it) { return action(it); }); };
        dataImpl.prototype.find = function (cond) { return (_.find(this.Items, function (it) { return cond(it); })); };
        dataImpl.prototype.findParent = function (cond) {
            var c = this;
            while (c != null) {
                if (cond(c))
                    return c;
                c = c.parent;
            }
            return null;
        };
        dataImpl.prototype.hrefCompl = function (companyId, productUrl, persistence) {
            var tp;
            if (CourseMeta.isType(this, CourseMeta.runtimeType.grammar))
                tp = CourseMeta.isType(this, CourseMeta.runtimeType.ex) ? schools.tGrammPage : schools.tGrammFolder;
            else if (CourseMeta.isType(this, CourseMeta.runtimeType.taskPretest))
                tp = schools.tCoursePretest;
            else
                tp = CourseMeta.isType(this, CourseMeta.runtimeType.ex) ? schools.tEx : schools.tCourseMeta;
            return schools.getHash(tp, companyId, productUrl, persistence, this.url);
        };
        dataImpl.prototype.href = function () {
            return this.hrefCompl(CourseMeta.actCompanyId, CourseMeta.actProduct.url, CourseMeta.actProductPersistence);
        };
        dataImpl.prototype.iconId = function () {
            if (this == CourseMeta.actCourseRoot)
                return "book";
            else if (CourseMeta.isType(this, CourseMeta.runtimeType.ex))
                return CourseMeta.isType(this, CourseMeta.runtimeType.grammar) ? "file-o" : "edit";
            else
                return "folder-open";
        };
        return dataImpl;
    })();
    CourseMeta.dataImpl = dataImpl;
    var productImpl = (function (_super) {
        __extends(productImpl, _super);
        function productImpl() {
            _super.apply(this, arguments);
        }
        productImpl.prototype.getNode = function (url) { return (this.allNodes[url]); };
        productImpl.prototype.unloadActProduct = function () {
            if (CourseMeta.actEx)
                CourseMeta.actEx.onUnloadEx();
            if (CourseMeta.actModule)
                CourseMeta.actModule.onUnloadMod();
            CourseMeta.actNode = null;
            CourseMeta.actProduct = null;
            CourseMeta.actGrammar = null;
            CourseMeta.actCourseRoot = null;
            CourseMeta.actModule = null;
            CourseMeta.actEx = null;
        };
        return productImpl;
    })(dataImpl);
    CourseMeta.productImpl = productImpl;
    var grammarRoot = (function (_super) {
        __extends(grammarRoot, _super);
        function grammarRoot() {
            _super.apply(this, arguments);
        }
        return grammarRoot;
    })(dataImpl);
    CourseMeta.grammarRoot = grammarRoot;
    //vsechny uzlu kurzu (mimo vlastniho kurzu)
    var courseNode = (function (_super) {
        __extends(courseNode, _super);
        function courseNode() {
            _super.apply(this, arguments);
        }
        //********** GUI
        courseNode.prototype.getScoreInit = function () {
            return (this.getScoreValue = this.complNotPassiveCnt == 0 || !this.ms ? -1 : Math.round(this.s / this.ms * 100));
        };
        courseNode.prototype.progress = function () { return this.exCount - this.skipedCount == 0 ? 0 : Math.round(100 * (this.complNotPassiveCnt + this.complPassiveCnt - this.skipedCount) / (this.exCount - this.skipedCount)); };
        courseNode.prototype.statusText = function () {
            var pr = this.progress();
            return (pr > 0 ? CSLocalize('f124b261dbf9482d9c92e0c1b029f98a', 'Progress') + ' ' + pr.toString() + '%, ' : '') + this.statusStr();
        };
        courseNode.prototype.statusStr = function () {
            if (this.isSkiped)
                return CSLocalize('d96c8f11b16d4c9aa91ac8d8142267fa', 'skipped');
            return this.done ?
                CSLocalize('01fbc5f8a77c4e2491a9ed3ede74e966', 'completed') :
                (CourseMeta.greenArrowDict[this.url] ? CSLocalize('1fe40e2548924e519e9b226d4ced7bce', 'run') : CSLocalize('b7ed3c7fc67640ceb98417153f731d63', 'browse'));
        };
        courseNode.prototype.labelCls = function () { return CourseMeta.greenArrowDict[this.url] ? 'warning' : 'default'; };
        courseNode.prototype.btnIconId = function () { return CourseMeta.greenArrowDict[this.url] ? 'play' : null; };
        courseNode.prototype.iconId = function () { return 'folder-open'; };
        courseNode.prototype.contentCss = function () { var res = ''; if (_.isEmpty(this.btnIconId()))
            res += 'btn-icon-hidden'; if (this.isSkiped)
            res += ' disabled'; return res; };
        //disabledCss(): string { return this.isSkiped ? 'disabled' : ''; }
        courseNode.prototype.notRunnableMsg = function () { return null; };
        courseNode.prototype.showProgress = function () { return this.complNotPassiveCnt > 0; };
        //menu(): schoolHome.menuItem[] { return []; }
        //btnColor(): string { return }
        courseNode.prototype.btnClick = function () { CourseMeta.gui.gotoData(this); };
        courseNode.prototype.getSkiped = function () {
            var skiped = this.getSkipedTable(false);
            if (!skiped)
                return false;
            var nd = this;
            if (!skiped.allSkiped)
                return false;
            while (nd != null) {
                if (skiped.allSkiped[this.url])
                    return true;
                nd = nd.parent;
            }
            return false;
        };
        courseNode.prototype.setSkiped = function (value, withSave) {
            if (value == this.isSkiped)
                return;
            var skiped = this.getSkipedTable(true);
            if (!skiped)
                return;
            CourseMeta.scan(this, function (d) { delete skiped.allSkiped[d.url]; d.isSkiped = false; });
            if (value)
                skiped.allSkiped[this.url] = true;
            if (withSave)
                CourseMeta.lib.saveProduct(CourseMeta.gui.onReload);
        };
        courseNode.prototype.getSkipedTable = function (willModify) {
            var skRoot = this.findParent(function (it) { return CourseMeta.isType(it, CourseMeta.runtimeType.skipAbleRoot); });
            if (!skRoot)
                return null; //throw 'missin skiped root';
            if (willModify) {
                if (!skRoot.allSkiped)
                    skRoot.allSkiped = {};
                skRoot.userPending = true;
            }
            return skRoot;
        };
        courseNode.prototype.refreshNumbers = function (exCountOnly) {
            if (exCountOnly === void 0) { exCountOnly = false; }
            courseNode.doRefreshNumbers(this, exCountOnly);
        };
        courseNode.doRefreshNumbers = function (th, exCountOnly) {
            if (exCountOnly === void 0) { exCountOnly = false; }
            th.complPassiveCnt = th.complNotPassiveCnt = th.s = th.beg = th.end = th.elapsed = th.skipedCount = th.exCount = th.flag = 0;
            th.done = th.isSkiped = false;
            var isTest = CourseMeta.lib.isTest(CourseMeta.actProduct);
            if (!isTest)
                th.ms = 0;
            //skiped => done
            if (th.getSkiped()) {
                th.exCount = 0;
                th.each(function (it) { it.refreshNumbers(true); th.exCount += it.exCount; });
                th.skipedCount = th.exCount;
                th.isSkiped = true;
                return;
            }
            //agregate childs
            _.each(th.Items, function (it) {
                it.refreshNumbers(exCountOnly); //refresh childs
                th.exCount += it.exCount;
                if (exCountOnly)
                    return;
                th.skipedCount += it.skipedCount;
                if (it.getSkiped())
                    return;
                th.complPassiveCnt += it.complPassiveCnt;
                th.complNotPassiveCnt += it.complNotPassiveCnt;
                th.elapsed += it.elapsed;
                //if (it.ms >= 0) th.ms += it.ms; //zaporne score => nevyhodnotitelne
                if (!it.s)
                    it.s = 0;
                //29.4.2015, osetreni starych cviceni. Pro nadrazene uzly jsou spravne tehdy, kdyz je score vetsi nez 0.75%
                if (CourseMeta.isType(it, CourseMeta.runtimeType.ex)) {
                    if (it.complNotPassiveCnt == 1) {
                        //var e = <exImpl>it;
                        //if (e.isOldEa)
                        //  th.s += e.isOldEaPassive ? 0 : (e.ms && e.s / e.ms > 0.75 ? 1 : 0);
                        //else
                        th.s += it.s;
                        if (!isTest)
                            th.ms += it.ms;
                    }
                }
                else {
                    th.s += it.s;
                    if (!isTest)
                        th.ms += it.ms;
                }
                th.flag |= it.flag;
                th.beg = setDate(th.beg, it.beg, true);
                th.end = setDate(th.end, it.end, false);
            });
            if (exCountOnly)
                return;
            if (th.skipedCount > 0 && th.skipedCount == th.exCount) {
                th.isSkiped = true;
                return;
            } //all child skiped => return
            if (th.complNotPassiveCnt + th.complPassiveCnt + th.skipedCount == th.exCount)
                th.done = true;
            //if (th.complNotPassiveCnt == 0 && th.complPassiveCnt > 0) th.score = -1;
            //else if (th.complNotPassiveCnt > 0) th.score = Math.round(th.score / th.complNotPassiveCnt);
        };
        courseNode.prototype.availableActions = function () {
            if (this.isSkiped)
                return CourseMeta.NodeAction.createActions(this, CourseMeta.nodeAction.unskip);
            return this.done ?
                CourseMeta.NodeAction.createActions(this, CourseMeta.nodeAction.browse, this.complNotPassiveCnt + this.complPassiveCnt > 0 ? CourseMeta.nodeAction.reset : CourseMeta.nodeAction.no, CourseMeta.nodeAction.skip) :
                CourseMeta.NodeAction.createActions(this, CourseMeta.greenArrowDict[this.url] ? CourseMeta.nodeAction.run : CourseMeta.nodeAction.browse, this.complNotPassiveCnt + this.complPassiveCnt > 0 ? CourseMeta.nodeAction.reset : CourseMeta.nodeAction.no, CourseMeta.nodeAction.skip);
        };
        //dostupne akce nad node 
        courseNode.prototype.onAction = function (type) {
            switch (type) {
                case CourseMeta.nodeAction.browse:
                case CourseMeta.nodeAction.run:
                    CourseMeta.gui.gotoData(this);
                    break;
                case CourseMeta.nodeAction.skip:
                    this.setSkiped(true, true);
                    break;
                case CourseMeta.nodeAction.unskip:
                    this.setSkiped(false, true);
                    break;
                case CourseMeta.nodeAction.reset:
                    //majdi all a resetable urls
                    var resetableUrls = [];
                    var allUrls = [];
                    CourseMeta.scan(this, function (it) { allUrls.push(it.url); if (!it.doReset)
                        return; if (it.doReset())
                        resetableUrls.push(it.url); });
                    //vlastni reset funkce
                    var resetProc = function () { return CourseMeta.lib.actPersistence().resetExs(schools.LMComUserId(), CourseMeta.actCompanyId, CourseMeta.actProduct.url, resetableUrls, CourseMeta.gui.onReload); };
                    //vyrad je ze skiped a volej resetProc
                    var skiped = this.getSkipedTable(false);
                    if (skiped.allSkiped) {
                        var changed = false;
                        _.each(allUrls, function (u) { delete skiped.allSkiped[u]; changed = true; });
                        if (changed) {
                            skiped.userPending = true;
                            CourseMeta.lib.saveProduct(resetProc);
                        }
                        else
                            resetProc();
                    }
                    else
                        resetProc();
                    break;
                case CourseMeta.nodeAction.runTestAgain:
                    break;
                case CourseMeta.nodeAction.cancelTestSkip:
                    break;
            }
        };
        courseNode.prototype.setUserData = function (data) { };
        courseNode.prototype.getUserData = function (setData) { };
        courseNode.prototype.expandDynamic = function (completed) { if (completed)
            completed(); };
        return courseNode;
    })(dataImpl);
    CourseMeta.courseNode = courseNode;
    var skipAbleRoot = (function (_super) {
        __extends(skipAbleRoot, _super);
        function skipAbleRoot() {
            _super.apply(this, arguments);
        }
        skipAbleRoot.prototype.setUserData = function (data) {
            this.allSkiped = data;
            if (!this.allSkiped)
                this.allSkiped = {};
        };
        skipAbleRoot.prototype.getUserData = function (setData) {
            setData(JSON.stringify(this.allSkiped), null, CourseModel.CourseDataFlag.skipAbleRoot, null);
        };
        skipAbleRoot.prototype.doReset = function () { if (!this.allSkiped)
            return false; delete this.allSkiped; return true; };
        return skipAbleRoot;
    })(courseNode);
    CourseMeta.skipAbleRoot = skipAbleRoot;
    var multiTaskImpl = (function (_super) {
        __extends(multiTaskImpl, _super);
        function multiTaskImpl() {
            _super.apply(this, arguments);
        }
        multiTaskImpl.prototype.iconId = function () { return 'th'; };
        return multiTaskImpl;
    })(courseNode);
    CourseMeta.multiTaskImpl = multiTaskImpl;
    var modImpl = (function (_super) {
        __extends(modImpl, _super);
        function modImpl() {
            _super.apply(this, arguments);
        }
        modImpl.prototype.iconId = function () { return 'book'; };
        modImpl.prototype.setUserData = function (data) {
            this.adjustSitemap(data);
        };
        modImpl.prototype.adjustSitemap = function (urls) {
            var _this = this;
            this.oldItems = this.Items;
            var exDir = {};
            CourseMeta.scan(this, function (e) { if (!CourseMeta.isType(e, CourseMeta.runtimeType.ex))
                return; exDir[e.url] = e; });
            this.Items = _.map(urls, function (url) { var e = exDir[url]; e.parent = _this; CourseMeta.actProduct.allNodes[e.url] = e; return e; });
            this.ms = 0;
            this.each(function (e) {
                //if (e.isOldEa)
                //  //this.ms += e.isOldEaPassive ? 0 : 1;
                //  throw 'oldEA exercise cannot be in test'; //pz 30.4.2015
                //else
                _this.ms += e.ms;
                e.testMode = CSLocalize('b8601c3b0385401b912f5f104b8d728e', 'Test');
            });
        };
        modImpl.prototype.getUserData = function (setData) {
            setData(JSON.stringify(_.map(this.Items, function (it) { return it.url; })), null, CourseModel.CourseDataFlag.modImpl, null);
        };
        modImpl.prototype.onUnloadMod = function () { this.dict = null; this.loc = null; };
        modImpl.prototype.doReset = function () { if (!this.oldItems)
            return false; this.Items = this.oldItems; delete this.oldItems; return true; };
        modImpl.prototype.expandDynamic = function () {
            if (this.Items == null)
                return false;
            var taskGroups = _.filter(this.Items, function (it) { return CourseMeta.isType(it, CourseMeta.runtimeType.testTaskGroup); });
            if (taskGroups.length != this.Items.length)
                return false;
            //var dynData = this.getDynamic(); if (!dynData) return false;
            var urls = _.flatten(_.map(taskGroups, function (grp) { return _.sample(_.map(grp.Items, function (e) { return e.url; }), cfg.testGroup_debug ? 1 : grp.take); }));
            this.adjustSitemap(urls);
            this.userPending = true;
            return true;
        };
        modImpl.prototype.refreshNumbers = function (exCountOnly) {
            if (exCountOnly === void 0) { exCountOnly = false; }
            var th = this;
            var dynData = th.getDynamic();
            if (dynData) {
                th.complPassiveCnt = th.complNotPassiveCnt = th.s = th.beg = th.end = th.elapsed = th.skipedCount = th.exCount = 0;
                th.done = th.isSkiped = false;
                //_.each(dynData.groups, g => th.exCount += cfg.testGroup_debug ? 1 : g.take);
                _.each(dynData.Items, function (g) { return th.exCount += cfg.testGroup_debug ? 1 : g.take; });
                if (th.getSkiped()) {
                    th.isSkiped = true;
                    th.skipedCount = th.exCount;
                }
            }
            else
                courseNode.doRefreshNumbers(th, exCountOnly);
        };
        modImpl.prototype.getDynamic = function () {
            var dynData = (this.Items ? this.Items[0] : null);
            return dynData && CourseMeta.isType(dynData, CourseMeta.runtimeType.dynamicModuleData) ? dynData : null;
        };
        return modImpl;
    })(courseNode);
    CourseMeta.modImpl = modImpl;
    function setDate(dt1, dt2, min) {
        if (!dt1)
            return dt2;
        if (!dt2)
            return dt1;
        if (min)
            return dt2 > dt1 ? dt1 : dt2;
        else
            return dt2 < dt1 ? dt1 : dt2;
    }
    var exImpl = (function (_super) {
        __extends(exImpl, _super);
        function exImpl() {
            _super.apply(this, arguments);
            this.flag = 0;
        }
        //isOldEa: boolean;
        //isOldEaPassive: boolean;
        //ms: number;
        exImpl.prototype.iconId = function () {
            if ((this.parent.type & (CourseMeta.runtimeType.taskTestInCourse | CourseMeta.runtimeType.taskTestSkill | CourseMeta.runtimeType.taskPretestTask)) != 0)
                return 'puzzle-piece';
            if (this.findParent(function (it) { return CourseMeta.isType(it, CourseMeta.runtimeType.grammar); }))
                return 'file-o';
            return 'edit';
        };
        exImpl.prototype.doReset = function () {
            var th = this;
            if (!th.result && !th.done)
                return false;
            delete th.done;
            delete th.s;
            delete th.beg;
            delete th.end;
            delete th.elapsed;
            th.onUnloadEx();
            return true;
        };
        exImpl.prototype.refreshNumbers = function (exCountOnly) {
            if (exCountOnly === void 0) { exCountOnly = false; }
            var th = this;
            if (exCountOnly) {
                th.exCount = 1;
                return;
            }
            th.complPassiveCnt = th.complNotPassiveCnt = th.skipedCount = 0;
            th.exCount = 1;
            th.isSkiped = false;
            if (!th.elapsed)
                th.elapsed = 0;
            if (th.getSkiped()) {
                th.skipedCount = 1;
                th.isSkiped = true;
                return;
            } //skiped => done
            if (th.done)
                if (!th.ms)
                    th.complPassiveCnt = 1;
                else
                    th.complNotPassiveCnt = 1;
        };
        exImpl.prototype.onUnloadEx = function () { delete this.page; delete this.result; delete this.evaluator; };
        exImpl.prototype.setUserData = function (user) {
            exImpl.asignResult(user, this);
        };
        exImpl.prototype.getUserData = function (setData) {
            var res = {};
            exImpl.asignResult(this, res);
            if (this.done)
                res.flag |= CourseModel.CourseDataFlag.done;
            if (this.complPassiveCnt == 1)
                res.flag |= CourseModel.CourseDataFlag.passive;
            var flag = CourseModel.CourseDataFlag.ex;
            if (this.parent && CourseMeta.isType(this.parent, CourseMeta.runtimeType.taskTestSkill))
                flag |= CourseModel.CourseDataFlag.testEx;
            setData(JSON.stringify(res), JSON.stringify(this.result), res.flag | flag, null);
        };
        exImpl.prototype.onSetPage = function (page, result) {
            this.page = page;
            if (!result)
                result = {};
            this.result = result;
            if (page.evalPage && !page.isOldEa)
                this.ms = page.evalPage.maxScore; //
            //if (page.evalPage) this.ms = page.isOldEa && !page.oldEaIsPassive ? 1 : page.evalPage.maxScore;
            //if (!page.isOldEa) page.isPassive = !CourseModel.find(page, data => data._tg && CourseModel.hasStatus(data, CourseModel.tgSt.isEval)); //pasivni cviceni nema zadne kontrolky
        };
        exImpl.prototype.setStartTime = function () {
            this.startTime = new Date().getTime();
            if (!this.beg)
                this.beg = Utils.dayToInt(new Date());
        };
        exImpl.asignResult = function (from, to) { to.beg = from.beg; to.elapsed = from.elapsed; to.end = from.end; to.ms = from.ms; to.s = from.s; to.done = from.done; to.flag = from.flag; };
        exImpl.prototype.findGreenEx = function () {
            var _this = this;
            var th = this;
            if (th.isSkiped)
                return null;
            var selfIdx = _.indexOf(th.parent.Items, this);
            var parentCount = 0;
            th.parent.each(function (nd) { if (nd.isSkiped || !CourseMeta.isType(nd, CourseMeta.runtimeType.ex))
                return; parentCount++; });
            var notSkipIdx = 0;
            th.parent.find(function (nd) { if (!nd.isSkiped)
                notSkipIdx++; return nd == th; });
            var idxFrom = ' (' + notSkipIdx.toString() + '/' + parentCount.toString() + ')';
            var res = { grEx: this, info: new CourseMeta.greenArrowInfo(CSLocalize('4f40988151d646308e50bf2225211081', 'Continue'), false, 'success', 'hand-o-right', function () { return CourseMeta.gui.gotoData(_this); }) };
            if (!th.page)
                return res; //pripad, kdy je cviceni na rade ale jsem na jine strance, tudiz jeste neni naladovano};
            var lastInMod;
            var nextEx = null;
            //dalsi cviceni stejneho parenta
            for (var i = selfIdx + 1; i < this.parent.Items.length; i++) {
                var it = (this.parent.Items[i]);
                if (CourseMeta.isType(it, CourseMeta.runtimeType.ex) && !it.isSkiped) {
                    nextEx = it;
                    break;
                }
            }
            lastInMod = nextEx == null;
            //jdi na dalsi node
            var nd = lastInMod && !th.testMode ? th.parent : nextEx; //nd je null pro posledni polozku testu
            //var gotoData = () => gui.gotoData(nd);
            if (CourseMeta.actNode != this) {
                res.info.title = CSLocalize('9a48bff2169240759d9e5b1c87618c1b', 'Continue');
                res.info.greenClick = function () { return CourseMeta.gui.gotoData(th); };
            }
            else if (!th.testMode && !th.page.isPassivePage() && !th.done) {
                res.info.title = CourseMeta.actNode == this ? CSLocalize('0b129b06c25b49908cd4576008025495', 'Evaluate') + idxFrom : CSLocalize('89024e890690456aaaf0251de3225fd6', 'Continue');
                res.info.greenClick = function () {
                    if (_this.evaluate()) {
                        CourseMeta.lib.saveProduct(function () {
                            CourseMeta.actCourseRoot.refreshNumbers();
                            //if (cfg.target == LMComLib.Targets.scorm) {
                            //  scorm.reportProgress(actCourseRoot.elapsed, actCourseRoot.done ? (actCourseRoot.complNotPassiveCnt == 0 ? 100 : Math.round(actCourseRoot.score / actCourseRoot.complNotPassiveCnt)) : null);
                            //}
                            var inf = th.findGreenEx().info;
                            inf.css = CourseMeta.greenCss();
                            CourseMeta.lib.fillArrowInfo(inf);
                            CourseMeta.refreshExerciseBar(th);
                        });
                    }
                };
            }
            else {
                res.info.title = (th.testMode ? th.testMode : (lastInMod ? CSLocalize('d874aa91bc914690ad75fe97a707e196', 'Completed') : CSLocalize('ba88aabeae6d4d59b235c927472c6440', 'Next'))) + idxFrom;
                if (!th.testMode && lastInMod)
                    res.info.iconId = 'th-list';
                res.info.greenClick = function () {
                    if (!th.done) {
                        if (_this.evaluate()) {
                            //if (cfg.target == LMComLib.Targets.scorm) {
                            //  actCourseRoot.refreshNumbers();
                            //  scorm.reportProgress(actCourseRoot.elapsed, actCourseRoot.done ? (actCourseRoot.complNotPassiveCnt == 0 ? 100 : Math.round(actCourseRoot.score / actCourseRoot.complNotPassiveCnt)) : null);
                            //}
                            CourseMeta.lib.saveProduct(function () { return CourseMeta.gui.gotoData(nd); });
                        }
                    }
                    else {
                        //human eval pro kurzy, zatim se asi nepouziva, pouzije se jen 'gui.gotoData(nd)'
                        var humanEval = Course.humanEvalControlImpl.useEvalForms(th);
                        if (humanEval === undefined)
                            CourseMeta.gui.gotoData(nd);
                        else if (humanEval == true)
                            CourseMeta.lib.saveProduct(function () { return CourseMeta.gui.gotoData(nd); });
                        else
                            return;
                    }
                };
            }
            return res;
        };
        exImpl.prototype.evaluate = function () {
            //aktualizace casu na konci cviceni
            var now = new Date().getTime();
            var delta = Math.min(exImpl.maxDelta, Math.round((now - this.startTime) / 1000));
            if (!this.elapsed)
                this.elapsed = 0;
            this.elapsed += delta;
            this.end = Utils.dayToInt(new Date());
            this.userPending = true;
            //pasivni
            if (this.page.isPassivePage()) {
                this.page.processReadOnlyEtc(true, true); //readonly a skipable controls
                this.done = true;
                return true;
            }
            //zjisteni score
            this.evaluator.provideData(this.result);
            var score = this.evaluator.getScore();
            if (!score) {
                debugger;
                throw "!score"; /*this.page.isPassive = true;*/
                this.done = true;
                return true;
            }
            //cviceni je mozne vyhodnotit
            var exerciseOK = this.testMode ? true : (score == null || score.ms == 0 || (score.s / score.ms * 100) >= 75);
            if (!exerciseOK && !CourseMeta.gui.alert(CourseMeta.alerts.exTooManyErrors, true)) {
                this.userPending = false;
                return false;
            } //je hodne chyb a uzivatel chce cviceni znova
            this.page.processReadOnlyEtc(true, true); //readonly a skipable controls
            if (!this.testMode)
                this.evaluator.acceptData(true, this.result);
            this.done = true;
            if (this.page.isOldEa)
                this.ms = score.ms;
            else if (this.ms != score.ms) {
                debugger;
                throw "this.maxScore != score.ms";
            }
            this.s = score.s;
            this.flag = score.flag;
            return true;
        };
        exImpl.prototype.testEvaluate = function () {
            this.evaluator.provideData(this.result);
            this.userPending = true;
            var score = this.evaluator.getScore();
            this.done = true;
            if (this.ms != score.ms) {
                debugger;
                throw "this.maxScore != score.ms";
            }
            this.s = score.s;
            this.flag = score.flag;
        };
        exImpl.prototype.reset = function () {
            if (!this.done)
                return;
            this.done = false;
            if (!this.page.isPassivePage())
                this.evaluator.resetData(this.result);
            this.userPending = true;
            CourseMeta.saveAndReload();
        };
        exImpl.maxDelta = 10 * 60; //10 minut
        return exImpl;
    })(courseNode);
    CourseMeta.exImpl = exImpl;
    var grammEx = (function (_super) {
        __extends(grammEx, _super);
        function grammEx() {
            _super.apply(this, arguments);
        }
        return grammEx;
    })(exImpl);
    CourseMeta.grammEx = grammEx;
    var courseImpl = (function (_super) {
        __extends(courseImpl, _super);
        function courseImpl() {
            _super.apply(this, arguments);
        }
        return courseImpl;
    })(courseNode);
    CourseMeta.courseImpl = courseImpl;
    var courseTestImpl = (function (_super) {
        __extends(courseTestImpl, _super);
        function courseTestImpl() {
            _super.apply(this, arguments);
        }
        return courseTestImpl;
    })(modImpl);
    CourseMeta.courseTestImpl = courseTestImpl;
    (function (taskPretestStatus) {
        taskPretestStatus[taskPretestStatus["questionaries"] = 0] = "questionaries";
        taskPretestStatus[taskPretestStatus["firstTest"] = 1] = "firstTest";
        taskPretestStatus[taskPretestStatus["lastTest"] = 2] = "lastTest";
        taskPretestStatus[taskPretestStatus["done"] = 3] = "done";
    })(CourseMeta.taskPretestStatus || (CourseMeta.taskPretestStatus = {}));
    var taskPretestStatus = CourseMeta.taskPretestStatus;
    var pretestTaskImpl = (function (_super) {
        __extends(pretestTaskImpl, _super);
        function pretestTaskImpl() {
            _super.apply(this, arguments);
        }
        return pretestTaskImpl;
    })(modImpl);
    CourseMeta.pretestTaskImpl = pretestTaskImpl;
    var pretestImpl = (function (_super) {
        __extends(pretestImpl, _super);
        function pretestImpl() {
            _super.apply(this, arguments);
        }
        pretestImpl.prototype.iconId = function () { return 'puzzle-piece'; };
        pretestImpl.prototype.showProgress = function () { return false; };
        pretestImpl.prototype.doReset = function () { var th = this; if (!th.pretestStatus)
            return false; delete th.pretestStatus; delete th.firstTestIdx; delete th.lastTestIdx; delete th.questionnaire; return true; };
        pretestImpl.prototype.initFields = function () {
            var _this = this;
            if (this.questionnaire)
                return;
            if (!this.pretestStatus)
                this.pretestStatus = taskPretestStatus.questionaries;
            this.questionnaire = CourseMeta.findDeep(this, function (it) { return it.name == 'questionnaire'; });
            this.result = CourseMeta.findDeep(this, function (it) { return it.name == 'result'; });
            this.pretests = [];
            this.each(function (it) { if (CourseMeta.isType(it, CourseMeta.runtimeType.taskPretestTask))
                _this.pretests.push(it); });
        };
        pretestImpl.prototype.findGreenEx = function () {
            var _this = this;
            var th = this;
            return th.pretestStatus == taskPretestStatus.done ? null : { grEx: this, info: new CourseMeta.greenArrowInfo('Pretest', false, 'success', 'hand-o-right', function () { return CourseMeta.gui.gotoData(_this); }) };
        };
        pretestImpl.prototype.pretestContinue = function () {
            var th = this;
            if (CourseMeta.actEx != th.actPretestEx())
                throw 'actEx != th.actPretestEx()';
            th.initFields();
            var nextEx;
            switch (th.pretestStatus) {
                case taskPretestStatus.questionaries:
                    CourseMeta.actEx.evaluate();
                    CourseMeta.actCourseRoot.refreshNumbers();
                    //zpracuj dotaznik
                    //TODO
                    th.firstTestIdx = 0;
                    th.pretestStatus = taskPretestStatus.firstTest;
                    th.userPending = true;
                    nextEx = CourseMeta.lib.findGreenExLow(th.pretests[th.firstTestIdx]);
                    break;
                case taskPretestStatus.firstTest:
                    CourseMeta.actEx.evaluate();
                    CourseMeta.actCourseRoot.refreshNumbers();
                    nextEx = CourseMeta.lib.findGreenExLow(th.pretests[th.firstTestIdx]);
                    if (!nextEx) {
                        //zpracuj prvni pretest
                        //TODO
                        th.lastTestIdx = 1;
                        th.pretestStatus = taskPretestStatus.lastTest;
                        th.userPending = true;
                        nextEx = CourseMeta.lib.findGreenExLow(th.pretests[th.lastTestIdx]);
                    }
                    break;
                case taskPretestStatus.lastTest:
                    CourseMeta.actEx.evaluate();
                    CourseMeta.actCourseRoot.refreshNumbers();
                    nextEx = CourseMeta.lib.findGreenExLow(th.pretests[th.lastTestIdx]);
                    if (!nextEx) {
                        //zpracuj druhy pretest
                        //TODO
                        th.pretestStatus = taskPretestStatus.done;
                        th.userPending = true;
                        nextEx = th.result;
                    }
                    break;
                case taskPretestStatus.done:
                    break;
            }
            CourseMeta.lib.saveProduct(function () {
                if (nextEx)
                    CourseMeta.lib.adjustEx(nextEx, function () {
                        return CourseMeta.lib.displayEx(nextEx, function (ex) { return Pager.clearHtml(); }, null);
                    });
                else
                    CourseMeta.gui.gotoData(null);
            });
        };
        pretestImpl.prototype.actPretestEx = function () {
            var th = this;
            th.initFields();
            switch (th.pretestStatus) {
                case taskPretestStatus.questionaries: return th.questionnaire;
                case taskPretestStatus.firstTest: return CourseMeta.lib.findGreenExLow(th.pretests[th.firstTestIdx]);
                case taskPretestStatus.lastTest: return CourseMeta.lib.findGreenExLow(th.pretests[th.lastTestIdx]);
                default: return th.result;
            }
        };
        pretestImpl.prototype.initModel = function () {
            var th = this;
            var ex = th.actPretestEx();
            var res = { grEx: ex, info: null };
            if (CourseMeta.actCourseRoot.done)
                res.info = CourseMeta.lib.info_courseFinished();
            else if (ex == th.result)
                res.info = CourseMeta.lib.info_continue();
            else
                res.info = new CourseMeta.greenArrowInfo('Pretest', false, 'success', 'hand-o-right', function () { return th.pretestContinue(); });
            return res;
        };
        pretestImpl.prototype.refreshNumbers = function (exCountOnly) {
            if (exCountOnly === void 0) { exCountOnly = false; }
            var th = this;
            th.initFields();
            var tempItems = th.Items;
            th.Items = [];
            th.Items.push(th.questionnaire);
            if (th.pretestStatus > taskPretestStatus.questionaries)
                th.Items.push(th.pretests[th.firstTestIdx]);
            if (th.pretestStatus > taskPretestStatus.firstTest)
                th.Items.push(th.pretests[th.lastTestIdx]);
            courseNode.doRefreshNumbers(th, exCountOnly);
            th.Items = tempItems;
        };
        pretestImpl.prototype.setUserData = function (user) {
            pretestImpl.asignResult(user, this);
        };
        pretestImpl.prototype.getUserData = function (setData) {
            var res = {};
            pretestImpl.asignResult(this, res);
            setData(JSON.stringify(res), null, CourseModel.CourseDataFlag.pretestImp, null);
        };
        pretestImpl.asignResult = function (from, to) { to.pretestStatus = from.pretestStatus; to.firstTestIdx = from.firstTestIdx; to.lastTestIdx = from.lastTestIdx; };
        return pretestImpl;
    })(courseNode);
    CourseMeta.pretestImpl = pretestImpl;
})(CourseMeta || (CourseMeta = {}));


var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Course;
(function (Course) {
    var c_used = "used";
    var fakeEdit = '???ignore???';
    var edit = (function (_super) {
        __extends(edit, _super);
        function edit(staticData) {
            var _this = this;
            _super.call(this, staticData);
            this.onBehav = ko.observable(null); //pro isExchangeable evalGroup: tento edit control se chova jako onBehav edit control (vypocet isCorrect a hodnota teacher)
            this.user = ko.observable('');
            this.teacher = ko.computed(function () { var th = _this.onBehav(); return th ? th.getTeacher() : ''; });
            this.st = ko.observable('');
            if (!this.correctValue)
                this.correctValue = '';
            else if (Utils.startsWith(this.correctValue, fakeEdit)) {
                this.isFakeEdit = true;
            }
            this.onBehav(this);
        }
        edit.prototype.getTeacher = function () { return ''; };
        edit.prototype.createResult = function (forceEval) { this.done(false); return { ms: 0, s: 0, tg: this._tg, flag: 0, Value: forceEval ? this.correctValue.split('|')[0] : "" }; };
        edit.prototype.setScore = function () {
            if (this.onBehav().isFakeEdit) {
                this.result.ms = 0;
                return;
            }
            _super.prototype.setScore.call(this);
        };
        edit.prototype.isCorrect = function () {
            if (this.isSkipEvaluation())
                return true;
            var res = this.doNormalize(this.result.Value);
            return _.any(this.onBehav().corrects, function (s) { return s == res; });
        };
        edit.prototype.provideData = function () {
            if (this.done())
                return;
            this.result.Value = this.user();
            if (this.isSkipEvaluation())
                this.corrects = [this.result.Value]; //pro isSkipEvaluation je vse co se vyplni spravne
        };
        edit.prototype.acceptData = function (done) {
            _super.prototype.acceptData.call(this, done);
            this.user(this.result.Value);
            var val = this.doNormalize(this.result.Value);
            if (!this.done())
                this.st('edit');
            else if (this.isCorrect())
                this.st('ok');
            else
                this.st(!val || val == '' ? 'empty' : 'wrong');
        };
        edit.prototype.doNormalize = function (s) { return this.caseSensitive ? s : s.toLowerCase(); };
        edit.filter = function (ctrls) {
            return (_.filter(ctrls, function (c) { return c._tg == CourseModel.tgapFill || c._tg == CourseModel.tdropDown; }));
        };
        edit.adjustSmartWidths = function (pg) {
            var offers = (_.filter(pg.items, function (c) { return c._tg == CourseModel.toffering; }));
            var usedEdits = {};
            //zpracuj offering
            _.each(offers, function (off) {
                var both = _.partition(off.words.split('|'), function (w) { return w.length > 2 && w.charAt(0) == "#"; }); //rozdel words na id a word
                var words = both[1];
                var eds = (_.map(both[0], function (id) { return pg.tags[id.substr(1)]; })); //offering edits
                _.each(eds, function (ed) { return usedEdits[ed.id] = true; }); //edits hotovy
                //zjisti maximum z sirek
                var firstEd = true;
                var max = 0;
                _.each(eds, function (ed) {
                    var w = ed.smartWidthPropAction(undefined, firstEd ? words : null); //v prvnim edit se zpracuji i offering words
                    firstEd = false;
                    if (w > max)
                        max = w;
                });
                //dosat maximim z sirek
                _.each(eds, function (ed) { return ed.smartWidthPropAction(max); });
            });
            //zpracuj zbyle edits (s smartWidth i bez)
            var edits = (_.filter(pg.items, function (c) { return (c._tg == CourseModel.tgapFill || c._tg == CourseModel.tdropDown) && !usedEdits[c.id]; }));
            var grps = _.groupBy(edits, function (e) { return e.widthGroup; });
            for (var p in grps) {
                if (p == 'undefined') {
                    _.each(grps[p], function (ed) {
                        var w = ed.smartWidthPropAction(undefined);
                        if (w > 0)
                            ed.smartWidthPropAction(w);
                    });
                }
                else {
                    var eds = _.map(grps[p], function (ed) { return { ed: ed, width: ed.smartWidthPropAction(undefined) }; });
                    var max = _.max(eds, function (e) { return e.width; });
                    if (max.width > 0)
                        _.each(eds, function (e) { if (e.width >= 0)
                            e.ed.smartWidthPropAction(max.width); });
                }
            }
        };
        //vrati nebo nastavi spolecnou sirku
        edit.prototype.smartWidthPropAction = function (setw, offerWords) {
            if (offerWords === void 0) { offerWords = null; }
            var selfEl = this.selfElement();
            var isGapFill = this._tg == CourseModel.tgapFill;
            if (setw == undefined) {
                //if (selfEl.width() > 10) return -1; //odstraneno 19.5.2015, k cemu bylo?
                if (this.width > 0)
                    return this.width;
                var arr = this.correctValue.split('|');
                arr = _.map(arr, function (a) { return a.length == 1 ? 'x' : (a.length == 2 ? 'xx' : (a.length == 3 ? 'xxx' : a)); });
                if (isGapFill) {
                    var gp = this;
                    if (gp.initValue)
                        arr.push(gp.initValue);
                    if (gp.hint)
                        arr.push(gp.hint);
                }
                if (offerWords != null && offerWords.length > 0)
                    arr.pushArray(offerWords);
                var growby = 1;
                if (isGapFill) {
                    var charnum = _.max(arr, function (s) { return s.length; }).length;
                    if (charnum == 0)
                        return 20;
                    if (charnum == 1)
                        growby = 4;
                    else if (charnum == 2)
                        growby = 2;
                    else if (charnum == 3)
                        growby = 1.5;
                    else if (charnum < 5)
                        growby = 1.7;
                    else if (charnum < 10)
                        growby = 1.5;
                    else if (charnum < 15)
                        growby = 1.3;
                    else
                        growby = 1.2;
                }
                return Math.round(growby * Gui2.maxTextWidth(arr, selfEl));
            }
            else {
                var w = setw + (isGapFill ? 26 : 44);
                selfEl.css('width', w.toString() + 'px'); //nejaky bug, spatne se do sirky zapocitavaji padding a margin, jen ale po Eval x reset.
            }
        };
        return edit;
    })(Course.evalControlImpl);
    Course.edit = edit;
    var gapFill = (function (_super) {
        __extends(gapFill, _super);
        function gapFill(staticData) {
            var _this = this;
            _super.call(this, staticData);
            if (!this.initValue)
                this.initValue = '';
            if (this.readOnly || this.skipEvaluation) {
                this.correctValue = this.initValue;
                this.result = this.createResult(false);
            }
            this.corrects = _.map(this.correctValue.split('|'), function (s) { return _this.doNormalize(s); });
        }
        gapFill.prototype.getTeacher = function () { var res = this.correctValue.split('|')[0]; return Utils.startsWith(res, fakeEdit) ? '' : res; };
        gapFill.prototype.createResult = function (forceEval) {
            return {
                ms: 0, s: 0, tg: this._tg, flag: 0,
                Value: forceEval ? this.correctValue.split('|')[0] : this.initValue
            };
        };
        gapFill.prototype.doNormalize = function (s) { return Course.normalize(s, this.caseSensitive); };
        gapFill.prototype.isReadOnly = function () { return this.readOnly; };
        gapFill.prototype.isSkipEvaluation = function () { return this.skipEvaluation; }; // || this.onBehav().isFakeEdit; }
        return gapFill;
    })(edit);
    Course.gapFill = gapFill;
    var dropDown = (function (_super) {
        __extends(dropDown, _super);
        function dropDown(staticData) {
            var _this = this;
            _super.call(this, staticData);
            this.userText = ko.observable(''); //uzivatelem vybrany text
            this.click = function (data, ev) {
                clickedDropDown = _this;
                anim.toggleMenuLow(ev);
            }; //dragList.target = this; dragList.show(); } //klik na sipku u dragTarget slova
            this.corrects = this.gapFillLike ? _.map(this.correctValue.split('|'), function (s) { return _this.doNormalize(s); }) : ['#' + this.id];
            var self = this;
            this.user.subscribe(function (userVal) {
                if (_.isEmpty(userVal)) {
                    self.userText('');
                    return;
                } //odstraneni
                if (userVal[0] != '#') {
                    self.userText(userVal);
                    return;
                } //text
                self.userText(self.source.findDropDownViaId(userVal.substr(1)).getTeacher());
            });
        }
        dropDown.prototype.getTeacher = function () { return Utils.startsWith(this.correctValue, fakeEdit) ? '' : this.correctValue; };
        dropDown.prototype.createResult = function (forceEval) { return { ms: 0, s: 0, tg: this._tg, flag: 0, Value: forceEval ? this.corrects[0] : '' }; };
        dropDown.prototype.resetData = function (allData) {
            _super.prototype.resetData.call(this, allData);
            if (this.source)
                this.source.resetData();
        };
        return dropDown;
    })(edit);
    Course.dropDown = dropDown;
    var dragTarget = (function (_super) {
        __extends(dragTarget, _super);
        function dragTarget() {
            _super.apply(this, arguments);
        }
        return dragTarget;
    })(dropDown);
    Course.dragTarget = dragTarget;
    var offering = (function (_super) {
        __extends(offering, _super);
        function offering(staticData) {
            _super.call(this, staticData);
        }
        offering.prototype.initProc = function (phase, getTypeOnly, completed) {
            var _this = this;
            switch (phase) {
                case Course.initPhase.beforeRender:
                    if (!getTypeOnly) {
                        this.edits = [];
                        this.wordItems = [];
                        var hasDropDown = false;
                        _.each(this.words.split('|'), function (w) {
                            if (w[0] == '#') {
                                var ed = (_this._myPage.tags[w.substr(1)]);
                                ed.widthGroup = '@sw-' + _this.id;
                                ed.source = _this;
                                hasDropDown = ed._tg == CourseModel.tdropDown && !ed.gapFillLike;
                                _this.edits.push(ed);
                                ed.source = _this;
                                if (!ed.isFakeEdit)
                                    _this.wordItems.pushArray(_.map(ed.correctValue.split('|'), function (c) { return new dragWord(hasDropDown ? ed : c); }));
                            }
                            else
                                _this.wordItems.push(new dragWord(w));
                        });
                        this.passive = !hasDropDown || this.mode == CourseModel.offeringDropDownMode.dropDownKeep;
                        if (this.passive)
                            this.wordItems = _.uniq(this.wordItems, function (w) { return w.title(); });
                        this.wordItems = _.sortBy(this.wordItems, function (wi) { return wi.title(); }); //BT 2168 
                    }
                    return Course.initPhaseType.sync;
            }
            return _super.prototype.initProc.call(this, phase, getTypeOnly, completed);
        };
        offering.prototype.resetData = function () { _.each(this.wordItems, function (w) { return w.st(''); }); };
        offering.prototype.findWordViaValue = function (value) { return _.isEmpty(value) ? null : _.find(this.wordItems, function (w) { return w.value() == value; }); };
        offering.prototype.findEditViaSelected = function (selected) { return _.isEmpty(selected) ? null : _.find(this.edits, function (ed) { return ed.user() == selected; }); };
        offering.prototype.findDropDownViaId = function (id) { return (_.find(this.edits, function (ed) { return ed.id == id; })); };
        return offering;
    })(Course.tagImpl);
    Course.offering = offering;
    var dragWord = (function () {
        function dragWord(content) {
            var _this = this;
            this.st = ko.observable(''); //'' nebo used
            this.click = function () {
                try {
                    var selected = _this.value();
                    if (clickedDropDown.source.passive) {
                        clickedDropDown.user(selected);
                        return;
                    }
                    var oldVal = clickedDropDown.user(); //obsah clicked dropdown
                    if (oldVal == selected) {
                        _this.st('');
                        clickedDropDown.user('');
                        return;
                    } //vybrano to same slovo => undo (zrus vyber)
                    //najdi dropdown, ktery ma vybrany selected word
                    var withSelected = clickedDropDown.source.findEditViaSelected(selected);
                    if (withSelected != null)
                        withSelected.user('');
                    //vrat doposud vybrane slovo v dragList.target mezi nepouzite
                    var oldWord = clickedDropDown.source.findWordViaValue(oldVal);
                    if (oldWord != null)
                        oldWord.st('');
                    //aktualizuje clicked dropdown a selected word status
                    clickedDropDown.user(selected); //pouzij newVal
                    _this.st(c_used);
                }
                finally {
                    anim.hideMenus(null);
                }
            };
            if (_.isString(content))
                this.word = content;
            else {
                this.myDropDown = content;
                this.myDropDown.myWord = this;
            }
        }
        dragWord.prototype.title = function () { return this.word ? this.word : this.myDropDown.teacher(); };
        dragWord.prototype.value = function () { return this.word ? this.word : '#' + this.myDropDown.id; };
        return dragWord;
    })();
    Course.dragWord = dragWord;
    var clickedDropDown;
    CourseModel.registerClassToInterface(CourseModel.meta, CourseModel.toffering, offering);
    CourseModel.registerClassToInterface(CourseModel.meta, CourseModel.tgapFill, gapFill);
    CourseModel.registerClassToInterface(CourseModel.meta, CourseModel.tdropDown, dropDown);
})(Course || (Course = {}));

var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Course;
(function (Course) {
    var pairing = (function (_super) {
        __extends(pairing, _super);
        function pairing() {
            _super.apply(this, arguments);
            this.leftSelected = ko.observable(false);
        }
        pairing.prototype.pageCreated = function () {
            var _this = this;
            _.each(this.Items, function (it) { return it.doRegisterControl(it); });
            var cnt = 0;
            var rnd = Utils.randomizeArray(_.range(this.Items.length));
            this.randomItems = _.map(rnd, function (i) { return (_this.Items[i]); });
            _super.prototype.pageCreated.call(this);
        };
        pairing.prototype.leftWidthCls = function () { return 'left-' + CourseModel.pairingLeftWidth[this.leftWidth]; };
        pairing.prototype.actItems = function () { return this.leftRandom ? this.randomItems : this.Items; };
        pairing.prototype.initProc = function (phase, getTypeOnly, completed) {
            switch (phase) {
                case Course.initPhase.afterRender2:
                    if (!getTypeOnly) {
                        //Nastaveni sirky prave strany jako rozdilu mezi MIN sirkou pairingu a sirkou prave strany (minus 145)
                        var strings = _.map(this.Items, function (it) { return it.right; });
                        var styleHolder = this.selfElement().find('.oli-edit .teacher').first();
                        var maxWidth = Gui2.maxTextWidth(strings, styleHolder);
                        this.selfElement().find('.pairing-item .left-content').width(maxWidth + 10); //145px je sirka pomocnych casti pairingu, bez leveho a praveho obsahu: 
                    }
                    return Course.initPhaseType.sync;
            }
            return _super.prototype.initProc.call(this, phase, getTypeOnly, completed);
        };
        pairing.prototype.createResult = function (forceEval) {
            return {
                ms: 0, s: 0,
                tg: this._tg,
                flag: 0,
                Value: forceEval ? _.range(this.Items.length) : _.map(this.randomItems, function (it) { return it.selfIdx; })
            };
        };
        pairing.prototype.setScore = function () {
            var v = this.result.Value;
            var cnt = 0;
            for (var i = 0; i < v.length; i++)
                if (i == v[i])
                    cnt++;
            var sw = this.scoreWeight ? this.scoreWeight : 100 * v.length;
            this.result.ms = sw;
            this.result.s = Math.round(sw / v.length * cnt);
        };
        pairing.prototype.acceptData = function (done) {
            var _this = this;
            _super.prototype.acceptData.call(this, done);
            _.each(this.Items, function (it) {
                it.ok(_this.done());
                it.result = { ms: 0, s: 0, tg: _this._tg, flag: 0, Value: _this.result.Value[it.selfIdx].toString() };
                it.acceptData(_this.done());
            });
        };
        pairing.prototype.provideData = function () {
            if (this.done())
                return;
            this.result.Value = _.map(this.Items, function (it) { return parseInt(it.user()); });
        };
        pairing.prototype.select_left = function (it) {
            if (this.pageDone())
                return;
            this.leftSelected(true);
            _.each(this.Items, function (it) { return it.leftSelected(false); });
            it.leftSelected(true);
        };
        pairing.prototype.select_right = function (it) {
            if (this.pageDone() || !this.leftSelected())
                return;
            var leftSel = _.find(this.Items, function (it) { return it.leftSelected(); }); //levy vybrany na nastaveno leftSelected
            var itu = parseInt(it.user()); //co je nastaveno v pravem vybranem
            var rightSel = _.find(this.Items, function (it) { return it.selfIdx == itu; }); //najdi zdroj pro pravy vybrany
            //Vymena indexu
            var leftUser = leftSel.user();
            leftSel.user(rightSel.selfIdx.toString());
            it.user(leftUser);
            //spojnice
            it.ok(false);
            leftSel.ok(true);
            //pokud chybi pouze jedna spojnice, dopln ji.
            var notOk = null;
            var notOks = 0;
            _.each(this.Items, function (it) { if (it.ok())
                return; notOks++; notOk = it; });
            if (notOks == 1)
                notOk.ok(true);
            //globalni leftSelected stav
            this.leftSelected(false);
            _.each(this.Items, function (it) { return it.leftSelected(false); });
        };
        return pairing;
    })(Course.evalControlImpl);
    Course.pairing = pairing;
    var pairingItem = (function (_super) {
        __extends(pairingItem, _super);
        function pairingItem() {
            _super.apply(this, arguments);
            this.userText = ko.observable('');
            this.leftSelected = ko.observable(false);
            this.ok = ko.observable(false);
        }
        pairingItem.prototype.doRegisterControl = function (data) {
            var _this = this;
            this.selfIdx = _.indexOf(this._owner.Items, this);
            this.user.subscribe(function (val) { return _this.userText(_this._owner.Items[parseInt(val)].right); });
            this.teacherTxt = this.right;
            this.corrects = [this.selfIdx.toString()];
        };
        pairingItem.prototype.pageCreated = function () { };
        pairingItem.prototype.select_left = function () { this._owner.select_left(this); };
        pairingItem.prototype.select_right = function () { this._owner.select_right(this); };
        return pairingItem;
    })(Course.edit);
    Course.pairingItem = pairingItem;
    CourseModel.registerClassToInterface(CourseModel.meta, CourseModel.tpairing, pairing);
    CourseModel.registerClassToInterface(CourseModel.meta, CourseModel.tpairingItem, pairingItem);
})(Course || (Course = {}));

var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Course;
(function (Course) {
    (function (ordItemStatus) {
        ordItemStatus[ordItemStatus["no"] = 0] = "no"; /*nezarazene*/
        ordItemStatus[ordItemStatus["fake"] = 1] = "fake"; /*posledni fake item, kvul vlozeni na konec*/
        ordItemStatus[ordItemStatus["done"] = 2] = "done"; /*zarazene, nevybrane pro editaci*/
        ordItemStatus[ordItemStatus["edited"] = 3] = "edited"; /*vybrane pro editaci*/
    })(Course.ordItemStatus || (Course.ordItemStatus = {}));
    var ordItemStatus = Course.ordItemStatus;
    var orderItem = (function (_super) {
        __extends(orderItem, _super);
        function orderItem() {
            _super.apply(this, arguments);
        }
        orderItem.prototype.click = function () {
            var inSrc = this.inSrc();
            this.$self.detach();
            (inSrc ? this.owner.$destBlock : this.owner.$srcBlock).append(this.$self[0]);
        };
        orderItem.prototype.inSrc = function () {
            return this.$self[0].parentElement == this.owner.$srcBlock[0];
        };
        return orderItem;
    })(Course.tagImpl);
    Course.orderItem = orderItem;
    var ordering = (function (_super) {
        __extends(ordering, _super);
        function ordering() {
            _super.apply(this, arguments);
            this.evaluated = ko.observable(false);
        }
        ordering.prototype.initProc = function (phase, getTypeOnly, completed) {
            switch (phase) {
                case Course.initPhase.afterRender2:
                    if (!getTypeOnly) {
                        this.$srcBlock = $('#ordering-' + this.id + ' .src-block');
                        this.$destBlock = $('#ordering-' + this.id + ' .dest-block');
                        _.each(_.zip(this.$srcBlock.children('div').toArray(), this.randomItems), function (arr) { return arr[1].$self = $(arr[0]); });
                    }
                    return Course.initPhaseType.sync;
            }
            return _super.prototype.initProc.call(this, phase, getTypeOnly, completed);
        };
        ordering.prototype.initRandomize = function () {
            var _this = this;
            var cnt = 0;
            _.each(this.Items, function (it) { it.idx = cnt++; it.owner = _this; });
            var rnd = Utils.randomizeArray(_.range(this.Items.length));
            this.randomItems = _.map(rnd, function (i) { return (_this.Items[i]); });
        };
        ordering.prototype.dones = function () {
            var _this = this;
            if (!this.$destBlock)
                return [];
            return _.filter(_.map(this.$destBlock[0].children, function (ch) { return _.find(_this.Items, function (it) { return it.$self[0] == ch; }); }), function (it) { return !!it; });
        };
        ordering.prototype.createResult = function (forceEval) {
            return {
                ms: 0, s: 0,
                tg: this._tg,
                flag: 0,
                indexes: forceEval ? _.range(this.randomItems.length) : [] //_.map(this.randomItems, it => it.idx)
            };
        };
        ordering.prototype.isCorrect = function () {
            return this.isCorrectEx().isCorrect;
        };
        ordering.prototype.isCorrectEx = function () {
            var res = { isCorrect: false, dones: null };
            res.dones = this.dones();
            if (res.dones.length != this.Items.length)
                return res;
            for (var i = 0; i < res.dones.length; i++)
                if (res.dones[i].idx != i)
                    return res;
            res.isCorrect = true;
            return res;
        };
        ordering.prototype.acceptData = function (done) {
            var _this = this;
            _super.prototype.acceptData.call(this, done);
            try {
                if (!this.result.indexes || this.result.indexes.length == 0)
                    return;
                _.each(this.result.indexes, function (idx) { if (_this.Items[idx].inSrc())
                    _this.Items[idx].click(); });
            }
            finally {
                this.evaluated(done);
            }
        };
        ordering.prototype.provideData = function () {
            if (this.done())
                return;
            this.result.indexes = _.map(this.dones(), function (it) { return it.idx; });
        };
        return ordering;
    })(Course.evalControlImpl);
    Course.ordering = ordering;
    var orderWordItem = (function (_super) {
        __extends(orderWordItem, _super);
        function orderWordItem() {
            _super.apply(this, arguments);
        }
        return orderWordItem;
    })(orderItem);
    Course.orderWordItem = orderWordItem;
    var wordOrdering = (function (_super) {
        __extends(wordOrdering, _super);
        function wordOrdering() {
            _super.apply(this, arguments);
            this.user = ko.observable('');
            this.evalStatus = ko.observable('');
        }
        wordOrdering.prototype.pageCreated = function () {
            this.Items = _.map(this.correctOrder.split('|'), function (txt) {
                var res = new orderWordItem();
                var parts = txt.split('#');
                res.text = parts[0];
                res.evalText = parts[parts.length == 2 ? 1 : 0];
                return res;
            });
            this.teacher = _.map(this.Items, function (it) { return it.evalText; }).join(' ');
            this.initRandomize();
            _super.prototype.pageCreated.call(this);
        };
        wordOrdering.prototype.acceptData = function (done) {
            _super.prototype.acceptData.call(this, done);
            if (!done)
                return;
            var corr = this.isCorrectEx();
            this.user(corr.isCorrect ? this.teacher : _.map(corr.dones, function (it) { return it.text; }).join(' '));
            this.evalStatus(corr.isCorrect ? 'eval-green' : (corr.dones.length == 0 ? 'eval-red' : 'eval-strike'));
        };
        return wordOrdering;
    })(ordering);
    Course.wordOrdering = wordOrdering;
    var orderSentenceItem = (function (_super) {
        __extends(orderSentenceItem, _super);
        function orderSentenceItem() {
            _super.apply(this, arguments);
            this.evalStatus = ko.observable('');
            this.teacher = ko.observable('');
        }
        return orderSentenceItem;
    })(orderItem);
    Course.orderSentenceItem = orderSentenceItem;
    var sentenceOrdering = (function (_super) {
        __extends(sentenceOrdering, _super);
        function sentenceOrdering() {
            _super.apply(this, arguments);
        }
        sentenceOrdering.prototype.jsonMLParsed = function () {
            _super.prototype.jsonMLParsed.call(this);
            _.each(this.Items, function (it) { return it.text = (it.Items[0]); });
            this.initRandomize();
        };
        sentenceOrdering.prototype.acceptData = function (done) {
            var _this = this;
            _super.prototype.acceptData.call(this, done);
            if (!done)
                return;
            var corr = this.isCorrectEx();
            //jiz pretazene
            for (var i = 0; i < corr.dones.length; i++) {
                var it = (corr.dones[i]);
                it.teacher(this.Items[i].text);
                it.evalStatus(it.idx == i ? 'eval-green' : 'eval-strike');
            }
            //nepretazene
            var lastIdx = corr.dones.length;
            var noDones = _.filter(this.Items, function (it) { return _.all(corr.dones, function (d) { return d != it; }); });
            _.each(noDones, function (nd) { nd.click(); nd.evalStatus('eval-red'); nd.teacher(_this.Items[lastIdx++].text); });
        };
        return sentenceOrdering;
    })(ordering);
    Course.sentenceOrdering = sentenceOrdering;
    CourseModel.registerClassToInterface(CourseModel.meta, CourseModel.twordOrdering, wordOrdering);
    CourseModel.registerClassToInterface(CourseModel.meta, CourseModel.tsentenceOrdering, sentenceOrdering);
    CourseModel.registerClassToInterface(CourseModel.meta, CourseModel.tsentenceOrderingItem, orderSentenceItem);
})(Course || (Course = {}));

var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Course;
(function (Course) {
    var radioEvalImpl = (function (_super) {
        __extends(radioEvalImpl, _super);
        function radioEvalImpl(staticData) {
            _super.call(this, staticData);
        }
        return radioEvalImpl;
    })(Course.evalControlImpl);
    Course.radioEvalImpl = radioEvalImpl;
    var radioButton = (function (_super) {
        __extends(radioButton, _super);
        function radioButton(staticData) {
            _super.call(this, staticData);
            this.selected = ko.observable(false);
            this.myCss = ko.observable('');
            if (this.readOnly || this.skipEvaluation) {
                this.correctValue = this.initValue;
                this.result = this.createResult(false);
            }
        }
        radioButton.prototype.createResult = function (forceEval) { return { ms: 0, s: 0, tg: this._tg, flag: 0, isSelected: forceEval ? this.correctValue : this.initValue }; }; //inicializace objektu s vysledkem kontrolky
        radioButton.prototype.acceptData = function (done) {
            _super.prototype.acceptData.call(this, done);
            if (!done) {
                this.selected(this.result.isSelected);
                this.myCss('');
                return;
            }
            if (!!this.result.isSelected == !!this.correctValue)
                this.myCss(this.result.isSelected ? "black" : "no");
            else
                this.myCss(this.correctValue ? "red" : "strike");
        };
        radioButton.prototype.provideData = function () {
            if (this.done())
                return;
            this.result.isSelected = this.selected();
            if (this.skipEvaluation)
                this.correctValue = this.result.isSelected; //pro isSkipEvaluation je vse co se vyplni spravne
        };
        radioButton.prototype.isCorrect = function () {
            return !!this.correctValue == !!this.result.isSelected;
        };
        radioButton.prototype.click = function () {
            var _this = this;
            if (this.pageDone())
                return;
            _.each(this.myEvalGroup, function (it) { return it.selected(_this == it); });
        };
        radioButton.prototype.isReadOnly = function () { return this.readOnly; };
        radioButton.prototype.isSkipEvaluation = function () { return this.skipEvaluation; };
        return radioButton;
    })(radioEvalImpl);
    Course.radioButton = radioButton;
    CourseModel.registerClassToInterface(CourseModel.meta, CourseModel.tradioButton, radioButton);
    var wordSelectionLow = (function (_super) {
        __extends(wordSelectionLow, _super);
        function wordSelectionLow() {
            _super.apply(this, arguments);
        }
        wordSelectionLow.prototype.click_item = function (it) { };
        return wordSelectionLow;
    })(radioEvalImpl);
    Course.wordSelectionLow = wordSelectionLow;
    var wordSelection = (function (_super) {
        __extends(wordSelection, _super);
        function wordSelection(data) {
            var _this = this;
            _super.call(this, data);
            var words = this.words.split('|');
            this.correctValue = -1;
            for (var i = 0; i < words.length; i++)
                if (words[i].charAt(0) == '#') {
                    this.correctValue = i;
                    break;
                }
            var cnt = 0;
            //###jsonML
            this.items = _.map(words, 
            //w=> new choiceItem(<CourseModel.text>{ title: "<span class='c-nowrap'>" + w.replace(/^#/, '') + "</span>", _tg: CourseModel.ttext }, this, cnt++));
            //w=> new choiceItem(<CourseModel.text>{ title: "<span class='c-nowrap'>" + w.replace(/^#/, '') + "</span>", _tg: CourseModel.ttext }, this, cnt++));
            function (w) { return new choiceItem(w.replace(/^#/, ''), _this, cnt++); });
        }
        wordSelection.prototype.createResult = function (forceEval) { return { ms: 0, s: 0, tg: this._tg, flag: 0, Value: forceEval ? this.correctValue : -1 }; }; //inicializace objektu s vysledkem kontrolky
        wordSelection.prototype.provideData = function () {
            if (this.done())
                return;
            var actItem = _.find(this.items, function (it) { return it.selected(); });
            this.result.Value = actItem == null ? -1 : actItem.selfIdx;
        };
        wordSelection.prototype.acceptData = function (done) {
            var _this = this;
            _super.prototype.acceptData.call(this, done);
            var corr = this.correctValue;
            _.each(this.items, function (it) { return it.acceptItemData(_this.done(), corr, _this.result.Value); });
        };
        wordSelection.prototype.isCorrect = function () {
            var actItem = _.find(this.items, function (it) { return it.selected(); });
            if (this.correctValue == -1)
                return !actItem;
            else
                return actItem != null && actItem.selfIdx == this.correctValue;
        };
        wordSelection.prototype.click_item = function (it) {
            if (this.pageDone())
                return;
            _.each(this.myEvalGroup || [this], function (grp) { return _.each(grp.items, function (t) {
                if (t == it)
                    t.selected(!t.selected());
                else
                    t.selected(false);
            }); });
        };
        return wordSelection;
    })(wordSelectionLow);
    Course.wordSelection = wordSelection;
    var wordMultiSelection = (function (_super) {
        __extends(wordMultiSelection, _super);
        function wordMultiSelection(data) {
            var _this = this;
            _super.call(this, data);
            var words = this.words.split('|');
            this.correctValues = [];
            for (var i = 0; i < words.length; i++)
                if (words[i].charAt(0) == '#')
                    this.correctValues.push(i);
            var cnt = 0;
            //###jsonML
            this.items = _.map(words, 
            //w=> new choiceItem(<CourseModel.text>{ title: "<span class='c-nowrap'>" + w.replace(/^#/, '') + "</span>", _tg: CourseModel.ttext }, this, cnt++));
            //w=> new choiceItem(<CourseModel.text>{ title: "<span class='c-nowrap'>" + w.replace(/^#/, '') + "</span>", _tg: CourseModel.ttext }, this, cnt++));
            function (w) { return new choiceItem(w.replace(/^#/, ''), _this, cnt++); });
        }
        wordMultiSelection.prototype.createResult = function (forceEval) { return { ms: 0, s: 0, tg: this._tg, flag: 0, Values: forceEval ? this.correctValues : [] }; }; //inicializace objektu s vysledkem kontrolky
        wordMultiSelection.prototype.provideData = function () {
            var _this = this;
            if (this.done())
                return;
            this.result.Values = [];
            _.each(this.items, function (it) { if (!it.selected())
                return; _this.result.Values.push(it.selfIdx); });
        };
        wordMultiSelection.prototype.acceptData = function (done) {
            var _this = this;
            _super.prototype.acceptData.call(this, done);
            _.each(this.items, function (it) {
                var corr = _.contains(_this.correctValues, it.selfIdx) ? it.selfIdx : -1;
                var res = _.contains(_this.result.Values, it.selfIdx) ? it.selfIdx : -1;
                it.acceptItemData(_this.done(), corr, res);
            });
        };
        wordMultiSelection.prototype.isCorrect = function () {
            var union = _.union(this.correctValues, this.result.Values);
            return union.length == this.correctValues.length && union.length == this.result.Values.length;
        };
        wordMultiSelection.prototype.click_item = function (it) {
            if (this.pageDone())
                return;
            it.selected(!it.selected());
        };
        return wordMultiSelection;
    })(wordSelectionLow);
    Course.wordMultiSelection = wordMultiSelection;
    CourseModel.registerClassToInterface(CourseModel.meta, CourseModel.twordSelection, wordSelection);
    CourseModel.registerClassToInterface(CourseModel.meta, CourseModel.twordMultiSelection, wordMultiSelection);
    var choiceItem = (function () {
        function choiceItem(content, _owner, selfIdx) {
            this.content = content;
            this._owner = _owner;
            this.selfIdx = selfIdx;
            this.selected = ko.observable(false);
            this.myCss = ko.observable('');
        }
        choiceItem.prototype.acceptItemData = function (done, correctIdx, userSelectedIdx) {
            if (!done) {
                this.selected(userSelectedIdx == this.selfIdx);
                this.myCss('');
                return;
            }
            this.selected(this.selfIdx == userSelectedIdx);
            if (correctIdx == userSelectedIdx)
                this.myCss(this.selfIdx == correctIdx ? "black" : "no");
            else
                this.myCss(this.selfIdx == correctIdx ? "red" : (this.selfIdx == userSelectedIdx ? "strike" : "no"));
        };
        choiceItem.prototype.click = function () { this._owner.click_item(this); };
        return choiceItem;
    })();
    Course.choiceItem = choiceItem;
})(Course || (Course = {}));

var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Course;
(function (Course) {
    //********************************************* MEDIA controls GUI
    var mediaActivable = (function (_super) {
        __extends(mediaActivable, _super);
        function mediaActivable() {
            _super.apply(this, arguments);
            this.active = ko.observable(false);
        }
        return mediaActivable;
    })(Course.tagImpl);
    Course.mediaActivable = mediaActivable;
    var mediaTagImpl = (function (_super) {
        __extends(mediaTagImpl, _super);
        function mediaTagImpl() {
            _super.apply(this, arguments);
            this.loading = ko.observable(true);
            this.playing = ko.observable(false);
        }
        mediaTagImpl.prototype.myGrp = function () { return this._myPage.sndPage.grps[this._sentGroupId]; };
        return mediaTagImpl;
    })(mediaActivable);
    Course.mediaTagImpl = mediaTagImpl;
    var mediaBigMark = (function (_super) {
        __extends(mediaBigMark, _super);
        function mediaBigMark() {
            _super.apply(this, arguments);
        }
        mediaBigMark.prototype.play = function () { if (this.loading())
            return; this._myPage.sndPage.play(this._sentGroupId, -1); };
        return mediaBigMark;
    })(mediaTagImpl);
    Course.mediaBigMark = mediaBigMark;
    //ozvuceny text nebo dialog
    var mediaText = (function (_super) {
        __extends(mediaText, _super);
        function mediaText(data) {
            if (!data.passive)
                data.passive = false;
            if (!data.hidden)
                data.hidden = false;
            //if (!data.inline) data.inline = false;
            _super.call(this, data);
            if (this.passive)
                this.loading(false);
        }
        return mediaText;
    })(mediaTagImpl);
    Course.mediaText = mediaText;
    //video, vytvari driver na prehravani
    var mediaVideo = (function (_super) {
        __extends(mediaVideo, _super);
        function mediaVideo() {
            _super.apply(this, arguments);
            this.ratioClass = ko.observable('');
        }
        return mediaVideo;
    })(mediaTagImpl);
    Course.mediaVideo = mediaVideo;
    var mediaReplica = (function (_super) {
        __extends(mediaReplica, _super);
        function mediaReplica() {
            _super.apply(this, arguments);
        }
        mediaReplica.prototype.css = function () { return (_.isString(this.iconId) ? (this.iconId) : CourseModel.IconIds[this.iconId]) + " " + (this.dlgLeft ? "dlg-left" : "dlg-right"); };
        return mediaReplica;
    })(mediaActivable);
    Course.mediaReplica = mediaReplica;
    var mediaSent = (function (_super) {
        __extends(mediaSent, _super);
        function mediaSent() {
            _super.apply(this, arguments);
        }
        mediaSent.prototype.myText = function () { return (this._owner._tg == CourseModel.t_mediaReplica ? this._owner._owner : this._owner); };
        mediaSent.prototype.pageCreated = function () {
            _super.prototype.pageCreated.call(this);
            this.mySent = this._myPage.sndPage.sents[this.idx];
            if (!this.mySent)
                return; //pro passivni mediaText
            this.mySent.myMediaSents.push(this); //provazani media - snd sentence
            if (!this.Items || this.Items.length == 0)
                this.Items = [(this.mySent.text)]; //naplneni obsahu mediaSent
        };
        mediaSent.prototype.play = function () { if (this.myText().loading() || this.myText().passive)
            return; var grp = this.mySent._owner._owner; grp._owner._owner.play(grp.id, this.mySent.begPos); }; //play
        return mediaSent;
    })(mediaActivable);
    Course.mediaSent = mediaSent;
    //********************************************* SND HELPER OBJECTS
    var sndFileGroupImpl = (function (_super) {
        __extends(sndFileGroupImpl, _super);
        function sndFileGroupImpl(data) {
            _super.call(this, data);
            this.medieUrlAdjusted = false;
            if (!this.mediaUrl)
                return;
            var parts = this.mediaUrl.split('@');
            this.mediaUrl = parts[0];
            if (parts.length > 1)
                this.videoFormat = parts[1];
        }
        //allUrl() { return this.mediaUrl; }// this.audioUrl ? this.audioUrl : this.videoUrl; }
        sndFileGroupImpl.prototype.isVideo = function () { return this.videoFormat; };
        //vytvoreni html5 nebo SL driveru a naladovani media souboru
        sndFileGroupImpl.prototype.initProc = function (phase, getTypeOnly, completed) {
            var _this = this;
            switch (phase) {
                case Course.initPhase.afterRender:
                    if (!getTypeOnly) {
                        if (this.isVideo()) {
                            var allVids = (_.map(this.Items, function (gr) { return _.find(gr.myMediaTags, function (t) { return t._tg == CourseModel.tmediaVideo; }); }));
                            var vid = allVids[0];
                            SndLow.createDriver(true, vid.id, '#' + vid.id, null, false, function (dr) {
                                var grp = vid.myGrp();
                                grp._player = dr;
                                _this.adjustMediaUrl(dr); //spocti mediaUrl, videoRatio
                                _.each(allVids, function (v) { return v.ratioClass('embed-responsive-' + _this.videoRatio); }); //nastav velikost videa na strance
                                _this.driverLoaded(dr, function () {
                                    _.each(_.rest(allVids), function (subVid) { return SndLow.createDriver(true, subVid.id, '#' + subVid.id, null, false, function (subDr) {
                                        var subGrp = subVid.myGrp();
                                        subGrp._player = subDr;
                                        subDr.openPlay(_this.mediaUrl, -1, 0);
                                    }); });
                                });
                                completed();
                            });
                        }
                        else
                            SndLow.createDriver(false, this.Items[0].id, null, 'cls-audio-unvisible', false, function (dr) { _this.player = dr; completed(); _this.adjustMediaUrl(dr); _this.driverLoaded(dr); });
                    }
                    return Course.initPhaseType.async;
            }
            return _super.prototype.initProc.call(this, phase, getTypeOnly, completed);
        };
        sndFileGroupImpl.prototype.driverLoaded = function (dr, completed) {
            var _this = this;
            if (completed === void 0) { completed = null; }
            //return; //ladeni loading
            dr.openPlay(this.mediaUrl, -1, 0).done(function () {
                _this.duration = dr.handler.duration;
                _.each(_this.Items, function (grp) {
                    //dosad duration do single sentence grupy (majici endPos=-1)
                    if (grp.withoutCut)
                        grp.Items[0].endPos = grp.Items[0].Items[0].endPos = _this.duration * 1000;
                    grp.loading = false;
                    _.each(grp.myMediaTags, function (t) { return t.loading(false); });
                });
                if (completed)
                    completed();
            });
        };
        sndFileGroupImpl.prototype.adjustMediaUrl = function (dr) {
            if (this.medieUrlAdjusted)
                return;
            this.medieUrlAdjusted = true;
            var start = ((cfg.baseTagUrl ? cfg.baseTagUrl : Pager.basicDir) + this.mediaUrl).toLowerCase();
            //*** audio url
            if (!this.isVideo()) {
                this.mediaUrl = start;
                return;
            }
            //*** video url
            //potrebna extension
            var neededEx;
            switch (dr.type) {
                case LMComLib.SoundPlayerType.SL:
                    neededEx = 'mp4';
                    break;
                case LMComLib.SoundPlayerType.HTML5:
                    if (SndLow.html5_CanPlay(SndLow.media.video_mp4))
                        neededEx = 'mp4';
                    break;
                    if (SndLow.html5_CanPlay(SndLow.media.video_webm))
                        neededEx = 'webm';
                    break;
                    debugger;
                    throw 'Can play neither mp4 nor webm';
                default:
                    debugger;
                    throw 'missing driver';
            }
            //dostupne extensions x size
            var parts = this.videoFormat.split(':');
            this.videoRatio = parts[0];
            parts = parts[1].split('|');
            var sizeExt = [];
            _.each(parts, function (p) {
                var pparts = p.split('-');
                var availableExts = pparts[1].split(',');
                var ext = _.find(availableExts, function (e) { return Utils.endsWith(e, neededEx); });
                if (!ext)
                    return;
                sizeExt.push({ ext: ext, limit: pparts[0] == '*' ? 100000 : parseInt(pparts[0]) });
                return true;
            });
            if (sizeExt.length == 0) {
                debugger;
                throw 'cannot find extension for ext=' + neededEx;
            }
            //najdi optimalni extension dle limitu
            var docWidth = Math.min(10000, $(document).width());
            sizeExt = _.sortBy(sizeExt, function (s) { return s.limit; });
            var res = _.find(sizeExt, function (se) { return docWidth <= se.limit; });
            if (!res)
                res = sizeExt[sizeExt.length - 1];
            this.mediaUrl = start + '.' + res.ext;
        };
        return sndFileGroupImpl;
    })(Course.tagImpl);
    Course.sndFileGroupImpl = sndFileGroupImpl;
    var sndGroupImpl = (function (_super) {
        __extends(sndGroupImpl, _super);
        function sndGroupImpl() {
            _super.apply(this, arguments);
            this.loading = true;
            //notifikace o zmene pozice nebo aktualni sentence
            this.playProgress = ko.observable(0);
            this.actSent = ko.observable(null);
        }
        sndGroupImpl.prototype.player = function () { return this._player ? this._player : this._owner.player; };
        sndGroupImpl.prototype.jsonMLParsed = function () {
            _super.prototype.jsonMLParsed.call(this);
            //jedna grupa, interval i sentence s endPos==-1. Dosazeno v ObjectModel\Model\CourseSchemaDOM.cs, mediaTag.Generate
            this.withoutCut = this.Items.length == 1 && this.Items[0].Items.length == 1 && this.Items[0].Items[0].endPos == -1;
        };
        sndGroupImpl.prototype.pageCreated = function () {
            var _this = this;
            _super.prototype.pageCreated.call(this);
            this.myMediaTags = _.filter(this._owner._owner.allMediaTags, function (m) { return m._sentGroupId == _this.id; });
        };
        return sndGroupImpl;
    })(Course.tagImpl);
    Course.sndGroupImpl = sndGroupImpl;
    var sndIntervalImpl = (function (_super) {
        __extends(sndIntervalImpl, _super);
        function sndIntervalImpl() {
            _super.apply(this, arguments);
        }
        sndIntervalImpl.prototype.jsonMLParsed = function () {
            _super.prototype.jsonMLParsed.call(this);
            this.begPos = this.Items[0].begPos;
            this.endPos = this.Items[this.Items.length - 1].endPos;
        };
        return sndIntervalImpl;
    })(Course.tagImpl);
    Course.sndIntervalImpl = sndIntervalImpl;
    var sndSentImpl = (function (_super) {
        __extends(sndSentImpl, _super);
        function sndSentImpl() {
            _super.apply(this, arguments);
            this.myMediaSents = [];
        }
        return sndSentImpl;
    })(Course.tagImpl);
    Course.sndSentImpl = sndSentImpl;
    var writingImpl = (function (_super) {
        __extends(writingImpl, _super);
        function writingImpl(staticData) {
            _super.call(this, staticData);
            this.textInput = ko.observable();
            this.progressBarValue = ko.observable(0);
            this.progressBarFrom = ko.observable(0);
            this.progressText = ko.observable('');
            this.progressBarLimetExceeded = ko.observable(false);
            this.isDone = ko.observable(false);
            if (!this.limitMin)
                this.limitMin = 0;
            if (!this.limitMax)
                this.limitMax = 0;
            if (!this.limitRecommend)
                this.limitRecommend = 0;
            if (!this.numberOfRows)
                this.numberOfRows = 5;
            if (this.limitRecommend < this.limitMin)
                this.limitRecommend = this.limitMin;
            this.progressBarFrom(!this.limitRecommend ? 0 : (!this.limitMax ? 100 : this.limitRecommend * 100 / this.limitMax));
            var self = this;
            this.textInput.subscribe(function (value) {
                var actMWords = _.filter(DictConnector.startSplitWord(value), function (w) { return !_.isEmpty(w.trim()); }).length;
                var words = Math.max(self.limitMin, self.limitMax);
                if (!words)
                    words = 100;
                var txt = CSLocalize('b8c48a0294c149fabcf83d3098d0b7bd', 'written') + ' ' + Math.round(actMWords) + ' ' + CSLocalize('0ed651b15e15485bb16b9a8f6eba61eb', 'words');
                if (self.limitRecommend > 0 && self.limitMax > 0)
                    txt += ' (' + CSLocalize('816063b2c5e248e98d782e6c72ccb0a7', 'minimum') + ' ' + self.limitRecommend.toString() + ', ' + CSLocalize('c33d47b0e8714300b2a0bbebb5dcc0c5', 'maximum') + ' ' + self.limitMax.toString() + ' ' + CSLocalize('876f5ad503044c2a988f59852eedbe03', 'words') + ')';
                else if (self.limitRecommend > 0)
                    txt += ' (' + CSLocalize('6cfd3dde69134155b12a5613a2bd5e90', 'minimum') + ' ' + self.limitRecommend.toString() + ' ' + CSLocalize('1eec4e5b539348bca19de5d8849b8356', 'words') + ')';
                else if (self.limitMax > 0)
                    txt += ' (' + CSLocalize('00c41ba93408472792afc9af724256eb', 'maximum') + ' ' + self.limitMax.toString() + ' ' + CSLocalize('acc174b843a1481b8a0dea1acee2f35f', 'words') + ')';
                self.progressText(txt);
                self.progressBarLimetExceeded(self.limitMax && actMWords > self.limitMax);
                if (!self.progressBarLimetExceeded() && actMWords > words)
                    self.progressBarFrom(0);
                self.progressBarValue((actMWords > words ? actMWords % words : actMWords) / words * 100);
                self.result.text = value;
                self.result.words = actMWords;
            });
            //var self = this;
            //this.textInput = ko.computed({
            //  read: function () {
            //    return self.result ? self.result.text : '';
            //  },
            //  write: function (value) {
            //    var actMWords = _.filter(DictConnector.startSplitWord(value), w => !_.isEmpty(w.trim())).length;
            //    var words = Math.max(self.wordsMin, self.wordsMax); if (!words) words = 100;
            //    var txt = 'written ' + Math.round(actMWords) + ' words';
            //    if (self.wordsMin > 0 && self.wordsMax > 0) txt += ' (min ' + self.wordsMin.toString() + ', max ' + self.wordsMax.toString() + ' words)';
            //    else if (self.wordsMin > 0) txt += ' (min ' + self.wordsMin.toString() + ' words)';
            //    else if (self.wordsMax > 0) txt += ' (max ' + self.wordsMax.toString() + ' words)';
            //    self.progressText(txt);
            //    self.progressBarLimetExceeded(self.wordsMax && actMWords > self.wordsMax);
            //    if (!self.progressBarLimetExceeded() && actMWords > words) self.progressBarFrom(0);
            //    self.progressBarValue((actMWords > words ? actMWords % words : actMWords) / words * 100);
            //    self.result.text = value; self.result.words = actMWords;
            //  },
            //  owner: this,
            //  pure: true,
            //});
        }
        //humanHelpTxt = ko.observable('');
        writingImpl.prototype.createResult = function (forceEval) { this.done(false); return { ms: 0, s: 0, tg: this._tg, flag: CourseModel.CourseDataFlag.needsEval | CourseModel.CourseDataFlag.pcCannotEvaluate, text: null, words: forceEval ? (this.limitMin ? this.limitMin : 0) : 0, hPercent: -1, hEmail: null, hDate: 0, hLmcomId: 0, hLevel: this.acTestLevel(), hRecommendMin: this.limitRecommend, hMax: this.limitMax, hMin: this.limitMin }; };
        writingImpl.prototype.provideData = function () {
            //this.result.text = this.textInput();
            //this.result.humanPercent = this.human();
            //this.result.words = 
        };
        writingImpl.prototype.acceptData = function (done) {
            _super.prototype.acceptData.call(this, done);
            this.textInput(this.result.text ? this.result.text : '');
            //var txt = this.result.text ? this.result.text : '';
            //$('#' + this.id).find('textarea').val(txt);
            //this.textInput(txt);
            this.human(this.result.hPercent < 0 ? '' : this.result.hPercent.toString());
            var tostr = this.limitMax ? ' - ' + this.limitMax.toString() : '';
            this.humanHelpTxt(this.limitRecommend ? this.limitRecommend.toString() + tostr + ' / ' + this.result.words.toString() : '');
            this.humanLevel(this.result.hLevel);
            //this.textInput.evaluateImmediate();
            //this.textInput.valueHasMutated();
            //var t = this.textInput();
            //if (!t) return;
            //this.textInput.notifySubscribers();
            this.isDone(this.done());
        };
        writingImpl.prototype.setScore = function () {
            if ((this.result.flag & CourseModel.CourseDataFlag.needsEval) == 0 && (this.result.flag & CourseModel.CourseDataFlag.pcCannotEvaluate) != 0) {
                this.result.ms = this.scoreWeight;
                this.result.s = Math.round(this.result.hPercent);
                return;
            }
            var c = this.limitMin && (this.result.words >= this.limitMin);
            this.result.ms = this.scoreWeight;
            this.result.s = c ? this.scoreWeight : 0;
            if (c)
                this.result.flag |= CourseModel.CourseDataFlag.needsEval | CourseModel.CourseDataFlag.pcCannotEvaluate;
            else
                this.result.flag &= ~(CourseModel.CourseDataFlag.needsEval | CourseModel.CourseDataFlag.pcCannotEvaluate) & CourseModel.CourseDataFlag.all;
            //this.result.flag = !c ? 0 : CourseModel.CourseDataFlag.pcCannotEvaluate | CourseModel.CourseDataFlag.needsEval;
        };
        writingImpl.prototype.initProc = function (phase, getTypeOnly, completed) {
            switch (phase) {
                case Course.initPhase.afterRender:
                    if (!getTypeOnly) {
                        var txt = $('#' + this.id).find('textarea');
                        txt.autosize();
                        this.adjustEvalForm();
                    }
                    return Course.initPhaseType.sync;
            }
            return _super.prototype.initProc.call(this, phase, getTypeOnly, completed);
        };
        return writingImpl;
    })(Course.humanEvalControlImpl);
    Course.writingImpl = writingImpl;
    var audioCaptureImpl = (function (_super) {
        __extends(audioCaptureImpl, _super);
        function audioCaptureImpl(staticData) {
            var _this = this;
            _super.call(this, staticData);
            //modal dialog
            this.modalDialogSizeCss = function () { switch (_this.dialogSize) {
                case CourseModel.modalSize.large: return 'modal-lg';
                case CourseModel.modalSize.small: return 'modal-sm';
                default: return '';
            } };
            this.progressBarFrom = ko.observable(0); //hodnota minimalniho casu
            this.progressText = ko.observable(''); //text v baru
            this.progressBarLimetExceeded = ko.observable(false); //pro audioCapture nenastane - zobrazeni cervene pri prekroceni hodnoty
            this.allDisabled = ko.observable(true);
            //stavove info
            this.saveRecordingDisabled = ko.observable(false);
            this.recording = ko.observable(false);
            this.miliseconds = ko.observable(0);
            this.playing = ko.observable(false);
            this.isRecorded = ko.observable(false);
            this.isDone = ko.observable(false);
            if (!this.singleAttempt)
                this.singleAttempt = false;
            if (!this.limitMin)
                this.limitMin = 0;
            if (!this.limitMax)
                this.limitMax = 0;
            if (this.limitMax && this.limitMax < this.limitMin)
                this.limitMax = this.limitMin;
            if (!this.limitRecommend)
                this.limitRecommend = 0;
            if (this.limitMin && this.limitRecommend < this.limitMin)
                this.limitRecommend = this.limitMin;
            //DEBUG
            //this.speakSecondsFrom = 10;
            //this.speakSecondsTo = 15;
            this.iconClass = ko.computed(function () { return "fa-" + (_this.recording() ? 'stop' : 'circle'); });
            this.progressBarFrom(!this.limitRecommend ? 0 : (!this.limitMax ? 100 : this.limitRecommend * 100 / this.limitMax));
            this.progressBarValue = ko.computed(function () {
                if (!_this.recording())
                    return 0; //po this.driver.recordEnd(true) nize muze jeste prijit progressBarValue, coz vadi.
                var actMsecs = _this.miliseconds();
                //vyprseni casu eTestMe sekce behem nahravani -> uloz vysledky a uzavri dialog
                if ((!_this.limitMin || actMsecs >= _this.limitMin * 1000) && testMe.notify && testMe.notify.active() && testMe.notify.remaindSeconds <= 3) {
                    if (_this.modalDialog)
                        _this.modalDialog.modal('hide');
                    _this.driver.recordEnd(true);
                    return 100;
                }
                _this.saveRecordingDisabled(_this.limitMin && actMsecs < _this.limitMin * 1000); //neni dosaeno speakSecondsFrom => disabled Save recording button
                if (_this.limitMax && actMsecs >= _this.limitMax * 1000) {
                    if (_this.modalDialog)
                        _this.modalDialog.modal('hide');
                    _this.driver.recordEnd(true);
                    anim.alert().show(CSLocalize('9259ce32c3a14bb29b657b9430be2f83', 'Maximum time limit reached. Your recording was finished and saved.'), $.noop, function () { return anim.alert().isCancelVisible(false); });
                    return 100;
                }
                var msecs = Math.max(_this.limitMin, _this.limitMax) * 1000;
                if (!msecs)
                    msecs = 60000;
                var txt = CSLocalize('94708246af584ffdacf8dd4c8c4521c8', 'recorded') + ' ' + Utils.formatTimeSpan(actMsecs / 1000);
                if (_this.limitRecommend > 0 && _this.limitMax > 0)
                    txt += ' (' + CSLocalize('23aacf6c308d4ffa95fa6f9cad88285d', 'recommended') + ' ' + Utils.formatTimeSpan(_this.limitRecommend) + ' - ' + Utils.formatTimeSpan(_this.limitMax) + ')';
                else if (_this.limitRecommend > 0)
                    txt += ' (min ' + Utils.formatTimeSpan(_this.limitRecommend) + ')';
                else if (_this.limitMax > 0)
                    txt += ' (max ' + Utils.formatTimeSpan(_this.limitMax) + ')';
                _this.progressText(txt);
                if (actMsecs > msecs)
                    _this.progressBarFrom(0);
                return (actMsecs > msecs ? actMsecs % msecs : actMsecs) / msecs * 100;
            });
        }
        audioCaptureImpl.prototype.initProc = function (phase, getTypeOnly, completed) {
            var _this = this;
            switch (phase) {
                case Course.initPhase.afterRender:
                    if (!getTypeOnly) {
                        if (this.recordInDialog) {
                            this.modalDialog = $('#modal-' + this.id);
                            this.modalContent = this.modalDialog.find('.modal-header');
                            this.modalDialog.on('hide.bs.modal', function () {
                                console.log('audioCaptureImpl: hide.bs.modal');
                                anim.onModalHide(_this.modalDialog);
                                SndLow.Stop(null);
                                delete audioCaptureImpl.activeAudioCapture;
                            }).on('show.bs.modal', function () {
                                console.log('audioCaptureImpl: show.bs.modal');
                                anim.onModalShow(_this.modalDialog);
                                audioCaptureImpl.activeAudioCapture = _this;
                            });
                        }
                        if (this.driver) {
                            completed();
                            return;
                        }
                        SndLow.getGlobalMedia().adjustGlobalDriver(true, function (dr, disabled) {
                            _this.driver = dr;
                            _this.allDisabled(disabled);
                            completed();
                        });
                        this.adjustEvalForm();
                    }
                    return Course.initPhaseType.async;
            }
            return _super.prototype.initProc.call(this, phase, getTypeOnly, completed);
        };
        audioCaptureImpl.saveAudioAndHideModal = function (completed) {
            var act = audioCaptureImpl.activeAudioCapture;
            if (!act) {
                completed();
                return;
            }
            act.driver.recordEnd(true);
            console.log('audioCaptureImpl: modalAudioDriver.recordEnd');
            setTimeout(completed, 500);
        };
        //Eval control
        audioCaptureImpl.prototype.createResult = function (forceEval) { this.done(false); return { ms: 0, s: 0, tg: this._tg, flag: 0, audioUrl: createMediaUrl(this.id), recordedMilisecs: forceEval ? (this.limitMin ? this.limitMin * 1000 : 0) : 0, hPercent: -1, hEmail: null, hDate: 0, hLevel: this.acTestLevel(), hLmcomId: 0, hFrom: this.limitMin, hTo: this.limitMax, hRecommendFrom: this.limitRecommend }; };
        audioCaptureImpl.prototype.provideData = function () {
        };
        audioCaptureImpl.prototype.acceptData = function (done) {
            _super.prototype.acceptData.call(this, done);
            this.isRecorded(this.isRecordLengthCorrect());
            this.isDone(this.done());
            this.human(this.result.hPercent < 0 ? '' : this.result.hPercent.toString());
            var tostr = this.limitMax ? ' - ' + Utils.formatTimeSpan(this.limitMax) : '';
            ;
            this.humanHelpTxt(this.limitRecommend ? Utils.formatTimeSpan(this.limitRecommend) + tostr + ' / ' + Utils.formatTimeSpan(Math.round(this.result.recordedMilisecs / 1000)) : '');
            this.humanLevel(this.result.hLevel);
            //CourseModel.CourseDataFlag.needsEval | CourseModel.CourseDataFlag.pcCannotEvaluate
        };
        audioCaptureImpl.prototype.setScore = function () {
            if ((this.result.flag & CourseModel.CourseDataFlag.needsEval) == 0 && (this.result.flag & CourseModel.CourseDataFlag.pcCannotEvaluate) != 0) {
                this.result.ms = this.scoreWeight;
                this.result.s = Math.round(this.result.hPercent);
                return;
            }
            var c = this.isRecordLengthCorrect();
            this.result.ms = this.scoreWeight;
            this.result.s = c ? this.scoreWeight : 0;
            if (c)
                this.result.flag |= CourseModel.CourseDataFlag.needsEval | CourseModel.CourseDataFlag.pcCannotEvaluate | CourseModel.CourseDataFlag.hasExternalAttachments;
            else
                this.result.flag &= ~(CourseModel.CourseDataFlag.needsEval | CourseModel.CourseDataFlag.pcCannotEvaluate | CourseModel.CourseDataFlag.hasExternalAttachments) & CourseModel.CourseDataFlag.all;
        };
        audioCaptureImpl.prototype.isRecordLengthCorrect = function () { return this.result.recordedMilisecs > 0 && (!this.limitMin || (this.result.recordedMilisecs >= this.limitMin * 1000)); }; //pro 0 x 1 score
        audioCaptureImpl.prototype.setRecorderSound = function (recorderSound) {
            this.driver.openFile(null); //reset driveru
            if (this.recorderSound)
                this.recorderSound.close();
            this.recorderSound = recorderSound;
            //uspesne ukonceni nahravani
            this.result.recordedMilisecs = this.recorderSound ? this.miliseconds() : 0;
            var c = this.isRecordLengthCorrect();
            if (!c)
                this.result.recordedMilisecs = 0;
            this.isRecorded(c);
            //vyjimka pro tuto kontrolku: save stavu cviceni
            this.doProvideData();
            this._myPage.result.userPending = true;
            CourseMeta.lib.saveProduct($.noop);
        };
        audioCaptureImpl.prototype.play = function () {
            var _this = this;
            var wasPaused = this.driver.handler.paused;
            SndLow.Stop(null);
            this.playing(false);
            if (!wasPaused)
                return;
            var url = this.recorderSound ? this.recorderSound.url : ((cfg.baseTagUrl ? cfg.baseTagUrl : Pager.basicDir) + this.result.audioUrl).toLowerCase();
            this.driver.play(url + '?stamp=' + (audioCaptureImpl.playCnt++).toString(), 0, function (msec) { return _this.playing(msec >= 0); });
        };
        audioCaptureImpl.prototype.stopRecording = function () {
            var _this = this;
            setTimeout(function () { return _this.driver.recordEnd(true); }, 500);
        };
        audioCaptureImpl.prototype.record = function () {
            var _this = this;
            var toDiscUrl = this.result.audioUrl;
            if (this.recording())
                this.driver.recordEnd(true);
            else {
                this.miliseconds(0);
                SndLow.Stop(null);
                this.driver.recordStart({
                    toDisc: true,
                    toDiscFileUrl: this.result.audioUrl,
                    toMemoryCompleted: function (mp3Data) {
                        if (_this.modalDialog)
                            _this.modalDialog.modal('hide');
                        _this.setRecorderSound(new SndLow.recordedSound(_this.driver, !toDiscUrl ? mp3Data : Pager.basicDir + toDiscUrl));
                    },
                    actHtml5SampleRate: 0,
                    isRecording: this.recording,
                    miliseconds: this.miliseconds,
                    recordStarting: function () {
                        if (!_this.recordInDialog)
                            return;
                        _this.saveRecordingDisabled(_this.limitMin > 0);
                        if (_this.dialogHeaderId) {
                            _this.modalContent.empty();
                            _this.modalContent.append($('#' + _this.dialogHeaderId).clone());
                        }
                        //this.modalDialog.modal({ backdrop: 'static', keyboard: true });
                        _this.modalDialog.modal('show');
                    },
                    toMemoryCompletedData: null,
                });
            }
        };
        audioCaptureImpl.playCnt = 0;
        return audioCaptureImpl;
    })(Course.humanEvalControlImpl);
    Course.audioCaptureImpl = audioCaptureImpl;
    function createMediaUrl(id) {
        var fn = LMStatus.sessionId.toString() + '-' + new Date().getTime() + '-' + id;
        var hash = Utils.Hash(fn) & 0x0000ffff;
        var part1 = hash >> 8;
        var part2 = hash & 0x000000ff;
        var res = urlBasicPath + part1.toString() + '/' + part2.toString() + '/' + fn + '.mp3';
        return res;
    }
    Course.createMediaUrl = createMediaUrl;
    var urlBasicPath = '/media/';
    //********************************************* SND PAGE
    (function (progressType) {
        progressType[progressType["progress"] = 0] = "progress";
        progressType[progressType["done"] = 1] = "done";
        progressType[progressType["always"] = 2] = "always";
    })(Course.progressType || (Course.progressType = {}));
    var progressType = Course.progressType;
    //sound informace pro jednu stranku
    var sndPageImpl = (function (_super) {
        __extends(sndPageImpl, _super);
        function sndPageImpl() {
            _super.apply(this, arguments);
            //***** ACTIVE management
            this.actSent = null; //aktualni veta
        }
        //constructor(data: CourseModel.tag) { super(data); bindClick(); }
        sndPageImpl.prototype.jsonMLParsed = function () {
            var _this = this;
            _super.prototype.jsonMLParsed.call(this);
            this.grps = {};
            this.sents = {};
            if (!self)
                return;
            _.each(this.Items, function (fgrp) { return _.each(fgrp.Items, function (grp) {
                _this.grps[grp.id] = grp;
                _.each(grp.Items, function (interv) { return _.each(interv.Items, function (sent) { return _this.sents[sent.idx] = sent; }); });
            }); });
        };
        sndPageImpl.prototype.pageCreated = function () {
            _super.prototype.pageCreated.call(this);
            bindClick();
        };
        sndPageImpl.prototype.leave = function () {
            unbindClick();
        };
        //***** PLAY management
        sndPageImpl.prototype.play = function (grpId, begPos) {
            this.onPlay();
            var grp = this.grps[grpId];
            if (grp.loading)
                return;
            if (begPos < 0)
                begPos = grp.Items[0].begPos; //begpos<0 => zacni hrat od zacatku
            var interv = _.find(grp.Items, function (i) { return begPos >= i.begPos && begPos < i.endPos; }); //najdi aktualni interval
            if (interv == null) {
                debugger;
                throw 'interv == null';
            }
            this.playInt(interv, begPos); //hraj prvni interval
        };
        sndPageImpl.prototype.onPlaying = function (interv, msec, context) {
            var _this = this;
            switch (context) {
                case progressType.progress:
                    interv._owner.playProgress(msec);
                    var s = _.find(interv.Items, function (s) { return msec < s.endPos; });
                    this.setActiveSentence(interv._owner, s);
                    break;
                case progressType.done:
                    var intIdx = _.indexOf(interv._owner.Items, interv);
                    if (intIdx < interv._owner.Items.length - 1) {
                        var interv = interv._owner.Items[intIdx + 1];
                        setTimeout(function () { return _this.playInt(interv, interv.begPos); });
                    }
                    break;
                case progressType.always:
                    //SndLow.guiBlocker(false);
                    interv._owner.playProgress(-1);
                    this.setActiveSentence(interv._owner, null);
                    break;
            }
        };
        sndPageImpl.prototype.playInt = function (interv, begPos) {
            var self = this; //var intVar = interv; var bp = begPos;
            interv._owner.player().openPlay(interv._owner._owner.mediaUrl, begPos, interv.endPos).
                progress(function (msec) { return self.onPlaying(interv, msec < begPos ? begPos : msec /*pri zacatku hrani muze byt notifikovana pozice kousek pred zacatkem*/, progressType.progress); }).
                done(function () { return self.onPlaying(interv, -1, progressType.done); }).
                always(function () { return self.onPlaying(interv, -1, progressType.always); }); //uplny konec
        };
        //vstupni procedura do active managmentu
        sndPageImpl.prototype.setActiveSentence = function (grp, s) {
            if (this.actSent == s)
                return;
            Logger.trace_lmsnd('media.ts: sndPageImpl.setActiveSentence, idx=' + (s ? s.idx.toString() : '-1'));
            this.actSent = s;
            grp.actSent(s);
            if (s == null) {
                this.setAllActive(null);
                return;
            }
            var newActive = [];
            _.each(s.myMediaSents, function (ms) {
                newActive.push(ms);
                if (ms._owner._tg == CourseModel.t_mediaReplica)
                    newActive.push((ms._owner));
            });
            newActive.pushArray(s._owner._owner.myMediaTags); //mediaTags
            this.setAllActive(newActive);
        };
        sndPageImpl.prototype.setAllActive = function (newActive) {
            if (!newActive && !this.allActive)
                return; //both null
            if (!newActive) {
                _.each(this.allActive, function (a) { return a.active(false); });
                delete this.allActive;
                return;
            } //newActive null => deactivate allActive
            if (!this.allActive) {
                _.each(newActive, function (a) { return a.active(true); });
                this.allActive = newActive;
                return;
            } //allActive null => activate newActive
            //merge
            var newAllActive = [];
            _.each(this.allActive, function (a) { return delete a['fl']; });
            _.each(this.allActive, function (a) {
                if (_.indexOf(newActive, a) < 0)
                    a.active(false); //deaktivuj 
                else
                    a['fl'] = true; //oznac jako jiz aktivni
            });
            _.each(newActive, function (a) { if (a['fl'])
                delete a['fl'];
            else
                a.active(true); }); //aktivuj zbyle
            this.allActive = newActive;
        };
        sndPageImpl.prototype.htmlClearing = function () {
            Logger.trace_lmsnd('media.ts: htmlClearing');
            unbindClick();
            _.each(this.Items, function (fg) { if (fg.player)
                SndLow.htmlClearing(fg.player.id);
            else
                _.each(fg.Items, function (g) { if (g.player())
                    SndLow.htmlClearing(g.player().id); }); });
        };
        //stop play
        sndPageImpl.prototype.onPlay = function () {
            cancelSoundStop();
            //if (pageSound.inOnPlayTimer != 0) { clearTimeout(pageSound.inOnPlayTimer); pageSound.inOnPlayTimer = 0; }
            inOnPlay = true;
            var self = this;
            setTimeout(function () { inOnPlay = false; }, 10);
        };
        return sndPageImpl;
    })(Course.tagImpl);
    Course.sndPageImpl = sndPageImpl;
    //********************************************* MEDIA PLAYER
    //ovladaci panel (videa apod.)
    var mediaPlayer = (function (_super) {
        __extends(mediaPlayer, _super);
        function mediaPlayer() {
            var _this = this;
            _super.apply(this, arguments);
            this.withoutCut = function () { return _this.myGrp().withoutCut; };
            this.actor = ko.observable('');
            this.speech = ko.observable('');
            this.textVisible = ko.observable(true);
            this.playStop = function () { if (_this.loading())
                return; var driver = _this.myGrp().player(); if (!driver.handler.paused) {
                driver.stop();
            }
            else
                _this.playFromSlider(); };
            this.nextSent = function () { if (_this.loading())
                return; _this.prevNext(false); };
            this.prevSent = function () { if (_this.loading())
                return; _this.prevNext(true); };
            this.toogleText = function () { if (_this.loading())
                return; _this.textVisible(!_this.textVisible()); };
        }
        mediaPlayer.prototype.initProc = function (phase, getTypeOnly, completed) {
            var _this = this;
            switch (phase) {
                case Course.initPhase.afterRender2:
                    if (!getTypeOnly) {
                        var self = this;
                        var grp = self.myGrp();
                        if (grp.Items.length != 1) {
                            debugger;
                            throw 'Only single sound interval is alowed for media-player';
                        }
                        self.slider = $('#' + this.id + '-slider');
                        //http://api.jqueryui.com/slider
                        self.slider.slider({
                            start: function (event, ui) { return grp.player().stop(); },
                            "max": 100000,
                            disabled: true,
                        });
                        grp.playProgress.subscribe(function (msec) {
                            if (msec < 0) {
                                self.playing(false);
                                return;
                            }
                            self.playing(true);
                            self.sliderFromMsec(msec);
                        });
                        grp.actSent.subscribe(function (sent) {
                            if (!sent)
                                return;
                            _this.actSent = sent;
                            _this.speech(sent.text);
                            _this.actor(!sent.actor ? '' : sent.actor + ': ');
                        });
                        self.sliderStart = grp.Items[0].begPos; //???
                        this.loading.subscribe(function (l) { if (!l)
                            self.slider.slider("option", 'disabled', false); });
                        if (completed)
                            completed();
                    }
                    return Course.initPhaseType.async;
            }
            return _super.prototype.initProc.call(this, phase, getTypeOnly, completed);
        };
        mediaPlayer.prototype.playFromSlider = function () {
            this._myPage.sndPage.play(this._sentGroupId, this.msecFromSlider());
        };
        mediaPlayer.prototype.sliderFromMsec = function (msec) { this.slider.slider("option", "value", 100000 * (msec - this.sliderStart) / this.sliderLen()); };
        mediaPlayer.prototype.msecFromSlider = function () { return this.slider.slider("option", "value") * this.sliderLen() / 100000 + this.sliderStart; };
        mediaPlayer.prototype.sliderLen = function () {
            return this.myGrp().Items[0].endPos - this.sliderStart;
        };
        //initProc(phase: initPhase, getTypeOnly: boolean, completed: () => void): initPhaseType {
        //  switch (phase) {
        //    case initPhase.afterRender:
        //      if (!getTypeOnly) {
        //        super.initProc(initPhase.afterRender, false, null);
        //        var self = this;
        //        var grp = this.myGrp();
        //        grp.actSent.subscribe(sent => {
        //          if (!sent) return;
        //          this.actSent = sent;
        //          this.speech(sent.text);
        //          this.actor(!sent.actor ? '' : sent.actor + ': ');
        //        });
        //        completed();
        //      }
        //      return initPhaseType.async;
        //  }
        //  return super.initProc(phase, getTypeOnly, completed);
        //}
        mediaPlayer.prototype.prevNext = function (isPrev) {
            var grp = this.myGrp();
            var newSent;
            if (isPrev && this.actSent && grp.playProgress() - this.actSent.begPos > 500) {
                newSent = this.actSent;
            }
            else {
                var sents = grp.Items[0].Items;
                var actSentIdx = this.actSent ? _.indexOf(sents, this.actSent) : (isPrev ? sents.length - 1 : 0);
                if (isPrev) {
                    if (actSentIdx == 0)
                        return;
                    newSent = sents[actSentIdx - 1];
                }
                else {
                    if (actSentIdx >= sents.length - 1)
                        return;
                    newSent = sents[actSentIdx + 1];
                }
            }
            grp.player().stop();
            this.sliderFromMsec(newSent.begPos);
            grp.actSent(newSent);
        };
        return mediaPlayer;
    })(mediaTagImpl);
    Course.mediaPlayer = mediaPlayer;
    // ******** STATIC
    var inOnPlay = false;
    var inOnPlayTimer = 0;
    function cancelSoundStop() {
        if (inOnPlayTimer != 0) {
            clearTimeout(inOnPlayTimer);
            inOnPlayTimer = 0;
        }
    }
    function bindClick() {
        $('body').bind('click.stopSound', function (ev) {
            if ($(ev.target).closest('.oli-cancel-stop-sound').length > 0)
                return;
            if (inOnPlay)
                return;
            inOnPlayTimer = setTimeout(function () {
                inOnPlayTimer = 0;
                Logger.trace_lmsnd('media.ts: body.click stop');
                SndLow.Stop();
            }, 1);
        });
    }
    function unbindClick() {
        $('body').unbind('click.stopSound');
    }
    CourseModel.registerClassToInterface(CourseModel.meta, CourseModel.t_sndPage, sndPageImpl);
    CourseModel.registerClassToInterface(CourseModel.meta, CourseModel.t_sndFileGroup, sndFileGroupImpl);
    CourseModel.registerClassToInterface(CourseModel.meta, CourseModel.t_sndGroup, sndGroupImpl);
    CourseModel.registerClassToInterface(CourseModel.meta, CourseModel.t_sndInterval, sndIntervalImpl);
    CourseModel.registerClassToInterface(CourseModel.meta, CourseModel.t_sndSent, sndSentImpl);
    CourseModel.registerClassToInterface(CourseModel.meta, CourseModel.tmediaBigMark, mediaBigMark);
    CourseModel.registerClassToInterface(CourseModel.meta, CourseModel.tmediaPlayer, mediaPlayer);
    CourseModel.registerClassToInterface(CourseModel.meta, CourseModel.tmediaText, mediaText);
    CourseModel.registerClassToInterface(CourseModel.meta, CourseModel.tmediaVideo, mediaVideo);
    CourseModel.registerClassToInterface(CourseModel.meta, CourseModel.t_mediaReplica, mediaReplica);
    CourseModel.registerClassToInterface(CourseModel.meta, CourseModel.t_mediaSent, mediaSent);
    CourseModel.registerClassToInterface(CourseModel.meta, CourseModel.trecording, audioCaptureImpl);
    CourseModel.registerClassToInterface(CourseModel.meta, CourseModel.twriting, writingImpl);
})(Course || (Course = {}));

var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Course;
(function (Course) {
    var _evalObj = (function (_super) {
        __extends(_evalObj, _super);
        function _evalObj() {
            _super.apply(this, arguments);
        }
        _evalObj.prototype.controlData = function (id) { return this._myPage.result.result[id]; };
        return _evalObj;
    })(Course.tagImpl);
    Course._evalObj = _evalObj;
    var evalPageImpl = (function (_super) {
        __extends(evalPageImpl, _super);
        function evalPageImpl() {
            _super.apply(this, arguments);
        }
        evalPageImpl.prototype.pageCreated = function () {
            var _this = this;
            _super.prototype.pageCreated.call(this);
            if (this.radioGroups) {
                //provazani radiobutton nebo wordSelection s radio grupou
                var radGrps = {};
                _.each(_.map(this.radioGroups.split('|'), function (str) { return str.split(':'); }), function (kv) { return radGrps[kv[0]] = _.map(kv[1].split(','), function (id) { return (_this._myPage.tags[id]); }); });
                _.each(radGrps, function (radios) { return _.each(radios, function (r) { return r.myEvalGroup = radios; }); });
            }
        };
        evalPageImpl.prototype.provideData = function () {
            _.each(this.Items, function (btn) { return btn.provideData(); }); //btn ma vlastni persistenci
            _.each(this.Items, function (btn) { return _.each(btn.Items, function (grp) { return grp.provideData(); }); }); //persistence podrizenych evalGroupImpl
        };
        evalPageImpl.prototype.acceptData = function (done) {
            _.each(this.Items, function (btn) { return btn.acceptData(done); });
            _.each(this.Items, function (btn) { return _.each(btn.Items, function (grp) { return grp.acceptData(done); }); });
        };
        evalPageImpl.prototype.resetData = function () {
            _.each(this.Items, function (btn) { return btn.resetData(); });
            _.each(this.Items, function (btn) { return _.each(btn.Items, function (grp) { return grp.resetData(); }); });
        };
        evalPageImpl.prototype.getScore = function () {
            var res = { ms: 0, s: 0, flag: 0 };
            _.each(this.Items, function (btn) { return _.each(btn.Items, function (grp) { return addORScore(res, grp.score()); }); });
            return res;
        };
        evalPageImpl.prototype.findBtn = function (b) {
            return _.find(this.Items, function (eb) { return eb.myBtn == b; });
        };
        return evalPageImpl;
    })(_evalObj);
    Course.evalPageImpl = evalPageImpl;
    var evalBtnImpl = (function (_super) {
        __extends(evalBtnImpl, _super);
        function evalBtnImpl() {
            _super.apply(this, arguments);
        }
        evalBtnImpl.prototype.pageCreated = function () {
            _super.prototype.pageCreated.call(this);
            this.myBtn = _.isEmpty(this.btnId) ? null : (this._myPage.tags[this.btnId]);
        };
        evalBtnImpl.prototype.provideData = function () { if (!this.myBtn)
            return; /*this.myBtn.result = this.controlData(this.btnId);*/ this.myBtn.doProvideData(); };
        evalBtnImpl.prototype.acceptData = function (done) { if (!this.myBtn)
            return; /*this.myBtn.result = this.controlData(this.btnId);*/ this.myBtn.acceptData(done); };
        evalBtnImpl.prototype.resetData = function () { if (!this.myBtn)
            return; this.myBtn.resetData(this._myPage.result.result); };
        evalBtnImpl.prototype.click = function (doneResult) {
            var _this = this;
            if (!this.myBtn)
                return null;
            _.each(this.Items, function (grp) {
                if (!doneResult) {
                    grp.resetData();
                    return null;
                }
                else {
                    grp.provideData();
                    var res = createORScoreObj(_.map(_this.Items, function (it) { return it.score(); }));
                    grp.acceptData(true);
                    return res;
                }
            });
            return doneResult ? createORScoreObj(_.map(this.Items, function (it) { return it.score(); })) : null;
        };
        return evalBtnImpl;
    })(_evalObj);
    Course.evalBtnImpl = evalBtnImpl;
    var evalGroupImpl = (function (_super) {
        __extends(evalGroupImpl, _super);
        function evalGroupImpl() {
            _super.apply(this, arguments);
            this.evalControls = [];
        }
        evalGroupImpl.prototype.pageCreated = function () {
            var _this = this;
            _super.prototype.pageCreated.call(this);
            this.evalControls = [];
            _.each(this.evalControlIds, function (t) {
                var ctrl = (_this._myPage.tags[t]);
                _this.evalControls.push(ctrl);
                //ctrl.myEvalGroup = this;
                ctrl.myEvalBtn = _this._owner.myBtn;
            });
        };
        evalGroupImpl.prototype.provideData = function () {
            _.each(this.evalControls, function (c) { return c.doProvideData(); });
            if (this.isExchangeable) {
                var res = this._myPage.result.result[this.id] = this.provideExchangeable();
                this.acceptExchangeable(res);
            }
        };
        evalGroupImpl.prototype.acceptData = function (done) {
            var _this = this;
            if (this.isExchangeable)
                this.acceptExchangeable(this.controlData(this.id));
            _.each(this.evalControls, function (c) { c.result = _this.controlData(c.id); c.acceptData(done); });
        };
        evalGroupImpl.prototype.resetData = function () {
            var _this = this;
            if (this.isExchangeable)
                delete this.controlData[this.id];
            _.each(this.evalControls, function (c) { return c.resetData(_this._myPage.result.result); });
            if (this.isExchangeable)
                this.provideExchangeable();
        };
        evalGroupImpl.prototype.score = function () {
            if (this.isAnd) {
                return createAndScoreObj(_.map(this.evalControls, function (c) { return c.result; }));
            }
            else {
                return createORScoreObj(_.map(this.evalControls, function (c) { return c.result; }));
            }
        };
        evalGroupImpl.prototype.acceptExchangeable = function (res) {
            if (!res || !res.onBehavMap)
                return;
            //adresar vsech eval group edits
            var edits = {};
            _.map(Course.edit.filter(this.evalControls), function (ed) { return edits[ed.id] = ed; });
            //vypln editum jejich onBehav
            for (var p in res.onBehavMap) {
                if (!edits[p]) {
                    delete res.onBehavMap;
                    _.each(edits, function (ed) { return ed.onBehav(ed); });
                    return;
                }
                edits[p].onBehav(edits[res.onBehavMap[p]]);
            }
        };
        evalGroupImpl.prototype.provideExchangeable = function () {
            var res = { tg: undefined, flag: 0, onBehavMap: {}, ms: 0, s: 0 };
            var edits = Course.edit.filter(this.evalControls);
            var isDropDown = edits[0]._tg == CourseModel.tdropDown && !(edits[0]).gapFillLike;
            var resultValue = function (ed) {
                if (!isDropDown)
                    return ed.result.Value;
                if (_.isEmpty(ed.result.Value))
                    return null;
                return ed.source.findDropDownViaId(ed.result.Value.substr(1)).correctValue;
            };
            //normalizovane uzivatelovy odpovedi
            var userVals = _.map(edits, function (e) { return { ed: e, val: resultValue(e), norm: isDropDown ? resultValue(e) : e.doNormalize(resultValue(e)) }; });
            //normalizovane spravne odpovedi
            var corrects = _.map(edits, function (e) { return { ed: e, vals: _.map(e.correctValue.split('|'), function (c) { return isDropDown ? c : e.doNormalize(c); }) }; });
            //jsou vsechny spravne odpovedi rozdilne?
            var corrAll = _.flatten(_.map(corrects, function (c) { return c.vals; }));
            if (_.uniq(corrAll).length < corrAll.length) {
                debugger;
                throw '_.uniq(corrAll).length < corrAll.length';
            }
            //sparovani spravnych odpoved
            for (var i = 0; i < userVals.length; i++) {
                var userVal = userVals[i];
                for (var j = 0; j < corrects.length; j++) {
                    var correct = corrects[j];
                    if (!correct || !_.any(correct.vals, function (v) { return v == userVal.norm; }))
                        continue; //uzivatelova odpoved v spravnych odpovedich nenalezena
                    res.onBehavMap[userVal.ed.id] = correct.ed.id; //nalezena => dosad do persistence
                    userVals[i] = null;
                    corrects[j] = null; //odstran uzivatelovu odpoved i nalezeny edit ze seznamu
                }
                ;
            }
            //pouziti spatnych odpovedi
            _.each(_.zip(_.filter(userVals, function (u) { return !!u; }), _.filter(corrects, function (u) { return !!u; })), function (uc) {
                var userVal = uc[0];
                var correct = uc[1];
                res.onBehavMap[userVal.ed.id] = correct.ed.id;
            });
            //je potreba znova spocitat score
            this.acceptExchangeable(res); //doplni onBehav
            _.each(this.evalControls, function (ctrl) { return ctrl.setScore(); }); //do vysledku dosadi score
            return res;
        };
        return evalGroupImpl;
    })(_evalObj);
    Course.evalGroupImpl = evalGroupImpl;
    function addORScore(res, sc) {
        res.ms += sc.ms;
        res.s += sc.s;
        res.flag |= sc.flag;
    }
    function createORScoreObj(scs) {
        var res = { ms: 0, s: 0, flag: 0 };
        _.each(scs, function (sc) { return addORScore(res, sc); });
        return res;
    }
    function _createAndScoreObj(scs) {
        //var allOK = _.all(this.evalControls, ctrl => ctrl.result.ms == ctrl.result.s);
        //return { ms: 1, s: allOK ? 1 : 0, flag: 0 };
        var res = { ms: 1, s: 1, flag: 0 };
        var hasWrong = false;
        _.each(scs, function (sc) { hasWrong = hasWrong || sc.ms != sc.s; res.flag |= sc.flag; });
        if (hasWrong)
            res.s = 0;
        return res;
    }
    function createAndScoreObj(scs) {
        var res = { ms: 0, s: 0, flag: 0 };
        var cnt = 0;
        _.each(scs, function (sc) { res.ms += sc.ms; res.s += sc.s; res.flag |= sc.flag; cnt++; });
        var ok = res.ms == res.s;
        res.ms = Math.round(res.ms / cnt);
        res.s = ok ? res.ms : 0;
        return res;
    }
    CourseModel.registerClassToInterface(CourseModel.meta, CourseModel.t_evalPage, evalPageImpl);
    CourseModel.registerClassToInterface(CourseModel.meta, CourseModel.t_evalGroup, evalGroupImpl);
    CourseModel.registerClassToInterface(CourseModel.meta, CourseModel.t_evalBtn, evalBtnImpl);
})(Course || (Course = {}));

var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Course;
(function (Course) {
    var checkItem = (function (_super) {
        __extends(checkItem, _super);
        function checkItem(data) {
            var _this = this;
            _super.call(this, data);
            this.yesClick = function () { return _this.clickLow(true); };
            this.noClick = function () { return _this.clickLow(false); };
            this.click = function () { return _this.clickLow(); };
            this.clickLow = function (isYes) {
                if (_this.yes() || _this.no()) {
                    _this.yes(!_this.yes());
                    _this.no(!_this.no());
                }
                else if (isYes === true) {
                    _this.yes(true);
                    _this.no(false);
                }
                else if (isYes === false) {
                    _this.yes(false);
                    _this.no(true);
                }
                else {
                    _this.yes(true);
                    _this.no(false);
                }
            };
            this.yes = ko.observable(false);
            this.no = ko.observable(false);
            this.yesEval = ko.observable('');
            this.noEval = ko.observable('');
            if (this.readOnly || this.skipEvaluation) {
                this.result = this.createResult(false);
            }
            if (!this.textType)
                data.textType = this.textType = CourseModel.CheckItemTexts.yesNo;
            var txt;
            switch (data.textType) {
                case CourseModel.CheckItemTexts.yesNo:
                    txt = CSLocalize('88d6dd9f77994a68a8035f5809c24703', 'Yes|No');
                    break;
                case CourseModel.CheckItemTexts.trueFalse:
                    txt = CSLocalize('7f51a49e0ad14a848362eb7282d62116', 'True|False');
                    break;
                default:
                    txt = null;
                    break;
            }
            if (txt) {
                this.textTypeAsStr = CourseModel.CheckItemTexts[data.textType].toLowerCase();
                var txts = txt.split('|');
                this.trueText = txts[0];
                this.falseText = txts[1];
            }
        }
        checkItem.prototype.createResult = function (forceEval) {
            this.done(false);
            return { ms: 0, s: 0, tg: this._tg, flag: 0, Value: forceEval ? (this.correctValue ? true : false) : undefined };
        };
        checkItem.prototype.provideData = function () {
            if (this.done())
                return;
            if (this.yes())
                this.result.Value = true;
            else if (this.no())
                this.result.Value = false;
            else
                this.result.Value = undefined;
        };
        checkItem.prototype.acceptData = function (done) {
            _super.prototype.acceptData.call(this, done);
            //this.isSkipEvaluation sdili s readonly modem stav done
            if (this.readOnly || (done && this.skipEvaluation)) {
                var val = this.readOnly ? this.initValue : this.boolTothreeState(this.result.Value);
                this.yes(val == CourseModel.threeStateBool.true);
                this.no(val == CourseModel.threeStateBool.false);
                this.yesEval(val == CourseModel.threeStateBool.true ? "black" : "no");
                this.noEval(val == CourseModel.threeStateBool.false ? "black" : "no");
                return;
            }
            if (this.done()) {
                var corrv = this.correctValue ? true : false;
                this.yesEval(this.evalStyle(true, this.result.Value === true, corrv));
                this.noEval(this.evalStyle(false, this.result.Value === false, corrv));
                this.yes(corrv);
                this.no(!corrv);
            }
            else {
                //this.isSkipEvaluation sdili s normalnim modem stav !done
                if (this.result.Value != undefined) {
                    this.yes(this.result.Value);
                    this.no(!this.result.Value);
                }
                else {
                    this.yes(this.initValue == CourseModel.threeStateBool.true);
                    this.no(this.initValue == CourseModel.threeStateBool.false);
                }
            }
        };
        checkItem.prototype.boolTothreeState = function (bool) {
            if (bool === undefined)
                return CourseModel.threeStateBool.no;
            else if (bool === true)
                return CourseModel.threeStateBool.true;
            else
                return CourseModel.threeStateBool.false;
        };
        checkItem.prototype.isCorrect = function () {
            var corrv = this.correctValue === true;
            return this.result.Value === corrv;
        };
        checkItem.prototype.isReadOnly = function () { return this.readOnly; };
        checkItem.prototype.isSkipEvaluation = function () { return this.skipEvaluation; };
        checkItem.prototype.evalStyle = function (isYesPart, partIsChecked, correctValue) {
            if (isYesPart) {
                if (partIsChecked)
                    return correctValue ? "black" : "strike";
                else
                    return correctValue ? "red" : "no";
            }
            else {
                if (partIsChecked)
                    return correctValue ? "strike" : "black";
                else
                    return correctValue ? "no" : "red";
            }
        };
        checkItem.prototype.yesNoEval = function (val) { return this.yesEval() == val || this.noEval() == val; };
        return checkItem;
    })(Course.evalControlImpl);
    Course.checkItem = checkItem;
    CourseModel.registerClassToInterface(CourseModel.meta, CourseModel.tcheckItem, checkItem);
    CourseModel.registerClassToInterface(CourseModel.meta, CourseModel.tcheckBox, checkItem);
})(Course || (Course = {}));

var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Course;
(function (Course) {
    (function (chinhTaskType) {
        chinhTaskType[chinhTaskType["listen"] = 0] = "listen";
        chinhTaskType[chinhTaskType["read"] = 1] = "read";
        chinhTaskType[chinhTaskType["finish"] = 2] = "finish";
    })(Course.chinhTaskType || (Course.chinhTaskType = {}));
    var chinhTaskType = Course.chinhTaskType;
    var chinhSpeaking = (function () {
        function chinhSpeaking(control) {
            var _this = this;
            this.control = control;
            this.actTaskIdx = 0;
            this.remaining = ko.observable(0);
            this.done = ko.observable(false);
            this.actIdx = ko.observable(0);
            this.initProc = function (phase, getTypeOnly, completed) {
                switch (phase) {
                    case Course.initPhase.afterRender:
                        if (!getTypeOnly) {
                            _this.$modal = $('#chinh-speaking-dialog');
                            _this.$modal.click(function () { return false; });
                            _this.$modal.modal({ backdrop: 'static', show: false, keyboard: false });
                            _.each(_this.$modal.find('.modal-body').children(), function (ch) { return $(ch).hide(); });
                        }
                        return Course.initPhaseType.sync;
                }
                return Course.initPhaseType.no;
            };
            Course.extension = this;
            var tasks = control.cdata ? JSON.parse(control.cdata) : {};
            this.tasks = _.map(tasks.tasks, function (t) {
                switch (t.type) {
                    case chinhTaskType.finish: return new ch_finish(t);
                    case chinhTaskType.listen: return new ch_listenAndTalkTask(t);
                    case chinhTaskType.read: return new ch_readAndTalkTask(t);
                    default: throw 'not implemented';
                }
            });
        }
        chinhSpeaking.prototype.getTemplateId = function () { return 'chinhspeaking'; };
        chinhSpeaking.prototype.run = function () {
            var _this = this;
            this.$modal.modal('show');
            setTimeout(function () { return _this.tasks[0].start(); }, 1);
        };
        chinhSpeaking.prototype.runNext = function () {
            Course.extension.actTask().end();
            if (Course.extension.actTaskIdx == Course.extension.tasks.length - 1) {
                Course.extension.$modal.modal('hide');
            }
            else {
                Course.extension.actTaskIdx++;
                Course.extension.actTask().start();
                Course.extension.actIdx(Course.extension.actTaskIdx);
            }
        };
        chinhSpeaking.prototype.actTask = function () { return Course.extension.tasks[Course.extension.actTaskIdx]; };
        chinhSpeaking.prototype.instructionOK = function () { Course.extension.actTask().instructionOK(); };
        return chinhSpeaking;
    })();
    Course.chinhSpeaking = chinhSpeaking;
    Course.extension;
    var ch_task = (function () {
        function ch_task(json) {
            if (json)
                for (var p in json)
                    this[p] = json[p];
        }
        ch_task.prototype.start = function () { };
        ch_task.prototype.end = function () { };
        ch_task.prototype.instructionOK = function () { };
        ch_task.prototype.record = function () {
            var _this = this;
            this.rec.record();
            this.$instr.hide();
            (this.$instr = $('#recording')).show();
            var now = new Date().getTime();
            var recTimer = setInterval(function () {
                if (new Date().getTime() - now < _this.rec.limitMax * 1000)
                    return;
                _this.rec.stopRecording();
                clearInterval(recTimer);
                _this.$instr.hide();
                (_this.$instr = $('#saving-recording')).show();
                setTimeout(function () {
                    _this.$instr.hide();
                    Course.extension.runNext();
                }, 3000);
            }, 500);
        };
        return ch_task;
    })();
    Course.ch_task = ch_task;
    var ch_finish = (function (_super) {
        __extends(ch_finish, _super);
        function ch_finish() {
            _super.apply(this, arguments);
        }
        ch_finish.prototype.start = function () {
            Course.extension.done(true);
            Course.extension.runNext();
        };
        return ch_finish;
    })(ch_task);
    Course.ch_finish = ch_finish;
    var ch_readAndTalkTask = (function (_super) {
        __extends(ch_readAndTalkTask, _super);
        function ch_readAndTalkTask() {
            _super.apply(this, arguments);
        }
        ch_readAndTalkTask.prototype.start = function () {
            var _this = this;
            (this.$taskDiv = $('#' + this.taskDivId)).show();
            this.rec = (Course.extension.control._myPage.getItem(this.recordId));
            //extension.remaining(6);
            Course.extension.remaining(60);
            (this.$instr = $('#thinking')).show();
            var timer = setInterval(function () {
                Course.extension.remaining(Course.extension.remaining() - 1);
                if (Course.extension.remaining() > 0)
                    return;
                clearInterval(timer);
                var mark = (Course.extension.control._myPage.getItem('gong'));
                mark.play();
                setTimeout(function () {
                    $('#' + _this.questId).hide();
                    _this.record();
                }, 1000);
            }, 1000);
        };
        ch_readAndTalkTask.prototype.end = function () {
            this.$taskDiv.hide();
        };
        return ch_readAndTalkTask;
    })(ch_task);
    Course.ch_readAndTalkTask = ch_readAndTalkTask;
    var ch_listenAndTalkTask = (function (_super) {
        __extends(ch_listenAndTalkTask, _super);
        function ch_listenAndTalkTask() {
            _super.apply(this, arguments);
        }
        ch_listenAndTalkTask.prototype.start = function () {
            (this.$instr = $('#instruction1')).show();
        };
        ch_listenAndTalkTask.prototype.end = function () {
            this.$taskDiv.hide();
        };
        ch_listenAndTalkTask.prototype.instructionOK = function () {
            var _this = this;
            this.$instr.hide();
            (this.$instr = $('#playing-question')).show();
            var mark = (Course.extension.control._myPage.getItem(this.questId));
            this.rec = (Course.extension.control._myPage.getItem(this.recordId));
            mark.play();
            var timer = setInterval(function () {
                if (mark.active())
                    return;
                clearInterval(timer);
                _this.$instr.hide();
                _this.record();
            }, 500);
            (this.$taskDiv = $('#' + this.taskDivId)).show();
        };
        return ch_listenAndTalkTask;
    })(ch_task);
    Course.ch_listenAndTalkTask = ch_listenAndTalkTask;
})(Course || (Course = {}));

var docreference;
(function (docreference) {
    var ext = (function () {
        function ext(control) {
            this.control = control;
            this.data = metaJS.metaObj;
            this.pars = control.cdata ? JSON.parse(control.cdata) : {};
        }
        ext.prototype.getTemplateId = function () { return 'docxsd'; };
        return ext;
    })();
    docreference.ext = ext;
})(docreference || (docreference = {}));

var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
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
    //var defaultGreenIcon = 'play'; //Trados.isRtl ? "chevron-left" : "chevron-right"; //ikona zelene sipky
    testMe.alowTestCreate_Url; //priznak, ze je dovoleno vytvorit novy test. Nastavuje se na home pri skoku do testu.
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
                        location.hash = createUrl(testMe.tResult);
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
                                window.location.hash = createUrl(testMe.tResult); //jdi na result stranku
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
            testMe.notify.skillText(act.title);
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
                it.s = 0; th.s += it.s; th.done = th.done && it.done; th.flag |= it.flag; });
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
        return [testMe.appId, type, companyId.toString(), productUrl, persistence].join('@');
    }
    testMe.createUrlPersist = createUrlPersist;
    function createUrlCompl(type, companyId, productUrl) {
        return createUrlPersist(type, companyId, productUrl, CourseMeta.actProductPersistence);
    }
    testMe.createUrlCompl = createUrlCompl;
    function createUrl(type, companyId, productUrl) {
        if (type === void 0) { type = null; }
        if (companyId === void 0) { companyId = 0; }
        if (productUrl === void 0) { productUrl = null; }
        return createUrlCompl(type ? type : testMe.tEx, companyId ? companyId : CourseMeta.actCompanyId, productUrl ? productUrl : CourseMeta.actProduct.url);
        //return [appId, type ? type : tEx, companyId ? companyId : CourseMeta.actCompanyId, productUrl ? productUrl : CourseMeta.actProduct.url].join('@');
    }
    testMe.createUrl = createUrl;
    Pager.registerAppLocator(testMe.appId, testMe.tEx, function (urlParts, completed) { return completed(new Model(urlParts)); });
})(testMe || (testMe = {}));

var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var testMe;
(function (testMe) {
    var ResultLow = (function (_super) {
        __extends(ResultLow, _super);
        function ResultLow() {
            _super.apply(this, arguments);
            this.br = [{ title: schools.homeTitle(), iconId: function () { return 'home'; }, url: '' }];
        }
        ResultLow.prototype.breadcrumbs = function () { return this.br; };
        return ResultLow;
    })(schools.Model);
    testMe.ResultLow = ResultLow;
    var Result = (function (_super) {
        __extends(Result, _super);
        function Result(urlParts) {
            _super.call(this, testMe.tResult, urlParts);
            this.appId = testMe.appId;
        }
        Result.prototype.doUpdate = function (completed) {
            var th = this;
            CourseMeta.lib.actPersistence().loadUserData(schools.LMComUserId(), CourseMeta.actCompanyId, th.productUrl, testMe.testImpl.resultKey, function (data) {
                extendResult(data);
                th.data = data;
                th.br.pushArray([
                    { title: th.data.title, iconId: function () { return 'folder-open'; }, url: testMe.createUrlCompl(testMe.tResults, CourseMeta.actCompanyId, th.productUrl.split('|')[0]) },
                    { title: th.data.subTitleShort(), iconId: function () { return 'puzzle-piece'; }, url: '' }
                ]);
                completed();
            });
        };
        Result.prototype.downloadCert = function () {
            Pager.ajax_download(Pager.path(Pager.pathType.restServices), persistNewEA.createCmd(schools.LMComUserId(), CourseMeta.actCompanyId, this.productUrl, function (cmd) { return cmd.loc = Trados.actLang; }), scorm.Cmd_testCert_Type);
        };
        return Result;
    })(ResultLow);
    testMe.Result = Result;
    var Results = (function (_super) {
        __extends(Results, _super);
        function Results(urlParts) {
            _super.call(this, testMe.tResults, urlParts);
            this.appId = testMe.appId;
        }
        Results.prototype.doUpdate = function (completed) {
            var th = this;
            CourseMeta.lib.actPersistence().testResults(schools.LMComUserId(), CourseMeta.actCompanyId, th.productUrl, function (data) {
                _.each(data, function (r) { return extendResult(r); });
                th.tests = data;
                var cnt = 0;
                _.each(th.tests, function (t) { return t.idx = cnt++; });
                th.barTitle = th.tests[0].title;
                th.br.pushArray([
                    { title: th.barTitle, iconId: function () { return 'folder-open'; }, url: '' }
                ]);
                th.gotoTest = function (idx) { return window.location.hash = testMe.createUrlCompl(testMe.tResult, CourseMeta.actCompanyId, th.productUrl + '|' + th.tests[idx].id.toString()); };
                completed();
            });
        };
        return Results;
    })(ResultLow);
    testMe.Results = Results;
    function extendResult(r) {
        Utils.extendObject(r, [resultImpl]);
        _.each(r.skills, function (s) { return Utils.extendObject(s, [skillResultImpl]); });
    }
    var resultImpl = (function () {
        function resultImpl() {
        }
        resultImpl.prototype.started = function () { return Utils.numToDate(_.min(this.skills, function (sk) { return sk.started; }).started); };
        resultImpl.prototype.finished = function () { return Utils.numToDate(_.max(this.skills, function (sk) { return sk.started; }).finished); };
        resultImpl.prototype.elapsed = function () { var res = 0; _.each(this.skills, function (sk) { return res += sk.elapsed; }); return res; };
        resultImpl.prototype.dateTxt = function () { return resultImpl.dateTxtProc(this.started(), this.finished()); };
        resultImpl.dateTxtProc = function (stDt, finDt) {
            var stD = Globalize.format(stDt, 'd');
            var stT = Globalize.format(stDt, 'H:mm:ss');
            var finD = Globalize.format(finDt, 'd');
            var finT = Globalize.format(finDt, 'H:mm:ss');
            var dtSame = stDt.setHours(0, 0, 0, 0) == finDt.setHours(0, 0, 0, 0);
            return dtSame ? stD + ' (' + stT + ' - ' + finT + ')' : stD + ' ' + stT + ' - ' + finD + ' ' + finT;
        };
        resultImpl.prototype.elapsedTxt = function () { return Utils.formatTimeSpan(this.elapsed()); };
        resultImpl.prototype.interruptsTxt = function () {
            if (!this.interrupts || this.interrupts.length == 0)
                return '0';
            var len = 0;
            _.each(this.interrupts, function (it) { return len += it.end - it.beg; });
            return this.interrupts.length.toString() + 'x, ' + CSLocalize('ee6f54e31d3c4743883b7bf5175867a8', 'duration') + ' ' + Utils.formatTimeSpan(len);
        };
        resultImpl.prototype.ipsTxt = function () {
            var ips = _.map(this.interrupts, function (it) { return it.ip; });
            ips.push(this.ip);
            ips = _.uniq(ips);
            var huge = ips.length > 2;
            ips = ips.slice(0, 2);
            var res = ips.join(', ');
            return huge ? res + ',...' : res;
        };
        resultImpl.prototype.subTitleShort = function () { return Globalize.format(this.started(), 'd'); };
        resultImpl.prototype.subTitleLong = function () { return this.title + ': ' + Globalize.format(this.started(), 'd'); };
        //************ interruprions a IP address
        resultImpl.prototype.hasIntIpData = function () { return this.interrupts && this.interrupts.length > 0; };
        resultImpl.prototype.adjustIntIpData = function () {
            if (this.intIpData)
                return this.intIpData;
            var res = [];
            var temp;
            _.each(this.interrupts, function (it) { return res.push([
                Globalize.format(temp = Utils.numToDate(it.beg), 'd') + ', ' + Globalize.format(temp = Utils.numToDate(it.beg), 'H:mm:ss'),
                Globalize.format(temp = Utils.numToDate(it.end), 'd') + ', ' + Globalize.format(temp = Utils.numToDate(it.end), 'H:mm:ss'),
                Utils.formatTimeSpan(it.end - it.beg),
                it.ip
            ]); });
            return res;
        };
        resultImpl.prototype.adjustIpData = function () {
            if (this.ipData)
                return this.ipData;
            var res = _.uniq(_.map(this.interrupts, function (it) { return it.ip; }));
            res.push(this.ip);
            res = _.uniq(res);
            return res;
        };
        resultImpl.prototype.waitForHuman = function () { return Course.needsHumanEval(this.flag); };
        return resultImpl;
    })();
    testMe.resultImpl = resultImpl;
    var skillResultImpl = (function () {
        function skillResultImpl() {
        }
        skillResultImpl.prototype.dateTxt = function () { return resultImpl.dateTxtProc(Utils.numToDate(this.started), Utils.numToDate(this.finished)); };
        skillResultImpl.prototype.elapsedTxt = function () { return Utils.formatTimeSpan(this.elapsed); };
        skillResultImpl.prototype.skillText = function () { return testMe.Model.skillText(this.skill); };
        skillResultImpl.prototype.waitForHuman = function () { return Course.needsHumanEval(this.flag); };
        skillResultImpl.prototype.score = function () { return Course.scorePercent(this); };
        return skillResultImpl;
    })();
    testMe.skillResultImpl = skillResultImpl;
    Pager.registerAppLocator(testMe.appId, testMe.tResult, function (urlParts, completed) { return completed(new Result(urlParts)); });
    Pager.registerAppLocator(testMe.appId, testMe.tResults, function (urlParts, completed) { return completed(new Results(urlParts)); });
})(testMe || (testMe = {}));

var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var vsNet;
(function (vsNet) {
    var exModelTypeName = "vsNetExModel".toLowerCase();
    var modModelTypeName = "vsNetModModel".toLowerCase();
    var ModModel = (function (_super) {
        __extends(ModModel, _super);
        function ModModel(urlParts) {
            _super.call(this, vsNet.appId, exModelTypeName, urlParts);
            this.url = urlParts[0];
        }
        return ModModel;
    })(Pager.Page);
    vsNet.ModModel = ModModel;
    var ExModel = (function (_super) {
        __extends(ExModel, _super);
        function ExModel(urlParts) {
            _super.call(this, vsNet.appId, exModelTypeName, urlParts);
            this.seeAlsoTemplateSmall = ko.observable("Dummy");
            this.seeAlsoTemplate = ko.observable("Dummy");
            this.exerciseEvaluated = ko.observable(false); //cviceni je vyhodnocenu
            this.score = ko.observable(null);
            this.instrBody = ko.observable(null);
            this.url = urlParts[0];
            ex = null;
            persistMemory.reset();
        }
        ExModel.prototype.update = function (completed) {
            var _this = this;
            var th = this;
            //CourseMeta.lib.adjustInstr(() => { //nacteni a lokalizace Schools\EAData\instructions.json
            CourseMeta.load(th.url, function (pgJsonML) {
                var pg = CourseMeta.extractEx(pgJsonML);
                Course.localize(pg, function (s) { return CourseMeta.localizeString('', s, null); });
                //pg.instrTitle = CourseMeta.localizeString('', pg.instrTitle,null);
                if (!ex) {
                    ex = new CourseMeta.exImpl();
                    ex.type = CourseMeta.runtimeType.ex;
                    ex.url = th.url;
                    CourseMeta.actNode = ex;
                    if (cfg.forceEval) {
                        ex.designForceEval = true;
                        ex.done = true;
                    }
                }
                _this.ex = ex;
                ex.title = pg.title;
                ex.url = pg.url;
                ex.onSetPage(pg, null);
                CourseMeta.lib.displayEx(ex, function (loadedEx) {
                    _this.cpv = new schoolCpv.model(schools.tExCpv, null);
                }, function (loadedEx) {
                    boot.minInit();
                    //napln instrukce
                    CourseMeta.instructions = {};
                    CourseMeta.loadFiles(_.map(th.ex.page.instrs, function (s) { return '..' + s + '.js'; }), function (instrs) {
                        for (var i = 0; i < instrs.length; i++)
                            CourseMeta.finishInstr(th.ex.page.instrs[i], JSON.parse(instrs[i]), {});
                    });
                    //pouzij instrukce
                    th.instrBody(_.map(th.ex.page.instrs, function (s) { var res = CourseMeta.instructions[s.toLowerCase()]; return res ? res : (_.isEmpty(s) ? "" : "Missing [" + s + "] instruction"); }).join());
                    th.refreshExerciseBar();
                });
                //completed();
            });
            //});
        };
        ExModel.prototype.htmlClearing = function () {
            if (CourseMeta.actExPageControl && CourseMeta.actExPageControl.sndPage)
                CourseMeta.actExPageControl.sndPage.htmlClearing();
        };
        ExModel.prototype.title = function () { return this.ex.title; };
        ExModel.prototype.iconId = function () { return 'edit'; };
        ExModel.prototype.resetClick = function () { this.ex.reset(); this.refreshExerciseBar(); };
        ExModel.prototype.evaluateClick = function () { this.ex.evaluate(); this.refreshExerciseBar(); };
        ExModel.prototype.refreshExerciseBar = function () {
            var th = this;
            if (th.ex.done) {
                th.exerciseEvaluated(true);
                th.score(th.ex.page.isPassivePage() /*|| !th.ex.ms*/ ? null : (th.ex.s ? th.ex.s.toString() : '0') + '/' + th.ex.ms.toString());
            }
            else {
                th.exerciseEvaluated(false);
            }
        };
        return ExModel;
    })(Pager.Page);
    vsNet.ExModel = ExModel;
    var ex = null;
    Pager.registerAppLocator(vsNet.appId, exModelTypeName, function (urlParts, completed) { return completed(new ExModel(urlParts)); });
    Pager.registerAppLocator(vsNet.appId, modModelTypeName, function (urlParts, completed) { return completed(new ModModel(urlParts)); });
})(vsNet || (vsNet = {}));

var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var doc;
(function (doc) {
    doc.actMeta;
    //var actMetaUrl: string;
    function init(completed) {
        if (doc.actMeta)
            completed();
        else
            CourseMeta.load('/author/doc', function (jml) {
                doc.actMeta = CourseMeta.jsonML_to_Tag(jml, CourseModel.meta);
                doc.actMeta.typeDir = {};
                _.each(doc.actMeta.types, function (t) { return doc.actMeta.typeDir[t.name.toLowerCase()] = t; });
                doc.actMeta.propDir = {};
                _.each(doc.actMeta.props, function (p) { return doc.actMeta.propDir[(p.ownerType + '.' + p.name).toLowerCase()] = p; });
                _.each(doc.actMeta.props, function (p) { Utils.extendObject(p, [docNamedImpl, propImpl]); p.types = []; }); //init props
                _.each(doc.actMeta.types, function (t) { Utils.extendObject(t, [docNamedImpl, typeImpl]); t.props = _.sortBy(_.map(t.myProps, function (p) { var prop = doc.actMeta.propDir[p.toLowerCase()]; prop.types.push(t); return prop; }), 'name'); });
                _.each(doc.actMeta.props, function (p) { return p.types = _.sortBy(p.types, 'name'); });
                completed();
            });
    }
    doc.init = init;
    //export function finishHtmlDOM() { if (needPrettyPrint) prettyPrint(); } var needPrettyPrint = false;
    var model = (function (_super) {
        __extends(model, _super);
        function model(isHtml, type, urlParts) {
            _super.call(this, doc.appId, type, urlParts);
            this.isHtml = isHtml;
            //this.metaUrl = '/author/doc'; //urlParts ? urlParts[0] : null;
            //if (_.isEmpty(this.metaUrl)) this.metaUrl = '/lm/examples/xref';
        }
        model.prototype.update = function (completed) {
            var _this = this;
            init(function () {
                _this.meta = doc.actMeta;
                _this.createModel(completed);
            });
            //if (actMetaUrl == this.metaUrl) { this.meta = actMeta; this.createModel(completed); setTimeout(() => prettyPrint(), 1); return; }
            //CourseMeta.load(this.metaUrl, (jml: Array<any>) => {
            //  if (_.isEmpty(jml)) { debugger; throw 'missing xref jml on ' + this.metaUrl; }
            //  this.meta = actMeta = CourseMeta.jsonML_to_Tag(jml, CourseModel.meta); actMetaUrl = this.metaUrl;
            //  //finish actMeta
            //  actMeta.typeDir = {}; _.each(actMeta.type_s, t => actMeta.typeDir[t.name.toLowerCase()] = <typeImpl>t);
            //  actMeta.propDir = <any>{}; _.each(actMeta.prop_s, p => actMeta.propDir[(p.ownerType + '.' + p.name).toLowerCase()] = <propImpl>p);
            //  _.each(actMeta.prop_s, p => { Utils.extendObject(p, [docNamedImpl, propImpl]); p.types = []; }); //init props
            //  _.each(actMeta.type_s, t => { Utils.extendObject(t, [docNamedImpl, typeImpl]); t.props = _.sortBy(_.map(t.myProps, p => { var prop = actMeta.propDir[p.toLowerCase()]; prop.types.push(t); return prop; }), 'name'); });
            //  _.each(actMeta.prop_s, p => p.types = _.sortBy(p.types, 'name'));
            //  //examples impl
            //  //_.each([actMeta.prop_s, actMeta.type_s, actMeta.enum_s], arr => _.each(arr, (impl: docNamedImpl) => {
            //  //  if (impl.example_s) _.each(impl.example_s, ex => Utils.extendObject(ex, [docNamedImpl, exampleImpl]));
            //  //}));
            //  //setTimeout(() => prettyPrint(), 1);
            //  this.createModel(completed);
            //});
        };
        model.prototype.createModel = function (completed) { completed(); };
        model.prototype.tags = function () {
            var _this = this;
            return _.filter(this.meta.types, function (t) { return (_this.isHtml ? t.isHtml : !t.isHtml) && !t.isIgn; });
        };
        model.prototype.props = function () {
            return _.sortBy(_.uniq(_.flatten(_.map(this.tags(), function (t) { return t.props; }), true)), 'name');
        };
        model.prototype.isPropsPage = function () { return this.type == propsType; };
        model.prototype.isTypesPage = function () { return this.type == typesType; };
        model.prototype.ishPropsPage = function () { return this.type == hpropsType; };
        model.prototype.ishTypesPage = function () { return this.type == htypesType; };
        model.prototype.isPropPage = function () { return this.type == propType; };
        model.prototype.isTypePage = function () { return this.type == typeType; };
        model.prototype.typesLink = function () { return getHash(typesType); };
        model.prototype.propsLink = function () { return getHash(propsType); };
        model.prototype.htypesLink = function () { return getHash(htypesType); };
        model.prototype.hpropsLink = function () { return getHash(hpropsType); };
        return model;
    })(Pager.Page);
    doc.model = model;
    //********** rejstriky
    var propsModel = (function (_super) {
        __extends(propsModel, _super);
        function propsModel(urlParts) {
            _super.call(this, false, propsType, urlParts);
        }
        propsModel.prototype.childs = function () { return this.props(); };
        return propsModel;
    })(model);
    doc.propsModel = propsModel;
    var typesModel = (function (_super) {
        __extends(typesModel, _super);
        function typesModel(urlParts) {
            _super.call(this, false, typesType, urlParts);
        }
        typesModel.prototype.childs = function () { return this.tags(); };
        return typesModel;
    })(model);
    doc.typesModel = typesModel;
    var hpropsModel = (function (_super) {
        __extends(hpropsModel, _super);
        function hpropsModel(urlParts) {
            _super.call(this, true, hpropsType, urlParts);
        }
        hpropsModel.prototype.childs = function () { return this.props(); };
        return hpropsModel;
    })(model);
    doc.hpropsModel = hpropsModel;
    var htypesModel = (function (_super) {
        __extends(htypesModel, _super);
        function htypesModel(urlParts) {
            _super.call(this, true, htypesType, urlParts);
        }
        htypesModel.prototype.childs = function () { return this.tags(); };
        return htypesModel;
    })(model);
    doc.htypesModel = htypesModel;
    //********** detaily
    var memberModel = (function (_super) {
        __extends(memberModel, _super);
        function memberModel(isProp, type, urlParts) {
            _super.call(this, undefined, type, urlParts);
            this.isProp = isProp;
            this.memberId = urlParts[0].toLowerCase();
            this.unCammelMemberId = Utils.fromCammelCase(urlParts[0]);
        }
        memberModel.prototype.createModel = function (completed) {
            var _this = this;
            if (this.actDocNamedImpl.xref) {
                completed();
                return;
            } //xref
            //doc
            CourseMeta.gui.init();
            var url = ('/lm/docExamples/' + this.unCammelMemberId).toLowerCase();
            CourseMeta.loadResponseScript('author.aspx?mode=compileEx&url=' + url, function (loaded) {
                if (!loaded) {
                    completed();
                    return;
                } //priklad nenalezen
                CourseMeta.load(url, function (pgJsonML) {
                    var pg = CourseMeta.extractEx(pgJsonML);
                    if (!ex) {
                        ex = new CourseMeta.exImpl();
                        ex.type = CourseMeta.runtimeType.ex;
                        ex.url = url;
                        CourseMeta.actNode = ex;
                        if (cfg.forceEval) {
                            ex.designForceEval = true;
                            ex.done = true;
                        }
                    }
                    _this.ex = ex;
                    ex.title = pg.title;
                    ex.url = pg.url;
                    ex.onSetPage(pg, null);
                    CourseMeta.lib.displayEx(ex, null, null);
                });
            });
            completed();
        };
        return memberModel;
    })(model);
    doc.memberModel = memberModel;
    var propModel = (function (_super) {
        __extends(propModel, _super);
        function propModel(urlParts) {
            _super.call(this, true, propType, urlParts);
            this.backUrl = doc.appId + '@' + urlParts[1].replace(/~/g, '@');
        }
        propModel.prototype.createModel = function (completed) {
            this.actDocNamedImpl = this.actImpl = doc.actMeta.propDir[this.memberId];
            _super.prototype.createModel.call(this, completed);
        };
        return propModel;
    })(memberModel);
    doc.propModel = propModel;
    var typeModel = (function (_super) {
        __extends(typeModel, _super);
        function typeModel(urlParts) {
            _super.call(this, false, typeType, urlParts);
        }
        typeModel.prototype.createModel = function (completed) {
            this.actDocNamedImpl = this.actImpl = doc.actMeta.typeDir[this.memberId];
            _super.prototype.createModel.call(this, completed);
        };
        return typeModel;
    })(memberModel);
    doc.typeModel = typeModel;
    //********** rozsireni type a prop interfaces
    //CourseModel.docNamed
    var docNamedImpl = (function (_super) {
        __extends(docNamedImpl, _super);
        function docNamedImpl() {
            _super.apply(this, arguments);
        }
        //styleSheet: string;
        docNamedImpl.prototype.xrefs = function () {
            if (!this._xrefs)
                this._xrefs = this.xref.split('|');
            return this._xrefs;
        };
        //example_s: Array<exampleImpl>;
        //class: string;
        //width: string;
        //style: string;
        docNamedImpl.prototype.actPage = function () { return (Pager.ActPage); };
        docNamedImpl.prototype.title = function () { return Utils.fromCammelCase(this.name); };
        return docNamedImpl;
    })(Course.tagImpl);
    doc.docNamedImpl = docNamedImpl;
    var ex = null;
    var typeImpl = (function (_super) {
        __extends(typeImpl, _super);
        function typeImpl() {
            _super.apply(this, arguments);
        }
        typeImpl.prototype.href = function () { return getHash(typeType, this.name); };
        typeImpl.prototype.codeTitle = function () { return '<' + Utils.fromCammelCase(this.name) + '>'; };
        typeImpl.prototype.childs = function () { return this.props; };
        return typeImpl;
    })(docNamedImpl);
    doc.typeImpl = typeImpl;
    var propImpl = (function (_super) {
        __extends(propImpl, _super);
        function propImpl() {
            _super.apply(this, arguments);
        }
        propImpl.prototype.href = function () { return getHash(propType, this.ownerType + '.' + this.name, this.actPage().type + (this.actPage().urlParts ? '~' + this.actPage().urlParts.join('~') : '')); };
        propImpl.prototype.codeTitle = function () { return Utils.fromCammelCase(this.name) + '=""'; };
        propImpl.prototype.childs = function () {
            var _this = this;
            return _.filter(this.types, function (t) { return (_this.actPage().isHtml ? t.isHtml : !t.isHtml) && !t.isIgn; });
        };
        return propImpl;
    })(docNamedImpl);
    doc.propImpl = propImpl;
    //export class exampleImpl extends docNamedImpl implements CourseModel.docExample {
    //  codeListing: string;
    //  header: CourseModel.tag;
    //  descr: CourseModel.tag;
    //  getCode(): string {
    //    //var c = this.code;
    //    //if (!c || !c.Items || c.Items.length != 1 || !_.isString(c.Items[0])) return '';
    //    //var res: string = <any>(c.Items[0]); res = res.replace(/\n/g, '#@!');
    //    //var div = $("<div>"); div.html(res); res = div.text(); res = res.replace(/#@\!/g, '\r\n');
    //    return this.codeListing;
    //  }
    //}
    var docExample = (function (_super) {
        __extends(docExample, _super);
        function docExample(staticData) {
            _super.call(this, staticData);
        }
        docExample.prototype.initProc = function (phase, getTypeOnly, completed) {
            switch (phase) {
                case Course.initPhase.beforeRender:
                    if (!getTypeOnly) {
                        needPrettyPrint = true;
                    }
                    return Course.initPhaseType.sync;
                case Course.initPhase.afterRender2:
                    if (!getTypeOnly) {
                        if (needPrettyPrint) {
                            //naformatovani XML
                            _.each($('.prettyprint'), function (el) { var $el = $(el); $el.text(beautify($el.text())); });
                            //obarveni XML
                            setTimeout(function () { return prettyPrint(); }, 1);
                        }
                        else
                            needPrettyPrint = false;
                    }
                    return Course.initPhaseType.sync;
            }
            return _super.prototype.initProc.call(this, phase, getTypeOnly, completed);
        };
        docExample.prototype.doCopy = function (self, mode) {
            var dt = (self);
            var xml = mode == 2 ? dt.codePostListing : dt.codeListing;
            var mts = xml.split(extractCode);
            var mt = _.find(mts, function (m) { return m.length > 1 && m.charAt(0) == '&'; });
            xml = $('<div/>').html(mt).text();
            if (mode == 0) {
                var title = dt.header.Items[0].Items[0];
                xml = '<html xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:noNamespaceSchemaLocation="http://www.langmaster.com/new/author/coursemodelschema.xsd">\n<head>\n<title>' + title + '\n</title>\n</head>\n<body>' + xml + '</body>\n</html>';
            }
            xml = beautify(xml);
            anim.alert().lmcdocDlgShow(xml);
            //Utils.toClipboard(xml);
        };
        docExample.prototype.copyPage = function (self) { this.doCopy(self, 0); };
        docExample.prototype.copyFragment = function (self) { this.doCopy(self, 1); };
        docExample.prototype.copyExpanded = function (self) { this.doCopy(self, 2); };
        return docExample;
    })(Course.tagImpl);
    doc.docExample = docExample;
    var extractCode = /[<>]/;
    var needPrettyPrint = false;
    function beautify(xml) {
        var reg = /(>)(<)(\/*)/g;
        var wsexp = / *(.*) +\n/g;
        var contexp = /(<.+>)(.+\n)/g;
        xml = xml.replace(reg, '$1\n$2$3').replace(wsexp, '$1\n').replace(contexp, '$1\n$2');
        var formatted = [];
        var lines = xml.split('\n');
        var indent = 0;
        var lastType = 'other';
        // 4 types of tags - single, closing, opening, other (text, doctype, comment) - 4*4 = 16 transitions 
        var transitions = {
            'single->single': 0,
            'single->closing': -1,
            'single->opening': 0,
            'single->other': 0,
            'closing->single': 0,
            'closing->closing': -1,
            'closing->opening': 0,
            'closing->other': 0,
            'opening->single': 1,
            'opening->closing': 0,
            'opening->opening': 1,
            'opening->other': 1,
            'other->single': 0,
            'other->closing': -1,
            'other->opening': 0,
            'other->other': 0
        };
        for (var i = 0; i < lines.length; i++) {
            var ln = lines[i].trim();
            var single = Boolean(ln.match(/<.+\/>/)); // is this line a single tag? ex. <br />
            var closing = Boolean(ln.match(/<\/.+>/)); // is this a closing tag? ex. </a>
            var opening = Boolean(ln.match(/<[^!].*>/)); // is this even a tag (that's not <!something>)
            var type = single ? 'single' : closing ? 'closing' : opening ? 'opening' : 'other';
            var fromTo = lastType + '->' + type;
            lastType = type;
            indent += transitions[fromTo];
            for (var j = 0; j < indent; j++)
                formatted.push('  ');
            formatted.push(ln);
            formatted.push('\r\n');
        }
        return formatted.join('').trim();
    }
    ;
    //**************
    function getHash(type, url1, url2) {
        if (url1 === void 0) { url1 = null; }
        if (url2 === void 0) { url2 = null; }
        return [doc.appId, type, url1, url2].join('@');
    }
    function Start() {
        CourseMeta.persist = persistMemory.persistCourse;
        Pager.initHash = function () { return cfg.hash ? cfg.hash : getHash(typesType); };
        boot.minInit();
        ViewBase.init();
        $('#splash').hide();
    }
    doc.Start = Start;
    var typesType = "doctypesModel".toLowerCase();
    var propsType = "docpropsModel".toLowerCase();
    var typeType = "doctypeModel".toLowerCase();
    var propType = "docpropModel".toLowerCase();
    var htypesType = "dochtypesModel".toLowerCase();
    var hpropsType = "dochpropsModel".toLowerCase();
    Pager.registerAppLocator(doc.appId, propsType, function (urlParts, completed) { return completed(new propsModel(urlParts)); });
    Pager.registerAppLocator(doc.appId, typesType, function (urlParts, completed) { return completed(new typesModel(urlParts)); });
    Pager.registerAppLocator(doc.appId, propType, function (urlParts, completed) { return completed(new propModel(urlParts)); });
    Pager.registerAppLocator(doc.appId, typeType, function (urlParts, completed) { return completed(new typeModel(urlParts)); });
    Pager.registerAppLocator(doc.appId, hpropsType, function (urlParts, completed) { return completed(new hpropsModel(urlParts)); });
    Pager.registerAppLocator(doc.appId, htypesType, function (urlParts, completed) { return completed(new htypesModel(urlParts)); });
    CourseModel.registerClassToInterface(CourseModel.meta, CourseModel.tdocExample, docExample);
})(doc || (doc = {}));
//prettyPrint()

var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var xref;
(function (xref) {
    xref.valToIdx;
    xref.idxToVal;
    xref.root;
    function pathToClip(url) { Utils.toClipboard((cfg.basicPath == 'q:\\rew\\alpha\\' ? 'p:\\' : cfg.basicPath) + 'rew\\web4' + url.replace(/\//g, '\\') + '.xml'); return false; }
    xref.pathToClip = pathToClip;
    var sitemap;
    var sitemapDir = {};
    function init(completed) {
        if (sitemap)
            completed();
        else
            CourseMeta.load('/author/xrefSitemap', function (jml) {
                var finishSitemap = function (nd) { sitemapDir[nd.uniqId] = nd; _.each(nd.Items, function (n) { n.parent = nd; finishSitemap(n); }); };
                sitemap = CourseMeta.jsonML_to_Tag(jml, CourseMeta.meta);
                finishSitemap(sitemap);
                completed();
            });
    }
    (function (mainTabItem) {
        mainTabItem[mainTabItem["info"] = 0] = "info";
        mainTabItem[mainTabItem["types"] = 1] = "types";
        mainTabItem[mainTabItem["props"] = 2] = "props";
    })(xref.mainTabItem || (xref.mainTabItem = {}));
    var mainTabItem = xref.mainTabItem;
    var model = (function (_super) {
        __extends(model, _super);
        function model(modelType, urlParts) {
            _super.call(this, xref.appId, modelType, urlParts);
            this.refreshError = ko.observable();
            this.refreshText = ko.observable('Refresh');
            xref.root = this;
            if (!urlParts)
                urlParts = [];
            this.nodeId = urlParts[0] ? parseInt(urlParts[0]) : -1;
            this.mainTab = urlParts[1] ? parseInt(urlParts[1]) : mainTabItem.info;
            this.actType = urlParts[2];
            this.actProp = urlParts[3];
            this.propValueIdx = parseInt(urlParts[4]);
        }
        model.prototype.urlContext = function () { return LowUtils.getQueryParams('url'); };
        model.prototype.update = function (completed) {
            var _this = this;
            doc.init(function () { return init(function () {
                _this.sitemap = new sitemapModel(_this); //existuje vzdy
                switch (_this.mainTab) {
                    case mainTabItem.info:
                        completed();
                        return;
                    case mainTabItem.types:
                        _this.typeMap = new typeMapModel(_this); //dostupne types a (je-li zadan typ) jeho dostupne properties
                        _this.typeMap.update(function () {
                            if (_this.type == links) {
                                _this.links = new linksModel(_this); //show links pro typ, prop, propValue
                                _this.links.update(completed);
                            }
                            else if (_this.type == browsePropValues) {
                                _this.propValues = new propValuesModel(_this);
                                _this.propValues.update(completed);
                            }
                            else
                                completed();
                        });
                        return;
                    case mainTabItem.props:
                        _this.propMap = new propMapModel(_this);
                        _this.propMap.update(function () {
                            if (_this.type == links) {
                                _this.links = new linksModel(_this); //show links pro typ, prop, propValue
                                _this.links.update(completed);
                            }
                            else if (_this.type == browsePropValues) {
                                _this.propValues = new propValuesModel(_this);
                                _this.propValues.update(completed);
                            }
                            else
                                completed();
                        });
                        return;
                }
            }); });
        };
        model.prototype.nodeHash = function (nodeId) { return getHash(browse, nodeId, mainTabItem.info); };
        model.prototype.typeHash = function (type) { return getHash(links, this.nodeId, this.mainTab, type); };
        model.prototype.typePropHash = function (prop) { return getHash(links, this.nodeId, this.mainTab, this.actType, prop); };
        model.prototype.typePropValuesHash = function () { return getHash(browsePropValues, this.nodeId, this.mainTab, this.actType, this.actProp); };
        model.prototype.typePropValueHash = function (value) { return getHash(links, this.nodeId, this.mainTab, this.actType, this.actProp, parseInt(value)); };
        model.prototype.propHash = function (prop) { return getHash(links, this.nodeId, this.mainTab, null, prop); };
        model.prototype.propValuesHash = function () { return getHash(browsePropValues, this.nodeId, this.mainTab, null, this.actProp); };
        model.prototype.propValueHash = function (value) { return getHash(links, this.nodeId, this.mainTab, null, this.actProp, parseInt(value)); };
        model.prototype.mainTabHash = function (tab) { return getHash(browse, this.nodeId, tab); };
        //typeLinkHash(): string { return getHash(links, this.nodeId, this.showTypes, this.actType); }
        //propLinkHash(): string { return getHash(links, this.nodeId, this.showTypes, this.actType, this.actProp); }
        //propValueHash(): string { return getHash(browsePropValues, this.nodeId, this.showTypes, this.actType, this.actProp); }
        model.prototype.db_SitemapTabActive = function (tab) { return tab == this.mainTab ? "active" : ""; };
        model.prototype.db_PropTabActive = function (idx) {
            switch (idx) {
                case 0: return this.type == links ? 'active' : '';
                case 1: return (this.type == browse ? 'active' : '') + ' ' + (!_.isEmpty(this.actProp) && (!this.propValueIdx || this.propValueIdx == 0) ? 'show' : 'hide');
            }
        };
        model.prototype.refresh = function () {
            var _this = this;
            this.refreshText('Refreshing...');
            getData(Admin.CmdXrefData_Create(Admin.CmdXrefDataOpers.refreshXref, null, null, null, 0, 0, LowUtils.getQueryParams('url')), function (res) {
                _this.refreshText('Refresh');
                _this.refreshError(res.error);
            });
        };
        return model;
    })(Pager.Page);
    xref.model = model;
    var sitemapModel = (function () {
        function sitemapModel(owner) {
            this.owner = owner;
            this.actNd = !owner.nodeId || owner.nodeId < 0 ? sitemap : sitemapDir[owner.nodeId];
            if (this.actNd == sitemap)
                this.parents = null;
            else {
                var n = this.actNd.parent;
                this.parents = [];
                while (n) {
                    this.parents.push(n);
                    n = n.parent;
                }
                this.parents = this.parents.reverse();
            }
        }
        sitemapModel.prototype.nodeXrefUrl = function () {
            return 'author.aspx?mode=xref&url=' + this.actNd.url;
        };
        sitemapModel.prototype.isProject = function () { return (this.actNd.type & CourseMeta.runtimeType.project) != 0 || _.any(this.parents, function (p) { return (p.type & CourseMeta.runtimeType.project) != 0; }); };
        return sitemapModel;
    })();
    xref.sitemapModel = sitemapModel;
    var typeMapModel = (function () {
        function typeMapModel(owner) {
            this.owner = owner;
        }
        typeMapModel.prototype.update = function (completed) {
            var _this = this;
            nodeTypes(this.owner.nodeId, function (types) {
                _this.types = _.map(_.sortBy(types), function (t) { var meta = CourseModel.meta.types[Utils.fromCammelCase(t)]; return { tag: t, lmtag: !meta || meta.anc != "tag-html" }; });
                if (_this.owner.actType) {
                    typeProps(_this.owner.actType, _this.owner.nodeId, function (props) {
                        _this.props = _.sortBy(props);
                        completed();
                    });
                }
                else
                    completed();
            });
            //completed();
        };
        return typeMapModel;
    })();
    xref.typeMapModel = typeMapModel;
    var propMapModel = (function () {
        function propMapModel(owner) {
            this.owner = owner;
        }
        propMapModel.prototype.update = function (completed) {
            var _this = this;
            nodeProps(this.owner.nodeId, function (props) {
                _this.props = _.sortBy(props);
                completed();
            });
        };
        return propMapModel;
    })();
    xref.propMapModel = propMapModel;
    var linksModel = (function () {
        function linksModel(owner) {
            this.owner = owner;
        }
        linksModel.prototype.update = function (completed) {
            var _this = this;
            if (this.owner.actType) {
                if (this.owner.propValueIdx) {
                    typePropValueLinks(this.owner.actType, this.owner.actProp, this.owner.propValueIdx, this.owner.nodeId, function (links) { _this.links = _.sortBy(links, 'url'); completed(); });
                }
                else if (this.owner.actProp) {
                    typePropLinks(this.owner.actType, this.owner.actProp, this.owner.nodeId, function (links) { _this.links = _.sortBy(links, 'url'); completed(); });
                }
                else {
                    typeLinks(this.owner.actType, this.owner.nodeId, function (links) { _this.links = _.sortBy(links, 'url'); completed(); });
                }
            }
            else {
                if (this.owner.propValueIdx) {
                    propValueLinks(this.owner.actProp, this.owner.propValueIdx, this.owner.nodeId, function (links) { _this.links = _.sortBy(links, 'url'); completed(); });
                }
                else {
                    propLinks(this.owner.actProp, this.owner.nodeId, function (links) { _this.links = _.sortBy(links, 'url'); completed(); });
                }
            }
        };
        return linksModel;
    })();
    xref.linksModel = linksModel;
    var propValuesModel = (function () {
        function propValuesModel(owner) {
            this.owner = owner;
        }
        propValuesModel.prototype.update = function (completed) {
            var _this = this;
            if (this.owner.actType) {
                typePropValues(this.owner.actType, this.owner.actProp, this.owner.nodeId, function (values) {
                    var vals = _.sortBy(values);
                    xref.valToIdx = { dummyValue: 0 };
                    xref.idxToVal = [dummyValue];
                    _this.values = [];
                    _.each(vals, function (v) { xref.valToIdx[v] = xref.idxToVal.length; _this.values.push(xref.idxToVal.length); xref.idxToVal.push(v); });
                    completed();
                });
            }
            else {
                propValues(this.owner.actProp, this.owner.nodeId, function (values) {
                    var vals = _.sortBy(values);
                    xref.valToIdx = { dummyValue: 0 };
                    xref.idxToVal = [dummyValue];
                    _this.values = [];
                    _.each(vals, function (v) { xref.valToIdx[v] = xref.idxToVal.length; _this.values.push(xref.idxToVal.length); xref.idxToVal.push(v); });
                    completed();
                });
            }
        };
        return propValuesModel;
    })();
    xref.propValuesModel = propValuesModel;
    //***** server services
    function nodeTypes(nodeId, completed) {
        getData(Admin.CmdXrefData_Create(Admin.CmdXrefDataOpers.nodeTypes, null, null, null, nodeId, maxLinks, LowUtils.getQueryParams('url')), function (res) { return completed(res.names); });
    }
    function nodeProps(nodeId, completed) {
        getData(Admin.CmdXrefData_Create(Admin.CmdXrefDataOpers.nodeProps, null, null, null, nodeId, maxLinks, LowUtils.getQueryParams('url')), function (res) { return completed(res.names); });
    }
    function typeProps(type, nodeId, completed) {
        getData(Admin.CmdXrefData_Create(Admin.CmdXrefDataOpers.typeProps, type, null, null, nodeId, maxLinks, LowUtils.getQueryParams('url')), function (res) { return completed(res.names); });
    }
    function typePropValues(type, prop, nodeId, completed) {
        getData(Admin.CmdXrefData_Create(Admin.CmdXrefDataOpers.typePropValues, type, prop, null, nodeId, maxLinks, LowUtils.getQueryParams('url')), function (res) { return completed(res.names); });
    }
    function typeLinks(type, nodeId, completed) {
        getData(Admin.CmdXrefData_Create(Admin.CmdXrefDataOpers.typeLinks, type, null, null, nodeId, maxLinks, LowUtils.getQueryParams('url')), function (res) { return completed(res.links); });
    }
    function typePropLinks(type, prop, nodeId, completed) {
        getData(Admin.CmdXrefData_Create(Admin.CmdXrefDataOpers.typePropLinks, type, prop, null, nodeId, maxLinks, LowUtils.getQueryParams('url')), function (res) { return completed(res.links); });
    }
    function typePropValueLinks(type, prop, valIdx, nodeId, completed) {
        getData(Admin.CmdXrefData_Create(Admin.CmdXrefDataOpers.typePropValueLinks, type, prop, xref.idxToVal[valIdx], nodeId, maxLinks, LowUtils.getQueryParams('url')), function (res) { return completed(res.links); });
    }
    function propValues(prop, nodeId, completed) {
        getData(Admin.CmdXrefData_Create(Admin.CmdXrefDataOpers.propValues, null, prop, null, nodeId, maxLinks, LowUtils.getQueryParams('url')), function (res) { return completed(res.names); });
    }
    function propLinks(prop, nodeId, completed) {
        getData(Admin.CmdXrefData_Create(Admin.CmdXrefDataOpers.propLinks, null, prop, null, nodeId, maxLinks, LowUtils.getQueryParams('url')), function (res) { return completed(res.links); });
    }
    function propValueLinks(prop, valIdx, nodeId, completed) {
        getData(Admin.CmdXrefData_Create(Admin.CmdXrefDataOpers.propValueLinks, null, prop, xref.idxToVal[valIdx], nodeId, maxLinks, LowUtils.getQueryParams('url')), function (res) { return completed(res.links); });
    }
    var maxLinks = 500;
    var dummyValue = '&&[[]]';
    function getData(par, completed) {
        Pager.ajaxGet(Pager.pathType.restServices, Admin.CmdXrefData_Type, par, completed);
    }
    //***** navigace
    function getHash(modelType, nodeId, mainTab, type, prop, valueIdx) {
        if (nodeId === void 0) { nodeId = -1; }
        if (mainTab === void 0) { mainTab = 0; }
        if (type === void 0) { type = null; }
        if (prop === void 0) { prop = null; }
        if (valueIdx === void 0) { valueIdx = 0; }
        return [xref.appId, modelType, nodeId.toString(), mainTab.toString(), type, prop, valueIdx ? valueIdx.toString() : '0', LowUtils.getQueryParams('url')].join('@');
    }
    function Start() {
        CourseMeta.persist = persistMemory.persistCourse;
        Pager.initHash = function () { return cfg.hash ? cfg.hash : getHash(browse); };
        boot.minInit();
        ViewBase.init();
        $('#splash').hide();
    }
    xref.Start = Start;
    var browse = "xrefbrowseModel".toLowerCase();
    var browsePropValues = "xrefbrowsePropValuesModel".toLowerCase();
    var links = "xreflinksModel".toLowerCase();
    Pager.registerAppLocator(xref.appId, browse, function (urlParts, completed) { return completed(new model(browse, urlParts)); });
    Pager.registerAppLocator(xref.appId, links, function (urlParts, completed) { return completed(new model(links, urlParts)); });
    Pager.registerAppLocator(xref.appId, browsePropValues, function (urlParts, completed) { return completed(new model(browsePropValues, urlParts)); });
    $.views.helpers({ xref: xref });
})(xref || (xref = {}));

// Copyright (C) 2006 Google Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.


/**
 * @fileoverview
 * some functions for browser-side pretty printing of code contained in html.
 *
 * <p>
 * For a fairly comprehensive set of languages see the
 * <a href="http://google-code-prettify.googlecode.com/svn/trunk/README.html#langs">README</a>
 * file that came with this source.  At a minimum, the lexer should work on a
 * number of languages including C and friends, Java, Python, Bash, SQL, HTML,
 * XML, CSS, Javascript, and Makefiles.  It works passably on Ruby, PHP and Awk
 * and a subset of Perl, but, because of commenting conventions, doesn't work on
 * Smalltalk, Lisp-like, or CAML-like languages without an explicit lang class.
 * <p>
 * Usage: <ol>
 * <li> include this source file in an html page via
 *   {@code <script type="text/javascript" src="/path/to/prettify.js"></script>}
 * <li> define style rules.  See the example page for examples.
 * <li> mark the {@code <pre>} and {@code <code>} tags in your source with
 *    {@code class=prettyprint.}
 *    You can also use the (html deprecated) {@code <xmp>} tag, but the pretty
 *    printer needs to do more substantial DOM manipulations to support that, so
 *    some css styles may not be preserved.
 * </ol>
 * That's it.  I wanted to keep the API as simple as possible, so there's no
 * need to specify which language the code is in, but if you wish, you can add
 * another class to the {@code <pre>} or {@code <code>} element to specify the
 * language, as in {@code <pre class="prettyprint lang-java">}.  Any class that
 * starts with "lang-" followed by a file extension, specifies the file type.
 * See the "lang-*.js" files in this directory for code that implements
 * per-language file handlers.
 * <p>
 * Change log:<br>
 * cbeust, 2006/08/22
 * <blockquote>
 *   Java annotations (start with "@") are now captured as literals ("lit")
 * </blockquote>
 * @requires console
 */

// JSLint declarations
/*global console, document, navigator, setTimeout, window, define */

/** @define {boolean} */
var IN_GLOBAL_SCOPE = true;

/**
 * Split {@code prettyPrint} into multiple timeouts so as not to interfere with
 * UI events.
 * If set to {@code false}, {@code prettyPrint()} is synchronous.
 */
window['PR_SHOULD_USE_CONTINUATION'] = true;

/**
 * Pretty print a chunk of code.
 * @param {string} sourceCodeHtml The HTML to pretty print.
 * @param {string} opt_langExtension The language name to use.
 *     Typically, a filename extension like 'cpp' or 'java'.
 * @param {number|boolean} opt_numberLines True to number lines,
 *     or the 1-indexed number of the first line in sourceCodeHtml.
 * @return {string} code as html, but prettier
 */
var prettyPrintOne;
/**
 * Find all the {@code <pre>} and {@code <code>} tags in the DOM with
 * {@code class=prettyprint} and prettify them.
 *
 * @param {Function} opt_whenDone called when prettifying is done.
 * @param {HTMLElement|HTMLDocument} opt_root an element or document
 *   containing all the elements to pretty print.
 *   Defaults to {@code document.body}.
 */
var prettyPrint;


(function () {
  var win = window;
  // Keyword lists for various languages.
  // We use things that coerce to strings to make them compact when minified
  // and to defeat aggressive optimizers that fold large string constants.
  var FLOW_CONTROL_KEYWORDS = ["break,continue,do,else,for,if,return,while"];
  var C_KEYWORDS = [FLOW_CONTROL_KEYWORDS,"auto,case,char,const,default," + 
      "double,enum,extern,float,goto,inline,int,long,register,short,signed," +
      "sizeof,static,struct,switch,typedef,union,unsigned,void,volatile"];
  var COMMON_KEYWORDS = [C_KEYWORDS,"catch,class,delete,false,import," +
      "new,operator,private,protected,public,this,throw,true,try,typeof"];
  var CPP_KEYWORDS = [COMMON_KEYWORDS,"alignof,align_union,asm,axiom,bool," +
      "concept,concept_map,const_cast,constexpr,decltype,delegate," +
      "dynamic_cast,explicit,export,friend,generic,late_check," +
      "mutable,namespace,nullptr,property,reinterpret_cast,static_assert," +
      "static_cast,template,typeid,typename,using,virtual,where"];
  var JAVA_KEYWORDS = [COMMON_KEYWORDS,
      "abstract,assert,boolean,byte,extends,final,finally,implements,import," +
      "instanceof,interface,null,native,package,strictfp,super,synchronized," +
      "throws,transient"];
  var CSHARP_KEYWORDS = [JAVA_KEYWORDS,
      "as,base,by,checked,decimal,delegate,descending,dynamic,event," +
      "fixed,foreach,from,group,implicit,in,internal,into,is,let," +
      "lock,object,out,override,orderby,params,partial,readonly,ref,sbyte," +
      "sealed,stackalloc,string,select,uint,ulong,unchecked,unsafe,ushort," +
      "var,virtual,where"];
  var COFFEE_KEYWORDS = "all,and,by,catch,class,else,extends,false,finally," +
      "for,if,in,is,isnt,loop,new,no,not,null,of,off,on,or,return,super,then," +
      "throw,true,try,unless,until,when,while,yes";
  var JSCRIPT_KEYWORDS = [COMMON_KEYWORDS,
      "debugger,eval,export,function,get,null,set,undefined,var,with," +
      "Infinity,NaN"];
  var PERL_KEYWORDS = "caller,delete,die,do,dump,elsif,eval,exit,foreach,for," +
      "goto,if,import,last,local,my,next,no,our,print,package,redo,require," +
      "sub,undef,unless,until,use,wantarray,while,BEGIN,END";
  var PYTHON_KEYWORDS = [FLOW_CONTROL_KEYWORDS, "and,as,assert,class,def,del," +
      "elif,except,exec,finally,from,global,import,in,is,lambda," +
      "nonlocal,not,or,pass,print,raise,try,with,yield," +
      "False,True,None"];
  var RUBY_KEYWORDS = [FLOW_CONTROL_KEYWORDS, "alias,and,begin,case,class," +
      "def,defined,elsif,end,ensure,false,in,module,next,nil,not,or,redo," +
      "rescue,retry,self,super,then,true,undef,unless,until,when,yield," +
      "BEGIN,END"];
   var RUST_KEYWORDS = [FLOW_CONTROL_KEYWORDS, "as,assert,const,copy,drop," +
      "enum,extern,fail,false,fn,impl,let,log,loop,match,mod,move,mut,priv," +
      "pub,pure,ref,self,static,struct,true,trait,type,unsafe,use"];
  var SH_KEYWORDS = [FLOW_CONTROL_KEYWORDS, "case,done,elif,esac,eval,fi," +
      "function,in,local,set,then,until"];
  var ALL_KEYWORDS = [
      CPP_KEYWORDS, CSHARP_KEYWORDS, JSCRIPT_KEYWORDS, PERL_KEYWORDS,
      PYTHON_KEYWORDS, RUBY_KEYWORDS, SH_KEYWORDS];
  var C_TYPES = /^(DIR|FILE|vector|(de|priority_)?queue|list|stack|(const_)?iterator|(multi)?(set|map)|bitset|u?(int|float)\d*)\b/;

  // token style names.  correspond to css classes
  /**
   * token style for a string literal
   * @const
   */
  var PR_STRING = 'str';
  /**
   * token style for a keyword
   * @const
   */
  var PR_KEYWORD = 'kwd';
  /**
   * token style for a comment
   * @const
   */
  var PR_COMMENT = 'com';
  /**
   * token style for a type
   * @const
   */
  var PR_TYPE = 'typ';
  /**
   * token style for a literal value.  e.g. 1, null, true.
   * @const
   */
  var PR_LITERAL = 'lit';
  /**
   * token style for a punctuation string.
   * @const
   */
  var PR_PUNCTUATION = 'pun';
  /**
   * token style for plain text.
   * @const
   */
  var PR_PLAIN = 'pln';

  /**
   * token style for an sgml tag.
   * @const
   */
  var PR_TAG = 'tag';
  /**
   * token style for a markup declaration such as a DOCTYPE.
   * @const
   */
  var PR_DECLARATION = 'dec';
  /**
   * token style for embedded source.
   * @const
   */
  var PR_SOURCE = 'src';
  /**
   * token style for an sgml attribute name.
   * @const
   */
  var PR_ATTRIB_NAME = 'atn';
  /**
   * token style for an sgml attribute value.
   * @const
   */
  var PR_ATTRIB_VALUE = 'atv';

  /**
   * A class that indicates a section of markup that is not code, e.g. to allow
   * embedding of line numbers within code listings.
   * @const
   */
  var PR_NOCODE = 'nocode';

  
  
  /**
   * A set of tokens that can precede a regular expression literal in
   * javascript
   * http://web.archive.org/web/20070717142515/http://www.mozilla.org/js/language/js20/rationale/syntax.html
   * has the full list, but I've removed ones that might be problematic when
   * seen in languages that don't support regular expression literals.
   *
   * <p>Specifically, I've removed any keywords that can't precede a regexp
   * literal in a syntactically legal javascript program, and I've removed the
   * "in" keyword since it's not a keyword in many languages, and might be used
   * as a count of inches.
   *
   * <p>The link above does not accurately describe EcmaScript rules since
   * it fails to distinguish between (a=++/b/i) and (a++/b/i) but it works
   * very well in practice.
   *
   * @private
   * @const
   */
  var REGEXP_PRECEDER_PATTERN = '(?:^^\\.?|[+-]|[!=]=?=?|\\#|%=?|&&?=?|\\(|\\*=?|[+\\-]=|->|\\/=?|::?|<<?=?|>>?>?=?|,|;|\\?|@|\\[|~|{|\\^\\^?=?|\\|\\|?=?|break|case|continue|delete|do|else|finally|instanceof|return|throw|try|typeof)\\s*';
  
  // CAVEAT: this does not properly handle the case where a regular
  // expression immediately follows another since a regular expression may
  // have flags for case-sensitivity and the like.  Having regexp tokens
  // adjacent is not valid in any language I'm aware of, so I'm punting.
  // TODO: maybe style special characters inside a regexp as punctuation.

  /**
   * Given a group of {@link RegExp}s, returns a {@code RegExp} that globally
   * matches the union of the sets of strings matched by the input RegExp.
   * Since it matches globally, if the input strings have a start-of-input
   * anchor (/^.../), it is ignored for the purposes of unioning.
   * @param {Array.<RegExp>} regexs non multiline, non-global regexs.
   * @return {RegExp} a global regex.
   */
  function combinePrefixPatterns(regexs) {
    var capturedGroupIndex = 0;
  
    var needToFoldCase = false;
    var ignoreCase = false;
    for (var i = 0, n = regexs.length; i < n; ++i) {
      var regex = regexs[i];
      if (regex.ignoreCase) {
        ignoreCase = true;
      } else if (/[a-z]/i.test(regex.source.replace(
                     /\\u[0-9a-f]{4}|\\x[0-9a-f]{2}|\\[^ux]/gi, ''))) {
        needToFoldCase = true;
        ignoreCase = false;
        break;
      }
    }
  
    var escapeCharToCodeUnit = {
      'b': 8,
      't': 9,
      'n': 0xa,
      'v': 0xb,
      'f': 0xc,
      'r': 0xd
    };
  
    function decodeEscape(charsetPart) {
      var cc0 = charsetPart.charCodeAt(0);
      if (cc0 !== 92 /* \\ */) {
        return cc0;
      }
      var c1 = charsetPart.charAt(1);
      cc0 = escapeCharToCodeUnit[c1];
      if (cc0) {
        return cc0;
      } else if ('0' <= c1 && c1 <= '7') {
        return parseInt(charsetPart.substring(1), 8);
      } else if (c1 === 'u' || c1 === 'x') {
        return parseInt(charsetPart.substring(2), 16);
      } else {
        return charsetPart.charCodeAt(1);
      }
    }
  
    function encodeEscape(charCode) {
      if (charCode < 0x20) {
        return (charCode < 0x10 ? '\\x0' : '\\x') + charCode.toString(16);
      }
      var ch = String.fromCharCode(charCode);
      return (ch === '\\' || ch === '-' || ch === ']' || ch === '^')
          ? "\\" + ch : ch;
    }
  
    function caseFoldCharset(charSet) {
      var charsetParts = charSet.substring(1, charSet.length - 1).match(
          new RegExp(
              '\\\\u[0-9A-Fa-f]{4}'
              + '|\\\\x[0-9A-Fa-f]{2}'
              + '|\\\\[0-3][0-7]{0,2}'
              + '|\\\\[0-7]{1,2}'
              + '|\\\\[\\s\\S]'
              + '|-'
              + '|[^-\\\\]',
              'g'));
      var ranges = [];
      var inverse = charsetParts[0] === '^';
  
      var out = ['['];
      if (inverse) { out.push('^'); }
  
      for (var i = inverse ? 1 : 0, n = charsetParts.length; i < n; ++i) {
        var p = charsetParts[i];
        if (/\\[bdsw]/i.test(p)) {  // Don't muck with named groups.
          out.push(p);
        } else {
          var start = decodeEscape(p);
          var end;
          if (i + 2 < n && '-' === charsetParts[i + 1]) {
            end = decodeEscape(charsetParts[i + 2]);
            i += 2;
          } else {
            end = start;
          }
          ranges.push([start, end]);
          // If the range might intersect letters, then expand it.
          // This case handling is too simplistic.
          // It does not deal with non-latin case folding.
          // It works for latin source code identifiers though.
          if (!(end < 65 || start > 122)) {
            if (!(end < 65 || start > 90)) {
              ranges.push([Math.max(65, start) | 32, Math.min(end, 90) | 32]);
            }
            if (!(end < 97 || start > 122)) {
              ranges.push([Math.max(97, start) & ~32, Math.min(end, 122) & ~32]);
            }
          }
        }
      }
  
      // [[1, 10], [3, 4], [8, 12], [14, 14], [16, 16], [17, 17]]
      // -> [[1, 12], [14, 14], [16, 17]]
      ranges.sort(function (a, b) { return (a[0] - b[0]) || (b[1]  - a[1]); });
      var consolidatedRanges = [];
      var lastRange = [];
      for (var i = 0; i < ranges.length; ++i) {
        var range = ranges[i];
        if (range[0] <= lastRange[1] + 1) {
          lastRange[1] = Math.max(lastRange[1], range[1]);
        } else {
          consolidatedRanges.push(lastRange = range);
        }
      }
  
      for (var i = 0; i < consolidatedRanges.length; ++i) {
        var range = consolidatedRanges[i];
        out.push(encodeEscape(range[0]));
        if (range[1] > range[0]) {
          if (range[1] + 1 > range[0]) { out.push('-'); }
          out.push(encodeEscape(range[1]));
        }
      }
      out.push(']');
      return out.join('');
    }
  
    function allowAnywhereFoldCaseAndRenumberGroups(regex) {
      // Split into character sets, escape sequences, punctuation strings
      // like ('(', '(?:', ')', '^'), and runs of characters that do not
      // include any of the above.
      var parts = regex.source.match(
          new RegExp(
              '(?:'
              + '\\[(?:[^\\x5C\\x5D]|\\\\[\\s\\S])*\\]'  // a character set
              + '|\\\\u[A-Fa-f0-9]{4}'  // a unicode escape
              + '|\\\\x[A-Fa-f0-9]{2}'  // a hex escape
              + '|\\\\[0-9]+'  // a back-reference or octal escape
              + '|\\\\[^ux0-9]'  // other escape sequence
              + '|\\(\\?[:!=]'  // start of a non-capturing group
              + '|[\\(\\)\\^]'  // start/end of a group, or line start
              + '|[^\\x5B\\x5C\\(\\)\\^]+'  // run of other characters
              + ')',
              'g'));
      var n = parts.length;
  
      // Maps captured group numbers to the number they will occupy in
      // the output or to -1 if that has not been determined, or to
      // undefined if they need not be capturing in the output.
      var capturedGroups = [];
  
      // Walk over and identify back references to build the capturedGroups
      // mapping.
      for (var i = 0, groupIndex = 0; i < n; ++i) {
        var p = parts[i];
        if (p === '(') {
          // groups are 1-indexed, so max group index is count of '('
          ++groupIndex;
        } else if ('\\' === p.charAt(0)) {
          var decimalValue = +p.substring(1);
          if (decimalValue) {
            if (decimalValue <= groupIndex) {
              capturedGroups[decimalValue] = -1;
            } else {
              // Replace with an unambiguous escape sequence so that
              // an octal escape sequence does not turn into a backreference
              // to a capturing group from an earlier regex.
              parts[i] = encodeEscape(decimalValue);
            }
          }
        }
      }
  
      // Renumber groups and reduce capturing groups to non-capturing groups
      // where possible.
      for (var i = 1; i < capturedGroups.length; ++i) {
        if (-1 === capturedGroups[i]) {
          capturedGroups[i] = ++capturedGroupIndex;
        }
      }
      for (var i = 0, groupIndex = 0; i < n; ++i) {
        var p = parts[i];
        if (p === '(') {
          ++groupIndex;
          if (!capturedGroups[groupIndex]) {
            parts[i] = '(?:';
          }
        } else if ('\\' === p.charAt(0)) {
          var decimalValue = +p.substring(1);
          if (decimalValue && decimalValue <= groupIndex) {
            parts[i] = '\\' + capturedGroups[decimalValue];
          }
        }
      }
  
      // Remove any prefix anchors so that the output will match anywhere.
      // ^^ really does mean an anchored match though.
      for (var i = 0; i < n; ++i) {
        if ('^' === parts[i] && '^' !== parts[i + 1]) { parts[i] = ''; }
      }
  
      // Expand letters to groups to handle mixing of case-sensitive and
      // case-insensitive patterns if necessary.
      if (regex.ignoreCase && needToFoldCase) {
        for (var i = 0; i < n; ++i) {
          var p = parts[i];
          var ch0 = p.charAt(0);
          if (p.length >= 2 && ch0 === '[') {
            parts[i] = caseFoldCharset(p);
          } else if (ch0 !== '\\') {
            // TODO: handle letters in numeric escapes.
            parts[i] = p.replace(
                /[a-zA-Z]/g,
                function (ch) {
                  var cc = ch.charCodeAt(0);
                  return '[' + String.fromCharCode(cc & ~32, cc | 32) + ']';
                });
          }
        }
      }
  
      return parts.join('');
    }
  
    var rewritten = [];
    for (var i = 0, n = regexs.length; i < n; ++i) {
      var regex = regexs[i];
      if (regex.global || regex.multiline) { throw new Error('' + regex); }
      rewritten.push(
          '(?:' + allowAnywhereFoldCaseAndRenumberGroups(regex) + ')');
    }
  
    return new RegExp(rewritten.join('|'), ignoreCase ? 'gi' : 'g');
  }

  /**
   * Split markup into a string of source code and an array mapping ranges in
   * that string to the text nodes in which they appear.
   *
   * <p>
   * The HTML DOM structure:</p>
   * <pre>
   * (Element   "p"
   *   (Element "b"
   *     (Text  "print "))       ; #1
   *   (Text    "'Hello '")      ; #2
   *   (Element "br")            ; #3
   *   (Text    "  + 'World';")) ; #4
   * </pre>
   * <p>
   * corresponds to the HTML
   * {@code <p><b>print </b>'Hello '<br>  + 'World';</p>}.</p>
   *
   * <p>
   * It will produce the output:</p>
   * <pre>
   * {
   *   sourceCode: "print 'Hello '\n  + 'World';",
   *   //                     1          2
   *   //           012345678901234 5678901234567
   *   spans: [0, #1, 6, #2, 14, #3, 15, #4]
   * }
   * </pre>
   * <p>
   * where #1 is a reference to the {@code "print "} text node above, and so
   * on for the other text nodes.
   * </p>
   *
   * <p>
   * The {@code} spans array is an array of pairs.  Even elements are the start
   * indices of substrings, and odd elements are the text nodes (or BR elements)
   * that contain the text for those substrings.
   * Substrings continue until the next index or the end of the source.
   * </p>
   *
   * @param {Node} node an HTML DOM subtree containing source-code.
   * @param {boolean} isPreformatted true if white-space in text nodes should
   *    be considered significant.
   * @return {Object} source code and the text nodes in which they occur.
   */
  function extractSourceSpans(node, isPreformatted) {
    var nocode = /(?:^|\s)nocode(?:\s|$)/;
  
    var chunks = [];
    var length = 0;
    var spans = [];
    var k = 0;
  
    function walk(node) {
      var type = node.nodeType;
      if (type == 1) {  // Element
        if (nocode.test(node.className)) { return; }
        for (var child = node.firstChild; child; child = child.nextSibling) {
          walk(child);
        }
        var nodeName = node.nodeName.toLowerCase();
        if ('br' === nodeName || 'li' === nodeName) {
          chunks[k] = '\n';
          spans[k << 1] = length++;
          spans[(k++ << 1) | 1] = node;
        }
      } else if (type == 3 || type == 4) {  // Text
        var text = node.nodeValue;
        if (text.length) {
          if (!isPreformatted) {
            text = text.replace(/[ \t\r\n]+/g, ' ');
          } else {
            text = text.replace(/\r\n?/g, '\n');  // Normalize newlines.
          }
          // TODO: handle tabs here?
          chunks[k] = text;
          spans[k << 1] = length;
          length += text.length;
          spans[(k++ << 1) | 1] = node;
        }
      }
    }
  
    walk(node);
  
    return {
      sourceCode: chunks.join('').replace(/\n$/, ''),
      spans: spans
    };
  }

  /**
   * Apply the given language handler to sourceCode and add the resulting
   * decorations to out.
   * @param {number} basePos the index of sourceCode within the chunk of source
   *    whose decorations are already present on out.
   */
  function appendDecorations(basePos, sourceCode, langHandler, out) {
    if (!sourceCode) { return; }
    var job = {
      sourceCode: sourceCode,
      basePos: basePos
    };
    langHandler(job);
    out.push.apply(out, job.decorations);
  }

  var notWs = /\S/;

  /**
   * Given an element, if it contains only one child element and any text nodes
   * it contains contain only space characters, return the sole child element.
   * Otherwise returns undefined.
   * <p>
   * This is meant to return the CODE element in {@code <pre><code ...>} when
   * there is a single child element that contains all the non-space textual
   * content, but not to return anything where there are multiple child elements
   * as in {@code <pre><code>...</code><code>...</code></pre>} or when there
   * is textual content.
   */
  function childContentWrapper(element) {
    var wrapper = undefined;
    for (var c = element.firstChild; c; c = c.nextSibling) {
      var type = c.nodeType;
      wrapper = (type === 1)  // Element Node
          ? (wrapper ? element : c)
          : (type === 3)  // Text Node
          ? (notWs.test(c.nodeValue) ? element : wrapper)
          : wrapper;
    }
    return wrapper === element ? undefined : wrapper;
  }

  /** Given triples of [style, pattern, context] returns a lexing function,
    * The lexing function interprets the patterns to find token boundaries and
    * returns a decoration list of the form
    * [index_0, style_0, index_1, style_1, ..., index_n, style_n]
    * where index_n is an index into the sourceCode, and style_n is a style
    * constant like PR_PLAIN.  index_n-1 <= index_n, and style_n-1 applies to
    * all characters in sourceCode[index_n-1:index_n].
    *
    * The stylePatterns is a list whose elements have the form
    * [style : string, pattern : RegExp, DEPRECATED, shortcut : string].
    *
    * Style is a style constant like PR_PLAIN, or can be a string of the
    * form 'lang-FOO', where FOO is a language extension describing the
    * language of the portion of the token in $1 after pattern executes.
    * E.g., if style is 'lang-lisp', and group 1 contains the text
    * '(hello (world))', then that portion of the token will be passed to the
    * registered lisp handler for formatting.
    * The text before and after group 1 will be restyled using this decorator
    * so decorators should take care that this doesn't result in infinite
    * recursion.  For example, the HTML lexer rule for SCRIPT elements looks
    * something like ['lang-js', /<[s]cript>(.+?)<\/script>/].  This may match
    * '<script>foo()<\/script>', which would cause the current decorator to
    * be called with '<script>' which would not match the same rule since
    * group 1 must not be empty, so it would be instead styled as PR_TAG by
    * the generic tag rule.  The handler registered for the 'js' extension would
    * then be called with 'foo()', and finally, the current decorator would
    * be called with '<\/script>' which would not match the original rule and
    * so the generic tag rule would identify it as a tag.
    *
    * Pattern must only match prefixes, and if it matches a prefix, then that
    * match is considered a token with the same style.
    *
    * Context is applied to the last non-whitespace, non-comment token
    * recognized.
    *
    * Shortcut is an optional string of characters, any of which, if the first
    * character, gurantee that this pattern and only this pattern matches.
    *
    * @param {Array} shortcutStylePatterns patterns that always start with
    *   a known character.  Must have a shortcut string.
    * @param {Array} fallthroughStylePatterns patterns that will be tried in
    *   order if the shortcut ones fail.  May have shortcuts.
    *
    * @return {function (Object)} a
    *   function that takes source code and returns a list of decorations.
    */
  function createSimpleLexer(shortcutStylePatterns, fallthroughStylePatterns) {
    var shortcuts = {};
    var tokenizer;
    (function () {
      var allPatterns = shortcutStylePatterns.concat(fallthroughStylePatterns);
      var allRegexs = [];
      var regexKeys = {};
      for (var i = 0, n = allPatterns.length; i < n; ++i) {
        var patternParts = allPatterns[i];
        var shortcutChars = patternParts[3];
        if (shortcutChars) {
          for (var c = shortcutChars.length; --c >= 0;) {
            shortcuts[shortcutChars.charAt(c)] = patternParts;
          }
        }
        var regex = patternParts[1];
        var k = '' + regex;
        if (!regexKeys.hasOwnProperty(k)) {
          allRegexs.push(regex);
          regexKeys[k] = null;
        }
      }
      allRegexs.push(/[\0-\uffff]/);
      tokenizer = combinePrefixPatterns(allRegexs);
    })();

    var nPatterns = fallthroughStylePatterns.length;

    /**
     * Lexes job.sourceCode and produces an output array job.decorations of
     * style classes preceded by the position at which they start in
     * job.sourceCode in order.
     *
     * @param {Object} job an object like <pre>{
     *    sourceCode: {string} sourceText plain text,
     *    basePos: {int} position of job.sourceCode in the larger chunk of
     *        sourceCode.
     * }</pre>
     */
    var decorate = function (job) {
      var sourceCode = job.sourceCode, basePos = job.basePos;
      /** Even entries are positions in source in ascending order.  Odd enties
        * are style markers (e.g., PR_COMMENT) that run from that position until
        * the end.
        * @type {Array.<number|string>}
        */
      var decorations = [basePos, PR_PLAIN];
      var pos = 0;  // index into sourceCode
      var tokens = sourceCode.match(tokenizer) || [];
      var styleCache = {};

      for (var ti = 0, nTokens = tokens.length; ti < nTokens; ++ti) {
        var token = tokens[ti];
        var style = styleCache[token];
        var match = void 0;

        var isEmbedded;
        if (typeof style === 'string') {
          isEmbedded = false;
        } else {
          var patternParts = shortcuts[token.charAt(0)];
          if (patternParts) {
            match = token.match(patternParts[1]);
            style = patternParts[0];
          } else {
            for (var i = 0; i < nPatterns; ++i) {
              patternParts = fallthroughStylePatterns[i];
              match = token.match(patternParts[1]);
              if (match) {
                style = patternParts[0];
                break;
              }
            }

            if (!match) {  // make sure that we make progress
              style = PR_PLAIN;
            }
          }

          isEmbedded = style.length >= 5 && 'lang-' === style.substring(0, 5);
          if (isEmbedded && !(match && typeof match[1] === 'string')) {
            isEmbedded = false;
            style = PR_SOURCE;
          }

          if (!isEmbedded) { styleCache[token] = style; }
        }

        var tokenStart = pos;
        pos += token.length;

        if (!isEmbedded) {
          decorations.push(basePos + tokenStart, style);
        } else {  // Treat group 1 as an embedded block of source code.
          var embeddedSource = match[1];
          var embeddedSourceStart = token.indexOf(embeddedSource);
          var embeddedSourceEnd = embeddedSourceStart + embeddedSource.length;
          if (match[2]) {
            // If embeddedSource can be blank, then it would match at the
            // beginning which would cause us to infinitely recurse on the
            // entire token, so we catch the right context in match[2].
            embeddedSourceEnd = token.length - match[2].length;
            embeddedSourceStart = embeddedSourceEnd - embeddedSource.length;
          }
          var lang = style.substring(5);
          // Decorate the left of the embedded source
          appendDecorations(
              basePos + tokenStart,
              token.substring(0, embeddedSourceStart),
              decorate, decorations);
          // Decorate the embedded source
          appendDecorations(
              basePos + tokenStart + embeddedSourceStart,
              embeddedSource,
              langHandlerForExtension(lang, embeddedSource),
              decorations);
          // Decorate the right of the embedded section
          appendDecorations(
              basePos + tokenStart + embeddedSourceEnd,
              token.substring(embeddedSourceEnd),
              decorate, decorations);
        }
      }
      job.decorations = decorations;
    };
    return decorate;
  }

  /** returns a function that produces a list of decorations from source text.
    *
    * This code treats ", ', and ` as string delimiters, and \ as a string
    * escape.  It does not recognize perl's qq() style strings.
    * It has no special handling for double delimiter escapes as in basic, or
    * the tripled delimiters used in python, but should work on those regardless
    * although in those cases a single string literal may be broken up into
    * multiple adjacent string literals.
    *
    * It recognizes C, C++, and shell style comments.
    *
    * @param {Object} options a set of optional parameters.
    * @return {function (Object)} a function that examines the source code
    *     in the input job and builds the decoration list.
    */
  function sourceDecorator(options) {
    var shortcutStylePatterns = [], fallthroughStylePatterns = [];
    if (options['tripleQuotedStrings']) {
      // '''multi-line-string''', 'single-line-string', and double-quoted
      shortcutStylePatterns.push(
          [PR_STRING,  /^(?:\'\'\'(?:[^\'\\]|\\[\s\S]|\'{1,2}(?=[^\']))*(?:\'\'\'|$)|\"\"\"(?:[^\"\\]|\\[\s\S]|\"{1,2}(?=[^\"]))*(?:\"\"\"|$)|\'(?:[^\\\']|\\[\s\S])*(?:\'|$)|\"(?:[^\\\"]|\\[\s\S])*(?:\"|$))/,
           null, '\'"']);
    } else if (options['multiLineStrings']) {
      // 'multi-line-string', "multi-line-string"
      shortcutStylePatterns.push(
          [PR_STRING,  /^(?:\'(?:[^\\\']|\\[\s\S])*(?:\'|$)|\"(?:[^\\\"]|\\[\s\S])*(?:\"|$)|\`(?:[^\\\`]|\\[\s\S])*(?:\`|$))/,
           null, '\'"`']);
    } else {
      // 'single-line-string', "single-line-string"
      shortcutStylePatterns.push(
          [PR_STRING,
           /^(?:\'(?:[^\\\'\r\n]|\\.)*(?:\'|$)|\"(?:[^\\\"\r\n]|\\.)*(?:\"|$))/,
           null, '"\'']);
    }
    if (options['verbatimStrings']) {
      // verbatim-string-literal production from the C# grammar.  See issue 93.
      fallthroughStylePatterns.push(
          [PR_STRING, /^@\"(?:[^\"]|\"\")*(?:\"|$)/, null]);
    }
    var hc = options['hashComments'];
    if (hc) {
      if (options['cStyleComments']) {
        if (hc > 1) {  // multiline hash comments
          shortcutStylePatterns.push(
              [PR_COMMENT, /^#(?:##(?:[^#]|#(?!##))*(?:###|$)|.*)/, null, '#']);
        } else {
          // Stop C preprocessor declarations at an unclosed open comment
          shortcutStylePatterns.push(
              [PR_COMMENT, /^#(?:(?:define|e(?:l|nd)if|else|error|ifn?def|include|line|pragma|undef|warning)\b|[^\r\n]*)/,
               null, '#']);
        }
        // #include <stdio.h>
        fallthroughStylePatterns.push(
            [PR_STRING,
             /^<(?:(?:(?:\.\.\/)*|\/?)(?:[\w-]+(?:\/[\w-]+)+)?[\w-]+\.h(?:h|pp|\+\+)?|[a-z]\w*)>/,
             null]);
      } else {
        shortcutStylePatterns.push([PR_COMMENT, /^#[^\r\n]*/, null, '#']);
      }
    }
    if (options['cStyleComments']) {
      fallthroughStylePatterns.push([PR_COMMENT, /^\/\/[^\r\n]*/, null]);
      fallthroughStylePatterns.push(
          [PR_COMMENT, /^\/\*[\s\S]*?(?:\*\/|$)/, null]);
    }
    var regexLiterals = options['regexLiterals'];
    if (regexLiterals) {
      /**
       * @const
       */
      var regexExcls = regexLiterals > 1
        ? ''  // Multiline regex literals
        : '\n\r';
      /**
       * @const
       */
      var regexAny = regexExcls ? '.' : '[\\S\\s]';
      /**
       * @const
       */
      var REGEX_LITERAL = (
          // A regular expression literal starts with a slash that is
          // not followed by * or / so that it is not confused with
          // comments.
          '/(?=[^/*' + regexExcls + '])'
          // and then contains any number of raw characters,
          + '(?:[^/\\x5B\\x5C' + regexExcls + ']'
          // escape sequences (\x5C),
          +    '|\\x5C' + regexAny
          // or non-nesting character sets (\x5B\x5D);
          +    '|\\x5B(?:[^\\x5C\\x5D' + regexExcls + ']'
          +             '|\\x5C' + regexAny + ')*(?:\\x5D|$))+'
          // finally closed by a /.
          + '/');
      fallthroughStylePatterns.push(
          ['lang-regex',
           RegExp('^' + REGEXP_PRECEDER_PATTERN + '(' + REGEX_LITERAL + ')')
           ]);
    }

    var types = options['types'];
    if (types) {
      fallthroughStylePatterns.push([PR_TYPE, types]);
    }

    var keywords = ("" + options['keywords']).replace(/^ | $/g, '');
    if (keywords.length) {
      fallthroughStylePatterns.push(
          [PR_KEYWORD,
           new RegExp('^(?:' + keywords.replace(/[\s,]+/g, '|') + ')\\b'),
           null]);
    }

    shortcutStylePatterns.push([PR_PLAIN,       /^\s+/, null, ' \r\n\t\xA0']);

    var punctuation =
      // The Bash man page says

      // A word is a sequence of characters considered as a single
      // unit by GRUB. Words are separated by metacharacters,
      // which are the following plus space, tab, and newline: { }
      // | & $ ; < >
      // ...
      
      // A word beginning with # causes that word and all remaining
      // characters on that line to be ignored.

      // which means that only a '#' after /(?:^|[{}|&$;<>\s])/ starts a
      // comment but empirically
      // $ echo {#}
      // {#}
      // $ echo \$#
      // $#
      // $ echo }#
      // }#

      // so /(?:^|[|&;<>\s])/ is more appropriate.

      // http://gcc.gnu.org/onlinedocs/gcc-2.95.3/cpp_1.html#SEC3
      // suggests that this definition is compatible with a
      // default mode that tries to use a single token definition
      // to recognize both bash/python style comments and C
      // preprocessor directives.

      // This definition of punctuation does not include # in the list of
      // follow-on exclusions, so # will not be broken before if preceeded
      // by a punctuation character.  We could try to exclude # after
      // [|&;<>] but that doesn't seem to cause many major problems.
      // If that does turn out to be a problem, we should change the below
      // when hc is truthy to include # in the run of punctuation characters
      // only when not followint [|&;<>].
      '^.[^\\s\\w.$@\'"`/\\\\]*';
    if (options['regexLiterals']) {
      punctuation += '(?!\s*\/)';
    }

    fallthroughStylePatterns.push(
        // TODO(mikesamuel): recognize non-latin letters and numerals in idents
        [PR_LITERAL,     /^@[a-z_$][a-z_$@0-9]*/i, null],
        [PR_TYPE,        /^(?:[@_]?[A-Z]+[a-z][A-Za-z_$@0-9]*|\w+_t\b)/, null],
        [PR_PLAIN,       /^[a-z_$][a-z_$@0-9]*/i, null],
        [PR_LITERAL,
         new RegExp(
             '^(?:'
             // A hex number
             + '0x[a-f0-9]+'
             // or an octal or decimal number,
             + '|(?:\\d(?:_\\d+)*\\d*(?:\\.\\d*)?|\\.\\d\\+)'
             // possibly in scientific notation
             + '(?:e[+\\-]?\\d+)?'
             + ')'
             // with an optional modifier like UL for unsigned long
             + '[a-z]*', 'i'),
         null, '0123456789'],
        // Don't treat escaped quotes in bash as starting strings.
        // See issue 144.
        [PR_PLAIN,       /^\\[\s\S]?/, null],
        [PR_PUNCTUATION, new RegExp(punctuation), null]);

    return createSimpleLexer(shortcutStylePatterns, fallthroughStylePatterns);
  }

  var decorateSource = sourceDecorator({
        'keywords': ALL_KEYWORDS,
        'hashComments': true,
        'cStyleComments': true,
        'multiLineStrings': true,
        'regexLiterals': true
      });

  /**
   * Given a DOM subtree, wraps it in a list, and puts each line into its own
   * list item.
   *
   * @param {Node} node modified in place.  Its content is pulled into an
   *     HTMLOListElement, and each line is moved into a separate list item.
   *     This requires cloning elements, so the input might not have unique
   *     IDs after numbering.
   * @param {boolean} isPreformatted true iff white-space in text nodes should
   *     be treated as significant.
   */
  function numberLines(node, opt_startLineNum, isPreformatted) {
    var nocode = /(?:^|\s)nocode(?:\s|$)/;
    var lineBreak = /\r\n?|\n/;
  
    var document = node.ownerDocument;
  
    var li = document.createElement('li');
    while (node.firstChild) {
      li.appendChild(node.firstChild);
    }
    // An array of lines.  We split below, so this is initialized to one
    // un-split line.
    var listItems = [li];
  
    function walk(node) {
      var type = node.nodeType;
      if (type == 1 && !nocode.test(node.className)) {  // Element
        if ('br' === node.nodeName) {
          breakAfter(node);
          // Discard the <BR> since it is now flush against a </LI>.
          if (node.parentNode) {
            node.parentNode.removeChild(node);
          }
        } else {
          for (var child = node.firstChild; child; child = child.nextSibling) {
            walk(child);
          }
        }
      } else if ((type == 3 || type == 4) && isPreformatted) {  // Text
        var text = node.nodeValue;
        var match = text.match(lineBreak);
        if (match) {
          var firstLine = text.substring(0, match.index);
          node.nodeValue = firstLine;
          var tail = text.substring(match.index + match[0].length);
          if (tail) {
            var parent = node.parentNode;
            parent.insertBefore(
              document.createTextNode(tail), node.nextSibling);
          }
          breakAfter(node);
          if (!firstLine) {
            // Don't leave blank text nodes in the DOM.
            node.parentNode.removeChild(node);
          }
        }
      }
    }
  
    // Split a line after the given node.
    function breakAfter(lineEndNode) {
      // If there's nothing to the right, then we can skip ending the line
      // here, and move root-wards since splitting just before an end-tag
      // would require us to create a bunch of empty copies.
      while (!lineEndNode.nextSibling) {
        lineEndNode = lineEndNode.parentNode;
        if (!lineEndNode) { return; }
      }
  
      function breakLeftOf(limit, copy) {
        // Clone shallowly if this node needs to be on both sides of the break.
        var rightSide = copy ? limit.cloneNode(false) : limit;
        var parent = limit.parentNode;
        if (parent) {
          // We clone the parent chain.
          // This helps us resurrect important styling elements that cross lines.
          // E.g. in <i>Foo<br>Bar</i>
          // should be rewritten to <li><i>Foo</i></li><li><i>Bar</i></li>.
          var parentClone = breakLeftOf(parent, 1);
          // Move the clone and everything to the right of the original
          // onto the cloned parent.
          var next = limit.nextSibling;
          parentClone.appendChild(rightSide);
          for (var sibling = next; sibling; sibling = next) {
            next = sibling.nextSibling;
            parentClone.appendChild(sibling);
          }
        }
        return rightSide;
      }
  
      var copiedListItem = breakLeftOf(lineEndNode.nextSibling, 0);
  
      // Walk the parent chain until we reach an unattached LI.
      for (var parent;
           // Check nodeType since IE invents document fragments.
           (parent = copiedListItem.parentNode) && parent.nodeType === 1;) {
        copiedListItem = parent;
      }
      // Put it on the list of lines for later processing.
      listItems.push(copiedListItem);
    }
  
    // Split lines while there are lines left to split.
    for (var i = 0;  // Number of lines that have been split so far.
         i < listItems.length;  // length updated by breakAfter calls.
         ++i) {
      walk(listItems[i]);
    }
  
    // Make sure numeric indices show correctly.
    if (opt_startLineNum === (opt_startLineNum|0)) {
      listItems[0].setAttribute('value', opt_startLineNum);
    }
  
    var ol = document.createElement('ol');
    ol.className = 'linenums';
    var offset = Math.max(0, ((opt_startLineNum - 1 /* zero index */)) | 0) || 0;
    for (var i = 0, n = listItems.length; i < n; ++i) {
      li = listItems[i];
      // Stick a class on the LIs so that stylesheets can
      // color odd/even rows, or any other row pattern that
      // is co-prime with 10.
      li.className = 'L' + ((i + offset) % 10);
      if (!li.firstChild) {
        li.appendChild(document.createTextNode('\xA0'));
      }
      ol.appendChild(li);
    }
  
    node.appendChild(ol);
  }
  /**
   * Breaks {@code job.sourceCode} around style boundaries in
   * {@code job.decorations} and modifies {@code job.sourceNode} in place.
   * @param {Object} job like <pre>{
   *    sourceCode: {string} source as plain text,
   *    sourceNode: {HTMLElement} the element containing the source,
   *    spans: {Array.<number|Node>} alternating span start indices into source
   *       and the text node or element (e.g. {@code <BR>}) corresponding to that
   *       span.
   *    decorations: {Array.<number|string} an array of style classes preceded
   *       by the position at which they start in job.sourceCode in order
   * }</pre>
   * @private
   */
  function recombineTagsAndDecorations(job) {
    var isIE8OrEarlier = /\bMSIE\s(\d+)/.exec(navigator.userAgent);
    isIE8OrEarlier = isIE8OrEarlier && +isIE8OrEarlier[1] <= 8;
    var newlineRe = /\n/g;
  
    var source = job.sourceCode;
    var sourceLength = source.length;
    // Index into source after the last code-unit recombined.
    var sourceIndex = 0;
  
    var spans = job.spans;
    var nSpans = spans.length;
    // Index into spans after the last span which ends at or before sourceIndex.
    var spanIndex = 0;
  
    var decorations = job.decorations;
    var nDecorations = decorations.length;
    // Index into decorations after the last decoration which ends at or before
    // sourceIndex.
    var decorationIndex = 0;
  
    // Remove all zero-length decorations.
    decorations[nDecorations] = sourceLength;
    var decPos, i;
    for (i = decPos = 0; i < nDecorations;) {
      if (decorations[i] !== decorations[i + 2]) {
        decorations[decPos++] = decorations[i++];
        decorations[decPos++] = decorations[i++];
      } else {
        i += 2;
      }
    }
    nDecorations = decPos;
  
    // Simplify decorations.
    for (i = decPos = 0; i < nDecorations;) {
      var startPos = decorations[i];
      // Conflate all adjacent decorations that use the same style.
      var startDec = decorations[i + 1];
      var end = i + 2;
      while (end + 2 <= nDecorations && decorations[end + 1] === startDec) {
        end += 2;
      }
      decorations[decPos++] = startPos;
      decorations[decPos++] = startDec;
      i = end;
    }
  
    nDecorations = decorations.length = decPos;
  
    var sourceNode = job.sourceNode;
    var oldDisplay;
    if (sourceNode) {
      oldDisplay = sourceNode.style.display;
      sourceNode.style.display = 'none';
    }
    try {
      var decoration = null;
      while (spanIndex < nSpans) {
        var spanStart = spans[spanIndex];
        var spanEnd = spans[spanIndex + 2] || sourceLength;
  
        var decEnd = decorations[decorationIndex + 2] || sourceLength;
  
        var end = Math.min(spanEnd, decEnd);
  
        var textNode = spans[spanIndex + 1];
        var styledText;
        if (textNode.nodeType !== 1  // Don't muck with <BR>s or <LI>s
            // Don't introduce spans around empty text nodes.
            && (styledText = source.substring(sourceIndex, end))) {
          // This may seem bizarre, and it is.  Emitting LF on IE causes the
          // code to display with spaces instead of line breaks.
          // Emitting Windows standard issue linebreaks (CRLF) causes a blank
          // space to appear at the beginning of every line but the first.
          // Emitting an old Mac OS 9 line separator makes everything spiffy.
          if (isIE8OrEarlier) {
            styledText = styledText.replace(newlineRe, '\r');
          }
          textNode.nodeValue = styledText;
          var document = textNode.ownerDocument;
          var span = document.createElement('span');
          span.className = decorations[decorationIndex + 1];
          var parentNode = textNode.parentNode;
          parentNode.replaceChild(span, textNode);
          span.appendChild(textNode);
          if (sourceIndex < spanEnd) {  // Split off a text node.
            spans[spanIndex + 1] = textNode
                // TODO: Possibly optimize by using '' if there's no flicker.
                = document.createTextNode(source.substring(end, spanEnd));
            parentNode.insertBefore(textNode, span.nextSibling);
          }
        }
  
        sourceIndex = end;
  
        if (sourceIndex >= spanEnd) {
          spanIndex += 2;
        }
        if (sourceIndex >= decEnd) {
          decorationIndex += 2;
        }
      }
    } finally {
      if (sourceNode) {
        sourceNode.style.display = oldDisplay;
      }
    }
  }

  /** Maps language-specific file extensions to handlers. */
  var langHandlerRegistry = {};
  /** Register a language handler for the given file extensions.
    * @param {function (Object)} handler a function from source code to a list
    *      of decorations.  Takes a single argument job which describes the
    *      state of the computation.   The single parameter has the form
    *      {@code {
    *        sourceCode: {string} as plain text.
    *        decorations: {Array.<number|string>} an array of style classes
    *                     preceded by the position at which they start in
    *                     job.sourceCode in order.
    *                     The language handler should assigned this field.
    *        basePos: {int} the position of source in the larger source chunk.
    *                 All positions in the output decorations array are relative
    *                 to the larger source chunk.
    *      } }
    * @param {Array.<string>} fileExtensions
    */
  function registerLangHandler(handler, fileExtensions) {
    for (var i = fileExtensions.length; --i >= 0;) {
      var ext = fileExtensions[i];
      if (!langHandlerRegistry.hasOwnProperty(ext)) {
        langHandlerRegistry[ext] = handler;
      } else if (win['console']) {
        console['warn']('cannot override language handler %s', ext);
      }
    }
  }
  function langHandlerForExtension(extension, source) {
    if (!(extension && langHandlerRegistry.hasOwnProperty(extension))) {
      // Treat it as markup if the first non whitespace character is a < and
      // the last non-whitespace character is a >.
      extension = /^\s*</.test(source)
          ? 'default-markup'
          : 'default-code';
    }
    return langHandlerRegistry[extension];
  }
  registerLangHandler(decorateSource, ['default-code']);
  registerLangHandler(
      createSimpleLexer(
          [],
          [
           [PR_PLAIN,       /^[^<?]+/],
           [PR_DECLARATION, /^<!\w[^>]*(?:>|$)/],
           [PR_COMMENT,     /^<\!--[\s\S]*?(?:-\->|$)/],
           // Unescaped content in an unknown language
           ['lang-',        /^<\?([\s\S]+?)(?:\?>|$)/],
           ['lang-',        /^<%([\s\S]+?)(?:%>|$)/],
           [PR_PUNCTUATION, /^(?:<[%?]|[%?]>)/],
           ['lang-',        /^<xmp\b[^>]*>([\s\S]+?)<\/xmp\b[^>]*>/i],
           // Unescaped content in javascript.  (Or possibly vbscript).
           ['lang-js',      /^<script\b[^>]*>([\s\S]*?)(<\/script\b[^>]*>)/i],
           // Contains unescaped stylesheet content
           ['lang-css',     /^<style\b[^>]*>([\s\S]*?)(<\/style\b[^>]*>)/i],
           ['lang-in.tag',  /^(<\/?[a-z][^<>]*>)/i]
          ]),
      ['default-markup', 'htm', 'html', 'mxml', 'xhtml', 'xml', 'xsl']);
  registerLangHandler(
      createSimpleLexer(
          [
           [PR_PLAIN,        /^[\s]+/, null, ' \t\r\n'],
           [PR_ATTRIB_VALUE, /^(?:\"[^\"]*\"?|\'[^\']*\'?)/, null, '\"\'']
           ],
          [
           [PR_TAG,          /^^<\/?[a-z](?:[\w.:-]*\w)?|\/?>$/i],
           [PR_ATTRIB_NAME,  /^(?!style[\s=]|on)[a-z](?:[\w:-]*\w)?/i],
           ['lang-uq.val',   /^=\s*([^>\'\"\s]*(?:[^>\'\"\s\/]|\/(?=\s)))/],
           [PR_PUNCTUATION,  /^[=<>\/]+/],
           ['lang-js',       /^on\w+\s*=\s*\"([^\"]+)\"/i],
           ['lang-js',       /^on\w+\s*=\s*\'([^\']+)\'/i],
           ['lang-js',       /^on\w+\s*=\s*([^\"\'>\s]+)/i],
           ['lang-css',      /^style\s*=\s*\"([^\"]+)\"/i],
           ['lang-css',      /^style\s*=\s*\'([^\']+)\'/i],
           ['lang-css',      /^style\s*=\s*([^\"\'>\s]+)/i]
           ]),
      ['in.tag']);
  registerLangHandler(
      createSimpleLexer([], [[PR_ATTRIB_VALUE, /^[\s\S]+/]]), ['uq.val']);
  registerLangHandler(sourceDecorator({
          'keywords': CPP_KEYWORDS,
          'hashComments': true,
          'cStyleComments': true,
          'types': C_TYPES
        }), ['c', 'cc', 'cpp', 'cxx', 'cyc', 'm']);
  registerLangHandler(sourceDecorator({
          'keywords': 'null,true,false'
        }), ['json']);
  registerLangHandler(sourceDecorator({
          'keywords': CSHARP_KEYWORDS,
          'hashComments': true,
          'cStyleComments': true,
          'verbatimStrings': true,
          'types': C_TYPES
        }), ['cs']);
  registerLangHandler(sourceDecorator({
          'keywords': JAVA_KEYWORDS,
          'cStyleComments': true
        }), ['java']);
  registerLangHandler(sourceDecorator({
          'keywords': SH_KEYWORDS,
          'hashComments': true,
          'multiLineStrings': true
        }), ['bash', 'bsh', 'csh', 'sh']);
  registerLangHandler(sourceDecorator({
          'keywords': PYTHON_KEYWORDS,
          'hashComments': true,
          'multiLineStrings': true,
          'tripleQuotedStrings': true
        }), ['cv', 'py', 'python']);
  registerLangHandler(sourceDecorator({
          'keywords': PERL_KEYWORDS,
          'hashComments': true,
          'multiLineStrings': true,
          'regexLiterals': 2  // multiline regex literals
        }), ['perl', 'pl', 'pm']);
  registerLangHandler(sourceDecorator({
          'keywords': RUBY_KEYWORDS,
          'hashComments': true,
          'multiLineStrings': true,
          'regexLiterals': true
        }), ['rb', 'ruby']);
  registerLangHandler(sourceDecorator({
          'keywords': JSCRIPT_KEYWORDS,
          'cStyleComments': true,
          'regexLiterals': true
        }), ['javascript', 'js']);
  registerLangHandler(sourceDecorator({
          'keywords': COFFEE_KEYWORDS,
          'hashComments': 3,  // ### style block comments
          'cStyleComments': true,
          'multilineStrings': true,
          'tripleQuotedStrings': true,
          'regexLiterals': true
        }), ['coffee']);
  registerLangHandler(sourceDecorator({
          'keywords': RUST_KEYWORDS,
          'cStyleComments': true,
          'multilineStrings': true
        }), ['rc', 'rs', 'rust']);
  registerLangHandler(
      createSimpleLexer([], [[PR_STRING, /^[\s\S]+/]]), ['regex']);

  function applyDecorator(job) {
    var opt_langExtension = job.langExtension;

    try {
      // Extract tags, and convert the source code to plain text.
      var sourceAndSpans = extractSourceSpans(job.sourceNode, job.pre);
      /** Plain text. @type {string} */
      var source = sourceAndSpans.sourceCode;
      job.sourceCode = source;
      job.spans = sourceAndSpans.spans;
      job.basePos = 0;

      // Apply the appropriate language handler
      langHandlerForExtension(opt_langExtension, source)(job);

      // Integrate the decorations and tags back into the source code,
      // modifying the sourceNode in place.
      recombineTagsAndDecorations(job);
    } catch (e) {
      if (win['console']) {
        console['log'](e && e['stack'] || e);
      }
    }
  }

  /**
   * Pretty print a chunk of code.
   * @param sourceCodeHtml {string} The HTML to pretty print.
   * @param opt_langExtension {string} The language name to use.
   *     Typically, a filename extension like 'cpp' or 'java'.
   * @param opt_numberLines {number|boolean} True to number lines,
   *     or the 1-indexed number of the first line in sourceCodeHtml.
   */
  function $prettyPrintOne(sourceCodeHtml, opt_langExtension, opt_numberLines) {
    var container = document.createElement('div');
    // This could cause images to load and onload listeners to fire.
    // E.g. <img onerror="alert(1337)" src="nosuchimage.png">.
    // We assume that the inner HTML is from a trusted source.
    // The pre-tag is required for IE8 which strips newlines from innerHTML
    // when it is injected into a <pre> tag.
    // http://stackoverflow.com/questions/451486/pre-tag-loses-line-breaks-when-setting-innerhtml-in-ie
    // http://stackoverflow.com/questions/195363/inserting-a-newline-into-a-pre-tag-ie-javascript
    container.innerHTML = '<pre>' + sourceCodeHtml + '</pre>';
    container = container.firstChild;
    if (opt_numberLines) {
      numberLines(container, opt_numberLines, true);
    }

    var job = {
      langExtension: opt_langExtension,
      numberLines: opt_numberLines,
      sourceNode: container,
      pre: 1
    };
    applyDecorator(job);
    return container.innerHTML;
  }

   /**
    * Find all the {@code <pre>} and {@code <code>} tags in the DOM with
    * {@code class=prettyprint} and prettify them.
    *
    * @param {Function} opt_whenDone called when prettifying is done.
    * @param {HTMLElement|HTMLDocument} opt_root an element or document
    *   containing all the elements to pretty print.
    *   Defaults to {@code document.body}.
    */
  function $prettyPrint(opt_whenDone, opt_root) {
    var root = opt_root || document.body;
    var doc = root.ownerDocument || document;
    function byTagName(tn) { return root.getElementsByTagName(tn); }
    // fetch a list of nodes to rewrite
    var codeSegments = [byTagName('pre'), byTagName('code'), byTagName('xmp')];
    var elements = [];
    for (var i = 0; i < codeSegments.length; ++i) {
      for (var j = 0, n = codeSegments[i].length; j < n; ++j) {
        elements.push(codeSegments[i][j]);
      }
    }
    codeSegments = null;

    var clock = Date;
    if (!clock['now']) {
      clock = { 'now': function () { return +(new Date); } };
    }

    // The loop is broken into a series of continuations to make sure that we
    // don't make the browser unresponsive when rewriting a large page.
    var k = 0;
    var prettyPrintingJob;

    var langExtensionRe = /\blang(?:uage)?-([\w.]+)(?!\S)/;
    var prettyPrintRe = /\bprettyprint\b/;
    var prettyPrintedRe = /\bprettyprinted\b/;
    var preformattedTagNameRe = /pre|xmp/i;
    var codeRe = /^code$/i;
    var preCodeXmpRe = /^(?:pre|code|xmp)$/i;
    var EMPTY = {};

    function doWork() {
      var endTime = (win['PR_SHOULD_USE_CONTINUATION'] ?
                     clock['now']() + 250 /* ms */ :
                     Infinity);
      for (; k < elements.length && clock['now']() < endTime; k++) {
        var cs = elements[k];

        // Look for a preceding comment like
        // <?prettify lang="..." linenums="..."?>
        var attrs = EMPTY;
        {
          for (var preceder = cs; (preceder = preceder.previousSibling);) {
            var nt = preceder.nodeType;
            // <?foo?> is parsed by HTML 5 to a comment node (8)
            // like <!--?foo?-->, but in XML is a processing instruction
            var value = (nt === 7 || nt === 8) && preceder.nodeValue;
            if (value
                ? !/^\??prettify\b/.test(value)
                : (nt !== 3 || /\S/.test(preceder.nodeValue))) {
              // Skip over white-space text nodes but not others.
              break;
            }
            if (value) {
              attrs = {};
              value.replace(
                  /\b(\w+)=([\w:.%+-]+)/g,
                function (_, name, value) { attrs[name] = value; });
              break;
            }
          }
        }

        var className = cs.className;
        if ((attrs !== EMPTY || prettyPrintRe.test(className))
            // Don't redo this if we've already done it.
            // This allows recalling pretty print to just prettyprint elements
            // that have been added to the page since last call.
            && !prettyPrintedRe.test(className)) {

          // make sure this is not nested in an already prettified element
          var nested = false;
          for (var p = cs.parentNode; p; p = p.parentNode) {
            var tn = p.tagName;
            if (preCodeXmpRe.test(tn)
                && p.className && prettyPrintRe.test(p.className)) {
              nested = true;
              break;
            }
          }
          if (!nested) {
            // Mark done.  If we fail to prettyprint for whatever reason,
            // we shouldn't try again.
            cs.className += ' prettyprinted';

            // If the classes includes a language extensions, use it.
            // Language extensions can be specified like
            //     <pre class="prettyprint lang-cpp">
            // the language extension "cpp" is used to find a language handler
            // as passed to PR.registerLangHandler.
            // HTML5 recommends that a language be specified using "language-"
            // as the prefix instead.  Google Code Prettify supports both.
            // http://dev.w3.org/html5/spec-author-view/the-code-element.html
            var langExtension = attrs['lang'];
            if (!langExtension) {
              langExtension = className.match(langExtensionRe);
              // Support <pre class="prettyprint"><code class="language-c">
              var wrapper;
              if (!langExtension && (wrapper = childContentWrapper(cs))
                  && codeRe.test(wrapper.tagName)) {
                langExtension = wrapper.className.match(langExtensionRe);
              }

              if (langExtension) { langExtension = langExtension[1]; }
            }

            var preformatted;
            if (preformattedTagNameRe.test(cs.tagName)) {
              preformatted = 1;
            } else {
              var currentStyle = cs['currentStyle'];
              var defaultView = doc.defaultView;
              var whitespace = (
                  currentStyle
                  ? currentStyle['whiteSpace']
                  : (defaultView
                     && defaultView.getComputedStyle)
                  ? defaultView.getComputedStyle(cs, null)
                  .getPropertyValue('white-space')
                  : 0);
              preformatted = whitespace
                  && 'pre' === whitespace.substring(0, 3);
            }

            // Look for a class like linenums or linenums:<n> where <n> is the
            // 1-indexed number of the first line.
            var lineNums = attrs['linenums'];
            if (!(lineNums = lineNums === 'true' || +lineNums)) {
              lineNums = className.match(/\blinenums\b(?::(\d+))?/);
              lineNums =
                lineNums
                ? lineNums[1] && lineNums[1].length
                  ? +lineNums[1] : true
                : false;
            }
            if (lineNums) { numberLines(cs, lineNums, preformatted); }

            // do the pretty printing
            prettyPrintingJob = {
              langExtension: langExtension,
              sourceNode: cs,
              numberLines: lineNums,
              pre: preformatted
            };
            applyDecorator(prettyPrintingJob);
          }
        }
      }
      if (k < elements.length) {
        // finish up in a continuation
        setTimeout(doWork, 250);
      } else if ('function' === typeof opt_whenDone) {
        opt_whenDone();
      }
    }

    doWork();
  }

  /**
   * Contains functions for creating and registering new language handlers.
   * @type {Object}
   */
  var PR = win['PR'] = {
        'createSimpleLexer': createSimpleLexer,
        'registerLangHandler': registerLangHandler,
        'sourceDecorator': sourceDecorator,
        'PR_ATTRIB_NAME': PR_ATTRIB_NAME,
        'PR_ATTRIB_VALUE': PR_ATTRIB_VALUE,
        'PR_COMMENT': PR_COMMENT,
        'PR_DECLARATION': PR_DECLARATION,
        'PR_KEYWORD': PR_KEYWORD,
        'PR_LITERAL': PR_LITERAL,
        'PR_NOCODE': PR_NOCODE,
        'PR_PLAIN': PR_PLAIN,
        'PR_PUNCTUATION': PR_PUNCTUATION,
        'PR_SOURCE': PR_SOURCE,
        'PR_STRING': PR_STRING,
        'PR_TAG': PR_TAG,
        'PR_TYPE': PR_TYPE,
        'prettyPrintOne':
           IN_GLOBAL_SCOPE
             ? (win['prettyPrintOne'] = $prettyPrintOne)
             : (prettyPrintOne = $prettyPrintOne),
        'prettyPrint': prettyPrint =
           IN_GLOBAL_SCOPE
             ? (win['prettyPrint'] = $prettyPrint)
             : (prettyPrint = $prettyPrint)
      };

  // Make PR available via the Asynchronous Module Definition (AMD) API.
  // Per https://github.com/amdjs/amdjs-api/wiki/AMD:
  // The Asynchronous Module Definition (AMD) API specifies a
  // mechanism for defining modules such that the module and its
  // dependencies can be asynchronously loaded.
  // ...
  // To allow a clear indicator that a global define function (as
  // needed for script src browser loading) conforms to the AMD API,
  // any global define function SHOULD have a property called "amd"
  // whose value is an object. This helps avoid conflict with any
  // other existing JavaScript code that could have defined a define()
  // function that does not conform to the AMD API.
  if (typeof define === "function" && define['amd']) {
    define("google-code-prettify", [], function () {
      return PR; 
    });
  }
})();

!function (e) { if ("object" == typeof exports && "undefined" != typeof module) module.exports = e(); else if ("function" == typeof define && define.amd) define([], e); else { var o; "undefined" != typeof window ? o = window : "undefined" != typeof global ? o = global : "undefined" != typeof self && (o = self), o.commonmark = e() } }(function () {
  var define, module, exports; return (function e(t, n, r) { function s(o, u) { if (!n[o]) { if (!t[o]) { var a = typeof require == "function" && require; if (!u && a) return a(o, !0); if (i) return i(o, !0); var f = new Error("Cannot find module '" + o + "'"); throw f.code = "MODULE_NOT_FOUND", f } var l = n[o] = { exports: {} }; t[o][0].call(l.exports, function (e) { var n = t[o][1][e]; return s(n ? n : e) }, l, l.exports, e, t, n, r) } return n[o].exports } var i = typeof require == "function" && require; for (var o = 0; o < r.length; o++) s(r[o]); return s })({
    1: [function (require, module, exports) {
      "use strict";

      var Node = require('./node');
      var unescapeString = require('./common').unescapeString;

      var CODE_INDENT = 4;

      var C_NEWLINE = 10;
      var C_GREATERTHAN = 62;
      var C_SPACE = 32;
      var C_OPEN_BRACKET = 91;

      var InlineParser = require('./inlines');

      var BLOCKTAGNAME = '(?:article|header|aside|hgroup|iframe|blockquote|hr|body|li|map|button|object|canvas|ol|caption|output|col|p|colgroup|pre|dd|progress|div|section|dl|table|td|dt|tbody|embed|textarea|fieldset|tfoot|figcaption|th|figure|thead|footer|footer|tr|form|ul|h1|h2|h3|h4|h5|h6|video|script|style)';

      var HTMLBLOCKOPEN = "<(?:" + BLOCKTAGNAME + "[\\s/>]" + "|" +
              "/" + BLOCKTAGNAME + "[\\s>]" + "|" + "[?!])";

      var reHtmlBlockOpen = new RegExp('^' + HTMLBLOCKOPEN, 'i');

      var reHrule = /^(?:(?:\* *){3,}|(?:_ *){3,}|(?:- *){3,}) *$/;

      var reMaybeSpecial = /^[#`~*+_=<>0-9-]/;

      var reNonSpace = /[^ \t\f\v\r\n]/;

      var reBulletListMarker = /^[*+-]( +|$)/;

      var reOrderedListMarker = /^(\d+)([.)])( +|$)/;

      var reATXHeaderMarker = /^#{1,6}(?: +|$)/;

      var reCodeFence = /^`{3,}(?!.*`)|^~{3,}(?!.*~)/;

      var reClosingCodeFence = /^(?:`{3,}|~{3,})(?= *$)/;

      var reSetextHeaderLine = /^(?:=+|-+) *$/;

      var reLineEnding = /\r\n|\n|\r/;

      // Returns true if string contains only space characters.
      var isBlank = function (s) {
        return !(reNonSpace.test(s));
      };

      var tabSpaces = ['    ', '   ', '  ', ' '];

      // Convert tabs to spaces on each line using a 4-space tab stop.
      var detabLine = function (text) {
        var start = 0;
        var offset;
        var lastStop = 0;

        while ((offset = text.indexOf('\t', start)) !== -1) {
          var numspaces = (offset - lastStop) % 4;
          var spaces = tabSpaces[numspaces];
          text = text.slice(0, offset) + spaces + text.slice(offset + 1);
          lastStop = offset + numspaces;
          start = lastStop;
        }

        return text;
      };

      var peek = function (ln, pos) {
        if (pos < ln.length) {
          return ln.charCodeAt(pos);
        } else {
          return -1;
        }
      };

      // DOC PARSER

      // These are methods of a Parser object, defined below.

      // Returns true if block ends with a blank line, descending if needed
      // into lists and sublists.
      var endsWithBlankLine = function (block) {
        while (block) {
          if (block._lastLineBlank) {
            return true;
          }
          var t = block.type;
          if (t === 'List' || t === 'Item') {
            block = block._lastChild;
          } else {
            break;
          }
        }
        return false;
      };

      // Break out of all containing lists, resetting the tip of the
      // document to the parent of the highest list, and finalizing
      // all the lists.  (This is used to implement the "two blank lines
      // break of of all lists" feature.)
      var breakOutOfLists = function (block) {
        var b = block;
        var last_list = null;
        do {
          if (b.type === 'List') {
            last_list = b;
          }
          b = b._parent;
        } while (b);

        if (last_list) {
          while (block !== last_list) {
            this.finalize(block, this.lineNumber);
            block = block._parent;
          }
          this.finalize(last_list, this.lineNumber);
          this.tip = last_list._parent;
        }
      };

      // Add a line to the block at the tip.  We assume the tip
      // can accept lines -- that check should be done before calling this.
      var addLine = function () {
        this.tip._string_content += this.currentLine.slice(this.offset) + '\n';
      };

      // Add block of type tag as a child of the tip.  If the tip can't
      // accept children, close and finalize it and try its parent,
      // and so on til we find a block that can accept children.
      var addChild = function (tag, offset) {
        while (!this.blocks[this.tip.type].canContain(tag)) {
          this.finalize(this.tip, this.lineNumber - 1);
        }

        var column_number = offset + 1; // offset 0 = column 1
        var newBlock = new Node(tag, [[this.lineNumber, column_number], [0, 0]]);
        newBlock._string_content = '';
        this.tip.appendChild(newBlock);
        this.tip = newBlock;
        return newBlock;
      };

      // Parse a list marker and return data on the marker (type,
      // start, delimiter, bullet character, padding) or null.
      var parseListMarker = function (ln, offset, indent) {
        var rest = ln.slice(offset);
        var match;
        var spaces_after_marker;
        var data = {
          type: null,
          tight: true,  // lists are tight by default
          bulletChar: null,
          start: null,
          delimiter: null,
          padding: null,
          markerOffset: indent
        };
        if ((match = rest.match(reBulletListMarker))) {
          spaces_after_marker = match[1].length;
          data.type = 'Bullet';
          data.bulletChar = match[0][0];

        } else if ((match = rest.match(reOrderedListMarker))) {
          spaces_after_marker = match[3].length;
          data.type = 'Ordered';
          data.start = parseInt(match[1]);
          data.delimiter = match[2];
        } else {
          return null;
        }
        var blank_item = match[0].length === rest.length;
        if (spaces_after_marker >= 5 ||
            spaces_after_marker < 1 ||
            blank_item) {
          data.padding = match[0].length - spaces_after_marker + 1;
        } else {
          data.padding = match[0].length;
        }
        return data;
      };

      // Returns true if the two list items are of the same type,
      // with the same delimiter and bullet character.  This is used
      // in agglomerating list items into lists.
      var listsMatch = function (list_data, item_data) {
        return (list_data.type === item_data.type &&
                list_data.delimiter === item_data.delimiter &&
                list_data.bulletChar === item_data.bulletChar);
      };

      // Finalize and close any unmatched blocks. Returns true.
      var closeUnmatchedBlocks = function () {
        if (!this.allClosed) {
          // finalize any blocks not matched
          while (this.oldtip !== this.lastMatchedContainer) {
            var parent = this.oldtip._parent;
            this.finalize(this.oldtip, this.lineNumber - 1);
            this.oldtip = parent;
          }
          this.allClosed = true;
        }
      };

      // 'finalize' is run when the block is closed.
      // 'continue' is run to check whether the block is continuing
      // at a certain line and offset (e.g. whether a block quote
      // contains a `>`.  It returns 0 for matched, 1 for not matched,
      // and 2 for "we've dealt with this line completely, go to next."
      var blocks = {
        Document: {
          'continue': function () { return 0; },
          finalize: function () { return; },
          canContain: function (t) { return (t !== 'Item'); },
          acceptsLines: false
        },
        List: {
          'continue': function () { return 0; },
          finalize: function (parser, block) {
            var item = block._firstChild;
            while (item) {
              // check for non-final list item ending with blank line:
              if (endsWithBlankLine(item) && item._next) {
                block._listData.tight = false;
                break;
              }
              // recurse into children of list item, to see if there are
              // spaces between any of them:
              var subitem = item._firstChild;
              while (subitem) {
                if (endsWithBlankLine(subitem) &&
                    (item._next || subitem._next)) {
                  block._listData.tight = false;
                  break;
                }
                subitem = subitem._next;
              }
              item = item._next;
            }
          },
          canContain: function (t) { return (t === 'Item'); },
          acceptsLines: false
        },
        BlockQuote: {
          'continue': function (parser) {
            var ln = parser.currentLine;
            if (parser.indent <= 3 &&
                peek(ln, parser.nextNonspace) === C_GREATERTHAN) {
              parser.offset = parser.nextNonspace + 1;
              if (peek(ln, parser.offset) === C_SPACE) {
                parser.offset++;
              }
            } else {
              return 1;
            }
            return 0;
          },
          finalize: function () { return; },
          canContain: function (t) { return (t !== 'Item'); },
          acceptsLines: false
        },
        Item: {
          'continue': function (parser, container) {
            if (parser.blank) {
              parser.offset = parser.nextNonspace;
            } else if (parser.indent >=
                       container._listData.markerOffset +
                       container._listData.padding) {
              parser.offset += container._listData.markerOffset +
                  container._listData.padding;
            } else {
              return 1;
            }
            return 0;
          },
          finalize: function () { return; },
          canContain: function (t) { return (t !== 'Item'); },
          acceptsLines: false
        },
        Header: {
          'continue': function () {
            // a header can never container > 1 line, so fail to match:
            return 1;
          },
          finalize: function () { return; },
          canContain: function () { return false; },
          acceptsLines: false
        },
        HorizontalRule: {
          'continue': function () {
            // an hrule can never container > 1 line, so fail to match:
            return 1;
          },
          finalize: function () { return; },
          canContain: function () { return false; },
          acceptsLines: false
        },
        CodeBlock: {
          'continue': function (parser, container) {
            var ln = parser.currentLine;
            var indent = parser.indent;
            if (container._isFenced) { // fenced
              var match = (indent <= 3 &&
                  ln.charAt(parser.nextNonspace) === container._fenceChar &&
                  ln.slice(parser.nextNonspace).match(reClosingCodeFence));
              if (match && match[0].length >= container._fenceLength) {
                // closing fence - we're at end of line, so we can return
                parser.finalize(container, parser.lineNumber);
                return 2;
              } else {
                // skip optional spaces of fence offset
                var i = container._fenceOffset;
                while (i > 0 && peek(ln, parser.offset) === C_SPACE) {
                  parser.offset++;
                  i--;
                }
              }
            } else { // indented
              if (indent >= CODE_INDENT) {
                parser.offset += CODE_INDENT;
              } else if (parser.blank) {
                parser.offset = parser.nextNonspace;
              } else {
                return 1;
              }
            }
            return 0;
          },
          finalize: function (parser, block) {
            if (block._isFenced) { // fenced
              // first line becomes info string
              var content = block._string_content;
              var newlinePos = content.indexOf('\n');
              var firstLine = content.slice(0, newlinePos);
              var rest = content.slice(newlinePos + 1);
              block.info = unescapeString(firstLine.trim());
              block._literal = rest;
            } else { // indented
              block._literal = block._string_content.replace(/(\n *)+$/, '\n');
            }
            block._string_content = null; // allow GC
          },
          canContain: function () { return false; },
          acceptsLines: true
        },
        HtmlBlock: {
          'continue': function (parser) {
            return (parser.blank ? 1 : 0);
          },
          finalize: function (parser, block) {
            block._literal = block._string_content.replace(/(\n *)+$/, '');
            block._string_content = null; // allow GC
          },
          canContain: function () { return false; },
          acceptsLines: true
        },
        Paragraph: {
          'continue': function (parser) {
            return (parser.blank ? 1 : 0);
          },
          finalize: function (parser, block) {
            var pos;
            var hasReferenceDefs = false;

            // try parsing the beginning as link reference definitions:
            while (peek(block._string_content, 0) === C_OPEN_BRACKET &&
                   (pos =
                    parser.inlineParser.parseReference(block._string_content,
                                                       parser.refmap))) {
              block._string_content = block._string_content.slice(pos);
              hasReferenceDefs = true;
            }
            if (hasReferenceDefs && isBlank(block._string_content)) {
              block.unlink();
            }
          },
          canContain: function () { return false; },
          acceptsLines: true
        }
      };

      // block start functions.  Return values:
      // 0 = no match
      // 1 = matched container, keep going
      // 2 = matched leaf, no more block starts
      var blockStarts = [
          // indented code block
          function (parser) {
            if (parser.indent >= CODE_INDENT) {
              if (parser.tip.type !== 'Paragraph' && !parser.blank) {
                // indented code
                parser.offset += CODE_INDENT;
                parser.closeUnmatchedBlocks();
                parser.addChild('CodeBlock', parser.offset);
              } else {
                // lazy paragraph continuation
                parser.offset = parser.nextNonspace;
              }
              return 2;
            } else {
              return 0;
            }
          },

          // block quote
          function (parser) {
            if (peek(parser.currentLine, parser.nextNonspace) === C_GREATERTHAN) {
              parser.offset = parser.nextNonspace + 1;
              // optional following space
              if (peek(parser.currentLine, parser.offset) === C_SPACE) {
                parser.offset++;
              }
              parser.closeUnmatchedBlocks();
              parser.addChild('BlockQuote', parser.nextNonspace);
              return 1;
            } else {
              return 0;
            }
          },

          // ATX header
          function (parser) {
            var match;
            if ((match = parser.currentLine.slice(parser.nextNonspace).match(reATXHeaderMarker))) {
              parser.offset = parser.nextNonspace + match[0].length;
              parser.closeUnmatchedBlocks();
              var container = parser.addChild('Header', parser.nextNonspace);
              container.level = match[0].trim().length; // number of #s
              // remove trailing ###s:
              container._string_content =
                  parser.currentLine.slice(parser.offset).replace(/^ *#+ *$/, '').replace(/ +#+ *$/, '');
              parser.offset = parser.currentLine.length;
              return 2;
            } else {
              return 0;
            }
          },

          // Fenced code block
          function (parser) {
            var match;
            if ((match = parser.currentLine.slice(parser.nextNonspace).match(reCodeFence))) {
              var fenceLength = match[0].length;
              parser.closeUnmatchedBlocks();
              var container = parser.addChild('CodeBlock', parser.nextNonspace);
              container._isFenced = true;
              container._fenceLength = fenceLength;
              container._fenceChar = match[0][0];
              container._fenceOffset = parser.indent;
              parser.offset = parser.nextNonspace + fenceLength;
              return 2;
            } else {
              return 0;
            }
          },

          // HTML block
          function (parser) {
            if (reHtmlBlockOpen.test(parser.currentLine.slice(parser.nextNonspace))) {
              parser.closeUnmatchedBlocks();
              parser.addChild('HtmlBlock', parser.offset);
              // don't adjust parser.offset; spaces are part of block
              return 2;
            } else {
              return 0;
            }
          },

          // Setext header
          function (parser, container) {
            var match;
            if (container.type === 'Paragraph' &&
                       (container._string_content.indexOf('\n') ===
                          container._string_content.length - 1) &&
                       ((match = parser.currentLine.slice(parser.nextNonspace).match(reSetextHeaderLine)))) {
              parser.closeUnmatchedBlocks();
              var header = new Node('Header', container.sourcepos);
              header.level = match[0][0] === '=' ? 1 : 2;
              header._string_content = container._string_content;
              container.insertAfter(header);
              container.unlink();
              parser.tip = header;
              parser.offset = parser.currentLine.length;
              return 2;
            } else {
              return 0;
            }
          },

          // hrule
          function (parser) {
            if (reHrule.test(parser.currentLine.slice(parser.nextNonspace))) {
              parser.closeUnmatchedBlocks();
              parser.addChild('HorizontalRule', parser.nextNonspace);
              parser.offset = parser.currentLine.length;
              return 2;
            } else {
              return 0;
            }
          },

          // list item
          function (parser, container) {
            var data;
            if ((data = parseListMarker(parser.currentLine,
                                        parser.nextNonspace, parser.indent))) {
              parser.closeUnmatchedBlocks();
              parser.offset = parser.nextNonspace + data.padding;

              // add the list if needed
              if (parser.tip.type !== 'List' ||
                  !(listsMatch(container._listData, data))) {
                container = parser.addChild('List', parser.nextNonspace);
                container._listData = data;
              }

              // add the list item
              container = parser.addChild('Item', parser.nextNonspace);
              container._listData = data;
              return 1;
            } else {
              return 0;
            }
          }
      ];

      var findNextNonspace = function () {
        var currentLine = this.currentLine;
        var match = currentLine.slice(this.offset).match(reNonSpace);
        if (match === null) {
          this.nextNonspace = currentLine.length;
          this.blank = true;
        } else {
          this.nextNonspace = this.offset + match.index;
          this.blank = false;
        }
        this.indent = this.nextNonspace - this.offset;
      };

      // Analyze a line of text and update the document appropriately.
      // We parse markdown text by calling this on each line of input,
      // then finalizing the document.
      var incorporateLine = function (ln) {
        var all_matched = true;
        var t;

        var container = this.doc;
        this.oldtip = this.tip;
        this.offset = 0;
        this.lineNumber += 1;

        // replace NUL characters for security
        if (ln.indexOf('\u0000') !== -1) {
          ln = ln.replace(/\0/g, '\uFFFD');
        }

        // Convert tabs to spaces:
        ln = detabLine(ln);
        this.currentLine = ln;

        // For each containing block, try to parse the associated line start.
        // Bail out on failure: container will point to the last matching block.
        // Set all_matched to false if not all containers match.
        var lastChild;
        while ((lastChild = container._lastChild) && lastChild._open) {
          container = lastChild;

          this.findNextNonspace();

          switch (this.blocks[container.type]['continue'](this, container)) {
            case 0: // we've matched, keep going
              break;
            case 1: // we've failed to match a block
              all_matched = false;
              break;
            case 2: // we've hit end of line for fenced code close and can return
              this.lastLineLength = ln.length;
              return;
            default:
              throw 'continue returned illegal value, must be 0, 1, or 2';
          }
          if (!all_matched) {
            container = container._parent; // back up to last matching block
            break;
          }
        }

        this.allClosed = (container === this.oldtip);
        this.lastMatchedContainer = container;

        // Check to see if we've hit 2nd blank line; if so break out of list:
        if (this.blank && container._lastLineBlank) {
          this.breakOutOfLists(container);
        }

        var matchedLeaf = container.type !== 'Paragraph' &&
                blocks[container.type].acceptsLines;
        var starts = this.blockStarts;
        var startsLen = starts.length;
        // Unless last matched container is a code block, try new container starts,
        // adding children to the last matched container:
        while (!matchedLeaf) {

          this.findNextNonspace();

          // this is a little performance optimization:
          if (this.indent < CODE_INDENT && !reMaybeSpecial.test(ln.slice(this.nextNonspace))) {
            this.offset = this.nextNonspace;
            break;
          }

          var i = 0;
          while (i < startsLen) {
            var res = starts[i](this, container);
            if (res === 1) {
              container = this.tip;
              break;
            } else if (res === 2) {
              container = this.tip;
              matchedLeaf = true;
              break;
            } else {
              i++;
            }
          }

          if (i === startsLen) { // nothing matched
            this.offset = this.nextNonspace;
            break;
          }
        }

        // What remains at the offset is a text line.  Add the text to the
        // appropriate container.

        // First check for a lazy paragraph continuation:
        if (!this.allClosed && !this.blank &&
            this.tip.type === 'Paragraph') {
          // lazy paragraph continuation
          this.addLine();

        } else { // not a lazy continuation

          // finalize any blocks not matched
          this.closeUnmatchedBlocks();
          if (this.blank && container.lastChild) {
            container.lastChild._lastLineBlank = true;
          }

          t = container.type;

          // Block quote lines are never blank as they start with >
          // and we don't count blanks in fenced code for purposes of tight/loose
          // lists or breaking out of lists.  We also don't set _lastLineBlank
          // on an empty list item, or if we just closed a fenced block.
          var lastLineBlank = this.blank &&
              !(t === 'BlockQuote' ||
                (t === 'CodeBlock' && container._isFenced) ||
                (t === 'Item' &&
                 !container._firstChild &&
                 container.sourcepos[0][0] === this.lineNumber));

          // propagate lastLineBlank up through parents:
          var cont = container;
          while (cont) {
            cont._lastLineBlank = lastLineBlank;
            cont = cont._parent;
          }

          if (this.blocks[t].acceptsLines) {
            this.addLine();
          } else if (this.offset < ln.length && !this.blank) {
            // create paragraph container for line
            container = this.addChild('Paragraph', this.offset);
            this.offset = this.nextNonspace;
            this.addLine();
          }
        }
        this.lastLineLength = ln.length;
      };

      // Finalize a block.  Close it and do any necessary postprocessing,
      // e.g. creating string_content from strings, setting the 'tight'
      // or 'loose' status of a list, and parsing the beginnings
      // of paragraphs for reference definitions.  Reset the tip to the
      // parent of the closed block.
      var finalize = function (block, lineNumber) {
        var above = block._parent;
        block._open = false;
        block.sourcepos[1] = [lineNumber, this.lastLineLength];

        this.blocks[block.type].finalize(this, block);

        this.tip = above;
      };

      // Walk through a block & children recursively, parsing string content
      // into inline content where appropriate.
      var processInlines = function (block) {
        var node, event, t;
        var walker = block.walker();
        this.inlineParser.refmap = this.refmap;
        while ((event = walker.next())) {
          node = event.node;
          t = node.type;
          if (!event.entering && (t === 'Paragraph' || t === 'Header')) {
            this.inlineParser.parse(node);
          }
        }
      };

      var Document = function () {
        var doc = new Node('Document', [[1, 1], [0, 0]]);
        return doc;
      };

      // The main parsing function.  Returns a parsed document AST.
      var parse = function (input) {
        this.doc = new Document();
        this.tip = this.doc;
        this.refmap = {};
        this.lineNumber = 0;
        this.lastLineLength = 0;
        this.offset = 0;
        this.lastMatchedContainer = this.doc;
        this.currentLine = "";
        if (this.options.time) { console.time("preparing input"); }
        var lines = input.split(reLineEnding);
        var len = lines.length;
        if (input.charCodeAt(input.length - 1) === C_NEWLINE) {
          // ignore last blank line created by final newline
          len -= 1;
        }
        if (this.options.time) { console.timeEnd("preparing input"); }
        if (this.options.time) { console.time("block parsing"); }
        for (var i = 0; i < len; i++) {
          this.incorporateLine(lines[i]);
        }
        while (this.tip) {
          this.finalize(this.tip, len);
        }
        if (this.options.time) { console.timeEnd("block parsing"); }
        if (this.options.time) { console.time("inline parsing"); }
        this.processInlines(this.doc);
        if (this.options.time) { console.timeEnd("inline parsing"); }
        return this.doc;
      };


      // The Parser object.
      function Parser(options) {
        return {
          doc: new Document(),
          blocks: blocks,
          blockStarts: blockStarts,
          tip: this.doc,
          oldtip: this.doc,
          currentLine: "",
          lineNumber: 0,
          offset: 0,
          nextNonspace: 0,
          indent: 0,
          blank: false,
          allClosed: true,
          lastMatchedContainer: this.doc,
          refmap: {},
          lastLineLength: 0,
          inlineParser: new InlineParser(options),
          findNextNonspace: findNextNonspace,
          breakOutOfLists: breakOutOfLists,
          addLine: addLine,
          addChild: addChild,
          incorporateLine: incorporateLine,
          finalize: finalize,
          processInlines: processInlines,
          closeUnmatchedBlocks: closeUnmatchedBlocks,
          parse: parse,
          options: options || {}
        };
      }

      module.exports = Parser;

    }, { "./common": 2, "./inlines": 9, "./node": 10 }], 2: [function (require, module, exports) {
      "use strict";

      var encode = require('./encode');
      var decode = require('./decode');

      var C_BACKSLASH = 92;

      var entityToChar = require('./html5-entities.js').entityToChar;

      var ENTITY = "&(?:#x[a-f0-9]{1,8}|#[0-9]{1,8}|[a-z][a-z0-9]{1,31});";

      var reBackslashOrAmp = /[\\&]/;

      var ESCAPABLE = '[!"#$%&\'()*+,./:;<=>?@[\\\\\\]^_`{|}~-]';

      var reEntityOrEscapedChar = new RegExp('\\\\' + ESCAPABLE + '|' + ENTITY, 'gi');

      var XMLSPECIAL = '[&<>"]';

      var reXmlSpecial = new RegExp(XMLSPECIAL, 'g');

      var reXmlSpecialOrEntity = new RegExp(ENTITY + '|' + XMLSPECIAL, 'gi');

      var unescapeChar = function (s) {
        if (s.charCodeAt(0) === C_BACKSLASH) {
          return s.charAt(1);
        } else {
          return entityToChar(s);
        }
      };

      // Replace entities and backslash escapes with literal characters.
      var unescapeString = function (s) {
        if (reBackslashOrAmp.test(s)) {
          return s.replace(reEntityOrEscapedChar, unescapeChar);
        } else {
          return s;
        }
      };

      var normalizeURI = function (uri) {
        try {
          return encode(decode(uri));
        }
        catch (err) {
          return uri;
        }
      };

      var replaceUnsafeChar = function (s) {
        switch (s) {
          case '&':
            return '&amp;';
          case '<':
            return '&lt;';
          case '>':
            return '&gt;';
          case '"':
            return '&quot;';
          default:
            return s;
        }
      };

      var escapeXml = function (s, preserve_entities) {
        if (reXmlSpecial.test(s)) {
          if (preserve_entities) {
            return s.replace(reXmlSpecialOrEntity, replaceUnsafeChar);
          } else {
            return s.replace(reXmlSpecial, replaceUnsafeChar);
          }
        } else {
          return s;
        }
      };

      module.exports = {
        unescapeString: unescapeString,
        normalizeURI: normalizeURI,
        escapeXml: escapeXml,
        ENTITY: ENTITY,
        ESCAPABLE: ESCAPABLE
      };

    }, { "./decode": 3, "./encode": 4, "./html5-entities.js": 7 }], 3: [function (require, module, exports) {
      // from https://github.com/markdown-it/mdurl
      // Copyright (c) 2015 Vitaly Puzrin, Alex Kocharin, MIT license.

      'use strict';


      /* eslint-disable no-bitwise */

      var decodeCache = {};

      function getDecodeCache(exclude) {
        var i, ch, cache = decodeCache[exclude];
        if (cache) { return cache; }

        cache = decodeCache[exclude] = [];

        for (i = 0; i < 128; i++) {
          ch = String.fromCharCode(i);
          cache.push(ch);
        }

        for (i = 0; i < exclude.length; i++) {
          ch = exclude.charCodeAt(i);
          cache[ch] = '%' + ('0' + ch.toString(16).toUpperCase()).slice(-2);
        }

        return cache;
      }


      // Decode percent-encoded string.
      //
      function decode(string, exclude) {
        var cache;

        if (typeof exclude !== 'string') {
          exclude = decode.defaultChars;
        }

        cache = getDecodeCache(exclude);

        return string.replace(/(%[a-f0-9]{2})+/gi, function (seq) {
          var i, l, b1, b2, b3, b4, vchar,
              result = '';

          for (i = 0, l = seq.length; i < l; i += 3) {
            b1 = parseInt(seq.slice(i + 1, i + 3), 16);

            if (b1 < 0x80) {
              result += cache[b1];
              continue;
            }

            if ((b1 & 0xE0) === 0xC0 && (i + 3 < l)) {
              // 110xxxxx 10xxxxxx
              b2 = parseInt(seq.slice(i + 4, i + 6), 16);

              if ((b2 & 0xC0) === 0x80) {
                vchar = ((b1 << 6) & 0x7C0) | (b2 & 0x3F);

                if (vchar < 0x80) {
                  result += '\ufffd\ufffd';
                } else {
                  result += String.fromCharCode(vchar);
                }

                i += 3;
                continue;
              }
            }

            if ((b1 & 0xF0) === 0xE0 && (i + 6 < l)) {
              // 1110xxxx 10xxxxxx 10xxxxxx
              b2 = parseInt(seq.slice(i + 4, i + 6), 16);
              b3 = parseInt(seq.slice(i + 7, i + 9), 16);

              if ((b2 & 0xC0) === 0x80 && (b3 & 0xC0) === 0x80) {
                vchar = ((b1 << 12) & 0xF000) | ((b2 << 6) & 0xFC0) | (b3 & 0x3F);

                if (vchar < 0x800 || (vchar >= 0xD800 && vchar <= 0xDFFF)) {
                  result += '\ufffd\ufffd\ufffd';
                } else {
                  result += String.fromCharCode(vchar);
                }

                i += 6;
                continue;
              }
            }

            if ((b1 & 0xF8) === 0xF0 && (i + 9 < l)) {
              // 111110xx 10xxxxxx 10xxxxxx 10xxxxxx
              b2 = parseInt(seq.slice(i + 4, i + 6), 16);
              b3 = parseInt(seq.slice(i + 7, i + 9), 16);
              b4 = parseInt(seq.slice(i + 10, i + 12), 16);

              if ((b2 & 0xC0) === 0x80 && (b3 & 0xC0) === 0x80 && (b4 & 0xC0) === 0x80) {
                vchar = ((b1 << 18) & 0x1C0000) | ((b2 << 12) & 0x3F000) | ((b3 << 6) & 0xFC0) | (b4 & 0x3F);

                if (vchar < 0x10000 || vchar > 0x10FFFF) {
                  result += '\ufffd\ufffd\ufffd\ufffd';
                } else {
                  vchar -= 0x10000;
                  result += String.fromCharCode(0xD800 + (vchar >> 10), 0xDC00 + (vchar & 0x3FF));
                }

                i += 9;
                continue;
              }
            }

            result += '\ufffd';
          }

          return result;
        });
      }


      decode.defaultChars = ';/?:@&=+$,#';
      decode.componentChars = '';


      module.exports = decode;

    }, {}], 4: [function (require, module, exports) {
      // from https://github.com/markdown-it/mdurl
      // Copyright (c) 2015 Vitaly Puzrin, Alex Kocharin, MIT license.

      'use strict';


      var encodeCache = {};


      // Create a lookup array where anything but characters in `chars` string
      // and alphanumeric chars is percent-encoded.
      //
      function getEncodeCache(exclude) {
        var i, ch, cache = encodeCache[exclude];
        if (cache) { return cache; }

        cache = encodeCache[exclude] = [];

        for (i = 0; i < 128; i++) {
          ch = String.fromCharCode(i);

          if (/^[0-9a-z]$/i.test(ch)) {
            // always allow unencoded alphanumeric characters
            cache.push(ch);
          } else {
            cache.push('%' + ('0' + i.toString(16).toUpperCase()).slice(-2));
          }
        }

        for (i = 0; i < exclude.length; i++) {
          cache[exclude.charCodeAt(i)] = exclude[i];
        }

        return cache;
      }


      // Encode unsafe characters with percent-encoding, skipping already
      // encoded sequences.
      //
      //  - string       - string to encode
      //  - exclude      - list of characters to ignore (in addition to a-zA-Z0-9)
      //  - keepEscaped  - don't encode '%' in a correct escape sequence (default: true)
      //
      function encode(string, exclude, keepEscaped) {
        var i, l, code, nextCode, cache,
            result = '';

        if (typeof exclude !== 'string') {
          // encode(string, keepEscaped)
          keepEscaped = exclude;
          exclude = encode.defaultChars;
        }

        if (typeof keepEscaped === 'undefined') {
          keepEscaped = true;
        }

        cache = getEncodeCache(exclude);

        for (i = 0, l = string.length; i < l; i++) {
          code = string.charCodeAt(i);

          if (keepEscaped && code === 0x25 && i + 2 < l) {
            if (/^[0-9a-f]{2}$/i.test(string.slice(i + 1, i + 3))) {
              result += string.slice(i, i + 3);
              i += 2;
              continue;
            }
          }

          if (code < 128) {
            result += cache[code];
            continue;
          }

          if (code >= 0xD800 && code <= 0xDFFF) {
            if (code >= 0xD800 && code <= 0xDBFF && i + 1 < l) {
              nextCode = string.charCodeAt(i + 1);
              if (nextCode >= 0xDC00 && nextCode <= 0xDFFF) {
                result += encodeURIComponent(string[i] + string[i + 1]);
                i++;
                continue;
              }
            }
            result += '%EF%BF%BD';
            continue;
          }

          result += encodeURIComponent(string[i]);
        }

        return result;
      }

      encode.defaultChars = ";/?:@&=+$,-_.!~*'()#";
      encode.componentChars = "-_.!~*'()";


      module.exports = encode;

    }, {}], 5: [function (require, module, exports) {
      "use strict";

      // derived from https://github.com/mathiasbynens/String.fromCodePoint
      /*! http://mths.be/fromcodepoint v0.2.1 by @mathias */
      if (String.fromCodePoint) {
        module.exports = function (_) {
          try {
            return String.fromCodePoint(_);
          } catch (e) {
            if (e instanceof RangeError) {
              return String.fromCharCode(0xFFFD);
            }
            throw e;
          }
        };

      } else {

        var stringFromCharCode = String.fromCharCode;
        var floor = Math.floor;
        var fromCodePoint = function () {
          var MAX_SIZE = 0x4000;
          var codeUnits = [];
          var highSurrogate;
          var lowSurrogate;
          var index = -1;
          var length = arguments.length;
          if (!length) {
            return '';
          }
          var result = '';
          while (++index < length) {
            var codePoint = Number(arguments[index]);
            if (
                !isFinite(codePoint) || // `NaN`, `+Infinity`, or `-Infinity`
                    codePoint < 0 || // not a valid Unicode code point
                    codePoint > 0x10FFFF || // not a valid Unicode code point
                    floor(codePoint) !== codePoint // not an integer
            ) {
              return String.fromCharCode(0xFFFD);
            }
            if (codePoint <= 0xFFFF) { // BMP code point
              codeUnits.push(codePoint);
            } else { // Astral code point; split in surrogate halves
              // http://mathiasbynens.be/notes/javascript-encoding#surrogate-formulae
              codePoint -= 0x10000;
              highSurrogate = (codePoint >> 10) + 0xD800;
              lowSurrogate = (codePoint % 0x400) + 0xDC00;
              codeUnits.push(highSurrogate, lowSurrogate);
            }
            if (index + 1 === length || codeUnits.length > MAX_SIZE) {
              result += stringFromCharCode.apply(null, codeUnits);
              codeUnits.length = 0;
            }
          }
          return result;
        };
        module.exports = fromCodePoint;
      }

    }, {}], 6: [function (require, module, exports) {
      "use strict";

      var escapeXml = require('./common').escapeXml;

      // Helper function to produce an HTML tag.
      var tag = function (name, attrs, selfclosing) {
        var result = '<' + name;
        if (attrs && attrs.length > 0) {
          var i = 0;
          var attrib;
          while ((attrib = attrs[i]) !== undefined) {
            result += ' ' + attrib[0] + '="' + attrib[1] + '"';
            i++;
          }
        }
        if (selfclosing) {
          result += ' /';
        }

        result += '>';
        return result;
      };

      var reHtmlTag = /\<[^>]*\>/;

      var renderNodes = function (block) {

        var attrs;
        var info_words;
        var tagname;
        var walker = block.walker();
        var event, node, entering;
        var buffer = "";
        var lastOut = "\n";
        var disableTags = 0;
        var grandparent;
        var out = function (s) {
          if (disableTags > 0) {
            buffer += s.replace(reHtmlTag, '');
          } else {
            buffer += s;
          }
          lastOut = s;
        };
        var esc = this.escape;
        var cr = function () {
          if (lastOut !== '\n') {
            buffer += '\n';
            lastOut = '\n';
          }
        };

        var options = this.options;

        if (options.time) { console.time("rendering"); }

        while ((event = walker.next())) {
          entering = event.entering;
          node = event.node;

          attrs = [];
          if (options.sourcepos) {
            var pos = node.sourcepos;
            if (pos) {
              attrs.push(['data-sourcepos', String(pos[0][0]) + ':' +
                          String(pos[0][1]) + '-' + String(pos[1][0]) + ':' +
                          String(pos[1][1])]);
            }
          }

          switch (node.type) {
            case 'Text':
              out(esc(node.literal, false));
              break;

            case 'Softbreak':
              out(this.softbreak);
              break;

            case 'Hardbreak':
              out(tag('br', [], true));
              cr();
              break;

            case 'Emph':
              out(tag(entering ? 'em' : '/em'));
              break;

            case 'Strong':
              out(tag(entering ? 'strong' : '/strong'));
              break;

            case 'Html':
              out(node.literal);
              break;

            case 'Link':
              if (entering) {
                attrs.push(['href', esc(node.destination, true)]);
                if (node.title) {
                  attrs.push(['title', esc(node.title, true)]);
                }
                out(tag('a', attrs));
              } else {
                out(tag('/a'));
              }
              break;

            case 'Image':
              if (entering) {
                if (disableTags === 0) {
                  out('<img src="' + esc(node.destination, true) +
                      '" alt="');
                }
                disableTags += 1;
              } else {
                disableTags -= 1;
                if (disableTags === 0) {
                  if (node.title) {
                    out('" title="' + esc(node.title, true));
                  }
                  out('" />');
                }
              }
              break;

            case 'Code':
              out(tag('code') + esc(node.literal, false) + tag('/code'));
              break;

            case 'Document':
              break;

            case 'Paragraph':
              grandparent = node.parent.parent;
              if (grandparent !== null &&
                  grandparent.type === 'List') {
                if (grandparent.listTight) {
                  break;
                }
              }
              if (entering) {
                cr();
                out(tag('p', attrs));
              } else {
                out(tag('/p'));
                cr();
              }
              break;

            case 'BlockQuote':
              if (entering) {
                cr();
                out(tag('blockquote', attrs));
                cr();
              } else {
                cr();
                out(tag('/blockquote'));
                cr();
              }
              break;

            case 'Item':
              if (entering) {
                out(tag('li', attrs));
              } else {
                out(tag('/li'));
                cr();
              }
              break;

            case 'List':
              tagname = node.listType === 'Bullet' ? 'ul' : 'ol';
              if (entering) {
                var start = node.listStart;
                if (start !== null && start !== 1) {
                  attrs.push(['start', start.toString()]);
                }
                cr();
                out(tag(tagname, attrs));
                cr();
              } else {
                cr();
                out(tag('/' + tagname));
                cr();
              }
              break;

            case 'Header':
              tagname = 'h' + node.level;
              if (entering) {
                cr();
                out(tag(tagname, attrs));
              } else {
                out(tag('/' + tagname));
                cr();
              }
              break;

            case 'CodeBlock':
              info_words = node.info ? node.info.split(/ +/) : [];
              if (info_words.length > 0 && info_words[0].length > 0) {
                attrs.push(['class', 'language-' + esc(info_words[0], true)]);
              }
              cr();
              out(tag('pre') + tag('code', attrs));
              out(esc(node.literal, false));
              out(tag('/code') + tag('/pre'));
              cr();
              break;

            case 'HtmlBlock':
              cr();
              out(node.literal);
              cr();
              break;

            case 'HorizontalRule':
              cr();
              out(tag('hr', attrs, true));
              cr();
              break;

            default:
              throw "Unknown node type " + node.type;
          }

        }
        if (options.time) { console.timeEnd("rendering"); }
        return buffer;
      };

      // The HtmlRenderer object.
      function HtmlRenderer(options) {
        return {
          // default options:
          softbreak: '\n', // by default, soft breaks are rendered as newlines in HTML
          // set to "<br />" to make them hard breaks
          // set to " " if you want to ignore line wrapping in source
          escape: escapeXml,
          options: options || {},
          render: renderNodes
        };
      }

      module.exports = HtmlRenderer;

    }, { "./common": 2 }], 7: [function (require, module, exports) {
      "use strict";

      var fromCodePoint = require('./from-code-point');

      var entities = {
        "AAacute": 193,
        "aacute": 225,
        "Abreve": 258,
        "abreve": 259,
        "ac": 8766,
        "acd": 8767,
        "acE": 8766,
        "Acirc": 194,
        "acirc": 226,
        "acute": 180,
        "Acy": 1040,
        "acy": 1072,
        "AElig": 198,
        "aelig": 230,
        "af": 8289,
        "Afr": 55349,
        "afr": 55349,
        "Agrave": 192,
        "agrave": 224,
        "alefsym": 8501,
        "aleph": 8501,
        "Alpha": 913,
        "alpha": 945,
        "Amacr": 256,
        "amacr": 257,
        "amalg": 10815,
        "amp": 38,
        "AMP": 38,
        "andand": 10837,
        "And": 10835,
        "and": 8743,
        "andd": 10844,
        "andslope": 10840,
        "andv": 10842,
        "ang": 8736,
        "ange": 10660,
        "angle": 8736,
        "angmsdaa": 10664,
        "angmsdab": 10665,
        "angmsdac": 10666,
        "angmsdad": 10667,
        "angmsdae": 10668,
        "angmsdaf": 10669,
        "angmsdag": 10670,
        "angmsdah": 10671,
        "angmsd": 8737,
        "angrt": 8735,
        "angrtvb": 8894,
        "angrtvbd": 10653,
        "angsph": 8738,
        "angst": 197,
        "angzarr": 9084,
        "Aogon": 260,
        "aogon": 261,
        "Aopf": 55349,
        "aopf": 55349,
        "apacir": 10863,
        "ap": 8776,
        "apE": 10864,
        "ape": 8778,
        "apid": 8779,
        "apos": 39,
        "ApplyFunction": 8289,
        "approx": 8776,
        "approxeq": 8778,
        "Aring": 197,
        "aring": 229,
        "Ascr": 55349,
        "ascr": 55349,
        "Assign": 8788,
        "ast": 42,
        "asymp": 8776,
        "asympeq": 8781,
        "Atilde": 195,
        "atilde": 227,
        "Auml": 196,
        "auml": 228,
        "awconint": 8755,
        "awint": 10769,
        "backcong": 8780,
        "backepsilon": 1014,
        "backprime": 8245,
        "backsim": 8765,
        "backsimeq": 8909,
        "Backslash": 8726,
        "Barv": 10983,
        "barvee": 8893,
        "barwed": 8965,
        "Barwed": 8966,
        "barwedge": 8965,
        "bbrk": 9141,
        "bbrktbrk": 9142,
        "bcong": 8780,
        "Bcy": 1041,
        "bcy": 1073,
        "bdquo": 8222,
        "becaus": 8757,
        "because": 8757,
        "Because": 8757,
        "bemptyv": 10672,
        "bepsi": 1014,
        "bernou": 8492,
        "Bernoullis": 8492,
        "Beta": 914,
        "beta": 946,
        "beth": 8502,
        "between": 8812,
        "Bfr": 55349,
        "bfr": 55349,
        "bigcap": 8898,
        "bigcirc": 9711,
        "bigcup": 8899,
        "bigodot": 10752,
        "bigoplus": 10753,
        "bigotimes": 10754,
        "bigsqcup": 10758,
        "bigstar": 9733,
        "bigtriangledown": 9661,
        "bigtriangleup": 9651,
        "biguplus": 10756,
        "bigvee": 8897,
        "bigwedge": 8896,
        "bkarow": 10509,
        "blacklozenge": 10731,
        "blacksquare": 9642,
        "blacktriangle": 9652,
        "blacktriangledown": 9662,
        "blacktriangleleft": 9666,
        "blacktriangleright": 9656,
        "blank": 9251,
        "blk12": 9618,
        "blk14": 9617,
        "blk34": 9619,
        "block": 9608,
        "bne": 61,
        "bnequiv": 8801,
        "bNot": 10989,
        "bnot": 8976,
        "Bopf": 55349,
        "bopf": 55349,
        "bot": 8869,
        "bottom": 8869,
        "bowtie": 8904,
        "boxbox": 10697,
        "boxdl": 9488,
        "boxdL": 9557,
        "boxDl": 9558,
        "boxDL": 9559,
        "boxdr": 9484,
        "boxdR": 9554,
        "boxDr": 9555,
        "boxDR": 9556,
        "boxh": 9472,
        "boxH": 9552,
        "boxhd": 9516,
        "boxHd": 9572,
        "boxhD": 9573,
        "boxHD": 9574,
        "boxhu": 9524,
        "boxHu": 9575,
        "boxhU": 9576,
        "boxHU": 9577,
        "boxminus": 8863,
        "boxplus": 8862,
        "boxtimes": 8864,
        "boxul": 9496,
        "boxuL": 9563,
        "boxUl": 9564,
        "boxUL": 9565,
        "boxur": 9492,
        "boxuR": 9560,
        "boxUr": 9561,
        "boxUR": 9562,
        "boxv": 9474,
        "boxV": 9553,
        "boxvh": 9532,
        "boxvH": 9578,
        "boxVh": 9579,
        "boxVH": 9580,
        "boxvl": 9508,
        "boxvL": 9569,
        "boxVl": 9570,
        "boxVL": 9571,
        "boxvr": 9500,
        "boxvR": 9566,
        "boxVr": 9567,
        "boxVR": 9568,
        "bprime": 8245,
        "breve": 728,
        "Breve": 728,
        "brvbar": 166,
        "bscr": 55349,
        "Bscr": 8492,
        "bsemi": 8271,
        "bsim": 8765,
        "bsime": 8909,
        "bsolb": 10693,
        "bsol": 92,
        "bsolhsub": 10184,
        "bull": 8226,
        "bullet": 8226,
        "bump": 8782,
        "bumpE": 10926,
        "bumpe": 8783,
        "Bumpeq": 8782,
        "bumpeq": 8783,
        "Cacute": 262,
        "cacute": 263,
        "capand": 10820,
        "capbrcup": 10825,
        "capcap": 10827,
        "cap": 8745,
        "Cap": 8914,
        "capcup": 10823,
        "capdot": 10816,
        "CapitalDifferentialD": 8517,
        "caps": 8745,
        "caret": 8257,
        "caron": 711,
        "Cayleys": 8493,
        "ccaps": 10829,
        "Ccaron": 268,
        "ccaron": 269,
        "Ccedil": 199,
        "ccedil": 231,
        "Ccirc": 264,
        "ccirc": 265,
        "Cconint": 8752,
        "ccups": 10828,
        "ccupssm": 10832,
        "Cdot": 266,
        "cdot": 267,
        "cedil": 184,
        "Cedilla": 184,
        "cemptyv": 10674,
        "cent": 162,
        "centerdot": 183,
        "CenterDot": 183,
        "cfr": 55349,
        "Cfr": 8493,
        "CHcy": 1063,
        "chcy": 1095,
        "check": 10003,
        "checkmark": 10003,
        "Chi": 935,
        "chi": 967,
        "circ": 710,
        "circeq": 8791,
        "circlearrowleft": 8634,
        "circlearrowright": 8635,
        "circledast": 8859,
        "circledcirc": 8858,
        "circleddash": 8861,
        "CircleDot": 8857,
        "circledR": 174,
        "circledS": 9416,
        "CircleMinus": 8854,
        "CirclePlus": 8853,
        "CircleTimes": 8855,
        "cir": 9675,
        "cirE": 10691,
        "cire": 8791,
        "cirfnint": 10768,
        "cirmid": 10991,
        "cirscir": 10690,
        "ClockwiseContourIntegral": 8754,
        "CloseCurlyDoubleQuote": 8221,
        "CloseCurlyQuote": 8217,
        "clubs": 9827,
        "clubsuit": 9827,
        "colon": 58,
        "Colon": 8759,
        "Colone": 10868,
        "colone": 8788,
        "coloneq": 8788,
        "comma": 44,
        "commat": 64,
        "comp": 8705,
        "compfn": 8728,
        "complement": 8705,
        "complexes": 8450,
        "cong": 8773,
        "congdot": 10861,
        "Congruent": 8801,
        "conint": 8750,
        "Conint": 8751,
        "ContourIntegral": 8750,
        "copf": 55349,
        "Copf": 8450,
        "coprod": 8720,
        "Coproduct": 8720,
        "copy": 169,
        "COPY": 169,
        "copysr": 8471,
        "CounterClockwiseContourIntegral": 8755,
        "crarr": 8629,
        "cross": 10007,
        "Cross": 10799,
        "Cscr": 55349,
        "cscr": 55349,
        "csub": 10959,
        "csube": 10961,
        "csup": 10960,
        "csupe": 10962,
        "ctdot": 8943,
        "cudarrl": 10552,
        "cudarrr": 10549,
        "cuepr": 8926,
        "cuesc": 8927,
        "cularr": 8630,
        "cularrp": 10557,
        "cupbrcap": 10824,
        "cupcap": 10822,
        "CupCap": 8781,
        "cup": 8746,
        "Cup": 8915,
        "cupcup": 10826,
        "cupdot": 8845,
        "cupor": 10821,
        "cups": 8746,
        "curarr": 8631,
        "curarrm": 10556,
        "curlyeqprec": 8926,
        "curlyeqsucc": 8927,
        "curlyvee": 8910,
        "curlywedge": 8911,
        "curren": 164,
        "curvearrowleft": 8630,
        "curvearrowright": 8631,
        "cuvee": 8910,
        "cuwed": 8911,
        "cwconint": 8754,
        "cwint": 8753,
        "cylcty": 9005,
        "dagger": 8224,
        "Dagger": 8225,
        "daleth": 8504,
        "darr": 8595,
        "Darr": 8609,
        "dArr": 8659,
        "dash": 8208,
        "Dashv": 10980,
        "dashv": 8867,
        "dbkarow": 10511,
        "dblac": 733,
        "Dcaron": 270,
        "dcaron": 271,
        "Dcy": 1044,
        "dcy": 1076,
        "ddagger": 8225,
        "ddarr": 8650,
        "DD": 8517,
        "dd": 8518,
        "DDotrahd": 10513,
        "ddotseq": 10871,
        "deg": 176,
        "Del": 8711,
        "Delta": 916,
        "delta": 948,
        "demptyv": 10673,
        "dfisht": 10623,
        "Dfr": 55349,
        "dfr": 55349,
        "dHar": 10597,
        "dharl": 8643,
        "dharr": 8642,
        "DiacriticalAcute": 180,
        "DiacriticalDot": 729,
        "DiacriticalDoubleAcute": 733,
        "DiacriticalGrave": 96,
        "DiacriticalTilde": 732,
        "diam": 8900,
        "diamond": 8900,
        "Diamond": 8900,
        "diamondsuit": 9830,
        "diams": 9830,
        "die": 168,
        "DifferentialD": 8518,
        "digamma": 989,
        "disin": 8946,
        "div": 247,
        "divide": 247,
        "divideontimes": 8903,
        "divonx": 8903,
        "DJcy": 1026,
        "djcy": 1106,
        "dlcorn": 8990,
        "dlcrop": 8973,
        "dollar": 36,
        "Dopf": 55349,
        "dopf": 55349,
        "Dot": 168,
        "dot": 729,
        "DotDot": 8412,
        "doteq": 8784,
        "doteqdot": 8785,
        "DotEqual": 8784,
        "dotminus": 8760,
        "dotplus": 8724,
        "dotsquare": 8865,
        "doublebarwedge": 8966,
        "DoubleContourIntegral": 8751,
        "DoubleDot": 168,
        "DoubleDownArrow": 8659,
        "DoubleLeftArrow": 8656,
        "DoubleLeftRightArrow": 8660,
        "DoubleLeftTee": 10980,
        "DoubleLongLeftArrow": 10232,
        "DoubleLongLeftRightArrow": 10234,
        "DoubleLongRightArrow": 10233,
        "DoubleRightArrow": 8658,
        "DoubleRightTee": 8872,
        "DoubleUpArrow": 8657,
        "DoubleUpDownArrow": 8661,
        "DoubleVerticalBar": 8741,
        "DownArrowBar": 10515,
        "downarrow": 8595,
        "DownArrow": 8595,
        "Downarrow": 8659,
        "DownArrowUpArrow": 8693,
        "DownBreve": 785,
        "downdownarrows": 8650,
        "downharpoonleft": 8643,
        "downharpoonright": 8642,
        "DownLeftRightVector": 10576,
        "DownLeftTeeVector": 10590,
        "DownLeftVectorBar": 10582,
        "DownLeftVector": 8637,
        "DownRightTeeVector": 10591,
        "DownRightVectorBar": 10583,
        "DownRightVector": 8641,
        "DownTeeArrow": 8615,
        "DownTee": 8868,
        "drbkarow": 10512,
        "drcorn": 8991,
        "drcrop": 8972,
        "Dscr": 55349,
        "dscr": 55349,
        "DScy": 1029,
        "dscy": 1109,
        "dsol": 10742,
        "Dstrok": 272,
        "dstrok": 273,
        "dtdot": 8945,
        "dtri": 9663,
        "dtrif": 9662,
        "duarr": 8693,
        "duhar": 10607,
        "dwangle": 10662,
        "DZcy": 1039,
        "dzcy": 1119,
        "dzigrarr": 10239,
        "Eacute": 201,
        "eacute": 233,
        "easter": 10862,
        "Ecaron": 282,
        "ecaron": 283,
        "Ecirc": 202,
        "ecirc": 234,
        "ecir": 8790,
        "ecolon": 8789,
        "Ecy": 1069,
        "ecy": 1101,
        "eDDot": 10871,
        "Edot": 278,
        "edot": 279,
        "eDot": 8785,
        "ee": 8519,
        "efDot": 8786,
        "Efr": 55349,
        "efr": 55349,
        "eg": 10906,
        "Egrave": 200,
        "egrave": 232,
        "egs": 10902,
        "egsdot": 10904,
        "el": 10905,
        "Element": 8712,
        "elinters": 9191,
        "ell": 8467,
        "els": 10901,
        "elsdot": 10903,
        "Emacr": 274,
        "emacr": 275,
        "empty": 8709,
        "emptyset": 8709,
        "EmptySmallSquare": 9723,
        "emptyv": 8709,
        "EmptyVerySmallSquare": 9643,
        "emsp13": 8196,
        "emsp14": 8197,
        "emsp": 8195,
        "ENG": 330,
        "eng": 331,
        "ensp": 8194,
        "Eogon": 280,
        "eogon": 281,
        "Eopf": 55349,
        "eopf": 55349,
        "epar": 8917,
        "eparsl": 10723,
        "eplus": 10865,
        "epsi": 949,
        "Epsilon": 917,
        "epsilon": 949,
        "epsiv": 1013,
        "eqcirc": 8790,
        "eqcolon": 8789,
        "eqsim": 8770,
        "eqslantgtr": 10902,
        "eqslantless": 10901,
        "Equal": 10869,
        "equals": 61,
        "EqualTilde": 8770,
        "equest": 8799,
        "Equilibrium": 8652,
        "equiv": 8801,
        "equivDD": 10872,
        "eqvparsl": 10725,
        "erarr": 10609,
        "erDot": 8787,
        "escr": 8495,
        "Escr": 8496,
        "esdot": 8784,
        "Esim": 10867,
        "esim": 8770,
        "Eta": 919,
        "eta": 951,
        "ETH": 208,
        "eth": 240,
        "Euml": 203,
        "euml": 235,
        "euro": 8364,
        "excl": 33,
        "exist": 8707,
        "Exists": 8707,
        "expectation": 8496,
        "exponentiale": 8519,
        "ExponentialE": 8519,
        "fallingdotseq": 8786,
        "Fcy": 1060,
        "fcy": 1092,
        "female": 9792,
        "ffilig": 64259,
        "fflig": 64256,
        "ffllig": 64260,
        "Ffr": 55349,
        "ffr": 55349,
        "filig": 64257,
        "FilledSmallSquare": 9724,
        "FilledVerySmallSquare": 9642,
        "fjlig": 102,
        "flat": 9837,
        "fllig": 64258,
        "fltns": 9649,
        "fnof": 402,
        "Fopf": 55349,
        "fopf": 55349,
        "forall": 8704,
        "ForAll": 8704,
        "fork": 8916,
        "forkv": 10969,
        "Fouriertrf": 8497,
        "fpartint": 10765,
        "frac12": 189,
        "frac13": 8531,
        "frac14": 188,
        "frac15": 8533,
        "frac16": 8537,
        "frac18": 8539,
        "frac23": 8532,
        "frac25": 8534,
        "frac34": 190,
        "frac35": 8535,
        "frac38": 8540,
        "frac45": 8536,
        "frac56": 8538,
        "frac58": 8541,
        "frac78": 8542,
        "frasl": 8260,
        "frown": 8994,
        "fscr": 55349,
        "Fscr": 8497,
        "gacute": 501,
        "Gamma": 915,
        "gamma": 947,
        "Gammad": 988,
        "gammad": 989,
        "gap": 10886,
        "Gbreve": 286,
        "gbreve": 287,
        "Gcedil": 290,
        "Gcirc": 284,
        "gcirc": 285,
        "Gcy": 1043,
        "gcy": 1075,
        "Gdot": 288,
        "gdot": 289,
        "ge": 8805,
        "gE": 8807,
        "gEl": 10892,
        "gel": 8923,
        "geq": 8805,
        "geqq": 8807,
        "geqslant": 10878,
        "gescc": 10921,
        "ges": 10878,
        "gesdot": 10880,
        "gesdoto": 10882,
        "gesdotol": 10884,
        "gesl": 8923,
        "gesles": 10900,
        "Gfr": 55349,
        "gfr": 55349,
        "gg": 8811,
        "Gg": 8921,
        "ggg": 8921,
        "gimel": 8503,
        "GJcy": 1027,
        "gjcy": 1107,
        "gla": 10917,
        "gl": 8823,
        "glE": 10898,
        "glj": 10916,
        "gnap": 10890,
        "gnapprox": 10890,
        "gne": 10888,
        "gnE": 8809,
        "gneq": 10888,
        "gneqq": 8809,
        "gnsim": 8935,
        "Gopf": 55349,
        "gopf": 55349,
        "grave": 96,
        "GreaterEqual": 8805,
        "GreaterEqualLess": 8923,
        "GreaterFullEqual": 8807,
        "GreaterGreater": 10914,
        "GreaterLess": 8823,
        "GreaterSlantEqual": 10878,
        "GreaterTilde": 8819,
        "Gscr": 55349,
        "gscr": 8458,
        "gsim": 8819,
        "gsime": 10894,
        "gsiml": 10896,
        "gtcc": 10919,
        "gtcir": 10874,
        "gt": 62,
        "GT": 62,
        "Gt": 8811,
        "gtdot": 8919,
        "gtlPar": 10645,
        "gtquest": 10876,
        "gtrapprox": 10886,
        "gtrarr": 10616,
        "gtrdot": 8919,
        "gtreqless": 8923,
        "gtreqqless": 10892,
        "gtrless": 8823,
        "gtrsim": 8819,
        "gvertneqq": 8809,
        "gvnE": 8809,
        "Hacek": 711,
        "hairsp": 8202,
        "half": 189,
        "hamilt": 8459,
        "HARDcy": 1066,
        "hardcy": 1098,
        "harrcir": 10568,
        "harr": 8596,
        "hArr": 8660,
        "harrw": 8621,
        "Hat": 94,
        "hbar": 8463,
        "Hcirc": 292,
        "hcirc": 293,
        "hearts": 9829,
        "heartsuit": 9829,
        "hellip": 8230,
        "hercon": 8889,
        "hfr": 55349,
        "Hfr": 8460,
        "HilbertSpace": 8459,
        "hksearow": 10533,
        "hkswarow": 10534,
        "hoarr": 8703,
        "homtht": 8763,
        "hookleftarrow": 8617,
        "hookrightarrow": 8618,
        "hopf": 55349,
        "Hopf": 8461,
        "horbar": 8213,
        "HorizontalLine": 9472,
        "hscr": 55349,
        "Hscr": 8459,
        "hslash": 8463,
        "Hstrok": 294,
        "hstrok": 295,
        "HumpDownHump": 8782,
        "HumpEqual": 8783,
        "hybull": 8259,
        "hyphen": 8208,
        "Iacute": 205,
        "iacute": 237,
        "ic": 8291,
        "Icirc": 206,
        "icirc": 238,
        "Icy": 1048,
        "icy": 1080,
        "Idot": 304,
        "IEcy": 1045,
        "iecy": 1077,
        "iexcl": 161,
        "iff": 8660,
        "ifr": 55349,
        "Ifr": 8465,
        "Igrave": 204,
        "igrave": 236,
        "ii": 8520,
        "iiiint": 10764,
        "iiint": 8749,
        "iinfin": 10716,
        "iiota": 8489,
        "IJlig": 306,
        "ijlig": 307,
        "Imacr": 298,
        "imacr": 299,
        "image": 8465,
        "ImaginaryI": 8520,
        "imagline": 8464,
        "imagpart": 8465,
        "imath": 305,
        "Im": 8465,
        "imof": 8887,
        "imped": 437,
        "Implies": 8658,
        "incare": 8453,
        '"in"': 8712,
        "infin": 8734,
        "infintie": 10717,
        "inodot": 305,
        "intcal": 8890,
        "int": 8747,
        "Int": 8748,
        "integers": 8484,
        "Integral": 8747,
        "intercal": 8890,
        "Intersection": 8898,
        "intlarhk": 10775,
        "intprod": 10812,
        "InvisibleComma": 8291,
        "InvisibleTimes": 8290,
        "IOcy": 1025,
        "iocy": 1105,
        "Iogon": 302,
        "iogon": 303,
        "Iopf": 55349,
        "iopf": 55349,
        "Iota": 921,
        "iota": 953,
        "iprod": 10812,
        "iquest": 191,
        "iscr": 55349,
        "Iscr": 8464,
        "isin": 8712,
        "isindot": 8949,
        "isinE": 8953,
        "isins": 8948,
        "isinsv": 8947,
        "isinv": 8712,
        "it": 8290,
        "Itilde": 296,
        "itilde": 297,
        "Iukcy": 1030,
        "iukcy": 1110,
        "Iuml": 207,
        "iuml": 239,
        "Jcirc": 308,
        "jcirc": 309,
        "Jcy": 1049,
        "jcy": 1081,
        "Jfr": 55349,
        "jfr": 55349,
        "jmath": 567,
        "Jopf": 55349,
        "jopf": 55349,
        "Jscr": 55349,
        "jscr": 55349,
        "Jsercy": 1032,
        "jsercy": 1112,
        "Jukcy": 1028,
        "jukcy": 1108,
        "Kappa": 922,
        "kappa": 954,
        "kappav": 1008,
        "Kcedil": 310,
        "kcedil": 311,
        "Kcy": 1050,
        "kcy": 1082,
        "Kfr": 55349,
        "kfr": 55349,
        "kgreen": 312,
        "KHcy": 1061,
        "khcy": 1093,
        "KJcy": 1036,
        "kjcy": 1116,
        "Kopf": 55349,
        "kopf": 55349,
        "Kscr": 55349,
        "kscr": 55349,
        "lAarr": 8666,
        "Lacute": 313,
        "lacute": 314,
        "laemptyv": 10676,
        "lagran": 8466,
        "Lambda": 923,
        "lambda": 955,
        "lang": 10216,
        "Lang": 10218,
        "langd": 10641,
        "langle": 10216,
        "lap": 10885,
        "Laplacetrf": 8466,
        "laquo": 171,
        "larrb": 8676,
        "larrbfs": 10527,
        "larr": 8592,
        "Larr": 8606,
        "lArr": 8656,
        "larrfs": 10525,
        "larrhk": 8617,
        "larrlp": 8619,
        "larrpl": 10553,
        "larrsim": 10611,
        "larrtl": 8610,
        "latail": 10521,
        "lAtail": 10523,
        "lat": 10923,
        "late": 10925,
        "lates": 10925,
        "lbarr": 10508,
        "lBarr": 10510,
        "lbbrk": 10098,
        "lbrace": 123,
        "lbrack": 91,
        "lbrke": 10635,
        "lbrksld": 10639,
        "lbrkslu": 10637,
        "Lcaron": 317,
        "lcaron": 318,
        "Lcedil": 315,
        "lcedil": 316,
        "lceil": 8968,
        "lcub": 123,
        "Lcy": 1051,
        "lcy": 1083,
        "ldca": 10550,
        "ldquo": 8220,
        "ldquor": 8222,
        "ldrdhar": 10599,
        "ldrushar": 10571,
        "ldsh": 8626,
        "le": 8804,
        "lE": 8806,
        "LeftAngleBracket": 10216,
        "LeftArrowBar": 8676,
        "leftarrow": 8592,
        "LeftArrow": 8592,
        "Leftarrow": 8656,
        "LeftArrowRightArrow": 8646,
        "leftarrowtail": 8610,
        "LeftCeiling": 8968,
        "LeftDoubleBracket": 10214,
        "LeftDownTeeVector": 10593,
        "LeftDownVectorBar": 10585,
        "LeftDownVector": 8643,
        "LeftFloor": 8970,
        "leftharpoondown": 8637,
        "leftharpoonup": 8636,
        "leftleftarrows": 8647,
        "leftrightarrow": 8596,
        "LeftRightArrow": 8596,
        "Leftrightarrow": 8660,
        "leftrightarrows": 8646,
        "leftrightharpoons": 8651,
        "leftrightsquigarrow": 8621,
        "LeftRightVector": 10574,
        "LeftTeeArrow": 8612,
        "LeftTee": 8867,
        "LeftTeeVector": 10586,
        "leftthreetimes": 8907,
        "LeftTriangleBar": 10703,
        "LeftTriangle": 8882,
        "LeftTriangleEqual": 8884,
        "LeftUpDownVector": 10577,
        "LeftUpTeeVector": 10592,
        "LeftUpVectorBar": 10584,
        "LeftUpVector": 8639,
        "LeftVectorBar": 10578,
        "LeftVector": 8636,
        "lEg": 10891,
        "leg": 8922,
        "leq": 8804,
        "leqq": 8806,
        "leqslant": 10877,
        "lescc": 10920,
        "les": 10877,
        "lesdot": 10879,
        "lesdoto": 10881,
        "lesdotor": 10883,
        "lesg": 8922,
        "lesges": 10899,
        "lessapprox": 10885,
        "lessdot": 8918,
        "lesseqgtr": 8922,
        "lesseqqgtr": 10891,
        "LessEqualGreater": 8922,
        "LessFullEqual": 8806,
        "LessGreater": 8822,
        "lessgtr": 8822,
        "LessLess": 10913,
        "lesssim": 8818,
        "LessSlantEqual": 10877,
        "LessTilde": 8818,
        "lfisht": 10620,
        "lfloor": 8970,
        "Lfr": 55349,
        "lfr": 55349,
        "lg": 8822,
        "lgE": 10897,
        "lHar": 10594,
        "lhard": 8637,
        "lharu": 8636,
        "lharul": 10602,
        "lhblk": 9604,
        "LJcy": 1033,
        "ljcy": 1113,
        "llarr": 8647,
        "ll": 8810,
        "Ll": 8920,
        "llcorner": 8990,
        "Lleftarrow": 8666,
        "llhard": 10603,
        "lltri": 9722,
        "Lmidot": 319,
        "lmidot": 320,
        "lmoustache": 9136,
        "lmoust": 9136,
        "lnap": 10889,
        "lnapprox": 10889,
        "lne": 10887,
        "lnE": 8808,
        "lneq": 10887,
        "lneqq": 8808,
        "lnsim": 8934,
        "loang": 10220,
        "loarr": 8701,
        "lobrk": 10214,
        "longleftarrow": 10229,
        "LongLeftArrow": 10229,
        "Longleftarrow": 10232,
        "longleftrightarrow": 10231,
        "LongLeftRightArrow": 10231,
        "Longleftrightarrow": 10234,
        "longmapsto": 10236,
        "longrightarrow": 10230,
        "LongRightArrow": 10230,
        "Longrightarrow": 10233,
        "looparrowleft": 8619,
        "looparrowright": 8620,
        "lopar": 10629,
        "Lopf": 55349,
        "lopf": 55349,
        "loplus": 10797,
        "lotimes": 10804,
        "lowast": 8727,
        "lowbar": 95,
        "LowerLeftArrow": 8601,
        "LowerRightArrow": 8600,
        "loz": 9674,
        "lozenge": 9674,
        "lozf": 10731,
        "lpar": 40,
        "lparlt": 10643,
        "lrarr": 8646,
        "lrcorner": 8991,
        "lrhar": 8651,
        "lrhard": 10605,
        "lrm": 8206,
        "lrtri": 8895,
        "lsaquo": 8249,
        "lscr": 55349,
        "Lscr": 8466,
        "lsh": 8624,
        "Lsh": 8624,
        "lsim": 8818,
        "lsime": 10893,
        "lsimg": 10895,
        "lsqb": 91,
        "lsquo": 8216,
        "lsquor": 8218,
        "Lstrok": 321,
        "lstrok": 322,
        "ltcc": 10918,
        "ltcir": 10873,
        "lt": 60,
        "LT": 60,
        "Lt": 8810,
        "ltdot": 8918,
        "lthree": 8907,
        "ltimes": 8905,
        "ltlarr": 10614,
        "ltquest": 10875,
        "ltri": 9667,
        "ltrie": 8884,
        "ltrif": 9666,
        "ltrPar": 10646,
        "lurdshar": 10570,
        "luruhar": 10598,
        "lvertneqq": 8808,
        "lvnE": 8808,
        "macr": 175,
        "male": 9794,
        "malt": 10016,
        "maltese": 10016,
        "Map": 10501,
        "map": 8614,
        "mapsto": 8614,
        "mapstodown": 8615,
        "mapstoleft": 8612,
        "mapstoup": 8613,
        "marker": 9646,
        "mcomma": 10793,
        "Mcy": 1052,
        "mcy": 1084,
        "mdash": 8212,
        "mDDot": 8762,
        "measuredangle": 8737,
        "MediumSpace": 8287,
        "Mellintrf": 8499,
        "Mfr": 55349,
        "mfr": 55349,
        "mho": 8487,
        "micro": 181,
        "midast": 42,
        "midcir": 10992,
        "mid": 8739,
        "middot": 183,
        "minusb": 8863,
        "minus": 8722,
        "minusd": 8760,
        "minusdu": 10794,
        "MinusPlus": 8723,
        "mlcp": 10971,
        "mldr": 8230,
        "mnplus": 8723,
        "models": 8871,
        "Mopf": 55349,
        "mopf": 55349,
        "mp": 8723,
        "mscr": 55349,
        "Mscr": 8499,
        "mstpos": 8766,
        "Mu": 924,
        "mu": 956,
        "multimap": 8888,
        "mumap": 8888,
        "nabla": 8711,
        "Nacute": 323,
        "nacute": 324,
        "nang": 8736,
        "nap": 8777,
        "napE": 10864,
        "napid": 8779,
        "napos": 329,
        "napprox": 8777,
        "natural": 9838,
        "naturals": 8469,
        "natur": 9838,
        "nbsp": 160,
        "nbump": 8782,
        "nbumpe": 8783,
        "ncap": 10819,
        "Ncaron": 327,
        "ncaron": 328,
        "Ncedil": 325,
        "ncedil": 326,
        "ncong": 8775,
        "ncongdot": 10861,
        "ncup": 10818,
        "Ncy": 1053,
        "ncy": 1085,
        "ndash": 8211,
        "nearhk": 10532,
        "nearr": 8599,
        "neArr": 8663,
        "nearrow": 8599,
        "ne": 8800,
        "nedot": 8784,
        "NegativeMediumSpace": 8203,
        "NegativeThickSpace": 8203,
        "NegativeThinSpace": 8203,
        "NegativeVeryThinSpace": 8203,
        "nequiv": 8802,
        "nesear": 10536,
        "nesim": 8770,
        "NestedGreaterGreater": 8811,
        "NestedLessLess": 8810,
        "NewLine": 10,
        "nexist": 8708,
        "nexists": 8708,
        "Nfr": 55349,
        "nfr": 55349,
        "ngE": 8807,
        "nge": 8817,
        "ngeq": 8817,
        "ngeqq": 8807,
        "ngeqslant": 10878,
        "nges": 10878,
        "nGg": 8921,
        "ngsim": 8821,
        "nGt": 8811,
        "ngt": 8815,
        "ngtr": 8815,
        "nGtv": 8811,
        "nharr": 8622,
        "nhArr": 8654,
        "nhpar": 10994,
        "ni": 8715,
        "nis": 8956,
        "nisd": 8954,
        "niv": 8715,
        "NJcy": 1034,
        "njcy": 1114,
        "nlarr": 8602,
        "nlArr": 8653,
        "nldr": 8229,
        "nlE": 8806,
        "nle": 8816,
        "nleftarrow": 8602,
        "nLeftarrow": 8653,
        "nleftrightarrow": 8622,
        "nLeftrightarrow": 8654,
        "nleq": 8816,
        "nleqq": 8806,
        "nleqslant": 10877,
        "nles": 10877,
        "nless": 8814,
        "nLl": 8920,
        "nlsim": 8820,
        "nLt": 8810,
        "nlt": 8814,
        "nltri": 8938,
        "nltrie": 8940,
        "nLtv": 8810,
        "nmid": 8740,
        "NoBreak": 8288,
        "NonBreakingSpace": 160,
        "nopf": 55349,
        "Nopf": 8469,
        "Not": 10988,
        "not": 172,
        "NotCongruent": 8802,
        "NotCupCap": 8813,
        "NotDoubleVerticalBar": 8742,
        "NotElement": 8713,
        "NotEqual": 8800,
        "NotEqualTilde": 8770,
        "NotExists": 8708,
        "NotGreater": 8815,
        "NotGreaterEqual": 8817,
        "NotGreaterFullEqual": 8807,
        "NotGreaterGreater": 8811,
        "NotGreaterLess": 8825,
        "NotGreaterSlantEqual": 10878,
        "NotGreaterTilde": 8821,
        "NotHumpDownHump": 8782,
        "NotHumpEqual": 8783,
        "notin": 8713,
        "notindot": 8949,
        "notinE": 8953,
        "notinva": 8713,
        "notinvb": 8951,
        "notinvc": 8950,
        "NotLeftTriangleBar": 10703,
        "NotLeftTriangle": 8938,
        "NotLeftTriangleEqual": 8940,
        "NotLess": 8814,
        "NotLessEqual": 8816,
        "NotLessGreater": 8824,
        "NotLessLess": 8810,
        "NotLessSlantEqual": 10877,
        "NotLessTilde": 8820,
        "NotNestedGreaterGreater": 10914,
        "NotNestedLessLess": 10913,
        "notni": 8716,
        "notniva": 8716,
        "notnivb": 8958,
        "notnivc": 8957,
        "NotPrecedes": 8832,
        "NotPrecedesEqual": 10927,
        "NotPrecedesSlantEqual": 8928,
        "NotReverseElement": 8716,
        "NotRightTriangleBar": 10704,
        "NotRightTriangle": 8939,
        "NotRightTriangleEqual": 8941,
        "NotSquareSubset": 8847,
        "NotSquareSubsetEqual": 8930,
        "NotSquareSuperset": 8848,
        "NotSquareSupersetEqual": 8931,
        "NotSubset": 8834,
        "NotSubsetEqual": 8840,
        "NotSucceeds": 8833,
        "NotSucceedsEqual": 10928,
        "NotSucceedsSlantEqual": 8929,
        "NotSucceedsTilde": 8831,
        "NotSuperset": 8835,
        "NotSupersetEqual": 8841,
        "NotTilde": 8769,
        "NotTildeEqual": 8772,
        "NotTildeFullEqual": 8775,
        "NotTildeTilde": 8777,
        "NotVerticalBar": 8740,
        "nparallel": 8742,
        "npar": 8742,
        "nparsl": 11005,
        "npart": 8706,
        "npolint": 10772,
        "npr": 8832,
        "nprcue": 8928,
        "nprec": 8832,
        "npreceq": 10927,
        "npre": 10927,
        "nrarrc": 10547,
        "nrarr": 8603,
        "nrArr": 8655,
        "nrarrw": 8605,
        "nrightarrow": 8603,
        "nRightarrow": 8655,
        "nrtri": 8939,
        "nrtrie": 8941,
        "nsc": 8833,
        "nsccue": 8929,
        "nsce": 10928,
        "Nscr": 55349,
        "nscr": 55349,
        "nshortmid": 8740,
        "nshortparallel": 8742,
        "nsim": 8769,
        "nsime": 8772,
        "nsimeq": 8772,
        "nsmid": 8740,
        "nspar": 8742,
        "nsqsube": 8930,
        "nsqsupe": 8931,
        "nsub": 8836,
        "nsubE": 10949,
        "nsube": 8840,
        "nsubset": 8834,
        "nsubseteq": 8840,
        "nsubseteqq": 10949,
        "nsucc": 8833,
        "nsucceq": 10928,
        "nsup": 8837,
        "nsupE": 10950,
        "nsupe": 8841,
        "nsupset": 8835,
        "nsupseteq": 8841,
        "nsupseteqq": 10950,
        "ntgl": 8825,
        "Ntilde": 209,
        "ntilde": 241,
        "ntlg": 8824,
        "ntriangleleft": 8938,
        "ntrianglelefteq": 8940,
        "ntriangleright": 8939,
        "ntrianglerighteq": 8941,
        "Nu": 925,
        "nu": 957,
        "num": 35,
        "numero": 8470,
        "numsp": 8199,
        "nvap": 8781,
        "nvdash": 8876,
        "nvDash": 8877,
        "nVdash": 8878,
        "nVDash": 8879,
        "nvge": 8805,
        "nvgt": 62,
        "nvHarr": 10500,
        "nvinfin": 10718,
        "nvlArr": 10498,
        "nvle": 8804,
        "nvlt": 62,
        "nvltrie": 8884,
        "nvrArr": 10499,
        "nvrtrie": 8885,
        "nvsim": 8764,
        "nwarhk": 10531,
        "nwarr": 8598,
        "nwArr": 8662,
        "nwarrow": 8598,
        "nwnear": 10535,
        "Oacute": 211,
        "oacute": 243,
        "oast": 8859,
        "Ocirc": 212,
        "ocirc": 244,
        "ocir": 8858,
        "Ocy": 1054,
        "ocy": 1086,
        "odash": 8861,
        "Odblac": 336,
        "odblac": 337,
        "odiv": 10808,
        "odot": 8857,
        "odsold": 10684,
        "OElig": 338,
        "oelig": 339,
        "ofcir": 10687,
        "Ofr": 55349,
        "ofr": 55349,
        "ogon": 731,
        "Ograve": 210,
        "ograve": 242,
        "ogt": 10689,
        "ohbar": 10677,
        "ohm": 937,
        "oint": 8750,
        "olarr": 8634,
        "olcir": 10686,
        "olcross": 10683,
        "oline": 8254,
        "olt": 10688,
        "Omacr": 332,
        "omacr": 333,
        "Omega": 937,
        "omega": 969,
        "Omicron": 927,
        "omicron": 959,
        "omid": 10678,
        "ominus": 8854,
        "Oopf": 55349,
        "oopf": 55349,
        "opar": 10679,
        "OpenCurlyDoubleQuote": 8220,
        "OpenCurlyQuote": 8216,
        "operp": 10681,
        "oplus": 8853,
        "orarr": 8635,
        "Or": 10836,
        "or": 8744,
        "ord": 10845,
        "order": 8500,
        "orderof": 8500,
        "ordf": 170,
        "ordm": 186,
        "origof": 8886,
        "oror": 10838,
        "orslope": 10839,
        "orv": 10843,
        "oS": 9416,
        "Oscr": 55349,
        "oscr": 8500,
        "Oslash": 216,
        "oslash": 248,
        "osol": 8856,
        "Otilde": 213,
        "otilde": 245,
        "otimesas": 10806,
        "Otimes": 10807,
        "otimes": 8855,
        "Ouml": 214,
        "ouml": 246,
        "ovbar": 9021,
        "OverBar": 8254,
        "OverBrace": 9182,
        "OverBracket": 9140,
        "OverParenthesis": 9180,
        "para": 182,
        "parallel": 8741,
        "par": 8741,
        "parsim": 10995,
        "parsl": 11005,
        "part": 8706,
        "PartialD": 8706,
        "Pcy": 1055,
        "pcy": 1087,
        "percnt": 37,
        "period": 46,
        "permil": 8240,
        "perp": 8869,
        "pertenk": 8241,
        "Pfr": 55349,
        "pfr": 55349,
        "Phi": 934,
        "phi": 966,
        "phiv": 981,
        "phmmat": 8499,
        "phone": 9742,
        "Pi": 928,
        "pi": 960,
        "pitchfork": 8916,
        "piv": 982,
        "planck": 8463,
        "planckh": 8462,
        "plankv": 8463,
        "plusacir": 10787,
        "plusb": 8862,
        "pluscir": 10786,
        "plus": 43,
        "plusdo": 8724,
        "plusdu": 10789,
        "pluse": 10866,
        "PlusMinus": 177,
        "plusmn": 177,
        "plussim": 10790,
        "plustwo": 10791,
        "pm": 177,
        "Poincareplane": 8460,
        "pointint": 10773,
        "popf": 55349,
        "Popf": 8473,
        "pound": 163,
        "prap": 10935,
        "Pr": 10939,
        "pr": 8826,
        "prcue": 8828,
        "precapprox": 10935,
        "prec": 8826,
        "preccurlyeq": 8828,
        "Precedes": 8826,
        "PrecedesEqual": 10927,
        "PrecedesSlantEqual": 8828,
        "PrecedesTilde": 8830,
        "preceq": 10927,
        "precnapprox": 10937,
        "precneqq": 10933,
        "precnsim": 8936,
        "pre": 10927,
        "prE": 10931,
        "precsim": 8830,
        "prime": 8242,
        "Prime": 8243,
        "primes": 8473,
        "prnap": 10937,
        "prnE": 10933,
        "prnsim": 8936,
        "prod": 8719,
        "Product": 8719,
        "profalar": 9006,
        "profline": 8978,
        "profsurf": 8979,
        "prop": 8733,
        "Proportional": 8733,
        "Proportion": 8759,
        "propto": 8733,
        "prsim": 8830,
        "prurel": 8880,
        "Pscr": 55349,
        "pscr": 55349,
        "Psi": 936,
        "psi": 968,
        "puncsp": 8200,
        "Qfr": 55349,
        "qfr": 55349,
        "qint": 10764,
        "qopf": 55349,
        "Qopf": 8474,
        "qprime": 8279,
        "Qscr": 55349,
        "qscr": 55349,
        "quaternions": 8461,
        "quatint": 10774,
        "quest": 63,
        "questeq": 8799,
        "quot": 34,
        "QUOT": 34,
        "rAarr": 8667,
        "race": 8765,
        "Racute": 340,
        "racute": 341,
        "radic": 8730,
        "raemptyv": 10675,
        "rang": 10217,
        "Rang": 10219,
        "rangd": 10642,
        "range": 10661,
        "rangle": 10217,
        "raquo": 187,
        "rarrap": 10613,
        "rarrb": 8677,
        "rarrbfs": 10528,
        "rarrc": 10547,
        "rarr": 8594,
        "Rarr": 8608,
        "rArr": 8658,
        "rarrfs": 10526,
        "rarrhk": 8618,
        "rarrlp": 8620,
        "rarrpl": 10565,
        "rarrsim": 10612,
        "Rarrtl": 10518,
        "rarrtl": 8611,
        "rarrw": 8605,
        "ratail": 10522,
        "rAtail": 10524,
        "ratio": 8758,
        "rationals": 8474,
        "rbarr": 10509,
        "rBarr": 10511,
        "RBarr": 10512,
        "rbbrk": 10099,
        "rbrace": 125,
        "rbrack": 93,
        "rbrke": 10636,
        "rbrksld": 10638,
        "rbrkslu": 10640,
        "Rcaron": 344,
        "rcaron": 345,
        "Rcedil": 342,
        "rcedil": 343,
        "rceil": 8969,
        "rcub": 125,
        "Rcy": 1056,
        "rcy": 1088,
        "rdca": 10551,
        "rdldhar": 10601,
        "rdquo": 8221,
        "rdquor": 8221,
        "rdsh": 8627,
        "real": 8476,
        "realine": 8475,
        "realpart": 8476,
        "reals": 8477,
        "Re": 8476,
        "rect": 9645,
        "reg": 174,
        "REG": 174,
        "ReverseElement": 8715,
        "ReverseEquilibrium": 8651,
        "ReverseUpEquilibrium": 10607,
        "rfisht": 10621,
        "rfloor": 8971,
        "rfr": 55349,
        "Rfr": 8476,
        "rHar": 10596,
        "rhard": 8641,
        "rharu": 8640,
        "rharul": 10604,
        "Rho": 929,
        "rho": 961,
        "rhov": 1009,
        "RightAngleBracket": 10217,
        "RightArrowBar": 8677,
        "rightarrow": 8594,
        "RightArrow": 8594,
        "Rightarrow": 8658,
        "RightArrowLeftArrow": 8644,
        "rightarrowtail": 8611,
        "RightCeiling": 8969,
        "RightDoubleBracket": 10215,
        "RightDownTeeVector": 10589,
        "RightDownVectorBar": 10581,
        "RightDownVector": 8642,
        "RightFloor": 8971,
        "rightharpoondown": 8641,
        "rightharpoonup": 8640,
        "rightleftarrows": 8644,
        "rightleftharpoons": 8652,
        "rightrightarrows": 8649,
        "rightsquigarrow": 8605,
        "RightTeeArrow": 8614,
        "RightTee": 8866,
        "RightTeeVector": 10587,
        "rightthreetimes": 8908,
        "RightTriangleBar": 10704,
        "RightTriangle": 8883,
        "RightTriangleEqual": 8885,
        "RightUpDownVector": 10575,
        "RightUpTeeVector": 10588,
        "RightUpVectorBar": 10580,
        "RightUpVector": 8638,
        "RightVectorBar": 10579,
        "RightVector": 8640,
        "ring": 730,
        "risingdotseq": 8787,
        "rlarr": 8644,
        "rlhar": 8652,
        "rlm": 8207,
        "rmoustache": 9137,
        "rmoust": 9137,
        "rnmid": 10990,
        "roang": 10221,
        "roarr": 8702,
        "robrk": 10215,
        "ropar": 10630,
        "ropf": 55349,
        "Ropf": 8477,
        "roplus": 10798,
        "rotimes": 10805,
        "RoundImplies": 10608,
        "rpar": 41,
        "rpargt": 10644,
        "rppolint": 10770,
        "rrarr": 8649,
        "Rrightarrow": 8667,
        "rsaquo": 8250,
        "rscr": 55349,
        "Rscr": 8475,
        "rsh": 8625,
        "Rsh": 8625,
        "rsqb": 93,
        "rsquo": 8217,
        "rsquor": 8217,
        "rthree": 8908,
        "rtimes": 8906,
        "rtri": 9657,
        "rtrie": 8885,
        "rtrif": 9656,
        "rtriltri": 10702,
        "RuleDelayed": 10740,
        "ruluhar": 10600,
        "rx": 8478,
        "Sacute": 346,
        "sacute": 347,
        "sbquo": 8218,
        "scap": 10936,
        "Scaron": 352,
        "scaron": 353,
        "Sc": 10940,
        "sc": 8827,
        "sccue": 8829,
        "sce": 10928,
        "scE": 10932,
        "Scedil": 350,
        "scedil": 351,
        "Scirc": 348,
        "scirc": 349,
        "scnap": 10938,
        "scnE": 10934,
        "scnsim": 8937,
        "scpolint": 10771,
        "scsim": 8831,
        "Scy": 1057,
        "scy": 1089,
        "sdotb": 8865,
        "sdot": 8901,
        "sdote": 10854,
        "searhk": 10533,
        "searr": 8600,
        "seArr": 8664,
        "searrow": 8600,
        "sect": 167,
        "semi": 59,
        "seswar": 10537,
        "setminus": 8726,
        "setmn": 8726,
        "sext": 10038,
        "Sfr": 55349,
        "sfr": 55349,
        "sfrown": 8994,
        "sharp": 9839,
        "SHCHcy": 1065,
        "shchcy": 1097,
        "SHcy": 1064,
        "shcy": 1096,
        "ShortDownArrow": 8595,
        "ShortLeftArrow": 8592,
        "shortmid": 8739,
        "shortparallel": 8741,
        "ShortRightArrow": 8594,
        "ShortUpArrow": 8593,
        "shy": 173,
        "Sigma": 931,
        "sigma": 963,
        "sigmaf": 962,
        "sigmav": 962,
        "sim": 8764,
        "simdot": 10858,
        "sime": 8771,
        "simeq": 8771,
        "simg": 10910,
        "simgE": 10912,
        "siml": 10909,
        "simlE": 10911,
        "simne": 8774,
        "simplus": 10788,
        "simrarr": 10610,
        "slarr": 8592,
        "SmallCircle": 8728,
        "smallsetminus": 8726,
        "smashp": 10803,
        "smeparsl": 10724,
        "smid": 8739,
        "smile": 8995,
        "smt": 10922,
        "smte": 10924,
        "smtes": 10924,
        "SOFTcy": 1068,
        "softcy": 1100,
        "solbar": 9023,
        "solb": 10692,
        "sol": 47,
        "Sopf": 55349,
        "sopf": 55349,
        "spades": 9824,
        "spadesuit": 9824,
        "spar": 8741,
        "sqcap": 8851,
        "sqcaps": 8851,
        "sqcup": 8852,
        "sqcups": 8852,
        "Sqrt": 8730,
        "sqsub": 8847,
        "sqsube": 8849,
        "sqsubset": 8847,
        "sqsubseteq": 8849,
        "sqsup": 8848,
        "sqsupe": 8850,
        "sqsupset": 8848,
        "sqsupseteq": 8850,
        "square": 9633,
        "Square": 9633,
        "SquareIntersection": 8851,
        "SquareSubset": 8847,
        "SquareSubsetEqual": 8849,
        "SquareSuperset": 8848,
        "SquareSupersetEqual": 8850,
        "SquareUnion": 8852,
        "squarf": 9642,
        "squ": 9633,
        "squf": 9642,
        "srarr": 8594,
        "Sscr": 55349,
        "sscr": 55349,
        "ssetmn": 8726,
        "ssmile": 8995,
        "sstarf": 8902,
        "Star": 8902,
        "star": 9734,
        "starf": 9733,
        "straightepsilon": 1013,
        "straightphi": 981,
        "strns": 175,
        "sub": 8834,
        "Sub": 8912,
        "subdot": 10941,
        "subE": 10949,
        "sube": 8838,
        "subedot": 10947,
        "submult": 10945,
        "subnE": 10955,
        "subne": 8842,
        "subplus": 10943,
        "subrarr": 10617,
        "subset": 8834,
        "Subset": 8912,
        "subseteq": 8838,
        "subseteqq": 10949,
        "SubsetEqual": 8838,
        "subsetneq": 8842,
        "subsetneqq": 10955,
        "subsim": 10951,
        "subsub": 10965,
        "subsup": 10963,
        "succapprox": 10936,
        "succ": 8827,
        "succcurlyeq": 8829,
        "Succeeds": 8827,
        "SucceedsEqual": 10928,
        "SucceedsSlantEqual": 8829,
        "SucceedsTilde": 8831,
        "succeq": 10928,
        "succnapprox": 10938,
        "succneqq": 10934,
        "succnsim": 8937,
        "succsim": 8831,
        "SuchThat": 8715,
        "sum": 8721,
        "Sum": 8721,
        "sung": 9834,
        "sup1": 185,
        "sup2": 178,
        "sup3": 179,
        "sup": 8835,
        "Sup": 8913,
        "supdot": 10942,
        "supdsub": 10968,
        "supE": 10950,
        "supe": 8839,
        "supedot": 10948,
        "Superset": 8835,
        "SupersetEqual": 8839,
        "suphsol": 10185,
        "suphsub": 10967,
        "suplarr": 10619,
        "supmult": 10946,
        "supnE": 10956,
        "supne": 8843,
        "supplus": 10944,
        "supset": 8835,
        "Supset": 8913,
        "supseteq": 8839,
        "supseteqq": 10950,
        "supsetneq": 8843,
        "supsetneqq": 10956,
        "supsim": 10952,
        "supsub": 10964,
        "supsup": 10966,
        "swarhk": 10534,
        "swarr": 8601,
        "swArr": 8665,
        "swarrow": 8601,
        "swnwar": 10538,
        "szlig": 223,
        "Tab": "NaN",
        "target": 8982,
        "Tau": 932,
        "tau": 964,
        "tbrk": 9140,
        "Tcaron": 356,
        "tcaron": 357,
        "Tcedil": 354,
        "tcedil": 355,
        "Tcy": 1058,
        "tcy": 1090,
        "tdot": 8411,
        "telrec": 8981,
        "Tfr": 55349,
        "tfr": 55349,
        "there4": 8756,
        "therefore": 8756,
        "Therefore": 8756,
        "Theta": 920,
        "theta": 952,
        "thetasym": 977,
        "thetav": 977,
        "thickapprox": 8776,
        "thicksim": 8764,
        "ThickSpace": 8287,
        "ThinSpace": 8201,
        "thinsp": 8201,
        "thkap": 8776,
        "thksim": 8764,
        "THORN": 222,
        "thorn": 254,
        "tilde": 732,
        "Tilde": 8764,
        "TildeEqual": 8771,
        "TildeFullEqual": 8773,
        "TildeTilde": 8776,
        "timesbar": 10801,
        "timesb": 8864,
        "times": 215,
        "timesd": 10800,
        "tint": 8749,
        "toea": 10536,
        "topbot": 9014,
        "topcir": 10993,
        "top": 8868,
        "Topf": 55349,
        "topf": 55349,
        "topfork": 10970,
        "tosa": 10537,
        "tprime": 8244,
        "trade": 8482,
        "TRADE": 8482,
        "triangle": 9653,
        "triangledown": 9663,
        "triangleleft": 9667,
        "trianglelefteq": 8884,
        "triangleq": 8796,
        "triangleright": 9657,
        "trianglerighteq": 8885,
        "tridot": 9708,
        "trie": 8796,
        "triminus": 10810,
        "TripleDot": 8411,
        "triplus": 10809,
        "trisb": 10701,
        "tritime": 10811,
        "trpezium": 9186,
        "Tscr": 55349,
        "tscr": 55349,
        "TScy": 1062,
        "tscy": 1094,
        "TSHcy": 1035,
        "tshcy": 1115,
        "Tstrok": 358,
        "tstrok": 359,
        "twixt": 8812,
        "twoheadleftarrow": 8606,
        "twoheadrightarrow": 8608,
        "Uacute": 218,
        "uacute": 250,
        "uarr": 8593,
        "Uarr": 8607,
        "uArr": 8657,
        "Uarrocir": 10569,
        "Ubrcy": 1038,
        "ubrcy": 1118,
        "Ubreve": 364,
        "ubreve": 365,
        "Ucirc": 219,
        "ucirc": 251,
        "Ucy": 1059,
        "ucy": 1091,
        "udarr": 8645,
        "Udblac": 368,
        "udblac": 369,
        "udhar": 10606,
        "ufisht": 10622,
        "Ufr": 55349,
        "ufr": 55349,
        "Ugrave": 217,
        "ugrave": 249,
        "uHar": 10595,
        "uharl": 8639,
        "uharr": 8638,
        "uhblk": 9600,
        "ulcorn": 8988,
        "ulcorner": 8988,
        "ulcrop": 8975,
        "ultri": 9720,
        "Umacr": 362,
        "umacr": 363,
        "uml": 168,
        "UnderBar": 95,
        "UnderBrace": 9183,
        "UnderBracket": 9141,
        "UnderParenthesis": 9181,
        "Union": 8899,
        "UnionPlus": 8846,
        "Uogon": 370,
        "uogon": 371,
        "Uopf": 55349,
        "uopf": 55349,
        "UpArrowBar": 10514,
        "uparrow": 8593,
        "UpArrow": 8593,
        "Uparrow": 8657,
        "UpArrowDownArrow": 8645,
        "updownarrow": 8597,
        "UpDownArrow": 8597,
        "Updownarrow": 8661,
        "UpEquilibrium": 10606,
        "upharpoonleft": 8639,
        "upharpoonright": 8638,
        "uplus": 8846,
        "UpperLeftArrow": 8598,
        "UpperRightArrow": 8599,
        "upsi": 965,
        "Upsi": 978,
        "upsih": 978,
        "Upsilon": 933,
        "upsilon": 965,
        "UpTeeArrow": 8613,
        "UpTee": 8869,
        "upuparrows": 8648,
        "urcorn": 8989,
        "urcorner": 8989,
        "urcrop": 8974,
        "Uring": 366,
        "uring": 367,
        "urtri": 9721,
        "Uscr": 55349,
        "uscr": 55349,
        "utdot": 8944,
        "Utilde": 360,
        "utilde": 361,
        "utri": 9653,
        "utrif": 9652,
        "uuarr": 8648,
        "Uuml": 220,
        "uuml": 252,
        "uwangle": 10663,
        "vangrt": 10652,
        "varepsilon": 1013,
        "varkappa": 1008,
        "varnothing": 8709,
        "varphi": 981,
        "varpi": 982,
        "varpropto": 8733,
        "varr": 8597,
        "vArr": 8661,
        "varrho": 1009,
        "varsigma": 962,
        "varsubsetneq": 8842,
        "varsubsetneqq": 10955,
        "varsupsetneq": 8843,
        "varsupsetneqq": 10956,
        "vartheta": 977,
        "vartriangleleft": 8882,
        "vartriangleright": 8883,
        "vBar": 10984,
        "Vbar": 10987,
        "vBarv": 10985,
        "Vcy": 1042,
        "vcy": 1074,
        "vdash": 8866,
        "vDash": 8872,
        "Vdash": 8873,
        "VDash": 8875,
        "Vdashl": 10982,
        "veebar": 8891,
        "vee": 8744,
        "Vee": 8897,
        "veeeq": 8794,
        "vellip": 8942,
        "verbar": 124,
        "Verbar": 8214,
        "vert": 124,
        "Vert": 8214,
        "VerticalBar": 8739,
        "VerticalLine": 124,
        "VerticalSeparator": 10072,
        "VerticalTilde": 8768,
        "VeryThinSpace": 8202,
        "Vfr": 55349,
        "vfr": 55349,
        "vltri": 8882,
        "vnsub": 8834,
        "vnsup": 8835,
        "Vopf": 55349,
        "vopf": 55349,
        "vprop": 8733,
        "vrtri": 8883,
        "Vscr": 55349,
        "vscr": 55349,
        "vsubnE": 10955,
        "vsubne": 8842,
        "vsupnE": 10956,
        "vsupne": 8843,
        "Vvdash": 8874,
        "vzigzag": 10650,
        "Wcirc": 372,
        "wcirc": 373,
        "wedbar": 10847,
        "wedge": 8743,
        "Wedge": 8896,
        "wedgeq": 8793,
        "weierp": 8472,
        "Wfr": 55349,
        "wfr": 55349,
        "Wopf": 55349,
        "wopf": 55349,
        "wp": 8472,
        "wr": 8768,
        "wreath": 8768,
        "Wscr": 55349,
        "wscr": 55349,
        "xcap": 8898,
        "xcirc": 9711,
        "xcup": 8899,
        "xdtri": 9661,
        "Xfr": 55349,
        "xfr": 55349,
        "xharr": 10231,
        "xhArr": 10234,
        "Xi": 926,
        "xi": 958,
        "xlarr": 10229,
        "xlArr": 10232,
        "xmap": 10236,
        "xnis": 8955,
        "xodot": 10752,
        "Xopf": 55349,
        "xopf": 55349,
        "xoplus": 10753,
        "xotime": 10754,
        "xrarr": 10230,
        "xrArr": 10233,
        "Xscr": 55349,
        "xscr": 55349,
        "xsqcup": 10758,
        "xuplus": 10756,
        "xutri": 9651,
        "xvee": 8897,
        "xwedge": 8896,
        "Yacute": 221,
        "yacute": 253,
        "YAcy": 1071,
        "yacy": 1103,
        "Ycirc": 374,
        "ycirc": 375,
        "Ycy": 1067,
        "ycy": 1099,
        "yen": 165,
        "Yfr": 55349,
        "yfr": 55349,
        "YIcy": 1031,
        "yicy": 1111,
        "Yopf": 55349,
        "yopf": 55349,
        "Yscr": 55349,
        "yscr": 55349,
        "YUcy": 1070,
        "yucy": 1102,
        "yuml": 255,
        "Yuml": 376,
        "Zacute": 377,
        "zacute": 378,
        "Zcaron": 381,
        "zcaron": 382,
        "Zcy": 1047,
        "zcy": 1079,
        "Zdot": 379,
        "zdot": 380,
        "zeetrf": 8488,
        "ZeroWidthSpace": 8203,
        "Zeta": 918,
        "zeta": 950,
        "zfr": 55349,
        "Zfr": 8488,
        "ZHcy": 1046,
        "zhcy": 1078,
        "zigrarr": 8669,
        "zopf": 55349,
        "Zopf": 8484,
        "Zscr": 55349,
        "zscr": 55349,
        "zwj": 8205,
        "zwnj": 8204
      };

      var entityToChar = function (m) {
        var isNumeric = m.slice(0, 2) === "&#";
        var c;
        var isHex = isNumeric && (c = m.slice(2, 3)) && (c === 'X' || c === 'x');
        var uchar;
        var ucode;
        if (isNumeric) {
          var num;
          if (isHex) {
            num = parseInt(m.slice(3, m.length - 1), 16);
          } else {
            num = parseInt(m.slice(2, m.length - 1), 10);
          }
          uchar = fromCodePoint(num);
        } else {
          ucode = entities[m.slice(1, m.length - 1)];
          if (ucode) {
            uchar = fromCodePoint(entities[m.slice(1, m.length - 1)]);
          }
        }
        return (uchar || m);
      };

      module.exports.entityToChar = entityToChar;

    }, { "./from-code-point": 5 }], 8: [function (require, module, exports) {
      "use strict";

      // commonmark.js - CommomMark in JavaScript
      // Copyright (C) 2014 John MacFarlane
      // License: BSD3.

      // Basic usage:
      //
      // var commonmark = require('commonmark');
      // var parser = new commonmark.Parser();
      // var renderer = new commonmark.HtmlRenderer();
      // console.log(renderer.render(parser.parse('Hello *world*')));

      module.exports.Node = require('./node');
      module.exports.Parser = require('./blocks');
      module.exports.HtmlRenderer = require('./html');
      module.exports.XmlRenderer = require('./xml');

    }, { "./blocks": 1, "./html": 6, "./node": 10, "./xml": 12 }], 9: [function (require, module, exports) {
      "use strict";

      var Node = require('./node');
      var common = require('./common');
      var normalizeReference = require('./normalize-reference');

      var normalizeURI = common.normalizeURI;
      var unescapeString = common.unescapeString;
      var fromCodePoint = require('./from-code-point.js');
      var entityToChar = require('./html5-entities.js').entityToChar;

      // Constants for character codes:

      var C_NEWLINE = 10;
      var C_ASTERISK = 42;
      var C_UNDERSCORE = 95;
      var C_BACKTICK = 96;
      var C_OPEN_BRACKET = 91;
      var C_CLOSE_BRACKET = 93;
      var C_LESSTHAN = 60;
      var C_BANG = 33;
      var C_BACKSLASH = 92;
      var C_AMPERSAND = 38;
      var C_OPEN_PAREN = 40;
      var C_CLOSE_PAREN = 41;
      var C_COLON = 58;
      var C_SINGLEQUOTE = 39;
      var C_DOUBLEQUOTE = 34;

      // Some regexps used in inline parser:

      var ESCAPABLE = common.ESCAPABLE;
      var ESCAPED_CHAR = '\\\\' + ESCAPABLE;
      var REG_CHAR = '[^\\\\()\\x00-\\x20]';
      var IN_PARENS_NOSP = '\\((' + REG_CHAR + '|' + ESCAPED_CHAR + ')*\\)';
      var TAGNAME = '[A-Za-z][A-Za-z0-9]*';
      var ATTRIBUTENAME = '[a-zA-Z_:][a-zA-Z0-9:._-]*';
      var UNQUOTEDVALUE = "[^\"'=<>`\\x00-\\x20]+";
      var SINGLEQUOTEDVALUE = "'[^']*'";
      var DOUBLEQUOTEDVALUE = '"[^"]*"';
      var ATTRIBUTEVALUE = "(?:" + UNQUOTEDVALUE + "|" + SINGLEQUOTEDVALUE + "|" + DOUBLEQUOTEDVALUE + ")";
      var ATTRIBUTEVALUESPEC = "(?:" + "\\s*=" + "\\s*" + ATTRIBUTEVALUE + ")";
      var ATTRIBUTE = "(?:" + "\\s+" + ATTRIBUTENAME + ATTRIBUTEVALUESPEC + "?)";
      var OPENTAG = "<" + TAGNAME + ATTRIBUTE + "*" + "\\s*/?>";
      var CLOSETAG = "</" + TAGNAME + "\\s*[>]";
      var HTMLCOMMENT = "<!---->|<!--(?:-?[^>-])(?:-?[^-])*-->";
      var PROCESSINGINSTRUCTION = "[<][?].*?[?][>]";
      var DECLARATION = "<![A-Z]+" + "\\s+[^>]*>";
      var CDATA = "<!\\[CDATA\\[[\\s\\S]*?\\]\\]>";
      var HTMLTAG = "(?:" + OPENTAG + "|" + CLOSETAG + "|" + HTMLCOMMENT + "|" +
              PROCESSINGINSTRUCTION + "|" + DECLARATION + "|" + CDATA + ")";
      var ENTITY = common.ENTITY;

      var rePunctuation = new RegExp(/^[\u2000-\u206F\u2E00-\u2E7F\\'!"#\$%&\(\)\*\+,\-\.\/:;<=>\?@\[\]\^_`\{\|\}~]/);

      var reHtmlTag = new RegExp('^' + HTMLTAG, 'i');

      var reLinkTitle = new RegExp(
          '^(?:"(' + ESCAPED_CHAR + '|[^"\\x00])*"' +
              '|' +
              '\'(' + ESCAPED_CHAR + '|[^\'\\x00])*\'' +
              '|' +
              '\\((' + ESCAPED_CHAR + '|[^)\\x00])*\\))');

      var reLinkDestinationBraces = new RegExp(
          '^(?:[<](?:[^<>\\n\\\\\\x00]' + '|' + ESCAPED_CHAR + '|' + '\\\\)*[>])');

      var reLinkDestination = new RegExp(
          '^(?:' + REG_CHAR + '+|' + ESCAPED_CHAR + '|' + IN_PARENS_NOSP + ')*');

      var reEscapable = new RegExp('^' + ESCAPABLE);

      var reEntityHere = new RegExp('^' + ENTITY, 'i');

      var reTicks = /`+/;

      var reTicksHere = /^`+/;

      var reEllipses = /\.\.\./g;

      var reDash = /---?/g;

      var reEmailAutolink = /^<([a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*)>/;

      var reAutolink = /^<(?:coap|doi|javascript|aaa|aaas|about|acap|cap|cid|crid|data|dav|dict|dns|file|ftp|geo|go|gopher|h323|http|https|iax|icap|im|imap|info|ipp|iris|iris.beep|iris.xpc|iris.xpcs|iris.lwz|ldap|mailto|mid|msrp|msrps|mtqp|mupdate|news|nfs|ni|nih|nntp|opaquelocktoken|pop|pres|rtsp|service|session|shttp|sieve|sip|sips|sms|snmp|soap.beep|soap.beeps|tag|tel|telnet|tftp|thismessage|tn3270|tip|tv|urn|vemmi|ws|wss|xcon|xcon-userid|xmlrpc.beep|xmlrpc.beeps|xmpp|z39.50r|z39.50s|adiumxtra|afp|afs|aim|apt|attachment|aw|beshare|bitcoin|bolo|callto|chrome|chrome-extension|com-eventbrite-attendee|content|cvs|dlna-playsingle|dlna-playcontainer|dtn|dvb|ed2k|facetime|feed|finger|fish|gg|git|gizmoproject|gtalk|hcp|icon|ipn|irc|irc6|ircs|itms|jar|jms|keyparc|lastfm|ldaps|magnet|maps|market|message|mms|ms-help|msnim|mumble|mvn|notes|oid|palm|paparazzi|platform|proxy|psyc|query|res|resource|rmi|rsync|rtmp|secondlife|sftp|sgn|skype|smb|soldat|spotify|ssh|steam|svn|teamspeak|things|udp|unreal|ut2004|ventrilo|view-source|webcal|wtai|wyciwyg|xfire|xri|ymsgr):[^<>\x00-\x20]*>/i;

      var reSpnl = /^ *(?:\n *)?/;

      var reWhitespaceChar = /^\s/;

      var reWhitespace = /\s+/g;

      var reFinalSpace = / *$/;

      var reInitialSpace = /^ */;

      var reSpaceAtEndOfLine = /^ *(?:\n|$)/;

      var reLinkLabel = /^\[(?:[^\\\[\]]|\\[\[\]]){0,1000}\]/;

      // Matches a string of non-special characters.
      var reMain = /^[^\n`\[\]\\!<&*_'"]+/m;

      var text = function (s) {
        var node = new Node('Text');
        node._literal = s;
        return node;
      };

      // INLINE PARSER

      // These are methods of an InlineParser object, defined below.
      // An InlineParser keeps track of a subject (a string to be
      // parsed) and a position in that subject.

      // If re matches at current position in the subject, advance
      // position in subject and return the match; otherwise return null.
      var match = function (re) {
        var m = re.exec(this.subject.slice(this.pos));
        if (m === null) {
          return null;
        } else {
          this.pos += m.index + m[0].length;
          return m[0];
        }
      };

      // Returns the code for the character at the current subject position, or -1
      // there are no more characters.
      var peek = function () {
        if (this.pos < this.subject.length) {
          return this.subject.charCodeAt(this.pos);
        } else {
          return -1;
        }
      };

      // Parse zero or more space characters, including at most one newline
      var spnl = function () {
        this.match(reSpnl);
        return true;
      };

      // All of the parsers below try to match something at the current position
      // in the subject.  If they succeed in matching anything, they
      // return the inline matched, advancing the subject.

      // Attempt to parse backticks, adding either a backtick code span or a
      // literal sequence of backticks.
      var parseBackticks = function (block) {
        var ticks = this.match(reTicksHere);
        if (ticks === null) {
          return false;
        }
        var afterOpenTicks = this.pos;
        var matched;
        var node;
        while ((matched = this.match(reTicks)) !== null) {
          if (matched === ticks) {
            node = new Node('Code');
            node._literal = this.subject.slice(afterOpenTicks,
                                        this.pos - ticks.length)
                          .trim().replace(reWhitespace, ' ');
            block.appendChild(node);
            return true;
          }
        }
        // If we got here, we didn't match a closing backtick sequence.
        this.pos = afterOpenTicks;
        block.appendChild(text(ticks));
        return true;
      };

      // Parse a backslash-escaped special character, adding either the escaped
      // character, a hard line break (if the backslash is followed by a newline),
      // or a literal backslash to the block's children.  Assumes current character
      // is a backslash.
      var parseBackslash = function (block) {
        var subj = this.subject;
        var node;
        this.pos += 1;
        if (this.peek() === C_NEWLINE) {
          this.pos += 1;
          node = new Node('Hardbreak');
          block.appendChild(node);
        } else if (reEscapable.test(subj.charAt(this.pos))) {
          block.appendChild(text(subj.charAt(this.pos)));
          this.pos += 1;
        } else {
          block.appendChild(text('\\'));
        }
        return true;
      };

      // Attempt to parse an autolink (URL or email in pointy brackets).
      var parseAutolink = function (block) {
        var m;
        var dest;
        var node;
        if ((m = this.match(reEmailAutolink))) {
          dest = m.slice(1, m.length - 1);
          node = new Node('Link');
          node._destination = normalizeURI('mailto:' + dest);
          node._title = '';
          node.appendChild(text(dest));
          block.appendChild(node);
          return true;
        } else if ((m = this.match(reAutolink))) {
          dest = m.slice(1, m.length - 1);
          node = new Node('Link');
          node._destination = normalizeURI(dest);
          node._title = '';
          node.appendChild(text(dest));
          block.appendChild(node);
          return true;
        } else {
          return false;
        }
      };

      // Attempt to parse a raw HTML tag.
      var parseHtmlTag = function (block) {
        var m = this.match(reHtmlTag);
        if (m === null) {
          return false;
        } else {
          var node = new Node('Html');
          node._literal = m;
          block.appendChild(node);
          return true;
        }
      };

      // Scan a sequence of characters with code cc, and return information about
      // the number of delimiters and whether they are positioned such that
      // they can open and/or close emphasis or strong emphasis.  A utility
      // function for strong/emph parsing.
      var scanDelims = function (cc) {
        var numdelims = 0;
        var char_before, char_after, cc_after;
        var startpos = this.pos;
        var left_flanking, right_flanking, can_open, can_close;

        char_before = this.pos === 0 ? '\n' :
            this.subject.charAt(this.pos - 1);

        if (cc === C_SINGLEQUOTE || cc === C_DOUBLEQUOTE) {
          numdelims++;
          this.pos++;
        } else {
          while (this.peek() === cc) {
            numdelims++;
            this.pos++;
          }
        }

        cc_after = this.peek();
        if (cc_after === -1) {
          char_after = '\n';
        } else {
          char_after = fromCodePoint(cc_after);
        }

        left_flanking = numdelims > 0 &&
                !(reWhitespaceChar.test(char_after)) &&
                !(rePunctuation.test(char_after) &&
                 !(reWhitespaceChar.test(char_before)) &&
                 !(rePunctuation.test(char_before)));
        right_flanking = numdelims > 0 &&
                !(reWhitespaceChar.test(char_before)) &&
                !(rePunctuation.test(char_before) &&
                  !(reWhitespaceChar.test(char_after)) &&
                  !(rePunctuation.test(char_after)));
        if (cc === C_UNDERSCORE) {
          can_open = left_flanking &&
              (!right_flanking || rePunctuation.test(char_before));
          can_close = right_flanking &&
              (!left_flanking || rePunctuation.test(char_after));
        } else {
          can_open = left_flanking;
          can_close = right_flanking;
        }
        this.pos = startpos;
        return {
          numdelims: numdelims,
          can_open: can_open,
          can_close: can_close
        };
      };

      // Handle a delimiter marker for emphasis or a quote.
      var handleDelim = function (cc, block) {
        var res = this.scanDelims(cc);
        var numdelims = res.numdelims;
        var startpos = this.pos;
        var contents;

        if (numdelims === 0) {
          return false;
        }

        this.pos += numdelims;
        if (cc === C_SINGLEQUOTE) {
          contents = "\u2019";
        } else if (cc === C_DOUBLEQUOTE) {
          contents = "\u201C";
        } else {
          contents = this.subject.slice(startpos, this.pos);
        }
        var node = text(contents);
        block.appendChild(node);

        // Add entry to stack for this opener
        this.delimiters = {
          cc: cc,
          numdelims: numdelims,
          node: node,
          previous: this.delimiters,
          next: null,
          can_open: res.can_open,
          can_close: res.can_close,
          active: true
        };
        if (this.delimiters.previous !== null) {
          this.delimiters.previous.next = this.delimiters;
        }

        return true;

      };

      var removeDelimiter = function (delim) {
        if (delim.previous !== null) {
          delim.previous.next = delim.next;
        }
        if (delim.next === null) {
          // top of stack
          this.delimiters = delim.previous;
        } else {
          delim.next.previous = delim.previous;
        }
      };

      var removeDelimitersBetween = function (bottom, top) {
        if (bottom.next !== top) {
          bottom.next = top;
          top.previous = bottom;
        }
      };

      var processEmphasis = function (stack_bottom) {
        var opener, closer;
        var opener_inl, closer_inl;
        var tempstack;
        var use_delims;
        var tmp, next;

        // find first closer above stack_bottom:
        closer = this.delimiters;
        while (closer !== null && closer.previous !== stack_bottom) {
          closer = closer.previous;
        }
        // move forward, looking for closers, and handling each
        while (closer !== null) {
          var closercc = closer.cc;
          if (!(closer.can_close && (closercc === C_UNDERSCORE ||
                                     closercc === C_ASTERISK ||
                                     closercc === C_SINGLEQUOTE ||
                                     closercc === C_DOUBLEQUOTE))) {
            closer = closer.next;
          } else {
            // found emphasis closer. now look back for first matching opener:
            opener = closer.previous;
            while (opener !== null && opener !== stack_bottom) {
              if (opener.cc === closer.cc && opener.can_open) {
                break;
              }
              opener = opener.previous;
            }
            if (closercc === C_ASTERISK || closercc === C_UNDERSCORE) {
              if (opener === null || opener === stack_bottom) {
                closer = closer.next;
              } else {
                // calculate actual number of delimiters used from closer
                if (closer.numdelims < 3 || opener.numdelims < 3) {
                  use_delims = closer.numdelims <= opener.numdelims ?
                      closer.numdelims : opener.numdelims;
                } else {
                  use_delims = closer.numdelims % 2 === 0 ? 2 : 1;
                }

                opener_inl = opener.node;
                closer_inl = closer.node;

                // remove used delimiters from stack elts and inlines
                opener.numdelims -= use_delims;
                closer.numdelims -= use_delims;
                opener_inl._literal =
                    opener_inl._literal.slice(0,
                                              opener_inl._literal.length - use_delims);
                closer_inl._literal =
                    closer_inl._literal.slice(0,
                                              closer_inl._literal.length - use_delims);

                // build contents for new emph element
                var emph = new Node(use_delims === 1 ? 'Emph' : 'Strong');

                tmp = opener_inl._next;
                while (tmp && tmp !== closer_inl) {
                  next = tmp._next;
                  tmp.unlink();
                  emph.appendChild(tmp);
                  tmp = next;
                }

                opener_inl.insertAfter(emph);

                // remove elts between opener and closer in delimiters stack
                removeDelimitersBetween(opener, closer);

                // if opener has 0 delims, remove it and the inline
                if (opener.numdelims === 0) {
                  opener_inl.unlink();
                  this.removeDelimiter(opener);
                }

                if (closer.numdelims === 0) {
                  closer_inl.unlink();
                  tempstack = closer.next;
                  this.removeDelimiter(closer);
                  closer = tempstack;
                }

              }

            } else if (closercc === C_SINGLEQUOTE) {
              closer.node._literal = "\u2019";
              if (opener !== null && opener !== stack_bottom) {
                opener.node._literal = "\u2018";
              }
              closer = closer.next;

            } else if (closercc === C_DOUBLEQUOTE) {
              closer.node._literal = "\u201D";
              if (opener !== null && opener !== stack_bottom) {
                opener.node.literal = "\u201C";
              }
              closer = closer.next;

            }

          }

        }

        // remove all delimiters
        while (this.delimiters !== stack_bottom) {
          this.removeDelimiter(this.delimiters);
        }
      };

      // Attempt to parse link title (sans quotes), returning the string
      // or null if no match.
      var parseLinkTitle = function () {
        var title = this.match(reLinkTitle);
        if (title === null) {
          return null;
        } else {
          // chop off quotes from title and unescape:
          return unescapeString(title.substr(1, title.length - 2));
        }
      };

      // Attempt to parse link destination, returning the string or
      // null if no match.
      var parseLinkDestination = function () {
        var res = this.match(reLinkDestinationBraces);
        if (res === null) {
          res = this.match(reLinkDestination);
          if (res === null) {
            return null;
          } else {
            return normalizeURI(unescapeString(res));
          }
        } else {  // chop off surrounding <..>:
          return normalizeURI(unescapeString(res.substr(1, res.length - 2)));
        }
      };

      // Attempt to parse a link label, returning number of characters parsed.
      var parseLinkLabel = function () {
        var m = this.match(reLinkLabel);
        return m === null ? 0 : m.length;
      };

      // Add open bracket to delimiter stack and add a text node to block's children.
      var parseOpenBracket = function (block) {
        var startpos = this.pos;
        this.pos += 1;

        var node = text('[');
        block.appendChild(node);

        // Add entry to stack for this opener
        this.delimiters = {
          cc: C_OPEN_BRACKET,
          numdelims: 1,
          node: node,
          previous: this.delimiters,
          next: null,
          can_open: true,
          can_close: false,
          index: startpos,
          active: true
        };
        if (this.delimiters.previous !== null) {
          this.delimiters.previous.next = this.delimiters;
        }

        return true;

      };

      // IF next character is [, and ! delimiter to delimiter stack and
      // add a text node to block's children.  Otherwise just add a text node.
      var parseBang = function (block) {
        var startpos = this.pos;
        this.pos += 1;
        if (this.peek() === C_OPEN_BRACKET) {
          this.pos += 1;

          var node = text('![');
          block.appendChild(node);

          // Add entry to stack for this opener
          this.delimiters = {
            cc: C_BANG,
            numdelims: 1,
            node: node,
            previous: this.delimiters,
            next: null,
            can_open: true,
            can_close: false,
            index: startpos + 1,
            active: true
          };
          if (this.delimiters.previous !== null) {
            this.delimiters.previous.next = this.delimiters;
          }
        } else {
          block.appendChild(text('!'));
        }
        return true;
      };

      // Try to match close bracket against an opening in the delimiter
      // stack.  Add either a link or image, or a plain [ character,
      // to block's children.  If there is a matching delimiter,
      // remove it from the delimiter stack.
      var parseCloseBracket = function (block) {
        var startpos;
        var is_image;
        var dest;
        var title;
        var matched = false;
        var reflabel;
        var opener;

        this.pos += 1;
        startpos = this.pos;

        // look through stack of delimiters for a [ or ![
        opener = this.delimiters;

        while (opener !== null) {
          if (opener.cc === C_OPEN_BRACKET || opener.cc === C_BANG) {
            break;
          }
          opener = opener.previous;
        }

        if (opener === null) {
          // no matched opener, just return a literal
          block.appendChild(text(']'));
          return true;
        }

        if (!opener.active) {
          // no matched opener, just return a literal
          block.appendChild(text(']'));
          // take opener off emphasis stack
          this.removeDelimiter(opener);
          return true;
        }

        // If we got here, open is a potential opener
        is_image = opener.cc === C_BANG;

        // Check to see if we have a link/image

        // Inline link?
        if (this.peek() === C_OPEN_PAREN) {
          this.pos++;
          if (this.spnl() &&
              ((dest = this.parseLinkDestination()) !== null) &&
              this.spnl() &&
            // make sure there's a space before the title:
              (reWhitespaceChar.test(this.subject.charAt(this.pos - 1)) &&
               (title = this.parseLinkTitle()) || true) &&
              this.spnl() &&
              this.peek() === C_CLOSE_PAREN) {
            this.pos += 1;
            matched = true;
          }
        } else {

          // Next, see if there's a link label
          var savepos = this.pos;
          this.spnl();
          var beforelabel = this.pos;
          var n = this.parseLinkLabel();
          if (n === 0 || n === 2) {
            // empty or missing second label
            reflabel = this.subject.slice(opener.index, startpos);
          } else {
            reflabel = this.subject.slice(beforelabel, beforelabel + n);
          }
          if (n === 0) {
            // If shortcut reference link, rewind before spaces we skipped.
            this.pos = savepos;
          }

          // lookup rawlabel in refmap
          var link = this.refmap[normalizeReference(reflabel)];
          if (link) {
            dest = link.destination;
            title = link.title;
            matched = true;
          }
        }

        if (matched) {
          var node = new Node(is_image ? 'Image' : 'Link');
          node._destination = dest;
          node._title = title || '';

          var tmp, next;
          tmp = opener.node._next;
          while (tmp) {
            next = tmp._next;
            tmp.unlink();
            node.appendChild(tmp);
            tmp = next;
          }
          block.appendChild(node);
          this.processEmphasis(opener.previous);

          opener.node.unlink();

          // processEmphasis will remove this and later delimiters.
          // Now, for a link, we also deactivate earlier link openers.
          // (no links in links)
          if (!is_image) {
            opener = this.delimiters;
            while (opener !== null) {
              if (opener.cc === C_OPEN_BRACKET) {
                opener.active = false; // deactivate this opener
              }
              opener = opener.previous;
            }
          }

          return true;

        } else { // no match

          this.removeDelimiter(opener);  // remove this opener from stack
          this.pos = startpos;
          block.appendChild(text(']'));
          return true;
        }

      };

      // Attempt to parse an entity.
      var parseEntity = function (block) {
        var m;
        if ((m = this.match(reEntityHere))) {
          block.appendChild(text(entityToChar(m)));
          return true;
        } else {
          return false;
        }
      };

      // Parse a run of ordinary characters, or a single character with
      // a special meaning in markdown, as a plain string.
      var parseString = function (block) {
        var m;
        if ((m = this.match(reMain))) {
          if (this.options.smart) {
            block.appendChild(text(
                m.replace(reEllipses, "\u2026")
                    .replace(reDash, function (chars) {
                      return (chars.length === 3) ? "\u2014" : "\u2013";
                    })));
          } else {
            block.appendChild(text(m));
          }
          return true;
        } else {
          return false;
        }
      };

      // Parse a newline.  If it was preceded by two spaces, return a hard
      // line break; otherwise a soft line break.
      var parseNewline = function (block) {
        this.pos += 1; // assume we're at a \n
        // check previous node for trailing spaces
        var lastc = block._lastChild;
        if (lastc && lastc.type === 'Text' && lastc._literal[lastc._literal.length - 1] === ' ') {
          var hardbreak = lastc._literal[lastc._literal.length - 2] === ' ';
          lastc._literal = lastc._literal.replace(reFinalSpace, '');
          block.appendChild(new Node(hardbreak ? 'Hardbreak' : 'Softbreak'));
        } else {
          block.appendChild(new Node('Softbreak'));
        }
        this.match(reInitialSpace); // gobble leading spaces in next line
        return true;
      };

      // Attempt to parse a link reference, modifying refmap.
      var parseReference = function (s, refmap) {
        this.subject = s;
        this.pos = 0;
        var rawlabel;
        var dest;
        var title;
        var matchChars;
        var startpos = this.pos;

        // label:
        matchChars = this.parseLinkLabel();
        if (matchChars === 0) {
          return 0;
        } else {
          rawlabel = this.subject.substr(0, matchChars);
        }

        // colon:
        if (this.peek() === C_COLON) {
          this.pos++;
        } else {
          this.pos = startpos;
          return 0;
        }

        //  link url
        this.spnl();

        dest = this.parseLinkDestination();
        if (dest === null || dest.length === 0) {
          this.pos = startpos;
          return 0;
        }

        var beforetitle = this.pos;
        this.spnl();
        title = this.parseLinkTitle();
        if (title === null) {
          title = '';
          // rewind before spaces
          this.pos = beforetitle;
        }

        // make sure we're at line end:
        if (this.match(reSpaceAtEndOfLine) === null) {
          this.pos = startpos;
          return 0;
        }

        var normlabel = normalizeReference(rawlabel);

        if (!refmap[normlabel]) {
          refmap[normlabel] = { destination: dest, title: title };
        }
        return this.pos - startpos;
      };

      // Parse the next inline element in subject, advancing subject position.
      // On success, add the result to block's children and return true.
      // On failure, return false.
      var parseInline = function (block) {
        var res = false;
        var c = this.peek();
        if (c === -1) {
          return false;
        }
        switch (c) {
          case C_NEWLINE:
            res = this.parseNewline(block);
            break;
          case C_BACKSLASH:
            res = this.parseBackslash(block);
            break;
          case C_BACKTICK:
            res = this.parseBackticks(block);
            break;
          case C_ASTERISK:
          case C_UNDERSCORE:
            res = this.handleDelim(c, block);
            break;
          case C_SINGLEQUOTE:
          case C_DOUBLEQUOTE:
            res = this.options.smart && this.handleDelim(c, block);
            break;
          case C_OPEN_BRACKET:
            res = this.parseOpenBracket(block);
            break;
          case C_BANG:
            res = this.parseBang(block);
            break;
          case C_CLOSE_BRACKET:
            res = this.parseCloseBracket(block);
            break;
          case C_LESSTHAN:
            res = this.parseAutolink(block) || this.parseHtmlTag(block);
            break;
          case C_AMPERSAND:
            res = this.parseEntity(block);
            break;
          default:
            res = this.parseString(block);
            break;
        }
        if (!res) {
          this.pos += 1;
          block.appendChild(text(fromCodePoint(c)));
        }

        return true;
      };

      // Parse string content in block into inline children,
      // using refmap to resolve references.
      var parseInlines = function (block) {
        this.subject = block._string_content.trim();
        this.pos = 0;
        this.delimiters = null;
        while (this.parseInline(block)) {
        }
        block._string_content = null; // allow raw string to be garbage collected
        this.processEmphasis(null);
      };

      // The InlineParser object.
      function InlineParser(options) {
        return {
          subject: '',
          delimiters: null,  // used by handleDelim method
          pos: 0,
          refmap: {},
          match: match,
          peek: peek,
          spnl: spnl,
          parseBackticks: parseBackticks,
          parseBackslash: parseBackslash,
          parseAutolink: parseAutolink,
          parseHtmlTag: parseHtmlTag,
          scanDelims: scanDelims,
          handleDelim: handleDelim,
          parseLinkTitle: parseLinkTitle,
          parseLinkDestination: parseLinkDestination,
          parseLinkLabel: parseLinkLabel,
          parseOpenBracket: parseOpenBracket,
          parseCloseBracket: parseCloseBracket,
          parseBang: parseBang,
          parseEntity: parseEntity,
          parseString: parseString,
          parseNewline: parseNewline,
          parseReference: parseReference,
          parseInline: parseInline,
          processEmphasis: processEmphasis,
          removeDelimiter: removeDelimiter,
          options: options || {},
          parse: parseInlines
        };
      }

      module.exports = InlineParser;

    }, { "./common": 2, "./from-code-point.js": 5, "./html5-entities.js": 7, "./node": 10, "./normalize-reference": 11 }], 10: [function (require, module, exports) {
      "use strict";

      function isContainer(node) {
        switch (node._type) {
          case 'Document':
          case 'BlockQuote':
          case 'List':
          case 'Item':
          case 'Paragraph':
          case 'Header':
          case 'Emph':
          case 'Strong':
          case 'Link':
          case 'Image':
            return true;
          default:
            return false;
        }
      }

      var resumeAt = function (node, entering) {
        this.current = node;
        this.entering = (entering === true);
      };

      var next = function () {
        var cur = this.current;
        var entering = this.entering;

        if (cur === null) {
          return null;
        }

        var container = isContainer(cur);

        if (entering && container) {
          if (cur._firstChild) {
            this.current = cur._firstChild;
            this.entering = true;
          } else {
            // stay on node but exit
            this.entering = false;
          }

        } else if (cur === this.root) {
          this.current = null;

        } else if (cur._next === null) {
          this.current = cur._parent;
          this.entering = false;

        } else {
          this.current = cur._next;
          this.entering = true;
        }

        return { entering: entering, node: cur };
      };

      var NodeWalker = function (root) {
        return {
          current: root,
          root: root,
          entering: true,
          next: next,
          resumeAt: resumeAt
        };
      };

      var Node = function (nodeType, sourcepos) {
        this._type = nodeType;
        this._parent = null;
        this._firstChild = null;
        this._lastChild = null;
        this._prev = null;
        this._next = null;
        this._sourcepos = sourcepos;
        this._lastLineBlank = false;
        this._open = true;
        this._string_content = null;
        this._literal = null;
        this._listData = null;
        this._info = null;
        this._destination = null;
        this._title = null;
        this._isFenced = false;
        this._fenceChar = null;
        this._fenceLength = 0;
        this._fenceOffset = null;
        this._level = null;
      };

      var proto = Node.prototype;

      Object.defineProperty(proto, 'isContainer', {
        get: function () { return isContainer(this); }
      });

      Object.defineProperty(proto, 'type', {
        get: function () { return this._type; }
      });

      Object.defineProperty(proto, 'firstChild', {
        get: function () { return this._firstChild; }
      });

      Object.defineProperty(proto, 'lastChild', {
        get: function () { return this._lastChild; }
      });

      Object.defineProperty(proto, 'next', {
        get: function () { return this._next; }
      });

      Object.defineProperty(proto, 'prev', {
        get: function () { return this._prev; }
      });

      Object.defineProperty(proto, 'parent', {
        get: function () { return this._parent; }
      });

      Object.defineProperty(proto, 'sourcepos', {
        get: function () { return this._sourcepos; }
      });

      Object.defineProperty(proto, 'literal', {
        get: function () { return this._literal; },
        set: function (s) { this._literal = s; }
      });

      Object.defineProperty(proto, 'destination', {
        get: function () { return this._destination; },
        set: function (s) { this._destination = s; }
      });

      Object.defineProperty(proto, 'title', {
        get: function () { return this._title; },
        set: function (s) { this._title = s; }
      });

      Object.defineProperty(proto, 'info', {
        get: function () { return this._info; },
        set: function (s) { this._info = s; }
      });

      Object.defineProperty(proto, 'level', {
        get: function () { return this._level; },
        set: function (s) { this._level = s; }
      });

      Object.defineProperty(proto, 'listType', {
        get: function () { return this._listData.type; },
        set: function (t) { this._listData.type = t; }
      });

      Object.defineProperty(proto, 'listTight', {
        get: function () { return this._listData.tight; },
        set: function (t) { this._listData.tight = t; }
      });

      Object.defineProperty(proto, 'listStart', {
        get: function () { return this._listData.start; },
        set: function (n) { this._listData.start = n; }
      });

      Object.defineProperty(proto, 'listDelimiter', {
        get: function () { return this._listData.delimiter; },
        set: function (delim) { this._listData.delimiter = delim; }
      });

      Node.prototype.appendChild = function (child) {
        child.unlink();
        child._parent = this;
        if (this._lastChild) {
          this._lastChild._next = child;
          child._prev = this._lastChild;
          this._lastChild = child;
        } else {
          this._firstChild = child;
          this._lastChild = child;
        }
      };

      Node.prototype.prependChild = function (child) {
        child.unlink();
        child._parent = this;
        if (this._firstChild) {
          this._firstChild._prev = child;
          child._next = this._firstChild;
          this._firstChild = child;
        } else {
          this._firstChild = child;
          this._lastChild = child;
        }
      };

      Node.prototype.unlink = function () {
        if (this._prev) {
          this._prev._next = this._next;
        } else if (this._parent) {
          this._parent._firstChild = this._next;
        }
        if (this._next) {
          this._next._prev = this._prev;
        } else if (this._parent) {
          this._parent._lastChild = this._prev;
        }
        this._parent = null;
        this._next = null;
        this._prev = null;
      };

      Node.prototype.insertAfter = function (sibling) {
        sibling.unlink();
        sibling._next = this._next;
        if (sibling._next) {
          sibling._next._prev = sibling;
        }
        sibling._prev = this;
        this._next = sibling;
        sibling._parent = this._parent;
        if (!sibling._next) {
          sibling._parent._lastChild = sibling;
        }
      };

      Node.prototype.insertBefore = function (sibling) {
        sibling.unlink();
        sibling._prev = this._prev;
        if (sibling._prev) {
          sibling._prev._next = sibling;
        }
        sibling._next = this;
        this._prev = sibling;
        sibling._parent = this._parent;
        if (!sibling._prev) {
          sibling._parent._firstChild = sibling;
        }
      };

      Node.prototype.walker = function () {
        var walker = new NodeWalker(this);
        return walker;
      };

      module.exports = Node;


      /* Example of use of walker:
      
       var walker = w.walker();
       var event;
      
       while (event = walker.next()) {
       console.log(event.entering, event.node.type);
       }
      
       */

    }, {}], 11: [function (require, module, exports) {
      "use strict";

      /* The bulk of this code derives from https://github.com/dmoscrop/fold-case
      But in addition to case-folding, we also normalize whitespace.
      
      fold-case is Copyright Mathias Bynens <https://mathiasbynens.be/>
      
      Permission is hereby granted, free of charge, to any person obtaining
      a copy of this software and associated documentation files (the
      "Software"), to deal in the Software without restriction, including
      without limitation the rights to use, copy, modify, merge, publish,
      distribute, sublicense, and/or sell copies of the Software, and to
      permit persons to whom the Software is furnished to do so, subject to
      the following conditions:
      
      The above copyright notice and this permission notice shall be
      included in all copies or substantial portions of the Software.
      
      THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
      EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
      MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
      NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
      LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
      OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
      WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
      */

      /*eslint-disable  key-spacing, comma-spacing */

      var regex = /[ \t\r\n]+|[A-Z\xB5\xC0-\xD6\xD8-\xDF\u0100\u0102\u0104\u0106\u0108\u010A\u010C\u010E\u0110\u0112\u0114\u0116\u0118\u011A\u011C\u011E\u0120\u0122\u0124\u0126\u0128\u012A\u012C\u012E\u0130\u0132\u0134\u0136\u0139\u013B\u013D\u013F\u0141\u0143\u0145\u0147\u0149\u014A\u014C\u014E\u0150\u0152\u0154\u0156\u0158\u015A\u015C\u015E\u0160\u0162\u0164\u0166\u0168\u016A\u016C\u016E\u0170\u0172\u0174\u0176\u0178\u0179\u017B\u017D\u017F\u0181\u0182\u0184\u0186\u0187\u0189-\u018B\u018E-\u0191\u0193\u0194\u0196-\u0198\u019C\u019D\u019F\u01A0\u01A2\u01A4\u01A6\u01A7\u01A9\u01AC\u01AE\u01AF\u01B1-\u01B3\u01B5\u01B7\u01B8\u01BC\u01C4\u01C5\u01C7\u01C8\u01CA\u01CB\u01CD\u01CF\u01D1\u01D3\u01D5\u01D7\u01D9\u01DB\u01DE\u01E0\u01E2\u01E4\u01E6\u01E8\u01EA\u01EC\u01EE\u01F0-\u01F2\u01F4\u01F6-\u01F8\u01FA\u01FC\u01FE\u0200\u0202\u0204\u0206\u0208\u020A\u020C\u020E\u0210\u0212\u0214\u0216\u0218\u021A\u021C\u021E\u0220\u0222\u0224\u0226\u0228\u022A\u022C\u022E\u0230\u0232\u023A\u023B\u023D\u023E\u0241\u0243-\u0246\u0248\u024A\u024C\u024E\u0345\u0370\u0372\u0376\u037F\u0386\u0388-\u038A\u038C\u038E-\u03A1\u03A3-\u03AB\u03B0\u03C2\u03CF-\u03D1\u03D5\u03D6\u03D8\u03DA\u03DC\u03DE\u03E0\u03E2\u03E4\u03E6\u03E8\u03EA\u03EC\u03EE\u03F0\u03F1\u03F4\u03F5\u03F7\u03F9\u03FA\u03FD-\u042F\u0460\u0462\u0464\u0466\u0468\u046A\u046C\u046E\u0470\u0472\u0474\u0476\u0478\u047A\u047C\u047E\u0480\u048A\u048C\u048E\u0490\u0492\u0494\u0496\u0498\u049A\u049C\u049E\u04A0\u04A2\u04A4\u04A6\u04A8\u04AA\u04AC\u04AE\u04B0\u04B2\u04B4\u04B6\u04B8\u04BA\u04BC\u04BE\u04C0\u04C1\u04C3\u04C5\u04C7\u04C9\u04CB\u04CD\u04D0\u04D2\u04D4\u04D6\u04D8\u04DA\u04DC\u04DE\u04E0\u04E2\u04E4\u04E6\u04E8\u04EA\u04EC\u04EE\u04F0\u04F2\u04F4\u04F6\u04F8\u04FA\u04FC\u04FE\u0500\u0502\u0504\u0506\u0508\u050A\u050C\u050E\u0510\u0512\u0514\u0516\u0518\u051A\u051C\u051E\u0520\u0522\u0524\u0526\u0528\u052A\u052C\u052E\u0531-\u0556\u0587\u10A0-\u10C5\u10C7\u10CD\u1E00\u1E02\u1E04\u1E06\u1E08\u1E0A\u1E0C\u1E0E\u1E10\u1E12\u1E14\u1E16\u1E18\u1E1A\u1E1C\u1E1E\u1E20\u1E22\u1E24\u1E26\u1E28\u1E2A\u1E2C\u1E2E\u1E30\u1E32\u1E34\u1E36\u1E38\u1E3A\u1E3C\u1E3E\u1E40\u1E42\u1E44\u1E46\u1E48\u1E4A\u1E4C\u1E4E\u1E50\u1E52\u1E54\u1E56\u1E58\u1E5A\u1E5C\u1E5E\u1E60\u1E62\u1E64\u1E66\u1E68\u1E6A\u1E6C\u1E6E\u1E70\u1E72\u1E74\u1E76\u1E78\u1E7A\u1E7C\u1E7E\u1E80\u1E82\u1E84\u1E86\u1E88\u1E8A\u1E8C\u1E8E\u1E90\u1E92\u1E94\u1E96-\u1E9B\u1E9E\u1EA0\u1EA2\u1EA4\u1EA6\u1EA8\u1EAA\u1EAC\u1EAE\u1EB0\u1EB2\u1EB4\u1EB6\u1EB8\u1EBA\u1EBC\u1EBE\u1EC0\u1EC2\u1EC4\u1EC6\u1EC8\u1ECA\u1ECC\u1ECE\u1ED0\u1ED2\u1ED4\u1ED6\u1ED8\u1EDA\u1EDC\u1EDE\u1EE0\u1EE2\u1EE4\u1EE6\u1EE8\u1EEA\u1EEC\u1EEE\u1EF0\u1EF2\u1EF4\u1EF6\u1EF8\u1EFA\u1EFC\u1EFE\u1F08-\u1F0F\u1F18-\u1F1D\u1F28-\u1F2F\u1F38-\u1F3F\u1F48-\u1F4D\u1F50\u1F52\u1F54\u1F56\u1F59\u1F5B\u1F5D\u1F5F\u1F68-\u1F6F\u1F80-\u1FAF\u1FB2-\u1FB4\u1FB6-\u1FBC\u1FBE\u1FC2-\u1FC4\u1FC6-\u1FCC\u1FD2\u1FD3\u1FD6-\u1FDB\u1FE2-\u1FE4\u1FE6-\u1FEC\u1FF2-\u1FF4\u1FF6-\u1FFC\u2126\u212A\u212B\u2132\u2160-\u216F\u2183\u24B6-\u24CF\u2C00-\u2C2E\u2C60\u2C62-\u2C64\u2C67\u2C69\u2C6B\u2C6D-\u2C70\u2C72\u2C75\u2C7E-\u2C80\u2C82\u2C84\u2C86\u2C88\u2C8A\u2C8C\u2C8E\u2C90\u2C92\u2C94\u2C96\u2C98\u2C9A\u2C9C\u2C9E\u2CA0\u2CA2\u2CA4\u2CA6\u2CA8\u2CAA\u2CAC\u2CAE\u2CB0\u2CB2\u2CB4\u2CB6\u2CB8\u2CBA\u2CBC\u2CBE\u2CC0\u2CC2\u2CC4\u2CC6\u2CC8\u2CCA\u2CCC\u2CCE\u2CD0\u2CD2\u2CD4\u2CD6\u2CD8\u2CDA\u2CDC\u2CDE\u2CE0\u2CE2\u2CEB\u2CED\u2CF2\uA640\uA642\uA644\uA646\uA648\uA64A\uA64C\uA64E\uA650\uA652\uA654\uA656\uA658\uA65A\uA65C\uA65E\uA660\uA662\uA664\uA666\uA668\uA66A\uA66C\uA680\uA682\uA684\uA686\uA688\uA68A\uA68C\uA68E\uA690\uA692\uA694\uA696\uA698\uA69A\uA722\uA724\uA726\uA728\uA72A\uA72C\uA72E\uA732\uA734\uA736\uA738\uA73A\uA73C\uA73E\uA740\uA742\uA744\uA746\uA748\uA74A\uA74C\uA74E\uA750\uA752\uA754\uA756\uA758\uA75A\uA75C\uA75E\uA760\uA762\uA764\uA766\uA768\uA76A\uA76C\uA76E\uA779\uA77B\uA77D\uA77E\uA780\uA782\uA784\uA786\uA78B\uA78D\uA790\uA792\uA796\uA798\uA79A\uA79C\uA79E\uA7A0\uA7A2\uA7A4\uA7A6\uA7A8\uA7AA-\uA7AD\uA7B0\uA7B1\uFB00-\uFB06\uFB13-\uFB17\uFF21-\uFF3A]|\uD801[\uDC00-\uDC27]|\uD806[\uDCA0-\uDCBF]/g;

      var map = { 'A': 'a', 'B': 'b', 'C': 'c', 'D': 'd', 'E': 'e', 'F': 'f', 'G': 'g', 'H': 'h', 'I': 'i', 'J': 'j', 'K': 'k', 'L': 'l', 'M': 'm', 'N': 'n', 'O': 'o', 'P': 'p', 'Q': 'q', 'R': 'r', 'S': 's', 'T': 't', 'U': 'u', 'V': 'v', 'W': 'w', 'X': 'x', 'Y': 'y', 'Z': 'z', '\xB5': '\u03BC', '\xC0': '\xE0', '\xC1': '\xE1', '\xC2': '\xE2', '\xC3': '\xE3', '\xC4': '\xE4', '\xC5': '\xE5', '\xC6': '\xE6', '\xC7': '\xE7', '\xC8': '\xE8', '\xC9': '\xE9', '\xCA': '\xEA', '\xCB': '\xEB', '\xCC': '\xEC', '\xCD': '\xED', '\xCE': '\xEE', '\xCF': '\xEF', '\xD0': '\xF0', '\xD1': '\xF1', '\xD2': '\xF2', '\xD3': '\xF3', '\xD4': '\xF4', '\xD5': '\xF5', '\xD6': '\xF6', '\xD8': '\xF8', '\xD9': '\xF9', '\xDA': '\xFA', '\xDB': '\xFB', '\xDC': '\xFC', '\xDD': '\xFD', '\xDE': '\xFE', '\u0100': '\u0101', '\u0102': '\u0103', '\u0104': '\u0105', '\u0106': '\u0107', '\u0108': '\u0109', '\u010A': '\u010B', '\u010C': '\u010D', '\u010E': '\u010F', '\u0110': '\u0111', '\u0112': '\u0113', '\u0114': '\u0115', '\u0116': '\u0117', '\u0118': '\u0119', '\u011A': '\u011B', '\u011C': '\u011D', '\u011E': '\u011F', '\u0120': '\u0121', '\u0122': '\u0123', '\u0124': '\u0125', '\u0126': '\u0127', '\u0128': '\u0129', '\u012A': '\u012B', '\u012C': '\u012D', '\u012E': '\u012F', '\u0132': '\u0133', '\u0134': '\u0135', '\u0136': '\u0137', '\u0139': '\u013A', '\u013B': '\u013C', '\u013D': '\u013E', '\u013F': '\u0140', '\u0141': '\u0142', '\u0143': '\u0144', '\u0145': '\u0146', '\u0147': '\u0148', '\u014A': '\u014B', '\u014C': '\u014D', '\u014E': '\u014F', '\u0150': '\u0151', '\u0152': '\u0153', '\u0154': '\u0155', '\u0156': '\u0157', '\u0158': '\u0159', '\u015A': '\u015B', '\u015C': '\u015D', '\u015E': '\u015F', '\u0160': '\u0161', '\u0162': '\u0163', '\u0164': '\u0165', '\u0166': '\u0167', '\u0168': '\u0169', '\u016A': '\u016B', '\u016C': '\u016D', '\u016E': '\u016F', '\u0170': '\u0171', '\u0172': '\u0173', '\u0174': '\u0175', '\u0176': '\u0177', '\u0178': '\xFF', '\u0179': '\u017A', '\u017B': '\u017C', '\u017D': '\u017E', '\u017F': 's', '\u0181': '\u0253', '\u0182': '\u0183', '\u0184': '\u0185', '\u0186': '\u0254', '\u0187': '\u0188', '\u0189': '\u0256', '\u018A': '\u0257', '\u018B': '\u018C', '\u018E': '\u01DD', '\u018F': '\u0259', '\u0190': '\u025B', '\u0191': '\u0192', '\u0193': '\u0260', '\u0194': '\u0263', '\u0196': '\u0269', '\u0197': '\u0268', '\u0198': '\u0199', '\u019C': '\u026F', '\u019D': '\u0272', '\u019F': '\u0275', '\u01A0': '\u01A1', '\u01A2': '\u01A3', '\u01A4': '\u01A5', '\u01A6': '\u0280', '\u01A7': '\u01A8', '\u01A9': '\u0283', '\u01AC': '\u01AD', '\u01AE': '\u0288', '\u01AF': '\u01B0', '\u01B1': '\u028A', '\u01B2': '\u028B', '\u01B3': '\u01B4', '\u01B5': '\u01B6', '\u01B7': '\u0292', '\u01B8': '\u01B9', '\u01BC': '\u01BD', '\u01C4': '\u01C6', '\u01C5': '\u01C6', '\u01C7': '\u01C9', '\u01C8': '\u01C9', '\u01CA': '\u01CC', '\u01CB': '\u01CC', '\u01CD': '\u01CE', '\u01CF': '\u01D0', '\u01D1': '\u01D2', '\u01D3': '\u01D4', '\u01D5': '\u01D6', '\u01D7': '\u01D8', '\u01D9': '\u01DA', '\u01DB': '\u01DC', '\u01DE': '\u01DF', '\u01E0': '\u01E1', '\u01E2': '\u01E3', '\u01E4': '\u01E5', '\u01E6': '\u01E7', '\u01E8': '\u01E9', '\u01EA': '\u01EB', '\u01EC': '\u01ED', '\u01EE': '\u01EF', '\u01F1': '\u01F3', '\u01F2': '\u01F3', '\u01F4': '\u01F5', '\u01F6': '\u0195', '\u01F7': '\u01BF', '\u01F8': '\u01F9', '\u01FA': '\u01FB', '\u01FC': '\u01FD', '\u01FE': '\u01FF', '\u0200': '\u0201', '\u0202': '\u0203', '\u0204': '\u0205', '\u0206': '\u0207', '\u0208': '\u0209', '\u020A': '\u020B', '\u020C': '\u020D', '\u020E': '\u020F', '\u0210': '\u0211', '\u0212': '\u0213', '\u0214': '\u0215', '\u0216': '\u0217', '\u0218': '\u0219', '\u021A': '\u021B', '\u021C': '\u021D', '\u021E': '\u021F', '\u0220': '\u019E', '\u0222': '\u0223', '\u0224': '\u0225', '\u0226': '\u0227', '\u0228': '\u0229', '\u022A': '\u022B', '\u022C': '\u022D', '\u022E': '\u022F', '\u0230': '\u0231', '\u0232': '\u0233', '\u023A': '\u2C65', '\u023B': '\u023C', '\u023D': '\u019A', '\u023E': '\u2C66', '\u0241': '\u0242', '\u0243': '\u0180', '\u0244': '\u0289', '\u0245': '\u028C', '\u0246': '\u0247', '\u0248': '\u0249', '\u024A': '\u024B', '\u024C': '\u024D', '\u024E': '\u024F', '\u0345': '\u03B9', '\u0370': '\u0371', '\u0372': '\u0373', '\u0376': '\u0377', '\u037F': '\u03F3', '\u0386': '\u03AC', '\u0388': '\u03AD', '\u0389': '\u03AE', '\u038A': '\u03AF', '\u038C': '\u03CC', '\u038E': '\u03CD', '\u038F': '\u03CE', '\u0391': '\u03B1', '\u0392': '\u03B2', '\u0393': '\u03B3', '\u0394': '\u03B4', '\u0395': '\u03B5', '\u0396': '\u03B6', '\u0397': '\u03B7', '\u0398': '\u03B8', '\u0399': '\u03B9', '\u039A': '\u03BA', '\u039B': '\u03BB', '\u039C': '\u03BC', '\u039D': '\u03BD', '\u039E': '\u03BE', '\u039F': '\u03BF', '\u03A0': '\u03C0', '\u03A1': '\u03C1', '\u03A3': '\u03C3', '\u03A4': '\u03C4', '\u03A5': '\u03C5', '\u03A6': '\u03C6', '\u03A7': '\u03C7', '\u03A8': '\u03C8', '\u03A9': '\u03C9', '\u03AA': '\u03CA', '\u03AB': '\u03CB', '\u03C2': '\u03C3', '\u03CF': '\u03D7', '\u03D0': '\u03B2', '\u03D1': '\u03B8', '\u03D5': '\u03C6', '\u03D6': '\u03C0', '\u03D8': '\u03D9', '\u03DA': '\u03DB', '\u03DC': '\u03DD', '\u03DE': '\u03DF', '\u03E0': '\u03E1', '\u03E2': '\u03E3', '\u03E4': '\u03E5', '\u03E6': '\u03E7', '\u03E8': '\u03E9', '\u03EA': '\u03EB', '\u03EC': '\u03ED', '\u03EE': '\u03EF', '\u03F0': '\u03BA', '\u03F1': '\u03C1', '\u03F4': '\u03B8', '\u03F5': '\u03B5', '\u03F7': '\u03F8', '\u03F9': '\u03F2', '\u03FA': '\u03FB', '\u03FD': '\u037B', '\u03FE': '\u037C', '\u03FF': '\u037D', '\u0400': '\u0450', '\u0401': '\u0451', '\u0402': '\u0452', '\u0403': '\u0453', '\u0404': '\u0454', '\u0405': '\u0455', '\u0406': '\u0456', '\u0407': '\u0457', '\u0408': '\u0458', '\u0409': '\u0459', '\u040A': '\u045A', '\u040B': '\u045B', '\u040C': '\u045C', '\u040D': '\u045D', '\u040E': '\u045E', '\u040F': '\u045F', '\u0410': '\u0430', '\u0411': '\u0431', '\u0412': '\u0432', '\u0413': '\u0433', '\u0414': '\u0434', '\u0415': '\u0435', '\u0416': '\u0436', '\u0417': '\u0437', '\u0418': '\u0438', '\u0419': '\u0439', '\u041A': '\u043A', '\u041B': '\u043B', '\u041C': '\u043C', '\u041D': '\u043D', '\u041E': '\u043E', '\u041F': '\u043F', '\u0420': '\u0440', '\u0421': '\u0441', '\u0422': '\u0442', '\u0423': '\u0443', '\u0424': '\u0444', '\u0425': '\u0445', '\u0426': '\u0446', '\u0427': '\u0447', '\u0428': '\u0448', '\u0429': '\u0449', '\u042A': '\u044A', '\u042B': '\u044B', '\u042C': '\u044C', '\u042D': '\u044D', '\u042E': '\u044E', '\u042F': '\u044F', '\u0460': '\u0461', '\u0462': '\u0463', '\u0464': '\u0465', '\u0466': '\u0467', '\u0468': '\u0469', '\u046A': '\u046B', '\u046C': '\u046D', '\u046E': '\u046F', '\u0470': '\u0471', '\u0472': '\u0473', '\u0474': '\u0475', '\u0476': '\u0477', '\u0478': '\u0479', '\u047A': '\u047B', '\u047C': '\u047D', '\u047E': '\u047F', '\u0480': '\u0481', '\u048A': '\u048B', '\u048C': '\u048D', '\u048E': '\u048F', '\u0490': '\u0491', '\u0492': '\u0493', '\u0494': '\u0495', '\u0496': '\u0497', '\u0498': '\u0499', '\u049A': '\u049B', '\u049C': '\u049D', '\u049E': '\u049F', '\u04A0': '\u04A1', '\u04A2': '\u04A3', '\u04A4': '\u04A5', '\u04A6': '\u04A7', '\u04A8': '\u04A9', '\u04AA': '\u04AB', '\u04AC': '\u04AD', '\u04AE': '\u04AF', '\u04B0': '\u04B1', '\u04B2': '\u04B3', '\u04B4': '\u04B5', '\u04B6': '\u04B7', '\u04B8': '\u04B9', '\u04BA': '\u04BB', '\u04BC': '\u04BD', '\u04BE': '\u04BF', '\u04C0': '\u04CF', '\u04C1': '\u04C2', '\u04C3': '\u04C4', '\u04C5': '\u04C6', '\u04C7': '\u04C8', '\u04C9': '\u04CA', '\u04CB': '\u04CC', '\u04CD': '\u04CE', '\u04D0': '\u04D1', '\u04D2': '\u04D3', '\u04D4': '\u04D5', '\u04D6': '\u04D7', '\u04D8': '\u04D9', '\u04DA': '\u04DB', '\u04DC': '\u04DD', '\u04DE': '\u04DF', '\u04E0': '\u04E1', '\u04E2': '\u04E3', '\u04E4': '\u04E5', '\u04E6': '\u04E7', '\u04E8': '\u04E9', '\u04EA': '\u04EB', '\u04EC': '\u04ED', '\u04EE': '\u04EF', '\u04F0': '\u04F1', '\u04F2': '\u04F3', '\u04F4': '\u04F5', '\u04F6': '\u04F7', '\u04F8': '\u04F9', '\u04FA': '\u04FB', '\u04FC': '\u04FD', '\u04FE': '\u04FF', '\u0500': '\u0501', '\u0502': '\u0503', '\u0504': '\u0505', '\u0506': '\u0507', '\u0508': '\u0509', '\u050A': '\u050B', '\u050C': '\u050D', '\u050E': '\u050F', '\u0510': '\u0511', '\u0512': '\u0513', '\u0514': '\u0515', '\u0516': '\u0517', '\u0518': '\u0519', '\u051A': '\u051B', '\u051C': '\u051D', '\u051E': '\u051F', '\u0520': '\u0521', '\u0522': '\u0523', '\u0524': '\u0525', '\u0526': '\u0527', '\u0528': '\u0529', '\u052A': '\u052B', '\u052C': '\u052D', '\u052E': '\u052F', '\u0531': '\u0561', '\u0532': '\u0562', '\u0533': '\u0563', '\u0534': '\u0564', '\u0535': '\u0565', '\u0536': '\u0566', '\u0537': '\u0567', '\u0538': '\u0568', '\u0539': '\u0569', '\u053A': '\u056A', '\u053B': '\u056B', '\u053C': '\u056C', '\u053D': '\u056D', '\u053E': '\u056E', '\u053F': '\u056F', '\u0540': '\u0570', '\u0541': '\u0571', '\u0542': '\u0572', '\u0543': '\u0573', '\u0544': '\u0574', '\u0545': '\u0575', '\u0546': '\u0576', '\u0547': '\u0577', '\u0548': '\u0578', '\u0549': '\u0579', '\u054A': '\u057A', '\u054B': '\u057B', '\u054C': '\u057C', '\u054D': '\u057D', '\u054E': '\u057E', '\u054F': '\u057F', '\u0550': '\u0580', '\u0551': '\u0581', '\u0552': '\u0582', '\u0553': '\u0583', '\u0554': '\u0584', '\u0555': '\u0585', '\u0556': '\u0586', '\u10A0': '\u2D00', '\u10A1': '\u2D01', '\u10A2': '\u2D02', '\u10A3': '\u2D03', '\u10A4': '\u2D04', '\u10A5': '\u2D05', '\u10A6': '\u2D06', '\u10A7': '\u2D07', '\u10A8': '\u2D08', '\u10A9': '\u2D09', '\u10AA': '\u2D0A', '\u10AB': '\u2D0B', '\u10AC': '\u2D0C', '\u10AD': '\u2D0D', '\u10AE': '\u2D0E', '\u10AF': '\u2D0F', '\u10B0': '\u2D10', '\u10B1': '\u2D11', '\u10B2': '\u2D12', '\u10B3': '\u2D13', '\u10B4': '\u2D14', '\u10B5': '\u2D15', '\u10B6': '\u2D16', '\u10B7': '\u2D17', '\u10B8': '\u2D18', '\u10B9': '\u2D19', '\u10BA': '\u2D1A', '\u10BB': '\u2D1B', '\u10BC': '\u2D1C', '\u10BD': '\u2D1D', '\u10BE': '\u2D1E', '\u10BF': '\u2D1F', '\u10C0': '\u2D20', '\u10C1': '\u2D21', '\u10C2': '\u2D22', '\u10C3': '\u2D23', '\u10C4': '\u2D24', '\u10C5': '\u2D25', '\u10C7': '\u2D27', '\u10CD': '\u2D2D', '\u1E00': '\u1E01', '\u1E02': '\u1E03', '\u1E04': '\u1E05', '\u1E06': '\u1E07', '\u1E08': '\u1E09', '\u1E0A': '\u1E0B', '\u1E0C': '\u1E0D', '\u1E0E': '\u1E0F', '\u1E10': '\u1E11', '\u1E12': '\u1E13', '\u1E14': '\u1E15', '\u1E16': '\u1E17', '\u1E18': '\u1E19', '\u1E1A': '\u1E1B', '\u1E1C': '\u1E1D', '\u1E1E': '\u1E1F', '\u1E20': '\u1E21', '\u1E22': '\u1E23', '\u1E24': '\u1E25', '\u1E26': '\u1E27', '\u1E28': '\u1E29', '\u1E2A': '\u1E2B', '\u1E2C': '\u1E2D', '\u1E2E': '\u1E2F', '\u1E30': '\u1E31', '\u1E32': '\u1E33', '\u1E34': '\u1E35', '\u1E36': '\u1E37', '\u1E38': '\u1E39', '\u1E3A': '\u1E3B', '\u1E3C': '\u1E3D', '\u1E3E': '\u1E3F', '\u1E40': '\u1E41', '\u1E42': '\u1E43', '\u1E44': '\u1E45', '\u1E46': '\u1E47', '\u1E48': '\u1E49', '\u1E4A': '\u1E4B', '\u1E4C': '\u1E4D', '\u1E4E': '\u1E4F', '\u1E50': '\u1E51', '\u1E52': '\u1E53', '\u1E54': '\u1E55', '\u1E56': '\u1E57', '\u1E58': '\u1E59', '\u1E5A': '\u1E5B', '\u1E5C': '\u1E5D', '\u1E5E': '\u1E5F', '\u1E60': '\u1E61', '\u1E62': '\u1E63', '\u1E64': '\u1E65', '\u1E66': '\u1E67', '\u1E68': '\u1E69', '\u1E6A': '\u1E6B', '\u1E6C': '\u1E6D', '\u1E6E': '\u1E6F', '\u1E70': '\u1E71', '\u1E72': '\u1E73', '\u1E74': '\u1E75', '\u1E76': '\u1E77', '\u1E78': '\u1E79', '\u1E7A': '\u1E7B', '\u1E7C': '\u1E7D', '\u1E7E': '\u1E7F', '\u1E80': '\u1E81', '\u1E82': '\u1E83', '\u1E84': '\u1E85', '\u1E86': '\u1E87', '\u1E88': '\u1E89', '\u1E8A': '\u1E8B', '\u1E8C': '\u1E8D', '\u1E8E': '\u1E8F', '\u1E90': '\u1E91', '\u1E92': '\u1E93', '\u1E94': '\u1E95', '\u1E9B': '\u1E61', '\u1EA0': '\u1EA1', '\u1EA2': '\u1EA3', '\u1EA4': '\u1EA5', '\u1EA6': '\u1EA7', '\u1EA8': '\u1EA9', '\u1EAA': '\u1EAB', '\u1EAC': '\u1EAD', '\u1EAE': '\u1EAF', '\u1EB0': '\u1EB1', '\u1EB2': '\u1EB3', '\u1EB4': '\u1EB5', '\u1EB6': '\u1EB7', '\u1EB8': '\u1EB9', '\u1EBA': '\u1EBB', '\u1EBC': '\u1EBD', '\u1EBE': '\u1EBF', '\u1EC0': '\u1EC1', '\u1EC2': '\u1EC3', '\u1EC4': '\u1EC5', '\u1EC6': '\u1EC7', '\u1EC8': '\u1EC9', '\u1ECA': '\u1ECB', '\u1ECC': '\u1ECD', '\u1ECE': '\u1ECF', '\u1ED0': '\u1ED1', '\u1ED2': '\u1ED3', '\u1ED4': '\u1ED5', '\u1ED6': '\u1ED7', '\u1ED8': '\u1ED9', '\u1EDA': '\u1EDB', '\u1EDC': '\u1EDD', '\u1EDE': '\u1EDF', '\u1EE0': '\u1EE1', '\u1EE2': '\u1EE3', '\u1EE4': '\u1EE5', '\u1EE6': '\u1EE7', '\u1EE8': '\u1EE9', '\u1EEA': '\u1EEB', '\u1EEC': '\u1EED', '\u1EEE': '\u1EEF', '\u1EF0': '\u1EF1', '\u1EF2': '\u1EF3', '\u1EF4': '\u1EF5', '\u1EF6': '\u1EF7', '\u1EF8': '\u1EF9', '\u1EFA': '\u1EFB', '\u1EFC': '\u1EFD', '\u1EFE': '\u1EFF', '\u1F08': '\u1F00', '\u1F09': '\u1F01', '\u1F0A': '\u1F02', '\u1F0B': '\u1F03', '\u1F0C': '\u1F04', '\u1F0D': '\u1F05', '\u1F0E': '\u1F06', '\u1F0F': '\u1F07', '\u1F18': '\u1F10', '\u1F19': '\u1F11', '\u1F1A': '\u1F12', '\u1F1B': '\u1F13', '\u1F1C': '\u1F14', '\u1F1D': '\u1F15', '\u1F28': '\u1F20', '\u1F29': '\u1F21', '\u1F2A': '\u1F22', '\u1F2B': '\u1F23', '\u1F2C': '\u1F24', '\u1F2D': '\u1F25', '\u1F2E': '\u1F26', '\u1F2F': '\u1F27', '\u1F38': '\u1F30', '\u1F39': '\u1F31', '\u1F3A': '\u1F32', '\u1F3B': '\u1F33', '\u1F3C': '\u1F34', '\u1F3D': '\u1F35', '\u1F3E': '\u1F36', '\u1F3F': '\u1F37', '\u1F48': '\u1F40', '\u1F49': '\u1F41', '\u1F4A': '\u1F42', '\u1F4B': '\u1F43', '\u1F4C': '\u1F44', '\u1F4D': '\u1F45', '\u1F59': '\u1F51', '\u1F5B': '\u1F53', '\u1F5D': '\u1F55', '\u1F5F': '\u1F57', '\u1F68': '\u1F60', '\u1F69': '\u1F61', '\u1F6A': '\u1F62', '\u1F6B': '\u1F63', '\u1F6C': '\u1F64', '\u1F6D': '\u1F65', '\u1F6E': '\u1F66', '\u1F6F': '\u1F67', '\u1FB8': '\u1FB0', '\u1FB9': '\u1FB1', '\u1FBA': '\u1F70', '\u1FBB': '\u1F71', '\u1FBE': '\u03B9', '\u1FC8': '\u1F72', '\u1FC9': '\u1F73', '\u1FCA': '\u1F74', '\u1FCB': '\u1F75', '\u1FD8': '\u1FD0', '\u1FD9': '\u1FD1', '\u1FDA': '\u1F76', '\u1FDB': '\u1F77', '\u1FE8': '\u1FE0', '\u1FE9': '\u1FE1', '\u1FEA': '\u1F7A', '\u1FEB': '\u1F7B', '\u1FEC': '\u1FE5', '\u1FF8': '\u1F78', '\u1FF9': '\u1F79', '\u1FFA': '\u1F7C', '\u1FFB': '\u1F7D', '\u2126': '\u03C9', '\u212A': 'k', '\u212B': '\xE5', '\u2132': '\u214E', '\u2160': '\u2170', '\u2161': '\u2171', '\u2162': '\u2172', '\u2163': '\u2173', '\u2164': '\u2174', '\u2165': '\u2175', '\u2166': '\u2176', '\u2167': '\u2177', '\u2168': '\u2178', '\u2169': '\u2179', '\u216A': '\u217A', '\u216B': '\u217B', '\u216C': '\u217C', '\u216D': '\u217D', '\u216E': '\u217E', '\u216F': '\u217F', '\u2183': '\u2184', '\u24B6': '\u24D0', '\u24B7': '\u24D1', '\u24B8': '\u24D2', '\u24B9': '\u24D3', '\u24BA': '\u24D4', '\u24BB': '\u24D5', '\u24BC': '\u24D6', '\u24BD': '\u24D7', '\u24BE': '\u24D8', '\u24BF': '\u24D9', '\u24C0': '\u24DA', '\u24C1': '\u24DB', '\u24C2': '\u24DC', '\u24C3': '\u24DD', '\u24C4': '\u24DE', '\u24C5': '\u24DF', '\u24C6': '\u24E0', '\u24C7': '\u24E1', '\u24C8': '\u24E2', '\u24C9': '\u24E3', '\u24CA': '\u24E4', '\u24CB': '\u24E5', '\u24CC': '\u24E6', '\u24CD': '\u24E7', '\u24CE': '\u24E8', '\u24CF': '\u24E9', '\u2C00': '\u2C30', '\u2C01': '\u2C31', '\u2C02': '\u2C32', '\u2C03': '\u2C33', '\u2C04': '\u2C34', '\u2C05': '\u2C35', '\u2C06': '\u2C36', '\u2C07': '\u2C37', '\u2C08': '\u2C38', '\u2C09': '\u2C39', '\u2C0A': '\u2C3A', '\u2C0B': '\u2C3B', '\u2C0C': '\u2C3C', '\u2C0D': '\u2C3D', '\u2C0E': '\u2C3E', '\u2C0F': '\u2C3F', '\u2C10': '\u2C40', '\u2C11': '\u2C41', '\u2C12': '\u2C42', '\u2C13': '\u2C43', '\u2C14': '\u2C44', '\u2C15': '\u2C45', '\u2C16': '\u2C46', '\u2C17': '\u2C47', '\u2C18': '\u2C48', '\u2C19': '\u2C49', '\u2C1A': '\u2C4A', '\u2C1B': '\u2C4B', '\u2C1C': '\u2C4C', '\u2C1D': '\u2C4D', '\u2C1E': '\u2C4E', '\u2C1F': '\u2C4F', '\u2C20': '\u2C50', '\u2C21': '\u2C51', '\u2C22': '\u2C52', '\u2C23': '\u2C53', '\u2C24': '\u2C54', '\u2C25': '\u2C55', '\u2C26': '\u2C56', '\u2C27': '\u2C57', '\u2C28': '\u2C58', '\u2C29': '\u2C59', '\u2C2A': '\u2C5A', '\u2C2B': '\u2C5B', '\u2C2C': '\u2C5C', '\u2C2D': '\u2C5D', '\u2C2E': '\u2C5E', '\u2C60': '\u2C61', '\u2C62': '\u026B', '\u2C63': '\u1D7D', '\u2C64': '\u027D', '\u2C67': '\u2C68', '\u2C69': '\u2C6A', '\u2C6B': '\u2C6C', '\u2C6D': '\u0251', '\u2C6E': '\u0271', '\u2C6F': '\u0250', '\u2C70': '\u0252', '\u2C72': '\u2C73', '\u2C75': '\u2C76', '\u2C7E': '\u023F', '\u2C7F': '\u0240', '\u2C80': '\u2C81', '\u2C82': '\u2C83', '\u2C84': '\u2C85', '\u2C86': '\u2C87', '\u2C88': '\u2C89', '\u2C8A': '\u2C8B', '\u2C8C': '\u2C8D', '\u2C8E': '\u2C8F', '\u2C90': '\u2C91', '\u2C92': '\u2C93', '\u2C94': '\u2C95', '\u2C96': '\u2C97', '\u2C98': '\u2C99', '\u2C9A': '\u2C9B', '\u2C9C': '\u2C9D', '\u2C9E': '\u2C9F', '\u2CA0': '\u2CA1', '\u2CA2': '\u2CA3', '\u2CA4': '\u2CA5', '\u2CA6': '\u2CA7', '\u2CA8': '\u2CA9', '\u2CAA': '\u2CAB', '\u2CAC': '\u2CAD', '\u2CAE': '\u2CAF', '\u2CB0': '\u2CB1', '\u2CB2': '\u2CB3', '\u2CB4': '\u2CB5', '\u2CB6': '\u2CB7', '\u2CB8': '\u2CB9', '\u2CBA': '\u2CBB', '\u2CBC': '\u2CBD', '\u2CBE': '\u2CBF', '\u2CC0': '\u2CC1', '\u2CC2': '\u2CC3', '\u2CC4': '\u2CC5', '\u2CC6': '\u2CC7', '\u2CC8': '\u2CC9', '\u2CCA': '\u2CCB', '\u2CCC': '\u2CCD', '\u2CCE': '\u2CCF', '\u2CD0': '\u2CD1', '\u2CD2': '\u2CD3', '\u2CD4': '\u2CD5', '\u2CD6': '\u2CD7', '\u2CD8': '\u2CD9', '\u2CDA': '\u2CDB', '\u2CDC': '\u2CDD', '\u2CDE': '\u2CDF', '\u2CE0': '\u2CE1', '\u2CE2': '\u2CE3', '\u2CEB': '\u2CEC', '\u2CED': '\u2CEE', '\u2CF2': '\u2CF3', '\uA640': '\uA641', '\uA642': '\uA643', '\uA644': '\uA645', '\uA646': '\uA647', '\uA648': '\uA649', '\uA64A': '\uA64B', '\uA64C': '\uA64D', '\uA64E': '\uA64F', '\uA650': '\uA651', '\uA652': '\uA653', '\uA654': '\uA655', '\uA656': '\uA657', '\uA658': '\uA659', '\uA65A': '\uA65B', '\uA65C': '\uA65D', '\uA65E': '\uA65F', '\uA660': '\uA661', '\uA662': '\uA663', '\uA664': '\uA665', '\uA666': '\uA667', '\uA668': '\uA669', '\uA66A': '\uA66B', '\uA66C': '\uA66D', '\uA680': '\uA681', '\uA682': '\uA683', '\uA684': '\uA685', '\uA686': '\uA687', '\uA688': '\uA689', '\uA68A': '\uA68B', '\uA68C': '\uA68D', '\uA68E': '\uA68F', '\uA690': '\uA691', '\uA692': '\uA693', '\uA694': '\uA695', '\uA696': '\uA697', '\uA698': '\uA699', '\uA69A': '\uA69B', '\uA722': '\uA723', '\uA724': '\uA725', '\uA726': '\uA727', '\uA728': '\uA729', '\uA72A': '\uA72B', '\uA72C': '\uA72D', '\uA72E': '\uA72F', '\uA732': '\uA733', '\uA734': '\uA735', '\uA736': '\uA737', '\uA738': '\uA739', '\uA73A': '\uA73B', '\uA73C': '\uA73D', '\uA73E': '\uA73F', '\uA740': '\uA741', '\uA742': '\uA743', '\uA744': '\uA745', '\uA746': '\uA747', '\uA748': '\uA749', '\uA74A': '\uA74B', '\uA74C': '\uA74D', '\uA74E': '\uA74F', '\uA750': '\uA751', '\uA752': '\uA753', '\uA754': '\uA755', '\uA756': '\uA757', '\uA758': '\uA759', '\uA75A': '\uA75B', '\uA75C': '\uA75D', '\uA75E': '\uA75F', '\uA760': '\uA761', '\uA762': '\uA763', '\uA764': '\uA765', '\uA766': '\uA767', '\uA768': '\uA769', '\uA76A': '\uA76B', '\uA76C': '\uA76D', '\uA76E': '\uA76F', '\uA779': '\uA77A', '\uA77B': '\uA77C', '\uA77D': '\u1D79', '\uA77E': '\uA77F', '\uA780': '\uA781', '\uA782': '\uA783', '\uA784': '\uA785', '\uA786': '\uA787', '\uA78B': '\uA78C', '\uA78D': '\u0265', '\uA790': '\uA791', '\uA792': '\uA793', '\uA796': '\uA797', '\uA798': '\uA799', '\uA79A': '\uA79B', '\uA79C': '\uA79D', '\uA79E': '\uA79F', '\uA7A0': '\uA7A1', '\uA7A2': '\uA7A3', '\uA7A4': '\uA7A5', '\uA7A6': '\uA7A7', '\uA7A8': '\uA7A9', '\uA7AA': '\u0266', '\uA7AB': '\u025C', '\uA7AC': '\u0261', '\uA7AD': '\u026C', '\uA7B0': '\u029E', '\uA7B1': '\u0287', '\uFF21': '\uFF41', '\uFF22': '\uFF42', '\uFF23': '\uFF43', '\uFF24': '\uFF44', '\uFF25': '\uFF45', '\uFF26': '\uFF46', '\uFF27': '\uFF47', '\uFF28': '\uFF48', '\uFF29': '\uFF49', '\uFF2A': '\uFF4A', '\uFF2B': '\uFF4B', '\uFF2C': '\uFF4C', '\uFF2D': '\uFF4D', '\uFF2E': '\uFF4E', '\uFF2F': '\uFF4F', '\uFF30': '\uFF50', '\uFF31': '\uFF51', '\uFF32': '\uFF52', '\uFF33': '\uFF53', '\uFF34': '\uFF54', '\uFF35': '\uFF55', '\uFF36': '\uFF56', '\uFF37': '\uFF57', '\uFF38': '\uFF58', '\uFF39': '\uFF59', '\uFF3A': '\uFF5A', '\uD801\uDC00': '\uD801\uDC28', '\uD801\uDC01': '\uD801\uDC29', '\uD801\uDC02': '\uD801\uDC2A', '\uD801\uDC03': '\uD801\uDC2B', '\uD801\uDC04': '\uD801\uDC2C', '\uD801\uDC05': '\uD801\uDC2D', '\uD801\uDC06': '\uD801\uDC2E', '\uD801\uDC07': '\uD801\uDC2F', '\uD801\uDC08': '\uD801\uDC30', '\uD801\uDC09': '\uD801\uDC31', '\uD801\uDC0A': '\uD801\uDC32', '\uD801\uDC0B': '\uD801\uDC33', '\uD801\uDC0C': '\uD801\uDC34', '\uD801\uDC0D': '\uD801\uDC35', '\uD801\uDC0E': '\uD801\uDC36', '\uD801\uDC0F': '\uD801\uDC37', '\uD801\uDC10': '\uD801\uDC38', '\uD801\uDC11': '\uD801\uDC39', '\uD801\uDC12': '\uD801\uDC3A', '\uD801\uDC13': '\uD801\uDC3B', '\uD801\uDC14': '\uD801\uDC3C', '\uD801\uDC15': '\uD801\uDC3D', '\uD801\uDC16': '\uD801\uDC3E', '\uD801\uDC17': '\uD801\uDC3F', '\uD801\uDC18': '\uD801\uDC40', '\uD801\uDC19': '\uD801\uDC41', '\uD801\uDC1A': '\uD801\uDC42', '\uD801\uDC1B': '\uD801\uDC43', '\uD801\uDC1C': '\uD801\uDC44', '\uD801\uDC1D': '\uD801\uDC45', '\uD801\uDC1E': '\uD801\uDC46', '\uD801\uDC1F': '\uD801\uDC47', '\uD801\uDC20': '\uD801\uDC48', '\uD801\uDC21': '\uD801\uDC49', '\uD801\uDC22': '\uD801\uDC4A', '\uD801\uDC23': '\uD801\uDC4B', '\uD801\uDC24': '\uD801\uDC4C', '\uD801\uDC25': '\uD801\uDC4D', '\uD801\uDC26': '\uD801\uDC4E', '\uD801\uDC27': '\uD801\uDC4F', '\uD806\uDCA0': '\uD806\uDCC0', '\uD806\uDCA1': '\uD806\uDCC1', '\uD806\uDCA2': '\uD806\uDCC2', '\uD806\uDCA3': '\uD806\uDCC3', '\uD806\uDCA4': '\uD806\uDCC4', '\uD806\uDCA5': '\uD806\uDCC5', '\uD806\uDCA6': '\uD806\uDCC6', '\uD806\uDCA7': '\uD806\uDCC7', '\uD806\uDCA8': '\uD806\uDCC8', '\uD806\uDCA9': '\uD806\uDCC9', '\uD806\uDCAA': '\uD806\uDCCA', '\uD806\uDCAB': '\uD806\uDCCB', '\uD806\uDCAC': '\uD806\uDCCC', '\uD806\uDCAD': '\uD806\uDCCD', '\uD806\uDCAE': '\uD806\uDCCE', '\uD806\uDCAF': '\uD806\uDCCF', '\uD806\uDCB0': '\uD806\uDCD0', '\uD806\uDCB1': '\uD806\uDCD1', '\uD806\uDCB2': '\uD806\uDCD2', '\uD806\uDCB3': '\uD806\uDCD3', '\uD806\uDCB4': '\uD806\uDCD4', '\uD806\uDCB5': '\uD806\uDCD5', '\uD806\uDCB6': '\uD806\uDCD6', '\uD806\uDCB7': '\uD806\uDCD7', '\uD806\uDCB8': '\uD806\uDCD8', '\uD806\uDCB9': '\uD806\uDCD9', '\uD806\uDCBA': '\uD806\uDCDA', '\uD806\uDCBB': '\uD806\uDCDB', '\uD806\uDCBC': '\uD806\uDCDC', '\uD806\uDCBD': '\uD806\uDCDD', '\uD806\uDCBE': '\uD806\uDCDE', '\uD806\uDCBF': '\uD806\uDCDF', '\xDF': 'ss', '\u0130': 'i\u0307', '\u0149': '\u02BCn', '\u01F0': 'j\u030C', '\u0390': '\u03B9\u0308\u0301', '\u03B0': '\u03C5\u0308\u0301', '\u0587': '\u0565\u0582', '\u1E96': 'h\u0331', '\u1E97': 't\u0308', '\u1E98': 'w\u030A', '\u1E99': 'y\u030A', '\u1E9A': 'a\u02BE', '\u1E9E': 'ss', '\u1F50': '\u03C5\u0313', '\u1F52': '\u03C5\u0313\u0300', '\u1F54': '\u03C5\u0313\u0301', '\u1F56': '\u03C5\u0313\u0342', '\u1F80': '\u1F00\u03B9', '\u1F81': '\u1F01\u03B9', '\u1F82': '\u1F02\u03B9', '\u1F83': '\u1F03\u03B9', '\u1F84': '\u1F04\u03B9', '\u1F85': '\u1F05\u03B9', '\u1F86': '\u1F06\u03B9', '\u1F87': '\u1F07\u03B9', '\u1F88': '\u1F00\u03B9', '\u1F89': '\u1F01\u03B9', '\u1F8A': '\u1F02\u03B9', '\u1F8B': '\u1F03\u03B9', '\u1F8C': '\u1F04\u03B9', '\u1F8D': '\u1F05\u03B9', '\u1F8E': '\u1F06\u03B9', '\u1F8F': '\u1F07\u03B9', '\u1F90': '\u1F20\u03B9', '\u1F91': '\u1F21\u03B9', '\u1F92': '\u1F22\u03B9', '\u1F93': '\u1F23\u03B9', '\u1F94': '\u1F24\u03B9', '\u1F95': '\u1F25\u03B9', '\u1F96': '\u1F26\u03B9', '\u1F97': '\u1F27\u03B9', '\u1F98': '\u1F20\u03B9', '\u1F99': '\u1F21\u03B9', '\u1F9A': '\u1F22\u03B9', '\u1F9B': '\u1F23\u03B9', '\u1F9C': '\u1F24\u03B9', '\u1F9D': '\u1F25\u03B9', '\u1F9E': '\u1F26\u03B9', '\u1F9F': '\u1F27\u03B9', '\u1FA0': '\u1F60\u03B9', '\u1FA1': '\u1F61\u03B9', '\u1FA2': '\u1F62\u03B9', '\u1FA3': '\u1F63\u03B9', '\u1FA4': '\u1F64\u03B9', '\u1FA5': '\u1F65\u03B9', '\u1FA6': '\u1F66\u03B9', '\u1FA7': '\u1F67\u03B9', '\u1FA8': '\u1F60\u03B9', '\u1FA9': '\u1F61\u03B9', '\u1FAA': '\u1F62\u03B9', '\u1FAB': '\u1F63\u03B9', '\u1FAC': '\u1F64\u03B9', '\u1FAD': '\u1F65\u03B9', '\u1FAE': '\u1F66\u03B9', '\u1FAF': '\u1F67\u03B9', '\u1FB2': '\u1F70\u03B9', '\u1FB3': '\u03B1\u03B9', '\u1FB4': '\u03AC\u03B9', '\u1FB6': '\u03B1\u0342', '\u1FB7': '\u03B1\u0342\u03B9', '\u1FBC': '\u03B1\u03B9', '\u1FC2': '\u1F74\u03B9', '\u1FC3': '\u03B7\u03B9', '\u1FC4': '\u03AE\u03B9', '\u1FC6': '\u03B7\u0342', '\u1FC7': '\u03B7\u0342\u03B9', '\u1FCC': '\u03B7\u03B9', '\u1FD2': '\u03B9\u0308\u0300', '\u1FD3': '\u03B9\u0308\u0301', '\u1FD6': '\u03B9\u0342', '\u1FD7': '\u03B9\u0308\u0342', '\u1FE2': '\u03C5\u0308\u0300', '\u1FE3': '\u03C5\u0308\u0301', '\u1FE4': '\u03C1\u0313', '\u1FE6': '\u03C5\u0342', '\u1FE7': '\u03C5\u0308\u0342', '\u1FF2': '\u1F7C\u03B9', '\u1FF3': '\u03C9\u03B9', '\u1FF4': '\u03CE\u03B9', '\u1FF6': '\u03C9\u0342', '\u1FF7': '\u03C9\u0342\u03B9', '\u1FFC': '\u03C9\u03B9', '\uFB00': 'ff', '\uFB01': 'fi', '\uFB02': 'fl', '\uFB03': 'ffi', '\uFB04': 'ffl', '\uFB05': 'st', '\uFB06': 'st', '\uFB13': '\u0574\u0576', '\uFB14': '\u0574\u0565', '\uFB15': '\u0574\u056B', '\uFB16': '\u057E\u0576', '\uFB17': '\u0574\u056D' };

      // Normalize reference label: collapse internal whitespace
      // to single space, remove leading/trailing whitespace, case fold.
      module.exports = function (string) {
        return string.trim().replace(regex, function ($0) {
          // Note: there is no need to check `hasOwnProperty($0)` here.
          // If character not found in lookup table, it must be whitespace.
          return map[$0] || ' ';
        });
      };

    }, {}], 12: [function (require, module, exports) {
      "use strict";

      var escapeXml = require('./common').escapeXml;

      // Helper function to produce an XML tag.
      var tag = function (name, attrs, selfclosing) {
        var result = '<' + name;
        if (attrs && attrs.length > 0) {
          var i = 0;
          var attrib;
          while ((attrib = attrs[i]) !== undefined) {
            result += ' ' + attrib[0] + '="' + attrib[1] + '"';
            i++;
          }
        }
        if (selfclosing) {
          result += ' /';
        }

        result += '>';
        return result;
      };

      var reXMLTag = /\<[^>]*\>/;

      var toTagName = function (s) {
        return s.replace(/([a-z])([A-Z])/g, "$1_$2").toLowerCase();
      };

      var renderNodes = function (block) {

        var attrs;
        var tagname;
        var walker = block.walker();
        var event, node, entering;
        var buffer = "";
        var lastOut = "\n";
        var disableTags = 0;
        var indentLevel = 0;
        var indent = '  ';
        var unescapedContents;
        var container;
        var selfClosing;
        var nodetype;

        var out = function (s) {
          if (disableTags > 0) {
            buffer += s.replace(reXMLTag, '');
          } else {
            buffer += s;
          }
          lastOut = s;
        };
        var esc = this.escape;
        var cr = function () {
          if (lastOut !== '\n') {
            buffer += '\n';
            lastOut = '\n';
            for (var i = indentLevel; i--;) {
              buffer += indent;
            }
          }
        };

        var options = this.options;

        if (options.time) { console.time("rendering"); }

        buffer += '<?xml version="1.0" encoding="UTF-8"?>\n';
        buffer += '<!DOCTYPE CommonMark SYSTEM "CommonMark.dtd">\n';

        while ((event = walker.next())) {
          entering = event.entering;
          node = event.node;
          nodetype = node.type;

          container = node.isContainer;
          selfClosing = nodetype === 'HorizontalRule' || nodetype === 'Hardbreak' ||
              nodetype === 'Softbreak' || nodetype === 'Image';
          unescapedContents = nodetype === 'Html' || nodetype === 'HtmlInline';
          tagname = toTagName(nodetype);

          if (entering) {

            attrs = [];

            switch (nodetype) {
              case 'List':
                if (node.listType !== null) {
                  attrs.push(['type', node.listType.toLowerCase()]);
                }
                if (node.listStart !== null) {
                  attrs.push(['start', String(node.listStart)]);
                }
                if (node.listTight !== null) {
                  attrs.push(['tight', (node.listTight ? 'true' : 'false')]);
                }
                var delim = node.listDelimiter;
                if (delim !== null) {
                  var delimword = '';
                  if (delim === '.') {
                    delimword = 'period';
                  } else {
                    delimword = 'paren';
                  }
                  attrs.push(['delimiter', delimword]);
                }
                break;
              case 'CodeBlock':
                if (node.info) {
                  attrs.push(['info', node.info]);
                }
                break;
              case 'Header':
                attrs.push(['level', String(node.level)]);
                break;
              case 'Link':
              case 'Image':
                attrs.push(['destination', node.destination]);
                attrs.push(['title', node.title]);
                break;
              default:
                break;
            }
            if (options.sourcepos) {
              var pos = node.sourcepos;
              if (pos) {
                attrs.push(['sourcepos', String(pos[0][0]) + ':' +
                            String(pos[0][1]) + '-' + String(pos[1][0]) + ':' +
                            String(pos[1][1])]);
              }
            }

            cr();
            out(tag(tagname, attrs, selfClosing));
            if (container) {
              indentLevel += 1;
            } else if (!container && !selfClosing) {
              var lit = node.literal;
              if (lit) {
                out(unescapedContents ? lit : esc(lit));
              }
              out(tag('/' + tagname));
            }
          } else {
            indentLevel -= 1;
            cr();
            out(tag('/' + tagname));
          }


        }
        if (options.time) { console.timeEnd("rendering"); }
        buffer += '\n';
        return buffer;
      };

      // The XmlRenderer object.
      function XmlRenderer(options) {
        return {
          // default options:
          softbreak: '\n', // by default, soft breaks are rendered as newlines in HTML
          // set to "<br />" to make them hard breaks
          // set to " " if you want to ignore line wrapping in source
          escape: escapeXml,
          options: options || {},
          render: renderNodes
        };
      }

      module.exports = XmlRenderer;

    }, { "./common": 2 }]
  }, {}, [8])(8)
});
var textRange;
(function (textRange) {
    function getRange(self) {
        var jq;
        return _textrange[browserType(self)].get(self);
    }
    textRange.getRange = getRange;
    /**
     * $().textrange('set')
     *
     * Sets the selected text of an object by specifying the start and length of the selection.
     *
     * The start and length parameters are identical to PHP's substr() function with the following changes:
     *  - excluding start will select all the text in the field.
     *  - passing 0 for length will set the cursor at start. See $().textrange('setcursor')
     *
     * @param (optional) start
     * @param (optional) length
     *
     * @see http://php.net/manual/en/function.substr.php
     */
    function setRange(self, s, l) {
        var e;
        if (typeof s === 'undefined') {
            s = 0;
        }
        else if (s < 0) {
            s = self.val().length + s;
        }
        if (typeof l === 'undefined') {
            e = self.val().length;
        }
        else if (length >= 0) {
            e = s + l;
        }
        else {
            e = self.val().length + l;
        }
        _textrange[browserType(self)].set(self, s, e);
        return self;
    }
    textRange.setRange = setRange;
    /*
     * $().textrange('setcursor')
    *
     * Sets the cursor at a position of the text field.
     *
     * @param position
    */
    function setcursor(self, position) {
        return setRange(self, position, 0);
    }
    textRange.setcursor = setcursor;
    /*
     * $().textrange('replace')
    * Replaces the selected text in the input field or textarea with text.
     *
     * @param text The text to replace the selection with.
     */
    function replace(self, text) {
        _textrange[browserType(self)].replace(self, text);
        return self;
    }
    textRange.replace = replace;
    /*
     * Alias for $().textrange('replace')
      */
    function insert(self, text) {
        return replace(self, text);
    }
    textRange.insert = insert;
    function browserType(self) {
        return 'selectionStart' in self[0] ? 'xul' : document.selection ? 'msie' : 'unknown';
    }
    var _textrange = {
        xul: {
            get: function (self, property) {
                var ta = (self[0]);
                var props = {
                    position: ta.selectionStart,
                    start: ta.selectionStart,
                    end: ta.selectionEnd,
                    length: ta.selectionEnd - ta.selectionStart,
                    text: self.val().substring(ta.selectionStart, ta.selectionEnd)
                };
                return typeof property === 'undefined' ? props : props[property];
            },
            set: function (self, start, end) {
                var ta = (self[0]);
                ta.selectionStart = start;
                ta.selectionEnd = end;
            },
            replace: function (self, text) {
                var ta = (self[0]);
                var val = self.val();
                var start = ta.selectionStart;
                self.val(val.substring(0, ta.selectionStart) + text + val.substring(ta.selectionEnd, val.length));
                ta.selectionStart = start;
                ta.selectionEnd = start + text.length;
            }
        },
        msie: {
            get: function (self, property) {
                var range = document.selection.createRange();
                if (typeof range === 'undefined') {
                    return {
                        position: 0,
                        start: 0,
                        end: self.val().length,
                        length: self.val().length,
                        text: self.val()
                    };
                }
                var rangetext = self[0].createTextRange();
                var rangetextcopy = rangetext.duplicate();
                rangetext.moveToBookmark(range.getBookmark());
                rangetextcopy.setEndPoint('EndToStart', rangetext);
                var props = {
                    position: rangetextcopy.text.length,
                    start: rangetextcopy.text.length,
                    end: rangetextcopy.text.length + range.text.length,
                    length: range.text.length,
                    text: range.text
                };
                return typeof property === 'undefined' ? props : props[property];
            },
            set: function (self, start, end) {
                var range = self[0].createTextRange();
                if (typeof range === 'undefined') {
                    return self;
                }
                if (typeof start !== 'undefined') {
                    range.moveStart('character', start);
                    range.collapse();
                }
                if (typeof end !== 'undefined') {
                    range.moveEnd('character', end - start);
                }
                range.select();
            },
            replace: function (self, text) {
                document.selection.createRange().text = text;
            }
        }
    };
})(textRange || (textRange = {}));

var metaJS;
(function (metaJS) {
    (function (xsdPropType) {
        xsdPropType[xsdPropType["Number"] = 0] = "Number";
        xsdPropType[xsdPropType["String"] = 1] = "String";
        xsdPropType[xsdPropType["Enum"] = 2] = "Enum";
        xsdPropType[xsdPropType["Bool"] = 3] = "Bool";
        xsdPropType[xsdPropType["Class"] = 4] = "Class";
    })(metaJS.xsdPropType || (metaJS.xsdPropType = {}));
    var xsdPropType = metaJS.xsdPropType;
    (function (xsdPropModifier) {
        xsdPropModifier[xsdPropModifier["no"] = 0] = "no";
        xsdPropModifier[xsdPropModifier["Array"] = 1] = "Array";
        xsdPropModifier[xsdPropModifier["ArrayArray"] = 2] = "ArrayArray";
        xsdPropModifier[xsdPropModifier["Dict"] = 3] = "Dict";
    })(metaJS.xsdPropModifier || (metaJS.xsdPropModifier = {}));
    var xsdPropModifier = metaJS.xsdPropModifier;
    (function (xsdInheritsFrom) {
        xsdInheritsFrom[xsdInheritsFrom["tag"] = 0] = "tag";
        xsdInheritsFrom[xsdInheritsFrom["eval"] = 1] = "eval";
        xsdInheritsFrom[xsdInheritsFrom["media"] = 2] = "media";
    })(metaJS.xsdInheritsFrom || (metaJS.xsdInheritsFrom = {}));
    var xsdInheritsFrom = metaJS.xsdInheritsFrom;
    (function (xsdPropConstrains) {
        xsdPropConstrains[xsdPropConstrains["no"] = 0] = "no";
        xsdPropConstrains[xsdPropConstrains["regex"] = 1] = "regex";
        xsdPropConstrains[xsdPropConstrains["id"] = 2] = "id";
        xsdPropConstrains[xsdPropConstrains["idref"] = 3] = "idref";
        xsdPropConstrains[xsdPropConstrains["intNumber"] = 4] = "intNumber";
        xsdPropConstrains[xsdPropConstrains["ncname"] = 5] = "ncname";
    })(metaJS.xsdPropConstrains || (metaJS.xsdPropConstrains = {}));
    var xsdPropConstrains = metaJS.xsdPropConstrains;
    metaJS.metaData = {
        "types": {
            "tag": {
                "ancestor": null,
                "inheritsFrom": 0,
                "required": false,
                "name": "tag",
                "summary": "tag",
                "descr": "tag descr",
                "flag": 384,
                "_newName": null
            },
            "eval-control": {
                "ancestor": "tag",
                "inheritsFrom": 0,
                "required": false,
                "name": "eval-control",
                "summary": null,
                "descr": null,
                "flag": 384,
                "_newName": null
            },
            "html-tag": {
                "ancestor": "tag",
                "inheritsFrom": 0,
                "required": false,
                "name": "html-tag",
                "summary": null,
                "descr": null,
                "flag": 384,
                "_newName": null
            },
            "script": {
                "ancestor": "tag",
                "inheritsFrom": 0,
                "required": false,
                "name": "script",
                "summary": null,
                "descr": null,
                "flag": 386,
                "_newName": null
            },
            "img": {
                "ancestor": "tag",
                "inheritsFrom": 0,
                "required": false,
                "name": "img",
                "summary": null,
                "descr": null,
                "flag": 384,
                "_newName": null
            },
            "text": {
                "ancestor": "tag",
                "inheritsFrom": 0,
                "required": false,
                "name": "text",
                "summary": null,
                "descr": null,
                "flag": 384,
                "_newName": null
            },
            "body": {
                "ancestor": "tag",
                "inheritsFrom": 0,
                "required": false,
                "name": "body",
                "summary": null,
                "descr": null,
                "flag": 131333,
                "_newName": null
            },
            "header-prop": {
                "ancestor": "tag",
                "inheritsFrom": 0,
                "required": false,
                "name": "header-prop",
                "summary": null,
                "descr": null,
                "flag": 36992,
                "_newName": null
            },
            "macro": {
                "ancestor": "tag",
                "inheritsFrom": 0,
                "required": false,
                "name": "macro",
                "summary": null,
                "descr": null,
                "flag": 384,
                "_newName": null
            },
            "human-eval": {
                "ancestor": "eval-control",
                "inheritsFrom": 1,
                "required": false,
                "name": "human-eval",
                "summary": null,
                "descr": null,
                "flag": 384,
                "_newName": null
            },
            "tts-sound": {
                "ancestor": "media-tag",
                "inheritsFrom": 2,
                "required": false,
                "name": "tts-sound",
                "summary": null,
                "descr": null,
                "flag": 133,
                "_newName": null
            },
            "eval-button": {
                "ancestor": "eval-control",
                "inheritsFrom": 1,
                "required": false,
                "name": "eval-button",
                "summary": null,
                "descr": "@summary tlacitko pro vyhodnoceni jedne skupiny vyhodnotitelnych elementu.\n            @descr ??",
                "flag": 5,
                "_newName": "eval-btn"
            },
            "drop-down": {
                "ancestor": "edit",
                "inheritsFrom": 1,
                "required": false,
                "name": "drop-down",
                "summary": null,
                "descr": null,
                "flag": 5,
                "_newName": null
            },
            "edit": {
                "ancestor": "eval-control",
                "inheritsFrom": 1,
                "required": false,
                "name": "edit",
                "summary": null,
                "descr": null,
                "flag": 384,
                "_newName": null
            },
            "gap-fill": {
                "ancestor": "edit",
                "inheritsFrom": 1,
                "required": false,
                "name": "gap-fill",
                "summary": null,
                "descr": null,
                "flag": 5,
                "_newName": null
            },
            "radio-button": {
                "ancestor": "eval-control",
                "inheritsFrom": 1,
                "required": false,
                "name": "radio-button",
                "summary": null,
                "descr": null,
                "flag": 4101,
                "_newName": null
            },
            "check-low": {
                "ancestor": "eval-control",
                "inheritsFrom": 1,
                "required": false,
                "name": "check-low",
                "summary": null,
                "descr": null,
                "flag": 0,
                "_newName": null
            },
            "check-item": {
                "ancestor": "check-low",
                "inheritsFrom": 1,
                "required": false,
                "name": "check-item",
                "summary": null,
                "descr": null,
                "flag": 4101,
                "_newName": null
            },
            "check-box": {
                "ancestor": "check-low",
                "inheritsFrom": 1,
                "required": false,
                "name": "check-box",
                "summary": null,
                "descr": null,
                "flag": 5,
                "_newName": null
            },
            "pairing-item": {
                "ancestor": "tag",
                "inheritsFrom": 0,
                "required": false,
                "name": "pairing-item",
                "summary": null,
                "descr": null,
                "flag": 4101,
                "_newName": null
            },
            "pairing": {
                "ancestor": "eval-control",
                "inheritsFrom": 1,
                "required": false,
                "name": "pairing",
                "summary": null,
                "descr": null,
                "flag": 5,
                "_newName": null
            },
            "single-choice": {
                "ancestor": "tag",
                "inheritsFrom": 0,
                "required": false,
                "name": "single-choice",
                "summary": null,
                "descr": null,
                "flag": 4,
                "_newName": null
            },
            "word-selection": {
                "ancestor": "eval-control",
                "inheritsFrom": 1,
                "required": false,
                "name": "word-selection",
                "summary": null,
                "descr": null,
                "flag": 5,
                "_newName": null
            },
            "word-multi-selection": {
                "ancestor": "eval-control",
                "inheritsFrom": 1,
                "required": false,
                "name": "word-multi-selection",
                "summary": null,
                "descr": null,
                "flag": 5,
                "_newName": null
            },
            "word-ordering": {
                "ancestor": "eval-control",
                "inheritsFrom": 1,
                "required": false,
                "name": "word-ordering",
                "summary": null,
                "descr": null,
                "flag": 5,
                "_newName": null
            },
            "sentence-ordering": {
                "ancestor": "eval-control",
                "inheritsFrom": 1,
                "required": false,
                "name": "sentence-ordering",
                "summary": null,
                "descr": null,
                "flag": 5,
                "_newName": null
            },
            "sentence-ordering-item": {
                "ancestor": "tag",
                "inheritsFrom": 0,
                "required": false,
                "name": "sentence-ordering-item",
                "summary": null,
                "descr": null,
                "flag": 4101,
                "_newName": "sentence"
            },
            "extension": {
                "ancestor": "eval-control",
                "inheritsFrom": 1,
                "required": false,
                "name": "extension",
                "summary": null,
                "descr": null,
                "flag": 135,
                "_newName": null
            },
            "writing": {
                "ancestor": "human-eval",
                "inheritsFrom": 1,
                "required": false,
                "name": "writing",
                "summary": null,
                "descr": null,
                "flag": 4101,
                "_newName": null
            },
            "recording": {
                "ancestor": "human-eval",
                "inheritsFrom": 1,
                "required": false,
                "name": "recording",
                "summary": null,
                "descr": null,
                "flag": 4101,
                "_newName": "audio-capture"
            },
            "list": {
                "ancestor": "macro",
                "inheritsFrom": 0,
                "required": false,
                "name": "list",
                "summary": null,
                "descr": null,
                "flag": 4,
                "_newName": null
            },
            "list-group": {
                "ancestor": "macro",
                "inheritsFrom": 0,
                "required": false,
                "name": "list-group",
                "summary": null,
                "descr": null,
                "flag": 12293,
                "_newName": null
            },
            "two-column": {
                "ancestor": "macro",
                "inheritsFrom": 0,
                "required": false,
                "name": "two-column",
                "summary": null,
                "descr": null,
                "flag": 4101,
                "_newName": null
            },
            "panel": {
                "ancestor": "macro",
                "inheritsFrom": 0,
                "required": false,
                "name": "panel",
                "summary": null,
                "descr": null,
                "flag": 131077,
                "_newName": null
            },
            "node": {
                "ancestor": "tag",
                "inheritsFrom": 0,
                "required": false,
                "name": "node",
                "summary": null,
                "descr": null,
                "flag": 4228,
                "_newName": null
            },
            "offering": {
                "ancestor": "tag",
                "inheritsFrom": 0,
                "required": false,
                "name": "offering",
                "summary": null,
                "descr": null,
                "flag": 5,
                "_newName": null
            },
            "url-tag": {
                "ancestor": "tag",
                "inheritsFrom": 0,
                "required": false,
                "name": "url-tag",
                "summary": null,
                "descr": null,
                "flag": 0,
                "_newName": null
            },
            "media-tag": {
                "ancestor": "url-tag",
                "inheritsFrom": 0,
                "required": false,
                "name": "media-tag",
                "summary": null,
                "descr": null,
                "flag": 384,
                "_newName": null
            },
            "media-big-mark": {
                "ancestor": "media-tag",
                "inheritsFrom": 2,
                "required": false,
                "name": "media-big-mark",
                "summary": null,
                "descr": null,
                "flag": 5,
                "_newName": null
            },
            "media-player": {
                "ancestor": "media-tag",
                "inheritsFrom": 2,
                "required": false,
                "name": "media-player",
                "summary": null,
                "descr": null,
                "flag": 5,
                "_newName": null
            },
            "media-video": {
                "ancestor": "media-tag",
                "inheritsFrom": 2,
                "required": false,
                "name": "media-video",
                "summary": null,
                "descr": null,
                "flag": 5,
                "_newName": null
            },
            "media-text": {
                "ancestor": "media-tag",
                "inheritsFrom": 2,
                "required": false,
                "name": "media-text",
                "summary": null,
                "descr": null,
                "flag": 5,
                "_newName": null
            },
            "_media-replica": {
                "ancestor": "tag",
                "inheritsFrom": 0,
                "required": false,
                "name": "_media-replica",
                "summary": null,
                "descr": null,
                "flag": 389,
                "_newName": null
            },
            "_media-sent": {
                "ancestor": "tag",
                "inheritsFrom": 0,
                "required": false,
                "name": "_media-sent",
                "summary": null,
                "descr": null,
                "flag": 131461,
                "_newName": null
            },
            "_snd-page": {
                "ancestor": "tag",
                "inheritsFrom": 0,
                "required": false,
                "name": "_snd-page",
                "summary": null,
                "descr": null,
                "flag": 385,
                "_newName": null
            },
            "_snd-file-group": {
                "ancestor": "url-tag",
                "inheritsFrom": 0,
                "required": false,
                "name": "_snd-file-group",
                "summary": null,
                "descr": null,
                "flag": 385,
                "_newName": null
            },
            "_snd-group": {
                "ancestor": "tag",
                "inheritsFrom": 0,
                "required": false,
                "name": "_snd-group",
                "summary": null,
                "descr": null,
                "flag": 385,
                "_newName": null
            },
            "_snd-interval": {
                "ancestor": "tag",
                "inheritsFrom": 0,
                "required": false,
                "name": "_snd-interval",
                "summary": null,
                "descr": null,
                "flag": 384,
                "_newName": null
            },
            "_snd-sent": {
                "ancestor": "tag",
                "inheritsFrom": 0,
                "required": false,
                "name": "_snd-sent",
                "summary": null,
                "descr": null,
                "flag": 384,
                "_newName": null
            },
            "_snd-file": {
                "ancestor": "url-tag",
                "inheritsFrom": 0,
                "required": false,
                "name": "_snd-file",
                "summary": null,
                "descr": null,
                "flag": 384,
                "_newName": null
            },
            "cut-dialog": {
                "ancestor": "_snd-file",
                "inheritsFrom": 0,
                "required": false,
                "name": "cut-dialog",
                "summary": null,
                "descr": null,
                "flag": 98308,
                "_newName": null
            },
            "cut-text": {
                "ancestor": "_snd-file",
                "inheritsFrom": 0,
                "required": false,
                "name": "cut-text",
                "summary": null,
                "descr": null,
                "flag": 98308,
                "_newName": null
            },
            "phrase": {
                "ancestor": "tag",
                "inheritsFrom": 0,
                "required": false,
                "name": "phrase",
                "summary": null,
                "descr": null,
                "flag": 102405,
                "_newName": "sent"
            },
            "replica": {
                "ancestor": "tag",
                "inheritsFrom": 0,
                "required": false,
                "name": "replica",
                "summary": null,
                "descr": null,
                "flag": 98309,
                "_newName": null
            },
            "include": {
                "ancestor": "tag",
                "inheritsFrom": 0,
                "required": false,
                "name": "include",
                "summary": null,
                "descr": null,
                "flag": 384,
                "_newName": null
            },
            "include-text": {
                "ancestor": "include",
                "inheritsFrom": 0,
                "required": false,
                "name": "include-text",
                "summary": null,
                "descr": null,
                "flag": 98304,
                "_newName": null
            },
            "include-dialog": {
                "ancestor": "include",
                "inheritsFrom": 0,
                "required": false,
                "name": "include-dialog",
                "summary": null,
                "descr": null,
                "flag": 98304,
                "_newName": null
            },
            "phrase-replace": {
                "ancestor": "tag",
                "inheritsFrom": 0,
                "required": false,
                "name": "phrase-replace",
                "summary": null,
                "descr": null,
                "flag": 102400,
                "_newName": "sent-replace"
            },
            "_eval-page": {
                "ancestor": "tag",
                "inheritsFrom": 0,
                "required": false,
                "name": "_eval-page",
                "summary": null,
                "descr": null,
                "flag": 384,
                "_newName": null
            },
            "_eval-btn": {
                "ancestor": "tag",
                "inheritsFrom": 0,
                "required": false,
                "name": "_eval-btn",
                "summary": null,
                "descr": null,
                "flag": 384,
                "_newName": null
            },
            "_eval-group": {
                "ancestor": "tag",
                "inheritsFrom": 0,
                "required": false,
                "name": "_eval-group",
                "summary": null,
                "descr": null,
                "flag": 384,
                "_newName": null
            },
            "macro-template": {
                "ancestor": "macro",
                "inheritsFrom": 0,
                "required": false,
                "name": "macro-template",
                "summary": null,
                "descr": null,
                "flag": 384,
                "_newName": null
            },
            "macro-true-false": {
                "ancestor": "macro-template",
                "inheritsFrom": 0,
                "required": false,
                "name": "macro-true-false",
                "summary": null,
                "descr": null,
                "flag": 6,
                "_newName": null
            },
            "macro-single-choices": {
                "ancestor": "macro-template",
                "inheritsFrom": 0,
                "required": false,
                "name": "macro-single-choices",
                "summary": null,
                "descr": null,
                "flag": 6,
                "_newName": null
            },
            "macro-pairing": {
                "ancestor": "macro-template",
                "inheritsFrom": 0,
                "required": false,
                "name": "macro-pairing",
                "summary": null,
                "descr": null,
                "flag": 6,
                "_newName": null
            },
            "macro-table": {
                "ancestor": "macro-template",
                "inheritsFrom": 0,
                "required": false,
                "name": "macro-table",
                "summary": null,
                "descr": null,
                "flag": 6,
                "_newName": null
            },
            "macro-list-word-ordering": {
                "ancestor": "macro-template",
                "inheritsFrom": 0,
                "required": false,
                "name": "macro-list-word-ordering",
                "summary": null,
                "descr": null,
                "flag": 6,
                "_newName": null
            },
            "macro-list": {
                "ancestor": "macro-template",
                "inheritsFrom": 0,
                "required": false,
                "name": "macro-list",
                "summary": null,
                "descr": null,
                "flag": 6,
                "_newName": null
            },
            "macro-icon-list": {
                "ancestor": "macro-template",
                "inheritsFrom": 0,
                "required": false,
                "name": "macro-icon-list",
                "summary": null,
                "descr": null,
                "flag": 6,
                "_newName": null
            },
            "macro-article": {
                "ancestor": "macro-template",
                "inheritsFrom": 0,
                "required": false,
                "name": "macro-article",
                "summary": null,
                "descr": null,
                "flag": 6,
                "_newName": null
            },
            "macro-vocabulary": {
                "ancestor": "macro-template",
                "inheritsFrom": 0,
                "required": false,
                "name": "macro-vocabulary",
                "summary": null,
                "descr": null,
                "flag": 6,
                "_newName": null
            },
            "macro-video": {
                "ancestor": "macro-template",
                "inheritsFrom": 0,
                "required": false,
                "name": "macro-video",
                "summary": null,
                "descr": null,
                "flag": 6,
                "_newName": null
            },
            "inline-tag": {
                "ancestor": "macro-template",
                "inheritsFrom": 0,
                "required": false,
                "name": "inline-tag",
                "summary": null,
                "descr": null,
                "flag": 16388,
                "_newName": null
            },
            "smart-tag": {
                "ancestor": "tag",
                "inheritsFrom": 0,
                "required": false,
                "name": "smart-tag",
                "summary": null,
                "descr": null,
                "flag": 2180,
                "_newName": null
            },
            "smart-element-low": {
                "ancestor": "macro-template",
                "inheritsFrom": 0,
                "required": false,
                "name": "smart-element-low",
                "summary": null,
                "descr": null,
                "flag": 0,
                "_newName": null
            },
            "smart-element": {
                "ancestor": "smart-element-low",
                "inheritsFrom": 0,
                "required": false,
                "name": "smart-element",
                "summary": null,
                "descr": null,
                "flag": 6,
                "_newName": null
            },
            "smart-offering": {
                "ancestor": "smart-element-low",
                "inheritsFrom": 0,
                "required": false,
                "name": "smart-offering",
                "summary": null,
                "descr": null,
                "flag": 6,
                "_newName": null
            },
            "smart-pairing": {
                "ancestor": "smart-element-low",
                "inheritsFrom": 0,
                "required": false,
                "name": "smart-pairing",
                "summary": null,
                "descr": null,
                "flag": 6,
                "_newName": null
            },
            "doc-tags-meta": {
                "ancestor": "tag",
                "inheritsFrom": 0,
                "required": false,
                "name": "doc-tags-meta",
                "summary": null,
                "descr": null,
                "flag": 384,
                "_newName": null
            },
            "doc-named": {
                "ancestor": "tag",
                "inheritsFrom": 0,
                "required": false,
                "name": "doc-named",
                "summary": null,
                "descr": null,
                "flag": 384,
                "_newName": null
            },
            "doc-type": {
                "ancestor": "doc-named",
                "inheritsFrom": 0,
                "required": false,
                "name": "doc-type",
                "summary": null,
                "descr": null,
                "flag": 386,
                "_newName": null
            },
            "doc-enum": {
                "ancestor": "doc-named",
                "inheritsFrom": 0,
                "required": false,
                "name": "doc-enum",
                "summary": null,
                "descr": null,
                "flag": 386,
                "_newName": null
            },
            "doc-enum-item": {
                "ancestor": "doc-named",
                "inheritsFrom": 0,
                "required": false,
                "name": "doc-enum-item",
                "summary": null,
                "descr": null,
                "flag": 386,
                "_newName": null
            },
            "doc-prop": {
                "ancestor": "doc-named",
                "inheritsFrom": 0,
                "required": false,
                "name": "doc-prop",
                "summary": null,
                "descr": null,
                "flag": 386,
                "_newName": null
            },
            "doc-descr": {
                "ancestor": "tag",
                "inheritsFrom": 0,
                "required": false,
                "name": "doc-descr",
                "summary": null,
                "descr": null,
                "flag": 36992,
                "_newName": null
            },
            "doc-example": {
                "ancestor": "tag",
                "inheritsFrom": 0,
                "required": false,
                "name": "doc-example",
                "summary": null,
                "descr": null,
                "flag": 133,
                "_newName": null
            }
        },
        "properties": [
            {
                "propOf": "tag",
                "type": 1,
                "modifier": 0,
                "clsEnumName": null,
                "constrains": 2,
                "regexConstrains": null,
                "name": "id",
                "summary": null,
                "descr": "@summary jednoznacna identifikace elementu\n            @descr ??",
                "flag": 524288,
                "_newName": null
            },
            {
                "propOf": "tag",
                "type": 1,
                "modifier": 0,
                "clsEnumName": null,
                "constrains": 0,
                "regexConstrains": null,
                "name": "srcpos",
                "summary": null,
                "descr": null,
                "flag": 384,
                "_newName": null
            },
            {
                "propOf": "tag",
                "type": 4,
                "modifier": 1,
                "clsEnumName": "tag",
                "constrains": 0,
                "regexConstrains": null,
                "name": "items",
                "summary": null,
                "descr": null,
                "flag": 128,
                "_newName": null
            },
            {
                "propOf": "tag",
                "type": 1,
                "modifier": 1,
                "clsEnumName": null,
                "constrains": 0,
                "regexConstrains": null,
                "name": "class",
                "summary": null,
                "descr": "@summary seznam CSS classes\n            @descr ??",
                "flag": 160,
                "_newName": null
            },
            {
                "propOf": "eval-control",
                "type": 1,
                "modifier": 0,
                "clsEnumName": null,
                "constrains": 1,
                "regexConstrains": "^((and)-\\w+-(exchangeable)|(and)-\\w+|\\w+-(exchangeable))$",
                "name": "eval-group",
                "summary": null,
                "descr": "@summary and-[id] nebo [id]-exchangeable nebo and-[id]-exchangeable.\n            Pro radioButton pouze [id]\n             @descr ??",
                "flag": 524288,
                "_newName": null
            },
            {
                "propOf": "eval-control",
                "type": 0,
                "modifier": 0,
                "clsEnumName": null,
                "constrains": 0,
                "regexConstrains": null,
                "name": "score-weight",
                "summary": null,
                "descr": null,
                "flag": 524288,
                "_newName": null
            },
            {
                "propOf": "eval-control",
                "type": 1,
                "modifier": 0,
                "clsEnumName": null,
                "constrains": 3,
                "regexConstrains": null,
                "name": "eval-button-id",
                "summary": null,
                "descr": null,
                "flag": 524288,
                "_newName": "eval-btn-id"
            },
            {
                "propOf": "html-tag",
                "type": 1,
                "modifier": 0,
                "clsEnumName": null,
                "constrains": 0,
                "regexConstrains": null,
                "name": "tag-name",
                "summary": null,
                "descr": null,
                "flag": 0,
                "_newName": null
            },
            {
                "propOf": "html-tag",
                "type": 4,
                "modifier": 1,
                "clsEnumName": "attr",
                "constrains": 0,
                "regexConstrains": null,
                "name": "attrs",
                "summary": null,
                "descr": null,
                "flag": 384,
                "_newName": null
            },
            {
                "propOf": "script",
                "type": 1,
                "modifier": 0,
                "clsEnumName": null,
                "constrains": 0,
                "regexConstrains": null,
                "name": "cdata",
                "summary": null,
                "descr": null,
                "flag": 0,
                "_newName": null
            },
            {
                "propOf": "img",
                "type": 1,
                "modifier": 0,
                "clsEnumName": null,
                "constrains": 0,
                "regexConstrains": null,
                "name": "src",
                "summary": null,
                "descr": null,
                "flag": 0,
                "_newName": null
            },
            {
                "propOf": "text",
                "type": 1,
                "modifier": 0,
                "clsEnumName": null,
                "constrains": 0,
                "regexConstrains": null,
                "name": "title",
                "summary": null,
                "descr": null,
                "flag": 0,
                "_newName": null
            },
            {
                "propOf": "body",
                "type": 4,
                "modifier": 0,
                "clsEnumName": "_snd-page",
                "constrains": 0,
                "regexConstrains": null,
                "name": "snd-page",
                "summary": null,
                "descr": null,
                "flag": 128,
                "_newName": null
            },
            {
                "propOf": "body",
                "type": 4,
                "modifier": 0,
                "clsEnumName": "_eval-page",
                "constrains": 0,
                "regexConstrains": null,
                "name": "eval-page",
                "summary": null,
                "descr": null,
                "flag": 128,
                "_newName": null
            },
            {
                "propOf": "body",
                "type": 1,
                "modifier": 0,
                "clsEnumName": null,
                "constrains": 0,
                "regexConstrains": null,
                "name": "url",
                "summary": null,
                "descr": null,
                "flag": 384,
                "_newName": null
            },
            {
                "propOf": "body",
                "type": 0,
                "modifier": 0,
                "clsEnumName": null,
                "constrains": 0,
                "regexConstrains": null,
                "name": "order",
                "summary": null,
                "descr": null,
                "flag": 0,
                "_newName": null
            },
            {
                "propOf": "body",
                "type": 1,
                "modifier": 0,
                "clsEnumName": null,
                "constrains": 0,
                "regexConstrains": null,
                "name": "instr-title",
                "summary": null,
                "descr": null,
                "flag": 0,
                "_newName": null
            },
            {
                "propOf": "body",
                "type": 1,
                "modifier": 0,
                "clsEnumName": null,
                "constrains": 0,
                "regexConstrains": null,
                "name": "externals",
                "summary": null,
                "descr": null,
                "flag": 128,
                "_newName": null
            },
            {
                "propOf": "body",
                "type": 1,
                "modifier": 0,
                "clsEnumName": null,
                "constrains": 0,
                "regexConstrains": null,
                "name": "see-also-links",
                "summary": null,
                "descr": null,
                "flag": 0,
                "_newName": "course-see-also-str"
            },
            {
                "propOf": "body",
                "type": 3,
                "modifier": 0,
                "clsEnumName": null,
                "constrains": 0,
                "regexConstrains": null,
                "name": "old-ea-is-passive",
                "summary": null,
                "descr": null,
                "flag": 128,
                "_newName": null
            },
            {
                "propOf": "body",
                "type": 3,
                "modifier": 0,
                "clsEnumName": null,
                "constrains": 0,
                "regexConstrains": null,
                "name": "is-old-ea",
                "summary": null,
                "descr": null,
                "flag": 128,
                "_newName": null
            },
            {
                "propOf": "body",
                "type": 1,
                "modifier": 0,
                "clsEnumName": null,
                "constrains": 0,
                "regexConstrains": null,
                "name": "instr-body",
                "summary": null,
                "descr": null,
                "flag": 0,
                "_newName": "instrs-str"
            },
            {
                "propOf": "body",
                "type": 1,
                "modifier": 0,
                "clsEnumName": null,
                "constrains": 0,
                "regexConstrains": null,
                "name": "see-also-str",
                "summary": null,
                "descr": null,
                "flag": 128,
                "_newName": null
            },
            {
                "propOf": "tts-sound",
                "type": 1,
                "modifier": 0,
                "clsEnumName": null,
                "constrains": 0,
                "regexConstrains": null,
                "name": "text",
                "summary": null,
                "descr": null,
                "flag": 0,
                "_newName": null
            },
            {
                "propOf": "eval-button",
                "type": 3,
                "modifier": 0,
                "clsEnumName": null,
                "constrains": 0,
                "regexConstrains": null,
                "name": "score-as-ratio",
                "summary": null,
                "descr": null,
                "flag": 0,
                "_newName": "ratio-score"
            },
            {
                "propOf": "drop-down",
                "type": 3,
                "modifier": 0,
                "clsEnumName": null,
                "constrains": 0,
                "regexConstrains": null,
                "name": "gap-fill-like",
                "summary": null,
                "descr": null,
                "flag": 524672,
                "_newName": null
            },
            {
                "propOf": "edit",
                "type": 1,
                "modifier": 0,
                "clsEnumName": null,
                "constrains": 0,
                "regexConstrains": null,
                "name": "correct-value",
                "summary": "Spravana hodnota vyhodnotitelneho elementu.",
                "descr": null,
                "flag": 0,
                "_newName": null
            },
            {
                "propOf": "edit",
                "type": 1,
                "modifier": 0,
                "clsEnumName": null,
                "constrains": 5,
                "regexConstrains": null,
                "name": "width-group",
                "summary": "vsem elementum se stejnou hodnotou smartWidth se nastavi stejna sirka (rovna maximu z sirky techto elementu)",
                "descr": null,
                "flag": 524288,
                "_newName": "smart-width"
            },
            {
                "propOf": "edit",
                "type": 0,
                "modifier": 0,
                "clsEnumName": null,
                "constrains": 0,
                "regexConstrains": null,
                "name": "width",
                "summary": null,
                "descr": null,
                "flag": 524288,
                "_newName": null
            },
            {
                "propOf": "edit",
                "type": 1,
                "modifier": 0,
                "clsEnumName": null,
                "constrains": 3,
                "regexConstrains": null,
                "name": "offering-id",
                "summary": "id \"offering\" elementu, do ktereho se pridaji vsechny spravne hodnoty z correctValue.",
                "descr": "Pri nastaveni offeringId se zaroven na stejnou hodnotu nastavi i smartWidth (pokud smartWidth jiz neni nastavena na neco jineho)",
                "flag": 524288,
                "_newName": null
            },
            {
                "propOf": "edit",
                "type": 3,
                "modifier": 0,
                "clsEnumName": null,
                "constrains": 0,
                "regexConstrains": null,
                "name": "case-sensitive",
                "summary": null,
                "descr": null,
                "flag": 524288,
                "_newName": null
            },
            {
                "propOf": "gap-fill",
                "type": 1,
                "modifier": 0,
                "clsEnumName": null,
                "constrains": 0,
                "regexConstrains": null,
                "name": "hint",
                "summary": null,
                "descr": null,
                "flag": 524288,
                "_newName": "place-holder"
            },
            {
                "propOf": "gap-fill",
                "type": 1,
                "modifier": 0,
                "clsEnumName": null,
                "constrains": 0,
                "regexConstrains": null,
                "name": "init-value",
                "summary": null,
                "descr": null,
                "flag": 0,
                "_newName": null
            },
            {
                "propOf": "gap-fill",
                "type": 3,
                "modifier": 0,
                "clsEnumName": null,
                "constrains": 0,
                "regexConstrains": null,
                "name": "read-only",
                "summary": null,
                "descr": null,
                "flag": 524288,
                "_newName": null
            },
            {
                "propOf": "gap-fill",
                "type": 3,
                "modifier": 0,
                "clsEnumName": null,
                "constrains": 0,
                "regexConstrains": null,
                "name": "skip-evaluation",
                "summary": null,
                "descr": null,
                "flag": 524288,
                "_newName": null
            },
            {
                "propOf": "radio-button",
                "type": 3,
                "modifier": 0,
                "clsEnumName": null,
                "constrains": 0,
                "regexConstrains": null,
                "name": "correct-value",
                "summary": null,
                "descr": null,
                "flag": 0,
                "_newName": null
            },
            {
                "propOf": "radio-button",
                "type": 3,
                "modifier": 0,
                "clsEnumName": null,
                "constrains": 0,
                "regexConstrains": null,
                "name": "init-value",
                "summary": null,
                "descr": null,
                "flag": 0,
                "_newName": null
            },
            {
                "propOf": "radio-button",
                "type": 3,
                "modifier": 0,
                "clsEnumName": null,
                "constrains": 0,
                "regexConstrains": null,
                "name": "read-only",
                "summary": null,
                "descr": null,
                "flag": 0,
                "_newName": null
            },
            {
                "propOf": "radio-button",
                "type": 3,
                "modifier": 0,
                "clsEnumName": null,
                "constrains": 0,
                "regexConstrains": null,
                "name": "skip-evaluation",
                "summary": null,
                "descr": null,
                "flag": 0,
                "_newName": null
            },
            {
                "propOf": "check-low",
                "type": 3,
                "modifier": 0,
                "clsEnumName": null,
                "constrains": 0,
                "regexConstrains": null,
                "name": "correct-value",
                "summary": null,
                "descr": null,
                "flag": 0,
                "_newName": null
            },
            {
                "propOf": "check-low",
                "type": 2,
                "modifier": 0,
                "clsEnumName": "check-item-texts",
                "constrains": 0,
                "regexConstrains": null,
                "name": "text-type",
                "summary": null,
                "descr": null,
                "flag": 0,
                "_newName": "text-id"
            },
            {
                "propOf": "check-low",
                "type": 2,
                "modifier": 0,
                "clsEnumName": "three-state-bool",
                "constrains": 0,
                "regexConstrains": null,
                "name": "init-value",
                "summary": null,
                "descr": null,
                "flag": 0,
                "_newName": null
            },
            {
                "propOf": "check-low",
                "type": 3,
                "modifier": 0,
                "clsEnumName": null,
                "constrains": 0,
                "regexConstrains": null,
                "name": "read-only",
                "summary": null,
                "descr": null,
                "flag": 0,
                "_newName": null
            },
            {
                "propOf": "check-low",
                "type": 3,
                "modifier": 0,
                "clsEnumName": null,
                "constrains": 0,
                "regexConstrains": null,
                "name": "skip-evaluation",
                "summary": null,
                "descr": null,
                "flag": 0,
                "_newName": null
            },
            {
                "propOf": "pairing-item",
                "type": 1,
                "modifier": 0,
                "clsEnumName": null,
                "constrains": 0,
                "regexConstrains": null,
                "name": "right",
                "summary": null,
                "descr": null,
                "flag": 0,
                "_newName": null
            },
            {
                "propOf": "pairing",
                "type": 3,
                "modifier": 0,
                "clsEnumName": null,
                "constrains": 0,
                "regexConstrains": null,
                "name": "left-random",
                "summary": null,
                "descr": null,
                "flag": 0,
                "_newName": "random"
            },
            {
                "propOf": "pairing",
                "type": 2,
                "modifier": 0,
                "clsEnumName": "pairing-left-width",
                "constrains": 0,
                "regexConstrains": null,
                "name": "left-width",
                "summary": null,
                "descr": null,
                "flag": 0,
                "_newName": null
            },
            {
                "propOf": "single-choice",
                "type": 3,
                "modifier": 0,
                "clsEnumName": null,
                "constrains": 0,
                "regexConstrains": null,
                "name": "read-only",
                "summary": null,
                "descr": null,
                "flag": 0,
                "_newName": null
            },
            {
                "propOf": "single-choice",
                "type": 3,
                "modifier": 0,
                "clsEnumName": null,
                "constrains": 0,
                "regexConstrains": null,
                "name": "skip-evaluation",
                "summary": null,
                "descr": null,
                "flag": 0,
                "_newName": null
            },
            {
                "propOf": "single-choice",
                "type": 0,
                "modifier": 0,
                "clsEnumName": null,
                "constrains": 0,
                "regexConstrains": null,
                "name": "score-weight",
                "summary": null,
                "descr": null,
                "flag": 0,
                "_newName": null
            },
            {
                "propOf": "single-choice",
                "type": 1,
                "modifier": 0,
                "clsEnumName": null,
                "constrains": 3,
                "regexConstrains": null,
                "name": "eval-button-id",
                "summary": null,
                "descr": null,
                "flag": 0,
                "_newName": "eval-btn-id"
            },
            {
                "propOf": "word-selection",
                "type": 1,
                "modifier": 0,
                "clsEnumName": null,
                "constrains": 0,
                "regexConstrains": null,
                "name": "words",
                "summary": null,
                "descr": null,
                "flag": 0,
                "_newName": null
            },
            {
                "propOf": "word-multi-selection",
                "type": 1,
                "modifier": 0,
                "clsEnumName": null,
                "constrains": 0,
                "regexConstrains": null,
                "name": "words",
                "summary": null,
                "descr": null,
                "flag": 0,
                "_newName": null
            },
            {
                "propOf": "word-ordering",
                "type": 1,
                "modifier": 0,
                "clsEnumName": null,
                "constrains": 0,
                "regexConstrains": null,
                "name": "correct-order",
                "summary": null,
                "descr": null,
                "flag": 0,
                "_newName": "correct-value"
            },
            {
                "propOf": "extension",
                "type": 1,
                "modifier": 0,
                "clsEnumName": null,
                "constrains": 0,
                "regexConstrains": null,
                "name": "data",
                "summary": null,
                "descr": null,
                "flag": 0,
                "_newName": null
            },
            {
                "propOf": "extension",
                "type": 1,
                "modifier": 0,
                "clsEnumName": null,
                "constrains": 0,
                "regexConstrains": null,
                "name": "cdata",
                "summary": null,
                "descr": null,
                "flag": 0,
                "_newName": null
            },
            {
                "propOf": "writing",
                "type": 0,
                "modifier": 0,
                "clsEnumName": null,
                "constrains": 0,
                "regexConstrains": null,
                "name": "limit-recommend",
                "summary": null,
                "descr": null,
                "flag": 0,
                "_newName": "recommend-words-min"
            },
            {
                "propOf": "writing",
                "type": 0,
                "modifier": 0,
                "clsEnumName": null,
                "constrains": 0,
                "regexConstrains": null,
                "name": "limit-min",
                "summary": null,
                "descr": null,
                "flag": 0,
                "_newName": "words-min"
            },
            {
                "propOf": "writing",
                "type": 0,
                "modifier": 0,
                "clsEnumName": null,
                "constrains": 0,
                "regexConstrains": null,
                "name": "limit-max",
                "summary": null,
                "descr": null,
                "flag": 0,
                "_newName": "words-max"
            },
            {
                "propOf": "writing",
                "type": 0,
                "modifier": 0,
                "clsEnumName": null,
                "constrains": 0,
                "regexConstrains": null,
                "name": "number-of-rows",
                "summary": null,
                "descr": null,
                "flag": 0,
                "_newName": "init-rows"
            },
            {
                "propOf": "recording",
                "type": 0,
                "modifier": 0,
                "clsEnumName": null,
                "constrains": 0,
                "regexConstrains": null,
                "name": "limit-recommend",
                "summary": null,
                "descr": null,
                "flag": 0,
                "_newName": "recommend-seconds-from"
            },
            {
                "propOf": "recording",
                "type": 0,
                "modifier": 0,
                "clsEnumName": null,
                "constrains": 0,
                "regexConstrains": null,
                "name": "limit-min",
                "summary": null,
                "descr": null,
                "flag": 0,
                "_newName": "speak-seconds-from"
            },
            {
                "propOf": "recording",
                "type": 0,
                "modifier": 0,
                "clsEnumName": null,
                "constrains": 0,
                "regexConstrains": null,
                "name": "limit-max",
                "summary": null,
                "descr": null,
                "flag": 0,
                "_newName": "speak-seconds-to"
            },
            {
                "propOf": "recording",
                "type": 3,
                "modifier": 0,
                "clsEnumName": null,
                "constrains": 0,
                "regexConstrains": null,
                "name": "record-in-dialog",
                "summary": null,
                "descr": null,
                "flag": 0,
                "_newName": "stop-in-modal-dialog"
            },
            {
                "propOf": "recording",
                "type": 1,
                "modifier": 0,
                "clsEnumName": null,
                "constrains": 3,
                "regexConstrains": null,
                "name": "dialog-header-id",
                "summary": null,
                "descr": null,
                "flag": 0,
                "_newName": "modal-dialog-header"
            },
            {
                "propOf": "recording",
                "type": 2,
                "modifier": 0,
                "clsEnumName": "modal-size",
                "constrains": 0,
                "regexConstrains": null,
                "name": "dialog-size",
                "summary": null,
                "descr": null,
                "flag": 0,
                "_newName": "modal-dialog-size"
            },
            {
                "propOf": "recording",
                "type": 3,
                "modifier": 0,
                "clsEnumName": null,
                "constrains": 0,
                "regexConstrains": null,
                "name": "single-attempt",
                "summary": null,
                "descr": null,
                "flag": 0,
                "_newName": "disable-re-record"
            },
            {
                "propOf": "list",
                "type": 1,
                "modifier": 0,
                "clsEnumName": null,
                "constrains": 0,
                "regexConstrains": null,
                "name": "delim",
                "summary": null,
                "descr": null,
                "flag": 0,
                "_newName": null
            },
            {
                "propOf": "list",
                "type": 3,
                "modifier": 0,
                "clsEnumName": null,
                "constrains": 0,
                "regexConstrains": null,
                "name": "is-striped",
                "summary": null,
                "descr": null,
                "flag": 0,
                "_newName": null
            },
            {
                "propOf": "list",
                "type": 2,
                "modifier": 0,
                "clsEnumName": "list-icon",
                "constrains": 0,
                "regexConstrains": null,
                "name": "icon",
                "summary": null,
                "descr": null,
                "flag": 0,
                "_newName": null
            },
            {
                "propOf": "list",
                "type": 2,
                "modifier": 0,
                "clsEnumName": "colors",
                "constrains": 0,
                "regexConstrains": null,
                "name": "color",
                "summary": null,
                "descr": null,
                "flag": 0,
                "_newName": null
            },
            {
                "propOf": "list-group",
                "type": 3,
                "modifier": 0,
                "clsEnumName": null,
                "constrains": 0,
                "regexConstrains": null,
                "name": "is-striped",
                "summary": null,
                "descr": null,
                "flag": 0,
                "_newName": null
            },
            {
                "propOf": "panel",
                "type": 4,
                "modifier": 0,
                "clsEnumName": "header-prop",
                "constrains": 0,
                "regexConstrains": null,
                "name": "header",
                "summary": null,
                "descr": null,
                "flag": 128,
                "_newName": null
            },
            {
                "propOf": "offering",
                "type": 1,
                "modifier": 0,
                "clsEnumName": null,
                "constrains": 0,
                "regexConstrains": null,
                "name": "words",
                "summary": "",
                "descr": "seznam prvku nabidky, oddeleny \"|\"",
                "flag": 0,
                "_newName": null
            },
            {
                "propOf": "offering",
                "type": 2,
                "modifier": 0,
                "clsEnumName": "offering-drop-down-mode",
                "constrains": 0,
                "regexConstrains": null,
                "name": "mode",
                "summary": "",
                "descr": "pro \"drop-down\" tagy: drop-down-discard\" => kazdy prvek nabidky muze byt vybrana pouze jednim drop-down elementem.\n            drop-down-mode=\"keep\" => jeden prvek nabidky muze pouzit vice drop-down elementu",
                "flag": 524288,
                "_newName": "drop-down-mode"
            },
            {
                "propOf": "offering",
                "type": 3,
                "modifier": 0,
                "clsEnumName": null,
                "constrains": 0,
                "regexConstrains": null,
                "name": "hidden",
                "summary": "",
                "descr": "pro offering s drop-down : offering se nezobrazi.",
                "flag": 524288,
                "_newName": "is-hidden"
            },
            {
                "propOf": "url-tag",
                "type": 1,
                "modifier": 0,
                "clsEnumName": null,
                "constrains": 1,
                "regexConstrains": "^.*\\.mp3$|^.*@((std-4|std-2)$|(16by9|4by3):((\\d+|\\*)-((\\w|\\.)*webm|(\\w|\\.)*mp4)+(,(\\w|\\.)*webm|,(\\w|\\.)*mp4)*)+(\\|(\\d+|\\*)-((\\w|\\.)*webm|(\\w|\\.)*mp4)+(,(\\w|\\.)*webm|,(\\w|\\.)*mp4)*)*)$",
                "name": "media-url",
                "summary": null,
                "descr": null,
                "flag": 0,
                "_newName": null
            },
            {
                "propOf": "media-tag",
                "type": 1,
                "modifier": 0,
                "clsEnumName": null,
                "constrains": 0,
                "regexConstrains": null,
                "name": "cut-url",
                "summary": null,
                "descr": null,
                "flag": 0,
                "_newName": null
            },
            {
                "propOf": "media-tag",
                "type": 1,
                "modifier": 0,
                "clsEnumName": null,
                "constrains": 1,
                "regexConstrains": "^(\\d+|-\\d+|\\d+-\\d+|\\d+-)(,\\d+|,-\\d+|,\\d+-\\d+|,\\d+-)*$",
                "name": "subset",
                "summary": null,
                "descr": null,
                "flag": 0,
                "_newName": null
            },
            {
                "propOf": "media-tag",
                "type": 1,
                "modifier": 0,
                "clsEnumName": null,
                "constrains": 3,
                "regexConstrains": null,
                "name": "share-media-id",
                "summary": null,
                "descr": null,
                "flag": 0,
                "_newName": "share-id"
            },
            {
                "propOf": "media-tag",
                "type": 1,
                "modifier": 0,
                "clsEnumName": null,
                "constrains": 0,
                "regexConstrains": null,
                "name": "_sent-group-id",
                "summary": null,
                "descr": null,
                "flag": 384,
                "_newName": null
            },
            {
                "propOf": "media-text",
                "type": 1,
                "modifier": 0,
                "clsEnumName": null,
                "constrains": 3,
                "regexConstrains": null,
                "name": "continue-media-id",
                "summary": null,
                "descr": null,
                "flag": 0,
                "_newName": "continue-id"
            },
            {
                "propOf": "media-text",
                "type": 3,
                "modifier": 0,
                "clsEnumName": null,
                "constrains": 0,
                "regexConstrains": null,
                "name": "passive",
                "summary": null,
                "descr": null,
                "flag": 0,
                "_newName": "is-passive"
            },
            {
                "propOf": "media-text",
                "type": 3,
                "modifier": 0,
                "clsEnumName": null,
                "constrains": 0,
                "regexConstrains": null,
                "name": "is-old-to-new",
                "summary": null,
                "descr": null,
                "flag": 128,
                "_newName": null
            },
            {
                "propOf": "media-text",
                "type": 3,
                "modifier": 0,
                "clsEnumName": null,
                "constrains": 0,
                "regexConstrains": null,
                "name": "hidden",
                "summary": null,
                "descr": null,
                "flag": 0,
                "_newName": "is-hidden"
            },
            {
                "propOf": "_media-replica",
                "type": 2,
                "modifier": 0,
                "clsEnumName": "icon-ids",
                "constrains": 0,
                "regexConstrains": null,
                "name": "icon-id",
                "summary": null,
                "descr": null,
                "flag": 0,
                "_newName": null
            },
            {
                "propOf": "_media-replica",
                "type": 3,
                "modifier": 0,
                "clsEnumName": null,
                "constrains": 0,
                "regexConstrains": null,
                "name": "dlg-left",
                "summary": null,
                "descr": null,
                "flag": 0,
                "_newName": null
            },
            {
                "propOf": "_media-replica",
                "type": 1,
                "modifier": 0,
                "clsEnumName": null,
                "constrains": 0,
                "regexConstrains": null,
                "name": "actor",
                "summary": null,
                "descr": null,
                "flag": 0,
                "_newName": null
            },
            {
                "propOf": "_media-sent",
                "type": 0,
                "modifier": 0,
                "clsEnumName": null,
                "constrains": 0,
                "regexConstrains": null,
                "name": "idx",
                "summary": null,
                "descr": null,
                "flag": 0,
                "_newName": null
            },
            {
                "propOf": "_snd-sent",
                "type": 0,
                "modifier": 0,
                "clsEnumName": null,
                "constrains": 0,
                "regexConstrains": null,
                "name": "idx",
                "summary": null,
                "descr": null,
                "flag": 0,
                "_newName": null
            },
            {
                "propOf": "_snd-sent",
                "type": 0,
                "modifier": 0,
                "clsEnumName": null,
                "constrains": 0,
                "regexConstrains": null,
                "name": "beg-pos",
                "summary": null,
                "descr": null,
                "flag": 0,
                "_newName": null
            },
            {
                "propOf": "_snd-sent",
                "type": 0,
                "modifier": 0,
                "clsEnumName": null,
                "constrains": 0,
                "regexConstrains": null,
                "name": "end-pos",
                "summary": null,
                "descr": null,
                "flag": 0,
                "_newName": null
            },
            {
                "propOf": "_snd-sent",
                "type": 1,
                "modifier": 0,
                "clsEnumName": null,
                "constrains": 0,
                "regexConstrains": null,
                "name": "text",
                "summary": null,
                "descr": null,
                "flag": 0,
                "_newName": null
            },
            {
                "propOf": "_snd-sent",
                "type": 1,
                "modifier": 0,
                "clsEnumName": null,
                "constrains": 0,
                "regexConstrains": null,
                "name": "actor",
                "summary": null,
                "descr": null,
                "flag": 0,
                "_newName": null
            },
            {
                "propOf": "_snd-file",
                "type": 4,
                "modifier": 0,
                "clsEnumName": "include",
                "constrains": 0,
                "regexConstrains": null,
                "name": "file",
                "summary": null,
                "descr": null,
                "flag": 128,
                "_newName": null
            },
            {
                "propOf": "phrase",
                "type": 0,
                "modifier": 0,
                "clsEnumName": null,
                "constrains": 0,
                "regexConstrains": null,
                "name": "beg-pos",
                "summary": null,
                "descr": null,
                "flag": 0,
                "_newName": null
            },
            {
                "propOf": "phrase",
                "type": 0,
                "modifier": 0,
                "clsEnumName": null,
                "constrains": 0,
                "regexConstrains": null,
                "name": "end-pos",
                "summary": null,
                "descr": null,
                "flag": 0,
                "_newName": null
            },
            {
                "propOf": "replica",
                "type": 2,
                "modifier": 0,
                "clsEnumName": "icon-ids",
                "constrains": 0,
                "regexConstrains": null,
                "name": "actor-id",
                "summary": null,
                "descr": null,
                "flag": 0,
                "_newName": "icon-id"
            },
            {
                "propOf": "replica",
                "type": 1,
                "modifier": 0,
                "clsEnumName": null,
                "constrains": 0,
                "regexConstrains": null,
                "name": "actor-name",
                "summary": null,
                "descr": null,
                "flag": 0,
                "_newName": "actor"
            },
            {
                "propOf": "replica",
                "type": 0,
                "modifier": 0,
                "clsEnumName": null,
                "constrains": 0,
                "regexConstrains": null,
                "name": "number-of-phrases",
                "summary": "",
                "descr": "uvedena konstrukce slou?? k vytvo?en? dialogu z plain textu. Podporov?n je POUZE souvisl? text (bez p?eskakov?n? zvukov?ch v?t). \n            Tak?e z?pis je ten, ?e pro ka?dou repliku se ur?? PO?ET v?t repliky (ur?ovat za??tek a konec je zbyte?n? slo?it?). \n            Dal?? replika za??n? prvn? v?tou po posledn? v?t? p?edchoz? repliky. \n            jestli preci jenom ale nebude nejlepsi \"take-phrases\" (puvodne \"sent-take\").",
                "flag": 0,
                "_newName": "sent-take"
            },
            {
                "propOf": "include",
                "type": 1,
                "modifier": 0,
                "clsEnumName": null,
                "constrains": 0,
                "regexConstrains": null,
                "name": "cut-url",
                "summary": null,
                "descr": "@summary pointer na XML file s sndDialog nebo sndText (extenze se ignoruje). \n            @descr",
                "flag": 262144,
                "_newName": null
            },
            {
                "propOf": "phrase-replace",
                "type": 0,
                "modifier": 0,
                "clsEnumName": null,
                "constrains": 4,
                "regexConstrains": null,
                "name": "phrase-idx",
                "summary": null,
                "descr": null,
                "flag": 0,
                "_newName": "sent-idx"
            },
            {
                "propOf": "phrase-replace",
                "type": 1,
                "modifier": 0,
                "clsEnumName": null,
                "constrains": 1,
                "regexConstrains": "^\\d+\\.\\d+$",
                "name": "replica-phrase-idx",
                "summary": null,
                "descr": null,
                "flag": 0,
                "_newName": "replica-sent-idx"
            },
            {
                "propOf": "_eval-page",
                "type": 0,
                "modifier": 0,
                "clsEnumName": null,
                "constrains": 0,
                "regexConstrains": null,
                "name": "max-score",
                "summary": null,
                "descr": null,
                "flag": 0,
                "_newName": null
            },
            {
                "propOf": "_eval-page",
                "type": 1,
                "modifier": 0,
                "clsEnumName": null,
                "constrains": 0,
                "regexConstrains": null,
                "name": "radio-groups",
                "summary": null,
                "descr": null,
                "flag": 0,
                "_newName": null
            },
            {
                "propOf": "_eval-btn",
                "type": 1,
                "modifier": 0,
                "clsEnumName": null,
                "constrains": 0,
                "regexConstrains": null,
                "name": "btn-id",
                "summary": null,
                "descr": null,
                "flag": 0,
                "_newName": null
            },
            {
                "propOf": "_eval-group",
                "type": 3,
                "modifier": 0,
                "clsEnumName": null,
                "constrains": 0,
                "regexConstrains": null,
                "name": "is-and",
                "summary": null,
                "descr": null,
                "flag": 0,
                "_newName": null
            },
            {
                "propOf": "_eval-group",
                "type": 3,
                "modifier": 0,
                "clsEnumName": null,
                "constrains": 0,
                "regexConstrains": null,
                "name": "is-exchangeable",
                "summary": null,
                "descr": null,
                "flag": 0,
                "_newName": null
            },
            {
                "propOf": "_eval-group",
                "type": 1,
                "modifier": 1,
                "clsEnumName": null,
                "constrains": 0,
                "regexConstrains": null,
                "name": "eval-control-ids",
                "summary": null,
                "descr": null,
                "flag": 32,
                "_newName": null
            },
            {
                "propOf": "macro-template",
                "type": 1,
                "modifier": 0,
                "clsEnumName": null,
                "constrains": 0,
                "regexConstrains": null,
                "name": "name",
                "summary": null,
                "descr": null,
                "flag": 0,
                "_newName": null
            },
            {
                "propOf": "macro-template",
                "type": 1,
                "modifier": 0,
                "clsEnumName": null,
                "constrains": 0,
                "regexConstrains": null,
                "name": "cdata",
                "summary": null,
                "descr": null,
                "flag": 0,
                "_newName": null
            },
            {
                "propOf": "macro-true-false",
                "type": 2,
                "modifier": 0,
                "clsEnumName": "check-item-texts",
                "constrains": 0,
                "regexConstrains": null,
                "name": "text-id",
                "summary": null,
                "descr": null,
                "flag": 0,
                "_newName": null
            },
            {
                "propOf": "macro-table",
                "type": 2,
                "modifier": 0,
                "clsEnumName": "inline-control-types",
                "constrains": 0,
                "regexConstrains": null,
                "name": "inline-type",
                "summary": null,
                "descr": null,
                "flag": 0,
                "_newName": null
            },
            {
                "propOf": "macro-list",
                "type": 2,
                "modifier": 0,
                "clsEnumName": "inline-control-types",
                "constrains": 0,
                "regexConstrains": null,
                "name": "inline-type",
                "summary": null,
                "descr": null,
                "flag": 0,
                "_newName": null
            },
            {
                "propOf": "macro-icon-list",
                "type": 1,
                "modifier": 0,
                "clsEnumName": null,
                "constrains": 0,
                "regexConstrains": null,
                "name": "delim",
                "summary": null,
                "descr": null,
                "flag": 0,
                "_newName": null
            },
            {
                "propOf": "macro-icon-list",
                "type": 3,
                "modifier": 0,
                "clsEnumName": null,
                "constrains": 0,
                "regexConstrains": null,
                "name": "is-striped",
                "summary": null,
                "descr": null,
                "flag": 0,
                "_newName": null
            },
            {
                "propOf": "macro-icon-list",
                "type": 2,
                "modifier": 0,
                "clsEnumName": "list-icon",
                "constrains": 0,
                "regexConstrains": null,
                "name": "icon",
                "summary": null,
                "descr": null,
                "flag": 0,
                "_newName": null
            },
            {
                "propOf": "macro-icon-list",
                "type": 2,
                "modifier": 0,
                "clsEnumName": "colors",
                "constrains": 0,
                "regexConstrains": null,
                "name": "color",
                "summary": null,
                "descr": null,
                "flag": 0,
                "_newName": null
            },
            {
                "propOf": "macro-video",
                "type": 1,
                "modifier": 0,
                "clsEnumName": null,
                "constrains": 0,
                "regexConstrains": null,
                "name": "cut-url",
                "summary": null,
                "descr": null,
                "flag": 0,
                "_newName": null
            },
            {
                "propOf": "macro-video",
                "type": 1,
                "modifier": 0,
                "clsEnumName": null,
                "constrains": 1,
                "regexConstrains": "^.*\\.mp3$|^.*@((std-4|std-2)$|(16by9|4by3):((\\d+|\\*)-((\\w|\\.)*webm|(\\w|\\.)*mp4)+(,(\\w|\\.)*webm|,(\\w|\\.)*mp4)*)+(\\|(\\d+|\\*)-((\\w|\\.)*webm|(\\w|\\.)*mp4)+(,(\\w|\\.)*webm|,(\\w|\\.)*mp4)*)*)$",
                "name": "media-url",
                "summary": null,
                "descr": null,
                "flag": 0,
                "_newName": null
            },
            {
                "propOf": "macro-video",
                "type": 1,
                "modifier": 0,
                "clsEnumName": null,
                "constrains": 0,
                "regexConstrains": null,
                "name": "display-style",
                "summary": null,
                "descr": null,
                "flag": 0,
                "_newName": null
            },
            {
                "propOf": "inline-tag",
                "type": 2,
                "modifier": 0,
                "clsEnumName": "inline-element-types",
                "constrains": 0,
                "regexConstrains": null,
                "name": "inline-type",
                "summary": null,
                "descr": null,
                "flag": 0,
                "_newName": null
            },
            {
                "propOf": "smart-tag",
                "type": 3,
                "modifier": 0,
                "clsEnumName": null,
                "constrains": 0,
                "regexConstrains": null,
                "name": "correct",
                "summary": null,
                "descr": null,
                "flag": 0,
                "_newName": null
            },
            {
                "propOf": "smart-tag",
                "type": 2,
                "modifier": 0,
                "clsEnumName": "inline-control-types",
                "constrains": 0,
                "regexConstrains": null,
                "name": "default-inline-type",
                "summary": null,
                "descr": null,
                "flag": 128,
                "_newName": null
            },
            {
                "propOf": "smart-element",
                "type": 2,
                "modifier": 0,
                "clsEnumName": "smart-element-types",
                "constrains": 0,
                "regexConstrains": null,
                "name": "inline-type",
                "summary": null,
                "descr": null,
                "flag": 0,
                "_newName": null
            },
            {
                "propOf": "smart-offering",
                "type": 1,
                "modifier": 0,
                "clsEnumName": null,
                "constrains": 0,
                "regexConstrains": null,
                "name": "words",
                "summary": null,
                "descr": null,
                "flag": 0,
                "_newName": null
            },
            {
                "propOf": "smart-offering",
                "type": 2,
                "modifier": 0,
                "clsEnumName": "smart-offering-mode",
                "constrains": 0,
                "regexConstrains": null,
                "name": "mode",
                "summary": null,
                "descr": null,
                "flag": 0,
                "_newName": null
            },
            {
                "propOf": "smart-pairing",
                "type": 3,
                "modifier": 0,
                "clsEnumName": null,
                "constrains": 0,
                "regexConstrains": null,
                "name": "random",
                "summary": null,
                "descr": null,
                "flag": 0,
                "_newName": null
            },
            {
                "propOf": "smart-pairing",
                "type": 2,
                "modifier": 0,
                "clsEnumName": "pairing-left-width",
                "constrains": 0,
                "regexConstrains": null,
                "name": "left-width",
                "summary": null,
                "descr": null,
                "flag": 0,
                "_newName": null
            },
            {
                "propOf": "doc-tags-meta",
                "type": 4,
                "modifier": 1,
                "clsEnumName": "doc-type",
                "constrains": 0,
                "regexConstrains": null,
                "name": "types",
                "summary": null,
                "descr": null,
                "flag": 32,
                "_newName": null
            },
            {
                "propOf": "doc-tags-meta",
                "type": 4,
                "modifier": 1,
                "clsEnumName": "doc-prop",
                "constrains": 0,
                "regexConstrains": null,
                "name": "props",
                "summary": null,
                "descr": null,
                "flag": 32,
                "_newName": null
            },
            {
                "propOf": "doc-tags-meta",
                "type": 4,
                "modifier": 1,
                "clsEnumName": "doc-enum",
                "constrains": 0,
                "regexConstrains": null,
                "name": "enums",
                "summary": null,
                "descr": null,
                "flag": 32,
                "_newName": null
            },
            {
                "propOf": "doc-named",
                "type": 1,
                "modifier": 0,
                "clsEnumName": null,
                "constrains": 0,
                "regexConstrains": null,
                "name": "name",
                "summary": null,
                "descr": null,
                "flag": 0,
                "_newName": null
            },
            {
                "propOf": "doc-named",
                "type": 1,
                "modifier": 0,
                "clsEnumName": null,
                "constrains": 0,
                "regexConstrains": null,
                "name": "summary",
                "summary": null,
                "descr": null,
                "flag": 0,
                "_newName": null
            },
            {
                "propOf": "doc-named",
                "type": 1,
                "modifier": 0,
                "clsEnumName": null,
                "constrains": 0,
                "regexConstrains": null,
                "name": "cdata",
                "summary": null,
                "descr": null,
                "flag": 0,
                "_newName": null
            },
            {
                "propOf": "doc-type",
                "type": 3,
                "modifier": 0,
                "clsEnumName": null,
                "constrains": 0,
                "regexConstrains": null,
                "name": "is-html",
                "summary": null,
                "descr": null,
                "flag": 0,
                "_newName": null
            },
            {
                "propOf": "doc-type",
                "type": 3,
                "modifier": 0,
                "clsEnumName": null,
                "constrains": 0,
                "regexConstrains": null,
                "name": "is-ign",
                "summary": null,
                "descr": null,
                "flag": 0,
                "_newName": null
            },
            {
                "propOf": "doc-type",
                "type": 1,
                "modifier": 1,
                "clsEnumName": null,
                "constrains": 0,
                "regexConstrains": null,
                "name": "descendants-and-self",
                "summary": null,
                "descr": null,
                "flag": 32,
                "_newName": null
            },
            {
                "propOf": "doc-type",
                "type": 1,
                "modifier": 1,
                "clsEnumName": null,
                "constrains": 0,
                "regexConstrains": null,
                "name": "my-props",
                "summary": null,
                "descr": null,
                "flag": 32,
                "_newName": null
            },
            {
                "propOf": "doc-type",
                "type": 1,
                "modifier": 0,
                "clsEnumName": null,
                "constrains": 0,
                "regexConstrains": null,
                "name": "xref",
                "summary": null,
                "descr": null,
                "flag": 0,
                "_newName": null
            },
            {
                "propOf": "doc-enum",
                "type": 1,
                "modifier": 0,
                "clsEnumName": null,
                "constrains": 0,
                "regexConstrains": null,
                "name": "xref",
                "summary": null,
                "descr": null,
                "flag": 0,
                "_newName": null
            },
            {
                "propOf": "doc-enum",
                "type": 4,
                "modifier": 1,
                "clsEnumName": "doc-enum-item",
                "constrains": 0,
                "regexConstrains": null,
                "name": "enums",
                "summary": null,
                "descr": null,
                "flag": 32,
                "_newName": null
            },
            {
                "propOf": "doc-enum-item",
                "type": 1,
                "modifier": 0,
                "clsEnumName": null,
                "constrains": 0,
                "regexConstrains": null,
                "name": "xref",
                "summary": null,
                "descr": null,
                "flag": 0,
                "_newName": null
            },
            {
                "propOf": "doc-prop",
                "type": 1,
                "modifier": 0,
                "clsEnumName": null,
                "constrains": 0,
                "regexConstrains": null,
                "name": "owner-type",
                "summary": null,
                "descr": null,
                "flag": 0,
                "_newName": null
            },
            {
                "propOf": "doc-prop",
                "type": 1,
                "modifier": 0,
                "clsEnumName": null,
                "constrains": 0,
                "regexConstrains": null,
                "name": "data-type",
                "summary": null,
                "descr": null,
                "flag": 0,
                "_newName": null
            },
            {
                "propOf": "doc-prop",
                "type": 1,
                "modifier": 0,
                "clsEnumName": null,
                "constrains": 0,
                "regexConstrains": null,
                "name": "xref",
                "summary": null,
                "descr": null,
                "flag": 0,
                "_newName": null
            },
            {
                "propOf": "doc-prop",
                "type": 3,
                "modifier": 0,
                "clsEnumName": null,
                "constrains": 0,
                "regexConstrains": null,
                "name": "is-html",
                "summary": null,
                "descr": null,
                "flag": 0,
                "_newName": null
            },
            {
                "propOf": "doc-example",
                "type": 3,
                "modifier": 0,
                "clsEnumName": null,
                "constrains": 0,
                "regexConstrains": null,
                "name": "todo",
                "summary": null,
                "descr": null,
                "flag": 0,
                "_newName": null
            },
            {
                "propOf": "doc-example",
                "type": 1,
                "modifier": 0,
                "clsEnumName": null,
                "constrains": 0,
                "regexConstrains": null,
                "name": "code-listing",
                "summary": null,
                "descr": null,
                "flag": 0,
                "_newName": null
            },
            {
                "propOf": "doc-example",
                "type": 1,
                "modifier": 0,
                "clsEnumName": null,
                "constrains": 0,
                "regexConstrains": null,
                "name": "code-post-listing",
                "summary": null,
                "descr": null,
                "flag": 0,
                "_newName": null
            },
            {
                "propOf": "doc-example",
                "type": 4,
                "modifier": 0,
                "clsEnumName": "header-prop",
                "constrains": 0,
                "regexConstrains": null,
                "name": "header",
                "summary": null,
                "descr": null,
                "flag": 0,
                "_newName": null
            },
            {
                "propOf": "doc-example",
                "type": 4,
                "modifier": 0,
                "clsEnumName": "doc-descr",
                "constrains": 0,
                "regexConstrains": null,
                "name": "descr",
                "summary": null,
                "descr": null,
                "flag": 0,
                "_newName": null
            },
            {
                "propOf": "doc-example",
                "type": 4,
                "modifier": 0,
                "clsEnumName": "eval-button",
                "constrains": 0,
                "regexConstrains": null,
                "name": "eval-btn",
                "summary": null,
                "descr": null,
                "flag": 0,
                "_newName": null
            }
        ],
        "enums": {
            "check-item-texts": {
                "enumData": [
                    {
                        "value": 0,
                        "name": "yes-no",
                        "summary": null,
                        "descr": null,
                        "flag": 0,
                        "_newName": "yes-no"
                    },
                    {
                        "value": 1,
                        "name": "true-false",
                        "summary": null,
                        "descr": null,
                        "flag": 0,
                        "_newName": "true-false"
                    },
                    {
                        "value": 2,
                        "name": "no",
                        "summary": null,
                        "descr": null,
                        "flag": 0,
                        "_newName": null
                    }
                ],
                "name": "check-item-texts",
                "summary": null,
                "descr": null,
                "flag": 0,
                "_newName": null
            },
            "three-state-bool": {
                "enumData": [
                    {
                        "value": 0,
                        "name": "no",
                        "summary": null,
                        "descr": null,
                        "flag": 0,
                        "_newName": null
                    },
                    {
                        "value": 1,
                        "name": "true",
                        "summary": null,
                        "descr": null,
                        "flag": 0,
                        "_newName": "true"
                    },
                    {
                        "value": 2,
                        "name": "false",
                        "summary": null,
                        "descr": null,
                        "flag": 0,
                        "_newName": "false"
                    }
                ],
                "name": "three-state-bool",
                "summary": null,
                "descr": null,
                "flag": 0,
                "_newName": null
            },
            "pairing-left-width": {
                "enumData": [
                    {
                        "value": 0,
                        "name": "normal",
                        "summary": null,
                        "descr": null,
                        "flag": 0,
                        "_newName": null
                    },
                    {
                        "value": 1,
                        "name": "small",
                        "summary": null,
                        "descr": null,
                        "flag": 0,
                        "_newName": null
                    },
                    {
                        "value": 2,
                        "name": "xsmall",
                        "summary": null,
                        "descr": null,
                        "flag": 0,
                        "_newName": null
                    },
                    {
                        "value": 3,
                        "name": "large",
                        "summary": null,
                        "descr": null,
                        "flag": 0,
                        "_newName": null
                    }
                ],
                "name": "pairing-left-width",
                "summary": null,
                "descr": null,
                "flag": 0,
                "_newName": null
            },
            "modal-size": {
                "enumData": [
                    {
                        "value": 0,
                        "name": "normal",
                        "summary": null,
                        "descr": null,
                        "flag": 0,
                        "_newName": null
                    },
                    {
                        "value": 1,
                        "name": "small",
                        "summary": null,
                        "descr": null,
                        "flag": 0,
                        "_newName": null
                    },
                    {
                        "value": 2,
                        "name": "large",
                        "summary": null,
                        "descr": null,
                        "flag": 0,
                        "_newName": null
                    }
                ],
                "name": "modal-size",
                "summary": null,
                "descr": null,
                "flag": 0,
                "_newName": null
            },
            "list-icon": {
                "enumData": [
                    {
                        "value": 0,
                        "name": "number",
                        "summary": null,
                        "descr": null,
                        "flag": 0,
                        "_newName": null
                    },
                    {
                        "value": 1,
                        "name": "letter",
                        "summary": null,
                        "descr": null,
                        "flag": 0,
                        "_newName": null
                    },
                    {
                        "value": 2,
                        "name": "upper-letter",
                        "summary": null,
                        "descr": null,
                        "flag": 0,
                        "_newName": null
                    },
                    {
                        "value": 3,
                        "name": "angle-double-right",
                        "summary": null,
                        "descr": null,
                        "flag": 0,
                        "_newName": null
                    },
                    {
                        "value": 4,
                        "name": "angle-right",
                        "summary": null,
                        "descr": null,
                        "flag": 0,
                        "_newName": null
                    },
                    {
                        "value": 5,
                        "name": "arrow-circle-o-right",
                        "summary": null,
                        "descr": null,
                        "flag": 0,
                        "_newName": null
                    },
                    {
                        "value": 6,
                        "name": "arrow-circle-right",
                        "summary": null,
                        "descr": null,
                        "flag": 0,
                        "_newName": null
                    },
                    {
                        "value": 7,
                        "name": "arrow-right",
                        "summary": null,
                        "descr": null,
                        "flag": 0,
                        "_newName": null
                    },
                    {
                        "value": 8,
                        "name": "caret-right",
                        "summary": null,
                        "descr": null,
                        "flag": 0,
                        "_newName": null
                    },
                    {
                        "value": 9,
                        "name": "caret-square-o-right",
                        "summary": null,
                        "descr": null,
                        "flag": 0,
                        "_newName": null
                    },
                    {
                        "value": 10,
                        "name": "chevron-circle-right",
                        "summary": null,
                        "descr": null,
                        "flag": 0,
                        "_newName": null
                    },
                    {
                        "value": 11,
                        "name": "chevron-right",
                        "summary": null,
                        "descr": null,
                        "flag": 0,
                        "_newName": null
                    },
                    {
                        "value": 12,
                        "name": "hand-o-right",
                        "summary": null,
                        "descr": null,
                        "flag": 0,
                        "_newName": null
                    },
                    {
                        "value": 13,
                        "name": "long-arrow-right",
                        "summary": null,
                        "descr": null,
                        "flag": 0,
                        "_newName": null
                    },
                    {
                        "value": 14,
                        "name": "play",
                        "summary": null,
                        "descr": null,
                        "flag": 0,
                        "_newName": null
                    },
                    {
                        "value": 15,
                        "name": "play-circle",
                        "summary": null,
                        "descr": null,
                        "flag": 0,
                        "_newName": null
                    },
                    {
                        "value": 16,
                        "name": "play-circle-o",
                        "summary": null,
                        "descr": null,
                        "flag": 0,
                        "_newName": null
                    },
                    {
                        "value": 17,
                        "name": "circle-o-notch",
                        "summary": null,
                        "descr": null,
                        "flag": 0,
                        "_newName": null
                    },
                    {
                        "value": 18,
                        "name": "cog",
                        "summary": null,
                        "descr": null,
                        "flag": 0,
                        "_newName": null
                    },
                    {
                        "value": 19,
                        "name": "refresh",
                        "summary": null,
                        "descr": null,
                        "flag": 0,
                        "_newName": null
                    },
                    {
                        "value": 20,
                        "name": "spinner",
                        "summary": null,
                        "descr": null,
                        "flag": 0,
                        "_newName": null
                    },
                    {
                        "value": 21,
                        "name": "square-o",
                        "summary": null,
                        "descr": null,
                        "flag": 0,
                        "_newName": null
                    },
                    {
                        "value": 22,
                        "name": "bullseye",
                        "summary": null,
                        "descr": null,
                        "flag": 0,
                        "_newName": null
                    },
                    {
                        "value": 23,
                        "name": "asterisk",
                        "summary": null,
                        "descr": null,
                        "flag": 0,
                        "_newName": null
                    },
                    {
                        "value": 24,
                        "name": "circle",
                        "summary": null,
                        "descr": null,
                        "flag": 0,
                        "_newName": null
                    },
                    {
                        "value": 25,
                        "name": "circle-o",
                        "summary": null,
                        "descr": null,
                        "flag": 0,
                        "_newName": null
                    },
                    {
                        "value": 26,
                        "name": "circle-thin",
                        "summary": null,
                        "descr": null,
                        "flag": 0,
                        "_newName": null
                    },
                    {
                        "value": 27,
                        "name": "dot-circle-o",
                        "summary": null,
                        "descr": null,
                        "flag": 0,
                        "_newName": null
                    }
                ],
                "name": "list-icon",
                "summary": null,
                "descr": null,
                "flag": 128,
                "_newName": null
            },
            "colors": {
                "enumData": [
                    {
                        "value": 0,
                        "name": "black",
                        "summary": null,
                        "descr": null,
                        "flag": 0,
                        "_newName": null
                    },
                    {
                        "value": 1,
                        "name": "white",
                        "summary": null,
                        "descr": null,
                        "flag": 0,
                        "_newName": null
                    },
                    {
                        "value": 2,
                        "name": "primary",
                        "summary": null,
                        "descr": null,
                        "flag": 0,
                        "_newName": null
                    },
                    {
                        "value": 3,
                        "name": "success",
                        "summary": null,
                        "descr": null,
                        "flag": 0,
                        "_newName": null
                    },
                    {
                        "value": 4,
                        "name": "info",
                        "summary": null,
                        "descr": null,
                        "flag": 0,
                        "_newName": null
                    },
                    {
                        "value": 5,
                        "name": "warning",
                        "summary": null,
                        "descr": null,
                        "flag": 0,
                        "_newName": null
                    },
                    {
                        "value": 6,
                        "name": "danger",
                        "summary": null,
                        "descr": null,
                        "flag": 0,
                        "_newName": null
                    }
                ],
                "name": "colors",
                "summary": null,
                "descr": null,
                "flag": 128,
                "_newName": null
            },
            "offering-drop-down-mode": {
                "enumData": [
                    {
                        "value": 0,
                        "name": "drop-down-discard",
                        "summary": null,
                        "descr": null,
                        "flag": 0,
                        "_newName": "drop-down-discard"
                    },
                    {
                        "value": 1,
                        "name": "drop-down-keep",
                        "summary": null,
                        "descr": null,
                        "flag": 0,
                        "_newName": "drop-down-keep"
                    },
                    {
                        "value": 2,
                        "name": "gap-fill-ignore",
                        "summary": null,
                        "descr": null,
                        "flag": 0,
                        "_newName": "gap-fill-ignore"
                    }
                ],
                "name": "offering-drop-down-mode",
                "summary": null,
                "descr": null,
                "flag": 524288,
                "_newName": "offering-mode"
            },
            "icon-ids": {
                "enumData": [
                    {
                        "value": 0,
                        "name": "no",
                        "summary": null,
                        "descr": null,
                        "flag": 0,
                        "_newName": null
                    },
                    {
                        "value": 1,
                        "name": "a",
                        "summary": "Dialog speaker A",
                        "descr": null,
                        "flag": 0,
                        "_newName": null
                    },
                    {
                        "value": 2,
                        "name": "b",
                        "summary": null,
                        "descr": null,
                        "flag": 0,
                        "_newName": null
                    },
                    {
                        "value": 3,
                        "name": "c",
                        "summary": null,
                        "descr": null,
                        "flag": 0,
                        "_newName": null
                    },
                    {
                        "value": 4,
                        "name": "d",
                        "summary": null,
                        "descr": null,
                        "flag": 0,
                        "_newName": null
                    },
                    {
                        "value": 5,
                        "name": "e",
                        "summary": null,
                        "descr": null,
                        "flag": 0,
                        "_newName": null
                    },
                    {
                        "value": 6,
                        "name": "f",
                        "summary": null,
                        "descr": null,
                        "flag": 0,
                        "_newName": null
                    }
                ],
                "name": "icon-ids",
                "summary": "Dialog speaker identification",
                "descr": "descr",
                "flag": 0,
                "_newName": "replica-actor"
            },
            "inline-control-types": {
                "enumData": [
                    {
                        "value": 0,
                        "name": "no",
                        "summary": null,
                        "descr": null,
                        "flag": 0,
                        "_newName": null
                    },
                    {
                        "value": 1,
                        "name": "gap-fill",
                        "summary": null,
                        "descr": null,
                        "flag": 0,
                        "_newName": null
                    },
                    {
                        "value": 2,
                        "name": "gap-fill_-correction",
                        "summary": null,
                        "descr": null,
                        "flag": 0,
                        "_newName": null
                    },
                    {
                        "value": 3,
                        "name": "word-selection",
                        "summary": null,
                        "descr": null,
                        "flag": 0,
                        "_newName": null
                    },
                    {
                        "value": 4,
                        "name": "drag-target",
                        "summary": null,
                        "descr": null,
                        "flag": 0,
                        "_newName": null
                    },
                    {
                        "value": 5,
                        "name": "img",
                        "summary": null,
                        "descr": null,
                        "flag": 0,
                        "_newName": null
                    },
                    {
                        "value": 6,
                        "name": "tts-sound",
                        "summary": null,
                        "descr": null,
                        "flag": 0,
                        "_newName": null
                    }
                ],
                "name": "inline-control-types",
                "summary": null,
                "descr": null,
                "flag": 128,
                "_newName": null
            },
            "inline-element-types": {
                "enumData": [
                    {
                        "value": 0,
                        "name": "no",
                        "summary": null,
                        "descr": null,
                        "flag": 0,
                        "_newName": null
                    },
                    {
                        "value": 1,
                        "name": "gap-fill",
                        "summary": null,
                        "descr": null,
                        "flag": 0,
                        "_newName": null
                    },
                    {
                        "value": 2,
                        "name": "gap-fill-correction",
                        "summary": null,
                        "descr": null,
                        "flag": 0,
                        "_newName": null
                    },
                    {
                        "value": 3,
                        "name": "word-selection",
                        "summary": null,
                        "descr": null,
                        "flag": 0,
                        "_newName": null
                    },
                    {
                        "value": 4,
                        "name": "drop-down",
                        "summary": null,
                        "descr": null,
                        "flag": 0,
                        "_newName": null
                    },
                    {
                        "value": 5,
                        "name": "img",
                        "summary": null,
                        "descr": null,
                        "flag": 0,
                        "_newName": null
                    },
                    {
                        "value": 6,
                        "name": "tts-sound",
                        "summary": null,
                        "descr": null,
                        "flag": 0,
                        "_newName": null
                    }
                ],
                "name": "inline-element-types",
                "summary": null,
                "descr": null,
                "flag": 128,
                "_newName": null
            },
            "smart-element-types": {
                "enumData": [
                    {
                        "value": 0,
                        "name": "no",
                        "summary": null,
                        "descr": null,
                        "flag": 0,
                        "_newName": null
                    },
                    {
                        "value": 1,
                        "name": "gap-fill",
                        "summary": null,
                        "descr": null,
                        "flag": 0,
                        "_newName": null
                    },
                    {
                        "value": 2,
                        "name": "drop-down",
                        "summary": null,
                        "descr": null,
                        "flag": 0,
                        "_newName": null
                    },
                    {
                        "value": 3,
                        "name": "offering",
                        "summary": null,
                        "descr": null,
                        "flag": 0,
                        "_newName": null
                    },
                    {
                        "value": 4,
                        "name": "img",
                        "summary": null,
                        "descr": null,
                        "flag": 0,
                        "_newName": null
                    },
                    {
                        "value": 5,
                        "name": "word-selection",
                        "summary": null,
                        "descr": null,
                        "flag": 0,
                        "_newName": null
                    }
                ],
                "name": "smart-element-types",
                "summary": null,
                "descr": null,
                "flag": 128,
                "_newName": null
            },
            "smart-offering-mode": {
                "enumData": [
                    {
                        "value": 0,
                        "name": "gap-fill",
                        "summary": null,
                        "descr": null,
                        "flag": 0,
                        "_newName": null
                    },
                    {
                        "value": 1,
                        "name": "drop-down-discard",
                        "summary": null,
                        "descr": null,
                        "flag": 0,
                        "_newName": null
                    },
                    {
                        "value": 2,
                        "name": "drop-down-keep",
                        "summary": null,
                        "descr": null,
                        "flag": 0,
                        "_newName": null
                    },
                    {
                        "value": 3,
                        "name": "gap-fill-passive",
                        "summary": null,
                        "descr": null,
                        "flag": 0,
                        "_newName": "gap-fill-ignore"
                    }
                ],
                "name": "smart-offering-mode",
                "summary": null,
                "descr": null,
                "flag": 128,
                "_newName": null
            }
        }
    };
})(metaJS || (metaJS = {}));

var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var metaJS;
(function (metaJS) {
    var implLow = (function () {
        function implLow(json) {
            if (json)
                for (var p in json)
                    this[p] = json[p];
        }
        implLow.prototype.hasFlag = function (fl) {
            var val = _.isString(fl) ? CourseModel.tgSt[fl] : fl;
            return (this.flag & val) != 0;
        };
        implLow.prototype.rnName = function () {
            if (_.isEmpty(this._newName))
                return this.name;
            return this.name + ' => <span class="label label-default">' + this._newName + '</span>';
        };
        implLow.prototype.rnNameNew = function () { return this._newName || this.name; };
        return implLow;
    })();
    metaJS.implLow = implLow;
    var enumImpl = (function (_super) {
        __extends(enumImpl, _super);
        function enumImpl(json) {
            _super.call(this, json);
            for (var i = 0; i < this.enumData.length; i++)
                this.enumData[i] = new enumItemImpl(this.enumData[i]);
        }
        return enumImpl;
    })(implLow);
    metaJS.enumImpl = enumImpl;
    var enumItemImpl = (function (_super) {
        __extends(enumItemImpl, _super);
        function enumItemImpl() {
            _super.apply(this, arguments);
        }
        return enumItemImpl;
    })(implLow);
    metaJS.enumItemImpl = enumItemImpl;
    var typeImpl = (function (_super) {
        __extends(typeImpl, _super);
        function typeImpl() {
            _super.apply(this, arguments);
        }
        typeImpl.prototype.rnDescendants = function () {
            var _this = this;
            if (this.name == 'macro')
                return null;
            var cond = function (d) { d.isTrashMode = _this.isTrashMode; var ok = !!d.rnDescendants() || !d.hasFlag(CourseModel.tgSt.docIgnore); return _this.isTrashMode ? !ok || !!d.rnProps() : ok; };
            var res = _.filter(this.descendants, function (d) { return cond(d); });
            return res.length == 0 ? null : res;
        };
        typeImpl.prototype.rnProps = function () {
            var _this = this;
            var cond = function (p) { var ok = !p.hasFlag(CourseModel.tgSt.docIgnore); return _this.isTrashMode ? !ok : ok; };
            var res = _.filter(this.ownProps, function (p) { return cond(p); });
            return res.length == 0 ? null : res;
        };
        typeImpl.prototype.rnPropsNew = function () {
            var res = _.filter(this.props, function (p) { return !p.hasFlag(CourseModel.tgSt.docIgnore); });
            return _.sortBy(res, function (p) { return p.name; }); //p._newName || p.name);
        };
        return typeImpl;
    })(implLow);
    metaJS.typeImpl = typeImpl;
    //**************** objekt pro data, exportovana z CSharp
    var xsdObj = (function () {
        function xsdObj(json) {
            var _this = this;
            this.props = []; //prop impl
            this.allEnums = [];
            this.allTypes = [];
            //properties from JSON
            if (json)
                for (var p in json)
                    this[p] = json[p];
            //interface => impl
            for (var p in this.types)
                this.allTypes.push(this.types[p] = new typeImpl(this.types[p]));
            for (var p in this.enums)
                this.allEnums.push(this.enums[p] = new enumImpl(this.enums[p]));
            //spocti typeProps
            var ownPropDirs = {};
            _.map(this.properties, function (p) {
                var props = ownPropDirs[p.propOf];
                if (!props)
                    ownPropDirs[p.propOf] = props = [];
                props.push(p);
            });
            _.each(this.types, function (tp) {
                tp.propDir = {};
                tp.props = [];
                tp.ownProps = [];
                var t = tp;
                do {
                    _.each(ownPropDirs[t.name], function (p) {
                        var impl = new propImpl(p);
                        tp.propDir[p.name] = impl;
                        tp.props.push(impl);
                        if (t == tp) {
                            tp.ownProps.push(impl);
                            _this.props.push(impl);
                        }
                    });
                    t = t.ancestor ? _this.types[t.ancestor] : null;
                } while (t);
                tp.props = _.sortBy(tp.props, function (p) { return p.name; });
                tp.ownProps = _.sortBy(tp.ownProps, function (p) { return p.name; });
                //descendants
                if (tp.ancestor) {
                    var anc = _this.types[tp.ancestor];
                    if (!anc.descendants)
                        anc.descendants = [];
                    anc.descendants.push(tp);
                }
            });
            this.props = _.sortBy(this.props, function (p) { return p.name; });
            //sorting descendants
            for (var p in this.types) {
                var t = this.types[p];
                if (t.descendants)
                    t.descendants = _.sortBy(t.descendants, function (t) { return t.name; });
            }
        }
        xsdObj.prototype.rnRoot = function (isTrash) {
            var res = this.types['tag'];
            res.isTrashMode = isTrash;
            return res;
        };
        xsdObj.prototype.rnElements = function () {
            var _this = this;
            return _.sortBy(this.allTypes.filter(function (t) { return t.descendants == null && !t.hasFlag(CourseModel.tgSt.docIgnore) && !_this.inheritsFrom(t.name, 'macro'); }), function (t) { return t.name; }); //t => t._newName || t.name);
        };
        xsdObj.prototype.rnEnums = function () {
            return _.filter(this.allEnums, function (e) { return !e.hasFlag(CourseModel.tgSt.docIgnore); });
        };
        xsdObj.prototype.rnRenameJson = function () {
            var res = _.map(this.rnElements(), function (e) {
                return {
                    old: e.name,
                    'new': e._newName || undefined,
                    props: _.map(e.rnPropsNew(), function (p) { return { old: p.name, 'new': p._newName || undefined }; })
                };
            });
            return JSON.stringify(res).replace(/"/g, '\\"');
        };
        xsdObj.prototype.dcElements = function (isCut) {
            return _.filter(this.rnElements(), function (el) { return isCut == !!xsdObj.cutEls[el.name]; });
        };
        xsdObj.prototype.inheritsFrom = function (self, ancestor) { while (self) {
            if (self == ancestor)
                return true;
            var self = this.types[self].ancestor;
        } return false; };
        xsdObj.prototype.tooglePanel = function (model, ev) {
            var $a = $(ev.currentTarget);
            var $body = $a.parents('.panel').find('.panel-body');
            $body.toggle();
            var isVisible = $body.is(":visible");
            $a.toggleClass('fa-minus', isVisible);
            $a.toggleClass('fa-plus', !isVisible);
        };
        xsdObj.prototype.showProp = function (ev, propOf, prop) {
            alert(propOf + '.' + prop);
        };
        xsdObj.cutEls = { 'cut-dialog': true, 'cut-text': true, 'include-dialog': true, 'include-text': true, 'phrase': true, 'phrase-replace': true, 'replica': true };
        return xsdObj;
    })();
    metaJS.xsdObj = xsdObj;
    var propImpl = (function (_super) {
        __extends(propImpl, _super);
        function propImpl(json) {
            _super.call(this, json);
            this.camelName = Utils.toCammelCase(this.name);
        }
        propImpl.prototype.validateAndAssign = function (value, tag) {
            var trimVal = value.trim();
            delete tag[this.camelName];
            switch (this.type) {
                case metaJS.xsdPropType.Enum:
                    if (this.modifier != metaJS.xsdPropModifier.no)
                        throw 'System error: boolean and modifier';
                    trimVal = trimVal.toLowerCase();
                    var en = this.myEnum();
                    var it = _.find(en.enumData, function (v) { return v.name == trimVal; });
                    if (it) {
                        tag[this.camelName] = it.value;
                        return null;
                    }
                    return 'One from enum value expected';
                case metaJS.xsdPropType.Bool:
                    if (this.modifier != metaJS.xsdPropModifier.no)
                        throw 'System error: boolean and modifier';
                    var isOK = boolVal.test(trimVal = trimVal.toLowerCase());
                    if (isOK) {
                        tag[this.camelName] = trimVal == 'true';
                        return null;
                    }
                    return '[true] or [false] expected';
                case metaJS.xsdPropType.Number:
                    if (this.modifier != metaJS.xsdPropModifier.no)
                        throw 'System error: number and modifier';
                    var isOK = numVal.test(trimVal);
                    if (isOK) {
                        tag[this.camelName] = parseInt(trimVal);
                        return null;
                    }
                    return 'Number expected';
                case metaJS.xsdPropType.String:
                    if (this.modifier == metaJS.xsdPropModifier.no) {
                        switch (this.constrains) {
                            case metaJS.xsdPropConstrains.no:
                                tag[this.camelName] = waEncode.unEscape(value);
                                return null;
                            case metaJS.xsdPropConstrains.idref:
                            case metaJS.xsdPropConstrains.ncname:
                            case metaJS.xsdPropConstrains.id:
                                var isOK = idVal.test(trimVal);
                                if (isOK) {
                                    tag[this.camelName] = trimVal;
                                    return null;
                                }
                                return 'Identifier expected';
                            default: throw 'System error: xsdPropType.String with unknown constrains';
                        }
                    }
            }
            return null;
        };
        propImpl.prototype.myEnum = function () {
            if (this.type != metaJS.xsdPropType.Enum)
                throw 'metaJS.propImpl.Enum: this.type != xsdPropType.Enum';
            return metaJS.metaObj.enums[this.clsEnumName];
        };
        return propImpl;
    })(implLow);
    metaJS.propImpl = propImpl;
    var boolVal = /^(true)|(false)$/i;
    var numVal = /^\d+$/;
    var idVal = /^\s*[a-z][\w-]*\s*$/i;
    metaJS.metaObj = new xsdObj(metaJS.metaData);
})(metaJS || (metaJS = {}));

var waObjs;
(function (waObjs) {
    (function (markType) {
        markType[markType["no"] = 0] = "no";
        markType[markType["spanOpen"] = 1] = "spanOpen";
        markType[markType["spanClose"] = 2] = "spanClose";
        markType[markType["inline"] = 3] = "inline";
        markType[markType["style"] = 4] = "style";
        markType[markType["blockPtr"] = 5] = "blockPtr";
        markType[markType["caret"] = 6] = "caret";
        //pro property editor
        markType[markType["propName"] = 7] = "propName";
        markType[markType["propEq"] = 8] = "propEq";
        markType[markType["propValue"] = 9] = "propValue";
    })(waObjs.markType || (waObjs.markType = {}));
    var markType = waObjs.markType;
    var viewmarkLow = (function () {
        function viewmarkLow(owner, type, start, end) {
            this.owner = owner;
            this.type = type;
            this.start = start;
            this.end = end;
        }
        viewmarkLow.prototype.classes = function () {
            if (this.errorMsg)
                return 'error';
            switch (this.type) {
                case markType.spanOpen:
                case markType.spanClose: return 'span';
                case markType.inline: return 'inline';
                case markType.style: return 'style';
                case markType.caret: return '';
                case markType.propValue: return 'prop-value';
                case markType.propName: return 'prop-name';
                default: throw 'not implemented';
            }
        };
        return viewmarkLow;
    })();
    waObjs.viewmarkLow = viewmarkLow;
    var viewmarksLow = (function () {
        function viewmarksLow(text, view) {
            this.text = text;
            this.view = view;
            this.escaped = waEncode.escape(text);
        }
        viewmarksLow.prototype.finishConstructor = function () {
            this.marks = this.parseBrackets();
            if (this.marks)
                this.marks = _.sortBy(this.marks, function (m) { return m.end > m.start ? m.start * 2 : m.start * 2 - 0.5; });
        };
        viewmarksLow.prototype.hasError = function () { return _.any(this.marks, function (m) { return !!m.errorMsg; }); };
        //najde mark a jeji index, obsahujici caret. includeStart: do mark se pocita i kurzor pred pocatkem
        viewmarksLow.prototype.findMark = function (pos) {
            if (!this.marks)
                return { mark: null, idx: -1 };
            for (var i = 0; i < this.marks.length; i++) {
                var m = this.marks[i];
                if (m.type == markType.caret || m.errorMsg)
                    continue;
                if (m.start < pos && m.end > pos)
                    return { idx: i, mark: this.marks[i] };
            }
            return { mark: null, idx: -1 };
        };
        viewmarksLow.prototype.renderHTML = function () {
            var html = this.html();
            //console.log(html);
            this.view.html(html);
            if (this.marks)
                _.each(_.zip(this.marks, this.view.find('> span')), function (arr) {
                    arr[0].$self = $(arr[1]);
                    //zip inner spans
                    var inline = (arr[0]);
                    if (inline.type != markType.inline)
                        return;
                    if (inline.marks.marks)
                        _.each(_.zip(inline.marks.marks, inline.$self.find('> span')), function (arr) { return arr[0].$self = $(arr[1]); });
                });
        };
        viewmarksLow.prototype.insertCaretMark = function (pos) {
            var m = new waObjs.caretMark(this, pos);
            if (!this.marks)
                this.marks = [];
            else
                this.marks = _.filter(this.marks, function (m) { return m.type != markType.caret; });
            this.marks.push(m);
            this.renderHTML();
            return m;
        };
        viewmarksLow.prototype.html = function () { throw 'not implemented'; };
        viewmarksLow.prototype.parseBrackets = function () { throw 'not implemented'; };
        return viewmarksLow;
    })();
    waObjs.viewmarksLow = viewmarksLow;
})(waObjs || (waObjs = {}));

var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var metaJS;
(function (metaJS) {
    //******************* propEditor marks
    var viewmarks = (function (_super) {
        __extends(viewmarks, _super);
        function viewmarks(tag /*napr. gap-fill*/, text /*napr. id=gp1; smart-width=sm1; */ /*, view: JQuery*/) {
            var _this = this;
            _super.call(this, text, null);
            this.tag = tag;
            this.propDir = metaJS.metaObj.types[this.tag].propDir;
            this.props = metaJS.metaObj.types[this.tag].props;
            this.finishConstructor();
            this.json = { _tg: this.tag };
            if (this.hasError())
                return;
            var props = _.filter(this.marks, function (m) { return m.type == waObjs.markType.propName; });
            var checkUniq = {}; //pro check unique prop names
            _.each(props, function (p) {
                if (checkUniq[p.prop.name]) {
                    p.errorMsg = 'Duplicated attribute name: ' + p.prop.name;
                    return;
                }
                checkUniq[p.prop.name] = p;
                p.value.errorMsg = p.prop.validateAndAssign(p.value.value, _this.json);
                if (p.value.errorMsg)
                    return;
            });
        }
        viewmarks.prototype.html = function () {
            var text = this.text;
            if (this.marks == null)
                return text;
            var sb = [];
            var lastPos = 0;
            _.each(this.marks, function (m) {
                if (m.start < lastPos)
                    throw 'm.start < lastPos';
                if (m.start > lastPos)
                    sb.push(text.substring(lastPos, m.start));
                var isFake = m.type == waObjs.markType.propEq;
                if (!isFake) {
                    sb.push('<span class="');
                    sb.push(m.classes());
                    sb.push('">');
                }
                sb.push(text.substring(m.start, m.end));
                if (!isFake)
                    sb.push('</span>');
                lastPos = m.end;
            });
            if (lastPos < text.length)
                sb.push(text.substr(lastPos));
            return sb.join('');
        };
        viewmarks.prototype.hasSeriousError = function () { return _.any(this.marks, function (m) { return !!m.errorMsg && m.type != waObjs.markType.propName && m.type != waObjs.markType.propValue; }); };
        viewmarks.prototype.parseBrackets = function () {
            var txt = this.text;
            if (_.isEmpty(txt))
                return null;
            var match;
            var lastPos = 0;
            var res = [];
            while (match = nameValueMask.exec(this.escaped)) {
                var m = match.index;
                var m1 = match[1].length;
                var m2 = match[2].length;
                var m3 = match[3].length;
                var m4 = match[4].length;
                var m5 = match[5].length;
                var name = new nameMark(this, m + m1, m + m1 + m2);
                viewmark.createEqMark(res, this, m + m1 + m2 + m3, m + m1 + m2 + m3 + m4);
                var value = new valueMark(this, m + m1 + m2 + m3 + m4, m + m1 + m2 + m3 + m4 + m5);
                name.value = value;
                value.name = name; //name.before = before; name.after = after; 
                res.push(name);
                res.push(value);
                if (lastPos < match.index)
                    viewmark.createErrorMark(res, this, lastPos, match.index, 'Wrong format, [attribute name] expected');
                lastPos = match.index + match[0].length;
            }
            if (lastPos < txt.trim().length)
                viewmark.createErrorMark(res, this, lastPos, txt.length, 'Wrong format, [attribute name]=[value] expected.');
            res = _.sortBy(res, function (m) { return m.start; });
            return res;
        };
        return viewmarks;
    })(waObjs.viewmarksLow);
    metaJS.viewmarks = viewmarks;
    var nameValueMask = /(\s*)([\w-]*)(\s*)(=)([^;]*);?/g;
    var viewmark = (function (_super) {
        __extends(viewmark, _super);
        function viewmark() {
            _super.apply(this, arguments);
        }
        viewmark.createErrorMark = function (res, owner, start, end, errorMsg) {
            var m = new viewmark(owner, waObjs.markType.no, start, end);
            m.errorMsg = errorMsg;
            res.push(m);
        };
        viewmark.createEqMark = function (res, owner, start, end) {
            res.push(new viewmark(owner, waObjs.markType.propEq, start, end));
        };
        return viewmark;
    })(waObjs.viewmarkLow);
    metaJS.viewmark = viewmark;
    var nameMark = (function (_super) {
        __extends(nameMark, _super);
        function nameMark(owner, start, end) {
            _super.call(this, owner, waObjs.markType.propName, start, end);
            var name = owner.text.substring(start, end);
            this.prop = this.owner.propDir[name];
            if (!this.prop)
                this.errorMsg = 'Wrong attribute name: ' + name;
        }
        return nameMark;
    })(viewmark);
    metaJS.nameMark = nameMark;
    var valueMark = (function (_super) {
        __extends(valueMark, _super);
        function valueMark(owner, start, end) {
            _super.call(this, owner, waObjs.markType.propValue, start, end);
            this.value = owner.text.substring(start, end);
        }
        return valueMark;
    })(viewmark);
    metaJS.valueMark = valueMark;
})(metaJS || (metaJS = {}));

var waEncode;
(function (waEncode) {
    //**************** Escape, bracket content encoding, ...
    function escape(s) {
        if (_.isEmpty(s))
            return s;
        var res = [];
        var encodeNext = false;
        for (var i = 0; i < s.length; i++) {
            var ch = s.charAt(i);
            if (encodeNext) {
                encodeNext = false;
                if (ch == '\n') {
                    res.push(escapeChar + ch);
                    continue;
                }
                res.push(escapeFlag);
                var idx = ch.charCodeAt(0);
                if (idx > waEncode.s2Max - waEncode.s2)
                    throw 'idx > s2Max - s2';
                res.push(String.fromCharCode(waEncode.s2 + idx));
                continue;
            }
            if (ch != escapeChar) {
                res.push(ch);
                continue;
            }
            encodeNext = true;
        }
        return res.join('');
    }
    waEncode.escape = escape;
    function unEscape(s) {
        if (_.isEmpty(s))
            return s;
        var res = [];
        var encodeNext = false;
        for (var i = 0; i < s.length; i++) {
            var ch = s.charAt(i);
            if (encodeNext) {
                encodeNext = false;
                var idx = ch.charCodeAt(0);
                res.push(String.fromCharCode(idx - waEncode.s2));
                continue;
            }
            if (ch != escapeFlag) {
                res.push(ch);
                continue;
            }
            encodeNext = true;
        }
        return res.join('');
    }
    waEncode.unEscape = unEscape;
    var escapeFlag = '\u167F';
    var escapeChar = '\\';
    waEncode.s1 = 0x1400;
    waEncode.s1Max = 0x15FF;
    var s1First = '\u1400';
    var s1Last = '\u15FF';
    waEncode.s2 = 0x4E00;
    waEncode.s2Max = 0x9FCC;
    var s2First = '\u4E00';
    var s2Last = '\u9FCC';
    var lowerMask = 0x000001ff;
    var fill = '≡';
    function firstCode(sb, idx) { sb.push(String.fromCharCode(waEncode.s1 + (idx & lowerMask))); }
    function secondCode(sb, idx) { sb.push(String.fromCharCode(waEncode.s2 + (idx >> 9))); }
    function encode(sb, idx, length) {
        firstCode(sb, idx);
        secondCode(sb, idx);
        for (var i = 0; i < length; i++)
            sb.push(fill);
    }
    waEncode.encode = encode;
    function decode(ch1, ch2) {
        return ch1 - waEncode.s1 + ((ch2 - waEncode.s2) << 9);
    }
    waEncode.decode = decode;
    //*********** styleParams
    var styleParams = (function () {
        function styleParams() {
            this.attrs = {};
            this.values = [];
        }
        styleParams.prototype.id = function () { return !this.ids || this.ids.length == 0 ? null : this.ids[0]; };
        styleParams.prototype.fillParValue = function (parVal, trim) {
            if (trim === void 0) { trim = true; }
            var match = waEncode.inlineParsMask.exec(parVal);
            if (!match)
                return;
            var par = match[1];
            this.valStr = match[2];
            this.fillPar(par);
            this.values = !this.valStr ? [] : _.map(this.valStr.split('|'), function (v) { return unEscape(trim ? v.trim() : v); });
            return this;
        };
        styleParams.prototype.fillPar = function (par, trim) {
            var _this = this;
            if (trim === void 0) { trim = true; }
            if (_.isEmpty(par))
                return this;
            var kvs = _.map(par.replace(/[\n\s;]+$/, "").split(';'), function (p) {
                var idx = p.indexOf('=');
                return idx < 0 ? [p] : [p.substring(0, idx), p.substr(idx + 1)];
            });
            var ids = kvs[0][0].trim().split(/\s+/);
            if (kvs.length > 1 || kvs[0].length > 1) {
                kvs[0][0] = ids[ids.length - 1];
                this.ids = ids.slice(0, ids.length - 1);
                _.each(kvs, function (kv) { return _this.attrs[kv[0].trim()] = unEscape(trim && kv[1] ? kv[1].trim() : kv[1]); });
            }
            else
                this.ids = ids;
            return this;
        };
        return styleParams;
    })();
    waEncode.styleParams = styleParams;
    waEncode.inlineParsMask = /^(?:\((.*?)\))?(?:\s(.*))?$/;
    var inlineParams = (function () {
        function inlineParams(parVal) {
            this.values = [];
            var match = waEncode.inlineParsMask.exec(parVal);
            if (!match)
                return;
            this.pars = match[1];
            var valStr = this.vals = match[2];
            this.values = !valStr ? [] : _.map(valStr.split('|'), function (v) { return unEscape(v); });
        }
        return inlineParams;
    })();
    waEncode.inlineParams = inlineParams;
})(waEncode || (waEncode = {}));

var waObjs;
(function (waObjs) {
    //************* interfaces *****************
    (function (itemType) {
        itemType[itemType["text"] = 0] = "text";
        itemType[itemType["block"] = 1] = "block";
        itemType[itemType["rootBlock"] = 2] = "rootBlock";
    })(waObjs.itemType || (waObjs.itemType = {}));
    var itemType = waObjs.itemType;
    var IItemProps = ['type'];
    waObjs.ITextProps = ['text'].pushArray(IItemProps);
    waObjs.IBlockProps = ['name', 'pars'].pushArray(IItemProps);
    //************* ITEM *****************
    var item = (function () {
        function item(json, $parent, parent) {
            this.parent = parent;
            this.selfProps = IItemProps; //property names pro JSON serializaci. Serializuji se pouze tyto props, ostatni se ignoruji. Virtualni dato, pouzito v getJSONObject();
            if (!json)
                return;
            this.root = parent ? parent.root : this;
            if (json)
                for (var p in json)
                    this[p] = json[p];
            this.$self = $(this.toHTMLString());
            this.$self.data('wa', this);
            $parent.append(this.$self);
        }
        item.prototype.toHTMLString = function () { return ''; }; //vrati HTML fragment pro $self
        item.prototype.refreshPropsFromHtml = function () { }; //z HTML prevezme data pro JSON serializaci
        item.prototype.getJSONObject = function (modify) {
            var _this = this;
            if (modify === void 0) { modify = null; }
            if (modify)
                modify();
            var res = {};
            _.each(this.selfProps, function (p) { return res[p] = _this[p]; });
            var chs = this['childs'];
            if (chs)
                res['childs'] = _.map(chs, function (ch) { return ch.getJSONObject(); });
            return res;
        };
        return item;
    })();
    waObjs.item = item;
    //************* test *****************
    function test() {
        $(function () {
            var item = waObjs.block.itemFromJSON(testJson, $('#edit-content'), null);
            //new metaJS.propEditor($('#prop-editor > .sm-text'), 'gap-fill', 'id=gp1; smart-width=sw1');
            //testJson = item.getJSONObject();
            //Utils.longLog(JSON.stringify(testJson, null, 2));
            //$('#edit-content').html('');
            //block.itemFromJSON(testJson, $('#edit-content'), null);
        });
    }
    waObjs.test = test;
    var testJson = {
        type: itemType.rootBlock, name: '', pars: '',
        childs: [
            //{ type: itemType.text, text: '{+gap-fill(id=gp; smart-width=sw1;)}' },
            { type: itemType.text, text: '{+offering(drop-down-mode=discard)}' },
        ]
    };
})(waObjs || (waObjs = {}));

var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var waObjs;
(function (waObjs) {
    var viewmark = (function (_super) {
        __extends(viewmark, _super);
        function viewmark() {
            _super.apply(this, arguments);
        }
        //vlozeni mask na pozici caret
        //static insertSnipset(mask: string, rng: textRange.IRange, self: text): textRange.IRange {
        //  var caretIdx = mask.indexOf('|');
        //  self.setText(self.text.substr(0, rng.start) + mask.replace('|', '') + self.text.substr(rng.start));
        //  self.notifyTextChanged(false);
        //  return <any>{ start: rng.start + caretIdx, end: rng.start + caretIdx };
        //}
        //obaleni selekce {**} zavorkou
        //static surroundSpan(rng: textRange.IRange, self: text): textRange.IRange {
        //  if (self.marks.findMark(rng.start).idx != self.marks.findMark(rng.end).idx) {
        //    return viewmark.insertSnipset('{*| *}', rng, self);
        //  }
        //  self.setText(self.text.substr(0, rng.start) + '{* ' + self.text.substring(rng.start, rng.end) + '*}' + self.text.substr(rng.end));
        //  self.notifyTextChanged(false);
        //  return <any>{ start: rng.start + 2, end: rng.start + 2 };
        //}
        //******* COMPILE ******
        viewmark.prototype.markToTag = function (addCtx) {
            if (this.errorMsg)
                addCtx.addToItems(('*** ERROR: ' + this.errorMsg));
            else
                throw 'not implimented';
        };
        return viewmark;
    })(waObjs.viewmarkLow);
    waObjs.viewmark = viewmark;
    var errorMark = (function (_super) {
        __extends(errorMark, _super);
        function errorMark(owner, start, end) {
            _super.call(this, owner, waObjs.markType.no, start, end);
        }
        return errorMark;
    })(viewmark);
    waObjs.errorMark = errorMark;
    var caretMark = (function (_super) {
        __extends(caretMark, _super);
        function caretMark(owner, start) {
            _super.call(this, owner, waObjs.markType.caret, start, start);
        }
        return caretMark;
    })(viewmark);
    waObjs.caretMark = caretMark;
    var styleMark = (function (_super) {
        __extends(styleMark, _super);
        function styleMark(owner, start, end, text) {
            _super.call(this, owner, waObjs.markType.style, start, end);
            this.data = text.substring(start + 2, end - 1);
        }
        //******* COMPILE ******
        styleMark.prototype.markToTag = function (addCtx) {
        };
        return styleMark;
    })(viewmark);
    waObjs.styleMark = styleMark;
    var spanMark = (function (_super) {
        __extends(spanMark, _super);
        function spanMark(owner, isOpen, start, end, text) {
            _super.call(this, owner, isOpen ? waObjs.markType.spanOpen : waObjs.markType.spanClose, start, end);
            if (isOpen)
                this.data = text.substring(start + 2, end);
        }
        //******* COMPILE ******
        spanMark.prototype.markToTag = function (addCtx) {
            switch (this.type) {
                case waObjs.markType.spanOpen:
                    addCtx.addTag({ _tg: 'span' });
                    break;
                case waObjs.markType.spanClose:
                    addCtx.stack.pop();
                    break;
            }
        };
        return spanMark;
    })(viewmark);
    waObjs.spanMark = spanMark;
    var blockPtrMark = (function (_super) {
        __extends(blockPtrMark, _super);
        function blockPtrMark(owner, myBlock) {
            _super.call(this, owner, waObjs.markType.blockPtr, 0, 1);
            this.myBlock = myBlock;
        }
        //******* COMPILE ******
        blockPtrMark.prototype.markToTag = function (addCtx) {
            _.each(this.myBlock.compileResult, function (t) { return addCtx.addToItems(t); });
        };
        return blockPtrMark;
    })(viewmark);
    waObjs.blockPtrMark = blockPtrMark;
    var viewmarks = (function (_super) {
        __extends(viewmarks, _super);
        function viewmarks(text, view) {
            _super.call(this, text, view);
            this.finishConstructor();
            if (this.view)
                this.renderHTML();
        }
        viewmarks.prototype.html = function () {
            var text = this.text;
            if (this.marks == null)
                return text;
            var sb = [];
            var lastPos = 0;
            _.each(this.marks, function (m) {
                if (m.start < lastPos)
                    throw 'm.start < lastPos';
                if (m.start > lastPos)
                    sb.push(text.substring(lastPos, m.start));
                sb.push('<span class="');
                sb.push(m.classes());
                sb.push('">');
                if (m.type == waObjs.markType.inline)
                    sb.push(m.html);
                else
                    sb.push(text.substring(m.start, m.end));
                sb.push('</span>');
                lastPos = m.end;
            });
            if (lastPos < text.length)
                sb.push(text.substr(lastPos));
            return sb.join('');
        };
        viewmarks.prototype.parseBrackets = function () {
            var _this = this;
            var escaped = this.escaped;
            if (_.isEmpty(escaped))
                return null;
            var match;
            var stack = [];
            var res = [];
            var st = null; //non stack brackets - {!, {+
            var addError = function (start, length, msg) {
                var vm = new errorMark(_this, start, start + length);
                vm.errorMsg = msg;
                res.push(vm);
            };
            while (match = bracketMask.exec(escaped)) {
                var m = match[0];
                if (st && m != '}') {
                    addError(st.start, st.length, 'Bracket not closed');
                    st = null;
                }
                switch (m.substr(0, 2)) {
                    case '{*':
                        var spanBr = new spanMark(this, true, match.index, match.index + m.length, escaped);
                        stack.push(spanBr);
                        res.push(spanBr);
                        break;
                    case '*}':
                        if (stack.length == 0) {
                            addError(match.index, m.length, '* bracket not opened');
                            continue;
                        }
                        var spanBr = stack.pop();
                        var endBr = new spanMark(this, false, match.index, match.index + m.length, null);
                        spanBr.closeBr = endBr;
                        res.push(endBr);
                        break;
                    case '{+':
                    case '{!':
                        st = { type: m[1] == '+' ? waObjs.markType.inline : waObjs.markType.style, start: match.index, length: m.length };
                        break;
                    case '}':
                        if (!st) {
                            addError(match.index, m.length, 'Bracket not opened');
                            continue;
                        }
                        var vm = st.type == waObjs.markType.inline ? new waObjs.inlineMark(this, st.start, st.length, match.index + m.length, escaped) : new styleMark(this, st.start, match.index + m.length, escaped);
                        res.push(vm);
                        st = null;
                        break;
                    case '{':
                        addError(match.index, m.length, 'Wrong open bracket');
                        break;
                }
            }
            _.each(stack, function (bl) { return bl.errorMsg = 'Bracket not closed'; });
            return res;
        };
        return viewmarks;
    })(waObjs.viewmarksLow);
    waObjs.viewmarks = viewmarks;
    var bracketMask = /{\+gap-fill|{\+drop-down|{\+offering|{\+word-selection|{\+\s|{!|{\*[^\s\}]*|\*}|{|}/g;
})(waObjs || (waObjs = {}));

var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var waObjs;
(function (waObjs) {
    var inlineMark = (function (_super) {
        __extends(inlineMark, _super);
        function inlineMark(owner, start, startLen, end, encoded) {
            _super.call(this, owner, waObjs.markType.inline, start, end);
            this.encoded = encoded;
            this.tag = encoded.substr(start + 2, startLen - 2);
            this.marks = new metaJS.viewmarks(this.tag, null); //pro jistotu
            var body = encoded.substring(start + startLen, end - 1);
            var match = inlineParsMask.exec(body);
            if (!match) {
                this.html = encoded;
                if (!_.isEmpty(body.trim()))
                    this.errorMsg = 'Wrong format';
                return;
            }
            var m1 = match[1];
            var m2 = match[2];
            var m3 = match[3];
            var m4 = match[4];
            var m5 = match[5];
            this.html = '{+' + this.tag;
            if (m1) {
                this.html += m1;
                this.parsRng = { start: start + startLen + m1.length, end: start + startLen + m1.length + m2.length };
                if (encoded.substring(this.parsRng.start, this.parsRng.end) != m2)
                    throw 'encoded.substring(this.parsRng.start, this.parsRng.end';
            }
            if (m2) {
                this.marks = new metaJS.viewmarks(this.tag, m2);
                this.html += this.marks.html();
            }
            if (m3)
                this.html += m3;
            if (m4)
                this.html += m4;
            if (m5)
                this.html += m5;
            this.html += '}';
        }
        inlineMark.prototype.markToTag = function (addCtx) {
            if (this.errorMsg)
                return;
            if (this.marks.json)
                addCtx.addToItems(this.marks.json);
        };
        inlineMark.prototype.editAttributeName = function (text, rng, insertSemicolon, name) {
            new waObjs.DlgPropName(text.edit, rng, this.$self, this, function (snipset) { return text.insertSnipset((insertSemicolon ? '; ' : '') + snipset, rng); });
        };
        inlineMark.prototype.keyDown = function (text, rng, ev) {
            var parsRng = this.parsRng;
            if (!parsRng || rng.start < parsRng.start || rng.end > parsRng.end)
                return waObjs.keyDownResult.no;
            //typ klavesy
            var isEq = waObjs.isEq(ev.keyCode);
            var isSemicolon = waObjs.isSemicolon(ev.keyCode);
            var isBracket = ev.keyCode == waObjs.key.openBracket;
            if (!isEq && !isSemicolon && !isBracket)
                return waObjs.keyDownResult.no;
            //isBracket a prazdna zavorka
            if (isBracket && (!this.marks.marks || this.marks.marks.length == 0)) {
                this.editAttributeName(text, rng, false, null);
                return waObjs.keyDownResult.false;
            }
            var pos = rng.start - this.parsRng.start;
            //*********************** '=;'
            if (isEq || isSemicolon) {
                //spocitej marks jako po dokonceni stisku klavesy
                var futured = this.encoded.substring(parsRng.start, rng.start) + (isEq ? '=' : ';') + this.encoded.substring(rng.start, parsRng.end);
                var act = new metaJS.viewmarks(this.tag, futured);
                if (act.hasSeriousError())
                    return waObjs.keyDownResult.no;
                if (isEq) {
                    //najdi posledni mark pred aktulni EQ mark
                    var nameMark = null;
                    _.find(act.marks, function (m) { if (m.type == waObjs.markType.propName)
                        nameMark = m; return m.type == waObjs.markType.propEq && m.start >= pos; });
                    if (!nameMark)
                        throw 'Something wrong: !mark';
                    alert('select value');
                }
                else {
                    this.editAttributeName(text, rng, true, null);
                }
                return waObjs.keyDownResult.false;
            }
            //*********************** '{'
            var act = this.marks;
            if (act.hasSeriousError())
                return waObjs.keyDownResult.no;
            //find act mark
            var nameMark = null;
            var valueMark = null;
            _.find(act.marks, function (m) {
                if (m.type == waObjs.markType.propName) {
                    nameMark = m;
                    valueMark = null;
                }
                else if (m.type == waObjs.markType.propValue) {
                    nameMark = null;
                    if (m.start <= pos && m.end >= pos) {
                        valueMark = m;
                        return true;
                    }
                }
                return m.end > pos;
            });
            if (nameMark != null)
                new waObjs.DlgEditInline(text.edit, rng, this.$self, this, function () { return null; });
            else if (valueMark != null)
                alert('edit value');
            else
                this.editAttributeName(text, rng, false, nameMark);
            return waObjs.keyDownResult.false;
        };
        return inlineMark;
    })(waObjs.viewmark);
    waObjs.inlineMark = inlineMark;
    var inlineParsMask = /^(?:(\()([^\)]*)(\)))?(?:(\s)(.*))?$/;
})(waObjs || (waObjs = {}));

var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var waObjs;
(function (waObjs) {
    (function (keyDownResult) {
        keyDownResult[keyDownResult["no"] = 0] = "no";
        keyDownResult[keyDownResult["true"] = 1] = "true";
        keyDownResult[keyDownResult["false"] = 2] = "false";
    })(waObjs.keyDownResult || (waObjs.keyDownResult = {}));
    var keyDownResult = waObjs.keyDownResult;
    //export interface editorLow {
    //  $self: JQuery;
    //  edit: JQuery;
    //  view: JQuery;
    //  text: string;
    //}
    //export function editorConstructor(self: editorLow) {
    //  self.edit = self.$self.find('> textarea');
    //  var pre = self.$self.find('> pre');
    //  self.view = pre.find('> span');
    //}
    //************* TEXT *****************
    var text = (function (_super) {
        __extends(text, _super);
        //escaped: string;
        function text(data, $parent, parent) {
            _super.call(this, data, $parent, parent);
            this.selfProps = waObjs.ITextProps;
            this.lastRefresh = 0;
            if (!data)
                return;
            var self = this;
            self.edit = self.$self.find('> textarea');
            var pre = self.$self.find('> pre');
            self.view = pre.find('> span');
            if (bowser.agent.msie) {
                self.edit.css('whiteSpace', 'pre');
                self.view.css('whiteSpace', 'pre');
                pre.css('whiteSpace', 'pre');
            }
            //http://stackoverflow.com/questions/2823733/textarea-onchange-detection
            self.edit.on('input onpropertychange', function () {
                self.text = self.edit.val();
                //self.setText();
                self.notifyTextChanged(true);
            });
            self.edit.on("keydown", function (ev) {
                //IE hack: DEL a BACKSPACE se nevola v on('input onpropertychange')
                if (bowser.agent.msie && (ev.keyCode == key.k_delete || ev.keyCode == key.backspace)) {
                    setTimeout(function () { return self.notifyTextChanged(true); }, 1);
                    return;
                }
                var rng = textRange.getRange(self.edit); //text a range
                if (rng.start > 0 && self.text[rng.start - 1] == '\\')
                    return true; // '\<any>' => continue
                var mark = self.marks.findMark(rng.start).mark; //mark ve ktere je caret
                if (mark != null && mark.type == waObjs.markType.inline && rng.start == rng.end) {
                    var res = mark.keyDown(self, rng, ev); //inline pars editor
                    switch (res) {
                        case keyDownResult.true: return true;
                        case keyDownResult.false: return false;
                        default: break; //continue procesing
                    }
                }
                if (ev.keyCode != key.openBracket)
                    return true;
                //edit or insert?
                if (mark == null)
                    mark = self.marks.insertCaretMark(rng.start); //neni => vloz a vrat specialni caret mark
                if (mark.type != waObjs.markType.caret) {
                    alert('Edit todo');
                }
                else {
                    new waObjs.DlgOpenBracket(self.edit, rng, mark.$self, function ($btn) {
                        //dlgOpenBracket.showForText(self.edit, rng, mark.$self,($btn: JQuery) => {
                        var dlgRes = ($btn.data('dlgRes'));
                        var parts = dlgRes.split(':');
                        var grp = parts[0];
                        var grpItem = parts[1];
                        if (grp == 'inline' || grp == 'style' || (grp == 'span' && rng.start == rng.end)) {
                            return self.insertSnipset($btn.data('sm-gen'), rng);
                        }
                        else if (grp == 'span') {
                            return self.surroundSpan(rng);
                        }
                        else if (grp == 'block') {
                            self.parent.insert(self, rng, self.text, grpItem); //vloz block
                        }
                        else
                            throw 'not implemented';
                        return null;
                    });
                }
                return false;
            });
            self.notifyTextChanged(false);
        }
        text.prototype.setText = function (text) {
            if (text === void 0) { text = null; }
            if (text != null)
                this.edit.val(text);
            else
                text = this.edit.val();
            this.text = text;
            this.marks = new waObjs.viewmarks(text, this.view);
        };
        text.prototype.toHTMLString = function () {
            return '<div class="sm-text"><textarea>' + this.text + '</textarea><pre class="sm-view"><span></span><br /></pre></div>';
        };
        text.prototype.notifyTextChanged = function (inUserAction) {
            var self = this;
            if (self.refreshTimer) {
                clearTimeout(self.refreshTimer);
                self.refreshTimer = 0;
            }
            if (!inUserAction || self.text.length < 400) {
                self.setText();
                self.lastRefresh = new Date().getTime();
                self.root.notifyDataChanged();
                return;
            }
            var now = new Date().getTime();
            if (self.lastRefresh == 0 || now - self.lastRefresh < text.updateSpeed) {
                self.setText();
                self.lastRefresh = now;
                self.root.notifyDataChanged();
                return;
            }
            self.refreshTimer = setTimeout(function () {
                clearTimeout(self.refreshTimer);
                self.refreshTimer = 0;
                self.lastRefresh = new Date().getTime();
                self.setText();
                self.root.notifyDataChanged();
            }, text.updateSpeed);
        };
        //vlozeni mask na pozici caret
        text.prototype.insertSnipset = function (mask, rng) {
            var self = this;
            var caretIdx = mask.indexOf('|');
            self.setText(self.text.substr(0, rng.start) + mask.replace('|', '') + self.text.substr(rng.start));
            self.notifyTextChanged(false);
            return { start: rng.start + caretIdx, end: rng.start + caretIdx };
        };
        //obaleni selekce {**} zavorkou
        text.prototype.surroundSpan = function (rng) {
            var self = this;
            if (self.marks.findMark(rng.start).idx != self.marks.findMark(rng.end).idx) {
                return self.insertSnipset('{*| *}', rng);
            }
            self.setText(self.text.substr(0, rng.start) + '{* ' + self.text.substring(rng.start, rng.end) + '*}' + self.text.substr(rng.end));
            self.notifyTextChanged(false);
            return { start: rng.start + 2, end: rng.start + 2 };
        };
        text.updateSpeed = 500;
        return text;
    })(waObjs.item);
    waObjs.text = text;
    //http://www.javascripter.net/faq/keycodes.htm
    (function (key) {
        key[key["backspace"] = 8] = "backspace";
        key[key["tab"] = 9] = "tab";
        key[key["enter"] = 13] = "enter";
        key[key["shift"] = 16] = "shift";
        key[key["ctrl"] = 17] = "ctrl";
        key[key["alt"] = 18] = "alt";
        key[key["pause"] = 19] = "pause";
        key[key["capsLock"] = 20] = "capsLock";
        key[key["escape"] = 27] = "escape";
        key[key["pageUp"] = 33] = "pageUp";
        key[key["pageDown"] = 34] = "pageDown";
        key[key["end"] = 35] = "end";
        key[key["home"] = 36] = "home";
        key[key["leftArrow"] = 37] = "leftArrow";
        key[key["upArrow"] = 38] = "upArrow";
        key[key["rightArrow"] = 39] = "rightArrow";
        key[key["downArrow"] = 40] = "downArrow";
        key[key["insert"] = 45] = "insert";
        key[key["k_delete"] = 46] = "k_delete";
        key[key["k_0"] = 48] = "k_0";
        key[key["k_1"] = 49] = "k_1";
        key[key["k_2"] = 50] = "k_2";
        key[key["k_3"] = 51] = "k_3";
        key[key["k_4"] = 52] = "k_4";
        key[key["k_5"] = 53] = "k_5";
        key[key["k_6"] = 54] = "k_6";
        key[key["k_7"] = 55] = "k_7";
        key[key["k_8"] = 56] = "k_8";
        key[key["k_9"] = 57] = "k_9";
        key[key["a"] = 65] = "a";
        key[key["b"] = 66] = "b";
        key[key["c"] = 67] = "c";
        key[key["d"] = 68] = "d";
        key[key["e"] = 69] = "e";
        key[key["f"] = 70] = "f";
        key[key["g"] = 71] = "g";
        key[key["h"] = 72] = "h";
        key[key["i"] = 73] = "i";
        key[key["j"] = 74] = "j";
        key[key["k"] = 75] = "k";
        key[key["l"] = 76] = "l";
        key[key["m"] = 77] = "m";
        key[key["n"] = 78] = "n";
        key[key["o"] = 79] = "o";
        key[key["p"] = 80] = "p";
        key[key["q"] = 81] = "q";
        key[key["r"] = 82] = "r";
        key[key["s"] = 83] = "s";
        key[key["t"] = 84] = "t";
        key[key["u"] = 85] = "u";
        key[key["v"] = 86] = "v";
        key[key["w"] = 87] = "w";
        key[key["x"] = 88] = "x";
        key[key["y"] = 89] = "y";
        key[key["z"] = 90] = "z";
        key[key["leftWindow"] = 91] = "leftWindow";
        key[key["rightWindowKey"] = 92] = "rightWindowKey";
        key[key["select"] = 93] = "select";
        key[key["numpad0"] = 96] = "numpad0";
        key[key["numpad1"] = 97] = "numpad1";
        key[key["numpad2"] = 98] = "numpad2";
        key[key["numpad3"] = 99] = "numpad3";
        key[key["numpad4"] = 100] = "numpad4";
        key[key["numpad5"] = 101] = "numpad5";
        key[key["numpad6"] = 102] = "numpad6";
        key[key["numpad7"] = 103] = "numpad7";
        key[key["numpad8"] = 104] = "numpad8";
        key[key["numpad9"] = 105] = "numpad9";
        key[key["multiply"] = 106] = "multiply";
        key[key["add"] = 107] = "add";
        key[key["subtract"] = 109] = "subtract";
        key[key["decimalPoint"] = 110] = "decimalPoint";
        key[key["divide"] = 111] = "divide";
        key[key["f1"] = 112] = "f1";
        key[key["f2"] = 113] = "f2";
        key[key["f3"] = 114] = "f3";
        key[key["f4"] = 115] = "f4";
        key[key["f5"] = 116] = "f5";
        key[key["f6"] = 117] = "f6";
        key[key["f7"] = 118] = "f7";
        key[key["f8"] = 119] = "f8";
        key[key["f9"] = 120] = "f9";
        key[key["f10"] = 121] = "f10";
        key[key["f11"] = 122] = "f11";
        key[key["f12"] = 123] = "f12";
        key[key["numLock"] = 144] = "numLock";
        key[key["scrollLock"] = 145] = "scrollLock";
        key[key["semiColon"] = 186] = "semiColon";
        key[key["equalSign"] = 187] = "equalSign";
        key[key["comma"] = 188] = "comma";
        key[key["dash"] = 189] = "dash";
        key[key["period"] = 190] = "period";
        key[key["forwardSlash"] = 191] = "forwardSlash";
        key[key["graveAccent"] = 192] = "graveAccent";
        key[key["openBracket"] = 219] = "openBracket";
        key[key["backSlash"] = 220] = "backSlash";
        key[key["closeBracket"] = 221] = "closeBracket";
        key[key["singleQuote"] = 222] = "singleQuote";
    })(waObjs.key || (waObjs.key = {}));
    var key = waObjs.key;
    ;
    function isEq(code) { return bowser.agent.firefox ? code == 61 : code == 187; }
    waObjs.isEq = isEq;
    function isSemicolon(code) { return bowser.agent.firefox ? code == 59 : code == 186; }
    waObjs.isSemicolon = isSemicolon;
})(waObjs || (waObjs = {}));
//if (ch == '{') { //automaticke doplneni } po zapsani {
//  var rng = textRange.getRange(self.edit);
//  if (rng.start > 0 && self.edit.val()[rng.start - 1] == '\\') return true; //\{
//  textRange.replace(self.edit, '{}');
//  textRange.setcursor(self.edit, rng.start + 1);
//  self.notifyTextChanged();
//  return false;
//} else if (ch == '*' || ch == 'x#') { //automaticke doplneni * nebo # po zapsani {* nebo {#
//  var edVal: string = self.edit.val(); var edEscaped = waCompiler.escape(edVal);
//  var rng = textRange.getRange(self.edit);
//  if (rng.start > 0 && edEscaped.substr(rng.start - 1, 2) != '{}') return true; //not {}
//  var newEd = edVal.substr(0, rng.start - 1) + '{' + ch + /*' ' +*/ ch + '}' + edVal.substr(rng.start + 1);
//  self.edit.val(newEd);
//  textRange.setcursor(self.edit, rng.start + 1);
//  self.notifyTextChanged();
//  return false;
//} else if (ch == '#') {
//  var edVal: string = self.edit.val(); var rng = textRange.getRange(self.edit);
//  edVal = edVal.substr(0, rng.start) + setRangeSpan(rng.start, rng.end, '') + edVal.substr(rng.start);
//  self.view.html(edVal);
//  modalOpenBracketInst.show(self, rng, () => {
//    return true;
//  });
//  return false;
//DEL v IE 
//if (bowser.agent.msie)
//  self.edit.on('keypress', ev => {
//    if (ev.keyCode == key.k_delete) self.notifyTextChanged();
//  });
//self.edit.on("focus blur keydown keyup paste click mousedown", ev => {
//self.edit.on('contextmenu', ev => {
//self.edit.trigger('click');
//var span = _.find(this.marks.marks, m => {
//  var off = m.$self.offset(); var w = m.$self.width(); var h = m.$self.height();
//  var res = ev.pageX >= off.left && ev.pageX <= off.left + w && ev.pageY >= off.top && ev.pageY <= off.top + h;
//  return res;
//});
//return false;
//});
/*
//var cloneCSSProperties = [
//  'lineHeight', 'textDecoration', 'letterSpacing',
//  'fontSize', 'fontFamily', 'fontStyle', 'fontVariant',
//  'fontWeight', 'textTransform', 'textAlign',
//  'direction', 'fontSizeAdjust',
//  'wordSpacing', 'wordWrap', 'wordBreak',
//  'whiteSpace',
//];
*/

var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var waObjs;
(function (waObjs) {
    //************* BLOCK *****************
    var block = (function (_super) {
        __extends(block, _super);
        function block(json, $parent, parent) {
            _super.call(this, json, $parent, parent);
            this.selfProps = waObjs.IBlockProps; //pro JSON serializaci
            if (!json)
                return;
            this.appendChilds(this.myChildPlaceHolder());
        }
        block.prototype.appendChilds = function (placeHolder) {
            var chs = this.childs;
            if (!chs)
                return;
            for (var i = 0; i < chs.length; i++)
                chs[i] = block.itemFromJSON((chs[i]), placeHolder, this);
        };
        block.itemFromJSON = function (json, $parent, parent) {
            switch (json.type) {
                case waObjs.itemType.text:
                    return new waObjs.text(json, $parent, parent);
                    break;
                case waObjs.itemType.block:
                    return new block(json, $parent, parent);
                    break;
                case waObjs.itemType.rootBlock:
                    return new rootBlock(json, $parent, parent);
                    break;
                default: throw "";
            }
        };
        block.prototype.toHTMLString = function () {
            return '<div class="sm-block"><div class="sm-block-header">' +
                '<span class="sm-block-name sm-edit-block-lnk">{#' + this.name.toUpperCase() + (this.pars ? '</span><span class="sm-block-par"> ' + this.pars + '</span>' : '') +
                '</div><div class="sm-block-body"></div><div class="sm-block-footer">' +
                '<span class="sm-block-name">#}</span>' +
                '</div></div>';
        };
        block.prototype.myChildPlaceHolder = function () { return this.$self.find('> .sm-block-body'); };
        block.prototype.refreshPropsFromHtml = function () { _.each(this.childs, function (ch) { return ch.refreshPropsFromHtml(); }); };
        block.prototype.buildEditContent = function (modifyProc) {
            this.root.refreshPropsFromHtml(); //prevezmi data z HTML dom
            var newRoot = this.root.getJSONObject(modifyProc);
            this.root.$content.html('');
            block.itemFromJSON(newRoot, this.root.$content, null);
        };
        /************ EDIT BLOCK TREE *************/
        block.prototype.insert = function (self, rng, edVal, blockName) {
            var _this = this;
            if (self.marks.findMark(rng.start).idx != self.marks.findMark(rng.end).idx)
                rng.start = rng.end;
            //data pro nove bloky
            var blText = new waObjs.text();
            blText.type = waObjs.itemType.text;
            blText.text = edVal.substring(rng.start, rng.end);
            var bl = new block();
            bl.name = blockName;
            bl.type = waObjs.itemType.block;
            bl.childs = [blText];
            var txt = new waObjs.text();
            txt.type = waObjs.itemType.text;
            txt.text = edVal.substr(rng.end);
            //strip puvodni blok
            self.setText(edVal.substr(0, rng.start));
            //uprav nahrad self 
            this.buildEditContent(function () {
                var selfIdx = _this.childs.indexOf(self);
                _this.childs.splice(selfIdx + 1, 0, bl, txt);
            });
        };
        block.prototype.delContent = function () {
            var _this = this;
            this.buildEditContent(function () { return _this.childs = []; });
        };
        block.prototype.delBracket = function () {
            var _this = this;
            this.buildEditContent(function () {
                var parChilds = _this.parent.childs;
                var childs = _this.childs;
                var selfIdx = parChilds.indexOf(_this);
                if (selfIdx == 0 || selfIdx == parChilds.length - 1 || parChilds[selfIdx - 1].type != waObjs.itemType.text || parChilds[selfIdx + 1].type != waObjs.itemType.text)
                    throw 'block not between two texts';
                if (childs.length > 0 && (childs[0].type != waObjs.itemType.text || childs[childs.length - 1].type != waObjs.itemType.text))
                    throw 'block not starts and ends with text';
                var parRes = [];
                for (var i = 0; i < selfIdx; i++)
                    parRes.push(parChilds[i]);
                for (var i = 0; i < childs.length; i++) {
                    if (i == 0) {
                        var it = (childs[i]);
                        var last = (parRes[parRes.length - 1]);
                        last.text += it.text;
                    }
                    else
                        parRes.push(childs[i]);
                }
                for (var i = selfIdx + 1; i < parChilds.length; i++) {
                    if (i == selfIdx + 1) {
                        var it = (parChilds[i]);
                        var last = (parRes[parRes.length - 1]);
                        last.text += it.text;
                    }
                    else
                        parRes.push(childs[i]);
                }
                _this.parent.childs = parRes;
            });
        };
        block.prototype.delAll = function () {
            var _this = this;
            this.buildEditContent(function () {
                var parChilds = _this.parent.childs;
                var selfIdx = parChilds.indexOf(_this);
                if (selfIdx == 0 || selfIdx == parChilds.length - 1 || parChilds[selfIdx - 1].type != waObjs.itemType.text || parChilds[selfIdx + 1].type != waObjs.itemType.text)
                    throw 'block not between two texts';
                var before = (parChilds[selfIdx - 1]);
                var after = (parChilds[selfIdx + 1]);
                before.text += after.text;
                parChilds.splice(selfIdx, 2);
            });
        };
        return block;
    })(waObjs.item);
    waObjs.block = block;
    //************* ROOT BLOCK *****************
    var rootBlock = (function (_super) {
        __extends(rootBlock, _super);
        function rootBlock(json, $parent, parent) {
            _super.call(this, json, $parent, parent);
            this.parent = parent;
            if (!json)
                return;
            this.$content = $parent;
            this.$content.on('click', '.sm-edit-block-lnk', function (ev) {
                var target = (ev.target);
                var $block = $(target.parentElement.parentElement);
                var bl = ($block.data('wa'));
                new waObjs.DlgEditBlock($(target), function (res) {
                    switch (res) {
                        case 'content':
                            bl.delContent();
                            break;
                        case 'bracket':
                            bl.delBracket();
                            break;
                        case 'both':
                            bl.delAll();
                            break;
                        default: throw 'not implemented';
                    }
                    return null;
                });
            });
        }
        rootBlock.prototype.toHTMLString = function () {
            return '<div class="sm-block-body"></div>';
        };
        rootBlock.prototype.myChildPlaceHolder = function () { return this.$self; };
        rootBlock.prototype.notifyDataChanged = function () {
            var _this = this;
            var self = this;
            if (self.refreshTimer)
                return;
            self.refreshTimer = setTimeout(function () {
                clearTimeout(self.refreshTimer);
                self.refreshTimer = 0;
                waCompile.compile(_this);
                var res = JSON.stringify(_this.compileResult, null, 2);
                $('#preview-content').text(res);
            }, 1);
        };
        return rootBlock;
    })(block);
    waObjs.rootBlock = rootBlock;
})(waObjs || (waObjs = {}));

var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var waObjs;
(function (waObjs) {
    var DlgModelLow = (function () {
        function DlgModelLow(modalId, place, completed) {
            this.modalId = modalId;
            this.place = place;
            this.completed = completed;
            this.btnGrid = []; //button grid pro ovladani by arrow keys
        }
        DlgModelLow.prototype.show = function () {
            this.$mod = render(this.modalId, this);
            this.$mod.modal();
            DlgModelLow.init(this);
            this.$mod.modal('show');
            if (this.btnGrid.length > 0)
                this.btnGrid[0][0].focus();
        };
        DlgModelLow.prototype.btnGridOK = function (btn) { }; //zvoleno grid tlacitko
        DlgModelLow.prototype.hide = function () { this.$mod.modal('hide'); };
        DlgModelLow.prototype.onHide = function () { };
        DlgModelLow.prototype.onInit = function () { };
        DlgModelLow.prototype.onGetResult = function () { };
        DlgModelLow.init = function (dlg) {
            //*** init focus grid
            _.each(dlg.$mod.find('[data-focus-grid]'), function (el) {
                var $el = $(el);
                var d = $el.data('focusGrid').split(':');
                var row = parseInt(d[0]);
                var cell = parseInt(d[1]);
                if (!dlg.btnGrid[row])
                    dlg.btnGrid[row] = [];
                dlg.btnGrid[row][cell] = $el;
            });
            if (dlg.btnGrid.length > 0)
                dlg.btnGridEvents();
            dlg.onInit();
            var self = dlg;
            dlg.$mod.on('show.bs.modal', function () {
                if (!self.place)
                    return;
                self.$mod.css({ 'top': 'auto', 'left': 'auto' }); //inicializace position. Musi byt, jinak se nasledujici position pocita z jiz zmenenych properties
                self.$mod.position({ my: "center top+20", at: 'horizontal ', of: self.place[0], collision: 'flipfit' });
            });
            dlg.$mod.on('shown.bs.modal', function () {
                var bd = $('.modal-backdrop.in');
                bd.on('click', function () { return self.$mod.modal('hide'); });
                if (self.caller) {
                    bd.css({ 'z-index': '1051' });
                    self.$mod.css({ 'z-index': '1061' });
                }
            });
            dlg.$mod.on('hidden.bs.modal', function () {
                self.onHide();
                self.caller = null;
            });
        };
        DlgModelLow.prototype.btnGridEvents = function () {
            var _this = this;
            this.$mod.on('keydown', '[data-focus-grid]', function (ev) {
                var $btn = $((ev.target));
                var d = $btn.data('focusGrid').split(':');
                var row = parseInt(d[0]);
                var cell = parseInt(d[1]);
                //enter
                if (ev.keyCode == waObjs.key.enter) {
                    if ($btn.data('dlgRes')) {
                        _this.btnGridOK($btn);
                        return false;
                    }
                    else
                        return true;
                }
                if (!$btn.data('arrowIgnore')) {
                    switch (ev.keyCode) {
                        case waObjs.key.tab:
                        case waObjs.key.rightArrow:
                            _this.btnGrid[row][cell == _this.btnGrid[row].length - 1 ? 0 : cell + 1].focus();
                            break;
                        case waObjs.key.leftArrow:
                            _this.btnGrid[row][cell == 0 ? _this.btnGrid[row].length - 1 : cell - 1].focus();
                            break;
                        case waObjs.key.downArrow:
                            _this.btnGrid[row == _this.btnGrid.length - 1 ? 0 : row + 1][0].focus();
                            break;
                        case waObjs.key.upArrow:
                            _this.btnGrid[row == 0 ? _this.btnGrid.length - 1 : row - 1][0].focus();
                            break;
                        //case key.enter: if ($btn.data('dlgRes')) this.btnGridOK($btn); break;
                        default: return true;
                    }
                    return false;
                }
            });
            this.$mod.on('click', '[data-dlg-res]', function (ev) {
                var $btn = $((ev.target));
                _this.btnGridOK($btn);
            });
        };
        return DlgModelLow;
    })();
    waObjs.DlgModelLow = DlgModelLow;
    //************* DlgTextModel *****************
    var DlgTextModel = (function (_super) {
        __extends(DlgTextModel, _super);
        function DlgTextModel(modalId, edit, rng, place, completed) {
            _super.call(this, modalId, place, completed);
            this.edit = edit;
            this.rng = rng;
            this.rng = rng;
        }
        DlgTextModel.prototype.btnGridOK = function (btn) {
            var rng = this.callCompleted(btn);
            if (rng)
                this.rng = rng;
            var edit = this.edit;
            this.edit = null;
            var completedNotCalled = this.rng.start < 0; //
            if (!completedNotCalled)
                this.recoverRange(edit);
            this.hide();
            if (completedNotCalled)
                this.edit = edit;
        };
        DlgTextModel.prototype.callCompleted = function (btn) {
            return this.completed(btn);
        };
        DlgTextModel.prototype.recoverRange = function (edit) {
            var _this = this;
            if (!edit)
                return;
            setTimeout(function () {
                edit.focus();
                textRange.setRange(edit, _this.rng.start, _this.rng.end - _this.rng.start);
            }, 1);
        };
        DlgTextModel.prototype.onHide = function () {
            this.recoverRange(this.edit);
        };
        return DlgTextModel;
    })(DlgModelLow);
    waObjs.DlgTextModel = DlgTextModel;
    //************* DlgOpenBracket *****************
    var DlgOpenBracket = (function (_super) {
        __extends(DlgOpenBracket, _super);
        function DlgOpenBracket(edit, rng, place, completed) {
            _super.call(this, 'dlg-open-bracket', edit, rng, place, completed);
            this.show();
        }
        return DlgOpenBracket;
    })(DlgTextModel);
    waObjs.DlgOpenBracket = DlgOpenBracket;
    //************* DlgEditBlock *****************
    var DlgEditBlock = (function (_super) {
        __extends(DlgEditBlock, _super);
        function DlgEditBlock(place, completed) {
            _super.call(this, 'dlg-edit-block', place, completed);
            this.show();
        }
        DlgEditBlock.prototype.btnGridOK = function (btn) {
            this.completed(btn.data('dlgRes'));
            this.hide();
        };
        return DlgEditBlock;
    })(DlgModelLow);
    waObjs.DlgEditBlock = DlgEditBlock;
    //************* DlgPropName *****************
    var DlgPropName = (function (_super) {
        __extends(DlgPropName, _super);
        function DlgPropName(edit, rng, place, mark, completed) {
            _super.call(this, 'dlg-prop-name', edit, rng, place, completed);
            this.list = ko.observable();
            this.list(new propName(mark));
            this.show();
        }
        DlgPropName.prototype.callCompleted = function (btn) {
            var prop = (this.list().value().dato);
            if (prop.type == metaJS.xsdPropType.Enum) {
                var self = this;
                setTimeout(function () { return new DlgEnumValue(self.edit, self.rng, self.place, self.list().mark, prop, function (enumItem) { return self.completed(prop.name + '=' + enumItem.name + '|'); }); }, 1);
                return { start: -1, end: -1 };
            }
            else {
                var boolVal = prop.type == metaJS.xsdPropType.Bool ? 'true' : '';
                var snipset = prop.name + '=' + boolVal + '|';
                return this.completed(snipset);
            }
        };
        return DlgPropName;
    })(DlgTextModel);
    waObjs.DlgPropName = DlgPropName;
    //************* DlgEnumValue *****************
    var DlgEnumValue = (function (_super) {
        __extends(DlgEnumValue, _super);
        function DlgEnumValue(edit, rng, place, mark, prop, completed) {
            _super.call(this, 'dlg-enum-value', edit, rng, place, completed);
            this.list = ko.observable();
            this.list(new enumValue(mark, prop));
            this.show();
        }
        DlgEnumValue.prototype.callCompleted = function (btn) {
            return this.completed(this.list().value().dato);
        };
        return DlgEnumValue;
    })(DlgTextModel);
    waObjs.DlgEnumValue = DlgEnumValue;
    //************* DlgEditInline *****************
    var DlgEditInline = (function (_super) {
        __extends(DlgEditInline, _super);
        function DlgEditInline(edit, rng, place, mark, completed) {
            var _this = this;
            _super.call(this, 'dlg-edit-inline', edit, rng, place, completed);
            this.propEditor = ko.observable();
            this.valueEditor = ko.observable();
            var p = new propName(mark, false);
            p.value(null);
            p.selected = function (sel) {
                if (!sel) {
                    _this.valueEditor(null);
                    return;
                }
                _this.valueEditor(new enumValue(p.mark, metaJS.metaObj.types['offering'].propDir['drop-down-mode']));
            };
            this.propEditor(p);
            this.show();
        }
        return DlgEditInline;
    })(DlgTextModel);
    waObjs.DlgEditInline = DlgEditInline;
    //**************** EDITORS MODELS ********************
    var edModel = (function () {
        function edModel(scriptId) {
            this.scriptId = scriptId;
        }
        return edModel;
    })();
    waObjs.edModel = edModel;
    var listModel = (function (_super) {
        __extends(listModel, _super);
        function listModel(scriptId, list) {
            _super.call(this, scriptId);
            this.list = list;
            this.value = ko.observable();
            this.descr = ko.observable();
            this.value(this.list[0]);
        }
        listModel.prototype.changed = function () {
            var sel = this.value();
            if (this.selected)
                this.selected(sel);
            if (!sel)
                return '';
            this.descr((sel.summary ? '<b>' + sel.summary + '</b><br/>' : '') + (sel.descr || ''));
        };
        return listModel;
    })(edModel);
    waObjs.listModel = listModel;
    var propName = (function (_super) {
        __extends(propName, _super);
        function propName(mark, removeUsed) {
            if (removeUsed === void 0) { removeUsed = true; }
            _super.call(this, 'ed-prop-name', propName.getList(mark, removeUsed));
            this.mark = mark;
        }
        propName.getList = function (mark, removeUsed) {
            var usedProps = !removeUsed ? [] : _.map(_.filter(mark.marks.marks, function (m) { return m.type == waObjs.markType.propName; }), function (m) { return m.prop; });
            var okProps = _.filter(metaJS.metaObj.types[mark.tag].props, function (p) { return (p.flag & CourseModel.tgSt.metaJS_browse) != 0 && !_.contains(usedProps, p); });
            return _.map(okProps, function (p) { return { name: p.name, value: p.name, dato: p, summary: p.summary, descr: p.descr }; });
        };
        return propName;
    })(listModel);
    waObjs.propName = propName;
    var enumValue = (function (_super) {
        __extends(enumValue, _super);
        function enumValue(mark, prop) {
            _super.call(this, 'ed-enum', enumValue.getList(prop));
            this.mark = mark;
            this.prop = prop;
        }
        enumValue.getList = function (prop) {
            return _.map(prop.myEnum().enumData, function (en) { return { name: en.name, value: en.name, summary: en.summary, descr: en.descr, dato: en }; });
        };
        return enumValue;
    })(listModel);
    waObjs.enumValue = enumValue;
    //**************** JSRender LIB ********************
    //var templCache: JsTemplate[] = [];
    //export function tmpl(id: string): any {
    //  id = id.toLowerCase();
    //  var tmpl = templCache[id];
    //  if (tmpl == null) {
    //    var t = $('#' + id);
    //    var txt = t.html();
    //    if (!txt) { debugger; throw 'cannot read template ' + id; }
    //    t.remove();
    //    try {
    //      tmpl = $.templates(txt);
    //    } catch (msg) {
    //      alert("cannot compile template " + id);
    //      throw msg;
    //    }
    //    templCache[id] = tmpl;
    //  }
    //  return tmpl;
    //}
    function render(templateId, data) {
        var str = JsRenderTemplateEngine.tmpl(templateId).render(data);
        $('#' + templateId).remove();
        $('body').append($(str));
        var res = $('#' + templateId);
        ko.applyBindings(data, res[0]);
        return res;
    }
    waObjs.render = render;
    ko.nativeTemplateEngine.instance['renderTemplateSource'] = function (template, bindingContext, options) {
        if (_.isEmpty(template))
            return [];
        var data = bindingContext.$data;
        var str = JsRenderTemplateEngine.tmpl(template).render(data);
        return $.parseHTML(str, null, true);
    };
    ko.nativeTemplateEngine.instance['makeTemplateSource'] = function (template, templateDocument) { return _.isString(template) ? template : null; };
})(waObjs || (waObjs = {}));

var waCompile;
(function (waCompile) {
    //rekurzivne:
    //- zakoduje {} zavorky (do pointeru do context.marks)
    //- provede markdown predkompilaci
    //- provede JSON tag rendering (z predkompilace). V nem pri rendering stringu rozleze string a expanduje pointery zpet na JSON tag (context.decodeMarksToTag, pouzita v compRenderTag.ts)
    //- pro kazdy block vse ulozi do block.compileResult
    function compile(block, ctx) {
        if (ctx === void 0) { ctx = null; }
        if (!ctx)
            ctx = new context();
        var sb = [];
        _.each(block.childs, function (ch) {
            if (ch.type != waObjs.itemType.text) {
                compile(ch, ctx); //rekurzivni priprava podrizenych bloku
                ctx.encodeMarkForCompile(new waObjs.blockPtrMark(null, block), sb); //pointer na block
            }
            else {
                ctx.encodeTextBlockForCompile(ch, sb);
            }
        });
        var str = sb.join('');
        //common mark kompilace
        var reader = new commonmark.Parser();
        var parsed = reader.parse(str);
        //common mark render
        block.compileResult = waCompile.compileRenderTag(parsed, ctx);
    }
    waCompile.compile = compile;
    //helper class pro common mark preprocess
    var context = (function () {
        function context() {
            this.marks = [];
        }
        //decode markdown-predkompilovaneho textu
        context.prototype.decodeMarksToTag = function (expandedStr, addCtx) {
            if (_.isEmpty(expandedStr)) {
                addCtx.addToItems(expandedStr);
                return;
            }
            var i = 0;
            var textBuf = [];
            while (i < expandedStr.length) {
                var act = expandedStr.charCodeAt(i);
                var next = i == expandedStr.length - 1 ? 0 : expandedStr.charCodeAt(i + 1);
                if (act >= waEncode.s1 && act <= waEncode.s1Max && next >= waEncode.s2 && next <= waEncode.s2Max) {
                    if (textBuf.length > 0) {
                        addCtx.addToItems((textBuf.join('')));
                        textBuf = [];
                    }
                    var code = this.marks[waEncode.decode(act, next)];
                    i += code.end - code.start + 1;
                    code.markToTag(addCtx);
                }
                else {
                    textBuf.push(expandedStr.charAt(i));
                    i++;
                }
            }
            if (textBuf.length > 0) {
                addCtx.addToItems((textBuf.join('')));
                textBuf = [];
            }
        };
        //encode jedne mark
        context.prototype.encodeMarkForCompile = function (mark, sb) {
            var idx = this.marks.length;
            this.marks.push(mark);
            waEncode.encode(sb, idx, (mark.end - mark.start + 1) - 2);
        };
        //encode text-bloku
        context.prototype.encodeTextBlockForCompile = function (textBlock, sb) {
            var _this = this;
            var marks = textBlock.marks.marks;
            var text = textBlock.text;
            if (marks == null) {
                if (!_.isEmpty(text))
                    sb.push(text);
                return;
            }
            var lastPos = 0;
            _.each(marks, function (m) {
                if (m.start < lastPos)
                    throw 'm.start < lastPos';
                if (m.start > lastPos)
                    sb.push(text.substring(lastPos, m.start));
                //m.encodeMarksForCompile(ctx, sb);
                _this.encodeMarkForCompile(m, sb);
                lastPos = m.end;
            });
            if (lastPos < text.length)
                sb.push(text.substr(lastPos));
        };
        return context;
    })();
    waCompile.context = context;
})(waCompile || (waCompile = {}));

var waCompile;
(function (waCompile) {
    function compileRenderTag(parsedBlocks, ctx) {
        var stack = [];
        var addToItems = function (it) { if (!it)
            return; var tg = stack[stack.length - 1]; if (!tg.Items)
            tg.Items = []; tg.Items.push(it); };
        var addTag = function (name, attrs, selfclosing) {
            var tg = { _tg: name };
            if (attrs && attrs.length > 0) {
                var i = 0;
                var attrib;
                while ((attrib = attrs[i]) !== undefined) {
                    tg[attrib[0]] = attrib[1];
                    i++;
                }
            }
            addToItems(tg);
            if (!selfclosing)
                stack.push(tg);
        };
        var addContext = { addToItems: addToItems, addTag: function (tg) { addToItems(tg); stack.push(tg); }, stack: stack };
        stack.push({ _tg: 'root' });
        var attrs;
        var info_words;
        var tagname;
        var walker = parsedBlocks.walker();
        var event, node;
        var entering;
        //var buffer = "";
        var lastOut = "\n";
        //var disableTags = 0;
        var grandparent;
        //var out = function (s) {
        //  if (disableTags > 0) {
        //    buffer += s.replace(reHtmlTag, '');
        //  } else {
        //    buffer += s;
        //  }
        //  lastOut = s;
        //};
        var options = { sourcepos: true };
        //if (options.time) { console.time("rendering"); }
        //var newOpeningTag: CourseModel.tag;
        while ((event = walker.next())) {
            entering = event.entering;
            node = event.node;
            attrs = [];
            if (options.sourcepos) {
                var pos = node.sourcepos;
                if (pos) {
                    attrs.push(['srcpos', String(pos[0][0]) + ':' +
                            String(pos[0][1]) + '-' + String(pos[1][0]) + ':' +
                            String(pos[1][1])]);
                }
            }
            switch (node.type) {
                case 'Text':
                    ctx.decodeMarksToTag(node.literal, addContext);
                    //addToItems(node.literal);
                    break;
                case 'Softbreak':
                    addToItems('\n');
                    break;
                case 'Hardbreak':
                    addTag('br', null, true);
                    break;
                case 'Emph':
                    if (entering)
                        addTag('em');
                    else
                        stack.pop();
                    break;
                case 'Strong':
                    if (entering)
                        addTag('strong');
                    else
                        stack.pop();
                    break;
                case 'Html':
                    addTag(node.literal.substring(1, node.literal.length - 2), null, true);
                    break;
                case 'Link':
                    if (entering) {
                        attrs.push(['href', node.destination]);
                        if (node.title) {
                            attrs.push(['title', node.title]);
                        }
                        addTag('a', attrs);
                    }
                    else {
                        stack.pop();
                    }
                    break;
                case 'Image':
                    throw 'Html';
                    break;
                case 'Code':
                    addTag('code');
                    addToItems(node.literal);
                    stack.pop();
                    break;
                case 'Document':
                    break;
                case 'Paragraph':
                    grandparent = node.parent.parent;
                    if (grandparent !== null &&
                        grandparent.type === 'List') {
                        if (grandparent.listTight) {
                            break;
                        }
                    }
                    if (entering)
                        addTag('p', attrs);
                    else
                        stack.pop();
                    break;
                case 'BlockQuote':
                    if (entering)
                        addTag('blockquote', attrs);
                    else
                        stack.pop();
                    break;
                case 'Item':
                    if (entering)
                        addTag('li', attrs);
                    else
                        stack.pop();
                    break;
                case 'List':
                    tagname = node.listType === 'Bullet' ? 'ul' : 'ol';
                    if (entering) {
                        var start = node.listStart;
                        if (start !== null && start !== 1) {
                            attrs.push(['start', start.toString()]);
                        }
                        addTag(tagname, attrs);
                    }
                    else {
                        stack.pop();
                    }
                    break;
                case 'Header':
                    tagname = 'h' + node.level;
                    if (entering)
                        addTag(tagname, attrs);
                    else
                        stack.pop();
                    break;
                case 'CodeBlock':
                    info_words = node.info ? node.info.split(/ +/) : [];
                    if (info_words.length > 0 && info_words[0].length > 0) {
                        attrs.push(['class', 'language-' + info_words[0]]);
                    }
                    addTag('pre');
                    addTag('code', attrs);
                    addToItems(node.literal);
                    stack.pop();
                    stack.pop();
                    break;
                case 'HtmlBlock':
                    throw 'HtmlBlock';
                    break;
                case 'HorizontalRule':
                    addTag('hr', null, true);
                    break;
                default:
                    throw "Unknown node type " + node.type;
            }
        }
        return stack[0].Items;
    }
    waCompile.compileRenderTag = compileRenderTag;
})(waCompile || (waCompile = {}));