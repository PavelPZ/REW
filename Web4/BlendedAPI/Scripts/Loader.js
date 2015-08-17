var blended;
(function (blended) {
    blended.baseUrlRelToRoot = '..';
    function cloneContext(ctx) { var res = {}; $.extend(res, ctx); return res; }
    function finishContext(ctx) {
        if (ctx.$http && ctx.$q)
            return ctx;
        var inj = angular.injector(['ng']);
        ctx.$http = (inj.get('$http'));
        ctx.$q = (inj.get('$q'));
        return ctx;
    }
    var loader;
    (function (loader) {
        //help
        var _adjustProduct = CourseMeta.lib.adjustProduct;
        var _adjustMod = CourseMeta.lib.adjustMod;
        var _loadLocalizedProductAndInstrs = CourseMeta.loadLocalizedProductAndInstrs;
        var _finishInstr = CourseMeta.finishInstr;
        //slovnik pro modul
        var _dict;
        var _dictItem;
        var _dictItemRoot;
        //baseUrlRelToRoot: relativni adresa rootu Web4 aplikace vyhledem k aktualni HTML strance
        function adjustProduct(ctx) {
            ctx = finishContext(ctx);
            var deferred = ctx.$q.defer();
            var prod = loader.productCache.fromCache(ctx);
            if (prod) {
                deferred.resolve(prod);
                return;
            }
            var href = ctx.producturl.substr(0, ctx.producturl.length - 1);
            var promises = _.map([href + '.js', href + '.' + LMComLib.Langs[ctx.loc] + '.js', href + '_instrs.js'], function (url) { return ctx.$http.get(blended.baseUrlRelToRoot + url, { transformResponse: function (s) { return CourseMeta.jsonParse(s); } }); });
            ctx.$q.all(promises).then(function (files) {
                prod = files[0].data;
                prod.url = ctx.producturl;
                prod.instructions = {};
                prod.nodeDir = {};
                prod.nodeList = [];
                CourseMeta.extendProduct(prod);
                var loc = files[1].data;
                if (!loc)
                    loc = {};
                var instrs = files[2].data;
                //vypln seznamy a adresar nodes
                var scan;
                scan = function (dt) { if (dt.Items)
                    _.each(dt.Items, function (it) { it.parent = dt; scan(it); prod.nodeDir[it.url] = it; prod.nodeList.push(it); }); };
                scan(prod);
                //lokalizace produktu
                _.each(prod.nodeList, function (dt) { return dt.title = CourseMeta.localizeString(dt.url, dt.title, loc); });
                //finish instrukce
                if (instrs)
                    for (var p in instrs) {
                        var pg = CourseMeta.extractEx(instrs[p]);
                        if (pg == null) {
                            debugger;
                            throw 'missing instr';
                        }
                        pg.Items = _.filter(pg.Items, function (it) { return !_.isString(it); });
                        Course.localize(pg, function (s) { return CourseMeta.localizeString(pg.url, s, loc); });
                        Course.scanEx(pg, function (tg) { if (!_.isString(tg))
                            delete tg.id; }); //instrukce nemohou mit tag.id, protoze se ID tlucou s ID ze cviceni
                        prod.instructions[p] = JsRenderTemplateEngine.render("c_genitems", pg);
                    }
                //merge s user data
                if (!!ctx.persistence)
                    ctx.persistence.loadShortUserData(ctx.userid, ctx.companyid, ctx.producturl, function (data) {
                        if (data)
                            for (var p in data) {
                                var dt = prod.nodeDir[p];
                                dt.userData = data[p];
                            }
                        loader.productCache.toCache(ctx, prod);
                        deferred.resolve(prod);
                    });
                else
                    deferred.resolve(prod);
            }, function (errors) {
                deferred.reject();
            });
            return deferred.promise;
        }
        loader.adjustProduct = adjustProduct;
        function adjustModule(ctx, prod) {
            ctx = finishContext(ctx);
            var deferred = ctx.$q.defer();
            var mod = prod.moduleCache.fromCache(ctx.url);
            if (mod) {
                deferred.resolve(mod);
                return;
            }
            var href = blended.baseUrlRelToRoot + ctx.url.substr(0, ctx.url.length - 1) + '.' + LMComLib.Langs[ctx.loc] + '.js';
            ctx.$http.get(href).then(function (file) {
                mod = file.data;
                if (!mod.loc)
                    mod.loc = {};
                if (mod.dict)
                    mod.dict = RJSON.unpack(mod.dict);
                mod.cacheOfPages = new loader.cacheOf(30);
                prod.moduleCache.toCache(ctx.url, mod);
                deferred.resolve(mod);
            }, function (errors) {
                deferred.reject();
            });
            return deferred.promise;
        }
        function adjustEx(ctx) {
            ctx = finishContext(ctx);
            var deferred = ctx.$q.defer();
            adjustProduct(ctx).then(function (prod) {
                var exNode = prod.find(ctx.url);
                var mod = prod.findParent(exNode, function (n) { return CourseMeta.isType(n, CourseMeta.runtimeType.mod); });
                if (mod == null)
                    throw 'Exercise ' + ctx.url + ' does not have module';
                var modCtx = cloneContext(ctx);
                modCtx.url = mod.url;
                adjustModule(modCtx, prod).then(function (mod) {
                    var pg = mod.cacheOfPages.fromCache(ctx.url);
                    if (pg) {
                        deferred.resolve(pg);
                        return;
                    }
                    var href = blended.baseUrlRelToRoot + ctx.url + '.js';
                    ctx.$http.get(href, { transformResponse: function (s) { return CourseMeta.jsonParse(s); } }).then(function (file) {
                        var pg = CourseMeta.extractEx(file.data);
                        Course.localize(pg, function (s) { return CourseMeta.localizeString(pg.url, s, mod.loc); });
                        var isGramm = CourseMeta.isType(exNode, CourseMeta.runtimeType.grammar);
                        mod.cacheOfPages.toCache(ctx.url, pg);
                        if (isGramm)
                            deferred.resolve(exNode);
                        else {
                            if (!!ctx.persistence)
                                ctx.persistence.loadUserData(ctx.userid, ctx.companyid, ctx.producturl, ctx.url, function (exData) {
                                    if (pg.evalPage && !pg.isOldEa)
                                        exNode.ms = pg.evalPage.maxScore;
                                    //provazani produktu, stranky, modulu:
                                    if (!exData)
                                        exData = {};
                                    pg.userData = exData;
                                    pg.myNode = exNode;
                                    deferred.resolve(exNode);
                                });
                            else
                                deferred.resolve(exNode);
                        }
                    }, function (errors) {
                        deferred.reject();
                    });
                });
            });
            return deferred.promise;
        }
        loader.adjustEx = adjustEx;
        var cacheOfProducts = (function () {
            function cacheOfProducts() {
                this.products = [];
                this.maxInsertOrder = 0;
            }
            cacheOfProducts.prototype.fromCache = function (ctx) {
                var resIt = _.find(this.products, function (it) { return it.companyid == ctx.companyid && it.userid == ctx.userid && it.adminid == ctx.adminid &&
                    it.persistence == ctx.persistence && it.loc == ctx.loc && it.producturl == ctx.producturl; });
                if (resIt)
                    resIt.insertOrder = this.maxInsertOrder++;
                return resIt ? resIt.data : null;
            };
            cacheOfProducts.prototype.toCache = function (ctx, prod) {
                if (this.products.length >= 3) {
                    var minIdx = 99999;
                    for (var i = 0; i < this.products.length; i++)
                        minIdx = Math.min(this.products[i].insertOrder, minIdx);
                    this.products.splice(minIdx, 1);
                }
                this.products.push({ companyid: ctx.companyid, userid: ctx.userid, data: prod, loc: ctx.loc, producturl: ctx.producturl, url: null, persistence: ctx.persistence, insertOrder: this.maxInsertOrder++, adminid: ctx.adminid, taskid: ctx.taskid });
            };
            return cacheOfProducts;
        })();
        loader.cacheOfProducts = cacheOfProducts;
        loader.productCache = new cacheOfProducts();
        //*************** CACHE modulu (v produkut), cache cviceni (v modulu)
        var cacheOf = (function () {
            function cacheOf(maxLength) {
                this.maxLength = maxLength;
                this.modules = {};
                this.maxInsertOrder = 0;
            }
            cacheOf.prototype.fromCache = function (url) {
                var cch = this.modules[url];
                return cch ? cch.data : null;
            };
            cacheOf.prototype.toCache = function (url, mod) {
                var cnt = 0;
                var minIdx = 99999;
                var propName;
                for (var p in this.modules) {
                    cnt++;
                    var m = this.modules[p];
                    if (m.insertOrder >= minIdx)
                        return;
                    minIdx = m.insertOrder;
                    propName = p;
                }
                if (cnt > 5)
                    delete this.modules[propName];
                this.modules[url] = { data: mod, insertOrder: this.maxInsertOrder++ };
            };
            return cacheOf;
        })();
        loader.cacheOf = cacheOf;
    })(loader = blended.loader || (blended.loader = {}));
})(blended || (blended = {}));
