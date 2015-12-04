namespace login {

  login.namedRoute.register.dispatch = (par, comp) => { layout.changeScene(layout.sceneDefault, moduleId + '.register'); comp(); };

  interface IRegResult {
    email: string;
    psw: string;
    pswc: string;
    firstName: string;
    lastName: string;
  }

  interface IRegStatus {

  }

  export class Register extends flux.DumpComponent<any, any>{
    render() {
      return <div key={flux.cnt() }>
        <h2>Register</h2>
        <validation.Group okTitle='Ok' cancelTitle='Cancel' onCancel={utils.Noop} onOk={this.onOK}>
          <validation.Input validator={{ type: validation.types.email }} idPtr={(r: IRegResult) => r.email} title='eMail'/><br/>
          <validation.Input validator={{ type: validation.types.required }} idPtr={(r: IRegResult) => r.psw} title='Password' type='password'/><br/>
          <validation.Input validator={{ type: validation.types.equalTo, equalToId: utils.propName((r: IRegResult) => r.psw) }} idPtr={(r: IRegResult) => r.pswc} title='Confirm password' type='password'/><br/>
          <validation.Input validator={{ type: validation.types.no }} idPtr={(r: IRegResult) => r.firstName} title='First name' /><br/>
          <validation.Input validator={{ type: validation.types.no }} idPtr={(r: IRegResult) => r.lastName} title='Last name'/>
          </validation.Group>
        </div>;
    }
    onOK(res: IRegResult) {
      var guid = utils.guid();
      //temporary registrace
      proxies.auth.Register(res.email, res.psw, res.firstName, res.lastName, guid, rc => {
        if (rc == proxies.auth.ServiceResult.userAlreadyExists) {
        } else {
          var em: emailer.emailMsg = {
            from: { email: 'support@langmaster.cz', title: 'LANGMaster Support' },
            to: [{ email: res.email, title: res.firstName + ' ' + res.lastName }],
            subject: 'LANGMaster Confirm Registration',
            body: (React as any).renderToStaticMarkup(emailRegister({ url: '#', title: 'Confirm' }))
          };
          proxies.email.Send(JSON.stringify(em), () => {
            //TODO
          }, err => { /*TODO*/ ajax.throwError(err); });
        }
      });
    }
  }
  
  layout.registerRenderer(layout.placeContent, moduleId + '.register', pid => <Register/>);
}