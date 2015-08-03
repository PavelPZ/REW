using Admin;
using AzureData;
using LMComLib;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Web.Http;

namespace azure {

  public class emailRole {
    public string email;
    public CompUserRole role;
  }

  [RoutePrefix("adminCompany")]
  public class adminCompanyController : ApiController {

    const CompRole nonCompAdminsRoles = CompRole.HumanEvalator | CompRole.Admin;

    [Route("getCompanyUserRoles"), HttpGet]
    public emailRole[] getCompanyUserRoles(string compId) {
      var db = driverLow.create();
      var usersObj = db.compRead<Company_User>(compId).usersObj;
      return usersObj.Users.Select(u => new emailRole { email = u.EMail, role = u.Roles }).ToArray();
    }

    //***** admin firem v Admin\CompAdmins.ts
    [Route("setCompanyUserRoles"), HttpGet]
    public void setCompanyUserRoles(string compId, string email, CompRole role) { //pridani nebo aktualizace firemniho spravce. role==0 => vymazani
      refreshUserCompanyRelation(compId, email, (comp, user) => {
        if (role != 0) user.Roles.Role |= (role & ~nonCompAdminsRoles); else user.Roles.Role &= nonCompAdminsRoles; /*zachova pouze nonCompAdminsRoles*/
        comp.Roles = user.Roles;
      });
    }

    //***** zakladani evaluatoru v Admin/HumanEvalManager.ts
    [Route("setHumanEvaluator"), HttpPost]
    public void setHumanEvaluator(string compId, string email, [FromBody]LineIds[] lines) {
      refreshUserCompanyRelation(compId, email, (comp, user) => {
        if (lines != null && lines.Length > 0) {
          user.Roles.Role |= CompRole.HumanEvalator;
          user.Roles.HumanEvalatorInfos = lines.Select(l => new HumanEvalInfo { lang = l }).ToArray();
        } else {
          user.Roles.Role &= ~CompRole.HumanEvalator;
          user.Roles.HumanEvalatorInfos = null;
        }
      });
    }

    //priprava na aktualizaci vazeb mezi user a company. Vlastni aktualizace se provede v "action"
    public static void refreshUserCompanyRelation(string compId, string email, Action<Admin.UserCompany, CompanyUser> action) {
      var db = driverLow.create(); email = email.ToLower();
      //zajisteni existence objektu
      var comps = db.compReadForEdit<AzureData.Company_User>(compId);
      var users = AzureData.User_Company.prepareUser(db, email);
      //provazani company <=> user
      Admin.UserCompanyRelation.refresh(comps.usersObj, users.companiesObj, email, compId, action);
      db.SaveChanges();
    }

    public static void test(StringBuilder sb) {
      var db = driverLow.create();

      sb.AppendLine();
      sb.AppendLine("*************************************************************");
      sb.AppendLine("Admin/CompanyAdmin.ts");

      db.testDeleteAll();
      var adm = new adminCompanyController();
      var globAdm = new adminGlobalController();

      sb.AppendLine("***** otherCompanyAdmins, add, remove");
      adm.setCompanyUserRoles("comp1", "p&p.p", CompRole.Department | CompRole.Admin);
      adm.setCompanyUserRoles("comp1", "p2&p.p", CompRole.HumanEvalManager);
      sb.AppendLine(JsonConvert.SerializeObject(adm.getCompanyUserRoles("comp1")));
      adm.setCompanyUserRoles("comp1", "p2&p.p", 0);
      sb.AppendLine(JsonConvert.SerializeObject(adm.getCompanyUserRoles("comp1")));

      db.testDeleteAll();

      sb.AppendLine("***** otherCompanyAdmins, add company and system admin");
      globAdm.createNewCompany("comp1", "p@p.p", true);
      adm.setCompanyUserRoles("comp1", "p@p.p", CompRole.Department);
      sb.AppendLine(JsonConvert.SerializeObject(adm.getCompanyUserRoles("comp1")));

      sb.AppendLine("***** otherCompanyAdmins, remove company admin");
      adm.setCompanyUserRoles("comp1", "p@p.p", 0);
      sb.AppendLine(JsonConvert.SerializeObject(adm.getCompanyUserRoles("comp1")));
      sb.AppendLine(JsonConvert.SerializeObject(globAdm.getCompaniesAndTheirAdmins()));

      sb.AppendLine();
      sb.AppendLine("*************************************************************");
      sb.AppendLine("Admin/HumanEvalManager.ts");

      db.testDeleteAll();

      sb.AppendLine("***** evaluator: add, remove");
      adm.setHumanEvaluator("comp1", "p@p.p", new LineIds[] { LineIds.English, LineIds.German });
      sb.AppendLine("ADD: " + JsonConvert.SerializeObject(adm.getCompanyUserRoles("comp1")));
      adm.setHumanEvaluator("comp1", "p@p.p", new LineIds[] { LineIds.English });
      sb.AppendLine("EDIT: " + JsonConvert.SerializeObject(adm.getCompanyUserRoles("comp1")));
      adm.setHumanEvaluator("comp1", "p@p.p", new LineIds[0]);
      sb.AppendLine("REMOVE:" + JsonConvert.SerializeObject(adm.getCompanyUserRoles("comp1")));
      sb.AppendLine(JsonConvert.SerializeObject(db.compRead<Company_User>("comp1").usersObj));
    }
  }

}