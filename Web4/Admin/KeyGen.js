/// <reference path="../JsLib/jsd/jquery.d.ts" />
/// <reference path="../JsLib/jsd/knockout.d.ts" />
/// <reference path="../JsLib/jsd/jsrender.d.ts" />
/// <reference path="../JsLib/jsd/underscore.d.ts" />
/// <reference path="../JsLib/js/ModelBase.ts" />
/// <reference path="../JsLib/js/GenLMComLib.ts" />
/// <reference path="../JsLib/ea/EAExtension.ts" />
/// <reference path="GenAdmin.ts" />
/// <reference path="../JsLib/js/Validate.ts" />
/// <reference path="../JsLib/js/Keys.ts" />
/// <reference path="../login/GenLogin.ts" />
/// <reference path="../login/Model.ts" />
/// <reference path="../schools/products.ts" /> 
/// <reference path="admin.ts" />
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var schoolAdmin;
(function (schoolAdmin) {
    var KeyGenModel = (function (_super) {
        __extends(KeyGenModel, _super);
        function KeyGenModel(urlParts) {
            var _this = this;
            _super.call(this, schoolAdmin.keyGenTypeName, urlParts);
            this.products = [];
            this.selProd = ko.observable();
            this.button = Pager.ButtonType.cancel;
            this.genOK = ko.observable(false);
            this.num = validate.create(validate.types.rangeMin, function (prop) { prop.min = 1; });
            this.selProd.subscribe(function () { _this.num(""); _this.genOK(false); });
            this.num.subscribe(function () { _this.genOK(false); });
        }
        // UPDATE
        KeyGenModel.prototype.update = function (completed) {
            var _this = this;
            Pager.ajaxGet(Pager.pathType.restServices, Admin.CmdGetProducts_Type, Admin.CmdGetProducts_Create(this.CompanyId, true), function (allRes) {
                var res = [];
                _.each(allRes, function (pr) {
                    var prod = CourseMeta.lib.findProduct(pr.ProductId);
                    if (!prod)
                        return;
                    res.push(pr);
                    pr['title'] = CourseMeta.lib.keyTitle(prod, pr.Days);
                });
                for (var i = 0; i < res.length; i += 2) {
                    var l = res[i], r = res[i + 1];
                    _this.products.push([
                        Utils.createLayoutCell(6, "TProdCard", l),
                        Utils.createLayoutCell(6, "TProdCard", r ? r : null)
                    ]);
                }
                completed();
            });
        };
        KeyGenModel.prototype.generate = function () {
            var _this = this;
            if (!validate.isPropsValid([this.num]))
                return;
            var num = this.num.get();
            var licId = parseInt(this.selProd()); //Admin.Product.Id
            //zjisti product title
            var prod = null;
            _.find(this.products, function (row) { return _.find(row, function (cell) {
                prod = (cell.data);
                if (prod.Id == licId)
                    return true;
            }) != null; });
            var title = prod['title']; //(<any>prod).my.title + " / days: " + prod.Days.toString();
            Pager.ajaxGet(Pager.pathType.restServices, Admin.CmdAlocKeys_Type, Admin.CmdAlocKeys_Create(licId, num), function (first) {
                var keyList = [];
                for (var i = 0; i < num; i++) {
                    var k = { licId: licId, counter: first + i };
                    keyList.push(keys.toString(k));
                }
                var email = {
                    To: LMStatus.Cookie.EMail,
                    Cc: null,
                    Subject: CSLocalize('c270a7643d5b4fba8569342961ee108c', 'License keys'),
                    emailId: "TAdminEmailKeys",
                    productName: title,
                    isForgotPassword: false,
                    From: null,
                    Html: null,
                    isAtt: true,
                    attFile: "keys.txt",
                    attContent: keyList.join("\r\n"),
                    attContentType: "text/plain",
                };
                EMailer.sendEMail(email, function () { return _this.genOK(true); }, function (errId, errMsg) { return alert(errMsg); });
            });
        };
        KeyGenModel.prototype.cancel = function () { LMStatus.gotoReturnUrl(); };
        KeyGenModel.prototype.ok = function () { LMStatus.gotoReturnUrl(); };
        KeyGenModel.prototype.lineTxt = function (prod) {
            return CourseMeta.lib.productLineTxt(prod.ProductId).toLowerCase(); //??? bylo prod.Id ???
        };
        return KeyGenModel;
    })(schoolAdmin.CompModel);
    schoolAdmin.KeyGenModel = KeyGenModel;
    //Pager.registerAppLocator(appId, keyGenTypeName, (urlParts, completed) => completed(new KeyGenModel(urlParts)));
    blended.oldLocators.push(function ($stateProvider) { return blended.registerOldLocator($stateProvider, schoolAdmin.keyGenTypeName, schoolAdmin.appId, schoolAdmin.keyGenTypeName, 1, function (urlParts) { return new KeyGenModel(urlParts); }); });
})(schoolAdmin || (schoolAdmin = {}));
