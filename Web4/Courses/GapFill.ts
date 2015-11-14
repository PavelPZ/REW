module Course {

  var c_used = "used";
  var fakeEdit = '???ignore???';

  export class edit extends evalControlImpl implements CourseModel.edit {
    constructor(staticData: CourseModel.edit) {
      super(staticData);
      if (!this.correctValue) this.correctValue = '';
      else if (Utils.startsWith(this.correctValue, fakeEdit)) { /*this.correctValue = '';*/ this.isFakeEdit = true; }
      this.onBehav(this);
    }
    correctValue: string;
    caseSensitive: boolean;
    groupId: string;
    exchangeable: string;
    widthGroup: string;
    offeringId: string;
    width: number;

    result: CourseModel.GapFillResult;

    onBehav = ko.observable<edit>(null); //pro isExchangeable evalGroup: tento edit control se chova jako onBehav edit control (vypocet isCorrect a hodnota teacher)
    corrects: string[];
    user = ko.observable<string>('');
    teacher = ko.computed<string>(() => { var th = this.onBehav(); return th ? th.getTeacher() : ''; });
    st = ko.observable<string>('');
    source: offering;
    isFakeEdit: boolean;

    getTeacher(): string { return ''; }

    createResult(forceEval: boolean): CourseModel.GapFillResult { this.done(false); return { ms: 0, s: 0, tg: this._tg, flag: 0, Value: forceEval ? this.correctValue.split('|')[0] : "" }; }

    setScore() {
      if (this.onBehav().isFakeEdit) { this.result.ms = 0; return; }
      super.setScore();
    }

    isCorrect(): boolean { //pro 0 x 1 score
      if (this.isSkipEvaluation()) return true;
      var res = this.doNormalize(this.result.Value);
      return _.any(this.onBehav().corrects,(s: string) => s == res);
    }
    provideData(): void { //predani dat z kontrolky do persistence
      if (this.done()) return;
      this.result.Value = this.user();
      if (this.isSkipEvaluation()) this.corrects = [this.result.Value]; //pro isSkipEvaluation je vse co se vyplni spravne
    }
    acceptData(done: boolean): void {//zmena stavu kontrolky na zaklade persistentnich dat
      super.acceptData(done);
      this.user(this.result.Value);
      var val = this.doNormalize(this.result.Value);
      if (!this.done()) this.st('edit');
      else if (this.isCorrect()) this.st('ok');
      else this.st(!val || val == '' ? 'empty' : 'wrong');
    }
    doNormalize(s: string): string { return this.caseSensitive ? s : s.toLowerCase(); }

    static filter(ctrls: Array<tagImpl>): Array<edit> {
      return <Array<edit>>(_.filter(ctrls, c => c._tg == CourseModel.tgapFill || c._tg == CourseModel.tdropDown));
    }

    static adjustSmartWidths(pg: Page) {
      var offers = <Array<offering>>(_.filter(pg.items, c => c._tg == CourseModel.toffering));
      var usedEdits: { [id: string]: boolean; } = {};
      //zpracuj offering
      _.each(offers, off => {
        var both = _.partition(off.words.split('|'), w => w.length > 2 && w.charAt(0) == "#"); //rozdel words na id a word
        var words = both[1];
        var eds = <Array<edit>>(_.map(both[0], id => pg.tags[id.substr(1)])); //offering edits
        _.each(eds, ed => usedEdits[ed.id] = true); //edits hotovy
        //zjisti maximum z sirek
        var firstEd = true; var max = 0;
        _.each(eds, ed => {
          var w = ed.smartWidthPropAction(undefined, firstEd ? words : null); //v prvnim edit se zpracuji i offering words
          firstEd = false;
          if (w > max) max = w;
        });
        //dosat maximim z sirek
        _.each(eds, ed => ed.smartWidthPropAction(max));
      });
      //zpracuj zbyle edits (s smartWidth i bez)
      var edits = <Array<edit>>(_.filter(pg.items,(c: edit) => (c._tg == CourseModel.tgapFill || c._tg == CourseModel.tdropDown) && !usedEdits[c.id]));
      var grps = _.groupBy(edits, e => e.widthGroup);
      for (var p in grps) {
        if (p == 'undefined') { //not smartWidth
          _.each(grps[p], ed => {
            var w = ed.smartWidthPropAction(undefined);
            if (w > 0) ed.smartWidthPropAction(w);
          });
        } else { //smartWidth
          var eds = _.map(grps[p], ed => { return { ed: ed, width: ed.smartWidthPropAction(undefined) } });
          var max = _.max(eds, e => e.width);
          if (max.width > 0) _.each(eds, e => { if (e.width >= 0) e.ed.smartWidthPropAction(max.width); });
        }
      }

    }
    //vrati nebo nastavi spolecnou sirku
    smartWidthPropAction(setw: number, offerWords: Array<string> = null): number {
      var selfEl = this.selfElement();
      var isGapFill = this._tg == CourseModel.tgapFill;
      if (setw == undefined) {
        //if (selfEl.width() > 10) return -1; //odstraneno 19.5.2015, k cemu bylo?
        if (this.width > 0) return this.width;
        var arr = this.correctValue.split('|');
        arr = _.map(arr, a => a.length == 1 ? 'x' : (a.length == 2 ? 'xx' : (a.length == 3 ? 'xxx' : a)));
        if (isGapFill) { var gp = <gapFill><any>this; if (gp.initValue) arr.push(gp.initValue); if (gp.hint) arr.push(gp.hint); }
        if (offerWords != null && offerWords.length > 0) arr.pushArray(offerWords);
        var growby = 1;
        if (isGapFill) {
          var charnum = _.max(arr, s => s.length).length;
          if (charnum == 0) return 20;
          if (charnum == 1) growby = 4;
          else if (charnum == 2) growby = 2;
          else if (charnum == 3) growby = 1.5;
          else if (charnum < 5) growby = 1.7;
          else if (charnum < 10) growby = 1.5;
          else if (charnum < 15) growby = 1.3;
          else growby = 1.2;
        }
        return Math.round(growby * Gui2.maxTextWidth(arr, selfEl));
      } else {
        var w = setw + (isGapFill ? 26 : 44);
        selfEl.css('width', w.toString() + 'px'); //nejaky bug, spatne se do sirky zapocitavaji padding a margin, jen ale po Eval x reset.
      }
    }
  }

  export class gapFill extends edit implements CourseModel.gapFill {
    constructor(staticData: CourseModel.gapFill) {
      super(staticData);
      if (!this.initValue) this.initValue = '';
      if (this.readOnly || this.skipEvaluation) {
        this.correctValue = this.initValue;
        this.result = this.createResult(false);
      }
      this.corrects = _.map(this.correctValue.split('|'), s => this.doNormalize(s));
    }
    hint: string;
    initValue: string;
    readOnly: boolean;
    skipEvaluation: boolean;

    getTeacher(): string { var res = this.correctValue.split('|')[0]; return Utils.startsWith(res,fakeEdit) ? '' : res; }
    createResult(forceEval: boolean): CourseModel.GapFillResult {
      return {
        ms: 0, s: 0, tg: this._tg, flag: 0,
        Value: forceEval ? this.correctValue.split('|')[0] : this.initValue
      };
    }
    doNormalize(s: string): string { return normalize(s, this.caseSensitive); }
    isReadOnly(): boolean { return this.readOnly; }
    isSkipEvaluation(): boolean { return this.skipEvaluation; }// || this.onBehav().isFakeEdit; }
  }

  export class dropDown extends edit implements CourseModel.dropDown {
    constructor(staticData: CourseModel.dropDown) {
      super(staticData);
      this.corrects = this.gapFillLike ? _.map(this.correctValue.split('|'), s => this.doNormalize(s)) : ['#' + this.id];
      var self = this;
      this.user.subscribe(userVal => { //reakce na zmenu vybraneho slova
        if (_.isEmpty(userVal)) { self.userText(''); return; } //odstraneni
        if (userVal[0] != '#') { self.userText(userVal); return; } //text
        self.userText(self.source.findDropDownViaId(userVal.substr(1)).getTeacher());
      })
    }

    gapFillLike: boolean;

    getTeacher(): string { return Utils.startsWith(this.correctValue,fakeEdit) ? '' : this.correctValue; }

    createResult(forceEval: boolean): CourseModel.GapFillResult { return { ms: 0, s: 0, tg: this._tg, flag: 0, Value: forceEval ? this.corrects[0] : '' }; }
    resetData(allData: { [ctrlId: string]: Object; }): void {
      super.resetData(allData);
      if (this.source) this.source.resetData();
    }

    myWord: dragWord;
    userText = ko.observable<string>(''); //uzivatelem vybrany text
    click = (data: dropDown, ev: JQueryEventObject) => {
      clickedDropDown = this;
      anim.toggleMenuLow(ev);
    }; //dragList.target = this; dragList.show(); } //klik na sipku u dragTarget slova

    //isSkipEvaluation(): boolean { return this.onBehav().isFakeEdit; }

  }

  export class dragTarget extends dropDown { }

  export class offering extends tagImpl implements CourseModel.offering {
    constructor(staticData: CourseModel.offering) {
      super(staticData);
    }
    words: string;
    mode: CourseModel.offeringDropDownMode;
    hidden: boolean;
    initProc(phase: initPhase, getTypeOnly: boolean, completed: () => void): initPhaseType {
      switch (phase) {
        case initPhase.beforeRender:
          if (!getTypeOnly) {
            this.edits = []; this.wordItems = []; var hasDropDown = false;
            _.each(this.words.split('|'), w => {
              if (w[0] == '#') { //id gapfilu nebo dropdown
                var ed = <edit>(this._myPage.tags[w.substr(1)]);
                ed.widthGroup = '@sw-' + this.id;
                ed.source = this;
                hasDropDown = ed._tg == CourseModel.tdropDown && !(<dropDown>ed).gapFillLike;
                this.edits.push(ed); ed.source = this;
                if (!ed.isFakeEdit)
                  this.wordItems.pushArray(_.map(ed.correctValue.split('|'), c => new dragWord(hasDropDown ? <Object>ed : c)));
              } else
                this.wordItems.push(new dragWord(w));
            });
            this.passive = !hasDropDown || this.mode == CourseModel.offeringDropDownMode.dropDownKeep;
            if (this.passive) this.wordItems = _.uniq(this.wordItems, w => w.title());
            this.wordItems = _.sortBy(this.wordItems, wi => wi.title()); //BT 2168 
          }
          return initPhaseType.sync;
      }
      return super.initProc(phase, getTypeOnly, completed)
    }

    resetData() { _.each(this.wordItems, w => w.st('')); }

    edits: edit[];
    wordItems: dragWord[]; //string nebo dropdown
    passive: boolean; //bez ikon

    findWordViaValue(value: string): dragWord { return _.isEmpty(value) ? null : _.find(this.wordItems, w => w.value() == value); }
    findEditViaSelected(selected: string): edit { return _.isEmpty(selected) ? null : _.find(this.edits, ed => ed.user() == selected); }
    findDropDownViaId(id: string): dragTarget { return <dragTarget>(_.find(this.edits, ed => ed.id == id)); }
  }

  export class dragWord { //model view pro jedno Word
    constructor(content: Object) {
      if (_.isString(content))
        this.word = <string>content;
      else {
        this.myDropDown = <dragTarget>content;
        this.myDropDown.myWord = this;
      }
    }
    st = ko.observable<string>(''); //'' nebo used
    click = () => {
      try {
        var selected = this.value();
        if (clickedDropDown.source.passive) { clickedDropDown.user(selected); return; }
        var oldVal = clickedDropDown.user(); //obsah clicked dropdown
        if (oldVal == selected) { this.st(''); clickedDropDown.user(''); return; } //vybrano to same slovo => undo (zrus vyber)
        //najdi dropdown, ktery ma vybrany selected word
        var withSelected = clickedDropDown.source.findEditViaSelected(selected); if (withSelected != null) withSelected.user('');
        //vrat doposud vybrane slovo v dragList.target mezi nepouzite
        var oldWord = clickedDropDown.source.findWordViaValue(oldVal); if (oldWord != null) oldWord.st('');
        //aktualizuje clicked dropdown a selected word status
        clickedDropDown.user(selected); //pouzij newVal
        this.st(c_used);

      } finally { anim.hideMenus(null); }
    };
    word: string;
    myDropDown: dragTarget;
    title(): string { return this.word ? this.word : this.myDropDown.teacher(); }
    value(): string { return this.word ? this.word : '#' + this.myDropDown.id; }
  }

  var clickedDropDown: dragTarget;

  CourseModel.registerClassToInterface(CourseModel.meta, CourseModel.toffering, offering);
  CourseModel.registerClassToInterface(CourseModel.meta, CourseModel.tgapFill, gapFill);
  CourseModel.registerClassToInterface(CourseModel.meta, CourseModel.tdropDown, dropDown);

}
