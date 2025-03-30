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
	SELECT TOP 50
		m.SenderID,
		m.ReceiverID,
		m.[Date] LastDate ,
		[Text],
		'' [Name],
		'' [UserName], 
		'' img
	FROM  flw.Messages m
	WHERE IsRemove = 0 
	AND (SenderID = @User1Id OR SenderID = @User2Id)
	AND (ReceiverID = @User1Id OR ReceiverID = @User2Id)
	ORDER BY m.[Date] DESC
END 
