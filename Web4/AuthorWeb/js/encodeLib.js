var waEncode;
(function (waEncode) {
    //**************** Escape, bracket content encoding, ...
    function escape(s) {
        if (_.isEmpty(s))
            return s;
        var res = [];
        var encodeNext = false;
        for (var i = 0; i < s.length; i++) {
            var ch = s.charAt(i);
            if (encodeNext) {
                encodeNext = false;
                if (ch == '\n') {
                    res.push(escapeChar + ch);
                    continue;
                }
                res.push(escapeFlag);
                var idx = ch.charCodeAt(0);
                if (idx > waEncode.s2Max - waEncode.s2)
                    throw 'idx > s2Max - s2';
                res.push(String.fromCharCode(waEncode.s2 + idx));
                continue;
            }
            if (ch != escapeChar) {
                res.push(ch);
                continue;
            }
            encodeNext = true;
        }
        return res.join('');
    }
    waEncode.escape = escape;
    function unEscape(s) {
        if (_.isEmpty(s))
            return s;
        var res = [];
        var encodeNext = false;
        for (var i = 0; i < s.length; i++) {
            var ch = s.charAt(i);
            if (encodeNext) {
                encodeNext = false;
                var idx = ch.charCodeAt(0);
                res.push(String.fromCharCode(idx - waEncode.s2));
                continue;
            }
            if (ch != escapeFlag) {
                res.push(ch);
                continue;
            }
            encodeNext = true;
        }
        return res.join('');
    }
    waEncode.unEscape = unEscape;
    var escapeFlag = '\u167F';
    var escapeChar = '\\';
    waEncode.s1 = 0x1400;
    waEncode.s1Max = 0x15FF;
    var s1First = '\u1400';
    var s1Last = '\u15FF';
    waEncode.s2 = 0x4E00;
    waEncode.s2Max = 0x9FCC;
    var s2First = '\u4E00';
    var s2Last = '\u9FCC';
    var lowerMask = 0x000001ff;
    var fill = '≡';
    function firstCode(sb, idx) { sb.push(String.fromCharCode(waEncode.s1 + (idx & lowerMask))); }
    function secondCode(sb, idx) { sb.push(String.fromCharCode(waEncode.s2 + (idx >> 9))); }
    function encode(sb, idx, length) {
        firstCode(sb, idx);
        secondCode(sb, idx);
        for (var i = 0; i < length; i++)
            sb.push(fill);
    }
    waEncode.encode = encode;
    function decode(ch1, ch2) {
        return ch1 - waEncode.s1 + ((ch2 - waEncode.s2) << 9);
    }
    waEncode.decode = decode;
    //*********** styleParams
    var styleParams = (function () {
        function styleParams() {
            this.attrs = {};
            this.values = [];
        }
        styleParams.prototype.id = function () { return !this.ids || this.ids.length == 0 ? null : this.ids[0]; };
        styleParams.prototype.fillParValue = function (parVal, trim) {
            if (trim === void 0) { trim = true; }
            var match = waEncode.inlineParsMask.exec(parVal);
            if (!match)
                return;
            var par = match[1];
            this.valStr = match[2];
            this.fillPar(par);
            this.values = !this.valStr ? [] : _.map(this.valStr.split('|'), function (v) { return unEscape(trim ? v.trim() : v); });
            return this;
        };
        styleParams.prototype.fillPar = function (par, trim) {
            var _this = this;
            if (trim === void 0) { trim = true; }
            if (_.isEmpty(par))
                return this;
            var kvs = _.map(par.replace(/[\n\s;]+$/, "").split(';'), function (p) {
                var idx = p.indexOf('=');
                return idx < 0 ? [p] : [p.substring(0, idx), p.substr(idx + 1)];
            });
            var ids = kvs[0][0].trim().split(/\s+/);
            if (kvs.length > 1 || kvs[0].length > 1) {
                kvs[0][0] = ids[ids.length - 1];
                this.ids = ids.slice(0, ids.length - 1);
                _.each(kvs, function (kv) { return _this.attrs[kv[0].trim()] = unEscape(trim && kv[1] ? kv[1].trim() : kv[1]); });
            }
            else
                this.ids = ids;
            return this;
        };
        return styleParams;
    })();
    waEncode.styleParams = styleParams;
    waEncode.inlineParsMask = /^(?:\((.*?)\))?(?:\s(.*))?$/;
    var inlineParams = (function () {
        function inlineParams(parVal) {
            this.values = [];
            var match = waEncode.inlineParsMask.exec(parVal);
            if (!match)
                return;
            this.pars = match[1];
            var valStr = this.vals = match[2];
            this.values = !valStr ? [] : _.map(valStr.split('|'), function (v) { return unEscape(v); });
        }
        return inlineParams;
    })();
    waEncode.inlineParams = inlineParams;
})(waEncode || (waEncode = {}));
