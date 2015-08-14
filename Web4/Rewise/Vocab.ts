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
module Vocab {

  var typeName: string = "VocabModel";
  //function RootData() { return Rewise.RootData; }
  function RootModel(): Rewise.RootModel { return <Rewise.RootModel>Pager.rootVM; }

  export class Page extends Rewise.Model {
    constructor(rew: Rew.LangToLearn) {
      super(typeName);
      //this.rew = rew;
      this.adjustUrl();
    }
    expLine = ko.observable < LMComLib.LineIds>(<LMComLib.LineIds>undefined);
    Books: any[]; //seznam: grupy nebo knihy
    books: Book.Page[] = []; //linearni seznam knih

    update(completed: () => void ): void {
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
    }
    //saveStatus() { View.saveStatus(this); }

    book(sender, par: string): void {
      Pager.navigateTo2(getBook(parseInt(par))); 
    }
  }

  export var View: Rewise.IView;

  export var vocabPage: Page = null;

  //**** pages pro navigaci (pro vytvoreni hash), pro Pager.navigateTo2
  export function getPage(rew: Rew.LangToLearn): Page {
    //if (vocabPage == null || !Rewise.RewEq(rew, vocabPage.rew)) vocabPage = new Page(rew);
    return vocabPage;
  }
  function getBook(bkId: number): Book.Page {
    if (vocabPage == null) throw 'Vocab.getBook: vocabPage == null';
    var bk: Book.Page = _.find(vocabPage.books, (b: Book.Page) => b.Book.DbId==bkId);
    if (bk == null) throw 'Vocab.getBook: bk == null';
    return bk;
  }

  //navigated: najdi page dle hash
  function findVocab(url:Pager.UrlEx): Page {
    if (vocabPage == null) return null;
    if (vocabPage.hash != url.path[0]) return null;
    return vocabPage;
  }
  function findBook(url:Pager.UrlEx):Book.Page { 
    var vocab = findVocab(url);
    if (vocab == null) return null;
    return _.find(vocabPage.books, (b: Book.Page) => b.hash==url.path[1]);
  }
  function findLesson(url:Pager.UrlEx):Lesson.Page {
    var bk = findBook(url);
    if (bk == null) return null;
    return _.find(bk.Lessons, (l: Lesson.Page) => l.hash==url.path[2]);
  }
  function findFact(url:Pager.UrlEx):Fact.Page {
    var less = findLesson(url);
    if (less == null) return null;
    return _.find(less.Facts, (f: Fact.Page) => f.hash==url.path[3]);
  }
  Pager.registerLocator(typeName, (url:Pager.UrlEx) => findVocab(url));
  Pager.registerLocator(Book.typeName, (url:Pager.UrlEx) => findBook(url));
  Pager.registerLocator(Lesson.typeName, (url:Pager.UrlEx) => findLesson(url));
  Pager.registerLocator(Fact.typeName, (url:Pager.UrlEx) => findFact(url));
}