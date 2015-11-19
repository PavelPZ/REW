using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNet.Mvc;
using DesignNew;
using LMComLib;
using LMNetLib;

// For more information on enabling MVC for empty projects, visit http://go.microsoft.com/fwlink/?LinkID=397860

namespace Controllers {

  public class HomeController : Controller {
    //napr. common/lib-cs_cz-skrivanek-mdl nebo schools/index
    [Route("{ap}/{p0}-{p1}-{p2}-{p3}-{p4}"), Route("{ap}/{p0}-{p1}-{p2}-{p3}"), Route("{ap}/{p0}-{p1}-{p2}"), 
      Route("{ap}/{p0}-{p1}"), Route("{ap}/{p0}")]
    public IActionResult Index(string ap, string p0, string p1, string p2, string p3, string p4, string ext) {
      WebCode.HomeViewPars homePar = new WebCode.HomeViewPars();
      foreach (var p in new string[] { ap, p0, p1, p2, p3, p4 }.Where(p => !string.IsNullOrEmpty(p)).Select(p => p.ToLower())) {
        if (Consts.allApps.Contains(p)) homePar.app = LowUtils.EnumParse<Consts.Apps>(p);
        else if (Consts.allBrands.Contains(p)) homePar.brand = LowUtils.EnumParse<Consts.Brands>(p);
        else if (Consts.allSkins.Contains(p)) homePar.skin = LowUtils.EnumParse<Consts.SkinIds>(p);
        else if (Consts.allSwLangs.Contains(p)) homePar.lang = LowUtils.EnumParse<Langs>(p);
        else if (p == "debug") homePar.debug = true;
        else homePar.other = p;
      }
      switch (homePar.app) {
        case Consts.Apps.web4: return View("IndexWeb4", new WebCode.HomeModelWeb4(homePar));
        default: return View(new WebCode.HomeModel(homePar));
      }
    }
  }
}
