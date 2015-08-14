var __extends = this.__extends || function (d, b) {
  for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
  function __() { this.constructor = d; }
  __.prototype = b.prototype;
  d.prototype = new __();
};
// <reference path="../jslib/jsd/knockout.d.ts" />
var schoolMy;
(function (schoolMy) {
  var errWrongFormat = function () {
    return CSLocalize('52e17a9a1f654e1893f5cb9131cc1762', 'Incorrect format of the License key. Please, check if you entered it correctly.');
  };
  var errUsed = function () {
    return CSLocalize('28df461f6e2c47f7a8cde96ed974be9e', 'License key used by another user');
  };
  var errAdded = function () {
    return CSLocalize('7a824dbe23b34680b5149663ac66ed24', 'License key already entered');
  };
  var errOK = function () {
    return CSLocalize('6e8be0cf1d8e411cb0876ae1aea57c4c', 'License key accepted');
  };

  var Model = (function (_super) {
    __extends(Model, _super);
    function Model() {
      var _this = this;
      _super.call(this, schools.tMy, null);
      this.licKey = validate.create(4 /* rangelength */, function (prop) {
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
        } catch (err) {
          _this.licKey.message(errWrongFormat());
          return;
        }
        Pager.ajaxGet(1 /* restServices */, Login.CmdEnterLicKey_Type, Login.CmdEnterLicKey_Create(LMStatus.Cookie.id, k.licId, k.counter), function (res) {
          switch (res.res) {
            case 0 /* ok */:
              //this.licKey.message(errOK());
              _this.licKey("");
              Login.adjustMyData(true, function () {
                return Pager.reloadPage(_this);
              });
              anim.collapseExpanded();

              //Pager.closePanels();
              return;
            case 1 /* added */:
              _this.licKey.message(errAdded());
              return;
            case 2 /* used */:
              _this.licKey.message(errUsed());
              return;
            case 4 /* wrongCounter */:
            case 3 /* wrongId */:
              _this.licKey.message(errWrongFormat());
              return;
          }
        });
      };
    }
    Model.prototype.doUpdate = function (completed) {
      this.systemAdmin = Login.isSystemAdmin() ? function () {
        return LMStatus.setReturnUrlAndGoto("schoolAdmin@schoolAdminModel");
      } : null;

      //var hasCompany = /*this.systemAdmin != null || Login.companyExists();
      if (Login.companyExists()) {
        this.companies = _.map(Login.myData.Companies, function (c) {
          TreeView.adjustParents(c.DepTree.Departments);
          var comp = {
            title: c.Title, items: [], courses: null, data: c,
            department: ko.observable(TreeView.findNode(c.DepTree.Departments, function (d) {
              return d.Id == c.DepSelected;
            })),
            treeViewModel: null
          };
          if (c.DepTree.Departments)
            comp.treeViewModel = new TreeView.Model(c.DepTree.Departments, false, null, {
              withCheckbox: false,
              editable: false,
              onLinkClick: function (nd) {
                Pager.ajaxGet(1 /* restServices */, Login.CmdSaveDepartment_Type, Login.CmdSaveDepartment_Create(LMStatus.Cookie.id, c.Id, (nd.data).Id), function (res) {
                  comp.department((nd.data));
                  anim.collapseExpanded();
                });
              }
            });
          var it;
          if ((c.Roles & 32768 /* Admin */) != 0)
            comp.items.push(it = {
              id: 'manage_admin',
              title: CSLocalize('7dbd71d1e623446e884febbd07c72f9f', 'Manage administrators and their roles'),
              //gotoItem: () => LMStatus.setReturnUrlAndGoto("schoolAdmin@schoolCompAdminsModel@" + c.Id.toString())
              gotoItem: function () {
                return location.hash = schoolAdmin.getHash(schoolAdmin.compAdminsTypeName, c.Id);
              }
            });
          if ((c.Roles & 2 /* Products */) != 0)
            comp.items.push(it = {
              id: 'manage_products',
              title: CSLocalize('fd0acec43f7d487ba635b4a55343b23a', 'Manage products'),
              //gotoItem: () => LMStatus.setReturnUrlAndGoto("schoolAdmin@schoolProductsModel@" + c.Id.toString())
              gotoItem: function () {
                return location.hash = schoolAdmin.getHash(schoolAdmin.productsTypeName, c.Id);
              }
            });
          if ((c.Roles & 1 /* Keys */) != 0)
            comp.items.push(it = {
              id: 'gen_keys',
              title: CSLocalize('643da9a0b02b4e209e26e20ca620f54c', 'Generate license keys'),
              //gotoItem: () => LMStatus.setReturnUrlAndGoto("schoolAdmin@schoolKeyGenModel@" + c.Id.toString())
              gotoItem: function () {
                return location.hash = schoolAdmin.getHash(schoolAdmin.keyGenTypeName, c.Id);
              }
            });
          if ((c.Roles & 4 /* Department */) != 0)
            comp.items.push(it = {
              id: 'edit_criteria',
              title: CSLocalize('9231de5764184fd7a75389aa2ecfdad5', 'Edit Department structure and criteria for tracking study results'),
              //gotoItem: () => LMStatus.setReturnUrlAndGoto("schoolAdmin@schoolDepartmentModel@" + c.Id.toString())
              gotoItem: function () {
                return location.hash = schoolAdmin.getHash(schoolAdmin.editDepartmentTypeName, c.Id);
              }
            });
          if ((c.Roles & 8 /* Results */) != 0)
            comp.items.push(it = {
              id: 'view_students_results',
              title: CSLocalize('2fb8a691d86e4f4181dba3f48708a363', 'View Student results'),
              //gotoItem: () => LMStatus.setReturnUrlAndGoto("schoolAdmin@schoolUserResultsModel@" + c.Id.toString())
              gotoItem: function () {
                return location.hash = schoolAdmin.getHash(schoolAdmin.schoolUserResultsTypeName, c.Id);
              }
            });
          comp.courses = [];
          _.each(c.Courses, function (crs) {
            var pr = CourseMeta.lib.findProduct(crs.ProductId);
            if (!pr)
              return null;
            var res = {
              expired: Utils.intToDate(crs.Expired), line: pr.line, title: pr.title, prodId: crs.ProductId.toString(),
              isTest: CourseMeta.lib.isTest(pr),
              data: crs,
              myCompany: comp,
              gotoUrl: function (dt) {
                if (dt.isTest && dt.data.LicCount == 0)
                  return;
                if (dt.myCompany.data.DepTree && dt.myCompany.data.DepTree.Departments && !dt.myCompany.department()) {
                  alert(CSLocalize('a85c8a527bb44bda9a7ee0721707d2ef', 'Choose company department (by clicking on [Change] link above)'));
                  return;
                }
                var hash = dt.isTest ? testMe.createUrl(null, c.Id, crs.ProductId) : new CourseMeta.dataImpl().href(c.Id, crs.ProductId);

                //debug
                //if (dt.isTest) Login.createArchive(dt.myCompany.data.Id, dt.prodId, $.noop); else //debug
                if (dt.isTest)
                  testMe.alowTestCreate_Url = crs.ProductId;
                window.location.hash = hash;
              },
              gotoArchive: function (dt) {
                window.location.hash = testMe.createUrl(testMe.tResults, c.Id, crs.ProductId);
              }
            };
            comp.courses.push(res);
          });
          return comp;
        });
      }
      completed();
    };
    return Model;
  })(schools.Model);
  schoolMy.Model = Model;

  Pager.registerAppLocator(schools.appId, schools.tMy, function (urlParts, completed) {
    return completed(new schoolMy.Model());
  });
})(schoolMy || (schoolMy = {}));

/// <reference path="../courses/Course.ts" />
var __extends = this.__extends || function (d, b) {
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
    //seeAlsoClick(idx: number) { gui.gotoData(this.seeAlso[idx]); }
    function ModelEx(urlParts) {
      _super.call(this, schools.tEx, urlParts);
      this.instrTitle = ko.observable("");
      this.instrBody = ko.observable("");
      this.seeAlsoTemplateSmall = ko.observable("Dummy");
      this.seeAlsoTemplate = ko.observable("Dummy");
      CourseMeta.actExModel = this;
    }
    ModelEx.prototype.doUpdate = function (completed) {
      var _this = this;
      var th = this;
      CourseMeta.lib.adjustInstr(function () {
        return CourseMeta.lib.onChangeUrl(th.productUrl, th.url, function (ex) {
          return CourseMeta.lib.doRefresh(function () {
            return CourseMeta.lib.displayEx(ex, function (loadedEx) {
              _this.cpv = new schoolCpv.model(schools.tExCpv, null);
              DictConnector.initDict(CourseMeta.actModule.dict);
            }, function (loadedEx) {
              th.instrTitle(CourseMeta.actEx.page.instrTitle);
              th.instrBody(_.map(CourseMeta.actEx.page.instrs, function (s) {
                var res = CourseMeta.instructions[s.toLowerCase()];
                return res ? res : (_.isEmpty(s) ? "" : "Missing [" + s + "] instruction");
              }).join());
              if (CourseMeta.actEx.page.seeAlso)
                th.seeAlso = _.filter(_.map(CourseMeta.actEx.page.seeAlso, function (lnk) {
                  return CourseMeta.actProduct.getNode(lnk.url);
                }), function (n) {
                  return !!n;
                });
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
      });
    };

    ModelEx.prototype.htmlClearing = function () {
      if (this.cpv)
        this.cpv.htmlClearing();
      if (CourseMeta.actExPageControl && CourseMeta.actExPageControl.sound)
        CourseMeta.actExPageControl.sound.htmlClearing();
    };
    return ModelEx;
  })(CourseMeta.MetaModel);
  CourseMeta.ModelEx = ModelEx;

  Pager.registerAppLocator(schools.appId, schools.tEx, function (urlParts, completed) {
    return completed(new ModelEx(urlParts));
  });
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
  function Cmd_Logger_Create(id, data, lmcomId, companyId, productId, scormId) {
    return { id: id, data: data, lmcomId: lmcomId, companyId: companyId, productId: productId, scormId: scormId, date: Utils.nowToInt() };
  }
  scorm.Cmd_Logger_Create = Cmd_Logger_Create;

  scorm.Cmd_resetModules_Type = 'scorm.Cmd_resetModules';
  function Cmd_resetModules_Create(modIds, lmcomId, companyId, productId, scormId) {
    return { modIds: modIds, lmcomId: lmcomId, companyId: companyId, productId: productId, scormId: scormId, date: Utils.nowToInt() };
  }
  scorm.Cmd_resetModules_Create = Cmd_resetModules_Create;

  scorm.Cmd_readCrsResults_Type = 'scorm.Cmd_readCrsResults';
  function Cmd_readCrsResults_Create(lmcomId, companyId, productId, scormId) {
    return { lmcomId: lmcomId, companyId: companyId, productId: productId, scormId: scormId, date: Utils.nowToInt() };
  }
  scorm.Cmd_readCrsResults_Create = Cmd_readCrsResults_Create;

  scorm.Cmd_readModuleResults_Type = 'scorm.Cmd_readModuleResults';
  function Cmd_readModuleResults_Create(key, lmcomId, companyId, productId, scormId) {
    return { key: key, lmcomId: lmcomId, companyId: companyId, productId: productId, scormId: scormId, date: Utils.nowToInt() };
  }
  scorm.Cmd_readModuleResults_Create = Cmd_readModuleResults_Create;

  scorm.Cmd_saveUserData_Type = 'scorm.Cmd_saveUserData';
  function Cmd_saveUserData_Create(data, lmcomId, companyId, productId, scormId) {
    return { data: data, lmcomId: lmcomId, companyId: companyId, productId: productId, scormId: scormId, date: Utils.nowToInt() };
  }
  scorm.Cmd_saveUserData_Create = Cmd_saveUserData_Create;

  scorm.Cmd_createArchive_Type = 'scorm.Cmd_createArchive';
  function Cmd_createArchive_Create(lmcomId, companyId, productId, scormId) {
    return { lmcomId: lmcomId, companyId: companyId, productId: productId, scormId: scormId, date: Utils.nowToInt() };
  }
  scorm.Cmd_createArchive_Create = Cmd_createArchive_Create;

  scorm.Cmd_testResults_Type = 'scorm.Cmd_testResults';
  function Cmd_testResults_Create(lmcomId, companyId, productId, scormId) {
    return { lmcomId: lmcomId, companyId: companyId, productId: productId, scormId: scormId, date: Utils.nowToInt() };
  }
  scorm.Cmd_testResults_Create = Cmd_testResults_Create;
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
      this.id = id;
      this.xap = xap;
      this.play = new btn("play");
      this.record = new btn("record");
      this.replay = new btn("replay");
      this.showAlowMicrophoneBtn = ko.observable(false);
      this.needInstall = ko.observable(true);
      this.slvisible = ko.observable(false);
      this.title = ko.observable('');
      this.timerId = 0;
      var self = this;
      allCpvs[id] = this;
      this.play.owner = this.record.owner = this.replay.owner = this;
      this.destroy = function () {
        if (self.driver) {
          self.driver.stop();
          if (self.driver.recHandler)
            self.driver.recHandler.recordEnd();
        }
        if (self.timerId != 0)
          clearTimeout(self.timerId);
        self.timerId = 0;
      };
    }
    model.prototype.installSlUrl = function () {
      return SndLow.slInstallUrl;
    };

    model.prototype.init = function (completed) {
      if (this.driver) {
        completed();
        return;
      }
      this.needInstall(!SndLow.recordingType);

      //this.needInstall(!SndLow.isSLInstalled());
      if (this.needInstall()) {
        completed();
        return;
      }
      var self = this;
      SndLow.createDriver(false, self.id, '#sldiv' + self.id, null, SndLow.recordingType, function (dr) {
        self.driver = dr;
        completed();
        //dr.OnAlowMicrophone = alow => self.alowMicrophone(alow);
      });
    };

    model.prototype.htmlClearing = function () {
      SndLow.htmlClearing(this.id);
    };

    model.prototype.setBtn = function (btn, disabled, active, playing) {
      btn.disabled(disabled);
      btn.active(active);
      btn.playing(playing);
    };
    model.prototype.setButtonsStatus = function () {
      this.setBtn(this.play, false, this.playStatus == 1 /* toPlay */ || this.playStatus == 2 /* playFile */, this.playStatus == 2 /* playFile */);
      this.setBtn(this.record, false, this.playStatus == 3 /* toRecord */ || this.playStatus == 4 /* recording */, this.playStatus == 4 /* recording */);
      this.setBtn(this.replay, !this.driver || !this.driver.recHandler.recordingExists(), this.playStatus == 5 /* toPlayMemory */ || this.playStatus == 6 /* playMemory */, this.playStatus == 6 /* playMemory */);
    };

    model.prototype.hide = function (s, ev) {
      this.destroy();
      anim.collapseExpandedSlow();
      this.slvisible(false);
      if (ev) {
        ev.cancelBubble = true;
        ev.stopPropagation();
      }
      return false;
    };

    model.prototype.playSound = function (isUrl) {
      var self = this;
      self.driver.play(isUrl ? self.url : SndLow.memorySource, isUrl ? self.begPos * 1000 : 0, null);
      //self.driver.OnFileOpened = () => { self.driver.handler.currentTime = isUrl ? self.begPos : 0; self.driver.handler.play(); };
      //self.driver.openFile(isUrl ? self.url : SndLow.memorySource);
    };

    model.prototype.show = function (url, title, begPos, endPos) {
      var _this = this;
      //this.stopStatus = { play: false, record: false, replay: false };
      this.playStatus = 0 /* initializing */;
      this.url = url.toLowerCase(); /*this.computeUrl(url);*/
      this.title(title);
      this.begPos = begPos ? begPos / 1000 : 0;
      this.endPos = endPos ? endPos / 1000 : 1000000;
      var self = this;

      //Inicializace SL
      this.init(function () {
        self.playStatus = 1 /* toPlay */;
        self.slvisible(true);
        anim.show($('#' + self.id));
        if (self.driver)
          self.driver.recHandler.clearRecording();
      });

      //Timer
      this.timerId = setInterval(function () {
        if (self.driver && self.driver.recHandler) {
          if (!self.driver.recHandler.alowMicrophone()) {
            self.showAlowMicrophoneBtn(true);
            return;
          }
          self.showAlowMicrophoneBtn(false);

          //stavy, nastavene klikem na button
          if (!self.driver.handler.paused)
            if (self.driver.url == SndLow.memorySource)
              self.playStatus = 6 /* playMemory */;
            else
              self.playStatus = 2 /* playFile */;
          else if (self.driver.recHandler.isRecording())
            self.playStatus = 4 /* recording */;

          switch (self.playStatus) {
            case 2 /* playFile */:
              if (self.driver.handler.paused)
                self.playStatus = 3 /* toRecord */; //prestalo se prehravat vzor
              else if (self.driver.url != SndLow.memorySource && self.endPos && self.endPos <= self.driver.handler.currentTime)
                self.driver.stop(); //dosazeno konce prehrani vzoru
              break;
            case 4 /* recording */:
              if (!self.driver.recHandler.isRecording())
                self.playStatus = 5 /* toPlayMemory */; //prestalo se nahravat
              break;
            case 6 /* playMemory */:
              if (self.driver.handler.paused)
                self.playStatus = 1 /* toPlay */; //prestalo se prehravat nahravka studenta
              break;
          }
        }

        //aktualizace stavu butonu
        _this.setButtonsStatus();
      }, 50);
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
        case "play":
          return CSLocalize('4bbab8260cf44783ade8f733a142866d', 'Listen to the original');
        case "record":
          return CSLocalize('e409b368170645e58cfd835473cb9561', 'Record');
        case "replay":
          return CSLocalize('0590834dbf264906ae88c717f81170cf', 'Check your recording');
      }
    };
    btn.prototype.click = function (s, ev) {
      var _this = this;
      if (this.disabled())
        return;

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
            setTimeout(function () {
              return _this.owner.driver.recHandler.recordEnd();
            }, 500);
          else
            this.owner.driver.recHandler.recordStart();
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

var __extends = this.__extends || function (d, b) {
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
    DictInfoModel.prototype.doUpdate = function (completed) {
      completed();
    };

    DictInfoModel.prototype.title = function () {
      return CSLocalize(null, "Bilingual Dictionary");
    };
    return DictInfoModel;
  })(schools.Model);
  CourseMeta.DictInfoModel = DictInfoModel;

  var GrModel = (function (_super) {
    __extends(GrModel, _super);
    function GrModel() {
      _super.apply(this, arguments);
      this.prevNextVisible = true;
    }
    GrModel.prototype.grammContentClick = function () {
      Pager.navigateToHash(schools.createGrammUrl(schools.tGrammContent, ""));
    };
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
    GrFolder.prototype.idxFrom = function () {
      return CSLocalize('fe6997da0e5e407288cda87e156820a0', 'Content');
    };
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
    GrContent.prototype.breadcrumbs = function () {
      return [];
    };
    GrContent.prototype.title = function () {
      return CourseMeta.actGrammar.title + ", " + CSLocalize('49dd8f327c6f484aaff1c9412690b970', 'content');
    };
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
      CourseMeta.lib.onChangeUrl(this.productUrl, this.url, function (loadedEx) {
        return CourseMeta.lib.doRefresh(function () {
          return CourseMeta.lib.displayEx(loadedEx, null, function (loadedEx) {
            return DictConnector.initDict(CourseMeta.actGrammarModule.dict);
          });
        });
      });
    };

    //Prev x Next pro gramatiku
    GrPage.prototype.hasPrev = function () {
      return !!CourseMeta.actGrammarEx.prev;
    };
    GrPage.prototype.hasNext = function () {
      return !!CourseMeta.actGrammarEx.next;
    };
    GrPage.prototype.prevClick = function () {
      CourseMeta.gui.gotoData(CourseMeta.actGrammarEx.prev);
    };
    GrPage.prototype.nextClick = function () {
      CourseMeta.gui.gotoData(CourseMeta.actGrammarEx.next);
    };
    GrPage.prototype.idxFrom = function () {
      return (CourseMeta.actGrammarEx.idx + 1).toString() + "/" + CourseMeta.actGrammarExCount.toString() + ": " + CSLocalize('5592859748ca440d97b0e2bcdd1ff22b', 'content');
    };

    GrPage.prototype.exerciseHtml = function () {
      return JsRenderTemplateEngine.render("c_gen", CourseMeta.actGrammarEx.page);
    };
    return GrPage;
  })(GrModel);
  CourseMeta.GrPage = GrPage;

  Pager.registerAppLocator(schools.appId, schools.tDictInfo, function (urlParts, completed) {
    return completed(new DictInfoModel(urlParts));
  });
  Pager.registerAppLocator(schools.appId, schools.tGrammFolder, function (urlParts, completed) {
    return completed(new GrFolder(urlParts));
  });
  Pager.registerAppLocator(schools.appId, schools.tGrammPage, function (urlParts, completed) {
    return completed(new GrPage(urlParts));
  });
  Pager.registerAppLocator(schools.appId, schools.tGrammContent, function (urlParts, completed) {
    return completed(new GrContent(urlParts));
  });
})(CourseMeta || (CourseMeta = {}));

//model pro obsah statistics iframe
var statistics;
(function (statistics) {
  var model = (function () {
    function model() {
      var _this = this;
      this.emptyStat = ko.observable();
      this.groups = [
          {
            title: CSLocalize('39e15614bf92467a80574e3d3ce15879', 'Summary reports'), color: 'warning', infos: [
                { title: CSLocalize('46c1e338e2c04b9991d55739c8609f53', 'Grouped by content of the course'), name: 'NewLMComCube.Toc', hasCol: false },
                { title: CSLocalize('b235a3d7f85e4fe58c646b4ec652344e', 'Grouped by departments'), name: 'NewLMComCube.UserDepartment', hasCol: false },
                { title: CSLocalize('f6627ef3ea18406d89bc0040a6c6bc8a', 'Grouped by study periods'), name: 'NewLMComCube.YearMonth', hasCol: false }
            ]
          },
          {
            title: CSLocalize('b05b18ca78d04a2e8970420d7e16d39e', 'Monthly reports'), color: 'success', infos: [
                { title: CSLocalize('204247a660434f818291e7c86c41b432', 'Grouped by score'), name: 'MonthInfoCube.MScore.Department', hasCol: true },
                { title: CSLocalize('c2f91e353d95495c9bcac84afd679e1b', 'Grouped by spent time'), name: 'MonthInfoCube.MSec.Department', hasCol: true }
            ]
          },
          {
            title: CSLocalize('b417735ce40c4c8ea4d54c7f6e92660c', 'Reports for periods'), color: 'info', infos: [
                { title: CSLocalize('c198c1a6e8b449f2930e742180be8874', 'Grouped by score'), name: 'YearInfoCube.YScore.Department', hasCol: true },
                { title: CSLocalize('80c3d98bf14a42ac835c3686c45703e9', 'Grouped by spent time'), name: 'YearInfoCube.YSec.Department', hasCol: true }
            ]
          }
      ];
      this.exports = [
          { name: 'Pdf', title: 'PDF' },
          { name: 'Excel', title: 'MS Excel' },
          { name: 'Rtf', title: 'MS Word - RTF' },
          { name: 'Png', title: 'PNG' },
          { name: 'Mht', title: 'HTML - MHT' }
      ];
      statistics.instance = this;
      var statName = LowUtils.getQueryParams("view");
      this.actStat = _.find(_.flatten(_.map(this.groups, function (g) {
        return g.infos;
      })), function (inf) {
        return inf.name == statName;
      });
      this.actGroup = _.find(this.groups, function (g) {
        return _.any(g.infos, function (inf) {
          return inf.name == statName;
        });
      });
      this.emptyStat(this.actStat == null);
      setTimeout(function () {
        return _this.emptyStat.valueHasMutated();
      }, 1);
    }
    model.prototype.clickBtn = function (btnId) {
      $('#' + btnId)[0].click();
    };

    model.prototype.backToCourseClick = function () {
      var url = LMStatus.getReturnUrl();
      if (_.isEmpty(url))
        return;
      window.parent.window.location.hash = url;
    };
    return model;
  })();
  statistics.model = model;

  function init() {
    if (!cfg)
      return;
    if (!LMStatus.isReturnUrl())
      return;
    Trados.adjustLoc(function () {
      statistics.instance = new model();
      ko.applyBindings(statistics.instance, $('body')[0]);
    });
  }
  statistics.init = init;
  statistics.instance;
})(statistics || (statistics = {}));

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
    CheckItemTexts[CheckItemTexts["no"] = 0] = "no";
    CheckItemTexts[CheckItemTexts["YesNo"] = 1] = "YesNo";
    CheckItemTexts[CheckItemTexts["TrueFalse"] = 2] = "TrueFalse";
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

  CourseModel.tsmartTag = 'smartTag';
  CourseModel.ttagStyled = 'tagStyled';
  CourseModel.tevalControl = 'evalControl';
  CourseModel.tdiv = 'div';
  CourseModel.tbr = 'br';
  CourseModel.tspan = 'span';
  CourseModel.tsub = 'sub';
  CourseModel.tsup = 'sup';
  CourseModel.tp = 'p';
  CourseModel.ttable = 'table';
  CourseModel.ttbody = 'tbody';
  CourseModel.tthead = 'thead';
  CourseModel.tth = 'th';
  CourseModel.ttr = 'tr';
  CourseModel.ttd = 'td';
  CourseModel.timg = 'img';
  CourseModel.ta = 'a';
  CourseModel.th1 = 'h1';
  CourseModel.th2 = 'h2';
  CourseModel.th3 = 'h3';
  CourseModel.th4 = 'h4';
  CourseModel.th5 = 'h5';
  CourseModel.th6 = 'h6';
  CourseModel.tblockquote = 'blockquote';
  CourseModel.tb = 'b';
  CourseModel.ti = 'i';
  CourseModel.tu = 'u';
  CourseModel.tul = 'ul';
  CourseModel.tol = 'ol';
  CourseModel.tli = 'li';
  CourseModel.tdl = 'dl';
  CourseModel.tdt = 'dt';
  CourseModel.tdd = 'dd';
  CourseModel.thr = 'hr';
  CourseModel.tcite = 'cite';
  CourseModel.tsmall = 'small';
  CourseModel.tbig = 'big';
  CourseModel.tcol = 'col';
  CourseModel.tcolgroup = 'colgroup';
  CourseModel.tinput = 'input';
  CourseModel.tnobr = 'nobr';
  CourseModel.tscript = 'script';
  CourseModel.tstrike = 'strike';
  CourseModel.ttag = 'tag';
  CourseModel.ttext = 'text';
  CourseModel.tPage = 'Page';
  CourseModel.tmacro = 'macro';
  CourseModel.thumanEval = 'humanEval';
  CourseModel.tttsSound = 'ttsSound';
  CourseModel.tsingleChoiceLow = 'singleChoiceLow';
  CourseModel.tdragSource = 'dragSource';
  CourseModel.tdragTarget = 'dragTarget';
  CourseModel.tedit = 'edit';
  CourseModel.tgapFill = 'gapFill';
  CourseModel.tcheckItem = 'checkItem';
  CourseModel.tpairingItem = 'pairingItem';
  CourseModel.tpairing = 'pairing';
  CourseModel.tsingleChoice = 'singleChoice';
  CourseModel.twordSelection = 'wordSelection';
  CourseModel.twriting = 'writing';
  CourseModel.tspeaking = 'speaking';
  CourseModel.tlist = 'list';
  CourseModel.tlistGroup = 'listGroup';
  CourseModel.ttwoColumn = 'twoColumn';
  CourseModel.tpanel = 'panel';
  CourseModel.tnode = 'node';
  CourseModel.tpossibilities = 'possibilities';
  CourseModel.tmedia = 'media';
  CourseModel.tmediaTag = 'mediaTag';
  CourseModel.tmediaBigMark = 'mediaBigMark';
  CourseModel.tmediaBar = 'mediaBar';
  CourseModel.tmediaPlayer = 'mediaPlayer';
  CourseModel.tmediaTitle = 'mediaTitle';
  CourseModel.tmediaVideo = 'mediaVideo';
  CourseModel.tmediaDialog = 'mediaDialog';
  CourseModel.tmediaReplica = 'mediaReplica';
  CourseModel.tmediaText = 'mediaText';
  CourseModel.tsndSent = 'sndSent';
  CourseModel.tsndReplica = 'sndReplica';
  CourseModel.tmacroTemplate = 'macroTemplate';
  CourseModel.tmacroTrueFalse = 'macroTrueFalse';
  CourseModel.tmacroSingleChoices = 'macroSingleChoices';
  CourseModel.tmacroPairing = 'macroPairing';
  CourseModel.tmacroTable = 'macroTable';
  CourseModel.tmacroListWordOrdering = 'macroListWordOrdering';
  CourseModel.tmacroList = 'macroList';
  CourseModel.tmacroIconList = 'macroIconList';
  CourseModel.tmacroArticle = 'macroArticle';
  CourseModel.tmacroVocabulary = 'macroVocabulary';
  CourseModel.tmacroVideo = 'macroVideo';
  CourseModel.types = {};
  function regType(obj) {
    for (var i = 0; i < obj.length; i++)
      CourseModel.types[obj[i].name] = obj[i];
    return obj;
  }
  CourseModel.inherits = regType([{ anc: null, name: CourseModel.ttag, desc: regType([{ anc: null, name: CourseModel.tsmartTag, desc: null }, { anc: null, name: CourseModel.ttagStyled, desc: regType([{ anc: null, name: CourseModel.tevalControl, desc: regType([{ anc: null, name: CourseModel.tPage, desc: null }, { anc: null, name: CourseModel.thumanEval, desc: regType([{ anc: null, name: CourseModel.twriting, desc: null }, { anc: null, name: CourseModel.tspeaking, desc: null }]) }, { anc: null, name: CourseModel.tsingleChoiceLow, desc: regType([{ anc: null, name: CourseModel.tsingleChoice, desc: null }, { anc: null, name: CourseModel.twordSelection, desc: null }]) }, { anc: null, name: CourseModel.tedit, desc: regType([{ anc: null, name: CourseModel.tdragTarget, desc: null }, { anc: null, name: CourseModel.tgapFill, desc: null }]) }, { anc: null, name: CourseModel.tcheckItem, desc: null }, { anc: null, name: CourseModel.tpairing, desc: null }]) }, { anc: null, name: CourseModel.tdiv, desc: null }, { anc: null, name: CourseModel.tbr, desc: null }, { anc: null, name: CourseModel.tspan, desc: null }, { anc: null, name: CourseModel.tsub, desc: null }, { anc: null, name: CourseModel.tsup, desc: null }, { anc: null, name: CourseModel.tp, desc: null }, { anc: null, name: CourseModel.ttable, desc: null }, { anc: null, name: CourseModel.ttbody, desc: null }, { anc: null, name: CourseModel.tthead, desc: null }, { anc: null, name: CourseModel.ttr, desc: null }, { anc: null, name: CourseModel.ttd, desc: regType([{ anc: null, name: CourseModel.tth, desc: null }]) }, { anc: null, name: CourseModel.timg, desc: null }, { anc: null, name: CourseModel.ta, desc: null }, { anc: null, name: CourseModel.th1, desc: null }, { anc: null, name: CourseModel.th2, desc: null }, { anc: null, name: CourseModel.th3, desc: null }, { anc: null, name: CourseModel.th4, desc: null }, { anc: null, name: CourseModel.th5, desc: null }, { anc: null, name: CourseModel.th6, desc: null }, { anc: null, name: CourseModel.tblockquote, desc: null }, { anc: null, name: CourseModel.tb, desc: null }, { anc: null, name: CourseModel.ti, desc: null }, { anc: null, name: CourseModel.tu, desc: null }, { anc: null, name: CourseModel.tul, desc: null }, { anc: null, name: CourseModel.tol, desc: null }, { anc: null, name: CourseModel.tli, desc: null }, { anc: null, name: CourseModel.tdl, desc: null }, { anc: null, name: CourseModel.tdt, desc: null }, { anc: null, name: CourseModel.tdd, desc: null }, { anc: null, name: CourseModel.thr, desc: null }, { anc: null, name: CourseModel.tcite, desc: null }, { anc: null, name: CourseModel.tsmall, desc: null }, { anc: null, name: CourseModel.tbig, desc: null }, { anc: null, name: CourseModel.tcol, desc: null }, { anc: null, name: CourseModel.tcolgroup, desc: null }, { anc: null, name: CourseModel.tinput, desc: null }, { anc: null, name: CourseModel.tnobr, desc: null }, { anc: null, name: CourseModel.tscript, desc: null }, { anc: null, name: CourseModel.tstrike, desc: null }, { anc: null, name: CourseModel.tmacro, desc: regType([{ anc: null, name: CourseModel.tlist, desc: null }, { anc: null, name: CourseModel.tlistGroup, desc: null }, { anc: null, name: CourseModel.ttwoColumn, desc: null }, { anc: null, name: CourseModel.tpanel, desc: null }, { anc: null, name: CourseModel.tmacroTemplate, desc: regType([{ anc: null, name: CourseModel.tmacroTrueFalse, desc: null }, { anc: null, name: CourseModel.tmacroSingleChoices, desc: null }, { anc: null, name: CourseModel.tmacroPairing, desc: null }, { anc: null, name: CourseModel.tmacroTable, desc: null }, { anc: null, name: CourseModel.tmacroListWordOrdering, desc: null }, { anc: null, name: CourseModel.tmacroList, desc: null }, { anc: null, name: CourseModel.tmacroIconList, desc: null }, { anc: null, name: CourseModel.tmacroArticle, desc: null }, { anc: null, name: CourseModel.tmacroVocabulary, desc: null }, { anc: null, name: CourseModel.tmacroVideo, desc: null }]) }]) }, { anc: null, name: CourseModel.tpairingItem, desc: null }, { anc: null, name: CourseModel.tpossibilities, desc: regType([{ anc: null, name: CourseModel.tdragSource, desc: null }]) }, { anc: null, name: CourseModel.tmedia, desc: regType([{ anc: null, name: CourseModel.tmediaTag, desc: regType([{ anc: null, name: CourseModel.tttsSound, desc: null }, { anc: null, name: CourseModel.tmediaBigMark, desc: null }, { anc: null, name: CourseModel.tmediaBar, desc: null }, { anc: null, name: CourseModel.tmediaPlayer, desc: null }, { anc: null, name: CourseModel.tmediaTitle, desc: null }, { anc: null, name: CourseModel.tmediaVideo, desc: null }, { anc: null, name: CourseModel.tmediaDialog, desc: null }, { anc: null, name: CourseModel.tmediaReplica, desc: null }, { anc: null, name: CourseModel.tmediaText, desc: null }]) }]) }, { anc: null, name: CourseModel.tsndSent, desc: null }, { anc: null, name: CourseModel.tsndReplica, desc: null }]) }, { anc: null, name: CourseModel.ttext, desc: null }, { anc: null, name: CourseModel.tnode, desc: null }]) }]);
  for (var p in CourseModel.types) {
    var t = CourseModel.types[p];
    if (!t.desc)
      continue;
    for (var i = 0; i < t.desc.length; i++) {
      t.desc[i].anc = t;
    }
  }

  //pouziti: var t: typeInfo = types[obj.Type]; t.anc:typeInfo je parent, t.desc:typeInfo[] jsou descendants, t.name je obj.Type
  CourseModel.tagInfos = { "tag": { "isEval": false, "JSStatus": 1 }, "tagStyled": { "isEval": false, "JSStatus": 1 }, "macro": { "isEval": false, "JSStatus": 2 }, "macroTemplate": { "isEval": false, "JSStatus": 0 }, "macroArticle": { "isEval": false, "JSStatus": 0 }, "macroVocabulary": { "isEval": false, "JSStatus": 0 }, "macroVideo": { "isEval": false, "JSStatus": 0 }, "macroTrueFalse": { "isEval": false, "JSStatus": 0 }, "macroSingleChoices": { "isEval": false, "JSStatus": 0 }, "macroListWordOrdering": { "isEval": false, "JSStatus": 0 }, "macroPairing": { "isEval": false, "JSStatus": 0 }, "macroTable": { "isEval": false, "JSStatus": 0 }, "macroList": { "isEval": false, "JSStatus": 0 }, "macroIconList": { "isEval": false, "JSStatus": 0 }, "smartTag": { "isEval": false, "JSStatus": 0 }, "node": { "isEval": false, "JSStatus": 0 }, "text": { "isEval": false, "JSStatus": 0 }, "evalControl": { "isEval": true, "JSStatus": 2 }, "Page": { "isEval": false, "JSStatus": 2 }, "checkItem": { "isEval": true, "JSStatus": 2 }, "possibilities": { "isEval": false, "JSStatus": 2 }, "dragSource": { "isEval": false, "JSStatus": 2 }, "singleChoiceLow": { "isEval": true, "JSStatus": 2 }, "singleChoice": { "isEval": true, "JSStatus": 2 }, "wordSelection": { "isEval": true, "JSStatus": 2 }, "edit": { "isEval": true, "JSStatus": 2 }, "gapFill": { "isEval": true, "JSStatus": 2 }, "dragTarget": { "isEval": true, "JSStatus": 2 }, "pairing": { "isEval": true, "JSStatus": 2 }, "pairingItem": { "isEval": false, "JSStatus": 2 }, "humanEval": { "isEval": true, "JSStatus": 2 }, "writing": { "isEval": true, "JSStatus": 2 }, "speaking": { "isEval": true, "JSStatus": 2 }, "list": { "isEval": false, "JSStatus": 2 }, "listGroup": { "isEval": false, "JSStatus": 2 }, "twoColumn": { "isEval": false, "JSStatus": 2 }, "panel": { "isEval": false, "JSStatus": 2 }, "media": { "isEval": false, "JSStatus": 2 }, "mediaTag": { "isEval": false, "JSStatus": 2 }, "mediaBigMark": { "isEval": false, "JSStatus": 2 }, "mediaBar": { "isEval": false, "JSStatus": 2 }, "mediaPlayer": { "isEval": false, "JSStatus": 2 }, "mediaTitle": { "isEval": false, "JSStatus": 2 }, "mediaVideo": { "isEval": false, "JSStatus": 2 }, "mediaDialog": { "isEval": false, "JSStatus": 2 }, "mediaReplica": { "isEval": false, "JSStatus": 2 }, "mediaText": { "isEval": false, "JSStatus": 2 }, "sndSent": { "isEval": false, "JSStatus": 2 }, "sndReplica": { "isEval": false, "JSStatus": 2 }, "ttsSound": { "isEval": false, "JSStatus": 2 }, "div": { "isEval": false, "JSStatus": 1 }, "br": { "isEval": false, "JSStatus": 1 }, "span": { "isEval": false, "JSStatus": 1 }, "sub": { "isEval": false, "JSStatus": 1 }, "sup": { "isEval": false, "JSStatus": 1 }, "p": { "isEval": false, "JSStatus": 1 }, "table": { "isEval": false, "JSStatus": 1 }, "tbody": { "isEval": false, "JSStatus": 1 }, "thead": { "isEval": false, "JSStatus": 1 }, "td": { "isEval": false, "JSStatus": 1 }, "th": { "isEval": false, "JSStatus": 1 }, "tr": { "isEval": false, "JSStatus": 1 }, "img": { "isEval": false, "JSStatus": 1 }, "a": { "isEval": false, "JSStatus": 1 }, "h1": { "isEval": false, "JSStatus": 1 }, "h2": { "isEval": false, "JSStatus": 1 }, "h3": { "isEval": false, "JSStatus": 1 }, "h4": { "isEval": false, "JSStatus": 1 }, "h5": { "isEval": false, "JSStatus": 1 }, "h6": { "isEval": false, "JSStatus": 1 }, "blockquote": { "isEval": false, "JSStatus": 1 }, "b": { "isEval": false, "JSStatus": 1 }, "i": { "isEval": false, "JSStatus": 1 }, "u": { "isEval": false, "JSStatus": 1 }, "ul": { "isEval": false, "JSStatus": 1 }, "ol": { "isEval": false, "JSStatus": 1 }, "li": { "isEval": false, "JSStatus": 1 }, "dl": { "isEval": false, "JSStatus": 1 }, "dt": { "isEval": false, "JSStatus": 1 }, "dd": { "isEval": false, "JSStatus": 1 }, "hr": { "isEval": false, "JSStatus": 1 }, "cite": { "isEval": false, "JSStatus": 1 }, "small": { "isEval": false, "JSStatus": 1 }, "big": { "isEval": false, "JSStatus": 1 }, "col": { "isEval": false, "JSStatus": 1 }, "colgroup": { "isEval": false, "JSStatus": 1 }, "input": { "isEval": false, "JSStatus": 1 }, "nobr": { "isEval": false, "JSStatus": 1 }, "script": { "isEval": false, "JSStatus": 1 }, "strike": { "isEval": false, "JSStatus": 1 } };
})(CourseModel || (CourseModel = {}));

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
  })(CourseMeta.runtimeType || (CourseMeta.runtimeType = {}));
  var runtimeType = CourseMeta.runtimeType;

  (function (childMode) {
    childMode[childMode["child"] = 0] = "child";
    childMode[childMode["self"] = 1] = "self";
    childMode[childMode["selfChild"] = 2] = "selfChild";
    childMode[childMode["childsWithParent"] = 3] = "childsWithParent";
    childMode[childMode["childsWithParentIfMulti"] = 4] = "childsWithParentIfMulti";
  })(CourseMeta.childMode || (CourseMeta.childMode = {}));
  var childMode = CourseMeta.childMode;
})(CourseMeta || (CourseMeta = {}));

var testMe;
(function (testMe) {
  (function (Skills) {
    Skills[Skills["no"] = 0] = "no";
    Skills[Skills["UseEnglish"] = 1] = "UseEnglish";
    Skills[Skills["Reading"] = 2] = "Reading";
    Skills[Skills["Listening"] = 3] = "Listening";
    Skills[Skills["Speaking"] = 4] = "Speaking";
    Skills[Skills["Writing"] = 5] = "Writing";
  })(testMe.Skills || (testMe.Skills = {}));
  var Skills = testMe.Skills;

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
/// <reference path="Drag.ts" />
/// <reference path="Media.ts" />
var __extends = this.__extends || function (d, b) {
  for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
  function __() { this.constructor = d; }
  __.prototype = b.prototype;
  d.prototype = new __();
};
/***** nemazat reference, nejde pak prelozit *****/
var Course;
(function (Course) {
  Course.dummyTag = { tg: CourseModel.tspan, 'class': null, id: null, width: null, Items: null, style: null, parentProp: null };

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

  //kontrolka
  var control = (function () {
    function control(data, myPage) {
      this.data = data;
      this.myPage = myPage;
      this.childs = [];
      this.tagInfo = CourseModel.tagInfos[data.tg];
      data.control = this;
      //###jsonML TODO
      //if (!data.specItems) {
      //  if (data.Item && data.Item.Item) {
      //    data.specItems = _.clone(data.Items);
      //    data.Items.unshift(data.Item.Item);
      //    data.Item = <any>(data.Item.Item); //hack, dereference
      //  } else
      //    data.specItems = data.Items;
      //}
    }
    control.prototype.status = function () {
      return !this.myPage.MyResult().done;
    };

    control.prototype.createResult = function (forceEval) {
      if (typeof forceEval === "undefined") { forceEval = false; }
      throw "not overwrited";
    };
    control.prototype.provideData = function (data) {
      throw "not overwrited";
    };
    control.prototype.acceptData = function (done, userData) {
    };
    control.prototype.score = function () {
      var c = this.isCorrect();
      return { ms: 1, s: c ? 1 : 0, needsHumanEval: false };
    };
    control.prototype.isCorrect = function () {
      throw "not overwrited";
    };

    control.prototype.initProc = function (phase, getTypeOnly, completed) {
      return 0 /* no */;
    };

    //afterRender: (completed: () => void) => void; //dokonceni kontrolky, po html rendering
    control.prototype.selfElement = function () {
      return idToElement(this.data.id);
    };

    control.prototype.getItem = function (id) {
      return this.myPage.getItem(id);
    };

    control.prototype.style = function () {
      var res = this.widthStyle();
      if (res != null)
        return " style='" + res + "'";
    };

    control.prototype.widthStyle = function () {
      return getWidthStyle(this.data.width);
    };

    control.prototype.forDescendants = function (action) {
      _.each(this.childs, function (c) {
        action(c);
        c.forDescendants(action);
      });
    };
    return control;
  })();
  Course.control = control;

  function idToElement(id) {
    return $('[data-id=' + id + ']').first();
  }
  Course.idToElement = idToElement;

  function minWidth(w) {
    var ws = parseWidth(w);
    return !ws.i1 ? 0 : parseInt(ws.i1);
  }
  Course.minWidth = minWidth;

  function parseWidth(w) {
    if (!w || w == '')
      return { i1: null, i2: null };
    var parts = w.split('-');
    var i1 = parts[0] == '' ? null : parts[0];
    var i2 = parts.length == 1 ? i1 : (parts[1] == '' ? undefined : parts[1]);
    return { i1: i1, i2: i2 };
  }
  Course.parseWidth = parseWidth;

  function getStyle(w) {
    var res = getWidthStyle(w);
    if (res != null)
      return " style='" + res + "'";
    else
      return '';
  }
  Course.getStyle = getStyle;

  function getWidthStyle(w) {
    var ws = parseWidth(w);
    if (!ws.i1 && !ws.i2)
      return null;
    if (ws.i1 == ws.i2)
      return "width:" + ws.i1 + "px;";
    var res = '';
    if (ws.i1 != null)
      res = "min-width:" + ws.i1 + "px;";
    if (ws.i2 != null)
      res += "max-width:" + ws.i2 + "px;";
    if (res != '')
      return res;
    debugger;
    throw 'something wrong';
  }
  Course.getWidthStyle = getWidthStyle;



  var Page = (function (_super) {
    __extends(Page, _super);
    function Page(staticData, userData) {
      _super.call(this, staticData, null);
      this.items = [];
      this.normalStatus = ko.observable(false);
      this.items = [];
      this.result = userData;
      registerControls(staticData, this, null, userData.designForceEval); //vytvoreni kontrolek
    }
    Page.prototype.getItem = function (id) {
      return _.find(this.items, function (c) {
        return c.data.id == id;
      });
    };
    Page.prototype.MyResult = function () {
      return this.result;
    };
    Page.prototype.MyData = function () {
      return this.data;
    };

    Page.prototype.callInitProcs = function (phase, completed) {
      //synchronni init akce
      _.each(_.filter(this.items, function (ctrl) {
        return ctrl.initProc(phase, true, null) == 1 /* sync */;
      }), function (ctrl) {
        return ctrl.initProc(phase, false, null);
      });

      //asynchronni init akce
      var promises = _.compact(_.map(_.filter(this.items, function (ctrl) {
        return ctrl.initProc(phase, true, null) == 2 /* async */;
      }), function (ctrl) {
        var defered = $.Deferred();
        ctrl.initProc(phase, false, defered.resolve);
        return defered.promise();
      }));
      $.whenall(promises).done(function () {
        completed();
      });
    };

    //onBeforeRender(completed: () => void) {
    //  var promises = _.compact(_.map(_.filter(this.items, ctrl => !!ctrl.beforeRender), ctrl => {
    //    var defered = $.Deferred();
    //    ctrl.beforeRender(defered.resolve);
    //    return defered.promise();
    //  }));
    //  $.whenall(promises).done(() => {
    //    if (!this.MyData().isOldEA) this.MyData().isPassive = _.all(this.items, (it: control) => CourseModel.tagInfos[it.data.Type].noEval); //pasivni cviceni nema zadne kontrolky
    //    this.sound = new pageSound(this);
    //    completed();
    //  });
    //}
    //onAfterRender(completed: () => void) {
    //  var promises = _.compact(_.map(_.filter(this.items, ctrl => !!ctrl.afterRender), ctrl => {
    //    var defered = $.Deferred();
    //    ctrl.afterRender(defered.resolve);
    //    return defered.promise();
    //  }));
    //  $.whenall(promises).done(completed);
    //}
    /*** IScoreProvider ***/
    Page.prototype.provideData = function (exData) {
      _.each(this.items, function (ctrl) {
        if (!ctrl.tagInfo.isEval)
          return;
        ctrl.provideData(exData[ctrl.data.id]);
      });
    };
    Page.prototype.acceptData = function (done, exData) {
      _.each(this.items, function (ctrl) {
        if (!ctrl.tagInfo.isEval)
          return;
        ctrl.acceptData(done, exData ? exData[ctrl.data.id] : null);
      });
      this.normalStatus(!done);
    };
    Page.prototype.resetData = function (exData) {
      _.each(this.items, function (ctrl) {
        if (!ctrl.tagInfo.isEval)
          return;
        ctrl.result = exData[ctrl.data.id] = ctrl.createResult();
      });
      this.acceptData(false, exData);
    };
    Page.prototype.getScore = function () {
      var res = { ms: 0, s: 0, needsHumanEval: false };
      _.each(this.items, function (ctrl) {
        if (!ctrl.tagInfo.isEval)
          return;
        var sc = ctrl.score();
        res.ms += sc.ms;
        res.s += sc.s;
        res.needsHumanEval = res.needsHumanEval || sc.needsHumanEval;
      });
      return res;
    };
    Page.prototype.status = function () {
      return this.MyResult().done;
    };

    //Helper
    Page.prototype.find = function (id) {
      return _.find(this.items, function (it) {
        return it.data.id == id;
      });
    };
    Page.prototype.filter = function (cond) {
      return _.filter(this.items, function (it) {
        return cond(it);
      });
    };
    return Page;
  })(control);
  Course.Page = Page;

  function finishTag(data) {
    var firstCh = data.tg.charAt(0);
    var isTag = firstCh == firstCh.toLowerCase();
    switch (data.tg) {
      case CourseModel.ta:
        var a = data;
        if (a.href)
          a.href = a.href.toLowerCase();
        break;
      case CourseModel.tp:
        data.tg = CourseModel.tdiv;
        break;
    }
  }
  ;

  var tag_helper = (function () {
    function tag_helper() {
    }
    tag_helper.prototype.c_tagstart = function (data) {
      try {
        var sb = [];
        finishTag(data);
        sb.push("<" + data.tg);
        for (var p in data) {
          if (p == 'tg')
            continue;
          var firstCh = p.charAt(0);
          if (firstCh != firstCh.toLowerCase())
            continue;
          sb.push(' ' + p + '="' + data[p] + '"');
        }

        switch (data.tg) {
          case CourseModel.thr:
          case CourseModel.tbr:
          case CourseModel.timg:
            sb.push("/>");
            break;
          default:
            sb.push(">");
        }
        return sb.join('');
      } catch (msg) {
        debugger;
        throw msg;
      }
    };
    tag_helper.prototype.cT = function (data) {
      try {
        //###jsonML
        if (_.isString(data))
          return JsRenderTemplateEngine.tmpl('c_textnew');
        var ts = CourseModel.tagInfos[data.tg];
        var tmpl = null;
        switch (ts.JSStatus) {
          case 2 /* ctrl */:
            tmpl = "c_" + data.tg.toLowerCase();
            break;
          case 1 /* genericHtml */:
            tmpl = 'c_tag';
            break;
          case 0 /* no */:
            tmpl = 'c_noop';
            break;
        }
        return JsRenderTemplateEngine.tmpl(tmpl);
        //var firstCh = data.Type.charAt(0);
        //var tmpl = firstCh == firstCh.toLowerCase() ? "c_tag" : "c_" + data.Type.toLowerCase();
        //return JsRenderTemplateEngine.tmpl(tmpl);
      } catch (msg) {
        debugger;
        throw msg;
      }
    };
    tag_helper.prototype.cFindMedia = function (data) {
      //var ctrl: control = (<any>data).control;
      //while (ctrl && ctrl.data.Type != CourseModel.tMedia) ctrl = ctrl.parent;
      //return !ctrl ? null : ctrl.data;
      return null;
    };
    tag_helper.prototype.classes = function (data) {
      var clss = '';
      _.each(ancestors(data.tg), function (t) {
        return clss += "c-" + t + " ";
      });
      clss += data['class'] ? " " + data['class'] : "";
      return clss.toLowerCase();
    };
    tag_helper.prototype.c_tagend = function (data) {
      switch (data.tg) {
        case CourseModel.thr:
        case CourseModel.tbr:
        case CourseModel.timg:
          return "";

        default:
          return "</" + data.tg + ">";
      }
    };
    return tag_helper;
  })();

  function scan(dt, action, cond) {
    if (typeof cond === "undefined") { cond = null; }
    if (dt.Items)
      _.each(dt.Items, function (it) {
        return scan(it, action, cond);
      });
    if (!cond || cond(dt))
      action(dt);
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
    //###jsonML
    pg.title = locProc(pg.title);
    pg.instrTitle = locProc(pg.instrTitle);
    scanEx(pg, function (parent, idx) {
      if (!parent.Items)
        return;
      if (_.isString(parent.Items[idx]))
        parent.Items[idx] = (locProc((parent.Items[idx])));
    });
    //scan(pg, it => {
    //  if (it.Type == CourseModel.tText)
    //    (<CourseModel.Text>it).Title = locProc((<CourseModel.Text>it).Title);
    //  else if (it.Type == CourseModel.tPage) {
    //    (<CourseModel.Page>it).title = locProc((<CourseModel.Page>it).title);
    //    (<CourseModel.Page>it).instrTitle = locProc((<CourseModel.Page>it).instrTitle);
    //  }
    //});
  }
  Course.localize = localize;

  //export function getCourseUrl(rootUrl: string, url: string): string {
  //  return Utils.combineUrl(rootUrl, url);
  //if (!url) return '';
  //rootUrl = rootUrl.toLowerCase(); url = url.toLowerCase();
  //var sch = '/schools/';
  //if (url.indexOf(sch) == 0) return url.substr(sch.length); //absolutne k schools
  //if (url.charAt(0) == "/") return ".." + url; //absolutne k Web4
  //if (url.indexOf('http://') == 0) return url; //absolutne
  ////vstupem je cesta, relativne k rew\Web4\RwCourses\ + rootUrl-<posledi adresar>. Vystupem cesta, relativne k rew\Web4\Schools\
  ////napr k
  ////  russian4/00examples/10layout/10grid a img/s8.gif
  ////vrati
  ////  eaimgmp3/russian4/00examples/10layout/img/s8.gif
  //var parts = rootUrl.split('/');
  //parts[parts.length - 1] = url;
  //return "eaimgmp3/" + parts.join('/');
  //}
  function getCourseAbsoluteUrl(rootUrl, url) {
    var parts = rootUrl.toLowerCase().split('/');
    parts[parts.length - 1] = url.toLowerCase();
    return Pager.basicUrl + "rwcourses/" + parts.join('/');
  }
  Course.getCourseAbsoluteUrl = getCourseAbsoluteUrl;

  $.views.helpers(new tag_helper());

  function ancestors(type) {
    var res = [];
    while (type != CourseModel.ttag) {
      res.unshift(type);
      type = CourseModel.types[type].anc.name;
    }
    return res;
  }

  var writing = (function (_super) {
    __extends(writing, _super);
    function writing() {
      _super.apply(this, arguments);
    }
    return writing;
  })(control);
  Course.writing = writing;
  var speaking = (function (_super) {
    __extends(speaking, _super);
    function speaking() {
      _super.apply(this, arguments);
    }
    return speaking;
  })(control);
  Course.speaking = speaking;

  var gf_nt = [
      '1040', 'A',
      '1072', 'a',
      '1042', 'B',
      '1074', 'b',
      '1045', 'E',
      '1077', 'e',
      '1050', 'K',
      '1082', 'k',
      '1052', 'M',
      '1084', 'm',
      '1053', 'H',
      '1085', 'h',
      '1054', 'O',
      '1086', 'o',
      '1056', 'P',
      '1088', 'p',
      '1057', 'C',
      '1089', 'c',
      '1058', 'T',
      '1090', 't',
      '1059', 'Y',
      '1091', 'y',
      '1061', 'X',
      '1093', 'x',
      '1105', 'ë',
      '161', '!',
      '160', ' ',
      '191', '?',
      '241', 'ň',
      '39', '’',
      '96', '’',
      '180', '’',
      '733', '"',
      '8216', '’',
      '8219', '’',
      '8220', '"',
      '8221', '"',
      '8222', '"',
      '8242', '’',
      '8243', '"'
  ];
  var gf_normTable = null;
  function NormalizeChars(s) {
    if (_.isEmpty(s))
      return s;
    if (gf_normTable == null) {
      gf_normTable = [];
      for (var i = 1; i < gf_nt.length; i += 2)
        gf_normTable[parseInt(gf_nt[i - 1])] = gf_nt[i];
    }
    for (var i = 0; i < s.length; i++) {
      var nw = gf_normTable[s.charCodeAt(i)];
      if (typeof (nw) != 'undefined')
        s = s.substring(0, i) + nw + s.substring(i + 1);
    }
    return s;
  }
  Course.NormalizeChars = NormalizeChars;
  ;

  //**** normalize GapFill string
  function normalize(value, caseSenzitive) {
    if (typeof caseSenzitive === "undefined") { caseSenzitive = false; }
    if (_.isEmpty(value))
      return value;
    if (!caseSenzitive)
      value = value.toLowerCase();

    var begIdx = 0;
    while (begIdx < value.length) {
      var ch = value.charAt(begIdx);
      if (!Unicode.isWhiteSpace(ch))
        break;
      begIdx++;
    }
    if (begIdx >= value.length)
      return '';

    var endIdx = value.length - 1;
    while (endIdx >= 0) {
      var ch = value.charAt(endIdx);
      if (!Unicode.isWhiteSpace(ch))
        break;
      endIdx--;
    }

    value = value.substring(begIdx, endIdx + 1);

    return NormalizeChars(value);
    //var st = 0; var res = "";
    //for (var i = 0; i < value.length; i++) {
    //  var ch = value.charAt(i);
    //  switch (st) {
    //    case 0: if (!Unicode.isLeterOrDigit(ch)) continue; res += ch; st = 1; break; //pocatecni whitespaces
    //    case 1: if (!Unicode.isLeterOrDigit(ch)) { st = 2; continue; } res += ch; break; //neni whitestapce
    //    case 2: if (!Unicode.isLeterOrDigit(ch)) continue; res += " "; res += ch; st = 1; break; //dalsi whitespaces
    //  }
    //}
    //return res;
  }
  Course.normalize = normalize;

  //function convertAppostrof(ch: string): string { return appostrofs.indexOf(ch) >= 0 ? '\"' : ch; }
  //var appostrofs = "'`´“\"‘’‛“”‟′″";
  //**** vytvori kontrolky a jejich napojeni na result
  function registerControls(data, myPage, parent, forceEval) {
    var tagInfo = CourseModel.tagInfos[data.tg];
    var parent = parent;
    var isCtrl = tagInfo.JSStatus == 2 /* ctrl */;
    if (isCtrl) {
      var ctrl = createControl(data, myPage);
      ctrl.parent = parent;
      if (parent != null)
        parent.childs.push(ctrl);
      parent = ctrl;
      myPage.items.push(ctrl);
      if (ctrl.tagInfo.isEval) {
        if (!data.id)
          throw 'eval control mush have id';
        var pgRes = myPage.MyResult();
        if (!pgRes.result)
          pgRes.result = {};
        var ress = pgRes.result;
        if (forceEval || !ress[data.id])
          ress[data.id] = ctrl.createResult(forceEval);
        ctrl.result = ress[data.id];
      } else {
        if (!data.id)
          data.id = "_id_" + (idCnt++).toString();
      }
    }
    if (data.Items)
      _.each(data.Items, function (t) {
        if (!_.isString(t))
          registerControls(t, myPage, parent, forceEval);
      });
  }
  Course.registerControls = registerControls;

  var idCnt = 0;

  function createControl(data, myPage) {
    switch (data.tg) {
      case CourseModel.tgapFill:
        return new Course.gapFill(data, myPage);
      case CourseModel.tpairing:
        return new Course.pairing(data, myPage);
      case CourseModel.tsingleChoice:
        return new Course.singleChoice(data, myPage);
      case CourseModel.twordSelection:
        return new Course.wordSelection(data, myPage);
      case CourseModel.tcheckItem:
        return new Course.checkItem(data, myPage);
      case CourseModel.tpossibilities:
        return new Course.possibilities(data, myPage);
      case CourseModel.tdragSource:
        return new Course.dragSource(data, myPage);
      case CourseModel.tdragTarget:
        return new Course.dragTarget(data, myPage);

      case CourseModel.tmediaDialog:
        return new Course.mediaDialog(data, myPage);
      case CourseModel.tmediaText:
        return new Course.mediaText(data, myPage);
      case CourseModel.tmediaBigMark:
        return new Course.mediaBigMark(data, myPage);
      case CourseModel.tmediaBar:
        return new Course.mediaBar(data, myPage);
      case CourseModel.tmediaTitle:
        return new Course.mediaTitle(data, myPage);
      case CourseModel.tmediaVideo:
        return new Course.mediaVideo(data, myPage);
      case CourseModel.tmediaPlayer:
        return new Course.mediaPlayer(data, myPage);
      case CourseModel.tmediaReplica:
        return new Course.mediaReplica(data, myPage);
      case CourseModel.tsndSent:
        return new Course.sndSent(data, myPage);
      case CourseModel.tsndReplica:
        return new Course.sndReplica(data, myPage);
      default:
        return new control(data, myPage);
    }
  }
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
  CourseMeta.allProductList;
  CourseMeta.actProduct;
  CourseMeta.actNode;
  CourseMeta.actCompanyId;
  CourseMeta.actExPageControl;
  CourseMeta.actInstr;

  CourseMeta.forceEval;

  //Kurz
  CourseMeta.actModule;
  CourseMeta.actCourseRoot;
  CourseMeta.actEx;
  CourseMeta.actExModel;

  //gramatika
  CourseMeta.actGrammar;
  CourseMeta.actGrammarEx;
  CourseMeta.actGrammarModule;
  CourseMeta.actGrammarExCount;

  //jsonML decoding
  function jsonML_to_Tag(jml) {
    _.isArray = function (val) {
      return val instanceof Array;
    };
    if (!_.isArray(jml) || jml.length < 1 || !_.isString(jml[0]))
      throw 'invalid JsonML';
    var tagName = Utils.normalizeCamelCaseStr(jml[0]);

    if (jml.length == 1) {
      tg:
        tagName;
    }
    ;
    var startIdx = 1;
    var elem = null;
    if (jml.length > 1 && !_.isArray(jml[1]) && !_.isString(jml[1])) {
      startIdx = 2;
      elem = jml[1];
      elem.tg = tagName;
      Utils.normalizeCamelCase(elem);
    } else
      elem = { tg: tagName };
    for (var i = startIdx; i < jml.length; i++) {
      if (!elem.Items)
        elem.Items = [];
      if (_.isString(jml[i])) {
        elem.Items.push(jml[i]);
        continue;
      }
      var obj = (jsonML_to_Tag(jml[i]));
      var dataProp = obj.parentProp;
      if (!dataProp) {
        elem.Items.push(obj);
        continue;
      }
      elem[dataProp] = obj; //property
    }
    if (elem.Items && elem.Items.length == 0)
      delete elem.Items;
    return elem;
  }
  CourseMeta.jsonML_to_Tag = jsonML_to_Tag;
  ;

  function finishStaticTree(prod) {
    CourseMeta.actProduct = prod;
    prod.allNodes = {};

    extend(prod, CourseMeta.productImpl);
    CourseMeta.actCourseRoot = (prod.items[0]); //kurz nebo test
    CourseMeta.actGrammar = prod.find(function (dt) {
      return isType(dt, 16 /* grammarRoot */);
    }); //a jeho eventuelni gramatika

    //grammar
    if (CourseMeta.actGrammar) {
      var lastNode = null;
      CourseMeta.actGrammarExCount = 0;
      scan(CourseMeta.actGrammar, function (it) {
        extend(it, CourseMeta.dataImpl, 0 /* no */);
        prod.allNodes[it.url] = it;
        it.type |= 65536 /* grammar */;
        it.each(function (t) {
          return t.parent = it;
        });
        if (isType(it, 1024 /* ex */)) {
          extend(it, CourseMeta.grammEx, 1024 /* ex */);
          var ge = it;
          ge.idx = CourseMeta.actGrammarExCount++;
          if (lastNode) {
            lastNode.next = ge;
            ge.prev = lastNode;
          }
          lastNode = ge;
        }
        if (isType(it, 8192 /* mod */))
          extend(it, CourseMeta.modImpl, 8192 /* mod */);
      });
      extend(CourseMeta.actGrammar, CourseMeta.grammarRoot, 16 /* grammarRoot */);
    }

    var uniqId = 0;

    //prvni pruchod
    scan(CourseMeta.actCourseRoot, function (it) {
      it.uniqId = uniqId++;
      prod.allNodes[it.url] = it;
      extend(it, CourseMeta.courseNode, 1 /* courseNode */);
      it.each(function (t) {
        return t.parent = it;
      });
      if (isType(it, 1024 /* ex */) && CourseMeta.forceEval)
        it.designForceEval = true; //pro design time - ukaz se vyhodnoceny na 100%
    });

    //druhy pruchod
    scan(CourseMeta.actCourseRoot, function (it) {
      if (isType(it, 1024 /* ex */))
        extend(it, CourseMeta.exImpl);
      else if (isType(it, 2 /* multiTask */))
        extend(it, CourseMeta.multiTaskImpl);
      else if (isType(it, 4 /* product */))
        extend(it, CourseMeta.productImpl);
      else if (isType(it, 32 /* taskCourse */))
        extend(it, CourseMeta.courseImpl);
      else if (isType(it, 8 /* test */))
        extend(it, testMe.testImpl);
      else if (isType(it, 256 /* taskTestInCourse */)) {
        it.type |= 16384 /* dynamicTestModule */;
        extend(it, CourseMeta.courseTestImpl, 8192 /* mod */);
      } else if (isType(it, 64 /* taskPretest */))
        extend(it, CourseMeta.pretestImpl);
      else if (isType(it, 512 /* taskTestSkill */)) {
        it.type |= 16384 /* dynamicTestModule */;
        extend(it, testMe.testSkillImpl, 8192 /* mod */);
      } else if (isType(it, 128 /* taskPretestTask */)) {
        extend(it, CourseMeta.pretestTaskImpl, 8192 /* mod */);
        it.each(function (e) {
          return e.testMode = CSLocalize('3859695377c4444abce16f7af9f5d2ec', 'Pretest');
        });
      } else if (isType(it, 8192 /* mod */))
        extend(it, CourseMeta.modImpl);
      //else if (isType(it, runtimeType.questionnaire)) extend(it, ex, runtimeType.ex);
    });

    //actCourseRoot: prepsani set x getUser
    if (!isType(CourseMeta.actCourseRoot, 8 /* test */))
      extend(CourseMeta.actCourseRoot, CourseMeta.skipAbleRoot, 32768 /* skipAbleRoot */);
  }

  (function (lib) {
    //reakce na zmenu URL
    function onChangeUrl(prodUrl, nodeUrl, completed) {
      CourseMeta.foundGreenEx = null;
      if (_.isEmpty(prodUrl)) {
        completed(null);
        return;
      }
      adjustProduct(prodUrl, function () {
        if (CourseMeta.actNode && CourseMeta.actNode.url == nodeUrl) {
          completed(isType(CourseMeta.actNode, 1024 /* ex */) ? CourseMeta.actNode : null);
          return;
        }
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
        }

        if (isType(CourseMeta.actNode, 1024 /* ex */))
          adjustEx(CourseMeta.actNode, doCompleted);
        else if (isType(CourseMeta.actNode, 8192 /* mod */))
          adjustMod(CourseMeta.actNode, function (mod) {
            return doCompleted(null);
          });
        else
          doCompleted(null);
      });
    }
    lib.onChangeUrl = onChangeUrl;

    function doRefresh(completed) {
      var compl = function () {
        if (completed)
          completed();
      };

      if (isType(CourseMeta.actNode, 65536 /* grammar */)) {
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
        }

        //actNode neni v green parent chain => modra sipka
        if (!CourseMeta.greenArrowDict[CourseMeta.actNode.url]) {
          fillArrowInfo(info_continue());
          compl();
          return;
        }

        //jiny task multitasku - prejdi pres home
        if (changeTaskInMultitask(CourseMeta.actNode, findRes.grEx))
          findRes.info = new CourseMeta.greenArrowInfo(CSLocalize('e64fb875261a4c5e849a9952ecc4ae63', 'Continue'), false, 'success', 'hand-o-right', function () {
            return CourseMeta.gui.gotoData(null);
          });

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
        if (n.done || n.findParent(function (t) {
            return t.done;
        }) != null)
          return false;
        var md = n;
        if (md.getDynamic && md.getDynamic()) {
          toExpand = n;
          return true;
        }
        var an = n;
        if (an.findGreenEx && !!(findRes = an.findGreenEx())) {
          return true;
        }
        return false;
      });
      if (findRes) {
        completed(findRes);
        return;
      }
      if (toExpand) {
        toExpand.expandDynamic();
        lib.saveProduct(function () {
          return findGreenExGlobal(toExpand, completed);
        });
        return;
      }
      completed(null); //nenalezeno nic
    }

    function findProduct(productId) {
      return _.find(CourseMeta.allProductList, function (prod) {
        return prod.url == productId;
      });
    }
    lib.findProduct = findProduct;

    function isTest(prod) {
      return prod && CourseMeta.isType(prod, 8 /* test */);
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

    function urlStripLast(url) {
      url = url.split('|')[0]; //odstran z productUrl cast |<archiveId>
      return url.substr(0, url.length - 1);
    }

    //zajisti existenci produktu
    function adjustProduct(prodUrl, completed) {
      if (CourseMeta.actProduct && CourseMeta.actProduct.url == prodUrl) {
        completed(false);
        return;
      }
      if (CourseMeta.actProduct)
        CourseMeta.actProduct.unloadActProduct();
      loadLocalizedSitemap(urlStripLast(prodUrl), function (prod) {
        CourseMeta.persist.loadShortUserData(schools.LMComUserId(), CourseMeta.actCompanyId, prodUrl, function (data) {
          if (data)
            for (var p in data)
              try {
                CourseMeta.actProduct.getNode(p).setUserData(data[p]);
              } catch (msg) {
              }
          completed(true);
        });
      });
    }
    lib.adjustProduct = adjustProduct;

    //zajisti existenci modulu (= lokalizace a slovnik)
    function adjustMod(nd, completed) {
      var actm = nd.findParent(function (n) {
        return isType(n, 8192 /* mod */);
      });
      if (actm == null) {
        completed(null);
        return;
      }
      var isGramm = isType(actm, 65536 /* grammar */);
      if ((isGramm && actm == CourseMeta.actGrammarModule) || (!isGramm && actm == CourseMeta.actModule)) {
        completed(actm);
        return;
      }
      if (isGramm)
        CourseMeta.actGrammarModule = actm;
      else
        CourseMeta.actModule = actm;
      load(urlStripLast(actm.url) + '.' + Trados.actLangStr, function (locDict) {
        if (!locDict)
          locDict = { loc: {}, dict: null };
        actm.loc = locDict.loc;
        actm.dict = locDict.dict ? RJSON.unpack(locDict.dict) : null;
        actm.expandDynamic();
        lib.saveProduct(function () {
          return completed(actm);
        });
      });
    }
    lib.adjustMod = adjustMod;

    //zajisti existenci cviceni (= modul)
    function adjustEx(ex, completed) {
      adjustMod(ex, function (mod) {
        if (mod == null)
          throw 'Missing module for exercise';
        var isGramm = isType(ex, 65536 /* grammar */);
        if (isGramm)
          CourseMeta.actGrammarEx = ex;
        else
          CourseMeta.actEx = ex;
        if (ex.page) {
          completed(ex);
          return;
        }

        //###jsonML
        //load(ex.url, (pg: CourseModel.Page) => { //naladuj a zlokalizuj cviceni
        load(ex.url, function (pgJsonML) {
          var pg = extractEx(pgJsonML);
          Course.localize(pg, function (s) {
            return localizeString(pg.url, s, (isGramm ? CourseMeta.actGrammarModule : CourseMeta.actModule).loc);
          });
          if (isGramm) {
            ex.onSetPage(pg, null);
            completed(ex);
          } else
            CourseMeta.persist.loadUserData(schools.LMComUserId(), CourseMeta.actCompanyId, CourseMeta.actProduct.url, ex.url, function (exData) {
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
      load(urlStripLast(cfg.dataBatchUrl ? cfg.dataBatchUrl : '/siteroot/'), function (obj) {
        CourseMeta.allProductList = obj.items;
        Login.finishMyData();
        completed();
      });
    }
    lib.adjustAllProductList = adjustAllProductList;

    //zajisteni existence instrukci
    function adjustInstr(completed) {
      if (CourseMeta.instructions) {
        completed();
        return;
      }
      var pgUrl = '../data/instr/std/ex.js';
      var locUrl = '../data/instr/std.' + Trados.actLangStr + '.js';
      CourseMeta.persist.readFiles([pgUrl, locUrl], function (ress) {
        var pg = extractEx((jsonParse(ress[0])));
        if (pg == null)
          throw 'missing instr' + pgUrl;
        pg.Items = _.filter(pg.Items, function (it) {
          return !_.isString(it);
        });
        var loc = jsonParse(ress[1]);
        Course.localize(pg, function (s) {
          return localizeString(pg.url, s, loc ? loc.loc : null);
        });
        CourseMeta.instructions = {};
        _.each(pg.Items, function (it) {
          return CourseMeta.instructions[it.id.toLowerCase()] = JsRenderTemplateEngine.render("c_gen", it);
        });
        completed();
      });
    }
    lib.adjustInstr = adjustInstr;

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
          a.onclick = function (ev) {
            return gotoHref(ev, href);
          };
        }
      });

      //images
      _.each(cnt.find("img"), function (img) {
        var src = $(img).attr('src');
        if (_.isEmpty(src))
          return;
        src = Utils.fullUrl(src) ? src : Pager.basicDir + Utils.combineUrl(CourseMeta.actNode.url, src);
        $(img).attr('src', src);
      });

      //help
      help.finishHtmlDOM();
    }
    lib.finishHtmlDOM = finishHtmlDOM;

    function info_continue() {
      return new CourseMeta.greenArrowInfo(CSLocalize('2882c6a2ef6343089ae90c898cac63f6', 'Continue'), false, "info", "reply", function () {
        return CourseMeta.gui.gotoData(null);
      });
    }
    lib.info_continue = info_continue;
    function info_courseFinished() {
      return new CourseMeta.greenArrowInfo(CSLocalize('e06a4208d7c84c8ba97c1a700f00046c', 'Course completed!'), CourseMeta.actNode == CourseMeta.actCourseRoot, "info", "thumbs-up", CourseMeta.actNode == CourseMeta.actCourseRoot ? $.noop : function () {
        return CourseMeta.gui.gotoData(null);
      });
    }
    lib.info_courseFinished = info_courseFinished;

    //vykresleni naladovaneho cviceni
    function displayEx(loadedEx, beforeUpdate, afterUpdate) {
      var pgCtrl = CourseMeta.actExPageControl = new Course.Page(loadedEx.page, loadedEx);
      CourseMeta.gui.exerciseHtml = function () {
        return JsRenderTemplateEngine.render("c_gen", loadedEx.page);
      };
      CourseMeta.gui.exerciseCls = function () {
        return loadedEx.page.isOldEa ? "ea" : "new-ea";
      };
      pgCtrl.callInitProcs(0 /* beforeRender */, function () {
        if (!pgCtrl.MyData().isOldEa)
          pgCtrl.MyData().isPassive = _.all(pgCtrl.items, function (it) {
            return !it.tagInfo.isEval;
          }); //pasivni cviceni ma vsechna isEval=false
        pgCtrl.sound = new Course.pageSound(pgCtrl);
        if (beforeUpdate)
          beforeUpdate(loadedEx);
        oldEAInitialization = null;
        Pager.renderHtml(); //HTML rendering (kod, provedeny normalne za onUpdate)
        pgCtrl.callInitProcs(1 /* afterRender */, function () {
          if (!oldEAInitialization)
            oldEAInitialization = function (completed) {
              return completed();
            };
          oldEAInitialization(function () {
            pgCtrl.callInitProcs(2 /* afterRender2 */, function () {
              loadedEx.evaluator = loadedEx.page.isOldEa ? new EA.oldToNewScoreProvider($evalRoot()) : pgCtrl;
              loadedEx.onReady();
              if (afterUpdate)
                afterUpdate(loadedEx);

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

              //vse OK => display content
              var hidden = $('.visibleHidden');
              hidden.waitForImages(function () {
                return hidden.removeClass("visibleHidden");
              }, $.noop, false);
              Pager.callLoaded();
            });
          });
        });
      });
    }
    lib.displayEx = displayEx;

    //save user dat
    function saveProduct(completed) {
      if (!CourseMeta.actProduct) {
        completed();
        return;
      }
      var res = [];
      scan(CourseMeta.actCourseRoot, function (dt) {
        if (!dt.userPending)
          return;
        dt.getUserData(function (shrt, lng, key) {
          return res.push([key ? key : dt.url, shrt, lng]);
        });
        dt.userPending = false;
      });
      if (res.length > 0) {
        Logger.trace_course('saveProduct lib, items=' + _.map(res, function (r) {
          return r[0];
        }).join('; '));
        CourseMeta.persist.saveUserData(schools.LMComUserId(), CourseMeta.actCompanyId, CourseMeta.actProduct.url, res, completed); //neprazdny res => save. res ve tvaru [key, shortData, data]
      } else
        completed(); //prazdny res, NOOP
    }
    lib.saveProduct = saveProduct;

    //osetreni nezeleneho cviceni
    function treatBlueEx() {
      if (!CourseMeta.actNode || !isType(CourseMeta.actNode, 1024 /* ex */))
        return false;
      var findRes = CourseMeta.actNode.findGreenEx();
      findRes.info.css = 'info';
      fillArrowInfo(findRes.info);
      return true;
    }

    //zmena tasku v multitasku (=> skok pres home)
    function changeTaskInMultitask(nd1, nd2) {
      if (!isType(CourseMeta.actCourseRoot, 2 /* multiTask */))
        return false;
      var p1 = nd1.findParent(function (nd) {
        return _.any(CourseMeta.actCourseRoot.items, function (it) {
          return it == nd;
        });
      });
      var p2 = nd2.findParent(function (nd) {
        return _.any(CourseMeta.actCourseRoot.items, function (it) {
          return it == nd;
        });
      });
      return p1 && p2 && p1 != p2;
    }

    //nalezne prvni neprobrane cviceni
    function findGreenExLow(nd) {
      return findDeepNotSkiped(nd, function (n) {
        return isType(n, 1024 /* ex */) && !n.done;
      });
    }
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

    function fillArrowInfo(info) {
      fillInfo(info.title, info.disable, info.css, info.iconId, info.greenClick);
    }
    lib.fillArrowInfo = fillArrowInfo;
  })(CourseMeta.lib || (CourseMeta.lib = {}));
  var lib = CourseMeta.lib;

  var jsExt = '.js';
  var testModuleExercises = '@test_module_exercises';

  function emptyExData() {
    var res = { i: 0, s: { s: 0, ms: 0, needsHumanEval: false }, st: 1 /* Normal */, bt: 0, et: 0, t: 0, Results: null };
    return res;
  }

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

  function addUserData(key, shrt, lng, data) {
    data.push([key, shrt, lng]);
  }
  CourseMeta.addUserData = addUserData;

  function isType(dt, tp) {
    return (dt.type & tp) == tp;
  }
  CourseMeta.isType = isType;

  function scan(dt, action, cond) {
    if (typeof cond === "undefined") { cond = null; }
    if (dt.items)
      _.each(dt.items, function (it) {
        return scan(it, action, cond);
      });
    if (!cond || cond(dt))
      action(dt);
  }
  CourseMeta.scan = scan;
  function scanParentFirst(dt, action, cond) {
    if (typeof cond === "undefined") { cond = null; }
    if (!cond || cond(dt))
      action(dt);
    if (dt.items)
      _.each(dt.items, function (it) {
        return scanParentFirst(it, action, cond);
      });
  }
  CourseMeta.scanParentFirst = scanParentFirst;
  function scanOfType(dt, type, action) {
    scan(dt, function (d) {
      return action(d);
    }, function (d) {
      return d.type == type;
    });
  }
  CourseMeta.scanOfType = scanOfType;
  function findDeep(dt, cond) {
    if (typeof cond === "undefined") { cond = null; }
    if (cond(dt))
      return dt;
    if (!dt.items)
      return null;
    var res = null;
    return _.find(dt.items, function (it) {
      return (res = findDeep(it, cond)) != null;
    }) ? res : null;
  }
  CourseMeta.findDeep = findDeep;

  function findDeepNotSkiped(dt, cond) {
    if (typeof cond === "undefined") { cond = null; }
    if (dt.isSkiped)
      return null;
    if (cond(dt))
      return dt;
    if (!dt.items)
      return null;
    var res = null;
    return _.find(dt.items, function (it) {
      return (res = findDeepNotSkiped(it, cond)) != null;
    }) ? res : null;
  }
  CourseMeta.findDeepNotSkiped = findDeepNotSkiped;

  function extend(d, t, tp) {
    if (typeof tp === "undefined") { tp = 0; }
    extendLow(d, t);
    d.type = d.type | tp;
  }
  function extendLow(d, t, tp) {
    if (typeof tp === "undefined") { tp = 0; }
    t = t.prototype;
    for (var p in t)
      d[p] = t[p];
    d.constructor();
  }
  CourseMeta.extendLow = extendLow;

  function localizeString(keyPrefix, data, loc) {
    if (_.isEmpty(data) || data.indexOf('{{') < 0)
      return data;
    if (!loc)
      loc = {};
    return data.replace(locEx, function (match) {
      var gm = [];
      for (var _i = 0; _i < (arguments.length - 1) ; _i++) {
        gm[_i] = arguments[_i + 1];
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
  var locEx = /{{(.*?)}}/g;

  function extractEx(pgJsonML) {
    var html = jsonML_to_Tag(pgJsonML);
    var pg = html.Items[1];
    var head = html.Items[0];
    var title = head && head.Items && head.Items[0] ? head.Items[0] : null;
    pg.title = title && title.Items && _.isString(title.Items[0]) ? title.Items[0] : '';

    //pg.title = titleTag && titleTag['Items'] && titleTag['Items'].length == 1 && _.isString(headItems[0]) ? headItems[0] : '';
    pg.tg = CourseModel.tPage; //hack. body ma jinak Type=body
    if (!_.isEmpty(pg.seeAlsoStr)) {
      pg.seeAlso = _.map(pg.seeAlsoStr.split('#'), function (sa) {
        var parts = sa.split('|');
        var res = { url: parts[0], title: parts[1], type: 0 };
        return res;
      });
    }
    if (!_.isEmpty(pg.instrsStr))
      pg.instrs = pg.instrsStr.split('|');
    return pg;
  }
  CourseMeta.extractEx = extractEx;

  //export function loadEx(href: string, completed: (dt: CourseModel.Page) => void) {
  //  load(href, (pgJsonML: Array<any>) => {
  //    var html = jsonML_to_Tag(pgJsonML);
  //    var pg: CourseModel.Page = html.Items[1]; pg.title = html.Items && html.Items[0] && html.Items[0].Items && html.Items[0].Items[0] && html.Items[0].Items[0].Items ? html.Items[0].Items[0].Items[0] : '';
  //    pg.tg = CourseModel.tPage; //hack. body ma jinak Type=body
  //    if (!_.isEmpty(pg.seeAlsoStr)) {
  //      pg.seeAlso = _.map(pg.seeAlsoStr.split('#'), sa => {
  //        sa.split('|');
  //        var res: schools.seeAlsoLink = { url: sa[0], title: sa[1], type: 0 };
  //        return res;
  //      });
  //    }
  //    if (!_.isEmpty(pg.instrsStr)) pg.instrs = pg.instrsStr.split('|');
  //    completed(pg);
  //  });
  //}
  function load(href, completed) {
    CourseMeta.persist.readFiles([href + jsExt], function (ress) {
      return completed(jsonParse(ress[0]));
    });
  }
  CourseMeta.load = load;

  function loadLocalizedSitemap(href, completed) {
    loadDataAndLoc(href, function (prod, loc) {
      finishStaticTree(prod);
      if (!loc)
        loc = {};
      scan(prod, function (it) {
        if (it.localize)
          it.localize(function (s) {
            return localizeString(it.url, s, loc);
          });
      });
      completed(prod);
    });
  }

  function jsonParse(str) {
    if (!str || str.length < 1)
      return null;
    var isRjson = str.charAt(0) == rjsonSign;
    if (isRjson)
      str = str.substr(1);
    var obj = JSON.parse(str);
    if (isRjson)
      obj = RJSON.unpack(obj);
    return obj;
  }

  function loadDataAndLoc(href, completed) {
    href = '..' + (href[0] == '/' ? '' : '/') + href;
    CourseMeta.persist.readFiles([href + jsExt, href + '.' + Trados.actLangStr + jsExt], function (ress) {
      var pages = jsonParse(ress[0]);
      if (!pages)
        throw 'error loading ' + href;
      var locDict = jsonParse(ress[1]);
      completed(pages, locDict);
    });
  }
  var rjsonSign = "@";





  $.views.helpers({
    productLineTxt: lib.productLineTxt,
    productLineTxtLower: function (productId) {
      return lib.productLineTxt(productId).toLowerCase();
    }
  });
})(CourseMeta || (CourseMeta = {}));

var help;
(function (help) {
  function click() {
    //return false;
  }
  help.click = click;
  function finishHtmlDOM() {
    //_.each($('.ctx-help'), el => {
    //  var hlp = $('<div class="help-btn fa"></div>');
    //  $(el).prepend(hlp[0]);
    //  hlp.click(() => help.click());
    //});
  }
  help.finishHtmlDOM = finishHtmlDOM;
})(help || (help = {}));

var __extends = this.__extends || function (d, b) {
  for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
  function __() { this.constructor = d; }
  __.prototype = b.prototype;
  d.prototype = new __();
};
var CourseModel;
(function (CourseModel) {
  function find(dt, cond) {
    if (typeof cond === "undefined") { cond = null; }
    if (cond(dt))
      return dt;
    if (!dt.Items)
      return null;
    var res = null;
    return _.find(dt.Items, function (it) {
      return (res = find(it, cond)) != null;
    }) ? res : null;
  }
  CourseModel.find = find;
})(CourseModel || (CourseModel = {}));

var CourseMeta;
(function (CourseMeta) {
  var dataImpl = (function () {
    function dataImpl() {
    }
    //funkce a akce
    dataImpl.prototype.localize = function (locProc) {
      this.title = locProc(this.title);
    };
    dataImpl.prototype.each = function (action) {
      if (this.items)
        _.each(this.items, function (it) {
          return action(it);
        });
    };
    dataImpl.prototype.find = function (cond) {
      return (_.find(this.items, function (it) {
        return cond(it);
      }));
    };
    dataImpl.prototype.findParent = function (cond) {
      var c = this;
      while (c != null) {
        if (cond(c))
          return c;
        c = c.parent;
      }
      return null;
    };
    dataImpl.prototype.href = function (companyId, productUrl) {
      if (typeof companyId === "undefined") { companyId = -1; }
      if (typeof productUrl === "undefined") { productUrl = null; }
      var tp;
      if (CourseMeta.isType(this, 65536 /* grammar */))
        tp = CourseMeta.isType(this, 1024 /* ex */) ? schools.tGrammPage : schools.tGrammFolder;
      else if (CourseMeta.isType(this, 64 /* taskPretest */))
        tp = schools.tCoursePretest;
      else
        tp = CourseMeta.isType(this, 1024 /* ex */) ? schools.tEx : schools.tCourseMeta;
      return schools.getHash(tp, companyId == -1 ? CourseMeta.actCompanyId : companyId, productUrl ? productUrl : CourseMeta.actProduct.url, this.url);
    };

    dataImpl.prototype.iconId = function () {
      if (this == CourseMeta.actCourseRoot)
        return "book";
      else if (CourseMeta.isType(this, 1024 /* ex */))
        return CourseMeta.isType(this, 65536 /* grammar */) ? "file-o" : "edit";
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
    productImpl.prototype.getNode = function (url) {
      return (this.allNodes[url]);
    };

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
      return (this.getScoreValue = this.complNotPassiveCnt == 0 ? -1 : Math.round(this.score / this.complNotPassiveCnt));
    };
    courseNode.prototype.progress = function () {
      return this.exCount - this.skipedCount == 0 ? 0 : Math.round(100 * (this.complNotPassiveCnt + this.complPassiveCnt - this.skipedCount) / (this.exCount - this.skipedCount));
    };
    courseNode.prototype.statusText = function () {
      var pr = this.progress();
      return (pr > 0 ? CSLocalize('f124b261dbf9482d9c92e0c1b029f98a', 'Progress') + ' ' + pr.toString() + '%, ' : '') + this.statusStr();
    };
    courseNode.prototype.statusStr = function () {
      if (this.isSkiped)
        return CSLocalize('d96c8f11b16d4c9aa91ac8d8142267fa', 'skipped');
      return this.done ? CSLocalize('01fbc5f8a77c4e2491a9ed3ede74e966', 'completed') : (CourseMeta.greenArrowDict[this.url] ? CSLocalize('1fe40e2548924e519e9b226d4ced7bce', 'run') : CSLocalize('b7ed3c7fc67640ceb98417153f731d63', 'browse'));
    };
    courseNode.prototype.labelCls = function () {
      return CourseMeta.greenArrowDict[this.url] ? 'warning' : 'default';
    };
    courseNode.prototype.btnIconId = function () {
      return CourseMeta.greenArrowDict[this.url] ? 'play' : null;
    };
    courseNode.prototype.iconId = function () {
      return 'folder-open';
    };

    courseNode.prototype.contentCss = function () {
      var res = '';
      if (_.isEmpty(this.btnIconId()))
        res += 'btn-icon-hidden';
      if (this.isSkiped)
        res += ' disabled';
      return res;
    };

    //disabledCss(): string { return this.isSkiped ? 'disabled' : ''; }
    courseNode.prototype.notRunnableMsg = function () {
      return null;
    };
    courseNode.prototype.showProgress = function () {
      return this.complNotPassiveCnt > 0;
    };

    //menu(): schoolHome.menuItem[] { return []; }
    //btnColor(): string { return }
    courseNode.prototype.btnClick = function () {
      CourseMeta.gui.gotoData(this);
    };

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
      CourseMeta.scan(this, function (d) {
        delete skiped.allSkiped[d.url];
        d.isSkiped = false;
      });
      if (value)
        skiped.allSkiped[this.url] = true;
      if (withSave)
        CourseMeta.lib.saveProduct(CourseMeta.gui.onReload);
    };

    courseNode.prototype.getSkipedTable = function (willModify) {
      var skRoot = this.findParent(function (it) {
        return CourseMeta.isType(it, 32768 /* skipAbleRoot */);
      });
      if (!skRoot)
        return null;
      if (willModify) {
        if (!skRoot.allSkiped)
          skRoot.allSkiped = {};
        skRoot.userPending = true;
      }
      return skRoot;
    };

    courseNode.prototype.refreshNumbers = function (exCountOnly) {
      if (typeof exCountOnly === "undefined") { exCountOnly = false; }
      courseNode.doRefreshNumbers(this, exCountOnly);
    };

    courseNode.doRefreshNumbers = function (th, exCountOnly) {
      if (typeof exCountOnly === "undefined") { exCountOnly = false; }
      th.complPassiveCnt = th.complNotPassiveCnt = th.score = th.beg = th.end = th.elapsed = th.skipedCount = th.exCount = 0;
      th.done = th.isSkiped = false;

      //skiped => done
      if (th.getSkiped()) {
        th.exCount = 0;
        th.each(function (it) {
          it.refreshNumbers(true);
          th.exCount += it.exCount;
        });
        th.skipedCount = th.exCount;
        th.isSkiped = true;
        return;
      }

      //agregate childs
      _.each(th.items, function (it) {
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
        if (it.score >= 0)
          th.score += it.score; //zaporne score => nevyhodnotitelne
        th.beg = setDate(th.beg, it.beg, true);
        th.end = setDate(th.end, it.end, false);
      });
      if (exCountOnly)
        return;
      if (th.skipedCount > 0 && th.skipedCount == th.exCount) {
        th.isSkiped = true;
        return;
      }
      if (th.complNotPassiveCnt + th.complPassiveCnt + th.skipedCount == th.exCount)
        th.done = true;
      //if (th.complNotPassiveCnt == 0 && th.complPassiveCnt > 0) th.score = -1;
      //else if (th.complNotPassiveCnt > 0) th.score = Math.round(th.score / th.complNotPassiveCnt);
    };

    courseNode.prototype.availableActions = function () {
      if (this.isSkiped)
        return CourseMeta.NodeAction.createActions(this, 4 /* unskip */);
      return this.done ? CourseMeta.NodeAction.createActions(this, 1 /* browse */, this.complNotPassiveCnt + this.complPassiveCnt > 0 ? 5 /* reset */ : 0 /* no */, 2 /* skip */) : CourseMeta.NodeAction.createActions(this, CourseMeta.greenArrowDict[this.url] ? 3 /* run */ : 1 /* browse */, this.complNotPassiveCnt + this.complPassiveCnt > 0 ? 5 /* reset */ : 0 /* no */, 2 /* skip */);
    };

    //dostupne akce nad node
    courseNode.prototype.onAction = function (type) {
      switch (type) {
        case 1 /* browse */:
        case 3 /* run */:
          CourseMeta.gui.gotoData(this);
          break;
        case 2 /* skip */:
          this.setSkiped(true, true);
          break;
        case 4 /* unskip */:
          this.setSkiped(false, true);
          break;
        case 5 /* reset */:
          //majdi all a resetable urls
          var resetableUrls = [];
          var allUrls = [];
          CourseMeta.scan(this, function (it) {
            allUrls.push(it.url);
            if (!it.resetStatus)
              return;
            if (it.resetStatus())
              resetableUrls.push(it.url);
          });

          //vlastni reset funkce
          var doReset = function () {
            return CourseMeta.persist.resetExs(schools.LMComUserId(), CourseMeta.actCompanyId, CourseMeta.actProduct.url, resetableUrls, CourseMeta.gui.onReload);
          };

          //vyrad je ze skiped a volej doReset
          var skiped = this.getSkipedTable(false);
          if (skiped.allSkiped) {
            var changed = false;
            _.each(allUrls, function (u) {
              delete skiped.allSkiped[u];
              changed = true;
            });
            if (changed) {
              skiped.userPending = true;
              CourseMeta.lib.saveProduct(doReset);
            } else
              doReset();
          } else
            doReset();
          break;
        case 6 /* runTestAgain */:
          break;
        case 7 /* cancelTestSkip */:
          break;
      }
    };

    courseNode.prototype.setUserData = function (data) {
    };
    courseNode.prototype.getUserData = function (setData) {
    };

    courseNode.prototype.expandDynamic = function (completed) {
      if (completed)
        completed();
    };
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
      setData(JSON.stringify(this.allSkiped), null);
    };
    skipAbleRoot.prototype.resetStatus = function () {
      if (!this.allSkiped)
        return false;
      delete this.allSkiped;
      return true;
    };
    return skipAbleRoot;
  })(courseNode);
  CourseMeta.skipAbleRoot = skipAbleRoot;

  var multiTaskImpl = (function (_super) {
    __extends(multiTaskImpl, _super);
    function multiTaskImpl() {
      _super.apply(this, arguments);
    }
    multiTaskImpl.prototype.iconId = function () {
      return 'th';
    };
    return multiTaskImpl;
  })(courseNode);
  CourseMeta.multiTaskImpl = multiTaskImpl;

  var modImpl = (function (_super) {
    __extends(modImpl, _super);
    function modImpl() {
      _super.apply(this, arguments);
    }
    modImpl.prototype.iconId = function () {
      return 'book';
    };

    modImpl.prototype.setUserData = function (data) {
      this.adjustSitemap(data);
    };
    modImpl.prototype.adjustSitemap = function (urls) {
      var _this = this;
      this.oldItems = this.items;
      this.items = _.map(urls, function (url) {
        var e = new exImpl();
        e.url = url;
        e.type = 1024 /* ex */;
        e.parent = _this;
        CourseMeta.actProduct.allNodes[e.url] = e;
        return e;
      });
      this.each(function (e) {
        return e.testMode = CSLocalize('b8601c3b0385401b912f5f104b8d728e', 'Test');
      });
    };
    modImpl.prototype.getUserData = function (setData) {
      setData(JSON.stringify(_.map(this.items, function (it) {
        return it.url;
      })), null);
    };
    modImpl.prototype.onUnloadMod = function () {
      this.dict = null;
      this.loc = null;
    };

    modImpl.prototype.resetStatus = function () {
      if (!this.oldItems)
        return false;
      this.items = this.oldItems;
      delete this.oldItems;
      return true;
    };

    modImpl.prototype.expandDynamic = function () {
      var dynData = this.getDynamic();
      if (!dynData)
        return;
      var urls = _.flatten(_.map(dynData.groups, function (grp) {
        return _.sample(grp.urls, grp.take);
      }));
      this.adjustSitemap(urls);
      this.userPending = true;
    };

    modImpl.prototype.refreshNumbers = function (exCountOnly) {
      if (typeof exCountOnly === "undefined") { exCountOnly = false; }
      var th = this;
      var dynData = th.getDynamic();
      if (dynData) {
        th.complPassiveCnt = th.complNotPassiveCnt = th.score = th.beg = th.end = th.elapsed = th.skipedCount = th.exCount = 0;
        th.done = th.isSkiped = false;
        _.each(dynData.groups, function (g) {
          return th.exCount += g.take;
        });
        if (th.getSkiped()) {
          th.isSkiped = true;
          th.skipedCount = th.exCount;
        }
      } else
        courseNode.doRefreshNumbers(th, exCountOnly);
    };

    modImpl.prototype.getDynamic = function () {
      var dynData = (this.items ? this.items[0] : null);
      return dynData && CourseMeta.isType(dynData, 2048 /* dynamicModuleData */) ? dynData : null;
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
    }
    exImpl.prototype.iconId = function () {
      if ((this.parent.type & (256 /* taskTestInCourse */ | 512 /* taskTestSkill */ | 128 /* taskPretestTask */)) != 0)
        return 'puzzle-piece';
      if (this.findParent(function (it) {
          return CourseMeta.isType(it, 65536 /* grammar */);
      }))
        return 'file-o';
      return 'edit';
    };

    exImpl.prototype.resetStatus = function () {
      var th = this;
      if (!th.result && !th.done)
        return false;
      delete th.done;
      delete th.score;
      delete th.beg;
      delete th.end;
      delete th.elapsed;
      th.onUnloadEx();
      return true;
    };

    exImpl.prototype.refreshNumbers = function (exCountOnly) {
      if (typeof exCountOnly === "undefined") { exCountOnly = false; }
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
      }
      if (th.done)
        if (th.score < 0)
          th.complPassiveCnt = 1;
        else
          th.complNotPassiveCnt = 1;
    };
    exImpl.prototype.onUnloadEx = function () {
      delete this.page;
      delete this.result;
      delete this.evaluator;
    };
    exImpl.prototype.setUserData = function (user) {
      exImpl.asignResult(user, this);
    };
    exImpl.prototype.getUserData = function (setData) {
      var res = {};
      exImpl.asignResult(this, res);
      setData(JSON.stringify(res), JSON.stringify(this.result));
    };

    exImpl.prototype.onSetPage = function (page, result) {
      this.page = page;
      if (!result)
        result = {};
      this.result = result;
      if (!page.isOldEa)
        page.isPassive = !CourseModel.find(page, function (data) {
          return data.tg && CourseModel.tagInfos[data.tg].isEval;
        }); //pasivni cviceni nema zadne kontrolky
    };
    exImpl.prototype.onReady = function () {
      this.startTime = new Date().getTime();
      if (!this.beg)
        this.beg = Utils.dayToInt(new Date());
      this.evaluator.acceptData(this.done, this.result);
    };

    exImpl.asignResult = function (from, to) {
      to.beg = from.beg;
      to.elapsed = from.elapsed;
      to.end = from.end;
      to.score = from.score;
      to.done = from.done;
    };

    exImpl.prototype.findGreenEx = function () {
      var _this = this;
      var th = this;
      if (th.isSkiped)
        return null;
      var selfIdx = _.indexOf(th.parent.items, this);
      var parentCount = 0;
      th.parent.each(function (nd) {
        if (nd.isSkiped || !CourseMeta.isType(nd, 1024 /* ex */))
          return;
        parentCount++;
      });
      var notSkipIdx = 0;
      th.parent.find(function (nd) {
        if (!nd.isSkiped)
          notSkipIdx++;
        return nd == th;
      });
      var idxFrom = ' (' + notSkipIdx.toString() + '/' + parentCount.toString() + ')';
      var res = {
        grEx: this, info: new CourseMeta.greenArrowInfo(CSLocalize('4f40988151d646308e50bf2225211081', 'Continue'), false, 'success', 'hand-o-right', function () {
          return CourseMeta.gui.gotoData(_this);
        })
      };

      if (!th.page)
        return res;

      var lastInMod;
      var nextEx = null;

      for (var i = selfIdx + 1; i < this.parent.items.length; i++) {
        var it = (this.parent.items[i]);
        if (CourseMeta.isType(it, 1024 /* ex */) && !it.isSkiped) {
          nextEx = it;
          break;
        }
      }
      lastInMod = nextEx == null;

      //jdi na dalsi node
      var nd = lastInMod && !th.testMode ? th.parent : nextEx;

      //var gotoData = () => gui.gotoData(nd);
      if (CourseMeta.actNode != this) {
        res.info.title = CSLocalize('9a48bff2169240759d9e5b1c87618c1b', 'Continue');
        res.info.greenClick = function () {
          return CourseMeta.gui.gotoData(th);
        };
      } else if (!th.testMode && !th.page.isPassive && !th.done) {
        res.info.title = CourseMeta.actNode == this ? CSLocalize('0b129b06c25b49908cd4576008025495', 'Evaluate') + idxFrom : CSLocalize('89024e890690456aaaf0251de3225fd6', 'Continue');
        res.info.greenClick = function () {
          if (_this.evaluate()) {
            CourseMeta.lib.saveProduct(function () {
              CourseMeta.actCourseRoot.refreshNumbers();
              var inf = th.findGreenEx().info;
              inf.css = CourseMeta.greenCss();
              CourseMeta.lib.fillArrowInfo(inf);
              CourseMeta.refreshExerciseBar(th);
            });
          }
        };
      } else {
        res.info.title = (th.testMode ? th.testMode : (lastInMod ? CSLocalize('d874aa91bc914690ad75fe97a707e196', 'Completed') : CSLocalize('ba88aabeae6d4d59b235c927472c6440', 'Next'))) + idxFrom;
        if (!th.testMode && lastInMod)
          res.info.iconId = 'th-list';
        res.info.greenClick = function () {
          if (!th.done) {
            if (_this.evaluate()) {
              CourseMeta.lib.saveProduct(function () {
                return CourseMeta.gui.gotoData(nd);
              });
            }
          } else
            CourseMeta.gui.gotoData(nd);
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
      if (this.page.isPassive) {
        this.done = true;
        this.score = -1;
        return true;
      }

      //zjisteni score
      this.evaluator.provideData(this.result);
      var score = this.evaluator.getScore();
      if (!score || score.ms == 0) {
        this.page.isPassive = true;
        this.done = true;
        this.score = -1;
        return true;
      }

      //cviceni je mozne vyhodnotit
      var exerciseOK = this.testMode ? true : (score == null || score.ms == 0 || (score.s / score.ms * 100) >= 75);
      if (!exerciseOK && !CourseMeta.gui.alert(0 /* exTooManyErrors */, true)) {
        this.userPending = false;
        return false;
      }
      if (!this.testMode)
        this.evaluator.acceptData(true, this.result);
      this.done = true;
      this.score = score.ms == 0 ? -1 : Math.round(score.s / score.ms * 100);
      return true;
    };

    exImpl.prototype.testEvaluate = function () {
      this.evaluator.provideData(this.result);
      this.userPending = true;
      var score = this.evaluator.getScore();
      this.done = true;
      this.score = Math.round(score.s / score.ms * 100);
    };

    exImpl.prototype.reset = function () {
      if (!this.done)
        return;
      this.done = false;
      if (this.page.isPassive)
        this.score = -1;
      else
        this.evaluator.resetData(this.result);
      this.userPending = true;
      CourseMeta.saveAndReload();
    };
    exImpl.maxDelta = 10 * 60;
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
    pretestImpl.prototype.iconId = function () {
      return 'puzzle-piece';
    };
    pretestImpl.prototype.showProgress = function () {
      return false;
    };

    pretestImpl.prototype.resetStatus = function () {
      var th = this;
      if (!th.pretestStatus)
        return false;
      delete th.pretestStatus;
      delete th.firstTestIdx;
      delete th.lastTestIdx;
      delete th.questionnaire;
      return true;
    };

    pretestImpl.prototype.initFields = function () {
      var _this = this;
      if (this.questionnaire)
        return;
      if (!this.pretestStatus)
        this.pretestStatus = 0 /* questionaries */;
      this.questionnaire = CourseMeta.findDeep(this, function (it) {
        return it.name == 'questionnaire';
      });
      this.result = CourseMeta.findDeep(this, function (it) {
        return it.name == 'result';
      });
      this.pretests = [];
      this.each(function (it) {
        if (CourseMeta.isType(it, 128 /* taskPretestTask */))
          _this.pretests.push(it);
      });
    };

    pretestImpl.prototype.findGreenEx = function () {
      var _this = this;
      var th = this;
      return th.pretestStatus == 3 /* done */ ? null : {
        grEx: this, info: new CourseMeta.greenArrowInfo('Pretest', false, 'success', 'hand-o-right', function () {
          return CourseMeta.gui.gotoData(_this);
        })
      };
    };

    pretestImpl.prototype.pretestContinue = function () {
      var th = this;
      if (CourseMeta.actEx != th.actPretestEx())
        throw 'actEx != th.actPretestEx()';
      th.initFields();
      var nextEx;
      switch (th.pretestStatus) {
        case 0 /* questionaries */:
          CourseMeta.actEx.evaluate();
          CourseMeta.actCourseRoot.refreshNumbers();

          //zpracuj dotaznik
          //TODO
          th.firstTestIdx = 0;
          th.pretestStatus = 1 /* firstTest */;
          th.userPending = true;
          nextEx = CourseMeta.lib.findGreenExLow(th.pretests[th.firstTestIdx]);
          break;
        case 1 /* firstTest */:
          CourseMeta.actEx.evaluate();
          CourseMeta.actCourseRoot.refreshNumbers();
          nextEx = CourseMeta.lib.findGreenExLow(th.pretests[th.firstTestIdx]);
          if (!nextEx) {
            //zpracuj prvni pretest
            //TODO
            th.lastTestIdx = 1;
            th.pretestStatus = 2 /* lastTest */;
            th.userPending = true;
            nextEx = CourseMeta.lib.findGreenExLow(th.pretests[th.lastTestIdx]);
          }
          break;
        case 2 /* lastTest */:
          CourseMeta.actEx.evaluate();
          CourseMeta.actCourseRoot.refreshNumbers();
          nextEx = CourseMeta.lib.findGreenExLow(th.pretests[th.lastTestIdx]);
          if (!nextEx) {
            //zpracuj druhy pretest
            //TODO
            th.pretestStatus = 3 /* done */;
            th.userPending = true;
            nextEx = th.result;
          }
          break;
        case 3 /* done */:
          break;
      }
      CourseMeta.lib.saveProduct(function () {
        if (nextEx)
          CourseMeta.lib.adjustEx(nextEx, function () {
            return CourseMeta.lib.displayEx(nextEx, function (ex) {
              return Pager.clearHtml();
            }, null);
          });
        else
          CourseMeta.gui.gotoData(null);
      });
    };

    pretestImpl.prototype.actPretestEx = function () {
      var th = this;
      th.initFields();
      switch (th.pretestStatus) {
        case 0 /* questionaries */:
          return th.questionnaire;
        case 1 /* firstTest */:
          return CourseMeta.lib.findGreenExLow(th.pretests[th.firstTestIdx]);
        case 2 /* lastTest */:
          return CourseMeta.lib.findGreenExLow(th.pretests[th.lastTestIdx]);
        default:
          return th.result;
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
        res.info = new CourseMeta.greenArrowInfo('Pretest', false, 'success', 'hand-o-right', function () {
          return th.pretestContinue();
        });
      return res;
    };

    pretestImpl.prototype.refreshNumbers = function (exCountOnly) {
      if (typeof exCountOnly === "undefined") { exCountOnly = false; }
      var th = this;
      th.initFields();
      var tempItems = th.items;
      th.items = [];
      th.items.push(th.questionnaire);
      if (th.pretestStatus > 0 /* questionaries */)
        th.items.push(th.pretests[th.firstTestIdx]);
      if (th.pretestStatus > 1 /* firstTest */)
        th.items.push(th.pretests[th.lastTestIdx]);
      courseNode.doRefreshNumbers(th, exCountOnly);
      th.items = tempItems;
    };

    pretestImpl.prototype.setUserData = function (user) {
      pretestImpl.asignResult(user, this);
    };
    pretestImpl.prototype.getUserData = function (setData) {
      var res = {};
      pretestImpl.asignResult(this, res);
      setData(JSON.stringify(res), null);
    };
    pretestImpl.asignResult = function (from, to) {
      to.pretestStatus = from.pretestStatus;
      to.firstTestIdx = from.firstTestIdx;
      to.lastTestIdx = from.lastTestIdx;
    };
    return pretestImpl;
  })(courseNode);
  CourseMeta.pretestImpl = pretestImpl;
})(CourseMeta || (CourseMeta = {}));


/// <reference path="Media.ts" />
/// <reference path="Course.ts" />

var __extends = this.__extends || function (d, b) {
  for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
  function __() { this.constructor = d; }
  __.prototype = b.prototype;
  d.prototype = new __();
};
var Course;
(function (Course) {
  var edit = (function (_super) {
    __extends(edit, _super);
    function edit(staticData, myPage) {
      _super.call(this, staticData, myPage);
      this.user = ko.observable('');
      this.st = ko.observable('');
    }
    edit.prototype.MyResult = function () {
      return this.result;
    };
    edit.prototype.MyData = function () {
      return this.data;
    };

    edit.prototype.createResult = function (forceEval) {
      if (typeof forceEval === "undefined") { forceEval = false; }
      return { Value: forceEval ? this.MyData().correctValue.split('|')[0] : "" };
    };

    edit.prototype.isCorrect = function () {
      var res = this.doNormalize(this.MyResult().Value);
      return _.any(this.corrects, function (s) {
        return s == res;
      });
    };
    edit.prototype.provideData = function (userData) {
      if (!this.status())
        return;
      userData.Value = this.user();
    };
    edit.prototype.acceptData = function (done, userData) {
      this.user(userData.Value);
      var val = this.doNormalize(userData.Value);
      if (!done)
        this.st('edit');
      else if (this.isCorrect())
        this.st('ok');
      else
        this.st(!val || val == '' ? 'empty' : 'wrong');
    };
    edit.prototype.doNormalize = function (s) {
      return s;
    };

    edit.prototype.widthStyle = function () {
      return null;
    };
    return edit;
  })(Course.control);
  Course.edit = edit;

  var gapFill = (function (_super) {
    __extends(gapFill, _super);
    function gapFill(staticData, myPage) {
      var _this = this;
      _super.call(this, staticData, myPage);
      this.corrects = _.map(this.MyData().correctValue.split('|'), function (s) {
        return _this.doNormalize(s);
      });
      this.teacher = this.MyData().correctValue.split('|')[0];
    }
    gapFill.prototype.initProc = function (phase, getTypeOnly, completed) {
      switch (phase) {
        case 2 /* afterRender2 */:
          if (!getTypeOnly) {
            if (this.source)
              return;
            var myControl = this.selfElement();
            var strings = [];
            strings.push(this.MyData().initValue);
            _.each(this.corrects, function (s) {
              return strings.push(s);
            });
            var maxWidth = Gui2.maxTextWidth(strings, myControl.find('.teacher').first());
            myControl.width(maxWidth + 10);
          }
          return 1 /* sync */;
      }
      return _super.prototype.initProc.call(this, phase, getTypeOnly, completed);
    };

    gapFill.prototype.MyData = function () {
      return this.data;
    };
    gapFill.prototype.createResult = function (forceEval) {
      if (typeof forceEval === "undefined") { forceEval = false; }
      return { Value: forceEval ? this.corrects[0] : this.MyData().initValue };
    };
    gapFill.prototype.doNormalize = function (s) {
      return Course.normalize(s);
    };
    return gapFill;
  })(edit);
  Course.gapFill = gapFill;
})(Course || (Course = {}));

var __extends = this.__extends || function (d, b) {
  for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
  function __() { this.constructor = d; }
  __.prototype = b.prototype;
  d.prototype = new __();
};
var Course;
(function (Course) {
  var pairing = (function (_super) {
    __extends(pairing, _super);
    function pairing(staticData, myPage) {
      var _this = this;
      _super.call(this, staticData, myPage);
      this.leftSelected = ko.observable(false);
      var cnt = 0;
      this.items = _.map(staticData.Items, function (it) {
        return new pairingItem(cnt++, it, _this, myPage);
      });
      var rnd = Utils.randomizeArray(_.range(this.items.length));
      this.random = _.map(rnd, function (i) {
        return (_this.items[i]);
      });
    }
    pairing.prototype.initProc = function (phase, getTypeOnly, completed) {
      switch (phase) {
        case 2 /* afterRender2 */:
          if (!getTypeOnly) {
            //Nastaveni sirky prave strany jako rozdilu mezi MIN sirkou pairingu a sirkou prave strany (minus 145)
            var strings = _.map(this.MyData().Items, function (it) {
              return it.right;
            });
            var styleHolder = this.selfElement().find('.c-edit .teacher').first();
            var maxWidth = Gui2.maxTextWidth(strings, styleHolder);
            var w = Course.minWidth(this.MyData().width);
            if (w == 0)
              return;
            this.selfElement().find('.pairing-item .left-content').width(w - maxWidth - 145); //145px je sirka pomocnych casti pairingu, bez leveho a praveho obsahu:
          }
          return 1 /* sync */;
      }
      return _super.prototype.initProc.call(this, phase, getTypeOnly, completed);
    };

    pairing.prototype.MyResult = function () {
      return this.result;
    };
    pairing.prototype.MyData = function () {
      return this.data;
    };

    pairing.prototype.createResult = function (forceEval) {
      if (typeof forceEval === "undefined") { forceEval = false; }
      return {
        Value: forceEval ? _.range(this.items.length) : _.map(this.random, function (it) {
          return it.selfIdx;
        })
      };
    };
    pairing.prototype.score = function () {
      var v = this.MyResult().Value;
      var cnt = 0;
      for (var i = 0; i < v.length; i++)
        if (i == v[i])
          cnt++;
      return { ms: v.length, s: cnt, needsHumanEval: false };
    };
    pairing.prototype.acceptData = function (done, userData) {
      _.each(this.items, function (it) {
        it.ok(done);
        it.acceptData(done, { Value: userData.Value[it.selfIdx].toString() });
      });
    };
    pairing.prototype.provideData = function (data) {
      if (!this.status())
        return;
      data.Value = _.map(this.items, function (it) {
        return parseInt(it.user());
      });
    };
    pairing.prototype.select_left = function (it) {
      if (!this.status())
        return;
      this.leftSelected(true);
      _.each(this.items, function (it) {
        return it.leftSelected(false);
      });
      it.leftSelected(true);
    };
    pairing.prototype.select_right = function (it) {
      if (!this.status())
        return;
      var leftSel = _.find(this.items, function (it) {
        return it.leftSelected();
      });
      var itu = parseInt(it.user());
      var rightSel = _.find(this.items, function (it) {
        return it.selfIdx == itu;
      });

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
      _.each(this.items, function (it) {
        if (it.ok())
          return;
        notOks++;
        notOk = it;
      });
      if (notOks == 1)
        notOk.ok(true);

      //globalni leftSelected stav
      this.leftSelected(false);
      _.each(this.items, function (it) {
        return it.leftSelected(false);
      });
    };
    return pairing;
  })(Course.control);
  Course.pairing = pairing;

  var pairingItem = (function (_super) {
    __extends(pairingItem, _super);
    function pairingItem(selfIdx, data, owner, myPage) {
      var _this = this;
      _super.call(this, data, myPage);
      this.selfIdx = selfIdx;
      this.owner = owner;
      this.userText = ko.observable('');
      this.leftSelected = ko.observable(false);
      this.ok = ko.observable(false);
      this.user.subscribe(function (val) {
        return _this.userText(_this.owner.items[parseInt(val)].MyItData().right);
      });
      this.teacher = data.right;
      this.corrects = [selfIdx.toString()];
    }
    pairingItem.prototype.MyItData = function () {
      return this.data;
    };
    pairingItem.prototype.acceptData = function (done, userData) {
      this.result = userData;
      _super.prototype.acceptData.call(this, done, userData);
    };

    pairingItem.prototype.select_left = function () {
      this.owner.select_left(this);
    };
    pairingItem.prototype.select_right = function () {
      this.owner.select_right(this);
    };
    return pairingItem;
  })(Course.edit);
  Course.pairingItem = pairingItem;
})(Course || (Course = {}));

var __extends = this.__extends || function (d, b) {
  for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
  function __() { this.constructor = d; }
  __.prototype = b.prototype;
  d.prototype = new __();
};
var Course;
(function (Course) {
  var singleChoiceLow = (function (_super) {
    __extends(singleChoiceLow, _super);
    function singleChoiceLow(staticData, myPage) {
      var _this = this;
      _super.call(this, staticData, myPage);
      if (staticData.correctValue == undefined)
        staticData.correctValue = 0;
      var cnt = 0;

      //###jsonML
      if (staticData.tg == CourseModel.twordSelection)
        this.items = _.map(staticData.words.split('|'), function (w) {
          return new choiceItem({ title: "<span class='c-nowrap'>" + w.replace(/^#/, '') + "</span>", tg: CourseModel.ttext }, _this, cnt++);
        });
      else
        this.items = _.map(staticData.Items, function (tg) {
          return new choiceItem(tg, _this, cnt++);
        });
    }
    singleChoiceLow.prototype.MyResult = function () {
      return this.result;
    };
    singleChoiceLow.prototype.MyData = function () {
      return this.data;
    };

    singleChoiceLow.prototype.createResult = function (forceEval) {
      if (typeof forceEval === "undefined") { forceEval = false; }
      return { Value: forceEval ? this.MyData().correctValue : undefined };
    };
    singleChoiceLow.prototype.provideData = function (data) {
      var actItem = _.find(this.items, function (it) {
        return it.selected();
      });
      data.Value = actItem == null ? undefined : actItem.selfIdx;
    };
    singleChoiceLow.prototype.acceptData = function (done, userData) {
      var corr = this.MyData().correctValue;
      _.each(this.items, function (it) {
        return it.acceptData(done, corr, userData.Value);
      });
    };
    singleChoiceLow.prototype.isCorrect = function () {
      var actItem = _.find(this.items, function (it) {
        return it.selected();
      });
      return actItem != null && actItem.selfIdx == this.MyData().correctValue;
    };

    singleChoiceLow.prototype.click_item = function (it) {
      if (!this.status())
        return;
      _.each(this.items, function (it) {
        return it.selected(false);
      });
      it.selected(true);
    };
    return singleChoiceLow;
  })(Course.control);
  Course.singleChoiceLow = singleChoiceLow;

  var singleChoice = (function (_super) {
    __extends(singleChoice, _super);
    function singleChoice() {
      _super.apply(this, arguments);
    }
    return singleChoice;
  })(singleChoiceLow);
  Course.singleChoice = singleChoice;

  var wordSelection = (function (_super) {
    __extends(wordSelection, _super);
    function wordSelection() {
      _super.apply(this, arguments);
    }
    return wordSelection;
  })(singleChoiceLow);
  Course.wordSelection = wordSelection;

  var choiceItem = (function () {
    function choiceItem(content, owner, selfIdx) {
      this.content = content;
      this.owner = owner;
      this.selfIdx = selfIdx;
      this.selected = ko.observable(false);
      this.myCss = ko.observable('');
    }
    choiceItem.prototype.acceptData = function (isEval, correctIdx, userSelectedIdx) {
      if (userSelectedIdx == undefined)
        userSelectedIdx = -1;
      if (!isEval) {
        this.selected(userSelectedIdx == this.selfIdx);
        this.myCss('');
        return;
      }
      this.selected(this.selfIdx == correctIdx);
      if (correctIdx == userSelectedIdx)
        this.myCss(this.selfIdx == correctIdx ? "black" : "no");
      else
        this.myCss(this.selfIdx == correctIdx ? "red" : (this.selfIdx == userSelectedIdx ? "strike" : "no"));
    };

    choiceItem.prototype.click = function () {
      this.owner.click_item(this);
    };
    return choiceItem;
  })();
  Course.choiceItem = choiceItem;
})(Course || (Course = {}));

var __extends = this.__extends || function (d, b) {
  for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
  function __() { this.constructor = d; }
  __.prototype = b.prototype;
  d.prototype = new __();
};
var Course;
(function (Course) {
  //sound informace pro jednu stranku
  var pageSound = (function () {
    function pageSound(myPage) {
      var _this = this;
      this.inOnPlay = false;
      this.inOnPlayTimer = 0;
      //SndActive
      this.allActivable = [];
      //vsechny media kontrolky:
      this.mediaCtrls = (myPage.filter(function (c) {
        var t = CourseModel.types[c.data.tg];
        return t.anc ? t.anc.name == CourseModel.tmediaTag : false;
      }));

      //Pro kontrolky s Cut file: prenes data z cutFile do kontrolky
      _.each(this.mediaCtrls, function (root) {
        if (!root.cutFile)
          return;
        root.myRoot = root;
        var isRepl = root.cutFile.tg == CourseModel.tmediaDialog;
        var repls = [];
        root.sents = [];

        //filter
        var mt = root;
        while (mt) {
          mt.MyData.isPassive = root.MyData.isPassive;
          var idxs = _.flatten(parseSequence(mt.MyData.sequence, root.cutFile.Items.length - 1), true);
          mt.MyData.Items = _.map(idxs, function (idx) {
            var res = root.cutFile.Items[idx];
            if (!res) {
              debugger;
              throw "Cannot find sentence of idx " + idx.toString();
            }
            return res;
          });
          _.each(mt.MyData.Items, function (t) {
            return Course.registerControls(t, myPage, mt, false);
          });
          if (isRepl) {
            _.each(mt.childs, function (r) {
              repls.push(r);
              r.myRoot = root;
              _.each(r.childs, function (s) {
                root.sents.push(s);
                s.myRoot = root;
                s.myRepl = r;
              });
            });
          } else
            _.each(mt.childs, function (s) {
              root.sents.push(s);
              s.myRoot = root;
            });
          mt = mt.next;
        }

        //init dialog
        if (isRepl)
          initDlg(repls);

        for (var i = 0; i < root.sents.length; i++)
          root.sents[i].idx = i;

        //skupiny souvisle prehravanych sekvenci
        var lastContinueIdx = 999999;
        var actGrp = null;
        _.each(root.sents, function (s) {
          if (s.MyData.idx != lastContinueIdx + 1) {
            var grp = { sents: [s], begPos: s.MyData.begPos, endPos: s.MyData.endPos, next: null };
            if (!root.sentGrps)
              root.sentGrps = grp;
            else
              actGrp.next = grp;
            Logger.trace_lmsnd('media.ts: group: begPos=' + grp.begPos.toString() + ', endPos=' + grp.endPos.toString());
            actGrp = grp;
          } else {
            actGrp.sents.push(s);
            actGrp.endPos = s.MyData.endPos;
          }
          lastContinueIdx = s.MyData.idx;
        });

        //zaregistruj activable
        if (!root.MyData.isPassive) {
          _this.allActivable = _this.allActivable.concat(root.sents);
          _this.allActivable = _this.allActivable.concat(repls);
          _this.allActivable.push(root);
        }
      });

      //use
      _.each(this.mediaCtrls, function (mt) {
        if (!mt.MyData.use)
          return;
        _this.allActivable.push(mt);
        var root = mt.myRoot = (myPage.find(mt.MyData.use));
        if (!root.usedBy)
          root.usedBy = [];
        root.usedBy.push(mt);
        mt.MyData.isPassive = root.MyData.isPassive;

        //mt.sents = root.sents;
        mt.mediaUrl = root.mediaUrl;
      });

      //stop play
      $('body').click(function () {
        if (_this.inOnPlay)
          return;
        _this.inOnPlayTimer = setTimeout(function () {
          _this.inOnPlayTimer = 0;
          Logger.trace_lmsnd('media.ts: body.click stop');
          SndLow.Stop();
        }, 1);
      });
    }
    pageSound.prototype.htmlClearing = function () {
      Logger.trace_lmsnd('media.ts: htmlClearing');
      $('body').unbind('click');
      _.each(this.mediaCtrls, function (root) {
        return root.htmlClearing();
      });
    };

    //stop play
    pageSound.prototype.onPlay = function () {
      if (this.inOnPlayTimer != 0) {
        clearTimeout(this.inOnPlayTimer);
        this.inOnPlayTimer = 0;
      }
      this.inOnPlay = true;
      var self = this;
      setTimeout(function () {
        self.inOnPlay = false;
      }, 10);
    };

    pageSound.prototype.activate = function (sent) {
      if (!sent) {
        _.each(this.allActivable, function (act) {
          return act.active(false);
        });
        return;
      }
      var keep = [sent, sent.myRepl, sent.myRoot];
      if (sent.myRoot.usedBy)
        keep = keep.concat(sent.myRoot.usedBy);
      _.each(this.allActivable, function (act) {
        return act.active(_.indexOf(keep, act) >= 0);
      });
    };
    return pageSound;
  })();
  Course.pageSound = pageSound;

  //predchudce vizualnich media kontrolek (bar, sound text, dialog apod.)
  var mediaTag = (function (_super) {
    __extends(mediaTag, _super);
    function mediaTag(sd, myPage) {
      var _this = this;
      _super.call(this, sd, myPage);
      this.withoutCut = false;
      this.active = ko.observable(false);
      this.playProgress = ko.observable(0);
      this.actSent = ko.observable(null);
      this.MyData = sd;
      if (isCutMediaTag(sd)) {
        sd.url = this.myPage.MyData().url + '.mp3';
        sd.Items = [];
      } else if (sd.url && sd.Items) {
        //sentsToReplace nebo flatRepls: vety k nahrazeni nebo definice replik pro Dialog z Flat nastrihani: dej do sentsToReplace nebo flatRepls a vyhod je z Items(aby se na ne neuplatnilo registerControls)
        _.each(sd.Items, function (t) {
          if (t.tg == CourseModel.tsndSent) {
            var s = t;
            if (!s.replacePtr)
              return;
            if (!_this.sentsToReplace)
              _this.sentsToReplace = {};
            _this.sentsToReplace[s.replacePtr] = s;
          } else if (t.tg == CourseModel.tsndReplica) {
            var r = t;
            if (!r.sequence)
              return;
            if (!_this.flatRepls)
              _this.flatRepls = [];
            _this.flatRepls.push(r);
          }
        });
        sd.Items = [];
      }

      var self = this;
      self.active.subscribe(function (val) {
        if (!val || !self.usedBy)
          return;
        _.each(self.usedBy, function (mt) {
          return mt.active(true);
        });
      });
    }
    mediaTag.prototype.getPlayer = function () {
      return this.myRoot.player;
    };

    mediaTag.prototype.htmlClearing = function () {
      if (!this.player)
        return;
      SndLow.htmlClearing(this.player.id);
    };

    mediaTag.prototype.myGrp = function (sent) {
      var res = this.myRoot.sentGrps;
      while (res) {
        if (_.indexOf(res.sents, sent) >= 0)
          return res;
        res = res.next;
      }
      debugger;
      throw 'myGrp';
    };

    mediaTag.prototype.grpFromPos = function (msec) {
      if (!this.cutFile) {
        debugger;
        throw 'media.ts,sentIdxFromPos: !this.cutFile';
      }
      if (!msec)
        return null;
      var g = this.myRoot.sentGrps;
      while (g != null) {
        if (msec >= g.begPos && msec <= g.endPos)
          break;
        g = g.next;
      }
      return g;
    };

    mediaTag.prototype.sentFromPos = function (sntGrp, msec) {
      return _.find(sntGrp.sents, function (s) {
        return msec < s.MyData.endPos;
      });
    };

    //hraj od vety daneho indexu
    mediaTag.prototype.play = function (idx) {
      var th = this.myRoot;
      if (th.MyData.isPassive)
        return;
      if (!th.cutFile) {
        debugger;
        throw 'cannot play file without tempSndObj';
      }
      var sents = th.myRoot.sents;
      th.myPage.sound.onPlay();
      Logger.trace_lmsnd('media.ts: mediaTag play, sent idx=' + idx.toString());
      var mySent = sents[idx];
      th.playGrp(th.myGrp(mySent), mySent);
    };

    //hraj souvisly usek jedne grupy, pocinaje grpPos
    mediaTag.prototype.playGrpPos = function (grp, grpPos) {
      var th = this.myRoot;

      //th.actSentGrp = grp;
      th.player.openPlay(th.getFileUrl().toLowerCase(), grpPos, grp.endPos, SndLow.guiBlocker).progress(function (msec) {
        th.doProgress(msec, grp, th.sentFromPos(grp, msec), false);
      }).done(function () {
        return th.doProgress(-1, grp, null, true);
      }).always(function () {
        SndLow.guiBlocker(false);
        th.myPage.sound.activate(null);
      });
    };

    //hraj souvisly usek jedne grupy, pocinaje grpSent
    mediaTag.prototype.playGrp = function (grp, grpSent) {
      if (typeof grpSent === "undefined") { grpSent = null; }
      var th = this;
      th.playGrpPos(grp, grpSent ? grpSent.MyData.begPos : grp.sents[0].MyData.begPos);
    };

    mediaTag.prototype.doProgress = function (msec, grp, actSent, isDone) {
      var th = this.myRoot;
      th.playProgress(msec);
      if (!isDone) {
        if (actSent)
          actSent.active(true);
        th.actSent(actSent);
      } else {
        if (grp.next)
          setTimeout(function () {
            return th.playGrp(grp.next);
          }, 1);
      }
    };

    mediaTag.prototype.getFileUrl = function () {
      return Pager.basicDir + this.mediaUrl;
    };

    mediaTag.prototype.initProc = function (phase, getTypeOnly, completed) {
      var _this = this;
      switch (phase) {
        case 0 /* beforeRender */:
          if (!getTypeOnly) {
            //pripoj cutFile ke kontrolce
            if (this.MyData.continueOf) {
              (this.myPage.find(this.MyData.continueOf)).next = this;
              completed();
              return;
            }
            if (this.MyData.use) {
              completed();
              return;
            }
            if (this.MyData.url) {
              this.mediaUrl = Utils.combineUrl(this.myPage.MyData().url, this.MyData.url);
              var lastIdx = this.mediaUrl.lastIndexOf('.');
              if (lastIdx >= 0) {
                this.withoutCut = true;
                this.MyData.Items = [{ tg: CourseModel.tsndSent, Text: 'All sound file', begPos: 0, endPos: 9999999, idx: 0 }];
                this.cutFile = { Items: this.MyData.Items };
                completed();
                return;
              }

              //naladuj JSON s nastrihanim
              var cutUrl = lastIdx < 0 ? this.mediaUrl : this.mediaUrl.substr(0, this.mediaUrl.lastIndexOf('.'));
              CourseMeta.load(cutUrl, function (pgJsonML) {
                var pg = CourseMeta.extractEx(pgJsonML);

                if (!pg || !pg.Items || pg.Items.length != 1) {
                  debugger;
                  throw 'wrong media URL sound cut content:' + cutUrl;
                }
                var cutFile = (pg.Items[0]);

                adjustMediaUrl(_this, cutFile.url);

                _this.cutFile = cutFile;
                var isRepl = cutFile.tg == CourseModel.tmediaDialog;

                //ocislovani vet a a nahrazeni
                var cnt = 0;
                var finishSent = function (s) {
                  //index vety kvuli informaci o naslednosti vet a kvuli ev. nahrazeni vety kontrolkami
                  var idx = cnt++;
                  s.idx = idx;
                  if (!_this.sentsToReplace)
                    return;
                  var news = _this.sentsToReplace[idx.toString()];
                  if (!news)
                    return;
                  s.Items = news.Items;
                };
                if (isRepl)
                  _.each(cutFile.Items, function (r) {
                    return _.each(r.Items, finishSent);
                  });
                else
                  _.each(cutFile.Items, finishSent);

                //z flat sndObj udelej dialog dle flatRepls
                if (_this.flatRepls && !isRepl) {
                  var dlg = { Type: CourseModel.tmediaDialog };
                  _.each(_this.flatRepls, function (repl) {
                    var idxs = _.flatten(parseSequence(repl.sequence, cutFile.Items.length - 1), true);
                    repl.Items = _.map(idxs, function (idx) {
                      return cutFile.Items[idx];
                    });
                  });
                  dlg.Items = _this.flatRepls;
                  _this.flatRepls = null;
                  _this.cutFile = dlg;
                }
                completed();
              });
            } else {
              //(pasivni) data jsou primo v kontrolce
              if (!this.MyData.url && this.MyData.Items && this.MyData.Items.length > 0) {
                this.MyData.isPassive = true;
                var isRepl = this.MyData.tg == CourseModel.tmediaDialog;
                if (isRepl)
                  initDlg((this.childs));
              }
              completed();
            }
          }
          return 2 /* async */;
        case 2 /* afterRender2 */:
          if (!getTypeOnly) {
            //pouze open file, bez hrani
            if (!this.player)
              SndLow.createDriver(false, this.MyData.id, null, 'cls-audio-unvisible', null, function (dr) {
                _this.player = dr;
                _this.player.openPlay(_this.getFileUrl().toLowerCase(), -1, -1).done(function () {
                  return completed();
                });
              });
            else
              this.player.openPlay(this.getFileUrl().toLowerCase(), -1, -1).done(function () {
                return completed();
              });
          }
          return !this.MyData.isPassive && this.cutFile ? 2 /* async */ : 0 /* no */;
      }
      return _super.prototype.initProc.call(this, phase, getTypeOnly, completed);
    };
    return mediaTag;
  })(Course.control);
  Course.mediaTag = mediaTag;

  function isCutMediaTag(tag) {
    return tag.url && tag.url.indexOf('.self.') == 0;
  }
  function isVideo(mediaCtrl) {
    var extIdx = mediaCtrl.mediaUrl.lastIndexOf('.');
    var ext = extIdx > 0 ? mediaCtrl.mediaUrl.substring(extIdx) : null;
    return ext == 'mp4' || ext == 'webm';
  }

  function adjustMediaUrl(mediaCtrl, urlFromCutFile) {
    if (_.isEmpty(urlFromCutFile))
      return;
    urlFromCutFile = urlFromCutFile.replace('.self.', '');

    if (urlFromCutFile == 'video.smart') {
      if ((mediaCtrl.MyData.width && parseInt(mediaCtrl.MyData.width) <= 960) || $(document).width() <= 960)
        mediaCtrl.mediaUrl += '.small';
    }
    if (urlFromCutFile.indexOf('video.') == 0) {
      switch (SndLow.selectDriver()) {
        case 1 /* SL */:
          mediaCtrl.mediaUrl += '.mp4';
          break;
        case 2 /* HTML5 */:
          if (SndLow.html5_CanPlay(0 /* video_mp4 */))
            mediaCtrl.mediaUrl += '.mp4';
          else if (SndLow.html5_CanPlay(1 /* video_webm */))
            mediaCtrl.mediaUrl += '.webm';
          else {
            debugger;
            throw 'Cannot play nor mp4 or webm';
          }
          break;
        default: {
          debugger;
          throw 'missing driver';
        }
      }
    } else
      mediaCtrl.mediaUrl += '.mp3';
  }

  var sndReplica = (function (_super) {
    __extends(sndReplica, _super);
    function sndReplica(staticData, myPage) {
      _super.call(this, staticData, myPage);
      this.active = ko.observable(false);
      this.MyData = staticData;
    }
    sndReplica.prototype.css = function () {
      return CourseModel.IconIds[this.dlgIcon] + " " + (this.dlgLeft ? "dlg-left" : "dlg-right");
    };
    return sndReplica;
  })(Course.control);
  Course.sndReplica = sndReplica;

  var sndSent = (function (_super) {
    __extends(sndSent, _super);
    function sndSent(staticData, myPage) {
      var _this = this;
      _super.call(this, staticData, myPage);
      this.active = ko.observable(false);
      this.MyData = staticData;
      var self = this;
      this.active.subscribe(function (val) {
        if (!_this.myRoot)
          return;
        if (!val)
          return;

        //Logger.trace_lmsnd('media.ts: sndSent.active, sent ' + this.myRoot.MyData.Url + '(' + this.idx.toString() + ',' + this.MyData.Idx.toString() + ')');
        _.each(self.myRoot.myPage.sound.allActivable, function (act) {
          if (act == self || act == self.myRepl || act == self.myRoot || _.indexOf(self.myRoot.usedBy, act) >= 0)
            return;
          act.active(false);
        });
        if (self.myRepl != null)
          self.myRepl.active(true);
        self.myRoot.active(true);
      });
    }
    sndSent.prototype.play = function () {
      //if (!this.myRoot || (!this.myPage.status() && (this.MyData.Items.length != 1 || this.MyData.Items[0].Type != CourseModel.tText))) return;
      if (!this.myRoot)
        return;
      this.myRoot.play(this.idx);
    };

    sndSent.prototype.title = function () {
      var dt = this.MyData;
      if (!dt || !dt.Items || dt.Items.length != 1)
        return '';
      var t = dt.Items[0];

      //###jsonML
      //return t.Type != CourseModel.tText ? '' : (<CourseModel.Text>t).Title;
      return _.isString(t) ? t : '';
    };
    return sndSent;
  })(Course.control);
  Course.sndSent = sndSent;

  //k sekvenci vet ze stringu vrati seznam intervalu, definujicich posloupnost prehravani
  function parseSequence(sents, max) {
    if (!sents)
      return [_.range(0, max + 1)];
    var parts = _.compact(sents.split(','));
    if (parts.length == 0)
      return [_.range(0, max + 1)];
    return _.map(parts, function (p) {
      var be = p.split('-');
      var beg = be[0] ? parseInt(be[0]) : 0;
      var end = be.length > 1 ? (be[1] ? parseInt(be[1]) : max) : beg;
      return _.range(beg, end + 1);
    });
  }

  function initDlg(blocks) {
    //zaregistruj pouzite ikony
    var usedIcons = [];
    for (var i = 1; i < 7; i++)
      usedIcons[i] = false;
    _.each(blocks, function (b) {
      if (!b.dlgIcon)
        return;
      usedIcons[b.dlgIcon] = true;
    });

    //seber jmena bez ikon
    var nameNoIcon = [];
    _.each(blocks, function (b) {
      if (b.dlgIcon)
        return;
      nameNoIcon[b.MyData.name] = 0 /* no */;
    });

    for (var n in nameNoIcon) {
      var idx = _.indexOf(usedIcons, false);
      if (idx < 0) {
        debugger;
        throw "too few icons";
      }
      nameNoIcon[n] = idx;
      usedIcons[idx] = true;
    }

    //dosad prirazene ikony do block
    _.each(blocks, function (b) {
      var ic = nameNoIcon[b.MyData.name];
      if (ic)
        b.dlgIcon = ic;
    });

    //vypocti left x right pro umisteni repliky dialogu
    var iconLeftRight = [];
    var lastIcon = true;
    _.each(blocks, function (b) {
      var lr = iconLeftRight[b.dlgIcon];
      if (lr != undefined)
        b.dlgLeft = lr;
      else {
        b.dlgLeft = iconLeftRight[b.dlgIcon] = lastIcon;
        lastIcon = !lastIcon;
      }
    });
  }

  var mediaText = (function (_super) {
    __extends(mediaText, _super);
    function mediaText() {
      _super.apply(this, arguments);
    }
    return mediaText;
  })(mediaTag);
  Course.mediaText = mediaText;
  var mediaDialog = (function (_super) {
    __extends(mediaDialog, _super);
    function mediaDialog() {
      _super.apply(this, arguments);
    }
    return mediaDialog;
  })(mediaTag);
  Course.mediaDialog = mediaDialog;
  var mediaBigMark = (function (_super) {
    __extends(mediaBigMark, _super);
    function mediaBigMark() {
      _super.apply(this, arguments);
    }
    return mediaBigMark;
  })(mediaTag);
  Course.mediaBigMark = mediaBigMark;

  var mediaTitle = (function (_super) {
    __extends(mediaTitle, _super);
    function mediaTitle() {
      _super.apply(this, arguments);
    }
    return mediaTitle;
  })(mediaTag);
  Course.mediaTitle = mediaTitle;

  var mediaVideo = (function (_super) {
    __extends(mediaVideo, _super);
    function mediaVideo() {
      _super.apply(this, arguments);
    }
    mediaVideo.prototype.initProc = function (phase, getTypeOnly, completed) {
      var _this = this;
      switch (phase) {
        case 1 /* afterRender */:
          if (!getTypeOnly) {
            //this.myRoot.player = new Player(this.data.id, true, '#' + this.data.id, completed);
            SndLow.createDriver(true, this.data.id, '#' + this.data.id, null, null, function (dr) {
              _this.myRoot.player = dr;
              completed();
            });
          }
          return 2 /* async */;
      }
      return _super.prototype.initProc.call(this, phase, getTypeOnly, completed);
    };
    return mediaVideo;
  })(mediaTag);
  Course.mediaVideo = mediaVideo;

  var mediaBar = (function (_super) {
    __extends(mediaBar, _super);
    function mediaBar() {
      _super.apply(this, arguments);
    }
    return mediaBar;
  })(mediaTag);
  Course.mediaBar = mediaBar;

  //ovladaci panel (videa apod.)
  var mediaPlayer = (function (_super) {
    __extends(mediaPlayer, _super);
    function mediaPlayer(sd, myPage) {
      _super.call(this, sd, myPage);
      //cpv = new schoolCpv.model(schools.tMediaCpv, null);
      this.loading = ko.observable(true);
      this.playing = ko.observable(false);
      this.muted = ko.observable(false);
      this.actor = ko.observable('');
      this.speech = ko.observable('');
      this.textVisible = ko.observable(true);
      var th = this;
      th.playStop = function () {
        var driver = th.myRoot.getPlayer();
        if (!driver.handler.paused) {
          driver.stop();
        } else
          th.playFromSlider();
      };

      //self.changeMuted = () => { self.muted(!self.muted()); self.player.setVolume(self.muted() ? 0.0 : 1.0); };
      th.prevSent = function () {
        return th.prevNext(true, true);
      };

      //self.prevActor = () => self.prevNext(false, true);
      th.nextSent = function () {
        return th.prevNext(true, false);
      };

      //self.nextActor = () => self.prevNext(false, false);
      //th.cpv.needInstall(false);
      //self.cpv.onHide = () => self.cpvVisible(false);
      //th.cpv.playStop = th.playStop;
      //self.sent_click = (it: modSent, id: string) => self.playFrom(it.sent.BegPos);
      //self.showCpv = () => {
      //  var actSent = this.sents[this.actSentIdx];
      //  if (actSent == null) return;
      //  self.cpv.show(null, actSent.MyData.Items.toString(), actSent.MyData.BegPos, actSent.MyData.EndPos);
      //  self.cpvVisible(true);
      //};
      th.toogleText = function () {
        return th.textVisible(!th.textVisible());
      };
    }
    mediaPlayer.prototype.initProc = function (phase, getTypeOnly, completed) {
      var _this = this;
      switch (phase) {
        case 1 /* afterRender */:
          if (!getTypeOnly) {
            var self = this;
            self.slider = $('.slider');
            var root = self.myRoot;

            //http://api.jqueryui.com/slider
            self.slider.slider({
              start: function (event, ui) {
                return root.getPlayer().stop();
              },
              "max": 100000
            });
            root.playProgress.subscribe(function (msec) {
              if (msec < 0) {
                self.playing(false);
                return;
              }
              self.playing(true);
              self.sliderFromMsec(msec);
            });
            root.actSent.subscribe(function (sent) {
              if (!sent)
                return;
              _this.speech(sent.title());
              _this.actor(!sent.myRepl ? '' : sent.myRepl.MyData.name + ': ');
            });
            self.sliderStart = root.sentGrps.begPos;
            completed();
          }
          return 2 /* async */;
      }
      return _super.prototype.initProc.call(this, phase, getTypeOnly, completed);
    };

    mediaPlayer.prototype.playFromSlider = function () {
      var self = this;
      self.playGrpPos(self.myRoot.sentGrps, self.msecFromSlider());
    };
    mediaPlayer.prototype.sliderFromMsec = function (msec) {
      this.slider.slider("option", "value", 100000 * (msec - this.sliderStart) / this.sliderLen());
    };
    mediaPlayer.prototype.msecFromSlider = function () {
      return this.slider.slider("option", "value") * this.sliderLen() / 100000 + this.sliderStart;
    };

    mediaPlayer.prototype.sliderLen = function () {
      var sents = this.myRoot.sents;
      if (this.myRoot.withoutCut)
        this.myRoot.sentGrps.endPos = sents[0].MyData.endPos = this.getPlayer().handler.duration * 1000;
      return sents[sents.length - 1].MyData.endPos - this.sliderStart;
    };

    //sent_click;
    //dialogTemplate = ko.observable<string>('Dummy');
    mediaPlayer.prototype.prevNext = function (isSent, isPrev) {
      var root = this.myRoot;
      var isPlaying = !isPrev && this.playing();
      var sents = this.myRoot.sents;
      var pos = this.msecFromSlider();
      var actSent = root.sentFromPos(root.sentGrps, pos + 200);
      var actSentIdx = actSent ? actSent.idx : (isPrev ? sents.length - 1 : 0);
      var newSent;
      if (isPrev) {
        if (actSentIdx == 0)
          return;
        newSent = sents[actSentIdx - 1];
      } else {
        if (actSentIdx >= sents.length - 1)
          return;
        newSent = sents[actSentIdx + 1];
      }
      root.getPlayer().stop();
      this.sliderFromMsec(newSent.MyData.begPos);
      if (isPlaying)
        this.playFromSlider();
      else
        root.actSent(newSent);
    };
    return mediaPlayer;
  })(mediaTag);
  Course.mediaPlayer = mediaPlayer;
  var mediaReplica = (function (_super) {
    __extends(mediaReplica, _super);
    function mediaReplica() {
      _super.apply(this, arguments);
    }
    return mediaReplica;
  })(mediaTag);
  Course.mediaReplica = mediaReplica;
})(Course || (Course = {}));

var __extends = this.__extends || function (d, b) {
  for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
  function __() { this.constructor = d; }
  __.prototype = b.prototype;
  d.prototype = new __();
};
var Course;
(function (Course) {
  var checkItem = (function (_super) {
    __extends(checkItem, _super);
    function checkItem(staticData, myPage) {
      var _this = this;
      _super.call(this, staticData, myPage);
      this.yes = ko.observable(false);
      this.no = ko.observable(false);
      this.yesEval = ko.observable('');
      this.noEval = ko.observable('');
      var self = this;
      this.yesClick = function (d, e) {
        _this.clickLow(true);
        e.stopImmediatePropagation();
      };
      this.noClick = function (d, e) {
        _this.clickLow(false);
        e.stopImmediatePropagation();
      };
      this.click = function (d, e) {
        _this.clickLow();
        e.stopImmediatePropagation();
      };
      this.clickLow = function (isYes) {
        if (!self.yes() && !self.no()) {
          self.yes(isYes == true);
          self.no(isYes != true);
        } else {
          self.yes(!self.yes());
          self.no(!self.no());
        }
      };
      var txt;
      switch (staticData.textId) {
        case 1 /* YesNo */:
          txt = CSLocalize('88d6dd9f77994a68a8035f5809c24703', 'Yes|No');
          break;
        case 2 /* TrueFalse */:
          txt = CSLocalize('7f51a49e0ad14a848362eb7282d62116', 'True|False');
          break;
        default:
          throw "not implemented";
      }
      this.textType = CourseModel.CheckItemTexts[staticData.textId].toLowerCase();
      var txts = txt.split('|');
      this.trueText = txts[0];
      this.falseText = txts[1];
    }
    checkItem.prototype.MyResult = function () {
      return this.result;
    };
    checkItem.prototype.MyData = function () {
      return this.data;
    };

    checkItem.prototype.createResult = function (forceEval) {
      if (typeof forceEval === "undefined") { forceEval = false; }
      return { Value: forceEval ? (this.MyData().correctValue ? true : false) : undefined };
    };
    checkItem.prototype.provideData = function (data) {
      if (this.yes())
        data.Value = true;
      else if (this.no())
        data.Value = false;
      else
        data.Value = null;
    };
    checkItem.prototype.acceptData = function (done, userData) {
      if (done) {
        var corrv = this.MyData().correctValue ? true : false;
        this.yesEval(this.evalStyle(true, userData.Value == true, corrv));
        this.noEval(this.evalStyle(false, userData.Value == false, corrv));
        this.yes(corrv);
        this.no(!corrv);
      } else {
        //var yesTrue = userData.Value === true;
        if (userData.Value != undefined) {
          this.yes(userData.Value);
          this.no(!userData.Value);
        }
      }
    };
    checkItem.prototype.isCorrect = function () {
      var v = this.MyResult().Value;
      var corrv = this.MyData().correctValue ? true : false;
      return v != null && v == corrv;
    };

    checkItem.prototype.evalStyle = function (isYes, checked, correct) {
      if (isYes) {
        if (checked)
          return correct ? "black" : "strike";
        else
          return correct ? "red" : "no";
      } else {
        if (checked)
          return correct ? "strike" : "black";
        else
          return correct ? "no" : "red";
      }
    };
    return checkItem;
  })(Course.control);
  Course.checkItem = checkItem;
})(Course || (Course = {}));

var __extends = this.__extends || function (d, b) {
  for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
  function __() { this.constructor = d; }
  __.prototype = b.prototype;
  d.prototype = new __();
};
/// <reference path="../JsLib/jsd/knockout.d.ts" />
/// <reference path="../JsLib/jsd/underscore.d.ts" />
/// <reference path="../JsLib/jsd/jsrender.d.ts" />
/// <reference path="../JsLib/js/utils.ts" />
/// <reference path="../JsLib/js/GenLMComLib.ts" />
/// <reference path="GenCourseModel.ts" />
/// <reference path="Course.ts" />
/// <reference path="GapFill.ts" />
var Course;
(function (Course) {
  var possibilities = (function (_super) {
    __extends(possibilities, _super);
    function possibilities(staticData, myPage) {
      _super.call(this, staticData, myPage);
      this.words = staticData.words.split("|");
      Utils.randomizeArray(this.words);
    }
    possibilities.prototype.initProc = function (phase, getTypeOnly, completed) {
      var _this = this;
      switch (phase) {
        case 0 /* beforeRender */:
          if (!getTypeOnly) {
            this.gapFills = getGroupMembers(this.myPage, CourseModel.tgapFill, this.data.id);
            _.each(this.gapFills, function (gf) {
              gf.source = _this;
            });
          }
          return 1 /* sync */;
        case 2 /* afterRender2 */:
          if (!getTypeOnly) {
            var controls = this.gapFills;
            if (this.gapFills.length <= 0)
              return;
            var styleHolder = Course.idToElement(controls[0].data.id).find('.teacher').first();
            var strings = [];
            _.each(controls, function (t) {
              strings.push(t.MyData().initValue);
              _.each(t.corrects, function (s) {
                return strings.push(s);
              });
            });
            var maxWidth = Gui2.maxTextWidth(strings, styleHolder);
            _.each(controls, function (t) {
              return Course.idToElement(t.data.id).width(maxWidth + 10);
            });
          }
          return 1 /* sync */;
      }
      return _super.prototype.initProc.call(this, phase, getTypeOnly, completed);
    };

    possibilities.prototype.MyData = function () {
      return this.data;
    };
    return possibilities;
  })(Course.control);
  Course.possibilities = possibilities;

  function getGroupMembers(myPage, typeId, groupId) {
    var controls = [];
    _.each(myPage.items, function (ctrl) {
      var gp = (ctrl.data);
      if (gp.tg != typeId || (gp.groupId && gp.groupId != groupId) || ((!gp.groupId) != (groupId.charAt(0) == '_')))
        return;
      controls.push(ctrl);
    });
    return controls;
  }

  var dragSource = (function (_super) {
    __extends(dragSource, _super);
    function dragSource(staticData, myPage) {
      _super.call(this, staticData, myPage);
    }
    dragSource.prototype.initProc = function (phase, getTypeOnly, completed) {
      var _this = this;
      switch (phase) {
        case 0 /* beforeRender */:
          if (!getTypeOnly) {
            var dragTargets = getGroupMembers(this.myPage, CourseModel.tdragTarget, this.data.id);
            this.words = _.map(dragTargets, function (dt) {
              dt.source = _this; //napln mu source
              return new dragWord(dt);
            });
            Utils.randomizeArray(this.words);
          }
          return 1 /* sync */;
        case 2 /* afterRender2 */:
          if (!getTypeOnly) {
            var targets = _.map(this.words, function (w) {
              return w.target.MyData();
            });
            var targetElements = _.map(targets, function (t) {
              return Course.idToElement(t.id);
            });
            var styleHolder = targetElements[0];
            var maxWidth = Gui2.maxTextWidth(_.map(targets, function (t) {
              return t.correctValue;
            }), styleHolder);
            _.each(targetElements, function (t) {
              return t.width(maxWidth + 25);
            });
          }
          return 1 /* sync */;
      }
      return _super.prototype.initProc.call(this, phase, getTypeOnly, completed);
    };
    dragSource.prototype.MyData = function () {
      return this.data;
    };

    //finishLoading(completed: () => void): void { //dokonceni kontrolky
    //  var dragTargets = getGroupMembers(this.myPage, CourseModel.tDragTarget, this.data.id);
    //  this.words = _.map<control, dragWord>(dragTargets, (dt: dragTarget) => {
    //    dt.source = this; //napln mu source
    //    return new dragWord(dt); //vytvor ModelView pro word
    //  });
    //  Utils.randomizeArray(this.words);
    //  completed();
    //  //this.words = _.map(this.MyData().Words.split("|"), (id: string) => { //z design time je v DragSource.Words seznam IDu dragTarget
    //  //  var dt: dragTarget = <dragTarget>this.myPage.getItem(id); //pro kazde id najdi dragTarget
    //  //  dt.source = this; //napln mu source
    //  //  return new dragWord(dt); //vytvor ModelView pro word
    //  //});
    //}
    dragSource.prototype.acceptData = function (done, userData) {
      if (done)
        _.each(this.words, function (w) {
          return w.st('');
        });
    };
    return dragSource;
  })(Course.control);
  Course.dragSource = dragSource;

  var c_used = "used";

  var dragWord = (function () {
    function dragWord(target /*Edit control, jehoz spravna odpoved je toto word*/) {
      var _this = this;
      this.target = target;
      this.st = ko.observable('');
      var self = this;
      self.click = function () {
        //klik na tlacitko v popup dialogu, odpovidajici this dragWord
        //actTarget obsahuje dragTarget, ktery zpusobil objeveni popup dialogu.
        var oldVal = actTarget.user();
        var newVal = self.target.MyData().id;
        if (oldVal == newVal) {
          self.st('');
          actTarget.user('');
          return;
        }

        //uvolni newVal pro pouziti pro dragList.target
        var newWord = _.find(self.target.source.words, function (w) {
          return w.target.user() == newVal;
        });
        if (newWord != null)
          newWord.target.user('');

        //vrat doposud vybrane slovo v dragList.target mezi nepouzite
        if (oldVal && oldVal != '') {
          var oldWord = _.find(_this.target.source.words, function (w) {
            return w.target.MyData().id == oldVal;
          });
          oldWord.st('');
        }

        //pouzij newVal
        actTarget.user(newVal);
        self.st(c_used);
      };
    }
    dragWord.prototype.title = function () {
      return this.target.MyData().correctValue;
    };
    return dragWord;
  })();
  Course.dragWord = dragWord;

  var dragTarget = (function (_super) {
    __extends(dragTarget, _super);
    function dragTarget(staticData, myPage) {
      _super.call(this, staticData, myPage);
      //user //uzivatelem vybrane Id
      this.userText = ko.observable('');
      this.corrects = [this.data.id];
      this.teacher = this.MyData().correctValue;
      var self = this;
      self.user.subscribe(function (id) {
        if (!id || id == '') {
          self.userText('');
          return;
        }

        //pridani, zjisti text slova dle id
        var owner = _.find(self.source.words, function (w) {
          return w.target.MyData().id == id;
        });
        self.userText(owner.target.teacher);
      });
      self.click = function () {
        actTarget = self;
      };
      //var ws = parseWidth(this.data.Width);
      //if (ws.i1 != null) {
      //  var w = parseInt(ws.i1);
      //  this.width = " style='width:" + (w + 30).toString() + "px' ";
      //}
    }
    dragTarget.prototype.createResult = function (forceEval) {
      if (typeof forceEval === "undefined") { forceEval = false; }
      return { Value: forceEval ? this.data.id : "" };
    };

    //width: string;
    dragTarget.prototype.MyData = function () {
      return this.data;
    };
    return dragTarget;
  })(Course.edit);
  Course.dragTarget = dragTarget;

  var actTarget;
})(Course || (Course = {}));

var __extends = this.__extends || function (d, b) {
  for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
  function __() { this.constructor = d; }
  __.prototype = b.prototype;
  d.prototype = new __();
};
var testMe;
(function (testMe) {
  testMe.tEx = "testExModel".toLowerCase();
  testMe.tResults = "testResultsModel".toLowerCase();
  testMe.tResult = "testResultModel".toLowerCase();
  testMe.appId = "test";

  var greenGreen = 0;
  var greenDone = 1;
  var greenBack = 2;
  var defaultGreenIcon = 'play';

  testMe.alowTestCreate_Url;

  var Model = (function (_super) {
    __extends(Model, _super);
    function Model(urlParts) {
      _super.call(this, testMe.tEx, urlParts);
      this.isHome = true;
      this.isResult = false;
      this.greenStatus = greenGreen;
      this.greenTitle = 'Continue';
      //greenIcon = Trados.isRtl ? "hand-o-left" : "hand-o-right"; //ikona zelene sipky
      this.greenIcon = defaultGreenIcon;
      //exItems: Array<IExItem>; //navigace nad cvicenimi
      this.modStarts = {};
      this.actIdx = 0;
      this.skipAdjustExModule = false;
      this.startTime = 0;
      this.instrTitle = ko.observable("");
      this.instrBody = ko.observable("");
      this.progressBar = ko.observable(0);
      this.progressText = ko.observable('');
      this.notLowTime = ko.observable(true);
      this.appId = testMe.appId;
    }
    Model.prototype.doUpdate = function (completed) {
      var th = this;
      CourseMeta.lib.adjustInstr(function () {
        return CourseMeta.lib.adjustProduct(th.productUrl, function (justLoaded) {
          th.actTest = CourseMeta.actCourseRoot;

          //osetreni home
          var alow = testMe.alowTestCreate_Url;
          testMe.alowTestCreate_Url = null;
          if (th.isHome) {
            if (th.actTest.setUserDataCalled) {
              th.actTest.interrupts.push({ beg: th.actTest.lastDate(), end: Utils.nowToNum(), ip: Login.myData.IP });
              th.actTest.userPending = true;
            } else {
              if (alow != th.productUrl) {
                location.href = '#';
                return;
              }
              th.actTest.expandDynamicAll(); //expanze dynamickych modulu
            }
            th.adjust_ex_and_module(); //spocti vysledky
            if (th.actModule == null) {
              location.hash = createUrl(testMe.tResult);
              return;
            }
          }

          th.createSkillsModel();

          if (th.isHome) {
            completed();
            return;
          }

          //if (th.modelJustCreated) {
          //  th.adjust_ex_and_module(); //initialni spocteni skore apod. Dalsi spocteni score se provadi pri kliku na tlacitka
          //  if (th.actTest.done && th.actTest.url.split('|').length == 1) { //oprava nekonsistentniho stavu posledniho testu
          //    th.actTest.resetStatus();
          //    th.actTest.expandDynamicAll();
          //    th.adjust_ex_and_module();
          //  }
          //}
          ////neni aktualni modul (tj. hotovo) => jdi na vysledek
          //if (th.actModule == null) { window.location.hash = createUrl(tResult); return; }
          ////skills
          //th.createSkillsModel();
          ////home
          //if (th.isHome) { completed(); return; }
          Logger.trace_course('testMe: doUpdate start');

          ////preruseny test => dej zaznam
          //if (th.modelJustCreated && th.actTest.elapsed) {
          //  th.actTest.interrupts.push({ beg: th.actTest.lastDate(), end: Utils.nowToNum(), ip: Login.myData.IP });
          //  th.actTest.userPending = true;
          //}
          //th.modelJustCreated = false;
          var actEx = th.getActEx();

          //un-done
          if (actEx.done) {
            actEx.done = false;
            actEx.testWasDone = true;
          }

          //display ex
          saveProduct(function () {
            return CourseMeta.lib.adjustEx(actEx, function () {
              return CourseMeta.lib.displayEx(actEx, null, function (actEx) {
                Logger.trace_course('testMe: doUpdate end');
                th.instrTitle(actEx.page.instrTitle);
                th.instrBody(_.map(actEx.page.instrs, function (s) {
                  var res = CourseMeta.instructions[s.toLowerCase()];
                  return res ? res : (_.isEmpty(s) ? "" : "Missing [" + s + "] instruction");
                }).join());
                th.startTimer(); //adjustace mereni casu
                //completed(); completed je osetreno v displayEx. Pri completed by knockout hlasil vicenasobny binding.
              });
            });
          });
        });
      });
    };

    Model.prototype.htmlClearing = function () {
      if (CourseMeta.actExPageControl && CourseMeta.actExPageControl.sound)
        CourseMeta.actExPageControl.sound.htmlClearing();
      this.clearTimer();
    };

    Model.prototype.startTimer = function () {
      var _this = this;
      var th = this;
      if (th.timer)
        return;
      th.startTime = Utils.nowToNum();
      var saveCounter = 0;
      th.timer = setInterval(function () {
        if (!th.actModule || !th.actTest || isSaveProduct)
          return;

        //inicializace casovych informaci modulu
        //var initElapsed = th.actTest.skillElapsed[th.actModule.url]; if (!initElapsed) initElapsed = 0; //udaj z databaze
        var initElapsed = th.actModule.elapsed;
        if (!initElapsed)
          initElapsed = 0; //udaj z databaze
        var startElapsed = th.modStarts[th.actModule.url];
        if (!startElapsed)
          th.modStarts[th.actModule.url] = startElapsed = Utils.nowToNum() - initElapsed; //udaj pri startu modulu

        //vypocet
        var newElapsed = Utils.nowToNum() - startElapsed;

        //var maxElapsed = 20;
        //var maxElapsed = 1000;
        var maxElapsed = th.actModule.minutes * 60;
        var done = newElapsed >= maxElapsed;
        if (done)
          newElapsed = maxElapsed;

        //th.actTest.skillElapsed[th.actModule.url] = newElapsed;
        th.actModule.elapsed = newElapsed;
        th.actModule.end = Utils.nowToNum();
        th.actModule.userPending = true;
        if (done) {
          th.clearTimer();
          th.progressBar(0);
          th.progressText('Available time expired!');
          setTimeout(function () {
            alert('Timeout');
            _this.eval();
            th.finishModule();
          });
        } else {
          var percent = 100 - 100 * newElapsed / maxElapsed;
          th.notLowTime(percent > 15);
          th.progressBar(percent);
          th.progressText(Utils.formatTimeSpan(maxElapsed - newElapsed));
          if (saveCounter > 20) {
            saveProduct($.noop);
            saveCounter = 0;
          } else
            saveCounter++;
        }
      }, 500);
      //}, 500);
    };

    Model.prototype.eval = function () {
      var ex = this.getActEx();
      if (!ex || !ex.evaluator)
        return;
      ex.testEvaluate();
      delete ex.beg;

      //soucet elapsed vsech cviceni testu
      var exElapsed = 0;
      _.each(this.actTest.items, function (m) {
        return _.each(m.items, function (ex) {
          if (ex.elapsed)
            exElapsed += ex.elapsed;
        });
      });

      //soucet elapsed vsech modulu
      var modElapsed = 0;
      _.each(this.actTest.items, function (t) {
        return modElapsed += t.elapsed;
      });

      //uprav elapsed aktualniho cviceni
      if (modElapsed > exElapsed)
        ex.elapsed += Math.floor(modElapsed - exElapsed);
    };

    Model.prototype.finishModule = function () {
      var _this = this;
      Logger.trace_course('testMe: finishModule start');
      this.clearTimer();
      _.each(this.actModule.items, function (ex) {
        if (!ex.done) {
          ex.score = 0;
          ex.done = true;
          ex.userPending = true;
        }
      });
      this.actModule.end = Utils.nowToNum();
      this.actModule.userPending = true;
      this.adjust_ex_and_module();
      if (_.all(this.actTest.items, function (m) {
          return m.done;
      })) {
        saveProduct(function () {
          return CourseMeta.persist.createArchive(LMStatus.Cookie.id, CourseMeta.actCompanyId, CourseMeta.actProduct.url, function (archiveId) {
            //aktualni produkt je na serveru prejmenovan, prejmenuj i na klientovi
            CourseMeta.actProduct.url += '|' + archiveId.toString();
            _this.productUrl = CourseMeta.actProduct.url;
            _this.actTest.adjustResult(archiveId); //vytvor test result
            saveProduct(function () {
              Login.adjustMyData(true, function () {
                Logger.trace_course('testMe: finishModule, test end');
                window.location.hash = createUrl(testMe.tResult);
              }); //jdi na result stranku
            });
          });
        });
      } else {
        saveProduct(function () {
          _this.actModule = null;
          _this.adjust_ex_and_module();
          Logger.trace_course('testMe: finishModule end');
          Pager.reloadPage();
        });
      }
    };

    Model.prototype.adjust_ex_and_module = function () {
      var th = this;
      CourseMeta.actCourseRoot.refreshNumbers();
      if (!th.actModule) {
        th.actModule = (_.find(th.actTest.items, function (it) {
          return !it.done;
        }));
        if (!th.actModule) {
          th.actTest.done = true;
          return;
        }
        if (!th.actModule.beg)
          th.actModule.beg = Utils.nowToNum();
        th.actIdx = 0;
        th.greenStatus = greenGreen;
        th.greenTitle = 'Continue';
      }
    };

    Model.prototype.doGreenClick = function () {
      var _this = this;
      if (this.isHome) {
        this.isHome = false;
        Pager.reloadPage();
      } else if (this.isResult) {
        debugger;
        throw 'this.isResult';
      } else {
        if (!this.actModule)
          throw '!this.actModule';
        this.greenIcon = defaultGreenIcon;
        this.eval(); //vyhodnot cviceni
        if (this.greenStatus == greenDone) {
          if (confirm('ok')) {
            setTimeout(function () {
              return _this.finishModule();
            }, 1);
            return;
          }
        }
        this.adjust_ex_and_module();
        if (this.greenStatus != greenDone && this.actModule.done) {
          this.greenStatus = greenDone;
          this.greenTitle = 'Finish';
          this.greenIcon = 'fast-forward';
        }

        //dalsi cvicen
        this.actIdx++;
        if (this.actIdx >= this.actModule.items.length)
          this.actIdx = 0;
        saveProduct(Pager.reloadPage);
      }
    };
    Model.prototype.doSkipClick = function () {
      this.eval();
      var ex = this.getActEx();
      ex.done = ex.testWasDone;
      ex.testWasDone = false;

      //dalsi cvicen a prepocet cisel
      this.actIdx++;
      if (this.actIdx >= this.actModule.items.length)
        this.actIdx = 0;
      saveProduct(function () {
        return setTimeout(Pager.reloadPage, 1);
      });
    };
    Model.prototype.doExClick = function (newIdx) {
      this.eval();
      var ex = this.getActEx();
      ex.done = ex.testWasDone;
      ex.testWasDone = false;
      this.actIdx = newIdx;

      //save
      saveProduct(Pager.reloadPage);
    };
    Model.prototype.doFinishClick = function () {
      var _this = this;
      this.eval(); //vyhodnot cviceni
      if (!confirm('ok'))
        return;
      setTimeout(function () {
        return _this.finishModule();
      }, 1);
    };

    Model.prototype.createSkillsModel = function () {
      var _this = this;
      if (this.isResult) {
        debugger;
        throw 'this.isResult';
      }
      var res = [];
      res.push({ title: 'Uvod', active: this.isHome ? 'active' : '' });
      _.each(this.actTest.items, function (it) {
        return res.push({ title: testMe.Skills[it.skill], active: !_this.isHome && _this.actModule == it ? 'active' : '' });
      });
      res.push({ title: 'Vysledky', active: '' });

      //res.push({ title: 'Vysledky', active: this.isResult ? 'active' : '' });
      this.skills = res;
      var act = _.find(res, function (r) {
        return r.active != '';
      });
      this.skillSmall = act.title;
      this.skillSmallStatus = act == res[0] ? 0 : (act == res[res.length - 1] ? 2 : 1);
    };
    Model.prototype.clearTimer = function () {
      if (!this.timer)
        return;
      clearInterval(this.timer);
      this.timer = null;
    };
    Model.prototype.getActEx = function () {
      return this.actModule && this.actModule.items[this.actIdx] ? (this.actModule.items[this.actIdx]) : null;
    };
    return Model;
  })(schools.Model);
  testMe.Model = Model;

  var ISkillItem = (function () {
    function ISkillItem() {
    }
    return ISkillItem;
  })();
  testMe.ISkillItem = ISkillItem;

  function saveProduct(completed) {
    isSaveProduct = true;
    CourseMeta.lib.saveProduct(function () {
      isSaveProduct = false;
      completed();
    });
  }
  var isSaveProduct;

  //Bezpecne save produktu: pokud je nejake jine save rozbehnute, pozdrzi se az do dobehnuti posledniho.
  //http://jsfiddle.net/L5nud/111/
  function saveProduct_(completed) {
    Logger.trace_course('saveProduct: testMe start');
    promise = promise.then(saveProductLow(function () {
      Logger.trace_course('saveProduct: testMe end');
      completed();
    })); //zarad dalsi pozadavek na konec nedokoncenych pozadavku
  }
  function saveProductLow(completed) {
    var deferred = $.Deferred();
    CourseMeta.lib.saveProduct(deferred.resolve);
    return function () {
      return deferred.promise().then(completed);
    };
  }
  var promise = $.when($.noop);

  var testImpl = (function (_super) {
    __extends(testImpl, _super);
    function testImpl() {
      _super.call(this);
      this.setUserDataCalled = false;
      this.ip = Login.myData.IP;
      this.interrupts = [];
    }
    testImpl.prototype.resetStatus = function () {
      _.each(this.items, function (it) {
        return it.resetStatus();
      });
      this.interrupts = [];
      this.ip = Login.myData.IP;
      this.done = false;
    };

    testImpl.prototype.lastDate = function () {
      var max = 0;
      _.each(this.items, function (it) {
        return max = Math.max(max, it.end);
      });
      return max;
    };

    testImpl.prototype.adjustResult = function (id) {
      this.result = {
        domain: Pager.basicDir.substr(Pager.basicDir.lastIndexOf('//') + 2),
        id: id,
        firstName: LMStatus.Cookie.FirstName,
        lastName: LMStatus.Cookie.LastName,
        eMail: LMStatus.Cookie.EMail,
        title: this.title,
        ip: this.ip,
        interrupts: this.interrupts,
        skills: _.map(this.items, function (sk) {
          var res = { title: sk.title, skill: sk.skill, elapsed: sk.elapsed, finished: sk.end, score: Math.round(sk.score / sk.items.length), started: sk.beg, scoreWeight: sk.scoreWeight };
          return res;
        }),
        company: _.find(Login.myData.Companies, function (c) {
          return c.Id == CourseMeta.actCompanyId;
        }).Title,
        score: 0
      };

      //score weights
      var wsum = 0, wcnt = 0;
      _.each(this.result.skills, function (sk) {
        if (!sk.scoreWeight)
          return;
        wsum += sk.scoreWeight;
        wcnt++;
      });
      if (wsum > 100) {
        debugger;
        throw 'wsum > 100';
      }
      var wempty = (100 - wsum) / (this.items.length - wcnt);

      //dosad weights, aby jejich soucet byl 100
      var wintSum = 0;
      _.each(this.result.skills, function (sk) {
        return wintSum += sk.scoreWeight = Math.round(sk.scoreWeight ? sk.scoreWeight : wempty);
      });
      if (wintSum > 100 || wintSum < 98) {
        debugger;
        throw 'wintSum > 100 || wintSum < 98';
      }
      if (wintSum < 100)
        this.result.skills[0].scoreWeight += 100 - wintSum;

      //vazeny prumer
      var ssum = 0;
      _.each(this.result.skills, function (sk) {
        return ssum += sk.score * sk.scoreWeight;
      });
      this.result.score = Math.round(ssum / 100);

      this.userPending = true;
    };

    //inicializace
    //adjustUserData() {
    //  //if (!this.skillElapsed) this.skillElapsed = {};
    //  if (!this.interrupts) this.interrupts = [];
    //}
    //persistence
    testImpl.prototype.setUserData = function (data) {
      if (!data) {
        data = { interrupts: [], ip: Login.myData.IP };
        this.userPending = true;
      }
      this.setUserDataCalled = true;
      for (var p in data)
        this[p] = data[p];
    };
    testImpl.prototype.getUserData = function (setData) {
      var dt = { interrupts: this.interrupts, ip: Login.myData.IP };
      setData(JSON.stringify(dt), null, null);
      if (this.result)
        setData(null, JSON.stringify(this.result), testImpl.resultKey);
    };

    testImpl.prototype.expandDynamicAll = function () {
      this.userPending = true;
      CourseMeta.scan(this, function (nd) {
        if (!CourseMeta.isType(nd, 512 /* taskTestSkill */))
          return;
        nd.expandDynamic();
        //prevzeti informaci z dynamicModuleData
        //var dynData: CourseMeta.dynamicModuleData = <CourseMeta.dynamicModuleData><any>(nd.oldItems[0]);
        //nd.minutes = dynData.minutes ? dynData.minutes : 0; nd.skill = dynData.skill ? dynData.skill : 0; nd.scoreWeight = dynData.scoreWeight ? dynData.scoreWeight : 0;
      });
    };
    testImpl.resultKey = 'result';
    return testImpl;
  })(CourseMeta.courseNode);
  testMe.testImpl = testImpl;

  var testSkillImpl = (function (_super) {
    __extends(testSkillImpl, _super);
    function testSkillImpl() {
      _super.call(this);
      this.beg = 0;
      this.end = 0;
      this.elapsed = 0;
    }
    testSkillImpl.prototype.refreshNumbers = function (exCountOnly) {
      if (typeof exCountOnly === "undefined") { exCountOnly = false; }
      var th = this;
      th.exCount = th.items.length;
      th.score = 0;
      th.done = true; //th.elapsed = 0;
      _.each(th.items, function (it) {
        it.refreshNumbers();
        th.score += it.score; /*th.elapsed += it.elapsed;*/
        th.done = th.done && it.done;
      });
    };

    testSkillImpl.prototype.setUserData = function (data) {
      _super.prototype.setUserData.call(this, data.modUrls);
      this.beg = data.started;
      this.end = data.finished;
      this.elapsed = data.elapsed;
    };
    testSkillImpl.prototype.getUserData = function (setData) {
      var data = {
        modUrls: _.map(this.items, function (it) {
          return it.url;
        }), started: this.beg, finished: this.end, elapsed: this.elapsed
      };
      setData(JSON.stringify(data), null);
    };
    return testSkillImpl;
  })(CourseMeta.modImpl);
  testMe.testSkillImpl = testSkillImpl;

  function createUrl(type, companyId, productUrl) {
    if (typeof type === "undefined") { type = null; }
    if (typeof companyId === "undefined") { companyId = 0; }
    if (typeof productUrl === "undefined") { productUrl = null; }
    return [testMe.appId, type ? type : testMe.tEx, companyId ? companyId : CourseMeta.actCompanyId, productUrl ? productUrl : CourseMeta.actProduct.url].join('@');
  }
  testMe.createUrl = createUrl;

  Pager.registerAppLocator(testMe.appId, testMe.tEx, function (urlParts, completed) {
    return completed(new Model(urlParts));
  });
})(testMe || (testMe = {}));

var __extends = this.__extends || function (d, b) {
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
      this.br = [{
        title: schools.homeTitle(), iconId: function () {
          return 'home';
        }, url: ''
      }];
    }
    ResultLow.prototype.breadcrumbs = function () {
      return this.br;
    };
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
      CourseMeta.persist.loadUserData(schools.LMComUserId(), CourseMeta.actCompanyId, th.productUrl, testMe.testImpl.resultKey, function (data) {
        extendResult(data);
        th.data = data;
        th.br.pushArray([
            {
              title: th.data.title, iconId: function () {
                return 'folder-open';
              }, url: testMe.createUrl(testMe.tResults, 0, th.productUrl.split('|')[0])
            },
            {
              title: th.data.subTitleShort(), iconId: function () {
                return 'puzzle-piece';
              }, url: ''
            }
        ]);
        completed();
      });
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
      CourseMeta.persist.testResults(schools.LMComUserId(), CourseMeta.actCompanyId, th.productUrl, function (data) {
        _.each(data, function (r) {
          return extendResult(r);
        });
        th.tests = data;
        var cnt = 0;
        _.each(th.tests, function (t) {
          return t.idx = cnt++;
        });
        th.barTitle = th.tests[0].title;
        th.br.pushArray([
            {
              title: th.barTitle, iconId: function () {
                return 'folder-open';
              }, url: ''
            }
        ]);
        th.gotoTest = function (idx) {
          return window.location.hash = testMe.createUrl(testMe.tResult, 0, th.productUrl + '|' + th.tests[idx].id.toString());
        };
        completed();
      });
    };
    return Results;
  })(ResultLow);
  testMe.Results = Results;

  function extendResult(r) {
    Utils.extendObject(r, [resultImpl]);
    _.each(r.skills, function (s) {
      return Utils.extendObject(s, [skillResultImpl]);
    });
  }

  var resultImpl = (function () {
    function resultImpl() {
    }
    resultImpl.prototype.started = function () {
      return Utils.numToDate(_.min(this.skills, function (sk) {
        return sk.started;
      }).started);
    };
    resultImpl.prototype.finished = function () {
      return Utils.numToDate(_.max(this.skills, function (sk) {
        return sk.started;
      }).finished);
    };
    resultImpl.prototype.elapsed = function () {
      var res = 0;
      _.each(this.skills, function (sk) {
        return res += sk.elapsed;
      });
      return res;
    };
    resultImpl.prototype.dateTxt = function () {
      return resultImpl.dateTxtProc(this.started(), this.finished());
    };
    resultImpl.dateTxtProc = function (stDt, finDt) {
      var stD = Globalize.format(stDt, 'd');
      var stT = Globalize.format(stDt, 'H:mm:ss');
      var finD = Globalize.format(finDt, 'd');
      var finT = Globalize.format(finDt, 'H:mm:ss');
      var dtSame = stDt.setHours(0, 0, 0, 0) == finDt.setHours(0, 0, 0, 0);
      return dtSame ? stD + ' (' + stT + ' - ' + finT + ')' : stD + ' ' + stT + ' - ' + finD + ' ' + finT;
    };
    resultImpl.prototype.elapsedTxt = function () {
      return Utils.formatTimeSpan(this.elapsed());
    };
    resultImpl.prototype.interruptsTxt = function () {
      if (!this.interrupts || this.interrupts.length == 0)
        return '0';
      var len = 0;
      _.each(this.interrupts, function (int) {
        return len += int.end - int.beg;
      });
      return this.interrupts.length.toString() + 'x, duration ' + Utils.formatTimeSpan(len);
    };
    resultImpl.prototype.ipsTxt = function () {
      var ips = _.map(this.interrupts, function (int) {
        return int.ip;
      });
      ips.push(this.ip);
      ips = _.uniq(ips);
      var huge = ips.length > 2;
      ips = ips.slice(0, 2);
      var res = ips.join(', ');
      return huge ? res + ',...' : res;
    };
    resultImpl.prototype.subTitleShort = function () {
      return Globalize.format(this.started(), 'd');
    };
    resultImpl.prototype.subTitleLong = function () {
      return this.title + ': ' + Globalize.format(this.started(), 'd');
    };

    //************ interruprions a IP address
    resultImpl.prototype.hasIntIpData = function () {
      return this.interrupts && this.interrupts.length > 0;
    };
    resultImpl.prototype.adjustIntIpData = function () {
      if (this.intIpData)
        return this.intIpData;
      var res = [];
      var temp;
      _.each(this.interrupts, function (it) {
        return res.push([
            Globalize.format(temp = Utils.numToDate(it.beg), 'd') + ', ' + Globalize.format(temp = Utils.numToDate(it.beg), 'H:mm:ss'),
            Globalize.format(temp = Utils.numToDate(it.end), 'd') + ', ' + Globalize.format(temp = Utils.numToDate(it.end), 'H:mm:ss'),
            Utils.formatTimeSpan(it.end - it.beg),
            it.ip
        ]);
      });
      return res;
    };

    resultImpl.prototype.adjustIpData = function () {
      if (this.ipData)
        return this.ipData;
      var res = _.uniq(_.map(this.interrupts, function (it) {
        return it.ip;
      }));
      res.push(this.ip);
      res = _.uniq(res);
      return res;
    };
    return resultImpl;
  })();
  testMe.resultImpl = resultImpl;

  var skillResultImpl = (function () {
    function skillResultImpl() {
    }
    skillResultImpl.prototype.dateTxt = function () {
      return resultImpl.dateTxtProc(Utils.numToDate(this.started), Utils.numToDate(this.finished));
    };
    skillResultImpl.prototype.elapsedTxt = function () {
      return Utils.formatTimeSpan(this.elapsed);
    };
    return skillResultImpl;
  })();
  testMe.skillResultImpl = skillResultImpl;

  Pager.registerAppLocator(testMe.appId, testMe.tResult, function (urlParts, completed) {
    return completed(new Result(urlParts));
  });
  Pager.registerAppLocator(testMe.appId, testMe.tResults, function (urlParts, completed) {
    return completed(new Results(urlParts));
  });
})(testMe || (testMe = {}));

