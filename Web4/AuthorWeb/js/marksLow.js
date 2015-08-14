var waObjs;
(function (waObjs) {
    (function (markType) {
        markType[markType["no"] = 0] = "no";
        markType[markType["spanOpen"] = 1] = "spanOpen";
        markType[markType["spanClose"] = 2] = "spanClose";
        markType[markType["inline"] = 3] = "inline";
        markType[markType["style"] = 4] = "style";
        markType[markType["blockPtr"] = 5] = "blockPtr";
        markType[markType["caret"] = 6] = "caret";
        //pro property editor
        markType[markType["propName"] = 7] = "propName";
        markType[markType["propEq"] = 8] = "propEq";
        markType[markType["propValue"] = 9] = "propValue";
    })(waObjs.markType || (waObjs.markType = {}));
    var markType = waObjs.markType;
    var viewmarkLow = (function () {
        function viewmarkLow(owner, type, start, end) {
            this.owner = owner;
            this.type = type;
            this.start = start;
            this.end = end;
        }
        viewmarkLow.prototype.classes = function () {
            if (this.errorMsg)
                return 'error';
            switch (this.type) {
                case markType.spanOpen:
                case markType.spanClose: return 'span';
                case markType.inline: return 'inline';
                case markType.style: return 'style';
                case markType.caret: return '';
                case markType.propValue: return 'prop-value';
                case markType.propName: return 'prop-name';
                default: throw 'not implemented';
            }
        };
        return viewmarkLow;
    })();
    waObjs.viewmarkLow = viewmarkLow;
    var viewmarksLow = (function () {
        function viewmarksLow(text, view) {
            this.text = text;
            this.view = view;
            this.escaped = waEncode.escape(text);
        }
        viewmarksLow.prototype.finishConstructor = function () {
            this.marks = this.parseBrackets();
            if (this.marks)
                this.marks = _.sortBy(this.marks, function (m) { return m.end > m.start ? m.start * 2 : m.start * 2 - 0.5; });
        };
        viewmarksLow.prototype.hasError = function () { return _.any(this.marks, function (m) { return !!m.errorMsg; }); };
        //najde mark a jeji index, obsahujici caret. includeStart: do mark se pocita i kurzor pred pocatkem
        viewmarksLow.prototype.findMark = function (pos) {
            if (!this.marks)
                return { mark: null, idx: -1 };
            for (var i = 0; i < this.marks.length; i++) {
                var m = this.marks[i];
                if (m.type == markType.caret || m.errorMsg)
                    continue;
                if (m.start < pos && m.end > pos)
                    return { idx: i, mark: this.marks[i] };
            }
            return { mark: null, idx: -1 };
        };
        viewmarksLow.prototype.renderHTML = function () {
            var html = this.html();
            //console.log(html);
            this.view.html(html);
            if (this.marks)
                _.each(_.zip(this.marks, this.view.find('> span')), function (arr) {
                    arr[0].$self = $(arr[1]);
                    //zip inner spans
                    var inline = (arr[0]);
                    if (inline.type != markType.inline)
                        return;
                    if (inline.marks.marks)
                        _.each(_.zip(inline.marks.marks, inline.$self.find('> span')), function (arr) { return arr[0].$self = $(arr[1]); });
                });
        };
        viewmarksLow.prototype.insertCaretMark = function (pos) {
            var m = new waObjs.caretMark(this, pos);
            if (!this.marks)
                this.marks = [];
            else
                this.marks = _.filter(this.marks, function (m) { return m.type != markType.caret; });
            this.marks.push(m);
            this.renderHTML();
            return m;
        };
        viewmarksLow.prototype.html = function () { throw 'not implemented'; };
        viewmarksLow.prototype.parseBrackets = function () { throw 'not implemented'; };
        return viewmarksLow;
    })();
    waObjs.viewmarksLow = viewmarksLow;
})(waObjs || (waObjs = {}));
