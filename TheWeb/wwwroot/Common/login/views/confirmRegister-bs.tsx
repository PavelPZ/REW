namespace login {

  login.namedRoute.confirmRegister.dispatch = (par, comp) => { layout.changeScene(layout.sceneDefault, moduleId + '.confirmRegister'); comp(); };

  layout.registerRenderer(layout.placeContent, moduleId + '.confirmRegister', pid =>
    <div key={flux.cnt() }>
    <h2>Registration confirmed</h2>
      </div>
  );
}