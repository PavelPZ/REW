namespace login {

  login.namedRoute.editProfile.dispatch = (par, comp) => { layout.changeScene(layout.sceneDefault, moduleId + '.editProfile'); comp(); };

  layout.registerRenderer(layout.placeContent, moduleId + '.editProfile', pid =>
    <div key={flux.cnt() }>
    <h2>Edit profile</h2>
      </div>
  );
}