//******************* Xxx aplikace
//Hiearchie Web (webApp) -> aplikace -> moduly -> akce, komponenty

namespace config {
  export interface IData {
    xxx: { //konfigurace aplikace
    };
  }
  cfg.data.xxx = {} as any;
}

namespace uiRouter {
  export interface INamedState {
    xxx: { //pojmenovane uiRouter.State's aplikace
      default: uiRouter.State<xxx.IDefaultPar>; //uiRouter.State hlavni stranky aplikace
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
  export interface IDefaultPar extends uiRouter.IStatePar { id: number; opt1: string; } //jeden z route PAR

  //*********************** DISPATCH MODULE definition
  interface IXxxClickAction extends flux.IAction { }

  class xxx extends flux.Module {
    constructor() {
      super(xxx.moduleId);
    }
    dispatchAction(action: flux.IAction, complete: (action: flux.IAction) => void) {
      switch (action.actionId) {
        case uiRouter.routerActionId: layout.changeLayout(action); break;
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
      super.render();
      return <div>
        <div onClick={() => flux.trigger(xxx.createAppClickAction()) }>Click</div>
        </div>;
    }
  };
  export interface IXxxState extends flux.ISmartState { }
  interface IXxxProps extends flux.ISmartProps<IXxxState> { }

  //************* WHOLE APP
  //** definice DISPATCH modulu
  new xxx();

  //** ROUTE configuration
  export var namedState = uiRouter.namedState.xxx; //pojmenovane stavy
  uiRouter.init(
    namedState.default = new uiRouter.State<IDefaultPar>(xxx.moduleId, '/xxx-home')
  );
  uiRouter.setDefault<IDefaultPar>(namedState.default, { id: 1, opt1: '' });
  setTimeout(() => uiRouter.listenHashChange());

  //** SCENE configuration
  layout.setPlayGroundRender(xxx.moduleId, parent => <Xxx initState={flux.getState().xxx } parent={parent} id='Xxx.xxx'/>);

  //** STATE initialization
  flux.initWebState(
    document.getElementById('app'),
    {
      data: {
        xxx: {},
        layout: layout.defaultState
      }
    },
    (web) => <layout.Scene initState={layout.sceneState() } parent={web} id='layout.Scene' contents={{
      [layout.defaultSceneId]: parent => <div>
        <h1>Xxx Header</h1>
        <layout.Playground initState={layout.playGroundState() } parent={parent} id='layout.Playground'/>
        <div>Xxx Footer</div>
        </div>
    }}/>
  );
}