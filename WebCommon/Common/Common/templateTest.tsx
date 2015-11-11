namespace config {
  export interface IData {
    xxx: {
    };
  }
}
config.cfg.data.xxx = {};

namespace uiRouter {
  export interface INamedState {
    xxx: {
      default: uiRouter.State<xxx.ITestPar>;
    }
  };
}
uiRouter.namedState.xxx = {} as any;

namespace xxx {
  //***** ROUTE init
  var namedState = uiRouter.namedState.xxx; //pojmenovane stavy

  export interface ITestPar extends uiRouter.IStatePar { id: number; opt1: string; } //jeden z route PAR
  uiRouter.init(
    //new uiRouter.State('login', '/login',
    //  new uiRouter.State('login', '/login'),
    //  new uiRouter.State('select', '/select')
    //),
    namedState.default = new uiRouter.State<ITestPar>('xxx', '/user/:id?opt1').finishStatePar(st => { st.id = utils.toNumber(st.id); })
  );
  uiRouter.setDefault<ITestPar>(namedState.default, { id: 1, opt1: '' });

  //*********************** DISPATCH MODULE definition
  interface IXxxClickAction extends flux.IAction { }

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