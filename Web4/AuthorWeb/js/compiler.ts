module waCompile {

  //rekurzivne:
  //- zakoduje {} zavorky (do pointeru do context.marks)
  //- provede markdown predkompilaci
  //- provede JSON tag rendering (z predkompilace). V nem pri rendering stringu rozleze string a expanduje pointery zpet na JSON tag (context.decodeMarksToTag, pouzita v compRenderTag.ts)
  //- pro kazdy block vse ulozi do block.compileResult
  export function compile(block: waObjs.block, ctx: context = null) {
    if (!ctx) ctx = new context(); var sb: Array<string> = [];
    _.each(block.childs, ch => {
      if (ch.type != waObjs.itemType.text) {
        compile(<waObjs.block> ch, ctx); //rekurzivni priprava podrizenych bloku
        ctx.encodeMarkForCompile(new waObjs.blockPtrMark(null, block), sb); //pointer na block
      } else {
        ctx.encodeTextBlockForCompile(<waObjs.text>ch, sb);
      }
    });
    var str = sb.join('');
    //common mark kompilace
    var reader = new commonmark.Parser();
    var parsed = reader.parse(str);
    //common mark render
    block.compileResult = waCompile.compileRenderTag(parsed, ctx);
  }

  //helper class pro common mark preprocess
  export class context {
    marks: Array<waObjs.viewmark> = [];
    //decode markdown-predkompilovaneho textu
    decodeMarksToTag(expandedStr: string, addCtx: waCompile.addContext) {
      if (_.isEmpty(expandedStr)) { addCtx.addToItems(<any>expandedStr); return; }
      var i = 0; var textBuf: Array<string> = [];
      while (i < expandedStr.length) {
        var act = expandedStr.charCodeAt(i); var next = i == expandedStr.length - 1 ? 0 : expandedStr.charCodeAt(i + 1);
        if (act >= waEncode.s1 && act <= waEncode.s1Max && next >= waEncode.s2 && next <= waEncode.s2Max) {
          if (textBuf.length > 0) { addCtx.addToItems(<any>(textBuf.join(''))); textBuf = []; }
          var code = this.marks[waEncode.decode(act, next)];
          i += code.end - code.start + 1;
          code.markToTag(addCtx);
        } else {
          textBuf.push(expandedStr.charAt(i));
          i++;
        }
      }
      if (textBuf.length > 0) { addCtx.addToItems(<any>(textBuf.join(''))); textBuf = []; }
    }
    //encode jedne mark
    encodeMarkForCompile(mark: waObjs.viewmark, sb: Array<string>) {
      var idx = this.marks.length; this.marks.push(mark);
      waEncode.encode(sb, idx,(mark.end - mark.start + 1) - 2);
    }
    //encode text-bloku
    encodeTextBlockForCompile(textBlock: waObjs.text, sb: Array<string>) {
      var marks = textBlock.marks.marks; var text = textBlock.text;
      if (marks == null) { if (!_.isEmpty(text)) sb.push(text); return; }
      var lastPos = 0;
      _.each(marks,(m: waObjs.viewmark) => {
        if (m.start < lastPos) throw 'm.start < lastPos';
        if (m.start > lastPos) sb.push(text.substring(lastPos, m.start));
        //m.encodeMarksForCompile(ctx, sb);
        this.encodeMarkForCompile(m, sb);
        lastPos = m.end;
      });
      if (lastPos < text.length) sb.push(text.substr(lastPos));
    }
  }

}