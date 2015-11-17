using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNet.Mvc;

// For more information on enabling MVC for empty projects, visit http://go.microsoft.com/fwlink/?LinkID=397860

namespace WebApplication5.Controllers {

  public class View1 {
    public string name;
  }

  public class HomeController : Controller {
    // GET: /<controller>/
    //[Route("about")]
    public IActionResult Index2() {
      return View();
    }
    // GET: /<controller>/
    [Route(""), Route("home"), Route("home-{name}")]
    public IActionResult Index1(string name) {
      if (name == null) name = "";
      switch (name.ToLower()) {
        case "": return Redirect("/common/flux/index.html");
      }
      return View(new View1 { name = name ?? "View1.name" });
    }
  }
}
