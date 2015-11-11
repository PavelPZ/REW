namespace common {
  export interface IGlobalCtx {
    loginTest: {
    };
  }
}

namespace loginTest {

  //*********************** DISPATCH MODULE definition
  interface ILoginTestClickAction extends flux.IAction { }

  common.globalContext.ctx.loginTest = {};
  var modName = 'loginTest';

  class loginTest extends flux.Module {
    constructor() {
      super(modName);
    }
    dispatchAction(type: string, action: flux.IAction, complete: (action: flux.IAction) => void) {
      var old = store.getState();
      switch (type) {
        case 'click':
          alert('click');
          if (complete) complete(action);
          break;
      }
    }
    static createAppClickAction(): ILoginTestClickAction { return { type: modName + '.click' }; }
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