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

  interface IAction { type: string; }

  //************* FREEZER-REACT updatable component helper
  interface IFreezerProps<S> extends React.Props<any> { initState: S; }
  export class FreezerReactComponent<T extends IFreezerProps<any>, S extends IFreezerState<any>> extends React.Component<T, S>{
    constructor(props: T, initState: S) {
      super(props);
      this.state = props.initState;
    }
    componentWillReceiveProps = (nextProps: T, nextContext: any) => { if (nextProps.initState !== this.state) this.setState(nextProps.initState, () => this.state = nextProps.initState); }
    shouldComponentUpdate = (nextProps: T, nextState: S, nextContext: any) => this.state !== nextState;
    componentDidMount = () => this.state.getListener().on('update', newState => this.setState(newState, () => this.state = newState));
    componentWillUnmount = () => this.state.getListener().off('update');
    render() { return null; }
  }

  interface IAppProps extends IFreezerProps<IAppStates> { }
  interface IAppStates extends IFreezerState<IAppStates> { hello1?: IHelloWorldStates; hello2?: IHelloWorldStates; clickTitle: string }
  class App extends FreezerReactComponent<IAppProps, IAppStates>{
    render() {
      return <div>
        <div onClick={() => State.trigger(APPCLICK) }>{this.state.clickTitle}</div>
        <HelloMessage initState={this.state.hello1} is1={true}/>
        <HelloMessage initState={this.state.hello2} is1={false}/>
        </div >;
    }
  };

  interface IHelloWorldProps extends IFreezerProps<IHelloWorldStates> { is1: boolean; }
  interface IHelloWorldStates extends IFreezerState<IHelloWorldStates> { actName?: string; }

  class HelloMessage extends FreezerReactComponent<IHelloWorldProps, IHelloWorldStates>{
    render() {
      return <div onClick={() => State.trigger(CLICK, this.props.is1) }>Hello {this.state.actName}</div >;
    }
  };

  var CLICK = 'click';
  var APPCLICK = 'appclick';

  var State = new Freezer<IAppStates>({
    clickTitle: 'Click',
    hello1: { actName: 'John' },
    hello2: { actName: 'Marthy' }
  });

  State.on(APPCLICK, () => {
    var old = State.get();
    //2 moznosti
    State.get().set('hello1', { actName: old.hello1.actName + '*' }); State.get().set('hello2', { actName: old.hello2.actName + '*' }); State.get().set('clickTitle', old.clickTitle + '*'); 
    //State.get().hello1.set('actName', old.hello1.actName + '*'); State.get().hello2.set('actName', old.hello2.actName + '*');
  });
  State.on(CLICK, (is1: boolean) => {
    var old = State.get();
    if (is1) old.hello1.set('actName', old.hello1.actName + '*');
    else old.hello2.set('actName', old.hello2.actName + '*');
    var ok = old.hello1 === State.get().hello1;
  });

  class AppContainer extends React.Component<any, any> {
    render() { var state = State.get(); return <App initState={ state } />; }
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