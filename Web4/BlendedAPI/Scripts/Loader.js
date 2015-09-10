var blended;
(function (blended) {
    function getPersistWrapper(dataNode, taskid, createProc) {
        if (createProc) {
            if (!dataNode.userData)
                dataNode.userData = {};
            var res = dataNode.userData[taskid];
            if (res)
                return res;
            res = { long: null, short: createProc(), modified: true };
            dataNode.userData[taskid] = res;
            return res;
        }
        else {
            if (!dataNode.userData)
                return null;
            return dataNode.userData[taskid];
        }
    }
    blended.getPersistWrapper = getPersistWrapper;
    function getPersistData(dataNode, taskid) {
        var res = getPersistWrapper(dataNode, taskid);
        return res ? res.short : null;
    }
    blended.getPersistData = getPersistData;
    function setPersistData(dataNode, taskid, modify) {
        var it = dataNode.userData ? dataNode.userData[taskid] : null;
        if (!it) {
            it = { short: {}, modified: true, long: null };
            if (!dataNode.userData)
                dataNode.userData = {};
            dataNode.userData[taskid] = it;
        }
        else
            it.modified = true;
        modify((it.short));
        return (it.short);
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
        },
        saveProduct: function (ctx, completed) {
            var pe = this;
            var toSave = [];
            _.each(pe.nodeList, function (nd) {
                if (!nd.userData)
                    return;
                for (var p in nd.userData) {
                    try {
                        var d = nd.userData[p];
                        if (!d.modified)
                            return;
                        d.modified = false;
                        toSave.push({ url: nd.url, taskId: p, shortData: JSON.stringify(d.short), longData: d.long ? JSON.stringify(d.long) : null });
                    }
                    finally {
                        delete p.long;
                    }
                }
            });
            if (toSave.length == 0) {
                completed();
                return;
            }
            proxies.vyzva57services.saveUserData(ctx.companyid, ctx.userDataId(), ctx.productUrl, toSave, completed);
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
    var cacheExercise = (function () {
        function cacheExercise(mod, dataNode, pageJsonML) {
            this.mod = mod;
            this.dataNode = dataNode;
            this.pageJsonML = pageJsonML;
        }
        return cacheExercise;
    })();
    blended.cacheExercise = cacheExercise;
    var loader;
    (function (loader) {
        //baseUrlRelToRoot: relativni adresa rootu Web4 aplikace vyhledem k aktualni HTML strance
        function adjustProduct(ctx) {
            try {
                var deferred = ctx.$q.defer();
                var fromCache = loader.productCache.fromCache(ctx, deferred);
                if (fromCache.prod) {
                    deferred.resolve(fromCache.prod);
                    return;
                } //produkt je jiz nacten, resolve.
                if (!fromCache.startReading)
                    return; //produkt se zacal nacitat jiz drive - deferred se pouze ulozi do seznamu deferreds.
                //novy start nacitani produktu
                var href = ctx.productUrl.substr(0, ctx.productUrl.length - 1);
                var promises = _.map([href + '.js', href + '.' + LMComLib.Langs[ctx.loc] + '.js', href + '_instrs.js'], function (url) { return ctx.$http.get(blended.baseUrlRelToRoot + url, { transformResponse: function (s) { return CourseMeta.jsonParse(s); } }); });
                ctx.$q.all(promises).then(function (files) {
                    var prod = files[0].data;
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
                            dt = $.extend(dt, JSON.parse(dt.other.replace(/'/g, '"')));
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
                    if (ctx.finishProduct)
                        ctx.finishProduct(prod);
                    //user data
                    proxies.vyzva57services.getShortProductDatas(ctx.companyid, ctx.userDataId(), ctx.productUrl, function (res) {
                        _.each(res, function (it) {
                            var node = prod.nodeDir[it.url];
                            if (!node)
                                debugger;
                            if (!node.userData)
                                node.userData = {};
                            var taskData = node.userData[it.taskId];
                            var shortLong = { modified: false, long: null, short: JSON.parse(it.shortData) };
                            if (!taskData)
                                node.userData[it.taskId] = shortLong;
                            //else debugger; /*something wrong*/
                        });
                        //product nacten, resolve vsechny cekajici deferreds
                        loader.productCache.resolveDefereds(fromCache.startReading, prod);
                    });
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
                            var exServ = new cacheExercise(mod, exNode, file.data);
                            mod.cacheOfPages.toCache(ctx.Url, ctx.taskid, exServ);
                            deferred.resolve(exServ);
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
            //data != null => ihned vrat. Jinak startReading!=null => spust nacitani, jinak ukonci.
            cacheOfProducts.prototype.fromCache = function (ctx, defered) {
                var resIt = _.find(this.products, function (it) { return it.companyid == ctx.companyid && it.onbehalfof == ctx.userDataId() &&
                    it.loc == ctx.loc && it.producturl == ctx.producturl; });
                //jiz nacteno nebo neni defered => return
                if (resIt && resIt.data)
                    return { prod: resIt.data };
                if (!defered)
                    return {};
                //nenacteno
                var justCreated = false;
                if (!resIt) {
                    resIt = this.toCache(ctx); //vytvor polozku v cache
                    resIt.defereds = [];
                    justCreated = true; //start noveho nacitani
                }
                ;
                resIt.defereds.push(defered);
                resIt.insertOrder = this.maxInsertOrder++; //naposledy pouzity produkt (kvuli vyhazovani z cache)
                return { startReading: justCreated ? resIt : null };
            };
            cacheOfProducts.prototype.toCache = function (ctx) {
                if (this.products.length >= 3) {
                    var minIdx = 99999;
                    for (var i = 0; i < this.products.length; i++)
                        minIdx = Math.min(this.products[i].insertOrder, minIdx);
                    this.products.splice(minIdx, 1);
                }
                var res;
                this.products.push(res = {
                    companyid: ctx.companyid, loc: ctx.loc, producturl: ctx.producturl, onbehalfof: ctx.userDataId(),
                    data: null, insertOrder: this.maxInsertOrder++, taskid: null, loginid: -1, lickeys: null, persistence: null
                });
                return res;
            };
            cacheOfProducts.prototype.resolveDefereds = function (resIt, data) {
                resIt.data = data;
                var defs = resIt.defereds;
                delete resIt.defereds;
                _.each(defs, function (def) { return def.resolve(data); });
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
