using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MizeBazi.Migrations
{
    /// <inheritdoc />
    public partial class creatdb : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<DateTime>(
                name: "Date",
                schema: "org",
                table: "SecurityStamps",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(2025, 2, 28, 20, 10, 3, 928, DateTimeKind.Local).AddTicks(3954),
                oldClrType: typeof(DateTime),
                oldType: "datetime2",
                oldDefaultValue: new DateTime(2025, 2, 28, 19, 56, 27, 935, DateTimeKind.Local).AddTicks(4802));

            migrationBuilder.CreateTable(
                name: "Devices",
                schema: "org",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    DeviceId = table.Column<string>(type: "varchar(32)", nullable: false),
                    Phone = table.Column<string>(type: "varchar(11)", nullable: false),
                    Date = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValue: new DateTime(2025, 2, 28, 20, 10, 3, 928, DateTimeKind.Local).AddTicks(5629))
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Devices", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Tokens",
                schema: "org",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UserId = table.Column<long>(type: "bigint", nullable: false),
                    Hash = table.Column<string>(type: "varchar(32)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Tokens", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Users",
                schema: "org",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    FirstName = table.Column<string>(type: "nvarchar(25)", maxLength: 25, nullable: false),
                    LastName = table.Column<string>(type: "nvarchar(25)", maxLength: 25, nullable: false),
                    Phone = table.Column<string>(type: "varchar(11)", nullable: false),
                    UserName = table.Column<string>(type: "nvarchar(25)", maxLength: 25, nullable: false),
                    Type = table.Column<byte>(type: "tinyint", nullable: false, defaultValue: (byte)1),
                    Date = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValue: new DateTime(2025, 2, 28, 20, 10, 3, 928, DateTimeKind.Local).AddTicks(7470)),
                    UnicId = table.Column<Guid>(type: "uniqueidentifier", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Users", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "UsersThumbnail",
                schema: "org",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    img = table.Column<byte[]>(type: "varbinary(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UsersThumbnail", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Devices_Id",
                schema: "org",
                table: "Devices",
                column: "Id");

            migrationBuilder.CreateIndex(
                name: "IX_Tokens_Id",
                schema: "org",
                table: "Tokens",
                column: "Id");

            migrationBuilder.CreateIndex(
                name: "IX_Users_UnicId",
                schema: "org",
                table: "Users",
                column: "UnicId");

            migrationBuilder.CreateIndex(
                name: "IX_UsersThumbnail_Id",
                schema: "org",
                table: "UsersThumbnail",
                column: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Devices",
                schema: "org");

            migrationBuilder.DropTable(
                name: "Tokens",
                schema: "org");

            migrationBuilder.DropTable(
                name: "Users",
                schema: "org");

            migrationBuilder.DropTable(
                name: "UsersThumbnail",
                schema: "org");

            migrationBuilder.AlterColumn<DateTime>(
                name: "Date",
                schema: "org",
                table: "SecurityStamps",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(2025, 2, 28, 19, 56, 27, 935, DateTimeKind.Local).AddTicks(4802),
                oldClrType: typeof(DateTime),
                oldType: "datetime2",
                oldDefaultValue: new DateTime(2025, 2, 28, 20, 10, 3, 928, DateTimeKind.Local).AddTicks(3954));
        }
    }
}
