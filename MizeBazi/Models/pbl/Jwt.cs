using System.Text;

namespace MizeBazi.Models;

public class Jwt
{
    public Guid Id { get; set; }
    public DateTime Date { get; set; }
    public DateTime Expiry { get; set; }
    public string DeviceId { get; set; }
    public long UserId { get; set; }
}
