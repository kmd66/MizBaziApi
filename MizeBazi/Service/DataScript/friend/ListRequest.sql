use [MizBazi]
GO
IF  EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'flw.ListRequest') AND type in (N'P', N'PC'))
    DROP PROCEDURE flw.ListRequest
GO

CREATE PROCEDURE flw.ListRequest
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
	FROM flw.FriendRequests frd
	INNER JOIN org.Users usr ON usr.Id = frd.SenderID
	INNER JOIN org.UsersExtra usx ON usx.Id =  usr.Id
	WHERE ReceiverID = @UserId
	AND (@UserName IS NULL OR UserName LIKE @UserName + '%')
	AND (@Name IS NULL OR usr.FirstName LIKE @Name + '%' OR usr.LastName LIKE @Name + '%')
	ORDER BY frd.[Date] DESC

END 

