namespace login {

  login.namedRoute.register.dispatch = (par, comp) => { layout.changeScene(layout.sceneDefault, moduleId + '.register'); comp(); };

  layout.registerRenderer(layout.placeContent, moduleId + '.register', pid =>
    <div key={flux.cnt() }>
    <h2>Register</h2>
      <validation.Group okTitle='Ok' cancelTitle='Cancel' onCancel={utils.Noop} onOk={utils.Noop}>
      <validation.Input validator={{ type: validation.types.email }} id='email' title='eMail'/><br/>
      <validation.Input validator={{ type: validation.types.required | validation.types.stringLength, minLength: 3 }} id='psw' title='Password' type='password'/><br/>
      <validation.Input validator={{ type: validation.types.equalTo, equalToId: 'psw' }} id='pswConf' title='Confirm password'  type='password'/>
        </validation.Group>
      </div>
  );
}