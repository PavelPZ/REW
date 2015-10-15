using System;
using System.Collections.Generic;
using Microsoft.Data.Entity.Migrations;
using Microsoft.Data.Entity.SqlServer.Metadata;

namespace DataLib2.Migrations {
  public partial class vyzvaserv001 : Migration {
    protected override void Up(MigrationBuilder migrationBuilder) {
      migrationBuilder.CreateTable(
          name: "BlendedCompany",
          columns: table => new {
            Id = table.Column<int>(isNullable: false),
            LearningData = table.Column<string>(isNullable: true)
          },
          constraints: table => {
            table.PrimaryKey("PK_BlendedCompany", x => x.Id);
          });
      migrationBuilder.CreateTable(
          name: "BlendedCourseUser",
          columns: table => new {
            Id = table.Column<int>(isNullable: false)
                  .Annotation("SqlServer:ValueGenerationStrategy", SqlServerIdentityStrategy.IdentityColumn),
            CompanyId = table.Column<int>(isNullable: false),
            LMComId = table.Column<long>(isNullable: false),
            ProductUrl = table.Column<string>(isNullable: false)
          },
          constraints: table => {
            table.PrimaryKey("PK_BlendedCourseUser", x => x.Id);
            table.ForeignKey(
                      name: "FK_BlendedCourseUser_BlendedCompany_CompanyId",
                      column: x => x.CompanyId,
                      principalTable: "BlendedCompany",
                      principalColumn: "Id");
          });
      migrationBuilder.CreateTable(
          name: "BlendedCourseData",
          columns: table => new {
            Id = table.Column<int>(isNullable: false)
                  .Annotation("SqlServer:ValueGenerationStrategy", SqlServerIdentityStrategy.IdentityColumn),
            CourseUserId = table.Column<int>(isNullable: false),
            Data = table.Column<string>(isNullable: true),
            Flags = table.Column<long>(isNullable: false),
            Key = table.Column<string>(isNullable: false),
            ShortData = table.Column<string>(isNullable: true),
            TaskId = table.Column<string>(isNullable: true)
          },
          constraints: table => {
            table.PrimaryKey("PK_BlendedCourseData", x => x.Id);
            table.ForeignKey(
                      name: "FK_BlendedCourseData_BlendedCourseUser_CourseUserId",
                      column: x => x.CourseUserId,
                      principalTable: "BlendedCourseUser",
                      principalColumn: "Id");
          });
      migrationBuilder.CreateIndex(
          name: "IX_BlendedCourseData_Key",
          table: "BlendedCourseData",
          column: "Key");
      migrationBuilder.CreateIndex(
          name: "IX_BlendedCourseData_TaskId",
          table: "BlendedCourseData",
          column: "TaskId");
      migrationBuilder.CreateIndex(
          name: "IX_BlendedCourseUser_LMComId",
          table: "BlendedCourseUser",
          column: "LMComId");
      migrationBuilder.CreateIndex(
          name: "IX_BlendedCourseUser_ProductUrl",
          table: "BlendedCourseUser",
          column: "ProductUrl");
    }

    protected override void Down(MigrationBuilder migrationBuilder) {
      migrationBuilder.DropTable("BlendedCourseData");
      migrationBuilder.DropTable("BlendedCourseUser");
      migrationBuilder.DropTable("BlendedCompany");
    }
  }
}
