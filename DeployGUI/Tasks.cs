using System;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using LMComLib;
using DesignNew;

namespace DeployGUI {

  [TestClass]
  public class TYPESCRIPT {
    public object XElement { get; private set; }

    [TestMethod]
    public void TYPESCRIPT_WebCommon() { buildTasks.TYPESCRIPT_compile(@"d:\LMCom\rew\WebCommon\wwwroot"); }

    [TestMethod]
    public void CODE() { buildTasks.CODE(); }
  }

  [TestClass]
  public class PUBLISH {
    [TestMethod]
    public void AZURE_JSpublish() { buildTasks.AZURE_publish("js-v001", true, new BuildIds[] { BuildIds.blended }, new Langs[] { Langs.cs_cz, Langs.en_gb }); }
    [TestMethod]
    public void AZURE_JSdelete() { buildTasks.AZURE_delete("js-v001"); }
    [TestMethod]
    public void AZURE_MMpublish() { buildTasks.AZURE_publish("mm-v001", false, new BuildIds[] { BuildIds.blended }, new Langs[] { Langs.cs_cz, Langs.en_gb }); }
    [TestMethod]
    public void AZURE_MMdelete() { buildTasks.AZURE_delete("mm-v001"); }
  }

  [TestClass]
  public class SW {
    [TestMethod]
    public void SW_WEB4refresh() { buildTasks.SW_WEB4refresh(); }
    [TestMethod]
    public void SW_deploy() { buildTasks.SW_deploy(); }
  }

  [TestClass]
  public class COURSE {

    [TestMethod]
    public void COURSE__resetEnvelope() { buildTasks.COURSE_resetEnvelope(); }
    //[TestMethod]
    //public void COURSE_ALL() {
    //  COURSE_blended(); COURSE_skrivanek();
    //  COURSE_lmtests();
    //  COURSE_english(); COURSE_french(); COURSE_german(); COURSE_italian(); COURSE_russian(); COURSE_spanish();
    //  COURSE_edusoft(); COURSE_grafia();
    //}
    [TestMethod]
    public void COURSE_blended() { buildTasks.COURSE_build(BuildIds.blended, new Langs[] { Langs.cs_cz, Langs.en_gb }); }
    [TestMethod]
    public void COURSE_skrivanek() { buildTasks.COURSE_build(BuildIds.skrivanek, new Langs[] { Langs.cs_cz, Langs.en_gb, Langs.vi_vn }); }
    [TestMethod]
    public void COURSE_edusoft() { buildTasks.COURSE_build(BuildIds.edusoft, new Langs[] { Langs.en_gb, Langs.vi_vn }); }
    [TestMethod]
    public void COURSE_lmtests() { buildTasks.COURSE_build(BuildIds.lmtests, new Langs[] { Langs.cs_cz, Langs.en_gb, Langs.vi_vn }); }
    [TestMethod]
    public void COURSE_english() { buildTasks.COURSE_build(BuildIds.english, new Langs[] { Langs.cs_cz, Langs.en_gb, Langs.vi_vn }, CourseMeta.dictTypes.L); }
    [TestMethod]
    public void COURSE_french() { buildTasks.COURSE_build(BuildIds.french, new Langs[] { Langs.cs_cz, Langs.en_gb, Langs.vi_vn }, CourseMeta.dictTypes.L); }
    [TestMethod]
    public void COURSE_german() { buildTasks.COURSE_build(BuildIds.german, new Langs[] { Langs.cs_cz, Langs.en_gb, Langs.vi_vn }, CourseMeta.dictTypes.L); }
    [TestMethod]
    public void COURSE_italian() { buildTasks.COURSE_build(BuildIds.italian, new Langs[] { Langs.cs_cz, Langs.en_gb, Langs.vi_vn }, CourseMeta.dictTypes.L); }
    [TestMethod]
    public void COURSE_russian() { buildTasks.COURSE_build(BuildIds.russian, new Langs[] { Langs.cs_cz, Langs.en_gb, Langs.vi_vn }, CourseMeta.dictTypes.L); }
    [TestMethod]
    public void COURSE_spanish() { buildTasks.COURSE_build(BuildIds.spanish, new Langs[] { Langs.cs_cz, Langs.en_gb, Langs.vi_vn }, CourseMeta.dictTypes.L); }
    [TestMethod]
    public void COURSE_grafia() { buildTasks.COURSE_build(BuildIds.grafia, new Langs[] { Langs.cs_cz }); }

  }
}
