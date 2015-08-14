/// <reference path="../JsLib/jsd/jquery.d.ts" />
/// <reference path="../JsLib/jsd/knockout.d.ts" />
/// <reference path="../JsLib/jsd/jsrender.d.ts" />
/// <reference path="../JsLib/js/ModelBase.ts" />
/// <reference path="../JsLib/js/OAuth.ts" />
/// <reference path="../JsLib/js/Validate.ts" />
/// <reference path="Model.ts" />

module Login {

  export class ChangePassworModel extends loginMode {
    constructor(type: string) {
      super(type);
      this.viewModel = [
        validate.password(this.oldPassword, 1, "oldPassword", c_oldPassword()),
        validate.password(this.password, 1, "password", c_newPassword()),
        validate.confirmPsw(this.confirmPsw, this.password)];
    }

    update(completed: () => void): void {
      completed();
    }

    oldPassword = ko.observable<string>("");
    password = ko.observable<string>("");
    confirmPsw = ko.observable<string>("");
    button = ko.observable(Pager.ButtonType.okCancel);

    doOK() {
      if (this.button() == Pager.ButtonType.ok) this.cancel();
      else {
        LMStatus.getCookie();
        Pager.ajaxGet(
          Pager.pathType.restServices,
          CmdChangePassword_Type,
          LMStatus.createCmd<CmdChangePassword>(r => { r.oldPassword = this.oldPassword(); r.newPassword = this.password(); r.lmcomId = LMStatus.Cookie.id }),
          //CmdChangePassword_Create(this.oldPassword(), this.password(), LMStatus.Cookie.id),
          () => {
            this.success(CSLocalize('4ec7f9623a684f708844bce43ad51d26', 'Password changed successfully'));
            this.button(Pager.ButtonType.ok);
          }
          ,
          (errId: CmdLmLoginError, errMsg: string) => {
            switch (errId) {
              case CmdLmLoginError.passwordNotExists:
                this.error(CSLocalize('150a40688a494a72a11b26081b46e515', 'The e-mail address was not found in the database.'));
                break;
              default:
                Logger.error('ChangePasswor.ChangePassworModel.doOK', '', errMsg);
                this.error(errMsg);
                break;
            }
          }
          );
      }
    }

    cancel() { location.href = "#" + Login.pageProfile; }

  }

}


