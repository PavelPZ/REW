namespace config {
  export interface IData {
    login: {
    };
  }
}
config.cfg.data.login = {};

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
}
uiRouter.namedState.login = {} as any;

namespace login {
  //***** ROUTE init
  var namedState = uiRouter.namedState.login; //pojmenovane stavy

  uiRouter.init(
    namedState.index = new uiRouter.State(moduleLogin.prefix, '/login',
      namedState.login = new uiRouter.State('login', '/login').setActionType(moduleLMLogin.prefix),
      namedState.register = new uiRouter.State('register', '/register'),
      namedState.registered = new uiRouter.State('registered', '/registered'),
      namedState.profile = new uiRouter.State('profile', '/profile'),
      namedState.pswChange = new uiRouter.State('pswChange', '/psw-change'),
      namedState.pswChanged = new uiRouter.State('pswChanged', '/psw-changed')
    ).setActionType(moduleIndex.prefix) //login.index
  );
  //uiRouter.setDefault(namedState.index, {});

  //*********************** DISPATCH MODULE definition
  //root login module
  export class moduleLogin extends flux.Module {
    static prefix = 'login';
    constructor() {
      super(moduleLogin.prefix);
      this.childs = [ //registrace LM login stranek
        new moduleIndex(),
      ];
    }
  }

}