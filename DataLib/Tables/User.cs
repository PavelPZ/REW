using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Data.SqlTypes;

namespace NewData {
  public partial class Users {
    public Users() {
      this.CompanyUsers = new List<CompanyUsers>();
      Created = SqlDateTime.MinValue.Value;
    }

    public long Id { get; set; }
    [Index]
    public string EMail { get; set; }
    public string Password { get; set; }
    public System.DateTime Created { get; set; }
    public short VerifyStatus { get; set; }
    public short OtherType { get; set; }
    [Index]
    public string OtherId { get; set; }
    public string FirstName { get; set; }
    public string LastName { get; set; }
    public string Login { get; set; }
    public string LoginEMail { get; set; }
    public long Roles { get; set; }
    public string OtherData { get; set; }
    public virtual ICollection<CompanyUsers> CompanyUsers { get; set; }

    //Publisher
    public Nullable<int> MyPublisherId { get; set; } //moje fake company compId pro pripad ze jsem individualni publisher
    public virtual Companies MyPublisher { get; set; } //fake company pro pripad, ze jsem individualni publisher.
  }
}
