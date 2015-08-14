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
/// <reference path="../JsLib/jsd/underscore.d.ts" />
/// <reference path="GenLMComLib.ts" />
/// <reference path="GenRw.ts" />
/// <reference path="GenRew.ts" />
/// <reference path="Model.ts" />
/// <reference path="Lesson.ts" />
/// <reference path="Vocab.ts" />
/// <reference path="RwPersist.ts" />
var Book;
(function (Book) {
    Book.typeName = "BookModel";
    function RootModel() {
        return Pager.rootVM;
    }

    var Page = (function (_super) {
        __extends(Page, _super);
        function Page(bk, base) {
            _super.call(this, Book.typeName, base);
            this.Lessons = null;
            this.finished = false;
            this.bkId = bk.DbId;
            this.adjustUrl();
            this.Book = bk;
        }
        Page.prototype.update = function (completed) {
            RootModel().showOKCancel(true);
            completed();
        };

        Page.prototype.saveStatus = function () {
        };

        Page.prototype.findLesson = function (id) {
            return _.find(this.Lessons, function (l) {
                return l.Data.DbId == id;
            });
        };

        Page.prototype.lesson = function (sender, par) {
            var id = parseInt(par);
            Pager.navigateTo2(this.findLesson(id));
        };
        return Page;
    })(Rewise.Model);
    Book.Page = Page;
})(Book || (Book = {}));
