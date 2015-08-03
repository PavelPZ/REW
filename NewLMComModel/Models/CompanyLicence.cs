using System;
using System.Collections.Generic;
using System.Data.SqlTypes;

namespace NewData {
  public partial class CompanyLicence {
    public CompanyLicence() {
      this.UserLicences = new List<UserLicence>();
      Created = SqlDateTime.MinValue.Value;
    }

    public int Id { get; set; }
    public int LastCounter { get; set; }
    public short Days { get; set; }
    public int CompanyId { get; set; }
    //public int ProductId { get; set; }
    public string ProductId { get; set; }
    public DateTime Created { get; set; }
    public virtual Company Company { get; set; }
    public virtual ICollection<UserLicence> UserLicences { get; set; }
  }
}
