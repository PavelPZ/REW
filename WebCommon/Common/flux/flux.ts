namespace flux {

  export interface IFreezerProps<S> extends React.Props<any> { initState: S; }
  export class FreezerReactComponent<T extends IFreezerProps<any>, S extends IFreezerState<any>> extends React.Component<T, S>{
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

  export class Flux<S> {
    constructor(public modules: Array<Module>, initStatus: S) {
      this.setStatus(initStatus);
    }

    state: IFreezerRoot<S>;
    setStatus(status: S) {
      if (!this.state) this.state = new Freezer<S>(status);
      else this.setStatus(status);
    }
    setStatusStr(json: string) { this.setStatus(JSON.parse(json)); }
    getStatus(): {} { return this.state.get(); }
    getStatusStr(): {} { return JSON.stringify(this.getStatus()); }

    trigger(action: common.IDispatchAction) {
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
      res.dispatchAction(moduleIds[moduleIds.length - 1], action);
    }
  }
  export class Module {
    constructor(public type: string) { }
    childs: Array<Module>;
    dispatchAction(type: string, action: common.IDispatchAction) { throw 'notImplemented'; }
  }
}