/// <reference path="../JsLib/jsd/jquery.d.ts" />
/// <reference path="../JsLib/jsd/knockout.d.ts" />
/// <reference path="../JsLib/jsd/jsrender.d.ts" />
/// <reference path="../JsLib/js/ModelBase.ts" />
/// <reference path="../JsLib/js/OAuth.ts" />
/// <reference path="../JsLib/js/Validate.ts" />
/// <reference path="Model.ts" />
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Login;
(function (Login) {
    var ChangePassworModel = (function (_super) {
        __extends(ChangePassworModel, _super);
        function ChangePassworModel(type) {
            _super.call(this, type);
            this.oldPassword = ko.observable("");
            this.password = ko.observable("");
            this.confirmPsw = ko.observable("");
            this.button = ko.observable(Pager.ButtonType.okCancel);
            this.viewModel = [
                validate.password(this.oldPassword, 1, "oldPassword", Login.c_oldPassword()),
                validate.password(this.password, 1, "password", Login.c_newPassword()),
                validate.confirmPsw(this.confirmPsw, this.password)];
        }
        ChangePassworModel.prototype.update = function (completed) {
            completed();
        };
        ChangePassworModel.prototype.doOK = function () {
            var _this = this;
            if (this.button() == Pager.ButtonType.ok)
                this.cancel();
            else {
                LMStatus.getCookie();
                Pager.ajaxGet(Pager.pathType.restServices, Login.CmdChangePassword_Type, LMStatus.createCmd(function (r) { r.oldPassword = _this.oldPassword(); r.newPassword = _this.password(); r.lmcomId = LMStatus.Cookie.id; }), 
                //CmdChangePassword_Create(this.oldPassword(), this.password(), LMStatus.Cookie.id),
                //CmdChangePassword_Create(this.oldPassword(), this.password(), LMStatus.Cookie.id),
                function () {
                    _this.success(CSLocalize('4ec7f9623a684f708844bce43ad51d26', 'Password changed successfully'));
                    _this.button(Pager.ButtonType.ok);
                }, function (errId, errMsg) {
                    switch (errId) {
                        case Login.CmdLmLoginError.passwordNotExists:
                            _this.error(CSLocalize('150a40688a494a72a11b26081b46e515', 'The e-mail address was not found in the database.'));
                            break;
                        default:
                            Logger.error('ChangePasswor.ChangePassworModel.doOK', '', errMsg);
                            _this.error(errMsg);
                            break;
                    }
                });
            }
        };
        ChangePassworModel.prototype.cancel = function () { location.href = "#" + Login.pageProfile; };
        return ChangePassworModel;
    })(Login.loginMode);
    Login.ChangePassworModel = ChangePassworModel;
})(Login || (Login = {}));
