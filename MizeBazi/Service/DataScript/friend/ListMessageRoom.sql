use [MizBazi]
GO
IF  EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'flw.ListMessageRoom') AND type in (N'P', N'PC'))
    DROP PROCEDURE flw.ListMessageRoom
GO

CREATE PROCEDURE flw.ListMessageRoom
	@User1Id BIGINT,
	@User2Id BIGINT
--WITH ENCRYPTION
AS
BEGIN
    SET NOCOUNT ON;
	
	SELECT TOP 30
		m.SenderID,
		u.FirstName + ' ' + u.LastName AS [SenderName], 
		u.UserName AS [SenderUserName], 
		ux.img,
		m.[Date] LastDate ,
		[Text]
	FROM  flw.Messages m --On m.SenderID = lm.SenderID AND m.Date = lm.lastDate
	INNER JOIN org.Users u On u.Id = m.SenderID  
	INNER JOIN org.UsersExtra ux ON ux.Id = u.Id
	WHERE IsRemove = 0 
	AND (SenderID = @User1Id OR SenderID = @User2Id)
	AND (ReceiverID = @User1Id OR ReceiverID = @User2Id)
	ORDER BY m.[Date] DESC

END 
