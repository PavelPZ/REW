namespace uiRouter {
  export interface INamedState {
    routerTest: {
      default: uiRouter.State<routerTest.ITestHash>;
    }
  };
}
uiRouter.namedState.routerTest = <any>{};

namespace routerTest {
  var namesState = uiRouter.namedState.routerTest;

  export interface ITestHash extends uiRouter.IStatePar { id: number; opt1: string; opt2: string; }

  export function testRouterLow() {
    //** inicializace aplikace
    config.initApp();

    //*** low level UrlMatcher test
    var urlMatcher = new uiRouter.UrlMatcher('/user/:id/name/:name?opt1&opt2');
    var pars = urlMatcher.exec('/useR/123/Name/alex', { opt1: 'xxx', opt2: 'yyy' });
    var url = urlMatcher.format(pars);
    url = urlMatcher.format({ id: 123, opt1: true, opt2: 'yyy' });

    //*** router konfiguration
    uiRouter.init(
      new uiRouter.State('login', '/login',
        new uiRouter.State('login', '/login'),
        new uiRouter.State('select', '/select')
      ),
      namesState.default = new uiRouter.State<ITestHash>('x', '/user/:id/name/:name?opt1&opt2').finishStatePar(st => { st.id = utils.toNumber(st.id); })
    );
    uiRouter.setDefault<ITestHash>(namesState.default, { id: 1, opt1: '', opt2: '' });

    //*** rucni MATCH
    var par = namesState.default.parseHash(uiRouter.preParseHashStr('/useR/123/Name/alex?opt1=xxx&opt2=yyy'));
    var d1 = uiRouter.parseHashStr('/login.select');
    var d2 = uiRouter.parseHashStr('/useR/123/Name/alex?opt1=xxx&opt2=yyy');
    var d3 = uiRouter.parseHashStr('/login.login');
  }
}

routerTest.testRouterLow();
