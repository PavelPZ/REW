//React "Hello World" Examples: https://gist.github.com/danawoodman/9cfddb1a0c934a35f31a
//https://facebook.github.io/react/docs/component-api.html
//https://facebook.github.io/react/docs/top-level-api.html#reactdom.finddomnode
//http://redux.js.org/docs/introduction/
//https://github.com/rackt/react-redux/releases
//Imutable helper: https://facebook.github.io/react/docs/update.html, https://facebook.github.io/react/docs/advanced-performance.html
//HELP: https://github.com/rackt/react-redux/blob/master/docs/api.md

//D:\LMCom\rew\WebLogin\scripts\typings\react-redux.d.ts
//export function connect<P>(mapStateToProps?: MapStateToProps,
//  mapDispatchToProps?: MapDispatchToPropsFunction | MapDispatchToPropsObject,
//  mergeProps?: MergeProps,
//  options?: Options): (cls: React.ClassicComponentClass<P>) => React.ClassicComponentClass<P>;

//D:\LMCom\rew\WebLogin\scripts\typings\react-global.d.ts


namespace config {
  export interface IData {
    mod1?: {
      prefix: string;
    };
  }
  cfg.data.mod1 = {} as any;
}

namespace flux {
  export interface IAppState {
    fluxTest?: fluxTest.IAppState;
    fluxTestPlacer?: fluxTest.IPlaceHolderState;
    fluxTestSwitcher?: layout.ISwitcherState;
  }
}

namespace router {
  export interface INamedRoutes {
    fluxTest: { index: router.RouteType; }
  };
  named.fluxTest = {} as any;
}


namespace fluxTest {

  //***** ROUTE init
  var moduleId = 'fluxTest';

  //*********************** DISPATCH MODULE definition
  interface IAppClickAction extends flux.IAction { }
  interface IClickAction extends flux.IAction { scopeComponent: string; /*akce nad self, ktera meni self stav*/ }

  config.cfg.data.mod1.prefix = 'Hello';

  class mod1 extends flux.Dispatcher {
    constructor() {
      super(mod1.moduleId);
    }

    dispatchAction(action: flux.IAction, compl: utils.TCallback) {
      let old = flux.getState().fluxTest;
      var oldPlace = flux.getState().fluxTestPlacer;
      switch (action.actionId) {
        case 'appclick':
          setTimeout(() => {
            let old = flux.getState().fluxTest;
            old.hello1.actName += '*';
            old.hello2.actName += '*';
            old.clickTitle += '*';
            flux.onStateChanged(old);
            if (compl) compl(); //async complete, musi nasledovat return;
          }, 300);
          return;
        case 'click':
          let act = action as IClickAction;
          var comp = flux.findComponent<HelloMessage>(act.scopeComponent);
          comp.props.initState.actName += '*';
          flux.onStateChanged(comp.props.initState);
          break;
        case 'placehloderClick':
          oldPlace.isApp = !oldPlace.isApp; flux.onStateChanged(oldPlace);
          break;
      }
      //sync complete
      if (compl) compl();
    }
    static moduleId = 'mod1';
    static createAppClickAction(): IAppClickAction { return { moduleId: mod1.moduleId, actionId: 'appclick' }; }
    static createPlaceholderClickAction(): flux.IAction { return { moduleId: mod1.moduleId, actionId: 'placehloderClick' }; }
    static createClickAction(scopeComponent: string/*akce nad self, ktera meni self stav*/): IClickAction { return { moduleId: mod1.moduleId, actionId: 'click', scopeComponent: scopeComponent }; }
  }

  //************* VIEW hvezdicky
  export class App extends flux.SmartComponent<IAppProps, IAppState>{
    render() {
      super.render();
      var st = this.getState();
      return <div key={flux.cnt() }>
        <div>
          <div onClick={() => flux.trigger(mod1.createAppClickAction()) }>{st.clickTitle}</div>
          <HelloMessage initState={st.hello1 } is1={1} parentId={this.id} id='fluxTest.HelloMessage1'/>
          <HelloMessage initState={st.hello2 } is1={2} parentId={this.id} id='fluxTest.HelloMessage2'/>
          <br/>
          </div>
        <div>
          <div onClick={() => flux.trigger(mod1.createAppClickAction()) }>{st.clickTitle}</div>
          <HelloMessage initState={st.hello1 } is1={1} parentId={this.id} id='fluxTest.HelloMessage3'/>
          <HelloMessage initState={st.hello2 } is1={2} parentId={this.id} id='fluxTest.HelloMessage4'/>
          <br/>
          </div>
        <div className={classNames('btn', { [`btn-${"primary"}`]: true }) } >Button</div>
        </div>;
    }
  };
  interface IAppProps extends flux.ISmartProps<IAppState> { }
  export interface IAppState extends flux.ISmartState { hello1?: IHelloWorldState; hello2?: IHelloWorldState; clickTitle: string, inputValue?: string }

  class HelloMessage extends flux.SmartComponent<IHelloWorldProps, IHelloWorldState>{
    render() {
      super.render();
      return <div key={flux.cnt() } onClick={() => flux.trigger(mod1.createClickAction(this.id)) }>{config.cfg.data.mod1.prefix } {this.getState().actName}</div >;
    }
    props: IHelloWorldProps;
  };
  interface IHelloWorldProps extends flux.ISmartProps<IHelloWorldState> { is1: number; }
  interface IHelloWorldState extends flux.ISmartState { actName?: string; }

  //************* VIEW placeholder
  export class Switcher extends flux.SmartComponent<IPlaceHolderProps, IPlaceHolderState>{
    render() {
      super.render();
      var st = this.getState();
      return <div key={flux.cnt() }>
        <p onClick={() => flux.trigger(mod1.createPlaceholderClickAction()) }>click</p>
        <div>{st.isApp ? (<App initState={flux.getState().fluxTest} parentId={this.id} id='fluxTest.App'/>) : (<HelloMessage initState={st.hello} is1={3} parentId={this.id} id='fluxTest.HelloMessage' />) }</div>
        </div>
        ;
    }
  }
  interface IPlaceHolderProps extends flux.ISmartProps<IPlaceHolderState> { }
  export interface IPlaceHolderState extends flux.ISmartState { isApp: boolean; hello: IHelloWorldState; }

  export interface IRouteTestHash extends router.IPar { id: number; opt1: string; opt2: string; }

  function testRouterLow() {
    //** inicializace aplikace

    //*** low level UrlMatcher test
    var urlMatcher = new uiRouter.UrlMatcher('/user/:id/name/:name?opt1&opt2');
    var pars = urlMatcher.exec('/useR/123/Name/alex', { opt1: 'xxx', opt2: 'yyy' });
    var url = urlMatcher.format(pars);
    url = urlMatcher.format({ id: 123, opt1: true, opt2: 'yyy' });

    var defaultRoute: router.Route<IRouteTestHash>;
    //*** router konfiguration
    //router.activate(
    new router.Route('m1', 'x1', '/login', null, null,
      parent => [
        new router.Route('m1', 'x2', '/login', parent),
        new router.Route('m1', 'x3', '/select', parent)]
    );
    defaultRoute = new router.Route<IRouteTestHash>('m1', 'y', '/user/:id/name/:name?opt1&opt2', null, {
      finishRoutePar: st => { st.id = utils.toNumber(st.id); }
    });
    //);

    //*** rucni MATCH
    var par = defaultRoute.parseRoute(router.toQuery('/useR/123/Name/alex?opt1=xxx&opt2=yyy'));
    var d1 = router.toUrl('/login.select');
    var d2 = router.toUrl('/useR/123/Name/alex?opt1=xxx&opt2=yyy');
    var d3 = router.toUrl('/login.login');
  }

  //************* WHOLE APP
  //** inicializace aplikace x
  var namedState = router.named.fluxTest; //pojmenovane stavy
  namedState.index = new router.RouteType(moduleId, 'default', '/flux/flux-test-home')

  export function doRunApp() {

    //** ROUTERS and its dispatch
    router.activate(namedState.index);

    router.setHome(namedState.index, {});
    namedState.index.dispatch = (par, comp) => { comp(); };

    //testRouterLow();

    new mod1();

    var root = () => <layout.Switcher key={flux.cnt() } initState={flux.getState().fluxTestSwitcher} parentId={''} id='layout.PlaceHolder' cases={{
      app: pid => <App  key={flux.cnt() } initState={flux.getState().fluxTest} parentId={pid} id='fluxTest.App'/>,
      place: pid => <Switcher  key={flux.cnt() } initState={flux.getState().fluxTestPlacer} parentId={pid} id='fluxTest.Switcher'/>
    }}/>;

    var st = flux.getState();
    st.fluxTest = {
      ids: [],
      clickTitle: 'Click',
      hello1: { actName: 'John', ids: [] },
      hello2: { actName: 'Marthy', ids: [] }
    };
    st.fluxTestPlacer = {
      ids: [],
      isApp: false,
      hello: { ids: [], actName: 'John' },
    };
    st.fluxTestSwitcher = { ids: [], caseId: 'place' };

    flux.initApplication(document.getElementById('app'), root);
  }

}
