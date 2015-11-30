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

    [ActionName("Login"), HttpGet]
    public LoginResult Login(string email, string psw) {
      return null;
    }
    public class LoginResult {
      public string email;
      public string firstName;
      public string lastName;
      public ServiceResult result;
    }

    [ActionName("Register"), HttpGet]
    public void Register(string email, string psw, string firstName, string lastName, string confirmId) {
      tableConfirmReg reg = new tableConfirmReg(confirmId) { email = email, psw = psw, firstName = firstName, lastName = lastName };
      reg.insert();
    }

    [ActionName("ConfirmRegistration"), HttpGet]
    public LoginResult ConfirmRegistration(string confirmId) {
      tableConfirmReg reg = tableConfirmReg.Retrieve(confirmId);
      //if (reg.created)
      return null;
    }

    [ActionName("ChangeProfile"), HttpGet]
    public void ChangeProfile(string email, string firstName, string lastName) {
    }

    [ActionName("ChangePassword"), HttpGet]
    public bool ChangePassword(string email, string oldPsw, string newPsw) {
      return true;
    }

    [ActionName("ForgotPassword"), HttpGet]
    public void ForgotPassword(string email) {
    }

    [ActionName("ConfirmForgotPassword"), HttpGet]
    public LoginResult ConfirmForgotPassword(string confirmId, string newPsw) {
      return null;
    }

    [ActionName("oAuthNotify"), HttpGet]
    public void oAuthNotify(string email, string firstName, string lastName) {
    }
  }
  public enum ServiceResult { ok, wrongEMail, wrongPassword, confirmExpired, regAlreadyConfirmed }

  public class tableLow : TableEntity {
    public tableLow(string partKey) {
      PartitionKey = partKey;
    }

    public void insert() {
      table.Execute(TableOperation.InsertOrReplace(this));
    }
    public static T Retrieve<T>(string partKey, string rowKey) where T : tableLow {
      var res = table.Execute(TableOperation.Retrieve<T>(partKey, rowKey));
      return (T)res.Result;
    }
    public static void init() {
      table = AzureLib.Factory.createTable(tableName);
    }
    protected static CloudTable table;
    const string tableName = "auth";
    public const string usersPartKey = "users";
    public const string regConfirmPartKey = "reg-confirm";
    public const string regForgotPswConfirmPartKey = "forgot-psw-confirm";
  }

  public class tableUserLow : tableLow {
    public tableUserLow(string partKey) : base(partKey) { }
    public string psw;
    public string firstName;
    public string lastName;
  }

  public class tableUser : tableUserLow {
    public tableUser(string email) : base(usersPartKey) {
      RowKey = email.ToLower();
    }
    public string email { get { return RowKey; } }
  }

  public class tableConfirmReg : tableUserLow {
    public tableConfirmReg(string confirmId) : base(regConfirmPartKey) {
      RowKey = confirmId;
    }
    public string email;
    public DateTime created;
    public string confirmId { get { return RowKey; } }
    public static tableConfirmReg Retrieve(string confirmId) {
      return Retrieve<tableConfirmReg>(regConfirmPartKey, confirmId);
    }
  }
}