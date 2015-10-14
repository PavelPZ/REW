using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Data.SqlTypes;

namespace NewData {
  public partial class CourseUsers {
    public CourseUsers() {
      this.CourseDatas = new List<CourseDatas>();
      this.UserLicences = new List<UserLicences>();
      Created = HumanAssigned = SqlDateTime.MinValue.Value;
    }

    public int Id { get; set; }
    public int UserId { get; set; }
    public System.DateTime Created { get; set; }

    //prirazeno hodnotiteli (kdy a kteremu)
    public System.DateTime HumanAssigned { get; set; }
    public int HumanCompanyUserId { get; set; }

    //public int ProductId { get; set; }
    [Index]
    public string ProductId { get; set; }
    public virtual CompanyUsers CompanyUser { get; set; }
    public virtual ICollection<CourseDatas> CourseDatas { get; set; }
    public virtual ICollection<UserLicences> UserLicences { get; set; }
    //public byte[] RowVersion { get; set; }
  }
}
