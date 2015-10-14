using System;
using System.Collections.Generic;
using System.Data.SqlTypes;

namespace NewData {
  public partial class CompanyLicences {
    public CompanyLicences() {
      this.UserLicences = new List<UserLicences>();
      Created = SqlDateTime.MinValue.Value;
    }

    public int Id { get; set; }
    public int LastCounter { get; set; }
    public short Days { get; set; }
    public int CompanyId { get; set; }
    //public int ProductId { get; set; }
    public string ProductId { get; set; }
    public DateTime Created { get; set; }
    public virtual Companies Company { get; set; }
    public virtual ICollection<UserLicences> UserLicences { get; set; }
  }
}
