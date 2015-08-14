module schoolAdmin {
  export class Products extends CompModel {
    constructor(urlParts: string[]) {
      super(productsTypeName, urlParts);
      var self = this;
      this.product = validate.create(validate.types.required);
      this.product.subscribe((pr: string) => {
        if (!pr) { self.selectMode(0); return; }
        self.selectMode(CourseMeta.lib.isTest(CourseMeta.lib.findProduct(pr)) ? 1 : 2);
      });
      this.days = daysProp(this.product, this); this.days(0);
      this.add = () => {
        if (!validate.isPropsValid([this.product, this.days])) return;
        var prodId = this.product.get();
        var days = CourseMeta.lib.isTest(CourseMeta.lib.findProduct(prodId)) ? 0 : this.days();
        var nu: Product = new Product({ Id: 0, LastCounter: 0, Days: days, ProductId: prodId, Deleted: false, UsedKeys: 0 }, this);
        this.products.push(nu); this.product(undefined); this.days(0);
        this.refreshHtml();
      };
      this.del = (act: Product) => { if (act.data.Id == 0) { self.products = _.without(self.products, act); this.refreshHtml(); } else act.Deleted(true);}
      this.undel = (act: Product) => { act.Deleted(false); }
    }

    products: Array<Product>; //ko.observableArray<Product>(); // of Product
    product: validate.ValidObservable<any>;
    selectMode = ko.observable(0); //0..unknown, 1..test, 2..kurz
    days: validate.ValidObservable<any>;
    add; del; undel; //edit; editCancel; editOk;

    refreshHtml() {
      Pager.renderTemplateEx('schoolProductsProductPlace', 'schoolProductsProduct', this);
    }


    // UPDATE
    update(completed: () => void): void {
      Pager.ajaxPost(
        Pager.pathType.restServices,
        Admin.CmdGetProducts_Type,
        Admin.CmdGetProducts_Create(this.CompanyId, false),
        (res: Admin.Product[]) => {
          var admProds: Array<Product> = [];
          _.each<Admin.Product>(res, pr => {
            if (CourseMeta.lib.findProduct(pr.ProductId) != null) admProds.push(new Product(pr, this));
          });
          this.products = admProds;
          setTimeout(() => this.refreshHtml(), 1);
          //this.products(_.map(res, (act: Admin.Product) => new Product(act, this)));
          completed();
        });
    }

    ok() {
      var prods = _.map(this.products,(p: Product) => p.data);
      Pager.ajaxPost(
        Pager.pathType.restServices,
        Admin.CmdSetProducts_Type,
        Admin.CmdSetProducts_Create(this.CompanyId, prods),
        () => LMStatus.gotoReturnUrl()
        );
    }
    cancel() { LMStatus.gotoReturnUrl(); }

    //allProducts() { return prods.Items; }
    allProducts(): Array<CourseMeta.data> {
      var comp = _.find(Login.myData.Companies, c => c.Id == this.CompanyId);
      var res: Array<CourseMeta.data> = comp.companyProducts && comp.companyProducts.length > 0 ? comp.companyProducts.slice() : [];
      if (comp.PublisherOwnerUserId == 0) res.pushArray(CourseMeta.allProductList);
      return res;
    }
  }

  export class Product {
    constructor(public data: Admin.Product, public owner: Products) {
      this.Deleted.subscribe(val => data.Deleted = val);
      var prod = CourseMeta.lib.findProduct(data.ProductId);
      //this.product = validate.create(validate.types.required); this.product(data.ProductId);
      this.days = CourseMeta.lib.keyTitle(prod, data.Days);
      this.title = prod.title;
      this.lineTxt = CourseMeta.lib.productLineTxt(data.ProductId).toLowerCase(); 
      //this.EditVisible(!CourseMeta.isType(CourseMeta.lib.findProduct(data.ProductId), CourseMeta.runtimeType.test));
    }
    Deleted = ko.observable<boolean>(false);
    //edited = ko.observable<boolean>(false);
    title: string; //KnockoutComputed<string>;
    lineTxt: string; //KnockoutComputed<string>;
    //product: validate.ValidObservable; //Id produktu
    days: string; //validate.ValidObservable;
    //daysText: string;
    //EditVisible = ko.observable<boolean>(true);
  }

  function daysProp(product: validate.ValidObservable<any>, owner: Products): validate.ValidObservable<any> {
    return validate.create(validate.types.rangeMin,(prop) => {
      prop.min = 0;
      prop.customValidation = days => validateProduct(product, days, owner.products);
    })
  }
  function validateProduct(product: validate.ValidObservable<any>, days: string, allProds: Product[]): string {
    var prod = CourseMeta.lib.findProduct(<string>product());
    var d = parseInt(days); var isTest = CourseMeta.lib.isTest(prod);
    if (!isTest && d < 1) return validate.messages.required();
    var error = _.any(allProds, p => p.data.ProductId == prod.url && (isTest || p.data.Days == d)) ? CSLocalize('8139bf0c5fed4b92ba7ce97a50034aa6', 'The same product with the same license validity already exists!') : null;
    product.message(error ? error : '');
    return error ? ' ' : null;
  }

  Pager.registerAppLocator(appId, productsTypeName,(urlParts, completed) => completed(new Products(urlParts)));
  //Pager.registerAppLocator(productsTypeName, (url: CompIdUrl, completed: (pg: Pager.Page) => void ) => completed(new Products(url.CompanyId)));
}

