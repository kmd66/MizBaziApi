
using Microsoft.EntityFrameworkCore.Metadata.Internal;
using System.Text.RegularExpressions;

namespace MizeBazi.Models;

public record GroupMessageText(string Name, string UserName, string UserImg, DateTime Date, string Text);

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

    public void SetText(UserView user, string text)
    {
        if (!string.IsNullOrEmpty(text))
        {
            if (text.Length > 70)
                text = text.Substring(0,70);
            Texts.Add(
                new GroupMessageText(
                    $"{user.FirstName} {user.LastName}",
                    user.UserName,
                    user.Img,
                    DateTime.Now,
                    text
                )
            );
            if (Texts.Count > 20)
                Texts.RemoveAt(0);
        }
    }

    public void SetPinText(string text)
    {
        if (!string.IsNullOrEmpty(text))
        {
            if (text.Length > 110)
                text = text.Substring(0, 110);
            PinText = new GroupMessageText(
                "-",
                "-",
                "-",
                DateTime.Now, 
                text
                );
        }
    }
}
public class GroupMessageUser
{
    public GroupMessageUser(string connectionId, Guid key, UserView user)
    {
        ConnectionId = connectionId;
        Key = key;
        User = user;
    }
    public string ConnectionId { get; private set; }

    public Guid Key { get; private set; }


    public UserView User { get; private set; }

    public long GroupId { get; set; }
    public List<long> ListGroupId { get; set; }

}
