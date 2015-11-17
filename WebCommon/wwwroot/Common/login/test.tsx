//******************* LoginTest aplikace
//Hiearchie Web (webApp) -> aplikace -> moduly -> akce, komponenty

namespace config {
  export interface IData {
    loginTest?: { //konfigurace aplikace
    };
  }
  cfg.data.loginTest = {} as any;
}

namespace uiRouter { 
  export interface INamedState {
    loginTest: { //pojmenovane uiRouter.State's aplikace
      default: uiRouter.State<loginTest.IDefaultPar>; //uiRouter.State hlavni stranky aplikace
    }
  };
  namedState.loginTest = {} as any;
}

namespace flux {
  export interface IWebState {
    loginTest?: loginTest.ILoginSceneState; //cast globalniho flux.IFluxState, patrici aplikaci
  }
}

namespace loginTest {
  //***** ROUTE init
  var namedState = uiRouter.namedState.loginTest; //pojmenovane stavy

  export interface IDefaultPar extends uiRouter.IStatePar { id: number; opt1: string; } //jeden z route PAR

  //*********************** DISPATCH MODULE definition
  interface ILoginTestClickAction extends flux.IAction { }

  class loginTest extends flux.Module {
    constructor() {
      super(loginTest.moduleId);
    }
    dispatchAction(action: flux.IAction, complete: (action: flux.IAction) => void) {
      switch (action.actionId) {
        case uiRouter.routerActionId:
          throw 'todo';
          break;
        case 'click':
          alert('click');
          break;
      }
      if (complete) complete(action);
    }
    static moduleId = 'loginTest';
    static createAppClickAction(): ILoginTestClickAction { return { moduleId: loginTest.moduleId, actionId: 'click' }; }   
  }

  //************* VIEWS

  //var LoginScene = (parent) => {return <div></div>;};

  //const LoginScene = (props: { title: string }) => <h1>{props.title}</h1>;  

  export class LoginScene extends flux.SmartComponent<ILoginSceneProps, ILoginSceneState>{
    render() {
      return <div></div>;
    }
  };
  export interface ILoginSceneState extends flux.ISmartState { }
  interface ILoginSceneProps extends flux.ISmartProps<ILoginSceneState> { }

  //************* VIEWS
  export class TestPage extends flux.SmartComponent<ILoginSceneProps, ILoginSceneState>{
    render() {
      return <div></div>;
    }
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
      data: {
        layoutTest: {}
      }
    },
    (p1) => <layout.Switcher initState={flux.getState().fluxTestSwitcher} parent={p1} id='layout.Switcher' cases={{
      default: (p3) => <TestPage initState={{}} parent={p3} id='loginTest.TestPage'/>,
      login: (p2) => <LoginScene initState={{}} parent={p2} id='loginTest.LoginScene'/>,
    }}/>
  );
  //(web) => <LoginTest initState={flux.getState().loginTest } parent={web} id='LoginTest.loginTest'/>
  uiRouter.init(
    namedState.default = new uiRouter.State<IDefaultPar>(loginTest.moduleId, '/login-test-home')
  );
  uiRouter.setDefault<IDefaultPar>(namedState.default, { id: 1, opt1: '' });

}