var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var schoolAdmin;
(function (schoolAdmin) {
    var UserResults = (function (_super) {
        __extends(UserResults, _super);
        function UserResults(urlParts) {
            _super.call(this, schoolAdmin.schoolUserResultsTypeName, urlParts);
        }
        UserResults.prototype.update = function (completed) {
            completed();
        };
        UserResults.prototype.downloadTestReport = function () {
            Pager.ajax_download(Pager.path(Pager.pathType.restServices), Login.CmdReport_Create(schools.LMComUserId(), CourseMeta.actCompanyId, Login.CmdReportType.test), Login.CmdReport_Type);
        };
        return UserResults;
    })(schoolAdmin.CompModel);
    schoolAdmin.UserResults = UserResults;
    //Pager.registerAppLocator(appId, schoolUserResultsTypeName,(urlParts, completed) => completed(new UserResults(urlParts)));
    blended.oldLocators.push(function ($stateProvider) { return blended.registerOldLocator($stateProvider, schoolAdmin.schoolUserResultsTypeName, schoolAdmin.appId, schoolAdmin.schoolUserResultsTypeName, 1, function (urlParts) { return new UserResults(urlParts); }); });
})(schoolAdmin || (schoolAdmin = {}));
