interface JQuery { popoverX; }
module waObjs {

  export enum keyDownResult { no, true, false }

  //export interface editorLow {
  //  $self: JQuery;
  //  edit: JQuery;
  //  view: JQuery;
  //  text: string;
  //}

  //export function editorConstructor(self: editorLow) {
  //  self.edit = self.$self.find('> textarea');
  //  var pre = self.$self.find('> pre');
  //  self.view = pre.find('> span');
  //}

  //************* TEXT *****************
  export class text extends item implements IText {

    text: string;

    edit: JQuery;
    view: JQuery;
    selfProps = ITextProps;
    marks: viewmarks;
    //escaped: string;

    constructor(data?: IText, $parent?: JQuery, parent?: block) {
      super(data, $parent, parent);
      if (!data) return;
      var self = this;

      self.edit = self.$self.find('> textarea');
      var pre = self.$self.find('> pre');
      self.view = pre.find('> span');

      if (bowser.agent.msie) { //pro IE nefunguje dobre 'pre-wrap', pro FF zase 'pre'
        self.edit.css('whiteSpace', 'pre');
        self.view.css('whiteSpace', 'pre');
        pre.css('whiteSpace', 'pre');
      }

      //http://stackoverflow.com/questions/2823733/textarea-onchange-detection
      self.edit.on('input onpropertychange', function () { //notifikace o zmene obsahu textarea. Notifikace se nevola pri dosazeni hodnoty z kodu
        self.text = self.edit.val();
        //self.setText();
        self.notifyTextChanged(true);
      });

      self.edit.on("keydown",(ev: JQueryKeyEventObject) => {
        //IE hack: DEL a BACKSPACE se nevola v on('input onpropertychange')
        if (bowser.agent.msie && (ev.keyCode == key.k_delete || ev.keyCode == key.backspace)) { setTimeout(() => self.notifyTextChanged(true), 1); return; }

        var rng = textRange.getRange(self.edit); //text a range
        if (rng.start > 0 && self.text[rng.start - 1] == '\\') return true; // '\<any>' => continue
        var mark = self.marks.findMark(rng.start).mark; //mark ve ktere je caret

        if (mark != null && mark.type == markType.inline && rng.start == rng.end) {
          var res = (<inlineMark>mark).keyDown(self, rng, ev); //inline pars editor
          switch (res) {
            case keyDownResult.true: return true;
            case keyDownResult.false: return false;
            default: break; //continue procesing
          }
        }

        if (ev.keyCode != key.openBracket) return true;
        //edit or insert?
        if (mark == null) mark = self.marks.insertCaretMark(rng.start); //neni => vloz a vrat specialni caret mark

        if (mark.type != markType.caret) { //marks editors
          alert('Edit todo');
          //switch (mark.type) {
          //  case markType.inline: break; //TODO: big inline editors dlgEditInline.showForInline(<inlineMark>mark,() => null); break;
          //  default: alert('Edit todo'); break;
          //}
        } else { //insert
          new DlgOpenBracket(self.edit, rng, mark.$self,($btn: JQuery) => {
          //dlgOpenBracket.showForText(self.edit, rng, mark.$self,($btn: JQuery) => {
            var dlgRes = <string>($btn.data('dlgRes'));
            var parts = dlgRes.split(':'); var grp = parts[0]; var grpItem = parts[1];
            if (grp == 'inline' || grp == 'style' || (grp == 'span' && rng.start == rng.end)) { //vlozeni obou zavorek
              return self.insertSnipset($btn.data('sm-gen'), rng);
            } else if (grp == 'span') { //obaleni selekce {**} zavorkami
              return self.surroundSpan(rng);
            } else if (grp == 'block') {
              self.parent.insert(self, rng, self.text, grpItem); //vloz block
            } else
              throw 'not implemented';
            return null;
          });
        }
        return false;
      });
      self.notifyTextChanged(false);
    }

    setText(text: string = null) {
      if (text != null) this.edit.val(text); else text = this.edit.val();
      this.text = text;
      this.marks = new viewmarks(text, this.view);
    }

    toHTMLString(): string {
      return '<div class="sm-text"><textarea>' + this.text + '</textarea><pre class="sm-view"><span></span><br /></pre></div>';
    }

    notifyTextChanged(inUserAction: boolean) { //zmena textu
      var self = this; if (self.refreshTimer) { clearTimeout(self.refreshTimer); self.refreshTimer = 0; }
      if (!inUserAction || self.text.length < 400) {
        self.setText(); self.lastRefresh = new Date().getTime();
        self.root.notifyDataChanged();
        return;
      }
      var now = new Date().getTime();
      if (self.lastRefresh == 0 || now - self.lastRefresh < text.updateSpeed) {
        self.setText();
        self.lastRefresh = now;
        self.root.notifyDataChanged();
        return;
      }
      self.refreshTimer = setTimeout(() => {
        clearTimeout(self.refreshTimer);
        self.refreshTimer = 0;
        self.lastRefresh = new Date().getTime();
        self.setText()
        self.root.notifyDataChanged();
      }, text.updateSpeed);
    }
    lastRefresh: number = 0;
    refreshTimer: number;
    static updateSpeed = 500;

    //vlozeni mask na pozici caret
    insertSnipset(mask: string, rng: textRange.IRange): textRange.IRange {
      var self = this;
      var caretIdx = mask.indexOf('|');
      self.setText(self.text.substr(0, rng.start) + mask.replace('|', '') + self.text.substr(rng.start));
      self.notifyTextChanged(false);
      return <any>{ start: rng.start + caretIdx, end: rng.start + caretIdx };
    }
    //obaleni selekce {**} zavorkou
    surroundSpan(rng: textRange.IRange): textRange.IRange {
      var self = this;
      if (self.marks.findMark(rng.start).idx != self.marks.findMark(rng.end).idx) {
        return self.insertSnipset('{*| *}', rng);
      }
      self.setText(self.text.substr(0, rng.start) + '{* ' + self.text.substring(rng.start, rng.end) + '*}' + self.text.substr(rng.end));
      self.notifyTextChanged(false);
      return <any>{ start: rng.start + 2, end: rng.start + 2 };
    }


  }

  //http://www.javascripter.net/faq/keycodes.htm
  export enum key {
    backspace = 8,
    tab = 9,
    enter = 13,
    shift = 16,
    ctrl = 17,
    alt = 18,
    pause = 19,
    capsLock = 20,
    escape = 27,
    pageUp = 33,
    pageDown = 34,
    end = 35,
    home = 36,
    leftArrow = 37,
    upArrow = 38,
    rightArrow = 39,
    downArrow = 40,
    insert = 45,
    k_delete = 46,
    k_0 = 48,
    k_1 = 49,
    k_2 = 50,
    k_3 = 51,
    k_4 = 52,
    k_5 = 53,
    k_6 = 54,
    k_7 = 55,
    k_8 = 56,
    k_9 = 57,
    a = 65,
    b = 66,
    c = 67,
    d = 68,
    e = 69,
    f = 70,
    g = 71,
    h = 72,
    i = 73,
    j = 74,
    k = 75,
    l = 76,
    m = 77,
    n = 78,
    o = 79,
    p = 80,
    q = 81,
    r = 82,
    s = 83,
    t = 84,
    u = 85,
    v = 86,
    w = 87,
    x = 88,
    y = 89,
    z = 90,
    leftWindow = 91,
    rightWindowKey = 92,
    select = 93,
    numpad0 = 96,
    numpad1 = 97,
    numpad2 = 98,
    numpad3 = 99,
    numpad4 = 100,
    numpad5 = 101,
    numpad6 = 102,
    numpad7 = 103,
    numpad8 = 104,
    numpad9 = 105,
    multiply = 106,
    add = 107,
    subtract = 109,
    decimalPoint = 110,
    divide = 111,
    f1 = 112,
    f2 = 113,
    f3 = 114,
    f4 = 115,
    f5 = 116,
    f6 = 117,
    f7 = 118,
    f8 = 119,
    f9 = 120,
    f10 = 121,
    f11 = 122,
    f12 = 123,
    numLock = 144,
    scrollLock = 145,
    semiColon = 186,
    equalSign = 187,
    comma = 188,
    dash = 189,
    period = 190,
    forwardSlash = 191,
    graveAccent = 192,
    openBracket = 219,
    backSlash = 220,
    closeBracket = 221,
    singleQuote = 222
  };

  export function isEq(code: number) { return bowser.agent.firefox ? code == 61 : code == 187; }
  export function isSemicolon(code: number) { return bowser.agent.firefox ? code == 59 : code == 186; }

}
 //if (ch == '{') { //automaticke doplneni } po zapsani {
        //  var rng = textRange.getRange(self.edit);
        //  if (rng.start > 0 && self.edit.val()[rng.start - 1] == '\\') return true; //\{
        //  textRange.replace(self.edit, '{}');
        //  textRange.setcursor(self.edit, rng.start + 1);
        //  self.notifyTextChanged();
        //  return false;
        //} else if (ch == '*' || ch == 'x#') { //automaticke doplneni * nebo # po zapsani {* nebo {#
        //  var edVal: string = self.edit.val(); var edEscaped = waCompiler.escape(edVal);
        //  var rng = textRange.getRange(self.edit);
        //  if (rng.start > 0 && edEscaped.substr(rng.start - 1, 2) != '{}') return true; //not {}
        //  var newEd = edVal.substr(0, rng.start - 1) + '{' + ch + /*' ' +*/ ch + '}' + edVal.substr(rng.start + 1);
        //  self.edit.val(newEd);
        //  textRange.setcursor(self.edit, rng.start + 1);
        //  self.notifyTextChanged();
        //  return false;
        //} else if (ch == '#') {
        //  var edVal: string = self.edit.val(); var rng = textRange.getRange(self.edit);
        //  edVal = edVal.substr(0, rng.start) + setRangeSpan(rng.start, rng.end, '') + edVal.substr(rng.start);
        //  self.view.html(edVal);
        //  modalOpenBracketInst.show(self, rng, () => {
        //    return true;
        //  });
        //  return false;

      //DEL v IE 
      //if (bowser.agent.msie)
      //  self.edit.on('keypress', ev => {
      //    if (ev.keyCode == key.k_delete) self.notifyTextChanged();
      //  });
      //self.edit.on("focus blur keydown keyup paste click mousedown", ev => {
      //self.edit.on('contextmenu', ev => {
      //self.edit.trigger('click');
      //var span = _.find(this.marks.marks, m => {
      //  var off = m.$self.offset(); var w = m.$self.width(); var h = m.$self.height();
      //  var res = ev.pageX >= off.left && ev.pageX <= off.left + w && ev.pageY >= off.top && ev.pageY <= off.top + h;
      //  return res;
      //});
      //return false;
      //});
  /*
//var cloneCSSProperties = [
  //  'lineHeight', 'textDecoration', 'letterSpacing',
  //  'fontSize', 'fontFamily', 'fontStyle', 'fontVariant',
  //  'fontWeight', 'textTransform', 'textAlign',
  //  'direction', 'fontSizeAdjust',
  //  'wordSpacing', 'wordWrap', 'wordBreak',
  //  'whiteSpace', 
  //];
  */

