namespace router {
  export interface INamedRoutes {
    login: {
      home: router.RouteType;
      login: router.RouteType;
      register: router.RouteType;
      confirmRegister: router.RouteType;
      forgotPsw: router.RouteType;
      confirmForgotPsw: router.RouteType;
      editProfile: router.RouteType;
    }
  };
  named.login = {} as any;
}


namespace login {

  export var moduleId = 'login';

  export var namedRoute = router.named.login; //pojmenovane stavy
  router.init(
    new router.RouteType(moduleId, moduleId, '/login', { needsAuth: false },
      namedRoute.home = new router.Route(moduleId, 'r-home', '/home?{authReturnUrl}'),
      namedRoute.login = new router.RouteType(moduleId, 'r-login', '/login'),
      namedRoute.register = new router.RouteType(moduleId, 'r-register', '/login'),
      namedRoute.confirmRegister = new router.RouteType(moduleId, 'r-confirmRegister', '/confirmRegister'),
      namedRoute.forgotPsw = new router.RouteType(moduleId, 'r-forgotPsw', '/forgotPsw'),
      namedRoute.confirmForgotPsw = new router.RouteType(moduleId, 'r-confirmForgotPsw', '/confirmForgotPsw'),
      namedRoute.editProfile = new router.RouteType(moduleId, 'r-editProfile', '/editProfile', { needsAuth: true })
    )
  );

  export function setHome<T extends router.IPar>(state: router.Route<T>, par: T) { homeUrl = { route: state, par: par } }
  export function goHome() { router.gotoUrl(homeUrl); }
  var homeUrl: router.IUrl<any>;

  export class Dispatcher extends flux.Dispatcher {
    constructor() { super(moduleId); }
    dispatchAction(action: flux.IAction, compl: utils.TCallback) {
      //if (router.tryDispatch(action, complete)) return; //dispath proveden primo v route.dispatch
      throw `Missing action dispatch: ${action.actionId}`;
    }
  }

  //*** LOGOUT
  //function doLogout() { auth.logout(); router.goHome(); }

}