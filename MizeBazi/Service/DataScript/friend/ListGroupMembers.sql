use [MizBazi]
GO
IF  EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'flw.ListGroupMembers') AND type in (N'P', N'PC'))
    DROP PROCEDURE flw.ListGroupMembers
GO

CREATE PROCEDURE flw.ListGroupMembers
	@GroupId BIGINT,
	@Blocked BIT,
	@UserName NVARCHAR(max),
	@Name NVARCHAR(max)
--WITH ENCRYPTION
AS
BEGIN
    SET NOCOUNT ON;

	SELECT TOP 14
		m.UserId, 
		m.Date,
		u.UserName,
		u.FirstName + ' ' + u.LastName [Name],
		ux.img
	FROM flw.GroupMembers m
	INNER JOIN org.Users u on u.Id = m.UserId
	INNER JOIN org.UsersExtra ux on ux.Id = u.Id
	WHERE m.GroupId = @GroupId
	AND blocked = @Blocked
	AND (@UserName IS NULL OR u.UserName  LIKE @UserName + '%')
	AND (@Name IS NULL OR u.FirstName  LIKE @Name + '%' OR u.LastName  LIKE @Name + '%')
	ORDER BY m.Date DESC
END 
