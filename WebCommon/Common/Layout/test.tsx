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
            { id: otherPlayground, contentId: layoutTest.plContentIdOther }
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
  var otherPlayground = 'playground-other';
  var otherScene = 'scene-other';

  config.cfg.data.layout.routeActionToSceneId = (action: uiRouter.IStateAction<ILayoutTestModulePar>) => {
    return action.sceneId;
  };
  layout.setPlayGroundRender(
    layout.defaultPlaygroundId,
    layoutTest.plContentIdDefault,
    parent => <LayoutContent initState={flux.getState().layoutTest } parent={parent} id='LayoutTest.LayoutContent'/>
  );
  layout.setPlayGroundRender(
    otherPlayground,
    layoutTest.plContentIdOther,
    parent => <LayoutPanel initState={flux.getState().layoutTest } parent={parent} id='LayoutTest.LayoutPanel'/>
  );

  //** STATE initialization
  flux.initWebState(
    document.getElementById('app'),
    {
      data: {
        layoutTest: {},
        layout: {
          scene: { },
          playgrounds: {
            [layout.defaultPlaygroundId]: { id: layout.defaultPlaygroundId, contentId: null },
            [otherPlayground]: { id: otherPlayground, contentId: null },
          }
        }
      }
    },
    (web) => <div>
      <a href={'#' + namedState.default.getHashStr({ sceneId: layout.defaultSceneId }) }>Default Scene</a> |
      <a href={'#' + namedState.default.getHashStr({ sceneId: otherScene }) }>Other Scene</a>
      <layout.Scene initState={layout.sceneState() } parent={web} id='layout.Scene' contents={{
        [layout.defaultSceneId]: parent => <div>
        <h1>Scene: {layout.defaultSceneId}</h1>
        <layout.Playground initState={layout.playGroundState() } parent={parent} id='layout.Playground-1'/>
        --------------------
        <layout.Playground initState={layout.playGroundState(otherPlayground) } parent={parent} id='layout.Playground-2'/>
        <br/>
        <div>Footer: {layout.defaultSceneId}</div>
          </div>,
        [otherScene]: parent => <div>
        <h1>Scene: {otherScene}</h1>
        <layout.Playground initState={layout.playGroundState(otherPlayground) } parent={parent} id='layout.Playground-3'/>
        ====================
        <layout.Playground initState={layout.playGroundState() } parent={parent} id='layout.Playground-4'/>
        <br/>
        <div>Footer: {otherScene}</div>
          </div>
      }}/>
      </div>
  );
}