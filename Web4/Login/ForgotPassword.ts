/// <reference path="../JsLib/jsd/jquery.d.ts" />
/// <reference path="../JsLib/jsd/knockout.d.ts" />
/// <reference path="../JsLib/jsd/jsrender.d.ts" />
/// <reference path="../JsLib/js/ModelBase.ts" />
/// <reference path="../JsLib/js/OAuth.ts" />
/// <reference path="../JsLib/js/Validate.ts" />
/// <reference path="Model.ts" />

module Login {

  export class ForgotPasswordModel extends loginMode { 

    update(completed: () => void ): void {
      this.viewModel = [validate.email(this.email, true)];
      completed();
    }

    email = ko.observable<string>("");

    doOK() {
      var email: emailForgotPassword = {
        From: null, //default
        To: this.email(),
        Cc: null,
        Subject: CSLocalize('3c2e4788779446b5ac07319284964624', 'Sending of the forgotten password'),
        emailId: "TEmailForgotPassword",
        name: this.email(),
        isForgotPassword: true,

        Html: null,
        isAtt: false,
        attFile: null,
        attContent: null,
        attContentType: null,
      };
      EMailer.sendEMail(email,
        () => {
          this.success(CSLocalize('5ccd166083844fd49a180596afdfb330', 'The password has been sent to your e-mail address.'));
        },
        (errId: number, errMsg: string) => {
          switch (errId) {
            case CmdLmLoginError.cannotFindUser:
              this.error("The e-mail address was not found in the database.");
              break;
            default:
              break;
              alert(errMsg);
          }
        });
    }

    cancel() { Pager.navigateToHash(getHash(pageLmLogin)); }

  }
  interface emailForgotPassword extends LMComLib.CmdEMail {
    name: string;
  }

}


