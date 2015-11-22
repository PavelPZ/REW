namespace login {
  layout.registerRenderer(layout.placeContent, moduleId + '.home', pid => <h2 key={flux.cnt() }>Login home</h2>);
  login.namedRoute.home.dispatch = (par, comp) => {
    layout.changeScene(layout.sceneDefault, moduleId + '.home'); if (comp) comp(null);
  }
}