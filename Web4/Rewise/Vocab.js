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
/// <reference path="Book.ts" />
/// <reference path="Lesson.ts" />
var Vocab;
(function (Vocab) {
    var typeName = "VocabModel";

    //function RootData() { return Rewise.RootData; }
    function RootModel() {
        return Pager.rootVM;
    }

    var Page = (function (_super) {
        __extends(Page, _super);
        function Page(rew) {
            _super.call(this, typeName);
            this.expLine = ko.observable(undefined);
            this.books = [];

            //this.rew = rew;
            this.adjustUrl();
        }
        Page.prototype.update = function (completed) {
            RootModel().Title('Vocabulary');
            /*
            Rewise.adjustRewise(this.rew, (changed:boolean) => {
            if (changed) {
            var line = Rewise.GetLine();
            var cnt = 0;
            this.Books = _.map(line.Groups, (grp: Rew.BookGroupSrc) => {
            if (grp.Books.length == 1) {
            var res = { Multi: false, Data: new Book.Page(grp.Books[0], this) };
            this.books.push(res.Data);
            return res;
            } else {
            var c = cnt++;
            return <any>{
            Multi: true,
            //Collapsed: this.expLine() != c,
            DataId: c,
            Data: grp,
            Books: _.map(grp.Books, (bk: Rew.BookSrc) => {
            var res = { Multi: false, Data: new Book.Page(bk, this) };
            this.books.push(res.Data);
            return res;
            })
            };
            }
            });
            }
            completed();
            });
            */
        };

        //saveStatus() { View.saveStatus(this); }
        Page.prototype.book = function (sender, par) {
            Pager.navigateTo2(getBook(parseInt(par)));
        };
        return Page;
    })(Rewise.Model);
    Vocab.Page = Page;

    Vocab.View;

    Vocab.vocabPage = null;

    //**** pages pro navigaci (pro vytvoreni hash), pro Pager.navigateTo2
    function getPage(rew) {
        //if (vocabPage == null || !Rewise.RewEq(rew, vocabPage.rew)) vocabPage = new Page(rew);
        return Vocab.vocabPage;
    }
    Vocab.getPage = getPage;
    function getBook(bkId) {
        if (Vocab.vocabPage == null)
            throw 'Vocab.getBook: vocabPage == null';
        var bk = _.find(Vocab.vocabPage.books, function (b) {
            return b.Book.DbId == bkId;
        });
        if (bk == null)
            throw 'Vocab.getBook: bk == null';
        return bk;
    }

    //navigated: najdi page dle hash
    function findVocab(url) {
        if (Vocab.vocabPage == null)
            return null;
        if (Vocab.vocabPage.hash != url.path[0])
            return null;
        return Vocab.vocabPage;
    }
    function findBook(url) {
        var vocab = findVocab(url);
        if (vocab == null)
            return null;
        return _.find(Vocab.vocabPage.books, function (b) {
            return b.hash == url.path[1];
        });
    }
    function findLesson(url) {
        var bk = findBook(url);
        if (bk == null)
            return null;
        return _.find(bk.Lessons, function (l) {
            return l.hash == url.path[2];
        });
    }
    function findFact(url) {
        var less = findLesson(url);
        if (less == null)
            return null;
        return _.find(less.Facts, function (f) {
            return f.hash == url.path[3];
        });
    }
    Pager.registerLocator(typeName, function (url) {
        return findVocab(url);
    });
    Pager.registerLocator(Book.typeName, function (url) {
        return findBook(url);
    });
    Pager.registerLocator(Lesson.typeName, function (url) {
        return findLesson(url);
    });
    Pager.registerLocator(Fact.typeName, function (url) {
        return findFact(url);
    });
})(Vocab || (Vocab = {}));
