//------------------------------------------------------------------------------
// <auto-generated>
//     This code was generated from a template.
//
//     Manual changes to this file may cause unexpected behavior in your application.
//     Manual changes to this file will be overwritten if the code is regenerated.
// </auto-generated>
//------------------------------------------------------------------------------

namespace NewData.Design
{
    using System;
    using System.Collections.Generic;
    
    public partial class Company
    {
        public Company()
        {
            this.CompanyDepartments = new HashSet<CompanyDepartment>();
            this.CompanyLicences = new HashSet<CompanyLicence>();
            this.CompanyUsers = new HashSet<CompanyUser>();
            this.Users = new HashSet<User>();
        }
    
        public int Id { get; set; }
        public string Title { get; set; }
        public string ScormHost { get; set; }
        public System.DateTime Created { get; set; }
        public string IntervalsConfig { get; set; }
        public string HumanEvalPaymentConfig { get; set; }
    
        public virtual ICollection<CompanyDepartment> CompanyDepartments { get; set; }
        public virtual ICollection<CompanyLicence> CompanyLicences { get; set; }
        public virtual ICollection<CompanyUser> CompanyUsers { get; set; }
        public virtual ICollection<User> Users { get; set; }
    }
}
