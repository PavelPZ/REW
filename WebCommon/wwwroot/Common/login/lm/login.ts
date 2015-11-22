namespace login {
  export class moduleLMLogin extends flux.Dispatcher {
    static moduleId = 'login.lmlogin';
    constructor() { super(moduleIndex.moduleId); }
    dispatchAction(action: flux.IAction, complete: (action: flux.IAction) => void) {
      switch (action.actionId) {
        case router.routerActionId: //login.index.router action => naladuj index stranku
          break;
        case 'get-provider': //jdi na oauth stranku
      }
    }
    static gotoProviderAction(provider): IGotoProviderAction { return { moduleId: moduleIndex.moduleId, actionId: 'get-provider', provider: provider }; }
  }
}
