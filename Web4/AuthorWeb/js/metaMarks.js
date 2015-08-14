var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var metaJS;
(function (metaJS) {
    //******************* propEditor marks
    var viewmarks = (function (_super) {
        __extends(viewmarks, _super);
        function viewmarks(tag /*napr. gap-fill*/, text /*napr. id=gp1; smart-width=sm1; */ /*, view: JQuery*/) {
            var _this = this;
            _super.call(this, text, null);
            this.tag = tag;
            this.propDir = metaJS.metaObj.types[this.tag].propDir;
            this.props = metaJS.metaObj.types[this.tag].props;
            this.finishConstructor();
            this.json = { _tg: this.tag };
            if (this.hasError())
                return;
            var props = _.filter(this.marks, function (m) { return m.type == waObjs.markType.propName; });
            var checkUniq = {}; //pro check unique prop names
            _.each(props, function (p) {
                if (checkUniq[p.prop.name]) {
                    p.errorMsg = 'Duplicated attribute name: ' + p.prop.name;
                    return;
                }
                checkUniq[p.prop.name] = p;
                p.value.errorMsg = p.prop.validateAndAssign(p.value.value, _this.json);
                if (p.value.errorMsg)
                    return;
            });
        }
        viewmarks.prototype.html = function () {
            var text = this.text;
            if (this.marks == null)
                return text;
            var sb = [];
            var lastPos = 0;
            _.each(this.marks, function (m) {
                if (m.start < lastPos)
                    throw 'm.start < lastPos';
                if (m.start > lastPos)
                    sb.push(text.substring(lastPos, m.start));
                var isFake = m.type == waObjs.markType.propEq;
                if (!isFake) {
                    sb.push('<span class="');
                    sb.push(m.classes());
                    sb.push('">');
                }
                sb.push(text.substring(m.start, m.end));
                if (!isFake)
                    sb.push('</span>');
                lastPos = m.end;
            });
            if (lastPos < text.length)
                sb.push(text.substr(lastPos));
            return sb.join('');
        };
        viewmarks.prototype.hasSeriousError = function () { return _.any(this.marks, function (m) { return !!m.errorMsg && m.type != waObjs.markType.propName && m.type != waObjs.markType.propValue; }); };
        viewmarks.prototype.parseBrackets = function () {
            var txt = this.text;
            if (_.isEmpty(txt))
                return null;
            var match;
            var lastPos = 0;
            var res = [];
            while (match = nameValueMask.exec(this.escaped)) {
                var m = match.index;
                var m1 = match[1].length;
                var m2 = match[2].length;
                var m3 = match[3].length;
                var m4 = match[4].length;
                var m5 = match[5].length;
                var name = new nameMark(this, m + m1, m + m1 + m2);
                viewmark.createEqMark(res, this, m + m1 + m2 + m3, m + m1 + m2 + m3 + m4);
                var value = new valueMark(this, m + m1 + m2 + m3 + m4, m + m1 + m2 + m3 + m4 + m5);
                name.value = value;
                value.name = name; //name.before = before; name.after = after; 
                res.push(name);
                res.push(value);
                if (lastPos < match.index)
                    viewmark.createErrorMark(res, this, lastPos, match.index, 'Wrong format, [attribute name] expected');
                lastPos = match.index + match[0].length;
            }
            if (lastPos < txt.trim().length)
                viewmark.createErrorMark(res, this, lastPos, txt.length, 'Wrong format, [attribute name]=[value] expected.');
            res = _.sortBy(res, function (m) { return m.start; });
            return res;
        };
        return viewmarks;
    })(waObjs.viewmarksLow);
    metaJS.viewmarks = viewmarks;
    var nameValueMask = /(\s*)([\w-]*)(\s*)(=)([^;]*);?/g;
    var viewmark = (function (_super) {
        __extends(viewmark, _super);
        function viewmark() {
            _super.apply(this, arguments);
        }
        viewmark.createErrorMark = function (res, owner, start, end, errorMsg) {
            var m = new viewmark(owner, waObjs.markType.no, start, end);
            m.errorMsg = errorMsg;
            res.push(m);
        };
        viewmark.createEqMark = function (res, owner, start, end) {
            res.push(new viewmark(owner, waObjs.markType.propEq, start, end));
        };
        return viewmark;
    })(waObjs.viewmarkLow);
    metaJS.viewmark = viewmark;
    var nameMark = (function (_super) {
        __extends(nameMark, _super);
        function nameMark(owner, start, end) {
            _super.call(this, owner, waObjs.markType.propName, start, end);
            var name = owner.text.substring(start, end);
            this.prop = this.owner.propDir[name];
            if (!this.prop)
                this.errorMsg = 'Wrong attribute name: ' + name;
        }
        return nameMark;
    })(viewmark);
    metaJS.nameMark = nameMark;
    var valueMark = (function (_super) {
        __extends(valueMark, _super);
        function valueMark(owner, start, end) {
            _super.call(this, owner, waObjs.markType.propValue, start, end);
            this.value = owner.text.substring(start, end);
        }
        return valueMark;
    })(viewmark);
    metaJS.valueMark = valueMark;
})(metaJS || (metaJS = {}));
