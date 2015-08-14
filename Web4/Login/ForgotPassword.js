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
    var ForgotPasswordModel = (function (_super) {
        __extends(ForgotPasswordModel, _super);
        function ForgotPasswordModel() {
            _super.apply(this, arguments);
            this.email = ko.observable("");
        }
        ForgotPasswordModel.prototype.update = function (completed) {
            this.viewModel = [validate.email(this.email, true)];
            completed();
        };
        ForgotPasswordModel.prototype.doOK = function () {
            var _this = this;
            var email = {
                From: null,
                To: this.email(),
                Cc: null,
                Subject: CSLocalize('3c2e4788779446b5ac07319284964624', 'Sending of the forgotten password'),
                emailId: "TEmailForgotPassword",
                name: this.email(),
                isForgotPassword: true,
                Html: null,
                isAtt: false,
                attFile: null,
                attContent: null,
                attContentType: null,
            };
            EMailer.sendEMail(email, function () {
                _this.success(CSLocalize('5ccd166083844fd49a180596afdfb330', 'The password has been sent to your e-mail address.'));
            }, function (errId, errMsg) {
                switch (errId) {
                    case Login.CmdLmLoginError.cannotFindUser:
                        _this.error("The e-mail address was not found in the database.");
                        break;
                    default:
                        break;
                        alert(errMsg);
                }
            });
        };
        ForgotPasswordModel.prototype.cancel = function () { Pager.navigateToHash(Login.getHash(Login.pageLmLogin)); };
        return ForgotPasswordModel;
    })(Login.loginMode);
    Login.ForgotPasswordModel = ForgotPasswordModel;
})(Login || (Login = {}));
