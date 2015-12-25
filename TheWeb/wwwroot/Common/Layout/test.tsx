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
      index: router.Route<layoutTest.ITestModuleRoutePar>; //uiRouter.State hlavni stranky aplikace
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

  const placeOther = 'place-other';
  const sceneSecond = 'scene-second';


  //*********************** DISPATCH MODULE definition
  class layoutTest extends flux.Dispatcher {
    constructor() {
      super(layoutTest.moduleId);
    }
    dispatchAction(action: flux.IAction, compl: utils.TCallback) {
      switch (action.actionId) {
        case 'r-default':
          var act = action as router.IHistory<ITestModuleRoutePar>;
          layout.changeScene(act.par.defaultScene ? layout.sceneDefault : sceneSecond,
            { ids: [], placeId: layout.placeContent, rendererId: act.par.defaultPlaces ? 'cont-cont' : 'cont-panel' },
            { ids: [], placeId: placeOther, rendererId: act.par.defaultPlaces ? 'other-cont' : 'other-panel' }
          );
          break;
        case 'click':
          alert('click');
          break;
      }
      if (compl) compl();
    }
    static moduleId = 'layoutTest';
    static createAppClickAction(): ILayoutTestClickAction { return { moduleId: layoutTest.moduleId, actionId: 'click' }; }
  }
  interface ILayoutTestClickAction extends flux.IAction { }

  //
  export interface ITestModuleRoutePar extends router.IPar {
    defaultScene: boolean; //hlavni (layout.sceneDefault) nebo druha (sceneSecond) scena
    defaultPlaces: boolean; //zpusob navazani rendereru do places
  }

  //** ROUTE configuration
  var namedState = router.named.layoutTest; //pojmenovane stavy
  namedState.index = new router.Route<ITestModuleRoutePar>(layoutTest.moduleId, 'r-default', '/layout/layoutTest/{defaultScene}/{defaultPlaces}', null, {
    needsAuth: false,
    finishRoutePar: st => { st.defaultPlaces = utils.toBoolean(st.defaultPlaces); st.defaultScene = utils.toBoolean(st.defaultScene); }
  })

  export function doRunApp() {

    router.activate(namedState.index);

    //************* WHOLE APP
    //** definice DISPATCH modulu
    new layoutTest();

    router.setHome<ITestModuleRoutePar>(namedState.index, { defaultScene: true, defaultPlaces: true });

    namedState.index.dispatch = (par, comp) => {
      layout.changeScene(par.defaultScene ? layout.sceneDefault : sceneSecond,
        { ids: [], placeId: layout.placeContent, rendererId: par.defaultPlaces ? 'cont-cont' : 'cont-panel' },
        { ids: [], placeId: placeOther, rendererId: par.defaultPlaces ? 'other-cont' : 'other-panel' }
      );
      comp();
    };

    //** SCENE configuration
    // Jsou 2 sceny (layout.sceneDefault a sceneSecond)
    // kazda z nich ma 2 places (layout.placeContent a placeOther)
    // jsou 4 renderery: 'cont-cont', 'cont-panel', 'other-cont', 'other-panel'

    layout.registerRenderer(layout.placeContent, 'cont-cont', parent => <h2 key={flux.cnt() }>Other x1</h2>);
    layout.registerRenderer(layout.placeContent, 'cont-panel', parent => <h2 key={flux.cnt() }>Panel x2</h2>);
    layout.registerRenderer(placeOther, 'other-cont', parent => <h2 key={flux.cnt() }>Other x3</h2>);
    layout.registerRenderer(placeOther, 'other-panel', parent => <h2 key={flux.cnt() }>Panel x4</h2>);

    var rootElement = () => <div key={flux.cnt() } >
      <a href='#' onClick={ev => namedState.index.navig({ defaultScene: true, defaultPlaces: true }, ev) } style={{}}>Default Scene, default places</a> |
      <a href='#' onClick={ev => namedState.index.navig({ defaultScene: false, defaultPlaces: true }, ev) }>Other Scene, default places</a> |
      <a href='#' onClick={ev => namedState.index.navig({ defaultScene: true, defaultPlaces: false }, ev) }>Default Scene, other places</a> |
      <a href='#' onClick={ev => namedState.index.navig({ defaultScene: false, defaultPlaces: false }, ev) }>Other Scene, other places</a> |

      <layout.Scene initState={flux.getState().layout.scene } parentId={''} id='scene' cases={{

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

    flux.getState().layoutTest = {};

    flux.initApplication(document.getElementById('app'), rootElement);
  }

}