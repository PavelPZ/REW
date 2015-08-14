module Course {

  export class _evalObj extends tagImpl {
    controlData(id: string): any { return this._myPage.result.result[id]; }
  }

  export class evalPageImpl extends _evalObj implements CourseModel._evalPage {
    radioGroups: string;
    Items: Array<evalBtnImpl>;
    maxScore: number;
    pageCreated() {
      super.pageCreated();
      if (this.radioGroups) {
        //provazani radiobutton nebo wordSelection s radio grupou
        var radGrps: { [grp: string]: radioEvalImpl[]; } = {};
        _.each(_.map(this.radioGroups.split('|'), str => str.split(':')),(kv: Array<string>) => radGrps[kv[0]] = _.map(kv[1].split(','), id => <radioEvalImpl>(this._myPage.tags[id])));
        _.each(radGrps, radios => _.each(radios, r => r.myEvalGroup = radios));
      }
    }
    provideData() {
      _.each(this.Items, btn => btn.provideData()); //btn ma vlastni persistenci
      _.each(this.Items, btn => _.each(btn.Items, grp => grp.provideData())); //persistence podrizenych evalGroupImpl
    }
    acceptData(done: boolean) {
      _.each(this.Items, btn => btn.acceptData(done));
      _.each(this.Items, btn => _.each(btn.Items, grp => grp.acceptData(done)));
    }
    resetData() {
      _.each(this.Items, btn => btn.resetData());
      _.each(this.Items, btn => _.each(btn.Items, grp => grp.resetData()));
    }
    getScore(): CourseModel.Score {
      var res: CourseModel.Score = { ms: 0, s: 0, flag: 0 };
      _.each(this.Items, btn => _.each(btn.Items, grp => addORScore(res, grp.score())));
      return res;
    }
    findBtn(b: evalBtn): evalBtnImpl {
      return _.find(this.Items, eb => eb.myBtn == b);
    }
  }

  export class evalBtnImpl extends _evalObj implements CourseModel._evalBtn {
    Items: Array<evalGroupImpl>;
    maxScore: number;
    _owner: evalPageImpl;
    btnId: string;
    myBtn: evalBtn;
    pageCreated() {
      super.pageCreated();
      this.myBtn = _.isEmpty(this.btnId) ? null : <evalBtn>(this._myPage.tags[this.btnId]);
    }
    provideData() { if (!this.myBtn) return; /*this.myBtn.result = this.controlData(this.btnId);*/ this.myBtn.doProvideData(); }
    acceptData(done: boolean) { if (!this.myBtn) return; /*this.myBtn.result = this.controlData(this.btnId);*/ this.myBtn.acceptData(done); }
    resetData(): void { if (!this.myBtn) return; this.myBtn.resetData(this._myPage.result.result); }

    click(doneResult: boolean): CourseModel.Score {
      if (!this.myBtn) return null;
      _.each(this.Items, grp => { //vsechny kontrolku z self eval grupy
        if (!doneResult) { //cilovy stav je Normal => reset
          grp.resetData();
          return null;
        } else { //cilovy stav je doneResult => prevezmi data a zobraz vyhodnocenou kontrolku
          grp.provideData();
          var res = createORScoreObj(_.map(this.Items, it => it.score()));
          grp.acceptData(true);
          return res;
        }
      });
      return doneResult ? createORScoreObj(_.map(this.Items, it => it.score())) : null;
    }
  }

  export class evalGroupImpl extends _evalObj implements CourseModel._evalGroup {
    isAnd: boolean;
    isExchangeable: boolean;
    maxScore: number;
    evalControlIds: Array<string>;
    //--
    _owner: evalBtnImpl;
    evalControls: Array<evalControlImpl> = [];
    pageCreated() {
      super.pageCreated();
      this.evalControls = [];
      _.each(this.evalControlIds, t => {
        var ctrl = <evalControlImpl>(this._myPage.tags[t]);
        this.evalControls.push(ctrl);
        //ctrl.myEvalGroup = this;
        ctrl.myEvalBtn = this._owner.myBtn;
      });
    }
    provideData() {
      _.each(this.evalControls, c => c.doProvideData());
      if (this.isExchangeable) {
        var res: evalGroupResult = this._myPage.result.result[this.id] = this.provideExchangeable();
        this.acceptExchangeable(res);
      }
    }
    acceptData(done: boolean) {
      if (this.isExchangeable) this.acceptExchangeable(this.controlData(this.id));
      _.each(this.evalControls, c => { c.result = this.controlData(c.id); c.acceptData(done); });
    }
    resetData() {
      if (this.isExchangeable) delete this.controlData[this.id];
      _.each(this.evalControls, c => c.resetData(this._myPage.result.result));
      if (this.isExchangeable) this.provideExchangeable();
    }
    score(): CourseModel.Score {
      if (this.isAnd) {
        return createAndScoreObj(_.map(this.evalControls, c => c.result));
      } else {
        return createORScoreObj(_.map(this.evalControls, c => c.result));
      }
    }
    acceptExchangeable(res: evalGroupResult): boolean {
      if (!res || !res.onBehavMap) return;
      //adresar vsech eval group edits
      var edits: { [id: string]: edit; } = {};
      _.map(edit.filter(this.evalControls), ed => edits[ed.id] = ed);
      //vypln editum jejich onBehav
      for (var p in res.onBehavMap) {
        if (!edits[p]) { //zmena identifikace edits? Vynuluj vse kolem onBehav
          delete res.onBehavMap;
          _.each(edits, ed => ed.onBehav(ed));
          return;
        }
        edits[p].onBehav(edits[res.onBehavMap[p]]);
      }
    }

    provideExchangeable(): evalGroupResult {
      var res: evalGroupResult = { tg: undefined, flag: 0, onBehavMap: {}, ms: 0, s: 0 };
      var edits = edit.filter(this.evalControls);
      var isDropDown = edits[0]._tg == CourseModel.tdropDown && !(<dropDown>(edits[0])).gapFillLike;
      var resultValue = (ed: edit) => { //co uzivatel zadal
        if (!isDropDown) return ed.result.Value;
        if (_.isEmpty(ed.result.Value)) return null;
        return ed.source.findDropDownViaId(ed.result.Value.substr(1)).correctValue;
      };
      //normalizovane uzivatelovy odpovedi
      var userVals = _.map(edits, e => { return { ed: e, val: resultValue(e), norm: isDropDown ? resultValue(e) : e.doNormalize(resultValue(e)) } });
      //normalizovane spravne odpovedi
      var corrects = _.map(edits, e => { return { ed: e, vals: _.map(e.correctValue.split('|'), c => isDropDown ? c : e.doNormalize(c)) } });
      //jsou vsechny spravne odpovedi rozdilne?
      var corrAll = _.flatten(_.map(corrects, c => c.vals));
      if (_.uniq(corrAll).length < corrAll.length) { debugger; throw '_.uniq(corrAll).length < corrAll.length'; }
      //sparovani spravnych odpoved
      for (var i = 0; i < userVals.length; i++) {
        var userVal = userVals[i];
        for (var j = 0; j < corrects.length; j++) {
          var correct = corrects[j];
          if (!correct || !_.any(correct.vals, v => v == userVal.norm)) continue; //uzivatelova odpoved v spravnych odpovedich nenalezena
          res.onBehavMap[userVal.ed.id] = correct.ed.id; //nalezena => dosad do persistence
          userVals[i] = null; corrects[j] = null; //odstran uzivatelovu odpoved i nalezeny edit ze seznamu
        };
      }
      //pouziti spatnych odpovedi
      _.each(_.zip(_.filter(userVals, u => !!u), _.filter(corrects, u => !!u)), uc => {
        var userVal = uc[0]; var correct = uc[1];
        res.onBehavMap[userVal.ed.id] = correct.ed.id;
      });
      //je potreba znova spocitat score
      this.acceptExchangeable(res); //doplni onBehav
      _.each(this.evalControls, ctrl => ctrl.setScore()); //do vysledku dosadi score
      return res;
    }
  }

  export interface evalGroupResult extends CourseModel.Result {
    onBehavMap: { [edId: string]: string; };
  }

  function addORScore(res: CourseModel.Score, sc: CourseModel.Score) {
    res.ms += sc.ms; res.s += sc.s; res.flag |= sc.flag;
  }

  function createORScoreObj(scs: CourseModel.Score[]) {
    var res: CourseModel.Score = { ms: 0, s: 0, flag: 0 };
    _.each(scs, sc => addORScore(res, sc));
    return res;
  }

  function _createAndScoreObj(scs: CourseModel.Score[]) {
    //var allOK = _.all(this.evalControls, ctrl => ctrl.result.ms == ctrl.result.s);
    //return { ms: 1, s: allOK ? 1 : 0, flag: 0 };
    var res: CourseModel.Score = { ms: 1, s: 1, flag: 0 };
    var hasWrong = false;
    _.each(scs, sc => { hasWrong = hasWrong || sc.ms != sc.s; res.flag |= sc.flag });
    if (hasWrong) res.s = 0;
    return res;
  }

  function createAndScoreObj(scs: CourseModel.Score[]) {
    var res: CourseModel.Score = { ms: 0, s: 0, flag: 0 }; var cnt = 0;
    _.each(scs, sc => { res.ms += sc.ms; res.s += sc.s; res.flag |= sc.flag; cnt++; });
    var ok = res.ms == res.s;
    res.ms = Math.round(res.ms / cnt); res.s = ok ? res.ms : 0;
    return res;
  }


  CourseModel.registerClassToInterface(CourseModel.meta, CourseModel.t_evalPage, evalPageImpl);
  CourseModel.registerClassToInterface(CourseModel.meta, CourseModel.t_evalGroup, evalGroupImpl);
  CourseModel.registerClassToInterface(CourseModel.meta, CourseModel.t_evalBtn, evalBtnImpl);
} 