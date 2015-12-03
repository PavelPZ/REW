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
    namedState.default = new router.RouteType(moduleId, 'default', config.appPrefix() + '/testing')
  );
  router.setHome(namedState.default, {});

  namedState.default.dispatch = (par, comp) => { comp(); };

  function doDrop(ev: React.DragEvent) {
    ev.preventDefault();
    var files = ev.dataTransfer.files; if (files.length <= 0) return;
    var file = files[0];
    //alert(`Len=${file.size}, name=${file.name}, type=${file.type}`);
    var reader = new FileReader();
    reader.onload = (ev:any) => {
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
    <input onDrop={ev => doDrop(ev) } onDragOver={ev => ev.preventDefault() } onDragEnd={ev => ev.preventDefault()} style={{ backgroundColor: 'red', height: '100px', width: '100px' }}/>
    <h1>Testing</h1>
    <a href='#' onClick={ev => { startRecording(); ev.preventDefault(); } }>Start recording</a> |
    <a href='#' onClick={ev => { stopRecording(); ev.preventDefault(); } }>Stop recording</a> |
    <a href='#' onClick={ev => { startPlay(); ev.preventDefault(); } }>Play or ...</a> |
    <a href='#' onClick={ev => { save(); ev.preventDefault(); } }>... save</a>
    <h3>Applications: </h3>
    <a href='#' onClick={ev => flux.doExternalNavigate('http://localhost:10101/web/login/login-test-home', ev) }>Login</a> |
    <a href='#' onClick={ev => flux.doExternalNavigate('http://localhost:10101/web/layout', ev) }>Layout</a>
    </div>;

  flux.initApplication(document.getElementById('app'), rootElement);

}