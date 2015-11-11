namespace login {
  export class moduleLMLogin extends flux.Module {
    static postfix = 'lmlogin';
    static prefix = moduleLogin.prefix + '.' + moduleLogin.postfix;
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
}
