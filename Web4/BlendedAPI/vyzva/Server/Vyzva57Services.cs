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

namespace blended {

  [RoutePrefix("Vyzva57Services")]
  public class Vyzva57ServicesController : ApiController {

    [Route("lmAdminCreateCompany"), HttpPost]
    public void lmAdminCreateCompany(int companyid, [FromBody]string companyData) {
      var db = blendedData.Lib.CreateContext();
      if (db.Companies.Any(c => c.Id == companyid)) return;
      db.Companies.Add(new blendedData.Company { Id = companyid, LearningData = companyData });
      blendedData.Lib.SaveChanges(db);
    }
    [Route("lmAdminCreateLicenceKeys"), HttpPost]
    public lmAdminCreateLicenceKey[] lmAdminCreateLicenceKeys(int companyid, [FromBody]lmAdminCreateLicenceKey[] requestedKeys) {
      return null;
    }
    public class lmAdminCreateLicenceKey {
      public LMComLib.LineIds line; //no => school manager produkt
      public int num;
      public bool isPattern3;
      public string[] keys; //ve formatu <licenceId>|<counter>
    }

    //****** Company.Data se strukturou grup, spravcu, studentu apod.
    [Route("loadCompanyData"), HttpGet]
    public companyData loadCompanyData(int companyid, bool isLearningdata, bool isOrderData) {
      var db = blendedData.Lib.CreateContext();
      if (isLearningdata && !isOrderData)
        return db.Companies.Where(c => c.Id == companyid).Select(c => new companyData { LearningData = c.LearningData }).FirstOrDefault();
      else if (!isLearningdata && isOrderData)
        return db.Companies.Where(c => c.Id == companyid).Select(c => new companyData { OrderData = c.OrderData }).FirstOrDefault();
      else
        return db.Companies.Where(c => c.Id == companyid).Select(c => new companyData { OrderData = c.OrderData, LearningData = c.LearningData }).FirstOrDefault();
    }

    [Route("writeCompanyData"), HttpPost]
    public void writeCompanyData(int companyid, [FromBody]companyData data) {
      var db = blendedData.Lib.CreateContext();
      var comp = db.Companies.First(c => c.Id == companyid);
      if (data.LearningData!=null) comp.LearningData = data.LearningData;
      if (data.OrderData != null) comp.LearningData = data.OrderData;
      blendedData.Lib.SaveChanges(db);
    }

    public class companyData {
      public string LearningData;
      public string OrderData;
    }

  }
}