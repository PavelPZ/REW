module LMComLib {
  export interface MyCourse {
    isAuthoredCourse: boolean; //jedna se o link na authored kurz (nikoliv na licenced kurz)
    Archives: Array<number>;
  }
}
module Login {

  export interface otherData {
    fullAddress: string;
    phone: string;
    birthday: string;
  }

  export var cfg: Config;

  export function getHash(type: string): string {
    return oldPrefix + [appId, type].join(hashDelim);
  }

  //export class RootModel extends Pager.RootModelEx {
  //  //urlFromString(hash: string): Pager.Url {
  //  //  return Url.fromString(hash);
  //  //}
  //}

  export interface MyData {
    finished: boolean;
  }

  export var myData: Login.MyData; //info o mojich firmach, produktech a rolich
  //pro Admin.html
  export function isSystemAdmin(): boolean { return ((myData.Roles & Login.Role.Admin) != 0) || ((myData.Roles & Login.Role.Comps) != 0); } //PZ
  export function isRoleComps() { return (myData.Roles & Login.Role.Comps) != 0; } //ZZ, RJ, PJ, ktere PZ urci 
  export function companyExists() { return _.any(myData.Companies,(c: Login.MyCompany) => (c.RoleEx.Role == LMComLib.CompRole.Admin) || ((c.RoleEx.Role & ~LMComLib.CompRole.Admin) != 0) || (c.Courses != null && c.Courses.length > 0)); }
  //export function isCompAdmin() { return _.any(myData.Companies, (c: Login.MyCompany) => (c.Roles & ~Login.CompRole.Admin) != 0); } //Chinh povoli nejakou company roli (products nebo key)
  //export function isCompStudent() { return _.any(myData.Companies, (c: Login.MyCompany) => (c.Courses != null && c.Courses.length > 0)); } //existuje nejaky prirazeny kurz

  LMStatus.onLogged = (completed: () => void) => {
    if (!LMStatus.isLogged()) { completed(); return; }
    if (Pager.afterLoginInit) Pager.afterLoginInit(() => adjustMyData(false, completed));
    else adjustMyData(false, completed);
  }

  export function adjustMyData(force: boolean, completed: () => void) {
    if (!force && myData != null && myData.UserId == LMStatus.Cookie.id) { completed(); return; }
    //info o firmach, produktech a rolich
    Pager.ajaxGet(
      Pager.pathType.restServices,
      Login.CmdMyInit_Type,
      LMStatus.createCmd<CmdMyInit>(r => r.lmcomId = LMStatus.Cookie.id),
      //Login.CmdMyInit_Create(LMStatus.Cookie.id),
      (res: Login.MyData) => {
        myData = res;
        if (CourseMeta.allProductList) finishMyData(); //pri spusteni se nejdrive nacitaji Mydata a pak teprve produkty. Proto se finishMyData vola i v adjustAllProductList 
        completed();
      });
  }

  //export function createArchive(companyId: number, productId: string, completed: (archiveId:number) => void) {
  //  //info o firmach, produktech a rolich
  //  Pager.ajaxGet(
  //    Pager.pathType.restServices,
  //    scorm.Cmd_createArchive_Type,
  //    scorm.Cmd_createArchive_Create(LMStatus.Cookie.id, companyId, productId, null),
  //    (res: number) => completed(res));
  //}

  export function finishMyData() {
    if (!myData || myData.finished) return;
    myData.finished = true;
    var res = myData;
    //pridej produkty, vytvorene (vlastnene) by company
    _.each(myData.Companies, comp => {
      if (comp.PublisherOwnerUserId != 0) {
        if (comp.PublisherOwnerUserId != myData.UserId) return;
        comp.RoleEx.Role = LMComLib.CompRole.Keys | LMComLib.CompRole.Products | LMComLib.CompRole.Publisher;
      } else {
        if ((comp.RoleEx.Role && LMComLib.CompRole.Publisher) == 0) return;
      }
      _.each(comp.companyProducts, p => comp.Courses.push({
        Expired: -1,
        Archives: null,
        isAuthoredCourse: true,
        LicCount: 1,
        ProductId: p.url
      }));
    });
    //agreguj archivy testu a dosad isTest
    _.each(res.Companies, myComp => {
      var courses: Array<LMComLib.MyCourse> = [];
      //jedna grupa - vsechny zaznamy o jednom produktu (eTestMe archiv) a to budto isAuthoredCourse nebo ne
      var prodGroups = _.groupBy(myComp.Courses, myCrs => (myCrs.isAuthoredCourse ? '+' : '-') + '|' + myCrs.ProductId.split('|')[0]);
      for (var prodcode in prodGroups) {
        var prodGroup = prodGroups[prodcode];
        var prodId: string = prodcode.split('|')[1];
        var isAuthoredCourse: boolean = prodcode.charAt(0) == '+';
        var isTest = CourseMeta.lib.isTest(CourseMeta.lib.findProduct(prodId));
        var crs: LMComLib.MyCourse;
        if (!isTest) {
          if (prodGroup.length > 1) { debugger; /*kdyz se published test pouzije a publisher nasledne stejnout URL pouzije pro kurz => chyba. throw 'Text expected';*/ }
          crs = prodGroup[0];
          crs.isAuthoredCourse = isAuthoredCourse;
        } else {
          var crs: LMComLib.MyCourse = {
            Expired: 0,
            ProductId: prodId,
            Archives: [],
            LicCount: 0,
            isAuthoredCourse: isAuthoredCourse,
          };
          _.each(prodGroup, it => {
            var parts = it.ProductId.split('|'); //productId je url|archiveId
            switch (parts.length) {
              case 1: crs.LicCount = it.LicCount; break; //rozpracovany test (neni archiv)
              case 2: crs.Archives.push(parseInt(parts[1])); break; //archiv
              default: { debugger; throw 'error'; }
            }
          });
        }
        courses.push(crs);
      }
      myComp.Courses = courses;
    });
  }

  export var c_firstName = () => CSLocalize('620972c027ab41a28bcb0306b233b0ce', 'First Name');
  export var c_lastName = () => CSLocalize('03500780ce2c476a9719c9e8e3202465', 'Last Name');
  export var c_oldPassword = () => CSLocalize('275229db239c41f0a7d3038e0072323f', 'Old password');
  export var c_newPassword = () => CSLocalize('e0bc9a352e364c40b87d261f44697515', 'New password');

  //export class Url extends Pager.Url {
  //  constructor(type: string) { super(appId, type); }

  //  //static fromString(hash: string): Pager.Url {
  //  //  return _.isEmpty(hash) ? initUrl() : new Url(hash);
  //  //}
  //  toString(): string { return appId + "@" + (this.locator == pageLogin ? "" : this.locator); }
  //}

  export function Dump(): any {
    var res: any = {};
    res.login = () => {
      //window.location.href = LMStatus.newLoginUrl(false);
    };
    res.login_https = () => {
      //window.location.href = LMStatus.newLoginUrl(true);
    };
    //res.logout = LMStatus.logout;
    var cook = LMStatus.getCookie();
    var logged = cook != null && cook.id > 0;
    res.isLogin = !logged;
    if (!logged) { res.Error = "Not logged"; return res; }
    res.Id = "<b>Id:</b> " + cook.id;
    res.EMail = "<b>EMail:</b> " + cook.EMail;
    res.Type = "<b>Type:</b> " + LowUtils.EnumToString(LMComLib.OtherType, cook.Type);
    res.TypeId = "<b>TypeId:</b> " + cook.TypeId;
    res.FirstName = "<b>FirstName:</b> " + cook.FirstName;
    res.LastName = "<b>LastName:</b> " + cook.LastName;
    return res;
  }

  export function InitModel(_cfg: Config, completed: () => void) {
    cfg = _cfg;
    completed();
  }

  export var pageLogin = "loginModel".toLowerCase();
  export var pageLmLogin = "lmLoginModel".toLowerCase();
  export var pageLmLoginNoEMail = "lmLoginNoEMailModel".toLowerCase();
  export var pageRegister = "registerModel".toLowerCase();
  export var pageRegisterNoEMail = "registerNoEMailModel".toLowerCase();
  export var pageChangePassword = "changePasswordModel".toLowerCase();
  export var pageForgotPassword = "forgotPasswordModel".toLowerCase();
  export var pageProfile = "profileModel".toLowerCase();
  export var pageConfirmRegistration = "ConfirmRegistrationModel".toLowerCase();

  //export interface IPageDict { type: string; create: (type: string) => loginMode; }
  //};

  export class loginMode extends Pager.Page {
    constructor(type: string) {
      super(appId, type, null);
      //this.url = new Url(type.toLowerCase());
      this.errorText = ko.computed(function () {
        var err = this.error();
        if (!err || err == "") return null;
        return "<b>Error:</b> " + err;
      }, this);
    }

    viewModel: validate.InputModel[];

    update(completed: () => void): void {
      completed();
    }

    ok() {
      if (!validate.isValid(this.viewModel)) return;
      this.doOK();
    }
    doOK() { }

    errorText: KnockoutComputed<string>;
    error = ko.observable<string>(null);
    success = ko.observable<string>(null);

  }

  export interface Config {
    logins: LMComLib.OtherType[];
  }
  export interface Department {
    it: number;
    title: string;
    deps: Department[];
  }

  //Init Url
  //export var initUrl = () => new Url(pageLogin);
  //export var initHash = getHash(pageLogin);

  if ($.views) $.views.helpers({
    loginUrl: (par) => "#" + getHash(_.isEmpty(par) ? pageLogin : par),
  });

  export function newProfileUrl() {
    LMStatus.setReturnUrlAndGoto(getHash(pageProfile));
  }

  export var pageDict: { [type: string]: (urlParts: string[], completed: (pg: Pager.Page) => void) => void } = {};
  pageDict[pageLogin] = (urlParts, completed) => completed(new LoginModel(pageLogin));
  pageDict[pageLmLogin] = (urlParts, completed) => completed(new LMLoginModel(pageLmLogin, true));
  pageDict[pageLmLoginNoEMail] = (urlParts, completed) => completed(new LMLoginModel(pageLmLoginNoEMail, false));
  pageDict[pageRegister] = (urlParts, completed) => completed(new RegisterModel(pageRegister, true));
  pageDict[pageRegisterNoEMail] = (urlParts, completed) => completed(new RegisterModel(pageRegisterNoEMail, false));
  pageDict[pageConfirmRegistration] = (urlParts, completed) => completed(new ConfirmRegistrationModel(pageConfirmRegistration));
  pageDict[pageChangePassword] = (urlParts, completed) => completed(new ChangePassworModel(pageChangePassword));
  pageDict[pageForgotPassword] = (urlParts, completed) => completed(new ForgotPasswordModel(pageForgotPassword));
  pageDict[pageProfile] = (urlParts, completed) => completed(new ProfileModel(pageProfile));

  //Registrace lokatoru
  for (var p in pageDict)
    Pager.registerAppLocator(appId, p, pageDict[p]);
  //_.each(pageDict, (t: IPageDict) => Pager.registerAppLocator2(
  //  appId,
  //  t.type,
  //  (urlParts, completed) => {
  //    //var hash = url.locator.toLowerCase();
  //    //var page: IPageDict = _.find(pageDict, (t: IPageDict) => t.type == hash);
  //    //completed(page.create(page.type));
  //  })
  //  );
  //registrace Url.fromString funkce
  //Pager.registerApp(appId, Url.fromString);

}

