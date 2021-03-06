//------------------------------------------------------------------------------
// <auto-generated>
//     This code was generated from a template.
//
//     Manual changes to this file may cause unexpected behavior in your application.
//     Manual changes to this file will be overwritten if the code is regenerated.
// </auto-generated>
//------------------------------------------------------------------------------

namespace NewData.Design
{
    using System;
    using System.Collections.Generic;
    
    public partial class CompanyUser
    {
        public CompanyUser()
        {
            this.CourseUsers = new HashSet<CourseUser>();
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
        public virtual User User { get; set; }
        public virtual ICollection<CourseUser> CourseUsers { get; set; }
    }
}
