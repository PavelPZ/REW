namespace NewData.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class v009 : DbMigration
    {
        public override void Up()
        {
            AddColumn("dbo.Users", "MyPublisherId", c => c.Int());
            CreateIndex("dbo.Users", "MyPublisherId");
            AddForeignKey("dbo.Users", "MyPublisherId", "dbo.Companies", "Id");
            DropColumn("dbo.Companies", "PublisherId");
        }
        
        public override void Down()
        {
            AddColumn("dbo.Companies", "PublisherId", c => c.String(maxLength: 24));
            DropForeignKey("dbo.Users", "MyPublisherId", "dbo.Companies");
            DropIndex("dbo.Users", new[] { "MyPublisherId" });
            DropColumn("dbo.Users", "MyPublisherId");
        }
    }
}
