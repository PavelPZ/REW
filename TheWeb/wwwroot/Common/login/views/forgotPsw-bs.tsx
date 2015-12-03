namespace login {

  login.namedRoute.forgotPsw.dispatch = (par, comp) => { layout.changeScene(layout.sceneDefault, moduleId + '.forgotPsw'); comp(); };

  layout.registerRenderer(layout.placeContent, moduleId + '.forgotPsw', pid =>
    <div key={flux.cnt() }>
    <h2>Forgot password</h2>
      </div>
  );
}