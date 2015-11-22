namespace login {
  export class moduleIndex extends flux.Dispatcher {
    static moduleId = 'login.index';
    constructor() { super(moduleIndex.moduleId); }
    dispatchAction(action: flux.IAction, complete: (action: flux.IAction) => void) {
      switch (action.actionId) {
        case router.routerActionId: //naladuj index stranku
          break;
        case 'get-provider': //reakce na vybrani OAuth providera
          break;
      }
    }
    static gotoProviderAction(provider): IGotoProviderAction { return { moduleId: moduleIndex.moduleId, actionId: 'get-provider', provider: provider }; }
  }
  export interface IGotoProviderAction extends flux.IAction {
    provider;
  }
  new moduleIndex();

  export class IndexPage extends flux.SmartComponent<any, any>{
    //static create () : any
  }

}
