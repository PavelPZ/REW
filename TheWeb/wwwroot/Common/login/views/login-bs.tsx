namespace login {

  login.namedRoute.login.dispatch = (par, comp) => { layout.changeScene(layout.sceneDefault, moduleId + '.login'); comp(); };

  layout.registerRenderer(layout.placeContent, moduleId + '.login', pid =>
    <div key={flux.cnt() }>
    <h2>Login</h2>
      <hr/>
      <a href='#' onClick={ev => router.navigRoute(router.named.login.register, ev) }>Register</a> |
      <a href='#' onClick={ev => router.navigRoute(router.named.login.forgotPsw, ev) }>Forgot password</a> |
      </div>
  );
}