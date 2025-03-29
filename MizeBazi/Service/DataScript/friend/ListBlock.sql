use [MizBazi]
GO
IF  EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'flw.ListBlock') AND type in (N'P', N'PC'))
    DROP PROCEDURE flw.ListBlock
GO

CREATE PROCEDURE flw.ListBlock
	@UserId BIGINT,
	@UserName NVARCHAR(max),
	@Name NVARCHAR(max)
--WITH ENCRYPTION
AS
BEGIN
    SET NOCOUNT ON;
	
	SELECT  TOP 30
		usr.Id UserId,
		frd.[Date],
		usr.UserName,
		usr.FirstName +  ' ' + usr.LastName [Name],
		usx.img
	FROM flw.BlockFriends frd
	INNER JOIN org.Users usr ON usr.Id = frd.User2Id
	INNER JOIN org.UsersExtra usx ON usr.Id = usx.Id 
	WHERE User1Id = @UserId
	AND (@UserName IS NULL OR UserName LIKE @UserName + '%')
	AND (@Name IS NULL OR usr.FirstName LIKE @Name + '%' OR usr.LastName LIKE @Name + '%')
	ORDER BY frd.[Date] DESC

END 
