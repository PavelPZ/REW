namespace blendedData {
  using System;
  using System.Collections.Generic;
  using System.ComponentModel.DataAnnotations;
  using System.ComponentModel.DataAnnotations.Schema;
  using System.Data.Entity.Spatial;

  public partial class CourseData {

    [Key]
    public int Id { get; set; }

    [Required]
    [StringLength(240)]
    [Index]
    public string TaskId { get; set; }

    [Required]
    [StringLength(240)]
    [Index]
    public string Key { get; set; }

    [Required]
    public string Data { get; set; }

    public string ShortData { get; set; }

    public int CourseUserId { get; set; }

    public long Date { get; set; }

    public long Flags { get; set; }

    public virtual CourseUser CourseUser { get; set; }
  }
}
