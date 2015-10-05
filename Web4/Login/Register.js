var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Login;
(function (Login) {
    var RegisterModel = (function (_super) {
        __extends(RegisterModel, _super);
        function RegisterModel(type, isEMail) {
            _super.call(this, type);
            this.isEMail = isEMail;
            this.email = ko.observable("");
            this.login = ko.observable("");
            this.loginEmail = ko.observable("");
            this.password = ko.observable("");
            this.firstName = ko.observable("");
            this.lastName = ko.observable("");
            this.confirmPsw = ko.observable("");
            this.viewModel = isEMail ? [
                validate.email(this.email, true),
                validate.password(this.password, 1),
                validate.confirmPsw(this.confirmPsw, this.password),
                validate.empty(this.firstName, "firstName", Login.c_firstName()),
                validate.minLen(this.lastName, 3, "lastName", Login.c_lastName())
            ] : [
                validate.minLen(this.login, 3, "login", "Login"),
                validate.password(this.password, 1),
                validate.confirmPsw(this.confirmPsw, this.password),
                validate.empty(this.firstName, "firstName", Login.c_firstName()),
                validate.minLen(this.lastName, 3, "lastName", Login.c_lastName()),
                validate.email(this.loginEmail, false),
            ];
            this.viewModel.push();
        }
        RegisterModel.prototype.doOK = function () {
            var _this = this;
            this.error(null);
            this.success(null);
            var cook = LMComLib.LMCookieJS_Create(0, 0, this.isEMail ? this.email() : null, this.isEMail ? null : this.login(), this.isEMail ? null : this.loginEmail(), this.isEMail ? LMComLib.OtherType.LANGMaster : LMComLib.OtherType.LANGMasterNoEMail, null, this.firstName(), this.lastName(), '', 0, 0, null);
            Pager.ajaxGet(Pager.pathType.restServices, Login.CmdRegister_Type, LMStatus.createCmd(function (r) { r.password = Utils.encryptStr(_this.password()); r.Cookie = cook, r.subSite = LMComLib.SubDomains.com; }), 
            //CmdRegister_Create(Utils.encryptStr(this.password()), LMComLib.SubDomains.com, cook, 0),
            function (res) {
                if (_this.isEMail) {
                    var key = LowUtils.EncryptString(Utils.longToByteArray(res));
                    var url = location.href.split('#')[0];
                    url += url.indexOf('?') < 0 ? "?" : "&";
                    url += "key=" + key + "#" + Login.getHash(Login.pageConfirmRegistration);
                    var email = {
                        From: null,
                        To: _this.email(),
                        Cc: null,
                        Subject: CSLocalize('d809fff52b9f4f5391ab889a0a1afe80', 'Creating of an account - confirmation'),
                        emailId: "TEmailConfirmation",
                        //url: Pager.path(Pager.pathType.login, "?key=" + key + "#" + new Url(pageConfirmRegistration).toString()),// "http://www.langmaster.com/lmcom/rew/Login/default.aspx#confirmRegistrationModel",
                        isForgotPassword: false,
                        Html: null,
                        isAtt: false,
                        attFile: null,
                        attContent: null,
                        attContentType: null,
                        url: url,
                        name: _this.email(),
                        password: _this.password(),
                    };
                    EMailer.sendEMail(email, function () {
                        _this.success(CSLocalize('dd97d1b2919d451cbb43ee63091a147c', 'A confirmation e-mail has been sent to your e-mail address.'));
                        Login.testConfirmUrl = url;
                    }, function (errId, errMsg) { return alert(errMsg); });
                }
                else {
                    cook.id = res;
                    LMStatus.logged(cook, false);
                }
            }, function (errId, errMsg) {
                switch (errId) {
                    case Login.CmdLmLoginError.userExist:
                        _this.error(CSLocalize('d60caf13057c46c2ba63f5cd361271e5', 'User name already exists'));
                        break;
                    default:
                        Logger.error('Register.RegisterModel.doOK', '', errMsg);
                        _this.error(errMsg);
                        break;
                }
            });
        };
        RegisterModel.prototype.cancel = function () { Pager.navigateToHash(Login.getHash(Login.pageLmLogin)); };
        return RegisterModel;
    })(Login.loginMode);
    Login.RegisterModel = RegisterModel;
})(Login || (Login = {}));
