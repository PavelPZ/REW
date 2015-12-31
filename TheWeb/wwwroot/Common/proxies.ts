namespace proxies {
  export var invoke: (url: string, type: string, queryPars: Object, body: string, completed, error: ajax.TError) => void;

  export namespace email {
    export function Send (msgstr: string, completed: () => void, error?: ajax.TError): void {
      invoke('/api/email/send', 'POST', null, msgstr, completed, error);
    }
  }

  export namespace testing {
    export function ResetServerData (email: string, completed: () => void, error?: ajax.TError): void {
      invoke('/api/testing/resetserverdata', 'GET', { email: email }, null, completed, error);
    }
    export function SaveTestPlaylist (json: string, completed: () => void, error?: ajax.TError): void {
      invoke('/api/testing/savetestplaylist', 'POST', null, json, completed, error);
    }
  }

  export namespace auth {
    export function Login (email: string, psw: string, completed: (res: {  email: string;  firstName: string;  lastName: string;  result: ServiceResult;  }) => void, error?: ajax.TError): void {
      invoke('/api/auth/login', 'GET', { email: email, psw: psw }, null, completed, error);
    }
    export function Register (email: string, psw: string, firstname: string, lastname: string, confirmid: string, completed: (res: ServiceResult) => void, error?: ajax.TError): void {
      invoke('/api/auth/register', 'GET', { email: email, psw: psw, firstname: firstname, lastname: lastname, confirmid: confirmid }, null, completed, error);
    }
    export function ConfirmRegistration (confirmid: string, completed: (res: {  email: string;  firstName: string;  lastName: string;  result: ServiceResult;  }) => void, error?: ajax.TError): void {
      invoke('/api/auth/confirmregistration', 'GET', { confirmid: confirmid }, null, completed, error);
    }
    export function ChangeProfile (email: string, firstname: string, lastname: string, completed: (res: ServiceResult) => void, error?: ajax.TError): void {
      invoke('/api/auth/changeprofile', 'GET', { email: email, firstname: firstname, lastname: lastname }, null, completed, error);
    }
    export function ChangePassword (email: string, oldpsw: string, newpsw: string, completed: (res: ServiceResult) => void, error?: ajax.TError): void {
      invoke('/api/auth/changepassword', 'GET', { email: email, oldpsw: oldpsw, newpsw: newpsw }, null, completed, error);
    }
    export function ForgotPassword (email: string, confirmid: string, completed: (res: ServiceResult) => void, error?: ajax.TError): void {
      invoke('/api/auth/forgotpassword', 'GET', { email: email, confirmid: confirmid }, null, completed, error);
    }
    export function ConfirmForgotPassword (confirmid: string, newpsw: string, completed: (res: {  email: string;  firstName: string;  lastName: string;  result: ServiceResult;  }) => void, error?: ajax.TError): void {
      invoke('/api/auth/confirmforgotpassword', 'GET', { confirmid: confirmid, newpsw: newpsw }, null, completed, error);
    }
    export function oAuthNotify (email: string, firstname: string, lastname: string, provider: servConfig.oAuthProviders, providerid: string, completed: () => void, error?: ajax.TError): void {
      invoke('/api/auth/oauthnotify', 'GET', { email: email, firstname: firstname, lastname: lastname, provider: provider, providerid: providerid }, null, completed, error);
    }
export const enum ServiceResult {
  ok = 0,
  userAlreadyExists = 1,
  wrongEMail = 2,
  wrongPassword = 3,
  confirmExpired = 4,
  alreadyConfirmed = 5,
}

  }

}
