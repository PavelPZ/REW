using LMComLib;
using LMNetLib;
using Login;
using System.Text;
using Newtonsoft.Json;
using System.Web.Http;
using System;
using System.Linq;

namespace azure {

  [RoutePrefix("testme")]
  public class testMeController : ApiController {

    //testy k vyhodnoceni: jake jazyky je treba vyhodnocovat?
    [Route("toEvalLangs"), HttpPost]
    public toEvalLangsResultItem[] toEvalLangs(string compId) { 
      return null;
    }
    public class toEvalLangsResultItem { //drive HumanEvalManagerLangItem
      public LineIds line;
      public int count;
    }


  }
}

namespace AzureData {
 
  //company informace
  public class companyTasks {
    public testmeEvalTask[] tasks;
  }
  public class testmeEvalTask {
    public string userEMail;
    public string evaluatorEMail;
    public LineIds Line;
    public string ProductId;
    public int LicKeyId;
  }
  
  //user product informace
  public class testExEvalTask {
    public string ProductId;
    public int LicKeyId; //varianta produktu - testu
    public string dataKey; //url cviceni
  }
}


