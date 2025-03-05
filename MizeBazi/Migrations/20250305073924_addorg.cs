using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MizeBazi.Migrations
{
    /// <inheritdoc />
    public partial class addorg : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.EnsureSchema(
                name: "org");

            migrationBuilder.CreateTable(
                name: "Devices",
                schema: "org",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    DeviceId = table.Column<string>(type: "varchar(32)", nullable: false),
                    Phone = table.Column<string>(type: "varchar(11)", nullable: false),
                    Date = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValue: new DateTime(2025, 3, 5, 8, 39, 24, 451, DateTimeKind.Local).AddTicks(3705))
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Devices", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "SecurityStamps",
                schema: "org",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Phone = table.Column<string>(type: "varchar(11)", nullable: false),
                    Stamp = table.Column<string>(type: "varchar(5)", nullable: false),
                    Count = table.Column<byte>(type: "tinyint", nullable: false, defaultValue: (byte)0),
                    Date = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValue: new DateTime(2025, 3, 5, 8, 39, 24, 451, DateTimeKind.Local).AddTicks(2159))
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SecurityStamps", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Tokens",
                schema: "org",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UserId = table.Column<long>(type: "bigint", nullable: false),
                    Hash = table.Column<string>(type: "varchar(32)", nullable: false),
                    IsValid = table.Column<bool>(type: "bit", nullable: false, defaultValue: true)
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
                    FirstName = table.Column<string>(type: "nvarchar(25)", maxLength: 25, nullable: true),
                    LastName = table.Column<string>(type: "nvarchar(25)", maxLength: 25, nullable: true),
                    Phone = table.Column<string>(type: "varchar(11)", nullable: true),
                    UserName = table.Column<string>(type: "nvarchar(25)", maxLength: 25, nullable: true),
                    Type = table.Column<byte>(type: "tinyint", nullable: false, defaultValue: (byte)1),
                    Date = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValue: new DateTime(2025, 3, 5, 8, 39, 24, 451, DateTimeKind.Local).AddTicks(6201)),
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
                    Id = table.Column<long>(type: "bigint", nullable: false),
                    img = table.Column<byte[]>(type: "varbinary(max)", nullable: true)
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
                name: "IX_SecurityStamps_Id",
                schema: "org",
                table: "SecurityStamps",
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
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Devices",
                schema: "org");

            migrationBuilder.DropTable(
                name: "SecurityStamps",
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
        }
    }
}
