//React "Hello World" Examples: https://gist.github.com/danawoodman/9cfddb1a0c934a35f31a
//https://facebook.github.io/react/docs/component-api.html
//https://facebook.github.io/react/docs/top-level-api.html#reactdom.finddomnode
//http://redux.js.org/docs/introduction/
//https://github.com/rackt/react-redux/releases
//Imutable helper: https://facebook.github.io/react/docs/update.html, https://facebook.github.io/react/docs/advanced-performance.html
//HELP: https://github.com/rackt/react-redux/blob/master/docs/api.md

//D:\LMCom\rew\WebLogin\scripts\typings\react-redux.d.ts
//export function connect<P>(mapStateToProps?: MapStateToProps,
//  mapDispatchToProps?: MapDispatchToPropsFunction | MapDispatchToPropsObject,
//  mergeProps?: MergeProps,
//  options?: Options): (cls: React.ClassicComponentClass<P>) => React.ClassicComponentClass<P>;

//D:\LMCom\rew\WebLogin\scripts\typings\react-global.d.ts
//import ReactDOM = __React; 

namespace testReactRouter {

  //*********************** DISPATCH MODULE definition
  interface IAppClickAction extends common.IDispatchAction { }
  interface IClickAction extends common.IDispatchAction { is1: boolean; }

  class mod1 extends flux.Module {
    constructor() {
      super(mod1.modName);
    }
    //type appClickAction = number;
    dispatchAction(type: string, action: common.IDispatchAction, complete: (action: common.IDispatchAction) => void) {
      var old = store.getStatus();
      switch (type) {
        case 'appclick':
          setTimeout(() => {
            store.getStatus().set('hello1', { actName: old.hello1.actName + '*' });
            store.getStatus().set('hello2', { actName: old.hello2.actName + '*' });
            store.getStatus().set('clickTitle', old.clickTitle + '*');
            if (complete) complete(action);
          }, 100);
          break;
        case 'click':
          let act = action as IClickAction;
          if (act.is1) old.hello1.set('actName', old.hello1.actName + '*');
          else old.hello2.set('actName', old.hello2.actName + '*');
          if (complete) complete(action);
          //var ok = old.hello1 === store.state.get().hello1;
          break;
      }
    }
    static modName = 'mod1';
    static createAppClickAction(): IAppClickAction { return { type: mod1.modName + '.appclick' }; }
    static createClickAction(is1: boolean): IClickAction { return { type: mod1.modName + '.click', is1: is1 }; }
  }

  //************* VIEW
  class App extends flux.SmartComponent<IAppProps, IAppStates>{
    render() {
      return <div>
        <div onClick={() => store.trigger(mod1.createAppClickAction()) }>{this.state.clickTitle}</div>
        <HelloMessage initState={this.state.hello1} is1={true}/>
        <HelloMessage initState={this.state.hello2} is1={false}/>
        </div >;
    }
  };
  interface IAppProps extends flux.IProps<IAppStates> { }
  interface IAppStates extends IFreezerState<IAppStates> { hello1?: IHelloWorldStates; hello2?: IHelloWorldStates; clickTitle: string }

  class HelloMessage extends flux.SmartComponent<IHelloWorldProps, IHelloWorldStates>{
    render() {
      return <div onClick={() => store.trigger(mod1.createClickAction(this.props.is1)) }>Hello {this.state.actName}</div >;
    }
  };
  interface IHelloWorldProps extends flux.IProps<IHelloWorldStates> { is1: boolean; }
  interface IHelloWorldStates extends IFreezerState<IHelloWorldStates> { actName?: string; }

  //************* WHOLE APP
  var store = new flux.Flux<IAppStates>([new mod1()], {
    clickTitle: 'Click',
    hello1: { actName: 'John' },
    hello2: { actName: 'Marthy' }
  })

  class AppContainer extends React.Component<any, any> {
    render() { var state = store.getStatus(); return <App initState={ state } />; }
  }

  ReactDOM.render(
    <AppContainer/>,
    document.getElementById('app')
  );
  //var str = React.renderToStaticMarkup(<HelloMessage initName="John" />);
  //alert(str);
  //var str = React.renderToString(<HelloMessage initName="John" />);
  //alert(str);
}