namespace config {
  export interface IData {
    login?: {
    };
  }
  cfg.data.login = {};
}

namespace uiRouter {
  export interface INamedState {
    login: {
      index: uiRouter.StateDef;
      login: uiRouter.StateDef;
      register: uiRouter.StateDef;
      registered: uiRouter.StateDef;
      profile: uiRouter.StateDef;
      pswChange: uiRouter.StateDef;
      pswChanged: uiRouter.StateDef;
    }
  };
  namedState.login = <any>{};
}

namespace flux {
  export interface IWebState {
    login?: login.IRootState;
  }
}


namespace login {


  //***** ROUTE init
  const namedState = uiRouter.namedState.login; //pojmenovane stavy
  uiRouter.init(
    namedState.index = new uiRouter.State(moduleIndex.moduleId, '/login',
      namedState.login = new uiRouter.State(moduleLMLogin.moduleId, '/login'),
      namedState.register = new uiRouter.State('??', '/register'),
      namedState.registered = new uiRouter.State('??', '/registered'),
      namedState.profile = new uiRouter.State('??', '/profile'),
      namedState.pswChange = new uiRouter.State('??', '/psw-change'),
      namedState.pswChanged = new uiRouter.State('??', '/psw-changed')
    )
  ); 

  export interface IRootState {
    user?: IUser
  }
  export interface IUser {
    email: string;
    firstName: string;
    lastName: string;
  }
  
}