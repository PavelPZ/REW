namespace login {
  login.namedRoute.home.dispatch = (par, comp) => {
    layout.changeScene(layout.sceneDefault, moduleId + '.home'); comp();
  };
  layout.registerRenderer(layout.placeContent, moduleId + '.home', pid =>
    <div key={flux.cnt() }>
    <h2>Select login</h2>
    <a href={getOAuthLink(servConfig.oAuthProviders.facebook) }>Facebook</a> <br/>
      </div>
  );
  function getOAuthLink(providerId: servConfig.oAuthProviders): string {
    var par = servCfg.oAuth.items[providerId];
    var res = auth.getOAuthLink(servCfg.oAuth.loginUrl, { client_id: par.clientId, providerId: providerId }); 
    return res;
  }
}