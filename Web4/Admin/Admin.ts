/// <reference path="../JsLib/jsd/jquery.d.ts" />
/// <reference path="../JsLib/jsd/knockout.d.ts" />
/// <reference path="../JsLib/jsd/jsrender.d.ts" />
/// <reference path="../JsLib/jsd/underscore.d.ts" />
/// <reference path="../JsLib/js/ModelBase.ts" />
/// <reference path="../JsLib/js/GenLMComLib.ts" />
/// <reference path="../JsLib/ea/EAExtension.ts" />
/// <reference path="GenAdmin.ts" />
/// <reference path="../JsLib/js/Validate.ts" />
/// <reference path="../login/GenLogin.ts" />
/// <reference path="../login/Model.ts" />
/// <reference path="KeyGen.ts" />
/// <reference path="Products.ts" />
/// <reference path="CompAdmins.ts" />

module schoolAdmin {

  export var roleTranslation: Array<() => string> = [];
  roleTranslation[LMComLib.CompRole.Department] = () => CSLocalize('a815ebcae6bb419db07ce3c645be19fd', 'Departments');
  roleTranslation[LMComLib.CompRole.Keys] = () => CSLocalize('4b5fde74d58f4e018ddc17ea7355b5a5', 'Keys');
  roleTranslation[LMComLib.CompRole.Products] = () => CSLocalize('ec533f48bf76461c9c517852cb53f41a', 'Products');
  roleTranslation[LMComLib.CompRole.Results] = () => CSLocalize('be895a5caef442c189deb82bf0497e8f', 'Results');
  roleTranslation[LMComLib.CompRole.Publisher] = () => CSLocalize('5302653a14e441b994c1044ad2e10b1d', 'Publisher');
  roleTranslation[LMComLib.CompRole.HumanEvalManager] = () => CSLocalize('f97ac29fced34a8d81c3760b1e7a9a4f', 'Evaluation Manager');

  export class TopBarModel {
    constructor(public model: Pager.Page) { }
    logoBig = returnTrue;
    isTitle = returnFalse;
    logoSmall = returnFalse;
    greenArrow = returnFalse;
    hasSupl = returnFalse;
    backToCourse = returnFalse;
    needsLogin = returnFalse;
    phoneMore = returnFalse;
    logoutAndProfile = returnFalse;
  }

  export function returnFalse(): boolean { return false; }
  export function returnTrue(): boolean { return true; }

  export function getHash(type: string, companyId: number) { return [appId, type, companyId.toString()].join('@'); }

  export var adminTypeName = "schoolAdminModel".toLowerCase(); //System administrator, dovoluje pridat dalsi system administrators a dalsi firmy
  export var keyGenTypeName = "schoolKeyGenModel".toLowerCase();
  export var productsTypeName = "schoolProductsModel".toLowerCase();
  export var humanEvalTypeName = "schoolHumanEvalModel".toLowerCase();
  export var humanEvalExTypeName = "schoolHumanEvalExModel".toLowerCase();
  export var humanEvalManagerLangsTypeName = "schoolHumanEvalManagerLangsModel".toLowerCase();
  export var humanEvalManagerTypeName = "schoolHumanEvalManagerModel".toLowerCase();
  export var humanEvalManagerExTypeName = "schoolHumanEvalManagerExModel".toLowerCase();
  export var humanEvalManagerEvsTypeName = "schoolHumanEvalManagerEvsModel".toLowerCase();
  export var humanEvalManagerTypeName = "schoolHumanEvalManagerModel".toLowerCase();
  export var compAdminsTypeName = "schoolCompAdminsModel".toLowerCase();
  export var editDepartmentTypeName = "schoolDepartmentModel".toLowerCase();
  export var schoolUserResultsTypeName = "schoolUserResultsModel".toLowerCase();

  export class CompModel extends Pager.Page {
    constructor(type: string, urlParts: string[]) {
      super(schools.appId, type, urlParts);
      this.CompanyId = CourseMeta.actCompanyId = parseInt(urlParts[0]);
      this.tb = new TopBarModel(this);
      if (!LMStatus.getCookie()) return;
      var c = _.find(Login.myData.Companies, c => c.Id == this.CompanyId);
      LMStatus.Cookie.Company = c ? { Courses: c.Courses, DepSelected: c.DepSelected, Id: c.Id, RoleEx: c.RoleEx, Title: c.Title } : null;
      LMStatus.setCookie(LMStatus.Cookie);
      //this.url = new CompIdUrl(type, CompanyId);
    }

    CompanyId: number;
    tb: TopBarModel;
    title() { return _.find(Login.myData.Companies,(comp: Login.MyCompany) => comp.Id == this.CompanyId).Title; }
  }

  export class AdminModel extends Pager.Page {
    constructor() {
      super(appId, adminTypeName, null);
      var self = this;
      //this.url = new Url(adminTypeName);
      this.tb = new TopBarModel(this);

      // ROLE ADMIN
      this.admin_EMail = validate.create(validate.types.email,(prop) => {
        prop.required = true;
        prop.customValidation = (email: string) => { return _.any(this.role_Admin,(it: UserItem) => it.data.EMail == email) ? CSLocalize('bb4c401401ad413fbbf55c4906fb87ed', 'User with this email already added') : null; };
      });
      this.admin_add = () => {
        if (!validate.isPropsValid([this.admin_EMail])) return;
        var nu: UserItem = new UserItem(this, { EMail: this.admin_EMail.get(), LMComId: 0, Deleted: false });
        this.role_Admin.push(nu);
        this.admin_EMail(null);
        this.refreshRoleAdminHtml();
      };
      this.admin_del = (act: UserItem) => {
        if (act.data.LMComId == 0) { self.role_Admin = _.without(self.role_Admin, act); this.refreshRoleAdminHtml(); } else act.Deleted(!act.Deleted());
      }

      // ROLE COMPS
      this.comps_Name = validate.create(validate.types.minlength,(prop) => {
        prop.min = 3;
        prop.customValidation = (name: string) => { return _.any(this.role_Comps,(it: CompanyItem) => it.data.Title.toLowerCase() == name.toLowerCase()) ? CSLocalize('98b0616339a54314a3b865f7d76b99d8', 'Company with this title already added') : null; };
      });

      this.comps_EMail = validate.create(validate.types.email,(prop) => { prop.required = true; });
      this.company_add = () => {
        if (!validate.isPropsValid([this.comps_EMail, this.comps_Name])) return;
        var nu: CompanyItem = new CompanyItem({
          EMail: this.comps_EMail.get(), Title:
          this.comps_Name.get(), UserId: 0, Id: 0, Deleted: false,
        }, this);
        this.role_Comps.push(nu);
        this.comps_EMail(null); this.comps_Name(null);
        this.refreshCompHtml();
      };
      this.company_del = (act: CompanyItem) => {
        if (act.data.Id == 0) { self.role_Comps = _.without(self.role_Comps, act); this.refreshCompHtml(); } else act.Deleted(true);
      }
      this.company_undel = (act: CompanyItem) => { act.edited(false); act.Deleted(false); }
      this.company_edit = (act: CompanyItem) => { act.email(act.data.EMail); act.name(act.data.Title); /*act.publisherId(act.data.PublisherId);*/ act.edited(true); };
      this.company_editCancel = (act: CompanyItem) => { act.edited(false); };
      this.company_editOk = (act: CompanyItem) => { if (!validate.isPropsValid([act.email, act.name/*, act.publisherId*/])) return; act.data.EMail = act.email(); act.data.Title = act.name(); /*act.data.PublisherId = act.publisherId();*/ act.edited(false); };
    }

    tb: TopBarModel;
    title() { return CSLocalize('b2b7224389dd4118816f50890aececa4', 'Administrator Console'); }

    refreshRoleAdminHtml() {
      Pager.renderTemplateEx('schoolAdminRolePlace', 'schoolAdminRole', this);
    }
    refreshCompHtml() {
      Pager.renderTemplateEx('schoolAdminCompPlace', 'schoolAdminCompPlace', this);
    }

    // UPDATE
    update(completed: () => void): void {
      Pager.ajaxPost(
        Pager.pathType.restServices,
        Admin.CmdGetUsers_Type,
        AdminDataCmd_from_MyData(Login.myData),
        (res: Admin.CmdGetUsersResult) => {
          this.role_Admin = _.map(res.Users,(act: Admin.UserItem) => new UserItem(this, act));
          this.oldComps = JSON.parse(JSON.stringify(res.Comps)); //kopie
          this.role_Comps = _.map(res.Comps,(act: Admin.Comp) => new CompanyItem(act, this));
          this.comp_Admin(_.map(_.pairs(_.groupBy(res.CompUsers, "CompanyId")),(nv: any[]) => new CompanyAdmins(nv[0], nv[1])));
          setTimeout(() => {
            this.refreshRoleAdminHtml();
            this.refreshCompHtml();
          }, 1);
          completed();
        });
    }

    // OK x CANCEL
    ok() {
      Pager.ajaxPost(
        Pager.pathType.restServices,
        Admin.CmdSetUsers_Type,
        Admin.CmdSetUsers_Create(
          _.map(this.role_Admin,(it: UserItem) => it.data),
          this.oldComps,
          _.map(this.role_Comps,(it: CompanyItem) => it.data),
          _.map(_.flatten(_.map(this.comp_Admin(),(it: CompanyAdmins) => it.Items()), true),(it: CompanyAdminItem) => it.data)
          ),
        () => {
          Login.adjustMyData(true,() => LMStatus.gotoReturnUrl());
        }
        );
    }
    cancel() { LMStatus.gotoReturnUrl(); }

    // ROLE ADMIN
    admin_EMail: validate.ValidObservable<string>;
    role_Admin: Array<UserItem>;
    admin_del;
    admin_add;
    //admin_NewModel: validate.InputModel;

    // ROLE COMPS
    oldComps: Admin.Comp[];
    role_Comps: Array<CompanyItem>;
    comps_Name: validate.ValidObservable<string>;
    comps_EMail: validate.ValidObservable<string>;
    //comps_PublisherId: validate.ValidObservable;
    company_del; company_undel; company_edit; company_add; company_editOk; company_editCancel;

    // COMP ADMIN
    comp_Admin = ko.observableArray(); //of CompanyAdmins
  }

  // ROLE ADMIN
  class UserItem {
    constructor(public owner: AdminModel, public data: Admin.UserItem) { this.Deleted.subscribe(val => data.Deleted = val); }
    Deleted = ko.observable<boolean>(false);
  }

  // ROLE COMPS
  class CompanyItem {
    constructor(public data: Admin.Comp, public owner: AdminModel) {
      this.Deleted.subscribe(val => data.Deleted = val);
      this.email = validate.create(validate.types.email,(prop) => { prop.required = true; prop(data.EMail); });
      this.name = validate.create(validate.types.minlength,(prop) => { prop.min = 3; prop(data.Title); });
    }
    Deleted = ko.observable<boolean>(false);
    email: validate.ValidObservable<string>;
    name: validate.ValidObservable<string>;
    edited = ko.observable<boolean>(false);
  }

  // COMP ADMIN
  class CompanyAdmins {
    constructor(public Id: number, items: Admin.CompUserItem[]) {
      var self = this;
      this.Title = _.find(Login.myData.Companies,(comp: Login.MyCompany) => comp.Id == Id).Title;
      this.Items(_.map(items,(it: Admin.CompUserItem) => new CompanyAdminItem(it)));
      this.compAdmin_del = (act: CompanyAdminItem) => { if (act.data.UserId == 0) self.Items.remove(act); else act.Deleted(!act.Deleted()); }
      this.newEMail = validate.create(validate.types.email,(prop) => {
        prop.required = true;
        prop.customValidation = (email: string) => { return _.any(this.Items(),(it: CompanyAdminItem) => it.data.EMail == email) ? CSLocalize('af6fb39c97c042fb8d06e0ca1645846d', 'User with this email already added') : null; };
      });
      this.newEMail_Add = () => {
        if (!validate.isPropsValid([this.newEMail])) return; var nu: CompanyAdminItem = new CompanyAdminItem({
          UserId: 0,
          Deleted: false,
          EMail: self.newEMail(),
          CompanyId: Id,
          Role: { Role: 0, HumanEvalatorInfos: null }
        }); this.Items.push(nu); this.newEMail(null);
      };
    }
    Title: string;
    Items = ko.observableArray(); //of CompanyAdminItem
    compAdmin_del;
    newEMail: validate.ValidObservable<any>;
    newEMail_Add;
  }
  class CompanyAdminItem {
    constructor(public data: Admin.CompUserItem) {
      this.Deleted.subscribe(val => data.Deleted = val);
      this.options = [new CompanyAdminOption(this.data, LMComLib.CompRole.Keys), new CompanyAdminOption(this.data, LMComLib.CompRole.Products)];
    }
    Deleted = ko.observable<boolean>(false);
    options;
  }
  class CompanyAdminOption {
    constructor(public data: Admin.CompUserItem, role: LMComLib.CompRole) {
      this.checked((data.Role.Role & role) != 0);
      this.checked.subscribe(r => data.Role.Role = r ? data.Role.Role | role : data.Role.Role & ~role);
      this.title = LowUtils.EnumToString(LMComLib.CompRole, role);
    }
    checked = ko.observable<boolean>(false);
    title: string;
  }

  //export class Url extends Pager.Url {
  //  constructor(type: string) { super(appId, type); }

  //  finish() { }

  //  static fromString(hash: string): Pager.Url {
  //    var parts = hash.split("@");
  //    return parts.length == 1 ? new Url(hash) : new CompIdUrl(parts[0], parseInt(parts[1]));
  //  }
  //  //toString(): string { return super.toString(appId, [this.locator == adminTypeName ? "" : this.locator]); }
  //}
  //export class CompIdUrl extends Pager.Url {
  //  constructor(type: string, public CompanyId: number) { super(appId, type, CompanyId.toString()); }
  //  finish() { this.CompanyId = parseInt(this.url); }
  //}

  //Login.MyData jsou dalsi data o uzivateli mimo Cookie. Nacitaji se v LMStatus.adjustCookie => Login.Model. Obsahuji globalni a firemni Role uzivatele. 
  export function AdminDataCmd_from_MyData(myData: Login.MyData): Admin.CmdGetUsers {
    return Admin.CmdGetUsers_Create(
      (myData.Roles & Login.Role.Admin) != 0,
      (myData.Roles & Login.Role.Comps) != 0,
      _.map(_.filter(myData.Companies,(c: Login.MyCompany) => (c.RoleEx.Role & LMComLib.CompRole.Admin) != 0),(c: Login.MyCompany) => c.Id)
      );
  }

  //Pager.registerAppLocator(adminTypeName, (url: Url, completed: (pg: Pager.Page) => void) => completed(new AdminModel()));
  Pager.registerAppLocator(appId, adminTypeName,(urlParts, completed) => completed(new AdminModel()));

  //registrace Url.fromString funkce
  //Pager.registerApp(appId, Url.fromString);

}


