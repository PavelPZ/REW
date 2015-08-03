using azure;
using LMComLib;
using LMNetLib;
using Microsoft.WindowsAzure.Storage.Table;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Web.Http;

namespace AzureData {

  public partial class User_Low : azure.azureEntity {
    public User_Low() : base() { }
    public string email { get; set; }
    protected virtual void initData() { }
    public override string PartitionKey { get { return azure.keyLib.makeConst(azure.keyLib.encode(email), true); } set { } }

    public static TRes doRead<TRes>(driverLow drv, string email) where TRes : User_Low, new() {
      if (email == null) throw new Exception("compId == null");
      var example = new TRes { email = email };
      return drv.read<TRes>(example);
    }
    public static TRes doCreate<TRes>(string email) where TRes : User_Low, new() { var res = new TRes(); res.email = email; res.initData(); return res; }

    protected override void afterRead(string key, EntityProperty prop) {
      switch (key) {
        case "email": email = prop.StringValue; break;
        default: base.afterRead(key, prop); break;
      }
    }
    protected override void beforeWrite(Action<string, EntityProperty> writeProp) {
      writeProp("email", new EntityProperty(email));
    }
  }

  public class User_Data : User_Low {
    public User_Data() : base() { }
    protected override void initData() { dataObj = new LMCookieJS { EMail = email, created = LowUtils.nowToNum() }; }
    public string password { get; set; }
    //--- meta informace
    public LMCookieJS dataObj;
    public string data { get { if (dataObj == null) return null; dataObj.EMail = email; return toJson(dataObj); } set { dataObj = fromJson<LMCookieJS>(value); } }
    public static User_Data prepareUser(driverLow db, string email) {
      var userObj = db.userReadForEdit<User_Data>(email);
      if (userObj.isNew()) userObj.dataObj.VerifyStatus = VerifyStates.prepared;
      return userObj;
    }
    protected override void afterRead(string key, EntityProperty prop) {
      switch (key) {
        case "password": password = prop.StringValue; break;
        case "data": data = prop.StringValue; break;
        default: base.afterRead(key, prop); break;
      }
    }
    protected override void beforeWrite(Action<string, EntityProperty> writeProp) {
      base.beforeWrite(writeProp);
      writeProp("password", new EntityProperty(password));
      writeProp("data", new EntityProperty(data));
    }
  }

  public class User_Company : User_Low {
    public User_Company() : base() { }
    protected override void initData() { companiesObj = new Admin.UserCompanies { Companies = new List<Admin.UserCompany>() }; }
    //--- role, licence apod.
    public Admin.UserCompanies companiesObj;
    public string companies { get { return toJson(companiesObj); } set { companiesObj = fromJson<Admin.UserCompanies>(value); } }
    public static User_Company prepareUser(driverLow db, string email) {
      var userObj = db.userReadForEdit<User_Data>(email);
      if (userObj.isNew()) userObj.dataObj.VerifyStatus = VerifyStates.prepared;
      return db.userReadForEdit<User_Company>(email);
    }

    protected override void afterRead(string key, EntityProperty prop) {
      switch (key) {
        case "companies": companies = prop.StringValue; break;
        default: base.afterRead(key, prop); break;
      }
    }
    protected override void beforeWrite(Action<string, EntityProperty> writeProp) {
      base.beforeWrite(writeProp);
      writeProp("companies", new EntityProperty(companies));
    }
  }

  public partial class User_Low {

    public static void test(StringBuilder sb) {
      var db = driverLow.create();
      sb.AppendLine();
      sb.AppendLine("*************************************************************");
      db.testDeleteAll();

      sb.AppendLine("***** user insert error");
      var usr = db.userReadForEdit<User_Data>("p@p.p"); usr.dataObj.FirstName = "p"; usr.dataObj.LastName = "z"; db.SaveChanges();
      var sel1 = db.userRead<User_Data>("p@p.p");

      sb.AppendLine("***** range query");
      db.userReadForEdit<User_Data>("p2@p.p"); db.SaveChanges();
      var res = db.executeQuery(db.keyRangeQuery(new User_Data())).ToArray();
      var fake = res.Select(r => { sb.AppendLine(JsonConvert.SerializeObject(r)); return true; }).ToArray();
    }
  }

  [RoutePrefix("dbUser")]
  public class dbUserController : ApiController {

    [Route("doRead/data"), HttpGet]
    public JSUser doRead_data(string email) {
      var db = driverLow.create();
      var usr = db.userRead<User_Data>(email);
      return usr == null ? null : new JSUser { email = usr.email, dataObj = usr.dataObj, };
    }
    [Route("doRead/companies"), HttpGet]
    public JSUser doRead_companies(string email) {
      var db = driverLow.create();
      var usr = db.userRead<User_Company>(email);
      return usr == null ? null : new JSUser { email = usr.email, companiesObj = usr.companiesObj, };
    }
    public class JSUser {
      public string email;
      public LMCookieJS dataObj;
      public Admin.UserCompanies companiesObj;
    }
  }
}
