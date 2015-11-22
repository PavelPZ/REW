//******************* PersistTest aplikace
//Hiearchie Web (webApp) -> aplikace -> moduly -> akce, komponenty

namespace config {
  export interface IData {
    persistTest?: { //konfigurace aplikace
    };
  }
  cfg.data.persistTest = {} as any;
}

namespace router {
  export interface INamedRoutes {
    persistTest: { //pojmenovane uiRouter.State's aplikace
      default: router.Route<persistTest.IPersistTestModulePar>; //uiRouter.State hlavni stranky aplikace
    }
  };
  named.persistTest = {} as any;
}

namespace flux {
  export interface IAppState {
    persistTest?: persistTest.IPersistTestState //cast globalniho flux.IFluxState, patrici aplikaci
  }
}

namespace persistTest {
  export interface IPersistTestModulePar extends router.IPar { id: number; opt1: string; } //route PAR pro PersistTestModule

  //*********************** DISPATCH MODULE definition
  interface IPersistTestClickAction extends flux.IAction { }

  class persistTest extends flux.Dispatcher {
    constructor() {
      super(persistTest.moduleId);
    }
    dispatchAction(action: flux.IAction, complete: (action: flux.IAction) => void) {
      switch (action.actionId) {
        //case router.routerActionId:
        //  layout.changeScene(action, layout.sceneDefault, persistTest.plDefaultContentId);
        //  break;
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

  //** definice DISPATCH modulu
  new persistTest();

  //** ROUTE configuration
  export var namedState = router.named.persistTest; //pojmenovane stavy
  router.init(
    namedState.default = new router.Route<IPersistTestModulePar>(persistTest.moduleId, 'default', '/persistTest-home')
  );
  router.setHome<IPersistTestModulePar>(namedState.default, { id: 1, opt1: '' });

  //** SCENE configuration
  layout.registerRenderer(layout.placeContent, persistTest.plDefaultContentId, parent => <PersistTest initState={flux.getState().persistTest } parentId={parent} id='PersistTest.persistTest'/>);

  var Header: React.StatelessComponent<{ name: string }> = (p, ctx) => <h3>{p.name}</h3>;

  //** STATE initialization
  var root = () => <layout.Scene key={flux.cnt() } initState={flux.getState().layout.scene } parentId={''} id='layout.Scene' cases={{
    [layout.sceneDefault]: pid => <div>
        {Header({ name: 'Stateless function call' }) }
        <layout.ScenePlace initState={layout.scenePlaceState() } parentId={pid} id='layout.ScenePlace'/>
        <div>PersistTest Footer</div>
      </div>
  }}/>;

  flux.getState().persistTest = { ids: [] };

  flux.initApplication(document.getElementById('app'), root);

}