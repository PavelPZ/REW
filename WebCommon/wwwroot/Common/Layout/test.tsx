﻿//******************* LayoutTest aplikace
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
            act.defaultScene=='true' ? layout.sceneDefault : sceneSecond,
            //{ placeId: layout.placeContent, rendererId: layoutTest.plRendererDefault},
            //{ placeId: placeOther, rendererId: layoutTest.plRendererOther }
            { placeId: layout.placeContent, rendererId: act.defaultPlaces != 'true' ? layoutTest.plRendererOther : layoutTest.plRendererDefault },
            { placeId: placeOther, rendererId: act.defaultPlaces == 'true' ? layoutTest.plRendererOther : layoutTest.plRendererDefault }
          );
          break;
        case 'click':
          alert('click');
          break;
      }
      if (complete) complete(action);
    }
    static moduleId = 'layoutTest';
    static plRendererDefault = layoutTest.moduleId + '/Default';
    static plRendererOther = layoutTest.moduleId + '/Other';
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
        <h2>Other</h2>
        </div>;
    }
  };

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


  var placeOther = 'place-other';
  var sceneSecond = 'scene-second';

  //config.cfg.data.layout.routeActionToSceneId = (action: uiRouter.IStateAction<ITestModuleRoutePar>) => {
  //  return action.defaultScene ? layout.sceneDefault : sceneSecond;
  //};
  layout.registerPlaceRenderer(
    layout.placeContent, //jmen mista v scene, ktereho se definice tyka
    layoutTest.plRendererDefault, //identifikace place renderera, pouzije se nastaveni 
    parent => <LayoutContent initState={flux.getState().layoutTest } parent={parent} id='cont-renDef'/>
  );
  layout.registerPlaceRenderer(
    layout.placeContent,
    layoutTest.plRendererOther,
    parent => <LayoutPanel initState={flux.getState().layoutTest } parent={parent} id='cont-rendPn'/>
  );
  layout.registerPlaceRenderer(
    placeOther, //jmen mista v scene, ktereho se definice tyka
    layoutTest.plRendererDefault, //identifikace place renderera, pouzije se nastaveni 
    parent => <LayoutContent initState={flux.getState().layoutTest } parent={parent} id='oth-renDef'/>
  );
  layout.registerPlaceRenderer(
    placeOther,
    layoutTest.plRendererOther,
    parent => <LayoutPanel initState={flux.getState().layoutTest } parent={parent} id='oth-renPn'/>
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
      <a href={'#' + namedState.default.getHashStr({ defaultScene: 'true', defaultPlaces: 'true' }) }>Default Scene, default places</a> |
      <a href={'#' + namedState.default.getHashStr({ defaultScene: 'false', defaultPlaces: 'true'  }) }>Other Scene, default places</a> |
      <a href={'#' + namedState.default.getHashStr({ defaultScene: 'true', defaultPlaces: 'false' }) }>Default Scene, other places</a> |
      <a href={'#' + namedState.default.getHashStr({ defaultScene: 'false', defaultPlaces: 'false' }) }>Other Scene, other places</a> |

      <layout.Scene initState={layout.sceneState() } parent={web} id='scene' cases={{

        [layout.sceneDefault]: parent => <div>
        <h1>Scene: {layout.sceneDefault}</h1>
        <layout.ScenePlace initState={layout.scenePlaceState(layout.placeContent) } parent={parent} id='place-defaultContent'/>
        --------------------
        <layout.ScenePlace initState={layout.scenePlaceState(placeOther) } parent={parent} id='place-defaultOther'/>
        <br/>
        <div>Footer: {layout.sceneDefault}</div>
          </div>,

        [sceneSecond]: parent => <div>
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