namespace blendedData {
  using System;
  using System.Collections.Generic;
  using System.ComponentModel.DataAnnotations;
  using System.ComponentModel.DataAnnotations.Schema;
  using System.Data.Entity.Spatial;

  public partial class Company {
    [System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Usage", "CA2214:DoNotCallOverridableMethodsInConstructors")]
    public Company() {
      StudyGroups = new HashSet<StudyGrup>();
    }


    [Key]
    public int Id { get; set; }

    public int AdminId { get; set; } //NewData.CompanyUserId administratora firmy

    public string Data { get; set; }

    [System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Usage", "CA2227:CollectionPropertiesShouldBeReadOnly")]
    public virtual ICollection<StudyGrup> StudyGroups { get; set; }
  }
}
