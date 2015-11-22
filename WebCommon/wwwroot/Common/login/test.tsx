//******************* LoginTest aplikace
//Hiearchie Web (webApp) -> aplikace -> moduly -> akce, komponenty

namespace config {
  export interface IData {
    loginTest?: { //konfigurace aplikace
    };
  }
  cfg.data.loginTest = {} as any;
}

namespace router { 
  export interface INamedRoutes {
    loginTest: { //pojmenovane uiRouter.State's aplikace 
      default: router.Route<loginTest.IDefaultPar>; //uiRouter.State hlavni stranky aplikace 
    }
  };
  named.loginTest = {} as any;
}

namespace flux {
  export interface IWebState {
    loginTest?: loginTest.ILoginSceneState; //cast globalniho flux.IFluxState, patrici aplikaci 
  }
}

namespace loginTest {
  //***** ROUTE init
  var namedState = router.named.loginTest; //pojmenovane stavy

  export interface IDefaultPar extends router.IPar { id: number; opt1: string; } //jeden z route PAR

  //*********************** DISPATCH MODULE definition
  interface ILoginTestClickAction extends flux.IAction { }

  class loginTest extends flux.Dispatcher {
    constructor() {
      super(loginTest.moduleId);
    }
    //dispatchAction(action: flux.IAction, complete: (action: flux.IAction) => void) {
    //  switch (action.actionId) {
    //    case router.routerActionId:
    //      throw 'todo';
    //      break;
    //    case 'click':
    //      alert('click');
    //      break;
    //  }
    //  if (complete) complete(action);
    //}
    static moduleId = 'loginTest';
    static createAppClickAction(): ILoginTestClickAction { return { moduleId: loginTest.moduleId, actionId: 'click' }; }   
  }

  //************* VIEWS

  export class LoginScene extends flux.SmartComponent<ILoginSceneProps, ILoginSceneState>{
    render() { return <div></div>; }
  };

  //************* VIEWS
  export class TestPage extends flux.SmartComponent<ILoginSceneProps, ILoginSceneState>{
    render() { return <div></div>; }
  };
  export interface ILoginSceneState extends flux.ISmartState { }
  interface ILoginSceneProps extends flux.ISmartProps<ILoginSceneState> { }

  //************* WHOLE APP
  //** inicializace aplikace
  config.initApp();

  new loginTest();
  flux.initWebState(
    document.getElementById('app'),
    {
      ids:[],
      data: {
        layoutTest: {}
      }
    },
    (p1) => <layout.Switcher initState={flux.getState().fluxTestSwitcher} parent={p1} id='layout.Switcher' cases={{
      default: (p3) => <TestPage initState={{ids:[]}} parent={p3} id='loginTest.TestPage'/>,
      login: (p2) => <LoginScene initState={{ ids: []}} parent={p2} id='loginTest.LoginScene'/>,
    }}/>
  );
  //(web) => <LoginTest initState={flux.getState().loginTest } parent={web} id='LoginTest.loginTest'/>
  router.init(
    namedState.default = new router.Route<IDefaultPar>(loginTest.moduleId, 'default', '/login-test-home')
  );
  router.setHome<IDefaultPar>(namedState.default, { id: 1, opt1: '' });

}