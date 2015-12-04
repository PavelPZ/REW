function startProc() {
  switch (servCfg.startProc) {
    case servConfig.StartProc.fluxTest: fluxTest.doRunApp(); break;
    case servConfig.StartProc.layoutTest: layoutTest.doRunApp(); break;
    case servConfig.StartProc.loginTest: loginTest.doRunApp(); break;
    case servConfig.StartProc.validationTest: validationTest.doRunApp(); break;
    case servConfig.StartProc.testingTest: testingTest.doRunApp(); break;
    case servConfig.StartProc.oauthStartProc: oauth.loginPageEnter(); break;
    case servConfig.StartProc.empty: utils.Noop(); break;
    case servConfig.StartProc.no:
      switch (servCfg.routePrefix) {
        case servConfig.RoutePrefix.some_other: layoutTest.doRunApp(); break;
        default: loger.doThrow('startProc: ' + servConfig.RoutePrefix[servCfg.routePrefix]); break;
      }
      break;
    default: loger.doThrow('startProc: ' + servCfg.startProc.toString()); break;
  }
}
