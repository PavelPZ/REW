var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var schoolAdmin;
(function (schoolAdmin) {
    var Products = (function (_super) {
        __extends(Products, _super);
        function Products(urlParts) {
            var _this = this;
            _super.call(this, schoolAdmin.productsTypeName, urlParts);
            this.products = ko.observableArray(); // of Product
            this.selectMode = ko.observable(0); //0..unknown, 1..test, 2..kurz
            var self = this;
            this.product = validate.create(validate.types.required);
            this.product.subscribe(function (pr) {
                if (!pr) {
                    self.selectMode(0);
                    return;
                }
                self.selectMode(CourseMeta.lib.isTest(CourseMeta.lib.findProduct(pr)) ? 1 : 2);
            });
            this.days = daysProp(this.product, this);
            this.days(0);
            this.add = function () {
                if (!validate.isPropsValid([_this.product, _this.days]))
                    return;
                var prodId = _this.product.get();
                var days = CourseMeta.lib.isTest(CourseMeta.lib.findProduct(prodId)) ? 0 : _this.days();
                var nu = new Product({ Id: 0, LastCounter: 0, Days: days, ProductId: prodId, Deleted: false, UsedKeys: 0 }, _this);
                _this.products.push(nu);
                _this.product(undefined);
                _this.days(0);
            };
            this.del = function (act) { if (act.data.Id == 0)
                self.products.remove(act);
            else
                act.Deleted(true); };
            this.undel = function (act) { act.Deleted(false); };
            //this.edit = (act: Product) => { act.product.set(act.data.ProductId); act.days.set(act.data.Days); act.edited(true); };
            //this.editCancel = (act: Product) => { act.edited(false); };
            //this.editOk = (act: Product) => { if (!validate.isPropsValid([act.product, act.days])) return; act.data.ProductId = act.product.get(); act.data.Days = act.days.get(); act.edited(false); };
        }
        // UPDATE
        Products.prototype.update = function (completed) {
            var _this = this;
            Pager.ajaxPost(Pager.pathType.restServices, Admin.CmdGetProducts_Type, Admin.CmdGetProducts_Create(this.CompanyId, false), function (res) {
                var admProds = [];
                _.each(res, function (pr) {
                    if (CourseMeta.lib.findProduct(pr.ProductId) != null)
                        admProds.push(new Product(pr, _this));
                });
                _this.products(admProds);
                //this.products(_.map(res, (act: Admin.Product) => new Product(act, this)));
                completed();
            });
        };
        Products.prototype.ok = function () {
            var prods = _.map(this.products(), function (p) { return p.data; });
            Pager.ajaxPost(Pager.pathType.restServices, Admin.CmdSetProducts_Type, Admin.CmdSetProducts_Create(this.CompanyId, prods), function () { return LMStatus.gotoReturnUrl(); });
        };
        Products.prototype.cancel = function () { LMStatus.gotoReturnUrl(); };
        //allProducts() { return prods.Items; }
        Products.prototype.allProducts = function () {
            var _this = this;
            var comp = _.find(Login.myData.Companies, function (c) { return c.Id == _this.CompanyId; });
            var res = comp.companyProducts && comp.companyProducts.length > 0 ? comp.companyProducts.slice() : [];
            if (comp.PublisherOwnerUserId == 0)
                res.pushArray(CourseMeta.allProductList);
            return res;
        };
        return Products;
    })(schoolAdmin.CompModel);
    schoolAdmin.Products = Products;
    var Product = (function () {
        function Product(data, owner) {
            this.data = data;
            this.Deleted = ko.observable(false);
            this.Deleted.subscribe(function (val) { return data.Deleted = val; });
            var prod = CourseMeta.lib.findProduct(data.ProductId);
            //this.product = validate.create(validate.types.required); this.product(data.ProductId);
            this.days = CourseMeta.lib.keyTitle(prod, data.Days);
            this.title = prod.title;
            this.lineTxt = CourseMeta.lib.productLineTxt(data.ProductId).toLowerCase();
            //this.EditVisible(!CourseMeta.isType(CourseMeta.lib.findProduct(data.ProductId), CourseMeta.runtimeType.test));
        }
        return Product;
    })();
    schoolAdmin.Product = Product;
    function daysProp(product, owner) {
        return validate.create(validate.types.rangeMin, function (prop) {
            prop.min = 0;
            prop.customValidation = function (days) { return validateProduct(product, days, owner.products()); };
        });
    }
    function validateProduct(product, days, allProds) {
        var prod = CourseMeta.lib.findProduct(product());
        var d = parseInt(days);
        var isTest = CourseMeta.lib.isTest(prod);
        if (!isTest && d < 1)
            return validate.messages.required();
        var error = _.any(allProds, function (p) { return p.data.ProductId == prod.url && (isTest || p.data.Days == d); }) ? CSLocalize('8139bf0c5fed4b92ba7ce97a50034aa6', 'The same product with the same license validity already exists!') : null;
        product.message(error ? error : '');
        return error ? ' ' : null;
    }
    Pager.registerAppLocator(schoolAdmin.appId, schoolAdmin.productsTypeName, function (urlParts, completed) { return completed(new Products(urlParts)); });
})(schoolAdmin || (schoolAdmin = {}));
