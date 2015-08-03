namespace NewData.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class v014 : DbMigration
    {
        public override void Up()
        {
            AddColumn("dbo.CourseDatas", "RowVersion", c => c.Binary(nullable: false, fixedLength: true, timestamp: true, storeType: "rowversion"));
        }
        
        public override void Down()
        {
            DropColumn("dbo.CourseDatas", "RowVersion");
        }
    }
}
