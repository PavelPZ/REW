using LMComLib;
using Microsoft.WindowsAzure.Storage.Table;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;

namespace LoginServices {

  public class authController : ApiController {

    public static void init() {
      table = AzureLib.Factory.createTable(tableName);
    }
    public static CloudTable table;
    const string tableName = "auth";

    [ActionName("Login"), HttpGet]
    public LoginResult Login(string email, string psw) {
      var user = tableLow.Retrieve<tableUser>(email);
      if (user == null) return new LoginResult { result = ServiceResult.wrongEMail };
      if (user.psw != psw) return new LoginResult { result = ServiceResult.wrongPassword };
      return new LoginResult { email = user.email, firstName = user.firstName, lastName = user.lastName };
    }
    public class LoginResult {
      public string email;
      public string firstName;
      public string lastName;
      public ServiceResult result;
    }

    [ActionName("Register"), HttpGet]
    public void Register(string email, string psw, string firstName, string lastName, string confirmId) {
      var reg = new tableConfirmReg(confirmId) { email = email, psw = psw, firstName = firstName, lastName = lastName, created = DateTime.UtcNow };
      reg.insert();
    }

    [ActionName("ConfirmRegistration"), HttpGet]
    public LoginResult ConfirmRegistration(string confirmId) {
      var reg = tableLow.Retrieve<tableConfirmReg>(confirmId);
      if (reg==null) return new LoginResult { result = ServiceResult.alreadyConfirmed };
      if ((DateTime.Now - reg.created).TotalSeconds > 60 * 60 * 24 * 7) return new LoginResult { result = ServiceResult.confirmExpired };
      var user = new tableUser(reg.email) { psw = reg.psw, firstName = reg.firstName, lastName = reg.lastName };
      var batch = new TableBatchOperation();
      batch.InsertOrReplace(user); batch.Delete(reg);
      table.ExecuteBatch(batch);
      return new LoginResult { email = user.email, firstName = user.firstName, lastName = user.lastName };
    }

    [ActionName("ChangeProfile"), HttpGet]
    public ServiceResult ChangeProfile(string email, string firstName, string lastName) {
      var user = tableLow.Retrieve<tableUser>(email);
      if (user == null) return ServiceResult.wrongEMail;
      user.firstName = firstName; user.lastName = lastName;
      user.insert();
      return ServiceResult.ok;
    }

    [ActionName("ChangePassword"), HttpGet]
    public ServiceResult ChangePassword(string email, string oldPsw, string newPsw) {
      var user = tableLow.Retrieve<tableUser>(email);
      if (user == null) return ServiceResult.wrongEMail;
      if (user.psw != oldPsw) return ServiceResult.wrongPassword;
      user.psw = newPsw; user.insert();
      return ServiceResult.ok;
    }

    [ActionName("ForgotPassword"), HttpGet]
    public ServiceResult ForgotPassword(string email, string confirmId) {
      var user = tableLow.Retrieve<tableUser>(email); if (user == null) return ServiceResult.wrongEMail;
      new tableConfirmForgotPsw(confirmId) { email = email, created = DateTime.UtcNow }.insert();
      return ServiceResult.ok;
    }

    [ActionName("ConfirmForgotPassword"), HttpGet]
    public LoginResult ConfirmForgotPassword(string confirmId, string newPsw) {
      var reg = tableLow.Retrieve<tableConfirmForgotPsw>(confirmId);
      if (reg==null) return new LoginResult { result = ServiceResult.alreadyConfirmed };
      if ((DateTime.Now - reg.created).TotalSeconds > 60 * 60 * 24 * 7) return new LoginResult { result = ServiceResult.confirmExpired };
      var user = tableLow.Retrieve<tableUser>(reg.email);
      user.psw = newPsw;
      user.insert();
      return new LoginResult { email = user.email, firstName = user.firstName, lastName = user.lastName };
    }

    [ActionName("oAuthNotify"), HttpGet]
    public void oAuthNotify(string email, string firstName, string lastName, servConfig.oAuthProviders provider, string providerId) {
      new tableOAuthUser(email, provider, providerId) { firstName = firstName, lastName = lastName }.insert();
    }
  }
  public enum ServiceResult { ok, wrongEMail, wrongPassword, confirmExpired, alreadyConfirmed }

  public class tableLow : TableEntity {
    public tableLow() {
      PartitionKey = usersPartKey;
    }

    public void insert() {
      authController.table.Execute(TableOperation.InsertOrReplace(this));
    }
    public static T Retrieve<T>(string rowKey) where T : tableLow {
      var res = authController.table.Execute(TableOperation.Retrieve<T>(usersPartKey, rowKey));
      return (T)res.Result;
    }
    public const string usersPartKey = "users";
  }

  public class tableUserLow : tableLow {
    public tableUserLow() : base() { }
    public string psw;
    public string firstName;
    public string lastName;
  }

  public class tableUser : tableUserLow {
    public tableUser(string email) : base() {
      RowKey = email.ToLower();
    }
    public string email { get { return RowKey; } }
  }

  public class tableOAuthUser : tableUserLow {
    public tableOAuthUser(string email, servConfig.oAuthProviders provider, string providerId) : base() {
      RowKey = string.Format("{0} {1} {2}", email.ToLower(), provider, providerId);
    }
  }

  public class tableConfirmReg : tableUserLow {
    public tableConfirmReg(string confirmId) : base() {
      RowKey = confirmId;
    }
    public string email;
    public DateTime created;
    public string confirmId { get { return RowKey; } }
  }

  public class tableConfirmForgotPsw : tableLow {
    public tableConfirmForgotPsw(string confirmId) : base() {
      RowKey = confirmId;
    }
    public string confirmId { get { return RowKey; } }
    public string email;
    public DateTime created;
  }
}