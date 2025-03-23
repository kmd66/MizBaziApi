namespace MizeBazi.Models;

public record NotificationVeiw(NotificationType Type, DateTime Date, string CreateName);

public class Notification
{
    public Guid Id { get; set; }
    public Guid RequestId { get; set; }
    public long UserId { get; set; }
    public NotificationType Type { get; set; }
    public bool IsRead { get; set; }
    public DateTime Date { get; set; }
}