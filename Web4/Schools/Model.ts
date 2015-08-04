module schools {

  export var tMy = "schoolMyModel".toLowerCase();
  export var tCourseMeta = "schoolCourseMetaModel".toLowerCase();
  export var tCoursePretest = "schoolCoursePretestModel".toLowerCase();
  export var tExCpv: string = "cpv_exercise";
  export var tDictCpv: string = "cpv_dict";
  export var tMediaCpv: string = "cpv_media";
  export var tEx: string = "schoolExModel".toLowerCase();
  export var tGrammFolder = "schoolGrammModel".toLowerCase();
  export var tGrammPage = "schoolGrammPageModel".toLowerCase();
  export var tGrammContent = "schoolGrammContentModel".toLowerCase();
  export var tDictInfo = "schoolDictInfoModel".toLowerCase();
  export var tTest: string = "schoolTestModel".toLowerCase();

  export var memoryPersistId = 'memory';

  export function getHash(type: string, companyId: number, productUrl: string, persistence: string, url: string): string {
    return [appId, type, companyId.toString(), productUrl, persistence, url].join('@');
  }

  export function InitModel(compl: () => void): void {
    Logger.traceMsg('Model.InitModel');

    var completed = () => {
      Logger.traceMsg('Model.InitModel completed');
      boot.minInit();
      //$('body').addClass(Trados.actLangCode);
      //if (cfg.designId) $('body').addClass("design-" + cfg.designId);
      //if (Trados.isRtl) $('body').addClass("rtl-able");
      compl();
    };

    var initHash = hash => { Pager.initHash = () => _.isEmpty(cfg.hash) ? hash : cfg.hash; };
    switch (cfg.target) {
      case LMComLib.Targets.author:
        CourseMeta.persist = persistMemory.persistCourse;
        //var search = LowUtils.parseQuery(location.search);
        //CourseMeta.forceEval = search != null && search["forceeval"] == "true";
        Trados.adjustLoc(() => {
          var cook = LMComLib.LMCookieJS_Create(scormCompanyId, 0, null, "id", null, LMComLib.OtherType.Moodle, "id", "firstName", "lastName", '', 0, 0, null);
          LMStatus.setCookie(cook, false);
          LMStatus.Cookie = cook;
          initHash(getHash(tCourseMeta, scormCompanyId, cfg.rootProductId, null, null));
          completed();
        });
        break;
      case LMComLib.Targets.scorm:
        switch (cfg.persistType) {
          case persistTypes.persistScormEx: //scorm persistence napr. pro Skoda auto
            CourseMeta.persist = persistScormEx.persistCourse;
            Trados.adjustLoc(() => {
              scorm.init((compHost, id, firstName, lastName, isFirstEnter) => { //zjisti info z moodle
                var cook = LMComLib.LMCookieJS_Create(scormCompanyId, 0, null, id, null, LMComLib.OtherType.Moodle, id, firstName, lastName, '', 0, 0, null);
                LMStatus.setCookie(cook, false);
                LMStatus.Cookie = cook;
                initHash(getHash(tCourseMeta, scormCompanyId, cfg.rootProductId, null, null));
                CourseMeta.lib.adjustAllProductList(() => { //nacteni infos o vsech produktech
                  if (cfg.licenceConfig && cfg.licenceConfig.isDynamic) boot.loadCourseJS(completed); else completed();
                });
              });
            });
            break;
          case persistTypes.persistMemory: //memory persistence pro testovani scormu
            CourseMeta.persist = persistMemory.persistCourse;
            Trados.adjustLoc(() => {
              //scorm.initDummy();
              var cook = LMComLib.LMCookieJS_Create(scormCompanyId, 0, null, "id", null, LMComLib.OtherType.Moodle, "id", "firstName", "lastName", '', 0, 0, null);
              LMStatus.setCookie(cook, false);
              LMStatus.Cookie = cook;
              initHash(getHash(tCourseMeta, scormCompanyId, cfg.rootProductId, null, null));
              CourseMeta.lib.adjustAllProductList(completed) //nacteni infos o vsech produktech
            });
            break;
          default:
            CourseMeta.persist = persistNewEA.persistCourse;
            Trados.adjustLoc(() => {
              scorm.init((compHost, id, firstName, lastName, isFirstEnter) => { //zjisti info z moodle
                Pager.ajaxGet( //z moodle info adjustuj uzivatele a firmu
                  Pager.pathType.restServices,
                  Login.CmdAdjustScormUser_Type,
                  Login.CmdAdjustScormUser_Create(compHost, id, firstName, lastName, isFirstEnter, cfg.rootProductId),
                  (res: Login.CmdAdjustScormUserResult) => {
                    LMStatus.setCookie(res.Cookie, false);
                    LMStatus.Cookie = res.Cookie;
                    setTimeout(LMStatus.loggedBodyClass, 1);
                    initHash(getHash(tCourseMeta, res.companyId, cfg.rootProductId, null, null));
                    CourseMeta.lib.adjustAllProductList(completed) //nacteni infos o vsech produktech
                  });
              });
            });
            break;
        }
        break;
      //case LMComLib.Targets.phoneGap:
      //case LMComLib.Targets.download:
      //case LMComLib.Targets.sl:
      //  setTimeout(LMStatus.loggedBodyClass, 1);
      //  //LMStatus.loggedBodyClass();
      //  LMStatus.Cookie = offlineCookie;
      //  persistLocal.Init(cfg.target, () => {
      //    Trados.adjustLoc(() => {
      //      Pager.initUrl = new Url(tHome, offlineCompanyId, cfg.rootCourse, null);
      //      prods.init(completed)//nacteni infos o vsech produktech
      //    });
      //  });
      //  break;
      case LMComLib.Targets.web:
        switch (cfg.persistType) {
          case persistTypes.persistScormEx: //scorm persistence
            CourseMeta.persist = persistScormEx.persistCourse;
            Trados.adjustLoc(() => {
              initHash(getHash(tCourseMeta, scormCompanyId, cfg.rootProductId, null, null));
              LMStatus.adjustLoggin(() => CourseMeta.lib.adjustAllProductList(completed));
            });
            break;
          case persistTypes.persistMemory: //memory persistence
            LMStatus.Cookie = offlineCookie;
            CourseMeta.persist = persistMemory.persistCourse;
            Pager.initHash = () => cfg.hash ? cfg.hash : Gui2.skin.instance.getSkinHome(Login.getHash(Login.pageLogin));
            Trados.adjustLoc(() => {
              //initHash(getHash(tCourseMeta, scormCompanyId, cfg.rootProductId, null));
              LMStatus.adjustLoggin(() => CourseMeta.lib.adjustAllProductList(completed));
            });
            break;
          default:
            CourseMeta.persist = persistNewEA.persistCourse;
            Pager.initHash = () => cfg.hash ? cfg.hash : Gui2.skin.instance.getSkinHome(Login.getHash(Login.pageLogin));
            Trados.adjustLoc(() => { //zajisteni spravne lokalizace
              //initHash(Gui2.skin.instance.getLoginHome(Login.getHash(Login.pageLogin)));
              Pager.afterLoginInit = (completed: () => void) => {
                Logger.traceMsg('Model.InitModel afterLoginInit');
                //Pager.initHash = getHash(tMy, -1, null, null);
                if (cfg.licenceConfig && cfg.licenceConfig.isDynamic) boot.loadCourseJS(completed); else completed();
              };
              LMStatus.adjustLoggin(() => CourseMeta.lib.adjustAllProductList(completed));
            });
            break;
        }
        break;
      default:
        throw "not implemented";
    }
  }
  var scormCompanyId = 0x4FFFFFFF - 1;

  export function LMComUserId(): number { return !LMStatus.isLogged() ? -1 : LMStatus.Cookie.id; }

  export function homeTitle(): string { return CSLocalize('5c4e78c9f3884816a78d1d4d9fe1f458', 'My Online Courses and Tests'); }

  export interface ILink {
    title: string; //typeName: string;
    iconId(): string;
    url: string;
  }

  export class RootModel extends Pager.ViewModelRoot {
    pageChanged(oldPg: Pager.Page, newPg: Pager.Page): void { //pred skokem na cizi stranku
      if (oldPg == null || newPg == null) return;
      var crsTypes = [tEx, tTest, tMy, tCourseMeta];
      if (_.any(crsTypes, t => newPg.type == t)) LMStatus.clearReturnUrl(); //navrat do kurzu, posledni kurz Url
      if (_.any(crsTypes, t => oldPg.type == t)) LMStatus.setReturnUrl(oldPg.getHash()); //skok z kurzu, zapamatuj si posledni kurz Url
    }
    loaded() {
      CourseMeta.lib.finishHtmlDOM(); //uprav anchory (click event z href)
      $(window).trigger("resize"); //nektere komponenty, napr. progress bar, potrebuji pri resize inicializovat
    }
  }

  Pager.rootVM = new RootModel();

  export class Model extends Pager.Page {
    copmanyId: number;
    productUrl: string;
    persistence: string;
    url: string;

    constructor(typeName: string, urlParts: string[]/*companyId: number, productUrl: string, url: string*/) {
      super(appId, typeName, urlParts);
      CourseMeta.actCompanyId = this.copmanyId = urlParts && urlParts.length >= 1 ? parseInt(urlParts[0]) : -1;
      this.productUrl = urlParts && urlParts.length >= 2 ? urlParts[1] : null;
      this.persistence = urlParts && urlParts.length >= 3 ? urlParts[2] : null;
      this.url = urlParts && urlParts.length >= 4 ? urlParts[3] : null;
      DictConnector.actDictData = null;
      this.tb = new TopBarModel(this);
    }

    hasBreadcrumb() { return false; }

    update(completed: () => void): void {
      SndLow.Stop(); SndLow.needInstallFalse();
      if (!LMStatus.isLogged()) { completed(); return; }
      this.doUpdate(completed);
    }
    doUpdate(completed: () => void): void { completed(); }

    tb: TopBarModel;
    hasLogin(): boolean { return cfg.target == LMComLib.Targets.web; }
    title(): string { return homeTitle(); }
    iconId(): string { return ''; }
    breadcrumbs(): schools.ILink[] { return []; }

  }

  var offlineCompanyId = 0x4FFFFFFF;
  var offlineCookie: LMStatus.LMCookie = { id: 0x4FFFFFFF, EMail: null, Login: "localUser", LoginEMail: null, Type: 0, TypeId: null, FirstName: null, LastName: null, OtherData:null, Company: null, created:0, Roles:null, VerifyStatus:0 };

  export function createGrammUrl(type: string, url: string): string { return getHash(type, CourseMeta.actCompanyId, CourseMeta.actProduct.url, CourseMeta.actProductPersistence, url); }
  export function createDictIntroUrl(): string { return getHash(tDictInfo, 0, '', null, null); }
  //export function createHomeUrlStd(): string { return false ? getHash(tCourseMeta, CourseMeta.actCompanyId, CourseMeta.actProduct.url, "") : getHash(tMy, -1, null, null); }
  export function createHomeUrlStd(): string { return getHash(tMy, -1, null, null, null); }

}

///#DEBUG
function fake() {
  CSLocalize('0cf19a3b455d40828295252fb0a321b7', 'Assessment test for Beginners');
  CSLocalize('1d2a3c242b284bca9259b776852b0b9a', 'Assessment test for Advanced');
  CSLocalize('1eb1c7d6e2184db88ce765cdc2ab2efa', 'Assessment test for Advanced');
  CSLocalize('22562c9261a844319eeb5b604bfded79', 'chapters');
  CSLocalize('2d31eeae1c5d483db53452f07d20e0d9', 'Your answers are not all correct. Do you really want to evaluate the exercise?');
  CSLocalize('2ee8666492594108b4ac42d5900f1e2e', 'Congratulations! You have completed the questionnaire. We recommend you do the');
  CSLocalize('2fb0c828db9141ca9dcf0890e3256a51', 'Do you really want to remove this chapter from the learning process?');
  CSLocalize('2fdca34d83c342c6bdf8f99ed718f8be', 'Assessment test for Pre-intermediate');
  CSLocalize('324ea9db901844619d3d1de5d05293fd', 'Assessment test for Beginners');
  CSLocalize('344390c563454f23baea0758357cd6bf', 'Congratulations! You have completed the questionnaire. We recommend you do the');
  CSLocalize('3b2515a8ef6540feb9aa61ba57223ce5', 'Assessment test for Pre-intermediate');
  CSLocalize('3b473d38d79342a18501f9401b734eb6', 'Congratulations! You have completed the chapter.');
  CSLocalize('3de6029a9178476b8bb5b620a31cc546', 'Assessment test for Beginners');
  CSLocalize('43073e32fb5c4ee08d247e501c45a3df', 'Congratulations! You have completed the entrance test.');
  CSLocalize('4b7b50da82224dac90931a97fa8b4bd2', 'The test is not completed, do you really wish to interrupt it? Note: Your results will be saved anyway.');
  CSLocalize('4e20b0cbab9f42508ee43c7f236eb061', 'Congratulations! You have completed the questionnaire. We recommend you do the');
  CSLocalize('58507bbcbd8144caa48d2742ae906200', 'Finished:');
  CSLocalize('5ac28df92076478d93e8913ea2c2b6b9', 'Assessment test for Beginners');
  CSLocalize('6c18d525496449aea1095bc4d51a3071', 'The test is not completed, do you really wish to interrupt it? Note: Your results will be saved anyway.');
  CSLocalize('6ca45688007e4d2cbb6337be6121c148', 'Score');
  CSLocalize('71661be93a204b0398c4628f52611b46', 'done');
  CSLocalize('781a102bcc5041c583e7481d9b24a3d3', 'Assessment test for Beginners');
  CSLocalize('7e1cd46186014c21b971f869981dfff4', 'Do you really want to set the starting point of your study to the chapter');
  CSLocalize('825d0d1d7d014d84a8c00f767bd18f69', 'Congratulations! You have completed the chapter.');
  CSLocalize('863ecfa04f0d438ba29f4d9f570bd523', 'Score:');
  CSLocalize('8d9a5fde99a44f0d8e0012c43b9e2a98', 'Assessment test for Advanced');
  CSLocalize('8e457cd200f44e67bb943f27c20a3b8f', 'Score');
  CSLocalize('90e3f558723446fe9e70f5acfb8eb502', 'The test is not completed, do you really wish to interrupt it? Note: Your results will be saved anyway.');
  CSLocalize('9ce505e50f954a72a64921f397eb1a1e', 'Congratulations! You have completed the questionnaire. We recommend you do the');
  CSLocalize('a988706addc34fb9b23bb8ccde488bec', 'For a better assessment of your language knowledge you will get');
  CSLocalize('b6652a077fb0401faebb8c283e4b8117', 'Congratulations! You have completed the questionnaire. We recommend you do the');
  CSLocalize('b933199b227a4239b27e4ba75a4a2035', 'The test is not completed, do you really wish to interrupt it? Note: Your results will be saved anyway.');
  CSLocalize('c97bd8fbd7434033adb520be906efb6e', 'Assessment test for Advanced');
  CSLocalize('cf1af1547fdf4219b0a5d5f20dc3422f', 'Congratulations! You have completed the chapter. Click on the \'Continue\' button to continue.');
  CSLocalize('d831ae9ba2bc418382d361c2c29a3763', 'Do you really want to return this chapter to the learning process?');
  CSLocalize('e3e1407956114f62b924b8911f1deeb7', 'This chapter is not completed, do you really wish to interrupt your study? Note: Your results will be saved anyway.');
  CSLocalize('e931e33b05af468e93c874190465fa52', 'Do you really want to restore this chapter to the initial (uncompleted) state, so that you can go through it again? By restoring you will lose the results of all exercises from this chapter.');
  CSLocalize('f45743416d034fe6a67f7c8d44ed859f', 'Assessment test for Advanced');
  CSLocalize('f5f06b394fea4d4aa850b2d4e5a05470', 'The test is not completed, do you really wish to interrupt it? Note: Your results will be saved anyway.');
}

///#ENDDEBUG
var fakeLoc = null;
