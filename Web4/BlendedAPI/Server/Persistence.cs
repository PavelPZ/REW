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

  [RoutePrefix("BlendedPersistenceController")]
  public class BlendedPersistenceController : ApiController {

    public class IResetData {
      public string url;
      public string taskId;
    }
    [Route("deleteDataKeys"), HttpPost]
    public void deleteDataKeys(int companyid, int courseUserid, string producturl, string taskid, [FromBody]IResetData[] urlTaskIds) {
      var db = blendedData.Lib.CreateContext();
      blendedData.Lib.SaveChanges(db);
    }

    public class ILoadShortData {
      public string url;
      public string taskId;
      public string shortData;
    }
    [Route("getShortProductDatas"), HttpGet]
    public ILoadShortData[] getShortProductDatas(int companyid, int courseUserid, string producturl) {
      var db = blendedData.Lib.CreateContext();
      
      return new ILoadShortData[0];
    }

    [Route("getLongData"), HttpGet]
    public string getLongData(int companyid, int courseUserid, string producturl, string taskid, string key) {
      var db = blendedData.Lib.CreateContext();
      if (db.Companies.Any()) return null;
      return null;
    }

    public class ISaveData {
      public string url;
      public string taskId;
      public string shortData;
      public string longData;
    }
    [Route("saveUserData"), HttpPost]
    public void saveUserData(int companyid, int courseUserid, string producturl, [FromBody] ISaveData[] data) {
      var db = blendedData.Lib.CreateContext();
      blendedData.Lib.SaveChanges(db);
    }
  }
}