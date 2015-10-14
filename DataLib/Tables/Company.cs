using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Data.SqlTypes;

namespace NewData {
  public partial class Companies {
    public Companies() {
      this.CompanyDepartments = new List<CompanyDepartments>();
      this.CompanyUsers = new List<CompanyUsers>();
      this.CompanyLicences = new List<CompanyLicences>();
      Created = SqlDateTime.MinValue.Value;
    }

    public int Id { get; set; }
    public string Title { get; set; }
    [Index] //kvuli blended demo> host ve tvaru blend.<title.hash> je klicem pro company
    public string ScormHost { get; set; } //identifikace company pro scorm (domena jejich scormu )
    public DateTime Created { get; set; }
    public string IntervalsConfig { get; set; } //JSON serializace Admin.IntervalsConfig
    public string HumanEvalPaymentConfig { get; set; } //JSON serializace Login.HumanPaymentsCfg
    public virtual ICollection<CompanyDepartments> CompanyDepartments { get; set; }
    public virtual ICollection<CompanyUsers> CompanyUsers { get; set; }
    public virtual ICollection<CompanyLicences> CompanyLicences { get; set; }

    //Jsem fake company od PublisherOwners uzivatele
    public virtual ICollection<Users> PublisherOwners { get; set; } //kolekce muze obsahovat 0 nebo 1 prvku, vic ne. EF neumi 0..1 to 1 relationship
  }
}
