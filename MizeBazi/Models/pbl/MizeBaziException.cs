using Microsoft.AspNetCore.SignalR;

namespace MizeBazi.Models;

public class MizeBaziException : Exception
{
    public Result result { get; set; }

    public MizeBaziException(int code = -1, string message = "") : base(message)
    {
        result = Result.Failure(code: code, message: message);
    }
    public MizeBaziException(int code = -1, List<string> errors = null) : base("error")
    {

        result = Result.Failure(code: code, errors: errors);

    }
    public static MizeBaziException Error(string message = "Error", int code = -1) => new MizeBaziException(code: code, message: message);
    public static MizeBaziException Error(List<string> errors = null, int code = -1) => new MizeBaziException(code: code, errors: errors);
    public static MizeBaziException BadRequest(string message = "Bad Request") => new MizeBaziException(code: 400, message: message);
}
public class MizeBaziException_Hub : HubException
{
    public Result result { get; set; }

    public MizeBaziException_Hub(int code = -1, string message = "") : base(message)
    {
        result = Result.Failure(code: code, message: message);
    }
    public MizeBaziException_Hub(int code = -1, List<string> errors = null) : base("error")
    {

        result = Result.Failure(code: code, errors: errors);

    }
    public static MizeBaziException Error(string message = "Error", int code = -1) => new MizeBaziException(code: code, message: message);
}