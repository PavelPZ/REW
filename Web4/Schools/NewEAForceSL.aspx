<%@ Page Title="" Language="C#" %>

<%=Packager.RewApp.HomePage(
  new Packager.Config() {
    target = LMComLib.Targets.web, version = Packager.versions.debug, dictType = schools.dictTypes.lingOffline, //designId="bridgelink", //lingOffline lingWeb
    dictNoSound = false, 
    canSkipCourse = true, canResetCourse = true, canResetTest = true, canSkipTest = true, ForceSoundPlayer = LMComLib.SoundPlayerType.SL, //noCpv=true, 
    //persistType = schools.persistTypes.persistScormLocal,
    persistType = schools.persistTypes.persistNewEA,
    //productId = "English_Test_0_2"
  }
)%>
