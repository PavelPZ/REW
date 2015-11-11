﻿namespace config {
  export interface IData {
    flux: {
      trigger: (action: flux.IAction) => void;
    };
  }
}
namespace flux {

  export var store: Flux<any>; //flux store, obsahujici root state
  export var rootComponent: SmartComponent<any, any>; //v musi se naplnit v konstruktoru root komponenty. Kvuli recordingu.
  export function trigger(action: IAction) { store.trigger(action); }

  export class Component<T extends React.Props<any>, S> extends React.Component<T, S> {
    props: T; state: S;
  }
  export interface IComponentProps extends React.Props<any> { }

  export class DummyComponent<T, S> extends Component<T, S>{
    static childContextTypes = { [config.ctxPropName]: React.PropTypes.any }
    static contextTypes = { [config.ctxPropName]: React.PropTypes.any }
    context: config.IObj;
  }
  export class SmartComponent<T extends ISmartProps<any>, S extends IFreezerState<any>> extends DummyComponent<T & ISmartProps<S>, IFreezerState<S>>{
    constructor(props, ctx: any) {
      super(props, ctx);
      this.state = this.props.initState;
    }
    props: T; state: S;
    componentWillReceiveProps = (nextProps: T & ISmartProps<S>, nextContext: any) => {
      if (nextProps.initState !== this.state) this.setState(nextProps.initState, () => this.state = nextProps.initState);
    }
    shouldComponentUpdate = (nextProps: T, nextState: S, nextContext: any) => this.state !== nextState;
    componentDidMount = () => this.state.getListener().on('update', newState => this.setState(newState, () => this.state = newState));
    componentWillUnmount = () => this.state.getListener().off('update');
    render() { return null; }
  }
  export interface ISmartProps<S> extends IComponentProps { initState: S; }

  export class RootComponent<T extends ISmartProps<any>, S extends IFreezerState<any>> extends SmartComponent<T, S>{
    constructor(props: T, ctx: any) {
      super(props, ctx);
      flux.rootComponent = this;
    }
    getChildContext = () => { return config.cfg; }
  }

  export class Flux<S> {
    constructor(public modules: Array<Module>, initStatus: S) {
      store = this;
      this.setState(initStatus);
      config.cfg.data.flux = { trigger: this.trigger };
      //common.$flux$trigger = this.trigger;
    }

    setState(status: S) { if (!this.state) this.state = new Freezer<S>(status); else this.state.set(status); }
    getState(): S { return this.state.get(); }
    state: IFreezerRoot<S>;

    trigger(action: IAction, complete?: (action: IAction) => void) {
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
  interface IRecording<S> { initStatus: S; actions: Array<IAction>; }

  export class Module {
    constructor(public type: string) { }
    childs: Array<Module>;
    dispatchAction(type: string, action: IAction, complete: (action: IAction) => void) { throw 'notImplemented'; }
  }
}