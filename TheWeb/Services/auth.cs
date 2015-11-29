using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;

namespace LoginServices {

  public class authController : ApiController {

    [ActionName("login"), HttpGet]
    public LoginResult Login(string email, string pswhash) {
      return null;
    }
    public class LoginResult {
      public string email;
      public string firstName;
      public string lastName;
      public LoginResultError errorMsg;
      public LMComLib.Langs lang;
    }

    [ActionName("register"), HttpGet]
    public void Register(string email, string pswhash, string firstName, string lastName) {
    }
  }
  public enum LoginResultError { no, wrongEMail, wrongPassword }
}