namespace router {
  export interface INamedRoutes {
    login: {
      root: router.RouteType;
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
    namedRoute.root = new router.RouteType(moduleId, moduleId, '/login', { needsAuth: false, isAbstract: true },
      namedRoute.home = new router.Route(moduleId, 'r-home', '/home?{authReturnUrl}'),
      //namedRoute.login = new router.RouteType(moduleId, 'r-login', '/login'),
      //namedRoute.register = new router.RouteType(moduleId, 'r-register', '/register', loginReg.finishRouteState()),
      //namedRoute.confirmRegister = new router.Route<IConfirmRoutePar>(moduleId, 'r-confirmRegister', '/confirmRegister?{confirmId}'),
      namedRoute.forgotPsw = new router.RouteType(moduleId, 'r-forgotPsw', '/forgotPsw'),
      namedRoute.confirmForgotPsw = new router.Route<IConfirmRoutePar>(moduleId, 'r-confirmForgotPsw', '/confirmForgotPsw'),
      namedRoute.editProfile = new router.RouteType(moduleId, 'r-editProfile', '/editProfile', { needsAuth: true }),
      namedRoute.changePasssword = new router.RouteType(moduleId, 'r-changePasssword', '/changePasssword', { needsAuth: true })
    )
  );

  export interface IConfirmRoutePar extends router.IPar { confirmId: string; }

  export function homeUrl(): router.IUrlType { return { route: namedRoute.home }; }

  //*** LOGOUT
  //function doLogout() { auth.logout(); router.goHome(); }

}