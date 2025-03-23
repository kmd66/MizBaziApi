using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MizeBazi.Migrations.FlwContextsMigrations
{
    /// <inheritdoc />
    public partial class add : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.EnsureSchema(
                name: "flw");

            migrationBuilder.CreateTable(
                name: "BlockFriends",
                schema: "flw",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    User1Id = table.Column<long>(type: "bigint", nullable: false),
                    User2Id = table.Column<long>(type: "bigint", nullable: false),
                    Date = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETDATE()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BlockFriends", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "FriendRequests",
                schema: "flw",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    SenderID = table.Column<long>(type: "bigint", nullable: false),
                    ReceiverID = table.Column<long>(type: "bigint", nullable: false),
                    Type = table.Column<byte>(type: "tinyint", nullable: false),
                    Date = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETDATE()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FriendRequests", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Friends",
                schema: "flw",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    User1Id = table.Column<long>(type: "bigint", nullable: false),
                    User2Id = table.Column<long>(type: "bigint", nullable: false),
                    Date = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETDATE()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Friends", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Groups",
                schema: "flw",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CreateId = table.Column<long>(type: "bigint", nullable: false),
                    UniqueName = table.Column<string>(type: "nvarchar(25)", maxLength: 25, nullable: true),
                    Name = table.Column<string>(type: "nvarchar(25)", maxLength: 25, nullable: false),
                    Password = table.Column<string>(type: "nvarchar(25)", maxLength: 25, nullable: false, defaultValue: ""),
                    Date = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETDATE()"),
                    IsRemove = table.Column<bool>(type: "bit", nullable: false, defaultValue: false),
                    Description = table.Column<string>(type: "nvarchar(140)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Groups", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Messages",
                schema: "flw",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    SenderID = table.Column<long>(type: "bigint", nullable: false),
                    ReceiverID = table.Column<long>(type: "bigint", nullable: false),
                    IsRemove = table.Column<bool>(type: "bit", nullable: false, defaultValue: false),
                    Date = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETDATE()"),
                    Text = table.Column<string>(type: "nvarchar(140)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Messages", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Notifications",
                schema: "flw",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    RequestId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UserId = table.Column<long>(type: "bigint", nullable: false),
                    Type = table.Column<byte>(type: "tinyint", nullable: false),
                    IsRead = table.Column<bool>(type: "bit", nullable: false, defaultValue: false),
                    Date = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETDATE()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Notifications", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "GroupMembers",
                schema: "flw",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    GroupId = table.Column<long>(type: "bigint", nullable: false),
                    UserId = table.Column<long>(type: "bigint", nullable: false),
                    Date = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETDATE()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_GroupMembers", x => x.Id);
                    table.ForeignKey(
                        name: "FK_GroupMembers_Groups_GroupId",
                        column: x => x.GroupId,
                        principalSchema: "flw",
                        principalTable: "Groups",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_BlockFriends_Id",
                schema: "flw",
                table: "BlockFriends",
                column: "Id");

            migrationBuilder.CreateIndex(
                name: "IX_FriendRequests_Id",
                schema: "flw",
                table: "FriendRequests",
                column: "Id");

            migrationBuilder.CreateIndex(
                name: "IX_Friends_Id",
                schema: "flw",
                table: "Friends",
                column: "Id");

            migrationBuilder.CreateIndex(
                name: "IX_GroupMembers_GroupId",
                schema: "flw",
                table: "GroupMembers",
                column: "GroupId");

            migrationBuilder.CreateIndex(
                name: "IX_GroupMembers_Id",
                schema: "flw",
                table: "GroupMembers",
                column: "Id");

            migrationBuilder.CreateIndex(
                name: "IX_Groups_Id",
                schema: "flw",
                table: "Groups",
                column: "Id");

            migrationBuilder.CreateIndex(
                name: "IX_Messages_Id",
                schema: "flw",
                table: "Messages",
                column: "Id");

            migrationBuilder.CreateIndex(
                name: "IX_Notifications_Id",
                schema: "flw",
                table: "Notifications",
                column: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "BlockFriends",
                schema: "flw");

            migrationBuilder.DropTable(
                name: "FriendRequests",
                schema: "flw");

            migrationBuilder.DropTable(
                name: "Friends",
                schema: "flw");

            migrationBuilder.DropTable(
                name: "GroupMembers",
                schema: "flw");

            migrationBuilder.DropTable(
                name: "Messages",
                schema: "flw");

            migrationBuilder.DropTable(
                name: "Notifications",
                schema: "flw");

            migrationBuilder.DropTable(
                name: "Groups",
                schema: "flw");
        }
    }
}
