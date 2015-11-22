//namespace config {
//  export interface IData {
//    login?: {
//    };
//  }
//  cfg.data.login = { }; 
//}

//namespace router {
//  export interface INamedRoutes { 
//    login: {
//      index: router.RouteType;
//      login: router.RouteType;
//      register: router.RouteType;
//      registered: router.RouteType;
//      profile: router.RouteType;
//      pswChange: router.RouteType;
//      pswChanged: router.RouteType;
//    }
//  };
//  routes.login = <any>{};
//}

//namespace flux {
//  export interface IWebState {
//    login?: login.IRootState;
//  }
//}


//namespace login { 


//  //***** ROUTE init
//  const namedState = router.routes.login; //pojmenovane stavy
//  router.init(
//    namedState.index = new router.Route(moduleIndex.moduleId, '/login',
//      namedState.login = new router.Route(moduleLMLogin.moduleId, '/login'),
//      namedState.register = new router.Route('??', '/register'),
//      namedState.registered = new router.Route('??', '/registered'),
//      namedState.profile = new router.Route('??', '/profile'),
//      namedState.pswChange = new router.Route('??', '/psw-change'),
//      namedState.pswChanged = new router.Route('??', '/psw-changed')
//    )
//  ); 

//  export interface IRootState {
//    user?: IUser
//  }
//  export interface IUser {
//    email: string;
//    firstName: string;
//    lastName: string;
//  }
  
//}