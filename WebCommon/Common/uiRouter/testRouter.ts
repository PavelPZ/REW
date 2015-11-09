declare var UrlMatcher: any;
declare var $UrlMatcherFactory: any;

namespace testRouter {
  new $UrlMatcherFactory();
  var urlMatcher = new UrlMatcher('/user/:id/name/:name?opt1&opt2', { caseInsensitive: true });
  var pars = urlMatcher.exec('/useR/123/Name/alex', { opt1: 'xxx', opt2: 'yyy' });
  var url = urlMatcher.format(pars);
  pars = null;
}