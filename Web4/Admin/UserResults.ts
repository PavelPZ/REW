module schoolAdmin {
  export class UserResults extends CompModel {
    constructor(urlParts: string[]) {
      super(schoolUserResultsTypeName, urlParts);
    }
    update(completed: () => void): void {
      completed();
    }
    downloadTestReport() {
      Pager.ajax_download(
        Pager.path(Pager.pathType.restServices),
        Login.CmdReport_Create(schools.LMComUserId(), CourseMeta.actCompanyId, Login.CmdReportType.test),
        Login.CmdReport_Type);
    }
  }

  //Pager.registerAppLocator(appId, schoolUserResultsTypeName,(urlParts, completed) => completed(new UserResults(urlParts)));
  blended.oldLocators.push($stateProvider => blended.registerOldLocator($stateProvider, schoolUserResultsTypeName, appId, schoolUserResultsTypeName, 1, urlParts => new UserResults(urlParts)));
}

