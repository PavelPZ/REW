namespace NewData.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class v010 : DbMigration
    {
        public override void Up()
        {
            DropIndex("dbo.CourseDatas", new[] { "Key" });
            AlterColumn("dbo.CourseDatas", "Key", c => c.String(nullable: false, maxLength: 240));
            CreateIndex("dbo.CourseDatas", "Key");
        }
        
        public override void Down()
        {
            DropIndex("dbo.CourseDatas", new[] { "Key" });
            AlterColumn("dbo.CourseDatas", "Key", c => c.String(nullable: false, maxLength: 80));
            CreateIndex("dbo.CourseDatas", "Key");
        }
    }
}
