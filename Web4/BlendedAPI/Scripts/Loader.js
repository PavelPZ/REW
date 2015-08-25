var blended;
(function (blended) {
    function getPersistData(dataNode, taskid) {
        if (!dataNode.userData)
            return null;
        var it = dataNode.userData[taskid];
        return it ? (it.data) : null;
    }
    blended.getPersistData = getPersistData;
    function setPersistData(dataNode, taskid, modify) {
        var it = dataNode.userData ? dataNode.userData[taskid] : null;
        if (!it) {
            it = { data: {}, modified: true };
            if (!dataNode.userData)
                dataNode.userData = {};
            dataNode.userData[taskid] = it;
        }
        else
            it.modified = true;
        modify((it.data));
        return (it.data);
    }
    blended.setPersistData = setPersistData;
    //rozsireni interface o metody
    function finishProduktStart(prod) {
        $.extend(prod, blended.productEx);
        prod.moduleCache = new blended.loader.cacheOf(3);
    }
    blended.finishProduktStart = finishProduktStart;
    blended.productEx = {
        findParent: function (self, cond) {
            var c = self;
            while (c != null) {
                if (cond(c))
                    return c;
                c = c.parent;
            }
            return null;
        },
        find: function (url) {
            var pe = this;
            return (pe.nodeDir[url]);
        },
        addExternalTaskNode: function (repo) {
            var pe = this;
            if (pe.nodeDir[repo.url])
                return;
            pe.nodeDir[repo.url] = repo;
            pe.nodeList.push(repo);
        }
    };
    var cachedModule = (function () {
        function cachedModule(data, dataNode) {
            this.dataNode = dataNode;
            this.cacheOfPages = new loader.cacheOf(30);
            $.extend(this, data);
            if (!this.loc)
                this.loc = {};
            if (this.dict)
                this.dict = RJSON.unpack(this.dict);
        }
        return cachedModule;
    })();
    blended.cachedModule = cachedModule;
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
            try {
                var deferred = ctx.$q.defer();
                var prod = loader.productCache.fromCache(ctx);
                if (prod) {
                    deferred.resolve(prod);
                    return;
                }
                var href = ctx.productUrl.substr(0, ctx.productUrl.length - 1);
                var promises = _.map([href + '.js', href + '.' + LMComLib.Langs[ctx.loc] + '.js', href + '_instrs.js'], function (url) { return ctx.$http.get(blended.baseUrlRelToRoot + url, { transformResponse: function (s) { return CourseMeta.jsonParse(s); } }); });
                ctx.$q.all(promises).then(function (files) {
                    prod = files[0].data;
                    prod.url = ctx.productUrl;
                    prod.instructions = {};
                    prod.nodeDir = {};
                    prod.nodeList = [];
                    finishProduktStart(prod);
                    var loc = files[1].data;
                    if (!loc)
                        loc = {};
                    var instrs = files[2].data;
                    //vypln seznamy a adresar nodes
                    var scan;
                    scan = function (dt) {
                        prod.nodeDir[dt.url] = dt;
                        prod.nodeList.push(dt);
                        if (dt.other)
                            dt.other = $.extend(dt, JSON.parse(dt.other));
                        _.each(dt.Items, function (it) { it.parent = dt; scan(it); });
                    };
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
                    //cache
                    if (ctx.finishProduct)
                        ctx.finishProduct(prod);
                    loader.productCache.toCache(ctx, prod);
                    //user data
                    if (!!ctx.persistence)
                        ctx.persistence.loadShortUserData(ctx.userid, ctx.companyid, ctx.productUrl, function (data) {
                            prod.persistData = data;
                            //if (data) for (var p in data) { var dt = prod.nodeDir[p]; if (dt) dt.userData = data[p]; /*nektera data mohou patrit taskum*/ }
                            deferred.resolve(prod);
                        });
                    else {
                        deferred.resolve(prod);
                    }
                }, function (errors) {
                    deferred.reject();
                });
            }
            finally {
                return deferred.promise;
            }
        }
        loader.adjustProduct = adjustProduct;
        function adjustModule(ctx, modData, prod) {
            ctx = blended.finishContext(ctx);
            var deferred = ctx.$q.defer();
            try {
                var mod = prod.moduleCache.fromCache(ctx.moduleUrl, null);
                if (mod) {
                    deferred.resolve(mod);
                    return;
                }
                var href = blended.baseUrlRelToRoot + ctx.moduleUrl.substr(0, ctx.moduleUrl.length - 1) + '.' + LMComLib.Langs[ctx.loc] + '.js';
                ctx.$http.get(href).then(function (file) {
                    mod = new cachedModule(file.data, modData);
                    prod.moduleCache.toCache(ctx.moduleUrl, null, mod);
                    deferred.resolve(mod);
                }, function (errors) {
                    deferred.reject();
                });
            }
            finally {
                return deferred.promise;
            }
        }
        function adjustEx(ctx) {
            ctx = blended.finishContext(ctx);
            var deferred = ctx.$q.defer();
            try {
                adjustProduct(ctx).then(function (prod) {
                    var exNode = prod.find(ctx.Url);
                    var modData = prod.findParent(exNode, function (n) { return CourseMeta.isType(n, CourseMeta.runtimeType.mod); });
                    if (modData == null)
                        throw 'Exercise ' + ctx.Url + ' does not have module';
                    var modCtx = blended.cloneAndModifyContext(ctx, function (m) { return m.moduleurl = blended.encodeUrl(modData.url); });
                    adjustModule(modCtx, modData, prod).then(function (mod) {
                        var exServ = mod.cacheOfPages.fromCache(ctx.Url, ctx.taskid);
                        if (exServ) {
                            deferred.resolve(exServ);
                            return;
                        }
                        var href = blended.baseUrlRelToRoot + ctx.Url + '.js';
                        ctx.$http.get(href, { transformResponse: function (s) { return CourseMeta.jsonParse(s); } }).then(function (file) {
                            var pg = CourseMeta.extractEx(file.data);
                            Course.localize(pg, function (s) { return CourseMeta.localizeString(pg.url, s, mod.loc); });
                            var isGramm = CourseMeta.isType(exNode, CourseMeta.runtimeType.grammar);
                            var resolve = function (exData) {
                                var exServ = new blended.exerciseService(ctx, mod, exNode, pg, exData);
                                mod.cacheOfPages.toCache(ctx.Url, ctx.taskid, exServ);
                                deferred.resolve(exServ);
                            };
                            if (isGramm)
                                resolve();
                            else {
                                if (!!ctx.persistence)
                                    ctx.persistence.loadUserData(ctx.userid, ctx.companyid, ctx.productUrl, ctx.Url, function (exData) {
                                        if (pg.evalPage && !pg.isOldEa)
                                            exNode.ms = pg.evalPage.maxScore;
                                        //provazani produktu, stranky, modulu:
                                        if (!exData)
                                            exData = {};
                                        pg.userData = exData;
                                        pg.myNode = exNode;
                                        resolve(exData);
                                    });
                                else
                                    resolve();
                            }
                        }, function (errors) {
                            deferred.reject();
                        });
                    });
                });
            }
            finally {
                return deferred.promise;
            }
        }
        loader.adjustEx = adjustEx;
        var cacheOfProducts = (function () {
            function cacheOfProducts() {
                this.products = [];
                this.maxInsertOrder = 0;
            }
            cacheOfProducts.prototype.fromCache = function (ctx) {
                var resIt = _.find(this.products, function (it) { return it.companyid == ctx.companyid && it.userid == ctx.userid && it.subuserid == ctx.subuserid &&
                    it.persistence == ctx.persistence && it.loc == ctx.loc && it.producturl == ctx.producturl && it.taskid == ctx.taskid; });
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
                this.products.push({
                    companyid: ctx.companyid, userid: ctx.userid, data: prod, loc: ctx.loc, producturl: ctx.producturl,
                    persistence: ctx.persistence, insertOrder: this.maxInsertOrder++, subuserid: ctx.subuserid, taskid: ctx.taskid,
                });
            };
            return cacheOfProducts;
        })();
        loader.cacheOfProducts = cacheOfProducts;
        loader.productCache = new cacheOfProducts();
        //*************** CACHE modulu (v produktu), cache cviceni (v modulu)
        var cacheOf = (function () {
            function cacheOf(maxLength) {
                this.maxLength = maxLength;
                this.modules = {};
                this.maxInsertOrder = 0;
            }
            cacheOf.prototype.fromCache = function (url, taskId) {
                var urlTaskId = url + (taskId ? '|' + taskId : '');
                var cch = this.modules[urlTaskId];
                return cch ? cch.data : null;
            };
            cacheOf.prototype.toCache = function (url, taskId, mod) {
                var urlTaskId = url + (taskId ? '|' + taskId : '');
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
                this.modules[urlTaskId] = { data: mod, insertOrder: this.maxInsertOrder++ };
            };
            return cacheOf;
        })();
        loader.cacheOf = cacheOf;
    })(loader = blended.loader || (blended.loader = {}));
})(blended || (blended = {}));
