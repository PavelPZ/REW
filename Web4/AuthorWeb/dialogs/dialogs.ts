module waObjs {

  export class DlgModelLow {

    $mod: JQuery; //JQuery root dialogu
    btnGrid: Array<Array<JQuery>> = []; //button grid pro ovladani by arrow keys
    caller: DlgModelLow; //pro zanoreny dialog: modalni dialog, ze ktereho jsem volan

    constructor(public modalId: string, public place: JQuery, public completed: (...par: any[]) => textRange.IRange) { }

    show() { //completed vrati novou range nebo null. Pokud null, nastavi se puvodni range, jinak nova.
      this.$mod = render(this.modalId, this)
      this.$mod.modal();
      DlgModelLow.init(this);
      this.$mod.modal('show');
      if (this.btnGrid.length > 0) this.btnGrid[0][0].focus();
    }

    btnGridOK(btn: JQuery) { } //zvoleno grid tlacitko
    hide() { this.$mod.modal('hide'); }
    onHide() { }
    onInit() { }
    onGetResult() { }

    static init(dlg: DlgModelLow) {
      //*** init focus grid
      _.each(dlg.$mod.find('[data-focus-grid]'),(el: HTMLElement) => {
        var $el = $(el);
        var $d = $el.data('focusGrid');
        var d = $el.data('focusGrid').split(':');
        var row = parseInt(d[0]); var cell = parseInt(d[1]);
        if (!dlg.btnGrid[row]) dlg.btnGrid[row] = [];
        dlg.btnGrid[row][cell] = $el;
      });
      if (dlg.btnGrid.length > 0) dlg.btnGridEvents();
      dlg.onInit();

      var self = dlg;
      dlg.$mod.on('show.bs.modal',() => {
        if (!self.place) return;
        self.$mod.css({ 'top': 'auto', 'left': 'auto' }); //inicializace position. Musi byt, jinak se nasledujici position pocita z jiz zmenenych properties
        self.$mod.position({ my: "center top+20", at: 'horizontal ', of: self.place[0], collision: 'flipfit' });
      });
      dlg.$mod.on('shown.bs.modal',() => {
        var bd = $('.modal-backdrop.in');
        bd.on('click',() => self.$mod.modal('hide'));
        if (self.caller) { //zanoreny dialog => zmen z-order
          bd.css({ 'z-index': '1051' });
          self.$mod.css({ 'z-index': '1061' });
        }
      });
      dlg.$mod.on('hidden.bs.modal',() => {
        self.onHide();
        self.caller = null;
      });
    }

    btnGridEvents() {
      this.$mod.on('keydown', '[data-focus-grid]', ev => {
        var $btn = $(<HTMLElement>(ev.target));
        var d = $btn.data('focusGrid').split(':');
        var row = parseInt(d[0]); var cell = parseInt(d[1]);
        //enter
        if (ev.keyCode == key.enter) { if ($btn.data('dlgRes')) { this.btnGridOK($btn); return false; } else return true; }
        if (!$btn.data('arrowIgnore')) {
          switch (ev.keyCode) {
            case key.tab:
            case key.rightArrow: this.btnGrid[row][cell == this.btnGrid[row].length - 1 ? 0 : cell + 1].focus(); break;
            case key.leftArrow: this.btnGrid[row][cell == 0 ? this.btnGrid[row].length - 1 : cell - 1].focus(); break;
            case key.downArrow: this.btnGrid[row == this.btnGrid.length - 1 ? 0 : row + 1][0].focus(); break;
            case key.upArrow: this.btnGrid[row == 0 ? this.btnGrid.length - 1 : row - 1][0].focus(); break;
            //case key.enter: if ($btn.data('dlgRes')) this.btnGridOK($btn); break;
            default: return true;
          }
          return false;
        }
      });
      this.$mod.on('click', '[data-dlg-res]', ev => {
        var $btn = $(<HTMLElement>(ev.target));
        this.btnGridOK($btn);
      });
    }

  }

  //************* DlgTextModel *****************
  export class DlgTextModel extends DlgModelLow {

    constructor(modalId: string, public edit: JQuery, public rng: textRange.IRange, place: JQuery, completed: (...par: any[]) => textRange.IRange) {
      super(modalId, place, completed);
      this.rng = rng;
    }

    btnGridOK(btn: JQuery) {
      var rng = this.callCompleted(btn); if (rng) this.rng = rng;
      var edit = this.edit; this.edit = null;
      var completedNotCalled = this.rng.start < 0; //
      if (!completedNotCalled) this.recoverRange(edit);
      this.hide();
      if (completedNotCalled) this.edit = edit;
    }
    callCompleted(btn: JQuery): textRange.IRange {
      return this.completed(btn)
    }
    recoverRange(edit: JQuery) {
      if (!edit) return;
      setTimeout(() => {
        edit.focus();
        textRange.setRange(edit, this.rng.start, this.rng.end - this.rng.start);
      }, 1);
    }
    onHide() {
      this.recoverRange(this.edit);
    }
  }

  //************* DlgOpenBracket *****************
  export class DlgOpenBracket extends DlgTextModel {
    constructor(edit: JQuery, rng: textRange.IRange, place: JQuery, completed: (...par: any[]) => textRange.IRange) {
      super('dlg-open-bracket', edit, rng, place, completed);
      this.show();
    }
  }

  //************* DlgEditBlock *****************
  export class DlgEditBlock extends DlgModelLow {
    constructor(place: JQuery, completed: (res: string) => textRange.IRange) {
      super('dlg-edit-block', place, completed);
      this.show();
    }
    btnGridOK(btn: JQuery) {
      this.completed(btn.data('dlgRes'));
      this.hide();
    }
  }

  //************* DlgPropName *****************
  export class DlgPropName extends DlgTextModel {

    list = ko.observable<propName>();

    constructor(edit: JQuery, rng: textRange.IRange, place: JQuery, mark: waObjs.inlineMark, completed: (snipset: string) => textRange.IRange) {
      super('dlg-prop-name', edit, rng, place, completed);
      this.list(new propName(mark));
      this.show();
    }

    callCompleted(btn: JQuery): textRange.IRange {
      var prop = <metaJS.propImpl>(this.list().value().dato);
      if (prop.type == metaJS.xsdPropType.Enum) {
        var self = this;
        setTimeout(() => new DlgEnumValue(self.edit, self.rng, self.place, self.list().mark, prop, enumItem => self.completed(prop.name + '=' + enumItem.name + '|')), 1);
        return { start: -1, end: -1 };
      } else {
        var boolVal = prop.type == metaJS.xsdPropType.Bool ? 'true' : '';
        var snipset = prop.name + '=' + boolVal + '|';
        return this.completed(snipset);
      }
    }
  }

  //************* DlgEnumValue *****************
  export class DlgEnumValue extends DlgTextModel {
    list = ko.observable<enumValue>();
    constructor(edit: JQuery, rng: textRange.IRange, place: JQuery, mark: waObjs.inlineMark, prop: metaJS.propImpl, completed: (enumItem: IDlgSelectDato) => textRange.IRange) {
      super('dlg-enum-value', edit, rng, place, completed);
      this.list(new enumValue(mark, prop));
      this.show();
    }

    callCompleted(btn: JQuery): textRange.IRange {
      return this.completed(this.list().value().dato)
    }
  }

  //************* DlgEditInline *****************
  export class DlgEditInline extends DlgTextModel {
    propEditor = ko.observable<edModel>();
    valueEditor = ko.observable<edModel>();
    constructor(edit: JQuery, rng: textRange.IRange, place: JQuery, mark: waObjs.inlineMark, completed: (enumItem: IDlgSelectDato) => textRange.IRange) {
      super('dlg-edit-inline', edit, rng, place, completed);
      var p = new propName(mark, false);
      p.value(null);
      p.selected = sel => {
        if (!sel) { this.valueEditor(null); return; }
        this.valueEditor(new enumValue(p.mark, metaJS.metaObj.types['offering'].propDir['drop-down-mode']));
      };
      this.propEditor(p);
      this.show();
    }
  }

  //**************** EDITORS MODELS ********************
  export class edModel {
    constructor(public scriptId:string) {
    }
  }

  export interface IDlgSelectDato { name: string; value: string; summary: string; descr: string; dato: Object; }

  export class listModel extends edModel {
    constructor(scriptId: string, public list: Array<IDlgSelectDato>) {
      super(scriptId);
      this.value(this.list[0]);
    }
    value = ko.observable<IDlgSelectDato>();
    descr = ko.observable<string>();
    selected: (sel: IDlgSelectDato) => void;
    changed() {
      var sel = this.value();
      if (this.selected) this.selected(sel);
      if (!sel) return '';
      this.descr((sel.summary ? '<b>' + sel.summary + '</b><br/>' : '') + (sel.descr || ''));
    }
  }

  export class propName extends listModel {
    constructor(public mark: waObjs.inlineMark, removeUsed:boolean = true) {
      super('ed-prop-name', propName.getList(mark, removeUsed));
    }
    static getList(mark: waObjs.inlineMark, removeUsed:boolean): Array<IDlgSelectDato> {
      var usedProps = !removeUsed ? [] : _.map(_.filter(mark.marks.marks,(m: metaJS.nameMark) => m.type == waObjs.markType.propName),(m: metaJS.nameMark) => m.prop);
      var okProps = _.filter(metaJS.metaObj.types[mark.tag].props, p => (p.flag & CourseModel.tgSt.metaJS_browse) != 0 && !_.contains(usedProps, p));
      return _.map(okProps, p => { return { name: p.name, value: p.name, dato: p, summary: p.summary, descr: p.descr } });
    }
  }

  export class enumValue extends listModel {
    constructor(public mark: waObjs.inlineMark, public prop: metaJS.propImpl) {
      super('ed-enum', enumValue.getList(prop));
    }
    static getList(prop: metaJS.propImpl): Array<IDlgSelectDato> {
      return _.map(prop.myEnum().enumData, en => { return { name: en.name, value: en.name, summary: en.summary, descr: en.descr, dato: en } });
    }
  }

  //**************** JSRender LIB ********************
  //var templCache: JsTemplate[] = [];
  //export function tmpl(id: string): any {
  //  id = id.toLowerCase();
  //  var tmpl = templCache[id];
  //  if (tmpl == null) {
  //    var t = $('#' + id);
  //    var txt = t.html();
  //    if (!txt) { debugger; throw 'cannot read template ' + id; }
  //    t.remove();
  //    try {
  //      tmpl = $.templates(txt);
  //    } catch (msg) {
  //      alert("cannot compile template " + id);
  //      throw msg;
  //    }
  //    templCache[id] = tmpl;
  //  }
  //  return tmpl;
  //}

  export function render(templateId: string, data: Object): JQuery {
    var str = JsRenderTemplateEngine.tmpl(templateId).render(data);
    $('#' + templateId).remove();
    $('body').append($(str));
    var res = $('#' + templateId);
    ko.applyBindings(data, res[0]);
    return res;
  }
  ko.nativeTemplateEngine.instance['renderTemplateSource'] = (template: string, bindingContext: KnockoutBindingContext, options) => {
    if (_.isEmpty(template)) return [];
    var data = bindingContext.$data;
    var str = JsRenderTemplateEngine.tmpl(template).render(data);
    return $.parseHTML(str, null, true); 
  };
  ko.nativeTemplateEngine.instance['makeTemplateSource'] = (template: string, templateDocument: any) => _.isString(template) ? template : null;

  //$.views.helpers({
  //  T: tmpl,
  //});


}