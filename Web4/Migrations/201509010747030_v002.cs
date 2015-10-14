namespace blendedData {
  using System;
  using System.Data.Entity.Migrations;

  public partial class v002 : DbMigration {
    public override void Up() {
      DropColumn("dbo.CourseDatas", "Date");
      DropColumn("dbo.CourseDatas", "Flags");
    }

    public override void Down() {
      AddColumn("dbo.CourseDatas", "Flags", c => c.Long(nullable: false));
      AddColumn("dbo.CourseDatas", "Date", c => c.Long(nullable: false));
    }
  }
}
