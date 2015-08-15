module testMe {

  export class ResultLow extends schools.Model {
    breadcrumbs(): schools.ILink[] { return this.br; }
    br: schools.ILink[] = [{ title: schools.homeTitle(), iconId: () => 'home', url: '' }];
  }

  export class Result extends ResultLow {

    constructor(urlParts: string[]) {
      super(tResult, urlParts);
      this.appId = appId;
    }
    doUpdate(completed: () => void): void {
      var th = this;
      CourseMeta.lib.actPersistence().loadUserData(schools.LMComUserId(), CourseMeta.actCompanyId, th.productUrl, testImpl.resultKey,(data: resultImpl) => {
        extendResult(data);
        th.data = data;
        th.br.pushArray([
          { title: th.data.title, iconId: () => 'folder-open', url: createUrlCompl(tResults, CourseMeta.actCompanyId, th.productUrl.split('|')[0]) },
          { title: th.data.subTitleShort(), iconId: () => 'puzzle-piece', url: '' }
        ]);
        completed();
      });
    }
    data: resultImpl;

    downloadCert() {
      Pager.ajax_download(
        Pager.path(Pager.pathType.restServices),
        persistNewEA.createCmd<scorm.Cmd_testCert>(schools.LMComUserId(), CourseMeta.actCompanyId, this.productUrl, cmd => cmd.loc = Trados.actLang),
        scorm.Cmd_testCert_Type);
    }

    //LMNEW
    //uploadSuggestions() {
    //  Pager.ajaxGet(
    //    Pager.pathType.restServices,
    //    testMe.CmdSkrivanekSuggests_Type,
    //    testMe.CmdSkrivanekSuggests_Create(this.data.id, <string>($('#suggestion').val())),
    //    () => alert('Děkujeme za zaslání.'));
    //}

  }

  export class Results extends ResultLow {

    constructor(urlParts: string[]) {
      super(tResults, urlParts);
      this.appId = appId;
    }
    doUpdate(completed: () => void): void {
      var th = this;
      CourseMeta.lib.actPersistence().testResults(schools.LMComUserId(), CourseMeta.actCompanyId, th.productUrl, data => {
        _.each(data, r => extendResult(r));
        th.tests = <Array<resultImpl>>data; var cnt = 0; _.each(th.tests, t => t.idx = cnt++);
        th.barTitle = th.tests[0].title;
        th.br.pushArray([
          { title: th.barTitle, iconId: () => 'folder-open', url: '' }
        ]);
        th.gotoTest = idx => window.location.hash = createUrlCompl(tResult, CourseMeta.actCompanyId, th.productUrl + '|' + th.tests[idx].id.toString());
        completed();
      });
    }
    barTitle: string;
    tests: Array<resultImpl>;
    gotoTest: (idx: number) => void;
  }

  function extendResult(r: result) {
    Utils.extendObject(r, [resultImpl]);
    _.each(r.skills,(s: skillResultImpl) => Utils.extendObject(s, [skillResultImpl]));
  }

  export class resultImpl implements result {

    idx: number; //self idx v Results.tests. Pro prdadni do data-bind.click v html.

    started(): Date { return Utils.numToDate(_.min(this.skills, sk => sk.started).started); }
    finished(): Date { return Utils.numToDate(_.max(this.skills, sk => sk.started).finished); }
    elapsed(): number { var res = 0; _.each(this.skills, sk => res += sk.elapsed); return res; }
    dateTxt() { return resultImpl.dateTxtProc(this.started(), this.finished()); }
    static dateTxtProc(stDt: Date, finDt: Date) {
      var stD = Globalize.format(stDt, 'd'); var stT = Globalize.format(stDt, 'H:mm:ss');
      var finD = Globalize.format(finDt, 'd'); var finT = Globalize.format(finDt, 'H:mm:ss');
      var dtSame = stDt.setHours(0, 0, 0, 0) == finDt.setHours(0, 0, 0, 0);
      return dtSame ? stD + ' (' + stT + ' - ' + finT + ')' : stD + ' ' + stT + ' - ' + finD + ' ' + finT;
    }
    elapsedTxt() { return Utils.formatTimeSpan(this.elapsed()); }
    interruptsTxt() {
      if (!this.interrupts || this.interrupts.length == 0) return '0';
      var len = 0; _.each(this.interrupts, it => len += it.end - it.beg);
      return this.interrupts.length.toString() + 'x, ' + CSLocalize('ee6f54e31d3c4743883b7bf5175867a8', 'duration') + ' ' + Utils.formatTimeSpan(len);
    }
    ipsTxt() {
      var ips = _.map(this.interrupts, it => it.ip); ips.push(this.ip); ips = _.uniq(ips);
      var huge = ips.length > 2; ips = ips.slice(0, 2); var res = ips.join(', ');
      return huge ? res + ',...' : res;
    }
    subTitleShort() { return Globalize.format(this.started(), 'd'); }
    subTitleLong() { return this.title + ': ' + Globalize.format(this.started(), 'd'); }
    //************ interruprions a IP address
    hasIntIpData(): boolean { return this.interrupts && this.interrupts.length > 0; }
    adjustIntIpData(): Array<Array<string>> {
      if (this.intIpData) return this.intIpData;
      var res = []; var temp: Date;
      _.each(this.interrupts, it => res.push([
        Globalize.format(temp = Utils.numToDate(it.beg), 'd') + ', ' + Globalize.format(temp = Utils.numToDate(it.beg), 'H:mm:ss'),
        Globalize.format(temp = Utils.numToDate(it.end), 'd') + ', ' + Globalize.format(temp = Utils.numToDate(it.end), 'H:mm:ss'),
        Utils.formatTimeSpan(it.end - it.beg),
        it.ip
      ]));
      return res;
    } intIpData: Array<Array<string>>;

    adjustIpData(): Array<string> {
      if (this.ipData) return this.ipData;
      var res = _.uniq(_.map(this.interrupts, it => it.ip)); res.push(this.ip); res = _.uniq(res);
      return res;
    } ipData: Array<string>;

    waitForHuman(): boolean { return Course.needsHumanEval(this.flag); }

    //result
    domain: string;
    id: number;
    title: string;
    company: string;
    firstName: string;
    lastName: string;
    eMail: string;
    skills: Array<skillResultImpl>;
    ip: string;
    interrupts: Array<interrupt>;
    score: number;
    //ms: number; s: number;
    flag: CourseModel.CourseDataFlag;
    companyId: number;
    productUrl: string;
    lmcomId: number;
    level: string;
  }

  export class skillResultImpl implements skillResult {

    dateTxt() { return resultImpl.dateTxtProc(Utils.numToDate(this.started), Utils.numToDate(this.finished)); }
    elapsedTxt() { return Utils.formatTimeSpan(this.elapsed); }

    skillText() { return Model.skillText(this.skill); }

    waitForHuman(): boolean { return Course.needsHumanEval(this.flag); }

    //skillResult
    skill: string;
    title: string;
    ms: number; s: number; flag: CourseModel.CourseDataFlag;
    score(): number { return Course.scorePercent(this); }
    scoreWeight: number;
    started: number;
    finished: number;
    elapsed: number;
  }

  //Pager.registerAppLocator(appId, tResult,(urlParts, completed) => completed(new Result(urlParts)));
  //Pager.registerAppLocator(appId, tResults, (urlParts, completed) => completed(new Results(urlParts)));

  blended.oldLocators.push($stateProvider => blended.registerOldLocator($stateProvider, tResult, appId, tResult, 4, urlParts => new Result(urlParts)));
  blended.oldLocators.push($stateProvider => blended.registerOldLocator($stateProvider, tResults, appId, tResults, 4, urlParts => new Results(urlParts)));

}

