namespace router {
  export interface INamedRoutes {
    testingTest: { index: router.RouteType; }
  };
  named.testingTest = {} as any;
}


namespace testingTest {
  //***** ROUTE init
  var moduleId = 'testing';

  //** ROUTERS and its dispatch
  var namedState = router.named.testingTest; //pojmenovane stavy
  router.init(
    namedState.index = new router.RouteType(moduleId, 'default', config.appPrefix() + '/testing')
  );

  export function doRunApp() {
    router.setHome(namedState.index, {});
    namedState.index.dispatch = (par, comp) => { comp(); };

    function doDrop(ev: React.DragEvent) {
      ev.preventDefault();
      var files = ev.dataTransfer.files; if (files.length <= 0) return;
      var file = files[0];
      //alert(`Len=${file.size}, name=${file.name}, type=${file.type}`);
      var reader = new FileReader();
      reader.onload = (ev: any) => {
        var contents: string = ev.target.result;
        storageSet(JSON.parse(contents));
        startPlay();
      };
      reader.readAsText(file);

    
      //var formData = new FormData(); 
      //for (var i = 0; i < files.length; i++) formData.append('file', files[i]);
      //var xhr = new XMLHttpRequest();
      //xhr.open('POST', '/devnull.php');
      //xhr.onload = () => {
      //  alert('Done');
      //};
      //xhr.send(formData);
    }

    //** INIT app
    var rootElement = () => <div key={flux.cnt() }>
    <h3>D&D</h3>
    <input onDrop={ev => doDrop(ev) } onDragOver={ev => ev.preventDefault() } onDragEnd={ev => ev.preventDefault() } style={{ backgroundColor: 'red', height: '100px', width: '100px' }}/>
    <h1>Testing</h1>
    <a href='#' onClick={ev => { startRecording(); ev.preventDefault(); } }>Start recording</a> |
    <a href='#' onClick={ev => { stopRecording(); ev.preventDefault(); } }>Stop recording</a> |
    <a href='#' onClick={ev => { startPlay(); ev.preventDefault(); } }>Play or ...</a> |
    <a href='#' onClick={ev => { save(); ev.preventDefault(); } }>...save</a>
    <h3>Applications: </h3>
    <a href='#' onClick={ev => flux.doExternalNavigate(router.named.loginTest.index, ev) }>Login</a> |
    <a href='#' onClick={ev => flux.doExternalNavigate<layoutTest.ITestModuleRoutePar>(router.named.layoutTest.index, ev, { defaultPlaces: true, defaultScene:true }) }>Layout</a> |
    <a href='#' onClick={ev => flux.doExternalNavigate(router.named.validationTest.index, ev) }>Validation</a> |
    <a href='#' onClick={ev => flux.doExternalNavigate(router.named.fluxTest.index, ev) }>Flux</a>
    <h3>System</h3>
    <a href="/api/system/resetcache">Reset Cache</a><br />
    <a href="/api/system/deletelogfiles">Delete logs</a><br />
      </div>;

    flux.initApplication(document.getElementById('app'), rootElement);
  }

}