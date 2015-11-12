namespace config {
  export interface IData {
    flux: {
      trigger: (action: flux.IAction, completed?: (action: flux.IAction) => void) => void;
    };
  }
}
namespace flux {

  export interface IWebState { }

  //export var rootComponent: SmartComponent<any, any>; //v musi se naplnit v konstruktoru root komponenty. Kvuli recordingu.
  export var rootComponent: React.Component<any, any>;

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
      //var newProp = this.props !== nextProps;
      //var newInitState = this.props.initState !== nextProps.initState;
      if (nextProps.initState !== this.state) this.setState(nextProps.initState, () => this.state = nextProps.initState);
    }
    shouldComponentUpdate = (nextProps: T, nextState: S, nextContext: any) => this.state !== nextState;
    componentDidMount = () => this.state.getListener().on('update', newState => this.setState(newState, () => this.state = newState));
    componentWillUnmount = () => this.state.getListener().off('update');
  }
  export interface ISmartProps<S> extends IComponentProps { initState: S; }

  export function initWebState(webState: IWebState, doRootRender: () => void) {
    state = new Freezer<IWebState>(webState);
    rootRender = doRootRender;
    rootRender();
  }

  export function getState(): IWebState { return state.get(); }
  export function trigger(action: IAction, complete?: (action: IAction) => void) {
    if (!action || !action.moduleId || !action.actionId) throw '!action || !action.type';
    var res = allModules[action.moduleId]; if (!res) throw 'Cannot find module ' + action.moduleId;
    if (recording) recording.actions.push(action);
    res.dispatchAction(action, complete);
  }

  export function recordStart() { recording = { initStatus: getState(), actions: [] }; }
  export function recordEnd(): string { try { return recording ? JSON.stringify(recording, null, 2) : null; } finally { recording = null; } }
  export function play(recStr: string, interval: number, completed: () => void) {
    if (!rootComponent || !recStr) return;
    var rec: IRecording = JSON.parse(recStr);
    var doPlay: () => void;
    doPlay = () => {
      if (rec.actions.length == 0) { completed(); return; }
      var act = rec.actions.splice(0, 1);
      trigger(act[0], act => setTimeout(() => doPlay(), interval));
    };
    state = new Freezer<IWebState>(rec.initStatus);
    ReactDOM.unmountComponentAtNode(document.getElementById('app'));
    rootRender();
    setTimeout(() => doPlay(), interval);
  }

  interface IRecording { initStatus: IWebState; actions: Array<IAction>; }
  var recording: IRecording;
  var state: IFreezerRoot<IWebState>;
  config.cfg.data.flux = { trigger: trigger };
  var rootRender: () => void;

  export class Web extends flux.SmartComponent<ISmartProps<any>, IWebState>{
    constructor(props: any, ctx: any) {
      super(props, ctx);
      flux.rootComponent = this;
    }
    render() { return React.createElement('div', null, this.props.children); }
    getChildContext = () => { return config.cfg; }
  }

  export class Module {
    constructor(public id: string) {
      if (allModules[id]) throw 'Module "' + id + '" already exists.';
      else allModules[id] = this;
    }
    childs: Array<Module>;
    dispatchAction(action: IAction, complete: (action: IAction) => void) { throw 'notImplemented'; }
  }
  var allModules: { [id: string]: Module; } = {};

}