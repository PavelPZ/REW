namespace blendedData {
  using System;
  using System.Collections.Generic;
  using System.ComponentModel.DataAnnotations;
  using System.ComponentModel.DataAnnotations.Schema;
  using System.Data.Entity.Spatial;

  public partial class StudyGrup {
    [System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Usage", "CA2214:DoNotCallOverridableMethodsInConstructors")]
    public StudyGrup() {
      CourseUsers = new HashSet<CourseUser>();
    }

    [Key]
    public int Id { get; set; }

    public int CompanyId { get; set; }

    public int AdminId { get; set; } //NewData.CompanyUserId administratora skupiny

    [Required]
    public string Title { get; set; } //Nazev skupiny

    [Required]
    public short LineId { get; set; } //English, German nebo French

    [Required]
    public bool IsPattern4 { get; set; } //sablona 4 (jinak 2)

    public virtual Company Company { get; set; }

    [System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Usage", "CA2227:CollectionPropertiesShouldBeReadOnly")]
    public virtual ICollection<CourseUser> CourseUsers { get; set; }
  }
}
