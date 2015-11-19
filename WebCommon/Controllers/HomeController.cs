using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNet.Mvc;

// For more information on enabling MVC for empty projects, visit http://go.microsoft.com/fwlink/?LinkID=397860

namespace Controllers {

  public class HomeViewPars {
  }

  public class HomeController : Controller {
    //napr. test/common-cs_cz-skrivanek-mdl nebo schools/index
    [Route(""), Route("{appId}/{appSubId}-{p1}-{p2}-{p3}-{p4}"), Route("{appId}/{appSubId}-{p1}-{p2}-{p3}"), Route("{appId}/{appSubId}-{p1}-{p2}"), Route("{appId}/{appSubId}-{p1}"), Route("{appId}/{appSubId}")]
    public IActionResult Index(string appId, string appSubId, string p1, string p2, string p3, string p4) {
      //aplikace x skin x brend x jazyk x "debug" x other
      return View(); // DesignNew. name.ToLower());
    }
  }
}
