namespace NewData.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class v005 : DbMigration
    {
        public override void Up()
        {
            DropForeignKey("dbo.UserTestNews", "UserId", "dbo.CourseUsers");
            DropForeignKey("dbo.ModuleNews", new[] { "TestId", "TestUserId" }, "dbo.UserTestNews");
            DropForeignKey("dbo.UserTests", "CourseUserId", "dbo.CourseUsers");
            DropForeignKey("dbo.Modules", "UserTestId", "dbo.UserTests");
            DropIndex("dbo.UserTestNews", new[] { "UserId" });
            DropIndex("dbo.ModuleNews", new[] { "TestId", "TestUserId" });
            DropIndex("dbo.UserTests", new[] { "CourseUserId" });
            DropIndex("dbo.Modules", new[] { "UserTestId" });
            AlterColumn("dbo.CourseUsers", "ProductId", c => c.String());
            AlterColumn("dbo.CompanyLicences", "ProductId", c => c.String());
            DropTable("dbo.UserTestNews");
            DropTable("dbo.ModuleNews");
            DropTable("dbo.UserTests");
            DropTable("dbo.Modules");
        }
        
        public override void Down()
        {
            CreateTable(
                "dbo.Modules",
                c => new
                    {
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
                .PrimaryKey(t => t.Id);
            
            CreateTable(
                "dbo.UserTests",
                c => new
                    {
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
                .PrimaryKey(t => t.Id);
            
            CreateTable(
                "dbo.ModuleNews",
                c => new
                    {
                        Id = c.Int(nullable: false),
                        TestId = c.Int(nullable: false),
                        TestUserId = c.Int(nullable: false),
                        Data = c.String(nullable: false),
                        Proxy = c.String(nullable: false),
                    })
                .PrimaryKey(t => new { t.Id, t.TestId, t.TestUserId });
            
            CreateTable(
                "dbo.UserTestNews",
                c => new
                    {
                        Id = c.Int(nullable: false),
                        UserId = c.Int(nullable: false),
                        Data = c.String(nullable: false),
                        Proxy = c.String(nullable: false),
                    })
                .PrimaryKey(t => new { t.Id, t.UserId });
            
            AlterColumn("dbo.CompanyLicences", "ProductId", c => c.Int(nullable: false));
            AlterColumn("dbo.CourseUsers", "ProductId", c => c.Int(nullable: false));
            CreateIndex("dbo.Modules", "UserTestId");
            CreateIndex("dbo.UserTests", "CourseUserId");
            CreateIndex("dbo.ModuleNews", new[] { "TestId", "TestUserId" });
            CreateIndex("dbo.UserTestNews", "UserId");
            AddForeignKey("dbo.Modules", "UserTestId", "dbo.UserTests", "Id", cascadeDelete: true);
            AddForeignKey("dbo.UserTests", "CourseUserId", "dbo.CourseUsers", "Id", cascadeDelete: true);
            AddForeignKey("dbo.ModuleNews", new[] { "TestId", "TestUserId" }, "dbo.UserTestNews", new[] { "Id", "UserId" }, cascadeDelete: true);
            AddForeignKey("dbo.UserTestNews", "UserId", "dbo.CourseUsers", "Id", cascadeDelete: true);
        }
    }
}
