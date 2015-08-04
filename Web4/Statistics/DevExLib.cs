using DevExpress.Web.ASPxClasses;
using DevExpress.Web.ASPxTreeList.Internal;
using LMComLib;
using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Text.RegularExpressions;
using System.Threading;
using System.Web;

namespace Statistics {
  
  public static class StatLib {
    public static MyCompanyLow cookieCompany () {
      //var cook = LMStatus.Cookie;
      //if (cook.Company == null && true /*Request["a1y"] == "b2c"*/) {
      //  cook.Company = new MyCompanyLow { Title = "Fake Company", compId = 1, RoleEx = new CompUserRole { Role = CompRole.All } };
      //  LMStatus.saveCookie(HttpContext.Current);
      //}
      //return (cook.Company.RoleEx.Role & LMComLib.CompRole.Results) == 0 ? null : cook.Company;
      return null;
    }

    public static string getActLangStr() { return Thread.CurrentThread.CurrentUICulture.Name; }

    public static void InitializeCulture(HttpContext ctx = null) {
      ctx = ctx ?? HttpContext.Current;
      var l = LMComLib.urlInfo.langStrToLang(ctx.Request["lang"]);
      var langStr = l.ToString().Replace('_', '-');
      Thread.CurrentThread.CurrentUICulture = Thread.CurrentThread.CurrentCulture = CultureInfo.CreateSpecificCulture(langStr);
    }

  }

  public static class dxLib {

    public static T getTreeListData<T>(object Container) {
      return (T)getTreeListDataLow(Container);
    }

    //najde zdrojovy objekt pro 
    public static object getTreeListDataLow(object Container) {
      var cont = (TemplateContainerBase)Container;
      var dataItem = (TreeListTemplateDataItem)cont.DataItem;
      var row = (TreeListRowInfo)dataItem.Row;
      var data = (TreeListBoundNodeDataItem)row.DataItem;
      return data.GetDataObject();
    }

  }
}