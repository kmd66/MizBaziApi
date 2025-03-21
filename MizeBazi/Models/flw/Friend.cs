﻿namespace MizeBazi.Models;

public record RequestEdit(RequestEditType Type, long UserId);

public class Friend
{
    public Guid Id { get; set; }
    public long User1Id { get; set; }
    public long User2Id { get; set; }
    public DateTime Date { get; set; }
}