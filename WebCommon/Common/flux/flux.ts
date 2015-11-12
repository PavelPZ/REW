namespace config {
  export interface IData {
    flux: {
      trigger: (action: flux.IAction, completed?: (action: flux.IAction) => void) => void;
    };
  }
}
namespace flux {

  //export var rootComponent: SmartComponent<any, any>; //v musi se naplnit v konstruktoru root komponenty. Kvuli recordingu.
  export var rootComponent: Web;

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
    shouldComponentUpdate = (nextProps: T, nextState: S, nextContext: any) => {
      var res = this.state !== nextState;
      return res;
    }
    //componentDidMount = () => this.state.getListener().on('update', newState => this.setState(newState, () => this.state = newState));
    componentDidMount = () => this.state.getListener().on('update', newState => this.setState(newState, () => this.state = newState));
    componentWillUnmount = () => this.state.getListener().off('update');
  }
  export interface ISmartProps<S> extends IComponentProps { initState: S; }

  export function getState(): IWebState { return state.get().data; }
  export function getWebAppState(): IWebAppState { return state.get(); }
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
    //state = new Freezer<IWebAppState>(rec.initStatus);
    //ReactDOM.unmountComponentAtNode(document.getElementById('app'));
    //rootRender();
    //state.get().set('data', rec.initStatus);
    state.get().set('data', rec.initStatus);
    //rootComponent.props
    setTimeout(() => doPlay(), interval);
  }

  export function initWebState(webState: IWebAppState, dom: Element, render: () => JSX.Element) {
    state = new Freezer<IWebAppState>(webState);
    webRender = render;
    //rootRender = doRootRender;
    ReactDOM.render(React.createElement(<any>Web, { "initState": flux.getWebAppState() }), dom);
    //doRootRender();
  }

  export class Web extends flux.SmartComponent<IWebAppProps, IWebAppState>{
    constructor(props: any, ctx: any) {
      super(props, ctx);
      flux.rootComponent = this;
    }
    //render() { return React.createElement('div', null, this.props.children); }
    render() { return webRender(); }
    //render() { return this.props.render(); }
    getChildContext = () => { return config.cfg; }
  }
  export interface IWebState { }
  export interface IWebAppState extends IFreezerState<IWebAppState> { data: IWebState; }
  export interface IWebAppProps extends flux.ISmartProps<IWebAppState> { render: () => JSX.Element; }
  //export interface IWebAppProps extends flux.ISmartProps<IWebAppState> { }

  export class Module {
    constructor(public id: string) {
      if (allModules[id]) throw 'Module "' + id + '" already exists.';
      else allModules[id] = this;
    }
    childs: Array<Module>;
    dispatchAction(action: IAction, complete: (action: IAction) => void) { throw 'notImplemented'; }
  }

  export class PlaceHolder {
  }
  export interface IPlaceHolderStatus {
  }

  interface IRecording { initStatus: IWebState; actions: Array<IAction>; }
  var recording: IRecording;
  var state: IFreezerRoot<IWebAppState>;
  config.cfg.data.flux = { trigger: trigger };
  //var rootRender: () => void;
  var webRender: () => JSX.Element;
  var allModules: { [id: string]: Module; } = {};


}