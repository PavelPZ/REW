﻿namespace config {
  export interface IData {
    xxx: {
    };
  }
}

namespace xxx {

  //*********************** DISPATCH MODULE definition
  interface IXxxClickAction extends flux.IAction { }

  config.cfg.data.xxx = {};
  var modName = 'xxx';

  class xxx extends flux.Module {
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
    static createAppClickAction(): IXxxClickAction { return { type: modName + '.click' }; }
  }

  //************* VIEW
  export class Xxx extends flux.RootComponent<IXxxProps, IXxxState>{
    render() {
      return <div>
        <div onClick={() => flux.trigger(xxx.createAppClickAction()) }>Click</div>
        </div>;
    }
  };
  interface IXxxState extends IFreezerState<IXxxState> {  }
  interface IXxxProps extends flux.ISmartProps<IXxxState> { }


  //************* WHOLE APP
  var store = new flux.Flux<IXxxState>([new xxx()], {
  })

  ReactDOM.render(
    <Xxx initState={store.getState() }></Xxx>,
    document.getElementById('app')
  );
}