
namespace MizeBazi.Models;

public record GroupMessageText(long SenderId, DateTime Date, string Text);

public class GroupMessage
{
    public GroupMessage(long groupId)
    {
        GroupId = groupId;
        Texts = new List<GroupMessageText>();
    }

    public long GroupId { get; private set; }

    public GroupMessageText PinText { get; private set; }

    public List<GroupMessageText> Texts { get; private set; }

    public void SetGroupId(long senderId, string text)
    {
        if (!string.IsNullOrEmpty(text) && text.Length <= 140)
        {
            Texts.Add(new GroupMessageText(senderId, DateTime.Now, text));
            if (Texts.Count > 10)
                Texts.RemoveAt(0);
        }
    }
    public void SetPinText(long senderId, string text)
    {
        if(!string.IsNullOrEmpty(text) && text.Length <= 140)
        {
            PinText = new GroupMessageText(senderId, DateTime.Now, text);
        }
    }
}
