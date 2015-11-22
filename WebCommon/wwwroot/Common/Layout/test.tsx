//******************* LayoutTest aplikace
//Hiearchie Web (webApp) -> aplikace -> moduly -> akce, komponenty

namespace config {
  export interface IData {
    layoutTest?: { //konfigurace aplikace
    };
  }
  cfg.data.layoutTest = {} as any;
}

namespace router {
  export interface INamedRoutes {
    layoutTest: { //pojmenovane uiRouter.State's aplikace
      default: router.Route<layoutTest.ITestModuleRoutePar>; //uiRouter.State hlavni stranky aplikace
    }
  };
  named.layoutTest = {} as any;
}

namespace flux {
  export interface IAppState {
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
        case 'r-default':
          var act = action as router.IAction<ITestModuleRoutePar>;
          layout.changeScene(action,
            act.par.defaultScene ? layout.sceneDefault : sceneSecond,
            { ids: [], placeId: layout.placeContent, rendererId: act.par.defaultPlaces ? 'cont-cont' : 'cont-panel' },
            { ids: [], placeId: placeOther, rendererId: act.par.defaultPlaces ? 'other-cont' : 'other-panel' }
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
  export var namedState = router.named.layoutTest; //pojmenovane stavy

  //
  export interface ITestModuleRoutePar extends router.IPar {
    defaultScene: boolean; //hlavni (layout.sceneDefault) nebo druha (sceneSecond) scena
    defaultPlaces: boolean; //zpusob navazani rendereru do places
  }

  router.init(
    namedState.default = new router.Route<ITestModuleRoutePar>(layoutTest.moduleId, 'r-default', '/layoutTest/:defaultScene/:defaultPlaces').
      finishStatePar(st => { st.defaultPlaces = utils.toBoolean(st.defaultPlaces); st.defaultScene = utils.toBoolean(st.defaultScene); })
  );
  router.setHome<ITestModuleRoutePar>(namedState.default, { defaultScene: true, defaultPlaces: true });

  //** SCENE configuration
  // Jsou 2 sceny (layout.sceneDefault a sceneSecond)
  // kazda z nich ma 2 places (layout.placeContent a placeOther)
  // jsou 4 renderery: 'cont-cont', 'cont-panel', 'other-cont', 'other-panel'

  var placeOther = 'place-other';
  var sceneSecond = 'scene-second';

  layout.registerRenderer(layout.placeContent, 'cont-cont', parent => <h2 key={flux.cnt() }>Other 1</h2>);
  layout.registerRenderer(layout.placeContent, 'cont-panel', parent => <h2 key={flux.cnt() }>Panel 2</h2>);
  layout.registerRenderer(placeOther, 'other-cont', parent => <h2 key={flux.cnt() }>Other 3</h2>);
  layout.registerRenderer(placeOther, 'other-panel', parent => <h2 key={flux.cnt() }>Panel 4</h2>);

  var rootElement = () => <div key={flux.cnt() } >
      <a href={'#' + namedState.default.getHash({ defaultScene: true, defaultPlaces: true }) }>Default Scene, default places</a> |
      <a href={'#' + namedState.default.getHash({ defaultScene: false, defaultPlaces: true }) }>Other Scene, default places</a> |
      <a href={'#' + namedState.default.getHash({ defaultScene: true, defaultPlaces: false }) }>Default Scene, other places</a> |
      <a href={'#' + namedState.default.getHash({ defaultScene: false, defaultPlaces: false }) }>Other Scene, other places</a> |

      <layout.Scene initState={layout.sceneState() } parentId={''} id='scene' cases={{

        [layout.sceneDefault]: pid => <div key={flux.cnt() }>
        <h1>Scene: {layout.sceneDefault}</h1>
        <layout.ScenePlace initState={layout.scenePlaceState(layout.placeContent) } parentId={pid} id='place-defaultContent'/>
        --------------------
        <layout.ScenePlace initState={layout.scenePlaceState(placeOther) } parentId={pid} id='place-defaultOther'/>
        <br/>
        <div>Footer: {layout.sceneDefault}</div>
          </div>,

        [sceneSecond]: pid => <div key={flux.cnt() }>
        <h1>Scene: {sceneSecond}</h1>
        <layout.ScenePlace initState={layout.scenePlaceState(placeOther) } parentId={pid} id='place-secondOther'/>
        ====================
        <layout.ScenePlace initState={layout.scenePlaceState(layout.placeContent) } parentId={pid} id='place-secondContent'/>
        <br/>
        <div>Footer: {sceneSecond}</div>
          </div>
      }}/>
    </div>;

  var rootState: flux.IAppState = {
      layoutTest: {},
  };

  flux.initApplication(document.getElementById('app'), rootState, rootElement);

  //Start listening
  setTimeout(() => router.listenHashChange());
}