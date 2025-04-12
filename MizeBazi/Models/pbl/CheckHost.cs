namespace MizeBazi.Models;
public class CheckHost
{
    public string WebWersion => "1.1.0";
    public string HomePage => "1.1.0";

}

public class DownloadItem
{
    public DownloadItem(string downloadUrl, string baseUrl = null, string version = null, string type = null, string dirName = null) {
        DownloadUrl = downloadUrl;
        DirName = dirName;
        BaseUrl = baseUrl != null ? baseUrl : downloadUrl;
        Version = version != null ? version : "1.1.0";
        Type = type != null ? type : "add";
    }
    public string BaseUrl { get; set; }
    public string DirName { get; set; }
    public string DownloadUrl { get; set; }
    public string Version { get; set; }
    public string Type { get; set; } // add remove delete update

}
