using System;
using System.Collections.Generic;
using System.Data.Entity.Core.Objects;
using System.Linq;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;

namespace web4.Schools.Design {
  public partial class QueryBuilder : System.Web.UI.Page {
    protected void Page_Load(object sender, EventArgs e) {
      var db = NewData.Lib.CreateContext();
      db.Database.Log = s => {
        if (s.IndexOf("SELECT") < 0 ) return;
        if (s == null) return;
      };
      //var q = db.CompanyUsers.Where(cu => cu.CompanyId == 999 && cu.DepartmentId!=null).Select(cu => cu.User);
      //var q = db.CompanyUsers.Where(cu => cu.CompanyId == 999 && cu.DepartmentId != null);
      //var q = db.CompanyUsers.Where(cu => cu.CompanyId == 999 && cu.DepartmentId != null).SelectMany(cu => cu.CourseUsers);
      //var q = db.CompanyUsers.Where(cu => cu.CompanyId == 999 && cu.DepartmentId != null).SelectMany(cu => cu.CourseUsers).SelectMany(cu => cu.CourseDatas.Where(cd => cd.ShortData != null)).Select(cd => new { cd.compId, cd.CourseUserId, cd.ShortData, cd.Key });
      //var q = db.CompanyUsers .CourseUsers ;

      //var q = db.CourseUsers.Where(cu => cu.CourseDatas.Where(cd => cd.Key == "XXX").Any()).Select(cu => new { cu.compId, compId = cu.CompanyUser.CompanyId });

      //var q = db.CompanyUsers.Where(cu => cu.CourseUsers.SelectMany(cru => cru.CourseDatas).Where(cd => cd.Key == "XXX").Any()).Select(cu => cu.CompanyId);

      //var q = db.CourseUsers.Where(cu => cu.compId == db.CourseDatas.Where(cd => cd.Key=="XXX).Select.First(cd => cd.Key == "xxxx").CourseUserId).Select(cu => new { cu.CompanyUser.CompanyId, });  

      //var q = db.LANGMasterScorms.SelectMany(l => db.CourseUsers.Where(cu => cu.CourseDatas.Any(cd => cd.Key == l.AttemptIdStr)).Select(cu => new { compId = l.AttemptId.ToString() + "_", cu.Created }));

      var q = db.CompanyUsers;

      if (q.ToArray() == null) return;
    }
  }
}