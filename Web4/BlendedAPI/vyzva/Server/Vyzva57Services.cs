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

    //special
    [Route("getCourseUserId"), HttpGet]
    public int getCourseUserId(int companyid, long userid, string producturl) {
      var db = NewData.Lib.CreateContext();
      return db.CourseUsers.Where(cu => cu.CompanyUser.CompanyId == companyid && cu.CompanyUser.UserId == userid && cu.ProductId == producturl).Select(cu => cu.Id).FirstOrDefault();
    }



    //ala SCORM 
    [Route("deleteDataKeys"), HttpPost]
    public void deleteDataKeys(int companyid, int courseUserid, string producturl, string taskid, [FromBody]string[] urls) {
    }

    public class shortDataItem {
      public string key; //key v ramci jedne skupiny informaci
      public string shortData; //strucna data
      public CourseModel.CourseDataFlag flag; //typ data
    }
    public class longDataItem : shortDataItem {
      public string taskid; //skupina informaci
      public string longData; //podrobna data
    }
    [Route("getShortProductDatas"), HttpGet]
    public shortDataItem[] getShortProductDatas(int companyid, int courseUserid, string producturl, string taskid) {
      return null;
    }

    [Route("getLongData"), HttpGet]
    public string getLongData(int companyid, int courseUserid, string producturl, string taskid, string key) {
      return null;
    }

    [Route("saveUserData"), HttpPost]
    public void saveUserData(int companyid, int courseUserid, string producturl, [FromBody] longDataItem[] data) {
    }
  }
}