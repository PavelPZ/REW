namespace flux {
  export interface IAppState { auth?: auth.IUser; }
}

namespace config {
  export interface IData { auth?: config.IInitProcConfig; }
  cfg.data.auth = {
    stateCreated: () => flux.getState().auth = { ids: [] }
  };
}

namespace auth {

  export interface IProfile { //rozsirovatelny interface s profile informacemi
  }
  export interface IUser extends flux.ISmartState {
    email?: string;
    firstName?: string;
    lastName?: string;
    profile?: IProfile; //dalsi profile informace
  }
  export function isLogged(): boolean { return !!flux.getState().auth.email; }
  export function onLogged(email: string, firstName: string, lastName: string) {
  }
  export function login() {
  }
  export function logout() {
  }
}