use [MizBazi]
GO
IF  EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'flw.ListGroup') AND type in (N'P', N'PC'))
    DROP PROCEDURE flw.ListGroup
GO

CREATE PROCEDURE flw.ListGroup
	@UserId BIGINT
--WITH ENCRYPTION
AS
BEGIN
    SET NOCOUNT ON;

	;WITH Groups AS (
        SELECT TOP 5
            g.Id,
            g.CreateId,
            u.FirstName + ' ' + u.LastName AS CreateName,
            g.[Name],
            g.[Password],
            g.[Date], 
            g.[IsRemove], 
            g.[Description], 
            g.[UniqueName]
        FROM flw.GroupMembers gm 
        INNER JOIN flw.Groups g ON g.Id = gm.GroupId
        INNER JOIN org.Users u ON u.Id = g.CreateId
        WHERE gm.UserId = @UserId
    ),
    LatestMessage AS (
        SELECT 
            COUNT(m.Id) [Count],
            m.GroupId 
        FROM  Groups g
        LEFT JOIN flw.GroupMembers m ON m.GroupId = g.Id
        GROUP BY GroupId
    )
    SELECT * FROM Groups g
    LEFT JOIN LatestMessage m ON m.GroupId = g.Id

    --SELECT TOP 5
    --    g.Id,
    --    g.CreateId,
    --    u.FirstName + ' ' + u.LastName AS CreateName,
    --    g.[Name],
    --    g.[Password],
    --    g.[Date], 
    --    g.[IsRemove], 
    --    g.[Description], 
    --    g.[UniqueName],
    --    lm.LastText,
    --    lm.LastTextDate
    --FROM flw.GroupMembers gm 
    --INNER JOIN flw.Groups g ON g.Id = gm.GroupId
    --INNER JOIN org.Users u ON u.Id = g.CreateId
    --CROSS APPLY (
    --    SELECT TOP 1 
    --        m.[Text] LastText,
    --        m.[Date] LastTextDate
    --    FROM [flw].[GroupMessages] m
    --    WHERE m.GroupId = g.Id
    --    ORDER BY m.Date DESC
    --) lm
    --WHERE gm.UserId = @UserId

END 
