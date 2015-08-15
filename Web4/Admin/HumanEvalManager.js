var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var schoolAdmin;
(function (schoolAdmin) {
    //prechudce seznamu s Line
    var evaluatorLangLow = (function () {
        function evaluatorLangLow(lang) {
            this.lang = lang;
            this.title = locLangs[lang]();
            this.langTitle = LMComLib.LineIds[lang].toLowerCase();
        }
        return evaluatorLangLow;
    })();
    schoolAdmin.evaluatorLangLow = evaluatorLangLow;
    //*************************************************************
    //  home stranka Assign testu hodnotitelum
    //  obsahuje zeznam jazyku testu
    //*************************************************************
    var HumanEvalManagerLangs = (function (_super) {
        __extends(HumanEvalManagerLangs, _super);
        function HumanEvalManagerLangs(urlParts) {
            _super.call(this, schoolAdmin.humanEvalManagerLangsTypeName, urlParts);
        }
        // UPDATE
        HumanEvalManagerLangs.prototype.update = function (completed) {
            var _this = this;
            Pager.ajaxGet(Pager.pathType.restServices, Login.CmdHumanEvalManagerLangs_Type, Login.CmdHumanEvalManagerLangs_Create(LMStatus.Cookie.id, this.CompanyId), function (res) {
                _this.langs = _.map(res.lines, function (l) { return new evaluatorLangCount(l.line, l.count); });
                completed();
            });
        };
        HumanEvalManagerLangs.prototype.click = function (idx) {
            location.hash = schoolAdmin.getHash(schoolAdmin.humanEvalManagerTypeName, this.CompanyId) + hashDelim + this.langs[idx].lang.toString();
        };
        HumanEvalManagerLangs.prototype.close = function () {
            location.hash = schools.createHomeUrlStd();
        };
        return HumanEvalManagerLangs;
    })(schoolAdmin.CompModel);
    schoolAdmin.HumanEvalManagerLangs = HumanEvalManagerLangs;
    var evaluatorLangCount = (function (_super) {
        __extends(evaluatorLangCount, _super);
        function evaluatorLangCount(lang, count) {
            _super.call(this, lang);
            this.lang = lang;
            this.count = count;
        }
        return evaluatorLangCount;
    })(evaluatorLangLow);
    schoolAdmin.evaluatorLangCount = evaluatorLangCount;
    //*************************************************************
    //  Assign testu (vybraneho jazyka) hodnotitelum
    //*************************************************************
    var HumanEvalManager = (function (_super) {
        __extends(HumanEvalManager, _super);
        function HumanEvalManager(urlParts) {
            _super.call(this, schoolAdmin.humanEvalManagerTypeName, urlParts);
            this.oldRemoved = ko.observable(0);
            this.news = ko.observable(0);
            this.actLine = parseInt(urlParts[1]);
        }
        // UPDATE
        HumanEvalManager.prototype.update = function (completed) {
            var _this = this;
            Pager.ajaxGet(Pager.pathType.restServices, Login.CmdHumanEvalManagerGet_Type, Login.CmdHumanEvalManagerGet_Create(LMStatus.Cookie.id, this.actLine, this.CompanyId), function (allRes) {
                _this.data = allRes;
                //DEBUG
                //allRes.evaluators[0].toDo.pushArray([{ assigned: 1, courseUserId: 31, productId: '' }, { assigned: 1, courseUserId: 32, productId: '' }]);
                //allRes.evaluators.push({ email: 'xxx', name: '', companyUserId: 0, toDo: [] });
                //allRes.toEvaluate.pushArray([{ assigned: 1, courseUserId: 33, productId: '' }, { assigned: 1, courseUserId: 34, productId: '' }]);
                var idx = 0;
                _this.olds = 0;
                _this.all = 0;
                _this.evaluators = _.map(allRes.evaluators, function (ev) { _this.olds += ev.toDo.length; return new evaluatorImpl(_this, idx++, ev); });
                _this.all = _this.olds + allRes.toEvaluate.length;
                completed();
            });
        };
        HumanEvalManager.prototype.loaded = function () {
            this.form = $('#human-form');
            this.form.validate();
            _.each(this.evaluators, function (e) { return e.loaded(); });
            this.refreshNumbers();
        };
        HumanEvalManager.prototype.validate = function (act, val) {
            if (val.trim() == '')
                return null;
            var numVal = parseInt(val);
            //vsechny allForce (mimo act) jsou neprazdne => min = max = all
            if (_.all(this.evaluators, function (e) { return e == act || !_.isEmpty(e.allForce()); })) {
                return numVal == act.all() ? null : { min: act.all(), max: act.all() };
            }
            //spocti max. povolenou hodnotu
            var usedNews = 0; //pouzite not assigned (news)
            _.each(this.evaluators, function (e) {
                if (e == act || _.isEmpty(e.allForce()))
                    return;
                usedNews += parseInt(e.allForce()) - e.olds;
            });
            var res = { min: 0, max: this.data.toEvaluate.length - usedNews + act.toDo.length };
            return numVal >= res.min && numVal <= res.max ? null : res;
        };
        HumanEvalManager.prototype.refreshNumbers = function () {
            //allChange: hodnota news (kladny) nebo oldRemoved (zaporny)
            var allChange = 0;
            var autoAssign = [];
            _.each(this.evaluators, function (e) {
                if (_.isEmpty(e.allForce())) {
                    autoAssign.push(e);
                    return;
                }
                var allForce = parseInt(e.allForce());
                e.all(allForce);
                var change = allForce - e.olds;
                allChange += change;
                if (change > 0) {
                    e.news(change);
                    e.oldRemoved(0);
                }
                else {
                    e.news(0);
                    e.oldRemoved(-change);
                }
            });
            var toDo = this.all - this.olds - allChange;
            if (autoAssign.length != 0) {
                //rozdel zbyle studenty
                var delta = Math.round(toDo / autoAssign.length);
                _.each(autoAssign, function (e) {
                    var act = delta < toDo ? delta : toDo;
                    e.news(act);
                    e.oldRemoved(0);
                    toDo -= act;
                    e.all(act + e.olds);
                });
                if (toDo > 0) {
                    var rest = autoAssign[autoAssign.length - 1];
                    rest.news(rest.news() + toDo);
                }
            }
            //soucty
            var oldRemovedSum = 0, newsSum = 0;
            _.each(this.evaluators, function (e) { oldRemovedSum += e.oldRemoved(); newsSum += e.news(); });
            this.oldRemoved(oldRemovedSum);
            this.news(newsSum);
        };
        HumanEvalManager.prototype.ok = function () {
            var _this = this;
            //priprav si vysledek
            var res = _.map(this.evaluators, function (e) { var r = { companyUserId: e.data.companyUserId, courseUserIds: [], dsgn_impl: e, dsgn_done: false }; return r; });
            var toAsign = _.map(this.data.toEvaluate, function (e) { return e.courseUserId; });
            //1. pruchod: obohat toAsign o odstranene studenty (oldRemoved>0)
            _.each(res, function (r) {
                var remNum = r.dsgn_impl.oldRemoved();
                if (remNum <= 0)
                    return;
                var data = r.dsgn_impl.data; //old asigned
                toAsign.pushArray(_.map(data.toDo.slice(data.toDo.length - remNum), function (v) { return v.courseUserId; })); //remove end of old asigned
                r.courseUserIds = _.map(data.toDo.slice(0, data.toDo.length - remNum), function (v) { return v.courseUserId; }); //use start of old asigned
                if (r.dsgn_impl.news() > 0) {
                    debugger;
                    throw 'r.dsgn_impl.news() > 0';
                }
                r.dsgn_done = true;
            });
            //2. pruchod: rozdel nove a odstranene studenty, odstran dsgn props
            var firstIdx = 0;
            _.each(res, function (r) {
                var toAdd = r.dsgn_impl.news();
                if (!r.dsgn_done) {
                    r.courseUserIds.pushArray(_.map(r.dsgn_impl.data.toDo, function (a) { return a.courseUserId; })); //old
                    r.courseUserIds.pushArray(toAsign.slice(firstIdx, firstIdx + toAdd)); //new
                    firstIdx += toAdd;
                }
                delete r.dsgn_done;
                delete r.dsgn_impl;
            });
            Pager.ajaxGet(Pager.pathType.restServices, Login.CmdHumanEvalManagerSet_Type, Login.CmdHumanEvalManagerSet_Create(res), function () { return _this.cancel(); });
        };
        HumanEvalManager.prototype.cancel = function () { location.hash = schoolAdmin.getHash(schoolAdmin.humanEvalManagerLangsTypeName, this.CompanyId); };
        return HumanEvalManager;
    })(schoolAdmin.CompModel);
    schoolAdmin.HumanEvalManager = HumanEvalManager;
    //model pro jednoho evaluatora
    var evaluatorImpl = (function () {
        function evaluatorImpl(owner, index, data) {
            var _this = this;
            this.owner = owner;
            this.index = index;
            this.data = data;
            this.valid = true;
            this.oldRemoved = ko.observable(0); //removed stare (...removed)
            this.news = ko.observable(0); //nove (...new assigned)
            //INPUT v ...all
            this.allForce = ko.observable(null); //validovana hodnota, nastavena managerem
            this.all = ko.observable(0); //label v ...all. Pro neprazdny allForce se rovna allForce
            jQuery.extend(this, data);
            this.olds = data.toDo.length;
            this.allForce.subscribe(function (val) { return _this.owner.refreshNumbers(); });
            this.attemptAllForce = ko.computed({
                read: this.allForce,
                write: function (val) {
                    var validRes = _this.owner.validate(_this, val);
                    var vtor = _this.owner.form.validate();
                    _this.valid = validRes == null;
                    if (_this.valid) {
                        _this.allForce(val);
                        vtor.removeError(_this.input[0]);
                    }
                    else
                        vtor.addError({ element: _this.input[0], message: $.validator.messages.range(validRes.min.toString(), validRes.max.toString()) + ' ' + CSLocalize('495ccadce4d34bdc920bd1898aa0fed7', 'or let the field empty.') });
                },
                owner: this
            });
        }
        evaluatorImpl.prototype.loaded = function () {
            var _this = this;
            this.input = $('#new-input-' + this.index.toString());
            this.input.blur(function (ev) { if (!_this.valid)
                _this.input.focus(); });
        };
        return evaluatorImpl;
    })();
    schoolAdmin.evaluatorImpl = evaluatorImpl;
    //*************************************************************
    //  sprava evaluatoru - pridani, nastaveni lines, mazani
    //*************************************************************
    var HumanEvalManagerEvs = (function (_super) {
        __extends(HumanEvalManagerEvs, _super);
        function HumanEvalManagerEvs(urlParts) {
            _super.call(this, schoolAdmin.humanEvalManagerEvsTypeName, urlParts);
        }
        // UPDATE
        HumanEvalManagerEvs.prototype.update = function (completed) {
            var _this = this;
            Pager.ajaxGet(Pager.pathType.restServices, Login.CmdHumanEvalManagerEvsGet_Type, Login.CmdHumanEvalManagerEvsGet_Create(LMStatus.Cookie.id, this.CompanyId), function (res) {
                _this.evaluators = _.sortBy(_.map(res, function (it) { return new evaluator(it); }), function (e) { return e.data.email; });
                _this.modalDlg = new evaluatorModalDlg(_this);
                completed();
            });
        };
        HumanEvalManagerEvs.prototype.loaded = function () {
            this.modalDlg.loaded();
        };
        HumanEvalManagerEvs.prototype.edit = function (id) {
            this.modalDlg.show(id);
        };
        HumanEvalManagerEvs.prototype.del = function (id) {
            var _this = this;
            anim.alert().show(CSLocalize('4724072775e1467eb90aaaa4cd7a5068', 'Do you really want to remove this Evaluator from the system?'), function (ok) {
                if (!ok)
                    return;
                Pager.ajaxGet(Pager.pathType.restServices, Login.CmdHumanEvalManagerEvsSave_Type, Login.CmdHumanEvalManagerEvsSave_Create(-id, _this.CompanyId, null, null), function (res) { return Pager.reloadPage(); });
            });
        };
        HumanEvalManagerEvs.prototype.add = function () {
            this.modalDlg.show(0);
        };
        HumanEvalManagerEvs.prototype.close = function () {
            location.hash = schools.createHomeUrlStd();
        };
        HumanEvalManagerEvs.prototype.refresh = function (completed) {
        };
        HumanEvalManagerEvs.prototype.downloadReport = function () {
            Pager.ajax_download(Pager.path(Pager.pathType.restServices), Login.CmdReport_Create(schools.LMComUserId(), CourseMeta.actCompanyId, Login.CmdReportType.evaluators), Login.CmdReport_Type);
        };
        return HumanEvalManagerEvs;
    })(schoolAdmin.CompModel);
    schoolAdmin.HumanEvalManagerEvs = HumanEvalManagerEvs;
    //model pro jednoho evaluator
    var evaluator = (function () {
        function evaluator(data) {
            this.data = data;
            this.langs = _.map(data.evalInfos, function (l) { return new evaluatorLangLow(l.lang); });
        }
        return evaluator;
    })();
    schoolAdmin.evaluator = evaluator;
    jQuery.validator.addMethod("humanUnique", function (val, element, params) {
        var model = params.model;
        val = val.trim().toLowerCase();
        return _.all(model.owner.evaluators, function (e) { return e.data.email != val; });
    }, function (params, element) {
        return CSLocalize('44461a0351fc4224845dd09794b580f0', 'email address already exists');
    });
    var evaluatorModalDlg = (function () {
        function evaluatorModalDlg(owner) {
            this.owner = owner;
            this.email = ko.observable('');
            this.isEdit = ko.observable(false);
            this.langs = _.map(avalLangs, function (l) { return new evaluatorLang(l); });
        }
        evaluatorModalDlg.prototype.loaded = function () {
            this.myCtrl = $('#evaluator-modal-dlg');
            this.form = this.myCtrl.find('form');
            this.validator = this.form.validate({
                onsubmit: false,
                rules: {
                    'human-email-input': {
                        required: true,
                        email: true,
                        humanUnique: {
                            model: this
                        }
                    }
                }
            });
            this.emailCtrl = this.form.find('#human-email-input');
            this.langsCtrl = this.form.find('#human-langs');
            this.langsCtrl[0]['type'] = '';
        };
        evaluatorModalDlg.prototype.show = function (id, completed) {
            this.isEdit(id > 0);
            this.actEvaluator = id == 0 ? null : _.find(this.owner.evaluators, function (ev) { return ev.data.companyUserId == id; });
            this.email(this.actEvaluator ? this.actEvaluator.data.email : '');
            var actLangs = this.actEvaluator ? _.map(this.actEvaluator.langs, function (l) { return l.lang; }) : [];
            _.each(this.langs, function (l) { return l.checked(_.contains(actLangs, l.lang)); });
            this.validator.removeError(this.langsCtrl[0]);
            this.validator.removeError(this.emailCtrl[0]);
            this.myCtrl.modal('show');
        };
        evaluatorModalDlg.prototype.ok = function () {
            var _this = this;
            if (!this.actEvaluator && !this.form.valid())
                return;
            var par = Login.CmdHumanEvalManagerEvsSave_Create(0, this.owner.CompanyId, null, null);
            if (this.actEvaluator)
                par.companyUserId = this.actEvaluator.data.companyUserId;
            else
                par.email = this.email();
            if (!this.langsValid()) {
                this.validator.addError({ element: this.langsCtrl[0], message: CSLocalize('dea496b88f524c4ab10895368de79d0f', 'At least one language must be selected') });
                return;
            }
            this.validator.removeError(this.langsCtrl[0]);
            par.evalInfos = _.map(_.filter(this.langs, function (l) { return l.checked(); }), function (l) { return { lang: l.lang }; });
            Pager.ajaxGet(Pager.pathType.restServices, Login.CmdHumanEvalManagerEvsSave_Type, par, function (res) {
                if (!res) {
                    _this.validator.addError({ element: _this.emailCtrl[0], message: CSLocalize('be46325868c844ca8c6f1d433437ffd3', 'Person with this email address is not registered in the system') });
                    return;
                }
                _this.myCtrl.modal('hide');
                Pager.reloadPage();
            });
        };
        evaluatorModalDlg.prototype.langsValid = function () { return _.any(this.langs, function (l) { return l.checked(); }); };
        return evaluatorModalDlg;
    })();
    schoolAdmin.evaluatorModalDlg = evaluatorModalDlg;
    //jedna line jednoho evaluatora
    var evaluatorLang = (function (_super) {
        __extends(evaluatorLang, _super);
        function evaluatorLang() {
            _super.apply(this, arguments);
            this.checked = ko.observable(false);
        }
        return evaluatorLang;
    })(evaluatorLangLow);
    schoolAdmin.evaluatorLang = evaluatorLang;
    var avalLangs = [LMComLib.LineIds.English, LMComLib.LineIds.German, LMComLib.LineIds.Spanish, LMComLib.LineIds.French, LMComLib.LineIds.Italian, LMComLib.LineIds.Russian];
    var locLangs = {};
    locLangs[LMComLib.LineIds.English] = function () { return CSLocalize('469d05c7cef5487fb29048505902a1a8', 'English'); };
    locLangs[LMComLib.LineIds.German] = function () { return CSLocalize('94606ae1ef72415f848daeb779f0f259', 'German'); };
    locLangs[LMComLib.LineIds.Italian] = function () { return CSLocalize('66ea06373abb486dbb0dd8598b895dc6', 'Italian'); };
    locLangs[LMComLib.LineIds.Spanish] = function () { return CSLocalize('a82c4ec950354576ab605a5191ce8988', 'Spanish'); };
    locLangs[LMComLib.LineIds.French] = function () { return CSLocalize('d694058048d242459d329a9b19a15f66', 'French'); };
    locLangs[LMComLib.LineIds.Russian] = function () { return CSLocalize('ad2f4d121a3d4518a035ea7949473dc4', 'Russian'); };
    //*************************************************************
    //  TODO: rozsirena varianta assign formulare: vstupni data jsou v excelu, do formulare se provadi PASTE identifikaci testu
    //*************************************************************
    var HumanEvalManagerEx = (function (_super) {
        __extends(HumanEvalManagerEx, _super);
        function HumanEvalManagerEx(urlParts) {
            _super.call(this, schoolAdmin.humanEvalManagerExTypeName, urlParts);
        }
        // UPDATE
        HumanEvalManagerEx.prototype.update = function (completed) {
            completed();
        };
        return HumanEvalManagerEx;
    })(schoolAdmin.CompModel);
    schoolAdmin.HumanEvalManagerEx = HumanEvalManagerEx;
    //Pager.registerAppLocator(appId, humanEvalManagerLangsTypeName,(urlParts, completed) => completed(new HumanEvalManagerLangs(urlParts)));
    //Pager.registerAppLocator(appId, humanEvalManagerTypeName,(urlParts, completed) => completed(new HumanEvalManager(urlParts)));
    //Pager.registerAppLocator(appId, humanEvalManagerEvsTypeName,(urlParts, completed) => completed(new HumanEvalManagerEvs(urlParts)));
    //Pager.registerAppLocator(appId, humanEvalManagerExTypeName,(urlParts, completed) => completed(new HumanEvalManagerEx(urlParts)));
    blended.oldLocators.push(function ($stateProvider) { return blended.registerOldLocator($stateProvider, schoolAdmin.humanEvalManagerLangsTypeName, schoolAdmin.appId, schoolAdmin.humanEvalManagerLangsTypeName, 1, function (urlParts) { return new HumanEvalManagerLangs(urlParts); }); });
    blended.oldLocators.push(function ($stateProvider) { return blended.registerOldLocator($stateProvider, schoolAdmin.humanEvalManagerTypeName, schoolAdmin.appId, schoolAdmin.humanEvalManagerTypeName, 2, function (urlParts) { return new HumanEvalManager(urlParts); }); });
    blended.oldLocators.push(function ($stateProvider) { return blended.registerOldLocator($stateProvider, schoolAdmin.humanEvalManagerEvsTypeName, schoolAdmin.appId, schoolAdmin.humanEvalManagerEvsTypeName, 1, function (urlParts) { return new HumanEvalManagerEvs(urlParts); }); });
    blended.oldLocators.push(function ($stateProvider) { return blended.registerOldLocator($stateProvider, schoolAdmin.humanEvalManagerExTypeName, schoolAdmin.appId, schoolAdmin.humanEvalManagerExTypeName, 1, function (urlParts) { return new HumanEvalManagerEx(urlParts); }); });
})(schoolAdmin || (schoolAdmin = {}));
