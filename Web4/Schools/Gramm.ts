module CourseMeta {

  export class DictInfoModel extends schools.Model {

    constructor(urlParts: string[]) { super(schools.tDictInfo, urlParts); }

    doUpdate(completed: () => void): void { completed(); }
    bodyTmpl = "TSchoolDictInfoBody";
    title() { return CSLocalize('0f6df5cdf72342198616971c1c7c8419', 'Bilingual Dictionary'); }
  }

  export class GrModel extends MetaModel {
    grammContentClick() { Pager.navigateToHash(schools.createGrammUrl(schools.tGrammContent, "")); }
    prevNextVisible = true;
  }

  export class GrFolder extends GrModel {
    constructor(urlParts: string[]) {
      super(schools.tGrammFolder, urlParts);
    }

    ignorePrevNext = true;
    idxFrom(): string { return CSLocalize('fe6997da0e5e407288cda87e156820a0', 'Content'); }

    bodyTmpl = "TGramm_Folder";
  }

  export class GrContent extends GrModel {
    constructor(urlParts: string[]) {
      super(schools.tGrammContent, urlParts);
    }
    breadcrumbs(): schools.ILink[] { return []; }
    title() { return CourseMeta.actGrammar.title + ", " + CSLocalize('49dd8f327c6f484aaff1c9412690b970', 'content'); }
    prevNextVisible = false;
    bodyTmpl = "TSchoolGrammContentBody";
  }


  export class GrPage extends GrModel {

    constructor(urlParts: string[]) { super(schools.tGrammPage, urlParts); }

    doUpdate(completed: () => void): void {
      lib.onChangeUrl(this.productUrl, this.persistence, this.url, loadedEx =>
        lib.doRefresh(() =>
          lib.displayEx(loadedEx, null, loadedEx => DictConnector.initDict(actGrammarModule.dict))));
    }

    //Prev x Next pro gramatiku
    hasPrev(): boolean { return !!actGrammarEx.prev; }
    hasNext(): boolean { return !!actGrammarEx.next; }
    prevClick() { gui.gotoData(actGrammarEx.prev); }
    nextClick() { gui.gotoData(actGrammarEx.next); }
    idxFrom(): string { return (actGrammarEx.idx + 1).toString() + "/" + actGrammarExCount.toString() + ": " + CSLocalize('5592859748ca440d97b0e2bcdd1ff22b', 'content'); }

    exerciseHtml(): string { return JsRenderTemplateEngine.render("c_gen", actGrammarEx.page); }
    exerciseCls: string;
    bodyTmpl = "TSchoolGrammBody";

  }

  Pager.registerAppLocator(schools.appId, schools.tDictInfo, (urlParts, completed) => completed(new DictInfoModel(urlParts)));
  Pager.registerAppLocator(schools.appId, schools.tGrammFolder, (urlParts, completed) => completed(new GrFolder(urlParts)));
  Pager.registerAppLocator(schools.appId, schools.tGrammPage, (urlParts, completed) => completed(new GrPage(urlParts)));
  Pager.registerAppLocator(schools.appId, schools.tGrammContent, (urlParts, completed) => completed(new GrContent(urlParts)));
}

