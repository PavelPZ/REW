module Course {

  export class checkItem extends evalControlImpl implements CourseModel.checkItem {
    constructor(data: CourseModel.checkItem) {
      super(data);
      if (this.readOnly || this.skipEvaluation) {
        this.result = this.createResult(false);
      }

      if (!this.textType) data.textType = this.textType = CourseModel.CheckItemTexts.yesNo;
      var txt: string;
      switch (data.textType) {
        case CourseModel.CheckItemTexts.yesNo: txt = CSLocalize('88d6dd9f77994a68a8035f5809c24703', 'Yes|No'); break;
        case CourseModel.CheckItemTexts.trueFalse: txt = CSLocalize('7f51a49e0ad14a848362eb7282d62116', 'True|False'); break;
        default: txt = null; break;
      }
      if (txt) {
        this.textTypeAsStr = CourseModel.CheckItemTexts[data.textType].toLowerCase();
        var txts = txt.split('|');
        this.trueText = txts[0];
        this.falseText = txts[1];
      }
    }
    correctValue: boolean;
    textType: CourseModel.CheckItemTexts;
    initValue: CourseModel.threeStateBool;
    readOnly: boolean;
    skipEvaluation: boolean;

    result: CourseModel.CheckItemResult;

    createResult(forceEval: boolean): CourseModel.CheckItemResult { //inicializace objektu s vysledkem kontrolky
      this.done(false); return { ms: 0, s: 0, tg: this._tg, flag: 0, Value: forceEval ? (this.correctValue ? true : false) : undefined };
    }
    provideData(): void { //predani dat z kontrolky do persistence
      if (this.done()) return;
      if (this.yes()) this.result.Value = true;
      else if (this.no()) this.result.Value = false;
      else this.result.Value = undefined;
    }
    acceptData(done: boolean): void { //zmena stavu kontrolky na zaklade persistentnich dat
      super.acceptData(done);
      //this.isSkipEvaluation sdili s readonly modem stav done
      if (this.readOnly || (done && this.skipEvaluation)) {
        var val: CourseModel.threeStateBool = this.readOnly ? this.initValue : this.boolTothreeState(this.result.Value);
        this.yes(val == CourseModel.threeStateBool.true); this.no(val == CourseModel.threeStateBool.false);
        this.yesEval(val == CourseModel.threeStateBool.true ? "black" : "no"); this.noEval(val == CourseModel.threeStateBool.false ? "black" : "no");
        return;
      }
      if (this.done()) {
        var corrv = this.correctValue ? true : false;
        this.yesEval(this.evalStyle(true, this.result.Value === true, corrv)); this.noEval(this.evalStyle(false, this.result.Value === false, corrv));
        this.yes(corrv); this.no(!corrv);
      } else {
        //this.isSkipEvaluation sdili s normalnim modem stav !done
        if (this.result.Value != undefined) {
          this.yes(this.result.Value); this.no(!this.result.Value);
        } else {
          this.yes(this.initValue == CourseModel.threeStateBool.true); this.no(this.initValue == CourseModel.threeStateBool.false);
        }
      }
    }

    boolTothreeState(bool: boolean): CourseModel.threeStateBool {
      if (bool === undefined) return CourseModel.threeStateBool.no;
      else if (bool === true) return CourseModel.threeStateBool.true;
      else return CourseModel.threeStateBool.false;
    }

    isCorrect(): boolean { //pro 0 x 1 score
      var corrv = this.correctValue === true;
      return this.result.Value === corrv;
    }

    isReadOnly(): boolean { return this.readOnly; }
    isSkipEvaluation(): boolean { return this.skipEvaluation; }

    evalStyle(isYesPart: boolean, partIsChecked: boolean, correctValue: boolean): string {
      if (isYesPart) {
        if (partIsChecked) return correctValue ? "black" : "strike";
        else return correctValue ? "red" : "no";
      } else {
        if (partIsChecked) return correctValue ? "strike" : "black";
        else return correctValue ? "no" : "red";
      }
    }

    yesClick = () => this.clickLow(true);
    noClick = () => this.clickLow(false);
    click = () => this.clickLow();
    clickLow = (isYes?: boolean) => {
      if (this.yes() || this.no()) { //neco zaskrtnuto => toogle
        this.yes(!this.yes()); this.no(!this.no());
      } else if (isYes === true) { //nic nezaskrtnuto, chci true
        this.yes(true); this.no(false);
      } else if (isYes === false) { //nic nezaskrtnuto, chci false
        this.yes(false); this.no(true);
      } else { //nic nezaskrtnuto, nechci nic
        this.yes(true); this.no(false);
      }
    }

    yesNoEval(val: string): boolean { return this.yesEval() == val || this.noEval() == val;}
    trueText: string;
    falseText: string;
    textTypeAsStr: string;
    yes = ko.observable<boolean>(false);
    no = ko.observable<boolean>(false);
    yesEval = ko.observable<string>('');
    noEval = ko.observable<string>('');
  }

  CourseModel.registerClassToInterface(CourseModel.meta, CourseModel.tcheckItem, checkItem);
  CourseModel.registerClassToInterface(CourseModel.meta, CourseModel.tcheckBox, checkItem);

}
