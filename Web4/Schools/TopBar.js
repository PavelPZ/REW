var schools;
(function (schools) {
    var TopBarModel = (function () {
        function TopBarModel(model) {
            this.model = model;
            this.title = ko.observable('');
            this.suplCtxtGrammar = ko.observable(false); //meni cviceni: phone - dynamicka podminka na kontextovou gramatiku
            this.suplGrammarIcon = ko.observable(true); //meni cviceni: phone - dynamicka podminka na nekontextovou gramatiku
            this.exerciseEvaluated = ko.observable(false); //cviceni je vyhodnocenu
            this.exercisePassive = ko.observable(true); //cviceni je pasivni
            this.score = ko.observable(null); //score vyhodnoceneho cviceni
            var self = this;
            this.grammarClick = function () { return CourseMeta.gui.gotoData(CourseMeta.actGrammar); };
            if (this.needsLogin())
                LMStatus.setReturnUrl();
        }
        TopBarModel.prototype.is = function () {
            var _this = this;
            var typeNames = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                typeNames[_i - 0] = arguments[_i];
            }
            return _.find(typeNames, function (t) { return t == _this.model.type; }) != null;
        };
        //title
        TopBarModel.prototype.isTitle = function () { return this.is(schools.tTest); };
        //logo
        TopBarModel.prototype.logoBig = function () { return !this.logoSmall() && !this.is(schools.tEx); }; //this.is(tMy); }
        TopBarModel.prototype.logoSmall = function () { return this.is(schools.tCourseMeta, schools.tCoursePretest, schools.tGrammFolder, schools.tGrammPage, schools.tGrammContent, schools.tDictInfo, schools.tTest); };
        TopBarModel.prototype.greenArrow = function () { return !this.needsLogin() && this.is(schools.tCourseMeta, schools.tCoursePretest, schools.tEx); };
        TopBarModel.prototype.phoneMore = function () { return !this.needsLogin() && this.is(schools.tMy /*, tHome*/) ? "#collapse-logout" : null; }; //pokud je phone, id DIVu s more informaci, #collapse-more nebo #collapse-more-ex
        //login x logout x profile
        TopBarModel.prototype.logoutAndProfile = function () { return this.isWeb() && !this.needsLogin() && this.is(schools.tMy /*, /*, tHome*/); };
        TopBarModel.prototype.needsLogin = function () { return this.isWeb() && !LMStatus.isLogged(); };
        TopBarModel.prototype.loginUrl = function () {
            if (!this.needsLogin())
                return null;
            if (cfg.logins && cfg.logins.length == 1)
                switch (cfg.logins[0]) {
                    case LMComLib.OtherType.LANGMaster: return "#" + Login.getHash(Login.pageLmLogin);
                    case LMComLib.OtherType.LANGMasterNoEMail: return "#" + Login.getHash(Login.pageLmLoginNoEMail);
                    default: return "#" + Login.getHash(Login.pageLogin);
                }
            else
                return "#" + Login.getHash(Login.pageLogin);
        };
        TopBarModel.prototype.isWeb = function () { return cfg.target == LMComLib.Targets.web; };
        //supplements
        TopBarModel.prototype.hasSupl = function () { return true; };
        //suplGrammarLink(): boolean { return !this.needsLogin() && this.is(tCourseMeta, tCourse, tLess, tMod, tEx) && schools.data.crsStatic2.grammar != null; } //pro ne-phone: staticka podminka na nekontextovou gramatika
        TopBarModel.prototype.suplGrammarLink = function () { return !this.needsLogin() && this.is(schools.tCourseMeta, schools.tEx) && CourseMeta.actGrammar != null; }; //pro ne-phone: staticka podminka na nekontextovou gramatika
        TopBarModel.prototype.suplDict = function () { return !this.needsLogin() && this.is(schools.tEx, schools.tGrammPage) && DictConnector.actDictData != null; /*cfg.dictType!=schools.dictTypes.no;*/ }; //pomocna stranka s vysvetlenim slovniku
        TopBarModel.prototype.suplEval = function () { return !this.needsLogin() && this.is(schools.tEx); }; //informace o vyhodnocenem cviceni
        TopBarModel.prototype.resetClick = function () { CourseMeta.actEx.reset(); return false; }; //??(<schoolEx.Model>(Pager.ActPage)).reset(); }
        TopBarModel.prototype.dictClick = function () { LMStatus.setReturnUrlAndGoto(schools.createDictIntroUrl()); };
        TopBarModel.prototype.suplInstr = function () { return !this.needsLogin() && this.is(schools.tEx); };
        TopBarModel.prototype.suplVocabulary = function () {
            return false;
            //if (!cfg.vocabulary || !this.is(tLess, tMod, tEx)) return false;
            //var lesJson = this.model.myLessonjsonId(); if (lesJson == null) return false;
            //var id = prods.rewLessonId(lesJson); if (id == 0) return false;
            //return true;
        };
        TopBarModel.prototype.vocabularyClick = function () { alert("vocabularyClick"); };
        TopBarModel.prototype.suplBreadcrumb = function () { return !this.needsLogin() && this.is(schools.tEx); };
        //navrat do kurzu pro supplements
        TopBarModel.prototype.backToCourse = function () { return this.is(schools.tDictInfo, schools.tGrammFolder, schools.tGrammPage, schools.tGrammContent, (typeof schoolAdmin == 'undefined' ? '' : schoolAdmin.schoolUserResultsTypeName)) && LMStatus.isReturnUrl(); };
        TopBarModel.prototype.backToCourseClick = function () { LMStatus.gotoReturnUrl(); }; //Pager.navigateTo(getReturnUrl()); }
        return TopBarModel;
    })();
    schools.TopBarModel = TopBarModel;
})(schools || (schools = {}));
