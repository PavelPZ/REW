namespace NewData.Migrations {
  using System;
  using System.Data.Entity.Migrations;

  public partial class v002 : DbMigration {
    public override void Up() {
      AddColumn("dbo.CompanyDepartments", "MyId", c => c.Int());
      AddColumn("dbo.CompanyDepartments", "ParentId", c => c.Int(nullable: false));
      AddColumn("dbo.LANGMasterScorms", "ApiUrlCrc", c => c.Int(nullable: false));
      DropColumn("dbo.CompanyDepartments", "Created");
    }

    public override void Down() {
      AddColumn("dbo.CompanyDepartments", "Created", c => c.DateTime(nullable: false));
      DropColumn("dbo.LANGMasterScorms", "ApiUrlCrc");
      DropColumn("dbo.CompanyDepartments", "ParentId");
      DropColumn("dbo.CompanyDepartments", "MyId");
    }
  }
}
