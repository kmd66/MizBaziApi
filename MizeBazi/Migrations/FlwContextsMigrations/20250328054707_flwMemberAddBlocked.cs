using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MizeBazi.Migrations.FlwContextsMigrations
{
    /// <inheritdoc />
    public partial class flwMemberAddBlocked : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "blocked",
                schema: "flw",
                table: "GroupMembers",
                type: "bit",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "blocked",
                schema: "flw",
                table: "GroupMembers");
        }
    }
}
