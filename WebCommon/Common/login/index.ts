namespace login {
  export class moduleIndex extends flux.Module {
    static moduleId = 'login.index';
    constructor() { super(moduleIndex.moduleId); }
    dispatchAction(action: flux.IAction, complete: (action: flux.IAction) => void) {
      switch (action.actionId) {
        case uiRouter.routerActionId: //naladuj index stranku
          break;
        case 'get-provider': //jdi na oauth stranku
          break;
      }
    }
    static gotoProviderAction(provider): IGotoProviderAction { return { moduleId: moduleIndex.moduleId, actionId: 'get-provider', provider: provider }; }
  }
  export interface IGotoProviderAction extends flux.IAction {
    provider;
  }

}
