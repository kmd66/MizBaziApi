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
		SELECT DISTINCT TOP 50
			SenderID,
			MAX([Date]) LastDate
		FROM flw.Messages
		WHERE IsRemove = 0 
			AND (ReceiverID = @UserId OR SenderID = @UserId)
		GROUP BY SenderID
		ORDER BY LastDate DESC
    ), 
	mes AS(
		SELECT 
			ROW_NUMBER() OVER (PARTITION BY UserName ORDER BY LastDate DESC) AS rowNumber,
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
	)
	SELECT 
		SenderID,
		ReceiverID,
		[Name], 
		[UserName], 
		img,
		LastDate,
		[Text]
	FROM mes
	WHERE rowNumber = 1
	ORDER BY LastDate DESC

END 
