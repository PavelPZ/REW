﻿//React "Hello World" Examples: https://gist.github.com/danawoodman/9cfddb1a0c934a35f31a
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

namespace config {
  export interface IData {
    mod1: {
      prefix: string;
    };
  }
  cfg.data.xxx = {};
}
namespace flux {
  export interface IWebState {
    fluxTest?: IFreezerState<fluxTest.IAppState> & fluxTest.IAppState;
  }
}

namespace fluxTest {

  //*********************** DISPATCH MODULE definition
  interface IAppClickAction extends flux.IAction { }
  interface IClickAction extends flux.IAction { is1: boolean; }

  config.cfg.data.mod1 = { prefix: 'Hello' };

  class mod1 extends flux.Module {
    constructor() {
      super(mod1.moduleId);
    }
    //type appClickAction = number;
    dispatchAction(action: flux.IAction, complete: (action: flux.IAction) => void) {
      var old = flux.getState().fluxTest;
      switch (action.actionId) {
        case 'appclick':
          setTimeout(() => {
            flux.getState().fluxTest.set('hello1', { actName: old.hello1.actName + '*' });
            flux.getState().fluxTest.set('hello2', { actName: old.hello2.actName + '*' });
            flux.getState().fluxTest.set('clickTitle', old.clickTitle + '*');
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
    static moduleId = 'mod1';
    static createAppClickAction(): IAppClickAction { return { moduleId: mod1.moduleId, actionId: 'appclick' }; }
    static createClickAction(is1: boolean): IClickAction { return { moduleId: mod1.moduleId, actionId: 'click', is1: is1 }; }
  }

  //************* VIEW
  export class App extends flux.SmartComponent<IAppProps, IAppState>{
    render() {
      return <div>
        <p>
          <div onClick={() => flux.trigger(mod1.createAppClickAction()) }>{this.state.clickTitle}</div>
          <HelloMessage initState={HelloMessage.locateState() } is1={true}/>
          <HelloMessage initState={HelloMessage.locateState2() } is1={false}/>
          </p>
        {/*<p>
          <div onClick={() => flux.trigger(mod1.createAppClickAction()) }>{this.state.clickTitle}</div>
          <HelloMessage initState={this.state.hello1} is1={true}/>
          <HelloMessage initState={this.state.hello2} is1={false}/>
          </p>*/}
        </div>;
    }
  };
  interface IAppProps extends flux.ISmartProps<IAppState> { }
  export interface IAppState extends IFreezerState<IAppState> { hello1?: IHelloWorldState; hello2?: IHelloWorldState; clickTitle: string, inputValue?: string }

  class HelloMessage extends flux.SmartComponent<IHelloWorldProps, IHelloWorldState>{
    render() {
      return <div onClick={() => flux.trigger(mod1.createClickAction(this.props.is1)) }>{this.context.data.mod1.prefix } {this.state.actName}</div >;
    }
    static locateState() { return flux.getState().fluxTest.hello1; }
    static locateState2() { return flux.getState().fluxTest.hello2; }
  };
  interface IHelloWorldProps extends flux.ISmartProps<IHelloWorldState> { is1: boolean; }
  interface IHelloWorldState extends IFreezerState<IHelloWorldState> { actName?: string; }

  //************* WHOLE APP
  new mod1();
  flux.initWebState(
    {
      fluxTest: {
        clickTitle: 'Click',
        hello1: { actName: 'John' },
        hello2: { actName: 'Marthy' }
      }
    },
    () => ReactDOM.render(
      <flux.Web initState={flux.getState() }><App initState={flux.getState().fluxTest }/></flux.Web>,
      document.getElementById('app')
    )
  );
}