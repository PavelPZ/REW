/// <reference path="../courses/Course.ts" />

declare function $evalRoot(): Course.IScoreProvider;
//declare var exerciseInfo: schools.page;
declare var oldEAInitialization;

module CourseMeta {

  export var instructions: { [id: string]: string;} = null; 

  //export function hasCtxGramm(): bool { return actEx.page.seeAlso && actEx.page.seeAlso.length > 0; }

  export class ModelEx extends MetaModel {

    index: number; //poradove cislo cviceni

    instrTitle = ko.observable<string>("");
    instrBody = ko.observable<string>("");
    seeAlsoTemplateSmall = ko.observable<string>("Dummy");
    seeAlsoTemplate = ko.observable<string>("Dummy");
    cpv: schoolCpv.model;
    seeAlso: Array<dataImpl>;

    //seeAlsoClick(idx: number) { gui.gotoData(this.seeAlso[idx]); }
    leave() { //pred opustenim stranky
      if (actEx && actEx.page && actEx.page.sndPage) actEx.page.sndPage.leave();
    } 

    constructor(urlParts: string[]) {
      super(schools.tEx, urlParts);
      actExModel = this;
    }

    doUpdate(completed: () => void): void {
      var th = this; //var u: schools.Url = <any>this.url;
      //lib.adjustInstr(() => //nacteni a lokalizace Schools\EAData\instructions.json
      lib.onChangeUrl(th.productUrl, this.persistence, th.url, ex => //nactena data modulu, cviceni a user data
          lib.doRefresh(() =>
            lib.displayEx(ex,
              loadedEx => {
                this.cpv = new schoolCpv.model(schools.tExCpv, null);
                DictConnector.initDict(actModule.dict);
              },
              loadedEx => {
                th.instrTitle(actEx.page.instrTitle);
                th.instrBody(_.map(actEx.page.instrs, (s: string) => { var res = instructions[s.toLowerCase()]; return res ? res : (_.isEmpty(s) ? "" : "Missing [" + s + "] instruction"); }).join());
                if (actEx.page.seeAlso)
                  th.seeAlso = _.filter(_.map(actEx.page.seeAlso, lnk => actProduct.getNode(lnk.url)), n => !!n);
                if (th.seeAlso && th.seeAlso.length == 0) th.seeAlso = null;
                if (th.seeAlso) { //generace HTML s seealso
                  th.seeAlsoTemplateSmall("TSeeAlsoTemplateSmall");
                  th.seeAlsoTemplate("TSeeAlsoTemplate");
                }
                th.tb.suplCtxtGrammar(th.seeAlso != null);
                th.tb.suplGrammarIcon(th.seeAlso == null);
                refreshExerciseBar(loadedEx);
              })));
    }

    htmlClearing() {
      if (this.cpv) this.cpv.htmlClearing();
      if (actExPageControl && actExPageControl.sndPage) actExPageControl.sndPage.htmlClearing();
    }
  }

  //Pager.registerAppLocator(schools.appId, schools.tEx, (urlParts, completed) => completed(new ModelEx(urlParts)));

  blended.oldLocators.push($stateProvider => blended.registerOldLocator($stateProvider, schools.tEx, schools.appId, schools.tEx, 4, urlParts => new ModelEx(urlParts)));

}

//xx/#DEBUG
module Logger {
  export function trace_exrc(msg: string): void {
    Logger.trace("Exercise", msg);
  }
}
//xx/#ENDDEBUG
//var exrc_dict = null;


