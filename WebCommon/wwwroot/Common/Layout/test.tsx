//******************* LayoutTest aplikace
//Hiearchie Web (webApp) -> aplikace -> moduly -> akce, komponenty

namespace config {
  export interface IData {
    layoutTest?: { //konfigurace aplikace
    };
  }
  cfg.data.layoutTest = {} as any;
}

namespace uiRouter {
  export interface INamedState {
    layoutTest: { //pojmenovane uiRouter.State's aplikace
      default: uiRouter.State<layoutTest.ILayoutTestModulePar>; //uiRouter.State hlavni stranky aplikace
    }
  };
  namedState.layoutTest = {} as any;
}

namespace flux {
  export interface IWebState {
    layoutTest?: {}; //cast globalniho flux.IFluxState, patrici aplikaci
  }
}

namespace layoutTest {

  //*********************** DISPATCH MODULE definition
  class layoutTest extends flux.Module {
    constructor() {
      super(layoutTest.moduleId);
    }
    dispatchAction(action: flux.IAction, complete: (action: flux.IAction) => void) {
      switch (action.actionId) {
        case uiRouter.routerActionId:
          layout.changeLayout(action,
            { contentId: layoutTest.plContentIdDefault },
            { id: otherScenePlaceId, contentId: layoutTest.plContentIdOther }
          );
          break;
        case 'click':
          alert('click');
          break;
      }
      if (complete) complete(action);
    }
    static moduleId = 'layoutTest';
    static plContentIdDefault = layoutTest.moduleId + '/Default';
    static plContentIdOther = layoutTest.moduleId + '/Other';
    static createAppClickAction(): ILayoutTestClickAction { return { moduleId: layoutTest.moduleId, actionId: 'click' }; }
  }
  interface ILayoutTestClickAction extends flux.IAction { }

  //************* VIEWs
  export class LayoutContent extends flux.SmartComponent<flux.ISmartProps<any>, flux.ISmartState>{
    render() {
      super.render();
      return <div>
        <h2>Content</h2>
        </div>;
    }
  };
  //
  export class LayoutPanel extends flux.SmartComponent<flux.ISmartProps<any>, flux.ISmartState>{
    render() {
      super.render();
      return <div>
        <h2>Panel</h2>
        </div>;
    }
  };

  //************* WHOLE APP
  //** definice DISPATCH modulu
  new layoutTest();

  //** ROUTE configuration
  export var namedState = uiRouter.namedState.layoutTest; //pojmenovane stavy
  export interface ILayoutTestModulePar extends uiRouter.IStatePar { sceneId: string } //route PAR pro LayoutTestModule

  uiRouter.init(
    namedState.default = new uiRouter.State<ILayoutTestModulePar>(layoutTest.moduleId, '/layoutTest/:sceneId')
  );
  uiRouter.setDefault<ILayoutTestModulePar>(namedState.default, { sceneId: layout.defaultSceneId });
  setTimeout(() => uiRouter.listenHashChange());

  //** SCENE configuration
  var otherScenePlaceId = 'scenePlace-other';
  var otherScene = 'scene-other';

  config.cfg.data.layout.routeActionToSceneId = (action: uiRouter.IStateAction<ILayoutTestModulePar>) => {
    return action.sceneId;
  };
  layout.setScenePlaceRender(
    layout.defaultScenePlaceId,
    layoutTest.plContentIdDefault,
    parent => <LayoutContent initState={flux.getState().layoutTest } parent={parent} id='LayoutTest.LayoutContent'/>
  );
  layout.setScenePlaceRender(
    otherScenePlaceId,
    layoutTest.plContentIdOther,
    parent => <LayoutPanel initState={flux.getState().layoutTest } parent={parent} id='LayoutTest.LayoutPanel'/>
  );

  //** STATE initialization
  flux.initWebState(
    document.getElementById('app'),
    {
      data: {
        layoutTest: {},
      }
    },
    (web) => <div>
      <a href={'#' + namedState.default.getHashStr({ sceneId: layout.defaultSceneId }) }>Default Scene</a> |
      <a href={'#' + namedState.default.getHashStr({ sceneId: otherScene }) }>Other Scene</a>
      <layout.Scene initState={layout.sceneState() } parent={web} id='layout.Scene' cases={{

        [layout.defaultSceneId]: parent => <div>
        <h1>Scene: {layout.defaultSceneId}</h1>
        <layout.ScenePlace initState={layout.scenePlaceState() } parent={parent} id='layout.ScenePlace-1'/>
        --------------------
        <layout.ScenePlace initState={layout.scenePlaceState(otherScenePlaceId) } parent={parent} id='layout.ScenePlace-2'/>
        <br/>
        <div>Footer: {layout.defaultSceneId}</div>
          </div>,

        [otherScene]: parent => <div>
        <h1>Scene: {otherScene}</h1>
        <layout.ScenePlace initState={layout.scenePlaceState(otherScenePlaceId) } parent={parent} id='layout.ScenePlace-3'/>
        ====================
        <layout.ScenePlace initState={layout.scenePlaceState() } parent={parent} id='layout.ScenePlace-4'/>
        <br/>
        <div>Footer: {otherScene}</div>
          </div>
      }}/>
      </div>
  );
}