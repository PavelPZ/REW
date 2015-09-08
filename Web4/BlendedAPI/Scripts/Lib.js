var blended;
(function (blended) {
    (function (levelIds) {
        levelIds[levelIds["A1"] = 0] = "A1";
        levelIds[levelIds["A2"] = 1] = "A2";
        levelIds[levelIds["B1"] = 2] = "B1";
        levelIds[levelIds["B2"] = 3] = "B2";
    })(blended.levelIds || (blended.levelIds = {}));
    var levelIds = blended.levelIds;
    function encodeUrl(url) {
        if (!url)
            return url;
        return url.replace(/\//g, '!');
    }
    blended.encodeUrl = encodeUrl;
    function decodeUrl(url) {
        if (!url)
            return url;
        return url.replace(/\!/g, '/');
    }
    blended.decodeUrl = decodeUrl;
    function newGuid() { return (new Date().getTime() + (startGui++)).toString(); }
    blended.newGuid = newGuid;
    var startGui = new Date().getTime();
    blended.baseUrlRelToRoot = '..'; //jak se z root stranky dostat do rootu webu
    function cloneAndModifyContext(ctx, modify) {
        if (modify === void 0) { modify = null; }
        var res = {};
        $.extend(res, ctx);
        if (modify) {
            modify(res);
            finishContext(res);
        }
        return res;
    }
    blended.cloneAndModifyContext = cloneAndModifyContext;
    function finishContext(ctx) {
        ctx.productUrl = decodeUrl(ctx.producturl);
        ctx.Url = decodeUrl(ctx.url);
        ctx.pretestUrl = decodeUrl(ctx.pretesturl);
        ctx.moduleUrl = decodeUrl(ctx.moduleurl);
        ctx.userDataId = function () { return ctx.onbehalfof || ctx.loginid; };
        if (_.isString(ctx.onbehalfof))
            ctx.onbehalfof = parseInt((ctx.onbehalfof));
        if (_.isString(ctx.loginid))
            ctx.loginid = parseInt((ctx.loginid));
        if (_.isString(ctx.companyid))
            ctx.companyid = parseInt((ctx.companyid));
        if (_.isString(ctx.loc))
            ctx.loc = parseInt((ctx.loc));
        if (!ctx.$http) {
            var inj = angular.injector(['ng']);
            ctx.$http = (inj.get('$http'));
            ctx.$q = (inj.get('$q'));
        }
        return ctx;
    }
    blended.finishContext = finishContext;
    function scorePercent(sc) { return sc.ms == 0 ? -1 : Math.round(sc.s / sc.ms * 100); }
    blended.scorePercent = scorePercent;
    function donesPercent(sc) { return sc.count == 0 ? -1 : Math.round((sc.dones || 0) / sc.count * 100); }
    blended.donesPercent = donesPercent;
    function scoreText(sc) { var pr = scorePercent(sc); return pr < 0 ? '' : pr.toString() + '%'; }
    blended.scoreText = scoreText;
    function agregateShorts(shorts) {
        var res = $.extend({}, blended.shortDefault);
        res.done = true;
        _.each(shorts, function (short) {
            if (!short) {
                res.done = false;
                return;
            }
            var done = short.done;
            res.done = res.done && done;
            res.count += short.count || 1;
            res.dones += (short.dones ? short.dones : (short.done ? 1 : 0));
            if (done) {
                res.ms += short.ms || 0;
                res.s += short.s || 0;
            }
            //elapsed, beg a end
            res.beg = setDate(res.beg, short.beg, true);
            res.end = setDate(res.end, short.end, false);
            res.elapsed += short.elapsed || 0;
            res.sumPlay += short.sumPlay;
            res.sumPlayRecord += short.sumPlayRecord;
            res.sumRecord += short.sumRecord;
        });
        res.score = blended.scorePercent(res);
        res.finished = blended.donesPercent(res);
        return res;
    }
    blended.agregateShorts = agregateShorts;
    function agregateShortFromNodes(node, taskId, moduleAlowFinishWhenUndone /*do vyhodnoceni zahrn i nehotova cviceni*/) {
        var res = $.extend({}, blended.shortDefault);
        res.done = true;
        _.each(node.Items, function (nd) {
            if (!blended.isEx(nd))
                return;
            res.count++;
            var us = blended.getPersistWrapper(nd, taskId);
            var done = us && us.short.done;
            if (done)
                res.dones += (us.short.dones ? us.short.dones : (us.short.done ? 1 : 0));
            res.done = res.done && done;
            if (nd.ms) {
                if (done) {
                    res.ms += nd.ms;
                    res.s += us.short.s;
                }
                else if (moduleAlowFinishWhenUndone) {
                    res.ms += nd.ms;
                }
            }
            if (us) {
                res.beg = setDate(res.beg, us.short.beg, true);
                res.end = setDate(res.end, us.short.end, false);
                res.elapsed += us.short.elapsed;
                res.sumPlay += us.short.sumPlay;
                res.sumPlayRecord += us.short.sumPlayRecord;
                res.sumRecord += us.short.sumRecord;
            }
        });
        res.score = blended.scorePercent(res);
        res.finished = blended.donesPercent(res);
        return res;
    }
    blended.agregateShortFromNodes = agregateShortFromNodes;
    blended.shortDefault = { elapsed: 0, beg: Utils.nowToNum(), end: Utils.nowToNum(), done: false, ms: 0, s: 0, count: 0, dones: 0, sumPlay: 0, sumPlayRecord: 0, sumRecord: 0 };
    function setDate(dt1, dt2, min) { if (!dt1)
        return dt2; if (!dt2)
        return dt1; if (min)
        return dt2 > dt1 ? dt1 : dt2;
    else
        return dt2 < dt1 ? dt1 : dt2; }
})(blended || (blended = {}));
