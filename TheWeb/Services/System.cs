using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;

namespace TheWeb.Services {

  public class SystemController : ApiController {
    [HttpGet] // api/system/resetcache
    public void ResetCache() { Cache.init(); }
  }
}