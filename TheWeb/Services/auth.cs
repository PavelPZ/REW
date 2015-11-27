using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;

namespace TheWeb.Services {

  public class authController : ApiController {

    [ActionName("login"), HttpGet]
    public LoginResult Login(string email, string pswHash) {
      
      return null;
    }
    public enum LoginResultError { no, }
    public class LoginResult {
      public string email;
      public string firstName;
      public string lastName;
      public string errorMsg;
    }
  }

}