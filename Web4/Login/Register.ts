
module Login {

  export class RegisterModel extends loginMode {
    constructor(type: string, public isEMail: boolean) {
      super(type);
      this.viewModel = isEMail ? [
        validate.email(this.email, true),
        validate.password(this.password, 1),
        validate.confirmPsw(this.confirmPsw, this.password),
        validate.empty(this.firstName, "firstName", c_firstName()),
        validate.minLen(this.lastName, 3, "lastName", c_lastName())
      ] : [
          validate.minLen(this.login, 3, "login", "Login"),
          validate.password(this.password, 1),
          validate.confirmPsw(this.confirmPsw, this.password),
          validate.empty(this.firstName, "firstName", c_firstName()),
          validate.minLen(this.lastName, 3, "lastName", c_lastName()),
          validate.email(this.loginEmail, false),
        ];
      this.viewModel.push(
      //validate.inputModel("department", this.department, validate.controlType.department) 
        );
    }

    email = ko.observable<string>("");
    login = ko.observable<string>("");
    loginEmail = ko.observable<string>("");
    password = ko.observable<string>("");
    firstName = ko.observable<string>("");
    lastName = ko.observable<string>("");
    confirmPsw = ko.observable<string>("");

    doOK() {
      this.error(null); this.success(null);
      var cook = <LMStatus.LMCookie>LMComLib.LMCookieJS_Create(0, 0,
        this.isEMail ? this.email() : null,
        this.isEMail ? null : this.login(),
        this.isEMail ? null : this.loginEmail(),
        this.isEMail ? LMComLib.OtherType.LANGMaster : LMComLib.OtherType.LANGMasterNoEMail,
        null,
        this.firstName(),
        this.lastName(),
        '',
        0, 0,
        null);
      Pager.ajaxGet(
        Pager.pathType.restServices,
        CmdRegister_Type,
        LMStatus.createCmd<CmdRegister>(r => { r.password = Utils.encryptStr(this.password()); r.Cookie = cook, r.subSite = LMComLib.SubDomains.com }),
        //CmdRegister_Create(Utils.encryptStr(this.password()), LMComLib.SubDomains.com, cook, 0),
        (res: number) => { //posli ev email
          if (this.isEMail) {
            var key = LowUtils.EncryptString(Utils.longToByteArray(res));
            var url = location.href.split('#')[0];
            url += url.indexOf('?') < 0 ? "?" : "&";
            url += "key=" + key + "#" + getHash(pageConfirmRegistration);
            var email: emailConfirm = <any>{
              From: null, //default
              To: this.email(),
              Cc: null,
              Subject: CSLocalize('d809fff52b9f4f5391ab889a0a1afe80', 'Creating of an account - confirmation'),
              emailId: "TEmailConfirmation",
              //url: Pager.path(Pager.pathType.login, "?key=" + key + "#" + new Url(pageConfirmRegistration).toString()),// "http://www.langmaster.com/lmcom/rew/Login/default.aspx#confirmRegistrationModel",
              isForgotPassword: false,
              Html: null,
              isAtt: false,
              attFile: null,
              attContent: null,
              attContentType: null,

              url: url,
              name: this.email(),
              password: this.password(),
            };
            EMailer.sendEMail(email,
              () => {
                this.success(CSLocalize('dd97d1b2919d451cbb43ee63091a147c', 'A confirmation e-mail has been sent to your e-mail address.'));
                testConfirmUrl = url;
              },
              (errId: number, errMsg: string) => alert(errMsg)
              );
          } else {
            cook.id = res;
            LMStatus.logged(cook, false);
          }
        }
        ,(errId: CmdLmLoginError, errMsg: string) => {
          switch (errId) {
            case CmdLmLoginError.userExist:
              this.error(CSLocalize('d60caf13057c46c2ba63f5cd361271e5', 'User name already exists'));
              break;
            default:
              Logger.error('Register.RegisterModel.doOK', '', errMsg);
              this.error(errMsg);
              break;
          }
        }
        );
    }

    cancel() { Pager.navigateToHash(getHash(pageLmLogin)); }
  }

  export var testConfirmUrl: string; //URL pro testovani

  interface emailConfirm extends LMComLib.CmdEMail {
    url: string;
    name: string;
    password: string;
  }

}


