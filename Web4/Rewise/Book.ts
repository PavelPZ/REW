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
module Book {

  export var typeName: string = "BookModel";
  function RootModel(): Rewise.RootModel { return <Rewise.RootModel>Pager.rootVM; }

  export class Page extends Rewise.Model { //loc a line se doplni automaticky
    constructor(bk: Rew.BookSrc, base: Pager.Page) {
      super(typeName, base);
      this.bkId = bk.DbId;
      this.adjustUrl();
      this.Book = bk;
    }
    bkId: number;

    Checkeds: KnockoutObservableArray<any>;
    Lessons: Lesson.Page[] = null;
    Book: Rew.BookSrc;

    update(completed: () => void ): void {
      RootModel().showOKCancel(true);
      completed();
    } finished: boolean = false;

    saveStatus() { }

    findLesson(id: number): Lesson.Page {
      return _.find(this.Lessons, (l: Lesson.Page) => l.Data.DbId == id);
    }

    lesson(sender, par: string): void {
      var id = parseInt(par);
      Pager.navigateTo2(this.findLesson(id));
    }
  }


}