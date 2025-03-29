use [MizBazi]
GO
IF  EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'flw.ListFriend') AND type in (N'P', N'PC'))
    DROP PROCEDURE flw.ListFriend
GO

CREATE PROCEDURE flw.ListFriend
	@UserId BIGINT,
	@UserName NVARCHAR(max),
	@Name NVARCHAR(max)
--WITH ENCRYPTION
AS
BEGIN
    SET NOCOUNT ON;
	
	SELECT TOP 30
		usr.Id UserId,
		frd.[Date],
		usr.UserName,
		usr.FirstName +  ' ' + usr.LastName [Name],
		usx.img
	FROM flw.Friends frd
	INNER JOIN org.Users usr ON usr.Id = frd.User1Id OR usr.Id = frd.User2Id
	INNER JOIN org.UsersExtra usx ON usx.Id =  usr.Id
	WHERE (User1Id = @UserId OR User2Id = @UserId)
	AND usr.Id != @UserId
	AND (@UserName IS NULL OR UserName LIKE @UserName + '%')
	AND (@Name IS NULL OR usr.FirstName LIKE @Name + '%' OR usr.LastName LIKE @Name + '%')
	ORDER BY frd.[Date] DESC

END 
