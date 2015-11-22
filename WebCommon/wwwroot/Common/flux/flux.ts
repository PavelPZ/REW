﻿namespace config {
  export interface IData {
    flux?: {
      trigger: (action: flux.IAction, completed?: (action: flux.IAction) => void) => void;
    };
  }
}
namespace flux {  

  //**************** getState, trigger
  export function getState(): IAppState { return state; }
  export function trigger(action: IAction, complete?: (action: IAction) => void) {
    if (!action || !action.moduleId || !action.actionId) throw '!action || !action.type';
    var res = allModules[action.moduleId]; if (!res) throw 'Cannot find module ' + action.moduleId;
    if (recording) recording.actions.push(action);
    loger.log('ACTION ' + JSON.stringify(action), 1);
    res.dispatchAction(action, complete);
    loger.log('action', -1);
  }
  export function actionPath(act: IAction) { return act.moduleId + '/' + act.actionId; }
  export function cnt(): string { return (_cnt++).toString(); } var _cnt = 0;

  //*********** COMPONENTS
  export class DumpComponent<T extends React.Props<any>, S> extends React.Component<T, S> { props: T; }

  export class SmartComponent<T extends ISmartProps<any>, S extends ISmartState> extends DumpComponent<T, S>{
    constructor(props: T, ctx: any) {
      super(props, ctx);
      //vypocet id a registrace
      this.id = !utils.isEmpty(props.parentId) ? props.id + '<' + props.parentId : props.id;
      if (allComponents[this.id]) throw 'Just created component: ' + this.id + ' already exists (allComponents[this.id]: ';
      allComponents[this.id] = this;
      //self id do meho state
      var st = this.getState();
      if (!st.ids) throw 'Not smart state';
      loger.log('>new ' + this.id + ', initState=' + JSON.stringify(st, (key, value) => key == 'ids' ? undefined : value));
      //if (!st.ids) st.ids = [];
      if (st.ids.indexOf(this.id)<0) st.ids.push(this.id);
    }
    //context: config.IObj;
    props: T; id: string;
    //probublani contextu od parenta k childs
    //static contextTypes = { [config.ctxPropName]: React.PropTypes.any }
    //static childContextTypes = { [config.ctxPropName]: React.PropTypes.any }
    componentWillUnmount = () => {
      //clear state a unregister
      var st = this.getState();
      var idx = st.ids.indexOf(this.id); if (idx >= 0) st.ids.splice(idx, 1);
      delete allComponents[this.id.toString()];
      loger.log('>unmount ' + this.id);
    };
    render(): JSX.Element { loger.log('>render ' + this.id); return null; }
    getState(): S { return this.props.initState; }
  }
  export interface ISmartProps<S extends ISmartState> extends IComponentProps { initState: S; parentId: string, id: string }
  export interface ISmartState { ids: Array<string> }
  export interface IComponentProps extends React.Props<any> { }

  //**** SET STATE => rerender
  export function onStateChanged(st: ISmartState) {
    if (!st || !st.ids) throw 'Not smart state, onStateChanged: !st || !st.ids';
    //if (!st.ids) st.ids = [];
    st.ids.forEach(id => {
      var comp = allComponents[id]; if (!comp) return;
      loger.log('SetState ' + id + ' ' + JSON.stringify(st, (key, value) => key == 'ids' ? undefined : value), 1);
      comp.setState(st);
      loger.log('setstate', -1);
    });
  }
  export function stateConnected(st: ISmartState): boolean {
    if (!st || !st.ids) return false;
    return !!st.ids.find(id => !!allComponents[id]);
  }
  export function findComponent<C extends SmartComponent<any, any>>(id: string): C { return <C>(allComponents[id]); }

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
    refreshRoot(rec.initStatus);
    setTimeout(() => doPlay(), interval);
  }
  export function resetState() {
    if (!recording) return;
    recording.actions = [];
    refreshRoot(recording.initStatus);
  }

  //****************  WEB START
  export function initApplication(dom: Element, webState: IAppState, root: () => JSX.Element) {
    refreshRoot = st => {
      state = st;
      ReactDOM.unmountComponentAtNode(dom);
      ReactDOM.render(root(), dom);
    }
    refreshRoot(webState);
  } var refreshRoot: (webState: IAppState) => void;
  export interface IAppState { }

  //************ MODULE
  export class Dispatcher {
    constructor(public id: string) {
      if (allModules[id]) throw 'Module "' + id + '" already exists.';
      allModules[id] = this;
    }
    //childs: Array<Dispatcher>;
    dispatchAction(action: IAction, complete: (action: IAction) => void) { throw 'notImplemented'; }
  }

  //**************** PRIVATE
  interface IRecording { initStatus: IAppState; actions: Array<IAction>; }
  var recording: IRecording;
  var state: IAppState;
  config.cfg.data.flux = { trigger: trigger };
  //var webRender: (parentId: string) => JSX.Element;
  var allModules: { [id: string]: Dispatcher; } = {};
  var allComponents: { [id: string]: SmartComponent<any, any>; } = {};

}