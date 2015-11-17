//******************* PersistTest aplikace
//Hiearchie Web (webApp) -> aplikace -> moduly -> akce, komponenty

namespace config {
  export interface IData {
    persistTest?: { //konfigurace aplikace
    };
  }
  cfg.data.persistTest = {} as any;
}

namespace uiRouter {
  export interface INamedState {
    persistTest: { //pojmenovane uiRouter.State's aplikace
      default: uiRouter.State<persistTest.IPersistTestModulePar>; //uiRouter.State hlavni stranky aplikace
    }
  };
  namedState.persistTest = {} as any;
}

namespace flux {
  export interface IWebState {
    persistTest?: {
      persistTestModuleState: persistTest.IPersistTestState; //cast globalniho flux.IFluxState, patrici aplikaci
    }
  }
}

namespace persistTest {
  export interface IPersistTestModulePar extends uiRouter.IStatePar { id: number; opt1: string; } //route PAR pro PersistTestModule

  //*********************** DISPATCH MODULE definition
  interface IPersistTestClickAction extends flux.IAction { }

  class persistTest extends flux.Module {
    constructor() {
      super(persistTest.moduleId);
    }
    dispatchAction(action: flux.IAction, complete: (action: flux.IAction) => void) {
      switch (action.actionId) {
        case uiRouter.routerActionId:
          layout.changeLayout(action, persistTest.plDefaultContentId);
          break;
        case 'click':
          alert('click');
          break;
      }
      if (complete) complete(action);
    }
    static moduleId = 'persistTest';
    static plDefaultContentId = persistTest.moduleId + '/default';
    static createAppClickAction(): IPersistTestClickAction { return { moduleId: persistTest.moduleId, actionId: 'click' }; }
  }

  //************* VIEW
  export class PersistTest extends flux.SmartComponent<IPersistTestProps, IPersistTestState>{
    render() {
      super.render();
      return <div>
        <div onClick={() => flux.trigger(persistTest.createAppClickAction()) }>Click</div>
        </div>;
    }
  };
  export interface IPersistTestState extends flux.ISmartState { }
  interface IPersistTestProps extends flux.ISmartProps<IPersistTestState> { }

  //************* WHOLE APP
  //** inicializace aplikace
  config.initApp();

  //** definice DISPATCH modulu
  new persistTest();

  //** ROUTE configuration
  export var namedState = uiRouter.namedState.persistTest; //pojmenovane stavy
  uiRouter.init(
    namedState.default = new uiRouter.State<IPersistTestModulePar>(persistTest.moduleId, '/persistTest-home')
  );
  uiRouter.setDefault<IPersistTestModulePar>(namedState.default, { id: 1, opt1: '' });
  setTimeout(() => uiRouter.listenHashChange());

  //** SCENE configuration
  layout.setScenePlaceRender(layout.defaultScenePlaceId, persistTest.plDefaultContentId, parent => <PersistTest initState={flux.getState().persistTest } parent={parent} id='PersistTest.persistTest'/>);

  var Header: React.StatelessComponent<{ name: string }> = (p, ctx) => <h3>{p.name}</h3>;

  //** STATE initialization
  flux.initWebState(
    document.getElementById('app'),
    {
      data: {
        persistTest: { persistTestModuleState: {} },
        layout: {}
      }
    },
    (web) => <layout.Scene initState={layout.sceneState() } parent={web} id='layout.Scene' cases={{
      [layout.defaultSceneId]: parent => <div>
        {Header({ name:'Stateless function call'})}
        <layout.ScenePlace initState={layout.scenePlaceState() } parent={parent} id='layout.ScenePlace'/>
        <div>PersistTest Footer</div>
        </div>
    }}/>
  );
}