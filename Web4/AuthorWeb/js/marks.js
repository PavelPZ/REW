var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var waObjs;
(function (waObjs) {
    var viewmark = (function (_super) {
        __extends(viewmark, _super);
        function viewmark() {
            _super.apply(this, arguments);
        }
        //vlozeni mask na pozici caret
        //static insertSnipset(mask: string, rng: textRange.IRange, self: text): textRange.IRange {
        //  var caretIdx = mask.indexOf('|');
        //  self.setText(self.text.substr(0, rng.start) + mask.replace('|', '') + self.text.substr(rng.start));
        //  self.notifyTextChanged(false);
        //  return <any>{ start: rng.start + caretIdx, end: rng.start + caretIdx };
        //}
        //obaleni selekce {**} zavorkou
        //static surroundSpan(rng: textRange.IRange, self: text): textRange.IRange {
        //  if (self.marks.findMark(rng.start).idx != self.marks.findMark(rng.end).idx) {
        //    return viewmark.insertSnipset('{*| *}', rng, self);
        //  }
        //  self.setText(self.text.substr(0, rng.start) + '{* ' + self.text.substring(rng.start, rng.end) + '*}' + self.text.substr(rng.end));
        //  self.notifyTextChanged(false);
        //  return <any>{ start: rng.start + 2, end: rng.start + 2 };
        //}
        //******* COMPILE ******
        viewmark.prototype.markToTag = function (addCtx) {
            if (this.errorMsg)
                addCtx.addToItems(('*** ERROR: ' + this.errorMsg));
            else
                throw 'not implimented';
        };
        return viewmark;
    })(waObjs.viewmarkLow);
    waObjs.viewmark = viewmark;
    var errorMark = (function (_super) {
        __extends(errorMark, _super);
        function errorMark(owner, start, end) {
            _super.call(this, owner, waObjs.markType.no, start, end);
        }
        return errorMark;
    })(viewmark);
    waObjs.errorMark = errorMark;
    var caretMark = (function (_super) {
        __extends(caretMark, _super);
        function caretMark(owner, start) {
            _super.call(this, owner, waObjs.markType.caret, start, start);
        }
        return caretMark;
    })(viewmark);
    waObjs.caretMark = caretMark;
    var styleMark = (function (_super) {
        __extends(styleMark, _super);
        function styleMark(owner, start, end, text) {
            _super.call(this, owner, waObjs.markType.style, start, end);
            this.data = text.substring(start + 2, end - 1);
        }
        //******* COMPILE ******
        styleMark.prototype.markToTag = function (addCtx) {
        };
        return styleMark;
    })(viewmark);
    waObjs.styleMark = styleMark;
    var spanMark = (function (_super) {
        __extends(spanMark, _super);
        function spanMark(owner, isOpen, start, end, text) {
            _super.call(this, owner, isOpen ? waObjs.markType.spanOpen : waObjs.markType.spanClose, start, end);
            if (isOpen)
                this.data = text.substring(start + 2, end);
        }
        //******* COMPILE ******
        spanMark.prototype.markToTag = function (addCtx) {
            switch (this.type) {
                case waObjs.markType.spanOpen:
                    addCtx.addTag({ _tg: 'span' });
                    break;
                case waObjs.markType.spanClose:
                    addCtx.stack.pop();
                    break;
            }
        };
        return spanMark;
    })(viewmark);
    waObjs.spanMark = spanMark;
    var blockPtrMark = (function (_super) {
        __extends(blockPtrMark, _super);
        function blockPtrMark(owner, myBlock) {
            _super.call(this, owner, waObjs.markType.blockPtr, 0, 1);
            this.myBlock = myBlock;
        }
        //******* COMPILE ******
        blockPtrMark.prototype.markToTag = function (addCtx) {
            _.each(this.myBlock.compileResult, function (t) { return addCtx.addToItems(t); });
        };
        return blockPtrMark;
    })(viewmark);
    waObjs.blockPtrMark = blockPtrMark;
    var viewmarks = (function (_super) {
        __extends(viewmarks, _super);
        function viewmarks(text, view) {
            _super.call(this, text, view);
            this.finishConstructor();
            if (this.view)
                this.renderHTML();
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
                sb.push('<span class="');
                sb.push(m.classes());
                sb.push('">');
                if (m.type == waObjs.markType.inline)
                    sb.push(m.html);
                else
                    sb.push(text.substring(m.start, m.end));
                sb.push('</span>');
                lastPos = m.end;
            });
            if (lastPos < text.length)
                sb.push(text.substr(lastPos));
            return sb.join('');
        };
        viewmarks.prototype.parseBrackets = function () {
            var _this = this;
            var escaped = this.escaped;
            if (_.isEmpty(escaped))
                return null;
            var match;
            var stack = [];
            var res = [];
            var st = null; //non stack brackets - {!, {+
            var addError = function (start, length, msg) {
                var vm = new errorMark(_this, start, start + length);
                vm.errorMsg = msg;
                res.push(vm);
            };
            while (match = bracketMask.exec(escaped)) {
                var m = match[0];
                if (st && m != '}') {
                    addError(st.start, st.length, 'Bracket not closed');
                    st = null;
                }
                switch (m.substr(0, 2)) {
                    case '{*':
                        var spanBr = new spanMark(this, true, match.index, match.index + m.length, escaped);
                        stack.push(spanBr);
                        res.push(spanBr);
                        break;
                    case '*}':
                        if (stack.length == 0) {
                            addError(match.index, m.length, '* bracket not opened');
                            continue;
                        }
                        var spanBr = stack.pop();
                        var endBr = new spanMark(this, false, match.index, match.index + m.length, null);
                        spanBr.closeBr = endBr;
                        res.push(endBr);
                        break;
                    case '{+':
                    case '{!':
                        st = { type: m[1] == '+' ? waObjs.markType.inline : waObjs.markType.style, start: match.index, length: m.length };
                        break;
                    case '}':
                        if (!st) {
                            addError(match.index, m.length, 'Bracket not opened');
                            continue;
                        }
                        var vm = st.type == waObjs.markType.inline ? new waObjs.inlineMark(this, st.start, st.length, match.index + m.length, escaped) : new styleMark(this, st.start, match.index + m.length, escaped);
                        res.push(vm);
                        st = null;
                        break;
                    case '{':
                        addError(match.index, m.length, 'Wrong open bracket');
                        break;
                }
            }
            _.each(stack, function (bl) { return bl.errorMsg = 'Bracket not closed'; });
            return res;
        };
        return viewmarks;
    })(waObjs.viewmarksLow);
    waObjs.viewmarks = viewmarks;
    var bracketMask = /{\+gap-fill|{\+drop-down|{\+offering|{\+word-selection|{\+\s|{!|{\*[^\s\}]*|\*}|{|}/g;
})(waObjs || (waObjs = {}));
