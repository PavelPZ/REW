namespace flux {
  export interface IAppState {
    lmlogin?: lmlogin.IState; //cast globalniho flux.IFluxState, patrici aplikaci
  }
}
namespace lmlogin {
  const moduleId = 'lmlogin';

  //loginReg - udrzba APP state: pridani a ubrani loginReg casti app state
  var namedRoute = router.named.login.login = new router.RouteType(moduleId, 'r-login', '/login', router.named.login.index, {
    onEnterProc: compl => { flux.getState().lmlogin = { ids: [], error: { ids: [], id: ErrorIds.no } }; compl(); },
    onLeaveProc: () => delete flux.getState().lmlogin
  });
  //namedRoute.addChildTo(router.named.login.root);

  //layout binding
  namedRoute.dispatch = (par, comp) => { layout.changeScene(layout.sceneDefault, moduleId + '.lmlogin'); comp(); };
  layout.registerRenderer(layout.placeContent, moduleId + '.lmlogin', pid => <LMLogin initState={flux.getState().lmlogin} id='login.lm' parentId={pid}/>);

  //*** Register and Error komponenty
  export class LMLogin extends flux.SmartComponent<IProps, IState>{ render() { return getPageTemplate(this.id, this.getState()); } }
  export class Error extends flux.SmartComponent<IErrorProps, IErrorState>{ render() { return getErrorTemplate(this.getState()); } }

  export interface IState extends flux.ISmartState { error: IErrorState; }
  interface IProps extends flux.ISmartProps<IState> { }

  export enum ErrorIds { no, wrongPassword, wrongEmail }
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
          return;
        case 'error':
          var err = state.lmlogin.error; err.id = errAct.id; 
          flux.onStateChanged(state.lmlogin.error);
          break;
      }
      if (compl) compl();
    }
    static createAction(par: IFormResult): IAction { var res = par as IAction; res.moduleId = moduleId; res.actionId = 'okclick'; return res; }
    static createErrorAction(id: ErrorIds): IErrorAction { return { moduleId: moduleId, actionId: 'error', id: id }; }
  }
  export interface IAction extends flux.IAction, IFormResult { } //uspesny klik na Register tlacitko
  export interface IFormResult {
    email: string;
    psw: string;
  }

  interface IErrorAction extends flux.IAction, IError { } //jedna z moznosti navratu z REGISTER proxy
  interface IError { 
    id: ErrorIds;
  }

  new Dispatcher();
}