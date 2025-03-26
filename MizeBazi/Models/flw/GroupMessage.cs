
namespace MizeBazi.Models;

public record GroupMessageText(long SenderId, DateTime Date, string Text);

public class GroupMessage
{
    public GroupMessage(long groupId, GroupView view)
    {
        View = view;
        GroupId = groupId;
        Texts = new List<GroupMessageText>();
    }

    public long GroupId { get; private set; }

    public GroupView View { get; private set; }

    public GroupMessageText PinText { get; private set; }

    public List<GroupMessageText> Texts { get; private set; }

    public void SetGroupId(long senderId, string text)
    {
        if (!string.IsNullOrEmpty(text) && text.Length <= 110)
        {
            Texts.Add(new GroupMessageText(senderId, DateTime.Now, text));
            if (Texts.Count > 10)
                Texts.RemoveAt(0);
        }
    }
    public void SetPinText(long senderId, string text)
    {
        if (!string.IsNullOrEmpty(text) && text.Length <= 140)
        {
            PinText = new GroupMessageText(senderId, DateTime.Now, text);
        }
    }
}
public class GroupMessageUser
{
    public string ConnectionId { get; private set; }

    public List<long> GroupIds { get; private set; }


    public UserView user { get; private set; }

}
