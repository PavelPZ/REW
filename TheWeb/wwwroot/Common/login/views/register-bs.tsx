namespace login {

  login.namedRoute.register.dispatch = (par, comp) => { layout.changeScene(layout.sceneDefault, moduleId + '.register'); comp(); };

  layout.registerRenderer(layout.placeContent, moduleId + '.register', pid =>
    <div key={flux.cnt() }>
    <h2>Register</h2>
      </div>
  );
}