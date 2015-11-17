using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNet.Mvc;

// For more information on enabling MVC for empty projects, visit http://go.microsoft.com/fwlink/?LinkID=397860

namespace Controllers {

  public class HomeView {
    public string title;
    public string csss() { return null; }
    public string jss() { return null; }
  }

  public class HomeController : Controller {
    // GET: /<controller>/
    [Route(""), Route("{p1}/{p2}/{p3}/{p4}"), Route("{p1}/{p2}/{p3}"), Route("{p1}/{p2}"), Route("{p1}")]
    public IActionResult Index(string p1, string p2, string p3, string p4) {
      return View(); // DesignNew. name.ToLower());
    }
  }
}
