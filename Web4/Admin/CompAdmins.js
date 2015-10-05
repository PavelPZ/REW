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
/// <reference path="admin.ts" />
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var schoolAdmin;
(function (schoolAdmin) {
    var CompAdmins = (function (_super) {
        __extends(CompAdmins, _super);
        function CompAdmins(urlParts) {
            _super.call(this, schoolAdmin.compAdminsTypeName, urlParts);
        }
        // UPDATE
        CompAdmins.prototype.update = function (completed) {
            var _this = this;
            Pager.ajaxPost(Pager.pathType.restServices, Admin.CmdGetUsers_Type, Admin.CmdGetUsers_Create(false, false, [this.CompanyId]), function (res) {
                _this.comp_Admin = _.map(_.pairs(_.groupBy(res.CompUsers, "CompanyId")), function (nv) { return new CompanyAdmins(_this, nv[0], nv[1]); });
                setTimeout(function () { return _this.refreshHtml(); }, 1);
                completed();
            });
        };
        // OK x CANCEL
        CompAdmins.prototype.ok = function () {
            Pager.ajaxPost(Pager.pathType.restServices, Admin.CmdSetUsers_Type, Admin.CmdSetUsers_Create(null, null, null, _.map(_.flatten(_.map(this.comp_Admin, function (it) { return it.Items; }), true), function (it) { return it.data; })), function () { return Login.adjustMyData(true, function () { return LMStatus.gotoReturnUrl(); }); });
        };
        CompAdmins.prototype.cancel = function () { LMStatus.gotoReturnUrl(); };
        CompAdmins.prototype.refreshHtml = function () {
            Pager.renderTemplateEx('schoolCompAdminsItemsPlace', 'schoolCompAdminsItems', this);
        };
        return CompAdmins;
    })(schoolAdmin.CompModel);
    schoolAdmin.CompAdmins = CompAdmins;
    // COMP ADMIN
    var CompanyAdmins = (function () {
        function CompanyAdmins(owner, Id, items) {
            var _this = this;
            this.owner = owner;
            this.Id = Id;
            var self = this;
            //this.Title = _.find(Login.myData.Companies, (comp: Login.MyCompany) => comp.Id == Id).Title;
            this.Items = _.map(items, function (it) { return new CompanyAdminItem(it); });
            //this.compAdmin_del = (act: CompanyAdminItem) => { if (act.data.UserId == 0) self.Items.remove(act); else act.Deleted(!act.Deleted()); }
            this.compAdmin_del = function (act) { if (act.data.UserId == 0) {
                self.Items = _.without(self.Items, act);
                self.owner.refreshHtml();
            }
            else
                act.Deleted(!act.Deleted()); };
            this.newEMail = validate.create(validate.types.email, function (prop) {
                prop.required = true;
                prop.customValidation = function (email) { return _.any(_this.Items, function (it) { return it.data.EMail == email; }) ? CSLocalize('bd38a1ebc3f041779ffd7a5bcf34dfe8', 'User with this email already added') : null; };
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
                self.owner.refreshHtml();
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
            this.options = [
                new CompanyAdminOption(this.data, LMComLib.CompRole.Keys),
                new CompanyAdminOption(this.data, LMComLib.CompRole.Products),
                new CompanyAdminOption(this.data, LMComLib.CompRole.Department),
                new CompanyAdminOption(this.data, LMComLib.CompRole.Results),
                new CompanyAdminOption(this.data, LMComLib.CompRole.Publisher),
                new CompanyAdminOption(this.data, LMComLib.CompRole.HumanEvalManager),
            ];
        }
        return CompanyAdminItem;
    })();
    var CompanyAdminOption = (function () {
        function CompanyAdminOption(data, role) {
            this.data = data;
            this.checked = ko.observable(false);
            this.checked((data.Role.Role & role) != 0);
            this.checked.subscribe(function (r) { return data.Role.Role = r ? data.Role.Role | role : data.Role.Role & ~role; });
            this.title = schoolAdmin.roleTranslation[role]();
        }
        return CompanyAdminOption;
    })();
    //Pager.registerAppLocator(appId, compAdminsTypeName, (urlParts, completed) => completed(new CompAdmins(urlParts)));
    blended.oldLocators.push(function ($stateProvider) { return blended.registerOldLocator($stateProvider, schoolAdmin.compAdminsTypeName, schoolAdmin.appId, schoolAdmin.compAdminsTypeName, 1, function (urlParts) { return new CompAdmins(urlParts); }); });
})(schoolAdmin || (schoolAdmin = {}));
