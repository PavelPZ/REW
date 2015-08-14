/// <reference path="../JsLib/jsd/jquery.d.ts" />
/// <reference path="../JsLib/jsd/knockout.d.ts" />
/// <reference path="../JsLib/jsd/jsrender.d.ts" />
/// <reference path="../JsLib/js/ModelBase.ts" />
/// <reference path="GenLMComLib.ts" />
/// <reference path="GenRw.ts" />
/// <reference path="GenRew.ts" />
/// <reference path="Model.ts" />
/// <reference path="RwPersist.ts" />
/// <reference path="Fact.ts" /> 
module Lesson {

  export var typeName: string = "LessonModel";
  //function RootData() { return Rewise.RootData; }
  function RootModel(): Rewise.RootModel { return <Rewise.RootModel>Pager.rootVM; }

  export class Page extends Rewise.Model { //loc a line se doplni automaticky
    constructor(data: Rew.LessonSrc, base: Pager.Page, enabled: boolean, isMyLess: boolean) {
      super(typeName, base);
      this.adjustUrl();
      this.Data = data;
      this.Enabled = enabled;
      this.IsMyLess = isMyLess;
      this.Checked = !enabled;
    }
    Data: Rew.LessonSrc;
    Facts: Fact.Page[];
    setFacts(facts: Rew.MyFact[]): void {
      if (this.Facts!=null || facts==null || facts.length==0) return;
      this.Facts = _.map(facts, (f: Rew.MyFact) => {
        var res = new Fact.Page(f.FactId, this, f);
        res.Question = f.Question[0].Text; res.Answer = f.Answer[0].Text; res.Type = f.Type; res.Data = f;
        return res;
      });
    }

    Enabled: boolean;
    IsMyLess: boolean;
    Checked: boolean;

    update(completed: () => void ): void {
      RootModel().showOKCancel(true);
      RootModel().OKClick = () => { Pager.viewServices.back(); };
      /*
      if (this.Data.Facts != null && this.Data.Facts.length > 0) { this.setFacts(this.Data.Facts); completed(); }
      else RwPersist.readLesson(this.rew.Loc, this.Data.DbId, l => {
        this.Data.Facts = l.Facts;
        this.setFacts(l.Facts);
        completed();
      });
      */
    }
    saveStatus() { }

    findFact(id: number): Fact.Page {
      return _.find(this.Facts, (l: Fact.Page) => l.Data.DbId == id);
    }

    fact(sender, par: string): void {
      var id = parseInt(par);
      Pager.navigateTo2(this.findFact(id));
    }
  }

  export var LessonView: Rewise.IView;

}