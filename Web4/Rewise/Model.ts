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

/*************** stavove Rewise informace ****************/
module RwSt {

  export var LMComUserId: number; //lmcom UserId
  export var MyRewise: Rew.MyRewise; //prehled mojich rewises, PC signature apod.
  export var Options: Rew.MyRewiseOptions; //options
  export var ToLearn: Rew.LangToLearn = null; //aktualni MyRewise (urceny Line a Loc)
  export var Data: Rew.LocSrc = null; //aktualni staticka rewise data ve spravne lokalizaci. Pro Home je null

  export function NativeLang(): LMComLib.LineIds { return MyRewise.Options.NativeLang; } //jazyk uzivatele SW

  //Home: ToLearn=null (jinak ToLearn je aktualni MyRewise]
  //Naladuje MyFacts pro aktualni MyRewise.
  //Dale naladuje staticka Rw data, odpovidajici typu Rew.LocSrc, odpovidajici aktualni MyRewise lokalizaci (pokud uz nejsou ve spravne verzi v Storage)
  export function setToLearn(line: LMComLib.LineIds, loc: LMComLib.LineIds, completed: () => void ) {
    if (MyRewise.ToLearns == null) { completed(); return; }
    var act = _.find(MyRewise.ToLearns, (l: Rew.LangToLearn) => l.Line == line && l.Loc == loc);
    if (ToLearn != null && act != null && act.Loc == ToLearn.Loc && act.Line == ToLearn.Line) { completed(); return; } //vse OK
    if (ToLearn == null && act == null) { completed(); return; }//vse OK
    ToLearn = act;
    if (ToLearn == null) { //home page, nejsou potreba data
      Data = null;
      completed();
    } else {
      if (Data==null || true /*Data.Loc != ToLearn.Loc TODO*/) { //neodpovida lokalizace
        RwPersist.LocSrcCmd(ToLearn.Loc, res => { //naladuj staticka Rw data
          Data = res;
          RwPersist.LoadMyFact(completed); //naladuj MyFacts
        });
      } else //Data OK
        RwPersist.LoadMyFact(completed); //naladuj MyFacts
    }
  }
  export function MyBookGroups(line: LMComLib.LineIds, loc: LMComLib.LineIds) {
    var lSrc: Rew.LineSrc = _.find(Data.Lines, (l: Rew.LineSrc) => l.Line == line);
    var lOpt = _.find(MyRewise.Options.Lines, (l: Rew.MyLineOption) => l.Line == line && l.Loc == loc);
    return _.map(lOpt.BookIds, (id: number) => _.find(lSrc.Groups, (g: Rew.BookGroupSrc) => g.Id == id));
  }
}

module Rewise {

  export function InitModel(par: { loc: LMComLib.LineIds; }, completed: () => void ): void {
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
    RwPersist.InitMyRewise(par.loc, (rd) => {
      RwSt.MyRewise = rd;
      completed();
    });
  }

  export function getRew(line: LMComLib.LineIds): Rew.LangToLearn {
    return _.find(RwSt.MyRewise.ToLearns, (tl: Rew.LangToLearn) => tl.Line == line);
  }

  export class Model extends Pager.ModelEx {
    constructor(name: string, base: Pager.Page = null) {
      super(name, base);
    }
  }

  export class RootModel extends Pager.RootModelEx /*ViewModelRoot*/ {

    navigated(page: Pager.Page, completed: () => void ) {
      this.showOKCancel(false);
      this.showCancel(false);
      this.OKClick = null;
      super.navigated(page, completed);
    }
    //*** Shared Header x Foote
    Title = ko.observable<string>();
    //Dialog management
    DialogOK(self: RootModel, par: string) { if (this.OKClick == null) throw 'OKClick==null'; this.OKClick(); }
    OKClick: () => void;
    showOKCancel = ko.observable<boolean>(false);
    showCancel = ko.observable<boolean>(false);
  }

  export interface IView { //sance v SubModel.saveStatus(pg: Pager.Page) zavolat View funkce z SubModelu
    saveStatus(pg: Pager.Page): void;
  }

}