/*
http://localhost/czdata/Holiday-english/home.htm
http://localhost/lmcom/cz/web/cs-cz/pages/
 */
using System;
using System.Data;
using System.Configuration;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Security;
using System.Web.UI;
using System.Web.UI.HtmlControls;
using System.Web.UI.WebControls;
using System.Web.UI.WebControls.WebParts;
using System.Xml.Linq;

using LMComLib;

namespace Surv {

  public enum CourseMode {
    test, //testovaci mod, neni pravo pouzit kurz
    beforeStart, //Kurz jeste nezacal
    afterEnd, //Kurz uz skoncil
    running //Kurz prave bezi
  }

  public class Status {

    //Informace z databaze od uzivatele
    public DateTime firstWeek; //datum pondelku prvniho tydne kurzu
    public CourseMode mode; //testovaci rezim (neautentifikovany uzivatel nebo bez licence)
    //odvozene props
    public int actWeek; //index aktualniho tydne dle aktualniho data
    public List<SiteMapNode> WeekHomes = new List<SiteMapNode>();
    public bool isBefore; //Aktualni datum je pred zacatkem kurzu
    public bool isAfter; //Aktualni datum je pred zacatkem kurzu

    public static Status ActStatus(bool isAuthenticated, string rootUrl) {
      urlInfo ui = urlInfo.GetUrlInfo();
      string key = string.Format("survstatus_{0}", ui.EACourse);
      Status res = (Status)HttpContext.Current.Session[key];
      //if (dbInfo != null) return dbInfo;
      res = new Status();
      HttpContext.Current.Session[key] = res;
      //Home stranek vsech tydnu
      SiteMapNode nd = SiteMap.Provider.FindSiteMapNode(rootUrl);
      foreach (SiteMapNode subNd in nd.ChildNodes)
        if (subNd["specialNode"] != "support") res.WeekHomes.Add(subNd);
      //Pro autorizovaneho uzivatele: informace o zacatku zakoupeneho kurzu z eCommerce
      int? firstWeekIdx = null;
      if (isAuthenticated)
        firstWeekIdx = 0; //TODO RegLicenceServer.getFixedDateLicence(ui.SiteId, ui.EACourse, LMStatus.email);
      //Odvozene properties
      if (firstWeekIdx == null) res.mode = CourseMode.test;
      else {
        DateTime utcNow = DateTime.Today.ToUniversalTime();
        res.firstWeek = ProductLicence.FixDateStart((int)firstWeekIdx);
        DateTime utcFirstWeek = res.firstWeek.ToUniversalTime();
        res.actWeek = -1;
        if (utcNow < utcFirstWeek)
          res.mode = CourseMode.beforeStart;
        else if (utcNow > utcFirstWeek.AddDays(res.WeekHomes.Count * 7))
          res.mode = CourseMode.afterEnd;
        else {
          res.mode = CourseMode.running;
          res.actWeek = (utcNow - utcFirstWeek).Days / 7; 
        }
      }
      return res;
    }

    public string IntervalText(int idx) {
      if (mode == CourseMode.test) return null;
      return "(od " + firstWeek.AddDays(idx * 7).ToString("dd.MM") + " do " + firstWeek.AddDays((idx + 1) * 7 - 1).ToString("dd.MM") + ")";
    }
  }

  public class Control : System.Web.UI.UserControl {
    public Status Status {
      get {
        return ((Surv.Page)this.Page).Status;
      }
    }
  }

  public class Page: System.Web.UI.Page {
    Status status;
    public Status Status {
      get {
        if (status == null)
          status = Surv.Status.ActStatus(User.Identity.IsAuthenticated, HomeUrl);
        return status;
      }
    }
    string homeUrl;
    public string HomeUrl {
      get { return homeUrl; }
      set { homeUrl = value; }
    }

  }

}
