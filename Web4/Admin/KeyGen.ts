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

module schoolAdmin {
  export class KeyGenModel extends CompModel {
    constructor(urlParts: string[]) {
      super(keyGenTypeName, urlParts);
      this.num = validate.create(validate.types.rangeMin, (prop) => { prop.min = 1; });
      this.selProd.subscribe(() => { this.num(""); this.genOK(false); });
      this.num.subscribe(() => { this.genOK(false); });
    }

    products: Utils.layoutCell[][] = [];
    selProd = ko.observable<string>();
    button = Pager.ButtonType.cancel;
    num: validate.ValidObservable<any>;
    genOK = ko.observable<boolean>(false);

    // UPDATE
    update(completed: () => void): void {
      Pager.ajaxGet(
        Pager.pathType.restServices,
        Admin.CmdGetProducts_Type,
        Admin.CmdGetProducts_Create(this.CompanyId, true),
        (allRes: Admin.Product[]) => {
          var res: Array<Admin.Product> = [];
          _.each(allRes, pr => {
            var prod = CourseMeta.lib.findProduct(pr.ProductId); if (!prod) return;
            res.push(pr); pr['title'] = CourseMeta.lib.keyTitle(prod, pr.Days);
          });
          for (var i = 0; i < res.length; i += 2) {
            var l = res[i], r = res[i + 1];
            this.products.push([
              Utils.createLayoutCell(6, "TProdCard", l),
              Utils.createLayoutCell(6, "TProdCard", r ? r : null)
            ]);
          }
          completed();
        });
    }

    generate() {
      if (!validate.isPropsValid([this.num])) return;
      var num = this.num.get();
      var licId = parseInt(this.selProd()); //Admin.Product.Id
      //zjisti product title
      var prod: Admin.Product = null;
      _.find<Utils.layoutCell[]>(this.products, row => _.find<Utils.layoutCell>(row, cell => {
        prod = <Admin.Product>(cell.data);
        if (prod.Id == licId) return true;
      }) != null);
      var title: string = prod['title']; //(<any>prod).my.title + " / days: " + prod.Days.toString();
      Pager.ajaxGet(
        Pager.pathType.restServices,
        Admin.CmdAlocKeys_Type,
        Admin.CmdAlocKeys_Create(licId, num),
        (first: number) => {
          var keyList = [];
          for (var i = 0; i < num; i++) {
            var k: keys.Key = { licId: licId, counter: first + i };
            keyList.push(keys.toString(k));
          }
          var email: emailKeys = {
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
          EMailer.sendEMail(email,
            () => this.genOK(true),
            (errId: number, errMsg: string) => alert(errMsg)
            );

        }
        );
    }

    cancel() { LMStatus.gotoReturnUrl(); }
    ok() { LMStatus.gotoReturnUrl(); }

    lineTxt(prod: Admin.Product): string {
      return CourseMeta.lib.productLineTxt(prod.ProductId).toLowerCase(); //??? bylo prod.Id ???
    }

  }

  interface emailKeys extends LMComLib.CmdEMail {
    productName: string;
  }

  Pager.registerAppLocator(appId, keyGenTypeName, (urlParts, completed) => completed(new KeyGenModel(urlParts)));
  //Pager.registerAppLocator(keyGenTypeName, (url: CompIdUrl, completed: (pg: Pager.Page) => void ) => completed(new KeyGenModel(url.CompanyId)));
}

