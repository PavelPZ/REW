namespace router {
  export interface INamedRoutes {
    login: { //pojmenovane uiRouter.State's aplikace
      root: router.Route<router.IPar>; 
    }
  };
  named.layoutTest = {} as any;
}


namespace login {

  export var namedState = router.named.login; //pojmenovane stavy
  router.init(
    namedState.root = new router.Route<router.IPar>(moduleId, '/login', 'root',
      new router.Route<ILoginPar>(moduleId, 'login', '/login'),
      new router.Route<ILoginPar>(moduleId, 'lmlogin', '/lm-login')
    )
  );


  export function setHome<T extends router.IPar>(state: router.Route<T>, par: T) { homeUrl = { state: state, par: par } } 
  export function goHome() { router.navigate(homeUrl); }
  var homeUrl: router.IUrl<any>;

  export class Dispatcher extends flux.Dispatcher {
    constructor() { super(moduleId); }
    dispatchAction(action: flux.IAction, complete: (action: flux.IAction) => void) {
      switch (action.actionId) {
        //case 'login': doLogin(action as ILoginAction); break;
        case 'logout': doLogout(action as ILogoutAction); break;
        case 'editProfile': doEditProfile(action as IEditProfileAction); break;
      }
    }
  }
  var moduleId = 'login';

  //*** LOGIN
  export interface ILoginPar extends router.IPar { x: number; }
  export type ILoginAction = router.IAction<ILoginPar>;
  function doLogin(act: ILoginPar) {
    if (auth.isLogged()) return;
  }

  //*** LOGOUT
  export function logoutAction(): flux.IAction { return { moduleId: moduleId, actionId: 'logout' }; }
  export interface ILogoutAction extends flux.IAction { }
  function doLogout(act: ILogoutAction) {
    if (!auth.isLogged()) return;
  }

  //*** EDIT PROFILE
  export function editProfileAction(): flux.IAction { return { moduleId: moduleId, actionId: 'editProfile' }; }
  export interface IEditProfileAction extends flux.IAction { }
  function doEditProfile(act: IEditProfileAction) { }
}