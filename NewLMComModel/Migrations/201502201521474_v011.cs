namespace NewData.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class v011 : DbMigration
    {
        public override void Up()
        {
            AddColumn("dbo.CourseDatas", "Flags", c => c.Long(nullable: false));
            DropColumn("dbo.CourseDatas", "RowVersion");
        }
        
        public override void Down()
        {
            AddColumn("dbo.CourseDatas", "RowVersion", c => c.Binary(nullable: false, fixedLength: true, timestamp: true, storeType: "rowversion"));
            DropColumn("dbo.CourseDatas", "Flags");
        }
    }
}
