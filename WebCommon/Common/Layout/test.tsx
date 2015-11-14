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
        <div onClick={() => flux.trigger(layoutTest.createAppClickAction()) }>Click</div>
        {namedState.default.getHashStr({ sceneId: layout.defaultSceneId }) }<br/>
        {namedState.default.getHashStr({ sceneId: otherScene }) }
        <hr/>
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
  var otherPlayground = 'otherPlayground';
  var otherScene = 'otherScene';

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
          scene: { placeId: layout.defaultSceneId },
          playgrounds: {
            [layout.defaultPlaygroundId]: { id: layout.defaultPlaygroundId, contentId: null },
            [otherPlayground]: { id: otherPlayground, contentId: null },
          }
        }
      }
    },
    (web) => <layout.Scene initState={layout.sceneState() } parent={web} id='layout.Scene' contents={{
      [layout.defaultSceneId]: parent => <div>
        <h1>LayoutTest Header</h1>
        <layout.Playground initState={layout.playGroundState() } parent={parent} id='layout.Playground1'/>
        <layout.Playground initState={layout.playGroundState(otherPlayground) } parent={parent} id='layout.Playground2'/>
        <div>LayoutTest Footer</div>
        </div>,
      [otherScene]: parent => <div>
        <div>LayoutTest Footer</div>
        <layout.Playground initState={layout.playGroundState(otherPlayground) } parent={parent} id='layout.Playground3'/>
        <layout.Playground initState={layout.playGroundState() } parent={parent} id='layout.Playground4'/>
        <h1>LayoutTest Header</h1>
        </div>
    }}/>
  );
}