using Microsoft.WindowsAzure.Storage.Table;
using System;
using System.Web.Http;

namespace TestingServices {
  public class testingController : ApiController {
    [ActionName("ResetAll"), HttpGet]
    public void ResetAll(string email) {
      LoginServices.authController.resetUser(email);
    }
  }
}
