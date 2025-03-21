using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MizeBazi.Migrations.FlwContextsMigrations
{
    /// <inheritdoc />
    public partial class flwAdd : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.EnsureSchema(
                name: "flw");

            migrationBuilder.CreateTable(
                name: "User",
                schema: "flw",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    FirstName = table.Column<string>(type: "nvarchar(25)", maxLength: 25, nullable: true),
                    LastName = table.Column<string>(type: "nvarchar(25)", maxLength: 25, nullable: true),
                    Phone = table.Column<string>(type: "varchar(11)", nullable: true),
                    UserName = table.Column<string>(type: "nvarchar(25)", maxLength: 25, nullable: true),
                    Type = table.Column<byte>(type: "tinyint", nullable: false),
                    BirthDate = table.Column<DateTime>(type: "Date", nullable: false),
                    Date = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UnicId = table.Column<Guid>(type: "uniqueidentifier", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_User", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "BlockFriends",
                schema: "flw",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    User1Id = table.Column<long>(type: "bigint", nullable: false),
                    User2Id = table.Column<long>(type: "bigint", nullable: false),
                    Date = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValue: new DateTime(2025, 3, 21, 10, 38, 5, 49, DateTimeKind.Local).AddTicks(860))
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BlockFriends", x => x.Id);
                    table.ForeignKey(
                        name: "FK_BlockFriends_User_User1Id",
                        column: x => x.User1Id,
                        principalSchema: "flw",
                        principalTable: "User",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_BlockFriends_User_User2Id",
                        column: x => x.User2Id,
                        principalSchema: "flw",
                        principalTable: "User",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
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
                    Date = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValue: new DateTime(2025, 3, 21, 10, 38, 5, 45, DateTimeKind.Local).AddTicks(2286))
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FriendRequests", x => x.Id);
                    table.ForeignKey(
                        name: "FK_FriendRequests_User_ReceiverID",
                        column: x => x.ReceiverID,
                        principalSchema: "flw",
                        principalTable: "User",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_FriendRequests_User_SenderID",
                        column: x => x.SenderID,
                        principalSchema: "flw",
                        principalTable: "User",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Friends",
                schema: "flw",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    User1Id = table.Column<long>(type: "bigint", nullable: false),
                    User2Id = table.Column<long>(type: "bigint", nullable: false),
                    Date = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValue: new DateTime(2025, 3, 21, 10, 38, 5, 50, DateTimeKind.Local).AddTicks(5415))
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Friends", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Friends_User_User1Id",
                        column: x => x.User1Id,
                        principalSchema: "flw",
                        principalTable: "User",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Friends_User_User2Id",
                        column: x => x.User2Id,
                        principalSchema: "flw",
                        principalTable: "User",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Groups",
                schema: "flw",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CreateId = table.Column<long>(type: "bigint", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Password = table.Column<string>(type: "nvarchar(max)", nullable: false, defaultValue: ""),
                    Date = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValue: new DateTime(2025, 3, 21, 10, 38, 5, 53, DateTimeKind.Local).AddTicks(6259)),
                    IsRemove = table.Column<bool>(type: "bit", nullable: false, defaultValue: false),
                    Description = table.Column<string>(type: "nvarchar(140)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Groups", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Groups_User_CreateId",
                        column: x => x.CreateId,
                        principalSchema: "flw",
                        principalTable: "User",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
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
                    Date = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValue: new DateTime(2025, 3, 21, 10, 38, 5, 51, DateTimeKind.Local).AddTicks(9921)),
                    Text = table.Column<string>(type: "nvarchar(140)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Messages", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Messages_User_ReceiverID",
                        column: x => x.ReceiverID,
                        principalSchema: "flw",
                        principalTable: "User",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Messages_User_SenderID",
                        column: x => x.SenderID,
                        principalSchema: "flw",
                        principalTable: "User",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Notifications",
                schema: "flw",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UserId = table.Column<long>(type: "bigint", nullable: false),
                    Type = table.Column<byte>(type: "tinyint", nullable: false),
                    IsRead = table.Column<bool>(type: "bit", nullable: false, defaultValue: false),
                    Date = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValue: new DateTime(2025, 3, 21, 10, 38, 5, 57, DateTimeKind.Local).AddTicks(4246))
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Notifications", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Notifications_User_UserId",
                        column: x => x.UserId,
                        principalSchema: "flw",
                        principalTable: "User",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "GroupMembers",
                schema: "flw",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    GroupId = table.Column<long>(type: "bigint", nullable: false),
                    UserId = table.Column<long>(type: "bigint", nullable: false),
                    Date = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValue: new DateTime(2025, 3, 21, 10, 38, 5, 54, DateTimeKind.Local).AddTicks(3168))
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
                    table.ForeignKey(
                        name: "FK_GroupMembers_User_UserId",
                        column: x => x.UserId,
                        principalSchema: "flw",
                        principalTable: "User",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "GroupMessages",
                schema: "flw",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    GroupId = table.Column<long>(type: "bigint", nullable: false),
                    SenderId = table.Column<long>(type: "bigint", nullable: false),
                    IsPin = table.Column<bool>(type: "bit", nullable: false, defaultValue: false),
                    Date = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValue: new DateTime(2025, 3, 21, 10, 38, 5, 55, DateTimeKind.Local).AddTicks(8658)),
                    Text = table.Column<string>(type: "nvarchar(140)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_GroupMessages", x => x.Id);
                    table.ForeignKey(
                        name: "FK_GroupMessages_Groups_GroupId",
                        column: x => x.GroupId,
                        principalSchema: "flw",
                        principalTable: "Groups",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_GroupMessages_User_SenderId",
                        column: x => x.SenderId,
                        principalSchema: "flw",
                        principalTable: "User",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_BlockFriends_Id",
                schema: "flw",
                table: "BlockFriends",
                column: "Id");

            migrationBuilder.CreateIndex(
                name: "IX_BlockFriends_User1Id",
                schema: "flw",
                table: "BlockFriends",
                column: "User1Id");

            migrationBuilder.CreateIndex(
                name: "IX_BlockFriends_User2Id",
                schema: "flw",
                table: "BlockFriends",
                column: "User2Id");

            migrationBuilder.CreateIndex(
                name: "IX_FriendRequests_Id",
                schema: "flw",
                table: "FriendRequests",
                column: "Id");

            migrationBuilder.CreateIndex(
                name: "IX_FriendRequests_ReceiverID",
                schema: "flw",
                table: "FriendRequests",
                column: "ReceiverID");

            migrationBuilder.CreateIndex(
                name: "IX_FriendRequests_SenderID",
                schema: "flw",
                table: "FriendRequests",
                column: "SenderID");

            migrationBuilder.CreateIndex(
                name: "IX_Friends_Id",
                schema: "flw",
                table: "Friends",
                column: "Id");

            migrationBuilder.CreateIndex(
                name: "IX_Friends_User1Id",
                schema: "flw",
                table: "Friends",
                column: "User1Id");

            migrationBuilder.CreateIndex(
                name: "IX_Friends_User2Id",
                schema: "flw",
                table: "Friends",
                column: "User2Id");

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
                name: "IX_GroupMembers_UserId",
                schema: "flw",
                table: "GroupMembers",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_GroupMessages_GroupId",
                schema: "flw",
                table: "GroupMessages",
                column: "GroupId");

            migrationBuilder.CreateIndex(
                name: "IX_GroupMessages_Id",
                schema: "flw",
                table: "GroupMessages",
                column: "Id");

            migrationBuilder.CreateIndex(
                name: "IX_GroupMessages_SenderId",
                schema: "flw",
                table: "GroupMessages",
                column: "SenderId");

            migrationBuilder.CreateIndex(
                name: "IX_Groups_CreateId",
                schema: "flw",
                table: "Groups",
                column: "CreateId");

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
                name: "IX_Messages_ReceiverID",
                schema: "flw",
                table: "Messages",
                column: "ReceiverID");

            migrationBuilder.CreateIndex(
                name: "IX_Messages_SenderID",
                schema: "flw",
                table: "Messages",
                column: "SenderID");

            migrationBuilder.CreateIndex(
                name: "IX_Notifications_Id",
                schema: "flw",
                table: "Notifications",
                column: "Id");

            migrationBuilder.CreateIndex(
                name: "IX_Notifications_UserId",
                schema: "flw",
                table: "Notifications",
                column: "UserId");
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
                name: "GroupMessages",
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

            migrationBuilder.DropTable(
                name: "User",
                schema: "flw");
        }
    }
}
