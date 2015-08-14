/// <reference path="../JsLib/jsd/jquery.d.ts" />
/// <reference path="../JsLib/jsd/knockout.d.ts" />
/// <reference path="../JsLib/jsd/jsrender.d.ts" />
/// <reference path="../JsLib/jsd/underscore.d.ts" />
/// <reference path="../JsLib/js/ModelBase.ts" />
/// <reference path="../JsLib/js/GenLMComLib.ts" />
/// <reference path="../JsLib/ea/EAExtension.ts" />
/// <reference path="GenAdmin.ts" />
/// <reference path="../JsLib/js/Validate.ts" />
/// <reference path="../login/GenLogin.ts" />
/// <reference path="../login/Model.ts" />
/// <reference path="KeyGen.ts" />
/// <reference path="Products.ts" />
/// <reference path="CompAdmins.ts" />
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var schoolAdmin;
(function (schoolAdmin) {
    schoolAdmin.roleTranslation = [];
    schoolAdmin.roleTranslation[LMComLib.CompRole.Department] = function () { return CSLocalize('a815ebcae6bb419db07ce3c645be19fd', 'Departments'); };
    schoolAdmin.roleTranslation[LMComLib.CompRole.Keys] = function () { return CSLocalize('4b5fde74d58f4e018ddc17ea7355b5a5', 'Keys'); };
    schoolAdmin.roleTranslation[LMComLib.CompRole.Products] = function () { return CSLocalize('ec533f48bf76461c9c517852cb53f41a', 'Products'); };
    schoolAdmin.roleTranslation[LMComLib.CompRole.Results] = function () { return CSLocalize('be895a5caef442c189deb82bf0497e8f', 'Results'); };
    schoolAdmin.roleTranslation[LMComLib.CompRole.Publisher] = function () { return CSLocalize('5302653a14e441b994c1044ad2e10b1d', 'Publisher'); };
    schoolAdmin.roleTranslation[LMComLib.CompRole.HumanEvalManager] = function () { return CSLocalize('f97ac29fced34a8d81c3760b1e7a9a4f', 'Evaluation Manager'); };
    var TopBarModel = (function () {
        function TopBarModel(model) {
            this.model = model;
            this.logoBig = returnTrue;
            this.isTitle = returnFalse;
            this.logoSmall = returnFalse;
            this.greenArrow = returnFalse;
            this.hasSupl = returnFalse;
            this.backToCourse = returnFalse;
            this.needsLogin = returnFalse;
            this.phoneMore = returnFalse;
            this.logoutAndProfile = returnFalse;
        }
        return TopBarModel;
    })();
    schoolAdmin.TopBarModel = TopBarModel;
    function returnFalse() { return false; }
    schoolAdmin.returnFalse = returnFalse;
    function returnTrue() { return true; }
    schoolAdmin.returnTrue = returnTrue;
    function getHash(type, companyId) { return [schoolAdmin.appId, type, companyId.toString()].join(hashDelim); }
    schoolAdmin.getHash = getHash;
    schoolAdmin.adminTypeName = "schoolAdminModel".toLowerCase(); //System administrator, dovoluje pridat dalsi system administrators a dalsi firmy
    schoolAdmin.keyGenTypeName = "schoolKeyGenModel".toLowerCase();
    schoolAdmin.productsTypeName = "schoolProductsModel".toLowerCase();
    schoolAdmin.humanEvalTypeName = "schoolHumanEvalModel".toLowerCase();
    schoolAdmin.humanEvalExTypeName = "schoolHumanEvalExModel".toLowerCase();
    schoolAdmin.humanEvalManagerLangsTypeName = "schoolHumanEvalManagerLangsModel".toLowerCase();
    schoolAdmin.humanEvalManagerTypeName = "schoolHumanEvalManagerModel".toLowerCase();
    schoolAdmin.humanEvalManagerExTypeName = "schoolHumanEvalManagerExModel".toLowerCase();
    schoolAdmin.humanEvalManagerEvsTypeName = "schoolHumanEvalManagerEvsModel".toLowerCase();
    schoolAdmin.humanEvalManagerTypeName = "schoolHumanEvalManagerModel".toLowerCase();
    schoolAdmin.compAdminsTypeName = "schoolCompAdminsModel".toLowerCase();
    schoolAdmin.editDepartmentTypeName = "schoolDepartmentModel".toLowerCase();
    schoolAdmin.schoolUserResultsTypeName = "schoolUserResultsModel".toLowerCase();
    var CompModel = (function (_super) {
        __extends(CompModel, _super);
        function CompModel(type, urlParts) {
            var _this = this;
            _super.call(this, schools.appId, type, urlParts);
            this.CompanyId = CourseMeta.actCompanyId = parseInt(urlParts[0]);
            this.tb = new TopBarModel(this);
            if (!LMStatus.getCookie())
                return;
            var c = _.find(Login.myData.Companies, function (c) { return c.Id == _this.CompanyId; });
            LMStatus.Cookie.Company = c ? { Courses: c.Courses, DepSelected: c.DepSelected, Id: c.Id, RoleEx: c.RoleEx, Title: c.Title } : null;
            LMStatus.setCookie(LMStatus.Cookie);
            //this.url = new CompIdUrl(type, CompanyId);
        }
        CompModel.prototype.title = function () {
            var _this = this;
            return _.find(Login.myData.Companies, function (comp) { return comp.Id == _this.CompanyId; }).Title;
        };
        return CompModel;
    })(Pager.Page);
    schoolAdmin.CompModel = CompModel;
    var AdminModel = (function (_super) {
        __extends(AdminModel, _super);
        function AdminModel() {
            var _this = this;
            _super.call(this, schoolAdmin.appId, schoolAdmin.adminTypeName, null);
            // COMP ADMIN
            this.comp_Admin = ko.observableArray(); //of CompanyAdmins
            var self = this;
            //this.url = new Url(adminTypeName);
            this.tb = new TopBarModel(this);
            // ROLE ADMIN
            this.admin_EMail = validate.create(validate.types.email, function (prop) {
                prop.required = true;
                prop.customValidation = function (email) { return _.any(_this.role_Admin, function (it) { return it.data.EMail == email; }) ? CSLocalize('bb4c401401ad413fbbf55c4906fb87ed', 'User with this email already added') : null; };
            });
            this.admin_add = function () {
                if (!validate.isPropsValid([_this.admin_EMail]))
                    return;
                var nu = new UserItem(_this, { EMail: _this.admin_EMail.get(), LMComId: 0, Deleted: false });
                _this.role_Admin.push(nu);
                _this.admin_EMail(null);
                _this.refreshRoleAdminHtml();
            };
            this.admin_del = function (act) {
                if (act.data.LMComId == 0) {
                    self.role_Admin = _.without(self.role_Admin, act);
                    _this.refreshRoleAdminHtml();
                }
                else
                    act.Deleted(!act.Deleted());
            };
            // ROLE COMPS
            this.comps_Name = validate.create(validate.types.minlength, function (prop) {
                prop.min = 3;
                prop.customValidation = function (name) { return _.any(_this.role_Comps, function (it) { return it.data.Title.toLowerCase() == name.toLowerCase(); }) ? CSLocalize('98b0616339a54314a3b865f7d76b99d8', 'Company with this title already added') : null; };
            });
            this.comps_EMail = validate.create(validate.types.email, function (prop) { prop.required = true; });
            this.company_add = function () {
                if (!validate.isPropsValid([_this.comps_EMail, _this.comps_Name]))
                    return;
                var nu = new CompanyItem({
                    EMail: _this.comps_EMail.get(), Title: _this.comps_Name.get(), UserId: 0, Id: 0, Deleted: false,
                }, _this);
                _this.role_Comps.push(nu);
                _this.comps_EMail(null);
                _this.comps_Name(null);
                _this.refreshCompHtml();
            };
            this.company_del = function (act) {
                if (act.data.Id == 0) {
                    self.role_Comps = _.without(self.role_Comps, act);
                    _this.refreshCompHtml();
                }
                else
                    act.Deleted(true);
            };
            this.company_undel = function (act) { act.edited(false); act.Deleted(false); };
            this.company_edit = function (act) { act.email(act.data.EMail); act.name(act.data.Title); /*act.publisherId(act.data.PublisherId);*/ act.edited(true); };
            this.company_editCancel = function (act) { act.edited(false); };
            this.company_editOk = function (act) { if (!validate.isPropsValid([act.email, act.name /*, act.publisherId*/]))
                return; act.data.EMail = act.email(); act.data.Title = act.name(); /*act.data.PublisherId = act.publisherId();*/ act.edited(false); };
        }
        AdminModel.prototype.title = function () { return CSLocalize('b2b7224389dd4118816f50890aececa4', 'Administrator Console'); };
        AdminModel.prototype.refreshRoleAdminHtml = function () {
            Pager.renderTemplateEx('schoolAdminRolePlace', 'schoolAdminRole', this);
        };
        AdminModel.prototype.refreshCompHtml = function () {
            Pager.renderTemplateEx('schoolAdminCompPlace', 'schoolAdminCompPlace', this);
        };
        // UPDATE
        AdminModel.prototype.update = function (completed) {
            var _this = this;
            Pager.ajaxPost(Pager.pathType.restServices, Admin.CmdGetUsers_Type, AdminDataCmd_from_MyData(Login.myData), function (res) {
                _this.role_Admin = _.map(res.Users, function (act) { return new UserItem(_this, act); });
                _this.oldComps = JSON.parse(JSON.stringify(res.Comps)); //kopie
                _this.role_Comps = _.map(res.Comps, function (act) { return new CompanyItem(act, _this); });
                _this.comp_Admin(_.map(_.pairs(_.groupBy(res.CompUsers, "CompanyId")), function (nv) { return new CompanyAdmins(nv[0], nv[1]); }));
                setTimeout(function () {
                    _this.refreshRoleAdminHtml();
                    _this.refreshCompHtml();
                }, 1);
                completed();
            });
        };
        // OK x CANCEL
        AdminModel.prototype.ok = function () {
            Pager.ajaxPost(Pager.pathType.restServices, Admin.CmdSetUsers_Type, Admin.CmdSetUsers_Create(_.map(this.role_Admin, function (it) { return it.data; }), this.oldComps, _.map(this.role_Comps, function (it) { return it.data; }), _.map(_.flatten(_.map(this.comp_Admin(), function (it) { return it.Items(); }), true), function (it) { return it.data; })), function () {
                Login.adjustMyData(true, function () { return LMStatus.gotoReturnUrl(); });
            });
        };
        AdminModel.prototype.cancel = function () { LMStatus.gotoReturnUrl(); };
        return AdminModel;
    })(Pager.Page);
    schoolAdmin.AdminModel = AdminModel;
    // ROLE ADMIN
    var UserItem = (function () {
        function UserItem(owner, data) {
            this.owner = owner;
            this.data = data;
            this.Deleted = ko.observable(false);
            this.Deleted.subscribe(function (val) { return data.Deleted = val; });
        }
        return UserItem;
    })();
    // ROLE COMPS
    var CompanyItem = (function () {
        function CompanyItem(data, owner) {
            this.data = data;
            this.owner = owner;
            this.Deleted = ko.observable(false);
            this.edited = ko.observable(false);
            this.Deleted.subscribe(function (val) { return data.Deleted = val; });
            this.email = validate.create(validate.types.email, function (prop) { prop.required = true; prop(data.EMail); });
            this.name = validate.create(validate.types.minlength, function (prop) { prop.min = 3; prop(data.Title); });
        }
        return CompanyItem;
    })();
    // COMP ADMIN
    var CompanyAdmins = (function () {
        function CompanyAdmins(Id, items) {
            var _this = this;
            this.Id = Id;
            this.Items = ko.observableArray(); //of CompanyAdminItem
            var self = this;
            this.Title = _.find(Login.myData.Companies, function (comp) { return comp.Id == Id; }).Title;
            this.Items(_.map(items, function (it) { return new CompanyAdminItem(it); }));
            this.compAdmin_del = function (act) { if (act.data.UserId == 0)
                self.Items.remove(act);
            else
                act.Deleted(!act.Deleted()); };
            this.newEMail = validate.create(validate.types.email, function (prop) {
                prop.required = true;
                prop.customValidation = function (email) { return _.any(_this.Items(), function (it) { return it.data.EMail == email; }) ? CSLocalize('af6fb39c97c042fb8d06e0ca1645846d', 'User with this email already added') : null; };
            });
            this.newEMail_Add = function () {
                if (!validate.isPropsValid([_this.newEMail]))
                    return;
                var nu = new CompanyAdminItem({
                    UserId: 0,
                    Deleted: false,
                    EMail: self.newEMail(),
                    CompanyId: Id,
                    Role: { Role: 0, HumanEvalatorInfos: null }
                });
                _this.Items.push(nu);
                _this.newEMail(null);
            };
        }
        return CompanyAdmins;
    })();
    var CompanyAdminItem = (function () {
        function CompanyAdminItem(data) {
            this.data = data;
            this.Deleted = ko.observable(false);
            this.Deleted.subscribe(function (val) { return data.Deleted = val; });
            this.options = [new CompanyAdminOption(this.data, LMComLib.CompRole.Keys), new CompanyAdminOption(this.data, LMComLib.CompRole.Products)];
        }
        return CompanyAdminItem;
    })();
    var CompanyAdminOption = (function () {
        function CompanyAdminOption(data, role) {
            this.data = data;
            this.checked = ko.observable(false);
            this.checked((data.Role.Role & role) != 0);
            this.checked.subscribe(function (r) { return data.Role.Role = r ? data.Role.Role | role : data.Role.Role & ~role; });
            this.title = LowUtils.EnumToString(LMComLib.CompRole, role);
        }
        return CompanyAdminOption;
    })();
    //export class Url extends Pager.Url {
    //  constructor(type: string) { super(appId, type); }
    //  finish() { }
    //  static fromString(hash: string): Pager.Url {
    //    var parts = hash.split("@");
    //    return parts.length == 1 ? new Url(hash) : new CompIdUrl(parts[0], parseInt(parts[1]));
    //  }
    //  //toString(): string { return super.toString(appId, [this.locator == adminTypeName ? "" : this.locator]); }
    //}
    //export class CompIdUrl extends Pager.Url {
    //  constructor(type: string, public CompanyId: number) { super(appId, type, CompanyId.toString()); }
    //  finish() { this.CompanyId = parseInt(this.url); }
    //}
    //Login.MyData jsou dalsi data o uzivateli mimo Cookie. Nacitaji se v LMStatus.adjustCookie => Login.Model. Obsahuji globalni a firemni Role uzivatele. 
    function AdminDataCmd_from_MyData(myData) {
        return Admin.CmdGetUsers_Create((myData.Roles & Login.Role.Admin) != 0, (myData.Roles & Login.Role.Comps) != 0, _.map(_.filter(myData.Companies, function (c) { return (c.RoleEx.Role & LMComLib.CompRole.Admin) != 0; }), function (c) { return c.Id; }));
    }
    schoolAdmin.AdminDataCmd_from_MyData = AdminDataCmd_from_MyData;
    //Pager.registerAppLocator(adminTypeName, (url: Url, completed: (pg: Pager.Page) => void) => completed(new AdminModel()));
    Pager.registerAppLocator(schoolAdmin.appId, schoolAdmin.adminTypeName, function (urlParts, completed) { return completed(new AdminModel()); });
})(schoolAdmin || (schoolAdmin = {}));
