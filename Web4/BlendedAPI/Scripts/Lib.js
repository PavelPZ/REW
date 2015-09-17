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
    function downloadExcelFile(url) {
        var hiddenIFrameID = 'hiddenDownloader';
        var iframe = ($('#hiddenDownloader')[0]);
        if (!iframe) {
            iframe = ($('<iframe id="hiddenDownloader" style="display:none" src="about:blank"></iframe>')[0]);
            $('body').append(iframe);
        }
        iframe.src = url;
    }
    blended.downloadExcelFile = downloadExcelFile;
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
        else if (!ctx.onbehalfof)
            ctx.onbehalfof = '';
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
    function waitForEvaluation(sc) { return !!(sc.flag & CourseModel.CourseDataFlag.needsEval); }
    blended.waitForEvaluation = waitForEvaluation;
    function scorePercent(sc) { return sc.ms == 0 ? -1 : Math.round(sc.s / sc.ms * 100); }
    blended.scorePercent = scorePercent;
    function donesPercent(sc) { return sc.count == 0 ? -1 : Math.round((sc.dones || 0) / sc.count * 100); }
    blended.donesPercent = donesPercent;
    function scoreText(sc) { var pr = scorePercent(sc); return pr < 0 ? '' : pr.toString() + '%'; }
    blended.scoreText = scoreText;
    function agregateShorts(shorts) {
        var res = $.extend({}, blended.shortDefaultAgreg);
        blended.persistUserIsDone(res, true);
        _.each(shorts, function (short) {
            if (!short) {
                blended.persistUserIsDone(res, false);
                return;
            }
            var done = blended.persistUserIsDone(short);
            res.waitForEvaluation = res.waitForEvaluation || short.waitForEvaluation;
            if (!done)
                blended.persistUserIsDone(res, false);
            res.count += short.count || 1;
            res.dones += (short.dones ? short.dones : (blended.persistUserIsDone(short) ? 1 : 0));
            if (done) {
                res.ms += short.ms || 0;
                res.s += short.s || 0;
            }
            //elapsed, beg a end
            res.beg = setDate(res.beg, short.beg, true);
            res.end = setDate(res.end, short.end, false);
            res.elapsed += short.elapsed || 0;
            res.sPlay += short.sPlay;
            res.sPRec += short.sPRec;
            res.sRec += short.sRec;
        });
        res.score = blended.scorePercent(res);
        res.finished = blended.donesPercent(res);
        return res;
    }
    blended.agregateShorts = agregateShorts;
    function agregateAutoHuman(node, taskId) {
        var res = { auto: { ms: 0, s: 0, score: 0 }, human: { ms: 0, s: 0, score: 0 } };
        _.each(node.Items, function (nd) {
            if (!blended.isEx(nd))
                return;
            var us = blended.getPersistWrapper(nd, taskId);
            var done = us && blended.persistUserIsDone(us.short);
            if (!done || !nd.ms)
                return;
            if (!!(us.short.flag & CourseModel.CourseDataFlag.pcCannotEvaluate)) {
                res.human.ms += nd.ms;
                res.human.s += us.short.s;
            }
            else {
                res.auto.ms += nd.ms;
                res.auto.s += us.short.s;
            }
        });
        res.auto.score = res.auto.ms ? Math.round(res.auto.s / res.auto.ms * 100) : -1;
        res.human.score = res.human.ms ? Math.round(res.human.s / res.human.ms * 100) : -1;
        return res;
    }
    blended.agregateAutoHuman = agregateAutoHuman;
    function agregateShortFromNodes(node, taskId, moduleAlowFinishWhenUndone /*do vyhodnoceni zahrn i nehotova cviceni*/) {
        var res = $.extend({}, blended.shortDefaultAgreg);
        blended.persistUserIsDone(res, true);
        _.each(node.Items, function (nd) {
            if (!blended.isEx(nd))
                return;
            res.count++;
            var us = blended.getPersistWrapper(nd, taskId);
            var done = us && blended.persistUserIsDone(us.short);
            res.waitForEvaluation = res.waitForEvaluation || (done && waitForEvaluation(us.short));
            if (done)
                res.dones += (us.short.dones ? us.short.dones : (blended.persistUserIsDone(us.short) ? 1 : 0));
            if (!done)
                blended.persistUserIsDone(res, false);
            if (nd.ms) {
                if (done) {
                    res.ms += nd.ms;
                    res.s += us.short.s;
                }
                else if (moduleAlowFinishWhenUndone) {
                    res.ms += nd.ms;
                }
            }
            if (us && us.short) {
                res.beg = setDate(res.beg, us.short.beg, true);
                res.end = setDate(res.end, us.short.end, false);
                res.elapsed += us.short.elapsed;
                res.sPlay += us.short.sPlay;
                res.sPRec += us.short.sPRec;
                res.sRec += us.short.sRec;
            }
        });
        res.score = blended.scorePercent(res);
        res.finished = blended.donesPercent(res);
        return res;
    }
    blended.agregateShortFromNodes = agregateShortFromNodes;
    blended.shortDefault = { elapsed: 0, beg: Utils.nowToNum(), end: Utils.nowToNum(), ms: 0, s: 0, sPlay: 0, sPRec: 0, sRec: 0, flag: 0 };
    blended.shortDefaultAgreg = { elapsed: 0, beg: Utils.nowToNum(), end: Utils.nowToNum(), ms: 0, s: 0, count: 0, dones: 0, sPlay: 0, sPRec: 0, sRec: 0, waitForEvaluation: false, flag: 0 };
    function setDate(dt1, dt2, min) { if (!dt1)
        return dt2; if (!dt2)
        return dt1; if (min)
        return dt2 > dt1 ? dt1 : dt2;
    else
        return dt2 < dt1 ? dt1 : dt2; }
})(blended || (blended = {}));
