var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Login;
(function (Login) {
    Login.cfg;
    function getHash(type) {
        return oldPrefix + [Login.appId, type].join(hashDelim);
    }
    Login.getHash = getHash;
    Login.myData; //info o mojich firmach, produktech a rolich
    //pro Admin.html
    function isSystemAdmin() { return ((Login.myData.Roles & Login.Role.Admin) != 0) || ((Login.myData.Roles & Login.Role.Comps) != 0); }
    Login.isSystemAdmin = isSystemAdmin; //PZ
    function isRoleComps() { return (Login.myData.Roles & Login.Role.Comps) != 0; }
    Login.isRoleComps = isRoleComps; //ZZ, RJ, PJ, ktere PZ urci 
    function companyExists() { return _.any(Login.myData.Companies, function (c) { return (c.RoleEx.Role == LMComLib.CompRole.Admin) || ((c.RoleEx.Role & ~LMComLib.CompRole.Admin) != 0) || (c.Courses != null && c.Courses.length > 0); }); }
    Login.companyExists = companyExists;
    //export function isCompAdmin() { return _.any(myData.Companies, (c: Login.MyCompany) => (c.Roles & ~Login.CompRole.Admin) != 0); } //Chinh povoli nejakou company roli (products nebo key)
    //export function isCompStudent() { return _.any(myData.Companies, (c: Login.MyCompany) => (c.Courses != null && c.Courses.length > 0)); } //existuje nejaky prirazeny kurz
    LMStatus.onLogged = function (completed) {
        if (!LMStatus.isLogged()) {
            completed();
            return;
        }
        if (Pager.afterLoginInit)
            Pager.afterLoginInit(function () { return adjustMyData(false, completed); });
        else
            adjustMyData(false, completed);
    };
    function adjustMyData(force, completed) {
        if (!force && Login.myData != null && Login.myData.UserId == LMStatus.Cookie.id) {
            completed();
            return;
        }
        //info o firmach, produktech a rolich
        Pager.ajaxGet(Pager.pathType.restServices, Login.CmdMyInit_Type, LMStatus.createCmd(function (r) { return r.lmcomId = LMStatus.Cookie.id; }), 
        //Login.CmdMyInit_Create(LMStatus.Cookie.id),
        //Login.CmdMyInit_Create(LMStatus.Cookie.id),
        function (res) {
            Login.myData = res;
            if (CourseMeta.allProductList)
                finishMyData(); //pri spusteni se nejdrive nacitaji Mydata a pak teprve produkty. Proto se finishMyData vola i v adjustAllProductList 
            completed();
        });
    }
    Login.adjustMyData = adjustMyData;
    //export function createArchive(companyId: number, productId: string, completed: (archiveId:number) => void) {
    //  //info o firmach, produktech a rolich
    //  Pager.ajaxGet(
    //    Pager.pathType.restServices,
    //    scorm.Cmd_createArchive_Type,
    //    scorm.Cmd_createArchive_Create(LMStatus.Cookie.id, companyId, productId, null),
    //    (res: number) => completed(res));
    //}
    function finishMyData() {
        //myData vznikaji v CSharp v NewData.My.Init. Kurzy jsou v myData.Companies.Courses. comp.companyProducts comp.companyProducts jsou LM Author produkty
        if (!Login.myData || Login.myData.finished)
            return;
        Login.myData.finished = true;
        var res = Login.myData;
        //pridej produkty, vytvorene (vlastnene) by company
        _.each(Login.myData.Companies, function (comp) {
            if (comp.PublisherOwnerUserId != 0) {
                if (comp.PublisherOwnerUserId != Login.myData.UserId)
                    return;
                comp.RoleEx.Role = LMComLib.CompRole.Keys | LMComLib.CompRole.Products | LMComLib.CompRole.Publisher;
            }
            else {
                if ((comp.RoleEx.Role && LMComLib.CompRole.Publisher) == 0)
                    return;
            }
            _.each(comp.companyProducts, function (p) { return comp.Courses.push({
                Expired: -1,
                Archives: null,
                isAuthoredCourse: true,
                LicCount: 1,
                ProductId: p.url,
                LicenceKeys: null,
            }); });
        });
        //agreguj archivy testu a dosad isTest
        _.each(res.Companies, function (myComp) {
            var courses = [];
            //jedna grupa - vsechny zaznamy o jednom produktu (eTestMe archiv) a to budto isAuthoredCourse nebo ne
            var prodGroups = _.groupBy(myComp.Courses, function (myCrs) { return (myCrs.isAuthoredCourse ? '+' : '-') + '|' + myCrs.ProductId.split('|')[0]; });
            for (var prodcode in prodGroups) {
                var prodGroup = prodGroups[prodcode];
                var prodId = prodcode.split('|')[1];
                var isAuthoredCourse = prodcode.charAt(0) == '+';
                var isTest = CourseMeta.lib.isTest(CourseMeta.lib.findProduct(prodId));
                var crs;
                if (!isTest) {
                    if (prodGroup.length > 1) {
                        debugger; /*kdyz se published test pouzije a publisher nasledne stejnout URL pouzije pro kurz => chyba. throw 'Text expected';*/
                    }
                    crs = prodGroup[0];
                    crs.isAuthoredCourse = isAuthoredCourse;
                }
                else {
                    var crs = {
                        Expired: 0,
                        ProductId: prodId,
                        Archives: [],
                        LicCount: 0,
                        isAuthoredCourse: isAuthoredCourse,
                        LicenceKeys: null,
                    };
                    _.each(prodGroup, function (it) {
                        var parts = it.ProductId.split('|'); //productId je url|archiveId
                        switch (parts.length) {
                            case 1:
                                crs.LicCount = it.LicCount;
                                break; //rozpracovany test (neni archiv)
                            case 2:
                                crs.Archives.push(parseInt(parts[1]));
                                break; //archiv
                            default: {
                                debugger;
                                throw 'error';
                            }
                        }
                    });
                }
                courses.push(crs);
            }
            myComp.Courses = courses;
        });
    }
    Login.finishMyData = finishMyData;
    Login.c_firstName = function () { return CSLocalize('620972c027ab41a28bcb0306b233b0ce', 'First Name'); };
    Login.c_lastName = function () { return CSLocalize('03500780ce2c476a9719c9e8e3202465', 'Last Name'); };
    Login.c_oldPassword = function () { return CSLocalize('275229db239c41f0a7d3038e0072323f', 'Old password'); };
    Login.c_newPassword = function () { return CSLocalize('e0bc9a352e364c40b87d261f44697515', 'New password'); };
    //export class Url extends Pager.Url {
    //  constructor(type: string) { super(appId, type); }
    //  //static fromString(hash: string): Pager.Url {
    //  //  return _.isEmpty(hash) ? initUrl() : new Url(hash);
    //  //}
    //  toString(): string { return appId + "@" + (this.locator == pageLogin ? "" : this.locator); }
    //}
    function Dump() {
        var res = {};
        res.login = function () {
            //window.location.href = LMStatus.newLoginUrl(false);
        };
        res.login_https = function () {
            //window.location.href = LMStatus.newLoginUrl(true);
        };
        //res.logout = LMStatus.logout;
        var cook = LMStatus.getCookie();
        var logged = cook != null && cook.id > 0;
        res.isLogin = !logged;
        if (!logged) {
            res.Error = "Not logged";
            return res;
        }
        res.Id = "<b>Id:</b> " + cook.id;
        res.EMail = "<b>EMail:</b> " + cook.EMail;
        res.Type = "<b>Type:</b> " + LowUtils.EnumToString(LMComLib.OtherType, cook.Type);
        res.TypeId = "<b>TypeId:</b> " + cook.TypeId;
        res.FirstName = "<b>FirstName:</b> " + cook.FirstName;
        res.LastName = "<b>LastName:</b> " + cook.LastName;
        return res;
    }
    Login.Dump = Dump;
    function InitModel(_cfg, completed) {
        Login.cfg = _cfg;
        completed();
    }
    Login.InitModel = InitModel;
    Login.pageLogin = "loginModel".toLowerCase();
    Login.pageLmLogin = "lmLoginModel".toLowerCase();
    Login.pageLmLoginNoEMail = "lmLoginNoEMailModel".toLowerCase();
    Login.pageRegister = "registerModel".toLowerCase();
    Login.pageRegisterNoEMail = "registerNoEMailModel".toLowerCase();
    Login.pageChangePassword = "changePasswordModel".toLowerCase();
    Login.pageForgotPassword = "forgotPasswordModel".toLowerCase();
    Login.pageProfile = "profileModel".toLowerCase();
    Login.pageConfirmRegistration = "ConfirmRegistrationModel".toLowerCase();
    //export interface IPageDict { type: string; create: (type: string) => loginMode; }
    //};
    var loginMode = (function (_super) {
        __extends(loginMode, _super);
        function loginMode(type) {
            _super.call(this, Login.appId, type, null);
            this.error = ko.observable(null);
            this.success = ko.observable(null);
            //this.url = new Url(type.toLowerCase());
            this.errorText = ko.computed(function () {
                var err = this.error();
                if (!err || err == "")
                    return null;
                return "<b>Error:</b> " + err;
            }, this);
        }
        loginMode.prototype.update = function (completed) {
            completed();
        };
        loginMode.prototype.ok = function () {
            if (!validate.isValid(this.viewModel))
                return;
            this.doOK();
        };
        loginMode.prototype.doOK = function () { };
        return loginMode;
    })(Pager.Page);
    Login.loginMode = loginMode;
    //Init Url
    //export var initUrl = () => new Url(pageLogin);
    //export var initHash = getHash(pageLogin);
    function loginUrl() { return getHash(Login.pageLogin); }
    Login.loginUrl = loginUrl;
    if ($.views)
        $.views.helpers({
            loginUrl: function (par) { return "#" + getHash(_.isEmpty(par) ? Login.pageLogin : par); },
        });
    function newProfileUrl() {
        LMStatus.setReturnUrlAndGoto(getHash(Login.pageProfile));
    }
    Login.newProfileUrl = newProfileUrl;
    //export var pageDict: { [type: string]: (urlParts: string[], completed: (pg: Pager.Page) => void) => void } = {};
    //pageDict[pageLogin] = (urlParts, completed) => completed(new LoginModel(pageLogin));
    //pageDict[pageLmLogin] = (urlParts, completed) => completed(new LMLoginModel(pageLmLogin, true));
    //pageDict[pageLmLoginNoEMail] = (urlParts, completed) => completed(new LMLoginModel(pageLmLoginNoEMail, false));
    //pageDict[pageRegister] = (urlParts, completed) => completed(new RegisterModel(pageRegister, true));
    //pageDict[pageRegisterNoEMail] = (urlParts, completed) => completed(new RegisterModel(pageRegisterNoEMail, false));
    //pageDict[pageConfirmRegistration] = (urlParts, completed) => completed(new ConfirmRegistrationModel(pageConfirmRegistration));
    //pageDict[pageChangePassword] = (urlParts, completed) => completed(new ChangePassworModel(pageChangePassword));
    //pageDict[pageForgotPassword] = (urlParts, completed) => completed(new ForgotPasswordModel(pageForgotPassword));
    //pageDict[pageProfile] = (urlParts, completed) => completed(new ProfileModel(pageProfile));
    //Registrace lokatoru
    //for (var p in pageDict)
    //  Pager.registerAppLocator(appId, p, pageDict[p]);
    blended.oldLocators.push(function ($stateProvider) { return blended.registerOldLocator($stateProvider, Login.pageLogin, Login.appId, Login.pageLogin, 0, function (urlParts) { return new Login.LoginModel(Login.pageLogin); }, false); });
    blended.oldLocators.push(function ($stateProvider) { return blended.registerOldLocator($stateProvider, Login.pageLmLogin, Login.appId, Login.pageLmLogin, 0, function (urlParts) { return new Login.LMLoginModel(Login.pageLmLogin, true); }, false); });
    blended.oldLocators.push(function ($stateProvider) { return blended.registerOldLocator($stateProvider, Login.pageLmLoginNoEMail, Login.appId, Login.pageLmLoginNoEMail, 0, function (urlParts) { return new Login.LMLoginModel(Login.pageLmLoginNoEMail, false); }, false); });
    blended.oldLocators.push(function ($stateProvider) { return blended.registerOldLocator($stateProvider, Login.pageRegister, Login.appId, Login.pageRegister, 0, function (urlParts) { return new Login.RegisterModel(Login.pageRegister, true); }, false); });
    blended.oldLocators.push(function ($stateProvider) { return blended.registerOldLocator($stateProvider, Login.pageRegisterNoEMail, Login.appId, Login.pageRegisterNoEMail, 0, function (urlParts) { return new Login.RegisterModel(Login.pageRegisterNoEMail, false); }, false); });
    blended.oldLocators.push(function ($stateProvider) { return blended.registerOldLocator($stateProvider, Login.pageConfirmRegistration, Login.appId, Login.pageConfirmRegistration, 0, function (urlParts) { return new Login.ConfirmRegistrationModel(Login.pageConfirmRegistration); }, false); });
    blended.oldLocators.push(function ($stateProvider) { return blended.registerOldLocator($stateProvider, Login.pageChangePassword, Login.appId, Login.pageChangePassword, 0, function (urlParts) { return new Login.ChangePassworModel(Login.pageChangePassword); }, false); });
    blended.oldLocators.push(function ($stateProvider) { return blended.registerOldLocator($stateProvider, Login.pageForgotPassword, Login.appId, Login.pageForgotPassword, 0, function (urlParts) { return new Login.ForgotPasswordModel(Login.pageForgotPassword); }, false); });
    blended.oldLocators.push(function ($stateProvider) { return blended.registerOldLocator($stateProvider, Login.pageProfile, Login.appId, Login.pageProfile, 0, function (urlParts) { return new Login.ProfileModel(Login.pageProfile); }, false); });
})(Login || (Login = {}));
