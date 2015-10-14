using System;
using System.Collections.Generic;
using System.Data.SqlTypes;

namespace NewData {
  public partial class CompanyUser {
    public CompanyUser() {
      this.CourseUsers = new List<CourseUser>();
      Created = SqlDateTime.MinValue.Value;
    }

    public int Id { get; set; }
    public System.DateTime Created { get; set; }
    public int CompanyId { get; set; }
    public long UserId { get; set; }
    public Nullable<int> DepartmentId { get; set; }
    public long Roles { get; set; }
    public string RolePar { get; set; }
    public virtual Company Company { get; set; }
    public virtual CompanyDepartment CompanyDepartment { get; set; }
    public virtual ICollection<CourseUser> CourseUsers { get; set; }
    public virtual User User { get; set; }
  }

  public partial class CompanyUser {
    [System.ComponentModel.DataAnnotations.Schema.NotMapped]
    public long RolesEx {
      get { 
        return RolePar == null ? Roles : (long)LMComLib.CompUserRole.FromString(RolePar).Role; }
      set {
        var r = LMComLib.CompUserRole.FromString(RolePar); r.Role = (LMComLib.CompRole)value; RolePar = r.ToString();
        Roles = value;
      }
    }
    [System.ComponentModel.DataAnnotations.Schema.NotMapped]
    public LMComLib.CompUserRole RoleParEx {
      get {
        if (RolePar == null && Roles != 0) return new LMComLib.CompUserRole { Role = (LMComLib.CompRole)Roles };
        else return LMComLib.CompUserRole.FromString(RolePar);
      }
      set { RolePar = value.ToString(); Roles = (long)value.Role; }
    }
  }
}
