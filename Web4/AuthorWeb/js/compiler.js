var waCompile;
(function (waCompile) {
    //rekurzivne:
    //- zakoduje {} zavorky (do pointeru do context.marks)
    //- provede markdown predkompilaci
    //- provede JSON tag rendering (z predkompilace). V nem pri rendering stringu rozleze string a expanduje pointery zpet na JSON tag (context.decodeMarksToTag, pouzita v compRenderTag.ts)
    //- pro kazdy block vse ulozi do block.compileResult
    function compile(block, ctx) {
        if (ctx === void 0) { ctx = null; }
        if (!ctx)
            ctx = new context();
        var sb = [];
        _.each(block.childs, function (ch) {
            if (ch.type != waObjs.itemType.text) {
                compile(ch, ctx); //rekurzivni priprava podrizenych bloku
                ctx.encodeMarkForCompile(new waObjs.blockPtrMark(null, block), sb); //pointer na block
            }
            else {
                ctx.encodeTextBlockForCompile(ch, sb);
            }
        });
        var str = sb.join('');
        //common mark kompilace
        var reader = new commonmark.Parser();
        var parsed = reader.parse(str);
        //common mark render
        block.compileResult = waCompile.compileRenderTag(parsed, ctx);
    }
    waCompile.compile = compile;
    //helper class pro common mark preprocess
    var context = (function () {
        function context() {
            this.marks = [];
        }
        //decode markdown-predkompilovaneho textu
        context.prototype.decodeMarksToTag = function (expandedStr, addCtx) {
            if (_.isEmpty(expandedStr)) {
                addCtx.addToItems(expandedStr);
                return;
            }
            var i = 0;
            var textBuf = [];
            while (i < expandedStr.length) {
                var act = expandedStr.charCodeAt(i);
                var next = i == expandedStr.length - 1 ? 0 : expandedStr.charCodeAt(i + 1);
                if (act >= waEncode.s1 && act <= waEncode.s1Max && next >= waEncode.s2 && next <= waEncode.s2Max) {
                    if (textBuf.length > 0) {
                        addCtx.addToItems((textBuf.join('')));
                        textBuf = [];
                    }
                    var code = this.marks[waEncode.decode(act, next)];
                    i += code.end - code.start + 1;
                    code.markToTag(addCtx);
                }
                else {
                    textBuf.push(expandedStr.charAt(i));
                    i++;
                }
            }
            if (textBuf.length > 0) {
                addCtx.addToItems((textBuf.join('')));
                textBuf = [];
            }
        };
        //encode jedne mark
        context.prototype.encodeMarkForCompile = function (mark, sb) {
            var idx = this.marks.length;
            this.marks.push(mark);
            waEncode.encode(sb, idx, (mark.end - mark.start + 1) - 2);
        };
        //encode text-bloku
        context.prototype.encodeTextBlockForCompile = function (textBlock, sb) {
            var _this = this;
            var marks = textBlock.marks.marks;
            var text = textBlock.text;
            if (marks == null) {
                if (!_.isEmpty(text))
                    sb.push(text);
                return;
            }
            var lastPos = 0;
            _.each(marks, function (m) {
                if (m.start < lastPos)
                    throw 'm.start < lastPos';
                if (m.start > lastPos)
                    sb.push(text.substring(lastPos, m.start));
                //m.encodeMarksForCompile(ctx, sb);
                _this.encodeMarkForCompile(m, sb);
                lastPos = m.end;
            });
            if (lastPos < text.length)
                sb.push(text.substr(lastPos));
        };
        return context;
    })();
    waCompile.context = context;
})(waCompile || (waCompile = {}));
