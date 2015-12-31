namespace login {

  login.namedRoute.confirmForgotPsw.dispatch = (par, comp) => { layout.changeScene(layout.sceneDefault, moduleId + '.confirmForgotPsw'); comp(); };

  layout.registerRenderer(layout.placeContent, moduleId + '.confirmForgotPsw', pid =>
    <div key={flux.cnt() }>
    <h2>Change forgotten password</h2>
      </div>
  );
}