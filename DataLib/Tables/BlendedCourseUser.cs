namespace NewData {
  using System;
  using System.Collections.Generic;
  using System.ComponentModel.DataAnnotations;
  using System.ComponentModel.DataAnnotations.Schema;
  using System.Data.Entity.Spatial;

  public partial class BlendedCourseUser {
    [System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Usage", "CA2214:DoNotCallOverridableMethodsInConstructors")]
    public BlendedCourseUser() {
      CourseDatas = new HashSet<BlendedCourseData>();
    }

    [Key]
    public int Id { get; set; }

    [Required]
    [Index]
    [StringLength(120)]
    public string ProductUrl{ get; set; } //ProductUrl a LMComId je pro company v DB unikatni 

    [Required]
    [Index]
    public Int64 LMComId { get; set; }

    public int CompanyId { get; set; }

    public virtual BlendedCompany Company { get; set; }

    [System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Usage", "CA2227:CollectionPropertiesShouldBeReadOnly")]
    public virtual ICollection<BlendedCourseData> CourseDatas { get; set; }
  }
}
