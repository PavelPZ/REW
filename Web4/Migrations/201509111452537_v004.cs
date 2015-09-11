namespace blendedData
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class v004 : DbMigration
    {
        public override void Up()
        {
            AddColumn("dbo.CourseDatas", "Flags", c => c.Long(nullable: false));
        }
        
        public override void Down()
        {
            DropColumn("dbo.CourseDatas", "Flags");
        }
    }
}
