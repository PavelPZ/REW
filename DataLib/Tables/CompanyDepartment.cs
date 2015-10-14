using System;
using System.Collections.Generic;
using System.Xml.Serialization;

namespace NewData {
  public class CompanyDepartments {
    public int Id { get; set; }
    public string Title { get; set; }
    public int CompanyId { get; set; }
    public int? ParentId { get; set; }
    [XmlIgnore]
    public virtual Companies Company { get; set; }
    [XmlIgnore]
    public virtual CompanyDepartments Parent { get; set; }
    [XmlIgnore]
    public virtual ICollection<CompanyDepartments> Items { get; set; }
    [XmlIgnore]
    public virtual ICollection<CompanyUsers> CompanyUsers { get; set; }
  }
}
