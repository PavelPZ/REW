module vsNet {

  var exModelTypeName = "vsNetExModel".toLowerCase();
  var modModelTypeName = "vsNetModModel".toLowerCase();

  export class ModModel extends Pager.Page {
    constructor(urlParts: string[]) {
      super(appId, exModelTypeName, urlParts);
      this.url = urlParts[0];
    }
    url: string;
  }

  export class ExModel extends Pager.Page {
    constructor(urlParts: string[]) {
      super(appId, exModelTypeName, urlParts);
      this.url = urlParts[0];
      ex = null; persistMemory.reset();
    }
    url: string;
    ex: CourseMeta.exImpl;
    seeAlsoTemplateSmall = ko.observable<string>("Dummy");
    seeAlsoTemplate = ko.observable<string>("Dummy");
    exerciseEvaluated = ko.observable<boolean>(false); //cviceni je vyhodnocenu
    score = ko.observable<string>(null);
    instrBody = ko.observable<string>(null);
    cpv: schoolCpv.model;
    update(completed: () => void): void {
      var th = this;
      //CourseMeta.lib.adjustInstr(() => { //nacteni a lokalizace Schools\EAData\instructions.json
        CourseMeta.load(th.url, (pgJsonML: Array<any>) => {
          var pg = CourseMeta.extractEx(pgJsonML);
          Course.localize(pg, s => CourseMeta.localizeString('', s, null));
          //pg.instrTitle = CourseMeta.localizeString('', pg.instrTitle,null);
          if (!ex) {
            ex = new CourseMeta.exImpl();
            ex.type = CourseMeta.runtimeType.ex;
            ex.url = th.url;
            CourseMeta.actNode = ex;
            if (cfg.forceEval) { ex.designForceEval = true; ex.done = true; }
          }
          this.ex = ex;
          ex.title = pg.title; ex.url = pg.url;
          ex.onSetPage(pg, null);
          CourseMeta.lib.displayEx(ex,
            loadedEx => {
              this.cpv = new schoolCpv.model(schools.tExCpv, null);
            }, loadedEx => {
              boot.minInit();
              //napln instrukce
              CourseMeta.instructions = {};
              CourseMeta.loadFiles(_.map(th.ex.page.instrs, s => '..' + s + '.js'), instrs => {
                for(var i = 0; i < instrs.length; i++) CourseMeta.finishInstr(th.ex.page.instrs[i], JSON.parse(instrs[i]), {});
              });
              //pouzij instrukce
              th.instrBody(_.map(th.ex.page.instrs, (s: string) => { var res = CourseMeta.instructions[s.toLowerCase()]; return res ? res : (_.isEmpty(s) ? "" : "Missing [" + s + "] instruction"); }).join());
              th.refreshExerciseBar();
            });
          //completed();
        });
      //});
    }

    htmlClearing() {
      if (CourseMeta.actExPageControl && CourseMeta.actExPageControl.sndPage) CourseMeta.actExPageControl.sndPage.htmlClearing();
    }

    title() { return this.ex.title; }
    iconId(): string { return 'edit'; }
    resetClick() { this.ex.reset(); this.refreshExerciseBar(); }
    evaluateClick() { this.ex.evaluate(); this.refreshExerciseBar(); }
    refreshExerciseBar(): void {
      var th = this;
      if (th.ex.done) {
        th.exerciseEvaluated(true);
        th.score(th.ex.page.isPassivePage() /*|| !th.ex.ms*/ ? null : (th.ex.s ? th.ex.s.toString() : '0')+ '/' + th.ex.ms.toString());
      } else {
        th.exerciseEvaluated(false);
      }
    }
  }

  var ex: CourseMeta.exImpl = null;

  //Pager.registerAppLocator(appId, exModelTypeName, (urlParts, completed) => completed(new ExModel(urlParts)));
  //Pager.registerAppLocator(appId, modModelTypeName, (urlParts, completed) => completed(new ModModel(urlParts)));

  blended.oldLocators.push($stateProvider => blended.registerOldLocator($stateProvider, exModelTypeName, appId, exModelTypeName, 1, urlParts => new ExModel(urlParts)));
  blended.oldLocators.push($stateProvider => blended.registerOldLocator($stateProvider, modModelTypeName, appId, modModelTypeName, 1, urlParts => new ModModel(urlParts)));

} 