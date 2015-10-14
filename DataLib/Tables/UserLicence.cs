using System;
using System.Collections.Generic;
using System.Data.SqlTypes;

namespace NewData {
  public partial class UserLicence {
    public UserLicence() {
      Created = Started = SqlDateTime.MinValue.Value;
    }
    public int LicenceId { get; set; }
    public int Counter { get; set; }
    public int UserId { get; set; }
    public DateTime Created { get; set; }
    public System.DateTime Started { get; set; }
    public virtual CompanyLicence CompanyLicence { get; set; }
    public virtual CourseUser CourseUser { get; set; }
  }
}
