namespace common {
  export interface IGlobalCtx {
    valTest: {
    };
  }
}

namespace valTest {

  //*********************** DISPATCH MODULE definition
  interface IValTestClickAction extends common.IDispatchAction { }

  common.globalContext.ctx.valTest = {};
  var modName = 'valTest';

  class valTest extends flux.Module {
    constructor() {
      super(modName);
    }
    dispatchAction(type: string, action: common.IDispatchAction, complete: (action: common.IDispatchAction) => void) {
      var old = store.getState();
      switch (type) {
        case 'click':
          alert('click');
          if (complete) complete(action);
          break;
      }
    }
    static createAppClickAction(): IValTestClickAction { return { type: modName + '.click' }; }
  }

  //************* VIEW
  export class ValTest extends flux.RootComponent<IValTestProps, IValTestStates>{
    render() {
      return <div>
        <div onClick={() => flux.trigger(valTest.createAppClickAction()) }>Click</div>
        </div >;
    }
  };
  interface IValTestProps extends flux.IProps<IValTestStates> { }
  interface IValTestStates extends IFreezerState<IValTestStates> {  }


  //************* WHOLE APP
  var store = new flux.Flux<IValTestStates>([new valTest()], {
  })

  ReactDOM.render(
    <ValTest initState={store.getState() }></ValTest>,
    document.getElementById('app')
  );
}