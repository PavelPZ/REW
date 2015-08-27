namespace blendedData {
  using System;
  using System.Collections.Generic;
  using System.ComponentModel.DataAnnotations;
  using System.ComponentModel.DataAnnotations.Schema;
  using System.Data.Entity.Spatial;

  public partial class CourseUser {
    [System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Usage", "CA2214:DoNotCallOverridableMethodsInConstructors")]
    public CourseUser() {
      CourseDatas = new HashSet<CourseData>();
    }

    [Key]
    [Required]
    [StringLength(10)]
    public string LicenceKey { get; set; }

    public int CompanyId { get; set; }

    public virtual Company Company { get; set; }

    [System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Usage", "CA2227:CollectionPropertiesShouldBeReadOnly")]
    public virtual ICollection<CourseData> CourseDatas { get; set; }
  }
}
