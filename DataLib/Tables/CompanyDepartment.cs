using System;
using System.Collections.Generic;
using System.Xml.Serialization;

namespace NewData {
  public class CompanyDepartment {
    public int Id { get; set; }
    public string Title { get; set; }
    public int CompanyId { get; set; }
    public int? ParentId { get; set; }
    [XmlIgnore]
    public virtual Company Company { get; set; }
    [XmlIgnore]
    public virtual CompanyDepartment Parent { get; set; }
    [XmlIgnore]
    public virtual ICollection<CompanyDepartment> Items { get; set; }
    [XmlIgnore]
    public virtual ICollection<CompanyUser> CompanyUsers { get; set; }
  }
}
