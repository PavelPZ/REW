<%@ Page Title="" Language="C#" %>

<%
  Packager.Config cfg = new Packager.Config() {
    target = LMNetLib.LowUtils.EnumParse<LMComLib.Targets>(Request["target"] ?? "web"),
    version = schools.versions.debug,
    dictNoSound = false,
    dictOfflineId = "L",
    startProcName = "boot.Start", //nemusi byt, difotni hodnota
                                  //testGroup_debug = true,
                                  //humanEvalMode = true,
                                  //logins = new LMComLib.OtherType[] {LMComLib.OtherType.LANGMaster, LMComLib.OtherType.LANGMasterNoEMail},

    //themeId = "-bootswatch-flatly",
    //themeDefauleNavbar = true,
    //boostrapUrl = "/bs3/less/bootstrap",
    //boostrapUrl = "",

    //dataBatchUrl = Request["dataBatchUrl"] ?? "/lm/lm_data_new/", 
    designId = "",

    dataBatchUrl = "/lm/lm_data_new/",
    //dataBatchUrl = "/lm/lm_data/",
    //dataBatchUrl = "/skrivanek",
    //dataBatchUrl = "/siteroot.all",
    //forceServiceUrl = LMComLib.Machines.isFE5() ? "http://test.langmaster.com/alpha/service.ashx" : "http://localhost/rew/service.ashx",
    //forceServiceUrl = "http://services.langmaster.com/services/service.ashx",

    licenceConfig = new schools.licenceConfig() {
      //isDynamic = true,
      domain = "localhost",
      isDynamic = false,
      serviceUrl = LMComLib.Machines.isFE5() ? "http://test.langmaster.com/alpha/service.ashx" : "http://localhost/rew/service.ashx",
      //serviceUrl = "http://services.langmaster.com/services/dynamicscript.ashx",
    },
    lang = LMComLib.urlInfo.langStrToLang(Request["lang"]),
    canSkipCourse = true,
    canResetCourse = true,
    canResetTest = true,
    canSkipTest = true, //noCpv=true, 
    //persistType = schools.persistTypes.persistNewEA,

    persistType = LMNetLib.LowUtils.EnumParse<schools.persistTypes>(Request["persistType"] ?? "persistNewEA"),
    displayMode = LMNetLib.LowUtils.EnumParse<schools.displayModes>(Request["displayMode"] ?? "normal"),
    //persistType = schools.persistTypes.persistScormEx,
    //rootProductId = "lm/prods/most_simple",
    rootProductId = Request["rootProductId"], //"data/pz-w8virtual/mod"
  };
  ReleaseDeploy.Lib.actConfig = cfg;
  string serverScript = null;
  var url = (Request["url"] ?? "").ToLower();
  if (!string.IsNullOrEmpty(url)) {
    CourseMeta.oldeaDataType oldEaType = LMNetLib.LowUtils.EnumParse<CourseMeta.oldeaDataType>(Request["oldEaType"] ?? CourseMeta.oldeaDataType.xml.ToString());
    LMNetLib.LoggerMemory log = new LMNetLib.LoggerMemory(false) { isVsNet = true };
    //serverScript = oldEaType != CourseMeta.oldeaDataType.xml ? OldToNew.exFile.getServerScript(url, oldEaType, log) : null;
    if (oldEaType != CourseMeta.oldeaDataType.xml) cfg.noOldEA = true;
    if (serverScript != null) {
      //var log = new LMNetLib.LoggerMemory(true) { isVsNet = true };
      serverScript = CourseMeta.buildLib.getServerScript(Author.vsNetServer.buildExFiles(new System.IO.MemoryStream(Encoding.UTF8.GetBytes(serverScript)), url, log)).ToString();
    }
  }
  string renderHtml = Packager.RewApp.HomePage(cfg, serverScript);
  if (renderHtml == null) return;
  //string renderHtml = Packager.RewApp.HomePage(cfg);
%>
<%=renderHtml%>

