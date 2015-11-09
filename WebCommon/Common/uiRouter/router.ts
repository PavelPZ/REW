declare namespace angular {
  class UrlMatcher {
    constructor(pattern: string);
    exec(url: string, query?: {}): {};
    format(params: {}): string;
  }
  class $UrlMatcherFactory {
  }
}
namespace angular {
  new angular.$UrlMatcherFactory();
  export function testRouter() {
    var urlMatcher = new angular.UrlMatcher('/user/:id/name/:name?opt1&opt2');
    var pars = urlMatcher.exec('/useR/123/Name/alex', { opt1: 'xxx', opt2: 'yyy' });
    var url = urlMatcher.format(pars);
    pars = null;
  }
}


