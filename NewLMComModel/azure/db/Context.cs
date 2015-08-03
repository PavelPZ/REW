using System.Data.Entity;
using System.Data.Entity.Infrastructure;
using AzureData.Mapping;
using System.Data.Entity.ModelConfiguration.Conventions;
using System;
using System.Collections.Generic;

//http://msdn.microsoft.com/en-us/data/ee712907#codefirst
//http://weblogs.asp.net/manavi/entity-association-mapping-with-code-first-one-to-one-shared-primary-key-associations
namespace AzureData {
  public partial class Container : DbContext {
    public static Dictionary<Type, Func<Container, Object>> tables = new Dictionary<Type, Func<Container, object>>() {
      {typeof(Sys_Admin), db => db.Sys_Admins},
      {typeof(Sys_CompShortId), db => db.Sys_CompShortIds},
      {typeof(User_Data), db => db.User_Datas},
      {typeof(User_Company), db => db.User_Companies},
      {typeof(Company_User), db => db.Company_Users},
      {typeof(Company_Meta), db => db.Company_Metas},
      {typeof(Company_Licence), db => db.Company_Licences},
      {typeof(Company_Department), db => db.Company_Departments},
      {typeof(Company_DepartmentUsage), db => db.Company_DepartmentUsages},
      {typeof(CourseLong), db => db.CourseLong},
      {typeof(HumanEval), db => db.HumanEval},
    };
    public void testDelAll() {
      Sys_Admins.RemoveRange(Sys_Admins);
      Sys_CompShortIds.RemoveRange(Sys_CompShortIds);
      User_Datas.RemoveRange(User_Datas);
      User_Companies.RemoveRange(User_Companies);
      Company_Users.RemoveRange(Company_Users);
      Company_Metas.RemoveRange(Company_Metas);
      Company_Licences.RemoveRange(Company_Licences);
      Company_Departments.RemoveRange(Company_Departments);
      Company_DepartmentUsages.RemoveRange(Company_DepartmentUsages);
      CourseLong.RemoveRange(CourseLong);
      HumanEval.RemoveRange(HumanEval);
      SaveChanges();
    }

    public DbSet<Sys_Admin> Sys_Admins { get; set; }
    public DbSet<Sys_CompShortId> Sys_CompShortIds { get; set; }

    public DbSet<User_Data> User_Datas { get; set; }
    public DbSet<User_Company> User_Companies { get; set; }

    public DbSet<Company_User> Company_Users { get; set; }
    public DbSet<Company_Meta> Company_Metas { get; set; }
    public DbSet<Company_Licence> Company_Licences { get; set; }
    public DbSet<Company_Department> Company_Departments { get; set; }
    public DbSet<Company_DepartmentUsage> Company_DepartmentUsages { get; set; }
    public DbSet<CourseLong> CourseLong { get; set; }
    public DbSet<HumanEval> HumanEval { get; set; }

    protected override void OnModelCreating(DbModelBuilder modelBuilder) {
      modelBuilder.Configurations.Add(new Sys_AdminMap());
      modelBuilder.Configurations.Add(new Sys_CompShortIdMap());

      modelBuilder.Configurations.Add(new User_DataMap());
      modelBuilder.Configurations.Add(new User_CompanyMap());

      modelBuilder.Configurations.Add(new Company_UserMap());
      modelBuilder.Configurations.Add(new Company_MetaMap());
      modelBuilder.Configurations.Add(new Company_LicenceMap());
      modelBuilder.Configurations.Add(new Company_DepartmentMap());
      modelBuilder.Configurations.Add(new Company_DepartmentUsageMap());
      modelBuilder.Configurations.Add(new CourseLongMap());
      modelBuilder.Configurations.Add(new HumanEvalMap());
    }
  }
}

namespace AzureData.Mapping {
  using System.Data.Entity.ModelConfiguration;
  using System.Data.Entity.Infrastructure.Annotations;
  using System.ComponentModel.DataAnnotations.Schema;

  public class Company_UserMap : EntityTypeConfiguration<Company_User> {
    public Company_UserMap() {
      azure.azureEntity.defineMap(this, "Company_Users");
    }
  }
  public class Company_MetaMap : EntityTypeConfiguration<Company_Meta> {
    public Company_MetaMap() {
      azure.azureEntity.defineMap(this, "Company_Metas");
    }
  }
  public class Company_LicenceMap : EntityTypeConfiguration<Company_Licence> {
    public Company_LicenceMap() {
      azure.azureEntity.defineMap(this, "Company_Licences");
    }
  }
  public class Company_DepartmentMap : EntityTypeConfiguration<Company_Department> {
    public Company_DepartmentMap() {
      azure.azureEntity.defineMap(this, "Company_Departments");
    }
  }
  public class Company_DepartmentUsageMap : EntityTypeConfiguration<Company_DepartmentUsage> {
    public Company_DepartmentUsageMap() {
      azure.azureEntity.defineMap(this, "Company_DepartmentUsage");
    }
  }

  public class User_DataMap : EntityTypeConfiguration<User_Data> {
    public User_DataMap() {
      azure.azureEntity.defineMap(this, "User_Datas");
    }
  }

  public class User_CompanyMap : EntityTypeConfiguration<User_Company> {
    public User_CompanyMap() {
      azure.azureEntity.defineMap(this, "User_Companies");
    }
  }

  public class Sys_AdminMap : EntityTypeConfiguration<Sys_Admin> {
    public Sys_AdminMap() {
      azure.azureEntity.defineMap(this, "Sys_Admins");
    }
  }
  public class Sys_CompShortIdMap : EntityTypeConfiguration<Sys_CompShortId> {
    public Sys_CompShortIdMap() {
      azure.azureEntity.defineMap(this, "Sys_CompShortIds");
    }
  }

  public class CourseLongMap : EntityTypeConfiguration<CourseLong> {
    public CourseLongMap() {
      azure.azureEntity.defineMap(this, "CourseLongs");
    }
  }

  public class HumanEvalMap : EntityTypeConfiguration<HumanEval> {
    public HumanEvalMap() {
      azure.azureEntity.defineMap(this, "HumanEvals");
    }
  }
}

