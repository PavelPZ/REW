/// <reference path="../JsLib/jsd/jquery.d.ts" />
/// <reference path="../JsLib/jsd/knockout.d.ts" />
/// <reference path="../JsLib/jsd/jsrender.d.ts" />
/// <reference path="../JsLib/js/ModelBase.ts" />
/// <reference path="../JsLib/js/OAuth.ts" />
/// <reference path="../JsLib/js/Validate.ts" />
/// <reference path="Model.ts" />
/// <reference path="Register.ts" />

module Login {

  export class ProfileModel extends loginMode {
    constructor(type: string) {
      super(type);
      LMStatus.getCookie();
      if (LMStatus.isLMComCookie()) {
        this.viewModel = [
          validate.empty(this.firstName, "firstName", c_firstName()),
          validate.minLen(this.lastName, 3, "lastName", c_lastName()),
          //department,
        ];
        this.firstName(LMStatus.Cookie.FirstName);
        this.lastName(LMStatus.Cookie.LastName);
        if (LMStatus.Cookie.Type == LMComLib.OtherType.LANGMasterNoEMail) {
          this.viewModel.push(validate.email(this.email, false));
          this.email(LMStatus.Cookie.LoginEMail);
        }
      } else
        this.viewModel = [];
    }

    update(completed: () => void): void {
      completed();
    }

    email = ko.observable<string>(null);
    firstName = ko.observable<string>("");
    lastName = ko.observable<string>("");
    button = ko.observable<Pager.ButtonType>(Pager.ButtonType.okCancel);

    doOK() {
      if (this.button() == Pager.ButtonType.ok) this.cancel();
      else {
        LMStatus.getCookie();
        LMStatus.Cookie.FirstName = this.firstName();
        LMStatus.Cookie.LastName = this.lastName();
        LMStatus.Cookie.LoginEMail = this.email();
        LMStatus.setCookie(LMStatus.Cookie);
        Pager.ajaxGet(
          Pager.pathType.restServices,
          CmdProfile_Type,
          LMStatus.createCmd<CmdProfile>(r => { r.Cookie = LMStatus.Cookie, r.lmcomId = LMStatus.Cookie.id }),
          //CmdProfile_Create(LMStatus.Cookie, LMStatus.Cookie.id),
          () => {
            this.success(CSLocalize('e56e6bad75e54dea9191cab418eda74d', 'Success'));
            this.button(Pager.ButtonType.ok);
          }
          ,
          () => this.error(CSLocalize('bb6463807fdf453191f0315f034f01e0', 'Wrong old password'))
          )
      }
    }

    cancel() {
      //throw "My.schoolMy.Model.licKeyOK";
      LMStatus.gotoReturnUrl();
    }

  }

}


