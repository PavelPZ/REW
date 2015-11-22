//******************* LoginTest aplikace
//Hiearchie Web (webApp) -> aplikace -> moduly -> akce, komponenty

//namespace config {
//  export interface IData {
//    loginTest?: { //konfigurace aplikace
//    };
//  }
//  cfg.data.loginTest = {} as any;
//}

namespace router {
  export interface INamedRoutes {
    loginTest: { //pojmenovane uiRouter.State's aplikace 
      default: router.RouteType;
    }
  };
  named.loginTest = {} as any;
}

namespace loginTest {
  //***** ROUTE init
  var namedState = router.named.loginTest; //pojmenovane stavy

  ////*********************** DISPATCH MODULE definition
  //interface ILoginTestClickAction extends flux.IAction { }

  //class loginTest extends flux.Dispatcher {
  //  constructor() {
  //    super(loginTest.moduleId);
  //  }
  //  //dispatchAction(action: flux.IAction, complete: (action: flux.IAction) => void) {
  //  //  switch (action.actionId) {
  //  //    case router.routerActionId:
  //  //      throw 'todo';
  //  //      break;
  //  //    case 'click':
  //  //      alert('click');
  //  //      break;
  //  //  }
  //  //  if (complete) complete(action);
  //  //}
  //  static moduleId = 'loginTest';
  //  static createAppClickAction(): ILoginTestClickAction { return { moduleId: loginTest.moduleId, actionId: 'click' }; }
  //}
  var moduleId = 'loginTest';

  //************* WHOLE APP
  //** inicializace aplikace
  config.cfg.initProc(config.initProcPhase.start);

  //new loginTest();


  router.init(
    namedState.default = new router.RouteType(moduleId, 'default', '/login-test-home')
  );
  router.setHome(namedState.default, {});

  var rootElement = () => <div key={flux.cnt() }>
      <div><login.Panel initState={flux.getState().auth } parentId={null} id='login-panel'/></div>
      <layout.Scene initState={layout.sceneState() } parentId={null} id='scene' cases={{
        [layout.sceneDefault]: parent => <h2 key={flux.cnt() }>Login Test Page</h2>
      }}/>
    </div>;

  var rootState: flux.IAppState = {
      layoutTest: {}
  };

  flux.initApplication(document.getElementById('app'), rootState, rootElement);

}