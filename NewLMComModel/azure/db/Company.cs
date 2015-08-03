using azure;
using LMNetLib;
using Microsoft.WindowsAzure.Storage.Table;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.IO;
using System.Linq;
using System.Text;
using System.Web.Http;

namespace AzureData {

  
  public partial class Company_Low : azure.azureEntity {
    public Company_Low() : base() { }
    public string compId { get; set; }
    protected virtual void initData() { }
    public override string PartitionKey { get { return azure.keyLib.makeConst(azure.keyLib.encode(compId), true); } set { } }

    public static TRes doRead<TRes>(driverLow drv, string compId) where TRes : Company_Low, new() {
      if (compId == null) throw new Exception("compId == null");
      var example = new TRes { compId = compId };
      return drv.read<TRes>(example);
    }
    public static TRes doCreate<TRes>(string compId) where TRes : Company_Low, new() { var res = new TRes(); res.compId = compId; res.initData(); return res; }

    protected override void afterRead(string key, EntityProperty prop) {
      switch (key) {
        case "compId": compId = prop.StringValue; break;
        default: base.afterRead(key, prop); break;
      }
    }
    protected override void beforeWrite(Action<string, EntityProperty> writeProp) {
      writeProp("compId", new EntityProperty(compId));
    }
  }

  public class Company_User : Company_Low {
    public Company_User() : base() { }
    protected override void initData() { usersObj = new Admin.CompanyUsers { Users = new List<Admin.CompanyUser>() }; }

    //--- users s nejakou roli
    public Admin.CompanyUsers usersObj;
    public string users { get { return toJson(usersObj); } set { usersObj = fromJson<Admin.CompanyUsers>(value); } }
    protected override void afterRead(string key, EntityProperty prop) {
      switch (key) {
        case "users": users = prop.StringValue; break;
        default: base.afterRead(key, prop); break;
      }
    }
    protected override void beforeWrite(Action<string, EntityProperty> writeProp) {
      base.beforeWrite(writeProp);
      writeProp("users", new EntityProperty(users));
    }
  }

  public class Company_Meta : Company_Low {
    public Company_Meta() : base() { }
    protected override void initData() { metaObj = new Admin.CompanyMeta { Title = compId, Created = LowUtils.nowToNum() }; }
    //-- meta informace
    public Admin.CompanyMeta metaObj;
    public string meta { get { return toJson(metaObj); } set { metaObj = fromJson<Admin.CompanyMeta>(value); } }
    protected override void afterRead(string key, EntityProperty prop) {
      switch (key) {
        case "meta": meta = prop.StringValue; break;
        default: base.afterRead(key, prop); break;
      }
    }
    protected override void beforeWrite(Action<string, EntityProperty> writeProp) {
      base.beforeWrite(writeProp);
      writeProp("meta", new EntityProperty(meta));
    }
  }

  public class Company_Licence : Company_Low {
    public Company_Licence() : base() { }
    protected override void initData() { licenceObj = new Admin.CompanyLicences { Lics = new List<Admin.ProductLicence>() }; }
    //--- licence
    public Admin.CompanyLicences licenceObj;
    public byte[] licence {
      get { if (licenceObj == null) return null; using (var ms = new MemoryStream()) using (var wr = new BinaryWriter(ms)) { licenceObj.ToBinary(wr); return ms.ToArray(); } }
      set { if (value == null) { licenceObj = null; return; } using (var ms = new MemoryStream(value)) using (var rdr = new BinaryReader(ms)) licenceObj = Admin.CompanyLicences.FromBinary(rdr); }
    }
    protected override void afterRead(string key, EntityProperty prop) {
      switch (key) {
        case "licence": licence = prop.BinaryValue; break;
        default: base.afterRead(key, prop); break;
      }
    }
    protected override void beforeWrite(Action<string, EntityProperty> writeProp) {
      base.beforeWrite(writeProp);
      writeProp("licence", new EntityProperty(licence));
    }
  }

  public class Company_Department : Company_Low {
    public Company_Department() : base() { }
    protected override void initData() { departmentsObj = new Admin.DepartmentRoot { Title = compId }; }
    //--- departments
    public Admin.DepartmentRoot departmentsObj;
    public string departments { get { return toJson(departmentsObj); } set { departmentsObj = fromJson<Admin.DepartmentRoot>(value); } }
    protected override void afterRead(string key, EntityProperty prop) {
      switch (key) {
        case "departments": departments = prop.StringValue; break;
        default: base.afterRead(key, prop); break;
      }
    }
    protected override void beforeWrite(Action<string, EntityProperty> writeProp) {
      base.beforeWrite(writeProp);
      writeProp("departments", new EntityProperty(departments));
    }
  }

  public class Company_DepartmentUsage : Company_Low {
    public Company_DepartmentUsage() : base() { }
    protected override void initData() { departmentUsageObj = new Admin.DepartmentUsages { Usages = new List<Admin.DepartmentUsage>() }; }
    //--- departments usage
    public Admin.DepartmentUsages departmentUsageObj;
    public byte[] departmentUsage {
      get { if (departmentUsageObj == null) return null; using (var ms = new MemoryStream()) using (var wr = new BinaryWriter(ms)) { departmentUsageObj.ToBinary(wr); return ms.ToArray(); } }
      set { if (value == null) { departmentUsageObj = null; return; } using (var ms = new MemoryStream(value)) using (var rdr = new BinaryReader(ms)) departmentUsageObj = Admin.DepartmentUsages.FromBinary(rdr); }
    }
    protected override void afterRead(string key, EntityProperty prop) {
      switch (key) {
        case "departmentUsage": departmentUsage = prop.BinaryValue; break;
        default: base.afterRead(key, prop); break;
      }
    }
    protected override void beforeWrite(Action<string, EntityProperty> writeProp) {
      base.beforeWrite(writeProp);
      writeProp("departmentUsage", new EntityProperty(departmentUsage));
    }
  }

  public partial class Company_Low {

    //all company userObjs
    public static IEnumerable<Company_User> allUserObjs(driverLow drv) {
      return drv.keyQuery(new Company_User()).Select(c => new { compId = c.compId, users = c.users }).ToArray().Select(c => new Company_User { compId = c.compId, users = c.users }); //XXX
    }

    public static void test(StringBuilder sb) {
      var db = driverLow.create();

      sb.AppendLine();
      sb.AppendLine("*************************************************************");

      db.testDeleteAll();

      sb.AppendLine("***** company insert, select, merged update");
      db.compReadForEdit<Company_Meta>("comp1"); db.compReadForEdit<Company_Meta>("comp2"); db.SaveChanges();
      var sel1 = db.compReadForEdit<Company_Meta>("comp1");
      sel1.metaObj.Title = "t2";
      var sel2 = db.compReadForEdit<Company_Meta>("comp2");
      sel2.metaObj.Title = "t3";
      db.SaveChanges();
      sb.AppendLine(JsonConvert.SerializeObject(db.compRead<Company_Meta>("comp1")));
      sb.AppendLine(JsonConvert.SerializeObject(db.compRead<Company_Meta>("comp2")));

      db.testDeleteAll();
      sb.AppendLine("***** company allUserObjs");
      db.compReadForEdit<Company_Meta>("comp0"); db.compReadForEdit<Company_Meta>("comp2"); db.compReadForEdit<Company_Meta>("comp3"); db.SaveChanges();
      db.executeQuery(db.keyRangeQuery(new Company_Meta())).Select(c => { sb.AppendLine(JsonConvert.SerializeObject(c)); return true; }).ToArray();
    }
  }

  [RoutePrefix("dbCompany")]
  public class dbCompanyController : ApiController {

    [Route("doRead/user"), HttpGet]
    public JSCompany doRead_user(string compId) {
      var db = driverLow.create();
      var comp = db.compRead<Company_User>(compId);
      return comp == null ? null : new JSCompany { compId = comp.compId, usersObj = comp.usersObj };
    }
    [Route("doRead/meta"), HttpGet]
    public JSCompany doRead_meta(string compId) {
      var db = driverLow.create();
      var comp = db.compRead<Company_Meta>(compId);
      return comp == null ? null : new JSCompany { compId = comp.compId, metaObj = comp.metaObj };
    }
    [Route("doRead/licence"), HttpGet]
    public JSCompany doRead_licence(string compId) {
      var db = driverLow.create();
      var comp = db.compRead<Company_Licence>(compId);
      return comp == null ? null : new JSCompany { compId = comp.compId, licenceObj = comp.licenceObj };
    }
    [Route("doRead/department"), HttpGet]
    public JSCompany doRead_department(string compId) {
      var db = driverLow.create();
      var comp = db.compRead<Company_Department>(compId);
      return comp == null ? null : new JSCompany { compId = comp.compId, departmentsObj = comp.departmentsObj };
    }
    [Route("doRead/departmentUsage"), HttpGet]
    public JSCompany doRead_departmentUsage(string compId) {
      var db = driverLow.create();
      var comp = db.compRead<Company_DepartmentUsage>(compId);
      return comp == null ? null : new JSCompany { compId = comp.compId, departmentUsageObj = comp.departmentUsageObj };
    }
    public class JSCompany {
      public string compId;
      public Admin.CompanyMeta metaObj;
      public Admin.CompanyLicences licenceObj;
      public Admin.DepartmentRoot departmentsObj;
      public Admin.CompanyUsers usersObj;
      public Admin.DepartmentUsages departmentUsageObj;
    }
  }
}
