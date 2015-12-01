namespace login {

  login.namedRoute.home.dispatch = (par, comp) => { layout.changeScene(layout.sceneDefault, moduleId + '.home'); comp(); };

  layout.registerRenderer(layout.placeContent, moduleId + '.home', pid =>
    <div key={flux.cnt() }>
    <h2>Select login</h2>
    <a href='#' onClick={ev => auth.gotoOAuth(servConfig.oAuthProviders.facebook, ev) }>Facebook</a> <br/>
      </div>
  );
}