module Course {

  export class pairing extends evalControlImpl implements CourseModel.pairing {

    pageCreated() {
      _.each(this.Items, it => it.doRegisterControl(it));
      var cnt = 0;
      var rnd = Utils.randomizeArray(_.range(this.Items.length));
      this.randomItems = _.map<number, pairingItem>(rnd, i => <pairingItem>(this.Items[i]));
      super.pageCreated();
    }
    result: CourseModel.PairingResult;

    leftSelected = ko.observable<boolean>(false);
    Items: Array<pairingItem>;
    randomItems: Array<pairingItem>;
    leftRandom: boolean;
    leftWidth: CourseModel.pairingLeftWidth;
    leftWidthCls() { return 'left-' + CourseModel.pairingLeftWidth[this.leftWidth];}

    actItems() { return this.leftRandom ? this.randomItems : this.Items; }

    initProc(phase: initPhase, getTypeOnly: boolean, completed: () => void): initPhaseType {
      switch (phase) {
        case initPhase.afterRender2:
          if (!getTypeOnly) {
            //Nastaveni sirky prave strany jako rozdilu mezi MIN sirkou pairingu a sirkou prave strany (minus 145)
            var strings = _.map<CourseModel.tag, string>(this.Items,(it: CourseModel.pairingItem) => it.right);

            var styleHolder = this.selfElement().find('.oli-edit .teacher').first();
            var maxWidth = Gui2.maxTextWidth(strings, styleHolder);
            this.selfElement().find('.pairing-item .left-content').width(maxWidth + 10); //145px je sirka pomocnych casti pairingu, bez leveho a praveho obsahu: 

          }
          return initPhaseType.sync;
      }
      return super.initProc(phase, getTypeOnly, completed)
    }

    createResult(forceEval: boolean): CourseModel.PairingResult {
      return {
        ms: 0, s: 0, 
        tg: this._tg,
        flag: 0,
        Value: forceEval ? _.range(this.Items.length) : _.map(this.randomItems,(it: pairingItem) => it.selfIdx)
      };
    }
    setScore(): void {
      var v = this.result.Value; var cnt = 0;
      for (var i = 0; i < v.length; i++) if (i == v[i]) cnt++;
      var sw = (this.scoreWeight ? this.scoreWeight : 100) * v.length;
      this.result.ms = sw;
      this.result.s = Math.round(sw / v.length * cnt);
    }
    acceptData(done: boolean): void {//zmena stavu kontrolky na zaklade persistentnich dat
      super.acceptData(done);
      _.each(this.Items,(it: pairingItem) => {
        it.ok(this.done());
        it.result = { ms: 0, s: 0, tg: this._tg, flag: 0, Value: this.result.Value[it.selfIdx].toString() };
        it.acceptData(this.done());
      });
    }
    provideData(): void { //predani dat z kontrolky do persistence
      if (this.done()) return;
      this.result.Value = _.map<pairingItem, number>(this.Items, it => parseInt(it.user()));
    }
    select_left(it: pairingItem) {
      if (this.pageDone()) return;
      this.leftSelected(true);
      _.each<pairingItem>(this.Items, it => it.leftSelected(false));
      it.leftSelected(true);
    }
    select_right(it: pairingItem) {
      if (this.pageDone() || !this.leftSelected()) return;
      var leftSel = _.find(this.Items,(it: pairingItem) => it.leftSelected()); //levy vybrany na nastaveno leftSelected
      var itu = parseInt(it.user()); //co je nastaveno v pravem vybranem
      var rightSel = _.find(this.Items,(it: pairingItem) => it.selfIdx == itu); //najdi zdroj pro pravy vybrany
      //Vymena indexu
      var leftUser = leftSel.user();
      leftSel.user(rightSel.selfIdx.toString());
      it.user(leftUser);
      //spojnice
      it.ok(false); leftSel.ok(true);
      //pokud chybi pouze jedna spojnice, dopln ji.
      var notOk = null; var notOks = 0;
      _.each(this.Items,(it: pairingItem) => { if (it.ok()) return; notOks++; notOk = it });
      if (notOks == 1) notOk.ok(true);
      //globalni leftSelected stav
      this.leftSelected(false);
      _.each(this.Items,(it: pairingItem) => it.leftSelected(false));
    }
  }

  export class pairingItem extends edit implements CourseModel.pairingItem {
    doRegisterControl(data: CourseModel.pairingItem) {
      this.selfIdx = _.indexOf(this._owner.Items, this);
      this.user.subscribe((val: string) => this.userText(this._owner.Items[parseInt(val)].right));
      this.teacherTxt = this.right;
      this.corrects = [this.selfIdx.toString()];
    }
    pageCreated() { }

    right: string;
    selfIdx: number;
    _owner: pairing;
    //acceptData(done: boolean, userData: CourseModel.GapFillResult): void {//zmena stavu kontrolky na zaklade persistentnich dat
    //  this.result = userData;
    //  super.acceptData(done, userData);
    //}
    teacherTxt: string;
    userText = ko.observable<string>('');
    leftSelected = ko.observable<boolean>(false);
    ok = ko.observable<boolean>(false);
    select_left() { this._owner.select_left(this); }
    select_right() { this._owner.select_right(this); }
  }

  CourseModel.registerClassToInterface(CourseModel.meta, CourseModel.tpairing, pairing);
  CourseModel.registerClassToInterface(CourseModel.meta, CourseModel.tpairingItem, pairingItem);

}
