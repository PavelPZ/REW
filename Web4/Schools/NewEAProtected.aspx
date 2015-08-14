<%@ Page Title="" Language="C#" %>

<%=Packager.RewApp.HomePage(
  new Packager.Config() {
    target = LMComLib.Targets.web, version = schools.versions.minified, dictType = schools.dictTypes.lingOffline, //designId="bridgelink", //lingOffline lingWeb
    dictNoSound = false,
    withReports = true,
    //forceServiceUrl = LMComLib.Machines.isFE5() ? "http://test.langmaster.com/alpha/service.ashx" : "http://localhost/rew/service.ashx",
    //forceServiceUrl = "http://services.langmaster.com/services/service.ashx",

    licenceConfig = new schools.licenceConfig() {
      isDynamic = false,
      //isDynamic = false,
      domain = LMComLib.Machines.isFE5() ? "langmaster.com" : "localhost",
      serviceUrl = LMComLib.Machines.isFE5() ? "http://test.langmaster.com/alpha/service.ashx" : "http://localhost/rew/service.ashx",
      //serviceUrl = "http://services.langmaster.com/services/dynamicscript.ashx",
    },
    lang = LMComLib.Langs.cs_cz,
    canSkipCourse = true, canResetCourse = true, canResetTest = true, canSkipTest = true, //noCpv=true, 
    //persistType = schools.persistTypes.persistScormLocal,
    persistType = schools.persistTypes.persistNewEA,
    //productId = "English_Test_0_2"
  }
)%>
