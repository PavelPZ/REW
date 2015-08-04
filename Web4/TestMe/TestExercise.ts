module testMe {

  export class Skills {
    static no = "no";
    static UseLanguage = "UseLanguage";
    static Reading = "Reading";
    static Listening = "Listening";
    static Speaking = "Speaking";
    static Writing = "Writing";
    //public static string[]all = new string[]{ UseLanguage, Reading, Listening, Speaking, Writing };
  }


  export var tEx: string = "testExModel".toLowerCase();
  export var tResults: string = "testResultsModel".toLowerCase();
  export var tResult: string = "testResultModel".toLowerCase();

  var greenGreen = 0;
  var greenDone = 1;
  //var defaultGreenIcon = 'play'; //Trados.isRtl ? "chevron-left" : "chevron-right"; //ikona zelene sipky

  export var alowTestCreate_Url: string; //priznak, ze je dovoleno vytvorit novy test. Nastavuje se na home pri skoku do testu.

  export class notifier {
    progressBar = ko.observable(0);
    remaindSeconds = 0;
    active = ko.observable(false);
    progressText = ko.observable('');
    skillText = ko.observable('');
  }
  export var notify = new notifier();
  function testTitle(test: testImpl) { return !test ? '' : (!test.isDemoTest ? test.title : CSLocalize('20c1ce9cee3d4c02b9e9cb4a76fdb2f4', 'Demo test')); }

  export class Model extends schools.Model {

    constructor(urlParts: string[]) {
      super(tEx, urlParts);
      this.appId = appId;
    }

    isPretest = false; //zobraz pretest stranku
    isHome = true; //zobraz home stranku
    makeInterruptionInEx = false; //ve cviceni vypln interruption
    isResult: boolean = false; //priznak cviceni v result stavu. Nastane pouze kdyz se naviguje na stranku testu s hotovym testem
    greenStatus = greenGreen; //stav zelene sipky, jedna z hodnot greenGreen, ...
    greenTitle: string; //titulek zelene sipky
    //greenIcon = Trados.isRtl ? "hand-o-left" : "hand-o-right"; //ikona zelene sipky
    greenIcon: string; // = defaultGreenIcon; //ikona zelene sipky
    actModule: testSkillImpl; //aktualni modul (skill)
    actTest: testImpl;
    //exItems: Array<IExItem>; //navigace nad cvicenimi
    modStarts: { [url: string]: number; } = {};
    actIdx = 0; //index aktualniho cviceni aktualniho modulu
    skipAdjustExModule = false;
    startTime = 0; //cas spusteni testu
    timer: number; //timer na hlidani casu testu
    instrTitle = ko.observable<string>("");
    instrBody = ko.observable<string>("");
    //progressBar = ko.observable(0);
    //progressText = ko.observable('');
    notLowTime = ko.observable(true);
    //modelJustCreated = true;
    skills: Array<SkillItemLabel>;
    //skillSmall: string;
    skillSmallStatus: number; //0..prvni, 1..prostredni, 2..posledni

    testDisabled = ko.observable(false);

    exWasDone: boolean;

    leave() {
      alowTestCreate_Url = null;
      //saveProduct($.noop);
    }
    loaded(): void {
      if (!this.actTest || this.actTest.needs == CourseMeta.testNeeds.no) return;
      if (this.isHome) {
        var id = this.needsRecording() ? 'testForRecording' : 'testForPlaying';
        CourseMeta.processInlineControls(id.toLowerCase(), $.noop);
      } else
        SndLow.getGlobalMedia().adjustGlobalDriver(this.needsRecording(),(dr, disabled) => this.testDisabled(disabled));
    }
    needsRecording = ko.observable(false);
    needsPlaying = ko.observable(false);
    isDemoTest = ko.observable(true);
    testTitle = ko.observable('');
    hasDemotest = ko.observable(false);

    demoTestClick() {
      if (!this.actTest || !this.actTest.demoTestUrl) return;
      persistMemory.reset();
      var hash = testMe.createUrlPersist(testMe.tEx, CourseMeta.actCompanyId, this.actTest.demoTestUrl, schools.memoryPersistId);
      testMe.alowTestCreate_Url = this.actTest.demoTestUrl;
      window.location.hash = hash;
    }
    //  if (!this.actTest || this.actTest.needs == CourseMeta.testNeeds.no) return false;
    //  return this.actTest.needs == CourseMeta.testNeeds.recording;
    //}
    doUpdate(completed: () => void): void {
      var th = this;
      //CourseMeta.lib.adjustInstr(() => //nacteni a lokalizace insrukci
      CourseMeta.lib.adjustProduct(th.productUrl, th.persistence, justLoaded => { //nacteni produktu a short dat k produktu

        //*** multi test
        var multiTest = this.multiTest();
        if (multiTest) {
          if (!multiTest.level) {
            th.isPretest = true;
            th.isHome = false;
            th.greenTitle = CSLocalize('cabaf1ac6e8e4e219201e43b28852705', 'Finish Self-evaluation form');
            var questEx = this.multiQuestionnaire();
            CourseMeta.lib.adjustEx(questEx,
              () => CourseMeta.lib.displayEx(questEx, null, actEx => {
                Logger.trace_course('testMe questEx: doUpdate end');
              }))
            return;
          } else
            th.actTest = this.multiActTest();
        } else
          //*** normalni test
          th.actTest = <testImpl>CourseMeta.actCourseRoot;

        this.needsRecording(this.actTest.needs == CourseMeta.testNeeds.recording);
        this.needsPlaying(this.actTest.needs == CourseMeta.testNeeds.playing);
        this.isDemoTest(!this.actTest || this.actTest.isDemoTest);
        this.testTitle(testTitle(this.actTest));
        this.hasDemotest(this.actTest && !!this.actTest.demoTestUrl); //nastavuje se v ObjectModel\Model\CourseMeta.cs if (res2.line == LineIds.English), NewLMComModel\Design\CourseProducts.cs lang != CourseIds.English ? "needs=recording" : 

        //osetreni home
        if (th.isHome) { //jsem na home
          th.greenTitle = CSLocalize('130c662ad53e4f5589557fdd620e47a5', 'Run test');
          th.makeInterruptionInEx = !!th.actTest.interrupts;
          if (!th.actTest.isDemoTest && alowTestCreate_Url != th.productUrl) { location.href = '#'; return; }

          th.actTest.expandDynamicAll(); //expanze dynamickych modulu

          th.findActModule(); //najdi aktualni modul
          if (th.actModule == null) { location.hash = createUrl(tResult); return; }//neni aktualni modul (tj. hotovo) => jdi na vysledek 
        }

        th.createSkillsModel();

        if (th.isHome) { completed(); return; }

        if (!th.actTest.interrupts) {
          th.actTest.interrupts = [];
          th.actTest.started = Utils.dateToNum(new Date());
          th.actTest.userPending = true;
        }
        if (th.makeInterruptionInEx) { //pri vstupu do home bylo jiz v testu cosi vyplneno => doslo k preruseni testu (proved zaznam o preruseni)
          var beg = th.actTest.lastDate(); if (!beg) beg = th.actTest.started;
          th.actTest.interrupts.push({ beg: beg, end: Utils.nowToNum(), ip: Login.myData.IP });
          th.makeInterruptionInEx = false;
          th.actTest.userPending = true;
        }

        if (th.actModule.done) {
          th.greenTitle = CSLocalize('4baea1f87da040baa7431720c340eac2', 'Finish'); th.greenIcon = 'fast-forward';
        } else {
          th.greenTitle = CSLocalize('ae062730194a47a58d7e8b4b04a0e299', 'Continue'); th.greenIcon = 'play';
        }

        var actEx = th.getActEx();
        //un-done, aby se cviceni neukazovalo vyhodnocene
        this.exWasDone = actEx.done;
        actEx.done = false;
        //display ex
        saveProduct(() =>
          CourseMeta.lib.adjustEx(actEx,
            () => CourseMeta.lib.displayEx(actEx, null, actEx => {
              Logger.trace_course('testMe: doUpdate end');
              th.instrTitle(actEx.page.instrTitle);
              th.instrBody(_.map(actEx.page.instrs,(s: string) => { var res = CourseMeta.instructions[s.toLowerCase()]; return res ? res : (_.isEmpty(s) ? "" : "Missing [" + s + "] instruction"); }).join());
              th.startTimer(); //adjustace mereni casu
              //completed(); completed je osetreno v displayEx. Pri completed by knockout hlasil vicenasobny binding.
            })));
      });
    }

    multiTest(): multiTestImpl { return CourseMeta.isType(CourseMeta.actCourseRoot, CourseMeta.runtimeType.multiTest) ? <multiTestImpl>CourseMeta.actCourseRoot : null; }
    multiQuestionnaire(): CourseMeta.exImpl { return <CourseMeta.exImpl>(_.find(this.multiTest().Items, it => CourseMeta.isType(it, CourseMeta.runtimeType.multiQuestionnaire)).Items[0]); }
    multiActTest(): testImpl {
      var mt = this.multiTest();
      var end = '/' + mt.level + '/';
      return <testImpl>(_.find(mt.Items,(dt: testImpl) => Utils.endsWith(dt.url, end)));
    }

    htmlClearing() {
      notify.active(false);
      if (CourseMeta.actExPageControl && CourseMeta.actExPageControl.sndPage) CourseMeta.actExPageControl.sndPage.htmlClearing();
      this.clearTimer();
    }

    startTimer() {
      var th = this;
      if (th.timer) return;
      th.startTime = Utils.nowToNum();
      var saveCounter = 0;
      notify.active(true);
      th.timer = setInterval(() => {
        if (!th.actModule || !th.actTest || savingProduct) return;
        //inicializace casovych informaci modulu
        var initElapsed = th.actModule.elapsed; if (!initElapsed) initElapsed = 0; //udaj z databaze
        var startElapsed = th.modStarts[th.actModule.url]; if (!startElapsed) th.modStarts[th.actModule.url] = startElapsed = Utils.nowToNum() - initElapsed; //udaj pri startu modulu
        //vypocet
        var newElapsed = Utils.nowToNum() - startElapsed; //novy elapsed
        var maxElapsed = (cfg.testGroup_debug ? 2 : th.actModule.minutes) * 60;
        var done = newElapsed >= maxElapsed; if (done) newElapsed = maxElapsed;
        th.actModule.elapsed = newElapsed;
        th.actModule.end = Utils.nowToNum();
        th.actModule.userPending = true;
        if (done) {
          th.clearTimer();
          notify.progressBar(0); notify.remaindSeconds = 0; notify.progressText(CSLocalize('fc80a4f55fcd438c88417436eb8a20ea', 'Time limit for this section has expired!'));

          console.log('testme: before Time limit expired');
          anim.alert().show(CSLocalize('d3e3441ec93045d0afd3e9ff25049570', 'Time limit for this section has expired.'),
            ok => {
              console.log('testme: after Time limit expired');
              this.eval(false);
              th.finishModule();
            },
            () => anim.alert().isCancelVisible(false)
            );
        } else {
          var percent = 100 - 100 * newElapsed / maxElapsed;
          th.notLowTime(percent > 15);
          notify.remaindSeconds = maxElapsed - newElapsed;
          notify.progressBar(percent);
          notify.progressText(Utils.formatTimeSpan(maxElapsed - newElapsed));
          if (saveCounter > 20) { //kazdych 500 * 20 msec se provede save do DB
            saveProduct($.noop);
            saveCounter = 0;
          } else saveCounter++;
        }
      }, 500);
      //}, 500);
    }

    eval(markDone: boolean) {
      var ex = this.getActEx(); if (!ex || !ex.evaluator) return;
      ex.testEvaluate(); delete ex.beg;
      ex.done = markDone || this.exWasDone;
      //if (!ex.testDone && markDone) ex.testDone = true;
      //soucet elapsed vsech cviceni testu
      var exElapsed = 0;
      _.each(this.actTest.Items, m => _.each(m.Items,(ex: CourseMeta.exImpl) => { if (ex.elapsed) exElapsed += ex.elapsed; }));
      //soucet elapsed vsech modulu
      var modElapsed = 0; _.each(this.actTest.Items,(t: testSkillImpl) => modElapsed += t.elapsed);
      //uprav elapsed aktualniho cviceni
      if (modElapsed > exElapsed) ex.elapsed += Math.floor(modElapsed - exElapsed);
      //aktualizuj moduly a test
      CourseMeta.actCourseRoot.refreshNumbers();
    }

    finishModule() {
      Logger.trace_course('testMe: finishModule start');
      this.clearTimer();
      //_.each(this.actModule.Items, (ex: CourseMeta.exImpl) => { if (!ex.done) { ex.s = 0; ex.done = true; ex.userPending = true; } });
      _.each(this.actModule.Items,(ex: CourseMeta.exImpl) => { if (ex.done) return; ex.done = true; ex.userPending = true; });
      CourseMeta.actCourseRoot.refreshNumbers();
      this.actModule.end = Utils.nowToNum(); this.actModule.userPending = true;
      this.findActModule();
      if (this.actModule == null) { //_.all(this.actTest.Items, (m: testSkillImpl) => m.done)) { //vse hotovo
        this.actTest.ms = 0; _.each(this.actTest.Items, it => this.actTest.ms += it.ms);
        saveProduct(() =>
          CourseMeta.lib.actPersistence().createArchive(LMStatus.Cookie.id, CourseMeta.actCompanyId, CourseMeta.actProduct.url, archiveId => {
            //aktualni produkt je na serveru prejmenovan, prejmenuj i na klientovi
            CourseMeta.actProduct.url += '|' + archiveId.toString(); this.productUrl = CourseMeta.actProduct.url;
            this.actTest.createEmptyResult(archiveId); //vytvor test result
            this.actTest.adjustResult(); //vytvor test result
            saveProduct(() => { //save testu i s results
              Login.adjustMyData(true,() => { //aktualizuj my home data
                Logger.trace_course('testMe: finishModule, test end');
                window.location.hash = createUrl(tResult); //jdi na result stranku
              });
            });
          }));
      } else {
        saveProduct(() => {
          Logger.trace_course('testMe: finishModule end');
          Pager.reloadPage();
        });
      }
    }

    findActModule() {
      var th = this;
      CourseMeta.actCourseRoot.refreshNumbers();
      //if (!th.actModule) {
      th.actModule = <testSkillImpl>(_.find(th.actTest.Items,(it: CourseMeta.courseNode) => !it.done));
      if (!th.actModule) { th.actTest.done = true; return; }
      if (!th.actModule.beg) th.actModule.beg = Utils.nowToNum();
      th.actIdx = 0;
    }

    doGreenClick() {
      if (this.testDisabled()) return;
      if (this.isHome) { this.isHome = false; Pager.reloadPage(); }
      else if (this.isPretest) {
        var multiEx = this.multiQuestionnaire();
        //var selected: { [grpId: string]: string; } = {};
        var levToScore: { [lev: string]: number; } = { 'a1': 1, 'a2': 2, 'b1': 3, 'b2': 4, 'c1': 5, 'c2': 6 };
        var numToLev: Array<string> = ['a1', 'a2', 'b1', 'b2', 'c1', 'c2'];
        var levComplBoundary = [6, 10, 14, 18, 22, 24];
        var levStdBoundary = [3, 5, 7, 9, 11, 12];
        var score = 0; var isAll = true; var singleSels = multiEx.page.evalPage.Items[0].Items;
        _.each(singleSels, grp => { //<_eval-group id="and-screading" eval-control-ids="ra1 ra2 rb1 rb2 rc1 rc2" is-and="true"/>
          var ctrl = <Course.radioButton>(_.find(grp.evalControls,(r: Course.radioButton) => r.selected()));
          //selected[grp.id.substr(6)] = ctrl ? ctrl.id.substr(ctrl.id.length-2) : null;
          if (!ctrl) isAll = false; else score += levToScore[ctrl.id.substr(ctrl.id.length - 2)];
        });
        if (!isAll) {
          anim.alert().show(CSLocalize('5ae8d0cbcd5e44b68843f2010ec215b7', 'Fill in all parts of the self-evaluation form'), $.noop,() => anim.alert().isCancelVisible(false));
          return;
        }
        var boundaries = singleSels.length == 4 ? levComplBoundary : levStdBoundary; //aktualni hranice pro skore
        var multiTest = this.multiTest();
        for (var i = 0; i < boundaries.length; i++) if (score <= boundaries[i]) { multiTest.level = numToLev[i]; break; }
        anim.alert().show(CSLocalize('8f8d748c9209489b8710fa30b10905d3', 'The following test will be started now') + ':<p class="text-info"><b>' + this.multiActTest().title + '</b></p>',() => {
          multiTest.userPending = true;
          this.isPretest = false;
          this.isHome = true;
          Pager.blockGui(true);
          saveProduct(Pager.reloadPage);
        },() => anim.alert().isCancelVisible(false));
      }
      else if (this.isResult) { debugger; throw 'this.isResult'; }
      else {
        if (!this.actModule) throw '!this.actModule';
        this.eval(true); //vyhodnot cviceni

        if (this.actModule.done) { //modul jiz ukoncen
          anim.alert().show(this.finishText(), ok => {
            console.log('testme: in finish');
            if (ok === true) {
              Pager.blockGui(true); setTimeout(() => this.finishModule(), 1);
            } else if (ok === false) {
              this.greenStatus = greenDone; //jeste kontroluj cviceni
              Pager.blockGui(true);
              this.actIdx++; if (this.actIdx >= this.actModule.Items.length) this.actIdx = 0; //dalsi cviceni
              saveProduct(Pager.reloadPage);
            }
          });
        } else {
          Pager.blockGui(true);
          this.actIdx++; if (this.actIdx >= this.actModule.Items.length) this.actIdx = 0; //dalsi cviceni
          saveProduct(Pager.reloadPage);
        }

        //if (this.actModule.done) { //modul jiz ukoncen
        //  if (confirm(this.finishText())) { Pager.blockGui(true); setTimeout(() => this.finishModule(), 1); return; } //=> jdi na dalsi modul
        //  this.greenStatus = greenDone; //jeste kontroluj cviceni
        //}
        //Pager.blockGui(true);
        //this.actIdx++; if (this.actIdx >= this.actModule.Items.length) this.actIdx = 0; //dalsi cviceni
        //saveProduct(Pager.reloadPage);
      }
    }

    //actModuleDone(): boolean { return this.actModule && _.all(this.actModule.Items, (e: CourseMeta.exImpl) => e.done); }

    doSkipClick() {
      Pager.blockGui(true);
      this.eval(false);
      this.actIdx++; if (this.actIdx >= this.actModule.Items.length) this.actIdx = 0; //dalsi cviceni
      saveProduct(Pager.reloadPage);
    }
    doExClick(newIdx: number) {
      Pager.blockGui(true);
      this.eval(false);
      this.actIdx = newIdx;
      saveProduct(Pager.reloadPage);
    }
    doFinishClick() {
      this.eval(false); //vyhodnot cviceni

      console.log('testme: before force finish');

      anim.alert().show(this.finishText(), ok => {
        console.log('testme: in force finish');
        if (!ok) return;
        console.log('testme: in force finish ok');
        Pager.blockGui(true);
        setTimeout(() => this.finishModule(), 1);
      });

      //if (!confirm(this.finishText())) return;
      //Pager.blockGui(true);
      //setTimeout(() => this.finishModule(), 1);
    }

    finishText() { return '<p class="text-info"><b>' + CSLocalize('883fd55fbeb14d3a9461ffc130bfb6fa', 'Finishing of the section') + '</b></p>' + CSLocalize('8705c1b208864ed1aba65ab1697bb816', 'Do you really want to finish this section?') + '<br/>' + CSLocalize('92e75ac9aeb44296878c7bcff2ecc030', 'After that you will not be allowed to check and correct your answers.'); }
    static skillText(skill: string): string {
      switch (skill) {
        case testMe.Skills.UseLanguage: return CSLocalize('eaddb5e3f7be4215abc0174d0e5b25e8', 'Grammar and  Vocabulary');
        case testMe.Skills.Reading: return CSLocalize('74cebd49d27c458cb7393fdc3efa5131', 'Reading');
        case testMe.Skills.Speaking: return CSLocalize('55989a271c5e490d8323792e5be89ac6', 'Speaking');
        case testMe.Skills.Listening: return CSLocalize('701d44c0f6e648b4ba6c20a98d3a2a8e', 'Listening');
        case testMe.Skills.Writing: return CSLocalize('8e2f5a7271a6408884371e33fd5ed593', 'Writing');
        default: return skill;
      }
    }

    createSkillsModel(): void {
      if (this.isResult) { debugger; throw 'this.isResult'; }
      var res: Array<SkillItemLabel> = [];
      res.push({ title: CSLocalize('02bea28a09a847cca2488a6791e87e2a', 'Introduction'), active: this.isHome ? 'active' : '' });
      _.each(<any>(this.actTest.Items),(it: CourseMeta.taskTestSkill) => res.push({ title: Model.skillText(it.skill), active: !this.isHome && this.actModule == it ? 'active' : '' }));
      res.push({ title: CSLocalize('ba059f7aff4a4a2f965ffb17656b0e60', 'Results'), active: '' });
      //res.push({ title: 'Vysledky', active: this.isResult ? 'active' : '' });
      this.skills = res;
      var act = _.find(res, r => r.active != '');
      notify.skillText(/*this.skillSmall =*/ act.title);
      this.skillSmallStatus = act == res[0] ? 0 : (act == res[res.length - 1] ? 2 : 1);
    }
    clearTimer() { if (!this.timer) return; clearInterval(this.timer); this.timer = null; }
    getActEx(): CourseMeta.exImpl { return this.actModule && this.actModule.Items[this.actIdx] ? <CourseMeta.exImpl>(this.actModule.Items[this.actIdx]) : null; }
  }

  export class SkillItemLabel { title: string; active: string; } //model pro prehled skills v navbaru

  function saveProduct(completed: () => void) {
    savingProduct = true;
    CourseMeta.lib.saveProduct(() => { savingProduct = false; completed(); });
  }
  var savingProduct;
  //Bezpecne save produktu: pokud je nejake jine save rozbehnute, pozdrzi se az do dobehnuti posledniho.
  //http://jsfiddle.net/L5nud/111/
  function saveProduct_(completed: () => void) {
    Logger.trace_course('saveProduct: testMe start');
    promise = promise.then(saveProductLow(() => { Logger.trace_course('saveProduct: testMe end'); completed(); })); //zarad dalsi pozadavek na konec nedokoncenych pozadavku
  }
  function saveProductLow(completed: () => void) {
    var deferred = $.Deferred();
    CourseMeta.lib.saveProduct(deferred.resolve);
    return () => deferred.promise().then(completed);
  }
  var promise: JQueryPromise<any> = $.when($.noop);

  export class multiTestImpl extends CourseMeta.courseNode implements multiUserData, CourseMeta.data {
    level: string;
    //persistence
    setUserData(data: multiUserData): void {
      if (!data) { //muze nastat?
        data = { level: null };
        this.userPending = true;
      }
      this.level = data.level;
    }
    getUserData(setData: (short: string, long: string, flag: CourseModel.CourseDataFlag, key: string) => void): void {
      var dt: multiUserData = { level: this.level };
      setData(JSON.stringify(dt), null, CourseModel.CourseDataFlag.multiTestImpl, null);
    }
  }

  export class testImpl extends CourseMeta.courseNode implements userData, CourseMeta.test {

    constructor() {
      super();
      this.ip = Login.myData.IP;
      this.interrupts = null;
    }

    doReset() {
      _.each(this.Items,(it: testSkillImpl) => it.doReset());
      this.interrupts = null; this.ip = Login.myData.IP; this.done = false;
    }

    //userData (short)
    started: number;
    interrupts: Array<interrupt>;
    ip: string;
    //long user data
    result: result;
    //CourseMeta.test
    demoTestUrl: string;
    level: string;
    needs: CourseMeta.testNeeds;
    isDemoTest: boolean;


    lastDate(): number { var max = 0; _.each(this.Items,(it: testSkillImpl) => max = Math.max(max, it.end)); return max; }

    createEmptyResult(id: number) {
      this.result = {
        domain: Pager.basicDir.substr(Pager.basicDir.lastIndexOf('//') + 2),
        id: id,
        firstName: LMStatus.Cookie.FirstName,
        lastName: LMStatus.Cookie.LastName,
        eMail: LMStatus.Cookie.EMail ? LMStatus.Cookie.EMail : LMStatus.Cookie.LoginEMail,
        title: testTitle(this),
        ip: this.ip,
        interrupts: this.interrupts,
        skills: _.map(this.Items,(sk: testSkillImpl) => {
          //posledi 3 polozku se aktualizuji az v adjustResult (adjustResult se vola jednouna konci testu a opakovan pri humanEval)
          var res: skillResult = { title: sk.title, skill: sk.skill, elapsed: sk.elapsed, finished: sk.end, started: sk.beg, ms: sk.ms, s: 0, flag: 0, scoreWeight: 0 };
          return res;
        }),
        company: _.find(Login.myData.Companies, c => c.Id == CourseMeta.actCompanyId).Title,
        score: 0,
        flag: 0,
        //score: 0,
        productUrl: CourseMeta.actProduct.url,
        lmcomId: schools.LMComUserId(),
        companyId: CourseMeta.actCompanyId,
        level: this.level
      };
    }

    adjustResult() {
      //aktualni flag a skore (protoze adjustResult se vola jek na konci testu tak i po human eval testu)
      this.result.flag = 0;
      _.each(this.Items,(sk: testSkillImpl) => {
        var skResult = _.find(this.result.skills, s => s.skill == sk.skill);
        skResult.flag = sk.flag; skResult.s = sk.s; skResult.scoreWeight = sk.scoreWeight;
        this.result.flag |= sk.flag;
      });

      //score weights
      var wsum = 0, wcnt = 0;
      _.each(this.result.skills, sk => { if (!sk.scoreWeight) return; wsum += sk.scoreWeight; wcnt++; });
      if (wsum > 100) { debugger; throw 'wsum > 100'; }
      var wempty = (100 - wsum) / (this.Items.length - wcnt); //pocet procent pro undefined scoreWeight
      //dosad weights, aby jejich soucet byl 100
      var wintSum = 0; _.each(this.result.skills,(sk: skillResult) => wintSum += sk.scoreWeight = Math.round(sk.scoreWeight ? sk.scoreWeight : wempty));
      if (wintSum > 100 || wintSum < 98) { debugger; throw 'wintSum > 100 || wintSum < 98'; } // neco je spatne
      if (wintSum < 100) this.result.skills[0].scoreWeight += 100 - wintSum;

      if (!Course.needsHumanEval(this.result.flag)) {
        //vazeny prumer
        var ssum = 0; _.each(this.result.skills,(sk: skillResult) => ssum += Course.scorePercent(sk) * sk.scoreWeight);
        this.result.score = Math.round(ssum / 100);
      }

      this.userPending = true;
    }

    //persistence
    setUserData(data: userData): void {
      if (!data) { //muze nastat?
        data = { interrupts: null, ip: Login.myData.IP, started: Utils.dateToNum(new Date()) };
        this.userPending = true;
      }
      this.started = data.started; this.ip = data.ip; this.interrupts = data.interrupts;
    }
    getUserData(setData: (short: string, long: string, flag: CourseModel.CourseDataFlag, key: string) => void): void {
      var dt: userData = { interrupts: this.interrupts, ip: Login.myData.IP, started: this.started };
      setData(JSON.stringify(dt), null, this.flag | CourseModel.CourseDataFlag.testImpl, null);
      if (this.result) setData(null, JSON.stringify(this.result), this.flag | CourseModel.CourseDataFlag.testImpl_result, testImpl.resultKey);
    }
    static resultKey = 'result';
    expandDynamicAll(): boolean {
      var res = false;
      CourseMeta.scan(this,(nd: testMe.testSkillImpl) => {
        if (!CourseMeta.isType(nd, CourseMeta.runtimeType.taskTestSkill)) return;
        if (nd.expandDynamic()) res = true;
        //prevzeti informaci z dynamicModuleData
        //var dynData: CourseMeta.dynamicModuleData = <CourseMeta.dynamicModuleData><any>(nd.oldItems[0]);
        //nd.minutes = dynData.minutes ? dynData.minutes : 0; nd.skill = dynData.skill ? dynData.skill : 0; nd.scoreWeight = dynData.scoreWeight ? dynData.scoreWeight : 0;
      });
      return res;
    }
  }

  export class testSkillImpl extends CourseMeta.modImpl implements CourseMeta.taskTestSkill {

    constructor() {
      super();
      this.beg = this.end = this.elapsed = 0;
    }

    //sitemap taskTestSkill data
    skill: string;
    minutes: number;
    scoreWeight: number;

    //user data
    beg: number;
    end: number;
    elapsed: number;

    refreshNumbers(exCountOnly: boolean = false) {
      var th = this
      th.exCount = th.Items.length;
      th.s = th.flag = 0; th.done = true;
      _.each(th.Items,(it: CourseMeta.exImpl) => { it.refreshNumbers(); it.complNotPassiveCnt = 1; if (!it.s) it.s = 0; th.s += it.s; th.done = th.done && it.done; th.flag |= it.flag; });
      th.complPassiveCnt = 0; th.complNotPassiveCnt = th.Items.length;
    }

    setUserData(data: skillUserData): void {
      super.setUserData(data.modUrls);
      this.beg = data.started; this.end = data.finished; this.elapsed = data.elapsed;
    }
    getUserData(setData: (short: string, long: string, flag: CourseModel.CourseDataFlag, key: string) => void): void {
      var data: skillUserData = { modUrls: _.map(this.Items, it => it.url), started: this.beg, finished: this.end, elapsed: this.elapsed };
      setData(JSON.stringify(data), null, this.flag | CourseModel.CourseDataFlag.testSkillImpl, null);
    }
  }

  export function createUrlPersist(type: string, companyId: number, productUrl: string, persistence: string): string {
    return [appId, type, companyId.toString(), productUrl, persistence].join('@');
  }
  export function createUrlCompl(type: string, companyId: number, productUrl: string): string {
    return createUrlPersist(type, companyId, productUrl, CourseMeta.actProductPersistence);
  }
  export function createUrl(type: string = null, companyId: number = 0, productUrl: string = null): string {
    return createUrlCompl(type ? type : tEx, companyId ? companyId : CourseMeta.actCompanyId, productUrl ? productUrl : CourseMeta.actProduct.url);
    //return [appId, type ? type : tEx, companyId ? companyId : CourseMeta.actCompanyId, productUrl ? productUrl : CourseMeta.actProduct.url].join('@');
  }

  Pager.registerAppLocator(appId, tEx,(urlParts, completed) => completed(new Model(urlParts)));
}

