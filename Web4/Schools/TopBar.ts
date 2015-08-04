module schools {

  export class TopBarModel {
    constructor(public model: Pager.Page) {
      var self = this;
      this.grammarClick = () => CourseMeta.gui.gotoData(CourseMeta.actGrammar); 
      if (this.needsLogin()) LMStatus.setReturnUrl();
    }
    is(...typeNames: string[]): boolean { return _.find(typeNames, (t: string) => t == this.model.type) != null; }

    //title
    isTitle(): boolean { return this.is(tTest); }
    title = ko.observable<string>('');
    //logo
    logoBig(): boolean { return !this.logoSmall() && !this.is(tEx); }//this.is(tMy); }
    logoSmall(): boolean { return this.is(tCourseMeta, tCoursePretest, /*tHome, tCourse, tLess, tMod, tCpv,*/ tGrammFolder, tGrammPage, tGrammContent, tDictInfo, tTest); }

    greenArrow(): boolean { return !this.needsLogin() && this.is(tCourseMeta, tCoursePretest, tEx); }

    phoneMore(): string { return !this.needsLogin() && this.is(tMy/*, tHome*/) ? "#collapse-logout" : null; } //pokud je phone, id DIVu s more informaci, #collapse-more nebo #collapse-more-ex

    //login x logout x profile
    logoutAndProfile(): boolean { return this.isWeb() && !this.needsLogin() && this.is(tMy/*, /*, tHome*/); }
    needsLogin(): boolean { return this.isWeb() && !LMStatus.isLogged(); }
    loginUrl(): string {
      if (!this.needsLogin()) return null;
      if (cfg.logins && cfg.logins.length == 1)
        switch (cfg.logins[0]) {
          case LMComLib.OtherType.LANGMaster: return "#" + Login.getHash(Login.pageLmLogin);
          case LMComLib.OtherType.LANGMasterNoEMail: return "#" + Login.getHash(Login.pageLmLoginNoEMail);
          default: return "#" + Login.getHash(Login.pageLogin);
        }
      else
        return "#" + Login.getHash(Login.pageLogin);
    }
    isWeb(): boolean { return cfg.target == LMComLib.Targets.web; }

    //supplements
    hasSupl(): boolean { return true; }
    suplCtxtGrammar = ko.observable<boolean>(false); //meni cviceni: phone - dynamicka podminka na kontextovou gramatiku
    suplGrammarIcon = ko.observable<boolean>(true); //meni cviceni: phone - dynamicka podminka na nekontextovou gramatiku
    exerciseEvaluated = ko.observable<boolean>(false); //cviceni je vyhodnocenu
    score = ko.observable<string>(null); //score vyhodnoceneho cviceni
    //suplGrammarLink(): boolean { return !this.needsLogin() && this.is(tCourseMeta, tCourse, tLess, tMod, tEx) && schools.data.crsStatic2.grammar != null; } //pro ne-phone: staticka podminka na nekontextovou gramatika
    suplGrammarLink(): boolean { return !this.needsLogin() && this.is(tCourseMeta, /*tCourse, tLess, tMod,*/ tEx) && CourseMeta.actGrammar != null; } //pro ne-phone: staticka podminka na nekontextovou gramatika
    suplDict(): boolean { return !this.needsLogin() && this.is(tEx, tGrammPage) && DictConnector.actDictData != null; /*cfg.dictType!=schools.dictTypes.no;*/ } //pomocna stranka s vysvetlenim slovniku
    suplEval(): boolean { return !this.needsLogin() && this.is(tEx); } //informace o vyhodnocenem cviceni
    resetClick(): void { CourseMeta.actEx.reset(); } //??(<schoolEx.Model>(Pager.ActPage)).reset(); }
    dictClick(): void { LMStatus.setReturnUrlAndGoto(schools.createDictIntroUrl()); }
    grammarClick: () => void;
    suplInstr(): boolean { return !this.needsLogin() && this.is(tEx); }
    suplVocabulary(): boolean {
      return false;
      //if (!cfg.vocabulary || !this.is(tLess, tMod, tEx)) return false;
      //var lesJson = this.model.myLessonjsonId(); if (lesJson == null) return false;
      //var id = prods.rewLessonId(lesJson); if (id == 0) return false;
      //return true;
    }
    vocabularyClick(): void { alert("vocabularyClick"); }

    suplBreadcrumb(): boolean { return !this.needsLogin() && this.is(tEx) }

    //navrat do kurzu pro supplements
    backToCourse(): boolean { return this.is(/*tCpv,*/ tDictInfo, tGrammFolder, tGrammPage, tGrammContent, (typeof schoolAdmin == 'undefined' ? '' : schoolAdmin.schoolUserResultsTypeName)) && LMStatus.isReturnUrl(); }
    backToCourseClick(): void { LMStatus.gotoReturnUrl(); }//Pager.navigateTo(getReturnUrl()); }

  }

}


