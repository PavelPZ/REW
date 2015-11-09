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

  export interface IRecording<S> {
    initStatus: S;
    actions: Array<common.IDispatchAction>;
  }

  export class Flux<S> {
    constructor(public modules: Array<Module>, initStatus: S) {
      store = this;
      this.setStatus(initStatus);
    }

    state: IFreezerRoot<S>;
    setStatus(status: S) {
      if (!this.state) this.state = new Freezer<S>(status);
      else this.state.set(status);
    }
    getStatus(): S { return this.state.get(); }

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

    recordStart() { this.recording = { initStatus: this.getStatus(), actions: [] }; }
    recordEnd(): IRecording<S> { try { return this.recording; } finally { this.recording = null; } }
    play(rec: IRecording<S>, interval: number, completed: () => void) {
      if (!rec) return;
      var doPlay: () => void;
      doPlay = () => {
        if (rec.actions.length == 0) { completed(); return; }
        var act = rec.actions.splice(0, 1);
        this.trigger(act[0], act => setTimeout(() => doPlay(), interval));
      };
      setTimeout(() => {
        this.setStatus(rec.initStatus);
        return;
        if (!rec.actions || rec.actions.length == 0) return;
        setTimeout(() => doPlay(), 2000);
      }, 2000);
      
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