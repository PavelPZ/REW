namespace router {
  export interface INamedRoutes {
    login: {
      home: router.RouteType;
      login: router.RouteType;
      register: router.RouteType;
      confirmRegister: router.Route<login.IConfirmRoutePar>;
      forgotPsw: router.RouteType;
      confirmForgotPsw: router.Route<login.IConfirmRoutePar>;
      editProfile: router.RouteType;
      changePasssword: router.RouteType;
    }
  };
  named.login = {} as any;
}


namespace login {

  export var moduleId = 'login';

  export var namedRoute = router.named.login; //pojmenovane stavy
  router.init(
    new router.RouteType(moduleId, moduleId, '/login', { needsAuth: false, isAbstract:true },
      namedRoute.home = new router.Route(moduleId, 'r-home', '/home?{authReturnUrl}'),
      namedRoute.login = new router.RouteType(moduleId, 'r-login', '/login'),
      namedRoute.register = new router.RouteType(moduleId, 'r-register', '/register'),
      namedRoute.confirmRegister = new router.Route<IConfirmRoutePar>(moduleId, 'r-confirmRegister', '/confirmRegister'),
      namedRoute.forgotPsw = new router.RouteType(moduleId, 'r-forgotPsw', '/forgotPsw'),
      namedRoute.confirmForgotPsw = new router.Route<IConfirmRoutePar>(moduleId, 'r-confirmForgotPsw', '/confirmForgotPsw'),
      namedRoute.editProfile = new router.RouteType(moduleId, 'r-editProfile', '/editProfile', { needsAuth: true }),
      namedRoute.changePasssword = new router.RouteType(moduleId, 'r-changePasssword', '/changePasssword', { needsAuth: true })
    )
  );

  export interface IConfirmRoutePar extends router.IPar { confirmId: string; }

  //export function setHome<T extends router.IPar>(state: router.Route<T>, par: T) { homeUrl = { route: state, par: par } }
  //export function goHome() { router.navigUrl(homeUrl); }
  export function homeUrl(): router.IUrlType { return { route: namedRoute.home }; }

  export class Dispatcher extends flux.Dispatcher {
    constructor() { super(moduleId); }
    dispatchAction(action: flux.IAction, compl: utils.TCallback) {
      //if (router.tryDispatch(action, complete)) return; //dispath proveden primo v route.dispatch
      loger.doThrow(`Missing action dispatch: ${action.actionId}`);
    }
  }

  //*** LOGOUT
  //function doLogout() { auth.logout(); router.goHome(); }

}