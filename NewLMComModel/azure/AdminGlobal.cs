using Admin;
using AzureData;
using LMComLib;
using LMNetLib;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Web.Http;

namespace azure {

  public class mainCompanyAdmin {
    public string compId;
    public string[] emails;
  }

  [RoutePrefix("adminGlobal")]
  public class adminGlobalController : ApiController {
    //***** firmy a hlavni admins v  Admin\Admin.ts
    [Route("createSystemAdmin"), HttpGet]
    public string createSystemAdmin(string systemAdminEmail, bool isAdd) { //START: pridani hlavniho systemoveho admina (ktery muze pridavat firmy). Muze pouze PZ. isAdd prida nebo ubere roli
      var db = driverLow.create();
      AzureData.User_Data userObj; systemAdminEmail = systemAdminEmail.ToLower();
      var sysUsers = db.sysReadForEdit<Sys_Admin>(); 
      if (isAdd) {
        if (sysUsers.strDataList.IndexOf(systemAdminEmail) >= 0) throw new Exception("sys.IndexOf(systemAdminEmail) >= 0");
        sysUsers.strDataList.Add(systemAdminEmail);
        userObj = AzureData.User_Data.prepareUser(db, systemAdminEmail);
        userObj.dataObj.Roles |= Role.Comps;
      } else {
        if (sysUsers.strDataList.IndexOf(systemAdminEmail) == 0) throw new Exception("sys.IndexOf(systemAdminEmail) == 0");
        sysUsers.strDataList.Remove(systemAdminEmail);
        userObj = db.userReadForEdit<User_Data>(systemAdminEmail);
        if (userObj == null) return null;
        userObj.dataObj.Roles &= ~Role.Comps;
      }
      //sysUsers.emails = sys.Count == 0 ? null : sys.Aggregate((r, i) => r + "," + i);
      db.SaveChanges();
      return userObj.email;
    }

    [Route("getSystemAdmins"), HttpGet]
    public List<string> getSystemAdmins() {
      var db = driverDb.create();
      var sysUsers = db.sysRead<Sys_Admin>(); if (sysUsers == null || sysUsers.strDataList.Count == 0) return null;
      return sysUsers.strDataList;
    }

    [Route("createNewCompany"), HttpGet]
    public void createNewCompany(string compId, string email, bool isAdd) {
      adminCompanyController.refreshUserCompanyRelation(compId, email, (comp, user) => {
        if (isAdd) user.Roles.Role |= CompRole.Admin; else user.Roles.Role &= ~CompRole.Admin;
        comp.Roles = user.Roles;
      });
    }

    [Route("getCompaniesAndTheirAdmins"), HttpGet]
    public mainCompanyAdmin[] getCompaniesAndTheirAdmins() {
      var db = driverDb.create();
      var allUsers = AzureData.Company_Low.allUserObjs(db).Where(c => c.usersObj != null && c.usersObj.Users != null && c.usersObj.Users.Any(u => (u.Roles.Role & CompRole.Admin) != 0)).ToArray();
      return allUsers.Select(c => new mainCompanyAdmin { compId = c.compId, emails = c.usersObj.Users.Where(u => (u.Roles.Role & CompRole.Admin) != 0).Select(u => u.EMail).ToArray() }).ToArray();
    }

    public static void test(StringBuilder sb) {
      var db = driverLow.create();

      sb.AppendLine();
      sb.AppendLine("*************************************************************");
      sb.AppendLine("Admin/Admin.ts");

      db.testDeleteAll();
      var adm = new adminGlobalController();

      var logSrv = new azure.LoginController();
      var packedPsw = LowUtils.packStr("xstdg");

      sb.AppendLine("***** systemAdmin, add, not exist");
      var email = adm.createSystemAdmin("p@p.p", true);
      sb.AppendLine(JsonConvert.SerializeObject(db.userRead<User_Data>(email)));
      email = logSrv.CreateLmUserStart(new LMCookieJS { EMail = "p@p.p" }, packedPsw); logSrv.CreateLmUserEnd(email);
      sb.AppendLine(JsonConvert.SerializeObject(db.userRead<User_Data>(email)));
      sb.AppendLine(db.sysRead<Sys_Admin>().strData);

      sb.AppendLine("***** systemAdmin, add, exist");
      email = logSrv.CreateLmUserStart(new LMCookieJS { EMail = "p2@p.p" }, packedPsw); logSrv.CreateLmUserEnd(email);
      sb.AppendLine(JsonConvert.SerializeObject(db.userRead<User_Data>(email)));
      email = adm.createSystemAdmin("p2@p.p", true);
      sb.AppendLine(JsonConvert.SerializeObject(db.userRead<User_Data>(email)));
      sb.AppendLine(db.sysRead<Sys_Admin>().strData);

      sb.AppendLine("***** systemAdmin, remove, exist");
      email = adm.createSystemAdmin("p2@p.p", false);
      sb.AppendLine(JsonConvert.SerializeObject(db.userRead<User_Data>(email)));
      sb.AppendLine(db.sysRead<Sys_Admin>().strData);

      sb.AppendLine();
      db.testDeleteAll();

      sb.AppendLine("***** mainCompanyAdmin, add");
      //new azureModel.Company("comp1").insert();
      //new azureModel.User("p@p.p").insert();
      //new azureModel.User("p2@p.p").insert();
      adm.createNewCompany("comp1", "p@p.p", true);
      sb.AppendLine("company." + JsonConvert.SerializeObject(db.compRead<Company_User>("comp1").usersObj));
      sb.AppendLine("user" + JsonConvert.SerializeObject(db.userRead<User_Company>("p@p.p").companiesObj));

      sb.AppendLine("***** mainCompanyAdmin, remove");
      adm.createNewCompany("comp1", "p@p.p", false);
      sb.AppendLine("company." + JsonConvert.SerializeObject(db.compRead<Company_User>("comp1").usersObj));
      sb.AppendLine("user" + JsonConvert.SerializeObject(db.userRead<User_Company>("p@p.p").companiesObj));

      sb.AppendLine("***** mainCompanyAdmin, add, add");
      adm.createNewCompany("comp1", "p@p.p", true);
      adm.createNewCompany("comp1", "p2@p.p", true);
      sb.AppendLine("company." + JsonConvert.SerializeObject(db.compRead<Company_User>("comp1").usersObj));
      sb.AppendLine("user" + JsonConvert.SerializeObject(db.userRead<User_Company>("p@p.p").companiesObj));
      sb.AppendLine("user" + JsonConvert.SerializeObject(db.userRead<User_Company>("p2@p.p").companiesObj));

      sb.AppendLine("***** mainCompanyAdmin, add, remove");
      adm.createNewCompany("comp1", "p@p.p", true);
      adm.createNewCompany("comp1", "p2@p.p", false);
      sb.AppendLine("company." + JsonConvert.SerializeObject(db.compRead<Company_User>("comp1").usersObj));
      sb.AppendLine("user" + JsonConvert.SerializeObject(db.userRead<User_Company>("p@p.p").companiesObj));
      sb.AppendLine("user" + JsonConvert.SerializeObject(db.userRead<User_Company>("p2@p.p").companiesObj));

      sb.AppendLine("***** mainCompanyAdmin, getMainCompanyAdmins");
      sb.AppendLine(JsonConvert.SerializeObject(adm.getCompaniesAndTheirAdmins()));
 
    }
  }
}