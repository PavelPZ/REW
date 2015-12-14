/// <reference path="../JsLib/jsd/jquery.d.ts" />
/// <reference path="../JsLib/jsd/knockout.d.ts" />
/// <reference path="../JsLib/jsd/jsrender.d.ts" />
/// <reference path="../JsLib/js/ModelBase.ts" />
/// <reference path="../JsLib/js/OAuth.ts" />
/// <reference path="../JsLib/js/Validate.ts" />
/// <reference path="Model.ts" />
/// <reference path="Register.ts" />
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Login;
(function (Login) {
    var ProfileModel = (function (_super) {
        __extends(ProfileModel, _super);
        function ProfileModel(type) {
            _super.call(this, type);
            this.email = ko.observable(null);
            this.firstName = ko.observable("");
            this.lastName = ko.observable("");
            this.button = ko.observable(Pager.ButtonType.okCancel);
            LMStatus.getCookie();
            if (LMStatus.isLMComCookie()) {
                this.viewModel = [
                    validate.empty(this.firstName, "firstName", Login.c_firstName()),
                    validate.minLen(this.lastName, 3, "lastName", Login.c_lastName()),
                ];
                this.firstName(LMStatus.Cookie.FirstName);
                this.lastName(LMStatus.Cookie.LastName);
                if (LMStatus.Cookie.Type == LMComLib.OtherType.LANGMasterNoEMail) {
                    this.viewModel.push(validate.email(this.email, false));
                    this.email(LMStatus.Cookie.LoginEMail);
                }
            }
            else
                this.viewModel = [];
        }
        ProfileModel.prototype.update = function (completed) {
            completed();
        };
        ProfileModel.prototype.doOK = function () {
            var _this = this;
            if (this.button() == Pager.ButtonType.ok)
                this.cancel();
            else {
                LMStatus.getCookie();
                LMStatus.Cookie.FirstName = this.firstName();
                LMStatus.Cookie.LastName = this.lastName();
                LMStatus.Cookie.LoginEMail = this.email();
                LMStatus.setCookie(LMStatus.Cookie);
                Pager.ajaxGet(Pager.pathType.restServices, Login.CmdProfile_Type, LMStatus.createCmd(function (r) { r.Cookie = LMStatus.Cookie, r.lmcomId = LMStatus.Cookie.id; }), 
                //CmdProfile_Create(LMStatus.Cookie, LMStatus.Cookie.id),
                function () {
                    _this.success(CSLocalize('e56e6bad75e54dea9191cab418eda74d', 'Success'));
                    _this.button(Pager.ButtonType.ok);
                }, function () { return _this.error(CSLocalize('bb6463807fdf453191f0315f034f01e0', 'Wrong old password')); });
            }
        };
        ProfileModel.prototype.cancel = function () {
            //throw "My.schoolMy.Model.licKeyOK";
            LMStatus.gotoReturnUrl();
        };
        return ProfileModel;
    })(Login.loginMode);
    Login.ProfileModel = ProfileModel;
})(Login || (Login = {}));
