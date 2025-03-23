use [MizBazi]
GO
IF  EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'flw.ListBlock') AND type in (N'P', N'PC'))
    DROP PROCEDURE flw.ListBlock
GO

CREATE PROCEDURE flw.ListBlock
	@UserId BIGINT,
	@UserName NVARCHAR(max),
	@FirstName NVARCHAR(max),
	@LastName NVARCHAR(max)
--WITH ENCRYPTION
AS
BEGIN
    SET NOCOUNT ON;
	
	;WITH friend AS(
		SELECT User2Id
		FROM flw.BlockFriends
		WHERE User1Id = @UserId
	)
	SELECT 
		usr.Id,
		usr.UnicId,
		usr.FirstName,
		usr.LastName,
		usr.UserName,
		'' Phone,
		usr.[Type],
		usr.[Date],
		usr.[BirthDate],
		usx.img,
		Bio = ''
	FROM friend frd
	INNER JOIN org.Users usr ON usr.Id = frd.User2Id
	INNER JOIN org.UsersExtra usx ON usr.Id = usx.Id 
	WHERE (@FirstName IS NULL OR FirstName = @FirstName)
	AND(@LastName IS NULL OR LastName = @LastName)
	AND(@UserName IS NULL OR UserName = @UserName)

END 
