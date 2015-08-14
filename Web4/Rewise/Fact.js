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
/// <reference path="Lesson.ts" />
var Fact;
(function (Fact) {
    Fact.typeName = "FactModel";

    //function RootData() { return Rewise.RootData; }
    function RootModel() {
        return Pager.rootVM;
    }

    var Page = (function (_super) {
        __extends(Page, _super);
        function Page(factId, base, fact) {
            _super.call(this, Fact.typeName, base);
            this.factId = factId;
            this.adjustUrl();
            this.Data = fact;
            this.Lesson = base;
        }
        Page.prototype.update = function (completed) {
            RootModel().showOKCancel(true);
            RootModel().OKClick = function () {
                Pager.viewServices.back();
            };
            completed();
        };
        Page.prototype.saveStatus = function () {
        };
        return Page;
    })(Rewise.Model);
    Fact.Page = Page;
})(Fact || (Fact = {}));
