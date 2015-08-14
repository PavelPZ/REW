module Course {

  export enum ordItemStatus { no /*nezarazene*/, fake /*posledni fake item, kvul vlozeni na konec*/, done /*zarazene, nevybrane pro editaci*/, edited /*vybrane pro editaci*/ }

  export class orderItem extends tagImpl implements CourseModel.sentenceOrderingItem {
    text: string;
    owner: ordering;
    idx: number;
    $self: JQuery;
    click() {
      var inSrc = this.inSrc();
      this.$self.detach();
      (inSrc ? this.owner.$destBlock : this.owner.$srcBlock).append(this.$self[0]);
    }
    inSrc(): boolean {
      return this.$self[0].parentElement == this.owner.$srcBlock[0];
    }
  }

  export class ordering extends evalControlImpl {
    Items: Array<orderItem>;
    randomItems: Array<orderItem>;
    $srcBlock: JQuery;
    $destBlock: JQuery;
    result: CourseModel.orderingResult;
    evaluated = ko.observable(false);

    initProc(phase: initPhase, getTypeOnly: boolean, completed: () => void): initPhaseType {
      switch (phase) {
        case initPhase.afterRender2:
          if (!getTypeOnly) {
            this.$srcBlock = $('#ordering-' + this.id + ' .src-block'); this.$destBlock = $('#ordering-' + this.id + ' .dest-block');
            _.each(_.zip(this.$srcBlock.children('div').toArray(), this.randomItems), arr => arr[1].$self = $(arr[0]));
          }
          return initPhaseType.sync;
      }
      return super.initProc(phase, getTypeOnly, completed)
    }

    initRandomize() {
      var cnt = 0; _.each(this.Items, it => { it.idx = cnt++; it.owner = this; });
      var rnd = Utils.randomizeArray(_.range(this.Items.length));
      this.randomItems = _.map<number, orderItem>(rnd, i => <orderItem>(this.Items[i]));
    }

    dones(): Array<orderItem> {
      if (!this.$destBlock) return [];
      return _.filter(_.map(this.$destBlock[0].children, ch => _.find(this.Items, it => it.$self[0] == ch)), it => !!it);
    }

    createResult(forceEval: boolean): CourseModel.orderingResult {
      return {
        ms: 0, s: 0,
        tg: this._tg,
        flag: 0,
        indexes: forceEval ? _.range(this.randomItems.length) : [] //_.map(this.randomItems, it => it.idx)
      };
    }
    isCorrect(): boolean {
      return this.isCorrectEx().isCorrect;
    }
    isCorrectEx(): { isCorrect: boolean; dones: Array<orderItem>; } {
      var res = { isCorrect: false, dones: null };
      res.dones = this.dones();
      if (res.dones.length != this.Items.length) return res;
      for (var i = 0; i < res.dones.length; i++) if (res.dones[i].idx != i) return res;
      res.isCorrect = true; return res;
    }
    acceptData(done: boolean): void {//zmena stavu kontrolky na zaklade persistentnich dat
      super.acceptData(done);
      try {
        if (!this.result.indexes || this.result.indexes.length == 0) return;
        _.each(this.result.indexes, idx => { if (this.Items[idx].inSrc()) this.Items[idx].click(); });
      } finally {
        this.evaluated(done);
      }
    }
    provideData(): void { //predani dat z kontrolky do persistence
      if (this.done()) return;
      this.result.indexes = _.map(this.dones(), it => it.idx);
    }
  }

  export class orderWordItem extends orderItem {
    evalText: string;
  }

  export class wordOrdering extends ordering implements CourseModel.wordOrdering {
    Items: Array<orderWordItem>;
    randomItems: Array<orderWordItem>;
    correctOrder: string;

    teacher: string;
    user = ko.observable<string>('');
    evalStatus = ko.observable('');

    pageCreated() {
      this.Items = _.map(this.correctOrder.split('|'), txt => {
        var res = new orderWordItem();
        var parts = txt.split('#');
        res.text = parts[0];
        res.evalText = parts[parts.length == 2 ? 1 : 0];
        return res;
      });
      this.teacher = _.map(this.Items,(it: orderWordItem) => it.evalText).join(' ');
      this.initRandomize();
      super.pageCreated();
    }

    acceptData(done: boolean): void {//zmena stavu kontrolky na zaklade persistentnich dat
      super.acceptData(done);
      if (!done) return;
      var corr = this.isCorrectEx();
      this.user(corr.isCorrect ? this.teacher : _.map(corr.dones, it => it.text).join(' '));
      this.evalStatus(corr.isCorrect ? 'eval-green' : (corr.dones.length==0 ? 'eval-red' : 'eval-strike'));
    }
  }

  export class orderSentenceItem extends orderItem {
    evalStatus = ko.observable('');
    teacher = ko.observable<string>('');
  }

  export class sentenceOrdering extends ordering implements CourseModel.sentenceOrdering {
    Items: Array<orderSentenceItem>;
    randomItems: Array<orderSentenceItem>;

    jsonMLParsed() {
      super.jsonMLParsed();
      _.each(this.Items, it => it.text = <any>(it.Items[0]));
      this.initRandomize();
    }

    acceptData(done: boolean): void {//zmena stavu kontrolky na zaklade persistentnich dat
      super.acceptData(done);
      if (!done) return;
      var corr = this.isCorrectEx();
      //jiz pretazene
      for (var i = 0; i < corr.dones.length; i++) {
        var it: orderSentenceItem = <orderSentenceItem>(corr.dones[i]);
        it.teacher(this.Items[i].text);
        it.evalStatus(it.idx == i ? 'eval-green' : 'eval-strike');
      }
      //nepretazene
      var lastIdx = corr.dones.length;
      var noDones = _.filter(this.Items, it => _.all(corr.dones, d => d != it));
      _.each(noDones, nd => { nd.click(); nd.evalStatus('eval-red'); nd.teacher(this.Items[lastIdx++].text); });
    }

  }

  CourseModel.registerClassToInterface(CourseModel.meta, CourseModel.twordOrdering, wordOrdering);
  CourseModel.registerClassToInterface(CourseModel.meta, CourseModel.tsentenceOrdering, sentenceOrdering);
  CourseModel.registerClassToInterface(CourseModel.meta, CourseModel.tsentenceOrderingItem, orderSentenceItem);

}
 