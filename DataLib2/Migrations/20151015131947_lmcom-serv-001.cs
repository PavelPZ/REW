using System;
using System.Collections.Generic;
using Microsoft.Data.Entity.Migrations;
using Microsoft.Data.Entity.SqlServer.Metadata;

namespace DataLib2.Migrations
{
    public partial class lmcomserv001 : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Companies",
                columns: table => new
                {
                    Id = table.Column<int>(isNullable: false)
                        .Annotation("SqlServer:ValueGenerationStrategy", SqlServerIdentityStrategy.IdentityColumn),
                    Created = table.Column<DateTime>(isNullable: false),
                    HumanEvalPaymentConfig = table.Column<string>(isNullable: true),
                    IntervalsConfig = table.Column<string>(isNullable: true),
                    ScormHost = table.Column<string>(isNullable: true),
                    Title = table.Column<string>(isNullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Companies", x => x.Id);
                });
            migrationBuilder.CreateTable(
                name: "LANGMasterScorms",
                columns: table => new
                {
                    Id = table.Column<int>(isNullable: false)
                        .Annotation("SqlServer:ValueGenerationStrategy", SqlServerIdentityStrategy.IdentityColumn),
                    ApiUrlCrc = table.Column<int>(isNullable: false, defaultValue: 0),
                    AttemptId = table.Column<long>(isNullable: false),
                    AttemptIdGuid = table.Column<Guid>(isNullable: true),
                    AttemptIdStr = table.Column<string>(isNullable: true),
                    Data1 = table.Column<string>(isNullable: true),
                    Data2 = table.Column<string>(isNullable: true),
                    Date = table.Column<long>(isNullable: false),
                    Key1Int = table.Column<long>(isNullable: false),
                    Key1Str = table.Column<string>(isNullable: true),
                    Key2Int = table.Column<long>(isNullable: false),
                    Key2Str = table.Column<string>(isNullable: true),
                    UserId = table.Column<string>(isNullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LANGMasterScorms", x => x.Id);
                });
            migrationBuilder.CreateTable(
                name: "CompanyDepartments",
                columns: table => new
                {
                    Id = table.Column<int>(isNullable: false)
                        .Annotation("SqlServer:ValueGenerationStrategy", SqlServerIdentityStrategy.IdentityColumn),
                    CompanyId = table.Column<int>(isNullable: false),
                    ParentId = table.Column<int>(isNullable: true, defaultValue: 0),
                    Title = table.Column<string>(isNullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CompanyDepartments", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CompanyDepartments_Companies_CompanyId",
                        column: x => x.CompanyId,
                        principalTable: "Companies",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_CompanyDepartments_CompanyDepartments_ParentId",
                        column: x => x.ParentId,
                        principalTable: "CompanyDepartments",
                        principalColumn: "Id");
                });
            migrationBuilder.CreateTable(
                name: "CompanyLicences",
                columns: table => new
                {
                    Id = table.Column<int>(isNullable: false)
                        .Annotation("SqlServer:ValueGenerationStrategy", SqlServerIdentityStrategy.IdentityColumn),
                    CompanyId = table.Column<int>(isNullable: false),
                    Created = table.Column<DateTime>(isNullable: false),
                    Days = table.Column<short>(isNullable: false),
                    LastCounter = table.Column<int>(isNullable: false),
                    ProductId = table.Column<string>(isNullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CompanyLicences", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CompanyLicences_Companies_CompanyId",
                        column: x => x.CompanyId,
                        principalTable: "Companies",
                        principalColumn: "Id");
                });
            migrationBuilder.CreateTable(
                name: "Users",
                columns: table => new
                {
                    Id = table.Column<long>(isNullable: false)
                        .Annotation("SqlServer:ValueGenerationStrategy", SqlServerIdentityStrategy.IdentityColumn),
                    Created = table.Column<DateTime>(isNullable: false),
                    EMail = table.Column<string>(isNullable: true),
                    FirstName = table.Column<string>(isNullable: true),
                    LastName = table.Column<string>(isNullable: true),
                    Login = table.Column<string>(isNullable: true),
                    LoginEMail = table.Column<string>(isNullable: true),
                    MyPublisherId = table.Column<int>(isNullable: true),
                    OtherData = table.Column<string>(isNullable: true),
                    OtherId = table.Column<string>(isNullable: true),
                    OtherType = table.Column<short>(isNullable: false),
                    Password = table.Column<string>(isNullable: true),
                    Roles = table.Column<long>(isNullable: false),
                    VerifyStatus = table.Column<short>(isNullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Users", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Users_Companies_MyPublisherId",
                        column: x => x.MyPublisherId,
                        principalTable: "Companies",
                        principalColumn: "Id");
                });
            migrationBuilder.CreateTable(
                name: "CompanyUsers",
                columns: table => new
                {
                    Id = table.Column<int>(isNullable: false)
                        .Annotation("SqlServer:ValueGenerationStrategy", SqlServerIdentityStrategy.IdentityColumn),
                    CompanyId = table.Column<int>(isNullable: false),
                    Created = table.Column<DateTime>(isNullable: false),
                    DepartmentId = table.Column<int>(isNullable: true),
                    RolePar = table.Column<string>(isNullable: true),
                    Roles = table.Column<long>(isNullable: false),
                    UserId = table.Column<long>(isNullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CompanyUsers", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CompanyUsers_Companies_CompanyId",
                        column: x => x.CompanyId,
                        principalTable: "Companies",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_CompanyUsers_CompanyDepartments_DepartmentId",
                        column: x => x.DepartmentId,
                        principalTable: "CompanyDepartments",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_CompanyUsers_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id");
                });
            migrationBuilder.CreateTable(
                name: "CourseUsers",
                columns: table => new
                {
                    Id = table.Column<int>(isNullable: false)
                        .Annotation("SqlServer:ValueGenerationStrategy", SqlServerIdentityStrategy.IdentityColumn),
                    Created = table.Column<DateTime>(isNullable: false),
                    HumanAssigned = table.Column<DateTime>(isNullable: false),
                    HumanCompanyUserId = table.Column<int>(isNullable: false, defaultValue: 0),
                    ProductId = table.Column<string>(isNullable: true),
                    UserId = table.Column<int>(isNullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CourseUsers", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CourseUsers_CompanyUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "CompanyUsers",
                        principalColumn: "Id");
                });
            migrationBuilder.CreateTable(
                name: "CourseDatas",
                columns: table => new
                {
                    Id = table.Column<long>(isNullable: false)
                        .Annotation("SqlServer:ValueGenerationStrategy", SqlServerIdentityStrategy.IdentityColumn),
                    CourseUserId = table.Column<int>(isNullable: false),
                    Data = table.Column<string>(isNullable: false),
                    Date = table.Column<long>(isNullable: false),
                    Flags = table.Column<long>(isNullable: false, defaultValue: 0L),
                    Key = table.Column<string>(isNullable: false),
                    ShortData = table.Column<string>(isNullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CourseDatas", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CourseDatas_CourseUsers_CourseUserId",
                        column: x => x.CourseUserId,
                        principalTable: "CourseUsers",
                        principalColumn: "Id");
                });
            migrationBuilder.CreateTable(
                name: "UserLicences",
                columns: table => new
                {
                    Id = table.Column<int>(isNullable: false)
                        .Annotation("SqlServer:ValueGenerationStrategy", SqlServerIdentityStrategy.IdentityColumn),
                    Counter = table.Column<int>(isNullable: false),
                    Created = table.Column<DateTime>(isNullable: false),
                    LicenceId = table.Column<int>(isNullable: false),
                    Started = table.Column<DateTime>(isNullable: false),
                    UserId = table.Column<int>(isNullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserLicences", x => x.Id);
                    table.ForeignKey(
                        name: "FK_UserLicences_CompanyLicences_LicenceId",
                        column: x => x.LicenceId,
                        principalTable: "CompanyLicences",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_UserLicences_CourseUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "CourseUsers",
                        principalColumn: "Id");
                });
            migrationBuilder.CreateIndex(
                name: "IX_Companies_ScormHost",
                table: "Companies",
                column: "ScormHost");
            migrationBuilder.CreateIndex(
                name: "IX_CourseDatas_Flags",
                table: "CourseDatas",
                column: "Flags");
            migrationBuilder.CreateIndex(
                name: "IX_CourseDatas_Key",
                table: "CourseDatas",
                column: "Key");
            migrationBuilder.CreateIndex(
                name: "IX_CourseUsers_ProductId",
                table: "CourseUsers",
                column: "ProductId");
            migrationBuilder.CreateIndex(
                name: "IX_UserLicences_LicenceId_Counter",
                table: "UserLicences",
                columns: new[] { "LicenceId", "Counter" },
                isUnique: true);
            migrationBuilder.CreateIndex(
                name: "IX_Users_EMail",
                table: "Users",
                column: "EMail");
            migrationBuilder.CreateIndex(
                name: "IX_Users_OtherId",
                table: "Users",
                column: "OtherId");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable("CourseDatas");
            migrationBuilder.DropTable("LANGMasterScorms");
            migrationBuilder.DropTable("UserLicences");
            migrationBuilder.DropTable("CompanyLicences");
            migrationBuilder.DropTable("CourseUsers");
            migrationBuilder.DropTable("CompanyUsers");
            migrationBuilder.DropTable("CompanyDepartments");
            migrationBuilder.DropTable("Users");
            migrationBuilder.DropTable("Companies");
        }
    }
}
