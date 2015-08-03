using LMComLib;
using LMNetLib;
using Login;
using System.Text;
using Newtonsoft.Json;
using System.Web.Http;
using AzureData;

namespace azure {


  [RoutePrefix("login")]
  public class LoginController : ApiController {

    [Route("CreateLmUserStart"), HttpPost]
    public string CreateLmUserStart([FromBody]LMCookieJS cook, string password) {
      password = LowUtils.unpackStr(password);
      var db = driverLow.create();
      cook.EMail = cook.EMail.ToLower();
      var userObj = db.userReadForEdit<User_Data>(cook.EMail);
      bool justCreated = userObj.isNew();
      if (!justCreated) {
        var data = userObj.dataObj;
        switch (data.VerifyStatus) {
          case VerifyStates.ok:
            if (data.Type == OtherType.LANGMaster || data.Type == OtherType.LANGMasterNoEMail)
              return null; //user already registered
            else {
              userObj.password = password;
              db.SaveChanges();
              return userObj.email;
            }
          case VerifyStates.waiting:
            return userObj.email;
          case VerifyStates.prepared:
            userObj.password = password;
            data.VerifyStatus = VerifyStates.waiting;
            db.SaveChanges();
            return userObj.email;
        }
      }
      cook.VerifyStatus = cook.Type == OtherType.LANGMasterNoEMail ? VerifyStates.ok : VerifyStates.waiting;
      cook.created = LowUtils.nowToNum();
      userObj.dataObj = cook;
      userObj.password = password;
      db.SaveChanges();
      return userObj.email;
    }

    [Route("OnOtherLogin"), HttpGet]
    public LMCookieJS OnOtherLogin(OtherType otherType, string otherId, string email, string firstName, string lastName) {
      var db = driverLow.create(); email = email.ToLower();
      var userObj = db.userReadForEdit<User_Data>(email);
      userObj.dataObj = new LMCookieJS {
        VerifyStatus = VerifyStates.ok,
        EMail = email,
        Type = otherType,
        TypeId = otherId,
        FirstName = firstName,
        LastName = lastName,
        created = LowUtils.nowToNum(),
      };
      db.SaveChanges();
      return userObj.dataObj;
    }

    [Route("CreateLmUserEnd"), HttpGet]
    public void CreateLmUserEnd(string email) {
      var db = driverLow.create();
      var userObj = db.userReadForEdit<User_Data>(email);
      if (userObj == null || (userObj.dataObj.VerifyStatus == VerifyStates.ok && userObj.dataObj.Type == OtherType.LANGMaster)) return;
      var isLmcomUser = userObj.dataObj.Type == OtherType.LANGMaster || userObj.dataObj.Type == OtherType.LANGMasterNoEMail;
      if (!isLmcomUser) {
        userObj.dataObj.Type = OtherType.LANGMaster;
        userObj.dataObj.TypeId = null;
      }
      userObj.dataObj.VerifyStatus = VerifyStates.ok;
      db.SaveChanges();
    }

    [Route("ChangePassword"), HttpGet]
    public bool ChangePassword(string email, string oldPsw, string newPsw) {
      oldPsw = LowUtils.unpackStr(oldPsw);
      newPsw = LowUtils.unpackStr(newPsw);
      var db = driverLow.create();
      var userObj = db.userReadForEdit<User_Data>(email);
      if (userObj == null || userObj.password != oldPsw) return false;
      userObj.password = newPsw;
      db.SaveChanges();
      return true;
    }

    [Route("GetPassword"), HttpGet]
    public string GetPassword(string email) {
      var db = driverLow.create();
      var userObj = db.userRead<User_Data>(email);
      //if (userObj == null || userObj.dataObj.Type != OtherType.LANGMaster) return null;
      return LowUtils.packStr(userObj.password);
    }

    [Route("OnLMLogin"), HttpGet]
    public LMCookieJS OnLMLogin(string email, string password) {
      var db = driverLow.create();
      var userObj = db.userRead<User_Data>(email.ToLower());
      if (userObj == null) return null;
      password = LowUtils.unpackStr(password);
      if (userObj.password != password || userObj.dataObj.VerifyStatus != VerifyStates.ok) return null;
      return userObj.dataObj;
    }

    [Route("SaveProfile"), HttpPost]
    public void SaveProfile([FromBody]LMCookieJS cook) {
      var db = driverLow.create();
      var userObj = db.userReadForEdit<User_Data>(cook.EMail); //nenacte zadne properties
      userObj.dataObj = cook;
      db.SaveChanges();
    }

    public static void test(StringBuilder sb) {
      var db = driverLow.create();

      sb.AppendLine();
      sb.AppendLine("*************************************************************");

      db.testDeleteAll();

      var srv = new LoginController();
      var packedPsw = LowUtils.packStr("xstdg");

      sb.AppendLine("***** CreateLmUserStart");
      var email = srv.CreateLmUserStart(new LMCookieJS { EMail = "p@p.p" }, packedPsw); srv.CreateLmUserEnd(email);
      sb.AppendLine(JsonConvert.SerializeObject(db.userRead<User_Data>(email)));

      sb.AppendLine("***** OnOtherLogin");
      var cook = srv.OnOtherLogin(OtherType.Google, "jhlkjhkhl k", "p2@p.p", "fm", "lm");
      sb.AppendLine(JsonConvert.SerializeObject(db.userRead<User_Data>(cook.EMail)));

      sb.AppendLine("***** lm => google login");
      email = srv.CreateLmUserStart(new LMCookieJS { EMail = "p3@p.p" }, packedPsw);
      srv.CreateLmUserEnd(email);
      cook = srv.OnOtherLogin(OtherType.Google, "jhlkjhkhl k", "p3@p.p", "fm", "lm");
      sb.AppendLine(JsonConvert.SerializeObject(db.userRead<User_Data>(cook.EMail)));

      sb.AppendLine("***** SaveProfile ");
      email = srv.CreateLmUserStart(new LMCookieJS { EMail = "p4@p.p" }, packedPsw);
      srv.CreateLmUserEnd(email);
      cook = db.userRead<User_Data>(email).dataObj;
      cook.FirstName = "Modified FirstName";
      srv.SaveProfile(cook);
      sb.AppendLine(JsonConvert.SerializeObject(db.userRead<User_Data>(cook.EMail)));

      sb.AppendLine("***** OnLMLogin ");
      email = srv.CreateLmUserStart(new LMCookieJS { EMail = "p5@p.p" }, packedPsw);
      srv.CreateLmUserEnd(email);
      cook = srv.OnLMLogin("p5@p.p", LowUtils.packStr("xstdg"));
      sb.AppendLine(JsonConvert.SerializeObject(cook));

      sb.AppendLine("***** GetPassword ");
      email = srv.CreateLmUserStart(new LMCookieJS { EMail = "p6@p.p" }, packedPsw);
      srv.CreateLmUserEnd(email);
      sb.AppendLine(LowUtils.unpackStr(srv.GetPassword("p6@p.p")));

      sb.AppendLine("***** ChangePassword ");
      email = srv.CreateLmUserStart(new LMCookieJS { EMail = "p7@p.p" }, packedPsw);
      srv.CreateLmUserEnd(email);
      srv.ChangePassword(email, packedPsw, LowUtils.packStr("newpassword"));
      sb.AppendLine(LowUtils.unpackStr(srv.GetPassword("p7@p.p")));
      //
    }


  }


}
