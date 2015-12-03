namespace router {
  export interface INamedRoutes {
    loginTest: { index: router.RouteType; }
  };
  named.loginTest = {} as any;
}

namespace loginTest {
  //***** ROUTE init
  var moduleId = 'loginTest';

  //** ROUTERS and its dispatch
  var namedState = router.named.loginTest; //pojmenovane stavy
  router.init(
    namedState.index = new router.RouteType(moduleId, 'default', config.appPrefix() + '/login/login-test-home', { needsAuth: true })
  );

  export function doRunApp() {
    router.setHome(namedState.index, {});

    namedState.index.dispatch = (par, comp) => { layout.changeScene(layout.sceneDefault, moduleId + '.content'); comp(); };

    //** LAYOUT
    layout.registerRenderer(layout.placeContent, moduleId + '.content', pid => <h2 key={flux.cnt() }>Login test home</h2>);

    //** INIT app
    var rootElement = () => <div key={flux.cnt() }>
      <div><a href='#' onClick={() => { proxies.auth.Login('am', 'psw', res => { }); return false; } }>Ajax</a></div>
      <div><a href='#' onClick={ev => router.navigHome(ev) }>Home</a></div>
      <div><login.Panel initState={flux.getState().auth } parentId={null} id='login-panel'/></div>
      <layout.Scene initState={flux.getState().layout.scene } parentId={null} id='scene' cases={{
        [layout.sceneDefault]: pid => <div key={flux.cnt() }>
        <layout.ScenePlace initState={layout.scenePlaceState(layout.placeContent) } parentId={pid} id='place-content'/>
          </div>
      }}/>
      </div>;

    flux.initApplication(document.getElementById('app'), rootElement);
  }

}