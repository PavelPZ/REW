module Login {

  export class LMLoginModel extends loginMode {
    constructor(type: string, public isEMail: boolean) {
      super(type);
      this.viewModel = [isEMail ? validate.email(this.email, true) : validate.minLen(this.login, 3, "login", "Login"), validate.password(this.password, 1)];
    }

    login = ko.observable<string>(""); 
    email = ko.observable<string>("");
    password = ko.observable<string>("");

    gotoRegister() { Pager.navigateToHash(getHash(this.isEMail ? pageRegister : pageRegisterNoEMail)); }

    doOK() {
      this.error(null);
      login(this.isEMail, this.email(), this.login(), this.password(), null,
        cookie => LMStatus.logged(cookie, false)
        ,(errId, errMsg) => {
          switch (errId) {
            case CmdLmLoginError.cannotFindUser:
              this.error(CSLocalize('f14d4f45b2184ec2b114ae702e34b8d0', 'Wrong password or login name was not found in the database.'));
              break;
            default:
              Logger.error('LMLogin.LMLoginModel.doOK', '', errMsg);
              this.error(errMsg);
              break;
          }
        }
        );
    }

    cancel() { Pager.navigateToHash( getHash(pageLogin)); }

  }

  export function login(isEMail: boolean, email: string, login: string, password: string, ticket:string, completed: (cookie: LMComLib.LMCookieJS) => void, onError: (errId: CmdLmLoginError, errMsg: string) => void) {
    password = _.isEmpty(password) ? null : Utils.encryptStr(password);
    Pager.ajaxGet(
      Pager.pathType.restServices,
      CmdLmLogin_Type,
      CmdLmLogin_Create(
        isEMail ? null : login,
        isEMail ? email : null,
        password, null, ticket),
      (res: CmdProfile) => completed(res.Cookie), //dej usera do cookie a proved redirekt
      onError
      );
  }
}
