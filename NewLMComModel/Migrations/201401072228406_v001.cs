namespace NewData.Migrations {
  using System;
  using System.Data.Entity.Migrations;

  public partial class v001 : DbMigration {
    public override void Up() {
      CreateTable(
          "dbo.Companies",
          c => new {
            Id = c.Int(nullable: false, identity: true),
            Title = c.String(nullable: false),
            ScormHost = c.String(maxLength: 64),
            Created = c.DateTime(nullable: false),
          })
          .PrimaryKey(t => t.Id);

      CreateTable(
          "dbo.CompanyDepartments",
          c => new {
            Id = c.Int(nullable: false, identity: true),
            Title = c.String(nullable: false),
            CompanyId = c.Int(nullable: false),
            Created = c.DateTime(nullable: false),
          })
          .PrimaryKey(t => t.Id)
          .ForeignKey("dbo.Companies", t => t.CompanyId, cascadeDelete: true)
          .Index(t => t.CompanyId);

      CreateTable(
          "dbo.CompanyUsers",
          c => new {
            Id = c.Int(nullable: false, identity: true),
            Created = c.DateTime(nullable: false),
            CompanyId = c.Int(nullable: false),
            UserId = c.Long(nullable: false),
            DepartmentId = c.Int(),
            Roles = c.Long(nullable: false),
          })
          .PrimaryKey(t => t.Id)
          .ForeignKey("dbo.Companies", t => t.CompanyId, cascadeDelete: true)
          .ForeignKey("dbo.CompanyDepartments", t => t.DepartmentId)
          .ForeignKey("dbo.Users", t => t.UserId)
          .Index(t => t.CompanyId)
          .Index(t => t.DepartmentId)
          .Index(t => t.UserId);

      CreateTable(
          "dbo.CourseUsers",
          c => new {
            Id = c.Int(nullable: false, identity: true),
            UserId = c.Int(nullable: false),
            Created = c.DateTime(nullable: false),
            ProductId = c.Int(nullable: false),
          })
          .PrimaryKey(t => t.Id)
          .ForeignKey("dbo.CompanyUsers", t => t.UserId, cascadeDelete: true)
          .Index(t => t.UserId);

      CreateTable(
          "dbo.CourseDatas",
          c => new {
            Id = c.Long(nullable: false, identity: true),
            Key = c.String(nullable: false, maxLength: 80),
            Data = c.String(nullable: false),
            ShortData = c.String(),
            CourseUserId = c.Int(nullable: false),
            Date = c.Long(nullable: false),
            RowVersion = c.Binary(nullable: false, fixedLength: true, timestamp: true, storeType: "rowversion"),
          })
          .PrimaryKey(t => t.Id)
          .ForeignKey("dbo.CourseUsers", t => t.CourseUserId, cascadeDelete: true)
          .Index(t => t.CourseUserId);

      CreateTable(
          "dbo.UserLicences",
          c => new {
            LicenceId = c.Int(nullable: false),
            Counter = c.Int(nullable: false),
            UserId = c.Int(nullable: false),
            Created = c.DateTime(nullable: false),
            Started = c.DateTime(nullable: false),
          })
          .PrimaryKey(t => new { t.LicenceId, t.Counter })
          .ForeignKey("dbo.CompanyLicences", t => t.LicenceId, cascadeDelete: true)
          .ForeignKey("dbo.CourseUsers", t => t.UserId)
          .Index(t => t.LicenceId)
          .Index(t => t.UserId);

      CreateTable(
          "dbo.CompanyLicences",
          c => new {
            Id = c.Int(nullable: false, identity: true),
            LastCounter = c.Int(nullable: false),
            Days = c.Short(nullable: false),
            CompanyId = c.Int(nullable: false),
            ProductId = c.Int(nullable: false),
            Created = c.DateTime(nullable: false),
          })
          .PrimaryKey(t => t.Id)
          .ForeignKey("dbo.Companies", t => t.CompanyId, cascadeDelete: true)
          .Index(t => t.CompanyId);

      CreateTable(
          "dbo.UserTestNews",
          c => new {
            Id = c.Int(nullable: false),
            UserId = c.Int(nullable: false),
            Data = c.String(nullable: false),
            Proxy = c.String(nullable: false),
          })
          .PrimaryKey(t => new { t.Id, t.UserId })
          .ForeignKey("dbo.CourseUsers", t => t.UserId, cascadeDelete: true)
          .Index(t => t.UserId);

      CreateTable(
          "dbo.ModuleNews",
          c => new {
            Id = c.Int(nullable: false),
            TestId = c.Int(nullable: false),
            TestUserId = c.Int(nullable: false),
            Data = c.String(nullable: false),
            Proxy = c.String(nullable: false),
          })
          .PrimaryKey(t => new { t.Id, t.TestId, t.TestUserId })
          .ForeignKey("dbo.UserTestNews", t => new { t.TestId, t.TestUserId }, cascadeDelete: true)
          .Index(t => new { t.TestId, t.TestUserId });

      CreateTable(
          "dbo.UserTests",
          c => new {
            Id = c.Int(nullable: false, identity: true),
            CourseUserId = c.Int(nullable: false),
            UserId = c.Int(),
            Level = c.Short(nullable: false),
            CourseId = c.Short(nullable: false),
            Data = c.String(),
            DataBin = c.Binary(),
            Status = c.Short(nullable: false),
            EvaluatorLock = c.String(maxLength: 128),
            Invitated = c.DateTime(),
            ELandUserId = c.Int(),
            LmsOrderItemId = c.Int(),
            CompanyEMail = c.String(),
            Created = c.DateTime(nullable: false),
            InvitationId = c.Guid(),
            TutorId = c.Int(),
            TutorAssigned = c.DateTime(),
            TutorEvaluated = c.DateTime(),
            RepStart = c.DateTime(),
            RepEnd = c.DateTime(),
            RepElapsedSeconds = c.Short(nullable: false),
            RepInterruptions = c.Short(nullable: false),
            RepScoreLevel = c.Short(nullable: false),
            RepScore = c.Short(nullable: false),
            RepAbsScore = c.Short(nullable: false),
            RepAbsLevel = c.Short(nullable: false),
            RepGlobalScore = c.Short(nullable: false),
            RepGlobalScores = c.String(),
            dbTestFileName = c.String(),
            dbTestId = c.Long(),
            Title = c.String(),
            Descr = c.String(),
            ImportID = c.Guid(),
          })
          .PrimaryKey(t => t.Id)
          .ForeignKey("dbo.CourseUsers", t => t.CourseUserId, cascadeDelete: true)
          .Index(t => t.CourseUserId);

      CreateTable(
          "dbo.Modules",
          c => new {
            Id = c.Int(nullable: false, identity: true),
            ProxyData = c.String(),
            Data = c.String(),
            ProxyDataBin = c.Binary(nullable: false),
            DataBin = c.Binary(nullable: false),
            Level = c.Short(nullable: false),
            Status = c.Short(nullable: false),
            RepSkill = c.Short(nullable: false),
            RepScore = c.Short(nullable: false),
            RepElapsedSeconds = c.Short(nullable: false),
            RepAbsLevel = c.Short(nullable: false),
            RepAbsScore = c.Short(nullable: false),
            RepGlobalScore = c.Short(nullable: false),
            UserTestId = c.Int(nullable: false),
          })
          .PrimaryKey(t => t.Id)
          .ForeignKey("dbo.UserTests", t => t.UserTestId, cascadeDelete: true)
          .Index(t => t.UserTestId);

      CreateTable(
          "dbo.Users",
          c => new {
            Id = c.Long(nullable: false, identity: true),
            EMail = c.String(maxLength: 256),
            Password = c.String(maxLength: 32),
            Created = c.DateTime(nullable: false),
            VerifyStatus = c.Short(nullable: false),
            OtherType = c.Short(nullable: false),
            OtherId = c.String(maxLength: 120),
            FirstName = c.String(maxLength: 100),
            LastName = c.String(maxLength: 100),
            Login = c.String(maxLength: 64),
            LoginEMail = c.String(maxLength: 256),
            Roles = c.Long(nullable: false),
          })
          .PrimaryKey(t => t.Id);

      CreateTable(
          "dbo.LANGMasterScorms",
          c => new {
            Id = c.Int(nullable: false, identity: true),
            UserId = c.String(nullable: false, maxLength: 150),
            AttemptId = c.Long(nullable: false),
            AttemptIdStr = c.String(maxLength: 120),
            AttemptIdGuid = c.Guid(),
            Key1Str = c.String(maxLength: 120),
            Key2Str = c.String(maxLength: 120),
            Key1Int = c.Long(nullable: false),
            Key2Int = c.Long(nullable: false),
            Data1 = c.String(),
            Data2 = c.String(),
            Date = c.Long(nullable: false),
            RowVersion = c.Binary(nullable: false, fixedLength: true, timestamp: true, storeType: "rowversion"),
          })
          .PrimaryKey(t => t.Id);

    }

    public override void Down() {
      DropForeignKey("dbo.CompanyUsers", "UserId", "dbo.Users");
      DropForeignKey("dbo.Modules", "UserTestId", "dbo.UserTests");
      DropForeignKey("dbo.UserTests", "CourseUserId", "dbo.CourseUsers");
      DropForeignKey("dbo.ModuleNews", new[] { "TestId", "TestUserId" }, "dbo.UserTestNews");
      DropForeignKey("dbo.UserTestNews", "UserId", "dbo.CourseUsers");
      DropForeignKey("dbo.UserLicences", "UserId", "dbo.CourseUsers");
      DropForeignKey("dbo.UserLicences", "LicenceId", "dbo.CompanyLicences");
      DropForeignKey("dbo.CompanyLicences", "CompanyId", "dbo.Companies");
      DropForeignKey("dbo.CourseDatas", "CourseUserId", "dbo.CourseUsers");
      DropForeignKey("dbo.CourseUsers", "UserId", "dbo.CompanyUsers");
      DropForeignKey("dbo.CompanyUsers", "DepartmentId", "dbo.CompanyDepartments");
      DropForeignKey("dbo.CompanyUsers", "CompanyId", "dbo.Companies");
      DropForeignKey("dbo.CompanyDepartments", "CompanyId", "dbo.Companies");
      DropIndex("dbo.CompanyUsers", new[] { "UserId" });
      DropIndex("dbo.Modules", new[] { "UserTestId" });
      DropIndex("dbo.UserTests", new[] { "CourseUserId" });
      DropIndex("dbo.ModuleNews", new[] { "TestId", "TestUserId" });
      DropIndex("dbo.UserTestNews", new[] { "UserId" });
      DropIndex("dbo.UserLicences", new[] { "UserId" });
      DropIndex("dbo.UserLicences", new[] { "LicenceId" });
      DropIndex("dbo.CompanyLicences", new[] { "CompanyId" });
      DropIndex("dbo.CourseDatas", new[] { "CourseUserId" });
      DropIndex("dbo.CourseUsers", new[] { "UserId" });
      DropIndex("dbo.CompanyUsers", new[] { "DepartmentId" });
      DropIndex("dbo.CompanyUsers", new[] { "CompanyId" });
      DropIndex("dbo.CompanyDepartments", new[] { "CompanyId" });
      DropTable("dbo.LANGMasterScorms");
      DropTable("dbo.Users");
      DropTable("dbo.Modules");
      DropTable("dbo.UserTests");
      DropTable("dbo.ModuleNews");
      DropTable("dbo.UserTestNews");
      DropTable("dbo.CompanyLicences");
      DropTable("dbo.UserLicences");
      DropTable("dbo.CourseDatas");
      DropTable("dbo.CourseUsers");
      DropTable("dbo.CompanyUsers");
      DropTable("dbo.CompanyDepartments");
      DropTable("dbo.Companies");
    }
  }
}
