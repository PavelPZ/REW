var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var waObjs;
(function (waObjs) {
    var inlineMark = (function (_super) {
        __extends(inlineMark, _super);
        function inlineMark(owner, start, startLen, end, encoded) {
            _super.call(this, owner, waObjs.markType.inline, start, end);
            this.encoded = encoded;
            this.tag = encoded.substr(start + 2, startLen - 2);
            this.marks = new metaJS.viewmarks(this.tag, null); //pro jistotu
            var body = encoded.substring(start + startLen, end - 1);
            var match = inlineParsMask.exec(body);
            if (!match) {
                this.html = encoded;
                if (!_.isEmpty(body.trim()))
                    this.errorMsg = 'Wrong format';
                return;
            }
            var m1 = match[1];
            var m2 = match[2];
            var m3 = match[3];
            var m4 = match[4];
            var m5 = match[5];
            this.html = '{+' + this.tag;
            if (m1) {
                this.html += m1;
                this.parsRng = { start: start + startLen + m1.length, end: start + startLen + m1.length + m2.length };
                if (encoded.substring(this.parsRng.start, this.parsRng.end) != m2)
                    throw 'encoded.substring(this.parsRng.start, this.parsRng.end';
            }
            if (m2) {
                this.marks = new metaJS.viewmarks(this.tag, m2);
                this.html += this.marks.html();
            }
            if (m3)
                this.html += m3;
            if (m4)
                this.html += m4;
            if (m5)
                this.html += m5;
            this.html += '}';
        }
        inlineMark.prototype.markToTag = function (addCtx) {
            if (this.errorMsg)
                return;
            if (this.marks.json)
                addCtx.addToItems(this.marks.json);
        };
        inlineMark.prototype.editAttributeName = function (text, rng, insertSemicolon, name) {
            new waObjs.DlgPropName(text.edit, rng, this.$self, this, function (snipset) { return text.insertSnipset((insertSemicolon ? '; ' : '') + snipset, rng); });
        };
        inlineMark.prototype.keyDown = function (text, rng, ev) {
            var parsRng = this.parsRng;
            if (!parsRng || rng.start < parsRng.start || rng.end > parsRng.end)
                return waObjs.keyDownResult.no;
            //typ klavesy
            var isEq = waObjs.isEq(ev.keyCode);
            var isSemicolon = waObjs.isSemicolon(ev.keyCode);
            var isBracket = ev.keyCode == waObjs.key.openBracket;
            if (!isEq && !isSemicolon && !isBracket)
                return waObjs.keyDownResult.no;
            //isBracket a prazdna zavorka
            if (isBracket && (!this.marks.marks || this.marks.marks.length == 0)) {
                this.editAttributeName(text, rng, false, null);
                return waObjs.keyDownResult.false;
            }
            var pos = rng.start - this.parsRng.start;
            //*********************** '=;'
            if (isEq || isSemicolon) {
                //spocitej marks jako po dokonceni stisku klavesy
                var futured = this.encoded.substring(parsRng.start, rng.start) + (isEq ? '=' : ';') + this.encoded.substring(rng.start, parsRng.end);
                var act = new metaJS.viewmarks(this.tag, futured);
                if (act.hasSeriousError())
                    return waObjs.keyDownResult.no;
                if (isEq) {
                    //najdi posledni mark pred aktulni EQ mark
                    var nameMark = null;
                    _.find(act.marks, function (m) { if (m.type == waObjs.markType.propName)
                        nameMark = m; return m.type == waObjs.markType.propEq && m.start >= pos; });
                    if (!nameMark)
                        throw 'Something wrong: !mark';
                    alert('select value');
                }
                else {
                    this.editAttributeName(text, rng, true, null);
                }
                return waObjs.keyDownResult.false;
            }
            //*********************** '{'
            var act = this.marks;
            if (act.hasSeriousError())
                return waObjs.keyDownResult.no;
            //find act mark
            var nameMark = null;
            var valueMark = null;
            _.find(act.marks, function (m) {
                if (m.type == waObjs.markType.propName) {
                    nameMark = m;
                    valueMark = null;
                }
                else if (m.type == waObjs.markType.propValue) {
                    nameMark = null;
                    if (m.start <= pos && m.end >= pos) {
                        valueMark = m;
                        return true;
                    }
                }
                return m.end > pos;
            });
            if (nameMark != null)
                new waObjs.DlgEditInline(text.edit, rng, this.$self, this, function () { return null; });
            else if (valueMark != null)
                alert('edit value');
            else
                this.editAttributeName(text, rng, false, nameMark);
            return waObjs.keyDownResult.false;
        };
        return inlineMark;
    })(waObjs.viewmark);
    waObjs.inlineMark = inlineMark;
    var inlineParsMask = /^(?:(\()([^\)]*)(\)))?(?:(\s)(.*))?$/;
})(waObjs || (waObjs = {}));
