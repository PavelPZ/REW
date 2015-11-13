namespace config {
  export interface IData {
    flux: {
      trigger: (action: flux.IAction, completed?: (action: flux.IAction) => void) => void;
    };
  }
}
namespace flux {

  //**************** getState, trigger
  export function getState(): IWebState { return state.get().data; }
  export function trigger(action: IAction, complete?: (action: IAction) => void) {
    if (!action || !action.moduleId || !action.actionId) throw '!action || !action.type';
    var res = allModules[action.moduleId]; if (!res) throw 'Cannot find module ' + action.moduleId;
    if (recording) recording.actions.push(action);
    res.dispatchAction(action, complete);
  }

  //*********** COMPONENTS
  export class DumpComponent<T extends React.Props<any>, S> extends React.Component<T, S> { props: T; }

  export class SmartComponent<T extends ISmartProps<any>, S extends IFreezerState<any>> extends DumpComponent<T, IFreezerState<S>>{
    constructor(props, ctx: any) {
      super(props, ctx);
    }
    context: config.IObj;
    props: T; oldState:S;
    static contextTypes = { [config.ctxPropName]: React.PropTypes.any }
    static childContextTypes = { [config.ctxPropName]: React.PropTypes.any }
    componentWillReceiveProps = (nextProps: T, nextContext: any) => {
      if (nextProps.initState !== this.props) this.setState(nextProps.initState);
    }
    shouldComponentUpdate = (nextProps: T, nextState: S, nextContext: any) => {
      //var res = this.myState() !== nextState;
      //var res = this.myState() !== nextState; if (!res) return;
      var res = this.state !== nextState; if (!res) return;
      this.props.initState = nextState;
      return res;
    }
    myState(): S { return this.props.initState; }
    //componentDidMount = () => this.myState().getListener().on('update', newState => this.forceUpdate());
    componentDidMount = () => {
      var th = this; th.myState().getListener().on('update', newState => { th.setState(newState); th.state = newState; th.forceUpdate(); })
    };
    componentWillUnmount = () => this.myState().getListener().off('update');
  }
  export interface ISmartProps<S> extends IComponentProps { initState: S; }
  export interface IComponentProps extends React.Props<any> { }

  //****************  RECORDING
  export function recordStart() { recording = { initStatus: getState(), actions: [] }; }
  export function recordEnd(): string { try { return recording ? JSON.stringify(recording, null, 2) : null; } finally { recording = null; } }
  export function play(recStr: string, interval: number, completed: () => void) {
    if (!recStr) return;
    var rec: IRecording = JSON.parse(recStr);
    var doPlay: () => void;
    doPlay = () => {
      if (rec.actions.length == 0) { completed(); return; }
      var act = rec.actions.splice(0, 1);
      trigger(act[0], act => setTimeout(() => doPlay(), interval));
    };
    state.get().set('data', rec.initStatus);
    setTimeout(() => doPlay(), interval);
  }

  //****************  WEB START
  export function initWebState(dom: Element, webState: IWebAppState, render: () => JSX.Element) {
    state = new Freezer<IWebAppState>(webState); //globalni STORE
    webRender = render; //Web app render
    ReactDOM.render(React.createElement(<any>Web, { "initState": state.get() }), dom); //INIT
  }

  export class Web extends flux.SmartComponent<IWebAppProps, IWebAppState>{
    render() { return webRender(); }
    getChildContext = () => { return config.cfg; }
  }
  export interface IWebState { }
  export interface IWebAppState extends IFreezerState<IWebAppState> { data: IWebState; }
  export interface IWebAppProps extends flux.ISmartProps<IWebAppState> { render: () => JSX.Element; }

  //************ MODULE
  export class Module {
    constructor(public id: string) {
      if (allModules[id]) throw 'Module "' + id + '" already exists.';
      else allModules[id] = this;
    }
    childs: Array<Module>;
    dispatchAction(action: IAction, complete: (action: IAction) => void) { throw 'notImplemented'; }
  }

  export class PlaceHolder extends flux.SmartComponent<IPlaceHolderProps, IPlaceHolderState> {
    render() {
      var cont = this.props.contents[this.myState().placeId]; if (!cont) return null;
      return cont();
    }
  }
  export interface IPlaceHolderProps extends flux.ISmartProps<IPlaceHolderState> {
    contents: { [placeId: string]: () => JSX.Element; }
  }
  export interface IPlaceHolderState extends IFreezerState<IPlaceHolderState> {
    placeId: string;
  }

  //**************** PRIVATE
  interface IRecording { initStatus: IWebState; actions: Array<IAction>; }
  var recording: IRecording;
  var state: IFreezerRoot<IWebAppState>;
  config.cfg.data.flux = { trigger: trigger };
  var webRender: () => JSX.Element;
  var allModules: { [id: string]: Module; } = {};
  var allComponents: { [id: string]: SmartComponent<any,any>; } = {};


}