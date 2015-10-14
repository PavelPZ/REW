using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Data.SqlTypes;

namespace NewData {
  public partial class CourseUser {
    public CourseUser() {
      this.CourseDatas = new List<CourseData>();
      this.UserLicences = new List<UserLicence>();
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
    public virtual CompanyUser CompanyUser { get; set; }
    public virtual ICollection<CourseData> CourseDatas { get; set; }
    public virtual ICollection<UserLicence> UserLicences { get; set; }
    //public byte[] RowVersion { get; set; }
  }
}
