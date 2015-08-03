namespace NewData.Migrations {
  using System;
  using System.Data.Entity.Migrations;

  public partial class v003 : DbMigration {
    public override void Up() {
      DropIndex("dbo.ModuleNews", new[] { "TestId", "TestUserId" });
      AlterColumn("dbo.CompanyDepartments", "ParentId", c => c.Int());
      CreateIndex("dbo.CompanyDepartments", "ParentId");
      CreateIndex("dbo.CourseDatas", "Key");
      CreateIndex("dbo.ModuleNews", new[] { "TestId", "TestUserId" });
      CreateIndex("dbo.Users", "EMail");
      CreateIndex("dbo.Users", "OtherId");
      CreateIndex("dbo.LANGMasterScorms", "UserId");
      CreateIndex("dbo.LANGMasterScorms", "AttemptId");
      CreateIndex("dbo.LANGMasterScorms", "AttemptIdStr");
      CreateIndex("dbo.LANGMasterScorms", "AttemptIdGuid");
      CreateIndex("dbo.LANGMasterScorms", "Key1Str");
      CreateIndex("dbo.LANGMasterScorms", "Key2Str");
      CreateIndex("dbo.LANGMasterScorms", "Key1Int");
      CreateIndex("dbo.LANGMasterScorms", "Key2Int");
      AddForeignKey("dbo.CompanyDepartments", "ParentId", "dbo.CompanyDepartments", "Id");
      DropColumn("dbo.CompanyDepartments", "MyId");
    }

    public override void Down() {
      AddColumn("dbo.CompanyDepartments", "MyId", c => c.Short(nullable: false));
      DropForeignKey("dbo.CompanyDepartments", "ParentId", "dbo.CompanyDepartments");
      DropIndex("dbo.LANGMasterScorms", new[] { "Key2Int" });
      DropIndex("dbo.LANGMasterScorms", new[] { "Key1Int" });
      DropIndex("dbo.LANGMasterScorms", new[] { "Key2Str" });
      DropIndex("dbo.LANGMasterScorms", new[] { "Key1Str" });
      DropIndex("dbo.LANGMasterScorms", new[] { "AttemptIdGuid" });
      DropIndex("dbo.LANGMasterScorms", new[] { "AttemptIdStr" });
      DropIndex("dbo.LANGMasterScorms", new[] { "AttemptId" });
      DropIndex("dbo.LANGMasterScorms", new[] { "UserId" });
      DropIndex("dbo.Users", new[] { "OtherId" });
      DropIndex("dbo.Users", new[] { "EMail" });
      DropIndex("dbo.ModuleNews", new[] { "TestId", "TestUserId" });
      DropIndex("dbo.CourseDatas", new[] { "Key" });
      DropIndex("dbo.CompanyDepartments", new[] { "ParentId" });
      AlterColumn("dbo.CompanyDepartments", "ParentId", c => c.Short(nullable: false));
      CreateIndex("dbo.ModuleNews", new[] { "TestId", "TestUserId" });
    }
  }
}
