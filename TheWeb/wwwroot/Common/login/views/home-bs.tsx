namespace login {

  login.namedRoute.home.dispatch = (par, comp) => { layout.changeScene(layout.sceneDefault, moduleId + '.home'); comp(); };

  layout.registerRenderer(layout.placeContent, moduleId + '.home', pid =>
    <div key={flux.cnt() }>
    <h2>Select login</h2>
    <a href={auth.getOAuthLink(servConfig.oAuthProviders.facebook) }>Facebook</a> <br/>
      </div>
  );
}