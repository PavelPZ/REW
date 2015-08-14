var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
/// <reference path="../JsLib/jsd/jquery.d.ts" />
/// <reference path="../JsLib/jsd/knockout.d.ts" />
/// <reference path="../JsLib/jsd/jsrender.d.ts" />
/// <reference path="../JsLib/js/ModelBase.ts" />
/// <reference path="GenLMComLib.ts" />
/// <reference path="GenRw.ts" />
/// <reference path="GenRew.ts" />
/// <reference path="Model.ts" />
/// <reference path="RwPersist.ts" />
/// <reference path="SelectLang.ts" />
/// <reference path="Vocab.ts" />
var Home;
(function (Home) {
    Home.View;
    Home.homePage;

    var typeName = "HomeModel";

    function RootModel() {
        return Pager.rootVM;
    }

    var Model = (function (_super) {
        __extends(Model, _super);
        function Model() {
            _super.call(this, typeName);
            //saveStatus() { View.saveStatus(this); }
            this.ToLearnsEmpty = true;
            this.ToLearns = null;
            this.ExpandedLine = ko.observable(undefined);
            this.adjustUrl();
            Home.homePage = this;
        }
        Model.prototype.update = function (completed) {
            //Test persistence
            RwPersist.Test();
            this.ToLearnsEmpty = RwSt.MyRewise.ToLearns == null || RwSt.MyRewise.ToLearns.length == 0;
            if (!this.ToLearnsEmpty) {
                this.ToLearns = _.map(RwSt.MyRewise.ToLearns, function (val) {
                    return new HomeToLearn(val);
                });
                if (this.ToLearns.length > 0 && this.ExpandedLine() == undefined)
                    this.ExpandedLine(this.ToLearns[0].Data.Line);
            }
            RootModel().Title('RE-WISE Vocabulary Builder');
            completed();
        };

        // Pridani noveho Rewise
        Model.prototype.addRewise = function (sender, par) {
            Pager.navigateTo2(SelectLangUrl(false));
        };

        // Zmena lokalizace
        Model.prototype.changeLoc = function (sender, par) {
            Pager.navigateTo2(SelectLangUrl(true));
        };

        // Vymazani Rewise
        Model.prototype.removeRewise = function (sender, par) {
            if (!confirm('Opravdu vymazat?'))
                return;
            var line = parseInt(par);
            RwPersist.DelLessonCmd(line, function () {
                //RootData().ToLearns = _.without(RootData().ToLearns, _.find(RootData().ToLearns, (val: Rew.LangToLearn) => val.Line == line));
                //Pager.reload();
            });
        };

        // Skok na rewise
        Model.prototype.gotoVocab = function (sender, par) {
            var line = parseInt(par);
            Pager.navigateTo2(Vocab.getPage(Rewise.getRew(line)));
        };
        Model.prototype.gotoOwnVocab = function (sender, par) {
            alert('own ' + par);
        };
        Model.prototype.toLearn = function (sender, par) {
            alert('toLearn ' + par);
        };
        Model.prototype.search = function (sender, par) {
            alert('search ' + par);
        };
        Model.prototype.logout = function (sender, par) {
            alert('logout ' + par);
        };
        return Model;
    })(Rewise.Model);
    Home.Model = Model;

    var HomeToLearn = (function () {
        function HomeToLearn(Data) {
            this.Data = Data;
            this.Title = this.Data.Line == 1 /* English */ ? 'English' : 'German';
        }
        return HomeToLearn;
    })();
    Home.HomeToLearn = HomeToLearn;

    function SelectLangUrl(isLoc) {
        //if (_getLocUrl == null) {
        //  _getLocUrl = new SelectLang.Page(true, (loc: LMComLib.LineIds, completed: () => void) => {
        //  });
        //  _getLineUrl = new SelectLang.Page(false, (line: LMComLib.LineIds, completed: () => void) => {
        //    RwPersist.AddRewiseCmd(line, RwSt.NativeLang(), () => {
        //      homePage.expLine(line);
        //      completed();
        //    })
        //  });
        //  var getProc = (url: Pager.Url) => url.toString() == _getLocUrl.url.toString() ? _getLocUrl : _getLineUrl;
        //  Pager.registerLocator(SelectLang.typeName, getProc);
        //}
        return isLoc ? _getLocUrl : _getLineUrl;
    }
    var _getLocUrl;
    var _getLineUrl;

    Pager.registerLocator(typeName, function (url) {
        return Home.homePage;
    });
})(Home || (Home = {}));
