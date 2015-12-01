namespace proxies {
  export var invoke: (url: string, type: string, queryPars: Object, body: string, completed: (res) => void) => void;

  export namespace email {
    export function Send(msgstr: string, completed: () => void): void {
      invoke('/api/email/send', 'POST', null, JSON.stringify(msgstr), completed);
    }
  }

  export namespace auth {
    export function Login(email: string, psw: string, completed: (res: { email: string; firstName: string; lastName: string; result: ServiceResult; }) => void): void {
      invoke('/api/auth/login', 'GET', { email: email, psw: psw }, null, completed);
    }
    export function Register(email: string, psw: string, firstname: string, lastname: string, confirmid: string, completed: () => void): void {
      invoke('/api/auth/register', 'GET', { email: email, psw: psw, firstname: firstname, lastname: lastname, confirmid: confirmid }, null, completed);
    }
    export function ConfirmRegistration(confirmid: string, completed: (res: { email: string; firstName: string; lastName: string; result: ServiceResult; }) => void): void {
      invoke('/api/auth/confirmregistration', 'GET', { confirmid: confirmid }, null, completed);
    }
    export function ChangeProfile(email: string, firstname: string, lastname: string, completed: (res: ServiceResult) => void): void {
      invoke('/api/auth/changeprofile', 'GET', { email: email, firstname: firstname, lastname: lastname }, null, completed);
    }
    export function ChangePassword(email: string, oldpsw: string, newpsw: string, completed: (res: ServiceResult) => void): void {
      invoke('/api/auth/changepassword', 'GET', { email: email, oldpsw: oldpsw, newpsw: newpsw }, null, completed);
    }
    export function ForgotPassword(email: string, confirmid: string, completed: (res: ServiceResult) => void): void {
      invoke('/api/auth/forgotpassword', 'GET', { email: email, confirmid: confirmid }, null, completed);
    }
    export function ConfirmForgotPassword(confirmid: string, newpsw: string, completed: (res: { email: string; firstName: string; lastName: string; result: ServiceResult; }) => void): void {
      invoke('/api/auth/confirmforgotpassword', 'GET', { confirmid: confirmid, newpsw: newpsw }, null, completed);
    }
    export function oAuthNotify(email: string, firstname: string, lastname: string, provider: servConfig.oAuthProviders, providerid: string, completed: () => void): void {
      invoke('/api/auth/oauthnotify', 'GET', { email: email, firstname: firstname, lastname: lastname, provider: provider, providerid: providerid }, null, completed);
    }
    export const enum ServiceResult {
      ok = 0,
      wrongEMail = 1,
      wrongPassword = 2,
      confirmExpired = 3,
      alreadyConfirmed = 4, 
    }

  }

}
