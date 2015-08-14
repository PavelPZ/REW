module waObjs {

  export class viewmark extends viewmarkLow {

    data: string; //pro inline: data za gap-fill, pro style: mezi {!}, pro span: za {*. pred prvni mezerou }

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
    markToTag(addCtx: waCompile.addContext) {
      if (this.errorMsg) addCtx.addToItems(<any>('*** ERROR: ' + this.errorMsg));
      else throw 'not implimented';
    }
  }

  export class errorMark extends viewmark { //error mark
    constructor(owner: viewmarksLow, start: number, end: number) { super(owner, markType.no, start, end); }
  }

  export class caretMark extends viewmark { //mark, reprezentujici caret
    constructor(owner: viewmarksLow, start: number) { super(owner, markType.caret, start, start); }
  }

  export class styleMark extends viewmark { //{!} zavorka

    constructor(owner: viewmarksLow, start: number, end: number, text: string) {
      super(owner, markType.style, start, end);
      this.data = text.substring(start + 2, end - 1);
    }
    //******* COMPILE ******
    markToTag(addCtx: waCompile.addContext) {
    }
  }

  export class spanMark extends viewmark { //oteviraci {* zavorka

    closeBr: viewmark;

    constructor(owner: viewmarksLow, isOpen: boolean, start: number, end: number, text: string) {
      super(owner, isOpen ? markType.spanOpen : markType.spanClose, start, end);
      if (isOpen) this.data = text.substring(start + 2, end);
    }

    //******* COMPILE ******
    markToTag(addCtx: waCompile.addContext) {
      switch (this.type) {
        case markType.spanOpen: addCtx.addTag(<CourseModel.tag>{ _tg: 'span' }); break;
        case markType.spanClose: addCtx.stack.pop(); break;
      }
    }
  }

  export class blockPtrMark extends viewmark { //zakodovany block

    constructor(owner: viewmarksLow, public myBlock: block) { super(owner, markType.blockPtr, 0, 1); }

    //******* COMPILE ******
    markToTag(addCtx: waCompile.addContext) {
      _.each(this.myBlock.compileResult, t => addCtx.addToItems(t));
    }
  }

  export class viewmarks extends viewmarksLow {

    constructor(text: string, view: JQuery) {
      super(text, view);
      this.finishConstructor();
      if (this.view) this.renderHTML();
    }

    html(): string {
      var text = this.text;
      if (this.marks == null) return text;
      var sb: Array<string> = []; var lastPos = 0;
      _.each(this.marks, m => {
        if (m.start < lastPos) throw 'm.start < lastPos';
        if (m.start > lastPos) sb.push(text.substring(lastPos, m.start));
        sb.push('<span class="'); sb.push(m.classes()); sb.push('">');
        if (m.type == markType.inline)
          sb.push((<inlineMark>m).html);
        else
          sb.push(text.substring(m.start, m.end));
        sb.push('</span>');
        lastPos = m.end;
      });
      if (lastPos < text.length) sb.push(text.substr(lastPos));
      return sb.join('');
    }

    parseBrackets(): Array<viewmarkLow> {
      var escaped = this.escaped;
      if (_.isEmpty(escaped)) return null;
      var match: RegExpExecArray;
      var stack: Array<spanMark> = [];
      var res: Array<viewmark> = [];
      var st: { type: markType; start: number; length: number; } = null; //non stack brackets - {!, {+

      var addError = (start: number, length: number, msg: string) => {
        var vm = new errorMark(this, start, start + length); vm.errorMsg = msg;
        res.push(vm);
      };

      while (match = bracketMask.exec(escaped)) {
        var m = match[0];
        if (st && m != '}') {//neuzavrena {! nebo {+ zavorka
          addError(st.start, st.length, 'Bracket not closed'); st = null;
        }
        switch (m.substr(0, 2)) {
          case '{*':
            var spanBr = new spanMark(this, true, match.index, match.index + m.length, escaped);
            stack.push(spanBr); res.push(spanBr);
            break;
          case '*}':
            if (stack.length == 0) { addError(match.index, m.length, '* bracket not opened'); continue; }
            var spanBr = stack.pop();
            var endBr = new spanMark(this, false, match.index, match.index + m.length, null);
            spanBr.closeBr = endBr;
            res.push(endBr);
            break;
          case '{+':
          case '{!':
            st = { type: m[1] == '+' ? markType.inline : markType.style, start: match.index, length: m.length };
            break;
          case '}':
            if (!st) { addError(match.index, m.length, 'Bracket not opened'); continue; }
            var vm = st.type == markType.inline ? new inlineMark(this, st.start, st.length, match.index + m.length, escaped) : new styleMark(this, st.start, match.index + m.length, escaped)
            res.push(vm);
            st = null;
            break;
          case '{':
            addError(match.index, m.length, 'Wrong open bracket');
            break;
        }
      }
      _.each(stack, bl => bl.errorMsg = 'Bracket not closed');
      return res;
    }
  }

  var bracketMask = /{\+gap-fill|{\+drop-down|{\+offering|{\+word-selection|{\+\s|{!|{\*[^\s\}]*|\*}|{|}/g;
} 