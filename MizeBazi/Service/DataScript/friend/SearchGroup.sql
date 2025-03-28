use [MizBazi]
GO
IF  EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'flw.SearchGroup') AND type in (N'P', N'PC'))
    DROP PROCEDURE flw.SearchGroup
GO

CREATE PROCEDURE flw.SearchGroup
	@Name NVARCHAR(max)
--WITH ENCRYPTION
AS
BEGIN
    SET NOCOUNT ON;
	
	;WITH Groups AS (
        SELECT TOP 14
            g.Id,
            g.CreateId,
            u.FirstName + ' ' + u.LastName AS CreateName,
            g.[Name],
            g.[Password],
            g.[Date], 
            g.[IsRemove], 
            g.[Description], 
            g.[UniqueName]
        FROM flw.Groups g 
        INNER JOIN org.Users u ON u.Id = g.CreateId
        WHERE @Name IS NULL OR g.[Name] LIKE @Name + '%'
        ORDER BY g.Id DESC
    ),
    LatestMessage AS (
        SELECT 
            COUNT(m.Id) [Count],
            m.GroupId 
        FROM  Groups g
        LEFT JOIN flw.GroupMembers m ON m.GroupId = g.Id AND m.blocked = 0
        GROUP BY GroupId
    )
    SELECT g.*, [Count] FROM Groups g
    LEFT JOIN LatestMessage m ON m.GroupId = g.Id
 
END 
