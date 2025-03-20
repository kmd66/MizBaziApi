namespace MizeBazi.Models;

public class Notification
{
    public Guid Id { get; set; }
    public long UserId { get; set; }
    public NotificationType Type { get; set; }
    public bool IsRead { get; set; }
    public DateTime Date { get; set; }
}