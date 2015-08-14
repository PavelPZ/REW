/// <reference path="../JsLib/jsd/knockout.d.ts" />
/// <reference path="../JsLib/jsd/jsrender.d.ts" />
/// <reference path="../JsLib/js/ModelBase.ts" />
/// <reference path="GenLMComLib.ts" />
/// <reference path="GenRw.ts" />
/// <reference path="GenRew.ts" />
/// <reference path="RwPersist.ts" />
/// <reference path="Home.ts" />
/// <reference path="SelectLang.ts" />
/// <reference path="Vocab.ts" />
/// <reference path="Lesson.ts" />
/// <reference path="Fact.ts" />
/// <reference path="Book.ts" />
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
/*************** stavove Rewise informace ****************/
var RwSt;
(function (RwSt) {
    RwSt.LMComUserId;
    RwSt.MyRewise;
    RwSt.Options;
    RwSt.ToLearn = null;
    RwSt.Data = null;

    function NativeLang() {
        return RwSt.MyRewise.Options.NativeLang;
    }
    RwSt.NativeLang = NativeLang;

    //Home: ToLearn=null (jinak ToLearn je aktualni MyRewise]
    //Naladuje MyFacts pro aktualni MyRewise.
    //Dale naladuje staticka Rw data, odpovidajici typu Rew.LocSrc, odpovidajici aktualni MyRewise lokalizaci (pokud uz nejsou ve spravne verzi v Storage)
    function setToLearn(line, loc, completed) {
        if (RwSt.MyRewise.ToLearns == null) {
            completed();
            return;
        }
        var act = _.find(RwSt.MyRewise.ToLearns, function (l) {
            return l.Line == line && l.Loc == loc;
        });
        if (RwSt.ToLearn != null && act != null && act.Loc == RwSt.ToLearn.Loc && act.Line == RwSt.ToLearn.Line) {
            completed();
            return;
        }
        if (RwSt.ToLearn == null && act == null) {
            completed();
            return;
        }
        RwSt.ToLearn = act;
        if (RwSt.ToLearn == null) {
            RwSt.Data = null;
            completed();
        } else {
            if (RwSt.Data == null || true) {
                RwPersist.LocSrcCmd(RwSt.ToLearn.Loc, function (res) {
                    RwSt.Data = res;
                    RwPersist.LoadMyFact(completed); //naladuj MyFacts
                });
            } else
                RwPersist.LoadMyFact(completed); //naladuj MyFacts
        }
    }
    RwSt.setToLearn = setToLearn;
    function MyBookGroups(line, loc) {
        var lSrc = _.find(RwSt.Data.Lines, function (l) {
            return l.Line == line;
        });
        var lOpt = _.find(RwSt.MyRewise.Options.Lines, function (l) {
            return l.Line == line && l.Loc == loc;
        });
        return _.map(lOpt.BookIds, function (id) {
            return _.find(lSrc.Groups, function (g) {
                return g.Id == id;
            });
        });
    }
    RwSt.MyBookGroups = MyBookGroups;
})(RwSt || (RwSt = {}));

var Rewise;
(function (Rewise) {
    function InitModel(par, completed) {
        //Login
        var cook = LMStatus.getCookie();
        if (cook == null || cook.id <= 0) {
            location.href = LMStatus.loginUrl();
            completed();
            return;
        }
        RwSt.LMComUserId = cook.id;

        //Inicializace aplikace
        //Pager.setInitPageModel(new Home.Model(), new RootModel());
        //Inicializace uzivatelovych dat
        RwPersist.InitMyRewise(par.loc, function (rd) {
            RwSt.MyRewise = rd;
            completed();
        });
    }
    Rewise.InitModel = InitModel;

    function getRew(line) {
        return _.find(RwSt.MyRewise.ToLearns, function (tl) {
            return tl.Line == line;
        });
    }
    Rewise.getRew = getRew;

    var Model = (function (_super) {
        __extends(Model, _super);
        function Model(name, base) {
            if (typeof base === "undefined") { base = null; }
            _super.call(this, name, base);
        }
        return Model;
    })(Pager.ModelEx);
    Rewise.Model = Model;

    var RootModel = (function (_super) {
        __extends(RootModel, _super);
        function RootModel() {
            _super.apply(this, arguments);
            //*** Shared Header x Foote
            this.Title = ko.observable();
            this.showOKCancel = ko.observable(false);
            this.showCancel = ko.observable(false);
        }
        RootModel.prototype.navigated = function (page, completed) {
            this.showOKCancel(false);
            this.showCancel(false);
            this.OKClick = null;
            _super.prototype.navigated.call(this, page, completed);
        };

        //Dialog management
        RootModel.prototype.DialogOK = function (self, par) {
            if (this.OKClick == null)
                throw 'OKClick==null';
            this.OKClick();
        };
        return RootModel;
    })(Pager.RootModelEx);
    Rewise.RootModel = RootModel;
})(Rewise || (Rewise = {}));
