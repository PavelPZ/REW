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
/// <reference path="admin.ts" />

module schoolAdmin {
  export class CompAdmins extends CompModel {
    constructor(urlParts: string[]) {
      super(compAdminsTypeName, urlParts);
    }

    // UPDATE
    update(completed: () => void): void {
      Pager.ajaxPost(
        Pager.pathType.restServices,
        Admin.CmdGetUsers_Type,
        Admin.CmdGetUsers_Create(false, false, [this.CompanyId]),
        (res: Admin.CmdGetUsersResult) => {
          this.comp_Admin = _.map(_.pairs(_.groupBy(res.CompUsers, "CompanyId")),(nv: any[]) => new CompanyAdmins(this, nv[0], nv[1]));
          setTimeout(() => this.refreshHtml(),1);
          completed();
        });
    }

    // OK x CANCEL
    ok() {
      Pager.ajaxPost(
        Pager.pathType.restServices,
        Admin.CmdSetUsers_Type,
        Admin.CmdSetUsers_Create(null, null, null, _.map(_.flatten(_.map(this.comp_Admin,(it: CompanyAdmins) => it.Items), true),(it: CompanyAdminItem) => it.data)),
        () => Login.adjustMyData(true,() => LMStatus.gotoReturnUrl())
        );
    }
    cancel() { LMStatus.gotoReturnUrl(); }

    // COMP ADMIN
    comp_Admin: Array<CompanyAdmins>; //of CompanyAdmins

    refreshHtml() {
      Pager.renderTemplateEx('schoolCompAdminsItemsPlace', 'schoolCompAdminsItems', this);
    }

  }

  // COMP ADMIN
  class CompanyAdmins {
    constructor(public owner: CompAdmins, public Id: number, items: Admin.CompUserItem[]) {
      var self = this;
      //this.Title = _.find(Login.myData.Companies, (comp: Login.MyCompany) => comp.Id == Id).Title;
      this.Items = _.map(items,(it: Admin.CompUserItem) => new CompanyAdminItem(it));
      //this.compAdmin_del = (act: CompanyAdminItem) => { if (act.data.UserId == 0) self.Items.remove(act); else act.Deleted(!act.Deleted()); }
      this.compAdmin_del = (act: CompanyAdminItem) => { if (act.data.UserId == 0) { self.Items = _.without(self.Items, act); self.owner.refreshHtml(); } else act.Deleted(!act.Deleted()); }
      this.newEMail = validate.create(validate.types.email,(prop) => {
        prop.required = true;
        prop.customValidation = (email: string) => { return _.any(this.Items,(it: CompanyAdminItem) => it.data.EMail == email) ? CSLocalize('bd38a1ebc3f041779ffd7a5bcf34dfe8', 'User with this email already added') : null; };
      });
      this.newEMail_Add = () => {
        if (!validate.isPropsValid([this.newEMail])) return; var nu: CompanyAdminItem = new CompanyAdminItem({
          UserId: 0,
          Deleted: false,
          EMail: self.newEMail(),
          CompanyId: Id,
          Role: { Role: 0, HumanEvalatorInfos: null }
        }); this.Items.push(nu); self.owner.refreshHtml(); this.newEMail(null);
      };
    }
    //Title: string;
    Items: Array<CompanyAdminItem>; //of CompanyAdminItem
    compAdmin_del;
    newEMail: validate.ValidObservable<any>;
    newEMail_Add;
  }
  class CompanyAdminItem {
    constructor(public data: Admin.CompUserItem) {
      this.Deleted.subscribe(val => data.Deleted = val);
      this.options = [
        new CompanyAdminOption(this.data, LMComLib.CompRole.Keys),
        new CompanyAdminOption(this.data, LMComLib.CompRole.Products),
        new CompanyAdminOption(this.data, LMComLib.CompRole.Department),
        new CompanyAdminOption(this.data, LMComLib.CompRole.Results),
        new CompanyAdminOption(this.data, LMComLib.CompRole.Publisher),
        new CompanyAdminOption(this.data, LMComLib.CompRole.HumanEvalManager),
        //new CompanyAdminOption(this.data, LMComLib.CompRole.HumanEvalator),
      ];
    }
    Deleted = ko.observable<boolean>(false);
    options: Array<CompanyAdminOption>;
  }
  class CompanyAdminOption {
    constructor(public data: Admin.CompUserItem, role: LMComLib.CompRole) {
      this.checked((data.Role.Role & role) != 0);
      this.checked.subscribe(r => data.Role.Role = r ? data.Role.Role | role : data.Role.Role & ~role);
      this.title = roleTranslation[role]();
    }
    checked = ko.observable<boolean>(false);
    title: string;
  }

  Pager.registerAppLocator(appId, compAdminsTypeName,(urlParts, completed) => completed(new CompAdmins(urlParts)));
}

