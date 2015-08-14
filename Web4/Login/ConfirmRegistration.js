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
    var ConfirmRegistrationModel = (function (_super) {
        __extends(ConfirmRegistrationModel, _super);
        function ConfirmRegistrationModel() {
            _super.apply(this, arguments);
        }
        ConfirmRegistrationModel.prototype.update = function (completed) {
            var _this = this;
            var key = LowUtils.parseQuery(location.search)["key"];
            try {
                if (Utils.Empty(key))
                    throw "Missing Key query par";
                var userId = Utils.byteArrayToLong(LowUtils.DecryptString(key));
                if (Utils.Empty(userId) || userId <= 0)
                    throw "Wrong User id format";
                Pager.ajaxGet(Pager.pathType.restServices, Login.CmdConfirmRegistration_Type, LMStatus.createCmd(function (r) { r.lmcomId = userId; }), 
                //CmdConfirmRegistration_Create(userId),
                //CmdConfirmRegistration_Create(userId),
                function () {
                    _this.success(CSLocalize('b28146649ad7498cb4109b6b1276fcef', 'Account') + ' ' + CSLocalize('c0b339ea24054072999d990c2e7b8db9', 'was activated.'));
                    completed();
                }, function (errId, errMsg) {
                    _this.error(CSLocalize('0262a5d780784acd842bc31bd2800579', 'The e-mail address was not found in the database.') + ' ' + errMsg);
                    completed();
                });
            }
            catch (err) {
                this.error(CSLocalize('0cc1324eadf741c4b25f04ad1c8b1917', 'Wrong confirmation page url:') + ' ' + err);
                completed();
                return;
            }
        };
        return ConfirmRegistrationModel;
    })(Login.loginMode);
    Login.ConfirmRegistrationModel = ConfirmRegistrationModel;
})(Login || (Login = {}));
