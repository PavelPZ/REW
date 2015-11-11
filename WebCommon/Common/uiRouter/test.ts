namespace uiRouter {
  export interface INamedState {
    routerTest$Default: uiRouter.State<routerTest.ITestHash>;
  };
}

namespace routerTest {

  export interface ITestHash extends uiRouter.IStatePar { id: number; opt1: string; opt2: string; }

  export function testRouterLow() {
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
      uiRouter.namedState.routerTest$Default = new uiRouter.State<ITestHash>('x', '/user/:id/name/:name?opt1&opt2').setFinishHashAction(st => { st.id = _.toNumber(st.id); })
    );
    uiRouter.setDefault<ITestHash>(uiRouter.namedState.routerTest$Default, { id: 1, opt1: '', opt2: '' });

    //*** rucni MATCH
    var par = uiRouter.namedState.routerTest$Default.parseHash(uiRouter.preParseHashStr('/useR/123/Name/alex?opt1=xxx&opt2=yyy'));
    var d1 = uiRouter.parseHashStr('/login.select');
    var d2 = uiRouter.parseHashStr('/useR/123/Name/alex?opt1=xxx&opt2=yyy');
    var d3 = uiRouter.parseHashStr('/login.login');
  }
}