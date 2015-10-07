using Newtonsoft.Json;
using System;
using System.IO;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web;
using System.Web.Http;
using System.Xml;
using System.Xml.Linq;
using LMComLib;
using System.Text;
using LMNetLib;
using Author;

namespace blended {

  [RoutePrefix("Vyzva57Services")]
  public class Vyzva57ServicesController : ApiController {

    [Route("lmAdminSendOrder"), HttpPost]
    public void lmAdminSendOrder([FromBody]string jsonOrder) {
      var order = JsonConvert.DeserializeObject<IOrder>(jsonOrder);
      var path = HttpContext.Current.Server.MapPath("~/app_data/orders");
      LowUtils.AdjustDir(path);
      try {
        order.email += ".xml";
        XmlUtils.ObjectToFile(path + "\\" + order.email + ".xml", order);
      } catch {
        XmlUtils.ObjectToFile(path + "\\" + Guid.NewGuid().ToString() + ".xml", order);
      }
    }
    public class IOrder {
      public int sablona4; public int sablona3; public string schoolName; public string schoolAddress; public string ico;
      public string name; public string email; public string other;
    }

    [Route("lmLectorExportInfoToXml"), HttpGet]
    public void lmLectorExportInfoToXml() {
      NewModel.Lib.downloadResponse(vyzva.Lectors.exportInfoToXml(), "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "export.xlsx");
    }

    [Route("lmAdminCreateCompany"), HttpPost]
    public void lmAdminCreateCompany(int companyid, [FromBody]string companyData) {
      var db = blendedData.Lib.CreateContext();
      var comp = db.Companies.FirstOrDefault(c => c.Id == companyid);
      if (comp != null && !string.IsNullOrEmpty(comp.LearningData)) return;
      if (comp == null) db.Companies.Add(comp = new blendedData.Company { Id = companyid });
      comp.LearningData = companyData;
      blendedData.Lib.SaveChanges(db);
    }
    [Route("lmAdminCreateLicenceKeys"), HttpPost]
    public lmAdminCreateLicenceKey[] lmAdminCreateLicenceKeys(int companyid, [FromBody]lmAdminCreateLicenceKey[] requestedKeys) {
      //debug: pro prepareDemoData.cs: capture requestus
      //var json = JsonConvert.SerializeObject(requestedKeys, Newtonsoft.Json.Formatting.Indented);
      var db = NewData.Lib.CreateContext();
      foreach (var requestedKey in requestedKeys) {
        var prodId = lineToProductId[requestedKey.line];
        var lic = db.CompanyLicences.First(c => c.CompanyId == companyid && c.ProductId == prodId);
        var firstFree = lic.LastCounter + 1;
        lic.LastCounter += requestedKey.num;
        requestedKey.keys = Enumerable.Range(firstFree, requestedKey.num).Select(counter => lic.Id.ToString() + "|" + counter.ToString()).ToArray();
      }
      db.SaveChanges();
      return requestedKeys;
    }
    [Route("lmAdminCreateSingleLicenceKey"), HttpPost]
    public string lmAdminCreateSingleLicenceKey(int companyid, string prodId) {
      var db = NewData.Lib.CreateContext();
      //var prodId = lineToProductId[line];
      var lic = db.CompanyLicences.First(c => c.CompanyId == companyid && c.ProductId == prodId);
      var firstFree = lic.LastCounter + 1;
      lic.LastCounter += 1;
      db.SaveChanges();
      return lic.Id.ToString() + "|" + firstFree.ToString();
    }
    public class lmAdminCreateLicenceKey {
      public LMComLib.LineIds line; //no => school manager produkt
      public int num;
      public string[] keys; //ve formatu <licenceId>|<counter>
    }
    public static Dictionary<LineIds, string> lineToProductId = new Dictionary<LineIds, string>() {
      { LineIds.no, "/lm/blcourse/schoolmanager.product/" },
      { LineIds.English, "/lm/prods_lm_blcourse_english/" },
      { LineIds.German, "/lm/prods_lm_blcourse_german/" },
      { LineIds.French, "/lm/prods_lm_blcourse_french/" },
    };

    [Route("loadCompanyData"), HttpGet]
    public string loadCompanyData(int companyid) {
      var db = blendedData.Lib.CreateContext();
      var res = db.Companies.Where(c => c.Id == companyid).Select(c => c.LearningData).FirstOrDefault();
      return res;
    }

    [Route("writeCompanyData"), HttpPost]
    public void writeCompanyData(int companyid, [FromBody]string data) {
      var db = blendedData.Lib.CreateContext();
      var comp = db.Companies.First(c => c.Id == companyid);
      comp.LearningData = data;
      blendedData.Lib.SaveChanges(db);
    }

    [Route("reports"), HttpGet]
    public byte[] reports(string reportpar) {
      var par = JsonConvert.DeserializeObject<ExcelReport.requestPar>(reportpar);
      NewModel.Lib.downloadResponse(ExcelReport.run(par), "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "export.xlsx");
      return null;
    }

    //Napiste nam service - posle email
    [Route("writeUs"), HttpPost]
    public void writeUs([FromBody]string jsonData) {
      var res = JsonConvert.DeserializeObject<IWriteUs>(jsonData);
      StringBuilder sb = new StringBuilder();
      sb.AppendLine("Od: " + res.userFirstName + " " + res.userLastName);
      sb.AppendLine(res.text); sb.AppendLine(); sb.AppendLine();
      res.text = null;
      sb.AppendLine(JsonConvert.SerializeObject(res));
      Emailer em = new Emailer();
      em.PlainText = sb.ToString();
      //em.AddTo("pzika@langmaster.cz");
      em.AddTo("support@langmaster.cz");
      em.Subject = "LANGMaster technická podpora";
      em.From = res.userEmail;
      em.SendMail();
    }
    //D:\LMCom\REW\Web4\BlendedAPI\vyzva\Scripts\Lib.ts
    public class IWriteUs {
      public string stateName;
      public string stateParsJson;
      public string text;
      public string userEmail;
      public string userFirstName;
      public string userLastName;
      public string userJson;
    }

    //*************** AUTHOR
    //cviceni a instrukce, zakodovane do <url>|<jsonml>###...
    [Route("authorGetExJsonML"), HttpGet]
    public string authorGetExJsonML(string url) {
      var log = new LoggerMemory(true) { isVsNet = true };
      var pages = vsNetServer.buildExFiles(url, log).ToArray();
      if (log.hasError) throw new Exception(log.Log());
      return CourseMeta.buildLib.getBlendedScript(pages);
    }

    //*************** vytvoreni demo company
    [Route("createEmptyCompany"), HttpGet]
    public vyzva.PrepareDemoData.ICreateEmptySchoolResult createEmptyCompany(string companyTitle) {
      return vyzva.PrepareDemoData.createEmptyCompany(companyTitle);
    }

    [Route("createDemoCompanyStart"), HttpGet]
    public vyzva.PrepareDemoData.IPrepareNewDataResult createDemoCompanyStart(string companyTitle, string id) {
      return vyzva.PrepareDemoData.prepareNewData(companyTitle, id);
    }

    [Route("createDemoCompanyEnd"), HttpPost]
    public void createDemoCompanyEnd([FromBody] vyzva.PrepareDemoData.ICopyCourseData data) {
      vyzva.PrepareDemoData.copyCourseData(data);
    }

    //*************** vytvoreni demo company z nazvu company a generace 3 demoklicu (rozlisenim pro emaily je hash nazvu)
    [Route("keysFromCompanyTitle"), HttpGet]
    public vyzva.PrepareDemoDataNew.keysFromCompanyTitleResult keysFromCompanyTitle(string companyTitle) {
      return vyzva.PrepareDemoDataNew.keysFromCompanyTitle(companyTitle);
    }

    //**** pripravi data pro spusteni aplikace na zaklade licencniho klice (klic = <companyLicenceId,counter>)
    [Route("runDemoInformation"), HttpGet]
    public runDemoInformationResult runDemoInformation(int companyLicenceId, int counter) {
      var db = NewData.Lib.CreateContext();
      var licInfo = db.UserLicences.Where(u => u.CompanyLicence.Id == companyLicenceId && u.Counter == counter).Select(l => new {
        companyUserId = l.CourseUser.UserId,
        lmcomId = l.CourseUser.CompanyUser.UserId,
        l.CompanyLicence.CompanyId,
        l.CourseUser.ProductId,
        l.CourseUser.CompanyUser.User.EMail,
        l.CourseUser.CompanyUser.User.FirstName,
        l.CourseUser.CompanyUser.User.LastName,
        l.CourseUser.CompanyUser.User.OtherType,
      }).First();
      var licKeys = db.UserLicences.Where(u => u.CourseUser.UserId == licInfo.companyUserId && u.CourseUser.ProductId == licInfo.ProductId).Select(l => new {
        l.LicenceId,
        l.Counter,
      }).ToArray();
      return new runDemoInformationResult() {
        companyId = licInfo.CompanyId,
        lmcomId = licInfo.lmcomId,
        productUrl = licInfo.ProductId,
        licKeys = licKeys.Select(lk => lk.LicenceId.ToString() + "|" + lk.Counter.ToString()).ToArray(),
        email = licInfo.EMail,
        firstName = licInfo.FirstName,
        lastName = licInfo.LastName,
        otherType = (OtherType)licInfo.OtherType,
      };
    }
    public class runDemoInformationResult {
      public string email;
      public string firstName;
      public string lastName;
      public int companyId;
      public string productUrl;
      public long lmcomId;
      public string[] licKeys;
      public OtherType otherType;
    }

    //***************************  SCORM
    [Route("deleteProduct"), HttpPost]
    public void deleteProduct(int companyid, long lmcomId, string productUrl, string taskId) {
      var db = blendedData.Lib.CreateContext();
      db.CourseDatas.RemoveRange(db.CourseDatas.Where(cd => cd.CourseUser.CompanyId == companyid && cd.CourseUser.LMComId == lmcomId && cd.CourseUser.ProductUrl == productUrl && cd.TaskId == taskId));
      blendedData.Lib.SaveChanges(db);
    }

    //public class IResetData {
    //  public string url;
    //  public string taskId;
    //}
    //[Route("deleteDataKeys"), HttpPost]
    //public void deleteDataKeys(int companyid, long lmcomId, string productUrl, [FromBody]IResetData[] urlTaskIds) {
    //  var db = blendedData.Lib.CreateContext();
    //  blendedData.Lib.SaveChanges(db);
    //}

    public class ILoadShortData {
      public string url;
      public string taskId;
      public string shortData;
    }
    [Route("getShortProductDatas"), HttpGet]
    public ILoadShortData[] getShortProductDatas(int companyid, long lmcomId, string productUrl) {
      var db = blendedData.Lib.CreateContext();
      return db.CourseDatas.Where(cd => cd.CourseUser.CompanyId == companyid && cd.CourseUser.LMComId == lmcomId && cd.CourseUser.ProductUrl == productUrl).Select(cd => new ILoadShortData() { shortData = cd.ShortData, taskId = cd.TaskId, url = cd.Key }).ToArray();
    }

    [Route("getLongData"), HttpGet]
    public string getLongData(int companyid, long lmcomId, string productUrl, string taskid, string key) {
      var db = blendedData.Lib.CreateContext();
      return db.CourseDatas.Where(cd => cd.CourseUser.CompanyId == companyid && cd.CourseUser.LMComId == lmcomId && cd.CourseUser.ProductUrl == productUrl && cd.Key == key).Select(cd => cd.Data).FirstOrDefault();
    }

    [Route("debugClearProduct"), HttpGet]
    public void debugClearProduct(int companyid, long lmcomId, string productUrl) {
      var db = blendedData.Lib.CreateContext();
      var cu = db.CourseUsers.Where(cd => cd.CompanyId == companyid && cd.LMComId == lmcomId && cd.ProductUrl == productUrl).FirstOrDefault();
      if (cu == null) return;
      db.CourseUsers.Remove(cu);
      db.SaveChanges();
    }

    public class ISaveData {
      public string url;
      public string taskId;
      public CourseModel.CourseDataFlag flag;
      public string shortData;
      public string longData;
    }
    [Route("saveUserData"), HttpPost]
    public void saveUserData(int companyid, long lmcomId, string productUrl, [FromBody] ISaveData[] data) {
      var db = blendedData.Lib.CreateContext();
      var courseUser = db.CourseUsers.FirstOrDefault(cu => cu.CompanyId == companyid && cu.LMComId == lmcomId && cu.ProductUrl == productUrl);
      if (courseUser == null) db.CourseUsers.Add(courseUser = new blendedData.CourseUser() { CompanyId = companyid, LMComId = lmcomId, ProductUrl = productUrl });
      foreach (var dt in data) {
        var courseData = courseUser.CourseDatas.FirstOrDefault(cd => cd.Key == dt.url && cd.TaskId == dt.taskId);
        if (courseData != null && dt.shortData == null) { db.CourseDatas.Remove(courseData); continue; }
        if (courseData == null) db.CourseDatas.Add(courseData = new blendedData.CourseData() { CourseUser = courseUser, Key = dt.url, TaskId = dt.taskId });
        courseData.ShortData = dt.shortData; courseData.Data = dt.longData; courseData.Flags = (long)dt.flag;
      }
      blendedData.Lib.SaveChanges(db);
    }

  }
}