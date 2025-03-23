use [MizBazi]
GO
IF  EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'flw.ListNotification') AND type in (N'P', N'PC'))
    DROP PROCEDURE flw.ListNotification
GO

CREATE PROCEDURE flw.ListNotification
	@UserId BIGINT
--WITH ENCRYPTION
AS
BEGIN
    SET NOCOUNT ON;
	
    DECLARE @TempTable TABLE (
        [Id] UNIQUEIDENTIFIER,
        RequestId UNIQUEIDENTIFIER,
        [Type] TINYINT,
        [Date] DATE
    );

    INSERT INTO @TempTable ([Id], RequestId, [Type], [Date])
    SELECT [Id], RequestId, [Type], [Date]
    FROM [flw].[Notifications]
    WHERE [UserId] = @UserId AND IsRead = 0;
    
    UPDATE [flw].[Notifications]
    SET IsRead = 1
    WHERE [UserId] = @UserId AND IsRead = 0;
    
	;WITH FriendRequest AS(
        SELECT 
            t.[Type],
            t.[Date],
            u.FirstName + ' ' + u.LastName AS CreateName
        FROM @TempTable t
        INNER JOIN [flw].[FriendRequests] f ON f.Id = t.Id
        INNER JOIN org.Users u On u.Id = f.SenderID
	),
    MessageRequest AS(
        SELECT 
            t.[Type],
            t.[Date],
            u.FirstName + ' ' + u.LastName AS CreateName
        FROM @TempTable t
        INNER JOIN [flw].[Messages] m ON m.Id = t.Id
        INNER JOIN org.Users u On u.Id = m.SenderID
	)
    SELECT *FROM FriendRequest
    UNION ALL 
    SELECT * FROM MessageRequest

END 
