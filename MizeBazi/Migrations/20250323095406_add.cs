using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MizeBazi.Migrations
{
    /// <inheritdoc />
    public partial class add : Migration
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
                    Date = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETDATE()")
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
                    Date = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETDATE()")
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
                    BirthDate = table.Column<DateTime>(type: "Date", nullable: false),
                    Date = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETDATE()"),
                    UnicId = table.Column<Guid>(type: "uniqueidentifier", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Users", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "UsersExtra",
                schema: "org",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false),
                    Bio = table.Column<string>(type: "nvarchar(140)", maxLength: 140, nullable: true),
                    img = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UsersExtra", x => x.Id);
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

            migrationBuilder.CreateIndex(
                name: "IX_UsersExtra_Id",
                schema: "org",
                table: "UsersExtra",
                column: "Id");
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
                name: "UsersExtra",
                schema: "org");
        }
    }
}
