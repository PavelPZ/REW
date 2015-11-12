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
    namedState.index = new uiRouter.State(moduleLogin.moduleId, '/login',
      namedState.login = new uiRouter.State(moduleLMLogin.moduleId, '/login'),
      namedState.register = new uiRouter.State('??', '/register'),
      namedState.registered = new uiRouter.State('??', '/registered'),
      namedState.profile = new uiRouter.State('??', '/profile'),
      namedState.pswChange = new uiRouter.State('??', '/psw-change'),
      namedState.pswChanged = new uiRouter.State('??', '/psw-changed')
    )
  );
  //uiRouter.setDefault(namedState.index, {});

  //*********************** DISPATCH MODULE definition
  //root login module
  export class moduleLogin extends flux.Module {
    static moduleId = 'login';
    constructor() {
      super(moduleLogin.moduleId);
      this.childs = [ //registrace LM login stranek
        new moduleIndex(),
      ];
    }
  }

}