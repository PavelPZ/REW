module Course {

  export interface IRadioEvalGroupMember extends CourseModel.evalControl {
    myEvalGroup: Array<evalControlImpl>;
  }

  export class radioEvalImpl extends evalControlImpl implements IRadioEvalGroupMember {
    constructor(staticData: CourseModel.tag) {
      super(staticData);
    }
    myEvalGroup: Array<evalControlImpl>;
  }


  export class radioButton extends radioEvalImpl implements CourseModel.radioButton {
    constructor(staticData: CourseModel.radioButton) {
      super(staticData);
      if (this.readOnly || this.skipEvaluation) {
        this.correctValue = this.initValue;
        this.result = this.createResult(false);
      }
    }
    correctValue: boolean;
    initValue: boolean;
    readOnly: boolean;
    skipEvaluation: boolean;
    //group: string;

    result: radioButtonResult;
    myEvalGroup: Array<radioButton>;
    selected = ko.observable<boolean>(false);
    myCss = ko.observable<string>('');

    createResult(forceEval: boolean): radioButtonResult { return { ms: 0, s: 0, tg: this._tg, flag: 0, isSelected: forceEval ? this.correctValue : this.initValue }; } //inicializace objektu s vysledkem kontrolky
    acceptData(done: boolean): void { //zmena stavu kontrolky na zaklade persistentnich dat
      super.acceptData(done);
      if (!done) { this.selected(this.result.isSelected); this.myCss(''); return; }
      if (!!this.result.isSelected == !!this.correctValue)
        this.myCss(this.result.isSelected ? "black" : "no");
      else
        this.myCss(this.correctValue ? "red" : "strike");
    }
    provideData(): void { //predani dat z kontrolky do persistence
      if (this.done()) return;
      this.result.isSelected = this.selected();
      if (this.skipEvaluation) this.correctValue = this.result.isSelected; //pro isSkipEvaluation je vse co se vyplni spravne
    }
    isCorrect(): boolean { //pro 0 x 1 score
      return !!this.correctValue == !!this.result.isSelected;
    }

    click() {
      if (this.pageDone()) return;
      _.each(this.myEvalGroup,(it: radioButton) => it.selected(this == it));
    }
    isReadOnly(): boolean { return this.readOnly; }
    isSkipEvaluation(): boolean { return this.skipEvaluation; }
  }
  CourseModel.registerClassToInterface(CourseModel.meta, CourseModel.tradioButton, radioButton);

  export interface radioButtonResult extends CourseModel.Result {
    isSelected: boolean;
  }

  export class wordSelectionLow extends radioEvalImpl implements CourseModel.wordSelection {
    words: string;
    items: Array<choiceItem>;
    click_item(it: choiceItem) { }
  }

  export class wordSelection extends wordSelectionLow implements CourseModel.wordSelection {
    correctValue: number;
    result: CourseModel.WordSelectionResult;
    myEvalGroup: Array<wordSelection>;

    constructor(data: CourseModel.tag) {
      super(data);
      var words = this.words.split('|');
      this.correctValue = -1;
      for (var i = 0; i < words.length; i++) if (words[i].charAt(0) == '#') { this.correctValue = i; break; }
      var cnt = 0;
      //###jsonML
      this.items = _.map(words,
        //w=> new choiceItem(<CourseModel.text>{ title: "<span class='c-nowrap'>" + w.replace(/^#/, '') + "</span>", _tg: CourseModel.ttext }, this, cnt++));
        w=> new choiceItem(w.replace(/^#/, ''), this, cnt++));
    }

    createResult(forceEval: boolean): CourseModel.WordSelectionResult { return { ms: 0, s: 0, tg: this._tg, flag: 0, Value: forceEval ? this.correctValue : -1 }; } //inicializace objektu s vysledkem kontrolky
    provideData(): void { //predani dat z kontrolky do persistence
      if (this.done()) return;
      var actItem = _.find(this.items, it => it.selected());
      this.result.Value = actItem == null ? -1 : actItem.selfIdx;
    }
    acceptData(done: boolean): void { //zmena stavu kontrolky na zaklade persistentnich dat
      super.acceptData(done);
      var corr = this.correctValue;
      _.each(this.items, it => it.acceptItemData(this.done(), corr, this.result.Value));
    }
    isCorrect(): boolean { //pro 0 x 1 score
      var actItem = _.find(this.items, it => it.selected());
      if (this.correctValue == -1) return !actItem;
      else return actItem != null && actItem.selfIdx == this.correctValue;
    }

    click_item(it: choiceItem) {
      if (this.pageDone()) return;
      _.each(this.myEvalGroup || [this], grp => _.each(grp.items, t => {
        if (t == it) t.selected(!t.selected());
        else t.selected(false);
      }));
    }
  }

  export class wordMultiSelection extends wordSelectionLow implements CourseModel.wordMultiSelection {
    correctValues: Array<number>;
    result: CourseModel.wordMultiSelectionResult;

    constructor(data: CourseModel.tag) {
      super(data);
      var words = this.words.split('|');
      this.correctValues = [];
      for (var i = 0; i < words.length; i++) if (words[i].charAt(0) == '#') this.correctValues.push(i);
      var cnt = 0;
      //###jsonML
      this.items = _.map(words,
        //w=> new choiceItem(<CourseModel.text>{ title: "<span class='c-nowrap'>" + w.replace(/^#/, '') + "</span>", _tg: CourseModel.ttext }, this, cnt++));
        w=> new choiceItem(w.replace(/^#/, ''), this, cnt++));
    }

    createResult(forceEval: boolean): CourseModel.wordMultiSelectionResult { return { ms: 0, s: 0, tg: this._tg, flag: 0, Values: forceEval ? this.correctValues : [] }; } //inicializace objektu s vysledkem kontrolky
    provideData(): void { //predani dat z kontrolky do persistence
      if (this.done()) return;
      this.result.Values = [];
      _.each(this.items, it => { if (!it.selected()) return; this.result.Values.push(it.selfIdx); })
    }
    acceptData(done: boolean): void { //zmena stavu kontrolky na zaklade persistentnich dat
      super.acceptData(done);
      _.each(this.items, it => {
        var corr = _.contains(this.correctValues, it.selfIdx) ? it.selfIdx : -1;
        var res = _.contains(this.result.Values, it.selfIdx) ? it.selfIdx : -1;
        it.acceptItemData(this.done(), corr, res);
      });
    }
    isCorrect(): boolean { //pro 0 x 1 score
      var union = _.union(this.correctValues, this.result.Values);
      return union.length == this.correctValues.length && union.length == this.result.Values.length;
    }

    click_item(it: choiceItem) {
      if (this.pageDone()) return;
      it.selected(!it.selected());
    }
  }

  CourseModel.registerClassToInterface(CourseModel.meta, CourseModel.twordSelection, wordSelection);
  CourseModel.registerClassToInterface(CourseModel.meta, CourseModel.twordMultiSelection, wordMultiSelection);

  export class choiceItem {

    correctValue: boolean;
    selected = ko.observable<boolean>(false);
    myCss = ko.observable<string>('');

    constructor(public content: string, public _owner: wordSelectionLow, public selfIdx: number) { }

    acceptItemData(done: boolean, correctIdx: number, userSelectedIdx: number): void { //zmena stavu kontrolky na zaklade persistentnich dat
      if (!done) { this.selected(userSelectedIdx == this.selfIdx); this.myCss(''); return; }
      this.selected(this.selfIdx == userSelectedIdx);
      if (correctIdx == userSelectedIdx)
        this.myCss(this.selfIdx == correctIdx ? "black" : "no");
      else
        this.myCss(this.selfIdx == correctIdx ? "red" : (this.selfIdx == userSelectedIdx ? "strike" : "no"));
    }
    click() { this._owner.click_item(this); }

  }

}
