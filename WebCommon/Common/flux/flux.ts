namespace flux {

  export interface IProps<S> extends React.Props<any> { initState: S; }
  export class SmartComponent<T extends IProps<any>, S extends IFreezerState<any>> extends React.Component<T, S>{
    constructor(props: T, initState: S) {
      super(props);
      this.state = props.initState;
    }
    componentWillReceiveProps = (nextProps: T, nextContext: any) => {
      if (nextProps.initState !== this.state) this.setState(nextProps.initState, () => this.state = nextProps.initState);
    }
    shouldComponentUpdate = (nextProps: T, nextState: S, nextContext: any) => this.state !== nextState;
    componentDidMount = () => this.state.getListener().on('update', newState => this.setState(newState, () => this.state = newState));
    componentWillUnmount = () => this.state.getListener().off('update');
    render() { return null; }
  }

  export class RootComponent extends React.Component<any, any>{
    constructor(props, initState) {
      super(props, initState);
      rootComponent = this;
    }
    render() { return React.createElement(testReactRouter.App, { "initState": store.getState() }); }
  }
  export var rootComponent: RootComponent;

  //ReactDOM.render(React.createElement(flux.RootComponent, null, React.createElement(App, { "initState": store.getStatus() })), document.getElementById('app'));

  export interface IRecording<S> {
    initStatus: S;
    actions: Array<common.IDispatchAction>;
  }

  export class Flux<S> {
    constructor(public modules: Array<Module>, initStatus: S) {
      store = this;
      this.setState(initStatus);
    }

    state: IFreezerRoot<S>;
    setState(status: S) {
      if (!this.state) this.state = new Freezer<S>(status); else this.state.set(status);
    }
    getState(): S { return this.state.get(); }

    trigger(action: common.IDispatchAction, complete?: (action: common.IDispatchAction) => void) {
      if (!action || !action.type) throw '!action || !action.type';
      var moduleIds = action.type.split('.');
      var mods = this.modules;
      var res: Module = null;
      if (moduleIds.length > 1)
        moduleIds.find((id, idx) => {
          var mod = mods.find(m => m.type == id); if (!mod) return false;
          if (idx < moduleIds.length - 2) {
            if (!mod.childs) return true;
            mods = mod.childs;
            return false;
          }
          res = mod;
          return true;
        });
      if (!res) throw 'Cannot find module ' + action.type;
      if (this.recording) this.recording.actions.push(action);
      res.dispatchAction(moduleIds[moduleIds.length - 1], action, complete);
    }

    recordStart() { this.recording = { initStatus: JSON.parse(JSON.stringify(this.getState())), actions: [] }; }
    recordEnd(): string { try { return JSON.stringify(this.recording); } finally { this.recording = null; } }
    play(recStr: string, interval: number, completed: () => void) {
      if (!rootComponent || !recStr) return;
      var rec = JSON.parse(recStr);
      var doPlay: () => void;
      doPlay = () => {
        if (rec.actions.length == 0) { completed(); return; }
        var act = rec.actions.splice(0, 1);
        this.trigger(act[0], act => setTimeout(() => doPlay(), interval));
      };
      this.setState(rec.initStatus);
      rootComponent.setState(this.getState());
      rootComponent.forceUpdate(() => {
        if (!rec.actions || rec.actions.length == 0) return;
        setTimeout(() => doPlay(), 1000);
      });
    }
    recording: IRecording<S>;
  }

  export var store: Flux<any>;

  export class Module {
    constructor(public type: string) { }
    childs: Array<Module>;
    dispatchAction(type: string, action: common.IDispatchAction, complete: (action: common.IDispatchAction) => void) { throw 'notImplemented'; }
  }
}