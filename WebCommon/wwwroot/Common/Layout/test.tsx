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
      default: uiRouter.State<layoutTest.ITestModuleRoutePar>; //uiRouter.State hlavni stranky aplikace
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
  class layoutTest extends flux.Dispatcher {
    constructor() {
      super(layoutTest.moduleId);
    }
    dispatchAction(action: flux.IAction, complete: (action: flux.IAction) => void) {
      switch (action.actionId) {
        case uiRouter.routerActionId:
          var act = action as uiRouter.IStateAction<ITestModuleRoutePar>;
          layout.changeScene(action,
            act.defaultScene == 'true' ? layout.sceneDefault : sceneSecond,
            { ids: [], placeId: layout.placeContent, rendererId: act.defaultPlaces != 'true' ? 'cont-cont' : 'cont-panel' },
            { ids: [], placeId: placeOther, rendererId: act.defaultPlaces == 'true' ? 'other-cont' : 'other-panel' }
          );
          break;
        case 'click':
          alert('click');
          break;
      }
      if (complete) complete(action);
    }
    static moduleId = 'layoutTest';
    static createAppClickAction(): ILayoutTestClickAction { return { moduleId: layoutTest.moduleId, actionId: 'click' }; }
  }
  interface ILayoutTestClickAction extends flux.IAction { }

  //************* WHOLE APP
  //** definice DISPATCH modulu
  new layoutTest();

  //** ROUTE configuration
  export var namedState = uiRouter.namedState.layoutTest; //pojmenovane stavy

  //
  export interface ITestModuleRoutePar extends uiRouter.IStatePar {
    defaultScene: string; //hlavni (layout.sceneDefault) nebo druha (sceneSecond) scena
    defaultPlaces: string; //zpusob navazani rendereru do places: layout.placeContent=>plRendererDefault a placeOther=>plRendererOther nebo naopak
  }

  uiRouter.init(
    namedState.default = new uiRouter.State<ITestModuleRoutePar>(layoutTest.moduleId, '/layoutTest/:defaultScene/:defaultPlaces')
  );
  uiRouter.setDefault<ITestModuleRoutePar>(namedState.default, { defaultScene: 'true', defaultPlaces: 'true' });
  setTimeout(() => uiRouter.listenHashChange());

  //** SCENE configuration
  // Jsou 2 sceny (layout.sceneDefault a sceneSecond)
  // kazda z nich ma 2 places (layout.placeContent a placeOther)
  // jsou 4 renderery: 'cont-cont', 'cont-panel', 'other-cont', 'other-panel'

  var placeOther = 'place-other';
  var sceneSecond = 'scene-second';

  layout.registerRenderer(layout.placeContent, 'cont-cont', parent => <h2>Other 1</h2>);
  layout.registerRenderer(layout.placeContent, 'cont-panel', parent => <h2>Panel 2</h2> );
  layout.registerRenderer(placeOther, 'other-cont', parent => <h2>Other 3</h2> );
  layout.registerRenderer(placeOther, 'other-panel', parent => <h2>Panel 4</h2> );

  //** STATE initialization
  flux.initWebState(
    document.getElementById('app'),
    {
      ids:[],
      data: {
        layoutTest: {},
      }
    },
    (web) => <div>
      <a href={'#' + namedState.default.getHashStr({ defaultScene: 'true', defaultPlaces: 'true' }) }>Default Scene, default places</a> |
      <a href={'#' + namedState.default.getHashStr({ defaultScene: 'false', defaultPlaces: 'true' }) }>Other Scene, default places</a> |
      <a href={'#' + namedState.default.getHashStr({ defaultScene: 'true', defaultPlaces: 'false' }) }>Default Scene, other places</a> |
      <a href={'#' + namedState.default.getHashStr({ defaultScene: 'false', defaultPlaces: 'false' }) }>Other Scene, other places</a> |

      <layout.Scene initState={layout.sceneState() } parent={web} id='scene' cases={{

        [layout.sceneDefault]: parent => <div key={flux.cnt()}>
        <h1>Scene: {layout.sceneDefault}</h1>
        <layout.ScenePlace initState={layout.scenePlaceState(layout.placeContent) } parent={parent} id='place-defaultContent'/>
        --------------------
        <layout.ScenePlace initState={layout.scenePlaceState(placeOther) } parent={parent} id='place-defaultOther'/>
        <br/>
        <div>Footer: {layout.sceneDefault}</div>
          </div>,

        [sceneSecond]: parent => <div key={flux.cnt()}>
        <h1>Scene: {sceneSecond}</h1>
        <layout.ScenePlace initState={layout.scenePlaceState(placeOther) } parent={parent} id='place-secondOther'/>
        ====================
        <layout.ScenePlace initState={layout.scenePlaceState(layout.placeContent) } parent={parent} id='place-secondContent'/>
        <br/>
        <div>Footer: {sceneSecond}</div>
          </div>
      }}/>
      </div>
  );
}