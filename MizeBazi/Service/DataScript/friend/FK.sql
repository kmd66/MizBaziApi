
ALTER TABLE [flw].[FriendRequests] ADD CONSTRAINT [FK_FriendRequest_User_SenderID] FOREIGN KEY ([SenderID]) REFERENCES [org].[Users]  ([Id])  ;
ALTER TABLE [flw].[FriendRequests] ADD CONSTRAINT [FK_FriendRequest_User_ReceiverID] FOREIGN KEY ([ReceiverID]) REFERENCES [org].[Users]  ([Id])  ;


ALTER TABLE [flw].[Friends] ADD CONSTRAINT [FK_Friend_User_User1Id] FOREIGN KEY ([User1Id]) REFERENCES [org].[Users]  ([Id])  ;
ALTER TABLE [flw].[Friends] ADD CONSTRAINT [FK_Friend_User_User2Id] FOREIGN KEY ([User2Id]) REFERENCES [org].[Users]  ([Id])  ;

ALTER TABLE [flw].[BlockFriends] ADD CONSTRAINT [FK_BlockFriend_User_User1Id] FOREIGN KEY ([User1Id]) REFERENCES [org].[Users]  ([Id])  ;
ALTER TABLE [flw].[BlockFriends] ADD CONSTRAINT [FK_BlockFriend_User_User2Id] FOREIGN KEY ([User2Id]) REFERENCES [org].[Users]  ([Id])  ;

ALTER TABLE [flw].[Messages] ADD CONSTRAINT [FK_Message_User_SenderID] FOREIGN KEY ([SenderID]) REFERENCES [org].[Users]  ([Id])  ;
ALTER TABLE [flw].[Messages] ADD CONSTRAINT [FK_Message_User_ReceiverID] FOREIGN KEY ([ReceiverID]) REFERENCES [org].[Users]  ([Id])  ;

ALTER TABLE [flw].[Groups] ADD CONSTRAINT [FK_Group_User_CreateId] FOREIGN KEY ([CreateId]) REFERENCES [org].[Users]  ([Id])  ;

ALTER TABLE [flw].[GroupMembers] ADD CONSTRAINT [FK_GroupMember_User_UserId] FOREIGN KEY ([UserId]) REFERENCES [org].[Users]  ([Id])  ;

ALTER TABLE [flw].[Notifications] ADD CONSTRAINT [FK_Notification_User_UserId] FOREIGN KEY ([UserId]) REFERENCES [org].[Users]  ([Id])  ;