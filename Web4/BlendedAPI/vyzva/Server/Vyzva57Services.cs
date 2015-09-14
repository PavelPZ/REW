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

namespace blended {

  [RoutePrefix("Vyzva57Services")]
  public class Vyzva57ServicesController : ApiController {

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
    public class lmAdminCreateLicenceKey {
      public LMComLib.LineIds line; //no => school manager produkt
      public int num;
      public string[] keys; //ve formatu <licenceId>|<counter>
    }
    static Dictionary<LineIds, string> lineToProductId = new Dictionary<LineIds, string>() {
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

    [Route("writeUs"), HttpPost]
    public void writeUs([FromBody]string jsonData) {
      var res = JsonConvert.DeserializeObject<IWriteUs>(jsonData);
      Emailer em = new Emailer();
      StringBuilder sb = new StringBuilder();
      sb.AppendLine("Od: " + res.userFirstName + " " + res.userLastName);
      sb.AppendLine(res.text); sb.AppendLine(); sb.AppendLine();
      res.text = null;
      sb.AppendLine(JsonConvert.SerializeObject(res));
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

    //***************************  SCORM
    public class IResetData {
      public string url;
      public string taskId;
    }
    [Route("deleteDataKeys"), HttpPost]
    public void deleteDataKeys(int companyid, long lmcomId, string productUrl, [FromBody]IResetData[] urlTaskIds) {
      var db = blendedData.Lib.CreateContext();
      blendedData.Lib.SaveChanges(db);
    }

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
        if (courseData == null) db.CourseDatas.Add(courseData = new blendedData.CourseData() { CourseUser = courseUser, Key = dt.url, TaskId = dt.taskId });
        courseData.ShortData = dt.shortData; courseData.Data = dt.longData; courseData.Flags = (long)dt.flag;
      }
      blendedData.Lib.SaveChanges(db);
    }

  }
}