namespace router {
  export interface INamedRoutes {
    testing: { default: router.RouteType; }
  };
  named.testing = {} as any;
}

namespace testing {
  //***** ROUTE init
  var moduleId = 'testing';

  //** ROUTERS and its dispatch
  var namedState = router.named.testing; //pojmenovane stavy
  router.init(
    namedState.default = new router.RouteType(moduleId, 'default', '/testing')
  );
  router.setHome(namedState.default, {});

  namedState.default.dispatch = (par, comp) => { comp(); };

  var lastRecording: IPlayList;

  //** INIT app
  var rootElement = () => <div key={flux.cnt() }>
    <h1>Testing</h1>
    <a href='#' onClick={ev => { startRecording(); ev.preventDefault(); } }>Start recording</a> |
    <a href='#' onClick={ev => { lastRecording = stopRecording(); ev.preventDefault(); } }>Stop recording</a> |
    <a href='#' onClick={ev => { startPlay(lastRecording); ev.preventDefault(); } }>Play</a> |
    <h3>Applications: </h3>
    <a href='#' onClick={ev => flux.doExternalNavigate('http://localhost:10101/web/login', ev) }>Login</a> |
    </div>;

  flux.initApplication(document.getElementById('app'), rootElement);

}