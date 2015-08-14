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
module Home {

  export var View: Rewise.IView;
  export var homePage;

  var typeName: string = "HomeModel";

  function RootModel(): Rewise.RootModel { return <Rewise.RootModel>Pager.rootVM; }

  export class Model extends Rewise.Model {
    constructor() { super(typeName); this.adjustUrl(); homePage = this; }

    update(completed: () => void ): void {
      //Test persistence
      RwPersist.Test();
      this.ToLearnsEmpty = RwSt.MyRewise.ToLearns == null || RwSt.MyRewise.ToLearns.length == 0;
      if (!this.ToLearnsEmpty) {
        this.ToLearns = _.map(RwSt.MyRewise.ToLearns, (val: Rew.LangToLearn) => new HomeToLearn(val));
        if (this.ToLearns.length > 0 && this.ExpandedLine() == undefined) this.ExpandedLine(this.ToLearns[0].Data.Line);
      }
      RootModel().Title('RE-WISE Vocabulary Builder');
      completed();
    }

    //saveStatus() { View.saveStatus(this); }
    ToLearnsEmpty: boolean = true;
    ToLearns: HomeToLearn[] = null;
    ExpandedLine = ko.observable<LMComLib.LineIds>(<LMComLib.LineIds>undefined); //prave aktualni Line

    // Pridani noveho Rewise
    addRewise(sender, par: string) {
      Pager.navigateTo2(SelectLangUrl(false));
    } //callback z GUI
    // Zmena lokalizace
    changeLoc(sender, par: string) {
      Pager.navigateTo2(SelectLangUrl(true));
    }
    // Vymazani Rewise
    removeRewise(sender, par: string) {
      if (!confirm('Opravdu vymazat?')) return;
      var line = parseInt(par);
      RwPersist.DelLessonCmd(line, () => {
        //RootData().ToLearns = _.without(RootData().ToLearns, _.find(RootData().ToLearns, (val: Rew.LangToLearn) => val.Line == line));
        //Pager.reload();
      });
    }
    // Skok na rewise
    gotoVocab(sender, par: string) {
      var line = parseInt(par);
      Pager.navigateTo2(Vocab.getPage(Rewise.getRew(line)));
    }
    gotoOwnVocab(sender, par: string) { alert('own ' + par); }
    toLearn(sender, par: string) { alert('toLearn ' + par); }
    search(sender, par: string) { alert('search ' + par); }
    logout(sender, par: string) { alert('logout ' + par); }
  }

  export class HomeToLearn {
    constructor(public Data: Rew.LangToLearn) {
      this.Title = this.Data.Line == LMComLib.LineIds.English ? 'English' : 'German';
    }
    Title: string;
  }

  function SelectLangUrl(isLoc: boolean) {
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
  } var _getLocUrl: SelectLang.Page; var _getLineUrl: SelectLang.Page;

  Pager.registerLocator(typeName, url => homePage);

}

