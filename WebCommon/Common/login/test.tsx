namespace config {
  export interface IData {
    loginTest: {
    };
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
      var old = store.getState();
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
  export class LoginTest extends flux.RootComponent<ILoginTestProps, ILoginTestState>{
    render() {
      return <div>
        <div onClick={() => flux.trigger(loginTest.createAppClickAction()) }>Click</div>
        </div>;
    }
  };
  interface ILoginTestState extends IFreezerState<ILoginTestState> {  }
  interface ILoginTestProps extends flux.ISmartProps<ILoginTestState> { }


  //************* WHOLE APP
  var store = new flux.Flux<ILoginTestState>([new loginTest()], {
  })

  ReactDOM.render(
    <LoginTest initState={store.getState() }></LoginTest>,
    document.getElementById('app')
  );
}