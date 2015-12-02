const router_listenHashChange = () => router.listenUrlChange;
const router_tryDispatchRoute = () => router.tryDispatchRoute;
const testing_continuePlaying = () => testing.continuePlaying;
const router_onInitRoute = () => router.onInitRoute;

namespace config {
  export interface IData { flux?: { playInterval: number; }; }
  cfg.data.flux = { playInterval: 300 };
}

namespace flux {  

  //**************** getState, trigger
  export function getState(): IAppState { return state; }
  export function trigger(action: IAction, compl?: utils.TCallback) {
    if (!action || !action.moduleId || !action.actionId) loger.doThrow('!action || !action.type');
    if (!compl) compl = utils.Noop;
    if (recording) recording.actions.push(action);
    loger.log('ACTION ' + JSON.stringify(action), 1);
    if (triggerExternalNavigateAction(action)) { loger.log('action', -1); compl(); return; }
    router_tryDispatchRoute()(action as router.IActionType, routeProcessed => {
      if (routeProcessed) {
        compl();
      } else {
        var res = allModules[action.moduleId]; if (!res) loger.doThrow('Cannot find module ' + action.moduleId);
        res.dispatchAction(action, compl);
      }
      loger.log('action', -1);
    })
  }
  export type triggerCompleted = (action: IAction) => void;
  export function actionPath(act: IAction) { return act.moduleId + '/' + act.actionId; }
  export function cnt(): string { return (_cnt++).toString(); } var _cnt = 0;
  export function doExternalNavigate(url: string, ev?: React.SyntheticEvent) {
    if (ev) ev.preventDefault();
    var act: IExternalNavigateAction = { moduleId: moduleId, actionId: 'externalnavigate', url: url };
    trigger(act, utils.Noop);
    testing.onExternalLink();
  }

  var moduleId = 'flux';
  interface IExternalNavigateAction extends flux.IAction { url: string; } //navigace na externi ULR
  function triggerExternalNavigateAction(action: IAction): boolean {
    if (action.moduleId != moduleId || action.actionId != 'externalnavigate') return false;
    setTimeout(() => {
      var url = (action as IExternalNavigateAction).url;
      location.href = url;
      loger.log('flux.triggerExternalNavigateAction: ' + url);
    }, 1);
    return true;
  }

  //*********** COMPONENTS
  export class DumpComponent<T extends React.Props<any>, S> extends React.Component<T, S> { props: T; }

  export class SmartComponent<T extends ISmartProps<any>, S extends ISmartState> extends DumpComponent<T, S>{
    constructor(props: T, ctx: any) {
      super(props, ctx);
      //vypocet id a registrace
      this.id = !utils.isEmpty(props.parentId) ? props.id + '<' + props.parentId : props.id;
      if (allComponents[this.id]) loger.doThrow('Just created component: ' + this.id + ' already exists (allComponents[this.id]: ');
      allComponents[this.id] = this;
      //self id do meho state
      var st = this.getState();
      if (!st.ids) loger.doThrow('Not smart state');
      loger.log('new ' + this.id + ', initState=' + JSON.stringify(st, (key, value) => key == 'ids' ? undefined : value));
      //if (!st.ids) st.ids = [];
      if (st.ids.indexOf(this.id) < 0) st.ids.push(this.id);
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
      loger.log('unmount ' + this.id);
    };
    render(): JSX.Element { loger.log('render ' + this.id); return null; }
    getState(): S { return this.props.initState; }
  }
  export interface ISmartProps<S extends ISmartState> extends IComponentProps { initState: S; parentId: string, id: string }
  export interface ISmartState { ids: Array<string> }
  export interface IComponentProps extends React.Props<any> { }

  //**** SET STATE => rerender
  export function onStateChanged(st: ISmartState) {
    if (!st || !st.ids) loger.doThrow('Not smart state, onStateChanged: !st || !st.ids');
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
    if (!appInitialized) return true;
    return !!st.ids.find(id => !!allComponents[id]);
  }
  export function findComponent<C extends SmartComponent<any, any>>(id: string): C { return <C>(allComponents[id]); }

  //****************  RECORDING
  export function recordStart() { recording = { initStatus: JSON.parse(JSON.stringify(getState()/*, (k,v) => k=='ids' ? undefined : v*/)), actions: [] }; }
  export function recordEnd(): string { try { return recording ? JSON.stringify(recording, null, 2) : null; } finally { recording = null; } }
  export function play(recStr: string, completed: () => void) {
    if (!recStr) return;
    console.log('>play: ' + recStr);
    var rec: IRecording = JSON.parse(recStr);
    state = rec.initStatus;
    buildDOMTree();
    doPlayActions(rec.actions, completed);
  }
  export function doPlayActions(actions: Array<IAction>, completed: () => void) {
    var doPlay: () => void;
    doPlay = () => {
      if (actions.length == 0) { completed(); return; }
      var act = actions.splice(0, 1);
      trigger(act[0], () => setTimeout(() => doPlay(), config.cfg.data.flux.playInterval));
    };
    setTimeout(() => doPlay(), config.cfg.data.flux.playInterval);
  }

  //****************  WEB START
  export function initApplication(dom: Element, root: () => JSX.Element) {
    buildDOMTree = () => { ReactDOM.unmountComponentAtNode(dom); ReactDOM.render(root(), dom); }

    //** acion PLAYING inicializace
    var st = testing_continuePlaying()(); //sance testing modulu naladovat uplne jiny APP state pro PLAYING)
    if (st) {
      state = st.initStatus;
      router_onInitRoute()(() => {
        buildDOMTree(); //ReactDOM.render
        router_listenHashChange()(); //"hashchange" event binding
        appInitialized = true;
        doPlayActions(st.actions, utils.Noop);
      });
      return;
    }

    //** normalni inicializace
    config.onInitAppState(() => { //staticka inicializace app state (bez ohledu na aktualne naladovanou ROUTE)
      router_onInitRoute()(() => { //inicializace default route (call initialni "hashchange" event). Pres flux.trigger se vola onDispatchRouteAction, kde je ev. redirekt na LOGIN.
        testing.continueRecording();
        buildDOMTree(); //ReactDOM.render
        router_listenHashChange()(); //"hashchange" event binding
        appInitialized = true;
      });
    });
  } var buildDOMTree: () => void;

  export var appInitialized = false;

  export interface IAppState { }

  //************ MODULE
  export class Dispatcher {
    constructor(public id: string) {
      if (allModules[id]) loger.doThrow('Module "' + id + '" already exists.');
      allModules[id] = this;
    }
    //childs: Array<Dispatcher>;
    dispatchAction(action: IAction, complete: utils.TCallback) { loger.doThrow('notImplemented'); }
  }

  //**************** PRIVATE
  export interface IRecording { initStatus: IAppState; actions: Array<IAction>; }
  export var recording: IRecording;
  var state: IAppState = {};
  //var webRender: (parentId: string) => JSX.Element;
  var allModules: { [id: string]: Dispatcher; } = {};
  var allComponents: { [id: string]: SmartComponent<any, any>; } = {};

}