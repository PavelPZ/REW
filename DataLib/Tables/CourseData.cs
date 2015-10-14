using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;

namespace NewData {
  public partial class CourseData {
    public long Id { get; set; }
    [Index]
    public string Key { get; set; } //napr. @meta nebo english1_xl01_sa_shome_dhtm
    public string Data { get; set; }
    public string ShortData { get; set; }
    public int CourseUserId { get; set; } 

    public virtual CourseUser CourseUser { get; set; }
    public long Date { get; set; }
    [Index]
    public long Flags { get; set; } //jedna z CourseDataFlag hodnot
    public byte[] RowVersion { get; set; }
  }

 
}
