var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Login;
(function (Login) {
    var LoginModel = (function (_super) {
        __extends(LoginModel, _super);
        function LoginModel() {
            _super.apply(this, arguments);
            this.button = Pager.ButtonType.cancel;
        }
        LoginModel.prototype.update = function (completed) {
            this.viewModel = _.map(Login.cfg.logins, function (pr) { return (createProvider(pr)); });
            //kontrola lowercase pro google etc login
            var path = location.href.split('?')[0].split('#')[0];
            if (Utils.endsWith(path, '.html') && path != path.toLowerCase()) {
                location.href = location.href.toLowerCase();
                location.href = path.toLowerCase() + location.hash;
                return;
            }
            completed();
        };
        LoginModel.prototype.call_provider = function (sender, par) {
            if (par == LMComLib.OtherType.LANGMaster)
                Pager.navigateToHash(Login.getHash(Login.pageLmLogin));
            else if (par == LMComLib.OtherType.LANGMasterNoEMail)
                Pager.navigateToHash(Login.getHash(Login.pageLmLoginNoEMail));
            else
                OAuth.authrequest(par);
        };
        LoginModel.prototype.cancel = function () {
            LMStatus.gotoReturnUrl();
        };
        return LoginModel;
    })(Login.loginMode);
    Login.LoginModel = LoginModel;
    function createProvider(id) {
        //return { id: id, name: LowUtils.EnumToString(LMComLib.OtherType, id).toLowerCase() };
        return { id: id, name: LowUtils.EnumToString(LMComLib.OtherType, id).toLowerCase() };
    }
})(Login || (Login = {}));
