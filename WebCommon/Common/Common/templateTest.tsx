namespace common {
  export interface IGlobalCtx {
    xxx: {
    };
  }
}

namespace xxx {

  //*********************** DISPATCH MODULE definition
  interface IXxxClickAction extends common.IDispatchAction { }

  common.globalContext.ctx.xxx = {};
  var modName = 'xxx';

  class xxx extends flux.Module {
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
    static createAppClickAction(): IXxxClickAction { return { type: modName + '.click' }; }
  }

  //************* VIEW
  export class Xxx extends flux.RootComponent<IXxxProps, IXxxStates>{
    render() {
      return <div>
        <div onClick={() => flux.trigger(xxx.createAppClickAction()) }>Click</div>
        </div >;
    }
  };
  interface IXxxProps extends flux.IProps<IXxxStates> { }
  interface IXxxStates extends IFreezerState<IXxxStates> {  }


  //************* WHOLE APP
  var store = new flux.Flux<IXxxStates>([new xxx()], {
  })

  ReactDOM.render(
    <Xxx initState={store.getState() }></Xxx>,
    document.getElementById('app')
  );
}