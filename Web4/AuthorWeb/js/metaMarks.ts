module metaJS {

  //******************* propEditor marks
  export class viewmarks extends waObjs.viewmarksLow {

    //pro this.tag: meta informace o jeho properties
    propDir: { [propId: string]: propImpl };
    props: Array<propImpl>;

    json: CourseModel.tag;

    constructor(public tag: string /*napr. gap-fill*/, text: string/*napr. id=gp1; smart-width=sm1; *//*, view: JQuery*/) {
      super(text, null);
      this.propDir = metaObj.types[this.tag].propDir;
      this.props = metaObj.types[this.tag].props;
      this.finishConstructor();
      this.json = <any>{ _tg: this.tag };
      if (this.hasError()) return;
      var props = _.filter(this.marks, m => m.type == waObjs.markType.propName);
      var checkUniq: { [id: string]: nameMark; } = {}; //pro check unique prop names
      _.each(props,(p: nameMark) => {
        if (checkUniq[p.prop.name]) { p.errorMsg = 'Duplicated attribute name: ' + p.prop.name; return; }
        checkUniq[p.prop.name] = p;
        p.value.errorMsg = p.prop.validateAndAssign(p.value.value, this.json); if (p.value.errorMsg) return;
      })
    }

    html(): string {
      var text = this.text;
      if (this.marks == null) return text;
      var sb: Array<string> = []; var lastPos = 0;
      _.each(this.marks, m => {
        if (m.start < lastPos) throw 'm.start < lastPos';
        if (m.start > lastPos) sb.push(text.substring(lastPos, m.start));
        var isFake = m.type == waObjs.markType.propEq;
        if (!isFake) { sb.push('<span class="'); sb.push(m.classes()); sb.push('">'); }
        sb.push(text.substring(m.start, m.end));
        if (!isFake) sb.push('</span>');
        lastPos = m.end;
      });
      if (lastPos < text.length) sb.push(text.substr(lastPos));
      return sb.join('');
    }

    hasSeriousError(): boolean { return _.any(this.marks, m => !!m.errorMsg && m.type != waObjs.markType.propName && m.type != waObjs.markType.propValue); }

    parseBrackets(): Array<waObjs.viewmarkLow> {
      var txt = this.text;
      if (_.isEmpty(txt)) return null;
      var match: RegExpExecArray; var lastPos = 0; var res: Array<viewmark> = [];
      while (match = nameValueMask.exec(this.escaped)) { //1..gap, 2..name, 3..gap, 4..value
        var m = match.index; var m1 = match[1].length/*' '*/; var m2 = match[2].length/*name*/; var m3 = match[3].length/*' '*/; var m4 = match[4].length/*'='*/; var m5 = match[5].length/*value*/;
        var name = new nameMark(this, m + m1, m + m1 + m2);
        viewmark.createEqMark(res, this, m + m1 + m2 + m3, m + m1 + m2 + m3 + m4);
        var value = new valueMark(this, m + m1 + m2 + m3 + m4, m + m1 + m2 + m3 + m4 + m5);
        name.value = value; value.name = name; //name.before = before; name.after = after; 
        res.push(name); res.push(value);
        if (lastPos < match.index) viewmark.createErrorMark(res, this, lastPos, match.index, 'Wrong format, [attribute name] expected');
        lastPos = match.index + match[0].length;
      }
      if (lastPos < txt.trim().length) viewmark.createErrorMark(res, this, lastPos, txt.length, 'Wrong format, [attribute name]=[value] expected.');
      res = _.sortBy(res, m => m.start);
      return res;
    }
  } var nameValueMask = /(\s*)([\w-]*)(\s*)(=)([^;]*);?/g;

  export class viewmark extends waObjs.viewmarkLow {
    owner: viewmarks;
    static createErrorMark(res: Array<viewmark>, owner: waObjs.viewmarksLow, start: number, end: number, errorMsg: string) {
      var m = new viewmark(owner, waObjs.markType.no, start, end); m.errorMsg = errorMsg;
      res.push(m);
    }
    static createEqMark(res: Array<viewmark>, owner: waObjs.viewmarksLow, start: number, end: number) {
      res.push(new viewmark(owner, waObjs.markType.propEq, start, end));
    }
  }

  export class nameMark extends viewmark {
    prop: propImpl;
    value: valueMark;
    constructor(owner: waObjs.viewmarksLow, start: number, end: number) {
      super(owner, waObjs.markType.propName, start, end);
      var name = owner.text.substring(start, end);
      this.prop = this.owner.propDir[name];
      if (!this.prop) this.errorMsg = 'Wrong attribute name: ' + name;
    }
  }
  export class valueMark extends viewmark {
    value: string;
    name: nameMark;
    constructor(owner: waObjs.viewmarksLow, start: number, end: number) {
      super(owner, waObjs.markType.propValue, start, end);
      this.value = owner.text.substring(start, end);
    }
  }
}