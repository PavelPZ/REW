namespace login {

  login.namedRoute.changePasssword.dispatch = (par, comp) => { layout.changeScene(layout.sceneDefault, moduleId + '.changePasssword'); comp(); };

  layout.registerRenderer(layout.placeContent, moduleId + '.changePasssword', pid =>
    <div key={flux.cnt() }>
    <h2>Chane password</h2>
      </div>
  );
}