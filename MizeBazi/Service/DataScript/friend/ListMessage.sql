use [MizBazi]
GO
IF  EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'flw.ListMessage') AND type in (N'P', N'PC'))
    DROP PROCEDURE flw.ListMessage
GO

CREATE PROCEDURE flw.ListMessage
	@UserId BIGINT
--WITH ENCRYPTION
AS
BEGIN
    SET NOCOUNT ON;
	
	;WITH lastMessage AS (
		SELECT TOP 50
			SenderID,
			MAX([Date]) LastDate
		FROM flw.Messages
		WHERE IsRemove = 0 
			AND (ReceiverID = @UserId OR SenderID = @UserId)
		GROUP BY SenderID
		ORDER BY LastDate DESC
    )
	SELECT 
		m.SenderID,
		m.ReceiverID, 
		u.FirstName [Name], 
		u.UserName AS [UserName], 
		ux.img,
		LastDate,
		[Text]
	FROM  lastMessage lm 
	INNER JOIN flw.Messages m On m.SenderID = lm.SenderID AND m.Date = lm.lastDate
	INNER JOIN org.Users u 
		ON u.Id != @UserId 
		AND(u.Id = m.SenderID OR u.Id = m.ReceiverID)
	INNER JOIN org.UsersExtra ux ON ux.Id = u.Id
	ORDER BY LastDate DESC

END 
