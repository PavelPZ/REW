/// <reference path="../jslib/js/GenLMComLib.ts" />
var Login;
(function (Login) {
    (function (CmdLmLoginError) {
        CmdLmLoginError[CmdLmLoginError["no"] = 0] = "no";
        CmdLmLoginError[CmdLmLoginError["userExist"] = 1] = "userExist";
        CmdLmLoginError[CmdLmLoginError["cannotFindUser"] = 2] = "cannotFindUser";
        CmdLmLoginError[CmdLmLoginError["passwordNotExists"] = 3] = "passwordNotExists";
    })(Login.CmdLmLoginError || (Login.CmdLmLoginError = {}));
    var CmdLmLoginError = Login.CmdLmLoginError;
    (function (Role) {
        Role[Role["Admin"] = 1] = "Admin";
        Role[Role["Comps"] = 2] = "Comps";
        Role[Role["All"] = 255] = "All";
    })(Login.Role || (Login.Role = {}));
    var Role = Login.Role;
    (function (EnterLicenceResult) {
        EnterLicenceResult[EnterLicenceResult["ok"] = 0] = "ok";
        EnterLicenceResult[EnterLicenceResult["added"] = 1] = "added";
        EnterLicenceResult[EnterLicenceResult["used"] = 2] = "used";
        EnterLicenceResult[EnterLicenceResult["wrongId"] = 3] = "wrongId";
        EnterLicenceResult[EnterLicenceResult["wrongCounter"] = 4] = "wrongCounter";
    })(Login.EnterLicenceResult || (Login.EnterLicenceResult = {}));
    var EnterLicenceResult = Login.EnterLicenceResult;
    (function (CmdReportType) {
        CmdReportType[CmdReportType["evaluators"] = 0] = "evaluators";
        CmdReportType[CmdReportType["test"] = 1] = "test";
    })(Login.CmdReportType || (Login.CmdReportType = {}));
    var CmdReportType = Login.CmdReportType;
    Login.CmdAdjustUser_Type = 'Login.CmdAdjustUser';
    function CmdAdjustUser_Create(provider, providerId, email, firstName, lastName) {
        return { provider: provider, providerId: providerId, email: email, firstName: firstName, lastName: lastName };
    }
    Login.CmdAdjustUser_Create = CmdAdjustUser_Create;
    Login.CmdAdjustScormUser_Type = 'Login.CmdAdjustScormUser';
    function CmdAdjustScormUser_Create(companyHost, login, firstName, lastName, isNotAttempted, productId) {
        return { companyHost: companyHost, login: login, firstName: firstName, lastName: lastName, isNotAttempted: isNotAttempted, productId: productId };
    }
    Login.CmdAdjustScormUser_Create = CmdAdjustScormUser_Create;
    Login.CmdConfirmRegistration_Type = 'Login.CmdConfirmRegistration';
    function CmdConfirmRegistration_Create(lmcomId, sessionId) {
        return { lmcomId: lmcomId, sessionId: sessionId };
    }
    Login.CmdConfirmRegistration_Create = CmdConfirmRegistration_Create;
    Login.CmdChangePassword_Type = 'Login.CmdChangePassword';
    function CmdChangePassword_Create(oldPassword, newPassword, lmcomId, sessionId) {
        return { oldPassword: oldPassword, newPassword: newPassword, lmcomId: lmcomId, sessionId: sessionId };
    }
    Login.CmdChangePassword_Create = CmdChangePassword_Create;
    Login.CmdLmLogin_Type = 'Login.CmdLmLogin';
    function CmdLmLogin_Create(login, email, password, otherData, ticket) {
        return { login: login, email: email, password: password, otherData: otherData, ticket: ticket };
    }
    Login.CmdLmLogin_Create = CmdLmLogin_Create;
    Login.CmdMyInit_Type = 'Login.CmdMyInit';
    function CmdMyInit_Create(lmcomId, sessionId) {
        return { lmcomId: lmcomId, sessionId: sessionId };
    }
    Login.CmdMyInit_Create = CmdMyInit_Create;
    Login.CmdSaveDepartment_Type = 'Login.CmdSaveDepartment';
    function CmdSaveDepartment_Create(userId, companyId, departmentId) {
        return { userId: userId, companyId: companyId, departmentId: departmentId };
    }
    Login.CmdSaveDepartment_Create = CmdSaveDepartment_Create;
    Login.CmdProfile_Type = 'Login.CmdProfile';
    function CmdProfile_Create(Cookie, lmcomId, sessionId) {
        return { Cookie: Cookie, lmcomId: lmcomId, sessionId: sessionId };
    }
    Login.CmdProfile_Create = CmdProfile_Create;
    Login.CmdRegister_Type = 'Login.CmdRegister';
    function CmdRegister_Create(password, subSite, Cookie, lmcomId, sessionId) {
        return { password: password, subSite: subSite, Cookie: Cookie, lmcomId: lmcomId, sessionId: sessionId };
    }
    Login.CmdRegister_Create = CmdRegister_Create;
    Login.CmdEnterLicKey_Type = 'Login.CmdEnterLicKey';
    function CmdEnterLicKey_Create(CompLicId, Counter, lmcomId, sessionId) {
        return { CompLicId: CompLicId, Counter: Counter, lmcomId: lmcomId, sessionId: sessionId };
    }
    Login.CmdEnterLicKey_Create = CmdEnterLicKey_Create;
    Login.CmdHumanEvalManagerLangs_Type = 'Login.CmdHumanEvalManagerLangs';
    function CmdHumanEvalManagerLangs_Create(lmcomId, companyId) {
        return { lmcomId: lmcomId, companyId: companyId };
    }
    Login.CmdHumanEvalManagerLangs_Create = CmdHumanEvalManagerLangs_Create;
    Login.CmdHumanEvalManagerEvsGet_Type = 'Login.CmdHumanEvalManagerEvsGet';
    function CmdHumanEvalManagerEvsGet_Create(lmcomId, companyId) {
        return { lmcomId: lmcomId, companyId: companyId };
    }
    Login.CmdHumanEvalManagerEvsGet_Create = CmdHumanEvalManagerEvsGet_Create;
    Login.CmdHumanEvalManagerEvsSave_Type = 'Login.CmdHumanEvalManagerEvsSave';
    function CmdHumanEvalManagerEvsSave_Create(companyUserId, companyId, email, evalInfos) {
        return { companyUserId: companyUserId, companyId: companyId, email: email, evalInfos: evalInfos };
    }
    Login.CmdHumanEvalManagerEvsSave_Create = CmdHumanEvalManagerEvsSave_Create;
    Login.CmdHumanEvalManagerGet_Type = 'Login.CmdHumanEvalManagerGet';
    function CmdHumanEvalManagerGet_Create(lmcomId, courseLang, companyId) {
        return { lmcomId: lmcomId, courseLang: courseLang, companyId: companyId };
    }
    Login.CmdHumanEvalManagerGet_Create = CmdHumanEvalManagerGet_Create;
    Login.CmdHumanEvalManagerSet_Type = 'Login.CmdHumanEvalManagerSet';
    function CmdHumanEvalManagerSet_Create(evaluators) {
        return { evaluators: evaluators };
    }
    Login.CmdHumanEvalManagerSet_Create = CmdHumanEvalManagerSet_Create;
    Login.CmdHumanEvalGet_Type = 'Login.CmdHumanEvalGet';
    function CmdHumanEvalGet_Create(lmcomId, companyId) {
        return { lmcomId: lmcomId, companyId: companyId };
    }
    Login.CmdHumanEvalGet_Create = CmdHumanEvalGet_Create;
    Login.CmdHumanEvalTest_Type = 'Login.CmdHumanEvalTest';
    function CmdHumanEvalTest_Create(companyUserId, courseUserId) {
        return { companyUserId: companyUserId, courseUserId: courseUserId };
    }
    Login.CmdHumanEvalTest_Create = CmdHumanEvalTest_Create;
    Login.CmdReport_Type = 'Login.CmdReport';
    function CmdReport_Create(self, companyId, type) {
        return { self: self, companyId: companyId, type: type };
    }
    Login.CmdReport_Create = CmdReport_Create;
    Login.CmdPaymentReport_Type = 'Login.CmdPaymentReport';
    function CmdPaymentReport_Create(cfg, self, companyId, type) {
        return { cfg: cfg, self: self, companyId: companyId, type: type };
    }
    Login.CmdPaymentReport_Create = CmdPaymentReport_Create;
})(Login || (Login = {}));
