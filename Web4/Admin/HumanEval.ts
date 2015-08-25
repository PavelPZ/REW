module schoolAdmin {

  //*************************************************************
  //  home stranka hodnotitele - vyber testu k evaluaci
  //*************************************************************
  export class HumanEval extends CompModel {
    constructor(urlParts: string[]) {
      super(humanEvalTypeName, urlParts);
    }

    // UPDATE
    update(completed: () => void): void {
      Pager.ajaxGet(
        Pager.pathType.restServices,
        Login.CmdHumanEvalGet_Type,
        Login.CmdHumanEvalGet_Create(LMStatus.Cookie.id, this.CompanyId),
        (res: Login.CmdHumanEvalGetResult) => {
          this.data = res;
          this.items = _.sortBy(_.map(res.todo, td => new HumanEvalCrs(td, this)), it => it.assigned);
          completed();
        });
    }

    items: Array<HumanEvalCrs>;
    data: Login.CmdHumanEvalGetResult;

    close() {
      location.hash = schools.createHomeUrlStd();
    }

  }

  export class HumanEvalCrs {
    constructor(public data: Login.HumanEvalGetResultItem, public owner: HumanEval) {
      this.title = CourseMeta.lib.findProduct(data.productId.split('|')[0]).title;
      this.assigned = Globalize.format(Utils.numToDate(data.assigned), 'd');
    }
    title: string;
    assigned: string;
    click() {
      location.hash = schoolAdmin.getHash(schoolAdmin.humanEvalExTypeName, this.owner.CompanyId) + hashDelim + this.owner.data.companyUserId.toString() + hashDelim + this.data.courseUserId.toString() + hashDelim + this.data.productId;
    }
  }

  //*************************************************************
  //  cviceni jednoho testu k evaluaci
  //*************************************************************
  export class HumanEvalEx extends CompModel {
    constructor(urlParts: string[]) {
      super(humanEvalExTypeName, urlParts);
      this.companyUserId = parseInt(urlParts[1]);
      this.courseUserId = parseInt(urlParts[2]);
      this.productId = urlParts[3];
      this.productTitle = CourseMeta.lib.findProduct(this.productId.split('|')[0]).title;
    }
    productId: string;
    companyUserId: number;
    courseUserId: number;
    testUser_lmcomId: number;
    actIdx: number;
    items: Array<humanEx>;
    productTitle:string;

    update(completed: () => void): void {
      if (this.items) this.initEx(completed);
      else this.init(() => this.initEx(completed));
    }
    // UPDATE
    init(completed: () => void): void {
      Pager.ajaxGet(
        Pager.pathType.restServices,
        Login.CmdHumanEvalTest_Type,
        Login.CmdHumanEvalTest_Create(this.companyUserId, this.courseUserId),
        (res: Login.CmdHumanEvalTestResult) => {
          this.testUser_lmcomId = res.testUser_lmcomId;
          CourseMeta.lib.adjustProduct(this.productId, null, justLoaded => {
            this.items = [];
            _.each(res.urls, r => {
              var ex = <CourseMeta.exImpl>(CourseMeta.actProduct.getNode(r)); //if (ex.s == 0 || (ex.flag & CourseModel.CourseDataFlag.needsEval) == 0) return;
              this.items.push(new humanEx(ex));
            });
            this.actIdx = 0;
            completed();
          }, this.testUser_lmcomId);
        });
    }

    initEx(completed: () => void) {
      if (this.items.length == 0) { this.greenTitle(CSLocalize('8817520256884045b0e94bcb005f02d0', 'Finish')); completed(); return; }
      this.greenTitle(this.isFinished() ? CSLocalize('9c834aec8bd94de284855521356f2fbd', 'Finish') : CSLocalize('232eaf4801724f4e9dc69ce12091c26d', 'Next'));
      var actEx = this.items[this.actIdx].ex;
      CourseMeta.lib.adjustEx(actEx,() => {
        actEx.page.humanEvalMode = true;
        CourseMeta.lib.displayEx(actEx, null, null);
      }, this.testUser_lmcomId);
    }
    finishEx(completed: (ok: boolean) => void) {
      if (this.items.length == 0) { completed(false); return; }
      var actEx = this.items[this.actIdx];
      if (Course.humanEvalControlImpl.useEvalForms(actEx.ex) != true) { completed(false); return; } //validator error => exit
      Pager.blockGui(true);
      actEx.done(true);
      //donut save Skills, Testu a Test.result
      var skill: testMe.testSkillImpl = <testMe.testSkillImpl>actEx.ex.parent; skill.userPending = true;
      var test: testMe.testImpl = <testMe.testImpl>skill.parent; test.userPending = true;
      //procedura pro modifikaci test.result (zmeni flag a skore jak skills tak testu)
      var processTestResult = () => {
        test.adjustResult();
        CourseMeta.lib.saveProduct(() => { completed(true); Pager.blockGui(false); }, this.testUser_lmcomId);
      };
      //volej processTestResult (ev. nejdrive nacti test.result z DB)
      if (!test.result)
        CourseMeta.lib.actPersistence().loadUserData(this.testUser_lmcomId, CourseMeta.actCompanyId, CourseMeta.actProduct.url, testMe.testImpl.resultKey,(data: testMe.result) => { test.result = data; processTestResult(); });
      else
        processTestResult();
    }

    doExClick(idx: number) {
      if (this.items.length == 0) return;
      this.finishEx(ok => { if (!ok) return; this.actIdx = idx; Pager.reloadPage(); });
    }
    nextClick() {
      if (this.isFinished()) { location.hash = schoolAdmin.getHash(schoolAdmin.humanEvalTypeName, this.CompanyId); return; }
      this.finishEx(ok => { if (!ok) return; this.actIdx++; if (this.actIdx >= this.items.length) this.actIdx = 0; Pager.reloadPage(); });
    }

    //close() {
    //  this.finishEx(() => location.hash = schoolAdmin.getHash(schoolAdmin.humanEvalTypeName, this.CompanyId));
    //}
    isFinished():boolean {
      return this.items.length == 0 || _.all(this.items, it => !Course.needsHumanEval(it.ex.flag));
    }

    greenTitle = ko.observable(CSLocalize('be62382f71e84e96a1837a8a5c565f66', 'Next'));

  }

  export class humanEx {
    constructor(public ex: CourseMeta.exImpl) { }//this.needsEval((ex.flag & CourseModel.CourseDataFlag.needsEval) != 0); }
    done = ko.observable(false);
  }

  //Pager.registerAppLocator(appId, humanEvalTypeName,(urlParts, completed) => completed(new HumanEval(urlParts)));
  //Pager.registerAppLocator(appId, humanEvalExTypeName,(urlParts, completed) => completed(new HumanEvalEx(urlParts)));

  blended.oldLocators.push($stateProvider => blended.registerOldLocator($stateProvider, humanEvalTypeName, appId, humanEvalTypeName, 1, urlParts => new HumanEval(urlParts)));
  blended.oldLocators.push($stateProvider => blended.registerOldLocator($stateProvider, humanEvalExTypeName, appId, humanEvalExTypeName, 1, urlParts => new HumanEvalEx(urlParts)));
}

