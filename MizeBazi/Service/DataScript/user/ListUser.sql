use [MizBazi]
GO
IF  EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'org.ListUser') AND type in (N'P', N'PC'))
    DROP PROCEDURE org.ListUser
GO

CREATE PROCEDURE org.ListUser
	@Json NVARCHAR(max),
	@Count INT
--WITH ENCRYPTION
AS
BEGIN
    SET NOCOUNT ON;
	
	;WITH id AS(
		SELECT 
			value v
		FROM OPENJSON(@Json)
	), 
	items AS(
		SELECT 
			u.Id,
			u.UnicId,
			u.FirstName,
		    u.LastName,
		    u.UserName,
		    u.Phone,
		    u.[Type],
		    u.[Date]
		FROM id i
		INNER JOIN  org.Users u ON u.Id = i.v
	)
	SELECT 
		items.*, t.img
	FROM items
	INNER JOIN org.UsersThumbnail t
		ON items.Id = t.Id

END 
