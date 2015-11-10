namespace common {
  export interface IGlobalCtx {
    flux: {
      trigger: (action: common.IDispatchAction) => void;
    };
  }
}
namespace flux {

  export var store: Flux<any>; //flux store, obsahujici root state
  export var rootComponent: SmartComponent<any, any>; //v musi se naplnit v konstruktoru root komponenty. Kvuli recordingu.
  export function trigger(action: common.IDispatchAction) { store.trigger(action); }

  export class DummyComponent<T, S> extends React.Component<T, S>{
    static childContextTypes = { ctx: React.PropTypes.any }
    static contextTypes = { ctx: React.PropTypes.any }
    context: common.IGlobalContext;
  }
  export class SmartComponent<T extends IProps<any>, S extends IFreezerState<any>> extends DummyComponent<T, S>{
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
    props: T;
    state: S;
  }
  export interface IProps<S> extends React.Props<any> { initState: S; }

  export class RootComponent<T extends IProps<any>, S extends IFreezerState<any>> extends SmartComponent<T, S>{
    constructor(props: T, initState: S) {
      super(props, initState);
      flux.rootComponent = this;
    }
    getChildContext = () => { return common.globalContext; }
  }

  export class Flux<S> {
    constructor(public modules: Array<Module>, initStatus: S) {
      store = this;
      this.setState(initStatus);
      common.globalContext.ctx.flux = { trigger: this.trigger };
      //common.$flux$trigger = this.trigger;
    }

    setState(status: S) { if (!this.state) this.state = new Freezer<S>(status); else this.state.set(status); }
    getState(): S { return this.state.get(); }
    state: IFreezerRoot<S>;

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

    //****************** ACTION and STATUS recording
    recordStart() { this.recording = { initStatus: this.getState(), actions: [] }; }
    recordEnd(): string { try { return JSON.stringify(this.recording, null, 2); } finally { this.recording = null; } }
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
      setTimeout(() => doPlay(), interval);
    }
    recording: IRecording<S>;
  }
  interface IRecording<S> { initStatus: S; actions: Array<common.IDispatchAction>; }

  export class Module {
    constructor(public type: string) { }
    childs: Array<Module>;
    dispatchAction(type: string, action: common.IDispatchAction, complete: (action: common.IDispatchAction) => void) { throw 'notImplemented'; }
  }
}