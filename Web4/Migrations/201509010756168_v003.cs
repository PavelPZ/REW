namespace blendedData {
  using System;
  using System.Data.Entity.Migrations;

  public partial class v003 : DbMigration {
    public override void Up() {
      DropIndex("dbo.CourseDatas", new[] { "TaskId" });
      AlterColumn("dbo.CourseDatas", "TaskId", c => c.String(maxLength: 32));
      AlterColumn("dbo.CourseDatas", "Data", c => c.String());
      CreateIndex("dbo.CourseDatas", "TaskId");
    }

    public override void Down() {
      DropIndex("dbo.CourseDatas", new[] { "TaskId" });
      AlterColumn("dbo.CourseDatas", "Data", c => c.String(nullable: false));
      AlterColumn("dbo.CourseDatas", "TaskId", c => c.String(nullable: false, maxLength: 240));
      CreateIndex("dbo.CourseDatas", "TaskId");
    }
  }
}
