namespace routerTest {
  export function testRouterLow() {
    //*** UrlMatcher test
    var urlMatcher = new uiRouter.UrlMatcher('/user/:id/name/:name?opt1&opt2');
    var pars = urlMatcher.exec('/useR/123/Name/alex', { opt1: 'xxx', opt2: 'yyy' });
    var url = urlMatcher.format(pars);
    //*** States test
    uiRouter.states
      .add('login.select', '/login.select')
      .add('login.login', '/login.login')
      .add('x', '/user/:id/name/:name?opt1&opt2')
    ;
    var d1 = uiRouter.states.hashToAction('/login.select');
    var d2 = uiRouter.states.hashToAction('/useR/123/Name/alex?opt1=xxx&opt2=yyy');
    var d3 = uiRouter.states.hashToAction('/login.login');
  }
}