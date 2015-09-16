var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Login;
(function (Login) {
    var LMLoginModel = (function (_super) {
        __extends(LMLoginModel, _super);
        function LMLoginModel(type, isEMail) {
            _super.call(this, type);
            this.isEMail = isEMail;
            this.login = ko.observable("");
            this.email = ko.observable("");
            this.password = ko.observable("");
            this.viewModel = [isEMail ? validate.email(this.email, true) : validate.minLen(this.login, 3, "login", "Login"), validate.password(this.password, 1)];
        }
        LMLoginModel.prototype.gotoRegister = function () { Pager.navigateToHash(Login.getHash(this.isEMail ? Login.pageRegister : Login.pageRegisterNoEMail)); };
        LMLoginModel.prototype.doOK = function () {
            var _this = this;
            this.error(null);
            login(this.isEMail, this.email().trim(), this.login().trim(), this.password(), null, function (cookie) { return LMStatus.logged(cookie, false); }, function (errId, errMsg) {
                switch (errId) {
                    case Login.CmdLmLoginError.cannotFindUser:
                        _this.error(CSLocalize('f14d4f45b2184ec2b114ae702e34b8d0', 'Wrong password or login name was not found in the database.'));
                        break;
                    default:
                        Logger.error('LMLogin.LMLoginModel.doOK', '', errMsg);
                        _this.error(errMsg);
                        break;
                }
            });
        };
        LMLoginModel.prototype.cancel = function () { Pager.navigateToHash(Login.getHash(Login.pageLogin)); };
        return LMLoginModel;
    })(Login.loginMode);
    Login.LMLoginModel = LMLoginModel;
    function login(isEMail, email, login, password, ticket, completed, onError) {
        password = _.isEmpty(password) ? null : Utils.encryptStr(password);
        Pager.ajaxGet(Pager.pathType.restServices, Login.CmdLmLogin_Type, Login.CmdLmLogin_Create(isEMail ? null : login, isEMail ? email : null, password, null, ticket), function (res) { return completed(res.Cookie); }, onError);
    }
    Login.login = login;
})(Login || (Login = {}));
