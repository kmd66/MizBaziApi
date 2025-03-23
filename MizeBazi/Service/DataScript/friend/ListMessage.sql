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
		SELECT TOP 10
			SenderID,
			MAX([Date]) LastDate
		FROM flw.Messages
		WHERE IsRemove = 0 AND ReceiverID = @UserId
		GROUP BY SenderID
		ORDER BY LastDate DESC
    )
	SELECT 
		m.[SenderID], 
		u.FirstName + ' ' + u.LastName AS [SenderName], 
		u.UserName AS [SenderUserName], 
		ux.img,
		LastDate,
		[Text]
	FROM  lastMessage lm 
	INNER JOIN flw.Messages m On m.SenderID = lm.SenderID AND m.Date = lm.lastDate
	INNER JOIN org.Users u On u.Id = m.SenderID  
	INNER JOIN org.UsersExtra ux ON ux.Id = u.Id
	WHERE IsRemove = 0 AND ReceiverID = @UserId
	ORDER BY LastDate DESC

END 
