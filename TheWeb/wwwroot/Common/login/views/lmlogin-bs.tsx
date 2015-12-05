namespace lmlogin {

  export function getPageTemplate(pid: string, st: IState): JSX.Element {
    return <div key={flux.cnt() }>
      <h2>Login</h2>
        <validation.Group okTitle='Ok' cancelTitle='Cancel' onCancel={utils.Noop} onOk={(res: IAction) => flux.trigger(Dispatcher.createAction(res)) }>
            <validation.Input validator={{ type: validation.types.email }} idPtr={(r: IAction) => r.email} title='eMail'/><br/>
            <validation.Input validator={{ type: validation.types.required }} idPtr={(r: IAction) => r.psw} title='Password' type='password'/>
          </validation.Group>
        <hr/>
        <a href='#' onClick={ev => router.navigRoute(router.named.login.register, ev) }>Register</a> |
        <a href='#' onClick={ev => router.navigRoute(router.named.login.forgotPsw, ev) }>Forgot password</a> |
        {st.error.id == ErrorIds.no ? null : <lmlogin.Error initState={flux.getState().lmlogin.error} id='lmlogin.Error' parentId={pid}/>}
      </div>;
  }

  export function getErrorTemplate(st: IErrorState): JSX.Element {
    switch (st.id) {
      case ErrorIds.wrongEmail:
      case ErrorIds.wrongPassword:
        return <div key={flux.cnt() }>
          Wrong login or password
          </div>;
    }
  }

}