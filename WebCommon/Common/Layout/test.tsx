//******************* LayoutTest aplikace
//Hiearchie Web (webApp) -> aplikace -> moduly -> akce, komponenty

namespace config {
  export interface IData {
    layoutTest: { //konfigurace aplikace
    };
  }
  cfg.data.layoutTest = {} as any;
}

namespace uiRouter {
  export interface INamedState {
    layoutTest: { //pojmenovane uiRouter.State's aplikace
      default: uiRouter.State<layoutTest.IDefaultPar>; //uiRouter.State hlavni stranky aplikace
    }
  };
  namedState.layoutTest = {} as any;
}

namespace flux {
  export interface IWebState {
    layoutTest?: layoutTest.ILayoutTestState; //cast globalniho flux.IFluxState, patrici aplikaci
  }
}

namespace layoutTest {
  export interface IDefaultPar extends uiRouter.IStatePar { id: number; opt1: string; } //jeden z route PAR

  //*********************** DISPATCH MODULE definition
  interface ILayoutTestClickAction extends flux.IAction { }

  class layoutTest extends flux.Module {
    constructor() {
      super(layoutTest.moduleId);
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
    static moduleId = 'layoutTest';
    static createAppClickAction(): ILayoutTestClickAction { return { moduleId: layoutTest.moduleId, actionId: 'click' }; }
  }

  //************* VIEW
  export class LayoutTest extends flux.SmartComponent<ILayoutTestProps, ILayoutTestState>{
    render() {
      super.render();
      return <div>
        <div onClick={() => flux.trigger(layoutTest.createAppClickAction()) }>Click</div>
        </div>;
    }
  };
  export interface ILayoutTestState extends flux.ISmartState { }
  interface ILayoutTestProps extends flux.ISmartProps<ILayoutTestState> { }

  //************* WHOLE APP
  //** definice DISPATCH modulu
  new layoutTest();

  //** ROUTE configuration
  export var namedState = uiRouter.namedState.layoutTest; //pojmenovane stavy
  uiRouter.init(
    namedState.default = new uiRouter.State<IDefaultPar>(layoutTest.moduleId, '/layoutTest-home')
  );
  uiRouter.setDefault<IDefaultPar>(namedState.default, { id: 1, opt1: '' });
  setTimeout(() => uiRouter.listenHashChange());

  //** SCENE configuration
  layout.setPlayGroundRender(layoutTest.moduleId, parent => <LayoutTest initState={flux.getState().layoutTest } parent={parent} id='LayoutTest.layoutTest'/>);

  //** STATE initialization
  flux.initWebState(
    document.getElementById('app'),
    {
      data: {
        layoutTest: {},
        layout: layout.defaultState
      }
    },
    (web) => <layout.Scene initState={layout.sceneState() } parent={web} id='layout.Scene' contents={{
      [layout.defaultSceneId]: parent => <div>
        <h1>LayoutTest Header</h1>
        <layout.Playground initState={layout.playGroundState() } parent={parent} id='layout.Playground'/>
        <div>LayoutTest Footer</div>
        </div>
    }}/>
  );
}