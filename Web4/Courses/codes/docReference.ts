module docreference {

  export interface IPars {
    forRename: boolean;
  }

  export class ext implements Course.IExtension {

    data: metaJS.xsdObj;
    pars: IPars;

    constructor(public control: Course.extensionImpl) {
      this.data = metaJS.metaObj;
      this.pars = control.cdata ? JSON.parse(control.cdata) : {};
    }
    getTemplateId(): string { return 'docxsd';}
    jsonMLParsed: (self: Course.extensionImpl) => void;
    provideData: (self: Course.extensionImpl) => void;
    acceptData: (self: Course.extensionImpl, pageDone: boolean) => void;
    setScore: (self: Course.extensionImpl) => void;
    pageCreated: (self: Course.extensionImpl) => void;
    createResult: (self: Course.extensionImpl, forceEval: boolean) => CourseModel.extensionResult;
    initProc: (phase: Course.initPhase, getTypeOnly: boolean, completed: () => void) => Course.initPhaseType;
  }

}