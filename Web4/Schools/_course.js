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
                var key = _this.licKey();
                key = key.trim();
                try {
                    k = keys.fromString(key);
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
            this.systemAdmin = Login.isSystemAdmin() ? function () { return LMStatus.setReturnUrlAndGoto(oldPrefix + "schoolAdmin" + hashDelim + "schoolAdminModel"); } : null;
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
                            gotoItem: function () { return Pager.navigateToHash(schoolAdmin.getHash(schoolAdmin.compAdminsTypeName, c.Id)); }
                        });
                    if ((c.RoleEx.Role & LMComLib.CompRole.Products) != 0)
                        comp.items.push(it = {
                            id: 'manage_products',
                            title: CSLocalize('fd0acec43f7d487ba635b4a55343b23a', 'Manage products'),
                            gotoItem: function () { return Pager.navigateToHash(schoolAdmin.getHash(schoolAdmin.productsTypeName, c.Id)); }
                        });
                    if ((c.RoleEx.Role & LMComLib.CompRole.Keys) != 0)
                        comp.items.push(it = {
                            id: 'gen_keys',
                            title: CSLocalize('643da9a0b02b4e209e26e20ca620f54c', 'Generate license keys'),
                            gotoItem: function () { return Pager.navigateToHash(schoolAdmin.getHash(schoolAdmin.keyGenTypeName, c.Id)); }
                        });
                    if ((c.RoleEx.Role & LMComLib.CompRole.Department) != 0)
                        comp.items.push(it = {
                            id: 'edit_criteria',
                            title: CSLocalize('9231de5764184fd7a75389aa2ecfdad5', 'Edit Department structure and criteria for tracking study results'),
                            gotoItem: function () { return Pager.navigateToHash(schoolAdmin.getHash(schoolAdmin.editDepartmentTypeName, c.Id)); }
                        });
                    if ((c.RoleEx.Role & LMComLib.CompRole.Results) != 0)
                        comp.items.push(it = {
                            id: 'view_students_results',
                            title: CSLocalize('2fb8a691d86e4f4181dba3f48708a363', 'View Student results'),
                            gotoItem: function () { return Pager.navigateToHash(schoolAdmin.getHash(schoolAdmin.schoolUserResultsTypeName, c.Id)); }
                        });
                    if ((c.RoleEx.Role & LMComLib.CompRole.HumanEvalator) != 0)
                        comp.items.push(it = {
                            id: 'human_eval',
                            title: CSLocalize('f8fce20059f24b5e82b52bd41fef4bd4', 'Evaluate Speaking and Writing skills'),
                            gotoItem: function () { return Pager.navigateToHash(schoolAdmin.getHash(schoolAdmin.humanEvalTypeName, c.Id)); }
                        });
                    if ((c.RoleEx.Role & LMComLib.CompRole.HumanEvalManager) != 0)
                        comp.items.push(it = {
                            id: 'human_eval_manager',
                            title: CSLocalize('e72a70b3d05244759ea5469440921ff2', 'Assign Tests to Evaluators'),
                            gotoItem: function () { return Pager.navigateToHash(schoolAdmin.getHash(schoolAdmin.humanEvalManagerLangsTypeName, c.Id)); }
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
                            gotoItem: function () { return Pager.navigateToHash(schoolAdmin.getHash(schoolAdmin.humanEvalManagerEvsTypeName, c.Id)); }
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
                isVyzvaProduct: CourseMeta.lib.isVyzvaProduct(pr),
                data: crs,
                myCompany: comp,
                gotoUrl: function (dt) {
                    //nove AngularJS produkty
                    if (dt.isVyzvaProduct) {
                        var licenceKeysStr = _.map(crs.LicenceKeys, function (licenceKey) {
                            var parts = licenceKey.split('|');
                            var key = { licId: parseInt(parts[0]), counter: parseInt(parts[1]) };
                            return keys.toString(key);
                        });
                        var ctx = {
                            producturl: blended.encodeUrl(pr.url), companyid: comp.data.Id, loginid: LMStatus.Cookie.id,
                            /*userdataid: LMStatus.Cookie.id,*/ loc: LMComLib.Langs.cs_cz /*Trados.actLang*/, taskid: '', persistence: null,
                            lickeys: licenceKeysStr.join('#')
                        };
                        var hash;
                        switch (pr.url) {
                            case '/lm/blcourse/langmastermanager.product/':
                                hash = blended.root.href(vyzva.stateNames.langmasterManager.name, ctx);
                                break;
                            case '/lm/blcourse/schoolmanager.product/':
                                hash = blended.root.href(vyzva.stateNames.shoolManager.name, ctx);
                                break;
                            default:
                                hash = blended.root.href(blended.prodStates.home.name, ctx);
                                break;
                        }
                        Pager.navigateToHash(hash);
                        return;
                    } //window.location.hash = '/pg/ajs/vyzvaproduct/xxx'; return; }
                    //stare produkty
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
    //Pager.registerAppLocator(schools.appId, schools.tMy, (urlParts, completed) => completed(new schoolMy.Model()));
    schoolMy.myStateName = 'schoolMy_Model'.toLowerCase();
    blended.oldLocators.push(function ($stateProvider) { return blended.registerOldLocator($stateProvider, schoolMy.myStateName, schools.appId, schools.tMy, 0, function (urlParts) { return new schoolMy.Model(); }); });
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
    //Pager.registerAppLocator(schools.appId, schools.tEx, (urlParts, completed) => completed(new ModelEx(urlParts)));
    blended.oldLocators.push(function ($stateProvider) { return blended.registerOldLocator($stateProvider, schools.tEx, schools.appId, schools.tEx, 4, function (urlParts) { return new ModelEx(urlParts); }); });
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
    //Pager.registerAppLocator(schools.appId, schools.tDictInfo, (urlParts, completed) => completed(new DictInfoModel(urlParts)));
    //Pager.registerAppLocator(schools.appId, schools.tGrammFolder, (urlParts, completed) => completed(new GrFolder(urlParts)));
    //Pager.registerAppLocator(schools.appId, schools.tGrammPage, (urlParts, completed) => completed(new GrPage(urlParts)));
    //Pager.registerAppLocator(schools.appId, schools.tGrammContent, (urlParts, completed) => completed(new GrContent(urlParts)));
    blended.oldLocators.push(function ($stateProvider) { return blended.registerOldLocator($stateProvider, schools.tDictInfo, schools.appId, schools.tDictInfo, 4, function (urlParts) { return new DictInfoModel(urlParts); }); });
    blended.oldLocators.push(function ($stateProvider) { return blended.registerOldLocator($stateProvider, schools.tGrammFolder, schools.appId, schools.tGrammFolder, 4, function (urlParts) { return new GrFolder(urlParts); }); });
    blended.oldLocators.push(function ($stateProvider) { return blended.registerOldLocator($stateProvider, schools.tGrammPage, schools.appId, schools.tGrammPage, 4, function (urlParts) { return new GrPage(urlParts); }); });
    blended.oldLocators.push(function ($stateProvider) { return blended.registerOldLocator($stateProvider, schools.tGrammContent, schools.appId, schools.tGrammContent, 4, function (urlParts) { return new GrContent(urlParts); }); });
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
        CourseDataFlag[CourseDataFlag["blPretestItem"] = 16384] = "blPretestItem";
        CourseDataFlag[CourseDataFlag["blLesson"] = 32768] = "blLesson";
        CourseDataFlag[CourseDataFlag["blTest"] = 65536] = "blTest";
        CourseDataFlag[CourseDataFlag["blPretest"] = 131072] = "blPretest";
        CourseDataFlag[CourseDataFlag["blProductHome"] = 262144] = "blProductHome";
        CourseDataFlag[CourseDataFlag["blPretestEx"] = 524288] = "blPretestEx";
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
    CourseModel.meta = { "rootTagName": "tag", "types": { "smart-pairing": { "st": 6, "anc": "smart-element-low", "props": { "random": { "st": 64 }, "left-width": { "enumType": CourseModel.pairingLeftWidth } } }, "smart-offering": { "st": 6, "anc": "smart-element-low", "props": { "words": {}, "mode": { "enumType": CourseModel.smartOfferingMode } } }, "smart-element": { "st": 6, "anc": "smart-element-low", "props": { "inline-type": { "enumType": CourseModel.smartElementTypes } } }, "smart-element-low": { "anc": "macro-template", "props": {} }, "macro-article": { "st": 6, "anc": "macro-template", "props": {} }, "macro-vocabulary": { "st": 6, "anc": "macro-template", "props": {} }, "macro-video": { "st": 6, "anc": "macro-template", "props": { "cut-url": {}, "media-url": {}, "display-style": {} } }, "macro-true-false": { "st": 6, "anc": "macro-template", "props": { "text-id": { "enumType": CourseModel.CheckItemTexts } } }, "macro-single-choices": { "st": 6, "anc": "macro-template", "props": {} }, "macro-list-word-ordering": { "st": 6, "anc": "macro-template", "props": {} }, "macro-pairing": { "st": 6, "anc": "macro-template", "props": {} }, "macro-table": { "st": 6, "anc": "macro-template", "props": { "inline-type": { "enumType": CourseModel.inlineControlTypes } } }, "macro-list": { "st": 6, "anc": "macro-template", "props": { "inline-type": { "enumType": CourseModel.inlineControlTypes } } }, "macro-icon-list": { "st": 6, "anc": "macro-template", "props": { "delim": {}, "is-striped": { "st": 64 }, "icon": { "enumType": CourseModel.listIcon }, "color": { "enumType": CourseModel.colors } } }, "tag": { "st": 384, "props": { "id": { "st": 524288 }, "style-sheet": { "st": 1024 }, "srcpos": { "st": 384 }, "items": { "st": 640 }, "temporary-macro-item": { "st": 1600 }, "class": { "st": 160 }, "class-setter": { "st": 1664 } } }, "smart-tag": { "st": 2180, "anc": "tag", "props": { "correct": { "st": 64 }, "default-inline-type": { "st": 128, "enumType": CourseModel.inlineControlTypes }, "smart-text": { "st": 1536 } } }, "node": { "st": 4228, "anc": "tag", "props": {} }, "text": { "st": 384, "anc": "tag", "props": { "title": {} } }, "error": { "st": 16512, "anc": "tag", "props": { "msg": {} } }, "header-prop": { "st": 36992, "anc": "tag", "props": {} }, "eval-control": { "st": 392, "anc": "tag", "props": { "eval-group": { "st": 524288 }, "score-weight": { "st": 524352 }, "eval-button-id": { "st": 524288 } } }, "body": { "st": 131333, "anc": "tag", "props": { "snd-page": { "st": 640, "childPropTypes": "_snd-page" }, "eval-page": { "st": 640, "childPropTypes": "_eval-page" }, "url": { "st": 384 }, "order": { "st": 64 }, "instr-title": {}, "externals": { "st": 128 }, "see-also-links": {}, "old-ea-is-passive": { "st": 192 }, "is-old-ea": { "st": 192 }, "see-also": { "st": 1664 }, "title": { "st": 1536 }, "body-style": { "st": 1536 }, "instr-body": {}, "see-also-str": { "st": 128 }, "instrs": { "st": 1536 } } }, "eval-button": { "st": 13, "anc": "eval-control", "props": { "score-as-ratio": { "st": 64 } } }, "check-low": { "st": 8, "anc": "eval-control", "props": { "correct-value": { "st": 64 }, "text-type": { "enumType": CourseModel.CheckItemTexts }, "init-value": { "enumType": CourseModel.threeStateBool }, "read-only": { "st": 64 }, "skip-evaluation": { "st": 64 } } }, "check-box": { "st": 13, "anc": "check-low", "props": {} }, "check-item": { "st": 4109, "anc": "check-low", "props": {} }, "offering": { "st": 5, "anc": "tag", "props": { "words": {}, "mode": { "st": 524288, "enumType": CourseModel.offeringDropDownMode }, "hidden": { "st": 524352 } } }, "radio-button": { "st": 4109, "anc": "eval-control", "props": { "correct-value": { "st": 64 }, "init-value": { "st": 64 }, "read-only": { "st": 64 }, "skip-evaluation": { "st": 64 } } }, "single-choice": { "st": 4, "xsdChildElements": "c0_:['radio-button']", "anc": "tag", "props": { "read-only": { "st": 64 }, "skip-evaluation": { "st": 64 }, "score-weight": { "st": 64 }, "eval-button-id": {} } }, "word-selection": { "st": 13, "anc": "eval-control", "props": { "words": {} } }, "word-multi-selection": { "st": 13, "anc": "eval-control", "props": { "words": {} } }, "word-ordering": { "st": 13, "anc": "eval-control", "props": { "correct-order": {} } }, "sentence-ordering": { "st": 13, "xsdChildElements": "c0_:['sentence-ordering-item']", "anc": "eval-control", "props": {} }, "sentence-ordering-item": { "st": 4101, "anc": "tag", "props": {} }, "edit": { "st": 392, "anc": "eval-control", "props": { "correct-value": {}, "width-group": { "st": 524288 }, "width": { "st": 524352 }, "offering-id": { "st": 524288 }, "case-sensitive": { "st": 524352 } } }, "gap-fill": { "st": 13, "anc": "edit", "props": { "hint": { "st": 524288 }, "init-value": {}, "read-only": { "st": 524352 }, "skip-evaluation": { "st": 524352 } } }, "drop-down": { "st": 13, "anc": "edit", "props": { "gap-fill-like": { "st": 524736 } } }, "pairing": { "st": 13, "xsdChildElements": "c0_:['pairing-item']", "anc": "eval-control", "props": { "left-random": { "st": 64 }, "left-width": { "enumType": CourseModel.pairingLeftWidth } } }, "pairing-item": { "st": 4101, "anc": "tag", "props": { "right": {} } }, "human-eval": { "st": 392, "anc": "eval-control", "props": { "is-passive": { "st": 64 } } }, "writing": { "st": 4109, "anc": "human-eval", "props": { "limit-recommend": { "st": 64 }, "limit-min": { "st": 64 }, "limit-max": { "st": 64 }, "number-of-rows": { "st": 64 } } }, "recording": { "st": 4109, "anc": "human-eval", "props": { "limit-recommend": { "st": 64 }, "limit-min": { "st": 64 }, "limit-max": { "st": 64 }, "record-in-dialog": { "st": 64 }, "dialog-header-id": {}, "dialog-size": { "enumType": CourseModel.modalSize }, "single-attempt": { "st": 64 } } }, "macro": { "st": 384, "anc": "tag", "props": {} }, "list": { "st": 4, "xsdChildElements": "c0_:['li']", "anc": "macro", "props": { "delim": {}, "is-striped": { "st": 64 }, "icon": { "enumType": CourseModel.listIcon }, "color": { "enumType": CourseModel.colors } } }, "list-group": { "st": 12293, "anc": "macro", "props": { "is-striped": { "st": 64 } } }, "two-column": { "st": 4101, "anc": "macro", "props": {} }, "panel": { "st": 131077, "xsdChildElements": "s:[{c01: ['header-prop']},{c0_: ['@flowContent']}]", "anc": "macro", "props": { "header": { "st": 640, "childPropTypes": "header-prop" } } }, "_eval-page": { "st": 384, "anc": "tag", "props": { "max-score": { "st": 64 }, "radio-groups-obj": { "st": 1536 }, "radio-groups": {} } }, "_eval-btn": { "st": 384, "anc": "tag", "props": { "btn-id": {} } }, "_eval-group": { "st": 384, "anc": "tag", "props": { "is-and": { "st": 64 }, "is-exchangeable": { "st": 64 }, "eval-control-ids": { "st": 32 }, "max-score": { "st": 1600 } } }, "_snd-page": { "st": 385, "anc": "tag", "props": {} }, "_snd-file-group": { "st": 385, "anc": "url-tag", "props": {} }, "_snd-group": { "st": 385, "anc": "tag", "props": { "intervals": { "st": 1536 }, "sf": { "st": 1536 }, "is-passive": { "st": 1600 } } }, "_snd-interval": { "st": 384, "anc": "tag", "props": {} }, "_snd-sent": { "st": 384, "anc": "tag", "props": { "idx": { "st": 64 }, "beg-pos": { "st": 64 }, "end-pos": { "st": 64 }, "text": {}, "actor": {} } }, "media-text": { "st": 5, "xsdChildElements": "c01: ['include-text','include-dialog','cut-text','cut-dialog']", "anc": "media-tag", "props": { "continue-media-id": { "st": 1024 }, "passive": { "st": 64 }, "is-old-to-new": { "st": 192 }, "hidden": { "st": 64 } } }, "_media-replica": { "st": 389, "anc": "tag", "props": { "icon-id": { "enumType": CourseModel.IconIds }, "dlg-left": { "st": 64 }, "actor": {} } }, "_media-sent": { "st": 131461, "anc": "tag", "props": { "idx": { "st": 64 } } }, "include": { "st": 384, "anc": "tag", "props": { "cut-url": { "st": 262144 } } }, "include-text": { "st": 98304, "xsdChildElements": "c0_:['phrase-replace']", "anc": "include", "props": {} }, "include-dialog": { "st": 98304, "xsdChildElements": "c0_:['phrase-replace']", "anc": "include", "props": {} }, "phrase-replace": { "st": 102400, "anc": "tag", "props": { "phrase-idx": { "st": 64 }, "replica-phrase-idx": {} } }, "_snd-file": { "st": 384, "anc": "url-tag", "props": { "file": { "st": 640, "childPropTypes": "include-text|include-dialog" }, "temp-replicas": { "st": 1536 } } }, "cut-dialog": { "st": 98308, "xsdChildElements": "s:[{c01:['include-text']},{c0_:['replica']}]", "anc": "_snd-file", "props": {} }, "cut-text": { "st": 98308, "xsdChildElements": "c01:[{c01:['include-dialog']},{c0_:['phrase']}]", "anc": "_snd-file", "props": {} }, "phrase": { "st": 102405, "anc": "tag", "props": { "beg-pos": { "st": 64 }, "end-pos": { "st": 64 }, "idx": { "st": 1600 }, "text": { "st": 1536 }, "actor": { "st": 1536 } } }, "replica": { "st": 98309, "xsdChildElements": "c0_:['phrase']", "anc": "tag", "props": { "actor-id": { "enumType": CourseModel.IconIds }, "actor-name": {}, "number-of-phrases": { "st": 64 } } }, "url-tag": { "anc": "tag", "props": { "media-url": { "st": 1024 }, "any-url": { "st": 1536 }, "is-video": { "st": 1600 } } }, "media-tag": { "st": 384, "anc": "url-tag", "props": { "cut-url": { "st": 1024 }, "subset": { "st": 1024 }, "share-media-id": { "st": 1024 }, "_sent-group-id": { "st": 384 }, "file": { "st": 1664, "childPropTypes": "cut-dialog|cut-text|include-text|include-dialog" } } }, "media-big-mark": { "st": 5, "xsdChildElements": "c01: ['include-text','include-dialog','cut-text','cut-dialog']", "anc": "media-tag", "props": {} }, "media-player": { "st": 5, "xsdChildElements": "c01: ['include-text','include-dialog','cut-text','cut-dialog']", "anc": "media-tag", "props": {} }, "media-video": { "st": 5, "xsdChildElements": "c01: ['include-text','include-dialog','cut-text','cut-dialog']", "anc": "media-tag", "props": {} }, "tts-sound": { "st": 133, "anc": "media-tag", "props": { "text": {} } }, "macro-template": { "st": 384, "anc": "macro", "props": { "name": {}, "cdata": {} } }, "inline-tag": { "st": 16388, "anc": "macro-template", "props": { "inline-type": { "enumType": CourseModel.inlineElementTypes } } }, "html-tag": { "st": 384, "anc": "tag", "props": { "tag-name": {}, "attrs": { "st": 384 } } }, "script": { "st": 386, "anc": "tag", "props": { "cdata": {} } }, "img": { "st": 384, "anc": "tag", "props": { "src": {} } }, "extension": { "st": 143, "anc": "eval-control", "props": { "data": {}, "cdata": {} } }, "doc-example": { "st": 133, "xsdChildElements": "s:[{c01: ['header-prop']},{c01: ['doc-descr']},{c0_: ['@flowContent']}]", "anc": "tag", "props": { "todo": { "st": 64 }, "code-listing": {}, "code-post-listing": {}, "header": { "st": 512, "childPropTypes": "header-prop" }, "descr": { "st": 512, "childPropTypes": "doc-descr" }, "eval-btn": { "st": 512, "childPropTypes": "eval-btn" } } }, "drag-target": { "st": 8, "anc": "edit", "props": {} }, "doc-named": { "st": 384, "anc": "tag", "props": { "name": {}, "summary": {}, "cdata": {} } }, "doc-type": { "st": 386, "anc": "doc-named", "props": { "is-html": { "st": 64 }, "is-ign": { "st": 64 }, "descendants-and-self": { "st": 32 }, "my-props": { "st": 32 }, "xref": {} } }, "doc-enum": { "st": 386, "anc": "doc-named", "props": { "xref": {}, "enums": { "st": 544, "childPropTypes": "doc-enum-item" } } }, "doc-enum-item": { "st": 386, "anc": "doc-named", "props": { "xref": {} } }, "doc-prop": { "st": 386, "anc": "doc-named", "props": { "owner-type": {}, "data-type": {}, "xref": {}, "is-html": { "st": 64 } } }, "doc-descr": { "st": 36992, "anc": "tag", "props": {} }, "doc-tags-meta": { "st": 384, "anc": "tag", "props": { "types": { "st": 544, "childPropTypes": "doc-type" }, "props": { "st": 544, "childPropTypes": "doc-prop" }, "enums": { "st": 544, "childPropTypes": "doc-enum" } } } } };
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
        runtimeType[runtimeType["productNew"] = 536870912] = "productNew";
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
    CourseMeta.meta = { "rootTagName": "data", "types": { "data": { "props": { "title": {}, "order": { "st": 1088 }, "url": {}, "line": { "enumType": LMComLib.LineIds }, "type": { "enumType": CourseMeta.runtimeType }, "name": {}, "other": {}, "ms": { "st": 64 }, "allLocs": { "st": 1024 }, "styleSheet": { "st": 1024 }, "parent": { "st": 512 }, "uniqId": { "st": 64 }, "Items": {}, "dataItems": { "st": 1536 }, "spaceId": { "st": 1536 }, "globalId": { "st": 1536 }, "style": { "st": 1536 }, "pathParts": { "st": 1024 } } }, "sitemap": { "anc": "data", "props": {} }, "publisher": { "anc": "data", "props": { "vsNetData": { "st": 1024 }, "publisherRoot": { "st": 1024 } } }, "project": { "anc": "data", "props": { "ftpPassword": {}, "FtpUser": {}, "FtpPassword": { "st": 512 } } }, "ptr": { "anc": "data", "props": { "takeChilds": { "enumType": CourseMeta.childMode }, "skip": { "st": 64 }, "take": { "st": 64 }, "urls": {}, "isGramm": { "st": 64 }, "modify": {} } }, "products": { "anc": "data", "props": {} }, "product": { "anc": "data", "props": { "defaultDictType": { "enumType": CourseMeta.dictTypes }, "defaultLocs": {} } }, "taskTestInCourse": { "anc": "data", "props": {} }, "test": { "anc": "data", "props": { "demoTestUrl": {}, "level": {}, "needs": { "enumType": CourseMeta.testNeeds }, "isDemoTest": { "st": 64 } } }, "mod": { "anc": "data", "props": {} }, "taskCourse": { "anc": "data", "props": {} }, "multiTask": { "anc": "data", "props": {} }, "taskTestSkill": { "anc": "data", "props": { "skill": {}, "minutes": { "st": 64 }, "scoreWeight": { "st": 64 } } }, "dynamicModuleData": { "anc": "data", "props": { "groups": {} } }, "testTaskGroup": { "anc": "data", "props": { "urls": {}, "take": { "st": 64 }, "designTitle": {} } }, "ex": { "anc": "data", "props": { "isOldEa": { "st": 1088 }, "isOldEaPassive": { "st": 1088 }, "instrs": { "st": 1024 } } } } };
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
        tagImpl.prototype.pageCreated = function () {
            this.blended = this._myPage.blendedExtension;
        };
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
            _super.prototype.pageCreated.call(this);
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
            par.rules['human-ed-' + this.id] = { required: true, range: [0, 100], number: true };
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
                ev.result.hPercent = parseInt(ev.human()) / 100 * ev.scoreWeight;
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
        humanEvalControlImpl.prototype.isKBeforeHumanEval = function () { throw 'notimplemented'; };
        humanEvalControlImpl.prototype.setScore = function () {
            this.result.ms = this.scoreWeight;
            if ((this.result.flag & CourseModel.CourseDataFlag.needsEval) == 0 && (this.result.flag & CourseModel.CourseDataFlag.pcCannotEvaluate) != 0) {
                this.result.s = Math.round(this.result.hPercent);
                return;
            }
            var c = this.isKBeforeHumanEval();
            this.result.s = 0;
            //Oprava 9.9.2015 kvuli Blended. 
            //this.result.s = c ? this.scoreWeight : 0;
            if (c) {
                this.result.flag |= CourseModel.CourseDataFlag.needsEval | CourseModel.CourseDataFlag.pcCannotEvaluate;
            }
            else {
                this.result.flag &= ~(CourseModel.CourseDataFlag.needsEval | CourseModel.CourseDataFlag.pcCannotEvaluate) & CourseModel.CourseDataFlag.all;
            }
            //this.result.flag = !c ? 0 : CourseModel.CourseDataFlag.pcCannotEvaluate | CourseModel.CourseDataFlag.needsEval;
        };
        return humanEvalControlImpl;
    })(evalControlImpl);
    Course.humanEvalControlImpl = humanEvalControlImpl;
    function idToElement(id) { return $('#' + id).first(); }
    Course.idToElement = idToElement;
    function finishCreatePage(exImpl) { var page = exImpl.page; page.finishCreatePage(exImpl); return page; }
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

//##GOTO
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
            prodUrl = decodeURIComponent(prodUrl);
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
        function isVyzvaProduct(prod) {
            return prod && CourseMeta.isType(prod, CourseMeta.runtimeType.productNew);
        }
        lib.isVyzvaProduct = isVyzvaProduct;
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
        url = decodeURIComponent(url);
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
    CourseMeta.loadLocalizedProductAndInstrs = loadLocalizedProductAndInstrs;
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
            return this.hrefCompl(CourseMeta.actCompanyId, encodeUrlHash(CourseMeta.actProduct.url), CourseMeta.actProductPersistence);
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
    Utils.applyMixins(dataImpl, []);
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
            //setScore(): void {
            //  if ((this.result.flag & CourseModel.CourseDataFlag.needsEval) == 0 && (this.result.flag & CourseModel.CourseDataFlag.pcCannotEvaluate) != 0) {
            //    this.result.ms = this.scoreWeight;
            //    this.result.s = Math.round(this.result.hPercent);
            //    return;
            //  }
            //  var c = this.limitMin && (this.result.words >= this.limitMin);
            //  //Oprava 9.9.2015 kvuli Blended. 
            //  //this.result.ms = this.scoreWeight;
            //  //this.result.s = c ? this.scoreWeight : 0;
            //  if (c) {
            //    this.result.flag |= CourseModel.CourseDataFlag.needsEval | CourseModel.CourseDataFlag.pcCannotEvaluate;
            //    this.result.ms = this.result.s = 0;
            //  } else {
            //    this.result.flag &= ~(CourseModel.CourseDataFlag.needsEval | CourseModel.CourseDataFlag.pcCannotEvaluate) & CourseModel.CourseDataFlag.all;
            //    this.result.ms = this.scoreWeight; this.result.s = 0;
            //  }
            //  //this.result.flag = !c ? 0 : CourseModel.CourseDataFlag.pcCannotEvaluate | CourseModel.CourseDataFlag.needsEval;
            //}
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
        }
        writingImpl.prototype.createResult = function (forceEval) { this.done(false); return { ms: 0, s: 0, tg: this._tg, flag: CourseModel.CourseDataFlag.needsEval | CourseModel.CourseDataFlag.pcCannotEvaluate, text: null, words: forceEval ? (this.limitMin ? this.limitMin : 0) : 0, hPercent: -1, hEmail: null, hDate: 0, hLmcomId: 0, hLevel: this.acTestLevel(), hRecommendMin: this.limitRecommend, hMax: this.limitMax, hMin: this.limitMin }; };
        writingImpl.prototype.provideData = function () {
            //this.result.text = this.textInput();
            //this.result.humanPercent = this.human();
            //this.result.words = 
        };
        writingImpl.prototype.acceptData = function (done) {
            _super.prototype.acceptData.call(this, done);
            this.textInput(this.result.text ? this.result.text : '');
            this.human(this.result.hPercent < 0 ? '' : this.result.hPercent.toString());
            var tostr = this.limitMax ? ' - ' + this.limitMax.toString() : '';
            this.humanHelpTxt(this.limitRecommend ? this.limitRecommend.toString() + tostr + ' / ' + this.result.words.toString() : '');
            this.humanLevel(this.result.hLevel);
            this.isDone(this.done());
        };
        writingImpl.prototype.isKBeforeHumanEval = function () { return this.limitMin && (this.result.words >= this.limitMin); };
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
            this.blendedCallbackMax = 0;
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
        audioCaptureImpl.prototype.createResult = function (forceEval) {
            this.done(false);
            return {
                ms: 0, s: 0, tg: this._tg, flag: 0,
                audioUrl: createMediaUrl(this.id),
                recordedMilisecs: forceEval ? (this.limitMin ? this.limitMin * 1000 : 0) : 0,
                hPercent: -1, hEmail: null, hDate: 0, hLevel: this.acTestLevel(), hLmcomId: 0, hFrom: this.limitMin, hTo: this.limitMax, hRecommendFrom: this.limitRecommend
            };
        };
        audioCaptureImpl.prototype.provideData = function () {
        };
        audioCaptureImpl.prototype.acceptData = function (done) {
            _super.prototype.acceptData.call(this, done);
            this.isRecorded(this.isRecordLengthCorrect());
            //Aktivni nahravatko:
            var done = this.done();
            if (this.blended) {
                this.isDone(this.blended.isLector || (this.blended.isTest && done)); //pro blended je stale mozne nahravat jen pro lekci nebo nehotovy test
            }
            else
                this.isDone(done && !this.isPassive); //stale je mozne nahravat pro pasivni RECORD kontrolku
            this.human(this.result.hPercent < 0 ? '' : this.result.hPercent.toString());
            var tostr = this.limitMax ? ' - ' + Utils.formatTimeSpan(this.limitMax) : '';
            this.humanHelpTxt(this.limitRecommend ? Utils.formatTimeSpan(this.limitRecommend) + tostr + ' / ' + Utils.formatTimeSpan(Math.round(this.result.recordedMilisecs / 1000)) : '');
            this.humanLevel(this.result.hLevel);
            //CourseModel.CourseDataFlag.needsEval | CourseModel.CourseDataFlag.pcCannotEvaluate
        };
        audioCaptureImpl.prototype.isKBeforeHumanEval = function () { return this.isRecordLengthCorrect(); };
        //setScore(): void {
        //  if ((this.result.flag & CourseModel.CourseDataFlag.needsEval) == 0 && (this.result.flag & CourseModel.CourseDataFlag.pcCannotEvaluate) != 0) {
        //    this.result.ms = this.scoreWeight;
        //    this.result.s = Math.round(this.result.hPercent);
        //    return;
        //  }
        //  var c = this.isRecordLengthCorrect();
        //  //Oprava 9.9.2015 kvuli Blended. 
        //  //this.result.ms = this.scoreWeight;
        //  //this.result.s = c ? this.scoreWeight : 0;
        //  if (c) {
        //    this.result.flag |= CourseModel.CourseDataFlag.needsEval | CourseModel.CourseDataFlag.pcCannotEvaluate | CourseModel.CourseDataFlag.hasExternalAttachments;
        //    this.result.ms = this.result.s = 0;
        //  } else {
        //    this.result.flag &= ~(CourseModel.CourseDataFlag.needsEval | CourseModel.CourseDataFlag.pcCannotEvaluate | CourseModel.CourseDataFlag.hasExternalAttachments) & CourseModel.CourseDataFlag.all;
        //    this.result.ms = this.scoreWeight; this.result.s = 0;
        //  }
        //}
        audioCaptureImpl.prototype.isRecordLengthCorrect = function () { return this.result.recordedMilisecs > 0 && (!this.limitMin || (this.result.recordedMilisecs >= this.limitMin * 1000)); }; //pro 0 x 1 score
        //isHumanEvalMode(): boolean {
        //  if (!this._myPage.blendedPageCallback) return super.isHumanEvalMode();
        //  return this._myPage.blendedPageCallback.isHumanEvalMode();
        //}
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
            //if (!cfg.noAngularjsApp) return;
            //this.doProvideData();
            //this._myPage.result.userPending = true;
            //CourseMeta.lib.saveProduct($.noop);
            //angularJS
            if (this.blended)
                this.blended.recorder.onRecorder(this._myPage, this.result.recordedMilisecs);
            //var us = <blended.IPersistNodeItem<blended.IExShort>>(this._myPage.result.userData['']);
            //us.modified = true;
            //if (!us.short.sumRecord) us.short.sumRecord = 0;
            //if (this.result.recordedMilisecs) us.short.sumRecord += Math.round(this.result.recordedMilisecs / 1000);
        };
        audioCaptureImpl.prototype.play = function () {
            var _this = this;
            var wasPaused = this.driver.handler.paused;
            SndLow.Stop(null);
            this.playing(false);
            if (!wasPaused)
                return;
            var url = this.recorderSound ? this.recorderSound.url : ((cfg.baseTagUrl ? cfg.baseTagUrl : Pager.basicDir) + this.result.audioUrl).toLowerCase();
            this.blendedCallbackMax = 0;
            this.driver.play(url + '?stamp=' + (audioCaptureImpl.playCnt++).toString(), 0, function (msec) {
                if (msec > 0) {
                    //console.log(msec.toString());
                    _this.blendedCallbackMax = Math.max(_this.blendedCallbackMax, msec);
                }
                else {
                    if (_this.blended)
                        _this.blended.recorder.onPlayRecorder(_this._myPage, _this.blendedCallbackMax);
                }
                _this.playing(msec >= 0);
            });
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
            this.blendedCallbackMax = 0;
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
            var _this = this;
            var self = this; //var intVar = interv; var bp = begPos;
            this.blendedCallbackMax = 0;
            interv._owner.player().openPlay(interv._owner._owner.mediaUrl, begPos, interv.endPos).
                progress(function (msec) {
                if (msec > 0) {
                    _this.blendedCallbackMax = Math.max(_this.blendedCallbackMax, msec);
                }
                self.onPlaying(interv, msec < begPos ? begPos : msec /*pri zacatku hrani muze byt notifikovana pozice kousek pred zacatkem*/, progressType.progress);
            }).
                done(function () {
                if (_this.blended)
                    _this.blended.recorder.onPlayed(_this._myPage, _this.blendedCallbackMax - begPos);
                //var us = <blended.IPersistNodeItem<blended.IExShort>>(this._myPage.result.userData['']);
                //us.modified = true;
                //if (!us.short.sumPlay) us.short.sumPlay = 0;
                //us.short.sumPlay += Math.round((this.maxPlayProgress - begPos) / 1000);
                self.onPlaying(interv, -1, progressType.done);
            }).
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
    //k SUM prida agregatabe priznaky
    function agregateFlag(sum, flag) {
        return sum | (flag & addAbleFlags) /*k sum prida addAbleTags z flag*/;
    }
    Course.agregateFlag = agregateFlag;
    //do SUM nastavi agregatabe priznaky
    function setAgregateFlag(sum, flag) {
        return (sum & ~addAbleFlags /*v sum vynuluje addAbleTags*/) | (flag & addAbleFlags /*prida addAbleTags z flag do sum*/);
    }
    Course.setAgregateFlag = setAgregateFlag;
    var addAbleFlags = CourseModel.CourseDataFlag.needsEval | CourseModel.CourseDataFlag.pcCannotEvaluate | CourseModel.CourseDataFlag.hasExternalAttachments;
    function addORScore(res, sc) {
        res.ms += sc.ms;
        res.s += sc.s;
        res.flag = agregateFlag(res.flag, sc.flag);
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
        _.each(scs, function (sc) { hasWrong = hasWrong || sc.ms != sc.s; res.flag = agregateFlag(res.flag, sc.flag); });
        if (hasWrong)
            res.s = 0;
        return res;
    }
    function createAndScoreObj(scs) {
        var res = { ms: 0, s: 0, flag: 0 };
        var cnt = 0;
        _.each(scs, function (sc) { res.ms += sc.ms; res.s += sc.s; res.flag = agregateFlag(res.flag, sc.flag); cnt++; });
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
    //Pager.registerAppLocator(appId, tResult,(urlParts, completed) => completed(new Result(urlParts)));
    //Pager.registerAppLocator(appId, tResults, (urlParts, completed) => completed(new Results(urlParts)));
    blended.oldLocators.push(function ($stateProvider) { return blended.registerOldLocator($stateProvider, testMe.tResult, testMe.appId, testMe.tResult, 3, function (urlParts) { return new Result(urlParts); }); });
    blended.oldLocators.push(function ($stateProvider) { return blended.registerOldLocator($stateProvider, testMe.tResults, testMe.appId, testMe.tResults, 3, function (urlParts) { return new Results(urlParts); }); });
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
    //Pager.registerAppLocator(appId, exModelTypeName, (urlParts, completed) => completed(new ExModel(urlParts)));
    //Pager.registerAppLocator(appId, modModelTypeName, (urlParts, completed) => completed(new ModModel(urlParts)));
    blended.oldLocators.push(function ($stateProvider) { return blended.registerOldLocator($stateProvider, exModelTypeName, vsNet.appId, exModelTypeName, 1, function (urlParts) { return new ExModel(urlParts); }); });
    blended.oldLocators.push(function ($stateProvider) { return blended.registerOldLocator($stateProvider, modModelTypeName, vsNet.appId, modModelTypeName, 1, function (urlParts) { return new ModModel(urlParts); }); });
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
            this.backUrl = oldPrefix + doc.appId + hashDelim + urlParts[1].replace(/~/g, hashDelim);
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
        return oldPrefix + [doc.appId, type, url1, url2].join(hashDelim);
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
        return oldPrefix + [xref.appId, modelType, nodeId.toString(), mainTab.toString(), type, prop, valueIdx ? valueIdx.toString() : '0', LowUtils.getQueryParams('url')].join(hashDelim);
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

var blended;
(function (blended) {
    (function (levelIds) {
        levelIds[levelIds["A1"] = 0] = "A1";
        levelIds[levelIds["A2"] = 1] = "A2";
        levelIds[levelIds["B1"] = 2] = "B1";
        levelIds[levelIds["B2"] = 3] = "B2";
    })(blended.levelIds || (blended.levelIds = {}));
    var levelIds = blended.levelIds;
    function encodeUrl(url) {
        if (!url)
            return url;
        return url.replace(/\//g, '!');
    }
    blended.encodeUrl = encodeUrl;
    function decodeUrl(url) {
        if (!url)
            return url;
        return url.replace(/\!/g, '/');
    }
    blended.decodeUrl = decodeUrl;
    function newGuid() { return (new Date().getTime() + (startGui++)).toString(); }
    blended.newGuid = newGuid;
    var startGui = new Date().getTime();
    blended.baseUrlRelToRoot = '..'; //jak se z root stranky dostat do rootu webu
    function downloadExcelFile(url) {
        var hiddenIFrameID = 'hiddenDownloader';
        var iframe = ($('#hiddenDownloader')[0]);
        if (!iframe) {
            iframe = ($('<iframe id="hiddenDownloader" style="display:none" src="about:blank"></iframe>')[0]);
            $('body').append(iframe);
        }
        iframe.src = url;
    }
    blended.downloadExcelFile = downloadExcelFile;
    function cloneAndModifyContext(ctx, modify) {
        if (modify === void 0) { modify = null; }
        var res = {};
        $.extend(res, ctx);
        if (modify) {
            modify(res);
            finishContext(res);
        }
        return res;
    }
    blended.cloneAndModifyContext = cloneAndModifyContext;
    function finishContext(ctx) {
        ctx.productUrl = decodeUrl(ctx.producturl);
        ctx.Url = decodeUrl(ctx.url);
        ctx.pretestUrl = decodeUrl(ctx.pretesturl);
        ctx.moduleUrl = decodeUrl(ctx.moduleurl);
        ctx.userDataId = function () { return ctx.onbehalfof || ctx.loginid; };
        if (_.isString(ctx.onbehalfof))
            ctx.onbehalfof = parseInt((ctx.onbehalfof));
        if (_.isString(ctx.loginid))
            ctx.loginid = parseInt((ctx.loginid));
        if (_.isString(ctx.companyid))
            ctx.companyid = parseInt((ctx.companyid));
        if (_.isString(ctx.loc))
            ctx.loc = parseInt((ctx.loc));
        if (!ctx.$http) {
            var inj = angular.injector(['ng']);
            ctx.$http = (inj.get('$http'));
            ctx.$q = (inj.get('$q'));
        }
        return ctx;
    }
    blended.finishContext = finishContext;
    function waitForEvaluation(sc) { return !!(sc.flag & CourseModel.CourseDataFlag.needsEval); }
    blended.waitForEvaluation = waitForEvaluation;
    function scorePercent(sc) { return sc.ms == 0 ? -1 : Math.round(sc.s / sc.ms * 100); }
    blended.scorePercent = scorePercent;
    function donesPercent(sc) { return sc.count == 0 ? -1 : Math.round((sc.dones || 0) / sc.count * 100); }
    blended.donesPercent = donesPercent;
    function scoreText(sc) { var pr = scorePercent(sc); return pr < 0 ? '' : pr.toString() + '%'; }
    blended.scoreText = scoreText;
    function agregateShorts(shorts) {
        var res = $.extend({}, blended.shortDefaultAgreg);
        blended.persistUserIsDone(res, true);
        _.each(shorts, function (short) {
            if (!short) {
                blended.persistUserIsDone(res, false);
                return;
            }
            var done = blended.persistUserIsDone(short);
            res.waitForEvaluation = res.waitForEvaluation || short.waitForEvaluation;
            if (!done)
                blended.persistUserIsDone(res, false);
            res.count += short.count || 1;
            res.dones += (short.dones ? short.dones : (blended.persistUserIsDone(short) ? 1 : 0));
            if (done) {
                res.ms += short.ms || 0;
                res.s += short.s || 0;
            }
            //elapsed, beg a end
            res.beg = setDate(res.beg, short.beg, true);
            res.end = setDate(res.end, short.end, false);
            res.elapsed += short.elapsed || 0;
            res.sPlay += short.sPlay;
            res.sPRec += short.sPRec;
            res.sRec += short.sRec;
        });
        res.score = blended.scorePercent(res);
        res.finished = blended.donesPercent(res);
        return res;
    }
    blended.agregateShorts = agregateShorts;
    function agregateShortFromNodes(node, taskId, moduleAlowFinishWhenUndone /*do vyhodnoceni zahrn i nehotova cviceni*/) {
        var res = $.extend({}, blended.shortDefaultAgreg);
        blended.persistUserIsDone(res, true);
        _.each(node.Items, function (nd) {
            if (!blended.isEx(nd))
                return;
            res.count++;
            var us = blended.getPersistWrapper(nd, taskId);
            var done = us && blended.persistUserIsDone(us.short);
            res.waitForEvaluation = res.waitForEvaluation || (done && waitForEvaluation(us.short));
            if (done)
                res.dones += (us.short.dones ? us.short.dones : (blended.persistUserIsDone(us.short) ? 1 : 0));
            if (!done)
                blended.persistUserIsDone(res, false);
            if (nd.ms) {
                if (done) {
                    res.ms += nd.ms;
                    res.s += us.short.s;
                }
                else if (moduleAlowFinishWhenUndone) {
                    res.ms += nd.ms;
                }
            }
            if (us) {
                res.beg = setDate(res.beg, us.short.beg, true);
                res.end = setDate(res.end, us.short.end, false);
                res.elapsed += us.short.elapsed;
                res.sPlay += us.short.sPlay;
                res.sPRec += us.short.sPRec;
                res.sRec += us.short.sRec;
            }
        });
        res.score = blended.scorePercent(res);
        res.finished = blended.donesPercent(res);
        return res;
    }
    blended.agregateShortFromNodes = agregateShortFromNodes;
    blended.shortDefault = { elapsed: 0, beg: Utils.nowToNum(), end: Utils.nowToNum(), ms: 0, s: 0, sPlay: 0, sPRec: 0, sRec: 0, flag: 0 };
    blended.shortDefaultAgreg = { elapsed: 0, beg: Utils.nowToNum(), end: Utils.nowToNum(), ms: 0, s: 0, count: 0, dones: 0, sPlay: 0, sPRec: 0, sRec: 0, waitForEvaluation: false, flag: 0 };
    function setDate(dt1, dt2, min) { if (!dt1)
        return dt2; if (!dt2)
        return dt1; if (min)
        return dt2 > dt1 ? dt1 : dt2;
    else
        return dt2 < dt1 ? dt1 : dt2; }
})(blended || (blended = {}));

var blended;
(function (blended) {
    function persistUserIsDone(us, val) {
        if (val === undefined)
            return us ? !!(us.flag & CourseModel.CourseDataFlag.done) : false;
        if (val)
            us.flag |= CourseModel.CourseDataFlag.done;
        else
            us.flag &= ~CourseModel.CourseDataFlag.done;
    }
    blended.persistUserIsDone = persistUserIsDone;
    function getPersistWrapper(dataNode, taskid, createProc) {
        if (createProc) {
            if (!dataNode.userData)
                dataNode.userData = {};
            var res = dataNode.userData[taskid];
            if (res)
                return res;
            res = { long: null, short: createProc(), modified: true };
            dataNode.userData[taskid] = res;
            return res;
        }
        else {
            if (!dataNode.userData)
                return null;
            return (dataNode.userData[taskid]);
        }
    }
    blended.getPersistWrapper = getPersistWrapper;
    function getPersistData(dataNode, taskid) {
        var res = getPersistWrapper(dataNode, taskid);
        return res ? res.short : null;
    }
    blended.getPersistData = getPersistData;
    function setPersistData(dataNode, taskid, modify) {
        var it = dataNode.userData ? dataNode.userData[taskid] : null;
        if (!it) {
            it = { short: {}, modified: true, long: null };
            if (!dataNode.userData)
                dataNode.userData = {};
            dataNode.userData[taskid] = it;
        }
        else
            it.modified = true;
        modify((it.short));
        return (it.short);
    }
    blended.setPersistData = setPersistData;
    //rozsireni interface o metody
    function finishProduktStart(prod) {
        $.extend(prod, blended.productEx);
        prod.moduleCache = new blended.loader.cacheOf(3);
    }
    blended.finishProduktStart = finishProduktStart;
    blended.productEx = {
        findParent: function (self, cond) {
            var c = self;
            while (c != null) {
                if (cond(c))
                    return c;
                c = c.parent;
            }
            return null;
        },
        find: function (url) {
            var pe = this;
            return (pe.nodeDir[url]);
        },
        addExternalTaskNode: function (repo) {
            var pe = this;
            if (pe.nodeDir[repo.url])
                return;
            pe.nodeDir[repo.url] = repo;
            pe.nodeList.push(repo);
        },
        saveProduct: function (ctx, completed) {
            var pe = this;
            var toSave = [];
            _.each(pe.nodeList, function (nd) {
                if (!nd.userData)
                    return;
                for (var p in nd.userData) {
                    try {
                        var d = nd.userData[p];
                        if (!d.modified)
                            return;
                        d.modified = false;
                        toSave.push({ url: nd.url, taskId: p, shortData: JSON.stringify(d.short), longData: d.long ? JSON.stringify(d.long) : null, flag: d.short.flag });
                    }
                    finally {
                        delete p.long;
                    }
                }
            });
            if (toSave.length == 0) {
                completed();
                return;
            }
            proxies.vyzva57services.saveUserData(ctx.companyid, ctx.userDataId(), ctx.productUrl, toSave, completed);
        }
    };
    var cachedModule = (function () {
        function cachedModule(data, dataNode) {
            this.dataNode = dataNode;
            this.cacheOfPages = new loader.cacheOf(30);
            $.extend(this, data);
            if (!this.loc)
                this.loc = {};
            if (this.dict)
                this.dict = RJSON.unpack(this.dict);
        }
        return cachedModule;
    })();
    blended.cachedModule = cachedModule;
    var cacheExercise = (function () {
        function cacheExercise(mod, dataNode, pageJsonML) {
            this.mod = mod;
            this.dataNode = dataNode;
            this.pageJsonML = pageJsonML;
        }
        return cacheExercise;
    })();
    blended.cacheExercise = cacheExercise;
    var loader;
    (function (loader) {
        //baseUrlRelToRoot: relativni adresa rootu Web4 aplikace vyhledem k aktualni HTML strance
        function adjustProduct(ctx) {
            try {
                var deferred = ctx.$q.defer();
                var fromCache = loader.productCache.fromCache(ctx, deferred);
                if (fromCache.prod) {
                    deferred.resolve(fromCache.prod);
                    return;
                } //produkt je jiz nacten, resolve.
                if (!fromCache.startReading)
                    return; //produkt se zacal nacitat jiz drive - deferred se pouze ulozi do seznamu deferreds.
                //novy start nacitani produktu
                var href = ctx.productUrl.substr(0, ctx.productUrl.length - 1);
                var promises = _.map([href + '.js', href + '.' + LMComLib.Langs[ctx.loc] + '.js', href + '_instrs.js'], function (url) { return ctx.$http.get(blended.baseUrlRelToRoot + url, { transformResponse: function (s) { return CourseMeta.jsonParse(s); } }); });
                ctx.$q.all(promises).then(function (files) {
                    var prod = files[0].data;
                    prod.url = ctx.productUrl;
                    prod.instructions = {};
                    prod.nodeDir = {};
                    prod.nodeList = [];
                    finishProduktStart(prod);
                    var loc = files[1].data;
                    if (!loc)
                        loc = {};
                    var instrs = files[2].data;
                    //vypln seznamy a adresar nodes
                    var scan;
                    scan = function (dt) {
                        prod.nodeDir[dt.url] = dt;
                        prod.nodeList.push(dt);
                        if (dt.other)
                            dt = $.extend(dt, JSON.parse(dt.other.replace(/'/g, '"')));
                        _.each(dt.Items, function (it) { it.parent = dt; scan(it); });
                    };
                    scan(prod);
                    //lokalizace produktu
                    _.each(prod.nodeList, function (dt) { return dt.title = CourseMeta.localizeString(dt.url, dt.title, loc); });
                    //finish instrukce
                    if (instrs)
                        for (var p in instrs) {
                            var pg = CourseMeta.extractEx(instrs[p]);
                            if (pg == null) {
                                debugger;
                                throw 'missing instr';
                            }
                            pg.Items = _.filter(pg.Items, function (it) { return !_.isString(it); });
                            Course.localize(pg, function (s) { return CourseMeta.localizeString(pg.url, s, loc); });
                            Course.scanEx(pg, function (tg) { if (!_.isString(tg))
                                delete tg.id; }); //instrukce nemohou mit tag.id, protoze se ID tlucou s ID ze cviceni
                            prod.instructions[p] = JsRenderTemplateEngine.render("c_genitems", pg);
                        }
                    if (ctx.finishProduct)
                        ctx.finishProduct(prod);
                    //user data
                    proxies.vyzva57services.getShortProductDatas(ctx.companyid, ctx.userDataId(), ctx.productUrl, function (res) {
                        _.each(res, function (it) {
                            var node = prod.nodeDir[it.url];
                            if (!node)
                                debugger;
                            if (!node.userData)
                                node.userData = {};
                            var taskData = node.userData[it.taskId];
                            var shortLong = { modified: false, long: null, short: JSON.parse(it.shortData) };
                            if (!taskData)
                                node.userData[it.taskId] = shortLong;
                            //else debugger; /*something wrong*/
                        });
                        //product nacten, resolve vsechny cekajici deferreds
                        loader.productCache.resolveDefereds(fromCache.startReading, prod);
                    });
                }, function (errors) {
                    deferred.reject();
                });
            }
            finally {
                return deferred.promise;
            }
        }
        loader.adjustProduct = adjustProduct;
        function adjustModule(ctx, modData, prod) {
            ctx = blended.finishContext(ctx);
            var deferred = ctx.$q.defer();
            try {
                var mod = prod.moduleCache.fromCache(ctx.moduleUrl, null);
                if (mod) {
                    deferred.resolve(mod);
                    return;
                }
                var href = blended.baseUrlRelToRoot + ctx.moduleUrl.substr(0, ctx.moduleUrl.length - 1) + '.' + LMComLib.Langs[ctx.loc] + '.js';
                ctx.$http.get(href).then(function (file) {
                    mod = new cachedModule(file.data, modData);
                    prod.moduleCache.toCache(ctx.moduleUrl, null, mod);
                    deferred.resolve(mod);
                }, function (errors) {
                    deferred.reject();
                });
            }
            finally {
                return deferred.promise;
            }
        }
        function adjustEx(ctx) {
            ctx = blended.finishContext(ctx);
            var deferred = ctx.$q.defer();
            try {
                adjustProduct(ctx).then(function (prod) {
                    var exNode = prod.find(ctx.Url);
                    var modData = prod.findParent(exNode, function (n) { return CourseMeta.isType(n, CourseMeta.runtimeType.mod); });
                    if (modData == null)
                        throw 'Exercise ' + ctx.Url + ' does not have module';
                    var modCtx = blended.cloneAndModifyContext(ctx, function (m) { return m.moduleurl = blended.encodeUrl(modData.url); });
                    adjustModule(modCtx, modData, prod).then(function (mod) {
                        var exServ = mod.cacheOfPages.fromCache(ctx.Url, ctx.taskid);
                        if (exServ) {
                            deferred.resolve(exServ);
                            return;
                        }
                        var href = blended.baseUrlRelToRoot + ctx.Url + '.js';
                        ctx.$http.get(href, { transformResponse: function (s) { return CourseMeta.jsonParse(s); } }).then(function (file) {
                            var exServ = new cacheExercise(mod, exNode, file.data);
                            mod.cacheOfPages.toCache(ctx.Url, ctx.taskid, exServ);
                            deferred.resolve(exServ);
                        }, function (errors) {
                            deferred.reject();
                        });
                    });
                });
            }
            finally {
                return deferred.promise;
            }
        }
        loader.adjustEx = adjustEx;
        var cacheOfProducts = (function () {
            function cacheOfProducts() {
                this.products = [];
                this.maxInsertOrder = 0;
            }
            //data != null => ihned vrat. Jinak startReading!=null => spust nacitani, jinak ukonci.
            cacheOfProducts.prototype.fromCache = function (ctx, defered) {
                var resIt = _.find(this.products, function (it) { return it.companyid == ctx.companyid && it.onbehalfof == ctx.userDataId() &&
                    it.loc == ctx.loc && it.producturl == ctx.producturl; });
                //jiz nacteno nebo neni defered => return
                if (resIt && resIt.data)
                    return { prod: resIt.data };
                if (!defered)
                    return {};
                //nenacteno
                var justCreated = false;
                if (!resIt) {
                    resIt = this.toCache(ctx); //vytvor polozku v cache
                    resIt.defereds = [];
                    justCreated = true; //start noveho nacitani
                }
                ;
                resIt.defereds.push(defered);
                resIt.insertOrder = this.maxInsertOrder++; //naposledy pouzity produkt (kvuli vyhazovani z cache)
                return { startReading: justCreated ? resIt : null };
            };
            cacheOfProducts.prototype.toCache = function (ctx) {
                if (this.products.length >= 3) {
                    var minIdx = 99999;
                    for (var i = 0; i < this.products.length; i++)
                        minIdx = Math.min(this.products[i].insertOrder, minIdx);
                    this.products.splice(minIdx, 1);
                }
                var res;
                this.products.push(res = {
                    companyid: ctx.companyid, loc: ctx.loc, producturl: ctx.producturl, onbehalfof: ctx.userDataId(),
                    data: null, insertOrder: this.maxInsertOrder++, taskid: null, loginid: -1, lickeys: null, persistence: null
                });
                return res;
            };
            cacheOfProducts.prototype.resolveDefereds = function (resIt, data) {
                resIt.data = data;
                var defs = resIt.defereds;
                delete resIt.defereds;
                _.each(defs, function (def) { return def.resolve(data); });
            };
            return cacheOfProducts;
        })();
        loader.cacheOfProducts = cacheOfProducts;
        loader.productCache = new cacheOfProducts();
        //*************** CACHE modulu (v produktu), cache cviceni (v modulu)
        var cacheOf = (function () {
            function cacheOf(maxLength) {
                this.maxLength = maxLength;
                this.modules = {};
                this.maxInsertOrder = 0;
            }
            cacheOf.prototype.fromCache = function (url, taskId) {
                var urlTaskId = url + (taskId ? '|' + taskId : '');
                var cch = this.modules[urlTaskId];
                return cch ? cch.data : null;
            };
            cacheOf.prototype.toCache = function (url, taskId, mod) {
                var urlTaskId = url + (taskId ? '|' + taskId : '');
                var cnt = 0;
                var minIdx = 99999;
                var propName;
                for (var p in this.modules) {
                    cnt++;
                    var m = this.modules[p];
                    if (m.insertOrder >= minIdx)
                        return;
                    minIdx = m.insertOrder;
                    propName = p;
                }
                if (cnt > 5)
                    delete this.modules[propName];
                this.modules[urlTaskId] = { data: mod, insertOrder: this.maxInsertOrder++ };
            };
            return cacheOf;
        })();
        loader.cacheOf = cacheOf;
    })(loader = blended.loader || (blended.loader = {}));
})(blended || (blended = {}));

var blended;
(function (blended) {
    function lineIdToText(id) {
        switch (id) {
            case LMComLib.LineIds.English: return "Angličtina";
            case LMComLib.LineIds.German: return "Němčina";
            case LMComLib.LineIds.French: return "Francouzština";
            default: return "???";
        }
    }
    blended.lineIdToText = lineIdToText;
    ;
    blended.rootModule
        .filter('lineIdsText', function () { return function (id) { return lineIdToText(id); }; })
        .filter('lineIdsFlag', function () {
        return function (id) {
            switch (id) {
                case LMComLib.LineIds.English: return "flag-small-english";
                case LMComLib.LineIds.German: return "flag-small-german";
                case LMComLib.LineIds.French: return "flag-small-french";
                default: return "???";
            }
        };
    })
        .filter('levelText', function () { return function (id) { return ['A1', 'A2', 'B1', 'B2'][id]; }; })
        .filter("rawhtml", ['$sce', function ($sce) { return function (htmlCode) { return $sce.trustAsHtml(htmlCode); }; }])
        .directive('lmEnterKey', ['$document', function ($document) {
            return {
                link: function (scope, element, attrs) {
                    var enterWatcher = function (event) {
                        if (event.which === 13) {
                            scope.lmEnterKey();
                            scope.$apply();
                            event.preventDefault();
                            $document.unbind("keydown keypress", enterWatcher);
                        }
                    };
                    $document.bind("keydown keypress", enterWatcher);
                },
                scope: {
                    lmEnterKey: "&"
                },
            };
        }])
        .directive('collapsablemanager', function () { return new collapseMan(); });
    var collapseMan = (function () {
        function collapseMan() {
            this.link = function (scope, el, attrs) {
                var id = attrs['collapsablemanager'];
                var th = {
                    isCollapsed: true,
                    collapseToogle: function () {
                        var act = (scope[id]);
                        if (act.isCollapsed)
                            _.each(collapseMan.allCollapsable, function (man, id) { return man.isCollapsed = true; });
                        act.isCollapsed = !act.isCollapsed;
                    },
                };
                scope[id] = collapseMan.allCollapsable[id] = th;
                scope.$on('$destroy', function () { return delete collapseMan.allCollapsable[id]; });
            };
        }
        collapseMan.allCollapsable = {};
        return collapseMan;
    })();
    blended.collapseMan = collapseMan;
})(blended || (blended = {}));

var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var blended;
(function (blended) {
    blended.taskContextAs = {
        product: 'productParent',
        pretest: 'pretestParent',
        module: 'moduleParent',
        ex: 'exParent',
        lector: 'lectorParent',
    };
    function extendTaskContext($scope, task) {
        for (var p in blended.taskContextAs) {
            var propName = blended.taskContextAs[p];
            var value = $scope[propName];
            if (value)
                task[propName] = $scope[propName];
        }
    }
    blended.extendTaskContext = extendTaskContext;
    var controller = (function () {
        function controller($scope, $state) {
            var stateService = this.getStateService($scope);
            if (stateService) {
                this.isFakeCreate = true;
                this.ctx = stateService.params;
                blended.finishContext(this.ctx);
                //this.parent = stateService.parent;
                this.state = stateService.current;
                extendTaskContext(stateService.parent, this);
                return;
            }
            this.$scope = $scope;
            this.$state = $state;
            extendTaskContext(this.$scope, this);
            this.ctx = $state.params;
            blended.finishContext(this.ctx);
            //this.ctx.$state = $state;
            this.$scope['ts'] = this;
            var st = $state.current;
            var constr = this.constructor;
            while (st) {
                if (st.controller == constr) {
                    this.state = st;
                    break;
                }
                st = st.parent;
            }
            this.$scope.state = this.state;
            this.$scope['appService'] = this.appService = new vyzva.appService(this);
        }
        controller.prototype.getStateService = function ($scope) { return !!$scope['current'] ? $scope : null; };
        controller.prototype.href = function (url) {
            return this.$state.href(url.stateName, url.pars);
        };
        controller.prototype.navigate = function (url) {
            if (!url)
                return;
            var hash = this.href(url);
            setTimeout(function () { return window.location.hash = hash; }, 1);
        };
        controller.prototype.navigateWrapper = function () {
            var self = this;
            return function (stateName) { return self.navigate({ stateName: stateName, pars: self.ctx }); };
        };
        controller.prototype.navigateWebHome = function () { Pager.gotoHomeUrl(); };
        controller.prototype.navigateReturnUrl = function () { location.href = this.ctx.returnurl; };
        controller.prototype.getProductHomeUrl = function () { return { stateName: blended.prodStates.home.name, pars: this.ctx }; };
        controller.prototype.navigateProductHome = function () { this.navigate(this.getProductHomeUrl()); };
        controller.prototype.wrongUrlRedirect = function (url) {
            if (!url)
                return;
            this.isWrongUrl = true;
            setTimeout(this.navigate(url), 1);
        };
        controller.$inject = ['$scope', '$state'];
        return controller;
    })();
    blended.controller = controller;
    //******* TASK VIEW - predchudce vsech controllers, co maji vizualni podobu (html stranku)
    var taskViewController = (function (_super) {
        __extends(taskViewController, _super);
        function taskViewController($scope, $state) {
            _super.call(this, $scope, $state);
            this.myTask = this.isFakeCreate ? $scope.parent : $scope.$parent['ts'];
            this.title = this.myTask.dataNode.title;
        }
        return taskViewController;
    })(controller);
    blended.taskViewController = taskViewController;
    (function (moveForwardResult) {
        moveForwardResult[moveForwardResult["toParent"] = 0] = "toParent"; /*neumi se posunout dopredu, musi se volat moveForward parenta*/
        moveForwardResult[moveForwardResult["selfAdjustChild"] = 1] = "selfAdjustChild"; /*posunuto dopredu, nutno spocitat goCurrent a skocit na jiny task*/
        moveForwardResult[moveForwardResult["selfInnner"] = 2] = "selfInnner"; /*posun osetren v ramci zmeny stavu aktualniho tasku (bez nutnosti navigace na jiny task)*/
    })(blended.moveForwardResult || (blended.moveForwardResult = {}));
    var moveForwardResult = blended.moveForwardResult;
    //******* TASK (predchudce vse abstraktnich controllers (mimo cviceni), reprezentujicich TASK). Task umi obslouzit zelenou sipku apod.
    var taskController = (function (_super) {
        __extends(taskController, _super);
        //parent: taskController;
        //isProductHome: boolean;
        //********************* 
        function taskController($scope, $state) {
            _super.call(this, $scope, $state);
            //constructor(state: IStateService, resolves?: Array<any>) {
            //    super(state);
            if (!this.state.dataNodeUrlParName)
                return;
            //provaz parent - child
            //if (this.parent) this.parent.child = this;
            //var parentTask = this.parent = (<ng.IScope>$scope).$parent['ts']; if (parentTask) parentTask.child = this;
            //dataNode
            if (this.productParent) {
                this.dataNode = this.productParent.dataNode.nodeDir[this.ctx[this.state.dataNodeUrlParName]];
                this.user = blended.getPersistWrapper(this.dataNode, this.ctx.taskid);
            }
        }
        //********************** GREEN MANAGEMENT
        // Zelena sipka je prirazena nejakemu ACT_TASK (Pretest nebo Lesson ve VYZVA aplikaci apod.)
        // Zelena sipka neni videt, musi se skocit do tasku pomoci ACT_TASK.goCurrent
        // Pak je videt a pri kliku na sipku se vola ACT_TASK.goAhead 
        // Vrati-li ACT_TASK.goAhead null, skoci se na home produktu
        // **** goCurrent
        // PARENT na zaklade USER dat svych childu urcuje, ktery z nich je narade (pomoci funkce PARENT.adjustChild)
        // skace se na posledni child, co vrati adjustChild() null
        //Fake dodelavka TASKLIST (pridanim taskuu s 'createMode=createControllerModes.adjustChild') tak, aby posledni v rade byl task, na ktery se skace.
        //Sance parent tasku prenest zodpovednost na child.
        //Klicove je do childUrl tasku doplnit spravny task.ctx, aby v goCurrent fungovalo 'return { stateName: t.state.name, pars: t.ctx }'
        taskController.prototype.adjustChild = function () { return null; };
        //posun stavu dal
        taskController.prototype.moveForward = function (sender) { throw 'notimplemented'; };
        //priznak pro 'if (t.taskControllerSignature)' test, ze tento objekt je task.
        taskController.prototype.taskControllerSignature = function () { };
        //nevirtualni funkce: dobuduje TASKLIST umele vytvorenymi tasks (pomoci adjust Child) a vrati URL posledniho child v TASKLIST.
        taskController.prototype.goCurrent = function () {
            var t = this;
            while (t) {
                var newt = t.adjustChild();
                if (!newt)
                    return { stateName: t.state.name, pars: t.ctx };
                t = newt;
            }
        };
        taskController.prototype.navigateAhead = function (sender) {
            this.navigate(this.goAhead(sender));
        };
        taskController.prototype.goAhead = function (sender) {
            var task = sender;
            while (true) {
                switch (task.moveForward(sender)) {
                    case moveForwardResult.selfInnner: return null;
                    case moveForwardResult.toParent:
                        if (task == task.exParent) {
                            task = task.moduleParent;
                            continue;
                        }
                        if (task == task.moduleParent && task.pretestParent) {
                            task = task.pretestParent;
                            continue;
                        }
                        return this.getProductHomeUrl(); //{ stateName: prodStates.home.name, pars: this.ctx }
                    case moveForwardResult.selfAdjustChild: return task.goCurrent();
                }
            }
            //seznam od childs k this
            //var taskList: Array<taskController> = [];
            //var act = this; while (act) {
            //  if (!act.taskControllerSignature) break;
            //  taskList.push(act);
            //  act = act.child;
            //}
            ////najdi prvni task, co se umi posunout dopredu: jdi od spodu nahoru
            //for (var i = taskList.length - 1; i >= 0; i--) {
            //  var act = taskList[i];
            //  switch (act.moveForward()) {
            //    case moveForwardResult.selfInnner: return null;
            //    case moveForwardResult.toParent: break;
            //    case moveForwardResult.selfAdjustChild: return act.goCurrent();
            //  }
            //}
            ////ani jeden z parentu move nevyresil => jdi na home produktu
            //return { stateName: prodStates.home.name, pars: this.ctx }
        };
        taskController.prototype.log = function (msg) {
            console.log('%%% ' + Utils.getObjectClassName(this) + ": " + msg + ' (' + this.dataNode.url + ')');
        };
        return taskController;
    })(controller);
    blended.taskController = taskController;
    //****************** PRODUCT HOME
    var homeTaskController = (function (_super) {
        __extends(homeTaskController, _super);
        function homeTaskController($scope, $state, product) {
            _super.call(this, $scope, $state);
            this.dataNode = product;
        }
        return homeTaskController;
    })(taskController);
    blended.homeTaskController = homeTaskController;
    function pretestScore(dataNode, user, taskId) {
        if (!blended.persistUserIsDone(user))
            return null;
        var users = _.map(user.history, function (l) { return blended.agregateShortFromNodes(dataNode.Items[l], taskId); });
        return blended.agregateShorts(users);
    }
    blended.pretestScore = pretestScore;
    var pretestTaskController = (function (_super) {
        __extends(pretestTaskController, _super);
        //inCongratulation: boolean; //priznak, ze modul byl prave preveden do stavu DONE a ukazuje se congratulation dialog
        function pretestTaskController($scope, $state) {
            _super.call(this, $scope, $state);
            this.pretestParent = this;
            //sance prerusit navigaci
            this.user = blended.getPersistWrapper(this.dataNode, this.ctx.taskid, function () {
                return { actLevel: blended.levelIds.A2, history: [blended.levelIds.A2], targetLevel: -1, flag: CourseModel.CourseDataFlag.blPretest };
            });
            if (this.isFakeCreate)
                return;
            this.wrongUrlRedirect(this.checkCommingUrl());
        }
        pretestTaskController.prototype.checkCommingUrl = function () {
            var ud = this.user.short;
            if (!ud)
                return this.getProductHomeUrl(); //{ stateName: prodStates.home.name, pars: this.ctx }; //pretest jeste nezacal => goto product home
            if (blended.persistUserIsDone(ud))
                return null; //done pretest: vse je povoleno
            var dataNode = this.dataNode;
            var actModule = dataNode.Items[ud.actLevel];
            var actEx = this.productParent.dataNode.nodeDir[this.ctx.Url];
            if (actModule.url != actEx.parent.url) {
                var pars = blended.cloneAndModifyContext(this.ctx, function (c) { return c.moduleurl = blended.encodeUrl(actModule.url); });
                return this.getProductHomeUrl(); //{ stateName: prodStates.home.name, pars: pars }; //v URL je adresa jineho nez aktivniho modulu (asi pomoci back) => jdi na prvni cviceni aktualniho modulu
            }
            return null;
        };
        pretestTaskController.prototype.adjustChild = function () {
            var ud = this.user.short;
            if (blended.persistUserIsDone(ud))
                return null;
            var actModule = this.actRepo(ud.actLevel);
            if (!actModule)
                throw '!actModule';
            var state = {
                params: blended.cloneAndModifyContext(this.ctx, function (d) { return d.moduleurl = blended.encodeUrl(actModule.url); }),
                parent: this,
                current: blended.prodStates.pretestModule,
            };
            return new blended.moduleTaskController(state);
        };
        pretestTaskController.prototype.moveForward = function (sender) {
            //if (this.inCongratulation) { delete this.inCongratulation; return moveForwardResult.toParent; }
            var ud = this.user.short;
            var actTestItem = sender.moduleParent; // <exerciseTaskViewController>(this.child);
            var actRepo = this.actRepo(ud.actLevel);
            if (actTestItem.dataNode != actRepo)
                throw 'actTestItem.dataNode != actRepo';
            var childSummary = blended.agregateShortFromNodes(actTestItem.dataNode, this.ctx.taskid);
            if (!blended.persistUserIsDone(childSummary))
                throw '!childUser.done';
            var score = blended.scorePercent(childSummary);
            if (actRepo.level == blended.levelIds.A1) {
                return this.finishPretest(sender, ud, blended.levelIds.A1);
            }
            else if (actRepo.level == blended.levelIds.A2) {
                if (score >= actRepo.min && score < actRepo.max)
                    return this.finishPretest(sender, ud, blended.levelIds.A2);
                else if (score < actRepo.min)
                    return this.newTestItem(ud, blended.levelIds.A1);
                else
                    return this.newTestItem(ud, blended.levelIds.B1);
            }
            else if (actRepo.level == blended.levelIds.B1) {
                if (score >= actRepo.min && score < actRepo.max)
                    return this.finishPretest(sender, ud, blended.levelIds.B1);
                else if (score < actRepo.min)
                    return this.finishPretest(sender, ud, blended.levelIds.A2);
                else
                    return this.newTestItem(ud, blended.levelIds.B2);
            }
            else if (actRepo.level == blended.levelIds.B2) {
                if (score < actRepo.min)
                    return this.finishPretest(sender, ud, blended.levelIds.B1);
                else
                    return this.finishPretest(sender, ud, blended.levelIds.B2);
            }
            throw 'not implemented';
        };
        pretestTaskController.prototype.newTestItem = function (ud, lev) {
            this.user.modified = true;
            ud.actLevel = lev;
            ud.history.push(lev);
            return moveForwardResult.selfAdjustChild;
        };
        pretestTaskController.prototype.finishPretest = function (sender, ud, lev) {
            var _this = this;
            this.user.modified = true;
            blended.persistUserIsDone(ud, true);
            ud.targetLevel = lev;
            delete ud.actLevel;
            sender.congratulationDialog().then(function () { return _this.navigateProductHome(); }, function () { return _this.navigateProductHome(); });
            //this.inCongratulation = true;
            return moveForwardResult.selfInnner;
        };
        pretestTaskController.prototype.actRepo = function (lev) { return _.find(this.dataNode.Items, function (l) { return l.level == lev; }); };
        return pretestTaskController;
    })(taskController);
    blended.pretestTaskController = pretestTaskController;
})(blended || (blended = {}));

var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var blended;
(function (blended) {
    (function (exDoneStatus) {
        exDoneStatus[exDoneStatus["no"] = 0] = "no";
        exDoneStatus[exDoneStatus["passive"] = 1] = "passive";
        exDoneStatus[exDoneStatus["active"] = 2] = "active";
    })(blended.exDoneStatus || (blended.exDoneStatus = {}));
    var exDoneStatus = blended.exDoneStatus;
    //********************* RESOLVES
    blended.loadEx = ['$stateParams', function ($stateParams) {
            blended.finishContext($stateParams);
            return blended.loader.adjustEx($stateParams);
        }];
    blended.loadLongData = ['$stateParams', function (ctx) {
            blended.finishContext(ctx);
            var def = ctx.$q.defer();
            try {
                proxies.vyzva57services.getLongData(ctx.companyid, ctx.userDataId(), ctx.productUrl, ctx.taskid, ctx.Url, function (long) {
                    var res = JSON.parse(long);
                    def.resolve(res);
                });
            }
            finally {
                return def.promise;
            }
        }];
    //***************** EXERCISE controller
    var exerciseTaskViewController = (function (_super) {
        __extends(exerciseTaskViewController, _super);
        function exerciseTaskViewController($scope /*union types*/, $state, $loadedEx, $loadedLongData) {
            _super.call(this, $scope, $state);
            this.exParent = this;
            if (this.isFakeCreate)
                return;
            var modIdx = _.indexOf(this.moduleParent.exercises, this.dataNode);
            this.exService = new exerciseService($loadedEx, $loadedLongData, this, modIdx); //, () => this.confirmWrongScoreDialog());
            this.modService = new blended.moduleService(this.moduleParent.dataNode, this.exService, this.moduleParent.state.moduleType, this);
            var sc = $scope;
            sc.exService = this.exService;
            sc.modService = this.modService;
            this.user = this.exService.user;
            this.title = this.dataNode.title;
            this.moduleParent.onExerciseLoaded(modIdx); //zmena actChildIdx v persistentnich datech modulu
        }
        exerciseTaskViewController.prototype.confirmWrongScoreDialog = function () {
            var def = this.ctx.$q.defer();
            setTimeout(function () {
                if (confirm('Špatné skore, pokračovat?'))
                    def.resolve();
                else
                    def.reject();
            }, 1000);
            return def.promise;
        };
        exerciseTaskViewController.prototype.congratulationDialog = function () {
            var def = this.ctx.$q.defer();
            setTimeout(function () {
                alert('Gratulace');
                def.resolve();
                ;
            }, 1000);
            return def.promise;
        };
        //osetreni zelene sipky
        exerciseTaskViewController.prototype.moveForward = function (sender) {
            var _this = this;
            var res = this.exService.evaluate(this.moduleParent.state.moduleType != blended.moduleServiceType.lesson, this.state.exerciseShowWarningPercent);
            if (!res.confirmWrongScore) {
                return res.showResult ? blended.moveForwardResult.selfInnner : blended.moveForwardResult.toParent;
            }
            res.confirmWrongScore.then(function (okScore) {
                if (!okScore)
                    return;
                _this.$scope.$apply();
            });
            return blended.moveForwardResult.selfInnner;
        };
        //provede reset cviceni, napr. v panelu s instrukci
        exerciseTaskViewController.prototype.resetExercise = function () { alert('reset'); };
        exerciseTaskViewController.prototype.greenClick = function () {
            this.exService.greenArrowRoot.navigateAhead(this);
        };
        exerciseTaskViewController.$inject = ['$scope', '$state', '$loadedEx', '$loadedLongData'];
        return exerciseTaskViewController;
    })(blended.taskController);
    blended.exerciseTaskViewController = exerciseTaskViewController;
    //********************* SHOW EXERCISES DIRECTIVE
    var showExerciseModel = (function () {
        function showExerciseModel($stateParams) {
            this.$stateParams = $stateParams;
            this.link = function (scope, el, attrs) {
                var exService = scope.exService();
                //scope.$on('$destroy', ev => exService.onDestroy(el));
                scope.$on('onStateChangeSuccess', function (ev) { return exService.onDestroy(el); });
                exService.onDisplay(el, $.noop);
            };
            this.scope = { exService: '&exService' };
        }
        return showExerciseModel;
    })();
    blended.showExerciseModel = showExerciseModel;
    blended.rootModule
        .directive('showExercise', ['$stateParams', function ($stateParams) { return new showExerciseModel($stateParams); }]);
    //********************* EXERCISE SERVICE
    var exerciseService = (function () {
        function exerciseService(exercise, long, controller, modIdx) {
            var _this = this;
            this.controller = controller;
            this.exercise = exercise;
            this.modIdx = modIdx;
            this.confirmWrongScoreDialog = function () { return controller.confirmWrongScoreDialog(); };
            this.ctx = controller.ctx;
            this.product = controller.productParent.dataNode;
            this.isTest = controller.moduleParent.state.moduleType != blended.moduleServiceType.lesson;
            this.moduleUser = controller.moduleParent.user.short;
            this.user = blended.getPersistWrapper(exercise.dataNode, this.ctx.taskid, function () {
                var res = $.extend({}, blended.shortDefault);
                res.ms = exercise.dataNode.ms;
                res.flag = CourseModel.CourseDataFlag.ex;
                if (controller.pretestParent)
                    res.flag |= CourseModel.CourseDataFlag.blPretestEx;
                else if (_this.isTest)
                    res.flag |= CourseModel.CourseDataFlag.testEx;
                return res;
            });
            if (!long) {
                long = {};
                this.user.modified = true;
            }
            this.user.long = long;
            this.startTime = Utils.nowToNum();
            //greenArrowRoot
            this.greenArrowRoot = controller.pretestParent ? controller.pretestParent : controller.moduleParent;
            //this.refresh();
            this.isLector = !!controller.ctx.onbehalfof;
            this.showLectorPanel = !!(this.user.short.flag & CourseModel.CourseDataFlag.pcCannotEvaluate);
        }
        //ICoursePageCallback
        exerciseService.prototype.onRecorder = function (page, msecs) { if (page != this.page)
            debugger; this.user.modified = true; if (!this.user.short.sRec)
            this.user.short.sRec = 0; this.user.short.sRec += Math.round(msecs / 1000); };
        exerciseService.prototype.onPlayRecorder = function (page, msecs) { this.user.modified = true; if (!this.user.short.sPRec)
            this.user.short.sPRec = 0; this.user.short.sPRec += Math.round(msecs / 1000); };
        exerciseService.prototype.onPlayed = function (page, msecs) { this.user.modified = true; if (!this.user.short.sPlay)
            this.user.short.sPlay = 0; this.user.short.sPlay += Math.round(msecs / 1000); };
        exerciseService.prototype.saveLectorEvaluation = function () {
            var _this = this;
            var humanEvals = _.map($('.human-form:visible').toArray(), function (f) {
                var id = f.id.substr(5);
                return { ctrl: (_this.page.tags[f.id.substr(5)]), edit: $('#human-ed-' + id) };
            });
            _.each(humanEvals, function (ev) {
                _this.user.modified = true;
                var val = parseInt(ev.edit.val());
                if (!val)
                    val = 0;
                if (val > 100)
                    val = 100;
                ev.ctrl.result.hPercent = val / 100 * ev.ctrl.scoreWeight;
                ev.ctrl.result.flag &= ~CourseModel.CourseDataFlag.needsEval;
                ev.ctrl.setScore();
            });
            var score = this.page.getScore();
            this.user.short.s = score.s;
            this.user.short.flag = Course.setAgregateFlag(this.user.short.flag, score.flag);
        };
        //lectorEvaluationScore() { return scorePercent(this.user.short); }
        exerciseService.prototype.score = function () {
            return blended.scorePercent(this.user.short);
        };
        exerciseService.prototype.onDisplay = function (el, completed) {
            var _this = this;
            var pg = this.page = CourseMeta.extractEx(this.exercise.pageJsonML);
            if (this.isLector)
                this.page.humanEvalMode = true;
            this.recorder = this;
            pg.blendedExtension = this; //navazani rozsireni na Page
            Course.localize(pg, function (s) { return CourseMeta.localizeString(pg.url, s, _this.exercise.mod.loc); });
            var isGramm = CourseMeta.isType(this.exercise.dataNode, CourseMeta.runtimeType.grammar);
            if (!isGramm) {
                if (pg.evalPage)
                    this.exercise.dataNode.ms = pg.evalPage.maxScore;
            }
            //instrukce
            var instrs = this.product.instructions;
            var instrBody = _.map(pg.instrs, function (instrUrl) { return instrs[instrUrl]; });
            this.instructionData = { title: pg.instrTitle, body: instrBody.join('') };
            var exImpl = (this.exercise.dataNode);
            exImpl.page = pg;
            exImpl.result = this.user.long;
            pg.finishCreatePage((this.exercise.dataNode));
            pg.callInitProcs(Course.initPhase.beforeRender, function () {
                var html = JsRenderTemplateEngine.render("c_gen", pg);
                CourseMeta.actExPageControl = pg; //knockout pro cviceni binduje CourseMeta.actExPageControl
                ko.cleanNode(el[0]);
                el.html('');
                el.html(html);
                ko.applyBindings({}, el[0]);
                pg.callInitProcs(Course.initPhase.afterRender, function () {
                    pg.callInitProcs(Course.initPhase.afterRender2, function () {
                        if (_this.isTest && blended.persistUserIsDone(_this.user.short) && !blended.persistUserIsDone(_this.moduleUser) && !_this.isLector) {
                            //test cviceni nesmi byt (pro nedokonceny test) videt ve vyhodnocenem stavu. Do vyhodnoceneho stav se vrati dalsim klikem na zelenou sipku.
                            blended.persistUserIsDone(_this.user.short, false);
                        }
                        pg.acceptData(blended.persistUserIsDone(_this.user.short), exImpl.result);
                        completed(pg);
                    });
                });
            });
        };
        exerciseService.prototype.onDestroy = function (el) {
            //elapsed
            var now = Utils.nowToNum();
            var delta = Math.min(maxDelta, Math.round(now - this.startTime));
            var short = this.user.short;
            if (!short.elapsed)
                short.elapsed = 0;
            short.elapsed += delta;
            short.end = Utils.nowToNum();
            this.user.modified = true;
            if (!blended.persistUserIsDone(this.user.short))
                this.page.provideData(); //prevzeti poslednich dat z kontrolek cviceni
            //uklid
            if (this.page.sndPage)
                this.page.sndPage.htmlClearing();
            if (this.page.sndPage)
                this.page.sndPage.leave();
            ko.cleanNode(el[0]);
            el.html('');
            delete (this.exercise.dataNode).result;
        };
        //vrati budto promise v IEvaluateResult.confirmWrongScore (= aktivni pod 75% = cekani na wrongScore confirmation dialog) 
        // nebo IEvaluateResult.showResult (ukazat vysledek vyhodnoceni: pro aktivni nad 75% cviceni ano, pro pasivni a test ne)
        exerciseService.prototype.evaluate = function (isTest, exerciseShowWarningPercent) {
            var _this = this;
            if (exerciseShowWarningPercent === void 0) { exerciseShowWarningPercent = 75; }
            if (blended.persistUserIsDone(this.user.short)) {
                return { showResult: false };
            }
            this.user.modified = true;
            var short = this.user.short;
            //pasivni stranka
            if (this.page.isPassivePage()) {
                this.page.processReadOnlyEtc(true, true);
                blended.persistUserIsDone(short, true);
                return { showResult: false };
            }
            //aktivni stranka
            this.page.provideData(); //prevzeti vysledku z kontrolek
            var score = this.page.getScore(); //vypocet score
            if (!score) {
                debugger;
                blended.persistUserIsDone(short, true);
                return null;
            }
            var afterConfirmScore = function () {
                _this.page.processReadOnlyEtc(true, true); //readonly a skipable controls
                if (!isTest)
                    _this.page.acceptData(true);
                _this.user.modified = true;
                blended.persistUserIsDone(short, true);
                if (_this.exercise.dataNode.ms != score.ms) {
                    debugger;
                    def.reject("this.maxScore != score.ms");
                    return null;
                }
                short.s = score.s;
                short.flag = Course.setAgregateFlag(short.flag, score.flag);
                //short.flag |= score.flag;
            };
            var exerciseOK = isTest || !this.confirmWrongScoreDialog ? true : (score == null || score.ms == 0 || (score.s / score.ms * 100) >= exerciseShowWarningPercent);
            if (!exerciseOK) {
                var def = this.ctx.$q.defer();
                try {
                    this.confirmWrongScoreDialog().then(function () {
                        afterConfirmScore();
                        def.resolve(true);
                    }, function () {
                        def.resolve(false);
                    });
                }
                finally {
                    return { confirmWrongScore: def.promise };
                }
            }
            else {
                afterConfirmScore();
                return { showResult: !isTest };
            }
        };
        return exerciseService;
    })();
    blended.exerciseService = exerciseService;
    var maxDelta = 10 * 60; //10 minut
})(blended || (blended = {}));

var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var blended;
(function (blended) {
    (function (exItemBackground) {
        exItemBackground[exItemBackground["no"] = 0] = "no";
        exItemBackground[exItemBackground["warning"] = 1] = "warning";
        exItemBackground[exItemBackground["success"] = 2] = "success";
        exItemBackground[exItemBackground["danger"] = 3] = "danger";
    })(blended.exItemBackground || (blended.exItemBackground = {}));
    var exItemBackground = blended.exItemBackground;
    (function (exItemContent) {
        exItemContent[exItemContent["no"] = 0] = "no";
        exItemContent[exItemContent["check"] = 1] = "check";
        exItemContent[exItemContent["folderOpen"] = 2] = "folderOpen";
        exItemContent[exItemContent["folder"] = 3] = "folder";
        exItemContent[exItemContent["progressBar"] = 4] = "progressBar";
        exItemContent[exItemContent["waitForEvaluation"] = 5] = "waitForEvaluation";
    })(blended.exItemContent || (blended.exItemContent = {}));
    var exItemContent = blended.exItemContent;
    var moduleServiceLow = (function () {
        function moduleServiceLow(node, type, controller, forHome) {
            this.node = node;
            this.controller = controller;
            this.lessonType = type;
            this.onbehalfof = controller.ctx.onbehalfof > 0;
            if (forHome)
                this.refresh(0);
        }
        moduleServiceLow.prototype.refresh = function (actExIdx) {
            var _this = this;
            this.exercises = _.map(_.filter(this.node.Items, function (it) { return isEx(it); }), function (node, idx) {
                return {
                    user: blended.getPersistData(node, _this.controller.ctx.taskid),
                    idx: idx,
                    node: node,
                    active: idx == actExIdx
                };
            });
            this.user = blended.agregateShortFromNodes(this.node, this.controller.ctx.taskid);
        };
        return moduleServiceLow;
    })();
    blended.moduleServiceLow = moduleServiceLow;
    var moduleService = (function (_super) {
        __extends(moduleService, _super);
        function moduleService(node, exService, type, controller) {
            _super.call(this, node, type, controller, false);
            this.exService = exService;
            this.refresh(this.exService.modIdx);
            this.exShowPanel = blended.persistUserIsDone(this.user) || this.lessonType != blended.moduleServiceType.pretest;
        }
        moduleService.prototype.showResult = function () {
            var res = this.exService.user && this.exService.user.short && blended.persistUserIsDone(this.exService.user.short) &&
                (this.lessonType == blended.moduleServiceType.lesson || this.moduleDone);
            return res;
        };
        moduleService.prototype.resetExercise = function () { alert('reset'); };
        moduleService.prototype.refresh = function (actExIdx) {
            var _this = this;
            _super.prototype.refresh.call(this, actExIdx);
            this.moduleDone = blended.persistUserIsDone(this.user);
            this.exNoclickable = this.lessonType == blended.moduleServiceType.test && !this.moduleDone && !this.controller.ctx.onbehalfof;
            _.each(this.exercises, function (ex) {
                //active item: stejny pro vsechny pripady
                if (ex.active) {
                    ex.content = exItemContent.folderOpen;
                    ex.background = exItemBackground.warning;
                    return;
                }
                var exDone = blended.persistUserIsDone(ex.user);
                //nehotovy test
                if (_this.lessonType == blended.moduleServiceType.test && !_this.moduleDone && !_this.controller.ctx.onbehalfof) {
                    ex.content = exDone ? exItemContent.check : exItemContent.folder;
                    return;
                }
                //vse ostatni: nehotova lekce, hotovy test i pretest
                if (!exDone)
                    ex.content = exItemContent.folder;
                else if (ex.user.ms) {
                    var waitForEval = blended.waitForEvaluation(ex.user);
                    ex.content = waitForEval ? exItemContent.waitForEvaluation : exItemContent.progressBar;
                    ex.percent = blended.scorePercent(ex.user);
                    ex.background = waitForEval && _this.controller.ctx.onbehalfof ? exItemBackground.danger : exItemBackground.success;
                }
                else {
                    ex.background = exItemBackground.success;
                    ex.content = exItemContent.check;
                }
            });
        };
        //skok na jine cviceni, napr. v module map panelu 
        moduleService.prototype.navigateExercise = function (idx) {
            if (idx == this.exService.modIdx)
                return;
            var exNode = this.exercises[idx].node;
            var ctx = blended.cloneAndModifyContext(this.controller.ctx, function (c) { return c.url = blended.encodeUrl(exNode.url); });
            this.controller.navigate({ stateName: this.controller.state.name, pars: ctx });
        };
        return moduleService;
    })(moduleServiceLow);
    blended.moduleService = moduleService;
    function moduleIsDone(nd, taskId) {
        return !_.find(nd.Items, function (it) { var itUd = blended.getPersistData(it, taskId); return !blended.persistUserIsDone(itUd); });
    }
    blended.moduleIsDone = moduleIsDone;
    function isEx(nd) { return CourseMeta.isType(nd, CourseMeta.runtimeType.ex); }
    blended.isEx = isEx;
    var moduleTaskController = (function (_super) {
        __extends(moduleTaskController, _super);
        function moduleTaskController($scope, $state) {
            var _this = this;
            _super.call(this, $scope, $state);
            this.moduleParent = this;
            this.user = blended.getPersistWrapper(this.dataNode, this.ctx.taskid, function () { return { actChildIdx: 0, flag: blended.serviceTypeToPersistFlag(_this.moduleParent.state.moduleType) }; });
            this.exercises = _.filter(this.dataNode.Items, function (it) { return isEx(it); });
        }
        moduleTaskController.prototype.onExerciseLoaded = function (idx) {
            var ud = this.user.short;
            if (blended.persistUserIsDone(ud)) {
                ud.actChildIdx = idx;
                this.user.modified = true;
            }
        };
        moduleTaskController.prototype.adjustChild = function () {
            var _this = this;
            var ud = this.user.short;
            var exNode = blended.persistUserIsDone(ud) ? this.exercises[ud.actChildIdx] : _.find(this.exercises, function (it) { var itUd = blended.getPersistData(it, _this.ctx.taskid); return !blended.persistUserIsDone(itUd); });
            if (!exNode) {
                debugger;
                blended.persistUserIsDone(ud, true);
                this.user.modified = true;
            }
            var moduleExerciseState = _.find(this.state.childs, function (ch) { return !ch.noModuleExercise; });
            var state = {
                params: blended.cloneAndModifyContext(this.ctx, function (d) { return d.url = blended.encodeUrl(exNode.url); }),
                parent: this,
                current: moduleExerciseState,
            };
            return new moduleExerciseState.controller(state, null);
        };
        moduleTaskController.prototype.moveForward = function (sender) {
            var _this = this;
            if (this.inCongratulation) {
                delete this.inCongratulation;
                return blended.moveForwardResult.toParent;
            }
            var ud = this.user.short;
            if (blended.persistUserIsDone(ud)) {
                ud.actChildIdx = ud.actChildIdx == this.exercises.length - 1 ? 0 : ud.actChildIdx + 1;
                this.user.modified = true;
                return blended.moveForwardResult.selfAdjustChild;
            }
            else {
                var exNode = _.find(this.exercises, function (it) { var itUd = blended.getPersistData(it, _this.ctx.taskid); return !blended.persistUserIsDone(itUd); });
                if (!exNode) {
                    blended.persistUserIsDone(ud, true);
                    this.user.modified = true;
                    if (this.pretestParent)
                        return blended.moveForwardResult.toParent;
                    sender.congratulationDialog().then(function () { return sender.greenClick(); }, function () { return sender.greenClick(); });
                    this.inCongratulation = true;
                    return blended.moveForwardResult.selfInnner;
                }
                return blended.moveForwardResult.selfAdjustChild;
            }
        };
        return moduleTaskController;
    })(blended.taskController);
    blended.moduleTaskController = moduleTaskController;
    blended.rootModule
        .filter('vyzva$exmodule$percentheight', function () { return function (per, maxHeight) { return { height: ((100 - per) * maxHeight / 100).toString() + 'px' }; }; })
        .filter('vyzva$exmodule$percentwidth', function () { return function (per, maxWidth) { return { width: ((100 - per) * maxWidth / 100).toString() + 'px' }; }; })
        .filter('vyzva$exmodule$sec', function () { return function (sec) { return sec ? Utils.formatDateTime(sec) : null; }; })
        .filter('vyzva$exmodule$time', function () { return function (sec) { return sec ? Utils.formatTimeSpan(sec) : null; }; })
        .filter('vyzva$exmodule$score', function () { return function (short) { return blended.scoreText(short); }; })
        .directive('vyzva$exmodule$emptytest', function () {
        return {
            scope: { label: '@label', value: '@value', nobr: '@nobr' },
            template: '<span ng-if="value">{{label}}: <b>{{value}}</b></span><br ng-if="!nobr"/>'
        };
    })
        .directive('vyzva$exmodule$scoreprogress', function () {
        return {
            scope: { value: '@value', colors: '@colors' },
            template: '<div ng-class="colors ? colors: \'score-bar\'"><div class="score-text">{{value}}%</div><div class="progress-red" ng-style="value | vyzva$exmodule$percentwidth : 50"></div></div>'
        };
    });
})(blended || (blended = {}));

var blended;
(function (blended) {
    (function (moduleServiceType) {
        moduleServiceType[moduleServiceType["pretest"] = 0] = "pretest";
        moduleServiceType[moduleServiceType["lesson"] = 1] = "lesson";
        moduleServiceType[moduleServiceType["test"] = 2] = "test";
    })(blended.moduleServiceType || (blended.moduleServiceType = {}));
    var moduleServiceType = blended.moduleServiceType;
    function serviceTypeToPersistFlag(st) {
        switch (st) {
            case moduleServiceType.pretest: return CourseModel.CourseDataFlag.blPretestItem;
            case moduleServiceType.lesson: return CourseModel.CourseDataFlag.blLesson;
            case moduleServiceType.test: return CourseModel.CourseDataFlag.blTest;
        }
    }
    blended.serviceTypeToPersistFlag = serviceTypeToPersistFlag;
    function createStateData(data) { return data; }
    blended.createStateData = createStateData;
    //export var globalApi: {
    //  new ($scope: IControllerScope, $state: angular.ui.IStateService, ctx: learnContext): Object;
    //};
    //export var globalApi: Function;
    //zaregistrovany stav (v app.ts)
    var state = (function () {
        function state(st) {
            //this.oldController = <any>(st.controller); var self = this;
            //if (this.oldController) {
            //  var services: Array<any> = ['$scope', '$state' ];
            //  if (st.resolve) for (var p in st.resolve) services.push(p);
            //  services.push(($scope: IControllerScope, $state: angular.ui.IStateService, ...resolves: Array<Object>) => {
            //    var parent: taskController = (<any>($scope.$parent)).ts;
            //    //kontrola jestli nektery z parentu nenastavil isWrongUrl. Pokud ano, vrat fake controller
            //    if (parent && parent.isWrongUrl) {
            //      parent.isWrongUrl = false;
            //      $scope.ts = <any>{ isWrongUrl: true, parent: parent }; return;
            //    }
            //    //neni isWrongUrl, pokracuj
            //    var params = <learnContext><any>($state.params);
            //    finishContext(params);
            //    params.$state = $state;
            //    var ss: IStateService = { current: self, params: params, parent: parent, createMode: createControllerModes.navigate, $scope: $scope };
            //    var task = <controller>(new this.oldController(ss, resolves));
            //    $scope.ts = task;
            //    if (globalApi) {
            //      var api = new globalApi($scope, $state, params);
            //      $scope.api = () => api;
            //    }
            //  });
            //  st.controller = <any>services;
            //}
            $.extend(this, st);
        }
        //******* Inicializace: linearizace state tree na definict states
        state.prototype.initFromStateTree = function (provider, root) {
            var _this = this;
            provider.state(this);
            _.each(this.childs, function (ch) {
                ch.parent = _this;
                ch.name = _this.name + '.' + ch.name;
                ch.initFromStateTree(provider, root);
            });
        };
        return state;
    })();
    blended.state = state;
})(blended || (blended = {}));

var vyzva;
(function (vyzva) {
    function finishHomeDataNode(prod) {
        if (prod.pretest)
            return;
        var urlRoot = '/lm/blcourse/' + LMComLib.LineIds[prod.line].toLowerCase() + '/';
        var levels = _.map(['a1', 'a2', 'b1', 'b2'], function (lev) { return prod.find(urlRoot + lev + '/'); });
        var clonedLessons = _.map(levels, function (lev) { return (_.clone(lev.Items)); }); //pro kazdou level kopie napr. </lm/blcourse/english/a1/>.Items
        var firstEntryTests = _.map(clonedLessons, function (l) { return l.splice(0, 1)[0]; }); //z kopie vyndej prvni prvek (entry test) a dej jej do firstPretests;
        prod.pretest = (prod.find(urlRoot + 'pretests/'));
        prod.entryTests = firstEntryTests;
        prod.lessons = clonedLessons;
    }
    vyzva.finishHomeDataNode = finishHomeDataNode;
    function breadcrumbBase(ctrl, homeOnly) {
        var res = [{ title: 'Moje Online jazykové kurzy a testy', url: '#' + Pager.getHomeUrl() }];
        if (!homeOnly)
            res.push({ title: ctrl.productParent.dataNode.title, url: ctrl.href(ctrl.getProductHomeUrl() /*{ stateName: stateNames.home.name, pars: ctrl.ctx }*/), active: false });
        return res;
    }
    vyzva.breadcrumbBase = breadcrumbBase;
    //services, spolecne pro Vyzva aplikaci. Jsou dostupne v scope.appService
    var appService = (function () {
        function appService(controller) {
            this.controller = controller;
            this.home = (controller.productParent);
        }
        appService.prototype.schoolUserInfo = function (lmcomId) {
            return this.home.intranetInfo.userInfo(lmcomId || this.controller.ctx.userDataId());
        };
        return appService;
    })();
    vyzva.appService = appService;
    //musi souhlasit s D:\LMCom\REW\Web4\BlendedAPI\vyzva\Server\ExcelReport.cs
    (function (reportType) {
        reportType[reportType["managerKeys"] = 0] = "managerKeys";
        reportType[reportType["managerStudy"] = 1] = "managerStudy";
        reportType[reportType["lectorKeys"] = 2] = "lectorKeys";
        reportType[reportType["lectorStudy"] = 3] = "lectorStudy";
    })(vyzva.reportType || (vyzva.reportType = {}));
    var reportType = vyzva.reportType;
    function downloadExcelReport(par) {
        var url = Pager.basicUrl + 'vyzva57services/reports' + "?" + $.param({ reportpar: JSON.stringify(par) });
        blended.downloadExcelFile(url.toLowerCase());
    }
    vyzva.downloadExcelReport = downloadExcelReport;
})(vyzva || (vyzva = {}));

var vyzva;
(function (vyzva) {
    var intranet;
    (function (intranet) {
        //***************** odvozene informace, vhodne pro zobrazeni
        var alocatedKeyRoot = (function () {
            function alocatedKeyRoot(alocatedKeyInfos, //dato, odvozene z companyData
                companyData, userDir, jsonToSave) {
                this.alocatedKeyInfos = alocatedKeyInfos;
                this.companyData = companyData;
                this.userDir = userDir;
                this.jsonToSave = jsonToSave;
            } //null => nezmeneno
            alocatedKeyRoot.prototype.userInfo = function (lmcomId) {
                return this.userDir[lmcomId.toString()];
            };
            return alocatedKeyRoot;
        })();
        intranet.alocatedKeyRoot = alocatedKeyRoot;
        function lmAdminCreateLicenceKeys_request(groups) {
            var res = [];
            //school manager keys: 2 dalsi klice pro spravce (mimo prvniho spravce = self)
            res.push({ line: LMComLib.LineIds.no, num: 2, keys: null });
            //students keys: pro kazdou line a group a pocet
            var lineGroups = _.groupBy(groups, function (g) { return g.line; });
            _.each(lineGroups, function (lineGroup, line) {
                var lg = { line: parseInt(line), num: 3 /*3 klice pro Spravce-visitora*/ + Utils.sum(lineGroup, function (grp) { return grp.num + 6; } /*3 pro lector-visitora, 3 pro lektora*/ /*3 pro lector-visitora, 3 pro lektora*/), keys: null };
                res.push(lg);
            });
            return res;
        }
        intranet.lmAdminCreateLicenceKeys_request = lmAdminCreateLicenceKeys_request;
        function lmAdminCreateLicenceKeys_reponse(groups, respKeys) {
            var useKey = function (line, num) {
                //odeber NUM klicu pro line
                var key = _.find(respKeys, function (k) { return k.line == line; });
                var keyStrs = key.keys.slice(0, num);
                if (keyStrs.length != num)
                    throw 'keyStrs.length != num';
                key.keys.splice(0, num);
                //zkonvertuj lienceId|counter na encoded licence key
                return _.map(keyStrs, function (keyStr) {
                    var parts = keyStr.split('|');
                    return { keyStr: keys.toString({ licId: parseInt(parts[0]), counter: parseInt(parts[1]) }) };
                });
            };
            _.each(groups, function (grp) {
                grp.studentKeys = useKey(grp.line, grp.num);
                grp.visitorsKeys = useKey(grp.line, 3);
                grp.lectorKeys = useKey(grp.line, 3);
            });
            var managerKeys = useKey(LMComLib.LineIds.no, 2);
            //Visitors pro Spravce:
            var lineGroups = _.groupBy(groups, function (g) { return g.line; });
            var visitorsKeys = [];
            _.each(lineGroups, function (lineGroup, line) {
                visitorsKeys.push({ line: parseInt(line), visitorsKeys: useKey(parseInt(line), 3) });
            });
            return { studyGroups: groups, managerKeys: managerKeys, visitorsKeys: visitorsKeys };
        }
        intranet.lmAdminCreateLicenceKeys_reponse = lmAdminCreateLicenceKeys_reponse;
        //******************* zakladni info PO SPUSTENI PRODUKTU
        //informace o licencich a klicich k spustenemu produktu
        function enteredProductInfo(json, licenceKeysStr /*platne licencni klice k produktu*/, cookie) {
            if (_.isEmpty(json))
                return null;
            var licenceKeys = licenceKeysStr.split('#');
            var companyData = (JSON.parse(json));
            var oldJson = JSON.stringify(companyData);
            //linearizace klicu
            var alocList = [];
            alocList.pushArray(_.map(companyData.managerKeys, function (alocKey) { return { key: alocKey, group: null, isLector: false, isVisitor: false, isStudent: false }; }));
            _.each(companyData.studyGroups, function (grp) {
                alocList.pushArray(_.map(grp.lectorKeys, function (alocKey) { return { key: alocKey, group: grp, isLector: true, isVisitor: false, isStudent: false }; }));
                alocList.pushArray(_.map(grp.studentKeys, function (alocKey) { return { key: alocKey, group: grp, isLector: false, isVisitor: false, isStudent: true }; }));
                alocList.pushArray(_.map(grp.visitorsKeys, function (alocKey) { return { key: alocKey, group: grp, isLector: false, isVisitor: true, isStudent: false }; }));
            });
            _.each(companyData.visitorsKeys, function (keys) {
                alocList.pushArray(_.map(keys.visitorsKeys, function (alocKey) { return { key: alocKey, group: null, isLector: false, isVisitor: true, isStudent: false }; }));
            });
            ////student nebo visitor lmcomid => seznam lines. Pomaha zajistit jednoznacn
            //var lmcomIdToLineDir: { [lmcomid: number]: Array<LMComLib.LineIds>; } = {};
            //_.each(_.filter(alocList, l => l.isStudent || l.isVisitor), l => {
            //  var lines = lmcomIdToLineDir[l.key.lmcomId];
            //  if (!lines) lmcomIdToLineDir[l.key.lmcomId] = lines = [];
            //  lines.push(l.group.line);
            //});
            //doplneni udaju do alokovaneho klice uzivatele. Alokovany klice se paruje s licencnim klicem
            var alocatedKeyInfos = [];
            _.each(licenceKeys, function (licenceKey) {
                var alocatedKeyInfo = _.find(alocList, function (k) { return k.key.keyStr == licenceKey; });
                if (!alocatedKeyInfo)
                    return;
                alocatedKeyInfo.key.email = cookie.EMail || cookie.Login;
                alocatedKeyInfo.key.firstName = cookie.FirstName;
                alocatedKeyInfo.key.lastName = cookie.LastName;
                alocatedKeyInfo.key.lmcomId = cookie.id;
                alocatedKeyInfos.push(alocatedKeyInfo);
            });
            //adresar lmcomid => user udaje
            var userDir = {};
            _.each(alocList, function (al) {
                if (!al.key || !al.key.lmcomId)
                    return;
                userDir[al.key.lmcomId.toString()] = al.key;
            });
            var newJson = JSON.stringify(companyData);
            return new alocatedKeyRoot(alocatedKeyInfos, companyData, userDir, oldJson == newJson ? null : newJson);
        }
        intranet.enteredProductInfo = enteredProductInfo;
    })(intranet = vyzva.intranet || (vyzva.intranet = {}));
})(vyzva || (vyzva = {}));


var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var vyzva;
(function (vyzva) {
    var managerLANGMaster = (function (_super) {
        __extends(managerLANGMaster, _super);
        function managerLANGMaster(state, resolves) {
            _super.call(this, state);
            this.enteredProduct = resolves[0];
        }
        return managerLANGMaster;
    })(blended.controller);
    vyzva.managerLANGMaster = managerLANGMaster;
})(vyzva || (vyzva = {}));

var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var vyzva;
(function (vyzva) {
    var managerSchool = (function (_super) {
        __extends(managerSchool, _super);
        function managerSchool($scope, $state, intranetInfo) {
            _super.call(this, $scope, $state);
            this.groupNameCounter = 1;
            this.groups = [];
            this.company = intranetInfo ? intranetInfo.companyData : null;
            this.breadcrumb = vyzva.breadcrumbBase(this, true);
            this.breadcrumb.push({ title: this.title = 'Správa Studijních skupin a Učitelů', active: true });
            if (this.company) {
                this.wizzardStep = 2;
                return;
            }
            this.wizzardStep = 0;
            this.adjustWizzardButtons();
        }
        managerSchool.prototype.downloadLicenceKeys = function (managerIncludeStudents) {
            vyzva.downloadExcelReport({ type: vyzva.reportType.managerKeys, companyId: this.ctx.companyid, managerIncludeStudents: managerIncludeStudents });
        };
        managerSchool.prototype.downloadSummary = function (isStudyAll) {
            vyzva.downloadExcelReport({ type: vyzva.reportType.managerStudy, companyId: this.ctx.companyid, isStudyAll: isStudyAll });
        };
        managerSchool.prototype.addItem = function (line, isPattern3) {
            var item = {
                groupId: managerSchool.groupIdCounter++,
                title: isPattern3 ? blended.lineIdToText(line) + ' pro Studující učitele' : 'Pokročilí' + (this.groupNameCounter++).toString() + ' - 3.A (2015/2016)',
                line: line,
                num: isPattern3 ? 1 : 20,
                isPattern3: isPattern3
            };
            this.groups.splice(0, 0, item);
        };
        managerSchool.prototype.removeItem = function (idx) {
            this.groups.splice(idx, 1);
        };
        managerSchool.prototype.wizzardClick = function (isBack) {
            var _this = this;
            if (!isBack)
                switch (this.wizzardStep) {
                    case 0:
                        this.wizzardStep = 1;
                        break;
                    case 1:
                        var req = vyzva.intranet.lmAdminCreateLicenceKeys_request(this.groups);
                        proxies.vyzva57services.lmAdminCreateLicenceKeys(this.ctx.companyid, req, function (resp) {
                            _this.company = vyzva.intranet.lmAdminCreateLicenceKeys_reponse(_this.groups, resp);
                            /*pred zalozenim company nema sanci mit manager vice klicu. Ten jeden pridej mezi klice spravce*/
                            var actualManagerKey = _this.ctx.lickeys.split('#')[0];
                            var cook = LMStatus.Cookie;
                            _this.company.managerKeys.push({ keyStr: actualManagerKey, email: cook.EMail, firstName: cook.FirstName, lastName: cook.LastName, lmcomId: cook.id });
                            proxies.vyzva57services.lmAdminCreateCompany(_this.ctx.companyid, JSON.stringify(_this.company), function () {
                                _this.wizzardStep = 2;
                                _this.$scope.$apply();
                            });
                        });
                        break;
                }
            else
                switch (this.wizzardStep) {
                    case 1:
                        this.wizzardStep = 0;
                        break;
                }
            this.adjustWizzardButtons();
        };
        managerSchool.prototype.adjustWizzardButtons = function () {
            switch (this.wizzardStep) {
                case 0:
                    this.nextTitle = 'Potvrzení údajů';
                    break;
                case 1:
                    this.nextTitle = 'Údaje v pořádku';
                    break;
            }
        };
        managerSchool.prototype.lineToFlagClass = function (id) {
            switch (id) {
                case LMComLib.LineIds.English: return "flag-small-english";
                case LMComLib.LineIds.German: return "flag-small-german";
                case LMComLib.LineIds.French: return "flag-small-french";
                default: return "???";
            }
        };
        managerSchool.prototype.disabled = function (line) { return _.any(this.groups, function (g) { return g.line == line && g.isPattern3; }); };
        managerSchool.prototype.debugDeletCompany = function () {
            proxies.vyzva57services.writeCompanyData(this.ctx.companyid, null, $.noop);
        };
        managerSchool.$inject = ['$scope', '$state', '$intranetInfo'];
        managerSchool.groupIdCounter = 1;
        return managerSchool;
    })(blended.controller);
    vyzva.managerSchool = managerSchool;
    blended.rootModule
        .filter('vyzva$managerschool$sablonaid', function () {
        return function (id) { return id ? "Učitelé (č.3)" : "Studenti (č.4)"; };
    })
        .directive('vyzva$managerschool$usekey', function () {
        return {
            scope: { item: '&item' },
            templateUrl: 'vyzva$managerschool$usekey.html'
        };
    })
        .directive('vyzva$managerchool$usekeys', function () {
        return {
            scope: { items: '&items', for: '&for' },
            templateUrl: 'vyzva$managerchool$usekeys.html'
        };
    });
})(vyzva || (vyzva = {}));
//class managerSchool_usedKey {
//  constructor($scope) {
//    debugger;
//  }
//}

var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var vyzva;
(function (vyzva) {
    var moduleTaskController = (function (_super) {
        __extends(moduleTaskController, _super);
        function moduleTaskController() {
            _super.apply(this, arguments);
        }
        return moduleTaskController;
    })(blended.moduleTaskController);
    vyzva.moduleTaskController = moduleTaskController;
    var exerciseViewLow = (function (_super) {
        __extends(exerciseViewLow, _super);
        function exerciseViewLow($scope, $state, $loadedEx, $loadedLongData, $modal) {
            _super.call(this, $scope, $state, $loadedEx, $loadedLongData);
            this.$modal = $modal;
        }
        exerciseViewLow.prototype.tbClick = function () { this.greenClick(); };
        exerciseViewLow.prototype.tbNavigateProductHome = function () { this.navigateProductHome(); }; //this.navigate({ stateName: stateNames.home.name, pars: this.ctx }) }
        exerciseViewLow.prototype.confirmWrongScoreDialog = function () {
            return this.$modal.open({
                templateUrl: 'vyzva$exercise$wrongscore.html',
            }).result;
        };
        exerciseViewLow.prototype.congratulationDialog = function () {
            return this.$modal.open({
                templateUrl: 'vyzva$exercise$congratulation.html',
            }).result;
        };
        exerciseViewLow.$inject = ['$scope', '$state', '$loadedEx', '$loadedLongData', '$modal'];
        return exerciseViewLow;
    })(blended.exerciseTaskViewController);
    vyzva.exerciseViewLow = exerciseViewLow;
    var pretestExercise = (function (_super) {
        __extends(pretestExercise, _super);
        function pretestExercise($scope, $state, $loadedEx, $loadedLongData, $modal) {
            _super.call(this, $scope, $state, $loadedEx, $loadedLongData, $modal);
            if (this.isFakeCreate)
                return;
            this.breadcrumb = vyzva.breadcrumbBase(this);
            this.breadcrumb.push({ title: 'Rozřazovací test', url: null, active: true });
            this.tbTitle = 'Pokračovat v testu';
            this.tbDoneTitle = 'Test dokončen';
        }
        return pretestExercise;
    })(exerciseViewLow);
    vyzva.pretestExercise = pretestExercise;
    var lessonExercise = (function (_super) {
        __extends(lessonExercise, _super);
        function lessonExercise($scope, $state, $loadedEx, $loadedLongData, $modal) {
            _super.call(this, $scope, $state, $loadedEx, $loadedLongData, $modal);
            if (this.isFakeCreate)
                return;
            this.breadcrumb = vyzva.breadcrumbBase(this);
            this.breadcrumb.push({ title: this.title, url: null, active: true });
            this.tbTitle = 'Pokračovat v lekci';
            this.tbDoneTitle = 'Lekce dokončena';
        }
        return lessonExercise;
    })(exerciseViewLow);
    vyzva.lessonExercise = lessonExercise;
    var lessonTest = (function (_super) {
        __extends(lessonTest, _super);
        function lessonTest($scope, $state, $loadedEx, $loadedLongData, $modal) {
            _super.call(this, $scope, $state, $loadedEx, $loadedLongData, $modal);
            if (this.isFakeCreate)
                return;
            this.breadcrumb = vyzva.breadcrumbBase(this);
            this.breadcrumb.push({ title: this.title, url: null, active: true });
            this.tbTitle = 'Pokračovat v testu';
            this.tbDoneTitle = 'Test dokončen';
        }
        return lessonTest;
    })(exerciseViewLow);
    vyzva.lessonTest = lessonTest;
})(vyzva || (vyzva = {}));

//namespace vyzva {
//  //export class moduleViewController extends blended.taskViewController {
//  //  constructor($scope: ng.IScope | blended.IStateService, $state?: angular.ui.IStateService) {
//  //    super($scope, $state);
//  //    this.breadcrumb = breadcrumbBase(this);
//  //    this.breadcrumb.push({ title: this.title, url: null, active: true });
//  //  }
//  //}
//} 

var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var vyzva;
(function (vyzva) {
    var pretestViewController = (function (_super) {
        __extends(pretestViewController, _super);
        function pretestViewController($scope, $state) {
            _super.call(this, $scope, $state);
            this.breadcrumb = vyzva.breadcrumbBase(this);
            this.breadcrumb.push({ title: this.title, url: null, active: true });
        }
        return pretestViewController;
    })(blended.taskViewController);
    vyzva.pretestViewController = pretestViewController;
})(vyzva || (vyzva = {}));

var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var vyzva;
(function (vyzva) {
    var lectorController = (function (_super) {
        __extends(lectorController, _super);
        function lectorController($scope, $state) {
            var _this = this;
            _super.call(this, $scope, $state);
            var lectorGroups = this.productParent.lectorGroups;
            this.groupId = parseInt(this.ctx.groupid);
            this.lectorGroup = _.find(lectorGroups, function (grp) { return grp.groupId == _this.groupId; });
        }
        return lectorController;
    })(blended.controller);
    vyzva.lectorController = lectorController;
    var lectorViewBase = (function (_super) {
        __extends(lectorViewBase, _super);
        function lectorViewBase($scope, $state) {
            _super.call(this, $scope, $state);
            this.title = this.lectorParent.lectorGroup.title;
            this.breadcrumb = this.breadcrumbBase();
            this.breadcrumb[this.breadcrumb.length - 1].active = true;
        }
        lectorViewBase.prototype.breadcrumbBase = function () {
            var res = vyzva.breadcrumbBase(this);
            res.push({ title: this.title, url: this.href({ stateName: vyzva.stateNames.lectorHome.name, pars: this.ctx }) });
            return res;
        };
        return lectorViewBase;
    })(blended.controller);
    vyzva.lectorViewBase = lectorViewBase;
    var lectorViewController = (function (_super) {
        __extends(lectorViewController, _super);
        function lectorViewController($scope, $state) {
            _super.call(this, $scope, $state);
            this.breadcrumb[this.breadcrumb.length - 1].active = true;
            this.tabIdx = 0;
            this.students = _.map(this.lectorParent.lectorGroup.studentKeys, function (k) { return { key: k }; });
            this.visitors = _.map(this.lectorParent.lectorGroup.visitorsKeys, function (k) { return { key: k }; });
        }
        lectorViewController.prototype.gotoStudentResult = function (student) {
            var _this = this;
            var ctx = blended.cloneAndModifyContext(this.ctx, function (c) {
                c.onbehalfof = student.key.lmcomId;
                c.returnurl = _this.href({ stateName: vyzva.stateNames.lectorHome.name, pars: _this.ctx });
            });
            this.navigate({ stateName: vyzva.stateNames.home.name, pars: ctx });
        };
        lectorViewController.prototype.downloadLicenceKeys = function () {
            vyzva.downloadExcelReport({ type: vyzva.reportType.lectorKeys, companyId: this.ctx.companyid, groupId: this.lectorParent.groupId });
        };
        lectorViewController.prototype.downloadSummary = function (isStudyAll) {
            vyzva.downloadExcelReport({ type: vyzva.reportType.lectorStudy, companyId: this.ctx.companyid, groupId: this.lectorParent.groupId, isStudyAll: isStudyAll });
        };
        return lectorViewController;
    })(lectorViewBase);
    vyzva.lectorViewController = lectorViewController;
    blended.rootModule
        .directive('vyzva$lector$user', function () {
        return {
            scope: { student: '&student', ts: '&ts' },
            templateUrl: 'vyzva$lector$user.html'
        };
    })
        .directive('vyzva$lector$users', function () {
        return {
            scope: { students: '&students', ts: '&ts' },
            templateUrl: 'vyzva$lector$users.html'
        };
    })
        .directive('vyzva$lector$visitors', function () {
        return {
            scope: { students: '&students', ts: '&ts' },
            templateUrl: 'vyzva$lector$visitors.html'
        };
    })
        .directive('vyzva$lector$visitor', function () {
        return {
            scope: { student: '&student', ts: '&ts' },
            templateUrl: 'vyzva$lector$visitor.html'
        };
    });
})(vyzva || (vyzva = {}));

var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var vyzva;
(function (vyzva) {
    (function (homeLessonStates) {
        homeLessonStates[homeLessonStates["no"] = 0] = "no";
        homeLessonStates[homeLessonStates["entered"] = 1] = "entered";
        homeLessonStates[homeLessonStates["done"] = 2] = "done";
    })(vyzva.homeLessonStates || (vyzva.homeLessonStates = {}));
    var homeLessonStates = vyzva.homeLessonStates;
    (function (rightButtonTypes) {
        rightButtonTypes[rightButtonTypes["no"] = 0] = "no";
        rightButtonTypes[rightButtonTypes["run"] = 1] = "run";
        rightButtonTypes[rightButtonTypes["preview"] = 2] = "preview";
    })(vyzva.rightButtonTypes || (vyzva.rightButtonTypes = {}));
    var rightButtonTypes = vyzva.rightButtonTypes;
    (function (leftMarkTypes) {
        leftMarkTypes[leftMarkTypes["no"] = 0] = "no";
        leftMarkTypes[leftMarkTypes["active"] = 1] = "active";
        leftMarkTypes[leftMarkTypes["pretestLevel"] = 2] = "pretestLevel";
        leftMarkTypes[leftMarkTypes["progress"] = 3] = "progress";
        leftMarkTypes[leftMarkTypes["waitForEvaluation"] = 4] = "waitForEvaluation";
    })(vyzva.leftMarkTypes || (vyzva.leftMarkTypes = {}));
    var leftMarkTypes = vyzva.leftMarkTypes;
    //****************** VIEW
    var homeLesson = (function (_super) {
        __extends(homeLesson, _super);
        function homeLesson() {
            _super.apply(this, arguments);
        }
        return homeLesson;
    })(blended.moduleServiceLow);
    vyzva.homeLesson = homeLesson;
    var homeViewController = (function (_super) {
        __extends(homeViewController, _super);
        function homeViewController($scope, $state) {
            var _this = this;
            _super.call(this, $scope, $state);
            this.breadcrumb = vyzva.breadcrumbBase(this);
            this.breadcrumb[1].active = true;
            var pretestItem;
            var pretestUser;
            var firstNotDoneCheckTestIdx; //index prvnio nehotoveho kontrolniho testu
            var fromNode = function (node, idx) {
                var res = new homeLesson(node, idx == 0 ? blended.moduleServiceType.pretest : (node.url.indexOf('/test') > 0 ? blended.moduleServiceType.test : blended.moduleServiceType.lesson), _this, true);
                res.idx = idx;
                var nodeUser = blended.getPersistData(node, _this.ctx.taskid);
                if (idx == 0) {
                    res.user = blended.pretestScore((node), nodeUser, _this.ctx.taskid);
                    pretestUser = res.user = $.extend(res.user, nodeUser);
                }
                else {
                    res.user = blended.agregateShortFromNodes(res.node, _this.ctx.taskid, false);
                }
                res.status = !res.user ? homeLessonStates.no : (blended.persistUserIsDone(res.user) ? homeLessonStates.done : homeLessonStates.entered);
                //lesson nejde spustit
                //res.cannotRun = this.ctx.onbehalfof && res.lessonType != blended.moduleServiceType.lesson && res.status != homeLessonStates.done;
                //rightButtonType management: vsechny nehotove dej RUN a ev. nastav index prvniho nehotoveho check testu
                if (res.lessonType != blended.moduleServiceType.pretest)
                    res.rightButtonType = res.status == homeLessonStates.done ? rightButtonTypes.preview : rightButtonTypes.run;
                if (!firstNotDoneCheckTestIdx && res.lessonType == blended.moduleServiceType.test && res.status != homeLessonStates.done)
                    firstNotDoneCheckTestIdx = idx;
                //left mark
                if (blended.persistUserIsDone(res.user)) {
                    res.leftMarkType = res.lessonType == blended.moduleServiceType.pretest ? leftMarkTypes.pretestLevel : (res.user.waitForEvaluation ? leftMarkTypes.waitForEvaluation : leftMarkTypes.progress);
                }
                return res;
            };
            this.lessons = [pretestItem = fromNode(this.myTask.dataNode.pretest, 0)];
            if (pretestUser && blended.persistUserIsDone(pretestUser)) {
                this.pretestLevels = pretestUser.history;
                this.pretestLevel = pretestUser.targetLevel;
                this.lessons.push(fromNode(this.myTask.dataNode.entryTests[this.pretestLevel], 1));
                this.lessons.pushArray(_.map(this.myTask.dataNode.lessons[this.pretestLevel], function (nd, idx) { return fromNode(nd, idx + 2); }));
            }
            //rightButtonType management: vsechna cviceni za firstNotDoneCheckTestIdx dej rightButtonTypes=no
            for (var i = firstNotDoneCheckTestIdx + 1; i < this.lessons.length; i++)
                this.lessons[i].rightButtonType = rightButtonTypes.no;
            //prvni nehotovy node je aktivni
            _.find(this.lessons, function (pl) {
                if (pl.status == homeLessonStates.done)
                    return false;
                pl.active = true;
                pl.leftMarkType = leftMarkTypes.active;
                return true;
            });
            //skore za cely kurz
            //var users = _.map(_.filter(this.lessons, l => /*l.status == homeLessonStates.done &&*/ l.lessonType != blended.moduleServiceType.pretest), l=> l.user);
            var users = _.map(this.lessons, function (l) { return l.user; });
            this.user = blended.agregateShorts(users);
            //this.score = blended.scorePercent(this.user);
        }
        homeViewController.prototype.navigateLesson = function (lesson) {
            var _this = this;
            //if (lesson.cannotRun) return;
            var service = {
                params: lesson.lessonType == blended.moduleServiceType.pretest ?
                    blended.cloneAndModifyContext(this.ctx, function (d) { return d.pretesturl = blended.encodeUrl(_this.myTask.dataNode.pretest.url); }) :
                    blended.cloneAndModifyContext(this.ctx, function (d) { return d.moduleurl = blended.encodeUrl(lesson.node.url); }),
                current: lesson.lessonType == blended.moduleServiceType.pretest ?
                    vyzva.stateNames.pretestTask :
                    (lesson.lessonType == blended.moduleServiceType.test ? vyzva.stateNames.moduleTestTask : vyzva.stateNames.moduleLessonTask),
                parent: this.myTask,
            };
            var nextTask = lesson.lessonType == blended.moduleServiceType.pretest ?
                new blended.pretestTaskController(service) :
                new vyzva.moduleTaskController(service);
            var url = nextTask.goCurrent();
            this.navigate(url);
            //this.myTask.child = lesson.lessonType == blended.moduleServiceType.pretest ?
            //  new blended.pretestTaskController(service) :
            //  new moduleTaskController(service);
            //var url = this.myTask.child.goCurrent();
        };
        ;
        homeViewController.prototype.navigatePretestLevel = function (lev) {
            var _this = this;
            var service = {
                params: blended.cloneAndModifyContext(this.ctx, function (d) { var mod = _this.myTask.dataNode.pretest.Items[lev]; d.moduleurl = blended.encodeUrl(mod.url); }),
                current: vyzva.stateNames.pretestPreview,
                //current: blended.prodStates.pretestModule,
                parent: this.myTask,
            };
            var nextTask = new vyzva.moduleTaskController(service);
            var url = nextTask.goCurrent();
            this.navigate(url);
            //this.myTask.child = new moduleTaskController(service);
            //var url = this.myTask.child.goCurrent();
        };
        homeViewController.prototype.gotoLector = function (groupId) {
            this.navigate({ stateName: vyzva.stateNames.lectorHome.name, pars: { groupid: groupId } });
        };
        homeViewController.prototype.debugClearProduct = function () {
            proxies.vyzva57services.debugClearProduct(this.ctx.companyid, this.ctx.userDataId(), this.ctx.productUrl, function () { return location.reload(); });
        };
        return homeViewController;
    })(blended.taskViewController);
    vyzva.homeViewController = homeViewController;
    //****************** TASK
    var homeTaskController = (function (_super) {
        __extends(homeTaskController, _super);
        function homeTaskController($scope, $state, product, intranetInfo) {
            _super.call(this, $scope, $state, product);
            this.intranetInfo = intranetInfo;
            //constructor(state: blended.IStateService, resolves: Array<any>) {
            //  super(state, resolves);
            this.productParent = this;
            this.user = blended.getPersistWrapper(this.dataNode, this.ctx.taskid, function () { return { startDate: Utils.nowToNum(), flag: CourseModel.CourseDataFlag.blProductHome }; });
            //Intranet
            //this.intranetInfo = intranetInfo;
            if (!this.intranetInfo)
                return;
            var alocatedKeyInfos = this.intranetInfo.alocatedKeyInfos;
            this.lectorGroups = _.map(_.filter(alocatedKeyInfos, function (inf) { return inf.isLector; }), function (inf) { return inf.group; });
            var studentGroups = _.map(_.filter(alocatedKeyInfos, function (inf) { return inf.isStudent || inf.isVisitor; }), function (inf) { return inf.group; });
            //this.studentGroup = studentGroups.length > 0 ? studentGroups[0] : null;
            this.showLectorPart = !this.ctx.onbehalfof && this.lectorGroups.length > 0;
            this.showStudentPart = studentGroups.length > 0;
        }
        homeTaskController.$inject = ['$scope', '$state', '$loadedProduct', '$intranetInfo'];
        return homeTaskController;
    })(blended.homeTaskController);
    vyzva.homeTaskController = homeTaskController;
    blended.rootModule
        .filter('vyzva$home$nodeclass', function () {
        return function (lesson) {
            if (lesson.active && lesson.lessonType != blended.moduleServiceType.pretest)
                return "list-group-item-success-primary";
            else if (lesson.status == homeLessonStates.done || (lesson.active && lesson.lessonType == blended.moduleServiceType.pretest))
                return "list-group-item-success";
        };
    })
        .directive('vyzva$common$summary', function () {
        return {
            scope: { user: '&user' },
            templateUrl: 'vyzva$common$summary.html'
        };
    });
})(vyzva || (vyzva = {}));

var vyzva;
(function (vyzva) {
    blended.rootModule
        .directive('vyzva$lector$tabs', function () { return new lectorTabs(); });
    var lectorTabs = (function () {
        function lectorTabs() {
            this.link = function (scope, el) {
                scope.tabs = getLectorTabs();
                scope.navigate = function (idx) {
                    var actIdx = (scope.actIdx());
                    if (idx == actIdx)
                        return;
                    var doNavigate = (scope.doNavigate());
                    var tab = getLectorTabs()[idx];
                    doNavigate(tab.stateName);
                };
            };
            this.templateUrl = 'vyzva$lector$tabs.html';
            this.scope = { doNavigate: '&doNavigate', actIdx: '&actIdx', longTitle: '&longTitle' };
        }
        return lectorTabs;
    })();
    vyzva.lectorTabs = lectorTabs;
    var tabs;
    function getLectorTabs() {
        return tabs || [
            { idx: 0, stateName: vyzva.stateNames.lectorHome.name, shortTitle: 'Seznam studentů' },
            { idx: 1, stateName: vyzva.stateNames.lectorEval.name, shortTitle: 'Vyhodnocení testů' }
        ];
    }
    vyzva.getLectorTabs = getLectorTabs;
})(vyzva || (vyzva = {}));

var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var vyzva;
(function (vyzva) {
    vyzva.vyzvaRoot = blended.baseUrlRelToRoot + '/blendedapi/vyzva/';
    //*************** RESOLVERs
    //adjust produkt
    vyzva.loadProduct = ['$stateParams', function (ctx) {
            blended.finishContext(ctx);
            ctx.finishProduct = vyzva.finishHomeDataNode;
            return blended.loader.adjustProduct(ctx);
        }];
    vyzva.loadIntranetInfo = function () { return ['$stateParams', function (ctx) {
            blended.finishContext(ctx);
            var def = ctx.$q.defer();
            proxies.vyzva57services.loadCompanyData(ctx.companyid, function (res) {
                if (!res) {
                    def.resolve(null);
                    return;
                }
                var compInfo = vyzva.intranet.enteredProductInfo(res, ctx.lickeys, LMStatus.Cookie);
                if (compInfo && compInfo.jsonToSave) {
                    proxies.vyzva57services.writeCompanyData(ctx.companyid, compInfo.jsonToSave, function () { return def.resolve(compInfo); });
                }
                else
                    def.resolve(compInfo);
            });
            return def.promise;
        }]; };
    vyzva.stateNames = {}; //taskRoot: 'root', taskCheckTest: 'checktest', taskLesson: 'lesson', taskPretest: 'pretest', taskPretestItem: 'pretestitem' };
    vyzva.initVyzvaApp = ['$rootScope', '$location', '$state', function ($rootScope, $location, $state) {
            //$rootScope.$on('$locationChangeStart', (event: angular.IAngularEvent, newUrl: string, oldUrl: string, newState, oldState) => {
            //})
            //sance zrusit ladovani stranky
            //$rootScope.$on('$stateChangeStart', (e, toState, toParams, fromState, fromParams) => {
            $rootScope.$on('$stateChangeSuccess', function (e, toState, toParams, fromState, fromParams) {
                $rootScope.$broadcast('onStateChangeSuccess'); //sance pred ulozenim produktu naplnit data. Vyuzije pro volani exerciseService.onDestroy
                var prod = blended.loader.productCache.fromCache(fromParams).prod;
                if (prod)
                    prod.saveProduct(fromParams, $.noop);
            });
        }];
    var state = (function (_super) {
        __extends(state, _super);
        function state(st) {
            _super.call(this, st);
        }
        return state;
    })(blended.state);
    vyzva.state = state;
    blended.rootModule
        .filter('vyzva$state$viewpath', function () { return function (id) { return vyzva.vyzvaRoot + 'views/' + id + '.html'; }; });
    var pageTemplate = vyzva.vyzvaRoot + 'views/_pageTemplate.html';
    function initVyzvaStates(params) {
        vyzva.stateNames.root = new state({
            name: 'pg.ajs',
            url: '/ajs',
            abstract: true,
            controller: function () { Pager.clearHtml(); },
            template: "<div data-ui-view></div>",
            onEnter: function () { return anim.inAngularjsGui = true; },
            onExit: function () { return anim.inAngularjsGui = false; },
            childs: [
                new state({
                    name: 'managers',
                    url: "/vyzva/managers/:companyid/:loginid/:lickeys",
                    template: "<div data-ui-view></div>",
                    abstract: true,
                    childs: [
                        vyzva.stateNames.shoolManager = new state({
                            name: 'schoolmanager',
                            url: "/schoolmanager",
                            templateUrl: pageTemplate,
                            layoutContentId: 'managerschool',
                            controller: vyzva.managerSchool,
                            resolve: {
                                $intranetInfo: vyzva.loadIntranetInfo(),
                            },
                        }),
                    ]
                }),
                blended.prodStates.homeTask = vyzva.stateNames.homeTask = new state({
                    name: 'vyzva',
                    //lickeys ve formatu <UserLicences.LicenceId>|<UserLicences.Counter>#<UserLicences.LicenceId>|<UserLicences.Counter>...
                    url: "/vyzva/:companyid/:loginid/:persistence/:loc/:lickeys/:producturl/:taskid/:onbehalfof?returnurl",
                    dataNodeUrlParName: 'productUrl',
                    controller: vyzva.homeTaskController,
                    controllerAs: blended.taskContextAs.product,
                    abstract: true,
                    resolve: {
                        $loadedProduct: vyzva.loadProduct,
                        $intranetInfo: vyzva.loadIntranetInfo(),
                    },
                    template: "<div data-ui-view></div>",
                    childs: [
                        blended.prodStates.home = vyzva.stateNames.home = new state({
                            name: 'home',
                            url: "/home",
                            controller: vyzva.homeViewController,
                            layoutContentId: 'home',
                            templateUrl: pageTemplate,
                        }),
                        vyzva.stateNames.lector = new state({
                            name: 'lector',
                            url: "/lector/:groupid",
                            controller: vyzva.lectorController,
                            controllerAs: blended.taskContextAs.lector,
                            abstract: true,
                            template: "<div data-ui-view></div>",
                            childs: [
                                vyzva.stateNames.lectorHome = new state({
                                    name: 'home',
                                    url: "/home",
                                    controller: vyzva.lectorViewController,
                                    layoutContentId: 'lector',
                                    templateUrl: pageTemplate,
                                }),
                            ]
                        }),
                        vyzva.stateNames.pretestTask = new state({
                            name: 'pretest',
                            url: '/pretest/:pretesturl',
                            controller: blended.pretestTaskController,
                            controllerAs: blended.taskContextAs.pretest,
                            dataNodeUrlParName: 'pretestUrl',
                            //isGreenArrowRoot:true,
                            abstract: true,
                            template: "<div data-ui-view></div>",
                            childs: [
                                vyzva.stateNames.pretest = new state({
                                    name: 'home',
                                    url: "/home",
                                    layoutContentId: 'pretest',
                                    controller: vyzva.pretestViewController,
                                    templateUrl: pageTemplate,
                                }),
                                blended.prodStates.pretestModule = new state({
                                    name: 'test',
                                    url: '/test/:moduleurl',
                                    controller: vyzva.moduleTaskController,
                                    controllerAs: blended.taskContextAs.module,
                                    dataNodeUrlParName: 'moduleUrl',
                                    abstract: true,
                                    moduleType: blended.moduleServiceType.pretest,
                                    template: "<div data-ui-view></div>",
                                    childs: [
                                        blended.prodStates.pretestExercise = vyzva.stateNames.pretestExercise = new state({
                                            name: 'ex',
                                            url: '/ex/:url',
                                            controller: vyzva.pretestExercise,
                                            controllerAs: blended.taskContextAs.ex,
                                            dataNodeUrlParName: 'Url',
                                            layoutSpecial: true,
                                            layoutContentId: 'exercise',
                                            //layoutToolbarType: 'toolbar/run',
                                            ignorePageTitle: true,
                                            //exerciseIsTest: true,
                                            //exerciseOmitModuleMap: true,
                                            resolve: {
                                                $loadedEx: blended.loadEx,
                                                $loadedLongData: blended.loadLongData,
                                            },
                                            templateUrl: pageTemplate,
                                        })
                                    ]
                                }),
                            ]
                        }),
                        vyzva.stateNames.pretestPreview = new state({
                            name: 'testview',
                            url: '/testview/:moduleurl',
                            controller: vyzva.moduleTaskController,
                            controllerAs: blended.taskContextAs.module,
                            dataNodeUrlParName: 'moduleUrl',
                            moduleType: blended.moduleServiceType.pretest,
                            //isGreenArrowRoot: true,
                            abstract: true,
                            template: "<div data-ui-view></div>",
                            childs: [
                                new state({
                                    name: 'ex',
                                    url: '/:url',
                                    controller: vyzva.lessonTest,
                                    controllerAs: blended.taskContextAs.ex,
                                    //exerciseIsTest: true,
                                    dataNodeUrlParName: 'Url',
                                    layoutSpecial: true,
                                    layoutContentId: 'exercise',
                                    resolve: {
                                        $loadedEx: blended.loadEx,
                                        $loadedLongData: blended.loadLongData,
                                    },
                                    templateUrl: pageTemplate,
                                })
                            ]
                        }),
                        vyzva.stateNames.moduleLessonTask = new state({
                            name: 'lesson',
                            url: '/lesson/:moduleurl',
                            controller: vyzva.moduleTaskController,
                            controllerAs: blended.taskContextAs.module,
                            dataNodeUrlParName: 'moduleUrl',
                            //isGreenArrowRoot: true,
                            moduleType: blended.moduleServiceType.lesson,
                            abstract: true,
                            template: "<div data-ui-view></div>",
                            childs: [
                                new state({
                                    name: 'ex',
                                    url: '/:url',
                                    controller: vyzva.lessonExercise,
                                    controllerAs: blended.taskContextAs.ex,
                                    dataNodeUrlParName: 'Url',
                                    layoutSpecial: true,
                                    layoutContentId: 'exercise',
                                    //layoutToolbarType: 'toolbar/run',
                                    resolve: {
                                        $loadedEx: blended.loadEx,
                                        $loadedLongData: blended.loadLongData,
                                    },
                                    templateUrl: pageTemplate,
                                }),
                            ]
                        }),
                        vyzva.stateNames.moduleTestTask = new state({
                            name: 'test',
                            url: '/test/:moduleurl',
                            controller: vyzva.moduleTaskController,
                            controllerAs: blended.taskContextAs.module,
                            dataNodeUrlParName: 'moduleUrl',
                            //isGreenArrowRoot: true,
                            abstract: true,
                            template: "<div data-ui-view></div>",
                            moduleType: blended.moduleServiceType.test,
                            childs: [
                                new state({
                                    name: 'ex',
                                    url: '/:url',
                                    controller: vyzva.lessonTest,
                                    controllerAs: blended.taskContextAs.ex,
                                    //exerciseIsTest: true,
                                    dataNodeUrlParName: 'Url',
                                    layoutSpecial: true,
                                    layoutContentId: 'exercise',
                                    //layoutToolbarType: 'toolbar/run',
                                    resolve: {
                                        $loadedEx: blended.loadEx,
                                        $loadedLongData: blended.loadLongData,
                                    },
                                    templateUrl: pageTemplate,
                                })
                            ]
                        })
                    ]
                })
            ]
        });
        vyzva.stateNames.root.initFromStateTree(params.$stateProvider);
    }
    vyzva.initVyzvaStates = initVyzvaStates;
})(vyzva || (vyzva = {}));

var blended;
(function (blended) {
    var Module = (function () {
        function Module() {
            var self = this;
            this.app = blended.rootModule;
        }
        Module.prototype.href = function (stateName, params, options) {
            return this.$oldActState.href(stateName, params);
        };
        return Module;
    })();
    blended.Module = Module;
    var OldController = (function () {
        function OldController($scope, $state) {
            blended.root.$oldActState = $state;
            //prevezmi parametry
            var urlParts = [];
            for (var p = 0; p < 6; p++) {
                var parName = 'p' + p.toString();
                var val = $state.params[parName];
                if (val === undefined)
                    break;
                urlParts.push($state.params[parName]);
            }
            //procedura pro vytvoreni stareho modelu
            var createProc = $state.current.data['createModel'];
            //vytvor page model a naladuj stranku
            $scope.$on('$viewContentLoaded', function () {
                Pager.loadPage(createProc(urlParts));
            });
        }
        ;
        OldController.$inject = ['$scope', '$state'];
        return OldController;
    })();
    blended.OldController = OldController;
    blended.prodStates = {};
    blended.root = new Module();
    blended.rootScope;
    blended.templateCache;
    blended.compile;
    blended.rootModule
        .directive('lmInclude', function () {
        return {
            restrict: 'A',
            templateUrl: function (ele, attrs) { return attrs.lmInclude; },
        };
    })
        .run(vyzva.initVyzvaApp)
        .run(['$rootScope', '$location', '$templateCache', '$compile', function ($rootScope, $location, $templateCache, $compile) {
            blended.rootScope = $rootScope;
            blended.templateCache = $templateCache;
            blended.compile = $compile;
            $rootScope.$on('$locationChangeStart', function (event, newUrl, oldUrl, newState, oldState) {
                if (Pager.angularJS_OAuthLogin(location.hash, function () { return Pager.gotoHomeUrl(); }))
                    event.preventDefault();
            });
        }]);
    blended.root.app.config(['$stateProvider', '$urlRouterProvider', '$locationProvider', '$urlMatcherFactoryProvider', function (//'$provide', (
            $stateProvider, $urlRouterProvider, $location, $urlMatcherFactoryProvider, $provide) {
            //routerLogging($provide);
            $urlMatcherFactoryProvider.caseInsensitive(true); //http://stackoverflow.com/questions/25994308/how-to-config-angular-ui-router-to-not-use-strict-url-matching-mode
            //Nefunguje pak browser historie
            //$urlMatcherFactoryProvider.type("urlType", { //http://stackoverflow.com/questions/27849260/angular-ui-sref-encode-parameter
            //  encode: (val: string) => val ? (val[0]=='/' ? val.replace(/\//g, '@') : val) : val,
            //  decode: (val: string) => val ? val.replace(/@/g, '/') : val,
            //  is: item => _.isString(item) && item[0] == '/',
            //  //equal: (v1: string, v2: string) => false,
            //});
            $urlRouterProvider.otherwise('/pg/old/school/schoolmymodel');
            function checkOldApplicationStart() {
                return angular.injector(['ng']).invoke(['$q', function ($q) {
                        var deferred = $q.defer();
                        boot.bootStart(function () { return deferred.resolve(); });
                        return deferred.promise;
                    }]);
            }
            $stateProvider
                .state({
                name: 'pg',
                url: '/pg',
                abstract: true,
                template: "<div data-ui-view></div>",
                //***** preload common templates
                //templateUrl: blended.baseUrlRelToRoot + '/courses/angularjs/angularjs.html',
                resolve: {
                    checkOldApplicationStart: checkOldApplicationStart //ceka se na dokonceni inicalizace nasi technologie
                }
            })
                .state({
                name: 'pg.old',
                url: '/old',
                abstract: true,
                template: "<div data-ui-view></div>",
            });
            //stavy pro starou verzi
            var params = {
                $stateProvider: $stateProvider,
                $urlRouterProvider: $urlRouterProvider,
                $urlMatcherFactoryProvider: $urlMatcherFactoryProvider,
                $location: $location,
                app: blended.root.app
            };
            _.each(blended.oldLocators, function (createLoc) { return createLoc(params); }); //vytvoreni states na zaklade registrovanych page models (pomoci registerOldLocator)
            //stavy pro novou verzi
            vyzva.initVyzvaStates(params);
            //log vsech validnich routes
            _.each(blended.debugAllRoutes, function (r) { return Logger.trace("Pager", 'Define:' + r); });
        }]);
    //dokumentace pro dostupne services
    function servicesDocumentation() {
        //https://docs.angularjs.org/api/ng/function/angular.injector
        //http://stackoverflow.com/questions/17497006/use-http-inside-custom-provider-in-app-config-angular-js
        //https://docs.angularjs.org/api/ng/service/$sce
        var initInjector = angular.injector(['ng']);
        var $http = initInjector.get('$http');
        var $q = initInjector.get('$q');
        var srv = initInjector.get('$filter');
        srv = initInjector.get('$timeout');
        srv = initInjector.get('$log');
        srv = initInjector.get('$rootScope');
        //srv = initInjector.get('$location'); nefunguje
        srv = initInjector.get('$parse');
        //srv = initInjector.get('$rootElement'); nefunguje
    }
    blended.servicesDocumentation = servicesDocumentation;
})(blended || (blended = {}));