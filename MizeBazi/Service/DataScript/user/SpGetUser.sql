use [MizBazi]
GO
IF  EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'org.SpGetUser') AND type in (N'P', N'PC'))
    DROP PROCEDURE org.SpGetUser
GO

CREATE PROCEDURE org.SpGetUser
	@Id BIGINT
--WITH ENCRYPTION
AS
BEGIN
	SELECT TOP 1
		u.Id,
		u.UnicId,
		u.FirstName,
        u.LastName,
        u.UserName,
        u.Phone,
        u.[Type],
        u.[Date],
		u.[BirthDate],
        t.Bio, 
		t.img
	FROM org.Users u
	INNER JOIN org.UsersExtra t
		ON u.Id = t.Id
	WHERE u.Id = @Id

END 
