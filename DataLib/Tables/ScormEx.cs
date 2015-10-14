using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;

namespace NewData {
  public partial class LANGMasterScorm {
    public int Id { get; set; }
    [Index]
    public string UserId { get; set; }
    public int ApiUrlCrc { get; set; }
    [Index]
    public long AttemptId { get; set; }
    [Index]
    public string AttemptIdStr { get; set; }
    [Index]
    public Guid? AttemptIdGuid { get; set; }
    [Index]
    public string Key1Str { get; set; }
    [Index]
    public string Key2Str { get; set; }
    [Index]
    public long Key1Int { get; set; }
    [Index]
    public long Key2Int { get; set; }
    public string Data1 { get; set; }
    public string Data2 { get; set; }
    //[Index]
    public long Date { get; set; }
    public byte[] RowVersion { get; set; }
  }
}
