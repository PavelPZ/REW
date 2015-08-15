module Login {
  export interface CmdHumanEvaluatorSet {
    dsgn_impl: schoolAdmin.evaluatorImpl;
    dsgn_done: boolean;
  }
}
module schoolAdmin {

  //prechudce seznamu s Line
  export class evaluatorLangLow {
    constructor(public lang: LMComLib.LineIds) {
      this.title = locLangs[lang]();
      this.langTitle = LMComLib.LineIds[lang].toLowerCase();
    }
    title: string;
    langTitle: string;
  }


  //*************************************************************
  //  home stranka Assign testu hodnotitelum
  //  obsahuje zeznam jazyku testu
  //*************************************************************
  export class HumanEvalManagerLangs extends CompModel {
    constructor(urlParts: string[]) {
      super(humanEvalManagerLangsTypeName, urlParts);
    }
    langs: evaluatorLangLow[];

    // UPDATE
    update(completed: () => void): void { //vytvoreni modelu
      Pager.ajaxGet(
        Pager.pathType.restServices,
        Login.CmdHumanEvalManagerLangs_Type,
        Login.CmdHumanEvalManagerLangs_Create(LMStatus.Cookie.id, this.CompanyId),
        (res: Login.CmdHumanEvalManagerLangsResult) => {
          this.langs = _.map(res.lines, l => new evaluatorLangCount(l.line, l.count));
          completed();
        });
    }
    click(idx: number) {
      location.hash = schoolAdmin.getHash(schoolAdmin.humanEvalManagerTypeName, this.CompanyId) + hashDelim + this.langs[idx].lang.toString();
    }
    close() {
      location.hash = schools.createHomeUrlStd();
    }
  }
  export class evaluatorLangCount extends evaluatorLangLow {
    constructor(public lang: LMComLib.LineIds, public count: number) { super(lang); }
  }


  //*************************************************************
  //  Assign testu (vybraneho jazyka) hodnotitelum
  //*************************************************************
  export class HumanEvalManager extends CompModel {
    constructor(urlParts: string[]) {
      super(humanEvalManagerTypeName, urlParts);
      this.actLine = parseInt(urlParts[1]);
    }

    // UPDATE
    update(completed: () => void): void { //vytvoreni modelu
      Pager.ajaxGet(
        Pager.pathType.restServices,
        Login.CmdHumanEvalManagerGet_Type,
        Login.CmdHumanEvalManagerGet_Create(LMStatus.Cookie.id, this.actLine, this.CompanyId),
        (allRes: Login.CmdHumanEvalManagerGetResult) => {
          this.data = allRes;
          //DEBUG
          //allRes.evaluators[0].toDo.pushArray([{ assigned: 1, courseUserId: 31, productId: '' }, { assigned: 1, courseUserId: 32, productId: '' }]);
          //allRes.evaluators.push({ email: 'xxx', name: '', companyUserId: 0, toDo: [] });
          //allRes.toEvaluate.pushArray([{ assigned: 1, courseUserId: 33, productId: '' }, { assigned: 1, courseUserId: 34, productId: '' }]);

          var idx = 0; this.olds = 0; this.all = 0;
          this.evaluators = _.map<Login.CmdHumanEvaluatorGet, evaluatorImpl>(allRes.evaluators, ev => { this.olds += ev.toDo.length; return new evaluatorImpl(this, idx++, ev); });
          this.all = this.olds + allRes.toEvaluate.length;
          completed();
        });
    }
    loaded(): void { //po generaci HTML stranky z modelu
      this.form = $('#human-form');
      this.form.validate();
      _.each(this.evaluators, e => e.loaded());
      this.refreshNumbers();
    }

    actLine: LMComLib.LineIds;
    data: Login.CmdHumanEvalManagerGetResult; //data z requestu
    evaluators: Array<evaluatorImpl>; //model pro evalutory
    form: JQuery; //formular
    //globalni cisla
    olds: number;
    oldRemoved = ko.observable(0);
    all: number;
    news = ko.observable(0);

    validate(act: evaluatorImpl, val: string): { min: number; max: number; } {
      if (val.trim() == '') return null;
      var numVal = parseInt(val);
      //vsechny allForce (mimo act) jsou neprazdne => min = max = all
      if (_.all(this.evaluators, e => e == act || !_.isEmpty(e.allForce()))) { return numVal == act.all() ? null : { min: act.all(), max: act.all() }; }
      //spocti max. povolenou hodnotu
      var usedNews = 0; //pouzite not assigned (news)
      _.each(this.evaluators, e => {
        if (e == act || _.isEmpty(e.allForce())) return;
        usedNews += parseInt(e.allForce()) - e.olds;
      });
      var res = { min: 0, max: this.data.toEvaluate.length - usedNews + act.toDo.length };
      return numVal >= res.min && numVal <= res.max ? null : res;
    }

    refreshNumbers() {
      //allChange: hodnota news (kladny) nebo oldRemoved (zaporny)
      var allChange = 0; var autoAssign: Array<evaluatorImpl> = [];
      _.each(this.evaluators, e => {
        if (_.isEmpty(e.allForce())) { autoAssign.push(e); return; }
        var allForce = parseInt(e.allForce()); e.all(allForce);
        var change = allForce - e.olds; allChange += change;
        if (change > 0) {
          e.news(change); e.oldRemoved(0);
        } else {
          e.news(0); e.oldRemoved(-change);
        }
      });

      var toDo = this.all - this.olds - allChange;
      if (autoAssign.length != 0) { 
        //rozdel zbyle studenty
        var delta = Math.round(toDo / autoAssign.length);
        _.each(autoAssign, e => {
          var act = delta < toDo ? delta : toDo;
          e.news(act); e.oldRemoved(0);
          toDo -= act;
          e.all(act + e.olds);
        });
        if (toDo > 0) { var rest = autoAssign[autoAssign.length - 1]; rest.news(rest.news() + toDo); }
      }

      //soucty
      var oldRemovedSum = 0, newsSum = 0;
      _.each(this.evaluators, e => { oldRemovedSum += e.oldRemoved(); newsSum += e.news(); });
      this.oldRemoved(oldRemovedSum); this.news(newsSum);
    }

    ok() {
      //priprav si vysledek
      var res = _.map(this.evaluators, e => { var r: Login.CmdHumanEvaluatorSet = { companyUserId: e.data.companyUserId, courseUserIds: [], dsgn_impl: e, dsgn_done: false }; return r; });
      var toAsign = _.map(this.data.toEvaluate, e => e.courseUserId);
      //1. pruchod: obohat toAsign o odstranene studenty (oldRemoved>0)
      _.each(res, r => {
        var remNum = r.dsgn_impl.oldRemoved(); if (remNum <= 0) return;
        var data = r.dsgn_impl.data; //old asigned
        toAsign.pushArray(_.map(data.toDo.slice(data.toDo.length - remNum), v => v.courseUserId)); //remove end of old asigned
        r.courseUserIds = _.map(data.toDo.slice(0, data.toDo.length - remNum), v => v.courseUserId); //use start of old asigned
        if (r.dsgn_impl.news() > 0) { debugger; throw 'r.dsgn_impl.news() > 0'; }
        r.dsgn_done = true;
      });
      //2. pruchod: rozdel nove a odstranene studenty, odstran dsgn props
      var firstIdx = 0;
      _.each(res, r => {
        var toAdd = r.dsgn_impl.news();
        if (!r.dsgn_done) {
          r.courseUserIds.pushArray(_.map(r.dsgn_impl.data.toDo, a => a.courseUserId)); //old
          r.courseUserIds.pushArray(toAsign.slice(firstIdx, firstIdx + toAdd)); //new
          firstIdx += toAdd;
        }
        delete r.dsgn_done; delete r.dsgn_impl;
      });
      Pager.ajaxGet(
        Pager.pathType.restServices,
        Login.CmdHumanEvalManagerSet_Type,
        Login.CmdHumanEvalManagerSet_Create(res),
        () => this.cancel()
        );
    }

    cancel() { location.hash = schoolAdmin.getHash(schoolAdmin.humanEvalManagerLangsTypeName, this.CompanyId); }
  }

  //model pro jednoho evaluatora
  export class evaluatorImpl implements Login.CmdHumanEvaluatorGet {
    constructor(public owner: HumanEvalManager, public index: number, public data: Login.CmdHumanEvaluatorGet) {
      jQuery.extend(this, data);
      this.olds = data.toDo.length;
      this.allForce.subscribe(val => this.owner.refreshNumbers());

      this.attemptAllForce = ko.computed<string>({
        read: this.allForce,
        write: (val: string) => {
          var validRes = this.owner.validate(this, val);
          var vtor = this.owner.form.validate();
          this.valid = validRes == null;
          if (this.valid) {
            this.allForce(val); vtor.removeError(this.input[0]);
          } else
            vtor.addError({ element: this.input[0], message: $.validator.messages.range(validRes.min.toString(), validRes.max.toString()) + ' ' + CSLocalize('495ccadce4d34bdc920bd1898aa0fed7', 'or let the field empty.') });
        },
        owner: this
      });
    }
    loaded(): void { //po generaci HTML stranky z modelu
      this.input = $('#new-input-' + this.index.toString());
      this.input.blur(ev => { if (!this.valid) this.input.focus(); });
    }
    
    //CmdHumanEvaluatorGet interface
    companyUserId: number;
    email: string;
    name: string;
    toDo: Array<Login.CmdHumanStudent>;

    input: JQuery;
    valid = true;

    //cisla
    olds: number; //stare (...already assigned)
    oldRemoved = ko.observable(0); //removed stare (...removed)
    news = ko.observable(0); //nove (...new assigned)
    //INPUT v ...all
    allForce: KnockoutObservable<string> = ko.observable(null); //validovana hodnota, nastavena managerem
    attemptAllForce: KnockoutComputed<string>; //binding k INPUT. kdyz validace OK, da hodnotu do allForce. Neboli nevalidovana hodnota, nastavena managerem
    all = ko.observable(0); //label v ...all. Pro neprazdny allForce se rovna allForce
  }

  //*************************************************************
  //  sprava evaluatoru - pridani, nastaveni lines, mazani
  //*************************************************************
  export class HumanEvalManagerEvs extends CompModel {
    constructor(urlParts: string[]) {
      super(humanEvalManagerEvsTypeName, urlParts);
    }

    // UPDATE
    update(completed: () => void): void { //vytvoreni modelu
      Pager.ajaxGet(
        Pager.pathType.restServices,
        Login.CmdHumanEvalManagerEvsGet_Type,
        Login.CmdHumanEvalManagerEvsGet_Create(LMStatus.Cookie.id, this.CompanyId),
        (res: Login.CmdHumanEvalManagerEvsItem[]) => {
          this.evaluators = _.sortBy(_.map(res, it => new evaluator(it)), e => e.data.email);
          this.modalDlg = new evaluatorModalDlg(this);
          completed();
        });
    }

    loaded(): void { //po generaci HTML stranky z modelu
      this.modalDlg.loaded();
    }

    modalDlg; evaluatorModalDlg;
    evaluators: evaluator[];

    edit(id: number) {
      this.modalDlg.show(id);
    }
    del(id: number) {
      anim.alert().show(CSLocalize('4724072775e1467eb90aaaa4cd7a5068', 'Do you really want to remove this Evaluator from the system?'),
        ok => {
          if (!ok) return;
          Pager.ajaxGet(
            Pager.pathType.restServices,
            Login.CmdHumanEvalManagerEvsSave_Type,
            Login.CmdHumanEvalManagerEvsSave_Create(-id, this.CompanyId, null, null),
            (res: boolean) => Pager.reloadPage());
        });
    }
    add() {
      this.modalDlg.show(0);
    }
    close() {
      location.hash = schools.createHomeUrlStd();
    }
    refresh(completed: () => void) {
    }
    downloadReport() {
      Pager.ajax_download(
        Pager.path(Pager.pathType.restServices),
        Login.CmdReport_Create(schools.LMComUserId(), CourseMeta.actCompanyId, Login.CmdReportType.evaluators),
        Login.CmdReport_Type);
    }
  }

  //model pro jednoho evaluator
  export class evaluator {
    constructor(public data: Login.CmdHumanEvalManagerEvsItem) {
      this.langs = _.map(data.evalInfos, l => new evaluatorLangLow(l.lang));
    }
    langs: evaluatorLangLow[];
  }

  jQuery.validator.addMethod("humanUnique",
    (val: string, element, params) => {
      var model: evaluatorModalDlg = params.model;
      val = val.trim().toLowerCase();
      return _.all(model.owner.evaluators, e => e.data.email != val);
    },
    (params, element) => {
      return CSLocalize('44461a0351fc4224845dd09794b580f0', 'email address already exists');
    });

  export class evaluatorModalDlg {
    constructor(public owner: HumanEvalManagerEvs) {
      this.langs = _.map(avalLangs, l => new evaluatorLang(l));
    }
    loaded() {
      this.myCtrl = $('#evaluator-modal-dlg');
      this.form = this.myCtrl.find('form');
      this.validator = this.form.validate({
        onsubmit: false,
        rules: {
          'human-email-input': {
            required: true,
            email: true,
            humanUnique: {
              model: this
            }
          }
        }
      });
      this.emailCtrl = this.form.find('#human-email-input');
      this.langsCtrl = this.form.find('#human-langs'); this.langsCtrl[0]['type'] = '';
    }
    show(id: number, completed: () => void) {
      this.isEdit(id > 0);
      this.actEvaluator = id == 0 ? null : _.find(this.owner.evaluators, ev => ev.data.companyUserId == id);
      this.email(this.actEvaluator ? this.actEvaluator.data.email : '');
      var actLangs = this.actEvaluator ? _.map(this.actEvaluator.langs, l => l.lang) : [];
      _.each(this.langs, l => l.checked(_.contains(actLangs, l.lang)));
      this.validator.removeError(this.langsCtrl[0]); this.validator.removeError(this.emailCtrl[0]);
      this.myCtrl.modal('show');
    }
    myCtrl: JQuery;
    form: JQuery;
    validator: Validator;
    email = ko.observable('');
    emailCtrl: JQuery;
    langsCtrl: JQuery;
    actEvaluator: evaluator;
    langs: evaluatorLang[];
    isEdit = ko.observable(false);
    ok() {
      if (!this.actEvaluator && !this.form.valid()) return;
      var par = Login.CmdHumanEvalManagerEvsSave_Create(0, this.owner.CompanyId, null, null);
      if (this.actEvaluator) par.companyUserId = this.actEvaluator.data.companyUserId; else par.email = this.email();
      if (!this.langsValid()) {
        this.validator.addError({ element: this.langsCtrl[0], message: CSLocalize('dea496b88f524c4ab10895368de79d0f', 'At least one language must be selected') });
        return;
      }
      this.validator.removeError(this.langsCtrl[0]);
      par.evalInfos = _.map(_.filter(this.langs, l => l.checked()), l => { return { lang: l.lang }; });
      Pager.ajaxGet(
        Pager.pathType.restServices,
        Login.CmdHumanEvalManagerEvsSave_Type,
        par,
        (res: boolean) => {
          if (!res) {
            this.validator.addError({ element: this.emailCtrl[0], message: CSLocalize('be46325868c844ca8c6f1d433437ffd3', 'Person with this email address is not registered in the system') });
            return;
          }
          this.myCtrl.modal('hide');
          Pager.reloadPage();
        });
    }
    langsValid(): boolean { return _.any(this.langs, l => l.checked()); }
  }

  //jedna line jednoho evaluatora
  export class evaluatorLang extends evaluatorLangLow {
    checked = ko.observable(false);
  }
  var avalLangs: LMComLib.LineIds[] = [LMComLib.LineIds.English, LMComLib.LineIds.German, LMComLib.LineIds.Spanish, LMComLib.LineIds.French, LMComLib.LineIds.Italian, LMComLib.LineIds.Russian];
  var locLangs: { [c: number]: () => string; } = {};
  locLangs[LMComLib.LineIds.English] = () => CSLocalize('469d05c7cef5487fb29048505902a1a8', 'English');
  locLangs[LMComLib.LineIds.German] = () => CSLocalize('94606ae1ef72415f848daeb779f0f259', 'German');
  locLangs[LMComLib.LineIds.Italian] = () => CSLocalize('66ea06373abb486dbb0dd8598b895dc6', 'Italian');
  locLangs[LMComLib.LineIds.Spanish] = () => CSLocalize('a82c4ec950354576ab605a5191ce8988', 'Spanish');
  locLangs[LMComLib.LineIds.French] = () => CSLocalize('d694058048d242459d329a9b19a15f66', 'French');
  locLangs[LMComLib.LineIds.Russian] = () => CSLocalize('ad2f4d121a3d4518a035ea7949473dc4', 'Russian');
  
  //*************************************************************
  //  TODO: rozsirena varianta assign formulare: vstupni data jsou v excelu, do formulare se provadi PASTE identifikaci testu
  //*************************************************************
  export class HumanEvalManagerEx extends CompModel {
    constructor(urlParts: string[]) {
      super(humanEvalManagerExTypeName, urlParts);
    }

    // UPDATE
    update(completed: () => void): void { //vytvoreni modelu
      completed();
    }
  }

  //Pager.registerAppLocator(appId, humanEvalManagerLangsTypeName,(urlParts, completed) => completed(new HumanEvalManagerLangs(urlParts)));
  //Pager.registerAppLocator(appId, humanEvalManagerTypeName,(urlParts, completed) => completed(new HumanEvalManager(urlParts)));
  //Pager.registerAppLocator(appId, humanEvalManagerEvsTypeName,(urlParts, completed) => completed(new HumanEvalManagerEvs(urlParts)));
  //Pager.registerAppLocator(appId, humanEvalManagerExTypeName,(urlParts, completed) => completed(new HumanEvalManagerEx(urlParts)));

  blended.oldLocators.push($stateProvider => blended.registerOldLocator($stateProvider, humanEvalManagerLangsTypeName, appId, humanEvalManagerLangsTypeName, 1, urlParts => new HumanEvalManagerLangs(urlParts)));
  blended.oldLocators.push($stateProvider => blended.registerOldLocator($stateProvider, humanEvalManagerTypeName, appId, humanEvalManagerTypeName, 2, urlParts => new HumanEvalManager(urlParts)));
  blended.oldLocators.push($stateProvider => blended.registerOldLocator($stateProvider, humanEvalManagerEvsTypeName, appId, humanEvalManagerEvsTypeName, 1, urlParts => new HumanEvalManagerEvs(urlParts)));
  blended.oldLocators.push($stateProvider => blended.registerOldLocator($stateProvider, humanEvalManagerExTypeName, appId, humanEvalManagerExTypeName, 1, urlParts => new HumanEvalManagerEx(urlParts)));

}

