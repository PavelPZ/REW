namespace NewData.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class v012 : DbMigration
    {
        public override void Up()
        {
            AddColumn("dbo.CourseUsers", "HumanAssigned", c => c.DateTime(nullable: false));
            AddColumn("dbo.CourseUsers", "HumanCompanyUserId", c => c.Int(nullable: false));
            CreateIndex("dbo.CourseDatas", "Flags");
        }
        
        public override void Down()
        {
            DropIndex("dbo.CourseDatas", new[] { "Flags" });
            DropColumn("dbo.CourseUsers", "HumanCompanyUserId");
            DropColumn("dbo.CourseUsers", "HumanAssigned");
        }
    }
}
