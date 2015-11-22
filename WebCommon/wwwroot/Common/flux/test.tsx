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


namespace config {
  export interface IData {
    mod1?: {
      prefix: string;
    };
  }
  cfg.data.mod1 = {} as any;
}
namespace flux {
  export interface IAppState {
    fluxTest?: fluxTest.IAppState;
    fluxTestPlacer?: fluxTest.IPlaceHolderState;
    fluxTestSwitcher?: layout.ISwitcherState;
  }
}

namespace fluxTest {

  //*********************** DISPATCH MODULE definition
  interface IAppClickAction extends flux.IAction { }
  interface IClickAction extends flux.IAction { scopeComponent: string; /*akce nad self, ktera meni self stav*/ }

  config.cfg.data.mod1.prefix = 'Hello';

  class mod1 extends flux.Dispatcher {
    constructor() {
      super(mod1.moduleId);
    }

    dispatchAction(action: flux.IAction, complete: (action: flux.IAction) => void) {
      let old = flux.getState().fluxTest;
      var oldPlace = flux.getState().fluxTestPlacer;
      switch (action.actionId) {
        case 'appclick':
          setTimeout(() => {
            let old = flux.getState().fluxTest;
            old.hello1.actName += '*';
            old.hello2.actName += '*';
            old.clickTitle += '*';
            flux.onStateChanged(old);
            if (complete) complete(action); //async complete, musi nasledovat return;
          }, 300);
          return;
          break;
        case 'click':
          let act = action as IClickAction;
          var comp = flux.findComponent<HelloMessage>(act.scopeComponent);
          comp.props.initState.actName += '*';
          flux.onStateChanged(comp.props.initState);
          break;
        case 'placehloderClick':
          oldPlace.isApp = !oldPlace.isApp; flux.onStateChanged(oldPlace);
          break;
      }
      //sync complete
      if (complete) complete(action);
    }
    static moduleId = 'mod1';
    static createAppClickAction(): IAppClickAction { return { moduleId: mod1.moduleId, actionId: 'appclick' }; }
    static createPlaceholderClickAction(): flux.IAction { return { moduleId: mod1.moduleId, actionId: 'placehloderClick' }; }
    static createClickAction(scopeComponent: string/*akce nad self, ktera meni self stav*/): IClickAction { return { moduleId: mod1.moduleId, actionId: 'click', scopeComponent: scopeComponent }; }
  }

  //************* VIEW hvezdicky
  export class App extends flux.SmartComponent<IAppProps, IAppState>{
    render() {
      super.render();
      var st = this.getState();
      return <div key={flux.cnt() }>
        <div>
          <div onClick={() => flux.trigger(mod1.createAppClickAction()) }>{st.clickTitle}</div>
          <HelloMessage initState={st.hello1 } is1={1} parentId={this.id} id='fluxTest.HelloMessage1'/>
          <HelloMessage initState={st.hello2 } is1={2} parentId={this.id} id='fluxTest.HelloMessage2'/>
          <br/>
          </div>
        <div>
          <div onClick={() => flux.trigger(mod1.createAppClickAction()) }>{st.clickTitle}</div>
          <HelloMessage initState={st.hello1 } is1={1} parentId={this.id} id='fluxTest.HelloMessage3'/>
          <HelloMessage initState={st.hello2 } is1={2} parentId={this.id} id='fluxTest.HelloMessage4'/>
          <br/>
          </div>
        </div>;
    }
  };
  interface IAppProps extends flux.ISmartProps<IAppState> { }
  export interface IAppState extends flux.ISmartState { hello1?: IHelloWorldState; hello2?: IHelloWorldState; clickTitle: string, inputValue?: string }

  class HelloMessage extends flux.SmartComponent<IHelloWorldProps, IHelloWorldState>{
    render() {
      super.render();
      return <div key={flux.cnt() } onClick={() => flux.trigger(mod1.createClickAction(this.id)) }>{config.cfg.data.mod1.prefix } {this.getState().actName}</div >;
    }
    props: IHelloWorldProps;
  };
  interface IHelloWorldProps extends flux.ISmartProps<IHelloWorldState> { is1: number; }
  interface IHelloWorldState extends flux.ISmartState { actName?: string; }

  //************* VIEW placeholder
  export class Switcher extends flux.SmartComponent<IPlaceHolderProps, IPlaceHolderState>{
    render() {
      super.render();
      var st = this.getState();
      return <div key={flux.cnt() }>
        <p onClick={() => flux.trigger(mod1.createPlaceholderClickAction()) }>click</p>
        <div>{st.isApp ? (<App initState={flux.getState().fluxTest} parentId={this.id} id='fluxTest.App'/>) : (<HelloMessage initState={st.hello} is1={3} parentId={this.id} id='fluxTest.HelloMessage' />) }</div>
        </div>
        ;
    }
  }
  interface IPlaceHolderProps extends flux.ISmartProps<IPlaceHolderState> { }
  export interface IPlaceHolderState extends flux.ISmartState { isApp: boolean; hello: IHelloWorldState; }


  //************* WHOLE APP
  //** inicializace aplikace x
  config.cfg.initProc(config.initProcPhase.start);

  new mod1();

  var root = () => <layout.Switcher key={flux.cnt() } initState={flux.getState().fluxTestSwitcher} parentId={''} id='layout.PlaceHolder' cases={{
    app: pid => <App  key={flux.cnt() } initState={flux.getState().fluxTest} parentId={pid} id='fluxTest.App'/>,
    place: pid => <Switcher  key={flux.cnt() } initState={flux.getState().fluxTestPlacer} parentId={pid} id='fluxTest.Switcher'/>
  }}/>;

  var state = {
    fluxTest: {
      ids: [],
      clickTitle: 'Click',
      hello1: { actName: 'John', ids: [] },
      hello2: { actName: 'Marthy', ids: [] }
    },
    fluxTestPlacer: {
      ids: [],
      isApp: false,
      hello: { ids: [], actName: 'John' },
      //hello: { actName: 'hello', ids: [] }
    },
    fluxTestSwitcher: { ids: [], caseId: 'place' }
  };

  flux.initApplication(document.getElementById('app'), state, root);

}