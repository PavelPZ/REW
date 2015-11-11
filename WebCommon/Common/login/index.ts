namespace login {
  export class moduleIndex extends flux.Module {
    static prefix = moduleLogin.prefix + '.index';
    constructor() { super(moduleIndex.prefix); }
    dispatchAction(type: string, action: flux.IAction, complete: (action: flux.IAction) => void) {
      switch (type) {
        case uiRouter.routerPostfix: //login.index.router action => naladuj index stranku
          break;
        case 'provider': //jdi na oauth stranku
      }
    }
    static gotoProviderAction(provider): IGotoProviderAction { return { type: moduleIndex.prefix + '.provider', provider: provider }; }
  }
  export interface IGotoProviderAction extends flux.IAction {
    provider;
  }

}
