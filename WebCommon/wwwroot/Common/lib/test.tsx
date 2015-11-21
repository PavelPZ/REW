//******************* Xxx aplikace
//Hiearchie Web (webApp) -> aplikace -> moduly -> akce, komponenty

namespace config {
  
  export interface IData {
    xxx?: { //deklarace casti globalniho configu, patrici modulu
    };
  }
  cfg.data.xxx = {} as any; //vytvoreni objektu s deklaraci
}

namespace uiRouter {
  export interface INamedState {
    xxx: { //deklarace casti globalne pojmenovanych uiRouter.State's modulu
      default: uiRouter.State<xxx.IXxxModulePar>; 
    }
  };
  namedState.xxx = {} as any; //vytvoreni objektu s deklaraci
}

namespace flux {
  export interface IWebState {
    xxx?: {
      xxxModuleState: xxx.IXxxState; //cast globalniho flux.IFluxState, patrici modulu
    }
  }
}

namespace xxx {
  export interface IXxxModulePar extends uiRouter.IStatePar { id: number; opt1: string; } //jeden route PAR (parametrizujici route URL)

  //*********************** DISPATCH MODULE definition
  interface IXxxClickAction extends flux.IAction { } //jedna z dispatch-able akci modulu

  class xxx extends flux.Dispatcher { //dispatcher
    constructor() {
      super(xxx.moduleId);
    }
    dispatchAction(action: flux.IAction, complete: (action: flux.IAction) => void) {
      switch (action.actionId) {
        case uiRouter.routerActionId: //
          layout.changeLayout(action, xxx.plDefaultContentId);
          break;
        case 'click':
          alert('click');
          break;
      }
      if (complete) complete(action);
    }
    static moduleId = 'xxx'; //identifikace modulu
    static plDefaultContentId = xxx.moduleId + '/default';
    static createAppClickAction(): IXxxClickAction { return { moduleId: xxx.moduleId, actionId: 'click' }; }
  }

  //************* VIEW
  export class Xxx extends flux.SmartComponent<IXxxProps, IXxxState>{
    render() {
      super.render();
      return <div>
        <div onClick={() => flux.trigger(xxx.createAppClickAction()) }>Click</div>
        </div>;
    }
  };
  export interface IXxxState extends flux.ISmartState { }
  interface IXxxProps extends flux.ISmartProps<IXxxState> { }

  //************* WHOLE APP
  //** inicializace aplikace
  config.initApp();

  //** registrace DISPATCH modulu (modul se self-registruje v constructoru)
  new xxx();

  //** ROUTE configuration
  export var namedState = uiRouter.namedState.xxx; //pojmenovane stavy
  uiRouter.init(
    namedState.default = new uiRouter.State<IXxxModulePar>(xxx.moduleId, '/xxx-home') //deklarace default named state
  );
  uiRouter.setDefault<IXxxModulePar>(namedState.default, { id: 1, opt1: '' }); //definice 
  //start listen to hashChange
  setTimeout(() => uiRouter.listenHashChange());

  //** SCENE configuration
  layout.setScenePlaceRender(
    layout.defaultScenePlaceId,
    xxx.plDefaultContentId,
    parent => <Xxx initState={flux.getState().xxx } parent={parent} id='Xxx.xxx'/>);

  var Header: React.StatelessComponent<{ name: string }> = (p, ctx) => <h3>{p.name}</h3>;

  //** STATE initialization 
  flux.initWebState(
    document.getElementById('app'),
    {
      data: {
        xxx: { xxxModuleState: {} },
        layout: {}
      }
    },
    (web) => <layout.Scene initState={layout.sceneState() } parent={web} id='layout.Scene' cases={{
      [layout.defaultSceneId]: parent => <div>
        {Header({ name:'Stateless function call'})}
        <layout.ScenePlace initState={layout.scenePlaceState() } parent={parent} id='layout.ScenePlace'/>
        <div>Xxx Footer</div>
        </div>
    }}/>
  );
}