namespace login {

  class root extends flux.Module {
    constructor() {
      super(modName);
    }
    //type appClickAction = number;
    dispatchAction(type: string, action: common.IDispatchAction, complete: (action: common.IDispatchAction) => void) {
      var old = store.getState();
      switch (type) {
        case 'appclick':
          setTimeout(() => {
            store.getState().set('hello1', { actName: old.hello1.actName + '*' });
            store.getState().set('hello2', { actName: old.hello2.actName + '*' });
            store.getState().set('clickTitle', old.clickTitle + '*');
            if (complete) complete(action);
          }, 300);
          break;
        case 'click':
          let act = action as IClickAction;
          if (act.is1) old.hello1.set('actName', old.hello1.actName + '*');
          else old.hello2.set('actName', old.hello2.actName + '*');
          if (complete) complete(action);
          break;
      }
    }
    static createAppClickAction(): IAppClickAction { return { type: modName + '.appclick' }; }
    static createClickAction(is1: boolean): IClickAction { return { type: modName + '.click', is1: is1 }; }
  }
  var modName = 'login';

}