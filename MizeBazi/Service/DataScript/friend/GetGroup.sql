use [MizBazi]
GO
IF  EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'flw.GetGroup') AND type in (N'P', N'PC'))
    DROP PROCEDURE flw.GetGroup
GO

CREATE PROCEDURE flw.GetGroup
	@Id BIGINT,
    @CreateId NVARCHAR(max),
    @UniqueName NVARCHAR(max)
--WITH ENCRYPTION
AS
BEGIN
    SET NOCOUNT ON;

    SELECT TOP 1
        g.Id,
        g.CreateId,
        u.FirstName + ' ' + u.LastName AS CreateName,
        g.[Name],
        g.[Password],
        g.[Date], 
        g.[IsRemove], 
        g.[Description], 
        g.[UniqueName],
        gm.[Count]
    FROM flw.Groups g
    INNER JOIN org.Users u ON u.Id = g.CreateId
    CROSS APPLY (
        SELECT COUNT(Id) [Count] FROM flw.GroupMembers m
        WHERE m.GroupId = g.Id AND m.blocked = 0
    ) gm
    WHERE g.IsRemove = 0
        AND (@Id = 0 OR g.Id = @Id)
        AND (@CreateId = 0 OR g.CreateId = @CreateId)
        AND (@UniqueName IS NULL OR g.UniqueName = @UniqueName)

END 
