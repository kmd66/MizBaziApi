using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MizeBazi.Migrations
{
    /// <inheritdoc />
    public partial class org : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.EnsureSchema(
                name: "org");

            migrationBuilder.CreateTable(
                name: "SecurityStamps",
                schema: "org",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Phone = table.Column<string>(type: "varchar(11)", nullable: false),
                    Stamp = table.Column<string>(type: "varchar(5)", nullable: false),
                    Count = table.Column<byte>(type: "tinyint", nullable: false, defaultValue: (byte)0),
                    Date = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValue: new DateTime(2025, 2, 28, 19, 56, 27, 935, DateTimeKind.Local).AddTicks(4802))
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SecurityStamps", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_SecurityStamps_Id",
                schema: "org",
                table: "SecurityStamps",
                column: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "SecurityStamps",
                schema: "org");
        }
    }
}
