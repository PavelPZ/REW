﻿//------------------------------------------------------------------------------
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
    using System.Data.Entity;
    using System.Data.Entity.Infrastructure;
    
    public partial class DesignEntities : DbContext
    {
        public DesignEntities()
            : base("name=DesignEntities")
        {
        }
    
        protected override void OnModelCreating(DbModelBuilder modelBuilder)
        {
            throw new UnintentionalCodeFirstException();
        }
    
        public virtual DbSet<Company> Companies { get; set; }
        public virtual DbSet<CompanyDepartment> CompanyDepartments { get; set; }
        public virtual DbSet<CompanyLicence> CompanyLicences { get; set; }
        public virtual DbSet<CompanyUser> CompanyUsers { get; set; }
        public virtual DbSet<CourseData> CourseDatas { get; set; }
        public virtual DbSet<CourseUser> CourseUsers { get; set; }
        public virtual DbSet<LANGMasterScorm> LANGMasterScorms { get; set; }
        public virtual DbSet<UserLicence> UserLicences { get; set; }
        public virtual DbSet<User> Users { get; set; }
    }
}