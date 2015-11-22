namespace flux {
  export interface IWebState {
    auth?: auth.IUser;
  }
}

namespace auth {
  export interface IProfile { //rozsirovatelny interface s profile informacemi
  }
  export interface IUser extends flux.ISmartState {
    email: string;
    firstName: string;
    lastName: string;
    profile: IProfile; //dalsi profile informace
  }
  export function isLogged(): boolean { return !!flux.getState().auth }
  export function onLogged(email: string, firstName: string, lastName: string) {
  }
  export function login() {
  }
  export function logout() {
  }
}