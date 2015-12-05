namespace loginReg {

  export function getPageTemplate(pid:string, st: IState): JSX.Element {
    return <div key={flux.cnt() }>
      <h2>Register</h2>
      {st.error.id == ErrorIds.ok ? null : <validation.Group okTitle='Ok' cancelTitle='Cancel' onCancel={utils.Noop} onOk={(res: IFormResult) => flux.trigger(Dispatcher.createAction(res)) }>
        <validation.Input validator={{ type: validation.types.email }} idPtr={(r: IFormResult) => r.email} title='eMail'/><br/>
        <validation.Input validator={{ type: validation.types.required }} idPtr={(r: IFormResult) => r.psw} title='Password' type='password'/><br/>
        <validation.Input validator={{ type: validation.types.equalTo, equalToId: utils.propName((r: IFormResult) => r.psw) }} idPtr={(r: IAction) => r.pswc} title='Confirm password' type='password'/><br/>
        <validation.Input validator={{ type: validation.types.no }} idPtr={(r: IFormResult) => r.firstName} title='First name' /><br/>
        <validation.Input validator={{ type: validation.types.no }} idPtr={(r: IFormResult) => r.lastName} title='Last name'/>
        </validation.Group>
      }
      {st.error.id == ErrorIds.no ? null : <loginReg.Error initState={flux.getState().loginReg.error} id='loginReg.Error' parentId={pid}/>}
      </div>;
  }

  export function getErrorTemplate(st: IErrorState): JSX.Element {
    switch (st.id) {
      case ErrorIds.no:
        return <div key={flux.cnt() }>
          OK, confirmation email to {st.actEmail} send.
          Check your emails to finish registration.
          </div>;
      case ErrorIds.alreadyRegistered:
        return <div key={flux.cnt() }>
          Users email {st.actEmail} already registered.
          Forgot password?
          Link to XXX
          </div>;
      case ErrorIds.wrongEmail:
        return <div key={flux.cnt() }>
          ERROR, cannot send confirmation email to {st.actEmail}.Is email OK?
          (Error: {st.wrongEmailMsg})
          </div>;
    }
  }

}