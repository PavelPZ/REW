module waObjs {
  export class inlineMark extends viewmark { //{+} zavorka

    tag: string;
    encoded: string;
    marks: metaJS.viewmarks;
    parsRng: textRange.IRange;
    html: string;

    constructor(owner: viewmarksLow, start: number, startLen: number, end: number, encoded: string) {
      super(owner, markType.inline, start, end);
      this.encoded = encoded;
      this.tag = encoded.substr(start + 2, startLen - 2);
      this.marks = new metaJS.viewmarks(this.tag, null); //pro jistotu
      var body = encoded.substring(start + startLen, end - 1);
      var match = inlineParsMask.exec(body);
      if (!match) {
        this.html = encoded;
        if (!_.isEmpty(body.trim())) this.errorMsg = 'Wrong format';
        return;
      }
      var m1 = match[1]; var m2 = match[2]; var m3 = match[3]; var m4 = match[4]; var m5 = match[5];
      this.html = '{+' + this.tag;
      if (m1) {
        this.html += m1;
        this.parsRng = { start: start + startLen + m1.length, end: start + startLen + m1.length + m2.length };
        if (encoded.substring(this.parsRng.start, this.parsRng.end) != m2) throw 'encoded.substring(this.parsRng.start, this.parsRng.end';
      }
      if (m2) {
        this.marks = new metaJS.viewmarks(this.tag, m2);
        this.html += this.marks.html();
      }
      if (m3) this.html += m3;
      if (m4) this.html += m4;
      if (m5) this.html += m5;
      this.html += '}';
    }

    markToTag(addCtx: waCompile.addContext) {
      if (this.errorMsg) return;
      if (this.marks.json) addCtx.addToItems(this.marks.json);
    }

    editAttributeName(text: text, rng: textRange.IRange, insertSemicolon: boolean, name: metaJS.nameMark) {
      new waObjs.DlgPropName(text.edit, rng, this.$self, this, snipset => text.insertSnipset((insertSemicolon ? '; ' : '') + snipset, rng));
    }

    keyDown(text: text, rng: textRange.IRange, ev: JQueryKeyEventObject): keyDownResult {
      var parsRng = this.parsRng;
      if (!parsRng || rng.start < parsRng.start || rng.end > parsRng.end) return keyDownResult.no;
      //typ klavesy
      var isEq = waObjs.isEq(ev.keyCode); var isSemicolon = waObjs.isSemicolon(ev.keyCode); var isBracket = ev.keyCode == waObjs.key.openBracket;
      if (!isEq && !isSemicolon && !isBracket) return keyDownResult.no;
      //isBracket a prazdna zavorka
      if (isBracket && (!this.marks.marks || this.marks.marks.length == 0)) {
        this.editAttributeName(text, rng, false, null);
        return keyDownResult.false;
      }
      var pos = rng.start - this.parsRng.start;

      //*********************** '=;'
      if (isEq || isSemicolon) { 
        //spocitej marks jako po dokonceni stisku klavesy
        var futured = this.encoded.substring(parsRng.start, rng.start) + (isEq ? '=' : ';') + this.encoded.substring(rng.start, parsRng.end);
        var act = new metaJS.viewmarks(this.tag, futured);
        if (act.hasSeriousError()) return keyDownResult.no;
        if (isEq) {
          //najdi posledni mark pred aktulni EQ mark
          var nameMark: metaJS.nameMark = null;
          _.find(act.marks,(m: metaJS.nameMark) => { if (m.type == waObjs.markType.propName) nameMark = m; return m.type == waObjs.markType.propEq && m.start >= pos; });
          if (!nameMark) throw 'Something wrong: !mark';
          alert('select value');
        } else {
          this.editAttributeName(text, rng, true, null);
        }
        return keyDownResult.false;
      }

      //*********************** '{'
      var act = this.marks;
      if (act.hasSeriousError()) return keyDownResult.no;

      //find act mark
      var nameMark: metaJS.nameMark = null; var valueMark: metaJS.valueMark = null;
      _.find(act.marks,(m: metaJS.viewmark) => {
        if (m.type == waObjs.markType.propName) { nameMark = <metaJS.nameMark>m; valueMark = null; }
        else if (m.type == waObjs.markType.propValue) { nameMark = null; if (m.start <= pos && m.end >= pos) { valueMark = <metaJS.valueMark>m; return true; } }
        return m.end > pos;
      });

      if (nameMark != null)
        new waObjs.DlgEditInline(text.edit, rng, this.$self, this, () => null);
        //alert('edit attribute name');
      else if (valueMark != null) alert('edit value');
      else this.editAttributeName(text, rng, false, nameMark);

      return keyDownResult.false;
    }
  }
  var inlineParsMask = /^(?:(\()([^\)]*)(\)))?(?:(\s)(.*))?$/;
} 