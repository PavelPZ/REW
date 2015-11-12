namespace config {
  export interface IData {
    loginTest: {
    };
  }
}

namespace flux {
  export interface IWebState {
    loginTest?: loginTest.ILoginTestState;
  }
}

namespace loginTest {

  //*********************** DISPATCH MODULE definition
  interface ILoginTestClickAction extends flux.IAction { }

  config.cfg.data.loginTest = {};

  class loginTest extends flux.Module {
    constructor() {
      super(loginTest.moduleId);
    }
    dispatchAction(action: flux.IAction, complete: (action: flux.IAction) => void) {
      var old = flux.getState();
      switch (action.actionId) {
        case 'click':
          alert('click');
          if (complete) complete(action);
          break;
      }
    }
    static createAppClickAction(): ILoginTestClickAction { return { moduleId: loginTest.moduleId, actionId: 'click' }; }
    static moduleId = 'login.loginTest';
  }

  //************* VIEW
  export class LoginTest extends flux.SmartComponent<ILoginTestProps, ILoginTestState>{
    render() {
      return <div>
        <div onClick={() => flux.trigger(loginTest.createAppClickAction()) }>Click</div>
        </div>;
    }
  };
  export interface ILoginTestState extends IFreezerState<ILoginTestState> { }
  interface ILoginTestProps extends flux.ISmartProps<ILoginTestState> { }


  //************* WHOLE APP
  new loginTest();
  flux.initWebState(
    { loginTest: {} },
    () => ReactDOM.render(
      <flux.Web initState={flux.getState() }><LoginTest initState={flux.getState().loginTest}></LoginTest></flux.Web>,
      document.getElementById('app')
    )
  );
}