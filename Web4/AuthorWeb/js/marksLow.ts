module waObjs {

  export enum markType {
    no, spanOpen, spanClose, inline, style,
    blockPtr, //block placeholder
    caret, //pro ziskani screen souradnic pozice kurzoru a moznost spravne umistit popup dialog
    //pro property editor
    propName, propEq, propValue,
  }

  export class viewmarkLow {
    $self: JQuery; //span element v view
    errorMsg: string;
    constructor(public owner: viewmarksLow, public type: markType, public start: number, public end: number) { }

    classes(): string {
      if (this.errorMsg) return 'error';
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
    }
  }

  export class viewmarksLow {

    escaped: string;
    marks: Array<viewmarkLow>;

    constructor(public text: string, public view: JQuery) {
      this.escaped = waEncode.escape(text);
    }

    finishConstructor() { //musi byt volano na konci kazdeho descendant constructoru
      this.marks = this.parseBrackets();
      if (this.marks) this.marks = _.sortBy(this.marks, m => m.end > m.start ? m.start * 2 : m.start * 2 - 0.5);
    }

    hasError(): boolean { return _.any(this.marks, m => !!m.errorMsg); }

    //najde mark a jeji index, obsahujici caret. includeStart: do mark se pocita i kurzor pred pocatkem
    findMark(pos: number): { mark: viewmarkLow; idx: number } {
      if (!this.marks) return { mark: null, idx: -1 };
      for (var i = 0; i < this.marks.length; i++) {
        var m = this.marks[i];
        if (m.type == markType.caret || m.errorMsg) continue;
        if (m.start < pos && m.end > pos) return { idx: i, mark: this.marks[i] };
      }
      return { mark: null, idx: -1 };
    }

    renderHTML() {
      var html = this.html();
      //console.log(html);
      this.view.html(html);
      if (this.marks) _.each(_.zip(this.marks, this.view.find('> span')), arr => { //ZIP marks a jejich spans
        arr[0].$self = $(arr[1]);
        //zip inner spans
        var inline = <inlineMark>(arr[0]); if (inline.type != markType.inline) return;
        if (inline.marks.marks) _.each(_.zip(inline.marks.marks, inline.$self.find('> span')), arr => arr[0].$self = $(arr[1]));
      }); 
    }

    insertCaretMark(pos: number): viewmark {
      var m = new caretMark(this, pos);
      if (!this.marks) this.marks = []; else this.marks = _.filter(this.marks, m => m.type != markType.caret);
      this.marks.push(m);
      this.renderHTML();
      return m;
    }

    html(): string { throw 'not implemented'; }

    parseBrackets(): Array<viewmarkLow> { throw 'not implemented'; }

  }

} 