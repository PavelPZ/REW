using LMNetLib;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;

namespace emailer {

  public class emailController : ApiController {

    [ActionName("Send"), HttpPost]
    public void Send([FromBody]emailMsg msg) {
    }

  }

  public class emailMsg {
    public mail from;
    public mail[] to;
    public string title;
    public string body;
    public string plainBody;
    [Nullable]
    public att[] attachments;
  }
  public class mail {
    public string email;
    public string title;
  }
  public class att {
    public string fileName;
    public string body;
  }
}