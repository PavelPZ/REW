//******************* Xxx aplikace
//Hiearchie Web (webApp) -> aplikace -> moduly -> akce, komponenty

namespace config {
  export interface IData {
    xxx: { //konfigurace aplikace
    };
  }
  cfg.data.xxx = {};
}

namespace uiRouter {
  export interface INamedState {
    xxx: { //pojmenovane uiRouter.State's aplikace
      default: uiRouter.State<xxx.ITestPar>; //uiRouter.State hlavni stranky aplikace
    }
  };
  namedState.xxx = {} as any;
}

namespace flux {
  export interface IWebState {
    xxx?: xxx.IXxxState; //cast globalniho flux.IFluxState, patrici aplikaci
  }
}

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

  class xxx extends flux.Module {
    constructor() {
      super(xxx.moduleId);
    }
    dispatchAction(action: flux.IAction, complete: (action: flux.IAction) => void) {
      switch (action.actionId) {
        case 'click':
          alert('click');
          if (complete) complete(action);
          break;
      }
    }
    static moduleId = 'xxx';
    static createAppClickAction(): IXxxClickAction { return { moduleId: xxx.moduleId, actionId: 'click' }; }
  }

  //************* VIEW
  export class Xxx extends flux.SmartComponent<IXxxProps, IXxxState>{
    render() {
      return <div>
        <div onClick={() => flux.trigger(xxx.createAppClickAction()) }>Click</div>
        </div>;
    }
  };
  export interface IXxxState extends IFreezerState<IXxxState> { }
  interface IXxxProps extends flux.ISmartProps<IXxxState> { }

  //************* WHOLE APP
  new xxx();
  //flux.initWebState(
  //  { data: { xxx: {} } },
  //  document.getElementById('app'),
  //  () => <flux.Web initState={flux.getWebAppState() }><Xxx initState={flux.getState().xxx }></Xxx></flux.Web>
  //);

}