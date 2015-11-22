namespace router {
  export interface INamedRoutes {
    routerTest: {
      default: router.Route<routerTest.ITestHash>;
    }
  };
}
router.routes.routerTest = <any>{};

namespace routerTest {
  var namesState = router.routes.routerTest;

  export interface ITestHash extends router.IPar { id: number; opt1: string; opt2: string; }

  export function testRouterLow() {
    //** inicializace aplikace
    config.initApp();

    //*** low level UrlMatcher test
    var urlMatcher = new router.UrlMatcher('/user/:id/name/:name?opt1&opt2');
    var pars = urlMatcher.exec('/useR/123/Name/alex', { opt1: 'xxx', opt2: 'yyy' });
    var url = urlMatcher.format(pars);
    url = urlMatcher.format({ id: 123, opt1: true, opt2: 'yyy' });

    //*** router konfiguration
    router.init(
      new router.Route('login', '/login',
        new router.Route('login', '/login'),
        new router.Route('select', '/select')
      ),
      namesState.default = new router.Route<ITestHash>('x', '/user/:id/name/:name?opt1&opt2').finishStatePar(st => { st.id = utils.toNumber(st.id); })
    );
    router.setHome<ITestHash>(namesState.default, { id: 1, opt1: '', opt2: '' });

    //*** rucni MATCH
    var par = namesState.default.parseHash(router.toQuery('/useR/123/Name/alex?opt1=xxx&opt2=yyy'));
    var d1 = router.toUrl('/login.select');
    var d2 = router.toUrl('/useR/123/Name/alex?opt1=xxx&opt2=yyy');
    var d3 = router.toUrl('/login.login');
  }
}

routerTest.testRouterLow();
