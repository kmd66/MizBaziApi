delete [org].[Devices]
delete [org].[SecurityStamps]
delete[org].[Tokens]
delete[org].[UsersExtra]
delete [flw].[BlockFriends]
delete [org].[SecurityStamps]
delete [flw].[FriendRequests]
delete [flw].[Friends]
delete [flw].[Notifications]
delete [flw].[Messages]
delete [flw].[GroupMembers]
delete [flw].[Groups]

delete[org].[Users]


	--DROP TABLE org.newDevices;
	--DROP TABLE org.newSecurityStamps;
	--DROP TABLE org.newTokens;
	--DROP TABLE org.newUsers;
	--DROP TABLE org.newUsersExtra;
--INSERT INTO org.Devices
--select * from org.newDevices

--INSERT INTO org.SecurityStamps
--select * from org.newSecurityStamps

--INSERT INTO org.Tokens
--select * from org.newTokens

--SET IDENTITY_INSERT org.Users OFF
--GO
--INSERT INTO org.Users ([Id], [FirstName], [LastName], [Phone], [UserName], [Type], [BirthDate], [Date], [UnicId])
--select * from org.newUsers
--SET IDENTITY_INSERT org.Users ON;
