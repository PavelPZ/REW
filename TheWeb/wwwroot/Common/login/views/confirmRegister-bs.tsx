namespace flux {
  export interface IAppState {
    loginRegConfirm?: loginRegConfirm.IState; //cast globalniho flux.IFluxState, patrici aplikaci
  }
}
namespace loginRegConfirm {
  const moduleId = 'login-reg-conf';

  var namedRoute = router.named.login.confirmRegister = new router.Route<login.IConfirmRoutePar>(moduleId, 'r-confirmRegister', '/confirmRegister?{confirmId}', {
    onLeaveProc: () => delete flux.getState().loginRegConfirm
  });
  namedRoute.addChildTo(router.named.login.root);

  login.namedRoute.confirmRegister.dispatch = (par: login.IConfirmRoutePar, comp) => {
    proxies.auth.ConfirmRegistration(par.confirmId, res => {
      flux.getState().loginRegConfirm = res;
      layout.changeScene(layout.sceneDefault, moduleId + '.confirmReg');
      comp();
    });
  };

  layout.registerRenderer(layout.placeContent, moduleId + '.confirmReg', pid => {
    var st = flux.getState().loginRegConfirm;
    //alreadyConfirmed, confirmExpired, ok
    switch (st.result) {
      case proxies.auth.ServiceResult.alreadyConfirmed:
      case proxies.auth.ServiceResult.ok:
        return <div key={flux.cnt() }>
          <h2>Registration confirmed</h2>
          <a href='#' onClick={ev => router.navigRoute(router.named.login.login, ev) }>Login</a>
          </div>;
      case proxies.auth.ServiceResult.confirmExpired:
        <div key={flux.cnt() }>
          <h2>Confirm email expired</h2>
          <a href='#' onClick={ev => router.navigRoute(router.named.login.register, ev) }>Register again</a>
          </div>;
        break;
      default: loger.doThrow('not impl');
    }
  });

  export interface IState { email: string; firstName: string; lastName: string; result: proxies.auth.ServiceResult }

}