namespace blendedData
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class v001 : DbMigration
    {
        public override void Up()
        {
            CreateTable(
                "dbo.Companies",
                c => new
                    {
                        Id = c.Int(nullable: false, identity: true),
                        Data = c.String(),
                    })
                .PrimaryKey(t => t.Id);
            
            CreateTable(
                "dbo.CourseUsers",
                c => new
                    {
                        LicenceKey = c.String(nullable: false, maxLength: 10),
                        CompanyId = c.Int(nullable: false),
                    })
                .PrimaryKey(t => t.LicenceKey)
                .ForeignKey("dbo.Companies", t => t.CompanyId, cascadeDelete: true)
                .Index(t => t.CompanyId);
            
            CreateTable(
                "dbo.CourseDatas",
                c => new
                    {
                        Id = c.Int(nullable: false, identity: true),
                        TaskId = c.String(nullable: false, maxLength: 240),
                        Key = c.String(nullable: false, maxLength: 240),
                        Data = c.String(nullable: false),
                        ShortData = c.String(),
                        CourseUserId = c.String(nullable: false, maxLength: 10),
                        Date = c.Long(nullable: false),
                        Flags = c.Long(nullable: false),
                    })
                .PrimaryKey(t => t.Id)
                .ForeignKey("dbo.CourseUsers", t => t.CourseUserId, cascadeDelete: true)
                .Index(t => t.TaskId)
                .Index(t => t.Key)
                .Index(t => t.CourseUserId);
            
        }
        
        public override void Down()
        {
            DropForeignKey("dbo.CourseUsers", "CompanyId", "dbo.Companies");
            DropForeignKey("dbo.CourseDatas", "CourseUserId", "dbo.CourseUsers");
            DropIndex("dbo.CourseDatas", new[] { "CourseUserId" });
            DropIndex("dbo.CourseDatas", new[] { "Key" });
            DropIndex("dbo.CourseDatas", new[] { "TaskId" });
            DropIndex("dbo.CourseUsers", new[] { "CompanyId" });
            DropTable("dbo.CourseDatas");
            DropTable("dbo.CourseUsers");
            DropTable("dbo.Companies");
        }
    }
}
