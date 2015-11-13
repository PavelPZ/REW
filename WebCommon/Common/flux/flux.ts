namespace config {
  export interface IData {
    flux: {
      trigger: (action: flux.IAction, completed?: (action: flux.IAction) => void) => void;
    };
  }
}
namespace flux {

  //**************** getState, trigger
  export function getState(): IWebState { return state.data; }
  export function trigger(action: IAction, complete?: (action: IAction) => void) {
    if (!action || !action.moduleId || !action.actionId) throw '!action || !action.type';
    var res = allModules[action.moduleId]; if (!res) throw 'Cannot find module ' + action.moduleId;
    if (recording) recording.actions.push(action);
    res.dispatchAction(action, complete);
  }

  //*********** COMPONENTS
  export class DumpComponent<T extends React.Props<any>, S> extends React.Component<T, S> { props: T; }

  export class SmartComponent<T extends ISmartProps<any>, S extends ISmartState> extends DumpComponent<T, S>{
    constructor(props:T, ctx: any) {
      super(props, ctx);
      //vypocet id a registrace
      this.id = props.parent ? props.parent.id + '/' + props.id : props.id;
      if (allComponents[this.id]) throw 'allComponents[this.id]: '+ this.id;
      allComponents[this.id] = this;
      //self id do meho state
      var st = this.myState();
      if (!st.ids) st.ids = [];
      //if (st.ids.indexOf(this.id) >= 0) throw 'st.ids.indexOf(this.id) >= 0: ' + this.id;
      st.ids.push(this.id);
      console.log('>' + this.id + '-new');
    }
    context: config.IObj;
    props: T; id: string;
    static contextTypes = { [config.ctxPropName]: React.PropTypes.any }
    static childContextTypes = { [config.ctxPropName]: React.PropTypes.any }
    myState(): S { return this.props.initState; }
    componentWillUnmount = () => {
      //clear state a unregister
      var st = this.myState();
      var idx = st.ids.indexOf(this.id); if (idx >= 0) st.ids.splice(idx,1);
      delete allComponents[this.id.toString()];
      console.log('>' + this.id + '-componentWillUnmount');
    };
    render() {
      console.log('>' + this.id + '-render');
      return null;
    }
  }
  export interface ISmartProps<S> extends IComponentProps { initState: S; parent: SmartComponent<any, any>, id: string }
  export interface ISmartState  { ids?:Array<string> }
  export interface IComponentProps extends React.Props<any> { }

  //**** SET STATE => rerender
  export function onStateChanged(st: ISmartState) {
    if (!st) throw 'onStateChanged: !st';
    if (!st.ids) st.ids = [];
    st.ids.forEach(id => {
      var comp = allComponents[id]; if (!comp) return;
      console.log('>' + id + '-setState: ' + JSON.stringify(st));
      comp.setState(st);
    });
  }
  export function findComponent<C extends SmartComponent<any,any>>(id: string): C { return <C>(allComponents[id]); }

  //****************  RECORDING
  export function recordStart() { recording = { initStatus: JSON.parse(JSON.stringify(getState()/*, (k,v) => k=='ids' ? undefined : v*/)), actions: [] }; }
  export function recordEnd(): string { try { return recording ? JSON.stringify(recording, null, 2) : null; } finally { recording = null; } }
  export function play(recStr: string, interval: number, completed: () => void) {
    if (!recStr) return;
    console.log('>play: ' + recStr);
    var rec: IRecording = JSON.parse(recStr);
    var doPlay: () => void;
    doPlay = () => {
      if (rec.actions.length == 0) { completed(); return; }
      var act = rec.actions.splice(0, 1);
      trigger(act[0], act => setTimeout(() => doPlay(), interval));
    };
    state.data = rec.initStatus; 
    onStateChanged(state);
    setTimeout(() => doPlay(), interval);
  }

  //****************  WEB START
  export function initWebState(dom: Element, webState: IWebAppState, render: (parent: SmartComponent<any, any>) => JSX.Element) {
    state = webState; //globalni STORE
    webRender = render; //Web app render
    var webProp: IWebAppProps = { "initState": state, id: 'web', parent: null };
    ReactDOM.render(React.createElement(<any>Web, webProp), dom); //INIT
  }

  export class Web extends SmartComponent<IWebAppProps, IWebAppState>{
    render() { super.render(); return webRender(this); }
    getChildContext = () => { return config.cfg; }
  }
  export interface IWebState { }
  export interface IWebAppState extends ISmartState { data: IWebState; }
  export interface IWebAppProps extends ISmartProps<IWebAppState> { }

  //************ MODULE
  export class Module {
    constructor(public id: string) {
      if (allModules[id]) throw 'Module "' + id + '" already exists.';
      else allModules[id] = this;
    }
    childs: Array<Module>;
    dispatchAction(action: IAction, complete: (action: IAction) => void) { throw 'notImplemented'; }
  }

  export class PlaceHolder extends SmartComponent<IPlaceHolderProps, IPlaceHolderState> {
    render() {
      super.render(); 
      var cont = this.props.contents[this.myState().placeId];
      if (!cont) throw 'flux.PlaceHolder.render: wrong place ' + this.myState().placeId;
      return cont(this);
    }
  }
  export interface IPlaceHolderProps extends ISmartProps<IPlaceHolderState> {
    contents: { [placeId: string]: (parent: SmartComponent<any,any>) => JSX.Element; }
  }
  export interface IPlaceHolderState extends ISmartState {
    placeId: string;
  }

  //**************** PRIVATE
  interface IRecording { initStatus: IWebState; actions: Array<IAction>; }
  var recording: IRecording;
  var state: IWebAppState;
  config.cfg.data.flux = { trigger: trigger };
  var webRender: (parent: SmartComponent<any,any>) => JSX.Element;
  var allModules: { [id: string]: Module; } = {};
  var allComponents: { [id: string]: SmartComponent<any, any>; } = {};

}