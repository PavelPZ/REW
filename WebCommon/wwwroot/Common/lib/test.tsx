//******************* Xxx aplikace
//Hiearchie Web (webApp) -> aplikace -> moduly -> akce, komponenty

namespace config {
  
  export interface IData {
    xxx?: { //deklarace casti globalniho configu, patrici modulu
    };
  }
  cfg.data.xxx = {} as any; //vytvoreni objektu s deklaraci
}

namespace router {
  export interface INamedRoutes {
    xxx: { //deklarace casti globalne pojmenovanych uiRouter.State's modulu
      default: router.Route<xxx.IXxxModulePar>; 
    }
  };
  named.xxx = {} as any; //vytvoreni objektu s deklaraci
}

namespace flux {
  export interface IAppState {
    xxx?: xxx.IXxxState //cast globalniho flux.IFluxState, patrici modulu
  }
}

namespace xxx {
  export interface IXxxModulePar extends router.IPar { id: number; opt1: string; } //jeden route PAR (parametrizujici route URL)

  //*********************** DISPATCH MODULE definition
  interface IXxxClickAction extends flux.IAction { } //jedna z dispatch-able akci modulu

  class xxx extends flux.Dispatcher { //dispatcher
    constructor() {
      super(xxx.moduleId);
    }
    dispatchAction(action: flux.IAction, complete: (action: flux.IAction) => void) {
      switch (action.actionId) {
        case 'r-default': //
          layout.changeScene(action, layout.sceneDefault, xxx.plDefaultContentId);
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
  config.cfg.initProc(config.initProcPhase.start);

  //** registrace DISPATCH modulu (modul se self-registruje v constructoru)
  new xxx();

  //** ROUTE configuration
  export var namedState = router.named.xxx; //pojmenovane stavy
  router.init(
    namedState.default = new router.Route<IXxxModulePar>(xxx.moduleId, 'r-default', '/xxx-home') //deklarace default named state
  );
  router.setHome<IXxxModulePar>(namedState.default, { id: 1, opt1: '' }); //definice 
  //start listen to hashChange
  setTimeout(() => router.listenHashChange());

  //** SCENE configuration
  layout.registerRenderer(
    layout.placeContent,
    xxx.plDefaultContentId,
    parent => <Xxx initState={flux.getState().xxx } parentId={parent} id='Xxx.xxx'/>);

  var Header: React.StatelessComponent<{ name: string }> = (p, ctx) => <h3>{p.name}</h3>;

  var root = () => <layout.Scene key={flux.cnt() } initState={layout.sceneState() } parentId={''} id='layout.Scene' cases={{
    [layout.sceneDefault]: pid => <div>
        {Header({ name: 'Stateless function call' }) }
        <layout.ScenePlace initState={layout.scenePlaceState() } parentId={pid} id='layout.ScenePlace'/>
        <div>Xxx Footer</div>
      </div>
  }}/>;

  var state: flux.IAppState = {
      xxx: { ids: [] },
      layout: {}
  };

  flux.initApplication(document.getElementById('app'), state, root);
}