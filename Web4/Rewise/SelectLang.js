/// <reference path="../JsLib/jsd/jquery.d.ts" />
/// <reference path="../JsLib/jsd/knockout.d.ts" />
/// <reference path="../JsLib/jsd/jsrender.d.ts" />
/// <reference path="../JsLib/jsd/underscore.d.ts" />
/// <reference path="../JsLib/js/ModelBase.ts" />
/// <reference path="GenLMComLib.ts" />
/// <reference path="GenRw.ts" />
/// <reference path="GenRew.ts" />
/// <reference path="Model.ts" />
/// <reference path="Home.ts" />
/// <reference path="RwPersist.ts" />
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var SelectLang;
(function (SelectLang) {
    SelectLang.typeName = "SelectLangModel";

    //function RootData() { return Rewise.RootData; }
    function RootModel() {
        return Pager.rootVM;
    }

    var Page = (function (_super) {
        __extends(Page, _super);
        function Page(isLoc, callback) {
            _super.call(this, SelectLang.typeName);
            this.isLoc = isLoc;
            this.locs = null;
            this.adjustUrl();
            this.callback = callback;
        }
        Page.prototype.update = function (completed) {
            //RootModel().Title(this.isLoc ? 'Select native language' : 'Select language to learn');
            //RootModel().showCancel(true);
            ////langs, ktere se nesmeji objevit v seznamu
            //var wrongLoc: LMComLib.LineIds[] = this.isLoc ? [RwSt.NativeLang()] : _.map(RwSt.MyRewise.ToLearns, (val: Rew.LangToLearn) => val.Line);
            ////seznam validnich objektu
            //this.locs =
            //  _.reject(
            //    _.map(
            //      Rew.LangTitles,
            //      (val: any, key?: string) => <loc>{ title: val, lang: parseInt(key) }),
            //    (l: loc) => _.indexOf(wrongLoc, l.lang) >= 0);
            //completed();
        };
        Page.prototype.saveStatus = function () {
        };

        Page.prototype.select = function (sender, par) {
            var line = parseInt(par);
            this.callback(line, Pager.viewServices.back);
        };
        return Page;
    })(Rewise.Model);
    SelectLang.Page = Page;
})(SelectLang || (SelectLang = {}));
