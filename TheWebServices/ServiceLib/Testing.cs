using Microsoft.WindowsAzure.Storage.Table;
using System;
using System.IO;
using System.Web.Http;

namespace TestingServices {
  public class testingController : ApiController {

    [ActionName("ResetServerData"), HttpGet]
    public void ResetServerData(string email) {
      LoginServices.authController.resetUser(email);
    }

    [ActionName("SaveTestPlaylist"), HttpPost]
    public void SaveTestPlaylist([FromBody]string json) {
      File.WriteAllText(@"D:\LMCom\rew\TheWeb\wwwroot\TestPlaylists\noname.json", json);
    }
  }
}
