namespace flux {
  export interface IAppState {
    loginReg?: loginReg.IState; //cast globalniho flux.IFluxState, patrici aplikaci
  }
}
namespace loginReg {
  const moduleId = 'login-reg';

  //loginReg - udrzba APP state: pridani a ubrani loginReg casti app state
  var namedRoute = router.named.login.register = new router.RouteType(moduleId, 'r-register', '/register', router.named.login.root, {
    onEnterProc: compl => { flux.getState().loginReg = { ids: [], error: { ids: [], id: ErrorIds.no } }; compl(); },
    onLeaveProc: () => delete flux.getState().loginReg
  });
  //namedRoute.addChildTo(router.named.login.root);

  //layout binding
  namedRoute.dispatch = (par, comp) => { layout.changeScene(layout.sceneDefault, moduleId + '.register'); comp(); };
  layout.registerRenderer(layout.placeContent, moduleId + '.register', pid => <Register initState={flux.getState().loginReg} id='login.reg' parentId={pid}/>);

  //*** Register and Error komponenty
  export class Register extends flux.SmartComponent<IProps, IState>{ render() { return getPageTemplate(this.id, this.getState()); } }
  export class Error extends flux.SmartComponent<IErrorProps, IErrorState>{ render() { return getErrorTemplate(this.getState()); } }

  export interface IState extends flux.ISmartState { error: IErrorState; }
  interface IProps extends flux.ISmartProps<IState> { }

  export enum ErrorIds { no, ok, alreadyRegistered, wrongEmail }
  export interface IErrorState extends flux.ISmartState, IError { }
  interface IErrorProps extends flux.ISmartProps<IErrorState> { }

  //*** dispatcher a akce
  export class Dispatcher extends flux.Dispatcher {
    constructor() { super(moduleId); }
    dispatchAction(action: flux.IAction, compl: utils.TCallback) {
      var state = flux.getState();
      var act = action as IAction; var errAct = action as IErrorAction;
      switch (action.actionId) {
        case 'okclick':
          var guid = utils.guid();
          //temporary registrace
          proxies.auth.Register(act.email, act.psw, act.firstName, act.lastName, guid, rc => {
            if (rc == proxies.auth.ServiceResult.userAlreadyExists) {
              flux.trigger(Dispatcher.createErrorAction(ErrorIds.alreadyRegistered, act.email)); compl();
            } else {
              var em: emailer.emailMsg = {
                from: { email: 'support@langmaster.cz', title: 'LANGMaster Support' },
                to: [{ email: act.email, title: act.firstName + ' ' + act.lastName }],
                subject: 'LANGMaster Confirm Registration',
                body: (React as any).renderToStaticMarkup(emailRegister({ url: router.getInternalUrl<login.IConfirmRoutePar>(login.namedRoute.confirmRegister, { confirmId: guid }), title: 'Confirm' }))
              };
              proxies.email.Send(JSON.stringify(em), () => {
                flux.trigger(Dispatcher.createErrorAction(ErrorIds.ok, act.email));
                compl();
              }, err => {
                flux.trigger(Dispatcher.createErrorAction(ErrorIds.wrongEmail, act.email, err.result.responseText)); //ajax.throwError(err);
                compl();
              });
            }
          });
          return;
        case 'error':
          var err = state.loginReg.error; err.id = errAct.id; err.actEmail = errAct.actEmail; err.wrongEmailMsg = errAct.wrongEmailMsg;
          if (err.id == ErrorIds.ok) flux.onStateChanged(state.loginReg); else flux.onStateChanged(state.loginReg.error);
          break;
      }
      if (compl) compl();
    }
    static createAction(par: IFormResult): IAction { var res = par as IAction; res.moduleId = moduleId; res.actionId = 'okclick'; return res; }
    static createErrorAction(id: ErrorIds, actEmail: string, wrongEmailMsg?: string): IErrorAction { return { moduleId: moduleId, actionId: 'error', id: id, actEmail: actEmail, wrongEmailMsg: wrongEmailMsg }; }
  }
  export interface IAction extends flux.IAction, IFormResult { } //uspesny klik na Register tlacitko
  export interface IFormResult {
    email: string;
    psw: string;
    pswc: string;
    firstName: string;
    lastName: string;
  }

  interface IErrorAction extends flux.IAction, IError { } //jedna z moznosti navratu z REGISTER proxy
  interface IError { 
    id: ErrorIds;
    actEmail?: string;
    wrongEmailMsg?: string;
  }

  new Dispatcher();
}