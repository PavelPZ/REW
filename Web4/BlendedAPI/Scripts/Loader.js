var blended;
(function (blended) {
    blended.baseUrlRelToRoot = '..';
    var loader;
    (function (loader) {
        //help
        var _adjustProduct = CourseMeta.lib.adjustProduct;
        var _loadLocalizedProductAndInstrs = CourseMeta.loadLocalizedProductAndInstrs;
        var _finishInstr = CourseMeta.finishInstr;
        //slovnik pro modul
        var _dict;
        var _dictItem;
        var _dictItemRoot;
        //baseUrlRelToRoot: relativni adresa rootu Web4 aplikace vyhledem k aktualni HTML strance
        function adjustProduct(ctx) {
            return angular.injector(['ng']).invoke(['$http', '$q', function ($http, $q) {
                    var deferred = $q.defer();
                    var prod = (fromCache(prods, ctx));
                    if (prod) {
                        deferred.resolve(prod);
                        return;
                    }
                    var href = ctx.producturl.substr(0, ctx.producturl.length - 1);
                    var promises = _.map([href + '.js', href + '.' + LMComLib.Langs[ctx.loc] + '.js', href + '_instrs.js'], function (url) { return $http.get(blended.baseUrlRelToRoot + url, { transformResponse: function (s) { return CourseMeta.jsonParse(s); } }); });
                    $q.all(promises).then(function (files) {
                        prod = files[0].data;
                        prod.url = ctx.producturl;
                        prod.instructions = {};
                        prod.nodeDir = {};
                        prod.nodeList = [];
                        var loc = files[1].data;
                        if (!loc)
                            loc = {};
                        var instrs = files[2].data;
                        //vypln seznamy a adresar nodes
                        var scan;
                        scan = function (dt) { if (dt.Items)
                            _.each(dt.Items, function (it) { it.parent = dt; scan(it); prod.nodeDir[dt.url] = dt; prod.nodeList.push(dt); }); };
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
                                toCache(prods, ctx, prod);
                                deferred.resolve(prod);
                            });
                        else
                            deferred.resolve(prod);
                    }, function (errors) { deferred.reject(); });
                    return deferred.promise;
                }]);
        }
        loader.adjustProduct = adjustProduct;
        function adjustEx(ctx, prodUrl, exUrl) {
            return null;
        }
        loader.adjustEx = adjustEx;
        var prods = { items: [], maxLength: 3, maxInsertOrder: 0, testUrl: false };
        var mods = { items: [], maxLength: 10, maxInsertOrder: 0, testUrl: true };
        var exs = { items: [], maxLength: 50, maxInsertOrder: 0, testUrl: true };
        function fromCache(cache, ctx) {
            var resIt = _.find(cache.items, function (it) { return it.companyid == ctx.companyid && it.userid == ctx.userid && it.adminid == ctx.adminid &&
                it.persistence == ctx.persistence && it.loc == ctx.loc && it.producturl == ctx.producturl && (!cache.testUrl || it.url == ctx.url); });
            if (resIt)
                resIt.insertOrder = cache.maxInsertOrder++;
            return resIt ? resIt.data : null;
        }
        function toCache(cache, ctx, data) {
            if (cache.items.length >= cache.maxLength) {
                var minIdx = 99999;
                for (var i = 0; i < cache.items.length; i++)
                    minIdx = Math.min(cache.items[i].insertOrder, minIdx);
                cache.items.splice(minIdx, 1);
            }
            cache.items.push({ companyid: ctx.companyid, userid: ctx.userid, data: data, loc: ctx.loc, producturl: ctx.producturl, url: cache.testUrl ? ctx.url : null, persistence: ctx.persistence, insertOrder: cache.maxInsertOrder++, adminid: ctx.adminid });
        }
    })(loader = blended.loader || (blended.loader = {}));
})(blended || (blended = {}));
